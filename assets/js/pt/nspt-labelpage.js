typeof NetstarUI == 'undefined' ? NetstarUI = {} : "";
NetstarUI.labelPages = function (id, containerParent) {
   var functionHandler = {
      //点击tab页时调用的方法
      recordHandler: function (index) {
         var currentPage = rowNavVue.labelPagesArr[index];
         // typeof NetStarRabbitMQ != 'undefined' && NetStarRabbitMQ.inPageHandler(currentPage.currentLi);
         typeof NetStarRabbitMQ != 'undefined' && NetStarRabbitMQ.inPageHandler(currentPage.attrs, currentPage);
      },
      //关闭调用
      closeHandler: function (index) {
         var currentPage = rowNavVue.labelPagesArr[index];
         typeof NetStarRabbitMQ != 'undefined' && NetStarRabbitMQ.unsubscribeByUntId(typeof currentPage.config != 'undefined' ? currentPage.config.package : '');
      },
      //刷新调用
      refreshHandler: function (currentPage) {
         typeof NetStarRabbitMQ != 'undefined' && NetStarRabbitMQ.refreshInfoRemind(currentPage.attrs);
      }
   };
   var rowNavVue = new Vue({
      el: "#" + id,
      data: {
         containerParent: containerParent,
         currentTab: 0,
         navFunctionShow: false,
         labelPagesArr: []
      },
      created: function () {
         this.labelPagesArr.push({
            title: '首页',
            url: '/home',
            dom: $(this.containerParent).find('container:not(.hidden)').get(0),
            config: "",
            attrs: {}
         });
         var tabHtml = '<div class="pt-nav">\
                                <ul>\
                                    <li class="pt-nav-item"\
                                    v-for="(item, index) in labelPagesArr" :key="item"\
                                     @click="recordCurrent(index,$event)" @mouseenter.stop.prevent="mouseEnterCurrent($event)"\>\
                                        <a href="javascript:void(0);">\
                                        {{item.title}}\
                                        </a>\
                                        <div v-if="index != 0" @click.stop="removeCurrent(index)" class="pt-btn-clear">\
                                            <i class="icon-close-alt-o"></i>\
                                        </div>\
                                    </li>\
                                </ul>\
                            </div>\
                            <div class="pt-nav pt-tabbar-control">\
                                <div class="pt-nav-toggle" @click="toggleNavFunction">\
                                    <i class="icon-ellipsis-h"></i>\
                                </div>\
                                <ul v-show="navFunctionShow" class="pt-dropdown-menu">\
                                    <li class="pt-nav-item" @click="removeAll"><span>关闭全部标签</span></li>\
                                    <li class="pt-nav-item" @click="removeOther"><span>关闭其他标签</span></li>\
                                    <li class="pt-nav-item" @click="removeCurrent(currentTab)"></i><span>关闭当前标签</span></li>\
                                </ul>\
                            </div>';
         $('#' + id).append(tabHtml);
      },
      methods: {
         //加载页面
         loadPage: function (url, title, isAlwaysNewTab, pageOperateData, isCachePage) {

            // pageOperateData : 当前页面的操作数据 用于newtab按钮 ；lyw 20190620
            // isCachePage : 是否缓存页面 默认true
            typeof isCachePage != 'boolean' ? isCachePage = true : "";
            var vm = this;
            if ($.trim(url).length == 0 || $.trim(url) == '#') return;
            //如果超过20个，则提示不可再添加
            if (vm.labelPageLength > 10) {
               return nsalert('超过页面数上限', 'warning');
            }

            //如果传参为obj，则调用另一方法
            if (typeof url == 'object') {
               vm.loadType = 'object';
               vm.containerObj = this.getPageByObj(url);
               url = vm.containerObj.id + ';';
               for (var key in vm.containerObj.attrs) {
                  if (vm.containerObj.attrs.hasOwnProperty(key)) {
                     var element = vm.containerObj.attrs[key];
                     url += key + '=' + element + ';';
                  }
               }
               title = vm.containerObj.title;
            } else {
               vm.loadType = 'ajaxUrl';
            }
            //是否打开新的tab页
            if (typeof isAlwaysNewTab == 'boolean' && !isAlwaysNewTab) {
               vm.isNewTab = false;
            } else {
               vm.isNewTab = true;
            }
            //根据url来构建contaienrId
            var separatorArr = ['?', ';'];
            vm.currentContainerId = url.replace(/(\/|\:|\.)/g, '-');  //zy 20190620 添加了对.：替换为'-'的逻辑
            vm.currentUrl = url;//sjj 20190711 存储当前的url地址
            $.each(separatorArr, function (index, item) {
               if (vm.currentContainerId.indexOf(item) != '-1') {
                  vm.currentContainerId = vm.currentContainerId.substring(0, vm.currentContainerId.indexOf(item));
               }
            });
            //如果已经打开过，且没有关闭过，则打开
            var urlIndex = this.urlIsOpen(url);

            if (urlIndex != -1) {
               vm.recordCurrent(urlIndex);
            } else {
               //先隐藏当前页面，并添加新的容器
               var $containerParent = $(vm.containerParent);
               var $currentContainer = $containerParent.find('container:not(.hidden)');
               $currentContainer.addClass('hidden');
               if (typeof $currentContainer.attr('id') == 'undefined') {
                  //如果没有id则添加时间戳
                  var homePageId = 'projectHomePage' + '-' + new Date().valueOf();
                  $currentContainer.attr('id', homePageId);
                  vm.hiddenContainerId = homePageId;
               } else {
                  vm.hiddenContainerId = $currentContainer.attr('id');
               }
               //如果当前有这个容器，说明已经有这个页面了，那么就要进行if里面的操作
               var findUrl = vm.currentContainerId.replace(/-/g, '/');
               var index = vm.arrayIsInclude(findUrl);

               if (index != -1) {
                  //如果是用object加的页面。则直接显示那个页面
                  if (vm.loadType == 'object') {
                     vm.recordCurrent(index);
                     return false;
                  }
                  //否则进行以下操作
                  if (vm.isNewTab) {
                     vm.isEditConfig = true;
                     vm.currentContainerId = vm.currentContainerId + '-' + new Date().valueOf();
                     $containerParent.append('<container id="' + vm.currentContainerId + '"></container>');
                     vm.labelPagesArr.push({
                        title: title,
                        url: url,
                     });
                  } else {
                     //sjj 20190806 添加方法 vm.labelPagesArr[index].dom不存在时候的逻辑补充
                     if(typeof(vm.labelPagesArr[index].dom)=='undefined'){
                        vm.labelPagesArr[index].dom = $('#'+vm.currentContainerId);
                        $('#'+vm.currentContainerId).empty();
                        $('#'+vm.currentContainerId).removeClass('hidden');
                        vm.currentTab = index;
                        functionHandler.recordHandler(index);
                        vm.setCurrent(index);
                     }else{
                        $(vm.labelPagesArr[index].dom).empty();
                        vm.recordCurrent(index);
                        vm.currentContainerId = $(vm.labelPagesArr[index].dom).attr('id');
                     }
                  }
               } else {
                  $containerParent.append('<container id="' + vm.currentContainerId + '"></container>');
                  //将title 和 url 事先添加进去(造成加载很快的假象)
                  vm.labelPagesArr.push({
                     title: title,
                     url: url,
                  });
               }
               setTimeout(function(){
                  vm.getJsp(url, pageOperateData, isCachePage);
               },0)
            }
         },
         //通过url请求页面内容
         getJsp: function (url, pageOperateData, isCachePage) {
            // pageOperateData : 当前页面的操作数据 用于newtab按钮 ；lyw 20190620
            var vm = this;
            var _url = "";
            //zy 20190620 如果url本身已经有http开头，则不再追加 getRootPath start------
            if(url.indexOf("http") == 0){
              _url = url;
            }else{
              _url = getRootPath() + url;
            }
            //zy 20190620 end------

            var pageConfig = {
                pageIidenti : url,
                url : _url,
                isCachePage : isCachePage,
                pageOperateData : pageOperateData,
                callBackFunc : function(isSuccess, data, _pageConfig){
                    if(isSuccess){
                        res = data;
                        var pageOperateDataStr = typeof(_pageConfig.pageOperateData) == "object" ? JSON.stringify(_pageConfig.pageOperateData) : '{}'; 
                        var $currentContainer = $(vm.containerParent).find('container#' + vm.currentContainerId);

                        var resPageParam = vm.getContainerAndConfigName(res);
                        var templateInit = resPageParam.templateInit;
                        var containerHtml =resPageParam.containerHtml;
                        var configName = resPageParam.configName;

                        if(templateInit){
                          templateInit[0] = templateInit[0].replace(configName, configName + ', ' + pageOperateDataStr);
                        }
                        
                        //渲染到页面上
                        if (vm.isEditConfig && templateInit) {
                            vm.labelPagesArr[vm.labelPageLength - 1].isEditConfig = true;
                            var addHtml = configName + ".package = " + configName + ".package + '.' +" + new Date().valueOf() + ";" + templateInit[0];
                           //  containerHtml = containerHtml.replace(/NetstarTemplate\.init[\s]*\((\S+)\)/, addHtml);
                           containerHtml = containerHtml.replace(/NetstarTemplate\.init\((.*?)\)/, addHtml);
                        } else {
                            vm.labelPagesArr[vm.labelPageLength - 1].isEditConfig = false;
                        }
                        //如果有配置的话，则添加以下内容
                        if ($.trim(configName).length != 0) {
                            var addHtml = templateInit[0] + ';' + 'NetstarUI.labelpageVm.setContaienrConfig("' + url + '",' + configName + ')';
                            containerHtml = containerHtml.replace(/NetstarTemplate\.init\((.*?)\)/, addHtml);
                        } else {
                            vm.loadType == 'object' ?
                                vm.labelPagesArr[vm.labelPageLength - 1].config = $.extend(true, {}, vm.containerObj) :
                                vm.labelPagesArr[vm.labelPageLength - 1].config = '';
                        }
                        vm.labelPagesArr[vm.labelPageLength - 1].ajaxRes = res;

                        //sjj 20190710
                        if(typeof(NetstarOriginalMenuList) == "object" && NetstarOriginalMenuList[url]){
                           var timerStr = 'container-simple-table-'+new Date().valueOf();
                           var formId = 'form-scientificInput-'+new Date().valueOf();
                           containerHtml = containerHtml.replace('container-simple-table',timerStr);
                           containerHtml = containerHtml.replace('#container-simple-table','#'+timerStr);
                           var regRules = new RegExp("form-scientificInput","g");
                           containerHtml = containerHtml.replace(regRules,formId);
                           //containerHtml = containerHtml.replace('form-scientificInput',formId);
                        }


                        $currentContainer.append(containerHtml);
                        vm.isNewTab ? vm.labelPagesArr[vm.labelPageLength - 1].dom = $currentContainer.get(0) : '';
                        //设置currentTab
                        vm.currentTab = vm.labelPageLength - 1;
                        functionHandler.refreshHandler(vm.labelPagesArr[vm.labelPageLength - 1]);
                    }else{
                        vm.labelPagesArr.pop();
                        $('#' + vm.hiddenContainerId).removeClass('hidden');
                        $('#' + vm.currentContainerId).remove();
                        NetStarUtils.defaultAjaxError(data);
                        console.error('请求错误，错误代码：' + data.status);
                    }
                },
            }
            var ajaxConfig = {
               url: getRootPath() + url,
               type: "GET",
               data: {},
               success: function (res) {
                  if (typeof res.msg != 'undefined') {
                     nsalert(res.msg);
                     return false;
                  }
                  if(typeof(res) == "object"){
                     res = pageProperty.getPageHtml(res.data);
                  }
                  var $currentContainer = $(vm.containerParent).find('container#' + vm.currentContainerId);
                  var templateInit = vm.getContainerAndConfigName(res).templateInit;
                  var containerHtml = vm.getContainerAndConfigName(res).containerHtml;
                  var configName = vm.getContainerAndConfigName(res).configName;
                  //渲染到页面上
                  if (vm.isEditConfig && templateInit) {
                     vm.labelPagesArr[vm.labelPageLength - 1].isEditConfig = true;
                     var addHtml = configName + ".package = " + configName + ".package + '.' +" + new Date().valueOf() + ";" + templateInit[0];
                     containerHtml = containerHtml.replace(/NetstarTemplate\.init[\s]*\((\S+)\)/, addHtml);
                  } else {
                     vm.labelPagesArr[vm.labelPageLength - 1].isEditConfig = false;
                  }
                  //如果有配置的话，则添加以下内容
                  if ($.trim(configName).length != 0) {
                     var addHtml = templateInit[0] + ';' + 'NetstarUI.labelpageVm.setContaienrConfig("' + url + '",' + configName + ')';
                     containerHtml = containerHtml.replace(/NetstarTemplate\.init[\s]*\((\S+)\)/, addHtml);
                  } else {
                     vm.loadType == 'object' ?
                        vm.labelPagesArr[vm.labelPageLength - 1].config = $.extend(true, {}, vm.containerObj) :
                        vm.labelPagesArr[vm.labelPageLength - 1].config = '';
                  }
                  vm.labelPagesArr[vm.labelPageLength - 1].ajaxRes = res;
                  $currentContainer.append(containerHtml);
                  vm.isNewTab ? vm.labelPagesArr[vm.labelPageLength - 1].dom = $currentContainer.get(0) : '';
                  //设置currentTab
                  vm.currentTab = vm.labelPageLength - 1;
                  //lxh 缓存机制 19/02/20
                  // NetstarCatchHandler.setCatch(vm.currentContainerId, res);
               },
               fail: function (err) {
                  console.log(err);
               },
               error: function (XMLHttpRequest, textStatus, errorThrown) {
                  vm.labelPagesArr.pop();
                  $('#' + vm.hiddenContainerId).removeClass('hidden');
                  $('#' + vm.currentContainerId).remove();
                  NetStarUtils.defaultAjaxError(XMLHttpRequest);
               },
            };
            // $.ajax(ajaxConfig);
            //lxh 缓存机制 19/02/20
            /* if (!!NetstarCatchHandler.getCatch(vm.currentContainerId)) {
                ajaxConfig.success(NetstarCatchHandler.getCatch(vm.currentContainerId));
            } else {
            } */
            if (vm.loadType == 'object') {
               vm.$nextTick(function () {
                  ajaxConfig.success('<container>' + (vm.containerObj.html ? vm.containerObj.html : "") + '</container>');
                  vm.setContaienrConfig(url, { pageParam: vm.containerObj.attrs });
                  typeof vm.containerObj.shownHandler == 'function' && vm.containerObj.shownHandler({ jqDom: $('#' + id).find('li').eq(vm.labelPageLength - 1) });
                  delete vm.containerObj;
               });
            } else if (vm.loadType == 'ajaxUrl') {
               // $.ajax(ajaxConfig);
               pageProperty.getAndCachePage(pageConfig);
            }
         },
         getContainerHtml:function(htmlString){
            //优先根据 container 标签匹配 其次根据 body标签进行匹配
            var containerHtml = '';
            var matchTag = 'container';
            var lastIndex = htmlString.lastIndexOf('</' + matchTag + '>');
            var firstIndex = htmlString.indexOf('<' + matchTag + '>');
            if (firstIndex != -1 && lastIndex != -1) {
               containerHtml = htmlString.substring(firstIndex + ('<' + matchTag + '>').length, lastIndex);
            } else {
               matchTag = 'body';
               if (firstIndex != -1 && lastIndex != -1) {
                  containerHtml = htmlString.substring(firstIndex + ('<' + matchTag + '>').length, lastIndex);
               } else {
                  //如果不包含 container 和 body 标签则全部返回
                  console.warn('加载页面时，没有找到 container 和 body 标签');
                  containerHtml = htmlString;
               }
            }
            return containerHtml;
         },
         //获取container的内容和配置
         getContainerAndConfigName: function (htmlString) {

            //获取ajax返回HTML或者代码段中的有效代码
            var containerHtml = this.getContainerHtml(htmlString);

            //获得当前页面配置
            var templateInit = containerHtml.match(/NetstarTemplate\.init[\s]*\((\S+)\)/);
            var configName = templateInit != null ? templateInit[1] : "";

            return {
               containerHtml: containerHtml,
               configName: configName,
               templateInit: templateInit
            };
         },
         //根据obj属性添加页面
         getPageByObj: function (options) {
            var defaultOptions = {
               id: new Date().valueOf(),
               title: '无标题',
               attrs: {},
               shownHandler: function (elid) { }
            };
            nsVals.setDefaultValues(options, defaultOptions);
            if ($.trim(options.id).length == 0) {
               options.id = new Date().valueOf();
            } else {
               switch(options.type){
                  case 'workflowTab':
                      options.id = options.id;
                      break;
                  default:
                      options.id = options.id + "/" + new Date().valueOf();
                      break;
               }
               // options.id = options.id + "/" + new Date().valueOf();
            }
            if ($.trim(options.title).length == 0) {
               options.title = '无标题';
            }
            return $.extend(true, {}, options);
         },
         //记录更改 currentTab
         recordCurrent: function (index) {
            this.currentTab = index;
            var $currentContainer = $(this.containerParent).find('container:not(.hidden)');
            $currentContainer.addClass('hidden');
            $(this.labelPagesArr[index].dom).removeClass('hidden');
            //调用rabbitMq刷新tab页信息
            //$('#' + id).find('li').eq(index)
            functionHandler.recordHandler(index);
            this.setCurrent(index);
         },
         //移除当前页面
         removeCurrent: function (index) {
            this.navFunctionShow = false;
            var _this = this;
            typeof index != 'undefined' ? '' : index = _this.currentTab;
            //执行关闭函数
            var pageConfig = this.labelPagesArr[index].config;

            if(typeof(pageConfig)=='undefined'){
               pageConfig = {};
            }

            if(NetstarTemplate.templates.configs[pageConfig.package]){
               pageConfig = NetstarTemplate.templates.configs[pageConfig.package];
            }

            if (typeof pageConfig.beforeCloseHandler == 'function') {
               var getValue = pageConfig.beforeCloseHandler(pageConfig.package);
               if (!nsVals.isEqualObject(getValue.getPageData, getValue.serverData)) {
                  nsconfirm('当前页面修改后末保存,是否关闭?', function (state) {
                     if (state) {
                        _this.closeByIndex(index);
                     }
                  }, 'warning');
               } else {
                  _this.closeByIndex(index);
               }
            }else if(typeof(pageConfig.clearShortcutKeyByCloseHandler)=='function'){
               //sjj 20190801 关闭当前模版页的时候清空当前模版页的所有快捷键的配置
               pageConfig.clearShortcutKeyByCloseHandler(pageConfig.package,index,this.labelPagesArr);
               _this.closeByIndex(index);
            } else {
               _this.closeByIndex(index);
            }
         },
         //设置current属性
         setCurrent: function (index) {
            //移除isCurrent
            for (var i = 0; i < this.labelPagesArr.length; i++) {
               var item = this.labelPagesArr[i];
               item.isCurrent = false;
            }

            this.labelPagesArr[index].isCurrent = true;

            $('#' + id).find('.pt-nav li').removeClass('current');
            $('#' + id).find('.pt-nav li').eq(index).addClass('current');

         },
         //根据index来关闭页面
         closeByIndex: function (index) {
            $('#ptNavToolTips').remove();
            //如果是object添加页面，则执行关闭页面
            this.loadType == 'object'
               ? this.labelPagesArr[index].config && this.labelPagesArr[index].config.closeHandler && this.labelPagesArr[index].config.closeHandler()
               : "";
            //取消定阅
            functionHandler.closeHandler(index);
            //移除数据
            this.deleteContainerArr(index);
            //进行计算  如果删除的是当前显示的页面，则将最后一个页面设为显示
            //否则只将currentTab的值减一
            if (this.currentTab == index) {
               var currentShowDomIndex = this.labelPageLength - 1;
               this.currentTab = currentShowDomIndex;
               $(this.labelPagesArr[currentShowDomIndex].dom).removeClass('hidden');
            } else if (this.currentTab > index) {
               this.currentTab--;
            }
         },
         //刷新
         refreshPage: function (index) {
            var vm = this;
            var currentPage = this.labelPagesArr[index];
            var currentContainer = $(currentPage.dom);
            currentContainer.empty();

            var templateInit = vm.getContainerAndConfigName(currentPage.ajaxRes).templateInit;
            var containerHtml = vm.getContainerAndConfigName(currentPage.ajaxRes).containerHtml;
            var configName = vm.getContainerAndConfigName(currentPage.ajaxRes).configName;
            //渲染到页面上
            if (currentPage.isEditConfig) {
               var addHtml = configName + ".package = " + configName + ".package + '.' +" + new Date().valueOf() + ";" + templateInit[0];
               containerHtml = containerHtml.replace(/NetstarTemplate\.init[\s]*\((\S+)\)/, addHtml);
            }
            currentContainer.append(containerHtml);
            functionHandler.refreshHandler(currentPage);
         },
         //根据位置弹出下拉
         mouseEnterCurrent: function (e) {
            var $currentNav = $(e.target);
            $('#placeholder-popupbox').append('<div id="ptNavToolTips" class="pt-nav-tooltips"><span>' + $currentNav.text() + '</span></div>');
            $('#ptNavToolTips').css('position', 'absolute')
               .css('top', $currentNav.offset().top + 40)
               .css('left', $currentNav.offset().left)
               .css('width', $currentNav.width() + 'px')
               .css('z-index', 9999);
            $currentNav.on('mouseleave', function () {
               $('#ptNavToolTips').remove();
            });
         },
         //移除全部标签
         removeAll: function () {
            this.navFunctionShow = false;
            $('#ptNavToolTips').remove();
            var len = this.labelPageLength;
            //移除所有
            for (var i = len - 1; i >= 1; i--) {
               this.deleteContainerArr(i);
            }
            this.currentTab = 0;
            $(this.labelPagesArr[0].dom).removeClass('hidden');
         },
         //移除其他页面
         removeOther: function () {
            this.navFunctionShow = false;
            $('#ptNavToolTips').remove();
            var len = this.labelPageLength;
            //移除所有
            for (var i = len - 1; i >= 1; i--) {
               if (i == this.currentTab) continue;
               this.deleteContainerArr(i);
            }
            this.currentTab = 1;
            $(this.labelPagesArr[1].dom).removeClass('hidden');
         },
         //移除数组元素
         deleteContainerArr: function (index) {
            if (typeof index != 'undefined') {
               //移除当前容器
               $(this.labelPagesArr[index].dom).remove();
               this.labelPagesArr.splice(index, 1);
            } else {
               this.labelPagesArr.splice(this.labelPageLength - 1, 1);
            }
         },
         //向页面数组中添加attrs
         setContainerArrAttrs: function (index, valueObj) {
            if (typeof this.labelPagesArr[index].attrs == 'undefined') {
               this.labelPagesArr[index].attrs = valueObj;
            } else {
               for (var key in valueObj) {
                  if (valueObj.hasOwnProperty(key)) {
                     var ele = valueObj[key];
                     this.labelPagesArr[index].attrs[key] = ele;
                  }
               }
            }
         },
         //添加点击dom关闭nav功能下拉
         toggleNavFunction: function () {
            var vm = this;
            this.navFunctionShow = !this.navFunctionShow;
            //添加一些document点击事件
            $(document).on('click', function (e) {
               if ($(e.target).parents('.pt-tabbar-control').length == 0 && $(e.target).attr('class') != 'pt-dropdown-menu' && vm.navFunctionShow) {
                  vm.navFunctionShow = false;
                  $(document).off('click');
               }
            });
         },
         //是否在数组中
         arrayIsInclude: function (verItem, array) {
            var index = -1;
            // var verItem = verItem.substr(0, verItem.lastIndexOf('/')).replace(/\//g, '-');
            for (var i = 0; i < this.labelPagesArr.length; i++) {
               var item = this.labelPagesArr[i].url;
               if (item.indexOf(verItem) != -1) {
                  index = i;
               }
            }
            return index;
         },
         //是还有这个url，返回下标
         urlIsOpen: function (url) {
            var subIndex = -1;
            for (var index = 0; index < this.labelPagesArr.length; index++) {
               var item = this.labelPagesArr[index];
               if (url == item.url) {
                  subIndex = index;
               }
            }
            return subIndex;
         },
         setContaienrConfig: function (url, currentConfig) {
            //activityId  processId workItemId data_auth_code
            var showField = 'activityId,activityName,processId,workItemId,data_auth_code'.split(',');
            var $currentLi = $('#' + id).find('li').eq(this.labelPageLength - 1);
            if (typeof currentConfig != 'undefined') {
               if (typeof currentConfig.template != 'undefined') $currentLi.attr('ns-template', currentConfig.template);
               if (typeof currentConfig.pageParam != 'undefined') {
                  //设置属性
                  NetStarUtils.setDomAttrsCaseSensitive($currentLi, currentConfig.pageParam, this.loadType == 'ajaxUrl' ? showField : undefined);
               }
               this.setContainerArrAttrs(this.labelPageLength - 1, currentConfig.pageParam);
               this.loadType == 'ajaxUrl' ? this.labelPagesArr[this.labelPageLength - 1].config = $.extend(true, {}, currentConfig) : '';
            } else {
               this.labelPagesArr[this.labelPageLength - 1].config = '';
            }
         },
         //根据li设置属性
         setDomAttr: function (domObj, valueObj) {
            this.setContainerArrAttrs(this.labelPageLength - 1, valueObj);
            NetStarUtils.setDomAttrsCaseSensitive(domObj.jqDom, valueObj);
         }
      },
      computed: {
         labelPageLength: function () {
            return this.labelPagesArr.length;
         }
      },
      watch: {
         labelPagesArr: function () {
            this.$nextTick(function () {
               var theLastIndex = this.labelPageLength - 1;
               var $currentLi = $('#' + id).find('.pt-nav li').eq(theLastIndex);
               $('#' + id).find('.pt-nav li').removeClass('current');
               $currentLi.addClass('current');
               //移除isCurrent
               for (var index = 0; index < this.labelPagesArr.length; index++) {
                  var item = this.labelPagesArr[index];
                  item.isCurrent = false;
               }
               //设置attrs
               typeof this.labelPagesArr[theLastIndex].attrs == 'undefined' ?
                  this.labelPagesArr[theLastIndex].attrs = {} :
                  '';
               //设置isCurrent
               this.labelPagesArr[theLastIndex].isCurrent = true;
               this.labelPagesArr[theLastIndex].currentLi = $currentLi.get(0);
               //添加两个方法
               this.labelPagesArr[theLastIndex].setPlusClass = (function ($currentLi) {
                  return function (classStr) {
                     var currentLiClass = $currentLi.prop('class');
                     var mySelfClassNames = 'pt-nav-item';

                     $currentLi.attr('class', '');
                     $currentLi.addClass(mySelfClassNames);
                     $currentLi.addClass(classStr);
                  };
               })($currentLi);
               this.labelPagesArr[theLastIndex].getPlusClass = (function ($currentLi) {
                  return function () {
                     // var mySelfClassNames = ['pt-nav-item', 'current'];
                     var mySelfClassNames = ['pt-nav-item'];
                     var currentLiClass = $currentLi.prop('class');

                     for (var index = 0; index < mySelfClassNames.length; index++) {
                        var item = mySelfClassNames[index];
                        currentLiClass = currentLiClass.replace(item, "");
                     }
                     return currentLiClass;
                  };
               })($currentLi);
            });
         }
      },
   });
   return rowNavVue;
};
$(document).ready(function () {
   NetstarUI.labelpageVm = NetstarUI.labelPages('labelPages', 'body');
});