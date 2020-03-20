var nsUI = {};
var nsTree = {};
nsTree.config = {};
nsTree.json = {};
nsTree.tree = {};
nsTree.formConfig = {};
nsTree.selectJson = {};
nsTree.searchJson = {};
nsTree.currentItem = {};
nsTree.maxID = 0;
nsTree.newTreeNodeID = -100;
nsTree.currentTreeID;
var langTree = language.ui.nsTree;
//获取菜单<li>HTML
nsTree.initGetMenu = function(json,subMenuHtml,treeID){
	var dragHtml = "";
	if(nsTree.config[treeID].dragMode){
		dragHtml = '<div class="uk-nestable-handle"></div>';
	}
	var keyID = nsTree.config[treeID].controlForm.keyID;
	var keyParent = nsTree.config[treeID].controlForm.keyParent;
	var keyText = nsTree.config[treeID].controlForm.keyText;
	var resultHtml = 
	'<li data-parentid="'+json[keyParent]+'" data-name="'+json[keyText]+'" data-id="'+json[keyID]+'">'
		+'<div class="list-content uk-nestable-item">'
			+dragHtml
			+'<div class="uk-nestable-toggle" data-nestable-action="toggle"></div>'
				+'<div class="list-label">'
					+json[keyText]
				+'</div>'
			+'</div>'
		+subMenuHtml
	+'</li>';
	return resultHtml;
}
//初始化config参数
nsTree.initConfig = function(config){
	//type
	if(typeof(config.type)=='undefined'){
		config.type = 'get';
	}
	//data
	if(typeof(config.data)=='undefined'){
		config.data = '';
	}
	//dataSrc
	if(typeof(config.dataSrc)=='undefined'){
		config.dataSrc = 'list';
	}
	//controlMode
	if(typeof(config.controlMode)=='undefined'){
		config.controlMode = 'form';
	}else if(config.controlMode=='form'||config.controlMode=='dialog'||config.controlMode=='none'){
		//有效
	}else{
		nsalert(initConfig.controlModeError,'error');
	}

	//controlForm
	if(typeof(config.controlForm)=='undefined'){
		config.controlForm.keyID = 'id';
		config.controlForm.keyParent = 'parentId';
		config.controlForm.keyText = 'text';
		config.controlForm.keyOrderID = 'orderId';
		config.controlForm.formElement = [[]];
	}
	//ajaxMethod
	if(typeof(config.ajaxMethod)=='undefined'){
		config.ajaxMethod = "post";
	}
	//selectMode
	if(typeof(config.selectMode)=='undefined'){
		config.selectMode = 'single';
	}else{
		if(config.selectMode == 's'){
			config.selectMode = 'single';
		}else if(config.selectMode == 'm'){
			config.selectMode = 'multiple';
		}else if(config.selectMode == 'n'){
			config.selectMode = 'none';
		}else if(config.selectMode == 'single' || config.selectMode == 'multiple' || config.selectMode == 'none' ){
			//合法且不是缩写 可直接用 nsTree.config[treeID].selectMode
		}else{
			nsalert(lang.config.selectModeError,'error');
		}
	}
	//dragMode
	if(typeof(config.dragMode)=='undefined'){
		config.dragMode = false;
	}
	//初始化 currentItem
	nsTree.currentTreeID = config.id;
	nsTree.currentItem = {};
	nsTree.currentData = false;

	//url支持ajax
	if(typeof(config.addAjax)=='function'){
		config.addAjax = config.addAjax();
	}
	if(typeof(config.editAjax)=='function'){
		config.editAjax = config.editAjax();
	}
	if(typeof(config.deleteAjax)=='function'){
		config.deleteAjax = config.deleteAjax();
	}
	if(typeof(config.dragAjax)=='function'){
		config.dragAjax = config.dragAjax();
	}
	if(typeof(config.sortMoveAjax)=='function'){
		config.sortMoveAjax = config.sortMoveAjax();
	}

	return config;
}
//获取扩展属性的value
nsTree.getExtendValue = function(json){
	var cid = nsTree.currentItem.cItemID;
	var treeID = nsTree.currentItem.cTreeID;
	nsTree.getSearchJson(nsTree.json[treeID],cid,treeID);
	var value = nsTree.searchJson[json.id];
	if(typeof(value)=='undefined'){
		value = '';
	}
	if(value==null){
		value = '';
	}
	return value;
}
//初始化
nsTree.init = function(dataConfig){
	var config = nsTree.initConfig(dataConfig);
	nsTree.config[config.id] = config;

	if(config.dialogMode!='none'){
		//初始化默认dialog
		var dialogConfig = dataConfig.controlForm.formElement;
		nsTree.initDialog(dataConfig);
	}
	var hrJson = {html:'<hr>'};
	var extendComponetIndex = 0;

	//扩展自定义属性到弹框
	if(dialogConfig){
		if($.isArray(dialogConfig)){
			for(var configI = 0; configI<dialogConfig.length;configI++ ){
				if($.isArray(dialogConfig[configI])){
					for(var configI2 = 0; configI2<dialogConfig[configI].length;configI2++ ){
						var conlonEditJson = jQuery.extend(true, {}, dialogConfig[configI][configI2]);
						conlonEditJson.value = function(){return nsTree.getExtendValue(this)};
						var conlonDeleteJson = jQuery.extend(true, {}, dialogConfig[configI][configI2]);
						conlonDeleteJson.value = function(){return nsTree.getExtendValue(this)};
						conlonDeleteJson.readonly = true;
						var conlonAddJson = jQuery.extend(true, {}, dialogConfig[configI][configI2]);
						

						if(extendComponetIndex==0){
							nsTree.dialogEditConfig.form.push(hrJson);
							nsTree.dialogDeleteConfig.form.push(hrJson);
							nsTree.dialogAddConfig.form.push(hrJson);
						}
						extendComponetIndex++;
						nsTree.dialogEditConfig.form.push(conlonEditJson);
						nsTree.dialogDeleteConfig.form.push(conlonDeleteJson);
						nsTree.dialogAddConfig.form.push(conlonAddJson);
					}
				}
			}
		}
	}
	if(config.controlMode=='form'){
		//使用form形式，右侧出修改面板 修改面板的form id= 'controlPlane-'+dataConfig.id
		var colDom = $('#'+config.id).parent();
		
		if(config.isLayout == true){
			colDom = colDom.parent().parent();
		}
		var colDomClassStr = colDom.attr('class');
		var controlColClassStr = '';
		if(typeof(config.controlColWidth)=='undefined'){
			//如果没有设置控制面板宽度，则自动计算
			var colDomColClass = colDomClassStr.substr(colDomClassStr.lastIndexOf('col-sm-'),colDomClassStr.length);
			colDomColClass = colDomColClass.substring(0,colDomColClass.indexOf(" "));
			if(colDomColClass === ''){
				colDomColClass = colDomClassStr.substr(colDomClassStr.lastIndexOf('col-sm-'),colDomClassStr.length);
			}
			var colDomColNumStr = colDomColClass.substr(colDomColClass.lastIndexOf('-')+1,colDomColClass.length);
			var controlColNum = 12-Number(colDomColNumStr);
			controlColClassStr = colDomClassStr.replace(colDomColNumStr,controlColNum);

			if(controlColClassStr.indexOf("nspanel-left")>-1){
				controlColClassStr = controlColClassStr.replace("nspanel-left","");
			}
			if(controlColClassStr.indexOf("nspanel-right")>-1){
				controlColClassStr = controlColClassStr.replace("nspanel-right","");
			}
		}else{
			//设置控制面板宽度
			var configNum = Number(config.controlColWidth);
			if((/^(\+|-)?\d+$/.test( configNum ))&&configNum>0&&configNum<=12){
				controlColClassStr = colDomClassStr.replace(colDomColNumStr,config.controlColWidth);
			}else{
				nsalert(langTree.initConfig.colWidthError);
				return false;
			}
		}

		colDom.parent().addClass('form-content');

		var formHtml = '';
		var colDomStyle = typeof(colDom.attr('style'))!='undefined'?colDom.attr('style'):'';
		var controlColHtml = 	'<div class="'+controlColClassStr+'" style="'+colDomStyle+'">'
									+'<div id="controlPlane-'+config.id+'" class="nspanel-control"></div>'
								+'</div>';
		colDom.after(controlColHtml);

		var formConfig = {};
		formConfig.form = config.controlForm.formElement;
		for(var groupIndex=0; groupIndex<formConfig.form.length; groupIndex++){
			for(var componentIndex=0; componentIndex<formConfig.form[groupIndex].length; componentIndex++){
				formConfig.form[groupIndex][componentIndex].column = 12;
				if(formConfig.form[groupIndex][componentIndex].type=='checkbox' || formConfig.form[groupIndex][componentIndex].type=='radio'){
					for(var subI=0; subI<formConfig.form[groupIndex][componentIndex].subdata.length;subI++){
						formConfig.form[groupIndex][componentIndex].subdata[subI].isDisabled = true;
					}
				}
				formConfig.form[groupIndex][componentIndex].readonly = true;
				formConfig.form[groupIndex][componentIndex].placeholder = '';
				delete formConfig.form[groupIndex][componentIndex].rules;
			}
		}
		
		var parentFormJson = {
								id: 		config.controlForm.keyParent,
								label: 		langTree.dialog.nodeParentLable,
								type: 		'text',
								readonly: 	true,
								placeholder:'',
								column: 	12
							};
		var nameFormJson = 	{
								id: 		config.controlForm.keyText,
								label: 		langTree.dialog.nodeNameLabel,
								type: 		'text',
								readonly: 	true,
								placeholder:'',
								column: 	12
							};
		var sortFormJson = {
								id: 		config.controlForm.keyOrderID,
								label: 		langTree.dialog.nodeSortLable,
								readonly: 	true,
								type: 		'text',
								placeholder:'',
								column: 	12
							};

		var defaultFormArr = [parentFormJson,nameFormJson,sortFormJson];
		formConfig.form.unshift(defaultFormArr);

		formConfig.id = 'controlPlane-'+config.id;
		formConfig.formConfigsize = "standard";
		formConfig.format = "standard";
		formConfig.fillbg = true;

		nsTree.formConfig[config.id] = formConfig;
		formPlane.formInit(formConfig);
	}

	$.ajax({
		url:config.src,
		type:config.type,
		data:config.data,
		dataType:'json',
		success:function(data){
			if(data.success == true){
				var treeJson = data[config.dataSrc];
				if($.isEmptyObject(treeJson)){
					nsalert(langTree.initConfig.emptyData,'warning');
					//return false;
				}
				nsTree.json[config.id] = treeJson;
				var resultLiHtml = '';
				for(var treeIndex=0; treeIndex<treeJson.length; treeIndex++){
					var subMenuHtml = "";
					if(treeJson[treeIndex].children){
						subMenuHtml = nsTree.secondMenuJson(treeJson[treeIndex].children, config.id);
					}
					
					resultLiHtml += nsTree.initGetMenu(treeJson[treeIndex], subMenuHtml,config.id);
				}

				var dragClass = "";
				if(config.dragMode){
					dragClass = 'with-drag';
				}else{
					dragClass = 'without-drag';
				}
				var resultUlHtml = '<ul id="'+config.id+'_nsTree" class="uk-nestable '+dragClass+'" data-uk-nestable>'+resultLiHtml+'</ul>'
				$('#'+config.id).html(resultUlHtml);
				nsTree.actionEvent(config.id);
				//初始化完成的而回调函数
				if(typeof(config.initCompleteHandler)=='function'){
					config.initCompleteHandler(config);
				}
				//是否自动展开
				if(config.isExpandAll){
					nsTree.expandAll(config.id);
				}
				//根据层级展开
				if(typeof(config.expandLevel)=='number'){
					var $expand;
					switch(config.expandLevel){
						case 1:
							$expand = $('#'+config.id).children('ul').children('li.uk-collapsed');
							$expand.removeClass('uk-collapsed');
							break;
						case 2:
							$expand = $('#'+config.id).children('ul').children('li.uk-collapsed');
							$expand.removeClass('uk-collapsed');
							$expand = $('#'+config.id).children('ul').children('li').children('ul').children('li.uk-collapsed');
							$expand.removeClass('uk-collapsed');
							break;
						case 3:
							$expand = $('#'+config.id).children('ul').children('li.uk-collapsed');
							$expand.removeClass('uk-collapsed');
							$expand = $('#'+config.id).children('ul').children('li').children('ul').children('li.uk-collapsed');
							$expand.removeClass('uk-collapsed');
							$expand = $('#'+config.id).children('ul').children('li').children('ul').children('li').children('ul').children('li.uk-collapsed');
							$expand.removeClass('uk-collapsed');
							break
						default:
							if(debugerMode){
								console.error('expandFloor只支持1-3级自动展开');
							}
							break;
					}
				}
			}else{
				nsalert(language.common.returnError);
			}
		},
		error:function(){
			nsalert(language.common.returnError);
		},
	});
}
//初始化数据列
nsTree.iterateList = function(items, depth){
	var treeJson = {};	
	var treeArray = new Array();				
	if( ! depth)
		depth = 0;
	for(var i=0; i<items.length;i++){
		treeJson[i] = items[i];
	}
	return treeJson;
}
//关闭全部
nsTree.expandAll = function(_treeID){
	var treeID = _treeID;
	if(treeID==undefined){
		var treeNum = 0;
		for(tree in nsTree.tree){
			treeNum++;
			treeID = tree;
		}
		if(treeNum!=1){
			nsalert('当前页面有多个目录树组件，需要指定treeID');
			return false;
		}
	}
	nsTree.tree[treeID].expandAll();
}
//打开全部
nsTree.collapseAll = function(_treeID){
	var treeID = _treeID;
	if(treeID==undefined){
		var treeNum = 0;
		for(tree in nsTree.tree){
			treeNum++;
			treeID = tree;
		}
		if(treeNum!=1){
			nsalert('当前页面有多个目录树组件，需要指定treeID');
			return false;
		}
	}
	nsTree.tree[treeID].collapseAll();
}
nsTree.dragTempData = [];
//激活事件
nsTree.actionEvent = function(treeID){
	var uiID = '#'+treeID+'_nsTree';
	nsTree.tree[treeID] = $.UIkit.nestable(uiID,{}); //手动初始化nestable
	nsTree.tree[treeID].collapseAll();

	$(uiID).on('nestable-start',function(ev){
		nsTree.dragTempData = [];
		for(var listI=0; listI<$(this).data('nestable').list().length; listI++){
			nsTree.dragTempData.push($(this).data('nestable').list()[listI].id);
		}
	});
	//添加select事件
	if(nsTree.config[treeID].selectMode!='none'){
		$(uiID+" .list-content").off('click');
		$(uiID+" .list-content").on('click', nsTree.selectHandler);
	}
	
	//添加drag事件
	if(nsTree.config[treeID].dragMode){
		$(uiID).off('nestable-stop');
		$(uiID).on('nestable-stop',function(ev){
			var diffArr = [];
			var newlist = nsTree.tree[treeID].list();
			var diffListIndex = -1;
			for(var listI = 0; listI<newlist.length; listI++){
				var currentListIndex = $.inArray(newlist[listI].id, nsTree.dragTempData);
				if(currentListIndex==-1){
					diffListIndex = listI;
				}
			}
			/*
			var currentDomData = nsTree.getDomData(newlist[diffListIndex].id,treeID);
			if(currentDomData.id==newlist[diffListIndex].id&&currentDomData.parentid==newlist[diffListIndex].parentid&&currentDomData.order==newlist[diffListIndex].order){
				return false;
			}
			*/
			var ajaxObj = {};
			var currentObj = newlist[diffListIndex];
			$.each(currentObj,function(key,value){
				if(key=='id'){
					ajaxObj[nsTree.config[treeID].controlForm.keyID] = value;
				}else if(key=='parent_id'){
					if(value==null){
						ajaxObj[nsTree.config[treeID].controlForm.keyParent] = -1;
					}else{
						ajaxObj[nsTree.config[treeID].controlForm.keyParent] = value;
					}
				}else if(key=='order'){
					ajaxObj[nsTree.config[treeID].controlForm.keyOrderID] = value+1;
				}
			});
			$.ajax({
				type:  		nsTree.config[treeID].ajaxMethod,
				url:  		nsTree.config[treeID].dragAjax,
				data: 		ajaxObj,
				dataType:  	"json",
				success: function(data){
					if(data.success){
						nsalert("目录排序成功");
						$('li[data-id="'+currentObj.id+'"]').attr("data-parentid",currentObj.parent_id);
					}else{
						nsalert("目录排序失败，请重试或者刷新页面");
					}
				},
				error:function(e){
					nsalert("目录排序失败，请重试或者刷新页面");
				}
			});
		});
	}
}
//根据ID获取数据
nsTree.getDomData = function(id,treeID){
	var currentDom = $("li[data-id='"+id+"']");
	var brotherDomArr = currentDom.parent().children("li");
	var domIndex = 0;
	for(var brotherI=0; brotherI<brotherDomArr.length; brotherI++){
		if($(brotherDomArr[brotherI]).attr("data-id")==id){
			domIndex = brotherI;
		}
	}
	var returnObj = {};
	returnObj.id = Number($(currentDom).attr('data-id'));
	returnObj.name = $(currentDom).attr('data-name');
	returnObj.parentid = Number($(currentDom).attr('data-parentid'));
	returnObj.order = domIndex;
	return returnObj;
}
//获取弹出框中的顺序
nsTree.getDialogOrder = function(){
	var obj = nsTree.getDomData(nsTree.currentItem.cItemID,nsTree.currentItem.cTreeID);
	return obj.order+1;
}
//获取基本数据，根据ID
nsTree.getBaseData = function(id,treeID){
	var returnObj = {};
	for(var listI = 0; listI<nsTree.tree[treeID].list().length; listI++){
		if(nsTree.tree[treeID].list()[listI].id==id){
			returnObj = nsTree.tree[treeID].list()[listI];
		}
	}
	return returnObj;
}
nsTree.getSourceJson = function(dataID,treeID){
	var treeJsonArr = nsTree.json[treeID];
	var selectJson;
	var jsonSearch = function(dataArr){
		for(var i=0; i<dataArr.length; i++){
			if(dataArr[i][nsTree.config[treeID].controlForm.keyID]==dataID){
				selectJson = dataArr[i];
				return;
			}else{
				if(typeof(dataArr[i].children)!='undefined'&&dataArr[i].children!=null){
					jsonSearch(dataArr[i].children);
				}
			}
		}
	}
	jsonSearch(treeJsonArr);
	return selectJson;
}
nsTree.getSearchJson = function(arr,dataID,treeID){
	for(var i=0; i<arr.length; i++){
		if(arr[i][nsTree.config[treeID].controlForm.keyID]==dataID){
			nsTree.searchJson = arr[i];
			return;
		}else{
			if(typeof(arr[i].children)!='undefined'&&arr[i].children!=null){
				nsTree.getSearchJson(arr[i].children,dataID,treeID);
			}
		}
	}
}
nsTree.getSearchDom = function(treeID,domID){
	var itemArr = $("#"+treeID+ ' .uk-nestable-list-item');
	var returnDom;
	for(var itemI = 0; itemI<itemArr.length; itemI++){
		if($(itemArr[itemI]).attr('data-id') == String(domID)){
			returnDom = itemArr[itemI];
			return returnDom;
		}
	}
}
nsTree.secondMenuJson = function(childJson, treeID){
	var currentJson = childJson;
	var treeDataHtml = '';
	var treeNodesHtml = '';
	for(var treeIndex=0; treeIndex<currentJson.length;treeIndex++){

		if(Number(currentJson[treeIndex][nsTree.config[treeID].controlForm.keyID])>=nsTree.maxID){
			nsTree.maxID = Number(currentJson[treeIndex][nsTree.config[treeID].controlForm.keyID]);
		}
		var thridTreeHtml = '';
		if(currentJson[treeIndex].children){
			thridTreeHtml = nsTree.secondMenuJson(currentJson[treeIndex].children, treeID);
		}
		treeNodesHtml += nsTree.initGetMenu(currentJson[treeIndex], thridTreeHtml, treeID);
	}
	var treeDataHtml = '<ul>'+treeNodesHtml+'</ul>';
	return treeDataHtml;
}
nsTree.multipleSelectJson = {};
nsTree.selectHandler = function(ev){
	if($(ev.target).hasClass('uk-nestable-toggle')){
		//下拉操作
		return;
	}
	//清除当前项
	var clearCurrentItem = function(){
		var rootChildrenDomArr = $("#"+treeID+"_nsTree").children("li");
		nsTree.currentItem = 
		{
			'cTreeID':treeID,
			'cItemID':'',
			'cItemName':"",
			'cItemParentID':-1,
			'cItemParentName': langTree.dialog.rootName,
			'cItemOrderID':'',
			'cItemBrotherNumber':-1,
			'cItemChildren':rootChildrenDomArr.length,
		};
	}
	//设置当前项
	var setCurrentItem = function(){
		var dataID = currentDom.attr('data-id'); 
		var dataName = currentDom.attr('data-name');
		var dataParentID = currentDom.attr('data-parentid');
		
		var currentDomOrderID = 0; //排序
		var brotherDomArr = currentDom.parent().children("li");
		for(var brotherI=0; brotherI<brotherDomArr.length; brotherI++){
			if($(brotherDomArr[brotherI]).attr("data-id")==dataID){
				currentDomOrderID = brotherI;
			}
		}
		var childrenDomArr = currentDom.children("ul")?currentDom.children("ul").children("li"):[];
		var parentName;
		if(dataParentID=="-1"){
			parentName = langTree.dialog.rootName;
		}else{
			parentName = currentDom.parent().closest("li.uk-nestable-list-item.uk-parent").attr('data-name');
		}
		nsTree.currentItem = 
		{
			'cTreeID':treeID,
			'cItemID':dataID,
			'cItemName':dataName,
			'cItemParentID':dataParentID,
			'cItemParentName':parentName,
			'cItemOrderID':currentDomOrderID+1,
			'cItemBrotherNumber':brotherDomArr.length,
			'cItemChildrenNumber':childrenDomArr.length,
		};
	}
	var isCancel = false;
	var isSingle = false;
	var treeID = $(this).closest(".uk-nestable").parent().attr("id");
	var currentDom = $(this).closest("li.uk-nestable-list-item");

	//如果是单选
	if(nsTree.config[treeID].selectMode=='single'){
		isSingle = true;
		if($(this).closest("li .uk-nestable-item").hasClass('item-selected')){
			//已选中状态，单选取消选择
			isCancel = true;
			$(this).closest("li .uk-nestable-item").removeClass('item-selected');
			clearCurrentItem();
		}else{
			//未选中状态 添加单选
			//取消掉所有选择，并选中当前
			
			$("#"+treeID+" li .uk-nestable-item.item-selected").removeClass('item-selected');
			currentDom.children(".uk-nestable-item").addClass('item-selected');
			//整理数据
			setCurrentItem();
		}
	//如果是多选
	}else if(nsTree.config[treeID].selectMode=='multiple'){
		isSingle = false;
		if($(this).closest("li .uk-nestable-item").hasClass('item-selected')){
			//已选中状态，多选取消选择
			isCancel = true;
			$(this).closest("li .uk-nestable-item").removeClass('item-selected');
			clearCurrentItem();
			delete nsTree.multipleSelectJson[currentDom.attr('data-id')]
		}else{
			//未选中状态 多选要选中当前
			currentDom.children(".uk-nestable-item").addClass('item-selected');
			//整理数据
			setCurrentItem();
			nsTree.multipleSelectJson[nsTree.currentItem.cItemID] = nsTree.currentItem;
		}
	}

	//修改右侧显示表单
	var sourceJson = nsTree.getSourceJson(nsTree.currentItem.cItemID, nsTree.currentItem.cTreeID);
	if(nsTree.config[treeID].controlMode == 'form'){
		var formJson = {};
		var orderIDStr = isCancel?"":String(nsTree.currentItem.cItemOrderID)
		var parentNameStr = isCancel?"":nsTree.currentItem.cItemParentName;
		formJson[nsTree.config[treeID].controlForm.keyText] = nsTree.currentItem.cItemName;
		formJson[nsTree.config[treeID].controlForm.keyParent] = parentNameStr;
		formJson[nsTree.config[treeID].controlForm.keyOrderID] = orderIDStr;
		//查找附加数据
		for(var feI = 1; feI<nsTree.config[treeID].controlForm.formElement.length; feI++){
			var elementArr = nsTree.config[treeID].controlForm.formElement[feI];
			for(var elementIndex = 0; elementIndex<elementArr.length; elementIndex++ ){
				if(isCancel){
					formJson[elementArr[elementIndex].id] = '';
				}else{
					formJson[elementArr[elementIndex].id] = sourceJson[elementArr[elementIndex].id];
				}
			}
		}
		formPlane.fillValues(formJson,'controlPlane-'+treeID);
	}

	var returnValue;
	if(typeof(nsTree.config[treeID].selectHandler)!='undefined'){
		//单选返回json，多选返回数组
		if(isSingle){
			if(isCancel){
				returnValue = {};
			}else{
				returnValue = sourceJson;
			}
		}else{
			returnValue = [];
			$.each(nsTree.multipleSelectJson, function(key,value){
				returnValue.push(value);
			});
		}
		var treeSelectFunc = nsTree.config[treeID].selectHandler;
		treeSelectFunc(returnValue);
	}
	//返回选中值
	if(isCancel){
		nsTree.currentData = false;
	}else{
		nsTree.currentData = returnValue;
	}
}
nsTree.currentData = {}
//添加节点
nsTree.add = function(){
	var formJson = nsdialog.getFormJson();
	if(formJson==false){
		nsalert('您填写的数据不完整','error');
		return false;
	}

	var treeID = nsTree.currentTreeID;
	/*if($.isEmptyObject(nsTree.currentItem)){
		$.each(nsTree.json, function(key,value){
			treeID = key;
		})
	}else{
		treeID = nsTree.currentItem.cTreeID;
	}*/
	var keyID = nsTree.config[treeID].controlForm.keyID;
	var keyParent = nsTree.config[treeID].controlForm.keyParent;
	var keyText = nsTree.config[treeID].controlForm.keyText;
	var keyOrderID = nsTree.config[treeID].controlForm.keyOrderID;

	
	//如果上一次返回空
	if($.isEmptyObject(nsTree.json[treeID])){
		$("#"+treeID).find(".uk-nestable-empty").remove();
	}
	var parentDom = nsTree.getSearchDom(treeID, formJson[keyParent]);
	if(typeof(parentDom)=='undefined'){
		parentDom = $("#"+treeID);
	}
	var childrenNum = $(parentDom).children('ul').children('li').length;
	var childrenArr = $(parentDom).children('ul').children('li');

	//生成新目录JSON
	var domJson = {};
	$.each(formJson,function(key,value){
		domJson[key] = value;
	})
	delete domJson[keyOrderID];

	//父对象名字不需要发送到ajax
	delete formJson.addParentName;
	$.ajax({
		type:  		nsTree.config[treeID].ajaxMethod,
		url:  		nsTree.config[treeID].addAjax,
		data: 		formJson,
		dataType:  	"json",
		success: function(data){
			if(data.success){
				//根据返回的ID生成
				domJson[keyID] = String(data[keyID]);
				

				//添加页面代码--------------------------------------
				var domHtml = nsTree.initGetMenu(domJson, '', treeID);
				if(formJson[keyParent]==''||formJson[keyParent]==-1){
					//根目录新建
					nsTree.json[treeID].push(domJson);
					$(parentDom).children("ul").append(domHtml);
				}else{
					var parentJson = nsTree.getSourceJson(formJson[keyParent],treeID);

					if(typeof(parentJson.children)=='undefined'||parentJson.children==null){
						//没有下级目录的目录下新建
						parentJson['children'] = [domJson];
						domHtml = '<ul class="uk-nestable-list">'+domHtml+'</ul>'
						$(parentDom).append(domHtml);
						nsTree.tree[treeID].setParent($(parentDom));
						nsTree.tree[treeID].expandItem($(parentDom));
					}else{
						//在已有下级目录的目录下新建
						parentJson.children.push(domJson);
						var afterSortID = formJson[keyOrderID]-1-1;
						var liArr = $(parentDom).children("ul").children("li");
						if(liArr.length == 0){
							$(parentDom).children("ul").html(domHtml);
						}else{
							if(afterSortID>=0){
								$(liArr[afterSortID]).after(domHtml);
							}else if(afterSortID==-1){
								$(liArr[0]).prepend(domHtml);
							}
						}
						if($(parentDom).hasClass('uk-collapsed')){
							nsTree.tree[treeID].expandItem($(parentDom));
						}
					}
				}
				//添加基本类和选择监听器
				$('li[data-id="'+domJson[keyID]+'"]').addClass('uk-nestable-list-item');
				$('li[data-id="'+domJson[keyID]+'"] div.list-content').addClass('uk-nestable-item');
				$('li[data-id="'+domJson[keyID]+'"] .list-content').on('click', nsTree.selectHandler);
				//回调函数
				if(typeof(nsTree.config[treeID].addHandler)=='function'){
					var addFunc = nsTree.config[treeID].addHandler;
					addFunc(data);
				}
				nsalert("目录添加成功");
				popupBox.hide();
			}else{
				nsalert("目录添加失败："+data.msg);
			}
		},
		error:function(e){
			nsalert("目录添加失败："+e.msg);
		}
	});
}
nsTree.dialogAddValue = function(key){
	var returnJson = {};
	if($.isEmptyObject(nsTree.currentItem)||nsTree.currentItem.cItemID==''){
		if($.isEmptyObject(nsTree.multipleSelectJson)){
			var treeNum = 0;
			var treeName = '';
			$.each(nsTree.json, function(key,value){
				treeNum++;
				treeName = key;
			});
			if(key=='parentId'){
				if(treeNum<=1){
					nsalert(langTree.dialog.defaultTreeText);
				}else{
					nsalert(langTree.dialog.defaultMoreTreeText);
				}
			}
			returnJson.parentName = langTree.dialog.rootName;
			returnJson.parentId = -1;
			var rootliArr = $("#"+treeName+"_nsTree").children("li");
			returnJson.sortId = rootliArr.length+1;
			return returnJson[key];
		}else{
			var selectNum = 0;
			$.each(nsTree.multipleSelectJson,function(key,value){
				selectNum++;
				nsTree.currentItem = nsTree.multipleSelectJson[key];
			});
			if(key=='parentId'){
				if(selectNum>1){
					nsalert(langTree.dialog.defaultMoreNodeText,'warning');
				}
			}
			returnJson.parentName = nsTree.currentItem.cItemName;
			returnJson.parentId = nsTree.currentItem.cItemID;
			returnJson.sortId = nsTree.currentItem.cItemChildrenNumber+1;
			return returnJson[key];
		}
	}else{
		var selectNum = 0;
		$.each(nsTree.multipleSelectJson,function(key,value){
			selectNum++;
		});
		if(key=='parentId'){
			if(selectNum>1){
				nsalert(langTree.dialog.defaultMoreNodeText,'warning');
			}
		}
		returnJson.parentName = nsTree.currentItem.cItemName;
		returnJson.parentId = nsTree.currentItem.cItemID;
		returnJson.sortId = nsTree.currentItem.cItemChildrenNumber+1;
		return returnJson[key];
	}
}
nsTree.dialogAdd = function(){
	popupBox.initShow(nsTree.dialogAddConfig);
}

