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

						//新增需要判断当前是否定义了parentId 
						if(conlonAddJson.id == dataConfig.controlForm.keyParent){
							//已经存在不可以在重复定义
						}else{
							nsTree.dialogAddConfig.form.push(conlonAddJson);
						}
					}
				}
			}
		}
	}

	if(!$.isEmptyObject(config.controlButton)){
		var navId = config.id+'-button';
		if(config.controlButton.id){
			//如果定义了按钮id
			navId = config.controlButton.id;
		}
		var colDom = $('#'+config.id).parent();
		var navButtonHtml = '<div class="nav-form" id="'+navId+'"></div>';
		colDom.before(navButtonHtml)
		if($.isArray(config.controlButton.btns)){
			config.controlButton.isShowTitle = false;
			controlPlane.formNavInit(config.controlButton);	
		}
	}
	if(config.controlMode=='form'){
		//使用form形式，右侧出修改面板 修改面板的form id= 'controlPlane-'+dataConfig.id
		var colDom = $('#'+config.id).parent();
		
		/*if(config.isLayout == true){
			colDom = colDom.parent().parent();
		}*/
		var colDomClassStr = colDom.attr('class');
		var controlColClassStr = '';
		if(typeof(config.controlColWidth)=='undefined'){
			//如果没有设置控制面板宽度，则自动计算
			var colDomColClass = colDomClassStr.substr(colDomClassStr.lastIndexOf('col-sm-'),colDomClassStr.length);
			colDomColClass = colDomColClass.substring(0,colDomColClass.indexOf(" "));
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
								console.error(language.ui.nsTree.debugerMode);
							}
							break;
					}
				}
				//根据ID展开
				if(typeof(config.expandById) =='string' ){
					var $expandByIdDom = $("li[data-id='"+config.expandById+"']");
					$expandByIdDom.children('div').addClass('item-selected');
					//var parentDom = expandByIdDom.parent().closest("li.uk-nestable-list-item.uk-parent");
					var arr = $expandByIdDom.parents('li.uk-nestable-list-item.uk-parent');
					if(arr.hasClass('uk-collapsed')){
							arr.removeClass('uk-collapsed');
					}
					var brotherDomArr = $expandByIdDom.parent().children("li");
					var domIndex = 0;
					for(var brotherI=0; brotherI<brotherDomArr.length; brotherI++){
						if($(brotherDomArr[brotherI]).attr("data-id")==config.expandById){
							domIndex = brotherI;
						}
					}
					var dataObj = {};
					dataObj.id = Number($expandByIdDom.attr('data-id'));
					dataObj.name = $expandByIdDom.attr('data-name');
					dataObj.parentid = Number($expandByIdDom.attr('data-parentid'));
					dataObj.order = domIndex;
					if(typeof(nsTree.config[config.id].expandByIdHandler)=='function'){
					var expandByIdFunc = nsTree.config[config.id].expandByIdHandler;
					expandByIdFunc(dataObj);
					}
				}
				if($.isArray(dataConfig.btns)){
					if(dataConfig.btns.length>0){
						var btnContainerHtml = '<div id="'+config.id+'-btns" class="nstree-btns-container"></div>'
						$('#'+config.id).prepend(btnContainerHtml);
						nsButton.initBtnsByContainerID(config.id+'-btns', dataConfig.btns);
					}
				}
			}else{
				//nsalert(language.common.returnError);
				nsalert(data.msg);
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
			nsalert( language.ui.nsTree.expandAllTreeNum );
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
			nsalert( language.ui.nsTree.collapseAllTreeNum );
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
						nsalert( language.ui.nsTree.MethodSuccess );
						$('li[data-id="'+currentObj.id+'"]').attr("data-parentid",currentObj.parent_id);
					}else{
						nsalert( language.ui.nsTree.MethodError + date.msg);
					}
				},
				error:function(e){
					nsalert( language.ui.nsTree.MethodError + date.msg );
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
nsTree.selectHandler = function(ev,type){
	if(type=='add'){
		if(ev.hasClass('uk-nestable-toggle')){
			return;
		}
	}else{
		if($(ev.target).hasClass('uk-nestable-toggle')){
			//下拉操作
			return;
		}
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
	var isCancel = false;			//是否取消选中
	var isSingle = false;			//是否是单选状态
	var treeID;
	var currentDom;
	if(type=='add'){
		treeID = ev.closest(".uk-nestable").parent().attr("id");
		currentDom = ev.closest("li.uk-nestable-list-item");
	}else{
		treeID = $(this).closest(".uk-nestable").parent().attr("id");
		currentDom = $(this).closest("li.uk-nestable-list-item");
	}
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
			isCancel = false;
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
					var valueStr = sourceJson[elementArr[elementIndex].id];
					//如果是树tree-select类型
					if(elementArr[elementIndex].type == 'treeSelect'){
						valueStr = {
							value:sourceJson[elementArr[elementIndex].valueField],
							text:sourceJson[elementArr[elementIndex].textField]
						}
					}
					formJson[elementArr[elementIndex].id] = valueStr;
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
		//nsalert('您填写的数据不完整','error');
		return false;
	}
	var addDialogJson = nsdialog.getFormJson();
	var treeID = nsTree.currentTreeID;
	var formInput = nsForm.data[nsDialog.formJson.id].formInput;
	for(var fID in formInput){
		if(formInput[fID].type == 'uploadSingle'){
			formJson[fID] = [];
			addDialogJson[fID] = ''; 
			var cid = 'form-'+nsDialog.formJson.id+'-'+fID;
			if(!$.isEmptyObject(nsForm.dropzoneDataJson[cid])){
				for(var file in nsForm.dropzoneDataJson[cid]){
					var currentJson = {};
					currentJson[formInput[fID].valueField] = file;
					currentJson[formInput[fID].textField] = nsForm.dropzoneDataJson[cid][file];
					formJson[fID].push(currentJson);
					addDialogJson[fID] += file+',';
				}
			}else{
				if($.isArray(formInput[fID].value)){
					formJson[fID] = formInput[fID].value;
					for(var i=0; i<formInput[fID].value.length; i++){
						addDialogJson[fID] += formInput[fID].value[i][formInput[fID].valueField] + ',';
					}
				}
			}
			addDialogJson[fID] = addDialogJson[fID].substr(0,addDialogJson[fID].length-1);
		}
	}
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
		data: 		addDialogJson,
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
				nsalert(language.ui.nsTree.handlerFunctionSuccess);
				popupBox.hide();
			}else{
				nsalert(language.ui.nsTree.handlerFunctionError+data.msg);
			}
		},
		error:function(e){
			nsalert(language.ui.nsTree.handlerFunctionError+e.msg);
		}
	});
}
nsTree.refreshSelectHandler = function(keyID){
	nsTree.selectHandler($('li[data-id="'+keyID+'"] > div.list-content'),'add');
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
			returnJson.parentName = nsTree.currentItem.cItemName ? nsTree.currentItem.cItemName : langTree.dialog.rootName;
			returnJson.parentId = nsTree.currentItem.cItemID ? nsTree.currentItem.cItemID : -1;
			if(isNaN(nsTree.currentItem.cItemChildrenNumber)){
				var treeName = '';
				$.each(nsTree.json, function(key,value){
					treeNum++;
					treeName = key;
					var rootliArr = $("#"+treeName+"_nsTree").children("li");
					returnJson.sortId = rootliArr.length+1;
				});
			}else{
				returnJson.sortId = nsTree.currentItem.cItemChildrenNumber+1;
			}
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
		returnJson.parentName = nsTree.currentItem.cItemName ? nsTree.currentItem.cItemName : langTree.dialog.rootName;
		returnJson.parentId = nsTree.currentItem.cItemID ? nsTree.currentItem.cItemID : -1;
		if(isNaN(nsTree.currentItem.cItemChildrenNumber)){
			var treeName = '';
			$.each(nsTree.json, function(key,value){
				treeNum++;
				treeName = key;
				var rootliArr = $("#"+treeName+"_nsTree").children("li");
				returnJson.sortId = rootliArr.length+1;
			});
		}else{
			returnJson.sortId = nsTree.currentItem.cItemChildrenNumber+1;
		}
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

				//刷新表单
				var formId = 'controlPlane-'+nsTree.currentTreeID;
				if($('#'+formId).length>0){
					nsForm.clearData(formId);
				}

				nsalert( language.ui.nsTree.delParentJson,'error' );
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
				nsalert(language.ui.nsTree.deleteFuncError+data.msg);
			}
		},
		error:function(e){
			nsalert( language.uo,nsTree.deleteFuncError);
		}
	});
}
//排序上移
nsTree.sortMove = function(treeID,direction){
	if(typeof(nsTree.config[treeID])=='undefined'){
		nsalert(language.ui.nsTree.sortMove.TreeID+treeID);
		return false;
	};
	var selectItem = $('#'+treeID).find('div.item-selected')
	if(selectItem.length==0){
		nsalert( language.ui.nsTree.sortMove.SelectItem ,'warning');
		return false;
	};
	if(direction!='up'&&direction!='down'){
		nsalert( language.ui.nsTree.sortMove.Direction +direction+ language.ui.nsTree.sortMove.DirectionUp );
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
					
					nsalert(  language.ui.nsTree.sortMove.DirectionSuccess);
				}else{
					nsalert( language.ui.nsTree.sortMove.DirectionError +data.msg,'error');
				}
			},
			error:function(e){
				nsalert( language.ui.nsTree.sortMove.DirectionError +e.msg);
			}
		})
	}else{
		var alertStr;
		if(direction=='up'){
			alertStr= language.ui.nsTree.sortMove.DirectionRemindUp ;
		}else if(direction=='down'){
			alertStr= language.ui.nsTree.sortMove.DirectionRemindDown;
		}
		nsalert(alertStr,'warning');
	}
	

}
//编辑完成并发送ajax
nsTree.edit = function(){
	var formJson = nsdialog.getFormJson();
	if(formJson==false){
		//nsalert('您填写的数据不完整');
		return false;
	}
	var editDialogJson = nsdialog.getFormJson();
	var formInput = nsForm.data[nsDialog.formJson.id].formInput;
	for(var fID in formInput){
		if(formInput[fID].type == 'uploadSingle'){
			formJson[fID] = [];
			editDialogJson[fID] = ''; 
			var cid = 'form-'+nsDialog.formJson.id+'-'+fID;
			if(!$.isEmptyObject(nsForm.dropzoneDataJson[cid])){
				for(var file in nsForm.dropzoneDataJson[cid]){
					var currentJson = {};
					currentJson[formInput[fID].valueField] = file;
					currentJson[formInput[fID].textField] = nsForm.dropzoneDataJson[cid][file];
					formJson[fID].push(currentJson);
					editDialogJson[fID] += file+',';
				}
			}else{
				if($.isArray(formInput[fID].value)){
					formJson[fID] = formInput[fID].value;
					for(var i=0; i<formInput[fID].value.length; i++){
						editDialogJson[fID] += formInput[fID].value[i][formInput[fID].valueField] + ',';
					}
				}else{
					if(typeof(formInput[fID].value)=='function'){
						formJson[fID] = formInput[fID].value();
					}
				}
			}
			editDialogJson[fID] = editDialogJson[fID].substr(0,editDialogJson[fID].length-1);
		}
	}

	var keyID = nsTree.config[nsTree.currentItem.cTreeID].controlForm.keyID;
	var keyParent = nsTree.config[nsTree.currentItem.cTreeID].controlForm.keyParent;
	var keyText = nsTree.config[nsTree.currentItem.cTreeID].controlForm.keyText;

	//发送服务器请求的ID
	formJson[keyID] = nsTree.currentItem.cItemID;
	editDialogJson[keyID] = nsTree.currentItem.cItemID;

	var parentDom = nsTree.getSearchDom(nsTree.currentItem.cTreeID, nsTree.currentItem.cItemID);
	if(typeof(parentDom)=='undefined'){
		parentDom = $("#"+nsTree.currentItem.cTreeID);
	}

	
	$.ajax({
		type:  		nsTree.config[nsTree.currentItem.cTreeID].ajaxMethod,
		url:  		nsTree.config[nsTree.currentItem.cTreeID].editAjax,
		data: 		editDialogJson,
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
				if(editJson[nsTree.config[nsTree.currentItem.cTreeID].controlForm.keyParent]){
					editJson[nsTree.config[nsTree.currentItem.cTreeID].controlForm.keyParent] = langTree.dialog.rootName;
				}
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
				
				//刷新表单
				var formId = 'controlPlane-'+nsTree.currentTreeID;
				if($('#'+formId).length>0){
					nsForm.fillValues(editJson,formId);
				}

				if(typeof(nsTree.config[nsTree.currentItem.cTreeID].editHandler)!='undefined'){
					var editFunc = nsTree.config[nsTree.currentItem.cTreeID].editHandler;
					editFunc(data);
				}

				nsalert( language.ui.nsTree.sortMove.modifySuccess);
				nsdialog.hide();

			}else{
				nsalert( language.ui.nsTree.sortMove.modifyError +date.msg);
			}
		},
		error:function(e){
			nsalert( language.ui.nsTree.sortMove.modifyErrorRetry +date.msg);
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
				title: language.ui.nsTree.dataConfig.deletetitle,
				size: 	"s",
				form:[
					{
						note: 		language.ui.nsTree.dataConfig.deletenote
					},{
						html:  		'<hr>'
					}
				],
				btns:[
					{
						text: 		language.ui.nsTree.dataConfig.text,
						handler: 	'nsTree.del',
					}
				]
			}
		this.dialogEditConfig = 
			{
				id: 	"plane-editmenus",
				title: 	language.ui.nsTree.dataConfig.modifytitle,
				size: 	"s",
				form:[],
				btns:[
					{
						text: 		language.ui.nsTree.dataConfig.text,
						handler: 	'nsTree.edit',
					}
				]
			}
		this.dialogAddConfig = 
			{
				id: 	"plane-addmenus",
				title: 	language.ui.nsTree.dataConfig.addedtitle,
				size: 	"s",
				form:[],
				btns:[
					{
						text: 		language.ui.nsTree.dataConfig.text,
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
	if($.isEmptyObject(nsTree.currentItem)||nsTree.currentItem.cItemID==''){
		nsalert(language.ui.nsTree.dialogw.emptyObject);
	}else{
		//扩展自定义属性到弹框
		var dialogConfig = nsTree.dialogEditConfig.form;
		popupBox.initShow(nsTree.dialogEditConfig);
	}
}