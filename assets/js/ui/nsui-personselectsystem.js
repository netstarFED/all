/********************************************************************
 * 人员选择器
 */
nsUI.systemPerson = (function($) {
 	var globalConfig;					//配置属性
 	var personArr = [];					//人员列表原始所有数据
 	var groupArr = [];					//组织架构ajax获取原始数据
 	var groupJson = {};					//组织架构树初始化原始数据
 	var personDataReady = false;		//是否准备好加载
 	var groupDataReady = false;
	//全局初始化数据部分
 	function init(configObj){
 		var isContinue = false;			//是否继续执行
 		if(typeof(configObj)=='object'){
 			if(!$.isEmptyObject(configObj)){
 				//如果传输的参数是个不为空的object，则可以继续执行
 				isContinue = true;
 			}
 		}
 		if(isContinue){
 			globalConfig = configObj;
 			if($.isArray(globalConfig.personAjax.personArr)){
 				personArr = globalConfig.personAjax.personArr; //支持外部直接赋值
 			}else{
 				personDataInit();
 			}
 			if($.isArray(globalConfig.groupAjax.groupArr)){
 				groupArr = globalConfig.groupAjax.groupArr;	//支持外部直接赋值
 				groupJson = groupDataInit(groupArr);
 			}else{
 				groupDataAjax();
 			}
 		}else{
 			nsalert( language.ui.nsuipersonselect.configObjError ,'error');
			return false;
 		}
 	}
 	//人员列表数据初始化
 	function personDataInit(){
 		//choseInputID,employAjax
		var localDataConfig = globalConfig.personAjax.localDataConfig;
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
				nsalert(language.ui.nsuipersonselect.WidthError,'error');
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
				nsalert(language.ui.nsuipersonselect.autoWidthColumnNum);
			}
		}

		globalConfig.personAjax.columnData  = columnData;			//显示列数据
		globalConfig.personAjax.columnType  = columnType; 		//显示列类型
		globalConfig.personAjax.columnNum   = columnNum; 			//列数量
		globalConfig.personAjax.columnWidth = columnWidth; 		//列宽
		globalConfig.personAjax.columnTitle = columnTitle; 		//标题数组

		globalConfig.personAjax.groupIndex  = groupIndex; 		//部门id的列下标
		globalConfig.personAjax.nameIndex   = nameIndex; 			//人员姓名的列下标
		globalConfig.personAjax.idIndex     = idIndex; 			//ID的列下标
		globalConfig.personAjax.dataSearch  = dataSearch;			//可以搜索的数组
		globalConfig.personAjax.dataKey     = dataKey; 			//key 每个数据对象都有 没有的是-1
		globalConfig.personAjax.dataTitle   = dataTitle; 			//标题 每个数据对象都有 没有的是''

		personDataAjax();
 	}
 	//人员列表数据Ajax，先初始化后发送ajax
 	function personDataAjax(){
 		var employData = typeof(globalConfig.personAjax.data) == 'undefined' ?'':globalConfig.personAjax.data;
		var employType = typeof(globalConfig.personAjax.type) == 'undefined' ?'POST':globalConfig.personAjax.type;
		$.ajax({
			url:			globalConfig.personAjax.url,	
			data:			employData,
			type:			employType,
			dataType: 		"json",
			success: function(data){
				if(data.success){
					personArr = data[globalConfig.personAjax.dataSrc];
					personDataReady = true;
				}else{
					//信息获取失败
				}
			}
		})
 	}
 	//组织架构AJAx
	function groupDataAjax(){
		var deptData = typeof(globalConfig.groupAjax.data) == 'undefined' ?'':globalConfig.groupAjax.data;
		var deptType = typeof(globalConfig.groupAjax.type) == 'undefined' ?'POST':globalConfig.groupAjax.type;
		$.ajax({
			url:			globalConfig.groupAjax.url,	
			data:			deptData,
			type:			deptType,
			dataType: 		"json",
			success: function(data){
				if(data.success){
					groupJson = groupDataInit(data[globalConfig.groupAjax.dataSrc]);
					groupDataReady = true;
				}
			}
		})
	}
	function isInit(){
		var isReturn = false;
		if(personDataReady && groupDataReady){
			isReturn = true;
		}
		return isReturn;
	}
	//组织架构树模型数据结构
	function groupDataInit(data) {
		//添加根节点
		var rootNodes = {};
		rootNodes.name = language.ui.all;
		rootNodes[globalConfig.groupAjax.textField] = language.ui.all;
		rootNodes.id= '-1';
		rootNodes[globalConfig.groupAjax.valueField] = '-1';
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
				children[i].name = children[i][globalConfig.groupAjax.textField];
				children[i].id = children[i][globalConfig.groupAjax.valueField];
				if(ishavechildBool){
					resetData(children[i].children);
				}
			}
		}
		resetData(rootNodes.children);
		return rootNodes;
	}

	var config = {};			
	
	//初始化调用面板
	function planeInit(configObj){

		config[configObj.fullID] = {
			config:configObj,										//配置属性值
			resultPersonArr:[],										//最后结果值
			selectedPersonArr:[],									//默认选中人员
			inputValue:'',											//输入框的值
			planeIndex:0,											//当前面板id，1是person 2是group ,0是关闭
			pageID:0,												//当前页码
			personListArr:personArr,								//人员列表当前数据
			groupListJson:groupJson,								//组织架构当前数据
			currentGroupNode:{},									//储存当前选择的部门节点
			personSelectTree:undefined,								//树是否初始化数据
			container:{},											//包含的容器面板
		}
		config[configObj.fullID].config.sRules=configObj.rules;
		delete config[configObj.fullID].config.rules
		resetPersonAndValue(configObj.fullID,configObj.value);			//选中值的当前数据
		var planeID = configObj.fullID+'-plane';
		var $input = $('#'+configObj.fullID);
		$input.val('');
		var planesHtml = getPlanesHtml(planeID,configObj.fullID);
		$input.closest('.form-group').after(planesHtml);

		//面板
		var $planes = $("#"+planeID);
		var $contentPlanes = $("#"+planeID+' .common-plane');
		var $personPlane = $("#"+planeID+' .person-plane');
		var $groupPlane = $("#"+planeID+' .group-plane');
		var $resultPlane = $("#"+planeID+' .result-plane');

		var $groupPersonPlane = $("#"+planeID+' .group-plane .group-person-plane');
		var $groupPersonPlaneAdd = $groupPersonPlane.find('.group-person-select-button');

		//按钮
		var $inputBtns = $input.parent().children('[ns-control]');
		var $personBtn = $input.parent().children('[ns-control="personInfo"]');
		var $groupBtn = $input.parent().children('[ns-control="groupInfo"]');

		config[configObj.fullID].container = {
			$input:$input,										//搜索框
			$planes:$planes,									//所有面板	
			$contentPlanes:$contentPlanes,						//左侧内容面板集合	
			$personPlane:$personPlane,							//人员列表面板
			$groupPlane:$groupPlane,							//组织结构面板
			$resultPlane:$resultPlane,							//结果面板
			$groupPersonPlane:$groupPersonPlane,				//组织结构面板上的人员面板	
			$groupPersonPlaneAdd:$groupPersonPlaneAdd,			//批量添加按钮
			$inputBtns:$inputBtns,								//所有按钮							
			$personBtn:$personBtn,								//人员按钮						
			$groupBtn:$groupBtn,								//组织按钮						
			$inputMask:undefined,								//input显示框
			$inputMaskClose:undefined,							//input显示框的关闭按钮	
		}
		refreshResultPlane(configObj.fullID);					//刷新结果面板
		if(config[configObj.fullID].selectedPersonArr.length > 0){
			config[configObj.fullID].container.$inputMask.addClass('blur');
		}
		//加载按钮监听器
		$input.on('focus',function(ev){
			var fullID = $.trim($(this).attr('id'));
			var planeIndex = config[fullID].planeIndex;
			if(config[fullID].container.$inputMaskClose.length == 0){
				config[fullID].resultPersonArr = [];
				config[fullID].selectedPersonArr = [];
			}
			if(planeIndex==0){
				planeShow(fullID);
				changePlaneState('person',fullID);
				groupPlaneShow(fullID);
			}else if(planeIndex==1){
				refreshPersonPlane(fullID);
			}
		});
		//输出代码
		$personBtn.on('click',function(ev){
			var fullID = $.trim($(this).parent().children('input[type="text"]').attr('id'));
			planeShow(fullID);
			changePlaneState('person',fullID);
			groupPlaneShow(fullID);
		});
		$groupBtn.on('click',function(ev){
			var fullID = $.trim($(this).parent().children('input[type="text"]').attr('id'));
			planeShow(fullID);
			changePlaneState('group',fullID);
			groupPlaneShow(fullID);
		});
	}
	//显示活动面板
	function planeShow(fullID){
		var container = config[fullID].container;
		var $input = container.$input;
		var $planes = container.$planes;
		$input.parent().children('.has-error').remove();
		if($planes.hasClass('show')){
			//已经打开
		}else{
			$planes.addClass('show');
			$input.on('keyup',inputKeyupHandler);
			$(document).on('keyup',documentKeyupHandler);
			//$(document).on('click',clickOutHandler);
		}
	}
	function refreshPersonPlane(fullID,pageNum){
		var $personPlane = config[fullID].container.$personPlane;
		var $input = config[fullID].container.$input;
		//isSetCurrent 是否设置默认选中第一条
		$personPlane.html(getPersonPlaneHtml(pageNum,fullID));
		$personPlane.find('.state .page span.able').on('click',function(ev){
			var value = $(this).attr('ns-psvalue');
			var pageID = config[fullID].pageID;
			if(value=='+1'){
				toPage(pageID+1,fullID);
			}else if(value == '-1'){
				toPage(pageID-1,fullID);
			}

		});
		var isInputFocus = $input.is(':focus');
		if(isInputFocus){
			$personPlane.children('[class="plane-content"]').eq(0).addClass('current');
		}
		$personPlane.children('.plane-content').not('.empty').not('.disabled').on('click',function(ev){
			var arrIndex = parseInt($(this).attr('ns-psindex'));
			addPerson(arrIndex,fullID);
		});
	}
	//人员选择翻页
	function toPage(pageNum,fullID){
		var personListArr = config[fullID].personListArr;
		if(pageNum>Math.ceil(personListArr.length/10)-1){
			nsalert(language.ui.pagelast);
		}else if(pageNum<0){
			nsalert(language.ui.pageFirst);
		}else{
			refreshPersonPlane(fullID, pageNum);
			config[fullID].pageID = pageNum;
		}
	}
	//选择人员
	function addPerson(index,fullID){
		if(config[fullID].selectedPersonArr.indexOf(index)>-1){
			//已经选中
		}else{
			config[fullID].selectedPersonArr.push(personArr[index][globalConfig.personAjax.idIndex]);
			config[fullID].resultPersonArr.push(personArr[index]);
			refreshPersonPlane(fullID);
			refreshResultPlane(fullID);
		}
	}
	function refreshGroupPersonPlane(fullID){
		// /groupID,treeNode,start,isCheck
		//储存当前的临时数据
		var currentGroupNode = config[fullID].currentGroupNode;
		var groupID = currentGroupNode.groupID;
		var treeNode = currentGroupNode.treeNode;
		var start = currentGroupNode.start;
		if(typeof(groupID)!='string'){
			groupID = groupID.toString();
		}
		var groupPersonArr = [];
		for(var personI = 0 ; personI<personArr.length; personI++){
			if(personArr[personI][globalConfig.personAjax.groupIndex]==groupID){
				groupPersonArr.push(personArr[personI]);
			}
		}
		var html = getGroupPersonHtml(groupPersonArr,treeNode,start,config[fullID].selectedPersonArr);
		$groupPersonPlane = config[fullID].container.$groupPersonPlane;
		$groupPersonPlaneAdd = config[fullID].container.$groupPersonPlaneAdd;
		$groupPersonPlane.html(html);
		$groupPersonPlaneAdd = $groupPersonPlane.find('.group-person-select-button');
		
		$groupPersonPlane.children('.group-person-list').children('.plane-content').not('.disabled').on('click',function(ev){
			var $checkedLi = $(this);
			var index = parseInt($checkedLi.attr('ns-psindex'));
			groupPersonConfirm(index,fullID);
		});
		//批量添加人员按钮
		$groupPersonPlaneAdd.on('click',function(ev){
			if($(this).hasClass('able')){
				var checkedArr = $groupPersonPlane.children('.group-person-list').children('.checked');
				for(var i=0; i<checkedArr.length; i++){
					var index = parseInt(checkedArr.eq(i).attr('ns-psindex'));
					groupPersonConfirm(index,fullID);
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
			config[fullID].currentGroupNode = {
				groupID:groupID,
				treeNode:treeNode,
				start:toPageNumber,
				isCheck:undefined
			}
			refreshGroupPersonPlane(fullID);
		})
	}
	//群组人员面板-获取人员列表及面板翻页按钮
	function getGroupPersonHtml(groupPersonArr, treeNode, start,selectedPersonArr){
		var html = '';
		if(groupPersonArr.length>0){
			var end = start+10;
			if(end>groupPersonArr.length){
				end = groupPersonArr.length;
			}
			for(var i=start; i<end; i++){
				var cls = '';
				if(selectedPersonArr.indexOf(groupPersonArr[i][globalConfig.personAjax.idIndex])>-1){
					cls =' disabled';
				}else{
					cls =' checked';
				}
				html += 
					'<div class="plane-content '+cls+'" ns-psindex="'+groupPersonArr[i][0]+'">'
						+'<a href="javascript:void(0);">'
							+'<span>'+(i+1)+'</span>'
							+'<span>'+groupPersonArr[i][globalConfig.personAjax.nameIndex]+'</span>'
						+'</a>'
					+'</div>'
			}
		}
		html = 
		'<div class="group-person-list">'
			+'<div class="plane-content plane-title">'
				+'<span>'+treeNode[globalConfig.groupAjax.textField]+'</span>'
			+'</div>'
			+html
		+'</div>'
		var stateHtml = getStateHtml(groupPersonArr,start);
		html = html + stateHtml;
		return html;
	}
	//群组人员面板-确认操作
	function groupPersonConfirm(index,fullID){
		var $groupPersonPlane = config[fullID].container.$groupPersonPlane;
		var $checkedLi = $groupPersonPlane.find('[ns-psindex="'+index+'"]');
		$checkedLi.removeClass('checked');
		$checkedLi.addClass('disabled');
		$checkedLi.off('click');
		addPerson(index,fullID);
	}
	function groupPlaneShow(fullID){
		if(typeof(config[fullID].personSelectTree)=='undefined'){
			var treeSetting = {
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
			var groupListJson = config[fullID].groupListJson;
			config[fullID].personSelectTree = $.fn.zTree.init($('#'+fullID+'-treeul'), treeSetting, groupListJson);
			var rootTreeNode = config[fullID].personSelectTree.getNodeByTId('personSelect-treeul_1');
			var currentGroupNode = {
				groupID:'-1',
				treeNode:rootTreeNode,
				start:0,
				isCheck:undefined
			}
			config[fullID].currentGroupNode = currentGroupNode;
			config[fullID].personSelectTree.selectNode(rootTreeNode);
			refreshGroupPersonPlane(fullID);
		}
	}
	//点击部门 treeClick事件
	function treeClickHandler(event,treeId,treeNode,clickFlag){
		var groupID = treeNode[globalConfig.groupAjax.valueField];
		var fullID = treeId.substring(0,treeId.length-7);
		config[fullID].currentGroupNode = {
			groupID:groupID,
			treeNode:treeNode,
			start:0,
			isCheck:undefined
		}
		refreshGroupPersonPlane(fullID);
	}
	//选择部门 treeSelect事件
	function treeCheckHandler(event,treeId,treeNode){
		var fullID = treeId.substring(0,treeId.length-7);
		var groupID = treeNode[globalConfig.groupAjax.valueField];
		if(treeNode.checked){
			//选中
			for(var personI=0; personI<personArr.length; personI++){
				if(personArr[personI][globalConfig.personAjax.groupIndex] == groupID){
					addPerson(personI,fullID);
				}
			}
		}else{
			//取消选中
			var resultPersonArr = config[fullID].resultPersonArr;
			var tempRemoveArr = resultPersonArr.concat();
			for(var resultPersonI=0; resultPersonI<tempRemoveArr.length; resultPersonI++){
				if(tempRemoveArr[resultPersonI][globalConfig.personAjax.groupIndex] == groupID){
					resultPlaneRemove(tempRemoveArr[resultPersonI][0],fullID);
				}
			}
		}
		config[fullID].personSelectTree.selectNode(treeNode);
		config[fullID].currentGroupNode = {
			groupID:groupID,
			treeNode:treeNode,
			start:0,
			isCheck:undefined
		}
		refreshGroupPersonPlane(fullID);
	}
	//删除结果
	function resultPlaneRemove(index,fullID){
		var resultPersonArr = config[fullID].resultPersonArr;
		var selectedPersonArr = config[fullID].selectedPersonArr;
		for(var i=0; i<resultPersonArr.length; i++){
			if(personArr[index]==resultPersonArr[i]){
				resultPersonArr.splice(i,1);
				selectedPersonArr.splice(i,1);
			}
		}
		var planeIndex = config[fullID].planeIndex;
		$groupPlane = config[fullID].container.$groupPlane;
		refreshResultPlane(fullID);
		if(planeIndex==1){
			refreshPersonPlane(fullID);
		}else if(planeIndex==2){
			$groupPlane.find('.curSelectedNode').click();
		}
	}
	function inputKeyupHandler(ev){
		var fullID = $(this).attr('id');
		var inputValue = config[fullID].inputValue;
		var planeIndex = config[fullID].planeIndex;
		var isUseListData = false;
		var $input = config[fullID].container.$input;
		if(inputValue == $.trim($input.val())){
			//如果相等则不用重新搜索
			isUseListData = true;
		}else{
			inputValue = $.trim($input.val());
			config[fullID].inputValue = inputValue;
		}
		switch(planeIndex){
			//1是person 2是group ,0是关闭
			case 0:
			case 1:
			case 2:
				//关闭状态下默认搜索人员 暂时没区分
				if(!isUseListData){
					config[fullID].personListArr = searchPersonValue(inputValue,fullID);
					refreshPersonPlane(fullID);
					if(planeIndex!=1){
						changePlaneState('person',fullID);
					}
				}
				break;
		}
	}
	//搜索字符串，返回值为包含value的数组
	function searchPersonValue(value,fullID){
		var arr = [];
		if(value!=''){
			for(var personI = 0; personI<personArr.length; personI++){
				var isInRusult = false;
				for(var dsI=0; dsI<globalConfig.personAjax.dataSearch.length; dsI++){
					var dataValue = personArr[personI][globalConfig.personAjax.dataSearch[dsI]];
					if(typeof(dataValue)!='string'){
						if(typeof(dataValue)=='boolean'){
							dataValue = dataValue.toString();
						}else if(typeof(dataValue)=='number'){
							dataValue = String(number);
						}else{
							dataValue = '';
						}
						
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
		config[fullID].pageID = 0;
		return arr;
	}
	function documentKeyupHandler(ev){
		var fullID = $(ev.target).attr('id');
		if(!$.isEmptyObject(config[fullID])){
			var $input = config[fullID].container.$input;
			var $personPlane = config[fullID].container.$personPlane;
			var pageID = config[fullID].pageID;
			switch(ev.keyCode){
				case 32:
					//空格是添加
					if($input.val().indexOf(' ')>-1){
						//input中有空格，过滤掉输入法的空格事件
						var selectItem = $personPlane.children('.current');
						if(selectItem.length==1){
							var index = parseInt(selectItem.attr('ns-psindex'));
							addPerson(index,fullID);
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
										toPage(pageID+1,fullID);
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
									toPage(pageID-1,fullID);
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
					toPage(pageID+1,fullID);
					break;
				case 37:
					//左 翻上一页
					toPage(pageID-1,fullID);
					break;
				case 13:
					//确认完成
					confirmComplete(fullID);
					break;
				default:
					break;
			}
		}
	}
	//改变面板状态
	function changePlaneState(planeName,fullID){
		var $personPlane = config[fullID].container.$personPlane;
		var $contentPlanes = config[fullID].container.$contentPlanes;
		var $groupPlane = config[fullID].container.$groupPlane;
		var $inputBtns = config[fullID].container.$inputBtns;
		var $groupBtn = config[fullID].container.$groupBtn;
		var $personBtn = config[fullID].container.$personBtn;
		switch(planeName){
			case 'person':
				config[fullID].planeIndex = 1;
				if(!$personPlane.hasClass('show')){
					$contentPlanes.filter('.show').removeClass('show');
					$personPlane.addClass('show');
					//修改按钮状态
					$inputBtns.filter('.current').removeClass('current');
					$personBtn.addClass('current');
					refreshPersonPlane(fullID);
				}else{
					$contentPlanes.filter('.show').removeClass('show');
					$personPlane.addClass('show');
					//修改按钮状态
					$inputBtns.filter('.current').removeClass('current');
					$personBtn.addClass('current');
					refreshPersonPlane(fullID);
				}
				break;
			case 'group':
				config[fullID].planeIndex = 2;
				if(!$groupPlane.hasClass('show')){
					$contentPlanes.filter('.show').removeClass('show');
					$groupPlane.addClass('show');
					$inputBtns.filter('.current').removeClass('current');
					$groupBtn.addClass('current');
					if(!$.isEmptyObject(config[fullID].currentGroupNode)){
						refreshGroupPersonPlane(fullID);
					}
				}
				break;
		}
	}
	/******
	*传值id
	*赋值value
	*******/
	//默认赋值
	function resetPersonAndValue(fullID,valueArr){
		//是否需要value赋值 如果是空，也不需要
		var isHaveValue = $.isArray(valueArr);
		config[fullID].resultPersonArr = [];
		config[fullID].selectedPersonArr = [];
		if(isHaveValue){
			if(valueArr.length<=0){
				isHaveValue = false;
			}
		}
		if(isHaveValue){
			//存在value默认值的情况
			for(var i=0; i<personArr.length; i++){
				for(var valueI=0; valueI<valueArr.length; valueI++){
					if(personArr[i][globalConfig.personAjax.idIndex]==valueArr[valueI]){
						config[fullID].resultPersonArr.push(personArr[i]);
						config[fullID].selectedPersonArr.push(personArr[i][globalConfig.personAjax.idIndex]);
					}
				}
			}
		}
	}
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
					+'<span>'+language.ui.nsuipersonselect.inputMaskHtmlspan+'：'+array.length+''+language.ui.nsuipersonselect.getHistoryPlaneHtmlC+'</span>'
				+'</div>'
		}else{
			stateHtml = '<div class="state-empty">'+language.ui.nsuipersonselect.stateEmpty+'</div>';
		}
		return stateHtml;
	}
	//输出面板
	function getPlanesHtml(planeID,fullID){
		var planesHtml = '';
		var personPlaneHtml = '';
		var groupPlaneHtml = '';
		var resultPlaneHtml = '';
		personPlaneHtml = getPersonPlaneHtml(0,fullID);
		groupPlaneHtml = getGroupPlaneHtml(fullID);
		//宽度大于等于9之后，则结果面板在内部
		var planeStyle = '';
		if(config.column>=9){
			//宽度超出
			planeStyle = 'style="right:328px;"';
		}
		planesHtml = 
			'<div class="person-select-plane" '+planeStyle+' id="'+planeID+'">'
				+'<div class="person-plane common-plane">'+personPlaneHtml+'</div>'
				+'<div class="group-plane common-plane">'+groupPlaneHtml+'</div>'
				+'<div class="result-plane">'+resultPlaneHtml+'</div>'
			+'</div>';
		return planesHtml;
	}
	//刷新结果面板
	function refreshResultPlane(fullID){
		//刷新结果面板
		var $resultPlane = config[fullID].container.$resultPlane;
		$resultPlane.html(getResultPlaneHtml(config[fullID].resultPersonArr));
		$resultPlane.children('.person-label').on('click',function(ev){
			var index = parseInt($(this).attr('ns-psindex'));
			resultPlaneRemove(index,fullID);
		});
		$resultPlane.find('.btn-plane .btn').on('click',function(ev){
			var value = $(this).attr('ns-psvalue');
			if(value=='cancel'){
				closePlane(fullID);
			}else if(value=='confirm'){
				if($(this).attr('class').indexOf('success')>-1){
					confirmComplete(fullID);
				}else{
					nsalert(language.ui.nsuipersonselect.resultPersonArr,'warning');
				}
			}
		})
		var $input = config[fullID].container.$input;
		var $inputMask = $input.parent().children('.person-select-inputmask');
		//刷新输入框蒙版
		var inputMaskHtml = getInputMaskHtml(config[fullID].resultPersonArr);
		if($input.parent().children('.person-select-inputmask').length==0){
			$input.after('<div class="person-select-inputmask"></div>');
			$inputMask = $input.parent().children('.person-select-inputmask');
		}
		$inputMask.html(inputMaskHtml);
		var $inputMaskClose = $inputMask.children('a.close');
		config[fullID].container.$inputMask = $inputMask;
		config[fullID].container.$inputMaskClose = $inputMaskClose;
		$inputMaskClose.on('click',function(ev){
			var fullID = $(this).closest('.person-select-inputmask').prev().attr('id');
			resultPlaneRemoveAll(fullID);
		})
	}
	function getInputMaskHtml(resultPersonArr){
		var nameStr = '';
		if(resultPersonArr.length==0){
			nameStr = '';
		}else if(resultPersonArr.length==1){
			nameStr = resultPersonArr[0][globalConfig.personAjax.nameIndex];
			nameStr = '<span class="name">'+nameStr+'</span>';
		}else{
			nameStr = resultPersonArr[0][globalConfig.personAjax.nameIndex];
			nameStr +='、';
			nameStr +=resultPersonArr[1][globalConfig.personAjax.nameIndex];
			if(resultPersonArr.length>2){
				nameStr += language.ui.length;
			}
			nameStr = '<span class="name">'+nameStr+'</span>';
		}
		var inputMaskHtml = 
				nameStr
				+'<span style="display: inline;">'+language.ui.nsuipersonselect.inputMaskHtmlspan+''+resultPersonArr.length+''+language.ui.nsuipersonselect.inputMaskHtmlspanA+'</span>'
				+'<a class="close" id="close" style="display: inline;"></a>';
		if(resultPersonArr.length==0){
			inputMaskHtml = '';
		}
		return inputMaskHtml;
	}
	//删除选择人员面板
	function resultPlaneRemoveAll(fullID){
		config[fullID].resultPersonArr = [];
		config[fullID].selectedPersonArr = [];
		refreshResultPlane(fullID);
		var planeIndex = config[fullID].planeIndex;
		if(planeIndex==1){
			refreshPersonPlane(fullID);
		}
		config[fullID].currentGroupNode = {};
		if(typeof(config[fullID].personSelectTree)!='undefined'){
			config[fullID].personSelectTree.destroy();
			config[fullID].personSelectTree = undefined;
		}
		var $inputMask = config[fullID].container.$inputMask;
		if($inputMask.hasClass('blur')){
			$inputMask.removeClass('blur');
		}
		return true;
	}
	//结果输出html
	function getResultPlaneHtml(resultPersonArr){
		var html = ''
		if(resultPersonArr.length==0){
			html = '<div class="empty">'+language.ui.nsuipersonselect.resultPersonArr+'</div>';
		}else{
			for(var personI=0; personI<resultPersonArr.length; personI++){
				html += 
					'<span class="person-label" ns-psindex="'+resultPersonArr[personI][0]+'">'
						+resultPersonArr[personI][globalConfig.personAjax.nameIndex]
						+'<a href="javascript:void(0);" class="close"></a>'
					+'</span>'
			}
		}
		var confirmBtnCls = 'btn-success'
		if(resultPersonArr<=0){
			confirmBtnCls = 'btn-gray'
		}
		html += '<div class="btn-plane">'
					+'<button type="button" class="btn '+confirmBtnCls+'" ns-psvalue="confirm">'+language.ui.setDefaultSuccess+'</button>'
					+'<button type="button" class="btn btn-white" ns-psvalue="cancel">'+language.ui.setDefaultCancel+'</button>'
				+'</div>'
		return html;
	}
	//人员选择器面板
	function getPersonPlaneHtml(pageNum,fullID){
		var personPlaneHtml = '';
		var personListArr = config[fullID].personListArr;
		var pageID = config[fullID].pageID;
		if(personListArr.length==0){
			personPlaneHtml = getErrorHtml(language.ui.nsuipersonselect.getErrorHtml);
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
				personPlaneHtml+=getPersonPlaneLiHtml(personListArr[plI],plI,fullID);
			}
			if(isHaveEmpty){
				for(var pleI = emptyStart; pleI<emptyEnd; pleI++ ){
					personPlaneHtml+=getPersonPlaneLiHtml('',pleI,fullID);
				}
			}
			personPlaneHtml =  personPlaneHtml +getPersonPlaneTfootHtml(personListArr,start);
		}
		return personPlaneHtml;
	}
	//人员列表循环
	function getPersonPlaneLiHtml(array,index,fullID){
		var inputValue = config[fullID].inputValue;
		var liHtml = '';
		for(var cdI=0; cdI<globalConfig.personAjax.columnData.length; cdI++){
			var textStr = array==''?'':array[globalConfig.personAjax.columnData[cdI]];
			var width = globalConfig.personAjax.columnWidth[cdI];
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
		var currentCls = '';
		if(array!=''){
			if(config[fullID].selectedPersonArr.indexOf(array[globalConfig.personAjax.idIndex]) > -1){
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
	//人员列表底部html
	function getPersonPlaneTfootHtml(personListArr,start){
		var footHtml = ''
		for(var ctI=0; ctI<globalConfig.personAjax.columnTitle.length; ctI++){
			var textStr = globalConfig.personAjax.columnTitle[ctI];
			var width = globalConfig.personAjax.columnWidth[ctI];
			footHtml+='<span style="width:'+width+'">'+textStr+'</span>';
		}
		footHtml = '<div class="plane-content plane-title"><span>&nbsp;</span>'+footHtml+'</div>';
		footHtml += getStateHtml(personListArr,start);

		return footHtml;
	}
	//组织树面板
	function getGroupPlaneHtml(fullID){
		var groupPlaneHtml = '';
		var groupListJson = config[fullID].groupListJson;
		if($.isEmptyObject(groupListJson)){
			//数据为空
		}else{
			groupPlaneHtml = 
				'<div class="tree-plane">'
					+'<ul id="'+fullID+'-treeul'+'" class="ztree"></ul>'
				+'</div>'
				+'<div class="group-person-plane">'
				+'</div>';
		}
		return groupPlaneHtml;
	}
	//错误提示
	function getErrorHtml(errorStr){
		var errorHtml = '<div class="has-error"><p class="tips">'+errorStr+'</p></div>';
		return errorHtml;
	}
	//确认事件
	function confirmComplete(fullID){
		$planes = config[fullID].container.$planes;
		if($planes.hasClass('show')){
			closePlane(fullID);
			//回调
			if(typeof(config[fullID].config.handler)=='function'){
				config[fullID].config.handler(resultPersonArr);
			}
		}else{
			console.log(language.ui.nsuipersonselect.consolelog);
		}
	}
	//取消事件
	function closePlane(fullID){
		$planes = config[fullID].container.$planes;
		$input = config[fullID].container.$input;
		$inputBtns = config[fullID].container.$inputBtns;
		if($planes.hasClass('show')){
			$planes.removeClass('show');
			$input.off('keyup',inputKeyupHandler);
			$(document).off('keyup',documentKeyupHandler);
			$inputBtns.filter('.current').removeClass('current');
			inputMaskSetBlur(fullID);
			config[fullID].planeIndex = 0;
		}else{
			console.log( language.ui.nsuipersonselect.consolelog );
		}
	}
	//inputMask 转化成显示状态
	function inputMaskSetBlur(fullID){
		var $inputMask = config[fullID].container.$inputMask;
		var $input = config[fullID].container.$input;
		if($inputMask.length==1){
			$input.blur();
			$inputMask.addClass('blur');
			$inputMask.one('click',function(ev){
				$inputMask.removeClass('blur');
				$input.focus();
			})
		}
	}
	//得到数据
 	function getData(){
 		console.log(config);
 		console.log(personArr);
 		console.log(groupJson);
 	}
 	function isValid(configs){
 		var $input = config[configs.fullID].container.$input;
 		var returnValue = true;
		if(configs.sRules){
			var errorStr = ''
			if(configs.sRules.indexOf('required')>-1){
				//是否必填 required
				returnValue = config[configs.fullID].resultPersonArr.length>0
				errorStr = language.ui.required;
			}
			if(configs.sRules.indexOf('range')>-1){
				//区域 range:[5,10]
				var validStr = configs.sRules.substring(configs.sRules.indexOf('range'),configs.sRules.length);
				if(validStr.indexOf(' ')>-1){
					validStr = validStr.substring(validStr.indexOf('range'),validStr.indexOf(' '));
				}
				var firstNum = validStr.substring(validStr.indexOf('[')+1,validStr.indexOf(','));
				firstNum = parseInt(firstNum);
				var secondNum = validStr.substring(validStr.indexOf(',')+1,validStr.indexOf(']'));
				secondNum = parseInt(secondNum);
				if(config[configs.fullID].resultPersonArr.length>=firstNum&&config[configs.fullID].resultPersonArr.length<=secondNum){
					
				}else{
					returnValue = false;
					errorStr = language.ui.nsuipersonselect.returnValuespanA+firstNum+language.ui.nsuipersonselect.returnValuespanB+secondNum+language.ui.nsuipersonselect.returnValuespanD;
				}
			}
			if(configs.sRules.indexOf('max')>-1){
				//最大值 max:5
				configs.sRules=(configs.sRules).replace(/=/g,':')
				var maxNum = nsVals.getRuleNumber(configs.sRules,'max');
				if(config[configs.fullID].resultPersonArr.length>maxNum){
					returnValue = false;
					errorStr = language.ui.nsuipersonselect.returnValuespanC+maxNum+language.ui.nsuipersonselect.returnValuespanD;
				}
			}
		}

		if(returnValue == false){
			var	style = 'style="right:128px;"';
			var errorHtml = '<label class="has-error" '+style+'>'+errorStr+'</label>';
			$input.after(errorHtml);
		}
		return returnValue;
 	}
 	//赋值，调用表单或者组件的setValues或者
	function setValue(id,valueArr){
		//setValuesArr:[1,2]或者['12','13']，里面是已经加载完的的person id
		//config = $.extend({}, config, configObj);
		resetPersonAndValue(id,valueArr);
		refreshResultPlane(id);
	}
	function getValue(id){
		return config[id].resultPersonArr;
	}
 	return {
		init:init,  				//初始化方法
		getData:getData,			//获取数据
		planeInit:planeInit,		//初始化面板调用
		isValid:isValid, 			//验证规则
		clear:resultPlaneRemoveAll, //清除
		setValue:setValue,			//设置默认值
		getValue:getValue,			//获取选择值
		isInit:isInit,				//是否初始化完成数据
	}
 })(jQuery);