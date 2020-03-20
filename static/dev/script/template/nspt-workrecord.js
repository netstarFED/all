/*
 * @Author: netstar.sjj
 * @Date: 2019-11-26 11:46:41
 * @LastEditors: netstar.sjj
 * @LastEditTime: 2019-11-26 11:46:41
 * @Desription: 作业记录
 */
NetstarTemplate.templates.workRecordSimple = (function ($) {
   /***************组件事件调用 start**************************** */
   //此方法获取到当前模板页的配置定义和当前界面操作值
   function dialogBeforeHandler(data,templateId){
      var templateConfig = NetstarTemplate.templates.workRecordSimple.data[templateId].config;
      data.config = templateConfig;
      data.value = getPageData(templateConfig);
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
         templateConfig = NetstarTemplate.templates.workRecordSimple.data[templateId].config;
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
                  templateConfig.serverData = nsServerTools.setObjectStateData(data);//改变服务端数据值
                  initComponentByFillValues(templateConfig);
                  break;
               case NSSAVEDATAFLAG.ADD:
                  //新增
                  clearByAll(templateConfig);
                  break;
               case NSSAVEDATAFLAG.VIEW:
                  //刷新
                  templateConfig.serverData = nsServerTools.setObjectStateData(data);//改变服务端数据值
                  initComponentByFillValues(templateConfig);
                  break;
            }
         }else{
            //返回值是数组 没法根据objectState去处理逻辑
         }
      }
   }
   //跳转打开界面回调
	function loadPageHandler(){}
	//关闭打开界面回调
	function closePageHandler(){}
   /***************组件事件调用 end**************************** */
   //根据容器元素分别调用初始化方法
   function initComponentInit(_config){
      var componentsConfig = _config.componentsConfig;
      for(var componentType in componentsConfig){
         var componentData = componentsConfig[componentType];
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
            case 'voList':
               NetstarTemplate.commonFunc.voList.init(componentData,_config);
               break;
            case 'btns':
               NetstarTemplate.commonFunc.btns.initBtns(componentData,_config);
               break;
         }
      }
   }

   function initComponentInitByVo(_config){
      var voAjaxConfig = $.extend(true,{},_config.voConfig.ajax);
      if(!$.isEmptyObject(_config.pageParam)){
         if(!$.isEmptyObject(voAjaxConfig.data)){
            voAjaxConfig.data = NetStarUtils.getFormatParameterJSON(voAjaxConfig.data,_config.pageParam);
         }else{
            voAjaxConfig.data = _config.pageParam;
         }
      }
      voAjaxConfig.plusData = {
         packageName:_config.package,
         templateId:_config.id
      };
      NetStarUtils.ajax(voAjaxConfig,function(res,ajaxPlusData){
         if(res.success){
            var voData = res[ajaxPlusData.dataSrc] ? res[ajaxPlusData.dataSrc] : {};
            var templateConfig = NetstarTemplate.templates.configs[ajaxPlusData.plusData.packageName];
            templateConfig.serverData = voData;
            NetstarTemplate.commonFunc.vo.initVo(templateConfig.componentsConfig.vo,templateConfig);
         }else{
            var msg = res.msg ? res.msg : '返回值false';
            nsalert(msg,'error');
         }
      },true);
   }
   function initComponentInitByGrid(_config){
      var gridAjaxConfig = $.extend(true,{},_config.gridConfig.ajax);
      if(!$.isEmptyObject(_config.pageParam)){
         if(!$.isEmptyObject(gridAjaxConfig.data)){
            gridAjaxConfig.data = NetStarUtils.getFormatParameterJSON(gridAjaxConfig.data,_config.pageParam);
         }else{
            gridAjaxConfig.data = _config.pageParam;
         }
      }
      gridAjaxConfig.plusData = {
         packageName:_config.package,
         templateId:_config.id
      };
      NetStarUtils.ajax(gridAjaxConfig,function(res,ajaxPlusData){
         if(res.success){
            var resData = res[ajaxPlusData.dataSrc] ? res[ajaxPlusData.dataSrc] : {};
            console.log(resData)
            var templateConfig = NetstarTemplate.templates.configs[ajaxPlusData.plusData.packageName];
            NetstarTemplate.commonFunc.list.initList(templateConfig.componentsConfig.list,templateConfig);
         }else{
            var msg = res.msg ? res.msg : '返回值false';
            nsalert(msg,'error');
         }
      },true);
   }

   //输出容器结构
   function initContainer(_config){
      var titleHtml = '';
      if(_config.title){
			//定义了标题输出
			titleHtml = '<div class="pt-main-row workrecordsimple-title">'
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
      var $container = $('container');
		if($container.length > 0){
			$container = $('container:last');
		}
      var componentsArr = _config.components;
      var mainBtnId;//当前按钮操作整体的容器的id
      if(_config.btnKeyFieldJson.root){
         mainBtnId = _config.btnKeyFieldJson.root.id;
      }
      var componentsHtml = '';
      var componentBtnHtmlByMain = '';
      for(var componentI=0; componentI<componentsArr.length; componentI++){
         var componentData = componentsArr[componentI];
         var componentTitleStr = componentData.title ? componentData.title : '';
         var parentField = componentData.parent ? componentData.parent : 'root';
         var keyField = componentData.keyField;
         var componentClassStr = 'pt-components-'+componentData.type;
         componentData.params = typeof(componentData.params)=='object' ? componentData.params : {};
         var componentDisplayMode = componentData.params.displayMode ? componentData.params.displayMode : '';
         if(componentDisplayMode == 'voList'){
            _config.componentsConfig.voList[componentData.id] = componentData; //根据组件类型存储信息 
         }else{
            _config.componentsConfig[componentData.type][componentData.id] = componentData; //根据组件类型存储信息 
         }
         if(componentData.type=='btns'){
            if(componentData.id == mainBtnId){
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
         }else{
            var displayModeAttr = componentData.type;
            if(componentDisplayMode){
               displayModeAttr += '-'+componentDisplayMode.toLocaleLowerCase();
            }
            componentsHtml += '<div class="pt-panel">'
                                 +'<div class="pt-container">'
                                    +'<div class="pt-panel-row">'
                                    +'<div class="pt-panel-col">'
                                       +'<div id="'+componentData.id+'" class="'+componentClassStr+'" pt-displaymode="'+displayModeAttr+'"></div>'
                                    +'</div>'
                                    +'</div>'
                                 +'</div>'
                              +'</div>';
            //根据当前定义的parent属性和keyField属性 输出主键id的关联关系 目的在获取值的时候比较当前操作objectState用
            if(keyField == 'root'){
               //主数据
               _config.idFieldsNames['root'] = componentData.idField;//主键id
            }else if(parentField =='root' && keyField){
               //当前是个二级数据
               _config.idFieldsNames['root.'+keyField] = componentData.idField;
            }else{
               //当前父节点不是root是别的有意义的值 可能是个三级数据或者三级以上的数据 暂且按三级数据结构定义走
               _config.idFieldsNames['root.'+parentField+'.'+keyField] = componentData.idField;
            }
            if(componentData.type == 'list' || componentData.type == 'blockList'){
               componentData.isAjax = false;
               var defaultParams = {
                  isPage:true,
                  pageLengthDefault:5,//默认显示5条
                  minPageLength:5,//显示5条
                  isHaveEditDeleteBtn:false,//允许删除
                  isAllowAdd:false,//允许添加
                  isEditMode: false, //编辑模式
                  isShowHead:true,
               };
               if(componentTitleStr){
                  defaultParams.title = componentTitleStr;
               }
               NetStarUtils.setDefaultValues(componentData.params,defaultParams);
               _config.gridConfig = componentData;
            }
            if(componentData.type == 'vo' && componentTitleStr){
               componentData.field.unshift({label:componentTitleStr,type:'label'});
               _config.voConfig = componentData;
            }
         }
      }
      var templateClassStr = '';
		if(_config.plusClass){
			templateClassStr = _config.plusClass;
      }
      var html = '<div class="pt-main workrecordsimple '+templateClassStr+' '+_config.mode+'" id="'+_config.id+'">'
                     +titleHtml
                     +'<div class="pt-main-row">'
                        +'<div class="pt-main-col">'
                           +componentBtnHtmlByMain
                           +componentsHtml
                        +'</div>'
                     +'</div>'
                  +'</div>';
      $container.prepend(html);//输出面板
      
      //初始化vo和list
      initComponentInitByVo(_config);
      initComponentInitByGrid(_config);
   }
   //设置默认值
   function setDefault(_config){}
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
      initContainer(_config);//输出容器结构
   }
    //获取界面vo数据
    function getVoData(voId,valid){
      return NetstarTemplate.commonFunc.vo.getData(voId,valid);
   }
   //获取界面list数据
   function getListData(listId,valid){
      return NetstarTemplate.commonFunc.list.getData(listId);
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
                  var voData = getVoData(componentsData[idI].id,isValid);
                  if(voData === false){
                     data = false;
                     break;
                  }
                  $.each(voData,function(key,value){
                     data[key] = value;
                  });
               }
               break;
            case 'list':
            case 'blockList':
               for(var idI in componentsData){
                  var gridData = getListData(componentsData[idI].id,isValid);
                  var parentField = componentsData[idI].parent ? componentsData[idI].parent : 'root';
                  var gridKeyField = componentsData[idI].keyField;
                  if(parentField == 'root'){
                     data[gridKeyField] = gridData;
                  }else{
                     data[parentField][gridKeyField] = gridData;
                  }
               }
               break;
         }
      }
      return data;
   }
   //获取界面数据
   function getPageData(_config,isValid){
      isValid = typeof(isValid)=='boolean' ? isValid : true;
      if(typeof(_config)=='string'){
         _config = NetstarTemplate.templates.configs[_config];
      }
      var pageData = getDataByComponents(_config,isValid);
      if(pageData === false){
         return false;
      }
      var returnData = nsServerTools.getObjectStateData(_config.serverData, pageData, _config.idFieldsNames);

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
      }
      return returnData;
   }
   //vo赋值
   function fillValuesByVoId(voId,data){
      NetstarTemplate.commonFunc.vo.fillValues(data,voId);
   }
   //给界面组件赋值
   function initComponentByFillValues(_config){
      for(var componentType in _config.componentsConfig){
         var componentData = _config.componentsConfig[componentType];
         switch(componentType){
            case 'vo':
               for(var voId in componentData){
                  fillValuesByVoId(voId,_config.serverData);
               }
               break;
            case 'list':
               for(var listId in componentData){
                  var listConfig = componentData[listId];
                  var _data = _config.serverData[listConfig.keyField];
                  if(!$.isArray(_data)){_data = [];}
                  NetStarGrid.refreshDataById(listConfig.id,_data);
               }
               break;
            case 'blockList':
               for(var blockListId in componentData){
                  var blockListConfig = componentData[blockListId];
                  var _data = _config.serverData[blockListConfig.keyField];
                  if(!$.isArray(_data)){_data = [];}
                  NetstarBlockList.refreshDataById(blockListConfig.id,_data);
               }
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
   return {
      init: init,
      gridSelectedHandler:function(){},
      getPageData:getPageData,
      initComponentByFillValues:initComponentByFillValues,
      clearByAll:clearByAll,
      dialogBeforeHandler:dialogBeforeHandler,
      ajaxBeforeHandler:ajaxBeforeHandler,
      ajaxAfterHandler:ajaxAfterHandler,
   };
})(jQuery);