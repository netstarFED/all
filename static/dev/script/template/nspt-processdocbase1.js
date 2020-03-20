/*
 * @Desription: 文件说明
 * @Author: netstar.sjj
 * @Date: 2019-12-27 12:10:03
 * @LastEditTime: 2019-12-31 16:29:30
 * @descrition 基本单据处理  processDocBase
 * 显示形式 
 * 1.多个vo和多个list的新增编辑操作
 */
NetstarTemplate.templates.processDocBase = (function(){
   //此方法获取到当前模板页的配置定义和当前界面操作值
   function dialogBeforeHandler(data,templateId){
      var templateConfig = NetstarTemplate.templates.processDocBase.data[templateId].config;
      var isValidatParams = true;//是否对界面获取值进行验证参数
      var isParmeterFormat = true;//是否定义了验证字段
      var controllerObj = typeof(data.controllerObj)=='object' ? data.controllerObj : {};
      var defaultMode = controllerObj.defaultMode;
      var requestSource = controllerObj.requestSource;
      var isSendPageParams = typeof(controllerObj.isSendPageParams)=='boolean' ? controllerObj.isSendPageParams : true;
      if(isSendPageParams == false){
         //不发送界面参数
         data.value = {};
         return data;
      }
      if(controllerObj.validateParams){
         //并且定了配置属性
         //validateParams:{"customerId":"客户必填","saleWarehouseId":"货位必填","goodsShopId":"货品必填"} 
         //parameterFormat:{"customerId":"{customerVo.customerId}","goodsShopId":"{saleDetailVoList.goodsShopId}",'saleWarehouseId':"{saleWarehouseId}"}
         isValidatParams = false;//不进行界面的验证值
         isParmeterFormat = false;
         if(typeof(controllerObj.parameterFormat)=='undefined'){
            //如果没有配置需要验证的字段则需要对界面获取值进行验证
            isValidatParams = true;
         }
      }
      if(defaultMode == 'successMessage'){
         //successMessage 不需要对值验证，弹出来的窗体上有三个按钮 三个按钮再验证
         isValidatParams = false;
      }
      if(requestSource == 'none'){
         //没有来源参参数也不需要验证
         isValidatParams = false;
      }
      var pageData = getPageData(templateConfig.package,isValidatParams);//获取界面参
      data.config = templateConfig;//当前界面的config配置参数
      if(!isParmeterFormat && defaultMode != 'successMessage'){
         var validateParams = JSON.parse(controllerObj.validateParams); //验证提示语 
         if(controllerObj.parameterFormat){
            var parameterFormat = JSON.parse(controllerObj.parameterFormat);//转换的数据参数
            if(!$.isEmptyObject(templateConfig.tabConfig.listConfig)){
               for(var gId in templateConfig.tabConfig.listConfig){
                  var gKeyField = templateConfig.tabConfig.listConfig[gId].keyField;
                  var lId = templateConfig.tabConfig.listConfig[gId].id;
                  switch(requestSource){
                     case 'selected':
                        var selectData = NetStarGrid.getSelectedData(lId);
                        //读取单行选中值
                        if(selectData.length > 0){
                           pageData[gKeyField] = selectData[0];
                        } 
                        break;
                     case 'checkbox':
                        var CheckedData = NetStarGrid.getCheckedData(lId);
                        if(CheckedData.length > 0){
                           pageData[gKeyField] = CheckedData;
                        } 
                        break;
                  }
               }
            }
            var chargeData = NetStarUtils.getFormatParameterJSON(parameterFormat,pageData);//获取到转换的数据值
            var validateStrArray = [];//验证提示语
            for(var chargeparam in chargeData){
               if(validateParams[chargeparam]){
                  var validateStr = validateParams[chargeparam];
                  var isPush = false;
                  switch(typeof(chargeData[chargeparam])){
                     case 'string':
                        if(chargeData[chargeparam] == ''){
                           isPush = true;
                        }
                        break;
                     case 'number':
                        if(isNaN(chargeData[chargeparam])){
                           isPush = true;
                        }
                        break;
                     case 'object':
                        if($.isEmptyObject(chargeData[chargeparam])){
                           isPush = true;
                        }
                        break;
                     default:
                        break;
                  }
                  if(isPush){
                     validateStrArray.push(validateStr);
                  }
               }
            }
            if(chargeData == false){
               for(var validfield in validateParams){
                  validateStrArray.push(validateParams[validfield]);
               }
            }
            if(validateStrArray.length > 0){
               data.value = false;
               nsalert(validateStrArray.join(' '),'warning');
            }else{
               data.value = chargeData;
            }
         }else{
            if(pageData){
               var isValid = NetStarUtils.getPageValidResult(pageData,controllerObj.validateParams);
               if(isValid == false){
                  //验证失败不执行
                  data.value = false;
               }else{
                  data.value = pageData;
               }
            }else{
               data.value = pageData;
            }
         }
      }else{
         if(!pageData){data.value = false; return data;}
         data.value = pageData;
         if(!$.isEmptyObject(templateConfig.tabConfig.listConfig)){
            for(var gId in templateConfig.tabConfig.listConfig){
               var gKeyField = templateConfig.tabConfig.listConfig[gId].keyField;
               var lId = templateConfig.tabConfig.listConfig[gId].id;
               switch(requestSource){
                  case 'selected':
                     var selectData = NetStarGrid.getSelectedData(lId);
                     //读取单行选中值
                     if(selectData.length > 0){
                        pageData[gKeyField] = selectData[0];
                     } 
                     break;
                  case 'checkbox':
                     var CheckedData = NetStarGrid.getCheckedData(lId);
                     if(CheckedData.length > 0){
                        pageData[gKeyField] = CheckedData;
                     } 
                     break;
               }
            }
         }
      }
      return data;
   }
   //此方法是在调用ajax执行之前的回调
   function ajaxBeforeHandler(handlerObj,templateId){
      return handlerObj;
   }
   //此方法是在调用ajax完成之后需要对当前界面执行的逻辑
   function ajaxAfterHandler(data,templateId,ajaxPlusData){
      var templateConfig = {};
      if(templateId){
         templateConfig = NetstarTemplate.templates.processDocBase.data[templateId].config;
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
         NetstarTemplate.refreshByPackage(templateConfig.parentSourceParam,data,ajaxPlusData);
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
                  initComponentByFillValues(templateConfig);
                  break;
            }
         }else{
            //返回值是数组 没法根据objectState去处理逻辑
         }
         if(ajaxPlusData.clickBtnType == "isUseSave" || ajaxPlusData.clickBtnType == "isUseSaveSubmit" || ajaxPlusData.isIsSave){
            var _currentConfig = NetstarTemplate.draft.configByPackPage[currentConfig.package];
            if(_currentConfig && _currentConfig.draftBox){
               delete _currentConfig.draftBox.useDraftId;
            }
         }
      }
   }
   //跳转打开界面回调
	function loadPageHandler(){}
	//关闭打开界面回调
   function closePageHandler(){}
   //vo赋值
   function fillValuesByVoId(voId,data){
      NetstarTemplate.commonFunc.vo.fillValues(data,voId);
   }
   //给界面组件赋值
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
    //清空界面值
   function clearByAll(_config){
      for(var componentType in _config.componentsConfig){
         var componentData = _config.componentsConfig[componentType];
         switch(componentType){
            case 'blockList':
               for(var idI in componentData){
                  NetstarBlockList.refreshDataById(componentData[idI].id,[]);
               }
               break;
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
         }
      }
   }
   //组件调用初始化
   function initComponentInit(_config){
      var componentsConfig = _config.componentsConfig;
      for(var componentType in componentsConfig){
         var componentData = componentsConfig[componentType];
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
      //先输出vo,根据vo的高度去计算list应该显示的高度 进行list的初始化操作
      if(!$.isEmptyObject(_config.tabConfig.listConfig)){
         $('#'+_config.tabConfig.id).closest('.pt-tab-noboder').removeClass('hide');
         var commonVoHeight = $('#'+_config.id+' .pt-list-collection').outerHeight();
         //屏幕高度-标签高度-按钮高度-右侧vo的高度-上下padding的边距-vo的高度
         var gridHeight = $(window).outerHeight() - 35 - 34 -30 - commonVoHeight - _config.voByRightHeight;
         if(_config.title){
            gridHeight -= 48;
         }
         var pageLengthNumber = 0;
         if(!$.isEmptyObject(_config.tabConfig.queryConfig)){
            gridHeight -= 45;
            pageLengthNumber = Math.floor(gridHeight/29);
         }else{
            if(_config.tabConfig.listNum > 0){
               gridHeight = parseFloat(gridHeight/_config.tabConfig.listNum);
               pageLengthNumber = Math.floor(gridHeight/_config.tabConfig.listNum/29);
            }
         }
         var defaultParams = {
            isPage:false,
            pageLengthDefault:pageLengthNumber,//默认显示5条
            minPageLength:pageLengthNumber,//显示5条
            isHaveEditDeleteBtn:true,//允许删除
            isAllowAdd:true,//允许添加
            isEditMode: true, //编辑模式
            isShowHead:true,
            height:gridHeight,
            isCheckSelect: false,  //是否开启check select选中行  尽在支持多选状态下可用
            selectMode: 'single',                //多选multi none single
         };
         for(var listId in _config.tabConfig.listConfig){
            var gridComponent = _config.tabConfig.listConfig[listId];
            NetStarUtils.setDefaultValues(gridComponent.params,defaultParams);
         }
         NetstarTemplate.commonFunc.list.initList(_config.tabConfig.listConfig,_config);
      }
      if(!$.isEmptyObject(_config.tabConfig.queryConfig)){
         function changeTabInit(_config){
            var $lis = $('#'+_config.tabConfig.id+' > li');
            //切换详情表的tab
            function detailListTabHandler(ev){
               var $this = $(this);
               var $li = $this.closest('li');
               var id = $this.attr('ns-href-id');
               var $dom = $('#'+id).closest('.pt-tab-content');
               $li.addClass('current');
               $li.siblings().removeClass('current');
               $dom.addClass('current');
               $dom.siblings().removeClass('current')
            }
            $lis.children('a').off('click',detailListTabHandler);
            $lis.children('a').on('click',detailListTabHandler);
         }
         changeTabInit(_config);
      }
      if(_config.tabConfig.listNum == 1){
         for(var listId in _config.tabConfig.listConfig){
            _config.mainComponent = _config.tabConfig.listConfig[listId];
         }
      }
      if(!$.isEmptyObject(_config.serverData)){
         if($.isArray(_config.serverData.modifyDiffsList)){
            //给列表添加历史记录标签
            if(!$.isEmptyObject(_config.tabConfig.listConfig)){
               for(listI in _config.tabConfig.listConfig){
                  var listData = _config.tabConfig.listConfig[listI];
                  NetstarComponent.setHistoryByTableID(_config.serverData.modifyDiffsList, _config.serverData[listData.keyField],listData.idField,listData.id);
               }
            }
         }
      }

      setTemplateBasedName(_config);
      _config.templateDisabled(_config, _config.readonly, false);
      //sjj 2019119 绑定扫码事件
      if(!$.isEmptyObject(_config.scancode)){
         var isUseQRInput = typeof(_config.scancode.isUseQRInput)=='boolean' ? _config.scancode.isUseQRInput : false;
         var recordScanArray = [];
         var recordScanCount = {};
         if(isUseQRInput){
            //使用扫码功能
            var scancodeAjax = _config.scancode.ajax;
            var scancodeConfig = {
               id:'scancode-input-'+_config.containerHeaderId,
               callBackFunc:function(codeStr){
                  var isExistIndex = -1;
                  for(var r=0; r<recordScanArray.length; r++){
                     if(recordScanArray[r] == codeStr){
                        isExistIndex = r;
                        break;
                     }
                  }
                  if(recordScanCount[codeStr]){
                     recordScanCount[codeStr].count++;
                  }
                  if(isExistIndex == -1){
                     //不存在
                     recordScanArray.push(codeStr);
                     var scancodeSuccessAjax = $.extend(true,{},scancodeAjax);
                     scancodeSuccessAjax.data = {platFormCode:codeStr};
                     scancodeSuccessAjax.contentType = 'application/x-www-form-urlencoded';
                     scancodeSuccessAjax.type = 'GET';
                     NetStarUtils.ajax(scancodeSuccessAjax,function(res){
                        if(res.success){
                           var dataArr = [];
                           if($.isArray(res.rows)){
                              dataArr = res.rows;
                           }
                           if(dataArr.length > 0){
                              var mainComponent = _config.mainComponent;
                              var id = mainComponent.id;
                              for(var i=dataArr.length-1; i>=0; i--){
                                 recordScanCount[codeStr] = {count:dataArr[i].quantity};
                                 NetStarGrid.addRow(dataArr[i],id);
                              }
                           }
                        }
                     },true);
                  }else{
                     //已经扫描过的
                     var gridArr = NetStarGrid.dataManager.getData(_config.mainComponent.id);
                     var countNum =  recordScanCount[codeStr].count;
                     var rowIndex = -1;
                     var newCodeStr = codeStr;
                     if(codeStr.indexOf('-')>-1){
                        var codeArr = codeStr.split('-');
                        codeArr[0] = codeArr[0].toLocaleLowerCase();
                        newCodeStr = codeArr.join('-');
                     }
                     for(var d=0; d<gridArr.length; d++){
                        var gData = gridArr[d];
                        if(gData.goodsPlatformCode == newCodeStr){
                           rowIndex = d;
                           break;
                        }
                     }
                     if(rowIndex > -1){
                        var rowData = gridArr[rowIndex];
                        rowData.quantity = countNum;
                        NetStarGrid.editRow(rowData,_config.mainComponent.id);
                     }
                     //nsalert('该条形码已扫过，不能重复添加','warning');
                  }
               }
            };
            $('#'+_config.id).prepend('<input type="hidden" id="'+scancodeConfig.id+'" />');
            NetstarUI.scanCode.listener(scancodeConfig);
         }
      }
   }
   //初始化容器
   function initContainer(config){
      var titleHtml = '';//标题
		if(config.title){
         //定义了标题输出
         titleHtml = '<div class="pt-main-row processdocbase-title">'
                        +'<div class="pt-main-col">'
                           +'<div class="pt-panel pt-panel-header">'
                              +'<div class="pt-container">'
                                 +'<div class="pt-panel-row">'
                                    +'<div class="pt-panel-col">'
                                       +'<div class="pt-title pt-page-title"><h4>'+config.title+'</h4></div>'
                                    +'</div>'
                                 +'</div>'
                              +'</div>'
                           +'</div>'
                        +'</div>'
                     +'</div>';
      }
      var textRightHtml = '';//右侧输出vo
      var voHtml = '';//输出整体的vo
      var listHtml = '';//输出list
      var componentBtnHtmlByMain = '';//按钮的输出
      if(config.mainBtnArray.length > 0){
         var mainBtnId = config.btnKeyFieldJson.root.id;
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
      var componentsArr = config.components;
      var defaultComponentWidth = '';
      for(var componentI=0; componentI<componentsArr.length; componentI++){
         var componentData = componentsArr[componentI];
         var componentTitleStr = componentData.title ? componentData.title : '';
         var parentField = componentData.parent ? componentData.parent : 'root';
         var keyField = componentData.keyField ? componentData.keyField : 'root';
         var componentClassStr = 'pt-components-'+componentData.type;
         var componentDisplayMode = componentData.type;
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
                  textRightHtml += '<div class="pt-panel">'
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
                  voHtml += '<div id="'+componentData.id+'" class="'+componentClassStr+'" pt-displaymode="'+displayModeAttr+'"></div>';
               }
               //如果当前vo的下一个是list，需要给当前vo绑定blurHandler事件表单失去焦点表格获得焦点
               if(typeof(componentsArr[componentI+1])=='object' && componentsArr[componentI+1].type == 'list'){
                  config.componentsConfig.vo[componentData.id].blurHandler = (function(_innerComponentConfig){
                     return function(_componentData){
                        //设置焦点
                        NetStarGrid.setFirstEditRowState(_innerComponentConfig.id);
                     };
                  })(componentsArr[componentI+1]);
               }
               //给vo绑定历史记录标签
               config.componentsConfig.vo[componentData.id].completeHandler = function(_componentData){
                  var packageName = _componentData.config.packageName;
                  var tempalteConfig = NetstarTemplate.templates.configs[packageName];
                  var formID = _componentData.config.id;
                  var voComponent = tempalteConfig.componentsConfig.vo[formID];
                  var _formValue = NetstarTemplate.templates.processDocBase.getDataByKeyField(voComponent.keyField,{},tempalteConfig);
                  if(typeof(_formValue) == "object" && $.isArray(_formValue.modifyDiffsList)){
                     NetstarComponent.setHistoryByFormID(_formValue.modifyDiffsList,formID);
                  }
               }
               //获取界面参数
               config.componentsConfig.vo[componentData.id].getPageDataFunc = (function(config){
                  return function(){
                     return getPageData(config,false,false);
                  };
               })(config);
               break;
            case 'list':
               //获取界面参数
               config.componentsConfig.list[componentData.id].getPageDataFunc = (function(config){
                  return function(){
                     return getPageData(config,false,false);
                  };
               })(config);
               break;
         }
         if(keyField == 'root'){
            //主数据
            if(componentData.type == 'btns'){
               
            }else if(componentData.type == 'tabs'){

            }else{
               config.idFieldsNames['root'] = componentData.idField;//主键id
               config.keyFieldNames['root'] = 'root';
            }
         }else if(parentField =='root' && keyField){
            //当前是个二级数据
            config.idFieldsNames['root.'+keyField] = componentData.idField;
            config.keyFieldNames[keyField] = parentField + '.' + keyField;
         }else{
            //当前父节点不是root是别的有意义的值 可能是个三级数据或者三级以上的数据 暂且按三级数据结构定义走
            config.idFieldsNames['root.'+parentField+'.'+keyField] = componentData.idField;
         }
      }
      config.defaultComponentWidth = defaultComponentWidth;//主要用于volist的百分比
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
      if(textRightHtml){
         config.voByRightHeight = 45;
      }
      if(!$.isEmptyObject(config.tabConfig.queryConfig)){
         //定义了类型为tab的输出
         if(!$.isEmptyObject(config.tabConfig.listConfig)){
            var listNum = 0;
            var tabLiHtml = '';
            var tabContentHtml = '';
            for(var listId in config.tabConfig.listConfig){
               var listConfig = config.tabConfig.listConfig[listId];
               var titleStr = listConfig.title ? listConfig.title : '';
               var activeClassStr = '';
               if(listNum == 0){activeClassStr = 'current';}
               var classStr = 'component-list pt-nav-item';//class名称
               tabLiHtml += '<li class="'+classStr+' '+activeClassStr+'" ns-index="'+listNum+'">'
                                 +'<a href="javascript:void(0);" ns-href-id="'+listConfig.id+'">'
                                    +titleStr
                                 +'</a>'
                              +'</li>';
               tabContentHtml += '<div class="pt-tab-content '+activeClassStr+'">'
                                    +'<div class="pt-tab-components" id="'+listConfig.id+'"></div>'
                                 +'</div>';
               listNum++;
            }
            listHtml = //'<div class="pt-main-row">'
                     // +'<div class="pt-main-col">'
                           '<div class="pt-panel">'
                              +'<div class="pt-container">'
                                 +'<div calss="pt-panel-row">'
                                    +'<div class="pt-panel-col">'
                                       +'<div class="pt-tab-components-tabs pt-tab pt-tab-noboder hide">'
                                          +'<div class="pt-container">'
                                             +'<div class="pt-tab-header">'
                                                +'<div class="pt-nav">'
                                                   +'<ul class="pt-tab-list-components-tabs" id="'+config.tabConfig.id+'">'
                                                      +tabLiHtml
                                                   +'</ul>'
                                                +'</div>'
                                             +'</div>'
                                             +'<div class="pt-tab-body">'
                                                +tabContentHtml
                                             +'</div>'
                                          +'</div>'
                                       +'</div>'
                                    +'</div>'
                                 +'</div>'
                              +'</div>'
                           +'</div>';
                        //+'</div>'
                     //+'</div>';
         }
      }else{
         for(var listId in config.tabConfig.listConfig){
            var listConfig = config.tabConfig.listConfig[listId];
            listHtml += '<div class="pt-panel">'
                           +'<div class="pt-container">'
                              +'<div class="pt-panel-row">'
                              +'<div class="pt-panel-col">'
                                 +'<div id="'+listConfig.id+'" class="pt-components-list" pt-displaymode="list"></div>'
                              +'</div>'
                              +'</div>'
                           +'</div>'
                        +'</div>';
         }
      }
      var $container = $('container');
		if($container.length > 0){
			$container = $('container:last');
      }
      var templateClassStr = '';
		if(config.plusClass){
			templateClassStr = config.plusClass;
      }
      var modeStr = config.mode.toLocaleLowerCase();
      var html = '<div class="pt-main processdocbase '+templateClassStr+'" id="'+config.id+'" pt-mode="'+modeStr+'" ns-package="'+config.package+'">'
                     +titleHtml
                     +'<div class="pt-main-row">'
                        +'<div class="pt-main-col">'
                            +componentBtnHtmlByMain
                            +textRightHtml
                            +voHtml
                            +listHtml
                        +'</div>'
                     +'</div>'
                  +'</div>';
		if(config.$container){
			config.$container.html(html);
		}else{
			$container.prepend(html);//输出面板
		}
   }
   //设置默认值
   function setDefault(_config){
      _config.serverData = {};
      _config.pageData = {};
      _config.mode = '';
      _config.defaultComponentWidth = '25%';
      _config.voByRightHeight = 0;
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
      NetstarTemplate.commonFunc.setComponentDataByConfig(_config);//根据组件类型存储值
      initContainer(_config);//初始化容器
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
               initComponentInit(templateConfig);//组件化分别调用
               //根据当前模板定义的按钮判断里面是否包含了defaultMode:addInfoDialog
               NetstarTemplate.commonFunc.setPageDataByBtns(templateConfig.btnKeyFieldJson.root,templateConfig);
            }else{
               nsalert('返回值false','error');
            }
         },true);
      }else{
         initComponentInit(_config);//组件调用初始化
      }
   }
   //获取界面vo数据
   function getVoData(voId,valid){
      return NetstarTemplate.commonFunc.vo.getData(voId,valid);
   }
   //获取界面list数据
   function getListData(listId,valid){
      return NetstarTemplate.commonFunc.list.getData(listId,valid);
   }
   //根据组件获取值
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
                  if(gridData == false){
                     data = false;
                     break;
                  }
                  var parentField = componentsData[idI].parent ? componentsData[idI].parent : 'root';
                  var gridKeyField = componentsData[idI].keyField;
                  if(parentField == 'root'){
                     data[gridKeyField] = gridData;
                  }else{
                     data[parentField][gridKeyField] = gridData;
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
                  for(var d=0; d<voListData.length; d++){
                     for(var valueI in voData){
                        if(valueI.indexOf('-')>-1){
                           var valueIds = valueI.split('-');
                           if(voListData[d][idField] == valueIds[1]){
                              voListData[d][valueIds[0]] = voData[valueI];
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
   //获取界面参
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
      for(var addInfoKeyFieldI in _config.addInfoDialogData){
         //通过按钮类型defaultMode:addInfoDialog获取到的参数
         if(_config.addInfoDialogData[addInfoKeyFieldI]){
            pageData[addInfoKeyFieldI] = _config.addInfoDialogData[addInfoKeyFieldI];
         }
      }
      var returnData = pageData;
      if(isSetObjectState){
            returnData = nsServerTools.getObjectStateData(_config.serverData, pageData,_config.idFieldsNames);
      }
      nsServerTools.setObjectStateByFormatData(returnData,_config.components); // lyw 20190903 业务组件数据发生改变修改objectState
      NetstarTemplate.commonFunc.setSendParamsByPageParamsData(returnData,_config);
      return returnData;
   }
   function setValueByDraft(data, _package){
      var tempalteConfig = NetstarTemplate.templates.configs[_package];
      initComponentByFillValues(tempalteConfig,data);
   }
   function setValue(data, _package){
      var tempalteConfig = NetstarTemplate.templates.configs[_package];
      initComponentByFillValues(tempalteConfig,data);
   }
   function getValue(_package){
      var tempalteConfig = NetstarTemplate.templates.configs[_package];
      return {
         pageData:getPageData(tempalteConfig,false),
         serverData:tempalteConfig.serverData
      };
   }
   //返回模版数据
   function getTemplateValueFunc(_package) {
      var tempalteConfig = NetstarTemplate.templates.configs[_package];
      var pageData = {};
      if(tempalteConfig){
         pageData = $.extend(true,{},tempalteConfig.pageParam);
      }
      return pageData;
   }
   //设置模板状态
   function setTemplateBasedName(config){
      //模版状态
      config.setTemplateState = function (state) {
         var stateArr = 'suspend-message,emergency-message,again-message,normal-message,state-disabled-message'.split(',');
         if (typeof this.state != 'undefined') {
            $('#'+config.id).removeClass(this.state);
         }
         this.state = state;
         $('#'+config.id).addClass(state);
      }
      //模版只读
      config.templateDisabled = function (_config, isDisabled, showTitle, workitemState) {
         // lyw 通过状态获取显示数据
         var workitemStateObj = {
            128 : '此业务单已被签收，点击按钮关闭页面',
            4 : '此业务单已被提交，点击按钮关闭页面',
            5 : '此业务单已被提交，点击按钮关闭页面',
            16 : '此业务单已被回退，点击按钮关闭页面',
         }
         var tipsInfo = workitemStateObj[workitemState] ? workitemStateObj[workitemState] : '此业务单已被处理，点击按钮关闭页面';
         //如果禁用
         if (typeof isDisabled == 'boolean' && isDisabled) {
            //$('#' + config.id).addClass('template-disabled');
            //如果不显示内容
            if (typeof showTitle == 'boolean' && !showTitle) {
               var disabledContent = '';
            } else {
               var disabledContent = '<div class="state-content">\
                                          <p>' + tipsInfo + '</p>\
                                          <button onclick="NetstarUI.labelpageVm.removeCurrent()" type="button" class="pt-btn pt-btn-default">\
                                             <span>关闭</span>\
                                          </button>\
                                       </div>';
            }
            $('#'+config.id).append('<div class="dialog-template-state">' + disabledContent + '</div>');
         } else if (typeof isDisabled == 'boolean' && !isDisabled) {
            //$('#' + config.id).removeClass('template-disabled');
            // nsPublic.getAppendContainer().find('.pt-main .dialog-template-state').remove();
            $('#'+config.id).children('.dialog-template-state').remove();
         }
      }
   }
   return{
      setSendParamsByPageParamsData:NetstarTemplate.commonFunc.setSendParamsByPageParamsData,
      init:init,
      getPageData:getPageData,
      dialogBeforeHandler:dialogBeforeHandler,
      ajaxBeforeHandler:ajaxBeforeHandler,
      ajaxAfterHandler:ajaxAfterHandler,
      loadPageHandler:loadPageHandler,
      closePageHandler:closePageHandler,
      initComponentByFillValues:initComponentByFillValues,
      clearByAll:clearByAll,
      addValues:function(value,tempalteConfig,controllObj){},
      fillValues:function(value,tempalteConfig,controllObj){

      },
      componentInit:function(_config,_componentConfig){},
      setValueByDraft:setValueByDraft,
      setValue:setValue,
      getValue:getValue,
      getTemplateValueFunc:getTemplateValueFunc,
      setTemplateBasedName:setTemplateBasedName,
      getDataByKeyField:function(keyField, data,_templateConfig){
         keyField = typeof(keyField)=='undefined' ? 'root' : keyField;
         var pageData = data;
         if($.isEmptyObject(pageData)){
            pageData = _templateConfig.serverData;   
         }
         //如果没有当前keyField的，则返回
         if(typeof(_templateConfig.keyFieldNames[keyField]) == 'undefined') return false;
         var currentRelation = _templateConfig.keyFieldNames[keyField].replace(/root\./g, "");
         if (currentRelation != 'root') {
            var variableJson = {};
            variableJson[keyField] = "{" + currentRelation + "}";
            //根据类似 {a:"{parent.a}"} 的格式获得数据
            return nsServerTools.deleteEmptyData(NetStarUtils.getFormatParameterJSON(variableJson, pageData));
         }else{
            return nsServerTools.deleteEmptyData(pageData);
         }
      }
   }
})(jQuery);