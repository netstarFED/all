/**
 * 初始化基本数据表格 客户端数据模式
 * 
 * @returns
 */
var baseDataTable = {
  container: {},
  table: {},
  data: {},
  formatHandler: {},
  formatValidate: {},
  countTotalJson: {},
  tableUploadJson: {}, 	//是否有上传文件
  originalConfig: {},  		//原始config数据
  messageState:{
      width:45,
      isColumn:true,//非列即行 不在某个单元格显示即在整体行上显示
      data:{
          hasEmergency:'emergency-message',//应急
          normalstate:'normal-message',//普通
          hasRollback:'again-message',//重办
          hasSuspend:'suspend-message',//挂起
      }
  }
};
var nsTable = baseDataTable;
/**初始化按钮**/
/**
 *btnconfig用来存放要显示按钮的类别，其中每个类别都有其自身的单击触发事件
 *tableID是指当前所操作table的id
 *uiconfig存放搜索条件是否允许选中和每页显示条数
*/
baseDataTable.initBtns = function (dataConfig, btnConfig, uiConfig, columnConfig) {
  var tableBtnJson = {};
  var tableID = dataConfig.tableID;
  baseDataTable.formatHandler[tableID].tableBtnJson = {};//初始化存放按钮参数配置
  var isSearch = dataConfig.isSearch;
  var btnGroupBaseHtml = '';
  var btnGroupSortHtml = '';
  var btnGroupExportHtml = '';
  var btnGroupSelfHtml = '';
  var btnJson = {};
  var groupBtnHandlerArr = [];//自定义button按钮下拉框
  if (btnConfig.openBtn) {
    btnJson.text = language.datatable.btns.open;
    btnJson.handler = btnConfig.openBtn;
    btnGroupBaseHtml += nsButton.getHtml(btnJson, 'table', 'open', true, false);
    var openBtnJson = { "index": 'open', handler: btnConfig.openBtn, "text": language.datatable.btns.open };
    tableBtnJson['open'] = openBtnJson;
  }
  if (btnConfig.addBtn) {
    btnJson.text = language.datatable.btns.add;
    btnJson.handler = btnConfig.addBtn;
    btnGroupBaseHtml += nsButton.getHtml(btnJson, 'table', 'add', true, true);
    var addBtnJson = { "index": 'add', handler: btnConfig.addBtn, "text": language.datatable.btns.add };
    tableBtnJson['add'] = addBtnJson;
  }
  if (btnConfig.modifyBtn) {
    btnJson.text = language.datatable.btns.edit;
    btnJson.handler = btnConfig.modifyBtn;
    btnGroupBaseHtml += nsButton.getHtml(btnJson, 'table', 'modify', true, true);
    var modifyBtnJson = { "index": 'modify', handler: btnConfig.modifyBtn, "text": language.datatable.btns.edit };
    tableBtnJson['modify'] = modifyBtnJson;
  }
  if (btnConfig.delBtn) {
    btnJson.text = language.datatable.btns.del;
    btnJson.handler = btnConfig.delBtn;
    btnGroupBaseHtml += nsButton.getHtml(btnJson, 'table', 'del', true, true);
    var delBtnJson = { "index": 'del', handler: btnConfig.delBtn, "text": language.datatable.btns.del };
    tableBtnJson['del'] = delBtnJson;
  }
  if (btnConfig.selfBtn) {
    var selfBtnArr = btnConfig.selfBtn;
    for (var selfI = 0; selfI < selfBtnArr.length; selfI++) {
      var selfJson = {};
      selfJson.text = selfBtnArr[selfI].text;
      //是否显示configShow或isVisible
      selfJson.configShow = selfBtnArr[selfI].configShow;
      if (typeof(selfBtnArr[selfI].configShow) != 'boolean') {
        if (typeof(selfBtnArr[selfI].isVisible) == 'boolean') {
          selfJson.configShow = selfBtnArr[selfI].isVisible;
        } else {
          selfJson.configShow = true;
        }
      }
      var groupBtnArr = [];
      if ($.isArray(selfBtnArr[selfI].subdata)) {
        //如果有定义了subdata数组
        selfJson.source = 'table';
        selfJson.fid = selfI;
        var dropData = selfBtnArr[selfI].subdata;
        var dropdownArr = [];
        for (var dropI = 0; dropI < dropData.length; dropI++) {
          var toggleJson = {
            index: {
              fid: selfI,
              optionid: dropI,
              isReturn:typeof(dropData[dropI].isReturn) == 'boolean' ? dropData[dropI].isReturn : false
            },
            text: dropData[dropI].text,
            handler: dropData[dropI].handler,
            configShow: dropData[dropI].configShow,
            isReturn:typeof(dropData[dropI].isReturn) == 'boolean' ? dropData[dropI].isReturn : false,
            disabled:typeof(dropData[dropI].disabled) == 'boolean' ? dropData[dropI].disabled : false,
          };
          if (typeof(dropData[dropI].configShow) != 'boolean') {
            if (typeof(dropData[dropI].isVisible) == 'boolean') {
              toggleJson.configShow = dropData[dropI].isVisible;
            } else {
              toggleJson.configShow = true;
            }
          }
          if (typeof (dropData[dropI].handler) == 'function') {
            groupBtnArr.push(dropData[dropI].handler);
          } else {
            groupBtnArr.push('');
          }
          dropdownArr.push(toggleJson);
        }
        selfJson.subdata = dropdownArr;
        btnGroupSelfHtml += nsButton.getDropdownHtml(selfJson);
      } else {
        //普通按钮
        selfJson.handler = selfBtnArr[selfI].handler;
        var isShowText = typeof (selfBtnArr[selfI].isShowText) == 'boolean' ? selfBtnArr[selfI].isShowText : true;
        var isShowIcon = typeof (selfBtnArr[selfI].isShowIcon) == 'boolean' ? selfBtnArr[selfI].isShowIcon : true;
        selfJson.isReturn = typeof(selfBtnArr[selfI].isReturn) == 'boolean' ? selfBtnArr[selfI].isReturn : false; 
        selfJson.disabled = typeof(selfBtnArr[selfI].disabled) == 'boolean' ? selfBtnArr[selfI].disabled : false;
        if(uiConfig.browerSystem == 'mobile'){
          selfJson.btnCls = 'btn btn-white';
        }
        btnGroupSelfHtml += nsButton.getHtml(selfJson, 'table', selfI, isShowIcon, isShowText);
      }
      groupBtnHandlerArr.push(groupBtnArr);
    }
    tableBtnJson.groupBtnHandlerArr = groupBtnHandlerArr;
    tableBtnJson['self'] = selfBtnArr;
  }
  if (uiConfig.isorder) {
    //允许排序
    var sortBtnArr = uiConfig.orderBtn;
    for (var sortI = 0; sortI < sortBtnArr.length; sortI++) {
      btnJson.text = sortBtnArr[sortI].text;
      btnJson.handler = sortBtnArr[sortI].handler;
      btnGroupSortHtml += nsButton.getHtml(btnJson, 'table', sortI, true, false);
    }
    tableBtnJson['order'] = sortBtnArr;
  }
  if (uiConfig.isAllowExport) {
    btnGroupExportHtml = '<button class="btn btn-white btn-icon dropdown-toggle btn-export" data-toggle="dropdown">'
      + '<i class="fa fa-save"></i>'
      + '<span> ' + language.datatable.label.export + '</span>'
      + '<span class="caret"></span>'
      + '</button>'
      + '<ul role="menu" class="dropdown-menu dropdown-green">'
      + '<li fid="allCsv">'
      + '<a href="javascript:void(0);">' + language.datatable.label.exportCSVDocuments + '</a>'
      + '</li>'
      + '<li fid="visiableCsv">'
      + '<a href="javascript:void(0);">' + language.datatable.label.exportVisableCSVDocuments + '</a>'
      + '</li>'
      + '<li fid="selectedCsv">'
      + '<a href="javascript:void(0);">' + language.datatable.label.exportCsvSelectedDocuments + '</a>'
      + '</li>'
      + '<li fid="unSelectedCsv">'
      + '<a href="javascript:void(0);">' + language.datatable.label.exportCsvUnSelectedDocuments + '</a>'
      + '</li>'
      + '<li class="divider"></li>'
      + '<li fid="allXls">'
      + '<a href="javascript:void(0);">' + language.datatable.label.exportExcelDocuments + '</a>'
      + '</li>'
      + '<li fid="visiableXls">'
      + '<a href="javascript:void(0);">' + language.datatable.label.exportVisableDocuments + '</a>'
      + '</li>'
      + '<li fid="selectedXls">'
      + '<a href="javascript:void(0);">' + language.datatable.label.exportSelectedDocuments + '</a>'
      + '</li>'
      + '<li fid="unSelectedXls">'
      + '<a href="javascript:void(0);">' + language.datatable.label.exportUnSelectedDocuments + '</a>'
      + '</li>'
      + '</ul>';
    tableBtnJson['export'] = uiConfig.exportBtn;
  }
  var btnGroupColumnsHtml = '';
  //允许选择列
  if (uiConfig.isSelectColumns) {
    var columnsLiStr = "";
    for (var i = 0; i < columnConfig.length; i++) {
      if (i == 0) {
        columnsLiStr += '<li class="dropdown-header">' + language.datatable.label.selectDisplayDataColumn + '</li>'
      }
      var checkedStr = columnConfig[i].hidden ? "" : "checked"
      columnsLiStr += '<li><div class="checkbox">'
        + '<label><input type="checkbox" name="checkbox-columns" columnID="' + i + '" ' + checkedStr + '>' + columnConfig[i].title + '</label>'
        + '</div></li>';
    }
    columnsLiStr += '<li class="divider"></li>'
      + '<li>'
      + '<a href="javascript:void(0)" columnID="all");">' + language.datatable.label.showAll + '</a>'
      + '</li>';

    btnGroupColumnsHtml = '<button class="btn btn-white btn-icon dropdown-toggle btn-viewcloumn" data-toggle="dropdown">'
      + '<i class="fa fa-eye"></i>'
      + '<span>' + language.datatable.label.selectColumn + '</span>'
      + '<span class="caret"></span>'
      + '</button>'
      + '<ul role="menu" class="dropdown-menu dropdown-green dropdown-cloumns" id="dropdown-cloumns-' + tableID + '">'
      + columnsLiStr
      + '</ul>';
    if (uiConfig.columnHandler) {
      tableBtnJson['column'] = uiConfig.columnHandler;
    }
  }
  var btnTitleHtml = typeof (btnConfig.title) == 'string' ? '<div class="btn-title">' + btnConfig.title + '</div>' : '';
  var btnNoteHtml = '';
  if(btnConfig.html){
    btnNoteHtml = '<div class="btn-notes">'+btnConfig.html+'</div>';
  }
  btnGroupBaseHtml = btnGroupBaseHtml == "" ? '' : '<div class="btn-group" nstable-btn="baseBtn">' + btnGroupBaseHtml + '</div>';
  btnGroupSelfHtml = btnGroupSelfHtml == "" ? '' : '<div class="btn-group" nstable-btn="selfBtn">' + btnGroupSelfHtml + '</div>';
  btnGroupSortHtml = btnGroupSortHtml == "" ? '' : '<div class="btn-group" nstable-btn="orderBtn">' + btnGroupSortHtml + '</div>';
  btnGroupExportHtml = btnGroupExportHtml == "" ? '' : '<div class="btn-group" nstable-btn="exportBtn">' + btnGroupExportHtml + '</div>';
  btnGroupColumnsHtml = btnGroupColumnsHtml == "" ? '' : '<div class="btn-group" nstable-btn="columnBtn">' + btnGroupColumnsHtml + '</div>';
 
  var controlDomID = 'control-btn-toolbar-' + tableID;
  //是否自定义根据列字段搜索 
  var columnsSelectHtml = '';
  var columnBtnHtml = '';
  var columnsSelectID = 'control-'+tableID+'-form';
  if(uiConfig.isUseTableControl){
    columnBtnHtml = '<button type="button" class="btn btn-icon btn-white th-btn-last" ns-select="column"><i class="fa-ellipsis-v"></i></button>';
  }
  var controlClassStr = 'control-btn-toolbar';
  if(uiConfig.isColumnSearchHidden == true || uiConfig.browerSystem == 'mobile'){
    controlClassStr += ' columnform-control-btn-toolbar';
    var classStr = 'table-columnselect';
    if(uiConfig.isUseTableControl){
      classStr += ' '+'columnselect';
    }
    columnsSelectHtml = '<div class="'+classStr+'" id="'+columnsSelectID+'"></div>';
  }
  var controlHtml = '<div id="' + controlDomID + '" class="'+controlClassStr+'">' + btnTitleHtml + btnGroupBaseHtml + btnGroupSelfHtml + btnGroupSortHtml + btnGroupExportHtml + btnGroupColumnsHtml + columnBtnHtml + columnsSelectHtml+btnNoteHtml+'</div>';
  var controlDom = $(controlHtml);
  $("#" + tableID).closest(".table-responsive").before(controlDom);
  baseDataTable.formatHandler[tableID].tableBtnDom = controlDom;
  baseDataTable.formatHandler[tableID].tableBtnJson = tableBtnJson;
  if(uiConfig.isColumnSearchHidden == true || uiConfig.browerSystem == 'mobile'){
    //生成form表单
    var subdata = [];
    for(var columnI=0; columnI<columnConfig.length; columnI++){
        if(columnConfig[columnI].formatHandler){
          // 定义了formatHandler
        }else{
          if(columnConfig[columnI].title && columnConfig[columnI].searchable && !columnConfig[columnI].hidden){
            //并且状态是可见
            subdata.push({
              id:columnConfig[columnI].field,
              name:columnConfig[columnI].title
            });
          }
        }
    }
    var formIsShowicon = false;
    var formIsShowtext = true;
    var formInputBtntext = '搜索';
    if(uiConfig.browerSystem == 'mobile'){
      formInputBtntext = '取消';
      var formContidionHtml = '';
      var formID = tableID.substring(tableID.indexOf('-')+1,tableID.lastIndexOf('-'));
      formID = formID +'-form';
      if($('[id="ns-template"]').children('.page-title.nav-form').hasClass('searchPage')){
        formContidionHtml = '<button type="button" class="btn btn-info btn-icon" ns-type="contidion"><i class="icon-filter-o"></i></button>'
        var formBtnHtml = '<div class="searchpage-form-confirmbtn">'
                              +'<button type="button" class="btn btn-info btn-icon"><span>重置</span></button>'
                              +'<button type="button" class="btn btn-info btn-icon"><span>确定</span></button>'
                         +'</div>';
        $('#form-'+formID).append(formBtnHtml);
        var clearFormBtnHtml = '<div class="searchPage-form-clearbtn"><button type="button" class="btn btn-info btn-icon"><i class="icon-trash-o"></i></button></div>';
        $('#form-'+formID).parent().children('.search-list').append(clearFormBtnHtml);
      }
      var html = '<div class="page-nav-mobile">'
                    +formContidionHtml
                    +'<button type="button" class="btn btn-info btn-icon" ns-type="search"><i class="icon-search"></i></button>'
                    +'<button type="button" class="btn btn-info btn-icon" ns-type="button"><i class="icon-ellipsis-v"></i></button>'
                +'</div>';
      $('#'+columnsSelectID).css('display','none');
      $('[nstable-btn="selfBtn"]').css('display','none');
      $('.page-title.nav-form').after(html);
      $('.page-nav-mobile > button[type="button"]').off('click');
      $('.page-nav-mobile > button[type="button"]').on('click',function(ev){
        var type = $(this).attr('ns-type');
        if(type == "search"){
           $('#'+columnsSelectID).css('display','block');
        }else if(type == "button"){
          var $selfBtn =$('[nstable-btn="selfBtn"]');
          if($selfBtn.css('display')=='none'){
            $selfBtn.css('display','block');
          }else{
            $selfBtn.css('display','none');
          }
        }else if(type == 'contidion'){
            var $this = $(this);
            var $form = $('#form-'+formID);
            var $searchList = $form.parent().children('.search-list');
            if($searchList.hasClass('search-filter')){
                $searchList.removeClass('search-filter');
                $form.removeClass('show');
                $(".nav-tabs").removeClass('show');
            }else{
                $searchList.addClass('search-filter');
                $(".nav-tabs").addClass('show');
                $form.addClass('show');
            }
        }
      });
    }
    if(subdata.length > 0){  
        var formJson = {
          id:columnsSelectID,
          plusClass:'table-form',
          form:[
            {
              id:'searchField',
              type:'select',
              column:0,
              textField:'name',
              valueField:'id',
              subdata:subdata
            },{
              id:'searchValue',
              type:'text-btn',
              column:0,
              commonChangeHandler:function(obj,value){
                if(uiConfig.browerSystem == 'mobile'){
                    if(obj.dom.parent().children('.mobile-close').length > 0){obj.dom.parent().children('.mobile-close').remove();}
                    obj.dom.after('<a href="javascript:void(0)" class="mobile-close"></a>');
                    obj.dom.parent().children('.mobile-close').on('click',function(ev){
                      var $this = $(this);
                      var $input = $this.parent().children('input[type="text"]');
                      $input.val('');
                      $this.remove();
                    });
                }
              },
              onKeyChange:true,
              changeHandler:function(val,$dom,ev){
                 if(ev.keyCode == 13){
                      if(uiConfig.browerSystem == 'mobile'){
                         $('#'+columnsSelectID).css('display','none');
                      }
                      var formData = nsForm.getFormData(columnsSelectID);
                      var jsonData = {
                        type:'global',
                        tableID:tableID,
                        value:formData.searchValue.value
                      }
                      baseDataTable.getSearchHandler(jsonData);
                }
              },
              btns:[{text:formInputBtntext,isShowText:formIsShowtext,isShowIcon:formIsShowicon,handler:function(){
                if(uiConfig.browerSystem == 'mobile'){
                     $('#'+columnsSelectID).css('display','none');
                      var formData = nsForm.getFormData(columnsSelectID);
                      var jsonData = {
                        type:'global',
                        tableID:tableID,
                        value:formData.searchValue.value
                      }
                      baseDataTable.getSearchHandler(jsonData);
                }else{
                  if(dataConfig.isServerMode){
                     var cID = tableID.substring(tableID.indexOf('-')+1,tableID.lastIndexOf('-'));
                     formID = cID + '-form';
                     var formJson = nsForm.getFormJSON(formID);
                     var formData = nsForm.getFormJSON(columnsSelectID);
                     /*var jsonData = {};
                     if(formData.searchValue.value){
                        jsonData[formData.searchValue.value] = formData.searchValue.value;
                     }*/
                     var jsonData = $.extend(formData,formJson);
                     if(typeof(nsTemplate.templates.searchPage.data[cID].beforeSubmitHandler)=='function'){
                        jsonData = nsTemplate.templates.searchPage.data[cID].beforeSubmitHandler(jsonData);
                        if(jsonData === false){return;}
                     }
                     baseDataTable.reloadTableAJAX(tableID,jsonData);
                  }else{
                    //本地搜索
                        var formData = nsForm.getFormData(columnsSelectID);
                        var jsonData = {
                            type:'global',
                            tableID:tableID,
                            value:formData.searchValue.value
                          }
                        baseDataTable.getSearchHandler(jsonData);
                  }
                }
              }}]
            }
          ]
        }
        nsForm.formInit(formJson,$('#'+columnsSelectID));
    }
  }
  //只有有btnConfig存在
	/*if(!$.isEmptyObject(btnConfig) && !isSearch){
		$("#"+tableID).closest(".table-responsive").css({'padding-top':'48px'});
	}else{
		$('#'+tableID).closest(".table-responsive").removeAttr('style');
	}*/
}
/**
 * 将easyUI的表格数据格式转换成DataTable的表格数据格式
 * 
 * @returns columnData(转化后的Json) searchPlaceholderStr(默认的搜索输入框文字)
 */
baseDataTable.convertColumnData = function (tableID, columnConfig, uiConfig, primaryID) {

  //sjj20190118 添加列状态
  if(uiConfig.isRowState == false){
    if(uiConfig.isUseMessageState){
      if(nsTable.messageState){
        if(typeof(nsTable.messageState.isColumn)=='boolean'){
          if(nsTable.messageState.isColumn == true){
            columnConfig.unshift({
              width:nsTable.messageState.width,
              formatHandler:{
                type:'columnState',
                data:{
                  type:'message',
                  data:nsTable.messageState.data
                }
              }
            });
          }
        }
      }
    }
  }

  var searchPlaceholderStr = "";
  var columnData = new Array();
  var columnUsedWidth = 0;
  var columnWithoutWidthArray = [];
  var tableWidth = $('#' + tableID).outerWidth();
  //tab形式的表格按照tab容器取宽度
  if ($('#' + tableID).closest('.tab-content').length > 0) {
    tableWidth = $('#' + tableID).closest('.tab-content').outerWidth() - 2;
  }
  //如果是带图表的，要根据配置宽度修正
  if (uiConfig.chart) {
    if (uiConfig.chart.width) {
      tableWidth = uiConfig.chart.width * tableWidth / 100;
    }
  }
  //横向滚动条
  if (typeof (uiConfig.scrollX) == 'boolean') {
    if (uiConfig.scrollX) {
      tableWidth = 0;
      for (var i = 0; i < columnConfig.length; i++) {
        if (typeof (columnConfig[i].width) != 'number') {
          isSetWidth = false;
          if (debugerMode) {
            if (typeof (columnConfig[i].hidden) == 'boolean') {
              if (columnConfig[i].hidden != true) {
                console.error(columnConfig[i]);
                console.error('scrollX为true，则所有宽度(width)必须为数字');
              }
            } else {
              console.error(columnConfig[i]);
              console.error('scrollX为true，则所有宽度(width)必须为数字');
            }
          }
          break;
        } else {
          tableWidth += columnConfig[i].width;
        }
      }
      //$('#'+tableID).css('width',tableWidth+'px');
      $('#' + tableID).css('min-width', tableWidth + 'px');
    }
  };
  var columnStateStr;
  var rowStateField;

  if (typeof (uiConfig.rowState) == 'object') {
    if (!$.isEmptyObject(uiConfig.rowState)) {
      //如果定义了行状态配置
      if (typeof (uiConfig.rowState.field) == 'object') {
        if (!$.isEmptyObject(uiConfig.rowState.field)) {
          columnStateStr = uiConfig.rowState.field.column;
          rowStateField = uiConfig.rowState.field;
        }
      }
    }
  }

  var originalTableConfig = baseDataTable.originalConfig[tableID];

  var originalColumnConfig = originalTableConfig.columnConfig;

  for (var i = 0; i < columnConfig.length; i++) {
    var visibleBln = true;
    if (columnConfig[i].hidden) {
      visibleBln = false;
    }
    var orderableBln = false;
    if (columnConfig[i].orderable) {
      orderableBln = true;
    }
    var searchableBln = false;
    if (columnConfig[i].searchable) {
      searchableBln = true;
      if (searchPlaceholderStr != "") {
        searchPlaceholderStr += "，"
      }
      searchPlaceholderStr += columnConfig[i].title;
    }
    var columnWidth = 0;
    var columnMinWidth = 0;
    if (typeof (columnConfig[i].width) != 'undefined') {
      columnMinWidth = Number(columnConfig[i].width);
      columnUsedWidth += columnMinWidth;
      //columnWidth = columnMinWidth/tableWidsth*100+'%';
      columnWidth = Number(columnConfig[i].width);
    } else {
      columnWithoutWidthArray.push(i);
    }
    var tabPosition = typeof (columnConfig[i].tabPosition) == 'undefined' ? 'auto' : columnConfig[i].tabPosition;
    var cDataConfig = {
      name: columnConfig[i].field,
      data: columnConfig[i].field,
      title: columnConfig[i].title,
      minWidth: columnMinWidth,
      width: columnWidth,
      visible: visibleBln,
      orderable: orderableBln,
      searchable: columnConfig[i].searchable,
      nsIndex: i + 1,
      //记录tab相关选项用
      tabPosition: tabPosition,
    }
    //20180912 by sjj 行 列颜色配置
    if(typeof(columnConfig[i].rowColor)=='object'){
      cDataConfig.rowColor = columnConfig[i].rowColor;
    }
    if(typeof(columnConfig[i].cellColor)=='object'){
      cDataConfig.cellColor = columnConfig[i].cellColor;
    }
    //列默认值 by caoyuan 20180130
    if(typeof (columnConfig[i].defaultContent) != 'undefined'){
      cDataConfig.defaultContent = columnConfig[i].defaultContent;
    }
    if (columnConfig[i].total == true) {
      cDataConfig.total = columnConfig[i].total;
    }
    cDataConfig.tooltip = typeof (columnConfig[i].tooltip) == 'boolean' ? columnConfig[i].tooltip : false;
    cDataConfig.precision = columnConfig[i].precision ? Number(columnConfig[i].precision) : 0;
    if (columnConfig[i].records == true) {
      cDataConfig.records = columnConfig[i].records;
    }
    //如果当前列值等于要显示状态列的字段则定义
    if (typeof (columnStateStr) != 'undefined') {
      if (columnConfig[i].field == columnStateStr) {
        columnConfig[i].formatHandler = {
          type: 'columnState',
          data: rowStateField
        };
      }
    }
    /*******原始值类型转换formathandler*******/
    if(originalColumnConfig[i]){
        switch(originalColumnConfig[i].inputType){
          case 'provinceSelect':
          case 'province-select':
          case 'provicelink-select':
          case 'provincelinkSelect':
            columnConfig[i].formatHandler = {
                type:'codeToName'
            }
            break;
        }
    }
    /*******原始值类型转换formathandler*******/
    if (typeof (columnConfig[i].formatHandler) != 'undefined') {
      var formatHandlerObj = {};
      if (typeof (columnConfig[i].formatHandler) == 'function') {
        formatHandlerObj.type = 'func';
        formatHandlerObj.data = {};
        formatHandlerObj.data.handler = columnConfig[i].formatHandler;
        if (typeof (columnConfig[i].formatType) != 'undefined') {
          var formattype = {};
          if (typeof (columnConfig[i].formatType) == 'string') {
            formattype.type = columnConfig[i].formatType;
            formattype.format = '';
          } else {
            formattype = columnConfig[i].formatType;
          }
          if (formattype.format === '' || typeof (formattype.format) == 'undefined') {
            if (formattype.type == 'number') {
              formattype.format = '0';//数值类型，0代表取整
            } else if (formattype.type == 'date') {
              formattype.format = 'YYYY-MM-DD';
            }
          }
          formatHandlerObj.data.format = formattype;
        }
      } else {
        formatHandlerObj = columnConfig[i].formatHandler;
      }
      cDataConfig.formatHandler = formatHandlerObj;
    } else {
      //如果未定义formathandler判断是否有formattype
      if (typeof (columnConfig[i].formatType) != 'undefined') {
        var formatHandlerObj = {};
        formatHandlerObj.type = 'format';
        var formattype = {};
        if (typeof (columnConfig[i].formatType) == 'string') {
          formattype.type = columnConfig[i].formatType;
          formattype.format = '';
        } else {
          formattype = columnConfig[i].formatType;
        }
        if (formattype.format === '' || typeof (formattype.format) == 'undefined') {
          if (formattype.type == 'number') {
            formattype.format = 0;//数值类型，0代表取整
          } else if (formattype.type == 'date') {
            formattype.format = 'YYYY-MM-DD';
          }
        }
        formatHandlerObj.data = formattype;
        cDataConfig.formatHandler = formatHandlerObj;
      }else if(typeof(columnConfig[i].tooltip)=='boolean'){
        if(columnConfig[i].tooltip == true){
          cDataConfig.formatHandler = {
            type:'tooltip'
          };
        }
      }
    }
    columnData.push(cDataConfig);
  }
  //把未使用的宽度平均分配出去 scroolX和tab模式下都不经过这个
  var unusedWidth = tableWidth - columnUsedWidth - 40;
  unusedWidth = unusedWidth / columnWithoutWidthArray.length;
  for (var unusedI = 0; unusedI < columnWithoutWidthArray.length; unusedI++) {
    columnData[columnWithoutWidthArray[unusedI]].width = unusedWidth / tableWidth * 100 + '%';
    columnData[columnWithoutWidthArray[unusedI]].minwidth = unusedWidth;
  }
//sjj20180321 是否开启默认读取本地存储
var isUserLocalStorage = typeof(uiConfig.isUserLocalStorage)=='boolean' ? uiConfig.isUserLocalStorage : true;
if(isUserLocalStorage){
    var localStorage = store.get('cw-' + tableID);
    if (typeof (localStorage) == 'object') {
      if (typeof (localStorage.field) == 'object') {
        for (var columnI = 0; columnI < columnData.length; columnI++) {
          var localStorageField = localStorage.field[columnData[columnI].data];
          if (typeof(localStorageField) == 'object') {
            if(typeof(localStorageField.t) == 'string'){
              columnData[columnI].title = localStorageField.t;
            }
            if (typeof(localStorageField.tp) == 'number' || typeof(localStorageField.tp) == 'string') {
              columnData[columnI].tabPosition = localStorageField.tp;
            }
            if (typeof(localStorageField.w) == 'number') {
              columnData[columnI].width = localStorageField.w;
            }
            if (typeof(localStorageField.v) == 'boolean') {
              columnData[columnI].visible = localStorageField.v;
            }
            if (typeof(localStorageField.i) == 'number') {
              columnData[columnI].nsIndex = localStorageField.i;
            }
          }
        }
      }
      if (typeof (localStorage.uiConfig) == 'object') {
        if ($.isArray(localStorage.uiConfig.n)) {
          uiConfig.tabsName = localStorage.uiConfig.n;
        }
        if ($.isArray(localStorage.uiConfig.v)) {
          uiConfig.tabsVisible = localStorage.uiConfig.v;
        }
        if (typeof(localStorage.uiConfig.i) == 'number') {
          uiConfig.tabsDefaultIndex = localStorage.uiConfig.i;
        }
      }
    }
}
  var tData = {
    data: primaryID,
    title: "&nbsp;",
    searchable: false,
    orderable: false,
    width: 40,
    minWidth: 40,
    cellType: "th",
    tabPosition: 'before',
    visible: true,
    nsIndex: 0
  };
  //sjj 20180917 根据主键id添加行 列class
  if(typeof(uiConfig.addColorByPrimaryId)=='object'){
    /*
      *格式 {rowColor:{0:'msg'},cellColor:{1:'success'}}
    */
    for(var color in uiConfig.addColorByPrimaryId){
      tData[color] = uiConfig.addColorByPrimaryId[color];
    }
  }
  if(originalTableConfig.dataConfig.isSerialNumber){
    //显示序列号
    columnData.unshift(tData);
  }

  //读取本地存储中的宽度信息  设置columns对象
  

  //如果不使用tabs就不用重新整理数据了，直接返回当前数据
  if (typeof (uiConfig.isUseTabs) == 'undefined') {
    uiConfig.isUseTabs = false;
  }
  if ($.isArray(uiConfig.tabsName)) {
    uiConfig.isUseTabs = true;
  }
  if (uiConfig.isUseTabs == false) {
    columnData = columnData.sort(function(a,b){return a.nsIndex - b.nsIndex;})
    return [columnData, searchPlaceholderStr];
  } else {
    //整理数据 执行下面语句
  }
  //TAB切换相关 start------------------------------------------
  //先提示冲突属性
  if (debugerMode) {
    if (uiConfig.scrollX) {
      console.error('tabs模式与scrollX模式冲突');
    }
  }
  //默认tab和打开的tab索引
  if (typeof (uiConfig.tabsDefaultIndex) != 'number') {
    uiConfig.tabsDefaultIndex = 0;
  }
  uiConfig.tabsActiveIndex = uiConfig.tabsDefaultIndex;
  uiConfig.originalTabsName = $.extend(true, [], uiConfig.tabsName);
  //获取排序后的表格
  function getTabOption() {
    var columnWidthTotal = 0;
    var columnWidthBefore = 0;
    var columnWidthAfter = 0;
    var columnWidthTabs = 0;

    //拆分
    var beforeArr = [];
    var tabsArr = [];
    var afterArr = [];
    var sortArr = [];
    var hiddenArr = [];
    for (var columnI = 0; columnI < columnData.length; columnI++) {
      columnOption = columnData[columnI];
      //只处理要显示的
      if (columnOption.visible) {
        if (typeof (columnOption.width) == 'number') {
          //分成三部分，前面固定的，后面固定的，中间可切换的
          switch (columnOption.tabPosition) {
            case 'before':
              columnWidthBefore += columnOption.width;
              beforeArr.push(columnOption);
              break;
            case 'after':
              columnWidthAfter += columnOption.width;
              afterArr.push(columnOption);
              break;
            default:
              columnWidthTabs += columnOption.width;
              tabsArr.push(columnOption);
              break;
          }
          columnWidthTotal += columnData[columnI].width;
        } else {
          columnWidthTotal += 100;
          if (debugerMode) {
            console.warn('表格的tab模式下必须全部列都设定宽度');
            console.warn(columnData[columnI]);
          }
        }
      } else {
        hiddenArr.push(columnOption);
      }

    }
    beforeArr.sort(function(a,b){
      return a.nsIndex-b.nsIndex;
    });

    tabsArr.sort(function(a,b){
      return a.nsIndex-b.nsIndex;
    });

    afterArr.sort(function(a,b){
      return a.nsIndex-b.nsIndex;
    });
    sortArr = sortArr.concat(beforeArr, tabsArr, afterArr, hiddenArr);
    for (var sortColumnI = 0; sortColumnI < sortArr.length; sortColumnI++) {
      sortArr[sortColumnI].nsIndex = sortColumnI;
      sortArr[sortColumnI].isVisableColumn = sortArr[sortColumnI].visible;		//原始显示的是否显示
      sortArr[sortColumnI].originalWidth = sortArr[sortColumnI].width;
      sortArr[sortColumnI].originalTabPosition = sortArr[sortColumnI].tabPosition;
    }

    //控制显示列和隐藏列
    var tableColumnVisibleWidth = 0;
    if (uiConfig.$table.closest('.table-responsive').innerWidth() == 0) {
      tableColumnVisibleWidth = uiConfig.$table.closest('.tab-content').innerWidth();
    } else {
      tableColumnVisibleWidth = uiConfig.$table.closest('.table-responsive').innerWidth() - 2;
    }
    var columnWidthTabVisible = tableColumnVisibleWidth - columnWidthBefore - columnWidthAfter;

    //分组处理
    var tabsGroup = [];  		//保存拆开了的column 
    var isAutoGroup = false;
    var tabsGroupWidthArr = []; //设置的宽度分组
    if ($.isArray(uiConfig.tabsName)) {
      for (var tabsNameI = 0; tabsNameI < uiConfig.tabsName.length; tabsNameI++) {
        tabsGroup.push([]);
        tabsGroupWidthArr.push(0);
      }
      isAutoGroup = false;
    } else {
      tabsGroup.push([]);  //自动分组，初始化一个空数组进去
      tabsGroupWidthArr.push(0); //初始化第一个宽度临时数
      isAutoGroup = true
    }
    //自动分组处理
    function autoGroup() {
      var tabsGroupIndex = 0; 	//分组index
      var usedTabsWidth = 0; 		//临时宽度变量
      for (var tabsColumnI = 0; tabsColumnI < tabsArr.length; tabsColumnI++) {
        //自动分组处理，根据宽度自动分派组
        if (usedTabsWidth + tabsArr[tabsColumnI].width <= columnWidthTabVisible) {
          //范围内的
          usedTabsWidth += tabsArr[tabsColumnI].width;
        } else {
          //不够用了，要添加新的tab了
          tabsGroupIndex++;
          tabsGroup.push([]);
          tabsGroupWidthArr[tabsGroupIndex] = 0;
          usedTabsWidth = 0;
          usedTabsWidth += tabsArr[tabsColumnI].width;
        }
        //显示第一列
        if (tabsGroupIndex == uiConfig.tabsActiveIndex) {
          tabsArr[tabsColumnI].visible = true;
        } else {
          tabsArr[tabsColumnI].visible = false;
        }
        //tabsArr[tabsColumnI].width = (tabsArr[tabsColumnI].width/tableColumnVisibleWidth)*100+'%'
        tabsGroup[tabsGroupIndex].push(tabsArr[tabsColumnI]);
        tabsGroupWidthArr[tabsGroupIndex] += tabsArr[tabsColumnI].width;
      }
    }
    //按照名称分组
    function nameGroup() {
      var originalTabLength = tabsGroup.length;
      var tempUnnameWidth = 0;  //未指定分组的列宽度总和，临时
      var tabsGroupIndex = 'auto';
      for (var tabsColumnI = 0; tabsColumnI < tabsArr.length; tabsColumnI++) {
        //自动分组处理，根据宽度自动分派组
        tabsGroupIndex = tabsArr[tabsColumnI].tabPosition;
        //如果是未定的，则添加
        if (tabsGroupIndex == 'auto') {
          tabsGroupIndex = originalTabLength;
          //如果还没有这个数组，就先添加
          if (tabsGroupIndex == tabsGroup.length) {
            tabsGroup.push([]);
            tabsGroupWidthArr.push(0);
          }
          if (tempUnnameWidth + tabsArr[tabsColumnI].width > columnWidthTabVisible) {
            tabsGroup.push([]);
            tabsGroupWidthArr.push(0);
            tabsGroupIndex++;
            originalTabLength++;
            tempUnnameWidth = 0;
          }
          tempUnnameWidth += tabsArr[tabsColumnI].width;
          tabsArr[tabsColumnI].tabPosition = tabsGroupIndex;
        }

        if (tabsGroupIndex == uiConfig.tabsActiveIndex) {
          tabsArr[tabsColumnI].visible = true;
        } else {
          tabsArr[tabsColumnI].visible = false;
        }
        tabsGroup[tabsGroupIndex].push(tabsArr[tabsColumnI]);
        tabsGroupWidthArr[tabsGroupIndex] += tabsArr[tabsColumnI].width;
      }
    }
    if (isAutoGroup) {
      autoGroup();
    } else {
      nameGroup();
    }

    //重新计算分组后表格列 用可视比例划分
    for (var tabI = 0; tabI < tabsGroup.length; tabI++) {
      //每个tab一个宽度比例
      var tabResizeScale = columnWidthTabVisible / tabsGroupWidthArr[tabI];
      var resizeColumnWidth = 0;
      for (var tabColumnI = 0; tabColumnI < tabsGroup[tabI].length; tabColumnI++) {
        //重新计算宽度
        var reszieTabColumn = tabsGroup[tabI][tabColumnI];
        var resizeWidth = reszieTabColumn.width * tabResizeScale;
        reszieTabColumn.minWidth = reszieTabColumn.width = resizeWidth/columnWidthTabVisible*100 + '%';
        resizeColumnWidth += resizeWidth;
      }
    }

    //保存名称
    var tabPlusSort = 1; 	  //排序号
    var tabPlusLength = 0;  //要添加的名字数量
    if ($.isArray(uiConfig.tabsName)) {
      tabPlusLength = tabsGroup.length - uiConfig.tabsName.length;
    } else {
      uiConfig.tabsName = [];
      tabPlusLength = tabsGroup.length;
    }
    for (var plusTabI = 0; plusTabI < tabPlusLength; plusTabI++) {
      var plusTabName = tabPlusSort.toString();
      uiConfig.tabsName.push(plusTabName);
      tabPlusSort++;
    }

    //控制是否显示的数组
    var originalTabsVisible = [];
    var tabsVisible = [];
    if ($.isArray(uiConfig.tabsVisible)) {
      for (var tabVisibleI = 0; tabVisibleI < uiConfig.tabsVisible.length; tabVisibleI++) {
        originalTabsVisible.push(uiConfig.tabsVisible[tabVisibleI]);
        tabsVisible.push(uiConfig.tabsVisible[tabVisibleI] == 1)
      }
    } else {
      //默认全部显示
      for (var tabNameI = 0; tabNameI < uiConfig.originalTabsName.length; tabNameI++) {
        originalTabsVisible.push(1);
        tabsVisible.push(true);
      }
    }
    //是否存在未指定是否显示的列
    if (tabsVisible.length < uiConfig.tabsName.length) {
      var plusVisible = true;
      //如果有未存在的列判断是否存在指定了自动显示列
      if (uiConfig.originalTabsName.length == originalTabsVisible.length) {
        //长度相等，则使用默认的true
        plusVisible = true;
      } else if (uiConfig.originalTabsName.length > originalTabsVisible.length) {
        //原始长度都比visible设置的还长了，填错了，可能会导致匹配错误
        if (debugerMode) {
          console.error('tabsVisible参数与tabsName参数设置有冲突，请核实');
          console.error(uiConfig.originalTabsName);
          console.error(originalTabsVisible);
        }
        plusVisible = true;
      } else {
        //只多一位，那么这就是全部自动显示列的宽度
        //多了不止一位 仍然读取最后一个是否显示来确认多出来的是否显示
        plusVisible = tabsVisible[tabsVisible.length - 1];
      }
      //长度不匹配，需要补充
      for (var plusVisibleI = tabsVisible.length; plusVisibleI < uiConfig.tabsName.length; plusVisibleI++) {
        tabsVisible.push(plusVisible);
      }
    }

    uiConfig.originalTabsVisible = originalTabsVisible;
    uiConfig.tabsVisible = tabsVisible;
    if (tabsVisible[uiConfig.tabsActiveIndex] == false) {
      if (debugerMode) {
        console.warn('默认显示TAB分组 tabsDefaultIndex：' + uiConfig.tabsDefaultIndex + ' 是隐藏分组，请修改');
      }
      uiConfig.tabsActiveIndex = 0;
    }

    //生成回调对象
    var tabData = {
      sortArr: sortArr,
      tabWidthOptions: {
        columnWidthTotal: columnWidthTotal,
        columnWidthBefore: columnWidthBefore,
        columnWidthAfter: columnWidthAfter,
        columnWidthTabs: columnWidthTabs,
        columnWidthTabVisible: columnWidthTabVisible,
        tableColumnVisibleWidth: tableColumnVisibleWidth
      },
      tabColumn: {
        before: beforeArr,
        tabs: tabsArr,
        tabGroup: tabsGroup,
        after: afterArr,
        hidden: hiddenArr
      }
    }
    return tabData;
  }
  var tabOptions = getTabOption();
  uiConfig.tabOptions = tabOptions.tabWidthOptions;
  uiConfig.tabColumn = tabOptions.tabColumn;
  columnData = tabOptions.sortArr;
  //TAB切换相关 end------------------------------------------
  return [columnData, searchPlaceholderStr];
}

