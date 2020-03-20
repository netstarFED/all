/*
 * 快速输入组件 ver1.0 cy 20180402
 */
nsUI.quicktyping = (function ($) {
	//nsUI.quicktyping.baseData = {}; 	//总的存储数据对象
	var dataConfig = {};  				//数据配置
	var config = {}; 					//用户当前使用的配置
	var baseData = {}; 					//基础数据
	var originalConfig = {};			//原始数据,用户输入的config，用来重新配置，重新生成组件
	var localConfig = {};				//本地个人配置
	var inputValue = ''; 				//输入框的值
	//数据处理部分 start---------------------------------------------------
	//数据初始化
	function dataInit(systemDataConfig) {

		if (debugerMode) {
			parametersArr = [
				[systemDataConfig, 'object', true]
			];
			nsDebuger.validParameter(parametersArr);
			optionsArr = [
				['dataID', 'string', true],
				//	['baseDataAjax','object',true],
				['inputAjaxConfig', 'object', true],
			];
			nsDebuger.validOptions(optionsArr, systemDataConfig);
		}

		dataConfig = systemDataConfig;
		baseData = {};
		if (typeof (nsUI.quicktyping.baseData) == 'undefined') {
			nsUI.quicktyping.baseData = {};
		}
		nsUI.quicktyping.baseData[dataConfig.dataID] = baseData;

		baseData.totalAjax = 0; 		//总的加载数量,必须有baseData,所以从1开始
		baseData.completeAjax = 0; 		//ajax加载数量
		if (!$.isEmptyObject(dataConfig.baseDataAjax)) {
			//支持原来的方式
			if (typeof (dataConfig.baseDataAjax) == 'object') {
				//是object类型,默认第一个是table表格
				dataConfig.inputAjaxConfig.project = {
					plusData: 'project',
					url: dataConfig.baseDataAjax.url,
					type: dataConfig.baseDataAjax.type,
					dataSrc: dataConfig.baseDataAjax.dataSrc
				}
			}
		}
		/*nsVals.ajax(dataConfig.baseDataAjax,function(data){
			//console.log(data[dataConfig.baseDataAjax.dataSrc]);
			baseData.project = {};
			baseData.project.data = nsVals.csv2jsonArray(data[dataConfig.baseDataAjax.dataSrc], {isAddDefaultIndex:true});
			baseData.completeAjax++;
			baseDataComplete();
		});*/
		for (input in dataConfig.inputAjaxConfig) {
			baseData.totalAjax++;
			var inputConfig = dataConfig.inputAjaxConfig[input];
			nsVals.ajax(inputConfig, function (data, ajaxConfig) {
				var keyname = ajaxConfig.plusData;
				baseData[keyname] = {};
				baseData[keyname].data = data[inputConfig.dataSrc];
				if (config[keyname].type == 'table') {
					//baseData[keyname].data = nsVals.csv2jsonArray(data[inputConfig.dataSrc], {isAddDefaultIndex:true});
					var formatData = [];
					if (typeof (data[inputConfig.dataSrc]) == "undefined") {
						console.error('dataSrc:' + inputConfig.dataSrc + '配置错误');
						console.log(data);
					} else {
						for (var i = 0; i < data[inputConfig.dataSrc].length; i++) {
							var listData = data[inputConfig.dataSrc][i];
							listData[config[keyname].projectIndexField] = i;
							formatData.push(listData);
						}
					}
					baseData[keyname].data = formatData;
				}
				baseData.completeAjax++;
				baseDataComplete();
			});
		}
		// for(input in dataConfig.inputAjaxConfig){
		// 	baseData.totalAjax++;
		// 	var inputConfig = dataConfig.inputAjaxConfig[input];
		// 	nsVals.ajax(inputConfig, function(data,ajaxConfig){
		// 		var keyname = ajaxConfig.plusData;
		// 		baseData[keyname] = {};
		// 		baseData[keyname].data = data[inputConfig.dataSrc];
		// 		if(config[keyname].type == 'table'){
		// 			baseData[keyname].data = nsVals.csv2jsonArray(data[inputConfig.dataSrc], {isAddDefaultIndex:true});
		// 		}
		// 		baseData.completeAjax++;
		// 		baseDataComplete();
		// 	});
		// }
	}
	//加载ajax监视
	function baseDataComplete() {
		if (baseData.completeAjax == baseData.totalAjax) {
			//console.log(baseData.completeCallback);
			if (typeof (baseData.completeCallback) == 'function') {
				baseData.completeCallback();
				delete baseData.completeCallback;
			}
		}
	}
	//数据处理部分 end-----------------------------------------------------
	function validUserConfig(_userConfig) {
		var isValid = true;
		if (debugerMode) {
			//userConfig 
			parametersArr = [
				[_userConfig, 'object', true]
			];
			isValid = nsDebuger.validParameter(parametersArr);
			if (isValid == false) {
				return false;
			}
			//userConfig 属性验证
			optionsArr = [
				['id', 'string', true],
				['dataID', 'string', true],
				['container', 'string', true],
				['label', 'string', true],
				//['projectField','array',true],
				//['projectTableWidth','number'],
				['inputWidth', 'number']
			];
			nsDebuger.validOptions(optionsArr, _userConfig);
			if (isValid == false) {
				return false;
			}

			return isValid;
		}
	}
	//设置userConfig的默认值
	function setDefault(_userConfig) {
		if (!$.isEmptyObject(dataConfig.baseDataAjax)) {
			if (typeof (dataConfig.baseDataAjax) == 'object') {
				if (typeof (_userConfig.project) == 'object') {
					// console.log(_userConfig.project)
				} else {
					_userConfig.project = {
						source: 'project',
						type: 'table',
						projectSearchType: 'disorder',					//多条件搜索时候是顺序还是乱序 order disorder  默认disorder
						projectTableWidth: 800,						//表格宽度
						projectTableRowNumber: 5,						//表格行数
						projectField: _userConfig.projectIdField
					}
				}
			}
		}
		//获取默认上屏字段
		if (typeof (_userConfig.project) == 'object') {
			var projectDefaultField = [];
			var projectDefaultText = {};
			for (var index = 0; index < _userConfig.project.projectField.length; index++) {
				var item = _userConfig.project.projectField[index];
				if (item.hasOwnProperty('default') && item['default']) {
					projectDefaultField.push(item.key);
					projectDefaultText[item.key] = item.defaultText;
				}
			}
			_userConfig['projectDefaultField'] = projectDefaultField;
			_userConfig['projectDefaultText'] = projectDefaultText;
		}

		var defaultConfig = {
			//projectTableWidth:800,
			//projectTableRowNumber:10,
			inputWidth: 500,
			tagsWidth: 0
		}
		for (option in defaultConfig) {
			if (typeof (_userConfig[option]) == 'undefined') {
				_userConfig[option] = defaultConfig[option];
			}
		}
		return _userConfig;
	}
	//组件初始化
	function init(userConfig) {
		var ajaxConfig = {
			url: getRootPath() + "/naTableConfig/getPersonalUiConfig",
			data: {},
			dataSource: "data",
			type: "POST"
		}
		var ajax = nsVals.getAjaxConfig(ajaxConfig, {})
		nsVals.ajax(ajax, function (data) {
			if (data.success) {
				var ajaxData = data.data;
				if ($.isEmptyObject(ajaxData)) {
					var objectState = 2;
				} else {
					var objectState = 1;
					userId = ajaxData.userId
				}
			}
		})
		//拿到原始数据
		originalConfig = $.extend(true, {}, userConfig);
		//从本地获取用户配置后做修改
		alterConfig(userConfig);
		// console.log(userConfig);
		//验证配置文件
		if (debugerMode) {
			var isValid = validUserConfig(userConfig);
			if (isValid == false) {
				return false;
			}
		}
		//设置默认值
		config = setDefault(userConfig);
		if (nsUI.quicktyping.baseData) {
			config.data = nsUI.quicktyping.baseData[userConfig.dataID];
		}
		config.values = {};
		setTableDefault();//判断是否存在table表格类型的操作数据
		initContainer(); //初始化容器
		console.log(config);
	}
	function setTableDefault() {
		for (var typeI = 0; typeI < config.inputOrder.length; typeI++) {
			if (config[config.inputOrder[typeI]].type == 'table') {
				//如果当前操作类型有table表格
				initTablePanel(config.inputOrder[typeI]);//初始化表格配置属性值
			}
		}
	}

	//初始化容器
	function initContainer() {
		if (config.isDialog == true) {
			var htmlStr = '<div class="quicktyping-dialog" id="' + config.dataID + '-container">'
				+ '<div class="quicktyping-title">'
				+ '<label>' + config.isTitle + '</label>'
				+ '<a class="quicktyping-close-btn" href="javascript:void(0);">x</a>'
				+ '</div>'
				+ '<div class="panel panel-default panel-form">'
				+ '<div class="panel-body"></div>'
				+ '</div>'
				+ '</div>';
			$('body').append(htmlStr);
			config.container = '#' + config.dataID + '-container .panel-body';
		}
		config.$container = $(config.container);
		if (debugerMode) {
			if (config.$container.length != 1) {
				console.error(language.ui.nsuiquicktyping.initContainerA + config.id + language.ui.nsuiquicktyping.initContainerB + config.$container.length + language.ui.nsuiquicktyping.initContainerC);
				return false;
			}
		}
		var html = '';
		html = getBaseHtml();
		config.$container.html(html);
		config.$component = config.$container.find('#' + config.id);
		config.$input = config.$container.find('#' + config.inputID);
		config.$tags = config.$container.find('.tags-container');
		config.originalSearchValue = '';  //原始值
		$('#' + config.dataID + ' .quicktyping-title .quicktyping-close-btn').on('click', function (ev) {
			$(this).parent().parent().remove();
		})
		initInput();
		getConfigMode();
	}
	//输出基本HTML
	function getBaseHtml() {
		var html = '';
		config.inputID = config.id + "-input";
		var widthStyle = 'style="width:' + config.inputWidth + 'px;"';
		//用户自定义按钮
		var btnHtml = '';
		config.userDefined && typeof (config.project) == 'object' ? btnHtml = '<div style="position:relative;border:0;" class="input-group-addon"><a style="position:relative;" href="javascript:void(0);"><i class="fa fa-cog"></i></a></div>' : "";
		html = '<div id="' + config.id + '" class="nsui-quicktyping">'
			+ '<label class="label-title">' + config.label + '</label>'
			+ '<div class="input" ' + widthStyle + '>'
			+ '<div class="input-group">'
			+ '<input type="text" class="input-main" name="' + config.inputID + '" id="' + config.inputID + '" ' + widthStyle + '>'
			+ btnHtml
			+ '</div>'
			+ '<div class="tags-container"></div>'
			+ '</di>'
			+ '</div>';
		return html;
	}

	var searchType = '';  //当前操作类型 table(表格), select(下拉)， date(日期),number(数值类型)
	var currentData = ''; //当前操作数据 
	//初始化文本框
	function initInput() {
		searchType = config[config.inputOrder[0]].type;			//默认读取的操作类型为第一个，从inputOrder数组第一个取
		currentData = config.inputOrder[0];						//默认操作数据为第一个，从inputOrder数组第一个取
		if (baseData.totalAjax != baseData.completeAjax) {
			config.$component.addClass('loading');
			baseData.completeCallback = function () {
				config.$component.removeClass('loading');
				//读取表格数据
				config.$input.off('focus');
				config.$input.on('focus', inputFocusHandler);
			}
		} else {
			config.$input.off('focus');
			config.$input.on('focus', inputFocusHandler);
		}
	}

	/* 20180911 lxh 快速录入组件 可自定义配置 begin*/
	function alterConfig(userConfig) {
		if (localStorage.getItem(userConfig.id)) {
			localConfig = JSON.parse(localStorage.getItem(userConfig.id));
		} else if (localStorage.getItem(userConfig.uid)) {
			localConfig = JSON.parse(localStorage.getItem(userConfig.uid));
		}
		if ($.isEmptyObject(localConfig)) return;
		for (var key in userConfig) {
			if (userConfig.hasOwnProperty(key)) {
				var element = userConfig[key];
				if ($.type(element.type) && element.type == 'table') {
					// table的配置
					$.each(localConfig, function (index, it) {
						$.each(element.projectField, function (index, item) {
							if (it.title == item.title) {//如果名字可以对上，则修改
								it.width ? item.width = Number(it.width) : "";//更改列宽
								it.isShow == '0' ? item['hidden'] = true : item['hidden'] = false; //删除不显示项
								it.isSearch != '0' ? item.search = true : item.search = false;//更改检索值
								// it.tabPosition == "" ? "" : item.tabPosition = Number(it.tabPosition);//更改tab页
								it.isBefore == '1' ? item.tabPosition = 'before' : (item.tabPosition == 'before' ? item.tabPosition = 0 : "");//更改靠前排列值
								it.isAfter == '1' ? item.tabPosition = 'after' : (item.tabPosition == 'after' ? item.tabPosition = 1 : "");//更改靠后排列值
								it.isDefaultOn == '1' ? item.default = true : item.default = false;
								if (it.tabIndex != index) {
									element.projectField.splice(index, 1, element.projectField.splice(it.tabIndex, 1, item)[0]);
								}
							}
						})
					})
				}
			}
		}
	}//拿到本地用户配置进行修改
	function getConfigMode() {
		config.$input.siblings('.input-group-addon').on('click', function () {
			var configMode = [];//配置项目
			var displayConfig = [];//显示项目
			// table的配置
			if (typeof (config.project) == 'object') {
				$.each(config.project.projectField, function (index, item) {
					configMode.push($.extend(true, {}, item));
					displayConfig.push($.extend(true, {}, item));
				});
				dialogShow(function () { showEditConfig(configMode) });
			}
		});
	}//点击按钮弹出框 并获取修改配置参数
	function getTableConfig(config) {
		//克隆配置文件
		var commonConfig = [];//普通commonConfig
		var beforeConfig = [];//带有before的数组
		var afterConfig = [];//带有after的数组
		var tableConfig = [];//总的数组
		$.each(config, function (index, item) {
			if ($.type(item.title) == 'undefined') { return }
			var currentItem = {};
			// var element = tableConfig[index] = {};
			currentItem.field = item.key || item.field;
			currentItem.title = item.title || item.title;
			currentItem.width = item.width || item.width;
			currentItem.isShow = item.isShow || (item.hidden ? "0" : "1");
			currentItem.tabIndex = index;
			currentItem.isDefaultOn = item.isDefaultOn || (item.default ? "1" : "0");
			//改变tab页
			// currentItem['tabPosition'] = $.type(item.tabPosition) == 'number' ? item.tabPosition : "";
			if (item.search || item.isSearch == "1") {
				currentItem.isSearch = "1";
			} else {
				currentItem.isSearch = "0";
			}
			if (item.tabPosition == 'before' || item.isBefore == "1") {
				currentItem.isBefore = "1";
				beforeConfig.push(currentItem);
			} else if (item.tabPosition == 'after' || item.isAfter == "1") {
				currentItem.isAfter = "1";
				afterConfig.push(currentItem);
			} else {
				commonConfig.push(currentItem);
			}
		});
		initTabIndex(beforeConfig);
		initTabIndex(commonConfig, beforeConfig.length);
		initTabIndex(afterConfig, beforeConfig.length + commonConfig.length);
		tableConfig = beforeConfig.concat(commonConfig.concat(afterConfig));
		// console.log(tableConfig);
		return tableConfig;
	}//格式化配置参数，并获得dataSource
	function initTabIndex(arr, ModeLen) {
		$.each(arr, function (index, item) {
			if (item.isBefore == '1') {
				item['tabIndex'] = index;
			} else {
				item['tabIndex'] = index + ModeLen;
			}
		})
	}//添加tabIndex
	function showEditConfig(configMode, callback) {
		var tableID = 'quicktyping-config-table';
		var dataConfig = {
			tableID: tableID,
			dataSource: getTableConfig(configMode),
			isPage: false,
			isSearch: false,
			info: false,
			isLengthChange: false
		};
		var columnConfig = [
			{
				field: "isShow",
				title: "本列是否显示",
				width: 80,
				formatHandler: {
					type: 'checkbox',
					data:
						[
							{
								textField: 'name',
								valueField: 'id',
								handler: function (data, state, value) { },
								checkedFlag: '1',
								uncheckedFlag: '0',
								isDisabledFlage: 'state',
								value: '0',
							}
						]
				}
			}, {
				field: "isSearch",
				title: "本列是否可检索",
				width: 80,
				formatHandler: {
					type: 'checkbox',
					data:
						[
							{
								textField: 'name',
								valueField: 'id',
								handler: function (data, state, value) { },
								checkedFlag: '1',
								uncheckedFlag: '0',
								isDisabledFlage: 'state',
								value: '0',
							}
						]
				}
			}, {
				field: "isBefore",
				title: "本列是否固定在前",
				width: 80,
				formatHandler: {
					type: 'checkbox',
					data:
						[
							{
								textField: 'name',
								valueField: 'id',
								handler: function (data, state, value) {
									data.isAfter = 0;
									//刷新表格
									var tabCofnig = baseDataTable.allTableData(dataConfig.tableID);
									baseDataTable.originalConfig[tableID].dataConfig.dataSource = getTableConfig(tabCofnig);
									baseDataTable.refreshByID(tableID);
									addDropEvent(tableID, getTableConfig(tabCofnig));
								},
								checkedFlag: '1',
								uncheckedFlag: '0',
								isDisabledFlage: 'state',
								value: '0',
							}
						]
				}
			}, {
				field: "isAfter",
				title: "本列是否固定在后",
				width: 80,
				formatHandler: {
					type: 'checkbox',
					data:
						[
							{
								textField: 'name',
								valueField: 'id',
								handler: function (data, state, value) {
									data.isBefore = 0;
									//刷新表格
									var tabCofnig = baseDataTable.allTableData(dataConfig.tableID);
									baseDataTable.originalConfig[tableID].dataConfig.dataSource = getTableConfig(tabCofnig);
									baseDataTable.refreshByID(tableID);
									addDropEvent(tableID, getTableConfig(tabCofnig));
								},
								checkedFlag: '1',
								uncheckedFlag: '0',
								isDisabledFlage: 'state',
								value: '0',
							}
						]
				}
			}, {
				field: "isDefaultOn",
				title: "本列是否默认上屏",
				width: 80,
				formatHandler: {
					type: 'checkbox',
					data:
						[
							{
								textField: 'name',
								valueField: 'id',
								handler: function (data, state, value) { },
								checkedFlag: '1',
								uncheckedFlag: '0',
								isDisabledFlage: 'state',
								value: '0',
							}
						]
				}
			}, {
				field: "title",
				title: "列名"
			},/* {
				field:"tabPosition",
				title:"改变tab页",
				width:80,
				formatHandler: function (value, rowData, meta) {
					var returnHtml = '';
					// 是否显示输入框
					if (rowData.isBefore != '1' && rowData.isAfter != '1') {
						returnHtml = '<input class="ns-table-input form-control" value="' + value + '"></input>';
					} else {
						returnHtml = '<span>固定列</span>';
					}
					return returnHtml;
				}
			}, */{
				field: "width",
				title: "列宽",
				width: 100,
				formatHandler: {
					type: 'input',
					data:
						[
							{
								handler: function (obj) { }
							}
						]
				}
			}, {
				field: "button",
				title: "拖拽改变顺序",
				width: 80,
				formatHandler: {
					type: "button",
					data: {
						subdata: [
							{
								拖拽: function (a, b, c, d, e) {
								}
							}
						]
					}
				}
			}
		];
		var uiConfig = {
			pageLengthMenu: ['all'], //可选页面数  auto是自动计算  all是全部
			isSingleSelect: false,
			isMultiSelect: false
		};
		baseDataTable.init(dataConfig, columnConfig, uiConfig);
		//更改tab页
		/* $('#' + dataConfig.tableID + ' .ns-table-input').on('change', function(){
			var $dom = $(this);
			var originalValue = $.trim($dom.val());
			var cTr = $dom.closest('tr');
			var cTableID = $dom.closest('table').attr('id');
			var cRow = baseDataTable.table[cTableID].row(cTr);
			var rowData = cRow.data();
			// 修改行数据
			if (rowData.tabPosition != originalValue) {
				rowData.tabPosition = originalValue;
			}
		}); */
		//拖拽事件
		addDropEvent(tableID, getTableConfig(configMode));
		//保存事件
		var dialogId = config.id + "config-dialog";
		var $save = $('#saveConfig');
		var $clearConfig = $("#clearConfig");
		$save.on('click', function () {
			var tableConfig = JSON.stringify(baseDataTable.allTableData(dataConfig.tableID));
			if ($.type(config.uid) != 'undefined') {
				localStorage.setItem(config.uid, tableConfig);
			} else if ($.type(config.id) != 'undefined') {
				localStorage.setItem(config.id, tableConfig);
			}
			init(originalConfig);
			$('#' + dialogId).modal('hide');
		});//保存配置
		$clearConfig.on('click', function () {
			localStorage.removeItem(config.uid);
			localStorage.removeItem(config.id);
			localConfig = {};
			init(originalConfig);
			$('#' + dialogId).modal('hide');
		});
	}//修改配置弹窗，为防止重名，起的比较怪
	function dialogShow(callback) {
		var dialogId = config.id + "config-dialog";
		var dialogTitle = config.label + "参数配置";
		var modal = '<div id="' + dialogId + '" class="modal fade bs-example-modal-lg in" role="dialog" aria-hidden="true" aria-labelledby="' + dialogId + '">'
			+ '<div class="modal-dialog uimodal" style="width:1000px">'
			+ '</div>'
			+ '</div>';
		// 如果没有模态框就添加，有则跳过
		if (typeof ($("body").find($("#" + dialogId))[0]) == "undefined") {
			$("body").append(modal);
		}
		// 显示模态框
		$('#' + dialogId).modal('show');
		// 模态框的通用代码
		var $modalContent = $('<div class="modal-content"></div>');
		var titleHtml = '<div class="modal-header">'
			+ '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'
			+ '<h4 class="modal-title">' + dialogTitle + '</h4>'
			+ '</div>';
		var bodyHtml = '<div class="modal-body"></div>';
		var footerHtml =
			'<div class="modal-footer">'
			+ '<button type="button" class="btn btn-default" id="saveConfig" style="display: inline-block;">'
			+ '保存个人配置'
			+ '<button type="button" class="btn btn-default" id="clearConfig" style="display: inline-block;">'
			+ '清除个人配置'
			+ '<button type="button" class="btn btn-default" data-dismiss="modal" id="calcel" style="display: inline-block;">'
			+ '取消'
			+ '</button>'
			+ '</button>'
			+ '</div >';
		this.$bodyContent = $('.modal-body-content');
		$modalContent.append(titleHtml);
		$modalContent.append(bodyHtml);
		$modalContent.append(footerHtml);
		var $dialogBody = $modalContent.find(".modal-body");
		$dialogBody.append('<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped table-sm" id="quicktyping-config-table"></table>');
		$('#' + dialogId).find('.modal-dialog').empty();
		$('#' + dialogId).find('.modal-dialog').append($modalContent);
		callback && callback();
	}//弹框显示
	function addDropEvent(tableID, tableConfig) {
		$.each($('#quicktyping-config-table').find('button'), function (index, item) {
			item['index'] = index;
			$(item).on('mousedown', function (mde) {
				var $currentBtn = $($('#quicktyping-config-table').find('button').get(this.index));
				//拿到当前行位置
				var currentIndex = baseDataTable.table[tableID].row($currentBtn.closest('tr')).data().tabIndex;
				//鼠标位置
				var moveY;
				var mdy = mde.clientY;
				var $currentTr = $(mde.target).parents('tr');
				var $moveDiv = $('<div></div>');
				$moveDiv.css('height', $currentTr.css('height'));
				$moveDiv.css('width', $currentTr.css('width'));
				$moveDiv.css('border', "1px dashed #000");
				$moveDiv.css('position', "absolute");
				$moveDiv.css('cursor', "move");
				$moveDiv.css('top', $currentTr.get(0).offsetTop + "px");
				$('#quicktyping-config-table').append($moveDiv)
				$(document).on('mousemove', function (mme) {
					moveY = mme.clientY - mdy;
					$moveDiv.css('top', $currentTr.get(0).offsetTop + moveY + "px");
				})
				$moveDiv.on('mouseup', function () {
					// console.log(parseInt($currentTr.css('height')));
					var step = Math.round(moveY / parseInt($currentTr.css('height')));
					var moveToIndex = currentIndex + step;
					if (moveToIndex < 0 || moveToIndex >= tableConfig.length) {
						$moveDiv.off('mousemove');
						$moveDiv.remove();
						return;
					}
					// console.log('从 '+ currentIndex +'移动到 ' + moveToIndex);
					//行换行 且 只有在两者都没有 isAfter 或 isBefore 属性时才可移动
					if ((tableConfig[currentIndex].isBefore != '1' && tableConfig[currentIndex].isAfter != '1') && (tableConfig[moveToIndex].isBefore == '1' || tableConfig[moveToIndex].isAfter == '1')) {//如果移动列没有固定列属性，移动到列有固定列属性，则给移动列属性添加固定列属性且附index
						tableConfig[moveToIndex].isBefore == '1' ? tableConfig[currentIndex]['isBefore'] = '1' : tableConfig[currentIndex]['isAfter'] = '1';
						//如果是固定前列 整体往后移动
						if (tableConfig[currentIndex].isBefore == '1') {
							for (var i = moveToIndex + 1; i < currentIndex; i++) {
								tableConfig[i].tabIndex = i + 1;
							}
						}
						//如果是固定后列 整体往前移动
						if (tableConfig[currentIndex].isAfter == '1') {
							for (var i = moveToIndex - 1; i < currentIndex; i--) {
								tableConfig[i].tabIndex = i - 1;
							}
						}

					} else if ((tableConfig[currentIndex].isBefore == '1' || tableConfig[currentIndex].isAfter == '1') && (tableConfig[moveToIndex].isBefore != '1' && tableConfig[moveToIndex].isAfter != '1')) { //当移动的是固定列，则将固定列移动处固定列以上全部改为固定列
						//如果是固定前列 整体往后移动
						if (tableConfig[currentIndex].isBefore == '1') {
							for (var i = currentIndex + 1; i <= moveToIndex; i++) {
								tableConfig[i]['isBefore'] = '1';
							}
							//交换行
							tableConfig.splice(currentIndex, 1, tableConfig.splice(moveToIndex, 1, tableConfig[currentIndex])[0]);
						}
						//如果是固定前列 整体往后移动
						if (tableConfig[currentIndex].isAfter == '1') { //整体往前移动
							for (var i = currentIndex - 1; i >= moveToIndex; i--) {
								tableConfig[i]['isAfter'] = '1';
							}
							//交换行
							tableConfig.splice(currentIndex, 1, tableConfig.splice(moveToIndex, 1, tableConfig[currentIndex])[0]);
						}
					} else { //如果两个都有固定列 或 两个都没有固定列属性，则直接进行交换行
						tableConfig.splice(currentIndex, 1, tableConfig.splice(moveToIndex, 1, tableConfig[currentIndex])[0]);
					}
					//刷新表格
					baseDataTable.originalConfig[tableID].dataConfig.dataSource = getTableConfig(tableConfig);
					baseDataTable.refreshByID(tableID);
					//重新绑定事件
					addDropEvent(tableID, getTableConfig(tableConfig));
					//移除虚线框
					$moveDiv.off('mousemove');
					$moveDiv.remove();
				})
			})
		})
	}//拖拽改变顺序
	/* 20180911 lxh 快速录入组件 可自定义配置 end*/

	//判断输入内容决定操作类型
	function inputFocusHandler(event) {
		config.isClickOut = false;
		showEmptyResultPanel(currentData);
		$(document).off('mousedown', documentMousedownHandler);
		$(document).on('mousedown', documentMousedownHandler);
		config.$input.off('keyup')
		config.$input.on('keyup', function (ev) {
			var isContinue = true;
			//回调函数
			if (typeof (config.beforeHandler) == 'function') {
				isContinue = config.beforeHandler();
			}
			if (isContinue) {
				switch (ev.keyCode) {
					// case 32:
					// 	//空格
					// 	break;
					case 13:
						//回车
						confirmCurrentRow();
						break;
					case 40:
						//下
						changeSelectRow('next');
						break;
					case 38:
						//上
						changeSelectRow('prev');
						break;
					default:
						//正常输入文字
						var searchValue = config.$input.val();
						inputSearch(searchValue, ev.keyCode);
						break;
				};
			}
		});
		//失去焦点且点击位置在外边则清空
		config.$input.off('blur')
		config.$input.on('blur', function (ev) {
			if (config.isClickOut == true) {
				clearInput();
			}
		})

	}
	//复位输入组件状态
	function clearInput() {
		//config.$input.val('');
		config.$input.off('blur');
		config.$input.off('keyup');
		$(document).off('mousedown', documentMousedownHandler);
		inputValue = '';
		refreshInput();
	}
	//窗体点击事件
	function documentMousedownHandler(event) {
		//是否点击的无关位置
		var dragel = config.$input.closest('.nsui-quicktyping').children('div.input');
		var target = event.target;
		var isClickOut = false;
		if (dragel[0] != target && !$.contains(dragel[0], target)) {
			isClickOut = true;
		}
		config.isClickOut = isClickOut;
	}

	//输入动作判断，空对象则搜索项目
	function inputSearch(searchValue, keyCode) {
		var trimSearchValue = $.trim(searchValue);
		//如果是空或者未发生变化则不搜索，如果发生变化，则保存的值searchValue
		if (trimSearchValue == '') {
			//忽略空
			//如果是空，且仍然在点删除 keycode:8
			if (keyCode == 8 && config.originalSearchValue == '') {
				removeValues();
			}
			/***lxh 2018/9/27修改 begin***/
			//如果为键码为删除，且值为空，则重新初始化输入框
			/* if(keyCode==8 && config.originalSearchValue == ''){
				removeValues();
				refreshInput();
				setFocus();
			} */
			/***lxh 2018/9/27修改 end***/
			inputValue = '';
			config.originalSearchValue = '';
			return false;
		} else if (trimSearchValue == inputValue) {
			//忽略相等
			// if(keyCode==8){
			// 	removeValues();
			// }
			return false;
		} else {
			//有意义的值
			inputValue = searchValue;
			config.originalSearchValue = searchValue;
		}
		//判断搜索类型
		switch (searchType) {
			case 'table':
				var resultArr = tableSearch(searchValue);
				showResultPanel(resultArr);
				break;
			case 'select':
				//下拉框的数据来源可能来自于baseData,也可能来自于config
				var selectDataArray;
				if (baseData[currentData]) {
					selectDataArray = baseData[currentData].data;
				} else if (config[currentData]) {
					selectDataArray = config[currentData].data;
				} else {
					console.error('无法找到下拉框数据:' + currentData);
					return;
				}
				showResultPanel(selectDataArray);
				selectSearch(searchValue);
				break;
			case 'date':
				break;
		}
	}
	//搜索下拉列表符合项
	function selectSearch(searchValue) {
		var selectData = baseData[currentData].data;
		var searchResultArr = [];
		for (var selectI = 0; selectI < selectData.length; selectI++) {
			var isResult = false;
			var searchReg = new RegExp(searchValue, 'i');
			for (key in selectData[selectI]) {
				var value = selectData[selectI][key];
				if (typeof (value) == 'string') {
					var indexNum = value.search(searchReg);
					if (indexNum >= 0) {
						isResult = true;
					}
				}
			}
			if (isResult) {
				searchResultArr.push(selectI);
			}
		}
		var selectIndex = 0;
		if (searchResultArr.length >= 1) {
			//只有是1的时候才是分辨出来,如果大于1则先选中第一个
			selectIndex = searchResultArr[0];
			var $selectLi = $(config.container).find('.result-panel.select ul li').eq(selectIndex);
			if ($selectLi.hasClass('current')) {
				//就不用动了
			} else {
				$(config.container).find('.result-panel.select ul li').removeClass('current');
				$selectLi.addClass('current');
			}
		} else if (searchResultArr.length == 0) {
			//都不符合
			$(config.container).find('.result-panel.select ul li').removeClass('current');
		}
	}
	function getTableData(currentData) {
		var projectLength = config.data[currentData].data.length;
		var resultArr = [];
		for (var projectI = 0; projectI < projectLength; projectI++) {
			var cProject = config.data[currentData].data[projectI];
			resultArr.push(cProject);
			if (resultArr.length >= config[currentData].projectTableRowNumber) {
				projectI = projectLength;
			}
		}
		return resultArr;
	}
	//搜索table表格符合项
	function tableSearch(searchValue) {
		var resultArr = [];
		var fieldNum = config[currentData].projectSearchField.length;
		var projectLength = config.data[currentData].data.length;
		var isSingleConditions = (searchValue.indexOf(' ') == -1);  //是否包含空格，如果有则视为多条件搜索
		if (isSingleConditions) {
			//单条件搜索
			var searchReg = new RegExp(searchValue, 'i');
			for (var projectI = 0; projectI < projectLength; projectI++) {
				var cProject = config.data[currentData].data[projectI];
				var isResult = false;
				for (var fieldI = 0; fieldI < fieldNum; fieldI++) {
					var fieldValue = cProject[config[currentData].projectSearchField[fieldI]];
					// lyw 20180523 判断 fieldValue 的类型 
					// 数字转为字符串
					// undefined转为‘’
					// string如果是字典时 转换为表格显示的内容进行搜索
					switch (typeof (fieldValue)) {
						case 'number':
							fieldValue = fieldValue.toString();
							break;
						case 'undefined':
							fieldValue = '';
							break;
						case 'string':
							// fieldValue设置的参数 对象 和 参数 名称
							var fieldValueSetParameterObj = config[currentData].projectFieldObj;
							var fieldValueSetParameterName = config[currentData].projectSearchField[fieldI];
							//判断是否 判断 了 字典是否存在 没有判断 开始判断
							if (!fieldValueSetParameterObj[fieldValueSetParameterName].isExeDict) {
								dictValidate(fieldValueSetParameterObj[fieldValueSetParameterName]);
							}
							// 判断了字典存在 
							// 判断该字段的字典是否存在
							if (fieldValueSetParameterObj[fieldValueSetParameterName].isHaveDict) {
								var dictData = nsVals.dictData[fieldValueSetParameterObj[fieldValueSetParameterName].dictName].jsondata;
								if (typeof (dictData[fieldValue]) == "string") {
									fieldValue = dictData[fieldValue];
								} else {
									fieldValue = '';
								}
							}
							break;
					}
					var indexNum = fieldValue.search(searchReg);
					if (indexNum >= 0) {
						isResult = true;
					}
				}
				if (isResult) {
					resultArr.push(cProject);
				}
				if (resultArr.length >= config[currentData].projectTableRowNumber) {
					projectI = projectLength;
				}
			}
		} else {
			//多条件搜索 start ------
			var searchValueArr = searchValue.split(' ');
			if (config[currentData].projectSearchType == 'order') {
				//顺序多条件搜索
				var tempResultArr = [];
				var searchReg = new RegExp(searchValueArr[0], 'i');
				var currentFieldIndex = 0;
				//先搜第一列
				for (var projectI = 0; projectI < projectLength; projectI++) {
					var cProject = config.data[currentData].data[projectI];
					var fieldValue = cProject[config[currentData].projectSearchField[0]];
					var indexNum = fieldValue.search(searchReg);
					if (indexNum >= 0) {
						tempResultArr.push(cProject);
					}
				}
				if (tempResultArr.length == 0) {
					//如果第一个关键字都没有搜索结果，那就直接返回了 resultArr = [];
					return resultArr;
				} else {
					for (var valueI = 1; valueI < searchValueArr.length; valueI++) {
						//挨个项目搜索
						if (searchValueArr[valueI] != '') {
							var tempSearchReg = new RegExp(searchValueArr[valueI], 'i');
							for (var tempProjectI = 0; tempProjectI < tempResultArr.length; tempProjectI++) {
								if (tempResultArr[tempProjectI] != false) {
									var tempFieldValue = tempResultArr[tempProjectI][config[currentData].projectSearchField[valueI]];
									var tempIndexNum = tempFieldValue.search(tempSearchReg);
									if (tempIndexNum == -1) {
										tempResultArr[tempProjectI] = false;  //用false替代内容
									}
								}
							}
						}
					}
					//过滤掉所有的false
					for (var tempProjectI2 = 0; tempProjectI2 < tempResultArr.length; tempProjectI2++) {
						if (tempResultArr[tempProjectI2] != false) {
							resultArr.push(tempResultArr[tempProjectI2]);
						}
						if (resultArr.length >= config[currentData].projectTableRowNumber) {
							tempProjectI2 = tempResultArr.length;
						}
					}
				}
				//顺序多条件搜索 end ------
			} else if (config[currentData].projectSearchType == 'disorder') {
				//乱序多条件搜索
				var searchReg = new RegExp(searchValueArr[0], 'i');
				var tempResultArr = [];
				for (var projectI = 0; projectI < projectLength; projectI++) {
					var cProject = config.data[currentData].data[projectI];
					var isResult = false;
					for (var fieldI = 0; fieldI < fieldNum; fieldI++) {
						var fieldValue = cProject[config[currentData].projectSearchField[fieldI]];
						var indexNum = fieldValue.search(searchReg);
						if (indexNum >= 0) {
							isResult = true;
						}
					}
					if (isResult) {
						tempResultArr.push(cProject);
					}
				}
				if (tempResultArr.length == 0) {
					//如果第一个关键字都没有搜索结果，那就直接返回了 resultArr = [];
					return resultArr;
				} else {
					//开始其它关键字搜索
					for (var searchI = 1; searchI < searchValueArr.length; searchI++) {
						var searchReg = new RegExp(searchValueArr[searchI], 'i');
						for (var tempProjectI = 0; tempProjectI < tempResultArr.length; tempProjectI++) {
							if (tempResultArr[tempProjectI] != false) {
								var cProject = tempResultArr[tempProjectI];
								var isResult = false;
								for (var fieldI = 0; fieldI < fieldNum; fieldI++) {
									var fieldValue = cProject[config[currentData].projectSearchField[fieldI]];
									var indexNum = fieldValue.search(searchReg);
									if (indexNum >= 0) {
										isResult = true;
									}
								}
								if (isResult == false) {
									tempResultArr[tempProjectI] = false;
								}
							}
						}
					}
				}
				for (var resultI = 0; resultI < tempResultArr.length; resultI++) {
					if (tempResultArr[resultI] != false) {
						resultArr.push(tempResultArr[resultI]);
					}
					if (resultArr.length >= config[currentData].projectTableRowNumber) {
						resultI = tempResultArr.length;
					}
				}
				//乱序多条件搜索 end ------
			}
		}
		return resultArr;
	}
	//输出结果选择
	function showResultPanel(resultArr) {
		if (resultArr.length == 0) {
			showEmptyResultPanel('empty');
		} else {
			switch (searchType) {
				case 'table':
					showTableResultPanel(resultArr);
					break;
				case 'select':
					showSelectResultPanle(resultArr);
					break;
			}
		}
	}
	//没有结果的面板
	function showEmptyResultPanel(messageType) {
		var resultPanel = config.$component.find('.input .result-panel');
		if (resultPanel.length == 0) {
			//没有结果面板
		} else {
			//有结果面板则删了
			resultPanel.remove();
		}
		var html = '<div class="result-panel empty">'
			+ config.message[messageType]
			+ '</div>';
		config.$input.after(html);
	}
	//显示表格的面板
	function showTableResultPanel(resultArr) {
		var resultPanel = config.$component.find('.input .result-panel');
		if (resultPanel.length > 0) {
			resultPanel.find('tr').off('click');
			resultPanel.remove();
		}
		if (config[currentData].isUseTabs) {
			//开启了tab列
			var ulHtml = '';
			for (var groupI = 0; groupI < config[currentData].tabsName.length; groupI++) {
				var activeClassStr = '';
				if (groupI === config[currentData].tabsDefaultIndex) {
					activeClassStr = ' active';
				}
				ulHtml += '<a href="javascript:void(0);" class="nstable-plus-panel-tabs-tab' + activeClassStr + '" ns-tabindex="' + groupI + '">'
					+ config[currentData].tabsName[groupI]
					+ '</a>';
			}
			var tabID = config.id + '-useTabs';
			var tableID = config.id + '-table';
			var styleStr = config[currentData].panelStyle.substring(config[currentData].panelStyle.indexOf('=') + 1, config[currentData].panelStyle.length - 1);
			var leftStr = 'left:' + config.tagsWidth + 'px;"';
			styleStr = 'style=' + styleStr + leftStr;
			var tabHtml = '<div class="result-panel list" ' + styleStr + '>'
				+ '<table ' + config[currentData].tableClassStyle + ' id="' + tableID + '">'
				+ '</table>'
				+ '<div class="nstable-plus-panel">'
				+ '<div class="nstable-plus-panel-tabs" id="' + tabID + '">'
				+ ulHtml
				+ '</div>'
				+ '</div>'
				+ '</div>';
			config.$input.after(tabHtml);
			var $quickTab = $('#' + tabID);
			var $quickTableID = $('#' + tableID);
			$quickTab.children('a').on('click', function (ev) {
				var $this = $(this);
				var activeIndex = $this.attr('ns-tabindex');
				$this.addClass('active');
				$this.siblings().removeClass('active');
				changeTab(tableID, activeIndex);
			})
			changeTab(tableID, config[currentData].tabsDefaultIndex);
			function changeTab(tableID, tabIndex) {
				var tabArr = [];
				tabArr = tabArr.concat(config[currentData].tabsColumn.before, config[currentData].tabsColumn.tabGroup[tabIndex], config[currentData].tabsColumn.after);
				var theadHtml = '';
				var titleField = [];
				for (var titleI = 0; titleI < tabArr.length; titleI++) {
					if ((typeof (!tabArr[titleI].hidden) != 'undefined' && !tabArr[titleI].hidden) || typeof (!tabArr[titleI].hidden) == 'undefined') {//隐藏列 如果没有hidden属性，则不隐藏，如果有hidden属性且为 true ，则隐藏该列不显示
						titleField.push(tabArr[titleI].key);
						if (typeof (tabArr[titleI].width) != 'number') {
							theadHtml += '<th>' + tabArr[titleI].title + '</th>';
						} else {
							theadHtml += '<th style="width:' + tabArr[titleI].width + 'px;">' + tabArr[titleI].title + '</th>';
						}
					}
				}
				theadHtml = '<thead><tr>' + theadHtml + '</tr></thead>';
				var tbodyHtml = '';
				for (resultI = 0; resultI < resultArr.length; resultI++) {
					var trHtml = '';
					for (var tdI = 0; tdI < titleField.length; tdI++) {
						// trHtml += '<td>'+resultArr[resultI][titleField[tdI]]+'</td>';
						//lyw 20180521
						var tdValue = resultArr[resultI][titleField[tdI]];
						switch (typeof (tdValue)) {
							case 'undefined':
								tdValue = '';
								break;
							case 'number':
								tdValue = tdValue.toString();
								break;
							case 'string':
								if (!config[currentData].projectFieldObj[titleField[tdI]].isExeDict) {
									dictValidate(config[currentData].projectFieldObj[titleField[tdI]]);
								}
								if (config[currentData].projectFieldObj[titleField[tdI]].isHaveDict) {
									var dictData = nsVals.dictData[config[currentData].projectFieldObj[titleField[tdI]].dictName].jsondata;
									if (typeof (dictData[tdValue]) == "string") {
										tdValue = dictData[tdValue];
									} else {
										tdValue = tdValue;
										nsAlert(config[currentData].projectFieldObj[titleField[tdI]].dictName + "字典中" + tdValue + "字段不存在", 'error');
									}
								}
								break;
							default:
								break;
						}
						//formatHandler
						if (typeof (config[currentData].projectFieldObj[titleField[tdI]].formatHandler) == 'object') {
							var customFormatData = config[currentData].projectFieldObj[titleField[tdI]].formatHandler;
							switch (customFormatData.type) {
								case 'replaceString':
									tdValue = customFormatData.data[resultArr[resultI][titleField[tdI]]];
									typeof (tdValue) == 'undefined' ? tdValue = "" : "";
									break;
								case 'date':
									//如果时间格式不对，或者没有时间。则显示为空，且报错
									var dateValue = moment(Number(resultArr[resultI][titleField[tdI]])).format(customFormatData.data.formatDate);
									if (dateValue == 'Invalid date') {
										tdValue = "";
										console.error(resultArr[resultI], '无时间属性或时间格式不对');
									} else {
										tdValue = dateValue
									}
									break;
							}
						}
						var tdClass = '';
						switch (config[currentData].projectFieldObj[titleField[tdI]].formatType) {
							case 'money':
								tdClass = config[currentData].projectFieldObj[titleField[tdI]].formatType;
								break;
						}
						trHtml += '<td class="' + tdClass + '">' + tdValue + '</td>';
					}
					var trClass = '';
					if (resultI == 0) {
						trClass = ' class="current"';
					}
					trHtml = '<tr ns-index="' + resultArr[resultI][config[currentData].projectIndexField] + '" ns-id="' + resultArr[resultI][config[currentData].projectIdField] + '" ' + trClass + '>' + trHtml + '</tr>';
					tbodyHtml += trHtml;
				}
				$quickTableID.html(theadHtml + tbodyHtml);
				$quickTableID.find('tbody tr').on('click', function (ev) {
					var indexNumber = Number($(this).attr('ns-index'));
					//var idString = $(this).attr('ns-id');
					addProject(indexNumber);
				})
			}
		} else {
			var tabelHtml = '';
			for (resultI = 0; resultI < resultArr.length; resultI++) {
				var trHtml = '';
				for (var tdI = 0; tdI < config[currentData].tdField.length; tdI++) {
					var tdClass = '';
					switch (config[currentData].projectFieldObj[config[currentData].tdField[tdI]].formatType) {
						case 'money':
							tdClass = config[currentData].projectFieldObj[config[currentData].tdField[tdI]].formatType;
							break;
					}
					var valueStr = resultArr[resultI][config[currentData].tdField[tdI]] ? resultArr[resultI][config[currentData].tdField[tdI]] : '';
					trHtml += '<td class="' + tdClass + '">' + valueStr + '</td>';
				}
				var trClass = '';
				if (resultI == 0) {
					trClass = ' class="current"';
				}
				trHtml = '<tr ns-index="' + resultArr[resultI][config[currentData].projectIndexField] + '" ns-id="' + resultArr[resultI][config[currentData].projectIdField] + '" ' + trClass + '>' + trHtml + '</tr>';
				tabelHtml += trHtml;
			}
			var styleStr = config[currentData].panelStyle.substring(config[currentData].panelStyle.indexOf('=') + 1, config[currentData].panelStyle.length - 1);
			var leftStr = 'left:' + config.tagsWidth + 'px;"';
			styleStr = 'style=' + styleStr + leftStr;
			tabelHtml = '<div class="result-panel list" ' + styleStr + '>'
				+ '<table ' + config[currentData].tableClassStyle + '>'
				+ config[currentData].theadHtml
				+ '<tbody>'
				+ tabelHtml
				+ '</tbody>'
				+ '</table>';
			+'</div>';
			config.$input.after(tabelHtml);
			config.$input.next().find('tbody tr').on('click', function (ev) {
				var indexNumber = Number($(this).attr('ns-index'));
				//var idString = $(this).attr('ns-id');
				addProject(indexNumber);
			})
		}

	}
	//判断字典是否存在
	function dictValidate(data) {
		if (debugerMode) {
			if (typeof (data.dictName) == "string") {
				if ($.isEmptyObject(nsVals.dictData)) {
					data.isExeDict = false;
				} else {
					data.isExeDict = true;
					if (typeof (nsVals.dictData[data.dictName]) == 'undefined') {
						console.error(data.dictName + "的字典不存在");
					} else {
						data.isHaveDict = true;
					}
				}

			}
		}
	}
	//表格相关配置值设置
	function initTablePanel(operatorType) {
		var defaultConfig = {
			projectTableWidth: 800,
			projectTableRowNumber: 10,
		}
		nsVals.setDefaultValues(config[operatorType], defaultConfig);
		// config[operatorType].projectTableWidth = 800;//默认宽度
		// config[operatorType].projectTableRowNumber = 10;//默认行数
		config[operatorType].projectSearchField = [];  //搜索字段数组
		config[operatorType].titleField = [];
		config[operatorType].titleWidth = [];
		config[operatorType].tdField = [];
		/************20180315 sjj 添加表格tab属性配置 start*********************/
		config[operatorType].isUseTabs = typeof (config[operatorType].isUseTabs) == 'boolean' ? config[operatorType].isUseTabs : false;//默认不适用
		//是否定义了默认读取列
		if (typeof (config[operatorType].tabsDefaultIndex) != 'number') { config[operatorType].tabsDefaultIndex = 0; }
		//tableGetTabOption(operatorType);
		/************20180315 sjj 添加表格tab属性配置 end*********************/
		var totolTableWidthNumber = 0;  //合计出来的表格宽度，必须每个td都设置了宽度
		var allSetTableWidth = true;  //是否全部设置了宽度
		var beforeTabArr = [];
		var tabsArr = [];
		var afterTabArr = [];
		config[operatorType].projectFieldObj = {};
		for (var i = 0; i < config[operatorType].projectField.length; i++) {
			//判断参数是否合法
			if (debugerMode) {
				optionsArr = [
					['key', 'string', true],
					['title', 'string'],
					['search', 'boolean'],
					['isID', 'boolean'],
					['isIndex', 'boolean'],
					['isName', 'boolean'],
					['width', 'number'],
					['dictName', 'string'],
					['formatType', 'string']
				];
				var isValid = nsDebuger.validOptions(optionsArr, config[operatorType].projectField[i]);
			}
			var projectFieldData = config[operatorType].projectField[i];
			//生成对象 lyw
			config[operatorType].projectFieldObj[projectFieldData.key] = $.extend(true, {}, config[operatorType].projectField[i]);
			var projectFieldObjData = config[operatorType].projectFieldObj[projectFieldData.key];
			//设置属性用于判断是否有有字典
			projectFieldObjData.isHaveDict = false;
			projectFieldObjData.isExeDict = false;
			//判断字典是否存在
			dictValidate(projectFieldObjData);
			//设置index;
			if (config[operatorType].projectField[i].isIndex) {
				if (typeof (config[operatorType].projectIndexField) != 'undefined') {
					console.error(language.ui.nsuiquicktyping.isIndex + config[operatorType].projectIndexField);
					console.error(config[operatorType].projectField[i]);
				}
				config[operatorType].projectIndexField = config[operatorType].projectField[i].key;
			}
			//设置id;
			if (config[operatorType].projectField[i].isID) {
				if (typeof (config[operatorType].projectIdField) != 'undefined') {
					console.error(language.ui.nsuiquicktyping.isID + config[operatorType].projectIdField);
					console.error(config[operatorType].projectField[i]);
				}
				config[operatorType].projectIdField = config[operatorType].projectField[i].key;
			}
			//设置name;
			if (config[operatorType].projectField[i].isName) {
				if (typeof (config[operatorType].projectNameField) != 'undefined') {
					console.error(language.ui.nsuiquicktyping.isName + config[operatorType].projectNameField);
					console.error(config[operatorType].projectField[i]);
				}
				config[operatorType].projectNameField = config[operatorType].projectField[i].key;
			}
			//设置search对象数组
			if (config[operatorType].projectField[i].search) {
				config[operatorType].projectSearchField.push(config[operatorType].projectField[i].key);
			}
			//设置title数组
			if (typeof (config[operatorType].projectField[i].title) == 'string') {
				config[operatorType].titleField.push(config[operatorType].projectField[i].title);
				config[operatorType].titleWidth.push(config[operatorType].projectField[i].width);
				config[operatorType].tdField.push(config[operatorType].projectField[i].key);
			}
			//计算宽度
			if (typeof (config[operatorType].projectField[i].width) == 'number') {
				totolTableWidthNumber += config[operatorType].projectField[i].width;
			} else {
				allSetTableWidth = false;
			}
			switch (config[operatorType].projectField[i].tabPosition) {
				case 'before':
					//设置了前置固定列
					beforeTabArr.push(config[operatorType].projectField[i]);
					break;
				case 'after':
					//设置了后置固定列
					afterTabArr.push(config[operatorType].projectField[i]);
					break;
				default:
					tabsArr.push(config[operatorType].projectField[i]);
					break;
			}
		}
		var tabsGroup = [];
		for (var groupI = 0; groupI < config[operatorType].tabsName.length; groupI++) {
			tabsGroup[groupI] = [];
			for (var tabI = 0; tabI < tabsArr.length; tabI++) {
				if (tabsArr[tabI].tabPosition === groupI) {
					tabsGroup[groupI].push(tabsArr[tabI]);
				}
			}
		}
		config[operatorType].tabsColumn = {
			before: beforeTabArr,
			tabs: tabsArr,
			tabGroup: tabsGroup,
			after: afterTabArr,
		};
		//如果全都设置了，则改变projectTableWidth
		if (allSetTableWidth) {
			if (debugerMode) {
				if (typeof (config[operatorType].projectTableWidth) != 'undefined') {
					if (config[operatorType].projectTableWidth != totolTableWidthNumber) {
						console.info(language.ui.nsuiquicktyping.consoleinfoA + config[operatorType].projectTableWidth + language.ui.nsuiquicktyping.consoleinfoB + totolTableWidthNumber);
					}
				}
			}
			config[operatorType].projectTableWidth = totolTableWidthNumber;
		}
		//总体结果是否合法
		if (debugerMode) {
			if (config[operatorType].projectSearchField.length == 0) {
				console.error(language.ui.nsuiquicktyping.projectSearchField);
			}
			if (config[operatorType].titleField.length == 0) {
				console.error(language.ui.nsuiquicktyping.titleField);
			}
			if (typeof (config[operatorType].projectIndexField) == 'undefined') {
				console.error(language.ui.nsuiquicktyping.projectIndexField);
			}
			if (typeof (config[operatorType].projectIdField) == 'undefined') {
				console.error(language.ui.nsuiquicktyping.projectIdField);
			}
		}
		//表格head的html
		var theadHtml = '';
		for (var titleI = 0; titleI < config[operatorType].titleField.length; titleI++) {
			if (typeof (config[operatorType].titleWidth[titleI]) != 'number') {
				theadHtml += '<th>' + config[operatorType].titleField[titleI] + '</th>';
			} else {
				theadHtml += '<th style="width:' + config[operatorType].titleWidth[titleI] + 'px;">' + config[operatorType].titleField[titleI] + '</th>';
			}
		}
		theadHtml = '<thead><tr>' + theadHtml + '</tr></thead>';
		config[operatorType].theadHtml = theadHtml;
		//表格的class 和 style
		var tableClassStyle = 'class="table table-bordered table-condensed table-hover"';
		var panelStyle = '';
		if (typeof (config[operatorType].projectTableWidth) == 'number') {
			panelStyle = ' style="width:' + config[operatorType].projectTableWidth + 'px;table-layout:fixed;"';
			tableClassStyle += panelStyle;
		} else if (typeof (config[operatorType].projectTableWidth) == 'string') {
			panelStyle = ' style="width:' + config[operatorType].projectTableWidth + ';table-layout:fixed;"';
			tableClassStyle += panelStyle;
		} else if (typeof (config[operatorType].projectTableWidth) == 'undefined') {
			panelStyle = ' style="width:100%;table-layout:fixed;"';
			tableClassStyle += panelStyle;
		}
		config[operatorType].panelStyle = panelStyle;
		config[operatorType].tableClassStyle = tableClassStyle;
	}
	//显示下拉框的面板
	function showSelectResultPanle(resultArr) {
		//如果有其它的结果面板，就需要删除
		if (config.$component.find('.result-panel').length > 0) {
			config.$component.find('.result-panel').remove();
		}
		var ajaxData = [];
		var html = '';
		if (typeof (config[currentData].data) == 'function') {
			var currentIndex = 0;
			for (var orderI = 0; orderI < config.inputOrder.length; orderI++) {
				if (config.inputOrder[orderI] == currentData) {
					currentIndex = orderI;
				}
			}
			if (currentIndex > 0) {
				currentIndex = currentIndex - 1;
			}
			var paramsData = config[currentData].data(config.values[config.inputOrder[currentIndex]]);
			var ajaxData = dataConfig.inputAjaxConfig[currentData];
			ajaxData.data = paramsData;
			nsVals.ajax(ajaxData, function (data) {
				ajaxData = data[ajaxData.dataSrc];
				html = fillSelectHtml(ajaxData);
				html = '<ul>' + html + '</ul>';
				config.$component.find('.result-panel').html(html);
				config.data[currentData].data = ajaxData;
				var $ul = config.$component.find('.result-panel').children('ul');
				$ul.children('li').on('click', function (ev) {
					var nIndex = $(this).attr('ns-index');
					addSelect(nIndex);
				});
			});
		} else {
			ajaxData = resultArr;
			html = fillSelectHtml(ajaxData);
		}
		var panelStyle = 'style="left:' + config.tagsWidth + 'px;"';
		html = '<div class="result-panel select" ' + panelStyle + '>'
			+ '<ul>'
			+ html
			+ '</ul>'
			+ '</div>';
		config.$input.after(html);
		var $ul = config.$input.parent().children('.result-panel.select').children('ul');
		$ul.children('li').on('click', function (ev) {
			var nIndex = $(this).attr('ns-index');
			addSelect(nIndex);
		});
	}
	function fillSelectHtml(ajaxData) {
		var html = '';
		for (var dataI = 0; dataI < ajaxData.length; dataI++) {
			var value = ajaxData[dataI][config[currentData].valueField];
			var text = ajaxData[dataI][config[currentData].textField];
			var currentCls = '';
			if (dataI == 0) {
				currentCls = ' class="current"';
			}
			html += '<li ns-basedata="' + currentData + '" ns-index="' + dataI + '" ' + currentCls + '>' + text + '</li>';
		}
		return html;
	}
	//添加选中的项目
	function addProject(indexNumber) {
		if (!isNaN(indexNumber)) {
			var project = {
				index: indexNumber,
				id: config.data[currentData].data[indexNumber][config[currentData].projectIdField],
				name: config.data[currentData].data[indexNumber][config[currentData].projectNameField],
				data: config.data[currentData].data[indexNumber]
			}
			config.values[currentData] = project;
			addTag(project.name, project.index);
			confirmResult();
		}
	}
	//添加选中的select
	function addSelect(index) {
		var dataObj = {};
		var name = '';
		if (isNaN(index)) {
			if (config[currentData].isAllowOther) {
				dataObj = {
					index: false,
					value: inputValue,
					data: config.data[currentData].data
				}
				name = inputValue;
			} else {
				nsAlert(language.ui.nsuiquicktyping.addSelectError, 'error');
				return false;
			}
		} else {
			dataObj = {
				index: index,
				value: config.data[currentData].data[index][config[currentData].valueField],
				name: config.data[currentData].data[index][config[currentData].textField],
				data: config.data[currentData].data[index]
			}
			name = config.data[currentData].data[index][config[currentData].contentField];
		}

		config.values[currentData] = dataObj;
		addTag(name);
		confirmResult();
	}
	//添加数字
	function addNumber(inputValue) {
		inputValue = Number(inputValue);
		function notNumber() {
			nsAlert(language.ui.nsuiquicktyping.addNumber, 'error');
			config.$input.select();
		}
		if (typeof (inputValue) != 'number' || isNaN(inputValue)) {
			notNumber();
		} else {
			if (inputValue <= 0) {
				notNumber();
			} else {
				var dataObj = {
					value: inputValue
				}
				config.values[currentData] = dataObj;
				addTag(inputValue);
				confirmResult();
			}
		}
	}
	//添加文本
	function addText(inputValue) {
		inputValue = $.trim(inputValue);
		var dataObj = {
			value: inputValue
		}
		config.values[currentData] = dataObj;
		if (inputValue == '') {
			inputValue = '无';
		}
		addTag(inputValue);
		confirmResult();
	}
	//添加日期
	function addDate(inputValue) {
		inputValue = $.trim(inputValue);
		var dataObj = {
			value: inputValue
		}
		config.values[currentData] = dataObj;
		if (inputValue == '') {
			inputValue = '无';
		}
		addTag(inputValue);
		confirmResult();
	}
	//添加tag标签
	function addTag(nameString, currentIndex) {
		if (typeof (config[currentData].title) == 'string') {
			nameString = config[currentData].title + nameString;
		}
		var closeHtml = '';
		var closeCls = '';
		/*if(currentData=='project'){
			closeHtml = '<div class="close"></div>';
			closeCls = ' withclose';
		}*/
		var tagHtml = '<div class="quicktyping-tag' + closeCls + '"><span>' + nameString + closeHtml + '</span></div>';
		config.$tags.append(tagHtml);
		//默认字段自动上屏
		if (currentData == 'project' && $.type(currentIndex) != 'undefined') {
			var defaultHtml = "";
			if (config.projectDefaultField.length > 0) {
				$.each(config.projectDefaultField, function (index, item) {
					var currentProject = config[currentData].projectFieldObj[item];
					var defaultText = currentProject.defaultText;
					var title = currentProject.title;
					config.defaultValue = config.data.project.data[currentIndex][item];
					if ($.type(currentProject.formatHandler) != 'undefined') {
						switch (currentProject.formatHandler.type) {
							case 'replaceString':
								config.defaultValue = customFormatData.data[resultArr[resultI][titleField[tdI]]];
								typeof (config.defaultValue) == 'undefined' ? config.defaultValue = "" : "";
								break;
							case 'date':
								//如果时间格式不对，或者没有时间。则显示为空，且报错
								var dateValue = moment(Number(config.defaultValue)).format(currentProject.formatHandler.data.formatDate);
								if (dateValue == 'Invalid date') {
									config.defaultValue = "";
								} else {
									config.defaultValue = dateValue
								}
								break;
						}
					}
					typeof (config.defaultValue) == 'undefined' ? config.defaultValue = "" : "";
					/* defaultHtml += '<div class="quicktyping-tag' + closeCls + '"><span>' + title + ':</span><input class="ns-table-input form-control" data-index="' + index + '" data-type="' + item + '" config.defaultValue="' + config.defaultValue + '" showResult="true"></input></div>'; */
					// defaultHtml += '<div class="quicktyping-tag' + closeCls + '"><span>' + title + ':</span></div>';
					if ($.inArray(item, config.inputOrder) == -1) {
						config.inputOrder.splice(index + 1, 0, item);
					}
					config.message[item] = defaultText;
					config[item] = { type: "number", title: title + "：" };
				})
			}
		}
	}

	//确认选择
	function confirmCurrentRow() {
		switch (searchType) {
			case 'table':
				var $currentRow = config.$component.find('.result-panel table tbody tr.current');
				var index = Number($currentRow.attr('ns-index'));
				addProject(index);
				break;
			case 'select':
				var $currentOption = config.$component.find('.result-panel ul li.current');
				var index = Number($currentOption.attr('ns-index'));
				addSelect(index);
				break;
			case 'number':
				var inputValue = config.$input.val();
				addNumber(inputValue);
				break;
			case 'text':
				var inputValue = config.$input.val();
				addText(inputValue);
				break;
			case 'date':
				var inputValue = config.$input.val();
				addDate(inputValue);
				break;
			case 'complete':
				inputComplete();
				break;
			default:
				break;
		}
	}
	//改变选择行
	function changeSelectRow(direction) {
		//direction  next 下， prev 上
		var isEmpty = config.$component.find('.result-panel').hasClass('empty');
		if (isEmpty) {
			//没结果不处理
			return false;
		}
		function currentItemMove() {
			if (direction == 'next') {
				//向下
				var $nextRow = $currentRow.next();
				if ($nextRow.length < 1) {
					//没有下一条，就不用动了
				} else {
					$currentRow.removeClass('current');
					$nextRow.addClass('current');
				}
			} else if (direction == 'prev') {
				//向上
				var $prevRow = $currentRow.prev();
				if ($prevRow.length < 1) {
					//没有上一条，就不用动了
				} else {
					$currentRow.removeClass('current');
					$prevRow.addClass('current');
				}
			}
		}
		switch (searchType) {
			case 'table':
				var $currentRow = config.$component.find('.result-panel table tbody tr.current');
				currentItemMove();
				break;
			case 'select':
				var $currentRow = config.$component.find('.result-panel ul li.current');
				currentItemMove();
				break;
		}
	}

	function removeValues() {
		var tagNum = config.$tags.children('.quicktyping-tag').length;
		if (tagNum > 0) {
			config.$tags.children('.quicktyping-tag').last().remove();
			var tagsWidth = 0;
			if (tagNum > 1) {
				//不是最后一个
				tagsWidth = config.$tags.outerWidth() + 2;
			} else {
				tagsWidth = 0;
			}

			config.tagsWidth = tagsWidth;
			config.$input.css('width', (config.inputWidth - tagsWidth) + 'px');
			delete config.values[config.inputOrder[tagNum - 1]];
			currentData = config.inputOrder[tagNum - 1];
			var isFirst = false;
			if (tagNum > 1) {
				isFirst = true;
			}
			searchType = config[currentData].type;
			if (currentData != 'date') {
				config.$input.inputmask('remove');
			}
			showNextPanel(isFirst);
		}
		//console.log(config.values)
	}
	//确认结果面板
	function confirmResult() {
		//移除面板
		var $resultPanel = config.$component.find('.result-panel');
		if ($resultPanel.length > 0) {
			$resultPanel.remove();
		}
		//改变input位置
		var tagsWidth = config.$tags.outerWidth() + 2;
		config.tagsWidth = tagsWidth;
		config.$input.css('width', (config.inputWidth - tagsWidth) + 'px');
		config.$input.val('');
		config.$input.focus();
		//如果有默认带出则默认显示并选中
		if (typeof (config.defaultValue) != 'undefined') {
			config.$input.val(config.defaultValue);
			config.$input.select();
			delete config.defaultValue
		}
		//根据当前结果决定下一个是什么输入项
		var currentOrder = 0;
		for (orderI = 0; orderI < config.inputOrder.length; orderI++) {
			if (currentData == config.inputOrder[orderI]) {
				currentOrder = orderI;
			}
		}
		if (currentOrder < config.inputOrder.length - 1) {
			currentData = config.inputOrder[currentOrder + 1];
			if (debugerMode) {
				if (typeof (config[currentData]) != 'object') {
					console.error(language.ui.nsuiquicktyping.confirmResult + currentData + language.ui.nsuiquicktyping.confirmResultObject);
				}
				if (typeof (config[currentData].type) != 'string') {
					console.error(language.ui.nsuiquicktyping.confirmResult + currentData + language.ui.nsuiquicktyping.confirmResultString);
				}
			}
			searchType = config[currentData].type;
		} else {
			currentData = 'complete';
			searchType = 'complete';
		}
		showNextPanel(true);
	}
	//显示下一步需要的面板
	function showNextPanel(isFirst) {
		config.$input.inputmask('remove');
		if (isFirst) {
			switch (searchType) {
				case 'message':
				case 'number':
					showEmptyResultPanel(currentData);
					break;
				case 'date':
					showEmptyResultPanel(currentData);
					var dateForat = 'yyyy-mm-dd';
					if (config[currentData].format) {
						dateForat = config[currentData].format;
					}
					config.$input.inputmask(dateForat);
					break;
				case 'table':
					var resultArr = getTableData(currentData);
					showTableResultPanel(resultArr);
					break;
				case 'select':
					var subdate;
					if (typeof (baseData[currentData]) == 'object') {
						subdate = baseData[currentData].data;
					} else if (typeof (config[currentData]) == 'object') {
						subdate = config[currentData].data;
					} else {
						subdate = [];
						console.error('下拉框:' + currentData + '无法找到数据');
					}
					showSelectResultPanle(subdate);
					break;
				case 'complete':
					showEmptyResultPanel(currentData);
					break;
				default:
					showEmptyResultPanel(currentData);
					break;
			}
		} else {
			showEmptyResultPanel(currentData);
		}
	}
	//完成输入
	function inputComplete() {
		var isReturn = true;
		if (typeof (config.completeHandler) == 'function') {
			isReturn = config.completeHandler(config.values);
		}
		//isReturn = typeof(isReturn) == 'boolean' ? isReturn : true;
		if (typeof (isReturn) != 'boolean') {
			nsAlert('返回值不是布尔值！');
		}
		if (isReturn) {
			refreshInput();
			config.$input.focus();
		}
	}
	//刷新输入框，开始第二次使用
	function refreshInput() {
		config.tagsWidth = 0;//恢复默认值
		config.values = {};
		initContainer();
	}
	//设置焦点
	function setFocus() {
		refreshInput();
		config.$input.focus();
	}
	return {
		getValues: function () { return config.values; },
		getBaseData: function () { return baseData; },
		dataInit: dataInit,
		init: init,
		setFocus: setFocus
	}
})(jQuery);

