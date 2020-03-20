
//页面管理工具 列表页面 list cy180622
//version 180627cy
nsProjectPagesManager.pages.voList = (function($) {
	//主要配置参数
	var config = {};
	//初始化入口方法
	function init(_config){
		config = _config;
		//服务器事件初始化
		server.init(config.ajax);
		//初始化页面表格
		listTable.init();
		voMapTable.init('vo');
		//初始化tabs
		voTabs.init('vo');
		//VOData数据表格初始化，默认显示field
		// voDataTable.init('field');  			
		// viewVOPanel.init();
		voDataManager.init();
		// introPanel.init();
		//初始化tabs
		//voTabs.init();
	}
	// 换状态
	function changeDisplayState(stateName){
		switch(stateName){
			case 'vo':
				introPanel.show();
				listTable.show();
				break;
			case 'field':
				introPanel.hide();
				listTable.hide();
				introPanel.hide();
				break;
		}
	}
	//列表配置-------------------------------------------------------------------------------
	var listTable = {
		//表格数据源配置 初始化时获取值
		data:{},  
		//表格列配置
		column:[
			{
				field : 'name',
				title : '思维导图名',
				searchable:true,
				orderable:true,
				width:200,
			},{
				field : 'remark',
				title : '备注',
				searchable: false,
			},{
				field : 'whenCreate',
				title : '新建时间',
				searchable:false,
				width:140,
				formatHandler:{
					type:'date',
					data:{
						formatDate:'YYYY-MM-DD HH:mm:ss'
					}
				}
			},{
				field : 'whenModify',
				title : '修改时间',
				searchable:false,
				width:140,
				formatHandler:{
					type:'date',
					data:{
						formatDate:'YYYY-MM-DD HH:mm:ss'
					}
				}
			},{
				field:'btns',
				title:'操作',
				width:180,
				formatHandler:{
					type: 'button',
					data: []
				}
			}
		],
		//ui配置
		ui:{
			searchPlaceholder: 	"思维导图名",			//搜索框提示文字，默认为可搜索的列名
			isSelectColumns: 	false, 					//是否开启列选择，默认为选择
			isAllowExport: 		false,					//是否允许导出数据，默认允许
			isSingleSelect: true,			 			//是否单选
			pageLengthMenu:5,
			tableHeightType:'strict-compact',
			//行选中则刷新状态表格
			onSingleSelectHandler:function(rowObj){
				var rowData = rowObj.rowData;
				listTable.rowSelectedHandler(rowData.id);
			},
			//加载表格完成后执行 init
			onLoadFilter:function(tableRes){
				//只在init后执行 实际执行默认选中第一行
				if(listTable.isInit){
					//先设置状态
					listTable.isInit = false;
					listTable.currentVoMopId = undefined; //初始化为 undefined 则读取第一行
					var selectRowId = listTable.getSelectRowId(tableRes);
					baseDataTable.setSelectRows(listTable.data.tableID ,selectRowId);
					listTable.rowSelectedHandler(selectRowId);
				}
			},
			//刷新表格后执行 新增，删除会刷新
			onLoadSuccess:function(tableRes){
				console.log('onLoadSuccess')
				var selectRowId = listTable.getSelectRowId(tableRes);
				baseDataTable.setSelectRows(listTable.data.tableID ,selectRowId);
				listTable.rowSelectedHandler(selectRowId);
				baseDataTable.table[listTable.data.tableID].page(0).draw(false)
			}
		},
		//按钮 导入服务器数据和导入XML
		btns:{
			selfBtn:
			[
				{
					text:'导入VO数据',
					handler:function(){
						nsProjectPagesManager.voDataSource.dialogForImport.add();
					}
				},{
					text:'导入思维导图',
					handler:function(){
						importXMLDialog.add();
					}
				},{
					text:'显示说明',
					handler:function(){
						introPanel.switch();
					}
				}
			]
		},
		columnBtns:[
			{
				"导入VO数据":function(rowDatas){
					var rowData = rowDatas.rowData;
					nsProjectPagesManager.voDataSource.dialogForImport.edit(rowData);
				}
			},
			{
				"导入思维导图":function(rowDatas){
					importXMLDialog.edit(rowDatas.rowData);
				}
			},
			{
				"删除":function(rowDatas){
					nsConfirm("确认要删除吗？",function(isdelete){
						if(isdelete){
							var id = rowDatas.rowData.id;
							voMapManager.deleteByVoMapId(id, function(res){
								console.warn(res);
							});
							//若有表格删除显示的表格
							//voDataManager.deleteAjaxHandler(rowDatas.rowData.id);
						}
					},"warning");
				}
			},
			{
				"刷新":function(rowDatas){
					var id = rowDatas.rowData.id;
					//发送ajax获取详细信息
					voDataManager.getDetailById(id, function(res){
						var xmlData = res.xmlContent;
						if(typeof(xmlData) == "string"){
							//重新生成sourceJSON
							nsMindjetToJS.init(xmlData);
							var jsonData = {
								id:id,
								jsonContent:JSON.stringify(nsMindjetToJS.sourceJSJson),
							}
							voDataManager.saveAjaxHander(jsonData, function(res){
								listTable.refresh();
								nsAlert("VO数据刷新成功");
							})
						}
					})
				}
			},{
				"数据及验证":function(rowDatas){
					var id = rowDatas.rowData.id;
					//发送ajax获取详细信息，并显示
					voDataManager.getDetailById(id, function(res){
						console.log(res)
						var xmlData = res.xmlContent;
						if(typeof(xmlData) == "string"){
							nsMindjetToJS.init(xmlData);
							//显示表格
							viewVOPanel.show();
						}else{
							nsAlert("无法获取到xml文件");
						}
					});
				}
			},
			/*,{
				"配置":function(data){
					console.log(data);
					nsProjectPagesManager.pages.voList.changeDisplayState('field');
					var object = {
						id:'nsprojecteditor-fields',
						sourceData:data.rowData,
					}
					nsEditorTable.init(object);
				}
			},{
				"状态列表":function(rowDatas){
					var id = rowDatas.rowData.id;
					//发送ajax获取详细信息
					voDataManager.getDetailById(id, function(res){
						//dialog需要voFields
						setStateDialog.getVO(res);
						//显示状态列表
						voDataTable.show(res);
						//并且选中行
						baseDataTable.setSelectRows(listTable.data.tableID, res.id);
					})
				}
			},{
				"方法":function(data){
					console.log(data);
					nsProjectPagesManager.pages.voList.changeDisplayState('field');
					var object = {
						id:'nsprojecteditor-fields',
						sourceData:data.rowData,
						type:'funcListPanel',
					}
					nsEditorTable.init(object);
				}
			},*/
		],
		currentVoMopId:-1, //当前选中了的voMopId
		//初始化方法
		init:function(){
			//实际使用的是config参数
			this.isInit = true;
			//面板
			this.$panel = $('#'+config.pageDomId.listTablePanelId);
			//需要对listTable的相关属性赋值
			this.data = {
				tableID:config.pageDomId.listTableId,
			
				src:config.ajax.voMapList.getList.url,
				type:config.ajax.voMapList.getList.type,
				dataSrc:config.ajax.voMapList.getList.dataSrc,
			};

			var dataConfig = $.extend(true, {}, this.data);
			var columnConfig = $.extend(true, [], this.column);
			var uiConfig = $.extend(true, {}, this.ui);
			var btnsConfig = $.extend(true, {}, this.btns);
			//添加按钮
			columnConfig[columnConfig.length - 1].formatHandler.data =  $.extend(true, [], this.columnBtns);

			baseDataTable.init(dataConfig, columnConfig, uiConfig, btnsConfig);
		},
		//刷新
		refresh:function(mindMapId){
			this.currentVoMopId = mindMapId;
			baseDataTable.reloadTableAJAX(this.data.tableID);
		},
		//隐藏
		hide:function(){
			this.$panel.hide();
		},
		//显示
		show:function(){
			this.$panel.show();
		},
		// 验证思维导图名字是否重复 若重复不保存 报错
		validataXmlName:function(xmlJsonName){// 保存的思维导图的名字
			var xmlAllDataList = baseDataTable.allTableData(config.pageDomId.listTableId); // 保存过的思维导图列表
			for(var xmlI=0;xmlI<xmlAllDataList.length;xmlI++){
				var savXmlName = xmlAllDataList[xmlI].name;
				if(savXmlName == xmlJsonName){
					return false;
				}
			}
			return true;
		},
		//选中行后的动作
		rowSelectedHandler:function(id){
			//修改表格的当前行id属性
			listTable.currentVoMopId = id;
			//tabs恢复成默认VO
			voTabs.setActiveTab('vo');
			//voMapTable(子表)刷新数据
			voMapTable.refreshDataById(id);
			return ;
		},
		//获取加载完成后选中行的Id
		getSelectRowId:function(tableRes){
			var selectRowId = -1;
			if(typeof(listTable.currentVoMopId) == 'undefined'){
				//没有则赋值
				selectRowId = tableRes[listTable.data.dataSrc][0].id;
				listTable.currentVoMopId = selectRowId
			}else{
				selectRowId = listTable.currentVoMopId;
			}
			return selectRowId;
		},
		//根据ID获取表格数据
		getRowDataById:function(id){
			var tableRowData = {};
			var tableData = baseDataTable.table[this.data.tableID].rows().data();
			for(var i = 0; i<tableData.length;i++){
				if(tableData[i].id == id){
					tableRowData = tableData[i];
				}
			}
			if($.isEmptyObject(tableRowData)){
				nsAlert('没有找到改id对应的行数据，请检查id是否正确');
				console.error(tableData);
				return false;
			}else{
				return tableRowData;
			}
		}
	}

	// 关联页面
	var voMapRelPage = {
		/*tableId:'pageRelTable-table',
		containtId:'pageRelTable',*/
		dialogConfig:{
			id: 				"dialog-pageRel",
			title: 				"关联页面",
			size: 				"m",
			form: [
				{
					type:'hidden',
					id:'id',
				},{
					html: '<div id="pageRelTable">'
							+'<div class="col-sm-12 main-panel">'
								+'<div class="panel panel-default">'
									+'<div class="panel-body">'
										+'<div class="table-responsive">'
											+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="pageRelTable-table">'
											+'</table>'
										+'</div>'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>'
				}
			],
		},
		data:{
			tableID:'',
			dataSource:[],
		},
		column:[
			{
				field : 'name',
				title : '页面名称',
				searchable:true,
				orderable:true,
				width:120,
			},{
				field:'btns',
				title:'操作',
				width:80,
				formatHandler:{
					type: 'button',
					data: []
				}
			}
		],
		ui:{
			isSelectColumns: 	false, 					//是否开启列选择，默认为选择
			isAllowExport: 		false,					//是否允许导出数据，默认允许
			pageLengthMenu: 	10,
			isSingleSelect: 	false,			 			//是否单选
			tableHeightType:'strict-compact',
			isUseTabs:true,
		},
		btns:{
			selfBtn:
			[
				{
					text:'批量刷新',
					handler:function(){
						var tableData = baseDataTable.allTableData('pageRelTable-table');
						var ids = '';
						for(var index=0;index<tableData.length;index++){
							ids += tableData[index].id + ',';
						}
						ids = ids.substring(0,ids.length-1);
						voMapRelPage.allRefresh(ids);
					},
				}
			]
		},
		columnBtns:[
			{
				'刷新':function(rowDatas){
					pageProperty.ajax.refresh(rowDatas.rowData.id);
				}
			}
		],
		allRefresh:function(ids){
			var ajaxData = {
				url:getRootPath()+"/templateMindPages/generate/",
				type:"POST",
				dataType:"json",
				data:{ids:ids},
			}
			nsVals.ajax(ajaxData,function(res){
				nsAlert("刷新成功");
			});
		},
		init:function(pageData){
			var dialogConfig = $.extend(true,{},this.dialogConfig);
			var dataConfig = $.extend(true,{},this.data);
			dataConfig.tableID = "pageRelTable-table";
			dataConfig.dataSource = pageData;
			var columnConfig = $.extend(true,[],this.column);
			columnConfig[columnConfig.length-1].formatHandler.data = this.columnBtns;
			var uiConfig = $.extend(true,{},this.ui);
			var btnsConfig = $.extend(true,{},this.btns);
			dialogConfig.shownHandler = function(){
				if($('#pageRelTable-table').children().length>0){
					uiConfig.$container = $('#pageRelTable');
				}
				baseDataTable.init(dataConfig, columnConfig, uiConfig, btnsConfig);
			}
			nsdialog.initShow(dialogConfig);
		},
	}
	//voMap表格 (子表数据 vo\method\state\pages)------------------------------------------------------
	var voMapTable = {
		nullField:[
			{
				id: 'chineseName',
				label: '中文名',
				type:'text',
				rules:'required',
			},{
				id: 'englishName',
				label: '英文名',
				type:'text',
				rules:'required',
			},{
				id: 'voId',
				label: 'vo',
				type:'select',
				subdata:[],
				rules:'required',
			},{
				id: 'variableType',
				label: 'variableType',
				type:'select',
				rules:'required',
				subdata:[
					{ text:"string",value:"string" },
					{ text:"number",value:"number" },
					{ text:"date",value:"date" },
					{ text:"boolean",value:"boolean" },
				],
			}
		],
		// entityName:'', // 实体名字
		// 临时参数 没用 临时充当读取数据
		processContent:{
			/*
			 * voName : vo 名字
			 * field : 字段
			 * state ：状态
			 * method : 方法
			 */
			vo:[],
			/*
			 * englishName : 英文名
			 * chineseName ：中文名
			 * variableType : 类型 string / number / date / boolean
			 * className ：java 类型
			 * voName: vo名字
			 */
			field:[],
			/*
			 * englishName : 英文名
			 * chineseName : 中文名
			 * suffix : 地址
			 * defaultMode : 类型 dialog / valueDialog / confirm / toPage / changePage / ajaxDialog
			 * dataFormat : 传值方式 id / ids / childIds / object
			 * functionClass ：modal / list
			 * voName: vo名字
			 * data: 传值参数
			 * dataSrc: 数据源
			 * type: ajax类型
			 */
			method:[],
			/*
			 * voName: vo名字
			 * name：状态名
			 * fieldNames ：数组 { english：英文名，chinese：中文名，index：顺序 }
			 * fieldsChineseName : 状态中的字段 中文
			 * stateGroups ：保存分组时存在 没有保存时不存在
			 */
			state:[],
			/*
			 * 
			 */
			pages:[],
		},
		//表格数据源配置 初始化时获取值
		data:{},  
		//表格列配置
		column:{
			// 包含vo
			vo:[
				{
					field : 'name',
					title : 'VO全称',
					searchable:true,
					orderable:true,
					width:120,
				},{
					field : 'voName',
					title : 'VO名称',
					searchable:true,
					orderable:true,
					width:120,
				},{
					field : 'remark',
					title : '备注',
					searchable:true,
					orderable:true,
					width:120,
				},{
					field:'btns',
					title:'操作',
					width:80,
					formatHandler:{
						type: 'button',
						data: []
					}
				}
			],
			//字段
			field:[
				{
					field : 'voName',
					title : 'VO名称',
					searchable:true,
					orderable:true,
					width:120,
				},{
					field : 'chineseName',
					title : '中文名称',
					searchable: true,
					width:120,
				},{
					field : 'englishName',
					title : '字段名称',
					searchable: true,
					width:120,
				},{
					field : 'variableType',
					title : '数据类型',
					searchable: false,
					width:120,
				},{
					field : 'type',
					title : '配置类型',
					searchable: false,
					width:120,
				},{
					field : 'isSet',
					title : '是否已设置',
					searchable: false,
					width:120,
				},{
					field : 'displayType',
					title : '显示形式',
					searchable: false,
					width:120,
				},{
					field:'btns',
					title:'操作',
					width:80,
					formatHandler:{
						type: 'button',
						data: []
					}
				}
			],
			//方法
			method:[
				{
					field : 'voName',
					title : 'VO名称',
					searchable:true,
					orderable:true,
					width:120,
				},{
					field : 'chineseName',
					title : '中文名称',
					searchable:true,
					orderable:true,
					width:120,
				},{
					field : 'englishName',
					title : '英文名称',
					searchable:true,
					orderable:true,
					width:120,
				},
				{
					field : 'suffix',
					title : 'suffix',
					searchable:true,
					orderable:true,
					width:150,
				},
				{
					field : 'functionClass',
					title : '方法属性',
					searchable:true,
					orderable:true,
					width:80,
				},
				{
					field : 'title',
					title : '标题',
					searchable:true,
					orderable:true,
					width:100,
				},{
					field:'btns',
					title:'操作',
					width:80,
					formatHandler:{
						type: 'button',
						data: []
					}
				}
			],
			//状态
			state:[
				{
					field : 'chineseName',
					title : '状态名称',
					searchable:true,
					orderable:true,
					width:120,
				},{
					field : 'englishName',
					title : '英文名称',
					searchable:true,
					orderable:true,
					width:120,
				},{
					field:'voName',
					title : '所处VO',
					searchable: true,
					orderable:true,
					width:200,
				},{
					field : 'fieldsChineseName',
					title : '包含字段',
					searchable: true,
					width:200,
				},{
					field:'btns',
					title:'操作',
					width:80,
					formatHandler:{
						type: 'button',
						data: []
					}
				}
			],
			pages:[
				{
					field : 'voName',
					title : 'VO名称',
					searchable:true,
					orderable:true,
					width:120,
				},
			],
		},
		//ui配置
		ui:{
			isSelectColumns: 	false, 					//是否开启列选择，默认为选择
			isAllowExport: 		false,					//是否允许导出数据，默认允许
			pageLengthMenu: 	10,
			isSingleSelect: 	false,			 			//是否单选
			tableHeightType:'strict-compact',
			isUseTabs:true,
		},
		//按钮 导入服务器数据和导入XML
		btns:{
			vo:{
				selfBtn:
				[
					{
						text:'新增',
						handler:function(){
							var voList = voMapTable.processContent.vo;
							var xmmapConfig = {
								type:'add',
								mindMapId:voList[0].mindMapId,
								entityName:voList[0].entityName,
							};
							voAdd.init(xmmapConfig);
						},
					}
				]
			},
			state:{
				selfBtn:
				[
					{
						text:'保存',
						handler:function(){
							// 保存vo
							var voList = voMapTable.processContent.vo;
							for(var indexI=0;indexI<voList.length;indexI++){
								if(voList[indexI].config2 != null && typeof(voList[indexI].config2) == 'object'){
									var saveVoData = voMapTable.getSaveVoData(voList[indexI]);
									var formatVoData = voMapTable.getFormatSaveData(saveVoData);
									server.voMap.save(formatVoData,function(res){
										// console.log(res);
										nsAlert('保存成功');
									});
								}
							}
							voMapTable.saveXmmapJson();
						},
					},{
						text:'新增状态',
						handler:function(){
							setStateDialog.add();
						},
					}
				]
			},
			field:{
				selfBtn:
				[
					{
						text:'保存',
						handler:function(){
							// 保存vo
							var voList = voMapTable.processContent.vo;
							for(var indexI=0;indexI<voList.length;indexI++){
								if(voList[indexI].config2 != null && typeof(voList[indexI].config2) == 'object'){
									var saveVoData = voMapTable.getSaveVoData(voList[indexI]);
									var formatVoData = voMapTable.getFormatSaveData(saveVoData);
									server.voMap.save(formatVoData,function(res){
										// console.log(res);
										nsAlert('保存成功');
									});
								}
							}
							voMapTable.saveXmmapJson();
						},
					}
					// ,{
					// 	text:'新增空白字段',
					// 	handler:function(){
					// 		var voList = voMapTable.processContent.vo;
					// 		var voSub = [];
					// 		var voSubObj = {};
					// 		for(var voI=0; voI<voList.length; voI++){
					// 			var voCon = {
					// 				text : voList[voI].voName,
					// 				value : voList[voI].id,
					// 			}
					// 			voSub.push(voCon);
					// 			voSubObj[voList[voI].id] = voList[voI];
					// 		}
					// 		var formArr = voMapTable.nullField;
					// 		for(var formI=0; formI<formArr.length; formI++){
					// 			if(formArr[formI].id=="voId"){
					// 				formArr[formI].subdata = voSub;
					// 			}
					// 		}
					// 		var dialogConfig = {
					// 			id: 				"dialog-addnullfield",
					// 			title: 				"新增空字段",
					// 			form:				formArr,
					// 			btns:[
					// 				{
					// 					text: 		'确定',
					// 					handler:  	function(){
					// 						var addFieldConfig = nsdialog.getFormJson("dialog-addnullfield");
					// 						if(addFieldConfig){
					// 							var fieldKey = ['voName','voFullName','entityName'];
					// 							var voId = addFieldConfig.voId;
					// 							var voConfig = voSubObj[voId];
					// 							for(var keyI=0; keyI<fieldKey.length; keyI++){
					// 								addFieldConfig[fieldKey[keyI]] = voConfig[fieldKey[keyI]];
					// 							}
					// 							addFieldConfig.gid = nsTemplate.newGuid();
					// 							addFieldConfig.isHaveChineseName = true;
					// 							delete addFieldConfig.voId;
					// 							// console.log(addFieldConfig);
					// 							voConfig.originalContent.fields.push(addFieldConfig);
					// 							// 保存字段
					// 							if(voConfig.config2 == null){
					// 								voConfig.config2 = {
					// 									fields:{},
					// 									states:[],
					// 								};
					// 							}
					// 							if(typeof(voConfig.config2) != 'object'){
					// 								voConfig.config2 = {
					// 									fields:{},
					// 									states:[],
					// 								};
					// 							}
					// 							var saveVoData = voMapTable.getSaveVoData(voConfig);
					// 							var formatVoData = voMapTable.getFormatSaveData(saveVoData);
					// 							server.voMap.save(formatVoData,function(res){
					// 								nsAlert('保存成功');
					// 							});
					// 							voMapTable.saveXmmapJson();
					// 							nsdialog.hide();
					// 						}
					// 					}
					// 				}
					// 			],
					// 		}
					// 		nsdialog.initShow(dialogConfig);
					// 	},
					// }
				]
			},
			method:{
				selfBtn:
				[
					{
						text:'保存',
						handler:function(){
							// 保存method
							var methodList = voMapTable.processContent.method;
							for(var indexI=0;indexI<methodList.length;indexI++){
								if(methodList[indexI].resJson.config2 != null && typeof(methodList[indexI].resJson.config2) == 'object'){
									if($.isEmptyObject(methodList[indexI].resJson.config2)){
										methodList[indexI].resJson.config2 = undefined;
										continue;
									}
									var saveMethodData = voMapTable.getSaveMethodData(methodList[indexI].resJson);
									var formatMethodData = voMapTable.getFormatSaveData(saveMethodData);
									server.voMap.save(formatMethodData,function(res){
										// console.log(res);
										nsAlert('保存成功');
									});
								}
							}
							voMapTable.saveXmmapJson();
						},
					},{
						text:'新增',
						handler:function(){
							var obj = {
								id:'editor-panel',
								type:'dialog',
								editorData:{},
								stateList:[],
								voList:voMapTable.processContent.vo,
								isAdd:true,//是新增
								hideHandler:function(saveData){
								},
								confirmHandler:function(_saveData){
									if(_saveData){
										var originalContent = {
											englishName:'default',
											chineseName:'',
											ajaxDataVaildConfig:'{}',
											ajaxData:'{}',
											functionClass:'modal',
											defaultMode:'dialog',
											suffix:'',
											dataSrc:'rows',
											type:'GET',
											contentType:'application/x-www-form-urlencoded',
											dataFormat:'object',
											voName:'',
											voFullName:'',
										};
										var saveData = $.extend(true,{},_saveData);
										if(saveData.chineseName == ''){
											saveData.chineseName = saveData.englishName;
										}
										nsVals.setDefaultValues(saveData,originalContent);
										// console.log(saveData);
										var origSaveData = $.extend(true,{},saveData);
										origSaveData.voName = origSaveData.voFullName;
										delete origSaveData.voFullName;
										var saveDataSrc = JSON.stringify(saveData);
										var origSaveDataSrc = JSON.stringify(origSaveData);
										var saveMethodData = {
											category:'method',
											config:saveData.chineseName,
											config2:saveDataSrc,
											mindMapId:saveData.mindMapId,
											name:saveData.englishName,
											originalContent:origSaveDataSrc,
											processContent:saveDataSrc,
											remark:saveData.chineseName,
										}
										var isTrue = voMapTable.valiMethodName(saveMethodData);
										if(isTrue){
											server.voMap.save(saveMethodData,function(res){
												nsAlert('保存成功');
												nsFuncEditor.closeFrame();
												server.voMap.getListById(saveMethodData.mindMapId, function(resList){
													// 刷新vo的remark
													voMapTable.refreshVoRemarkByVoId(saveData.voId, resList, function(){
														// 刷新子表
														voMapTable.refreshDataById(saveMethodData.mindMapId,function(){
															// 刷新思维导图
															voMapTable.getFullXmmapJson(false,function(xmmapJson){
																var saveXmlObj = {
																	id:saveMethodData.mindMapId,
																	jsonContent:JSON.stringify(xmmapJson),
																}
																server.voMapList.save(saveXmlObj);
															});
														});
													});
												});
											});
										}else{
											nsAlert('中文名字或英文名字重复','error');
										}
									}
								},
							};
							nsFuncEditor.init(obj);
						},
					}
				]
			},
		},
		//行按钮
		columnBtns:{
			// 关联页面
			vo:[
				{
					'关联页面':function(rowDatas){
						var voId = rowDatas.rowData.id;
						server.pageRel.getPagesByRel(voId, function(pagesRes){
							if(pagesRes.length == 0){
								nsAlert('该vo没有关联页面');
							}else{
								voMapRelPage.init(pagesRes);
							}
						})
					},
				},{
					'修改':function(rowDatas){
						voMapTable.getVoByVoTableRowData(rowDatas,function(voObj){
							var xmmapConfig = {
								type:'edit',
								mindMapId:voObj.mindMapId,
								entityName:voObj.entityName,
								sourceVo:$.extend(true,{},voObj)
							};
							voAdd.init(xmmapConfig);
						});
					},
				},{
					'删除':function(rowDatas){
						voMapTable.getVoByVoTableRowData(rowDatas,function(voObj){
							var xmmapConfig = {
								type:'delete',
								id:voObj.id,
								mindMapId:voObj.mindMapId,
								sourceVo:$.extend(true,{},voObj)
							};
							voAdd.init(xmmapConfig);
						});
					},
				}
			],
			state:[
				{
					"编辑":function(rowDatas){
						var values = $.extend(true, {}, rowDatas.rowData);
						delete values.id;
						delete values.btns;
						values.index = rowDatas.rowIndexNumber;
						setStateDialog.edit(values);
					}
				},
				{
					"分组":function(rowDatas){
						var values = $.extend(true, {}, rowDatas.rowData);
						delete values.id;
						delete values.btns;
						values.index = rowDatas.rowIndexNumber;
						setStateDialog.stateGroups.init(values);
					}
				},
				{
					"重置":function(rowDatas){
						var values = $.extend(true, {}, rowDatas.rowData);
						delete values.id;
						delete values.btns;
						values.index = rowDatas.rowIndexNumber;
						// 重置fields字段
						setStateDialog.stateFieldsEdit.init(values);
					}
				},
				{
					"其他功能":function(rowDatas){
						var values = $.extend(true, {}, rowDatas.rowData);
						delete values.id;
						delete values.btns;
						values.index = rowDatas.rowIndexNumber;
						var isTrue = true; // 表格状态不用设置
						if(values.stateGroups){
							if(values.stateGroups.stateType=='table'){
								isTrue = false;
							}
						}
						if(isTrue){
							// 添加label/title/html/note/hr/br
							setStateDialog.addSpecialField.init(values);  // 添加特殊的字段
						}else{
							nsAlert('只有表单才可以设置','error');
							return false;
						}
					}
				},
				{
					"删除":function(rowDatas){
						var values = $.extend(true, {}, rowDatas.rowData);
						delete values.id;
						delete values.btns;
						values.index = rowDatas.rowIndexNumber;
						//实际执行的是删除
						setStateDialog.delete(values);

					}
				}
			],
			field:[
				{
					"编辑":function(rowDatas){
						var rowData = rowDatas.rowData;
						if(rowData.englishName == ''){
							// nsEditorTable.stateListPanel.selectChineseName(rowDatas.rowData.chineseName,businessName);
						}else{
							var baseData = $.extend(true,{},rowData);
							delete baseData.id;
							delete baseData.btns;
							var vo = voMapTable.getVoById(baseData.gid,'vo');
							if(!vo){
								nsAlert('无法找到vo','error');
								return false;
							}
							// baseData = voMapTable.getEditData(baseData,vo);
							var object = {
								baseData:$.extend(true,{},baseData),
								allData:vo.originalContent.fields,
								id:'editor',
								type:'dialog',
								hideHandler:function(editorData){
									// console.log(editorData);
									if(editorData){
										// voMapTable.refreshTableLine(editorData,rowDatas);
									}
								},
								confirmHandler:function(saveData){
									if(saveData){
										console.log(saveData);
										if(vo.config2 == null || typeof(vo.config2)=='undefined'){
											if(vo.category == 'vo'){
												vo.config2 = {
													fields:{},
													states:[],
												}
											}else{
												vo.config2 = {}
											}
										}else{
											if(typeof(vo.config2) == 'string'){
												vo.config2 = JSON.parse(vo.config2)
											}
										}
										vo.config2.fields[saveData.gid] = saveData;
										vo.processData.fieldsByGid[saveData.gid] = saveData;
										nsComponentEditor.closeFrame();
										voMapTable.refreshTableLine(saveData,rowDatas);
										nsAlert('添加成功');
									}
								},
							}
							nsComponentEditor.init(object);
						}
					}
				},{
					"编辑2":function(rowDatas){
						var rowData = rowDatas.rowData;
						if(rowData.englishName == ''){
							// nsEditorTable.stateListPanel.selectChineseName(rowDatas.rowData.chineseName,businessName);
						}else{
							var baseData = $.extend(true,{},rowData);
							delete baseData.id;
							delete baseData.btns;
							var vo = voMapTable.getVoById(baseData.gid,'vo');
							if(!vo){
								nsAlert('无法找到vo','error');
								return false;
							}
							var object = {
								baseData:$.extend(true,{},baseData),
								allData:vo.originalContent.fields,
								id:'editor',
								type:'dialog',
								hideHandler:function(editorData){},
								confirmHandler:function(saveData){
									if(saveData){
										console.log(saveData);
										if(vo.config2 == null || typeof(vo.config2)=='undefined'){
											if(vo.category == 'vo'){
												vo.config2 = {
													fields:{},
													states:[],
												}
											}else{
												vo.config2 = {}
											}
										}else{
											if(typeof(vo.config2) == 'string'){
												vo.config2 = JSON.parse(vo.config2)
											}
										}
										vo.config2.fields[saveData.gid] = saveData;
										vo.processData.fieldsByGid[saveData.gid] = saveData;
										NetstarComponentEditor.closeFrame();
										voMapTable.refreshTableLine(saveData,rowDatas);
										nsAlert('添加成功');
									}
								},
							}
							NetstarComponentEditor.init(object);
						}
					}
				}
			],
			method:[
				{
					"编辑":function(rowDatas){
						var rowData = rowDatas.rowData;
						var baseData = $.extend(true,{},rowData);
						// delete baseData.id;
						delete baseData.btns;
						var methodObj = voMapTable.getMethodById(baseData.id);
						if(!methodObj){
							nsAlert('无法找到方法','error');
							return false;
						}
						// baseData.mindMapId = methodObj.resJson.mindMapId; // 思维导图id
						// baseData.entityName = listTable.getRowDataById(baseData.mindMapId).name; // 实体名字
						baseData = $.extend(true,{},methodObj);
						delete baseData.resJson;
						delete baseData.btns;
						baseData = voMapTable.getEditData(baseData,methodObj.resJson);
						var vo = voMapTable.getVoByVoId(methodObj.voId);
						if(!vo){
							var stateList = [];
						}else{
							var stateList = vo.processData.states;
						}
						var obj = {
							id:'editor-panel',
							type:'dialog',
							editorData:baseData,
							stateList:stateList,
							hideHandler:function(saveData){
								// 刷新表格行数据
								if(saveData){
									voMapTable.refreshTableLine(saveData,rowDatas);
								}
							},
							confirmHandler:function(saveData){
								if(saveData){
									console.log(saveData);
									if(saveData.voName.indexOf('.')>0){
										saveData.voName = voMapManager.getShortName(saveData.voName);
									}
									methodObj.resJson.config2 = saveData;
									for(var methodKey in saveData){
										methodObj[methodKey] = saveData[methodKey];
									}
									nsFuncEditor.closeFrame();
									voMapTable.refreshTableLine(saveData,rowDatas);
									nsAlert('添加成功');
								}
							},
						};
						nsFuncEditor.init(obj);
					}
				},{
					"删除":function(rowDatas){
						var methodId = rowDatas.rowData.id;
						nsConfirm('是否确认删除当前方法'+rowDatas.rowData.chineseName, function(isConfirm){
							if(isConfirm){
								server.voMap.deleteById(methodId,function(res){
									nsAlert('删除成功');
									server.voMap.getListById(rowDatas.rowData.mindMapId, function(resList){
										// 刷新vo的remark
										voMapTable.refreshVoRemarkByVoId(rowDatas.rowData.voId, resList, function(){
											// 刷新子表
											voMapTable.refreshDataById(rowDatas.rowData.mindMapId,function(){
												// 刷新思维导图
												voMapTable.getFullXmmapJson(false,function(xmmapJson){
													var saveXmlObj = {
														id:rowDatas.rowData.mindMapId,
														jsonContent:JSON.stringify(xmmapJson),
													}
													server.voMapList.save(saveXmlObj);
												});
											});
										});
									});
								});
							}
						}, 'warning')
						
					}
				}
			],
		},
		// 关联页面表格 通过行数据查询vo 并根据config3判断执行过程
		getVoByVoTableRowData:function(rowDatas,callback){
			var voId = rowDatas.rowData.id;
			var voList = voMapTable.processContent.vo;
			var voObj = {};
			for(var voI=0;voI<voList.length;voI++){
				if(voList[voI].id == voId){
					voObj = voList[voI];
				}
			}
			var config3 = voObj.config3;
			if(typeof(config3)=='string'){
				config3 = JSON.parse(config3);
			}
			if(config3!=null){
				switch(config3.source){
					case 'user':
						if(typeof(callback)=='function'){
							callback(voObj);
						}
						break;
					default:
						nsAlert('默认vo不允许操作','warning');
						break;
				}
			}else{
				nsAlert('默认vo不允许操作','warning');
			}
		},
		// 验证方法的中英文名字是否重复
		valiMethodName:function(methodObj){
			var methodArr = this.processContent.method;
			var isTrue = true;
			for(var methodI=0;methodI<methodArr.length;methodI++){
				if(methodObj.name==methodArr[methodI].englishName || methodObj.remark==methodArr[methodI].chineseName){
					console.error(methodObj);
					console.error(methodArr[methodI]);
					isTrue = false;
					break;
				}
			}
			return isTrue;
		},
		// 验证vo的中英文名字是否重复
		valiVoName:function(voOBj){
			var voArr = this.processContent.vo;
			var isTrue = true;
			for(var voI=0;voI<voArr.length;voI++){
				if(voOBj.name==voArr[voI].voName && voOBj.id!=voArr[voI].id){
					console.error(voOBj);
					console.error(voArr[voI]);
					isTrue = false;
					break;
				}
			}
			return isTrue;
		},
		// 保存思维导图
		saveXmmapJson:function(){
			var voList = voMapTable.processContent.vo;
			this.getFullXmmapJson(false,function(xmmapJson){
				var saveXmlObj = {
					id:voList[0].mindMapId,
					jsonContent:JSON.stringify(xmmapJson),
				}
				server.voMapList.save(saveXmlObj,function(res){
					console.log(res);
					listTable.refresh(res.id);
					nsAlert('保存成功');
				});
			});
		},
		// 获得完整的思维导图json数据
		getFullXmmapJson:function(isXml,callBack){
			isXml = typeof(isXml)=='boolean'?isXml:false;
			var voList = voMapTable.processContent.vo;
			// 保存思维导图
			var xmmapJson = voMapTable.getXmmapJsonByVOMet(isXml);
			console.log(xmmapJson);
			var statesNameJson = this.statesNameJson;
			nsProjectPagesManager.pages.voList.server.voMap.mindMap(voList[0].mindMapId,function(res){
				var sourceXmmapJson = JSON.parse(res); // 原始的思维导图json数据
				var entityName = '';
				for(var keyName in xmmapJson){
					entityName = keyName;
				}
				// 添加 system，system，default
				var defXmlDataNameArr = ['system','pages','default'];
				for(var indexI=0;indexI<defXmlDataNameArr.length;indexI++){
					if(sourceXmmapJson[entityName][defXmlDataNameArr[indexI]]){
						xmmapJson[entityName][defXmlDataNameArr[indexI]] = sourceXmmapJson[entityName][defXmlDataNameArr[indexI]];
					}
				}
				if(typeof(callBack)=='function'){
					callBack(xmmapJson,statesNameJson);
				}
			})
		},
		// 根据vo/method获得json
		getXmmapJsonByVOMet:function(isXml){
			var formatVoList = []; // 格式化后的vo数据
			var formatMethodList = []; // 格式化后的method数据
			var voList = $.extend(true,[],this.processContent.vo); // vo数据
			var methodList = $.extend(true,[],this.processContent.method);  // 方法数据
			for(var indexI=0;indexI<voList.length;indexI++){
				// 判断config2
				if(typeof(voList[indexI].config2) == "string" && voList[indexI].config2.length == 0){
					voList[indexI].config2 = null;
				}
				if(voList[indexI].config2 == null || typeof(voList[indexI].config2) == 'undefined'){
					// var formatObj = voList[indexI];
					voList[indexI].config2 = {
						fields:{},
						states:[],
					}
				}else{
					if(typeof(voList[indexI].config2) != 'object'){
						voList[indexI].config2 = JSON.parse(voList[indexI].config2);
					}
				}
				if(isXml){
					var formatObj = this.getSaveVoData(voList[indexI]); // 获得格式化的vo数据 只有fields 没有区分表单表格
				}else{
					var formatObj = this.getSaveXmmapVoData(voList[indexI]); // 获得格式化的vo数据
				}
				formatVoList.push(formatObj);
			}
			for(var indexI=0;indexI<methodList.length;indexI++){
				// 判断config2
				if(typeof(methodList[indexI].resJson.config2) == "string" && methodList[indexI].resJson.config2.length == 0){
					methodList[indexI].resJson.config2 = null;
				}
				if(methodList[indexI].resJson.config2 == null || methodList[indexI].resJson.config2 == 'null' || typeof(methodList[indexI].resJson.config2) == 'undefined'){
					var formatObj = methodList[indexI].resJson;
				}else{
					if(typeof(methodList[indexI].resJson.config2) != 'object' || $.isEmptyObject(methodList[indexI].resJson.config2)){
						methodList[indexI].resJson.config2 = JSON.parse(methodList[indexI].resJson.config2);
					}
					var formatObj = this.getSaveMethodData(methodList[indexI].resJson); // 获取格式化的method数据
				}
				formatMethodList.push(formatObj);
			}
			var sourceXmmapJsonData = listTable.getRowDataById(formatVoList[0].mindMapId); // 当前行数据 即思维导图相关数据
			// var sourceXmmapJson = JSON.parse(sourceXmmapJsonData.jsonContent); // 原始的思维导图json数据
			var entityName = sourceXmmapJsonData.name; // 获取 实体名字
			// 状态名对象
			var statesNameJson = {};
			// 定义json数据
			var xmmapJson = {};
			// 添加第一层 （实体层）
			xmmapJson[entityName] = {};
			// 添加 system，system，default
			/*var defXmlDataNameArr = ['system','pages','default'];
			for(var indexI=0;indexI<defXmlDataNameArr.length;indexI++){
				if(sourceXmmapJson[entityName][defXmlDataNameArr[indexI]]){
					xmmapJson[entityName][defXmlDataNameArr[indexI]] = sourceXmmapJson[entityName][defXmlDataNameArr[indexI]];
				}
			}*/
			var xmmapJsonData = xmmapJson[entityName];
			// 循环格式化后的vo添加voName以及包含的字段和状态
			for(var indexI=0;indexI<formatVoList.length;indexI++){
				xmmapJsonData[formatVoList[indexI].voName] = {};
				var voJson = xmmapJsonData[formatVoList[indexI].voName];
				statesNameJson[formatVoList[indexI].voName] = {}
				var voProcessContent = formatVoList[indexI].processContent;
				// 处理columns/fields/states
				for(var typeName in voProcessContent){
					var manageArr = voProcessContent[typeName];
					switch(typeName){
						case 'fields':
							voJson.fields = this.getFormatFields(manageArr);
							break;
						case 'columns':
							voJson.columns = this.getFormatColumns(manageArr);
							break;
						case 'states':
							// 获得状态json数据 与思维导图无关 为了拼xml导出的思维导图文件
							for(var stateI=0;stateI<manageArr.length;stateI++){
								statesNameJson[formatVoList[indexI].voName][manageArr[stateI].englishName] = manageArr[stateI];
							}
							// 思维导图状态获得
							voJson.state = this.getFormatState(manageArr);
							break;
					}
				}
			}
			// 循环格式化后的method添加controller
			for(var indexI=0;indexI<formatMethodList.length;indexI++){
				var souMethod = formatMethodList[indexI].processContent;
				// 根据voName确定是哪个voName，englishName确定方法名，className确定方法类别
				// 判断voName，englishName，className是否设置；若voName/englishName没有不处理，className将根据默认值modal设置
				if(typeof(souMethod.voName)=='undefined'||typeof(souMethod.englishName)=='undefined'){
					nsAlert('前端配置错误');
					console.warn(souMethod);
					break;
				}
				if(typeof(souMethod.functionClass)=='undefined' || souMethod.functionClass == ''){
					souMethod.functionClass = 'modal';
				}
				/*
				 * 方法包含的属性
				 * ajaxData
				 * ajaxDataVaildConfig
				 * btntext
				 * contentType
				 * dataFormat
				 * dataSrc
				 * defaultMode
				 * functionClass
				 * functionField
				 * functionIntro
				 * id
				 * suffix
				 * text
				 * title
				 * type
				 * voName
				 * entityName
				 * chineseName
				 * width
				 * height
				 * englishName
				 * isCloseWindow
				 * callbackAjax
				 * dataLevel
				 * componentName
				 * btnType
				 * textField
				 * valueField
				 * isMainDbAction
				 * requestSource
				 * editorType
				 * isCopyObject
				 * keyField 
				 * isAlwaysNewTab
				 * isEditMode
				 * isInlineBtn
				 * disabledExpression
				 * parameterFormat
				 * sourceField 
				 * isReadonly
				 * validateParams
				 * formatValueData
				 * getDataByAjax
				 * successMsg 
				 * successOperate
				 * matrixVariable
				 * listName
				 * isSendPageParams
				 * getPageDataExpression
				 * isIsSave
				 * isMobileInlineBtn
				 * templateId 
				 * shortcutKey 
				 * isKeepSelected 
				 */
				var defMethod = {
					ajaxData:{},
					ajaxDataVaildConfig:'',
					btntext:'',
					contentType:'',
					dataFormat:'',
					dataSrc:'',
					defaultMode:'',
					functionClass:'',
					functionField:'',
					functionIntro:'',
					id:-1,
					suffix:'',
					text:'',
					title:'',
					type:'',
					voName:'',
					entityName:'',
					chineseName:'',
					englishName:'',
					width:0,
					height:0,
					isCloseWindow:false,
					callbackAjax:'',
					dataLevel:'',
					componentName:'',
					webSocketUrl:'',
					btnType:'',
					textField:'',
					valueField:'',
					isMainDbAction:false,
					requestSource:"",
					editorType:"",
					keyField:"",
					isAlwaysNewTab:false,
					isEditMode:true,
					isInlineBtn:false,
					disabledExpression:'',
					isHaveSaveAndAdd : true,
					parameterFormat : '',
					sourceField : '',
					isCopyObject : false,
					isReadonly : false,
					validateParams : '',
					formatValueData : '',
					getDataByAjax : {},
					successMsg : '',
					successOperate : '',
					draftFields : '',
					btnsConfig : ['isUseSave', 'isUseSaveSubmit', 'isUseDraft'],
					matrixVariable : '',
					listName : '',
					isSendPageParams : true,
					getPageDataExpression : {},
					isIsSave : false,
					isMobileInlineBtn : true,
					uploadAjax : {},
					importAjax : {},
					columns : '',
					templateId : '',
					shortcutKey : '',
					isKeepSelected : false,
				}
				var formatMethode = {};
				for(var typeName in defMethod){
					if(souMethod[typeName] || souMethod[typeName] === false){
						if(typeof(souMethod[typeName])==typeof(defMethod[typeName])){
							formatMethode[typeName] = souMethod[typeName];
							if(typeName == 'ajaxData'){
								formatMethode.data = formatMethode[typeName];
							}
						}else{
							switch(typeName){
								case 'width':
								case 'height':
									formatMethode[typeName] = souMethod[typeName];
									break;
								case 'ajaxData':
									if(typeof(souMethod[typeName])=='string' && souMethod[typeName]!=''){
										formatMethode[typeName] = JSON.parse(souMethod[typeName]);
										formatMethode.data = formatMethode[typeName];
									}else{
										console.warn('方法属性：'+typeName+'类型错误');
									}
									break;
								default:
									console.warn('方法属性：'+typeName+'类型错误');
									break;
							}
						}
					}else{
						// console.warn('方法没有设置：'+typeName+'属性');
					}
				}
				if(typeof(xmmapJsonData[souMethod.voName])=='undefined'){
					console.error('方法所在vo:'+souMethod.voName+',不存在,该方法无效');
					console.error(souMethod);
					continue;
				}
				if(typeof(xmmapJsonData[souMethod.voName].controller)=='undefined'){
					xmmapJsonData[souMethod.voName].controller = {};
				}
				if(typeof(xmmapJsonData[souMethod.voName].controller[souMethod.functionClass])=='undefined'){
					xmmapJsonData[souMethod.voName].controller[souMethod.functionClass] = {};
				}
				xmmapJsonData[souMethod.voName].controller[souMethod.functionClass][souMethod.englishName] = formatMethode;
			}
			this.statesNameJson = statesNameJson;
			return xmmapJson;
		},
		// 获得格式化的fields
		getFormatFields:function(fields){
			var fieldsObj = {};
			for(var fieldsI=0;fieldsI<fields.length;fieldsI++){
				if(typeof(fields[fieldsI].id)=='undefined' || fields[fieldsI].id == ''){
					fields[fieldsI].id = fields[fieldsI].englishName;
				}
				if(typeof(fields[fieldsI].label)=='undefined' || fields[fieldsI].label == ''){
					fields[fieldsI].label = fields[fieldsI].chineseName;
				}
				if(typeof(fields[fieldsI].type)=='undefined' || fields[fieldsI].type == ''){
					// fields[fieldsI].type = 'text';
					switch(fields[fieldsI].variableType){
						case 'date':
							fields[fieldsI].type = 'date';
							break;
						default:
							fields[fieldsI].type = 'text';
							break;
					}
				}
				fieldsObj[fields[fieldsI].id] = fields[fieldsI];
			}
			return fieldsObj;
		},
		// 获得格式化的fields
		getFormatColumns:function(columns){
			var columnsObj = {};
			for(var columnsI=0;columnsI<columns.length;columnsI++){
				if(typeof(columns[columnsI].field)=='undefined' || columns[columnsI].field == ''){
					columns[columnsI].field = columns[columnsI].englishName;
				}
				if(typeof(columns[columnsI].title)=='undefined' || columns[columnsI].title == ''){
					columns[columnsI].title = columns[columnsI].chineseName;
				}
				// width转化为数字 字段配置那已转化 这里是为了转化已保存的字段
				if(typeof(columns[columnsI].width)=='string'){
					columns[columnsI].width = parseInt(columns[columnsI].width);
					if(columns[columnsI].width == NaN){
						delete columns[columnsI].width
					}
				}
				columnsObj[columns[columnsI].field] = columns[columnsI];
			}
			return columnsObj;
		},
		// 获取格式化的思维导图的state数据
		getFormatState:function(states){
			var statesData = {};
			for(var indexI=0;indexI<states.length;indexI++){
				var stateObj = states[indexI];
				if(stateObj.field){
					statesData[stateObj.englishName] = {};
					statesData[stateObj.englishName].field = this.getStateObjByArr(stateObj.field);
					if(stateObj['field-more']){
						statesData[stateObj.englishName]['field-more'] = this.getStateObjByArr(stateObj['field-more']);
					}
					if(stateObj['field-sever']){
						statesData[stateObj.englishName]['field-sever'] = this.getStateObjByArr(stateObj['field-sever']);
					}
				}else{
					if(stateObj.tabs){
						statesData[stateObj.englishName] = {}
						statesData[stateObj.englishName].tabs = this.getStateObjByArr(stateObj.tabs);
					}else{
						console.error(stateObj);
						nsAlert('没有状态字段');
					}
				}
			}
			return statesData;
		},
		// 通过数组获得对象即 [{english:''}] --> {english:{}}
		getStateObjByArr:function(arr){
			var obj = {};
			for(indexI=0;indexI<arr.length;indexI++){
				obj[arr[indexI].englishName] = arr[indexI];
			}
			return obj;
		},
		// 获取格式化后的保存数据 根据 method/vo 对象
		getFormatSaveData:function(obj){
			/**
			 * 	   Long   id; 				//vo或者方法的id
			 *	   Long   mindMapId; 		//voMap或者思维导图的id 保存时必须有
			 *	   Long   parentId; 		//上级id，暂时没用
			 *	   String name; 			//名称
			 *	   String category; 		//分类  目前可以使用的是vo/method
			 *	   String remark; 			//备注  vo保存的是字段、关联方法、状态的数量
			 *
			 *	   String originalContent;  //原始数据 对服务器返回的VOMAP解析后产生的数据
			 *	   String processContent; 	//加工后的数据
			 *	   String config; 			//
			 *	   String config2;
			 *	   String config3;
			*/
			var saveAjaxData = {
				id:-1,
				// parentId:null,
				mindMapId:-1,
				name:'',
				category:'',
				remark:'',
				originalContent:'',
				processContent:'',
				config:'',
				config2:'',
				// config3:null,
			}
			//赋值
			for(var key in saveAjaxData){
				var keyValue = obj[key];
				switch(key){
					case 'config2':
					case 'originalContent':
					case 'processContent':
						keyValue = JSON.stringify(keyValue);
						break;
				}
				/*if(typeof(saveAjaxData[key]) == typeof(keyValue)){
					//对了
				}else{
					console.error('key：'+key);
					console.error(obj);
				}*/
				saveAjaxData[key] = keyValue;
			}
			// console.log(saveAjaxData);
			return saveAjaxData;
		},
		// 获取保存的method数据
		getSaveMethodData:function(_methodObj){
			var methodObj = $.extend(true,{},_methodObj);
			var formatMethodDate = nsFuncEditor.getFormatData(methodObj.config2);
			if(formatMethodDate.voName.indexOf('.')){
				formatMethodDate.voName = voMapManager.getShortName(formatMethodDate.voName);
			}
			methodObj.processContent = $.isEmptyObject(formatMethodDate)?methodObj.processContent:formatMethodDate;
			return methodObj;
		},
		// 获取保存的vo数据
		getSaveVoData:function(_vo){
			var vo = $.extend(true,{},_vo);
			var originalContentField = vo.originalContent.fields; 			// 原始的field数据
			var config2 = vo.config2;										// 编辑的field数据
			vo.processContent.fields = [];									// 保存格式化的xmljson数据的fields
			for(var indexI=0;indexI<originalContentField.length;indexI++){
				if(config2.fields[originalContentField[indexI].gid]){
					var fieldEdit = config2.fields[originalContentField[indexI].gid]; // 编辑的数据
					vo.processContent.fields.push(fieldEdit);
				}else{
					vo.processContent.fields.push(originalContentField[indexI]);
				}
			}
			// 保存状态
			this.setSaveXmmapVoStateData(vo);
			return vo;
		},
		// 获取保存的xmlJsonvo数据
		getSaveXmmapVoData:function(_vo){
			var vo = $.extend(true,{},_vo);
			var originalContentField = vo.originalContent.fields; 			// 原始的field数据
			var config2 = vo.config2;										// 编辑的field数据
			vo.processContent.fields = [];									// 保存格式化的xmljson数据的fields
			vo.processContent.columns = [];									// 保存格式化的xmljson数据的columns
			// 循环所有fields数据根据config2判断是否编辑 若编辑了根据编辑值设置vo.processContent 若没编辑默认fields
			for(var indexI=0;indexI<originalContentField.length;indexI++){
				if(config2.fields[originalContentField[indexI].gid]){
					var fieldEdit = config2.fields[originalContentField[indexI].gid]; // 编辑的数据
					if(fieldEdit.editBtnName == "edit2"){
						var formatEditorData = NetstarComponentEditor.getFormatData(fieldEdit);
					}else{
						var formatEditorData = nsComponentEditor.getFormatData(fieldEdit);
					}
					// 根据 displayType 判断显示类型
					switch(formatEditorData.displayType){
						case 'all':
							var editForm = formatEditorData.form;
							var editTable = formatEditorData.table;
							vo.processContent.fields.push(editForm);
							vo.processContent.columns.push(editTable);
							break;
						case 'table':
							var editTable = formatEditorData.table;
							vo.processContent.columns.push(editTable);
							break;
						case 'form':
							var editForm = formatEditorData.form;
							vo.processContent.fields.push(editForm);
							break;
					}
				}else{
					vo.processContent.fields.push(originalContentField[indexI]);
					vo.processContent.columns.push(originalContentField[indexI]);
				}
			}
			// 保存状态
			// 查询默认状态
			this.setSaveXmmapVoStateData(vo);
			return vo;
		},
		// 设置保存的vo状态
		setSaveXmmapVoStateData:function(vo){
			var config2 = vo.config2;	// 编辑的field数据
			// 查询默认状态
			var defaultState = vo.processContent.states[0];
			vo.processContent.states = [];
			vo.processContent.states[0] = defaultState;
			var config2States = config2.states;
			for(var index=0;index<config2States.length;index++){
				// if(config2States[index].type == 'addGroups'){
				if(config2States[index].stateGroups){
					var formatState = $.extend(true,{},setStateDialog.formatStateDataByEditStateGroups(config2States[index]));
				}else{
					var formatState = $.extend(true,{},setStateDialog.formatStateDataByEditFieldNames(config2States[index]));
				}
				if(config2States[index].editFields){
					// 根据gid生成对象 属性值包括显示状态 'field'/'field-more'/'tabs'
					var fieldsObj = {};
					// 分别在field/field-more/tabs中查询 是否有编辑的
					var validObjArr = ['field','field-more','field-sever','tabs'];
					for(var vaI=0;vaI<validObjArr.length;vaI++){
						if(formatState[validObjArr[vaI]]){
							this.setformatStateFields(formatState[validObjArr[vaI]],config2States[index].editFields);
							this.setFieldsObjByAllFields(formatState[validObjArr[vaI]],fieldsObj,validObjArr[vaI]);
						}
					}
					// 不是表格状态时
					if(typeof(formatState.tabs)=='undefined'){
						// 添加新字段 并确定新字段的位置
						// 新添加的字段
						var addFieldsArr = [];
						var editFields = config2States[index].editFields;
						var englishNameNum = 0;
						for(var gid in editFields){
							if(typeof(fieldsObj[gid])=='undefined'){
								/*此状态为添加的*/
								// 哪个字段之前
								var afterField = fieldsObj[editFields[gid].fieldIndex];
								var formatField = nsComponentEditor.getFormatData(editFields[gid]);
								var addField = {
									mindjetIndexState:afterField.mindjetIndexState-0.5,
									gid:gid,
									edit:formatField,
									englishName:'addFieldName'+englishNameNum,
								};
								formatState[afterField.classType].push(addField);
								englishNameNum++;
							}
						}
					}
				}
				vo.processContent.states.push(formatState);
			}
		},
		setFieldsObjByAllFields:function(_fields,obj,name){
			for(var fieI=0;fieI<_fields.length;fieI++){
				obj[_fields[fieI].gid] = $.extend(true,{},_fields[fieI]);
				obj[_fields[fieI].gid].classType = name;
			}
		},
		// 在数组中查询是否有对应的字段若有格式化编辑的数据 根据gid
		setformatStateFields:function(_fields,editObj,fieldsObj){
			for(var fieI=0;fieI<_fields.length;fieI++){
				if(editObj[_fields[fieI].gid]){
					var fieldEdit = editObj[_fields[fieI].gid];
					if(fieldEdit.editBtnName == "edit2"){
						var formatField = NetstarComponentEditor.getFormatData(fieldEdit);
					}else{
						var formatField = nsComponentEditor.getFormatData(fieldEdit);
					}
					_fields[fieI].edit = formatField;
				}
			}
		},
		// 获取field/method编辑的默认值 从 config2获得
		getEditData:function(defData,obj){
			if(obj.config2 == null || typeof(obj.config2)=='undefined'){
				if(obj.category == 'vo'){
					obj.config2 = {
						fields:{},
						states:[],
					}
				}else{
					obj.config2 = {}
				}
			}else{
				if(typeof(obj.config2) == 'string'){
					obj.config2 = JSON.parse(obj.config2)
				}
			}
			if(obj.category == 'vo'){
				if(obj.config2.fields[defData.gid]){
					// return obj.config2.fields[defData.gid].sourceData;
					return $.extend(true,{},obj.config2.fields[defData.gid]);
				}else{
					return defData;
				}
			}else{
				if(!$.isEmptyObject(obj.config2)){
					return $.extend(true,{},obj.config2);
				}else{
					return defData;
				}
			}
		},
		// 根据id查询field 在数组voMapTable.processContent.vo中查询
		getVoById:function(gid){
			var voList = voMapTable.processContent.vo;
			for(indexI=0;indexI<voList.length;indexI++){
				for(var indexJ=0;indexJ<voList[indexI].processData.fields.length;indexJ++){
					if(voList[indexI].processData.fields[indexJ].gid == gid){
						return voList[indexI];
					}
				}
			}
			return false;
		},
		// 根据id在数组voMapTable.processContent.vo中查询vo
		getVoByVoId:function(id){
			var voList = voMapTable.processContent.vo;
			for(indexI=0;indexI<voList.length;indexI++){
					if(voList[indexI].id == id){
						return voList[indexI];
					}
			}
			return false;
		},
		// 根据id查询method 在数组voMapTable.processContent.method中查询
		getMethodById:function(id){
			var methodList = voMapTable.processContent.method;
			for(indexI=0;indexI<methodList.length;indexI++){
				if(methodList[indexI].id == id){
					return methodList[indexI];
				}
			}
			return false;
		},
		// 初始化
		init:function(tabId){
			//tabId :string 有三个可用值 field function state 会影响表格的column 和 btns
			//面板
			this.$panel = $('#'+config.pageDomId.voStateTablePanelId);
			this.tableId = config.pageDomId.voStateTableId;
			
			//补充数据
			this.data = {
				tableID:this.tableId,
				dataSource:[],
			};
			var dataConfig = $.extend(true, {}, this.data);
			var columnConfig = $.extend(true, [], this.column[tabId]);
			var uiConfig = $.extend(true, {}, this.ui);
			//添加按钮
			if(columnConfig[columnConfig.length - 1].formatHandler){
				columnConfig[columnConfig.length - 1].formatHandler.data =  $.extend(true, [], this.columnBtns[tabId]);
			}
			// 表格上按钮
			if(this.btns[tabId]){
				var btnsConfig = $.extend(true, {}, this.btns[tabId]);
			}else{
				btnsConfig = {};
			}
			if($('#'+this.tableId).children().length>0){
				uiConfig.$container = this.$panel;
			}
			baseDataTable.init(dataConfig, columnConfig, uiConfig, btnsConfig);
		},
		refreshVoRemarkByVoId:function(voId,resList,callback){
			var voObj = {};
			var methodNum = 0;
			for(var i=0;i<resList.length;i++){
				if(resList[i].id == voId){
					voObj = resList[i];
				}
				if(resList[i].category == 'method'){
					var processContent = JSON.parse(resList[i].processContent);
					if(processContent.voId == voId){
						methodNum++;
					}
				}
			}
			if($.isEmptyObject(souRemark)){
				if(typeof(callback)=='function'){
					callback();
				}else{
					return ;
				}
			}
			var souRemark = voObj.remark;
			if(souRemark == null){
				var voObjProcessContent = JSON.parse(voObj.processContent);
				var fieNum = voObjProcessContent.field.length;
				souRemark = fieNum+'个字段/'+methodNum+'个关联方法';
			}
			var remarkArr = souRemark.split('/');
			var remark = remarkArr[0]+'/'+methodNum+'个关联方法';
			var voSave = {
				id:voId,
				mindMapId:voObj.mindMapId,
				remark:remark,
			};
			server.voMap.save(voSave,function(res){
				if(typeof(callback)=='function'){
					callback();
				}
			});
		},
		//根据id刷新表格数据源
		refreshDataById:function(id,callBack){
			var voMapDataArray = [];
			//发送请求并格式化数据
			voMapManager.getVoMapArraysById(id, function(_voMapDataArray){
				voMapDataArray =  _voMapDataArray;
				console.log('格式化完成后的数据');
				console.log('nsProjectPagesManager.pages.voList.voMapTable.processContent');
				console.log(_voMapDataArray);
				voMapTable.processContent = _voMapDataArray;
				//dialog需要voFields
				setStateDialog.getVO();
				//tabs切换到state
				voTabs.init('vo');
				//实体名字
				// res.entityName = entityName;

				voMapTable.refreshTabsPanel('vo');
				if(typeof(callBack)=='function'){
					callBack();
				}
			})
		},
		hide:function(){
			this.voFields = undefined;
			this.$panel.hide();
		},
		show:function(voRes, tabName){
			tabName = typeof(tabName) == 'undefined' ? 'field' : tabName;
			//voRes:object {originalContent:{}, field的集合 processContent:{}，状态的集合，entityName:''实体名字}
			this.entityName = voRes.entityName;
			this.$panel.show();
			//处理服务器数据
			//原始field字段
			//var voFields = JSON.parse(voRes.originalContent);
			//保存过的状态字段
			var stateDataArray =  [];
			voTabs.init();
			stateDataArray = this.processContent[tabName];
			this.setData(stateDataArray);
		},
		//刷新
		refresh:function(){
			baseDataTable.refreshByID(this.tableId);
		},
		//设置新的数据
		setData:function(tabelData,tabId){
			tabId = typeof(tabId)=='undefined'?'':tabId;
			baseDataTable.originalConfig[this.tableId].dataConfig.dataSource = this.getFilterData(tabelData,tabId);
			this.refresh();
		},
		// 刷新表格行数据
		refreshTableLine:function(_editData,_rowsData){
			var origalTableData = $.extend(true,{},_rowsData);
			var origalData = baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data();
			for(var key in _editData){
				origalData[key] = _editData[key];
			}
			baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data(origalData).draw(false);
		},
		// 刷新tab页面
		refreshTabsPanel:function(tabId){
			if(tabId == 'vo'){ // vo表格不进行筛选
				baseDataTable.originalConfig[this.tableId].dataConfig.dataSource = this.processContent[tabId];
			}else{
				// 不是vo的表格根据 voTabs.voName 筛选显示数据
				baseDataTable.originalConfig[this.tableId].dataConfig.dataSource = this.getFilterData(this.processContent[tabId],tabId);
			}
			var columnConfig = $.extend(true, [], this.column[tabId]); // 列显示字段
			//添加按钮
			if(columnConfig[columnConfig.length - 1].formatHandler){
				columnConfig[columnConfig.length - 1].formatHandler.data =  $.extend(true, [], this.columnBtns[tabId]);
			}
			baseDataTable.originalConfig[this.tableId].columnConfig = $.extend(true, [], columnConfig);
			// 表格上按钮配置
			if(this.btns[tabId]){
				baseDataTable.originalConfig[this.tableId].btnConfig = $.extend(true, {}, this.btns[tabId]);
			}else{
				baseDataTable.originalConfig[this.tableId].btnConfig = {};
			}
			// 刷新
			this.refresh();
		},
		// 数据筛选 根据 voTabs.voName 筛选出要显示数据 删除不需要显示
		getFilterData:function(_sourceArr,tabId){
			tabId = typeof(tabId)=='undefined'?'':tabId;
			switch(tabId){
				case 'state':
					var sourceArr = []; // 删除需要隐藏的 状态隐藏默认 // 隐藏状态中的默认状态 即 不显示默认字段
					var allStateArray = _sourceArr;
					for(var stateI=0;stateI<allStateArray.length;stateI++){
						if(allStateArray[stateI].chineseName!='默认全部字段' && allStateArray[stateI].englishName!='defalut'){
							sourceArr.push(allStateArray[stateI]);
						}
					}
					break;
				default:
					var sourceArr = _sourceArr;
					break;
			}
			var voName = voTabs.voName;
			if(voName == ''){ // ''代表全部
				return sourceArr;
			}
			var filterArr = [];
			for(index=0;index<sourceArr.length;index++){
				if(sourceArr[index].voName == voName){
					filterArr.push(sourceArr[index]);
				}
			}
			return filterArr;
		},
	}
	// 新增vo
	var voAdd = {
		dialogConfig:{
			id: 				"dialog-voAdd",
			title: 				"关联页面",
			size: 				"b",
			form: [
				{
					label:'VO名称',
					id:'voName',
					type:'text',
					rules:'required',
				},{
					label:'VOId',
					id:'voId',
					type:'hidden'
				},{
					html: '<div id="voAddTable">'
							+'<div class="col-sm-12 main-panel">'
								+'<div class="panel panel-default">'
									+'<div class="panel-body">'
										+'<div class="table-responsive">'
											+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="voAddTable-table">'
											+'</table>'
										+'</div>'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>'
				}
			],
			btns:[
				{
					text: 		'确认',
				}
			],
		},
		dialogFieldConfig:{
			id: 				"dialog-fieldAdd",
			title: 				"新增字段",
			size: 				"b",
			isMoreDialog: 		true,
			form: [
				{
					label:'中文名称',
					id:'chineseName',
					type:'text',
					rules:'required',
				},{
					label:'英文名称',
					id:'englishName',
					type:'text',
					rules:'required',
				},{
					label:'数据类型',
					id:'variableType',
					type:'radio',
					rules:'required',
					textField:'name',
					valueField:'id',
					subdata:[
						{
							id:'string',
							name:'字符串',
						},{
							id:'number',
							name:'数字',
						},{
							id:'date',
							name:'日期',
						},{
							id:'boolean',
							name:'布尔值',
						}
					],
				},
			],
			btns:[
				{
					text: 		'确认',
					handler: 	function(){
					},
				}
			],
		},
		data:{
			tableID:'',
			dataSource:[],
		},
		column:[
			{
				field : 'chineseName',
				title : '中文名称',
				searchable: true,
				width:120,
			},{
				field : 'englishName',
				title : '字段名称',
				searchable: true,
				width:120,
			},{
				field : 'variableType',
				title : '数据类型',
				searchable: false,
				width:120,
			},{
				field:'btns',
				title:'操作',
				width:80,
				formatHandler:{
					type: 'button',
					data: []
				}
			}
		],
		ui:{
			isSelectColumns: 	false, 					//是否开启列选择，默认为选择
			isAllowExport: 		false,					//是否允许导出数据，默认允许
			pageLengthMenu: 	10,
			isSingleSelect: 	false,			 			//是否单选
			tableHeightType:'strict-compact',
			isUseTabs:true,
		},
		btns:{
			selfBtn:
			[
				{
					text:'新增',
					handler:function(){
						var dialogFieldConfig = $.extend(true,{},voAdd.dialogFieldConfig);
						dialogFieldConfig.btns[0].handler = function(){
							var dialogData = nsForm.getFormJSON('dialog-fieldAdd');
							if(dialogData){
								var validData = $.extend(true,{},dialogData);
								var isTrue = voAdd.valiFieldName(validData);
								if(isTrue){
									baseDataTable.addTableRowData('voAddTable-table',[dialogData]);
									nsdialogMore.hide();
								}else{
									nsAlert('中文/英文名字重复','error');
								}
							}
						}
						nsdialog.initShow(dialogFieldConfig);
					},
				}
			]
		},
		columnBtns:[
			{
				'修改':function(rowDatas){
					var values = rowDatas.rowData;
					var dialogFieldConfig = $.extend(true,{},voAdd.dialogFieldConfig);
					for(var forI=0;forI<dialogFieldConfig.form.length;forI++){
						if(values[dialogFieldConfig.form[forI].id]){
							dialogFieldConfig.form[forI].value = values[dialogFieldConfig.form[forI].id];
						}
					}
					dialogFieldConfig.btns[0].handler = function(){
						var dialogData = nsForm.getFormJSON('dialog-fieldAdd');
						if(dialogData){
							var validData = $.extend(true,{},dialogData);
							validData.index = rowDatas.rowIndexNumber;
							var isTrue = voAdd.valiFieldName(validData);
							if(isTrue){
								voMapTable.refreshTableLine(dialogData,rowDatas);
								nsdialogMore.hide();
							}else{
								nsAlert('中文/英文名字重复','error');
							}
						}
					}
					nsdialog.initShow(dialogFieldConfig);
				}
			},{
				'删除':function(rowDatas){
					nsConfirm('是否确认删除字段:'+rowDatas.rowData.chineseName, function(isConfirm){
						var trObj = rowDatas.obj.closest('tr');
						baseDataTable.delRowData('voAddTable-table',trObj);
					})
				}
			}
		],
		save:function(saveVoData){
			server.voMap.save(saveVoData,function(res){
				nsAlert('保存成功');
				nsdialog.hide();
				voMapTable.refreshDataById(saveVoData.mindMapId,function(){
					voMapTable.getFullXmmapJson(false,function(xmmapJson){
						var saveXmlObj = {
							id:saveVoData.mindMapId,
							jsonContent:JSON.stringify(xmmapJson),
						}
						server.voMapList.save(saveXmlObj);
					});
				});
			});
		},
		delete:function(){
			var xmmapConfig = this.xmmapConfig;
			nsConfirm('是否确认删除当前vo:'+xmmapConfig.sourceVo.name, function(isConfirm){
				if(isConfirm){
					server.voMap.deleteById(xmmapConfig.id,function(res){
						nsAlert('删除成功');
						// 刷新子表
						voMapTable.refreshDataById(xmmapConfig.mindMapId,function(){
							// 刷新思维导图
							voMapTable.getFullXmmapJson(false,function(xmmapJson){
								var saveXmlObj = {
									id:xmmapConfig.mindMapId,
									jsonContent:JSON.stringify(xmmapJson),
								}
								server.voMapList.save(saveXmlObj);
							});
						});
					});
				}
			}, 'warning')
		},
		add:function(){
			var saveVoData = this.getEditVoData();
			if(saveVoData){
				saveVoData.processContent = JSON.stringify(saveVoData.processContent);
				saveVoData.originalContent = JSON.stringify(saveVoData.originalContent);
				var isTrue = voMapTable.valiVoName(saveVoData);
				if(isTrue){
					this.save(saveVoData)
				}else{
					nsAlert('voName重复','error');
				}
			}
		},
		edit:function(){
			var xmmapConfig = this.xmmapConfig;
			var sourceVoData = xmmapConfig.sourceVo;
			if(typeof(sourceVoData.config2)=='string'){
				sourceVoData.config2 = JSON.parse(sourceVoData.config2);
			}

			var dialogData = nsForm.getFormJSON('dialog-voAdd');
			if(dialogData){
				var saveVoData = this.getEditVoData();
				if(saveVoData){
					// remark
					var souRemark = sourceVoData.remark;
					var souRemarkArr = souRemark.split('/');
					var remark = saveVoData.remark;
					var remarkArr = remark.split('/');
					saveVoData.remark = remarkArr[0]+'/'+souRemarkArr[1];
					// var tableData = baseDataTable.allTableData('voAddTable-table');
					var tableData = $.extend(true,[],saveVoData.originalContent.fields);
					if(tableData.length == 0){
						nsAlert('vo中没有字段，请执行删除操作','error');
						return false;
					}
					console.log(sourceVoData);
					console.log(saveVoData);
					var tableDataObj = this.getFieldsObjByFieldsArr(tableData);
					// 修改originalContent
					saveVoData.originalContent.fields = this.editFields(sourceVoData.originalContent.fields,tableDataObj,'originalContent');
					// 修改processContent
					saveVoData.processContent.fields = this.editFields(sourceVoData.processContent.fields,tableDataObj,'processContent');
					saveVoData.processContent.states = this.editStates(sourceVoData.processContent.states,tableDataObj,dialogData.voName,'processContent',saveVoData.originalContent.states[0]);
					// // 修改config2
					saveVoData.config2 = {};
					var souConfig2FieldsArr = this.getFieldsArrByFieldsObj(sourceVoData.config2.fields);
					var config2FieldsArr = this.editFields(souConfig2FieldsArr,tableDataObj,'config2');
					var config2FieldsObj = this.getFieldsObjByFieldsArr(config2FieldsArr);
					saveVoData.config2.fields = config2FieldsObj;
					saveVoData.config2.states = this.editStates(sourceVoData.config2.states,tableDataObj,dialogData.voName,'config2');
					for(var staI=1;staI<saveVoData.processContent.states.length;staI++){
						for(var staJ=0;staJ<saveVoData.config2.states.length;staJ++){
							if(saveVoData.processContent.states[staI].gid == saveVoData.config2.states[staJ].gid){
								saveVoData.processContent.states[staI].fieldsChineseName = saveVoData.config2.states[staJ].fieldsChineseName;
							}
						}
					}
					if(saveVoData.config2.states.length==0&&$.isEmptyObject(saveVoData.config2.fields)){
						delete saveVoData.config2;
					}else{
						saveVoData.config2 = JSON.stringify(saveVoData.config2);
					}
					saveVoData.originalContent = JSON.stringify(saveVoData.originalContent);
					saveVoData.processContent = JSON.stringify(saveVoData.processContent);
					var isTrue = voMapTable.valiVoName(saveVoData);
					if(isTrue){
						// this.save(saveVoData);
						var voId = saveVoData.id;
						var methodList = voMapTable.processContent.method;
						var editMethodList = [];
						for(var methodI=0;methodI<methodList.length;methodI++){
							if(methodList[methodI].voId == voId){
								methodObj = {
									id:methodList[methodI].resJson.id,
									originalContent:methodList[methodI].resJson.originalContent,
									processContent:methodList[methodI].resJson.processContent,
									config2:methodList[methodI].resJson.config2,
								};
								if(methodObj.config2 == null){
									delete methodObj.config2;
								}
								if(typeof(methodObj.config2)=='string'){
									methodObj.config2 = JSON.parse(methodObj.config2);
									methodObj.config2.voName = dialogData.voName;
									methodObj.config2.voFullName = dialogData.voFullName;
									methodObj.config2 = JSON.stringify(methodObj.config2);
								}
								methodObj.originalContent.voName = dialogData.voName;
								methodObj.originalContent.voFullName = dialogData.voFullName;
								methodObj.originalContent = JSON.stringify(methodObj.originalContent);
								methodObj.processContent.voName = dialogData.voName;
								methodObj.processContent.voFullName = dialogData.voFullName;
								methodObj.processContent = JSON.stringify(methodObj.processContent);
								editMethodList.push(methodObj);
							}
						}
						server.voMap.saveList(editMethodList,function(voMapRes){
							voAdd.save(saveVoData);
						});
					}else{
						nsAlert('voName重复','error');
					}
				}
			}
		},
		show:function(){
			var xmmapConfig = this.xmmapConfig;
			// 弹框配置
			var dialogConfig = $.extend(true,{},this.dialogConfig);
			// 表格配置
			var dataConfig = $.extend(true,{},this.data);
			dataConfig.tableID = 'voAddTable-table';
			var columnConfig = $.extend(true,[],this.column);
			columnConfig[columnConfig.length-1].formatHandler.data = $.extend(true,[],this.columnBtns);
			var uiConfig = $.extend(true,{},this.ui);
			var btnsConfig = $.extend(true,{},this.btns);
			dialogConfig.shownHandler = function(){
				if($('#voAddTable-table').children().length>0){
					uiConfig.$container = $('#voAddTable');
				}
				baseDataTable.init(dataConfig, columnConfig, uiConfig, btnsConfig);
			}
			nsdialog.initShow(dialogConfig);
		},
		// 修改字段
		editFields:function(souFieldsArr,_fieldsObj,containerName){
			var fieldsArr = [];
			var fieldsObj = $.extend(true,{},_fieldsObj);
			for(var fieI=0;fieI<souFieldsArr.length;fieI++){
				if(fieldsObj[souFieldsArr[fieI].gid]){
					var field = souFieldsArr[fieI];
					field.chineseName = fieldsObj[souFieldsArr[fieI].gid].chineseName;
					field.englishName = fieldsObj[souFieldsArr[fieI].gid].englishName;
					switch(containerName){
						case 'processContent':
						case 'originalContent':
						case 'editFields':
						case 'config2':
							field.variableType = fieldsObj[souFieldsArr[fieI].gid].variableType;
							field.voName = fieldsObj[souFieldsArr[fieI].gid].voName;
							field.voFullName = fieldsObj[souFieldsArr[fieI].gid].voFullName;
							break;
						default:
							break;
					}
					if(field.id){
						field.id = fieldsObj[souFieldsArr[fieI].gid].englishName;
					}
					if(field.edit){
						var displayArr = ['form','table'];
						var attrArr = ['chineseName','englishName','id','voName','fullName','variableType','title','field'];
						for(var disI=0;disI<displayArr.length;disI++){
							if(field.edit[displayArr[disI]]){
								for(var attrI=0;attrI<attrArr.length;attrI++){
									if(field.edit[displayArr[disI]][attrArr[attrI]]){
										switch(attrArr[attrI]){
											case 'id':
												var newAttr = fieldsObj[souFieldsArr[fieI].gid].englishName;
												break;
											case 'field':
												var newAttr = fieldsObj[souFieldsArr[fieI].gid].englishName;
												break;
											case 'title':
												var newAttr = fieldsObj[souFieldsArr[fieI].gid].chineseName;
												break;
											default:
												var newAttr = fieldsObj[souFieldsArr[fieI].gid][attrArr[attrI]];
												break;
										}
										field.edit[displayArr[disI]][attrArr[attrI]] = newAttr;
									}
								}
							}
						}
					}
					fieldsArr.push(field);
					delete fieldsObj[souFieldsArr[fieI].gid];
				}
			}
			switch(containerName){
				case 'processContent':
				case 'originalContent':
					if(!$.isEmptyObject(fieldsObj)){
						for(var gid in fieldsObj){
							fieldsArr.push(fieldsObj[gid]);
						}
					}
					break;
				default:
					break;
			}
			
			return fieldsArr;
		},
		// 修改状态
		editStates:function(souState,_fieldsObj,voName,containerName,newStateObj){
			var stateFieldNames = ['field','field-more','tabs','editFields','stateGroups','fieldNames'];
			var states = [];
			var num = 0;
			if(containerName == 'processContent'){
				num = 1;
			}
			if(typeof(newStateObj)=='object'){
				states.push(newStateObj);
			}
			for(var staI=num;staI<souState.length;staI++){
				var stateObj = souState[staI];
				stateObj.voName = voName;
				stateObj.voFullName = voName;
				var isDelState = true; // 用于判断对象是否都为空，若都为空 删除此状态
				for(var nameI=0;nameI<stateFieldNames.length;nameI++){
					if(stateObj[stateFieldNames[nameI]]){
						switch(stateFieldNames[nameI]){
							case 'stateGroups':
								for(var groupsGid in stateObj[stateFieldNames[nameI]].groups){
									stateObj[stateFieldNames[nameI]].groups[groupsGid].fields = this.editFields(stateObj[stateFieldNames[nameI]].groups[groupsGid].fields,_fieldsObj,stateFieldNames[nameI]);
								}
								break;
							case 'editFields':
								var souEditFieldsArr = this.getFieldsArrByFieldsObj(stateObj[stateFieldNames[nameI]]);
								var editFieldsArr = this.editFields(souEditFieldsArr,_fieldsObj,stateFieldNames[nameI]);
								var editFieldsObj = this.getFieldsObjByFieldsArr(editFieldsArr);
								stateObj[stateFieldNames[nameI]] = editFieldsObj;
								break;
							default:
								stateObj[stateFieldNames[nameI]] = this.editFields(stateObj[stateFieldNames[nameI]],_fieldsObj,stateFieldNames[nameI]);
								break;
						}
						if($.isArray(stateObj[stateFieldNames[nameI]])){
							if(stateObj[stateFieldNames[nameI]].length == 0){
								delete stateObj[stateFieldNames[nameI]];
							}else{
								isDelState = false;
							}
						}else{
							if($.isEmptyObject(stateObj[stateFieldNames[nameI]])){
								delete stateObj[stateFieldNames[nameI]];
							}else{
								isDelState = false;
							}
						}
					}
				}
				if(!isDelState){
					stateObj.fieldsChineseName = this.getStateFieldsChineseName(stateObj);
					if(stateObj.fieldsChineseName){
						states.push(stateObj);
					}
				}
			}
			return states;
		},
		// 获得状态的fieldsChineseName
		getStateFieldsChineseName:function(stateObj){
			var fieldsChineseNameStr = '';
			var fieldsArr = [];
			if(stateObj.fieldNames){
				fieldsArr = stateObj.fieldNames;
			}else{
				if(stateObj.field){
					fieldsArr = stateObj.field;
					if(stateObj['field-more']){
						for(var i=0;i<stateObj['field-more'].length;i++){
							fieldsArr.push(stateObj['field-more'][i]);
						}
					}
					if(stateObj['field-sever']){
						for(var i=0;i<stateObj['field-sever'].length;i++){
							fieldsArr.push(stateObj['field-sever'][i]);
						}
					}
				}else{
					if(stateObj.tabs){
						fieldsArr = stateObj.tabs;
					}else{
						console.error('状态字段配置错误');
						return false;
					}
				}
			}
			for(var i=0;i<fieldsArr.length;i++){
				fieldsChineseNameStr += fieldsArr[i].chineseName + ',';
			}
			fieldsChineseNameStr = fieldsChineseNameStr.substring(0,fieldsChineseNameStr.length-1);
			return fieldsChineseNameStr
		},
		// 获得编辑的vo数据
		getEditVoData:function(){
			var dialogData = nsForm.getFormJSON('dialog-voAdd');
			if(dialogData){
				var tableData = baseDataTable.allTableData('voAddTable-table');
				if(tableData.length == 0){
					nsAlert('vo还没有添加字段','error');
					return false;
				}
				var xmmapConfig = voAdd.xmmapConfig;
				var fields = []; // 保存的字段配置
				for(var tabI=0;tabI<tableData.length;tabI++){
					var fieldObj = $.extend(true,{},tableData[tabI]);
					delete fieldObj.btns;
					if(fieldObj.id == ''){
						delete fieldObj.id;
					}
					var defaultConfig = {
						chineseName:'',
						englishName:'',
						entityName:xmmapConfig.entityName,
						gid:nsTemplate.newGuid(),
						isHaveChineseName:true,
						variableType:'',
					}
					nsVals.setDefaultValues(fieldObj,defaultConfig);
					fieldObj.voFullName = dialogData.voName,
					fieldObj.voName = dialogData.voName,
					fields.push(fieldObj);
				}
				var defaultStateFields = [];
				var configStr = '';
				var fieldsNumber = 0;
				var remarkSrc = '';
				for(var fieI=0;fieI<fields.length;fieI++){
					configStr += fields[fieI].chineseName+',';
					fieldsNumber++;
					defaultStateFields.push({
						chineseName:fields[fieI].chineseName,
						englishName:fields[fieI].englishName,
						gid:fields[fieI].gid,
						mindjetIndexState:fieI,
					});
				}
				configStr = configStr.substring(0,configStr.length-1);
				var defaultState = {
					chineseName:'默认全部字段',
					englishName:'defalut',
					field:defaultStateFields,
					gid:nsTemplate.newGuid(),
					voName:dialogData.voName,
				}
				if(dialogData.voId != ''){
					defaultState.voId = dialogData.voId;
				}
				var fieldAndState = {
					fields:fields,
					states:[defaultState],
				}
				/*// 保存的vo数据
				var saveVoData = {
					category:'vo',
					config:configStr,
					name:dialogData.voName,
					remark:fieldsNumber+'个字段/0个关联方法',
					mindMapId:xmmapConfig.mindMapId,
					config3:'{"source":"user"}',
					originalContent:JSON.stringify(fieldAndState),
					processContent:JSON.stringify(fieldAndState),
				};*/
				// 保存的vo数据
				var saveVoData = {
					category:'vo',
					config:configStr,
					name:dialogData.voName,
					remark:fieldsNumber+'个字段/0个关联方法',
					mindMapId:xmmapConfig.mindMapId,
					config3:'{"source":"user"}',
					originalContent:fieldAndState,
					processContent:fieldAndState,
				};
				if(dialogData.voId != ''){
					saveVoData.id = Number(dialogData.voId);
				}
				return saveVoData;
			}else{
				return false;
			}
		},
		getFieldsObjByFieldsArr:function(fieldsArr){
			var fieldsObj = {};
			for(var fieI=0;fieI<fieldsArr.length;fieI++){
				fieldsObj[fieldsArr[fieI].gid] = fieldsArr[fieI];
			}
			return fieldsObj;
		},
		getFieldsArrByFieldsObj:function(fieldsObj){
			var fieldsArr = [];
			for(var gid in fieldsObj){
				fieldsArr.push(fieldsObj[gid]);
			}
			return fieldsArr;
		},
		// 验证字段是否重复
		valiFieldName:function(fieldObj){
			var isTrue = false;
			fieldObj.index = typeof(fieldObj.index)=='undefined'?-1:fieldObj.index;
			var allFields = baseDataTable.allTableData('voAddTable-table');
			for(var index=0;index<allFields.length;index++){
				if(fieldObj.index!=index){
					if(allFields[index].chineseName==fieldObj.chineseName||allFields[index].englishName==fieldObj.englishName){
						return false;
					}
				}
			}
			return true;
		},
		init:function(xmmapConfig){
			this.xmmapConfig = xmmapConfig;
			this.data.dataSource = [];
			this.dialogConfig.form[0].value = '';
			this.dialogConfig.form[1].value = '';
			switch(xmmapConfig.type){
				case 'add':
					this.dialogConfig.btns[0].handler = function(){
						voAdd.add();
					}
					this.show();
					break;
				case 'edit':
					// this.sourceFields = xmmapConfig.sourceVo.originalContent.fields;
					this.fields = $.extend(true,[],xmmapConfig.sourceVo.originalContent.fields);
					// this.fieldsObj = this.getFieldsObjByFieldsArr(this.fields);
					this.data.dataSource = this.fields;
					this.dialogConfig.form[0].value = xmmapConfig.sourceVo.name;
					this.dialogConfig.form[1].value = xmmapConfig.sourceVo.id;
					this.dialogConfig.btns[0].handler = function(){
						voAdd.edit();
					}
					this.show();
					break;
				case 'delete':
					voAdd.delete();
					break;
			}
		}
	}
	//voMap管理器 只有复杂操作，简单操作直接使用server.voMap 或者 server.voMapList 
	var voMapManager = {
		//删除 先删除voMap关联的vo和method 然后再删除voMap
		deleteByVoMapId:function(id, callBackFunc){
			server.voMap.deleteByVoMapId(id, function(detailRes){
				//删除完明细后再删除voMapList中的数据
				server.voMapList.deleteById(id, function(listRes){
					nsAlert("删除成功");
					listTable.refresh();
					if(typeof(callBackFunc)=='function'){
						callBackFunc(listRes);
					}
				})
			})
		},
		// 验证voMapData是否合法
		valiVoMapData:function(voMapData){
			var voList = [];
			var methodList = [];
			var errorNum = 0; // 错误字段加随机数
			// vo和method分开验证
			for(var mapDataI=0;mapDataI<voMapData.length;mapDataI++){
				switch(voMapData[mapDataI].category){
					case 'vo':
						voList.push(voMapData[mapDataI]);
						break;
					case 'method':
						methodList.push(voMapData[mapDataI]);
						break;
					default:
						console.error('不能识别的数据');
						console.error(voMapData[mapDataI]);
						break;
				}
			}
			// 验证vo
			for(var voI=0;voI<voList.length;voI++){
				var name = voList[voI].name;
				for(var voJ=(voI+1);voJ<voList.length;voJ++){
					if(name == voList[voJ].name){
						console.error('vo名字重复：' + name);
						console.error(voList[voI]);
						console.error(voList[voJ]);
						voList[voJ].name += 'voError-'+errorNum++;
					}
				}
			}
			// 验证 field/state
			function validataFieldAndState(dataArr){
				var isTrue = true;
				for(var dataI=0;dataI<dataArr.length;dataI++){
					var englishName = dataArr[dataI].englishName;
					var chineseName = dataArr[dataI].chineseName;
					for(var dataJ=(dataI+1);dataJ<dataArr.length;dataJ++){
						if(englishName == dataArr[dataJ].englishName){
							console.error('englishName名字重复：' + englishName);
							console.error(dataArr[dataI]);
							console.error(dataArr[dataJ]);
							dataArr[dataJ].englishName += 'fieldError-'+errorNum++;
							isTrue = false;
						}
						if(chineseName == dataArr[dataJ].chineseName){
							console.error('chineseName名字重复：' + chineseName);
							console.error(dataArr[dataI]);
							console.error(dataArr[dataJ]);
							dataArr[dataJ].chineseName += 'fieldError-'+errorNum++;
							isTrue = false;
						}
					}
				}
				return isTrue;
			}
			for(var voI=0;voI<voList.length;voI++){
				var originalContent = voList[voI].originalContent;
				for(var keyName in originalContent){
					var isTrue = validataFieldAndState(originalContent[keyName]);
					if(!isTrue){
						console.error(voList[voI]);
						// return false;
					}
				}
			}
			// 验证method
			for(var methodI=0;methodI<methodList.length;methodI++){
				var name = methodList[methodI].name;
				var remark = methodList[methodI].remark;
				for(var methodJ=(methodI+1);methodJ<methodList.length;methodJ++){
					if(name == methodList[methodJ].name){
						console.error('method英文名字重复：' + name);
						console.error(methodList[methodI]);
						console.error(methodList[methodJ]);
						var newName = methodList[methodJ].englishName + 'methodError-'+errorNum++;
						methodList[methodJ].processContent.englishName = newName;
						methodList[methodJ].originalContent.englishName = newName;
						methodList[methodJ].name = newName;
						// return false;
					}
					if(remark == methodList[methodJ].remark){
						console.error('method中文名字重复：' + remark);
						console.error(methodList[methodI]);
						console.error(methodList[methodJ]);
						var newName = methodList[methodJ].remark + 'methodError-'+errorNum++;
						methodList[methodJ].processContent.chineseName = newName;
						methodList[methodJ].originalContent.chineseName = newName;
						methodList[methodJ].remark = newName;
						// return false;
					}
				}
			}
			// return true;
		},
		//保存导入voMap数据 先保存主表 再保存明细 voMap(子表)
		save:function(voMapListData, voMapData, callBackFunc){
			//明细保存
			// 使用的RequestBody方式传参。
			// {
			// 	Long   id;
			// 	Long   mindMapId;
			// 	Long   parentId;
			// 	String name;
			// 	String category;
			// 	String originalContent;
			// 	String processContent;
			// 	String config;
			// 	String config2;
			// 	String config3;
			// 	String remark;
			// }
			var _this = this;
			if(typeof(voMapListData.name) != 'string' || voMapListData.name == ''){
				nsAlert('获取voMap失败', 'error');
				return;
			}
			// 判断 voMapData 是否合法，（不合法：name重复，方法的remark重复，englishName重复，chineseName重复）
			this.valiVoMapData(voMapData);
			
			//有id是修改，没有id是新增
			var isAdd = voMapListData.id?false:true;
			var successInfo = isAdd?'新增成功':'修改成功';
			//验证要保存的数据，格式化，并保存
			function validAndFormatToSave(_saveListDataArray, voMapId){
				//_saveListDataArray:array 要保持的vo和method数组
				//voMapId: string/number   voMap的id
				//格式化要保存的数组，并验证。
				var voMapFormatArray = _this.getSaveVoMapArray(_saveListDataArray);
				if(voMapFormatArray == false){
					nsAlert('保存失败','error');
					return; 
				}
				//直接保存
				server.voMap.saveList(voMapFormatArray, function(voMapRes){
					// nsAlert(successInfo);
					nsProjectPagesManager.pages.voList.listTable.refresh(voMapId);
					//重新保存，以便给method数据添加voId
					server.voMap.getListById(voMapId, function(voListRes){
						//console.warn(voListRes);
						//voSecondSaveList 第二次保存的数组
						var voSecondSaveList = [];
						//生成名称对象
						var listResVos = {};
						for(var vlrI = 0; vlrI<voListRes.length; vlrI++){
							var voListResData = voListRes[vlrI];
							if(voListResData.category == 'vo'){
								listResVos[voListResData.name] = voListResData;
							}
							var secondSaveData = {};
							//过滤字段
							$.each(voListResData,function(key,value){
								switch(key){
									case 'id':
									case 'category':
									case 'mindMapId':
									case 'name':
									case 'originalContent':
									case 'category':
									case 'processContent':
									case 'config2':
										//用得到的字段复制过去
										secondSaveData[key] = value;
										break;
									default:
										//不用的数据跳过
										break;
								}
							})
							voSecondSaveList.push(secondSaveData)
						}
						//重新生成voLis
						for(var vlrI = 0; vlrI<voSecondSaveList.length; vlrI++){
							var voListResData = voSecondSaveList[vlrI];
							if(voListResData.category == 'method'){
								//把数据恢复成JSON 并且把voId属性加上去
								//修改原始数据 originalContent
								var originalContentJson = JSON.parse(voListResData.originalContent);
								if(typeof(listResVos[originalContentJson.voName])=='undefined'){
									console.error('vo不存在');
									console.error(originalContentJson.voName);
									console.error(listResVos);
									console.error(originalContentJson);
									nsAlert('vo不存在','error');
								}else{
									originalContentJson.voId = listResVos[originalContentJson.voName].id;
								}
								voListResData.originalContent = JSON.stringify(originalContentJson);
								//修改第一次生成的数据 processContent
								var processContentJson = JSON.parse(voListResData.processContent);
								// 修改时 已经保存了 voId 根据voName判断voId是否正确，若不正确说明该方法所属的vo发生了改变所以 functionField 就不存在了
								if(processContentJson.voId){
									if(processContentJson.voId != originalContentJson.voId){
										processContentJson.functionField = '';
										if(typeof(voListResData.config2)=='string'&&voListResData.config2 != 'null'){
											voListResData.config2 = JSON.parse(voListResData.config2);
											voListResData.config2.functionField = '';
											voListResData.config2.voId = originalContentJson.voId;
											// voListResData.config2.voName = voMapManager.getShortName(voListResData.config2.voName);
											voListResData.config2 = JSON.stringify(voListResData.config2);
										}
									}
								}
								if(typeof(voListResData.config2)=='string'&&voListResData.config2 != 'null'){
									voListResData.config2 = JSON.parse(voListResData.config2);
									voListResData.config2.voName = voMapManager.getShortName(voListResData.config2.voName);
									voListResData.config2 = JSON.stringify(voListResData.config2);
								}
								processContentJson.voId = originalContentJson.voId;
								processContentJson.voName = voMapManager.getShortName(processContentJson.voName);
								voListResData.processContent = JSON.stringify(processContentJson);
							}
						}
						//重新保存方法
						server.voMap.saveList(voSecondSaveList, function(voListSecondRes){
							// console.log(voListSecondRes);
							//voMapTable(子表)刷新数据
							voMapTable.refreshDataById(voSecondSaveList[0].mindMapId, function(){
								if(!isAdd){
									voMapTable.getFullXmmapJson(false,function(xmmapJson){
										var saveXmlObj = {
											id:voSecondSaveList[0].mindMapId,
											jsonContent:JSON.stringify(xmmapJson),
										}
										server.voMapList.save(saveXmlObj,function(res){
											if(typeof(callBackFunc)=='function'){
												callBackFunc(voListResData);
											}
										});
									});
								}else{
									if(typeof(callBackFunc)=='function'){
										callBackFunc(voListResData);
									}
								}
							})
						});	
					})
					
				})
			}
			//获取比较用的对象
			function getCompareObject(){
				var compareObject = {};
			}
			//主表保存新增
			server.voMapList.save(voMapListData, function(res){
				var saveListDataArray = voMapData;
				//新增和修改区别很大 分开执行
				if(isAdd){
					var voMapId = res.id;
					//每一条数据都要加上mindMapId属性
					for(var i = 0; i<saveListDataArray.length; i++){
						saveListDataArray[i].mindMapId = voMapId;
					}
					//格式化并保存数组
					validAndFormatToSave(saveListDataArray, voMapId);
				}else{
					//修改操作 需要先读取保存的数据
					//alert('这个动作还没写呢 用的新增')
					var voMapId = res.id;
					//每一条数据都要加上mindMapId属性
					for(var i = 0; i<saveListDataArray.length; i++){
						saveListDataArray[i].mindMapId = voMapId;
					}
					//先获取原先的数据
					server.voMap.getListById(voMapId, function(resList){
						//已经保存的对象
						//console.log(resList);
						//console.log(saveListDataArray);
						var savedVosByEnglishName = {};
						var savedVosByChineseName = {};
						var savedMethodsByEnglishName = {};
						var savedMethodsByChineseName = {};
						for(var resDataI = 0; resDataI<resList.length; resDataI++){
							var resData = resList[resDataI];
							switch(resData.category){
								case 'vo':
									savedVosByEnglishName[resData.name] = resData;
									break;
								case 'method':
									savedMethodsByEnglishName[resData.name] = resData;
									savedMethodsByChineseName[resData.remark] = resData;
									break;
								default:
									console.error('不能识别的数据');
									console.error(resData);
									break;
							}
						}
						for(var newDataI=0;newDataI<saveListDataArray.length;newDataI++){
							var newData = saveListDataArray[newDataI];
							switch(newData.category){
								case 'vo':
									// 根据name判断原来的vo
									if(savedVosByEnglishName[newData.name]){
										var savedVo = savedVosByEnglishName[newData.name];
										if(savedVo){
											newData.id = savedVo.id;
											// 如果config2为空时表示没有编辑过不进行处理
											if(savedVo.config2 == null){
												break;
											}
											// 替换vo中的相关字段
											voMapManager.requiredVoAttr(newData,savedVo);
										}
									}else{
										// 新增vo
									}
									break;
								case 'method':
									var savedMethod = false;
									// 根据name/remark判断原来的method , name的优先级高
									if(savedMethodsByChineseName[newData.remark]){
										savedMethod = savedMethodsByChineseName[newData.remark];
									}
									if(savedMethodsByEnglishName[newData.name]){
										savedMethod = savedMethodsByEnglishName[newData.name];
									}
									if(savedMethod){
										newData.id = savedMethod.id;
										// 如果config2为空时表示没有编辑过不进行处理
										if(savedMethod.config2 == null){
											break;
										}
										// 替换方法属性 中文名/英文名/suffix/contentType/dataSrc/voName 除外
										// 注意voName可能改变了，所以voId可能是不正确的 保存后二次保存改为一定正确的
										// var noReqArr = ['chineseName','englishName','suffix','contentType','dataSrc','voName'];
										var noReqArr = ['chineseName','englishName','contentType','voName','suffix','dataSrc'];
										var config2 = JSON.parse(savedMethod.config2);
										var newConfig2 = {};
										for(var attrName in config2){
											if(noReqArr.indexOf(attrName)==-1){
												newData.processContent[attrName] = config2[attrName];
												newConfig2[attrName] = config2[attrName];
											}else{
												newConfig2[attrName] = newData.processContent[attrName];
											}
										}
										if(!$.isEmptyObject(newConfig2)){
											newData.processContent = newConfig2;
											newData.config2 = newConfig2;
										}
									}
									break;
								default:
									console.error('不能识别的数据');
									console.error(resData);
									break;
							}
						}
						//console.warn(saveListDataArray);
						// 获得已经删除的数据
						// 通过resList已经保存的和saveListDataArray正在保存的比较
						// var deleteList = [];
						for(var resI=0;resI<resList.length;resI++){
							var resId = resList[resI].id;
							var isDeleted = true;
							for(var savI=0;savI<saveListDataArray.length;savI++){
								if(saveListDataArray[savI].id){
									if(saveListDataArray[savI].id == resId){
										isDeleted = false;
									}
								}
							}
							if(isDeleted){
								// deleteList.push(resList[resI]);
								var resObj = {
									parentId:-2, // 重新导入的数据没有该条vo或method
									originalContent:JSON.parse(resList[resI].originalContent),
									processContent:JSON.parse(resList[resI].processContent),
									id:resList[resI].id,
									category:resList[resI].category,
									mindMapId:resList[resI].mindMapId,
									name:resList[resI].name,
									remark:resList[resI].remark,
								}
								if(resList[resI].config2){
									resObj.config2 = JSON.parse(resList[resI].config2);
								}
								saveListDataArray.push(resObj);
							}
						}
						validAndFormatToSave(saveListDataArray, voMapId);
					})
					return;
				}
			})
		},
		requiredVoAttr:function(newObj,sourceObj){
			/* 
			 * 添加config2 并根据config2补全字段/状态配置
			 */
			var config2 = sourceObj.config2;
			sourceObj.processContent = JSON.parse(sourceObj.processContent);
			var souFields = sourceObj.processContent.fields; // 原始fields
			if(typeof(config2)=='string'){
				config2 = JSON.parse(config2); // 原始的config2
			}
			// 新的config2
			var newConfig2 = {
				fields:{},
				states:[],
			};
			// 获得config2通过原始的config2
			function getConfig2BySour(addObj,sorObj){
				var newCon = $.extend(true,{},sorObj);
				for(var addKey in addObj){
					switch(addKey){
						case 'gid':
							break;
						default:
							newCon[addKey] = addObj[addKey];
							break;
					}
				}
				return newCon;
			}
			var fields = newObj.processContent.fields; // 新的fields
			var states = newObj.processContent.states; // 新的states
			var newFields = []; // 生成新的fields
			var newColumns = []; // 生成新的columns
			var newStates = newObj.processContent.states;  // 生成新的states
			// 旧的字段中有新增字段添加到新字段
			for(var souI=0;souI<souFields.length;souI++){
				var isAddField = true;
				for(var fieI=0;fieI<fields.length;fieI++){
					if(souFields[souI].englishName == fields[fieI].englishName || souFields[souI].chineseName == fields[fieI].chineseName){
						isAddField = false;
					}
				}
				if(isAddField){
					fields.push(souFields[souI]);
					var origAddField = {
						chineseName: souFields[souI].chineseName,
						englishName: souFields[souI].englishName,
						gid: souFields[souI].gid,
						isHaveChineseName: souFields[souI].isHaveChineseName,
						variableType: souFields[souI].variableType,
					}
					newObj.originalContent.fields.push(origAddField);
					var stateAddField = {
						mindjetIndexState:newStates[0].field.length,
						chineseName:souFields[souI].chineseName,
						englishName:souFields[souI].englishName,
						gid:souFields[souI].gid,
					}
					newStates[0].field.push(stateAddField);
				}
			}
			// 新的默认状态根据中英文名字替换成就得gid
			for(var souI=0;souI<souFields.length;souI++){
				for(var fieI=0;fieI<newStates[0].field.length;fieI++){
					if(souFields[souI].englishName == fields[fieI].englishName || souFields[souI].chineseName == fields[fieI].chineseName){
						newStates[0].field[fieI].gid = souFields[souI].gid;
						break;
					}
				}
			}
			
			// 所有新的字段找到对应的旧的字段替换gid
			for(var souI=0;souI<souFields.length;souI++){
				for(var newI=0;newI<fields.length;newI++){
					if(souFields[souI].englishName == fields[newI].englishName || souFields[souI].chineseName == fields[newI].chineseName){
						fields[newI].gid = souFields[souI].gid;
						break;
					}
				}
			}
			var newFieldsAndColumns = {}; // 所有字段 通过新的fields获得
			for(var newI=0;newI<fields.length;newI++){
				newFieldsAndColumns[fields[newI].gid] = $.extend(true,{},fields[newI]);
			}
			// 根据config2获得表单表格数据
			for(var fieldI=0;fieldI<fields.length;fieldI++){
				var fieldObj = fields[fieldI];
				var isCon = false;
				if(!$.isEmptyObject(config2.fields)){
					if(config2.fields[fieldObj.gid]){
						var newConfig2Obj = getConfig2BySour(fieldObj,config2.fields[fieldObj.gid]); // config2
						newConfig2.fields[newConfig2Obj.gid] = newConfig2Obj;
						newFields.push(newConfig2Obj);
					}else{
						newFields.push(fieldObj);
					}
				}else{
					newFields.push(fieldObj);
				}
			}
			// 获得状态配置展示字段通过field确定中英文名字/gid
			function getStateFields(stateField){
				var newStateField = [];
				for(var staI=0;staI<stateField.length;staI++){
					var stateFieldObj = stateField[staI];
					// 通过gid或id找到对应的字段 替换新的中英文名字
					if(newFieldsAndColumns[stateFieldObj.gid]){
						stateFieldObj.englishName = newFieldsAndColumns[stateFieldObj.gid].englishName;
						stateFieldObj.chineseName = newFieldsAndColumns[stateFieldObj.gid].chineseName;
						newStateField.push(stateFieldObj);
						continue;
					}
					if(newFieldsAndColumns[stateFieldObj.id]){
						stateFieldObj.englishName = newFieldsAndColumns[stateFieldObj.id].englishName;
						stateFieldObj.chineseName = newFieldsAndColumns[stateFieldObj.id].chineseName;
						newStateField.push(stateFieldObj);
						continue;
					}
				}
				return newStateField;
			}
			if(config2.states.length > 0){
				for(var staI=0;staI<config2.states.length;staI++){
					var stateObj = config2.states[staI];
					stateObj.voId = newObj.id;
					stateObj.mindMapId = newObj.mindMapId;
					// 根据config2的属性fieldNames/fields/stateGroups判断之前选择的字段是否都存在 不存在的删除
					var fieldNamesArr = stateObj.fieldNames;
					var newFieldNames = getStateFields(fieldNamesArr);
					if(newFieldNames.length==0){
						continue;
					}else{
						stateObj.fieldNames = newFieldNames;
					}
					if(stateObj.stateGroups){
						var groupsObj = stateObj.stateGroups.groups;
						for(var groupGid in groupsObj){
							var groupFields = groupsObj[groupGid].fields;
							var newGroupFields = getStateFields(groupFields);
							if(newGroupFields.length==0){
								delete groupsObj[groupGid];
							}else{
								groupsObj[groupGid].fields = newGroupFields;
							}
						}
						if($.isEmptyObject(groupsObj)){
							delete stateObj.stateGroups;
						}
					}
					if(stateObj.editFields){
						var editFieldsObj = stateObj.editFields;
						var newEditFieldsObj = {};
						for(var gid in editFieldsObj){
							if(newFieldsAndColumns[gid]){
								newEditFieldsObj[gid] = editFieldsObj[gid];
								newEditFieldsObj[gid].englishName = newFieldsAndColumns[gid].englishName;
								newEditFieldsObj[gid].chineseName = newFieldsAndColumns[gid].chineseName;
							}else{
								if(editFieldsObj[gid].variableType == 'other'){
									newEditFieldsObj[gid] = editFieldsObj[gid];
								}
							}
						}
						if($.isEmptyObject(newEditFieldsObj)){
							delete stateObj.editFields;
						}else{
							stateObj.editFields = newEditFieldsObj;
						}
					}
					var fieldsChineseName = '';
					// 获得fieldsChineseName
					for(var indexI=0;indexI<newFieldNames.length;indexI++){
						fieldsChineseName += newFieldNames[indexI].chineseName+',';
					}
					stateObj.fieldsChineseName = fieldsChineseName.substring(0,fieldsChineseName.length-1);
					newConfig2.states.push(stateObj);
					if(stateObj.stateGroups){
						var formatState = setStateDialog.formatStateDataByEditStateGroups(stateObj);
					}else{
						var formatState = setStateDialog.formatStateDataByEditFieldNames(stateObj);
					}
					if(stateObj.editFields){
						// 分别在field/field-more/tabs中查询 是否有编辑的
						var validObjArr = ['field','field-more','field-sever','tabs'];
						for(var vaI=0;vaI<validObjArr.length;vaI++){
							if(formatState[validObjArr[vaI]]){
								voMapTable.setformatStateFields(formatState[validObjArr[vaI]],stateObj.editFields);
							}
						}
					}
					// if(typeof(formatState.field)=='undefined'&&typeof(formatState['field-more'])=='object'){
					if(typeof(formatState.field)=='undefined'&&typeof(formatState.tabs)=='undefined'){
						console.log('状态field/tab空了该状态删除');
						console.log(formatState);
						continue;
					}
					newStates.push(formatState);
					// newStates.push(stateObj);
				}
			}
			newObj.processContent.fields = newFields;
			newObj.processContent.states = newStates;
			newObj.config2 = newConfig2;
		},
		//格式化批量保存的vo和method方法数组
		getSaveVoMapArray:function(saveListDataArray){
			//获取格式化后的名字数据数组
			var convertStringFields = ['originalContent', 'processContent', 'config', 'config2', 'config3'];
			var formatArray = [];
			var isValid = true;

			for(var i = 0; i<saveListDataArray.length; i++){
				var saveListData = saveListDataArray[i];
				var formatSaveData = {};
				for(key in saveListData){
					if(convertStringFields.indexOf(key) == -1){
						//不是需要转化的字段，直接赋值
						formatSaveData[key] = saveListData[key];
						//思维导图id必须存在，不然无法读取
						if(key == 'mindMapId'){
							if(typeof(saveListData[key])=='undefined'){
								isValid = false;
							}
						}
					}else{
						//是特定的字段，需要把原来的对象转成string
						formatSaveData[key] = JSON.stringify(saveListData[key]);
					}
				}
				//根据类型生成不同的config 用作对比使用
				switch(saveListData.category){
					case 'vo':
						//vo以字段名为标记字段
						var markArray = [];
						for(var fieldI = 0; fieldI<saveListData.originalContent.fields.length; fieldI++){
							markArray.push(saveListData.originalContent.fields[fieldI].englishName);
						}
						var markStr = markArray.toString();
						break;
					case 'method':
						//method以中文名为标记字段
						var markStr = saveListData.remark;
						break;
					default:
						//不知道啥情况才出这个
						console.error('不能识别的方法：'+saveListData.category);
						console.error(saveListData);
						break;
				}
				formatSaveData.config = markStr;
				//加入到数组
				formatArray.push(formatSaveData);
			}
			//没有mindMapId是致命性错误
			if(isValid == false){
				nsAlert('mindMapId未定义', 'error');
				console.error(saveData);
				return false;
			}else{
				return formatArray;
			}
		},
		//格式化voMap所需要的数据
		getVoMapArraysById:function(id, callBackFunc){
			var _this = this;
			//先获取明细ajax
			server.voMap.getListById(id, function(resList){
				// console.log(resList);
				server.voMap.mindMap(id, function(mindMapObj){
					var mindMapJson = JSON.parse(mindMapObj);
					var entityName = ''; // 实体名
					for(var name in mindMapJson){
						entityName = name;
					}
					//获取格式化数据
					var arrays = _this.getVoMapFormatArraysByRes(resList,entityName);
					if(typeof(callBackFunc)=='function'){
						callBackFunc(arrays);
						//关联页面拼接
					}
				});
			})
		},
		//获取voMap的vo和method明细来格式化数据
		getVoMapFormatArraysByRes:function(resList,entityName){
			var _this = this;
			function errorInfo(errorInfoStr, errorObj){
				nsAlert(errorInfoStr, 'error');
				console.error(errorInfoStr);
				console.error(errorObj);
			}
			//resList是vo和method的集合 需要重新拆分
			var voMapObj = {
				vo:[],
				field:[],
				method:[],
				state:[],
				pages:[],
			};
			for(var detailI = 0; detailI<resList.length; detailI++){
				//原始数据
				var detailData = resList[detailI];

				//原始数据
				detailData.originalContent = JSON.parse(detailData.originalContent);
				if(typeof(detailData.originalContent)=='undefined'){
					errorInfo(detailData.name + '原始数据读取错误', detailData);
				}
				//编辑后的数据
				detailData.processContent = JSON.parse(detailData.processContent);
				if(typeof(detailData.processContent)=='undefined'){
					errorInfo(detailData.name + '编辑数据读取错误', detailData);
				}
				//根据数据类型刷新
				switch(detailData.category){
					case 'vo':
						var fieldsConcat = detailData.processContent.fields;
						// 判断是否有columns
						if(detailData.processContent.columns){
							var columnsArr = detailData.processContent.columns;
							for(var indexI=0;indexI<columnsArr.length;indexI++){
								if(columnsArr[indexI]){
								if(columnsArr[indexI].displayType == 'table'){
									fieldsConcat.push(columnsArr[indexI]);
								}}
							}
						}
						detailData.processContent = {
							fields:fieldsConcat,
							states:detailData.processContent.states,
						}
						//获取较短的voName 
						detailData.voName = _this.getShortName(detailData.name);
						detailData.voFullName = detailData.name;
						// 获取实体名
						detailData.entityName = entityName;
						//等待处理的数据
						detailData.processData = {
							//根据Gid查找field
							fieldsByGid:{},
							//根据中文名称查找field
							fieldsByChineseName:{},
							//根据英文名称查找field
							fieldsByEnglishName:{},
							fields:detailData.processContent.fields?detailData.processContent.fields:[],
							states:detailData.processContent.states?detailData.processContent.states:[],
						}
						//处理field
						for(fieldI = 0; fieldI<detailData.processData.fields.length; fieldI++){

							var fieldData = detailData.processData.fields[fieldI];

							//添加voName 
							fieldData.voName = detailData.voName;
							fieldData.voFullName = detailData.voFullName;
							// 添加entityName
							fieldData.entityName = detailData.entityName;
							
							detailData.processData.fieldsByGid[fieldData.gid] = fieldData;
							detailData.processData.fieldsByChineseName[fieldData.chineseName] = fieldData;
							detailData.processData.fieldsByEnglishName[fieldData.englishName] = fieldData;
							
							//如果不是能识别的变量类型，则跳过
							if(fieldData.variableType == 'none'){
								continue;
							}
							//保存field
							voMapObj.field.push(fieldData);
						}
						//处理状态
						detailData.processData.states = detailData.processContent.states?detailData.processContent.states:[];
						for(var stateI = 0; stateI<detailData.processData.states.length; stateI++){
							var stateData = detailData.processData.states[stateI];
							stateData.voName = detailData.voName;
							stateData.voId = detailData.id;
							stateData.mindMapId = detailData.mindMapId;
							stateData.voFullName = detailData.voFullName;
							stateData.entityName = detailData.entityName;
							voMapObj.state.push(stateData);
						}
						//添加VO
						voMapObj.vo.push(detailData);
						break;
					case 'method':
						//方法处理
						
						var methodData = detailData.processContent;
						methodData.id = detailData.id;
						methodData.voFullName = detailData.processContent.voName;
						methodData.mindMapId = detailData.mindMapId;
						methodData.entityName = entityName;
						// methodData.voId = _this.getShortName(detailData.processContent.voName);
						methodData.voName = _this.getShortName(detailData.processContent.voName);
						if(typeof(methodData.functionClass)=='undefined' || methodData.functionClass==''){
							if(methodData.dataSrc){
								switch(methodData.dataSrc){
									case 'rows':
										methodData.functionClass = 'list';
										break;
									default:
										methodData.functionClass = 'modal';
										break;
								}
							}else{
								methodData.functionClass = 'modal';
							}
							
						}
						methodData.resJson = $.extend(true,{},detailData);
						voMapObj.method.push(methodData);
						break;
				}
			}
			return voMapObj;
		},
		//获取较短的vo名称 "com.netstar.crm.vo.CustomerVo" => crm.CustomerVo
		getShortName:function(voNameStr){
			//voNameStr  string 例如：
			//去掉开头统一的 com.netstar.
			var shortVoName = voNameStr.replace(/com\.netstar\./, '');
			//去掉中间统一的 vo.
			shortVoName = shortVoName.replace(/vo\./, '');
			//去掉中间的. 并且后面字母大写
			var shortVoName = shortVoName.replace(
				/\.[A-Za-z]/g,
				function($1){
					var str = $1.substring(1,2);
					str = str.toLocaleUpperCase();
					return str;
				});
			return shortVoName;
		}
	}
	//列表配置-------------------------------------------------------------------------------
	var voTabs = {
		//页面DOM init时候赋值
		id:'', 
		$tabs:{},
		// 筛选voname 默认全部即 ''空字符
		voName:'',
		// 正显示的面板
		activeId:'vo',
		//tab列表内容
		content:[
			{id:'vo', text:'包含VO'},
			{id:'field', text:'字段'},
			{id:'method', text:'方法'},
			{id:'state', text:'状态'},
			// {id:'pages', text:'关联页面'},
		],
		//初始化 输出和事件监听初始化
		init:function(tabId){
			this.activeId = tabId;
			var tabsId = config.pageDomId.tabsId;
			this.id = tabsId;
			this.selectId = this.id + '-select';
			this.$tabs = $('#'+this.id);
			this.voName = '';
			var selectArr = this.getSelectList();
			this.$tabs.html(this.getHtml(this.activeId)+this.getSelectHtml(selectArr));
			this.iniTabtEvent();
			this.initSelectEvent();
		},
		//获取html 根据this.content属性
		getHtml:function(activeId){
			var html = '';
			for(var i = 0; i<this.content.length; i++){
				var className = '';
				//当前激活的tab
				if(activeId == this.content[i].id){
					 className = 'active';
				}
				if(className !=''){
					className = 'class="'+className+'"';
				}
				html += 
					'<li nsid="'+this.content[i].id+'" '+className+'>'
					+	'<a href="javascript:void(0);">'+this.content[i].text+'</a>'
					+'</li>';
			}
			//拼接头尾
			html = 
				'<ul class="nav nav-tabs nav-tabs-justified">'
				+	html
				+'</ul>';
			return html;
		},
		//获取下拉列表select的html
		getSelectHtml:function(voArray){
			var html = '';
			for(var i=0; i<voArray.length; i++){
				html += '<option value="'+voArray[i]+'">'+voArray[i]+'</option>';
			}
			if(voArray.length == 0){
				//没有
				html += '<option selected value="">无</option>';
			}else{
				//添加默认的全部
				html = '<option selected value="">全部</option>'+html;
			}
			html = 
				'<div class="tabs-select-container">'
				+	'<select id="'+this.selectId+'">'
				+		html
				+	'</select>'
				+'</div>'
			return html;
		},
		//初始化tab点击事件
		iniTabtEvent:function(){
			var _this = this;
			var $tab = _this.$tabs.children('ul').children('li');
			$tab.on('click',function(ev){
				var $thisTab = $(this);
				var activeId = $thisTab.attr('nsid');
				voTabs.activeId = activeId;
				_this.setActiveTab(activeId);
			})
		},
		//设置活动tab
		setActiveTab:function(activeId){
			var $activeTab = this.$tabs.children('ul').children('li.active');
			var currentTabId = $activeTab.attr('nsid');
			//如果当前的要切换的一样就不用执行了
			if(currentTabId == activeId){
				return;
			}
			//移除和添加active class
			$activeTab.removeClass('active');
			this.$tabs.children('ul').children('li[nsid="'+activeId+'"]').addClass('active');
			voMapTable.refreshTabsPanel(activeId); 
		},
		initSelectEvent:function(){
			var _this = this;
			$('#'+_this.selectId).on('change',function(ev){
				// console.log(ev)
				var valueStr = $('#'+_this.selectId).val();
				// console.log(valueStr);
				voTabs.voName = valueStr;
				voMapTable.refreshTabsPanel(voTabs.activeId); // 刷新当前tab表格面板
			})
		},
		// 获取下拉列表 根据 voDataTable.processContent.vo
		getSelectList:function(){
			var vo = voMapTable.processContent.vo;
			var voArr = [];
			for(index=0;index<vo.length;index++){
				voArr.push(vo[index].voName);
			}
			return voArr;
		}
	}

	//导入XML弹框----------------------------------------------------------------------------
	var importXMLDialog = {
		//fileInput
		fileInputId:'vomanager-importxmldialog-file',
		//备注日志 用于拼接输出新的备注
		remarkLogStr:'',
		//弹窗配置文件
		config:{
			id: 				"plane-edit",
			title: 				"",
			size: 				"m",
			form: 				
			[
				{
					id:"id",
					label:"id",
					type:"hidden"
				},{
					id:"name",
					label:"思维导图名",
					type:"text",
					rules:'required'
				},{
					id:"remark",
					label:"备注",
					height:260,
					readonly:true,
					type:"textarea"
				},{
					html:'<input type="file" accept="text/xml, .xmmap" id="vomanager-importxmldialog-file">'
				}
			],
			shownHandler:function(jsonData){
				var _this = this;
				//保存备注日志
				var orgiValues = nsForm.getFormJSON(_this.id, false);
				importXMLDialog.remarkLogStr = orgiValues.remark;
				//给file组件添加方法
				var $file = $('#vomanager-importxmldialog-file');
				$file.on('click',function(event){
					$(this).val("");
				});
				$file.on('change',function(event){
					//每次修改都重新读取思维导图数据
					var file =  event.target.files[0];
					importXMLDialog.readMindjetXML(file);
				})
			},
			btns:[{}]
		},
		init:function(){
		},
		//获取值
		getValues:function(){
			var values = nsForm.getFormJSON(this.config.id);
			if(values == false){
				return false;
			}
			var resultValues = 
			{
				name:values.name,
				remark:values.remark
			};
			//如果没有id则新增，有id则修改
			if(values.id != ''){
				resultValues.id = values.id
			}
			//如果修改过则有该字段，没有则保持原来的
			if($("#"+this.fileInputId).val() == ""){
			}else{
				resultValues.jsonContent = JSON.stringify(nsMindjetToJS.sourceJSJson);
				resultValues.xmlContent = nsMindjetToJS.xmlContent;
				// 判断思维导图是否正确解读并赋值 若没有报错
				if(typeof(resultValues.jsonContent) == 'undefined' || typeof(resultValues.xmlContent) == 'undefined'){
					nsAlert('获取vo失败，请检查思维导图配置');
					return false;
				}
				// 新增验证思维导图名是否重复
				if(!resultValues.id){
					var isTure = listTable.validataXmlName(resultValues.name);
					if(isTure){
					}else{
						nsAlert('已存在同名的思维导图','error');
						return false;
					}
				}		
			}
			return resultValues;
		},
		//处理导入的xmmapXML 文件
		readMindjetXML:function(file){
			var reader = new FileReader();
			var _this = this;
			reader.onload = function(){
				var xmlStr = this.result;
				nsMindjetToJS.init(xmlStr, function(resultObj){
					if(typeof(resultObj)!='object'){
						nsAlert('思维导图转换错误', 'error');
						return;
					}
					var values = nsForm.getFormJSON(_this.config.id, false);
					var fillValues = {};
					//如果没有名字 就自动读取名字
					if(values.name == ''){
						fillValues.name = resultObj.formatXMLJson.chineseName;
					}
					//原始文本如下：C:\fakepath\erpcrmController-2018.06.24.xmmap，需要截取
					var sourceStr = $('#'+_this.fileInputId).val();
					sourceStr = sourceStr.substring(sourceStr.lastIndexOf('\\')+1);
					sourceStr = '思维导图 ' + sourceStr;
					//获取备注日志
					fillValues.remark = voDataManager.getRemark({
						english:resultObj.formatXMLJson.englishName,
						chinese:resultObj.formatXMLJson.chineseName,
						source:sourceStr,
						remark: importXMLDialog.remarkLogStr,
					});
					//填充到表单
					if($.isEmptyObject(fillValues) == false){
						nsForm.fillValues(fillValues, _this.config.id);
					}
				});
			}
			reader.readAsText(file);
		},
		//新增
		add:function(){
			var _this = this;
			var dialogConfig = $.extend(true, {}, this.config);
			dialogConfig.title = '导入思维导图';
			dialogConfig.btns[0] = {
				text: 		'新增',
				handler: 	function(){
					var values = _this.getValues();
					if(values){
						if(typeof(values.jsonContent)=='undefined'){
							nsAlert('没有上传思维导图文件','error');
						}else{
							voDataManager.saveAjaxHander(values, function(res){
								//保存成功则关闭弹框
								nsdialog.hide();
								listTable.refresh();
							});
						}
					}
				}
			}
			nsdialog.initShow(dialogConfig);
		},
		//修改
		edit:function(values){
			var _this = this;
			//设置弹框
			var dialogConfig = $.extend(true, {}, this.config);
			dialogConfig.title = '修改及重新导入思维导图';
			dialogConfig.btns[0] = {
				text: 		'保存',
				handler: 	function(){
					var values = _this.getValues();
					if(values){
						voDataManager.saveAjaxHander(values, function(res){
							//保存成功则关闭弹框
							nsdialog.hide();
							listTable.refresh();
						});
					}
				}
			}
			//赋值
			for(var componentI = 0; componentI<dialogConfig.form.length; componentI++){
				var componentConfig = dialogConfig.form[componentI];
				if(typeof(values[componentConfig.id])!='undefined'){
					componentConfig.value = values[componentConfig.id]
				}
			}
			nsdialog.initShow(dialogConfig);
		},
	}

	// 状态管理弹框 lyw修改(下拉框改成项目组件)
	var setStateDialog = {
		config:{
			id: 				"dialog-state",
			title: 				"",
			size: 				"m",
			form: [
				{
					id:"chineseName",
					label:"中文名称",
					type:"text",
					rules:'required'
				},{
					id:"englishName",
					label:"英文名称",
					type:"text",
					rules:'required'
				},{
					id:"voId",
					label:'选择VO',
					type:'select2',
					valueField:'id',
					textField: 'text',
					rules:'required',
					changeHandler:function(selectId){
						if(selectId != ''){
							var stateSelect = $.extend(true, {}, setStateDialog.stateSelect);
							stateSelect.$container = $("#dialogProject");
							// 选择vo下的保存过的状态
							// setStateDialog.stateDataArray = setStateDialog.getSelectStateArrById(selectId);
							var stateAndVo = setStateDialog.getSelectStateArrById(selectId);
							setStateDialog.stateDataArray = stateAndVo[0];
							setStateDialog.voRes = stateAndVo[1];
							// 状态项目组件配置
							stateSelect.listAjax.dataSource = setStateDialog.getFieldSubdata(selectId);
							nsUI.projectSelect.clear();
							nsUI.projectSelect.init(stateSelect);
						}else{
							nsUI.projectSelect.clear();
						}
					}
				},{
					html: '<div id="dialogProject"></div>'
				}
			],
			btns:[{}],
		},
		// 使用项目选择器获得状态 项目选择器配置
		stateSelect:{
			title:'状态列表',
			classVisible: 	false,
			searchVisible:false,//可允许搜索
			classAjax: 		{},
			containerMode: 	'inner',
			listAjax: 		{
				textField: 	'text',
				valueField: 'id',
			},
		},
		// 状态分组弹框配置
		groupsConfig:{
			id: 				"dialog-stateGroup",
			title: 				"",
			size: 				"b",
			form: [
				{
					id:'stateType',
					label:'状态类别',
					type:'radio',
					textField:'name',
					valueField:'id',
					subdata:[
						{id:'form',name:'表单'},
						{id:'table',name:'表格'},
					],
					value:'form',
				},{
					id: 		'groupsName',
					label: 		'分组名字',
					type: 		'radio',
					textField: 	'name',
					valueField: 'id',
					subdata:[
						{
							id:'field-more',
							name:'更多',
						},{
							id:'field-sever',
							name:'分离的表单',
						}
					],
					// hidden:   	true,
				},{
					id: 		'gid',
					label: 		'',
					type: 		'hidden',
				},{
					html: '<div id="dialogProject"></div>'
				},{
					html: '<div id="stateGroupsList" class="state-group-list"></div>'
				}
			],
			btns:[{}],
		},
		// 选择vo下的保存过的状态
		getSelectStateArrById:function(id){
			var voList = voMapTable.processContent.vo;
			for(var indexI=0;indexI<voList.length;indexI++){
				if(id == voList[indexI].id){
					if(voList[indexI].config2 == null){
						voList[indexI].config2 = {
							fields:{},
							states:[],
						}
					}else{
						if(typeof(voList[indexI].config2) == 'string'){
							voList[indexI].config2 = JSON.parse(voList[indexI].config2);
						}
						voList[indexI].config2.states = $.isArray(voList[indexI].config2.states) ? voList[indexI].config2.states : [];
					}
					// this.voRes = voList[indexI];
					return [voList[indexI].config2.states,voList[indexI]];
				}
			}
		},
		//获取基本数据 显示表格时候已经执行
		getVO:function(voRes){
			var voList = voMapTable.processContent.vo;
			this.voFields = {};
			for(var indexI=0;indexI<voList.length;indexI++){
				this.voFields[voList[indexI].id] = {
					name:voList[indexI].voName,
					fields:voList[indexI].originalContent.fields,
				};
			}
			//保存过的状态字段
			var stateDataArray =  [];
			this.stateDataArray = stateDataArray;
			//vo列表的subdata
			var voSelectSubdata = [];

			for(var voKey in this.voFields){
				var subDataObj = {
					id:voKey,
					text:this.voFields[voKey].name,
				}
				voSelectSubdata.push(subDataObj);
			}
			this.voSelectSubdata = voSelectSubdata;
			return ;
		},
		//获取字段下拉列表
		getFieldSubdata:function(fieldKey){
			var subdata = [];
			var fieldArray = this.voFields[fieldKey].fields;
			for(var i = 0; i<fieldArray.length; i++){
				if(fieldArray[i].variableType == 'none'){
					continue;
				}
				var subDataObj = {
					id:fieldArray[i].gid,
					text:fieldArray[i].chineseName
				}
				subdata.push(subDataObj)
			}
			return subdata;
		},
		// 获得状态默认
		getState:function(valueArr){
			var valA = [];
			for(valI=0;valI<valueArr.length;valI++){
				valA.push(valueArr[valI].gid);
			}
			return JSON.stringify(valA);
		},
		getValues:function(){
			var values = nsForm.getFormJSON(this.config.id);
			if(!values){
				return false;
			}
			if(values.chineseName == '默认全部字段' || values.englishName == 'defalut'){
				nsAlert('中文名字或英文名字错误','error');
				console.error(values);
				return false;
			}
			var StateValues = nsUI.projectSelect.getData();
			if(!StateValues){
				return false;
			}
			values.fields = StateValues;
			return values;
		},
		getNames:function(_stateFieldArr){
			//_stateFieldArr: 			项目选择器组件获得的fields数据,
			var stateFieldArr = [];
			for(fieldI=0;fieldI<_stateFieldArr.length;fieldI++){
				// 根据id查询englishName
				var fields = this.voRes.processData.fields;
				var englishName = this.getEnglishNameByGid(_stateFieldArr[fieldI].id,fields);
				stateFieldArr.push({
					gid:_stateFieldArr[fieldI].id,
					chineseName:_stateFieldArr[fieldI].text,
					englishName:englishName,
					mindjetIndexState:fieldI,
				});
			}
			return stateFieldArr;
		},
		// 通过gid获得字段englishName
		getEnglishNameByGid:function(gid,fields){
			var englishName = '';
			for(var index=0;index<fields.length;index++){
				if(gid == fields[index].gid){
					englishName =  fields[index].englishName;
					break;
				}
			}
			return englishName;
		},
		add:function(){
			var _this = this;

			var dialogConfig = $.extend(true, {}, this.config);
			
			dialogConfig.title = '新增状态';
			dialogConfig.form[2].subdata = this.voSelectSubdata;

			dialogConfig.btns[0] = {
				text:'新增',
				handler:function(){
					var values = _this.getValues();
					if(values){
						values.type = 'add';
						_this.stateBtnsFunc(values);
					}else{
						nsAlert('请检查配置是否正确','error');
					}
				}
			}
			nsdialog.initShow(dialogConfig);
		},
		edit:function(_values){
			if(_values.voId){
				// 选择vo下的保存过的状态
				var stateAndVo = setStateDialog.getSelectStateArrById(_values.voId);
				setStateDialog.stateDataArray = stateAndVo[0];
				setStateDialog.voRes = stateAndVo[1];
				// 根据gid获得config2配置
				var values = this.getConfig2StateByGid(_values);
				//values 是状态表格上获取的数据
				if(values){
					// console.log(values);
				}else{
					// confige2中没有
					// console.log(_values);
					var defaultValues = $.extend(true,{},_values);
					var defaultFields = $.extend(true,[],defaultValues.field);
					delete defaultValues.field;
					defaultValues.fieldNames = defaultFields;
					values = defaultValues;
				}
				values.index = _values.index;
				var _this = this;
				var dialogConfig = $.extend(true, {}, this.config);
				
				dialogConfig.title = '修改状态';
				//选择VO下拉框的选项
				dialogConfig.form[2].subdata = this.voSelectSubdata;

				dialogConfig.btns[0] = {
					text:'修改',
					handler:function(){
						var editValues = _this.getValues();
						if(editValues){
							if(editValues.voId != _values.voId){
								editValues.type = 'delAdd';
								editValues.delGid = values.gid;
								editValues.delVoId = values.voId;
								_this.stateBtnsFunc(editValues);
							}else{
								editValues.type = 'edit';
								_this.stateBtnsFunc(editValues,values);
							}
							
						}else{
							nsAlert('请检查配置是否完整','error');
						}
					}
				}
				//对下拉框重新赋值
				nsForm.resetValues(values,dialogConfig);
				nsdialog.initShow(dialogConfig);
				// 状态配置
				var stateSelect = $.extend(true, {}, setStateDialog.stateSelect);
				stateSelect.$container = $("#dialogProject");
				// 状态项目组件配置
				stateSelect.listAjax.dataSource = setStateDialog.getFieldSubdata(values.voId);
				stateSelect.selected = setStateDialog.getState(values.fieldNames);
				nsUI.projectSelect.clear();
				nsUI.projectSelect.init(stateSelect);
			}else{
				nsAlert('默认状态不可编辑');
			}
		},
		delete:function(_values){
			if(_values.voId){
				// 选择vo下的保存过的状态
				// setStateDialog.stateDataArray = setStateDialog.getSelectStateArrById(_values.voId);
				var stateAndVo = setStateDialog.getSelectStateArrById(_values.voId);
				setStateDialog.stateDataArray = stateAndVo[0];
				setStateDialog.voRes = stateAndVo[1];
				// 根据gid获得config2配置
				var values = this.getConfig2StateByGid(_values);
				//values 是状态表格上获取的数据
				if(values){
					var _this = this;
					nsConfirm('是否确认删除当前状态：'+values.chineseName, function(isConfirm){
						if(isConfirm){
							deleteValues = {};
							deleteValues.idTimeStamp = values.idTimeStamp;
							deleteValues.index = values.index;
							deleteValues.voName = values.voName;
							deleteValues.type = 'delete';
							deleteValues.chineseName = ''; 	//要删除了，名字就不需要验证了
							// deleteValues.fields = ''; 	//字段也用不着了
							deleteValues.gid = values.gid;
							_this.save(deleteValues);
							voMapTable.setData(voMapTable.processContent.state,'state');
						}
					}, 'warning')				
				}else{
					// confige2中没有
				}
			}else{
				nsAlert('默认状态不可编辑');
			}	
		},
		stateBtnsFunc:function(values,souValues){
			var _this = this;
			//名称数据（包含中英文）
			values.fieldNames = _this.getNames(values.fields);
			delete values.fields; // 删除没有用的字段
			values.voName = setStateDialog.voRes.voName;
			values.voFullName = setStateDialog.voRes.name;
			values.mindMapId = setStateDialog.voRes.mindMapId; // 思维导图id
			values.entityName = listTable.getRowDataById(values.mindMapId).name; // 实体名字
			values.fieldsChineseName = _this.getChineseNameStr(values.fieldNames);
			switch(values.type){
				case 'add':
					values.gid = nsTemplate.newGuid();
					values.index = -1;
					values.idTimeStamp = new Date().getTime();
					break;
				case 'edit':
					values.idTimeStamp = souValues.idTimeStamp;
					values.index = souValues.index;
					values.gid = souValues.gid;  //原来的gid
					if(souValues.stateGroups){
						var editorValuesGroup = _this.getGroupsByEditorValues(values,souValues.stateGroups);
						if(!$.isEmptyObject(editorValuesGroup.groups)){
							values.stateGroups = editorValuesGroup;
							// 修改是新增的字段默认保存在field中 只有表单才会有这种情况 表格忽略新增字段
							var fieldGid = ''; // field的gid
							var groupFields = []; // 分组的所有字段
							for(var gidKey in values.stateGroups.groups){
								if(values.stateGroups.groups[gidKey].groupsName == 'field'){
									fieldGid = gidKey;
								}
								// 修改为最新顺序
								var groupFields = values.stateGroups.groups[gidKey].fields;
								for(var i=0;i<groupFields.length;i++){
									var groupFieldGid = groupFields[i].gid;
									for(var fieldNameI=0;fieldNameI<values.fieldNames.length;fieldNameI++){
										if(values.fieldNames[fieldNameI].gid == groupFieldGid){
											groupFields[i].mindjetIndexState = values.fieldNames[fieldNameI].mindjetIndexState;
											break;
										}
									}
								}
								groupFields = groupFields.concat(groupFields);
							}
							if(fieldGid){
								var fieldFieldsArr = values.stateGroups.groups[fieldGid].fields;
								for(var i=0;i<values.fieldNames.length;i++){
									var isAddField = true; // 是否是新增的字段
									for(var j=0;j<groupFields.length;j++){
										if(groupFields[j].gid == values.fieldNames[i].gid){
											isAddField = false;
											break;
										}
									}
									if(isAddField){
										fieldFieldsArr.push(values.fieldNames[i]);
									}
								}
							}
						}
					}
					if(souValues.editFields){
						var stateEditFields = _this.getEditorFieldsByEditorValues(values,souValues.editFields);
						if(!$.isEmptyObject(stateEditFields)){
							values.editFields = stateEditFields;
						}
					}
					break;
				case 'delAdd':
					values.gid = nsTemplate.newGuid();
					values.index = -1;
					values.idTimeStamp = new Date().getTime();
					break;
			}
			var isSuccess = _this.save(values);
			if(isSuccess){
				voMapTable.setData(voMapTable.processContent.state,'state');
				setStateDialog.hide();
			}
		},
		// 获得编辑的状态字段 删除已经删除的通过编辑的数据
		getEditorFieldsByEditorValues:function(editorVal,_editFields){
			var editFields = {};
			var fields = editorVal.fieldNames;
			for(var fieI=0;fieI<fields.length;fieI++){
				if(_editFields[fields[fieI].gid]){
					editFields[fields[fieI].gid] = _editFields[fields[fieI].gid];
				}
			}
			return editFields;
		},
		// 获得编辑的状态分组 删除已经删除的通过编辑的数据
		getGroupsByEditorValues:function(editorVal,_stateGroups){
			var fields = editorVal.fieldNames;
			var stateGroups = {
				groups:{},
				stateType:_stateGroups.stateType,
			};
			for(var groupGid in _stateGroups.groups){
				stateGroups.groups[groupGid] = {
					fields:[],
					gid:_stateGroups.groups[groupGid].gid,
					groupsName:_stateGroups.groups[groupGid].groupsName,
					order:_stateGroups.groups[groupGid].order,
				}
				var groupFields = _stateGroups.groups[groupGid].fields;
				for(var groupI=0;groupI<groupFields.length;groupI++){
					var groupFieGid = groupFields[groupI].gid;
					var isHave = false;
					for(var fieI=0;fieI<fields.length;fieI++){
						if(fields[fieI].gid == groupFieGid){
							isHave = true;
						}
					}
					if(isHave){
						stateGroups.groups[groupGid].fields.push(groupFields[groupI]);
					}
				}
				if(stateGroups.groups[groupGid].fields.length==0){
					delete stateGroups.groups[groupGid];
				}
			}
			return stateGroups;
		},
		//保存数据
		save:function(values,nsAlertStr){
			var _this = this;
			if(values){
				var config2State = $.isArray(this.voRes.config2.states)?this.voRes.config2.states : [];
				var processDataState = this.voRes.processData.states;
				var processContentState = voMapTable.processContent.state;
				switch(values.type){
					case 'add':
						//查找是否重复了
						var stateName = values.englishName;
						for(var i = 0; i<this.stateDataArray.length; i++){
							if(this.stateDataArray[i].englishName == stateName){
								nsAlert('状态英文名重复','error');
								return false;
							}
						}
						var stateChineseName = values.chineseName;
						for(var i = 0; i<this.stateDataArray.length; i++){
							if(this.stateDataArray[i].chineseName == stateChineseName){
								nsAlert('状态中文名重复','error');
								return false;
							}
						}
						config2State.push(values);
						var formatState = this.formatStateDataByEditFieldNames(values);
						processDataState.push(formatState);
						processContentState.push(formatState);
						if(nsAlertStr){
							nsAlert(nsAlertStr);
						}else{
							nsAlert('新增成功');
						}
						break;
					case 'edit':
						var stateGid = values.gid;
						for(var i = 0; i<config2State.length; i++){
							if(config2State[i].gid == stateGid){
								config2State[i] = values;
							}
						}
						for(var i = 0; i<processDataState.length; i++){
							if(processDataState[i].gid == stateGid){
								var formatState = this.formatStateDataByEditFieldNames(values);
								processDataState[i] = formatState;
							}
						}
						for(var i = 0; i<processContentState.length; i++){
							if(processContentState[i].gid == stateGid){
								var formatState = this.formatStateDataByEditFieldNames(values);
								processContentState[i] = formatState;
							}
						}
						if(nsAlertStr){
							nsAlert(nsAlertStr);
						}else{
							nsAlert('修改成功');
						}
						break;
					case 'delete':
						var stateGid = values.gid;
						for(var i = 0; i<config2State.length; i++){
							if(config2State[i].gid == stateGid){
								config2State.splice(i,1);
							}
						}
						for(var i = 0; i<processDataState.length; i++){
							if(processDataState[i].gid == stateGid){
								processDataState.splice(i,1);
							}
						}
						for(var i = 0; i<processContentState.length; i++){
							if(processContentState[i].gid == stateGid){
								processContentState.splice(i,1);
							}
						}
						if(nsAlertStr){
							nsAlert(nsAlertStr);
						}else{
							nsAlert('删除成功');
						}
						break;
					case 'addGroups':
						var stateGid = values.gid;
						for(var i = 0; i<config2State.length; i++){
							if(config2State[i].gid == stateGid){
								config2State[i] = values;
							}
						}
						// if(){}
						for(var i = 0; i<processDataState.length; i++){
							if(processDataState[i].gid == stateGid){
								var formatState = this.formatStateDataByEditFieldNames(values);
								processDataState[i] = formatState;
							}
						}
						for(var i = 0; i<processContentState.length; i++){
							if(processContentState[i].gid == stateGid){
								var formatState = this.formatStateDataByEditFieldNames(values);
								processContentState[i] = formatState;
							}
						}
						if(nsAlertStr){
							nsAlert(nsAlertStr);
						}else{
							nsAlert('分组成功');
						}
						break;
					case 'delAdd':
						var stateAndVo = setStateDialog.getSelectStateArrById(values.delVoId);
						var stateDataArray = stateAndVo[0];
						var voRes = stateAndVo[1];
						var delConfig2State = voRes.config2.states;
						var delProcessDataState = voRes.processData.states;
						var delProcessContentState = voMapTable.processContent.state;
						var delStateGid = values.delGid;
						for(var i = 0; i<delConfig2State.length; i++){
							if(delConfig2State[i].gid == delStateGid){
								delConfig2State.splice(i,1);
							}
						}
						for(var i = 0; i<delProcessDataState.length; i++){
							if(delProcessDataState[i].gid == delStateGid){
								delProcessDataState.splice(i,1);
							}
						}
						for(var i = 0; i<delProcessContentState.length; i++){
							if(delProcessContentState[i].gid == delStateGid){
								delProcessContentState.splice(i,1);
							}
						}
						delete values.delVoId;
						delete values.delGid;
						values.type = 'add';
						//查找是否重复了
						var stateName = values.englishName;
						for(var i = 0; i<this.stateDataArray.length; i++){
							if(this.stateDataArray[i].englishName == stateName){
								nsAlert('状态英文名重复','error');
								return false;
							}
						}
						var stateChineseName = values.chineseName;
						for(var i = 0; i<this.stateDataArray.length; i++){
							if(this.stateDataArray[i].chineseName == stateChineseName){
								nsAlert('状态中文名重复','error');
								return false;
							}
						}
						config2State.push(values);
						var formatState = this.formatStateDataByEditFieldNames(values);
						processDataState.push(formatState);
						processContentState.push(formatState);
						if(nsAlertStr){
							nsAlert(nsAlertStr);
						}else{
							nsAlert('修改成功');
						}
						break;
				}
				return true;
			}
		},
		// 获得config2中的状态
		getConfig2StateByGid:function(_values){
			var values = false;
			var stateDataArray = this.stateDataArray;
			if(stateDataArray.length == 0){
			}else{
				for(index=0;index<stateDataArray.length;index++){
					if(_values.gid == stateDataArray[index].gid){
						values = stateDataArray[index];
					}
				}
			}
			return values;
		},
		// 格式化状态数据通过编辑的fieldNames数据
		formatStateDataByEditFieldNames:function(objState){
			var formatState = {
				chineseName:objState.chineseName,
				englishName:objState.englishName,
				field:objState.fieldNames,
				gid:objState.gid,
				index:objState.index,
				voName:objState.voName,
				fieldsChineseName:objState.fieldsChineseName,
				voId:objState.voId,
				mindMapId:objState.mindMapId,
				entityName:objState.entityName,
			}
			return formatState;
		},
		// 格式化状态数据通过编辑的stateGroups数据
		formatStateDataByEditStateGroups:function(objState){
			var formatState = {
				chineseName:objState.chineseName,
				englishName:objState.englishName,
				// field:objState.fieldNames,
				gid:objState.gid,
				index:objState.index,
				voName:objState.voName,
				fieldsChineseName:objState.fieldsChineseName,
				voId:objState.voId,
				mindMapId:objState.mindMapId,
				entityName:objState.entityName,
			}
			var stateGroups = objState.stateGroups.groups;
			switch(objState.stateGroups.stateType){
				case 'table':
					formatState.tabs = [];
					for(var keyGid in stateGroups){
						for(var index=0;index<stateGroups[keyGid].fields.length;index++){
							var fielsObj = {
								mindjetTabGid:stateGroups[keyGid].gid,
								mindjetTabName:stateGroups[keyGid].groupsName,
								mindjetTabNamePosition:stateGroups[keyGid].order,
								gid:stateGroups[keyGid].fields[index].gid,
								chineseName:stateGroups[keyGid].fields[index].chineseName,
								englishName:stateGroups[keyGid].fields[index].englishName,
								mindjetIndexState:stateGroups[keyGid].fields[index].mindjetIndexState,
							}
							formatState.tabs.push(fielsObj);
						}
					}
					break;
				case 'form':
					for(var keyGid in stateGroups){
						formatState[stateGroups[keyGid].groupsName] = stateGroups[keyGid].fields;
					}
					break;
			}

			return formatState;
		},
		// 根据选择的字段获得中文字段名
		getChineseNameStr:function(fieldsArr){
			var chineseNameStr = '';
			for(var index=0;index<fieldsArr.length;index++){
				chineseNameStr += fieldsArr[index].chineseName + ',';
			}
			return chineseNameStr.substring(0,chineseNameStr.length-1);
		},
		stateGroups:{
			// form表单的changeHandler
			formChangeHandler:function(selectId){
				var values = this.values;
				var editFormArr = [
					{
						id:     	'groupsName',
						value: 		'',
					},{
						id: 		'gid',
						value: 		'',
					}
				];
				if(selectId=='form'){
					editFormArr[0].type = 'radio';
				}else{
					editFormArr[0].type = 'text';
				}
				nsForm.edit(editFormArr,setStateDialog.groupsConfig.id);
			},
			// 弹框按钮配置 
			setDialogBtn:function(dialogConfig){
				// 表格新增分组按钮
				dialogConfig.btns[0] = {
					text:'保存分组',
					handler:function(){
						setStateDialog.stateGroups.add();
					}
				};
				// 确定按钮配置
				dialogConfig.btns[1] = {
					text:'确定',
					handler:function(){
						setStateDialog.stateGroups.save();
					}
				}
			},
			// 获得选中项
			getSelected:function(arr){
				var selectedArr = [];
				for(index=0;index<arr.length;index++){
					selectedArr.push(arr[index].gid);
				}
				return JSON.stringify(selectedArr);
			},
			// 显示项目编辑器
			showProject:function(dataSource,selectedStr,title){
				title = typeof(title) == 'undefined' ? '' : title;
				var stateSelect = $.extend(true, {}, setStateDialog.stateSelect);
				stateSelect.title = title;
				stateSelect.$container = $("#dialogProject");
				stateSelect.listAjax.textField = 'chineseName';
				stateSelect.listAjax.valueField = 'gid';
				stateSelect.listAjax.dataSource = dataSource;
				stateSelect.selected = selectedStr;
				nsUI.projectSelect.clear();
				nsUI.projectSelect.init(stateSelect);
			},
			// 获得所有项 设置已选择即禁用
			getSetIsInResultList:function(arr){
				var values = this.values;
				var fieldNames = $.extend(true,[],values.fieldNames);
				for(var indexI=0;indexI<fieldNames.length;indexI++){
					for(var indexJ=0;indexJ<arr.length;indexJ++){
						if(fieldNames[indexI].gid == arr[indexJ].gid){
							fieldNames[indexI].isInResult = true;
						}
					}
				}
				return fieldNames;
			},
			// 根据values.stateGroups 初始化项目组件
			initProjectByStateGroup:function(){
				var values = this.values;
				var stateGroupsFields = []; // 选中项的对象
				var selectedArrStr = ''; // 选中项 转字符串
				var stateType = ''; // 状态分组类型 table/form 
				if(values.stateGroups){
					var defForm = {}; // 表单的默认值
					var stateGroups = values.stateGroups;
					stateType = stateGroups.stateType;
					var groups = stateGroups.groups;
					if(stateType == 'form'){
						for(var keyGid in groups){
							if(groups[keyGid].groupsName == 'field-more'){
								stateGroupsFields = groups[keyGid].fields;
								defForm = {gid:groups[keyGid].gid,groupsName:'field-more'};
							}
						}
					}else{
						var tabObj = {};
						for(var keyGid in groups){
							tabObj = {
								groupsName:groups[keyGid].groupsName,
								fields:groups[keyGid].fields,
								gid:groups[keyGid].gid,
							};
							break;
						}
						defForm = {groupsName:tabObj.groupsName,gid:tabObj.gid};
						stateGroupsFields = tabObj.fields;
					}
					// nsFormBase.setValues(defForm,'dialog-stateGroup'); // 表单赋默认值
				}
				if(stateGroupsFields.length>0){
					selectedArrStr = this.getSelected(stateGroupsFields);
				}
				// if(stateType == 'form'){
				// 	var fieldNames = this.getSetIsInResultList(stateGroupsFields);
				// 	this.showProject(fieldNames,selectedArrStr,'设置表单的field-more');
				// }else{
					this.refreshProject();
				// }
			},
			// 根据values.stateGroups 刷新项目组件
			refreshProject:function(selected){
				selected = typeof(selected) == 'undefined' ? '' : selected;
				var values = this.values;
				var stateGroupsArr = []; // 已经选过的字段
				if(values.stateGroups){
					var stateGroups = $.extend(true,{},values.stateGroups.groups);
					for(var keyGid in stateGroups){
						for(var index=0;index<stateGroups[keyGid].fields.length;index++){
							stateGroupsArr.push(stateGroups[keyGid].fields[index]);
						}
					}
				}
				var fieldNames = this.getSetIsInResultList(stateGroupsArr);
				this.showProject(fieldNames,selected,'设置表格tabs页');
			},
			// 格式化选择字段
			getFormatGroupState:function(arr){
				var resArr = [];
				for(var index=0;index<arr.length;index++){
					var fieldObj = {
						chineseName:arr[index].chineseName,
						englishName:arr[index].englishName,
						gid:arr[index].gid,
						mindjetIndexState:arr[index].mindjetIndexState,
					};
					resArr.push(fieldObj);
				}
				return resArr;
			},
			edit:function(editObj){
				var values = this.values;
				// var stateType = values.stateGroups.stateType;
				var stateGroups = values.stateGroups.groups;
				// if(stateType=='form'){
				// 	var obj = {gid:}
				// }else{
				// 	var obj = {groupsName:stateGroupsName}
				// 	/*var obj = {groupsName:stateGroupsName}
				// 	nsFormBase.setValues(obj,'dialog-stateGroup');*/
				// }
				nsFormBase.setValues(editObj,'dialog-stateGroup');
				var selectedArrStr = this.getSelected(stateGroups[editObj.gid].fields);
				this.refreshProject(selectedArrStr);
			},
			delete:function(delObj){
				var values = this.values;
				var delOrder = values.stateGroups.groups[delObj.gid].order;
				delete values.stateGroups.groups[delObj.gid];
				for(var groupGid in values.stateGroups.groups){
					if(values.stateGroups.groups[groupGid].order>delOrder){
						values.stateGroups.groups[groupGid].order--;
					}
				}
				var obj = {groupsName:'',gid:''}
				nsFormBase.setValues(obj,'dialog-stateGroup');
				this.refreshProject();
				setStateDialog.stateGroupsList.init(values);
			},
			add:function(){
				var values = this.values;
				var formData = nsForm.getFormJSON('dialog-stateGroup');
				var stateValues = nsUI.projectSelect.getData(); // 选择的分组字段
				if(stateValues){
					stateValues = this.getFormatGroupState(stateValues); // 格式化分组字段
					var isTrue = this.addEditGroups(formData,stateValues);
					if(isTrue){
						nsAlert('新增成功');
					}
				}else{
					nsAlert('没有选择新增列表');
					return false;
				}
			},
			// 新增/编辑分组
			addEditGroups:function(formData,stateValues){
				var values = this.values;
				// 判断是否存在分组名字 若不存在 报错
				var groupsName = formData.groupsName;
				if(groupsName == ''){
					nsAlert('没有设置分组名字名','error');
					return false;
				}
				switch(formData.stateType){
					case 'form':
						// 表单分组名字只能是field或field-more或field-sever
						if(groupsName!='field-more'&&groupsName!='field-sever'){
							nsAlert('表单的分组名称只能是field-more或field-sever','error');
							return false;
						}
						// 分组名子是否重复
						if(values.stateGroups){
							for(var keyGid in values.stateGroups.groups){
								var groupObj = values.stateGroups.groups[keyGid];
								if(groupsName == groupObj.groupsName && formData.gid != groupObj.gid){
									nsAlert('表单的分组名称重复，若想编辑请对原来的进行编辑','error');
									return false;
								}
							}
						}
						break;
					case 'table':
						break;
				}
				// 根据gid判断新增/修改
				if(formData.gid == ''){
					// 新增
					if($.isEmptyObject(values.stateGroups)){
						values.stateGroups = {
							stateType:formData.stateType,
							groups:{},
						}
					}
					var order = this.getObjLength(values.stateGroups.groups);
					var stateObj = {
						gid:nsTemplate.newGuid(),
						groupsName:groupsName,
						fields:stateValues,
						order:order,
					}
					values.stateGroups.groups[stateObj.gid] = stateObj;
				}else{
					// 修改
					values.stateGroups.groups[formData.gid].gid = formData.gid;
					values.stateGroups.groups[formData.gid].groupsName = formData.groupsName;
					values.stateGroups.groups[formData.gid].fields = stateValues;
				}
				// 新增修改完后刷新表单/项目选择器
				var obj = {groupsName:'',gid:''}
				nsFormBase.setValues(obj,'dialog-stateGroup');
				this.refreshProject();
				setStateDialog.stateGroupsList.init(values);
			},
			// 获得对象的长度
			getObjLength:function(obj){
				var len = 0;
				for(var key in obj){
					len++;
				}
				return len;
			},
			// 切换两个对象的order 刷新 list
			switchObjOrderRef:function(gid1,gid2){
				var obj1 = this.values.stateGroups.groups[gid1];
				var obj2 = this.values.stateGroups.groups[gid2];
				var order = obj1.order;
				obj1.order = obj2.order;
				obj2.order = order;
				setStateDialog.stateGroupsList.init(this.values);
			},
			save:function(){
				var values = this.values;
				if(typeof(values.stateGroups)=='undefined'){
					nsAlert('还没有分组','error');
					return false;
				}
				if($.isEmptyObject(values.stateGroups.groups)){
					delete values.stateGroups;
					values.type = 'edit';
					setStateDialog.save(values);
					return;
				}
				values.type = 'addGroups';
				
				// 删除添加的字段 只有表单可以添加
				if(values.stateGroups.stateType == 'table'){
					if(values.editFields){
						for(var gid in values.editFields){
							if(values.editFields[gid].variableType == 'other'){
								delete values.editFields[gid];
							}
						}
					}
				}else{
					// 表单数组剩余的字段为field 若剩余字段为空保存失败
					var fieldArr = [];
					for(var indexI=0;indexI<values.fieldNames.length;indexI++){
						var isSelect = false;
						for(var gid in values.stateGroups.groups){
							var stateField = values.stateGroups.groups[gid].fields;
							for(var indexJ=0;indexJ<stateField.length;indexJ++){
								if(values.fieldNames[indexI].gid == stateField[indexJ].gid){
									isSelect = true;
								}
							}
						}
						if(!isSelect){
							fieldArr.push(values.fieldNames[indexI]);
						}
					}
					if(fieldArr.length==0){
						nsAlert('表单状态必须有field，字段全部编辑时field不存在','error');
						return false;
					}
					var isEditor = false;
					// 修改
					for(var gid in values.stateGroups.groups){
						if(values.stateGroups.groups[gid].groupsName=='field'){
							isEditor = true;
							values.stateGroups.groups[gid].fields = fieldArr;
						}
					}
					if(!isEditor){
						// 新增
						var order = this.getObjLength(values.stateGroups.groups);
						var stateObj = {
							gid:nsTemplate.newGuid(),
							groupsName:'field',
							fields:fieldArr,
							order:order,
						}
						values.stateGroups.groups[stateObj.gid] = stateObj;
					}
				}
				setStateDialog.save(values);
			},
			init:function(_values){
				if(_values.voId){
					// 选择vo下的保存过的状态
					// setStateDialog.stateDataArray = setStateDialog.getSelectStateArrById(_values.voId);
					var stateAndVo = setStateDialog.getSelectStateArrById(_values.voId);
					setStateDialog.stateDataArray = stateAndVo[0];
					setStateDialog.voRes = stateAndVo[1];
					// 根据gid获得config2配置
					var values = setStateDialog.getConfig2StateByGid(_values);
					//values 是状态表格上获取的数据
					if(values){
					}else{
						// 编辑默认状态
						var defaultValues = $.extend(true,{},_values);
						var defaultFields = $.extend(true,[],defaultValues.field);
						delete defaultValues.field;
						defaultValues.fieldNames = defaultFields;
						values = defaultValues;
					}
					values.index = _values.index;
					this.sourceValues = values;
					this.values = $.extend(true,{},values);
					var dialogConfig = $.extend(true, {}, setStateDialog.groupsConfig);
					dialogConfig.title = '状态分组';
					dialogConfig.form[0].changeHandler = function(selectId){
						setStateDialog.stateGroups.formChangeHandler(selectId);
						var values = setStateDialog.stateGroups.values;
						values.stateGroups = undefined;
						var title = '设置表格tabs页';
						if(selectId == 'form'){
							title = '设置表单的field-more';
						}
						var fieldNames = $.extend(true,[],values.fieldNames);
						setStateDialog.stateGroups.showProject(fieldNames,'',title);
						setStateDialog.stateGroupsList.init(values);
					};
					// 根据values.stateGroups 的stateType 为表单的 stateType附初值
					if(this.values.stateGroups){
						var stateType = this.values.stateGroups.stateType;
						dialogConfig.form[0].value = stateType;
						if(stateType == 'table'){
							// dialogConfig.form[1].hidden = false;
							dialogConfig.form[1].type = 'text';
						}
						// 删除表单的field分组
						if(stateType=='form'){
							for(var gid in this.values.stateGroups.groups){
								if(this.values.stateGroups.groups[gid].groupsName == 'field'){
									delete this.values.stateGroups.groups[gid];
								}
							}
						}
					}
					this.setDialogBtn(dialogConfig);
					nsdialog.initShow(dialogConfig);
					this.initProjectByStateGroup();
					setStateDialog.stateGroupsList.init(this.values);
				}
			}
		},
		stateGroupsList:{
			// 根据分组中的order属性获得排序数组
			getOrderArrByGroups:function(groups){
				var orderObj = {};
				var num = 0;
				var orderObjArr = [];
				for(var keyGid in groups){
					if(typeof(groups[keyGid].order)=='undefined'){
						// 为了兼容已经保存的表单状态
						groups[keyGid].order = num;
					}
					num++;
					orderObj[groups[keyGid].order] = keyGid;
					orderObjArr.push({
						order : groups[keyGid].order,
						gid : keyGid,
					});
				}
				orderObjArr.sort(function(a,b){
					a.order-b.order;
				});
				var orderArr = [];
				for(var i=0; i<orderObjArr.length; i++){
					orderArr.push(orderObjArr[i].gid);
				}
				// orderObj.length = num;debugger
				// let obj = orderObj;
				// let orderArr = Array.prototype.slice.call(obj);
				return orderArr;
			},
			// 获取List的html
			getListHtml:function(groups,stateType){
				var btnsSty = '';
				// if(hide!='hide'){
				// 	btnsSty = 'min-width:120px;';
				// }
				var hide = '';
				switch(stateType){
					case 'form':
						hide = 'hide';
						break;
					case 'table':
						btnsSty = 'min-width:120px;';
						break;
				}
				// 根据statesGroup中的order排序order 根据得到的数组 展示 分组信息 并进行顺序调整
				var orderArr = this.getOrderArrByGroups(groups);
				var listNamesLi = '';
				for(var index=0;index<orderArr.length;index++){
					var listNames = '';
					for(var indexI=0;indexI<groups[orderArr[index]].fields.length;indexI++){
						listNames += '<span>'+groups[orderArr[index]].fields[indexI].chineseName + '</span>';
					}
					var labelStr = groups[orderArr[index]].groupsName;
					if(stateType == 'form'){
						labelStr = groups[orderArr[index]].groupsName=='field-more'?'更多':'分离的表单';
					}
					listNamesLi += '<li>'
									+'<label class="label" gid="'+groups[orderArr[index]].gid+'" nsType="'+groups[orderArr[index]].groupsName+'">'+labelStr+'</label>'
									+'<div class="state-group-content">'
										+listNames
									+'</div>'
									+'<div class="btn-group" style="'+btnsSty+'">'
										+'<button class="btn btn-info btn-icon">'
											+'<i class="fa fa-edit"></i>'
										+'</button>'
										+'<button class="btn btn-info btn-icon">'
											+'<i class="fa fa-trash"></i>'
										+'</button>'
										+'<button class="btn btn-info btn-icon '+hide+'">'
											+'<i class="fa fa-arrow-up"></i>'
										+'</button>'
										+'<button class="btn btn-info btn-icon '+hide+'">'
											+'<i class="fa fa-arrow-down"></i>'
										+'</button>'
									+'</div>'
								+'</li>'
				}
				if(listNamesLi.length > 0){
					var listHtml = '<ul>'+listNamesLi+'</ul>';
					return listHtml;
				}else{
					return false;
				}
			},
			// 设置按钮事件
			setButton:function(){
				this.$listHtml.find('button').on('click',function(ev){
					var $this = $(this);
					var $children = $this.children();
					var $parents = $(this).parents('li');
					var labelGid = $parents.children('label').attr('gid');
					var labelText = $parents.children('label').attr('nsType');
					var obj = {
						gid:labelGid,
						groupsName:labelText,
					}
					if($children.hasClass('fa-edit')){
						setStateDialog.stateGroups.edit(obj);
					}
					if($children.hasClass('fa-trash')){
						setStateDialog.stateGroups.delete(obj);
					}
					if($children.hasClass('fa-arrow-up')){
						var $prev = $parents.prev();
						if($prev.length == 0){
							nsAlert('已经是第一个了');
							return ;
						}
						var prevGid = $prev.children('label').attr('gid');
						setStateDialog.stateGroups.switchObjOrderRef(prevGid,labelGid);
					}
					if($children.hasClass('fa-arrow-down')){
						var $next = $parents.next();
						if($next.length == 0){
							nsAlert('已经是最后一个了');
							return ;
						}
						var nextGid = $next.children('label').attr('gid');
						setStateDialog.stateGroups.switchObjOrderRef(nextGid,labelGid);
					}
				})
			},
			init:function(values){
				$('#stateGroupsList').children().remove();
				this.sourceValues = $.extend(true,{},values);
				this.values = values;
				if(values.stateGroups){
					var stateGroups = $.extend(true,{},values.stateGroups);
					delete stateGroups.stateType;
					// var hide = ''; // 隐藏上下调节按钮 ‘’不隐藏/‘hide’隐藏
					// switch(values.stateGroups.stateType){
					// 	case 'form':
					// 		hide = 'hide';
					// 		break;
					// 	case 'table':
					// 		break;
					// }
					var listHtml = this.getListHtml(stateGroups.groups,values.stateGroups.stateType);
					if(listHtml){
						this.$listHtml = $(listHtml);
						this.setButton(this.$listHtml);
						$('#stateGroupsList').append(this.$listHtml);
					}
				}
			},
		},
		stateFieldsEdit:{
			config:{
				id: 				"dialog-stateFields",
				title: 				"状态字段编辑",
				size: 				"90%",
				isBackdropFalse: 	false,
				zIndex: 			998,
				form: [
					{
						type:'hidden',
						id:'id',
					},{
						html: '<div id="stateFieldsTable">'
								+'<div class="col-sm-12 main-panel">'
									+'<div class="panel panel-default">'
										+'<div class="panel-body">'
											+'<div class="table-responsive">'
												+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="stateFieldsTable-table">'
												+'</table>'
											+'</div>'
										+'</div>'
									+'</div>'
								+'</div>'
							+'</div>'
					}
				],
			},
			// 编辑状态字段弹框 行按钮
			editStateFieldsRowsBtn:[
				{
					"编辑":function(rowDatas){
						var rowData = rowDatas.rowData;
						var baseData = $.extend(true,{},rowData);
						delete baseData.id;
						delete baseData.btns;
						var object = {
							baseData:$.extend(true,{},baseData),
							id:'editor',
							type:'dialog',
							isMoreDialog:true,
							confirmHandler:function(saveData){
								if(saveData){
									setStateDialog.stateFieldsEdit.editFields[saveData.gid] = saveData;
									nsComponentEditor.closeFrame();
									voMapTable.refreshTableLine(saveData,rowDatas);
									nsAlert('添加成功');
								}
							},
						}
						if(rowData.variableType == 'other'){
							object.allData = setStateDialog.stateFieldsEdit.stateFieldsArr;
						}else{
							if(rowData.englishName == ''){
								nsAlert('英文名称不能为空','error');
								return false;
							}
							var vo = voMapTable.getVoById(baseData.gid,'vo');
							object.allData = vo.originalContent.fields;
							if(!vo){
								nsAlert('无法找到vo','error');
								return false;
							}
						}
						nsComponentEditor.init(object);
					}
				},{
					"编辑2":function(rowDatas){
						var rowData = rowDatas.rowData;
						var baseData = $.extend(true,{},rowData);
						delete baseData.id;
						delete baseData.btns;
						var object = {
							baseData:$.extend(true,{},baseData),
							id:'editor',
							type:'dialog',
							isMoreDialog:true,
							confirmHandler:function(saveData){
								if(saveData){
									saveData.isStateEditField = true; // 是否状态存储的编辑字段
									setStateDialog.stateFieldsEdit.editFields[saveData.gid] = saveData;
									NetstarComponentEditor.closeFrame();
									voMapTable.refreshTableLine(saveData,rowDatas);
									nsAlert('添加成功');
								}
							},
						}
						if(rowData.variableType == 'other'){
							object.allData = setStateDialog.stateFieldsEdit.stateFieldsArr;
						}else{
							if(rowData.englishName == ''){
								nsAlert('英文名称不能为空','error');
								return false;
							}
							var vo = voMapTable.getVoById(baseData.gid,'vo');
							object.allData = vo.originalContent.fields;
							if(!vo){
								nsAlert('无法找到vo','error');
								return false;
							}
						}
						NetstarComponentEditor.init(object);
					}
				},{
					"删除":function(rowDatas){
						var rowData = rowDatas.rowData;
						if(rowData.variableType == 'other'){
							nsConfirm('确定要删除：'+rowData.label+' 吗？',function(isConfirm){
								if(isConfirm){
									delete setStateDialog.stateFieldsEdit.editFields[rowData.gid];
									var trObj = rowDatas.obj.closest('tr');
									baseDataTable.delRowData('stateFieldsTable-table',trObj);
									nsAlert('删除成功');
								}
							},'warning');
							
						}else{
							nsAlert('该字段不可删除','error');
						}
					}
				}
			],
			// 保存编辑的状态字段按钮
			saveEditStateFieldsBtn:{
				selfBtn:
				[
					{
						text:'保存',
						handler:function(){
							if($.isEmptyObject(setStateDialog.stateFieldsEdit.editFields)){
								nsAlert('还没有编辑状态字段','error');
							}else{
								setStateDialog.stateFieldsEdit.values.editFields = setStateDialog.stateFieldsEdit.editFields;
								nsdialog.hide();
								nsAlert('保存成功');
							}
						},
					}
				]
			},
			init:function(_values){
				if(_values.voId){
					// 选择vo下的保存过的状态
					// setStateDialog.stateDataArray = setStateDialog.getSelectStateArrById(_values.voId);
					var stateAndVo = setStateDialog.getSelectStateArrById(_values.voId);
					setStateDialog.stateDataArray = stateAndVo[0];
					setStateDialog.voRes = stateAndVo[1];
					// 根据gid获得config2配置
					var values = setStateDialog.getConfig2StateByGid(_values);
					//values 是状态表格上获取的数据
					if(values){
						console.log(values);
					}else{
						// 状态不存在 只有默认状态会走这 默认状态已隐藏所以不会走到这
					}
					this.values = values;
					var stateFields = $.extend(true,[],values.fieldNames);

					var stateFieldsArr = []; // 获得状态字段数组
					for(var fieI=0;fieI<stateFields.length;fieI++){
						stateFieldsArr.push(stateFields[fieI]);
					}
					this.stateFieldsArr = stateFieldsArr;
					// 获得之前保存过的 状态编辑的fields字段
					this.editFields = {};
					if(values.editFields){
						this.editFields = $.extend(true,{},values.editFields);
					}

					var voFieldsGidObj = $.extend(true,{},setStateDialog.voRes.processData.fieldsByGid); // 当前vo所有的状态字段 gid格式的对象
					var stateEditFieldsArr = []; // 获得将要编辑的字段数组
					for(var fieI=0;fieI<stateFields.length;fieI++){
						var fieldGid = stateFields[fieI].gid;
						var fieldObj = voFieldsGidObj[fieldGid];
						var editObj = this.editFields[fieldGid];
						if(editObj){
							editObj.isStateEditField = true; // 是否状态存储的编辑字段
							stateEditFieldsArr.push(editObj);
						}else{
							stateEditFieldsArr.push(fieldObj);
						}
					}
					// 添加新增的字段
					for(var gid in this.editFields){
						if(this.editFields[gid].variableType == 'other'){
							stateEditFieldsArr.push(this.editFields[gid]);
						}
					}
					this.stateEditFieldsArr = stateEditFieldsArr;
					// 弹框配置
					var dialogConfig = $.extend(true,{},this.config);
					// 表格配置
					var dataConfig = $.extend(true,{},voMapTable.data);
					dataConfig.tableID = "stateFieldsTable-table";
					dataConfig.dataSource = stateEditFieldsArr;
					var columnConfig = $.extend(true,[],voMapTable.column.field);
					var isStateEditField = {
						field : 'isStateEditField',
						title : '是否再编辑',
						searchable: true,
						width:80,
					}
					columnConfig.splice(columnConfig.length-1,0,isStateEditField);
					columnConfig[columnConfig.length-1].formatHandler.data = $.extend(true,[],this.editStateFieldsRowsBtn);
					var uiConfig = $.extend(true,{},voMapTable.ui);
					var btnsConfig = $.extend(true,{},this.saveEditStateFieldsBtn);
					dialogConfig.shownHandler = function(){
						if($('#stateFieldsTable-table').children().length>0){
							uiConfig.$container = $('#stateFieldsTable');
						}
						baseDataTable.init(dataConfig, columnConfig, uiConfig, btnsConfig);
					}
					nsdialog.initShow(dialogConfig);
				}
			},
		},
		// 添加label/title/html/note/hr/br
		addSpecialField:{
			showEdit:function(stateFieldsArr){
				var object = {
					baseData:{
						variableType:'other',
					},
					allData:stateFieldsArr,
					id:'editor',
					type:'dialog',
					isMoreDialog:true,
					confirmHandler:function(saveData){
						if(saveData){
							saveData.gid = nsTemplate.newGuid();
							saveData.voName = setStateDialog.addSpecialField.values.voName;
							saveData.voFullName = setStateDialog.addSpecialField.values.voFullName;
							// var formatData = nsComponentEditor.getFormatData(saveData);
							if(typeof(setStateDialog.addSpecialField.values.editFields)=='undefined'){
								setStateDialog.addSpecialField.values.editFields = {};
							}
							setStateDialog.addSpecialField.values.editFields[saveData.gid] = saveData;
							nsAlert('添加成功');
							nsComponentEditor.closeFrame();
						}
					},
				}
				nsComponentEditor.init(object);
			},
			init:function(_values){
				if(_values.voId){
					// 选择vo下的保存过的状态
					var stateAndVo = setStateDialog.getSelectStateArrById(_values.voId);
					setStateDialog.stateDataArray = stateAndVo[0];
					setStateDialog.voRes = stateAndVo[1];
					// 根据gid获得config2配置
					var values = setStateDialog.getConfig2StateByGid(_values);
					//values 是状态表格上获取的数据
					if(values){
						console.log(values);
					}else{
						// 状态不存在 只有默认状态会走这 默认状态已隐藏所以不会走到这
					}
					this.values = values;
					var stateFields = $.extend(true,[],values.fieldNames);
					// 获得之前保存过的 状态编辑的fields字段
					this.editFields = {};
					if(values.editFields){
						this.editFields = $.extend(true,{},values.editFields);
					}
					var stateFieldsArr = []; // 获得状态字段数组
					for(var fieI=0;fieI<stateFields.length;fieI++){
						stateFieldsArr.push(stateFields[fieI]);
					}
					this.showEdit(stateFieldsArr);
				}
			},
		},
		//隐藏
		hide:function(){
			nsdialog.hide();
		}
	}

	// vo数据管理器---------------------------------------------------------------------------
	var voDataManager = {
		//所有方法
		ajax:{
			getDetail:{}, 		//获取详细数据
			save:{}, 			//保存
			delete:{}, 			//删除
			getDetail:{}, 		//获取detail
			saveDetail:{}, 		//单独保存detail
			saveDetailList:{}, 	//批量保存detail
		},
		init:function(){
			this.ajax.getDetail = config.ajax.voMapList.getDetailById;
			this.ajax.save = config.ajax.voMapList.save;
			this.ajax.delete = config.ajax.voMapList.deleteById;
			//vosdetail相关方法
			// this.ajax.getVosDetail = config.getVoDetailByIdAjax;
			// this.ajax.saveVosDetail = config.ajax.voMap.save;
			// this.ajax.saveVosDetailList = config.ajax.voMap.saveList;
			// this.ajax.deleteVosDetailList = config.deleteVoDetailListAjax;
		},
		//保存到服务器
		saveAjaxHander:function(saveData, callBackFunc){
			/*saveData {
			 *  id 				number 如果不传id则为新建 有id是修改
			 * 	name 			string 展示名字
			 *  remark 			string 备注
			 * 	jsonContent 	string 使用JSON.stringify格式化
			 * 	originalContent string 使用JSON 保存原始的字段
			 * 	processContent 	string 使用JSON 保存状态关联
			 * 	xmlContent 	 	string xml文本
			 * }
			 */
			/*
			 if(typeof(saveData.name) != 'string' || saveData.name == ''){
				nsAlert('获取vo失败，请检查思维导图配置');
				return false;
			 }
			*/
			var _this = this;
			var ajaxConfig = {
				url:_this.ajax.save.url,
				type:_this.ajax.save.type,
				contentType:'application/json',
				data:JSON.stringify(saveData),
				// data:saveData,
			}
			nsVals.ajax(ajaxConfig, function(res){
				nsAlert("保存成功");
				//回调
				if(typeof(callBackFunc) == 'function'){
					callBackFunc(res);
				}
			})
		},
		//获取detail根据思维导图id
		getDetailByMindMapId:function(mindMapId, callBackFunc){
			var ajaxConfig = {
				url:this.ajax.delete.url,
				type:this.ajax.delete.type,
				data:{id:id},
			}
			nsVals.ajax(ajaxConfig, function(res){
				nsAlert("删除成功");
				listTable.refresh();
			})
		},
		//获取vo和method
		getVosDetailAjaxHandler:function(mindMapId, callBackFunc){
			/*
			 *
			 */
			var _this = this;
			var ajaxConfig = {
				url:_this.ajax.getVosDetail.url,
				type:_this.ajax.getVosDetail.type,
				data:{'mindMapId':mindMapId},
			}
			nsVals.ajax(ajaxConfig, function(res){
				//回调
				if(typeof(callBackFunc) == 'function'){
					callBackFunc(res);
				}
			})
		},
		//保存vo和method
		saveVosDetailAjaxListHander:function(saveData, callBackFunc){
			// 使用的RequestBody方式传参。
			// {
			// 	Long   id;
			// 	Long   mindMapId;
			// 	Long   parentId;
			// 	String name;
			// 	String category;
			// 	String originalContent;
			// 	String processContent;
			// 	String config;
			// 	String config2;
			// 	String config3;
			// 	String remark;
			// }
			var convertStringFields = ['originalContent', 'processContent', 'config', 'config2', 'config3'];
			var _this = this;
			var saveListDataArray = saveData;
			var formatArray = [];
			var isValid = true;
			for(var i = 0; i<saveListDataArray.length; i++){
				var saveListData = saveListDataArray[i];
				var formatSaveData = {};
				for(key in saveListData){
					if(convertStringFields.indexOf(key) == -1){
						formatSaveData[key] = saveListData[key];
						//思维导图id必须存在，不然无法读取
						if(key == 'mindMapId'){
							if(typeof(saveListData[key])=='undefined'){
								isValid = false;
							}
						}
					}else{
						//是特定的字段，需要把原来的对象转成string
						formatSaveData[key] = JSON.stringify(saveListData[key]);
					}
				}
				formatArray.push(formatSaveData);
			}
			//没有mindMapId是致命性错误
			if(isValid == false){
				nsAlert('mindMapId未定义', 'error');
				console.error(saveData);
				return;
			}
			var ajaxConfig = {
				url:_this.ajax.saveVosDetailList.url,
				type:_this.ajax.saveVosDetailList.type,
				contentType:'application/json',
				data:JSON.stringify(formatArray),
			}
			nsVals.ajax(ajaxConfig, function(res){
				nsAlert("保存VO和方法成功");
				//回调
				if(typeof(callBackFunc) == 'function'){
					callBackFunc(res);
				}
			})
		},
		//从服务器删除
		deleteAjaxHandler:function(id){
			var ajaxConfig = {
				url:this.ajax.delete.url,
				type:this.ajax.delete.type,
				data:{id:id},
			}
			nsVals.ajax(ajaxConfig, function(res){
				nsAlert("删除成功");
				listTable.refresh();
			})
		},
		//获取VO详细信息，并回调
		getDetailById:function(id, callBackFunc){
			var getDetailAjax = $.extend(true, {}, this.ajax.getDetail);
			getDetailAjax.url = getDetailAjax.url+id;
			nsVals.ajax(getDetailAjax, function(res){
				//保存用于省略访问
				this.detailRes = {
					id:id,
					res:res,
				}
				//回调
				if(typeof(callBackFunc)=='function'){
					callBackFunc(res[getDetailAjax.dataSrc]);
				}
			})
		},
		//获取导入描述
		getRemark:function(parameter){
			/****parameter:object
			 * {
			 *	chinese: 	string 中文名称
			 * 	english: 	string 英文名称
			 * 	source: 	string 来源描述 如erpcrmController-2018.06.24.xmmap 或者 assets/json/mindjettools/demovo1.json
			 * 	remark: 	string 之前的备注（没保存的）
			 * }
			 */

			//之前备注默认为空
			if(typeof(parameter.remark)=='undefined'){
				parameter.remark = '';
			}
			var remarkStr = '';
			//日志-来源
			remarkStr += '来源：'+parameter.source;
			//日志-英文名称
			remarkStr += '\r';
			remarkStr += '名称：'+parameter.english;
			//日志-中文名称	
			if(parameter.chinese != parameter.english){
				remarkStr += '/'+parameter.chinese;
			}
			//日志-生成时间
			remarkStr += '\r';
			remarkStr += '生成时间：';
			remarkStr += moment().format('YYYY/MM/DD HH:mm:ss');
			//如果已经有日志则接着写
			if(parameter.remark != ''){
				remarkStr += '\r';
				remarkStr += '\r';
				remarkStr += parameter.remark;
				
			}
			//remark截取最近三次
			var patt = /来源/g;
			var matchIndex = 0;
			var matchEndStringIndex =  remarkStr.length;
			while((result = patt.exec(remarkStr)) != null){
				matchIndex ++;
				if(matchIndex == 4){
					//截取掉第四次的以后的 前面有两个多余的回车
					matchEndStringIndex = result.index -2;
				}
			}
			//有效文字的结尾
			if(matchIndex<4 && remarkStr.indexOf('total')>-1){
				// 前面有两个多余的回车
				matchEndStringIndex = remarkStr.indexOf('total')-2;
			}
			
			var totalNum = 1;
			if(remarkStr.search(/total/) == -1){
				totalNum = matchIndex;
			}else{
				var totalStr = remarkStr.substring(remarkStr.search(/total:/)+6);
				totalNum = parseInt(totalStr.match(/\d+/)) + 1;
			}
			var resultRemarkStr = remarkStr.substring(0, matchEndStringIndex);
			resultRemarkStr += '\r';
			resultRemarkStr += '\r';
			resultRemarkStr += 'total:'+totalNum+' （第'+totalNum+'次修改）';
			return resultRemarkStr;
		},
		saveState:function(parameter, callBackFunc){
			/****parameter:object
			 * {
			 *	voId: 	string 中文名称
			 * 	english: 	string 英文名称
			 * 	source: 	string 来源描述 如erpcrmController-2018.06.24.xmmap 或者 assets/json/mindjettools/demovo1.json
			 * 	values: 	object 状态弹框的getFormJSON
			 * }
			 */
			var values = parameter.values;
			var voId = parameter.voId;
			var stateArray = parameter.stateArray;
			
			//生成要保存的数据
			var valueData = $.extend(true, {}, values);
			delete valueData.type;
			delete valueData.index;

			//找到sourceJSON中的对应数据
			var sourceJSON = JSON.parse(setStateDialog.voRes.jsonContent);
			var voJSON = {};
			var stateJSON = {};
			for(var key in sourceJSON){
				voJSON = sourceJSON[key][values.voName];
			}
			stateJSON = voJSON.state;
			//设置state的field
			function getStateField(_fieldsArray,typeGroup,tabName){
				/*
					typeGroup : tabs field
					_fieldsArray : 状态列表
					tabName : tab页名字
				 */
				// var _stateJSON = {
				// 	field:{},
				// }
				// var fieldsArray = values.fieldNames;
				var fieldsArray = typeof(_fieldsArray)=='undefined'?values.fieldNames:_fieldsArray;
				var typeGroup = typeof(typeGroup)=='undefined'?'field':'tabs';
				var stateJSONField = {};
				for(var i = 0; i<fieldsArray.length; i++){
					var englishName = fieldsArray[i].english;
					// stateJSONField[englishName] = {
					// 	nsChineseName:fieldsArray[i].chinese,
					// 	mindjetIndexState:fieldsArray[i].index
					// }
					switch(typeGroup){
						case 'field':
							stateJSONField[englishName] = {
								nsChineseName:fieldsArray[i].chinese,
								mindjetIndexState:fieldsArray[i].index
							}
							break;
						case 'tabs':
							stateJSONField[englishName] = {
								nsChineseName:fieldsArray[i].chinese,
								mindjetIndexState:fieldsArray[i].index,
								mindjetTabName:tabName,
								mindjetTabNamePosition:'',
							}
							break;
					}
				}
				return stateJSONField;
			}
			//返回中文字段名称
			function getChineseNameStr(){
				//返回值是 '姓名,电话'
				var chineseNameStr = '';
				var fieldsArray = values.fieldNames;
				var chineseNames = [];
				for(var i = 0; i<fieldsArray.length; i++){
					chineseNames.push(fieldsArray[i].chinese);
				}
				chineseNameStr = chineseNames.toString();
				return chineseNameStr;
			}
			// 合并两个obj
			function mergeObj(sourceObj,addObj){
				for(var key in addObj){
					sourceObj[key] = addObj[key];
				}
			}
			
			//操作数据
			switch(values.type){
				case 'add':
					//获取中文名
					valueData.fieldsChineseName = getChineseNameStr();
					//新增
					stateArray.unshift(valueData);
					stateJSON[values.name] = {
						field:getStateField()
					};
					break;
				case 'edit':
					//获取中文名
					valueData.fieldsChineseName = getChineseNameStr();
					//修改
					//原始名称
					var originalName = valueData.originalName;
					stateArray[values.index] = valueData;
					stateJSON[values.name] = {
						field:getStateField()
					};
					//修改名称的情况下，删除掉原来的
					if(originalName!=values.name){
						delete stateJSON[originalName];
					}
					break;
				case 'delete':
					//删除
					delete stateJSON[values.name];
					stateArray.splice(values.index, 1);
					break;
				case 'addGroups':
					// 新增状态分组
					var stateGroups = values.stateGroups;
					switch(stateGroups.stateType){
						case 'table':
							stateJSON[values.name].tabs = {};
							for(var groupName in stateGroups){
								if(groupName!='stateType'){
									tabsObj = getStateField(stateGroups[groupName],'tabs',groupName);
									mergeObj(stateJSON[values.name].tabs,tabsObj);
								}
							}
							break
						case 'form':
							for(var groupName in stateGroups){
								if(groupName!='stateType'){
									stateJSON[values.name][groupName] = {};
									tabsObj = getStateField(stateGroups[groupName],'field');
									mergeObj(stateJSON[values.name][groupName],tabsObj);
								}
							}
							break
					}
					for(var i = 0; i<stateArray.length; i++){
						if(stateArray[i].name == values.name){
							stateArray[i].stateGroups = values.stateGroups;
						}
					}
					break;
			}
			var processContent = stateArray;
			var saveData = {
				id:parameter.voId,
				processContent:JSON.stringify(processContent),
				jsonContent:JSON.stringify(sourceJSON),
			}
			voDataManager.saveAjaxHander(saveData, function(res){
				setStateDialog.voRes = res.data
				//成功后回调
				if(typeof(callBackFunc)=='function'){
					callBackFunc(res);
				}
			})
		},
	}

	// 服务器端方法管理器
	var server = {
		//批量添加方法
		init:function(pageAjaxConfig){
			var _this = this;
			$.each(pageAjaxConfig, function(className, classData){
				//本页面中是voMapList(voMap集合 主表)/voMap(detail)/pageRel
				_this[className] = {};
				$.each(classData, function(functionName, functionAjaxConfig){
					//批量生成函数
					/* {
					 * 		ajaxData:object 		要发送的参数
					 * 		callBackFunc:function 	回调函数，返回值是服务器返回值
					 * }	
					 */ 
					_this[className][functionName] = function(ajaxData, callBackFunc){
						var ajaxConfig = $.extend(true, {}, functionAjaxConfig);
						_this.ajaxCommon(ajaxConfig, ajaxData, callBackFunc);
					}
				})
			})
		},
		//通用回调方法
		ajaxCommon:function(ajaxSourceConfig, ajaxData, callBackFunc){
			//错误信息提示
			function errorInfo(errorInfoStr){
				nsAlert(errorInfoStr, 'error');
				console.error(errorInfoStr);
				//拼接ajaxConfig，加上data参数，完整输出
				var errorAjaxConfig = $.extend(true, {}, ajaxSourceConfig);
				errorAjaxConfig.data = ajaxData;
				console.error(errorAjaxConfig);
			}
			//ajax需要复制再执行，防止修改
			var ajaxConfig = $.extend(true, {}, ajaxSourceConfig);
			var validData = {};
			//删除ajax不用的参数
			if(ajaxConfig.dataFormat){
				//格式化
				switch(ajaxSourceConfig.dataFormat){
					case 'id':
						//dataFormat是id的情况下 id是简单对象 string 或者 number
						if(typeof(ajaxData)=='string' || typeof(ajaxData)=='number'){
							ajaxData = {id:ajaxData};
							validData = {id:ajaxData};
						}else{
							errorInfo('id未定义');
							return
						}
						break;
					case 'suffixId':
						//id作为后缀拼接到url上使用
						if(typeof(ajaxData)=='string' || typeof(ajaxData)=='number'){
							ajaxConfig.url = ajaxConfig.url + ajaxData;
							ajaxData = {};
							validData = {id:ajaxData};
						}else{
							errorInfo('id未定义');
							return;
						}
						break;
					case 'custom':
						//定制参数
						var customParams = JSON.parse(ajaxSourceConfig.dataFormatParams);
						if(typeof(customParams)=='object'){
							var _ajaxData = {};
							$.each(customParams, function(paramsName, paramsValue){
								if(paramsValue == '{}'){
									//如果是{} 则代表整个参数 ajaxData
									if(typeof(ajaxData)=='string' || typeof(ajaxData)=='number' || typeof(ajaxData)=='boolean'){
										_ajaxData[paramsName] = ajaxData;
									}else{
										errorInfo('定制参数只能接受简单对象 当前值'+ajaxData+'类型:'+typeof(ajaxData));
										return;
									}
								}else{
									//逐个读取对应参数
									var regExpRes = paramsValue.match(/^\{(\S*)\}$/); //开头为{结尾为}，中间不能有空格
									if(regExpRes){
										var ajaxDataParamsName = regExpRes[1];
										if(ajaxData[ajaxDataParamsName]){
											_ajaxData[paramsName] = ajaxData[ajaxDataParamsName];
										}else{
											//匹配不成功则报错
											errorInfo('定制参数获取值错误，'+ajaxDataParamsName+'没有有效值');
											return;
										}
										
									}else{
										//匹配不成功则报错
										errorInfo('定制参数格式错误'+ajaxData+'类型:'+typeof(ajaxData));
										return;
									}
								}
							})
							ajaxData = _ajaxData;
						}else{
							errorInfo('定制参数不是合法的JSON字符串:'+ajaxSourceConfig.dataFormatParams);
							return;
						}
						break;
				}
				//删除ajax不用的参数
				delete ajaxConfig.dataFormat;
			}
			if(ajaxConfig.dataValid){
				delete ajaxConfig.dataValid;
			}
			//添加参数
			ajaxConfig.data = ajaxData;
			//生成plusData
			var dataSrc = '';
			if(ajaxConfig.dataSrc){
				dataSrc = ajaxConfig.dataSrc
				delete ajaxConfig.dataSrc;
			}
			ajaxConfig.plusData = {
				callBackFunc: 	callBackFunc, 	 //回调函数
				dataSrc: 		dataSrc 		//数据源节点 data/rows 如果为空则整体返回
			}
			//如果contentType 是 'application/json' 需要把ajax.data参数处理成字符串
			if(ajaxConfig.contentType == 'application/json'){
				ajaxConfig.data = JSON.stringify(ajaxConfig.data);
			}
			//处理完成发送请求
			nsVals.ajax(ajaxConfig, function(res, resAjaxConfig){
				var ajaxPlusData = resAjaxConfig.plusData;
				//回调
				if(typeof(ajaxPlusData.callBackFunc)=='function'){
					//如果回调有dataSrc 则只回传dataSrc
					var returnRes = {};
					if(ajaxPlusData.dataSrc !=''){
						returnRes = res[ajaxPlusData.dataSrc]
					}else{
						returnRes = res;
					}
					callBackFunc(returnRes);
				}
			})
		}
	}


	//验证面板 同时展示验证表格和数据展示表格------------------------------------------------
	var viewVOPanel = {
		id:'', 					//在init时候赋值
		$container:{}, 			//$dom
		tableErrorId: '', 		//错误列表表格id
		$tableErrorPanel:{}, 	//错误面板
		tableInfoId: '', 		//包含对象列表表格id
		$tableInfoPanel:{},  	//包含对象面板
		//显示
		show:function(){
			viewVOPanel.init();
			var _this = this;
			//弹框
			var dialogId = this.id+'-contentdialog';
			var contentDialogConfig = 
			{
				title:'VO详细信息', 
				id:dialogId, 
				width:'80%',
				height:600,
				shownHandler:function(){
					$("#"+dialogId+' .panel-body').append(_this.$container);
					_this.showTables();
				},
			}
			nsFrame.contentDialog.show(contentDialogConfig);
		},
		//添加和显示表格
		showTables:function(){
			var tableErrorHTML = '<div class="table-responsive"><table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="'+this.tableErrorId+'"></table></div>';
			$('#'+this.tableErrorPanelId).html(tableErrorHTML);
			
			var tableInfoHTML = '<div class="table-responsive"><table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="'+this.tableInfoId+'"></table></div>';
			$('#'+this.tableInfoPanelId).html(tableInfoHTML);

			//未设置的对象或值添加表格
			nsMindjetToJSTools.errorDataTable(this.tableErrorId);
			//客户列表生成表格
			nsMindjetToJSTools.businessDataTable(this.tableInfoId);
		},
		//隐藏
		hide:function(){
			nsFrame.contentDialog.hide();
		},
		//初始化
		init:function(){
			this.id = config.pageDomId.voContentPanelId;
			this.$container = $('<div id = "'+this.id+'"></div>');
			//this.$container.addClass('viewvo-panel common-fixed-simple-panel')
			this.$container.html(this.getHtml());
			this.tableErrorId = this.id+'-error-table';
			this.tableErrorPanelId = this.id+'-error-panel';
			this.tableInfoId = this.id+'-info-table';
			this.tableInfoPanelId = this.id+'-info-panel';
		},
		//获取HTML填充DIV 两个表格，第一个是错误的，第二个是信息的
		getHtml:function(){
			var html = 
			'<div class="row">'
				+'<div class="col-sm-5  main-panel">'
					+'<div class="panel panel-default">'
						+'<div class="panel-body" id="'+ this.id + '-error-panel' + '">'
						+'</div>'
					+'</div>'
				+'</div>'
				+'<div class="col-sm-7  main-panel">'
					+'<div class="panel panel-default">'
						+'<div class="panel-body" id="'+ this.id + '-info-panel' + '">'
						+'</div>'
					+'</div>'
				+'</div>'
			+'</div>'
			return html;
		}
	}

	//说明文字-------------------------------------------------------------------------------
	var introPanel = {
		id:'', 		//id
		$panel:{}, 	//面板
		isVisible:false, //默认是隐藏的
		init:function(){
			this.id = config.pageDomId.inputPanelId
			this.$panel = $('#'+this.id);
		},
		show:function(){
			this.isVisible = true;
			this.$panel.show();
		},
		hide:function(){
			this.isVisible = false;
			this.$panel.hide();
		},
		//切换显示隐藏
		switch:function(){
			if(this.isVisible){
				this.hide();
			}else{
				this.show();
			}
		}
	}
	

	//外部调用-------------------------------------------------------------------------------
	return {
		init:init,  					//初始化入口
		listTable:listTable, 			//VO列表
		viewVOPanel:viewVOPanel, 		//验证和显示面板
		voDataManager:voDataManager, 	//VO管理器
		importXMLDialog:importXMLDialog,//导入xml弹框
		introPanel:introPanel, 			//文档面板
		changeDisplayState:changeDisplayState, //切换显示状态
		setStateDialog:setStateDialog, 	//设置状态弹框
		voTabs:voTabs, 					//tabs
		voMapManager:voMapManager, 		//voMap管理器
		server:server, 					//服务器方法
		voMapTable:voMapTable,			//tabs表格配置
	}
})(jQuery);