var formEditor = (function($) {
	var $componentList; 		//组件列表
	var $boardPanel;			//表单输出面板
	var $attributePanel; 		//属性面板
	var $sourcePanel; 			//数据源面板
	var $sourceLists; 			//数据源列表
	var editorFormJson; 		//表单配置参数
	var sourceData;				//数据源数据
	var formArrayObj;
	var tableAttrFormJson; 		//表格属性表单配置参数
	var tableAttrOptions = {}; 	//表格属性
	var configAttrFormJson;		//数据列属性表单配置参数
	var thNumArr = []; 			//数据列宽度数组
	var pageFormJsonArr = []; 	//储存编辑完的表单
	function init(sourceListData){
		$attributePanel = $("#editor-attribute-panel");
		$boardPanel = $("#editor-board");
		$tableContainer = $('#editor-form-output');
		$sourcePanel = $('#editor-source ul.list');
		
		editorFormJson = {
			id:  	"editor-form-output",
			noSelect: true,
			form: 	[[]],
		}
		formArrayObj = {};
		pageFormJsonArr = [];

		sourceData = sourceListData;
		sourceData = initSourceData(sourceData);
		initSourceList();
		initTableAttrPanel();
		initConfigAttrPanel();
		initPagePanel();
	}
	//初始化数据源
	function initSourceData(data){
		//根据数据类型转化为输入框组件
		for(i in data){
			switch(data[i].dataType){
				case 'string':
				case 'number':
					data[i].type = 'text';
					data[i].formatType = data[i].dataType;
					break;
				case 'date':
					data[i].type = 'date';
					break;
				case 'select':
					data[i].type = 'select';
					data[i].subdata = [];
					break;
			}
		}
		return data;
	}
	//初始化数据源列表
	function initSourceList(){
		var html = '';
		for(list in sourceData){
			var usedHtml = '';
			if(sourceData[list].isUsed){
				usedHtml = '<span class="used">'+  language.ui.formeditor.initSourceList  +'</span>'
			}
			html+=
				'<li ns-data-id="'+sourceData[list].id+'">'
					+sourceData[list].label
					+'<span class="info">'
						+usedHtml
					+'</span>'
				+'</li>';
		}
		$sourcePanel.html(html);

		$sourceLists = $('#editor-source ul.list li');
		$sourceLists.on('click',function(ev){
			var dataID = $(this).attr('ns-data-id');
			var data = sourceData[dataID];
			toggleSourceListUsed(data);
		});
	}
	//更新配置参数
	function setTableAttrOptions(){
		var formData = nsForm.getFormJSON(tableAttrFormJson.id);
		switch(formData.widthClass){
			case 'fullwidth':
				tableAttrOptions.tableWidth = '100%';
				break;
			case 'pxwidth':
				if(formData.widthNumber!=''){
					var num = Number(formData.widthNumber);
					if(num<100){
						nsalert( language.ui.formeditor.setTableAttrOptions.widthNumberBigA  ,'error')
						return false;
					}else{
						tableAttrOptions.tableWidth = num+'px';
					}

				}else{
					nsalert( language.ui.formeditor.setTableAttrOptions.widthNumberBigB  ,'error');
					return false;
				}
				break;
			case 'percentwidth':
				if(formData.widthNumber!=''){
					var num = Number(formData.widthNumber);
					console.log(num);
					if(num>100||num<=10){
						nsalert(  language.ui.formeditor.setTableAttrOptions.widthNumberSmallA ,'error');
						return false;
					}else{
						tableAttrOptions.tableWidth = num+'%';
					}

				}else{
					nsalert( language.ui.formeditor.setTableAttrOptions.widthNumberSmallB  ,'error');
					return false;
				}
				break;
		}
		if(editorFormJson.form[0].length>0){
			refreshBoardPanel();
		}
	}
	//更新配置参数面板
	//初始化表格属性面板
	function initTableAttrPanel(){
		//宽度类型 像素或者百分比 全宽
		var widthClass = 
		{
			id:"widthClass",
			type:"radio",
			label:  language.ui.formeditor.initTableAttrPanel.widthLabel  ,
			column:4,
			changeHandler: function(data){
				//是否需要填写宽度数字
				switch(data){
					case 'fullwidth':
						nsCom.hide('widthNumber','editor-attribute-panel-table');
						break;
					case 'percentwidth':
					case 'pxwidth':
						nsCom.show('widthNumber','editor-attribute-panel-table');
						break;
				}
				setTableAttrOptions();
			},
			subdata:
			[
				{
					text: 	language.ui.formeditor.initTableAttrPanel.fullwidth ,
					value: 	'fullwidth',
					isChecked: true,
				},{
					text: 	language.ui.formeditor.initTableAttrPanel.percentwidth  ,
					value: 	'percentwidth',
				},
				{
					text: 	language.ui.formeditor.initTableAttrPanel.pxwidth  ,
					value: 	'pxwidth',
				}
			]
		}
		//表格属性面板配置
		tableAttrFormJson = {
			id:"editor-attribute-panel-table",
			changeHandler:setTableAttrOptions,
			form:
			[
				[
					widthClass,
					{
						id: "widthNumber",
						label:  language.ui.formeditor.initTableAttrPanel.widthLabelJson ,
						rules: 'number',
						column:4,
						type: 'text',
						hidden:true,
					}
				]
			]
		}
		nsForm.panelInit(tableAttrFormJson);
		setTableAttrOptions();
	}
	//初始化组件属性面板
	function initConfigAttrPanel(){
		var widthInput = {
			id:'width',
			type:'text',
			label: language.ui.formeditor.initTableAttrPanel.widthInputLabel,
			rules: 'number',
			column:4,
			changeHandler:function(inputWidthStr){
				$th = $('#'+editorFormJson.id+' th.active');
				//debugger
				var thIndex = $th.index();
				var thLength = $th.parent().children('th').length;

				if(thLength>1){
					//至少两列才需要
					if(thIndex<(thLength-1)){
						//如果不是最后一个，则同时影响后面的那个数据列宽度
						$otherTh = $th.next();
					}else{
						$otherTh = $th.prev();
					}
				}
				if(thLength==1){
					//只有一列不用修改，实际要修改的是表格宽度
				}else if(thLength==2){
					//两列就重新分配
					$th.css('width',inputWidthStr+'%');
					$otherTh.css('width', (100-Number(inputWidthStr))+'%');
				}else{
					//大于2列，多了就麻烦了，要判断是否是当前列和相关列是否自动，以及其他列
					$th.css('width',inputWidthStr+'%');
				}
			}
		}
		var labelInput = {
			id: "label",
			label:  language.ui.formeditor.initTableAttrPanel.labelInput ,
			column:4,
			onKeyChange:true,
			type: 'text',
			changeHandler:function(inputLabelStr){
				var $th = $('#'+editorFormJson.id+' th.active');
				var config = nsForm.getConfigById($th.attr('ns-th-id'), editorFormJson.id);
				config.label = inputLabelStr;
				$th.children('.title').html(inputLabelStr);
			}
		}
		var typeSelect = {
			id:"type",
			type:"select",
			label:language.ui.formeditor.initTableAttrPanel.typeSelect ,
			changeHandler:function(typeStr){
				if(typeStr==''){
					//为空暂不处理
				}else{
					var $th = $('#'+editorFormJson.id+' th.active');
					var id = $th.attr('ns-th-id');
					var currentConfig = nsForm.getConfigById(id, editorFormJson.id);
					console.log(typeStr);
					//对原有属性的修正
					//补充新组件类型的属性
					switch(typeStr){
						case 'date':
							delete currentConfig.value;
							break;
						case 'select':
							if($.isArray(currentConfig.subdata)==false){
								currentConfig.subdata = [];
							}
							break;
							
					}
					nsComponent.edit(id, editorFormJson.id, {type:typeStr});

					//如果是select，则要显示下拉框选项组件
					if(typeStr == 'select'){
						nsCom.show('addOptionInput',configAttrFormJson.id);
					}else{
						nsCom.hide('addOptionInput',configAttrFormJson.id);
					}
					//如果是text，则要显示显示类型
					if(typeStr == 'text'){
						nsCom.show('formatType',configAttrFormJson.id);
					}else{
						nsCom.hide('formatType',configAttrFormJson.id);
					}
				}
			},
			column:4,
			subdata:
			[
				{
					text: 	language.ui.formeditor.initTableAttrPanel.subdatatext,
					value: 	'text',
				},
				{
					text: 	language.ui.formeditor.initTableAttrPanel.subdatadate,
					value: 	'date',
				},
				{
					text: 	language.ui.formeditor.initTableAttrPanel.subdataselect,
					value: 	'select',
				}
			]
		}
		var readonlyRadio = {
			id:"readonly",
			type:"radio",
			label:  language.ui.formeditor.initTableAttrPanel.readonlyRadio  ,
			changeHandler:function(isReadonlyStr){
				var $th = $('#'+editorFormJson.id+' th.active');
				var id = $th.attr('ns-th-id');
				var isReadonly = isReadonlyStr=='true'?true:false;
				nsComponent.edit(id, editorFormJson.id, {readonly:isReadonly});
			},
			column:4,
			subdata:
			[
				{
					text: language.ui.formeditor.initTableAttrPanel.true,
					value: 	'true',
				},
				{
					text: 	language.ui.formeditor.initTableAttrPanel.false,
					value: 	'false',
				}
			]
		}
		var formatTypeSelect = {
			id:'formatType',
			type:"select",
			label: language.ui.formeditor.initTableAttrPanel.formatTypeSelect  ,
			changeHandler:function(typeStr){
				if(typeStr==''){
					typeStr = 'string';
				}else{
					var $th = $('#'+editorFormJson.id+' th.active');
					var id = $th.attr('ns-th-id');
					nsComponent.edit(id, editorFormJson.id, {formatType:typeStr});
				}
			},
			column:4,
			subdata:
			[
				{
					text: 	language.ui.formeditor.initTableAttrPanel.string  ,
					value: 	'string',
				},
				{
					text: 	language.ui.formeditor.initTableAttrPanel.number,
					value: 	'number',
				},
				{
					text: 	language.ui.formeditor.initTableAttrPanel.money ,
					value: 	'money',
				},
				{
					text: 	language.ui.formeditor.initTableAttrPanel.date ,
					value: 	'date',
				},
			]
		}
		var addOptionInput = {
			id: 	'addOptionInput',
			label:  language.ui.formeditor.initTableAttrPanel.addOptionInput,
			type: 	'textBtn',
			btns: [
				{
					text:  language.ui.formeditor.initTableAttrPanel.btnsText ,
					handler:function(data){
						if(data.value==''){
							nsalert( language.ui.formeditor.initTableAttrPanel.handler  ,'warning')
						}else{
							var $th = $('#'+editorFormJson.id+' th.active');
							var id = $th.attr('ns-th-id');
							var config = nsCom.getConfigById(id, editorFormJson.id);

							var optionStr = data.value;
							var optionObj = {};							
							optionObj[config.textField] = optionStr.substring(0, optionStr.indexOf('='));
							optionObj[config.valueField] =  optionStr.substring(optionStr.indexOf('=')+1,optionStr.length);							
							
							newSubdata = formArrayObj[id].subdata;
							newSubdata.push(optionObj)
							nsComponent.edit(id, editorFormJson.id, {subdata:newSubdata});
						}
					}
				}
			]
		}
		configAttrFormJson = {
			id:"editor-attribute-panel-config",
			form:
			[
				[
					labelInput,
					widthInput,
					typeSelect,
					readonlyRadio,
					formatTypeSelect,
					addOptionInput
				]
			]
		}
		nsForm.panelInit(configAttrFormJson);
		//setTableAttrOptions();
	}
	//刷新数据源列表
	function refreshSourceList(data){
		var usedHtml = '<span class="used">'+ language.ui.formeditor.used +'</span>'
		for(var i=0; i<$sourceLists.length; i++){
			var $currentList = $sourceLists.eq(i);
			if(data.id == $currentList.attr('ns-data-id')){
				if(data.isUsed==true){
					$currentList.children('.info').html(usedHtml);
				}else if(data.isUsed==false){
					$currentList.children('.info').children('.used').remove();
				}
			}
		}
	}
	//获得最后的表单元素状态
	function getLastComponentID(){
		var returnID;
		
		if(formArr[formArr.length - 1].length == 0 && formArr.length == 1){
			//如果一个组件都没有
			return false;
		}else{
			return 'last';
		}
		for(index in formArr){

		}
	}
	//切换当前数据源是否已经使用
	function toggleSourceListUsed(data,prevID){
		if(data.isUsed){
			removeComponent(data)
		}else{
			if(typeof(prevID)=='undefined'){
				prevID = false;
			}
			addComponent(data,prevID)
		}
	}
	function addComponent(data,prevID){
		formArrayObj[data.id] = data;
		data.isUsed = true;
		if(prevID == false){
			//没有定义插入到那个组件后面则插到最后
			data.timeStamp = new Date().getTime();
		}
		refreshSourceList(data);
		refreshBoardPanel();
	}
	function removeComponent(data){
		delete formArrayObj[data.id];
		data.isUsed = false;
		refreshSourceList(data);
		refreshBoardPanel();
	}
	//刷新面板
	function refreshBoardPanel(){
		//先根据操作时间戳顺序排队
		var formArrayTemp = [];
		for(i in formArrayObj){
			var inputConfig = formArrayObj[i];
			formArrayTemp.push(inputConfig);
		}
		formArrayTemp.sort(function(a,b){
			return a.timeStamp - b.timeStamp;
		})
		editorFormJson.form[0] = formArrayTemp;
		editorFormJson.tableWidth = tableAttrOptions.tableWidth;
		if(editorFormJson.tableWidth=='100%'){
			$tableContainer.css('width','100%');
		}else{
			$tableContainer.css('width','auto');
		}
		//生成表格表单
		nsForm.tableInit(editorFormJson);

		//添加数据列方法
		var theads = $('#'+editorFormJson.id+' thead th');
		
		//插入数据列工具
		var clearTool = '<span class="close-btn">x</span>';
		var resizeTool = '<div class="resize-handler"></div>';
		var configTool = '<div class="config-handler"></div>';
		var resizeTableTool = '<div class="resize-table-handler"></div>';
		for(var thI = 0; thI<theads.length; thI++){
			if(thI!=theads.length-1){
				theads.eq(thI).append(clearTool+configTool+resizeTool);
			}else{
				//最后一个是表格拖动工具
				theads.eq(thI).append(clearTool+configTool+resizeTableTool);
			}
		}
		//删除
		theads.children('.close-btn').on('click', function(ev){
			var configID = $(this).parent().attr('ns-th-id');
			removeComponent(formArrayObj[configID]);
		});
		//数据列属性
		var thReturnData = {
			formJson:editorFormJson,
			returnHandler:saveThWidth,
			theads:theads
		}
		var tableReturnData = {
			formJson:editorFormJson,
			returnHandler:saveTableWidth
		}
		theads.children('.resize-handler').on('mousedown', thReturnData, nsForm.tableRresizeThHandler);
		//拖拽表格宽度
		theads.children('.resize-table-handler').on('mousedown', tableReturnData, nsForm.tableRresizeTableHandler)
		//刷新数据列面板
		theads.on('click','.config-handler',theadsClickHandler);
		//拖拽数据列顺序
		if(theads.length>1){
			theads.on('mousedown','.title',thReturnData, tableThMoveHandler);
		}
	}
	function tableThMoveHandler(ev){		
		var $theads = ev.data.theads;
		var $title = $(this);
		var $th = $title.closest('th');
		$th.addClass('moving');
		var theadsLeftArr = [];
		//建立位置数组 
		for(var thI = 0; thI<$theads.length; thI++){
			theadsLeftArr.push($theads.eq(thI).offset().left);
			if(thI==$theads.length-1){
				//最后一个加上表格右边的坐标
				var tableRight = $theads.eq(thI).offset().left+$theads.eq(thI).width();
				theadsLeftArr.push(tableRight);
			}
		}
		//生成拖拽对象
		var style = ''
		style = 'width:'+$title.width()+'px; height:'+$title.height()+'px;'
		style += ' top:'+$title.offset().top+'px; left:'+$title.offset().left+'px;'
		style = 'style="'+style+'"';
		var divHtml = 
			'<div id="ns-drag-element" class="drag-element" '+style+'>'
			+'</div>'
		if($('#ns-drag-element').length>0){
			$('#ns-drag-element').remove();
		}
		$(document.body).append(divHtml);

		var $drag = $('#ns-drag-element');
		var offsetX = ev.pageX -$title.offset().left;
		var offsetY = ev.pageY -$title.offset().top;
		var currentIndex = $th.index();
		var targetIndex = -1; 
		var currentTargetIndex = -1;
		var targetPosition = 'center';
		$(document).on('mousemove',function(ev){
			var topNum = ev.pageY-offsetY;
			var leftNum = ev.pageX-offsetX;
			$drag.css('top',topNum+'px');
			$drag.css('left',leftNum+'px');
			//数组中是四个值，前几个的left，最后一个是表格的right
			
			if(leftNum>theadsLeftArr[0]&&leftNum<theadsLeftArr[theadsLeftArr.length-1]){
				for(var thI = 0; thI<$theads.length; thI++){
					if(leftNum>=theadsLeftArr[thI]&&leftNum<theadsLeftArr[thI+1]){
						currentTargetIndex = thI;
					}
				}
				targetPosition = 'center';
			}else if(leftNum<theadsLeftArr[0]){
				//最前面
				currentTargetIndex = 0;
				targetPosition = 'start';

			}else if(leftNum>theadsLeftArr[theadsLeftArr.length-1]){
				//最后面
				currentTargetIndex = theadsLeftArr.length-1;
				targetPosition = 'end';
			}
			if(currentTargetIndex!=targetIndex){
				$theads.eq(currentTargetIndex).addClass('move-target');
				if(targetIndex!=-1){
					$theads.eq(targetIndex).removeClass('move-target');
				}
				targetIndex = currentTargetIndex;
			}
		});
		$(document).on('mouseup',function(ev){
			$(document).off('mousemove');
			$(document).off('mouseup');
			$th.removeClass('moving');
			$theads.eq(targetIndex).removeClass('move-target');
			$drag.remove();

			if(currentIndex!=targetIndex){
				var formArr = editorFormJson.form[0];
				var currentObj = formArr[currentIndex];
				var targetObj = formArr[targetIndex];
				if(targetPosition=='center'){
					currentObj.timeStamp = targetObj.timeStamp+1;
				}else if(targetPosition=='start'){
					currentObj.timeStamp = targetObj.timeStamp-1;
				}else if(targetPosition=='end'){
					currentObj.timeStamp = targetObj.timeStamp+1;
				}

				refreshBoardPanel();
			}
			
		})
	}
	function saveThWidth(data){
		console.log(data);
	}
	function saveTableWidth(data){
		if(data.tableWidth.type=='%'){
			if(data.tableWidth.number!=100){
				nsCom.edit('widthClass','editor-attribute-panel-table',{value:'percentwidth'});
				nsCom.edit('widthNumber','editor-attribute-panel-table',{value:data.tableWidth.number, hidden:false});
			}
		}else if(data.tableWidth.type=='px'){
			nsCom.edit('widthClass','editor-attribute-panel-table',{value:'pxwidth'});
			nsCom.edit('widthNumber','editor-attribute-panel-table',{value:data.tableWidth.number, hidden:false});
		}
		console.log(editorFormJson);
	}
	function theadsClickHandler(ev){
		var $th = $(this).parent();
		var theads = $th.parent().children();
		if($th.hasClass('active')){
			$th.removeClass('active');
		}else{
			theads.parent().children('th.active').removeClass('active');
			$th.addClass('active');
		}
		var id = $th.attr('ns-th-id');

		refreshThAttrPanel(formArrayObj[id]);
	}
	//获取dom组件的css百分比宽度
	function getThWidth($dom){
		var width;
		if(typeof($dom.attr('style'))=='undefined'){
			width =   language.ui.formeditor.domGetThWidth  ;
		}else{
			width = $dom.attr('style');
			width = width.substring(width.indexOf('width:')+7, width.length);
			width = width.substring(0, width.indexOf('%'));
			width = Number(width);
		}
		return width;
	}
	//根据数据源刷新数据列面板属性
	function refreshThAttrPanel(data){
		$attributePanel.find('.nav-tabs [ns-name="config"] a').tab('show');
		// console.log(data);
		// console.log(configAttrFormJson);
		// console.log(editorFormJson);
		var width;
		if(editorFormJson.formSource == 'table'){
			//表格模式读取数据列的宽度
			var $th = $('#'+editorFormJson.id).find('th[ns-th-id="'+data.id+'"]')
			width = getThWidth($th);
		}
		var readonly = data.readonly == true?'true':'false';
		values = {
			width:width,
			label:data.label,
			type:data.type,
			readonly:readonly,
			formatType:data.formatType
		}
		nsFormBase.setValues(values, configAttrFormJson.id);
		//如果是select，则要显示下拉框选项组件
		if(data.type == 'select'){
			nsCom.show('addOptionInput',configAttrFormJson.id);
		}else{
			nsCom.hide('addOptionInput',configAttrFormJson.id);
		}
		//如果是text，则要显示显示类型
		if(data.type == 'text'){
			nsCom.show('formatType',configAttrFormJson.id);
		}else{
			nsCom.hide('formatType',configAttrFormJson.id);
		}

		

		if(editorFormJson.form[0].length==1){
			nsCom.edit('width',configAttrFormJson.id,{readonly:true});
		}else{
			nsCom.edit('width',configAttrFormJson.id,{readonly:false});
		}
	}
	//------------------页面生成------------------------------------------------------
	function initPagePanel(){
		$("#btn-add-formjson").on('click', pageAddFormJson);
	}
	function pageAddFormJson(){
		var saveFormJson = $.extend(true,{},editorFormJson);
		saveFormJson.id = editorFormJson.id + '-' + pageFormJsonArr.length;
		editorFormJson = {
			id:  	"editor-form-output",
			noSelect: true,
			form: 	[[]],
		}
		formArrayObj = {};

		//读取当前容器的style 和 class
		var saveCls = $('#editor-form-output').attr('class');
		if(typeof(saveCls)=='string'){
			saveCls = 'class="'+ saveCls +' unused" '  //unused是不能使用的样式
		}else{
			saveCls = '';
		}
		var saveStyle = $('#editor-form-output').attr('style');
		if(typeof(saveStyle)=='string'){
			saveStyle = 'style="'+ saveStyle +'" '
		}else{
			saveStyle = '';
		}
		var saveHtml = 
			'<div '
				+'id="'+saveFormJson.id+'" '
				+saveCls
				+saveStyle
			+'></div>'

		$boardPanel.prepend(saveHtml);
		nsForm.tableInit(saveFormJson);

		$('#'+editorFormJson.id).html('<div class="plus">'+  language.ui.formeditor.editorFormJson  +'</div>');

		//保存formJson
		pageFormJsonArr.push(saveFormJson);
		console.log(sourceData);
		for(id in sourceData){
			sourceData[id].isUsed = false;
			refreshSourceList(sourceData[id]);
		}
	}
	return {
		init:init,
	}
})(jQuery);