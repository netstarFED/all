/****
***表单表格模板包含tree,table
****
********/
/******************** 左侧目录树右侧表格模板 start ***********************/
nsTemplate.templates.treeTable = (function(){
	function templateInit(){
		nsTemplate.templates.treeTable.data = {};  
		/* 保存在该对象上的数据分为四个：
		 * config(运行时参数)，
		 * original（原始配置参数）
		 */
	}
	var config = {};
	var templateData = {};
	//验证调用
	function configValidate(config){
		var isValid = true;
		var validArr = 
		[
			['tree','object',true],						//tree的配置
			['table','object'],							//table表格的配置
			['form','object'],							//form表格的配置
			['isSourceTree','boolean'],					//是否来源于tree
		];
		isValid = nsDebuger.validOptions(validArr,config);
		if(isValid == false){return false;}
		isValid = nsTemplate.validConfigByTree(config.tree);//验证树的配置参数
		if(isValid == false){return false;}
		if(config.table){
			var isTree = typeof(config.isSourceTree)=='boolean' ? config.isSourceTree:false;
			var isMainTable = true;
			if(isTree){isMainTable = false;}
			var tableOption = {
				isMainTable:isMainTable
			}
			isValid = nsTemplate.validConfigByTable(config.table,tableOption);
			if(isValid == false){return false;}
		}
		if(config.form){
			isValid = nsTemplate.validConfigByForm(config.form);
			if(isValid == false){return false;}
		}
		return isValid;
	}
	var treeContainerPlaneJson = {
		btns:[]
	};						//tree 容器面板
	var formContainerPlaneJson = {
		btns:[]
	};						//form 容器面板
	var tableContainerPlaneJson = {
		btns:[]
	};						//table 容器面板
	var currentDataObject = {};
	var originalListData = []; 								//保存原始数据值
	var listKeyValueData = {}; 								//保存原始数据键值对
	var formDataObject = [];								//存放form数据	
	var tableBtnHandlerArr = [];							//存放table按钮数据		
	var tableRowBtnHandlerArr = [];							//存放table行按钮数据	
	var currentItemData = {};								//当前操作数据对象		
	var currentOperator = '';								//当前操作对象 form table or  form and table
	var tableRowsBtnArray = [];								//table行按钮
	var customComponentArray = [];							//自定义组件
	var treeInitJson = {};	
	var optionsConfig = {
		dialogBeforeHandler:dialogBeforeHandler,
		ajaxBeforeHandler:ajaxBeforeHandler,
		ajaxAfterHandler:ajaxAfterHandler,
		loadPageHandler:loadPageHandler,
		closePageHandler:closePageHandler
	};
	//弹框调用前置方法
	function dialogBeforeHandler($btn){
		var data = $btn;
		if($btn.rowData){
			//如果是行内按钮则直接返回行的数据
			data.value = $.extend(true,{},$btn.rowData);
		}else{
			//获取tree选中节点
			var treeObj = nsDataFormat.tree[config.fulltreeId];
			var nodes = treeObj.getSelectedNodes();
			if(nodes.length > 0){
				data.value = listKeyValueData[nodes[0][treeInitJson.idField]];
			}
		}
		if(!$.isEmptyObject(config.form)){
			// 存在form表单的定义
			var formJson = nsTemplate.getChargeDataByForm(config.fullFormId);
			data.value = formJson;
		}
		data.btnOptionsConfig = {
			descritute:{keyField:config.tree.keyField,idField:config.tree.idField}
		}
		return data;
	}
	//弹框ajax保存前置方法
	function ajaxBeforeHandler(handlerObj){
		handlerObj.config = config;
		handlerObj.ajaxConfigOptions = {
			idField:config.tree.idField,
			keyField:config.tree.dataSrc,
			pageParam:config.pageParam,
			parentObj:config.parentObj
		};
		return handlerObj;
	}
	//弹框ajax保存后置方法
	function ajaxAfterHandler(data){
		var newData = $.extend(true,{},data);
		delete newData.objectState;
		var treeObj = nsDataFormat.tree[config.fulltreeId];
		var nodes = treeObj.getSelectedNodes();
		var treeNodeData = treeObj.getNodeByParam(treeInitJson.idField,data[treeInitJson.idField]);
		treeNodeData = $.extend(true,treeNodeData,newData);
		switch(data.objectState){
			case NSSAVEDATAFLAG.ADD:
				//添加节点
				treeObj.addNodes(nodes[0],newData);
				break;
			case NSSAVEDATAFLAG.EDIT:
				//编辑节点
				treeObj.updateNode(treeNodeData);
				break;
			case NSSAVEDATAFLAG.DELETE:
				//删除节点
				treeObj.removeNode(treeNodeData);
				break;
			case NSSAVEDATAFLAG.NULL:
				//无操作
			 	break;
			 case NSSAVEDATAFLAG.VIEW:
			 	//刷新
			 	break;
		}
		if(config.isSourceTree){
			//表格数据来源于树
			if(config.form){
				var fieldArray = $.extend(true,[],config.form.field);
				for(var i=0; i<fieldArray.length; i++){
					if(newData[fieldArray[i].id]){
						fieldArray[i].value = newData[fieldArray[i].id];
					}
				}
				nsForm.edit(fieldArray,config.fullFormId);
			}
			if(!$.isEmptyObject(config.table)){
				baseDataTable.originalConfig[config.fullTableId].dataConfig.dataSource = newData[config.table.keyField];
				baseDataTable.refreshByID(config.fullTableId);
			}	
		}else{
			if(config.form){
				var fieldArray = $.extend(true,[],config.form.field);
				for(var i=0; i<fieldArray.length; i++){
					if(newData[fieldArray[i].id]){
						fieldArray[i].value = newData[fieldArray[i].id];
					}
				}
				nsForm.edit(fieldArray,config.fullFormId);
			}
			if(!$.isEmptyObject(config.table)){
				baseDataTable.reloadTableAJAX(config.fullTableId,newData);
			}
		}
	}
	//弹框初始化加载界面
	function loadPageHandler(data){
		return data;
	}
	//关闭弹框界面
	function closePageHandler($btn){
		/*
			*$btn 行内按钮和外部按钮
			    *外部按钮是个dom对象元素
			    *行内按钮是object对象（应用在table行按钮）
		*/
		var data = $btn;
		var isOuterBtn = false;//是否外部按钮
		var templateId = '';//模板id
		if($btn[0]){
			//外部按钮
			isOuterBtn = true;
		}
		if(isOuterBtn){
			var layoutId = $btn.closest('nsTemplate').children('layout').attr('id');
			config = nsTemplate.templates.treeTable.data[layoutId].config;
		}else{
			var layoutId = $btn.obj.closest('nsTemplate').children('layout').attr('id');
			config = nsTemplate.templates.treeTable.data[layoutId].config;
		}
		getAjaxTreeData();//AJAX读取数据
	}
	/***************tree 相关事件 start********************************/
	//tree 相关按钮的配置生成都绑在了container容器面板的按钮事件调用方法是nsNav.init
	//tree  container容器面板的按钮id是当前面板的id+'-btns'
	//树全部打开
	function treeExpandAllHandler(dom){
		var treeId = dom.closest('.nav-form').attr('id');//获取容器面板按钮容器id
		treeId = treeId.substring(0,treeId.lastIndexOf('-'));//获取面板id
		treeId = treeId + '-tree';//获取树id
		var treeObj = $.fn.zTree.getZTreeObj(treeId);
		treeOpenOrCloseHandler(treeId,true);
	}
	//树全部关闭
	function treeCollapseAllHandler(dom){
		var treeId = dom.closest('.nav-form').attr('id');//获取容器面板按钮容器id
		treeId = treeId.substring(0,treeId.lastIndexOf('-'));//获取面板id
		treeId = treeId + '-tree';//获取树id
		treeOpenOrCloseHandler(treeId,false);
	}
	//调用树展开关闭方法
	function treeOpenOrCloseHandler(treeId,expandFlag){
		var treeObj = nsDataFormat.tree[treeId];
		treeObj.expandAll(expandFlag);
	}

	//整体调用保存
	function getSaveDataAjax(inputData,dialogObj){
		var ajaxConfigOptions = {
			idField:config.tree.idField,
			keyField:config.tree.dataSrc,
			pageParam:config.pageParam,
			parentObj:config.parentObj
		}
		var saveDataAjax = nsVals.getAjaxConfig(config.saveData.ajax,inputData,ajaxConfigOptions);
		saveDataAjax.plusData = {
			dataSrc: config.saveData.ajax.dataSrc,	//saveData的dataSrc 用于取数据
			idField:treeInitJson.idField,
			isSourceTree:config.isSourceTree,
			tableId:config.fullTableId,
			keyField:config.table.keyField,
			dialogObj:dialogObj,
			formId:config.fullFormId
		};
		nsVals.ajax(saveDataAjax,function(res,ajaxObj){
			if(res.success){
				if(ajaxObj.plusData.dialogObj){
					ajaxObj.plusData.dialogObj.afterHandler();
				}else{
					nsdialog.hide();//关闭弹框
				}
				var plusData = ajaxObj.plusData;
				var treeObj = nsDataFormat.tree[config.fulltreeId];
				var nodes = treeObj.getSelectedNodes();
				var nodesArray = treeObj.getNodes();
				if(res[plusData.dataSrc]){
					currentDataObject = res[plusData.dataSrc];
					var data = $.extend(true,{},currentDataObject);
					delete data.objectState;
					listKeyValueData[data[plusData.idField]] = data;
					var treeNodeData = treeObj.getNodeByParam(plusData.idField,data[plusData.idField]);//根据id获取节点信息
					treeNodeData = $.extend(true,treeNodeData,data);//合并修改的信息值
					switch(currentDataObject.objectState){
						case NSSAVEDATAFLAG.ADD:
							//添加节点
							if(nodes.length > 0){
								treeObj.addNodes(nodes[0],data);
							}else{
								if(nodesArray.length === 1){
									treeObj.addNodes(nodesArray[0],data);
								}else{
									treeObj.addNodes(nodes[0],data);
								}
							}
							if(nodes.length == 0 && nodesArray.length == 0){
								$.fn.zTree.init($('#'+config.fulltreeId),treeObj.setting,treeObj.getNodes());
								nsDataFormat.tree[config.fulltreeId] = $.fn.zTree.getZTreeObj(config.fulltreeId);
							}
							break;
						case NSSAVEDATAFLAG.EDIT:
							//编辑节点
							treeObj.updateNode(treeNodeData);
							break;
						case NSSAVEDATAFLAG.DELETE:
							//删除节点
							treeObj.removeNode(treeNodeData);
							break;
						case NSSAVEDATAFLAG.NULL:
							//无操作
						 	break;
						 case NSSAVEDATAFLAG.VIEW:
						 	//刷新
						 	break;
					}
					if(plusData.isSourceTree){
						//表格数据来源于树
						if(!$.isEmptyObject(config.table)){
							baseDataTable.originalConfig[plusData.tableId].dataConfig.dataSource = data[plusData.keyField];
							baseDataTable.refreshByID(plusData.tableId);
						}
						if(config.form){
							nsForm.fillValues(currentDataObject,plusData.formId);
						}
					}else{
						if(!$.isEmptyObject(config.table)){
							baseDataTable.reloadTableAJAX(plusData.tableId,data);
						}
						if(config.form){
							nsForm.fillValues(currentDataObject,plusData.formId);
						}
					}
					var isCloseWindow = config.saveData.ajax.isCloseWindow; // lyw 关闭窗口 20180913
					if(isCloseWindow){
						nsFrame.popPageClose(); 
					}
				}else{
					console.log(plusData.dataSrc);
					console.log(res)
				}
			}
		},true);
	}

	//树节点请求的增删改调用ajax
	function customTreeSaveAjax(type,inputData,dialogObj){
		var treeNode = $.extend(true,{},inputData);
		switch(type){
			case 'add':
				treeNode.objectState = NSSAVEDATAFLAG.ADD;
				break;
			case 'edit':
				treeNode.objectState = NSSAVEDATAFLAG.EDIT;
				break;
			case 'delete':
				//删除节点
				treeNode.objectState = NSSAVEDATAFLAG.DELETE;
				break;
		}
		var treeObj = nsDataFormat.tree[config.fulltreeId];
		var nodes = treeObj.getSelectedNodes();
		if(config.isSourceTree){
			//表格数据来源于树
			if(nodes.length > 0){
				//存在选中节点
				var childIdField = treeInitJson.childIdField;
				treeNode[config.table.keyField] = [];
				if($.isArray(nodes[0][childIdField])){
					for(var nodeI=0; nodeI<nodes[0][childIdField].length; nodeI++){
						var currentData = nodes[0][childIdField][nodeI];
						var data = $.extend(true,{},listKeyValueData[currentData[treeInitJson.idField]]);
						treeNode[config.table.keyField].push(data);
					}
				}
			}
		}
		currentDataObject = treeNode;
		getSaveDataAjax(treeNode,dialogObj);
	}

	//树添加操作
	function customerSaveAddBtnHandler(){
		var addDialogId = 'add-'+config.fulltreeId+'-dialog';
		function treeAddDialogConfirmHandler(){
			var inputData = nsTemplate.getChargeDataByForm(addDialogId);//获取form数据
			if(inputData===false){return;}//验证不通过直接return
			/*var treeObj = nsDataFormat.tree[config.fulltreeId];
			var parentId = treeInitJson.parentId;
			var nodes = treeObj.getSelectedNodes();
			if(nodes.length > 0){
				parentId = nodes[0][treeInitJson.idField];//获取选中节点的parentId
			}
			inputData[treeInitJson.parentIdField] = parentId;*/
			customTreeSaveAjax('add',inputData,dialogObj);
			//nsdialog.hide();
		}
		var addTreeFieldArray = $.extend(true,[],config.tree.add.field);
		var treeObj = nsDataFormat.tree[config.fulltreeId];
		var parentId = treeInitJson.parentId;
		var nodes = treeObj.getSelectedNodes();
		var parentCatename = '';
		if(nodes.length > 0){
			parentId = nodes[0][treeInitJson.idField];//获取选中节点的parentId
			parentCatename = nodes[0][treeInitJson.textField];
		}else{
			if(listKeyValueData[parentId]){
				if(listKeyValueData[parentId][treeInitJson.parentIdField] === -1){
					parentCatename = listKeyValueData[parentId][treeInitJson.textField];
				}
			}
		}
		addTreeFieldArray.push({
			id:treeInitJson.parentIdField,
			type:'hidden',
			value:parentId
		});
		addTreeFieldArray.unshift({
			id:'parentname',
			type:'text',
			readonly:true,
			label:'上级名称',
			placeholder:parentCatename
		});

		var textArr = ['新增','保存并新增'];
		if(config.tree.add.dialogBtnText){
			textArr = config.tree.add.dialogBtnText.split('/');
		}
		var textAddStr = textArr[0];
		var textSaveStr = textArr[1] ? textArr[1] : '保存并新增';
		var size = config.tree.add.width ? config.tree.add.width : 's';
		var originalTreeAddConfig = {
			id: addDialogId,
			title: config.tree.add.title,
			size: size,
			form: addTreeFieldArray,
			btns: 
			[
				{
					text: textAddStr,
					handler: function(){
						var inputData = nsTemplate.getChargeDataByForm(addDialogId);//获取form数据
						if(inputData===false){return;}//验证不通过直接return
						customTreeSaveAjax('add',inputData);
					}
				},{
					text: textSaveStr,
					handler: function(){
						var inputData = nsTemplate.getChargeDataByForm(addDialogId);//获取form数据
						if(inputData===false){return;}//验证不通过直接return
						customTreeSaveAjax('add',inputData,{
							afterHandler:function(){
								var refreshConfig = $.extend(true,{},originalTreeAddConfig);
								nsdialog.refresh(refreshConfig,{});
							}
						});
					}
				}
			]
		}
		var treeAddDialogConfig = $.extend(true,{},originalTreeAddConfig);
		nsdialog.initShow(treeAddDialogConfig);//弹框调用
	}
	//树编辑操作
	function customerSaveEditBtnHandler(){
		var editFieldArray = $.extend(true,[],config.tree.edit.field);
		var editDialogId = 'edit-'+config.fullTableId+'-dialog';
		editFieldArray.unshift({
			id:treeInitJson.idField,
			type:'hidden'
		});
		var treeObj = nsDataFormat.tree[config.fulltreeId];
		var nodes = treeObj.getSelectedNodes();	
		if(nodes.length > 0){
			var rowData = $.extend(true,{},listKeyValueData[nodes[0][treeInitJson.idField]]);
			for(var editI=0; editI<editFieldArray.length; editI++){
				editFieldArray[editI].value = rowData[editFieldArray[editI].id];
				/****忘记有什么用 lyw删 sjj写****/
				/*switch(editFieldArray[editI].type){
					case 'checkbox':
					case 'radio':
						delete editFieldArray[editI].value;
						if($.isArray(editFieldArray[editI].subdata)){
							for(var subI=0; subI<editFieldArray[editI].subdata.length; subI++){
								var valueStr = editFieldArray[editI].subdata[subI].value;
								if(editFieldArray[editI].valueField){
									valueStr = editFieldArray[editI].subdata[subI][editFieldArray[editI].valueField];
								}
								if(typeof(rowData[editFieldArray[editI].id])=='number'){
									valueStr = Number(valueStr);
								}
								if(valueStr === rowData[editFieldArray[editI].id]){
									editFieldArray[editI].subdata[subI].isChecked = true;
								}
							}
						}
						break;
					case 'select':
					case 'select2':
						delete editFieldArray[editI].value;
						if($.isArray(editFieldArray[editI].subdata)){
							for(var subI=0; subI<editFieldArray[editI].subdata.length; subI++){
								var valueStr = editFieldArray[editI].subdata[subI].value;
								if(editFieldArray[editI].valueField){
									valueStr = editFieldArray[editI].subdata[subI][editFieldArray[editI].valueField];
								}
								if(typeof(rowData[editFieldArray[editI].id])=='number'){
									valueStr = Number(valueStr);
								}
								if(valueStr === rowData[editFieldArray[editI].id]){
									editFieldArray[editI].subdata[subI].selected = true;
								}
							}
						}
						break;
					default:
						editFieldArray[editI].value = rowData[editFieldArray[editI].id];
						break;
				}*/
			}

			function treeRowEditDialogConfirmHandler(){
				var inputData = nsTemplate.getChargeDataByForm(editDialogId);//获取form数据
				if(inputData===false){return;}//验证不通过直接return
				var treeNode = $.extend(true,rowData,inputData);
				customTreeSaveAjax('edit',treeNode);
				//nsdialog.hide();//关闭弹框
			}
			var size = config.tree.edit.width ? config.tree.edit.width : 's';
			var dialogBtnText = config.tree.edit.dialogBtnText ? config.tree.edit.dialogBtnText : language.template.defaultText.edit;
			var editDialog = {
				id: editDialogId,
				title: config.tree.edit.title,
				size: size,
				form: editFieldArray,
				btns: 
				[
					{
						text: dialogBtnText,
						handler: function(){
							treeRowEditDialogConfirmHandler();
						}
					}
				]
			}
			nsdialog.initShow(editDialog);//弹框调用
		}else{
			nsalert(language.ui.nsTree.dialog.emptyObject);
		}
	}
	//树节点删除操作
	function customerSaveDelBtnHandler(){
		var delText = config.tree.delete.title; // lyw 原来读的是text
		var contentStr = delText;
		var treeObj = nsDataFormat.tree[config.fulltreeId];
		var nodes = treeObj.getSelectedNodes();	
		if(nodes.length > 0){
			var treeNode = listKeyValueData[nodes[0][treeInitJson.idField]];
			var deleteRowData = $.extend(true,{},treeNode);
			function delConfirmHandler(result){
				//删除事件触发
				if(result){
					//如果为真则是确认事件
					customTreeSaveAjax('delete',deleteRowData);
				}
			}
			contentStr = nsVals.getTextByFieldFlag(contentStr,treeNode);
			nsConfirm(contentStr,delConfirmHandler,'warning');//弹出删除提示框
		}else{
			nsalert(language.ui.nsTree.dialog.deleteEmptyText);
		}
	}
	//树单击选中触发事件
	function treeSelectedHandler(obj){
		//是否要把子元素添加到表格行中
		var treeNode = $.extend(true,{},obj.treeNode);
		var treeObj = nsDataFormat.tree[obj.treeId];
		var nodeData = $.extend(true,{},listKeyValueData[treeNode[treeInitJson.idField]]);
		switch(currentOperator){
			case 'form':
				nsForm.clearData(config.fullFormId);
				nsForm.fillValues(nodeData,config.fullFormId);
				break;
			case 'table':
				if(config.isSourceTree){
					nsTable.table[config.fullTableId].rows().remove().draw(false);
					if(treeNode.isParent){
						//是父元素就存在子元素
						var childArr = [];
						var childData = treeNode[treeInitJson.childIdField];
						for(var childI=0; childI<childData.length; childI++){
							var data = $.extend(true,{},listKeyValueData[childData[childI][treeInitJson.idField]]);
							childArr.push(data);
						}
						baseDataTable.originalConfig[config.fullTableId].dataConfig.dataSource = childArr;
						baseDataTable.refreshByID(config.fullTableId);
					}
				}else{
					//无关联 点击节点，传送节点参数，刷新表格
					nsTable.reloadTableAJAX(config.fullTableId,nodeData);
				}
				break;
			case 'both':
				nsForm.fillValues(nodeData,config.fullFormId);
				if(config.isSourceTree){
					nsTable.table[config.fullTableId].rows().remove().draw(false);
					if(treeNode.isParent){
						//是父元素就存在子元素
						var childArr = [];
						var childData = treeNode[treeInitJson.childIdField];
						for(var childI=0; childI<childData.length; childI++){
							var data = $.extend(true,{},listKeyValueData[childData[childI][treeInitJson.idField]]);
							childArr.push(data);
						}
						baseDataTable.originalConfig[config.fullTableId].dataConfig.dataSource = childArr;
						baseDataTable.refreshByID(config.fullTableId);
					}
				}else{
					//无关联 点击节点，传送节点参数，刷新表格
					nsTable.reloadTableAJAX(config.fullTableId,nodeData);
				}
				break;
		}
	}
	/***************tree 相关事件 end********************************/

	/***************form 相关操作方法 start**************************/
	//添加
	function customFormAddHandler(){
		customerSaveAddBtnHandler();
	}
	//编辑
	function customFormEditHandler(){
		customerSaveEditBtnHandler();
	}
	//删除
	function customFormDelHandler(){
		customerSaveDelBtnHandler();
	}
	//确认
	function customFormConfirmHandler(){
		var formId = config.fullFormId+'-customerform';
		var inputData = nsTemplate.getChargeDataByForm(formId);
		if(inputData===false){return;}//验证不通过直接return
		var treeObj = nsDataFormat.tree[config.fulltreeId];
		var nodes = treeObj.getSelectedNodes();	
		var rowData = $.extend(true,{},listKeyValueData[nodes[0][treeInitJson.idField]]);
		var treeNode = $.extend(true,rowData,inputData);
		customTreeSaveAjax('edit',treeNode);
	}
	/***************form 相关操作方法 end****************************/
	/****************table 新增修改删除 start***********************/
	function tableRowBtnHandler(data){
		data.config = config;
		var runHandler = tableRowBtnHandlerArr[data.buttonIndex];
		runHandler.handler(data);
	}
	//添加
	function customTableAddHandler(){
		var addDialogId = 'add-'+config.fullTableId+'-dialog';
		function tableAddDialogConfirmHandler(){
			var inputData = nsTemplate.getChargeDataByForm(addDialogId);//获取form数据
			if(inputData===false){return;}//验证不通过直接return
			var addData = $.extend(true,{},inputData);//行数据和修改的合并，已修改后的为准
			var treeObj = nsDataFormat.tree[config.fulltreeId];
			var parentId = treeInitJson.parentId;//默认父id
			var nodes = treeObj.getSelectedNodes();//获取选中节点
			var treeNodeObj = {};
			if(nodes.length > 0){
				parentId = nodes[0][treeInitJson.idField];//获取选中节点的parentId
				treeNodeObj = $.extend(true,{},listKeyValueData[parentId]);//父节点数据
			}
			inputData[treeInitJson.parentIdField] = parentId;
			inputData.objectState = NSSAVEDATAFLAG.ADD;
			//刷新表格
			var originalDataSource = baseDataTable.originalConfig[config.fullTableId].dataConfig.dataSource;
			var childArray = $.extend(true,[],originalDataSource);
			//传值ajax
			treeNodeObj[config.table.keyField] = childArray;
			treeNodeObj[config.table.keyField].unshift(inputData);
			if(config.isSourceTree){
				treeNodeObj.objectState = NSSAVEDATAFLAG.NULL;
				currentDataObject = treeNodeObj;
			}else{
				currentDataObject = inputData;
			}
			if(!$.isArray(originalDataSource)){
				originalDataSource = [];
			}
			originalDataSource.unshift(addData);
			baseDataTable.refreshByID(config.fullTableId);
			getSaveDataAjax(currentDataObject);
			//nsdialog.hide();//弹框关闭
		}
		var size = config.table.add.width;
		var dialogBtnText = config.table.add.dialogBtnText;
		var addDialog = {
			id: addDialogId,
			title: config.table.add.title,
			size: size,
			form: config.table.add.field,
			btns: 
			[
				{
					text: dialogBtnText,
					handler: function(){
						tableAddDialogConfirmHandler();
					}
				}
			]
		}
		nsdialog.initShow(addDialog);//弹框调用
	}
	//编辑
	function customerTableEditBtnHandler(data){
		var editFieldArray = $.extend(true,[],config.table.edit.field);
		var rowData = data.rowData;
		var editDialogId = 'edit-'+data.tableId+'-dialog';
		editFieldArray.unshift({
			id:treeInitJson.idField,
			type:'hidden'
		});
		for(var editI=0; editI<editFieldArray.length; editI++){
			switch(editFieldArray[editI].type){
				case 'checkbox':
				case 'radio':
					delete editFieldArray[editI].value;
					if($.isArray(editFieldArray[editI].subdata)){
						for(var subI=0; subI<editFieldArray[editI].subdata.length; subI++){
							var valueStr = editFieldArray[editI].subdata[subI].value;
							if(editFieldArray[editI].valueField){
								valueStr = editFieldArray[editI].subdata[subI][editFieldArray[editI].valueField];
							}
							if(typeof(rowData[editFieldArray[editI].id])=='number'){
								valueStr = Number(valueStr);
							}
							if(valueStr === rowData[editFieldArray[editI].id]){
								editFieldArray[editI].subdata[subI].isChecked = true;
							}
						}
					}
					break;
				case 'select':
				case 'select2':
					delete editFieldArray[editI].value;
					if($.isArray(editFieldArray[editI].subdata)){
						for(var subI=0; subI<editFieldArray[editI].subdata.length; subI++){
							var valueStr = editFieldArray[editI].subdata[subI].value;
							if(editFieldArray[editI].valueField){
								valueStr = editFieldArray[editI].subdata[subI][editFieldArray[editI].valueField];
							}
							if(typeof(rowData[editFieldArray[editI].id])=='number'){
								valueStr = Number(valueStr);
							}
							if(valueStr === rowData[editFieldArray[editI].id]){
								editFieldArray[editI].subdata[subI].selected = true;
							}
						}
					}
					break;
				default:
					editFieldArray[editI].value = rowData[editFieldArray[editI].id];
					break;
			}
		}
		function tableRowEditDialogConfirmHandler(data){
			var inputData = nsTemplate.getChargeDataByForm(editDialogId);//获取form数据
			if(inputData===false){return;}//验证不通过直接return
			var $tr = data.obj.parents('tr');
			var rowData = $.extend(true,{},data.rowData);
			rowData = $.extend(true,rowData,inputData);
			rowData.objectState = NSSAVEDATAFLAG.EDIT;//当前操作标识是修改
			if(config.isSourceTree){
				//来源于树
				var treeObj = nsDataFormat.tree[config.fulltreeId];
				var parentId = treeInitJson.parentId;//默认父id
				var nodes = treeObj.getSelectedNodes();//获取选中节点
				var treeNodeObj = {};
				if(nodes.length > 0){
					parentId = nodes[0][treeInitJson.idField];//获取选中节点的parentId
					treeNodeObj = $.extend(true,{},listKeyValueData[parentId]);//父节点数据
					treeNodeObj.objectState = NSSAVEDATAFLAG.NULL;
					treeNodeObj[config.table.keyField] = [];
					for(var nodeI=0; nodeI<nodes[0][treeInitJson.childIdField].length; nodeI++){
						var currentData = nodes[0][treeInitJson.childIdField][nodeI];
						var data = $.extend(true,{},listKeyValueData[currentData[treeInitJson.idField]]);
						if(data[treeInitJson.idField] == rowData[treeInitJson.idField]){
							data = rowData;
						}
						treeNodeObj[config.table.keyField].push(data);
					}
					currentDataObject = treeNodeObj;
				}
			}else{
				currentDataObject = rowData;
			}
			nsList.rowEdit(config.fullTableId,inputData,{isUseNotInputData:true, queryMode:'tr', queryValue:$tr});
			getSaveDataAjax(currentDataObject);
			//nsdialog.hide();//关闭弹框
		}
		var size = config.table.edit.width;
		var dialogBtnText = config.table.edit.dialogBtnText;
		var editDialog = {
			id: editDialogId,
			title: config.table.edit.title,
			size: size,
			form: editFieldArray,
			btns: 
			[
				{
					text: dialogBtnText,
					handler: function(){
						tableRowEditDialogConfirmHandler(data);
					}
				}
			]
		}
		nsdialog.initShow(editDialog);//弹框调用	
	}
	//删除
	function customerTableDelBtnHandler(data){
		var delText = config.table.delete.text;
		var contentStr = delText;
		contentStr = nsVals.getTextByFieldFlag(contentStr,data.rowData);
		nsConfirm(contentStr,function(res){
			delTableConfirmHandler(res,data);
		},'warning');
		function delTableConfirmHandler(result,data){
			//删除事件触发
			if(result){
				//如果为真则是确认事件
				var $tr = data.obj.parents('tr');
				var rowData = $.extend(true,{},data.rowData);
				var delData = $.extend(true,{},rowData);
				delData.objectState = NSSAVEDATAFLAG.DELETE;
				if(config.isSourceTree){
					//来源于树
					var treeObj = nsDataFormat.tree[config.fulltreeId];
					var parentId = treeInitJson.parentId;//默认父id
					var nodes = treeObj.getSelectedNodes();//获取选中节点
					var treeNodeObj = {};
					if(nodes.length > 0){
						parentId = nodes[0][treeInitJson.idField];//获取选中节点的parentId
						treeNodeObj = $.extend(true,{},listKeyValueData[parentId]);//父节点数据
						treeNodeObj.objectState = NSSAVEDATAFLAG.NULL;
						treeNodeObj[config.table.keyField] = [];
						for(var nodeI=0; nodeI<nodes[0][treeInitJson.childIdField].length; nodeI++){
							var currentData = nodes[0][treeInitJson.childIdField][nodeI];
							var data = $.extend(true,{},listKeyValueData[currentData[treeInitJson.idField]]);
							if(data[treeInitJson.idField] == rowData[treeInitJson.idField]){
								data.objectState = NSSAVEDATAFLAG.DELETE;
							}
							treeNodeObj[config.table.keyField].push(data);
						}
						currentDataObject = treeNodeObj;
					}
				}else{
					currentDataObject = delData;
				}
				nsList.rowDelete(config.fullTableId,rowData,{isUseNotInputData:true, queryMode:'tr', queryValue:$tr});
				getSaveDataAjax(currentDataObject);
			}
		}
	}
	//排序上移
	function customerSaveUpSortBtnHandler(data){
		var tableData = baseDataTable.getAllTableData(data.tableId);
		var cRow = data.obj.closest('tr');
		var currentRowIndex = cRow.index();//当前行号
		var endRowIndex = currentRowIndex - 1;//目标行号
		if(currentRowIndex === 0){
			nsalert('已经是顶部了');
			return false;
		}
		var prevRow = cRow.prev();
		cRow.children('th').html(endRowIndex+1);
		prevRow.children('th').html(currentRowIndex+1);
		cRow.insertBefore(prevRow); 
		var rowData = $.extend(true,{},data.rowData);
		rowData.isUp = 1;
		rowData.objectState = NSSAVEDATAFLAG.EDIT;
		if(config.isSourceTree){
			var treeObj = nsDataFormat.tree[config.fulltreeId];
			var parentId = treeInitJson.parentId;//默认父id
			var nodes = treeObj.getSelectedNodes();//获取选中节点
			var treeNodeObj = {};
			if(nodes.length > 0){
				treeNodeObj[config.table.keyField] = [];
				parentId = nodes[0][treeInitJson.idField];//获取选中节点的parentId
				treeNodeObj = $.extend(true,{},listKeyValueData[parentId]);//父节点数据
				treeNodeObj.objectState = NSSAVEDATAFLAG.NULL;
				for(var nodeI=0; nodeI<nodes[0][treeInitJson.childIdField].length; nodeI++){
					var currentData = nodes[0][treeInitJson.childIdField][nodeI];
					var data = $.extend(true,{},listKeyValueData[currentData[treeInitJson.idField]]);
					if(data[treeInitJson.idField] == rowData[treeInitJson.idField]){
						data = rowData;
					}
					treeNodeObj[config.table.keyField].push(data);
				}
				currentDataObject = treeNodeObj;
			}
		}else{
			currentDataObject = rowData;
		}
		getSaveDataAjax(currentDataObject);
	}
	//排序下移
	function customerSaveDownSortBtnHandler(data){
		var tableData = baseDataTable.getAllTableData(data.tableId);
		var cRow = data.obj.closest('tr');
		var currentRowIndex = cRow.index();//当前行号
		var endRowIndex = currentRowIndex + 1;//目标行号
		if(currentRowIndex === tableData.length-1){
			nsalert('已经是底部了');
			return false;
		}	
		var nextRow = cRow.next();  
		cRow.children('th').html(endRowIndex+1);
		nextRow.children('th').html(currentRowIndex+1);
		if(nextRow){cRow.insertAfter(nextRow);}
		var rowData = $.extend(true,{},data.rowData);
		rowData.isUp = 0;
		rowData.objectState = NSSAVEDATAFLAG.EDIT;
		if(config.isSourceTree){
			var treeObj = nsDataFormat.tree[config.fulltreeId];
			var parentId = treeInitJson.parentId;//默认父id
			var nodes = treeObj.getSelectedNodes();//获取选中节点
			var treeNodeObj = {};
			if(nodes.length > 0){
				treeNodeObj[config.table.keyField] = [];
				parentId = nodes[0][treeInitJson.idField];//获取选中节点的parentId
				treeNodeObj = $.extend(true,{},listKeyValueData[parentId]);//父节点数据
				treeNodeObj.objectState = NSSAVEDATAFLAG.NULL;
				for(var nodeI=0; nodeI<nodes[0][treeInitJson.childIdField].length; nodeI++){
					var currentData = nodes[0][treeInitJson.childIdField][nodeI];
					var data = $.extend(true,{},listKeyValueData[currentData[treeInitJson.idField]]);
					if(data[treeInitJson.idField] == rowData[treeInitJson.idField]){
						data.objectState = NSSAVEDATAFLAG.DELETE;
					}
					treeNodeObj[config.table.keyField].push(data);
				}
				currentDataObject = treeNodeObj;
			}
		}else{
			currentDataObject = rowData;
		}
		getSaveDataAjax(currentDataObject);
	}
	//确认
	function customerTableSaveBtnHandler(){}
	/****************table 新增修改删除 end***********************/
	//form中自定义组件
	function customComponetFormHandler(){}
	//table中自定义组件
	function customComponetTableHandler(){}
	//自定义组件调用
	function serviceComponentInit(){
		for(var customI=0; customI<customComponentArray.length; customI++){
			switch(customComponentArray[customI].pageConfig.operator){
				case 'add':
					if(customComponentArray[customI].pageConfig.source == 'form'){
						customComponentArray[customI].otherConfig.init(customComponentArray[customI].otherConfig,customComponetFormHandler);
					}else{
						customComponentArray[customI].otherConfig.init(customComponentArray[customI].otherConfig,customComponetTableHandler);
					}
					break;
			}
		}
	}
	/*******form table  start参数配置*******************/
	var formOperatorData = {
		add:{
			text:'添加',
			handler:customFormAddHandler
		},
		edit:{
			text:'编辑',
			handler:customFormEditHandler
		},
		delete:{
			text:'删除',
			handler:customFormDelHandler
		},
		confirm:{
			text:'保存',
			handler:customFormConfirmHandler
		}
	};
	var tableOperatorData = {
		add:{
			text:'添加',
			handler:customTableAddHandler,
		},
		edit:{
			text:'编辑',
			handler:customerTableEditBtnHandler
		},
		delete:{
			text:'删除',
			handler:customerTableDelBtnHandler
		},
		sort:{
			up:{
				text:'上移',
				handler:customerSaveUpSortBtnHandler
			},
			down:{
				text:'下移',
				handler:customerSaveDownSortBtnHandler
			}
		},
		confirm:{
			text:'保存',
			handler:customerTableSaveBtnHandler
		}
	}
	/*******form table  end参数配置*******************/
	//设置默认值
	function setDefault(){
		//layout的默认配置参数
		config = nsTemplate.setDefaultByTemplate(config);//默认值设置
		var layoutConfig = {
			navId:									'nav',
			tableId:								'table',
			formId:									'form',
			treeId:									'tree',
			fullFormId:								config.id+'-form',
			fulltreeId:								config.id+'-tree-tree',
			fullTableId:							'table-'+config.id+'-table',
			fullTitleId:							config.id+'-templateTitle',
			navJson:								'navJson',
			tableJson:								'tableJson',
			formJson:								'formJson',
			treeJson:								'treeJson',
			tableContainerJson:						'tableContainerJson',
			formContainerJson:						'formContainerJson',
			treeContainerJson:						'treeContainerJson',
			form:									{},
			table:									{},
			windowHeight:							$(window).outerHeight() - 52,
			isSourceTree:							false,
		}
		nsVals.setDefaultValues(config,layoutConfig);
		var treeConfig = {
			column:4,
			type:'GET',
			openState:{},
			childIdField:'children',
			parentIdField:'parentId',
			title:'',
			btns:[]
		}
		nsVals.setDefaultValues(config.tree,treeConfig);
		treeContainerPlaneJson.btns = [];
		//树默认有全部打开，全部关闭按钮
		treeContainerPlaneJson.btns.push({
			text:'打开',
			isReturn:true,
			handler:treeExpandAllHandler
		},{
			text:'关闭',
			isReturn:true,
			handler:treeCollapseAllHandler
		});
		//树添加
		if(config.tree.add){
			switch(config.tree.add.type){
				case 'dialog':
					var treeAddText = typeof(config.tree.add.text)=='string'?config.tree.add.text:'添加'; // lyw 配置文本
					treeContainerPlaneJson.btns.push({
						// text:'添加',
						text:treeAddText,
						isReturn:true,
						handler:customerSaveAddBtnHandler
					})
					break;
			}
		}
		//树编辑
		if(config.tree.edit){
			switch(config.tree.edit.type){
				case 'dialog':
					var treeEditText = typeof(config.tree.edit.text)=='string'?config.tree.edit.text:'编辑'; // lyw 配置文本
					treeContainerPlaneJson.btns.push({
						// text:'编辑',
						text:treeEditText,
						isReturn:true,
						handler:customerSaveEditBtnHandler
					})
					break;
			}
		}
		//树删除
		if(config.tree.delete){
			switch(config.tree.delete.type){
				case 'dialog':
				case 'confirm':
					var treeDeleteText = typeof(config.tree.delete.text)=='string'?config.tree.delete.text:'删除'; // lyw 配置文本
					treeContainerPlaneJson.btns.push({
						// text:'删除',
						text:treeDeleteText,
						isReturn:true,
						handler:customerSaveDelBtnHandler
					})
					break;
			}
		}
		var treeSetBtnConfig = $.extend(true,{},optionsConfig);
		treeSetBtnConfig.source = 'form';
		var btnArray = nsTemplate.setBtnDataChargeHandler(config.tree.btns,treeSetBtnConfig);
		btnArray = nsTemplate.getBtnArrayByBtns(btnArray);//得到按钮值 
		treeContainerPlaneJson.btns = $.merge(treeContainerPlaneJson.btns,btnArray);
	}
	//form按钮展示类型
	function getFormBtnConfigByType(btnType,data){
		//此操作针对表格行的按钮展示
		//判断当前的类型multi component dialog custom common confirm
		switch(data.type){
			case 'dialog':
				//弹框
				formContainerPlaneJson.btns.push({
					text:formOperatorData[btnType].text,
					isReturn:true,
					handler:formOperatorData[btnType].handler
				});
				break;
			case 'component':
				//不存在按钮自定义组件调用的是自定义组件
				customComponentArray.push({
					pageConfig:{
						containerId:			'container-panel-'+config.id+'-form',
						source:					'form',
						type:					data.serviceComponent.type,
						operator:				'add',//默认操作是添加
					},
					otherConfig:{
						containerId:			'container-panel-'+config.id+'-form',//要填充的容器面板id
						cId:					'control-btn-servicecomponent-'+'-treeform',//生成的元素id
						init:					data.serviceComponent.init,
						data:					data.serviceComponent.data,
					}
				})
				break;
			case 'multi':
				//多个form字段配置 container form
				formContainerPlaneJson.forms = data.field;
				ormContainerPlaneJson.formType = 'multi';
				formContainerPlaneJson.btns.push({
					text:formOperatorData['confirm'].text,
					isReturn:true,
					handler:formOperatorData['confirm'].handler
				});
				break;
			case 'confirm':
				formContainerPlaneJson.btns.push({
					text:formOperatorData[btnType].text,
					isReturn:true,
					handler:formOperatorData[btnType].handler
				})
				break;
			case 'custom':
			case 'common':
				break;
			default:
				break;
		}
	}
	//table按钮展示类型
	function getTableBtnConfigByType(btnType,data){
		switch(data.type){
			case 'dialog':
				//弹框
				if(btnType === 'add'){
					tableContainerPlaneJson.btns.push({
						text:tableOperatorData[btnType].text,
						isReturn:true,
						handler:tableOperatorData[btnType].handler
					});
				}else{
					tableRowsBtnArray.push({
						text:tableOperatorData[btnType].text,
						isReturn:true,
						handler:tableOperatorData[btnType].handler
					})
				}
				break;
			case 'component':
				//不存在按钮自定义组件调用的是自定义组件
				customComponentArray.push({
					pageConfig:{
						containerId:			'container-panel-'+config.id+'-table',
						source:					'form',
						type:					data.serviceComponent.type,
						operator:				'add',//默认操作是添加
					},
					otherConfig:{
						containerId:			'container-panel-'+config.id+'-table',//要填充的容器面板id
						cId:					'control-btn-servicecomponent-'+'-treetable',//生成的元素id
						init:					data.serviceComponent.init,
						data:					data.serviceComponent.data,
					}
				})
				break;
			case 'multi':
				//多个form字段配置 container form
				tableContainerPlaneJson.forms = data.field;
				tableContainerPlaneJson.formType = 'multi';
				tableContainerPlaneJson.btns.push({
					text:tableOperatorData['confirm'].text,
					isReturn:true,
					handler:tableOperatorData['confirm'].handler
				});
				break;
			case 'confirm':
				tableRowsBtnArray.push({
					text:tableOperatorData[btnType].text,
					isReturn:true,
					handler:tableOperatorData[btnType].handler
				})
				break;
			case 'custom':
			case 'common':
				break;
			default:
				break;
		}
	}
	//form相关配置定义
	function setFormConfig(){
		formContainerPlaneJson.btns = [];
		config.form = nsTemplate.setDefaultByForm(config.form,optionsConfig);
		config.form.column = typeof(config.form.column)=='number' ? config.form.column : 8;//默认8
		var btnArray = nsTemplate.getBtnArrayByBtns(config.form.btns);//得到按钮值 
		formContainerPlaneJson.btns = $.merge(formContainerPlaneJson.btns,btnArray);
		//添加修改删除按钮的输出
		if(config.form.add){
			getFormBtnConfigByType('add',config.form.add);
		}
		if(config.form.edit){
			getFormBtnConfigByType('edit',config.form.edit);
		}
		if(config.form.delete){
			getFormBtnConfigByType('delete',config.form.delete);
		}
	}
	//table相关配置定义
	function setTableConfig(){
		config.table = nsTemplate.setDefalutByTable(config.table,optionsConfig);
		config.table.column = typeof(config.table.column)=='number' ? config.table.column : 8;//默认8
		tableRowsBtnArray = $.extend(true,[],config.table.tableRowBtns);//克隆 
		tableRowsBtnArray = nsTemplate.getBtnArrayByBtns(tableRowsBtnArray);//得到按钮值 

		//nsTemplate.getBtnArrayByBtns(config.tree.btns);//得到按钮值 
		tableContainerPlaneJson.btns = [];
		var tableBtnsArray = $.extend(true,[],config.table.btns);//克隆 
		tableBtnsArray = nsTemplate.getBtnArrayByBtns(tableBtnsArray);//得到按钮值
		tableContainerPlaneJson.btns = $.extend(true,tableContainerPlaneJson.btns,tableBtnsArray);

		if(config.table.add){
			getTableBtnConfigByType('add',config.table.add);
		}
		if(config.table.edit){
			getTableBtnConfigByType('edit',config.table.edit);
		}
		if(config.table.delete){
			getTableBtnConfigByType('delete',config.table.delete);
		}
		if(config.table.isUseSort){
			tableRowsBtnArray.push({
				text:tableOperatorData.sort.up.text,
				isReturn:true,
				handler:tableOperatorData.sort.up.handler
			},{
				text:tableOperatorData.sort.down.text,
				isReturn:true,
				handler:tableOperatorData.sort.down.handler
			})
		}
	}
	function getLayoutHtml(){
		var titleHtml = '';
		if(config.isShowTitle){
			//标题设置为显示
			titleHtml = '<panel ns-id="templateTitle"></panel>'; 
		}
		var tablehtml = '';
		var formHtml = '';
		var windowHeight = config.windowHeight;
		if(!$.isEmptyObject(config.table) && !$.isEmptyObject(config.form)){
			//都存在
			windowHeight = windowHeight / 2;
		}
		if(!$.isEmptyObject(config.table)){
			tablehtml = '<panel ns-id="'+config.tableId+'" ns-container="'+config.tableContainerJson+'" ns-options="col:'+config.table.column+',height:'+windowHeight+'px" ns-config="table:'+config.tableJson+'"></panel>';
		}
		if(!$.isEmptyObject(config.form)){
			formHtml = '<panel ns-id="'+config.formId+'" ns-container="'+config.formContainerJson+'" ns-options="col:'+config.form.column+'" ns-config="form:'+config.formJson+'"></panel>';
		}
		var treeHeight = windowHeight;
		var html = '<layout id="'+config.id+'" ns-package="'+config.package+'" ns-options="templates:treeTable,isShowHistoryBtn:'+config.isShowHistoryBtn+'">'
						+titleHtml
						+'<panel ns-id="'+config.treeId+'" ns-container="'+config.treeContainerJson+'" ns-options="col:'+config.tree.column+',height:'+treeHeight+'px" ns-config="ztree:'+config.treeJson+'"></panel>'
						+formHtml
						+tablehtml
						+'</layout>';
		return html;
	}
	//获取tree数据
	function getAjaxTreeData(){
		var listAjax = {
			url:config.tree.src,
			type: config.tree.type,
			data: $.extend(true,{},config.tree.data),
			dataFormat:config.tree.dataFormat,
			dataLevel:config.tree.dataLevel
		}
		var pageParamObject = $.extend(true,{},config.pageParam);//界面跳转拿到的值
		var defaultAjax = $.extend(true,{},listAjax);//读取默认的配置
		defaultAjax.plusData = config.tree;
		var listAjax = nsVals.getAjaxConfig(defaultAjax,{},{idField:config.tree.idField,keyField:config.tree.dataSrc,pageParam:pageParamObject});
		nsVals.ajax(listAjax, function(res,plusData){
			var treeConfig = plusData.plusData;
			var data = res[treeConfig.dataSrc];//获取拿到的原始数据值
			if(res.success == false){
				console.log(config);
				data = [];
			}
			for(var dataI=0; dataI<data.length; dataI++){
				listKeyValueData[data[dataI][treeInitJson.idField]] = data[dataI];
			}
			originalListData = data;//克隆保存原始值
			var filterData = $.extend(true,[],data);
			treeInitJson.clickCallback = treeSelectedHandler;
			treeInitJson.parentId = -1;
			if(data.length === 0){
				treeInitJson.dataSource = [];
				//treeInitJson.parentId = -1;
			}else{
				treeInitJson.dataSource = nsDataFormat.getTreeDataByRows(filterData,treeInitJson);
				//treeInitJson.parentId = data[0][treeInitJson.parentIdField];
			}
			getLayoutCreateJson();
		},true)
	}
	//json数据格式化
	function getLayoutCreateJson(){
		var obj = eval(config.package + '={}');
		if(!$.isEmptyObject(config.form)){
			obj[config.formJson] = {
				isUserControl:false,
				isUserContidion:false,
				form:config.form.field
			};
			obj[config.formContainerJson] = formContainerPlaneJson;
		}
		obj[config.treeContainerJson] = treeContainerPlaneJson;
		obj[config.treeJson] = treeInitJson;
		//table数据
		if(!$.isEmptyObject(config.table)){
			//赋值
			obj[config.tableContainerJson] = tableContainerPlaneJson;
			var tableTabData = nsList.getTableColumnAndTabsName(config.table.field);
			var tableFieldArray = tableTabData.columnArray;
			var tablePanelHeight = config.windowHeight-NSPAGEPARTHEIGHT.nav-30;
			//表格高度  不包含标题栏(和搜索栏在同一行) 和表格底部操作栏
			var tableHeight = tablePanelHeight-NSPAGEPARTHEIGHT.title-NSPAGEPARTHEIGHT.footer;
			var tableRowHeight = NSPAGEPARTHEIGHT.wide;
			if(typeof(nsUIConfig)=='object'){
		      if(nsUIConfig.tableHeightMode == 'compact'){
		        tableRowHeight = NSPAGEPARTHEIGHT.compact;
		      }
		    }
			var pageLengthMenu = Math.floor(tableHeight / tableRowHeight)-1;
			var tableConfig = {
				columns:tableFieldArray,
				ui:{
					pageLengthMenu:pageLengthMenu, 			//可选页面数  auto是自动计算  all是全部
					isUseTabs:true,
				}
			}
			if(config.isSourceTree == true){
				nsTemplate.setTableConfig(tableConfig);
				tableConfig.data.primaryID = config.table.idField;
			}else{
				tableConfig.data = {
					src:			config.table.ajax.src,
					type: 			config.table.ajax.type, //GET POST
					dataSrc:		config.table.ajax.dataSrc,
					primaryID:		config.table.idField,
					data:			{}, //参数对象{id:1,page:100}
					isServerMode:	config.table.ajax.isServerMode, //是否开启服务器模式
					isSearch:		true, //是否开启搜索功能
					isPage:			true, //是否开启分页
				}
				nsTemplate.setTableConfig(tableConfig,{isUseDefault:false});
			}
			obj[config.tableJson] = tableConfig;
			//table单元格里自定义列按钮
			if(tableRowsBtnArray.length > 0){
				var columnBtnArr =  nsTemplate.runObjColumnBtnHandler(tableRowsBtnArray,tableRowBtnHandler);
				var columnBtns = columnBtnArr[0];
				tableRowBtnHandlerArr = columnBtnArr[1];
				var btnWidth = columnBtns.length * 30 + 10;
				var customerBtnJson = {
					field:'nsTemplateButton',
					title: '操作',
					width:btnWidth,
					tabPosition:'after',
					formatHandler: {
						type: 'button',
						data: {
							subdata:columnBtns
						}
					}
				};
				if(typeof(config.table.dataReturnbtns)=='function'){
					customerBtnJson.formatHandler.data.dataReturn = config.table.dataReturnbtns;
				}
				//如果最后一个是按钮删除重新赋值目的为了防止重复多次添加操作
				for(var tColumnI=0; tColumnI<obj[config.tableJson].columns.length; tColumnI++){
					if(obj[config.tableJson].columns[tColumnI].field == 'nsTemplateButton'){
						obj[config.tableJson].columns.splice(tColumnI,1);
					}
				}
				obj[config.tableJson].columns.push(customerBtnJson);
			}
		}
		nsLayout.init(config.id);
		$('#'+config.fullTitleId).html('<div class="templateTitle">'+config.title+'</div>');
		$('#'+config.id+'-tree').prepend('<div class="tree-title">'+config.tree.title+'</div>');
		//调用自定义组件
		serviceComponentInit();
		if(treeInitJson.dataSource.length == 0){
			var treeHtml = '<ul id="'+config.fulltreeId+'" class="ztree">'
								+'<li>'
									+'<span class="button switch bottom_docu"></span>'
									+'<a title="无数据">'
										+'<span class="button ico_docu"></span>'
										+'<span class="node_name">无数据</span>'
									+'</a>'
								+'</li>'
							+'</ul>';
			$('#'+config.id+'-tree').html(treeHtml);
		}
	}
	function init(configObj){
		config = configObj;
		//第一次执行初始化模板
		if(typeof(nsTemplate.templates.treeTable.data)=='undefined'){templateInit();}
		//记录config
		nsTemplate.templates.treeTable.data[config.id] = {
			original:$.extend(true,{},config),
			config:config
		}
		templateData = nsTemplate.templates.treeTable.data[config.id];
		
		if(debugerMode){
			//开启验证
			if(!configValidate(config)){
		 		return false;
		 	}
		}
		setDefault();//默认值处理
		treeInitJson = {
			textField:config.tree.textField,
			valueField:config.tree.valueField,
			parentIdField:config.tree.parentIdField,
			childIdField:config.tree.childIdField,
			idField:config.tree.idField,
			openState:config.tree.openState,
			customerKey:true,		
			parentId:'',//根节点		
		};	
		if(!$.isEmptyObject(config.form) && !$.isEmptyObject(config.table)){
			currentOperator = 'both';
			setFormConfig();//配置form
			setTableConfig();//配置table
		}else{
			if(!$.isEmptyObject(config.form)){currentOperator = 'form';setFormConfig();}
			if(!$.isEmptyObject(config.table)){currentOperator = 'table';setTableConfig();}
		}
		//读取html页面输出
		var layoutHtml = getLayoutHtml();
		//围加根html
		layoutHtml = nsTemplate.aroundRootHtml(layoutHtml);
		//将html添加到页面
		nsTemplate.appendHtml(layoutHtml);
		getAjaxTreeData();//AJAX读取数据
		
		// 模板回调 lyw 20181018
		if(typeof(config.completeHandler)=='function'){
			config.completeHandler(config);
		}
	}
	return {
		init:								init,							//模板初始化调用
		dialogBeforeHandler:				dialogBeforeHandler,			//弹框调用前置方法
		ajaxBeforeHandler:					ajaxBeforeHandler,				//弹框ajax保存前置方法
		ajaxAfterHandler:					ajaxAfterHandler,				//弹框ajax保存后置方法
		loadPageHandler:					loadPageHandler,				//弹框初始化加载方法
		closePageHandler:					closePageHandler,				//弹框关闭方法
	}
})(jQuery)
/******************** 左侧目录树右侧表格模板 end ***********************/