treeUI.componentSelectPlane = function(formID,treeSelectJson){
	for(var treeId in treeSelectJson){
		if(!treeSelectJson[treeId].readonly){
			treeUI.init(formID,treeSelectJson[treeId]);
		}
	}
}
treeUI.init = function(formID,ztreeJson){
	var inputID = 'form-'+formID+'-'+ztreeJson.id;
	var treeId = inputID+'-tree';
	treeUI[treeId] = {};
	treeUI[treeId].baseConfig = ztreeJson;
	treeUI[treeId].inputContainer = $('#'+inputID);
	treeUI[treeId].treeContainer = $('#'+treeId);
	treeUI[treeId].treeBtnContainer = $('#'+treeId+'-menuBtn');
	treeUI[treeId].data = {};
	treeUI[treeId].selectedNode = {};
	var setting = {
		data: {
			simpleData: {
				enable: true
			},
			key:{
				url:'urlNullAndEmpty'  //防止url命名冲突 urlNullAndEmpty是不存在的返回值，所以很长
			}
		},
		view: {
			expandSpeed: ""
		},

		callback: {
			onClick: treeUI.treenodeClick,
			onCheck: treeUI.treenodeOncheck,
			onAsyncSuccess:treeUI.ajaxCompete
		}
	}
	//false表示同步加载数据
	var treeAsync = ztreeJson.async ? ztreeJson.async : false;
	if(treeAsync){
		setting.async = {
			enable: true,
			url: treeUI.getUrl,
			dataFilter: treeUI.ajaxDataFilter,
			type:"GET",
		}
	}
	if(ztreeJson.isCheck){
		setting.check = {
			enable: true,
			chkboxType: { "Y": "s", "N": "s" }
		}
	}
	if(ztreeJson.isRadio){
		setting.check = {
			enable: true,
			chkStyle: "radio",
			radioType: "all"
		}
	}
	treeUI.initAjaxTreedata(treeId,setting);
}
treeUI.getUrl = function(treeId, treeNode){
	var param = "parentId="+treeNode.id;
	var paramUrl = treeUI[treeId].baseConfig.url;
	treeUI[treeId].baseConfig.data.parentId = treeNode.id;
	return paramUrl + "?" + param;
}
treeUI.ajaxDataFilter = function(treeId, parentNode, responseData){
	var resceiveData = treeUI.compontFieldPlane(treeId,responseData);
	return resceiveData;
}
treeUI.initAjaxTreedata = function(treeId,setting){
	var treeConfig = treeUI[treeId].baseConfig;
	$.ajax({
		url: treeConfig.url,	
		data:treeConfig.data,
		type:treeConfig.treeType,
		dataType: "json",
		success: function(data){
			if(data.success){
				var zNodes = treeUI.compontFieldPlane(treeId,data);
				$.fn.zTree.init($("#"+treeId),setting,zNodes);
				treeUI.componentInput(treeId);
			}
		}
	})
}
treeUI.compontFieldPlane = function(treeId,responseData){
	var treeConfig = treeUI[treeId].baseConfig;
	var resceiveData = responseData[treeConfig.dataSrc];
	var selectedNode = '';
	if(typeof(treeConfig.value) == 'function'){
		selectedNode = treeConfig.value();
	}else{
		selectedNode = treeConfig.value;
	}
	treeUI[treeId].data['parentId'] = {};
	treeUI[treeId].selectedNode['parentId'] = {};
	treeUI[treeId].selectedNode['parentId'].selectedNodeIndex = '';
	treeUI[treeId].selectedNode['parentId'].selectedNodeId = '';
	treeUI[treeId].selectedNode['parentId'].selectedNodeValue = '';
	resetData(resceiveData);
	function resetData(resceiveData){
		if(resceiveData){
			for(var i = 0; i < resceiveData.length; i ++){
				var ishavechild = resceiveData[i][treeConfig.haschildField];
				var ishavechildBool = true;//是否含有子元素
				if(ishavechild){
					if(Number(ishavechild) == 0){
						ishavechildBool = false;
					}else if(ishavechild == null){
						ishavechildBool = false;
					}
				}else{
					var treeChildrenField = 'children';
					if(treeConfig.children){
						treeChildrenField = treeConfig.children;
					}
					if(resceiveData[i][treeChildrenField] == null){
						ishavechildBool = false;
					}else if(resceiveData[i][treeChildrenField].length == 0){
						ishavechildBool = false;
					}
				}
				resceiveData[i].isParent = ishavechildBool;
				resceiveData[i].name = resceiveData[i][treeConfig.textField];
				resceiveData[i].id = resceiveData[i][treeConfig.valueField];
				if(treeConfig.parentId){
					resceiveData[i].pId = resceiveData[i][treeConfig.parentId];
				}else{
					resceiveData[i].pId = resceiveData[i].parentId;
				}
				if(ishavechildBool){
					resetData(resceiveData[i].children);
				}
				if(typeof(selectedNode) == 'string'){
					if(selectedNode.indexOf(',')>-1){
						var selectTreeArr = selectedNode.split(",");
						for(var nodeI=0; nodeI<selectTreeArr.length; nodeI++){
							if(resceiveData[i][treeConfig.valueField] == selectTreeArr[nodeI]){
								treeUI[treeId].selectedNode['parentId'].selectedNodeIndex  += i+",";
								treeUI[treeId].selectedNode['parentId'].selectedNodeId += resceiveData[i][treeConfig.valueField]+",";
								treeUI[treeId].selectedNode['parentId'].selectedNodeValue += resceiveData[i][treeConfig.textField]+",";
								resceiveData[i].checked = true;
							}
						}
					}else{
						if(resceiveData[i][treeConfig.valueField] == selectedNode){
							treeUI[treeId].selectedNode['parentId'].selectedNodeIndex = i;
							treeUI[treeId].selectedNode['parentId'].selectedNodeId = resceiveData[i][treeConfig.valueField];
							treeUI[treeId].selectedNode['parentId'].selectedNodeValue = resceiveData[i][treeConfig.textField];
						}
					}
				}else{
					if(resceiveData[i][treeConfig.valueField] == selectedNode){
						treeUI[treeId].selectedNode['parentId'].selectedNodeIndex = i;
						treeUI[treeId].selectedNode['parentId'].selectedNodeId = resceiveData[i][treeConfig.valueField];
						treeUI[treeId].selectedNode['parentId'].selectedNodeValue = resceiveData[i][treeConfig.textField];
					}
				}
				treeUI[treeId].data['parentId'][resceiveData[i][treeConfig.valueField]] = resceiveData[i];
			}
		}
	}
	var sTreeIndex = treeUI[treeId].selectedNode['parentId'].selectedNodeIndex;
	if(typeof(sTreeIndex) == 'string'){
		if(sTreeIndex.indexOf(',')>-1){
			treeUI[treeId].selectedNode['parentId'].selectedNodeIndex = sTreeIndex.substr(0,sTreeIndex.length-1);
		}
	}
	var sTreeId = treeUI[treeId].selectedNode['parentId'].selectedNodeId;
	if(typeof(sTreeId) == 'string'){
		if(sTreeId.indexOf(',')>-1){
			treeUI[treeId].selectedNode['parentId'].selectedNodeId = sTreeId.substr(0,sTreeId.length-1);
		}
	}
	var sTreeValue = treeUI[treeId].selectedNode['parentId'].selectedNodeValue;
	if(typeof(sTreeValue)=='string'){
		if(sTreeValue.indexOf(',')>-1){
			treeUI[treeId].selectedNode['parentId'].selectedNodeValue = sTreeValue.substr(0,sTreeValue.length-1);
		}
	}
	return resceiveData;
}
treeUI.ajaxCompete = function(event,treeId,treeNode,msg){
	var inputContainer = treeUI[treeId].inputContainer;
	var treeConfig = treeUI[treeId].baseConfig;
	treeUI.selectedTreeNode(treeId);
}
treeUI.componentInput = function(treeId){
	var inputContainer = treeUI[treeId].inputContainer;
	var treeConfig = treeUI[treeId].baseConfig;
	var selectedNodeId = treeUI[treeId].selectedNode['parentId'].selectedNodeId;
	var treeFullname = treeUI[treeId].baseConfig.fullnameField;
	var treevalue = treeUI[treeId].selectedNode['parentId'].selectedNodeValue;
	if(selectedNodeId !=''){
		inputContainer.attr("value", treevalue);
		inputContainer.attr("nodeid",selectedNodeId);
	}
	treeUI.selectedTreeNode(treeId);
	inputContainer.on('focus',function(ev){
		$(this).on('click',function(ev){
			var treeId = $(this).attr('id');
			treeId = treeId+'-tree';
			var treeContainer = treeUI[treeId].treeContainer;
			if(treeContainer.hasClass('hide')){
				treeContainer.removeClass('hide');
			}else{
				treeContainer.addClass('hide');
			}
			var inputObj = $(this);
			var inputOffset = $(this).offset();
			var inputId = $(this).attr('id');
			//$("#"+treeId).css({left:inputOffset.left + "px", top:inputOffset.top + inputObj.outerHeight() + "px"}).slideDown("fast");
			$("body").on("mousedown",{treeId:treeId,inputId:inputId},treeUI.onBodyDown);
		});
	})
	var btnContainer = treeUI[treeId].treeBtnContainer;
	btnContainer.on('click',function(ev){
		var currentBtnID = $(ev.target).closest('a').attr('id');
		var treeId = currentBtnID.substr(0,currentBtnID.length-8);
		var treeContainer = treeUI[treeId].treeContainer;
		if(treeContainer.hasClass('hide')){
			treeContainer.removeClass('hide');
		}else{
			treeContainer.addClass('hide');
		}
		var inputContainer = treeUI[treeId].inputContainer;
		inputId = inputContainer.attr('id');
		$("body").on("mousedown",{treeId:treeId,inputId:inputId},treeUI.onBodyDown);
	});
}
treeUI.onBodyDown = function(ev){
	var treeId = ev.data.treeId;
	var inputId = ev.data.inputId;
	var inputContainer = treeUI[treeId].inputContainer;
	var treeContainer = treeUI[treeId].treeContainer;;
	var dragel = treeContainer[0];
	var target = ev.target;
	if(dragel != target && !$.contains(dragel,target)){
		treeUI.hideMenu(treeId);
	}
}
treeUI.hideMenu = function(treeId){
	var treeContainer = treeUI[treeId].treeContainer;
	treeContainer.addClass('hide');
	treeContainer.fadeOut("fast");
	var inputContainer = treeUI[treeId].inputContainer;
	inputContainer.off('click');
	$("body").off("mousedown",treeUI.onBodyDown);
}
treeUI.treenodeClick = function(event,treeId,treeNode,clickFlag){
	var ztreeUI = $.fn.zTree.getZTreeObj(treeId);
	var treeNodeUI = treeUI[treeId].baseConfig;
	if(treeNodeUI.isCheck || treeNodeUI.isRadio){
		ztreeUI.checkNode(treeNode, !treeNode.checked, null, true);
		return false;
	}else{
		var nodes = ztreeUI.getSelectedNodes();
		var nodesvalue = "";
		var nodesName = "";
		var nodesId = "";
		nodes.sort(function compare(a,b){return a.id-b.id;});
		for (var i=0, l=nodes.length; i<l; i++) {
			nodesvalue += nodes[i].name + ",";
			if(treeNodeUI.fullnameField){
				nodesName += nodes[i][treeNodeUI.fullnameField];
			}else{
				nodesName += nodes[i][treeNodeUI.textField];
			}
			nodesId += nodes[i].id;
		}
		if (nodesvalue.length > 0){
			nodesvalue = nodesvalue.substring(0, nodesvalue.length-1);
		}
		if (nodesName.length > 0){
			nodesName = nodesName.substring(0, nodesName.length);
		}
		if (nodesId.length > 0){
			nodesId = nodesId.substring(0, nodesId.length);
		}
		var inputObj = treeUI[treeId].inputContainer;
		inputObj.val(nodesName);
		inputObj.attr("value", nodesName);
		inputObj.attr("nodeId",nodesId);
		var returnTreenodeFunc = treeUI[treeId].baseConfig.clickCallback;
		if(typeof(returnTreenodeFunc)!='undefined'){
			var returnObj = {};
			returnObj.treeId = treeId;
			returnObj.inputContainer = inputObj;
			returnObj.value = nodesvalue;
			returnObj.id = nodesId;
			returnTreenodeFunc(returnObj);
			treeUI.hideMenu(treeId);
		}
	}
}
treeUI.treenodeOncheck = function(event,treeId,treeNode){
	var zTree = $.fn.zTree.getZTreeObj(treeId);
	var nodes = zTree.getCheckedNodes(true);
	var nodesArr = [];
	var nodesvalue = "";
	var nodesName = "";
	var nodesId = "";
	var treeNodeUI = treeUI[treeId].baseConfig;
	for (var i=0, l=nodes.length; i<l; i++) {
		nodesvalue += nodes[i].name + ",";
		if(treeNodeUI.fullnameField){
			nodesName += nodes[i][treeNodeUI.fullnameField]+",";
		}else{
			nodesName += nodes[i][treeNodeUI.textField]+",";
		}
		nodesId += nodes[i].id+",";
		nodesArr.push(nodes[i].name);
	}
	if (nodesvalue.length > 0){
		nodesvalue = nodesvalue.substring(0, nodesvalue.length-1);
	}
	if(nodesName.length>0){
		 nodesName = nodesName.substring(0, nodesName.length-1);
	}
	if (nodesId.length > 0){
		nodesId = nodesId.substring(0, nodesId.length-1);
	}
	var inputObj = treeUI[treeId].inputContainer;
	inputObj.val(nodesName);
	inputObj.attr("value", nodesName);
	inputObj.attr("nodeId",nodesId);
	var returnTreenodeFunc = treeUI[treeId].baseConfig.checkCallback;
	if(typeof(returnTreenodeFunc)!='undefined'){
		var returnObj = {};
		returnObj.treeId = treeId;
		returnObj.inputContainer = inputObj;
		if(treeUI[treeId].baseConfig.isCheck){
			returnObj.value = nodesArr;
		}
		if(treeUI[treeId].baseConfig.isRadio){
			returnObj.value = nodesvalue;
		}
		returnTreenodeFunc(returnObj);
	}
}
//默认选中节点
treeUI.selectedTreeNode = function(treeId,selectedNodeIndex){
	var treeObj = $.fn.zTree.getZTreeObj(treeId);
	var selectedNodeIndex = treeUI[treeId].selectedNode['parentId'].selectedNodeIndex;
	var parentcateid = 'parentId';
	for(var pID in treeUI[treeId].baseConfig.data){
		parentcateid = pID;
	}
	var sTreeNodesID = treeUI[treeId].selectedNode['parentId'].selectedNodeId;
	var treeAsync = treeUI[treeId].baseConfig.async ? treeUI[treeId].baseConfig.async:false;
	var nodes = [];
	if(typeof(sTreeNodesID) == 'string'){
		if(sTreeNodesID.indexOf(',')>-1){
			sTreeNodesID = sTreeNodesID.split(',');
			for(var nodeI=0; nodeI<sTreeNodesID.length; nodeI++){
				var treeData = treeObj.getNodesByParam('id',sTreeNodesID[nodeI]);
				treeObj.selectNode(treeData[nodeI],true);
			}
		}else{
			var treeData = treeObj.getNodesByParam("id",sTreeNodesID);
			treeObj.selectNode(treeData[0]);
		}
	}else{
		var treeData = treeObj.getNodesByParam("id",sTreeNodesID);
		treeObj.selectNode(treeData[0]);
	}
}
//更新节点
treeUI.updateTreeNode = function(treeId,updateNodeIndex){
	var treeObj = $.fn.zTree.getZTreeObj(treeId);
	var nodes = treeObj.getNodes();
	treeObj.updateNode(nodes[updateNodeIndex]);
}