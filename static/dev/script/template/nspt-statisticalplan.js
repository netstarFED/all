NetstarTemplate.templates.statisticalPlan = (function(){
    var configs = {};
    // config管理
    var configManage = {
        // 验证
        validConfig : function(config){
            //如果开启了debugerMode
            var isValid = true;
            if(debugerMode){
               //验证配置参数是否合法
               isValid = NetstarTemplate.commonFunc.validateByConfig(config);
            }
            if(!isValid){
                isValid = false;
                nsalert('配置文件验证失败', 'error');
                console.error('配置文件验证失败');
                console.error(config);
            }
            return isValid
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {
                serverData : {},
                pageData : {},
                title : '',
                pageParam : {},
            }
            nsVals.setDefaultValues(config, defaultConfig);
        },
        // 设置配置
        setConfig : function(config){
            // 设置各组件配置 通过name
            var components = config.components;
            var componentsByName = {};
            var templateId = config.id;
            for(var componentI=0; componentI<components.length; componentI++){
                var componentData = components[componentI];
                // keyField
                var keyField = componentData.keyField;
                // params
                componentData.params = typeof(componentData.params)=='object' ? componentData.params : {};
                var params = componentData.params;
                // type
                var type = componentData.type;
                // 组件id
                var componentId = componentData.id;
                var name = '';
                switch(type){
                    case 'blockList':
                        if(!keyField){
                            keyField = 'root';
                        }
                        name = 'blockList';
                        componentId = templateId + '-blockList-root';
                        break;
                    case 'list':
                        if(!keyField){
                            keyField = 'right';
                        }
                        if(params.displayMode == "all"){
                            name = 'all';
                        }else{
                            name = 'part';
                        }
                        componentId = templateId + '-list-right';
                        componentData.isAjax = true;
                        break;
                    case 'btns':
                        if(typeof(componentId) == "undefined"){
                            componentId = config.id + '-' + type + '-' + componentI;//定义容器id
                        }
                        if(params.displayMode == "left"){
                            name = 'btnLeft';
                        }else{
                            name = 'btnRight';
                        }
                        break;
                }
                componentData.id = componentId;
                componentData.keyField = keyField;
                componentData.package = config.package;
                componentsByName[name] = componentData;
                // 这里配置无用 其它模板有配置所以配置  根据组件类型存储信息
                if(config.componentsConfig[type]){
                    config.componentsConfig[type][componentId] = componentData; 
                }
			}
            config.componentsByName = componentsByName;
        },
        getConfig : function(package){
            var _configs = configs[package];
            if(_configs){
                return _configs.config;
            }else{
                return false;
            }
        }
    }
    // 基础方法管理
    var baseFuncManage = {
        //此方法获取到当前模板页的配置定义和当前界面操作值
        dialogBeforeHandler : function(data,templateId){
            var templateConfig = NetstarTemplate.templates.statisticalPlan.data[templateId].config;
            data.config = templateConfig;
            data.value = dataManage.getPageData(templateConfig);
            return data;
        },
        //此方法是在调用ajax执行之前的回调
        ajaxBeforeHandler : function(handlerObj,templateId){
            return handlerObj;
        },
        //此方法是在调用ajax完成之后需要对当前界面执行的逻辑
        ajaxAfterHandler : function(data,templateId,ajaxPlusData){
            var templateConfig = {};
            if(templateId){
                templateConfig = NetstarTemplate.templates.statisticalPlan.data[templateId].config;
            }else{
                if(NetstarUI.labelpageVm.labelPagesArr[NetstarUI.labelpageVm.currentTab]){
                    var packageName = NetstarUI.labelpageVm.labelPagesArr[1].config.package;
                    templateConfig = NetstarTemplate.templates.configs[packageName];
                }
            }

            if(typeof(ajaxPlusData)=='undefined'){
                ajaxPlusData = {};
            }
            // templateConfig.pageInitDefaultData = getPageData(templateConfig, false, false); // 页面初始化数据改变
            if(templateConfig.closeValidSaveTime > -1){
                setTimeout(function(){
                    templateConfig.pageInitDefaultData = dataManage.getPageData(templateConfig, false, false); // 页面初始化数据改变
                }, templateConfig.closeValidSaveTime);
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
        },
        loadPageHandler : function(){   
        },
        closePageHandler : function(){

        },
        closePageBeforeHandler : function(package){
            var templateConfig = configManage.getConfig(package);
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
            var pageData = dataManage.getPageData(package, false, false);
            delUndefinedNull(pageData)
            var pageInitDefaultData = templateConfig.pageInitDefaultData ? templateConfig.pageInitDefaultData : templateConfig.serverData;
            delUndefinedNull(pageInitDefaultData)
            return {
                getPageData : pageData,
                serverData : pageInitDefaultData,
            }
        }
    }
    // 组件初始化
    var componentsManage = {
        // 初始化按钮
        btnsInit : function(config){
            var componentData = config.componentsConfig.btns;
            NetstarTemplate.commonFunc.btns.initBtns(componentData, config);
        },
        blockList : {
            selectedHandler : function(data, gridVue, gridConfig, templateConfig){
                // 右侧表格的名字
                var rightName = 'part';
                if(data['NETSTAR-ISADDNULLBLOCK']){
                    rightName = 'all';
                }
                var rightGridConfig = templateConfig.componentsByName[rightName];
                if(!rightGridConfig){
                    nsalert('没有找到右侧表格配置', 'error');
                    console.error('没有找到右侧表格配置');
                    return false;
                }
                componentsManage.grid.init(data, rightGridConfig, templateConfig);
            },
            show : function(data, componentData, config){
                // 添加全部块数据
                var allData = {
                    'NETSTAR-ISADDNULLBLOCK' : true,
                    "netstarSelectedFlag": true,
                };
                data.unshift(allData);
                componentData.dataSource = data;
                componentData.nullBlockExpression = '<span>未分类</span>'
                var blockComponents = {};
                blockComponents[componentData.id] = componentData;
                NetstarTemplate.commonFunc.blockList.initBlockList(blockComponents, config);
            },
            init : function(config){
                var componentsByName = config.componentsByName;
                var componentData = componentsByName.blockList;
                // 计算高度
                var height = componentsFuncManage.getPanelComponentHeight(config);
                componentData.componentHeight = height;
                var ajaxConfig = $.extend(true, {}, componentData.ajax);
                if(!$.isEmptyObject(config.pageParam)){
                    if(!$.isEmptyObject(ajaxConfig.data)){
                        ajaxConfig.data = NetStarUtils.getFormatParameterJSON(ajaxConfig.data, config.pageParam);
                    }else{
                        ajaxConfig.data = config.pageParam;
                    }
                }
                ajaxConfig.plusData = {
                    packageName : config.package,
                    templateId : config.id
                };
                NetStarUtils.ajax(ajaxConfig,function(res, ajaxPlusData){
                    var templateConfig = configManage.getConfig(ajaxPlusData.plusData.packageName);
                    var _componentData = templateConfig.componentsByName.blockList;
                    var resData = [];
                    if(res.success){
                        resData = res[ajaxPlusData.dataSrc] ? res[ajaxPlusData.dataSrc] : [];
                    }else{
                        nsalert('返回值false','error');
                    }
                    componentsManage.blockList.show(resData, componentData, templateConfig);
                },true);
            }
        },
        // 初始化表格
        grid : {
            init : function(data, rightGridConfig, config){
                var $container = $('#' + rightGridConfig.id);
                // 清空上次初始化表格
                $container.children().remove();
                // 计算高度
                var height = componentsFuncManage.getPanelComponentHeight(config);
                rightGridConfig.componentHeight = height;
                var gridComponents = {};
                rightGridConfig.blockSelectedData = data;
                gridComponents[rightGridConfig.id] = rightGridConfig;
                NetstarTemplate.commonFunc.list.initList(gridComponents, config);
            },
        },
        // 初始化
        init : function(config){
            // 按钮初始化
            componentsManage.btnsInit(config);
            // blockList初始化
            componentsManage.blockList.init(config);
            // 表格初始化
            var rightGridConfig = config.componentsByName.all;
            if(!rightGridConfig){
                nsalert('没有找到右侧表格配置', 'error');
                console.error('没有找到右侧表格配置');
                return false;
            }
            componentsManage.grid.init({}, rightGridConfig, config);
        },
    }
    // 组件方法管理
    var componentsFuncManage = {
        getPanelComponentHeight : function(config){
            var $container = $('#' + config.id);
            var $ptMainRow = $container.children().children('.pt-main-row');
            var ptMainRowHeight = 0;
            for(var i=0; i<$ptMainRow.length-1; i++){
                ptMainRowHeight += $ptMainRow.outerHeight();
            }
            var height = config.templateCommonHeight - ptMainRowHeight;
            return height;
        },
        gridSelectedHandler : function(data, $data, gridVue, gridConfig){
            var package = gridConfig.package;
            var templateConfig = configManage.getConfig(package);
            switch(gridConfig.type){
                case "blockList":
                    // 块状表格
                    componentsManage.blockList.selectedHandler(data, gridVue, gridConfig, templateConfig);
                    break;
            }
        },
    }
    //初始化组件容器
	function initContainer(config){
		var titleHtml = '';//标题
		if(config.title){
			//定义了标题输出
			titleHtml = '<div class="pt-main-row">'
								+'<div class="pt-main-col">'
									+'<div class="pt-panel pt-panel-header">'
										+'<div class="pt-container">'
											+'<div class="pt-panel-row">'
												+'<div class="pt-panel-col">'
													+'<div class="pt-title pt-page-title"><h4>'+config.title+'</h4></div>'
												+'</div>'
											+'</div>'
										+'</div>'
									+'</div>'
								+'</div>'
							+'</div>';
        }
        var componentsByName = config.componentsByName;
        // 左侧块状表格
        var leftId = '';
        if(componentsByName.blockList){
            leftId = componentsByName.blockList.id;
        }
        // 右侧表格
        var rightId = '';
        if(componentsByName.all){
            rightId = componentsByName.all.id;
        }else if(componentsByName.part){
            rightId = componentsByName.part.id;
        }
        // 按钮
        var btnsHtml = '';
        var btnsConfig = config.componentsConfig.btns;
        // for(var keyId in btnsConfig){
        //     var btnPlusClass = btnsConfig[keyId].plusClass ? btnsConfig[keyId].plusClass : '';
        //     btnsHtml += '<div class="pt-panel button-panel-component '+btnPlusClass+'">'
		// 					+'<div class="pt-panel">'
		// 						+'<div class="pt-container">'
		// 							+'<div class="pt-panel-row">'
		// 								+'<div class="pt-panel-col">'
		// 									+'<div class="nav-form" id="'+ keyId +'"></div>'
		// 								+'</div>'
		// 							+'</div>'
		// 						+'</div>'
		// 					+'</div>'
		// 				+'</div>';
        // }
        var leftBtnId = '';
        if(componentsByName.btnLeft){
            leftBtnId = componentsByName.btnLeft.id;
        }
        var rightBtnId = '';
        if(componentsByName.btnRight){
            rightBtnId = componentsByName.btnRight.id;
        }
		var templateClassStr = '';
		if(config.plusClass){
			templateClassStr = config.plusClass;
		}
        var html = '<div class="pt-main statisticalplan '+templateClassStr+'" id="'+config.id+'" ns-package="'+config.package+'">'
                        + '<div class="pt-container">'
                            + titleHtml
                            // +'<div class="pt-main-row">'
                            //     +'<div class="pt-main-col">'
                            //         + btnsHtml
                            //     +'</div>'
                            // +'</div>'
                            +'<div class="pt-main-row">'
                                +'<div class="pt-main-col">'
                                    + '<div class="pt-panel" id="'+leftBtnId+'">'
                                    + '</div>'
                                    + '<div class="pt-panel">'
                                        + '<div class="pt-container">'
                                            + '<div class="pt-panel-row">'
                                                + '<div class="pt-panel-col">'
                                                    + '<div class="nsgrid nsgrid-block" id="'+leftId+'">'
                                                    + '</div>'
                                                + '</div>'
                                            + '</div>'
                                        + '</div>'
                                    + '</div>'
                                +'</div>'
                                +'<div class="pt-main-col">'
                                    + '<div class="pt-panel" id="'+rightBtnId+'">'
                                    + '</div>'
                                    + '<div class="pt-panel" id="'+rightId+'">'
                                    + '</div>'
                                +'</div>'
                            +'</div>'
                        +'</div>'
                    +'</div>'
		var $container = $('container').not('.hidden');
		if($container.length > 0){
			$container = $container.eq($container.length-1);
        }
        if(config.$container){
			$container = config.$container;
        }
        // 输出面板
		$container.prepend(html);
	}
    // 初始化
    function init(config){
        var isPass = configManage.validConfig(config);
        if(!isPass){
            return false;
        }
        // 存储模板配置参数
        NetstarTemplate.commonFunc.setTemplateParamsByConfig(config);
        configs[config.package] = {
            sourse : $.extend(true, {}, config),
            config : config,
        }
        // 设置模板通用参数默认值
        NetstarTemplate.commonFunc.setDefault(config);
        // 设置config
        configManage.setConfig(config);
        // 初始化容器
        initContainer(config);
        componentsManage.init(config);
        // if(!$.isEmptyObject(config.getValueAjax)){
        //     //当前界面存在此定义则先请求根据返回值去初始化各个组件调用
        //     var getValueAjaxConfig = $.extend(true, {}, config.getValueAjax);
        //     if(!$.isEmptyObject(config.pageParam)){
        //        if(!$.isEmptyObject(getValueAjaxConfig.data)){
        //           getValueAjaxConfig.data = NetStarUtils.getFormatParameterJSON(getValueAjaxConfig.data, config.pageParam);
        //        }else{
        //           getValueAjaxConfig.data = config.pageParam;
        //        }
        //     }
        //     getValueAjaxConfig.plusData = {
        //        packageName:config.package,
        //        templateId:config.id
        //     };
        //     NetStarUtils.ajax(getValueAjaxConfig,function(res,ajaxPlusData){
        //         var templateConfig = configManage.getConfig(ajaxPlusData.plusData.packageName);
        //        if(res.success){
        //           var resData = res[ajaxPlusData.dataSrc] ? res[ajaxPlusData.dataSrc] : {};
        //           NetStarUtils.deleteAllObjectState(resData);//删除服务端返回的数据状态
        //           templateConfig.serverData = resData;//服务端返回的原始数据
        //           templateConfig.pageData = NetStarUtils.deepCopy(resData);//克隆服务端返回的原始数据
        //           componentManage.init(templateConfig);//组件化分别调用
        //        }else{
        //           nsalert('返回值false','error');
        //           componentManage.init(templateConfig);//组件化分别调用
        //        }
        //     },true);
        //  }else{
        //     componentManage.init(config);
        // }
    }
	return{
        init: init,
        // 基本方法
        dialogBeforeHandler : baseFuncManage.dialogBeforeHandler,
        ajaxBeforeHandler : baseFuncManage.ajaxBeforeHandler,
        ajaxAfterHandler : baseFuncManage.ajaxAfterHandler,
        // 模板方法
        // 块状表格/表格选中行事件
        gridSelectedHandler : componentsFuncManage.gridSelectedHandler,
	};
})(jQuery)