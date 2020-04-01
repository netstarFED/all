/*
 * @Author: netstar.sjj
 * @Date: 2019-11-26 11:46:41
 * @LastEditors: netstar.sjj
 * @LastEditTime: 2019-11-26 11:46:41
 * @Desription: 单据加工模版
 * 此模板有多个vo，多个list的展现形式构成
 */
NetstarTemplate.templates.processDocSecond = (function ($) {
   /***************组件事件调用 start**************************** */
   //此方法获取到当前模板页的配置定义和当前界面操作值
   function dialogBeforeHandler(data,templateId){
      var templateConfig = NetstarTemplate.templates.processDocSecond.data[templateId].config;
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
         templateConfig = NetstarTemplate.templates.processDocSecond.data[templateId].config;
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
                  clearByAll(templateConfig);
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
                  clearByAll(templateConfig);
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
   function getTemplateHandlerByLabIds(_componentConfig,_vueConfig){
      var templateId = $('#'+_componentConfig.formID).closest('.processdocsecond').attr('id');
      var templateConfig = NetstarTemplate.templates.processDocSecond.data[templateId].config;
      var ajaxConfig = {
         url:getRootPath()+'/zc/sampleAccepts/refreshAcceptByLabId',
         type:'POST',
         contentType:'application/json',
         data:getPageData(templateConfig,false),
         plusData:{
            packageName:templateConfig.package
         },
         dataSrc:'data'
      };
      NetStarUtils.ajax(ajaxConfig,function(res,ajaxPlusData){
         if(res.success){
            var resData = res[ajaxPlusData.dataSrc] ? res[ajaxPlusData.dataSrc] : {};
            NetStarUtils.deleteAllObjectState(resData);//删除服务端返回的数据状态
            var templateConfig = NetstarTemplate.templates.configs[ajaxPlusData.plusData.packageName];
            templateConfig.serverData = resData;//服务端返回的原始数据
            templateConfig.pageData = NetStarUtils.deepCopy(resData);//克隆服务端返回的原始数据
            clearByAll(templateConfig);
            initComponentByFillValues(templateConfig,resData);
         }
      },true)
   }
   function getTemplateHandlerBySampleCateId(_componentConfig,_vueConfig){
      var templateId = $('#'+_componentConfig.formID).closest('.processdocsecond').attr('id');
      var templateConfig = NetstarTemplate.templates.processDocSecond.data[templateId].config;
      var ajaxConfig = {
         url:getRootPath()+'/zc/sampleAccepts/refreshAcceptBySampleCateId',
         type:'POST',
         contentType:'application/json',
         data:getPageData(templateConfig,false),
         plusData:{
            packageName:templateConfig.package
         },
         dataSrc:'data'
      };
      NetStarUtils.ajax(ajaxConfig,function(res,ajaxPlusData){
         if(res.success){
            var resData = res[ajaxPlusData.dataSrc] ? res[ajaxPlusData.dataSrc] : {};
            NetStarUtils.deleteAllObjectState(resData);//删除服务端返回的数据状态
            var templateConfig = NetstarTemplate.templates.configs[ajaxPlusData.plusData.packageName];
            templateConfig.serverData = resData;//服务端返回的原始数据
            templateConfig.pageData = NetStarUtils.deepCopy(resData);//克隆服务端返回的原始数据
            clearByAll(templateConfig);
            initComponentByFillValues(templateConfig,resData);
         }
      },true)
   }
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
         setTimeout(function(){
            $('#'+_config.tabConfig.id).closest('.pt-tab-noboder').removeClass('hide');
            var commonVoHeight = $('#'+_config.id+' .pt-list-collection').outerHeight();
            //屏幕高度-标签高度-按钮高度-右侧vo的高度-上下padding的边距-tab的高度-vo的高度
            var gridHeight = $(window).outerHeight() - 35 - 34 - 30 - 60 - commonVoHeight - _config.voByRightHeight;
            var pageLengthNum = Math.floor((gridHeight/29));
            var defaultParams = {
               isPage:false,
               pageLengthDefault:pageLengthNum,//默认显示5条
               minPageLength:pageLengthNum,//显示5条
               isHaveEditDeleteBtn:true,//允许删除
               isAllowAdd:true,//允许添加
               isEditMode: true, //编辑模式
               isShowHead:true,
               height:gridHeight,
            };
            for(var listId in _config.tabConfig.listConfig){
               var gridComponent = _config.tabConfig.listConfig[listId];
               NetStarUtils.setDefaultValues(gridComponent.params,defaultParams);
            }
            NetstarTemplate.commonFunc.list.initList(_config.tabConfig.listConfig,_config);
         },10)
      }
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
   //输出容器结构
   function initContainer(_config){
      var titleHtml = '';
      if(_config.title){
			//定义了标题输出
			titleHtml = '<div class="pt-main-row processdocsecond-title">'
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
      var defaultComponentWidth = '';
      var voHtml = '';
      var voListHtml = '';

      if(_config.mainBtnArray.length > 0){
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
                  componentsHtml += '<div class="pt-panel">'
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
               if($.isEmptyObject(_config.mainVoComponent)){
                  _config.mainVoComponent = componentData;
               }
               /*****sjj 20200114 手动添加代码支持试验台联动：/zc/sampleAccepts/refreshAcceptByLabId 检测/项目类别联动：/zc/sampleAccepts/refreshAcceptBySampleCateId  start****/
               /*for(var fieldI=0; fieldI<componentData.field.length; fieldI++){
                  var fieldData = componentData.field[fieldI];
                  if(fieldData.id == 'labIds'){
                     fieldData.blurHandler = getTemplateHandlerByLabIds;
                  }
                  if(fieldData.id == 'sampleCateId'){
                     fieldData.getTemplateHandler = getTemplateHandlerBySampleCateId;
                  }
               }*/
               /*****sjj 20200114 手动添加代码支持试验台联动：/zc/sampleAccepts/refreshAcceptByLabId 检测/项目类别联动：/zc/sampleAccepts/refreshAcceptBySampleCateId  end****/
               break;
         }
         if(keyField == 'root'){
            //主数据
            if(componentData.type == 'btns'){
               
            }else if(componentData.type == 'tabs'){

            }else{
               _config.idFieldsNames['root'] = componentData.idField;//主键id
            }
         }else if(parentField =='root' && keyField){
            //当前是个二级数据
            _config.idFieldsNames['root.'+keyField] = componentData.idField;
         }else{
            //当前父节点不是root是别的有意义的值 可能是个三级数据或者三级以上的数据 暂且按三级数据结构定义走
            _config.idFieldsNames['root.'+parentField+'.'+keyField] = componentData.idField;
         }
      }

      if(componentsHtml){
         _config.voByRightHeight = 46;
      }

      _config.defaultComponentWidth = defaultComponentWidth;
      var templateClassStr = '';
		if(_config.plusClass){
			templateClassStr = _config.plusClass;
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
      var tabHtml = '';//tab输出多个list
      if(!$.isEmptyObject(_config.tabConfig.listConfig)){
         var listNum = 0;
         var tabLiHtml = '';
         var tabContentHtml = '';
         for(var listId in _config.tabConfig.listConfig){
            var listConfig = _config.tabConfig.listConfig[listId];
            var titleStr = listConfig.title ? listConfig.title : '';
            var activeClassStr = '';
            if(listNum == 0){activeClassStr = 'current';}
            var classStr = 'component-list pt-nav-item';//class名称
				var aid = 'li-'+listConfig.id;
            tabLiHtml += '<li class="'+classStr+' '+activeClassStr+'" ns-index="'+listNum+'">'
                              +'<a href="javascript:void(0);" ns-href-id="'+aid+'">'
                                 +titleStr
                              +'</a>'
                           +'</li>';
            // tabContentHtml += '<div class="pt-tab-content '+activeClassStr+'">'
            //                      +'<div class="pt-tab-components" id="'+listConfig.id+'"></div>'
            //                   +'</div>';
            /*****tab中允许有按钮start*****/
            var tabBtnHtml = '';
            var btnClass = '';
            if(_config.btnKeyFieldJson[listConfig.keyField]){
               var tabBtnConfig = _config.btnKeyFieldJson[listConfig.keyField];
               tabBtnHtml = '<div class="nav-form pt-panel" component-type="tabbtns" id="'+tabBtnConfig.id+'"></div>';
               btnClass = 'hasbtn';
            }else{
               console.warn('该tab下无按钮配置,keyField为：'+listConfig.keyField);
            }
            tabContentHtml += '<div class="pt-tab-content '+activeClassStr+'">'
                                 + '<div class="pt-tab-components '+btnClass+'" id="'+aid+'">'
                                    + tabBtnHtml
                                    + '<div id="'+listConfig.id+'"></div>'
                                 + '</div>'
                              + '</div>';
            /*****tab中允许有按钮end*****/
            listNum++;
         }
         tabHtml = //'<div class="pt-main-row">'
                    // +'<div class="pt-main-col">'
                        '<div class="pt-panel">'
                           +'<div class="pt-container">'
                              +'<div calss="pt-panel-row">'
                                 +'<div class="pt-panel-col">'
                                    +'<div class="pt-tab-components-tabs pt-tab pt-tab-noboder hide">'
                                       +'<div class="pt-container">'
                                          +'<div class="pt-tab-header">'
                                             +'<div class="pt-nav">'
                                                +'<ul class="pt-tab-list-components-tabs" id="'+_config.tabConfig.id+'">'
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
      var html = '<div class="pt-main processdocsecond '+templateClassStr+' '+_config.mode+'" id="'+_config.id+'" ns-package="'+_config.package+'">'
                     +titleHtml
                     +'<div class="pt-main-row">'
                        +'<div class="pt-main-col">'
                           +componentBtnHtmlByMain
                           +componentsHtml
                           +voHtml
                           +tabHtml
                        +'</div>'
                     +'</div>'
                  +'</div>';
      $container.prepend(html);//输出面板
   }
   //设置默认值
   function setDefault(_config){
      _config.defaultComponentWidth = '25%';
      _config.mode = '';
      _config.mainBtnArray = [];
      _config.tabConfig = {
			id:"tab-"+_config.id,
			queryConfig:{},
			listConfig:{},
			templatesConfig:_config
      };
      _config.serverData = {};
      _config.pageData = {};
      _config.closeValidSaveTime = typeof(_config.closeValidSaveTime) == "number" ? _config.closeValidSaveTime : 500;
      if(_config.closeValidSaveTime > -1){
         _config.beforeCloseHandler = function(package){
            var templateConfig = NetstarTemplate.templates.configs[package];
            if(!templateConfig){
               return false;
            }
            function delUndefinedNull(obj){
               if($.isArray(obj)){
                  for(var i=0; i<obj.length; i++){
                     delUndefinedNull(obj[i]);
                  }
               }else{
                  for(var key in obj){
                     if(typeof(obj[key]) == "object"){
                        delUndefinedNull(obj[key]);
                     }else{
                        if(obj[key] === '' || obj[key] === undefined){
                           delete obj[key];
                        }
                     }
                  }
               }
            }
            var pageData = getPageData(package, false, false);
            delUndefinedNull(pageData)
            var pageInitDefaultData = templateConfig.pageInitDefaultData ? templateConfig.pageInitDefaultData : templateConfig.serverData;
            delUndefinedNull(pageInitDefaultData)
            return {
               getPageData : pageData,
               serverData : pageInitDefaultData,
            }
         }
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
               if(_config.closeValidSaveTime > -1){
                  setTimeout(function(){
                     templateConfig.pageInitDefaultData = getPageData(templateConfig, false, false);
                  }, _config.closeValidSaveTime);
               }
            }else{
               nsalert('返回值false','error');
            }
         },true);
      }else{
         initComponentInit(_config);
         setTimeout(function(){
            _config.pageInitDefaultData = getPageData(_config, false, false);
         }, 500);
      }
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
                  var componentIndexArr = NetstarComponent.form[componentsData[idI].id].config.componentIndexArr;
                  if(!$.isArray(componentIndexArr)){
                     componentIndexArr = [];
                  }
                  var componentIndexArrByVoList = _config.componentIndexArrByVoList[componentsData[idI].id];
                  if(!$.isArray(componentIndexArrByVoList)){
                     componentIndexArrByVoList = [];
                  }
                  for(var c=0; c<componentIndexArr.length; c++){
                     componentIndexArrByVoList.push(componentIndexArr[c]);
                  }
                  for(var d=0; d<voListData.length; d++){
                     for(var valueI=0; valueI<componentIndexArrByVoList.length; valueI++){
                        var valueStr = componentIndexArrByVoList[valueI];
                        if(valueStr.indexOf('-')>-1){
                           var valueIds = valueStr.split('-');
                           if(voListData[d][idField] == valueIds[1]){
                              voListData[d][valueIds[0]] = voData[valueStr];
                           }
                        }
                     }
                     /*if($.isEmptyObject(voData)){
                       
                     }else{
                        for(var valueI in voData){
                           if(valueI.indexOf('-')>-1){
                              var valueIds = valueI.split('-');
                              if(voListData[d][idField] == valueIds[1]){
                                 voListData[d][valueIds[0]] = voData[valueI];
                              }
                           }
                        }
                     }*/
                  }
                  data[vKeyField] = voListData;
               }
               break;
         }
      }
      return data;
   }
   //获取界面数据
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
                  _config.serverData[voListComponent.keyField] = fillValuesData[voListComponent.keyField];
                  
                  var componentIndexArrByvo = NetstarComponent.form[voListComponent.id].config.componentIndexArr;
                  var componentIndexArr = _config.componentIndexArrByVoList[voListComponent.id];
                  for(var c=0; c<componentIndexArrByvo.length; c++){
                     componentIndexArr.push(componentIndexArrByvo[c]);
                  }
                  var voListData = fillValuesData[voListComponent.keyField];
                  var idField = voListComponent.idField;
                  var fillValuesJson = {};
                  for(var d=0; d<voListData.length; d++){
                     for(var valueI=0; valueI<componentIndexArr.length; valueI++){
                        var valueStr = componentIndexArr[valueI];
                        if(valueStr.indexOf('-')>-1){
                           var valueIds = valueStr.split('-');
                           if(voListData[d][idField] == valueIds[1]){
                              if(typeof(voListData[d][valueIds[0]])!='undefined'){
                                 fillValuesJson[valueStr] = voListData[d][valueIds[0]];
                              }
                           }
                        }
                     }
                  }
                  if(!$.isEmptyObject(fillValuesJson)){
                     fillValuesByVoId(voListComponent.id,fillValuesJson);
                  }
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
                     NetStarGrid.addRow(value,currentAddvalueComponent.id);
                     break;
                  case 'blockList':
                     break;
                  case 'voList':
                     break;
               }
            }
         }
      },
      fillValues:function(value,tempalteConfig,controllObj){
         tempalteConfig.serverData = value;
         var keyField = controllObj.targetField ? controllObj.targetField : 'root';
         var isRoot = true;
         if(keyField != 'root'){
            isRoot = false;
         }
         if(isRoot){
            //整体添加值
            clearByAll(tempalteConfig);
            initComponentByFillValues(tempalteConfig,value);
         }else{
            //局部添加值
         }
      },
      setSendParamsByPageParamsData:NetstarTemplate.commonFunc.setSendParamsByPageParamsData,
      getTemplateHandlerByLabIds:getTemplateHandlerByLabIds,
      getTemplateHandlerBySampleCateId:getTemplateHandlerBySampleCateId,
   };
})(jQuery);