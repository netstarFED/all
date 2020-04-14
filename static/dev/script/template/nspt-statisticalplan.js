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
            var components = config.components;
            for(var componentI=0; componentI<components.length; componentI++){
                var componentData = components[componentI];
                // params
                componentData.params = typeof(componentData.params)=='object' ? componentData.params : {};
                var params = componentData.params;
                // type
                var type = componentData.type;
                switch(type){
                    case 'blockList':
                        break;
                    case 'list':
                        break;
                    case 'btns':
                        if(params.displayMode == "left"){
                            if(typeof(componentData.operatorObject) == "undefined"){
                                componentData.operatorObject = 'root';
                            }
                        }else{
                            if(typeof(componentData.operatorObject) == "undefined"){
                                componentData.operatorObject = 'right';
                            }
                        }
                        break;
                }
			}
        },
        // 设置配置
        setConfig : function(config){
            // 设置各组件配置 通过name
            var components = config.components;
            var componentsByName = {};
            var templateId = config.id;
            var componentIds = {};
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
                        componentIds.left = componentId;
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
                        componentIds.right = componentId;
                        break;
                    case 'btns':
                        if(typeof(componentId) == "undefined"){
                            componentId = config.id + '-' + type + '-' + componentI;//定义容器id
                        }
                        if(params.displayMode == "left"){
                            name = 'btnLeft';
                            componentIds.btnLeft = componentId;
                            if(typeof(componentData.operatorObject) == "undefined"){
                                componentData.operatorObject = 'root';
                            }
                        }else{
                            name = 'btnRight';
                            componentIds.btnRight = componentId;
                            if(typeof(componentData.operatorObject) == "undefined"){
                                componentData.operatorObject = 'right';
                            }
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
            config.componentIds = componentIds;
            config.mainComponent = componentsByName.blockList;
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
            if(ajaxPlusData.isCloseWindow === true){
                //如果按钮上配置了关闭当前界面直接执行关闭操作
                NetstarUI.labelpageVm.removeCurrent();
            }else{
                if(!$.isArray(data)){
                    var panelName = 'root';
                    if(ajaxPlusData.operatorObject){
                        panelName = ajaxPlusData.operatorObject;
                    }
                    //返回值是对象 可以根据返回状态去处理界面逻辑
                    if(panelName == templateConfig.componentsByName.blockList.keyField){
                        switch(data.objectState){
                            case NSSAVEDATAFLAG.DELETE:
                            //删除
                            case NSSAVEDATAFLAG.EDIT:
                            //修改
                            case NSSAVEDATAFLAG.ADD:
                            //新增
                            case NSSAVEDATAFLAG.VIEW:
                            //刷新
                            componentsManage.blockList.refreshHandler(config);
                            break;
                        }
                    }else{
                        switch(data.objectState){
                            case NSSAVEDATAFLAG.DELETE:
                            //删除
                            case NSSAVEDATAFLAG.EDIT:
                            //修改
                            case NSSAVEDATAFLAG.ADD:
                            //新增
                            case NSSAVEDATAFLAG.VIEW:
                            //刷新
                            componentsManage.grid.refreshHandler(config);
                            break;
                        }
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
    }
    // 组件初始化
    var componentsManage = {
        // 初始化按钮
        btnsInit : function(config){
            var componentData = config.componentsConfig.btns;
            NetstarTemplate.commonFunc.btns.initBtns(componentData, config);
        },
        blockList : {
            refreshHandler : function(config){
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
            refresh : function(componentData, config){
                this.getDataByAjax(componentData, config, function(resData, componentData, templateConfig){
                    componentsManage.blockList.show(resData, componentData, templateConfig);
                });
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
                if(componentData.params && componentData.params.nullBlockExpression){
                    componentData.nullBlockExpression = componentData.params.nullBlockExpression;
                }
                var blockComponents = {};
                blockComponents[componentData.id] = componentData;
                NetstarTemplate.commonFunc.blockList.initBlockList(blockComponents, config);
            },
            getDataByAjax : function(componentData, config, callBackFunc){
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
                    templateId : config.id,
                    callBackFunc : callBackFunc,
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
                    // componentsManage.blockList.show(resData, componentData, templateConfig);
                    if(typeof(ajaxPlusData.plusData.callBackFunc) == "function"){
                        ajaxPlusData.plusData.callBackFunc(resData, componentData, templateConfig);
                    }
                },true);
            },
            init : function(config){
                var componentsByName = config.componentsByName;
                var componentData = componentsByName.blockList;
                // 计算高度
                var height = componentsFuncManage.getPanelComponentHeight(componentData, config);
                componentData.componentHeight = height;
                this.getDataByAjax(componentData, config, function(resData, componentData, templateConfig){
                    componentsManage.blockList.show(resData, componentData, templateConfig);
                });
                // var ajaxConfig = $.extend(true, {}, componentData.ajax);
                // if(!$.isEmptyObject(config.pageParam)){
                //     if(!$.isEmptyObject(ajaxConfig.data)){
                //         ajaxConfig.data = NetStarUtils.getFormatParameterJSON(ajaxConfig.data, config.pageParam);
                //     }else{
                //         ajaxConfig.data = config.pageParam;
                //     }
                // }
                // ajaxConfig.plusData = {
                //     packageName : config.package,
                //     templateId : config.id
                // };
                // NetStarUtils.ajax(ajaxConfig,function(res, ajaxPlusData){
                //     var templateConfig = configManage.getConfig(ajaxPlusData.plusData.packageName);
                //     var _componentData = templateConfig.componentsByName.blockList;
                //     var resData = [];
                //     if(res.success){
                //         resData = res[ajaxPlusData.dataSrc] ? res[ajaxPlusData.dataSrc] : [];
                //     }else{
                //         nsalert('返回值false','error');
                //     }
                //     componentsManage.blockList.show(resData, componentData, templateConfig);
                // },true);
            }
        },
        // 初始化表格
        grid : {
            refreshHandler : function(config){
                var blockId = config.componentsByName.blockList.id;
                var data = NetstarBlockList.getSelectedData(blockId);
                var blockConfigs = NetstarBlockList.configs[blockId];
                componentsManage.blockList.selectedHandler(data, blockConfigs.vueObj, blockConfigs.gridConfig, config);
            },
            init : function(data, rightGridConfig, config){
                var $container = $('#' + rightGridConfig.id);
                // 清空上次初始化表格
                $container.children().remove();
                // 计算高度
                var height = componentsFuncManage.getPanelComponentHeight(rightGridConfig, config);
                rightGridConfig.componentHeight = height;
                var gridComponents = {};
                rightGridConfig.blockSelectedData = data;
                rightGridConfig.pageLengthDefault = 10;
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
        getPanelComponentHeight : function(componentData, config){
            var $container = $('#' + config.id);
            var $ptMainRow = $container.children().children('.pt-main-row');
            var ptMainRowHeight = 0;
            for(var i=0; i<$ptMainRow.length-1; i++){
                ptMainRowHeight += $ptMainRow.outerHeight();
            }
            var btnsHeight = 0;
            var $ptMainCol = $('#' + componentData.id).closest('.pt-main-col');
            var $ptMainColChildren = $ptMainCol.children();
            if($ptMainColChildren.length > 1){
                btnsHeight  = $ptMainColChildren.eq(0).outerHeight();
            }
            var height = config.templateCommonHeight - ptMainRowHeight - btnsHeight - 10;
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
        //获取表格选中值
        getSelectedDataByGridId : function(gridId){
            var value;
            if(NetStarGrid.configs[gridId].gridConfig.ui.isCheckSelect){
                value = NetStarGrid.getCheckedData(gridId);
                if(value.length == 0){
                    value = NetstarTemplate.commonFunc.list.getSelectedData(gridId);
                    if($.isArray(value)){
                        if(value.length == 1){
                            value = value[0];
                        }
                    }else{
                        value = {};
                    }
                }
            }else{
                value = NetstarTemplate.commonFunc.list.getSelectedData(gridId);
                if($.isArray(value)){
                    if(value.length == 1){
                        value = value[0];
                    }
                }else{
                    value = {};
                }
            }
            return value;
        },
        //块状表格获取选中值
        getSelectedDataByBlockGridId : function(gridId){
            var value = NetstarTemplate.commonFunc.blockList.getSelectedData(gridId);
            if($.isArray(value)){
                if(value.length == 1){
                    value = value[0];
                }
            }else{
                value = {};
            }
            return value;
        },
        refreshComponent : function(componentConfig, pageConfig, controllerObj){
            switch(componentConfig.type){
                case 'list':
                    NetStarGrid.refreshById(componentConfig.id);
                    break;
                case 'blockList':
                    componentsManage.blockList.refresh(componentConfig, pageConfig);
                    break;
            }
        },
    }
    // 数据管理
    var dataManage = {
        getPageData : function(config){
            var componentIds = config.componentIds;
            // 左侧
            var leftId = componentIds.left;
            var leftData = NetstarBlockList.configs[leftId].vueObj.originalRows;
            var leftSelectedData = NetstarBlockList.getSelectedData(leftId);
            // 右侧
            var rightId = componentIds.right;
            var rightData = NetStarGrid.configs[rightId].vueObj.originalRows;
            var rightSelectedData = NetStarGrid.getSelectedData(rightId);
            var data = {
                left : leftData,
                leftSelected : leftSelectedData,
                right : rightData,
                rightSelected : rightSelectedData,
            };
            return data;
        }
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
        // var btnsHtml = '';
        // var btnsConfig = config.componentsConfig.btns;
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
        var leftBtnHtml = '';
        var leftBtnId = '';
        if(componentsByName.btnLeft){
            leftBtnId = componentsByName.btnLeft.id;
            leftBtnHtml = '<div class="pt-panel pt-grid-header" id="'+ leftBtnId +'">'
                            + '</div>'
        }
        var rightBtnId = '';
        var rightBtnHtml = '';
        if(componentsByName.btnRight){
            rightBtnId = componentsByName.btnRight.id;
            rightBtnHtml = '<div class="pt-panel" id="'+rightBtnId+'">'
                            + '</div>'
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
                                    + leftBtnHtml
                                    + '<div class="pt-panel pt-grid-body">'
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
                                    + rightBtnHtml
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
        configManage.setDefault(config);
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
        // 获取表格选中数据
        getSelectedDataByGridId : componentsFuncManage.getSelectedDataByGridId,
        // 获取块状表格选中数据
        getSelectedDataByBlockGridId : componentsFuncManage.getSelectedDataByBlockGridId,
        // 刷新
		refreshByGridconfig:function(componentConfig, packageName, controllerObj){
			componentsFuncManage.refreshComponent(componentConfig, NetstarTemplate.templates.configs[packageName], controllerObj);
		},
	};
})(jQuery)