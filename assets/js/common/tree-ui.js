treeUI.componentSelectPlane = function(formID,treeSelectJson){
	for(var treeId in treeSelectJson){
		if(!treeSelectJson[treeId].readonly){
			treeUI.init(formID,treeSelectJson[treeId]);
		}
	}
}
treeUI.selectedTreeNode = function(treeId,nodeId){
	var inputID = treeId.substring(0,treeId.lastIndexOf('-'));
	var treeJson = treeUI[inputID];
	var treeConfig = treeJson.config;
	var $input = treeJson.$input;
	if(nodeId){
		treeConfig.value = nodeId;
	}
	if(treeConfig.readonly == true){
		//var $input = treeJson.$input;
		if(!$.isEmptyObject(treeConfig.value)){
			var valueStr = treeConfig.value;
			$input.attr('value',valueStr.value);
			$input.attr('nodeId',valueStr.text);
		}
	}else{
		var treeObj = $.fn.zTree.getZTreeObj(treeId);
		var sTreeNodesID = nodeId;
		var nodes = [];
		if(typeof(sTreeNodesID) == 'string'){
			if(sTreeNodesID.indexOf(',')>-1){
				sTreeNodesID = sTreeNodesID.split(',');
				if(treeObj){  //lyw 20180601
					for(var nodeI=0; nodeI<sTreeNodesID.length; nodeI++){
						var treeData = treeObj.getNodesByParam('id',sTreeNodesID[nodeI]);
						treeObj.selectNode(treeData[nodeI],true);
					}
				}else{
					var sTreeNodesIDText = '';
					for(var nodeI=0; nodeI<sTreeNodesID.length; nodeI++){
						$input.attr('nodeId',sTreeNodesID[nodeI]);
						sTreeNodesIDText += sTreeNodesID[nodeI] + ",";
					}
					sTreeNodesIDText = sTreeNodesIDText.substring(0,sTreeNodesIDText.length-1);
					$input.val(sTreeNodesIDText);
				}
			}else{
				if(treeObj){
					var treeData = treeObj.getNodesByParam("id",sTreeNodesID);
					treeObj.selectNode(treeData[0]);
				}else{
					$input.attr('nodeId',sTreeNodesID);
					$input.val(sTreeNodesID);
				}
			}
		}else{
			var treeData = treeObj.getNodesByParam("id",sTreeNodesID);
			treeObj.selectNode(treeData[0]);
		}
	}
}
//清空tree-select数据 
treeUI.clear = function(treeId){
	var inputID = treeId.substring(0,treeId.lastIndexOf('-'));
	var treeJson = treeUI[inputID];
	var $input = treeJson.$input;
	var inputvalue = $input.attr('nodeid');
	if(inputvalue === ''){
		//如果值为空，则不需要关闭
		if($input.parent().children('a.tree-close').length > 0){
			$input.parent().children('a.tree-close').remove();
		}
	}else{
		var closeContainer = $input.parent().children('.tree-close');
		if($input.parent().children('a.tree-close').length == 0){
			$input.after('<a href="javascript:void(0)" class="tree-close"></a>');
			closeContainer = $input.parent().children('.tree-close');
		}
		closeContainer.off('click');
		closeContainer.on('click',function(ev){
			var inputContainer = $(ev.target).parent().children('input');
			var inputID = inputContainer.attr('id');
			inputContainer.val('');
			inputContainer.attr("value", '');
			inputContainer.attr("nodeid",'');
			var treeId = inputID+'-tree';
			var treeObj = $.fn.zTree.getZTreeObj(treeId);
			if(treeObj){
				treeObj.cancelSelectedNode();
				treeObj.checkAllNodes();
			}
			var treeJson = treeUI[inputID];
			var treeConfig = treeJson.config;  
			if(typeof(treeConfig.clickCallback)=='function'){
				var returnObj = {
					treeId:treeId,
					inputContainer:inputContainer,
					value:'',
					id:'',
				}
				treeConfig.clickCallback(returnObj);
			}
			$(this).off('click');
			$(this).remove();
		});
	}
}
//隐藏树
treeUI.hideMenu = function(treeId){
	var inputID = treeId.substring(0,treeId.lastIndexOf('-'));
	var treeJson = treeUI[inputID];
	var treeContainer = treeJson.$tree;
	treeContainer.parent().remove();
	$('.modal-body').off('scroll',function(ev){ev.preventDefault()})
	treeUI.clear(treeId);
}
//节点单击事件
treeUI.treenodeClick = function(event,treeId,treeNode,clickFlag){
	var ztreeUI = $.fn.zTree.getZTreeObj(treeId);
	var inputID = treeId.substring(0,treeId.lastIndexOf('-'));
	var treeJson = treeUI[inputID];
	var treeConfig = treeJson.config;
	//if(clickFlag == 1){
		//是单击事件
		//判断是否支持多选
		var nodesName = "";//节点名称
		var nodesId = ""; //节点id
		if(treeConfig.isCheck){
			ztreeUI.checkNode(treeNode, !treeNode.checked, null, true);//选中取消勾选状态
			var zTree = $.fn.zTree.getZTreeObj(treeId);
			var nodes = zTree.getCheckedNodes(true);
			for(var i=0; i<nodes.length; i++){
				if(typeof(treeConfig.fullnameField)=='string'){
					//是否有全称字段
					nodesName += nodes[i][treeConfig.fullnameField]+",";
				}else{
					nodesName += nodes[i][treeConfig.textField]+",";
				}
				nodesId += nodes[i].id+",";
			}
			nodesName = nodesName.substring(0, nodesName.length-1);
			nodesId = nodesId.substring(0, nodesId.length-1);
		}else{
			//单选处理
			nodesId = treeNode.id;
			if(typeof(treeConfig.fullnameField)=='string'){
				//是否有全称字段
				nodesName = treeNode[treeConfig.fullnameField];
			}else{
				//因为textField字段是必填项
				nodesName = treeNode[treeConfig.textField];
			}
			treeJson.treeNode = treeNode;
		}
		var $input = treeJson.$input;
		$input.val(nodesName);
		$input.attr("value", nodesName);
		$input.attr("nodeId",nodesId);
		$input.removeClass('has-error');
		$input.parent().children('label.has-error').remove();
		var returnFunc = treeConfig.clickCallback;
		if(typeof(returnFunc) == 'function'){
			var returnObj = {};
			returnObj.treeId = treeId;
			returnObj.inputContainer = $input;
			returnObj.value = nodesName;
			returnObj.id = nodesId;
			returnObj.treeNode = treeNode;
			returnFunc(returnObj);
		}
		if(treeConfig.isCheck == false){
			treeUI.hideMenu(treeId);
		}
	//}
}
//节点选中事件
treeUI.treenodeOncheck = function(event,treeId,treeNode){
	var zTree = $.fn.zTree.getZTreeObj(treeId);
	treeUI.cancelHalf(treeId,treeNode);
	treeNode.checkedEx = true;
	var nodes = zTree.getCheckedNodes(true);
	var inputID = treeId.substring(0,treeId.lastIndexOf('-'));
	var treeJson = treeUI[inputID];
	var treeConfig = treeJson.config;
	var nodesName = '';
	var nodesId = '';
	for(var i=0; i<nodes.length; i++){
		if(typeof(treeConfig.fullnameField)=='string'){
			//是否有全称字段
			nodesName += nodes[i][treeConfig.fullnameField]+",";
		}else{
			nodesName += nodes[i][treeConfig.textField]+",";
		}
		nodesId += nodes[i].id+",";
	}
	nodesName = nodesName.substring(0, nodesName.length-1);
	nodesId = nodesId.substring(0, nodesId.length-1);
	var $input = treeJson.$input;
	$input.val(nodesName);
	$input.attr("value", nodesName);
	$input.attr("nodeId",nodesId);
	var returnFunc = treeConfig.checkCallback;
	if(typeof(returnFunc) == 'function'){
		var returnObj = {};
		returnObj.treeId = treeId;
		returnObj.inputContainer = $input;
		returnObj.value = nodesName;
		returnObj.id = nodesId;
		returnObj.treeNode = treeNode;
		returnFunc(returnObj);
	}
}
treeUI.cancelHalf = function(treeId,treeNode) {
	if (treeNode.checkedEx) return;
	var zTree = $.fn.zTree.getZTreeObj(treeId);
	treeNode.halfCheck = false;
	zTree.updateNode(treeNode);			
}
//ztree异步加载完成事件
treeUI.ajaxCompete = function(event,treeId,treeNode,msg){
	treeUI.cancelHalf(treeId,treeNode);
	treeUI.selectedTreeNode(treeId);
}
//过滤处理树结构数据
treeUI.ajaxDataFilter = function(treeId, parentNode, responseData){
	var inputID = treeId.substring(0,treeId.lastIndexOf('-'));
	var treeConfig = treeUI[inputID];
	var resceiveData = treeUI.compontFieldData(treeConfig,responseData);
	return resceiveData;
}
//处理树数据
treeUI.compontFieldData = function(treeConfig,data){
	var resceiveData = data;
	var config = treeConfig.config;
	if(config.isTurnTree){
		// 20180524 lyw list转换tree
		resceiveData = nsDataFormat.convertToTree(resceiveData,config.idField,config.parentIdField,'children');
	}
	var levelNumber = typeof(config.level)=='number' ? config.level : 0;
	if(levelNumber < 1){levelNumber = 0;}//默认不展开层
	var selectedNode = '';//是否存在选中节点
	if(typeof(config.value) == 'function'){
		selectedNode = config.value();
	}else{
		selectedNode = config.value;
	}
	var selectedNodeValue = [];
	var selectedNodeIds = [];
	var level = 0;
	function resetData(resceiveData,level){
		if(!$.isArray(resceiveData)){return;}
		var isExpand = false;
		if(levelNumber > 0){
			if(level < levelNumber-1){
				isExpand = true;
			}
		}
		for(var i = 0; i < resceiveData.length; i ++){
			//判断是否有子元素有两个字段一个是haschildField children
			var ishavechild = resceiveData[i][config.haschildField];//有定义了是否存在子元素的字段
			var ishavechildBool = true;//是否含有子元素
			if(ishavechild){
				//当前返回值是数值类型
				if(Number(ishavechild) == 0){
					ishavechildBool = false;
				}else if(ishavechild == null){
					//或者给的是空值
					ishavechildBool = false;
				}
			}else{
				//是否定义了children字段
				var treeChildrenField = 'children';
				if(config.children){
					treeChildrenField = config.children;
				}
				if(resceiveData[i][treeChildrenField] == null){
					ishavechildBool = false;
				}else if(resceiveData[i][treeChildrenField].length == 0){
					ishavechildBool = false;
				}
			}
			resceiveData[i].open = isExpand;
			resceiveData[i].isParent = ishavechildBool;
			resceiveData[i].name = resceiveData[i][config.textField];
			resceiveData[i].id = resceiveData[i][config.valueField];
			if(config.parentId){
				resceiveData[i].pId = resceiveData[i][config.parentId];
			}else{
				resceiveData[i].pId = resceiveData[i].parentId;
			}
			if(ishavechildBool){
				resetData(resceiveData[i].children,level++);
			}
			if(selectedNode){
				//选中值可以是多个
				if(typeof(selectedNode) == 'string'){
					//值为字符串类型
					if(selectedNode.indexOf(',')>-1){
						var selectTreeArr = selectedNode.split(",");
						for(var nodeI=0; nodeI<selectTreeArr.length; nodeI++){
							if(resceiveData[i][config.valueField] == selectTreeArr[nodeI]){ //lyw 20180601
								if(resceiveData[i][config.fullnameField]){
									selectedNodeValue.push(resceiveData[i][config.fullnameField]);
								}else{
									selectedNodeValue.push(resceiveData[i][config.textField]);
								}
								selectedNodeIds.push(resceiveData[i][config.valueField]);
								resceiveData[i].checked = true;
								resceiveData[i].halfCheck = true;
							}
						}
					}else{
						if(resceiveData[i][config.valueField] == selectedNode){ //lyw 20180601
							resceiveData[i].checked = true;
							resceiveData[i].halfCheck = true;
							if(resceiveData[i][config.fullnameField]){
								selectedNodeValue.push(resceiveData[i][config.fullnameField]);
							}else{
								selectedNodeValue.push(resceiveData[i][config.textField]);
							}
							treeConfig.treeNode = resceiveData[i];
							selectedNodeIds.push(resceiveData[i][config.valueField]);
						}
					}
				}else{
					if(typeof(selectedNode) != 'undefined'){
						//值为数值型
						if(resceiveData[i][config.valueField] == selectedNode){ //lyw 20180601
							resceiveData[i].checked = true;
							resceiveData[i].halfCheck = true;
							if(resceiveData[i][config.fullnameField]){
								selectedNodeValue.push(resceiveData[i][config.fullnameField]);
							}else{
								selectedNodeValue.push(resceiveData[i][config.textField]);
							}
							selectedNodeIds.push(resceiveData[i][config.valueField]);
							treeConfig.treeNode = resceiveData[i];
						}
					}
				}
			}else{
				/* lyw 注释 不知道谁加的 结果没有选中的默认全部选中
				 * resceiveData[i].checked = true;
				 * resceiveData[i].halfCheck = true;
				 **/
			}
		}
	}
	resetData(resceiveData,level);
	if(typeof(selectedNode)=='object'){
		if(selectedNode.text){
			treeConfig.$input.val(selectedNode.text);
		}
		if(selectedNode.value){
			treeConfig.$input.attr('nodeId',selectedNode.value);
		}
	}else{
		selectedNodeValue = selectedNodeValue.join(',');
		treeConfig.$input.val(selectedNodeValue);
		selectedNodeIds = selectedNodeIds.join(',');
		treeConfig.$input.attr('nodeId',selectedNodeIds);
	}
	treeUI.clear(treeConfig.treeId);
	return resceiveData;
}
treeUI.getUrl = function(treeId, treeNode){
	var inputID = treeId.substring(0,treeId.lastIndexOf('-'));
	var treeConfig = treeUI[inputID].config;
	var param = "parentId="+treeNode.id;
	var paramUrl = treeConfig.url;
	treeConfig.data.parentId = treeNode.id;
	return paramUrl + "?" + param;
}
//树加载客户端数据
treeUI.initSubdataTreedata = function(treeConfig){
	var treeId = treeConfig.treeId;
	var zNodes = treeUI.compontFieldData(treeConfig,treeConfig.config.subdata);
	treeConfig.zNodes = zNodes;
}
//树ajax加载数据
treeUI.initAjaxTreedata = function(treeConfig){
	var config = treeConfig.config;
	var treeId = treeConfig.treeId;
	$.ajax({
		url: config.url,	
		data:config.data,
		type:config.treeType,
		dataType: "json",
		plusData:treeConfig,
		success:function(data,ajaxData){
			if(data.success){
				if(typeof(treeConfig.config.onLoadSuccess)=='function'){
					data[config.dataSrc] = treeConfig.config.onLoadSuccess(data[config.dataSrc]);
				}
				var zNodes = treeUI.compontFieldData(treeConfig,data[config.dataSrc]);
				treeConfig.zNodes = zNodes;
			}
		}
	})
}
treeUI.initTreeData = function(treeConfig){
	if($.isArray(treeConfig.config.subdata)){//李亚伟 20180316 添加subdata属性
		treeUI.initSubdataTreedata(treeConfig);
	}else{
		treeUI.initAjaxTreedata(treeConfig);
	}
}
//初始化树调用
treeUI.initTree = function(treeConfig){
	var nodes = treeConfig.$input.attr('nodeid');
	treeConfig.config.value = nodes;
	treeConfig.zNodes = treeUI.compontFieldData(treeConfig,treeConfig.zNodes);
	$.fn.zTree.init(treeConfig.$tree,treeConfig.setting,treeConfig.zNodes);
	if(treeConfig.config.isExpand == true){
		treeUI.expand(treeConfig.treeId,true);
	}
}
treeUI.expand = function(treeId,isOpen){
	var treeObj = $.fn.zTree.getZTreeObj(treeId);
	treeObj.expandAll(isOpen);
}
//body事件
treeUI.onBodyDown = function(ev){
	var inputId = ev.data.inputID;
	var treeJson = treeUI[inputId];
	var $input = treeJson.$input;
	var $tree = treeJson.$tree;
	if($tree){
		var dragel = $tree[0];
		var target = ev.target;
		if(dragel != target && !$.contains(dragel,target)){
			treeUI.hideMenu(treeJson.treeId);
		}
	}
}
treeUI.init = function(formID,_configObj){
	//初始化tree使用的是ztree组件
	/*
		*formID 表单id
		*_configObj 树配置参数
		*
	*/
	var isScroll = false;
	var scrollHeight = 0;
	var config = $.extend(true,{},_configObj);
	var $input = $('#'+config.fullID);
	var $inputBtn = $('#'+config.fullID+'-tree-menuBtn');
	if(config.readonly){
		//设置为只读不需要初始化tree
		return false;
	}
	//设置ztree的配置参数
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
	var defaultConfig = {
		async:false,//默认同步加载数据
		isCheck:false,//不开启多选
		isRadio:false,//不开启单选
		isCheckParent:false,//开启多选的前提，是否勾选父节点
	}
	nsVals.setDefaultValues(config,defaultConfig);//设置默认值
	function setAttributeParam(){
		if(config.multiple){
			//定义了此参数也是代表多选
			config.isCheck = typeof(config.multiple)=='boolean' ? config.multiple : false;//默认不开启多选
		}
		if(config.async){
			setting.async = {
				enable: true,
				url: config.getUrl,
				dataFilter: treeUI.ajaxDataFilter,
				type:"GET",
			}
		}
		if(config.isCheck){
			//开启多选
			/*Y 属性定义 checkbox 被勾选后的情况； 
			N 属性定义 checkbox 取消勾选后的情况； 
			"p" 表示操作会影响父级节点； 
			"s" 表示操作会影响子级节点  默认值：{ "Y": "ps", "N": "ps" }*/
			if(config.isCheckParent){
				//勾选父节点
				setting.check = {
					enable: true,
					chkStyle:"checkbox",
					//chkboxType: { "Y": "p", "N": "ps" }
				}
			}else{
				setting.check = {
					enable: true,
					chkStyle:"checkbox", 
					chkboxType: { "Y": "s", "N": "s" },//只影响父级节点；取消勾选操作，只影响子级节点
				}
			}
		}
		if(config.isRadio){
			//开启单选
			setting.check = {
				enable: true,
				chkStyle: "radio",
				radioType: "all"
			}
		}
	}
	setAttributeParam();//调用设置配置参数
	treeUI[config.fullID] = {
		setting:setting,
		$input:$input,
		$inputBtn:$inputBtn,
		treeId:config.fullID+'-tree',
		config:config,
		zNodes:[],
	}
	$('.nswindow.main-content').on('scroll',function(ev){
		ev.preventDefault();
		//isScroll = true;//进行了滚动
		scrollHeight = $(this).scrollTop();
	});
	treeUI.initTreeData(treeUI[config.fullID]);
	//tree位置追加
	function appendHtml(inputID){
		var treeConfig = treeUI[inputID];
		var $input = treeConfig.$input;
		var $parents = $input.parents();
		var treeId = treeConfig.treeId;
		var $treePosition = $('body');//默认追加位置是body
		if($('#'+treeId).length > 0){$('#'+treeId).remove();}
		for(var domI=0; domI<$parents.length; domI++){
			if($($parents[domI]).css('overflow')==='auto' || $($parents[domI]).css('overflow-y')==='auto'){
				$treePosition = $($parents[domI]);
				break;
			}
		}
		switch(config.formSource){
			case 'dialog':
			case 'modal':
			case 'formDialog':
				$treePosition = $('body');
				break;
			case 'form':
				if($treePosition.closest('.content-box').length > 0){
					$treePosition = $('body');
				}
				break;
		}
		// lyw 项目组件使用 添加自定义容器 树插入自定义容器
		if(config.$customContainer){
			// 自定义容器
			$treePosition = config.$customContainer;
			config.formSource = 'custom';
		}
		//sjj20181101  针对货品选择器使用treeSelect添加
		var ulStyleStr = '';
		if($input.closest('.advance-search-plane').length > 0){
			var width = $input.closest('.form-td').outerWidth();
			var fillAttrStr = 'z-index:9999;width:'+width+'px;margin-left:0px';
			var ulStyleStr = 'style="'+fillAttrStr+'"';
		}
		var styleStr = nsComponent.getComponentPosition($input,{source:treeConfig.config.formSource});
		//sjj 20181212 针对nswindow弹出框滚动位置计算问题的修改
		
		if(isScroll){
			//当前处于滑动
			var $container = $('.nswindow .content:last');
			var nswindowOffset = $container.offset();
			var inputOffset = $input.closest('.form-td').offset();
			var leftNum = inputOffset.left - nswindowOffset.left;
			var topNum = inputOffset.top-10 + scrollHeight;
			var width = $input.closest('.form-td').outerWidth();
			styleStr = 'style="top:'+topNum+'px;left:'+leftNum+'px;margin:0px;position:absolute;width:'+width+'px;"';
		}
		var treeHtml = '<div class="treeform-ztree '+config.formSource+'" '+styleStr+'><ul id="'+treeId+'" '+ulStyleStr+'></ul></div>';
		$treePosition.append(treeHtml);
		treeConfig.$tree = $('#'+treeId);
		treeUI.initTree(treeConfig);
	}
	//当前元素的单击事件
	$input.on('focus',function(ev){
		ev.preventDefault();
		var $this = $(this);
		var inputID = $this.attr('id');
		appendHtml(inputID);
		$('.modal-body').on('scroll',function(ev){ev.preventDefault()});
		$("body").on("mousedown",{inputID:inputID},treeUI.onBodyDown);
	})
	//按钮的单击事件
	$inputBtn.on('click',function(event){
		var $this = $(this);
		var btnID = $this.attr('id');
		var substr = '-tree-menuBtn';
		var inputID = btnID.substring(0,btnID.length-substr.length);
		appendHtml(inputID);
		$('.modal-body').on('scroll',function(ev){ev.preventDefault()});
		$("body").on("mousedown",{inputID:inputID},treeUI.onBodyDown);
	});
}