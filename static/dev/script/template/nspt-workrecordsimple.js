/*
 * @Author: netstar.sjj
 * @Date: 2019-12-09 11:46:41
 * @LastEditors: netstar.sjj
 * @LastEditTime: 2019-12-10 11:46:41
 * @Desription: 简单作业记录模板  workRecordSimple 单vo+list
 * 此模板仅用于编辑操作 不能用于新增
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
                  clearByAll(templateConfig);
                  break;
               case NSSAVEDATAFLAG.EDIT:
                  //修改
                  initComponentByFillValues(templateConfig);
                  break;
               case NSSAVEDATAFLAG.ADD:
                  //新增
                  clearByAll(templateConfig);
                  break;
               case NSSAVEDATAFLAG.VIEW:
                  //刷新
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

   function initComponentInitByBtns(_config){
      var componentsConfig = _config.componentsConfig.btns;
      NetstarTemplate.commonFunc.btns.initBtns(componentsConfig,_config);
   }

   function initComponentInitByVo(_config){
      if($.isEmptyObject(_config.voConfig)){
         nsalert('vo没有定义','error');
         return;
      }
      var voAjaxConfig = $.extend(true,{},_config.voConfig.ajax);
      if($.isEmptyObject(voAjaxConfig)){
         nsalert('vo中ajax没有定义','error');
         return;
      }
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
            //templateConfig.serverData = $.extend(true,{},voData);
            var voConfig = templateConfig.voConfig;
            var fieldArray = $.extend(true,[],voConfig.field);
            var formJson = {
               id:voConfig.id,
               form:fieldArray,
               isSetMore:typeof(voConfig.isSetMore)=='boolean' ? voConfig.isSetMore : false,
               /*getPageDataFunc:function(){
                 return _config.pageParam
               }*/
            };
            if(voConfig.formStyle){
               formJson.formStyle = voConfig.formStyle;
            }
            if(voConfig.plusClass){
               formJson.plusClass = voConfig.plusClass;
            }
            if(typeof(voConfig.height)=='number'){
               formJson.height = voConfig.height;
            }
            if(voConfig.defaultComponentWidth){
               formJson.defaultComponentWidth = voConfig.defaultComponentWidth;
            }
            NetstarComponent.formComponent.show(formJson,voData);
         }else{
            var msg = res.msg ? res.msg : '返回值false';
            nsalert(msg,'error');
         }
      },true);
   }

   function setWorkRecordRowData(resData,templateConfig){
      var workrecordId = 'workrecord-'+templateConfig.id;
      var workRecordHtml = '<div class="pt-panel">'
                              +'<div class="pt-container">'
                                 +'<div class="pt-panel-row">'
                                 +'<div class="pt-panel-col pt-workrecordsimple-list" id="'+workrecordId+'">'
                                    //+'<div id="id" class="component-workrecord" pt-displaymode="list"></div>'
                                 +'</div>'
                                 +'</div>'
                              +'</div>'
                           +'</div>';
      $('#panel-'+templateConfig.id).append(workRecordHtml);
      
      var titleArray = ['序号','确认事项'];
      var rowObject = {};
      var rowArray = resData.workRecordRowList; //读取行数据
      if(!$.isArray(rowArray)){
         rowArray = [];
      }
      if(rowArray.length > 0){
         /****************读取第一行第一列作为输出的标题头 start***************************** */
         var columnDataFieldArray = rowArray[0].workRecordColList;//读取第一行的列数据作为标题列
         if(!$.isArray(columnDataFieldArray)){columnDataFieldArray = [];}
         for(var columnI=0; columnI<columnDataFieldArray.length; columnI++){
            titleArray.push(columnDataFieldArray[columnI].colName);
         }
         /****************读取第一行第一列作为输出的标题头 end***************************** */

         /****************循环行和列输出 start***************************** */
         for(var rowI=0; rowI<rowArray.length; rowI++){
            var rowData = $.extend(true,{},rowArray[rowI]);
            rowObject[rowI] = {
               id:workrecordId+'-'+rowI,
               field:[],
               data:rowData,
            };
            var colArray = rowData.workRecordColList;
            if(!$.isArray(colArray)){colArray = [];}
            var currentRowArray = [
               {
                  id:'rowNo-'+rowI,
                  type:'text',
                  readonly:true,
                  value:rowData.rowNo,
                  //label:'序号',
                  width:'3%',
                  formSource:'staticData',
               },{
                  id:'workName-'+rowI,
                  type:'text',
                  readonly:true,
                  value:rowData.workName,
                  label:'确认事项',
                  formSource:'staticData',
                  width:'90%',
               }
            ];
            for(var colI=0; colI<colArray.length; colI++){
               var colData = colArray[colI];
               var needInput = Number(colData.needInput);
               var isEditMode = needInput == 0 ? true : false;//值为0不可编辑，值为1可编辑
               var dataDefine = typeof(colData.dataDefine)=='string' ? colData.dataDefine : '';
               var valueId = 'value-'+rowI+'-'+colI;
               var valueJson = {
                  type:'text',
                  readonly:isEditMode,
                  value:typeof(colData.data)=='undefined' ? '' : colData.data,
               };
               if(dataDefine){
                  valueJson = JSON.parse(dataDefine);
                  valueJson.readonly = isEditMode;
                  if(typeof(valueJson.value)=='undefined'){
                     valueJson.value = typeof(colData.data)=='undefined' ? '' : colData.data;
                  }
               }
               valueJson.id = 'id-'+colData.workMethodColId,
               valueJson.label = colData.colName;
               if(!isEditMode){
                  //当前类型为可编辑的时候绑定commonChangeHandler事件
                  valueJson.commonChangeHandler = function(_vueData){
                     //var formID = _vueData.config.formID;
                     //var templatePackageName = _vueData.config.package;
                     //var _templateConfig = NetstarTemplate.templates.configs[templatePackageName];
                  }
               }
               currentRowArray.push(valueJson);
            }
            rowObject[rowI].field = currentRowArray;
         }
         /****************循环行和列输出 end***************************** */
         for(var rowId in rowObject){
            var rowVo = rowObject[rowId];
            $('#'+workrecordId).append('<div id="'+rowVo.id+'" class="component-workrecord" pt-displaymode="list"></div>');
         }
         for(var rowId in rowObject){
            var rowVo = rowObject[rowId];
            var formConfig = {
               id: rowVo.id,
               formStyle: 'pt-form-workrecordsimple',
               plusClass: 'pt-custom-workrecordsimple',
               isSetMore: false,
               form: rowVo.field,
            };
            NetstarComponent.formComponent.show(formConfig, {});
         }
         templateConfig.workrecordObject = rowObject;
      }else{
         console.warn('返回数据为空');
      }
   }

   function gridInit(resData,templateConfig){
      if($.isEmptyObject(resData)){
         alert('返回值为空','error');
         return;
      }
      var workRecordRowListArr = resData.workRecordRowList; //读取行数据
      var dataSourceArr = [];//表格数据源
      var columnFieldArr = [];//表格列的定义
      var customColFieldByRowIDAndColID = {};//根据行id和列id存储自定义列字段名称
      if(!$.isArray(workRecordRowListArr)){
         workRecordRowListArr = [];
      }
      var columnDataFieldArray = workRecordRowListArr[0].workRecordColList;//读取第一行的列数据作为标题列
      if(!$.isArray(columnDataFieldArray)){columnDataFieldArray = [];}
      for(var columnI=0; columnI<columnDataFieldArray.length; columnI++){
         var columnData = columnDataFieldArray[columnI];
         var needInput = Number(columnData.needInput);
         var isEditMode = needInput == 0 ? false : true;//值为0不可编辑，值为1可编辑
         var columnJson = {
            field:'value-row-col-'+columnI,
            title:columnData.colName,
            columnType:columnData.dataType,
            editable:isEditMode,
            width:100,
         };
         switch(columnData.dataType){
            case 'text':
               columnJson.width = 200;
               break;
         }
         if(!$.isEmptyObject(columnData.dataDefine)){
            columnJson.editConfig = columnData.dataDefine;
         }
         if(typeof(columnData.dataDefine)=='string'){
            if(columnData.dataDefine){
               columnJson.editConfig = JSON.parse(columnData.dataDefine);
               columnJson.editConfig.id = columnJson.field;
            }
         }
         columnFieldArr.push(columnJson);
      }
      //循环行和列输出表格数据展示格式
      for(var rowI=0; rowI<workRecordRowListArr.length; rowI++){
         var rowData = $.extend(true,{},workRecordRowListArr[rowI]);
         var workRecordColListArr = rowData.workRecordColList;
         var rowJson = rowData;
         if(!$.isArray(workRecordColListArr)){workRecordColListArr = [];}
         customColFieldByRowIDAndColID[rowData.workMethodRowId] = {};
         for(var colI=0; colI<workRecordColListArr.length; colI++){
            var colData = workRecordColListArr[colI];
            var colField = 'value-row-col-'+colI;
            rowJson[colField] = colData.data;//列的值
            customColFieldByRowIDAndColID[rowData.workMethodRowId][colData.workMethodColId] = {
               colField:colField
            };
         }
         dataSourceArr.push(rowJson);
      }
      templateConfig.gridConfig.customColFieldByRowIDAndColID = customColFieldByRowIDAndColID;
      if(columnFieldArr.length > 0){
         columnFieldArr.unshift({
            field:'rowNo',
            title:'序号',
            width:45,
         },{
            field:'workName',
            title:'确认事项',
            width:300,
         });
         var gridJson = {
            id:templateConfig.gridConfig.id,
            data:{
               dataSource:dataSourceArr,
               isSearch:false,
               isServerMode:false,
               idField:'workMethodRowId',
               isPage:false,
            },
            columns:columnFieldArr,
            ui:{
               isEditMode:true,
               pageLengthDefault:5,
               isPage:false,
               minPageLength:5,
               isAllowAdd:false,
            }
         };
         NetStarGrid.init(gridJson);
      }else{
         nsalert('返回值错误','error');
      }
   }

   function initComponentInitByGrid(_config){
      _config.gridConfig = _config.mainComponent;
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
            NetStarUtils.deleteAllObjectState(resData);//删除服务端返回的数据状态
            var templateConfig = NetstarTemplate.templates.configs[ajaxPlusData.plusData.packageName];
            
            templateConfig.serverData = resData;//服务端返回的原始数据
            templateConfig.workrecordData = NetStarUtils.deepCopy(resData);//克隆服务端返回的原始数据

            //gridInit(templateConfig.workrecordData,templateConfig);
            setWorkRecordRowData(templateConfig.workrecordData,templateConfig);

         }else{
            var msg = res.msg ? res.msg : '返回值false';
            nsalert(msg,'error');
         }
      },true);
   }

   function setComponentDataByConfig(config){
      for(var componentI=0; componentI<config.components.length; componentI++){
			var componentData = config.components[componentI];
			var componentKeyField = componentData.keyField ? componentData.keyField : 'root';
			var parentField = componentData.parent ? componentData.parent : 'root';
			componentData.params = typeof(componentData.params)=='object' ? componentData.params : {};
			var componentDisplayMode = componentData.type;
			if(componentData.params.displayMode == 'voList'){
				componentDisplayMode = componentData.params.displayMode; 
			}
			if(typeof(componentData.id)=='undefined'){
				componentData.id = config.id + '-' + componentData.type + '-' + componentI;//定义容器id
			}
			config.componentsConfig[componentDisplayMode][componentData.id] = componentData; //根据组件类型存储信息 
			componentData.package = config.package;
			switch(componentDisplayMode){
				case 'tree':
					config.treeComponent = componentData;
					break;
				case 'list':
				case 'blockList':
					if(componentKeyField == 'root'){
						componentData.isAjax = true;
						if(componentData.params.isAjax == false){
							componentData.isAjax = false;
						}
                  config.mainComponent = componentData;
					}else{
						componentData.isAjax = false;
						//config.tabConfig.listConfig[componentData.id] = componentData;
					}
					break;
				case 'btns':
					config.mainBtnArray.push($.extend(true,{},componentData));
					break;
				case 'tab':
					//config.tabConfig.queryConfig = componentData;
               break;
			}
		}
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
      //输出操作整体数据的按钮容器
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
      if(!$.isEmptyObject(_config.componentsConfig.vo)){
         //vo应该只有一个
         for(var voI in _config.componentsConfig.vo){
            _config.voConfig = _config.componentsConfig.vo[voI];
            break;
         }
         componentsHtml += '<div class="pt-panel">'
                              +'<div class="pt-container">'
                                 +'<div class="pt-panel-row">'
                                 +'<div class="pt-panel-col">'
                                    +'<div id="'+_config.voConfig.id+'" class="pt-components-vo" pt-displaymode="vo"></div>'
                                 +'</div>'
                                 +'</div>'
                              +'</div>'
                           +'</div>';
      }
      var templateClassStr = '';
		if(_config.plusClass){
			templateClassStr = _config.plusClass;
      }
      var html = '<div class="pt-main workrecordsimple '+templateClassStr+' '+_config.mode+'" id="'+_config.id+'">'
                     +titleHtml
                     +'<div class="pt-main-row">'
                        +'<div class="pt-main-col" id="panel-'+_config.id+'">'
                           +componentBtnHtmlByMain
                           +componentsHtml
                        +'</div>'
                     +'</div>'
                  +'</div>';
      $container.prepend(html);//输出面板

      //初始化vo和list
      initComponentInitByVo(_config);
      initComponentInitByGrid(_config);
      initComponentInitByBtns(_config);
   }
   //设置默认值
   function setDefault(_config){
      //当前模板 vo和list两个单独的ajax请求获取到服务端返回数据
      _config.serverData = {};
      _config.mainBtnArray = [];
      _config.mode = '';
      
      _config.idFieldsNames['root'] = 'id';
      _config.idFieldsNames['root.workRecordRowList'] = 'workMethodRowId';
      _config.idFieldsNames['root.workRecordRowList.workRecordColList'] = 'workMethodColId';
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
      setComponentDataByConfig(_config);
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
      var pageData = {};
      var workrecordObject = _config.workrecordObject;
      var originalGridData = _config.workrecordData;
      var gridJson = {};
      for(var vId in workrecordObject){
         var workrecordData = workrecordObject[vId];
         var voData = NetstarComponent.getValues(workrecordData.id);
         gridJson[workrecordData.data.workMethodRowId] = voData;
      }
      var workRecordRowListArr = originalGridData.workRecordRowList;
      if(!$.isArray(workRecordRowListArr)){workRecordRowListArr = [];}

      for(var rowI=0; rowI<workRecordRowListArr.length; rowI++){
         var rowData = workRecordRowListArr[rowI];
         var workRecordColListArr = rowData.workRecordColList;
         if(!$.isArray(workRecordColListArr)){workRecordColListArr = [];}
         var valueJson = gridJson[rowData.workMethodRowId] ? gridJson[rowData.workMethodRowId] : {};
         for(var colI=0; colI<workRecordColListArr.length; colI++){
            var colData = workRecordColListArr[colI];
            for(var valueI in valueJson){
               if(valueI.indexOf('-')>-1){
                  var compareId = valueI.substring(valueI.lastIndexOf('-')+1,valueI.length);
                  if(compareId == colData.workMethodColId){
                     colData.data = valueJson[valueI];
                  }
               }
            }
         }
      }
      //var voData = getVoData(_config.voConfig.id,isValid);
      /*if(voData === false){
         return false;
      }*/
      /*var gridData = getListData(_config.gridConfig.id,isValid);
      if(!$.isArray(gridData)){gridData = [];}
      for(var g=0; g<gridData.length; g++){
         gridJson[gridData[g].workMethodRowId] = gridData[g];
      }
      var customColFieldByRowIDAndColID = _config.gridConfig.customColFieldByRowIDAndColID; 
      var workRecordRowListArr = originalGridData.workRecordRowList;
      if(!$.isArray(workRecordRowListArr)){workRecordRowListArr = [];}
      for(var rowI=0; rowI<workRecordRowListArr.length; rowI++){
         var rowData = workRecordRowListArr[rowI];
         var workRecordColListArr = rowData.workRecordColList;
         if(!$.isArray(workRecordColListArr)){workRecordColListArr = [];}
         var fillValues = gridJson[rowData.workMethodRowId] ? gridJson[rowData.workMethodRowId] : {};
         var rowJson = customColFieldByRowIDAndColID[rowData.workMethodRowId] ? customColFieldByRowIDAndColID[rowData.workMethodRowId] : {};
         for(var colI=0; colI<workRecordColListArr.length; colI++){
            var colData = workRecordColListArr[colI];
            if(rowJson[colData.workMethodColId]){
               var colField = rowJson[colData.workMethodColId].colField;
               colData.data = fillValues[colField];
            }
         }
      }*/

      var returnData = nsServerTools.getObjectStateData(_config.serverData, originalGridData, _config.idFieldsNames);

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