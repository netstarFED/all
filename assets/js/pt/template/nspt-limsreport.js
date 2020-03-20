/*
 * @Author: netstar.sjj
 * @Date: 2019-08-16 15:30:00
 */
NetstarTemplate.templates.limsReport = (function ($) {
   /****************按钮 回调方法 start******************************* */
   //按钮前置获取参数的方法
   function dialogBeforeHandler(data,templateId){
      var templateConfig = NetstarTemplate.templates.limsReport.data[templateId].config;
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
      }else{
         //验证失败
      }
      return pageData;
   }
   //给tab赋值
   function fillValuesTabByRowData(data,_gridConfig){
      var templateConfig = NetstarTemplate.templates.configs[_gridConfig.package];
      tabComponentFunc(templateConfig,'refresh',data);
   }
   /****************模板逻辑方法 end******************************** */
   
   //设置默认值
   function setDefault(_config){
      var defaultConfig = {
         mode:'horizontal',//横向排列
         mainBtnComponent:{},
      };
      NetStarUtils.setDefaultValues(_config,defaultConfig);
   }
   //输出格式为pdf
   function pdfMultiViewerByInit(_componentData,_config){
      var tabPdfId = 'tabs-pdf-'+_config.id;
      var componentId = _componentData.id;
      var fieldArray = _componentData.field;
      var $component = $('#'+componentId);
      var componentAjaxConfig = {};
      var liHtml = '';
      var tabContentHtml = '';
      for(var fieldI=0; fieldI<fieldArray.length; fieldI++){
         var fieldData = fieldArray[fieldI];
         var classStr = fieldI === 0 ? 'current' : '';
         fieldData.currentServerData = {};
         fieldData.id = componentId+'-pdfMultiViewer-'+fieldI;
         liHtml += '<li class="pt-nav-item pt-nav pt-dropdown '+classStr+'" id="'+fieldData.id+'" ns-type="'+fieldData.type+'">'
                     +'<div class="pt-top-menu-item-row">'
                        +'<a href="javascript:void(0);" class="pt-nav-item '+classStr+'">'
                           +'<span>'+fieldData.title+'</span>'
                           +'<i class="icon-arrow-down-o"></i>'
                        +'</a>'
                     +'</div>'
                     +'<div class="pt-top-nav-block hide">'
                        //+'<ul></ul>'
                     +'</div>'
                  +'</li>';
         tabContentHtml += '<div class="pt-tab-content '+classStr+'">'
                              +'<div id="tab-'+fieldData.id+'" ns-tab="'+fieldData.id+'" ns-type="'+fieldData.type+'"></div>'
                           +'</div>';
         componentAjaxConfig[fieldData.id] = fieldData;
      }
      _config.componentAjaxConfig = componentAjaxConfig;
      
      var tabComponentHtml = '<div class="pt-tab-header">'   
                                    +'<ul class="pt-nav pt-dropdown" ns-tab="pdfmultiview" ns-template-package="'+_config.package+'">'
                                       +liHtml
                                    +'</ul>'
                              +'</div>'
                              +'<div class="pt-tab-body" style="height:'+_config.tabContentHeight+'px;">'
                                 +tabContentHtml
                              +'</div>';
      $('#'+tabPdfId).html(tabComponentHtml);
      $('#'+tabPdfId+' ul[ns-tab="pdfmultiview"]>li').on('click',function(ev){
         //console.log('lipdf')
         var $this = $(this);
         $this.addClass('current');
         $this.siblings().removeClass('current');
         $this.children('.pt-top-menu-item-row').children('a').addClass('current');
         $this.siblings().children('.pt-top-menu-item-row').children('a').removeClass('current');
         $this.children('.pt-top-nav-block').removeClass('hide');
         $this.siblings().children('.pt-top-nav-block').addClass('hide');
      });
      //通过单击事件显示pdf
      function recordListByConfig(_paramsObj){
         var ajax = _paramsObj.ajax;
         var paramsConfig = _paramsObj.params;
         var containerId = _paramsObj.containerId;
         //console.log(ajax)
         //console.log(paramsConfig)
         //console.log(containerId)
         var resultTableUrl = '';
         var resultTableMode = 1;
         switch(resultTableMode){
            case 0:
               resultTableUrl = '/assets/json/resultmanager/tabledata.json';
               break;
            case 1:
               resultTableUrl = '/assets/json/resultmanager/sample-nscompleteindex.json';
               break;
         }
         var resultTableConfig = {
            id:containerId,
            isUseAutoWindowHeight:false,
            isUseControlPanel:true,
            isUseSettingWidthSize:false, //是否使用设置宽度尺寸，如果不使用则匹配屏幕
            isUseSettingHeightSize:true, //是否使用设置高度，不使用则全部默认为30像素一行

            isUseSettingIndex:true,
            setAutoIndex:'v',
            //isAllReadonly:true, 		 //是否全部设为只读
            //isShowHistory:false, 		//是否显示历史记录
            //unUseSettingStyle:['border','background','align','font'], 
            //unUseSettingStyle 不使用的样式表对象类，只有这四类，写上了就不起作用
            tableAjax:{
               url:resultTableUrl,
               type:'get',
               data:{
                  id:'DEMO-TM201',
                  uid:'UID001'
               },
               dataSrc:'data',
            },
            saveTimer:2,
            timer:500,
            saveAjax:{
               url:'/assets/json/resultmanager/tablesave.json',
               type:'get',
               data:{
                  id:'DEMO-TM201',
                  uid:'UID001'
               },
               dataSrc:'data',
            },
            historyAjax:{
               url:'/assets/json/resultmanager/historylist.json',
               type:'get',
               data:{
                  id:'abc',
                  uid:'abcde'
               },
               dataSrc:'data',
            },
            default:{
               urlPrefix:getRootPath(), 		//url前缀
               inputLength:12, 				//输入框默认长度
               selectLength:8, 				//下拉框默认长度
               checkboxajax:{ 					//系统数据多选组件相关配置项
                  isNumberID:true, 				//id是否是数字
                  isMultiSelect:true, 			//更多下拉框是否多选
                  type:'GET', 					//ajax type
                  dataSrc:'row', 					//ajax datascr
                  field:{							//数据配置
                     id:'id', 					//id
                     name:'name', 			 	//名称
                     py:'py', 					//拼音简拼
                     wb:'wb', 					//五笔简拼
                  },
                  data:{},
                  show:['name']
               },
               uploadAjax:{
                  src:"http://ui-pc:8888/NPE/File/upload",//上传图片的路径
                  dataSrc:"rows",//数据源
                  field:{//数据配置
                     name:"name",//名称
                     id:"id",//id
                  }
               },
               uploadSaveAjax:{
                  src:"http://ui-pc:8888/NPE/File/upload",//保存图片的路径
                  dataSrc:"rows",//数据源
                  field:{//数据配置
                     id:"id",//id
                     smallThumb:"smallThumb",//小缩略图
                     bigThumb:"bigThumb",//大缩略图
                     title:"title"//标题
                  }
               },
               uploadDelAjax:{
                  src:"http://ui-pc:8888/NPE/File/upload",
               },
               datestring:{
                  format:'MM月DD日'
               }
            },
            callback:{
               notesFunc:function(data){console.log(data)}
            },
            //缓存相关配置
            cache:{
               //列表
               cacheListKeyName:'taskGroupName',
               cachelistAjax:{
                  url:'/assets/json/resultmanager/cachelist.json',
                  type:'get',
                  data:{
                     state:0,
                     activityId:21355
                  },
                  dataSrc:'rows',
               },
               //数据
               cacheDataAjax:{
                  //缓存ajax地址
                  url:'/assets/json/resultmanager/tabledata.json',
                  //读取cachelistAjax的返回结果里的数据作为参数发出去
                  dataNames:{
                     recordId: 			'recordId',
                     taskIds: 			'taskIds',
                     recordTemplateId: 	'recordTemplateId'
                  }
               },
               //固定缓存项
               cacheDataPlusAjax:[
                  {
                     url:'/assets/json/project-list.json',
                     type:'get',
                     data:{
                        state:0,
                        activityId:1
                     }
                  },{
                     url:'/assets/json/project-list.json',
                     type:'get',
                     data:{
                        state:0,
                        activityId:2
                     }
                  }
               ]
               
            }

         }
         NetstarUI.resultTable.init(resultTableConfig);
      }
      function showPdfPanelByBindClick($container){
         $container.children('ul').children('li').children('div').on('click',function(ev){
            ev.stopPropagation();
            var $this = $(this);
            var id = $this.attr('ns-ajaxcomponentid');
            var fileId = $this.attr('ns-fileid');
            var primaryId = $this.attr('ns-id');
            var componentType = $this.attr('ns-type');
            var packageName = $this.closest('ul[ns-tab="pdfmultiview"]').attr('ns-template-package');
            //console.log(componentType)
            var templateConfig = NetstarTemplate.templates.configs[packageName];
            var currentComponentConfig = templateConfig.componentAjaxConfig[id];
            var currentData = currentComponentConfig.currentServerData[primaryId];
            $this.closest('.pt-top-nav-block').addClass('hide');
            var pdfId = $('div[ns-tab="'+id+'"]').attr('id');
            $('div[ns-tab="'+id+'"]').parent().addClass('current');
            $('div[ns-tab="'+id+'"]').parent().siblings().removeClass('current');
           // console.log(pdfId)
            switch(componentType){
               case 'pdfList':
                  //console.log('pdf');
                  var url = '/sites/pages/1.pdf';
                  NetstarUI.pdfViewer.init({
                     id:         pdfId,
                     url:        url,
                     zoomFit:    'width',
                     isDownload: true,             //是否有下载
                  });
                  break;
               case 'recordList':
                  //入参值 //请求的ajax //返回数据追加位置
                  //console.log('recordList');
                  var configObj = {
                     params:currentData,
                     ajax:$.extend(true,{},currentComponentConfig.getRecordAjax),
                     containerId:pdfId
                  };
                  recordListByConfig(configObj);
                  break;
            }  
         });
      }
      for(var ajaxId in componentAjaxConfig){
         var componentData = componentAjaxConfig[ajaxId];
         var ajaxConfig = $.extend(true,{},componentData.ajax);
         ajaxConfig.plusData = {
            containerId:ajaxId,
            componentData:componentData
         };
         NetStarUtils.ajax(ajaxConfig,function(res,ajaxPlusData){
            if(res.success){
               var resData = res[ajaxPlusData.dataSrc];
               var _componentData = ajaxPlusData.plusData.componentData;
               var html = '';
               var nameField = _componentData.nameField;
               var fileField = _componentData.fileField;
               
               var jsonData = {};
               if($.isArray(resData)){
                  for(var i=0; i<resData.length; i++){
                     var titleStr = resData[i][nameField] ? resData[i][nameField] : _componentData.title+i;
                     var fileIdAttr = resData[i][fileField] ? 'ns-fildid="'+resData[i][fileField]+'"' : '';
                     var idAttr = resData[i][_componentData.idField] ? 'ns-id="'+resData[i][_componentData.idField]+'"' : '';
                     jsonData[resData[i][_componentData.idField]] = resData[i];
                     _config.componentAjaxConfig[_componentData.id].currentServerData[resData[i][_componentData.idField]] = resData[i];
                     html += '<li class="pt-nav-item" style="position: relative;">'
                                 +'<div class="pt-top-menu-item-row" ns-ajaxcomponentid="'+_componentData.id+'" ns-type="'+_componentData.type+'" '+fileIdAttr+' '+idAttr+'>'
                                    +'<a href="javascript:void(0);" class="pt-nav-item">'
                                       +'<span>'+titleStr+'</span>'
                                    +'</a>'
                                 +'</div>'
                              +'</li>';
                 }
               }
               var $showContainer = $('#'+ajaxPlusData.plusData.containerId).children('.pt-top-nav-block');
               $showContainer.html('<ul>'+html+'</ul>');
               showPdfPanelByBindClick($showContainer);
            }
         },true);
      }
   }
   //组件类型为模板的初始化
   function templateComponentInit(_templateComponent,_config){
      for(var templateI in _templateComponent){
         var templateComponentData = _templateComponent[templateI];
         switch(templateComponentData.templatePanel){
            case 'pdfMultiViewer':
               pdfMultiViewerByInit(templateComponentData,_config);
               break;
         }
      }
   }
   function tabBaseChangeHandler(_config){
      var $tabContainer = _config.mainComponent.$tabContainer;
      $tabContainer.find('ul').children('li').on('click',function(ev){
         var $this = $(this);
         var id = $this.attr('id');
         var type = $this.attr('ns-type');
         $this.addClass('current');
         $this.siblings().removeClass('current');
         var $tabContent = $('div[ns-tab="'+id+'"]');
         var tabContentId = $tabContent.attr('id');
         $tabContent.parent().addClass('current');
         $tabContent.parent().siblings().removeClass('current');
         if(type == 'pdf'){
            //var url = getRootPath()+'/htmlpage/pdf-viewer-demo.pdf';
            var url = '/sites/pages/pdf-viewer-demo.pdf';
            //console.log(tabContentId)
            NetstarUI.pdfViewer.init({
               id:tabContentId,
               url:        url,
               zoomFit:    'width',
               isDownload: true,             //是否有下载
            });
         }else{
           
         }
      })
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
            case 'template':
               templateComponentInit(componentData,_config);
               break;
         }
      }
      tabBaseChangeHandler(_config);
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
      var $container = $('container');
		if($container.length > 0){
			$container = $('container:last');
		}
      
		var templateClassStr = '';
		if(_config.plusClass){
			templateClassStr = _config.plusClass;
      }
      var html = '<div class="pt-main limsreport '+templateClassStr+' '+_config.mode+'" id="'+_config.id+'">'
                     +titleHtml
                     +'<div class="pt-main-row">'
                        +'<div class="pt-main-col">'
                           +'<div class="pt-template-limsreport-main">'
                              +'<div class="pt-panel">'
                                 +'<div class="pt-container">'
                                    +'<div class="pt-panel-row">'
                                       +'<div class="pt-panel-col">'
                                          +'<div class="lims-report">'
                                             +'<div class="pt-pdfview">'
                                                +'<div class="pt-pdfview-group">'
                                                    +'<div class="pt-pdfview-item">'
                                                         +'<div class="pt-pdfview-header">'
                                                         +'</div>'
                                                         +'<div class="pt-pdfview-body">'
                                                            +'<div class="pt-tabs nspt-limsreport-left" id="tabs-base-'+_config.id+'">'
                                                               
                                                            +'</div>'
                                                         +'</div>'
                                                   +'</div>'
                                                   +'<div class="pt-pdfview-item">'
                                                         +'<div class="pt-pdfview-header">'
                                                         +'</div>'
                                                         +'<div class="pt-pdfview-body">'
                                                            +'<div class="pt-tabs nspt-limsreport-right" id="tabs-pdf-'+_config.id+'">'
                                                               
                                                            +'</div>'
                                                         +'</div>'
                                                   +'</div>'
                                                +'</div>'
                                             +'</div>'
                                          +'</div>'
                                       +'</div>'
                                    +'</div>'
                                 +'</div>'
                              +'</div>'
                           +'</div>'
                        +'</div>'
                     +'</div>'
                  +'</div>';
      $container.prepend(html);//输出面板
      
      for(var componentI=0; componentI<_config.components.length; componentI++){
         var componentData = _config.components[componentI];
         if(typeof(_config.componentsConfig[componentData.type])=='undefined'){
            _config.componentsConfig[componentData.type] = {};
         }
         _config.componentsConfig[componentData.type][componentData.id] = componentData; //根据组件类型存储信息
         var isRoot = false;
         if(componentData.parent == 'root'){
            isRoot = true;
            _config.mainComponent = componentData;//主组件
         }
         switch(componentData.type){
            case 'btns':
               if(componentData.operatorObject=='root'){_config.mainBtnComponent = componentData; isRoot = true;}
               break;
         }
      }
      _config.tabContentHeight = $(window).outerHeight() - 120;
      //vo信息的输出
      var tabBasehtml = '<div class="pt-tab-header">'
                           +'<div class="pt-nav">'
                              +'<ul>'
                                 +'<li id="'+_config.mainComponent.id+'-0-tab" class="pt-nav-item current" ns-type="vo"><span> 结论备注 </span></li>'
                                 +'<li id="'+_config.mainComponent.id+'-1-tab" class="pt-nav-item" ns-type="pdf"><span> 报告预览 </span></li>'
                              +'</ul>'
                           +'</div>'
                        +'</div>'
                        +'<div class="pt-tab-body" style="height:'+_config.tabContentHeight+'px;">'
                              +'<div class="pt-tab-content current">'
                                 +'<div id="'+_config.mainComponent.id+'" ns-tab="'+_config.mainComponent.id+'-0-tab" class="tabs-base-vo pt-components-vo"></div>'
                                 +'<div id="'+_config.mainBtnComponent.id+'" ns-tab="'+_config.mainComponent.id+'-0-tab" class="tabs-base-view pt-components-btns" ns-template-package="'+_config.package+'"></div>'
                              +'</div>'
                              +'<div class="pt-tab-content">'
                                 +'<div id="pdf-'+_config.mainComponent.id+'" ns-tab="'+_config.mainComponent.id+'-1-tab"></div>'
                                 +'<div class="pt-pdfview-footer"></div>'
                              +'</div>'
                        +'</div>';
      $('#tabs-base-'+_config.id).html(tabBasehtml);
      _config.mainComponent.$tabContainer = $('#tabs-base-'+_config.id);
      //pdf的输出
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
      },
      templateBtnsHandler:function(data){
         var $btnContainer = $(data.event.currentTarget).closest('.pt-components-btns');
         var packageName = $btnContainer.attr('ns-template-package');
         var templateId = NetstarTemplate.templates.configs[packageName].id;
         var pdfId = 'pdf-left'+templateId;
         var html = '<div class="" id="'+pdfId+'"><p>我是pdf</p></div>';

         $('#'+pdfId).remove();
         $btnContainer.after(html);
      }
   }
})(jQuery);