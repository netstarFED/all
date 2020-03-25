//页面管理工具 列表页面 list cy180622
//version 180627cy
if(typeof(nsProjectPagesManager) != "object"){
    nsProjectPagesManager = {
        pages : {}
    }
}
nsProjectPagesManager.pages.voList = (function($) {
    
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
		prevProcessContent:{
			vo:[],
			field:[],
			method:[],
			state:[],
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
							var prevVo = voMapTable.getPrevVoById(baseData.gid,'vo');
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
										if(typeof(prevVo.config2) == 'string'){
											prevVo.config2 = JSON.parse(prevVo.config2)
										}
										if(typeof(prevVo.config2) == 'object' && typeof(vo.config2.fields) == "object"){
											if(typeof(vo.config2.fields[saveData.gid]) == "object"){
												saveData.objectState = NSSAVEDATAFLAG.EDIT;
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
							var prevVo = voMapTable.getPrevVoById(baseData.gid,'vo');
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
										if(typeof(prevVo.config2) == 'string'){
											prevVo.config2 = JSON.parse(prevVo.config2)
										}
										if(typeof(prevVo.config2) == 'object' && typeof(vo.config2.fields) == "object"){
											if(typeof(vo.config2.fields[saveData.gid]) == "object"){
												saveData.objectState = NSSAVEDATAFLAG.EDIT;
											}else{
												saveData.objectState = NSSAVEDATAFLAG.ADD;
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
		getXmmapJsonByDetails : function(details){
			var xmmapJson = voMapTable.getXmmapJsonByVOMet(false, details);
			for(var key in xmmapJson){
				xmmapJson[key].system = xmmapJson[key].system ? xmmapJson[key].system : {};
				xmmapJson[key].pages = xmmapJson[key].pages ? xmmapJson[key].pages : {};
				xmmapJson[key].default = xmmapJson[key].default ? xmmapJson[key].default : {};
			}
			return xmmapJson;
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
		getXmmapJsonByVOMet:function(isXml, details){
			var formatVoList = []; // 格式化后的vo数据
			var formatMethodList = []; // 格式化后的method数据
			var voList = $.extend(true,[],this.processContent.vo); // vo数据
			var methodList = $.extend(true,[],this.processContent.method);  // 方法数据
			if(details){
				var voList = $.extend(true,[], details.vo); // vo数据
				var methodList = $.extend(true,[], details.method);  // 方法数据
			}
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
				if(methodList[indexI].resJson){
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
			}
			if(details){
				var entityName = formatVoList[0].entityName; // 获取 实体名字
			}else{
				var sourceXmmapJsonData = listTable.getRowDataById(formatVoList[0].mindMapId); // 当前行数据 即思维导图相关数据
				// var sourceXmmapJson = JSON.parse(sourceXmmapJsonData.jsonContent); // 原始的思维导图json数据
				var entityName = sourceXmmapJsonData.name; // 获取 实体名字
			}
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
				 * isUseAjaxByCopyAdd 
				 * webSocketBody 
				 * fileField
				 * operatorMode 
				 * dropdownSubdata 
				 * dropSelectMode
				 * disabledByWorkflow
				 * fileAjaxData
				 * importInstructionsExpression
				 */
				var defMethod = {
					ajaxData:{},
					fileAjaxData:{},
					ajaxDataVaildConfig:'',
					btntext:'',
					contentType:'',
					dataFormat:'',
					dataSrc:'',
					defaultMode:'',
					functionClass:'',
					functionField:'',
					functionIntro:'',
					id:'',
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
					getPanelDataAjax : {},
					columns : '',
					templateId : '',
					shortcutKey : '',
					isKeepSelected : false,
					tabTitles : '',
					isUseAjaxByCopyAdd : true,
					parameterFormatType : 'add',
					isSetValueToSourcePage : false,
					webSocketBody : '',
					fileField : '',
					dialogTitle : '',
					targetField : '',
					selectMode : '',
					operatorMode : 'add',
					fileFields : '',
					beforeAjax : {},
					beforeTitle : '',
					isUseConfirm : true,
					tipContent : '',
					tipClass : '',
					ext : '',
					excelName : '',
					dropdownSubdata : '',
					dropSelectMode : '',
					disabledByWorkflow : true,
					importInstructionsExpression : '',
				}
				var formatMethode = {};
				for(var typeName in defMethod){
					if(souMethod[typeName] || souMethod[typeName] === false){
						if(typeof(souMethod[typeName])==typeof(defMethod[typeName])){
							formatMethode[typeName] = souMethod[typeName];
							if(typeName == 'ajaxData'){
								formatMethode.data = formatMethode[typeName];
							}
							if(typeName == 'dropdownSubdata' && souMethod[typeName] != ''){
								formatMethode.dropdownSubdata = JSON.parse(souMethod[typeName]);
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
			var fieldsByGid = vo.processData.fieldsByGid;
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
					if(fieldsByGid[originalContentField[indexI].gid] && fieldsByGid[originalContentField[indexI].gid].isSet == "是"){
						var fieldEdit = fieldsByGid[originalContentField[indexI].gid]; // 编辑的数据
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
			var processContentState = vo.processContent.states;
			vo.processContent.states = [];
			vo.processContent.states[0] = defaultState;
			var config2States = config2.states;
			var statesByGid = {};
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
								if(typeof(afterField) == "undefined"){
									// 未知错误 gid与组件的gid不一致
									continue;
								}
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
				statesByGid[formatState.gid] = formatState;
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
		// 根据id查询field 在数组voMapTable.processContent.vo中查询
		getPrevVoById:function(gid){
			var voList = voMapTable.prevProcessContent.vo;
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
		// 根据id在数组voMapTable.processContent.vo中查询vo
		getPrevVoByVoId:function(id){
			var voList = voMapTable.prevProcessContent.vo;
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
		getVoRemarkByVoId:function(voId, resList){
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
			var fieNum = 0;
			if(!$.isEmptyObject(voObj)){
				var voObjProcessContent = JSON.parse(voObj.processContent);
				var fieNum = voObjProcessContent.fields.length;
			}
			var remark = fieNum+'个字段/'+methodNum+'个关联方法';
			return remark;
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
	//voMap管理器 只有复杂操作，简单操作直接使用server.voMap 或者 server.voMapList 
	var voMapManager = {
		// 通过返回的list（vo和method的详细信息）获得当前需要的list 通过vo名字/method名字和级别获取 20190910
		getListByNameLevel : function(_resList, isSetOldId, isPrev){
			var resList = [];
			isPrev = typeof(isPrev) == "boolean" ? isPrev : false;
			var num = 1;
			if(isPrev){
				num = 2;
			}
			// 分类 把是一条配置的数据放在一起
			var classFile = {
				vo : {},
				method : {}
			};
			for(var i=0; i<_resList.length; i++){
				var resObj = _resList[i];
				var category = resObj.category;
				var processContent = typeof(resObj.processContent) == "string" ? JSON.parse(resObj.processContent) : resObj.processContent;
				switch(category){
					case 'vo':
						var voName = resObj.name;
						if(!$.isArray(classFile.vo[voName])){
							classFile.vo[voName] = [];
						}
						classFile.vo[voName].push(resObj);
						break;
					case 'method':
						var voName = processContent.voName;
						var englishName = processContent.englishName;
						var chineseName = processContent.chineseName;
						var isHave = false;
						for(var methodKey in classFile.method){
							for(var methodI=0; methodI<classFile.method[methodKey].length; methodI++){
								var methodObj = classFile.method[methodKey][methodI];
								var _processContent = typeof(methodObj.processContent) == "string" ? JSON.parse(methodObj.processContent) : methodObj.processContent;
								if(_processContent.voName == voName && (_processContent.englishName == englishName || _processContent.chineseName == chineseName)){
									isHave = true;
									classFile.method[methodKey].push(resObj);
									break;
								}
							}
						}
						if(!isHave){
							classFile.method[englishName] = $.isArray(classFile.method[englishName]) ? classFile.method[englishName] : [];
							classFile.method[englishName].push(resObj);
						}
						break;
				}
			}
			// 获取字段配置 此处获取的是配置过的字段配置 即config2处获取到的字段配置
			var getFiledConfig = function(_fieldConfig, voArr){
				var fieldConfig = {};
				var chineseName = _fieldConfig.chineseName;
				var englishName = _fieldConfig.englishName;
				for(var i=voArr.length-num; i>-1&&$.isEmptyObject(fieldConfig); i--){
					var _voObj = voArr[i];
					var voConfig2 = typeof(_voObj.config2) == "object" ? _voObj.config2 : {};
					if(typeof(_voObj.config2) == "string"){
						voConfig2 = JSON.parse(_voObj.config2);
					}
					var fields = typeof(voConfig2.fields) == "object" ? voConfig2.fields : {};
					for(var gid in fields){
						if(fields[gid].chineseName == chineseName || fields[gid].englishName == englishName){
							if(fields[gid].objectState == NSSAVEDATAFLAG.EDIT || fields[gid].objectState == NSSAVEDATAFLAG.ADD){
								// 当前vo编辑或新增的
								fieldConfig = fields[gid];
							}else{
								if(i === 0){
									fieldConfig = fields[gid];
								}
							}
							break;
						}
					}
				}
				if(!$.isEmptyObject(fieldConfig)){
					// 读取原始配置
					fieldConfig.variableType = _fieldConfig.variableType;
					fieldConfig.className = _fieldConfig.className;
				}
				return fieldConfig;
			}
			// 获取需要的数据
			var voData = classFile.vo;
			var methodData = classFile.method;
			for(var voKey in voData){
				var _voData = voData[voKey];
				// 根据级别排序
				_voData = _voData.sort(function(a, b){
					return a.priorityLevel - b.priorityLevel;
				});
				voData[voKey] = _voData;
				var voObj = _voData[_voData.length - num];
				var sourceVoObj = _voData[0];
				if(_voData.length == 1 && isPrev){
					// 只有一层 上一级用户
					voObj = _voData[0];
					delete voObj.config2;
					var processContent = typeof(voObj.processContent) == "string" ? JSON.parse(voObj.processContent) : voObj.processContent;
					processContent.states = [];
					voObj.processContent = JSON.stringify(processContent);
					resList.push(voObj);
					continue;
				}
				if(_voData.length == 1){
					// 只有一层 当前用户
					voObj = _voData[0];
					var processContent = typeof(voObj.processContent) == "string" ? JSON.parse(voObj.processContent) : voObj.processContent;
					if(processContent.states[0].englishName != "defalut"){
						// 不知道原因：默认状态没有了
						var _fields = [];
						for(var i=0; i<processContent.fields.length; i++){
							_fields.push({
								chineseName: processContent.fields[i].chineseName,
								englishName: processContent.fields[i].englishName,
								gid: processContent.fields[i].gid,
								mindjetIndexState: i
							});
						}
						var defaultState = {
							chineseName: "默认全部字段",
							englishName: "defalut",
							entityName: voObj.entityName,
							field: _fields,
							gid: processContent.states[0].gid,
							mindMapId: voObj.mindMapId,
							voFullName: voObj.voFullName,
							voId: voObj.voId,
							voName: voObj.voName,
						}
						processContent.states[0] = defaultState;
						voObj.processContent = JSON.stringify(processContent);
					}
					resList.push(voObj);
					continue;
				}
				var config2Fields = {};
				var processContentField = [];
				var processContentState = [];
				var originalContent = typeof(voObj.originalContent) == "string" ? JSON.parse(voObj.originalContent) : voObj.originalContent;
				var sourceOriginalContent = typeof(sourceVoObj.originalContent) == "string" ? JSON.parse(sourceVoObj.originalContent) : sourceVoObj.originalContent;
				var processContent = typeof(voObj.processContent) == "string" ? JSON.parse(voObj.processContent) : voObj.processContent;
				// 使用一级originalContent配置因为他是最新的原始配置 添加删除的字段
				for(var fieldI=0; fieldI<originalContent.fields.length; fieldI++){
					var isSourceField = true;
					for(var fieldJ=0; fieldJ<sourceOriginalContent.fields.length; fieldJ++){
						if( sourceOriginalContent.fields[fieldJ].englishName == originalContent.fields[fieldI].englishName ||
							sourceOriginalContent.fields[fieldJ].chineseName == originalContent.fields[fieldI].chineseName
						){
							isSourceField = false;
							break;
						}
					}
					if(isSourceField){
						sourceOriginalContent.fields.push(originalContent.fields[fieldI]);
					}
				}
				originalContent = sourceOriginalContent;
				// 获取组件字段配置 如果在状态中发现则添加为状态保存的配置 负责添加为原始配置
				for(var fieldI=0; fieldI<originalContent.fields.length; fieldI++){
					var fieldConfig = getFiledConfig(originalContent.fields[fieldI], _voData);
					if($.isEmptyObject(fieldConfig)){
						fieldConfig = originalContent.fields[fieldI];
					}else{
						config2Fields[fieldConfig.gid] = fieldConfig;
					}
					fieldConfig.gid = originalContent.fields[fieldI].gid;
					processContentField.push(fieldConfig);
				}
				// 获取状态配置
				var statesByGid = {};
				var statesArr = [];
				// 通过objectState获得当前操作的状态
				var __processContent = typeof(_voData[0].processContent) == "string" ? JSON.parse(_voData[0].processContent) : _voData[0].processContent;
				// 默认状态
				statesByGid[__processContent.states[0].gid] = __processContent.states[0];
				for(var i=0; i<_voData.length-num+1; i++){
					// config2中的状态
					var __config2 = typeof(_voData[i].config2) == "string" ? JSON.parse(_voData[i].config2) : _voData[i].config2;
					if(typeof(__config2)!="object" || !$.isArray(__config2.states)){
						continue;
					}
					for(var j=0; j<__config2.states.length; j++){
						var gid = __config2.states[j].gid;
						// if(typeof(statesByGid[gid]) != "object" && i==0){
						if(typeof(statesByGid[gid]) != "object"){
							statesByGid[gid] = __config2.states[j];
							// config2中的状态一定要有statesByGid[gid].fieldNames 不知道为什么有的地方没了用fields补充 可能原因：之前写错了已保存
							statesByGid[gid].fieldNames = $.isArray(statesByGid[gid].fieldNames) ? statesByGid[gid].fieldNames : statesByGid[gid].fields;
							statesByGid[gid].field = $.isArray(statesByGid[gid].field) ? statesByGid[gid].field : statesByGid[gid].fieldNames;
						}else{
							if(__config2.states[j].objectState == NSSAVEDATAFLAG.EDIT || __config2.states[j].objectState == NSSAVEDATAFLAG.ADD){
								statesByGid[gid] = __config2.states[j];
								// config2中的状态一定要有statesByGid[gid].fieldNames 不知道为什么有的地方没了用fields补充 可能原因：之前写错了已保存
								statesByGid[gid].fieldNames = $.isArray(statesByGid[gid].fieldNames) ? statesByGid[gid].fieldNames : statesByGid[gid].fields;
								statesByGid[gid].field = $.isArray(statesByGid[gid].field) ? statesByGid[gid].field : statesByGid[gid].fieldNames;
							}
						}
					}
				}
				for(var gidKey in statesByGid){
					// 统一gid : editFields fieldNames field ; 统一voId
					if(typeof(statesByGid[gidKey].editFields) == "object"){
						var changeFields = {};
						for(var _gid in statesByGid[gidKey].editFields){
							var stateField = statesByGid[gidKey].editFields[_gid];
							for(var fieldI=0; fieldI<originalContent.fields.length; fieldI++){
								var originalField = originalContent.fields[fieldI];
								if(originalField.englishName == stateField.englishName || originalField.chineseName == stateField.chineseName){
									if(stateField.gid != originalField.gid){
										stateField.gid = originalField.gid;
										// 读取原始配置
										stateField.variableType = originalField.variableType;
										stateField.className = originalField.className;
										changeFields[originalField.gid] = stateField;
										delete statesByGid[gidKey].editFields[_gid];
									}
								}
							}
						}
						for(var _gid in changeFields){
							statesByGid[gidKey].editFields[_gid] = changeFields[_gid];
						}
					}
					if(typeof(statesByGid[gidKey].fieldNames) == "object"){
						for(var j=0; j<statesByGid[gidKey].fieldNames.length; j++){
							var stateField = statesByGid[gidKey].fieldNames[j];
							for(var fieldI=0; fieldI<originalContent.fields.length; fieldI++){
								var originalField = originalContent.fields[fieldI];
								if(originalField.englishName == stateField.englishName || originalField.chineseName == stateField.chineseName){
									stateField.gid = originalField.gid;
									// 读取原始配置
									stateField.variableType = originalField.variableType;
									stateField.className = originalField.className;
								}
							}
						}
					}
					if($.isArray(statesByGid[gidKey].field)){
						for(var j=0; j<statesByGid[gidKey].field.length; j++){
							var stateField = statesByGid[gidKey].field[j];
							for(var fieldI=0; fieldI<originalContent.fields.length; fieldI++){
								var originalField = originalContent.fields[fieldI];
								if(originalField.englishName == stateField.englishName || originalField.chineseName == stateField.chineseName){
									stateField.gid = originalField.gid;
									// 读取原始配置
									stateField.variableType = originalField.variableType;
									stateField.className = originalField.className;
								}
							}
						}
					}
					statesByGid[gidKey].voId = voObj.id;
				}
				// config2中的状态 除去default
				for(var gidKey in statesByGid){
					processContentState.push(statesByGid[gidKey]);
					if(statesByGid[gidKey].englishName != "default" && statesByGid[gidKey].englishName != "defalut"){
						statesArr.push(statesByGid[gidKey]);
					}
				}
				var _processContent = {
					fields : processContentField,
					states : processContentState,
				};
				var config2 = {
					fields : config2Fields,
					states : statesArr,
				}
				voObj.config2 = JSON.stringify(config2);
				voObj.processContent = JSON.stringify(_processContent);
				voObj.originalContent = JSON.stringify(originalContent);
				resList.push(voObj);
			}
			for(var methodKey in methodData){
				var _methodData = methodData[methodKey];
				// 根据级别排序
				_methodData = _methodData.sort(function(a, b){
					return a.priorityLevel - b.priorityLevel;
				});
				methodData[methodKey] = _methodData;
				var methodObj = _methodData[_methodData.length - 1];
				var config2 = '';
				for(var i=_methodData.length-1; i>-1&&config2!==''; i++){
					var _methodObj = _methodData[i];
					if(typeof(_methodObj.config2) == "string"){
						config2 = _methodObj.config2;
					}
				}
				if(config2.length > 0){
					methodObj.config2 = config2;
					methodObj.processContent = config2;
				}
				resList.push(methodObj);
			}
			// 改变id 子级id使用父级
			if(isSetOldId){
				for(var i=0; i<resList.length; i++){
					var resObj = resList[i];
					var category = resObj.category;
					var processContent = typeof(resObj.processContent) == "string" ? JSON.parse(resObj.processContent) : resObj.processContent;
					switch(category){
						case 'vo':
							var voName = resObj.name;
							var voObj = classFile.vo[voName];
							if(voObj){
								resObj.id = voObj[0].id;
							}
							break;
						case 'method':
							var voName = processContent.voName;
							var englishName = processContent.englishName;
							var chineseName = processContent.chineseName;
							var methodObj = {};
							for(var methodKey in classFile.method){
								var isHave = false;
								for(var methodI=0; methodI<classFile.method[methodKey].length; methodI++){
									var _methodObj = classFile.method[methodKey][methodI];
									var _processContent = typeof(_methodObj.processContent) == "string" ? JSON.parse(_methodObj.processContent) : _methodObj.processContent;
									if(_processContent.voName == voName && (_processContent.englishName == englishName || _processContent.chineseName == chineseName)){
										isHave = true;
										methodObj = classFile.method[methodKey];
										break;
									}
								}
								if(isHave){
									break;
								}
							}
							if(!$.isEmptyObject(methodObj)){
								resObj.id = methodObj[0].id;
							}
							break;
					}
				}
			}
			// 通过方法中的voName重新定义voId 原因：方法中的voId还是原来的   
			var voNameToId = {};
			for(var i=0; i<resList.length; i++){
				var resObj = resList[i];
				var category = resObj.category;
				if(category == 'vo'){
					voNameToId[voMapManager.getShortName(resObj.name)] = resObj.id;
				}
			}
			for(var i=0; i<resList.length; i++){
				var resObj = resList[i];
				var category = resObj.category;
				if(category == 'method'){
					var processContent = typeof(resObj.processContent) == "string" ? JSON.parse(resObj.processContent) : resObj.processContent;
					for(var nameKey in voNameToId){
						if(processContent.voName == nameKey){
							processContent.voId = voNameToId[nameKey];
							break;
						}
					}
					resObj.processContent = JSON.stringify(processContent);
				}
			}
			// 设置vo中的remark
			// voMapTable.getVoRemarkByVoId
			for(var i=0; i<resList.length; i++){
				if(resList[i].category == 'vo'){
					resList[i].remark = voMapTable.getVoRemarkByVoId(resList[i].id, resList)
				}
			}
			return resList;
		},
		//获取voMap的vo和method明细来格式化数据
		getVoMapFormatArraysByRes:function(_resList, entityName, isSetOldId, isPrev){
			// isSetOldId 是否使用旧的id（即：第一层级的id）思维导图用的是子级（即：最后一级）的id / 模版编辑和页面显示用到的是第一级id，因为继承关系导致子级继承父级配置，父级用的id是旧的
			isSetOldId = typeof(isSetOldId) == "boolean" ? isSetOldId : false; // 默认否
			isPrev = typeof(isPrev) == "boolean" ? isPrev : false; // 是否上一级配置 默认false
			var _this = this;
			function errorInfo(errorInfoStr, errorObj){
				nsAlert(errorInfoStr, 'error');
				console.error(errorInfoStr);
				console.error(errorObj);
			}
			var resList = _this.getListByNameLevel(_resList, isSetOldId, isPrev);
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
				detailData.originalContent = typeof(detailData.originalContent) == "string" ? JSON.parse(detailData.originalContent) : detailData.originalContent;
				if(typeof(detailData.originalContent)=='undefined'){
					errorInfo(detailData.name + '原始数据读取错误', detailData);
				}
				//编辑后的数据
				detailData.processContent = typeof(detailData.processContent) == "string" ? JSON.parse(detailData.processContent) : detailData.processContent;
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
					// var editState = $.extend(true, [], voList[indexI].config2.states);
					// var stateData = voList[indexI].processData.states;
					// for(var i=0; i<stateData.length; i++){
					// 	if(stateData[i].englishName == "defalut"){
					// 		continue;
					// 	}
					// 	var isHave = false;
					// 	for(var j=0; j<editState.length; j++){
					// 		if(editState[j].gid == stateData[i].gid){
					// 			isHave = true;
					// 			break;
					// 		}
					// 	}
					// 	if(!isHave){
					// 		stateData[i].fieldNames = $.isArray(stateData[i].fieldNames) ? stateData[i].fieldNames : stateData[i].field;
					// 		editState.push(stateData[i]);
					// 	}
					// }
					// this.voRes = voList[indexI];
					return [voList[indexI].config2.states, voList[indexI]];
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
				if(values.type != 'add' &&　values.type != 'delAdd'){
					var isEdit = false;
					if(nsProjectPagesManager.pages.voList.voMapTable.prevProcessContent && nsProjectPagesManager.pages.voList.voMapTable.prevProcessContent.state){
						var states = nsProjectPagesManager.pages.voList.voMapTable.prevProcessContent.state;
						for(var i=0; i<states.length; i++){
							if(states[i].gid === values.gid){
								isEdit = true;
								values.objectState = NSSAVEDATAFLAG.EDIT;
								break;
							}
						}
					}
					if(!isEdit){
						values.objectState = NSSAVEDATAFLAG.ADD;
					}
				}else{
					values.objectState = NSSAVEDATAFLAG.ADD;
				}
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
								if(nsProjectPagesManager.pages.voList.voMapTable.prevProcessContent && nsProjectPagesManager.pages.voList.voMapTable.prevProcessContent.state){
									var states = nsProjectPagesManager.pages.voList.voMapTable.prevProcessContent.state;
									for(var i=0; i<states.length; i++){
										if(states[i].gid === setStateDialog.stateFieldsEdit.values.gid){
											setStateDialog.stateFieldsEdit.values.objectState = NSSAVEDATAFLAG.EDIT;
											break;
										}
									}
								}
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
						var defaultValues = $.extend(true,{}, _values);
						var defaultFields = $.extend(true,[], defaultValues.field);
						delete defaultValues.field;
						defaultValues.fieldNames = defaultFields;
						values = defaultValues;
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
	//外部调用-------------------------------------------------------------------------------
	return {
        voMapTable : voMapTable,
		voMapManager:voMapManager, 		//voMap管理器
	}
})(jQuery);
//根据设定的文字大小返回表格列宽度 fieldlength是字的长度
nsMindjetToJS.getTableFieldWidth = function(fieldlength){
    //字段长度
    var width = 0;
    if(fieldlength){
        var fieldWidth = fieldlength*12 + 10;
        /**
        *tableMinWidth:表格字段列最小宽度
        *tableMaxWidth:表格字段列最大宽度
        *tableDefWidth:表格字段列默认宽度
        */
        width = fieldWidth;
        return width;
    }else{
        //没有定义宽度，也没有定义
        width = defaultValue.columnWidth;
    }
    return width;
}
var NetstarComponentEditor = (function($){
	// 显示内容
	var componentTypeData = {
		business:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'},
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
            showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		businessSelect:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'},
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
            showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		text:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'},
				{value:'remote',text:'ajax验证'},
				{value:'ismobile',text:'手机号'},
				{value:'isphone',text:'固定电话'},
				{value:'fax',text:'传真'},
				{value:'postalcode',text:'邮政编码'},
				{value:'email',text:'邮箱'},
				{value:'url',text:'地址'},
				{value:'Icd',text:'身份证号'},
			],
			moreRules:true,
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		password:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'},
			],
			moreRules:true,
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		number:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'},
				{value:'ismobile',text:'手机号'},
				{value:'isphone',text:'固定电话'},
				{value:'postalcode',text:'邮政编码'},
				{value:'Icd',text:'身份证号'},
				{value:'bankno',text:'银行卡号'},
				{value:'positiveInteger',text:'正整数'},
				{value:'negative',text:'负数合法'},
				{value:'min=0',text:'大于等于0'},
				{value:'positive',text:'正数'},
				{value:'nonnegativeInteger',text:'非负整数'},
				{value:'integer',text:'整数'},
			],
			moreRules:true,
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		select:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:true,
			changeHandlerData:true,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		radio:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:true,
			changeHandlerData:true,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		checkbox:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:true,
			changeHandlerData:true,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		date:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		hidden:{
            // 表单基本配置
			label:true,
			rules:false,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:false,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		textarea:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'},
				{value:'number',text:'数字'},
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		'select-dict':{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:true,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		'select2-dict':{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:true,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		'radio-dict':{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:true,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		'checkbox-dict':{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:true,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		switch:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:true,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
        },
        provinceselect:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:false,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
        map:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
        dateRangePicker:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
        treeSelect:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:true,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
        valuesInput:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:true,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
        upload:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
        timeUnit:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:false,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
        uploadImage:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
        adderSubtracter:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'},
				{value:'ismobile',text:'手机号'},
				{value:'isphone',text:'固定电话'},
				{value:'postalcode',text:'邮政编码'},
				{value:'Icd',text:'身份证号'},
				{value:'bankno',text:'银行卡号'},
				{value:'positiveInteger',text:'正整数'},
				{value:'negative',text:'负数合法'},
				{value:'min=0',text:'大于等于0'},
				{value:'positive',text:'正数'},
				{value:'nonnegativeInteger',text:'非负整数'},
				{value:'integer',text:'整数'},
			],
			moreRules:true,
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:false,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		cubesInput: {
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'},
			],
			moreRules:false,
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		standardInput: {
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'},
			],
			moreRules:false,
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		listSelectInput: {
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'},
			],
			moreRules:false,
			label:true,
            // tab页配置
			base:true,
			listData:true,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		selectInput: {
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:true,
			changeHandlerData:true,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		label:{
			label:true,
			rules:false,
			readonly:false,
			base:true,
			listData:false,
			changeHandlerData:false,
			other:false,
			showType:false,
		},
		note:{
			label:false,
			rules:false,
			base:true,
			readonly:false,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:false,
		},
		html:{
			label:false,
			rules:false,
			base:true,
			readonly:false,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:false,
		},
		hr:{
			label:false,
			rules:false,
			base:true,
			readonly:false,
			listData:false,
			changeHandlerData:false,
			other:false,
			showType:false,
		},
		title:{
			label:true,
			rules:false,
			readonly:false,
			base:true,
			listData:false,
			changeHandlerData:false,
			other:false,
			showType:false,
		},
		br:{
			label:false,
			rules:false,
			readonly:false,
			base:true,
			listData:false,
			changeHandlerData:false,
			other:false,
			showType:false,
		},
		element:{
			label:true,
			rules:false,
			readonly:false,
			base:true,
			listData:false,
			changeHandlerData:false,
			other:false,
			showType:false,
		},
	}
	// 其它面板 表单显示内容
	var formConfig = {
        // 组件其它配置
		select:['textField','valueField','contentType','relationField','outputFields','total','isObjectValue','listExpression','panelConfig','selectMode','isPreloadData'],
		radio:['isHasClose','textField','valueField','relationField','outputFields','total','isObjectValue','contentType','searchMode','searchName'],
		checkbox:['textField','valueField','relationField','outputFields','total','isObjectValue','searchMode','searchName'],
		date:['isDefaultDate','format','fieldStart','fieldEnd','ranges'],
		textarea:['inputHeight','total','isUseUEditor','model'],
		'select-dict':['dictArguments','textField','valueField','relationField','outputFields','total','isObjectValue','selectMode'],
		'radio-dict':['dictArguments','textField','valueField','isHasClose','relationField','outputFields','total','isObjectValue'],
		'checkbox-dict':['dictArguments','textField','valueField','relationField','outputFields','total','isObjectValue'],
		text:['value','total','remoteAjax'],
		password:['value','isMd5'],
		number:['value','total','decimalDigit'],
        business:['dialogTitle','infoBtnName','selectMode','idField','textField','voField','relationField','defaultSearchData','parameterFormat','validateParams','outputFields','innerFields','assignExpres','isOutputString','selectedKey','isInputText','source-ajax','search-ajax','getRowData-ajax','getFormData-ajax','subdataAjax-ajax'],
        businessSelect:['selectMode','idField','textField','voField','relationField','listExpression','panelConfig','defaultSearchData','outputFields','innerFields','assignExpres','source-ajax','getRowData-ajax','getFormData-ajax'],
		provinceselect:['',''],
		map : ['mapType','subFields-code','subFields-longitude','subFields-latitude'],
		dateRangePicker : ['ranges','isDefaultDate','format','fieldStart','fieldEnd'],
		treeSelect : ['textField','valueField','fullnameField','contentType','children','parentId','level','isMultiple','outputFields','isTurnTree','relationField'],
		valuesInput : ['format'],
		upload : ['textField','valueField','isMultiple','accept','urlField','thumUrlField','isShowThum','fileTypeField','btns', 'visibilityLevel','outputFields'],
		uploadImage : ['textField','valueField','isMultiple','fileTypeField'],
		cubesInput : ['getAjax-ajax','saveAjax-ajax'],
		standardInput : ['attrTextField','attrValueField','ajax-ajax','subdataAjax-ajax'],
		listSelectInput : ['textField','valueField','selectAjax-ajax'],
		selectInput : ['textField','valueField','contentType','relationField','outputFields'],
        // 表单配置
		ajax:['url','method','dataSrc','data','contentType'],
		form:['disabled','form-width','inputWidth','form-hidden','isDistinct', 'tipContent', 'tipClass','distinctField','valueExpression','setValueExpression','placeholder','gridPlaceholder','isAloneQuery'],
        // 表格配置
        table:['editable','table-width','fieldLength','table-hidden','orderable','searchable','total','tooltip','rowColor','isDefaultSubdataText','isTreeNode','isTitle','isValue','isQuickQuery','isColumnCombine'],
        columnFormat:['columnFormat-type','columnFormat-format','places','symbol','thousand','decimal','url','title','readonly','field','parameterFormat','templateName','totalSymbol','isAllwaysNewTab','urlSubdata','subdataField','isSendQueryModel','isFirstUseRow'],
        footer:['footer-type', 'footer-content'],
        viewConfig:['viewConfig-type','url','method','dataSrc','data'],
	}
	// 验证url 如果地址是以http开头则认为是完整的否则分为是后缀 删除url加suffix
	function validUrl(obj){
		function editUrl(_obj){
			for(var key in _obj){
				switch(typeof(_obj[key])){
					case 'string':
					case 'number':
					case 'boolean':
						if(key=='url'){
							if(_obj[key].indexOf('http')==0){}else{
								_obj.suffix = _obj[key];
								delete  _obj[key];
							}
						}
						break;
					case 'object':
						if($.isArray(_obj[key])){
							for(var arrI = 0; arrI<_obj[key].length; arrI++){
								if(typeof(_obj[key][arrI])=='object'){
									editUrl(_obj[key][arrI]);
								}
							}
						}else{
							editUrl(_obj[key]);
						}
						break;
					default:
						break;
				}
			}
		}
		editUrl(obj);
	}
	// 格式化 changeHandlerData数据
	function formatChangeHandlerData(changeHandlerData){
		var changeHandlerDataObj = {};
		for(var typeName in changeHandlerData){
			for(var className in changeHandlerData[typeName]){
				if(typeof(changeHandlerDataObj[className])=='undefined'){
					changeHandlerDataObj[className]={};
					changeHandlerDataObj[className][typeName]={};
				}
				if(typeof(changeHandlerDataObj[className][typeName])=='undefined'){
					changeHandlerDataObj[className][typeName]={};
				}
				for(var idName in changeHandlerData[typeName][className]){
					changeHandlerDataObj[className][typeName][idName] = changeHandlerData[typeName][className][idName];
				}
			}
		}
		return changeHandlerDataObj;
	}
	// 删除对象中空的字符串
	function deleteEmptyString(object){
		for(key in object){
			if(object[key].length == 0){
				delete object[key];
			}
		}
	}
	// 获得其他配置
	function setOtherAttrByOther(obj,sourceObj){
		deleteEmptyString(sourceObj.other);
		function setAttr(arr,newObj,souObj){
			/**
			 * arr 			attrArr
			 * newObj		obj.saveAjax
			 * souObj 		sourceObj.other
			 */
			for(attrI=0;attrI<arr.length;attrI++){
				if(souObj[arr[attrI]]){
					newObj[arr[attrI]] = souObj[arr[attrI]];
				}
			}
		}
		// 处理其他配置 需要添加到特殊对象中的特殊处理默认添加最外层
		switch(sourceObj.type){
			case 'input-select':
				obj.textField = sourceObj.other.textField;
				obj.valueField = sourceObj.other.valueField;
				obj.saveAjax = {};
				var attrArr = ['url','method','data'];
				// 添加到saveAjax对象
				setAttr(attrArr,obj.saveAjax,sourceObj.other);
				break;
			case 'person-select':
				obj.textField = sourceObj.other.textField;
				obj.valueField = sourceObj.other.valueField;
				obj.wbCode = sourceObj.other.wbCode;
				obj.pyCode = sourceObj.other.pyCode;
				obj.parentId = sourceObj.other.parentId;
				obj.personAjax = {};
				var attrArr = ['url','method','data','dataSrc','localDataConfig'];
				// 添加到personAjax对象
				setAttr(attrArr,obj.personAjax,sourceObj.other);
				break;
			default:
				for(var key in sourceObj.other){
					obj[key] = sourceObj.other[key];
				}
				break;
		}
	}
	// 把两个对象拼接在一起
	function splicingTwoObjects(object1,object2){
		for(var key in object2){
			object1[key] = object2[key];
		}
    }
    // 获取表单需要的配置参数
    function getFormConfig(_sourceObj){
        var formObj = {}
        for(var key in _sourceObj){
            if(key != 'columnFormat'&&key != 'footer'&&key != 'viewConfig'){
                formObj[key] = _sourceObj[key];
            }
        }
		return formObj;
    }
	// 获取显示对象 根据 addArr（表单/表格 配置的字段）在addObj中挑选字段添加到sourceObj中返回对象
	function getVisibleObj(_sourceObj,addArr,addObj){
		var sourceObj = $.extend(true,{},_sourceObj);
		for(index=0;index<addArr.length;index++){
			if(addObj[addArr[index]]){
                var keyStr = addArr[index];
                // 查询正确的key值
                if(keyStr.indexOf('-')>0){
                    var keyArr = keyStr.split('-');
                    var typeStr = keyArr[0];
                    var valStr = keyArr[1];
                    if(typeStr == 'form'||typeStr == 'table'){
                        keyStr = valStr;
                    }
                }
				sourceObj[keyStr] = addObj[addArr[index]];
			}
		}
		return sourceObj;
	}
	// 表单对象处理
	function setFormObj(obj){
		//标题框处理
		if(typeof(obj.element) == "string"){
			obj.width = '100%';
			return obj;
		}
		// 选择下拉框selected改为isChecked
		function formatSubdata(subdata){
			for(var subI=0;subI<subdata.length;subI++){
				subdata[subI].isChecked = subdata[subI].selected;
				delete subdata[subI].selected;
			}
			return subdata;
		}
		//需要根据类型处理的field对象
		switch(obj.type){
			case 'text':
			case 'number':
			case 'adderSubtracter':
				if(obj.moreRules && obj.moreRules.length > 0){
					obj.rules += ',' + obj.moreRules;
				}
				break;
			case 'provincelink-select':
				// 省市联动 默认column：6
				if(typeof(obj.column)=="undefined"){
					obj.column = 6;
				}
				break;
			case 'radio':
				if(obj.subdata){
					if(obj.subdata.length > 0){
						obj.subdata = formatSubdata(obj.subdata);
					}
				}
				break;
			case 'checkbox':
				//多选，没有subdata，label包含是否/isOnlyShowOneCheckbox
				if(obj.subdata){
					if(obj.subdata.length == 0){
						if(obj.label.indexOf("是否") > -1){ //当有是否字样时 设置默认属性isOnlyShowOneCheckbox = true；
							obj.isOnlyShowOneCheckbox = true;
						}
						if(obj.isOnlyShowOneCheckbox){
							obj.subdata = [
								{
									text:'',
									value:'1'
								}
							];
						}
					}else{
						obj.subdata = formatSubdata(obj.subdata);
					}
				}
				break;
			case 'switch':
				//多选，显示一个选项，特殊样式（label的class是：switch-inline）
				obj.type = "checkbox";
				obj.isOnlyShowOneCheckbox = true;
				obj.displayClass = "switch";
				obj.subdata = [
					{
						text:'',
						value:'1'
					}
				];
				break;
			case  'textarea':
				if(typeof(obj.column)=='undefined'){
					obj.column = 12;
				}
				break;
			case 'uploadImage':
				// obj.textField = "imgurl";
				// obj.valueField = "id";
				// obj.url = getRootPath() + '/File/upload';
				// obj.changeHandler = function(data){
				// 	return {
				// 		id:'0001',
				// 		imgurl:'http://ui-pc:8888/NPE/image/login/pe.png'
				// 	}
				// }
				break;
			case 'uploadSingle':
				// obj.textField = "name";
				// obj.valueField = "id";
				// obj.supportFormat = '.doc,image/*,.xls';
				// obj.uploadSrc = getRootPath() + '/File/upload';
				// obj.changeHandler = function(data){
				// 	return {
				// 		id:'0001',
				// 		name:'1111.doc'
				// 	}
				// }
				break;
			case 'graphicsInput':
				obj.max = typeof(obj.max) == "string" || typeof(obj.max) == "number" ? obj.max : 5;
				obj.step = typeof(obj.step) == "string" || typeof(obj.step) == "number" ? obj.step : 0.5;
				break;
			case 'typeaheadtemplate':
				if(obj.url == ''){
					delete obj.url;
				}
				break;
			case 'input-select':
				var selectConfigArr = ['textField','valueField','url','dataSrc','method','data','subdata'];
				obj.selectConfig = {};
				for(attrI = 0; attrI < selectConfigArr.length; attrI++){
					if(obj[selectConfigArr[attrI]]){
						obj.selectConfig[selectConfigArr[attrI]] = obj[selectConfigArr[attrI]];
						delete obj[selectConfigArr[attrI]];
					}
				}
				break;
			case 'person-select':
				var selectConfigArr = ['textField','valueField','url','dataSrc','method','data','wbCode','pyCode','parentId'];
				obj.groupAjax = {};
				for(attrI = 0; attrI < selectConfigArr.length; attrI++){
					if(obj[selectConfigArr[attrI]]){
						obj.groupAjax[selectConfigArr[attrI]] = obj[selectConfigArr[attrI]];
						delete obj[selectConfigArr[attrI]];
					}
				}
				break;
			case 'expression':
				var selectConfigArr = ['url','dataSrc','method','data'];
				obj.dataSource = [];
				obj.listAjax = {};
				for(attrI = 0; attrI < selectConfigArr.length; attrI++){
					if(obj[selectConfigArr[attrI]]){
						if(selectConfigArr[attrI] == 'method'){
							obj.listAjax.type =  obj[selectConfigArr[attrI]];
						}else{
							obj.listAjax[selectConfigArr[attrI]] = obj[selectConfigArr[attrI]];
						}
						delete obj[selectConfigArr[attrI]];
					}
				}
				break;
			case 'tableForm':
				obj.type = 'table';
				if(obj.url){
					obj.src = obj.url;
					delete obj.url;
				}
				if(obj.method){
					obj.srctype = obj.method;
					delete obj.method;
				}
				break;
			default:
				break;
		}
		//field字段类型转换
		$.each(obj, function(fieldName, fieldValue){
			switch(fieldName){
				//转换为数字的属性
				case 'column':
				case 'height':
				case 'inputWidth':
				case 'inputHeight':
				case 'maximumItem':
				case 'pageLengthMenu':
				case 'isAllowFiles':
				case 'decimalDigit':
				case 'level':
				case 'defaultSelectedIndex':
					if(obj[fieldName] != ''&&typeof(obj[fieldName])!='number'){
						obj[fieldName] = parseInt(obj[fieldName]);
					}
					if(isNaN(obj[fieldName])){
						errorData.push(obj.englishName+'的'+fieldName + '定义错误：'+ fieldValue+', '+fieldName+'-warn');
						console.warn(fieldName + '定义错误：'+ fieldValue+', '+fieldName+'-warn');
						delete obj[fieldName];
					}
					break;
				//转换为布尔值
				case 'isDefaultDate':
				case 'multiple':
				case 'filltag':
				case 'isAllowClear':
				case 'isHasClose':
				case 'wordCount':
				case 'isPage':
				case 'isMulitSelect':
				case 'isSingleSelect':
				case 'hidden':
				case 'disabled':
				case 'isDistinct':
				case 'isObjectValue':
				case 'ranges':
				case 'isMultiple':
				case 'isUseUEditor':
				case 'isTreeNode':
				case 'isTurnTree':
				case 'isPreloadData':
				case 'isOutputString':
				case 'isInputText':
				case 'isMd5':
				case 'isShowCalculator':
				case 'isAsync':
				case 'isTitle':
				case 'isValue':
				case 'isQuickQuery':
				case 'isReadDefaultWidth':
				case 'isAddLinkhref':
				case 'isPage':
				case 'isDeleteObjectState':
				case 'isColumnCombine':
				case 'isAloneQuery':
				case 'isSendQueryModel':
					if(fieldValue=='true'){
						obj[fieldName] = true;
					}
					if(fieldValue=='false'){
						obj[fieldName] = false;
					}
					break;
				case 'isCloseSearch':
					if(fieldValue=='-1'){
						obj[fieldName] = -1;
					}
					if(fieldValue=='1'){
						obj[fieldName] = 1;
					}
					break;
				case 'label':
					var labelIsChinese = /[\u4e00-\u9fa5]/;
					var labelLength = 0;
					for(i=0;i<fieldValue.length;i++){
					    if(labelIsChinese.test(fieldValue[i])){
					        labelLength += 2;
					    }else{
					        labelLength++;
					    }
					}
					if(typeof(obj.plusClass)!="string"){
						if(labelLength<=14){

						}else{
							if(labelLength>=14 && labelLength<=20){
								obj.plusClass = "width:140";
								obj.plusClassIsWithCol = true;
							}else{
								if(labelLength>20){
									obj.plusClass = "width:200";
									obj.plusClassIsWithCol = true;
								}
							}
						}
					}else{
						if(typeof(obj.plusClassIsWithCol)!="string"){
							if(obj.plusClass != "strongtext"){
								obj.plusClassIsWithCol = true;
							}
						}
					}
					break;
				// 字符串转换为数组 ****，****，****
				case 'toolbars':
					if(fieldValue.length>0){
						fieldValue = fieldValue.split(',');
						obj[fieldName] = fieldValue;
					}
					break;
				// 字符串转换为数组 [{},{}] / 方法 / ['','']
				case 'addHandler':
				case 'completeHandler':
				case 'listAjaxFields':
				case 'assistBtnWords':
				// case 'toolbars':
				case 'selfData':
				case 'columnConfig':
					if(fieldValue.length>0){
						obj[fieldName] = eval('(' + fieldValue + ')');
					}
					break;
				case 'localDataConfig':
					if(fieldValue.length>0){
						obj[fieldName] = eval(fieldValue);
					}
					break;
				case 'data':
				case 'outputFields':
				case 'defaultSearchData':
				case 'panelConfig':
				case 'assignExpres':
				case 'innerFields': 
				case 'uploadAjaxData':
				case 'linkParams':
				case 'formatValueData':
				case 'infoConfig':
					if(fieldValue.length>0){
						obj[fieldName] = JSON.parse(fieldValue);
					}
					break;
				case 'personAjax':
				case 'groupAjax':
					if(fieldValue.method){
						obj[fieldName].type = fieldValue.method
						delete obj[fieldName].method;
					}
					if(fieldValue.localDataConfig){
						fieldValue.localDataConfig = eval(obj[fieldName].localDataConfig);
					}
				case 'saveAjax':
				case 'selectConfig':
					if(fieldValue.data){
						if(fieldValue.data.length>0){
							obj[fieldName].data = JSON.parse(fieldValue.data);
						}
					}
					break;
				case 'supportFormat':
					fieldValue = fieldValue.replace(/\ /g,', ');
					obj[fieldName] = fieldValue;
					break;
				case 'rules':
					fieldValue = fieldValue.replace(/\,/g,' ');
					obj[fieldName] = fieldValue;
					break;
                case 'source-url':
                case 'source-dataSrc':
                case 'source-method':
                case 'source-data':
                case 'source-contentType':
                case 'search-url':
                case 'search-dataSrc':
                case 'search-method':
                case 'search-data':
                case 'search-contentType':
                case 'subdataAjax-url':
                case 'subdataAjax-dataSrc':
                case 'subdataAjax-method':
                case 'subdataAjax-data':
                case 'subdataAjax-contentType':
                case 'getRowData-url':
                case 'getRowData-dataSrc':
                case 'getRowData-method':
                case 'getRowData-data':
                case 'getRowData-contentType':
                case 'getFormData-url':
                case 'getFormData-dataSrc':
                case 'getFormData-method':
                case 'getFormData-data':
                case 'getFormData-contentType':
                case 'subFields-code':
                case 'subFields-longitude':
                case 'subFields-latitude':

				case 'getAjax-url':
				case 'getAjax-dataSrc':
				case 'getAjax-method':
				case 'getAjax-data':
				case 'getAjax-contentType':

				case 'saveAjax-url':
				case 'saveAjax-dataSrc':
				case 'saveAjax-method':
				case 'saveAjax-data':
				case 'saveAjax-contentType':

				case 'subDataAjax-url':
				case 'subDataAjax-dataSrc':
				case 'subDataAjax-method':
				case 'subDataAjax-data':
				case 'subDataAjax-contentType':

				case 'ajax-url':
				case 'ajax-dataSrc':
				case 'ajax-method':
				case 'ajax-data':
				case 'ajax-contentType':

				case 'selectAjax-url':
				case 'selectAjax-dataSrc':
				case 'selectAjax-method':
				case 'selectAjax-data':
				case 'selectAjax-contentType':

				case 'produceFileAjax-url':
				case 'produceFileAjax-dataSrc':
				case 'produceFileAjax-method':
				case 'produceFileAjax-data':
				case 'produceFileAjax-contentType':
                    var fieldNameArr = fieldName.split('-');
                    var fieldName1 = fieldNameArr[0];
                    var fieldName2 = fieldNameArr[1];
                    if(typeof(obj[fieldName1])!="object"){
                        obj[fieldName1] = {};
                    }
                    if(fieldName2 == "method"){
                        fieldName2 = 'type';
					}
					switch(fieldName2){
						case "method":
							fieldName2 = 'type';
							break;
						case "data":
							if(fieldValue.length>0){
								fieldValue = JSON.parse(fieldValue);
							}
							break;
					}
                    obj[fieldName1][fieldName2] = fieldValue;
                    delete obj[fieldName];
                    break;
			}
		})
		// 验证url 如果地址是以http开头则认为是完整的否则分为是后缀 删除url加suffix
		validUrl(obj)
		// 删除对象中的空字符
		for(var key in obj){
			if(typeof(obj[key])=="object"){
				deleteEmptyString(obj[key]);
			}
		}
		// 删除空对象
		for(var key in obj){
			if(typeof(obj[key])=="object"&&$.isEmptyObject(obj[key])){
				delete obj[key];
			}else{
				switch(key){
					case 'getRowData':
					case 'getAjax':
					case 'saveAjax':
					case 'getFormData':
					case 'subdataAjax':
					case 'produceFileAjax':
					case 'search':
					case 'source':
					case 'viewConfig':
						if(typeof(obj[key].suffix)!="string"&&typeof(obj[key].url)!="string"){
							delete obj[key];
						}
						break;
				}
			}
		}
	}
	// 获取表格需要的配置参数
	function getTableConfig(_sourceObj, editConfig){
		var tableObj = {
			englishName: _sourceObj.englishName, 			// 英文名
			chineseName: _sourceObj.chineseName,			// 中文名
			variableType: _sourceObj.variableType, 			// 原始js类型
			javaDataType: _sourceObj.javaDataType,			// 原始java类型
			field : _sourceObj.id,							// 表格列id
			title : _sourceObj.label,
			mindjetType : _sourceObj.mindjetType,
			isSet: _sourceObj.isSet,
			displayType: _sourceObj.displayType,
			gid: _sourceObj.gid,
            voName: _sourceObj.voName,
            columnFormat: _sourceObj.columnFormat,
            footer: _sourceObj.footer,
			viewConfig: _sourceObj.viewConfig,
			// columnType:_sourceObj.type,
		}
		if(tableObj.mindjetType == 'dict'){
			tableObj.dictArguments = _sourceObj.dictArguments;
		}
		if(typeof(_sourceObj.isDefaultDate)=='string'){
			tableObj.isDefaultDate = _sourceObj.isDefaultDate;
        }
        if(typeof(editConfig)=="object"){
            tableObj.editConfig = $.extend(true, {}, editConfig);
        }
		return tableObj;
	}
	// 表格对象处理
	function setTableObj(obj,souObj){
		//不同类型对应的formatHandler
		var columnTypeData = nsMindjetToJSTools.columnTypeData;
		// 判断属性 转化 
		for(var tableAttrName in obj){
			switch(tableAttrName){
				//转换为数字的属性
				case 'height':
				case 'precision':
				case 'width':
					var sourHeight = obj[tableAttrName];
					if(obj[tableAttrName] != ''&&typeof(obj[tableAttrName])!='number'){
						obj[tableAttrName] = parseInt(obj[tableAttrName]);
					}
					if(obj[tableAttrName] == NaN){
						errorData.push(obj.englishName+'的'+tableAttrName + '定义错误：'+ sourHeight+'height-warn');
						console.warn(tableAttrName + '定义错误：'+ sourHeight+'height-warn');
						delete obj[tableAttrName];
					}
					break;
				case 'orderable':
				case 'searchable':
				case 'total':
				case 'hidden':
				case 'tooltip':
				case 'isDefaultDate':
				case 'editable':
				case 'isDefaultSubdataText':
				case 'isTreeNode':
				case 'isTitle':
				case 'isValue':
				case 'isQuickQuery':
				case 'isColumnCombine':
					if(obj[tableAttrName] != ''){
						if(obj[tableAttrName] == 'true'){
							obj[tableAttrName] = true;
						}else{
							obj[tableAttrName] = false;
						}
					}
					break;
				case 'fieldLength':
					if(obj.width){
						delete obj.fieldLength;
					}else{
						var fieldlength = parseInt(obj.fieldLength);
						obj.width = nsMindjetToJS.getTableFieldWidth(fieldlength);
						delete obj.fieldLength;
					}
					break;
				case 'rowColor':
					obj.rowColor = JSON.parse(obj.rowColor);
					break;
			}
		}
		// 删除对象中的空字符
		for(var key in obj){
			if(typeof(obj[key])=="object"){
				deleteEmptyString(obj[key]);
			}
		}
		// 删除空对象
		for(var key in obj){
			if(typeof(obj[key])=="object"&&$.isEmptyObject(obj[key])){
				delete obj[key];
			}else{
				switch(key){
					case 'viewConfig':
						if(typeof(obj[key].suffix)!="string"&&typeof(obj[key].url)!="string"){
							delete obj[key];
						}
						break;
				}
			}
		}
        var columnFormatObj = obj.columnFormat;
        if($.isEmptyObject(columnFormatObj)){
            return;
        }
        var columnType = columnFormatObj.type;
        var columnFormat = columnFormatObj.format;
		//需要根据类型处理的column对象
		switch(columnType){
			case 'stringReplace':
				//格式化radio select
				if(souObj.type == "radio"||souObj.type == "checkbox"||souObj.type == "select"||souObj.type == 'switch'){
					if($.isArray(souObj.subdata)){
						var formatDate = {};
						for(var subdataI = 0; subdataI<souObj.subdata.length; subdataI++){
							var formatDataValue = souObj.subdata[subdataI][souObj.valueField];
							formatDate[formatDataValue] = souObj.subdata[subdataI][souObj.textField];
						}
						obj.formatHandler = $.extend(true,{},columnTypeData.stringReplace);
						obj.formatHandler.data = {formatDate:formatDate};
					}
					if(souObj.type == 'switch'){
						obj.formatHandler = $.extend(true,{},columnTypeData.stringReplace);
						obj.formatHandler.data = {
							formatDate:{
								"0":"否",
								"1":"是",
							}
						};
					}
				}else{
					var errorStr = souObj.englishName + '配置的类型' + souObj.type + '不支持stringReplace（字符串替换）';
					nsAlert(errorStr,'error');
					console.error(errorStr);
					console.error(souObj);
					console.error(obj);
					delete obj.formatHandler;
				}
				break;
			case 'columnState':
				obj.formatHandler = $.extend(true,{},columnTypeData.columnState);
				obj.formatHandler.data = JSON.parse(columnFormat);
				break;
			case 'money':
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				obj.formatHandler.data = {};
				obj.formatHandler.data.format = {
					places : columnFormatObj.places,
					symbol : columnFormatObj.symbol,
					thousand : columnFormatObj.thousand,
					decimal : columnFormatObj.decimal,
					totalSymbol : columnFormatObj.totalSymbol,
				}
				// var columnFormat = Number(columnFormat);
				// if(!isNaN(columnFormat)){
				// 	var stringZero = '';
				// 	for(i=0;i<columnFormat;i++){
				// 		stringZero += "0";
				// 	}
				// 	obj.formatHandler.format = ",." + stringZero;
				// }else{
				// 	obj.formatHandler.format = ",.00"
				// }
				break;
			case 'number':
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				obj.formatHandler.data = {};
				obj.formatHandler.data.format = {
					places : columnFormatObj.places,
					thousand : columnFormatObj.thousand,
				}
				break;
			case 'radio':
			case 'checkbox':
			case 'selectbase':
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				obj.formatHandler.data[0].textField = souObj.textField;
				obj.formatHandler.data[0].valueField = souObj.valueField;
				obj.formatHandler.data[0].subdata = souObj.subdata;
				break;
			case 'date':
				// obj.width = 86;
				obj.width = 100;
			case 'datetime':
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				if(typeof(obj.isDefaultDate)!='undefined'){
					obj.formatHandler.data.isDefaultDate = obj.isDefaultDate;
				}
				if(columnFormat && columnFormat.length > 0){
					obj.formatHandler.data.formatDate = columnFormat;
				}else{
					if(columnType == 'datetime'){
						// obj.width = 134;
						obj.width = 150;
					}
				}
				break;
			case 'formatDate':
			// case 'dictionary':
			case 'thumb': // 缩略图
			case 'codeToName': // 省市区 code码转化成名字
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				break;
			case 'switch':
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				break;
			// case 'href':
			case 'input':
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				if(columnFormat.length>0){
					obj.formatHandler.data = eval(columnFormat);
				}
				break;
			case 'dictionary':
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				if(columnFormat && columnFormat.length > 0){
					obj.formatHandler.data = JSON.parse(columnFormat);
				}
				break;
			case 'href':
				// obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				// if(columnFormat.length>0){
				// 	obj.formatHandler.data = JSON.parse(columnFormat);
				// }
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				obj.formatHandler.data = {
					url : columnFormatObj.url,
					title : columnFormatObj.title,
					field : columnFormatObj.field,
					readonly : columnFormatObj.readonly === "true" ? true : false,
					parameterFormat : columnFormatObj.parameterFormat,
					templateName : columnFormatObj.templateName,
					isAllwaysNewTab:columnFormatObj.isAllwaysNewTab === "false" ? false : true,//sjj 20200109是否支持多开
					urlSubdata : columnFormatObj.urlSubdata,
					subdataField : columnFormatObj.subdataField,
					isSendQueryModel : columnFormatObj.isSendQueryModel == "true" ? true : false,
					isFirstUseRow : columnFormatObj.isFirstUseRow == "true" ? true : false,
				}
				break;
			case 'upload':
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				// if(columnFormat.length>0){
				// 	obj.formatHandler.data = JSON.parse(columnFormat);
				// }
				break;
			case 'multithumb':// 多张缩略图
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				obj.formatHandler.data.voName = typeof(columnFormat)=='string'?columnFormat:'';
				break;
			case 'renderField':
				obj.formatHandler = {
					type : columnType,
				};
				obj.formatHandler.data = typeof(columnFormat)=='string'?columnFormat:'';
				break;
			case 'cubesInput':
				obj.formatHandler = {
					type : columnType,
				};
				break;
			case 'standardInput':
				obj.formatHandler = {
					type : columnType,
				};
				break;
			case 'buildPdf':
				obj.formatHandler = {
					type : columnType,
					data : {},
				};
				obj.formatHandler.data.fileVoList = typeof(columnFormat)=='string' ? columnFormat : 'fileVOList';
				break;
			case 'textFieldReplace'://多张缩略图
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				obj.formatHandler.data.textField = typeof(columnFormat)=='string' ? columnFormat : '';
				break;
			case 'htmlRender'://多张缩略图
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				break;
			case 'jsonToList':
				obj.formatHandler = {
					type : columnType,
					data : {},
				};
				if(typeof(columnFormat)=='string' && columnFormat.length > 0){
					obj.formatHandler.data = JSON.parse(columnFormat);
				}
				break;
			default:
				break;
		}
		if(typeof(columnType)=="string" && typeof(obj.formatHandler)=="object"){
			obj.columnType = columnType;
		}
        delete obj.columnFormat;
    }
	// 保存数据格式化
	function getFormatData(_sourceData){
		/*config.data.gid = config.sourceConfig.baseData.gid;
		config.data.voName = config.sourceConfig.baseData.voName;*/
		var sourceData = $.extend(true,{},_sourceData);
		var system = componentTypeData[sourceData.type];
		if(!system){
			system = {}
		}
		if(sourceData.type == ''){
			nsalert('没有设置组件类型','error');
			return false;
		}
		// 过滤编辑属性
		var filterAttrData = {
			id: sourceData.englishName,
			englishName: sourceData.englishName,
			chineseName: sourceData.chineseName,
			variableType: sourceData.variableType,
			javaDataType: sourceData.javaDataType,
			mindjetType: sourceData.type,
			isSet: '是',
			displayType: sourceData.displayType,
			gid: sourceData.gid,
			voName: sourceData.voName,
			className: sourceData.className,
		}
		switch(sourceData.type){
			case 'note':
			case 'html':
			case 'element':
			case 'label':
			case 'title':
			case 'hr':
			case 'br':
				filterAttrData = {
					variableType: sourceData.variableType,
					mindjetType: sourceData.type,
					displayType: sourceData.displayType,
					type: sourceData.type,
					gid: sourceData.gid,
				};
				break;
			default:
				break;
        }
        // 此处没用
		switch(sourceData.type){
			case 'note':
			case 'html':
				filterAttrData.displayType = 'form';
				break;
			case 'element':
			case 'label':
			case 'title':
			case 'hr':
			case 'br':
				filterAttrData.element = sourceData.type;
				filterAttrData.width = '100%';
				filterAttrData.displayType = 'form';
				break;
			case 'custom':
				if(sourceData.other.custom == ''){
					nsAlert('没有配置自定义配置');
					return false;
				}
				var formOrTable = sourceData.other.formOrTable;
				var customConfig = JSON.parse(sourceData.other.custom);
				var formatData = {
					displayType:formOrTable
				}
				filterAttrData.displayType = formOrTable;
				formatData[formOrTable] = filterAttrData;
				splicingTwoObjects(formatData[formOrTable],customConfig);
				return formatData;
				break;
			case 'select-dict':
			case 'select2-dict':
			case 'radio-dict':
			case 'checkbox-dict':
				var typeArr = sourceData.type.split('-');
				filterAttrData.type = typeArr[0];
				filterAttrData.mindjetType = typeArr[1];
				break;
			default:
				filterAttrData.type = sourceData.type;
				break;
		}
		if(system.label){
			filterAttrData.label = sourceData.label == '' ? sourceData.chineseName : sourceData.label;
		}
		if(system.rules){
			filterAttrData.rules = sourceData.rules;
		}
		if(system.moreRules){
			filterAttrData.moreRules = sourceData.moreRules;
		}
		if(system.other){
			setOtherAttrByOther(filterAttrData,sourceData);
		}
		if(system.changeHandlerData){
			filterAttrData.changeHandlerData = formatChangeHandlerData(sourceData.changeHandlerData);
		}
		if(system.listData){
			if(sourceData.isUseAjax){
				for(var ajaxType in sourceData.ajax){
					filterAttrData[ajaxType] = sourceData.ajax[ajaxType];
				}
			}else{
				filterAttrData.subdata = [];
				var textField = typeof(filterAttrData.textField) == 'undefined' ? 'value' : filterAttrData.textField;
				var valueField = typeof(filterAttrData.valueField) == 'undefined' ? 'id' : filterAttrData.valueField;
				filterAttrData.textField = textField;
				filterAttrData.valueField = valueField;
				// 根据 textField和valueField 定义下拉列表的text/value值
				for(index=0;index<sourceData.subdata.length;index++){
					// 判断isDisabled/selected 根据定义 isDisabled/selected
					var isDisabledFormax = sourceData.subdata[index].isDisabled;
					var selectedFormax = sourceData.subdata[index].selected;
					if(isDisabledFormax == 'true'){
						isDisabledFormax = true;
					}else{
						isDisabledFormax = false;
					}
					if(selectedFormax == 'true'){
						selectedFormax = true;
					}else{
						selectedFormax = false;
					}
					var subdataObj = {
						isDisabled:isDisabledFormax,
						selected:selectedFormax,
					}
					subdataObj[textField] = sourceData.subdata[index].textField;
					subdataObj[valueField] = sourceData.subdata[index].valueField;
					filterAttrData.subdata.push(subdataObj);
				}
			}
		}
		if(system.columnFormat){
			filterAttrData.columnFormat = sourceData.columnFormat;
		}
		if(system.footer){
			filterAttrData.footer = sourceData.footer;
		}
		if(system.viewConfig){
			filterAttrData.viewConfig = sourceData.viewConfig;
		}
		var formatData = {
				displayType:filterAttrData.displayType,
				type:filterAttrData.type,
			};
		switch(formatData.displayType){
			case 'all':
				var formShow = formConfig.form;//表单独有的
				var formObj = getFormConfig(filterAttrData);
				formatData.form = getVisibleObj(formObj,formShow,sourceData[sourceData.displayType]);
				setFormObj(formatData.form);
				var tableShow = formConfig.table;//表格独有的
				var tableObj = getTableConfig(filterAttrData, formatData.form);
				formatData.table = getVisibleObj(tableObj,tableShow,sourceData[sourceData.displayType]);
				setTableObj(formatData.table,filterAttrData);
				break;
			case 'form':
				var formShow = formConfig.form;
				var formObj = getFormConfig(filterAttrData);
				formatData.form = getVisibleObj(formObj,formShow,sourceData[sourceData.displayType]);
				setFormObj(formatData.form);
				break;
            case 'table':
				var formShow = formConfig.form;
				var formObj = getFormConfig(filterAttrData);
				editConfig = getVisibleObj(formObj,formShow,sourceData[sourceData.displayType]);
				setFormObj(editConfig);
				var tableShow = formConfig.table;
				var tableObj = getTableConfig(filterAttrData, editConfig);
				formatData.table = getVisibleObj(tableObj,tableShow,sourceData[sourceData.displayType]);
                setTableObj(formatData.table,filterAttrData);
				break;
        }
        // console.log(formatData);
		return formatData;
    }
    return {
        getFormatData : getFormatData,
    }
})(jQuery)
var nsComponentEditor = NetstarComponentEditor;
var nsFuncEditor = (function($){
    function formatEditData(_editorData){
        var formatData = $.extend(true,{},_editorData);
        for(var attrKey in formatData){
            if(formatData[attrKey] == ''){
                continue;
            }
            switch(attrKey){
                case 'width':
                case 'height':
                    if(formatData[attrKey].indexOf('%')>-1){
                        formatData[attrKey] = formatData[attrKey];
                    }else{
                        formatData[attrKey] = parseInt(formatData[attrKey]);
                    }
                    break;
                case 'functionField':
                    formatData.functionField = 'nsProject.getFieldsByState('+formatData.entityName+'.'+formatData.voName+',"'+formatData.functionField+'",{isColumn:false,isDialog:true,isValidSave:true})';
                    break;
                case 'ajaxData':
				case 'fileAjaxData':
                case 'getDataByAjax':
                case 'getPageDataExpression':
                    formatData[attrKey] = JSON.parse(formatData[attrKey]);
                    break;
                case 'editorType':
                    // console.log(formatData[attrKey]);
                    if(formatData.defaultMode == "editorDialog"){
                        if(formatData[attrKey]!=""){
                            var textArr = [];
                            var textObj = {
                                add : "新增",
                                copyAdd : "复制新增",
                                edit : "编辑",
                                passiveAdd : '被动新增',
                            }
                            for(var editorTypeI=0;editorTypeI<formatData[attrKey].length;editorTypeI++){
                                textArr.push(textObj[formatData[attrKey][editorTypeI]]);
                            }
                            formatData.text = textArr.toString();
                        }
                        formatData[attrKey] = formatData[attrKey].toString();
                    }
                    break;
                case 'isCloseWindow':
                case 'isCopyObject':
                case 'isMainDbAction':
                case 'isAlwaysNewTab':
                case 'isSetMore':
                case 'isEditMode':
                case 'isInlineBtn':
                case 'isMobileInlineBtn':
                case 'isHaveSaveAndAdd':
                case 'isUseAjaxByCopyAdd':
                case 'isReadonly':
                case 'isSendPageParams':
                case 'isIsSave':
                case 'isKeepSelected':
				case 'isSetValueToSourcePage':
				case 'isUseConfirm':
                    if(formatData[attrKey] == 'true'){
                        formatData[attrKey] = true;
                    }
                    if(formatData[attrKey] == 'false'){
                        formatData[attrKey] = false;
                    }
                    break;
                case 'columns':
                    formatData.columns = 'nsProject.getFieldsByState('+formatData.entityName+'.'+formatData.voName+',"'+formatData.columns+'",{isColumn:true,isDialog:true,isValidSave:true})';
                    break;
                case 'download-suffix':
                    formatData.suffix = formatData['download-suffix'];
                    delete formatData[attrKey];
                    break;
                case 'uploadAjax-suffix':
                case 'importAjax-suffix':
                case 'uploadAjax-dataSrc':
                case 'importAjax-dataSrc':
                case 'uploadAjax-type':
                case 'importAjax-type':
                case 'uploadAjax-contentType':
                case 'importAjax-contentType':
                case 'uploadAjax-data':
                case 'importAjax-data':
				case 'getPanelDataAjax-suffix':
				case 'getPanelDataAjax-dataSrc':
				case 'getPanelDataAjax-type':
				case 'getPanelDataAjax-contentType':
				case 'getPanelDataAjax-data':

				case 'beforeAjax-suffix':
				case 'beforeAjax-dataSrc':
				case 'beforeAjax-type':
				case 'beforeAjax-contentType':
				case 'beforeAjax-data':
                    var fieldNameArr = attrKey.split('-');
                    var fieldName1 = fieldNameArr[0];
                    var fieldName2 = fieldNameArr[1];
                    if(typeof(formatData[fieldName1])!="object"){
                        formatData[fieldName1] = {};
                    }
                    switch(fieldName2){
                        case "data":
                            if(formatData[attrKey].length>0){
                                formatData[attrKey] = JSON.parse(formatData[attrKey]);
                            }
                            break;
                    }
                    formatData[fieldName1][fieldName2] = formatData[attrKey];
                    delete formatData[attrKey];
                    break;
            }
        }
        return formatData;
    }
	return {
		getFormatData:formatEditData,
	}
})(jQuery)