var nsEditorBoard = (function(){
//编辑器组件
//nsEditorBoard start ------------------------------------------------
var config = {};
var outputPageData = {};
//编辑器初始化入口
function init(_config){
	setDefault(_config); //配置信息
	initPageData();
	initEditorPanel();
	initComponentSource();
}
//初始化属性
function setDefault(_config){
	config = $.extend({}, true, _config);
	//config.packageName = 包名
	//默认packageName是nstest
	if(typeof(config.packageName)!='string'){
		config.packageName = 'nsTempPageName';
	}else if($.trim(config.packageName) == ''){
		config.packageName = 'nsTempPageName';
	}
	nsEditorBoard.config = config;
}
//初始化页面数据对象
function initPageData(){
	outputPageData = {
		components:{},					//用于储存名字
		componentArray:[],				//组件数组
		idSuffixIndex:0, 				//自动编号的ID后缀 递增数字
		packageName:config.packageName 	//包名  之后只使用这个为包名 config.packageName仅用于储存
	}
	nsEditorBoard.outputPageData = outputPageData;
}
//修改包名
function editPackageName(){
	function confirmEdit(){
		var values = nsdialog.getFormJson()
		if(values){
			nsEditorBoard.outputPageData.packageName = values.name;
			var subNameStr = '包名：'+values.name
			var packageArray = values.name.split('.');
			nsDialog.hide();
			//警告信息
			function warningInfo(packageNameStr){
				nsalert('您定义的包名: '+packageNameStr+' 无效','warning');
				subNameStr += '<i class="fa fa-question-circle"></i>';
			}
			if(packageArray.length == 1){
				//只有一级的包名 demo
				warningInfo('您定义的是顶级包');
			}else if(packageArray.length > 1){
				//有多级的包名 demo.demo
				try
				{
					eval(packageArray[0]);
					for(var testI = 0; testI<packageArray.length-1; testI++){
						var testPackageName = packageArray[testI]
						if(typeof(eval(testPackageName))!='object'){
							warningInfo(packageArray[testI]);
							break;
						}
					}
				}
				catch(err)
				{
					var errorPackageName = err.message.substr(0, err.message.indexOf(' is'));
					warningInfo(errorPackageName);
				}
			}
			nsCoverPanels.edit.subTitle('editorSourcePanel', subNameStr);
		}
	}
	var packageName = nsEditorBoard.outputPageData.packageName;
	if(packageName=='nstest'){
		packageName = '';
	}
	var config = {
		id: 	"plane-dialog",
		title: 	"修改包名",
		size: 	"s",
		form:[
			{
				id: 		'name',
				label: 		'包名 package',
				type: 		'text',
				rules: 		'required minlength=3',
				placeholder:'demo.demo',
				value: 		packageName
			}
		],
		btns:[
			{
				text: 		'确认修改',
				handler: 	confirmEdit,
			}
		]
	}
	nsDialog.show(config);
}
//补充组件数据到界面数据
function mergeData(componetData, componentPlusData){
	var componentOriginalData = componentPlusData[componetData.name];
	if(typeof(componentOriginalData)=='undefined'){
		//如果没有则直接用配置文件中的
		nsEditorBoard.component[componetData.name] = componetData;
		return;
	}
	componetData.chineseName = componentOriginalData.chineseName; 		//中文名称
	if(componentOriginalData.defauleParams!=''){
		var params = eval('('+componentOriginalData.defauleParams+')');
		if(typeof(componetData.defauleParams)=='undefined'){
			componetData.defauleParams = {};
		}
		$.each(params,function(key,value){
			if(typeof(componetData.defauleParams[key])=='undefined'){
				componetData.defauleParams[key] = value;
			}
		});
	}
	componetData.windowCode = componentOriginalData.windowCode; //编辑窗体代码
	//可用区域的默认属性
	//转换数字为像素值
	if(typeof(componetData.availableZone)=='undefined'){
		zoneData = {
			top:0,
			left:0,
			height:"auto",
			width:"100%"
		}
		componetData.availableZone = zoneData;
	}
	//Form元素的默认属性
	if(componetData.parentName == 'Form'){
		if(typeof(componetData.baseAttr.isForm)=='undefined'){
			componetData.baseAttr.isForm = true;
		}
	}
	nsEditorBoard.component[componetData.name] = componetData;
}
//初始化界面对象
function initEditorPanel(){
	//资源面板
	nsCoverPanels.left({
		id:'editorSourcePanel',
		plusClass:'source',
		title:'资源',
		titleinfo:'选择资源',
		containerID:'nsEditorBoard',
		btnsArray:[
				{
					text: 		'修改包名',
					handler: 	nsEditorBoard.editPackageName
				}
		]
	})
	//属性面板
	nsCoverPanels.left({
		id:'editorAttrPanel',
		plusClass:'attr',
		title:'属性',
		hidden:true,
		titleinfo:'当前组件：',
		containerID:'nsEditorBoard',
		btnsArray:[
				{
					text: 		'保存',
					handler: 	nsEditorBoard.savePanelAttr
				},
				{
					text: 		'取消',
					handler: 	function(){
						nsCoverPanels.edit.visible('editorAttrPanel', false);
					}
				}
		],
		plusHtml:'<div id="editorAttrPanelForm" class="panel-attrform"></div>',
	})

	//创建主要的DOM对象
	nsEditorBoard.$container = $('#nsEditorBoard');
	nsEditorBoard.$container.addClass('nseditor-board');
	var boardHtml = '';
	//画布
	boardHtml += '<div id="nsEditorBoardCanvas" class="canvas"></div>';
	//背景
	boardHtml += '<div id="nsEditorBoardBackground" class="background"></div>';
	nsEditorBoard.$container.append(boardHtml);
	nsEditorBoard.$canvas = $('#nsEditorBoardCanvas');
	nsEditorBoard.$bg = $('#nsEditorBoardBackground');
	nsEditorBoard.config.availableWidth = $('#nsEditorBoardCanvas').outerWidth();
	nsEditorBoard.config.availableHeight = $('#nsEditorBoardCanvas').outerHeight();
}
//数据源初始化
function initComponentSource(){
	var panelData;
	var componentPlusData = {};
	nsEditorBoard.component = {};
	nsVals.ajax(config.panelAjax ,function(res){
		//载入服务器面板配置文件
		panelData = res[config.panelAjax.dataSrc];
		nsVals.ajax(config.componentsAjax ,function(res){
			//载入服务器组件配置文件
			//componentPlusData = res[config.componentsAjax.dataSrc];
			for(var cI = 0; cI<res[config.componentsAjax.dataSrc].length; cI++){
				var componentData = res[config.componentsAjax.dataSrc][cI];
				//console.log(componentData.name);
				componentPlusData[componentData.name] = componentData;
			}
			for(var dI = 0; dI<panelData.length; dI++){
				//console.log(data[dI].chineseName)
				var componetData = panelData[dI];
				mergeData(componetData, componentPlusData);
				if(panelData[dI].children){
					for(var cI = 0; cI<panelData[dI].children.length; cI++){
						var componetData = panelData[dI].children[cI];
						mergeData(componetData, componentPlusData);
					}
				}
				
			}
			//将资源追加到面板
			nsCoverPanels.list({
				containerID:'editorSourcePanel', //容器ID
				keyField:'name', //类别名称
				textField:'chineseName', //面板显示名字
				data:panelData,
			})
			initComponentHandler(panelData);
		})
	})
}
//初始化组件动作
function initComponentHandler(panelData){
	$('#editorSourcePanel [ns-componentindex]').on('mousedown',function(ev){
		var $source = $(this);
		var componentindex = parseInt($source.attr('ns-componentindex'));
		var tabindex = parseInt($source.attr('ns-tabindex'));
		var componentData = panelData[tabindex].children[componentindex];
		var componentClass = $source.attr('ns-key');

		var itemObj = {
			$source:$source, 			//点击对象
			class:componentClass,		//分类 Modal Layout Form Tabel等
			event:ev, 					//事件
			data:componentData 			//对应数据
		}
		dragItemStart(itemObj)
	})
}
//拖拽组件
function dragItemStart(itemObj){
	// itemObj.$source:$source, 			//点击对象
	// tiemObj.class 						//组件分类
	// itemObj.event:event, 				//事件
	// itemObj.data:componentData 			//对应数据

	//把画板设为编辑状态
	nsEditorBoard.$canvas.addClass('editstate');
	//拖拽对象
	var dragItem = getDragItem(itemObj);   //返回位置 和 $dom元素
	var itemPosition = dragItem.position;
	//可用区域x1,x2,y1,y2
	var zoneXYArray = getAvailableZone(itemObj); 						//显示可用区域,返回可用区域x1y1x2y2
	// //获取同级元素
	// var sameLevelComponents = [];
	// if(nsEditorBoard.pageData.componentArray){
	// 	for(var slcI = 0; slcI<nsEditorBoard.pageData.componentArray.length;  slcI++){
	// 		if(nsEditorBoard.pageData.componentArray[slcI].parentId == itemObj.data.parentId){
	// 			sameLevelComponents.push(nsEditorBoard.pageData.componentArray[slcI]);
	// 		}
	// 	}
	// }
	//拖拽方法
	var $drag = dragItem.$dom;
	var isAvailable = false;
	var availableIndex = -1;
	function moveDragItem(ev){
		itemPosition.left = ev.pageX-itemPosition.mouseX;
		itemPosition.top = ev.pageY-itemPosition.mouseY;
		$drag.css({'top':itemPosition.top, 'left':itemPosition.left});
		var availableData = isAvailableZone(dragItem, zoneXYArray);
		isAvailable = availableData.isAvailable;
		availableIndex = availableData.index;
	}
	$(document).on('mousemove',function(ev){ 
		//移动拖拽对象
		moveDragItem(ev);
	});
	$(document).on('mouseup',function(ev){
		//结束拖拽
		$(document).off('mousemove');
		$(document).off('mouseup');
		//处理拖拽对象
		moveDragItem(ev);

		if(isAvailable){
			//判断父级元素是那个
			var parentData = false;
			var componentData = itemObj.data;
			

			
			// if($zones){
			// 	var nsId = $zones.eq(availableIndex).attr('nsid');
			// 	parentData = nsEditorBoard.pageData.components[nsId];
			// }
			// //判断同级元素中位置
			// var sortIndex = sameLevelComponents.length;
			// if(sameLevelComponents.length>0){
			// 	var sameLevelComponentPositonArray = []; //同级别的元素的位置值数组
			// 	for(var slcI = 0; slcI<sameLevelComponents.length; slcI++){
			// 		var slcOffset = sameLevelComponents[slcI].$container.offset();
			// 		var slcZoneXY = {
			// 			x1:slcOffset.left,
			// 			x2:slcOffset.left + sameLevelComponents[slcI].$container.outerWidth(),
			// 			y1:slcOffset.top + bgOffset.top,
			// 			y2:slcOffset.top + sameLevelComponents[slcI].$container.outerHeight(),
			// 		}
			// 		sameLevelComponentPositonArray.push(slcZoneXY);
			// 	}
			// 	var availableZoneData = isAvailableZone(dragItem, sameLevelComponentPositonArray);
			// 	if(availableZoneData.isAvailable){
			// 		sortIndex = availableZoneData.index;
			// 	}
			// }else{
			// 	//sortIndex = 0;
			// }
			var sortIndex = getComponentSortIndex(itemObj);
			addComponent(itemObj, sortIndex, parentData);
			
			if(outputPageData.layout){
				refreshCanvas();
			}
		}
		//处理可用区域
		nsEditorBoard.$canvas.removeClass('editstate'); //去掉编辑状态
		nsEditorBoard.$bg.find('.availablezone'); 		//移除可用区域
		$drag.remove();
		
	})
}
//输出拖拽组件到页面
function getDragItem(itemObj){
	//位置对象
	var sourceEvent = itemObj.event;
	var sourceOffset = itemObj.$source.offset();
	
	var position = {
		mouseX: itemObj.event.offsetX,
		mouseY: itemObj.event.offsetY,
		left: sourceOffset.left,
		top: sourceOffset.top,
		width:itemObj.$source.outerWidth(),
		height:itemObj.$source.outerHeight(),
	}

	//添加拖拽对象
	var positionStyle = 
			 'left:'+position.left+'px; '
			+'top:'+position.top+'px; '
			+'width:'+position.width+'px; '
			+'height:'+position.height+'px;'
	var itemHtml = 
		 '<div id="nsEditorBoardDragItem" class="nseditor-board-dragitem" style="'+positionStyle+'">'
		+ 	itemObj.data.chineseName
		+'</div>';
	if($('#nsEditorBoardDragItem').length>0){
		$('#nsEditorBoardDragItem').remove();
	}
	nsEditorBoard.$container.append(itemHtml);
	return {
		position: position,
		$dom: $('#nsEditorBoardDragItem'),
	};
}
//显示可用区域
function getAvailableZone(itemObj){
	//返回值{zoneNumber:{top:0,left:0,height:0; width:0},zoneString} 
	//zoneNumber的位置top, left, height, width 是相对于画板的位置
	//显示可用区域
	var zoneData = itemObj.data.availableZone;
	var zoneXYArray = []
	//生成可用区域代码
	function getHtml(zoneString){
		var zoneStyle = '';
		zoneStyle =   'left:'+zoneString.left+';';  				//top
		zoneStyle += ' top:'+zoneString.top+';';					//left
		zoneStyle += ' width:'+zoneString.width+'; '; 				//width
		zoneStyle += ' height:'+zoneString.height+';'; 				//heigth
		zoneStyle = ' style="'+zoneStyle+'"';
		var html ='<div class="availablezone" '+zoneStyle+'></div>';
		return html;
	}

	if(typeof(zoneData.parentCls)=='undefined'){
		//如果没有指定父容器，则全屏查找位置
		var zoneString = {};  	//保存显示用的字符串
		var zoneNumber = {}; 	//保存数字

		$.each(zoneData, function(key,value){
			if(typeof(value)=='number'){
				zoneString[key] = value+'px';
				zoneNumber[key] = value;
			}else if(typeof(value)=='string'){
				if(value=='auto'){
					zoneString[key] = nsEditorBoard.config.availableHeight+'px';
					zoneNumber[key] = nsEditorBoard.config.availableHeight;
				}else{
					zoneString[key] = value;
					zoneNumber[key] = parseFloat(value.substr(0, value.length-1))/100*nsEditorBoard.config.availableWidth;
				}
				
			}
		})
		var html = getHtml(zoneString);
		zoneNumber = [zoneNumber];
		zoneString = [zoneString];
	}else{
		//指定了父容器
		var html = '';
		if(typeof(zoneData.parentCls)=='string'){
			zoneData.parentCls = [zoneData.parentCls]
		}
		var $zones;
		var zoneNumberArray = [];
		var zoneStringArray = [];
		for(var pclsI = 0; pclsI<zoneData.parentCls.length; pclsI++){
			var pcls = zoneData.parentCls[pclsI];
			$zones = nsEditorBoard.$container.find(pcls);
			for(var zoneI = 0; zoneI<$zones.length; zoneI++){
				var $zone = $zones.eq(zoneI);
				var zonePostion = $zone.position();
				zonePostion.width = $zone.outerWidth();
				zonePostion.height =  $zone.outerHeight();

				var zoneString = {};  	//保存显示用的字符串
				var zoneNumber = {}; 	//保存数字

				$.each(zonePostion, function(key, value){
					zoneNumber[key] = value;
					zoneString[key] = value + 'px';
				})
				zoneNumberArray.push(zoneNumber);
				zoneStringArray.push(zoneString);
				html += getHtml(zoneString);
			}
		}
	}
	nsEditorBoard.$bg.find('.availablezone').remove();
	nsEditorBoard.$bg.append(html);
	//zoneNumber的位置top, left, height, width 是相对于画板的位置
	var bgOffset = nsEditorBoard.$bg.offset();
	for(var zoneI = 0; zoneI<zoneNumber.length; zoneI++){
		var zoneXY = {
			x1:zoneNumber[zoneI].left + bgOffset.left,
			x2:zoneNumber[zoneI].left + zoneNumber[zoneI].width + bgOffset.left,
			y1:zoneNumber[zoneI].top + bgOffset.top,
			y2:zoneNumber[zoneI].top + zoneNumber[zoneI].height + bgOffset.top,
		}
		zoneXYArray.push(zoneXY);
	}
	return zoneXYArray;
}
//是否可用
function isAvailableZone(dragItem, zoneArray){
	//$drag是拖拽对象
	//zoneXY是可用区域 {x1:0,x2:50, y1:0, y2:50}
	var $drag = dragItem.$dom;
	var offsetXY = $drag.offset();
	var dragXY = {
		x1:offsetXY.left,
		x2:offsetXY.left + dragItem.position.width,
		y1:offsetXY.top,
		y2:offsetXY.top + dragItem.position.height
	}
	var isAvailable = false; //整体是否在
	var AvailableIndex = -1;
	for(var zoneI = 0; zoneI<zoneArray.length; zoneI++){
		var isCurrentZoneAvailable = true;  //当前区域是否在可用区域里
		var zoneXY = zoneArray[zoneI];
		if(dragXY.y1>zoneXY.y2 || dragXY.y2<zoneXY.y1){
			isCurrentZoneAvailable = false
		}
		if(isCurrentZoneAvailable){
			if(dragXY.x1>zoneXY.x2 || dragXY.x2<zoneXY.x1){
				isCurrentZoneAvailable = false
			}
		}
		if(isCurrentZoneAvailable){
			isAvailable = isCurrentZoneAvailable;
			AvailableIndex = zoneI
		}
	}
	
	if(isAvailable){
		if(!$drag.hasClass('available')){
			$drag.addClass('available');
		}
	}else{
		if($drag.hasClass('available')){
			$drag.removeClass('available');
		}
	}
	return {
		isAvailable:isAvailable,
		index:AvailableIndex,
	};
}
//添加组件到界面
function addComponent(itemObj, sortIndex, parentData){
	var componetData = getComponentData(itemObj.data);
	//如果是layout标签
	var sortIndex = 0;
	if(componetData.baseAttr.isLayout){
		if(typeof(outputPageData.layout)=='undefined'){
			outputPageData.layout = getComponentData(nsEditorBoard.component["Layout"]);
			outputPageData.layout.children = [];
			sortIndex = 0;
		}
		outputPageData.layout.children.push(componetData);
	}
}
//初始化组件数据
function getComponentData(_componentData){
	outputPageData.idSuffixIndex ++;  //后缀递增
	var componentData =  $.extend(true, {}, _componentData); //复制元素属性
	componentData.baseAttr.idSuffix = outputPageData.idSuffixIndex;
	componentData.config = {};
	$.each(componentData.defauleParams, function(key,value){
		componentData.config[key] = value;
	})
	componentData.baseAttr.idSuffixIndex = outputPageData.idSuffixIndex;
	//layout的特殊处理
	if(componentData.name == 'Layout'){
		// outputPageData.layoutId = outputPageData.packageName.replace(/\./g,'-');
		// componentData.config.packageName = outputPageData.packageName;
		// componentData.config.layoutID = outputPageData.layoutId;
	}
	return componentData;
}
//初始化组件顺序
function getComponentSortIndex(itemObj){
	var sortIndex = 0;
	//如果是第一个组件，就肯定是0
	if(typeof(outputPageData.layout)=='undefined'){
		return 0;
	}
	//如果必须要第一个，也返回0，排到最前面
	if(itemObj.data.baseAttr.isOnlyFirst){
		return 0;
	}
	console.log(itemObj);
	//同级元素数组
	var sameLevelComponents = [];
	//layout元素的同级元素
	if(itemObj.data.baseAttr.isLayout){
		if(typeof(outputPageData.layout.children)!='undefined'){
			for(var i = 0; i<outputPageData.layout.children.length; i++){
				if(outputPageData.layout.children[i].name != 'Nav'){
					sameLevelComponents.push(outputPageData.layout.children[i]);
				}
			}
			console.log(sameLevelComponents);
		}
	}
	return sortIndex;
}
//刷新页面数据
function refreshCanvasData(){
	//layout的属性
	outputPageData.layoutId = outputPageData.packageName.replace(/\./g,'-');
	outputPageData.layout.config.packageName = outputPageData.packageName;
	outputPageData.layout.config.layoutID = outputPageData.layoutId;
	outputPageData.layout.domId = 'layout-' + outputPageData.layout.config.layoutID;
	//nav panel tabpanel等layout组件

}
//刷新界面
function refreshCanvas(){
	refreshCanvasData();
	var codeObj = {
		html:'',
		js:'',
		package:'',
		layout:''
	};
	//获取代码 关键字替换
	function getCode(componentData){
		$.each(componentData.codeTemplet, function(type,templetCode){
			
			//根据代码模板的类型分开处理

			var code = templetCode;
			//如果代码模板有效且不为空，则进行关键字替换
			var isHaveChildren = !(code.search(/{{children}}/) == -1); //
			if(isHaveChildren){
				code = code.replace(/{{children}}/, codeObj[type]);
			}

			if(typeof(code) == 'string'){
				if(code != ''){
					code = template.render(code, componentData.config);
				}
			}
			//代码模板替换操作
			switch(type){
				case 'layout':
					code = nsEditorBoard.getFormatString.layoutAttr(code);
					break;
			}
			if(isHaveChildren){
				codeObj[type] = code;
			}else{
				codeObj[type] += code;
			}
			
		})
	}
	//根据children标签获取全部代码
	function getAllCode(pageData){
		if(pageData){
			if(pageData.children){
				for(var i=0; i<pageData.children.length; i++){
					getAllCode(pageData.children[i]);
				}
				getCode(pageData);
			}else{
				getCode(pageData);
			}
		}
	}
	getAllCode(outputPageData.layout);
	console.log(outputPageData.layout);
	var canvasCode = getClearCode(codeObj); //取消空余的代码
	console.log(canvasCode);
	nsEditorBoard.$canvas.html(canvasCode);
	//执行layout
	if(codeObj.layout != ''){
		nsLayout.init(nsEditorBoard.outputPageData.layoutId);
	}
}
//获得清理后的代码
function getClearCode(codeObj){
	
	function getClearLayoutCode(str){
		if(str == ''){
			return str;
		}
		var patt1 = /,\s+/g;  //去掉逗号后面的空格
		str = str.replace(patt1, ',');
		var patt2 = /:"/g; 		//补充空缺的逗号
		str = str.replace(patt2, ':,"');
		var patt3=/([A-Za-z]+)[^,]:,/g;  //找到属性值为空的属性， 如‘row:,value:,’
		str = str.replace(patt3, '');
		var patt4=/,"/g; //去掉结尾的逗号
		str = str.replace(patt4, '"');

		//去掉空的config
		var patt5 = /ns-config=""/;
		str = str.replace(patt5, '');
		//去掉多余的空格
		var patt6 = /\s{2,}/g;
		str = str.replace(patt6, '');
		//去掉"  >"中的多余的空格
		var patt7 = /\s+>/;
		str = str.replace(patt7, '>');

		return str
	}
	var codeStr = '';
	codeObj.layout = getClearLayoutCode(codeObj.layout); 
	codeStr = codeObj.layout + codeObj.html + codeObj.package + codeObj.js;
	return codeStr;
}


return {
	init:init, 				//初始化方法
	//config:config,  方法中重建了对象 具体方法在setDefault()中
	//outputPageData:outputPageData, 		//页面数据
	editPackageName:editPackageName, //修改包名

}
//nsEditorBoard end ------------------------------------------------
})(jQuery);
//字符串处理
nsEditorBoard.getFormatString = {
	//layout标签的输出字符串处理
	layoutAttr:function(str){

		//去掉多余字符和空的属性
		var patt1 = /,\s+/g;  //去掉逗号后面的空格
		str = str.replace(patt1, ',');
		var patt2 = /:"/g; 		//补充空缺的逗号
		str = str.replace(patt2, ':,"');
		var patt3=/([A-Za-z]+)[^,]:,/g;  //找到属性值为空的属性， 如‘row:,value:,’
		str = str.replace(patt3, '');
		var patt4=/,"/g; //去掉结尾的逗号
		str = str.replace(patt4, '"');

		//去掉空的config
		var patt5 = /ns-config=""/;
		str = str.replace(patt5, '');
		//去掉多余的空格
		var patt6 = /\s{2,}/g;
		str = str.replace(patt6, '');
		//去掉"  >"中的多余的空格
		var patt7 = /\s+>/;
		str = str.replace(patt7, '>');

		return str
	},
	//获取组件的DOM ID
	domID:function(componetData){
		//componetData 组件数据
		var packageName = nsEditorBoard.outputPageData.packageName; 	//包名
		var str = componetData.baseAttr.fullId; 				//字符串模板

		str = template.render(str, {
			packageName:packageName,
			id:componetData.config.id
		})
		return str;
	}
}