/*******自定义事件********************/
baseDataTable.formatHandler.getPlaceholder = function (tableID) {
  var cDataTable = baseDataTable.table[tableID];
  var validateArr = baseDataTable.formatValidate[tableID].validateArr;			//需要验证的列
  var rules = baseDataTable.formatValidate[tableID].rules;						//规则
  var $tr = baseDataTable.container[tableID].trObj;
  baseDataTable.formatValidate[tableID].rulesJson = {};
  if (validateArr.length > 0 && $tr.length > 0) {
    $.each($tr, function (key, value) {
      if (typeof ($(this).attr('ns-tr')) == 'undefined') {
        var rowIndex = baseDataTable.table[tableID].row($(this).index());
        if (rowIndex.length > 0) {
          var data = baseDataTable.table[tableID].row($(this)).data();
          if (typeof (data) == 'object') {
            if (!$.isEmptyObject(data)) {
              var rowIndex = 'row-' + key;
              for (var columnI = 0; columnI < validateArr.length; columnI++) {
                var columnField = baseDataTable.getDataFieldIndex(tableID);	//列下标
                var currentData = data[columnField[validateArr[columnI]]];	//当前列数据

                var $dom = $(this).children('td').children('[columnid="' + validateArr[columnI] + '"]');
                if ($dom.length > 1) {
                  var container = $dom[0];
                  $dom = $(container);
                }
                var type = $dom.attr('ns-table');
                switch (type) {
                  case 'selectbase':
                    currentData = $.trim($dom.val());
                    break;
                }
                var ruleJson = {
                  value: currentData,
                  rules: rules[validateArr[columnI]],
                  data: data,
                }
                var placeHolderStr = commonConfig.getPlaceHolder(ruleJson);
                var isReturn = baseDataTable.columnValueValidate(ruleJson);
                var ruleID = rowIndex + 'col-' + validateArr[columnI];
                if (isReturn == false) {
                  $dom.css({ 'border': '1px solid red' });
                }
                baseDataTable.formatValidate[tableID].rulesJson[ruleID] = isReturn;
              }
            }
          }
        }
      }
    })
  }
}
/**
*功能：验证自定义组件*
***/
baseDataTable.validateCustomizePlane = function (tableID, primaryID) {
  var rules = baseDataTable.formatValidate[tableID].rulesJson;
  var isReturn = false;
  if (typeof (rules) == 'object') {
    if (!$.isEmptyObject(rules)) {
      for (var ruleI in rules) {
        if (rules[ruleI] == false) {
          return false;
        }
      }
    }
  }
  return true;
}
baseDataTable.columnValueValidate = function (ruleJson) {
  var rulesStr = ruleJson.rules;
  var valueStr = ruleJson.value;
  var data = ruleJson.data;
  if (typeof (rulesStr) == 'string') {
    var rulesArr = rulesStr.split(' ');						//拿到规则，规则有可能有多个
    for (var ruleI = 0; ruleI < rulesArr.length; ruleI++) {
      var getRulesStr = baseDataTable.getValidateRules(rulesArr[ruleI], valueStr, data);
      if (getRulesStr == false) {
        return false;
      }
    }
  }
  return true;
}
baseDataTable.getValidateRules = function (rules, valueStr, data) {
  var matchStr = true;
  var rulesStr;	//要验证的具体内容
  if (rules.indexOf('=') > -1) {
    //含有=号的
    //minlength min max maxlength precison equalTo range rangelength less
    rulesStr = rules.substring(rules.lastIndexOf('=') + 1, rules.length);
    rules = rules.substring(0, rules.lastIndexOf('='));
  }
  switch (rules) {
    case 'required':
    case 'selectbase':
    case 'select':
      if (typeof (valueStr) == 'string') {
        if (valueStr === '') {
          matchStr = false;
        }
      } else if (typeof (valueStr) == 'object') {
        if ($.isEmptyObject(valueStr)) {
          matchStr = false;
        }
      }
      break;
    case 'less':
      //小于现在是只有验证数字是否小于 以后需要补充字符串数量是否少于等的判断
      var currentNumber = Number(valueStr);
      var compareNumber = Number(data[rulesStr]);
      if (currentNumber > compareNumber) {
        matchStr = false;
      }
      break;
    case 'precision':
      matchStr = nsValid.precision(valueStr, Number(rulesStr));
      break;
    case 'ismobile':
    case 'mobile':
      //手机号验证
      var regStr = /^(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9])\d{8}$/;
      if (regStr.test(valueStr)) {
        matchStr = true;
      }
      break;
    case 'isphone':
    case 'phone':
      //固定电话验证
      var regStr = /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;//d*$;
      if (regStr.test(valueStr)) {
        matchStr = true;
      }
      break;
    case 'postalcode':
      //邮政编码验证
      var regStr = /^[0-9]\d{5}$/;
      if (regStr.test(valueStr)) {
        matchStr = true;
      }
      break;
    case 'tablename':
      //只能输入26个英文字母和下划线
      var regStr = /^[a-zA-Z_]*$/;
      if (regStr.test(valueStr)) {
        matchStr = true;
      }
      break;
    case 'year':
      //年份验证
      var regStr = /(19[\d][\d]|20[\d][\d])$/;
      if (regStr.test(valueStr)) {
        matchStr = true;
      }
      break;
    case 'month':
      //月份验证
      valueStr = valueStr.toString();
      if (valueStr >= '1' && valueStr <= '12') {
        matchStr = true;
      }
      break;
    case 'bankno':
      //银行卡号验证
      matchStr = nsValid.bankno(valueStr);
      break;
    case 'Icd':
      //身份证号验证
      matchStr = nsValid.Icd(valueStr);
      break;
    case 'min':
      var minStr = commonConfig.getRuleNumber(rulesStr, 'min');
      if (Number(valueStr) >= minStr) {
        matchStr = true;
      }
      break;
    case 'minlength':
      var minlengthStr = commonConfig.getRuleNumber(rulesStr, 'minlength');
      if (Number(valueStr) >= minlengthStr) {
        matchStr = true;
      }
      break;
    case 'max':
      var maxStr = commonConfig.getRuleNumber(rulesStr, 'max');
      if (Number(valueStr) <= maxStr) {
        matchStr = true;
      }
      break;
    case 'maxlength':
      var maxLengthStr = commonConfig.getRuleNumber(rulesStr, 'maxlength');
      if (Number(valueStr) <= maxLengthStr) {
        matchStr = true;
      }
      break;
    default:
      matchStr = true;
  }
  return matchStr;
}
/******************自定义事件 start***********************************/
baseDataTable.formatHandler.format = function (columnValue, row, meta, data) {
  var classStr = data.type;
  var format = data.format;
  var returnvalue = columnValue;
  var returnvalue = baseDataTable.formatHandler.formatMatch(returnvalue, classStr, format);
  if (classStr == 'money') {
    var isMatchNumber = returnvalue;
    if(typeof(returnvalue)=='string'){
      var isMatchNumber = returnvalue.replace(/,/g, '');
      isMatchNumber = Number(isMatchNumber);
    }
    if (isMatchNumber >= 0) {
      classStr += ' positivenumber';
    } else {
      classStr += ' negativenumber';
    }
  }
  if (classStr == 'number') {
    if (returnvalue >= 0) {
      classStr += ' positivenumber';
    } else {
      classStr += ' negativenumber';
    }
  }
  $(meta.settings.aoData[meta.row].anCells[meta.col]).addClass(classStr);
  return returnvalue;
}
//要检验的值，以及要转的类型和要保留的操作
baseDataTable.formatHandler.formatMatch = function (currentvalue, type, format) {

  var returnvalue = currentvalue;
  //var isNumberMatch = /^(\+|-)?\d+$/;//是否验证数字
  var isNumberMatch = /\d+$/;//是否验证数字
  var isMoneyMatch = /^([1-9][0-9]*(,[0-9]{3})*(\.[0-9]+)?)$/;//是否是货币类型
  switch (type) {
    //转换为带小数点的数字 cy 20180827
    case "number":
      if(typeof(returnvalue)=='string'){
        //文本转数字
        format = format.toString();
        if (format != '0') {
          var precision = 0;
          if (format.indexOf('.') > -1) {
            precision = format.substring(format.indexOf('.') + 1, format.length);
            precision = precision.length;
          }
          if (isNumberMatch.test(returnvalue)) {
            //当前值可以转换成数字
            returnvalue = Number(returnvalue);
            returnvalue = returnvalue.toFixed(precision);
          } else if (isMoneyMatch.test(returnvalue)) {
            //当前值是货币类型,把值转换成数值类型
            returnvalue = returnvalue.replace(/,/g, '');
            returnvalue = Number(returnvalue);
            returnvalue = returnvalue.toFixed(precision);
          }
        }
      }else if(typeof(returnvalue)=='number'){
        if (format != '0') {
          var precision = 0;
          if (format.indexOf('.') > -1) {
            precision = format.substring(format.indexOf('.') + 1, format.length);
            precision = precision.length;
            returnvalue = returnvalue.toFixed(precision);
          }
        }
      }else{
        if(debugerMode){
          console.error('表格数据格式化处理错误，只支持数字和文本转换为带小数点的数字');
          console.error(currentvalue);
          console.error(format);
        }
      }
      break;
    case "money":
      if (isNumberMatch.test(returnvalue)) {
        //验证全部是数字
        format = format.substring(format.indexOf('.') + 1, format.length);
        returnvalue = baseDataTable.formatMoney(returnvalue, format.length, '');
      }
      break;
    case "date":
      var olbFormat = 'YYYY-MM-DD';
      var newFormat = 'yyyy-MM-DD';
      if (typeof (format) == 'object') {
        for (var formatI in format) {
          olbFormat = formatI;
          newFormat = format[formatI];
        }
      }
      if (moment(returnvalue, olbFormat).isValid()) {
        //通过则可以转换为日期型
        returnvalue = moment(returnvalue).format(newFormat);
      }
      break;
    case "string":
      returnvalue = returnvalue.toString();
      break;
  }
  return returnvalue;
}
//tooltip
baseDataTable.formatHandler.tooltip = function(columnValue,row,meta,data){
  //var html = '<p class="tooltip-show" data-toggle="tooltip" title="'+columnValue+'" data-container="body">'+columnValue+'</p>';
  return columnValue;
}

baseDataTable.formatHandler.func = function (columnValue, row, meta, data) {
  var rowID = meta.row;
  var columnID = meta.col;
  var formatData = data.handler;
  var renderValue = formatData(columnValue, row, meta);
  //判断返回值类型
  var formatType = data.format;
  if (typeof (formatType) == 'object') {
    var format = formatType.format;
    var classStr = 'td-'+formatType.type;
    var isMatch = true;
    var renderValue = baseDataTable.formatHandler.formatMatch(renderValue, classStr, format);
    if (classStr == 'money') {
      var isMatchNumber = renderValue.replace(/,/g, '');
      isMatchNumber = Number(isMatchNumber);
      if (isMatchNumber >= 0) {
        classStr += ' td-positivenumber';
      } else {
        classStr += ' td-negativenumber';
      }
    }

    if (classStr == 'number') {
      if (renderValue >= 0) {
        classStr += ' td-positivenumber';
      } else {
        classStr += ' td-negativenumber';
      }
    }
    $(meta.settings.aoData[meta.row].anCells[meta.col]).addClass(classStr);
  }
  return renderValue;
}
//上传文件显示图标使用
baseDataTable.formatHandler.upload = function (columnValue, row, meta, formatData) {
  var columnID = meta.col;
  var rowID = meta.row;
  var id = 'upload-' + rowID + '-' + columnID;
  var uploadHtml = '';
  var buttonHtml = '';//按钮内容
  var contentHtml = '';//文本内容
  var valueStr = typeof (columnValue) == 'undefined' ? '' : columnValue;//读取默认值
  if (typeof (formatData) == 'object') {
    //先确认配置参数不为空则继续执行
    //默认显示button
    var buttonVisible = typeof (formatData.buttonVisible) == 'boolean' ? formatData.buttonVisible : true;
    //默认显示内容
    var contentVisible = typeof (formatData.contentVisible) == 'boolean' ? formatData.contentVisible : true;
    if (buttonVisible) {
      //按钮可见的情况判断是否有回调函数的处理
      var isShowButton = buttonVisible;
      var isShowContent = contentVisible;
      if (typeof (formatData.dataReturn) == 'function') {
        var receiveJson = formatData.dataReturn(columnValue, row, meta);
        if (typeof (receiveJson) == 'object') {
          isShowButton = receiveJson.buttonVisible;
          isShowContent = receiveJson.contentVisible;
        }
      }
      if (isShowButton) {
        //显示按钮
        buttonHtml = '<div '
          + 'id="' + id + '" '
          + 'class="table-upload" '
          + 'fid="' + rowID + '" '
          + 'columnid="' + columnID + '" '
          + 'ns-type="file" '
          + '>'
          + '</div>';
      }
      if (isShowContent) {
        //显示文本内容
        contentHtml = getImageHtml(formatData);
      }
    } else {
      //按钮不可见
      if (contentVisible) {
        //内容可见
        contentHtml = getImageHtml(formatData);
      }
    }
  }
  uploadHtml = buttonHtml + contentHtml;
  function getImageHtml(formatData) {
    var contentHtml = '';
    if (typeof (formatData.isContentImage) == 'object') {
      //图片类型的上传
      var isThumb = formatData.isContentImage.isThumb;
      isThumb = typeof (isThumb) == 'boolean' ? isThumb : true;//默认显示的缩略图而不是图片文件名称
      if (isThumb) {
        var widthStr = 'width:30px;'; //默认支持的图片宽
        var heightStr = 'height:30px;'; //默认支持的图片高
        if (typeof (formatData.isContentImage.width) == 'number') {
          widthStr = 'width: ' + formatData.isContentImage.width + 'px;';
        }
        if (typeof (formatData.isContentImage.height) == 'number') {
          heightStr = 'height: ' + formatData.isContentImage.height + 'px;';
        }
        var styleStr = 'style="' + widthStr + '' + heightStr + '"';
        var isLookImg = formatData.isContentImage.isLookImg;
        isLookImg = typeof (isLookImg) == 'boolean' ? isLookImg : true;//默认支持查看缩略图
        var imageClassStr = 'image-empty';
        if (typeof (columnValue) == 'string') {
          if (columnValue != '') {
            imageClassStr = 'image-full';
          }
        }
        contentHtml += '<image src="' + valueStr + '" class="' + imageClassStr + '" isLookImg="' + isLookImg + '" alt="" ' + styleStr + ' />';
      } else {
        //显示的是文件名称
        var spanHtml = '';
        if (columnValue != '') {
          spanHtml = '<span class="upload-content">'
            + '<a href="javascript:void(0)" class="upload-title">' + valueStr + '</a>'
            + '<a href="javascript:void(0)" class="upload-delete"></a>'
            + '</span>';
        }
        contentHtml = '<div class="table-uploadContent">'
          + spanHtml
          + '</div>';
      }
    } else if (typeof (formatData.isContentFile) == 'object') {
      //文件类型的上传
      //显示的是文件名称
      var spanHtml = '';
      if (columnValue != '') {
        spanHtml = '<span class="upload-content">'
          + '<a href="javascript:void(0)" class="upload-title">' + valueStr + '</a>'
          + '<a href="javascript:void(0)" class="upload-delete"></a>'
          + '</span>';
      }
      contentHtml = '<div class="table-uploadContent">'
        + spanHtml
        + '</div>';
    }
    return contentHtml;
  }
  return uploadHtml;
}
//弹框上传文件和table的时候删除文件使用
baseDataTable.formatHandler.uploadFile = function (columnValue, row, meta, formatData) {
  var columnID = meta.col;
  var rowID = meta.row;
  var tableID = meta.settings.sTableId;
  var renderHtml = "";
  renderHtml = '<button type="button" class="btn btn-warning btn-icon" fid="' + rowID + '" nstype="upload-file" columnid="' + columnID + '">'
    + '<i class="fa-trash"></i></button>';
  return renderHtml;
}
baseDataTable.formatHandler.itemsub = function (columnValue, row, meta, formatData) {
  var content = '<span>'+columnValue+'</span>';
  if($.isArray(row.children)){
    content += '<span class="caprit" ns-id="'+row.id+'" ns-index="'+meta.row+'" ns-column="'+meta.col+'">'+row.children.length+'</span>';
  }
  return content;
}
baseDataTable.formatHandler.button = function (columnValue, row, meta, formatData) {
  var columnID = meta.col;
  var rowID = meta.row;
  var tableID = meta.settings.sTableId;
  var renderHtml = "";
  //如果没有定义formatdata,则返回输出到界面上的会是一个布尔值的false
  if (typeof (formatData) == 'undefined') {
    return false;
  }
  //统一格式，如果是数组格式（最早的button配置方式）则重新格式化为object方式
  if ($.isArray(formatData)) {
    formatData = {
      subdata: formatData
    }
  }
  //根据返回值决定是否显示该按钮
  var receiveData = [];
  var receiveType = 'visible';
  if (typeof (formatData.dataReturn) == 'function') {
  	receiveType = formatData.dataReturnType; 
    receiveData = formatData.dataReturn(columnValue, row, meta, formatData);
    //返回值是[true,false] 长度必须与数组的长度一样  true是显示，false隐藏  receiveData
    if (debugerMode) {
      if ($.isArray(receiveData) == false) {
        //返回值必须是数组
        console.error('隐藏显示控制函数应当返回数组');
        console.error(formatData)
        console.error(receiveData)
        return false;
      } else {
        //返回值数组长度必须长度一致
        if (formatData.subdata.length != receiveData.length) {
          console.error('隐藏显示数组返回值长度错误，当前长度为：' + receiveData.length + ' 应当为' + formatData.subdata.length);
          console.error(formatData)
          console.error(receiveData)
          return false;
        }

      }
    }
  }
  function getBtnHtml(btnI) {
  	 var btnJson = {};
    //如果有返回值，且返回值为false则根据 dataReturnType 如果是visible则不显示，如果是disable 则禁用
    if (typeof (receiveData[btnI]) == 'boolean') {
      if (receiveData[btnI] == false) {
      	if(receiveType == 'visible'){
      		return '';
      	}else if(receiveType == 'disabled'){
      		btnJson.disabled = true;
      	}
        
      }
    }
   
    btnJson.source = 'table';
    var btnConfig = formatData.subdata[btnI];
    //读取按钮的文本和方法
    for (var key in btnConfig) {
      btnJson.text = key;
      btnJson.handler = btnConfig[key];
    }
    //btnJson.columnID = columnID;
    var html = ''
    if (!$.isArray(btnJson.handler)) {
      //不是数组，就是普通按钮
      btnJson.index = {
        fid: btnI,
        columnID: columnID
      }
     /* if (receiveData[btnI] == false) {
          //不添加
      } else {
         html = nsButton.getHtml(btnJson);
      }*/
    } else {
      //如果是下拉按钮组，则读取子数据的key和value
      var dropdownArr = [];
      var dropData = btnJson.handler;
      var subitemIndex = 0;  //第几个下拉列表
      function getSubitem(dropI) {
        for (var toggleI in dropData[dropI]) {
          var toggleJson = {};
          toggleJson.index = {
            fid: btnI,
            optionid: subitemIndex,
            columnID: columnID
          };
          toggleJson.text = toggleI;
          toggleJson.handler = dropData[dropI][toggleI];
          dropdownArr.push(toggleJson);
        }
      }
      for (var dropI = 0; dropI < dropData.length; dropI++) {
        //如果按钮组中的子按钮有返回值，且返回值为false则不显示
        if (typeof (receiveData[btnI][dropI]) == 'boolean') {
          if (receiveData[btnI][dropI] == false) {
            //不添加
          } else {
            getSubitem(dropI);
          }
        } else {
          getSubitem(dropI);
        }
        subitemIndex++;
      }
      btnJson.fid = btnI;
      btnJson.subdata = dropdownArr;
      //var html = nsButton.getDropdownHtml(btnJson);
    }
    return btnJson;
  }
  var formatArr = [];
  for (var btnI = 0; btnI < formatData.subdata.length; btnI++) {
    //renderHtml += getBtnHtml(btnI);
    var btnJson = getBtnHtml(btnI);
    formatArr.push(btnJson);
  }
  if (typeof(formatData.beforeHandler) == 'function') {
    formatArr = formatData.beforeHandler(columnValue, row, meta, formatArr);
  }
  for(var i=0; i<formatArr.length; i++){
    if (receiveData[i] == false) {
        //不添加
    } else {
       renderHtml += nsButton.getHtml(formatArr[i]);
    }
  }
  return renderHtml;
}
baseDataTable.formatHandler.input = function (columnValue, row, meta, formatData) {
  var columnID = meta.col;
  var rowID = meta.row;
  var tableID = meta.settings.sTableId;
  var moduleID = tableID + '-' + rowID + '-' + columnID;
  var inputHtml = '';
  if (typeof (formatData) == 'undefined') {
    var defaultValue = columnValue == null ? '' : columnValue;
    defaultValue = typeof (defaultValue) == 'null' ? '' : defaultValue;
    inputHtml = '<input columnID="' + columnID + '" data-toggle="tooltip" handlertype="" rowID="' + rowID + '"  type="text" name="' + moduleID + '-input" id="' + moduleID + '-input" value="' + defaultValue + '" class="ns-table-input form-control" ns-table="input" />';
    return inputHtml;
  } else {
    for (var data in formatData) {
      var returnvalue = '';
      if (columnValue === '') {
        returnvalue = typeof (formatData[data].value) == 'undefined' ? '' : formatData[data].value;
      } else {
        returnvalue = columnValue == null ? '' : columnValue;
      }
      var readonlyStr = '';
      if(typeof(formatData[data].readonly)=='boolean'){
        if(formatData[data].readonly){readonlyStr = 'readonly'}
      }
      var inputHandlerType = typeof (formatData[data].type) == 'undefined' ? '' : formatData[data].type;
      inputHtml = '<input columnID="' + columnID + '" '+readonlyStr+' data-toggle="tooltip" handlertype="' + inputHandlerType + '" rowID="' + rowID + '"  type="text" name="' + moduleID + '-input" id="' + moduleID + '-input" value="' + returnvalue + '" ns-table="input" class="ns-table-input form-control" />';
      var btnsArr = formatData[data].btns;
      if (typeof (btnsArr) != 'undefined' && btnsArr.length > 0) {
        var functionID = ''
        var btnHandler = '';
        for (var btn = 0; btn < btnsArr.length; btn++) {
          var btnJson = {};
          btnJson.text = btnsArr[btn].text;
          btnJson.handler = btnsArr[btn].handler;
          btnJson.columnID = columnID;
          inputHtml += nsButton.getHtml(btnJson, 'table', btn, true, false);
        }
      }
      return inputHtml;
    }
  }
}
//ajaxSelect
baseDataTable.formatHandler.ajaxSelect = function(columnValue,row,meta,formatData){
  var aId = 'ajaxselect-'+meta.row+'-'+meta.col;
  var html = '<a id="'+aId+'" href="javascript:void(0)" columnid="'+meta.col+'" class="input-ajaxselect-btn" nstype="ajaxselect" ns-control="ajaxselect-btn"><i class="fa fa-caret-down"></i></a>';
  return columnValue + html;
}
baseDataTable.formatHandler.selectbase = function (columnValue, row, meta, formatData) {
  var columnID = meta.col;
  var rowID = meta.row;
  var tableID = meta.settings.sTableId;
  var moduleID = tableID + '-' + rowID + '-' + columnID;
  var columnValue = typeof (columnValue) == 'undefined' ? '' : columnValue;
  if (typeof (columnValue) == 'object') {
    if ($.isEmptyObject(columnValue)) {
      columnValue = '';
    }
  }
  var columnConfig = baseDataTable.data[tableID].columnConfig[columnID];
  if (typeof (columnConfig.formatHandler.data.handler) == 'function') {
    columnConfig.formatHandler.format = {};
    columnConfig.formatHandler.format.type = 'selectbaseFunc';
    if (typeof (formatData[0].rules) == 'string') {
      if (formatData[0].rules !== '') {
        columnConfig.formatHandler.format.rules = formatData[0].rules;
      }
    }
    if (typeof (formatData[0].handler) == 'function') {
      columnConfig.formatHandler.format.handler = formatData[0].handler;
    }
  }
  for (var data in formatData) {
    var disabled = formatData[data].disabled ? formatData[data].disabled : "";
    var subData = formatData[data].subdata;
    if(formatData[data].voName){
      //存在volist
      if(row[formatData[data].voName]){
          columnValue = row[formatData[data].voName][formatData[data].idField] ? row[formatData[data].voName][formatData[data].idField] : '';
      }
    }
    if(formatData[data].dataSrc) {
       subData = row[formatData[data].dataSrc];
    }
    var defaultSelectValue = language.datatable.fillStatus.optional;
    if (formatData[data].rules) {
      var validateRule = formatData[data].rules;
      defaultSelectValue = typeof (validateRule) == 'undefined' ? language.datatable.fillStatus.optional : language.datatable.fillStatus.required;
    }
    var selectHtml = '<option value="">' + defaultSelectValue + '</option>';
    //var selectHtml = '';
    if ($.isArray(subData)) {
      if (subData.length > 0) {
        for (var sub = 0; sub < subData.length; sub++) {
          var isSelected = '';
          var textStr = subData[sub][formatData[data].textField];
          var valueStr = subData[sub][formatData[data].valueField];
          if (subData[sub].selected == true) {
            row[columnConfig.data] = valueStr;
            isSelected = 'selected';
          } else if (columnValue == valueStr) {
            row[columnConfig.data] = valueStr;
            isSelected = 'selected';
          } else if (formatData[data].value == valueStr) {
            row[columnConfig.data] = valueStr;
            isSelected = 'selected';
          }
          selectHtml += '<option value="' + valueStr + '" ' + isSelected + '>' + textStr + '</option>';
        }
      }
    }
    return '<select class="form-control ns-table-selectbase" ns-table="selectbase" data-toggle="tooltip" name="' + tableID + '-select" id="' + moduleID + '-select" columnID="' + columnID + '" rowID="' + rowID + '" '+disabled+'>' + selectHtml + '</select>';
  }
}
baseDataTable.formatHandler.select = function (columnValue, row, meta, formatData) {
  var columnID = meta.col;
  var rowID = meta.row;
  var tableID = meta.settings.sTableId;
  var moduleID = tableID + '-' + rowID + '-' + columnID;
  var columnValue = typeof (columnValue) == 'undefined' ? '' : columnValue;
  var columnConfig = baseDataTable.data[tableID].columnConfig[columnID];
  if (typeof (columnValue) == 'object') {
    if ($.isEmptyObject(columnValue)) {
      columnValue = '';
    }
  }
  for (var data in formatData) {
    var subData = [];
    subData = formatData[data].subdata;
    var defaultSelectValue = language.datatable.fillStatus.optional;
    if (columnConfig.formatHandler) {
      var validateRule = columnConfig.formatHandler.rules;
      defaultSelectValue = typeof (validateRule) == 'undefined' ? language.datatable.fillStatus.optional : language.datatable.fillStatus.required;
    }
    var selectHtml = '<option value="">' + defaultSelectValue + '</option>';
    for (var sub in subData) {
      var isSelected = '';
      var textStr = subData[sub][formatData[data].textField];
      var valueStr = subData[sub][formatData[data].valueField];
      if (subData[sub].selected == true) {
        row[columnConfig.data] = valueStr;
        isSelected = 'selected';
      } else if (columnValue == valueStr) {
        row[columnConfig.data] = valueStr;
        isSelected = 'selected';
      } else if (formatData[data].value == valueStr) {
        row[columnConfig.data] = valueStr;
        isSelected = 'selected';
      }
      selectHtml += '<option value="' + valueStr + '" ' + isSelected + '>' + textStr + '</option>';
    }
    return '<select class="form-control ns-table-select" ns-table="select" data-toggle="tooltip" name="' + tableID + '-select" id="' + moduleID + '-select" columnID="' + columnID + '" rowID="' + rowID + '">' + selectHtml + '</select>';
  }
}
baseDataTable.formatHandler.checkbox = function (columnValue, row, meta, formatData) {
  var columnID = meta.col;
  var rowID = meta.row;
  var tableID = meta.settings.sTableId;
  var moduleID = tableID + '-' + rowID + '-' + columnID;
  for (var data in formatData) {
    var subData = formatData[data].subdata;
    var valueDefault = formatData[data].value;
    var checkCls = 'cbr table-check checkbox-options';
    var checkboxHtml = '';
    if (typeof (subData) == 'undefined') {
      var isShowText = typeof(formatData[data].isShowText)=='boolean'?formatData[data].isShowText:false;//是否显示文本内容
      var textStr = '';
      var valueStr = '';
      var disabledStr = '';
      var isChecked = '';
      if (typeof (columnValue) == 'undefined') {
        valueStr = formatData[data].value;
        isChecked = '';
      } else {
        valueStr = columnValue;
        if (columnValue == formatData[data].checkedFlag) {
          isChecked = 'checked';
        } else if (columnValue == formatData[data].uncheckedFlag) {
          isChecked = '';
        }
      }
      var isDisabledStr = '';
      if (row[formatData[data].isDisabledFlage]) {
        isDisabledStr = 'disabled';
      }

      if(isShowText){
        textStr = valueStr;
      }
      var classStr = 'checkbox';
      if(formatData[data].isSwitch){
        classStr = 'switch';
      }
      checkboxHtml += '<label class="'+classStr+'-inline ' + isChecked + ' ' + isDisabledStr + '" for="' + moduleID + '-check">'
        + '</label>'
        + '<input type="checkbox" ns-table="checkbox" id="' + moduleID + '-check" '+isDisabledStr+' columnID="' + columnID + '" rowID="' + rowID + '"  class="' + checkCls + '" name="' + moduleID + '-check" value="' + valueStr + '" />'
        +textStr
    } else {
      for (var sub in subData) {
        var isChecked = '';
        var textStr = subData[sub][formatData[data].textField];
        var valueStr = subData[sub][formatData[data].valueField];
        if (typeof (valueDefault) == 'string') {
          isChecked = valueDefault ? 'checked' : '';
        } else if (typeof (valueDefault) == 'undefined') {
          for (var ischeck in columnValue) {
            if (valueStr == columnValue[ischeck]) {
              isChecked = 'checked';
            }
          }
        } else if (typeof (valueDefault) == 'object') {
          for (var ischeck in valueDefault) {
            if (valueStr == valueDefault[ischeck]) {
              isChecked = 'checked';
            }
          }
        }
        var disabledStr = subData[sub].isDisabled ? " disabled " : "";
        checkboxHtml += '<label class="checkbox-inline ' + isChecked + ' ' + disabledStr + '" for="' + moduleID + '-check' + sub + '">'
          + '</label>'
          + '<input id="' + moduleID + '-check' + sub + '" type="checkbox" columnID="' + columnID + '" rowID="' + rowID + '" class="' + checkCls + '" name="' + moduleID + '-check" value="' + valueStr + '" />'
          + textStr;
      }
    }
    return checkboxHtml;
  }
}
baseDataTable.formatHandler.radio = function (columnValue, row, meta, formatData) {
  var columnID = meta.col;
  var rowID = meta.row;
  var tableID = meta.settings.sTableId;
  var moduleID = tableID + '-' + rowID + '-' + columnID;
  for (var radio in formatData) {
    var isCheckedStr = formatData[radio].value;
    var textFieldName = formatData[radio].textField;
    var valueFieldID = formatData[radio].valueField;
    var radioData = formatData[radio].subdata;
    var radioHtml = '';
    for (var valueRadio in radioData) {
      var radioCls = 'cbr table-check radio-options';
      var disabledStr = radioData[valueRadio].isDisabled ? " disabled " : "";
      var isChecked = '';
      if (typeof (columnValue) == 'undefined') {
        isChecked = isCheckedStr == radioData[valueRadio][valueFieldID] ? 'checked' : '';
      } else {
        isChecked = columnValue == radioData[valueRadio][valueFieldID] ? 'checked' : '';
      }
      radioHtml += '<label class="radio-inline ' + isChecked + disabledStr + '" for="' + moduleID + '-radio' + valueRadio + '"></label>'
        + '<input id="' + moduleID + '-radio' + valueRadio + '" ns-table="radio" columnID="' + columnID + '" rowID="' + rowID + '" type="radio"  class="' + radioCls + '" name="' + moduleID + '-radio" value="' + radioData[valueRadio][valueFieldID] + '" />'
        + radioData[valueRadio][textFieldName];
    }
    return radioHtml;
  }
}
baseDataTable.formatHandler.image = function (columnValue, row, meta, formatData) {
  var columnID = meta.col;
  var rowID = meta.row;
  var tableID = meta.settings.sTableId;
  var receiveWidth = 0;//宽
  var receiveHeight = 0;//高
  var imageHtml = '';//返回要显示的image图片
  for (var image in formatData) {
    var imageSrc = '';
    if (typeof (formatData[image].url) == 'undefined') {
      imageSrc = columnValue;
    } else {
      imageSrc = formatData[image].url;
    }
    imageHtml += '<img src="' + imageSrc + '" width="' + formatData[image].width + '" columnid="' + columnID + '" rowID="' + rowID + '" height="' + formatData[image].height + '" />';
  }
  return imageHtml;
}
baseDataTable.formatHandler.label = function (columnValue, row, meta, formatData) {
  var columnID = meta.col;
  var rowID = meta.row;
  var tableID = meta.settings.sTableId;
  var lableHtml = '';
  for (lable in formatData) {
    lableHtml += '<div class="ns-table-label"><label class="' + formatData[lable].class + '">'
      + formatData[lable].text +
      '</lable></div>';
  }
  return lableHtml;
}
baseDataTable.formatHandler.icon = function (columnValue, row, meta, formatData) {
  var columnID = meta.col;
  var rowID = meta.row;
  var tableID = meta.settings.sTableId;
  var iconHtml = '';
  for (var icon in formatData) {
    iconHtml += '<i class="' + formatData[icon].class + '"></i>';
  }
  return iconHtml;
}
baseDataTable.formatHandler.dictionary = function (columnValue, row, meta, formatData) {
  var dictionaryValue;
  if (typeof (formatData.default) == 'boolean') {
    dictionaryValue = formatData.default;
  } else {
    dictionaryValue = formatData.default ? formatData.default : '';
  }
  columnValue = typeof(columnValue)=='undefined' ? '' : columnValue;
  if(typeof(columnValue)=='string'){
    if(columnValue.indexOf(',')>-1){
      var dataArray = columnValue.split(',');
      for(var dataI=0; dataI<dataArray.length; dataI++){
        dictionaryValue += '<label>'+formatData[dataArray[dataI]]+'</label>';
      }
    }else{
      $.each(formatData, function (key, value) {
        if (key == columnValue) {
          dictionaryValue = value;
        }
      });
      var reg = /[switch]/; 
      if(dictionaryValue){
          if(!reg.test(dictionaryValue)){
            dictionaryValue = '<label>'+dictionaryValue+'</label>';
          }
      }
    }
  }else{
    $.each(formatData, function (key, value) {
      if (key == columnValue) {
        dictionaryValue = value;
      }
    });
    var reg = /[switch]/; 
    if(dictionaryValue){
        if(!reg.test(dictionaryValue)){
         dictionaryValue = '<label>'+dictionaryValue+'</label>';
        }
    }
  }
  return dictionaryValue;
}
baseDataTable.formatHandler.date = function (columnValue, row, meta, formatData) {
  var columnID = meta.col;
  var rowID = meta.row;
  var tableID = meta.settings.sTableId;
  var dictJson = formatData.formatDate;
  var isDefaultDate = typeof(formatData.isDefaultDate)=='boolean' ? formatData.isDefaultDate : true;
  var  datevalue = typeof(columnValue)=='undefined' ? '' : columnValue;
  if(datevalue === ''){
    if(isDefaultDate){
      //如果为真则转换
       datevalue = commonConfig.formatDate(datevalue, dictJson);
    }
  }else{
     datevalue = commonConfig.formatDate(datevalue, dictJson);
  }
  return datevalue;
}
baseDataTable.formatHandler.formatDate = function (columnValue, row, meta, formatData) {
  var columnID = meta.col;
  var rowID = meta.row;
  var tableID = meta.settings.sTableId;
  var moduleID = tableID + '-' + rowID + '-' + columnID;
  var dictvalue = formatData[0].value;//初始化传送的默认值
  var datevalue = '';
  if (columnValue == '') {
    datevalue = typeof (dictvalue) == 'undefined' ? '' : dictvalue;
  } else {
    datevalue = columnValue == null ? '' : columnValue;
  }
  datevalue = commonConfig.formatDate(datevalue);
  var dateHtml = '<input type="text" value="' + datevalue + '" ns-table="date" columnID="' + columnID + '" rowID="' + rowID + '" name="' + moduleID + '-date" id="' + moduleID + '-date" class="ns-table-input form-control" />';
  return dateHtml;
}
baseDataTable.formatHandler.href = function (columnValue, row, meta, formatData) {
  var columnID = meta.col;
  var rowID = meta.row;
  var tableID = meta.settings.sTableId;
  var moduleID = tableID + '-' + rowID + '-' + columnID;
  var hrefHtml = '';
  for (var href in formatData) {
    var textHtml = '';
    if (typeof (columnValue) == 'string' || typeof (columnValue) == 'number') {
      if (columnValue == '') {
        textHtml = formatData[href].text;
      } else {
        textHtml = columnValue;
      }
    } else {
      textHtml = formatData[href].text;
    }
    hrefHtml += '<a href="javascript:void(0)" rowID="' + rowID + '" columnID="' + columnID + '" id="' + moduleID + '-href" class="' + moduleID + ' ns-table-href" fid="' + href + '">' + textHtml + '</a>';
  }
  return hrefHtml;
}
baseDataTable.formatHandler.formatType = function (columnValue, row, meta, data) {
  return columnValue;
}
baseDataTable.formatHandler.columnState = function (columnValue, row, meta, data) {
  var html = '';
  if(data.type == 'message'){
     /*
        *data object 
          *{
              *  type string 类型
              *  data object 数据格式
           *}
    */
    var columnClassStr = '';
    var rowClassStr = '';
    var stateObj = data.data;
    if(row.hasEmergency){
      //应急
      columnClassStr = stateObj.hasEmergency;
    }else if(row.hasSuspend){
      //挂起
      columnClassStr = stateObj.hasSuspend;
      rowClassStr = 'tr-disabled';
    }else if(row.hasRollback){
      //重办
      columnClassStr = stateObj.hasRollback;
    }else{
      //普通
      columnClassStr = stateObj.normalstate;
    }
    $(meta.settings.aoData[meta.row].anCells[meta.col]).addClass(columnClassStr);
    if(rowClassStr){
      $(meta.settings.aoData[meta.row].nTr).addClass(rowClassStr);
    }
  }else{
    var expeditedStr = Number(row[data.expedited]);  //加急
    var goBackStr = row[data.goback];//回退
    var reminderStr = row[data.reminders];//催办
    var overdueStr =  row[data.overdue]; //超期
    var destroyStr = row[data.destroy]; //作废
    var outsourceStr = row[data.outsource]; //分包
    var qualityStr = row[data.quality]; //质控
    var recheckStr = row[data.recheck]; //复检
    var notesStr = row[data.notes]; //注释  返回值0 或者1
    html = columnValue;
    if (expeditedStr >= 1 && expeditedStr <= 5) {
      var expeditedStateStr = language.datatable.label.emergency;
      switch(expeditedStr){
        case 2:
          expeditedStateStr = language.datatable.label.extraurgent;
          break;
      }
      html += '<label class="ordinary-icon icon-expedit">' + expeditedStateStr + '<label class="grade">' + expeditedStr + '</label></label>';
    }
    if (goBackStr) {
      html += '<label class="special-icon icon-goback">' + language.datatable.label.backspace + '</label>';
    }
    if (reminderStr) {
      html += '<label class="ordinary-icon icon-reminder">' + language.datatable.label.reminder + '</label>';
    }
    if (overdueStr) {
      html += '<label class="ordinary-icon icon-overdue">' + language.datatable.label.exceed + '</label>';
    }
    if (destroyStr) {
      html += '<label class="special-icon icon-destroy">' + language.datatable.label.obsolete + '</label>';
    }
    if (outsourceStr) {
      html += '<label class="special-icon icon-outsource">' + language.datatable.label.outsource + '</label>';
    }
    if (qualityStr) {
      html += '<label class="special-icon icon-quality">' + language.datatable.label.quality + '</label>';
    }
    if (recheckStr) {
      html += '<label class="special-icon icon-recheck">' + language.datatable.label.recheck + '</label>';
    }
    if (Number(notesStr) == 1) {
      html += '<label class="ordinary-icon icon-notes">' + language.datatable.label.notes + '</label>';
    }
  }
  return html;
}
baseDataTable.formatHandler.stringReplace = function(columnValue, row, meta, data){
  //用于字符串提供，主要使用在radio，select等id value
  var repalceStr = data.formatDate[columnValue];
  if(typeof(repalceStr)!='string'){
    repalceStr = '';
  }
  return repalceStr;
}
/*********sjj 20180912 行状态 8种***************/
baseDataTable.formatHandler.rowState = function(columnValue,row,meta,data){
  /*
    *error warning  info success 行背景状态
    *text-error text-warning text-info text-success 行内字体颜色
  */
  var formatData = data;
  if(formatData){
      $(meta.settings.aoData[meta.row].nTr).addClass(formatData[columnValue]);
  }
  return columnValue;
}
//列状态 
baseDataTable.formatHandler.cellState = function(columnValue,row,meta,data){
  /*
    *error warning  info success 列背景状态
  */
  var formatData = data;
  if(formatData){
      $(meta.settings.aoData[meta.row].anCells[meta.col]).addClass(formatData[columnValue]);
  }
  return columnValue;
}
baseDataTable.formatHandler.codeToName = function(columnValue,row,meta,data){
  if(columnValue == ''){
    return '';
  }
  var codeData = provinceSelect.data[columnValue];
  var proJson = {};
  var nameStr = '';
  if(!$.isEmptyObject(codeData.area)){
    proJson = provinceSelect.data[codeData.city.code];
    proJson.area = codeData.area;
    // nameStr = proJson.pro.name + ','+codeData.city.name +','+codeData.area.name;
  }else if(!$.isEmptyObject(codeData.city)){
    proJson = codeData;
    // nameStr = codeData.pro.name + ','+codeData.city.name;
  }else{
    proJson = codeData;
    // nameStr = codeData.pro.name;
  }
  var nameStrArr = ['pro','city','area'];
  for(var indexI=0;indexI<nameStrArr.length;indexI++){
    if(!$.isEmptyObject(proJson[nameStrArr[indexI]])){
      nameStr += proJson[nameStrArr[indexI]].name + ',';
    }
  }
  nameStr = nameStr.substring(0,nameStr.length-1);
  return nameStr;
}
baseDataTable.formatHandler.serialState = function(columnValue,row,meta,data){
  var rowID = meta.row + 1;
  var formatData = data.data;
  var valueStr = row[data.id];
  for(var num in formatData){
    var classStr = '';
    if(num == valueStr){
       classStr += ' '+formatData[num];
    }
    $(meta.settings.aoData[meta.row].anCells[meta.col]).addClass(classStr);
  }
  return columnValue;
}
/*****************************/
baseDataTable.formatHandler.stringJoin = function(columnValue,row,meta,data){
 /*
    *{
      type:'stringJoin',
      data:{
        voName:'regvo.volist', //数据结构转换
      }
    }
  */
 var formatData = data;
 var voName = formatData.voName; 
 var returnValue = columnValue ? columnValue : '';
 var colObj = nsTable.data[meta.settings.sTableId].columnConfig[meta.col];
 if(voName){
    var action = voName.split('.');
    var commonAction = row[action[0]];
    if(commonAction){
      for(var actionI=0; actionI<action.length; actionI++){
        if(typeof(commonAction[action[actionI]])=='undefined'){
          break;
        }
        commonAction = commonAction[action[actionI]];
      }
      if(typeof(commonAction)=='object'){
        if($.isArray(commonAction)){
          for(var c=0; c<commonAction.length; c++){
            returnValue += commonAction[c][colObj.name] + '、';
          }
          returnValue = returnValue.substring(0,returnValue.length-1);
        }else{
          returnValue = commonAction[colObj.name];
        }
      }
    }
 }
 returnValue = returnValue ? returnValue : '';
 return returnValue;
}
/***单个 缩略图*****************/
baseDataTable.formatHandler.thumb = function(columnValue,row,meta,data){
  /*
    *根据当前列读取的字段值去获取大，小缩略图的路径
    *小缩略图 后跟ThumbUrl
    *大缩略图 后跟Url
  */
  var colObj = nsTable.data[meta.settings.sTableId].columnConfig[meta.col];
  var urlField = colObj.name + 'ThumbUrl';
  var bigUrlField = colObj.name + 'Url'; 
  var thumbUrl = row[urlField] ? row[urlField] : '';
  var html = '<img src="'+thumbUrl+'" alt="" columnID="'+meta.col+'" rowID="'+meta.row+'" data-original="'+row[bigUrlField]+'" data-thumb="'+colObj.name+'" />';
  if(thumbUrl == ''){
     $(meta.settings.aoData[meta.row].anCells[meta.col]).addClass('no-thumb');
  }
  return html;
}
baseDataTable.formatHandler.multithumb = function(columnValue,row,meta,data){
  /*
    *多缩略图的展示
    *根据当前列读取的字段值去获取大，小缩略图的路径
    *小缩略图 后跟ThumbUrl
    *大缩略图 后跟Url
  */
  var colObj = nsTable.data[meta.settings.sTableId].columnConfig[meta.col];
  var urlField = colObj.name + 'ThumbUrl';
  var bigUrlField = colObj.name + 'Url'; 
  var imgArr = row[data.voName];
  var imgHtml = '';
  for(var imgI=0; imgI<imgArr.length; imgI++){
    imgHtml += '<img src="'+imgArr[imgI][urlField]+'" alt="" data-original="'+imgArr[imgI][bigUrlField]+'" data-thumb="'+colObj.name+'" />';
  }
  return imgHtml;
}
/******************自定义事件 end***********************************/
//初始化完成后，记录下来的自定义事件 baseDataTable.form 
//{
// 	3:{{colunIndex:3, columnType:'button', handler:[function,function]}}
// }
// 3是列的序号，handler才是真正的按钮
baseDataTable.storageCustomizeHandler = function (tableID) {
  var tableHandler = {}
  var columnData = baseDataTable.data[tableID].columnConfig;
  for (var i = 0; i < columnData.length; i++) {
    //如果有formatHandler则包含需要初始化的数据
    if (typeof (columnData[i].formatHandler) != 'undefined') {
      //formatHandler包含了类型和data,以及rules
      var customizeJson = columnData[i].formatHandler;

      //初始化验证规则数组
      if (customizeJson.rules) {
        if (typeof (baseDataTable.formatValidate[tableID].validateArr) == 'undefined') {
          baseDataTable.formatValidate[tableID].validateArr = [];
        }
        baseDataTable.formatValidate[tableID].validateArr.push(i);
        baseDataTable.formatValidate[tableID].rules[i] = customizeJson.rules;
      }
      //初始化基本对象
      var handlerJson = {
        columnIndex: i,
        columnType: customizeJson.type
      };
      var handlerArr = []; 	//function数组，一般是一维数组，可能是二维三维（button）
      var levelJson = {};		//包含的数组级别 [1,3],代表包含一维数组和三维数组，用于初始化对象时候节省渲染时间
      //handerJson中的handler是个object,button的function是个多维数组，而input,select,checkbox,radio,selectbase,href则不是
      switch (customizeJson.type) {
        case 'uploadFile':
          //data就是handler
          handlerJson.handler = customizeJson.data;
          break;
        case 'upload':
          if (typeof (customizeJson) == 'object') {
            handlerJson.handler = {};
            handlerJson.handler.changeHandler = customizeJson.data.changeHandler;
            handlerJson.handler.src = customizeJson.data.uploadSrc;
            handlerJson.handler.support = typeof (customizeJson.data.supportFormat) == 'string' ? customizeJson.data.supportFormat : '';
            if (typeof (customizeJson.data.isContentFile) == 'object') {
              handlerJson.handler.isShowFile = true;//是否显示文件
              handlerJson.handler.lookHandler = customizeJson.data.isContentFile.lookHandler;
              handlerJson.handler.deleteHandler = customizeJson.data.isContentFile.deleteHandler;
            }
            if (typeof (customizeJson.data.isContentImage) == 'object') {
              handlerJson.handler.isShowFile = false;
            }
          }
          break;
        case 'button':
          //包括普通按钮和下拉按钮组
          //先统一格式，把data：[],转成{subdata:[]},以支持回调函数
          if ($.isArray(customizeJson.data)) {
            customizeJson.data = {
              subdata: customizeJson.data
            }
          }
          for (var btnFuncI = 0; btnFuncI < customizeJson.data.subdata.length; btnFuncI++) {
            for (key in customizeJson.data.subdata[btnFuncI]) {
              var cFunc = customizeJson.data.subdata[btnFuncI][key];
              if (typeof (cFunc) == 'function') {
                //如果是function
                handlerArr.push(cFunc);
                levelJson[1] = true;
              } else if ($.isArray(cFunc)) {
                //如果不是function 是array，则内部包含handler 则循环
                var subHandlerArr = [];
                for (var subFuncI = 0; subFuncI < cFunc.length; subFuncI++) {
                  for (subKey in cFunc[subFuncI]) {
                    if (typeof (cFunc[subFuncI][subKey]) == 'function') {
                      //是下拉按钮组
                      subHandlerArr.push(cFunc[subFuncI][subKey]);
                      levelJson[2] = true;
                    } else if (typeof (cFunc[subFuncI][subKey]) == 'object') {
                      //下拉按钮组包含按钮 提取其中的function
                      var btnsHandler = [];
                      btnsHandler.push(cFunc[subFuncI][subKey].handler);
                      for (var btnI = 0; btnI < cFunc[subFuncI][subKey].btns.length; btnI++) {
                        for (keytext in cFunc[subFuncI][subKey].btns[btnI]) {
                          if (typeof (cFunc[subFuncI][subKey].btns[btnI][keytext]) == 'function') {
                            btnsHandler.push(cFunc[subFuncI][subKey].btns[btnI][keytext]);
                          };
                        }
                      }
                      subHandlerArr.push(btnsHandler);
                    }
                  }
                }
                handlerArr.push(subHandlerArr);
                levelJson[3] = true;
              } else {
                //其它的就不对了
              }

            }
          }
          handlerJson.handler = handlerArr;
          handlerJson.level = levelJson;
          break;
        case 'input':
          //输入框，可能包含一个或多个跟随的按钮 btns[{'text':function},{}]
          //这里定义数据给的不好，不应该定义数组格式，因为目前满足的是一个td单元格只能有一个input
          if ($.isArray(customizeJson.data)) {
            handlerJson.handler = {};
            if (typeof (customizeJson.data[0].type) == 'string') {
              if (customizeJson.data[0].type !== '') {
                handlerJson.handler.type = customizeJson.data[0].type;
              }
            }
            if (typeof (customizeJson.data[0].handler) == 'function') {
              handlerJson.handler.handler = customizeJson.data[0].handler;
            }
            if ($.isArray(customizeJson.data[0].btns)) {
              //是否存在button按钮,可能跟多个按钮所以存储为数组
              var inputBtnArr = customizeJson.data[0].btns;
              handlerJson.handler.btns = [];
              for (var btnIndex = 0; btnIndex < inputBtnArr.length; btnIndex++) {
                if (typeof (inputBtnArr[btnIndex].handler) == 'function') {
                  handlerJson.handler.btns.push(inputBtnArr[btnIndex].handler);
                }
              }
            }
          }
          break;

        case 'checkbox':
          if ($.isArray(customizeJson.data)) {
            //checkbox是多选还是单选
            if ($.isArray(customizeJson.data[0].subdata)) {
              handlerJson.isChecks = true;
            } else {
              handlerJson.isChecks = false;
            }
            if (typeof (customizeJson.data[0].handler) == 'function') {
              handlerJson.handler = customizeJson.data[0].handler;
            }
          }
          break;
        case 'select':
        case 'selectbase':
        case 'radio':
        case 'formatDate':
        case 'href':
        case 'image':
          if ($.isArray(customizeJson.data)) {
            if (typeof (customizeJson.data[0].handler) == 'function') {
              handlerJson.handler = customizeJson.data[0].handler;
            }
          }
          break;
        case 'itemsub':
           if(typeof(customizeJson.data)=='function'){
              handlerJson.handler = customizeJson.data;
           }
          break;
        case 'ajaxSelect':
            handlerJson.data = customizeJson.data;
          break;  
        default:
          //默认情况下都是有个handler
          for (var customizeIndex in customizeJson.data) {
            if (typeof (customizeJson.data[customizeIndex].handler) == 'function') {
              handlerJson.handler = customizeJson.data[customizeIndex].handler;
            }
          }
          break;
      }

      //是否存在format
      if (typeof (customizeJson.format) == 'object') {
        if (!$.isEmptyObject(customizeJson.format)) {
          if (customizeJson.format.rules) {
            //如果存在规则
            baseDataTable.formatValidate[tableID].validateArr.push(i);
            baseDataTable.formatValidate[tableID].rules[i] = customizeJson.format.rules;
          }
          if (typeof (customizeJson.format.handler) == 'function') {
            handlerJson = {
              columnIndex: i,
              columnType: customizeJson.format.type,
              handler: customizeJson.format.handler
            }
          }
        }
      }

      tableHandler[i] = handlerJson;
    }
    //是否有设置tooltip
    if (columnData[i].tooltip == true) {
      var handlerJson = {
        columnIndex: i,
        columnType: 'tooltip'
      };
      tableHandler[i] = handlerJson;
    }
  }
  baseDataTable.formatHandler[tableID].handlerArr = tableHandler;
}
/********************datatable自定义组件事件 start*****************************/
baseDataTable.uploadHandler = function (tableID) {
  var handlerObj = baseDataTable.formatHandler[tableID].handlerArr;
  //上传文件的查看缩略图事件
  //上传文件的查看文件事件
  var $lookFile = $('#' + tableID + ' tbody tr .td-upload .table-uploadContent .upload-content >a.upload-title');
  $lookFile.off('click');
  $lookFile.on('click', function (ev) {
    var contentStr = $.trim($(this).text());
    var columnid = $(this).closest('.td-upload').children('[ns-type="file"]').attr('columnid');
    var handler = handlerObj[columnid].handler.lookHandler;
    if (typeof (handler) == 'function') {
      var funcObj = getFuncData($(this));
      handler(funcObj);
    }
  });
  //删除文件
  var $deleteFile = $('#' + tableID + ' tbody tr .td-upload .table-uploadContent .upload-content >a.upload-delete');
  $deleteFile.off('click');
  $deleteFile.on('click', function (ev) {
    var contentStr = $.trim($(this).text());
    var columnid = $(this).closest('.td-upload').children('[ns-type="file"]').attr('columnid');
    var funcObj = getFuncData($(this));
    $(this).closest('span').remove();
    var handler = handlerObj[columnid].handler.deleteHandler;
    if (typeof (handler) == 'function') {
      handler(funcObj);
    }
  });

  //返回通用属性
  function getFuncData($dom, arrayLevel) {
    //arrayLevel是1,2,3代表一维数组，二维数组，三维数组
    var cTableID = $dom.closest('table').attr('id');
    var cTr = $dom.closest('tr');
    var cRow = baseDataTable.table[cTableID].row(cTr);
    var columnID = Number($dom.attr('columnid'));
    var fid = Number($dom.attr('fid'));
    var subbtnIndex = Number($dom.attr('subbtnid'));
    var returnObj = {};
    //optionIndex和subbtnIndex都可能没有
    if (typeof ($dom.attr('optionid')) == 'string') {
      returnObj.optionIndex = Number($dom.attr('optionid'));
    }
    if (typeof ($dom.attr('subbtnid')) == 'string') {
      returnObj.subbtnIndex = Number($dom.attr('subbtnid'));
    }
    returnObj.tableId = cTableID;
    returnObj.rowIndex = cRow;
    returnObj.colIndex = columnID;
    returnObj.rowIndexNumber = cRow.index();
    returnObj.rowData = cRow.data();
    returnObj.obj = $dom;
    returnObj.buttonIndex = fid;
    returnObj.id = $dom.attr('id');
    returnObj.originalValue = $.trim($dom.val());
    returnObj.value = $.trim($dom.val());
    return returnObj;
  }
}

