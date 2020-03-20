/*
 * @Author: netstar.sjj
 * @Date: 2019-08-08 10:45:00
 * 容器输出的组成 标题+右上角vo+界面vo+左侧list+右侧tab
 * 右上角vo+界面主vo + 界面主按钮
 * 左侧list+左侧按钮+右侧tab+右侧按钮
 */
NetstarTemplate.templates.limsReg = (function ($) {
   /****************按钮 回调方法 start******************************* */
   //按钮前置获取参数的方法
   function dialogBeforeHandler(data,templateId){
      var templateConfig = NetstarTemplate.templates.limsReg.data[templateId].config;
      data.config = templateConfig;
      data.value = getPageData(templateConfig);
      return data;
   }
   //ajax调用之前的回调
   function ajaxBeforeHandler(){

   }
   //ajax执行完成之后的回调
   function ajaxAfterHandler(){

   }
   /****************按钮 回调方法 end******************************** */
   /****************模板逻辑方法 start******************************** */
   //获取界面vo数据
   function getVoData(voId,valid){
      //NetstarComponent.getValues
      return NetstarTemplate.commonFunc.vo.getData(voId,valid);
   }
   //获取界面list数据
   function getListData(listId,valid){
      //NetStarGrid.dataManager.getData
      return NetstarTemplate.commonFunc.list.getData(listId);
   }
   //清空vo数据
   function clearVoData(voIdArr){
      for(var i=0; i<voIdArr.length; i++){
         NetstarTemplate.commonFunc.vo.clearValues(voIdArr[i],false);
         //NetstarComponent.clearValues();
      }
   }
   //清空list数据列表
   function clearListData(listIdArr){
      for(var i=0; i<listIdArr.length; i++){
         //NetStarGrid.refreshDataById(listIdArr[i],[]);
         NetstarTemplate.commonFunc.list.refresh(listId,[]);
      }
   }
   //vo赋值
   function fillValuesByVoId(voId,data){
      //NetstarComponent.fillValues(data,voId);
      NetstarTemplate.commonFunc.vo.fillValues(data,voId);
   }
   //list赋值
   function refreshListByListId(listId,data){
      NetstarTemplate.commonFunc.list.refresh(listId,data);
      //NetStarGrid.refreshDataById(listId,data);
   }
   //获取界面数据
   function getPageData(_config){
      var pageData = {};
      var mainData = getVoData(_config.mainComponent.id,true);
      if(mainData){
         pageData = mainData;  
         switch(_config.detailLeftComponent.type){
            case 'list':
               pageData[_config.detailLeftComponent.keyField] = getListData(_config.detailLeftComponent.id);
               break;
            case 'vo':
               var voData = getVoData(_config.detailLeftComponent.id,true);
               if(voData){
                  for(var valueId in voData){
                     pageData[valueId] = voData[valueId];
                  }
               }
               break;
         }
      }else{
         //验证失败
      }
      return pageData;
   }
   //获取左侧列表数据
   function getDetailLeftListData(_config){
      var gridId = _config.detailLeftComponent.id;
      var selectedData = NetStarGrid.getSelectedData(gridId);
      var returnData = {};
      if($.isArray(selectedData)){
         if(selectedData.length == 1){
            returnData = selectedData[0];
         }
      }
      return returnData;
   }
   //获取tab数据
   function getTabData(voIdArr,listIdArr,tabComponentData){
      var data = {};
      for(var i=0; i<voIdArr.length; i++){
         var voData = getVoData(voIdArr[i],true);
         if(voData){
            for(var voI in voData){
               data[voI] = voData[voI];
            }
         }else{
            data = false;
            break;
         }
      }
      if(data){
         for(var j=0; j<listIdArr.length; j++){
            var listData = getListData(listIdArr[j]);
            if($.isArray(listData)){
               data[tabComponentData[listIdArr[j]].keyField] = listData;
            }
         }
      }
      return data;
   }
   //刷新tab数据
   function tabRefreshByIds(voIdArr,listIdArr,tabComponentData,rowData){
      for(var i=0; i<voIdArr.length; i++){
         fillValuesByVoId(voIdArr[i],rowData);
      }
      for(var j=0; j<listIdArr.length; j++){
         refreshListByListId(listIdArr[j],rowData[tabComponentData[listIdArr[j]].keyField]);
      }
   }
   //给detail中的左侧列表添加数据
   //处理tab数据 增删改方法
   function tabComponentFunc(_config,operatorType,rowData){
      var tabComponentData = _config.tabConfig.components;
      var voIdArr = [];
      var listIdArr = [];
      for(var componentId in tabComponentData){
         switch(tabComponentData[componentId].type){
             case 'vo':
               voIdArr.push(componentId);
               break;
             case 'list':
               listIdArr.push(componentId);
               break;
         }
      }
      switch(operatorType){
         case 'clear':
            clearVoData(voIdArr);
            clearListData(listIdArr);
            break;
         case 'add':
            var data = getTabData(voIdArr,listIdArr,tabComponentData);
            if(data){
               NetStarGrid.addRow(data,_config.detailLeftComponent.id);
               clearVoData(voIdArr);
               clearListData(listIdArr);
            }else{
               nsalert('验证失败','error');
            }
            break;
         case 'save':
            var data = getTabData(voIdArr,listIdArr,tabComponentData);
            if(data){
               NetStarGrid.addRow(data,_config.detailLeftComponent.id);
            }else{
               nsalert('验证失败','error');
            }
            break;
         case 'refresh':
            tabRefreshByIds(voIdArr,listIdArr,tabComponentData,rowData);
            break;
      }
   }
   //给tab赋值
   function fillValuesTabByRowData(data,_gridConfig){
      var templateConfig = NetstarTemplate.templates.configs[_gridConfig.package];
      tabComponentFunc(templateConfig,'refresh',data);
   }
   /****************模板逻辑方法 end******************************** */
   var tabFunc = {
      //新增
      add:function(data){
        var packageName = $(data.event.currentTarget).closest('.pt-tab-btns').attr('ns-template-package');
        var templateConfig = NetstarTemplate.templates.configs[packageName];
        tabComponentFunc(templateConfig,'clear');
      },
      //复制新增
      copyAdd:function(data){
         var packageName = $(data.event.currentTarget).closest('.pt-tab-btns').attr('ns-template-package');
         var templateConfig = NetstarTemplate.templates.configs[packageName];
         tabComponentFunc(templateConfig,'add');
      },
      //保存
      save:function(data){
         var packageName = $(data.event.currentTarget).closest('.pt-tab-btns').attr('ns-template-package');
         var templateConfig = NetstarTemplate.templates.configs[packageName];
         tabComponentFunc(templateConfig,'save');
      },
      //取消
      cancel:function(data){
         var packageName = $(data.event.currentTarget).closest('.pt-tab-btns').attr('ns-template-package');
         var templateConfig = NetstarTemplate.templates.configs[packageName];
         tabComponentFunc(templateConfig,'clear');
      }
   };
   //设置默认值
   function setDefault(_config){
      var defaultConfig = {
         mode:'horizontal',//横向排列
         tabConfig:{
            components:{},//组件有哪些
            field:'',//哪些keyfield字段要输出显示成tab形式
         },
         detailLeftComponent:{},//横向排列 左侧组件
      };
      NetStarUtils.setDefaultValues(_config,defaultConfig);
      _config.tabConfig.btnConfig = {
         id:_config.id+'-btns-'+_config.components.length,
         field:[
            {
               text:'新增',
               handler:tabFunc.add,
               disabled:_config.readonly
            },{
               text:'复制新增',
               handler:tabFunc.copyAdd,
               disabled:_config.readonly
            },{
               text:'确定',
               handler:tabFunc.save,
               disabled:_config.readonly
            },{
               text:'取消',
               handler:tabFunc.cancel,
               disabled:_config.readonly
            }
         ]
      }
   }
   function initTabBtns(_config){
      var id = _config.tabConfig.btnConfig.id;
      var fieldArray = _config.tabConfig.btnConfig.field;
      var btnJson = {
         id:id,
         isShowTitle:false,
         pageId:_config.id,
         btns:fieldArray,
      };
      vueButtonComponent.init(btnJson);
   }
   //切换tab事件
   function initTab(_tabComponent,_config){
      var id = _config.tabConfig.id;
      var $lis = $('#'+id+' ul.pt-tab-list-components-tabs > li');
      function changeTabHandler(ev){
         var $this = $(this);
         var $li = $this.closest('li');
         var id = $this.attr('ns-href-id');
         var $dom = $('#'+id).closest('.pt-tab-content');
         $li.addClass('current');
         $li.siblings().removeClass('current');
         $dom.addClass('current');
         $dom.siblings().removeClass('current')
      }
      $lis.children('a').off('click',changeTabHandler);
      $lis.children('a').on('click',changeTabHandler);
   }
   //组件化分别调用方法
   function initComponentInit(_config){
      for(var componentType in _config.componentsConfig){
         var componentData = _config.componentsConfig[componentType];
         switch(componentType){
            case 'vo':
               NetstarTemplate.commonFunc.vo.initVo(componentData,_config);
               break;
            case 'list':
               NetstarTemplate.commonFunc.list.initList(componentData,_config);
               break;
            case 'btns':
               NetstarTemplate.commonFunc.btns.initBtns(componentData,_config);
               break;
            case 'tab':
               initTab(componentData,_config);
               initTabBtns(_config);
               break;
         }
      }
   }
   //追加html
   function appendHtmlByHtmlArray(_htmlArray,className){
      for(var htmlI=0; htmlI<_htmlArray.length; htmlI++){
         var componentHtml = _htmlArray[htmlI];
         $('.'+className).append(componentHtml);
      }
   }
   //初始化输出容器
   function initContainer(_config){
      //容器输出的组成 标题+右上角vo+界面vo+左侧list+右侧tab
      var titleHtml = '';
      if(_config.title){
			//定义了标题输出
			titleHtml = '<div class="pt-main-row limsreg-title">'
								+'<div class="pt-main-col">'
									+'<div class="pt-panel pt-panel-header">'
										+'<div class="pt-container">'
											+'<div class="pt-panel-row">'
												+'<div class="pt-panel-col">'
													+'<div class="pt-title pt-page-title"><h4>'+_config.title+'</h4></div>'
												+'</div>'
											+'</div>'
										+'</div>'
									+'</div>'
								+'</div>'
							+'</div>';
      }
      
      //标题 一个容器
      //右上角vo+界面vo+btn 在一个容器中
      //左侧list+btn+右侧tab+btn在一个容器中
      var $container = $('container');
		if($container.length > 0){
			$container = $('container:last');
		}

      var detailHtml = '<div class="pt-main-col limsreg-left">'
                           +'<div class="pt-template-limsreg-detail-left"></div>'
                        +'</div>'
                        +'<div class="pt-main-col limsreg-right">'
                           +'<div class="pt-template-limsreg-detail-right"></div>'
                        +'</div>';
      if(_config.mode == 'vertical'){
         //纵向显示
         detailHtml = '<div class="pt-main-col">'
                           +'<div class="pt-template-limsreg-detail"></div>'
                        +'</div>';
      }
      
		var templateClassStr = '';
		if(_config.plusClass){
			templateClassStr = _config.plusClass;
      }
      var html = '<div class="pt-main limsreg '+templateClassStr+' '+_config.mode+'" id="'+_config.id+'">'
                     +titleHtml
                     +'<div class="pt-main-row">'
                        +'<div class="pt-main-col">'
                           +'<div class="pt-template-limsreg-main"></div>'
                        +'</div>'
                     +'</div>'
                     +'<div class="pt-main-row">'
                        +detailHtml
                     +'</div>'
                  +'</div>';
      $container.prepend(html);//输出面板

      //先循环输出找到要输出tab的组件
      var tabComponentI = -1;
      for(var i=0; i<_config.components.length; i++){
         if(_config.components[i].type == 'tab'){
            tabComponentI = i;
            break;
         }
      }
      if(tabComponentI > -1){
         _config.isTab = true;
         _config.tabConfig.field = _config.components[tabComponentI].field;
         _config.tabConfig.id =  _config.components[tabComponentI].id;
      }
      var mainHtmlArray = [];
      var detailHtmlArray = [];
      for(var componentI=0; componentI<_config.components.length; componentI++){
         var componentData = _config.components[componentI];
         _config.componentsConfig[componentData.type][componentData.id] = componentData; //根据组件类型存储信息
         var positionClassStr = '';
         var isMain = false;//是否是主信息
         var isOutTab = false;//是否输出形式是tab
         //根据组件position输出判定是否是主信息
         switch(componentData.position){
            case 'header-right':
               positionClassStr = 'text-right';
               isMain = true;
               break;
            case 'header-body':
               positionClassStr = 'text-body';
               isMain = true;
               _config.idFieldsNames['root.'+componentData.idField] = componentData.idField;//主键id
               _config.mainComponent = componentData;
               break;
         }
         //如果当前类型是btns，根据按钮的operatorObject值来决定输出位置
         switch(componentData.type){
            case 'btns':
               isMain = true;//默认输出位置是主信息
               if(componentData.operatorObject){
                  //如果定义了此值并且没有定义此位置输出是根
                  if(componentData.operatorObject !='root'){
                     isMain = false;
                  }
               }
               break;
         }
         //如果当前有tab参数的定义
         if(_config.tabConfig.field.indexOf(componentData.keyField)>-1){
            isOutTab = true;
         }
         var componentTitleHtml = '';
         if(componentData.title){
            componentTitleHtml = '<div class="pt-components-title">'+componentData.title+'</div>'
         }
         var componentBtnHtml = '';
         if(_config.btnKeyFieldJson[componentData.keyField]){
            componentBtnHtml = '<div class="pt-components-btn" id="'+_config.btnKeyFieldJson[componentData.keyField].id+'"></div>'
         }
         var componentHtml = '<div class="pt-panel">'
                                 +'<div class="pt-container">'
                                    +'<div class="pt-panel-row">'
                                       +'<div class="pt-panel-col '+positionClassStr+'">'
                                          +componentTitleHtml
                                          +'<div id="'+componentData.id+'">'
                                          +'</div>'
                                          +componentBtnHtml
                                        +'</div>'
                                     +'</div>'
                                 +'</div>'
                               +'</div>';
         if(isMain){
            mainHtmlArray.push(componentHtml);
         }else{
            if(isOutTab){
               //tab输出
               _config.tabConfig.components[componentData.id] = componentData;
            }else{
               if(componentData.type != 'tab' && componentData.type != 'btns'){
                  //tab 本身不作为输出
                  _config.idFieldsNames['root.'+componentData.keyField] = componentData.idField;
                  _config.detailLeftComponent = componentData;
                  detailHtmlArray.push(componentHtml);
               }
            }
         }
      }  
      if(mainHtmlArray.length > 0){
         appendHtmlByHtmlArray(mainHtmlArray,'pt-template-limsreg-main');
      }
      if(detailHtmlArray.length > 0){
         var className = 'pt-template-limsreg-detail-left';
         if(_config.mode == 'vertical'){
            className = 'pt-template-limsreg-detail';
         }
         appendHtmlByHtmlArray(detailHtmlArray,className);
      }
      if(!$.isEmptyObject(_config.tabConfig.components)){
         var tabIndex = 0;
         var tabLiHtml = '';
         var tabContentHtml = '';
         for(var tabI in _config.tabConfig.components){
            var componentData = _config.tabConfig.components[tabI];
            var classStr = 'component-'+componentData.type+' pt-nav-item';//class名称
            var activeClassStr = '';
				if(tabIndex == 0){activeClassStr = 'current';}
            tabLiHtml += '<li class="'+classStr+' '+activeClassStr+'" ns-index="'+tabIndex+'">'
                        +'<a href="javascript:void(0);" ns-href-id="'+componentData.id+'">'
                           +componentData.title
                        +'</a>'
                     +'</li>';
            var styleStr = '';
            if(componentData.type == 'vo'){
               styleStr = 'style="height:520px;"';
            }
            tabContentHtml += '<div class="pt-tab-content '+activeClassStr+'">'
                           +'<div class="pt-tab-components" id="'+componentData.id+'" '+styleStr+'></div>'
                        +'</div>';
            tabIndex++;
         }
         var tabHtml = '<div class="pt-panel">'
                           +'<div class="pt-container">'
                              +'<div class="pt-panel-row">'
                                 +'<div class="pt-panel-col">'
                                    +'<div class="pt-tab-components-tabs pt-tab" id="'+_config.tabConfig.id+'">'
                                       +'<div class="pt-container">'
                                          +'<div class="pt-tab-header">'
                                             +'<div class="pt-nav">'
                                                +'<ul class="pt-tab-list-components-tabs">'
                                                   +tabLiHtml
                                                +'</ul>'
                                             +'</div>'
                                          +'</div>'
                                          +'<div class="pt-tab-body">'
                                             +tabContentHtml
                                          +'</div>'
                                       +'</div>'
                                    +'</div>'
                                    +'<div class="pt-tab-btns" id="'+_config.tabConfig.btnConfig.id+'" ns-template-package="'+_config.package+'"></div>'
                                 +'</div>'
                              +'</div>'
                           +'</div>'
                        +'</div>';
        appendHtmlByHtmlArray([tabHtml],'pt-template-limsreg-detail-right');
      }
   }
   function init(_config) {
      //如果开启了debugerMode
      var isValid = true;
      if(debugerMode){
         //验证配置参数是否合法
         isValid = NetstarTemplate.commonFunc.validateByConfig(_config);
      }
      if(!isValid){
         nsalert('配置文件验证失败', 'error');
         console.error('配置文件验证失败');
         console.error(_config);
         return false;
      }
      NetstarTemplate.commonFunc.setTemplateParamsByConfig(_config);//存储模板配置参数
      NetstarTemplate.commonFunc.setDefault(_config);//设置默认值参数
      setDefault(_config);
      initContainer(_config);//初始化输出容器面板
      initComponentInit(_config);//组件化分别调用
   }
   //根据配置刷新模板数据
   function refreshByConfig(_config){

   }
   return {
      init: init,
      dialogBeforeHandler:dialogBeforeHandler,
      ajaxBeforeHandler:ajaxBeforeHandler,
      ajaxAfterHandler:ajaxAfterHandler,
      refreshByConfig:refreshByConfig,
      getPageData:getPageData,
      VERSION: '0.0.1',						//版本号
      gridSelectedHandler:function(data,$data,_vueData,_gridConfig){
         fillValuesTabByRowData(data,_gridConfig);
      }
   }
})(jQuery);