/*************************************************************************************************************************
 * 快速输入组件 复制的上面 改了上面记得复制过来 cy 20180403  nsUI.quicktypingTwo
 */
nsUI.quicktypingTwo = (function ($) {
	//nsUI.quicktyping.baseData = {}; 	//总的存储数据对象
	var dataConfig = {};  				//数据配置
	var config = {}; 					//用户当前使用的配置
	var baseData = {}; 					//基础数据
	var originalConfig = {};			//原始数据,用户输入的config，用来重新配置，重新生成组件
	var localConfig = {};				//本地个人配置
	var inputValue = ''; 				//输入框的值
	//数据处理部分 start---------------------------------------------------
	//数据初始化
	function dataInit(systemDataConfig) {

		if (debugerMode) {
			parametersArr = [
				[systemDataConfig, 'object', true]
			];
			nsDebuger.validParameter(parametersArr);
			optionsArr = [
				['dataID', 'string', true],
				//	['baseDataAjax','object',true],
				['inputAjaxConfig', 'object', true],
			];
			nsDebuger.validOptions(optionsArr, systemDataConfig);
		}

		dataConfig = systemDataConfig;
		baseData = {};
		if (typeof (nsUI.quicktyping.baseData) == 'undefined') {
			nsUI.quicktyping.baseData = {};
		}
		nsUI.quicktyping.baseData[dataConfig.dataID] = baseData;

		baseData.totalAjax = 0; 		//总的加载数量,必须有baseData,所以从1开始
		baseData.completeAjax = 0; 		//ajax加载数量
		if (!$.isEmptyObject(dataConfig.baseDataAjax)) {
			//支持原来的方式
			if (typeof (dataConfig.baseDataAjax) == 'object') {
				//是object类型,默认第一个是table表格
				dataConfig.inputAjaxConfig.project = {
					plusData: 'project',
					url: dataConfig.baseDataAjax.url,
					type: dataConfig.baseDataAjax.type,
					dataSrc: dataConfig.baseDataAjax.dataSrc
				}
			}
		}
		/*nsVals.ajax(dataConfig.baseDataAjax,function(data){
			//console.log(data[dataConfig.baseDataAjax.dataSrc]);
			baseData.project = {};
			baseData.project.data = nsVals.csv2jsonArray(data[dataConfig.baseDataAjax.dataSrc], {isAddDefaultIndex:true});
			baseData.completeAjax++;
			baseDataComplete();
		});*/
		for (input in dataConfig.inputAjaxConfig) {
			baseData.totalAjax++;
			var inputConfig = dataConfig.inputAjaxConfig[input];
			nsVals.ajax(inputConfig, function (data, ajaxConfig) {
				var keyname = ajaxConfig.plusData;
				baseData[keyname] = {};
				baseData[keyname].data = data[inputConfig.dataSrc];
				if (config[keyname].type == 'table') {
					//baseData[keyname].data = nsVals.csv2jsonArray(data[inputConfig.dataSrc], {isAddDefaultIndex:true});
					var formatData = [];
					if (typeof (data[inputConfig.dataSrc]) == "undefined") {
						console.error('dataSrc:' + inputConfig.dataSrc + '配置错误');
						console.log(data);
					} else {
						for (var i = 0; i < data[inputConfig.dataSrc].length; i++) {
							var listData = data[inputConfig.dataSrc][i];
							listData[config[keyname].projectIndexField] = i;
							formatData.push(listData);
						}
					}
					baseData[keyname].data = formatData;
				}
				baseData.completeAjax++;
				baseDataComplete();
			});
		}
		// for(input in dataConfig.inputAjaxConfig){
		// 	baseData.totalAjax++;
		// 	var inputConfig = dataConfig.inputAjaxConfig[input];
		// 	nsVals.ajax(inputConfig, function(data,ajaxConfig){
		// 		var keyname = ajaxConfig.plusData;
		// 		baseData[keyname] = {};
		// 		baseData[keyname].data = data[inputConfig.dataSrc];
		// 		if(config[keyname].type == 'table'){
		// 			baseData[keyname].data = nsVals.csv2jsonArray(data[inputConfig.dataSrc], {isAddDefaultIndex:true});
		// 		}
		// 		baseData.completeAjax++;
		// 		baseDataComplete();
		// 	});
		// }
	}
	//加载ajax监视
	function baseDataComplete() {
		if (baseData.completeAjax == baseData.totalAjax) {
			//console.log(baseData.completeCallback);
			if (typeof (baseData.completeCallback) == 'function') {
				baseData.completeCallback();
				delete baseData.completeCallback;
			}
		}
	}
	//数据处理部分 end-----------------------------------------------------
	function validUserConfig(_userConfig) {
		var isValid = true;
		if (debugerMode) {
			//userConfig 
			parametersArr = [
				[_userConfig, 'object', true]
			];
			isValid = nsDebuger.validParameter(parametersArr);
			if (isValid == false) {
				return false;
			}
			//userConfig 属性验证
			optionsArr = [
				['id', 'string', true],
				['dataID', 'string', true],
				['container', 'string', true],
				['label', 'string', true],
				//['projectField','array',true],
				//['projectTableWidth','number'],
				['inputWidth', 'number']
			];
			nsDebuger.validOptions(optionsArr, _userConfig);
			if (isValid == false) {
				return false;
			}

			return isValid;
		}
	}
	//设置userConfig的默认值
	function setDefault(_userConfig) {
		if (!$.isEmptyObject(dataConfig.baseDataAjax)) {
			if (typeof (dataConfig.baseDataAjax) == 'object') {
				if (typeof (_userConfig.project) == 'object') {
					// console.log(_userConfig.project)
				} else {
					_userConfig.project = {
						source: 'project',
						type: 'table',
						projectSearchType: 'disorder',					//多条件搜索时候是顺序还是乱序 order disorder  默认disorder
						projectTableWidth: 800,						//表格宽度
						projectTableRowNumber: 5,						//表格行数
						projectField: _userConfig.projectIdField
					}
				}
			}
		}
		//获取默认上屏字段
		if (typeof (_userConfig.project) == 'object') {
			var projectDefaultField = [];
			var projectDefaultText = {};
			for (var index = 0; index < _userConfig.project.projectField.length; index++) {
				var item = _userConfig.project.projectField[index];
				if (item.hasOwnProperty('default') && item['default']) {
					projectDefaultField.push(item.key);
					projectDefaultText[item.key] = item.defaultText;
				}
			}
			_userConfig['projectDefaultField'] = projectDefaultField;
			_userConfig['projectDefaultText'] = projectDefaultText;
		}

		var defaultConfig = {
			//projectTableWidth:800,
			//projectTableRowNumber:10,
			inputWidth: 500,
			tagsWidth: 0
		}
		for (option in defaultConfig) {
			if (typeof (_userConfig[option]) == 'undefined') {
				_userConfig[option] = defaultConfig[option];
			}
		}
		return _userConfig;
	}
	//组件初始化
	function init(userConfig) {
		var ajaxConfig = {
			url: getRootPath() + "/naTableConfig/getPersonalUiConfig",
			data: {},
			dataSource: "data",
			type: "POST"
		}
		var ajax = nsVals.getAjaxConfig(ajaxConfig, {})
		nsVals.ajax(ajax, function (data) {
			if (data.success) {
				var ajaxData = data.data;
				if ($.isEmptyObject(ajaxData)) {
					var objectState = 2;
				} else {
					var objectState = 1;
					userId = ajaxData.userId
				}
			}
		})
		//拿到原始数据
		originalConfig = $.extend(true, {}, userConfig);
		//从本地获取用户配置后做修改
		alterConfig(userConfig);
		// console.log(userConfig);
		//验证配置文件
		if (debugerMode) {
			var isValid = validUserConfig(userConfig);
			if (isValid == false) {
				return false;
			}
		}
		//设置默认值
		config = setDefault(userConfig);
		if (nsUI.quicktyping.baseData) {
			config.data = nsUI.quicktyping.baseData[userConfig.dataID];
		}
		config.values = {};
		setTableDefault();//判断是否存在table表格类型的操作数据
		initContainer(); //初始化容器
		console.log(config);
	}
	function setTableDefault() {
		for (var typeI = 0; typeI < config.inputOrder.length; typeI++) {
			if (config[config.inputOrder[typeI]].type == 'table') {
				//如果当前操作类型有table表格
				initTablePanel(config.inputOrder[typeI]);//初始化表格配置属性值
			}
		}
	}

	//初始化容器
	function initContainer() {
		if (config.isDialog == true) {
			var htmlStr = '<div class="quicktyping-dialog" id="' + config.dataID + '-container">'
				+ '<div class="quicktyping-title">'
				+ '<label>' + config.isTitle + '</label>'
				+ '<a class="quicktyping-close-btn" href="javascript:void(0);">x</a>'
				+ '</div>'
				+ '<div class="panel panel-default panel-form">'
				+ '<div class="panel-body"></div>'
				+ '</div>'
				+ '</div>';
			$('body').append(htmlStr);
			config.container = '#' + config.dataID + '-container .panel-body';
		}
		config.$container = $(config.container);
		if (debugerMode) {
			if (config.$container.length != 1) {
				console.error(language.ui.nsuiquicktyping.initContainerA + config.id + language.ui.nsuiquicktyping.initContainerB + config.$container.length + language.ui.nsuiquicktyping.initContainerC);
				return false;
			}
		}
		var html = '';
		html = getBaseHtml();
		config.$container.html(html);
		config.$component = config.$container.find('#' + config.id);
		config.$input = config.$container.find('#' + config.inputID);
		config.$tags = config.$container.find('.tags-container');
		config.originalSearchValue = '';  //原始值
		$('#' + config.dataID + ' .quicktyping-title .quicktyping-close-btn').on('click', function (ev) {
			$(this).parent().parent().remove();
		})
		initInput();
		getConfigMode();
	}
	//输出基本HTML
	function getBaseHtml() {
		var html = '';
		config.inputID = config.id + "-input";
		var widthStyle = 'style="width:' + config.inputWidth + 'px;"';
		//用户自定义按钮
		var btnHtml = '';
		config.userDefined && typeof (config.project) == 'object' ? btnHtml = '<div style="position:relative;border:0;" class="input-group-addon"><a style="position:relative;" href="javascript:void(0);"><i class="fa fa-cog"></i></a></div>' : "";
		html = '<div id="' + config.id + '" class="nsui-quicktyping">'
			+ '<label class="label-title">' + config.label + '</label>'
			+ '<div class="input" ' + widthStyle + '>'
			+ '<div class="input-group">'
			+ '<input type="text" class="input-main" name="' + config.inputID + '" id="' + config.inputID + '" ' + widthStyle + '>'
			+ btnHtml
			+ '</div>'
			+ '<div class="tags-container"></div>'
			+ '</di>'
			+ '</div>';
		return html;
	}

	var searchType = '';  //当前操作类型 table(表格), select(下拉)， date(日期),number(数值类型)
	var currentData = ''; //当前操作数据 
	//初始化文本框
	function initInput() {
		searchType = config[config.inputOrder[0]].type;			//默认读取的操作类型为第一个，从inputOrder数组第一个取
		currentData = config.inputOrder[0];						//默认操作数据为第一个，从inputOrder数组第一个取
		if (baseData.totalAjax != baseData.completeAjax) {
			config.$component.addClass('loading');
			baseData.completeCallback = function () {
				config.$component.removeClass('loading');
				//读取表格数据
				config.$input.off('focus');
				config.$input.on('focus', inputFocusHandler);
			}
		} else {
			config.$input.off('focus');
			config.$input.on('focus', inputFocusHandler);
		}
	}

	/* 20180911 lxh 快速录入组件 可自定义配置 begin*/
	function alterConfig(userConfig) {
		if (localStorage.getItem(userConfig.id)) {
			localConfig = JSON.parse(localStorage.getItem(userConfig.id));
		} else if (localStorage.getItem(userConfig.uid)) {
			localConfig = JSON.parse(localStorage.getItem(userConfig.uid));
		}
		if ($.isEmptyObject(localConfig)) return;
		for (var key in userConfig) {
			if (userConfig.hasOwnProperty(key)) {
				var element = userConfig[key];
				if ($.type(element.type) && element.type == 'table') {
					// table的配置
					$.each(localConfig, function (index, it) {
						$.each(element.projectField, function (index, item) {
							if (it.title == item.title) {//如果名字可以对上，则修改
								it.width ? item.width = Number(it.width) : "";//更改列宽
								it.isShow == '0' ? item['hidden'] = true : item['hidden'] = false; //删除不显示项
								it.isSearch != '0' ? item.search = true : item.search = false;//更改检索值
								// it.tabPosition == "" ? "" : item.tabPosition = Number(it.tabPosition);//更改tab页
								it.isBefore == '1' ? item.tabPosition = 'before' : (item.tabPosition == 'before' ? item.tabPosition = 0 : "");//更改靠前排列值
								it.isAfter == '1' ? item.tabPosition = 'after' : (item.tabPosition == 'after' ? item.tabPosition = 1 : "");//更改靠后排列值
								it.isDefaultOn == '1' ? item.default = true : item.default = false;
								if (it.tabIndex != index) {
									element.projectField.splice(index, 1, element.projectField.splice(it.tabIndex, 1, item)[0]);
								}
							}
						})
					})
				}
			}
		}
	}//拿到本地用户配置进行修改
	function getConfigMode() {
		config.$input.siblings('.input-group-addon').on('click', function () {
			var configMode = [];//配置项目
			var displayConfig = [];//显示项目
			// table的配置
			if (typeof (config.project) == 'object') {
				$.each(config.project.projectField, function (index, item) {
					configMode.push($.extend(true, {}, item));
					displayConfig.push($.extend(true, {}, item));
				});
				dialogShow(function () { showEditConfig(configMode) });
			}
		});
	}//点击按钮弹出框 并获取修改配置参数
	function getTableConfig(config) {
		//克隆配置文件
		var commonConfig = [];//普通commonConfig
		var beforeConfig = [];//带有before的数组
		var afterConfig = [];//带有after的数组
		var tableConfig = [];//总的数组
		$.each(config, function (index, item) {
			if ($.type(item.title) == 'undefined') { return }
			var currentItem = {};
			// var element = tableConfig[index] = {};
			currentItem.field = item.key || item.field;
			currentItem.title = item.title || item.title;
			currentItem.width = item.width || item.width;
			currentItem.isShow = item.isShow || (item.hidden ? "0" : "1");
			currentItem.tabIndex = index;
			currentItem.isDefaultOn = item.isDefaultOn || (item.default ? "1" : "0");
			//改变tab页
			// currentItem['tabPosition'] = $.type(item.tabPosition) == 'number' ? item.tabPosition : "";
			if (item.search || item.isSearch == "1") {
				currentItem.isSearch = "1";
			} else {
				currentItem.isSearch = "0";
			}
			if (item.tabPosition == 'before' || item.isBefore == "1") {
				currentItem.isBefore = "1";
				beforeConfig.push(currentItem);
			} else if (item.tabPosition == 'after' || item.isAfter == "1") {
				currentItem.isAfter = "1";
				afterConfig.push(currentItem);
			} else {
				commonConfig.push(currentItem);
			}
		});
		initTabIndex(beforeConfig);
		initTabIndex(commonConfig, beforeConfig.length);
		initTabIndex(afterConfig, beforeConfig.length + commonConfig.length);
		tableConfig = beforeConfig.concat(commonConfig.concat(afterConfig));
		// console.log(tableConfig);
		return tableConfig;
	}//格式化配置参数，并获得dataSource
	function initTabIndex(arr, ModeLen) {
		$.each(arr, function (index, item) {
			if (item.isBefore == '1') {
				item['tabIndex'] = index;
			} else {
				item['tabIndex'] = index + ModeLen;
			}
		})
	}//添加tabIndex
	function showEditConfig(configMode, callback) {
		var tableID = 'quicktyping-config-table';
		var dataConfig = {
			tableID: tableID,
			dataSource: getTableConfig(configMode),
			isPage: false,
			isSearch: false,
			info: false,
			isLengthChange: false
		};
		var columnConfig = [
			{
				field: "isShow",
				title: "本列是否显示",
				width: 80,
				formatHandler: {
					type: 'checkbox',
					data:
						[
							{
								textField: 'name',
								valueField: 'id',
								handler: function (data, state, value) { },
								checkedFlag: '1',
								uncheckedFlag: '0',
								isDisabledFlage: 'state',
								value: '0',
							}
						]
				}
			}, {
				field: "isSearch",
				title: "本列是否可检索",
				width: 80,
				formatHandler: {
					type: 'checkbox',
					data:
						[
							{
								textField: 'name',
								valueField: 'id',
								handler: function (data, state, value) { },
								checkedFlag: '1',
								uncheckedFlag: '0',
								isDisabledFlage: 'state',
								value: '0',
							}
						]
				}
			}, {
				field: "isBefore",
				title: "本列是否固定在前",
				width: 80,
				formatHandler: {
					type: 'checkbox',
					data:
						[
							{
								textField: 'name',
								valueField: 'id',
								handler: function (data, state, value) {
									data.isAfter = 0;
									//刷新表格
									var tabCofnig = baseDataTable.allTableData(dataConfig.tableID);
									baseDataTable.originalConfig[tableID].dataConfig.dataSource = getTableConfig(tabCofnig);
									baseDataTable.refreshByID(tableID);
									addDropEvent(tableID, getTableConfig(tabCofnig));
								},
								checkedFlag: '1',
								uncheckedFlag: '0',
								isDisabledFlage: 'state',
								value: '0',
							}
						]
				}
			}, {
				field: "isAfter",
				title: "本列是否固定在后",
				width: 80,
				formatHandler: {
					type: 'checkbox',
					data:
						[
							{
								textField: 'name',
								valueField: 'id',
								handler: function (data, state, value) {
									data.isBefore = 0;
									//刷新表格
									var tabCofnig = baseDataTable.allTableData(dataConfig.tableID);
									baseDataTable.originalConfig[tableID].dataConfig.dataSource = getTableConfig(tabCofnig);
									baseDataTable.refreshByID(tableID);
									addDropEvent(tableID, getTableConfig(tabCofnig));
								},
								checkedFlag: '1',
								uncheckedFlag: '0',
								isDisabledFlage: 'state',
								value: '0',
							}
						]
				}
			}, {
				field: "isDefaultOn",
				title: "本列是否默认上屏",
				width: 80,
				formatHandler: {
					type: 'checkbox',
					data:
						[
							{
								textField: 'name',
								valueField: 'id',
								handler: function (data, state, value) { },
								checkedFlag: '1',
								uncheckedFlag: '0',
								isDisabledFlage: 'state',
								value: '0',
							}
						]
				}
			}, {
				field: "title",
				title: "列名"
			},/* {
				field:"tabPosition",
				title:"改变tab页",
				width:80,
				formatHandler: function (value, rowData, meta) {
					var returnHtml = '';
					// 是否显示输入框
					if (rowData.isBefore != '1' && rowData.isAfter != '1') {
						returnHtml = '<input class="ns-table-input form-control" value="' + value + '"></input>';
					} else {
						returnHtml = '<span>固定列</span>';
					}
					return returnHtml;
				}
			}, */{
				field: "width",
				title: "列宽",
				width: 100,
				formatHandler: {
					type: 'input',
					data:
						[
							{
								handler: function (obj) { }
							}
						]
				}
			}, {
				field: "button",
				title: "拖拽改变顺序",
				width: 80,
				formatHandler: {
					type: "button",
					data: {
						subdata: [
							{
								拖拽: function (a, b, c, d, e) {
								}
							}
						]
					}
				}
			}
		];
		var uiConfig = {
			pageLengthMenu: ['all'], //可选页面数  auto是自动计算  all是全部
			isSingleSelect: false,
			isMultiSelect: false
		};
		baseDataTable.init(dataConfig, columnConfig, uiConfig);
		//更改tab页
		/* $('#' + dataConfig.tableID + ' .ns-table-input').on('change', function(){
			var $dom = $(this);
			var originalValue = $.trim($dom.val());
			var cTr = $dom.closest('tr');
			var cTableID = $dom.closest('table').attr('id');
			var cRow = baseDataTable.table[cTableID].row(cTr);
			var rowData = cRow.data();
			// 修改行数据
			if (rowData.tabPosition != originalValue) {
				rowData.tabPosition = originalValue;
			}
		}); */
		//拖拽事件
		addDropEvent(tableID, getTableConfig(configMode));
		//保存事件
		var dialogId = config.id + "config-dialog";
		var $save = $('#saveConfig');
		var $clearConfig = $("#clearConfig");
		$save.on('click', function () {
			var tableConfig = JSON.stringify(baseDataTable.allTableData(dataConfig.tableID));
			if ($.type(config.uid) != 'undefined') {
				localStorage.setItem(config.uid, tableConfig);
			} else if ($.type(config.id) != 'undefined') {
				localStorage.setItem(config.id, tableConfig);
			}
			init(originalConfig);
			$('#' + dialogId).modal('hide');
		});//保存配置
		$clearConfig.on('click', function () {
			localStorage.removeItem(config.uid);
			localStorage.removeItem(config.id);
			localConfig = {};
			init(originalConfig);
			$('#' + dialogId).modal('hide');
		});
	}//修改配置弹窗，为防止重名，起的比较怪
	function dialogShow(callback) {
		var dialogId = config.id + "config-dialog";
		var dialogTitle = config.label + "参数配置";
		var modal = '<div id="' + dialogId + '" class="modal fade bs-example-modal-lg in" role="dialog" aria-hidden="true" aria-labelledby="' + dialogId + '">'
			+ '<div class="modal-dialog uimodal" style="width:1000px">'
			+ '</div>'
			+ '</div>';
		// 如果没有模态框就添加，有则跳过
		if (typeof ($("body").find($("#" + dialogId))[0]) == "undefined") {
			$("body").append(modal);
		}
		// 显示模态框
		$('#' + dialogId).modal('show');
		// 模态框的通用代码
		var $modalContent = $('<div class="modal-content"></div>');
		var titleHtml = '<div class="modal-header">'
			+ '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'
			+ '<h4 class="modal-title">' + dialogTitle + '</h4>'
			+ '</div>';
		var bodyHtml = '<div class="modal-body"></div>';
		var footerHtml =
			'<div class="modal-footer">'
			+ '<button type="button" class="btn btn-default" id="saveConfig" style="display: inline-block;">'
			+ '保存个人配置'
			+ '<button type="button" class="btn btn-default" id="clearConfig" style="display: inline-block;">'
			+ '清除个人配置'
			+ '<button type="button" class="btn btn-default" data-dismiss="modal" id="calcel" style="display: inline-block;">'
			+ '取消'
			+ '</button>'
			+ '</button>'
			+ '</div >';
		this.$bodyContent = $('.modal-body-content');
		$modalContent.append(titleHtml);
		$modalContent.append(bodyHtml);
		$modalContent.append(footerHtml);
		var $dialogBody = $modalContent.find(".modal-body");
		$dialogBody.append('<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped table-sm" id="quicktyping-config-table"></table>');
		$('#' + dialogId).find('.modal-dialog').empty();
		$('#' + dialogId).find('.modal-dialog').append($modalContent);
		callback && callback();
	}//弹框显示
	function addDropEvent(tableID, tableConfig) {
		$.each($('#quicktyping-config-table').find('button'), function (index, item) {
			item['index'] = index;
			$(item).on('mousedown', function (mde) {
				var $currentBtn = $($('#quicktyping-config-table').find('button').get(this.index));
				//拿到当前行位置
				var currentIndex = baseDataTable.table[tableID].row($currentBtn.closest('tr')).data().tabIndex;
				//鼠标位置
				var moveY;
				var mdy = mde.clientY;
				var $currentTr = $(mde.target).parents('tr');
				var $moveDiv = $('<div></div>');
				$moveDiv.css('height', $currentTr.css('height'));
				$moveDiv.css('width', $currentTr.css('width'));
				$moveDiv.css('border', "1px dashed #000");
				$moveDiv.css('position', "absolute");
				$moveDiv.css('cursor', "move");
				$moveDiv.css('top', $currentTr.get(0).offsetTop + "px");
				$('#quicktyping-config-table').append($moveDiv)
				$(document).on('mousemove', function (mme) {
					moveY = mme.clientY - mdy;
					$moveDiv.css('top', $currentTr.get(0).offsetTop + moveY + "px");
				})
				$moveDiv.on('mouseup', function () {
					// console.log(parseInt($currentTr.css('height')));
					var step = Math.round(moveY / parseInt($currentTr.css('height')));
					var moveToIndex = currentIndex + step;
					if (moveToIndex < 0 || moveToIndex >= tableConfig.length) {
						$moveDiv.off('mousemove');
						$moveDiv.remove();
						return;
					}
					// console.log('从 '+ currentIndex +'移动到 ' + moveToIndex);
					//行换行 且 只有在两者都没有 isAfter 或 isBefore 属性时才可移动
					if ((tableConfig[currentIndex].isBefore != '1' && tableConfig[currentIndex].isAfter != '1') && (tableConfig[moveToIndex].isBefore == '1' || tableConfig[moveToIndex].isAfter == '1')) {//如果移动列没有固定列属性，移动到列有固定列属性，则给移动列属性添加固定列属性且附index
						tableConfig[moveToIndex].isBefore == '1' ? tableConfig[currentIndex]['isBefore'] = '1' : tableConfig[currentIndex]['isAfter'] = '1';
						//如果是固定前列 整体往后移动
						if (tableConfig[currentIndex].isBefore == '1') {
							for (var i = moveToIndex + 1; i < currentIndex; i++) {
								tableConfig[i].tabIndex = i + 1;
							}
						}
						//如果是固定后列 整体往前移动
						if (tableConfig[currentIndex].isAfter == '1') {
							for (var i = moveToIndex - 1; i < currentIndex; i--) {
								tableConfig[i].tabIndex = i - 1;
							}
						}

					} else if ((tableConfig[currentIndex].isBefore == '1' || tableConfig[currentIndex].isAfter == '1') && (tableConfig[moveToIndex].isBefore != '1' && tableConfig[moveToIndex].isAfter != '1')) { //当移动的是固定列，则将固定列移动处固定列以上全部改为固定列
						//如果是固定前列 整体往后移动
						if (tableConfig[currentIndex].isBefore == '1') {
							for (var i = currentIndex + 1; i <= moveToIndex; i++) {
								tableConfig[i]['isBefore'] = '1';
							}
							//交换行
							tableConfig.splice(currentIndex, 1, tableConfig.splice(moveToIndex, 1, tableConfig[currentIndex])[0]);
						}
						//如果是固定前列 整体往后移动
						if (tableConfig[currentIndex].isAfter == '1') { //整体往前移动
							for (var i = currentIndex - 1; i >= moveToIndex; i--) {
								tableConfig[i]['isAfter'] = '1';
							}
							//交换行
							tableConfig.splice(currentIndex, 1, tableConfig.splice(moveToIndex, 1, tableConfig[currentIndex])[0]);
						}
					} else { //如果两个都有固定列 或 两个都没有固定列属性，则直接进行交换行
						tableConfig.splice(currentIndex, 1, tableConfig.splice(moveToIndex, 1, tableConfig[currentIndex])[0]);
					}
					//刷新表格
					baseDataTable.originalConfig[tableID].dataConfig.dataSource = getTableConfig(tableConfig);
					baseDataTable.refreshByID(tableID);
					//重新绑定事件
					addDropEvent(tableID, getTableConfig(tableConfig));
					//移除虚线框
					$moveDiv.off('mousemove');
					$moveDiv.remove();
				})
			})
		})
	}//拖拽改变顺序
	/* 20180911 lxh 快速录入组件 可自定义配置 end*/

	//判断输入内容决定操作类型
	function inputFocusHandler(event) {
		config.isClickOut = false;
		showEmptyResultPanel(currentData);
		$(document).off('mousedown', documentMousedownHandler);
		$(document).on('mousedown', documentMousedownHandler);
		config.$input.off('keyup')
		config.$input.on('keyup', function (ev) {
			var isContinue = true;
			//回调函数
			if (typeof (config.beforeHandler) == 'function') {
				isContinue = config.beforeHandler();
			}
			if (isContinue) {
				switch (ev.keyCode) {
					// case 32:
					// 	//空格
					// 	break;
					case 13:
						//回车
						confirmCurrentRow();
						break;
					case 40:
						//下
						changeSelectRow('next');
						break;
					case 38:
						//上
						changeSelectRow('prev');
						break;
					default:
						//正常输入文字
						var searchValue = config.$input.val();
						inputSearch(searchValue, ev.keyCode);
						break;
				};
			}
		});
		//失去焦点且点击位置在外边则清空
		config.$input.off('blur')
		config.$input.on('blur', function (ev) {
			if (config.isClickOut == true) {
				clearInput();
			}
		})

	}
	//复位输入组件状态
	function clearInput() {
		//config.$input.val('');
		config.$input.off('blur');
		config.$input.off('keyup');
		$(document).off('mousedown', documentMousedownHandler);
		inputValue = '';
		refreshInput();
	}
	//窗体点击事件
	function documentMousedownHandler(event) {
		//是否点击的无关位置
		var dragel = config.$input.closest('.nsui-quicktyping').children('div.input');
		var target = event.target;
		var isClickOut = false;
		if (dragel[0] != target && !$.contains(dragel[0], target)) {
			isClickOut = true;
		}
		config.isClickOut = isClickOut;
	}

	//输入动作判断，空对象则搜索项目
	function inputSearch(searchValue, keyCode) {
		var trimSearchValue = $.trim(searchValue);
		//如果是空或者未发生变化则不搜索，如果发生变化，则保存的值searchValue
		if (trimSearchValue == '') {
			//忽略空
			//如果是空，且仍然在点删除 keycode:8
			if (keyCode == 8 && config.originalSearchValue == '') {
				removeValues();
			}
			/***lxh 2018/9/27修改 begin***/
			//如果为键码为删除，且值为空，则重新初始化输入框
			/* if(keyCode==8 && config.originalSearchValue == ''){
				removeValues();
				refreshInput();
				setFocus();
			} */
			/***lxh 2018/9/27修改 end***/
			inputValue = '';
			config.originalSearchValue = '';
			return false;
		} else if (trimSearchValue == inputValue) {
			//忽略相等
			// if(keyCode==8){
			// 	removeValues();
			// }
			return false;
		} else {
			//有意义的值
			inputValue = searchValue;
			config.originalSearchValue = searchValue;
		}
		//判断搜索类型
		switch (searchType) {
			case 'table':
				var resultArr = tableSearch(searchValue);
				showResultPanel(resultArr);
				break;
			case 'select':
				//下拉框的数据来源可能来自于baseData,也可能来自于config
				var selectDataArray;
				if (baseData[currentData]) {
					selectDataArray = baseData[currentData].data;
				} else if (config[currentData]) {
					selectDataArray = config[currentData].data;
				} else {
					console.error('无法找到下拉框数据:' + currentData);
					return;
				}
				showResultPanel(selectDataArray);
				selectSearch(searchValue);
				break;
			case 'date':
				break;
		}
	}
	//搜索下拉列表符合项
	function selectSearch(searchValue) {
		var selectData = baseData[currentData].data;
		var searchResultArr = [];
		for (var selectI = 0; selectI < selectData.length; selectI++) {
			var isResult = false;
			var searchReg = new RegExp(searchValue, 'i');
			for (key in selectData[selectI]) {
				var value = selectData[selectI][key];
				if (typeof (value) == 'string') {
					var indexNum = value.search(searchReg);
					if (indexNum >= 0) {
						isResult = true;
					}
				}
			}
			if (isResult) {
				searchResultArr.push(selectI);
			}
		}
		var selectIndex = 0;
		if (searchResultArr.length >= 1) {
			//只有是1的时候才是分辨出来,如果大于1则先选中第一个
			selectIndex = searchResultArr[0];
			var $selectLi = $(config.container).find('.result-panel.select ul li').eq(selectIndex);
			if ($selectLi.hasClass('current')) {
				//就不用动了
			} else {
				$(config.container).find('.result-panel.select ul li').removeClass('current');
				$selectLi.addClass('current');
			}
		} else if (searchResultArr.length == 0) {
			//都不符合
			$(config.container).find('.result-panel.select ul li').removeClass('current');
		}
	}
	function getTableData(currentData) {
		var projectLength = config.data[currentData].data.length;
		var resultArr = [];
		for (var projectI = 0; projectI < projectLength; projectI++) {
			var cProject = config.data[currentData].data[projectI];
			resultArr.push(cProject);
			if (resultArr.length >= config[currentData].projectTableRowNumber) {
				projectI = projectLength;
			}
		}
		return resultArr;
	}
	//搜索table表格符合项
	function tableSearch(searchValue) {
		var resultArr = [];
		var fieldNum = config[currentData].projectSearchField.length;
		var projectLength = config.data[currentData].data.length;
		var isSingleConditions = (searchValue.indexOf(' ') == -1);  //是否包含空格，如果有则视为多条件搜索
		if (isSingleConditions) {
			//单条件搜索
			var searchReg = new RegExp(searchValue, 'i');
			for (var projectI = 0; projectI < projectLength; projectI++) {
				var cProject = config.data[currentData].data[projectI];
				var isResult = false;
				for (var fieldI = 0; fieldI < fieldNum; fieldI++) {
					var fieldValue = cProject[config[currentData].projectSearchField[fieldI]];
					// lyw 20180523 判断 fieldValue 的类型 
					// 数字转为字符串
					// undefined转为‘’
					// string如果是字典时 转换为表格显示的内容进行搜索
					switch (typeof (fieldValue)) {
						case 'number':
							fieldValue = fieldValue.toString();
							break;
						case 'undefined':
							fieldValue = '';
							break;
						case 'string':
							// fieldValue设置的参数 对象 和 参数 名称
							var fieldValueSetParameterObj = config[currentData].projectFieldObj;
							var fieldValueSetParameterName = config[currentData].projectSearchField[fieldI];
							//判断是否 判断 了 字典是否存在 没有判断 开始判断
							if (!fieldValueSetParameterObj[fieldValueSetParameterName].isExeDict) {
								dictValidate(fieldValueSetParameterObj[fieldValueSetParameterName]);
							}
							// 判断了字典存在 
							// 判断该字段的字典是否存在
							if (fieldValueSetParameterObj[fieldValueSetParameterName].isHaveDict) {
								var dictData = nsVals.dictData[fieldValueSetParameterObj[fieldValueSetParameterName].dictName].jsondata;
								if (typeof (dictData[fieldValue]) == "string") {
									fieldValue = dictData[fieldValue];
								} else {
									fieldValue = '';
								}
							}
							break;
					}
					var indexNum = fieldValue.search(searchReg);
					if (indexNum >= 0) {
						isResult = true;
					}
				}
				if (isResult) {
					resultArr.push(cProject);
				}
				if (resultArr.length >= config[currentData].projectTableRowNumber) {
					projectI = projectLength;
				}
			}
		} else {
			//多条件搜索 start ------
			var searchValueArr = searchValue.split(' ');
			if (config[currentData].projectSearchType == 'order') {
				//顺序多条件搜索
				var tempResultArr = [];
				var searchReg = new RegExp(searchValueArr[0], 'i');
				var currentFieldIndex = 0;
				//先搜第一列
				for (var projectI = 0; projectI < projectLength; projectI++) {
					var cProject = config.data[currentData].data[projectI];
					var fieldValue = cProject[config[currentData].projectSearchField[0]];
					var indexNum = fieldValue.search(searchReg);
					if (indexNum >= 0) {
						tempResultArr.push(cProject);
					}
				}
				if (tempResultArr.length == 0) {
					//如果第一个关键字都没有搜索结果，那就直接返回了 resultArr = [];
					return resultArr;
				} else {
					for (var valueI = 1; valueI < searchValueArr.length; valueI++) {
						//挨个项目搜索
						if (searchValueArr[valueI] != '') {
							var tempSearchReg = new RegExp(searchValueArr[valueI], 'i');
							for (var tempProjectI = 0; tempProjectI < tempResultArr.length; tempProjectI++) {
								if (tempResultArr[tempProjectI] != false) {
									var tempFieldValue = tempResultArr[tempProjectI][config[currentData].projectSearchField[valueI]];
									var tempIndexNum = tempFieldValue.search(tempSearchReg);
									if (tempIndexNum == -1) {
										tempResultArr[tempProjectI] = false;  //用false替代内容
									}
								}
							}
						}
					}
					//过滤掉所有的false
					for (var tempProjectI2 = 0; tempProjectI2 < tempResultArr.length; tempProjectI2++) {
						if (tempResultArr[tempProjectI2] != false) {
							resultArr.push(tempResultArr[tempProjectI2]);
						}
						if (resultArr.length >= config[currentData].projectTableRowNumber) {
							tempProjectI2 = tempResultArr.length;
						}
					}
				}
				//顺序多条件搜索 end ------
			} else if (config[currentData].projectSearchType == 'disorder') {
				//乱序多条件搜索
				var searchReg = new RegExp(searchValueArr[0], 'i');
				var tempResultArr = [];
				for (var projectI = 0; projectI < projectLength; projectI++) {
					var cProject = config.data[currentData].data[projectI];
					var isResult = false;
					for (var fieldI = 0; fieldI < fieldNum; fieldI++) {
						var fieldValue = cProject[config[currentData].projectSearchField[fieldI]];
						var indexNum = fieldValue.search(searchReg);
						if (indexNum >= 0) {
							isResult = true;
						}
					}
					if (isResult) {
						tempResultArr.push(cProject);
					}
				}
				if (tempResultArr.length == 0) {
					//如果第一个关键字都没有搜索结果，那就直接返回了 resultArr = [];
					return resultArr;
				} else {
					//开始其它关键字搜索
					for (var searchI = 1; searchI < searchValueArr.length; searchI++) {
						var searchReg = new RegExp(searchValueArr[searchI], 'i');
						for (var tempProjectI = 0; tempProjectI < tempResultArr.length; tempProjectI++) {
							if (tempResultArr[tempProjectI] != false) {
								var cProject = tempResultArr[tempProjectI];
								var isResult = false;
								for (var fieldI = 0; fieldI < fieldNum; fieldI++) {
									var fieldValue = cProject[config[currentData].projectSearchField[fieldI]];
									var indexNum = fieldValue.search(searchReg);
									if (indexNum >= 0) {
										isResult = true;
									}
								}
								if (isResult == false) {
									tempResultArr[tempProjectI] = false;
								}
							}
						}
					}
				}
				for (var resultI = 0; resultI < tempResultArr.length; resultI++) {
					if (tempResultArr[resultI] != false) {
						resultArr.push(tempResultArr[resultI]);
					}
					if (resultArr.length >= config[currentData].projectTableRowNumber) {
						resultI = tempResultArr.length;
					}
				}
				//乱序多条件搜索 end ------
			}
		}
		return resultArr;
	}
	//输出结果选择
	function showResultPanel(resultArr) {
		if (resultArr.length == 0) {
			showEmptyResultPanel('empty');
		} else {
			switch (searchType) {
				case 'table':
					showTableResultPanel(resultArr);
					break;
				case 'select':
					showSelectResultPanle(resultArr);
					break;
			}
		}
	}
	//没有结果的面板
	function showEmptyResultPanel(messageType) {
		var resultPanel = config.$component.find('.input .result-panel');
		if (resultPanel.length == 0) {
			//没有结果面板
		} else {
			//有结果面板则删了
			resultPanel.remove();
		}
		var html = '<div class="result-panel empty">'
			+ config.message[messageType]
			+ '</div>';
		config.$input.after(html);
	}
	//显示表格的面板
	function showTableResultPanel(resultArr) {
		var resultPanel = config.$component.find('.input .result-panel');
		if (resultPanel.length > 0) {
			resultPanel.find('tr').off('click');
			resultPanel.remove();
		}
		if (config[currentData].isUseTabs) {
			//开启了tab列
			var ulHtml = '';
			for (var groupI = 0; groupI < config[currentData].tabsName.length; groupI++) {
				var activeClassStr = '';
				if (groupI === config[currentData].tabsDefaultIndex) {
					activeClassStr = ' active';
				}
				ulHtml += '<a href="javascript:void(0);" class="nstable-plus-panel-tabs-tab' + activeClassStr + '" ns-tabindex="' + groupI + '">'
					+ config[currentData].tabsName[groupI]
					+ '</a>';
			}
			var tabID = config.id + '-useTabs';
			var tableID = config.id + '-table';
			var styleStr = config[currentData].panelStyle.substring(config[currentData].panelStyle.indexOf('=') + 1, config[currentData].panelStyle.length - 1);
			var leftStr = 'left:' + config.tagsWidth + 'px;"';
			styleStr = 'style=' + styleStr + leftStr;
			var tabHtml = '<div class="result-panel list" ' + styleStr + '>'
				+ '<table ' + config[currentData].tableClassStyle + ' id="' + tableID + '">'
				+ '</table>'
				+ '<div class="nstable-plus-panel">'
				+ '<div class="nstable-plus-panel-tabs" id="' + tabID + '">'
				+ ulHtml
				+ '</div>'
				+ '</div>'
				+ '</div>';
			config.$input.after(tabHtml);
			var $quickTab = $('#' + tabID);
			var $quickTableID = $('#' + tableID);
			$quickTab.children('a').on('click', function (ev) {
				var $this = $(this);
				var activeIndex = $this.attr('ns-tabindex');
				$this.addClass('active');
				$this.siblings().removeClass('active');
				changeTab(tableID, activeIndex);
			})
			changeTab(tableID, config[currentData].tabsDefaultIndex);
			function changeTab(tableID, tabIndex) {
				var tabArr = [];
				tabArr = tabArr.concat(config[currentData].tabsColumn.before, config[currentData].tabsColumn.tabGroup[tabIndex], config[currentData].tabsColumn.after);
				var theadHtml = '';
				var titleField = [];
				for (var titleI = 0; titleI < tabArr.length; titleI++) {
					if ((typeof (!tabArr[titleI].hidden) != 'undefined' && !tabArr[titleI].hidden) || typeof (!tabArr[titleI].hidden) == 'undefined') {//隐藏列 如果没有hidden属性，则不隐藏，如果有hidden属性且为 true ，则隐藏该列不显示
						titleField.push(tabArr[titleI].key);
						if (typeof (tabArr[titleI].width) != 'number') {
							theadHtml += '<th>' + tabArr[titleI].title + '</th>';
						} else {
							theadHtml += '<th style="width:' + tabArr[titleI].width + 'px;">' + tabArr[titleI].title + '</th>';
						}
					}
				}
				theadHtml = '<thead><tr>' + theadHtml + '</tr></thead>';
				var tbodyHtml = '';
				for (resultI = 0; resultI < resultArr.length; resultI++) {
					var trHtml = '';
					for (var tdI = 0; tdI < titleField.length; tdI++) {
						// trHtml += '<td>'+resultArr[resultI][titleField[tdI]]+'</td>';
						//lyw 20180521
						var tdValue = resultArr[resultI][titleField[tdI]];
						switch (typeof (tdValue)) {
							case 'undefined':
								tdValue = '';
								break;
							case 'number':
								tdValue = tdValue.toString();
								break;
							case 'string':
								if (!config[currentData].projectFieldObj[titleField[tdI]].isExeDict) {
									dictValidate(config[currentData].projectFieldObj[titleField[tdI]]);
								}
								if (config[currentData].projectFieldObj[titleField[tdI]].isHaveDict) {
									var dictData = nsVals.dictData[config[currentData].projectFieldObj[titleField[tdI]].dictName].jsondata;
									if (typeof (dictData[tdValue]) == "string") {
										tdValue = dictData[tdValue];
									} else {
										tdValue = tdValue;
										nsAlert(config[currentData].projectFieldObj[titleField[tdI]].dictName + "字典中" + tdValue + "字段不存在", 'error');
									}
								}
								break;
							default:
								break;
						}
						//formatHandler
						if (typeof (config[currentData].projectFieldObj[titleField[tdI]].formatHandler) == 'object') {
							var customFormatData = config[currentData].projectFieldObj[titleField[tdI]].formatHandler;
							switch (customFormatData.type) {
								case 'replaceString':
									tdValue = customFormatData.data[resultArr[resultI][titleField[tdI]]];
									typeof (tdValue) == 'undefined' ? tdValue = "" : "";
									break;
								case 'date':
									//如果时间格式不对，或者没有时间。则显示为空，且报错
									var dateValue = moment(Number(resultArr[resultI][titleField[tdI]])).format(customFormatData.data.formatDate);
									if (dateValue == 'Invalid date') {
										tdValue = "";
										console.error(resultArr[resultI], '无时间属性或时间格式不对');
									} else {
										tdValue = dateValue
									}
									break;
							}
						}
						var tdClass = '';
						switch (config[currentData].projectFieldObj[titleField[tdI]].formatType) {
							case 'money':
								tdClass = config[currentData].projectFieldObj[titleField[tdI]].formatType;
								break;
						}
						trHtml += '<td class="' + tdClass + '">' + tdValue + '</td>';
					}
					var trClass = '';
					if (resultI == 0) {
						trClass = ' class="current"';
					}
					trHtml = '<tr ns-index="' + resultArr[resultI][config[currentData].projectIndexField] + '" ns-id="' + resultArr[resultI][config[currentData].projectIdField] + '" ' + trClass + '>' + trHtml + '</tr>';
					tbodyHtml += trHtml;
				}
				$quickTableID.html(theadHtml + tbodyHtml);
				$quickTableID.find('tbody tr').on('click', function (ev) {
					var indexNumber = Number($(this).attr('ns-index'));
					//var idString = $(this).attr('ns-id');
					addProject(indexNumber);
				})
			}
		} else {
			var tabelHtml = '';
			for (resultI = 0; resultI < resultArr.length; resultI++) {
				var trHtml = '';
				for (var tdI = 0; tdI < config[currentData].tdField.length; tdI++) {
					var tdClass = '';
					switch (config[currentData].projectFieldObj[config[currentData].tdField[tdI]].formatType) {
						case 'money':
							tdClass = config[currentData].projectFieldObj[config[currentData].tdField[tdI]].formatType;
							break;
					}
					trHtml += '<td class="' + tdClass + '">' + resultArr[resultI][config[currentData].tdField[tdI]] + '</td>';
				}
				var trClass = '';
				if (resultI == 0) {
					trClass = ' class="current"';
				}
				trHtml = '<tr ns-index="' + resultArr[resultI][config[currentData].projectIndexField] + '" ns-id="' + resultArr[resultI][config[currentData].projectIdField] + '" ' + trClass + '>' + trHtml + '</tr>';
				tabelHtml += trHtml;
			}
			var styleStr = config[currentData].panelStyle.substring(config[currentData].panelStyle.indexOf('=') + 1, config[currentData].panelStyle.length - 1);
			var leftStr = 'left:' + config.tagsWidth + 'px;"';
			styleStr = 'style=' + styleStr + leftStr;
			tabelHtml = '<div class="result-panel list" ' + styleStr + '>'
				+ '<table ' + config[currentData].tableClassStyle + '>'
				+ config[currentData].theadHtml
				+ '<tbody>'
				+ tabelHtml
				+ '</tbody>'
				+ '</table>';
			+'</div>';
			config.$input.after(tabelHtml);
			config.$input.next().find('tbody tr').on('click', function (ev) {
				var indexNumber = Number($(this).attr('ns-index'));
				//var idString = $(this).attr('ns-id');
				addProject(indexNumber);
			})
		}

	}
	//判断字典是否存在
	function dictValidate(data) {
		if (debugerMode) {
			if (typeof (data.dictName) == "string") {
				if ($.isEmptyObject(nsVals.dictData)) {
					data.isExeDict = false;
				} else {
					data.isExeDict = true;
					if (typeof (nsVals.dictData[data.dictName]) == 'undefined') {
						console.error(data.dictName + "的字典不存在");
					} else {
						data.isHaveDict = true;
					}
				}

			}
		}
	}
	//表格相关配置值设置
	function initTablePanel(operatorType) {
		var defaultConfig = {
			projectTableWidth: 800,
			projectTableRowNumber: 10,
		}
		nsVals.setDefaultValues(config[operatorType], defaultConfig);
		// config[operatorType].projectTableWidth = 800;//默认宽度
		// config[operatorType].projectTableRowNumber = 10;//默认行数
		config[operatorType].projectSearchField = [];  //搜索字段数组
		config[operatorType].titleField = [];
		config[operatorType].titleWidth = [];
		config[operatorType].tdField = [];
		/************20180315 sjj 添加表格tab属性配置 start*********************/
		config[operatorType].isUseTabs = typeof (config[operatorType].isUseTabs) == 'boolean' ? config[operatorType].isUseTabs : false;//默认不适用
		//是否定义了默认读取列
		if (typeof (config[operatorType].tabsDefaultIndex) != 'number') { config[operatorType].tabsDefaultIndex = 0; }
		//tableGetTabOption(operatorType);
		/************20180315 sjj 添加表格tab属性配置 end*********************/
		var totolTableWidthNumber = 0;  //合计出来的表格宽度，必须每个td都设置了宽度
		var allSetTableWidth = true;  //是否全部设置了宽度
		var beforeTabArr = [];
		var tabsArr = [];
		var afterTabArr = [];
		config[operatorType].projectFieldObj = {};
		for (var i = 0; i < config[operatorType].projectField.length; i++) {
			//判断参数是否合法
			if (debugerMode) {
				optionsArr = [
					['key', 'string', true],
					['title', 'string'],
					['search', 'boolean'],
					['isID', 'boolean'],
					['isIndex', 'boolean'],
					['isName', 'boolean'],
					['width', 'number'],
					['dictName', 'string'],
					['formatType', 'string']
				];
				var isValid = nsDebuger.validOptions(optionsArr, config[operatorType].projectField[i]);
			}
			var projectFieldData = config[operatorType].projectField[i];
			//生成对象 lyw
			config[operatorType].projectFieldObj[projectFieldData.key] = $.extend(true, {}, config[operatorType].projectField[i]);
			var projectFieldObjData = config[operatorType].projectFieldObj[projectFieldData.key];
			//设置属性用于判断是否有有字典
			projectFieldObjData.isHaveDict = false;
			projectFieldObjData.isExeDict = false;
			//判断字典是否存在
			dictValidate(projectFieldObjData);
			//设置index;
			if (config[operatorType].projectField[i].isIndex) {
				if (typeof (config[operatorType].projectIndexField) != 'undefined') {
					console.error(language.ui.nsuiquicktyping.isIndex + config[operatorType].projectIndexField);
					console.error(config[operatorType].projectField[i]);
				}
				config[operatorType].projectIndexField = config[operatorType].projectField[i].key;
			}
			//设置id;
			if (config[operatorType].projectField[i].isID) {
				if (typeof (config[operatorType].projectIdField) != 'undefined') {
					console.error(language.ui.nsuiquicktyping.isID + config[operatorType].projectIdField);
					console.error(config[operatorType].projectField[i]);
				}
				config[operatorType].projectIdField = config[operatorType].projectField[i].key;
			}
			//设置name;
			if (config[operatorType].projectField[i].isName) {
				if (typeof (config[operatorType].projectNameField) != 'undefined') {
					console.error(language.ui.nsuiquicktyping.isName + config[operatorType].projectNameField);
					console.error(config[operatorType].projectField[i]);
				}
				config[operatorType].projectNameField = config[operatorType].projectField[i].key;
			}
			//设置search对象数组
			if (config[operatorType].projectField[i].search) {
				config[operatorType].projectSearchField.push(config[operatorType].projectField[i].key);
			}
			//设置title数组
			if (typeof (config[operatorType].projectField[i].title) == 'string') {
				config[operatorType].titleField.push(config[operatorType].projectField[i].title);
				config[operatorType].titleWidth.push(config[operatorType].projectField[i].width);
				config[operatorType].tdField.push(config[operatorType].projectField[i].key);
			}
			//计算宽度
			if (typeof (config[operatorType].projectField[i].width) == 'number') {
				totolTableWidthNumber += config[operatorType].projectField[i].width;
			} else {
				allSetTableWidth = false;
			}
			switch (config[operatorType].projectField[i].tabPosition) {
				case 'before':
					//设置了前置固定列
					beforeTabArr.push(config[operatorType].projectField[i]);
					break;
				case 'after':
					//设置了后置固定列
					afterTabArr.push(config[operatorType].projectField[i]);
					break;
				default:
					tabsArr.push(config[operatorType].projectField[i]);
					break;
			}
		}
		var tabsGroup = [];
		for (var groupI = 0; groupI < config[operatorType].tabsName.length; groupI++) {
			tabsGroup[groupI] = [];
			for (var tabI = 0; tabI < tabsArr.length; tabI++) {
				if (tabsArr[tabI].tabPosition === groupI) {
					tabsGroup[groupI].push(tabsArr[tabI]);
				}
			}
		}
		config[operatorType].tabsColumn = {
			before: beforeTabArr,
			tabs: tabsArr,
			tabGroup: tabsGroup,
			after: afterTabArr,
		};
		//如果全都设置了，则改变projectTableWidth
		if (allSetTableWidth) {
			if (debugerMode) {
				if (typeof (config[operatorType].projectTableWidth) != 'undefined') {
					if (config[operatorType].projectTableWidth != totolTableWidthNumber) {
						console.info(language.ui.nsuiquicktyping.consoleinfoA + config[operatorType].projectTableWidth + language.ui.nsuiquicktyping.consoleinfoB + totolTableWidthNumber);
					}
				}
			}
			config[operatorType].projectTableWidth = totolTableWidthNumber;
		}
		//总体结果是否合法
		if (debugerMode) {
			if (config[operatorType].projectSearchField.length == 0) {
				console.error(language.ui.nsuiquicktyping.projectSearchField);
			}
			if (config[operatorType].titleField.length == 0) {
				console.error(language.ui.nsuiquicktyping.titleField);
			}
			if (typeof (config[operatorType].projectIndexField) == 'undefined') {
				console.error(language.ui.nsuiquicktyping.projectIndexField);
			}
			if (typeof (config[operatorType].projectIdField) == 'undefined') {
				console.error(language.ui.nsuiquicktyping.projectIdField);
			}
		}
		//表格head的html
		var theadHtml = '';
		for (var titleI = 0; titleI < config[operatorType].titleField.length; titleI++) {
			if (typeof (config[operatorType].titleWidth[titleI]) != 'number') {
				theadHtml += '<th>' + config[operatorType].titleField[titleI] + '</th>';
			} else {
				theadHtml += '<th style="width:' + config[operatorType].titleWidth[titleI] + 'px;">' + config[operatorType].titleField[titleI] + '</th>';
			}
		}
		theadHtml = '<thead><tr>' + theadHtml + '</tr></thead>';
		config[operatorType].theadHtml = theadHtml;
		//表格的class 和 style
		var tableClassStyle = 'class="table table-bordered table-condensed table-hover"';
		var panelStyle = '';
		if (typeof (config[operatorType].projectTableWidth) == 'number') {
			panelStyle = ' style="width:' + config[operatorType].projectTableWidth + 'px;table-layout:fixed;"';
			tableClassStyle += panelStyle;
		} else if (typeof (config[operatorType].projectTableWidth) == 'string') {
			panelStyle = ' style="width:' + config[operatorType].projectTableWidth + ';table-layout:fixed;"';
			tableClassStyle += panelStyle;
		} else if (typeof (config[operatorType].projectTableWidth) == 'undefined') {
			panelStyle = ' style="width:100%;table-layout:fixed;"';
			tableClassStyle += panelStyle;
		}
		config[operatorType].panelStyle = panelStyle;
		config[operatorType].tableClassStyle = tableClassStyle;
	}
	//显示下拉框的面板
	function showSelectResultPanle(resultArr) {
		//如果有其它的结果面板，就需要删除
		if (config.$component.find('.result-panel').length > 0) {
			config.$component.find('.result-panel').remove();
		}
		var ajaxData = [];
		var html = '';
		if (typeof (config[currentData].data) == 'function') {
			var currentIndex = 0;
			for (var orderI = 0; orderI < config.inputOrder.length; orderI++) {
				if (config.inputOrder[orderI] == currentData) {
					currentIndex = orderI;
				}
			}
			if (currentIndex > 0) {
				currentIndex = currentIndex - 1;
			}
			var paramsData = config[currentData].data(config.values[config.inputOrder[currentIndex]]);
			var ajaxData = dataConfig.inputAjaxConfig[currentData];
			ajaxData.data = paramsData;
			nsVals.ajax(ajaxData, function (data) {
				ajaxData = data[ajaxData.dataSrc];
				html = fillSelectHtml(ajaxData);
				html = '<ul>' + html + '</ul>';
				config.$component.find('.result-panel').html(html);
				config.data[currentData].data = ajaxData;
				var $ul = config.$component.find('.result-panel').children('ul');
				$ul.children('li').on('click', function (ev) {
					var nIndex = $(this).attr('ns-index');
					addSelect(nIndex);
				});
			});
		} else {
			ajaxData = resultArr;
			html = fillSelectHtml(ajaxData);
		}
		var panelStyle = 'style="left:' + config.tagsWidth + 'px;"';
		html = '<div class="result-panel select" ' + panelStyle + '>'
			+ '<ul>'
			+ html
			+ '</ul>'
			+ '</div>';
		config.$input.after(html);
		var $ul = config.$input.parent().children('.result-panel.select').children('ul');
		$ul.children('li').on('click', function (ev) {
			var nIndex = $(this).attr('ns-index');
			addSelect(nIndex);
		});
	}
	function fillSelectHtml(ajaxData) {
		var html = '';
		for (var dataI = 0; dataI < ajaxData.length; dataI++) {
			var value = ajaxData[dataI][config[currentData].valueField];
			var text = ajaxData[dataI][config[currentData].textField];
			var currentCls = '';
			if (dataI == 0) {
				currentCls = ' class="current"';
			}
			html += '<li ns-basedata="' + currentData + '" ns-index="' + dataI + '" ' + currentCls + '>' + text + '</li>';
		}
		return html;
	}
	//添加选中的项目
	function addProject(indexNumber) {
		if (!isNaN(indexNumber)) {
			var project = {
				index: indexNumber,
				id: config.data[currentData].data[indexNumber][config[currentData].projectIdField],
				name: config.data[currentData].data[indexNumber][config[currentData].projectNameField],
				data: config.data[currentData].data[indexNumber]
			}
			config.values[currentData] = project;
			addTag(project.name, project.index);
			confirmResult();
		}
	}
	//添加选中的select
	function addSelect(index) {
		var dataObj = {};
		var name = '';
		if (isNaN(index)) {
			if (config[currentData].isAllowOther) {
				dataObj = {
					index: false,
					value: inputValue,
					data: config.data[currentData].data
				}
				name = inputValue;
			} else {
				nsAlert(language.ui.nsuiquicktyping.addSelectError, 'error');
				return false;
			}
		} else {
			dataObj = {
				index: index,
				value: config.data[currentData].data[index][config[currentData].valueField],
				name: config.data[currentData].data[index][config[currentData].textField],
				data: config.data[currentData].data[index]
			}
			name = config.data[currentData].data[index][config[currentData].contentField];
		}

		config.values[currentData] = dataObj;
		addTag(name);
		confirmResult();
	}
	//添加数字
	function addNumber(inputValue) {
		inputValue = Number(inputValue);
		function notNumber() {
			nsAlert(language.ui.nsuiquicktyping.addNumber, 'error');
			config.$input.select();
		}
		if (typeof (inputValue) != 'number' || isNaN(inputValue)) {
			notNumber();
		} else {
			if (inputValue <= 0) {
				notNumber();
			} else {
				var dataObj = {
					value: inputValue
				}
				config.values[currentData] = dataObj;
				addTag(inputValue);
				confirmResult();
			}
		}
	}
	//添加文本
	function addText(inputValue) {
		inputValue = $.trim(inputValue);
		var dataObj = {
			value: inputValue
		}
		config.values[currentData] = dataObj;
		if (inputValue == '') {
			inputValue = '无';
		}
		addTag(inputValue);
		confirmResult();
	}
	//添加日期
	function addDate(inputValue) {
		inputValue = $.trim(inputValue);
		var dataObj = {
			value: inputValue
		}
		config.values[currentData] = dataObj;
		if (inputValue == '') {
			inputValue = '无';
		}
		addTag(inputValue);
		confirmResult();
	}
	//添加tag标签
	function addTag(nameString, currentIndex) {
		if (typeof (config[currentData].title) == 'string') {
			nameString = config[currentData].title + nameString;
		}
		var closeHtml = '';
		var closeCls = '';
		/*if(currentData=='project'){
			closeHtml = '<div class="close"></div>';
			closeCls = ' withclose';
		}*/
		var tagHtml = '<div class="quicktyping-tag' + closeCls + '"><span>' + nameString + closeHtml + '</span></div>';
		config.$tags.append(tagHtml);
		//默认字段自动上屏
		if (currentData == 'project' && $.type(currentIndex) != 'undefined') {
			var defaultHtml = "";
			if (config.projectDefaultField.length > 0) {
				$.each(config.projectDefaultField, function (index, item) {
					var currentProject = config[currentData].projectFieldObj[item];
					var defaultText = currentProject.defaultText;
					var title = currentProject.title;
					config.defaultValue = config.data.project.data[currentIndex][item];
					if ($.type(currentProject.formatHandler) != 'undefined') {
						switch (currentProject.formatHandler.type) {
							case 'replaceString':
								config.defaultValue = customFormatData.data[resultArr[resultI][titleField[tdI]]];
								typeof (config.defaultValue) == 'undefined' ? config.defaultValue = "" : "";
								break;
							case 'date':
								//如果时间格式不对，或者没有时间。则显示为空，且报错
								var dateValue = moment(Number(config.defaultValue)).format(currentProject.formatHandler.data.formatDate);
								if (dateValue == 'Invalid date') {
									config.defaultValue = "";
								} else {
									config.defaultValue = dateValue
								}
								break;
						}
					}
					typeof (config.defaultValue) == 'undefined' ? config.defaultValue = "" : "";
					/* defaultHtml += '<div class="quicktyping-tag' + closeCls + '"><span>' + title + ':</span><input class="ns-table-input form-control" data-index="' + index + '" data-type="' + item + '" config.defaultValue="' + config.defaultValue + '" showResult="true"></input></div>'; */
					// defaultHtml += '<div class="quicktyping-tag' + closeCls + '"><span>' + title + ':</span></div>';
					if ($.inArray(item, config.inputOrder) == -1) {
						config.inputOrder.splice(index + 1, 0, item);
					}
					config.message[item] = defaultText;
					config[item] = { type: "number", title: title + "：" };
				})
			}
		}
	}

	//确认选择
	function confirmCurrentRow() {
		switch (searchType) {
			case 'table':
				var $currentRow = config.$component.find('.result-panel table tbody tr.current');
				var index = Number($currentRow.attr('ns-index'));
				addProject(index);
				break;
			case 'select':
				var $currentOption = config.$component.find('.result-panel ul li.current');
				var index = Number($currentOption.attr('ns-index'));
				addSelect(index);
				break;
			case 'number':
				var inputValue = config.$input.val();
				addNumber(inputValue);
				break;
			case 'text':
				var inputValue = config.$input.val();
				addText(inputValue);
				break;
			case 'date':
				var inputValue = config.$input.val();
				addDate(inputValue);
				break;
			case 'complete':
				inputComplete();
				break;
			default:
				break;
		}
	}
	//改变选择行
	function changeSelectRow(direction) {
		//direction  next 下， prev 上
		var isEmpty = config.$component.find('.result-panel').hasClass('empty');
		if (isEmpty) {
			//没结果不处理
			return false;
		}
		function currentItemMove() {
			if (direction == 'next') {
				//向下
				var $nextRow = $currentRow.next();
				if ($nextRow.length < 1) {
					//没有下一条，就不用动了
				} else {
					$currentRow.removeClass('current');
					$nextRow.addClass('current');
				}
			} else if (direction == 'prev') {
				//向上
				var $prevRow = $currentRow.prev();
				if ($prevRow.length < 1) {
					//没有上一条，就不用动了
				} else {
					$currentRow.removeClass('current');
					$prevRow.addClass('current');
				}
			}
		}
		switch (searchType) {
			case 'table':
				var $currentRow = config.$component.find('.result-panel table tbody tr.current');
				currentItemMove();
				break;
			case 'select':
				var $currentRow = config.$component.find('.result-panel ul li.current');
				currentItemMove();
				break;
		}
	}

	function removeValues() {
		var tagNum = config.$tags.children('.quicktyping-tag').length;
		if (tagNum > 0) {
			config.$tags.children('.quicktyping-tag').last().remove();
			var tagsWidth = 0;
			if (tagNum > 1) {
				//不是最后一个
				tagsWidth = config.$tags.outerWidth() + 2;
			} else {
				tagsWidth = 0;
			}

			config.tagsWidth = tagsWidth;
			config.$input.css('width', (config.inputWidth - tagsWidth) + 'px');
			delete config.values[config.inputOrder[tagNum - 1]];
			currentData = config.inputOrder[tagNum - 1];
			var isFirst = false;
			if (tagNum > 1) {
				isFirst = true;
			}
			searchType = config[currentData].type;
			if (currentData != 'date') {
				config.$input.inputmask('remove');
			}
			showNextPanel(isFirst);
		}
		//console.log(config.values)
	}
	//确认结果面板
	function confirmResult() {
		//移除面板
		var $resultPanel = config.$component.find('.result-panel');
		if ($resultPanel.length > 0) {
			$resultPanel.remove();
		}
		//改变input位置
		var tagsWidth = config.$tags.outerWidth() + 2;
		config.tagsWidth = tagsWidth;
		config.$input.css('width', (config.inputWidth - tagsWidth) + 'px');
		config.$input.val('');
		config.$input.focus();
		//如果有默认带出则默认显示并选中
		if (typeof (config.defaultValue) != 'undefined') {
			config.$input.val(config.defaultValue);
			config.$input.select();
			delete config.defaultValue;
		}
		//根据当前结果决定下一个是什么输入项
		var currentOrder = 0;
		for (orderI = 0; orderI < config.inputOrder.length; orderI++) {
			if (currentData == config.inputOrder[orderI]) {
				currentOrder = orderI;
			}
		}
		if (currentOrder < config.inputOrder.length - 1) {
			currentData = config.inputOrder[currentOrder + 1];
			if (debugerMode) {
				if (typeof (config[currentData]) != 'object') {
					console.error(language.ui.nsuiquicktyping.confirmResult + currentData + language.ui.nsuiquicktyping.confirmResultObject);
				}
				if (typeof (config[currentData].type) != 'string') {
					console.error(language.ui.nsuiquicktyping.confirmResult + currentData + language.ui.nsuiquicktyping.confirmResultString);
				}
			}
			searchType = config[currentData].type;
		} else {
			currentData = 'complete';
			searchType = 'complete';
		}
		showNextPanel(true);
	}
	//显示下一步需要的面板
	function showNextPanel(isFirst) {
		config.$input.inputmask('remove');
		if (isFirst) {
			switch (searchType) {
				case 'message':
				case 'number':
					showEmptyResultPanel(currentData);
					break;
				case 'date':
					showEmptyResultPanel(currentData);
					var dateForat = 'yyyy-mm-dd';
					if (config[currentData].format) {
						dateForat = config[currentData].format;
					}
					config.$input.inputmask(dateForat);
					break;
				case 'table':
					var resultArr = getTableData(currentData);
					showTableResultPanel(resultArr);
					break;
				case 'select':
					var subdate;
					if (typeof (baseData[currentData]) == 'object') {
						subdate = baseData[currentData].data;
					} else if (typeof (config[currentData]) == 'object') {
						subdate = config[currentData].data;
					} else {
						subdate = [];
						console.error('下拉框:' + currentData + '无法找到数据');
					}
					showSelectResultPanle(subdate);
					break;
				case 'complete':
					showEmptyResultPanel(currentData);
					break;
				default:
					showEmptyResultPanel(currentData);
					break;
			}
		} else {
			showEmptyResultPanel(currentData);
		}
	}
	//完成输入
	function inputComplete() {
		var isReturn = true;
		if (typeof (config.completeHandler) == 'function') {
			isReturn = config.completeHandler(config.values);
		}
		//isReturn = typeof(isReturn) == 'boolean' ? isReturn : true;
		if (typeof (isReturn) != 'boolean') {
			nsAlert('返回值不是布尔值！');
		}
		if (isReturn) {
			refreshInput();
			config.$input.focus();
		}
	}
	//刷新输入框，开始第二次使用
	function refreshInput() {
		config.tagsWidth = 0;//恢复默认值
		config.values = {};
		initContainer();
	}
	//设置焦点
	function setFocus() {
		refreshInput();
		config.$input.focus();
	}
	return {
		getValues: function () { return config.values; },
		getBaseData: function () { return baseData; },
		dataInit: dataInit,
		init: init,
		setFocus: setFocus
	}
})(jQuery);
