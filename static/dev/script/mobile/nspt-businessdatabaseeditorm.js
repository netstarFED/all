/*
	*手机端流程管理界面
	* @Author: netstar.sjj
	* @Date: 2019-07-02 11:20:00
	* 左侧树 右侧表格  树可以不配置
	*根据左侧树刷新右侧表格数据
	*当前模板是树表格 还是表格 配置参数 config.templateType:treeBlocklist/blockList
	*此模板作为查询模板使用
	*config.pageParam 界面来源参作为查询条件的一个固定入参
	*界面来源参里的值只作为ajax入参发送 如果里面定义了其他特殊指定的属性值需要从config.pageParam中移除 
	*config.pageParam.sourcePageConfig 此界面是从其他界面跳转过来的 传参的时候需要把sourcePageConfig移除，可以先把此参数存储到config的配置定义上
	*config.sourcePageConfig = {businessConfig:{},valueData:{}}
	*config.queryConfig.ajax 查询ajax的配置参数
	*config.queryConfig.field 查询条件
	*config.isInlineBtn 是否行内按钮 默认false
*/
/******************** 表格模板 start ***********************/
NetstarTemplate.templates.businessDataBaseEditorMobile = (function(){
	function dialogBeforeHandler(data){
		var templateId = $('container').children('.businessdatabaseeditor').attr('id');
		var config = NetstarTemplate.templates.processDocBaseMobile.data[templateId].config;
		data.value = NetstarTemplate.getValueDataByValidateParams(config,data.controllerObj);
		data.config = config;

		if(data.controllerObj){
			if(data.controllerObj.defaultMode == 'loadPage'){
				config.pageParam.sourcePageConfig = {
					valueData : getPageData(config.id, false),
				}
			}
		}
		return data;
	}
	function ajaxBeforeHandler(data){
		return data;
	}
	function ajaxAfterHandler(data,plusData){
		var templateId = $('container').children('.businessdatabaseeditor').attr('id');
		var config = NetstarTemplate.templates.processDocBaseMobile.data[templateId].config;
		if(typeof(data)=='undefined'){
			data = {};
		}
		switch(data.objectState){
			case NSSAVEDATAFLAG.VIEW:
				break;
			case NSSAVEDATAFLAG.DELETE:
				//删除 清空界面值
				clearPageData(config);
				break;
			case NSSAVEDATAFLAG.EDIT:
				break;
			case NSSAVEDATAFLAG.ADD:
				break;
		}
		if(!$.isEmptyObject(plusData)){
			if(plusData.requestSource == 'thisVo'){
				var _currentConfig = NetstarTemplate.draft.configByPackPage[config.package];
				if(_currentConfig && _currentConfig.draftBox){
					delete _currentConfig.draftBox.useDraftId;
				}
			}
			var isCloseWindow = typeof(plusData.isCloseWindow)=='boolean' ? plusData.isCloseWindow : false;
			if(isCloseWindow){
				window.history.back();
			}
		}
	}
	function loadPageHandler(data){
		return data;
	}
	function closePageHandler(){

	}
    function getPageData(id, isValid){
        var pageData = dataManage.getSaveData(id, isValid);
        return pageData;
    }
    var configs = {};
    // config管理
    var configManage = {
        // 验证配置
        validConfig : function(config){
			var isPass = true;
            var validArr = 
            [
                ['template','string',true],
                ['title','string'],
                ['components','array',true]
            ];
            isPass = nsDebuger.validOptions(validArr,config);//验证当前模板的配置参数
            return isPass;
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {
				idFieldsNames:{},
				componentsConfig:{
					tree:{},
					vo:{},
					blockList:{},
					btns:{},
					list:{},
				},
				queryConfig:{
					field:[],
					ajax:{}
				},
				mainConfig:{},
				pageParam:{},
				templateType:'',
				serverData:{},
				btnOptions:{
					source:'form',
					dialogBeforeHandler:dialogBeforeHandler,
					ajaxBeforeHandler:ajaxBeforeHandler,
					ajaxAfterHandler:ajaxAfterHandler,
					loadPageHandler:loadPageHandler,
					closePageHandler:closePageHandler,
				},
				isInlineBtn:false,
				sourcePageConfig:{},
			};
            NetStarUtils.setDefaultValues(config, defaultConfig);
            // 设置
			if(!$.isEmptyObject(config.pageParam.sourcePageConfig)){
				config.sourcePageConfig = config.pageParam.sourcePageConfig;
				delete config.pageParam.sourcePageConfig;
			}
			if(typeof(config.pageParam.data)=='object'){
				config.pageParam = config.pageParam.data;
				config.prevUrl = config.pageParam.url;
			}
        },
        // 设置config配置
        setConfig : function(config){
            configManage.setDefault(config);
            // 设置pageParam的相关参数
            if(config.pageParam.prevPageUrl){
				//界面来源参里的值只作为ajax入参发送 如果里面定义了其他属性值需要从config.pageParam中移除
				config.prevPageUrl = config.pageParam.prevPageUrl;
				delete config.pageParam.prevPageUrl;
			}
			if(typeof(config.pageParam.readonly)=='boolean'){
				config.readonly = config.pageParam.readonly;
				delete config.pageParam.readonly;
			}
			if(typeof(config.pageParam.sourcePageConfig)=='object'){
				config.sourcePageConfig = config.pageParam.sourcePageConfig;
				delete config.pageParam.sourcePageConfig;
			}
			if(typeof(config.pageParam.data)=='object'){
				if($.isEmptyObject(config.pageParam.data)){
					config.prevPageUrl = config.pageParam.url;
					delete config.pageParam.url;
					delete config.pageParam.data;
				}else{
					config.pageParam = config.pageParam.data;
					config.prevPageUrl = config.pageParam.url;
				}
            }
            // 判断是否tab,设置tabFieldArray,tabConfig / 设置idFieldsNames / 获取主表 / 设置 componentsConfig
            var isTab = false;
            var tabFieldArray = [];
            var tabConfigs = [];
            var btnConfig = {};
            var mainConfig = {};
            var idFieldsNames = {};
            for(var componentsI=0; componentsI<config.components.length; componentsI++){
                if(config.components[componentsI].type == 'tab'){
                    isTab = true;
                    if(config.components[componentsI].field){
                        tabFieldArray = config.components[componentsI].field.split(',');
                    }
                    break;
                }
            }
            if(isTab){
                for(var tabI=0; tabI<tabFieldArray.length; tabI++){
                    for(var componentsI=0; componentsI<config.components.length; componentsI++){
                        if(config.components[componentsI].keyField == tabFieldArray[tabI]){
                            tabConfigs.push(config.components[componentsI]);
                            break;
                        }
                    }
                }
            }
            for(var componentI=0; componentI<config.components.length; componentI++){
                var componentData = config.components[componentI];
                if(componentData.type == "tab"){ continue; }
                if(componentData.parent == 'root' && componentData.keyField == 'root'){
                    //根
                    mainConfig = componentData;
                    idFieldsNames.root = componentData.idField;
                }else{
                    if(componentData.keyField){
                        idFieldsNames['root.'+componentData.keyField] = componentData.idField;
                    }
                }
                config.componentsConfig[componentData.type][componentData.id] = componentData;
            }
            config.isTab = isTab;
            config.tabConfigs = tabConfigs;
            config.btnConfig = btnConfig;
            config.mainConfig = mainConfig;
            config.idFieldsNames = idFieldsNames;
            config.sourcePageParam = $.extend(true, {}, config.pageParam);
            // 保存按钮容器id
            config.btnContainerId = config.id + '-btn-container';
        },
        getConfig : function(id){
            var _configs = configs[id];
            if(_configs){
                return _configs.config;
            }else{
                return false;
            }
        },
    }
    // 面板管理
    var panelManage = {
        // 获取展开情况的html
        getListHtml : function(config){
            var components = config.components;
            var html = '';
            for(var i=0; i<components.length; i++){
                var componentData = components[i];
                var classStr = '';
                if(componentData.plusClass){
                    classStr += componentData.plusClass;
                }
                html += '<div class="nspanel-container col-xs-12 col-sm-12 nspanel">'
                            + '<div class="nspanel-container-title">' + componentData.title + '</div>'
                            + '<div id="'+componentData.id+'" class="'+classStr+'" component-type="'+componentData.type+'"></div>'
                        +'</div>';
            }
            html =  html
                    + '<footer>'
                        + '<div class="btn-group nav-form" id="'+config.btnContainerId+'" ns-templateid="'+config.id+'"></div>'
                    + '</footer>'
            return html;
        },
        // 获取tab的html
        getTabHtml : function(config){
            var tabConfigs = config.tabConfigs;
            var contentHtml = '';
            var tabHtml = '';
            for(var componentI=0; componentI<tabConfigs.length; componentI++){
                var componentData = tabConfigs[componentI];
                var panelClassStr = 'hide';
                var currentLiClassStr = '';
                if(componentI === 0){
                    panelClassStr = '';
                    currentLiClassStr = 'active';
                }
                var classStr = '';
                if(componentData.plusClass){
                    classStr += componentData.plusClass;
                }
                contentHtml += '<div class="nspanel-container col-xs-12 col-sm-12 nspanel '+panelClassStr+'" ns-tab="'+componentI+'">'
                                    +'<div id="'+componentData.id+'" class="'+classStr+'" component-type="'+componentData.type+'"></div>'
                                +'</div>';
                tabHtml += '<li class="'+currentLiClassStr+'" ns-componentId="'+componentData.id+'">'
                                +'<a href="#'+componentData.id+'" data-toggle="tab">'+componentData.title+'</a>'
                            +'</li>';
            }
            var html = '<div class="col-xs-12 col-sm-12 nspanel" nstype="tab">'
                            + '<div class="layout-main">'
                                + '<ul class="nav nav-tabs nav-tabs-line">'
                                    + tabHtml
                                + '</ul>'
                            + '</div>'
                        + '</div>'
                        + '<div class=""  nstype="content">' 
                            + contentHtml
                        + '</div>'
                        + '<footer>'
                            + '<div class="btn-group nav-form" id="'+config.btnContainerId+'" ns-templateid="'+config.id+'"></div>'
                        + '</footer>'
            return html;
        },
        // tab事件
        setTabEvent : function(config){
            var $container = config.$container;
            var $tab = $container.children('[nstype="tab"]');
            var $lis = $tab.find('li');
            $lis.off('click');
            $lis.on('click', function(ev){
                var $this = $(this);
                var nsComponentId = $this.attr('ns-componentId');
                panelManage.switchTabById(nsComponentId, config);
            });
        },
        // 切换tab面板
        switchTabById : function(componentId, config){
            var $container = config.$container;
            var $tab = $container.children('[nstype="tab"]');
            var $content = $container.children('[nstype="content"]');
            var $lis = $tab.find('li');
            var $components = $content.find('.nspanel-container');
            var $li = $('[ns-componentId="' + componentId + '"]');
            var $component = $content.find('#' + componentId).parent();
            $lis.removeClass('active');
            $components.addClass('hide');
            $li.addClass('active');
            $component.removeClass('hide');
        },
        initContainer : function(config){
            var html;
            if(config.isTab){
                html = panelManage.getTabHtml(config);
            }else{
                html = panelManage.getListHtml(config);
            }
            if($('container .businessdatabaseeditor').length > 0){
				$('container .businessdatabaseeditor').remove();
			}
            var containerHtml = '<div class="row layout-planes businessdatabaseeditor" id="'+config.id+'" ns-package="'+config.package+'">'
                                    + html
                                + '</div>';
            nsTemplate.appendHtml(containerHtml);//输出容器
            var $container = $('#' + config.id);
            config.$container = $container;
            if(config.isTab){
                panelManage.setTabEvent(config);
            }
        },
        voInit : function(voJson, config){
            var readonly = config.readonly;
			for(var voId in voJson){
				var voConfig = voJson[voId];
				var voData = {};
				if(!$.isEmptyObject(config.serverData)){
					voData = config.serverData;
					if(voConfig.keyField){
						if(voConfig.keyField != 'root'){
							voData = config.serverData[voConfig.keyField];
						}
					}
				}
				/****************跳转界面之后返回到当前界面要显示之前编写的信息 start********************** */
				var valueData = config.sourcePageConfig.valueData;
				if(!$.isEmptyObject(valueData)){
					voData = valueData;
					if(voConfig.keyField){
						if(voConfig.keyField != 'root'){
							voData = valueData[voConfig.keyField];
						}
					}
				}
				/***********跳转界面之后返回到当前界面要显示之前编写的信息 end*************************** */
				for(var fieldI=0; fieldI<voConfig.field.length; fieldI++){
					var fieldData = voConfig.field[fieldI];
					fieldData.readonly = readonly;
					fieldData.acts = 'formlabel';
					if(fieldData.type == 'date'){
						fieldData.acts = 'date-label';
					}else if(fieldData.type == 'datetime'){
						fieldData.acts = 'datetime-label';
                    }
                    switch(fieldData.type){
                        case 'select':
                            fieldData.type = 'radio';
                            break;
                        case 'select2':
                            if(fieldData.multiple){
                                fieldData.type = 'checkbox';
                            }else{
                                fieldData.type = 'radio';
                            }
                            break;
                    }
				}
				var formJson = {
					id : voId,
					form : $.extend(true,[],voConfig.field),
					formSource : 'inlineScreen',
					fieldMoreActtion : voConfig.fieldMoreActtion,
					fieldMoreTitle : voConfig.fieldMoreTitle,
					moreText : voConfig.moreText,
					getPageDataFunc : function(){
						return voData;
					},
				};
				nsForm.initByValues(formJson, voData);
			}
        },
        blockListInit : function(listJson, config){
            var readonly = config.readonly;
			for(var listId in listJson){
				var listConfig = listJson[listId];
				var listDataArray = {};
				if(!$.isEmptyObject(config.serverData)){
					listDataArray = config.serverData;
					if(listConfig.keyField){
						if(listConfig.keyField != 'root'){
							listDataArray = config.serverData[listConfig.keyField];
						}
					}
				}
				if(!$.isArray(listDataArray)){listDataArray = [];}
				var listIds = [];
				for(var listI=0; listI<listDataArray.length; listI++){
					listIds.push(listDataArray[listI][listConfig.idField]); 
				}
				if(config.sourcePageConfig){
					var valueData = config.sourcePageConfig.valueData;
					if(!$.isEmptyObject(valueData)){
						var valueArray = valueData[listConfig.keyField];
						if($.isArray(valueArray)){
							if(valueArray.length > 0){
								for(var valueI=0; valueI<valueArray.length; valueI++){
									if(listIds.indexOf(valueArray[valueI][listConfig.idField]) == -1){
										listDataArray.unshift(valueArray[valueI]);
									}
								}
							}
						}
					}
				}
				//读取有没有editConfig.type == 'business'
				var businessConfig = {};
				for(var fieldI=0; fieldI<listConfig.field.length; fieldI++){
					var fieldData = listConfig.field[fieldI];
					var editConfig = typeof(fieldData.editConfig)=='object' ? fieldData.editConfig : {};
					if(editConfig.type == 'business'){
						businessConfig = editConfig;
						break;
					}
				}
				listConfig.businessConfig = businessConfig;
				var gridConfig = {
					id:listId,
					type:listConfig.type,
					idField:listConfig.idField,
					templateId:config.id,
					package:config.package,
					isReadStore:false,
					data:{
						isSearch:true,
						isPage:true,
						primaryID:listConfig.idField,
						idField:listConfig.idField,
						dataSource:listDataArray,
					},
					columns:$.extend(true,[],listConfig.field),
					ui:{
						listExpression:listConfig.listExpression,
						isHaveEditDeleteBtn:true,
						isHaveEditBtn:true,
						isHaveAddRowBtn:true,
						isEditMode:false,
						selectMode:'single',
						displayMode:'block',
						height:$(window).outerHeight() - 60,
						isHeader:false,
						isCheckSelect:false,
                        isThead:false,
                        isInlineBtn : false,
					}
				};
				NetstarBlockListM.init(gridConfig);
			}
        },
        initComponent : function(config){
            // 初始化组件
            for(var component in config.componentsConfig){
				var componentConfig = config.componentsConfig[component];
				switch(component){
					case 'vo':
						panelManage.voInit(componentConfig, config);
						break;
					case 'blockList':
						panelManage.blockListInit(componentConfig, config);
						break;
				}
			}
        },
        initBtns : function(config){
            // 初始化组件
            var btns = [
                {
                    text: "保存",
                    isReturn: true,
                    index: {
                        customerIndex: 0,
                        iconCls: '<i class="icon-all-o"></i>',
                    },
                    handler : (function(_config){
                        return function(){
                            var saveDataConfig = $.extend(true, {}, _config.saveData);
                            var pageData = getPageData(_config.id, true);
                            if(pageData){
                                var saveAjax = saveDataConfig.ajax;
                                saveAjax.data = pageData;
                                var saveOriginalParams = $.extend(true, {}, _config.saveData.ajax.data);// 保留默认参数
                                if(!$.isEmptyObject(saveOriginalParams)){
                                    // 保留默认参数
                                    saveAjax.data = $.extend(false, saveAjax.data, saveOriginalParams);
                                }
                                saveAjax.plusData = {
                                    configId : _config.id,
                                };
                                NetStarUtils.ajax(saveAjax, function(res, ajaxConfig){
                                    if(res.success){
                                        nsalert('保存成功');
                                    }
                                },true);
                            }else{
                                nsAlert('请检查页面配置', 'warning');
                                console.warn('请检查页面配置');
                            }
                        }
                    })(config)
                }
            ]
            var btnConfig = {
                isShowTitle: false,
                id : config.btnContainerId,
                btns : [btns],
            }
            nsNav.init(btnConfig);
        },
        init : function(config){
            // 初始化容器
            panelManage.initContainer(config);
            // 初始化面板内容
            panelManage.initComponent(config);
            // 初始化按钮
            panelManage.initBtns(config);
        }
    }
    // 数据管理
    var dataManage = {
        getVoData : function(voJson, isValid){
            var voData = {};
            var isContinue = true;
            for(var voId in voJson){
                var data = nsForm.getFormJSON(voId, isValid);
                var voConfig = voJson[voId];
                if(data){
                    var isRoot = true;
                    if(voConfig.keyField){
                        if(voConfig.keyField != 'root'){
                            isRoot = false;
                        }
                    }
                    if(isRoot){
                        nsVals.extendJSON(voData,data);
                    }else{
                        voData[voConfig.keyField] = data;//定义了keyField
                    }
                }else{
                    isContinue = false;//验证未通过返回值为false，终止for循环
                    break;
                }
            }
            if(isContinue == false){
                voData = false;
            }
            return voData;
        },
        getListData : function(listJson, isValid){
            var listData = {};
            for(var listId in listJson){
                var data = NetstarBlockListM.dataManager.getData(listId);
                var listConfig = listJson[listId];
                if(listConfig.keyField){
                    listData[listConfig.keyField] = data;
                }
            }
            return listData;
        },
        getPageData : function(id, isValid){
            var config = configManage.getConfig(id);
            if(!config){
                nsAlert('获取数据失败没有找到config','error');
                console.error('获取数据失败没有找到config');
                console.error(id);
                return false;
            }
            var pageData = {};
            isValid = typeof(isValid)=='boolean' ? isValid : false;
            var componentConfig = config.componentsConfig;
            for(var component in componentConfig){
                var componentConfig = config.componentsConfig[component];
                var isContinue = true;
                switch(component){
                    case 'vo':
                        var voData = dataManage.getVoData(componentConfig, isValid);
                        if(voData){
                            nsVals.extendJSON(pageData, voData);
                        }else{
                            isContinue = false;
                        }
                        break;
                    case 'blockList':
                        var listData = dataManage.getListData(componentConfig, isValid);
                        nsVals.extendJSON(pageData, listData);
                        break;
                }
                if(isContinue == false){
                    pageData = false;
                    break;
                }
            }
            return pageData;
        },
        getSaveData : function(id, isValid){
            var config = configManage.getConfig(id);
            if(!config){
                nsAlert('获取数据失败没有找到config','error');
                console.error('获取数据失败没有找到config');
                console.error(id);
                return false;
            }
            var pageData = dataManage.getPageData(id, isValid);
            if(pageData){
                var pageData = nsServerTools.getObjectStateData(config.serverData, pageData, config.idFieldsNames);
                NetStarUtils.setDefaultValues(pageData, config.pageParam);
            }
            return pageData;
        },
        clearPageData : function(id){
            var config = configManage.getConfig(id);
            if(!config){
                nsAlert('获取数据失败没有找到config','error');
                console.error('获取数据失败没有找到config');
                console.error(id);
                return false;
            }
            function clearVoData(voJson){
                for(var id in voJson){
                    nsForm.clearValues(id,false);
                }
            }
            function clearBlockList(listJson){
                for(var listId in listJson){
                    NetstarBlockListM.refreshDataById(listId,[])
                }
            }
            for(var component in config.componentsConfig){
                var componentConfig = config.componentsConfig[component];
                switch(component){
                    case 'vo':
                        clearVoData(componentConfig);
                        break;
                    case 'blockList':
                        clearBlockList(componentConfig);
                        break;
                }
            }
        },
        setVoData : function(voJson, pageData){
            for(var id in voJson){
                var voConfig = voJson[id];
                var valueData;
                if(voConfig.keyField){
                    if(voConfig.keyField !='root'){
                        valueData = pageData[voConfig.keyField];
                    }else{
                        valueData = pageData;
                    }
                }else{
                    valueData = pageData;
                }
                if(!$.isEmptyObject(valueData)){
                    nsForm.fillValues(valueData, id);
                }else{
                    nsForm.clearValues(id, false);
                }
            }
        },
        setListData : function(listJson, pageData){
            for(var id in listJson){
                var listConfig = listJson[id];
                var valueData = [];
                if(listConfig.keyField){
                    valueData = pageData[listConfig.keyField];
                }
                if(!$.isArray(valueData)){
                    valueData = [];
                }
                NetstarBlockListM.refreshDataById(id,valueData);
            }
        },
        setPageData : function(pageData, id){
            var config = configManage.getConfig(id);
            if(!config){
                nsAlert('获取数据失败没有找到config','error');
                console.error('获取数据失败没有找到config');
                console.error(id);
                return false;
            }
            pageData = typeof(pageData)=='object' ? pageData :{};
            for(var component in config.componentsConfig){
                var componentConfig = config.componentsConfig[component];
                switch(component){
                    case 'vo':
                        dataManage.setVoData(componentConfig, pageData);
                        break;
                    case 'blockList':
                        dataManage.setListData(componentConfig, pageData);
                        break;
                }
            }
        },
    }
    // 通用方法管理
    var commonManage = {

    }
    function init(config){
        var isPass = configManage.validConfig(config);
        if(!isPass){
            nsalert('配置文件验证失败', 'error');
            console.error('配置文件验证失败');
            console.error(_config);
            return false;
        }
        configs[config.id] = {
            source : $.extend(true, {}, config),
            config : config
        }
        NetstarTemplate.templates.businessDataBaseEditorMobile.data[config.id] = {
			original:configs[config.id].source,
			config:config
		};
        // 设置config
        configManage.setConfig(config);
        // 是否存在getValueAjax
        if (typeof(config.getValueAjax) != 'undefined') {
            var pageParam = $.extend(true, {}, config.pageParam);
            var ajaxConfig = $.extend(true, {}, config.getValueAjax);
            var ajaxData = nsVals.getVariableJSON(ajaxConfig.data, pageParam);
            ajaxConfig = nsVals.getAjaxConfig(ajaxConfig, ajaxData, {idField:config.idFieldsNames.root});
            ajaxConfig.plusData = {
                configId : config.id,
            }
            nsVals.ajax(ajaxConfig,function(res, _ajaxConfig) {
                var _config = configManage.getConfig(_ajaxConfig.plusData.configId);
                if(res.success) {
                    if($.isEmptyObject(res.data)){
                        console.error('后台返回数据为空，请查看');
                    }
                    _config.serverData = res.data ? res.data : {};
                }
                panelManage.init(_config);
            }, true);
        }else{
            panelManage.init(config);
        }
    }
	return{
        data :                                  {},
		init:									init,								
		VERSION:								'0.0.1',
		dialogBeforeHandler:					dialogBeforeHandler,			// 弹框调用前置方法
		ajaxBeforeHandler:						ajaxBeforeHandler,				// 弹框ajax保存前置方法
		ajaxAfterHandler:						ajaxAfterHandler,				// 弹框ajax保存后置方法
		loadPageHandler:						loadPageHandler,				// 打开
		closePageHandler:						closePageHandler,				// 关闭
        getPageData:							getPageData,					// 获取界面值
        setPageData :                           dataManage.setPageData,         // 设置页面数据
	}
})(jQuery)
/******************** 表格模板 end ***********************/