baseDataTable.selfDefineModule = function (tableID) {
  var uiConfig = baseDataTable.data[tableID].uiConfig;
  var handlerObj = baseDataTable.formatHandler[tableID].handlerArr;
  var isDropzone = false;
  var $container = baseDataTable.data[tableID].uiConfig.$container;
  //var start = new Date().getTime();
  var browerSystem = baseDataTable.data[tableID].uiConfig.browerSystem;
  for (columnid in handlerObj) {
    var type = handlerObj[columnid].columnType;
    var handlerArr = handlerObj[columnid].handler;
    var levelObj = handlerObj[columnid].level;
    switch (type) {
      case 'button':
        if(browerSystem == 'mobile'){
          mobileTableButtonData(columnid);
        }
        //普通按钮
        var $tdButton = $container.find('td.td-button');
        $tdButton.off('click');
        $tdButton.on('click',function(ev){
          ev.stopPropagation();
        });
        //levelObj的结构是{1:true,3:true}，只会有true
        //有一维数组，包含普通按钮
        //有一维数组，包含普通按钮
        if (typeof (levelObj[1]) == 'boolean') {
          var $buttons = $tdButton.find('button[type="button"]');
          $buttons.off('click');
          $buttons.on('click', buttonHandler);
        }
        //有二维数组，包含下拉按钮组
        if (typeof (levelObj[2]) == 'boolean') {
          var $dropButtons = $('#' + tableID + ' .td-button > .btn-group > button[type="button"]');
          $dropButtons.off('click');
          $dropButtons.on('click', buttonGroupHandler);
          var $dropMeunLists = $('#' + tableID + ' .td-button > .btn-group > .dropdown-menu > li > a')
          $dropMeunLists.off('click');
          $dropMeunLists.on('click', buttonGroupListHandler);
        }
        //有三维数组，下拉按钮组中有子按钮
        if (typeof (levelObj[3]) == 'boolean') {
          var $dropButtons = $('#' + tableID + ' .td-button > .btn-group > button[type="button"]');
          $dropButtons.off('click');
          $dropButtons.on('click', buttonGroupHandler);
          var $dropMeunListTitles = $('#' + tableID + ' .td-button > .btn-group > .dropdown-menu > li > .li-title a.li-title-a');
          $dropMeunListTitles.off('click');
          $dropMeunListTitles.on('click', buttonGroupListButtonHandler);
          var $dropMeunListBtns = $('#' + tableID + ' .td-button > .btn-group > .dropdown-menu > li > .li-btns button');
          $dropMeunListBtns.off('click');
          $dropMeunListBtns.on('click', buttonGroupListButtonHandler);
        }
        break;
      case 'upload':
        $('#' + tableID + ' tbody tr .td-upload').off('click', function (ev) { ev.stopPropagation(); });
        $('#' + tableID + ' tbody tr .td-upload').on('click', function (ev) { ev.stopPropagation(); });
        baseDataTable.tableUploadJson[tableID].columnIndexArr.push(columnid);
        break;
      case 'input':
        var $tdInput = $container.find('td.td-input');
        $tdInput.off('click');
        $tdInput.on('click',function(ev){
          ev.stopPropagation();
        });
        var $input = $tdInput.find('input[type="text"]');
        $input.off('focus');
        $input.on('focus', inputHandler);
        var $inputBtn = $input.find('button[type="button"]');
        $inputBtn.off('click');
        $inputBtn.on('click', inputBtnHandler);
        break;
      case 'checkbox':
        var $tdCheckbox = $container.find('td.td-checkbox');
        $tdCheckbox.off('click');
        $tdCheckbox.on('click',function(ev){
          ev.stopPropagation();
        });
        var $tdCheckboxInput = $tdCheckbox.find('input[type="checkbox"]');
        $tdCheckboxInput.off('change');
        $tdCheckboxInput.on('change',checkboxHandler);
        break;
      case 'radio':
        var $tdRadio = $container.find('td.td-radio');
        $tdRadio.off('click');
        $tdRadio.on('click',function(ev){
          ev.stopPropagation();
        });
        var radioLength = $tdRadio.length;
        for(var radioI=0; radioI<radioLength; radioI++){
          var radioName = tableID+'-'+radioI+'-'+columnid+'-radio';
          var $tdRadioInput = $tdRadio.find('input[name="'+radioName+'"]');
          $tdRadioInput.off('change');
          $tdRadioInput.on('change',radioHandler);
        }
        break;
      case 'select':
        var $tdSelect = $container.find('td.td-select');
        $tdSelect.off('click');
        $tdSelect.on('click',function(ev){ev.stopPropagation();});
        var $select = $tdSelect.find('select[name="'+tableID+'-select"]');
        var $selectbox = $select.selectBoxIt().on({
          'open': function () {
            $(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
          },
        });
        $selectbox.off('close');
        $selectbox.on('close', commonHandler);
        break;
      case 'selectbase':
        var $tdSelect = $container.find('td.td-selectbase');
        $tdSelect.off('click');
        $tdSelect.on('click',function(ev){ev.stopPropagation();});
        var $select = $tdSelect.find('select[name="'+tableID+'-select"]');
        $select.off('change');
        $select.on('change', commonHandler);
        break;
      case 'selectbaseFunc':
        var $tdSelect = $container.find('td.td-func');
        $tdSelect.off('click');
        $tdSelect.on('click',function(ev){ev.stopPropagation();});
        var $select = $tdSelect.find('select[name="'+tableID+'-select"]');
        $select.off('change');
        $select.on('change', commonHandler);
        break;
      case 'formatDate':
        //仅限日期类型
        var $tdDate = $container.find('td.td-formatDate');
        $tdDate.off('click');
        $tdDate.on('click',function(ev){ev.stopPropagation();});
        $date = $tdDate.find('input[type="text"]');
        $date.datepicker({
          autoclose: true,
          todayHighlight: true,
          format: 'yyyy-mm-dd',
        });
        $date.off('changeDate');
        $date.on('changeDate', function (ev) {
          var funcObj = getFuncData($(this));
          var tableID = funcObj.tableId;
          var ruleId = 'row-' + funcObj.rowIndexNumber + 'col-' + funcObj.colIndex;
          var data = funcObj.rowData;
          var dataField = baseDataTable.data[tableID].columnConfig[funcObj.colIndex].data;
          data[dataField] = $(this).val().trim();
          var rules = baseDataTable.formatValidate[tableID].rules;
          var validateArr = baseDataTable.formatValidate[tableID].validateArr;
          var ruleJson = {
            value: $(this).val().trim(),
            rules: rules[funcObj.colIndex],
            data: data,
          }
          var isReturn = baseDataTable.columnValueValidate(ruleJson);
          if (isReturn == false) {
            $(this).css({ 'border': '1px solid red' });
          } else {
            $(this).removeAttr('style');
          }
          if ($.inArray(funcObj.colIndex, validateArr) != -1) {
            baseDataTable.formatValidate[tableID].rulesJson[ruleId] = isReturn;
          }

          var handlerFunc = handlerObj[funcObj.colIndex].handler;
          if (typeof (handlerFunc) == 'function') {
            handlerFunc(funcObj);
          }
        });
        break;
      case 'href':
        var $tdHref = $container.find('td.td-href');
        $tdHref.off('click');
        $tdHref.on('click',function(ev){ev.stopPropagation();});
        var $href = $tdHref.find('a');
        $href.off('click');
        $href.on('click', commonHandler);
        break;
      case 'image':
        var $tdImage = $container.find('td.td-image');
        $tdImage.off('click');
        $tdImage.on('click',function(ev){ev.stopPropagation();});
        var $image = $tdImage.find('img');
        $image.off('click');
        $image.on('click', imageHandler);
        break;
      case 'tooltip':
        var $tdInput = $container.find('td.td-tooltip');
        $.each($tdInput, function (key, value) {
          var options = {
            title: $.trim($(value).text()),
            placement: 'bottom',
            container: 'body',
          };
          $(value).tooltip(options);
          $(value).on('click',function(ev){
            $(this).tooltip('hide')
          })
        })
        break;
      case 'itemsub':

        var $tdItem = $container.find('td.td-itemsub');
        var dataArr = baseDataTable.getAllTableData(tableID);    //表格数据
      

        var itemsubColumnId = handlerObj[columnid].columnIndex;  //配置参数中当前field的索引值
        var itemsubColumnConfig = baseDataTable.data[tableID].columnConfig[itemsubColumnId]; //查找表格对象
        var itemsubNameValue = itemsubColumnConfig.formatHandler.nameField;  //查找要显示的数据
        
        // console.log(itemsubColumnId);
        // console.log(itemsubColumnConfig);
        // console.log(itemsubNameValue);

        $tdItem.children('span.caprit').off("mouseenter");
        
        $tdItem.children('span.caprit').on("mouseenter", {tableData:dataArr, nameField:itemsubNameValue}, function(event){
          var tableDataArray = event.data.tableData; //表格数据
          var nameField = event.data.nameField;      //列表显示数据
          var $this = $(this);
          //处理数据
          var rowIndex = $this.attr('ns-index');
          var childrenData = tableDataArray[rowIndex].children;  //列表数据

          //处理分页
          var pageLength = Math.ceil(childrenData.length/5); //总页数
          var pageData = [];  //分页数据
          for(var childrenI = 0; childrenI<childrenData.length; childrenI++){
            //每5条数据就添加一个新数组
            if(childrenI%5 == 0){
              pageData.push([]);
            }
            pageData[Math.floor(childrenI/5)].push(childrenData[childrenI]);
          }
          var curentPageNum = 0;  //默认显示的页数
          //生成容器代码
          var containerHtml = '';
          var listHtml = '';
          var paginationHtml = '';

          //页数代码
          if(pageLength == 1){
            paginationHtml = '';
          }else{
            for(var pageI = 0; pageI<pageLength; pageI++){ //插入页数
              paginationHtml += '<li><a href="javascript:void(0);">'+(pageI+1)+'</a></li>';
            }
          }
          //列表代码
          function getListHtml(pageNum){
            var html = '';
            for(var listI = 0; listI<pageData[pageNum].length; listI++){
              html += '<li>'+pageData[pageNum][listI][nameField]+'</li>';
            }
            return html;
          }
          listHtml = getListHtml(curentPageNum);
          //位置style
          var thisOffset = $this.offset();
          var pageOffset = $this.closest('.page-container').offset();
          var targetOffset = {
            left:thisOffset.left - pageOffset.left,
            top:thisOffset.top - pageOffset.top
          }
          var positionStyle = 
                'top:'+targetOffset.top+'px;'
              + 'left:'+targetOffset.left+'px;';
          positionStyle = ' style="'+positionStyle+'"';
          containerHtml = 
                '<ul class="itemsub-list">'+listHtml+'</ul>'
              + '<ul class="pagination">'+paginationHtml+'</ul>';
          containerHtml = 
                '<div id="tableItemsubContainer" class="table-itemsub-container"'+positionStyle+'>'
              +   '<div class="list-body">'
              +     containerHtml
              +   '</div>'
              +   '<div class="list-span">'
              +   '</div>'
              + '</div>';

          //初始化容器事件和对象
          if($('#tableItemsubContainer').length>0){
            $('#tableItemsubContainer').remove();
          }
          $('body').append(containerHtml);
          $itemsubContainer = $('#tableItemsubContainer');
          $itemsubListContainer = $itemsubContainer.children('div.list-body');
          $itemsubList = $itemsubContainer.find('ul.itemsub-list');

          //targetOffset.top 

          //计算偏移量
          var winHeight = $(window).height();
          var scrollHeight = $(window).scrollTop();
          var listHeight = $itemsubListContainer.outerHeight();
          if(listHeight<=(winHeight-targetOffset.top)||targetOffset.top<(listHeight+scrollHeight)){
            //向下显示 当前位置正确
          }else{
            $itemsubListContainer.css('top',-listHeight+18);
          }
          //添加翻页事件
          $itemsubListContainer.find('.pagination li a').on('click', function(clickEvent){
            var clickPageNum = parseInt($(this).text())-1;
            var html = getListHtml(clickPageNum);
            $itemsubList.html(html);
          });

          //添加离开事件
          $itemsubContainer.children('div').on('mouseleave',function(mouseEvent){
            if(mouseEvent.type=='mouseleave'){
              var isOutContainer = true;
              var $aa;
              function documentMouseMoveHandler(documentMouseEvent){
                $aa = $(documentMouseEvent.target);
                isOutContainer = $(documentMouseEvent.target).closest('.table-itemsub-container').length == 0;
              }
              $(document).off('mousemove',documentMouseMoveHandler);
              $(document).on('mousemove',documentMouseMoveHandler)
              setTimeout(function(timerEvent){
                //console.log($aa)
                $(document).off('mousemove',documentMouseMoveHandler);
                if(isOutContainer){
                  $itemsubContainer.remove();
                }
              },500)
            }  
          })
          //添加单击事件
          $itemsubContainer.children('div.list-span').on('mouseup',function(mouseUpEvent) {
            var tableDataArray = event.data.tableData; //表格数据
            var nameField = event.data.nameField;      //列表显示数据
            //处理数据
            var rowIndex = $this.attr('ns-index');
            var listData = tableDataArray[rowIndex];  //列表数据
            var columnIndex = $this.attr('ns-column');
            if(typeof(handlerObj[columnIndex].handler)=='function'){
              var returnObj = getFuncData($this);
              returnObj.colIndex = columnIndex;
              handlerObj[columnIndex].handler(returnObj);
            }
          })
        });
        break;
      case 'ajaxSelect':
        var $tdSelect = $container.find('td.td-ajaxSelect');
        $tdSelect.off('click');
        $tdSelect.on('click',function(ev){
          ev.stopPropagation();
          var $this = $(this);
          if($('.ajaxselect-plane').length > 0){$('.ajaxselect-plane').remove();return;}
          var funcObj = getFuncData($this);
          var columnId = $this.children('a').attr('columnid');
          var obj = handlerObj[columnId];
          var $tr = $this.closest('tr');
          var currentOffset = $this.offset();
          var height = $this.outerHeight();
          var width = $this.outerWidth();
          var parentOffset = $this.closest('.table-responsive').offset();
          var positionOffset = {
            left:currentOffset.left - parentOffset.left,
            top:currentOffset.top - parentOffset.top + height
          }
          var positionStyle = 'left:'+positionOffset.left+'px;';          //top
          positionStyle += ' top:'+positionOffset.top+'px;';          //left
          //填充html
          function fillHtml(data){
            var html = '<div class="ajaxselect-plane" style="'+positionStyle+'"><ul style="width:'+width+'px">';
            for(var fillI=0; fillI<data.length; fillI++){
              html += '<li ns-id="'+data[fillI][obj.data.valueField]+'">'+data[fillI][obj.data.textField]+'</li>';
            }
            html += '</ul></div>';
            $('.ajaxselect-plane').remove();
            $this.closest('table').after(html);
            function documentClickHandler(ev){
                //点击屏幕无关位置关闭弹框
                //判断当前点击区域是否在指定区域如果没有则移除面板
                $(document).off('click',documentClickHandler);//触发整体键盘单击事件
                var $plane = $('.ajaxselect-plane');
                if($plane.length > 0){
                  var dragel = $plane[0];
                  var target = ev.target;
                  if(dragel != target && !$.contains(dragel,target)){
                     $plane.remove();
                  }
                }
            }
            $(document).on('click',documentClickHandler);//触发整体键盘单击事件
            $('.ajaxselect-plane ul > li').on('click',function(event){
              $(document).off('click',documentClickHandler);//触发整体键盘单击事件
              var $li = $(this);
              var jsonData = {};
              jsonData[obj.data.valueField] = $li.attr('ns-id');
              jsonData[obj.data.textField] = $.trim($li.text());
              nsList.rowEdit(funcObj.tableId,jsonData,{queryMode:'tr',queryValue:$tr});
              if(typeof(obj.data.handler)=='function'){
                obj.data.handler(funcObj);
              }
              $li.closest('.ajaxselect-plane').remove();
            });
          }
          if(!$.isArray(obj.subdata) && $.isEmptyObject(obj.data.ajax.data)){
            //异步请求值
            //没有配置data值，则按照旧方法的ajax请求走
            var ajax = $.extend(true,{},obj.data.ajax);
            ajax.plusData = obj.data;
              nsVals.ajax(ajax,function(res,ajaxData){
                if(res.success){
                  var data = res[ajaxData.plusData.ajax.dataSrc];
                  handlerObj[columnId].subdata = data;
                  fillHtml(data);
                }
              },true);
          }else if(!$.isEmptyObject(obj.data.ajax.data)){
            //如果配置data值，则按照新的ajax方法来，既从data获取要传的参，从funcObj行数据中获取数据传到后台
            var ajax = $.extend(true,{},obj.data.ajax);
            ajax.plusData = obj.data;
            var paramObj = obj.data.ajax.data;
            var data = {}; 
            for(var param in paramObj){
              data[param] = nsVals.getTextByFieldFlag(paramObj[param],funcObj.rowData);
              if(data[param] === 'undefined'){data[param] = '';}
            }
            ajax.data = data;
            nsVals.ajax(ajax,function(res,ajaxData){
              if(res.success){
                var data = res[ajaxData.plusData.ajax.dataSrc];
                handlerObj[columnId].subdata = data;
                fillHtml(data);
              }
            },true);
          }else{
            //已经存在值直接显示
            fillHtml(obj.subdata);
          }
        });
        break;
      case 'thumb':
      case 'multithumb':
        //查看缩略图
       /* var $tdThumb = $container.find('td.td-thumb');
        //.not('.no-thumb')
        $tdThumb.off('click');
        $tdThumb.on('click',function(ev){
          ev.stopPropagation();
          var $this = $(this);
          var funcObj = getFuncData($this);
          
        });*/
        var $images = $container.find('td.td-thumb');
        var options = {
          // inline: true,
          url: 'data-original',
        };
        if($images.length > 0){
          $($images[0]).closest('.table-responsive').on().viewer(options);
        }
        //console.log($images.querySelectorAll('img'))
        //$container.on().viewer(options);
        break;
    }
  }
  //手机端触发事件
  function mobileTableButtonData(columnid){
    var buttonData = baseDataTable.data[tableID].columnConfig[columnid].formatHandler.data.subdata;
    var mobileBtnID = tableID+'-plus-button-panel';
    var html = '<div class="'+mobileBtnID+' nav-form templates-table-mobile-button" id="'+mobileBtnID+'" style="display:none;"></div>';
    baseDataTable.data[tableID].uiConfig.$table.parent().append(html);
    var btns = [];
    for(var btnI=0; btnI<buttonData.length; btnI++){
      for(var sub in buttonData[btnI]){
        btns.push({text:sub,handler:mobileButtonHandler,type:'white',isReturn:true,isShowText:false,isShowIcon:true});
      }
    }
    var btnJson = {
      id:mobileBtnID,
      isShowTitle:false,
      btns:[btns]
    }
    nsNav.init(btnJson);
    var $mobileBtn = $('#'+mobileBtnID);
    $mobileBtn.prepend('<button type="button" class="btn btn-info btn-icon templates-mobile-plus-btn"><i class="fa-plus"></i></button>');
    $mobileBtn.children('div').css('display','none');
    $mobileBtn.find('.templates-mobile-plus-btn').off('click');
    $mobileBtn.find('.templates-mobile-plus-btn').on('click',function(ev){
      var $this = $(this).siblings();
      if($this.css('display')=='block'){
        $this.css('display','none');
        $(this).removeClass('active');
      }else{
        $this.css('display','block');
        $(this).addClass('active');
      }
    });
    function mobileButtonHandler(element){
      var btnIndex = element.attr('fid');
      var cTableID = element.closest('.nav-form').attr('ns-tableid');
      var cTr = $('#'+cTableID).find('.selected');
      var cRow = baseDataTable.table[cTableID].row(cTr);
      var columnID = Number(columnid);
      var returnObj = {};
      returnObj.tableId = cTableID;
      returnObj.rowIndex = cRow;
      returnObj.colIndex = columnID;
      returnObj.rowIndexNumber = cRow.index();
      returnObj.rowData = cRow.data();
      returnObj.obj = element;
      returnObj.buttonIndex = btnIndex;
      var handlerFunc = handlerObj[columnid].handler[btnIndex];
      if(typeof(handlerFunc)=='function'){handlerFunc(returnObj);}
    }
  }
  //console.log(new Date().getTime()-start);
  function checkboxHandler(ev) {
    $(this).prev().toggleClass('checked');
    var funcObj = getFuncData($(this));
    var columnData = baseDataTable.data[tableID].columnConfig[funcObj.colIndex].formatHandler;
    var isChecks = handlerObj[funcObj.colIndex].isChecks;
    var checkState = 'unSelected';//选中状态
    //如果是一个checkbox
    if (isChecks == false) {
      if ($(this).prev().hasClass('checked')) {
        checkState = 'selected';
        funcObj.value = columnData.data[0].checkedFlag;
        baseDataTable.data[tableID].selectedCheckedData.push(funcObj.rowData);
      } else {
        checkState = 'unSelected';
        funcObj.value = columnData.data[0].uncheckedFlag;
        for (var notCheckIndex in baseDataTable.data[tableID].selectedCheckedData) {
          if (isObjectValueEqual(funcObj.rowData, baseDataTable.data[tableID].selectedCheckedData[notCheckIndex])) {
            baseDataTable.data[tableID].selectedCheckedData.splice(notCheckIndex, 1);
          }
        }
      }
      var dataFiled = baseDataTable.data[tableID].columnConfig[funcObj.colIndex].data;
      if(!columnData.data[0].isShowText){funcObj.rowData[dataFiled] = funcObj.value;}
    } else {
      if ($(this).prev().hasClass('checked')) {
        checkState = 'selected';
      } else {
        checkState = 'unSelected';
      }
    }
    var returnHandler = handlerObj[funcObj.colIndex].handler;
    if (typeof (returnHandler) == 'function') {
      returnHandler(funcObj.rowData, checkState, funcObj.value);
    }
  }
  function radioHandler(ev) {
    var nameStr = $(this).attr('name');
    var $nameStr = '[name="'+nameStr+'"]';
    var value = $($nameStr+':checked').val();
    $($nameStr).parent().children('label').removeClass('checked')
    $($nameStr+':checked').prev().addClass('checked');
    var funcObj = getFuncData($(this));
    var columnData = baseDataTable.data[tableID].columnConfig[funcObj.colIndex].formatHandler;
    var dataFiled = baseDataTable.data[tableID].columnConfig[funcObj.colIndex].data;
    funcObj.rowData[dataFiled] = value;
    var returnHandler = handlerObj[funcObj.colIndex].handler;
    if (typeof (returnHandler) == 'function') {
      returnHandler(funcObj.rowData, funcObj.value);
    }
  }
  var uploadColumnIndexArr = baseDataTable.tableUploadJson[tableID].columnIndexArr;
  if (uploadColumnIndexArr.length > 0) {
    var $upload = $('#' + tableID + ' tbody tr .td-upload > [ns-type="file"]');
    var dropzoneArr = baseDataTable.tableUploadJson[tableID].dropzoneObj;
    if (dropzoneArr.length > 0) {
      //重构表格使用
      $.each($upload, function (key, value) {
        if (typeof ($(value)[0].dropzone) == 'undefined') {
          initDropzone($(value));
        }
      })
    } else {
      //初始化
      $.each($upload, function (key, value) {
        initDropzone($(value));
      })
    }
    baseDataTable.uploadHandler(tableID);
  }
  function initDropzone($value) {
    var columnid = $value.attr('columnid');
    var dropzone = $value.dropzone({
      url: handlerObj[columnid].handler.src,
      acceptedFiles: handlerObj[columnid].handler.support,
      dictInvalidFileType: language.netstarDialog.upload.formatNotSupported,
      dictResponseError: language.netstarDialog.upload.dictResponseError,
      dictInvalidFileType: language.netstarDialog.upload.nameTypeNotMatch,
      autoProcessQueue: true,//不自动上传
      success: function (file, data) {
        $(this.element).html('');//默认不适用自带的上传提示
        var columnid = $(this.element).attr('columnid');
        var handler = handlerObj[columnid].handler.changeHandler;
        if (handlerObj[columnid].handler.isShowFile == true) {
          //默认显示的是文件
          var html = '<span class="upload-content">'
            + '<a href="javascript:void(0)" class="upload-title">' + file.name + '</a>'
            + '<a href="javascript:void(0)" class="upload-delete"></a>'
            + '</span>'
          $(this.element).next('.table-uploadContent').html(html);
          baseDataTable.uploadHandler($(this.element).closest('table').attr('id'));
        }
        if (typeof (handler) == 'function') {
          handler(file, data);
        }
      },
      thumbnail: function (file, dataUrl) {
        //上传的缩略图
        $(this.element).parent().children('img').attr('src', dataUrl);
      },
      error: function (file, errorMessage) {
        $(this.element).html('');//默认不适用自带的上传提示
        $(this.element).parent().children('img').attr('src', '');
        nsAlert(errorMessage);
      }
    });
    baseDataTable.tableUploadJson[tableID].dropzoneObj.push(dropzone);
  }
  //返回通用属性
  function getFuncData($dom, arrayLevel) {
    //arrayLevel是1,2,3代表一维数组，二维数组，三维数组
    var cTableID = $dom.closest('table').attr('id');
    var cTr = $dom.closest('tr');
    var cRow = baseDataTable.table[cTableID].row(cTr);
    var columnID = Number($dom.attr('columnid'));
    var fid = Number($dom.attr('fid'));
    var subbtnIndex = Number($dom.attr('subbtnid'));
    var returnObj = {};
    //optionIndex和subbtnIndex都可能没有
    if (typeof ($dom.attr('optionid')) == 'string') {
      returnObj.optionIndex = Number($dom.attr('optionid'));
    }
    if (typeof ($dom.attr('subbtnid')) == 'string') {
      returnObj.subbtnIndex = Number($dom.attr('subbtnid'));
    }
    returnObj.tableId = cTableID;
    returnObj.rowIndex = cRow;
    returnObj.colIndex = columnID;
    returnObj.rowIndexNumber = cRow.index();
    returnObj.rowData = cRow.data();
    returnObj.obj = $dom;
    returnObj.buttonIndex = fid;
    returnObj.id = $dom.attr('id');
    returnObj.value = $.trim($dom.val());
    return returnObj;
  }
  function imageHandler(ev) {
    var funcObj = getFuncData($(this));
    var handlerFunc = handlerObj[funcObj.colIndex].handler;
    if (typeof (handlerFunc) == 'function') {
      handlerFunc(funcObj);
    }
  }
  function commonHandler(ev) {
    var funcObj = getFuncData($(this));
    var tableID = funcObj.tableId;
    var ruleId = 'row-' + funcObj.rowIndexNumber + 'col-' + funcObj.colIndex;
    var data = funcObj.rowData;
    var dataField = baseDataTable.data[tableID].columnConfig[funcObj.colIndex].data;
    data[dataField] = $(this).val().trim();
    var rules = baseDataTable.formatValidate[tableID].rules;
    var type = $(this).attr('ns-table');
    var validateArr = baseDataTable.formatValidate[tableID].validateArr;
    switch (type) {
      case 'select':
        var ruleJson = {
          value: $(this).val().trim(),
          rules: rules[funcObj.colIndex],
          data: data,
        }
        var isReturn = baseDataTable.columnValueValidate(ruleJson);
        var domID = $(this).attr('id') + 'SelectBoxIt';
        $dom = $('#' + domID);
        if (isReturn == false) {
          $dom.css({ 'border': '1px solid red' });
        } else {
          $dom.removeAttr('style');
        }
        if ($.inArray(funcObj.colIndex, validateArr) != -1) {
          baseDataTable.formatValidate[tableID].rulesJson[ruleId] = isReturn;
        }
        break;
      case 'selectbase':
        var ruleJson = {
          value: $(this).val().trim(),
          rules: rules[funcObj.colIndex],
          data: data,
        }
        var isReturn = baseDataTable.columnValueValidate(ruleJson);
        $dom = $(this);
        if (isReturn == false) {
          $dom.css({ 'border': '1px solid red' });
        } else {
          $dom.removeAttr('style');
        }
        if ($.inArray(funcObj.colIndex, validateArr) != -1) {
          baseDataTable.formatValidate[tableID].rulesJson[ruleId] = isReturn;
        }
        break;
    }
    var handlerFunc = handlerObj[funcObj.colIndex].handler;

    if (typeof (handlerFunc) == 'function') {
      handlerFunc(funcObj);
    }
  }
  /****************自定义input事件 start ************************************/
  function inputHandler(ev) {
    var funcObj = getFuncData($(this));
    funcObj.originalValue = funcObj.value;//存放原始值
    var tableID = funcObj.tableId;
    var currentObj = handlerObj[funcObj.colIndex].handler;
    var data = funcObj.rowData;
    var dataField = baseDataTable.data[tableID].columnConfig[funcObj.colIndex].data;
    var ruleId = 'row-' + funcObj.rowIndexNumber + 'col-' + funcObj.colIndex;		//验证当前行当前列的验证id
    var rules = baseDataTable.formatValidate[tableID].rules;
    var validateArr = baseDataTable.formatValidate[tableID].validateArr;
    funcObj.field = dataField;
    if (typeof (currentObj) == 'undefined') {
      $(this).off('blur');
      $(this).on('blur', function (ev) {
        funcObj.value = $(this).val().trim();
        data[dataField] = $(this).val().trim();
        var ruleJson = {
          value: funcObj.value,
          rules: rules[funcObj.colIndex],
          data: data,
        }
        var isReturn = baseDataTable.columnValueValidate(ruleJson);
        if (isReturn == false) {
          $(this).css({ 'border': '1px solid red' });
        } else {
          $(this).removeAttr('style');
        }
        if ($.inArray(funcObj.colIndex, validateArr) != -1) {
          baseDataTable.formatValidate[tableID].rulesJson[ruleId] = isReturn;
        }
      });
    } else {
      //预留验证
      if (typeof (currentObj.type) == 'string') {
        var eventStr;//事件类型
        var isHasEnter = false;//是否有回车事件
        switch (currentObj.type) {
          case 'enter':
            isHasEnter = true;
            break;
          case 'keyup':
          case 'change':
          case 'blur':
          case 'change keyup':
            eventStr = currentObj.type;
            break;
        }
        //存在定义的事件类型是合法的
        if (eventStr) {
          $(this).off(currentObj.type);
          $(this).on(currentObj.type, function (ev) {
            funcObj.value = $(this).val().trim();
            var handlerFunc = currentObj.handler;
            data[dataField] = $(this).val().trim();
            var ruleJson = {
              value: funcObj.value,
              rules: rules[funcObj.colIndex],
              data: data,
            }
            var isReturn = baseDataTable.columnValueValidate(ruleJson);
            if (isReturn == false) {
              $(this).css({ 'border': '1px solid red' });
            } else {
              $(this).removeAttr('style');
            }
            if ($.inArray(funcObj.colIndex, validateArr) != -1) {
              baseDataTable.formatValidate[tableID].rulesJson[ruleId] = isReturn;
            }
            if (typeof (handlerFunc) == 'function') {
              handlerFunc(funcObj);
            }
          });
        } else {
          //判断来源是什么
          if (isHasEnter) {
            //是回车事件
            $(this).off('keyup');
            $(this).on('keyup', function (ev) {
              if (ev.keyCode == 13) {
                funcObj.value = $(this).val().trim();
                var ruleJson = {
                  value: funcObj.value,
                  rules: rules[funcObj.colIndex],
                  data: data,
                }
                var isReturn = baseDataTable.columnValueValidate(ruleJson);
                if (isReturn == false) {
                  $(this).css({ 'border': '1px solid red' });
                } else {
                  $(this).removeAttr('style');
                }
                if ($.inArray(funcObj.colIndex, validateArr) != -1) {
                  baseDataTable.formatValidate[tableID].rulesJson[ruleId] = isReturn;
                }
                var handlerFunc = currentObj.handler;
                if (typeof (handlerFunc) == 'function') {
                  handlerFunc(funcObj);
                }
              }
            });
          }
        }
      } else {
        //没有定义事件类型，默认为失去焦点事件
        $(this).off('blur');
        $(this).on('blur', function (ev) {
          funcObj.value = $(this).val().trim();
          var handlerFunc = currentObj.handler;
          data[dataField] = $(this).val().trim();
          var ruleJson = {
            value: funcObj.value,
            rules: rules[funcObj.colIndex],
            data: data,
          }
          var isReturn = baseDataTable.columnValueValidate(ruleJson);
          if (isReturn == false) {
            $(this).css({ 'border': '1px solid red' });
          } else {
            $(this).removeAttr('style');
          }
          if ($.inArray(funcObj.colIndex, validateArr) != -1) {
            baseDataTable.formatValidate[tableID].rulesJson[ruleId] = isReturn;
          }
          if (typeof (handlerFunc) == 'function') {
            handlerFunc(funcObj);
          }
        });
      }
    }
  }
  function inputBtnHandler(ev) {
    var funcObj = getFuncData($(this));
    var buttonHandler = handlerObj[funcObj.colIndex].handler.btns;
    if (typeof (buttonHandler) == 'object') {
      var functionID = Number($(this).attr('fid'));
      if (isNaN(functionID) == false) {
        if (typeof (buttonHandler[functionID]) == 'function') {
          buttonHandler[functionID](funcObj);
        }
      }
    }
  }
  /****************自定义input事件 end ************************************/
  /****************自定义按钮事件 start ************************************/
  //普通按钮
  function buttonHandler(ev) {
    var funcObj = getFuncData($(this), 1);
    var fileType = $(this).attr('nstype');
    if (fileType == 'upload-file') {
      //上传组件的按钮
      var dropzoneFile = formPlane.dropzoneGetFile['advancedDropzone'];
      var $dropzoneFileDom = formPlane.dropzoneFile['advancedDropzone'];
      if ($.isEmptyObject(dropzoneFile)) {
        //直接回调函数
      } else {
        $dropzoneFileDom.removeFile(dropzoneFile[funcObj.fid]);
      }
    }
    var handlerFunc = handlerObj[funcObj.colIndex].handler[funcObj.buttonIndex];
    if (typeof (handlerFunc) == 'function') { handlerFunc(funcObj); }
  }
  //下拉按钮
  function buttonGroupHandler(ev) {
    var $btnGroup = $(this).parent()
    var isOpen = $btnGroup.hasClass('open');
    if (isOpen) {
      $btnGroup.removeClass('open');
    } else {
      $(this).closest('table').find('.btn-group.open').removeClass('open');
      $btnGroup.addClass('open');
    }
  }
  //下拉按钮组菜单
  function buttonGroupListHandler(ev) {
    var $btnGroup = $(this).closest('.btn-group')
    var isOpen = $btnGroup.hasClass('open');
    if (isOpen) {
      $btnGroup.removeClass('open');
    } else {
      $(this).closest('table').find('.btn-group.open').removeClass('open');
      $btnGroup.addClass('open');
    }
    var funcObj = getFuncData($(this));
    var handlerObj = baseDataTable.formatHandler[funcObj.tableId].handlerArr;
    var handlerFunc = handlerObj[funcObj.colIndex].handler[funcObj.buttonIndex][funcObj.optionIndex];
    handlerFunc(funcObj);
  }
  function buttonGroupListButtonHandler(ev) {
    var $btnGroup = $(this).closest('.btn-group')
    var isOpen = $btnGroup.hasClass('open');
    if (isOpen) {
      $btnGroup.removeClass('open');
    } else {
      $(this).closest('table').find('.btn-group.open').removeClass('open');
      $btnGroup.addClass('open');
    }
    var funcObj = getFuncData($(this));
    var handlerObj = baseDataTable.formatHandler[funcObj.tableId].handlerArr;
    var handlerFunc = handlerObj[funcObj.colIndex].handler[funcObj.buttonIndex][funcObj.optionIndex][funcObj.subbtnIndex];
    handlerFunc(funcObj);
  }
  /***************自定义按钮事件 end **************************************/
}
/********************datatable自定义组件事件 end*****************************/
//设置默认值
baseDataTable.setBaseDefault = function (dataConfig) {
  //是否定义了主键id
  if (dataConfig.primaryKey) {
    dataConfig.primaryID = dataConfig.primaryKey;
  }
  dataConfig.primaryID = typeof (dataConfig.primaryID) == 'string' ? dataConfig.primaryID : 'id';
  if (dataConfig.primaryID == '') {
    dataConfig.primaryID = 'id';
  }

  dataConfig.isSerialNumber = typeof(dataConfig.isSerialNumber)=='boolean'?dataConfig.isSerialNumber:true;//是否自动序列号
  //默认客户端模式
  dataConfig.isServerMode = typeof (dataConfig.isServerMode) == 'boolean' ? dataConfig.isServerMode : false;
  //默认允许列搜索
  dataConfig.isSearch = typeof (dataConfig.isSearch) == 'boolean' ? dataConfig.isSearch : true;
  //默认开启分页
  dataConfig.isPage = typeof (dataConfig.isPage) == 'boolean' ? dataConfig.isPage : true;
  //默认ajax请求方式是GET请求
  dataConfig.type = typeof (dataConfig.type) == 'string' ? dataConfig.type : 'GET';
  if (dataConfig.type == '') { dataConfig.type = 'GET' }
  //默认允许显示第几页
  dataConfig.info = typeof (dataConfig.info) == 'boolean' ? dataConfig.info : true;
  //默认允许选择改变每页显示条数
  dataConfig.isLengthChange = typeof (dataConfig.isLengthChange) == 'boolean' ? dataConfig.isLengthChange : true;
  //默认请求的参数是否为空
  //dataConfig.data = typeof (dataConfig.data) == 'object' ? dataConfig.data : {};
  //默认搜索框是否可见
  dataConfig.isSearchVisible = typeof(dataConfig.isSearchVisible) == 'boolean' ? dataConfig.isSearchVisible : dataConfig.isSearch;
 
  //页码展现形式
  switch(dataConfig.pagingType){
    case 'full':
      dataConfig.pagingType = 'input';
      break;
    case 'simple':
       dataConfig.pagingType = 'simple_numbers';
      break;
    default:
       dataConfig.pagingType = 'simple_numbers';
      break;
  }

  //默认的数据源data
  dataConfig.dataSrc = typeof (dataConfig.dataSrc) == 'string' ? dataConfig.dataSrc : 'data';
  if (dataConfig.dataSrc == '') { dataConfig.dataSrc = 'data' }
  if (typeof (dataConfig.src) == 'undefined') {
    if (dataConfig.dataSource == null) {
      dataConfig.dataSource = [];
    }
  }
  return dataConfig;
}
//判断表格所有数据是否存在空的列字段
baseDataTable.setColumnsFieldDefault = function (columnData, dataArr) {
  for (var cellField = 0; cellField < columnData.length; cellField++) {
    var columnField = columnData[cellField].data;
    for (var i = 0; i < dataArr.length; i++) {
      if (typeof (dataArr[i][columnField]) == 'undefined') {
        dataArr[i][columnField] = '';
      }
    }
  }
  return dataArr;
}
//保存原始config配置参数
baseDataTable.setOriginalConfig = function (dataConfig, columnConfig, uiConfig, btnConfig) {
  var config = {};
  if (typeof (dataConfig) == 'object') {
    config.dataConfig = $.extend(true, {}, dataConfig);
  }
  if (typeof (columnConfig) == 'object') {
    config.columnConfig = $.extend(true, [], columnConfig);
  }
  if (typeof (uiConfig) == 'object') {
    config.uiConfig = $.extend(true, {}, uiConfig);
  }
  if (typeof (btnConfig) == 'object') {
    config.btnConfig = $.extend(true, {}, btnConfig);
  }
  config.html = $('#' + dataConfig.tableID).closest('.table-responsive').html();
  config.html = $.trim(config.html);
  return config;
}
//重新刷新表格
baseDataTable.refreshByID = function (tableID) {
  var originalConfig = baseDataTable.originalConfig[tableID];
  $('#' + tableID).closest('.table-responsive').html(originalConfig.html);
  $('#control-btn-toolbar-' + tableID).remove();
  //console.log($('#'+tableID).innerWidth());
  //console.log(originalConfig.columnConfig);
  baseDataTable.init(originalConfig.dataConfig, originalConfig.columnConfig, originalConfig.uiConfig, originalConfig.btnConfig);
}
//baseDataTable初始化操作
baseDataTable.init = function (dataConfig, columnConfig, uiConfig, btnConfig) {
  //如果没有传送表格id直接回退不继续执行代码
  if (debugerMode) {
    if (typeof (dataConfig.tableID) != 'string') {
      console.error('表格ID（tableID）未定义');
      console.error(dataConfig);
      return;
    }
  }
  //如果已经初始化过且没有销毁 先执行销毁 cy2018627
  var runData = baseDataTable.data[dataConfig.tableID]
  if(runData){
    //用于支持已经手动销毁的
    if($.isEmptyObject(runData) == false){
      baseDataTable.destroy(dataConfig.tableID);
    }
  }
  //初始化执行
  var browerSystem = nsVals.browser.browserSystem;//当前打开版本
  var dataTableID = dataConfig.tableID;
  uiConfig.browerSystem = browerSystem;
  var defaultConfig = {
    isSingleSelect:true,//默认开启单选
    isMulitSelect:false,//关闭多选
  };
  nsVals.setDefaultValues(uiConfig,defaultConfig);
  dataConfig = baseDataTable.setBaseDefault(dataConfig); //默认值设定
  /************sjj 20180411 当前table展现形式 start*******/
  var styleStr = 'style="height:'+uiConfig.containerHeight+'px"';
  if(uiConfig.containerHeight === 0){
    styleStr = '';
  }
  var tableResponsiveClass = "table-responsive";
  var tableClass = "table table-hover table-bordered table-striped";
  if(browerSystem == 'pc'){
    if(typeof(nsUIConfig)=='object'){
      if(nsUIConfig.tableHeightMode == 'compact'){
        tableClass += ' table-sm';
        tableResponsiveClass += ' table-responsive-sm';
      }
    }
  }
  var tabelHtml = '<div class="'+tableResponsiveClass+'" '+styleStr+'>'
                    +'<table cellspacing="0" class="'+tableClass+'" id="'+dataTableID+'">'
                    +'</table>'
                  +'</div>';
  /************sjj 20180411 当前table展现形式 start********************************************/
  if(uiConfig.$container){
    uiConfig.$container.html(tabelHtml);
  }
  var $tableObj = $('#'+dataTableID);
  //是否定义了容器面板
  if(typeof(uiConfig.$container)=='undefined'){
    uiConfig.$container = $tableObj.closest('.table-responsive').parent();
    if(uiConfig.$container.length == 0){
      uiConfig.$container = $tableObj.parent();
    }
  }
  //判断是否有显示的search输入框 cy 20180314
  if($tableObj.closest('.no-table-search').length>0){
    //该模板隐藏了search，不论是否开启isSearch
    dataConfig.isSearchVisible = false;
  }
  if(dataConfig.isSearchVisible == false){
    //如果搜索面板不可见 sj 20180314
    $tableObj.closest('.table-responsive').addClass('no-table-search');
  }
  //储存原始值
  baseDataTable.originalConfig[dataConfig.tableID] = baseDataTable.setOriginalConfig(dataConfig, columnConfig, uiConfig, btnConfig);
  uiConfig.$table = $tableObj;
  //表格验证的初始化参数配置
  baseDataTable.formatValidate[dataTableID] = {
    validateArr: [],
    rules: {},
    rulesJson: {}
  };
  //初始化当前表的dom元素
  baseDataTable.container[dataTableID] = {
    tableObj: $tableObj,
    multiData: []
  };
  baseDataTable.formatHandler[dataTableID] = {};//初始化用来存放自定义组件的参数配置
  baseDataTable.tableUploadJson[dataTableID] = {};//上传组件
  baseDataTable.tableUploadJson[dataTableID].columnIndexArr = [];//记录上传组件的列下标
  baseDataTable.tableUploadJson[dataTableID].dropzoneObj = [];//记录上传文件的file
  //是否配置了btn按钮
  if (typeof (btnConfig) == 'object') {
    baseDataTable.initBtns(dataConfig, btnConfig, uiConfig, columnConfig);
  }


  uiConfig.isUseMessageState = typeof(uiConfig.isUseMessageState) == 'boolean' ? uiConfig.isUseMessageState : false;//sjj20190118
  uiConfig.isRowState = typeof(uiConfig.isRowState) == 'boolean' ? uiConfig.isRowState : false;//sjj20190118 是否添加行状态
  //将easyUI的表格数据格式转换成DataTable的表格数据格式
  var convertColumnDataArr = baseDataTable.convertColumnData(dataTableID, columnConfig, uiConfig, dataConfig.primaryID);
  var columnData = convertColumnDataArr[0];
  //转存columns对象，把columnConfig有对象形式保存
  var columns = {};
  for (columnI = 0; columnI < columnData.length; columnI++) {
    columns[columnData[columnI].data] = columnData[columnI];
  }
  var searchPlaceholderStr = convertColumnDataArr[1];
  if (typeof (uiConfig.searchPlaceholder) == 'string') {
    searchPlaceholderStr = uiConfig.searchPlaceholder;
  }
  //获取和设定表格搜索框的标题和placeholder
  var searchTitleStr = "<i class='fa fa-search'></i>";
  //如果是手机端模式
  if(uiConfig.browerSystem == 'mobile'){
    $('#'+dataTableID).closest(".table-responsive").removeAttr('style');
    var height = $(window).height();
    var navHeight = $('.page-title').outerHeight();
    height = height - navHeight - 36;
    rowsNum = Math.floor(height/44);
    rowsNum = rowsNum - 1;
    uiConfig.pageLengthMenu = rowsNum;
  }

  uiConfig.isOpenCheck = typeof(uiConfig.isOpenCheck) == 'boolean' ? uiConfig.isOpenCheck : false;
  uiConfig.isUseTableControl = typeof(uiConfig.isUseTableControl) == 'boolean' ? uiConfig.isUseTableControl : false;

  //获取容器类型 
  uiConfig.tableContainerType = baseDataTable.getTableContainerType(uiConfig);
  //设置并获取 表格高度模式 设定表格高度模式 并返回高度模式类型 return string 'compact' 'wide'  cy 201803012
  uiConfig.tableHeightType = baseDataTable.setTableHeightType(uiConfig);
  //获取自动计算的页面条数
  //如果定义了固定读取行高，或者uiConfig.pageLengthMenu给的是固定值而非数组则不用自动计算 sj20180314
  var rowsNum = 0;
  if(typeof(uiConfig.pageLengthMenu) == 'number'){
    //固定行高
    rowsNum = uiConfig.pageLengthMenu;
  }else{
    rowsNum = baseDataTable.getAutoRowsNumber(dataConfig, columnConfig, uiConfig, btnConfig);
  }
  var lengthMenuArr = [[rowsNum, 25, 50, -1], [rowsNum, 25, 50, language.datatable.fillStatus.whole]];
  if (typeof (uiConfig.pageLengthMenu) != 'undefined') {
    var newLengthMenuArr = [uiConfig.pageLengthMenu, [].concat(uiConfig.pageLengthMenu)];
    for (var i = 0; i < uiConfig.pageLengthMenu.length; i++) {
      if (uiConfig.pageLengthMenu[i] == 'all') {
        newLengthMenuArr[0][i] = -1;
        newLengthMenuArr[1][i] = language.datatable.fillStatus.whole;
      } else if (uiConfig.pageLengthMenu[i] == 'auto') {
        newLengthMenuArr[0][i] = rowsNum;
        newLengthMenuArr[1][i] = rowsNum;
      }
    }
    lengthMenuArr = newLengthMenuArr;
  }
  uiConfig.pageLengthMenu = lengthMenuArr;
  //dom设置用来配置表格滚动条和底部分页
  var noneClass = '';
  if(dataConfig.isPage == false && dataConfig.info == false && uiConfig.isUseTabs == false){
      noneClass = 'nstable-bottom-none';
  }
  var domStr = 'frt<"nstable-bottom '+noneClass+'"<"nstable-page">ip>';
  if (uiConfig.scrollY) {
    domStr = 'fr<"nstable-container-y"t><"nstable-bottom '+noneClass+'"<"nstable-page">ip>'
  } else if (uiConfig.scrollX) {
    domStr = 'fr<"nstable-container-x"t><"nstable-bottom '+noneClass+'"<"nstable-page">ip>'
  } else if (uiConfig.scrollAuto) {
    domStr = 'fr<"nstable-container-auto"t><"nstable-bottom '+noneClass+'"<"nstable-page">ip>'
  }

  //存放数据源配置信息
  baseDataTable.data[dataTableID] = {
    dataConfig:dataConfig,
    columnConfig:columnData,
    uiConfig:uiConfig,
    btnConfig:btnConfig,
    columns:columns,
    amountData:[],
    filterData:[]
  };
 /* baseDataTable.data[dataTableID].dataConfig = dataConfig;
  baseDataTable.data[dataTableID].columnConfig = columnData;
  baseDataTable.data[dataTableID].uiConfig = uiConfig;
  baseDataTable.data[dataTableID].btnConfig = btnConfig;
  baseDataTable.data[dataTableID].columns = columns;
  baseDataTable.data[dataTableID].amountData = [];*/
  if (dataConfig.isPage == false) {
    if (lengthMenuArr[0][0] != -1) {
      //nsalert('翻页已经关闭，选择页面条数必须为全部','warning');
      lengthMenuArr[0][0] = -1
      lengthMenuArr[1][0] = language.datatable.fillStatus.whole;
    }
    if (dataConfig.isLengthChange == true) {
      //nsalert('翻页已经关闭，页面条数修改必须关闭','warning');
      dataConfig.isLengthChange = false;
    }
  }

  if (typeof (uiConfig.pageLengthMenu[0]) == 'number') {
    dataConfig.isLengthChange = false;
  }
  var configObj = {
    dom: domStr,
    autoWidth: false,
    processing: true,
    paginate: dataConfig.isPage,
    stateSave: false,
    columns: columnData,
    lengthMenu: lengthMenuArr,
    searching: dataConfig.isSearch,
    info: dataConfig.info,
    order: [],
    serverSide: dataConfig.isServerMode,
    pagingType: dataConfig.pagingType,
    language: {
      'emptyTable': language.datatable.pageStatus.noData,
      'loadingRecords': language.datatable.pageStatus.inLoad,
      'processing': '<i class="fa fa-spinner fa-pulse fa-5x fa-fw"></i><div><span>' + language.datatable.pageStatus.inQuery + '</span></div>',
      'search': searchTitleStr,
      "searchPlaceholder": searchPlaceholderStr,
      'paginate': {
        'first': '<i class="fa fa-angle-double-left"></i>',
        'last': '<i class="fa fa-angle-double-right"></i>',
        'next': '<i class="fa fa-angle-right"></i>',
        'previous': '<i class="fa fa-angle-left"></i>'
      },
      "lengthMenu": language.datatable.pageStatus.eachPageStrip,
      "zeroRecords": '<span class="tips">'+language.datatable.pageStatus.notFound+'</span><i class="fa fa-inbox"></i>',
      "info": language.datatable.pageStatus.pageNumber,
      "infoEmpty": language.datatable.pageStatus.noRecord,
      "infoFiltered": language.datatable.pageStatus.recordFiltering,
    },
  }
  if(uiConfig.isUseMax){
    configObj.language.info = language.datatable.pageStatus.pageNumberWithMax;
    if(typeof(configObj.language.info)!='string'){
      if(debugerMode){
        console.error('uiConfig.isUseMax设置为可用，但无法在语言文件中找到对应字段， 请配置language.datatable.pageStatus.pageNumberWithMax')
      }
      configObj.language.info = language.datatable.pageStatus.pageNumber;
    }
    configObj.infoCallback = infoCallbackHandler;
  }
  if ($.isArray(dataConfig.dataSource)) {
    //如果自定义配置数据源参，则无需发ajax请求
    configObj.data = dataConfig.dataSource;
    configObj.data = baseDataTable.setColumnsFieldDefault(columnData, configObj.data);
  } else {
    //判断是否给予了src数据请求链接
    var isSrc = false;
    if (typeof (dataConfig.src) == 'string') {
      if (dataConfig.src != '') {
        isSrc = true;
      }
    }
    var contentType = 'application/x-www-form-urlencoded';
    if(dataConfig.contentType){
      contentType = dataConfig.contentType;
    }
    if (isSrc) {
      configObj.ajax = {
        url: dataConfig.src, //请求的数据链接
        type: dataConfig.type,
        contentType:contentType,
        //添加对当前配置对象的引用 cy 2018/11/12
        nsConfig:{
          data:dataConfig,
          ui:uiConfig,
          columns:columnConfig,
          btn:btnConfig
        },
        data: function (d) {
          if(dataConfig.contentType == 'application/json; charset=utf-8'){
              var jsonData = dataConfig.data;
              if(typeof(dataConfig.data)=='string'){
                jsonData = JSON.parse(dataConfig.data);
              }
              return JSON.stringify($.extend({},d,jsonData))
          }else{
            return $.extend({}, d, dataConfig.data);
          }
        },
        dataSrc: function (data, type, row, meta) {
          //返回数据源参

          //如果出现了success:false 则nsalert data.msg cy 2018/11/12
          if(data.success === false){
            var errorStr = ''
            if(typeof(data.msg) == 'string'){
              errorStr = data.msg;
            }else{
              errorStr = '服务器端未知错误';
            }
            nsalert(errorStr, 'error');
            if(debugerMode){
              console.error(errorStr);
              console.error(data);
            }
            return [];
          }
          if (data) {
            if (data[dataConfig.dataSrc]) {
              return data[dataConfig.dataSrc];
            } else {
              return [];
            }
          } else {
            return [];
          }
        },
        //error 处理报错信息 cy 2018/11/12 
        error:function(error){
          $('#'+this.nsConfig.data.tableID+'_processing').remove();
          nsVals.defaultAjaxError(error);
          if(debugerMode){
              console.error(this.nsConfig);
              console.error(error);
            }
        }
      }
    } else {
      console.error('数据请求链接参数有误' + dataConfig.src);
      console.error(dataConfig);
    }
  }

  var columnDefsArr = [];//列配置
  //循环列字段，判断是否含有自定义组件
  for (var columnI = 0; columnI < columnData.length; columnI++) {
    var obj = {};
    if (typeof (columnData[columnI].formatHandler) != 'undefined') {
      var targetID = columnI;
      obj.targets = targetID;
      var render = function (data, type, row, meta) {
        if (typeof (columnData[meta.col].formatHandler) == 'object') {
          var formatType = columnData[meta.col].formatHandler.type;
          var formatData = columnData[meta.col].formatHandler.data;
          var returnFunc = baseDataTable.formatHandler[formatType];
          var returnValue = data;
          if(returnFunc){
              returnValue = returnFunc(data, row, meta, formatData);
          }
          //sjj 20180912 添加行 列背景颜色
          if(typeof(columnData[meta.col].cellColor)=='object'){
            $(meta.settings.aoData[meta.row].anCells[meta.col]).addClass(columnData[meta.col].cellColor[data]);
          }
          if(typeof(columnData[meta.col].rowColor)=='object'){
            $(meta.settings.aoData[meta.row].nTr).addClass(columnData[meta.col].rowColor[data]);
          }
          return returnValue;
        }
      }
      obj.render = render;
      obj.className = 'td-' + columnData[columnI].formatHandler.type;
      columnDefsArr.push(obj);
    }else{
        //存在没有定义formathandler但是定义了rowColor 或者 cellColor的情况sjj 20180917
        if(columnData[columnI].cellColor || columnData[columnI].rowColor){
          var targetID = columnI;
          obj.targets = targetID;
          var render = function (data, type, row, meta) {
              //sjj 20180912 添加行 列背景颜色
              if(typeof(columnData[meta.col].cellColor)=='object'){
                $(meta.settings.aoData[meta.row].anCells[meta.col]).addClass(columnData[meta.col].cellColor[data]);
              }
              if(typeof(columnData[meta.col].rowColor)=='object'){
                $(meta.settings.aoData[meta.row].nTr).addClass(columnData[meta.col].rowColor[data]);
              }
              return data;
          }
          obj.render = render;
          //obj.className = 'td-' + columnData[columnI].formatHandler.type;
          columnDefsArr.push(obj);
        }
    }
  }
  configObj.columnDefs = columnDefsArr; //赋值列自定义组件
  /**********ajax请求成功返回数据的判断 start*******************/
  $tableObj.on('preXhr.dt',function(e,settings,json){
    var uiConfig = baseDataTable.data[settings.sTableId].uiConfig;
    var rowLength = Number(uiConfig.pageLengthMenu[0]);
    if($.isArray(uiConfig.pageLengthMenu[0])){
      rowLength = uiConfig.pageLengthMenu[0][0];
    }
    var tbodyHtml = '';
    if(uiConfig.isOpenCheck){
      for(var rowI=0; rowI<rowLength; rowI++){
        tbodyHtml += '<tr>';
        for(var columnI=0; columnI<columnData.length; columnI++){
          tbodyHtml += columnI == 0 ? '<th><label class="checkbox-inline th-check"></label></th>' : '<td></td>';
        }
        tbodyHtml += '</tr>';
      }
    }else{
      if(baseDataTable.data[settings.sTableId].dataConfig.isSerialNumber){
        for(var rowI=0; rowI<rowLength; rowI++){
          tbodyHtml += '<tr>';
          for(var columnI=0; columnI<columnData.length; columnI++){
            tbodyHtml += columnI == 0 ? '<th>'+(rowI+1)+'</th>' : '<td></td>';
          }
          tbodyHtml += '</tr>';
        }
      }
    }
    uiConfig.$table.children('tbody').html(tbodyHtml);
  }).on('xhr.dt', function (e, settings, json, xhr) {
    //执行ajax事件，在这个环节对数据值判断赋值
    ////settings.sTableId
    ///
    var dataConfig = baseDataTable.data[e.target.id].dataConfig;
    var uiConfig = baseDataTable.data[e.target.id].uiConfig;
    if (json == null) {
      //ajax请求的数据为空
    } else {
      if (json["success"]) {
        //成功之后返回函数
        var dataArr = json[dataConfig.dataSrc];
        //dataSrc设置错误的判断 caoyuan 20180225
        if(typeof(dataArr)=='undefined'){
          console.error('表格ajax的参数dataSrc:'+dataConfig.dataSrc+'设置错误，没有返回数据');
          console.error(json);
        }
        //dataSrc设置错误的判断 end----------------
        if(!$.isEmptyObject(uiConfig.amount)){
          if(typeof(uiConfig.amount)=='object'){
               baseDataTable.data[settings.sTableId].amountData = json[uiConfig.amount.field];
          }
        }
        if (!$.isArray(dataArr)) {
          dataArr = [];
        } else {
          if (dataArr.length > 0) {
            dataArr = baseDataTable.setColumnsFieldDefault(columnData, dataArr);
          }
        }
      } else {
        //失败
        dataArr = [];
      }
    }
    baseDataTable.data[e.target.id].dataTableRows = json;
   // if (dataConfig.isServerMode == false) {
    //}
  });
  /***************检索数据之后分页展示信息 start***************/
  /****检索数据之后isUseMax 遗漏问题 处理 end********************/
  function infoCallbackHandler(settings, start, end, max, total, pre ){
    var info = pre.split('(');
    var infoHtml = pre;
    if(info.length > 1){
      info[1] = info[1].replace(max,total);
      infoHtml = info[0]+'('+info[1];
      if(info.length > 2){
        infoHtml += '(';
        for(var i=2;i<info.length;i++){
          infoHtml += info[2];
        }
      }
    }
    return infoHtml;
  }
  /**********ajax请求成功返回数据的判断 end*******************/
  $tableObj.on('init.dt', function (e, settings) {
    var tableID = settings.sTableId;
    var uiConfig = baseDataTable.data[tableID].uiConfig;
    uiConfig.$table.children('tbody').children('tr').children('th').html('');
    if (baseDataTable.data[tableID].dataConfig.isServerMode == false) {
      setTimeout(function () {
        baseDataTable.initChartPlane(settings);
        baseDataTable.initTableComplete(tableID);
        baseDataTable.initComplete(tableID);
      }, 10)
    } else {
      baseDataTable.initChartPlane(settings);
      baseDataTable.initComplete(tableID);
    }
  });

  configObj.createdRow = baseDataTable.createdRow;
  var dataTable = $tableObj.DataTable(configObj);
  baseDataTable.table[dataTableID] = dataTable;
  baseDataTable.data[dataTableID].selectedCheckedData = [];
  if (dataConfig.isServerMode == true) {
    baseDataTable.initTableComplete(dataTableID);
  }
  //添加表格TAB等小控制面板
  baseDataTable.initPlusControlPanel(dataConfig, uiConfig);
  //手机端面板
  if(uiConfig.browerSystem == 'mobile'){
    baseDataTable.initMobileControlPanel(dataTableID);
  }
}
//获取表格容器类型 cy 20180309
baseDataTable.getTableContainerType = function(uiConfig){
  //return string;  unknown//非layout生成， panel/普通面板  tabpanel/带tab的面板
  //layout输出的表格 根据上级是否有.nspanel和 tabpanel
  var $table = uiConfig.$table;
  var $tableContainer = {};
  var $tableParentPanel = $table.closest('.nspanel');
  var $tableParentTab = $table.closest('.tab-content');
  var tableContainerType = 'unknown'; //默认没有上级容器
  var tableContainerHeight = -1;
  if($tableParentPanel.length == 1){
    //layout页面
    if($tableParentTab.length == 1){
      tableContainerType = 'tabpanel';
      $tableContainer = $table.closest('.tab-content');
      tableContainerHeight = $tableContainer.outerHeight();
    }else if($tableParentTab.length == 0){
      tableContainerType = 'panel';
      $tableContainer = $table.closest('.nspanel');
      tableContainerHeight = $tableContainer.outerHeight();
    }else{
      tableContainerType = 'unknown';
      $tableContainer = $table.closest('.nspanel');
      tableContainerHeight = $tableContainer.outerHeight();
      if(debugerMode){
        console.error('不能识别的的表格使用模式')
      }
    }
  }else if($tableParentPanel.length == 0){
    //非layout页面
    $tableContainer = $table.closest('.table-responsive').parent(); 
    if($tableContainer.hasClass('panel-body')){
      tableContainerType = 'manual';  //手工的高度自动计算
      tableContainerHeight = $tableContainer.outerHeight();
    }else{
      tableContainerType = 'unknown';
      tableContainerHeight = $tableContainer.outerHeight();
    }
  }else{
    tableContainerType = 'unknown';
    $tableContainer = $table.closest('.table-responsive').parent(); 
    tableContainerHeight = $tableContainer.outerHeight();
    if(debugerMode){
      console.error('不能识别的的表格使用模式');
    }
  }
  //console.warn('containerType:'+tableContainerType);
  return tableContainerType;
}
//设置和获取表格高度模式 cy 20180312
baseDataTable.setTableHeightType = function(uiConfig){
  var $table = uiConfig.$table;
  //设定表格的高度模式  compact 紧凑模式 高度32 wide 宽松模式 高度40 默认是wide模式 添加table-sm就是紧凑模式，否则是宽松模式
  //对于非layout的表格，可以使用 strict-compact strict-wide
  if(uiConfig.tableHeightType){
    switch(uiConfig.tableHeightType){
      case 'compact':
        //紧凑模式
        if($table.hasClass('table-sm')){
          //有则不用处理
        }else{
          $table.addClass('table-sm');
        }
        break;
      case 'wide':
        //宽松模式
        if($table.hasClass('table-sm')){
          $table.removeClass('table-sm');
        }else{
          //有则不用处理
        }
        break;
      case 'strict-compact':
        //强制紧凑模式 可用于非layout情况下
        uiConfig.tableHeightType = 'compact';
        $table.attr('class', 'table table-hover table-bordered table-striped table-sm dataTable no-footer');
        break;
      case 'strict-wide':
        //强制宽松模式 可用于非layout情况下
        uiConfig.tableHeightType = 'wide';
        $table.attr('class', 'table table-hover table-bordered table-striped dataTable no-footer');
        break;
      default:
        //暂不处理
        break;
    }
  }else{
    //如果没定义此模式
    if($table.hasClass('table-sm')){
      uiConfig.tableHeightType = 'compact';
    }else{
      uiConfig.tableHeightType = 'wide';
    }
  }
  //console.warn('heightMode:'+uiConfig.tableHeightType);
  return uiConfig.tableHeightType;
} 
//计算表格行数 cy 20180308
baseDataTable.getAutoRowsNumber = function(dataConfig, columnConfig, uiConfig, btnConfig){
  var $table = uiConfig.$table;
  var rowsNum = 5;
  //自动计算最佳的表格显示行数
  var tableRowsHeight = 0;
  switch(uiConfig.tableContainerType){
    case 'panel':
      tableRowsHeight = $table.closest('.nspanel').height();
      break;
    case 'tabpanel':
      tableRowsHeight = $table.closest('.tab-content').height();    //layout所占的高度
      break;
    case 'manual':
      //指定高度的panel
      var isCustomPanelHeight = false;
      $tablePanel = $table.closest('.table-responsive').parent();
      if($tablePanel.hasClass('panel-body')){
        if(typeof($tablePanel.attr('style'))=='string'){
          isCustomPanelHeight = true;
        }
      }

      if(isCustomPanelHeight == false){
        //弹出窗口的高度
        var $tableWindow = $table.closest('.nswindow')
        if($tableWindow.length > 0){
          tableRowsHeight = $tableWindow.innerHeight();
          //去掉window头部title区域高度
          tableRowsHeight = tableRowsHeight - $tableWindow.children('.window-title').outerHeight();
          //去掉按钮组高度
          if($tableWindow.find('.page-title.nav-form').length > 0){
            tableRowsHeight = tableRowsHeight - $tableWindow.find('.page-title.nav-form').outerHeight();
          }
        }else{
            //普通页面的
          //手工模式自动高度就是页面高度减去头部按钮高度
          tableRowsHeight = $(window).height();
          if($table.closest('container').children().hasClass('page-title')){
            tableRowsHeight = tableRowsHeight - $table.closest('container').children('.page-title').outerHeight();
          }
        }
      }else{
        tableRowsHeight = $tablePanel.innerHeight();
      }
      break;
  }
  //console.log('height:'+tableRowsHeight);
  //console.log(uiConfig.tableHeightType);
  //宽松模式有一套高度 紧凑模式有另一套参数
  var tablePartHeightParameter = {
    wide:{
      title:40,
      row:40,
      footer:40,
    },
    compact:{
      title:40,
      row:32,
      footer:40,
    }
  }
  var currentParameter = tablePartHeightParameter[uiConfig.tableHeightType]
  //看是否考虑title 依据是是否有搜索 或者是否有btnConfig
  //是否需要减去标题的高度
  var isHaveTitle = false;
  if(dataConfig.isSearchVisible){
    //如果有可见的搜索框则计算高度
    isHaveTitle = true;
  }else{
    //没有可见的搜索框，但是开启了按钮或者标题
    if(btnConfig){
      if(!$.isEmptyObject(btnConfig)){
        isHaveTitle = true;
      }
    }
  }
  if(isHaveTitle){
    tableRowsHeight -= currentParameter.title;
  }
  var isHaveBottom = false;
  if(uiConfig.isUseTabs){
    isHaveBottom = true;//如果使用了tab
  }else{
    if(dataConfig.isPage){
      isHaveBottom = true;//使用了分页
    }
  }
  if(isHaveBottom){tableRowsHeight = tableRowsHeight - 40;}
  rowsNum = Math.floor(tableRowsHeight / currentParameter.row);
  rowsNum = rowsNum - 1;
  if(rowsNum < 1){
    rowsNum = 5;
  }
  return rowsNum;
}

//手机端事件回调触发
baseDataTable.mobilePanelHandler = function(tableID){
  var uiConfig = baseDataTable.data[tableID].uiConfig;
  var currentpage = baseDataTable.data[tableID].currentPage;//当前页码
  var pageLength = 1;//每页显示条数
  var dataLength = baseDataTable.getAllTableData(tableID).length;//共多少条数据
  if($.isArray(uiConfig.pageLengthMenu[0])){pageLength = uiConfig.pageLengthMenu[0][0];}else{pageLength = uiConfig.pageLengthMenu[0];}
  var pagesMax = Math.ceil(dataLength/pageLength);//最大页码
  var pagePip = [];//存放占用比例值
  for( i=0; i<=pagesMax; i++ ) {
      pagePip.push(Math.round((100/pagesMax)*i));
  };
  baseDataTable.data[tableID].pagesMax = pagesMax;
  var $tableBottom = uiConfig.$table.parent();//table表格的父元素
  var $slidermodal = $tableBottom.children('.template-mobile-slider-modal');//拖拽页码的div
  var $nstableBottom = $tableBottom.children('.nstable-bottom'); //包含分页的相关元素
  var $nstablepageul = $nstableBottom.children('.dataTables_paginate').children('ul');;

  $nstableBottom.children('.nstable-page').css('display','none');//下拉选择显示条数隐藏
  $nstableBottom.children('.dataTables_info').css('display','none');//页码隐藏
  $nstablepageul.children('li').not(':first').not(':last').css('display','none');//第几页隐藏
  /*******************显示1/max页 start*********************************/
  /*var cWidth = $(window).width();//屏幕宽
  var $th = uiConfig.$table.children('thead').children('tr').children('th').not(':first').not('.td-button');
  var thWidth = 0;
  $.each($th,function(key,value){
    var $this = $(value);
    thWidth += parseFloat($(this).outerWidth());
  });
  var sortThWidth = cWidth - thWidth;
  //uiConfig.$table.children('thead').children('tr').children('th').eq(0).css({'width':sortThWidth+'px'});*/
  var textStr = (currentpage + 1) + '/' + pagesMax+'页';
  var liHtml = '<li class="paginate_button slider-page">'
                  +'<a href="javascript:void(0)">'+textStr+'</a>'
                 '</li>';
  $nstablepageul.children('li').eq(0).after(liHtml);
  $nstablepageul.children('.slider-page').off('click');
  $nstablepageul.children('.slider-page').on('click',function(ev){
      if($slidermodal.css('display')=='none'){
        $slidermodal.css('display','block');
      }else{
        $slidermodal.css('display','none');
      }
  });
  /********************显示1/max页 end********************************/
  /********************导航列按钮左右翻页显示列 star*****************/
  var $prevBtn = $('button[ns-flag="prev"]');
  var $nextBtn = $('button[ns-flag="next"]');
  if(uiConfig.tabsActiveIndex == 0){
    $prevBtn.addClass('disabled');
    $nextBtn.removeClass('disabled');
  }else if(uiConfig.tabsActiveIndex == (uiConfig.tabsName.length - 1)){
    $nextBtn.addClass('disabled');
    $prevBtn.removeClass('disabled');
  }
  /********************导航列按钮左右翻页显示列 end*****************/
  var $sliderarea = $slidermodal.find('.pointer');//拖拽的元素
  var sliderWidth = $slidermodal.outerWidth();//拖拽区域的宽度
  if(baseDataTable.data[tableID].sliderLeft){
      $sliderarea.css({'left':baseDataTable.data[tableID].sliderLeft});
      $sliderarea.parent().css({'width':baseDataTable.data[tableID].sliderLeft});
      var textNum = currentpage + 1;
      $sliderarea.children('span').text('第'+textNum+'页');
      $sliderarea.parent().addClass('pageactive');
  }
  $sliderarea.off('touchstart');
  $sliderarea.on('touchstart',function(ev){
      var $this = $(this);
      var pointerOffset = $this.offset();
      var pageX = ev.originalEvent.targetTouches[0].pageX;
      var offsetX = ev.originalEvent.targetTouches[0].radiusX;
      $(document).on('touchmove',function(event){
        var left = event.originalEvent.targetTouches[0].pageX - pageX + pointerOffset.left - offsetX; 
        $sliderarea.css({'left':left});
      });
      $(document).on('touchend',function(event){
        //结束拖拽
        $(document).off('touchmove');
        $(document).off('touchend');
        var leftspace = parseFloat($sliderarea.css('left'));
        var leftPercent = (leftspace/sliderWidth)*100;
        leftPercent = Math.round(leftPercent);
        var pageindex = 0;//下标0开始
        for(var i=pagePip.length-1; i>=0; i--){
          if(pagePip[i] >= leftPercent){pageindex = i;}
        }
        if(pageindex > 0){pageindex = pageindex - 1;}
        if(pageindex > (pagesMax - 1)){
          pageindex = pagesMax - 1;
        }
        //读取第一个大于左侧百分比的下标  
        baseDataTable.data[tableID].sliderLeft = leftspace;
        baseDataTable.table[tableID].page(pageindex).draw(false);
      })
  });
}
//手机端面板
baseDataTable.initMobileControlPanel = function(tableID){
  var uiConfig = baseDataTable.data[tableID].uiConfig;
  var cWidth = $(window).width();//屏幕宽
  var cHeight = $(window).height();//屏幕高
  var spaceWidth = cWidth/3;//宽度3等分
  var spaceHeight = cHeight/3;//高度3等分
  var activeColIndex = uiConfig.tabsActiveIndex;//当前活动的列下标
  var colTotal = 2;
  if($.isArray(uiConfig.tabsName)){
    colTotal = uiConfig.tabsName.length-1;//共几列
  }
    var $tableBottom = uiConfig.$table.parent();//table表格的父元素
    var $tabBottom = $tableBottom.children('.nstable-plus-panel');
    var $nstableBottom = $tableBottom.children('.nstable-bottom');
    var pageLength = 5;
    if($.isArray(uiConfig.pageLengthMenu[0])){pageLength = uiConfig.pageLengthMenu[0][0];}else{pageLength = uiConfig.pageLengthMenu[0];}
    //var tabHeight = $tabBottom.outerHeight();
    var tabHeight = cHeight - $('.page-title').outerHeight() - 36 -(pageLength*44);
    tabHeight = Math.round(tabHeight);
    $tabBottom.css({'height':tabHeight+'px'});
    $nstableBottom.css({'height':tabHeight+'px'});
    $('#'+tableID+'_filter').css('display','none');//搜索条件隐藏
    /**********************导航上部翻页显示列 start*****************************************/
    var beforeTabHtml = '<div class="tabchange-table-column" ns-tableid="'+tableID+'">'
                            +'<button type="button" class="btn btn-white btn-icon btn-left" ns-flag="prev"><i class="fa-caret-left"></i></button>'
                            +'<button type="button" class="btn btn-white btn-icon btn-right" ns-flag="next"><i class="fa-caret-right"></i></button>'
                        +'</div>';
    uiConfig.$table.before(beforeTabHtml);
    /*********************导航上部翻页显示列 end******************************************/
    /*********************拖拽读取页码 start******************************************/
    var html = '<div class="template-mobile-slider-modal" style="display:none;">'
                  +'<div class="template-mobile-slider-page">'
                    +'<div class="pointer">'
                      +'<span>第1页</span>'
                    +'</div>'
                  +'</div>'
              +'</div>';
    $tableBottom.append(html);
    /*********************拖拽读取页码 end******************************************/
    var $navColumnButton = $tableBottom.children('.tabchange-table-column').children('button[type="button"]');
    $navColumnButton.on('click',function(ev){
      var $this = $(this);  
      var flag = $this.attr('ns-flag');
      var tableID = $this.parent().attr('ns-tableid');
      var uiConfig = baseDataTable.data[tableID].uiConfig;
      var tabsActiveIndex = uiConfig.tabsActiveIndex;
      var tablength = uiConfig.tabsName.length-1;
      var tabIndex = 0;
      if(flag == 'prev'){
        tabIndex = tabsActiveIndex - 1;
        if(tabsActiveIndex == 0){
          tabIndex = 0;
          nsAlert('已经是第一列');
        }
      }else if(flag == 'next'){
        $('button[ns-flag="prev"]').removeClass('disabled');
        tabIndex = tabsActiveIndex + 1;
        if(tabIndex > tablength){
          tabIndex = tabsActiveIndex;
          nsAlert('已经是最后一列');
        }
      }
      baseDataTable.changeTab(tableID,tabIndex);
    });
  /******************手机端touch事件 start*****************************/
  if(uiConfig.$table.closest('.singletablemodal').length > 0){
    $(document).on('touchstart',{tableID:tableID},documentTouchHandler);
  }
  
  function documentTouchHandler(event){
       $(document).off('touchstart');
        var tableID = event.data.tableID;
        var pagesMax = baseDataTable.data[tableID].pagesMax - 1;
        var currentpage = baseDataTable.data[tableID].currentPage; //当前是第几页
        var touches = event.originalEvent.changedTouches[0];
        var startPageX = touches.pageX;
        var startPageY = touches.pageY;
        var direction;
        $(document).on('touchmove',function(moveEvent){
             moveEvent.preventDefault();
            var moveTouchs = moveEvent.originalEvent.changedTouches[0];
            var movePageX = moveTouchs.pageX;
            var movePageY = moveTouchs.pageY;
            var distanceX = movePageX - startPageX;
            var distanceY = movePageY - startPageY;
            //console.log('pageX:'+pageX+'pageY:'+pageY)
            if(Math.abs(distanceX)>Math.abs(distanceY) && distanceX>0){
                 direction = 'left';
            }else if(Math.abs(distanceX)>Math.abs(distanceY) && distanceX<0){
                direction = 'right';
            }else if(Math.abs(distanceX)<Math.abs(distanceY) && distanceY<0){
               direction = 'next';
            }else if(Math.abs(distanceX)<Math.abs(distanceY) && distanceY>0){
                direction = 'prev';
            }else{
               // console.log('点击未滑动');
            }
        });
        $(document).on('touchend',function(endEvent){
            $(document).off('touchmove');
            $(document).off('touchend');
            $(document).on('touchstart',{tableID:tableID},documentTouchHandler);
            var endTouchs = endEvent.originalEvent.changedTouches[0];
            var endPageX = endTouchs.pageX;
            var endPageY = endTouchs.pageY;
            switch(direction){
                case 'left':
                  if(startPageX > spaceWidth){
                    activeColIndex -- ;
                    if(activeColIndex < 0){
                      activeColIndex = 0;
                      nsAlert('已经是第一列')
                    }
                    baseDataTable.changeTab(tableID,activeColIndex);
                  }
                  break;
                case 'right':
                  if(startPageX > spaceWidth){
                    //下一页
                    activeColIndex ++;
                    if(activeColIndex > colTotal){
                      activeColIndex = colTotal;
                      nsAlert('已经是最后一列');
                    }
                    baseDataTable.changeTab(tableID,activeColIndex);
                  }
                  break;
                case 'next':
                  if(startPageY > spaceHeight){
                    currentpage ++;
                      if(currentpage > pagesMax){
                        currentpage = pagesMax;
                        nsAlert('已经是最后一页');
                      }
                      console.log(currentpage)
                      baseDataTable.table[tableID].page(currentpage).draw(false);
                  }
                  break;
                case 'prev':
                  if(startPageY > spaceHeight){
                    currentpage --;
                    if(currentpage < 0){
                      currentpage = 0;
                      nsAlert('已经是第一页');
                    }
                    baseDataTable.table[tableID].page(currentpage).draw(false);
                  }
                  break;
            }
        })
  }
  /******************手机端touch事件 end*******************************/
}

//添加额外功能（TAB、清除存储）的控制面板
baseDataTable.initPlusControlPanel = function (dataConfig, uiConfig) {
  //console.log(dataConfig);
  //console.log(uiConfig);
  var html = '';
  var plusPanelID = dataConfig.tableID + '-plus-panel';
  //输出tabs代码
  if (uiConfig.isUseTabs) {
    uiConfig.plusPanelTabsID = plusPanelID + '-tabs';
    var ulHtml = '';
    var tabGroup = uiConfig.tabColumn.tabGroup;
    var activeCls = '';
    var tabName = '';
    var tabVisible = true;
    for (var groupI = 0; groupI < tabGroup.length; groupI++) {
      //默认代开第几个tab
      if (groupI == uiConfig.tabsActiveIndex) {
        activeCls = ' active';
      } else {
        activeCls = '';
      }
      tabName = uiConfig.tabsName[groupI]; 		//名字
      tabVisible = uiConfig.tabsVisible[groupI];  //是否显示
      if (tabVisible) {
        ulHtml +=
          '<a href="javascript:void(0);" class="nstable-plus-panel-tabs-tab' + activeCls + '" ns-tabindex="' + groupI + '">'
          + tabName
          + '</a>';
      }

    }
    html +=
      '<div id="' + uiConfig.plusPanelTabsID + '" ns-tableid="' + dataConfig.tableID + '" class="nstable-plus-panel-tabs">'
      + ulHtml
      + '</div>';
  }
  if (uiConfig.isUseCleanLocalStorage) {
    uiConfig.plusPanelBtnsID = plusPanelID + '-btns';
    html += '<div id="' + uiConfig.plusPanelBtnsID + '" class="nstable-plus-panel-btns"></div>';
  }
  if (html != '') {
    //
    uiConfig.plusPanelID = plusPanelID;
    html =
      '<div id="' + plusPanelID + '" class="nstable-plus-panel">'
      + html
      + '</div>';


    if(uiConfig.browerSystem == 'mobile'){
      var mobileHtml = '<div id="' + plusPanelID + '" class="nstable-plus-panel">'
                        +'<button type="button" class="btn btn-white btn-icon">'
                          +'<i class="fa-navicon"></i>'
                          +'<span>'+uiConfig.tabsName[0]+'</span>'
                          +'</button>'
                          +'<div class="nstable-plus-panel-tabs-mobile" id="'+uiConfig.plusPanelTabsID+'" ns-tableid="' + dataConfig.tableID + '">'
                             +ulHtml
                          +'</div>'
                      +'</div>'; 
      uiConfig.$table.closest('.table-responsive').find('.nstable-bottom').before(mobileHtml); 
      var $plusPanel = $('#'+uiConfig.plusPanelID);
      $plusPanel.children('.nstable-plus-panel-tabs-mobile').css('display','none');    
      $plusPanel.children('button').on('click',function(ev){
        var $this = $(this);
        if($this.siblings().css('display')=='none'){
          $this.siblings().css('display','block');
        }else{
          $this.siblings().css('display','none');
        }
        uiConfig.$table.parent().children('.template-mobile-slider-modal').css('display','none');
      });
      $plusPanel.children('.nstable-plus-panel-tabs-mobile').children('a').on('click', function (ev) {
        var $this = $(this);
        var $nstablePanel = $this.closest('.nstable-plus-panel-tabs-mobile');
        var tableID = $nstablePanel.attr('ns-tableid');
        var tabIndex = $this.attr('ns-tabindex');
        baseDataTable.changeTab(tableID, tabIndex);
        $nstablePanel.siblings().children('span').text($.trim($this.text()));
        $nstablePanel.css('display','none');
      })
    }else{
      uiConfig.$table.closest('.table-responsive').find('.nstable-bottom').before(html);
      if (uiConfig.isUseCleanLocalStorage) {
        //初始化按钮组
        var btns =
          [
            {
              handler: function () {
                baseDataTable.cleanLocalStorageByID(dataConfig.tableID);
              },
              text: '清除表格个人记录',
              isShowText: false
            }, {
              handler: function () {
                baseDataTable.refreshByID(dataConfig.tableID);
              },
              text: '刷新表格',
              isShowText: false
            }, {
              handler: function () {
                baseDataTable.configPanelByID(dataConfig.tableID);
              },
              text: '表格配置',
              isShowText: false
            }
          ]
        nsButton.initBtnsByContainerID(uiConfig.plusPanelBtnsID, btns);
      }
      //初始化tabs
      $('#' + uiConfig.plusPanelTabsID).children('a').on('click', function (ev) {
        var tableID = $(this).closest('.nstable-plus-panel-tabs').attr('ns-tableid');
        var tabIndex = $(this).attr('ns-tabindex');
        baseDataTable.changeTab(tableID, tabIndex);
      })
    }
  }
}
//切换表格tab
baseDataTable.changeTab = function (tableID, tabIndex) {
  //tableID是表格ID，tabIndex是切换的tab索引，如0,1,2
  var uiConfig = baseDataTable.data[tableID].uiConfig;
  var $tabs = $('#' + uiConfig.plusPanelTabsID);
  var $tab = $tabs.children('a.nstable-plus-panel-tabs-tab').eq(tabIndex);
  $tabs.children('a.active').removeClass('active');
  $tab.addClass('active');
  var columnGroup = uiConfig.tabColumn.tabGroup;
  var originalTotalWidth = 0;
  var showingThArray = [];  //要显示的tab的TH
  var showingDataArray = [];
  for (var groupI = 0; groupI < columnGroup.length; groupI++) {
    var isActiveGroup = (groupI == tabIndex);
    for (var columnI = 0; columnI < columnGroup[groupI].length; columnI++) {
      var columnIndex = columnGroup[groupI][columnI].nsIndex;
      baseDataTable.table[tableID].column(columnIndex).visible(isActiveGroup);
      if (isActiveGroup) {
        var $cth = uiConfig.$table.find('thead tr th[ns-tabledata="' + columnGroup[groupI][columnI].data + '"]');
        originalTotalWidth += columnGroup[groupI][columnI].originalWidth;
        showingThArray.push($cth);
        showingDataArray.push(columnGroup[groupI][columnI]);
      }
    }
  }
  //重新显示宽度
  var scaleSize = uiConfig.tabOptions.columnWidthTabVisible / originalTotalWidth;
  var scaleWidthArray = [];
  var scaleWidthTotal = 0;
  for (var cthI = 0; cthI < showingDataArray.length; cthI++) {
    var showingWidth = showingDataArray[cthI].originalWidth * scaleSize;
    showingWidth = Math.round(showingWidth);
    scaleWidthTotal += showingWidth;
    scaleWidthArray.push(showingWidth);

  }
  //对四舍五入带来的误差进行修补
  if (scaleWidthTotal != uiConfig.tabOptions.columnWidthTabVisible) {
    scaleWidthArray[0] = scaleWidthArray[0] + (uiConfig.tabOptions.columnWidthTabVisible - scaleWidthTotal);
  }
  for (var swI = 0; swI < showingThArray.length; swI++) {
    showingThArray[swI].css('width', scaleWidthArray[swI] + 'px');
  }

  uiConfig.tabsActiveIndex = tabIndex;
  //添加拖拽宽度方法
  if (baseDataTable.data[tableID].uiConfig.dragWidth) {
    baseDataTable.dragWidth(tableID);
  }
  baseDataTable.selfDefineModule(tableID);
  baseDataTable.countTotal(tableID);
  baseDataTable.isFillEmptyRow(tableID);
  if(uiConfig.browerSystem == 'mobile'){
    baseDataTable.mobilePanelHandler(tableID);
  }
  if(typeof(baseDataTable.data[tableID].uiConfig.changeTabCallback)=='function'){
      return baseDataTable.data[tableID].uiConfig.changeTabCallback({tableId:tableID,tabsActiveIndex:tabIndex});
  }
}
//配置面板
baseDataTable.configPanelByID = function (tableID) {
  nsUI.tablemanager.init(tableID);
}
//清除个人设置
baseDataTable.cleanLocalStorageByID = function (tableID) {
  nsconfirm('您将要清除个人设置，恢复为原始数据，是否确认？', function (isConfirm) {
    if (isConfirm) {
      store.remove('cw-' + tableID);
      baseDataTable.refreshByID(tableID);
      nsUI.tablemanager.saveServerConfig();
    }
  }, 'warning')
}
//添加行
baseDataTable.createdRow = function (row, data, index) {
  var tableID = $(this).attr('id');
  var uiConfig = baseDataTable.data[tableID].uiConfig;
  if (typeof (uiConfig.rowState) == 'object') {
    if (!$.isEmptyObject(uiConfig.rowState)) {
      if (typeof (uiConfig.rowState.field) == 'object') {
        if (!$.isEmptyObject(uiConfig.rowState.field)) {
          //存在行状态字段
          var fieldData = uiConfig.rowState.field;
          var classStr = '';
          if (data[fieldData.expedited]) {
            //加急
            classStr += ' icon-expedit';
          }
          if (data[fieldData.goback] == true) {
            //回退
            classStr += ' icon-goback';
          }
          if (data[fieldData.overdue] == true) {
            //超期
            classStr += ' icon-overdue';
          }
          if (data[fieldData.reminders] == true) {
            //催办
            classStr += ' icon-reminder';
          }
          if (data[fieldData.destroy] == true) {
            //作废
            classStr += ' icon-destroy';
          }
          var rowClassStr = 'tr-rowState' + classStr;
          $(row).addClass(rowClassStr);
          $(row).children('.td-columnState').addClass(classStr);
        }
      }
    }
  }
  var primaryID = baseDataTable.data[tableID].dataConfig.primaryID;
  if ($.isArray(uiConfig.selectIndex)) {
    for (var indexI = 0; indexI < uiConfig.selectIndex.length; indexI++) {
      if (uiConfig.selectIndex[indexI] == data[primaryID]) {
        $(row).addClass('selected');
      }
    }
  } else if (typeof (uiConfig.selectIndex) == 'string') {
    if (uiConfig.selectIndex) {
      if (uiConfig.selectIndex == data[primaryID]) { }
      $(row).addClass('selected');
      baseDataTable.container[tableID].dataIndex = index;
      baseDataTable.container[tableID].dataObj = data;
    }
  }

  //行状态sjj20190118
  if(uiConfig.isRowState && uiConfig.isUseMessageState){
    var rowClassStr = '';
    var stateObj = nsTable.messageState.data;
    if(data.hasEmergency){
      //应急
      rowClassStr = stateObj.hasEmergency;
    }else if(data.hasSuspend){
      //挂起
      rowClassStr = stateObj.hasSuspend;
      rowClassStr += ' tr-disabled';
    }else if(data.hasRollback){
      //重办
      rowClassStr = stateObj.hasRollback;
    }else{
      //普通
      rowClassStr = stateObj.normalstate;
    }
    $(row).addClass(rowClassStr);
  }
}
//图标结合
baseDataTable.initChartPlane = function (settings) {
  var data = settings.json;
  var tableID = settings.sTableId;
  var uiConfig = baseDataTable.data[tableID].uiConfig;
  if (typeof (uiConfig.chart) == 'object') {
    var controlDomID = tableID + '-chart';
    //左右需要都有宽，上下不需要
    var tablePositionClass = '';
    var chartPositionClass = '';
    var tableWidth = '';
    var tableHeight = '';
    var chartWidth = 'width: ' + uiConfig.chart.width + '%;';
    var chartHeight = 'height:' + uiConfig.chart.height + 'px;';
    var position = uiConfig.chart.position ? uiConfig.chart.position : 'bottom';
    if (position == 'top') {
      chartPositionClass = 'chart padding top';
      tablePositionClass = 'table padding bottom';
    } else if (position == 'right') {
      chartPositionClass = 'chart padding right';
      tablePositionClass = 'table padding left';
      var width = 100 - Number(uiConfig.chart.width);
      width = parseInt(width);
      tableWidth = 'width:' + width + '%;';
    } else if (position == 'left') {
      chartPositionClass = 'chart padding left';
      tablePositionClass = 'table padding right';
      var width = 100 - Number(uiConfig.chart.width);
      width = parseInt(width);
      tableWidth = 'width:' + width + '%;';
    } else if (position == 'bottom') {
      chartPositionClass = 'chart padding bottom';
      tablePositionClass = 'table padding top';
    }
    var labelStyleStr = 'style="' + chartHeight + '' + chartWidth + '"';
    var controlElementID = tableID + '-echarts';
    var chartClass = 'style="width:100%;' + chartHeight + '"';
    if ($('#' + tableID).closest('.tab-content').length > 0) {
      var chartContainerWidth = $('#' + tableID).closest('.tab-content').width();
      chartContainerWidth = chartContainerWidth * uiConfig.chart.width / 100;
      chartClass = 'style="width:' + chartContainerWidth + 'px;' + chartHeight + '"';
    }
    var controlHtml = '<div id="' + controlElementID + '" class="table-chart" ' + labelStyleStr + '>'
      + '<div id="' + controlDomID + '" class="chart" ' + chartClass + '></div>'
      + '</div>';
    var controlDom = $(controlHtml);
    $('#' + tableID).closest('.table-responsive').attr('class', 'table-responsive hasChart ' + tablePositionClass + '');
    $('#' + tableID).closest('.table-responsive').attr('style', tableWidth);

    $("#" + tableID).closest(".table-responsive").after(controlDom);
    $('#' + controlElementID).attr('class', chartPositionClass);

    var chartJson = uiConfig.chart;
    chartJson.data = data[baseDataTable.data[tableID].dataConfig.dataSrc];
    var $chartDom = echarts.init($('#' + controlDomID)[0]);
    nsChartUI.init(chartJson, $chartDom);
  }
}
//初始化table表格调用
baseDataTable.initTableComplete = function (tableID) {
  baseDataTable.data[tableID].currentPage = 0;
  baseDataTable.storageCustomizeHandler(tableID);
  /*************sjj 20180409 解决刷新当前页数据不存在问题***********************/
  var evenLength = 1;
  if($.isArray(baseDataTable.data[tableID].uiConfig.pageLengthMenu[0])){
    evenLength = baseDataTable.data[tableID].uiConfig.pageLengthMenu[0][0];
  }else{
    evenLength = baseDataTable.data[tableID].uiConfig.pageLengthMenu[0];
  }
  baseDataTable.data[tableID].evenLength = evenLength;
 /*************sjj 20180409 解决刷新当前页数据不存在问题***********************/
  var $tableObj = baseDataTable.container[tableID].tableObj;
  /**************每页显示条数 start**************/
  var lengthChange = typeof (baseDataTable.data[tableID].dataConfig.isLengthChange) == 'boolean' ? baseDataTable.data[tableID].dataConfig.isLengthChange : true;
  var pageLengthMenuArr = baseDataTable.data[tableID].uiConfig.pageLengthMenu[1];
  baseDataTable.data[tableID].currentLength = Number(pageLengthMenuArr[0]);
  if (lengthChange) {
    if (typeof (pageLengthMenuArr) == 'object') {
      var pageHtml = '<div class="btn-group">'
        + '<button type="button" class="btn btn-white dropdown-toggle" data-toggle="dropdown">'
        + pageLengthMenuArr[0]
        + '<span class="caret"></span>'
        + '</button>'
        + '<ul class="dropdown-menu" ns-table="' + tableID + '">'
      for (var pageI = 0; pageI < pageLengthMenuArr.length; pageI++) {
        pageHtml += '<li pageindex="' + pageI + '"><a href="javascript:void(0);">' + pageLengthMenuArr[pageI] + '</a></li>';
      }

      pageHtml += '</ul></div>';
      $('#' + tableID).closest('.dataTables_wrapper').children('.nstable-bottom').children('.nstable-page').html(pageHtml);
    }
  }
  if (typeof (baseDataTable.data[tableID].uiConfig.scrollspace) == 'number') {
    $('#' + tableID).closest('.nstable-container-y').css({ 'height': baseDataTable.data[tableID].uiConfig.scrollspace });
  }
  /**************每页显示条数 end***************/
  //增加拖拽功能 begin-------------------------------------
  //console.log('拖拽功能 begin')
  if (baseDataTable.data[tableID].uiConfig.dragWidth) {
    baseDataTable.dragWidth(tableID);
  }
  //增加拖拽功能 end -------------------------------------
  if (baseDataTable.data[tableID].btnConfig) {
    baseDataTable.tableBtnHandler(tableID);
  }
  //强制增加minwidth到页面-用于弹框表格宽度控制
  var $ths = $tableObj.children('thead').children('tr').children('th');
  for (var thI = 0; thI < $ths.length; thI++) {
    var styleStr = $($ths[thI]).attr('style');
    if (styleStr) {
      var widthStr = styleStr.substring(styleStr.indexOf('width:') + 6, styleStr.indexOf('px', styleStr.indexOf('width:') + 6));
      if (typeof (widthStr) != 'undefined') {
        if (/^[1-9]\d*|0$/.test(widthStr)) {
          var widthMinStr = 'min-width:' + widthStr + 'px; ';
          styleStr = styleStr + widthMinStr;
          $($ths[thI]).attr('style', styleStr);
        }
      }
    }
  }
  var $trObj = $('#' + tableID + ' tbody tr').not('.current-small-count').not('.tr-empty-row');
  baseDataTable.data[tableID].pagelength = $trObj.length;
  baseDataTable.container[tableID].trObj = $trObj;

  //baseDataTable.setTableHeight(tableID);
  if (baseDataTable.data[tableID].uiConfig.isOpenCheck) {
    //开启全选回调
    baseDataTable.getAllCheckedData(tableID);
  }
  if(baseDataTable.data[tableID].uiConfig.isUseTableControl){
    //开启列选择
    baseDataTable.columnSelectHanlder(tableID);
  }
  //是否开启全选选中模式
  if (typeof (baseDataTable.data[tableID].uiConfig.isUseSelectAll) == 'boolean') {
    if (baseDataTable.data[tableID].uiConfig.isUseSelectAll) {
      //判断是否开启了多选模式
      if (baseDataTable.data[tableID].uiConfig.isMulitSelect) {
        //判断是否设置了primaryID
        if (typeof (baseDataTable.data[tableID].dataConfig.primaryID) == 'string') {
          //开启全选
          baseDataTable.useSelectAll(tableID);
        } else {
          if (debugerMode) {
            console.error('全选功能必须设定dataConfig.primaryID')
          }
          //如果不符合标准就改成false
          baseDataTable.data[tableID].uiConfig.isUseSelectAll = false;
        }

      } else {
        if (debugerMode) {
          console.error('全选功能只能与多选模式一同使用')
        }
        //如果不符合标准就改成false
        baseDataTable.data[tableID].uiConfig.isUseSelectAll = false;
      }
    } else {
      baseDataTable.data[tableID].uiConfig.isUseSelectAll = false;
    }
  } else {
    baseDataTable.data[tableID].uiConfig.isUseSelectAll = false;
  }

  baseDataTable.formatHandler.getPlaceholder(tableID);
  baseDataTable.exportHandler(tableID);
  if(baseDataTable.data[tableID].dataConfig.isSerialNumber){
    baseDataTable.serialNumber(tableID);
  }
  baseDataTable.selectedHandler(tableID);
  baseDataTable.selfDefineModule(tableID);
  baseDataTable.pageLengthHandler(tableID);

  baseDataTable.isFillEmptyRow(tableID);
  baseDataTable.countTotal(tableID);
  if(baseDataTable.data[tableID].uiConfig.browerSystem == 'mobile'){
    baseDataTable.mobilePanelHandler(tableID);
  }
  /**添加支持搜索框默认获取焦点 sjj20180404 */
  var isSearchFocus = typeof(baseDataTable.data[tableID].uiConfig.isSearchFocus)=='boolean' ? baseDataTable.data[tableID].uiConfig.isSearchFocus:false;
  if(isSearchFocus){
    $('#'+tableID).parent().find('input[type="search"]')[0].focus();
  }
}

//输出列弹框按钮
baseDataTable.columnSelectHanlder = function(tableID){
  var $btn = $('#control-btn-toolbar-'+tableID);
  $btn.find('button[ns-select="column"]').off('click');
  $btn.find('button[ns-select="column"]').on('click',function(ev){
    ev.stopPropagation();
    if (typeof (baseDataTable.data[tableID].uiConfig.columnHandler) == 'function') {
      baseDataTable.data[tableID].uiConfig.columnHandler(tableID);
    }
  });
}
//当前页全选功能回调功能
baseDataTable.getAllCheckedData = function (tableID) {
  //var allTableData = baseDataTable.getAllTableData(tableID);//所有数据集合
  var $tableObj = baseDataTable.container[tableID].tableObj;
  var $ths = $tableObj.children('thead').children('tr').children('th');
  var checkboxHtml = '<label class="checkbox-inline th-check" for="table-checkbox-all"></label>';
  $($ths[0]).html(checkboxHtml);
  var $trObj =  $tableObj.children('tbody').children('tr').not('.tr-empty-row');
  var allData = baseDataTable.getAllTableData(tableID);
  var $trThs = $trObj.children('th');
  $($ths[0]).off('click');
  $($ths[0]).on('click',function(event){
    //var allData = baseDataTable.getAllTableData(tableID);
    var $trObj =  $('#'+tableID).children('tbody').children('tr').not('.tr-empty-row');
    var $this =  $(this);
    $this.toggleClass('checked');
    var returnObj = {
      data:[],
      $this:$(this),
      tableID:tableID,
      isChecked:false
    }
    if($this.hasClass('checked')){
          $($ths[0]).children('label').addClass('checked')
         $trObj.addClass('selected');
         $trThs.children('label').addClass('checked');
          returnObj.isChecked = true;
         baseDataTable.container[tableID].multiData = [];
         $.each($trObj,function(key,value){
            var data = baseDataTable.table[tableID].row($(value)).data();
            baseDataTable.container[tableID].multiData.push(data);
         })
         returnObj.data = baseDataTable.container[tableID].multiData;
    }else{
       $($ths[0]).children('label').removeClass('checked'); 
       $trThs.children('label').removeClass('checked');
       $trObj.removeClass('selected');
       baseDataTable.container[tableID].multiData = [];
    }
      if (typeof (baseDataTable.data[tableID].uiConfig.checkHandler) == 'function') {
        baseDataTable.data[tableID].uiConfig.checkHandler(returnObj)
      }
  })
  $trThs.off('click');
  $trThs.on('click',function(event){
    var $this = $(this);
    $this.children('label').toggleClass('checked');
    var $tr = $this.closest('tr');
    var data = baseDataTable.table[tableID].row($tr).data();
     var returnObj = {
      data:[],
      $this:$this,
      tableID:tableID,
      isChecked:false
    }
    if($this.hasClass('checked')){
      returnObj.isChecked = true;
     // baseDataTable.container[tableID].multiData.push(data);
    }else{
      /*for(var dataI=0; dataI<baseDataTable.container[tableID].multiData.length; dataI++){
        if (isObjectValueEqual(baseDataTable.container[tableID].multiData[dataI],data)) {
           baseDataTable.container[tableID].multiData[dataI].splice(dataI, 1);
        }
      }*/
    }
    if (typeof (baseDataTable.data[tableID].uiConfig.checkHandler) == 'function') {
        baseDataTable.data[tableID].uiConfig.checkHandler(returnObj)
      }
  });
  //

}
//全选功能
baseDataTable.useSelectAll = function (tableID) {
  var $tableObj = baseDataTable.container[tableID].tableObj;
  var $ths = $tableObj.children('thead').children('tr').children('th');
  var checkboxHtml = '<label class="checkbox-inline th-check" style="margin: 0;"></label>';
  $($ths[0]).html(checkboxHtml);

  $($ths[0]).children('label').off('click');
  $($ths[0]).children('label').on('click', function (ev) {
    $(this).toggleClass('checked');
    var $trs = $tableObj.children('tbody').children('tr').not('.tr-empty-row');
    var tableMultiData = baseDataTable.container[tableID].multiData;
    if ($(this).hasClass('checked')) {
      //全选
      for (var trI = 0; trI < $trs.length; trI++) {
        var $tr = $trs.eq(trI);
        if ($tr.hasClass('selected')) {
          //已经选中了就不操作了
        } else {
          $tr.addClass('selected');
          var trData = baseDataTable.table[tableID].row($tr).data();
          tableMultiData.push(trData);
        }

      }
    } else {
      //全取消
      var primaryID = baseDataTable.data[tableID].dataConfig.primaryID;

      for (var trI = 0; trI < $trs.length; trI++) {
        var $tr = $trs.eq(trI);
        var trData = baseDataTable.table[tableID].row($tr).data();
        if ($tr.hasClass('selected')) {
          $tr.removeClass('selected');
          var isSelectData = false;
          var trDataPrimaryID = trData[primaryID];
          for (var tmdI = 0; tmdI < tableMultiData.length; tmdI++) {
            if (trDataPrimaryID == tableMultiData[tmdI][primaryID]) {
              tableMultiData.splice(tmdI, 1);
            }
          }

        }
      }
    }
  })
}
//取消选中功能
baseDataTable.selectClear = function(tableID, primaryIDValue){
	//tableID表格ID， primaryIDValue是要取消的行的primaryID的value，如果不指定primaryIDValue，则全部取消，指定primaryIDValue 则只取消指定值
	var tableMultiData = baseDataTable.container[tableID].multiData;
	var selectedTrs = baseDataTable.container[tableID].tableObj.find('tr.selected');
	var primaryIDName = baseDataTable.data[tableID].dataConfig.primaryID;
	//未指定取消选中的对象，则全部取消选中
	if(typeof(primaryIDValue)=='undefined'){
		selectedTrs.removeClass('selected');
		baseDataTable.container[tableID].multiData = []
	}else if($.isArray(primaryIDValue)){
		//如果是数组则批量取消
		for(var valueI = 0; valueI<primaryIDValue.length; valueI++){
			unselect(primaryIDValue[valueI]);
		}
	}else if(typeof(primaryIDValue)=='string' || typeof(primaryIDValue)=='number'){
		//单独取消，一般是string或者number型
		if(typeof(primaryIDName)=='string'){
			unselect(primaryIDValue);
		}else{
			if(debugerMode){
				console.error('取消选中功能必须设定dataConfig.primaryID')
			}
		}
	}else{
		if(debugerMode){
			console.error('不能识别的primaryIDValue类型')
		}
	}
	function unselect(primaryValue){
		var isClearSuccess = false
		for(var rowI = 0; rowI<tableMultiData.length; rowI++){
			if(tableMultiData[rowI][primaryIDName] == primaryValue){
				tableMultiData.splice(rowI,1);
				isClearSuccess = true;
			}
			var trData = baseDataTable.table[tableID].row(selectedTrs.eq(rowI)).data();
			if(trData[primaryIDName] == primaryValue){
				selectedTrs.eq(rowI).removeClass('selected');
			}
		}
		if(isClearSuccess == false){
			if(debugerMode){
				console.error('取消选中'+primaryIDName+' ：'+primaryValue+'无法找到');
			}
		}
	}
}
//宽度拖拽功能
baseDataTable.dragWidth = function (tableID) {
  var $theadths = $("#" + tableID + " thead tr th");
  var isUseTabs = baseDataTable.data[tableID].uiConfig.isUseTabs;
  //如果有拖拽控制器，则清除
  $("#" + tableID + " thead tr th .handler").remove();
  if (isUseTabs) {
    //使用tab，锁定了总宽度，所以不添加最后的列宽度控制
    $("#" + tableID + " thead tr th").not(':last').append('<div class="handler"></div>');
  } else {
    $("#" + tableID + " thead tr th").append('<div class="handler"></div>');
  }

  //添加事件
  $("#" + tableID + " thead tr th .handler").off('click');
  $("#" + tableID + " thead tr th .handler").on('click', function (ev) {
    ev.stopPropagation();
  })
  $("#" + tableID + " thead tr th .handler").off('mousedown');
  $("#" + tableID + " thead tr th .handler").on(
    'mousedown',
    {
      isUseTabs: isUseTabs,
      tableID: tableID
    },
    function (ev) {
      ev.stopPropagation();
      
      var $handler = $(this);
      var $th = $handler.parent();
      var $nextTh = $th.next();
      var thField = $th.attr('ns-tabledata');
      var nextField = $nextTh.attr('ns-tabledata');
      var uiConfig = baseDataTable.data[tableID].uiConfig;
      //console.log(ev.data.isUseTabs);

      //计算非固定列的原始宽度值总和
      var originalTabWidth = 0;
      if(ev.data.isUseTabs){
        var tabColumnArray = uiConfig.tabColumn.tabGroup[uiConfig.tabsActiveIndex];
        for (var tabColumnI = 0; tabColumnI < tabColumnArray.length; tabColumnI++) {
          originalTabWidth += tabColumnArray[tabColumnI].originalWidth;
        }
        //重新初始化的列
        var resizeColumnData =
        {
          field: {},  //有变化的列
          autoTabTotalWidth: uiConfig.tabOptions.columnWidthTabVisible  //自动计算列的总宽度
        };
      }
      
      var columns = baseDataTable.data[tableID].columns;
      
      //一共有四种情况要处理
      var widthMode = '';
      function isFixWidth(fieldName) {
        var isFix = false;
        if (columns[fieldName].tabPosition == 'after' || columns[fieldName].tabPosition == 'before') {
          isFix = true;
        }
        return isFix;
      }
      if (isFixWidth(thField)) {
        if (isFixWidth(nextField)) {
          widthMode = 'fix-fix';  //两个受影响的列都是固定的，仅影响两列
        } else {
          widthMode = 'fix-auto'; //第一个是固定的，第二个是自动的，则影响全部的自动列
        }
      } else {
        if (isFixWidth(nextField)) {
          widthMode = 'auto-fix';  //第一个是自动的，第二个是固定的，则影响全部的自动列
        } else {
          widthMode = 'auto-auto'; //两个受影响的列都是自动的，仅影响两列
        }
      }
      
      var evData = {
        $th: $th,
        thField: thField,
        baseWidth: $th.outerWidth(),
        $nextTh: $nextTh,
        nextField: nextField,
        nextWidth: $nextTh.outerWidth(),

        tableID: ev.data.tableID,
        startX: ev.pageX,
        isUseTabs: ev.data.isUseTabs,
        uiConfig: uiConfig,
        columns: columns,
        widthMode: widthMode,

        resizeColumnData: resizeColumnData,							//受影响的列及宽度值
      }
      if(ev.data.isUseTabs){
        evData.tabColumnArray = tabColumnArray;                           //当前显示tab，不包含固定列
        evData.autoTabWidth = uiConfig.tabOptions.columnWidthTabVisible;  //不包含固定列的可用宽度
        evData.autoTabOriginalWidth = originalTabWidth                     //不包含固定列的原始宽度总和
      }
      $(document).on("mousemove", evData, dragWidthMouseMove);
      $(document).on('mouseup', evData, dragWidthMouseUp);
    })
  function dragWidthMouseMove(ev) {
    ev.stopPropagation();
    var startX = ev.data.startX;
    var baseWidth = ev.data.baseWidth;
    var nextWidth = ev.data.nextWidth;
    var $th = ev.data.$th;
    var currentX = ev.pageX;
    var isUseTabs = ev.data.isUseTabs;
    var uiConfig = ev.data.uiConfig;
    var thField = ev.data.thField;
    var nextField = ev.data.nextField;
    var columns = ev.data.columns;
    var resizeColumnData = ev.data.resizeColumnData;

    if (isUseTabs == false) {
      //未使用tab
      var currentWidth = currentX - startX + baseWidth;
      var currentStyle = 'width: ' + currentWidth + 'px; min-width: ' + currentWidth + 'px;'
      $th.attr('style', currentStyle);
    } else {
      //使用了tab
      var widthMode = ev.data.widthMode;
      var $nextTh = ev.data.$nextTh;
      var tabColumnArray = ev.data.tabColumnArray;
      var autoTabWidth = ev.data.autoTabWidth;
      var autoTabOriginalWidth = ev.data.autoTabOriginalWidth;
      //设置指定列宽度
      function setWidth($dom, width, fieldName, fieldType, scaleSize) {
        //fieldType 有两个值auto fix
        var styleStr = 'width: ' + width + 'px; min-width: ' + width + 'px;'
        $dom.attr('style', styleStr);

        if (fieldType == 'fix') {
          resizeColumnData.field[fieldName] = {
            width: width,
            originalWidth: width,
            type: 'fix'
          }
        } else if (fieldType == 'auto') {
          resizeColumnData.field[fieldName] = {
            width: width,
            originalWidth: width / scaleSize,
            type: 'auto'
          }
        }
      }
      //设置自动分配列的宽度
      function setTabWidth(autoTabTempWidth) {
        var scaleSize = autoTabTempWidth / autoTabOriginalWidth;
        var autoTotalWidth = 0;
        for (var tcI = 0; tcI < tabColumnArray.length; tcI++) {
          var thTempWidth = tabColumnArray[tcI].originalWidth * scaleSize;
          thTempWidth = Math.round(thTempWidth);
          $cth = $('#' + tableID + ' thead th[ns-tabledata="' + tabColumnArray[tcI].data + '"]');
          autoTotalWidth += thTempWidth;
          if (tcI == (tabColumnArray.length - 1)) {
            thTempWidth += (autoTabTempWidth - autoTotalWidth);
          }
          setWidth($cth, thTempWidth, tabColumnArray[tcI].data, 'auto', scaleSize);
        }
        resizeColumnData.autoTabTotalWidth = autoTabTempWidth;
      }
      //根据情况分类
      switch (widthMode) {
        case 'fix-fix':
          //如果当前列是固定宽度列 且临近的下一列是固定宽度列，则仅修改两列
          var thTempWidth = currentX - startX + baseWidth;
          setWidth($th, thTempWidth, thField, 'fix');

          var nextTempWidth = nextWidth - (currentX - startX);
          setWidth($nextTh, nextTempWidth, nextField, 'fix');
          break;
        case 'fix-auto':
          //如果当前列是固定宽度列，但是临近的下一列是自动计算宽度的列，则应该全部自动计算的列宽都要动
          var thTempWidth = currentX - startX + baseWidth;
          setWidth($th, thTempWidth, thField, 'fix');

          var autoTabTempWidth = autoTabWidth - (currentX - startX);
          setTabWidth(autoTabTempWidth);
          break;
        case 'auto-fix':
          //如果当前列是自动计算列，但是临近的下一列是固定宽度的列，则应该全部自动计算的列宽都要动
          var autoTabTempWidth = currentX - startX + autoTabWidth;
          setTabWidth(autoTabTempWidth);

          var nextTempWidth = nextWidth - (currentX - startX);
          setWidth($nextTh, nextTempWidth, nextField, 'fix');
          break;
        case 'auto-auto':
          //当前列和下一列都是自动算列
          var scaleSize = autoTabWidth / autoTabOriginalWidth;

          var thTempWidth = currentX - startX + baseWidth;
          setWidth($th, thTempWidth, thField, 'auto', scaleSize);

          var nextTempWidth = nextWidth - (currentX - startX);
          setWidth($nextTh, nextTempWidth, nextField, 'auto', scaleSize);
      }
    }
  }
  function dragWidthMouseUp(ev) {
    ev.stopPropagation();
    var tableID = ev.data.tableID;
    var cwTableID = 'cw-' + tableID;
    var thField = ev.data.thField;
    var nextField = ev.data.nextField;
    var startX = ev.data.startX;
    var baseWidth = ev.data.baseWidth;
    var nextWidth = ev.data.nextWidth;
    var $th = ev.data.$th;
    var currentX = ev.pageX;
    var isUseTabs = ev.data.isUseTabs;
    var uiConfig = ev.data.uiConfig;

    //当前单元格宽度和下面单元格的宽度
    var currentWidth = currentX - startX + baseWidth;
    var nextCurrentWidth = nextWidth - (currentX - startX);

    var tableStorageData = store.get(cwTableID);
    var tableData = baseDataTable.data[tableID];
    if (typeof (tableStorageData) == 'undefined') {
      //该表格没有被存储
      tableStorageData = {
        field: {}
      };
    }
    if (isUseTabs == false) {
      //非tab模式直接存当前列的宽度
      if(typeof(tableStorageData.field[thField])=='undefined'){
        tableStorageData.field[thField] = {
          w: currentWidth
        };
      }else{
        tableStorageData.field[thField].w = currentWidth;
      }
      //更新运行数据
      tableData.columns[thField].originalWidth = currentWidth;
      tableData.columns[thField].width = currentWidth;
    } else {
      //非tab模式会影响多个列
      var resizeColumnData = ev.data.resizeColumnData;
     // console.log(resizeColumnData);
      $.each(resizeColumnData.field, function (key, value) {
        var settingWidth = Math.round(value.width);
        var settingOriginalWidth = Math.round(value.originalWidth);

        if (tableData.columns[key].originalWidth != settingOriginalWidth) {
          if (typeof(tableStorageData.field[key]) == 'undefined') {
            tableStorageData.field[key] = {
              w: value.originalWidth
            };
          } else {
            tableStorageData.field[key].w = value.originalWidth;
          }
          tableData.columns[key].originalWidth = settingOriginalWidth;
          tableData.columns[key].width = settingWidth;
        }
      });
      uiConfig.tabOptions.columnWidthTabVisible = Math.round(resizeColumnData.autoTabTotalWidth);
    }
    tableStorageData.timestamp = new Date().getTime();
    store.set(cwTableID, tableStorageData);
    $(document).off("mousemove", dragWidthMouseMove);
    $(document).off("mouseup", dragWidthMouseUp);
    nsUI.tablemanager.saveServerConfig(); 
  }
}

//固定行显示，当前数据不够固定行显示的行数时空行来填补
baseDataTable.isFillEmptyRow = function (tableID) {
  var dataConfig = baseDataTable.data[tableID].dataConfig;
  var uiConfig = baseDataTable.data[tableID].uiConfig;
  if (dataConfig.isLengthChange == false) {
    //固定行
   var $table = $('#'+tableID);
    var allData = baseDataTable.getAllTableData(tableID);
    var trLength = 0;
    if (allData.length > 0) {
      trLength = $('#' + tableID + ' tbody tr').not('.current-small-count').not('.tr-empty-row').length;
    } else {
      $('#' + tableID + ' tbody').html('');
    }
    $('#' + tableID + ' tbody tr.tr-empty-row').remove();
    var currentRowLength = uiConfig.pageLengthMenu[0];
    if (typeof (currentRowLength) == 'number') {
      if (trLength < currentRowLength) {
        //当固定显示行数的时候判断当前行的行数和固定行的大小
        var spaceNumber = currentRowLength - trLength;				//数据不够，行差值
        var infoPage = baseDataTable.table[tableID].page.info();
        var currentpageNumber = infoPage.page; //当前页码,因为是从0开始，所以要+1
        var iStartEven = currentpageNumber * currentRowLength + 1;	//当前页的起始序列号
        //当前是第三页，每页显示2条数据，起始序列行号是5，显示了1条数据，还差1条数据未显示
        //每页应该显示的条数-当前显示的条数= 需要补差的行数
        //起始序列行号+当前显示的总数据数 = 当前显示到的序列行号
        var letterAdd = iStartEven + trLength;
        var visibleColumnData = baseDataTable.getVisableColumnsName(tableID);
        //var tdLength = baseDataTable.data[tableID].visibleColumnLength - 1;
        var tdLength = $('#' + tableID + ' thead tr th').length-1;
        var type = 'number';
        if(uiConfig.browerSystem=='mobile'){
          tdLength = tdLength - 1;
        }
        if(uiConfig.isOpenCheck){
          type = 'checkbox';
        }
        if(!dataConfig.isSerialNumber){
          type = 'simple';
        }
        var trHtml = '';
        for (var trI = 0; trI < spaceNumber; trI++) {
         if(type == 'checkbox'){
          trHtml += '<tr class="tr-empty-row"><th><label class="checkbox-inline th-check"></label></th>';
         }else if(type == 'number'){
          //' + letterAdd + '
          trHtml += '<tr class="tr-empty-row"><th></th>';
         }else{
          trHtml += '<tr class="tr-empty-row"><td></td>';
         }
          for (var tdI = 0; tdI < tdLength; tdI++) {
            trHtml += '<td></td>';
          }
          trHtml += '</tr>';
          //letterAdd++;
        }
        $('#' + tableID + ' tbody').append(trHtml);
      }
    }
    var $emptyTables = $('#'+tableID).find('.dataTables_empty');
    if($emptyTables.length==1){
      //no record
      $emptyTables.attr('rowspan',currentRowLength);
       var tableHeightType = baseDataTable.data[tableID].uiConfig.tableHeightType; 
      var height = 40;
      if(tableHeightType == 'compact'){
        height = 32;
      }
      $emptyTables.closest('tr').attr('style','height:'+height+'px');
    }
  }
}

//设置表格行选中
baseDataTable.setSelectRows = function(tableID,rowIds){
  /*
    *tableID 表格id
    *rowIds 主键id 可以是字符串rowIds = '003' 也可以是数组rowIds = ['0','3']
  */
  var dataArray = baseDataTable.getAllTableData(tableID);//获取全部数据值
  var primaryID = 'id';
  if(baseDataTable.data[tableID].dataConfig.primaryID){
    //如果定义了主键id的情况
    primaryID = baseDataTable.data[tableID].dataConfig.primaryID;
  }
  var valueType = typeof(rowIds);//当前值类型
  var isContinue = true;//是否继续执行
  var uiConfig = baseDataTable.data[tableID].uiConfig;
  var rowIndexArr = [];
  if(rowIds){
    //值存在判断值是否合法
    switch(valueType){
      case 'string':
      case 'number':
        //判断当前给的id是否存在table数据中，存在可以设置选中，不存在不可以设置选中值
        if(uiConfig.isMulitSelect === true){
          nsalert('多选模式下ids应该传数组格式');
          isContinue = false;
          return false;
        }
        for(var idI=0; idI<dataArray.length; idI++){
          if(dataArray[idI][primaryID] === rowIds){
            //值存在
            rowIndexArr.push(idI);
          }
        }
        break;
      case 'object':
        //判断当前给的id是否存在table数据中，存在可以设置选中，不存在不可以设置选中值
        if(uiConfig.isSingleSelect === true){
          nsalert('单选模式下不支持多选操作');
          isContinue = false;
          return false;
        }
        for(var idI=0; idI<dataArray.length; idI++){
         if(rowIds.indexOf(dataArray[idI][primaryID])>-1){rowIndexArr.push(idI)};
        }
        break;
      default:
        isContinue = false;
        break;
    }
    if(isContinue){
      //值合法就继续
      if(rowIndexArr.length>0){
        var $trObj = baseDataTable.container[tableID].tableObj.children('tbody').children('tr');
        if(uiConfig.isSingleSelect){
          //单选
          for(var rowI=0; rowI<rowIndexArr.length; rowI++){
            $($trObj[rowIndexArr[rowI]]).addClass('selected');
            $($trObj[rowIndexArr[rowI]]).siblings().removeClass('selected');
            var cData = baseDataTable.table[tableID].row($($trObj[rowIndexArr[rowI]])).data();
            baseDataTable.container[tableID].dataObj = cData;
          }
        }
        if(uiConfig.isMulitSelect){
          //多选
          var multiRowArr = baseDataTable.container[tableID].multiData;
          for(var rowI=0; rowI<rowIndexArr.length; rowI++){
            $($trObj[rowIndexArr[rowI]]).addClass('selected');
            var cData = baseDataTable.table[tableID].row($($trObj[rowIndexArr[rowI]])).data();
            multiRowArr.push(cData);
          }
          var newRowArray = [];
          for(var i=0; i<multiRowArr.length; i++) {
          　　var items = multiRowArr[i];
          　　//判断元素是否存在于newRowArray中，如果不存在则插入到newRowArray的最后
          　　if($.inArray(items,newRowArray)==-1) {
                newRowArray.push(items);
          　　}
          }
          baseDataTable.container[tableID].multiData = newRowArray;
        }
      }
    }else{
      //ids值参数不合法
      nsalert('ids值参数不合法');
      console.log(rowIds)
    }
  }
}
//是否设置表格的高度，表格高度根据当前显示的行数来决定显示高
baseDataTable.setTableHeight = function (tableID) {
  var uiConfig = baseDataTable.data[tableID].uiConfig;
  if (uiConfig.isSetHeight == true) {
    var $trdom = baseDataTable.container[tableID].trObj;
    var evenPageLength = uiConfig.pageLengthMenu[0];
    var trLength = $trdom.length;
    if (evenPageLength > trLength) {
      var numberLength = evenPageLength - trLength;
      for (var i = 0; i < numberLength; i++) {
        baseDataTable.addTableSingleRow(tableID);
      }
    }
  }
}
//表格完成
baseDataTable.initComplete = function (tableID) {
  var $tableObj = baseDataTable.container[tableID].tableObj;
  var uiConfig = baseDataTable.data[tableID].uiConfig;
  var pLength = baseDataTable.data[tableID].dataConfig.isLengthChange;
  if(pLength){
    $tableObj.attr('ns-pagelength','change');
  }else{
    $tableObj.attr('ns-pagelength','fixed');
  }
  if(typeof(uiConfig.onLoadComplete)=='function'){
    return uiConfig.onLoadComplete();
  }
  if (uiConfig.isSingleSelect == true) {
    baseDataTable.container[tableID].dataObj = baseDataTable.table[tableID].row('.selected').data();
    baseDataTable.container[tableID].dataIndex = baseDataTable.table[tableID].row('.selected').index();
  }
  if (uiConfig.isMulitSelect == true) {
    var selectedArr = baseDataTable.table[tableID].rows('.selected').data();
    for (var selectI = 0; selectI < selectedArr.length; selectI++) {
      baseDataTable.container[tableID].multiData.push(selectedArr[selectI]);
    }
  }
  if($('#'+tableID+'_filter').closest('.searchPage').length > 0){$('#'+tableID+'_filter').css('display','none')};
  /*********datatable Page触发事件 start**********/
  //目前Page事件只存放了当前点击的是第几页
  $tableObj.on('page.dt', function (e, data) {
    var tableID = data.sTableId;
    var info = baseDataTable.table[tableID].page.info();
    baseDataTable.data[tableID].currentPage = info.page;
    var uiConfig = baseDataTable.data[tableID].uiConfig;
    if(typeof(uiConfig.pageChangeAfterHandler)=='function'){
      uiConfig.pageChangeAfterHandler({tableId:tableID});
    }
  });
  /*********datatable Page触发事件 end**********/
  $tableObj.on('search.dt', function (e, data) {
    var tableID = data.sTableId;
  });
  var amountData = baseDataTable.data[tableID].amountData;
  if(amountData){
    if(!$.isEmptyObject(uiConfig.amount)){
      if(typeof(uiConfig.amount)=='object'){
          if(typeof(uiConfig.amount.handler)=='function'){
            var html = uiConfig.amount.handler(amountData);
            $tableObj.parent().children('.nstable-bottom').append('<div class="datatables-total">'+html+'</div>');
          }
      }
    }
  }
  //

    if(typeof(uiConfig.onLoadFilter)=='function'){
          var returnLoadFilter = uiConfig.onLoadFilter;
          if(baseDataTable.data[tableID].dataTableRows){
            returnLoadFilter(baseDataTable.data[tableID].dataTableRows);
          }
    }

  /*********datatable draw触发事件 start**********/
  $tableObj.on('draw.dt', function (e, data) {
    var tableID = data.sTableId;
    baseDataTable.data[tableID].filterData = [];
    var dataConfig = baseDataTable.data[tableID].dataConfig;
    if($.isArray(data.aiDisplay)){
      if(data.aiDisplay.length > 0 && data.json){
         for(var filterI=0; filterI<data.aiDisplay.length; filterI++){
          baseDataTable.data[tableID].filterData.push(data.json[dataConfig.dataSrc][data.aiDisplay[filterI]]);
        }
      }
    }
    baseDataTable.drawHandler(tableID);
    if (baseDataTable.data[tableID].uiConfig.onLoadFilter) {
      var returnLoadFilter = baseDataTable.data[tableID].uiConfig.onLoadFilter;
      returnLoadFilter(data.json);
    }
    //处理全选
    if (baseDataTable.data[tableID].uiConfig.isUseSelectAll) {
      var $label = $tableObj.children('thead').children('tr').children('th').eq(0).children('label.checkbox-inline');
      var $trs = $tableObj.children('tbody').children('tr').not('.tr-empty-row');
      var $trsSelected = $trs.filter('.selected');
      var isAllSelect = false
      if ($trs.length == $trsSelected.length) {
        isAllSelect = true;
      }
      if (isAllSelect) {
        //是全选
        if ($label.hasClass('checked')) {
          //不用动了
        } else {
          $label.addClass('checked')
        }
      } else {
        //不是全选
        if ($label.hasClass('checked')) {
          $label.removeClass('checked')
        } else {
          //不用动了
        }
      }
    }
  });
}
//回调事件的触发
baseDataTable.drawHandler = function (tableID) {
  //如果是单选，dataObj存放选中行的集合
  var dataObj = baseDataTable.container[tableID].dataObj;
  //重新读取tr所有行集合
  var $trObj = $('#' + tableID + ' tbody tr').not('.current-small-count').not('.tr-empty-row');
  baseDataTable.data[tableID].pagelength = $trObj.length;
  var moveTrArr = [];//存放当前添加的空行所在行
  $trObj.each(function (key, value) {
    if ($(this).attr('ns-tr')) {
      moveTrArr.push($(this));
    }
  });
  for (var moveIndex = 0; moveIndex < moveTrArr.length; moveIndex++) {
    moveTrArr[moveIndex].parent().append(moveTrArr[moveIndex]);
  }
  //重新赋值tr集合
  var newTrObj = $('#' + tableID + ' tbody tr').not('.current-small-count').not('.tr-empty-row');

  baseDataTable.formatHandler.getPlaceholder(tableID);

  var currentLength = baseDataTable.data[tableID].currentLength;
  if(isNaN(currentLength)){currentLength = baseDataTable.data[tableID].pagelength;}
  var currentPage = baseDataTable.data[tableID].currentPage;
  var cDataTable = baseDataTable.table[tableID];
  var iStartEven = currentPage * currentLength + 1;
  var cDataTable = baseDataTable.table[tableID];
  if (baseDataTable.data[tableID].dataConfig.isServerMode) {
    if(baseDataTable.data[tableID].uiConfig.isOpenCheck){
      cDataTable.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
        cell.innerHTML =  '<label class="checkbox-inline th-check"></label>';
      });
    }else{
      if(baseDataTable.data[tableID].dataConfig.isSerialNumber){
          cDataTable.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
            cell.innerHTML = iStartEven + i;
          });
      }
    }
  } else {
    if(baseDataTable.data[tableID].uiConfig.isOpenCheck){
      cDataTable.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
        cell.innerHTML =  '<label class="checkbox-inline th-check"></label>';
      });
    }else{
       if(baseDataTable.data[tableID].dataConfig.isSerialNumber){
          cDataTable.column(0).nodes().each(function (cell, i) {
            cell.innerHTML = i + 1;
          });
       }
    }
  }
  if (typeof (dataObj) == 'object') {
    if (!$.isEmptyObject(dataObj)) {
      newTrObj.each(function (key, value) {
        var currentObj = baseDataTable.table[tableID].row($(this)).data();
        if (baseDataTable.data[tableID].uiConfig.isSingleSelect) {
          if (typeof (currentObj) != 'undefined') {
            if (isObjectValueEqual(dataObj, currentObj)) {
              $(this).addClass('selected');
            } else {
              $(this).removeClass('selected');
              baseDataTable.container[tableID].dataObj = {};
            }
          }
        }
      });
    }
  }
  baseDataTable.container[tableID].trObj = newTrObj;
  baseDataTable.selectedHandler(tableID);
  baseDataTable.selfDefineModule(tableID);
  baseDataTable.pageLengthHandler(tableID);

  baseDataTable.isFillEmptyRow(tableID);
  baseDataTable.countTotal(tableID);
  if (baseDataTable.data[tableID].uiConfig.isOpenCheck) {
    //开启全选回调
    baseDataTable.getAllCheckedData(tableID);
  }
  //重绘之后检索到的数据是否为空
  var $table = baseDataTable.container[tableID].tableObj;
  var $emptyTables = $table.find('.dataTables_empty');
  if($emptyTables.length==1){
    //no record
    var evenLength = baseDataTable.data[tableID].evenLength;
    var tableHeightType = baseDataTable.data[tableID].uiConfig.tableHeightType; 
    var height = evenLength * 40;
    if(tableHeightType == 'compact'){
      height = evenLength * 32;
    }
    var isLengthChange = baseDataTable.data[tableID].dataConfig.isLengthChange;
    if(isLengthChange){
      $emptyTables.closest('tr').attr('style','height:'+height+'px');
    }
  }

  if(baseDataTable.data[tableID].uiConfig.browerSystem == 'mobile'){
    baseDataTable.mobilePanelHandler(tableID);
  }

}
//判断当前多选值是否存在刷新之后的表格数据中，如果不存在则应该从多选数据中移除
baseDataTable.isMutilExit = function (tableID) {
  var multiData = baseDataTable.container[tableID].multiData;
  var rowsData = baseDataTable.allTableData(tableID);
  var primaryID = baseDataTable.data[tableID].dataConfig.primaryID ? baseDataTable.data[tableID].dataConfig.primaryID : 'id';
  var multiArr = [];
  for (var rowI = 0; rowI < rowsData.length; rowI++) {
    var currentID = rowsData[rowI][primaryID];
    for (var multiI = 0; multiI < multiData.length; multiI++) {
      if (multiData[multiI][primaryID] == currentID) {
        multiArr.push(rowsData[rowI]);
      }
    }
  }
  baseDataTable.container[tableID].multiData = multiArr;
  return multiArr;
}


