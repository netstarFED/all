/*
 * @Author: netstar.sjj
 * @Date: 2019-08-21 10:00:00
 * lastDate:2020-01-14 12:00:00
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
   function ajaxBeforeHandler(handlerObj,templateId){
      return handlerObj;
   }
   //ajax执行完成之后的回调
   function ajaxAfterHandler(data,templateId,ajaxPlusData){
      var templateConfig = {};
      if(templateId){
         templateConfig = NetstarTemplate.templates.processDocBaseLevel2.data[templateId].config;
      }else{
         if(NetstarUI.labelpageVm.labelPagesArr[NetstarUI.labelpageVm.currentTab]){
            var packageName = NetstarUI.labelpageVm.labelPagesArr[1].config.package;
            templateConfig = NetstarTemplate.templates.configs[packageName];
         }
      }

      if(typeof(ajaxPlusData)=='undefined'){
         ajaxPlusData = {};
      }

      if(ajaxPlusData.isCloseWindow === true){
         //如果按钮上配置了关闭当前界面直接执行关闭操作
         NetstarUI.labelpageVm.removeCurrent();
      }else{
         if(!$.isArray(data)){
            //返回值是对象 可以根据返回状态去处理界面逻辑
            switch(data.objectState){
               case NSSAVEDATAFLAG.DELETE:
                  //删除
                  templateConfig.serverData = {};
                  clearByAll(templateConfig);
                  break;
               case NSSAVEDATAFLAG.EDIT:
                  //修改
                  templateConfig.serverData = nsServerTools.setObjectStateData(data);//改变服务端数据值，删除ojbectState为-1的数据
                  NetStarUtils.deleteAllObjectState(templateConfig.serverData);//删除objectState状态值
                  templateConfig.pageData = NetStarUtils.deepCopy(templateConfig.serverData);
                  initComponentByFillValues(templateConfig);
                  break;
               case NSSAVEDATAFLAG.ADD:
                  //新增
                  templateConfig.serverData = {};
                  clearByAll(templateConfig);
                  break;
               case NSSAVEDATAFLAG.VIEW:
                  //刷新
                  templateConfig.serverData = nsServerTools.setObjectStateData(data);//改变服务端数据值，删除ojbectState为-1的数据
                  NetStarUtils.deleteAllObjectState(templateConfig.serverData);//删除objectState状态值
                  templateConfig.pageData = NetStarUtils.deepCopy(templateConfig.serverData);
                  initComponentByFillValues(templateConfig);
                  break;
            }
         }else{
            //返回值是数组 没法根据objectState去处理逻辑
         }
      }
   }
   /****************按钮 回调方法 end******************************* */
   function fillValuesByVoId(voId,data){
      NetstarTemplate.commonFunc.vo.fillValues(data,voId);
   }
   function selectedHandlerByMainBlockGrid(data,$data,_vueData,_gridConfig){
      //行选中回调事件
      if(data){
         data['NETSTAR-TIMER'] = moment().format('x');
         var packageName = _gridConfig.package;
         var keyField = NetstarTemplate.templates.configs[packageName].level2GridComponent.keyField;
         var rowsArray = [];
         if($.isArray(data[keyField])){
            rowsArray = data[keyField];
         }
         NetStarGrid.refreshDataById(NetstarTemplate.templates.configs[packageName].level2GridComponent.id,rowsArray);
      }
   }
   function drawHandlerByMainBlockGrid(vueData){
      var gridConfig = NetstarBlockList.configs[vueData.$options.id].gridConfig;
      var templateConfig = NetstarTemplate.templates.configs[gridConfig.package];
      var keyField = templateConfig.level2GridComponent.keyField; 
      var detailLeftComponent = templateConfig.mainComponent;
      var selectedData = NetstarBlockList.getSelectedData(detailLeftComponent.id);
      var leftGridData = NetstarBlockList.configs[detailLeftComponent.id].vueObj.originalRows;
      var leftGridRows = NetstarBlockList.configs[detailLeftComponent.id].vueObj.rows;
      if(!$.isArray(leftGridData)){leftGridData = [];}
      if(leftGridData.length == 0){
         NetStarGrid.refreshDataById(templateConfig.level2GridComponent.id,[]);
      }else{
         var existIndex = -1;
         /***lyw20200313 */
         for(var i=0; i<leftGridRows.length; i++){
            var data = leftGridRows[i];
            if(data.netstarSelectedFlag){
               existIndex = i;
               break;
            }
         }
         /***lyw20200313 */
         // for(var i=0; i<leftGridData.length; i++){
         //    var data = leftGridData[i];
         //    if(data['NETSTAR-TIMER'] ==  selectedData[0]['NETSTAR-TIMER']){
         //       existIndex = i;
         //       break;
         //    }
         // }
         if(existIndex >-1){
            //刷新右侧数据
            if($.isArray(leftGridData[existIndex][keyField])){
               NetStarGrid.refreshDataById(templateConfig.level2GridComponent.id,leftGridData[existIndex][keyField]);
            }
         }
      }
   }
   function drawHandlerByLevel2listGrid(vueData){
      var gridData = NetStarGrid.dataManager.getData(vueData.$options.id);
      var gridConfig = NetStarGrid.configs[vueData.$options.id].gridConfig;
      var templateConfig = NetstarTemplate.templates.configs[gridConfig.package];
      var keyField = templateConfig.level2GridComponent.keyField; 
      var detailLeftComponent = templateConfig.mainComponent;
      var selectedData = NetstarBlockList.getSelectedData(detailLeftComponent.id);
      var leftGridData = NetstarBlockList.configs[detailLeftComponent.id].vueObj.originalRows;
      var leftGridRows = NetstarBlockList.configs[detailLeftComponent.id].vueObj.rows;
      var existIndex = -1;
      /***lyw20200313 */
      for(var i=0; i<leftGridRows.length; i++){
         var data = leftGridRows[i];
         if(data.netstarSelectedFlag){
            existIndex = i;
            break;
         }
      }
      /***lyw20200313 */
      // for(var i=0; i<leftGridData.length; i++){
      //    var data = leftGridData[i];
      //    if(data['NETSTAR-TIMER'] ==  selectedData[0]['NETSTAR-TIMER']){
      //       existIndex = i;
      //    }
      // }
      if(existIndex >-1){
         leftGridData[existIndex][keyField] = gridData;
         if(templateConfig.pageExpression){
            var levelByPageExpression = NetstarTemplate.getLevelByPageExpression(templateConfig);
            var fieldKey = '';
            var relativeFieldKey = '';
            var type = '';
            for(var keyI in levelByPageExpression[0]){
               fieldKey = keyI;
               relativeFieldKey = levelByPageExpression[0][keyI].fieldKey;
               type = levelByPageExpression[0][keyI].type;
            }
            if(type == 'sum'){
               var sumNumber = 0;
               var rightKeyField = templateConfig.level2GridComponent.keyField;
               for(var s=0; s<leftGridData.length; s++){
                  if(typeof(leftGridData[s][relativeFieldKey])=='number'){
                     sumNumber += leftGridData[s][relativeFieldKey];
                  }else if($.isArray(leftGridData[s][rightKeyField])){
                     for(var d=0; d<leftGridData[s][rightKeyField].length; d++){
                        if(typeof(leftGridData[s][rightKeyField][d][relativeFieldKey])=='number'){
                           sumNumber += leftGridData[s][rightKeyField][d][relativeFieldKey];
                        }
                     }
                  }
               }
               var jsonData = {};
               jsonData[fieldKey] = sumNumber;
               fillValuesByVoId(templateConfig.mainVoComponent.id,jsonData);
            }
         }
      }
   }
   function blockComponentBtnInit(_config){
      var componentData = _config.mainComponent;
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
         _config.mainComponent.businessEditConfig = componentData.field[existIndex].editConfig;
         if($('#'+componentData.id+'-btns').length > 0){
            $('#'+componentData.id+'-btns').remove();
         }
         $('#'+_config.mainComponent.id).before('<div class="pt-panel"><div class="pt-components-btn" ns-template-package="'+_config.package+'" id="'+_config.mainComponent.id+'-btns"></div></div>');
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
                     var businessEditConfig = templateConfig.mainComponent.businessEditConfig;
                     NetstarTemplate.templates.businessDataBase.businessEditConfigClick({template:templateConfig.template,package:packageName,businessEditConfig:businessEditConfig});
                  },
               }
            ],
         }
         vueButtonComponent.init(btnJson);
      }else{
         if(!$.isEmptyObject(componentData.params)){
            if(componentData.params.editMode == 'inlineDialog'){
               if($('#'+componentData.id+'-btns').length > 0){
                  $('#'+componentData.id+'-btns').remove();
               }
               $('#'+_config.mainComponent.id).before('<div class="pt-panel"><div class="pt-components-btn" ns-template-package="'+_config.package+'" id="'+_config.mainComponent.id+'-btns"></div></div>');
               
               function dialogCommon(_templateConfig,valueData){
                  var detailLeftComponent = _templateConfig.mainComponent;
                  var fieldArray = $.extend(true,[],detailLeftComponent.field);
                  NetstarTemplate.setFieldHide('form',fieldArray,detailLeftComponent.hide);
                  valueData = typeof(valueData)=='object' ? valueData : {};
                  var formFieldArray = [];
                  for(var fieldI=0; fieldI<fieldArray.length; fieldI++){
                     var fieldJson = fieldArray[fieldI].editConfig;
                     fieldJson.id = fieldArray[fieldI].field;
                     fieldJson.hidden = fieldArray[fieldI].hidden;
                     fieldJson.formSource = 'form';
                     formFieldArray.push(fieldJson);
                  }
                  var objectState = 1;//默认是新增
                  if(!$.isEmptyObject(valueData)){
                     objectState = 2;//修改
                  }
                  var dialogJson = {
                     id:'dialogCommon',//typeof(obj.config.dialogId) == 'undefined'?'dialogCommon':obj.config.dialogId,
                     title: '编辑弹框',
                     templateName:'PC',
                     width:600,
                     height:450,
                     shownHandler:function(data){
                        var formConfig = {
                           id: data.config.bodyId,
                           templateName: 'form',
                           componentTemplateName: 'PC',
                           defaultComponentWidth:'50%',
                           form:formFieldArray,
                           isSetMore:false,
                           completeHandler:function(data){},
                           getPageDataFunc : (function(valueData){
                              return function(){
                                 return valueData;
                              }
                           })(valueData)
                        };
                        NetstarComponent.formComponent.show(formConfig, valueData); 
                        var btnJson = {
                           id:data.config.footerIdGroup,
                           btns:[
                              {
                                 text:'确认',
                                 handler:function(){
                                    var jsonData = NetstarComponent.getValues('dialog-dialogCommon-body');
                                    jsonData['NETSTAR-TIMER'] = moment().format('x');
                                    if(objectState == 1){
                                       NetStarGrid.addRow(jsonData,detailLeftComponent.id);
                                    }else{
                                       //修改的操作
                                       var originalRows = NetstarBlockList.configs[detailLeftComponent.id].vueObj.originalRows;
                                       if(!$.isArray(originalRows)){
                                          originalRows = [];
                                       }
                                       for(var i=0; i<originalRows.length; i++){
                                          if(originalRows[i]['NETSTAR-TIMER'] == valueData['NETSTAR-TIMER']){
                                             $.each(jsonData,function(key,value){
                                                originalRows[i][key] = value;
                                             })
                                             break;
                                          }
                                       }
                                       var rows = NetStarGrid.dataManager.getRows(originalRows,NetstarBlockList.configs[detailLeftComponent.id].gridConfig);
                                       NetstarBlockList.configs[detailLeftComponent.id].vueObj.rows = rows;
                                    }
                                    NetstarComponent.dialog['dialogCommon'].vueConfig.close();
                                    setTimeout(function(){
                                       if(_templateConfig.levelExpression){
                                          var levelByPageExpression = _templateConfig.levelExpression;
                                          var fieldKey = '';
                                          var relativeFieldKey = '';
                                          var type = '';
                                          for(var keyI in levelByPageExpression[0]){
                                             fieldKey = keyI;
                                             relativeFieldKey = levelByPageExpression[0][keyI].fieldKey;
                                             type = levelByPageExpression[0][keyI].type;
                                          }
                                          if(type == 'sum'){
                                             var sumNumber = 0;
                                             var leftGridData = NetstarBlockList.configs[detailLeftComponent.id].vueObj.originalRows;
                                             if(!$.isArray(leftGridData)){
                                                leftGridData = [];
                                             }
                                             for(var s=0; s<leftGridData.length; s++){
                                                if(typeof(leftGridData[s][relativeFieldKey])=='number'){
                                                   sumNumber += leftGridData[s][relativeFieldKey];
                                                }
                                             }
                                             var jsonData = {};
                                             jsonData[fieldKey] = sumNumber;
                                             fillValuesByVoId(_templateConfig.mainComponent.id,jsonData);
                                          }
                                       }
                                    },0)
                                 }
                              },{
                                 text:'关闭',
                                 handler:function(){
                                    NetstarComponent.dialog['dialogCommon'].vueConfig.close();
                                 }
                              }
                           ]
                        };
                        vueButtonComponent.init(btnJson);
                     }
                  };
                  NetstarComponent.dialogComponent.init(dialogJson);
               }
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
                           dialogCommon(templateConfig,{},'add');
                        },
                     },{
                        text:'编辑',
                        handler:function(data){
                           var packageName = $(data.event.currentTarget).closest('.pt-components-btn').attr('ns-template-package');
                           var templateConfig = NetstarTemplate.templates.configs[packageName];
                           var valueJson = {};
                           var gridSelectedData = NetstarBlockList.getSelectedData(templateConfig.mainComponent.id);
                           if($.isArray(gridSelectedData)){
                              if(gridSelectedData.length == 1){
                                 valueJson = gridSelectedData[0];
                              }
                           }
                           if($.isEmptyObject(valueJson)){
                              nsalert('请选中要编辑的值','warning');
                           }else{
                              dialogCommon(templateConfig,valueJson,'edit');
                           }
                        },
                     }
                  ],
               }
               vueButtonComponent.init(btnJson);
            }
         }
      }
   }
   function selectedHandlerByMainListGrid(data,$data,_vueData,_gridConfig){
      
   }
   function drawHandlerByMainListGrid(vueData){
      var gId = vueData.$options.id;
      var gridConfig = NetStarGrid.configs[gId].gridConfig;
      var templateConfig = NetstarTemplate.templates.configs[gridConfig.package];
      var selectedDataArr = NetStarGrid.getSelectedData(gId);
      var level2GridComponent = templateConfig.level2GridComponent;
      if(selectedDataArr.length == 1){
         var selectedData = selectedDataArr[0];
         var level2GridKeyfield = level2GridComponent.keyField;
         if($.isArray(selectedData[level2GridKeyfield])){
            NetStarGrid.refreshDataById(level2GridComponent.id,selectedData[level2GridKeyfield]);
         }
         /*var ajaxConfig = $.extend(true,{},level2GridComponent.ajax);
         ajaxConfig.data = typeof(ajaxConfig.data)=='object' ? ajaxConfig.data : {};
         if($.isEmptyObject(ajaxConfig.data)){
            ajaxConfig.data = selectedData;
         }else{
            ajaxConfig.data = NetStarUtils.getFormatParameterJSON(ajaxConfig.data,selectedData);
         }
         ajaxConfig.plusData = {
            gridId:level2GridComponent.id,
         };
         NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
            if(res.success){  
               var resData = res[ajaxOptions.dataSrc];
               if(!$.isArray(resData)){resData = [];}
               NetStarGrid.refreshDataById(ajaxOptions.plusData.gridId,resData);
            }
         },true)*/
      }else{
         NetStarGrid.refreshDataById(level2GridComponent.id,[]);
      }
   }
   function delHandlerByMainListGrid(data,gridId){

   }
   function drawHandlerByVLevel2listGrid(vueData){
      var gId = vueData.$options.id;
      var gridConfig = NetStarGrid.configs[gId].gridConfig;
      var templateConfig = NetstarTemplate.templates.configs[gridConfig.package];
      var keyField = templateConfig.level2GridComponent.keyField; 
      var mainComponent = templateConfig.mainComponent;
      var selectedData = NetStarGrid.getSelectedData(mainComponent.id);
      if(selectedData.length == 1){
         var leftGridData = NetStarGrid.configs[mainComponent.id].vueObj.originalRows;
         var existIndex = -1;
         for(var i=0; i<leftGridData.length; i++){
            var data = leftGridData[i];
            if(data[mainComponent.idField] ==  selectedData[0][mainComponent.idField]){
               existIndex = i;
            }
         }
         if(existIndex >-1){
            var gridData = NetStarGrid.dataManager.getData(gId);
            leftGridData[existIndex][keyField] = gridData;
         }
      }
   }
   function initComponentInit(_config){
      for(var componentType in _config.componentsConfig){
         var componentData = _config.componentsConfig[componentType];
         switch(componentType){
            case 'vo':
               NetstarTemplate.commonFunc.vo.initVo(componentData,_config);
               break;
            case 'list':
               //NetstarTemplate.commonFunc.list.initList(componentData,_config);
               break;
            case 'blockList':
               //NetstarTemplate.commonFunc.blockList.initBlockList(componentData,_config);
               break;
            case 'voList':
               for(var voListId in componentData){
                  var voListComponent = componentData[voListId];
                  voListComponent.defaultComponentWidth = _config.defaultComponentWidth;
               }
               NetstarTemplate.commonFunc.voList.init(componentData,_config);
               break;
            case 'btns':
               NetstarTemplate.commonFunc.btns.initBtns(componentData,_config);
               break;
         }
      }
      if(_config.mode == 'horizontal'){
        blockComponentBtnInit(_config);
      }
      //先输出vo,根据vo的高度去计算list应该显示的高度 进行list的初始化操作
      setTimeout(function(){
         var commonVoHeight = $('#'+_config.id+' .pt-list-collection').outerHeight();
         //屏幕高度-标签高度-按钮高度-右侧vo的高度-上下padding的边距-tab的高度-vo的高度
         var gridHeight = $(window).outerHeight() - 35 - 34 - 30 - 60 - commonVoHeight - _config.voByRightHeight;
         switch(_config.mode){
            case 'horizontal':
               var hGright = gridHeight-34;
               var pageLengthNum = Math.floor((hGright/29));
               var blockParams = {
                  isPage:false,
                  pageLengthDefault:pageLengthNum,//
                  minPageLength:pageLengthNum,//
                  isHaveEditDeleteBtn:true,//允许删除
                  isAllowAdd:false,//允许添加
                  isEditMode: true, //编辑模式
                  isShowHead:true,
                  height:hGright,
                  selectedHandler:selectedHandlerByMainBlockGrid,
                  drawHandler:drawHandlerByMainBlockGrid,
               };
               NetStarUtils.setDefaultValues(_config.componentsConfig.blockList[_config.mainComponent.id].params,blockParams);
               var listParams = {
                  isPage:false,
                  pageLengthDefault:pageLengthNum,//
                  minPageLength:pageLengthNum,//
                  isHaveEditDeleteBtn:true,//允许删除
                  isAllowAdd:true,//允许添加
                  isEditMode: true, //编辑模式
                  isShowHead:true,
                  height:hGright,
                  selectedHandler:function(){},
                  drawHandler:drawHandlerByLevel2listGrid,
               };
               NetStarUtils.setDefaultValues(_config.componentsConfig.list[_config.level2GridComponent.id].params,listParams);
               NetstarTemplate.commonFunc.list.initList(_config.componentsConfig.list,_config);
               NetstarTemplate.commonFunc.blockList.initBlockList(_config.componentsConfig.blockList,_config);
               break;
            case 'vertical':
               var pageLengthNum = Math.floor((gridHeight/2/29));
               var mainListParams = {
                  isPage:false,
                  pageLengthDefault:pageLengthNum,//
                  minPageLength:pageLengthNum,//
                  isHaveEditDeleteBtn:true,//允许删除
                  isAllowAdd:true,//允许添加
                  isEditMode: true, //编辑模式
                  isShowHead:true,
                  height:Math.floor(gridHeight/2),
                  selectedHandler:selectedHandlerByMainListGrid,
                  drawHandler:drawHandlerByMainListGrid,
                  delHandler:delHandlerByMainListGrid,
                  //defaultSelectedIndex:null
               };
               var level2ListParams = {
                  isPage:false,
                  pageLengthDefault:pageLengthNum,//
                  minPageLength:pageLengthNum,//
                  isHaveEditDeleteBtn:true,//允许删除
                  isAllowAdd:false,//允许添加
                  isEditMode: true, //编辑模式
                  isShowHead:true,
                  height:hGright,
                  selectedHandler:function(){},
                  drawHandler:drawHandlerByVLevel2listGrid,
                  //defaultSelectedIndex:null
               };
               NetStarUtils.setDefaultValues(_config.componentsConfig.list[_config.mainComponent.id].params,mainListParams);
               NetStarUtils.setDefaultValues(_config.componentsConfig.list[_config.level2GridComponent.id].params,level2ListParams);
               NetstarTemplate.commonFunc.list.initList(_config.componentsConfig.list,_config);
               break;
         }
      },10)
   }
   function initContainer(_config){
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
      //输出vo
      var voHtml = '';
      var voRightHtml = '';
      var defaultComponentWidth = '';
      var componentBtnHtmlByMain = '';
      if(_config.mainBtnArray.length > 0){
         var mainBtnId;//当前按钮操作整体的容器的id
         if(_config.btnKeyFieldJson.root){
            mainBtnId = _config.btnKeyFieldJson.root.id;
         }
         componentBtnHtmlByMain = '<div class="pt-panel">'
                                       +'<div class="pt-container">'
                                          +'<div class="pt-panel-row">'
                                          +'<div class="pt-panel-col">'
                                             +'<div id="'+mainBtnId+'" class="main-btns pt-components-btn" operatorobject="root"></div>'
                                          +'</div>'
                                          +'</div>'
                                       +'</div>'
                                    +'</div>';
      }
      var componentsArr = _config.components;
      for(var componentI=0; componentI<componentsArr.length; componentI++){
         var componentData = componentsArr[componentI];
         var componentTitleStr = componentData.title ? componentData.title : '';
         var componentClassStr = 'pt-components-'+componentData.type;
         var componentDisplayMode = componentData.type;
         var componentKeyField = componentData.keyField ? componentData.keyField : 'root';
			var parentField = componentData.parent ? componentData.parent : 'root';
         if(componentData.params.displayMode == 'voList'){
            componentDisplayMode = componentData.params.displayMode; 
            if(componentI != 0){
               if(componentsArr[componentI-1].defaultComponentWidth){
                  defaultComponentWidth = componentsArr[componentI-1].defaultComponentWidth;
               }
            }
         }
         var positionStr = '';
         switch(componentData.position){
            case 'header-right':
               positionStr = 'text-right';
               break;
         }
         switch(componentDisplayMode){
            case 'vo':
            case 'voList':
               var voTitleHtml = '';
               if(componentTitleStr){
                  voTitleHtml = '<div class="vo-title">'+componentTitleStr+'</div>';
               }
               var displayModeAttr = componentDisplayMode.toLocaleLowerCase();
               if(positionStr == 'text-right'){
                  voRightHtml += '<div class="pt-panel">'
                                       +'<div class="pt-container">'
                                          +'<div class="pt-panel-row">'
                                          +'<div class="pt-panel-col '+positionStr+'">'
                                             +voTitleHtml
                                             +'<div id="'+componentData.id+'" class="'+componentClassStr+'" pt-displaymode="'+displayModeAttr+'"></div>'
                                          +'</div>'
                                          +'</div>'
                                       +'</div>'
                                    +'</div>';
               }else{
                  if($.isEmptyObject(_config.mainVoComponent)){
                     _config.mainVoComponent = componentData;
                  }
                  voHtml += '<div id="'+componentData.id+'" class="'+componentClassStr+'" pt-displaymode="'+displayModeAttr+'"></div>';
               }
               break;
            case 'blockList':
            case 'list':
               if(parentField == 'root'){
                  _config.mainComponent = componentData;
               }else{
                  _config.level2GridComponent = componentData;
               }
               break;
         }
      }
      if(voHtml){
         voHtml = '<div class="pt-panel">'
                     +'<div class="pt-container">'
                        +'<div class="pt-panel-row">'
                        +'<div class="pt-panel-col pt-list-collection">'
                           +voHtml
                        +'</div>'
                        +'</div>'
                     +'</div>'
                  +'</div>';
      }
      var html = '';
      if(voRightHtml){
         _config.voByRightHeight = 46;
      }

      _config.defaultComponentWidth = defaultComponentWidth;
      var templateClassStr = '';
		if(_config.plusClass){
			templateClassStr = _config.plusClass;
      }
      switch(_config.mode){
         case 'horizontal':
            //左边块状表格 右侧list表格
            html = '<div class="pt-main processdocbaselevel2 '+templateClassStr+' '+_config.mode+'" id="'+_config.id+'">'
                        +titleHtml
                        +'<div class="pt-main-row">'
                           +'<div class="pt-main-col">'
                              +componentBtnHtmlByMain
                              +voRightHtml
                              +voHtml
                           +'</div>'
                        +'</div>'
                        +'<div class="pt-main-row">'
                           +'<div class="pt-main-col limsreg-left processdocbaselevel2-left">'
                              +'<div class="pt-panel">'
                                 +'<div class="pt-container">'
                                    +'<div class="pt-panel-row">'
                                       +'<div class="pt-panel-col">'
                                          +'<div id="'+_config.mainComponent.id+'" class="pt-components-blocklist" pt-displaymode="blocklist"></div>'
                                       +'</div>'
                                    +'</div>'
                                 +'</div>'
                              +'</div>'
                           +'</div>'
                           +'<div class="pt-main-col limsreg-right processdocbaselevel2-right">'
                              +'<div class="pt-panel">'
                                 +'<div class="pt-container" style="padding-top:34px">'
                                    // +'<div class="pt-panel-row">'
                                       // +'<div class="pt-panel-col" style="padding-top:34px">'
                                          +'<div id="'+_config.level2GridComponent.id+'" class="pt-components-list" pt-displaymode="list"></div>'
                                       // +'</div>'
                                    // +'</div>' // lyw注释，表格宽度超出屏幕
                                 +'</div>'
                              +'</div>'
                           +'</div>'
                        +'</div>'
                     +'</div>';
            break;
         case 'vertical':
            //上下两个list
            html = '<div class="pt-main processdocbaselevel2 '+templateClassStr+' '+_config.mode+'" id="'+_config.id+'">'
                        +titleHtml
                        +'<div class="pt-main-row">'
                           +'<div class="pt-main-col">'
                              +componentBtnHtmlByMain
                              +voRightHtml
                              +voHtml
                           +'</div>'
                        +'</div>'
                        +'<div class="pt-main-row">'
                           +'<div class="pt-main-col">'
                              +'<div class="pt-panel">'
                                 +'<div class="pt-container">'
                                   // +'<div class="pt-panel-row">'
                                       //+'<div class="pt-panel-col">'
                                          +'<div id="'+_config.mainComponent.id+'" class="pt-components-list" pt-displaymode="list"></div>'
                                       //+'</div>'
                                   // +'</div>'
                                 +'</div>'
                              +'</div>'
                              +'<div class="pt-panel">'
                                 +'<div class="pt-container">'
                                    //+'<div class="pt-panel-row">'
                                       //+'<div class="pt-panel-col">'
                                          +'<div id="'+_config.level2GridComponent.id+'" class="pt-components-list" pt-displaymode="list"></div>'
                                       //+'</div>'
                                   // +'</div>'
                                 +'</div>'
                              +'</div>'
                           +'</div>'
                        +'</div>'
                     +'</div>';
            break;
      }
      $container.prepend(html);//输出面板
   }
   //设置默认值
   function setDefault(_config){
      var defaultConfig = {
         mode:'horizontal',//横向排列  vertical纵向排列
         level2GridComponent:{},//横向排列 右侧组件
         serverData:{},
         pageData:{},
         defaultComponentWidth:'25%',
         voByRightHeight:0,
      };
      NetStarUtils.setDefaultValues(_config,defaultConfig);
   }
   //初始化执行
   function init(_config){
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
      setDefault(_config);//设置默认值
      NetstarTemplate.commonFunc.setComponentDataByConfig(_config);
      initContainer(_config);//输出容器结构
      if(!$.isEmptyObject(_config.getValueAjax)){
         //当前界面存在此定义则先请求根据返回值去初始化各个组件调用
         var getValueAjaxConfig = $.extend(true,{},_config.getValueAjax);
         if(!$.isEmptyObject(_config.pageParam)){
            if(!$.isEmptyObject(getValueAjaxConfig.data)){
               getValueAjaxConfig.data = NetStarUtils.getFormatParameterJSON(getValueAjaxConfig.data,_config.pageParam);
            }else{
               getValueAjaxConfig.data = _config.pageParam;
            }
         }
         getValueAjaxConfig.plusData = {
            packageName:_config.package,
            templateId:_config.id
         };
         NetStarUtils.ajax(getValueAjaxConfig,function(res,ajaxPlusData){
            if(res.success){
               var resData = res[ajaxPlusData.dataSrc] ? res[ajaxPlusData.dataSrc] : {};
               NetStarUtils.deleteAllObjectState(resData);//删除服务端返回的数据状态
               var templateConfig = NetstarTemplate.templates.configs[ajaxPlusData.plusData.packageName];
               templateConfig.serverData = resData;//服务端返回的原始数据
               templateConfig.pageData = NetStarUtils.deepCopy(resData);//克隆服务端返回的原始数据
               initComponentInit(templateConfig);//组件化分别调用
            }else{
               nsalert('返回值false','error');
            }
         },true);
      }else{
         initComponentInit(_config);
      }
   }
   function refreshByConfig(){

   }
   function getListData(listId,valid){
      return NetstarTemplate.commonFunc.list.getData(listId);
   }
   function getVoData(voId,valid){
      return NetstarTemplate.commonFunc.vo.getData(voId,valid);
   }
   function getDataByComponents(_config,isValid){
      var data = {};
      for(var componentType in _config.componentsConfig){
         if(data === false){
            break;
         }
         var componentsData = _config.componentsConfig[componentType];
         switch(componentType){
            case 'vo':
               for(var idI in componentsData){
                  var vKeyField = componentsData[idI].keyField ? componentsData[idI].keyField : 'root';
                  var voData = getVoData(componentsData[idI].id,isValid);
                  if(voData === false){
                     data = false;
                     break;
                  }
                  if(vKeyField != 'root'){
                     data[vKeyField] = voData;
                  }else{
                     $.each(voData,function(key,value){
                        data[key] = value;
                     });
                  }
               }
               break;
            case 'list':
            case 'blockList':
               for(var idI in componentsData){
                  var gridData = getListData(componentsData[idI].id,isValid);
                 // if(gridData == false){
                    // data = false;
                     //break;
                  //}
                  var parentField = componentsData[idI].parent ? componentsData[idI].parent : 'root';
                  var gridKeyField = componentsData[idI].keyField;
                  if(parentField == 'root'){
                     data[gridKeyField] = gridData;
                  }else{
                     //data[parentField][gridKeyField] = gridData;
                  }
               }
               break;
            case 'voList':
               for(var idI in componentsData){
                  var vKeyField = componentsData[idI].keyField ? componentsData[idI].keyField : 'root';
                  var idField = componentsData[idI].idField;
                  var voData = getVoData(componentsData[idI].id,isValid);
                  if(voData === false){
                     data = false;
                     break;
                  }
                  var voListData = _config.pageData[vKeyField];
                  var componentIndexArr = NetstarComponent.form[componentsData[idI].id].config.componentIndexArr;
                  if(!$.isArray(componentIndexArr)){
                     componentIndexArr = [];
                  }
                  for(var d=0; d<voListData.length; d++){
                     for(var valueI=0; valueI<componentIndexArr.length; valueI++){
                        var valueStr = componentIndexArr[valueI];
                        if(valueStr.indexOf('-')>-1){
                           var valueIds = valueStr.split('-');
                           if(voListData[d][idField] == valueIds[1]){
                              voListData[d][valueIds[0]] = voData[valueStr];
                           }
                        }
                     }
                  }
                  data[vKeyField] = voListData;
               }
               break;
         }
      }
      return data;
   }
   function getPageData(_config,isValid,isSetObjectState){
      /**
       * _config object 当前配置项 某些条件下存在不传配置项传值为包名的情况（具体条件暂不清楚）
       * isValid 是否验证 默认true验证
       * isSetObjectState 是否需要比较设置状态值 默认true
      */
      isValid = typeof(isValid)=='boolean' ? isValid : true;
      isSetObjectState = typeof(isSetObjectState)=='boolean' ? isSetObjectState : true;
      if(typeof(_config)=='string'){
         _config = NetstarTemplate.templates.configs[_config];
      }
      var pageData = getDataByComponents(_config,isValid);
      if(pageData === false){
         return false;
      }
      var returnData = pageData;
      if(isSetObjectState){
         returnData = nsServerTools.getObjectStateData(_config.serverData, pageData,_config.idFieldsNames);
      }
      NetstarTemplate.commonFunc.setSendParamsByPageParamsData(returnData,_config);
      return returnData;
   }
   function clearByAll(_config){
      for(var componentType in _config.componentsConfig){
         var componentData = _config.componentsConfig[componentType];
         switch(componentType){
            case 'vo':
            case 'voList':
               for(var voId in componentData){
                  NetstarTemplate.commonFunc.vo.clearValues(componentData[voId].id,false);
               }
               break;
            case 'list':
               for(var listId in componentData){
                  NetStarGrid.refreshDataById(componentData[listId].id,[]);
               }
               break;
            case 'blockList':
                  for(var idI in componentData){
                     NetstarBlockList.refreshDataById(componentData[idI].id,[]);
                  }
                  break;
         }
      }
   }
   function initComponentByFillValues(_config,_value){
      _value = typeof(_value)=='object' ? _value : {};
      var fillValuesData = _config.serverData;
      if(!$.isEmptyObject(_value)){
         fillValuesData = _value;
      }
      if($.isEmptyObject(fillValuesData)){
         nsalert('无返回值','warning');
         return;
      }
      for(var componentType in _config.componentsConfig){
         var componentData = _config.componentsConfig[componentType];
         switch(componentType){
            case 'vo':
               for(var voId in componentData){
                  var voConfig = componentData[voId];
                  var keyField = voConfig.keyField ? voConfig.keyField : 'root';
                  var fillValuesVoData = fillValuesData;
                  if(keyField != 'root'){
                     fillValuesVoData = fillValuesData[keyField];
                  }
                  fillValuesByVoId(voConfig.id,fillValuesVoData);
               }
               break;
            case 'list':
               for(var listId in componentData){
                  var listConfig = componentData[listId];
                  var _data = fillValuesData[listConfig.keyField];
                  var parentField = listConfig.parent;
                  if(parentField != "root"){
                     if(typeof(fillValuesData[parentField]) == "object"){
                        if($.isArray(fillValuesData[parentField])){
                           var currentIndex = 0;
                           var detailLeftComponent = _config.mainComponent;
                           var leftGridData = NetstarBlockList.configs[detailLeftComponent.id].vueObj.rows;
                           for(var i=0; i<leftGridData.length; i++){
                              var _leftGridData = leftGridData[i];
                              if(_leftGridData.netstarSelectedFlag){
                                 currentIndex = i;
                                 break;
                              }
                           }
                           _data = fillValuesData[parentField][currentIndex] ? fillValuesData[parentField][currentIndex][listConfig.keyField] : [];
                        }else{
                           _data = fillValuesData[parentField][listConfig.keyField];
                        }
                     }
                  }
                  if(!$.isArray(_data)){_data = [];}
                  NetStarGrid.refreshDataById(listConfig.id,_data);
               }
               break;
            case 'blockList':
               for(var blockListId in componentData){
                  var blockListConfig = componentData[blockListId];
                  var _data = fillValuesData[blockListConfig.keyField];
                  if(!$.isArray(_data)){_data = [];}
                  NetstarBlockList.refreshDataById(blockListConfig.id,_data);
               }
               break;
            case 'voList':
               for(var voListId in componentData){
                  var voListComponent = componentData[voListId];
                  voListComponent.defaultComponentWidth = _config.defaultComponentWidth;
                  _config.serverData[voListComponent.keyField] = fillValuesData[voListComponent.keyField];
               }
               NetstarTemplate.commonFunc.voList.init(componentData,_config);
               break;
         }
      }
   }
   return {
      init:init,
      dialogBeforeHandler:dialogBeforeHandler,
      ajaxBeforeHandler:ajaxBeforeHandler,
      ajaxAfterHandler:ajaxAfterHandler,
      refreshByConfig:refreshByConfig,
      getPageData:getPageData,
      clearByAll:clearByAll,
      initComponentByFillValues:initComponentByFillValues,
      addValues:function(value,tempalteConfig,controllObj){
         var keyField = controllObj.targetField ? controllObj.targetField : 'root';
         var isRoot = true;
         if(keyField != 'root'){
            isRoot = false;
         }
         if(isRoot){
            nsServerTools.setObjectStateData(value);//改变服务端数据值，删除ojbectState为-1的数据
            NetStarUtils.deleteAllObjectState(value);//删除objectState状态值
            tempalteConfig.serverData = {};
            tempalteConfig.pageData = value;
            //整体添加值
            clearByAll(tempalteConfig);
            initComponentByFillValues(tempalteConfig,value);
         }else{
            //局部添加值
            var currentAddvalueComponent = {};
            for(var c=0; c<tempalteConfig.components.length; c++){
               var componentData = tempalteConfig.components[c];
               if(componentData.keyField == keyField){
                  currentAddvalueComponent = componentData;
                  break;
               }
            }
            if(!$.isEmptyObject(currentAddvalueComponent)){
               switch(currentAddvalueComponent.type){
                  case 'list':
                  case 'blockList':
                     NetStarGrid.addRow(value,currentAddvalueComponent.id);
                     break;
                  case 'voList':
                     break;
               }
            }
         }
      },
      fillValues:function(value,packageName){
         var templateConfig = NetstarTemplate.templates.configs[packageName];
         switch(templateConfig.mode){
            case 'vertical':
               break;
            case 'horizontal':
               var detailLeftComponent = templateConfig.mainComponent;
               var detailRigthComponent = templateConfig.level2GridComponent;
               var leftGridId = detailLeftComponent.id;
               var rightGridId = detailRigthComponent.id;
               var keyField = detailRigthComponent.keyField;
               var leftGridAddPosition = detailRigthComponent.addRowPosition == "end" ?  'end' : 'start';
               if(!$.isEmptyObject(value)){
                  // 删除左侧块状表格选中标识 lyw start
                  var leftGridRows = NetstarBlockList.configs[leftGridId].vueObj.rows;
                  var leftGridOriginalRows = NetstarBlockList.configs[leftGridId].vueObj.originalRows;
                  var currentSelected = 0;
                  for(var i=0; i<leftGridRows.length; i++){
                     currentSelected = i;
                     delete leftGridRows[i].netstarSelectedFlag;
                     delete leftGridOriginalRows[i].netstarSelectedFlag;
                  }
                  // 删除左侧块状表格选中标识 lyw end
                  if(!$.isArray(value)){
                     value = [value];
                  }
                  for(var i=0; i<value.length; i++){
                     value[i]['NETSTAR-TIMER'] = moment().format('x')+i;
                  }
                  value[0].netstarSelectedFlag = true;
                  if(leftGridAddPosition == 'end'){
                     NetStarGrid.dataManager.addRow(value, leftGridId, -1);
                  }else{
                     NetStarGrid.dataManager.addRow(value, leftGridId, 0);
                  }
                  if($.isArray(value[0][keyField])){
                     NetStarGrid.refreshDataById(rightGridId, value[0][keyField]);
                  }
                  // if($.isArray(value)){
                  //    for(var i=0; i<value.length; i++){
                  //       value[i]['NETSTAR-TIMER'] = moment().format('x')+i;
                  //       NetStarGrid.dataManager.addRow(value[i],leftGridId);
                  //       if($.isArray(value[i][keyField])){
                  //          NetStarGrid.refreshDataById(rightGridId,value[i][keyField]);
                  //       }
                  //    }
                  // }else{
                  //    value['NETSTAR-TIMER'] = moment().format('x');
                  //    NetStarGrid.dataManager.addRow(value,leftGridId);
                  //    if($.isArray(value[keyField])){
                  //       NetStarGrid.refreshDataById(rightGridId,value[keyField]);
                  //    }
                  // }
               }
               break;
         }
      },
      VERSION: '0.0.1',						//版本号
      setSendParamsByPageParamsData:NetstarTemplate.commonFunc.setSendParamsByPageParamsData,
   }
})(jQuery);