nsTree.getDialogID = function(){
	var returnID = nsTree.currentItem.cItemID;
	return returnID;
}
nsTree.getDialogName = function(){
	var returnID = nsTree.currentItem.cItemName;
	return returnID;
}
//删除树节点
nsTree.del = function(){
	var keyID = nsTree.config[nsTree.currentItem.cTreeID].controlForm.keyID;
	var keyParent = nsTree.config[nsTree.currentItem.cTreeID].controlForm.keyParent;
	var keyText = nsTree.config[nsTree.currentItem.cTreeID].controlForm.keyText;

	//发送服务器请求的json
	var deleteAjaxData = {};
	if(nsTree.config[nsTree.currentItem.cTreeID].deleteAjaxData){
		deleteAjaxData = nsTree.config[nsTree.currentItem.cTreeID].deleteAjaxData;
	}
	deleteAjaxData[keyID] = nsTree.currentItem.cItemID;

	var parentDom = nsTree.getSearchDom(nsTree.currentItem.cTreeID, nsTree.currentItem.cItemID);
	if(typeof(parentDom)=='undefined'){
		parentDom = $("#"+nsTree.currentItem.cTreeID);
	}
	

	$.ajax({
		type:  		nsTree.config[nsTree.currentItem.cTreeID].ajaxMethod,
		url:  		nsTree.config[nsTree.currentItem.cTreeID].deleteAjax,
		data: 		deleteAjaxData,
		dataType:  	"json",
		success: function(data){
			if(data.success){

				var delParentJson;
				if(nsTree.currentItem.cItemParentID!=-1){
					nsTree.getSearchJson(nsTree.json[nsTree.currentItem.cTreeID], nsTree.currentItem.cItemParentID,nsTree.currentItem.cTreeID);
					delParentJson = nsTree.searchJson.children;
				}else{
					delParentJson = nsTree.json[nsTree.currentItem.cTreeID];
				}
				var delIndexID;
				for(var delIndex=0; delIndex<delParentJson.length; delIndex++){
					if(delParentJson[delIndex][keyID] == nsTree.currentItem.cItemID){
						delIndexID = delIndex;
					}
				}
				delParentJson.splice(delIndexID,1);

				nsalert("目录删除成功");
				$('li[data-id="'+nsTree.currentItem.cItemID+'"]').remove();

				if(typeof(nsTree.config[nsTree.currentItem.cTreeID].delHandler)!='undefined'){
					var deleteFunc = nsTree.config[nsTree.currentItem.cTreeID].delHandler;
					deleteFunc(data);
				}

				nsTree.currentItem = {};
				nsTree.currentData = false;
				nsdialog.hide();

			}else{

				if(typeof(nsTree.config[nsTree.currentItem.cTreeID].delHandler)!='undefined'){
					var deleteFunc = nsTree.config[nsTree.currentItem.cTreeID].delHandler;
					deleteFunc(data);
				}
				nsalert("目录删除失败，请重试或者刷新页面："+data.msg,'error');
			}
		},
		error:function(e){
			nsalert("目录删除失败，请重试或者刷新页面");
		}
	});
}
//排序上移
nsTree.sortMove = function(treeID,direction){
	if(typeof(nsTree.config[treeID])=='undefined'){
		nsalert('nsTree.sortMove treeID参数错误：'+treeID);
		return false;
	};
	var selectItem = $('#'+treeID).find('div.item-selected')
	if(selectItem.length==0){
		nsalert('请先选择要修改顺序的节点','warning');
		return false;
	};
	if(direction!='up'&&direction!='down'){
		nsalert('nsTree.sortMove direction参数错误：'+direction+' ，只能是up和down');
		return false;
	}
	
	var $target;
	if(direction=='up'){
		$target = selectItem.parent().prev();
	}else if(direction=='down'){
		$target = selectItem.parent().next();
	}
	if($target.length>0){
		var ajaxData;
		if(nsTree.config[nsTree.currentItem.cTreeID].sortAjaxData){
			ajaxData = nsTree.config[nsTree.currentItem.cTreeID].sortAjaxData;
		}else{
			ajaxData = {};
		}

		ajaxData.currentID = selectItem.parent().attr('data-id');
		ajaxData.targetID = $target.attr('data-id');
		$.ajax({
			type:  		nsTree.config[nsTree.currentItem.cTreeID].ajaxMethod,
			url:  		nsTree.config[nsTree.currentItem.cTreeID].sortMoveAjax,
			data: 		ajaxData,
			dataType:  	"json",
			success: function(data){
				if(data.success){
					//移动按钮
					if(direction=='up'){
						selectItem.parent().after($target);
					}else if(direction=='down'){
						selectItem.parent().before($target);
					}
					
					nsalert("目录移动成功");
				}else{
					nsalert("目录移动失败，错误信息："+data.msg,'error');
				}
			},
			error:function(e){
				nsalert("目录移动失败，错误信息：:"+date.msg);
			}
		})
	}else{
		var alertStr;
		if(direction=='up'){
			alertStr='已经是第一个，无法上移';
		}else if(direction=='down'){
			alertStr='已经是最后一个，无法下移';
		}
		nsalert(alertStr,'warning');
	}
	

}
//编辑完成并发送ajax
nsTree.edit = function(){
	var formJson = nsdialog.getFormJson();
	if(formJson==false){
		nsalert('您填写的数据不完整');
		return false;
	}
	var keyID = nsTree.config[nsTree.currentItem.cTreeID].controlForm.keyID;
	var keyParent = nsTree.config[nsTree.currentItem.cTreeID].controlForm.keyParent;
	var keyText = nsTree.config[nsTree.currentItem.cTreeID].controlForm.keyText;

	//发送服务器请求的ID
	formJson[keyID] = nsTree.currentItem.cItemID;

	var parentDom = nsTree.getSearchDom(nsTree.currentItem.cTreeID, nsTree.currentItem.cItemID);
	if(typeof(parentDom)=='undefined'){
		parentDom = $("#"+nsTree.currentItem.cTreeID);
	}

	
	$.ajax({
		type:  		nsTree.config[nsTree.currentItem.cTreeID].ajaxMethod,
		url:  		nsTree.config[nsTree.currentItem.cTreeID].editAjax,
		data: 		formJson,
		dataType:  	"json",
		success: function(data){
			if(data.success){

				nsTree.getSearchJson(nsTree.json[nsTree.currentItem.cTreeID], nsTree.currentItem.cItemID,nsTree.currentItem.cTreeID);
				var editJson = nsTree.searchJson;
				$.each(formJson,function(key,value){
					if(key!=nsTree.config[nsTree.currentItem.cTreeID].controlForm.keyID){
						editJson[key] = value;
					}
				})
				
				var editDom = nsTree.getSearchDom(nsTree.currentItem.cTreeID,nsTree.currentItem.cItemID);
				var editName = formJson[keyText];
				$(editDom).attr('data-name',editName);
				$(editDom).children('div.list-content').children('div.list-label').text(editName);
				nsTree.currentItem.cItemName = formJson[keyText];
				var orderID = formJson[nsTree.config[nsTree.currentItem.cTreeID].controlForm.keyOrderID];
				orderID = Number(orderID-1);
				var currentDom = $('li[data-id="'+nsTree.currentItem.cItemID+'"]');
				var currentDomData = nsTree.getDomData(nsTree.currentItem.cItemID,nsTree.currentItem.cTreeID)
				
				if(currentDomData.order>orderID){
					currentDom.insertBefore($(currentDom).parent().children('li')[orderID]);
				}else if(currentDomData.order<orderID){
					currentDom.insertAfter($(currentDom).parent().children('li')[orderID]);
				}else{
					//没改变排序
				}
				
				if(typeof(nsTree.config[nsTree.currentItem.cTreeID].editHandler)!='undefined'){
					var editFunc = nsTree.config[nsTree.currentItem.cTreeID].editHandler;
					editFunc(data);
				}

				nsalert("目录修改成功");
				nsdialog.hide();

			}else{
				nsalert("目录修改失败:"+data.msg);
			}
		},
		error:function(e){
			nsalert("目录修改失败，请重试或者刷新页面，错误代码:"+e.msg);
		}
	});
}
nsTree.initDialog = function(dataConfig){
	if(dataConfig.dialogConfig){
		//如果有自定义配置项
		this.dialogDeleteConfig = dialogConfig.dialogDeleteConfig;
		this.dialogEditConfig = dialogConfig.dialogEditConfig;
		this.dialogAddConfig = dialogConfig.dialogAddConfig;
	}else{
		//默认配置项
		this.dialogDeleteConfig = 
			{
				id: 	"plane-deletemenus",
				title: 	"删除目录项",
				size: 	"s",
				form:[
					{
						note: 		'您即将删除该目录，该目录下的子目录也会受到影响。<br> 此次操作将不可恢复，请确认您的选择'
					},{
						html:  		'<hr>'
					}
				],
				btns:[
					{
						text: 		'确认',
						handler: 	'nsTree.del',
					}
				]
			}
		this.dialogEditConfig = 
			{
				id: 	"plane-editmenus",
				title: 	"修改目录项",
				size: 	"s",
				form:[],
				btns:[
					{
						text: 		'确认',
						handler: 	'nsTree.edit',
					}
				]
			}
		this.dialogAddConfig = 
			{
				id: 	"plane-addmenus",
				title: 	"新增目录项",
				size: 	"s",
				form:[],
				btns:[
					{
						text: 		'确认',
						handler: 	'nsTree.add',
					}
				]
			}
	}
	//根据数据获取的
	var editNameFormJson = {
							id: 		dataConfig.controlForm.keyText,
							label: 		langTree.dialog.nodeNameLabel,
							type: 		'text',
							rules: 		'required',
							value: 		nsTree.getDialogName
						}
	var editOrderFormJson = {
							id: 		dataConfig.controlForm.keyOrderID,
							label: 		langTree.dialog.nodeSortLable,
							type: 		'text',
							rules: 		'required number',
							value: 		nsTree.getDialogOrder
						}
	nsTree.dialogEditConfig.form.push(editNameFormJson);
	nsTree.dialogEditConfig.form.push(editOrderFormJson);

	var deleteNameFormJson = {
							id: 		dataConfig.controlForm.keyText,
							label: 		langTree.dialog.nodeDeleteNameLable,
							type: 		'text',
							readonly: 	true,
							value: 		nsTree.getDialogName
						}
	nsTree.dialogDeleteConfig.form.push(deleteNameFormJson);

	var addNameFormJson = {
							id: 		dataConfig.controlForm.keyText,
							label: 		langTree.dialog.nodeAddNameLable,
							type: 		'text',
							rules: 		'required',
						}
	var addParentFormJson = {
							id: 		'addParentName',
							label: 		langTree.dialog.nodeParentLable,
							type: 		'text',
							readonly: 	true,
							value: 		function(){return nsTree.dialogAddValue('parentName');}
						} 
	var addParentIDFormJson = {
							id: 		dataConfig.controlForm.keyParent,
							type: 		'hidden',
							value: 		function(){return nsTree.dialogAddValue('parentId');}
						} 
	var orderIDFormJson = {
							id: 		dataConfig.controlForm.keyOrderID,
							label: 		langTree.dialog.nodeSortLable,
							type: 		'text',
							value: 		function(){return nsTree.dialogAddValue('sortId');}
						}
	
	nsTree.dialogAddConfig.form.push(addParentFormJson);
	nsTree.dialogAddConfig.form.push(addParentIDFormJson);
	nsTree.dialogAddConfig.form.push(addNameFormJson);
	nsTree.dialogAddConfig.form.push(orderIDFormJson);
}
nsTree.dialogDelete = function(){
	if($.isEmptyObject(nsTree.currentItem)||nsTree.currentItem.cItemID==''){
		if($.isEmptyObject(nsTree.multipleSelectJson)){
			nsalert(langTree.dialog.deleteEmptyText);
		}else{
			var selectNum = 0;
			var selectName;
			$.each(nsTree.multipleSelectJson,function(key,value){
				selectNum++;
				selectName = key;
			})
			if(selectNum=1){
				nsTree.currentItem = nsTree.multipleSelectJson[selectName];
			}else{
				nsalert(langTree.dialog.deleteMoreNodeText);
			}
		}
		
	}else{
		popupBox.initShow(nsTree.dialogDeleteConfig);
	}
}
nsTree.dialogEdit = function(){
	//console.log(nsTree.dialogEditConfig);
	if($.isEmptyObject(nsTree.currentItem)||nsTree.currentItem.cItemID==''){
		nsalert('请先选择要修改的目录树');
	}else{
		popupBox.initShow(nsTree.dialogEditConfig);
	}
}

