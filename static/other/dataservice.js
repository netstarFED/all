var query = {} // 全局对象  数据源管理/数据连接管理 分别重新定义导致数据覆盖 所以在开始页面设置全局变量
var NetstarDataService = (function($){
    var pageToUrl = {
        "excelimport.html" : "excel模版配置",
        "datasource.html" : "数据源管理",
        "datalinkmanage.html" : "数据库连接管理",
        "reportcategory.html" : "报表类别管理",
        "reportmethodmanage.html" : "报表加工方法管理",
        // "datasourcedetails.html" : "数据源明细",
        // "datasourceparams.html" : "内置参数维护",
    }
    function setLabelpageVmLoadPage2(){
        NetstarUI.labelpageVm.loadPage2 = function (url, title, isAlwaysNewTab, pageOperateData){
            // pageOperateData : 当前页面的操作数据 用于newtab按钮 ；lyw 20190620
            typeof isAlwaysNewTab != 'boolean' ? isAlwaysNewTab = true : "";
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
                     dom:$('#'+vm.currentContainerId),
                  });
               }
               setTimeout(function(){
                  vm.getJsp2(url, pageOperateData);
               },0)
            }
         }
        //通过url请求页面内容
        NetstarUI.labelpageVm.getJsp2 = function (url, pageOperateData) {
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
                pageOperateData : pageOperateData,
                callBackFunc : function(isSuccess, data, _pageConfig){
                    if(isSuccess){
                        res = data;
                        var pageOperateDataStr = typeof(_pageConfig.pageOperateData) == "object" ? JSON.stringify(_pageConfig.pageOperateData) : '{}'; 
                        var $currentContainer = $(vm.containerParent).find('container#' + vm.currentContainerId);

                        var resPageParam = vm.getContainerAndConfigName2(res);
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
                           containerHtml = containerHtml.replace(/NetstarDataService\.initToPage\((.*?)\)/, addHtml);
                        } else {
                            vm.labelPagesArr[vm.labelPageLength - 1].isEditConfig = false;
                        }
                        //如果有配置的话，则添加以下内容
                        if ($.trim(configName).length != 0) {
                            var addHtml = templateInit[0] + ';' + 'NetstarUI.labelpageVm.setContaienrConfig("' + url + '",' + configName + ')';
                            containerHtml = containerHtml.replace(/NetstarDataService\.initToPage\((.*?)\)/, addHtml);
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
                        // functionHandler.refreshHandler(vm.labelPagesArr[vm.labelPageLength - 1]);
                    }else{
                        vm.labelPagesArr.pop();
                        $('#' + vm.hiddenContainerId).removeClass('hidden');
                        $('#' + vm.currentContainerId).remove();
                        NetStarUtils.defaultAjaxError(data);
                        console.error('请求错误，错误代码：' + data.status);
                    }
                },
            }
            if (vm.loadType == 'object') {
               vm.$nextTick(function () {
                  ajaxConfig.success('<container>' + (vm.containerObj.html ? vm.containerObj.html : "") + '</container>');
                  vm.setContaienrConfig(url, { pageParam: vm.containerObj.attrs });
                  typeof vm.containerObj.shownHandler == 'function' && vm.containerObj.shownHandler({ jqDom: $('#' + id).find('li').eq(vm.labelPageLength - 1) });
                  delete vm.containerObj;
               });
            } else if (vm.loadType == 'ajaxUrl') {
               pageProperty.getAndCachePage(pageConfig);
            }
        }
        //获取container的内容和配置
        NetstarUI.labelpageVm.getContainerAndConfigName2 = function (htmlString) {

            //获取ajax返回HTML或者代码段中的有效代码
            var containerHtml = this.getContainerHtml(htmlString);

            //获得当前页面配置
            var templateInit = containerHtml.match(/NetstarDataService\.initToPage[\s]*\((\S+)\)/);
            var configName = templateInit != null ? templateInit[1] : "";
            return {
               containerHtml: containerHtml,
               configName: configName,
               templateInit: templateInit
            };
        }
    }
    // 数据服务topage页面调用方法
    function initToPage(config, pageData){
        config.pageData = pageData;
        nsFrame.init(config);
    }
    function init(){
        // 设置NetstarUI.labelpageVm.loadPage
        setLabelpageVmLoadPage2();
        query = {} // 全局对象  数据源管理/数据连接管理 分别重新定义导致数据覆盖 所以在开始页面设置全局变量
        // 生成菜单
        var html = '';
        for(var key in pageToUrl){
            html += '<li class="pt-top-menu-item">'
                        + '<div class="pt-top-menu-item-row">'
                            + '<a class="pt-nav-item" href="javascript:NetstarUI.labelpageVm.loadPage(\'' + location.origin + '/sites/dataservice/' + key + '\',\'' + pageToUrl[key] + '\');">'
                                + '<i class="icon-menu"></i>'
                                + '<span>' + pageToUrl[key] + '</span>'
                            + '</a>'
                        + '</div>'
                    + '</li>'
        }
        $('#netstar-mainpage-menu').html(html);
        // 打开页面
        var url = '';
        var href = location.href;
        if(href.indexOf('url') > -1){
            var hrefArr = href.split('?');
            var attrArr = hrefArr[1].split(';');
            for(var i=0; i<attrArr.length; i++){
                var attrStrArr = attrArr[i].split('=');
                switch(attrStrArr[0]){
                    case "url":
                        for(var urlKey in pageToUrl){
                            if(attrStrArr[1].indexOf(urlKey) > -1){
                                var tabName = pageToUrl[urlKey]
                                NetstarUI.labelpageVm.loadPage(location.origin + attrStrArr[1], tabName);
                                break;
                            } 
                        }
                        break;
                }
            }
        }
    }
    return {
        init : init,
        initToPage : initToPage,
    }
})(jQuery)