baseDataTable.multiRowsHandler = function (tableID) {
  var multiData = baseDataTable.isMutilExit(tableID);
  if ($.isArray(multiData)) {
    var rowsDom = baseDataTable.container[tableID].trObj;
    for (var i = 0; i < multiData.length; i++) {
      rowsDom.each(function (key, value) {
        var currentObj = baseDataTable.table[tableID].row($(this)).data();
        if (currentObj) {
          var primaryID;
          if (typeof (baseDataTable.data[tableID].dataConfig.primaryID) == 'string') {
            primaryID = currentObj[baseDataTable.data[tableID].dataConfig.primaryID];
          }
          if (typeof (currentObj) != 'undefined' && typeof (multiData[i]) != 'undefined') {
            if (isObjectValueEqual(multiData[i], currentObj)) {
              $(this).addClass('selected');
              if (primaryID) {
                $(this).attr('advance-tid', primaryID);
              }
            }
          }
        }
      });
    }
  }
}
baseDataTable.pageLengthHandler = function (tableID) {
  var lengthChange = baseDataTable.data[tableID].dataConfig.isLengthChange ? baseDataTable.data[tableID].dataConfig.isLengthChange : true;
  if (lengthChange) {
    var $pageDom = $('#' + tableID).closest('.dataTables_wrapper').children('.nstable-bottom').children('.nstable-page');

    $pageDom.find('.dropdown-menu li').off('click');
    $pageDom.find('.dropdown-menu li').on('click', function (ev) {
      var tableID = $(ev.target).closest('ul').attr('ns-table');
      var textStr = $(this).text().trim();
      $(ev.target).closest('.btn-group').children('button').html(textStr + '<span class="caret"></span>');
      var $tableObj = baseDataTable.container[tableID].tableObj;
      var valueIndex = $(ev.target).closest('li').attr('pageindex');
      var valueArr = baseDataTable.data[tableID].uiConfig.pageLengthMenu[0];
      var valueStr = valueArr[valueIndex];
      baseDataTable.data[tableID].currentLength = Number(textStr);
      if (valueStr) {
        baseDataTable.table[tableID].page.len(valueStr).draw(false);
      }
      if(typeof(baseDataTable.data[tableID].uiConfig.pageLengthChangeHandler)=='function'){
        baseDataTable.data[tableID].uiConfig.pageLengthChangeHandler({
          tableId:tableID,
          pageLength:Number(textStr)
        });
      }
    });
  }
}
baseDataTable.tableBtnHandler = function (tableID) {
  var btnDom = baseDataTable.formatHandler[tableID].tableBtnDom;
  btnDom.children('[nstable-btn="baseBtn"]').children().on('click', function (ev) {
    var baseFid = $(ev.target).closest('button').attr('fid');
    var tableID = $(ev.target).closest('.control-btn-toolbar').attr('id');
    var tempParentClass = 'control-btn-toolbar';
    tableID = tableID.substr(tempParentClass.length + 1, tableID.length);
    if (baseFid) {
      var baseFunc = baseDataTable.formatHandler[tableID].tableBtnJson[baseFid].handler;
      if (baseFunc) { baseFunc(); }
    }
  });
  btnDom.children('[nstable-btn="selfBtn"]').children('button[type="button"]').on('click', function (ev) {
    var $this = $(this);
    var selfFid = $this.attr('fid');
    var tableID = $(ev.target).closest('.control-btn-toolbar').attr('id');
    var tempParentClass = 'control-btn-toolbar';
    tableID = tableID.substr(tempParentClass.length + 1, tableID.length);
    if (selfFid) {
      var selfFunc = baseDataTable.formatHandler[tableID].tableBtnJson.self[selfFid].handler;
      var returnObj = {
        nsIndex:selfFid,
        tableID:tableID
      }
      var isReturn = $this.attr('isReturn');
      if (selfFunc) { 
        if(isReturn == 'true'){
          selfFunc(returnObj);
        }else{
          selfFunc(); 
        }
      }
    }
  });
  var btnGroupArr = baseDataTable.formatHandler[tableID].tableBtnJson.groupBtnHandlerArr;
  if ($.isArray(btnGroupArr)) {
    //下拉按钮返回函数调用
    var $btnGroup = $('#control-btn-toolbar-' + tableID + ' [nstable-btn="selfBtn"]');
    for (var btnGroupIndex = 0; btnGroupIndex < btnGroupArr.length; btnGroupIndex++) {
      if (btnGroupArr[btnGroupIndex].length > 0) {
        var childDom = $btnGroup.find('button')[btnGroupIndex];
        var subBtnDom = $(childDom).nextAll();
        $(subBtnDom).find('li').off('click');
        $(subBtnDom).find('li').on('click', function (ev) {
          var $this = $(this);
          var functionID = Number($this.children('a').attr('fid'));
          var optionID = Number($this.children('a').attr('optionid'));
          //如果btn下标存在，则继续执行
          if (isNaN(functionID) == false) {
            var handlerArr = btnGroupArr[functionID];
            //判断下拉按钮是否是个数组，因为下拉选择钮可能存在多个
            if ($.isArray(handlerArr)) {
              var btnHandler = handlerArr[optionID];
               var isReturn = $this.children('a').attr('isReturn');
              if (typeof (btnHandler) == 'function') {
                //返回调用方法是个function
                 var returnObj = {
                  nsIndex:functionID,
                  nsSubIndex:optionID,
                  tableID:tableID,
                  ev:ev
                }
                if(isReturn == 'true'){
                  btnHandler(returnObj);
                }else{
                 btnHandler();
                }
              }
            }
          }
        });
      }
    }
  }
  btnDom.children('[nstable-btn="orderBtn"]').children().on('click', function (ev) {
    var orderFid = $(ev.target).closest('button').attr('fid');
    var tableID = $(ev.target).closest('.control-btn-toolbar').attr('id');
    var tempParentClass = 'control-btn-toolbar';
    tableID = tableID.substr(tempParentClass.length + 1, tableID.length);
    if (orderFid) {
      var orderFunc = baseDataTable.formatHandler[tableID].tableBtnJson.order[orderFid].handler;
      if (orderFunc) { orderFunc(); }
    }
  });
  var exportDom = btnDom.children('[nstable-btn="exportBtn"]').children('ul');
  exportDom.children().on('click', function (ev) {
    var exportFid = $(ev.target).closest('li').attr('fid');
    var tableID = $(ev.target).closest('.control-btn-toolbar').attr('id');
    var tempParentClass = 'control-btn-toolbar';
    tableID = tableID.substr(tempParentClass.length + 1, tableID.length);
    var isServerMode = baseDataTable.data[tableID].isServerMode;
    if (isServerMode) {
      var returnFunc = baseDataTable.formatHandler[tableID].tableBtnJson.export;
      if (returnFunc) { returnFunc(); }
    } else {
      switch (exportFid) {
        case 'allCsv':
          baseDataTable.exportCSV(tableID, true);
          break;
        case 'visiableCsv':
          baseDataTable.exportCSV(tableID, false);
          break;
        case 'selectedCsv':
          baseDataTable.isExportSelected(tableID, 'csv', true);
          break;
        case 'unSelectedCsv':
          baseDataTable.isExportSelected(tableID, 'csv', false);
          break;
        case 'allXls':
          baseDataTable.exportXLS(tableID, true);
          break;
        case 'visiableXls':
          baseDataTable.exportXLS(tableID, false);
          break;
        case 'selectedXls':
          baseDataTable.isExportSelected(tableID, 'excel', true);
          break;
        case 'unSelectedXls':
          baseDataTable.isExportSelected(tableID, 'excel', false);
          break;
      }
    }
  });
  $("#dropdown-cloumns-" + tableID).on("click", function (ev) {
    ev.stopPropagation();
  });
  $("#dropdown-cloumns-" + tableID + " li div input[name='checkbox-columns']").on("click", function (ev) {
    ev.stopPropagation();
    var tableID = $(ev.target).closest('.control-btn-toolbar').attr('id');
    var tempParentClass = 'control-btn-toolbar';
    tableID = tableID.substr(tempParentClass.length + 1, tableID.length);
    var columnID = Number($(ev.target).attr("columnID"));
    var isChecked = $(ev.target).is(':checked');
    var isVisibleArr = [];
    isVisibleArr.push(columnID + 1);
    baseDataTable.getChangeColumnIsVisible(tableID, isVisibleArr, isChecked);
    var columnFunc = baseDataTable.formatHandler[tableID].tableBtnJson.column;
    if (columnFunc) {
      columnFunc();
    }
  });
  $("#dropdown-cloumns-" + tableID + " li a[columnID='all']").on("click", function (ev) {
    ev.stopPropagation();
    var tableID = $(ev.target).closest('.control-btn-toolbar').attr('id');
    var tempParentClass = 'control-btn-toolbar';
    tableID = tableID.substr(tempParentClass.length + 1, tableID.length);
    $("#dropdown-cloumns-" + tableID + " li div input[name='checkbox-columns']").prop("checked", true);
    baseDataTable.table[tableID].columns().visible(true).draw(false);
    var columnFunc = baseDataTable.formatHandler[tableID].tableBtnJson.column;
    if (columnFunc) { columnFunc(); }
  });
}
/*************选中事件 start***********/
baseDataTable.selectedHandler = function (tableID) {
  var $trObj = baseDataTable.container[tableID].trObj;
  var selectionTime = null;
  $trObj.off('click');
  $trObj.on('click', function (ev) {
  	if($(this).attr('ns-disable')=='true'){
  		return;
  	}
    var timeStampStr = $(this).attr('timestamp');								//添加时间戳
    var isDoubleClick = false;													//是否是双击
    if (typeof (timeStampStr) == 'string') {
      var currentTimestamp = new Date().getTime();
      var selectTimestamp = parseInt($(this).attr('timestamp'));
      if (currentTimestamp - selectTimestamp < 500) {
        //双击
        isDoubleClick = true;
      }
    }
    if (isDoubleClick == true) {
      //双击
      if ($(this).hasClass('selected')) {
        //选中
        cancelSelectAddHandler(ev);
      } else {
        //取消
        selectAddHandler(ev);
      }
    } else {
      //单击
      if ($(this).hasClass('selected')) {
        //取消
        cancelSelectHandler(ev);
      } else {
        //选中
        selectHandler(ev);
      }
    }
  });
  //单击触发事件
  function selectHandler(ev) {
    var $currentTrObj = $(ev.target).closest('tr');								//当前行对象
    $currentTrObj.attr('timestamp', new Date().getTime());
    var tableID = $(ev.target).closest('table').attr('id');						//表格id
    var dataObj = baseDataTable.table[tableID].row($currentTrObj).data();		//当前行数据
    var dataIndex = baseDataTable.table[tableID].row($currentTrObj).index();	//当前行下标
    var selectMode = '';
    var uiConfig = baseDataTable.data[tableID].uiConfig;
    var primaryID = baseDataTable.data[tableID].dataConfig.primaryID;
    if (uiConfig.isSingleSelect == true) {
      selectMode = 'single';
    }
    if (uiConfig.isMulitSelect == true) {
      selectMode = 'multi';
    }
    switch (selectMode) {
      case 'single':
        $currentTrObj.addClass('selected');											//当前行添加选中
        $currentTrObj.siblings().removeClass('selected');							//移除其他行的选中
        baseDataTable.container[tableID].dataObj = dataObj;							//赋值
        baseDataTable.container[tableID].dataIndex = dataIndex;						//赋值
        break;
      case 'multi':
        $currentTrObj.addClass('selected');
        var rowsArray = baseDataTable.container[tableID].multiData;
        if(!$.isArray(rowsArray)){
          rowsArray = [];
        }
        if(rowsArray.length > 0){
          var existIndex = -1;
          for(var i=0; i<rowsArray.length; i++){
            if(rowsArray[i][primaryID]){
              if(rowsArray[i][primaryID] == dataObj[primaryID]){
                existIndex = i;
                break;
              }
            }
          }
          if(existIndex == -1){
            baseDataTable.container[tableID].multiData.push(dataObj);
          }
        }else{
          baseDataTable.container[tableID].multiData.push(dataObj);
        }
        break;
    }
    if(uiConfig.browerSystem == 'mobile'){
      //手机端模式 显示div按钮
      var $mobilebtn = $('#'+tableID+'-plus-button-panel');
      $mobilebtn.attr('ns-tableid',tableID);
      $mobilebtn.attr('ns-trindex',dataIndex);
      $mobilebtn.css('display','block');
    }
    if (typeof (uiConfig.onSingleSelectHandler) == 'function') {
      var selectedHandler = uiConfig.onSingleSelectHandler;
      var returnObj = {};
      //表格行的$dom
      returnObj.obj = $currentTrObj;
      //表格id
      returnObj.tableID = tableID;
      //当前行数据 cy20180627
      returnObj.rowData = baseDataTable.table[tableID].row($currentTrObj).data();
      selectedHandler(returnObj);
    }
  }
  //单击取消触发事件
  function cancelSelectHandler(ev) {
    var $currentTrObj = $(ev.target).closest('tr');								//当前行对象
    $currentTrObj.attr('timestamp', new Date().getTime());
    var tableID = $(ev.target).closest('table').attr('id');						//表格id
    var dataObj = baseDataTable.table[tableID].row($currentTrObj).data();		//当前行数据
    var dataIndex = baseDataTable.table[tableID].row($currentTrObj).index();  //当前行下标
    $currentTrObj.removeClass('selected');										//当前行移除选中
    var uiConfig = baseDataTable.data[tableID].uiConfig;
    var selectMode = '';
    if (uiConfig.isSingleSelect == true) {
      selectMode = 'single';
    }
    if (uiConfig.isMulitSelect == true) {
      selectMode = 'multi';
    }
    switch (selectMode) {
      case 'single':
        baseDataTable.container[tableID].dataObj = {};								//清空
        baseDataTable.container[tableID].dataIndex = '';							//清空
        break;
      case 'multi':
        var multiData = baseDataTable.container[tableID].multiData;
        //是否定义了主键id字段
        if (typeof (baseDataTable.data[tableID].dataConfig.primaryID) == 'string') {
          var primaryID = baseDataTable.data[tableID].dataConfig.primaryID;
          var deleteID = dataObj[primaryID];
          for (var mutilI = 0; mutilI < multiData.length; mutilI++) {
            if (multiData[mutilI][primaryID] == deleteID) {
              multiData.splice(mutilI, 1);
            }
          }
        } else {
          for (var mutilI = 0; mutilI < multiData.length; mutilI++) {
            if (isObjectValueEqual(dataObj, multiData[mutilI])) {
              multiData.splice(mutilI, 1);
            }
          }
        }
        break;
    }
    if(uiConfig.browerSystem == 'mobile'){
      //手机端模式 显示div按钮
      var $mobilebtn = $('#'+tableID+'-plus-button-panel');
      $mobilebtn.attr('ns-tableid',tableID);
      $mobilebtn.attr('ns-trindex',dataIndex);
      $mobilebtn.css('display','none');
      $mobilebtn.children('div').css('display','none');
    }
    if (typeof (uiConfig.onUnsingleSelectHandler) == 'function') {
      var cancelSelectHandler = uiConfig.onUnsingleSelectHandler;
      var returnObj = {};
      returnObj.obj = $currentTrObj;
      returnObj.tableID = tableID;
      cancelSelectHandler(returnObj);
    }
  }
  //双击触发事件
  function selectAddHandler(ev) {
    var $currentTrObj = $(ev.target).closest('tr');								//当前行对象
    var tableID = $(ev.target).closest('table').attr('id');						//表格id
    $currentTrObj.addClass('selected');
    if (typeof (baseDataTable.data[tableID].uiConfig.onDoubleSelectHandler) == 'function') {
      var tableSelectFunc = baseDataTable.data[tableID].uiConfig.onDoubleSelectHandler;
      var returnObj = {};
      returnObj.obj = $currentTrObj;
       returnObj.tableID = tableID;
      tableSelectFunc(returnObj);
    }
  }
  //双击取消触发事件
  function cancelSelectAddHandler(ev) {
    var $currentTrObj = $(ev.target).closest('tr');								//当前行对象
    var tableID = $(ev.target).closest('table').attr('id');						//表格id
    $currentTrObj.removeClass('selected');
    if (typeof (baseDataTable.data[tableID].uiConfig.onUndoubleSelectHandler) == 'function') {
      var tableSelectFunc = baseDataTable.data[tableID].uiConfig.onUndoubleSelectHandler;
      var returnObj = {};
      returnObj.obj = $currentTrObj;
      returnObj.tableID = tableID;
      tableSelectFunc(returnObj);
    }
  }
}
/************* 禁止选中 ***********/
baseDataTable.setDisabledRow = function($row, isDisabled){
	if(debugerMode){
		if($row[0].tagName.toLowerCase()!='tr'){
			console.error('baseDataTable.setDisabledRow 只支持对tr的操作');
			console.error($row);
			return;
		}
	}
	//设置选中标签
	if(isDisabled){
		$row.attr('ns-disable','true');
	}else{
		$row.removeAttr('ns-disable');
	}
	//修改选中数据 未做
}
/********自动生成序列号 start**********/
baseDataTable.serialNumber = function (tableID) {
  var cDataTable = baseDataTable.table[tableID];
  var isOpenCheck = baseDataTable.data[tableID].uiConfig.isOpenCheck;
  cDataTable.on('order.dt search.dt ', function (data) {
    if(isOpenCheck){
      cDataTable.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
        cell.innerHTML =  '<label class="checkbox-inline th-check"></label>';
      });
    }else{
      cDataTable.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
        cell.innerHTML = i + 1;
      });
    }
    for (var colID = 1; colID < baseDataTable.data[tableID].columnConfig.length; colID++) {
      if (typeof ($("#" + tableID + " thead tr th:eq(" + colID + ")").attr("data-priority")) == "undefined") {
      } else {
        cDataTable.column(colID, { search: 'applied', order: 'applied' }).nodes().each(function (cell, m) {
          $(cell).attr("data-columns", "simple-table-col-" + colID);
        });
      }
      if ($("#" + tableID + " thead tr th:eq(" + colID + ")").attr("style") == "display:none") {
        cDataTable.column(colID, { search: 'applied', order: 'applied' }).nodes().each(function (cell, m) {
          $(cell).attr("style", "display:none");
        });
      }
    }
  }).draw();
}
baseDataTable.serialAutoNumber = function (tableID) {
  var cDataTable = baseDataTable.table[tableID];
  if(baseDataTable.data[tableID].uiConfig.isOpenCheck){
    cDataTable.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
      cell.innerHTML =  '<label class="checkbox-inline th-check"></label>';
    });
  }else{
    cDataTable.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
      cell.innerHTML = i + 1;
    });
  }
}
/********自动生成序列号 END**********/
/********导出事件 start**************/
baseDataTable.exportHandler = function (tableID) {
  var $tableObj = baseDataTable.container[tableID].tableObj;
  var exportTableName = baseDataTable.data[tableID].uiConfig.exportTableName;
  if(typeof(exportTableName)=='undefined'){
    exportTableName = tableID;
  }
  //导出csv格式
  baseDataTable.exportCSV = function (tableID, isAll) {
    var tempTableHtml = '<div style="display:none;"><table id="temp-table-export"></table></div>';
    var $tableObj = baseDataTable.container[tableID].tableObj;
    $tableObj.after($(tempTableHtml));
    getExportTable($tableObj, $("#temp-table-export"), isAll);
    var exportTableName = baseDataTable.data[tableID].uiConfig.exportTableName;
    if(typeof(exportTableName)=='undefined'){
      exportTableName = tableID;
    }
    $("#temp-table-export").tableExport({ type: 'csv', escape: 'false', fileName: exportTableName });
    $("#temp-table-export").remove();
  }
  //导出excel格式
  baseDataTable.exportXLS = function (tableID, isAll) {
    var tempTableHtml = '<div style="display:none;"><table id="temp-table-export"></table></div>';
    var $tableObj = baseDataTable.container[tableID].tableObj;
    $tableObj.after($(tempTableHtml));
    getExportTable($tableObj, $("#temp-table-export"), isAll);
    var exportTableName = baseDataTable.data[tableID].uiConfig.exportTableName;
    if(typeof(exportTableName)=='undefined'){
      exportTableName = tableID;
    }
    $("#temp-table-export").tableExport({ type: 'excel', escape: 'false', fileName: exportTableName });
    $("#temp-table-export").remove();
  }
  //导出是否选中
  baseDataTable.isExportSelected = function (tableID, exporttype, isSelected) {
    var tempTableHtml = '<div style="display:none;"><table id="temp-table-export"></table></div>';
    var $tableObj = baseDataTable.container[tableID].tableObj;
    $tableObj.after($(tempTableHtml));
    var isContinue = getIsExistSelectedTable($tableObj, $("#temp-table-export"), isSelected);
    var exportTableName = baseDataTable.data[tableID].uiConfig.exportTableName;
    if(typeof(exportTableName)=='undefined'){
      exportTableName = tableID;
    }
    if (isContinue) {
      $("#temp-table-export").tableExport({ type: exporttype, escape: 'false', fileName: exportTableName});
      $("#temp-table-export").remove();
    } else {
      $("#temp-table-export").remove();
      nsAlert(language.datatable.nsalert.uncheckLine);
    }
  }
}
/********导出事件 end****************/
baseDataTable.getCodeNumber = function () {
  var ordersNum = '';
  var s = [];
  var hexDigits = "0123456789ABCDEF";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";
  ordersNum = s.join("").toUpperCase();
  return ordersNum;
}
/**
*功能：统计所有列值总和的数据，返回json数据格式
*tableID 要统计列小计表格id
**/
baseDataTable.getTotalData = function (tableID) {
  var countData = baseDataTable.countTotalJson[tableID];
  return countData;
}
/********表格统计列值数量 start**************/

