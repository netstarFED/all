var nsEditorTable = (function($){
	// 保存到服务器的数据
	var saveData = {};
	config = {};
	// 数据验证
	function dataValidation(validata){
		if(typeof(validata.id)=='undefined'){
			validata.id = 'table';
		}
		if(typeof(validata.type)=='undefined'){
			validata.type = 'stateListPanel';
		}
		if(typeof(validata.sourceData)!='object'){
			nsAlert('数据错误');
			return false;
		}
		return true;
	}
	var stateListPanel = {
		// 获得面板容器
		getPanelContainer:function(){
			return $('<div class="row" id="'+config.id+'">'
						+'<div class="col-xs-12" id="'+config.id+'-form"></div>'
						+'<div class="col-xs-12" id="'+config.id+'-tableAndEditor"></div>'
					+'</div>');
		},
		// 获得业务字段下拉列表
		getBusinessSubList:function(_originalContent){
			// 业务对象下拉数组
			var businessList = [];
			// 根据有效的业务对象生成下拉框的数组 
			for(var businessName in _originalContent){
				businessList.push({
					id:businessName,
					name:businessName,
				})
			}
			return businessList;
		},
		// 为saveData中字段没有对应中文的选择中文
		selectChineseName:function(_chineseName,_businessName){
			//获得表单下拉框数据
			var formArr = config.originalContent[_businessName];
			// 配置弹框
			var dialogConfig = {
				id: 	"config-page",
				title: 	'修改配置中文名',
				size: 	"m",
				form: 	[
					{
						id : 'chineseName',
						label : '选择字段',
						type : 'select',
						textField : 'chineseName',
						valueField : 'chineseName',
						subdata : formArr,
					}
				],
				btns:[
					{
						text: 		'确认',
						handler: 	function(){
							var configData = nsForm.getFormJSON('config-page');
							var chineseName = configData.chineseName;
							stateListPanel.refreshSaveData(chineseName,_chineseName,_businessName);
							stateListPanel.setTable.init(_businessName);
							nsAlert('修改成功');
							nsdialog.hide();
						}
					}
				],
			}
			nsdialog.initShow(dialogConfig);
		},
		// 根据中文名字刷新saveData数据
		refreshSaveData:function(newChineseName,oldChineseName,businessName){
			var bueinesArr = config.originalContent[businessName];
			saveData[businessName][newChineseName] = saveData[businessName][oldChineseName];
			delete saveData[businessName][oldChineseName];
			for(index=0;index<bueinesArr.length;index++){
				if(newChineseName == bueinesArr[index].chineseName){
					var obj = {
						chineseName:newChineseName,
						englishName:bueinesArr[index].englishName,
						saveData:saveData[businessName][newChineseName],
					}
					nsComponentEditor.refreshSaveJson(obj);
				}
			}
		},
		// 设置编辑器
		setEditor:function(_editObj){
			var businessName = _editObj.businessName;
			var lineConfig = _editObj.editorData.rowData;
			var businessJson = _editObj.businessJson;
			// 是否编辑过
			var isEditor = false;
			var isHaveSaveBus = false; // 是否保存过业务字段
			if(saveData[businessName]){
				if(saveData[businessName][lineConfig.chineseName]){
					isEditor = true;
					isHaveSaveBus = true;
				}else{
					isHaveSaveBus = true;
				}
			}else{
				isHaveSaveBus = false;
			}
			if(isEditor){
				var baseData = saveData[businessName][lineConfig.chineseName].sourceData;
			}else{
				var baseData = {
					chineseName:lineConfig.chineseName,
					englishName:lineConfig.englishName,
					variableType:lineConfig.variableType,
				};
			}
			if(!isHaveSaveBus){
				saveData[businessName] = {};
			}
			var object = {
				baseData:$.extend(true,{},baseData),
				allData:$.extend(true,{},businessJson),
				id:'editor',
				type:'dialog',
				hideAfterHandler:function(editorData){
					if(editorData){
						var editData = {
							chineseName:editorData.sourceData.chineseName,
							englishName:editorData.sourceData.englishName,
							variableType:editorData.sourceData.variableType,
							isSet:'是',
							displayType:editorData.sourceData.position,
							type:editorData.sourceData.type,
						};
						stateListPanel.setTable.refreshTableLine(editData,_editObj.editorData);
					}
				},
			}
			nsComponentEditor.init(object,saveData[businessName]);
		},
		// 设置表单
		setForm:function(subdataArr){
			// 选择业务字段下拉框配置
			var formJson = {
				id:  		config.id+'-form',
				size: 		"standard",
				format: 	"standard",
				fillbg: 	true,
				form:[
					{
						id:'businessName',
						label:'业务字段',
						type: 'select',
						textField:'name',
						valueField:'id',
						subdata:subdataArr,
						column:12,
						changeHandler:function(id,value){
							config.businessName = id;
							stateListPanel.setTable.init(id);
						}
					}
				]
			}
			formPlane.formInit(formJson);
		},
		// 设置表格
		setTable:{
			data:{},
			column:[
				{
					field:'englishName',
					title:'英文名称',
				},{
					field:'chineseName',
					title:'中文名称',
				},{
					field:'variableType',
					title:'variableType',
				},{
					field:'isSet',
					title:'设置',
				},{
					field:'displayType',
					title:'显示形式',
				},{
					field:'type',
					title:'类型',
				}
			],
			ui:{
				searchTitle: 		"查询",					//搜索框前面的文字，默认为检索
				searchPlaceholder: 	"中文名，英文名",		//搜索框提示文字，默认为可搜索的列名
			},
			btn:{
				selfBtn:[
					{
						text:'保存',
					}
				]
			},
			// 刷新行数据
			refreshTableLine:function(_editData,_rowsData){
				var origalTableData = $.extend(true,{},_rowsData);
				var origalData = baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data();
				for(var key in origalData){
					if(_editData[key]){
						if(_editData[key] != origalData[key]){
							origalData[key] = _editData[key];
						}
					}
				}
				baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data(origalData).draw(false);
			},
			// 获得表格容器
			getTableContainer:function(){
				return $('<div class="col-sm-12 main-panel">'
							+'<div class="panel panel-default">'
								+'<div class="panel-body">'
									+'<div class="table-responsive">'
										+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="'+config.id+'-table">'
										+'</table>'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>');
			},
			// 通过saveData获得表格数据
			getTableDataBySaveData:function(_sourceDataList){
				var sourceDataList = $.extend(true,[],_sourceDataList);
				if(saveData[this.businessName]){ // 判断是否设置过
					var editorAfterTableList = saveData[this.businessName]; // 显示业务字段下编辑过的数据
					for(var chineseName in editorAfterTableList){
						var isChangeName = true; // 是否改变了中文名
						var editorAfterTableLineObj = editorAfterTableList[chineseName].sourceData;
						// 如果在业务字段中没有找到和chineseName相同的名字 说明中文名改变了
						for(var index = 0;index<sourceDataList.length;index++){
							if(chineseName == sourceDataList[index].chineseName){
								isChangeName = false;
								sourceDataList[index].isSet = '是';
								sourceDataList[index].displayType = editorAfterTableLineObj.position;
								sourceDataList[index].type = editorAfterTableLineObj.type;
							}
						}
						// 中文名改变时表格添加列 该列只显示保存字段和保存的中文名子不显示英文名字和variableType
						if(isChangeName){
							sourceDataList.push({
								isSet : '是',
								displayType : editorAfterTableLineObj.position,
								type : editorAfterTableLineObj.type,
								chineseName : chineseName,
							})
						}
					}
				}
				return sourceDataList;
			},
			init:function(businessName){
				$('#'+config.id+'-tableAndEditor').children().remove();
				// 获得表格容器
				this.$container = this.getTableContainer();
				// 插入表格容器
				$('#'+config.id+'-tableAndEditor').append(this.$container);
				// 表格业务字段
				this.businessName = businessName;
				// 获得表格数据
				this.businessJson = config.originalContent[businessName];
				// 根据saveData处理过的数据生成新的表格显示数据（初始：只有englishName/chineseName/variableType/***）
				// 处理后添加 isSet ：是否设置，displayType ：显示形式table/form，type ：类型
				this.tableData = this.getTableDataBySaveData(this.businessJson);
				// 表格配置初始化
				var dataConfig = $.extend(true,{},this.data);
				dataConfig.tableID = config.id + '-table';
				dataConfig.dataSource = this.tableData;
				var columnConfig = $.extend(true,[],this.column);
				columnConfig.push({
					field:'btns',
					title:'操作',
					formatHandler:{
						type: 'button',
						data: [
							{
								"编辑":function(selectLineData){
									if(selectLineData.rowData.englishName == ''){
										stateListPanel.selectChineseName(selectLineData.rowData.chineseName,businessName);
									}else{
										var object = {
											businessName:businessName,
											editorData:selectLineData,
											businessJson:config.originalContent[businessName],

										}
										stateListPanel.setEditor(object);
									}
								}
							}
						]
					}
				});
				var uiConfig = $.extend(true,{},this.ui);
				var btnConfig = $.extend(true,{},this.btn);
				btnConfig.selfBtn[0].handler = function(){
					stateListPanel.saveSaveData();
				};
				// 生成表格
				baseDataTable.init(dataConfig, columnConfig, uiConfig, btnConfig);
			}
		},
		// 保存saveData
		saveSaveData:function(){
			if(!$.isEmptyObject(saveData)){
				$.ajax({
					url:getRootPath()+"/templateMindMaps/save",
					type:"POST",
					dataType:"json",
					data:{
						id:config.sourceData.id,
						xmlDict:JSON.stringify(saveData),
					},
					success:function(data){
						if(data.success){
							nsAlert("保存成功");
						}else{
							nsAlert("保存失败");
						}
					}
				})
			}else{
				nsAlert('没有保存数据');
			}
		},
		init:function(){
			// 获得面板容器 插入容器
			var $container = this.getPanelContainer();
			this.$container = $container;
			$("container").append($container);
			// 获得业务字段下拉列表
			this.subdataArr = this.getBusinessSubList(config.originalContent);
			// 设置表单
			this.setForm(this.subdataArr);
		}
	}
	var funcListPanel = {
		// 获得面板容器
		getPanelContainer:function(){
			return $('<div class="row" id="'+config.id+'">'
						+'<div class="col-xs-12" id="'+config.id+'-form"></div>'
						+'<div class="col-xs-12" id="'+config.id+'-tableAndEditor"></div>'
					+'</div>');
		},
		// 获得业务字段下拉列表
		getBusinessSubList:function(_originalContent){
			// 业务对象下拉数组
			var businessList = [];
			// 根据有效的业务对象生成下拉框的数组 
			for(var businessName in _originalContent){
				businessList.push({
					id:businessName,
					name:businessName,
				})
			}
			return businessList;
		},
		// 根据中文名字刷新saveData数据
		refreshSaveData:function(newChineseName,oldChineseName,businessName){
			var bueinesArr = config.originalContent[businessName];
			saveData[businessName][newChineseName] = saveData[businessName][oldChineseName];
			delete saveData[businessName][oldChineseName];
			for(index=0;index<bueinesArr.length;index++){
				if(newChineseName == bueinesArr[index].chineseName){
					var obj = {
						chineseName:newChineseName,
						englishName:bueinesArr[index].englishName,
						saveData:saveData[businessName][newChineseName],
					}
					nsComponentEditor.refreshSaveJson(obj);
				}
			}
		},
		// 设置编辑器
		setEditor:function(_editObj){
			var obj = {
				id:'editor-panel',
				type:'dialog',
				editorData:_editObj.rowData,
				confirmHandler:function(saveData){
					console.log(saveData);
				},
				hideHandler:function(saveData){
					console.log(saveData);
				},
			};
			// 判断状态是否存在
			if(config.stateListObj[config.businessName].length>0){
				// 根据状态配置展示字段
				obj.functionField = {
					businessName:config.businessName,
					xmlJsonName:config.xmlJsonName,
					stateList:config.stateListObj[config.businessName],
				};
			}
			nsFuncEditor.init(obj);
		},
		// 设置表单
		setForm:function(subdataArr){
			// 选择业务字段下拉框配置
			var formJson = {
				id:  		config.id+'-form',
				size: 		"standard",
				format: 	"standard",
				fillbg: 	true,
				form:[
					{
						id:'businessName',
						label:'业务字段',
						type: 'select',
						textField:'name',
						valueField:'id',
						subdata:subdataArr,
						column:12,
						changeHandler:function(id,value){
							config.businessName = id;
							funcListPanel.setTable.init(id);
						}
					}
				]
			}
			formPlane.formInit(formJson);
		},
		// 设置表格
		setTable:{
			data:{},
			column:[
				{
					field:'englishName',
					title:'英文名称',
				},{
					field:'chineseName',
					title:'中文名称',
				},{
					field:'functionClass',
					title:'functionClass',
				}
			],
			ui:{
				searchTitle: 		"查询",					//搜索框前面的文字，默认为检索
				searchPlaceholder: 	"中文名，英文名",		//搜索框提示文字，默认为可搜索的列名
			},
			btn:{
				selfBtn:[
					{
						text:'保存',
					}
				]
			},
			// 刷新行数据
			refreshTableLine:function(_editData,_rowsData){
				var origalTableData = $.extend(true,{},_rowsData);
				var origalData = baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data();
				for(var key in origalData){
					if(_editData[key]){
						if(_editData[key] != origalData[key]){
							origalData[key] = _editData[key];
						}
					}
				}
				baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data(origalData).draw(false);
			},
			// 获得表格容器
			getTableContainer:function(){
				return $('<div class="col-sm-12 main-panel">'
							+'<div class="panel panel-default">'
								+'<div class="panel-body">'
									+'<div class="table-responsive">'
										+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="'+config.id+'-table">'
										+'</table>'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>');
			},
			// 通过saveData获得表格数据
			getTableDataBySaveData:function(_sourceDataList){
				var sourceDataList = $.extend(true,[],_sourceDataList);
				if(saveData[this.businessName]){ // 判断是否设置过
					var editorAfterTableList = saveData[this.businessName]; // 显示业务字段下编辑过的数据
					for(var chineseName in editorAfterTableList){
						var isChangeName = true; // 是否改变了中文名
						var editorAfterTableLineObj = editorAfterTableList[chineseName].sourceData;
						// 如果在业务字段中没有找到和chineseName相同的名字 说明中文名改变了
						for(var index = 0;index<sourceDataList.length;index++){
							if(chineseName == sourceDataList[index].chineseName){
								isChangeName = false;
								sourceDataList[index].isSet = '是';
								sourceDataList[index].displayType = editorAfterTableLineObj.position;
								sourceDataList[index].type = editorAfterTableLineObj.type;
							}
						}
						// 中文名改变时表格添加列 该列只显示保存字段和保存的中文名子不显示英文名字和variableType
						if(isChangeName){
							sourceDataList.push({
								isSet : '是',
								displayType : editorAfterTableLineObj.position,
								type : editorAfterTableLineObj.type,
								chineseName : chineseName,
							})
						}
					}
				}
				return sourceDataList;
			},
			init:function(businessName){
				$('#'+config.id+'-tableAndEditor').children().remove();
				// 获得表格容器
				this.$container = this.getTableContainer();
				// 插入表格容器
				$('#'+config.id+'-tableAndEditor').append(this.$container);
				// 表格业务字段
				this.businessName = businessName;
				// 获得表格数据
				this.businessJson = config.processContent[businessName];
				// 根据saveData处理过的数据生成新的表格显示数据（初始：只有englishName/chineseName/variableType/***）
				// 处理后添加 isSet ：是否设置，displayType ：显示形式table/form，type ：类型
				this.tableData = this.getTableDataBySaveData(this.businessJson);
				// 表格配置初始化
				var dataConfig = $.extend(true,{},this.data);
				dataConfig.tableID = config.id + '-table';
				dataConfig.dataSource = this.tableData;
				var columnConfig = $.extend(true,[],this.column);
				columnConfig.push({
					field:'btns',
					title:'操作',
					formatHandler:{
						type: 'button',
						data: [
							{
								"编辑":function(selectLineData){
									funcListPanel.setEditor(selectLineData);
								}
							}
						]
					}
				});
				var uiConfig = $.extend(true,{},this.ui);
				var btnConfig = $.extend(true,{},this.btn);
				btnConfig.selfBtn[0].handler = function(){
					stateListPanel.saveSaveData();
				};
				// 生成表格
				baseDataTable.init(dataConfig, columnConfig, uiConfig, btnConfig);
			}
		},
		// 保存saveData
		saveSaveData:function(){
			if(!$.isEmptyObject(saveData)){
				$.ajax({
					url:getRootPath()+"/templateMindMaps/save",
					type:"POST",
					dataType:"json",
					data:{
						id:config.sourceData.id,
						xmlDict:JSON.stringify(saveData),
					},
					success:function(data){
						if(data.success){
							nsAlert("保存成功");
						}else{
							nsAlert("保存失败");
						}
					}
				})
			}else{
				nsAlert('没有保存数据');
			}
		},
		// 获得 方法列表 / 状态列表
		getProcessContent:function(){
			var xmmapJson = config.xmmapJson;
			var xmlJsonName = '';
			var processContent = {};
			var stateListObj = {};
			for(var key in xmmapJson){
				xmlJsonName = key; // 思维导图实体名字
			}
			config.xmlJsonName = xmlJsonName;
			// 获得业务对象列表
			for(businessName in xmmapJson[xmlJsonName]){
				if(nsMindjetToJS.getTags().businessFilterToSystem.indexOf(businessName)>-1){
				}else{
					processContent[businessName] = []; // 方法列表
					var controllerObj = xmmapJson[xmlJsonName][businessName].controller;
					if(controllerObj){
						processContent[businessName] = getControllerObj(controllerObj);
					}
					stateListObj[businessName] = []; // 状态列表
					var stateObj = xmmapJson[xmlJsonName][businessName].state;
					if(stateObj){
						stateListObj[businessName] = getStateObj(stateObj);
					}
				}
			}
			// 根据业务对象名字获得包含的方法
			function getControllerObj(controllerObj){
				var arr = [];
				for(funcType in controllerObj){
					for(funcName in controllerObj[funcType]){
						arr.push(controllerObj[funcType][funcName]);
					}
				}
				return arr;
			}
			// 根据业务对象名字获得包含的状态
			function getStateObj(stateObj){
				var arr = [];
				for(sateName in stateObj){
					arr.push({
						id:sateName,
						name:sateName,
					});
				}
				return arr;
			}
			return {
				processContent:processContent,
				stateListObj:stateListObj,
			};
		},
		init:function(){
			// 处理思维导图数据 生成表格需要的数组 表单需要的下拉框
			config.processContent = this.getProcessContent().processContent;
			config.stateListObj = this.getProcessContent().stateListObj;
			// 获得面板容器 插入容器
			var $container = this.getPanelContainer();
			this.$container = $container;
			$("container").append($container);
			// 获得业务字段下拉列表
			this.subdataArr = this.getBusinessSubList(config.processContent);
			// 设置表单
			this.setForm(this.subdataArr);
		}
	}
	// 根据思维导图的id获得思维导入数据 生成面板
	function getXmmapJsonData(){
		$.ajax({
			url:getRootPath()+"/templateMindMaps/" + config.sourceData.id,
			type:"GET",
			dataType:"json",
			success:function(data){
				if(data.success){
					config.xmmapAllData = data.data;
					if(data.data.jsonContent){
						config.xmmapJson = JSON.parse(data.data.jsonContent);
					}
					if(data.data.originalContent){
						config.originalContent = JSON.parse(data.data.originalContent);
					}
					if(data.data.xmlDict){
						saveData = JSON.parse(data.data.xmlDict);
					}
					// stateListPanel.init();
					editorTableManager[config.type].init();
				}
			}
		});
	}
	var editorTableManager = {
		stateListPanel:stateListPanel,
		funcListPanel:funcListPanel,
	}
	function init(_config){
		/**
		 * sourceData 原始数据
		 * id 配置容器id
		 */
		// 数据验证
		var isTrue = dataValidation(_config);
		if(isTrue){
			config = $.extend(true,{},_config);
			// // 根据思维导图的id获得思维导入数据 生成面板
			getXmmapJsonData();

		}
	}
	return {
		init:init,
		saveData:function(){return saveData},
		stateListPanel:stateListPanel,
	}
})(jQuery)
var nsFuncEditorTable = (function($){})(jQuery)