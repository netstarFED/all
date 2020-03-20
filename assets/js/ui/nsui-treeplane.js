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
		if(typeof(config.treeId)=='undefined'){
			config.treeId = 'treeplane-ztree-'+config.id;
		}
		this.tree = {};
		this.tree[config.treeId] = config;
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
		var config = nsUI.treePlane.tree[treeId];
		//var resceiveData = groupDataInit(responseData[config.dataSrc],false);
		var resceiveData = responseData[config.dataSrc];
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
			return children;
		}
		resceiveData = resetData(resceiveData);
		return resceiveData;
	}
	function ajaxComplete(event,treeId,treeNode,msg){
		//console.log(event);
		var treeObj = $.fn.zTree.getZTreeObj(treeId);
		var treeData = treeObj.getNodesByParam("id",treeNode.id);
		treeObj.selectNode(treeData[0]);
		//treeUI.selectedTreeNode(treeId);
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
		if(config.commonChangeHandler){
			setting.callback.onClick = treeCommonClickHandler;
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
		rootNodes[config.textField] = language.ui.all;
		rootNodes[config.valueField] = '-1';
		rootNodes.name = language.ui.all;
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
	function treeCommonClickHandler(event,treeId,treeNode,clickFlag){
		var obj = {
			value:treeNode,
			dom:$('#'+config.treeId),
			type:'treeSelect',
			id:config.treeId,
			config:config
		}
		config.commonChangeHandler(obj);
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
			nsalert( 'id:'+cid+language.ui.nsuitreeplane.getCheckIDs,'error');
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