/********表格统计列值数量 end**************/
/*******表格列值计算 start*********/
/**
*功能：计算需要显示列合计的值，并显示
*tableID 要计算的表格id
**/
baseDataTable.countTotal = function (tableID) {
  baseDataTable.countTotalJson[tableID] = {};
  var AllDataArr = baseDataTable.table[tableID].data();
  var trHtml = '';
  var isAppendHtml = false;
  if (AllDataArr.length > 0) {
    var countTotalJson = {};
    var countTrJson = {};
    var evenPage = baseDataTable.data[tableID].pagelength;
    var cPage = baseDataTable.table[tableID].page() + 1;
    
    var iStart = (cPage - 1) * evenPage;
    var iEnd = iStart + evenPage;

    if(cPage > 1){
      iStart = (cPage - 1) * baseDataTable.data[tableID].evenLength;
      iEnd = iStart + baseDataTable.data[tableID].evenLength;
    }

    var columnConfigArr = [];
    var columnLength = 0;
    if(baseDataTable.data[tableID].dataConfig.isServerMode){
      iStart = 0;
    }
    var visibleField = 'visible';
    if (baseDataTable.data[tableID].uiConfig.isUseTabs) {
      //是tab页状态使用
      visibleField = 'isVisableColumn';
      var tabsColumn = baseDataTable.data[tableID].uiConfig.tabColumn;
      var tabsActiveIndex = baseDataTable.data[tableID].uiConfig.tabsActiveIndex;
      if ($.isArray(tabsColumn.before)) {
        if (tabsColumn.before.length > 0) {
          for (var beforeI = 0; beforeI < tabsColumn.before.length; beforeI++) {
            columnConfigArr.push(tabsColumn.before[beforeI]);
          }
        }
      }
      if ($.isArray(tabsColumn.tabGroup[tabsActiveIndex])) {
        for (var tabI = 0; tabI < tabsColumn.tabGroup[tabsActiveIndex].length; tabI++) {
          columnConfigArr.push(tabsColumn.tabGroup[tabsActiveIndex][tabI]);
        }
      }
      if ($.isArray(tabsColumn.after)) {
        for (var afterI = 0; afterI < tabsColumn.after.length; afterI++) {
          columnConfigArr.push(tabsColumn.after[afterI]);
        }
      }
    } else {
      columnConfigArr = baseDataTable.data[tableID].columnConfig;
    }
    columnLength = columnConfigArr.length;

    for (var column = 1; column < columnLength; column++) {
      //只计算当前显示的列
      if (columnConfigArr[column][visibleField]) {
        //所有显示的列值默认都为空
        countTrJson[column] = '';
        if (columnConfigArr[column].total == true) {
          //当前列需要计算小计
          isAppendHtml = true;
          var columnTotal = 0;
          var columnField = columnConfigArr[column].data;
          if (iEnd > AllDataArr.length) {
            iEnd = AllDataArr.length;
          }
          for (var columnIndex = iStart; columnIndex < iEnd; columnIndex++) {
            columnTotal += Number(AllDataArr[columnIndex][columnField]);
          }
          countTotalJson[columnField] = columnTotal;
          columnTotal = baseDataTable.formatMoney(columnTotal, columnConfigArr[column].precision, '');
          countTrJson[column] = columnTotal;
        }
        if (columnConfigArr[column].records == true) {
          countTrJson[column] = evenPage;
        }
      }
    }
    trHtml = '<tr class="current-small-count"><th>小计</th>';
    for (var trIndex in countTrJson) {
      if (countTrJson[trIndex]) {
        trHtml += '<td>' + countTrJson[trIndex] + '</td>';
      } else {
        trHtml += '<td></td>';
      }
    }
    trHtml += '</tr>';
    baseDataTable.countTotalJson[tableID] = countTotalJson;
    var $table = $('#'+tableID);
    if (isAppendHtml == true) {
      $('#' + tableID + ' tbody tr.current-small-count').remove();
      $('#' + tableID + ' tbody').append(trHtml);
      //没有找到记录的情况要多合并一行并且合并行要有行高值
      var $emptyTables = $table.find('.dataTables_empty');
      if($emptyTables.length==1){
        var rowspanNum = Number($emptyTables.attr('rowspan'));
        rowspanNum = rowspanNum + 1;
        $emptyTables.attr('rowspan',rowspanNum);
      }
    } else {
      $('#' + tableID + ' tbody tr.current-small-count').remove();
    }
  } else {
    $('#' + tableID + ' tbody tr.current-small-count').remove();
  }
}
/*******表格列值计算 end*********/
/*******checkbox radio 初始化样式调用 start*********/
/*******checkbox radio 初始化样式调用 end*********/
/**
*功能：对要计算的钱进行格式化处理
*参数：number需要格式的数据
**/
baseDataTable.formatMoney = function (number, places, symbol, thousand, decimal) {
  number = number || 0;
  places = !isNaN(places = Math.abs(places)) ? places : 2;
  symbol = symbol !== undefined ? symbol : "$";
  thousand = thousand || ",";
  decimal = decimal || ".";
  var negative = number < 0 ? "-" : "",
    i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
    j = (j = i.length) > 3 ? j % 3 : 0;
  return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
}
/**
*功能：清空table tbody所有行数据
*参数：需要清空的tableID
**/
baseDataTable.clearData = function (tableID, isClear) {
  var $trObj = baseDataTable.container[tableID].trObj;
  baseDataTable.table[tableID].rows($trObj).remove();
  $('#' + tableID + ' tbody').html('');
  var isEmptyRow = typeof (isClear) == 'boolean' ? isClear : true;
  if (isEmptyRow) {
    baseDataTable.addTableSingleRow(tableID);
  }
}
/**
*功能：重新刷新table数据
*参数：表id,要刷新的data请求参
*默认刷新整个table数据
**/
baseDataTable.reloadTableAJAX = function (tableID, jsonData) {
  if (typeof (jsonData) == 'undefined' || jsonData == null || $.isEmptyObject(jsonData)) {
    jsonData = baseDataTable.data[tableID].dataConfig.data;
    var isServerMode = baseDataTable.data[tableID].dataConfig.isServerMode;
    var currentPage = baseDataTable.data[tableID].currentPage;
    var currentLength = baseDataTable.data[tableID].currentLength;
    if (isServerMode == true) {
      if (typeof (jsonData) == 'object') {
        //每页条数10  当前页码   起始条数   0*10+10  1*10+10 2*10+10 3*10+10 4*10+10 5*10+10
        if(Number(currentLength) && Number(currentPage)){
          jsonData.start = currentPage*currentLength;
        }
       /* for (var jsonI in jsonData) {
          if (jsonI == 'start') {
            jsonData[jsonI] = currentLength + currentpage;
          }
        }*/
      }
    }
  }
  baseDataTable.data[tableID].dataConfig.data = jsonData;
  baseDataTable.originalConfig[tableID].dataConfig.data = jsonData;
  baseDataTable.table[tableID].ajax.reload(function (data) {
    var currentPage = baseDataTable.data[tableID].currentPage;
    /****************sjj 20180409处理删除当前页的bug问题*********************************/
   if(baseDataTable.data[tableID].dataConfig.isServerMode == false){
     if($.isArray(data[baseDataTable.data[tableID].dataConfig.dataSrc])){
        var dataTableLength = data[baseDataTable.data[tableID].dataConfig.dataSrc].length;
        var pageN = Math.ceil(dataTableLength/baseDataTable.data[tableID].evenLength);
        if(isNaN(pageN)){
          currentPage = 0;
        }else{
          if(pageN < (currentPage+1)){
            //比如当前最大页码是9，但要读取第10页数据
            currentPage = pageN-1;
          }
        }
      }
   }
    /****************sjj 20180409处理删除当前页的bug问题*********************************/
    baseDataTable.table[tableID].page(currentPage).draw(false);
    var uiConfig = baseDataTable.data[tableID].uiConfig;
    if (uiConfig.isSingleSelect == true) {
      baseDataTable.container[tableID].dataObj = baseDataTable.table[tableID].row('.selected').data();
    }

    if (uiConfig.isMulitSelect == true) {
      baseDataTable.multiRowsHandler(tableID);
    }
    if(!$.isEmptyObject(uiConfig.amount)){
      if(typeof(uiConfig.amount)=='object'){
          if(typeof(uiConfig.amount.handler)=='function'){
            var html = uiConfig.amount.handler(data[uiConfig.amount.field]);
            baseDataTable.container[tableID].tableObj.parent().children('.nstable-bottom').children('.datatables-total').html(html);
          }
      }
    }

    if(uiConfig.onLoadSuccess){
      var returnSuccessFunc = uiConfig.onLoadSuccess;
      returnSuccessFunc(data);
    }
  });
}

