var fillDataWithConfig = (function (jQuery) {
   return (function ($) {
      var viewConfig = {}; //页面配置参数
      var pageAjaxConfig = {};//页面ajax配置
      var pageData = {}; //页面数据
      var outerData = {};
      function init(pageViewConfig, pageConfig, _outerData) {
         typeof _outerData != 'undefined' ? outerData = $.extend(true, {}, _outerData) : "";
         if (typeof arguments[1] != 'function') {
            viewConfig = pageViewConfig;
            pageInit();
            setValue(pageData, pageConfig);
         } else {
            var callBack = arguments[1];
            setValue(pageData, arguments[0], function (pageData) {
               callBack(pageData);
            });
         }
      }
      function pageInit() {
         //页面初始化
         for (var key in viewConfig) {
            if (viewConfig.hasOwnProperty(key)) {
               var element = viewConfig[key];
               if (typeof (element.init) == 'function') {
                  element.init();
               }
            }
         }
      }
      function formatAjaxConfig(config, nodeName) {
         var num = 0;
         if (typeof nodeName == 'undefined') {
            for (var key in config) {
               num++;
               if (config.hasOwnProperty(key)) {
                  var element = config[key];
                  if (typeof pageAjaxConfig[element.parentNodeName] == 'undefined') {
                     pageAjaxConfig[element.parentNodeName] = {};
                     pageAjaxConfig[element.parentNodeName][key] = element;
                  } else {
                     pageAjaxConfig[element.parentNodeName][key] = element;
                  }
               }
            }
         } else {
            for (var key in config) {
               num++;
               if (config.hasOwnProperty(key)) {
                  var element = config[key];
                  if (typeof pageAjaxConfig[nodeName] == 'undefined') {
                     pageAjaxConfig[nodeName] = {};
                  }
                  if (typeof pageAjaxConfig[nodeName][element.parentNodeName] == 'undefined') {
                     pageAjaxConfig[nodeName][element.parentNodeName] = {};
                     pageAjaxConfig[nodeName][element.parentNodeName][key] = element;
                  } else {
                     pageAjaxConfig[nodeName][element.parentNodeName][key] = element;
                  }
               }
            }
         }
         return {
            num: num,
            originAjaxConfig: config,
         };
      }
      function getPageData(parentData, config, cb, ajaxConfigNodeName, isRoot) {
         isRoot == 'root'
            ? config = config[ajaxConfigNodeName].root
            : ajaxConfigNodeName == "root" ?
               config = config.root
               : "";
         for (var key in config) {
            if (config.hasOwnProperty(key)) {
               var element = config[key];
               (function (key) {
                  setPageData(parentData, element, key, function (parentNode) {
                     if (typeof ajaxConfigNodeName != 'undefined' && ajaxConfigNodeName != 'root') {
                        if (typeof pageAjaxConfig[ajaxConfigNodeName][key] == 'object') {
                           getPageData(parentNode, pageAjaxConfig[ajaxConfigNodeName][key], cb, ajaxConfigNodeName);
                        }
                     } else {
                        if (typeof pageAjaxConfig[key] == 'object') {
                           getPageData(parentNode, pageAjaxConfig[key], cb);
                        }
                     }
                     cb();
                  });
               })(key)
            }
         }
      }
      
      //根据名字匹配图标
      function setIconByName(resList){
         var nameToIconConfig = {
            default:'icon-all-o',
            '客户管理' : 'icon-id-o',
            "联系人" : "icon-user-o",
            "近期生日" : "icon-gift-o",
            "销售跟单" : "icon-file-follow-o",
            "超期跟单" : "icon-history-o", 
            "超期客户" : "icon-alarm-o",
            "附近客户" : "icon-team-o",
	    "个人客户" : "icon-id-o",
            "部门客户" : "icon-team-o",
            "公司客户" : "icon-id-file-o",
            "个人联系人" : "icon-tel-o",
            "部门联系人" : "icon-tel-alt-o",
            "公司联系人" : "icon-tel-alt-o",
            "个人机会" : "icon-target-o",
            "部门机会" : "icon-process-o",
            "公司机会" : "icon-arrange-o",
            "个人接触" : "icon-message-o",
            "部门接触" : "icon-allot-o",
            "公司接触" : "icon-check-list-o",
            "公海机会" : "icon-inbox",
            "状态修改申请" : "icon-edit-o",
            "部门经理审核" : "icon-appointment",
            "总经理审核" : "icon-sign-in-o",
            "销售开单" : "icon-sign-in-o",
            "销售单查询" : "icon-order-search-o",
            "采购开单" : "icon-sign-in-o",
            "采购单查询" : "icon-order-search-o",
            "备货" : "icon-deliver-o",
            "点货" : "icon-product-o",
            "库存查询" : "icon-warehouse-o",
            "任务回执" : "icon-file-o",
         }
         for(var i=0; i<resList.length; i++){

            var nameStr = resList[i].menuName;
            if(nameToIconConfig[nameStr]){
               resList[i].menuIcon = nameToIconConfig[nameStr];
            }else{
               //没有匹配则读默认的
               resList[i].menuIcon = nameToIconConfig.default
            }
         }
      }
      //重新组织返回结果
      function resetRes(resList){

         /**传入数据示例：json
          * {
          * "menuId": "1269109547235017705",
          * "menuParentId": "1269108415511135209",
          * "rightsId": "1269109335707878377",
          * "menuName": "个人接触",
          * "menuIsHideBeforeAccount": 0,
          * "menuIsHideAfterAccount": 0,
          * "menuIsEnabled": 1,
          * "menuDisOrder": "1",
          * "rightsName": "个人接触",
          * "rightsCode": "gerenjiechu",
          * "dataScope": "3",
          * "menuUrl": "/netStarRights/gerenjiechu",
          * "objectState": 0
          * }
          */
         
         //根据名称匹配图标
         setIconByName(resList);
         //把过深的层级拉平，手机版只支持两级菜单
         var  treatedArr = [];
         for(var ti=0; ti<resList.length; ti++){
            var menuData  = resList[ti];
            //如果是parentId 是 -1，需要跳过
            //if(menuData.menuParentId == '-1'){
              // continue;
           // }
            treatedArr.push(menuData);
         }
         //转化list到tree idField:menuId,  parentField:menuParentId, childField:children
         var treeObj = nsDataFormat.convertToTree(treatedArr, 'menuId', 'menuParentId', 'children');
         return treeObj;
      }
      function setPageData(parentData, childConfig, childNodeName, cb) {
         if (typeof childConfig.ajax != 'undefined') {  //如果有ajax为ajax请求
            //ajaxData为模拟请求回来的数据
            if (!$.isEmptyObject(outerData)) {
               childConfig.ajax.data = nsVals.getVariableJSON(childConfig.ajax.data, outerData);
            } else {
               childConfig.ajax.data = nsVals.getVariableJSON(childConfig.ajax.data, pageData);
            }
            //发送ajax请求
            nsVals.ajax(childConfig.ajax, function (res) {
               if (res.success) {
                  //返回的结果需要处理后使用
                  var ajaxData = resetRes(res[childConfig.ajax.dataSrc]);
                  parentData[childNodeName] = ajaxData;
                  typeof cb == 'function' ? cb(parentData[childNodeName]) : "";  //将设置的对象返回,递归调用
               }
            })
         } else {   //如果没有ajax，则是将数据直接放进来
            var ajaxData = childConfig.data ? childConfig.data : childConfig.rows;
            parentData[childNodeName] = $.extend(true, {}, ajaxData);
            typeof cb == 'function' ? cb(parentData[childNodeName]) : "";  //将设置的对象返回,递归调用
         }
      }
      function setValue(data, pageConfig, cb) {
         //整理ajaxConfig
         var ajaxConfig = formatAjaxConfig(pageConfig[pageConfig.ajaxConfigField]);
         getPageData(pageData, pageAjaxConfig, function () {
            if (--ajaxConfig.num == 0) {
               typeof cb == 'function' && cb(pageData);
               viewConfig.pageData = pageData;
               for (var key in ajaxConfig.originAjaxConfig) {
                  if (ajaxConfig.originAjaxConfig.hasOwnProperty(key)) {
                     var ajaxDataFieldBunch = key;
                     var element = ajaxConfig.originAjaxConfig[key];
                     var ajaxDataParentField = element.parentNodeName;
                     var panelId = element.panelId;
                     //拼接ajax串
                     while (ajaxDataParentField != 'root') {
                        ajaxDataFieldBunch = (ajaxDataParentField + "." + ajaxDataFieldBunch).replace("root.", "");
                        ajaxDataParentField = ajaxConfig.originAjaxConfig[ajaxDataParentField].parentNodeName;
                     }
                     var ajaxDataFieldArr = ajaxDataFieldBunch.split('.');
                     var ajaxData = data ? data : pageData;
                     $.each(ajaxDataFieldArr, function (index, item) {
                        ajaxData = ajaxData[item];
                     });
                     typeof viewConfig[element.panelId] != 'undefined' ? viewConfig[element.panelId].setValue(ajaxData) : "";
                  }
               }
            }
         }, "root");
      }
      function getValue(param) {
         return {
            pageData: pageData,
            viewConfig: viewConfig
         }
      }
      return {
         fillValue: init,
         getValue: getValue
      };
   })(jQuery);
})(jQuery);