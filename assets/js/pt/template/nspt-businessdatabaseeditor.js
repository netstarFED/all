NetstarTemplate.templates.businessDataBaseEditor = (function ($) {
   var dialogForAdd = (function ($) {
      var config = {};
      var $tabPanelArr = [];
      var serverData = {};
      var isError = false;
      var editorType;
      var imageListData = [];
      var originConfig = {};//sjj 201905015号添加
      var ServerDataByAjax = {};//通过ajax返回服务端数据
      //初始化
      function init(outerConfig) {
         ServerDataByAjax = {};
         imageListData = [];
         editorType = '';
         setDefault(outerConfig);
         getParentChildRelation(config.components, undefined, config);  //根据keyField 和 parent 拿到数据关系
         getIdFieldName();
         setDefaultData(function () {
            buildDefaultContainer();
            formatComponents(config.components, config); //格式化组件
            buildComponentsContainer();   //构建组件容器
            var vm = vueInit();  //vue初始化
            renderComponents(config, function () {
               setServerData();  //设置初始化值
            });  //组件初始化，初始化完成后调用设置 初始化值的方法
         });
         //console.log(config);
      }
      //设置默认值
      function setDefault(outerConfig) {
         originConfig = $.extend(true, {}, outerConfig);
         config = $.extend(true, {}, outerConfig);
         //config
         var baseId = (config.package + '-' + config.template + '-').replace(/\./g, '-');
         var defaultConfig = {
            size: 'lg',
            defaultComponentWidth: '25%',
            container: baseId + '-container',
            baseId: baseId,
            pageHeight: $('body').height(),   //页面高度
            formatComponentsArr: [],   //将components的字段保存
            tabIdFields: [],   //tab页的id
            readonly: false,
            vueId: baseId + 'vue-container',
            show: true,
            showTab: 0,
            tempData: {},
            defaultData: {},
            imageListData:[],
         };
         nsVals.setDefaultValues(config, defaultConfig);
         //baseId
         $.each(config.components, function (index, item) {
            typeof item.keyField == 'undefined' ? item.keyField = 'root' : '';
            typeof item.parent == 'undefined' ? item.parent = 'root' : '';
            (config.components.length == 1) && (typeof item.title == 'undefined' || $.trim(item.title).length == 0) ? config.hideTitle = true : config.hideTitle = false;
            item.id = config.baseId + item.type + '-' + index;
         });
         NetstarTemplate.draft.setConfig(config); // 设置草稿箱相关参数
      }
      //sjj 20190604 注释可选图片质量
      /*
         <div class="pt-radio">\
               <div class="pt-radio-group">\
                  <div class="pt-radio-inline">\
                     <label class="pt-radio-inline left checked">普通\
                        <input type="radio" name="'+ config.package + '-quality" class="" value="0.6">\
                     </label>\
                  </div>\
                  <div class="pt-radio-inline">\
                     <label class="pt-radio-inline left">高清\
                        <input type="radio" name="'+ config.package + '-quality" class="" value="0.8">\
                     </label>\
                  </div>\
                  <div class="pt-radio-inline">\
                     <label class="pt-radio-inline left">原图\
                        <input type="radio" name="'+ config.package + '-quality" class="" value="1">\
                     </label>\
                  </div>\
               </div>\
         </div>\*/
      //上传图片
      var imgUpload = {
         alreadyHave: 0,
         limitType: "image/gif,image/jpeg,image/bmp,image/png".split(','),
         templateHtml: '<div class="pt-upload">\
                        <div class="pt-upload-header">\
                           <!-- 上传按钮 -->\
                           <div class="pt-btn-group">\
                              <button id="'+ config.baseId + 'clickToUpload' + '" class="pt-btn pt-btn-default pt-btn-icon pt-btn-lg">\
                                 <input style="width:100%;" class="pt-upload-control" accept="image/gif, image/jpeg, image/bmp, image/png" multiple="multiple" type="file" name="file" multiple="multiple">\
                                 <i class="icon-add"></i>\
                              </button>\
                           </div>\
                           <!-- title -->\
                           <div class="pt-title">\
                              <span>图片上传</span>\
                              <small>图片大小不能超过500kb。图片格式必须为jpg，gif，png，bmp</small>\
                           </div>\
                        </div>\
                        <!-- 图片列表 -->\
                        <div class="pt-media-list">\
                        </div>\
                     </div>',
         mediaItem: '<div class="pt-media-item">\
                           <!-- 图片 -->\
                           <!-- 设为封面 favorite -->\
                           <div class="pt-media-image">\
                                 <a href="#">\
                                    <img alt="">\
                                 </a>\
                                 <div class="pt-media-edit">\
                                    <div class="pt-btn-group">\
                                       <button class="pt-btn pt-btn-icon setAsCover" title="设为封面">\
                                             <i class="icon-star"></i>\
                                       </button>\
                                       <button class="pt-btn pt-btn-icon deleteCoverImg" title="删除">\
                                             <i class="icon-trash"></i>\
                                       </button>\
                                    </div>\
                                 </div>\
                           </div>\
                           <!-- 图片名称 -->\
                           <div class="pt-media-title">\
                                 <a href="#">\
                                    <span></span>\
                                 </a>\
                                 <!-- 编辑状态 -->\
                                 <button class="pt-btn pt-btn-icon pt-btn-link renameCoverImg">\
                                    <i class="icon-pen"></i>\
                                 </button>\
                           </div>\
                        </div>',
         //上传界面构建
         buildUploadCover: function () {
            this.uploadBtnId = config.baseId + 'clickToUpload';
            this.$container = $('#' + config.uploadCoverContainerId);
            this.uploadConfig = config.uploadCoverConfig;
            var $uploadMain = $(this.templateHtml);

            $uploadMain.find('.pt-btn-group button').attr('id', this.uploadBtnId);

            //设置最大高度
            $uploadMain.find('.pt-media-list').css('max-height', config.modalBodyMaxHeight - 140);
            this.$container.append($uploadMain);
         },
         //上传
         chooseImage: function () {
            var _this = this;
            //图片上传
            var $filePicker = $('#' + this.uploadBtnId).find('input[type="file"]');
            $filePicker.on('change', function (e) {
               var files = $filePicker.prop('files');
               _this.uploadFiles(files); //上传成功之后再显示图片
               //压缩图片
               /*_this.imageCompressor(files, function (files) {
                  if (_this.validFiles(files)) {
                     //_this.showTheFiles(files);
                     _this.uploadFiles(files); //上传成功之后再显示图片
                  }
               });*/
               $filePicker.val("");
            });
         },
         //压缩图片
         imageCompressor: function (files, cb) {
            var imageArr = [];
            var imageCompressor = new ImageCompressor();
            var compressorConfig = {
               quality: Number($('#' + config.uploadCoverContainerId).find('.pt-radio label.checked > input').val())
            };
            for (var i = 0, len = files.length; i < len; i++) {
               (function (i) {
                  var item = files[i];
                  imageCompressor.compress(item, compressorConfig).then(function (result) {
                     result.objectState = 1;
                     imageArr.push(result);
                     if (i == len - 1) {
                        cb && cb(imageArr);
                     }
                  });
               })(i);
            }
         },
         //验证图片
         validFiles: function (files) {
            var len = files.length;
            if (len == 0) return false;
            for (var i = 0; i < len; i++) {
               var item = files[i];
               //图片大小限制
               if ((item.size / 1024) > 500) {
                  nsalert('图片大小不能超过500kb');
                  return false;
               }
               //图片类型限制
               if ($.inArray(item.type, this.limitType) == -1) {
                  nsalert('图片格式必须为jpg,gif,png,bmp');
                  return false;
               }
            }
            return true;
         },
         //显示图片
         showTheFiles: function (files, noCount) {
            $('#' + config.uploadCoverContainerId).find('.pt-media-list').html('');
            if($.isArray(serverData[config.uploadCoverConfig.keyField])){
               for (var i = 0, len = serverData[config.uploadCoverConfig.keyField].length; i < len; i++) {
                  var $mediaItem = $(this.mediaItem);
                  var fileId = serverData[config.uploadCoverConfig.keyField][i][this.uploadConfig.imgIdField];
                  //var item = files[i];
                  //删除按钮
                  //var ii = noCount ? i : i + this.alreadyHave;
                  if (typeof config.tempData[this.uploadConfig.keyField] == 'undefined') {
                     config.tempData[this.uploadConfig.keyField] = [];
                  }
                  $mediaItem.find('.deleteCoverImg').attr('ns-index', i);
                  $mediaItem.find('.setAsCover').attr('ns-index', i);
                  $mediaItem.find('.renameCoverImg').attr('ns-index', i);
   
                  //sjj 20190604
                  $mediaItem.find('.deleteCoverImg').attr('ns-fileid', fileId);
                  $mediaItem.find('.setAsCover').attr('ns-fileid', fileId);
                  $mediaItem.find('.renameCoverImg').attr('ns-fileid', fileId);
   
                  //图片处理
                  var name = '';   
                  //sjj 20190604
                  var url = this.uploadConfig.readSrcAjax.src+'/'+fileId;
                  //var url = this.getObjectURL(item);
                  $mediaItem.find('.pt-media-image img').attr('src', url);
                  $mediaItem.find('.pt-media-title span').text(name);
                  $('#' + config.uploadCoverContainerId).find('.pt-media-list').append($mediaItem);
   
                 // config.tempData[this.uploadConfig.keyField].push(item);
               }
            }
            for (var i = 0, len = config.imageListData.length; i < len; i++) {
               var $mediaItem = $(this.mediaItem);
               var fileId = config.imageListData[i][this.uploadConfig.imgIdField];
               //var item = files[i];
               //删除按钮
               //var ii = noCount ? i : i + this.alreadyHave;
               if (typeof config.tempData[this.uploadConfig.keyField] == 'undefined') {
                  config.tempData[this.uploadConfig.keyField] = [];
               }
               $mediaItem.find('.deleteCoverImg').attr('ns-index', i);
               $mediaItem.find('.setAsCover').attr('ns-index', i);
               $mediaItem.find('.renameCoverImg').attr('ns-index', i);

               //sjj 20190604
               $mediaItem.find('.deleteCoverImg').attr('ns-fileid', fileId);
               $mediaItem.find('.setAsCover').attr('ns-fileid', fileId);
               $mediaItem.find('.renameCoverImg').attr('ns-fileid', fileId);

               //图片处理
               var name = config.imageListData[i].name.substr(0, config.imageListData[i].name.lastIndexOf('.'));

               //sjj 20190604
               var url = this.uploadConfig.readSrcAjax.src+'/'+fileId;
               //var url = this.getObjectURL(item);
               $mediaItem.find('.pt-media-image img').attr('src', url);
               $mediaItem.find('.pt-media-title span').text(name);
               $('#' + config.uploadCoverContainerId).find('.pt-media-list').append($mediaItem);

              // config.tempData[this.uploadConfig.keyField].push(item);
            }
            this.alreadyHave = config.tempData[this.uploadConfig.keyField].length;
            this.addEvent();
            //console.log(config);
         },
         //上传图片
         uploadFiles: function (files) {
            //console.log('上传');
            var formData = new FormData();
            for (var i = 0, len = files.length; i < len; i++) {
               var item = files[i];
               //var name = item.name.substr(0, item.name.lastIndexOf('.'));
               formData.append('files',item,item.name);
            }
            
            if(this.uploadConfig.uploadAjaxData){
               var uploadAjaxData = JSON.parse(this.uploadConfig.uploadAjaxData);
               for(var data in uploadAjaxData){
                  formData.append(data,uploadAjaxData[data]);
               }
            }
            // 发送ajax
            this.uploadConfig.ajax.processData = false;
            this.uploadConfig.ajax.contentType = false;
            // var ajax = nsVals.getAjaxConfig(this.uploadConfig.uploadAjax, formData);
            this.uploadConfig.ajax.data = formData;
            this.uploadConfig.ajax.plusData = {originalFiles:files};

            var _this = this;
            NetStarUtils.ajax(this.uploadConfig.ajax, function (res,ajaxData) {
               if (res.success) {
                  nsalert("上传成功");
                  //sjj 20190604 存储上传成功之后的图片
                  for(var fileI=0; fileI<res.rows.length; fileI++){
                     var idJson = {};
                     idJson[config.uploadCoverConfig.imgIdField] = res.rows[fileI].id;
                     var imgJson = {
                        name:res.rows[fileI].originalName
                     };
                     imgJson[config.uploadCoverConfig.imgIdField] = res.rows[fileI].id;
                     config.imageListData.push(imgJson);
                     imageListData.push(idJson);
                  }
                  _this.showTheFiles(files,false);
               } else {
                  nsalert("上传失败");
                  nsalert(res.msg, 'error');
               }
            });

            // config.tempData[this.uploadConfig.keyField] = files;
         },
         //图片质量选择事件
         selectQualityEvent: function () {
            //图片质量选择按钮事件
            var $container = $('#' + config.uploadCoverContainerId);
            $container.find('.pt-radio label').on('click', function () {
               var $this = $(this);
               $container.find('.pt-radio label').removeClass('checked');
               $this.addClass('checked');
            })
         },
         //添加事件
         addEvent: function (files) {
            var _this = this;
            //设为封面
            $('#' + config.uploadCoverContainerId).find('.setAsCover').off();
            $('#' + config.uploadCoverContainerId).find('.setAsCover').on('click', function (e) {
               var $this = $(this);
               var index = $this.attr('ns-index');
               var fileId = $this.attr('ns-fileid');
               $('#' + config.uploadCoverContainerId).find('.pt-media-mark').remove();

               //工作 给第一个加收藏标记
               $this.parents('.pt-media-item').append('<!-- 收藏标记 -->\
                                                      <div class="pt-media-mark">\
                                                            <i class="icon-star"></i>\
                                                      </div>');
               /*var files = config.tempData[_this.uploadConfig.keyField];
               if (index != 0) {
                  var temp = files[0];
                  files[0] = files[index];
                  files[index] = temp;
                  config.tempData[_this.uploadConfig.keyField] = [];
                  $('#' + config.uploadCoverContainerId).find('.pt-media-list').empty();
                  _this.showTheFiles(files, true);
                  $('#' + config.uploadCoverContainerId).find('.pt-media-item').eq(0).append('<!-- 收藏标记 -->\
                                                      <div class="pt-media-mark">\
                                                            <i class="icon-star"></i>\
                                                      </div>');
               }*/
            });
            //删除操作
            $('#' + config.uploadCoverContainerId).find('.deleteCoverImg').off();
            $('#' + config.uploadCoverContainerId).find('.deleteCoverImg').on('click', function (e) {
               var $this = $(this);
               var index = $this.attr('ns-index');
               var fileId = $this.attr('ns-fileid');
               var sourceServer = $this.attr('ns-server');
               $this.parents('.pt-media-item').remove();
               /********************sjj 20190604 start */
               //删除fileId
               var fileIdIndex = -1;
               for(var fileI=0; fileI<imageListData.length; fileI++){
                  if(imageListData[fileI][config.uploadCoverConfig.imgIdField] == fileId){
                     fileIdIndex = fileI;
                     break;
                  }
               }
               if(fileIdIndex > -1){
                  imageListData.splice(fileIdIndex,1);
                  config.imageListData.splice(fileIdIndex,1);
               }
               /********************sjj 20190604 end */
               //config.tempData[_this.uploadConfig.keyField][index].objectState = -1;
            });
            //文件重命名操作
            $('#' + config.uploadCoverContainerId).find('.renameCoverImg').off();
            $('#' + config.uploadCoverContainerId).find('.renameCoverImg').on('click', function (e) {
               $('#' + config.uploadCoverContainerId).find('.renameCoverImg').addClass('hidden');
               var $this = $(this);
               var index = $this.attr('ns-index');
               var $span = $this.parents('.pt-media-title').find('span');
               var beforeName = $span.text();
               $span.addClass('hidden');
               var $editContainer = $('<div class="pt-upload-edit">\
                                       <input type="text" class="pt-form-control" value="'+ beforeName + '" />\
                                       <div class="pt-btn-group">\
                                       <button class="pt-btn pt-btn-default pt-btn-icon cancle"><i class="icon-close"></i></button>\
                                       <button class="pt-btn pt-btn-default pt-btn-icon confirm"><i class="icon-check"></i></button>\
                                       </div>\
                                    </div>')
               $editContainer.insertAfter($span);
               $editContainer.find('button.cancle').on('click', function () {
                  $editContainer.remove();
                  $span.removeClass('hidden');
                  $('#' + config.uploadCoverContainerId).find('.renameCoverImg').removeClass('hidden');
               })
               $editContainer.find('button.confirm').on('click', function () {
                  var afterName = $editContainer.find('input').val();
                  $span.text(afterName);
                  $span.removeClass('hidden');
                  $editContainer.remove();

                  //重新创建来达到修改名字的目的
                  /*var files = config.tempData[_this.uploadConfig.keyField]
                  var len = files.length;
                  var currentFile = files[index];
                  var etx = currentFile.name.split('.');
                  var dfl = new File([currentFile], afterName + "." + etx[etx.length - 1], { type: currentFile.type });

                  files.splice(index, 1, dfl);
                  files[index].objectState = 1;*/
                  $('#' + config.uploadCoverContainerId).find('.renameCoverImg').removeClass('hidden');
               })
            });
         },
         //根据file对象获取url
         getObjectURL: function (file) {
            var url = null;
            /* window.URL = window.URL || window.webkitURL;*/

            if (window.createObjcectURL != undefined) {
               url = window.createOjcectURL(file);
            } else if (window.URL != undefined) {
               url = window.URL.createObjectURL(file);
            } else if (window.webkitURL != undefined) {
               url = window.webkitURL.createObjectURL(file);
            }
            return url;
         }
      };

      /*********************************获取数据关系 */
      //格式化父子关系
      function getParentChildRelation(components, _keyField, _config) {
         arguments.length == 3
            ? config = arguments[2]
            : "";
         if (typeof _keyField != 'undefined') {
            $.each(components, function (index, item) {
               if (typeof config.parentChildRelation[_keyField] != 'undefined') {
                  return;
               }
               if (item.keyField == _keyField) {
                  if (item.parent == 'root') {
                     config.parentChildRelation[_keyField] = "root" + "." + item.keyField;
                  } else {
                     getParentChildRelation(components, item.parent);
                     config.parentChildRelation[_keyField] = config.parentChildRelation[item.parent] + '.' + item.keyField;
                  }
               }
            });
         } else {
            config.parentChildRelation = {};
            $.each(components, function (index, item) {
               if (typeof item.parent == 'undefined' || typeof item.keyField == 'undefined') {
                  return;
               }
               if (typeof config.parentChildRelation[item.keyField] != 'undefined') {
                  return;
               }
               if (item.parent == 'root' && item.keyField == 'root') {
                  config.parentChildRelation[item.keyField] = "root";
               }
               if (item.parent == 'root' && item.keyField != 'root') {
                  config.parentChildRelation[item.keyField] = "root" + '.' + item.keyField;
               }
               if (item.parent != 'root' && item.keyField != 'root') {
                  if (typeof config.parentChildRelation[item.parent] != 'undefined') {
                     config.parentChildRelation[item.keyField] = config.parentChildRelation[item.parent] + '.' + item.keyField;
                  } else {
                     getParentChildRelation(components, item.parent);
                     config.parentChildRelation[item.keyField] = config.parentChildRelation[item.parent] + '.' + item.keyField;
                  }
               }
            });
         }
      }

      /*********************************格式化组件 */
      //格式化各个组件
      function formatComponents(components, _config) {
         typeof _config != 'undefined' ? config = _config : "";
         $.each(components, function (index, item) {
            switch (item.type) {
               case 'vo':
                  config.formatComponentsArr.push(formatForm(item));
                  break;
               case 'list':
                  config.formatComponentsArr.push(getGridConfig(item));
                  break;
               case 'blockList':
                  config.formatComponentsArr.push(getGridConfig(item));
                  break;
               case 'uploadCover':
                  config.formatComponentsArr.push(getUploadCoverConfig(item));
                  break;

               default:
                  break;
            }
         });
      }
      //格式化表单
      function formatForm(formConfig, formName) {
         var isSetFocus = false;
         var shownFields = Object.keys(NetstarComponent);
         if (formConfig.keyField == 'root') {
            var formValue = getDataByKeyField(formConfig.keyField) || {};
         } else {
            var formValue = getDataByKeyField(formConfig.keyField)[formConfig.keyField] || {};
         }
         var formJson = { isSetFocus: false };
         formJson.id = formConfig.id;
         //添加默认配置
         for (var key in formConfig) {
            if (formConfig.hasOwnProperty(key)) {
               var element = formConfig[key];
               if (key != 'id' && key != 'form') {
                  formJson[key] = element;
               }
            }
         }
         formJson.disabled = typeof(config.readonly) == 'boolean' ? config.readonly : false;
         //设置各种属性
         $.each(formConfig.field, function (index, item) {
            //设置只读 值
            // item.readonly = typeof config.readonly == 'boolean' ? config.readonly : false;
            if(typeof config.readonly == 'boolean' && config.readonly){
               item.readonly = config.readonly;
            }else{
               if(typeof item.disabled == 'boolean' && item.disabled){
                  item.readonly = item.disabled;
               }else{
                  if(typeof item.readonly == 'boolean'){
                  }else{
                     item.readonly = false;
                  }
               }
            }
            //sjj 20190628 
            if(editorType == 'edit'){
               if(typeof(item.addReadonly)=='boolean'){
                  item.readonly = true;
               }
            }
            //设置值
            if (!$.isEmptyObject(formValue) && typeof formValue[item.id] != 'undefined') {
               item.value = formValue[item.id];
            }
            //设置隐藏字段 
            if ($.inArray(item.id, formConfig.hide) != -1) {
               item.type = 'hidden';
            }
            //设置自动聚焦
            if (!isSetFocus && item.type != 'hidden' && $.inArray(item.type, shownFields) != -1) {
               isSetFocus = true;
               if (item.type == 'text' && item.readonly != true && !item.disabled) {
                  formJson.isSetFocus = true;
               } else {
                  formJson.isSetFocus = false;
               }
            }
         });
         formJson.form = formConfig.field;
         var componentConfig = {
            config: formJson,
            id: formJson.id,
            type: 'vo',
            renderType: 'form',
            templateOptions: formConfig,
         };
         return componentConfig;
      }
      //格式化Grid cy 20181228
      function getGridConfig(pageListOptions) {
         /**
          * pageListOptions:object 参数举例：
          * {
          *    btns: [{…}]
          *    delete: {type: "dialog", text: "删除商品别名{name}"}
          *    field: (10) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
          *    flagField: "flag"
          *    idField: "itemCode"
          *    keyField: "child"
          *    parent: "GoodsPlatformList"
          *    position: "body"
          *    title: "商品标题"
          *    type: "list"
          * }
          */
         var options = pageListOptions;
         typeof options.dataSource == 'undefined' ? options.dataSource = [] : '';
         var defaultGridData = getDataByKeyField(options.keyField);
         $.merge(options.dataSource, defaultGridData && !$.isEmptyObject(defaultGridData) && $.isArray(defaultGridData[options.keyField]) ?
            defaultGridData[options.keyField] :
            []);
         
         var isEditMode = typeof config.readonly == 'boolean' ? !config.readonly : true;
         var isHaveEditDeleteBtn = typeof options.isHaveEditDeleteBtn == 'boolean' ? options.isHaveEditDeleteBtn : !config.readonly || true;
         var isAllowAdd = typeof options.isAllowAdd == 'boolean' ? options.isAllowAdd : true;
         var gridConfig = {
            /** 数据配置
             *       当前模板中grid是编辑模式
             *       表格数据是单据数据的一部分，直接以dataSource方式从整体数据对象中获取
             */
            columns: options.field,
            data: {
               idField: options.idField,
               tableID: options.id,
               dataSource: [], //options.dataSource
            },
            ui: {
               isAutoSerial: true,   //是否开启自动序列列 最前面那个1,2,3,4的列
               isCheckSelect: true,  //是否开启check select选中行  尽在支持多选状态下可用
               isHeader: false,
               isPage: false,
               minPageLength: 10,
               isEditMode: isEditMode, //编辑模式
               //isEditMode: true, //编辑模式
               pageLengthMenu: [20, 50, 100, 200],  //每页多少
               pageLengthDefault: 20,               //默认分页数量
               selectMode: 'single',                //多选multi none single
               isHaveEditDeleteBtn: isEditMode && isHaveEditDeleteBtn,
               isAllowAdd: isEditMode && isAllowAdd
            }
         };
         var componentConfig = {
            config: gridConfig,
            id: options.id,
            type: options.type,
            renderType: 'grid',
            templateOptions: options,
         };

         return componentConfig;
      }
      //格式化 uploadCover
      function getUploadCoverConfig(uploadConfig) {
         var options = uploadConfig;
         options.id = config.baseId + options.idField;
         config.uploadCoverContainerId = options.id;
         config.uploadCoverConfig = options;
        /* $.ajax({
            url: 'http://localhost:8088/ui/Service/getCoverImage',
            type: "GET",
            success: function (res) {
               console.log(res);
            }
         });*/
         var componentConfig = {
            config: options,
            id: options.id,
            type: 'uploadCover',
            renderType: 'uploadCover',
            templateOptions: options,
         };
         return componentConfig;
      }

      /*********************************构建容器 */
      function buildDefaultContainer() {
         // var $parentContainer = $('#placeholder-popupbox').length == 0 ? $('body') : $('#placeholder-popupbox');
         var containerId = config.container;
         if ($('body').find('#' + containerId).length == 0) {
            $('body').append('<div id="' + containerId + '" ns-template-package="'+config.package+'"></div>');
         }
         $('#' + containerId).html('<container></container>');
         var $parentContainer = $('#' + containerId).children('container');
         $parentContainer.find('#' + config.vueId).remove();
         //sjj如果定义了getDataByAjax则添加一个按钮
         var isHaveDataByAjaxBtn = false;
         if(!$.isEmptyObject(config.getDataByAjax)){
            isHaveDataByAjaxBtn = true;
         }else{
            config.getDataByAjax = {};
         }
         config.isHaveDataByAjaxBtn  = isHaveDataByAjaxBtn;
         if(config.$container){
            var tabBodyId = 'dialog-'+config.vueId+'-body';
            var tabContentHtml = '<div class="pt-tab-components-tabs pt-tab" id="'+config.vueId+'">\
                           <div class="pt-container">\
                              <div class="pt-tab-header">\
                                 <div class="pt-nav">\
                                    <ul>\
                                       <li class="pt-nav-item" v-for="(item, index) in config.tabIdFields" :key="item" :id="item" :class="{\'current\' : index == config.showTab}" @click="tabClick(item,index)">\
                                          <a href="#" v-if="typeof config.formatComponentsArr[index].templateOptions.title != \'undefined\'">\
                                                {{config.formatComponentsArr[index].templateOptions.title}}\
                                          </a>\
                                       </li>\
                                    </ul>\
                              </div>\
                           </div>\
                           <div class="pt-tab-body" id="'+tabBodyId+'">\
                              <div class="pt-tab-content"></div>\
                           </div>\
                           <div class="pt-tab-footer"></div>\
                        </div>\
                     </div>';
            var html = '<div class="pt-main businessdatabaseeditor">'
                           +'<div class="pt-panel">'
                              +'<div class="pt-container">'
                                +tabContentHtml
                              +'</div>'
                           +'</div>'
                        +'</div>';
            config.$container.html(html);
            return;
         }
         var dialogJson = {
				id:config.vueId,//typeof(obj.config.dialogId) == 'undefined'?'dialogCommon':obj.config.dialogId,
				title: config.title,
            templateName:'PC',
            width:800,
            height:'auto',
				shownHandler:function(data){
               $('#'+data.config.bodyId).addClass('pt-modal-tab');
               var isShowNav = true;
               if(config.formatComponentsArr &&
                  config.formatComponentsArr.length == 1 &&
                  !(config.formatComponentsArr[0].templateOptions && config.formatComponentsArr[0].templateOptions.title)
               ){
                  isShowNav = false;
               }
               if(config.hideTitle){
                  $('#'+data.config.bodyId).addClass('pt-modal-tab-hidetitle');
               }
               if(!isShowNav){
                  $('#'+data.config.bodyId).addClass('no-tab-nav');
               }
		         //header和body分别插入
               var headerHtml = 
                  '<div class="pt-tab-header">\
                     <div class="pt-nav">\
                        <ul>\
                           <li class="pt-nav-item" v-for="(item, index) in config.tabIdFields" :key="item" :id="item" :class="{\'current\' : index == config.showTab}" @click="tabClick(item,index)">\
                              <span v-if="typeof config.formatComponentsArr[index].templateOptions.title != \'undefined\'">\
                                    {{config.formatComponentsArr[index].templateOptions.title}}\
                              </span>\
                           </li>\
                        </ul>\
                     </div>\
                  </div>';
               $('#'+data.config.headId).append(headerHtml);


               var bodyHtml = '<div class="pt-tab">\
                              <div class="pt-container">\
                                 <div class="pt-tab-body">\
                                    <div class="pt-tab-content"></div>\
                                 </div>\
                                 <div class="pt-tab-footer"></div>\
                              </div>\
                           </div>';
               $('#'+data.config.bodyId).html(bodyHtml);

               

               config.dialogContainerId = data.config.dialogContainerId;
               //构建弹窗的容器
              // config.$modalContainer = $('<div id="' + config.vueId + '" v-cloak></div>');
               
               config.$modal = $('#'+data.config.dialogContainerId);
              // config.$modalContainer.find(config.$modal).length == 0 ? config.$modalContainer.append(config.$modal) : "";
               //$('#'+data.config.dialogContainerId).removeAttr('style')
               //设置遮罩层级
               /*var $lastDialog = $('div[ns-type="pt-modal"]:last');
               var modalIndex = $lastDialog.attr('ns-index');
               if ($lastDialog.length != 0) {
                  config.$modal.attr('ns-index', Number(typeof modalIndex == 'undefined' ? -1 : modalIndex) + 1);
                  config.$modal.find('.pt-modal-content').css('zIndex', Number($lastDialog.find('.pt-modal-content').css('zIndex')) + 2);
                  config.$modal.find('.pt-modal-bg').css('zIndex', Number($lastDialog.find('.pt-modal-bg').css('zIndex')) + 1);
               } else {
                  config.$modal.attr('ns-index', 0);
                  config.$modal.attr('ns-top', true);
                  config.$modal.find('.pt-modal-content').css('zIndex', 1002);
                  config.$modal.find('.pt-modal-bg').css('zIndex', 1001);
               }
               //设置最大高度
               config.modalBodyMaxHeight = $('body').height() - 173;
               config.$modal.find('.pt-modal-body').css('max-height', config.modalBodyMaxHeight);*/

               //$parentContainer.append(config.$modalContainer);
            },
            hideHandler:function(_config){
               if(typeof(originConfig.vm)=='object'){
                  originConfig.vm.close(false);
               }
               return false;
            },
         };
         NetstarComponent.dialogComponent.init(dialogJson);
      }
      //构建页面容器
      function buildComponentsContainer(_config, _listDrag) {
         typeof _config != 'undefined' ?
            config = _config :
            "";
         var $tabContent = $('#' + config.vueId).find('.pt-tab-content');
         if($('#' + config.vueId).length ==0){
            $tabContent = $('#dialog-' + config.vueId).find('.pt-tab-content');
         }
         $tabContent.empty();
         //循环添加tab页
         if (typeof config.formatComponentsArr != 'undefined') {
            for (var i = 0; i < config.formatComponentsArr.length; i++) {
               var item = config.formatComponentsArr[i];
               switch (item.renderType) {
                  case 'form':
                     $tabContent.append('<div class="hidden" ns-renderType="' + item.renderType + '" id="' + item.id + '"></div>');
                     break;
                  case 'grid':
                     $tabContent.append('<div class="hidden" ns-renderType="' + item.renderType + '" id="' + item.id + '"></div>');
                     break;
                  case 'uploadCover':
                     $tabContent.append('<div class="hidden" ns-renderType="' + item.renderType + '" id="' + item.id + '"></div>');
                     imgUpload.buildUploadCover();
                     break;

                  default:
                     break;
               }
               $tabPanelArr.push($tabContent.find("#" + item.id));
               config.tabIdFields.push(item.id + '-tab');
            }
            $tabContent.find('div:first').removeClass('hidden')
         }
      }

      /*********************************渲染组件 */
      //vue初始化
      function vueInit() {
         // dialogBtnClick();
         //sjj 20190515  config不应该作为一个vue的对象直接传值，比如点击保存方法调用ajax的时候会监听，影响获取参数的准确性
         originConfig[config.id] = config;
         var isShowNav = true;
         if(config.formatComponentsArr &&
            config.formatComponentsArr.length == 1 &&
            !(config.formatComponentsArr[0].templateOptions && config.formatComponentsArr[0].templateOptions.title)
         ){
            isShowNav = false;
         }
         var vueHeaderId = 'dialog-'+config.vueId+'-header'; 
         var vm = new Vue({
            el: "#" + vueHeaderId,
            data: {config: $.extend(true, {}, config)},
            methods:{
               tabClick: function (item, index) {
                  var config = this.config;
                  config.showTab = index;
                  // $tabPanelArr[index].removeClass('hidden');
                  //面板状态改变
                  var itemArr = item.split('-');
                  itemArr.pop();
                  var $concatPanel = $('#' + itemArr.join('-'));
                  if ($concatPanel.length == 0) return;
                  hidePanel();
                  $concatPanel.removeClass('hidden');
   
                  switch ($concatPanel.attr('ns-renderType')) {
                     case 'uploadCover':
                        //sjj 20190604 
                        $('#' + config.uploadCoverContainerId).find('.pt-media-list').html('');
                        if($.isArray(serverData[config.uploadCoverConfig.keyField])){
                           var imgArray = serverData[config.uploadCoverConfig.keyField];
                           console.log(imageListData)
                           for(var imgI=0; imgI<imgArray.length; imgI++){
                              var $mediaItem = $(imgUpload.mediaItem);
                              var fileId = imgArray[imgI][config.uploadCoverConfig.imgIdField];
                              $mediaItem.find('.deleteCoverImg').attr('ns-index', imgI);
                              $mediaItem.find('.setAsCover').attr('ns-index', imgI);
                              $mediaItem.find('.renameCoverImg').attr('ns-index', imgI);
   
                              $mediaItem.find('.deleteCoverImg').attr('ns-server',true);
                              $mediaItem.find('.setAsCover').attr('ns-server', true);
                              $mediaItem.find('.renameCoverImg').attr('ns-server', true);
   
                              $mediaItem.find('.deleteCoverImg').attr('ns-fileid', fileId);
                              $mediaItem.find('.setAsCover').attr('ns-fileid', fileId);
                              $mediaItem.find('.renameCoverImg').attr('ns-fileid', fileId);
   
                              var url = config.uploadCoverConfig.readSrcAjax.src + '/'+fileId;
                              $mediaItem.find('.pt-media-image img').attr('src', url);
                              $('#' + config.uploadCoverContainerId).find('.pt-media-list').append($mediaItem);
                           }  
                           imgUpload.addEvent();
                        }else{
                           if(imageListData.length > 0){
                              var imgArray = imageListData;
                              for(var imgI=0; imgI<imgArray.length; imgI++){
                                 var $mediaItem = $(imgUpload.mediaItem);
                                 var fileId = imgArray[imgI][config.uploadCoverConfig.imgIdField];
                                 $mediaItem.find('.deleteCoverImg').attr('ns-index', imgI);
                                 $mediaItem.find('.setAsCover').attr('ns-index', imgI);
                                 $mediaItem.find('.renameCoverImg').attr('ns-index', imgI);
   
                                 $mediaItem.find('.deleteCoverImg').attr('ns-server',true);
                                 $mediaItem.find('.setAsCover').attr('ns-server', true);
                                 $mediaItem.find('.renameCoverImg').attr('ns-server', true);
   
                                 $mediaItem.find('.deleteCoverImg').attr('ns-fileid', fileId);
                                 $mediaItem.find('.setAsCover').attr('ns-fileid', fileId);
                                 $mediaItem.find('.renameCoverImg').attr('ns-fileid', fileId);
   
                                 var url = config.uploadCoverConfig.readSrcAjax.src + '/'+fileId;
                                 $mediaItem.find('.pt-media-image img').attr('src', url);
                                 $('#' + config.uploadCoverContainerId).find('.pt-media-list').append($mediaItem);
                              }  
                              imgUpload.addEvent();
                           }
                        }
                       // imgUpload.selectQualityEvent();
                        break;
   
                     default:
                        break;
                  }
               }
            }
            
         })
         var vueBodyId = 'dialog-'+config.vueId+'-body'; 
         if(config.$container){
            vueBodyId = config.vueId;
         }
         // var vueBodyId = 'dialog-'+config.vueId; 
         var vm = new Vue({
            el: "#" + vueBodyId,
            data: {
               config: $.extend(true, {}, config),
               isSaved: false,
               isShowNav : isShowNav,
            },
            methods: {
               close: function (isNotVerify) {
                  var _this = this;
                  var pageData = getPageData(this.config, true, false);
                  if (JSON.stringify(pageData).length >= JSON.stringify(serverData).length) {
                     var frontData = pageData ? pageData : {};
                     var backData = serverData;
                  } else {
                     var frontData = serverData;
                     var backData = pageData ? pageData : {};
                  }
                  if (!nsVals.isEqualObject(frontData, backData) && !isNotVerify && !_this.isSaved && !config.readonly) {
                     nsUI.confirm.show({
                        content: '编辑后未保存，是否关闭?',
                        isResetBtn: true,
                        state: 'warning',
                        handler: function () { },
                        btns: [
                           {
                              text: '保存并关闭',
                              index: { 'ns-confirm-type': 'handler', fid: 0 },
                              handler: function () {
                                 _this.save();
                              }
                           }, {
                              text: '不保存关闭',
                              index: { 'ns-confirm-type': 'handler', fid: 1 },
                              handler: function () {
                                 //_this.config.show = false;
                                 if(config.$container){
                                    config.$container.closest('div[ns-type="pt-modal"]').remove();
                                 }else{
                                    $('#'+config.dialogContainerId).remove();
                                 }
                                 //NetstarComponent.dialog[config.vueId].vueConfig.close();
                                 if (pageData && typeof isNotVerify == 'boolean' && isNotVerify) {
                                    config.closeHandler && config.closeHandler(pageData);
                                 }
                              }
                           }, {
                              text: '取消',
                              index: { 'ns-confirm-type': 'handler', fid: 2 },
                              handler: function () { }
                           }
                        ]
                     })

                     /* nsConfirm('编辑后没有保存，是否关闭?', function (state) {
                        if (state) {
                           // _this.save();
                           _this.config.show = false;
                           if (pageData && typeof isNotVerify == 'boolean' && isNotVerify) {
                              config.closeHandler && config.closeHandler(pageData);
                           }
                        }
                     }, 'warning'); */

                  } else {
                     if(config.$container){
                        config.$container.closest('div[ns-type="pt-modal"]').remove();
                     }else{
                        $('#'+config.dialogContainerId).remove();
                     }
                     //NetstarComponent.dialog[config.vueId].vueConfig.close();
                    // _this.config.show = false;
                     //if (pageData && typeof isNotVerify == 'boolean' && isNotVerify && !config.readonly) {
                        config.closeHandler && config.closeHandler(pageData);
                     //}
                  }
               },
               save: function () {
                  var _this = this;
                  var config = this.config;
                  config.operatorType = 'save';
                  var pageData = getPageData(config);
                  var saveDataConfig = $.extend(true,{},originConfig.saveData);
                  if (!!pageData && typeof saveDataConfig != 'undefined' && typeof saveDataConfig.ajax != 'undefined') {
                     saveDataConfig.ajax.data = pageData;
                     var saveOriginalParams = $.extend(true,{},NetstarTemplate.templates.configs[config.package].saveData.ajax.data);//sjj 20190610 保留默认参数
                     if(!$.isEmptyObject(saveOriginalParams)){
                        //sjj 20190610 保留默认参数
                        nsVals.extendJSON(saveDataConfig.ajax.data,saveOriginalParams);
                     }
                     NetStarUtils.ajax(saveDataConfig.ajax, function (res) {
                        nsalert('保存成功');
                        _this.isSaved = true;
                        _this.close(true);
                     });
                  } else {
                     // else if (typeof config.closeHandler == 'function') {
                     if (!isError) {
                        nsalert('保存成功');
                        _this.close(true);
                     } else {
                        isError = false;
                     }
                  }
                  // cb && cb(pageData);
               },
               saveAndAdd: function () {
                  var _this = this;
                  var config = this.config;
                  config.operatorType = 'saveAndAdd';
                  var pageData = getPageData(config);
                  // NetstarComponent.fillValues(fillValues, idField);
                  var saveDataConfig = originConfig[config.id].saveData;
                  saveDataConfig.ajax.data = pageData;
                  if (pageData) {
                     NetStarUtils.ajax(saveDataConfig.ajax, function (res) {
                        if (res.success) {
                           nsalert('保存成功');
                           _this.isSaved = true;
                           config.components.forEach(function (item, index) {
                              $('#' + item.id).empty();
                           });
                           config.closeHandler && config.closeHandler(res[config.saveData.ajax.dataSrc]);
                           //保存新增后打开第一个tab页面
                           config.showTab = 0;
                           _this.tabClick(config.tabIdFields[0], 0);
                           renderComponents($.extend(true, {}, config));
                           config.closeHandler && config.closeHandler(pageData);
                        }
                     });
                  }
               },
               getDataByAjaxBtn:function(){
                  //sjj 20190515 根据ajax获取值
                  var _this = this;
                  var config = this.config;
                  var getDataByAjaxConfig = $.extend(true,{},originConfig[config.id].getDataByAjax);
                  var pageData = getPageData(config,false,false);
                  if(pageData){
                     if($.isEmptyObject(getDataByAjaxConfig.data)){
                        getDataByAjaxConfig.data = pageData;
                     }else{
                        getDataByAjaxConfig.data = nsVals.getVariableJSON(getDataByAjaxConfig.data,pageData,false);
                     }
                  }
                  getDataByAjaxConfig.plusData = {dataSrc:config.getDataByAjax.dataSrc};
                  NetStarUtils.ajax(getDataByAjaxConfig, function (res,ajaxData) {
                     if (res.success) {
                        refreshCompnent(res[ajaxData.plusData.dataSrc]);
                     }
                  });
               },
               tabClick: function (item, index) {
                  var config = this.config;
                  config.showTab = index;
                  // $tabPanelArr[index].removeClass('hidden');
                  //面板状态改变
                  var itemArr = item.split('-');
                  itemArr.pop();
                  var $concatPanel = $('#' + itemArr.join('-'));
                  if ($concatPanel.length == 0) return;
                  hidePanel();
                  $concatPanel.removeClass('hidden');

                  switch ($concatPanel.attr('ns-renderType')) {
                     case 'uploadCover':
                        //sjj 20190604 
                        $('#' + config.uploadCoverContainerId).find('.pt-media-list').html('');
                        if($.isArray(serverData[config.uploadCoverConfig.keyField])){
                           var imgArray = serverData[config.uploadCoverConfig.keyField];
                           console.log(imageListData)
                           for(var imgI=0; imgI<imgArray.length; imgI++){
                              var $mediaItem = $(imgUpload.mediaItem);
                              var fileId = imgArray[imgI][config.uploadCoverConfig.imgIdField];
                              $mediaItem.find('.deleteCoverImg').attr('ns-index', imgI);
                              $mediaItem.find('.setAsCover').attr('ns-index', imgI);
                              $mediaItem.find('.renameCoverImg').attr('ns-index', imgI);

                              $mediaItem.find('.deleteCoverImg').attr('ns-server',true);
                              $mediaItem.find('.setAsCover').attr('ns-server', true);
                              $mediaItem.find('.renameCoverImg').attr('ns-server', true);

                              $mediaItem.find('.deleteCoverImg').attr('ns-fileid', fileId);
                              $mediaItem.find('.setAsCover').attr('ns-fileid', fileId);
                              $mediaItem.find('.renameCoverImg').attr('ns-fileid', fileId);

                              var url = config.uploadCoverConfig.readSrcAjax.src + '/'+fileId;
                              $mediaItem.find('.pt-media-image img').attr('src', url);
                              $('#' + config.uploadCoverContainerId).find('.pt-media-list').append($mediaItem);
                           }  
                           imgUpload.addEvent();
                        }else{
                           if(imageListData.length > 0){
                              var imgArray = imageListData;
                              for(var imgI=0; imgI<imgArray.length; imgI++){
                                 var $mediaItem = $(imgUpload.mediaItem);
                                 var fileId = imgArray[imgI][config.uploadCoverConfig.imgIdField];
                                 $mediaItem.find('.deleteCoverImg').attr('ns-index', imgI);
                                 $mediaItem.find('.setAsCover').attr('ns-index', imgI);
                                 $mediaItem.find('.renameCoverImg').attr('ns-index', imgI);
   
                                 $mediaItem.find('.deleteCoverImg').attr('ns-server',true);
                                 $mediaItem.find('.setAsCover').attr('ns-server', true);
                                 $mediaItem.find('.renameCoverImg').attr('ns-server', true);
   
                                 $mediaItem.find('.deleteCoverImg').attr('ns-fileid', fileId);
                                 $mediaItem.find('.setAsCover').attr('ns-fileid', fileId);
                                 $mediaItem.find('.renameCoverImg').attr('ns-fileid', fileId);
   
                                 var url = config.uploadCoverConfig.readSrcAjax.src + '/'+fileId;
                                 $mediaItem.find('.pt-media-image img').attr('src', url);
                                 $('#' + config.uploadCoverContainerId).find('.pt-media-list').append($mediaItem);
                              }  
                              imgUpload.addEvent();
                           }
                        }
                       // imgUpload.selectQualityEvent();
                        break;

                     default:
                        break;
                  }
               },
               uploadCover: function (e) {
                  console.log(e);
               },
               showDraft: function(){
                  NetstarTemplate.draft.btnManager.show(config);
               },
            },
            mounted: function () {
               var config = this.config;
               var _this = this;
               var btnId = 'dialog-'+config.vueId+'-footer-group';
               if(config.$container){
                  btnId = config.$container.closest('.pt-modal-content').attr('id')+'-footer-group';
               }
               var btnArray = [];
               if(config.isHaveDataByAjaxBtn){
                  btnArray.push({
                     text:config.getDataByAjax.btnText,
                     handler:this.getDataByAjaxBtn,
                  });
               }
               if(!config.readonly){
                  btnArray.push({
                     text:'保存并关闭',
                     handler:this.save,
                     shortcutKey:'Ctrl+Shift+X',
                  });
               }
               if(config.isHaveSaveAndAdd && !config.readonly){
                  btnArray.push({
                     text:'保存并新增',
                     handler:this.saveAndAdd,
                     shortcutKey:'Ctrl+Shift+O',
                  });
               }
               if(config.draftBox.isUse && !config.readonly){
                  btnArray.push({
                     text:'草稿箱',
                     handler:this.showDraft,
                  });
               }
               btnArray.push({
                  text:'关闭',
                  handler:function(){
                     _this.close(false);
                  },
                  shortcutKey:'Alt+X',
               });
               var btnJson = {
                  id:btnId,
                  pageId:config.id,
                  package:config.package,
                  btns:btnArray
               };
               vueButtonComponent.init(btnJson);
               //console.log(config);
            },
         });
         originConfig.vm = vm;
         return vm;
      }
      //渲染form table组件
      function renderComponents(config, cb) {
         typeof _config != 'undefined'
            ? config = _config
            : "";
         for (var index = 0, len = config.formatComponentsArr.length; index < len; index++) {
            var item = config.formatComponentsArr[index];
            var formHandler;
            switch (item.renderType) {
               case 'form':
                  //获取页面配置方法
                  item.config.getPageDataFunc = (function (config) {
                     return function () {
                        return getPageData(config, false, false);
                     };
                  })(config);
                  if (item.config.keyField == 'root') {
                     var formValue = getDataByKeyField(item.config.keyField) || {};
                  } else {
                     var formValue = getDataByKeyField(item.config.keyField)[item.config.keyField] || {};
                  }
                  var component = NetstarComponent.formComponent.getFormConfig(item.config, formValue);
                  //设置表单完成回调
                  if (index == 0 && item.config.isSetFocus) {
                     //设置默认选中事件
                     item.config.completeHandler = function (obj) {
                        NetstarComponent.setFormFocus(obj.config.id);
                        cb && cb();
                     }
                  } else {
                     item.config.completeHandler = function (obj) {
                        cb && cb();
                     }
                  }
                  NetstarComponent.formComponent.init(component, item.config);
                  break;
               case 'grid':
                  var gridConfig = item.config;
                  //设置数据
                  if ($.isArray(item.templateOptions.dataSource)) {
                     gridConfig.data.dataSource = item.templateOptions.dataSource;
                  }
                  for (var i = 0; i < gridConfig.columns.length; i++) {
                     var item = gridConfig.columns[i];
                     if (item.columnType == 'business') {
                        item.editConfig.getTemplateValueFunc = getTemplateValueFunc;
                     }
                  }
                  //表格单独设置高度
                  gridConfig.ui.height = config.modalBodyMaxHeight - 32;
                  //发送函数名用来获取数据
                  for (var i = 0; i < gridConfig.columns.length; i++) {
                     var itm = gridConfig.columns[i];
                     if (typeof itm.editConfig != 'undefined' && itm.editConfig.type == 'business') {
                        //改为闭包
                        itm.editConfig.getTemplateValueFunc = (function (config) {
                           return function () {
                              return getPageData(config, false);
                           };
                        })(config);
                     }
                  }
                  if(config.formatComponentsArr[index].type == 'blockList'){
                     gridConfig.ui.listExpression = config.formatComponentsArr[index].templateOptions.listExpression;
                     gridConfig.ui.isCheckSelect = false;
                     var vueObj = NetstarBlockList.init(gridConfig);
                  }else{
                     var vueObj = NetStarGrid.init(gridConfig);
                  }
                  break;
               case 'uploadCover':
                  imgUpload.chooseImage();
                  break;
               default:
                  break;
            }
         }
      }

      /*********************************设置值 */
      function setDefaultData(cb) {
         //拿到编辑类型
         //var editorType;
         if (typeof config.pageParam != 'undefined') {
            //editorTypes
            if (typeof config.pageParam.editorType != 'undefined') {
               editorType = config.pageParam.editorType;
               //如果是编辑
               if (editorType == 'edit') {
                  config.isHaveSaveAndAdd = false;
               }
               delete config.pageParam.editorType;
            }
            //只读
            if (typeof config.pageParam.readonly != 'undefined') {
               config.readonly = config.pageParam.readonly;
               delete config.pageParam.readonly;
            }
         }

         if (typeof config.getValueAjax != 'undefined') {
            var ajax = nsVals.getAjaxConfig(config.getValueAjax, config.pageParam, {
               idField: config.components[0].idField,
               keyField: config.components[0].keyField
            });
            nsVals.ajax(ajax, function (res, _ajaxConfig) {
               if (res.success) {
                  if ($.isEmptyObject(res.data)) {
                     console.error('后台返回数据为空，请查看');
                  }
                  config.defaultData = res[ajax.dataSrc];

                  ServerDataByAjax = res[ajax.dataSrc];  //sjj 20190723 服务端返回数据值
                  //如果是复制新增
                  if (typeof editorType != 'undefined' && editorType === 'copyAdd') {
                     delete config.defaultData[config.idFieldNames.root];
                     config.defaultData = nsServerTools.deleteEmptyData(config.defaultData);
                     //如果是复制新增
                     for (var key in config.parentChildRelation) {
                        if (config.parentChildRelation.hasOwnProperty(key)) {
                           if (key !== 'root') {
                              deleteDataByKeyField(key, config.defaultData);
                           }
                        }
                     }
                  }
               }
               cb && cb();
            }, true);
         } else {
            config.defaultData = $.extend(true, {}, config.pageParam || {});
            //如果是复制新增
            if (typeof editorType != 'undefined' && editorType === 'copyAdd') {
               delete config.defaultData[config.idFieldNames.root];
               config.defaultData = nsServerTools.deleteEmptyData(config.defaultData);
               //如果是复制新增
               for (var key in config.parentChildRelation) {
                  if (config.parentChildRelation.hasOwnProperty(key)) {
                     if (key !== 'root') {
                        deleteDataByKeyField(key, config.defaultData);
                     }
                  }
               }
            }
            cb && cb();
         }
      }
      //填充数据然后重新渲染
      function setData(data, keyField) {
         if (typeof keyField == 'undefined') {
            config.defaultData = data ? data : {};
         } else {
            config.defaultData[keyField] = data;
         }
         refreshCompnent(data);
         setServerData();
      }
      //设置serverData
      function setServerData() {
         serverData = $.extend(true, {}, getPageData(config, true, false));
         if(config.uploadCoverConfig){
            if($.isArray(config.defaultData[config.uploadCoverConfig.keyField])){
               serverData[config.uploadCoverConfig.keyField] = $.extend(true,[],config.defaultData[config.uploadCoverConfig.keyField]);
               imageListData = config.defaultData[config.uploadCoverConfig.keyField];
            }
         }
      }

      /*********************************刷新 */
      //刷新页面数据
      function refreshCompnent(data, _isRestore) {
         $.each(config.components, function (index, item) {
            var id = item.id;
            var keyField = item.keyField;
            var parent = item.parent;
            var fillValues = getDataByKeyField(keyField, data);
            if (item.type == 'vo') {
               NetstarComponent.fillValues(fillValues, id);
            } else if (item.type == 'list') {
               NetStarGrid.refreshDataById(id, fillValues[keyField]);
            }
         });
      }

      /*********************************获取值 */
      //根据keyField获得该数据
      function getDataByKeyField(keyField, data) {
         if (typeof config.parentChildRelation[keyField] == 'undefined') return false;
         var fillValueData = config.defaultData;
         if(editorType=='copyAdd'){
            //sjj 20190506 如果当前操作是复制新增
            fillValueData =  config.defaultData.copyParams;
         }
         var variableData = typeof data == 'undefined' ? fillValueData : data;
         if (typeof config.parentChildRelation[keyField] == 'undefined') return;
         var currentRelation = config.parentChildRelation[keyField].replace(/root\./g, "");
         if (currentRelation != 'root') {
            var variableJson = {};
            variableJson[keyField] = "{" + currentRelation + "}";
            return nsVals.getVariableJSON(variableJson, variableData);
         } else {
            return variableData;
         }
      }
      //根据keyField删除数据
      function deleteDataByKeyField(keyField, data) {
         var element = config.parentChildRelation[keyField];
         var currentRelationArr = element.split('.');
         currentRelationArr.shift();
         var arrLen = currentRelationArr.length;

         delete data[currentRelationArr]
      }
      //拼接页面现有数据
      function getPageData(_config, isNotObjectState, _formVerify) {
         if (_config) {
            config = _config;
         }
         var pageData = $.extend(true, {}, config.defaultData);

         //sjj 20190506 如果当前操作类型是复制新增 则应该删除复制新增的值
         if(editorType=='copyAdd'){
            delete pageData.copyParams;
            serverData = {};
         }
         var fillValue = {};
         isError = false;
         $.each(config.components, function (index, item) {
            switch (item.type) {
               case 'vo':
                  if(!(NetstarComponent.config[item.id] && typeof(NetstarComponent.config[item.id].vueConfig) == "object")){
                     break;
                  }
                  fillValue = NetstarComponent.getValues(item.id, _formVerify);
                  //sjj 20190515 如果当前操作是保存并新增才需要删除主键id或者当前操作是复制并新增都不需要发送主键id 
                  if(editorType == 'copyAdd'){
                     delete fillValue[config.idFieldNames.root];
                  }else{
                     if(config.operatorType == 'saveAndAdd'){
                        delete fillValue[config.idFieldNames.root];
                     }
                  }
                  /*sjj 20190515 start获取vo值 需要做进一步的判断逻辑 如果当前vo值存在于界面来源参pageParams中，则最后入参的参数取决于当前vo编辑是否有值*/
                     /*比如vo{id:'333',name:'333',sex:'333'},pageParams:{id:'333',userid:'dddd'}此时vo中不存在userid是因为此值为数值类型，值为空所以无此参数
                     ，而pageParams中存在，需要把userid从pageParms参数中移除
                     */
                  var voComponentConfig = NetstarComponent.config[item.id].config;
                  for(var voField in voComponentConfig){
                     delete pageData[voField];
                  }
                  /*******sjj 20190515 end************/
                  break;
               case 'list':
                  if(typeof(NetStarGrid.configs[item.id]) != "object"){
                     break;
                  }
                  fillValue = _formVerify === false ? NetStarGrid.dataManager.getData(item.id) : verifyGridData(item.id, config, index);
                  break;
               default:
                  break;
            }
            if (!fillValue) {
               isError = true;
            }
            /* if (!(fillValue instanceof Array)) {
               //去除空值
               fillValue = nsServerTools.deleteEmptyData(fillValue);
            } */
            setDataByKeyField(item.keyField, fillValue, pageData, config);
            fillValue = {};
         });
         if (isError) {
            return false;
         }
         //从临时数据中添加数据
         /*for (var key in config.tempData) {
            if (config.tempData.hasOwnProperty(key)) {
               var element = config.tempData[key];
               if (typeof element == 'object' && !$.isEmptyObject(element)) {
                  pageData[key] = element;
               }
            }
         }*/
         //去除空object
         if(config.uploadCoverConfig){
            pageData[config.uploadCoverConfig.keyField] = imageListData; //sjj 20190604
         }
         for (var key in pageData) {
            if (pageData.hasOwnProperty(key)) {
               var element = pageData[key];
               if (typeof element == 'object' && $.isEmptyObject(element)) {
                  delete pageData[key];
               }
            }
         }
         // pageData = nsServerTools.deleteEmptyData(pageData);
         //设置objectState
         if (typeof isNotObjectState == 'undefined' || (typeof isNotObjectState == 'boolean' && !isNotObjectState)) {
            pageData = nsServerTools.getObjectStateData(ServerDataByAjax, pageData, config.idFieldNames);
         }
         if(editorType == 'edit'){
            pageData.objectState = NSSAVEDATAFLAG.EDIT;
         }
         return pageData;
      }
      //检验表格数据是否合法
      function verifyGridData(gridId, config, index) {
         //表格数据
         var gridData = NetStarGrid.dataManager.getData(gridId);
         //验证结果
         var verifyResult = true;
         //是否有必填
         var hasRequired = {
            required: false,
            info: []
         };
         var legalMsg = "";
         var mainGridConfigManager = NetStarGrid.configs[gridId];
         var mainGridConfig = mainGridConfigManager.gridConfig;
         var columns = mainGridConfig.columns;
         var verifyRuleObj = [];
         for (var index = 0; index < columns.length; index++) {
            var item = columns[index];
            if (typeof item.editConfig != 'undefined') {
               if (typeof item.editConfig.rules != 'undefined' && item.editConfig.rules.indexOf('required') != -1) {
                  hasRequired.required = true;
                  hasRequired.info.push({
                     id: item.editConfig.id,
                     name: item.editConfig.label
                  })
               }
               verifyRuleObj[item.editConfig.id] = {
                  keyField: item.editConfig.id,
                  rules: item.editConfig.rules,
                  type: item.editConfig.type,
                  name: item.editConfig.label
               };
            }
         }

         for (var index = 0; index < gridData.length; index++) {
            var item = gridData[index];
            for (var key in item) {
               if (item.hasOwnProperty(key) && typeof verifyRuleObj[key] != 'undefined') {
                  var value = item[key];
                  var element = verifyRuleObj[key];
                  element.value = value;
                  var islegal = NetstarComponent.validatValue(element);
                  if (!islegal.isTrue) {
                     if (islegal.validatInfo.indexOf(',') != -1) {
                        islegal.validatInfo = islegal.validatInfo.substr(0, islegal.validatInfo.length - 1);
                     }
                     if (legalMsg.indexOf(key) == -1) {
                        //(' + key + ')
                        legalMsg += element.name + ': ' + islegal.validatInfo + ',';
                     }
                     verifyResult = false;
                  }
               }
            }
         }

         /* if ($.isEmptyObject(gridData) && hasRequired.required) {
            nsalert('请在表格(' + config.components[index].title + ')内填写处理内容', 'error');
            console.error('请填写表格' + config.components[index].title + '必填字段');
            return false;
         } */

         if (verifyResult) {
            return gridData;
         } else if (!verifyResult) {
            legalMsg = legalMsg.substr(0, legalMsg.length - 1);
            nsalert(legalMsg, 'error');
            return false;
         }
      }
      //根据keyField设置data
      function setDataByKeyField(keyField, data, pageData, config) {
         if (typeof keyField == 'undefined') return false;
         var currentRelation = config.parentChildRelation[keyField];
         if (currentRelation == 'root') {
            for (var key in data) {
               if (data.hasOwnProperty(key)) {
                  var element = data[key];
                  pageData[key] = element;
               }
            }
         } else {
            var currentRelationArr = currentRelation.split('.');
            currentRelationArr.shift();
            var arrLen = currentRelationArr.length;
            $.each(currentRelationArr, function (index, item) {
               if (index != arrLen - 1 && typeof pageData[item] == 'undefined') {
                  pageData[item] = {};
               } else if (index == arrLen - 1) {
                  pageData[item] = data;
               }
            });
         }
      }

      /*********************************通用 */
      //拿到idFieldName
      function getIdFieldName() {
         config.idFieldNames = {};
         for (var i = 0; i < config.components.length; i++) {
            var item = config.components[i];
            //if (item.type == 'uploadCover') continue;
            if(item.keyField && item.idField){
               //sjj 20190429  keyfield和idField必须同时存在的时候
               config.idFieldNames[config.parentChildRelation[item.keyField]] = item.idField;
            }
            //sjj 20190506 如果当前类型是vo，vo中field字段为business类型也会存在keyField和idField
            switch(item.type){
               case 'vo':
                  for(var fieldI=0; fieldI<item.field.length; fieldI++){
                     if(item.field[fieldI].type == 'business'){
                        config.idFieldNames['root.'+item.field[fieldI].id] = item.field[fieldI].idField;
                     }
                  }
                  break;
            }
         }
         // return idFieldNames;
      }
      //返回模版数据
      function getTemplateValueFunc() {
         return getPageData(config, false, false);
      }
      //面板下div全部设置为隐藏
      function hidePanel() {
         $.each(config.tabIdFields, function (idx, itm) {
            var itemArr = itm.split('-');
            itemArr.pop();
            var $panel = $('#' + itemArr.join('-'));
            if ($panel.length == 0) return;
            $panel.addClass('hidden');
         });
      }
      return {
         init: init
      }
   })(jQuery);

   return {
      init: function (outerConfig) {
         dialogForAdd.init(outerConfig)
      }
   }
})(jQuery)