//取消选中状态
baseDataTable.cancelSelectedHandler = function (tableID) {

}

//刷新table数据，并且在刷新成功之后添加一行数据
baseDataTable.reloadAddTableAJAX = function (tableID, jsonData) {
  if (typeof (jsonData) == 'undefined' || jsonData == null || $.isEmptyObject(jsonData)) {
    jsonData = baseDataTable.data[tableID].dataConfig.data;
  }
  baseDataTable.data[tableID].dataConfig.data = jsonData;
  baseDataTable.table[tableID].ajax.reload(function () {
    baseDataTable.addTableSingleRow(tableID);
  });
}
/**
*功能：重新刷新url请求
*参数：表id,url链接
**/
baseDataTable.reloadTableAjaxUrl = function (tableID, url) {
  baseDataTable.table[tableID].ajax.url(url).load();
  baseDataTable.serialNumber(tableID);
}
/**********得到所有checkbox选中值所在行的数据*****************/
baseDataTable.getCheckedData = function (tableID) {
  var checkedArr = baseDataTable.data[tableID].selectedCheckedData;
  var selectedArr = [];
  if (checkedArr.length > 0) {
    for (var check = 0; check < checkedArr.length; check++) {
      selectedArr.push(checkedArr[check]);
    }
  } else {
    nsalert(language.datatable.nsalert.uncheckLineLNeed);
  }
  return selectedArr;
}
/**
*功能：获取所有列所属的字段名 
**/
baseDataTable.getColumnsName = function (tableID) {
  var dataFieldArr = [];
  if (typeof (baseDataTable.data[tableID]) == 'undefined') {
    nsalert('getDataFieldIndex 的参数 tableID 不存在', 'error');
    return false;
  }
  var columnData = baseDataTable.data[tableID].columnConfig;
  for (var cIndex = 0; cIndex < columnData.length; cIndex++) {
    dataFieldArr.push(columnData[cIndex].data);
  }
  return dataFieldArr;
}
baseDataTable.getDataFieldIndex = baseDataTable.getColumnsName;
/**
*功能：返回当前table的所有列值对应的列标
*参数：表id
**/
baseDataTable.getColumnsNameIndex = function (tableID) {
  var columnData = baseDataTable.data[tableID].columnConfig;
  var getColumnData = {};
  for (var cIndex = 0; cIndex < columnData.length; cIndex++) {
    getColumnData[columnData[cIndex].data] = cIndex;
  }
  return getColumnData;
}
baseDataTable.getTableColumnIndex = baseDataTable.getColumnsNameIndex;
/**
**功能：设置列是否显示or隐藏
*tableID 表id
*isShow 显示or 隐藏
*columnsIndex 要显示 or 隐藏的列
**/
baseDataTable.changeColumnsVisable = function (tableID, columnsIndex, isShow) {
  var isVisable = typeof (isShow) == 'boolean' ? isShow : false;//默认隐藏
  var columnData = baseDataTable.data[tableID].columnConfig;
  if ($.isArray(columnsIndex)) {
    //如果是数组则继续
    for (var cIndex = 0; cIndex < columnsIndex.length; cIndex++) {
      if (isVisable) {
        columnData[columnsIndex[cIndex]].visible = true;
      } else {
        columnData[columnsIndex[cIndex]].visible = false;
      }
    }
    baseDataTable.table[tableID].columns(columnsIndex).visible(isShow).draw(false);
  } else {
    if (typeof (columnsIndex) == 'number') {
      if (isVisable) {
        columnData[columnsIndex].visible = true;
      } else {
        columnData[columnsIndex].visible = false;
      }
      baseDataTable.table[tableID].column(columnsIndex).visible(isShow).draw(false);
    } else {
      //无法进行识别，不可进行隐藏或显示
      nsalert(language.datatable.nsalert.verifyDataFormat);
    }
  }
}
baseDataTable.getChangeColumnIsVisible = baseDataTable.changeColumnsVisable;
/**
*功能：返回当前table的所有显示列值对应的列标
*参数：表id
**/
//导出全部，导出可见（指的是当前table可见）
baseDataTable.getVisableColumnsName = function (tableID) {
  var columnData = baseDataTable.data[tableID].columnConfig;
  var getColumnData = [];
  var columnsJson = {};
  //两种用法一种是在tab页中使用，一种是单独使用
  var visibleField = 'visible';
  if (baseDataTable.data[tableID].uiConfig.isUseTabs) {
    //是tab页状态使用
    visibleField = 'isVisableColumn';
  }
  for (var cIndex = 0; cIndex < columnData.length; cIndex++) {
    if (columnData[cIndex][visibleField]) {
      getColumnData.push(columnData[cIndex]);
    }
  }
  baseDataTable.data[tableID].visibleColumnLength = getColumnData.length;
  for (var cellIndex = 0; cellIndex < getColumnData.length; cellIndex++) {
    if (getColumnData[cellIndex].data) {
      columnsJson[getColumnData[cellIndex].data] = cellIndex;
    }
  }
  return columnsJson;
}
baseDataTable.getAllColumnIndex = baseDataTable.getVisableColumnsName;