/******自动高度面板*************************/
$(document).ready(function(){
	var maxHeight = $(window).height()-182;
	$(".nspanel-autoheight").height(maxHeight);
});


/**
 * 带状态和弹出框的静态表格
 */
nsUI.stateTable = function(tableID,dataJson){
	var firstTr = $("table#"+tableID+" tr").eq(0);
	var colNum = firstTr.children('td').length;
	var widthNum  = 100/colNum+'%';
	firstTr.children('td').attr('style','width:'+widthNum);
	var popoverOption = {
		'placement':"top",
		'container':"body",
		'trigger':'hover'
	}
	$("table#"+tableID+" tr td[data-content]").popover(popoverOption);
	if(typeof(dataJson)!='object'){
		return false;
	};
	
	var ruleObjArr = []
	$.each(dataJson, function(key,value){
		var cObj = {};
		cObj[key] = value;
		ruleObjArr.push(cObj);
	});
	var ruleObjOrderArr = ruleObjArr.sort(
		function(a, b)
		{
			var aValue,bValue;
			for(var key in a){
				aValue = a[key];
			}
			for(var key in b){
				bValue = b[key];
			}
			if(aValue < bValue) return -1;
			if(aValue > bValue) return 1;
			return 0;
		}
	);
	var ruleOrderArr = [];
	var ruleOrderKeyArr = [];
	var noneClassKeyIndex = 0;
	$.each(ruleObjOrderArr, function(i,value){
		var valueArr;
		var valueKey;
		var keyIndex;
		for(var key in value){
			valueKey = key;
			valueArr = value[key];
			if(key=='none'){
				noneClassKeyIndex = keyIndex;
			}
			keyIndex++;
		}
		ruleOrderKeyArr.push(valueKey);
		ruleOrderArr.push(valueArr);
	});
	var tdArr = $("table#"+tableID+" tr td");
	for(var tdI=0; tdI<tdArr.length; tdI++){
		if($(tdArr[tdI]).text()!=''){
			var tdNum = Number($(tdArr[tdI]).text());
			var tdNumIndex = noneClassKeyIndex;  //默认为none所对应的下表
			for(var arrI=0; arrI<ruleOrderArr.length; arrI++){
				//console.log('i:'+arrI);
				//console.log(ruleOrderArr[arrI])
				if(arrI==(ruleOrderArr.length-1)){
					//最后一次循环
					if(ruleOrderArr[arrI][0]!=ruleOrderArr[arrI][1]){
						if(tdNum>=ruleOrderArr[arrI][0]&&tdNum<=ruleOrderArr[arrI][1]){
							tdNumIndex = arrI;
						}
					}else{
						if(tdNum==ruleOrderArr[arrI][0]){
							tdNumIndex = arrI;
						}
					}
				}else{
					if(ruleOrderArr[arrI][1]==ruleOrderArr[arrI][1]){
						//当前组的最大数等于下一组的最小数 执行大于等于第一个数，小于第二个数
						if(ruleOrderArr[arrI][0]!=ruleOrderArr[arrI][1]){
							if(tdNum>=ruleOrderArr[arrI][0]&&tdNum<ruleOrderArr[arrI][1]){
								tdNumIndex = arrI;
							}
						}else{
							if(tdNum==ruleOrderArr[arrI][0]){
								tdNumIndex = arrI;
							}
						}
					}else{
						//当前组的最大数等于下一组的最小数 执行大于等于第一个数，小于等于第二个数
						if(ruleOrderArr[arrI][0]!=ruleOrderArr[arrI][1]){
							if(tdNum>=ruleOrderArr[arrI][0]&&tdNum<=ruleOrderArr[arrI][1]){
								tdNumIndex = arrI;
							}
						}else{
							if(tdNum==ruleOrderArr[arrI][0]){
								tdNumIndex = arrI;
							}
						}
					}
				}

			}
			var className ='';
			if(typeof(ruleOrderKeyArr[tdNumIndex])!='undefined'){
				className = ruleOrderKeyArr[tdNumIndex];
				$(tdArr[tdI]).addClass(className);
			}

		}

	}
}

/********************************************************************
 * 增删一体输入框
 */
nsUI.addSearchInput = {};
nsUI.addSearchInput.init = function(formJson,config){
	var $input = $('#form-'+formJson.id+'-'+config.id);

	var columnNum = 0; 
	var columnTitle = [];	
	var columnType = [];
	var columnData = [];
	var columnWidth = [];
	var dataSearch = [];
	var dataAjax = [];
	var dataKey = [];
	var dataTitle = [];

	var autoWidthColumnNum = 0   	//自动计算的列数量
	var autoWidthColumnTotal = 0	//自动计算的列宽度 百分比
	for(var col = 0; col<config.localDataConfig.length; col++){
		if(config.localDataConfig[col].visible){
			columnData[config.localDataConfig[col].visible-1] = col;
			columnNum++;
		}
		if(config.localDataConfig[col].search!=false){
			//search是默认可搜索
			dataSearch.push(col);
		}
		if(config.localDataConfig[col].ajax){
			dataAjax.push(col);
		}
		if(config.localDataConfig[col].key){
			dataKey.push(config.localDataConfig[col].key);
		}else{
			dataKey.push(-1);
		}
		if(config.localDataConfig[col].title){
			dataTitle.push(config.localDataConfig[col].title);
		}else{
			dataTitle.push('');
		}
	}
	
	for(var colI = 0; colI<columnData.length; colI++){
		var currentData = config.localDataConfig[columnData[colI]];
		columnTitle.push(currentData.title);
		columnType.push(currentData.type);
		if(typeof(currentData.width)=='undefined'){
			autoWidthColumnNum++;
		}else if(typeof(currentData.width)=='number'){
			autoWidthColumnTotal+=currentData.width;
		}else{
			nsalert('宽度参数错误','error');
		}
		columnWidth.push(currentData.width);
	}

	//计算列宽
	if(autoWidthColumnNum>0){
		if(autoWidthColumnTotal<=100){
			var columnWidthStr = parseInt(((100-autoWidthColumnTotal)/autoWidthColumnNum)*1000)/1000+'%';
			for(var i=0; i<columnWidth.length; i++){
				if(typeof(columnWidth[i])=='undefined'){
					columnWidth[i] = columnWidthStr;
				}else{
					columnWidth[i] = columnWidth[i]+'%';
				}
			}
		}else{
			nsalert('宽度设置错误，请设置为数字，总和不大于100');
		}

	}

	config.columnData  = columnData;		//显示列数据
	config.columnType  = columnType; 		//显示列类型
	config.columnNum   = columnNum; 		//列数量
	config.columnWidth = columnWidth; 		//列宽
	config.columnTitle = columnTitle; 		//标题数组

	config.dataSearch = dataSearch;			//可以搜索的数组
	config.dataAjax   = dataAjax;			//发送请求要的参数

	config.dataKey    = dataKey; 			//key 每个数据对象都有 没有的是-1
	config.dataTitle  = dataTitle; 			//标题 每个数据对象都有 没有的是''
	//激活方法
	function clickHiddenPlaneHandler(ev){
		//点击屏幕无关位置关闭弹框
		$(document).off('click',clickHiddenPlaneHandler);
		if($(ev.target).closest('.result-plane').length==0){
			if($(ev.target).closest('.add-select-input-btn').length==0){
				$input.parent().children('.result-plane').remove();
			}
		};
	}
	
	function inputFocusHandler(ev){
		$input.off('focus');
		$input.on('blur',function(ev){
			$input.off('blur');
			$input.on('focus',inputFocusHandler);
			$(document).on('click',clickHiddenPlaneHandler);
		})

		nsUI.addSearchInput.top10Plane(config,$input);
		var evData = {};
			evData.input = $input;
			evData.config = config;
		$input.on('keyup', evData, nsUI.addSearchInput.inputKeyHandler);
	}
	$input.on('focus',inputFocusHandler)
	//按钮事件
	var $refreshBtn = $input.parent().children('[ns-control="refresh"]');
	$refreshBtn.on('click',function(ev){
		$refreshBtn.children('i').addClass('fa-spin');
		var timestamp = new Date().getTime();
		timestamp = {'timestamp':timestamp};
		$.ajax({
			url:config.refreshAjax,
			data:timestamp,
			dataType:'json',
			success:function(data){
				if(typeof(data.data)=='string'){
					data.data = eval(data.data);
				}
				if($.isArray(data.data)){
					config.localDataArr = data.data;
					if($input.parent().children('.result-plane').length>0){
						nsUI.addSearchInput.top10Plane(config,$input);
						$input.focus();
					}else{
						//面板未打开，且有选中值
						nsUI.addSearchInput.clearValue(config,$input,false);
					}
				}else{
					nsalert('返回的数据不是数组','error');
				}
				
			},
			error:function(error){
				nsalert('数据返回错误','error');
				console.log(error);
			},
			complete:function(){
				$refreshBtn.children('i').removeClass('fa-spin');
			}
		})
	})
	var $listBtn = $input.parent().children('[ns-control="list"]');
	if(typeof(config.listHandler)=='undefined'){
		$listBtn.remove();
	}else{
		$listBtn.on('click',function(ev){
			var handlerObj = {};
			var handlerID = $('#'+config.fullHiddenID).val();
			if(handlerID==''){
				handlerObj = -1;
			}else{
				for(var dataI=0; dataI<config.localDataArr.length; dataI++){
					if(config.localDataArr[dataI][1]==handlerID){
						for(var keyI=0; keyI<config.dataKey.length; keyI++){
							handlerObj[config.dataKey[keyI]] = config.localDataArr[dataI][keyI];
						}
					}
				}
			}
			config.listHandler(handlerObj);
		})
	}
}
//选中数据
nsUI.addSearchInput.selectRow = function(rowID,config,$input){
	var valueArr = [];
	for(var cdI = 0; cdI<config.columnData.length; cdI++){
		valueArr.push(config.localDataArr[rowID][config.columnData[cdI]]);
	}
	valueArr[3] = config.localDataArr[rowID][config.localDataHiddenIDIndex];
	valueArr[4] = config.localDataArr[rowID][0];
	nsUI.addSearchInput.fillValue(valueArr,config,$input);
	
	$(document).off('keyup', nsUI.addSearchInput.documentKeyHandler);
	//发送ajax验证数据是否正确
	var ajaxData = {};
	for(var adI=0; adI<config.dataAjax.length; adI++){
		ajaxData[config.dataKey[config.dataAjax[adI]]] = config.localDataArr[rowID][config.dataAjax[adI]];
	}
	if(config.localDataAjaxData){
		$.each(config.localDataAjaxData,function(key,value){
			ajaxData[key] = config.localDataArr[rowID][value];
		})
	}
	var typeStr = typeof(config.confirmAjaxType)=='string'?config.confirmAjaxType:'post';
	$.ajax({
		url:config.confirmAjax,
		data:ajaxData,
		dataType:'json',
		type:typeStr,
		success:function(data){
			if(data.success){
				//nsalert('验证成功');
			}else{
				nsalert('验证失败，错误原因：'+data.msg,'error');
			}
		},
		error:function(error){
			nsalert(error,'error');
		}

	})
}
//输入框输入事件
nsUI.addSearchInput.currentKeyValue = '';
nsUI.addSearchInput.inputKeyHandler = function(ev){
	var $input = ev.data.input;
	var config = ev.data.config;
	var dataArr = config.localDataArr;
	var inputValue = $.trim($input.val());
	if(inputValue==''){
		//如果空则读取头10条;
		if(nsUI.addSearchInput.currentKeyValue != inputValue){
			nsUI.addSearchInput.top10Plane(config,$input)
		}
	}else{
		//有输入文字，过滤数据
		if(nsUI.addSearchInput.currentKeyValue != inputValue){
			//输入不同刷新
			nsUI.addSearchInput.currentKeyValue = inputValue;
			var top10Arr = [];
			for(var i = 0; i<dataArr.length; i++){
				var isFit = false;
				for(var currentItemI = 2; currentItemI<dataArr[i].length; currentItemI++){
					//在当前数组中搜索，0是序列号，不能用于搜索
					if(dataArr[i][currentItemI].indexOf(inputValue)>-1){
						isFit = true;
						top10Arr.push(dataArr[i]);
						break;
					}
				}
				if(i>=9){
					i = dataArr.length;
				}
			}
			nsUI.addSearchInput.getPlane(top10Arr,config,$input,inputValue);
		}
	}
}
nsUI.addSearchInput.save = function(saveData,config,$input){
	var valueArr = []
	$.each(saveData,function(key,value){
		valueArr.push(value);
	})
	valueArr.push('');
	valueArr.push(-1);
	nsUI.addSearchInput.fillValue(valueArr,config,$input)

	$.ajax({
		url:config.addAjax,
		data:saveData,
		dataType:'json',
		success:function(data){
			if(data.success){
				nsalert('添加成功');
				var resultArr = [];
				$.each(saveData,function(key,value){
					resultArr.push(value);
				})
				if(typeof(data.data)=='string'){
					data.data = eval(data.data)[0];
				}else if($.isArray(data.data)){
					data.data = data.data[0];
				}else{
					nsalert('保存格式错误','error');
				}
				resultArr.push(data.data[config.localDataHiddenIDIndex]);
				resultArr.push(0);
				nsUI.addSearchInput.fillValue(resultArr,config,$input);
				for(var dataI=0; dataI<config.localDataArr.length; dataI++){
					config.localDataArr[dataI][0] = config.localDataArr[dataI][0]+1;
				}
				
				data.data[0] = 0;
				config.localDataArr.unshift(data.data);
				//回填数组未添加
			}else{
				nsalert('添加失败，错误原因：'+data.msg,'error');
			}
		}
	})
}
//整体接收的键盘事件
nsUI.addSearchInput.documentKeyHandler = function(ev){
	var $input = ev.data.input;
	var config = ev.data.config;
	var $plane = $input.parent().children('.result-plane');
	var $currentRow = $plane.children('.current');
	if(ev.keyCode=='13'){
		//回车确认
		if($currentRow.length>0){
			var currentRowID = parseInt($currentRow.attr('rowindexid'));
			nsUI.addSearchInput.selectRow(currentRowID,config,$input);
		}else{
			var addRow =  $plane.children('.add');
			if(addRow.length==1){
				var addRowSpan = addRow.find('a span');
				var addRowData = {};
				var isNeedConfirm = false;
				for(var spanI=0;  spanI<addRowSpan.length; spanI++){
					addRowData[config.dataKey[config.columnData[spanI]]] = $(addRowSpan[spanI]).html();
					if($(addRowSpan[spanI]).html()=='未输入'){
						isNeedConfirm = true;
					}
				}
				if(isNeedConfirm){
					nsConfirm('您填写的数据不完整，是否确认保存？','warning');
				}
				nsUI.addSearchInput.save(addRowData,config,$input);
			}
		}
		
	}else if(ev.keyCode=='40'){
		//下箭头 下移
		if($currentRow.next().hasClass('plane-content')){
			$currentRow.removeClass('current');
			$currentRow.next().addClass('current');
			currentRow = $currentRow.next();
		};
	}else if(ev.keyCode=='38'){
		//上箭头 上移
		if($currentRow.prev().hasClass('plane-content')){
			$currentRow.removeClass('current');
			$currentRow.prev().addClass('current');
			currentRow = $currentRow.prev();
		};
	}else if(ev.keyCode=='27'){
		//ESC 关闭
		nsUI.addSearchInput.closePlane(config, $input);
	}
}
//初始化面板数据
nsUI.addSearchInput.top10Plane = function(config, $input){
	if($input.val()==''){
		nsUI.addSearchInput.currentKeyValue = '';
		var emptyValueArr = [];
		var topNum = config.localDataArr.length>=10?10:config.localDataArr.length;
		for(var topI=0; topI<topNum; topI++){
			emptyValueArr.push(config.localDataArr[topI]);
		}
		nsUI.addSearchInput.getPlane(emptyValueArr,config,$input);
	}
}
//获得面板
nsUI.addSearchInput.getPlane = function(dataArr, config,$input,inputValue){
	var rowsHtml = '';
	var planeContentIDArr = [];

	function getPlaneRowHtml(data,indexID){
		//获取行代码
		var currentRowClass = '';
		if(indexID==0){
			currentRowClass = 'current';
		}
		var columnDataArr = [];
		for(var titleI = 0; titleI<config.columnData.length; titleI++){
			columnDataArr.push(data[config.columnData[titleI]]);
		}
		var rowHtml = '';
		if(typeof(inputValue)=='undefined'){
			inputValue = '';
		}

		for(var colI=0; colI<columnDataArr.length; colI++){
			if(inputValue!=''){
				columnDataArr[colI] = columnDataArr[colI].replace(inputValue,'<b>'+inputValue+'</b>');
			}
			rowHtml+='<span style="width:'+config.columnWidth[colI]+'">'+columnDataArr[colI]+'</span>';
		}
		rowHtml = 
				'<div class="plane-content '+currentRowClass+'" rowIndexID = "'+data[0]+'">'
					+'<a href="javascript:void(0);">'
					+rowHtml
					+'</a>'
				+'</div>'
		return rowHtml;
	}
	function getPlaneTitleHtml(config){
		//获取标题代码
		planeTitleHtml = '';
		for(var titleI=0; titleI<config.columnTitle.length; titleI++){
			planeTitleHtml += '<span style="width:'+config.columnWidth[titleI]+'">'+config.columnTitle[titleI]+'</span>';
		}
		planeTitleHtml = '<div class="plane-title">'+planeTitleHtml+'</div>';
		return planeTitleHtml;
	}
	
	if(dataArr.length>0){
		//有数据
		planeTitleHtml = getPlaneTitleHtml(config);
		for(var i=0; i<dataArr.length; i++){
			rowsHtml+= getPlaneRowHtml(dataArr[i],i);
		}
	}else{
		//没有数据
		planeTitleHtml = '';
		rowsHtml = '<div class="empty">没有符合条件的数据。您可以直接新建这条数据，使用空格为分隔符</div>';
		if(inputValue.indexOf(' ')>-1){
			var newRecordHtml = '';
			var inputValueArr = inputValue.split(' ');

			//获得配置文件中数字类型的数量
			var typeNumber = 0;			//一共有几个数字类型的字段
			var typeString = 0;			//一共有几个字符类型的字段
			var typeNumberIndex = []; 	//储存数字类型的位置
			var typeStringIndex = []; 	//储存数字类型的位置
			var outputArr = [];
			for(var colI=0; colI<config.columnType.length; colI++){
				if(config.columnType[colI] == 'number'){
					typeNumber ++;
					typeNumberIndex.push(colI);
				}else if(config.columnType[colI] == 'string'){
					typeString ++;
					typeStringIndex.push(colI);
				}
				outputArr.push('');
			}
			
			var inputString = 0;		//一共有几个数字类型的输入值
			var inputNumber = 0;		//一共有几个数字类型的输入值
			var inputNumberIndex = []; 	//储存数字类型的位置
			var inputStringIndex = []; 	//储存数字类型的位置
			for(var ivI=0; ivI<inputValueArr.length; ivI++){
				var regNumber = new RegExp("^[0-9]*$");
				var isNumber = regNumber.test(inputValueArr[ivI]);
				if(isNumber){
					inputNumber++;
					inputNumberIndex.push(ivI);
				}else{
					inputString++;
					inputStringIndex.push(ivI);
				}
			}

			//重新组织输入字符串中的数据
			//处理数字输入值,必须配置值里有数字
			if(typeNumber>0&&inputNumber>0){
				if(typeNumber<=inputNumber){
					//如果输入值和配置值中的数字数量一样，或者小于，则按顺序赋值
					for(var tI = 0; tI<typeNumberIndex.length; tI++){
						outputArr[typeNumberIndex[tI]] = inputValueArr[inputNumberIndex[tI]];
					}
				}else if(typeNumber>inputNumber){
					//配置中的数字大于1，且数量大于输入数量，则将多余的填充
					for(var tI = 0; tI<typeNumberIndex.length; tI++){
						if(typeof(inputValueArr[inputNumberIndex[tI]])!='undefined'){
							outputArr[typeNumberIndex[tI]] = inputValueArr[inputNumberIndex[tI]];
						}else{
							outputArr[typeNumberIndex[tI]] = inputValueArr[inputNumberIndex[0]];
						}
					}
				}
			}
			//对空字段填充值
			var outputNumber = 0;
			var outputString = 0;
			for(var outputI = 0; outputI<outputArr.length; outputI++){
				if(outputArr[outputI]==''){
					if(config.columnType[outputI]=='string'){
						if(typeof(inputValueArr[inputStringIndex[outputString]])!='undefined'){
							outputArr[outputI] = inputValueArr[inputStringIndex[outputString]];
						}else{
							if(inputStringIndex.length==0){
								outputArr[outputI] = inputValueArr[inputValueArr.length-1];
							}else{
								outputArr[outputI] = inputValueArr[inputStringIndex[inputString-1]];
							}
						}
						
						outputString++;
					}else if(config.columnType[outputI]=='number'){
						outputArr[outputI] = inputValueArr[inputNumberIndex[outputNumber]];

						if(typeof(inputValueArr[inputNumberIndex[outputNumber]])!='undefined'){
							outputArr[outputI] = inputValueArr[inputNumberIndex[outputNumber]];
						}else{
							if(inputNumberIndex.length==0){
								//一个数字都米有
								outputArr[outputI] = '未输入'
							}else{
								outputArr[outputI] = inputValueArr[inputNumberIndex[inputNumber-1]];
							}
						}
						outputNumber++;
					}
				}
			}

			for(var opI=0; opI<outputArr.length; opI++){
				newRecordHtml +='<span style="width:'+config.columnWidth[opI]+'">'+outputArr[opI]+'</span>'; 
			}

			newRecordHtml = 
				'<div class="plane-content add'+'" rowIndexID = "">'
					+'<a href="javascript:void(0);">'
					+newRecordHtml
					+'</a>'
				+'</div>'
			rowsHtml = rowsHtml+newRecordHtml;
			planeTitleHtml = getPlaneTitleHtml(config);
		}
		
	}
	
	var $plane = $input.parent().children('.result-plane');

	if($plane.length==0){
		//还没有面板，添加面板，并且加上事件
		$input.after('<div class="result-plane">'+rowsHtml+planeTitleHtml+'</div>')
		var evData = {};
		evData.input = $input;
		evData.config = config;
		$(document).off('keyup');
		$(document).on('keyup',evData,nsUI.addSearchInput.documentKeyHandler);
		$input.parent().children('.result-plane').children('.plane-content').off('click');
		$input.parent().children('.result-plane').children('.plane-content').on('click',function(ev){
			var rowID = parseInt($(this).attr('rowindexid'));
			nsUI.addSearchInput.selectRow(rowID,config,$input);
		})
	}else{
		//已经有了面板，只是更新数据即可
		$plane.html(rowsHtml+planeTitleHtml);
		$input.parent().children('.result-plane').children('.plane-content').off('click');
		$input.parent().children('.result-plane').children('.plane-content').on('click',function(ev){
			var rowID = parseInt($(this).attr('rowindexid'));
			nsUI.addSearchInput.selectRow(rowID,config,$input);
		})
	}
}
//关闭面板
nsUI.addSearchInput.closePlane = function(config, $input){
	$input.parent().children('.result-plane').remove();
	$(document).off('keyup', nsUI.addSearchInput.documentKeyHandler);
	//激活方法
	$input.on('focus',function(ev){
		$input.off('focus')
		nsUI.addSearchInput.top10Plane(config,$input);
		var evData = {};
			evData.input = $input;
			evData.config = config;
		$input.on('keyup', evData, nsUI.addSearchInput.inputKeyHandler);
	})
}
//填充值 
//valueArr是所用的数据，0是标题，1、2是备注，3是ID
nsUI.addSearchInput.fillValue = function(valueArr,config,$input){
	var valueText = valueArr[0]+' '+valueArr[1]+' '+valueArr[2];
	$input.val(valueText);
	$("#"+config.fullHiddenID).val(valueArr[3]);
	var classStr = '';
	if(typeof(config.listHandler)=='undefined'){
		classStr = 'style = "right:28px;"';
	}else{
		classStr = 'style = "right:56px;"';
	}
	var valueHtml = '<div class="value-tag"'+classStr+'>'+valueArr[0]+' <span class="remark">（'+valueArr[1]+': '+valueArr[2]+'）</span>'+'<div class="handler-btn">X</div></div>'
	$input.parent().append(valueHtml);
	//添加关闭按钮事件
	//$input.parent().find('.value-tag .handler-btn').on('click',function(ev){
	$input.parent().find('.value-tag').on('click',function(ev){
		$(this).off('click');
		nsUI.addSearchInput.clearValue(config,$input);
	})
	//回调函数
	if(typeof(config.changeHandler)=='function'){
		var func = config.changeHandler;
		func(valueArr[3]);
	}
	//移除面板
	nsUI.addSearchInput.closePlane(config, $input);
}
//清除数据
nsUI.addSearchInput.clearValue = function(config,$input,isNotOpenPlane){
	//isNotOpenPlane 是否准备再次输入
	$input.val('');
	$("#"+config.fullHiddenID).val('');
	$input.parent().children('.value-tag').remove();
	
	if(isNotOpenPlane){
		//仅仅关闭不准备输入
	}else{
		$input.focus();
		nsUI.addSearchInput.top10Plane(config,$input);
	}
}

