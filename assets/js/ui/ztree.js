/*******配件选择器 UI start**************/
var treeSelectorUI = {};
/********配置参数
1.要填充的容器元素
2.请求的ajax链接
3.请求的参数
4.节点父id
5.当前节点的id
6.当前节点的名称 name
7.是否是异步请求
8.返回的数据源参
9.子元素包含的children
10.是否有默认值
11.单击节点的返回函数
12.双击节点的返回函数
13.是否支持多选
14.节点全称
**************/
treeSelectorUI.treePlane = (function($){
	var config;//配置参数
	//配置参数是否合法,目前判断合法必须传送的值为容器id和url链接请求
	function matchConfig(configObj){
		var isMatch = false;
		if(typeof(configObj.id)=='undefined'){
			nsalert(language.ui.ztree.matchConfig,'error');
		}else if(typeof(configObj.url)=='undefined'){
			if($.isArray(configObj.dataSource)){
				isMatch = true;
			}else{
				nsalert(language.ui.ztree.matchConfigUrl,'error');
			}
		}else{
			isMatch = true;
		}
		return isMatch;
	}
	//默认值的配置
	function defaultConfig(configObj){
		configObj.data = typeof(configObj.data) == 'object' ? configObj.data : {};//默认无请求的条件参数
		configObj.type = typeof(configObj.type) == 'string' ? configObj.type : 'GET';//默认请求方式是GET请求
		configObj.async = typeof(configObj.async) == 'boolean' ? configObj.async : false;//默认同步请求
		configObj.isCheck = typeof(configObj.isCheck) == 'boolean' ? configObj.isCheck : false;//默认不多选
		configObj.pidField  = typeof(configObj.pidField) == 'string' ? configObj.pidField : 'parentId';//默认fid
		configObj.isCheckParent = typeof(configObj.isCheckParent) == 'boolean' ? configObj.isCheckParent : false;//按默认的勾选判断走
		var defaultStr = '';//默认选中的节点
		if(typeof(configObj.value) == 'function'){
			defaultStr = configObj.value();
		}else{
			defaultStr = typeof(configObj.value) == 'undefined' ? '' : configObj.value;
		}
		configObj.value = defaultStr;

		if(typeof(configObj.childrenField)=='undefined'){
			configObj.childrenField = 'children'; //默认读取子元素是根据children字段
		}
		//获取判断子元素的字段依据
		if(typeof(configObj.haschildField)=='string'){
			//如果定义了此字段优先根据此字段判断
			configObj.ishavechild = configObj.haschildField;
		}else if(typeof(configObj.childrenField)=='string'){
			//如果没有，则根据子元素的字段判断
			configObj.ishavechild = configObj.childrenField;
		}
		if(!$.isArray(configObj.dataSource)){configObj.dataSource = [];}
		configObj.customerKey = typeof(configObj.customerKey)=='boolean' ? configObj.customerKey : false;
		return configObj;
	}
	function init(configObj){
		var isContinue = matchConfig(configObj);
		if(isContinue){
			//合法则继续执行后续操作 
			config = defaultConfig(configObj);//默认值设定
			var treeID = config.id + '-tree';
			getTreeHtml(config.id);//追加树容器
			config.$treeDom = $('#'+treeID);//获取tree容器
			config.setting = getSettingConfig(config);//树节点的配置
			if(config.url){
				getTreeAjax(config);//读取树数据
			}else{
				$.fn.zTree.init(config.$treeDom,config.setting,config.dataSource);
				var treeId = config.id+'-tree';
				setTreenodeCheck(treeId,config.value);
				if(typeof(nsDataFormat)=='object'){
					nsDataFormat.tree[treeId] = $.fn.zTree.getZTreeObj(treeId);
				}
			}
		}
	}
	//追加树容器
	function getTreeHtml(configId){
		var height = $('#'+configId).closest('.layout-ztree').outerHeight() - 52;
		var styleStr = '';
		if(height){
			styleStr = 'style="height:'+height+'px"';
			if($('#'+configId).closest('.treeTable').length > 0){
				height = height - 60;
				styleStr = 'style="height:'+height+'px;max-height:'+height+'px;"';
			}
		}
		var treeHtml = '<ul id="'+configId+'-tree" class="ztree" '+styleStr+'></ul>';
		$('#'+configId).html(treeHtml);
	}
	//读取树数据
	function getTreeAjax(config){
		$.ajax({
			url: config.url,	
			data:config.data,
			type:config.type,
			dataType: "json",
			success: function(data){
				if(data.success){
					var allTreeData = data;
					if(typeof(config.dataSrc) == 'string'){
						allTreeData =  data[config.dataSrc];
					}
					var zNodes = getTreeData(allTreeData);
					$.fn.zTree.init(config.$treeDom,config.setting,zNodes);
					var treeId = config.id+'-tree';
					nsDataFormat.tree[treeId] = $.fn.zTree.getZTreeObj(treeId);
					setTreenodeCheck(treeId,config.value);
				}else{
					nsalert(language.ui.ztree.getTreeAjaxError,'error');
				}
			},
			error:function(data){
				if(data.msg){
					nsalert(data.msg,'error');
				}else{
					nsalert(language.ui.ztree.getTreeAjaxSearchError,'error');
				}
			}
		})
	}
	//处理得到的数据正确的解析以显示到界面的数据
	function getTreeData(data){
		var treeData = data;
		if($.isArray(treeData)){
			for(var treeI=0; treeI<treeData.length; treeI++){
				//判断当前元素是否是父元素
				var ishavechildBool = true;//是否含有子元素
				var haschildData = treeData[treeI][config.ishavechild];
				if($.isArray(haschildData)){
					//如果是数据判断其长度是否为0
					if(haschildData.length == 0){
						ishavechildBool = false;
					}
				}else{
					if(typeof(haschildData)=='number'){
						if(haschildData == 0){ishavechildBool=false;}
					}else{
						if(haschildData == null){ishavechildBool=false}
					}
				}
				treeData[treeI].isParent = ishavechildBool;  //是否是父元素
				treeData[treeI].name = treeData[treeI][config.textField];//节点名称
				treeData[treeI].id = treeData[treeI][config.valueField];//节点id
				treeData[treeI].pId = treeData[treeI][config.pidField];//父元素的id
				if($.isArray(treeData[treeI][config.childrenField])){
					//如果有子元素继续循环输出
					getTreeData(treeData[treeI][config.childrenField]);
				}
			}
		}
		return treeData;
	}
	//树节点的配置信息
	function getSettingConfig(config){
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
				onClick: singleClickTreenode,
				onCheck: checkedTreenode,
				onAsyncSuccess:ajaxCompete
			}
		}
		if(config.customerKey){
			setting.data = {
				key:{
					url:'urlNullAndEmpty',  //防止url命名冲突 urlNullAndEmpty是不存在的返回值，所以很长
					isparent:'isParent',
					children:config.childrenField,
					name:config.textField,
				},
				simpleData:{
					enable: true,
					idKey:config.idField,
					pidKey:config.pidField
				}
			}
		}
		//false表示同步加载数据
		if(config.async){
			setting.async = {
				enable:			true,
				url:			getUrl,
				dataFilter: 	ajaxDataFilter,
				type:			config.type,
			}
		}
		//是否设置了多选
		if(config.isCheck){
			if(config.isCheckParent){
				setting.check = {
					enable: true,
					chkboxType: { "Y": "p", "N": "ps" }
				}
			}else{
				setting.check = {
					enable: true,
					chkboxType: { "Y": "s", "N": "s" }
				}
			}
		}
		return setting;
	}
	//得到url链接
	function getUrl(treeId, treeNode){
		var parentId = config.pidField;
		var param = parentId+'='+treeNode.id;
		var paramUrl = config.url;
		return paramUrl + "?" + param;
	}
	//单击树节点事件
	function singleClickTreenode(event,treeId,treeNode,clickFlag){
		var ztreeUI = $.fn.zTree.getZTreeObj(treeId);
		if(clickFlag == 1){
			//是单击事件
			//判断是否支持多选
			var nodesName = "";//节点名称
			var nodesId = ""; //节点id
			if(config.isCheck){
				ztreeUI.checkNode(treeNode, !treeNode.checked, null, true);//选中取消勾选状态
				return false;
			}else{
				//单选处理
				nodesId = treeNode.id;
				if(typeof(config.fullnameField)=='string'){
					//是否有全称字段
					nodesName = treeNode[config.fullnameField];
				}else{
					//因为textField字段是必填项
					nodesName = treeNode[config.textField];
				}
			}
			var clickHandler = config.clickCallback;
			if(typeof(clickHandler) == 'function'){
				var returnObj = {};
				returnObj.treeId = treeId;
				returnObj.value = nodesName;
				returnObj.id = nodesId;
				returnObj.treeNode = treeNode;
				clickHandler(returnObj);
			}
		}
	}
	//选中取消树节点事件
	function checkedTreenode(event,treeId,treeNode){
		var zTree = $.fn.zTree.getZTreeObj(treeId);
		var nodes = zTree.getCheckedNodes(true);
		var nodesName = '';
		var nodesId = '';
		for(var i=0; i<nodes.length; i++){
			if(typeof(config.fullnameField)=='string'){
				//是否有全称字段
				nodesName += nodes[i][config.fullnameField]+",";
			}else{
				nodesName += nodes[i][config.textField]+",";
			}
			nodesId += nodes[i].id+",";
		}
		nodesName = nodesName.substring(0, nodesName.length-1);
		nodesId = nodesId.substring(0, nodesId.length-1);
		var checkHandler = config.checkCallback;
		if(typeof(checkHandler) == 'function'){
			var returnObj = {};
			returnObj.treeId = treeId;
			returnObj.value = nodesName;
			returnObj.id = nodesId;
			checkHandler(returnObj);
		}
	}
	//同步树加载完成触发的事件
	function ajaxDataFilter(treeId, parentNode, responseData){
		var allTreeData = responseData;
		if(typeof(config.dataSrc)=='string'){
			allTreeData = allTreeData[config.dataSrc];
		}
		var zNodes = getTreeData(allTreeData);
		return zNodes;
	}
	//给树节点设置选中节点
	function setTreenodeCheck(treeId,checkedNodes){
		var treeObj = $.fn.zTree.getZTreeObj(treeId);
		if(typeof(checkedNodes) == 'string'){
			//如果含有，分割表示是多个选中
			if(checkedNodes.indexOf(',')>-1){
				checkedNodes = checkedNodes.split(',');
				for(var nodeI=0; nodeI<checkedNodes.length; nodeI++){
					var treeData = treeObj.getNodesByParam('id',checkedNodes[nodeI]);
					treeObj.selectNode(treeData[nodeI],true);
				}
			}else{
				var treeData = treeObj.getNodesByParam("id",checkedNodes);
				treeObj.selectNode(treeData[0]);
			}
		}
	}
	//更新树选中节点
	function updateTreenodeCheck(treeId,checkedNodes){
		var treeObj = $.fn.zTree.getZTreeObj(treeId);
		if(typeof(checkedNodes) == 'string'){
			//如果含有，分割表示是多个选中
			if(checkedNodes.indexOf(',')>-1){
				checkedNodes = checkedNodes.split(',');
				for(var nodeI=0; nodeI<checkedNodes.length; nodeI++){
					var treeData = treeObj.getNodesByParam('id',checkedNodes[nodeI]);
					treeObj.updateNode(treeData[nodeI],true);
				}
			}else{
				var treeData = treeObj.getNodesByParam("id",checkedNodes);
				treeObj.updateNode(treeData[0]);
			}
		}
	}
	//树节点ajax完成事件
	function ajaxCompete(event,treeId,treeNode,msg){}
	return {
		init:							init,
		setTreenodeCheck:				setTreenodeCheck,
		updateTreenodeCheck:			updateTreenodeCheck				
	}
})(jQuery);
/*******配件选择器 UI end**************/