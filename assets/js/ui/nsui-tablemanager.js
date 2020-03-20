/*
 * 表格用户管理面板
 */
nsUI.tablemanager = (function($) {
	var managerData; 	//管理数据
	var baseTableData; 	//表格运行数据
	var _TableID = '';		//表格ID
	var _START_WITH_TABLE = 'cw-';//表格缓存起始字符
	var _TYPE_CODE_TABLE = 'NSTABLE';//表格后台存储typeCode
	function init(tableID){
		_TableID = tableID;
		baseTableData = baseDataTable.data[tableID];
		var columns = {};  		//列基础数据 object格式 取值用
		var columnArray = [];  	//列基础数据 array格式  循环用
		var columnConfigArray = $.extend(true,[],baseTableData.columnConfig);
		var primaryIdField = baseTableData.dataConfig.primaryID;
		var primaryIdIndex = -1;
		if(baseTableData.dataConfig.isSerialNumber){
			//第一列为序列号列
			columnConfigArray.splice(0,1);
		}
		for(var columnI = 0; columnI<columnConfigArray.length; columnI++){
			var columnData = columnConfigArray[columnI];
			//可视宽度，隐藏的列可视宽度为'-'
			var visibleWidth = Math.round(columnData.width);
			var isHiddenColumn = !columnData.isVisableColumn;
			if(isHiddenColumn == false){
				visibleWidth = '-';
			}
			//是否是自动计算宽度
			var isCalculateWidth = true;
			if(columnData.originalTabPosition == 'before' || columnData.originalTabPosition == 'after'){
				isCalculateWidth = false;
			}
			var columnData2 = {
				title: 					columnData.title, 						//标题
				columnIndex: 			columnData.nsIndex, 					//列的索引值
				data: 					columnData.data, 						//列的data值，也是名字

				tabPosition: 			columnData.tabPosition, 				//显示的TAB位置，自动分组是数字 tab索引
				originalTabPosition: 	columnData.originalTabPosition, 		//原始的TAB位置，自动分组是'auto'
				width: 					visibleWidth, 							//显示宽度 非固定列都是拉伸过的
				originalWidth: 			Math.round(columnData.originalWidth), 	//原始宽度 未拉伸的设置宽度
				isHiddenColumn: 		isHiddenColumn, 			 	//是否隐藏列
				isCalculateWidth: 		isCalculateWidth, 						//是否需要自动计算宽度，固定列不需要
				columnWidthTabVisible: 	baseTableData.uiConfig.tabOptions.columnWidthTabVisible
			};
			if(columnData.data == primaryIdField){primaryIdIndex = columnI;} //sjj记录主键id序列号
			//保存整体的数据
			columns[columnData.data] = columnData2;
			columnArray.push(columnData2);
		}
		if(primaryIdIndex > -1){
			//存在主键id则需要排除
			delete columns[primaryIdField];
			columnArray.splice(primaryIdIndex,1);
		}
		//TAB数据数组
		var tabColumns = getTabColumns(columns);
		//TAB名称数组  原始名称和显示名称
		var tabsOriginalNameArray = $.extend(true, [], baseTableData.uiConfig.originalTabsName);
		var tabsViewNameArray = $.extend(true, [], baseTableData.uiConfig.tabsName);
		var tabsNameData = getTabsName(tabsOriginalNameArray, tabColumns);
		var tabsVisible = $.extend(true, [], baseTableData.uiConfig.tabsVisible);
		//可定义的tab对象
		var tabNameObj = $.extend(true, [], baseTableData.uiConfig.tabsName);

		//当前表格打开的TAB
		var tabsDefaultIndex = baseTableData.uiConfig.tabsActiveIndex;
		var tabActiveName = baseTableData.uiConfig.tabsActiveIndex;
		//如果当前tab指向未命名的tab，也就是自动分配的tab，不管是第几个自动生成的TAB，都指向all
		if(tabActiveName >= baseTableData.uiConfig.originalTabsName.length){
			/**20180723 sj 改因为auto可能不存在所以指向short即指向全部***/
			tabActiveName = 'short';
		}else{
			tabActiveName = tabActiveName.toString();
		}
		//全部数据
		managerData = {
			columns:columns, 					//基础列数据 object
			columnArray:columnArray, 			//基础列数据 array
			tabColumns:tabColumns, 				//分组的列数据 {0:[],1:[],auto:[],after:[],before:[], all:[], hidden:[]}

			tabsNameDataArray:tabsNameData, 				//tab的名称数据 [{key:'auto',text:'自动分组列'}]
			tabsOriginalNameArray:tabsOriginalNameArray, 	//tab的原始名称数组，只包含用户定义部分 ['基本信息','附加信息']
			tabsViewNameArray:tabsViewNameArray, 		//tab的显示名称数组，只包含用户定义部分 ['基本信息','附加信息','1','2']
			tabsVisible:tabsVisible, 						//tab的显示状态 [true,false,true]

			tabActiveName:tabActiveName, 		//当前显示tabNav的名字 例如 before all 1 manager 
			tabsDefaultIndex:tabsDefaultIndex, 	//表格的默认显示TAB  0 1 2
		};

		if($('body').children('.modal-tablemanger').length!=0){
			$('body').children('.modal-tablemanger').remove();
		}
		$('body').append(getHtml());
		
		//添加滚动条处理数据过多的情况
        var topNumber = $('#nsui-tablemanger').offset().top;
        var windowHeight = $(window).outerHeight();

        var cHeight = windowHeight - topNumber*2;
        $('#nsui-tablemanger .modal-content').css({
        	height:cHeight,
        	overflow:'auto'
        })

        if(tabActiveName==='short'){
			refreshManagerShort();//刷新快捷配置
        }else{
			refreshManagerTable(tabColumns[tabActiveName]); 
        }
		initManagerPanel();
		initFooter();

		$('#nsui-tablemanger-tabs li a[data-toggle="tab"]').on('click', tabChangeHandler);
	}
	//关闭弹框
	function remove(){
		managerData = {};
		$('#nsui-tablemanger').remove();
	}
	//初始化按钮
	function initFooter(){
		var btns = [
			{
				text: '保存个人设置',
				handler: saveConfig
			},
			{
				text: '清除个人设置',
				handler: delConfig
			},
			{
				text: '取消',
				handler: remove
			}
		]
		nsButton.initBtnsByContainerID('nsui-tablemanger-footer',btns);
	}
	//获取tabColumns的数据，对基本数据重新分组
	function getTabColumns(columns){
		var tabColumns = {
			all:[]
		};
		//分组
		for(dataName in columns){
			var columnData = columns[dataName];
			//分组保存 0 1 2等是tab分组，-1是自动分组的，after是前固定列，before是后固定列
			columnData = columns[dataName];
			var columnTabPostion = columnData.originalTabPosition;
			if(typeof(tabColumns[columnTabPostion])=='undefined'){
				tabColumns[columnTabPostion] = [];
			}
			tabColumns[columnTabPostion].push(columnData);

			//生成隐藏列
			if(columnData.isHiddenColumn == false){
				if(typeof(tabColumns['hidden'])=='undefined'){
					tabColumns['hidden'] = [];
				}
				tabColumns['hidden'].push(columnData);
			}
			//全部列
			tabColumns['all'].push(columnData);
		}
		//排序
		for(tabName in tabColumns){
			tabColumns[tabName].sort(function(a,b){
				return a.columnIndex - b.columnIndex
			});
		}
		return tabColumns;
	}
	//获取Tabs的名字
	function getTabsName(originalTabsName,tabColumns){
		var tabsName = [];
		for(var nameI = 0; nameI<originalTabsName.length; nameI++){
			tabsName.push({
				key:nameI,
				text:originalTabsName[nameI]
			})
		}
		//自动分配列
		if(typeof(tabColumns['auto'])!='undefined'){
			tabsName.push({
				key:'auto',
				text:language.ui.nsuitablemanager.tabname.auto
			});
		}
		//前固定列
		if(typeof(tabColumns['before'])!='undefined'){
			tabsName.unshift({
				key:'before',
				text:language.ui.nsuitablemanager.tabname.before
			});
		}
		//后固定列
		if(typeof(tabColumns['after'])!='undefined'){
			tabsName.push({
				key:'after',
				text:language.ui.nsuitablemanager.tabname.after
			});
		}
		//隐藏列
		if(typeof(tabColumns['hidden'])!='undefined'){
			tabsName.push({
				key:'hidden',
				text:language.ui.nsuitablemanager.tabname.hidden
			});
		}
		//全部列
		tabsName.push({
			key:'all',
			text:language.ui.nsuitablemanager.tabname.all
		});
		return tabsName;
	}
	//生成管理器代码
	function getHtml(){
		var html = 
			'<div class="modal-tablemanger"  id="nsui-tablemanger">'
				+'<div class="modal-content">'
					+'<div class="modal-header">'
						+'<h4 class="modal-title" id="nsui-tablemanger-label">'
							+language.ui.nsuitablemanager.title
						+'</h4>'
					+'</div>'
					+'<div class="modal-body">'
						+ getTabsHtml()
						+'<table id="nsui-tablemanger-table"></table>'
					+'</div>'
					+'<div class="modal-footer" id="nsui-tablemanger-footer"></div>'
				+'</div>'
			+'</div>'
		return html;
	}
	//生成导航条
	function getTabsHtml(isOnlyTabNav){
		// isOnlyTabNav 是否值输出TABNAV，不包含content 和 ul标签
		if(typeof(isOnlyTabNav)!='boolean'){
			isOnlyTabNav = false;
		}
		//快捷配置 20180723 sjj
		var tabsNameDataArray = $.extend(true,[],managerData.tabsNameDataArray);
		tabsNameDataArray.unshift({
			key:'short',
			text:language.ui.nsuitablemanager.tabname.short
		});
		var tabsHtml = '';
		var contentsHtml = '';
		for(var nameI = 0 ; nameI<tabsNameDataArray.length; nameI++){

			var isShow = false;
			if(isNaN(tabsNameDataArray[nameI].key)){
				isShow = true;
			}else{
				for(key in managerData.columns){
					if(!isShow && managerData.columns[key].tabPosition == tabsNameDataArray[nameI].key && !managerData.columns[key].isHiddenColumn){
						isShow = true;
					break;
					}
				}
			}
			if(isShow){
				var tabData = tabsNameDataArray[nameI];
				var activeCls = managerData.tabActiveName==tabData.key ? 'class="active"' : '';
				var contentActiveCls = managerData.tabActiveName==tabData.key ? ' active' : '';
				
				tabsHtml += 
					'<li '+activeCls+'>'
						+'<a href="#nsui-tablemanger-tabs-'+tabData.key+'" data-toggle="tab" ns-tab-value="'+tabData.key+'">'
							+tabData.text
						+'</a>'
					+'</li>';
				contentsHtml += 
					'<div class="tab-pane'+contentActiveCls+'" id="nsui-tablemanger-tabs-'+tabData.key+'" ns-data="'+tabData.key+'">'
						+getContentHtml(tabData.key)
					+'</div>';
			}
		}

		//TAB管理
		var managerActiveCls = managerData.tabActiveName=='manager' ? 'class="active"' : '';
		var managerContentActiveCls = managerData.tabActiveName=='manager' ? ' active' : '';

		tabsHtml += 
				'<li '+managerActiveCls+'>'
					+'<a href="#nsui-tablemanger-tabs-manager" data-toggle="tab"  ns-tab-value="manager">'
						+language.ui.nsuitablemanager.tabname.manager
					+'</a>'
				+'</li>';
		contentsHtml += 
				'<div class="tab-pane'+managerContentActiveCls+'" id="nsui-tablemanger-tabs-manager">'
					+getContentHtml('manager')
				+'</div>';

		//外壳
		if(isOnlyTabNav == false){
			tabsHtml = 
				'<ul id="nsui-tablemanger-tabs" class="nav nav-tabs float-right">'
					+tabsHtml
				+'</ul>';
		}
		contentsHtml = 
			'<div id="nsui-tablemanger-contents" class="tab-content">'
				+contentsHtml
			+'</div>';

		//是否只返回导航栏
		if(isOnlyTabNav){
			return tabsHtml;
		}else{
			return tabsHtml+contentsHtml;
		}
	}
	function getContentHtml(panelName){
		var html = ''
		switch(panelName){
			case 'manager':
				html = 
					'<div class="tab-content-intro">'
						+'注释：自动分组的TAB不能直接修改名称，需要先添加自定义TAB。<br>包含列中显示的数据绿色数字为显示列，红色数字为隐藏列。'
					+'</div>'
					+'<div id="nsui-tablemanger-tabs-manager-addtab" class="manager-addtab">'
						+'<input id="nsui-tablemanger-tabs-manager-addtab-input" class="manager-addtab-input">'
						+'<div id="nsui-tablemanger-tabs-manager-addtab-btns"></div>'
					+'</div>';
				break;
		}
		return html;
	}
	//初始化快捷配置
	function refreshManagerShort(){
		var $container = $('#nsui-tablemanger .modal-body');
		var shortConfig = {
			$container:$container,
			tableID:_TableID,
			managerData:managerData,
			selectChangeHandler:function(tabIndex){
				managerData.tabsDefaultIndex = tabIndex;
			},//下拉选择改变当前活动tab
			visibleColumnHandler:function(data){
				var isChecked = data.isChecked;
				var nsIndex = data.nsIndex;
				var tableData = managerData.tabColumns[managerData.tabsDefaultIndex];
				if(!$.isArray(tableData)){tableData = managerData.tabColumns['auto'];}
				var rowData = tableData[nsIndex];
				rowData.isHiddenColumn = isChecked;
				//需要重新计算显示宽度
				if(rowData.isCalculateWidth){
					//不是前置后置列，也不是隐藏列0，需要重新计算显示宽度的
					var totalWidth = managerData.columnWidthTabVisible;
					var totalOriginalWidth = 0;
					for(var rowI = 0; rowI<tableData.length; rowI++){
						if(tableData[rowI].isHiddenColumn){
							//可见的才计算总原始宽度
							totalOriginalWidth += tableData[rowI].originalWidth;
						}
					}
					var scale = totalWidth / totalOriginalWidth;
					if(isNaN(scale)){
						scale = 1;
					}
					for(var rowI = 0; rowI<tableData.length; rowI++){
						if(tableData[rowI].isHiddenColumn){
							tableData[rowI].width = Math.round(tableData[rowI].originalWidth * scale);
						}else{
							tableData[rowI].width = '-'
						}
					}
				}else{
					//直接显示宽度的
					if(isChecked){
						rowData.width = rowData.originalWidth;
					}else{
						rowData.width = '-';
					}
				}
				return tableData;
			},//显示隐藏列
			dragSortHandler:function(data){
				var settingSort = parseInt(data.targetIndex);//目标序列号
				var endRowIndex;//目标行号
				var currentNsIndex = data.currentIndex;//当前序列号
				var tableData = managerData.tabColumns[managerData.tabsDefaultIndex];
				if(!$.isArray(tableData)){tableData = managerData.tabColumns['auto'];}
				var rowData = tableData[currentNsIndex];
				var currentRowIndex = currentNsIndex;//当前行号
				var maxSort = tableData.length;
				endRowIndex = data.endIndex;
				var existSortLength = tableData.length;//数据长度
				//生成排序队列
				var rowIndexArr = [];
				var dataArr = [];
				for(var rowI=0; rowI<existSortLength; rowI++){
					var nsIndex = tableData[rowI].columnIndex;
					var dataObj = {
						originaRowIndex:rowI,
						originalNsIndex:nsIndex,
					};
					rowIndexArr.push(rowI);
					dataArr.push(dataObj);
				}
				//重新排序，以便重新赋值
				dataArr.sort(function(a,b){
					return a.originalNsIndex - b.originalNsIndex
				})

				rowIndexArr.splice(currentRowIndex, 1);
				rowIndexArr.splice(endRowIndex, 0, currentRowIndex);

				//根据顺序重新生成nsIndex和序列号，并不是按照顺序赋值
				for(var rowI = 0; rowI<existSortLength; rowI++){
					dataArr[rowIndexArr[rowI]].editNsIndex = dataArr[rowI].originalNsIndex;
					dataArr[rowIndexArr[rowI]].editRowIndex = dataArr[rowI].originaRowIndex;
				}

				//重新赋值
				for(var dataI = 0; dataI<existSortLength; dataI++){
					tableData[dataI].columnIndex = dataArr[dataI].editNsIndex;
				}
				tableData.sort(function(a,b){
					return a.columnIndex - b.columnIndex
				});
				return tableData;
			},//拖拽排序列
		}
		$('#nsui-tablemanger-table').empty();//清空table内容
		nsUI.tablecolumn.init(shortConfig);
	}
	//初始化控制表格
	function refreshManagerTable(dataArr){
		//tab分组下拉列表数据
		var tabSelectNames = [];
		for(var tabsNameI = 0; tabsNameI<managerData.tabsNameDataArray.length; tabsNameI++){
			var tabNameData = managerData.tabsNameDataArray;
			if(	tabNameData[tabsNameI].key!='all' && tabNameData[tabsNameI].key!='hidden'){
				tabSelectNames.push(tabNameData[tabsNameI]);
			}
		}

		var tableConfig = {
			id:'nsui-tablemanger-table',
			primaryID:'data',
			column:[
				{
					title:'标题',
					data:'title',
					type:'input',
					beforeHandler:function(data){

						if(data.rowData.columnIndex==0){
							data.columnData.readonly = true;
						}
					},
					blurHandler:function(data){
						if(data.isModify){
							if(data.value== ''){
								nsalert('无效输入','warning');
								data.$dom.val(data.originalValue);
								return false;
							}
							managerData.tabColumns[data.rowData.originalTabPosition][data.index.row].title=data.value;
						}
						//console.log(managerData);
					}

				},{
					title:'所属TAB分组',
					width:150,
					data:'originalTabPosition',
					type:'select',
					beforeHandler:function(data){
						if(data.rowData.columnIndex==0){
							data.columnData.readonly = true;
						}
					},
					typeData:{
						textField:'text',
						valueField:'key',
						withoutEmpty:true,
						subdata:tabSelectNames
					},
					changeHandler:function(data){
						changeTabPosition(data.rowData.data, data.value);
					}
				},{
					title:'TAB位置',
					width:80,
					data:'tabPosition'
				},{
					title:'设置宽度',
					width:80,
					data:'originalWidth',
					type:'input',
					isUseKeyupEvent:true,
					changeHandler:function(data){
						changeColumnWidth(data);
					}
				},{
					title:'实际显示宽度',
					width:80,
					data:'width',
					type:'input',
					readonly:true
				},{
					title:'隐藏',
					width:60,
					data:'isHiddenColumn',
					type:'switch',
					beforeHandler:function(data){
						if(data.rowData.columnIndex==0){
							data.columnData.readonly = true;
						}
					},
					changeHandler:function(data){
						changeVisible(data);
					}
				},{
					title:'nsI',
					width:50,
					data:'columnIndex'
				},{
					title:'序列号',
					width:50,
					data:'columnIndex',
					type:'input',
					isUseKeyupEvent:true,
					beforeHandler:function(data){
						if(data.rowData.columnIndex==0){
							data.columnData.readonly = true;
						}
						return data.index.row + 1;
					},
					changeHandler:function(data){
						changeSort(data);
					},
					blurHandler:function(data){
						if(data.isModify){
							refreshTabPanel(data.rowData);
						}
						
					}
				},{
					title:'功能',
					width:70,
					data:'columnIndex',
					type:'btn',
					beforeHandler:function(data){
						if(data.rowData.columnIndex == 0){
							data.columnData.btns[0].disabled = true;
							data.columnData.btns[1].disabled = true;
						}else{
							if(data.index.row==0){
								data.columnData.btns[0].disabled = true;
							}
							if(data.index.row==(data.tableData.length-1)){
								data.columnData.btns[1].disabled = true;
							}
						}
						
					},
					btns:[
						{
							text:'上移',
							handler:function(data){
								var setValue = nsUI.staticTable.getValue(data.tableID, 'columnIndex-7', data.index.row-1);
								data.value = setValue;
								moveSort(data);
							}
						},{
							text:'下移',
							handler:function(data){
								var setValue = nsUI.staticTable.getValue(data.tableID, 'columnIndex-7', data.index.row+1);
								data.value = setValue;
								moveSort(data);
							}
						}
					]
				}
			],
			ui:{
				plusClass:'no-border'
			}
		}
		if(!$.isArray(dataArr)){
			dataArr = [];
		}
		tableConfig.data = dataArr;
		nsUI.staticTable.init(tableConfig);
	}
	//初始化表格TAB管理面板
	function initManagerPanel(){
		//初始化按钮
		var btns = [
			{
				text: '新建TAB',
				handler: addTabName
			}
		]
		nsButton.initBtnsByContainerID('nsui-tablemanger-tabs-manager-addtab-btns',btns);
		//初始化输入框的错误状态移除
		$('#nsui-tablemanger-tabs-manager-addtab-input').off('keyup');
		$('#nsui-tablemanger-tabs-manager-addtab-input').on('keyup',function(ev){
			if($(this).hasClass('has-error')){
				$(this).removeClass('has-error')
			}
			if(ev.keyCode == 13){
				//回车确认
				addTabName();
			}
		})
	}
	//判断tabPosition的value是否要转成数字
	function getTabPosition(value){
		if( value=='before' || value=='after' || value=='auto'){
			//是文字类型的
		}else{
			//数字类型的
			value = parseInt(value);
		}
		return value;
	}
	//更换所属TAB
	function changeTabPosition(dataID, value){
		var originalTabPosition = managerData.columns[dataID].originalTabPosition;
		originalTabPosition = getTabPosition(originalTabPosition);
		var settingTabPosition = getTabPosition(value);
		
		managerData.columns[dataID].originalTabPosition = settingTabPosition;
		//删除原来数组中的对象
		for(var originalI = 0; originalI<managerData.tabColumns[originalTabPosition].length; originalI++){
			if(managerData.tabColumns[originalTabPosition][originalI] == managerData.columns[dataID]){
				managerData.tabColumns[originalTabPosition].splice(originalI,1);
			}
		}
		//添加到新的分组中
		managerData.tabColumns[settingTabPosition].push(managerData.columns[dataID]);
		//新分组排序
		managerData.tabColumns[settingTabPosition].sort(function(a,b){
			return a.columnIndex - b.columnIndex
		});
	}
	//更改宽度
	function changeColumnWidth(data){
		//保存当前值
		var settingWidth = parseInt(data.value);
		if(isNaN(settingWidth)){
			settingWidth = 0;
		}
		data.rowData.originalWidth = settingWidth;

		//如果是隐藏列则不用修改可见宽度
		if(data.rowData.isHiddenColumn == false){
			return true;
		};

		//总的可用宽度
		var tabVisibleWidth = managerData.columnWidthTabVisible;
		
		//是否要计算显示宽度，普通Tab都需要重新计算可见宽度，前后固定列则可以直接显示
		if(data.rowData.isCalculateWidth){
			//计算设置后的可见宽度
			var settingVisibleWidth = 0;
			for(var rowI = 0; rowI<data.tableData.length; rowI++){
				if(data.tableData[rowI]!=data.rowData){
					if(data.tableData[rowI].isHiddenColumn){
						settingVisibleWidth += data.tableData[rowI].originalWidth;
					}
				}
			}
			settingVisibleWidth += settingWidth;
			for(var rowI = 0; rowI<data.tableData.length; rowI++){
				if(data.tableData[rowI].isHiddenColumn){
					var visibleWidth = data.tableData[rowI].originalWidth * tabVisibleWidth / settingVisibleWidth;
					data.tableData[rowI].width = Math.round(visibleWidth);
					nsUI.staticTable.setValue('nsui-tablemanger-table','width', rowI, data.tableData[rowI].width);
				}
			}
		}else{
			//直接显示
			var rowIndex = data.index.row;
			data.tableData[rowIndex].width = settingWidth;
			nsUI.staticTable.setValue('nsui-tablemanger-table','width', rowIndex, data.tableData[rowIndex].width);
		}
	}
	//切换是否显示
	function changeVisible(data){
		var isChecked = data.isChecked;
		var rowData = data.rowData;
		rowData.isHiddenColumn = isChecked;

		//需要重新计算显示宽度
		if(rowData.isCalculateWidth){
			//不是前置后置列，也不是隐藏列0，需要重新计算显示宽度的
			var totalWidth = managerData.columnWidthTabVisible;
			var totalOriginalWidth = 0;
			for(var rowI = 0; rowI<data.tableData.length; rowI++){
				if(data.tableData[rowI].isHiddenColumn){
					//可见的才计算总原始宽度
					totalOriginalWidth += data.tableData[rowI].originalWidth;
				}
			}
			var scale = totalWidth / totalOriginalWidth;
			if(isNaN(scale)){
				scale = 1;
			}
			for(var rowI = 0; rowI<data.tableData.length; rowI++){
				if(data.tableData[rowI].isHiddenColumn){
					data.tableData[rowI].width = Math.round(data.tableData[rowI].originalWidth * scale);
				}else{
					data.tableData[rowI].width = '-'
				}
				nsUI.staticTable.setValue(data.tableID,'width', rowI, data.tableData[rowI].width);
			}
		}else{
			//直接显示宽度的
			if(isChecked){
				rowData.width = rowData.originalWidth;
			}else{
				rowData.width = '-';
			}
			nsUI.staticTable.setValue(data.tableID,'width', data.index.row, rowData.width);
		}
	}
	//更改顺序
	function changeSort(data){
		var settingSort = parseInt(data.value);//目标序列号
		var endRowIndex;//目标行号
		var currentNsIndex = data.rowData.columnIndex;//当前序列号
		var currentRowIndex = data.index.row;//当前行号
		var maxSort = data.tableData.length;
		for(var rowI = 0; rowI < maxSort; rowI++){
			if(data.tableData[rowI].columnIndex == settingSort){
				endRowIndex = data.tableData[rowI].row;
			}
		}		
		var existSortLength = data.tableData.length;//数据长度

		//生成排序队列
		var rowIndexArr = [];
		var dataArr = [];
		for(var rowI=0; rowI<existSortLength; rowI++){
			var nsIndex = data.tableData[rowI].columnIndex;
			var dataObj = {
				originaRowIndex:rowI,
				originalNsIndex:nsIndex,
			};
			rowIndexArr.push(rowI);
			dataArr.push(dataObj);
		}
		//重新排序，以便重新赋值
		dataArr.sort(function(a,b){
			return a.originalNsIndex - b.originalNsIndex
		})

		rowIndexArr.splice(currentRowIndex, 1);
		rowIndexArr.splice(endRowIndex, 0, currentRowIndex);

		//根据顺序重新生成nsIndex和序列号，并不是按照顺序赋值
		for(var rowI = 0; rowI<existSortLength; rowI++){
			dataArr[rowIndexArr[rowI]].editNsIndex = dataArr[rowI].originalNsIndex;
			dataArr[rowIndexArr[rowI]].editRowIndex = dataArr[rowI].originaRowIndex;
		}

		//重新赋值
		for(var dataI = 0; dataI<existSortLength; dataI++){
			data.tableData[dataI].columnIndex = dataArr[dataI].editNsIndex;
			nsUI.staticTable.setValue(data.tableID, 'columnIndex-6', dataI, dataArr[dataI].editNsIndex);
			if(dataI!=currentRowIndex){
				nsUI.staticTable.setValue(data.tableID, 'columnIndex-7', dataI, dataArr[dataI].editRowIndex);
			}
		}
	}
	//tab更改顺序
	function changeSortForTab(data){
		var settingSort = parseInt(data.value);//目标序列号
		var endRowIndex;//目标行号
		var currentNsIndex = data.rowData.sort;//当前序列号
		var currentRowIndex = data.index.row;//当前行号
		var maxSort = data.tableData.length;
		for(var rowI = 0; rowI < maxSort; rowI++){
			if(data.tableData[rowI].sort == settingSort){
				endRowIndex = data.tableData[rowI].row;
			}
		}		
		var existSortLength = data.tableData.length;//数据长度
		//生成排序队列
		var rowIndexArr = [];
		var dataArr = [];
		for(var rowI=0; rowI<existSortLength; rowI++){
			var nsIndex = data.tableData[rowI].sort;
			var dataObj = {
				originaRowIndex:rowI,
				originalNsIndex:nsIndex,
			};
			rowIndexArr.push(rowI);
			dataArr.push(dataObj);
		}
		//重新排序，以便重新赋值
		dataArr.sort(function(a,b){
			return a.originalNsIndex - b.originalNsIndex
		})

		rowIndexArr.splice(currentRowIndex, 1);
		rowIndexArr.splice(endRowIndex, 0, currentRowIndex);

		//根据顺序重新生成nsIndex和序列号，并不是按照顺序赋值
		for(var rowI = 0; rowI<existSortLength; rowI++){
			dataArr[rowIndexArr[rowI]].editNsIndex = dataArr[rowI].originalNsIndex;
			dataArr[rowIndexArr[rowI]].editRowIndex = dataArr[rowI].originaRowIndex;
		}

		//重新赋值
		for(var dataI = 0; dataI<existSortLength; dataI++){
			data.tableData[dataI].sort = dataArr[dataI].editNsIndex;
			nsUI.staticTable.setValue(data.tableID, 'sort', dataI, dataArr[dataI].editNsIndex);
			if(dataI!=currentRowIndex){
				nsUI.staticTable.setValue(data.tableID, 'sort', dataI, dataArr[dataI].editRowIndex);
			}
		}
	}
	//上下移动
	function moveSort(data){
		changeSort(data);
		refreshTabPanel(data.rowData);
		//console.log(data);
		//console.log(managerData);
	}
	//tab上下移动
	function moveSortForTab(data){
		changeSortForTab(data);
		console.log(baseTableData);
		refreshTabManagerPanel(data.tableData);
		var tabNameLength = managerData.tabsOriginalNameArray.length;//需要重新赋值的tab名字数组长度
		for(var tabNameI = 0; tabNameI < tabNameLength; tabNameI++){
			managerData.tabsVisible[tabNameI] = data.tableData[tabNameI].visible;//赋值可见性
			managerData.tabsOriginalNameArray[tabNameI] = data.tableData[tabNameI].title;//赋值自定义tab
			managerData.tabsViewNameArray[tabNameI] = data.tableData[tabNameI].title;//赋值全部tab中的自定义tab
			//赋值显示隐藏列未做
		}
	}
	//刷新当前面板 不包括TAB管理
	function refreshTabPanel(rowData){
		var dataArr = managerData.tabColumns[managerData.tabActiveName];
		dataArr.sort(function(a,b){
			return a.columnIndex - b.columnIndex
		});
		rowData.nsAttrSelected = true;
		nsUI.staticTable.refresh(dataArr, 'nsui-tablemanger-table');
		delete rowData.nsAttrSelected;
	}
	//tabsOriginalNameArray
	//刷新TAB管理面板
	function refreshTabManagerPanel(tableData){
		var dataArr = tableData;
		dataArr.sort(function(a,b){
			return a.sort - b.sort
		});
		var tabLength = managerData.tabsOriginalNameArray + 1;
		for(var tabI = 0; tabI < tabLength; tabI++){
			managerData.tabsViewNameArray[tabI] = dataArr[tabI].title;
		}
		tableData.nsAttrSelected = true;
		nsUI.staticTable.refresh(dataArr, 'nsui-tablemanger-table');
		delete tableData.nsAttrSelected;
	}
	//切换tab按钮事件
	function tabChangeHandler(ev){
		var tabValue = $(this).attr('ns-tab-value');
		managerData.tabActiveName = tabValue;
		//sjj20180723 排除快速配置的情况
		$('#nsui-tablemanger .modal-body').children('.manager-draggle').remove();
		if(tabValue === 'short'){
			refreshManagerShort();
		}else{
			var dataArr;
			var isManager = false;
			switch(tabValue){
				case 'all':
				case 'after':
				case 'before':
				case 'hidden':
				case 'auto':
					dataArr = managerData.tabColumns[tabValue];
					break;
				case 'manager':
					isManager = true;
					break;
				default:
					//默认是处理tabGroup里的项目
					var groupIndex = parseInt(tabValue);
					dataArr = managerData.tabColumns[groupIndex];
					break;
			}

			//重新排序

			if(isManager==false){
				dataArr.sort(function(a,b){
					return a.columnIndex - b.columnIndex
				});
				refreshManagerTable(dataArr);
			}else{
				//表格TAB管理
				refreshTabNameManagerTable();
			}
		}
	}
	function refreshTabNameManagerTable(){

		var uiTabsName = managerData.tabsViewNameArray;
		var originalTabsName = managerData.tabsOriginalNameArray;
		//tab分组
		var tabsData = [];
		
		for(var tabsNameI = 0; tabsNameI<originalTabsName.length+1; tabsNameI++){
			
			//TAB类型
			var tabType = tabsNameI <= (originalTabsName.length-1) ? 1:0; 	//1:'自定义TAB'  0:'自动分组'
			//是否默认显示TAB
			//var isDefault = managerData.tableData.uiConfig.tabsDefaultIndex == tabsNameI ? true:false; 	
			//TAB包含的列数量
			var tabColumnShowLength = 0;
			var tabColumnHiddenLength = 0;
			for(var columnI = 0; columnI < managerData.columnArray.length; columnI++){
				if(managerData.columnArray[columnI].tabPosition == tabsNameI){
					if(managerData.columnArray[columnI].isHiddenColumn){
						tabColumnHiddenLength ++;
					}else{
						tabColumnShowLength ++;
					}
				}
			}
			//var tabColumnLengthHtml = '<span class="success">'+tabColumnShowLength + '</span>/<span class="warning">' + tabColumnHiddenLength + '</span>';
			var tabColumnLength = [tabColumnShowLength,tabColumnHiddenLength];
			var tabData = 
				{
					title:uiTabsName[tabsNameI], 					//名称
					key:tabsNameI, 									//index
					tabType:tabType,								//类型  1:'自定义TAB'  0:'自动分组'
					sort:tabsNameI+1,								//顺序
					length:tabColumnLength, 						//包含列数量
					visible:managerData.tabsVisible[tabsNameI], 	//是否可见
					isDefault:tabsNameI, 							//是否默认显示TAB
					control:tabsNameI 								//按钮
				}
			tabsData.push(tabData);
		}

		var tableConfig = {
			id:'nsui-tablemanger-table',
			primaryID:'key',
			column:[
				{
					title:'TAB名称',
					data:'title',
					type:'input',
					beforeHandler:function(data){
						if(data.rowData.tabType == 0){
							data.columnData.readonly = true;
						}
					},
					changeHandler:changeTabName,
				},{
					title:'类型',
					width:100,
					data:'tabType',
					formatHandler:function(data){
						var typeStr = '';
						if(data.value == 1){
							typeStr = '自定义TAB';
						}else{
							typeStr = '自动分组'
						}
						return typeStr;
					}
				},{
					title:'顺序',
					width:100,
					data:'sort'
				},{
					title:'显示列/隐藏列',
					width:100,
					data:'length',
					formatHandler:function(data){
						var showHtml = 
							'<span class="success">'
								+ data.value[0]
							+ '</span>/<span class="warning">' 
								+ data.value[1]
							+ '</span>';
						return showHtml;
					}
				},{
					title:'是否显示',
					width:60,
					data:'visible',
					type:'switch',
					beforeHandler:function(data){
						//显示列为0的tab不能显示
						if(data.rowData.length[0] == 0){
							data.columnData.readonly = true;
							data.value = false;
						}
						if(data.rowData.tabType == 0){
							data.columnData.readonly = true;
						}
					},
					changeHandler:changeTabVisible
				},{
					title:'默认显示',
					width:60,
					data:'isDefault',
					type:'radio-column',
					value:managerData.tabsDefaultIndex,
					changeHandler:function(data){
						console.log(data);
						data.columnData.value = data.index.row;
						managerData.tabsDefaultIndex = data.index.row;
					}
				},{
					title:'功能',
					width:70,
					data:'control',
					type:'btn',
					beforeHandler:function(data){
						if(data.rowData.tabType == 0){
							data.columnData.btns[0].disabled = true;
							data.columnData.btns[1].disabled = true;
						}else{
							if(data.index.row==0){
								data.columnData.btns[0].disabled = true;
							}
							if(data.index.row==(data.tableData.length-2)){
								data.columnData.btns[1].disabled = true;
							}
						}
						
					},
					btns:[
						{
							text:'上移',
							handler:function(data){
								var setValue = nsUI.staticTable.getValue(data.tableID, 'sort', data.index.row-1);
								data.value = setValue;
								moveSortForTab(data);
							}
						},{
							text:'下移',
							handler:function(data){
								var setValue = nsUI.staticTable.getValue(data.tableID, 'sort', data.index.row+1);
								data.value = setValue;
								moveSortForTab(data);
							}
						}
					]
				}
			],
			ui:{
				plusClass:'no-border'
			}
		}
		tableConfig.data = tabsData;
		nsUI.staticTable.init(tableConfig);
	}
	//修改tab名称
	function changeTabName(data){
		console.log(data);
		if(data.isModify){
			var tabName = data.value;
			//如果是空就恢复为原始值
			if(tabName == ''){
				nsalert('无效输入','warning');
				data.$dom.val(data.originalValue);
				return false;
			}
			
			var isChangeTabType = false;
			if(data.rowData.tabType == 1){
				//改已经定义的
				managerData.tabsOriginalNameArray[data.index.row] = tabName;
				managerData.tabsViewNameArray[data.index.row] = tabName;
				
			}else{
				//如果修改的是自动分组，就改为自定义分组，新增分组信息
				isChangeTabType = true;
				data.rowData.tabType = 1;
				var currentTabPosition = data.index.row
				nsUI.staticTable.setValue('nsui-tablemanger-table','tabType', currentTabPosition, 1);
				managerData.tabsOriginalNameArray.push(tabName);
				managerData.tabsViewNameArray[currentTabPosition] = tabName;
				var sortNumber = 1;

				//修改下面的其它自动分配列
				for(var beforeRowI = managerData.tabsOriginalNameArray.length; beforeRowI<data.tableData.length; beforeRowI++){
					managerData.tabsViewNameArray[beforeRowI] = sortNumber.toString();
					nsUI.staticTable.setValue('nsui-tablemanger-table','title', beforeRowI, sortNumber);
					sortNumber++
				};
				//修改相关列数据的原始位置
				for(var columnDataI = 0; columnDataI<managerData.columnArray.length; columnDataI++){
					//console.log(managerData.columnArray[columnDataI].tabPosition)
					if(managerData.columnArray[columnDataI].tabPosition == currentTabPosition){
						managerData.columnArray[columnDataI].originalTabPosition = currentTabPosition
					}
				}
			}
			
			//修改NavTab
			managerData.tabColumns = getTabColumns(managerData.columns);
			managerData.tabsNameDataArray = getTabsName(managerData.tabsOriginalNameArray, managerData.tabColumns);

			//修改分组下拉列表及弹出面板TAB
			var tabNavHtml = getTabsHtml();
			$('#nsui-tablemanger-tabs').remove();
			$('#nsui-tablemanger-contents').remove();
			$('#nsui-tablemanger .modal-body').prepend(tabNavHtml)
			$('#nsui-tablemanger-tabs li a[data-toggle="tab"]').on('click', tabChangeHandler);
			initManagerPanel();
		}
	}
	//新增TAB名称
	function addTabName(){
		var $tabNameInput = $('#nsui-tablemanger-tabs-manager-addtab-input');
		var tabsOriginalNameArray = managerData.tabsOriginalNameArray;

		var value = $tabNameInput.val();
		value = $.trim(value);

		if(value==''){
			nsalert('TAB名称不能为空，请先输入TAB名称','error');
			$tabNameInput.addClass('has-error')
			$tabNameInput.focus();
			return;
		}else{
			for(var nameI = 0; nameI<tabsOriginalNameArray.length; nameI++){
				if(value == tabsOriginalNameArray[nameI]){
					nsalert('TAB名称不能重复，请核实','error');
					$tabNameInput.addClass('has-error')
					$tabNameInput.select();
					return;
				}
			}
		}

		var tabsViewNameArray = managerData.tabsViewNameArray;
		var tabsVisible = managerData.tabsVisible;

		var originalTabsNameLength = tabsOriginalNameArray.length;
		//如果默认和当前显示TAB在新加TAB之后，默认显示TAB和当前显示TAb顺序加1
		if(managerData.tabsDefaultIndex >= originalTabsNameLength){
			managerData.tabsDefaultIndex ++;
		}
		
		//更新column
		for(var columnI = 0; columnI < managerData.columnArray.length; columnI++){
			if(managerData.columnArray[columnI].tabPosition >= originalTabsNameLength){
				//console.log(managerData.columnArray[columnI])
				managerData.columnArray[columnI].tabPosition ++;
			}
		}
		
		tabsViewNameArray.splice(originalTabsNameLength, 0, value);
		tabsVisible.splice(originalTabsNameLength, 0, false);
		tabsOriginalNameArray.push(value);

		//TAB名称数组
		tabsName = getTabsName(tabsOriginalNameArray, managerData.tabColumns);

		refreshTabNameManagerTable();
		$tabNameInput.val('');		
	}
	//修改TAB是否显示
	function changeTabVisible(data){
		var tabIndex = data.index.row;
		managerData.tabsVisible[tabIndex] = data.isChecked;
	}
	//保存个人设置
	function saveConfig() {
		//全部数据
		/*managerData = {
			columns:columns, 					//基础列数据 object
			columnArray:columnArray, 			//基础列数据 array
			tabColumns:tabColumns, 				//分组的列数据 {0:[],1:[],auto:[],after:[],before:[], all:[], hidden:[]}

			tabsNameDataArray:tabsNameData, 				//tab的名称数据 [{key:'auto',text:'自动分组列'}]
			tabsOriginalNameArray:tabsOriginalNameArray, 	//tab的原始名称数组，只包含用户定义部分 ['基本信息','附加信息']
			tabsViewNameArray:tabsViewNameArray, 		//tab的显示名称数组，只包含用户定义部分 ['基本信息','附加信息','1','2']
			tabsVisible:tabsVisible, 						//tab的显示状态 [true,false,true]

			tabActiveName:tabActiveName, 		//当前显示tabNav的名字 例如 before all 1 manager 
			tabsDefaultIndex:tabsDefaultIndex, 	//表格的默认显示TAB  0 1 2
		};*/
		var data  = managerData;
		var tableStorageData = store.get(_START_WITH_TABLE + _TableID);
		if (typeof(tableStorageData) == 'undefined') {
			//该表格没有被存储
			tableStorageData = {
				field: {},
				uiConfig: {}
			};
		}
		//列配置
		var field = tableStorageData.field;
		for (key in data.columns) {
			var colData = data.columns[key];
			if(typeof(field[key]) == 'undefined'){
				field[key] = {};
			}
			field[key].t = colData.title; //标题
			field[key].i = colData.columnIndex; //排序
			if (typeof(colData.isHiddenColumn) == 'boolean') {
				field[key].v = !colData.isHiddenColumn; //是否隐藏
			}
			if (colData.originalWidth != colData.width) {
				field[key].w = colData.originalWidth; //宽度
			}
			if (colData.originalTabPosition != 'auto') {
				field[key].tp = colData.originalTabPosition; //tab页
			}
		}
		//ui配置
		tableStorageData.uiConfig = {
			n: $.extend(true, [], data.tabsOriginalNameArray),
			v: $.extend(true, [], data.tabsVisible),
			i: data.tabsDefaultIndex
		};
		tableStorageData.timestamp = new Date().getTime();
		//保存本地设置
		saveLocalConfig(tableStorageData);
		//保存服务器设置
		saveServerConfig();
		//关闭
		remove();
		//刷新表格
		baseDataTable.refreshByID(_TableID);
	}
	//清除个人设置
	function delConfig() {
		//nsconfirm('您将要清除个人设置，恢复为原始数据，是否确认？', function(isConfirm) {
			//if (isConfirm) {
				//清除本地设置
				delLocalConfig();
				//保存服务器设置
				saveServerConfig();
				//关闭
				remove();
				//刷新表格
				baseDataTable.refreshByID(_TableID);
			//}
		//}, 'warning')
	}
	//保存本地设置
	function saveLocalConfig(config) {
		store.set(_START_WITH_TABLE + _TableID, config);
	}
	//清除本地设置
	function delLocalConfig() {
		store.remove(_START_WITH_TABLE + _TableID);
	}
	//保存服务器设置
	function saveServerConfig(isTip) {
		isTip = typeof(isTip) == 'boolean' ? isTip : true;
		var obj = store.getAll();
		var copyObj = {};
		for (key in obj) {
			if (key.substr(0, _START_WITH_TABLE.length) == _START_WITH_TABLE) {
				copyObj[key] = obj[key];
			}
		}
		var dataJson = JSON.stringify(copyObj);
		 try {
			$.ajax({
				url: getRootPath() + '/uiInf/save',
				data: {
					typeCode: _TYPE_CODE_TABLE,
					context: dataJson
				},
				type: 'post',
				dataType: 'json',
				success: function(data) {
					if (data.success) {
						if(isTip){
							nsalert('操作成功','success');
						}
					} else {
						if(isTip){
							nsalert('操作失败','error');
						}
					}
				}
			});
		} catch(e) {
			console.log(e);
		}
	}
	//获取服务器设置
	function getServerConfig(){
		try {
			$.ajax({
				url: getRootPath() + '/uiInf/get',
				data: {
					typeCode: _TYPE_CODE_TABLE
				},
				type: 'post',
				dataType: 'json',
				success: function(data) {
					if (data.success && data.context) {
						var obj = JSON.parse(data.context);
						if (obj) {
							//循环所有表格配置
							for (key in obj) {
								var localConfig = store.get(key);
								if (typeof(localConfig) == 'object') {
									if(localConfig.timestamp < obj[key].timestamp){
										store.set(key, obj[key]);
									}
								} else {
									store.set(key, obj[key]);
								}
							}
						}
					}
				}
			});
		} catch(e) {
			console.log(e);
		}
	}
	return {
		init: init,
		managerData: managerData,
		getServerConfig: getServerConfig,
		saveServerConfig: saveServerConfig
	}
})(jQuery);
