var nsCustomConfig = (function($) {

	// 按钮、表格、表单 id对应名称下拉框选中值
	var selComBoId;
	// 本地配置集合
	var configObj = {};
	// 缓存合并修改后的按钮数据，留存用来多次点开配置操作
	var orginalEditButton = {};
	// 合并修改后的按钮数据用于进行配置页面操作,结构为例：{sysmanage_basfuns_BasFuns_button:[{id:'addButton',text
	// : '新增'},{id : 'b',text : '修改'}]}
	var button = {};
	// 缓存本地配置原始数据用来与配置修改后的数据比对
	var orginalButtonData = {};
	// 合并修改后的按钮数据用于进行配置页面操作,结构为例：{sysmanage_basfuns_BasFuns_button:{addButton:{id:'addButton',text:
	// '新增'}}}
	var buttonMap = {};
	// 按钮id对应的显示按钮的id集合用于multiselect的default属性
	var showButton = {};
	// 合并修改后的表格数据用于进行配置页面操作,结构为例：{sysmanage_basfuns_BasFuns_Table:[{field:'userAccount',title
	// : '登录帐号'},{field : 'userName',text : '操作员姓名'}]}
	var table = {};
	// 缓存本地配置原始数据用来与配置修改后的数据比对
	var orginalTableData = {};
	// 合并修改后的表格数据用于进行配置页面操作,结构为例：{sysmanage_basfuns_BasFuns_Table:{userAccount:{id:'userAccount',text:
	// '登录帐号'}}}
	var tableMap = {};
	// 按钮id对应的显示表格的id集合用于multiselect的default属性
	var showTable = {};
	// 缓存本地配置原始数据用来与配置修改后的数据比对,结构为例：{sysmanage_basfuns_BasFuns_Form:{patientCode:{id:'patientCode',label:'患者编号'}}}
	var orginalFormData = {};
	// 合并修改后的表单数据用于进行配置页面操作,结构为例：{sysmanage_basfuns_BasFuns_Form:{patientCode:{id:'patientCode',label:'患者编号'}}}
	var orginalEditFormMap = {};
	// 合并修改后的表单数据留存用来多次点开配置操作,结构为例：{sysmanage_basfuns_BasFuns_Form:{patientCode:{id:'patientCode',label:'患者编号'}}}
	var cacheEditFormMap = {};
	// 页面传过来的配置数据，结构{id:{},id:{}}
	var configIdObj = {};
	// 原始数据
	var configInitData = {};

	// 处理页面配置 mapJson对象不存在则从页面上读取map值
	var init = function(initConfig, mapJson) {
		configInitData[initConfig.pageCode] = $.extend(true, {}, initConfig);
		if (typeof (mapJson) == 'undefined') {
			var mapID = initConfig.pageCode.replace(/\./g, "-");
			var $map = $("#" + mapID + "-map");
			if ($map.length == 0) {
				if (typeof (initConfig.pageCode) == 'undefined') {
					nsalert('pageCode未定义', 'error');
				} else {
					nsalert('map对象不存在', 'error');
				}
				return false;
			}
			;
			mapJson = JSON.parse($map.val());
		}
		var customData = nsCustomConfig.initConfig(initConfig, mapJson);
		// 存储原始页面上的JS数据
		$.each(initConfig, function(type, configJsonArr) {
			for (var initArrI = 0; initArrI < configJsonArr.length; initArrI++) {
				if (type == 'pageCode') {
					// pagecode暂不保存
				} else if (type == 'tableConfig') {
					// 这个是用不到的，用来保存table对象其它数据的
				} else {
					configIdObj[configJsonArr[initArrI].id] = {}
					configIdObj[configJsonArr[initArrI].id].id = configJsonArr[initArrI].id;
					configIdObj[configJsonArr[initArrI].id].type = type;
					configIdObj[configJsonArr[initArrI].id].config = configJsonArr[initArrI];
				}

			}
		});
		// 根据类型生成页面组件
		$.each(customData, function(partID, partConfig) {
			switch (configIdObj[partID].type) {
			case 'nav':
				var navObj = {};
				navObj.id = partID;
				navObj.btns = partConfig;
				nsNav.init(navObj);
				break;
			case 'formJson':
				var partFormObj = {};
				$.each(configIdObj[partID].config, function(key, value) {
					if (key != 'form') {
						// 需要转化为数字的
						if (key == 'column') {
							partFormObj[key] = parseInt(value);
						} else {
							partFormObj[key] = value;
						}
					} else {
						partFormObj['form'] = partConfig;
					}
				});
				nsForm.init(partFormObj);
				break;
			case 'tableJson':
				var partTableObj = initConfig.tableConfig[partID];
				var columsObj = $.extend(true, [], partConfig);
				columsObj.sort(function(a, b) {
					return a.orderId - b.orderId;
				});
				baseDataTable.init(partTableObj.data, columsObj, partTableObj.ui, partTableObj.btns);
				break;
			}
		})
		// 生成配置按钮
		nsNav.initConfigBtn(initConfig);
	}
	// 初始化配置参数方法
	var initConfig = function(initConfig, mapJson) {
		var returnData = {};
		var pageCode = 'document';
		if (initConfig.pageCode) {
			pageCode = initConfig.pageCode;
		}
		configObj[pageCode] = initConfig;
		// 数据库中返回的有改动的数据集合
		var mapObj = mapJson;
		if (typeof (configObj[pageCode].nav) != "undefined" && typeof (mapObj.button) != "undefined"
				&& configObj[pageCode].nav.length > 0) {

			initButtonConfig(configObj[pageCode].nav, mapObj.button, pageCode);
			$.each(buttonMap[pageCode], function(key, value) {
				returnData[key] = convertDataToArry(value);
			});
		} else if (typeof (configObj[pageCode].nav) != "undefined" && configObj[pageCode].nav.length > 0) {
			initButtonConfig(configObj[pageCode].nav, mapObj.button, pageCode);
			for (var i = 0; i < configObj[pageCode].nav.length; i++) {
				returnData[configObj[pageCode].nav[i].id] = $.extend(true, returnData[configObj[pageCode].nav[i].id],
						configObj[pageCode].nav[i].btns);
			}
		}
		if (typeof (mapObj.table) != "undefined" && typeof (configObj[pageCode].tableJson) != "undefined"
				&& configObj[pageCode].tableJson.length > 0) {
			initTableConfig(configObj[pageCode].tableJson, mapObj.table, pageCode);
			$.each(table[pageCode], function(key, value) {
				returnData[key] = table[pageCode][key];
			});
		} else if (typeof (configObj[pageCode].tableJson) != "undefined" && configObj[pageCode].tableJson.length > 0) {
			initTableConfig(configObj[pageCode].tableJson, mapObj.table, pageCode);
			for (var i = 0; i < configObj[pageCode].tableJson.length; i++) {
				returnData[configObj[pageCode].tableJson[i].id] = configObj[pageCode].tableJson[i].columns;
			}
		}
		if (typeof (mapObj.table) != "undefined" && typeof (configObj[pageCode].formJson) != "undefined"
				&& configObj[pageCode].formJson.length > 0) {
			initFormConfig(configObj[pageCode].formJson, mapObj.form, pageCode);
			$.each(cacheEditFormMap[pageCode], function(key, value) {
				returnData[key] = convertDataToArry(value);
			});
		} else if (typeof (configObj[pageCode].formJson) != "undefined" && configObj[pageCode].formJson.length > 0) {
			initFormConfig(configObj[pageCode].formJson, mapObj.form, pageCode);
			for (var i = 0; i < configObj[pageCode].formJson.length; i++) {
				returnData[configObj[pageCode].formJson[i].id] = configObj[pageCode].formJson[i].form;
			}
		}
		return returnData;
	}
	// 初始化按钮配置参数方法
	var initButtonConfig = function(buttonNav, buttonData, pageCode) {
		orginalButtonData[pageCode] = $.extend(true, orginalButtonData[pageCode], converButtonData(buttonNav));
		button[pageCode] = $.extend(true, {}, orginalButtonData[pageCode]);
		orginalEditButton[pageCode] = $.extend(true, {}, orginalButtonData[pageCode]);
		var showButtonObj = new Object();
		var buttonObj = new Object();
		for ( var buttonCode in button[pageCode]) {
			var showList = [];
			var setList = {};
			if (typeof (buttonData) != "undefined" && typeof (buttonData[buttonCode]) != "undefined") {
				setList = buttonData[buttonCode].setList;
			}
			var buttonDataMap = {};
			for (var i = 0; i < button[pageCode][buttonCode].length; i++) {
				for ( var buttonId in setList) {
					if (button[pageCode][buttonCode][i].id == buttonId) {
						for ( var buttonAttr in setList[buttonId]) {
							if (setList[buttonId][buttonAttr] != button[pageCode][buttonCode][i][buttonAttr]) {
								button[pageCode][buttonCode][i][buttonAttr] = setList[buttonId][buttonAttr];
								orginalEditButton[pageCode][buttonCode][i][buttonAttr] = setList[buttonId][buttonAttr];
							}
						}
					}
				}
				if (button[pageCode][buttonCode][i].configShow && button[pageCode][buttonCode][i].configShow != "false") {
					showList.push(button[pageCode][buttonCode][i].id);
				}
				buttonDataMap[button[pageCode][buttonCode][i].id] = button[pageCode][buttonCode][i];
			}
			showButtonObj[buttonCode] = showList;
			buttonObj[buttonCode] = buttonDataMap;
		}
		showButton[pageCode] = showButtonObj;
		buttonMap[pageCode] = buttonObj;
	}
	// 转化本地默认按钮配置数据为所需数据结构
	var converButtonData = function(nav) {
		var returnData = new Object();
		for (var i = 0; i < nav.length; i++) {
			var list = [];
			for (var j = 0; j < nav[i].btns.length; j++) {
				for (var k = 0; k < nav[i].btns[j].length; k++) {
					nav[i].btns[j][k].configArea = j;
					nav[i].btns[j][k].orderId = k;
				}
				list = list.concat(nav[i].btns[j]);
			}
			returnData[nav[i].id] = list;
		}
		return returnData;
	}
	// 初始化表格配置参数方法
	var initTableConfig = function(tableJson, tableData, pageCode) {

		converTableData(tableJson, pageCode);
		table[pageCode] = $.extend(true, {}, orginalTableData[pageCode]);
		var showTableObj = new Object();
		var tableObj = new Object();
		for ( var tableCode in table[pageCode]) {
			var showList = [];
			var tableDataMap = {};
			var setList = {};
			if (typeof (tableData) != "undefined" && typeof (tableData[tableCode]) != "undefined") {
				setList = tableData[tableCode].setList;
			}
			for (var i = 0; i < table[pageCode][tableCode].length; i++) {
				for ( var tableId in setList) {
					if (table[pageCode][tableCode][i].field == tableId) {
						for ( var tableAttr in setList[tableId]) {
							if (setList[tableId][tableAttr] != table[pageCode][tableCode][i][tableAttr]) {
								table[pageCode][tableCode][i][tableAttr] = setList[tableId][tableAttr];
							}
						}
					}
				}
				if (!table[pageCode][tableCode][i].hidden) {
					showList.push(table[pageCode][tableCode][i].field);
				}
				tableDataMap[table[pageCode][tableCode][i].field] = table[pageCode][tableCode][i];
			}
			showTableObj[tableCode] = showList;
			tableObj[tableCode] = tableDataMap;
		}
		showTable[pageCode] = showTableObj;
		tableMap[pageCode] = tableObj;
	}
	// 转化本地默认表格配置数据为所需数据结构
	var converTableData = function(tableCfg, pageCode) {
		var tableCfgObj = new Object();
		for (var i = 0; i < tableCfg.length; i++) {
			for (var j = 0; j < tableCfg[i].columns.length; j++) {
				tableCfg[i].columns[j].orderId = j;
				if (typeof (tableCfg[i].columns[j].hidden) == "undefined") {
					tableCfg[i].columns[j].hidden = false;
				}
			}
			tableCfgObj[tableCfg[i].id] = tableCfg[i].columns;
		}
		orginalTableData[pageCode] = tableCfgObj;
	}
	// 初始化表单配置参数方法
	var initFormConfig = function(formJson, formData, pageCode) {

		orginalFormData[pageCode] = $.extend(true, orginalFormData[pageCode], converFormData(formJson));
		orginalEditFormMap[pageCode] = $.extend(true, {}, orginalFormData[pageCode]);
		editFormMap = $.extend(true, {}, orginalFormData[pageCode]);
		orginalHideFormMap = {};
		for ( var formCode in orginalEditFormMap[pageCode]) {
			var setList = {};
			var hideObj = {};
			if (typeof (formData[formCode]) != "undefined") {
				setList = formData[formCode].setList;
			}
			$.each(orginalEditFormMap[pageCode][formCode], function(key, value) {
				if (typeof (setList[key]) != "undefined") {
					for ( var attr in setList[key]) {
						if (setList[key][attr] == "true") {
							value[attr] = true;
							editFormMap[formCode][key][attr] = true;
						} else if (setList[key][attr] == "false") {
							value[attr] = false;
							editFormMap[formCode][key][attr] = false;
						} else {
							value[attr] = setList[key][attr];
							editFormMap[formCode][key][attr] = setList[key][attr];
						}
					}
				}
				/*
				 * value.changeHandler = function(field, text) {
				 * showChangeAttr(field, text, pageCode); }
				 */
				if (value.hidden) {
					var hideValue = $.extend(true, {}, value);
					hideValue.hidden = false;
					/*
					 * hideValue.changeHandler = function(field, text) {
					 * hideChangeAttr(field, text, pageCode); };
					 */
					hideObj[key] = hideValue;
				}
			});
			orginalHideFormMap[formCode] = hideObj;
		}
		cacheEditFormMap[pageCode] = $.extend(true, {}, orginalEditFormMap[pageCode]);
	}
	// 转化本地默认表单配置数据为所需数据结构
	var converFormData = function(formJson) {
		var returnData = new Object();
		for (var i = 0; i < formJson.length; i++) {
			var data = {};
			for (var j = 0; j < formJson[i].form.length; j++) {
				for (var k = 0; k < formJson[i].form[j].length; k++) {
					formJson[i].form[j][k].configArea = j;
					formJson[i].form[j][k].orderId = k;
					data[formJson[i].form[j][k].id] = formJson[i].form[j][k];
				}
			}
			returnData[formJson[i].id] = data;
		}
		return returnData;
	}
	// 通用方法，转换表单或按钮对象集合，转换为二维数组结构
	var convertDataToArry = function(data) {
		var dataArr = [];
		$.each(data, function(key, value) {
			if (typeof (dataArr[value.configArea]) != "undefined") {
				dataArr[value.configArea].push(value);
			} else {
				if (value.configArea == "0") {
					dataArr.push([ value ]);
				} else {
					for (var i = 0; i <= value.configArea; i++) {
						if (typeof (dataArr[i]) == "undefined") {
							dataArr.push([]);
						}
					}
					dataArr[value.configArea].push(value);
				}
			}
		})
		for (var i = 0; i < dataArr.length; i++) {
			if (dataArr[i].length != 0) {
				dataArr[i].sort(function(a, b) {
					return a.orderId - b.orderId;
				});
			} else {
				dataArr.splice(i, 1);
			}
		}
		return dataArr;
	}
	// 打开按钮配置页面方法
	var initButtonConfigPage = function(pageCode) {
		var configS = {
			id : "plane-initButtonConfigPage",
			title : "按钮配置",
			size : "b",
			form : [
					{
						html : "<div class='page-title nav-form' id='config_button_button'></div><div id='form-combobox' class='col-sm-12'></div>"
								+ "<div id='multi-selectDialog2' class='col-sm-6'></div>"
								+ "<div id='form-selectMuitl' class='col-sm-6'></div>"

					}, ],
			btns : [ {
				text : '保存',
				handler : "nsCustomConfig.saveButtonChangeFunc('" + pageCode + "')"
			}, {
				text : '重置',
				handler : function() {
					resetConfig(pageCode, 'nav')
				}
			} ],
			closeHandler : closeHandler

		}
		var navJson = {
			id : "config_button_button",
			btns : [ [ {
				text : '上移',
				handler : upMove,
				configShow : true,
				required : false,
			}, {
				text : '下移',
				handler : downMove,
				configShow : true,
				required : false,
			}, {
				text : '置顶',
				handler : topMove,
				required : false,
				configShow : true
			}, {
				text : '置底',
				handler : buttomMove,
				required : false,
				configShow : true
			} ] ],
		}
		nsdialog.initShow(configS);
		controlPlane.formNavInit(navJson);
		initButtonComboForm(pageCode);
		initButtonForm(pageCode);
		initButtonMultiSelect("", [], pageCode);
	}
	// 打开表格配置页面方法
	var initTableConfigPage = function(pageCode) {
		var configS = {
			id : "plane-code2",
			title : "表格配置",
			size : "b",
			form : [
					{
						html : "<div class='page-title nav-form' id='config_table_button'></div><div id='form-combobox' class='col-sm-12'></div><div id='multi-selectDialog2' class='col-sm-6'></div><div id='form-selectMuitl' class='col-sm-6'></div>"
					}, ],
			btns : [ {
				text : '保存',
				handler : "nsCustomConfig.saveTableChangeFunc('" + pageCode + "')"
			}, {
				text : '重置',
				handler : function() {
					resetConfig(pageCode, 'table')
				}
			} ],
			closeHandler : closeHandler

		}
		var navJson = {
			id : "config_table_button",
			btns : [ [ {
				text : '上移',
				handler : upMove,
			}, {
				text : '下移',
				handler : downMove,
			}, {
				text : '置顶',
				handler : topMove,
			}, {
				text : '置底',
				handler : buttomMove,
			} ] ],
		}
		nsdialog.initShow(configS);
		controlPlane.formNavInit(navJson);
		initTableComboForm(pageCode);
		initTableForm(pageCode);
		initTableMultiSelect("", [], pageCode);
	}
	// 打开表单配置页面方法
	var initFormConfigPage = function(pageCode) {
		var configHtml = '<div id="form-combobox" class="col-sm-12"></div><div id="form-configForm" class="col-sm-12"></div>';
		var configF = {
			id : "netstar-custom-config-form-dialog",
			title : "表单配置",
			note : '请先选择要配置的页面',
			size : "b",
			form : [ {
				html : configHtml
			}, ],
			btns : [ {
				text : '保存',
				handler : "nsCustomConfig.saveFormChangeFunc('" + pageCode + "')"
			}, {
				text : '重置',
				handler : function() {
					resetConfig(pageCode, 'form')
				}
			} ],
			closeHandler : closeHandler

		}
		var navJson = {
			id : "config_button_button",
			btns : [ [ {
				id : 'resetConfig',
				text : '重置',
				handler : resetConfig,
				required : false,
				configShow : true
			} ] ],
		}
		nsdialog.initShow(configF);
		controlPlane.formNavInit(navJson);
		initFormComboForm(pageCode);
	}
	// 上移
	var upMove = function() {
		nsMultiSelect.multiSelectSort('multi-multi-selectDialog2-msel', 'up');
	}
	// 下移
	var downMove = function() {
		nsMultiSelect.multiSelectSort('multi-multi-selectDialog2-msel', 'down');
	}
	// 上移到顶
	var topMove = function() {
		nsMultiSelect.multiSelectSort('multi-multi-selectDialog2-msel', 'top');
	}
	// 下移到底
	var buttomMove = function() {
		nsMultiSelect.multiSelectSort('multi-multi-selectDialog2-msel', 'bottom');
	}
	// 初始化按钮MultiSelect组件方法
	var initButtonMultiSelect = function(defaultData, selectData, pageCode) {
		console.info(defaultData);
		console.info(selectData);
		var multiselectJson2 = {
			id : 'multi-selectDialog2',
			multiID : "multi-selectDialog2-msel",
			isALLSelect : false,
			isNotSelect : false,
			'default' : defaultData,
			keepOrder : false,// 所选项目将以与选择的顺序相同的顺序显示。如果原始选择中有optgroups，此功能不可用
			headerType : 'search',
			textField : 'text',
			valueField : 'id',
			order : 'orderId',
			selectedHanlder : function(id, text) {
				loadButtonFunc(id, text, pageCode);
			},
			selectionHandler : function(id, text) {
				return showButtonFunc(id, text, pageCode);
			},
			cancelSelectedHandler : function(id, text) {
				loadButtonFunc(id, text, pageCode);
			},
			cancelSelectionHandler : function(id, text) {
				return hideButtonFunc(id, text, pageCode);
			},
			select : selectData
		}
		nsMultiSelect.multiSelectInit(multiselectJson2);
	}
	// 初始化表格MultiSelect组件方法
	var initTableMultiSelect = function(defaultData, selectData, pageCode) {
		var multiselectJson2 = {
			id : 'multi-selectDialog2',
			multiID : "multi-selectDialog2-msel",
			isALLSelect : false,
			isNotSelect : false,
			'default' : defaultData,
			keepOrder : false,// 所选项目将以与选择的顺序相同的顺序显示。如果原始选择中有optgroups，此功能不可用
			headerType : 'search',
			textField : 'title',
			valueField : 'field',
			order : 'orderId',
			selectionHandler : function(id, text) {
				return showTableFunc(id, text, pageCode);
			},
			cancelSelectedHandler : function(id, text) {
				loadTableFunc(id, text, pageCode);
			},
			cancelSelectionHandler : function(id, text) {
				return hideTableFunc(id, text, pageCode);
			},
			select : selectData
		}
		nsMultiSelect.multiSelectInit(multiselectJson2);
	}
	// 初始化按钮数组id和名称下拉框
	var initButtonComboForm = function(pageCode) {
		var configB = {
			id : "form-combobox",
			size : "standard",
			format : "close",
			fillbg : true,
			form : [ [ {
				id : 'id',
				label : '按钮列表',
				type : 'select',
				column : 4,
				textField : 'configTitle',
				valueField : 'id',
				subdata : configObj[pageCode].nav,
				changeHandler : function(id, text) {
					selButton(id, text, pageCode);
				}
			} ], ]
		}
		formPlane.formInit(configB);
	}
	// 初始化按钮属性维护表单
	var initButtonForm = function() {
		var configB = {
			id : "form-selectMuitl",
			size : "standard",
			format : "standard",
			fillbg : true,
			form : [ [ {
				id : 'id',
				type : 'hidden',
				column : 4
			}, {
				id : 'text',
				label : '按钮名称',
				type : 'text',
				rules : 'required',
				column : 12
			}, {
				id : 'configArea',
				label : '分组',
				type : 'text',
				rules : 'required',
				column : 12
			} ], ]
		}
		formPlane.formInit(configB);
	}
	// 初始化表格数组id和名称下拉框
	var initTableComboForm = function(pageCode) {
		var configT = {
			id : "form-combobox",
			size : "standard",
			format : "standard",
			fillbg : true,
			form : [ [ {
				id : 'id',
				label : '按钮列表',
				type : 'select',
				column : 4,
				textField : 'configTitle',
				valueField : 'id',
				subdata : configObj[pageCode].tableJson,
				changeHandler : function(id, text) {
					selTable(id, text, pageCode);
				}
			} ], ]
		}
		formPlane.formInit(configT);
	}
	// 初始化表格属性维护表单
	var initTableForm = function() {
		var configT = {
			id : "form-selectMuitl",
			size : "standard",
			format : "standard",
			fillbg : true,
			form : [ [ {
				id : 'field',
				type : 'hidden',
			}, {
				id : 'title',
				label : '列名称',
				type : 'text',
				rules : 'required',
				column : 12
			}, {
				id : 'width',
				label : '列宽',
				type : 'text',
				rules : 'required',
				column : 12
			}, {
				id : 'halign',
				label : '对齐方式',
				type : 'select',
				column : 12,
				textField : 'text',
				valueField : 'value',
				rules : 'required',
				subdata : [ {
					text : "居中",
					value : "center"
				}, {
					text : "左对齐",
					value : "left"
				}, {
					text : "右对齐",
					value : "right"
				} ],
			} ], ]
		}
		formPlane.formInit(configT);
	}
	// 初始化表单数组id和名称下拉框
	var initFormComboForm = function(pageCode) {
		var configT = {
			id : "form-combobox",
			size : "standard",
			format : "standard",
			fillbg : true,
			form : [ [ {
				id : 'id',
				label : '表单列表',
				type : 'select',
				column : 4,
				textField : 'configTitle',
				valueField : 'id',
				subdata : configObj[pageCode].formJson,
				changeHandler : function(id, text) {
					selForm(pageCode);
				}
			}, {
				id : 'showType',
				label : '表单类型',
				type : 'radio',
				rules : 'required',
				column : 8,
				textField : 'text',
				valueField : 'value',
				changeHandler : function(value) {
					selForm(pageCode);
				},
				value : 's',
				subdata : [ {
					text : '显示',
					value : 's',
					isChecked : true,
					isDisabled : false,
				}, {
					text : '隐藏',
					value : 'h',
					isChecked : false,
					isDisabled : false,
				} ]
			} ], ]
		}
		formPlane.formInit(configT, '');
	}
	// 初始化表单预览form
	var initFormForm = function(formArr, pageCode, showType) {
		if (typeof (formArr) == "undefined") {
			formArr = [ [] ];
		}
		var configT = {
			id : "form-configForm",
			size : "standard",
			format : "standard",
			fillbg : true,
			form : formArr
		}
		formPlane.formInit(configT);
		$labels = $("#" + configT.id + " label.control-label");
		$labels.addClass('model-edit');
		$labels.after('<div class="control-edit"><i class="fa fa-edit"></i></div>')
		var $control = $("#" + configT.id + " .control-edit");
		$control.on('click', function(ev) {
			var fieldStr = $(this).prev().attr('for');
			fieldStr = fieldStr.replace('form-form-configForm-', '')
			if (showType == "s") {
				showChangeAttr(fieldStr, '', pageCode);
			} else {
				hideChangeAttr(fieldStr, '', pageCode);
			}
			ev.stopPropagation();
		})

	}
	// 选择表单id对应名称下拉框初始化对应的预览表单
	var selForm = function(pageCode) {
		var form_combo_form = formPlane.getFormJSON("form-combobox");
		if (form_combo_form.id != "选填" && form_combo_form.id != '') {
			if (form_combo_form.showType == "s") {
				initFormForm($.extend(true, [], convertDataToArry(orginalEditFormMap[pageCode][form_combo_form.id])),
						pageCode, form_combo_form.showType);
			} else if (form_combo_form.showType == "h") {
				initFormForm($.extend(true, [], convertDataToArry(orginalHideFormMap[form_combo_form.id])), pageCode,
						form_combo_form.showType);
			}
		}
	}
	// 选择按钮id对应名称下拉框初始化按钮MultiSelect组件
	var selButton = function(id, text, pageCode) {
		var dataArr = nsMultiSelect.Json["multi-multi-selectDialog2-msel"].data;
		if (dataArr.length > 0) {
			for (var i = 0; i < dataArr.length; i++) {
				if (typeof (buttonMap[pageCode][selComBoId][dataArr[i].id]) != "undefined") {
					buttonMap[pageCode][selComBoId][dataArr[i].id].orderId = dataArr[i].orderId;
				}
				for (var j = 0; j < button[pageCode][selComBoId].length; j++) {
					if (dataArr[i].id == button[pageCode][selComBoId][j].id) {
						button[pageCode][selComBoId][j].orderId = dataArr[i].orderId;
					}
				}
			}
		}
		if (id != "选填") {
			selComBoId = id;
			initButtonMultiSelect(showButton[pageCode][id], button[pageCode][id], pageCode);
		}
	}
	// 选择表格id对应名称下拉框初始化按钮MultiSelect组件
	var selTable = function(id, text, pageCode) {
		var dataArr = nsMultiSelect.Json["multi-multi-selectDialog2-msel"].data;
		if (dataArr.length > 0) {
			$.each(tableMap[pageCode], function(key, value) {
				if (key != id) {
					for (var i = 0; i < dataArr.length; i++) {
						if (typeof (tableMap[pageCode][key][dataArr[i].id]) != "undefined") {
							tableMap[pageCode][key][dataArr[i].id].orderId = dataArr[i].orderId;
						}
					}
				}
			})
		}
		if (id != "选填") {
			initTableMultiSelect(showTable[pageCode][id], table[pageCode][id], pageCode);
		}
	}
	var closeHandler = function() {
	}
	// 按钮MultiSelect组件由隐藏设置到显示触发事件更改按钮配置数据
	var showButtonFunc = function(id, text, pageCode) {
		var button_combo_form = formPlane.getFormJSON("form-combobox");
		buttonMap[pageCode][button_combo_form.id][id].configShow = true;
		return {
			success : true
		};
	}
	// 按钮MultiSelect组件由显示设置隐藏到触发事件更改按钮配置数据
	var hideButtonFunc = function(id, text, pageCode) {
		var button_combo_form = formPlane.getFormJSON("form-combobox");
		if (!buttonMap[pageCode][button_combo_form.id][id].required) {
			buttonMap[pageCode][button_combo_form.id][id].configShow = false;
			return {
				success : true
			};
		} else {
			return {
				success : false,
				msg : "为避免影响系统正常运行，此按钮禁止隐藏"
			};
		}
	}
	// 表格MultiSelect组件由隐藏设置到显示触发事件更改表格配置数据
	var showTableFunc = function(id, text, pageCode) {
		var table_combo_form = formPlane.getFormJSON("form-combobox");
		tableMap[pageCode][table_combo_form.id][id].hidden = false;
		return {
			success : true
		};
	}
	// 表格MultiSelect组件由显示设置隐藏到触发事件更改表格配置数据
	var hideTableFunc = function(id, text, pageCode) {
		var table_combo_form = formPlane.getFormJSON("form-combobox");
		if (!tableMap[pageCode][table_combo_form.id][id].required) {
			tableMap[pageCode][table_combo_form.id][id].hidden = true;
			return {
				success : true
			};
		} else {
			return {
				success : false,
				msg : "为避免影响系统正常运行，此列禁止隐藏"
			};
		}
	}
	// 选中MultiSelect中的一行按钮数据加载按钮属性配置表单
	var loadButtonFunc = function(id, text, pageCode) {
		var button_combo_form = formPlane.getFormJSON("form-combobox");
		if ($("#form-form-selectMuitl-id").val()) {
			var button_form = formPlane.getFormJSON("form-selectMuitl");
			buttonMap[pageCode][button_combo_form.id][button_form.id].text = button_form.text;
			buttonMap[pageCode][button_combo_form.id][button_form.id].configArea = button_form.configArea;
		}
		if (typeof (id) != "undefined") {
			var dateJson = new Object();
			dateJson.id = id;
			dateJson.text = buttonMap[pageCode][button_combo_form.id][id].text;
			dateJson.configArea = buttonMap[pageCode][button_combo_form.id][id].configArea;
			formPlane.fillValues(dateJson, 'form-selectMuitl');
		}
	}
	// 选中MultiSelect中的一行表格的据加载表格属性配置表单
	var loadTableFunc = function(id, text, pageCode) {
		var table_combo_form = formPlane.getFormJSON("form-combobox");
		if ($("#form-form-selectMuitl-field").val()) {
			var table_form = formPlane.getFormJSON("form-selectMuitl");
			tableMap[pageCode][table_combo_form.id][table_form.field].title = table_form.title;
			tableMap[pageCode][table_combo_form.id][table_form.field].halign = table_form.halign;
			tableMap[pageCode][table_combo_form.id][table_form.field].width = table_form.width;
		}
		if (typeof (id) != "undefined") {
			var dateJson = new Object();
			dateJson.field = id;
			dateJson.title = tableMap[pageCode][table_combo_form.id][id].title;
			dateJson.halign = tableMap[pageCode][table_combo_form.id][id].halign;
			dateJson.width = tableMap[pageCode][table_combo_form.id][id].width;
			formPlane.fillValues(dateJson, 'form-selectMuitl');
		}
	}
	// 初始化隐藏表单输入框属性维护页面
	var hideChangeAttr = function(field, text, pageCode) {
		var form_combo_form = formPlane.getFormJSON("form-combobox");
		var hiddenStr = "";
		var attr = orginalHideFormMap[form_combo_form.id][field];

		if (typeof (attr.hidden) != "undenfined") {
			if (attr.hidden) {
				hiddenStr = "s";
			} else {
				hiddenStr = "h";
			}
		} else {
			attr.hidden = "h";
		}
		var configS = {
			id : "form-attrchange",
			title : "DEMO代码",
			size : "s",
			form : [ [ {
				id : 'id',
				value : attr.id,
				type : 'hidden'
			}, {
				id : 'label',
				label : '输入框名称',
				type : 'text',
				value : attr.label,
				rules : 'required',
				column : 8
			}, {
				id : 'column',
				label : '宽度',
				type : 'select',
				value : attr.column,
				rules : 'required',
				textField : 'text',
				valueField : 'value',
				column : 8,
				subdata : [ {
					text : '六分之一列',
					value : '2'
				}, {
					text : '四分之一列',
					value : '3'
				}, {
					text : '三分之一列',
					value : '4'
				}, {
					text : '二分之一列',
					value : '6'
				}, {
					text : '三分之二列',
					value : '8'
				}, {
					text : '整行',
					value : '12'
				}, ]
			}, {
				id : 'configArea',
				label : '分组',
				type : 'text',
				value : attr.configArea,
				rules : 'required',
				column : 8
			}, {
				id : 'hidden',
				label : '显示类型',
				type : 'radio',
				rules : 'required',
				column : 8,
				value : hiddenStr,
				textField : 'text',
				valueField : 'value',
				subdata : [ {
					text : '显示',
					value : 's',
					isChecked : true,
					isDisabled : false,
				}, {
					text : '隐藏',
					value : 'h',
					isChecked : false,
					isDisabled : false,
				} ]
			} ] ],
			btns : [ {
				text : '保存',
				handler : "nsCustomConfig.saveHideAttrChangeFunc('" + pageCode + "')"
			} ],
			closeHandler : closeHandler

		}
		nsdialogMore.initShow(configS);
	}
	// 初始化显示表单输入框属性维护页面
	var showChangeAttr = function(field, text, pageCode) {
		var form_combo_form = formPlane.getFormJSON("form-combobox");
		var hiddenStr = "";
		var attr = orginalEditFormMap[pageCode][form_combo_form.id][field];

		if (typeof (attr.hidden) != "undenfined") {
			if (attr.hidden) {
				hiddenStr = "h";
			} else {
				hiddenStr = "s";
			}
		} else {
			hiddenStr = "s";
		}

		var configS = {
			id : "form-attrshowchange",
			title : "DEMO代码",
			size : "s",
			form : [ [ {
				id : 'id',
				value : attr.id,
				type : 'hidden'
			}, {
				id : 'label',
				label : '输入框名称',
				value : attr.label,
				type : 'text',
				rules : 'required',
				column : 8
			}, {
				id : 'column',
				label : '宽度',
				type : 'select',
				rules : 'required',
				value : attr.column,
				textField : 'text',
				valueField : 'value',
				column : 8,
				subdata : [ {
					text : '六分之一列',
					value : '2'
				}, {
					text : '四分之一列',
					value : '3'
				}, {
					text : '三分之一列',
					value : '4'
				}, {
					text : '二分之一列',
					value : '6'
				}, {
					text : '三分之二列',
					value : '8'
				}, {
					text : '整行',
					value : '12'
				}, ]
			}, {
				id : 'hidden',
				label : '是否显示类型',
				type : 'radio',
				rules : 'required',
				value : hiddenStr,
				column : 8,
				textField : 'text',
				valueField : 'value',
				subdata : [ {
					text : '显示',
					value : 's',
					isChecked : true,
					isDisabled : false,
				}, {
					text : '隐藏',
					value : 'h',
					isChecked : false,
					isDisabled : false,
				} ]
			}, {
				id : 'configArea',
				label : '分组',
				type : 'text',
				value : attr.configArea,
				rules : 'required',
				column : 8
			}, {
				id : 'orderId',
				label : '显示顺序',
				value : attr.orderId,
				type : 'text',
				rules : 'required',
				column : 8
			} ] ],
			btns : [ {
				text : '保存',
				handler : "nsCustomConfig.saveShowAttrChangeFunc('" + pageCode + "')"
			} ],
			closeHandler : closeHandler

		}
		nsdialogMore.initShow(configS);
	}
	// 保存显示表单单个输入框属性
	var saveShowAttrChangeFunc = function(pageCode) {
		var form_attr_form = formPlane.getFormJSON("form-attrshowchange");
		var form_combo_form = formPlane.getFormJSON("form-combobox");
		orginalEditFormMap[pageCode][form_combo_form.id][form_attr_form.id].column = parseInt(form_attr_form.column);
		orginalEditFormMap[pageCode][form_combo_form.id][form_attr_form.id].configArea = form_attr_form.configArea;
		orginalEditFormMap[pageCode][form_combo_form.id][form_attr_form.id].orderId = form_attr_form.orderId;
		orginalEditFormMap[pageCode][form_combo_form.id][form_attr_form.id].label = form_attr_form.label;
		if (form_attr_form.hidden == "h") {
			orginalHideFormMap[form_combo_form.id][form_attr_form.id] = $.extend(true, {},
					orginalEditFormMap[pageCode][form_combo_form.id][form_attr_form.id]);
			orginalEditFormMap[pageCode][form_combo_form.id][form_attr_form.id].hidden = true;
			orginalHideFormMap[form_combo_form.id][form_attr_form.id].hidden = false;
			orginalHideFormMap[form_combo_form.id][form_attr_form.id].changeHandler = hideChangeAttr;
		}
		nsdialogMore.hide();
		selForm(pageCode);
	}
	// 保存隐藏表单单个输入框属性
	var saveHideAttrChangeFunc = function(pageCode) {
		var form_combo_form = formPlane.getFormJSON("form-combobox");
		var form_attr_form = formPlane.getFormJSON("form-attrchange");
		if (form_attr_form.hidden == "s") {
			delete orginalHideFormMap[form_combo_form.id][form_attr_form.id];
			orginalEditFormMap[pageCode][form_combo_form.id][form_attr_form.id].hidden = false;
			orginalEditFormMap[pageCode][form_combo_form.id][form_attr_form.id].column = parseInt(form_attr_form.column);
			orginalEditFormMap[pageCode][form_combo_form.id][form_attr_form.id].configArea = form_attr_form.configArea;
			orginalEditFormMap[pageCode][form_combo_form.id][form_attr_form.id].label = form_attr_form.label;
		} else if (form_attr_form.hidden == "h") {
			orginalHideFormMap[form_combo_form.id][form_attr_form.id].column = parseInt(form_attr_form.column);
			orginalHideFormMap[form_combo_form.id][form_attr_form.id].configArea = form_attr_form.configArea;
			orginalHideFormMap[form_combo_form.id][form_attr_form.id].label = form_attr_form.label;
		}

		nsdialogMore.hide();
		selForm(pageCode);
	}
	// 保存按钮配置改动数据
	var saveButtonChangeFunc = function(pageCode) {
		loadButtonFunc(undefined, "", pageCode);
		var table_combo_form = formPlane.getFormJSON("form-combobox");
		var dataArr = nsMultiSelect.Json["multi-multi-selectDialog2-msel"].data;
		if (dataArr.length > 0) {
			for (var i = 0; i < dataArr.length; i++) {
				buttonMap[pageCode][table_combo_form.id][dataArr[i].id].orderId = dataArr[i].orderId;
			}
		}
		for ( var buttonId in orginalButtonData[pageCode]) {
			var buttonFlag = true
			for (var i = 0; i < orginalButtonData[pageCode][buttonId].length; i++) {
				var inputFlag = true;
				for ( var a in orginalButtonData[pageCode][buttonId][i]) {
					if (a != "id") {
						if (buttonMap[pageCode][buttonId][orginalButtonData[pageCode][buttonId][i].id][a] != orginalButtonData[pageCode][buttonId][i][a]) {
							inputFlag = false;
							buttonFlag = false
						} else {
							delete buttonMap[pageCode][buttonId][orginalButtonData[pageCode][buttonId][i].id][a]
						}
					}
				}
				if (inputFlag) {
					delete buttonMap[pageCode][buttonId][orginalButtonData[pageCode][buttonId][i].id];
				}
			}
			if (buttonFlag) {
				delete buttonMap[pageCode][buttonId];
			}
		}
		var returnDate = {};
		returnDate.button = {};
		$.each(buttonMap[pageCode], function(key, value) {
			returnDate.button[key] = {};
			returnDate.button[key]['setList'] = $.extend({}, true, value);
		});
		$.ajax({
			dataType : "json",
			type : 'post',
			 url : getRootPath() + '/sysCustomFieldsController/save',
//			url : 'http://localhost:8080/QXQP/sysCustomFieldsController/save',
			data : {
				jsonMap : JSON.stringify(buttonMap[pageCode]),
				controltype : 1,
				pageCode : pageCode
			},
			success : function(data) {
				if (data.success) {
					nsalert("保存成功！");
					// 刷新页面按钮
					var returnShowData = {};
					initButtonConfig(configObj[pageCode].nav, returnDate.button, pageCode);
					$.each(buttonMap[pageCode], function(key, value) {
						returnShowData[key] = convertDataToArry(value);
					});
					var navInitConfig = {};
					for (var navI = 0; navI < configObj[pageCode].nav.length; navI++) {
						var currentNav = $.extend({}, true, configObj[pageCode].nav[navI]);
						if (returnShowData[currentNav.id]) {
							currentNav.btns = returnShowData[currentNav.id];
							nsNav.init(currentNav);
						}
					}
					// 生成配置按钮
					nsNav.initConfigBtn(configObj[pageCode]);
				} else {
					nsalert(data.msg, 'error');
				}
			}
		});

		nsdialog.hide();
	}
	// 保存表格配置改动数据
	var saveTableChangeFunc = function(pageCode) {
		loadTableFunc(undefined, "", pageCode);
		var table_combo_form = formPlane.getFormJSON("form-combobox");
		var dataArr = nsMultiSelect.Json["multi-multi-selectDialog2-msel"].data;
		if (dataArr.length > 0) {
			for (var i = 0; i < dataArr.length; i++) {
				tableMap[pageCode][table_combo_form.id][dataArr[i].field].orderId = dataArr[i].orderId;
			}
		}
		for ( var tableId in orginalTableData[pageCode]) {
			var tableFlag = true
			for (var i = 0; i < orginalTableData[pageCode][tableId].length; i++) {
				var inputFlag = true;
				for ( var a in orginalTableData[pageCode][tableId][i]) {
					if (a != "field") {
						if (typeof (tableMap[pageCode][tableId][orginalTableData[pageCode][tableId][i].field][a]) == "object") {
							if (tableMap[pageCode][tableId][orginalTableData[pageCode][tableId][i].field][a].toString() != orginalTableData[pageCode][tableId][i][a]
									.toString()) {
								inputFlag = false;
								tableFlag = false
							} else {
								delete tableMap[pageCode][tableId][orginalTableData[pageCode][tableId][i].field][a]
							}
						} else {
							if (tableMap[pageCode][tableId][orginalTableData[pageCode][tableId][i].field][a] != orginalTableData[pageCode][tableId][i][a]) {
								inputFlag = false;
								tableFlag = false
							} else {
								delete tableMap[pageCode][tableId][orginalTableData[pageCode][tableId][i].field][a]
							}
						}

					}
				}
				if (inputFlag) {
					delete tableMap[pageCode][tableId][orginalTableData[pageCode][tableId][i].field];
				}
			}
			if (tableFlag) {
				delete tableMap[pageCode][tableId];
			}
		}
		var returnDate = {};
		returnDate.table = {};
		$.each(tableMap[pageCode], function(key, value) {
			returnDate.table[key] = {};
			returnDate.table[key]['setList'] = $.extend({}, true, value);
		});
		$.ajax({
			dataType : "json",
			type : 'post',
			 url : getRootPath() + '/sysCustomFieldsController/save',
//			url : 'http://localhost:8080/QXQP/sysCustomFieldsController/save',
			data : {
				jsonMap : JSON.stringify(tableMap[pageCode]),
				controltype : 3,
				pageCode : pageCode
			},
			success : function(data) {
				if (data.success) {
					nsalert("保存成功！");
					popupBox.hide();
					initTableConfig(configObj[pageCode].tableJson, returnDate.table, pageCode);
					$.each(table[pageCode], function(key, value) {
						var partTableObj = $.extend({}, true, configObj[pageCode].tableConfig[key]);
						partTableObj.columns = table[pageCode][key];
						baseDataTable.table[key].destroy();
						$('#' + partTableObj.data.tableID).html('');
						var columsObj = $.extend(true, [], partTableObj.columns);
						columsObj.sort(function(a, b) {
							return a.orderId - b.orderId;
						});
						console.info(partTableObj.data);
						console.info(columsObj);
						console.info(partTableObj.ui);
						console.info(partTableObj.btns);
						baseDataTable.init(partTableObj.data, columsObj, partTableObj.ui, partTableObj.btns);
					});
				} else {
					nsalert(data.msg);
				}
			}
		});

	}
	// 保存表单配置改动数据
	var saveFormChangeFunc = function(pageCode) {
		for ( var formId in orginalFormData[pageCode]) {
			var formFlag = true;
			$
					.each(
							orginalFormData[pageCode][formId],
							function(key, value) {
								var inputFlag = true;
								$
										.each(
												orginalFormData[pageCode][formId][key],
												function(attr, attrValue) {
													if (typeof (orginalFormData[pageCode][formId][key][attr]) == "object") {
														if (orginalFormData[pageCode][formId][key][attr].toString() == orginalEditFormMap[pageCode][formId][key][attr]
																.toString()) {
															if (attr != "id") {
																delete orginalEditFormMap[pageCode][formId][key][attr];
															}
														} else {
															inputFlag = false;
														}
													} else {
														if (orginalFormData[pageCode][formId][key][attr] == orginalEditFormMap[pageCode][formId][key][attr]) {
															if (attr != "id") {
																delete orginalEditFormMap[pageCode][formId][key][attr];
															}
														} else {
															inputFlag = false;
														}
													}
												});
								if (inputFlag) {
									delete orginalEditFormMap[pageCode][formId][key];
								} else {
									formFlag = false;
								}
							});
			if (formFlag) {
				delete orginalEditFormMap[pageCode][formId];
			}
		}
		var returnDate = {};
		returnDate.form = {};
		var returnDateKeyIDArr = []
		$.each(orginalEditFormMap[pageCode], function(key, value) {
			returnDateKeyIDArr.push(key);
			returnDate.form[key] = {};
			returnDate.form[key]['setList'] = $.extend({}, true, value);
		});
		$.ajax({
			dataType : "json",
			type : 'post',
			 url : getRootPath() + '/sysCustomFieldsController/save',
//			url : 'http://localhost:8080/QXQP/sysCustomFieldsController/save',
			data : {
				jsonMap : JSON.stringify(orginalEditFormMap[pageCode]),
				controltype : 2,
				pageCode : pageCode
			},
			success : function(data) {
				if (data.success) {
					nsalert("保存成功！");
					initFormConfig(configObj[pageCode].formJson, returnDate.form, pageCode);
					$.each(cacheEditFormMap[pageCode], function(key, value) {
						var currentFormJson;
						var currentFormJsonIndex = 0;
						for (var cFormI = 0; cFormI < configObj[pageCode].formJson.length; cFormI++) {
							if (configObj[pageCode].formJson[cFormI].id == key) {
								currentFormJsonIndex = cFormI;
							}
						}
						/*
						 * .form = convertDataToArry(value);
						 */
						var fobj = $.extend({}, true, configObj[pageCode].formJson[currentFormJsonIndex]);
						fobj.form = convertDataToArry(value);
						nsForm.init(fobj);
					});
					popupBox.hide();
				} else {
					nsalert(data.msg);
				}
			}
		});
	}
	// 重置单个按钮或者表格或者表单数组配置
	var resetConfig = function(pageCode, type) {
		var table_combo_form = formPlane.getFormJSON("form-combobox");
		if (table_combo_form.id != "选填" && table_combo_form.id != "") {
			var isConfirm = confirm('您将要删除所有自定义属性，恢复到系统默认值，是否确认？')
			if (isConfirm) {
				var partID = table_combo_form.id;
				var completeFunc = function() {
					nsalert("重置成功");
					popupBox.hide();
				}
				resetConfigAjax(pageCode, type, partID, completeFunc);
			}
		} else {
			nsalert("未选择组件", 'warning');
		}
	}
	var resetConfigAjax = function(pageCode, type, partID, completeFunc) {
		$
				.ajax({
					dataType : "json",
					type : 'post',
					 url : getRootPath() +
					 '/sysCustomFieldsController/deleteByControId',
//					url : 'http://localhost:8080/QXQP/sysCustomFieldsController/deleteByControId',
					data : {
						controlId : partID
					},
					success : function(data) {
						if (data.success) {
							completeFunc();
							if (type == 'nav') {
								var navInitConfig;
								var navIndex;
								initButtonConfig(configObj[pageCode].nav, {}, pageCode);
								for (var navI = 0; navI < configObj[pageCode].nav.length; navI++) {
									if (configObj[pageCode].nav[navI].id == partID) {
										navInitConfig = configObj[pageCode].nav[navI] = configInitData[pageCode].nav[navI];
										navIndex = navI;
									}
								}
								nsNav.init(navInitConfig);
								if (navIndex == 0) {
									nsNav.initConfigBtn(configInitData[pageCode]);
								}
							} else if (type == 'table') {
								baseDataTable.table[partID].destroy();
								var partTableObj = configInitData[pageCode].tableConfig[partID];
								initTableConfig(configObj[pageCode].tableJson, {}, pageCode);
								for (var tableI = 0; tableI < configObj[pageCode].tableJson.length; tableI++) {
									if (configObj[pageCode].tableJson[tableI].id == partID) {
										configObj[pageCode].tableJson[tableI].columns = partTableObj.columns;
									}
								}
								var columsObj = $.extend(true, [], partTableObj.columns);
								columsObj.sort(function(a, b) {
									return a.orderId - b.orderId;
								});
								baseDataTable.init(partTableObj.data, columsObj, partTableObj.ui, partTableObj.btns);
							} else if (type == 'form') {
								var formInitConfig;
								initFormConfig(configObj[pageCode].formJson, {}, pageCode);
								for (var formI = 0; formI < configObj[pageCode].formJson.length; formI++) {
									if (configObj[pageCode].formJson[formI].id == partID) {
										formInitConfig = configObj[pageCode].formJson[formI] = configInitData[pageCode].formJson[formI];
									}
								}
								nsForm.init(formInitConfig);
							}
						} else {
							nsalert(data.msg);
						}
					}
				});
	}
	// 全部恢复默认
	var clearCustomData = function(pageCode) {
		var isConfirm = confirm('您将要删除当前页面的所有自定义配置数据，恢复到系统默认值，是否确认？')
		if (isConfirm) {
			var completeAjaxNum = 0;
			var completeFunc = function() {
				completeAjaxNum++;
				if (totalPartNum == completeAjaxNum) {
					nsalert('全部恢复默认（' + totalPartNum + '）完成');
				}
			}
			var totalPartNum = 0;
			$.each(configObj[pageCode], function(type, value) {
				if (type == 'nav' || type == 'tableJson' || type == 'formJson') {
					totalPartNum++;
					var typeStr = '';
					switch (type) {
					case 'nav':
						typeStr = 'nav'
						break;
					case 'tableJson':
						typeStr = 'table'
						break;
					case 'formJson':
						typeStr = 'form'
						break;
					}

					for (var partI = 0; partI < configObj[pageCode][type].length; partI++) {
						var partID = configObj[pageCode][type][partI].id;
						resetConfigAjax(pageCode, typeStr, partID, completeFunc);
					}
				}
			})

		}
	}
	return {
		init : init,
		initConfig : initConfig,
		initTableConfigPage : initTableConfigPage,
		initButtonConfigPage : initButtonConfigPage,
		initFormConfigPage : initFormConfigPage,
		saveHideAttrChangeFunc : saveHideAttrChangeFunc,
		saveShowAttrChangeFunc : saveShowAttrChangeFunc,
		saveButtonChangeFunc : saveButtonChangeFunc,
		saveTableChangeFunc : saveTableChangeFunc,
		saveFormChangeFunc : saveFormChangeFunc,
		clearCustomData : clearCustomData
	}
})(jQuery);