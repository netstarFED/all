/*
 * @Author: netstar.sjj
 * @Date: 2019-08-08 10:45:00
 * 容器输出的组成 标题+右上角vo+界面vo+左侧list+右侧tab
 * 右上角vo+界面主vo + 界面主按钮
 * 左侧list+左侧按钮+右侧tab+右侧按钮
 */
NetstarTemplate.templates.limsReg = (function ($) {
   //根据组件配置的readonlyExpression设置只读操作
   function setReadonlyByReadonlyExpression(_config){
      var componentsByVo = _config.componentsConfig.vo;
      var componentByBtns = _config.componentsConfig.btns;
      var serverData = typeof(_config.serverData)=='object' ? _config.serverData : {};
      var tempalteParams = $.extend(true,{},serverData);
      if(!$.isEmptyObject(_config.pageParam)){
         tempalteParams.page = _config.pageParam;
      }
      for(voId in componentsByVo){
         var voConfig = componentsByVo[voId];
         if(voConfig.readonlyExpression){
            var readonlyExpression = JSON.parse(voConfig.readonlyExpression);
            var expressionObj = {};
            for(var expValue in readonlyExpression){
               var valueExpression = readonlyExpression[expValue];
               var currentReadonly = NetstarTemplate.commonFunc.getBooleanValueByExpression(tempalteParams,valueExpression);
               var englishNameArr = expValue.split(',');
               for(var nameI=0; nameI<englishNameArr.length; nameI++){
                  //根据定义的按钮英文名字分别存储当前按钮所处的状态
                  expressionObj[englishNameArr[nameI]] = currentReadonly;
               }
            }
            if(!$.isEmptyObject(expressionObj)){
               //存在要设置的只读
               var fieldArray = voConfig.field;
               var editVoArr = [];
               for(var fieldI=0; fieldI<fieldArray.length; fieldI++){
                  var fieldData = fieldArray[fieldI];
                  if(typeof(expressionObj[fieldArray[fieldI].id])=='boolean'){
                     editVoArr.push({
                        id:fieldData.id,
                        readonly:expressionObj[fieldArray[fieldI].id]
                     });
						}
               }
               NetstarComponent.editComponents(editVoArr,voConfig.id);
            }
         }
      }

      for(btnId in componentByBtns){
         var btnConfig = componentByBtns[btnId];
         if(btnConfig.readonlyExpression){
            var readonlyExpression = JSON.parse(btnConfig.readonlyExpression);
            var expressionObj = {};
            for(var expValue in readonlyExpression){
               var valueExpression = readonlyExpression[expValue];
               var currentReadonly = NetstarTemplate.commonFunc.getBooleanValueByExpression(tempalteParams,valueExpression);
               var englishNameArr = expValue.split(',');
               for(var nameI=0; nameI<englishNameArr.length; nameI++){
                  //根据定义的按钮英文名字分别存储当前按钮所处的状态
                  expressionObj[englishNameArr[nameI]] = currentReadonly;
               }
            }
            if(!$.isEmptyObject(expressionObj)){
               //存在要设置的只读
               var fieldArray = btnConfig.field;
               var editVoArr = [];
               for(var fieldI=0; fieldI<fieldArray.length; fieldI++){
                  var fieldData = fieldArray[fieldI];
                  var functionConfig = fieldData.functionConfig ? fieldData.functionConfig : {};
                  var englishName = functionConfig.englishName;
                  if(typeof(expressionObj[englishName])=='boolean'){
                     var isDisabled = expressionObj[englishName];
                     if(isDisabled){
                        $('button[ns-field="'+englishName+'"]').attr('disabled',true);
                     }else{
                        $('button[ns-field="'+englishName+'"]').removeAttr('disabled');
                     }
						}
               }
            }
         }
      }
   }
   /****************按钮 回调方法 start******************************* */
   //按钮前置获取参数的方法
   function dialogBeforeHandler(data,templateId){
      var templateConfig = NetstarTemplate.templates.limsReg.data[templateId].config;
      data.config = templateConfig;
      var controllerObj = data.controllerObj ? data.controllerObj : {};
      var isValid = true;
      if($.isEmptyObject(controllerObj)){
         isValid = false;
      }else{
         switch(controllerObj.defaultMode){
            case 'business':
               isValid = false;
               break;
         }
      }
      data.value = getPageData(templateConfig,isValid);
      return data;
   }
   //ajax调用之前的回调
   function ajaxBeforeHandler(data){
      return data;
   }  
   //删除objectState-1的数据
   function delObjectStateByDelete(){
      
   }
   //ajax执行完成之后的回调
   function ajaxAfterHandler(data,templateId,ajaxPlusData){
      //需要获取当前模板的config配置参数

      var templateConfig = {};
      if(templateId){
         templateConfig = NetstarTemplate.templates.limsReg.data[templateId].config;
      }else{
         if(NetstarUI.labelpageVm.labelPagesArr[NetstarUI.labelpageVm.currentTab]){
            var packageName = NetstarUI.labelpageVm.labelPagesArr[1].config.package;
            templateConfig = NetstarTemplate.templates.configs[packageName];
         }
      }

      if(typeof(ajaxPlusData)=='undefined'){
         ajaxPlusData = {};
      }
      if(ajaxPlusData.englishName == 'saveAndSubmit'){
         ajaxPlusData.successOperate = 'clearOrIsCloseWindow';
      }
      if(ajaxPlusData.successOperate == 'clearOrIsCloseWindow'){
         var dialogCommon = {
            id:'dialog-btn-clearOrIsCloseWindow',
            title: '确认提示',
            templateName: 'PC',
            height:'auto',
            width:'300px',
            shownHandler:function(data){
               var html = '<p class="selection-prompt"><i class="icon-info"></i>请选择提交成功后的操作！</p>';
					$('#'+data.config.bodyId).html(html);
               var btnJson = {
                  id:data.config.footerIdGroup,
                  //pageId:id,
                  btns:[
                     {
                        text:'继续下一委托',
                        handler:function(data){
                           var _templateConfig = data.dialogBeforeHandler(data).config;
                           _templateConfig.serverData = {};
                           NetstarComponent.dialog['dialog-btn-clearOrIsCloseWindow'].vueConfig.close();
                           NetstarTemplate.templates.limsReg.clearByAll(_templateConfig,'clear');
                           setReadonlyByReadonlyExpression(_templateConfig);
                        }
                     },{
                        text:'关闭页面',
                        handler:function(){
                           NetstarComponent.dialog['dialog-btn-clearOrIsCloseWindow'].vueConfig.close();
                           NetstarUI.labelpageVm.removeCurrent();
                        }
                     }
                  ],
                  callback:{
                     dialogBeforeHandler:(function(_config){
                       return function (data) {
                          return NetstarTemplate.templates[_config.template].dialogBeforeHandler(data,_config.id);
                       }
                     })(templateConfig),
                     ajaxBeforeHandler:(function(_config){
                       return function (data) {
                          return NetstarTemplate.templates[_config.template].ajaxBeforeHandler(data,_config.id);
                       }
                     })(templateConfig),
                     ajaxAfterHandler:(function(_config){
                       return function (data,plusData) {
                          return NetstarTemplate.templates[_config.template].ajaxAfterHandler(data,_config.id,plusData);
                       }
                     })(templateConfig),
                     getOperateData:(function(_config){
                       return function () {
                          var pageData = NetstarTemplate.getOperateData(_config);
                          return pageData;
                       }
                     })(templateConfig),
                     dataImportComplete:(function(_config){
                       return function (data) {
                          NetstarTemplate.templates[_config.template].refreshByConfig(_config);
                       }
                     })(templateConfig),
                 }
               };
               vueButtonComponent.init(btnJson);
            }
         };
         NetstarComponent.dialogComponent.init(dialogCommon);
      }else if(ajaxPlusData.isCloseWindow === true){
         //如果按钮上配置了关闭当前界面直接执行关闭操作
         NetstarUI.labelpageVm.removeCurrent();
      }else{
         if(!$.isArray(data)){
            //返回值是对象 可以根据返回状态去处理界面逻辑
            switch(data.objectState){
               case NSSAVEDATAFLAG.DELETE:
                  //删除
                  templateConfig.serverData = {};
                  clearByAll(templateConfig,'clear');
                  break;
               case NSSAVEDATAFLAG.EDIT:
                  //修改
                  templateConfig.serverData = nsServerTools.setObjectStateData(data);//改变服务端数据值
                  templateConfig.serverData.objectState = NSSAVEDATAFLAG.EDIT;
                  //给第二级数据添加时间戳
                  if($.isArray(templateConfig.serverData[templateConfig.detailLeftComponent.keyField])){
                     var gridArray = templateConfig.serverData[templateConfig.detailLeftComponent.keyField];
                     for(var dataI=0; dataI<gridArray.length; dataI++){
                        gridArray[dataI]['NETSTAR-TIMER'] = moment().format('x')+dataI;
                     }
                  }
                  initComponentByFillValues(templateConfig);
                  setReadonlyByReadonlyExpression(templateConfig);
                  break;
               case NSSAVEDATAFLAG.ADD:
                  //新增
                  tabComponentFunc(templateConfig,'clear');
                  break;
               case NSSAVEDATAFLAG.VIEW:
                  //刷新
                  templateConfig.serverData = nsServerTools.setObjectStateData(data);//改变服务端数据值
                  templateConfig.serverData.objectState = NSSAVEDATAFLAG.EDIT;
                   //给第二级数据添加时间戳
                  if($.isArray(templateConfig.serverData[templateConfig.detailLeftComponent.keyField])){
                     var gridArray = templateConfig.serverData[templateConfig.detailLeftComponent.keyField];
                     for(var dataI=0; dataI<gridArray.length; dataI++){
                        gridArray[dataI]['NETSTAR-TIMER'] = moment().format('x')+dataI;
                     }
                  }
                  initComponentByFillValues(templateConfig);
                  setReadonlyByReadonlyExpression(templateConfig);
                  break;
            }
         }else{
            //返回值是数组 没法根据objectState去处理逻辑
         }
      }
   }
   /****************按钮 回调方法 end******************************** */
   /****************模板逻辑方法 start******************************** */
   //获取界面vo数据
   function getVoData(voId,valid){
      if(typeof(NetstarComponent.config[voId])!='object'){
         return {};
      }else{
         return NetstarTemplate.commonFunc.vo.getData(voId,valid);
      }
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
         NetstarTemplate.commonFunc.list.refresh(listIdArr[i],[]);
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
   function getPageData(_config,isValid){
      isValid = typeof(isValid)=='boolean' ? isValid : true;
      if(typeof(_config)=='string'){
         _config = NetstarTemplate.templates.configs[_config];
      }
      var pageData = {};
      //var mainData = getVoData(_config.mainComponent.id,true);
      var mainData = {};
      for(var componentVoI in _config.componentsConfig.vo){
         var voComponentData = _config.componentsConfig.vo[componentVoI];
         var isContinue = true;
         if(voComponentData.position){
            var voData = getVoData(voComponentData.id,isValid);
            if(voData){
               $.each(voData,function(key,value){
                  mainData[key] = value;
               });
            }else{
               //终止循环
               isContinue = false;
               mainData = false;
               break;
            }
         }
         if(isContinue == false){
            mainData = false;
            break;
         }
      }
      if(mainData){
         pageData = mainData;  
         switch(_config.detailLeftComponent.type){
            case 'list':
            case 'blockList':
               pageData[_config.detailLeftComponent.keyField] = getListData(_config.detailLeftComponent.id);
               break;
            case 'vo':
               var voData = getVoData(_config.detailLeftComponent.id,isValid);
               if(voData){
                  for(var valueId in voData){
                     pageData[valueId] = voData[valueId];
                  }
               }
               break;
         }
      }else{
         //验证失败
         nsalert('请填写必填项','warning');
         return false;
      }
      if($.isArray(pageData[_config.detailLeftComponent.keyField])){
         if(pageData[_config.detailLeftComponent.keyField].length == 1){
            var increaseNum = 0;
            for(var keyI in pageData[_config.detailLeftComponent.keyField][0]){
               increaseNum ++;
            }
            if(increaseNum == 1 && pageData[_config.detailLeftComponent.keyField][0].objectState == 1){
               pageData[_config.detailLeftComponent.keyField] = [];
               _config.serverData = {};
            }
         }
         /***lyw 20200228******/
         if(isValid){
            // 验证右侧表格必填项
            // 获取左侧表单的子数据
            var leftChildConfigs = [];
            var leftKeyField = _config.detailLeftComponent.keyField;
            var leftData = pageData[_config.detailLeftComponent.keyField];
            var components = _config.components;
            for(var i=0; i<components.length; i++){
               if(components[i].parent == leftKeyField){
                  leftChildConfigs.push(components[i]);
               }
            }
            var isPass = true;
            for(var i=0; i<leftChildConfigs.length; i++){
               var childConfig = leftChildConfigs[i];
               var field = childConfig.field;
               switch(childConfig.type){
                  case 'vo':
                     for(var valI=0; valI<leftData.length; valI++){
                        for(var fieldI=0; fieldI<field.length; fieldI++){
                           var fieldObj = field[fieldI];
                           if(fieldObj.rules){
                              var valStr = leftData[valI][fieldObj.id];
                              if(typeof(valStr) == "undefined"){ valStr = ''; }
                              if(typeof(NetstarComponent[fieldObj.type]) != "object"){
                                 break;
                              }
                              var passObj = NetstarComponent[fieldObj.type].validatValue(valStr, fieldObj.rules, 'object', fieldObj);
                              if(!passObj.isTrue){
                                 isPass = false;
                                 nsalert('右侧子表'+childConfig.keyField+'配置错误：'+fieldObj.label+passObj.validatInfo, 'warning');
                                 console.warn('右侧子表'+childConfig.keyField+'配置错误：'+fieldObj.label+passObj.validatInfo);
                                 break;
                              }
                           }
                        }
                        if(!isPass){
                           break;
                        }
                     }
                     break;
                  case 'list':
                     for(var valI=0; valI<leftData.length; valI++){
                        var listValData = leftData[valI][childConfig.keyField];
                        for(var fieldI=0; fieldI<field.length; fieldI++){
                           var fieldTable = field[fieldI];
                           var fieldObj = fieldTable.editConfig;
                           if(fieldObj.rules){
                              for(var listValI=0; listValI<listValData.length; listValI++){
                                 var valStr = listValData[listValI][fieldTable.field];
                                 if(typeof(valStr) == "undefined"){ valStr = ''; }
                                 if(typeof(NetstarComponent[fieldObj.type]) != "object"){
                                    break;
                                 }
                                 var passObj = NetstarComponent[fieldObj.type].validatValue(valStr, fieldObj.rules, 'object', fieldObj);
                                 if(!passObj.isTrue){
                                    isPass = false;
                                    nsalert('右侧子表'+childConfig.keyField+'配置错误：'+fieldTable.title+passObj.validatInfo, 'warning');
                                    console.warn('右侧子表'+childConfig.keyField+'配置错误：'+fieldTable.title+passObj.validatInfo);
                                    console.warn(childConfig);
                                    break;
                                 }
                              }
                           }
                           if(!isPass){
                              break;
                           }
                        }
                        if(!isPass){
                           break;
                        }
                     }
                     break;
               }
               if(!isPass){
                  break;
               }
            }
            if(!isPass){
               //验证失败
               nsalert('请填写验证错误项','warning');
               return false;
            }
         }
         /***lyw 20200228******/
      }
      if(!$.isEmptyObject(_config.serverData)){
         if($.isArray(_config.serverData[_config.detailLeftComponent.keyField])){
            //服务端数据值在进行比较的时候不能存在状态
            var detailData = _config.serverData[_config.detailLeftComponent.keyField];
            for(var i=0; i<detailData.length; i++){
               delete detailData[i].objectState;
               delete detailData[i].netstarSelectedFlag;
               delete detailData[i]['NETSTAR-TIMER'];
            }
         }
      }

      var returnData = nsServerTools.getObjectStateData(_config.serverData, pageData, _config.idFieldsNames);

      if(_config.serverData.objectState == NSSAVEDATAFLAG.EDIT){
         returnData.objectState = NSSAVEDATAFLAG.EDIT;
         //returnData[_config.detailLeftComponent.keyField] = pageData[_config.detailLeftComponent.keyField];
         for(var dataI in returnData){
            if($.isArray(returnData[dataI])){
               for(var arrI=0; arrI<returnData[dataI].length; arrI++){
                  if(returnData[dataI][arrI].objectState != NSSAVEDATAFLAG.DELETE){
                     returnData[dataI][arrI].objectState = NSSAVEDATAFLAG.EDIT;
                  }
                  if(dataI == _config.detailLeftComponent.keyField){
                     if(typeof(returnData[dataI][arrI][_config.detailLeftComponent.idField])=='undefined'){
                        returnData[dataI][arrI].objectState = NSSAVEDATAFLAG.ADD;
                     }
                  }
                  for(var arrJ in returnData[dataI][arrI]){

                     if($.isArray(returnData[dataI][arrI][arrJ])){
                        for(var arrK=0; arrK<returnData[dataI][arrI][arrJ].length; arrK++){
                           if(returnData[dataI][arrI][arrJ][arrK].objectState!=NSSAVEDATAFLAG.DELETE){
                              returnData[dataI][arrI][arrJ][arrK].objectState = NSSAVEDATAFLAG.EDIT;
                           }
                           if(dataI == _config.detailLeftComponent.keyField){
                              if(typeof(returnData[dataI][arrI][_config.detailLeftComponent.idField])=='undefined'){
                                 delete returnData[dataI][arrI][arrJ][arrK].id;
                                 returnData[dataI][arrI][arrJ][arrK].objectState = NSSAVEDATAFLAG.ADD;
                              }else if(typeof(returnData[dataI][arrI][arrJ][arrK].id)=='undefined'){
                                 returnData[dataI][arrI][arrJ][arrK].objectState = NSSAVEDATAFLAG.ADD;
                              }
                           }
                        }
                     }
                  }
               }
            }
         }
      }

      if(!$.isEmptyObject(_config.pageParam)){
         //按照标准处理流程，应该提供额外配置参数处理processId，
         //正常情况下不应当在大保存中处理这种逻辑，由于此情况特殊,特此记录 cy
         //工作流id 流程图id  如果界面来源参不为空 判断是否含有流程图id
         var pageFieldArr = ['processId','activityId','activityName','workItemId','workflowType','acceptFileIds'];
         for(var paramI=0; paramI<pageFieldArr.length; paramI++){
            if(_config.pageParam[pageFieldArr[paramI]]){
               returnData[pageFieldArr[paramI]] = _config.pageParam[pageFieldArr[paramI]];
            }
         }
         //if(_config.pageParam.processId){
           // returnData.processId = _config.pageParam.processId;
        // }
      }
      return returnData;
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
   function getTabData(voIdArr,listIdArr,tabComponentData, isValid){
      var data = {};
      isValid = typeof(isValid) == "boolean" ? isValid : true;
      for(var i=0; i<voIdArr.length; i++){
         var voData = getVoData(voIdArr[i],isValid);
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

   //清空选中状态
   function clearSelectedFlagByBlockList(gridId){
      var rows = NetstarBlockList.configs[gridId].vueObj.$data.rows;
      var originalRows = NetstarBlockList.configs[gridId].vueObj.originalRows;
      for(var r=0; r<rows.length; r++){
         rows[r].netstarSelectedFlag = false;
      }
      for(var r=0; r<originalRows.length; r++){
         originalRows[r].netstarSelectedFlag = false;
      }
   }
   //给detail中的左侧列表添加数据
   //处理tab数据 增删改方法
   function tabComponentFunc(_config,operatorType,rowData,_rowIndex, isValid){
      var tabComponentData = _config.tabConfig.components;
      isValid = typeof(isValid) == "boolean" ? isValid : true;
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

            //清空之后获取grid数据判断是否为空
            var gridDataArr = NetstarTemplate.commonFunc.list.getData(_config.detailLeftComponent.id);
            if(gridDataArr.length == 0){
               //左侧数据为空 手动添加
               var emptyData = {};
               emptyData[_config.detailLeftComponent.idField] = null;
               emptyData['NETSTAR-TIMER'] = moment().format('x');
               emptyData.netstarSelectedFlag = true;
               NetstarBlockList.refreshDataById(_config.detailLeftComponent.id,[emptyData]);
               var fillValueData = {
                  'NETSTAR-TIMER':emptyData['NETSTAR-TIMER']
               };
               NetstarTemplate.commonFunc.vo.fillValues(fillValueData,voIdArr[0]);
            }

            break;
         case 'add':
            clearVoData(voIdArr);// 清空右侧值
            clearListData(listIdArr);// 清空右侧值
            //左侧新增一条空白数据
            var data = {
               'NETSTAR-TIMER':moment().format('x'),
               netstarSelectedFlag:false,
            };
            fillValuesByVoId(voIdArr[0],data);//给右侧vo赋值
            NetStarGrid.addRow(data,_config.detailLeftComponent.id,(_rowIndex+1));

            setTimeout(function(){
               clearSelectedFlagByBlockList(_config.detailLeftComponent.id);
               NetstarBlockList.configs[_config.detailLeftComponent.id].vueObj.$data.rows[_rowIndex].netstarSelectedFlag = false;
               NetstarBlockList.configs[_config.detailLeftComponent.id].vueObj.$data.rows[_rowIndex+1].netstarSelectedFlag = true;
               NetstarBlockList.configs[_config.detailLeftComponent.id].vueObj.originalRows[_rowIndex].netstarSelectedFlag = false;
               NetstarBlockList.configs[_config.detailLeftComponent.id].vueObj.originalRows[_rowIndex+1].netstarSelectedFlag = true;
            },50)
            /*var data = getTabData(voIdArr,listIdArr,tabComponentData);
            if(data){
               data['NETSTAR-TIMER'] = moment().format('x');
               NetStarGrid.addRow(data,_config.detailLeftComponent.id);
               //移除按钮禁用
               //$('#'+_config.tabConfig.btnConfig.id).children('.pt-btn-group').children('button[type="button"]').removeAttr('disabled');
            }else{
               nsalert('验证失败','error');
            }*/
            break;
         case 'copyAdd':
            clearVoData(voIdArr);
            clearListData(listIdArr);
            var data = $.extend(true,{},rowData);
            //复制新增不新增主键id
            if(data[_config.detailLeftComponent.idField]){
               delete data[_config.detailLeftComponent.idField];
            }
            delete data.samplecode;//不要复制样品编号 sjj 20191205
            var listLength = 0;
            if($.isArray(NetstarBlockList.configs[_config.detailLeftComponent.id].vueObj.originalRows)){
               listLength = NetstarBlockList.configs[_config.detailLeftComponent.id].vueObj.originalRows.length;
            }
            data['NETSTAR-TIMER'] = moment().format('x')+listLength;
            data.netstarSelectedFlag = false;
            NetStarGrid.addRow(data,_config.detailLeftComponent.id,(_rowIndex+1));

            setTimeout(function(){
               clearSelectedFlagByBlockList(_config.detailLeftComponent.id);
               NetstarBlockList.configs[_config.detailLeftComponent.id].vueObj.$data.rows[_rowIndex].netstarSelectedFlag = false;
               NetstarBlockList.configs[_config.detailLeftComponent.id].vueObj.$data.rows[_rowIndex+1].netstarSelectedFlag = true;
               NetstarBlockList.configs[_config.detailLeftComponent.id].vueObj.originalRows[_rowIndex].netstarSelectedFlag = false;
               NetstarBlockList.configs[_config.detailLeftComponent.id].vueObj.originalRows[_rowIndex+1].netstarSelectedFlag = true;
               if(_config.levelExpression){
                  var feeTotalNum = 0;
                  var leftOriginalRows = NetstarBlockList.configs[_config.detailLeftComponent.id].vueObj.originalRows;
                  for(var s=0; s<leftOriginalRows.length; s++){
                     if(typeof(leftOriginalRows[s].quoteTotal)=='number'){
                        feeTotalNum += leftOriginalRows[s].quoteTotal;
                     } 
                  }
                  fillValuesByVoId(_config.mainComponent.id,{feeTotal:feeTotalNum});//给vo中的参考金额赋值
                  if(typeof(_config.countFuncHandler)=='function'){
                     _config.countFuncHandler(_config);
                  }
               }
            },50)

            fillValuesTabByRowData(data,{package:_config.package},false);
            //var data = getTabData(voIdArr,listIdArr,tabComponentData);
            /*if(data){
               data['NETSTAR-TIMER'] = moment().format('x');
               NetStarGrid.addRow(data,_config.detailLeftComponent.id);
               clearVoData(voIdArr);
               clearListData(listIdArr);
            }else{
               nsalert('验证失败','error');
            }*/
            break;
         case 'save':
            //此时执行的是修改的操作
            var data = getTabData(voIdArr,listIdArr,tabComponentData, isValid);
            if(data){
               //var listData = NetstarTemplate.commonFunc.list.getData(_config.detailLeftComponent.id);
               var originalRows = [];
               switch(_config.detailLeftComponent.type){
                  case 'list':
                     originalRows = NetStarGrid.configs[_config.detailLeftComponent.id].vueObj.originalRows;
                     break;
                  case 'blockList':
                     originalRows = NetstarBlockList.configs[_config.detailLeftComponent.id].vueObj.originalRows;
                     break;
               }
               var existIndex = -1;
               for(var e=0; e<originalRows.length; e++){
                  if(originalRows[e]['NETSTAR-TIMER'] == data['NETSTAR-TIMER']){
                     existIndex = e;
                     break;
                  }
               }
               if(existIndex>-1){
                  originalRows[existIndex] = data;
                  NetstarBlockList.refreshDataById(_config.detailLeftComponent.id,originalRows);
               }
            }else{
               nsalert('验证失败','error');
            }
            break;
         case 'refresh':
            clearVoData(voIdArr);// 清空右侧值
            clearListData(listIdArr);// 清空右侧值
            tabRefreshByIds(voIdArr,listIdArr,tabComponentData,rowData);
            break;
      }
     
      //本地缓存存储列表数据
      var listData = getListData(_config.detailLeftComponent.id);
      store.set('cache-'+_config.detailLeftComponent.id,listData);
   }
   //给tab赋值
   function fillValuesTabByRowData(data,_gridConfig,isReadExpression){
      //给右侧tab中的grid赋值
      var templateConfig = NetstarTemplate.templates.configs[_gridConfig.package];
      var components = templateConfig.tabConfig.components;
      isReadExpression = typeof(isReadExpression)=='boolean' ? isReadExpression : true;
      var formID;
      var gridID;
      var gridIDs = [];
      if(typeof(templateConfig.gridSelctedByCountFuncHanlder)=='function' && isReadExpression){
         templateConfig.gridSelctedByCountFuncHanlder(templateConfig,data);
      }
      for(var componentId in components){
         switch(components[componentId].type){
            case 'list':
               gridID = components[componentId].id;
               gridIDs.push(gridID);
               var listArr = data[components[componentId].keyField];
               if(!$.isArray(listArr)){listArr = [];}
               NetStarGrid.configs[components[componentId].id].gridConfig.ui.drawHandler = function(){}
               NetStarGrid.refreshDataById(components[componentId].id, listArr);
               break;
            case 'vo':
               var formComponents = NetstarComponent.config[components[componentId].id].config;
               formID = components[componentId].id;
               for(var voField in formComponents){
                  formComponents[voField].commonChangeHandler = function(){}
               }
               NetstarTemplate.commonFunc.vo.clearValues(components[componentId].id,false);//先清空再赋值
               fillValuesByVoId(components[componentId].id,data);
               break;
         }
      }

      if(formID){
         //恢复回调方法
         var formComponents = NetstarComponent.config[formID].config;
         for(var voField in formComponents){
            formComponents[voField].commonChangeHandler = commonChangeHandlerByTabVo;
         }
      }
      if(gridIDs.length > 0){
         setTimeout(function(){
            for(var i=0; i<gridIDs.length; i++){
               NetStarGrid.configs[gridIDs[i]].gridConfig.ui.drawHandler = tabListDrawHandler;
            }
            // NetStarGrid.configs[components[componentId].id].gridConfig.ui.drawHandler = tabListDrawHandler;
         },500) 
      }
   }
   //保存为模板
   function saveByTemplateModelHandler(data){
      var functionConfig = data.data.functionConfig;//配置参数
      var dialogBeforeHandlerData = data.dialogBeforeHandler(data);//调用此函数获取到关联界面的配置参数和当前界面的值
      var templateConfig = dialogBeforeHandlerData.config;//获取到当前包名的配置项
      var pageData = dialogBeforeHandlerData.value;//获取整体界面参数
      //模板保存数据保存的非整体数据而是第三级的参数值需要处理一下
      var gridConfig = templateConfig.detailLeftComponent;
      var detailListArray = NetstarTemplate.commonFunc[gridConfig.type].getSelectedData(gridConfig.id);//获取第二级选中值
      if(!$.isArray(detailListArray)){detailListArray = [];}
      var keyFieldArray = templateConfig.tabConfig.field.split(',');

      var currentTemplateData = {};//当前要保存为模板的数据
      for(var keyF=0; keyF<keyFieldArray.length; keyF++){
         if($.isArray(detailListArray[0][keyFieldArray[keyF]])){
            if(detailListArray[0][keyFieldArray[keyF]].length > 0){
               currentTemplateData = detailListArray[0];
            }
         }
      }

      if($.isEmptyObject(currentTemplateData)){
         nsalert('请先添加要保存的模板','error');
      }else{
         var parameterFormat = functionConfig.parameterFormat;//格式化参数
         var formatData = NetStarUtils.getFormatParameterJSON(parameterFormat,currentTemplateData);
         $.each(formatData,function(key,value){
            currentTemplateData[key] = value;
         });
         var fieldArray = $.extend(true,[],functionConfig.field);
         for(var fieldI=0; fieldI<fieldArray.length; fieldI++){
            fieldArray[fieldI].value = currentTemplateData[fieldArray[fieldI].id];
         }
         var dialogJson = {
				id:'save-template-'+templateConfig.id,
				title: typeof(functionConfig.title) =='string'?functionConfig.title:'保存模板',
				templateName:'PC',
				shownHandler:function(showDialogData){
					var formConfig = {
						id: showDialogData.config.bodyId,
						templateName: 'form',
						componentTemplateName: 'PC',
						defaultComponentWidth:'50%',
						form:fieldArray,
						isSetMore:false,
						completeHandler:function(voConfigData){
                     var btnJson = {
								id:showDialogData.config.footerIdGroup,
								btns:[
									{
										text:'保存',
										handler:function(){
											var jsonData = NetstarComponent.getValues(voConfigData.config.id);
											if(jsonData){
                                    jsonData.objectState = NSSAVEDATAFLAG.ADD;
                                    var ajaxConfig = $.extend(true,{},functionConfig.saveAjax);
                                    ajaxConfig.data = jsonData;
                                    ajaxConfig.plusData = {controllObj:functionConfig};
                                    NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
                                       if(res.success){
                                          NetstarComponent.dialog[showDialogData.config.id].vueConfig.close();
                                       }else{
                                          nsalert(res.msg,'error');
                                       }
                                    },true);
											}
										}
									},{
										text:'关闭',
										handler:function(){
											NetstarComponent.dialog[showDialogData.config.id].vueConfig.close();
										}
									}
								]
                     };
                     vueButtonComponent.init(btnJson);
						}
					};
					var component = NetstarComponent.formComponent.getFormConfig(formConfig);
					NetstarComponent.formComponent.init(component, formConfig);
				}
			};
			NetstarComponent.dialogComponent.init(dialogJson);
      }
   }
   //根据第二级当前选中行给第三级数据进行赋值
   function fillValuesBySecondGridSelectedData(data,_templateConfig){
      var detailLeftComponent = _templateConfig.detailLeftComponent;
      var selectedData = NetstarTemplate.commonFunc[detailLeftComponent.type].getSelectedData(detailLeftComponent.id);
      var netstartimer = selectedData[0]['NETSTAR-TIMER'];
      var originalRowsData = NetstarBlockList.configs[detailLeftComponent.id].vueObj.originalRows;
      var componentsData = NetstarTemplate.templates.configs['nscloud.accept'].tabConfig.components;
      var editIndex = -1;
      for(var i=0; i<originalRowsData.length; i++){
         if(originalRowsData[i]['NETSTAR-TIMER'] == netstartimer){
            editIndex = i;
            break;
         }
      }

      for(var componentI in componentsData){
         var componentConfig = componentsData[componentI];
         switch(componentConfig.type){
            case 'list':
               NetStarGrid.refreshDataById(componentConfig.id,data);
               if(editIndex > -1){
                  originalRowsData[editIndex][componentConfig.keyField] = data;
               }
               break;
         }
      }
   }
   //导入项目模板
   function importByTemplateModelHandler(data){
      var functionConfig = data.data.functionConfig;//配置参数
      var dialogBeforeHandlerData = data.dialogBeforeHandler(data);//调用此函数获取到关联界面的配置参数和当前界面的值
      var templateConfig = dialogBeforeHandlerData.config;//获取到当前包名的配置项

      var dialogJson = {
         id:'import-template-'+templateConfig.id,
         title: typeof(functionConfig.title) =='string'?functionConfig.title:'保存模板',
         templateName:'PC',
         width:'100%', 
         shownHandler:function(showDialogData){
            var gridConfig = {
               idField:functionConfig.idField,
               id:showDialogData.config.bodyId,
               data:{
                  idField:functionConfig.idField,
               },
               columns:$.extend(true,[],functionConfig.field),
               ui:{
                  //isCheckSelect:true,
                  pageLengthMenu:10,
                  selectMode:'single',
                  rowdbClickHandler:function(rowData,vueConfig,vueData,_gridConfig){
                     //确认导入此数据
                     var ajaxConfig = {
                        url:getRootPath()+'/sample/accept/sampleItems/createByItemTemplate',
                        type:'post',
                        contentType:'application/x-www-form-urlencoded',
                        data:{itemTemplateId:rowData.id}
                     };
                     NetStarUtils.ajax(ajaxConfig,function(res){
                        if(res.success){
                           var rowsData = res.rows;
                           if(!$.isArray(rowsData)){rowsData = [];}
                           if(rowsData.length > 0){
                              // 开始执行导入
                              fillValuesBySecondGridSelectedData(rowsData,templateConfig);
                              NetstarComponent.dialog[showDialogData.config.id].vueConfig.close();
                           }
                        }else{
                           nsalert(res.msg,'error');
                        }
                     },true)
                  },//双击事件
                  tableRowBtns:[
                     {
                        text:'删除',
                        handler:function(data){
                           var rowData = data.rowData;
                           var idField = NetStarGrid.configs[data.gridId].gridConfig.idField;
                           nsconfirm('确认要删除？',function(state){
                              var ajaxConfig = {
                                 url:getRootPath()+'/itemTemplates/delById',
                                 type:'get',
                                 contentType:'application/x-www-form-urlencoded',
                                 dataSrc:'data',
                                 data:{id:rowData[idField]}
                              };
                              NetStarUtils.ajax(ajaxConfig,function(res){
                                 if(res.success){
                                    nsalert('删除成功');
                                    NetStarGrid.refreshById(data.gridId);
                                 }else{
                                    nsalert(res.msg,'error');
                                 }
                              },true);
                           },'warning');
                        }
                     }
                  ],
                  completeHandler:function(){
                     var queryConfig = NetStarUtils.getListQueryData(functionConfig.field,{id:showDialogData.config.bodyId,value:''});
                     if(!$.isEmptyObject(queryConfig)){
                        //存在查询条件
                        var contidionHtml = '<div class="pt-panel pt-grid-header">'		
                                                +'<div class="pt-container">'
                                                   +'<div class="pt-panel-row">'
                                                      +'<div class="pt-panel-col" id="'+queryConfig.id+'"></div>'
                                                      +'<div class="pt-panel-col text-right" id="advance-'+queryConfig.id+'"></div>'
                                                   +'</div>'
                                                +'</div>'
                                             +'</div>';
                        $('#'+showDialogData.config.bodyId).prepend(contidionHtml);
                        var voDialogConfig = {
                           id:queryConfig.id,
                           formStyle:'pt-form-normal',
                           plusClass:'pt-custom-query',
                           isSetMore:false,
                           form:queryConfig.queryForm,
                           completeHandler:function(voConfigData){
                              var buttonHtml = '<div class="pt-btn-group">'
                                                   +'<button type="button" class="pt-btn pt-btn-default pt-btn-icon" nstype="refresh" containerid="'+voDialogConfig.id+'"><i class="icon-search"></i></button>'
                                                +'</div>';
                              var $container = $('#'+voDialogConfig.id);
                              if($('button[containerid="'+voDialogConfig.id+'"]').length > 0){
                                 $('button[containerid="'+voDialogConfig.id+'"]').remove();
                              }
                              $container.append(buttonHtml);
                              function customFilterRefreshBtnHandler(event){
                                 var $this = $(this);
                                 var formId = $this.attr('containerid');
                                 var formJson = NetstarComponent.getValues(formId);
                                 var paramJson = {};
                                 if(formJson.filtermode == 'quickSearch'){
                                    if(formJson.filterstr){
                                       paramJson = {
                                          keyword:formJson.filterstr
                                       };
                                    }
                                 }else{
                                    var queryConfig = NetstarComponent.config[formId].config[formJson.filtermode];
                                    if(!$.isEmptyObject(queryConfig)){
                                       if(formJson[formJson.filtermode]){
                                          if(queryConfig.type == 'business'){	
                                             switch(queryConfig.selectMode){
                                                case 'single':
                                                   paramJson[formJson.filtermode] = formJson[formJson.filtermode][queryConfig.idField];
                                                   break;
                                                case 'checkbox':
                                                   paramJson[formJson.filtermode] = formJson[formJson.filtermode][0][queryConfig.idField];
                                                   break;
                                             }
                                          }else{
                                             paramJson[formJson.filtermode] = formJson[formJson.filtermode];
                                          }
                                       }
                                       if(typeof(formJson[formJson.filtermode])=='number'){
                                          paramJson[formJson.filtermode] = formJson[formJson.filtermode];
                                       }
                                       if(queryConfig.type == 'dateRangePicker'){
                                          var startDate = formJson.filtermode+'Start';
                                          var endDate = formJson.filtermode+'End';
                                          paramJson[startDate] = formJson[startDate];
                                          paramJson[endDate] = formJson[endDate];
                                       }
                                    }else{
                                       if(formJson.filterstr){
                                          paramJson[formJson.filtermode] = formJson.filterstr;
                                       }
                                    }
                                 }
                                 NetStarGrid.refreshById(showDialogData.config.bodyId,paramJson);
                              }
                              $('button[containerid="'+voDialogConfig.id+'"]').off('click',customFilterRefreshBtnHandler);
			                     $('button[containerid="'+voDialogConfig.id+'"]').on('click',customFilterRefreshBtnHandler);
                           }
                        };
                        var component2 = NetstarComponent.formComponent.getFormConfig(voDialogConfig);
                        NetstarComponent.formComponent.init(component2,voDialogConfig);

                        var advancedQueryId = 'advance-'+queryConfig.id;
                        var advancedQueryFormArr = $.extend(true,[],queryConfig.advanceForm);
                        if(advancedQueryFormArr.length > 0){
                           var advancedQueryConfig = {
                              id: advancedQueryId,
                              title: '高级查询',
                              getAjaxData : {
                                 panelId : advancedQueryId,
                              },
                              saveAjaxData : {
                                 panelId : advancedQueryId,
                              },
                              delAjaxData : {},
                              form : advancedQueryFormArr,
                              queryHandler : function(formJson, _config){
                                 var gridId = queryConfig.id.substring(6,queryConfig.id.length);
                                 var formId = _config.queryTermId;
                                 store.set(formId,formJson);
                                 var queryFormArr = _config.form;
                                 for(var i=0; i<queryFormArr.length; i++){
                                    var fieldId = queryFormArr[i].id;
                                    if(formJson[fieldId]){
                                       if(queryFormArr[i].type=='business'){
                                          switch(queryFormArr[i].selectMode){
                                             case 'single':
                                                formJson[value] = formJson[value][queryFormArr[i].idField];
                                                break;
                                             case 'checkbox':
                                                formJson[value] = formJson[value][0][queryFormArr[i].idField];
                                                break;
                                          }
                                       }
                                    }
                                 }
                                 if(!$.isEmptyObject(config.pageParam)){
                                    nsVals.extendJSON(formJson,config.pageParam);
                                 }
                                 formJson = nsServerTools.deleteEmptyData(formJson);
                                 NetStarGrid.refreshById(gridId, formJson);
                              },
                           }
                           NetstarComponent.advancedQuery.init(advancedQueryConfig);
                        }

                     }
                  }
               }
            };
            $.each(functionConfig.ajax,function(key,value){
               gridConfig.data[key] = value;
            });
            NetStarGrid.init(gridConfig);

            //底部填充内容
            
            var footerHtml = '<div class="pt-panel">'
                                 +'<div class="pt-container">'
                                       +'<div class="pt-panel-row">'
                                          +'<div class="pt-panel-col">'
                                             +'<div class="pt-btn-group" id="left-'+showDialogData.config.footerIdGroup+'">'
                                                
                                             +'</div>'
                                          +'</div>'
                                       +'<div class="pt-panel-col">'
                                          +'<div class="pt-btn-group" id="right-'+showDialogData.config.footerIdGroup+'">'
                                             
                                          +'</div>'
                                       +'</div>'
                                    +'</div>'
                                 +'</div>'
                              +'</div>';
            $('#'+showDialogData.config.footerIdGroup).html(footerHtml);
            var footerLeftBtnJson ={
               id:'left-'+showDialogData.config.footerIdGroup,
               btns:[
                  {
                     text:'选中',
                     handler:function(data){
                        var data = NetStarGrid.getSelectedData(showDialogData.config.bodyId);//获取表格选中数据
                        if($.isArray(data)){
                           if(data.length == 1){
                              var ajaxConfig = {
                                 url:getRootPath()+'/sample/accept/sampleItems/createByItemTemplate',
                                 type:'post',
                                 contentType:'application/x-www-form-urlencoded',
                                 data:{itemTemplateId:data[0].id}
                              };
                              NetStarUtils.ajax(ajaxConfig,function(res){
                                 if(res.success){
                                    var rowsData = res.rows;
                                    if(!$.isArray(rowsData)){rowsData = [];}
                                    if(rowsData.length > 0){
                                       // 开始执行导入
                                       fillValuesBySecondGridSelectedData(rowsData,templateConfig);
                                       NetstarComponent.dialog[showDialogData.config.id].vueConfig.close();
                                    }
                                 }else{
                                    nsalert(res.msg,'error');
                                 }
                              },true)
                           }
                        }else{
                           nsalert('请选中要导入的模板数据','error');
                        }
                     }
                  }
               ]
            };
            vueButtonComponent.init(footerLeftBtnJson);
            var footerRightBtnJson = {
               id:'right-'+showDialogData.config.footerIdGroup,
               btns:[
                  {
                     text:'关闭',
                     handler:function(data){
                        NetstarComponent.dialog[showDialogData.config.id].vueConfig.close();
                     }
                  }
               ]
            };
            vueButtonComponent.init(footerRightBtnJson);
         }
      };
      NetstarComponent.dialogComponent.init(dialogJson);
   }
   /****************模板逻辑方法 end******************************** */
   var tabFunc = {
      //新增
      add:function(data){
         var packageName = NetstarBlockList.configs[data.gridId].gridConfig.package;
        //var packageName = $(data.event.currentTarget).closest('.pt-tab-btns').attr('ns-template-package');
        var templateConfig = NetstarTemplate.templates.configs[packageName];
        tabComponentFunc(templateConfig,'add',data.rowData,data.originalIndex);
      },
      //复制新增
      copyAdd:function(data){
         //var packageName = $(data.event.currentTarget).closest('.pt-tab-btns').attr('ns-template-package');
         var packageName = NetstarBlockList.configs[data.gridId].gridConfig.package;
         var templateConfig = NetstarTemplate.templates.configs[packageName];
         tabComponentFunc(templateConfig,'copyAdd',data.rowData,data.originalIndex);
      },
      //保存
      save:function(data){
         //var packageName = $(data.event.currentTarget).closest('.pt-tab-btns').attr('ns-template-package');
         var packageName = NetstarBlockList.configs[data.gridId].gridConfig.package;
         var templateConfig = NetstarTemplate.templates.configs[packageName];
         tabComponentFunc(templateConfig,'save');
      },
      //取消
      cancel:function(data){
         var packageName = NetstarBlockList.configs[data.gridId].gridConfig.package;
         //var packageName = $(data.event.currentTarget).closest('.pt-tab-btns').attr('ns-template-package');
         var templateConfig = NetstarTemplate.templates.configs[packageName];
         tabComponentFunc(templateConfig,'clear');
      },
      close:function(data){
         var packageName = NetstarBlockList.configs[data.gridId].gridConfig.package;
         var templateConfig = NetstarTemplate.templates.configs[packageName];
         var gArr = NetStarGrid.dataManager.getData(templateConfig.detailLeftComponent.id);
         if(gArr.length == 0){
            
         }else{
            nsConfirm('是否删除样品',function(res){
               if(res){
                 var packageName = NetstarBlockList.configs[data.gridId].gridConfig.package;
                 var templateConfig = NetstarTemplate.templates.configs[packageName];
                 
                 NetStarGrid.delRow(data.rowData, data.gridId, data.rowIndex);
        
                 //清空之后获取grid数据判断是否为空
                 //var gridDataArr = NetstarTemplate.commonFunc.list.getData(templateConfig.detailLeftComponent.id);
                 var gridDataArr = NetstarBlockList.configs[templateConfig.detailLeftComponent.id].vueObj.originalRows;
                 if(typeof(templateConfig.countFuncHandler)=='function'){
                    var feeTotalNum = 0;
                    var leftOriginalRows = NetstarBlockList.configs[templateConfig.detailLeftComponent.id].vueObj.originalRows;
                    for(var s=0; s<leftOriginalRows.length; s++){
                       if(typeof(leftOriginalRows[s].quoteTotal)=='number'){
                          feeTotalNum += leftOriginalRows[s].quoteTotal;
                       } 
                    }
                    fillValuesByVoId(templateConfig.mainComponent.id,{feeTotal:feeTotalNum});//给vo中的参考金额赋值
                    templateConfig.countFuncHandler(templateConfig);
                 }
                 
                 if(gridDataArr.length == 0){
                    //左侧数据为空 手动添加
                     var emptyData = {};
                     emptyData[templateConfig.detailLeftComponent.idField] = null;
                     emptyData['NETSTAR-TIMER'] = moment().format('x');
                     emptyData.netstarSelectedFlag = true;
                     NetstarBlockList.refreshDataById(templateConfig.detailLeftComponent.id,[emptyData]);
                     var fillValueData = {
                        'NETSTAR-TIMER':emptyData['NETSTAR-TIMER']
                     };
                     for(var componentId in templateConfig.tabConfig.components){
                        var componentData = templateConfig.tabConfig.components[componentId];
                        switch(componentData.type){
                           case 'vo':
                              NetstarTemplate.commonFunc.vo.clearValues(componentId,false);
                              NetstarTemplate.commonFunc.vo.fillValues(fillValueData,componentId);
                              break;
                           case 'list':
                              NetStarGrid.refreshDataById(componentId,[]);   
                              break;
                        }
                     }
                 }

                 if(gridDataArr.length == 1){
                    var fillValueData = gridDataArr[0];
                    for(var componentId in templateConfig.tabConfig.components){
                       var componentData = templateConfig.tabConfig.components[componentId];
                       switch(componentData.type){
                          case 'vo':
                          NetstarTemplate.commonFunc.vo.clearValues(componentId,false);
                          NetstarTemplate.commonFunc.vo.fillValues(fillValueData,componentId);
                          break;
                       case 'list':
                          var listArray = fillValueData[componentData.keyField];
                          if(!$.isArray(listArray)){
                             listArray = [];
                          }
                          NetStarGrid.refreshDataById(componentId,listArray);   
                          break;
                       }
                    }
                 }
              }
           },'warning');
         }
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
         serverData:{},//服务端返回数据
         isUseBtnPanelManager:true,//默认使用按钮面板配置
      };
      $.each(defaultConfig, function (key, value) {
         _config[key] = value;
      });
      _config.tabConfig.btnConfig = {
         id:_config.id+'-btns-'+_config.components.length,
         field:[
            {
               text:'新增',
               handler:tabFunc.add,
               disabled:_config.readonly,
               defaultMode:'add',
               functionConfig:{
                  icon:'icon-add'
               }
            },{
               text:'复制新增',
               handler:tabFunc.copyAdd,
               disabled:_config.readonly,
               defaultMode:'copyadd',
               functionConfig:{
                  icon:'icon-copy',
               }
            },{
               text:'关闭',
               handler:tabFunc.close,
               disabled:_config.readonly,
               defaultMode:'close',
               functionConfig:{
                  icon:'icon-close',
               }
            }/*,{
               text:'确定',
               handler:tabFunc.save,
               disabled:_config.readonly,
               defaultMode:'confirm',
            }{
               text:'取消',
               handler:tabFunc.cancel,
               disabled:_config.readonly
            }*/
         ]
      }
      //20191015针对如果存在草稿箱的配置参数修改
      var draftBox = typeof(_config.draftBox)=='object' ? _config.draftBox : {};
      var isUseDraftBox = typeof(draftBox.isUse)=='boolean' ? draftBox.isUse : false;
      var isUseSave = typeof(draftBox.isUseSave)=='boolean' ? draftBox.isUseSave : false;

      if(typeof(_config.btnKeyFieldJson.root)!='object'){
         _config.btnKeyFieldJson.root = {};
      }
      var outBtnsArr = _config.btnKeyFieldJson.root.outBtns;//根上的外部输出按钮
      if(!$.isArray(outBtnsArr)){outBtnsArr = [];}
      //使用草稿箱
      if(isUseDraftBox && isUseSave){
         //两者皆为true 需要配置草稿箱
         // 按钮都存储在了btnKeyFieldJson配置参数上并且根据组件输出位置进行了划分 草稿箱应该显示在主组件上也就是根上
         outBtnsArr.push({
            btn:{
               text : '保存草稿',
               isReturn : true,
               handler : (function(__config){
                  return function(){
                     NetstarTemplate.draft.btnManager.save(__config);
                  }
               })(_config),
            },
            functionConfig : {
               englishName:'savedraft',
            },
         },{
            btn:{
               text : '草稿箱',
               isReturn : true,
               handler : (function(__config){
                  return function(){
                     NetstarTemplate.draft.btnManager.show(__config);
                  }
               })(_config),
            },
            functionConfig : {
               englishName:'draft',
            },
         });
         NetstarTemplate.draft.setConfig(_config);//设置草稿箱相关参数
      }
      //是否配置了保存为模板
      var isSaveToTemplate = typeof(_config.isSaveToTemplate)=='boolean' ? _config.isSaveToTemplate : false;
      if(isSaveToTemplate){
         outBtnsArr.push(
            {
               btn:{
                  text:'保存项目模板',
                  handler:saveByTemplateModelHandler
               },
               functionConfig:{
                  englishName:'saveProjectModel',
                  field:[
                     {
                        "id": "sampleCateId",
                        "englishName": "sampleCateId",
                        "chineseName": "样品类别",
                        "variableType": "string",
                        "mindjetType": "treeSelect",
                        "isSet": "是",
                        "displayType": "all",
                        "gid": "5a5733dd-2c12-8db3-ff35-75bd8c22be22",
                        "voName": "sampleItemTemplateVO",
                        "className": "java.lang.Long",
                        "type": "treeSelect",
                        "label": "样品类别",
                        "rules": "",
                        "textField": "sampleCateName",
                        "valueField": "id",
                        "children": "children",
                        "level": 1,
                        "isMultiple": false,
                        "isTurnTree": false,
                        "method": "POST",
                        "dataSrc": "rows",
                        "data": "",
                        "contentType": "",
                        "disabled": false,
                        "hidden": false,
                        "isDistinct": false,
                        "suffix": "/sampleCate/getSampleCateTreeList",
                        "url": getRootPath()+"/sampleCate/getSampleCateTreeList",
                        "mindjetIndexState": 0,
                        "mindjetFieldPosition": "field"
                    },
                    {
                        "id": "templateName",
                        "englishName": "templateName",
                        "chineseName": "模版名称",
                        "variableType": "string",
                        "mindjetType": "text",
                        "isSet": "是",
                        "displayType": "all",
                        "gid": "36b671f7-3338-539d-5937-4622bd554466",
                        "voName": "sampleItemTemplateVO",
                        "className": "java.lang.String",
                        "type": "text",
                        "label": "模版名称",
                        "rules": "",
                        "moreRules": "",
                        "disabled": false,
                        "hidden": false,
                        "isDistinct": false,
                        "mindjetIndexState": 1,
                        "mindjetFieldPosition": "field"
                    },
                    {
                        "id": "isPublic",
                        "englishName": "isPublic",
                        "chineseName": "是否共有",
                        "variableType": "string",
                        "mindjetType": "radio",
                        "isSet": "是",
                        "displayType": "all",
                        "gid": "96061583-8809-b7c7-b6af-680216db71d3",
                        "voName": "sampleItemTemplateVO",
                        "className": "java.lang.Long",
                        "type": "radio",
                        "label": "是否共有",
                        "rules": "",
                        "subdata": [
                            {
                                "isDisabled": false,
                                "value": "否",
                                "id": "0",
                                "isChecked": true
                            },
                            {
                                "isDisabled": false,
                                "value": "是",
                                "id": "1",
                                "isChecked": false
                            }
                        ],
                        "textField": "value",
                        "valueField": "id",
                        "mindjetIndexState": 2,
                        "mindjetFieldPosition": "field"
                    },
                    {
                        "englishName": "testItemIds",
                        "className": "java.lang.String",
                        "gid": "48bb536e-c2f9-61d0-c0c3-1d6aeab8102b",
                        "variableType": "string",
                        "chineseName": "项目ids",
                        "isHaveChineseName": true,
                        "id": "testItemIds",
                        "label": "项目ids",
                        "type": "text",
                        "field": "testItemIds",
                        "title": "项目ids",
                        "mindjetIndexState": 3,
                        "mindjetFieldPosition": "field",
                        "hidden": true
                    },
                  ],
                  parameterFormat:{
                     "testItemIds":"{sampleItemList.itemId}",
                  },
                  saveAjax:{
                     src:getRootPath()+'/itemTemplates/save',
                     type:'post',
                     contentType:'application/json; charset=utf-8'
                  }
               }
            },{
               btn:{
                  text:'导入项目模板',
                  handler:importByTemplateModelHandler
               },
               functionConfig:{
                  englishName:'importProjectModel',
                  field:[
                     {
                         "englishName": "sampleCateId",
                         "chineseName": "样品类别",
                         "variableType": "string",
                         "field": "sampleCateId",
                         "title": "样品类别",
                         "mindjetType": "treeSelect",
                         "isSet": "是",
                         "displayType": "all",
                         "gid": "5a5733dd-2c12-8db3-ff35-75bd8c22be22",
                         "voName": "sampleItemTemplateVO",
                         "editConfig": {
                             "id": "sampleCateId",
                             "englishName": "sampleCateId",
                             "chineseName": "样品类别",
                             "variableType": "string",
                             "mindjetType": "treeSelect",
                             "isSet": "是",
                             "displayType": "all",
                             "gid": "5a5733dd-2c12-8db3-ff35-75bd8c22be22",
                             "voName": "sampleItemTemplateVO",
                             "className": "java.lang.Long",
                             "type": "treeSelect",
                             "label": "样品类别",
                             "textField": "sampleCateName",
                             "valueField": "id",
                             "children": "children",
                             "level": 1,
                             "isMultiple": false,
                             "isTurnTree": false,
                             "method": "POST",
                             "dataSrc": "rows",
                             "disabled": false,
                             "hidden": false,
                             "isDistinct": false,
                             "suffix": "/sampleCate/getSampleCateTreeList",
                             "url": getRootPath()+"/sampleCate/getSampleCateTreeList"
                         },
                         "editable": false,
                         "hidden": false,
                         "orderable": true,
                         "searchable": true,
                         "tooltip": false,
                         "isDefaultSubdataText": true,
                         "formatHandler": {
                             "type": "renderField",
                             "data": "{{sampleCateName}}"
                         },
                         "columnType": "renderField",
                         "mindjetIndexState": 0,
                         "width": 200
                     },
                     {
                         "englishName": "templateName",
                         "chineseName": "模版名称",
                         "variableType": "string",
                         "field": "templateName",
                         "title": "模版名称",
                         "mindjetType": "text",
                         "isSet": "是",
                         "displayType": "all",
                         "gid": "36b671f7-3338-539d-5937-4622bd554466",
                         "voName": "sampleItemTemplateVO",
                         "editConfig": {
                             "id": "templateName",
                             "englishName": "templateName",
                             "chineseName": "模版名称",
                             "variableType": "string",
                             "mindjetType": "text",
                             "isSet": "是",
                             "displayType": "all",
                             "gid": "36b671f7-3338-539d-5937-4622bd554466",
                             "voName": "sampleItemTemplateVO",
                             "className": "java.lang.String",
                             "type": "text",
                             "label": "模版名称",
                             "disabled": false,
                             "hidden": false,
                             "isDistinct": false
                         },
                         "editable": false,
                         "hidden": false,
                         "orderable": true,
                         "searchable": true,
                         "tooltip": false,
                         "isDefaultSubdataText": true,
                         "mindjetIndexState": 1,
                         "width": 200
                     },
                     {
                         "englishName": "isPublic",
                         "chineseName": "是否共有",
                         "variableType": "string",
                         "field": "isPublic",
                         "title": "是否共有",
                         "mindjetType": "radio",
                         "isSet": "是",
                         "displayType": "all",
                         "gid": "96061583-8809-b7c7-b6af-680216db71d3",
                         "voName": "sampleItemTemplateVO",
                         "editConfig": {
                             "id": "isPublic",
                             "englishName": "isPublic",
                             "chineseName": "是否共有",
                             "variableType": "string",
                             "mindjetType": "radio",
                             "isSet": "是",
                             "displayType": "all",
                             "gid": "96061583-8809-b7c7-b6af-680216db71d3",
                             "voName": "sampleItemTemplateVO",
                             "className": "java.lang.Long",
                             "type": "radio",
                             "label": "是否共有",
                             "subdata": [
                                 {
                                     "isDisabled": false,
                                     "value": "否",
                                     "id": "0",
                                     "isChecked": true
                                 },
                                 {
                                     "isDisabled": false,
                                     "value": "是",
                                     "id": "1",
                                     "isChecked": false
                                 }
                             ],
                             "textField": "value",
                             "valueField": "id"
                         },
                         "mindjetIndexState": 2,
                         "width": 200
                     },
                     {
                         "englishName": "testItemIds",
                         "className": "java.lang.String",
                         "gid": "48bb536e-c2f9-61d0-c0c3-1d6aeab8102b",
                         "variableType": "string",
                         "chineseName": "项目ids",
                         "isHaveChineseName": true,
                         "id": "testItemIds",
                         "label": "项目ids",
                         "type": "text",
                         "field": "testItemIds",
                         "title": "项目ids",
                         "editConfig": {
                             "type": "text",
                             "formSource": "table",
                             "templateName": "PC",
                             "variableType": "string"
                         },
                         "mindjetIndexState": 3,
                         "width": 200,
                         "hidden": true
                     },
                     {
                         "englishName": "id",
                         "className": "java.lang.Long",
                         "gid": "3e3f6169-e381-73b6-01ea-1fe5d4329aa5",
                         "variableType": "string",
                         "chineseName": "id",
                         "isHaveChineseName": false,
                         "id": "id",
                         "label": "id",
                         "type": "text",
                         "field": "id",
                         "title": "id",
                         "editConfig": {
                             "type": "text",
                             "formSource": "table",
                             "templateName": "PC",
                             "variableType": "string"
                         },
                         "mindjetIndexState": 4,
                         "width": 200,
                         "hidden": true
                     },
                     {
                         "englishName": "itemQuatity",
                         "className": "java.lang.Long",
                         "gid": "a3cb2543-b2ad-ffeb-976b-df8fc40f5db4",
                         "variableType": "string",
                         "chineseName": "项目数量",
                         "isHaveChineseName": true,
                         "id": "itemQuatity",
                         "label": "项目数量",
                         "type": "text",
                         "field": "itemQuatity",
                         "title": "项目数量",
                         "editConfig": {
                             "type": "text",
                             "formSource": "table",
                             "templateName": "PC",
                             "variableType": "string"
                         },
                         "mindjetIndexState": 5,
                         "width": 200
                     },
                     {
                         "englishName": "createdBy",
                         "chineseName": "创建人",
                         "variableType": "string",
                         "field": "createdBy",
                         "title": "创建人",
                         "mindjetType": "select",
                         "isSet": "是",
                         "displayType": "all",
                         "gid": "35ba7b39-c968-1f5f-6feb-422884fa0c84",
                         "voName": "sampleItemTemplateVO",
                         "editConfig": {
                             "id": "createdBy",
                             "englishName": "createdBy",
                             "chineseName": "创建人",
                             "variableType": "string",
                             "mindjetType": "select",
                             "isSet": "是",
                             "displayType": "all",
                             "gid": "35ba7b39-c968-1f5f-6feb-422884fa0c84",
                             "voName": "sampleItemTemplateVO",
                             "className": "java.lang.Long",
                             "type": "select",
                             "label": "创建人",
                             "textField": "userName",
                             "valueField": "id",
                             "isObjectValue": false,
                             "method": "POST",
                             "dataSrc": "rows",
                             "suffix": "/system/users/getList",
                             "url": getRootPath()+"/system/users/getList"
                         },
                         "mindjetIndexState": 6,
                         "width": 200
                     }
                  ],
                  idField:'id',
                  ajax:{
                     src:getRootPath()+'/itemTemplates/getList',
                     type:'post',
                     contentType:'application/json; charset=utf-8',
                     dataSrc:'rows',
                  }
               }
            }
         );
      }
      /*$.each(_config.components, function (index, item) {
         switch(item.type){
            case 'btns':
               if(_config.draftBox && _config.draftBox.isUse == true){
                  if(_config.draftBox.isUseSave){
                     var draftBoxSaveBtn = {
                        btn : {
                           text : '保存草稿',
                           isReturn : true,
                           handler : (function(__config){
                              return function(){
                                 NetstarTemplate.draft.btnManager.save(__config);
                              }
                           })(_config),
                        },
                        functionConfig : {},
                     }
                     item.field.push(draftBoxSaveBtn);
                  }
                  var draftBoxBtn = {
                     btn : {
                        text : '草稿箱',
                        isReturn : true,
                        handler : (function(__config){
                           return function(){
                              NetstarTemplate.draft.btnManager.show(__config);
                           }
                        })(_config),
                     },
                     functionConfig : {},
                  }
                  item.field.push(draftBoxBtn);
               }
               break;
         }
      });
      NetstarTemplate.draft.setConfig(_config); // 设置草稿箱相关参数*/
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
      var tabWidth = $('#'+id).outerWidth();
      $('#'+id+' .pt-tab-body').css('width',tabWidth);
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

   //只给vo组件赋值
   function fillValuesByVo(_config,valueData){
      var componentData = _config.componentsConfig.vo; 
      for(var voId in componentData){
         var voConfig = componentData[voId];
         if(voConfig.position){
            NetstarTemplate.commonFunc.vo.clearValues(voConfig.id,false);//先清空再赋值
            fillValuesByVoId(voConfig.id,valueData);
         }
      }
   }

   //赋值
   function initComponentByFillValues(_config){
      for(var componentType in _config.componentsConfig){
         var componentData = _config.componentsConfig[componentType];
         switch(componentType){
            case 'vo':
               for(var voId in componentData){
                  var isRoot = true;
                  var voConfig = componentData[voId];
                  if(voConfig.parent){
                     if(voConfig.parent != 'root'){
                        isRoot = false;
                     }
                  }
                  if(isRoot){
                     fillValuesByVoId(voId,_config.serverData);
                  }else{
                     fillValuesByVoId(voId,_config.serverData[voConfig.parent][0]);
                  }
               }
               break;
            case 'list':
               for(var listId in componentData){
                  var listConfig = componentData[listId];
                  // NetStarGrid.refreshDataById(listId,_config.serverData[listConfig.keyField]);
                  // lyw 20191011 需要判断父级是否是root不是需要根据父级查找
                  var _data = [];
                  if(listConfig.parent == "root"){
                     _data = _config.serverData[listConfig.keyField];
                  }else{
                     if(listConfig.parent !='root'){
                        if($.isArray(_config.serverData[listConfig.parent])){
                           if(_config.serverData[listConfig.parent].length > 0){
                              _data = _config.serverData[listConfig.parent][0][listConfig.keyField];
                           }
                        }
                     }
                  }
                  if(!$.isArray(_data)){_data = [];}
                  NetStarGrid.refreshDataById(listId, _data);
               }
               break;
            case 'blockList':
               for(var blockListId in componentData){
                  var blockListConfig = componentData[blockListId];
                  clearQueryValConfig(blockListConfig);
                  NetstarBlockList.refreshDataById(blockListId,_config.serverData[blockListConfig.keyField]);
               }
               break;
         }
      }
   }
   function setMainGridQueryTableHtml(gridConfig){
		var contidionHtml = '';
		var quickqueryHtml = '';
		var id = 'query-'+gridConfig.id;
		//if(gridConfig.ui.query){
			quickqueryHtml = '<div class="pt-panel-col limsreg-blocklist-query" id="'+id+'">'
								
							+'</div>';
		//}
		if(quickqueryHtml){
			contidionHtml = '<div class="pt-container">'
								+'<div class="pt-panel-row">'
									+quickqueryHtml
								+'</div>'
							+'</div>';
		}
		contidionHtml = '<div class="pt-panel pt-grid-header limsreg-blocklist">'		
							+contidionHtml
						+'</div>';
		$('#'+gridConfig.id).prepend(contidionHtml);
	}
	function mainGridQuickqueryInit(gridConfig){
		var queryConfig = gridConfig.ui.query;
		//queryConfig.queryForm[0].inputWidth = 60;
		//queryConfig.queryForm[1].inputWidth = 60;
		var formJson = {
			form:[
            {
               id:'keyword',
               type:'text',
               placeHolder:'请输入查询',
               inputWidth:200,
               label:'查询'
            }
         ],
			id:'query-'+gridConfig.id,
			formStyle:'pt-form-normal',
			plusClass:'pt-custom-query',
			isSetMore:false
		};
		function customFilterRefreshBtnHandler(event){
         var $this = $(this);
         var formID = $this.attr('containerid');//获取vo的id
         var gridId = $this.attr('ns-gridid');//获取list的id
         var originalListData = getListData(gridId);//list的数据
         var listData = $.extend(true,[],originalListData);
         var formJson = NetstarComponent.getValues(formID);//vo的数据
         var columnById = NetstarBlockList.configs[gridId].gridConfig.columnById;

         if(!$.isArray(listData)){listData = [];}

         var searchRowArray = [];
         var hideTr = [];
         if(listData.length > 0 && formJson.keyword){
            //如果列表存在数据并且存在检索条件
            searchRowArray = [];
            for(var rowI=0; rowI<listData.length; rowI++){
               var rowData = listData[rowI];
               var isContinue = true;
               for(var colI in columnById){
                  if(typeof(rowData[colI])=='string'){
                     //当前为文本
                     if(rowData[colI].indexOf(formJson.keyword)>-1){
                        isContinue = false; //当前列存在关键词
                        searchRowArray.push(rowI);
                        break;
                     }
                  }
               }
               if(isContinue == false){
                  // searchRowArray.push(rowData);
               }
            }
            if(searchRowArray.length == 0){
               var listExpression = NetstarBlockList.configs[gridId].gridConfig.ui.listExpression;
               var rex1 = /\{\{(.*?)\}\}/g;
               var rex2 = /\{\{(.*?)\}\}/;
               if(rex2.test(listExpression)){
                  var strArr = listExpression.match(rex1);
                  for(var rowI=0; rowI<listData.length; rowI++){
                     var rowData = listData[rowI];
                     var isContinue = true;
                     
                     for(var i=0; i<strArr.length; i++){
                        var field = strArr[i].substring(2,strArr[i].lastIndexOf('}')-1);
                        if(typeof(rowData[field])=='string'){
                           if(rowData[field].indexOf(formJson.keyword)>-1){
                              isContinue = false;
                              break;
                           }
                        }else if(typeof(rowData[field])=='number'){
                           if(rowData[field] == Number(formJson.keyword)){
                              isContinue = false;
                              break;
                           }
                        }
                     }
                     if(isContinue == false){
                        // searchRowArray.push(rowData);
                        searchRowArray.push(rowI);
                     }
                  }
               }
            }
            for(var i=0; i<listData.length; i++){
               if(searchRowArray.indexOf(i) == -1){
                  hideTr.push(i);
               }
            }
         }else{
            searchRowArray = store.get('cache-'+gridId);
         }
         // NetstarBlockList.refreshDataById(gridId,searchRowArray);
         NetstarBlockList.refreshDataByIdAndHideTr(gridId,listData,hideTr);
		}
		formJson.completeHandler = function(obj){
			var buttonHtml = '<div class="pt-btn-group">'
							+'<button type="button" class="pt-btn pt-btn-default pt-btn-icon" nstype="refresh" ns-gridid="'+gridConfig.id+'" ns-package="'+gridConfig.package+'" containerid="'+formJson.id+'"><i class="icon-search"></i></button>'
						+'</div>';
			var $container = $('#'+formJson.id);
			$container.append(buttonHtml);
			$('button[containerid="'+formJson.id+'"]').off('click',customFilterRefreshBtnHandler);
			$('button[containerid="'+formJson.id+'"]').on('click',customFilterRefreshBtnHandler);
		}
		var component2 = NetstarComponent.formComponent.getFormConfig(formJson);
		NetstarComponent.formComponent.init(component2,formJson);
	}
   function blockListCompleteHandler(_configs){
      var gridConfig = _configs.gridConfig;
		setMainGridQueryTableHtml(gridConfig);
		mainGridQuickqueryInit(gridConfig);
   }
   function commonChangeHandlerByTabVo(data){
      //自动给左侧添加数据  需要区分当前是添加还是修改
      var formConfig = data.config;
      var templateId = formConfig.formID.substring(0,formConfig.formID.indexOf('-vo'));
      var packageName = NetstarTemplate.templates.limsReg.data[templateId].config.package;
      var templateConfig = NetstarTemplate.templates.configs[packageName];
      //var leftListData = getListData(templateConfig.detailLeftComponent.id);
      NetstarComponent.getValues(formConfig.formID);
      var formData = NetstarComponent.getValues(formConfig.formID, false);
      if(formData['NETSTAR-TIMER']){
         tabComponentFunc(templateConfig,'save', false, false, false);
      }else{
         
      }
   }

   function tabListDrawHandler(data){
      var gridId = data.domParams.container.id;
      var formId =  $(data.$el).parent().prev().children('.pt-tab-components').attr('id');
      if($('#'+formId).length > 0){
         var gridConfig = NetStarGrid.configs[data.$options.id].gridConfig;
         var templateConfig = NetstarTemplate.templates.configs[gridConfig.package];
         if(data.originalRows.length >0){
            var originalRows = [];
            switch(templateConfig.detailLeftComponent.type){
               case 'list':
                  originalRows = NetStarGrid.configs[templateConfig.detailLeftComponent.id].vueObj.originalRows;
                  break;
               case 'blockList':
                  originalRows = NetstarBlockList.configs[templateConfig.detailLeftComponent.id].vueObj.originalRows;
                  break;
            }
            var tabConfig = templateConfig.tabConfig;
            var listKeyField = '';
            var voData = {};
            var voId = '';
            for(var componentI in tabConfig.components){
               if(tabConfig.components[componentI].type == 'vo'){
                  voId = tabConfig.components[componentI].id;
                  voData = NetstarTemplate.commonFunc.vo.getData(tabConfig.components[componentI].id,false);
               }else if(tabConfig.components[componentI].type == 'list'){
                  if(tabConfig.components[componentI].id == gridId){
                     // 获取当前操作的表格keyField
                     listKeyField = tabConfig.components[componentI].keyField;
                  }
               }
            }
            var existIndex = -1;
            for(var e=0; e<originalRows.length; e++){
               if(originalRows[e]['NETSTAR-TIMER'] == voData['NETSTAR-TIMER']){
                  existIndex = e;
                  break;
               }
            }
            if(existIndex>-1){
               originalRows[existIndex][listKeyField] = data.originalRows;
            }
            if(templateConfig.pageExpression){
               var feeTotalNum = 0;
               for(var s=0; s<originalRows.length; s++){
                  if(existIndex != s){
                     if(typeof(originalRows[s].quoteTotal)=='number'){
                        feeTotalNum += originalRows[s].quoteTotal;
                     } 
                  }
               }
               //找到报价金额计算报价金额的总和
               var levelByPageExpression = NetstarTemplate.getLevelByPageExpression(templateConfig);
               var mainVoData = NetstarComponent.getValues(templateConfig.mainComponent.id,false);
               var quoteTotalNum = 0;
               var totalAfterDiscountNum = 0; 
               var discount = typeof(mainVoData.discount)=='number' ? mainVoData.discount : 0;
               var feeAfterCount = typeof(mainVoData.feeAfterCount)=='number' ? mainVoData.feeAfterCount : 0;

               for(var q=0; q<data.originalRows.length; q++){
                  var rData = data.originalRows[q];
                  if(typeof(rData.quoteTotal)=='number'){
                     quoteTotalNum += rData.quoteTotal;
                  } 
               }
               feeTotalNum += quoteTotalNum;

               for(var d=0; d<data.originalRows.length; d++){
                  var rData = data.originalRows[d];
                  if(typeof(rData.quoteTotal)=='number'){
                     if(discount > 0){
                        //rData.totalAfterDiscount = parseFloat(rData.quoteTotal*discount).toFixed(2);
                        //rData.totalAfterDiscount = parseFloat(rData.totalAfterDiscount);

                        rData.totalAfterDiscount = parseFloat(feeAfterCount/feeTotalNum*rData.quoteTotal).toFixed(2);
                        rData.totalAfterDiscount = Number(rData.totalAfterDiscount);
                     }else{
                        rData.totalAfterDiscount = rData.quoteTotal;
                     }
                     totalAfterDiscountNum += rData.totalAfterDiscount;
                     data.rows[d].totalAfterDiscount = '￥'+rData.totalAfterDiscount;
                  } 
               }
               originalRows[existIndex].quoteTotal = quoteTotalNum;//给左侧表格赋值
               fillValuesByVoId(voId,{quoteTotal:quoteTotalNum,totalAfterDiscount:totalAfterDiscountNum});//给vo中的报价赋值
               
               
               fillValuesByVoId(templateConfig.mainComponent.id,{feeTotal:feeTotalNum});//给vo中的参考金额赋值
               if(feeTotalNum > 0){
                  if(typeof(templateConfig.countFuncHandler)=='function'){
                     templateConfig.countFuncHandler(templateConfig);
                  }
               }
            }
           // tabComponentFunc(templateConfig,'save');
         }
      }else{

      }
   }

   //组件化分别调用方法
   function initComponentInit(_config){
      $('#'+_config.id+' .pt-container-loading').remove();
      $('#'+_config.id+' .pt-template-limsreg-detail-right').removeClass('hide');
      //如果没有左侧BLOCK列表，则产生一个空数据，包含时间戳和id
      if($.isEmptyObject(_config.serverData) == true){
         var emputyData = {};
         emputyData[_config.detailLeftComponent.idField] = null;
         emputyData['NETSTAR-TIMER'] = moment().format('x');
         emputyData.objectState = 1;
         emputyData.netstarSelectedFlag = true;
         //componentData[_config.detailLeftComponent.id].dataSource = [emputyData];
         _config.serverData[_config.detailLeftComponent.keyField] = [emputyData];
         
      }
      if(_config.detailLeftComponent.type == 'blockList'){
         //左侧宽度需要是固定的
         $('.pt-template-limsreg-detail-left').parent().removeClass('limsreg-left');
      }
      for(var componentType in _config.componentsConfig){
         var componentData = _config.componentsConfig[componentType];
         switch(componentType){
            case 'vo':
               for(var voI in componentData){
                  if(componentData[voI].parent){
                     if(componentData[voI].parent !='root'){
                        componentData[voI].height = height;
                     }
                  }
               }
               NetstarTemplate.commonFunc.vo.initVo(componentData,_config);
               break;
            case 'list':
               //如果主表是vo减去vo的高度
               var height = _config.templateCommonHeight;
               if(_config.mainComponent.type == 'vo'){
                  if($('#'+_config.mainComponent.id).length > 0){
                     height = height - $('#'+_config.mainComponent.id).outerHeight() - 54 - 38;
                  }
               }
               for(var listI in componentData){
                  if(typeof(componentData[listI].params)!='object'){
                     componentData[listI].params = {};
                  }
                  componentData[listI].params.height = height;
                  componentData[listI].params.isPage = false;
               }
               NetstarTemplate.commonFunc.list.initList(componentData,_config);
               break;
            case 'blockList':
               //如果主表是vo减去vo的高度
               var height = _config.templateCommonHeight;
               if(_config.mainComponent.type == 'vo'){
                  if($('#'+_config.mainComponent.id).length > 0){
                     height = height -$('#'+_config.mainComponent.id).outerHeight() - 54 - 38;
                  }
               }
               
               if(componentData[_config.detailLeftComponent.id]){
                  if(typeof(componentData[_config.detailLeftComponent.id].params)!='object'){
                     componentData[_config.detailLeftComponent.id].params = {};
                  }
                 // componentData[_config.detailLeftComponent.id].params.defaultSelectedIndex = 0;
                  //componentData[_config.detailLeftComponent.id].params.isHaveEditDeleteBtn = true;
                  componentData[_config.detailLeftComponent.id].params.height = height;
                  componentData[_config.detailLeftComponent.id].params.completeHandler = blockListCompleteHandler;
                  componentData[_config.detailLeftComponent.id].params.query = NetStarUtils.getListQueryData(componentData[_config.detailLeftComponent.id].field,{id:'query-'+_config.detailLeftComponent.id,value:''}),
                  componentData[_config.detailLeftComponent.id].params.tableRowBtns = _config.tabConfig.btnConfig.field;
               }
               NetstarTemplate.commonFunc.blockList.initBlockList(componentData,_config);
               break;
            case 'btns':
               NetstarTemplate.commonFunc.btns.initBtns(componentData,_config);
               break;
            case 'tab':
               var height = _config.templateCommonHeight;
               if(_config.mainComponent.type == 'vo'){
                  if($('#'+_config.mainComponent.id).length > 0){
                     height = height - $('#'+_config.mainComponent.id).outerHeight() - 54 - 38;
                  }
               }
               
               for(var tabI in _config.tabConfig.components){
                  $('#'+tabI).attr('style','height:'+height+'px');
               }
               initTab(componentData,_config);
               //initTabBtns(_config);
               break;
         }
      }

      for(var tabI in _config.tabConfig.components){
         switch(_config.tabConfig.components[tabI].type){
            case 'vo':
               var height = $("#"+tabI).outerHeight();
               $("#"+tabI).children().attr('style','min-height:'+height+'px');
               break;
         }
      }
   }
   //追加html
   function appendHtmlByHtmlArray(_htmlArray,className,_config){
      for(var htmlI=0; htmlI<_htmlArray.length; htmlI++){
         var componentHtml = _htmlArray[htmlI];
         $('#'+_config.id).find('.'+className).append(componentHtml);
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
      // var $container = $('container');
		// if($container.length > 0){
		// 	$container = $('container:last');
		// }
      var $container = $('container').not('.hidden');
		if($container.length > 0){
			$container = $container.eq($container.length-1);
		}
      var detailHtml = '<div class="pt-main-col limsreg-left">'
                           +'<div class="pt-template-limsreg-detail-left"></div>'
                        +'</div>'
                        +'<div class="pt-main-col limsreg-right">'
                           +'<div class="pt-template-limsreg-detail-right hide"></div>'
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

      var loadingHtml = '<div class="pt-container-loading"></div>';

      var html = loadingHtml+'<div class="pt-main limsreg '+templateClassStr+' '+_config.mode+'" id="'+_config.id+'" ns-package="'+ _config.package +'">'
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
      var rootBtnHtml = '';
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
              // _config.idFieldsNames['root.'+componentData.idField] = componentData.idField;//主键id
              _config.idFieldsNames['root'] = componentData.idField;//主键id
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
            case 'list':
               componentData.isEditMode = true;
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
            if(componentData.type == 'btns'){
                  rootBtnHtml = '<div class="pt-panel-col '+positionClassStr+'">'
                                    +componentTitleHtml
                                    +'<div id="'+componentData.id+'" class="nav-form" ns-componenttype="btns" ns-template-package="'+_config.package+'">'
                                    +'</div>'
                                    +componentBtnHtml
                                 +'</div>';
            }else{
               mainHtmlArray.push(componentHtml);
            }
         }else{
            if(isOutTab){
               //tab输出
               switch(componentData.type){
                  case 'list':
                     if(typeof(componentData.params)!='object'){
                        componentData.params = {};
                     }
                     if(!_config.readonly){
                        componentData.params.drawHandler = tabListDrawHandler;
                     }
                     componentData.getPageDataFunc = (function(_config){
								return function (data) {
								   return NetstarTemplate.templates[_config.template].getPageData(_config,false);
								}
							 })(_config)
                     componentData.params.selectedHandler = function(data,vueobj,vueData,gridConfig,rowIndex){
                        //vueData.drawHandler = function(){}
                     }
                     _config.idFieldsNames['root.'+componentData.parent+'.'+componentData.keyField] = componentData.idField;
                     break;
                  case 'vo':
                     for(var fieldI=0; fieldI<componentData.field.length; fieldI++){
                        componentData.field[fieldI].commonChangeHandler = commonChangeHandlerByTabVo;
                     }
                     //手动添加一个时间戳隐藏字段 原因给左侧添加修改的时候作为判断依据
                     componentData.field.unshift({id:'NETSTAR-TIMER',type:'hidden'});
                     break;
               }
               _config.tabConfig.components[componentData.id] = componentData;
            }else{
               if(componentData.type != 'tab' && componentData.type != 'btns'){
                  //tab 本身不作为输出
                  _config.idFieldsNames['root.'+componentData.keyField] = componentData.idField;
                 // componentData.componentHeight = 570;
                  _config.detailLeftComponent = componentData;
                  detailHtmlArray.push(componentHtml);
               }
            }
         }
      }  
      if(mainHtmlArray.length > 0){
         appendHtmlByHtmlArray(mainHtmlArray,'pt-template-limsreg-main',_config);
         $('#'+_config.id+' .pt-template-limsreg-main .text-right').before(rootBtnHtml);
      }
      if(detailHtmlArray.length > 0){
         var className = 'pt-template-limsreg-detail-left';
         if(_config.mode == 'vertical'){
            className = 'pt-template-limsreg-detail';
         }
         appendHtmlByHtmlArray(detailHtmlArray,className,_config);
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
               //styleStr = 'style="height:520px;"';
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
                                    +'<div class="pt-tab-components-tabs pt-tab pt-tab-noboder" id="'+_config.tabConfig.id+'">'
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
        appendHtmlByHtmlArray([tabHtml],'pt-template-limsreg-detail-right',_config);
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
      if(!$.isEmptyObject(_config.getValueAjax)){
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
               var serverData = res[ajaxPlusData.dataSrc] ? res[ajaxPlusData.dataSrc] : {};
               serverData.objectState = NSSAVEDATAFLAG.EDIT;
               //因为右侧数据的编辑是根据左侧的时间戳走的，所以需要手动添加时间戳
               var detailLeftComponent = NetstarTemplate.templates.configs[ajaxPlusData.plusData.packageName].detailLeftComponent;
               if($.isArray(serverData[detailLeftComponent.keyField])){
                  for(var i=0; i<serverData[detailLeftComponent.keyField].length; i++){
                     var rowData = serverData[detailLeftComponent.keyField][i];
                     if(i==0){rowData.netstarSelectedFlag = true;}
                     rowData['NETSTAR-TIMER'] = moment().format('x')+i;
                  }
               }

               NetstarTemplate.templates.configs[ajaxPlusData.plusData.packageName].serverData = serverData;
               NetstarTemplate.templates.limsReg.data[ajaxPlusData.plusData.templateId].config.serverData = serverData;
               initComponentInit(NetstarTemplate.templates.configs[ajaxPlusData.plusData.packageName]);//组件化分别调用
              // initComponentByFillValues(NetstarTemplate.templates.configs[ajaxPlusData.plusData.packageName]);
            }else{
               nsalert('返回值false','error');
               initComponentInit(NetstarTemplate.templates.configs[ajaxPlusData.plusData.packageName]);
            }
         },true);
      }else{
         initComponentInit(_config);//组件化分别调用
      }
   }
   //根据配置刷新模板数据
   function refreshByConfig(_config){

   }
   // 赋值通过data
   function setValuesByData(_config, data){
      data = typeof(data) == "object" ? data : {};
      for(var componentType in _config.componentsConfig){
         var componentData = _config.componentsConfig[componentType];
         switch(componentType){
            case 'vo':
               for(var voId in componentData){
                  var isRoot = true;
                  var voConfig = componentData[voId];
                  if(voConfig.parent){
                     if(voConfig.parent != 'root'){
                        isRoot = false;
                     }
                  }
                  if(isRoot){
                     fillValuesByVoId(voId, data);
                  }else{
                     if(data[voConfig.parent] && data[voConfig.parent][0]){
                        fillValuesByVoId(voId, data[voConfig.parent][0]);
                     }
                  }
               }
               break;
            case 'list':
               for(var listId in componentData){
                  var listConfig = componentData[listId];
                  var _data = {};
                  if(listConfig.parent == "root"){
                     _data = data[listConfig.keyField];
                  }else{
                     if(listConfig.parent !='root'){
                        if($.isArray(_config.serverData[listConfig.parent])){
                           if(_config.serverData[listConfig.parent].length > 0){
                              _data = _config.serverData[listConfig.parent][0][listConfig.keyField];
                           }
                        }
                     }
                  }
                  if(!$.isArray(_data)){_data = [];}
                  NetStarGrid.refreshDataById(listId, _data);
               }
               break;
            case 'blockList':
               for(var blockListId in componentData){
                  var blockListConfig = componentData[blockListId];
                  if(data[blockListConfig.keyField]){
                     NetstarBlockList.refreshDataById(blockListId, data[blockListConfig.keyField]);
                  }
               }
               break;
         }
      }
   }
   // 根据草稿箱设置数据
   function setValueByDraft(value, _package){
      var tempalteConfig = NetstarTemplate.templates.configs[_package];
      setValuesByData(tempalteConfig, value);
   }
   // 清空查询
   function clearQueryValConfig(detailLeftComponent){
      NetstarComponent.clearValues('query-'+detailLeftComponent.id);
      NetstarBlockList.clearTrHideOrderConfig(detailLeftComponent.id);
   }
   return {
      init: init,
      dialogBeforeHandler:dialogBeforeHandler,
      ajaxBeforeHandler:ajaxBeforeHandler,
      ajaxAfterHandler:ajaxAfterHandler,
      refreshByConfig:refreshByConfig,
      getPageData:getPageData,
      VERSION: '0.0.1',						//版本号
      gridSelectedHandler:function(data,$data,_vueData,_gridConfig,rowIndex){
         //点击选中切换的时候延迟一秒触发
         var $appendContainer = $('#'+_gridConfig.id+' div[nsgirdpanel="grid-body"]').children('.pt-container');
         if($('.delay-model-panel').length == 1){
            $('.delay-model-panel').remove();
         }
         $appendContainer.prepend('<div class="delay-model-panel" style="background-color: rgba(0,0,0,0.1);bottom: 0;left: 0;top: 0;right: 0;position: absolute;z-index: 999;"></div>');
         setTimeout(function(){
            if($('.delay-model-panel').length == 1){
               $('.delay-model-panel').remove();
            }
         },1000);
         fillValuesTabByRowData(data,_gridConfig,rowIndex);
      },
      addValues:function(value,tempalteConfig,controllObj){
         var keyField = controllObj.targetField ? controllObj.targetField : '';
         var isRoot = true;
         if(keyField){
            if(keyField != 'root'){
               isRoot = false;
            }
         }
         var detailLeftComponent = tempalteConfig.detailLeftComponent;
         var detailLeftComponentDataArr = getListData(detailLeftComponent.id);
         var blockListSelectedIndex = 0;
         if(!$.isArray(detailLeftComponentDataArr)){
            detailLeftComponentDataArr = [];
         }
         clearQueryValConfig(detailLeftComponent);
         if(detailLeftComponentDataArr.length == 0){
            NetstarBlockList.configs[detailLeftComponent.id].vueObj.$data.rows = [];
            NetstarBlockList.configs[detailLeftComponent.id].vueObj.originalRows = [];
            NetstarBlockList.configs[detailLeftComponent.id].vueObj.rows = [];
         }else{
            //获取左侧列表选中值找到左侧选中值的下标位置在其之后新增数据
            var selectedDataByBlocklist = NetstarBlockList.getSelectedData(detailLeftComponent.id);
            if($.isArray(selectedDataByBlocklist)){
               if(selectedDataByBlocklist.length == 1){
                  var blockListArr = NetstarBlockList.configs[detailLeftComponent.id].vueObj.originalRows;
                  if(!$.isArray(blockListArr)){blockListArr = [];}
                  for(var b=0; b<blockListArr.length; b++){
                     if(blockListArr[b]['NETSTAR-TIMER'] == selectedDataByBlocklist[0]['NETSTAR-TIMER']){
                        blockListSelectedIndex = b;
                        break;
                     }
                  }
               }
            }
         }
         value = nsServerTools.setObjectStateData(value,1);//添加状态
         if(isRoot){
            //给list新增数据
            if($.isArray(value[detailLeftComponent.keyField])){
               var gridDataArr = value[detailLeftComponent.keyField];
               for(var rowI=gridDataArr.length; rowI--; rowI>=0){
                  gridDataArr[rowI]['NETSTAR-TIMER'] = moment().format('x')+rowI;//添加当前时间
                  NetStarGrid.addRow(gridDataArr[rowI],detailLeftComponent.id,(blockListSelectedIndex+1));
               }
               setTimeout(function(){
                  NetstarBlockList.configs[detailLeftComponent.id].vueObj.$data.rows[blockListSelectedIndex].netstarSelectedFlag = false;
                  NetstarBlockList.configs[detailLeftComponent.id].vueObj.$data.rows[blockListSelectedIndex+1].netstarSelectedFlag = true;
                  NetstarBlockList.configs[detailLeftComponent.id].vueObj.originalRows[blockListSelectedIndex].netstarSelectedFlag = false;
                  NetstarBlockList.configs[detailLeftComponent.id].vueObj.originalRows[blockListSelectedIndex+1].netstarSelectedFlag = true;
               },50)
               //给右侧tab中的grid赋值
               var components = tempalteConfig.tabConfig.components;
               var tabData = value[detailLeftComponent.keyField][0];
               if(typeof(tabData)=='undefined'){tabData = {};}
               for(var componentId in components){
                  switch(components[componentId].type){
                     case 'list':
                        var listArr = tabData[components[componentId].keyField];
                        if(!$.isArray(listArr)){listArr = [];}
                        NetStarGrid.refreshDataById(components[componentId].id, listArr);
                        break;
                     case 'vo':
                           NetstarTemplate.commonFunc.vo.clearValues(components[componentId].id,false);//先清空再赋值
                           fillValuesByVoId(components[componentId].id,tabData);
                           break;
                  }
               }
            }
            fillValuesByVo(tempalteConfig,value);//给vo组件赋值
         }else{
            if(keyField == tempalteConfig.detailLeftComponent.keyField){
               var valueData = value;
               if($.isArray(value[keyField])){
                  valueData = value[keyField];
               }
               if(!$.isArray(valueData)){
                  valueData = [];
               }
               for(var rowI=valueData.length; rowI--; rowI>=0){
                  valueData[rowI]['NETSTAR-TIMER'] = moment().format('x')+rowI;//添加当前时间
                  NetStarGrid.addRow(valueData[rowI],detailLeftComponent.id,(blockListSelectedIndex+1));
               }
               setTimeout(function(){
                  NetstarBlockList.configs[detailLeftComponent.id].vueObj.$data.rows[blockListSelectedIndex].netstarSelectedFlag = false;
                  NetstarBlockList.configs[detailLeftComponent.id].vueObj.$data.rows[blockListSelectedIndex+1].netstarSelectedFlag = true;
                  NetstarBlockList.configs[detailLeftComponent.id].vueObj.originalRows[blockListSelectedIndex].netstarSelectedFlag = false;
                  NetstarBlockList.configs[detailLeftComponent.id].vueObj.originalRows[blockListSelectedIndex+1].netstarSelectedFlag = true;
               },50)
               //给右侧tab中的grid赋值
               var components = tempalteConfig.tabConfig.components;
               var tabData = valueData[0];
               if(typeof(tabData)=='undefined'){tabData = {};}
               for(var componentId in components){
                  switch(components[componentId].type){
                     case 'list':
                        var listArr = tabData[components[componentId].keyField];
                        if(!$.isArray(listArr)){listArr = [];}
                        NetStarGrid.refreshDataById(components[componentId].id, listArr);
                        break;
                     case 'vo':
                        NetstarTemplate.commonFunc.vo.clearValues(components[componentId].id,false);//先清空再赋值
                        fillValuesByVoId(components[componentId].id,tabData);
                        break;
                  }
               }
            }  
         }
      },
      fillValues:function(value,tempalteConfig,controllObj){
         var keyField = controllObj.targetField ? controllObj.targetField : '';
         var isRoot = true;
         if(keyField){
            if(keyField != 'root'){
               isRoot = false;
            }
         }
         if(isRoot){
            tempalteConfig.serverData = value;
            initComponentByFillValues(tempalteConfig);
         }else{
            if(keyField == tempalteConfig.detailLeftComponent.keyField){
               var valueData = value;
               if($.isArray(value[keyField])){
                  valueData = value[keyField];
               }
               if(!$.isArray(valueData)){
                  valueData = [];
               }
               NetstarBlockList.refreshDataById(tempalteConfig.detailLeftComponent.id,valueData);
               if(valueData[0]){
                  tabComponentFunc(tempalteConfig,'refresh',valueData[0]);
               }else{
                  tabComponentFunc(tempalteConfig,'clear');
               }
            }  
         }
      },
      setValueByDraft : setValueByDraft,
      tabComponentFunc:tabComponentFunc,
      clearByAll:function(_config){
         var voIdArr = [];
         for(var componentType in _config.componentsConfig){
            var componentData = _config.componentsConfig[componentType];
            switch(componentType){
               case 'blockList':
                  var emptyData = {};
                  emptyData[_config.detailLeftComponent.idField] = null;
                  emptyData['NETSTAR-TIMER'] = moment().format('x');
                  emptyData.netstarSelectedFlag = true;
                  NetstarBlockList.refreshDataById(_config.detailLeftComponent.id,[emptyData]);
                  break;
               case 'vo':
                  for(var voId in componentData){
                     voIdArr.push(voId);
                  }
                  clearVoData(voIdArr);
                  break;
               case 'list':
                  var listIdArr = [];
                  for(var lisId in componentData){
                     listIdArr.push(lisId);
                  }
                  clearListData(listIdArr);
                  break;
            }
         }
         setTimeout(function(){
            var fillValueData = {
               'NETSTAR-TIMER':NetstarBlockList.configs[_config.detailLeftComponent.id].vueObj.originalRows[0]["NETSTAR-TIMER"]
            };
            NetstarTemplate.commonFunc.vo.fillValues(fillValueData,voIdArr[voIdArr.length-1]);
         },100)
      },
      fillValuesByVoId:fillValuesByVoId,
      refreshByPackage:function(data){
         /*data object 接受参
               * idField 主键id
               *package 包名
               *templateId string
            *sourceData 来源data 
         */
         var templateId = data.id;
         if(data.templateId){templateId = data.templateId;}
         var _config = NetstarTemplate.templates.limsReg.data[templateId].config;
         var $container = $('#'+_config.id).closest('container');
         $container.html('');
         init(_config);
      }
   }
})(jQuery);