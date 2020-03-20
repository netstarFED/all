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
			
			//nsForm.data[configObj.formID].formInput.personSelect.rules='';
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
			nsalert( language.ui.nsuipersonselect.configObjError ,'error');
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
			//$(document).on('click',clickOutHandler);
			isShow = true;
		}
	}
	function clickOutHandler(ev){
		console.log($(ev.target));
		console.log($(ev.target).parent().closest('.form-td').length);
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
			console.log( language.ui.nsuipersonselect.consolelog );
		}
	}
	//确认完成
	function confirmComplete() {
		if($planes.hasClass('show')){
			$input.val('');
			closePlane();
			config.resultPersonArr = resultPersonArr;
			//存储历史记录
			if(config.isUsedHistory){
				saveStroe();
			}
			//回调
			if(typeof(config.handler)=='function'){
				config.handler(resultPersonArr);
			}
			if(typeof(config.confirmHandler)=='function'){
				var dataArray = [];
				for(var personI=0; personI<resultPersonArr.length; personI++){
					var currentJson = {};
					for(var keyI=0; keyI<config.personAjax.dataKey.length; keyI++){
						currentJson[config.personAjax.dataKey[keyI]] = resultPersonArr[personI][keyI];
					}
					dataArray.push(currentJson);
				}
				config.confirmHandler(dataArray);
			}
		}else{
			console.log(language.ui.nsuipersonselect.consolelog);
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
			case 2:
			case 3:
				//关闭状态下默认搜索人员 暂时没区分
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
			nsalert(language.ui.pagelast);
		}else if(pageNum<0){
			nsalert(language.ui.pageFirst);
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
			personPlaneHtml = getErrorHtml(language.ui.nsuipersonselect.getErrorHtml);
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
				+'<p>'+language.ui.nsuipersonselect.getHistoryPlaneHtmlA+'</p>'
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
							+'<p>'+language.ui.nsuipersonselect.getHistoryPlaneHtmlB+''+historyListArr.length+''+language.ui.nsuipersonselect.getHistoryPlaneHtmlC+'</p>'
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
				nameStr += '<b style="color:#ff0000; font-weight:normal;">'+language.ui.nsuipersonselect.histryPersonArr+'</b> ';
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
					+'<p>'+language.ui.loading+'</p>'
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
					if(valueArr.length>0){
						$inputMask.addClass('blur');
						$input.focus();
						//$("#"+config.planeID).closest('.form-td').find('.person-select-inputmask').addClass('blur');
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
			html = '<div class="empty">'+language.ui.nsuipersonselect.resultPersonArr+'</div>';
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
					+'<button type="button" class="btn '+confirmBtnCls+'" ns-psvalue="confirm">'+language.ui.setDefaultSuccess+'</button>'
					+'<button type="button" class="btn btn-white" ns-psvalue="cancel">'+language.ui.setDefaultCancel+'</button>'
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
					nsalert(language.ui.nsuipersonselect.resultPersonArr,'warning');
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
		if(typeof(personSelectTree)!='undefined'){
			personSelectTree.destroy();
			personSelectTree = undefined;
		}
		if($inputMask.hasClass('blur')){
			$inputMask.removeClass('blur');
		}
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
		rootNodes.name = language.ui.all;
		rootNodes[config.groupAjax.textField] = language.ui.all;
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
	//选择部门 treeSelect事件  isCheckedChildGroup
	function treeCheckHandler(event,treeId,treeNode){
		var groupID = treeNode[config.groupAjax.valueField];
		var childrenNodes = treeNode.children;//子节点
		var isHasChildNodes = false;//默认不含有子节点
		if(!$.isEmptyObject(childrenNodes)){
			//不为空
			isHasChildNodes = true;
		}
		var isAllGroup = typeof(config.isCheckedChildGroup)=='boolean' ? config.isCheckedChildGroup : false;//默认不关联展示
		if(isAllGroup && isHasChildNodes){
			//关联了并且有子节点
			//获取当前父元素下的所有子节点的groupID
			var groupIdsArr = [];
			function getGroupIdsByChildNodes(childNodes){
				if(!$.isArray(childNodes)){
					return [];
				}
				for(var nodesI=0; nodesI<childNodes.length; nodesI++){
					if($.isArray(childNodes[nodesI].children)){
						getGroupIdsByChildNodes(childNodes[nodesI].children);
					}
					groupIdsArr.push(childNodes[nodesI][config.groupAjax.valueField]);
				}
			}
			getGroupIdsByChildNodes(childrenNodes);
			if(treeNode.checked){
				//选中
				for(var groupI=0; groupI<groupIdsArr.length; groupI++){
					var id = groupIdsArr[groupI];
					for(var personI=0; personI<personArr.length; personI++){
						if(personArr[personI][config.personAjax.groupIndex] == id){
							addPerson(personI);
						}
					}
				}
			}else{
				//取消选中
				var tempRemoveArr = resultPersonArr.concat();
				for(var groupI=0; groupI<groupIdsArr.length; groupI++){
					var id = groupIdsArr[groupI];
					for(var resultPersonI=0; resultPersonI<tempRemoveArr.length; resultPersonI++){
						if(tempRemoveArr[resultPersonI][config.personAjax.groupIndex] == id){
							resultPlaneRemove(tempRemoveArr[resultPersonI][0]);
						}
					}
				}
			}
			refreshGroupPersonPlane(groupIdsArr,treeNode,0);
		}else{
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
			refreshGroupPersonPlane(groupID,treeNode,0);
		}
		personSelectTree.selectNode(treeNode);
	}
	function refreshGroupPersonPlane(groupID,treeNode,start,isCheck){
		//储存当前的临时数据
		currentGroupNode = {
			groupID:groupID,
			treeNode:treeNode,
			start:start,
			isCheck:isCheck
		}
		var isHasChildNodes = false;
		if($.isArray(groupID)){
			isHasChildNodes = true;
		}else{
			if(typeof(groupID)!='string'){
				groupID = groupID.toString();
			}
		}
		var groupPersonArr = [];
		if(isHasChildNodes){
			for(var groupI=0; groupI<groupID.length; groupI++){
				var id = groupID[groupI];
				for(var personI = 0 ; personI<personArr.length; personI++){
					if(personArr[personI][config.personAjax.groupIndex]==id){
						groupPersonArr.push(personArr[personI]);
						if(typeof(isCheck) == 'boolean'){
							personArr[personI][config.mark].isInChecked = isCheck;
						}
						if(personArr[personI][config.mark].isInChecked==true){
							isNeedAdd = true;
						}
					}
				}
			}
		}else{
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
				nextCls = 'disabled';
				end = array.length;
			}
			if(start==0){
				pervCls = 'disabled';
			}
			if(end==(array.length)){
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
	//验证是否合法
	function isValid(config){
		config.resultPersonArr = resultPersonArr;
		var returnValue = true;
		if(config.sRules){
			var errorStr = ''
			if(config.sRules.indexOf('required')>-1){
				//是否必填 required
				returnValue = config.resultPersonArr.length>0
				errorStr = language.ui.required;
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
					errorStr = language.ui.nsuipersonselect.returnValuespanA+firstNum+language.ui.nsuipersonselect.returnValuespanB+secondNum+language.ui.nsuipersonselect.returnValuespanD;
				}
			}
			if(config.sRules.indexOf('max')>-1){
				//最大值 max:5
				config.sRules=(config.sRules).replace(/=/g,':')
				var maxNum = nsVals.getRuleNumber(config.sRules,'max');
				if(config.resultPersonArr.length>maxNum){
					returnValue = false;
					errorStr = language.ui.nsuipersonselect.returnValuespanC+maxNum+language.ui.nsuipersonselect.returnValuespanD;
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
		personSelectTree = undefined;

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