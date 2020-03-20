/*
 * 快速输入组件
 */
nsUI.quicktypingtwo = (function($) {
	//nsUI.quicktyping.baseData = {}; 	//总的存储数据对象
	var dataConfig = {};  				//数据配置
	var config = {}; 					//用户当前使用的配置
	var baseData = {}; 					//基础数据
	var inputValue = ''; 				//输入框的值
	//数据处理部分 start---------------------------------------------------
	//数据初始化
	function dataInit(systemDataConfig){

		if(debugerMode){
			parametersArr = [
				[systemDataConfig,'object',true]
			];
			nsDebuger.validParameter(parametersArr);
			optionsArr = [
				['dataID','string',true],
			//	['baseDataAjax','object',true],
				['inputAjaxConfig','object',true],
			];
			nsDebuger.validOptions(optionsArr,systemDataConfig);
		}
		
		dataConfig = systemDataConfig;
		baseData = {};
		if(typeof(nsUI.quicktyping.baseData)=='undefined'){
			nsUI.quicktyping.baseData = {};
		}
		nsUI.quicktyping.baseData[dataConfig.dataID] = baseData;

		baseData.totalAjax = 0; 		//总的加载数量,必须有baseData,所以从1开始
		baseData.completeAjax = 0; 		//ajax加载数量
		if(!$.isEmptyObject(dataConfig.baseDataAjax)){
			//支持原来的方式
			if(typeof(dataConfig.baseDataAjax)=='object'){
				//是object类型,默认第一个是table表格
				dataConfig.inputAjaxConfig.project = {
					plusData:'project',
					url:dataConfig.baseDataAjax.url,
					type:dataConfig.baseDataAjax.type,
					dataSrc:dataConfig.baseDataAjax.dataSrc
				}
			}
		}
		/*nsVals.ajax(dataConfig.baseDataAjax,function(data){
			//console.log(data[dataConfig.baseDataAjax.dataSrc]);
			baseData.project = {};
			baseData.project.data = nsVals.csv2jsonArray(data[dataConfig.baseDataAjax.dataSrc], {isAddDefaultIndex:true});
			baseData.completeAjax++;
			baseDataComplete();
		});*/
		for(input in dataConfig.inputAjaxConfig){
			baseData.totalAjax++;
			var inputConfig = dataConfig.inputAjaxConfig[input];
			nsVals.ajax(inputConfig, function(data,ajaxConfig){
				var keyname = ajaxConfig.plusData;
				baseData[keyname] = {};
				baseData[keyname].data = data[inputConfig.dataSrc];
				if(config[keyname].type == 'table'){
					baseData[keyname].data = nsVals.csv2jsonArray(data[inputConfig.dataSrc], {isAddDefaultIndex:true});
				}
				baseData.completeAjax++;
				baseDataComplete();
			});
		}
	}
	//加载ajax监视
	function baseDataComplete(){
		if(baseData.completeAjax==baseData.totalAjax){
			//console.log(baseData.completeCallback);
			if(typeof(baseData.completeCallback)=='function'){
				baseData.completeCallback();
				delete baseData.completeCallback;
			}
		}
	}
	//数据处理部分 end-----------------------------------------------------
	//组件初始化
	function init(userConfig){
		if(debugerMode){
			parametersArr = [
				[userConfig,'object',true]
			];
			nsDebuger.validParameter(parametersArr);
			optionsArr = [
				['id','string',true],
				['dataID','string',true],
				['container','string',true],
				['label','string',true],
				//['projectField','array',true],
				//['projectTableWidth','number'],
				['inputWidth','number']
			];
			nsDebuger.validOptions(optionsArr,userConfig);
		}
		config =  setDefault(userConfig);
		config.data = nsUI.quicktyping.baseData[userConfig.dataID];
		config.values = {};
		setTableDefault();//判断是否存在table表格类型的操作数据
		initContainer();
		//console.log(config);
	}
	function setTableDefault(){
		for(var typeI=0; typeI<config.inputOrder.length; typeI++){
			if(config[config.inputOrder[typeI]].type == 'table'){
				//如果当前操作类型有table表格
				initTablePanel(config.inputOrder[typeI]);//初始化表格配置属性值
			}
		}
	}
	//初始化数据
	function setDefault(initConfig){
		if(!$.isEmptyObject(dataConfig.baseDataAjax)){
			if(typeof(dataConfig.baseDataAjax)=='object'){
				initConfig.project = {
					source:'project',
					type:'table',
					projectSearchType: 	'disorder',					//多条件搜索时候是顺序还是乱序 order disorder  默认disorder
					projectTableWidth: 	800,						//表格宽度
					projectTableRowNumber: 5,						//表格行数
					projectField:initConfig.projectIdField
				}
			}
		}
		var defaultConfig = {
			//projectTableWidth:800,
			//projectTableRowNumber:10,
			inputWidth:500,
			tagsWidth:0
		}
		for(option in defaultConfig){
			if(typeof(initConfig[option])=='undefined'){
				initConfig[option] = defaultConfig[option];
			}
		}
		return initConfig;
	}
	//初始化容器
	function initContainer(){
		if(config.isDialog == true){
			var htmlStr = '<div class="quicktyping-dialog" id="'+config.dataID+'-container">'
							+'<div class="quicktyping-title">'
								+'<label>'+config.isTitle+'</label>'
								+'<a class="quicktyping-close-btn" href="javascript:void(0);">x</a>'
							+'</div>'
							+'<div class="panel panel-default panel-form">'
								+'<div class="panel-body"></div>'
							+'</div>'
						+'</div>';
			$('body').append(htmlStr);
			config.container = '#'+config.dataID+'-container .panel-body';
		}
		config.$container = $(config.container);
		if(debugerMode){
			if(config.$container.length!=1){
				console.error(language.ui.nsuiquicktyping.initContainerA+config.id+language.ui.nsuiquicktyping.initContainerB+config.$container.length+language.ui.nsuiquicktyping.initContainerC);
				return false;
			}
		}
		var html = '';
		html = getBaseHtml();
		config.$container.html(html);
		config.$component = config.$container.find('#'+config.id);
		config.$input = config.$container.find('#'+config.inputID);
		config.$tags = config.$container.find('.tags-container');
		$('#'+config.dataID+' .quicktyping-title .quicktyping-close-btn').on('click',function(ev){
			$(this).parent().parent().remove();
		})
		initInput();
	}
	//输出基本HTML
	function getBaseHtml(){
		var html = '';
		config.inputID = config.id+"-input";
		var widthStyle = 'style="width:'+config.inputWidth+'px;"';
		html = '<div id="'+config.id+'" class="nsui-quicktyping">'
					+'<label class="label-title">'+config.label+'</label>'
					+'<div class="input" '+widthStyle+'>'
						+'<input type="text" class="input-main" name="'+config.inputID+'" id="'+config.inputID+'" '+widthStyle+'>'
						+'<div class="tags-container"></div>'
					+'</div>'
				+'</div>';
		return html;
	}
	
	var searchType = '';  //当前操作类型 table(表格), select(下拉)， date(日期),number(数值类型)
	var currentData = ''; //当前操作数据 
	//初始化文本框
	function initInput(){
		searchType = config[config.inputOrder[0]].type;			//默认读取的操作类型为第一个，从inputOrder数组第一个取
		currentData = config.inputOrder[0];						//默认操作数据为第一个，从inputOrder数组第一个取
		if(baseData.totalAjax!=baseData.completeAjax){
			config.$component.addClass('loading');
			baseData.completeCallback = function(){
				config.$component.removeClass('loading');
				//读取表格数据
				config.$input.on('focus',inputFocusHandler);
			}
		}else{
			config.$input.on('focus',inputFocusHandler);
		}
	}
	//判断输入内容决定操作类型
	function inputFocusHandler(event){
		config.$input.off('focus');
		showEmptyResultPanel(currentData);
		config.$input.on('keyup',function(ev){
			//console.log(ev.keyCode);
			var isContinue = true;
			if(typeof(config.beforeHandler)=='function'){
				isContinue = config.beforeHandler();
			}
			if(isContinue){
				switch(ev.keyCode){
					// case 32:
					// 	//空格
					// 	break;
					case 13:
						//回车
						confirmCurrentRow();
						break;
					case 40:
						//下
						changeSelectRow('next');
						break;
					case 38:
						//上
						changeSelectRow('prev');
						break;
					default:
						//console.log(config.$input.val());
						var searchValue = config.$input.val();
						inputSearch(searchValue,ev.keyCode);
						break;
				};
			}
		});
	}
	//输入动作判断，空对象则搜索项目
	function inputSearch(searchValue,keyCode){
		var trimSearchValue = $.trim(searchValue);
		//如果是空或者未发生变化则不搜索，如果发生变化，则保存的值searchValue
		if(trimSearchValue==''){
			//忽略空
			//如果是空，且仍然在点删除 keycode:8
			if(keyCode==8){
				removeValues();
			}
			inputValue = '';
			return false;
		}else if(trimSearchValue == inputValue){
			//忽略相等
			if(keyCode==8){
				removeValues();
			}
			return false;
		}else{
			//有意义的值
			inputValue = searchValue;
		}
		//判断搜索类型
		switch(searchType){
			case 'table':
				var resultArr = tableSearch(searchValue);
				showResultPanel(resultArr);
				break;
			case 'select':
				showResultPanel(baseData[currentData].data);
				selectSearch(searchValue);
				break;
			case 'date':
				break;
		}
	}
	//搜索下拉列表符合项
	function selectSearch(searchValue){
		var selectData = baseData[currentData].data;
		var searchResultArr = [];
		for(var selectI=0; selectI<selectData.length; selectI++){
			var isResult = false;
			var searchReg = new RegExp(searchValue,'i');
			for(key in selectData[selectI]){
				var value = selectData[selectI][key];
				if(typeof(value)=='string'){
					var indexNum = value.search(searchReg);
					if(indexNum>=0){
						isResult = true;
					}
				}
			}
			if(isResult){
				searchResultArr.push(selectI);
			}
		}
		var selectIndex = 0;
		if(searchResultArr.length>=1){
			//只有是1的时候才是分辨出来,如果大于1则先选中第一个
			selectIndex = searchResultArr[0];
			var $selectLi = $(config.container).find('.result-panel.select ul li').eq(selectIndex);
			if($selectLi.hasClass('current')){
				//就不用动了
			}else{
				$(config.container).find('.result-panel.select ul li').removeClass('current');
				$selectLi.addClass('current');
			}
		}else if(searchResultArr.length==0){
			//都不符合
			$(config.container).find('.result-panel.select ul li').removeClass('current');
		}
	}
	function getTableData(currentData){
		var projectLength = config.data[currentData].data.length;
		var resultArr = [];
		for(var projectI=0; projectI<projectLength; projectI++){
			var cProject = config.data[currentData].data[projectI];
			resultArr.push(cProject);
			if(resultArr.length>=config[currentData].projectTableRowNumber){
				projectI = projectLength;
			}
		}
		return resultArr;
	}
	//搜索table表格符合项
	function tableSearch(searchValue){
		var resultArr = [];
		var fieldNum = config[currentData].projectSearchField.length;
		var projectLength = config.data[currentData].data.length;
		var isSingleConditions  = (searchValue.indexOf(' ')==-1);  //是否包含空格，如果有则视为多条件搜索
		if(isSingleConditions){
			//单条件搜索
			var searchReg = new RegExp(searchValue,'i');
			for(var projectI=0; projectI<projectLength; projectI++){
				var cProject = config.data[currentData].data[projectI];
				var isResult = false;
				for(var fieldI = 0;  fieldI<fieldNum; fieldI++){
					var fieldValue = cProject[config[currentData].projectSearchField[fieldI]];
					var indexNum = fieldValue.search(searchReg);
					if(indexNum>=0){
						isResult = true;
					}
				}
				if(isResult){
					resultArr.push(cProject);
				}
				if(resultArr.length>=config[currentData].projectTableRowNumber){
					projectI = projectLength;
				}
			}
		}else{
			//多条件搜索 start ------
			var searchValueArr = searchValue.split(' ');
			if(config[currentData].projectSearchType=='order'){
				//顺序多条件搜索
				var tempResultArr = [];
				var searchReg = new RegExp(searchValueArr[0],'i');
				var currentFieldIndex = 0;
				//先搜第一列
				for(var projectI=0; projectI<projectLength; projectI++){
					var cProject = config.data[currentData].data[projectI];
					var fieldValue = cProject[config[currentData].projectSearchField[0]];
					var indexNum = fieldValue.search(searchReg);
					if(indexNum>=0){
						tempResultArr.push(cProject);
					}
				}
				if(tempResultArr.length==0){
					//如果第一个关键字都没有搜索结果，那就直接返回了 resultArr = [];
					return resultArr;
				}else{
					for(var valueI=1; valueI<searchValueArr.length; valueI++){
						//挨个项目搜索
						if(searchValueArr[valueI]!=''){
							var tempSearchReg = new RegExp(searchValueArr[valueI],'i');
							for(var tempProjectI=0; tempProjectI<tempResultArr.length; tempProjectI++){
								if(tempResultArr[tempProjectI]!=false){
									var tempFieldValue = tempResultArr[tempProjectI][config[currentData].projectSearchField[valueI]];
									var tempIndexNum = tempFieldValue.search(tempSearchReg);
									if(tempIndexNum == -1){
										tempResultArr[tempProjectI] = false;  //用false替代内容
									}
								}
							}
						}
					}
					//过滤掉所有的false
					for(var tempProjectI2=0; tempProjectI2<tempResultArr.length; tempProjectI2++){
						if(tempResultArr[tempProjectI2] != false){
							resultArr.push(tempResultArr[tempProjectI2]);
						}
						if(resultArr.length>=config[currentData].projectTableRowNumber){
							tempProjectI2 = tempResultArr.length;
						}
					}
				}
			//顺序多条件搜索 end ------
			}else if(config[currentData].projectSearchType=='disorder'){
				//乱序多条件搜索
				var searchReg = new RegExp(searchValueArr[0],'i');
				var tempResultArr = [];
				for(var projectI=0; projectI<projectLength; projectI++){
					var cProject = config.data[currentData].data[projectI];
					var isResult = false;
					for(var fieldI = 0;  fieldI<fieldNum; fieldI++){
						var fieldValue = cProject[config[currentData].projectSearchField[fieldI]];
						var indexNum = fieldValue.search(searchReg);
						if(indexNum>=0){
							isResult = true;
						}
					}
					if(isResult){
						tempResultArr.push(cProject);
					}
				}
				if(tempResultArr.length==0){
					//如果第一个关键字都没有搜索结果，那就直接返回了 resultArr = [];
					return resultArr;
				}else{
					//开始其它关键字搜索
					for(var searchI=1; searchI<searchValueArr.length; searchI++){
						var searchReg = new RegExp(searchValueArr[searchI],'i');
						for(var tempProjectI=0; tempProjectI<tempResultArr.length; tempProjectI++){
							if(tempResultArr[tempProjectI]!=false){
								var cProject = tempResultArr[tempProjectI];
								var isResult = false;
								for(var fieldI = 0;  fieldI<fieldNum; fieldI++){
									var fieldValue = cProject[config.projectSearchField[fieldI]];
									var indexNum = fieldValue.search(searchReg);
									if(indexNum>=0){
										isResult = true;
									}
								}
								if(isResult == false){
								  tempResultArr[tempProjectI] = false;
								}
							}
						}
					}
				}
				for(var resultI = 0; resultI<tempResultArr.length; resultI++){
					if(tempResultArr[resultI]!=false){
						resultArr.push(tempResultArr[resultI]);
					}
					if(resultArr.length>=config[currentData].projectTableRowNumber){
						resultI = tempResultArr.length;
					}
				}
				//乱序多条件搜索 end ------
			}
		}
		return resultArr;
	}
	//输出结果选择
	function showResultPanel(resultArr){
		if(resultArr.length==0){
			showEmptyResultPanel('empty');
		}else{
			switch(searchType){
				case 'table':
					showTableResultPanel(resultArr);
					break;
				case 'select':
					showSelectResultPanle(resultArr);
					break;
			}
		}
	}
	//没有结果的面板
	function showEmptyResultPanel(messageType){
		var resultPanel = config.$component.find('.input .result-panel');
		if(resultPanel.length==0){
			//没有结果面板
		}else{
			//有结果面板则删了
			resultPanel.remove();
		}
		var html = '<div class="result-panel empty">'
						+config.message[messageType]
					+'</div>';
		config.$input.after(html);
	}
	//显示表格的面板
	function showTableResultPanel(resultArr){
		var resultPanel = config.$component.find('.input .result-panel');
		if(resultPanel.length > 0){
			resultPanel.find('tr').off('click');
			resultPanel.remove();
		}
		if(config[currentData].isUseTabs){
			//开启了tab列
			var ulHtml = '';
			for(var groupI=0; groupI<config[currentData].tabsName.length; groupI++){
				var activeClassStr = '';
				if(groupI === config[currentData].tabsDefaultIndex){
					activeClassStr = ' active';
				}
				ulHtml += '<a href="javascript:void(0);" class="nstable-plus-panel-tabs-tab' +activeClassStr+'" ns-tabindex="' + groupI + '">'
		          			+ config[currentData].tabsName[groupI]
		          			+ '</a>';
			}
			var tabID = config.id+'-useTabs';
			var tableID = config.id+'-table';
			var styleStr = config[currentData].panelStyle.substring(config[currentData].panelStyle.indexOf('=')+1,config[currentData].panelStyle.length-1);
			var leftStr = 'left:'+config.tagsWidth+'px;"';
			styleStr = 'style='+styleStr+leftStr;
			var tabHtml = '<div class="result-panel list" '+styleStr+'>'
							+'<table '+config[currentData].tableClassStyle+' id="'+tableID+'">'
							+'</table>'
							+'<div class="nstable-plus-panel">'
								+'<div class="nstable-plus-panel-tabs" id="'+tabID+'">'
									+ulHtml
								+'</div>'
							+'</div>'
							+'</div>';
			config.$input.after(tabHtml);
			var $quickTab = $('#'+tabID);
			var $quickTableID = $('#'+tableID);
			$quickTab.children('a').on('click',function(ev){
				var $this = $(this);
				var activeIndex = $this.attr('ns-tabindex');
				$this.addClass('active');
				$this.siblings().removeClass('active');
				changeTab(tableID,activeIndex);
			})
			changeTab(tableID,config[currentData].tabsDefaultIndex);
			function changeTab(tableID,tabIndex){
				var tabArr = [];
				tabArr = tabArr.concat(config[currentData].tabsColumn.before,config[currentData].tabsColumn.tabGroup[tabIndex],config[currentData].tabsColumn.after);
				var theadHtml = '';
				var titleField = [];
				for(var titleI=0; titleI<tabArr.length; titleI++){
					titleField.push(tabArr[titleI].key);
					if(typeof(tabArr[titleI].width)!='number'){
						theadHtml += '<th>'+tabArr[titleI].title+'</th>';
					}else{
						theadHtml += '<th style="width:'+tabArr[titleI].width+'px;">'+tabArr[titleI].title+'</th>';
					}
				}
				theadHtml = '<thead><tr>'+theadHtml+'</tr></thead>';
				var tbodyHtml = '';
				for(resultI = 0; resultI<resultArr.length; resultI++){
					var trHtml = '';
					for(var tdI=0; tdI<titleField.length; tdI++){
						trHtml += '<td>'+resultArr[resultI][titleField[tdI]]+'</td>';
					}
					var trClass = '';
					if(resultI==0){
						trClass = ' class="current"';
					}
					trHtml = '<tr ns-index="'+resultArr[resultI][config[currentData].projectIndexField]+'" ns-id="'+resultArr[resultI][config[currentData].projectIdField]+'" '+trClass+'>'+trHtml+'</tr>';
					tbodyHtml += trHtml;
				}
				$quickTableID.html(theadHtml+tbodyHtml);
				$quickTableID.find('tbody tr').on('click',function(ev){
					var indexNumber = Number($(this).attr('ns-index'));
					//var idString = $(this).attr('ns-id');
					addProject(indexNumber);
				})
			}
		}else{
			var tabelHtml = '';
			for(resultI = 0; resultI<resultArr.length; resultI++){
				var trHtml = '';
				for(var tdI=0; tdI<config[currentData].tdField.length; tdI++){
					trHtml += '<td>'+resultArr[resultI][config[currentData].tdField[tdI]]+'</td>';
				}
				var trClass = '';
				if(resultI==0){
					trClass = ' class="current"';
				}
				trHtml = '<tr ns-index="'+resultArr[resultI][config[currentData].projectIndexField]+'" ns-id="'+resultArr[resultI][config[currentData].projectIdField]+'" '+trClass+'>'+trHtml+'</tr>';
				tabelHtml += trHtml;
			}
			var styleStr = config[currentData].panelStyle.substring(config[currentData].panelStyle.indexOf('=')+1,config[currentData].panelStyle.length-1);
			var leftStr = 'left:'+config.tagsWidth+'px;"';
			styleStr = 'style='+styleStr+leftStr;
			tabelHtml = '<div class="result-panel list" '+styleStr+'>'
							+'<table '+config[currentData].tableClassStyle+'>'
								+config[currentData].theadHtml
								+'<tbody>'
									+tabelHtml
								+'</tbody>'
							+'</table>';
						+'</div>';
			config.$input.after(tabelHtml);
			config.$input.next().find('tbody tr').on('click',function(ev){
				var indexNumber = Number($(this).attr('ns-index'));
				//var idString = $(this).attr('ns-id');
				addProject(indexNumber);
			})
		}
		
	}
	//表格相关配置值设置
	function initTablePanel(operatorType){
		config[operatorType].projectTableWidth = 800;//默认宽度
		config[operatorType].projectTableRowNumber = 10;//默认行数
		config[operatorType].projectSearchField = [];  //搜索字段数组
		config[operatorType].titleField = [];
		config[operatorType].titleWidth = [];
		config[operatorType].tdField = [];
		/************20180315 sjj 添加表格tab属性配置 start*********************/
		config[operatorType].isUseTabs = typeof(config[operatorType].isUseTabs)=='boolean' ? config[operatorType].isUseTabs:false;//默认不适用
		//是否定义了默认读取列
		if(typeof(config[operatorType].tabsDefaultIndex)!='number'){config[operatorType].tabsDefaultIndex = 0;}
		//tableGetTabOption(operatorType);
		/************20180315 sjj 添加表格tab属性配置 end*********************/
		var totolTableWidthNumber = 0;  //合计出来的表格宽度，必须每个td都设置了宽度
		var allSetTableWidth = true;  //是否全部设置了宽度
		var beforeTabArr = [];
		var tabsArr = [];
		var afterTabArr = [];
		for(var i=0; i<config[operatorType].projectField.length; i++){
			//判断参数是否合法
			if(debugerMode){
				optionsArr = [
					['key','string',true],
					['title','string'],
					['search','boolean'],
					['isID','boolean'],
					['isIndex','boolean'],
					['isName','boolean'],
					['width','number']
				];
				nsDebuger.validOptions(optionsArr, config[operatorType].projectField[i]);
			}
			//设置index;
			if(config[operatorType].projectField[i].isIndex){
				if(typeof(config[operatorType].projectIndexField)!='undefined'){
					console.error(language.ui.nsuiquicktyping.isIndex+config[operatorType].projectIndexField);
					console.error(config[operatorType].projectField[i]);
				}
				config[operatorType].projectIndexField = config[operatorType].projectField[i].key;
			}
			//设置id;
			if(config[operatorType].projectField[i].isID){
				if(typeof(config[operatorType].projectIdField)!='undefined'){
					console.error( language.ui.nsuiquicktyping.isID+config[operatorType].projectIdField);
					console.error(config[operatorType].projectField[i]);
				}
				config[operatorType].projectIdField = config[operatorType].projectField[i].key;
			}
			//设置name;
			if(config[operatorType].projectField[i].isName){
				if(typeof(config[operatorType].projectNameField)!='undefined'){
					console.error(language.ui.nsuiquicktyping.isName+config[operatorType].projectNameField);
					console.error(config[operatorType].projectField[i]);
				}
				config[operatorType].projectNameField = config[operatorType].projectField[i].key;
			}
			//设置search对象数组
			if(config[operatorType].projectField[i].search){
				config[operatorType].projectSearchField.push(config[operatorType].projectField[i].key);
			}
			//设置title数组
			if(typeof(config[operatorType].projectField[i].title)=='string'){
				config[operatorType].titleField.push(config[operatorType].projectField[i].title);
				config[operatorType].titleWidth.push(config[operatorType].projectField[i].width);
				config[operatorType].tdField.push(config[operatorType].projectField[i].key);
			}
			//计算宽度
			if(typeof(config[operatorType].projectField[i].width)=='number'){
				totolTableWidthNumber += config[operatorType].projectField[i].width;
			}else{
				allSetTableWidth = false;
			}
			switch(config[operatorType].projectField[i].tabPosition){
				case 'before':
					//设置了前置固定列
					beforeTabArr.push(config[operatorType].projectField[i]);
					break;
				case 'after':
					//设置了后置固定列
					afterTabArr.push(config[operatorType].projectField[i]);
					break;
				default:
					tabsArr.push(config[operatorType].projectField[i]);
					break;
			}
		}
		var tabsGroup = [];
		for(var groupI=0; groupI<config[operatorType].tabsName.length; groupI++){
			tabsGroup[groupI] = [];
			for(var tabI=0; tabI<tabsArr.length; tabI++){
				if(tabsArr[tabI].tabPosition === groupI){
					tabsGroup[groupI].push(tabsArr[tabI]);
				}
			}
		}
		config[operatorType].tabsColumn = {
			before:beforeTabArr,
			tabs:tabsArr,
			tabGroup:tabsGroup,
			after: afterTabArr,
		};
		//如果全都设置了，则改变projectTableWidth
		if(allSetTableWidth){
			if(debugerMode){
				if(typeof(config[operatorType].projectTableWidth)!='undefined'){
					if(config[operatorType].projectTableWidth!=totolTableWidthNumber){
						console.info( language.ui.nsuiquicktyping.consoleinfoA+config[operatorType].projectTableWidth+language.ui.nsuiquicktyping.consoleinfoB+totolTableWidthNumber);
					}	
				}
			}
			config[operatorType].projectTableWidth = totolTableWidthNumber;
		}
		//总体结果是否合法
		if(debugerMode){
			if(config[operatorType].projectSearchField.length==0){
				console.error(language.ui.nsuiquicktyping.projectSearchField);
			}
			if(config[operatorType].titleField.length==0){
				console.error(language.ui.nsuiquicktyping.titleField);
			}
			if(typeof(config[operatorType].projectIndexField)=='undefined'){
				console.error(language.ui.nsuiquicktyping.projectIndexField);
			}
			if(typeof(config[operatorType].projectIdField)=='undefined'){
				console.error(language.ui.nsuiquicktyping.projectIdField);
			}
		}
		//表格head的html
		var theadHtml = '';
		for(var titleI=0; titleI<config[operatorType].titleField.length; titleI++){
			if(typeof(config[operatorType].titleWidth[titleI])!='number'){
				theadHtml += '<th>'+config[operatorType].titleField[titleI]+'</th>';
			}else{
				theadHtml += '<th style="width:'+config[operatorType].titleWidth[titleI]+'px;">'+config[operatorType].titleField[titleI]+'</th>';
			}
		}
		theadHtml = '<thead><tr>'+theadHtml+'</tr></thead>';
		config[operatorType].theadHtml = theadHtml;
		//表格的class 和 style
		var tableClassStyle = 'class="table table-bordered table-condensed table-hover"';
		var panelStyle = '';
		if(typeof(config[operatorType].projectTableWidth)=='number'){
			panelStyle = ' style="width:'+config[operatorType].projectTableWidth+'px;"';
			tableClassStyle += panelStyle;
		}else if(typeof(config[operatorType].projectTableWidth)=='string'){
			panelStyle = ' style="width:'+config[operatorType].projectTableWidth+';"';
			tableClassStyle += panelStyle;
		}else if(typeof(config[operatorType].projectTableWidth)=='undefined'){
			panelStyle = ' style="width:100%;"';
			tableClassStyle += panelStyle;
		}
		config[operatorType].panelStyle = panelStyle;
		config[operatorType].tableClassStyle = tableClassStyle;
	}
	//显示下拉框的面板
	function showSelectResultPanle(resultArr){
		//如果有其它的结果面板，就需要删除
		if(config.$component.find('.result-panel').length>0){
			config.$component.find('.result-panel').remove();
		}
		var ajaxData = [];
		var html = '';
		if(typeof(config[currentData].data)=='function'){
			var currentIndex = 0;
			for(var orderI=0; orderI<config.inputOrder.length; orderI++){
				if(config.inputOrder[orderI] == currentData){
					currentIndex = orderI;
				}
			}
			if(currentIndex > 0){
				currentIndex = currentIndex - 1;
			}
			var paramsData = config[currentData].data(config.values[config.inputOrder[currentIndex]]);
			var ajaxData = dataConfig.inputAjaxConfig[currentData];
			ajaxData.data = paramsData;
			nsVals.ajax(ajaxData,function(data){
				ajaxData = data[ajaxData.dataSrc];
				html = fillSelectHtml(ajaxData);
				html = '<ul>'+html+'</ul>';
				config.$component.find('.result-panel').html(html);
				config.data[currentData].data = ajaxData;
			});
		}else{
			ajaxData = resultArr;
			html = fillSelectHtml(ajaxData);
		}
		var panelStyle = 'style="left:'+config.tagsWidth+'px;"';
		html = '<div class="result-panel select" '+panelStyle+'>'
					+'<ul>'
					+html
					+'</ul>'
				+'</div>';
		config.$input.after(html);
	}
	function fillSelectHtml(ajaxData){
		var html = '';
		for(var dataI=0; dataI<ajaxData.length; dataI++){
			var value = ajaxData[dataI][config[currentData].valueField];
			var text = ajaxData[dataI][config[currentData].textField];
			var currentCls = '';
			if(dataI==0){
				currentCls = ' class="current"';
			}
			html += '<li ns-basedata="'+currentData+'" ns-index="'+dataI+'" '+currentCls+'>'+text+'</li>';
		}
		return html;
	}
	//添加选中的项目
	function addProject(indexNumber){
		if(!isNaN(indexNumber)){
			var project = {
				index:indexNumber,
				id:config.data[currentData].data[indexNumber][config[currentData].projectIdField],
				name:config.data[currentData].data[indexNumber][config[currentData].projectNameField],
				data:config.data[currentData].data[indexNumber]
			}
			config.values[currentData] = project;
			addTag(project.name);
			confirmResult();
		}
	}
	//添加选中的select
	function addSelect(index){
		var dataObj = {};
		var name = '';
		if(isNaN(index)){
			if(config[currentData].isAllowOther){
				dataObj = {
					index:false,
					value:inputValue,
					data:config.data[currentData].data
				}
				name = inputValue;
			}else{
				nsAlert(language.ui.nsuiquicktyping.addSelectError,'error');
				return false;
			}
		}else{
			dataObj = {
				index:index,
				value:config.data[currentData].data[index][config[currentData].valueField],
				name:config.data[currentData].data[index][config[currentData].textField],
				data:config.data[currentData].data[index]
			}
			name = config.data[currentData].data[index][config[currentData].contentField];
		}
		
		config.values[currentData] = dataObj;
		addTag(name);
		confirmResult();
	}
	//添加数字
	function addNumber(inputValue){
		inputValue = Number(inputValue);
		function notNumber(){
			nsAlert(language.ui.nsuiquicktyping.addNumber,'error');
			config.$input.select();
		}
		if(typeof(inputValue)!='number' || isNaN(inputValue)){
			notNumber();
		}else{
			if(inputValue<=0){
				notNumber();
			}else{
				var dataObj = {
					value:inputValue
				}
				config.values[currentData] = dataObj;
				addTag(inputValue);
				confirmResult();
			}
		}
	}
	//添加文本
	function addText(inputValue){
		inputValue = $.trim(inputValue);
		var dataObj = {
			value:inputValue
		}
		config.values[currentData] = dataObj;
		if(inputValue==''){
			inputValue = '无';
		}
		addTag(inputValue);
		confirmResult();
	}
	//添加日期
	function addDate(inputValue){
		inputValue = $.trim(inputValue);
		var dataObj = {
			value:inputValue
		}
		config.values[currentData] = dataObj;
		if(inputValue==''){
			inputValue = '无';
		}
		addTag(inputValue);
		confirmResult();
	}
	//添加tag标签
	function addTag(nameString){
		if(typeof(config[currentData].title)=='string'){
			nameString = config[currentData].title+nameString;
		}
		var closeHtml = '';
		var closeCls = '';
		/*if(currentData=='project'){
			closeHtml = '<div class="close"></div>';
			closeCls = ' withclose';
		}*/
		var tagHtml = '<div class="quicktyping-tag'+closeCls+'">'+nameString+closeHtml+'</div>';
		config.$tags.append(tagHtml);
	}



	function confirmCurrentRow(){
		switch(searchType){
			case 'table':
				var $currentRow = config.$component.find('.result-panel table tbody tr.current');
				var index = Number($currentRow.attr('ns-index'));
				addProject(index);
				break;
			case 'select':
				var $currentOption = config.$component.find('.result-panel ul li.current');
				var index = Number($currentOption.attr('ns-index'));
				addSelect(index);
				break;
			case 'number':
				var inputValue = config.$input.val();
				addNumber(inputValue);
				break;
			case 'text':
				var inputValue = config.$input.val();
				addText(inputValue);
				break;
			case 'date':
				var inputValue = config.$input.val();
				addDate(inputValue);
				break;
			case 'complete':
				inputComplete();
				break;
			default:
				break;
		}
	}
	//改变选择行
	function changeSelectRow(direction){
		//direction  next 下， prev 上
		var isEmpty = config.$component.find('.result-panel').hasClass('empty');
		if(isEmpty){
			//没结果不处理
			return false;
		}
		function currentItemMove(){
			if(direction=='next'){
			//向下
				var $nextRow = $currentRow.next();
				if($nextRow.length<1){
					//没有下一条，就不用动了
				}else{
					$currentRow.removeClass('current');
					$nextRow.addClass('current');
				}
			}else if(direction=='prev'){
			//向上
				var $prevRow = $currentRow.prev();
				if($prevRow.length<1){
					//没有上一条，就不用动了
				}else{
					$currentRow.removeClass('current');
					$prevRow.addClass('current');
				}
			}
		}
		switch(searchType){
			case 'table':
				var $currentRow = config.$component.find('.result-panel table tbody tr.current');
				currentItemMove();
				break;
			case 'select':
				var $currentRow = config.$component.find('.result-panel ul li.current');
				currentItemMove();
				break;
		}
	}


	function removeValues(){
		var tagNum = config.$tags.children('.quicktyping-tag').length;
		if(tagNum>0){
			config.$tags.children('.quicktyping-tag').last().remove();
			var tagsWidth = 0;
			if(tagNum>1){
				//不是最后一个
				tagsWidth = config.$tags.outerWidth()+2;
			}else{
				tagsWidth = 0;
			}
			config.tagsWidth = tagsWidth;
			config.$input.css('width',(config.inputWidth-tagsWidth)+'px');
			delete config.values[config.inputOrder[tagNum-1]];
			currentData = config.inputOrder[tagNum-1];
			var isFirst = false;
			if(tagNum>1){
				isFirst = true;
			}
			searchType = config[currentData].type;
			if(currentData != 'date'){
				config.$input.inputmask('remove');
			}
			//console.log('currentData:'+currentData);
			//console.log('searchType:'+searchType);
			showNextPanel(isFirst);
		}
		//console.log(config.values)
	}
	//确认结果面板
	function confirmResult(){
		//移除面板
		var $resultPanel = config.$component.find('.result-panel');
		if($resultPanel.length>0){
			$resultPanel.remove();
		}
		//改变input位置
		var tagsWidth = config.$tags.outerWidth()+2;
		config.tagsWidth = tagsWidth;
		config.$input.css('width',(config.inputWidth-tagsWidth)+'px');
		config.$input.val('');
		config.$input.focus();
		//根据当前结果决定下一个是什么输入项
		var currentOrder = 0;
		for(orderI=0; orderI<config.inputOrder.length; orderI++){
			if(currentData == config.inputOrder[orderI]){
				currentOrder = orderI;
			}
		}
		if(currentOrder<config.inputOrder.length-1){
			currentData = config.inputOrder[currentOrder+1];
			if(debugerMode){
				if(typeof(config[currentData])!='object'){
					console.error(language.ui.nsuiquicktyping.confirmResult+currentData+language.ui.nsuiquicktyping.confirmResultObject);
				}
				if(typeof(config[currentData].type)!='string'){
					console.error(language.ui.nsuiquicktyping.confirmResult+currentData+language.ui.nsuiquicktyping.confirmResultString);
				}
			}
			searchType = config[currentData].type;
		}else{
			currentData = 'complete';
			searchType = 'complete';
		}
		showNextPanel(true);
	}
	//显示下一步需要的面板
	function showNextPanel(isFirst){
		config.$input.inputmask('remove');
		if(isFirst){
			switch(searchType){
				case 'message':
				case 'number':
					showEmptyResultPanel(currentData);
					break;
				case 'date':
					showEmptyResultPanel(currentData);
					var dateForat = 'yyyy-mm-dd';
					if(config[currentData].format){
						dateForat = config[currentData].format;
					}
					config.$input.inputmask(dateForat);
					break;
				case 'table':
					var resultArr = getTableData(currentData);
					showTableResultPanel(resultArr);
					break;
				case 'select':
					showSelectResultPanle(baseData[currentData].data);
					break;
				case 'complete':
					showEmptyResultPanel(currentData);
					break;
				default:
					showEmptyResultPanel(currentData);
					break;
			}
		}else{
			showEmptyResultPanel(currentData);
		}
	}
	//完成输入
	function inputComplete(){
		var isReturn = true;
		if(typeof(config.completeHandler)=='function'){
			isReturn = config.completeHandler(config.values);
		}
		//isReturn = typeof(isReturn) == 'boolean' ? isReturn : true;
		if(typeof(isReturn)!='boolean'){
			nsAlert('返回值不是布尔值！');
		}
		if(isReturn){
			refreshInput();
			config.$input.focus();
		}
	}
	//刷新输入框，开始第二次使用
	function refreshInput(){
		config.tagsWidth = 0;//恢复默认值
		config.values = {};
		initContainer();
	}
	return {
		getValues: function(){return config.values;},
		getBaseData:function(){return baseData;},
		dataInit:dataInit,
		init:init,
	}
})(jQuery);