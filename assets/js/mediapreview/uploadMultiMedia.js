nsUI.uploadMultiMedia = (function ($) {
   'use strict';
   /**
    * id
    * getValueAjax
    * editorAjax
    * deleteAjax
    */
   var config = {};
   var uploadImgVm;
   function init(outerConfig) {
      setDefault(outerConfig);
      setDefaultData(function () {
         dialogInit(function (dialogConfig) {
            vueInit(dialogConfig);
         });
      });
   }
   function setDefault(outerConfig) {
      config = $.extend(true, {}, outerConfig);
      if (typeof config.id == 'undefined') {
         nsalert('请配置id');
         return false;
      }
      var defaultConfig = {
         getValueAjax: {
            // url: 'http://110.86.26.234:9999/Lims/app/getAcceptPicture.json',
            url: getRootPath() + '/assets/js/mediapreview/getImage.json',
            type: "GET",
            data: {},
            dataSrc: 'data'
         },
         editorAjax: {
            url: '',
            type: "POST",
            data: {},
            dataSrc: 'data'
         },
         deleteAjax: {
            url: '/app/updateFileDescription',
            type: "POST",
            data: {},
            dataSrc: 'data'
         }
      }
      config.pictureField = config.pictureField ? config.pictureField : 'appPictureModel';
      nsVals.setDefaultValues(config, defaultConfig);
   }
   function setDefaultData(cb) {
      if (typeof config.getValueAjax != 'undefined') {
         config.getValueAjax.data = config.pageParam;
         nsVals.ajax(config.getValueAjax, function (res) {
            if (res.success) {
               nsalert(res.msg);
               config.defaultData = res[config.getValueAjax.dataSrc];
               config.appPictureModel = res[config.pictureField];
               //config.appPictureModel = res.appPictureModel;
               console.log(res);
            } else {
               console.error(res);
               nsalert(res.msg, 'error');
               return false;
            }
            typeof cb == 'function' && cb();
         })
      } else {
         typeof cb == 'function' && cb();
      }
   }
   function dialogInit(cb) {
      cb && typeof cb == 'function'
         ? config.shownHandler = cb : '';
     nsdialog.initShow(config);
   }
   function vueInit(_config) {
      var vueConfig = $.extend(true, {}, typeof _config != 'undefined' ? _config : config);
      vueConfig.el = vueConfig.id + '-' + new Date().valueOf();
      $('#' + vueConfig.id).find('.modal-body').attr('id', vueConfig.el);
      $('#' + vueConfig.id).find('.modal-body').empty();
      $('#' + vueConfig.id).find('.modal-body').append('<form role="form" id="form-plane-upload-image" method="get" action="" onsubmit="return false;" class="form-horizontal"><div class="row fillbg row-close"></div></form>')
      //设置滚动
      var modalMaxHeight = $('body').height() - ($('#' + vueConfig.el).offset().top + parseFloat($('#' + vueConfig.el).css('margin-bottom'))) - ($('.modal-footer').height() + parseFloat($('.modal-footer').css('padding-top'))) - parseFloat($('.modal-dialog').css('margin-bottom'));
      $('#' + vueConfig.id).find('.modal-body').css('max-height', modalMaxHeight - 22);
      $('#' + vueConfig.id).find('.modal-body').css('overflow-y', 'auto');
      console.log(vueConfig);
      uploadImgVm = new Vue({
         el: '#' + vueConfig.el,
         data: {
            vueConfig: vueConfig,
            itemWidth: (1 / vueConfig.column * 100).toFixed(4).substr(0, (1 / vueConfig.column * 100).toFixed(4).length - 1),
            alreadyHave: 0,
            limitType: "gif,jpeg,bmp,png,jpg".split(','),
            viedoClass: 'pt-media-video'
         },
         created: function () {
            var html = {
               templateHtml: '<div class="pt-upload">\
                                 <!-- 图片列表 -->\
                                 <div class="pt-media-list clearfix">\
                                    <template  v-for="(item,index) in vueConfig.defaultData" :key="item.id" >\
                                       <div class="pt-media-item" :style="{ width:itemWidth + \'%\',float:\'left\' }">\
                                          <!-- 图片 -->\
                                          <div class="pt-media-image" @click="previewImg($event, item, index)" :class="[item.fileType == \'mp4\' ? viedoClass : \'\']">\
                                             <a href="#">\
                                                <img :ns-type="item.fileType" :src="item.absoluteThumuploadPath" :data-original="item.absolutePath" width="100%" height="100%">\
                                             </a>\
                                             <div class="pt-media-edit">\
                                                <div class="pt-btn-group">\
												   <button class="pt-btn pt-btn-icon downloadCoverImg" title="下载" @click.stop="downloadImg(item, index)">\
                                                         <i class="fa-download"></i>\
                                                   </button>\
                                                   <button class="pt-btn pt-btn-icon deleteCoverImg" title="删除" @click.stop="deleteImg(item, index)">\
                                                         <i class="icon-trash"></i>\
                                                   </button>\
                                                </div>\
                                             </div>\
                                          </div>\
                                          <!-- 图片名称 -->\
                                          <div class="pt-media-title">\
                                             <a href="#">\
                                                <span>{{item.fileDescription}}</span>\
                                             </a>\
                                             <!-- 编辑状态 -->\
                                             <button class="pt-btn pt-btn-icon pt-btn-link renameCoverImg"  @click="editImgName($event, item,index)">\
                                                <i class="fa-pencil"></i>\
                                             </button>\
                                          </div>\
                                       </div>\
                                    </template>\
                                 </div>\
                              </div >',
            };
            $('#' + vueConfig.el).append(html.templateHtml);
         },
         methods: {
            previewImg: function (e, currentFile, index) {
               if (currentFile.fileType == 'mp4') {
                  e.preventDefault();
                  e.returnValue = false;
                  var mp4Config = {
                     id: "plane-uploadImage-viewMp4",
                     title: "查看视频",
                     size: 'b',
                     shownHandler: function (options) {
                        $('#' + options.id).find('.modal-body').append('<video controls="" autoplay="" name="media" style="width:100%;height:100%;"><source src="' + currentFile.absolutePath + '" type="video/mp4"></video>');
						$('#' + options.id).find('.modal-body').css('height', modalMaxHeight - 22);
                     }
                  }
                  nsdialogMore.initShow(mp4Config);
               }
            },
            editImgName: function (e, item, index) {
               var vm = this;
               var $parent = $('#' + this.vueConfig.el);
               $parent.find('.renameCoverImg').addClass('hidden');
               var $this = $(e.target);
               var $span = $this.parents('.pt-media-title').find('span');
               var beforeName = item.fileDescription;
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
                  $parent.find('.renameCoverImg').removeClass('hidden');
               });
               $editContainer.find('button.confirm').on('click', function () {
                  var afterName = $editContainer.find('input').val();
                  vm.vueConfig.editorAjax.data = {
                     id: item.id,
                     userId: item.userId,
                     fileId: item.fileId,
                     fileDescription: afterName,
                     acceptId: vm.vueConfig.appPictureModel.acceptId
                  }
                  nsVals.ajax(vm.vueConfig.editorAjax, function (res) {
                     if (res.success) {
						 typeof res.msg != 'undefined' ?
							nsalert(res.msg):
							'';
                        // $span.text(afterName);
                        $span.removeClass('hidden');
                        $editContainer.remove();

                        vm.vueConfig.defaultData[index].fileDescription = afterName;
                        $parent.find('.renameCoverImg').removeClass('hidden');
                     } else {

                        nsalert(res.msg, 'error');
                     }
                  })
               })
            },
            deleteImg: function (item, index) {
               var vm = this;
               vm.vueConfig.deleteAjax.data = {
                  userId: item.userId,
                  fileId: item.fileId,
                  acceptId: vm.vueConfig.appPictureModel.acceptId
               }
               nsVals.ajax(vm.vueConfig.deleteAjax, function (res) {
                  if (res.success) {
                     nsalert('删除成功');
                     vm.vueConfig.defaultData.splice(index, 1);
                  } else {
                     nsalert(res.msg, 'error');
                  }
               });
            },
			downloadImg:function(item,index){
				var file = new Attachment(item.fileId);
				file.download();
			}
         },
         mounted: function () {
            $('#' + vueConfig.el).viewer({
				url: 'data-original',
               hidden: function (option) {
                  $('.viewer-container').remove();
               }
            });
         }
      });
      return uploadImgVm;
   }
   return {
      init: init
   }
})(jQuery);