/********************************************************************
 * 项目选择器
 */
nsUI.projectSelect = (function($) {
	var config;
	var $btn;  			//外部按钮
	var $input;			//搜索框
	var $searchBtn; 	//搜索按钮
	var $list 			//当前列表
	var $result 		//已选择列表
	var $arrAdd
	var $arrRemove 		//箭头
	var $confirmBtn; 	//确认按钮
	var $cancelBtn; 	//取消按钮
	var $clsoeBtn; 		//关闭按钮
	function init(configObj){
		if(config){
			$("#"+config.id).show();
			return false;
		}
		
		config = configObj;
		
		if(config.$btn){
			$btn = config.$btn; //已经废弃的属性 改为整页面弹框
		}
		$container = config.$container;
		var configID;
		if(config.id){
			//id存在
		}else{
			//自动添加ID
			if(config.$btn){
				config.id = $btn.closest(".page-title.nav-form").attr('id')+'-fid'+$btn.attr('fid'); //面板ID
			}else{
				config.id = 'nsUI-projectSelect-'+Math.round(Math.random()*1000000000+1);
			}
		}
		//清空数据数组，如果有赋值则不清空
		if(typeof(config.dataArr)=='undefined'){
			config.dataArr = [];
		}
		if(typeof(config.listArr)=='undefined'){
			config.listArr = [];
		}
		if(typeof(config.resultArr)=='undefined'){
			config.resultArr = [];
		}

		config.selectedListArr = [];
		config.selectedResultArr = [];

		//所包含DOM的id
		config.childrenID = {};
		config.childrenID.dropdown = config.id+'-menu'; 	//分类列表ID
		config.childrenID.list = config.id+'-list';  		//所有项目列表ID

		config.selectClassID = '-1'; //默认选中class是全部
		if(typeof(nsUI.projectSelect.data)!='object'){
			nsUI.projectSelect.data = {};
		}

		nsUI.projectSelect.data[config.id] = config;

		if(typeof($container)!='object'){
			$('body').append(getPlaneHtml());  //默认情况下输出HTML到body最后
		}else{
			if(typeof(config.containerMode)=='string'){
				if(config.containerMode == 'inner'){
					$container.addClass('project-select-container');
				}
			}
			$container.html(getPlaneHtml()); //作为其他组件的一部分输出HTML到制定HTML标签
		}
		
		//初始化键盘、焦点事件
		$input = $("#"+config.id+" .ps-title .ps-input input");
		$list = $("#"+config.id+" .ps-body .ps-list");
		$result = $("#"+config.id+" .ps-body .ps-select");
		$searchBtn = $("#"+config.id+" .ps-title .ps-input button");
		$arrAdd = $("#"+config.id+" .arr .arr-add");
		$arrRemove = $("#"+config.id+" .arr .arr-remove");
		$confirmBtn = $("#"+config.id+" .ps-btn .btn-success");
		$cancelBtn = $("#"+config.id+" .ps-btn .btn-white");
		$clsoeBtn = $("#"+config.id+" .ps-title .ps-close-btn");

		//初始化窗口快捷键
		$(document).on("keyup",shortKeyHanlder);
		//初始化搜索框
		$input.on('focus', function(ev){
			$input.on('blur',function(ev){
				$input.off("keyup",inputKeyupHandler);
				$(document).off("keyup",shortKeyHanlder);
				$(document).on("keyup",shortKeyHanlder);
				removeDefaultReadyLi();
			});
			$input.on("keyup",inputKeyupHandler);
			$(document).off("keyup",shortKeyHanlder);
			setDefaultReadyLi();
		});
		$input.focus();
		//初始化按钮
		$searchBtn.on('click',function(ev){
			searchValue();
		})
		$arrAdd.on('click',arrAddHandler);
		$arrRemove.on('click',arrRemoveHandler);
		$confirmBtn.on('click',cofirmBtnHandler);
		$cancelBtn.on('click',closeBtnHandler);
		$clsoeBtn.on('click',closeBtnHandler);

	}
	//清除数据，下次点击重新初始化
	function clear(){
		if(config){
			$input.off("keyup");
			$arrAdd.off('click');
			$arrRemove.off('click');
			$confirmBtn.off('click');
			$cancelBtn.off('click');
			$clsoeBtn.off('click');
			$('#'+config.id).remove();
			config = undefined;
		}

	}
	function closeBtnHandler(ev){
		$("#"+config.id).hide();
	}
	function cofirmBtnHandler(ev){
		confirmHandler();
	}
	//返回参数
	function confirmHandler(){
		
		var configHandler = config.confirmHandler;
		if(typeof(configHandler)=='function'){

			var resultStr = '';
			var configHandlerArr = [];
			for(var resultI=0; resultI<config.resultArr.length; resultI++){
				configHandlerArr.push(config.resultArr[resultI][config.listAjax.valueField]);
				resultStr += '"'+config.resultArr[resultI][config.listAjax.valueField]+'"';
				if(resultI<config.resultArr.length-1){
					resultStr += ',';
				}
			}
			resultStr = '['+resultStr+']';
			config.selected = resultStr;
			var resultObj = {};
			resultObj.string = resultStr;
			resultObj.array = config.resultArr;
			resultObj.value = configHandlerArr;

			configHandler(resultObj);

			$("#"+config.id).hide();
		}
	}
	//输入框处理
	function inputKeyupHandler(ev){
		switch(ev.keyCode){
			case 32:
				var $ready = $list.children('ul').children('li[ns-psid][class="ready"]');
				if($ready.length>0){
					var id = $ready.attr('ns-psid');
					selectAddList(id,$ready);
					refreshList();
					setDefaultReadyLi();
					var trimStr = $input.val();
					trimStr = $.trim(trimStr)
					$input.val(trimStr);
					$input.select();
				}
				break;

			case 40:
				//下：移动到下一个
				toNextLi();
				break;
			case 38:
				//上：移动到上一个
				toPrevLi();
				break;
			case 37:
				//上一页
				toPrevPage();
				setDefaultReadyLi();
				break;
			case 39:
				//下一页
				toNextPage();
				setDefaultReadyLi();
				break;
			case 13:
				//确认
				confirmHandler();
				break;
			case 27:
				//取消
				closeBtnHandler();
				break;
			default:
				//正常输入搜索
				searchValue();
				setDefaultReadyLi();
				break;
		}
	}

	function toNextLi(){
		//下：移动到下一个
		var $ready = $list.children('ul').children('li[ns-psid][class="ready"]');
		if($ready.length==0){
			return false;
		}
		//递归查找下一个
		var $nextReady;
		function getNext($dom){
			var $next = $dom.next('[ns-psid]');
			if($next.length==0){
				$nextReady = false;
				if(config.listPageIndex[1]<config.listArr.length-1){
					toNextPage();
					setDefaultReadyLi();
				}else{
					nsalert('已经是最后一行','warning');
				return false;
				}
			}else{
				if($next.attr('class')==''){
					$nextReady = $next;
				}else{
					getNext($next);
				}
			}
		}
		getNext($ready);
		if($nextReady){
			$ready.removeClass('ready');
			$nextReady.addClass('ready');
		}
	}
	function toPrevLi(){
		var $ready = $list.children('ul').children('li[ns-psid][class="ready"]');
		if($ready.length==0){
			return false;
		}
		//递归查找上一个
		var $preReady;
		function getNext($dom){
			var $pre = $dom.prev('[ns-psid]');
			if($pre.length==0){
				$preReady = false;
				if(config.listPageIndex[0]>0){
					toPrevPage();
					setDefaultLastReadyLi();
				}else{
					nsalert('已经是第一行','warning');
					return false;
				}
			}else{
				if($pre.attr('class')==''){
					$preReady = $pre;
				}else{
					getNext($pre);
				}
			}
		}
		getNext($ready);
		if($preReady){
			$ready.removeClass('ready');
			$preReady.addClass('ready');
		}
	}
	function toNextPage(){
		if(config.listPageIndex[1]>=config.listArr.length-1){
			nsalert('已经是最后一页','warning');
		}else{
			refreshList([config.listPageIndex[0]+10,config.listPageIndex[1]+10]);
		}
	}
	function toPrevPage(){
		if(config.listPageIndex[0]==0){
			nsalert('已经是第一页','warning');
		}else{
			refreshList([config.listPageIndex[0]-10,config.listPageIndex[1]-10]);
		}
	}
	//设定默认值
	function setDefaultReadyLi(){
		$list.children('ul').children('li[ns-psid][class="ready"]').removeClass('ready');
		$list.children('ul').children('li[ns-psid][class=""]').eq(0).addClass('ready');
	}
	function setDefaultLastReadyLi(){
		$list.children('ul').children('li[ns-psid][class="ready"]').removeClass('ready');
		$list.children('ul').children('li[ns-psid][class=""]').last().addClass('ready');
	}
	function removeDefaultReadyLi(){
		$list.children('ul').children('li[ns-psid][class="ready"]').removeClass('ready');
	}
	function searchValue(){
		var value = $input.val();
		//判断分类
		var searchClassOff = true;
		if(config.selectClassID=='-1'){
			//全部分类
			searchClassOff = true;
		}else{
			searchClassOff = false;
		}
		
		config.listArr = [];
		if(value==''){
			if(searchClassOff){
				config.listArr = [].concat(config.dataArr);
			}else{
				for(var dataI=0; dataI<config.dataArr.length; dataI++){
					if(config.dataArr[dataI][config.listAjax.classField]==config.selectClassID){
						config.listArr.push(config.dataArr[dataI]);
					}
				}
			}
		}else{
			config.listArr = [];
			var isSearchPY = false; //是否拼音搜索
			if(config.listAjax.pyField){
				isSearchPY = true;
			}
			var isSearchWB = false;	//是否五笔搜索
			if(config.listAjax.wbField){
				isSearchWB = true;
			}
			//循环查找是否匹配
			for(var searchI=0; searchI<config.dataArr.length; searchI++){
				if(!searchClassOff && config.dataArr[searchI][config.listAjax.classField]!=config.selectClassID){
					//如果有分类信息且不是当前分类
				}else{
					var isResult = false;
					if(config.dataArr[searchI][config.listAjax.textField].indexOf(value)>-1){
						isResult = true;
					}

					if(!isResult&&isSearchPY){ //只要有一个已经匹配，就不需要再往下搜索了
						if(config.dataArr[searchI][config.listAjax.pyField].toLocaleUpperCase().indexOf(value.toLocaleUpperCase())>-1){
							isResult = true;
						}
					}
					if(!isResult&&isSearchWB){
						if(config.dataArr[searchI][config.listAjax.wbField].toLocaleUpperCase().indexOf(value.toLocaleUpperCase())>-1){
							isResult = true;
						}
					}
					//如果任何一项匹配，则添加该条记录到listArr
					if(isResult){
						config.listArr.push(config.dataArr[searchI]);
					}
				}
			}
		}
		refreshList([0,9]);
	}
	//快捷键处理
	function shortKeyHanlder(ev){
		switch(ev.keyCode){
			case 37:
				//左 上一页
				toPrevPage();
				break;
			case 39:
				//右 下一页
				toNextPage();
				break;
			case 38:
				//下 默认选中第一条
				//if()
				var $ready = $list.children('ul').children('li[ns-psid][class="ready"]');
				if($ready.length==0){
					setDefaultLastReadyLi();
				}else{
					toPrevLi();
				}
				
				break;
			case 40:
				//上，上一条
				var $ready = $list.children('ul').children('li[ns-psid][class="ready"]');
				if($ready.length==0){
					setDefaultReadyLi();
				}else{
					toNextLi();
				}
				break;
			case 13:
				//确认
				confirmHandler();
				break;
			case 27:
				//取消
				closeBtnHandler();
				break;
			case 32:
				//空格确认添加
				var $ready = $list.children('ul').children('li[ns-psid][class="ready"]');
				if($ready.length>0){
					var id = $ready.attr('ns-psid');
					selectAddList(id,$ready);
					refreshList();
					setDefaultReadyLi();
				}
		}
	}
	function getPlaneHtml(){
		var windowHeight = $(window).height();
		var planeHeight = 470;
		var planeStyleStr = '';
		
		//获取面板代码
		var planeHtml = '';
		var titleHtml = getTitleHtml(); //title部分的HTML代码
		var listHtml = getListHtml();
		planeHtml = 
			'<div class="project-select-plane" id="'+config.id+'" style="'+planeStyleStr+'">'
				+titleHtml
				+'<div class="ps-body">'
					+'<div class="ps-list">'
						+listHtml
					+'</div>'
					+'<div class="arr">'
						+'<a class="arr-add none" href="javascript:void(0);"><i class="fa fa-arrow-circle-right" aria-hidden="true"></i></a>'
						+'<a class="arr-remove none" href="javascript:void(0);"><i class="fa fa-arrow-circle-left" aria-hidden="true"></i></a>'
					+'</div>'
					+'<div class="ps-select">'
					+'</div>'
				+'</div>'
				+'<div class="ps-footer">'
					+'<div class="ps-help">'
						+'<span><i class="fa fa-keyboard-o" ></i> 左右翻页，上下移动，空格选择，回车确认</span><br>'
						+'<span><i class="fa fa-hand-o-up" ></i> 单击选择，双击操作，箭头批量操作</span>'
					+'</div>'
					+'<div class="ps-btn">'
						+'<button class="btn btn-success"><i class="fa fa-check"></i> 确认</button>'
						+'<button class="btn btn-white">取消</button>'
					+'</div>'
				+'</div>'
			+'</div>'
		
		return planeHtml;
	}
	//------获取头部HTML代码 ps-title
	function getTitleHtml(){
		//标题部分HTML代码输出

		//判断class是否显示，如果显示，宽度是多少
		var classWidthStyle = '';
		if(typeof(config.classVisible)!='boolean'){
			config.classVisible = true;
		}

		var classHtml = '';
		if(config.classVisible){
			//如果显示
			var classListHtml = getClassListHtml(); //分类
			if(typeof(config.classWidth)=='number'){
				classWidthStyle = 'style="width:'+config.classWidth+'px; "';
			}else if(typeof(config.classWidth)=='string'){
				classWidthStyle = 'style="width:'+config.classWidth+'; "';
			}
			classHtml =
				'<div class="ps-select" '+classWidthStyle+'>'
					+'<button class="btn btn-default dropdown-toggle" type="button" id="'+config.childrenID.dropdown+'" data-toggle="dropdown">'
						+'<span class="name">全部分类 </span>'
						+'<span class="caret"></span>'
					+'</button>'
					+'<ul class="dropdown-menu" role="menu" aria-labelledby="'+config.childrenID.dropdown+'">'
						+classListHtml
					+'</ul>'
				+'</div>'
		}else{
			//如果不显示

		}
		//title标题
		var titleText = '选择项目';
		if(config.title){
			titleText = config.title;
		}
		var placeholderStr = '名称 / 简拼';
		if(typeof(config.searchPlaceHolder)=='string'){
			placeholderStr = config.searchPlaceHolder;
		}
		
		
		
		var titleHtml = 
		'<div class="ps-title">'
			+'<lable class="ps-label">'+titleText+'： </lable>'
				+classHtml
				+'<div class="ps-input">'
					+'<input type="text" id="aaa" name="aaa" placeholder="">'
					+'<button><i class="fa fa-search" aria-hidden="true"></i></button>'
				+'</div>'
				+'<a class="ps-close-btn" href="javascript:void(0);">x</a>'
			+'</div>'
		return titleHtml;
	}
	function getClassListHtml(){
		//标题部分 分类列表 HTML代码输出
		var classListHmtl = ''
		if($.isArray(config.classArr)){
			for(var classI=0; classI<config.classArr.length; classI++){
				var className = config.classArr[classI][config.classAjax.textField];
				var classID = config.classArr[classI][config.classAjax.valueField];
				var hrefStr = 'javascript:nsUI.projectSelect.selectClass(\''+config.id+'\',\''+classID+'\',\''+className+'\');';
				classListHmtl+=
					'<li role="presentation" classID="'+classID+'">'
						+'<a role="menuitem" tabindex="-1" href="'+hrefStr+'">'+className+'</a>'
					+'</li>';
			}
			var allHrefStr = 'javascript:nsUI.projectSelect.selectClass(\''+config.id+'\',\'-1\',\'全部分类\');';
			classListHmtl+=
				'<li role="presentation" class="divider"></li>'
				+'<li role="presentation">'
					+'<a role="menuitem" tabindex="-1" href="'+allHrefStr+'">全部分类</a>'
				+'</li>'
		}else{
			classListHmtl = 
				'<li role="presentation" classID="-1">'
					+'<a role="menuitem" tabindex="-1" href="javascript:void(0);">'
						+'<i class="fa fa-refresh fa-spin fa-3x fa-fw"></i> 正在加载...'
					+'</a>'
				+'</li>';
			getClassListAjax();
		}
		return classListHmtl;
	}
	function getClassListAjax(){
		//获取分类列表数据，刷新classArr数据
		//默认值
		var data = config.classAjax.url?config.classAjax.data:'';
		var type = config.classAjax.type?config.classAjax.type:'post';
		var dataSrc = config.classAjax.dataSrc?config.classAjax.dataSrc:'rows';
		$.ajax({
			url:config.classAjax.url,
			data:data,
			type:type,
			success:function(data){
				var classListHmtl
				if($.isArray(data[dataSrc])){
					//有分类信息
					config.classArr = data[dataSrc];
					classListHmtl = getClassListHtml();
				}else{
					//nsalert('分类信息不存在（classAjax.dataSrc：'+dataSrc+'）没有返回值  ','error');
					classListHmtl = '<li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:void(0);"><i class="fa fa-exclamation-circle"></i> 无分类信息</a></li>';
				};
				$('[aria-labelledby="'+config.childrenID.dropdown+'"]').html(classListHmtl);
				

			}
		})
	}
	//选中事件 外部可访问
	function selectClass(planeID,classID,className){
		//选中分类时间 改变selectClassID值
		$('#'+planeID+' .ps-title .ps-select button .name').html(className+' ');
		config.selectClassID = classID;
		searchValue();
	}
	//-------获取左侧列表HTML代码
	function getListHtml(indexArr){
		//indexArr数组
		var listHtml = '';
		if (config.dataArr.length>0) {
			//已经有了数组
			var start = 0;
			var end = 5;
			if(indexArr){
				start = indexArr[0];
				end = indexArr[1];
			}
			var moreHtml = '';
			if(end>=config.listArr.length-1){
				for(var moreI = config.listArr.length; moreI<=end; moreI++){
					moreHtml+=
						'<li><a href="javascript:void(0);">'
							+'<div class="index">'+(moreI+1)+'</div>'
							+'<div class="name"></div>'
						+'</a></li>'
				}
				end = config.listArr.length-1;
			}
			for(var i=start; i<=end; i++){
				var textStr = config.listArr[i][config.listAjax.textField]
				var valueStr = config.listArr[i][config.listAjax.valueField]
				var nullCls = config.listArr[i].isInResult?'null ':'';
				var selectedCls = config.listArr[i].isInSelect?'select':'';
				var liHtml = 
					'<li ns-psid="'+valueStr+'" class="'+nullCls+selectedCls+'"><a href="javascript:void(0);">'
						+'<div class="index">'+(i+1)+'</div>'
						+'<div class="name">'+textStr+'</div>'
					+'</a></li>'
				listHtml+=liHtml;
			}
			listHtml = '<ul>'+listHtml+moreHtml+'</ul>';
			var listLength = config.listArr.length;
			var pageLength = Math.ceil(config.listArr.length/10);
			var currentPage = Math.ceil((start+1)/10);
			var lastJS = '';
			var lastCls = '';
			var nextJS = '';
			var nextCls = '';
			if(currentPage==1){
				lastJS = 'javascript:void(0);';
				lastCls = 'class="not"';
			}else{
				lastJS = 'javascript:nsUI.projectSelect.toPage('+(currentPage-1)+');';
			}
			if(currentPage==pageLength){
				nextJS = 'javascript:void(0);';
				nextCls = 'class="not"';
			}else{
				nextJS = 'javascript:nsUI.projectSelect.toPage('+(currentPage+1)+');';
			}
			if(config.listArr.length>0){
				listHtml += 
					'<div class="state">'
						+'<div class="page">'
							+'<a href="'+lastJS+'" '+lastCls+'>'
								+'<i class="fa fa-angle-left" aria-hidden="true"></i>'
							+'</a>'
						+'</div>'
						+'<div class="page">'
							+ currentPage+' / '+pageLength
						+'</div>'
						+'<div class="page">'
							+'<a href="'+nextJS+'" '+nextCls+'>'
								+'<i class="fa fa-angle-right" aria-hidden="true"></i>'
							+'</a>'
						+'</div>'
						+'<span> 共：'+listLength+'</span>'
					+'</div>'
			}else{
				listHtml += 
					'<div class="state">'
						+'搜索结果为空'
					+'</div>'
			}
			
		}else{
			//发ajax获取数组
			listHtml = 
				'<div class="loading">'
					+'<i class="fa fa-refresh fa-spin"></i>'
					+'<p>正在加载...</p>'
				+'</div>'
			// getListAjax();
           		setTimeout(getListAjax, 10);		}
		return listHtml;
	}
	function toPage(pageID){
		var start = (pageID-1)*10;
		var end = pageID*10-1;
		var indexArr = [start,end];
		refreshList(indexArr);
	}
	function getListError(error){
		//获取主要数据，列表信息错误
		if(config.listArr){
			config.listArr = [];
		}
		if(config.dataArr){
			config.dataArr = [];
		}
		var errorHtml = 
			'<div class="loading">'
				+'<i class="fa fa-exclamation-triangle"></i>'
				+'<p>'+error+'</p>'
			'</div>'
		$list.html(errorHtml)
	}
	function refreshList(indexArr){
		//indexArr是下标数组，第一个是开始，第二个是结束 [0,9]，指定输出行下标范围 读取config.listArr

		//如果为空，则刷新当前
		if(indexArr){
			config.listPageIndex = indexArr;
		}else{
			indexArr = config.listPageIndex;
		}
		
		listHtml = getListHtml(indexArr);
		$list.html(listHtml);
		$list.children('ul').children('li[ns-psid]').on('click',function(ev){
			var liID = $(this).attr('ns-psid');
			if($(this).hasClass('null')){
				nsalert('已选中，不能多次选择','warning')
			}else{
				var timeStampStr = $(this).attr('timestamp');
				if(typeof(timeStampStr)=='string'){
					var currentTimestamp = new Date().getTime();
					var selectTimestamp = parseInt($(this).attr('timestamp'));
					if(currentTimestamp-selectTimestamp<500){
						//双击
						selectAddList(liID,this);
					}else{
						if($(this).hasClass('select')){
							//取消
							selectCancelList(liID,this);
						}else{
							//选中
							selectList(liID,this);
						}
					}
				}else{
					//选中
					selectList(liID,this);
				}
			}
		})
	}
	function arrAddHandler(ev){
		if($(this).hasClass('none')){
			nsalert('请先选择项目','warning')
		}else{
			var removeObj = {};
			//先组织数据，后执行添加和删除
			for(var slI=0; slI<config.selectedListArr.length; slI++){
				var id = config.selectedListArr[slI][config.listAjax.valueField];
				var liDOM = $('#'+config.id+' [ns-psid="'+id+'"]');
				removeObj[id] = {};
				removeObj[id].id = config.selectedListArr[slI][config.listAjax.valueField];
				removeObj[id].liDOM = $('#'+config.id+' [ns-psid="'+id+'"]');
			}
			$.each(removeObj,function(key,value){
				selectAddList(value.id,value.liDOM);
			})
			delete removeObj;
		}
	}
	function arrRemoveHandler(ev){
		if($(this).hasClass('none')){
			nsalert('请先选择项目','warning')
		}else{
			var removeObj = {};
			//先组织数据，后执行添加和删除
			for(var slI=0; slI<config.selectedResultArr.length; slI++){
				var id = config.selectedResultArr[slI][config.listAjax.valueField];
				var liDOM = $('#'+config.id+' [ns-psid="'+id+'"]');
				removeObj[id] = {};
				removeObj[id].id = config.selectedResultArr[slI][config.listAjax.valueField];
				removeObj[id].liDOM = $('#'+config.id+' [ns-psid="'+id+'"]');
			}
			$.each(removeObj,function(key,value){
				selectRemoveResult(value.id,value.liDOM);
			})
			delete removeObj;
		}
	}
	//备选列表-选中
	function selectList(id,liDOM){
		var currentItem = config.dataArr[config.dataKey[id]];
		currentItem.isInSelect = true;
		$list.find('.ready').removeClass('ready');
		$(liDOM).addClass('select');
		$(liDOM).attr('timestamp',new Date().getTime());
		config.selectedListArr.push(currentItem);
		$arrAdd.removeClass("none");
	}
	//备选列表-取消
	function selectCancelList(id,liDOM){
		var currentItem = config.dataArr[config.dataKey[id]];
		currentItem.isInSelect = false;
		$(liDOM).removeClass('select');
		$(liDOM).attr('timestamp',new Date().getTime());
		var currentIndex;
		for(var i=0; i<config.selectedListArr.length; i++){
			if(config.selectedListArr[i]==currentItem){
				currentIndex = i;
			}
		}
		config.selectedListArr.splice(currentIndex,1)
		if(config.selectedListArr.length==0){
			$arrAdd.addClass("none");
		}
	}
	//确认添加到已选择列表
	function selectAddList(id,liDOM){
		var currentItem;
		currentItem = config.dataArr[config.dataKey[id]];
		config.resultArr.push(currentItem);
		//从备选数组中删除当前对象
		var currentSLIndex;
		for(var slI=0; slI<config.selectedListArr.length; slI++){
			if(config.selectedListArr[slI]==currentItem){
				currentSLIndex = slI;
			}
		}
		config.selectedListArr.splice(currentSLIndex,1);
		currentItem.isInResult = true;
		currentItem.isInSelect = false;
		if(config.selectedListArr.length==0){
			$arrAdd.addClass("none");
		}
		refreshResult();
		if(liDOM){
			//处理DOM对象
			$(liDOM).attr('class','null');
		}
	}
	//刷新结果列表
	function refreshResult(){
		var listHtml = '';
		for(var resultI = 0; resultI<config.resultArr.length; resultI++){
			var textStr = config.resultArr[resultI][config.listAjax.textField]
			var valueStr = config.resultArr[resultI][config.listAjax.valueField];
			var selectedCls = config.resultArr[resultI].isInSelect?'select':'';
			var liHtml = 
				'<li ns-psid="'+valueStr+'" class="'+selectedCls+'"><a href="javascript:void(0);">'
					+'<div class="index">'+(resultI+1)+'</div>'
					+'<div class="name">'+textStr+'</div>'
				+'</a></li>'
			listHtml+=liHtml;
		}
		listHtml = '<ul>'+listHtml+'</ul>'
		$result.html(listHtml)
		$result.children('ul').children('li[ns-psid]').on('click',function(ev){
			var liID = $(this).attr('ns-psid');
			
			var timeStampStr = $(this).attr('timestamp');
				if(typeof(timeStampStr)=='string'){
					var currentTimestamp = new Date().getTime();
					var selectTimestamp = parseInt($(this).attr('timestamp'));
					if(currentTimestamp-selectTimestamp<500){
						//双击
						selectRemoveResult(liID,this);
					}else{
						if($(this).hasClass('select')){
							//取消
							selectCancelResult(liID,this);
						}else{
							//选中
							selectResult(liID,this);
						}
					}
				}else{
					//选中
					selectResult(liID,this);
				}
		})
	}
	//结果列表-选中
	function selectResult(id,liDOM){
		var currentItem = config.dataArr[config.dataKey[id]];
		currentItem.isInSelect = true;
		$(liDOM).addClass('select');
		$(liDOM).attr('timestamp',new Date().getTime());
		config.selectedResultArr.push(currentItem);
		$arrRemove.removeClass("none");
	}
	//结果列表-取消
	function selectCancelResult(id,liDOM){
		var currentItem = config.dataArr[config.dataKey[id]];
		currentItem.isInSelect = false;
		$(liDOM).removeClass('select');
		$(liDOM).attr('timestamp',new Date().getTime());
		var currentIndex;
		for(var i=0; i<config.selectedResultArr.length; i++){
			if(config.selectedResultArr[i]==currentItem){
				currentIndex = i;
			}
		}
		config.selectedResultArr.splice(currentIndex,1)
		if(config.selectedResultArr.length==0){
			$arrRemove.addClass("none");
		}
	}
	//结果列表-删除
	function selectRemoveResult(id,liDOM){
		var currentItem;
		currentItem = config.dataArr[config.dataKey[id]];
		//从结果数组中删除当前对象
		var currentResultIndex;
		for(var srI=0; srI<config.resultArr.length; srI++){
			if(config.resultArr[srI]==currentItem){
				currentResultIndex = srI;
			}
		}
		config.resultArr.splice(currentResultIndex,1);
		//从备选数组中删除当前对象
		var currentSLIndex;
		for(var slI=0; slI<config.selectedResultArr.length; slI++){
			if(config.selectedResultArr[slI]==currentItem){
				currentSLIndex = slI;
			}
		}
		config.selectedResultArr.splice(currentSLIndex,1);
		currentItem.isInResult = false;
		currentItem.isInSelect = false;
		if(config.selectedResultArr.length==0){
			$arrRemove.addClass("none");
		}
		refreshResult();
		refreshList();
	}
	function getListAjax(){
		//获取列表数据，刷新listArr数据
		//默认值
		var data = config.listAjax.url?config.listAjax.data:'';
		var type = config.listAjax.type?config.listAjax.type:'post';
		var dataSrc = config.listAjax.dataSrc?config.listAjax.dataSrc:'rows';
		$.ajax({
			url:config.listAjax.url,
			data:data,
			type:type,
			success:function(data){
				var listHtml;
				if($.isArray(data[dataSrc])){
					//有分类信息
					if(data[dataSrc].length>0){
						config.dataArr = data[dataSrc];
						config.dataKey = {};//根据id值得到数组索引
						for(var keyI = 0; keyI<config.dataArr.length; keyI++){
							config.dataKey[config.dataArr[keyI][config.listAjax.valueField]] = keyI;
						}

						//如果有默认选中值，转换数据，刷新结果列表
						if(config.selected&&config.selected!=''&&config.selected!='[]'){
							var selectedStr = config.selected;
							selectedStr = selectedStr.substring(1,selectedStr.length-1);
							var resultArr = selectedStr.split(",");

							config.resultArr = [];
							for(var resultI = 0; resultI<resultArr.length; resultI++){
								var valueStr = resultArr[resultI];
								valueStr = valueStr.replace(/'/g,"");
								valueStr = valueStr.replace(/"/g,'');
								var result = config.dataArr[config.dataKey[valueStr]];
								if(typeof(result)=='object'){
									result.isInResult = true; //修改在结果集状态
									config.resultArr.push(result);
								}else{
									nsalert('id：'+valueStr+' 无法找到对应数据','error');
								}
								
							}
							refreshResult();
						}

						//刷新列表
						config.listArr = [].concat(data[dataSrc]);
						refreshList([0,9]);
						setDefaultReadyLi();
					}else{
						getListError('没有获取到项目信息，返回项目数量为 0');
					}
					
				}else{
					getListError('参数错误：（listAjax.dataSrc：'+dataSrc+'）');
				};
				//$('[aria-labelledby="'+config.childrenID.dropdown+'"]').html(classListHmtl);
			},
			error:function(error){
				getListError('listAjax请求失败：'+error+'）');
			}
		})
	}
	//返回选中数据
	function getData() {
		var returnArr = config.resultArr;
		if(config.resultArr.length==0){
			returnArr = false;
		}
		return returnArr;
	}
	function getDataIDs() {
		var idsArr = [];
		var idsStr = false
		for(var i=0; i<config.resultArr.length; i++){
			idsArr.push(config.resultArr[i][config.listAjax.valueField]);
		}
		console.log(idsArr);
		if(idsArr.length==0){
			idsStr = false;
		}else{
			idsArr = idsArr.sort();
			idsStr = idsArr.join(',');
		}
		return idsStr;
	}
	return {
		init:init,  				//初始化方法
		selectClass:selectClass,  	//选中分类
		toPage:toPage, 				//跳转分页
		clear:clear, 				//清除操作数据，下次点击初始化
		getData:getData, 			//返回选中数据
		getDataIDs:getDataIDs 		//返回选中数据字符串
	}
})(jQuery);

/********************************************************************
 * 人员选择器
 */
nsUI.personSelect = (function($) {

	var data;			//数据储存
	var $input; 		//搜索框
	var $personBtn; 	//人员按钮
	var $groupBtn; 		//组织按钮
	var $historyBtn; 	//历史按钮
	var $planes; 		//所有面板
	var $contentPlanes 	//左侧内容面板集合
	var $personPlane; 	//人员列表面板
	var $groupPlane; 	//组织结构面板
	var $groupPersonPlane //组织结构面板上的人员面板
	var $groupPersonPlaneAdd  //批量添加按钮
	var $historyPlane; 	//历史列表面板
	var $resultPlane; 	//结果面板
	var $inputMask; 	//input显示框
	var $inputMaskClose;//input显示框的关闭按钮

	var personArr = []; 		//人员列表原始数据
	var personListArr = []; 	//人员列表当前数组
	var groupJson = [];			//组织架构原始数据
	var groupListJson = []; 	//组织架构当前数据
	var historyListArr = []; 	//历史记录列表
	var historyDataArr = []; 	//历史记录列表初始化后的数据，包含具体数据
	var resultPersonArr = [];
	var resultGroupArr = [];

	var inputValue = ''; 		//输入框的值
	var planeIndex;  			//1是人员，2是组织，3是历史
	var pageID;  				//人员列表页码
	var config; 				//配置文件，每次刷新
	var isShow = false;
	var currentGroupNode = {};	//储存当前选择的部门节点
	var personSelectTree;
	function init(configObj){
		resetVals();
		//同页面上可能多次使用，需要分别配置，分别记录
		if(typeof(configObj)=='object'){
			config = configObj;
			config.resultPersonArr = resultPersonArr;
			if($.isArray(config.personAjax.personArr)){
				personArr = config.personAjax.personArr; //支持外部直接赋值
				personListArr = personArr;
			}else{
				personArr = false;
				personListArr = false; //false代表未读取到数据，需要ajax处理
			}
			if($.isArray(config.personAjax.groupArr)){
				groupArr = config.personAjax.groupArr; //支持外部直接赋值
				groupListArr = groupArr;
			}else{
				groupArr = false; //false代表未读取到数据，需要ajax处理
				groupListArr = false; 
			}
			if($.isArray(config.historyArr)){
				historyListArr = config.history;
			}else{
				historyListArr = false;
			}

			inputValue = ''; 		//输入框的值
			planeIndex = 0;			//当前面板id，1是person 2是group 3是history,0是关闭
			pageID = 0;

			config.searchInputID = 'form-'+config.formID+'-'+config.id;
			config.planeID = config.searchInputID+'-plane';
			$input = $('#'+config.searchInputID);
			$input.val('');
			var planesHtml = getPlanesHtml();
			$input.closest('.form-group').after(planesHtml);
			//定义DOM对象
			//面板
			$planes = $("#"+config.planeID);
			$contentPlanes = $("#"+config.planeID+' .common-plane');
			$personPlane = $("#"+config.planeID+' .person-plane');
			$groupPlane = $("#"+config.planeID+' .group-plane');
			$historyPlane = $("#"+config.planeID+' .history-plane');
			$resultPlane = $("#"+config.planeID+' .result-plane');
			//按钮
			$inputBtns = $input.parent().children('[ns-control]');
			$personBtn = $input.parent().children('[ns-control="personInfo"]');
			$groupBtn = $input.parent().children('[ns-control="groupInfo"]');
			$historyBtn = $input.parent().children('[ns-control="historyInfo"]');

			//加载按钮监听器
			$input.on('focus',function(ev){
				//changePlaneState('person');
				if(planeIndex==0){
					planeShow();
					if(config.isUsedHistory){
						changePlaneState('histry');
					}else{
						changePlaneState('person');
					}
					groupPlaneShow();
				}
				if(planeIndex==1){
					refreshPersonPlane();
				}
			});
			//输出代码
			$personBtn.on('click',function(ev){
				planeShow();
				changePlaneState('person');
				groupPlaneShow();
			});
			$groupBtn.on('click',function(ev){
				planeShow();
				changePlaneState('group');
				groupPlaneShow();
			});
			$historyBtn.on('click',function(ev){
				planeShow();
				changePlaneState('histry');
				groupPlaneShow();
			});
		}else{
			nsalert('人员选择器配置参数错误','error');
			return false;
		}
	}
	//打开面板
	function planeShow() {
		$input.parent().children('.has-error').remove();
		if($planes.hasClass('show')){
			//已经打开
		}else{
			$planes.addClass('show');
			$input.on('keyup',inputKeyupHandler);
			$(document).on('keyup',documentKeyupHandler);
			isShow = true;
		}
	}
	//窗体按下事件，监听上下左右翻页等
	function documentKeyupHandler(ev) {
		//console.log(ev.keyCode);
		switch(ev.keyCode){
			case 32:
				//空格是添加
				if($input.val().indexOf(' ')>-1){
					//input中有空格，过滤掉输入法的空格事件
					var selectItem = $personPlane.children('.current');
					if(selectItem.length==1){
						var index = parseInt(selectItem.attr('ns-psindex'));
						addPerson(index);
						$input.select();
					}
				}
				break;
			case 40:
				//下 向下移动
				var selectItem = $personPlane.children('.current');
				if(selectItem.length==1){
					var nextItem = false;
					function getNextItem(item){
						if(item.next().attr('class')=='plane-content'){
							nextItem = item.next();
						}else{
							if(item.next().length!=0){
								//如果有下一个
								getNextItem(item.next());
							}else{
								if(item.hasClass('plane-title')){
									//最后一条了，再向下是翻下一页
									toPage(pageID+1);
								}
							} 
						}
					}
					getNextItem(selectItem);
					if(nextItem!=false){
						nextItem.addClass('current');
						selectItem.removeClass('current');
					};
				}
				break;
			case 38:
				//上 向上移动
				var selectItem = $personPlane.children('.current');
				if(selectItem.length==1){
					var prevItem = false;
					function getPrevItem(item){
						if(item.prev().attr('class')=='plane-content'){
							prevItem = item.prev();
						}else{
							if(item.prev().length!=0){
								getPrevItem(item.prev());
							}else{
								//第一条，再向上是翻上一页
								toPage(pageID-1);
							}
							
						}
					}
					getPrevItem(selectItem);
					if(prevItem!=false){
						prevItem.addClass('current');
						selectItem.removeClass('current');
					};
				}
				break;
			case 39:
				//右 翻下一页
				toPage(pageID+1);
				break;
			case 37:
				//左 翻上一页
				toPage(pageID-1);
				break;
			case 13:
				//确认完成
				confirmComplete();
				break;
			default:
				
				break;
		}
	}
	//inputMask 转化成显示状态
	function inputMaskSetBlur(){
		if($inputMask.length==1){
			$input.blur();
			$inputMask.addClass('blur');
			$inputMask.one('click',function(ev){
				$inputMask.removeClass('blur');
				$input.focus();
			})
		}
	}
	//关闭面板
	function closePlane(){
		if($planes.hasClass('show')){
			$planes.removeClass('show');
			$input.off('keyup',inputKeyupHandler);
			$(document).off('keyup',documentKeyupHandler);
			$inputBtns.filter('.current').removeClass('current');
			isShow = false;
			inputMaskSetBlur()
			planeIndex = 0;
		}else{
			console.log('已经关了');
		}
	}
	//确认完成
	function confirmComplete() {
		if($planes.hasClass('show')){
			closePlane();
			//存储历史记录
			if(config.isUsedHistory){
				saveStroe();
			}
			//回调
			if(typeof(config.handler)=='function'){
				config.handler(resultPersonArr);
			}
		}else{
			console.log('已经关了');
		}
	}
	////存储历史记录
	function saveStroe(){
		if(resultPersonArr.length>0||resultGroupArr.length>0){
			var storeID = 'person-select-'+config.id;
			var historyArr = store.get(storeID);

			//重新生成存储对象，整理数据，仅保存value对象
			var historyPersonArr = [];
			for(var pI=0; pI<resultPersonArr.length; pI++){
				historyPersonArr.push(resultPersonArr[pI][config.personAjax.idIndex]);
			}

			var historyGroupArr = [];
			for(var gI=0; gI<resultGroupArr.length; gI++){
				historyGroupArr.push(resultGroupArr[gI][config.groupAjax.valueField]);
			}
			
			newHistory = {};
			newHistory.person = historyPersonArr;
			newHistory.group = historyGroupArr;
			newHistory.time = new Date().getTime();
			if($.isArray(historyArr)==false){
				//如果没有，就新建
				store.set(storeID, [newHistory]);
			}else{
				//如果已经有了，先比较是否有重复的
				var isHave = -1;
				var isHaveArr = [];
				//先对新对象进行克隆排序并生成数组字符串
				var newSortPersonArr = $.extend([],historyPersonArr);
				newSortPersonArr.sort();
				var newSortPersonStr = newSortPersonArr.join('');

				var newSortGroupArr = $.extend([],historyGroupArr);
				newSortGroupArr.sort();
				var newSortGroupStr = newSortGroupArr.join('');

				for(var hI=0; hI<historyArr.length; hI++){
					//储存的人员列表，先克隆，再转字符串
					var sortPersonArr = $.extend([],historyArr[hI].person);
					sortPersonArr.sort();
					var sortPersonStr = sortPersonArr.length>0?sortPersonArr.join(''):'';

					//储存的组织列表，先克隆，再转字符串
					var sortGroupArr = $.extend([],historyArr[hI].group);
					sortGroupArr.sort();
					var sortGroupStr = sortGroupArr.join('');

					if(sortPersonStr == newSortPersonStr && sortGroupStr == newSortGroupStr){
						isHave = hI;
						isHaveArr.push(hI);
					}
				}

				if(isHave!=-1){
					//已经存在 更新日期和顺序即可，先挪出去，然后再添加
					historyArr.splice(isHave,1)
				}
				if(historyArr.length>=10){
					historyArr.splice(9,1);
				}
				historyArr.unshift(newHistory);
				store.set(storeID, historyArr);
			}
		}
	}
	//输入框按下事件
	function inputKeyupHandler(ev){
		var isUseListData = false;
		if(inputValue == $.trim($input.val())){
			//如果相等则不用重新搜索
			isUseListData = true;
		}else{
			inputValue = $.trim($input.val());
		}
		switch(planeIndex){
			//1是person 2是group 3是history,0是关闭
			case 0:
			case 1:
			case 3:
				//关闭状态下默认搜索人员
				if(!isUseListData){
					personListArr = searchPersonValue(inputValue);
					refreshPersonPlane(true);
					if(planeIndex!=1){
						changePlaneState('person');
					}
				}
				break;
		}
	}
	//翻页
	function toPage(pageNum) {
		if(pageNum>Math.ceil(personListArr.length/10)-1){
			nsalert('已经是最后一页了');
		}else if(pageNum<0){
			nsalert('已经是第一页了');
		}else{
			refreshPersonPlane(true, pageNum);
			pageID = pageNum;
		}
	}
	//搜索字符串，返回值为包含value的数组
	function searchPersonValue(value){
		var arr = [];
		if(value!=''){
			for(var personI = 0; personI<personArr.length; personI++){
				var isInRusult = false;
				for(var dsI=0; dsI<config.personAjax.dataSearch.length; dsI++){
					var dataValue = personArr[personI][config.personAjax.dataSearch[dsI]];
					if(typeof(dataValue)!='string'){
						dataValue = dataValue.toString();
					}
					dataValue = dataValue.toLocaleUpperCase();
					value = value.toLocaleUpperCase();
					if(dataValue.indexOf(value)>-1){
						isInRusult = true;
					}
				}
				if(isInRusult){
					arr.push(personArr[personI]);
				}
			}
		}else{
			arr = personArr;
		}
		pageID = 0;
		return arr;
	}
	//改变面板 修改状态并判断显示结果
	function changePlaneState(planeName){
		var isNeedEditClass = false;
		switch(planeName){
			case 'person':
				planeIndex = 1;
				if(!$personPlane.hasClass('show')){
					$contentPlanes.filter('.show').removeClass('show');
					$personPlane.addClass('show');
					//修改按钮状态
					$inputBtns.filter('.current').removeClass('current');
					$personBtn.addClass('current');

					refreshPersonPlane();
				}
				break;
			case 'group':
				planeIndex = 2;
				if(!$groupPlane.hasClass('show')){
					$contentPlanes.filter('.show').removeClass('show');
					$groupPlane.addClass('show');
					$inputBtns.filter('.current').removeClass('current');
					$groupBtn.addClass('current');
					if(!$.isEmptyObject(currentGroupNode)){
						refreshGroupPersonPlane(currentGroupNode.groupID, currentGroupNode.treeNode, currentGroupNode.start, currentGroupNode.isCheck);
					}
					
				}
				break;
			case 'histry':
				planeIndex = 3;
				if(!$historyPlane.hasClass('show')){
					$contentPlanes.filter('.show').removeClass('show');
					$historyPlane.addClass('show');
					$inputBtns.filter('.current').removeClass('current');
					$historyBtn.addClass('current');
				}
				break;
		}
	}
	//获取整体面板HTML代码
	function getPlanesHtml(){
		var planesHtml = '';
		var personPlaneHtml = '';
		var groupPlaneHtml = '';
		var historyPlaneHtml = '';
		var resultPlaneHtml = '';

		personPlaneHtml = getPersonPlaneHtml(0);
		groupPlaneHtml = getGroupPlaneHtml();
		
		//宽度大于等于9之后，则结果面板在内部
		var planeStyle = '';
		if(config.column>=9){
			//宽度超出
			planeStyle = 'style="right:328px;"';
		}
		if(config.isUsedHistory){
			historyPlaneHtml = getHistoryPlaneHtml();
			historyPlaneHtml ='<div class="history-plane common-plane">'+historyPlaneHtml+'</div>';
		}
		planesHtml = 
			'<div class="person-select-plane" '+planeStyle+' id="'+config.planeID+'">'
				+'<div class="person-plane common-plane">'+personPlaneHtml+'</div>'
				+'<div class="group-plane common-plane">'+groupPlaneHtml+'</div>'
				+historyPlaneHtml
				+'<div class="result-plane">'+resultPlaneHtml+'</div>'
			+'</div>';
		return planesHtml;
	}
	//获取组织架构面板HTML代码
	function getGroupPlaneHtml(){
		var groupPlaneHtml = '';
		if(groupListJson==false){
			groupPlaneHtml = getLoadingHtml();
			setTimeout(groupDataAjax,200)
		}else{
			groupPlaneHtml = 
				'<div class="tree-plane">'
					+'<ul id="'+config.id+'-treeul'+'" class="ztree"></ul>'
				+'</div>'
				+'<div class="group-person-plane">'
				+'</div>'
		}
		return groupPlaneHtml;
	}
	//获取人员列表面板HTML代码
	function getPersonPlaneHtml(pageNum){
		var personPlaneHtml = '';
		if(personListArr.length==0){
			personPlaneHtml = getErrorHtml('不能获取人员信息');
		}else if(personListArr==false){
			personPlaneHtml = getLoadingHtml();
			setTimeout(personDataInit,200);
		}else{
			//判断是否超出长度
			var start = 0;
			var end = 10;

			var emptyStart = 0;
			var emptyEnd = 0;
			var isHaveEmpty = false;
			if(typeof(pageNum)=='undefined'){
				pageNum = pageID;
			}
			if(typeof(pageNum)=='number'){
				start = pageNum*10;
				end = start+10;
				if(end>personListArr.length){
					//不够10条，用空数据拼接
					isHaveEmpty = true;
					emptyStart = personListArr.length;
					emptyEnd = end;
					end = personListArr.length;
				}
			}
			for(var plI = start; plI<end; plI++ ){
				personPlaneHtml+=getPersonPlaneLiHtml(personListArr[plI],plI);
			}
			if(isHaveEmpty){
				for(var pleI = emptyStart; pleI<emptyEnd; pleI++ ){
					personPlaneHtml+=getPersonPlaneLiHtml('',pleI);
				}
			}
			
			personPlaneHtml =  personPlaneHtml +getPersonPlaneTfootHtml(personListArr,start);
		}
		return personPlaneHtml;
	}
	function getPersonPlaneTfootHtml(personListArr,start){
		var footHtml = ''
		for(var ctI=0; ctI<config.personAjax.columnTitle.length; ctI++){
			var textStr = config.personAjax.columnTitle[ctI];
			var width = config.personAjax.columnWidth[ctI];
			footHtml+='<span style="width:'+width+'">'+textStr+'</span>';
		}
		footHtml = '<div class="plane-content plane-title"><span>&nbsp;</span>'+footHtml+'</div>';
		footHtml += getStateHtml(personListArr,start);

		return footHtml;
	}
	function getPersonPlaneLiHtml(array,index){
		var liHtml = '';
		for(var cdI=0; cdI<config.personAjax.columnData.length; cdI++){
			var textStr = array==''?'':array[config.personAjax.columnData[cdI]];
			var width = config.personAjax.columnWidth[cdI];
			if(inputValue!=''){
				if(typeof(textStr)!='string'){
					textStr = textStr.toString();
				}
				if(textStr.indexOf(inputValue)>-1){
					textStr = textStr.substring(0,textStr.indexOf(inputValue))+'<b>'+inputValue+'</b>'+textStr.substring(textStr.indexOf(inputValue)+inputValue.length, textStr.length);
				}
			}
			liHtml += '<span style="width:'+width+'">'+textStr+'</span>';
		}
		var valueStr = array[1];
		var currentCls = ''
		if(array!=''){
			if(array[config.mark].isInRusult){
				currentCls = ' disabled';
			}
		}else{
			currentCls = ' empty';
		}
		liHtml = 
			'<div class="plane-content'+currentCls+'" ns-psvalue="'+valueStr+'" ns-psindex="'+array[0]+'">'
				+'<a href="javascript:void(0);">'
				+'<span>'+(index+1)+'</span>'
				+liHtml
				+'</a>'
			+'</div>'
		return liHtml;
	}
	function refreshPersonPlane(isSetCurrent,pageNum){
		//isSetCurrent 是否设置默认选中第一条
		$personPlane.html(getPersonPlaneHtml(pageNum));
		$personPlane.find('.state .page span.able').on('click',function(ev){
			var value = $(this).attr('ns-psvalue');
			if(value=='+1'){
				toPage(pageID+1);
			}else if(value == '-1'){
				toPage(pageID-1);
			}

		});
		var isInputFocus = $input.is(':focus');
		if(isInputFocus){
			$personPlane.children('[class="plane-content"]').eq(0).addClass('current');
		}
		$personPlane.children('.plane-content').not('.empty').not('.disabled').on('click',function(ev){
			var arrIndex = parseInt($(this).attr('ns-psindex'));
			addPerson(arrIndex);
		})
	}
	//获取历史记录面板
	function getHistoryPlaneHtml(){
		var html = '';
		var emptyHtml = 
			'<div class="empty">'
				+'<i class="fa fa-history" aria-hidden="true"></i>'
				+'<p>您还没有保存过历史记录，系统会自动为您保存最近的十条记录</p>'
			+'</div>'
		if(personArr==false){
			//人员数据未载入，无法获取历史记录信息详细
			html = getLoadingHtml();
		}else{
			if($.isArray(historyListArr)){
				if(historyListArr.length>0){
					//列出历史记录
					for(var i=0; i<historyListArr.length; i++){
						html+=getHistoryPlaneLiHtml(historyListArr[i],i);
					}
					
					html = '<div class="plane-content-list">'+html+'</div>';
					html +=
						'<div class="plane-content-info">'
							+'<p>最多保存10条历史记录，当前共'+historyListArr.length+'条</p>'
						+'</div>'
				}else{
					//没有历史记录
					html = emptyHtml;
				}
			}else{
				//没有历史记录
				html = emptyHtml;
			}
		}
		return html;
	}
	function getHistoryPlaneLiHtml(obj,index){
		var liHtml = '';
		var histryPersonArr = [];
		for(var pI=0; pI<obj.person.length; pI++){
			var isHave = false;
			for(var prI=0; prI<personArr.length; prI++ ){
				var isInPersonArr = false;
				if(personArr[prI][config.personAjax.idIndex]==obj.person[pI]){
					isHave = true;
					histryPersonArr.push(personArr[prI]);
				}
			}
			if(isHave==false){
				histryPersonArr.push('');
			}
		}
		var nameStr = '';
		for(var hI = 0; hI<histryPersonArr.length; hI++){
			if(histryPersonArr[hI]==''){
				nameStr += '<b style="color:#ff0000; font-weight:normal;">未识别</b> ';
			}else{
				nameStr += histryPersonArr[hI][config.personAjax.nameIndex]+' ';
			}
		}
		
		var clearHistryPersonArr = [];
		for(var hI2=0; hI2<histryPersonArr.length; hI2++){
			if(histryPersonArr[hI2]!=''){
				clearHistryPersonArr.push(histryPersonArr[hI2]);
			}
		}
		var histryObj = {};
		histryObj.person = clearHistryPersonArr;
		historyDataArr.push(histryObj);
		var timeStr = obj.time;
		timeStr = moment(timeStr).format('YYYY-MM-DD HH:mm:ss');

		liHtml += '<span class="name" >'+'<i class="personNum">'+obj.person.length+'</i>'+nameStr+'</span>';
		liHtml += '<span class="time" >'+timeStr+'</span>';
		var currentCls = ''
		if(obj==''){
			currentCls = ' empty';
		}
		liHtml = 
			'<div class="plane-content'+currentCls+'" ns-psvalue="'+index+'" ns-psindex="'+index+'">'
				+'<a href="javascript:void(0);">'
				+'<span>'+(index+1)+'</span>'
				+liHtml
				+'</a>'
			+'</div>'
		return liHtml;
	}
	function refreshHistoryPlane(){
		$historyPlane.html(getHistoryPlaneHtml());
		$historyPlane.children('.plane-content-list').children('.plane-content').on('click',function(ev){
			var index = parseInt($(this).attr('ns-psvalue'));
			for(var i=0; i<historyDataArr[index].person.length; i++){
				addPerson(historyDataArr[index].person[i][0]);
			}

		})
	}
	//返回错误代码
	function getErrorHtml(errorStr){
		var errorHtml = '<div class="has-error"><p class="tips">'+errorStr+'</p></div>';
		return errorHtml;
	}
	//返回加载中代码
	function getLoadingHtml(errorStr){
		var loadingHtml = 
				'<div class="loading">'
					+'<i class="fa fa-refresh fa-spin"></i>'
					+'<p>正在加载...</p>'
				+'</div>'
		return loadingHtml;
	}
	//人员列表数据初始化
	function personDataInit(){
		//choseInputID,employAjax
		var localDataConfig = config.personAjax.localDataConfig;
		var columnNum = 0; 		//统计列显示列数量
		var columnTitle = [];	//存放配置中有设置显示标题的
		var columnType = [];	//存放配置中有设置显示类型的
		var columnData = [];	//拼接可显示的数组下标
		var columnWidth = [];	//存放配置中可显示标题列宽度
		var dataSearch = [];	//存放配置列中设置了允许搜索的下标
		var dataKey = [];		//拼接数组id字段
		var dataTitle = [];		//给所有的配置列添加标题
		var autoWidthColumnNum = 0   	//自动计算的列数量
		var autoWidthColumnTotal = 0	//自动计算的列宽度 百分比
		var groupIndex = -1; 	//判断该列是否是部门id
		var nameIndex = -1;  	//是不是姓名
		var idIndex = 1;		//是不是ID
		for(var col = 0; col < localDataConfig.length; col ++){
			//如果存在显示列标题，则记录下来显示列顺序下标
			if(localDataConfig[col].visible){
				columnData[localDataConfig[col].visible-1] = col;
				columnNum++;
			}
			var columnSearch = typeof(localDataConfig[col].search) == 'undefined' ?false:localDataConfig[col].search;
			if(columnSearch){
				dataSearch.push(col);
			}
			if(localDataConfig[col].key){
				dataKey.push(localDataConfig[col].key);
			}else{
				dataKey.push(-1);
			}
			if(localDataConfig[col].title){
				dataTitle.push(localDataConfig[col].title);
			}else{
				dataTitle.push('');
			}
			var isDepart = typeof(localDataConfig[col].isDepart) == 'undefined'?false:localDataConfig[col].isDepart;
			if(isDepart){
				groupIndex = col;
			}
			var isName = typeof(localDataConfig[col].isName) == 'undefined'?false:localDataConfig[col].isName;
			if(isName){
				nameIndex = col;
			}
			var isID = typeof(localDataConfig[col].isID) == 'undefined'?false:localDataConfig[col].isID;
			if(isID){
				idIndex = col;
			}
		}
		for(var colI = 0; colI < columnData.length; colI ++){
			var currentData = localDataConfig[columnData[colI]];//读取是第几列
			columnTitle.push(currentData.title);
			columnType.push(currentData.type);
			//判断当前显示列是否设置了宽度
			if(typeof(currentData.width)=='undefined'){
				autoWidthColumnNum++;
			}else if(typeof(currentData.width)=='number'){
				autoWidthColumnTotal+=currentData.width;
			}else{
				nsalert('宽度参数错误','error');
			}
			columnWidth.push(currentData.width);
		}
		//计算列宽
		if(autoWidthColumnNum>0){
			if(autoWidthColumnTotal<=100){
				var columnWidthStr = parseInt(((100-autoWidthColumnTotal)/autoWidthColumnNum)*1000)/1000+'%';
				for(var i=0; i<columnWidth.length; i++){
					if(typeof(columnWidth[i])=='undefined'){
						columnWidth[i] = columnWidthStr;
					}else{
						columnWidth[i] = columnWidth[i]+'%';
					}
				}
			}else{
				nsalert('宽度设置错误，请设置为数字，总和不大于100');
			}
		}

		config.personAjax.columnData  = columnData;			//显示列数据
		config.personAjax.columnType  = columnType; 		//显示列类型
		config.personAjax.columnNum   = columnNum; 			//列数量
		config.personAjax.columnWidth = columnWidth; 		//列宽
		config.personAjax.columnTitle = columnTitle; 		//标题数组

		config.personAjax.groupIndex  = groupIndex; 		//部门id的列下标
		config.personAjax.nameIndex   = nameIndex; 			//人员姓名的列下标
		config.personAjax.idIndex     = idIndex; 			//ID的列下标
		config.personAjax.dataSearch  = dataSearch;			//可以搜索的数组
		config.personAjax.dataKey     = dataKey; 			//key 每个数据对象都有 没有的是-1
		config.personAjax.dataTitle   = dataTitle; 			//标题 每个数据对象都有 没有的是''

		if(personListArr==false){
			personDataAjax();
		}
	}
	//人员列表数据Ajax，先初始化后发送ajax
	function personDataAjax(){
		var employData = typeof(config.personAjax.data) == 'undefined' ?'':config.personAjax.data;
		var employType = typeof(config.personAjax.type) == 'undefined' ?'POST':config.personAjax.type;
		$.ajax({
			url:			config.personAjax.url,	
			data:			employData,
			type:			employType,
			dataType: 		"json",
			success: function(data){
				if(data.success){
					personArr = data[config.personAjax.dataSrc];
					//如果value赋值了，添加选中人
					var valueArr = config.value;
					resetPersonAndValue(config.value);
					refreshPersonPlane(false,0)
					//如果没有外部传入的历史记录，那么就读取本地存储的
					if(config.isUsedHistory){
						if(historyListArr==false){
							var storeID = 'person-select-'+config.id;
							historyListArr = store.get(storeID);
						}
						refreshHistoryPlane();
					}
					
				}else{
					var errorHtml = getErrorHtml(data.msg);
					$personPlane.html(errorHtml);
				}
			}
		})
	}
	function resetPersonAndValue(valueArr){
		//是否需要value赋值 如果是空，也不需要
		var isHaveValue = $.isArray(valueArr);
		resultPersonArr = [];
		if(isHaveValue){
			if(valueArr.length<=0){
				isHaveValue = false;
			}
		}

		if(personArr.length>0){
			config.mark = personArr[0].length; //配置对象的下标,附加了一个object对象
		}
		for(var i=0; i<personArr.length; i++){
			var settingObj = {};
			//是否应该进行value赋值
			if(isHaveValue){
				var isInRusult = false;
				for(var valueI=0; valueI<valueArr.length; valueI++){
					if(personArr[i][config.personAjax.idIndex]==valueArr[valueI]){
						isInRusult = true;
						
					}
				}
				//给原始数组添加一个状态对象{isInRusult:false}
				settingObj.isInRusult = isInRusult;
				personArr[i].push(settingObj);
				if(isInRusult){
					resultPersonArr.push(personArr[i]);
				}

			}else{
				settingObj.isInRusult = false;
				personArr[i].push(settingObj);
			}
			
		}
		
		config.personAjax.personData = personArr;
		personListArr = personArr;

		
		// if(isNeedSearch==false&&hasValue){
		// 	//如果value赋值是数组，则直接修改数据
		// 	for(var valueI=0; valueI<valueArr.length; valueI++){
		// 		personArr[valueArr[valueI][0]][config.mark].isInRusult = true;
		// 		resultPersonArr.push(valueArr[valueI]);
		// 	}
		// }
		// if(isHaveValue){
		// 	$input.val('');
		// 	inputMaskSetBlur();
		// }
		refreshResultPlane();
	}
	//添加人员
	function addPerson(index) {
		//打上标签
		if(personArr[index][config.mark].isInRusult!=true){
			resultPersonArr.push(personArr[index]);
			personArr[index][config.mark].isInRusult = true;
			if(personArr[index][config.mark].isInChecked==true){
				personArr[index][config.mark].isInChecked = false;
			}
			refreshPersonPlane(true);
			refreshResultPlane();
		}else{
			//已经选中了
		}
	}
	//刷新输入框

	//刷新结果面板
	function getResultPlaneHtml() {
		var html = ''
		if(resultPersonArr.length==0){
			html = '<div class="empty">还没有选择人员</div>';
		}else{
			for(var personI=0; personI<resultPersonArr.length; personI++){
				html += 
					'<span class="person-label" ns-psindex="'+resultPersonArr[personI][0]+'">'
						+resultPersonArr[personI][config.personAjax.nameIndex]
						+'<a href="javascript:void(0);" class="close"></a>'
					+'</span>'
			}
		}
		var confirmBtnCls = 'btn-success'
		if(resultPersonArr<=0){
			confirmBtnCls = 'btn-gray'
		}
		html += '<div class="btn-plane">'
					+'<button type="button" class="btn '+confirmBtnCls+'" ns-psvalue="confirm">确定</button>'
					+'<button type="button" class="btn btn-white" ns-psvalue="cancel">取消</button>'
				+'</div>'
		return html;
	}
	function refreshResultPlane(){
		//刷新结果面板
		$resultPlane.html(getResultPlaneHtml());
		$resultPlane.children('.person-label').on('click',function(ev){
			var index = parseInt($(this).attr('ns-psindex'));
			resultPlaneRemove(index);
		});
		$resultPlane.find('.btn-plane .btn').on('click',function(ev){
			var value = $(this).attr('ns-psvalue');
			if(value=='cancel'){
				closePlane();
			}else if(value=='confirm'){
				if($(this).attr('class').indexOf('success')>-1){
					confirmComplete();
				}else{
					nsalert('您还没有选择人员','warning');
				}
			}
		})
		//刷新输入框蒙版
		var inputMaskHtml = getInputMaskHtml();
		if($input.parent().children('.person-select-inputmask').length==0){
			//如果不使用历史记录，则输入结果距离右边是68，否则是默认的98
			var style = '';
			if(config.isUsedHistory==false){
				style = ' style="right:68px"';
			}
			$input.after('<div class="person-select-inputmask"'+style+'></div>');
			$inputMask = $input.parent().children('.person-select-inputmask');
		}
		$inputMask.html(inputMaskHtml);
		$inputMaskClose = $inputMask.children('a.close');
		$inputMaskClose.on('click',function(ev){
			resultPlaneRemoveAll();
		})
	}
	//删除结果
	function resultPlaneRemove(index){
		personArr[index][config.mark].isInRusult = false;
		//$personPlane.children('.plane-content.disabled[ns-psindex="'+index+'"]')
		for(var i=0; i<resultPersonArr.length; i++){
			if(personArr[index]==resultPersonArr[i]){
				resultPersonArr.splice(i,1);
			}
		}
		refreshResultPlane();
		if(planeIndex==1){
			refreshPersonPlane();
		}else if(planeIndex==2){
			$groupPlane.find('.curSelectedNode').click();
		}
	}
	function resultPlaneRemoveAll(){
		for(var i=0; i<resultPersonArr.length; i++){
			personArr[resultPersonArr[i][0]][config.mark].isInRusult = false;
		}
		resultPersonArr = [];
		config.resultPersonArr = resultPersonArr;
		refreshResultPlane();
		if(planeIndex==1){
			refreshPersonPlane();
		}
		currentGroupNode = {};
		personSelectTree.destroy();
		personSelectTree = undefined;
		return true;
	}
	function getInputMaskHtml(){
		var nameStr = '';
		if(resultPersonArr.length==0){
			nameStr = '';
		}else if(resultPersonArr.length==1){
			nameStr = resultPersonArr[0][config.personAjax.nameIndex];
			nameStr = '<span class="name">'+nameStr+'</span>';
		}else{
			nameStr = resultPersonArr[0][config.personAjax.nameIndex];
			nameStr +='、';
			nameStr +=resultPersonArr[1][config.personAjax.nameIndex];
			if(resultPersonArr.length>2){
				nameStr += '等';
			}
			nameStr = '<span class="name">'+nameStr+'</span>';
		}
		var inputMaskHtml = 
				nameStr
				+'<span style="display: inline;">共'+resultPersonArr.length+'人</span>'
				+'<a class="close" id="close" style="display: inline;"></a>';
		if(resultPersonArr.length==0){
			inputMaskHtml = '';
		}
		return inputMaskHtml;
	}
	//组织架构AJAx
	function groupDataAjax(){
		var deptData = typeof(config.groupAjax.data) == 'undefined' ?'':config.groupAjax.data;
		var deptType = typeof(config.groupAjax.type) == 'undefined' ?'POST':config.groupAjax.type;
		$.ajax({
			url:			config.groupAjax.url,	
			data:			deptData,
			type:			deptType,
			dataType: 		"json",
			success: function(data){
				if(data.success){
					groupJson = groupDataInit(data[config.groupAjax.dataSrc]);
					groupListJson = groupJson;
					treeSettingInit();
					$groupPlane.html(getGroupPlaneHtml());  //清理掉loading
					$groupPersonPlane = $("#"+config.planeID+' .group-plane .group-person-plane');
					$groupPersonPlaneAdd = $groupPersonPlane.find('.group-person-select-button');
					if(planeIndex == 2){
						groupPlaneShow();
					}
				}
			}
		})
	}
	function groupDataInit(data) {
		//添加根节点
		var rootNodes = {};
		rootNodes.name = '全部';
		rootNodes[config.groupAjax.textField] = '全部';
		rootNodes.id= '-1';
		rootNodes[config.groupAjax.valueField] = '-1';
		rootNodes.open = true;
		rootNodes.children = data;

		function resetData(children){
			for(var i = 0; i<children.length; i++){
				var ishavechild = children[i]["children"];
				var ishavechildBool = true;
				if(Number(ishavechild) == 0){
					ishavechildBool = false;
				}else if(ishavechild == null){
					ishavechildBool = false;
				}
				children[i].isParent = ishavechildBool;
				children[i].name = children[i][config.groupAjax.textField];
				children[i].id = children[i][config.groupAjax.valueField];
				if(ishavechildBool){
					resetData(children[i].children);
				}
			}
		}
		resetData(rootNodes.children);
		return rootNodes;
	}
	function treeSettingInit() {
		//设置tree对象
		config.treeSetting = {
			data: {
				simpleData: {
					enable: true,
				}
			},
			check:{
				enable: true,
				chkboxType: { "Y": "s", "N": "s" }
			},
			view: {
				expandSpeed: ""
			},
			callback: {
				onClick: treeClickHandler,
				onCheck: treeCheckHandler
			}
		}
	}
	//显示组织架构模板内容
	function groupPlaneShow(){
		if(typeof(personSelectTree)=='undefined'){
			personSelectTree = $.fn.zTree.init($('#'+config.id+'-treeul'), config.treeSetting, groupListJson);
			var rootTreeNode = personSelectTree.getNodeByTId('personSelect-treeul_1');
			currentGroupNode = {
				groupID:'-1',
				treeNode:rootTreeNode,
				start:0,
				isCheck:undefined
			}
			personSelectTree.selectNode(rootTreeNode);
			refreshGroupPersonPlane(currentGroupNode.groupID, currentGroupNode.treeNode, currentGroupNode.start, currentGroupNode.isCheck);

		}
		
	}
	//点击部门 treeClick事件
	function treeClickHandler(event,treeId,treeNode,clickFlag){
		var groupID = treeNode[config.groupAjax.valueField];
		refreshGroupPersonPlane(groupID,treeNode,0);
	}
	//选择部门 treeSelect事件
	function treeCheckHandler(event,treeId,treeNode){
		var groupID = treeNode[config.groupAjax.valueField];
		if(treeNode.checked){
			//选中
			for(var personI=0; personI<personArr.length; personI++){
				if(personArr[personI][config.personAjax.groupIndex] == groupID){
					addPerson(personI);
				}
			}
		}else{
			//取消选中
			var tempRemoveArr = resultPersonArr.concat();
			for(var resultPersonI=0; resultPersonI<tempRemoveArr.length; resultPersonI++){
				if(tempRemoveArr[resultPersonI][config.personAjax.groupIndex] == groupID){
					resultPlaneRemove(tempRemoveArr[resultPersonI][0]);
				}
			}
		}
		personSelectTree.selectNode(treeNode);
		refreshGroupPersonPlane(groupID,treeNode,0);
	}
	function refreshGroupPersonPlane(groupID,treeNode,start,isCheck){
		//储存当前的临时数据
		currentGroupNode = {
			groupID:groupID,
			treeNode:treeNode,
			start:start,
			isCheck:isCheck
		}
		if(typeof(groupID)!='string'){
			groupID = groupID.toString();
		}
		var groupPersonArr = [];
		for(var personI = 0 ; personI<personArr.length; personI++){
			if(personArr[personI][config.personAjax.groupIndex]==groupID){
				groupPersonArr.push(personArr[personI]);
				if(typeof(isCheck) == 'boolean'){
					personArr[personI][config.mark].isInChecked = isCheck;
				}
				if(personArr[personI][config.mark].isInChecked==true){
					isNeedAdd = true;
				}
			}
		}
		var html = getGroupPersonHtml(groupPersonArr,treeNode,start);
		$groupPersonPlane.html(html);
		$groupPersonPlaneAdd = $groupPersonPlane.find('.group-person-select-button');
		
		$groupPersonPlane.children('.group-person-list').children('.plane-content').not('.disabled').on('click',function(ev){
			var $checkedLi = $(this);
			var index = parseInt($checkedLi.attr('ns-psindex'));
			groupPersonConfirm(index);
			//原来支持单击选择，双击确定的代码
			//var timeStamp = new Date().getTime();
			// if(typeof($checkedLi.attr('ns-timestamp'))!='undefined'){
			// 	var checkedTimeStamp = parseInt( $checkedLi.attr('ns-timestamp') );
			// 	if(timeStamp - checkedTimeStamp>500){
			// 		//时间超出半秒钟，就是改变状态操作
			// 		if($checkedLi.hasClass('checked')){
			// 			groupPersonCancel(index)
			// 		}else{
			// 			groupPersonChecked(index)
			// 		}
			// 	}else{
			// 		//小于500毫秒，是一个双击动作，就是确认操作
			// 		groupPersonConfirm(index);
			// 	}
			// }else{
			// 	//选中
			// 	groupPersonChecked(index);
			// }
			// $checkedLi.attr('ns-timestamp',timeStamp);
			// var checkedNum = $groupPersonPlane.children('.group-person-list').children('.checked').length;
			// if(checkedNum>0){
			// 	$groupPersonPlaneAdd.addClass('able');
			// }else{
			// 	$groupPersonPlaneAdd.removeClass('able');
			// }
		});
		//批量添加人员按钮
		$groupPersonPlaneAdd.on('click',function(ev){
			if($(this).hasClass('able')){
				var checkedArr = $groupPersonPlane.children('.group-person-list').children('.checked');
				for(var i=0; i<checkedArr.length; i++){
					var index = parseInt(checkedArr.eq(i).attr('ns-psindex'));
					groupPersonConfirm(index);
				}
			}
		});
		//组织结构面板翻页按钮
		var $groupPersonPlaneChangePage = $groupPersonPlane.children('.state').children('.page').children('span.able');
		$groupPersonPlaneChangePage.on('click',function(ev){
			var toPageNumber = $(this).attr('ns-psvalue');
			if(toPageNumber=='+1'){
				toPageNumber = start + 10;
			}else if(toPageNumber=='-1'){
				toPageNumber = start - 10;
			}
			refreshGroupPersonPlane(groupID,treeNode,toPageNumber);
		})
	}
	//群组人员面板-确认操作
	function groupPersonConfirm(index){
		var $checkedLi = $groupPersonPlane.find('[ns-psindex="'+index+'"]');
		$checkedLi.removeClass('checked');
		$checkedLi.addClass('disabled');
		$checkedLi.off('click');
		addPerson(index);
	}
	//群组人员面板-选中操作
	function groupPersonChecked(index){
		var $checkedLi = $groupPersonPlane.find('[ns-psindex="'+index+'"]');
		personArr[index][config.mark].isInChecked = true;
		$checkedLi.addClass('checked');
	}
	//群组人员面板-取消选中操作
	function groupPersonCancel(index){
		var $checkedLi = $groupPersonPlane.find('[ns-psindex="'+index+'"]');
		personArr[index][config.mark].isInChecked = false;
		$checkedLi.removeClass('checked');
	}
	//群组人员面板-获取人员列表及面板翻页按钮
	function getGroupPersonHtml(groupPersonArr, treeNode, start){
		var html = '';
		var isNeedAdd = false;
		if(groupPersonArr.length>0){
			var end = start+10;
			if(end>groupPersonArr.length){
				end = groupPersonArr.length;
			}
			for(var i=start; i<end; i++){
				var cls = ''
				if(groupPersonArr[i][config.mark].isInRusult){
					cls =' disabled';
				}else if(groupPersonArr[i][config.mark].isInChecked){
					cls =' checked';
					if(groupPersonArr[i][config.mark].isInRusult==false){
						isNeedAdd = true;
					}
				}

				html += 
					'<div class="plane-content '+cls+'" ns-psindex="'+groupPersonArr[i][0]+'">'
						+'<a href="javascript:void(0);">'
							+'<span>'+(i+1)+'</span>'
							+'<span>'+groupPersonArr[i][config.personAjax.nameIndex]+'</span>'
						+'</a>'
					+'</div>'
			}
		}
		html = 
		'<div class="group-person-list">'
			+'<div class="plane-content plane-title">'
				+'<span>'+treeNode[config.groupAjax.textField]+'</span>'
			+'</div>'
			+html
		+'</div>'
		var stateHtml = getStateHtml(groupPersonArr,start);
		//btnHtml是最后的批量添加，已经暂时不用了。
		// var btnHtml = '';
		// if(groupPersonArr.length>0){
		// 	var ableCls = ''
		// 	if(isNeedAdd){
		// 		ableCls = ' able'
		// 	}
		// 	btnHtml = '<button type="button" class="btn btn-white group-person-select-button'+ableCls+'"><i class="fa fa-arrow-circle-right"></i></button>';	
		// }
		// html = html + stateHtml + btnHtml;
		html = html + stateHtml;
		return html;
	}
	//获取状态栏代码
	function getStateHtml(array,start){
		var stateHtml = '';
		if(array.length>0){
			var pervCls = 'able';
			var nextCls = 'able';
			var end = start+10;
			if(end>array.length){
				end = array.length-1;
			}
			if(start==0){
				pervCls = 'disabled';
			}
			if(end==(array.length-1)){
				nextCls = 'disabled';
			}
			var currentPage = start/10+1;
			var totalPage = Math.ceil(array.length/10);
			stateHtml = 
				'<div class="state">'
					+'<div class="page">'
						+'<span class="'+pervCls+'" ns-psvalue="-1"><i class="fa fa-angle-left" aria-hidden="true"></i></span>'
						+'<span>'+currentPage+'/'+totalPage+'</span>'
						+'<span class="'+nextCls+'" ns-psvalue="+1"><i class="fa fa-angle-right" aria-hidden="true"></i></span>'
					+'</div>'
					+'<span>共：'+array.length+'条</span>'
				+'</div>'
		}else{
			stateHtml = '<div class="state-empty">没有数据</div>';
		}
		return stateHtml;
	}
	//验证是否合法
	function isValid(config){
		var returnValue = true;
		if(config.sRules){
			var errorStr = ''
			if(config.sRules.indexOf('required')>-1){
				//是否必填 required
				returnValue = config.resultPersonArr.length>0
				errorStr = '必填';
			}
			if(config.sRules.indexOf('range')>-1){
				//区域 range:[5,10]
				var validStr = config.sRules.substring(config.sRules.indexOf('range'),config.sRules.length);
				if(validStr.indexOf(' ')>-1){
					validStr = validStr.substring(validStr.indexOf('range'),validStr.indexOf(' '));
				}
				var firstNum = validStr.substring(validStr.indexOf('[')+1,validStr.indexOf(','));
				firstNum = parseInt(firstNum);
				var secondNum = validStr.substring(validStr.indexOf(',')+1,validStr.indexOf(']'));
				secondNum = parseInt(secondNum);
				if(config.resultPersonArr.length>=firstNum&&config.resultPersonArr.length<=secondNum){
					
				}else{
					returnValue = false;
					errorStr = '有效数量是'+firstNum+'到'+secondNum+'个';
				}
			}
			if(config.sRules.indexOf('max')>-1){
				//最大值 max:5
				var maxNum = nsVals.getRuleNumber(config.sRules,'max');
				if(config.resultPersonArr.length>maxNum){
					returnValue = false;
					errorStr = '最大数量是'+maxNum+'个';
				}
			}

		}
		
		if(returnValue == false){
			var style = '';
			if(config.isUsedHistory==false){
				//是否有历史记录显示按钮
				style = 'style="right:98px;"';
			}else{
				style = 'style="right:128px;"';
			}
			var errorHtml = '<label class="has-error" '+style+'>'+errorStr+'</label>';
			$input.after(errorHtml);
		}
		return returnValue;
	}
	function getData(argument) {
		// body...
	}
	// 清除数据，以便重新初始化
	function resetVals() {
		data = undefined;
		$input = undefined;
		$personBtn = undefined;
		$groupBtn = undefined;
		$historyBtn = undefined;
		$planes = undefined;
		$contentPlanes = undefined;
		$personPlane = undefined;
		$groupPlane = undefined;
		$groupPersonPlane = undefined;
		$groupPersonPlaneAdd = undefined;
		$historyPlane = undefined;
		$resultPlane = undefined;
		$inputMask = undefined;
		$inputMaskClose = undefined;

		personArr = [];
		personListArr = [];
		groupJson = [];
		groupListJson = [];
		historyListArr = [];
		historyDataArr = [];
		resultPersonArr = [];
		resultGroupArr = [];

		inputValue = '';
		planeIndex = undefined;
		pageID = undefined;
		config = undefined;
		isShow = false;
	}
	function reset() {
		resultPlaneRemoveAll();
		resetVals();
	}
	//赋值，调用表单或者组件的setValues或者
	function setValue(setValuesArr){
		//setValuesArr:[1,2]或者['12','13']，里面是已经加载完的的person id
		console.log(setValuesArr);
		resetPersonAndValue(setValuesArr);
	}
	return {
		init:init,  				//初始化方法
		isValid:isValid, 			//验证规则
		clear:resultPlaneRemoveAll, //清除
		getData:getData,
		setValue:setValue,
		reset:reset
	}
})(jQuery);
/********************************************************************
 * 定制组件 左侧树右侧项目选择器
 */
nsUI.projectAndTree = (function($) {
	var config;
	var $closeBtn;
	var $cancelBtn;
	var $confirmBtn;
	//初始化，调用projectSelect和treePlane
	function init(configObj){
		if(typeof(configObj)!='object'){
			nsalert('配置参数错误','error');
			return false;
		}
		config = configObj;
		config.planeID = config.id+'-projectAndTreePlane';
		var html = getPlaneHtml();
		$('body').append(html);

		//加载项目选择器面板
		config.$container = $('#'+config.planeID+' div.container-project');
		nsUI.projectSelect.init(config);

		//添加tree
		//使用tree面板组件必须提供容器
		config.$treeContainer = config.treeAjax.$treeContainer = $('#'+config.planeID+' div.container-tree');
		if(config.treeAjax.clickCallback){
			config.treeAjax.clickHandler = treeClickHandler;
		}
		if(config.treeAjax.checkCallback){
			config.treeAjax.checkHandler = treeCheckHandler;
		}
		config.treeAjax.id = config.id;
		config.treeAjax.treeID = config.id+'-tree';
		nsUI.treePlane.init(config.treeAjax);

		//初始化按钮
		$closeBtn = $('#'+config.planeID+'>a.ps-close-btn');
		$confirmBtn =  $('#'+config.planeID+'>.ps-btn .btn-success');
		$cancelBtn = $('#'+config.planeID+'>.ps-btn .btn-white');
		
		$confirmBtn.on('click',function(ev){
			var treeStr = nsUI.treePlane.getCheckIDs(config.id);
			var treeArr = nsUI.treePlane.getCheckedData(config.id);
			var projectStr = nsUI.projectSelect.getDataIDs();
			var projectArr = nsUI.projectSelect.getData();
			var returnObj = {};
			returnObj.treeStr = treeStr;
			returnObj.treeArr = treeArr;
			returnObj.projectStr = projectStr;
			returnObj.projectArr = projectArr;

			if(typeof(config.confirmHandler)=='function'){
				config.confirmHandler(returnObj)
			}else{
				nsalert('confirmHandler参数错误，必须是function','error');
			}
		})
		$closeBtn.on('click',closePlane);
		$cancelBtn.on('click',closePlane);
	}

	//初始化整体HTML
	function getPlaneHtml(){
		var html = 
			'<div class="project-tree-plane" id="'+config.planeID+'">'
				+'<div class="title-tree">'+config.treeTitle+'： </div>'
				+'<div class="container-project"></div>'
				+'<div class="container-tree"></div>'
				+'<a class="ps-close-btn" href="javascript:void(0);">x</a>'
				+'<div class="ps-btn"><button class="btn btn-success"><i class="fa fa-check"></i> 确认</button><button class="btn btn-white">取消</button></div>'
			+'</div>';
		return html;
	}
	//关闭面板
	function closePlane(ev){
		nsUI.projectSelect.clear();
		$('#'+config.planeID).remove();
		config = undefined;
	}
	//树的单击
	function treeClickHandler(data,treeId){
		if(typeof(config.treeAjax.clickCallback)=='function'){
			config.treeAjax.clickCallback(data,treeId);
		}
	}
	//树的选中
	function treeCheckHandler(data,treeId){
		if(typeof(config.treeAjax.checkCallback)=='function'){
			config.treeAjax.checkCallback(data,treeId);
		}
	}

	return {
		init:init,
		close:closePlane
	}
})(jQuery);

/********************************************************************
 * 树面板
 */
nsUI.treePlane = (function($) {
	var config;
	var groupJson;  		//全部数据
	var groupListJson;		//显示出来的数据
	var selectData = {};
	function init(configObj){
		config = configObj;
		selectData[config.id] = {};
		treeSettingInit();
		groupDataAjax();
	}
	function getUrl(treeId, treeNode){
		var param = "parentId="+treeNode.id;
		var paramUrl = config.url;
		config.data.parentId = treeNode.id;
		return paramUrl + "?" + param;
	}
	function ajaxDataFilter(treeId, parentNode, responseData){
		var resceiveData = groupDataInit(responseData);
		return resceiveData;
	}
	function ajaxComplete(event,treeId,treeNode,msg){
		//console.log(event);
	}
	//基本配置项目初始化
	function treeSettingInit() {
		//设置tree对象
		setting = {
			data: {
				simpleData: {
					enable: true,
				}
			},
			check:{
				enable: true,
				chkboxType: { "Y": "s", "N": "s" }
			},
			view: {
				expandSpeed: ""
			},
			callback: {}
		}
		if(config.clickHandler){
			setting.callback.onClick = treeClickHandler;
		}
		if(config.checkHandler){
			setting.callback.onCheck = treeCheckHandler;
		}
		var treeAsync = config.async ? config.async : false;
		if(treeAsync){
			setting.async = {
				enable: true,
				url: getUrl,
				dataFilter: ajaxDataFilter,
				type:config.type,
			}
		}
		if(config.isCheck){
			setting.check = {
				enable: true,
				chkboxType: { "Y": "s", "N": "s" }
			}
		}
		if(config.isRadio){
			setting.check = {
				enable: true,
				chkStyle: "radio",
				radioType: "all"
			}
		}
		setting.callback.onAsyncSuccess = ajaxComplete;
		config.setting = setting;
	}
	//返回数据初始化
	function groupDataInit(data) {
		//添加根节点
		var rootNodes = {};
		rootNodes[config.textField] = '全部';
		rootNodes[config.valueField] = '-1';
		rootNodes.name = '全部';
		rootNodes.id = '-1';
		rootNodes.isParent = data.length>0;
		rootNodes.open = true;
		rootNodes.children = data;

		//递归规整数据
		function resetData(children){
			if(children){
				for(var i = 0; i<children.length; i++){
					var ishavechild = children[i][config.haschildField];
					var ishavechildBool = true;//是否含有子元素
					if(ishavechild){
						if(Number(ishavechild) == 0){
							ishavechildBool = false;
						}else if(ishavechild == null){
							ishavechildBool = false;
						}
					}else{
						if(children[i]["children"] == null){
							ishavechildBool = false;
						}else if(children[i]["children"].length == 0){
							ishavechildBool = false;
						}
					}
					children[i].isParent = ishavechildBool;
					children[i].name = children[i][config.textField];
					children[i].id = children[i][config.valueField];
					if(ishavechildBool){
						resetData(children[i].children);
					}
				}
			}
		}
		resetData(rootNodes.children);
		return rootNodes;
	}
	function groupDataAjax(){
		var groupData = typeof(config.data) == 'undefined' ?'':config.data;
		var groupType = typeof(config.type) == 'undefined' ?'POST':config.type;
		$.ajax({
			url:			config.url,	
			data:			groupData,
			type:			groupType,
			dataType: 		"json",
			success: function(data){
				if(data.success){
					var groupJson = groupDataInit(data[config.dataSrc]);
					groupListJson = groupJson;
					planeContainerInit();
					/*$groupPlane.html(getGroupPlaneHtml());  //清理掉loading
					$groupPersonPlane = $("#"+config.planeID+' .group-plane .group-person-plane');
					$groupPersonPlaneAdd = $groupPersonPlane.find('.group-person-select-button');
					if(planeIndex == 2){
						groupPlaneShow();
					}*/
				}
			}
		})
	}
	//获取树面板的基本HTML 
	//return HTML
	function planeContainerInit(){
		var html = '<ul id="'+config.treeId+'" class="ztree"></ul>'
		config.$treeContainer.html(html);
		$.fn.zTree.init($('#'+config.treeId), config.setting, groupListJson);
	}
	//click时间
	function treeClickHandler(event,treeId,treeNode,clickFlag){
		config.clickHandler(treeNode,config.id);
	}
	//check事件
	function treeCheckHandler(event,treeId,treeNode){
		if(treeNode.checked){
			//如果是选中
			selectData[config.id][treeNode.id] = treeNode;
		}else{
			//取消选中 删除数据
			if(selectData[config.id][treeNode.id]){
				delete selectData[config.id][treeNode.id];
			}
		}
		config.checkHandler(treeNode,config.id,selectData[config.id]);
	}
	//返回选中的数据
	function getCheckedData(cid){
		return selectData[cid];
	}
	//返回选中数据id的字符串，以“,”分隔，如果没有选中，则返回false
	function getCheckIDs(cid){
		var strArr = [];
		var str = '';
		if(selectData[cid]){
			$.each(selectData[cid],function(key,value){
				strArr.push(key);
			})
		}else{
			nsalert('id:'+cid+'的数据不存在','error');
		}
		//如果有数据，则去掉最后一个逗号
		if(strArr.length>0){
			strArr = strArr.sort();
			str = strArr.join(',');
		}else{
			//如果没有，返回false
			str = false;
		}
		return str;
	}
	return {
		init:init,
		getCheckedData:getCheckedData,
		getCheckIDs:getCheckIDs
	}
})(jQuery);

nsUI.chart = function(chartJson,chartDom){
	var dataSource = chartJson.data;
	var xAxisArr = [];
	var yAxisField = chartJson.yAxisField;
	var yAxisName = chartJson.yAxisName;
	var yAxisArr = [];
	for(var axisI = 0; axisI < dataSource.length; axisI ++){
		xAxisArr.push(dataSource[axisI][chartJson.xAxisField]);
	}
	if(typeof(yAxisField) == 'object'){
		for(var yAxisI = 0; yAxisI < yAxisField.length; yAxisI ++){
			var yAxisJson = {};
			yAxisJson.name = yAxisName[yAxisI];
			yAxisJson.type = chartJson.type;
			if(typeof(chartJson.yAxisStock) == 'object'){
				var yAxisStock = chartJson.yAxisStock;
				yAxisJson.stack = yAxisStock[yAxisI];
			}
			if(chartJson.yAxisWidth){
				yAxisJson.barWidth = Number(chartJson.yAxisWidth);
			}
			yAxisJson.label = {
				normal: {
					show: true,
					position: 'insideRight'
				}
			};
			yAxisJson.data = [];
			for(var axisI = 0; axisI < dataSource.length; axisI ++){
				yAxisJson.data.push(dataSource[axisI][yAxisField[yAxisI]]);
			}
			yAxisArr.push(yAxisJson);
		}
	}
	var options = {
		title: {
			text: chartJson.title,
			//textAlign:'center',
			//textBaseline:'middle'
		},
		tooltip: {},
		toolbox:{
			show: true,
			feature:{
				saveAsImage: {}
			}
		},
		legend: {
			data:yAxisName,
		},
		xAxis: {
			data: xAxisArr
		},
		yAxis: {

		},
		series: yAxisArr
	}
	// 使用刚指定的配置项和数据显示图表。
	chartDom.setOption(options);
}
var nsChartUI = {};//定义图表
nsChartUI.init = function(chartJson,chartDom){
	var dataSource = chartJson.data;
	var xAxisArr = [];
	var yAxisField = chartJson.yAxisField;
	var yAxisName = chartJson.yAxisName;
	var yAxisArr = [];
	for(var axisI = 0; axisI < dataSource.length; axisI ++){
		xAxisArr.push(dataSource[axisI][chartJson.xAxisField]);
	}
	if(typeof(yAxisField) == 'object'){
		for(var yAxisI = 0; yAxisI < yAxisField.length; yAxisI ++){
			var yAxisJson = {};
			yAxisJson.name = yAxisName[yAxisI];
			yAxisJson.type = chartJson.type;
			if(typeof(chartJson.yAxisStock) == 'object'){
				var yAxisStock = chartJson.yAxisStock;
				yAxisJson.stack = yAxisStock[yAxisI];
			}
			if(chartJson.yAxisWidth){
				yAxisJson.barWidth = Number(chartJson.yAxisWidth);
			}
			yAxisJson.label = {
                normal: {
                    show: true,
                    position: 'insideRight'
                }
            };
			yAxisJson.data = [];
			for(var axisI = 0; axisI < dataSource.length; axisI ++){
				yAxisJson.data.push(dataSource[axisI][yAxisField[yAxisI]]);
			}
			yAxisArr.push(yAxisJson);
		}
	}
	var options = {
		title: {
			text: chartJson.title,
			//textAlign:'center',
			//textBaseline:'middle'
		},
		tooltip: {},
		toolbox:{
			show: true,
			feature:{
				saveAsImage: {}
			}
		},
		legend: {
			data:yAxisName,
		},
		xAxis: {
			data: xAxisArr
		},
		yAxis: {

		},
		series: yAxisArr
	}
	// 使用刚指定的配置项和数据显示图表。
	chartDom.setOption(options);
}