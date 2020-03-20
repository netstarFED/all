/**
 * 2019-09-23 按钮面板管理器
 */
var NetstarBtnPanelManager = {
   configs:{},
   setBtnDataEnglishNameByBtnField:function(btnFieldArray,containerId){
      var btnDataByEnglishName = {};//根据名称存储数据
      for(var fieldI=0; fieldI<btnFieldArray.length; fieldI++){
         var fieldData = btnFieldArray[fieldI];
         var functionConfig = fieldData.functionConfig ? fieldData.functionConfig : {};
         var btnData = fieldData.btn;
         if(!$.isEmptyObject(functionConfig)){
            //存在配置参数
            btnDataByEnglishName[functionConfig.englishName] = $.extend(true,{},fieldData);//根据名称存储数据
            delete btnDataByEnglishName[functionConfig.englishName].btn.dropdownType;
            delete btnDataByEnglishName[functionConfig.englishName].btn.subdata;
         }
         if(btnData.dropdownType == 'memoryDropdown'){
            for(var s=0; s<btnData.subdata.length; s++){
               var dropFunctionConfig = btnData.subdata[s].functionConfig;
               if(!$.isEmptyObject(dropFunctionConfig)){
                  //存在配置参数
                  btnDataByEnglishName[dropFunctionConfig.englishName] = btnData.subdata[s];//根据名称存储数据
               }
            }
         }
      }
      if(typeof(NetstarBtnPanelManager.configs[containerId])=='undefined'){
         NetstarBtnPanelManager.configs[containerId] = {
            run:{
               btnDataByEnglishName:btnDataByEnglishName
            }
         }
      }
   },
   setStoreDataByEnglishName:function(storeBtnFieldArray,containerId){
      if(NetstarBtnPanelManager.configs[containerId]){
         var btnDataByEnglishName = NetstarBtnPanelManager.configs[containerId].run.btnDataByEnglishName;
         for(var b=0; b<storeBtnFieldArray.length; b++){
            if(typeof(storeBtnFieldArray[b].btn.handler)=='undefined'){
               var englishName = storeBtnFieldArray[b].functionConfig.englishName;
               if(btnDataByEnglishName[englishName]){
                  storeBtnFieldArray[b].btn.handler = btnDataByEnglishName[englishName].btn.handler;
               }
            }
            var dropArr = storeBtnFieldArray[b].btn.subdata;
            if($.isArray(dropArr)){
               for(var d=0; d<dropArr.length; d++){
                  var dropBtnData = dropArr[d].btn;
                  if(typeof(dropBtnData.handler)=='undefined'){
                     var englishName = dropArr[d].functionConfig.englishName;
                     dropBtnData.handler = btnDataByEnglishName[englishName].btn.handler;
                  }
               }
            }
         }
      }
   },
   dialogBody:{
      TEMPLATE:{
         PC:{
            dragable : '<div class="pt-panel-col pt-formeditor pt-sort-panel" :ns-type="type">'
                         + '<div class="pt-container">'
                             + '<div class="pt-title">'
                                 + '<h6>{{title}}</h6>'
                             + '</div>'
                             + '<div class="pt-list">'
                                  + '<ul>'
                                     + '<li>'
                                         + '<span>行号</span>'
                                         + '<span>文本值</span>'
                                     + '</li>'
                                 + '</ul>'
                                 + '<ul v-on:drop="drop($event)" v-on:dragover="dragover($event)">'
                                       + '<li v-for="(item,i) in dragableField" :disabled=item.disabled draggable="true" :ns-type=item.attrtype :ns-index=i :ns-position=item.position :ns-englishname=item.englishName v-on:dragstart="dragstart($event)" v-on:dblclick="dblclick($event)">'
                                          + '<span :class="item.class" v-on:click="click($event)">{{i+1}}</span>'
                                          + '<span>{{item.text}}</span>'
                                       + '</li>'
                                 + '</ul>'
                             + '</div>'
                         + '</div>'
                     + '</div>',
            movedragable:'<div class="pt-panel-col pt-formeditor pt-hide-panel" :ns-type="movetype">'
                              +'<div class="pt-container">'
                                 +'<div class="pt-title"><h6>{{movetitle}}</h6></div>'
                                 +'<div class="pt-list">'
                                    +'<ul>'
                                       +'<li><span>行号</span><span>文本值</span></li>'
                                    +'</ul>'
                                    +'<ul v-on:drop="movedrop($event)" v-on:dragover="dragover($event)">'
                                       +'<li v-for="(item,i) in moveableField" draggable="true" :class="item.class" :ns-type=item.attrtype :ns-index=i :ns-position=item.position :ns-englishname=item.englishName v-on:dragstart="dragstart($event)" v-on:dblclick="moveDblclick($event)">'
                                          +'<span v-if="item.show === true">{{i+1}}</span>'
                                          +'<span>{{item.text}}</span>'
                                       +'</li>'
                                    +'</ul>'
                                    +'<div class="drag-move" v-if="moveEmpty === true">{{moveText}}</div>'
                                 +'</div>'
                              +'</div>'
                           +'</div>',
         },
         MOBILE:{},
      },
      getHtml:function(_bodyConfig){
         var template = this.TEMPLATE[_bodyConfig.templateName];
         var panel = template.dragable;
         var moveFieldPanel = template.movedragable;
         return '<div class="pt-panel"><div class="pt-container"><div class="pt-panel-row">'+panel+moveFieldPanel+'</div></div></div>';
      },
      getData:function(_btnPanelData){
         var data = {
            title:'当前按钮显示顺序',
            dragableField:_btnPanelData.dragableField,
            moveableField:_btnPanelData.moveableField,
            hideField:[],
            movetitle:'隐藏的按钮',
            type:'movebefore',
            movetype:'moveafter',
            moveText:'按等级拖放至此区域',
            moveEmpty:false
         };
         return data;
      },
      getComponentConfig:function(_btnPanelData){
         var _this = this;
         var html = _this.getHtml(_btnPanelData);
         var component = {
            template:html,
            data:function(){
               return _this.getData(_btnPanelData);
            },
            methods:{
               //排序
               sortDragableField:function(sortData){
                  /*
                     * sortData : {} 传参配置
                     * star : 开始位置 点击/拖拽的位置
                     * end : 结束位置 拖放结束的位置
                     * seat : 在拖放位置 之前/之后
                  */
                  var dragableField = this.dragableField;
                  var startData = {};//起始位置的数据
                  var endData = {};//结束位置的数据
                  var endIndex = -1;//结束位置的下标
                  var startIndex = -1;//找到开始位置的下标
                  //找到起始和结束位置进行互换
                  for(var i=0; i<dragableField.length; i++){
                     var dragData = dragableField[i];
                     if(dragData.position == Number(sortData.star)){
                        //起始位置
                        startData = dragData;
                        startIndex = i;//找到开始位置的下标
                        continue;
                     }
                     if(dragData.position == Number(sortData.end)){
                        //结束位置
                        endData = dragData;
                        endIndex = i;//结束位置的下标
                        continue;
                     }
                  }
                  if(endIndex > -1 && startIndex > -1){
                     //存在结束位置和开始位置
                     dragableField[startIndex].position = sortData.end;//互换位置
                     dragableField[endIndex].position = sortData.star;//互换位置
                     dragableField[startIndex] = dragableField.splice(endIndex,1,dragableField[startIndex])[0];
                  }
                  //console.log(dragableField)
               },
               //根据位置找数据
               getDataByDragPosition:function(position){
                  var dragableField = this.dragableField;
                  var moveData = {};
                  for(var i=0; i<dragableField.length; i++){
                     if(dragableField[i].position == position){
                        moveData = dragableField[i];
                        break;
                     }
                  }
                  return $.extend(true,{},moveData);
               },
               getDataByMovePosition:function(position){
                  var moveableField = this.moveableField;
                  var moveData = {};
                  for(var i=0; i<moveableField.length; i++){
                     if(moveableField[i].position == position){
                        moveData = moveableField[i];
                        break;
                     }
                  }
                  return $.extend(true,{},moveData);
               },
               getDataByEnglishName:function(englishName){
                  var dragableField = this.dragableField;
                  var data = {};
                  for(var i=0; i<dragableField.length; i++){
                     if(dragableField[i].englishName == englishName){
                        data = dragableField[i];
                        break;
                     }
                  }
                  return $.extend(true,{},data);
               },
               //根据englishName判断是否存在数组中
               isExistByEnglishname:function(englishName){
                  var moveableField = this.moveableField;
                  var isExist = false;//默认不存在
                  for(var i=0; i<moveableField.length; i++){
                     if(moveableField[i].englishName == englishName){
                        isExist = true;
                        break;
                     }
                  }
                  return isExist;
               },
               fillDataByModeDrop:function(_moveData){
                  var starData = _moveData.startData;
                  var endData = _moveData.endData;
                  var star = _moveData.star;
                  var end = _moveData.end;
                  var moveableField = this.moveableField;
                  if(starData.attrtype != endData.attrtype){
                     starData.attrtype = endData.attrtype;
                    
                     switch(_moveData.seat){
                        case 'after':
                           starData.show = true;
                           moveableField.splice((end+1),0,starData);
                           break;
                        case 'before':
                           starData.show = true;
                           moveableField.splice(end,0,starData);
                           break;
                        case 'child':
                           starData.parent = endData.englishName;
                           this.moveableField.splice((end+1),0,starData);
                           break;
                        case 'parent':
                           starData.show = true;
                           this.moveableField[end].parent = starData.englishName;
                           this.moveableField[end].show = false;
                           //starData.child = endData.englishName;
                           this.moveableField.splice(end,0,starData);
                           break;
                     }
                  }else{
                     var endIndex = -1;//结束位置的下标
                     var startIndex = -1;//找到开始位置的下标
                     //找到起始和结束位置进行互换
                     for(var i=0; i<moveableField.length; i++){
                        var dragData = moveableField[i];
                        if(dragData.position == Number(starData.position)){
                           //起始位置
                           startIndex = i;//找到开始位置的下标
                           continue;
                        }
                        if(dragData.position == Number(endData.position)){
                           //结束位置
                           endIndex = i;//结束位置的下标
                           continue;
                        }
                     }

                     switch(_moveData.seat){
                        case 'after':
                           moveableField[startIndex] = moveableField.splice(endIndex,1,moveableField[startIndex])[0];
                           break;
                        case 'before':
                           moveableField[startIndex] = moveableField.splice(endIndex,1,moveableField[startIndex])[0];
                           break;
                        case 'child':
                           console.log('startIndex:'+startIndex)
                           console.log('endIndex:'+endIndex)
                           moveableField[startIndex] = moveableField.splice(endIndex,1,moveableField[startIndex])[0];
                           break;
                        case 'parent':
                           moveableField[startIndex].show = true;
                           moveableField[endIndex].show = false;
                           moveableField[startIndex] = moveableField.splice(endIndex,1,moveableField[startIndex])[0];
                           break;
                     }
                  }
                  //console.log(this.moveableField)
               },
               //拖动结束
               movedrop:function(ev){
                  var star = ev.dataTransfer.getData('star');
                  var starType = ev.dataTransfer.getData('type');
                  var nsIndex = ev.dataTransfer.getData('nindex');
                  // 拖放到的容器 根据容器 确定结束位置
                  var $this = $(ev.target);
                  var $tr;
                  if(ev.target.nodeName == "LI"){
                     $tr = $this;
                  }else{
                     $tr = $this.parent('li');
                  }
                  var endposition = Number($tr.attr('ns-position'));
                  var endType = $tr.attr('ns-type');
                  var endIndex = $tr.attr('ns-index');

                  var starData = this.getDataByDragPosition(star);
                  if(starType == 'movesort'){
                     starData = this.getDataByMovePosition(star);
                  }
                  var endData = this.getDataByDragPosition(endposition);
                  if(endType == 'movesort'){
                     endData = this.getDataByMovePosition(endposition);
                  }

                  var height = $tr.height();
                  var pageY = $tr.offset().top;
                  var centerHeightY = pageY + height/2;
                  var mousePageY = ev.pageY;
                  var seat = 'after';
                  if(mousePageY < centerHeightY){
                     seat = 'before';
                  }
                  if(endposition == -1){
                     //左侧往右侧移动
                     this.moveableField = [
                        {
                           text:starData.text,
                           attrtype:'movesort',
                           position:starData.position,
                           englishName:starData.englishName,
                           class:'',
                           show:true
                        }
                     ];
                     this.dragableField.splice(nsIndex,1);
                  }else if(starType == 'sort' && endType == 'movesort'){
                     //左给右拖拽
                     this.dragableField.splice(nsIndex,1);
                     starData.show = true;
                     starData.attrtype = 'movesort';
                     starData.isChild = false;
                     switch(seat){
                        case 'after':
                           this.moveableField.splice((endIndex+1),0,starData);
                           break;
                        case 'before':
                           this.moveableField.splice(endIndex,0,starData);
                     }
                  }else if(starType == 'movesort' && endType == 'movesort'){
                     //右侧上下拖拽
                     this.moveableField[nsIndex] = this.moveableField.splice(endIndex,1,this.moveableField[nsIndex])[0];
                  }
                  this.hideField = this.moveableField;
               },
               //拖动结束
               drop:function(ev){
                  var star = ev.dataTransfer.getData('star');
                  var starType = ev.dataTransfer.getData('type');
                  var nsIndex = ev.dataTransfer.getData('nindex');
                  // 拖放到的容器 根据容器 确定结束位置
                  var $this = $(ev.target);
                  var $tr;
                  if(ev.target.nodeName == "LI"){
                     $tr = $this;
                  }else{
                     $tr = $this.parent('li');
                  }
                  var endposition = $tr.attr('ns-position');
                  var endType = $tr.attr('ns-type');
                  var endIndex = $tr.attr('ns-index');
                  // 插入位置 之前/之后
                  var seat = 'after';
                  var height = $tr.height();
                  var pageY = $tr.offset().top;
                  var centerHeightY = pageY + height/2;
                  var mousePageY = ev.pageY;
                  if(mousePageY<centerHeightY){
                      seat = 'before';
                  };

                  var starData = this.getDataByDragPosition(star);
                  if(starType == 'movesort'){
                     starData = this.getDataByMovePosition(star);
                  }
                  var endData = this.getDataByDragPosition(endposition);
                  if(endType == 'movesort'){
                     endData = this.getDataByMovePosition(endposition);
                  }

                  if(starType == 'movesort' && endType == 'sort'){
                     //左给右拖拽
                     this.moveableField.splice(nsIndex,1);
                     starData.show = true;
                     starData.attrtype = 'sort';
                     switch(seat){
                        case 'after':
                           this.dragableField.splice((endIndex+1),0,starData);
                           break;
                        case 'before':
                           this.dragableField.splice(endIndex,0,starData);
                     }
                  }else if(starType == 'sort' && endType == 'sort'){
                     //右侧上下拖拽
                     this.dragableField[nsIndex] = this.dragableField.splice(endIndex,1,this.dragableField[nsIndex])[0];
                  }
                  this.hideField = this.moveableField;
               },
               // 当某被拖动的对象在另一对象容器范围内拖动时触发此事件
               dragover: function(ev){
                  ev.preventDefault();
               },
               //开始拖动
               dragstart:function(ev){
                  var $this = $(ev.target);
                  var position = Number($this.attr('ns-position'));
                  var attrtype = $this.attr('ns-type');
                  var nindex = Number($this.attr('ns-index'));
                  ev.dataTransfer.setData("star", position);//dataTransfer对象可以用来保存被拖动的数据。它可以保存一项或多项数据、一种或多数数据类型。通谷一点讲，就是可以通过它来传输被拖动的数据，以便在拖拽结束的时候，对数据进行其他的操作
                  ev.dataTransfer.setData("type", attrtype);
                  ev.dataTransfer.setData("nindex",nindex);
               },
               //双击事件
               dblclick:function(ev){
                  var $li = $(ev.target).closest('li');
                  var nsIndex = $li.attr('ns-index');
                  var starData = $.extend(true,{},this.dragableField[nsIndex]);
                  starData.show = true;
                  starData.attrtype = 'movesort';
                  starData.isChild = false;
                  var isContinue = false;
                  if(this.moveableField.length == 1){
                     if(this.moveableField[0].position == -1){
                        this.moveableField = [starData];
                     }else{
                        isContinue = true;
                     }
                  }else{
                     isContinue = true;
                  }
                  this.dragableField.splice(nsIndex,1);//从当前移除
                  if(isContinue){
                     this.moveableField.push(starData);
                  }
                  this.hideField = this.moveableField;
               },
               moveDblclick:function(ev){
                  var $li = $(ev.target).closest('li');
                  var nsIndex = $li.attr('ns-index');
                  var data = $.extend(true,{},this.moveableField[nsIndex]);
                  data.attrtype = 'sort';
                  this.moveableField.splice(nsIndex,1);//从当前移除
                  this.dragableField.push(data);
                  if(this.moveableField.length == 0){
                     this.moveableField = [{text:'暂无数据',attrtype:'',position:-1,englishName:'',class:'pt-nodata',show:false}];
                  }else{
                     this.hideField = this.moveableField;
                  }
               },
               //单击事件
               click:function(ev){
                  var $li = $(ev.target).closest('li');
                  if($li.index()> 0){
                     $(ev.target).toggleClass('select');
                     var nindex = $li.attr('ns-index');
                     if($(ev.target).hasClass('select')){
                        this.dragableField[nindex].isChild = true;
                     }else{
                        this.dragableField[nindex].isChild = false;
                        var englishName = $li.attr('ns-englishname');
                     }
                  }
               }
            }
         };
         return component;
      },
      init:function(_btnPanelData,_runData){
         /**
          * 左侧上下进行拖拽改变的按钮的显示顺序
          * 左侧拖拽到右侧可以进行二级结构的拖拽
          */
         var _this = this;
         _this.panelData = _runData;
         //console.log(_btnPanelData)
        // console.log(_runData)
       
         var vueComponentConfig = _this.getComponentConfig(_btnPanelData);
         $('#'+_btnPanelData.id).html('<table-panel></table-panel>');
         var vuePanel = new Vue({
            el:'#'+_btnPanelData.id,
            components:{
               'table-panel':vueComponentConfig
            }
         });
         _this.vueObj = vuePanel.$children[0];
         _this.vueConfig = vueComponentConfig;
      }
   },
   setDefault:function(_config){
      var btnDataByEnglishName = {};//根据名称存储数据
      var dragableField = [];//可拖拽的按钮列

      var fieldArray = store.get('dialog-'+_config.containerId);//从缓存中读取
      var hideFieldArray = store.get('hide-dialog-'+_config.containerId);
      if(!$.isArray(fieldArray)){fieldArray = [];}
      if(!$.isArray(hideFieldArray)){hideFieldArray = [];}
      if(fieldArray.length == 0){
            if(hideFieldArray.length == _config.field){

            }else{
               fieldArray = _config.field;
            }
      }else{
         this.setStoreDataByEnglishName(fieldArray,_config.containerId);
      }
      var increaseNum = 0;
      for(var fieldI=0; fieldI<fieldArray.length; fieldI++){
         var fieldData = fieldArray[fieldI];
         var functionConfig = fieldData.functionConfig ? fieldData.functionConfig : {};
         var btnData = fieldData.btn;
         if(!$.isEmptyObject(functionConfig)){
            //存在配置参数
            btnDataByEnglishName[functionConfig.englishName] = $.extend(true,{},fieldData);//根据名称存储数据
            delete btnDataByEnglishName[functionConfig.englishName].btn.dropdownType;
            delete btnDataByEnglishName[functionConfig.englishName].btn.subdata;
            dragableField.push({
               englishName:functionConfig.englishName,
               text:btnData.text,
               position:increaseNum,
               attrtype:'sort',//左侧上下进行拖拽是排序
               disabled:false,//默认不禁用
            });
            increaseNum++;
         }
         if(btnData.dropdownType == 'memoryDropdown'){
            for(var s=0; s<btnData.subdata.length; s++){
               var dropBaseData = btnData.subdata[s].btn;
               var dropFunctionConfig = btnData.subdata[s].functionConfig;
               if(!$.isEmptyObject(dropFunctionConfig)){
                  //存在配置参数
                  btnDataByEnglishName[dropFunctionConfig.englishName] = btnData.subdata[s];//根据名称存储数据
                  dragableField.push({
                     englishName:dropFunctionConfig.englishName,
                     text:dropBaseData.text,
                     position:increaseNum,
                     optionfid:s,
                     attrtype:'sort',//左侧上下进行拖拽是排序
                     //disabled:false,//默认不禁用
                     class:'select',
                     isChild:true,
                  });
                  increaseNum++;
               }
            }
         }
      }

      var moveableField = [];
      if(hideFieldArray.length > 0){
         this.setStoreDataByEnglishName(hideFieldArray,_config.containerId);
         for(var hideI=0; hideI<hideFieldArray.length; hideI++){
            var fieldData = hideFieldArray[hideI];
            var functionConfig = fieldData.functionConfig ? fieldData.functionConfig : {};
            var btnData = fieldData.btn;
            if(!$.isEmptyObject(functionConfig)){
               //存在配置参数
               btnDataByEnglishName[functionConfig.englishName] = fieldData;//根据名称存储数据
               moveableField.push({
                  englishName:functionConfig.englishName,
                  text:btnData.text,
                  position:hideI,
                  attrtype:'movesort',//左侧上下进行拖拽是排序
                  //disabled:false,//默认不禁用
                  show:true
               });
            }
         }
      }else{
         moveableField = [{text:'暂无数据',attrtype:'',position:-1,englishName:'',class:'pt-nodata',show:false}]
      }

      var runData = {
         package:_config.package,//包名
         templateConfig:NetstarTemplate.templates.configs[_config.package],//模板配置
         dragableField:dragableField,
         moveableField:moveableField,
         btnDataByEnglishName:btnDataByEnglishName,
         id:'dialog-'+_config.containerId,//运行参数中弹出框的容器id
         readonlyExpression:_config.readonlyExpression,
         hiddenExpression:_config.hiddenExpression,
      };
      return runData;
   },
   isExistDropdownSubdataByEnglishName:function(subdataArr,englishName){
      var isExist = false;//默认不存在
      for(var i=0; i<subdataArr.length; i++){
         var functionConfig = subdataArr[i].functionConfig ? subdataArr[i].functionConfig : {};
         if(functionConfig.englishName == englishName){
            isExist = true;
            break;
         }
      }
      return isExist;
   },
   saveBtnByDialogPanel:function(containerId){
      var btnPanelRunData = NetstarBtnPanelManager.configs[containerId].run;//当前面板运行时参数
      var btnDataByEnglishName = btnPanelRunData.btnDataByEnglishName;//根据名称存储数据
      var btnFieldArray = [];
      var hideFieldArray = [];
      var increaseNum = 0;
      var dragableField = NetstarBtnPanelManager.dialogBody.vueObj.dragableField;
      var hideField = NetstarBtnPanelManager.dialogBody.vueObj.moveableField;
      for(var i=0; i<dragableField.length; i++){
         var dataObj = dragableField[i];
         var isChild = typeof(dataObj.isChild)=='boolean' ? dataObj.isChild : false;
         var englishName =dataObj.englishName;
         if(isChild){
            btnFieldArray[increaseNum-1].btn.dropdownType = 'memoryDropdown';
            if(!$.isArray(btnFieldArray[increaseNum-1].btn.subdata)){
               btnFieldArray[increaseNum-1].btn.subdata = [];  
            }
            //判断当前元素是否存在于数组中如果不存在在追加
            var isExist = this.isExistDropdownSubdataByEnglishName(btnFieldArray[increaseNum-1].btn.subdata,englishName);
            if(!isExist){
               btnFieldArray[increaseNum-1].btn.subdata.push(btnDataByEnglishName[englishName]);
            }
         }else{
            /*if(increaseNum > 0){
               if(btnFieldArray[increaseNum-1].btn.dropdownType == 'memoryDropdown'){
                  delete btnFieldArray[increaseNum-1].btn.dropdownType;
                  delete btnFieldArray[increaseNum-1].btn.subdata;
               }
            }*/
            btnFieldArray.push(btnDataByEnglishName[englishName]);
            increaseNum++;
         }
      }
      if(!$.isArray(hideField)){hideField = [];}
      if(hideField.length > 0){
         for(var h=0; h<hideField.length; h++){
            var englishName = hideField[h].englishName;
            if(btnDataByEnglishName[englishName]){
               hideFieldArray.push(btnDataByEnglishName[englishName]);
            }
         }
      }
      var btnRootJson = {};
      var btnRootData = btnPanelRunData.templateConfig.btnKeyFieldJson.root;
      btnRootJson[btnRootData.id] = {
         id:btnRootData.id,
         field:btnFieldArray,
         operatorObject:'dialogpanel',
         readonlyExpression:btnRootData.readonlyExpression,
         hiddenExpression:btnRootData.hiddenExpression,
      };
      store.set(btnPanelRunData.id,btnFieldArray);//记录到缓存
      store.set('hide-'+btnPanelRunData.id,hideFieldArray);//隐藏按钮
      NetstarTemplate.commonFunc.btns.initBtns(btnRootJson,btnPanelRunData.templateConfig,false);//初始化按钮组件
      NetstarComponent.dialog[btnPanelRunData.id].vueConfig.close();//关闭弹出框
   },
   saveBtnPanel:function(_btnPanelData,containerId){
      //执行按钮初始化
      var btnPanelRunData = NetstarBtnPanelManager.configs[containerId].run;//当前面板运行时参数
      var btnRootData = btnPanelRunData.templateConfig.btnKeyFieldJson.root;
      var btnFieldArray = NetstarBtnPanelManager.configs[containerId].original.field;
      var btnRootJson = {};
      btnRootJson[btnRootData.id] = {
         id:btnRootData.id,
         field:btnFieldArray,
         //operatorObject:'dialogpanel',
         readonlyExpression:btnRootData.readonlyExpression,
         hiddenExpression:btnRootData.hiddenExpression,
      };
      //store.clear(btnPanelRunData.id);
      //store.clear('hide-'+btnPanelRunData.id);
      store.set(btnPanelRunData.id,[]);//记录到缓存
      store.set('hide-'+btnPanelRunData.id,[]);//隐藏按钮
      NetstarTemplate.commonFunc.btns.initBtns(btnRootJson,btnPanelRunData.templateConfig,false);//初始化按钮组件
      NetstarComponent.dialog[btnPanelRunData.id].vueConfig.close();//关闭弹出框
   },
   init:function(_config,isCache){
      /****
       * _config.package  string  包名
       * _config.containerId string 按钮容器的id
       * _config.field array 按钮字段配置
       * isCache boolean  是否记录缓存
       * ['save','saveSubmit']//拖拽前
       * ['saveSubmit':{parent:'save',index:0}] 拖拽后两个按钮合并到一组
       * 左侧上下进行拖拽改变的按钮的显示顺序
       * 左侧拖拽到右侧可以进行二级结构的拖拽
       */
      var _this = this;
      isCache = typeof(isCache)=='boolean' ? isCache : true;//默认记录缓存
      
      var containerId;//容器id
      if(_config.containerId){
         containerId = _config.containerId;
      }else{
         containerId = 'netstar-btnpanelmanager-dialog';//没有定义containerId给个默认值
      }
      _config.containerId = containerId;
      var runData = _this.setDefault(_config);//根据初始化进来的参数 配置当前面板需要的配置参数

      //根据容器id存储初始化进来的默认配置参数
      _this.configs[containerId] = {
         original:_config,//初始化进来的参数
         run:runData,//当前面板运行时参数
      };
      
      //开始调用弹出框
      var dialogConfig = {
         id : runData.id,
         title : '按钮面板管理',
         templateName : 'PC',
         height:800,
         width:800,
         shownHandler : function(_showConfig){
            var obj = {
               id: _showConfig.config.bodyId,//填充内容的容器id
               containerId : _showConfig.config.id,//弹出框容器id
               btnPanelManagerId:_config.containerId,//按钮容器id
               templateName : 'PC',
               dragableField:$.extend(true,[],runData.dragableField),
               moveableField:$.extend(true,[],runData.moveableField),
            };
            NetstarBtnPanelManager.dialogBody.init(obj,runData);//填充内容
            
            //输出按钮
            var btnConfig = {
               id:_showConfig.config.footerIdGroup,
               isShowTitle:false,
               btns:[
                  {
                     text:'还原默认设置',
                     handler:function(data){
                        //console.log(data)
                        nsconfirm('确定恢复默认设置吗？',function(state){
                           if(state){
                              NetstarBtnPanelManager.saveBtnPanel(runData.dragableField,containerId);
                           }
                        },'warning')
                     }
                  },{
                     text:'保存/关闭',
                     handler:function(data){
                        NetstarBtnPanelManager.saveBtnByDialogPanel(containerId);
                     }
                  }
               ]
            };
            vueButtonComponent.init(btnConfig);
         }
      };
     NetstarComponent.dialogComponent.init(dialogConfig);
   }
};