//功能：返回表格中所有可见列值字段的下标和标题
baseDataTable.getColumnAttribute = function (tableID) {
  var columnData = baseDataTable.data[tableID].columnConfig;
  var getColumnData = [];
  var columnsJson = {};
  //两种用法一种是在tab页中使用，一种是单独使用
  var visibleField = 'visible';
  if (baseDataTable.data[tableID].uiConfig.isUseTabs) {
    //是tab页状态使用
    visibleField = 'isVisableColumn';
  }
  for (var cIndex = 0; cIndex < columnData.length; cIndex++) {
    if (columnData[cIndex][visibleField]) {
      getColumnData.push(columnData[cIndex]);
    }
  }
  baseDataTable.data[tableID].visibleColumnLength = getColumnData.length;
  for (var cellIndex = 0; cellIndex < getColumnData.length; cellIndex++) {
    if (getColumnData[cellIndex].data) {
      var type = 'normal';
      if (!$.isEmptyObject(getColumnData[cellIndex].formatHandler)) {
        var formatType = getColumnData[cellIndex].formatHandler.type;
        switch (formatType) {
          case 'date':
            type = 'date';
            break;
        }
      }
      var json = { index: cellIndex, title: getColumnData[cellIndex].title, type: type };
      columnsJson[getColumnData[cellIndex].data] = json;
    }
  }
  return columnsJson;
}
//高级搜索
/*************
var searchJson = {
	tableID:tableID,
	type:'global',
	value:''
}
var searchJson = {
	tableID:tableID,
	type:'column',
	value:{
		index:[0,1],
		index:['deffect','disorder'],
		value:string
	}
}
****************/
/**
**功能：调用datatable自带的搜索功能
**/
baseDataTable.getSearchHandler = function (searchJson) {
  //调用datatable自带的搜索功能
  //{tableID:'',value:'',type:'global/column'}
  //type默认是global , 如果type为column，则是指定列搜索，value需要是object{{index:0,value:'a'},{index:1,value:'b'}}
  var tableID = searchJson.tableID;
  var table = baseDataTable.table[tableID];
  if (searchJson.type == 'global' || typeof (searchJson.type) != 'string') {
    //默认是全局
    table.search(searchJson.value).draw(false);
  } else if (searchJson.type == 'column') {
    if (typeof (searchJson.value) == 'object') {
      var indexArr = [];
      if ($.isArray(searchJson.value.index)) {
        //是数组
        var tempArr = searchJson.value.index;
        var allField = baseDataTable.getAllColumnIndex(tableID);
        for (var i = 0; i < tempArr.length; i++) {
          if(typeof(allField[tempArr[i]])!='undefined'){
            indexArr.push(allField[tempArr[i]]);
          }
        }
      }
      table.column(indexArr).search(searchJson.value.value).draw(false);
    }
  }
  if(baseDataTable.data[tableID].dataConfig.isSerialNumber){
    baseDataTable.serialAutoNumber(tableID);
  }
  if(searchJson.value){
   baseDataTable.table[tableID].page(1).draw(false);
  }
}
/**
**功能：读取单行选中行的数据
**/
baseDataTable.getSingleRowSelectedData = function (tableID, istip) {
  //var singleRowData = baseDataTable.table[tableID].row('.selected').data();
  var singleRowData = baseDataTable.container[tableID].dataObj;
  istip = typeof (istip) == 'boolean' ? istip : true;
  if ($.isEmptyObject(singleRowData)) {
    singleRowData = null;
    if (istip) {
      nsalert(language.datatable.nsalert.uncheckLine);
    }
  }
  return singleRowData;
}
/**
*功能：获取所有选中行的数据,读取多行选中值
*参数：表id
*选中行可能是多行，所以返回是数组格式
**/
baseDataTable.getTableSelectData = function (tableID, istip) {
  istip = typeof (istip) == 'boolean' ? istip : true;
  if (typeof (tableID) == 'undefined') {
    nsalert('tableID获取不到', 'error');
    return;
  }
  var rowsData = baseDataTable.container[tableID].multiData;
  var primaryID = baseDataTable.data[tableID].primaryID;
  //var rowsData = baseDataTable.table[tableID].rows('.selected').data();
  if (rowsData.length > 0) {
    return rowsData;
  } else {
    if (istip) {
      nsalert(language.datatable.nsalert.uncheckLineOne, 'error');
    }
    return null;
  }
}
/**
*功能：添加多行数据
*参数：表id,要添加的数组值
*添加的行字段必须匹配值
**/
baseDataTable.addTableRowData = function (tableID, rowArr) {
  var columnField = baseDataTable.data[tableID].columnConfig;
  for (var cIndex = 0; cIndex < columnField.length; cIndex++) {
    var cField = columnField[cIndex].data;
    for (var rowIndex = 0; rowIndex < rowArr.length; rowIndex++) {
      if (typeof (rowArr[rowIndex][cField]) == 'undefined') {
        //如果当前字段值未定义，则默认赋值为空
        rowArr[rowIndex][cField] = '';
      }
    }
  }
  baseDataTable.table[tableID].rows.add(rowArr).draw(false);
  var trObj = trObj = $('#' + tableID + ' tbody tr').not('.current-small-count').not('.tr-empty-row');
  trObj.children('th').each(function (key, value) { $(this).html(key + 1) });
}
/**
*功能：添加成功之后删除空行
*
*
**/
baseDataTable.delEmptyRowData = function (tableID, delID) {
  var trObj = baseDataTable.container[tableID].trObj;
  $.each(trObj, function (key, value) {
    var trData = baseDataTable.table[tableID].row($(this)).data();
    if (typeof (trData[delID]) == 'string') {
      if (trData[delID] == '') {
        $(this).remove();
        baseDataTable.table[tableID].rows($(this)).remove();
        //baseDataTable.addTableSingleRow(tableID);
      }
    }
  })
}
/**
*功能：添加单行数据
*参数：表id
*添加的行为空行
**/
baseDataTable.addTableSingleRow = function (tableID) {
  var columnData = baseDataTable.data[tableID].columnConfig;
  var dataJson = {};
  for (var column = 0; column < columnData.length; column++) {
    dataJson[columnData[column].data] = "";
  }
  var rowNode = baseDataTable.table[tableID].row.add(dataJson).draw(false).node();
  $(rowNode).attr('ns-tr', 'new');
  var trObj = trObj = $('#' + tableID + ' tbody tr').not('.current-small-count').not('.tr-empty-row');
  trObj.children('th').each(function (key, value) { $(this).html(key + 1) });
}

