/*
 * @Author: netstar.sjj
 * @Date: 2019-08-21 10:00:00
 */
NetstarTemplate.templates.processDocBaseLevel2 = (function ($) {
   /****************按钮 回调方法 start******************************* */
   //按钮前置获取参数的方法
   function dialogBeforeHandler(data,templateId){
      var templateConfig = NetstarTemplate.templates.processDocBaseLevel2.data[templateId].config;
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
            case 'blockList':
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
   function detailLeftComponentBtnInit(_config){
      var componentData = _config.detailLeftComponent;
      var btnJson = {
         id:componentData.id + '-btns',
         isShowTitle:false,
         pageId:_config.id,
         package:_config.package+new Date().getTime(),
         btns:[
            {
               text:'添加',
               handler:function(data){
                  var packageName = $(data.event.currentTarget).closest('.pt-components-btn').attr('ns-template-package');
                  var templateConfig = NetstarTemplate.templates.configs[packageName];
                  var businessEditConfig = templateConfig.detailLeftComponent.businessEditConfig;
                  NetstarTemplate.templates.businessDataBase.businessEditConfigClick({template:templateConfig.template,package:packageName,businessEditConfig:businessEditConfig});
               },
            }
         ],
      }
      vueButtonComponent.init(btnJson);
      var existIndex = -1;
      for(var fieldI=0; fieldI<componentData.field.length; fieldI++){
         var fieldData = componentData.field[fieldI];
         var editConfig = fieldData.editConfig ? fieldData.editConfig : {};
         if(editConfig.type == 'business'){  
            existIndex = fieldI;
            break;
         }
      }
      if(existIndex > -1){
         _config.detailLeftComponent.businessEditConfig = componentData.field[existIndex].editConfig;
      }
   }
   /****************模板逻辑方法 end******************************** */
   //设置默认值
   function setDefault(_config){
      var defaultConfig = {
         mode:'horizontal',//横向排列
         tabConfig:{
            components:{},//组件有哪些
            field:'',//哪些keyfield字段要输出显示成tab形式
         },
         detailLeftComponent:{},//横向排列 左侧组件
         detailRigthComponent:{},//横向排列 右侧组件
      };
      NetStarUtils.setDefaultValues(_config,defaultConfig);
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
            case 'blockList':
               NetstarTemplate.commonFunc.blockList.initBlockList(componentData,_config);
               break;
            case 'btns':
               NetstarTemplate.commonFunc.btns.initBtns(componentData,_config);
               break;
         }
      }
      if(_config.mode == 'horizontal'){
         detailLeftComponentBtnInit(_config);
      }
   }
   //追加html
   function appendHtmlByHtmlArray(_htmlArray,$container){
      for(var htmlI=0; htmlI<_htmlArray.length; htmlI++){
         var componentHtml = _htmlArray[htmlI];
         $container.append(componentHtml);
      }
   }
   //初始化输出容器
   function initContainer(_config){
      //容器输出的组成 标题+右上角vo+界面vo+左侧list+右侧tab
      var titleHtml = '';
      if(_config.title){
			//定义了标题输出
			titleHtml = '<div class="pt-main-row processdocbaselevel2-title">'
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

      var detailHtml = '<div class="pt-main-col limsreg-left processdocbaselevel2-left">'
                           +'<div class="pt-template-processdocbaselevel2-detail-left"></div>'
                        +'</div>'
                        +'<div class="pt-main-col limsreg-right processdocbaselevel2-right">'
                           +'<div class="pt-template-processdocbaselevel2-detail-right"></div>'
                        +'</div>';
      var btnClassStr = 'text-right';
      if(_config.mode == 'vertical'){
         //纵向显示
         btnClassStr = '';
         detailHtml = '<div class="pt-main-col">'
                           +'<div class="pt-template-processdocbaselevel2-detail"></div>'
                        +'</div>';
      }
      
		var templateClassStr = '';
		if(_config.plusClass){
			templateClassStr = _config.plusClass;
      }
      var html = '<div class="pt-main processdocbaselevel2 '+templateClassStr+' '+_config.mode+'" id="'+_config.id+'">'
                     +titleHtml
                     +'<div class="pt-main-row">'
                        +'<div class="pt-main-col">'
                           +'<div class="pt-template-processdocbaselevel2-main"></div>'
                        +'</div>'
                     +'</div>'
                     +'<div class="pt-main-row">'
                        +detailHtml
                     +'</div>'
                     +'<div class="pt-main-row">'
                        +'<div class="pt-main-col '+btnClassStr+'">'
                           +'<div class="pt-template-processdocbaselevel2-btns"></div>'
                        +'</div>'
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
      var detailLeftHtmlArray = [];
      var detailRightHtmlArray = [];
      var btnsHtmlArray = [];
      _config.gridHeight = $(window).outerHeight() - $('#netstar-main-page').offset().top - 350;
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
         var componentPlusClassStr = componentData.plusClass ? componentData.plusClass : '';
         var componentHtml = '<div class="pt-panel">'
                                 +'<div class="pt-container">'
                                    +'<div class="pt-panel-row">'
                                       +'<div class="pt-panel-col '+positionClassStr+'">'
                                          +componentTitleHtml
                                          +'<div id="'+componentData.id+'" class="'+componentPlusClassStr+'">'
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
                  if(componentData.parent){
                     if(_config.mode == 'vertical'){
                        componentData.params = {
                           isEditMode:true,
                           isHaveEditDeleteBtn:true,
                           height:parseInt(_config.gridHeight/2),
                        }
                     }
                     if(componentData.parent != 'root'){
                        //详表
                        componentData.isEditMode = true;
                        componentData.isHaveEditDeleteBtn = true;
                        _config.detailRigthComponent = componentData;
                        componentData.componentHeight = 450;
                        componentData.selectMode = 'none';
                        componentData.listDrawHandler = NetstarTemplate.templates.processDocBaseLevel2.listDrawHandler;
                        detailRightHtmlArray.push(componentHtml);
                     }else{
                        //主表
                        componentData.componentHeight = 450;
                        _config.detailLeftComponent = componentData;
                        detailLeftHtmlArray.push(componentHtml);
                     }
                  }
               }else{
                  if(componentData.type == 'btns'){
                     btnsHtmlArray.push(componentHtml);
                  }
               }
            }
         }
      }  
      if(mainHtmlArray.length > 0){
         appendHtmlByHtmlArray(mainHtmlArray,$('#'+_config.id+' .pt-template-processdocbaselevel2-main'));
      }
      if(_config.mode == 'vertical'){
         appendHtmlByHtmlArray(detailLeftHtmlArray,$('#'+_config.id+' .pt-template-processdocbaselevel2-detail'));
         appendHtmlByHtmlArray(detailRightHtmlArray,$('#'+_config.id+' .pt-template-processdocbaselevel2-detail'));
      }else{
         if(detailLeftHtmlArray.length > 0){
            appendHtmlByHtmlArray(detailLeftHtmlArray,$('#'+_config.id+' .pt-template-processdocbaselevel2-detail-left'));
            $('#'+_config.detailLeftComponent.id).after('<div class="pt-components-btn" ns-template-package="'+_config.package+'" id="'+_config.detailLeftComponent.id+'-btns"></div>');
         }
         if(detailRightHtmlArray.length > 0){
            appendHtmlByHtmlArray(detailRightHtmlArray,$('#'+_config.id+' .pt-template-processdocbaselevel2-detail-right'));
         }
      }
      if(btnsHtmlArray.length > 0){
         appendHtmlByHtmlArray(btnsHtmlArray,$('#'+_config.id+' .pt-template-processdocbaselevel2-btns'));
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
         //行选中回调事件
         if(data){
            var packageName = _gridConfig.package;
            var keyField = NetstarTemplate.templates.configs[packageName].detailRigthComponent.keyField;
            var rowsArray = [];
            if($.isArray(data[keyField])){
               rowsArray = data[keyField];
            }
            NetStarGrid.refreshDataById(NetstarTemplate.templates.configs[packageName].detailRigthComponent.id,rowsArray);
         }
      },
      fillValues:function(value,packageName){
         var templateConfig = NetstarTemplate.templates.configs[packageName];
         var detailLeftComponent = templateConfig.detailLeftComponent;
         var detailRigthComponent = templateConfig.detailRigthComponent;
         var leftGridId = detailLeftComponent.id;
         var rightGridId = detailRigthComponent.id;
         var keyField = detailRigthComponent.keyField;
         if(!$.isEmptyObject(value)){
            if($.isArray(value)){
               for(var i=0; i<value.length; i++){
                  NetStarGrid.dataManager.addRow(value[i],leftGridId);
                  if($.isArray(value[i][keyField])){
                     for(var j=0; j<value[i][keyField].length; j++){
                        NetStarGrid.dataManager.addRow(value[i][keyField][j],rightGridId);
                     }
                  }
               }
            }else{
               NetStarGrid.dataManager.addRow(value,leftGridId);
               if($.isArray(value[keyField])){
                  for(var j=0; j<value[keyField].length; j++){
                     NetStarGrid.dataManager.addRow(value[keyField][j],rightGridId);
                  }
               }
            }
         }
      },
      listDrawHandler:function(vueData){
         var gridData = NetStarGrid.dataManager.getData(vueData.$options.id);
         var gridConfig = NetStarGrid.configs[vueData.$options.id].gridConfig;
         var templateConfig = NetstarTemplate.templates.configs[gridConfig.package];
         var keyField = templateConfig.detailRigthComponent.keyField; 
         var detailLeftComponent = templateConfig.detailLeftComponent;
         var selectedData = [];
         var leftGridData = [];
         if(detailLeftComponent.type == 'list'){
            selectedData = NetStarGrid.getSelectedData(detailLeftComponent.id);
            leftGridData = NetStarGrid.configs[detailLeftComponent.id].vueObj.originalRows;
         }else{
            selectedData = NetstarBlockList.getSelectedData(detailLeftComponent.id);
            leftGridData = NetstarBlockList.configs[detailLeftComponent.id].vueObj.originalRows;
         }
         var leftIdField = detailLeftComponent.idField;
         var existIndex = -1;
         for(var i=0; i<leftGridData.length; i++){
            var data = leftGridData[i];
            if(data[leftIdField] ==  selectedData[0][leftIdField]){
               existIndex = i;
            }
         }
         if(existIndex >-1){
            leftGridData[existIndex][keyField] = gridData;
         }
      }
   }
})(jQuery);