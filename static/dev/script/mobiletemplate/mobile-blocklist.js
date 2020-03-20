/*
 * @Desription: 块状表格组件
 * @Author: netstar.sjj
 * @Date: 2019-03-07 13:28:05
 */
"use strict";
//块状grid NetstarBlockList
var NetstarBlockListM = (function () {
	//语言包
	var I18N = {
		zh: {
			footerValueSum: '合计',
			footerValueAverage: '平均',
			searchWord: '过滤',
			loadingInfo: '正在加载，请稍候',
			loadedError: '数据加载错误',
			noData:'暂无数据',
		},
		en: {
			footerValueSum: 'Total',
			footerValueAverage: 'Average',
			searchWord: 'Filter',
			loadingInfo: 'Loading...',
			loadedError: 'Loaded Error',
			noData:'empty...',
		}
	}
	function getUserLanguage(){
		/**
		 * @msg: 返回浏览器用户语言
		 * @param：-
		 * @return: string 例如 zh（简体中文）en（英文）
		*/
		var userLanguage = 'zh'; //默认简体中文
		if (navigator.userLanguage) {
			userLanguage = navigator.userLanguage.substring(0, 2).toLowerCase();
		} else {
			userLanguage = navigator.language.substring(0, 2).toLowerCase();
		}
		return userLanguage;
	}
	var i18n = I18N[getUserLanguage()];

	//vue模板配置
	var TEMPLATE = {
		PC: {
			HEADER: {
				//整体头部容器
				CONTAINER:
					'<div  nsgirdpanel="grid-body" class="pt-panel grid-header">\
						<div class="pt-container">'+
					//标题面板
					'{{TITLEPANEL}}' +
					//过滤和搜索面板
					"{{FILTERPANEL}}" +
					'</div>\
					</div>',
				//标题面板
				TITLEPANEL:
					'<div class="title-panel">{{ header.title }}</div>',
				//过滤和搜索面板
				FILTERPANEL:
					'<div class="pt-form pt-form-inline pt-form-normal">\
						<!-- 表单内容 -->\
						<div class="pt-form-body">\
							<div class="pt-form-group">\
								<label for="name" class="pt-control-label">过滤</label>\
								<div class="pt-input-group">\
									<input type="text" class="pt-form-control" :placeholder="header.placeholder" @keyup="searchInputKeyupHandler" >\
									<div class="pt-input-group-btn">\
										<button class="pt-btn pt-btn-default pt-btn-icon"  v-on:click="filterSearchHandler" >\
											<i class="icon-search"></i>\
										</button>\
									</div>\
								</div>\
							</div>\
						</div>\
					</div>'
			},
			BODY: {
				CONTAINER:
					'<div nsgirdpanel="grid-body"  class="pt-panel pt-grid-body">\
						<div class="pt-container">' +
							//左固定表格
							//可操作的内容表格
							'<template v-if="ui.isHeader === true">'+
								'{{HEADERTABLE}}' +
							'</template>'+
							'<div nsgirdcontainer="grid-body-container" class="pt-grid-body-container">' +
								'{{CONTENTTABLE}}' +
								//'{{SCROLLX}}' +
								//'{{SCROLLY}}' +
							'</div>' +
							'{{FOOTERTABLE}}' +
						'</div>\
					</div>',
				//表格头部 固定头部
				HEADERTABLE:
					'<div class="pt-grid-body-head" nsgirdcontainer="grid-body-headertable" :id="domParams.headerTableContainer.id">' +
					'<table class="pt-grid" :style="domParams.headerTable.style" :id="domParams.headerTable.id">' +
					// '<colgroup>' +
					// 	'<col v-for="columnCofig in columns" :style="columnCofig.styleObj">' +
					// 	'</col>' +
					// '</colgroup>' +
					'<tbody>' +
					'<tr>' +
					'<td \
											v-for="columnCofig in columns" \
											class="thead-th" \
											:class="[columnCofig.columnType,NetstarOrderClass(columnCofig)]" \
											:ns-field="columnCofig.field" \
											v-html="columnCofig.title" \
											:style="columnCofig.styleObj" \
											@click.self="columnOrderHandler"\
										>' +
					//'{{ columnCofig.title }} '+
					'</td>' +
					'</tr>' +
					'</tbody>' +
					'</table>' +
					'</div>',
				//内容表格
				CONTENTTABLE:
					'<div \
						nsgirdcontainer="grid-body-contenttable" \
						class="pt-panel pt-grid-body" \
						:class="ui.displayMode" \
						:style="domParams.contentTableContainer.style" \
						:id="domParams.contentTableContainer.id" \
						@mousewheel="contentWheelHandler" \
					>' +
					'<div v-if="domParams.panelOfEmptyRows.isShow" class="panel-emptyrows" :class="domParams.panelOfEmptyRows.class"><span>{{domParams.panelOfEmptyRows.info}}</span></div>' +
					'<div class="pt-grid" :style="domParams.contentTable.style" :id="domParams.contentTable.id">' +
						'<div v-for="(row,index) in rows" :ns-rowindex="index" :ns-id="row[idField]" @click="rowClickHandler" @dblclick="rowdbClickHandler" class="pt-block-list" :class="[{\'selected\':row.netstarSelectedFlag},{\'disabled\':row[\'NETSTAR-TRDISABLE\']},plusClass,netstarRowStateFlag(row)]">' +
							'<template v-for="colConfig in columns">' +
								'<template v-if="colConfig.columnType === \'columnstate\' ">' +
									'<div v-html="NetStarColumnStateText(row, colConfig)" :class="[netstarRowStateFlag(row)]" column-state="workitemstatemanage"></div>'+
								'</template>' +
							'</template>' +
							'<div class="pt-block-content" v-if="ui.isEditMode === true" v-html="netStarColumnText(row,index)" @touchstart="touchstartHandler" @touchmove="touchmoveHandler" @touchend="touchendHandler">' +
							'</div>' +
							'<div class="pt-block-content" v-else v-html="netStarColumnText(row,index)">' +
							'</div>' +
							'<template v-for="columnConfig in columns">' +
								'<template v-if="columnConfig.columnType === \'autoserial\' ">' +
									//'{{index + 1 + page.start}}' +
								'</template>' +
								'<template v-else-if="columnConfig.columnType === \'checkselect\' ">' +
										'<div v-if="ui.isShowTitle" class="pt-block-title">\
											<label \
												class="checkbox-inline" \
												:class="[{\'checked\':row.netstarCheckboxSelectedFlag},{\'disabled\':row[\'NETSTAR-TRDISABLE\']}]" \
												@click.stop="checkboxSelelctHandler" \
											>\
											</label>\
										</div>\
								</template>'+
								'<template v-else-if="columnConfig.columnType === \'btns\'">\
									<div class="block-table-button pt-btn-group pt-inlinebtn-group">'
										+'<span class="text right">'
										+'<button type="button" \
											class="btn btn-white btn-icon" \
											nstype="moblieButtons" \
											data-toggle="tooltip" title="更多" \
											@click="moreBtnsHandler"><i class="icon-ellipsis-circle-h"></i></button>'
										+'</span>'
									+'</div>\
								</template>' +
							'</template>' +
						'</div>' +
					'</div>' +
					'</div>',
				//横向滚动条
				SCROLLX:
					'<div nsgirdcontainer="grid-body-scroll-x"  @scroll = "scrollXContentTable" :style="domParams.scrollX.containerStyle" >' +
					'<div class="grid-body-scroll-x-div" :id="domParams.scrollX.id" :style="domParams.scrollX.style"></div>' +
					'</div>',
				//纵向滚动条
				SCROLLY:
					'<div nsgirdcontainer="grid-body-scroll-y"  @scroll = "scrollYContentTable" :style="domParams.scrollY.containerStyle" >' +
					'<div class="grid-body-scroll-y-div" :id="domParams.scrollY.id" :style="domParams.scrollY.style"></div>' +
					'</div>',
				FOOTERTABLE:
					'<div nsgirdcontainer="grid-body-footertable" class="pt-grid-body-footer" :id="domParams.footerTableContainer.id">' +
					'<table class="pt-grid" :style="domParams.footerTable.style" :id="domParams.footerTable.id">' +
					//'<colgroup>' +
					//'<col v-for="columnCofig in columns" :style="columnCofig.styleObj">' +
					//'</col>' +
					//'</colgroup>' +
					'<tbody>' +
					'<tr>' +
					'{{ns-footer-tds}}' +  //这句话用于替换为给定的字符串 不使用VUE渲染
					'</tr>' +
					'</tbody>' +
					'</table>' +
					'</div>',
				ADDBTN:
					'<div nsgirdcontainer="grid-body-addbtn" class="pt-grid-body-addbtn" :id="domParams.addBtnContainer.id">'
						+'<button \
							type="button" \
							title="添加" \
							ns-index="0" \
							onclick="javascript:NetstarBlockListM.addRowBtnsHandler(\'{{gridId}}\',this)" \
							class="pt-btn pt-btn-default">\
								<span>添加</span>\
						</button>'
					+'</div>',
			},
			//底部
			FOOTER: {
				CONTAINER:
					'<div class="pt-panel pt-grid-footer">' +
					'<div class="pt-container">' +
					'<div class="pt-panel-row">' +
					'<div class="pt-panel-col">' +
					//按钮组面板
					'{{BUTTONS}}' +
					'<template v-if="ui.isCheckSelect === \'true\'">' +
					//'<label class="checkbox-inline" :id="domParams.footerCheckbox.id" onclick="NetstarBlockListM.userAllSelect(this,\'block\')"></label>' +
					'</template>' +
					'</div>' +
					'<div class="pt-panel-col text-right">' +
					'<div class="pt-pager">' +
					'<div class="pt-form pt-form-inline pt-form-normal">' +
					'<div class="pt-form-body">' +
					'{{TOTALINFO}}' +
					'</div>' +
					'</div>' +
					'</div>' +
					'</div>' +
					'</div>' +
					'</div>' +
					'</div>',
				//按钮容器
				BUTTONS:
					'<div class="pt-table-btn">' +
					'<div class="pt-btn-group" :id="domParams.footerButtons.id">' +
					//按钮容器
					'</div>' +
					'</div>',
				//合计信息
				TOTALINFO:
					'<div class="pt-page-conclusion">' +
					'<div class="pt-form-group">' +
					'<label for="name" class="pt-control-label">' +
					//共多少条 多少页
					'{{pageNumberWithMax}}' +
					'</label>' +
					'</div>' +
					'</div>',
			},
		},
		MOBILE: {

		}
	}
	var vueTemplate = TEMPLATE.PC;

	// 工作项配置状态配置
	var workItemStateManage = {
		// 待办
		dealt : {
			0 : false,
			1 : false,
			2 : true,
			3 : true,
			4 : false,
			5 : false,
			16 : false,
			32 : false,
			128 : false,
		},
		// 状态名
		name : {
			4 : 		'transfer',				// 转移
			5 : 		'file',					// 归档
			16 : 		'delete',				// 删除
			128 : 		'close',				// 关闭
		},
		// 行或列状态
		trtd : {
			transfer : 	'transfer-message',				// 转移
			file : 		'file-message',					// 归档
			delete : 	'delete-message',				// 删除
			close : 	'close-message',				// 关闭
			rollback : 	'again-message', 				// 重办
			emergency : 'emergency-message', 			// 应急
			suspend : 	'suspend-message', 				// 挂起
			normal: 	'normal-message',				// 待办
		},
		// 图标状态
		icon : {
			transfer : 	'icon-transtion-o',				// 转移
			file : 		'icon-file-check-o',			// 归档
			delete : 	'icon-trash-o',					// 删除
			close : 	'icon-close-circle-o',			// 关闭
			rollback : 	'icon-return', 					// 重办
			emergency : 'icon-flash', 					// 应急
			suspend : 	'icon-minus-s-o', 				// 挂起
			normal: 	'icon-sitemap',					// 待办
		},
		// 文字状态
		word : {
			transfer : 	'转移',							// 转移
			file : 		'归档',							// 归档
			delete : 	'删除',							// 删除
			close : 	'关闭',							// 关闭
			rollback : 	'重办', 						// 重办
			emergency : '应急', 						// 应急
			suspend : 	'挂起', 						// 挂起
			normal: 	'待办',							// 待办
		}
	}

	var methodsManager = {
		//初始化domPamas对象，减少不必要的JQ对象调用
		initDomParams: function (_vueConfig) {
			//本方法是在mounted中调用的
			//总容器
			_vueConfig.domParams.container.$dom = $('#' + _vueConfig.domParams.container.id);

			//三个主要表格
			_vueConfig.domParams.headerTable.$dom = $('#' + _vueConfig.domParams.headerTable.id);
			_vueConfig.domParams.footerTable.$dom = $('#' + _vueConfig.domParams.footerTable.id);
			_vueConfig.domParams.contentTable.$dom = $('#' + _vueConfig.domParams.contentTable.id);
			//两个滚动条
			_vueConfig.domParams.scrollX.$dom = $('#' + _vueConfig.domParams.scrollX.id);
			_vueConfig.domParams.scrollY.$dom = $('#' + _vueConfig.domParams.scrollY.id);
			//able容器 包含三个主要table和两个滚动条
			_vueConfig.domParams.headerTableContainer.$dom = $('#' + _vueConfig.domParams.headerTableContainer.id);
			_vueConfig.domParams.footerTableContainer.$dom = $('#' + _vueConfig.domParams.footerTableContainer.id);
			_vueConfig.domParams.contentTableContainer.$dom = $('#' + _vueConfig.domParams.contentTableContainer.id);

			//拖拽容器的id
			_vueConfig.domParams.dragContainer.$dom = $('#' + _vueConfig.domParams.dragContainer.id);
		},
		//纵向滚动
		scrollYTableHandler: function (ev, _vueConfig) {
			//目前只有一个跟随滚动的表格
			var scrollTop = ev.target.scrollTop;
			//content表格容器 跟随移动
			var $contentTableContainer = _vueConfig.domParams.contentTableContainer.$dom;
			$contentTableContainer.scrollTop(scrollTop);
		},
		//三个表格同步横向滚动
		scrollXTableHandler: function (ev, _vueConfig) {

			var scrollLeft = ev.target.scrollLeft;
			var $gridBody = $(ev.target).closest('[nsgirdpanel="grid-body"]');
			//header表格跟随移动
			var $headerTableContainer = $gridBody.find('[nsgirdcontainer="grid-body-headertable"]');

			$headerTableContainer.scrollLeft(scrollLeft);

			//content表格跟随移动
			var $bodyTableContainer = $gridBody.find('[nsgirdcontainer="grid-body-contenttable"]');
			var $bodyTableContainer = _vueConfig.domParams.contentTableContainer.$dom;
			$bodyTableContainer.scrollLeft(scrollLeft);

			//footer表格跟随移动
			var $footerTableContainer = $gridBody.find('[nsgirdcontainer="grid-body-footertable"]');
			$footerTableContainer.scrollLeft(scrollLeft);
		},
		//刷新纵向滚动条的的容器高度
		refreshScrollY: function (vueConfig) {
			vueConfig.$options.contentTableAttr.isRefreshSource = false;
			//
			if (vueConfig.$options.contentTableAttr.$table == '') {
				vueConfig.$options.contentTableAttr.$table = $(vueConfig.$el).find('[nsgirdcontainer="grid-body-contenttable"] > table')
			};
			var $contentTable = vueConfig.$options.contentTableAttr.$table;

			//vueConfig.domParams.scrollY.style = {height:$contentTable.height() + 'px'};
			//已经是updated调用，所以只能直接写style了
			var tableHeight = vueConfig.domParams.contentTable.$dom.height();
			var containerHeight = vueConfig.domParams.contentTableContainer.$dom.height();
			vueConfig.domParams.scrollY.$dom.height(tableHeight);

			//容器高度大于表格高度 不需要出现容器滚动条 反之则需要
			var isScroll = containerHeight < tableHeight;
			if (isScroll) {
				//如果需要 则显示滚动条并写入高度
				vueConfig.domParams.scrollY.$dom.parent().css({ 'visibility': 'visible' });
				//sjj 20190509如果有纵向滚动条则需要有一行行高的边距值
				vueConfig.domParams.contentTableContainer.style['padding-bottom'] = '28px';
			} else {
				//如果不需要 则不显示滚动条 高度写入无关紧要
				vueConfig.domParams.scrollY.$dom.parent().css({ 'visibility': 'hidden' });
			}
		},
		//在内容表格滚动滚轮
		contentWheelHandler: function (ev, _vueConfig) {
			if (ev.ctrlKey) {
				//如果按下了ctrl 现在浏览器很可能是默认为缩放表格了
				ev.preventDefault();
			}
			//目前只有一个跟随滚动的表格
			//content表格容器 跟随移动
			var $contentTableContainer = _vueConfig.domParams.contentTableContainer.$dom;

			if (ev.altKey == true) {
				//按下了alt键则是横向滚动
				var scrollLeft = ev.deltaY + $contentTableContainer.scrollLeft();
				$contentTableContainer.scrollLeft(scrollLeft);
				//滚动边框也跟随滚动
				_vueConfig.domParams.scrollX.$dom.parent().scrollLeft(scrollLeft);
			} else {
				//没有按下alt键是纵向滚动
				//获取一行的高度，并切换选中状态到下一行
				var selectIndex = 0; //当前选中的行下标
				for (var rowI = 0; rowI < _vueConfig.rows.length; rowI++) {
					var rowData = _vueConfig.rows[rowI];
					if (rowData.netstarSelectedFlag) {
						selectIndex = rowI;
						rowData.netstarSelectedFlag = false;
					}
				}

				var targetSelectedIndex = selectIndex; //即将选中的行下标
				if (ev.deltaY > 0) {
					//实际值是100 发生了向下滚动
					targetSelectedIndex = selectIndex < _vueConfig.rows.length - 1 ? selectIndex + 1 : selectIndex;
				} else {
					//实际值是-100 向上滚动
					targetSelectedIndex = selectIndex >= 1 ? selectIndex - 1 : selectIndex;
				}
				if (typeof (_vueConfig.rows[targetSelectedIndex]) == "object") {
					_vueConfig.rows[targetSelectedIndex].netstarSelectedFlag = true;
					//sjj 20190508 数据发生变化指的是数组发生变化，数据才会发生变化
					//滚动举例加上当前行的举例
					var scrollTop = $contentTableContainer.scrollTop();
					scrollTop += _vueConfig.domParams.contentTable.$dom.find('tbody tr').eq(targetSelectedIndex).position().top;
					// var scrollTop = ev.deltaY + $contentTableContainer.scrollTop();
					$contentTableContainer.scrollTop(scrollTop);
					//滚动边框也跟随滚动
					_vueConfig.domParams.scrollY.$dom.parent().scrollTop(scrollTop);
				}
			}
		},
		body: {
			//选中行的操作
			rowClickHandler: function (ev, _vueData) {
				//ev.stopPropagation();
				if(_vueData.ui.isEditMode){
					ev.preventDefault();
					ev.stopPropagation();
					return;
				}
				var id = _vueData.$options.id;
				var configs = NetstarBlockListM.configs[id];
				var	rowIndex = $(ev.target).closest('div[ns-rowindex]').attr('ns-rowindex');
				var gridConfig = configs.gridConfig;
				rowIndex = parseInt(rowIndex);
				var rows = _vueData.$data.rows;
				var rowData = rows[rowIndex];
				if (rowData['NETSTAR-TRDISABLE']) {
					return;
				}
				var selectMode = gridConfig.ui.selectMode;
				var setFlag = !rowData.netstarSelectedFlag; //如果是已选则取消，未选中则选中
				switch (selectMode) {
					case 'single':
						//单选
						if (setFlag == false) {
							return; //取消选中方法
						}
						if (setFlag == true) {
							//单选只能有一个选中项，需要取消掉所有选中的
							for (var i = 0; i < rows.length; i++) {
								rows[i].netstarSelectedFlag = false;
							}
						}
						rowData.netstarSelectedFlag = setFlag;
						break;
					case 'multi':
					case 'checkbox':
						//多选 sjj20190126
						if (gridConfig.ui.isCheckSelect) {
							//checkbox复选框多选
							if (setFlag == true) {
								//单选只能有一个选中项，需要取消掉所有选中的
								for (var i = 0; i < rows.length; i++) {
									rows[i].netstarSelectedFlag = false;
								}
							}
							rowData.netstarSelectedFlag = setFlag;
						} else {
							rowData.netstarSelectedFlag = setFlag;
						}
						break;
					case 'none':
					default:
						//不能选中或者未定义都是不执行
						break;
				}
				//回调行选中事件
				if (gridConfig.ui.selectedHandler) {
					var originalRows = configs.vueConfig.data.originalRows;
					if (gridConfig.data.isServerMode == false) {
						//客户端获取数据
						rowData = originalRows[rowIndex + configs.vueConfig.data.page.start];
					}else{
						rowData = originalRows[rowIndex];
					}
					dataManager.formatSingleRowData(rowData,gridConfig.columnById);
					//返回参数中第一个永远是操作行数据，从第二个参数中可以通过判断netstarSelectedFlag获取多选状态下的
					var callbackData = gridConfig.ui.selectedHandler(rowData, _vueData.$data, _vueData, gridConfig)
					//如果有返回值，则刷新行数据
					if (typeof (callbackData) == 'object') {
						rowData = callbackData;
					}
				}
			},
			//行内 多选复选框的的操作
			checkboxSelelctHandler: function (ev, _vueData) {
				var id = _vueData.$options.id;
				var $tr = $(ev.target).closest('tr');
				if ($(ev.target).hasClass('disabled')) { return; }
				var configs = NetstarBlockListM.configs[id];
				var rowIndex = $(ev.target).closest('.pt-block-list').attr('ns-rowindex');
				var gridConfig = configs.gridConfig;
				rowIndex = parseInt(rowIndex);
				var rows = _vueData.$data.rows;
				var rowData = rows[rowIndex];
				var setFlag = !rowData.netstarCheckboxSelectedFlag; //如果是已选则取消，未选中则选中
				rowData.netstarCheckboxSelectedFlag = setFlag;
				//sjj 20190119 设置全选状态
				this.setUserAllSelectCheckState(_vueData, gridConfig.ui.displayMode);
				//回调行选中事件
				if (gridConfig.ui.checkboxSelectedHandler) {
					var originalRows = configs.vueConfig.data.originalRows;
					if (gridConfig.data.isServerMode == false) {
						//客户端获取数据
						rowData = originalRows[rowIndex + configs.vueConfig.data.page.start];
					}else{
						rowData = originalRows[rowIndex];
					}
					//返回参数中第一个永远是操作行数据，从第二个参数中可以通过判断netstarSelectedFlag获取多选状态下的
					var callbackData = gridConfig.ui.checkboxSelectedHandler(rowData, _vueData.$data, _vueData, gridConfig)
					//如果有返回值，则刷新行数据
					if (typeof (callbackData) == 'object') {
						rowData = callbackData;
					}
				}
			},
			//双击事件
			rowdbClickHandler: function (ev, _vueData) {
				var id = _vueData.$options.id;
				var $tr = $(ev.target).closest('tr');
				var configs = NetstarBlockListM.configs[id];
				var gridConfig = configs.gridConfig;
				var rowIndex = $tr.attr('ns-rowindex');
				rowIndex = parseInt(rowIndex);
				var rows = _vueData.$data.rows;
				var rowData = rows[rowIndex];
				var originalRows = configs.vueConfig.data.originalRows;
				if (gridConfig.data.isServerMode == false) {
					//客户端获取数据
					rowData = originalRows[rowIndex + configs.vueConfig.data.page.start];
				}else{
					rowData = originalRows[rowIndex];
				}
				dataManager.formatSingleRowData(rowData,gridConfig.columnById);
				//var selectedData = originalRows[rowIndex];
				//回调行选中事件
				if (gridConfig.ui.rowdbClickHandler) {
					//返回参数中第一个永远是操作行数据，从第二个参数中可以通过判断netstarSelectedFlag获取多选状态下的
					var callbackData = gridConfig.ui.rowdbClickHandler(rowData, _vueData.$data, _vueData, gridConfig)
					//如果有返回值，则刷新行数据
					if (typeof (callbackData) == 'object') {
						rowData = callbackData;
					}
				}
			},
			//行状态添加class
			rowStateClassHandler: function (data, _vueData) {
				var msgstateConfig = configManager.SYSTEMCOLUMNS.MSGSTATE.data;
				var rowClassStr = workItemStateManage.trtd[data[msgstateConfig.field]] ? workItemStateManage.trtd[data[msgstateConfig.field]] : '';
				return rowClassStr;
			},
			//treeGrid 添加class sjj
			addClassByRowData:function(data,_vueData){
				var rowClassStr = '';
				if(_vueData.ui.displayMode == 'treeGrid'){
					if(data.isParent){
						if(data.netstarExpand){
							rowClassStr = 'tr-open-mark';
						}else{
							rowClassStr = 'tr-close-mark';
						}
					}
				}
				return rowClassStr;
			},
			//列状态添加class
			columnStateClassHandler: function (data, column, _vueData) {
				var columnClassStr = '';
				switch (column.columnType) {
					case 'columnstate':
						columnClassStr =  workItemStateManage.trtd[data[column.field]] ? workItemStateManage.trtd[data[column.field]] : '';
						break;
				}
				return columnClassStr;
			},
			//是否需要添加半选状态
			setUserAllSelectCheckState: function (_vueData, displayMode) {
				//当前选中的行 和 当前显示的行数据进行比较 长度相同则是全选 否则是半选
				var $headerTable = _vueData.domParams.headerTable.$dom;
				var rows = _vueData.$data.rows;//当前显示的行数据
				var id = _vueData.$options.id;//容器id
				var checkedSelectData = NetstarBlockListM.getCheckedData(id, displayMode);//获取当前选中行
				var $label = $headerTable.find('.checkbox-inline');
				switch (_vueData.ui.displayMode) {
					case 'block':
						$label = $('#' + _vueData.domParams.footerCheckbox.id);
						break;
				}
				if (checkedSelectData.length == 0) {
					//无选中状态移除选中
					$label.removeClass('checked half-checked');
				} else if (checkedSelectData.length < rows.length) {
					//长度不相等即当前行数据并非全部选中而是半选中
					$label.addClass('half-checked');
					$label.removeClass('checked');
				} else {
					$label.addClass('checked');
					$label.removeClass('half-checked');
				}
			},
			netStarColumnText:function(data,rowIndex,_vueData){
				var expression = _vueData.ui.listExpression;
				// [{"shopName":"店铺名称"},{"tel":"0311-88990022"}] => '<h3 class="title">{{shopName}}</h3><span>{{tel}}</span>' => '<h3 class="title">店铺名称</h3><span>0311-88990022</span>'
				//var expression = '<h3>{{itemName}}</h3><span>{{itemCateName}}</span><span>{{py}}</span>';
				var value = '';
				var column = _vueData.columnById;
				var originalRow = _vueData.originalRows[rowIndex];
				if(expression){
					var listHtml = NetStarUtils.getResultHtmlByExpressionHtml(expression,originalRow,_vueData.columnById);
					var id = 'tr-component-'+rowIndex;
					var outerHtmlDom = $(listHtml)[0];
					outerHtmlDom.id = id;
					value = outerHtmlDom.outerHTML;
				}else{
					value = '<span>'+data[column.field]+'</span>';
				}
				return value;
			},
			moreBtnsHandler:function(ev,_vueData){
				var id = _vueData.$options.id;
				var configs = NetstarBlockListM.configs[id];
				var	rowIndex = $(ev.target).closest('div[ns-rowindex]').attr('ns-rowindex');
				rowIndex = parseInt(rowIndex);
				//var rows = _vueData.$data.rows;
				//var rowData = rows[rowIndex];
				var rowData = _vueData.originalRows[rowIndex];
				if(typeof(_vueData.ui.moreBtnHandler)=='function'){
					_vueData.ui.moreBtnHandler(rowData,configs);
				}
			},
			touchstartHandler:function(ev,_vueData){
				//console.log('touch');
				if(ev.targetTouches.length === 1){
					_vueData.pageX = ev.targetTouches[0].pageX;
					_vueData.startTimer = moment().format('x');//记录一下当前时间
				}
			},
			touchmoveHandler:function(ev,_vueData){
				//console.log('move');
			},
			touchendHandler:function(ev,_vueData){
				//console.log('end');
				var currentTimer = moment().format('x');//记录下当前时间
				var touchstartTimer = _vueData.startTimer;
				var diff = currentTimer - touchstartTimer;
				var pageX = _vueData.pageX;
				var changedTouches = ev.changedTouches;
				if(diff > 1000 && changedTouches.length == 1 && changedTouches[0].pageX == pageX){
					//超过1秒
					//console.log('ok');
					ev.preventDefault();
					var $tr = $(ev.target).closest('div[ns-rowindex]');
					var html = '<div class="touch-end-event"><div class="btn-group">'
									+'<button class="btn btn-white" ns-type="touch-mobile"><span>删除</span></button>'
								+'</div></div>';
					if($tr.children('.touch-end-event').length > 0){
						$tr.children('.touch-end-event').remove();
					}
					$tr.append(html);
					$tr.find('button[ns-type="touch-mobile"]').on('click',function(event){
						ev.preventDefault();
						ev.stopPropagation();
						var	rowIndex = $(event.target).closest('div[ns-rowindex]').attr('ns-rowindex');
						rowIndex = parseInt(rowIndex);
						var rows = _vueData.$data.rows;
						var rowData = rows[rowIndex];
						var id = _vueData.$options.id;
						NetstarBlockListM.dataManager.delRow(rowData,id,rowIndex);
					});
					function outClickHandler(ev){
						if(ev.target.tagName == 'SPAN'){

						}else if(ev.target.tagName == 'BUTTON'){

						}else{
							$('.touch-end-event').remove();
							$('body').off('mousedown',outClickHandler);
						}
					}
					$('body').on('mousedown',outClickHandler);
				}
			},
		},
        footer:{
            //切换 选择页面长度下拉框 是否显示
		},
		//sjj 20190410 行内超链接跳转
		rowHrefLinkJump:function(ev,_vueData){
			var $this = $(ev.currentTarget);
			var field = $this.attr('ns-field');
			var columnConfig = _vueData.columnById[field];
			var formatHandler = columnConfig.formatHandler;
			var url = formatHandler.data.url;
			var gridId = _vueData.$options.id;//容器id
			var $tr = $this.closest('tr');
			var originalRows = _vueData._data.originalRows;
			var rowIndex = Number($tr.attr('ns-rowindex'));
			var configs = NetstarBlockListM.configs[gridId];
			var gridConfig = configs.gridConfig;
			var rowData = $.extend(true,{},originalRows[rowIndex]);
			if(gridConfig.data.isServerMode == false){
				rowData = $.extend(true,{},originalRows[rowIndex + _vueData.page.start]);
			}
			//目前限制添加读取是根据模板id跳转的，所以需要判断是否存在模板id 
			if(gridId.indexOf('layout')>-1){
				var packageName = gridId.substring(18,gridId.lastIndexOf('-list'));
				packageName = packageName.replace(/\-/g, '.');
				if(!$.isEmptyObject(NetstarTemplate.templates.configs[packageName].pageParam)){
					nsVals.extendJSON(rowData,NetstarTemplate.templates.configs[packageName].pageParam);
				}
				var tempValueName = packageName + new Date().getTime();
				if(typeof(NetstarTempValues)=='undefined'){NetstarTempValues = {};}
				if(formatHandler.data.parameterFormat){
					var parameterFormat = JSON.parse(formatHandler.data.parameterFormat);
					var chargeData = nsVals.getVariableJSON(parameterFormat,rowData);
					nsVals.extendJSON(rowData,chargeData);
				}
				var readonly = typeof(formatHandler.data.readonly)=='boolean' ? formatHandler.data.readonly : false;
				rowData.readonly = readonly;
				NetstarTempValues[tempValueName] = rowData;
				//businessDataBaseEditor  templateName
				url = url+'?templateparam='+encodeURIComponent(tempValueName);
				switch(formatHandler.data.templateName){
					case 'businessDataBaseEditor':
						var ajaxConfig = {
							url:url,
							type:'GET',
							dataType:'html',
							context:{
								config:{value:rowData}
							},
							success:function(data){
								var _config = this.config;
								var _configStr = JSON.stringify(_config);
								var funcStr = 'nsProject.showPageData(pageConfig,'+_configStr+')';
								var starStr = '<container>';
								var endStr = '</container>';
								var containerPage = data.substring(data.indexOf(starStr)+starStr.length, data.indexOf(endStr));
								var exp = /NetstarTemplate\.init\((.*?)\)/;
								var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
								containerPage = containerPage.replace(containerPage.match(exp)[0],funcStrRep);
								var $container = nsPublic.getAppendContainer();
								$container.append(containerPage);
							}
						};
						$.ajax(ajaxConfig);
						break;
					default:
						NetstarUI.labelpageVm.loadPage(url,formatHandler.data.title);
						break;
				}
			}
		},
		//sjj 20190624 树节点单击展开节点事件
		rowTreeNodeOpen:function(ev,_vueData){
			ev.preventDefault();
			ev.stopPropagation();
			var $this = $(ev.currentTarget);
			var parentId = $this.closest('tr').attr('ns-id');
			var nslevel = Number($this.closest('tr').attr('nslevel'));
			var rows = _vueData.rows;

			function setAttrByRowData(pid,isOpen){
				for(var rowI=0; rowI<rows.length; rowI++){
					if(rows[rowI][_vueData.ui.parentField] == pid){
						rows[rowI].netstarOpen = isOpen;//子节点是否显示
						setAttrByRowData(rows[rowI][_vueData.idField],rows[rowI].netstarOpen);
					}
				}
			}

			for(var rowI=0; rowI<rows.length; rowI++){
				if(rows[rowI][_vueData.ui.parentField] == parentId){
					rows[rowI].netstarOpen = !rows[rowI].netstarOpen;//子节点是否显示
					setAttrByRowData(rows[rowI][_vueData.idField],rows[rowI].netstarOpen);
				}
				if(rows[rowI][_vueData.idField] == parentId){
					rows[rowI].netstarExpand = !rows[rowI].netstarExpand;//当前节点是展开还是关闭状态
				}
			}
			/*$this.closest('tr').toggleClass('tr-open-mark');
			if($this.closest('tr').hasClass('tr-open-mark')){
				$this.closest('tr').removeClass('tr-close-mark');
			}else{
				if(!$this.closest('tr').hasClass('tr-close-mark')){
					$this.closest('tr').addClass('tr-close-mark');
				}
			}*/
			//$this.closest().siblings('tr[primaryid="'+parentId+'"]').toggleClass('open');
		},
		saveValue:function(editValue, editRowIndex, editColumn, gridConfig, vueConfig){
			/**
			 * editValue:string 	编辑后的值
			 * editRowIndex:number 	当前第几行
			 * editColumn:object 	当前列配置
			 * $td 当前编辑的td jQuery对象
			 **/

			//编辑前的值
			var currentValue = undefined;
			if (vueConfig.data.originalRows[editRowIndex]) {
				currentValue = vueConfig.data.originalRows[editRowIndex][editColumn.field];
			}
			switch (editColumn.variableType) {
				case 'number':
					var rex = /^[1-9]\d*|0$/; // 验证整数;
					if (rex.test(editValue) && editValue.length < 16) {
						editValue = Number(editValue);
					}
					break;
				case 'date':
					//还没想好怎么处理
					break;
				case 'boolean':
					editValue = String(editValue);
					break;
				case 'string':
					break;
				default:
					//没有该属性是无法识别的则暂不处理
					break;
			}

			var isModified = false; //是否修改
			if (currentValue !== editValue || currentValue == undefined || currentValue == null) {
				isModified = true;
				var rows = $.extend(true, [], vueConfig.data.originalRows);
				if (typeof (rows[editRowIndex]) == "undefined") {
					rows[editRowIndex] = {};
				}
				rows[editRowIndex][editColumn.field] = editValue;
				//需要做格式化处理
				vueConfig.data.rows = dataManager.getRows(rows, gridConfig);
			}

			var originalRows = vueConfig.data.originalRows;
			//如果原始数据有该行，则读取原始数据，否则则是'';
			if (typeof (originalRows[editRowIndex]) == 'object') {
				originalRows[editRowIndex][editColumn.field] = editValue;
			} else {
				var newOriginalData = {};
				for (var i = 0; i < gridConfig.columns.length; i++) {
					var columnConfig = gridConfig.columns[i];
					if (editColumn.field == columnConfig.field) {
						newOriginalData[columnConfig.field] = editValue;
					} else {
						newOriginalData[columnConfig.field] = null;
					}
				}
				originalRows[editRowIndex] = newOriginalData;
			}
		},
		componentChangeHandler:function(data,_vueData){
			var editRowIndex = data.dom.closest('div[ns-rowindex]').attr('ns-rowindex');
			var originalRows = _vueData.originalRows;
			var rowData = originalRows[editRowIndex];
			var editColumn = _vueData.columnById[data.id];
			var editValue = data.value;
			var isContinue = true;
			if(editColumn.editConfig.rules){
				var editJson = {
					id:editColumn.editConfig.id,
					type:editColumn.editConfig.type,
					value:editValue,
					rules:editColumn.editConfig.rules
				};
				var editValidJson = nsComponent.validatValue(editJson);
				isContinue = editValidJson.isTrue;
			}
			if(isContinue == false){
				rowData[data.id] = editValue;
				return;
			}
			var gridConfig = NetstarBlockListM.configs[_vueData.$options.id].gridConfig;
			var vueConfig = NetstarBlockListM.configs[_vueData.$options.id].vueConfig;
			methodsManager.saveValue(editValue,editRowIndex,editColumn,gridConfig,vueConfig);

			
			if(!$.isEmptyObject(_vueData.columnEditConfig)){
				var fieldRex = /\{\{(.*?)\}\}/;
				for(var cid in _vueData.columnEditConfig){
					var expression = _vueData.columnEditConfig[cid];
					var splitExpression;
					if(expression.indexOf('<')>-1){
						splitExpression = expression.split('<');
						var value1 = rowData[splitExpression[0].match(fieldRex)[1]];
						var value2 = rowData[splitExpression[1].match(fieldRex)[1]];
						var formatValue  = -1;
						if(value1 <value2){
							formatValue = 1;
						}else{
							formatValue = 0;
						}
						if(formatValue != -1){
							rowData[cid] = formatValue;
							NetstarBlockListM.refreshDataById(_vueData.$options.id,originalRows);
						}
					}
				}
			}
		}
	}
	var configManager = {
		configs:{}, //运行时的config
		rawConfigs:{}, //原始的config
		DEFAULT:{
			THMINWIDTH: 20, //thead th的默认最小宽度
			THWIDTH: 80, 	//thead th的默认宽度
			THPADDING: 5, 	//thead th的padding（主要指左右），用于自动宽度计算
			THFONTSIZE: 12, //thead th的字体大小（主要指左右），用于自动宽度计算
			SCROLLWIDTH:8,  //主表滚动条的宽度
			HEADERHEIGHT:34,//头部高度
			FOOTERHEIGHT:47,//底部高度
			THEADHEIGHT:31,//标题高度
			FOOTERPADDING:10,//底部边距
			TOPBOTTOMPADDING:0,//上下边距
			PADDINGBOTTOM:8,//距离底部的边距
		},
		//这里都是系统列配置，不允许写其他的配置
		SYSTEMCOLUMNS: {
			//行内按钮
			ROWBUTTONS: {
				field: 'NETSTAR-BTNS',
				title: '功能',
				columnType: 'btns',
				isSystemColumn: true,
				isHtml: true,
				editable: false,
				width: 30,
				isResizeWidth: false,
			},
			//行删除按钮
			ROWDELETEBUTTON: {
				field: 'NETSTAR-DELETE',
				title: '删除',
				columnType: 'btns',
				isSystemColumn: true,
				isHtml: true,
				editable: false,
				width: 36,
				isResizeWidth: false,
			},
			//消息状态
			MSGSTATE: {
				isColumn:false,//非列即行 不在某个单元格显示即在整体行上显示
				data: {
					field: 'NETSTAR-MSGSTATE',
					width: 60,
					editable: false,
					isSystemColumn: true,
					columnType: 'columnstate',
					isResizeWidth: false,
					formatHandler: {
						type: 'columnstate',
						data: workItemStateManage.word,
					},
				}
			}
		},
		setDefault:function(_gridConfig){
			if (debugerMode) {
				if (typeof (_gridConfig.data) != 'object') {
					nsalert('grid的data参数必须存在', 'error');
					console.error('grid的data参数必须存在');
					console.error(_gridConfig);
				} else {
					//兼容老版本的tableID传入方法
					if (typeof (_gridConfig.data.tableID) == 'string') {
						_gridConfig.id = _gridConfig.data.tableID;
					}
				}
				if (typeof (_gridConfig.id) != 'string') {
					nsalert('grid没有指定容器id', 'error');
					console.error('grid没有指定容器id');
					console.error(_gridConfig);
				}
				if ($.isArray(_gridConfig.columns) == false) {
					nsalert('grid的columns参数必须存在', 'error');
					console.error('grid的columns参数必须存在');
					console.error(_gridConfig);
				}
			}
			var dataDefaultConfig = {
				type: 'POST',        //Ajax.type
				data: {},
				dataSrc: 'rows', //默认的dataSrc
				isServerMode: false,  //默认不打开服务器端模式
			};
			NetStarUtils.setDefaultValues(_gridConfig.data,dataDefaultConfig);
			//把column根据id重新整理
			var columnById = {};
			var isNeedRowData = false;
			for (var i = 0; i < _gridConfig.columns.length; i++) {
				var columnConfig = _gridConfig.columns[i];
				if (columnConfig.field) {
					columnById[columnConfig.field] = columnConfig;
				}
				if (typeof (columnConfig.editConfig) == "object" && columnConfig.editConfig.type == "business") {
					isNeedRowData = true;
				}
			}
			for (var i = 0; i < _gridConfig.columns.length; i++) {
				var columnConfig = _gridConfig.columns[i];
				columnConfig.isNeedRowData = isNeedRowData;
			}
			_gridConfig.columnById = columnById;
			var uiDefalutConfig = {
				isUseMessageState:false,//是否使用消息状态
			};
			_gridConfig.ui = NetStarUtils.getDefaultValues(_gridConfig.ui, uiDefalutConfig);
			if (_gridConfig.ui.isUseMessageState) {
				configManager.SYSTEMCOLUMNS.MSGSTATE.isColumn = true;
			}
		},
		getDataConfig: function (_gridConfig) {
			var dataConfig = _gridConfig.data;
			//定义了primaryID 而没有定义idField 则统一
			if (
				typeof (dataConfig.primaryID) == 'string' &&
				typeof (dataConfig.idField) != 'string'
			) {
				dataConfig.idField = dataConfig.primaryID;
				delete dataConfig.primaryID;
			}
			dataConfig.data = typeof (dataConfig.data) == 'object' ? dataConfig.data : {};

			if (typeof (dataConfig.idField) != 'string') {
				console.error('数据中没有指定idField');
				console.error(_gridConfig);
			}
			if (dataConfig.isServerMode) {
				//sjj 开启了服务端翻页
				nsVals.extendJSON(dataConfig.data, { start: 0, length: _gridConfig.ui.pageLengthDefault });
			}
			return dataConfig;
		},
		//获取ColumnType 列类型
		getColumnType: function (columnConfig) {
			//columnType: 转换formatHandler.type 到columnType转换
			var columnType = 'text';
			if (typeof (columnConfig.columnType) != 'string') {
				if (columnConfig.formatHandler) {
					// 如果没有定义columnType 但是配置了formatHandler，则使用formatHandler.type
					columnConfig.columnType = columnConfig.formatHandler.type;
					columnType = columnConfig.columnType;
					if (debugerMode) {
						if (typeof (columnConfig.columnType) != 'string') {
							console.warn('存在不能识别的列配置：' + columnConfig.columnType);
							console.warn(columnConfig);
						}
					}
				} else {
					// 如果没有配置formatHandler，判断是否配置editConfig并且配置类型是select isDefaultSubdataText默认字符串替换
					// 新配置参数在select/radio/checkbox配置时有效 默认true 若不走默认重新配置思维导图字段配置
					var isDefaultSubdataText = typeof (columnConfig.isDefaultSubdataText) == "boolean" ? columnConfig.isDefaultSubdataText : true;
					if (isDefaultSubdataText && typeof (columnConfig.editConfig) == "object") {
						var editConfigType = columnConfig.editConfig.type;
						switch (editConfigType) {
							case 'radio':
							case 'select':
							case 'checkbox':
								columnType = 'subdataText';
								break;
							default:
								break;
						}
					}
				}
			} else {
				columnType = columnConfig.columnType;
			}
			return columnType;
		},
		getColumnWidth:function(columnConfig){
			//计算单元格宽度
			var width = this.DEFAULT.THWIDTH;
			//默认宽度和最小宽度 支持使用数字\百分比\自动\列名称自动（根据列名称计算宽度）三种方式设定 如 22 \ 20%  \ auto \ titleauto
			if (typeof (columnConfig.width) == 'number') {
				//数字
				width = columnConfig.width
			} else if (typeof (columnConfig.width) == 'string') {
				//如果是按照列名称自动计算宽度
				if (columnConfig.width == 'autoTitle') {
					if (typeof (columnConfig.title) == 'string') {
						var autoTitleWidth = columnConfig.title.length * (this.DEFAULT.THFONTSIZE + 4); //根据文字长度计算，每个字按12个像素加上前后一个像素的间隔计算
						width = autoTitleWidth;
					}
				} else if (columnConfig.width == 'auto') {
					//自动计算列宽的
					width = 0;
				} else {
					//百分比方式：读取%设置下的数字
					var widthStr = columnConfig.width;
					var percentMatch = widthStr.match(/%/);
					if (percentMatch) {
						var percentNumber = widthStr.substring(0, widthStr.index);
						percentNumber = parseFloat(percentNumber) / 100;
						width = percentNumber * containerWidth //根据容器百分比计算
					} else {
						if (debugerMode) {
							console.error('暂时不能识别您所设定的宽度：' + columnConfig.width);
							console.error(columnConfig);
						}
					}
				}
			}
			if (typeof (width) != 'number') {
				console.error('column配置中有不能识别的宽度定义')
				console.error(columnConfig);
			}
			return width;
		},
		/**
		 * 处理column中的自动宽度
		 * @param {number} containerWidth 表格容器的宽度 
		 * @param {number} tableTotalWidth 表格现有的宽度 需要自动计算的column目前宽度为0
		 * @param {array} autoColumns 需要自动计算的column集合
		 */
		setAutoWidthColumn: function (containerWidth, tableTotalWidth, autoColumns) {
			//没有需要自动分配的表格宽度，就不用计算了
			if (autoColumns.length == 0) {
				return false;
			}
			var autoWidth = 0;
			if (containerWidth > tableTotalWidth) {
				//平均分配
				autoWidth = (containerWidth - tableTotalWidth) / autoColumns.length;
			} else {
				//表格宽度已经超出容器宽度 就使用默认
				autoWidth = this.DEFAULT.THWIDTH;
			}

			for (var autoColumnI = 0; autoColumnI < autoColumns.length; autoColumnI++) {
				tableTotalWidth += autoWidth;
				autoColumns[autoColumnI].width = autoWidth;
				autoColumns[autoColumnI].styleObj.width = autoWidth + 'px';
			}
			//console.log('autoWidth:'+ autoWidth);
			return tableTotalWidth;
		},
		getColumnsConfig:function(_gridConfig){
			/**
			 * 设置columnType属性、宽度属性
			 */
			var _columnsConfig = _gridConfig.columns;
			//columns参数必须存在
			if ($.isArray(_columnsConfig) == false) {
				if (debugerMode) {
					console.error('表格Grid配置参数错误，columns应当是数组');
					console.error(_gridConfig);
				}
				return [];
			}
			var tableTotalWidth = 0; //表格的宽度
			var containerWidth = _gridConfig.$container.innerWidth();
			//sjj 20190319 如果容器高度为0即容器宽度不可见 目前遇到的是在弹出tab页情况所以需要做处理
			if (containerWidth == 0) {
				containerWidth = _gridConfig.$container.parent().innerWidth();
			}
			/**********sjj 20190319 如果容器高度为0 目前遇到的是在弹出tab页情况所以需要做处理  end************************************/
			var autoColumns = [];
			var footerColumns = [];

			var isEditMode = _gridConfig.ui.isEditMode;//sjj 20190403 是否可编辑
			//逐个获取column配置
			for (var columnI = 0; columnI < _columnsConfig.length; columnI++) {
				var columnConfig = _columnsConfig[columnI];
				if (columnConfig.footer) {
					footerColumns.push(columnConfig);
				}
				//样式表对象
				var styleObj = {};
				columnConfig.styleObj = styleObj;
				//如果isEditMode为false 则当前列都不可进行编辑 sjj 20190403
				if(!isEditMode){
					columnConfig.editable = isEditMode;
				}
				//获取columnType 新编辑器直接产生此参数，老配置方法需要转换
				columnConfig.columnType = this.getColumnType(columnConfig);
				columnConfig.isResizeWidth = typeof (columnConfig.isResizeWidth) == 'boolean' ? columnConfig.isResizeWidth : true;//sjj 20190319 默认支持拖拽
			
				//如果是自动计算宽度的column则加入到autoColumn中等待后续处理
				if (columnConfig.width == 'auto') {
					autoColumns.push(columnConfig);
				}

				//计算单元格宽度
				var columnWidth = this.getColumnWidth(columnConfig);
				if (columnConfig.hidden == true) {
					// 如果是隐藏的
				} else {
					tableTotalWidth += columnWidth; 		//加入到总宽度 自动计算的加入的是0 到后面重新计算添加
				}
				columnConfig.width = columnWidth;
				columnConfig.originalWidth = columnWidth; //sjj 20190318 存储原始列宽
				styleObj['width'] = (columnWidth - 1) + 'px';
				styleObj['max-width'] = (columnWidth - 1) + 'px';
				styleObj['overflow'] = 'hidden';

				//最小宽度
				if (typeof (columnConfig.minwidth) != 'number') {
					columnConfig.minwidth = this.DEFAULT.THMINWIDTH;
					styleObj['min-width'] = this.DEFAULT.THMINWIDTH + 'px';
				}
				//sjj 20190624 是否是树节点字段
				columnConfig.isTreeNode = typeof(columnConfig.isTreeNode)=='boolean' ? columnConfig.isTreeNode : false;
			}
			//添加功能性质的列对象
			//是否有按钮
			if (_gridConfig.ui.tableRowBtns) {
				var btns = _gridConfig.ui.tableRowBtns;
				if ($.isArray(btns)) {
					if (btns.length > 0) {
						//是数组，且长度大于0，才需要输出按钮
						var btnsColumn = $.extend(true, {}, this.SYSTEMCOLUMNS.ROWBUTTONS);
						//计算按钮应当的宽度 每个汉字按照15像素，每个按钮有28的padding，从第二个起有5px的margin-left
						var btnColumnWidth = 0;
						for (var btnI = 0; btnI < btns.length; btnI++) {
							btnColumnWidth += btns[btnI].text.length * 15;
							btnColumnWidth += 28;
							if (btnI > 0) {
								btnColumnWidth += 5;
							}
						}

						btnsColumn.styleObj = { 'min-width': btnColumnWidth + 'px', 'width': btnColumnWidth + 'px' };
						_columnsConfig.unshift(btnsColumn);
						tableTotalWidth += btnColumnWidth;
					} else {
						delete _gridConfig.ui.tableRowBtns
					}
				} else {
					delete _gridConfig.ui.tableRowBtns;
				}
			}

			//是否有选中列
			if (_gridConfig.ui.isCheckSelect) {
				//自动序列号
				var checkSelectColumn = $.extend(true, {}, this.SYSTEMCOLUMNS.CHECKSELECT);
				checkSelectColumn.styleObj = { 'min-width': checkSelectColumn.width + 'px', 'width': checkSelectColumn.width + 'px' };
				_columnsConfig.unshift(checkSelectColumn);
				tableTotalWidth += checkSelectColumn.width;
			}

			if(_gridConfig.ui.isInlineBtn){
				_columnsConfig.push({
					field: 'NETSTAR-INLINEBTN',
					title: '更多',
					columnType: 'btns',
					isSystemColumn: true,
					isHtml: true,
					editable: false,
					width: 36,
					isResizeWidth: false,
					styleObj:{
						'min-width':'36px',
						'width':'36px'
					}
				});
				tableTotalWidth += 36;
			}
			//是否有列状态 sjj20190118 
			if (_gridConfig.ui.isUseMessageState) {
				var messageColumn = $.extend(true, {}, this.SYSTEMCOLUMNS.MSGSTATE.data);
				messageColumn.styleObj = { 'min-width': messageColumn.width + 'px', 'width': messageColumn.width + 'px' };
				_columnsConfig.unshift(messageColumn);
				tableTotalWidth += messageColumn.width;
			}
			//自动序号列
			if (_gridConfig.ui.isAutoSerial) {
				//自动序列号
				var autoSerialColumn = $.extend(true, {}, this.SYSTEMCOLUMNS.AUTOSERIAL);
				autoSerialColumn.styleObj = { 'min-width': autoSerialColumn.width + 'px', 'width': autoSerialColumn.width + 'px' };
				_columnsConfig.unshift(autoSerialColumn);
				tableTotalWidth += autoSerialColumn.width;
				//如果有合计则这里显示合计文字
			}
			//编辑模式
			if (_gridConfig.ui.isHaveEditDeleteBtn) {
				var deleteColumn = $.extend(true, {}, this.SYSTEMCOLUMNS.ROWDELETEBUTTON);
				deleteColumn.styleObj = { 'min-width': deleteColumn.width + 'px', 'width': deleteColumn.width + 'px' };
				_columnsConfig.push(deleteColumn);
				tableTotalWidth += deleteColumn.width;
			}
			//计算自动宽度的列宽，如果表格总宽度小于容器，则剩余宽度平均分配给自动宽度的列宽
			var newTableWidth = this.setAutoWidthColumn(containerWidth, tableTotalWidth, autoColumns);
			//如果没有自动计算的列，则返回值是false
			if (newTableWidth) {
				//修改自动计算的列会引起总列宽也就是表格宽度的变化
				tableTotalWidth = newTableWidth;
			}
			//保存table的输出宽度
			_gridConfig.ui.tableWidth = tableTotalWidth;
			_gridConfig.ui.containerWidth = containerWidth;
			//保存footer输出
			_gridConfig.ui.footerColumns = footerColumns;

			var __columnsConfig = [];
			for (var i = 0; i < _columnsConfig.length; i++) {
				var isHidden = typeof (_columnsConfig[i].hidden) == "boolean" ? _columnsConfig[i].hidden : false;
				if (!isHidden) {
					__columnsConfig.push(_columnsConfig[i]);
				}
			}
			return __columnsConfig;
		},
		getUIConfig:function(_gridConfig){
			var uiConfig = _gridConfig.ui;
			var commonTableHeight = 
				//configManager.DEFAULT.HEADERHEIGHT + 
				configManager.DEFAULT.THEADHEIGHT + 
				configManager.DEFAULT.TOPBOTTOMPADDING;
				//configManager.DEFAULT.FOOTERHEIGHT;
			if(!$.isEmptyObject(uiConfig.query)){
				commonTableHeight += configManager.DEFAULT.HEADERHEIGHT;
			}
			if(uiConfig.isPage){
				commonTableHeight += configManager.DEFAULT.FOOTERHEIGHT;
			}
			if(typeof(uiConfig.isThead)=='boolean'){
				if(uiConfig.isThead == false){
					commonTableHeight -= configManager.DEFAULT.THEADHEIGHT;
				}
			}
			var containerTableHeight = _gridConfig.ui.height - commonTableHeight ;

			//表格容器和scrollY的高
			//_gridConfig.domParams.contentTableContainer.style.height = containerTableHeight + 'px';
			//_gridConfig.domParams.scrollY.style.height = containerTableHeight + 28 + 'px';
			//给三个表格的style添加 width
			_gridConfig.domParams.headerTable.style.width = _gridConfig.ui.tableWidth + 'px';
			if(uiConfig.displayMode != 'block'){
				_gridConfig.domParams.contentTable.style.width = _gridConfig.ui.tableWidth + 'px';
			}
			//_gridConfig.domParams.footerTable.style.width = _gridConfig.ui.tableWidth + 'px';
			//_gridConfig.domParams.scrollX.style.width = _gridConfig.ui.tableWidth + 'px';
			
			//判断是否需要横向滚动条
			var isUse = _gridConfig.ui.tableWidth > _gridConfig.ui.containerWidth;
			_gridConfig.domParams.scrollX.isUse = isUse;
			if(isUse == false){
				_gridConfig.domParams.scrollX.containerStyle = {
					visibility:"hidden",
				}
			}else{
				_gridConfig.domParams.scrollX.containerStyle = {
					visibility:"hidden",
				}
				//如果横向滚动条可见，则需要容器增加padding
				if(_gridConfig.ui.footerColumns){
					//sjj 20190408如果有合计列则距离底部应该是行高的距离
					configManager.DEFAULT.PADDINGBOTTOM = 28; 
				}
				if(_gridConfig.ui.displayMode == 'block'){

				}else{
					_gridConfig.domParams.contentTableContainer.style['padding-bottom'] = configManager.DEFAULT.PADDINGBOTTOM+'px';
				}
			}
			//选中方式 默认不能选中
			var selectMode = _gridConfig.ui.selectMode; //multi 多选 single 单选 none 不选
			if (typeof (selectMode) == 'string') {
				//不需要额外处理
				switch (selectMode) {
					case 'multi':
					case 'single':
					case 'checkbox':
					case 'none':
						break;
					default:
						if (debugerMode) {
							console.error('ui.selectMode 合法的设置值为 multi/single/none');
							console.error(_gridConfig);
						}
						selectMode = 'none';
						break;
				}
			} else {
				//如果不是文本，有两种可能，一种是应当设为none，一种是老的设置方式 isSingleSelect/isMulitSelect
				if (_gridConfig.ui.isMulitSelect) {
					_gridConfig.ui.selectMode = 'multi';
				} else if (_gridConfig.ui.isSingleSelect) {
					_gridConfig.ui.selectMode = 'single';
				} else {
					_gridConfig.ui.selectMode = 'none';
				}
			}

			return uiConfig;
		},
		getConfig:function(_gridConfig){
			var gridConfig = $.extend(true, {}, _gridConfig);
			var girdId = _gridConfig.id;
			//老的表单配置参数位置在data.tableID上
			if (typeof (girdId) != 'string') {
				girdId = _gridConfig.data.tableID;
			}
			_gridConfig.id = girdId;
			//两个都找不到就要报错并提示了
			if (typeof (girdId) != 'string') {
				if (debugerMode) {
					console.error('Grid组件配置参数中没有配置id')
				}
			}

			//保存id和container供重复调用
			gridConfig.id = girdId;
			gridConfig.el = '#' + girdId;
			gridConfig.$container = $(gridConfig.el);

			if (gridConfig.$container.length != 1) {
				//找不到容器
				console.error('Grid组件中的id所执行的DOM节点不存在');
				console.error(_gridConfig);
				return;
			} else {
				//添加自定义标签和class
				gridConfig.$container.attr({ "nsgirdpanel": "grid-el" });
				gridConfig.$container.addClass('nsgrid nsgrid-block');
			}
			//保存grid整体参数
			gridConfig.domParams = {
				container: {
					id: girdId,
					style: {}
				},
				//中间内容表格的整体容器
				contentTableContainer: {
					id: girdId + '-contenttable-container',
					style: {},
				},
				contentTable: {
					id: girdId + '-contenttable',
					style: {},
				},
				//空面板
				panelOfEmptyRows: {
					isShow: false,
					class: '',
					info: '',
				},
				scrollX: {
					id: girdId + '-scroll-x',
					style: {},
				},
				scrollY: {
					id: girdId + '-scroll-y',
					style: {},
				},
				//header表格的整体容器
				headerTableContainer: {
					id: girdId + '-headertable-container',
					style: {},
				},
				headerTable: {
					id: girdId + '-headertable',
					style: {},
				},
				//footer表格的整体容器
				footerTableContainer: {
					id: girdId + '-footertable-container',
					style: {},
				},
				addBtnContainer:{
					id:girdId + '-addbtn-container',
					style:{}
				},
				footerTable: {
					id: girdId + '-footertable',
					style: {width:'100%'},
				},
				//footer部分
				footer: {
					id: girdId + '-footer',
					style: {},
				},
				//footer按钮容器
				footerButtons: {
					id: girdId + '-footerbuttons',
					style: {},
				},
				footerCheckbox: {
					id: girdId + '-footercheckbox',
					style: {},
				},
				//服务端返回值
				serverData: {},
			}
			this.configs[girdId] = gridConfig;
			this.rawConfigs[girdId] = _gridConfig;
			gridConfig.columns = this.getColumnsConfig(gridConfig);
			gridConfig.ui = this.getUIConfig(gridConfig);
			gridConfig.data = this.getDataConfig(gridConfig);
			return gridConfig;
		}
	};
	var htmlManager = {
		getTemplateHtml:function(containerHtml, templateObj, _isUpperCase) {
			//在容器html中查找{{ ... }}标签， 并用模板对象中的对应key -> value进行替换  默认情况下标签和key都应当是大写，以便区分
			var patt = new RegExp("\{\{(.*?)\}\}", "g");
			var result;
			var html = containerHtml;
			//默认key和标签都应当使用大写
			var isUpperCase = typeof (_isUpperCase) == 'boolean' ? _isUpperCase : true;
			while ((result = patt.exec(html)) != null) {
				//是否要转换为大写 应当尽可能使用大写形式，便于日后代码阅读
				var subTemplateName = $.trim(result[1]);
				if (isUpperCase) {
					var subTemplateName = subTemplateName.toUpperCase();
				}
				//组件可能存在于container容器中，也可能只是一个VUE变量
				if (templateObj[subTemplateName]) {
					//如果是container标签，则进行替换
					html = html.replace(result[0], templateObj[subTemplateName]);
				}
			}
			return html;
		},
		//需要先设置容器的高度，以防止页面闪烁
		setContainer:function(_gridConfig){
			// 如果容器设置了高度 那么用设置的高度替换掉已有的高度 ，否则设置高度为已有的高度
			var $container = $('#'+_gridConfig.id); // 容器
			var containerHeight = $container.height(); // 容器高度
			var isHadSetHeight = true; // 是否设置了高度 并且需要设置高度 _gridConfig.ui.height存在则设置，不存在则不设置
			if(_gridConfig.ui){
				if(_gridConfig.ui.height){
					if(containerHeight == 0){
						isHadSetHeight = false;
						containerHeight = _gridConfig.ui.height;
					}else{
						if(_gridConfig.ui.isPreferContainerHeight == true){
							//是否优先使用容器高度
							_gridConfig.ui.height = containerHeight;
						}else{
							isHadSetHeight = false;
						}
					}
				}
			}
			// 如果没有设置高度
			if (!isHadSetHeight) {
				//设置高
				var styleObj = {};
				styleObj.height = containerHeight;
				//$container.css(styleObj);
			}
			//处理容器CSS样式问题
		},
		getHtml:function(_gridConfig, _vueConfig){
			var html = '';
			//头部
			//var headerHtml = this.getHeaderHtml(_gridConfig, _vueConfig);
			//html += headerHtml;
			//主体body 包含三个表格
			var bodyHtml = this.getBodyHtml(_gridConfig, _vueConfig);
            html += bodyHtml;
            //footer 主要是按钮区域和页码
            var footerHtml = this.getFooterHtml(_gridConfig, _vueConfig);
            html += footerHtml;
            
			return html;
		},
		getHeaderHtml:function(_gridConfig, _vueConfig){
			var html = '';
			var headerContainer = vueTemplate.HEADER.CONTAINER;
			html = this.getTemplateHtml(headerContainer, vueTemplate.HEADER);
			return html;
		},
		getBodyHtml:function(_gridConfig, _vueConfig){
			var html = '';
            var bodyContainer = vueTemplate.BODY.CONTAINER;
			//处理是否有footer table 默认有footer 否则就删除掉容器
			if(_gridConfig.ui.footerColumns){
				if(_gridConfig.ui.footerColumns.length == 0){
					bodyContainer = bodyContainer.replace(/\{\{FOOTERTABLE\}\}/, '');
				}else{
					//有footer需要显示的列
					var footerTdsHtml = this.getFooterTableHtml(_gridConfig, _vueConfig);
					bodyContainer = bodyContainer.replace(/\{\{FOOTERTABLE\}\}/, footerTdsHtml);
				}
			}else{
				bodyContainer = bodyContainer.replace(/\{\{FOOTERTABLE\}\}/, '');
			}
			html = this.getTemplateHtml(bodyContainer, vueTemplate.BODY);
			return html;
        },
        //获取footerTable的代码 如果没有column
        getFooterTableHtml:function(_gridConfig, _vueConfig){
            //{{ns-footer-tds} 替换为td html
            var html = '';
            var footerColumns = {};
            for(var i = 0; i<_gridConfig.columns.length; i++){
                var columnConfig = _gridConfig.columns[i];
                var tdHtml = '';
                //需要按照字段处理的
                switch(columnConfig.columnType){
					case 'autoserial':
						//对应合计两个字
						tdHtml = i18n.footerValueSum;
						break;
					default:
						break;
				}
				footerColumns.gridId = _gridConfig.id;
				//需要根据footer处理的
				var footerTypeAttr = '';
				if (columnConfig.footer) {
					tdHtml = '{{footer' + columnConfig.field + '}}'
					footerColumns['footer' + columnConfig.field] = columnConfig;
					footerTypeAttr = ' ns-footertype="' + columnConfig.footer.type + '"'; // ns-footertype="sum" 或者 ns-footertype="average"
					html += '<td class="thead-th footer-' + columnConfig.columnType + '"' + footerTypeAttr + '>' + tdHtml + '</td>';
				}

			}

			var footerTemplate = vueTemplate.BODY.FOOTERTABLE;
			html = footerTemplate.replace(/\{\{ns-footer-tds\}\}/, html);

			//_vueConfig.computed.footer = {};
			$.each(footerColumns, function (key, config) {
				var fieldName = config.field;
				_vueConfig.computed[key] = function () {
					var returnNumber = 0;
					var formatExpression;
					for (var i = 0; i < this.originalRows.length; i++) {
						var rowData = this.originalRows[i];
						var value = rowData[fieldName];
						if(config.footer.type == 'expression'){
							returnNumber += NetStarUtils.getDataByExpression(rowData,config.footer.content);
						}else{
							if (typeof (value) == 'number') {
								returnNumber += value;
							}
						}
					}
					if(config.footer.type == 'expression'){
						if(config.formatHandler){
							if(config.formatHandler.data){
								formatExpression = config.formatHandler.data.format;
							}
						}
					}
					switch (config.footer.type) {
						case 'sum':
							//合计不需要其他处理
							break;
						case 'average':
							//需要平均
							returnNumber = returnNumber / this.originalRows.length;
							break;
					}
					//转化格式到显示格式
					if(formatExpression){
						returnNumber = NetStarUtils.valueConvertManager.getMoneyStringByNumber(returnNumber,formatExpression,true);
					}
					//returnNumber = dataManager.getValueByColumnType(returnNumber, rowData, config);
					return returnNumber;
				}
			});


			return html;
		},
		//获取footer代码 包括页面 按钮容器等
		getFooterHtml: function (_gridConfig, _vueConfig) {
			var html = '';
			var footerContainer = vueTemplate.FOOTER.CONTAINER;
			var isHavePage = _gridConfig.ui.isPage;  //是否有分页  没有分页就需要去掉{{TOTALINFO}}{{PAGELENGTHMENU}}{{PAGES}}
			if (isHavePage == false) {
				return ''; //返回完全不需要输出footer, 临时先写成这样，随着功能增加，需要增加判断
			}
			//var isHaveBtns = $.isArray(_gridConfig.ui.btns);
			html = this.getTemplateHtml(footerContainer, vueTemplate.FOOTER);
			return html;
		}
	};
	var dataManager = {
		getValueByColumnType: function (originalValue, rowData, columnConfig) {
			var returnValue;
			switch (columnConfig.columnType) {
				case 'date':
				case 'datetime':
					/**配置参数示例
					 * {
					 *      type:'date',
					 *      data:{
					 *          format:'YYYY-MM-DD/YYYY-MM-DD HH:mm:ss'
					 *      }
					 * }
					 */
					var formatStr;
					if (columnConfig.formatHandler) {
						if (columnConfig.formatHandler.data) {
							formatStr = columnConfig.formatHandler.data.formatDate;
						}
					}
					returnValue = NetStarUtils.valueConvertManager.getDateTimeStringByTimestamp(originalValue, { format: formatStr });
					break;
				case 'money':
					/**配置参数示例
					 * {
					 *      type:'money',
					 * 	    data:{
					 *          format:{
					 * 		        places:2		//小数位数 默认2位
					 * 		        symbol:'$'		//标识符 默认￥
					 * 		        thousand:','	//千分分隔符 默认','
					 * 		        decimal:	    //小数点 默认显示小数点 （字符串替换，可以把小数点替换成其它字符。例：2.56（decimal：d）-->2d56）
					 *          }
					 *      }
					 * }
					 */
					var options = {};
					if (columnConfig.formatHandler) {
						if (columnConfig.formatHandler.data) {
							if (typeof (columnConfig.formatHandler.data.format) == 'object') {
								options = columnConfig.formatHandler.data.format;
							}
						}
					}
					if(isNaN(originalValue)){
						returnValue = originalValue;
					}else{
						returnValue = NetStarUtils.valueConvertManager.getMoneyStringByNumber(originalValue, options);
					}
					break;
				case 'number':
					/**配置参数示例
					 * {
					 *      type:'money',
					 * 	    data:{
					 *          format:{
					 * 		        places:2		//小数位数 默认3位
					 * 		        thousand:','	//千分分隔符 默认','
					 *          }
					 *      }
					 * }
					 */
					var options = {};
					if (columnConfig.formatHandler) {
						if (columnConfig.formatHandler.data) {
							if (typeof (columnConfig.formatHandler.data.format) == 'object') {
								options = columnConfig.formatHandler.data.format;
							}
						}
					}
					if ($.isEmptyObject(options)) {
						//如果没有配置需要格式化，则直接显示即可
						if (typeof (originalValue) == 'number') {
							returnValue = originalValue;
						} else {
							//returnValue = 0;
						}
					} else {
						//配置了则格式化
						returnValue = NetStarUtils.valueConvertManager.getFormatNumberStringByNumber(originalValue, options);
					}
					break;
				case "business":
					/**配置参数示例
					 *{
					 * type: 'business',
					 * textField: 'itemName',
					 * idField:'id',
					 * inputWidth: 100,
					 * dialogTitle: '往来单位[供应商]选择框',
					 * infoBtnName: '查看单位基本信息',
					 * rules: 'required',
					 * source: {
					 * 		url: getRootPath() + '/htmlpage/goodslist.html',
					 * },
					 * search: {
					 * 		url: getRootPath() + '/public/static/assets/json/newcomponent/search.json',
					 * dataSrc: 'rows',
					 *}
					 * originalValue: array[{....}] json数组
					 * 		传入值
					 */
					returnValue = '';
					//如果value值是数组，则使用第一条的数据
					if (typeof (originalValue) == 'object' && !$.isEmptyObject(originalValue)) {
						if (columnConfig.editConfig) {
							if (columnConfig.editConfig.textField) {
								var textField = columnConfig.editConfig.textField;
								if ($.isArray(originalValue)) {
									if (originalValue.length >= 1) {
										returnValue = originalValue[0][textField];
									}
								} else {
									returnValue = originalValue[textField];
								}
							}
						}
					} else {
						if (typeof (originalValue) == 'string') {
							returnValue = originalValue; // 字符串直接赋值 lyw
						}
					}
					break;
				case 'dictionary':
				case 'switch':
					returnValue = NetStarUtils.valueConvertManager.getDictionaryByDictionary(originalValue, columnConfig.formatHandler.data);
					break;
				case 'stringReplace':
					var data = columnConfig.formatHandler.data;
					if (typeof (data.formatDate) == "object") {
						data = data.formatDate;
					}
					returnValue = NetStarUtils.valueConvertManager.getDictionaryByDictionary(originalValue, data);
					break;
				case 'columnstate':
					returnValue = workItemStateManage.word[originalValue] ? workItemStateManage.word[originalValue] : '';
					break;
				case 'subdataText':
					var editConfig = columnConfig.editConfig;
					var formatDate = {};
					if ($.isArray(editConfig.subdata) && editConfig.subdata.length > 0) {
						var subdata = editConfig.subdata;
						var valueField = editConfig.valueField;
						var textField = editConfig.textField;
						for (var subdataI = 0; subdataI < subdata.length; subdataI++) {
							var formatDataValue = subdata[subdataI][valueField];
							formatDate[formatDataValue] = subdata[subdataI][textField];
						}
						columnConfig.formatHandler = {
							type: 'subdataText',
							data: {
								formatDate: formatDate,
							},
						};
						returnValue = NetStarUtils.valueConvertManager.getDictionaryByDictionary(originalValue, columnConfig.formatHandler.data.formatDate);
					} else {
						if (typeof (editConfig.url) == "string") {
							returnValue = '';
						}
					}
					break;
				case 'codeToName':
					if (typeof (originalValue) != "undefined" && originalValue != "") {
						var isReadCode = false; // 是否已经读到code码
						returnValue = '';
						var _provinceInfo = $.extend(true, [], provinceInfo);
						for (var provinceI = 0; provinceI < _provinceInfo.length; provinceI++) {
							var provinceCode = _provinceInfo[provinceI].code;
							var provinceName = _provinceInfo[provinceI].name;
							var cityInfo = _provinceInfo[provinceI].sub;
							if (provinceCode == originalValue) {
								isReadCode = true;
								returnValue = provinceName;
							}
							if (!isReadCode && $.isArray(cityInfo)) {
								for (var cityI = 0; cityI < cityInfo.length; cityI++) {
									var cityCode = cityInfo[cityI].code;
									var cityName = cityInfo[cityI].name;
									var areaInfo = cityInfo[cityI].sub;
									if (cityCode == originalValue) {
										isReadCode = true;
										returnValue = provinceName + ' ' + cityName;
									}
									if (!isReadCode && $.isArray(areaInfo)) {
										for (var areaI = 0; areaI < areaInfo.length; areaI++) {
											var areaCode = areaInfo[areaI].code;
											var areaName = areaInfo[areaI].name;
											if (areaCode == originalValue) {
												isReadCode = true;
												returnValue = provinceName + ' ' + cityName + ' ' + areaName;
												break;
											}
										}
									} else {
										if (isReadCode) {
											break;
										}
									}
								}
							} else {
								if (isReadCode) {
									break;
								}
							}
						}
					}
					break;
				case 'renderField':
					returnValue = NetStarUtils.getHtmlByRegular(rowData,columnConfig.formatHandler.data);
					//渲染字段
					break;
				case 'href':
					if(columnConfig.formatHandler.data.field){
						returnValue = rowData[columnConfig.formatHandler.data.field];
					}
					break;
				case 'upload':
					if(originalValue){
						var valArr = typeof(originalValue) == "string" ? originalValue.split(',') : [];
						returnValue = valArr.length > 0 ? valArr.length + '个附件' : '';
					}
					break;
                default:
                    //不需要转换的类型
					returnValue = originalValue;
                    break;
			}			
            return returnValue;
		},
		getRowState : function(rowData){
			var workItemState = rowData.workItemState;  // 工作项状态 原始数据有工作项状态NETSTAR-MSGSTATE
			var state = 'normal'; // 待办
			var lineHaveState = false;
			function setState(){
				if (rowData.hasEmergency) {
					state = 'emergency';
				} else if (rowData.hasSuspend) {
					state = 'suspend';
				} else if (rowData.hasRollback) {
					state = 'rollback';
				}
			}
			function setStateByWorkItemState(_workItemState){
				if(workItemStateManage.dealt[_workItemState]){
					// 待办
					setState()
				}else{
					state = workItemStateManage.name[_workItemState];
				}
			}
			if(typeof(workItemState) != "undefined"){
				lineHaveState = true;
				setStateByWorkItemState(workItemState);
			}else{
				setState()
			}

			// 设置状态添加的字段 如果有workItemState则不执行
			if(lineHaveState || !rowData['netstar-workItemState']){
				return state ? state : 'normal';
			}
			workItemState = rowData['netstar-workItemState'];
			delete rowData['netstar-workItemState'];
			setStateByWorkItemState(workItemState);
			return state ? state : 'normal';
		},
		//获取行数据
		getRowData: function (_rowData, _gridConfig) {
			var rowData = {};
			var _this = this;
			$.each(_rowData, function (key, value) {
				//获取column配置
				var columnConfig = _gridConfig.columnById[key];
				if (typeof (columnConfig) == 'object') {
					//有可能需要处理的数据
					rowData[key] = _this.getValueByColumnType(_rowData[key], _rowData, columnConfig);
				} else {
					//没有配置， 这些是不用处理的数据
					rowData[key] = _rowData[key];
				}
			});

			//添加是否选中标识 如果服务器端发送过来的数据已经带有此标识 则使用服务器标记
			if (typeof (rowData.netstarSelectedFlag) == 'undefined') {
				rowData.netstarSelectedFlag = false;
			}
			//添加是否选中标识 如果服务器端发送过来的数据已经带有此标识 则使用服务器标记 Sjj 20190325
			if (typeof (rowData['NETSTAR-TRDISABLE']) == 'undefined') {
				rowData['NETSTAR-TRDISABLE'] = false;
			}
			//添加是否打开树节点标记 sjj 20190626
			if(typeof(rowData.netstarOpen)=='undefined'){
				rowData.netstarOpen = false;
			}

			//添加当前父节点是展开还是关闭 sjj 20190626
			if(typeof(rowData.netstarExpand)=='undefined'){
				rowData.netstarExpand = false;
			}
			
			//生成行复选框的id 
			if (_gridConfig.ui.isCheckSelect == true) {
				rowData.netstarCheckboxSelectedFlag = false;
			}

			rowData['NETSTAR-MSGSTATE'] = dataManager.getRowState(rowData);
			
			return rowData;
		},
		//添加行数据
		addRow: function (rowData, gridId, index) {
			//tableRowsData:array [{id:'',value:""},{....}] 整个表格的所有行数据
			//gridId:string gird的id
			//index:number  插入的位置，默认 0 是插入到最开始， -1是插入到最后
			var insertIndex = index ? index : 0;
			var grid = NetstarBlockListM.configs[gridId];
			if (typeof (grid) != 'object') {
				console.error('id:' + gridId + ' 找不到相关配置文件，请核实');
			} else {
				//更新原始数据 渲染来自于监视器
				var rows = grid.vueConfig.data.originalRows;
				//-1 小于0，一般就是-1， 插入到最后去 
				if (insertIndex < 0) {
					insertIndex = rows.length
				}
				//太大了处理成正好
				if (insertIndex > rows.length) {
					insertIndex = rows.length
				}
				//不是数组则直接插入，如果是数组，需要逐条插入
				if ($.isArray(rowData) == false) {
					rows.splice(insertIndex, 0, rowData);
				} else {
					//逐条插入，需要改变索引值，效率较低，日后需要重写
					for (var i = 0; i < rowData.length; i++) {
						rows.splice(insertIndex + i, 0, rowData[i]);
					}
				}


			}
		},
		//删除行数据
		delRow: function (rowData, gridId, index) {
			//tableRowsData:array [{id:'',value:""},{....}] 整个表格的所有行数据
			//gridId:string gird的id
			var grid = NetstarBlockListM.configs[gridId];
			if (typeof (grid) != 'object') {
				console.error('id:' + gridId + ' 找不到相关配置文件，请核实');
			} else {
				var originalRows = grid.vueConfig.data.originalRows;//返回的总数据
				var rows = grid.vueConfig.data.rows;  //当前显示的行数据
				var idField = grid.gridConfig.data.idField;

				var startI = 0;
				if (grid.gridConfig.data.isServerMode == false) {
					startI = grid.vueConfig.data.page.start;
				}

				var dataNsIndex = -1;
				var originalNsIndex = -1;
				for (var i = 0; i < rows.length; i++) {
					var data = rows[i];
					if (originalRows[i + startI]) {
						//当前显示的值存在于原始数据值当中
						if (data[idField] == rowData[idField]) {
							dataNsIndex = i;
							originalNsIndex = i + startI;
							break;
						}
					}
				}
				if (typeof (index) == 'number') {
					dataNsIndex = index;
					originalNsIndex = index + startI;
				}
				if (dataNsIndex > -1) {
					rows.splice(dataNsIndex, 1);//删除其对应位置
					originalRows.splice(originalNsIndex, 1);
				} else {
					console.error('delIndex:' + dataNsIndex + ' 找不到对应行数据，请核实');
				}
			}
		},
		//获取全部渲染后的行数据，
		getRows: function (_rows, _gridConfig) {
			//_rows : array 原始行数据
			//return array 渲染后的行数据
			var rows = [];
			for (var i = 0; i < _rows.length; i++) {
				if (typeof (_rows[i]) != 'object') {
					continue;
				}
				var rowData = this.getRowData(_rows[i], _gridConfig);
				rowData.netstarEmptyRowFlag = false;  //是否是空行标识
				rows.push(rowData);
			}
			//如果是编辑模式至少要有一个空行 且编辑模式不分页
			if (_gridConfig.ui.isEditMode) {
				if (rows[rows.length - 1]) {

				}
				if (_gridConfig.ui.isAllowAdd) {
					rows.push({ netstarEmptyRowFlag: true });
				}
			}

			//如果没定义最小显示条数 结束返回
			if (typeof (_gridConfig.ui.minPageLength) == 'undefined') {
				return rows
			} else {
				//需要继续还行
			}
			//如果数量已经够了 结束返回
			if (_gridConfig.ui.minPageLength <= _rows.length) {
				return rows
			} else {
				//需要继续还行
			}
			//还不够, 需要添加空数据
			if (_gridConfig.ui.isAllowAdd) {
				for (var plusI = _rows.length; plusI < _gridConfig.ui.minPageLength; plusI++) {
					rows.push({ netstarEmptyRowFlag: true });
				}
			}
			return rows;
		},
		resetData:function(tableRowsData,gridId){
			var grid = NetstarBlockListM.configs[gridId];
			if(typeof (grid) != 'object'){
				console.error('id:' + gridId + ' 找不到相关配置文件，请核实');
			}else{
				//更新原始数据 并渲染来自于监视器
				grid.gridConfig.data.dataSource = tableRowsData;
				grid.vueConfig.data.originalRows = tableRowsData;
				var pageLength = grid.gridConfig.ui.pageLengthDefault;
				var tableRowsLength = tableRowsData.length;
				if (grid.gridConfig.data.isServerMode) {
					//服务端翻页 sjj20190402
					tableRowsLength = Number(grid.gridConfig.domParams.serverData.total);
				}
				if(tableRowsData.length > 0){
					//修改空数据面板状态
					grid.gridConfig.domParams.panelOfEmptyRows = {
						isShow:false,
						class:'',
						info:'', 
					};
				}else{
					//修改空数据面板状态
					grid.gridConfig.domParams.panelOfEmptyRows = {
						isShow:true,
						class:'no-data',
						info:i18n.noData, 
					};
				}
				//grid.vueConfig.data.rows = tableRowsData;
				grid.vueConfig.data.rows = dataManager.getRows(tableRowsData, grid.gridConfig);
				//var pageNumber = Math.ceil(tableRowsLength / pageLength);
				//grid.vueConfig.data.pageNumberWithMax = i18n.pageNumberWithMax.replace(/_PAGES_/g, pageNumber).replace(/_MAX_/g, tableRowsLength);
			}
		},
		//根据ajax获取数据并刷新
		ajax:function(_gridConfig){
            var _this = this;
            //修改空数据面板状态
            _gridConfig.domParams.panelOfEmptyRows = {
                isShow:true,
                class:'loading',
                info:i18n.loadingInfo, 
			};
            var ajaxOptions = {
                url:_gridConfig.data.src,       //地址
                data:_gridConfig.data.data,     //参数
				type:_gridConfig.data.type, 
				contentType:_gridConfig.data.contentType, 
			}
            NetStarUtils.ajax(ajaxOptions, function(res, _ajaxOptions){
                //获取ajax返回结果
                if(res.success){
                    //调用ajax成功
                    _gridConfig.domParams.panelOfEmptyRows = {
                        isShow:false,
                        class:'',
                        info:'', 
					}
					if(_gridConfig.data.isServerMode){
						//服务端请求
						_gridConfig.domParams.serverData = res;
					}
                    var dataSrc = _gridConfig.data.dataSrc;
                    var rows = $.extend(true,[],res[dataSrc]);
                    //如果返回的不是数组，可能是空数组
                    if($.isArray(rows) == false){
                        rows = [];
					}
					//sjj 20190724添加如果返回值为空
					if(rows.length == 0){
						_gridConfig.domParams.panelOfEmptyRows = {
							isShow:true,
							class:'no-data',
							info:i18n.noData, 
						}
					}
					_this.resetData(rows, _gridConfig.id);
					//执行ajax完成后的回调（config.ui.ajaxSuccessHandler）
					if (typeof (_gridConfig.data.ajaxSuccessHandler) == 'function') {
						_gridConfig.data.ajaxSuccessHandler(rows);
					}
                }else{
                    //调用ajax失败
                    _gridConfig.domParams.panelOfEmptyRows = {
                        isShow:true,
                        class:'loadedError',
                        info:i18n.loadedError, 
                    }
                }
            }, true)
		},
		//sjj 20190416 处理单行数据的格式化
		formatSingleRowData:function(rowData,columns){
			// cy 0329 star--------------------
			// 根据数据库字段类型转换数据值
			function getDataByVariableType(data, columnConfig) {
				switch (columnConfig.variableType) {
					case 'number':
						// 数字类型 转化boolean为数值
						if (typeof (data) == "boolean") {
							data = Number(data);
						}else if(data === ''){
							data = undefined;
						}
						break;
					case 'date':
						if(typeof(data)!='number'){
							data = undefined;
						}
						break;
				}
				return data;
			}
			for (var key in rowData) {
				if (typeof (columns[key]) == "object") {
					rowData[key] = getDataByVariableType(rowData[key], columns[key]);
				}
			}
			// cy 0329 end---------------------
		},
		// 格式化获取的表格数据 lyw
		formatGetData: function (rowsData,columns) {
			if (!$.isArray(rowsData)) {
				nsAlert('获取的表格数据错误', 'error');
				console.error('获取的表格数据错误');
				console.error(rowsData);
				return;
			}
			for (var rowI = 0; rowI < rowsData.length; rowI++) {
				this.formatSingleRowData(rowsData[rowI],columns);
			}
		},
		//sjj 20190419 验证每行的数据是否都为空
		validIsAllEmptyByRowData:function(_rowData){
			//行数据  //字段id  字段值
			//根据列字段的总数去判断 如果当前为空值的列等于总列的字段总和 那么则是都为空了
			var isEmpty = false;
			var emptyLength = 0;//空值的数量
			var totalLength = 0; //总共要计算的值长度
			for(var value in _rowData){
				switch(typeof(_rowData[value])){
					case 'string':
						if(_rowData[value] == ''){
							emptyLength ++;
						}
						break;
					case 'object':
						if($.isEmptyObject(_rowData[value])){
							emptyLength++;
						}
						break;
				}
				totalLength++;
			}
			if(emptyLength == totalLength){isEmpty = true;}
			return isEmpty;
		},
		validateRowsDataByGridId:function(gridId){
			var configs = NetstarBlockListM.configs[gridId];//获取grid配置项
			var columns = configs.gridConfig.columnById;
			var rowsData = this.getData(gridId);
			var rulesJson = {};
			for(var columnField in columns){
				var columnData = columns[columnField];
				if(!$.isEmptyObject(columnData.editConfig)){
					if(columnData.editConfig.rules){
						rulesJson[columnField] = {
							id:columnData.editConfig.id,
							label:columnData.editConfig.label,
							rules:columnData.editConfig.rules,
							type:columnData.editConfig.type
						};
					}
				}
			}
			var isPass = true;
			var validInfoStr = '';
			for(var rowI=0; rowI<rowsData.length; rowI++){
				var rowData = rowsData[rowI];
				var isContinue = true;
				for(var key in rowData){
					if(rulesJson[key]){
						//需要验证必填
						rulesJson[key].value = rowData[key];
						var validJson = nsComponent.validatValue(rulesJson[key]);
						if(validJson.isTrue == false){
							validInfoStr = rulesJson[key].label + ':'+validJson.validatInfo;
							isContinue = false;
							break;
						}
					}
				}
				if(isContinue == false){
					isPass = false;
					break;
				}
			}
			if(isPass == false){
				nsAlert(validInfoStr,'error');
			}
			return isPass;
		},
		validateGridByRowsData:function(rowsData, columns){
			var rulesJson = {};
			for(var columnField in columns){
				var columnData = columns[columnField];
				if(!$.isEmptyObject(columnData.editConfig)){
					if(columnData.editConfig.rules){
						rulesJson[columnField] = {
							id:columnData.editConfig.id,
							label:columnData.editConfig.label,
							rules:columnData.editConfig.rules,
							type:columnData.editConfig.type
						};
					}
				}
			}
			var isPass = true;
			var validInfoStr = '';
			for(var rowI=0; rowI<rowsData.length; rowI++){
				var rowData = rowsData[rowI];
				var isContinue = true;
				for(var key in rowData){
					if(rulesJson[key]){
						//需要验证必填
						rulesJson[key].value = rowData[key];
						var validJson = nsComponent.validatValue(rulesJson[key]);
						if(validJson.isTrue == false){
							validInfoStr = rulesJson[key].label + ':'+validJson.validatInfo;
							isContinue = false;
							break;
						}
					}
				}
				if(isContinue == false){
					isPass = false;
					break;
				}
			}
			if(isPass == false){
				nsAlert(validInfoStr,'error');
			}
			return isPass;
		},
		//获取数据
		getData:function(gridId,isValid){
			if(typeof(isValid)!='boolean'){
				isValid = false;
			}
			var _this = this;
			var configs = NetstarBlockListM.configs[gridId];//获取grid配置项
			var columns = configs.gridConfig.columnById;
			var allData = $.extend(true, [], configs.vueObj.originalRows);
			var rowsData = [];
			for (var rowI = 0; rowI < allData.length; rowI++) {
				if (!$.isEmptyObject(allData[rowI])) {
					//去除null值
					if (allData[rowI] instanceof Object) {
						for (var key in allData[rowI]) {
							if (allData[rowI].hasOwnProperty(key)) {
								var element = allData[rowI][key];
								if (element == null) {
									delete allData[rowI][key];
								}
								if (key.indexOf('NETSTAR-') != -1) {
									delete allData[rowI][key];
								}
							}
						}
					}
					//sjj 20190419 添加行数据的处理 如果当前行数据中全部都是空值
					var isAllEmplty = this.validIsAllEmptyByRowData(allData[rowI]);
					if(!isAllEmplty){
						rowsData.push(allData[rowI]);
					}
				}
			}
			_this.formatGetData(rowsData, columns); // lyw 格式化获取的表格数据
			if(isValid){
				var isPassValid = _this.validateGridByRowsData(rowsData, columns);
				if(isPassValid == false){
					rowsData = false;
				}
			}
			return rowsData;
		},
	};
	var vueManager = {
		getData:function(gridConfig){

			//基本数据格式
			var vueData = {
				idField:gridConfig.data.idField,
				plusClass:gridConfig.plusClass,
				//头部部分 用于标题 内部搜索等
				header:{
					isShow:false,
				},
				//底部部分 用于统计合计等
				footer:{
					isShow:false,
				},
				//基础属性
				/** 三个实际上的表格属性统一 id styleObj
				 * headerTable：{
				 * 		id:'',
				 * 		styleObj:{width:'1550px'} 
				 * }
				 */
				domParams:{
					// headerTable:{},  头部
					// contentTable:{}, 内容
					// footerTable:{},  底部
				},
				//数据
				rows:[],
				//列描述
				columns:[],
				//页描述
				page:{
					start:0, 										//从第几条开始
					length:gridConfig.ui.pageLengthDefault, 		//当前显示长度
					pageLength:gridConfig.ui.pageLengthMenu, 		//可选分页数量
				},
				search:{
					keyword:''
				},
				ui:gridConfig.ui, //ui参数, 包含是否有自动序列号, 是否有checkSelect
				pageNumberWithMax:'',
			};
			//头部处理
			var isHaveHeaderPanel = false;  //是否有头部面板
			if(gridConfig.ui.title){
				vueData.header.title = gridConfig.ui.title;
				isHaveHeaderPanel = true;
			}

			//复制基本数据
			if(gridConfig.domParams){
				vueData.domParams = gridConfig.domParams;
			}

			//复制列配置
			if(gridConfig.columns){
				vueData.columns = gridConfig.columns;
				vueData.columnById = {};
				for(var columnI = 0; columnI<vueData.columns.length; columnI++){
					var columnConfig = vueData.columns[columnI];
					columnConfig.gridId = gridConfig.id;
					var key = columnConfig.field
					vueData.columnById[key] = columnConfig;
				}
				gridConfig.columnById = vueData.columnById;
			}
			//复制行数据
			if(gridConfig.data.src){
                //ajax数据源 先填充空行到数据源
                vueData.originalRows = [];
                vueData.rows = dataManager.getRows([], gridConfig);
                dataManager.ajax(gridConfig);
			}else{
				if(!$.isArray(gridConfig.data.dataSource)){
					gridConfig.data.dataSource = [];
				}
				if(gridConfig.data.dataSource.length == 0){
					//修改空数据面板状态
					gridConfig.domParams.panelOfEmptyRows = {
						isShow:true,
						class:'no-data',
						info:i18n.noData, 
					};
				}
                //如果定义了数据源
                vueData.originalRows = gridConfig.data.dataSource;
				vueData.rows = dataManager.getRows(gridConfig.data.dataSource, gridConfig);
            }
			
			return vueData;
		},
		getVueConfig:function(_gridConfig){
			var vueConfig = {
                id:_gridConfig.id, 
				el:_gridConfig.el,
				data:this.getData(_gridConfig),
				contentTableAttr:{
					isRefreshSource:false, //是否刷新了数据
					$table:'', //主要内容表格
				},
				component:{},
				watch:{
					search:{
						keyword: function (value) {
							console.log(value);
						}
					},
					rows:{
						deep:true,
						handler:function(newValues, oldValues){
							this.$options.contentTableAttr.isRefreshSource = true;
							//修改数据源属性
							//console.log('rows edit');
							
							if(this.ui.hideValueOption){
								//排重
								var listArray = this.ui.hideValueOption.list;
								var idField = this.idField;
								var listIdField = this.ui.hideValueOption.idField;
								if($.isArray(listArray)){
									var idsArray = [];//把存在的ids值记录下来
									if(listArray.length > 0){
										var idsArray = [];//把存在的ids值记录下来
										for(var listI=0; listI<listArray.length; listI++){
											idsArray.push(listArray[listI][listIdField]);
										}
									}
									if(idsArray.length > 0){
										//如果排重的字段值存在 去当前返回的rows数据里匹配查找
										for(var rowI=0; rowI<newValues.length; rowI++){
											var rowData = newValues[rowI];
											if(idsArray.indexOf(rowData[idField]) == -1){
												//记录下不存在排重的数据
												
											}else{
												rowData['NETSTAR-TRDISABLE'] = true;
											}
										}
									}
								}
							}
						}
                    },
                    originalRows:{
                        //数据源发生变化时候重新分页
                        handler:function(newRowsData, oldRowsData){
							//监视原始数据，分页后刷新显示数据 
							var gridConfig = NetstarBlockListM.configs[[this.$options.id]].gridConfig;
                        }
                    }
				},
				methods:{
					scrollXContentTable: function (ev) {
						methodsManager.scrollXTableHandler(ev, this);
					},
					scrollYContentTable: function (ev) {
						methodsManager.scrollYTableHandler(ev, this);
					},
					contentWheelHandler: function (ev) {
						//methodsManager.contentWheelHandler(ev, this);
					},
					netStarColumnText:function(data,rowIndex) {
						return methodsManager.body.netStarColumnText(data,rowIndex,this);
					},
					rowClickHandler:function(ev){
						methodsManager.body.rowClickHandler(ev, this);
					},
					rowdbClickHandler: function (ev) {
						methodsManager.body.rowdbClickHandler(ev, this);
					},
					componentChangeHandler:function(data){
						methodsManager.componentChangeHandler(data,this);
					},
					moreBtnsHandler:function(ev){
						return methodsManager.body.moreBtnsHandler(ev,this);
					},
					touchstartHandler:function(ev){
						return methodsManager.body.touchstartHandler(ev,this);
					},
					touchmoveHandler:function(ev){
						return methodsManager.body.touchmoveHandler(ev,this);
					},
					touchendHandler:function(ev){
						return methodsManager.body.touchendHandler(ev,this);
					},
					NetStarColumnStateText: function (data, columnCofig) {
						var returnValue = workItemStateManage.word[data[columnCofig.field]];
						return returnValue ? returnValue : '';
					},
					NetstarColumnStateIcon: function (data, columnCofig) {
						var iconClassStr = workItemStateManage.icon[data[columnCofig.field]];
						return iconClassStr ? iconClassStr : '';;
					},
					netstarRowStateFlag: function (data) {
						return methodsManager.body.rowStateClassHandler(data, this);
					},
					initComponent:function(ev){
						var componentFieldArray = this.componentFieldArray;
						if(!$.isArray(componentFieldArray)){componentFieldArray = [];}
						if(componentFieldArray.length > 0){
							for(var rowI=0; rowI<this.originalRows.length; rowI++){
								var id = 'tr-component-'+rowI;
								for(var fieldI=0; fieldI<componentFieldArray.length; fieldI++){
									if($('#'+id+' .block-list-form '+componentFieldArray[fieldI].el+' .form-td').length > 0){
										$('#'+id+' .block-list-form '+componentFieldArray[fieldI].el+' .form-td').remove();
									}
									componentFieldArray[fieldI].value = this.originalRows[rowI][componentFieldArray[fieldI].id];
								}
								var tableBlock = {
									id:  		id,
									formSource: 'fullScreen',
									components:componentFieldArray
								}
								nsComponent.initComponentByTable(tableBlock);
							}
						}
					}
				},
				mounted:function() {
					//初始化表格的body，以及三个主要Table对象 都是$dom对象
					//methodsManager.initDomParams(this);
					//如果存在数据源 data.dataSource 则需要刷新纵向滚动条的高度
					//methodsManager.refreshScrollY(this);
					if(this.ui.isEditMode){
						var column = this.columnById;
						var componentFieldArray = [];
						for(var field in column){
							var columnEditable = typeof(column[field].editable)=='boolean' ? column[field].editable : false;
							var json = {
								id:column[field].field,
								//label:column[field].title,
								mindjetFieldPosition:'field',
								commonChangeHandler:this.componentChangeHandler,
								readonly:!columnEditable,
							};
							var editConfig = column[field].editConfig ? column[field].editConfig : {};
							switch(editConfig.type){
								case 'select':
									json.type="radio";
									json.subdata = editConfig.subdata;
									json.textField = editConfig.textField;
									json.valueField = editConfig.valueField;
									json.el = '.radio-component';
									//isEditMode = true;
									break;
								case 'adderSubtracter':
									json.type="adderSubtracter";
									json.el = '.adderSubtracter-component';
									//isEditMode = true;
									break;
								case 'number':
									json.type="number";
									json.el = '.input-component';
									//json.rules = editConfig.rules;
									//isEditMode = true;
									break;
							}
							if(editConfig.rules){
								json.rules = editConfig.rules;
							}
							if(columnEditable){
								componentFieldArray.push(json);
							}
						}
						this.componentFieldArray = componentFieldArray;
						this.initComponent();
					}
				},
				updated:function(){
					//刷新数据源了，则需要重新设定滚动条的高度
					var isRefreshSource = this.$options.contentTableAttr.isRefreshSource;
					if(isRefreshSource){
						//methodsManager.refreshScrollY(this);
					}
                },
                //需要自动计算的变量
                computed:{
                }

            };
			return vueConfig;
		}
	};
	function getVueConfig(_gridConfig){
		configManager.setDefault(_gridConfig);
		//先对容器进行设置高度，防止因为高度变化引起的闪烁
		htmlManager.setContainer(_gridConfig);
        var gridConfig = configManager.getConfig(_gridConfig);
        //获取与VUE标签匹配的VUE配置文件
		var vueConfig = vueManager.getVueConfig(gridConfig);
		//获取带VUE标签的代码
		var html = htmlManager.getHtml(gridConfig, vueConfig);
		return {
			html:html,  
            vueConfig:vueConfig,
            gridConfig:gridConfig,
		};
	}
	// 刷新subdata对应的ajax 
	function refreshSubdataByAjax(configs) {
		var columns = configs.vueConfig.data.columns;
		var refreshColumns = []; // 需要刷新的列
		var refreshIndex = 0; // 刷新到的列
		for (var columnI = 0; columnI < columns.length; columnI++) {
			var columnConfig = columns[columnI];
			if (columnConfig.columnType == "subdataText" && typeof (columnConfig.formatHandler) != "object") {
				if (typeof (columnConfig.editConfig.url) == "string") {
					refreshColumns.push(columnConfig);
				}
			}
		}
		for (var refI = 0; refI < refreshColumns.length; refI++) {
			var editConfig = refreshColumns[refI].editConfig;
			var url = editConfig.url;
			var data = $.extend(true, {}, editConfig.data);
			var type = editConfig.method;
			if(typeof(data) == "object"){
				data = NetStarUtils.getFormatParameterJSON(data, {});
				for(var key in data){
					if(data[key] == null){
						delete data[key];
					}
				}
			}
			// 发送ajax根据value值查询行数据 
			var ajaxConfig = {
				url: url,
				type: type,
				dataType: 'json',
				plusData: {
					fieldId: refreshColumns[refI].field,
					tableId: configs.vueConfig.id,
				},
				data: data,
			}
			if (typeof (editConfig.contentType) == "string" && editConfig.contentType.length > 0) {
				ajaxConfig.contentType = editConfig.contentType;
			}
			NetStarUtils.ajax(ajaxConfig, function (data, _ajaxConfig) {
				refreshIndex++;
				var fieldId = _ajaxConfig.plusData.fieldId;
				var tableId = _ajaxConfig.plusData.tableId;
				var _configs = NetstarBlockListM.configs[tableId]; // 配置
				var _columns = _configs.vueConfig.data.columns;
				var _editConfig = {};
				for (var columnI = 0; columnI < _columns.length; columnI++) {
					if (_columns[columnI].field == fieldId) {
						_editConfig = _columns[columnI].editConfig;
					}
				}
				var dataSrc = _editConfig.dataSrc;
				var subdata = data;
				if (typeof (dataSrc) == "string") {
					subdata = data[dataSrc];
				}
				_editConfig.subdata = subdata;
				if (refreshIndex == refreshColumns.length) {
					// 最后一个刷新完刷新行
					var originalRowsData = $.extend(true, [], _configs.vueConfig.data.originalRows);
					_configs.vueConfig.data.originalRows = originalRowsData;
				}
			});
		}
	}
	// 设置表达式配置参数
	function setCountFuncConfig(_configs) {
		var columns = _configs.vueConfig.data.columns;
		var columnEditConfig = {}; // 所有表单配置数组
		for (var colI = 0; colI < columns.length; colI++) {
			var columnConfig = columns[colI];
			if (typeof (columnConfig.editConfig) == "object") {
				if (typeof (columnConfig.editConfig.total) == "string") {
					columnEditConfig[columnConfig.field] = columnConfig.editConfig.total;
				}
			}
		}
		_configs.vueObj.columnEditConfig = columnEditConfig;
	}
	function initCompleteHandler(_configs){
		setCountFuncConfig(_configs);
		if (typeof (_configs.gridConfig.ui.completeHandler) == 'function') {
			_configs.gridConfig.ui.completeHandler(_configs);
		}
		//刷新subdata对应的ajax 
		refreshSubdataByAjax(_configs);
	}
	function init(gridConfig){
		//设置类型 defaultMode
		var defaultUI = {
			displayMode:'block',
			isHaveEditDeleteBtn:false,//行内关闭修改删除按钮
			isCheckSelect:false,//不支持多选
			isHeader:false,//不显示头部
			isPage:false,//不分页
			isThead:false,//不显示标题
			isHaveAddBtn:false,
			isInlineBtn:false,
			isUseMessageState:false,
			hideValueOption:{},
		};
		gridConfig.ui = typeof(gridConfig.ui)=='object' ? gridConfig.ui :{};
		NetStarUtils.setDefaultValues(gridConfig.ui,defaultUI);
		if(gridConfig.ui.isEditMode == true){
			if(gridConfig.plusClass){
				gridConfig.plusClass += ' editmode-list';
			}else{
				gridConfig.plusClass = 'editmode-list';
			}
		}
		if(gridConfig.ui.isUseMessageState == true){
			if(gridConfig.plusClass){
				gridConfig.plusClass += ' message-state';
			}else{
				gridConfig.plusClass = 'message-state';
			}
		}
		//准备VUE输出 返回html和vue的整体参数
		var grid = NetstarBlockListM.getVueConfig(gridConfig);
		//先输出带VUE标签的HTML到相应的容器内
		$(grid.vueConfig.el).html(grid.html);
		//执行VUE渲染
		var vueObj = new Vue(grid.vueConfig);
		var configs = {
            original:gridConfig,            //原始配置参数
			gridConfig:grid.gridConfig,     //运行时配置参数
			vueConfig:grid.vueConfig,       //vue配置参数
			vueObj:vueObj,                  //vue对象 
		};
		NetstarBlockListM.configs[gridConfig.id] = configs;
		initCompleteHandler(configs);
	}
	return{
		init:init,
		getVueConfig:getVueConfig,
		initCompleteHandler:initCompleteHandler,
		configs: {},
		VERSION: '0.0.1', 
		dataManager:dataManager,
		validateRowsDataByGridId:dataManager.validateRowsDataByGridId,
		addRowBtnsHandler:function(gridId,_this){
			console.log(gridId)
			console.log(_this)
		},
		//刷新表格	根据表格id和表格数据(Array)
		refreshDataById: function (gridId, gridData) {
			var config = NetstarBlockListM.configs[gridId];
			if (typeof config == 'undefined') {
				console.error("gridId传入错误");
				return false;
			}
			if (!(gridData instanceof Array)) {
				console.error("gridData类型应为数组");
				console.error(gridData)
				return false;
			};
			if(gridData.length > 0){
				//修改空数据面板状态
				config.gridConfig.domParams.panelOfEmptyRows = {
					isShow:false,
					class:'',
					info:'', 
				};
			}else{
				//修改空数据面板状态
				config.gridConfig.domParams.panelOfEmptyRows = {
					isShow:true,
					class:'no-data',
					info:i18n.noData, 
				};
			}
			config.vueObj.originalRows = $.extend(true, [], gridData);
			var rows = $.extend(true, [], gridData);
			config.vueObj.rows = dataManager.getRows(rows, config.gridConfig);
			setTimeout(function(){
				NetstarBlockListM.configs[gridId].vueObj.initComponent();
			}, 0);
		},	//刷新表格 是否修改参数可选
		refreshById: function (gridId, ajaxData) {
			//gridId:string 必填
			//ajaxData:object ajax参数
			var config = NetstarBlockListM.configs[gridId];
			if (typeof (config) != 'object') {
				nsalert('refreshById(gridId)方法出错，当前gridId：' + gridId + '错误， 该Grid不存在');
				console.error('refreshById(gridId)方法出错，当前gridId：');
				console.error(gridId);
				return false;
			}
			//console.warn(config.gridConfig);
			if(typeof(ajaxData) == 'object'){
				config.gridConfig.data.data = ajaxData;
			};

			//如果是服务端翻页 sjj 
			if (config.gridConfig.data.isServerMode) {
				var start = config.vueObj.page.start;
				var length = config.vueObj.page.length;
				nsVals.extendJSON(config.gridConfig.data.data, { start: start, length: length });
			}
			dataManager.ajax(config.gridConfig);
		},
		getSelectedData:function(gridId){
			var config = NetstarBlockListM.configs[gridId];
			if (typeof (config) != 'object') {
				var errorInfoStr = 'getSelectedData(gridId)方法出错，当前gridId：' + gridId + '错误， 该Grid不存在';
				nsalert(errorInfoStr, 'error');
				console.error(errorInfoStr)
				return false;
			}
			var originalRows = config.vueObj.originalRows;
			var rows = config.vueObj.rows;
			var selectedRows = [];
			var startI = 0;
			if (config.gridConfig.data.isServerMode == false) {
				startI = config.vueConfig.data.page.start;
			}
			for (var i = 0; i < rows.length; i++) {
				var data = rows[i];
				if (originalRows[i + startI]) {
					if (data.netstarSelectedFlag) {
						selectedRows.push(originalRows[i + startI]);
					}
				}

			}
			return selectedRows;
		},
	}
})(jQuery)