/****************删除选中行 start**************************************/
/******
此方法仅支持单选情况下的删除
******/
//删除选中行
baseDataTable.delSelectedRowdata = function (tableID) {
  var selectedData = baseDataTable.table[tableID].row('.selected');
  if (selectedData.length > 0) {
    selectedData.remove().draw(false);
  } else {
    nsalert(language.datatable.nsalert.uncheckLineOneDel);
  }
}
baseDataTable.delRowData = function (tableID, trObj) {
  var $trObj = trObj;
  $trObj.remove();
  baseDataTable.table[tableID].row($trObj).remove().draw(false);
  //var newTrObj = $('#'+tableID+' tbody tr').not('.current-small-count').not('.tr-empty-row');
  //newTrObj.children('th').each(function(key,value){$(this).html(key + 1)})
	/*baseDataTable.container[tableID].trObj = newTrObj;
	baseDataTable.data[tableID].pagelength = newTrObj.length;
	var currentIndex = Number(baseDataTable.table[tableID].row(trObj).index());
	var allTableData = baseDataTable.allTableData(tableID);
	allTableData.splice(currentIndex,1);
	baseDataTable.countTotal(tableID);
	baseDataTable.isFillEmptyRow(tableID);*/
}
/**************删除选中行 end***************************************/
/**
*功能：删除行数据
*参数：表id,删除行对象
*第一行不可删
*移除当前要删除的行
*从所有数据中移除当前要删除行的数据
*重新获取行对象
*重新对table排序
*重新计算列值
**/
baseDataTable.delTableRowData = function (tableID, trObj) {
  var $trObj = trObj;
  var oldTrObj = baseDataTable.container[tableID].trObj;
  if (oldTrObj.length > 1) {
    $trObj.remove();
    baseDataTable.table[tableID].rows($trObj).remove();
    var newTrObj = $('#' + tableID + ' tbody tr').not('.current-small-count').not('.tr-empty-row');
    baseDataTable.container[tableID].trObj = newTrObj;
    baseDataTable.data[tableID].pagelength = newTrObj.length;
    var currentIndex = Number(baseDataTable.table[tableID].row(trObj).index());
    var allTableData = baseDataTable.allTableData(tableID);
    allTableData.splice(currentIndex, 1);
    newTrObj.children('th').each(function (key, value) { $(this).html(key + 1) })
    baseDataTable.countTotal(tableID);
  } else if (oldTrObj.length == 1) {
    $trObj.remove();
    baseDataTable.table[tableID].rows($trObj).remove();
    //baseDataTable.addTableSingleRow(tableID);
  }
}

/**
*功能：获取所有table数据值
*参数：表id
*返回格式为数组
**/
baseDataTable.allTableData = function (tableID, primaryID, isvalidate) {
  var isPassValidate = isvalidate ? isvalidate : false;
  //是否验证，若不验证直接获取所有数据
  if (isPassValidate == false) {
    var selectDataArr = baseDataTable.getAllTableData(tableID, primaryID);
    return selectDataArr;
  } else {
    var isPassValidate = baseDataTable.validateCustomizePlane(tableID, primaryID);
    if (isPassValidate) {
      var selectDataArr = baseDataTable.getAllTableData(tableID, primaryID);
      return selectDataArr;
    } else {
      return false;
    }
  }
}
baseDataTable.getAllTableData = function (tableID, primaryID) {
  var allDataArr = baseDataTable.table[tableID].data();
  var selectDataArr = [];
  for (var dataIndex = 0; dataIndex < allDataArr.length; dataIndex++) {
    //把得到的所有值都拼接放到定义的数组当中
    selectDataArr.push(allDataArr[dataIndex]);
  }
  //如果定义了主键id
  if (typeof (primaryID) == 'string') {
    //并且主键id不为空的情况
    if (primaryID !== '') {
      var returnDataArr = [];
      for (var selIndex = 0; selIndex < selectDataArr.length; selIndex++) {
        if (selectDataArr[selIndex][primaryID] !== '') {
          returnDataArr.push(selectDataArr[selIndex]);
        }
      }
      selectDataArr = returnDataArr;
    }
  }
  return selectDataArr;
}

//销毁
baseDataTable.destroy = function(tableId,isAutoHeight){
  //是否需要自动设置高度
  var autoHeight = typeof(isAutoHeight)=='boolean' ? isAutoHeight : false;
  var height = baseDataTable.data[tableId].uiConfig.$container.outerHeight();
  baseDataTable.data[tableId].uiConfig.$container.empty();
  if(autoHeight){
    baseDataTable.data[tableId].uiConfig.$container.css('height',height+'px');
  }
  nsTable.table[tableId].destroy();
  nsTable.data[tableId] = {};
  nsTable.container[tableId] = {};
}

/**
 * 导出数据
 * 
 * @returns
 */
function getIsExistSelectedTable(tableDom, tempTableDom, isSelected) {
  var tableID = tableDom.attr('id');
  var thDom = tableDom.find('thead').find("th");
  var columnsField = baseDataTable.getVisableColumnsName(tableID);//所有可见列字段
  var thendHtml = '';
  var theadsName = baseDataTable.getColumnAttribute(tableID);
  for (var theadI in theadsName) {
    var innerHtmlStr = theadsName[theadI].title;
    if (theadsName[theadI].index == 0) {
      innerHtmlStr = language.datatable.pageStatus.serialNumber;
    }
    thendHtml += '<th>' + innerHtmlStr + '</th>';
  }
	/*for(var th=0; th<thDom.length; th++){
		var innerHtmlStr = thDom[th].innerHTML;
		if(th==0){
			innerHtmlStr = language.datatable.pageStatus.serialNumber;
		}
		innerHtmlStr.replace(/[\r\n]/g,"");
		thendHtml+='<th>'+innerHtmlStr+'</th>';
	}*/
  thendHtml = '<thead><tr>' + thendHtml + '</tr></thead>';
  var tdField = [];
  for (var tdI in columnsField) {
    if (columnsField[tdI] != 0) {
      tdField.push(tdI);
    }
  }
  var uiConfig = baseDataTable.data[tableID].uiConfig;
  var isMulitSelect = false;
  var tbodyHtml = '';
  if (uiConfig.isSingleSelect) {
    //单选
    isMulitSelect = false;
  }
  if (uiConfig.isMulitSelect) {
    //多选
    isMulitSelect = true;
  }
  var isReturn = true;
  if (isSelected) {
    //选中，单选还是多选
    if (isMulitSelect) {
      //多选
      var multiData = baseDataTable.container[tableID].multiData;
      if (multiData.length > 0) {
        for (var i = 0; i < multiData.length; i++) {
          tbodyHtml += '<tr>';
          tbodyHtml += '<td>' + (i + 1) + '</td>';
          for (var j = 0; j < tdField.length; j++) {
            tbodyHtml += '<td>' + multiData[i][tdField[j]] + '</td>';
          }
          tbodyHtml += '</tr>';
        }
        tbodyHtml = '<tbody>' + tbodyHtml + '</tbody>';
      } else {
        isReturn = false;
      }
    } else {
      var data = baseDataTable.container[tableID].dataObj;
      if (!$.isEmptyObject(data)) {
        tbodyHtml += '<tr>';
        tbodyHtml += '<td>1</td>';
        for (var j = 0; j < tdField.length; j++) {
          tbodyHtml += '<td>' + data[tdField[j]] + '</td>';
        }
        tbodyHtml += '</tr>';
      } else {
        isReturn = false;
      }
    }
  } else {
    //不选中
    var tbodyDom = tableDom.find('tbody').find("tr");
    for (var tr = 0; tr < tbodyDom.length; tr++) {
      if (!$(tbodyDom[tr]).hasClass('selected')) {
        var trHtml = '';
        for (var td = 0; td < $(tbodyDom[tr]).children().length; td++) {
          trHtml += '<td>' + $(tbodyDom[tr]).children()[td].innerHTML.replace(/[\r\n]/g, ""); +'</td>';
        }
        trHtml = '<tr>' + trHtml + '</tr>';
        tbodyHtml += trHtml;
      }
    }
		/*var allData = baseDataTable.getAllTableData(tableID);
		for(var i=0; i< allData.length; i++){
			tbodyHtml += '<tr>';
			tbodyHtml += '<td>'+(i+1)+'</td>';
			for(var j=0; j<tdField.length; j++){
				tbodyHtml += '<td>'+allData[i][tdField[j]]+'</td>';
			}
			tbodyHtml += '</tr>';
		}
		tbodyHtml = '<tbody>'+tbodyHtml+'</tbody>';*/
  }
  tempTableDom.html(thendHtml + tbodyHtml);
  return isReturn;
}
//导出table表格的数据
function getExportTable(tableDom, tempTableDom, isAll) {
  var tempTableForExportHtml = '';
  var tableID = tableDom.attr('id');
  var thDom = tableDom.find('thead').find("th");
  var thendHtml = '';
  var theadsName = baseDataTable.getColumnAttribute(tableID);
  for (var theadI in theadsName) {
    var innerHtmlStr = theadsName[theadI].title;
    if (theadsName[theadI].index == 0) {
      innerHtmlStr = language.datatable.pageStatus.serialNumber;
    }
    thendHtml += '<th>' + innerHtmlStr + '</th>';
  }
	/*for(var th=0; th<thDom.length; th++){
		var innerHtmlStr = thDom[th].innerHTML;
		if(th==0){
			innerHtmlStr = language.datatable.pageStatus.serialNumber;
		}
		innerHtmlStr.replace(/[\r\n]/g,"");
		thendHtml+='<th>'+innerHtmlStr+'</th>';
	}*/
  thendHtml = '<thead><tr>' + thendHtml + '</tr></thead>';
  if (isAll) {
    //导出全部数据
    var columnsField = theadsName;//所有可见列字段
    var tdField = [];
    for (var tdI in columnsField) {
      if (columnsField[tdI].index != 0) {
        //第一个下标不显示输出
        tdField.push(tdI);
      }
    }
    var allData = baseDataTable.getAllTableData(tableID);

    var tbodyHtml = '';
    for (var i = 0; i < allData.length; i++) {
      tbodyHtml += '<tr>';
      tbodyHtml += '<td>' + (i + 1) + '</td>';
      for (var j = 0; j < tdField.length; j++) {
        var tdStr = allData[i][tdField[j]];
        if (columnsField[tdField[j]].type == 'date') {
          tdStr = commonConfig.formatDate(tdStr, 'YYYY-MM-DD');
        }
        tbodyHtml += '<td style="mso-number-format:\@;">' + tdStr + '</td>';
      }
      tbodyHtml += '</tr>';
    }
    tbodyHtml = '<tbody>' + tbodyHtml + '</tbody>';
  } else {
    var tbodyDom = tableDom.find('tbody').find("tr");
    for (var tr = 0; tr < tbodyDom.length; tr++) {
      var trHtml = '';
      for (var td = 0; td < $(tbodyDom[tr]).children().length; td++) {
        trHtml += '<td>' + $(tbodyDom[tr]).children()[td].innerHTML.replace(/[\r\n]/g, ""); +'</td>';
      }
      trHtml = '<tr>' + trHtml + '</tr>';
      tbodyHtml += trHtml;
    }
    tbodyHtml = '<tbody>' + tbodyHtml + '</tbody>';
  }
  tempTableDom.html(thendHtml + tbodyHtml);
}

baseDataTable.sortData = function (targetSotr, table, data, selectedIndex) {
  var saveData = {};
  var cpage = table.page();
  for (var selindex = 0; selindex < selectedIndex.length; selindex++) {
    var selIndex = selectedIndex[selindex];
    if (targetSotr == 'up') {
      //上移
      if ((selIndex - 1) >= 0) {
        table.clear();
        data[selIndex].disorder = Number(data[selIndex].disorder) - 1;
        var upIndex = selIndex - 1;
				/*var newProjectJsonStr = jQuery.parseJSON('{"id":'+upIndex+'}');
				baseDataTable.cacheSelectData[upIndex] = newProjectJsonStr;
				baseDataTable.cacheSelectData[upIndex].selIndex = selIndex;
				baseDataTable.cacheSelectData[upIndex].move = 'up';
				baseDataTable.cacheSelectData[upIndex].data = data[selIndex]; */
        data[(selIndex - 1)].disorder = Number(data[selIndex].disorder) + 1;
        data.splice((selIndex - 1), 0, data.splice(selIndex, 1)[0]);

        var csaveData = { disorder: data[(selIndex - 1)].disorder };
        saveData[data[(selIndex - 1)].disorder] = { disorder: data[(selIndex - 1)].disorder };

        table.rows.add(data).draw();
        table.order([[5, 'asc']]).draw();
        baseDataTable.sortDataComplete();
      } else {
        nsalert(language.datatable.nsalert.alreadyTop);
      }
    } else if (targetSotr == 'down') {
      //下移
      if ((selIndex + 1) < data.length) {
        table.clear();
        data[selIndex].disorder = Number(data[selIndex].disorder) + 1;
        var downIndex = selIndex + 1;
				/*var newProjectJsonStr = jQuery.parseJSON('{"id":'+downIndex+'}');
				baseDataTable.cacheSelectData[downIndex] = newProjectJsonStr;
				baseDataTable.cacheSelectData[downIndex].selIndex = selIndex;
				baseDataTable.cacheSelectData[downIndex].move = 'down';
				baseDataTable.cacheSelectData[downIndex].data = data[selIndex];*/
        data[(selIndex + 1)].disorder = Number(data[selIndex].disorder) - 1;
        data.splice((selIndex + 1), 0, data.splice(selIndex, 1)[0]);

        var csaveData = { disorder: data[(selIndex + 1)].disorder };
        saveData[data[(selIndex + 1)].disorder] = { disorder: data[(selIndex + 1)].disorder };

        table.rows.add(data).draw();
        //  table.order([[5,'asc']]).draw();
        baseDataTable.sortDataComplete();
      } else {
        nsalert(language.datatable.nsalert.inEnd);
      }
    }
  }
  return saveData;
}

function isObjectValueEqual(obj1, obj2) {
  //obj1和obj2必须是对象类型
  var isEqual = true;
  var obj1Length = 0;
  var obj2Length = 0;
  if (typeof (obj1) != 'object' || typeof (obj2) != 'object') {
    nsalert('nsVals.isEqualObject函数只用于比较object对象', 'error');
    if (debugerMode) {
      console.error('nsVals.isEqualObject函数只用于比较object对象');
      console.error(obj1);
      console.error(obj2);
    }
    return false;
  }
  //equalObject start--------------------------
  function equalObject(subObj1, subObj2) {
    if (typeof (subObj1) == 'undefined' || typeof (subObj2) == 'undefined') {
      return false;
    }
    switch (typeof (subObj1)) {
      case 'string':
      case 'number':
      case 'boolean':
        if (subObj1 != subObj2) {
          return false;
        }
        break;
      case 'function':
        //如果是function则不比较
        break;
      case 'object':
        if (subObj1 == null) {
          if (subObj2 != null) {
            return false;
          } else if (subObj2 == null) {
            //两个都是null 则相等
          }
        } else if ($.isArray(subObj1)) {
          //如果是数组
          if (!$.isArray(subObj2)) {
            //另一个不是数组
            return false;
          } else {
            //两个都是数组
            if (subObj1.length != subObj2.length) {
              //长度不同则不同
              return false;
            } else {
              //长度相同则比较所有的值
              for (var arrI = 0; arrI < subObj1.length; arrI++) {
                if (typeof (subObj1[arrI]) != typeof (subObj2[arrI])) {
                  //如果类型不同则不同
                  return false;
                } else {
                  //类型相同比较值
                  isEqual = equalObject(subObj1[arrI], subObj2[arrI]);
                  if (isEqual == false) {
                    return false;
                  }
                }
              }
            }
          }
        } else {
          //如果不是数组，就是普通的object
          var subObj1Length = 0;
          var subObj2Length = 0;
          for (sub1I in subObj1) {
            subObj1Length++;
            if (typeof (subObj2[sub1I]) == 'undefined') {
              return false;
            } else {
              isEqual = equalObject(subObj1[sub1I], subObj2[sub1I]);
              if (isEqual == false) {
                return false;
              }
            }
          }
          for (sub2I in subObj2) {
            subObj2Length++;
          }
          if (subObj1Length != subObj2Length) {
            return false;
          }
        }
        break;
    }
    return true;
  }
  //equalObject end--------------------------
  for (i in obj1) {
    //如果obj2没有该对象则不相等
    if (typeof (obj2[i]) == 'undefined') {
      return false;
    }
    //如果obj2该对象类型不同则不相等
    if (typeof (obj1[i]) != typeof (obj2[i])) {
      return false;
    }
    //如果类型相同，则根据类型对比
    var isEqual = equalObject(obj1[i], obj2[i]);
    if (isEqual == false) {
      return false;
    }
  }
  return true;
}

//不显示任何错误信息
$.fn.dataTable.ext.errMode = 'none'; 
//以下为发生错误时的事件处理，如不处理，可不管。
/*$(‘#example‘).on( ‘error.dt‘, function ( e, settings, techNote, message ){
    //这里可以接管错误处理，也可以不做任何处理
    console.log( ‘An error has been reported by DataTables: ‘, message );
}).DataTable();*/

//0-----
(function ($) {
    function calcDisableClasses(oSettings) {
        var start = oSettings._iDisplayStart;
        var length = oSettings._iDisplayLength;
        var visibleRecords = oSettings.fnRecordsDisplay();
        var all = length === -1;
 
        // Gordey Doronin: Re-used this code from main jQuery.dataTables source code. To be consistent.
        var page = all ? 0 : Math.ceil(start / length);
        var pages = all ? 1 : Math.ceil(visibleRecords / length);
 
        var disableFirstPrevClass = (page > 0 ? '' : oSettings.oClasses.sPageButtonDisabled);
        var disableNextLastClass = (page < pages - 1 ? '' : oSettings.oClasses.sPageButtonDisabled);
 
        return {
            'first': disableFirstPrevClass,
            'previous': disableFirstPrevClass,
            'next': disableNextLastClass,
            'last': disableNextLastClass
        };
    }
 
    function calcCurrentPage(oSettings) {
        return Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength) + 1;
    }
 
    function calcPages(oSettings) {
        return Math.ceil(oSettings.fnRecordsDisplay() / oSettings._iDisplayLength);
    }
 
    var firstClassName = 'first';
    var previousClassName = 'previous';
    var nextClassName = 'next';
    var lastClassName = 'last';
    var ulClassName = 'pagination';
    var paginateClassName = 'paginate';
    var paginateInputClassName = 'form-control paginate-input';
 
    $.fn.dataTableExt.oPagination.input = {
        'fnInit': function (oSettings, nPaging, fnCallbackDraw) {
            var nUl = document.createElement('ul');
            var nFirst = document.createElement('li');
            var nPrevious = document.createElement('li');
            var nNext = document.createElement('li');
            var nLast = document.createElement('li');
            var nInput = document.createElement('input');
            var language = oSettings.oLanguage.oPaginate;
            var classes = oSettings.oClasses;
            nUl.id = ulClassName+'-'+oSettings.sTableId;
            nUl.className = ulClassName;
            nFirst.innerHTML = '<a href="#">'+language.sFirst+'</a>';
            nPrevious.innerHTML = '<a href="#">'+language.sPrevious+'</a>';
            nNext.innerHTML = '<a href="#">'+language.sNext+'</a>';
            nLast.innerHTML = '<a href="#">'+language.sLast+'</a>';
 
            nFirst.className = firstClassName + ' ' + classes.sPageButton;
            nPrevious.className = previousClassName + ' ' + classes.sPageButton;
            nNext.className = nextClassName + ' ' + classes.sPageButton;
            nLast.className = lastClassName + ' ' + classes.sPageButton;
 
            nInput.className = paginateInputClassName;
 
            if (oSettings.sTableId !== '') {
                nPaging.setAttribute('id', oSettings.sTableId + '_' + paginateClassName);
                nFirst.setAttribute('id', oSettings.sTableId + '_' + firstClassName);
                nPrevious.setAttribute('id', oSettings.sTableId + '_' + previousClassName);
                nNext.setAttribute('id', oSettings.sTableId + '_' + nextClassName);
                nLast.setAttribute('id', oSettings.sTableId + '_' + lastClassName);
            }
 
            nInput.type = 'text';
            nPaging.appendChild(nUl);
            var newUl = document.getElementById(ulClassName+'-'+oSettings.sTableId);

            nUl.appendChild(nFirst);
            nUl.appendChild(nPrevious);
            nUl.appendChild(nInput);
            nUl.appendChild(nNext);
            nUl.appendChild(nLast);
 
            $(nFirst).click(function() {
                var iCurrentPage = calcCurrentPage(oSettings);
                if (iCurrentPage !== 1) {
                    oSettings.oApi._fnPageChange(oSettings, 'first');
                    fnCallbackDraw(oSettings);
                }
                $(nInput).val(1);
            });
 
            $(nPrevious).click(function() {
                var iCurrentPage = calcCurrentPage(oSettings);
                if (iCurrentPage !== 1) {
                    oSettings.oApi._fnPageChange(oSettings, 'previous');
                    fnCallbackDraw(oSettings);
                }
                $(nInput).val(iCurrentPage-1);
            });
 
            $(nNext).click(function() {
                var iCurrentPage = calcCurrentPage(oSettings);
                if (iCurrentPage !== calcPages(oSettings)) {
                    oSettings.oApi._fnPageChange(oSettings, 'next');
                    fnCallbackDraw(oSettings);
                }
                var valueStr = iCurrentPage+1;
                if(valueStr > Math.ceil(oSettings._iRecordsTotal/oSettings._iDisplayLength)){
                  valueStr = iCurrentPage;
                }
                $(nInput).val(valueStr);
            });
 
            $(nLast).click(function() {
                var iCurrentPage = calcCurrentPage(oSettings);
                $(nInput).val(Math.ceil(oSettings._iRecordsTotal/oSettings._iDisplayLength));
                if (iCurrentPage !== calcPages(oSettings)) {
                    oSettings.oApi._fnPageChange(oSettings, 'last');
                    fnCallbackDraw(oSettings);
                }else{
                  $(nInput).val(iCurrentPage);
                }
            });
            $(nInput).val(1);
            $(nInput).keyup(function (e) {
                // 38 = up arrow, 39 = right arrow
                if (e.which === 38 || e.which === 39) {
                    this.value++;
                }
                // 37 = left arrow, 40 = down arrow
                else if ((e.which === 37 || e.which === 40) && this.value > 1) {
                    this.value--;
                }
 
                if (this.value === '' || this.value.match(/[^0-9]/)) {
                    /* Nothing entered or non-numeric character */
                    this.value = this.value.replace(/[^\d]/g, ''); // don't even allow anything but digits
                    return;
                }
 
                var iNewStart = oSettings._iDisplayLength * (this.value - 1);
                if (iNewStart < 0) {
                    iNewStart = 0;
                }
                if (iNewStart >= oSettings.fnRecordsDisplay()) {
                    iNewStart = (Math.ceil((oSettings.fnRecordsDisplay()) / oSettings._iDisplayLength) - 1) * oSettings._iDisplayLength;
                }
 
                oSettings._iDisplayStart = iNewStart;
                fnCallbackDraw(oSettings);
            });
 
            // Take the brutal approach to cancelling text selection.
            $('li', newUl).bind('mousedown', function () { return false; });
            $('li', newUl).bind('selectstart', function() { return false; });
 
            // If we can't page anyway, might as well not show it.
            var iPages = calcPages(oSettings);
            if (iPages <= 1) {
                $(nPaging).hide();
            }
        },
 
        'fnUpdate': function (oSettings) {
            if (!oSettings.aanFeatures.p) {
                return;
            }
 
            var iPages = calcPages(oSettings);
            var iCurrentPage = calcCurrentPage(oSettings);
 
            var an = oSettings.aanFeatures.p;
            if (iPages <= 1) // hide paging when we can't page
            {
                $(an).hide();
                return;
            }
 
            var disableClasses = calcDisableClasses(oSettings);
 
            $(an).show();
 
            // Enable/Disable `first` button.
            $(an).children('.' + firstClassName)
                .removeClass(oSettings.oClasses.sPageButtonDisabled)
                .addClass(disableClasses[firstClassName]);
 
            // Enable/Disable `prev` button.
            $(an).children('.' + previousClassName)
                .removeClass(oSettings.oClasses.sPageButtonDisabled)
                .addClass(disableClasses[previousClassName]);
 
            // Enable/Disable `next` button.
            $(an).children('.' + nextClassName)
                .removeClass(oSettings.oClasses.sPageButtonDisabled)
                .addClass(disableClasses[nextClassName]);
 
            // Enable/Disable `last` button.
            $(an).children('.' + lastClassName)
                .removeClass(oSettings.oClasses.sPageButtonDisabled)
                .addClass(disableClasses[lastClassName]);
 
            // Current page numer input value
            $(an).find('.form-control.paginate-input').val(iCurrentPage);
        }
    };
})(jQuery);
/* jQuery Resizable Columns v0.1.0 | http://dobtco.github.io/jquery-resizable-columns/ | Licensed MIT | Built Wed Apr 30 2014 14:24:25 */
var __bind = function (a, b) { return function () { return a.apply(b, arguments) } }, __slice = [].slice; !function (a, b) { var c, d, e, f; return d = function (a) { return parseFloat(a.style.width.replace("%", "")) }, f = function (a, b) { return b = b.toFixed(2), a.style.width = "" + b + "%" }, e = function (a) { return 0 === a.type.indexOf("touch") ? (a.originalEvent.touches[0] || a.originalEvent.changedTouches[0]).pageX : a.pageX }, c = function () { function c(c, d) { this.pointerdown = __bind(this.pointerdown, this), this.constrainWidth = __bind(this.constrainWidth, this), this.options = a.extend({}, this.defaults, d), this.$table = c, this.setHeaders(), this.restoreColumnWidths(), this.syncHandleWidths(), a(b).on("resize.rc", function (a) { return function () { return a.syncHandleWidths() } }(this)), this.options.start && this.$table.bind("column:resize:start.rc", this.options.start), this.options.resize && this.$table.bind("column:resize.rc", this.options.resize), this.options.stop && this.$table.bind("column:resize:stop.rc", this.options.stop) } return c.prototype.defaults = { selector: "tr th:visible", store: b.store, syncHandlers: !0, resizeFromBody: !0, maxWidth: null, minWidth: null }, c.prototype.triggerEvent = function (b, c, d) { var e; return e = a.Event(b), e.originalEvent = a.extend({}, d), this.$table.trigger(e, [this].concat(c || [])) }, c.prototype.getColumnId = function (a) { return this.$table.data("resizable-columns-id") + "-" + a.data("resizable-column-id") }, c.prototype.setHeaders = function () { return this.$tableHeaders = this.$table.find(this.options.selector), this.assignPercentageWidths(), this.createHandles() }, c.prototype.destroy = function () { return this.$handleContainer.remove(), this.$table.removeData("resizableColumns"), this.$table.add(b).off(".rc") }, c.prototype.assignPercentageWidths = function () { return this.$tableHeaders.each(function (b) { return function (c, d) { var e; return e = a(d), f(e[0], e.outerWidth() / b.$table.width() * 100) } }(this)) }, c.prototype.createHandles = function () { var b; return null != (b = this.$handleContainer) && b.remove(), this.$table.before(this.$handleContainer = a("<div class='rc-handle-container' />")), this.$tableHeaders.each(function (b) { return function (c, d) { var e; if (0 !== b.$tableHeaders.eq(c + 1).length && null == b.$tableHeaders.eq(c).attr("data-noresize") && null == b.$tableHeaders.eq(c + 1).attr("data-noresize")) return e = a("<div class='rc-handle' />"), e.data("th", a(d)), e.appendTo(b.$handleContainer) } }(this)), this.$handleContainer.on("mousedown touchstart", ".rc-handle", this.pointerdown) }, c.prototype.syncHandleWidths = function () { return this.$handleContainer.width(this.$table.width()).find(".rc-handle").each(function (b) { return function (c, d) { var e; return e = a(d), e.css({ left: e.data("th").outerWidth() + (e.data("th").offset().left - b.$handleContainer.offset().left), height: b.options.resizeFromBody ? b.$table.height() : b.$table.find("thead").height() }) } }(this)) }, c.prototype.saveColumnWidths = function () { return this.$tableHeaders.each(function (b) { return function (c, e) { var f; return f = a(e), null == f.attr("data-noresize") && null != b.options.store ? b.options.store.set(b.getColumnId(f), d(f[0])) : void 0 } }(this)) }, c.prototype.restoreColumnWidths = function () { return this.$tableHeaders.each(function (b) { return function (c, d) { var e, g; return e = a(d), null != b.options.store && (g = b.options.store.get(b.getColumnId(e))) ? f(e[0], g) : void 0 } }(this)) }, c.prototype.totalColumnWidths = function () { var b; return b = 0, this.$tableHeaders.each(function () { return function (c, d) { return b += parseFloat(a(d)[0].style.width.replace("%", "")) } }(this)), b }, c.prototype.constrainWidth = function (a) { return null != this.options.minWidth && (a = Math.max(this.options.minWidth, a)), null != this.options.maxWidth && (a = Math.min(this.options.maxWidth, a)), a }, c.prototype.pointerdown = function (b) { var c, g, h, i, j, k, l; return b.preventDefault(), h = a(b.currentTarget.ownerDocument), k = e(b), c = a(b.currentTarget), g = c.data("th"), i = this.$tableHeaders.eq(this.$tableHeaders.index(g) + 1), l = { left: d(g[0]), right: d(i[0]) }, j = { left: l.left, right: l.right }, this.$handleContainer.add(this.$table).addClass("rc-table-resizing"), g.add(i).add(c).addClass("rc-column-resizing"), this.triggerEvent("column:resize:start", [g, i, j.left, j.right], b), h.on("mousemove.rc touchmove.rc", function (a) { return function (b) { var c; return c = (e(b) - k) / a.$table.width() * 100, f(g[0], j.left = a.constrainWidth(l.left + c)), f(i[0], j.right = a.constrainWidth(l.right - c)), null != a.options.syncHandlers && a.syncHandleWidths(), a.triggerEvent("column:resize", [g, i, j.left, j.right], b) } }(this)), h.one("mouseup touchend", function (a) { return function () { return h.off("mousemove.rc touchmove.rc"), a.$handleContainer.add(a.$table).removeClass("rc-table-resizing"), g.add(i).add(c).removeClass("rc-column-resizing"), a.syncHandleWidths(), a.saveColumnWidths(), a.triggerEvent("column:resize:stop", [g, i, j.left, j.right], b) } }(this)) }, c }(), a.fn.extend({ resizableColumns: function () { var b, d; return d = arguments[0], b = 2 <= arguments.length ? __slice.call(arguments, 1) : [], this.each(function () { var e, f; return e = a(this), f = e.data("resizableColumns"), f || e.data("resizableColumns", f = new c(e, d)), "string" == typeof d ? f[d].apply(f, b) : void 0 }) } }) }(window.jQuery, window);