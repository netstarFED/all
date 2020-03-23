/*
 * @Desription: Grid组件
 * @Author: netstar.cy
 * @Date: 2018-11-28 13:42:05
 * @LastEditTime: 2019-11-12 18:27:08
 */
"use strict";
//表格Grid NetStarGrid
var NetStarGrid = (function () {

	//语言包
	var I18N = {
		zh: {
			footerValueSum: '合计',
			footerValueAverage: '平均',
			searchWord: '过滤',
			loadingInfo: '正在加载，请稍候',
			loadedError: '数据加载错误',
			pageNumberWithMax: '( _PAGES_ 页 _MAX_ 行)',
			noData: '暂无数据',
		},
		en: {
			footerValueSum: 'Total',
			footerValueAverage: 'Average',
			searchWord: 'Filter',
			loadingInfo: 'Loading...',
			loadedError: 'Loaded Error',
			pageNumberWithMax: '( _PAGES_ 页 _MAX_ 行)',
			noData: 'empty...',
		}
	}
	var i18n = NsUtils.getI18n(I18N);

	//vue模板配置
	var TEMPLATE = {
		PC: {
			HEADER: {
				//整体头部容器
				CONTAINER: '<div nsgirdpanel="grid-header" class="pt-panel grid-header" v-if="header.isShow === true">\
						<div class="pt-container">' +
					//标题面板
					'{{TITLEPANEL}}' +
					//过滤和搜索面板
					"{{FILTERPANEL}}" +
					'</div>\
					</div>',
				//标题面板
				TITLEPANEL: '<div class="title-panel">{{ header.title }}</div>',
				FILTERPANEL: '<div class="pt-panel-row" v-if="header.isFilterShow === true">\
								<div class="pt-panel-col" :id="header.queryId">\
								</div>\
								<div class="pt-panel-col text-right" :id="header.advanceQueryId" v-if="header.isShowAdvance === true">\
								</div>\
							</div>',
				//过滤和搜索面板
				FILTERPANEL1: '<div class="pt-form pt-form-inline pt-form-normal">\
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
				CONTAINER: '<div nsgirdpanel="grid-body"  class="pt-panel pt-grid-body">\
						<div class="pt-container">' +
					//左固定表格
					//可操作的内容表格
					'<template v-if="ui.displayMode === \'block\' ">' +
					'<template v-if="ui.isHeader === true">' +
					'{{HEADERTABLE}}' +
					'</template>' +
					'</template>' +
					'<template v-else>' +
					'{{HEADERTABLE}}' +
					'</template>' +
					'<div nsgirdcontainer="grid-body-container" class="pt-grid-body-container">' +
					'{{CONTENTTABLE}}' +
					'{{SCROLLX}}' +
					'{{SCROLLY}}' +
					'</div>' +
					'{{FOOTERTABLE}}' +
					'<div nsgirdcontainer="grid-body-dragwidth" :id="domParams.dragContainer.id" class="pt-grid-body-dragwidth" :style="domParams.dragContainer.style"  v-if="ui.dragWidth === true">' +
					'<template v-if="ui.displayMode !== \'block\'">' +
					'{{DRAGCONTENT}}' +
					'</template>' +
					'</div>' +
					'</div>\
					</div>',
				//拖拽
				DRAGCONTENT: '<div class="handler" \
							v-for="columnConfig in dragColumns"\
							:ns-field="columnConfig.field"\
							:style="columnConfig.dragStyleObj"\
						>' +
					'</div>',
				//表格头部 固定头部
				HEADERTABLE: '<div class="pt-grid-body-head" nsgirdcontainer="grid-body-headertable" :id="domParams.headerTableContainer.id">' +
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
				CONTENTTABLE: '<div \
						nsgirdcontainer="grid-body-contenttable" \
						class="pt-panel pt-grid-body" \
						:class="ui.displayMode" \
						:style="domParams.contentTableContainer.style" \
						:id="domParams.contentTableContainer.id" \
						@mousewheel="contentWheelHandler" \
					>' +
					'<div v-if="domParams.panelOfEmptyRows.isShow" class="panel-emptyrows" :class="domParams.panelOfEmptyRows.class">{{domParams.panelOfEmptyRows.info}}</div>' +
					'<template v-if="ui.displayMode === \'block\' ">' +
					'<div class="pt-grid" :style="domParams.contentTable.style" :id="domParams.contentTable.id">' +
					'<div v-for="(row,index) in rows" :ns-rowindex="index" :ns-id="row[idField]" @click="rowClickHandler" @dblclick="rowdbClickHandler" class="pt-block-list" :class="[{\'selected\':row.netstarSelectedFlag},{\'disabled\':row[\'NETSTAR-TRDISABLE\']},NetstarBlockState(row),plusClass,{\'hide\':row[\'NETSTAR-TRHIDDEN\']}]">' +
					'<div class="pt-block-content" v-html="netStarColumnText(row,index)">' +
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
													@click="checkboxSelelctHandler" \
												>\
												</label>\
											</div>\
									</template>' +
					'<template v-else-if="columnConfig.columnType === \'btns\'">\
										<div v-html="row[columnConfig.field]" class="pt-btn-group"></div>\
									</template>' +
					'</template>' +
					'</div>' +
					'</div>' +
					'</template>' +
					'<template v-else>' +
					'<table class="pt-grid" :style="domParams.contentTable.style" :id="domParams.contentTable.id">' +
					// '<colgroup>' +
					// 	'<col v-for="columnCofig in columns" :style="columnCofig.styleObj"></col>' +
					// '</colgroup>' +
					'<tbody>' +
					'<tr v-for="(row,index) in rows" :ns-rowindex="index" @click="rowClickHandler" :ns-id="row[idField]" :primaryid="row[ui.parentField]" :nslevel="row.netstarLevel" @dblclick="rowdbClickHandler" :style="row[\'NETSTAR-TRSTYLE\']" :class="[{\'selected\':row.netstarSelectedFlag},{\'tr-disabled\':row[\'NETSTAR-TRDISABLE\']},{\'open\':row.netstarOpen},netstarTreeGridFlag(row),netstarRowStateFlag(row),{\'ns-tips-placeholder\':row\[\'NETSTAR-TIPS-PLACEHOLDER\'\]===true}]">' +
					'<td v-for="columnCofig in columns" \
											:class="[columnCofig.columnType,NetstarTdStateFlag(row,columnCofig)]" \
											:ns-edit-type="[columnCofig.editConfig&&columnCofig.editConfig.type?columnCofig.editConfig.type.toLowerCase():\'\']" \
											:data-content="columnCofig.editConfig&&columnCofig.editConfig.gridPlaceholder?columnCofig.editConfig.gridPlaceholder:(columnCofig.editConfig&&columnCofig.editConfig.placeholder?columnCofig.editConfig.placeholder:columnCofig.editConfig&&columnCofig.editConfig.type==\'business\'?\'点击新增\':\'可输入\')"\
											:ns-editable="columnCofig.editable" \
											:ns-field="columnCofig.field" \
											:style="[NetstarTdStyle(row,columnCofig,index)]" \
											@click="tdClickHandler($event, index, columnCofig, row)">' +
					//第一个默认序列号+ page.start
					'<template v-if="columnCofig.columnType === \'autoserial\' ">' +
					'<template v-if="ui.displayMode !== \'treeGrid\' ">' +
					'{{index + 1 + page.start}}' +
					'</template>' +
					'</template>' +
					//多选
					'<template v-else-if="columnCofig.columnType === \'checkselect\' ">\
												<label \
													class="checkbox-inline" \
													:class="[{\'checked\':row.netstarCheckboxSelectedFlag},{\'disabled\':row[\'NETSTAR-TRDISABLE\']}]" \
													@click="checkboxSelelctHandler" \
												>\
												</label>\
											</template>' +
					//HTML输出
					'<template v-else-if="columnCofig.columnType === \'btns\'">\
												<div v-html="row[columnCofig.field]" class="rowbtns"></div>\
											</template>' +
					//字典输出
					'<template v-else-if="columnCofig.columnType === \'dictionary\'">\
												<span v-html="row[columnCofig.field]"></span>\
											</template>' +
					//超链接输出
					'<template v-else-if="columnCofig.columnType === \'href\'">\
												<a href="javascript:void(0);" @click.self="rowHrefLinkJump" :ns-field="columnCofig.field">{{row[columnCofig.field]}}</a>\
											</template>' +
					'<template v-else-if="columnCofig.columnType === \'switch\'">\
												<span v-html="row[columnCofig.field]"></span>\
											</template>' +
					//列状态输出
					'<template v-else-if="columnCofig.columnType === \'columnstate\'">\
												<span v-html="NetStarColumnStateText(row, columnCofig)"></span>\
												<i :class="[NetstarColumnStateIcon(row, columnCofig)]"></i>\
											</template>' +
					// 字符串替换
					'<template v-else-if="columnCofig.columnType === \'stringReplace\'">\
												<span v-html="row[columnCofig.field]"></span>\
											</template>' +
					// 字符串替换
					'<template v-else-if="columnCofig.columnType === \'subdataText\'">\
												<span v-html="row[columnCofig.field]"></span>\
											</template>' +
					// id替换 下拉框或单选/多选时 保存的是id需要返显name 这种类型会根据该行返显的显示字段显示
					'<template v-else-if="columnCofig.columnType === \'textFieldReplace\'">\
												<span v-html="row[columnCofig.field]"></span>\
											</template>' +
					//树节点输出
					'<template v-else-if="columnCofig.isTreeNode === true">\
						<a href="javascript:void(0);" @click.self="rowTreeNodeOpen($event,index)" class="tr-control" :style="row.netstarStyleObj"></a>\
						<span class="pt-td-tree-menu" v-html="row[columnCofig.field]"></span>\
					</template>' +
					// 标准值输出/多值/多维输出
					'<template v-else-if="columnCofig.columnType === \'cubesInput\' && row[columnCofig.field]">\
						<div class="pt-btn-group">\
							<button class="pt-btn pt-btn-default pt-btn-icon" @click.self="cubesInputOpen($event, index, columnCofig, row)">{{row[columnCofig.field]}}</button>\
						</div>\
					</template>' +
					// 生成/预览 pdf
					'<template v-else-if="columnCofig.columnType === \'buildPdf\'">\
						<div class="pt-btn-group">\
							<template v-if="!row[columnCofig.field]&&(typeof(columnCofig.editConfig)!=\'object\'||typeof(columnCofig.editConfig.produceFileAjax)!=\'object\'||typeof(columnCofig.editConfig.produceFileAjax.url)!=\'string\')">\
								\
							</template>\
							<template v-else>\
								<button class="pt-btn pt-btn-default pt-btn-icon" @click.self="buildPdfFunc($event, index, columnCofig, row)">{{row[columnCofig.field] ? row[columnCofig.field]:\"生成\"}}</button>\
							</template>\
						</div>\
					</template>' +
					// 标准值输出/多值/多维输出
					'<template v-else-if="columnCofig.columnType === \'standardInput\' && row[columnCofig.field]">\
						<div class="pt-btn-group">\
							<button class="pt-btn pt-btn-default pt-btn-icon" @click.self="standardInputOpen($event, index, columnCofig, row)">{{row[columnCofig.field]}}</button>\
						</div>\
					</template>' +
					// formatHandler
					'<template v-else-if="columnCofig.columnType === \'func\'">\
						<div class="pt-func" v-html="row[columnCofig.field]"></div>\
					</template>' +
					// thumb cy20200301 修改为支持ids
					'<template v-else-if="columnCofig.columnType === \'thumb\'">\
						<span v-for="item in row[\'NETSTAR-FILEURL-\' + columnCofig.field]">\
							<img class="pt-thumb" :src="row[columnCofig.field]" :data-original="item" />\
						</span>\
					</template>' +
					// renderField
					'<template v-else-if="columnCofig.columnType === \'renderField\'">\
						<div class="pt-renderField" v-html="row[columnCofig.field]"></div>\
					</template>' +
					// placeholder
					'<template v-else-if="columnCofig.columnType === \'placeholder\'">\
						<div class="pt-placeholder" v-html="row[columnCofig.field]"></div>\
					</template>' +
					'<template v-else-if="columnCofig.columnType === \'htmlRender\'">\
						<div class="pt-placeholder" v-html="row[columnCofig.field]"></div>\
					</template>' +
					//json数据转list表格
					'<template v-else-if="columnCofig.columnType === \'jsonToList\' && row[columnCofig.field]">\
						<div class="pt-btn-group">\
							<button class="pt-btn pt-btn-default pt-btn-icon" @click.self="jsonToListByClick($event, index, columnCofig, row)">查看</button>\
						</div>\
					</template>' +
					//正常输出
					'<template v-else>' +
					'{{row[columnCofig.field]}}' +
					'</template>' +

					'</td>' +
					'</tr>' +
					'</tbody>' +
					'</table>' +
					'</template>' +
					'</div>',
				//横向滚动条
				SCROLLX: '<div nsgirdcontainer="grid-body-scroll-x"  @scroll = "scrollXContentTable" :style="domParams.scrollX.containerStyle" >' +
					'<div class="grid-body-scroll-x-div" :id="domParams.scrollX.id" :style="domParams.scrollX.style"></div>' +
					'</div>',
				//纵向滚动条
				SCROLLY: '<div nsgirdcontainer="grid-body-scroll-y"  @scroll = "scrollYContentTable" :style="domParams.scrollY.containerStyle" >' +
					'<div class="grid-body-scroll-y-div" :id="domParams.scrollY.id" :style="domParams.scrollY.style"></div>' +
					'</div>',
				FOOTERTABLE: '<div nsgirdcontainer="grid-body-footertable" class="pt-grid-body-footer" :id="domParams.footerTableContainer.id">' +
					'<table class="pt-grid" :style="domParams.footerTable.style" :id="domParams.footerTable.id">' +
					'<colgroup>' +
					'<col v-for="columnCofig in columns" :style="columnCofig.styleObj">' +
					'</col>' +
					'</colgroup>' +
					'<tbody>' +
					'<tr>' +
					'{{ns-footer-tds}}' + //这句话用于替换为给定的字符串 不使用VUE渲染
					'</tr>' +
					'</tbody>' +
					'</table>' +
					'</div>',
				//行内按钮
				ROWBUTTON: '<button \
					type="button" \
					title="{{text}}" \
					ns-index="{{index}}" \
					onclick="javascript:NetStarGrid.rowBtnsHandler(event, \'{{gridId}}\',this)" \
					class="pt-btn pt-btn-icon pt-btn-default">\
						<span>\
							{{text}}\
						</span>\
				</button>',
				ROWICONBUTTON: '<button \
					type="button" \
					title="{{text}}" \
					ns-index="{{index}}" \
					onclick="javascript:NetStarGrid.rowBtnsHandler(event, \'{{gridId}}\',this)" \
					class="pt-btn pt-btn-default pt-btn-icon">\
						<i class="{{icon}}"></i>\
				</button>',
				//行内删除按钮
				ROWDELETEBUTTON: '<button \
					type="button" \
					title="{{text}}" \
					ns-index="{{index}}" \
					onmouseup="javascript:NetStarGrid.rowBtnsHandler(event, \'{{gridId}}\',this)" \
					class="pt-btn pt-btn-icon pt-btn-default">\
					{{html}}\
				</button>'
			},
			//底部
			FOOTER: {
				CONTAINER: '<div class="pt-panel pt-grid-footer">' +
					'<div class="pt-container">' +
					'<div class="pt-panel-row">' +
					'<div class="pt-panel-col">' +
					//按钮组面板
					'{{BUTTONS}}' +
					'<template v-if="ui.displayMode === \'block\' && ui.isCheckSelect === \'true\'">' +
					'<label class="checkbox-inline" :id="domParams.footerCheckbox.id" onclick="NetStarGrid.userAllSelect(this,\'block\')"></label>' +
					'</template>' +
					'</div>' +
					'<div class="pt-panel-col text-right">' +
					'<div class="pt-pager">' +
					'<div class="pt-form pt-form-inline pt-form-normal">' +
					'<div class="pt-form-body">' +
					'{{TOTALINFO}}' +
					'{{PAGELENGTHMENU}}' +
					'{{PAGES}}' +
					'</div>' +
					'</div>' +
					'</div>' +
					'</div>' +
					'</div>' +
					'</div>' +
					'</div>',
				//按钮容器
				BUTTONS: '<div class="pt-table-btn">' +
					'<div class="pt-btn-group" :id="domParams.footerButtons.id">' +
					//按钮容器
					'</div>' +
					'</div>',
				//合计信息
				TOTALINFO: '<div class="pt-page-conclusion">' +
					'<div class="pt-form-group">' +
					'<label for="name" class="pt-control-label">' +
					//共多少条 多少页
					'{{pageNumberWithMax}}' +
					'</label>' +
					'</div>' +
					'</div>',
				//页面长度控制
				PAGELENGTHMENU: '<div class="pt-page-control">' +
					'<div class="pt-form-group">' +
					'<label for="name" class="pt-control-label">每页/条</label>' +
					'<div class="pt-input-group">' +
					//页面长度的输入和显示框
					'<input :id="domParams.pageLengthInput.id" type="text" class="pt-form-control" placeholder="" :value="domParams.pageLengthInput.value" @keyup.13.stop="inputEnterPageLength">' +
					//页面长度下拉列表展开按钮
					'<div class="pt-input-group-btn">' +
					'<button class="pt-btn pt-btn-default pt-btn-icon" @click="togglePageLengthSelect">' +
					'<i class="icon-arrow-down"></i>' +
					'</button>' +
					'</div>' +
					//页面长度下拉列表
					'<div class="pt-input-group-select" :id="domParams.pageLengthSelect.id" :class="{ show:domParams.pageLengthSelect.isShow }">' +
					'<ul>' +
					'<li \
											v-for="pageLength in domParams.pageLengthSelect.subdata" \
											:ns-data-value="pageLength" \
											:class="{active:pageLength === domParams.pageLengthInput.value}" \
											@click="selectPageLength" \
										>' +
					'{{pageLength}}' +
					'</li>' +
					'</ul>' +
					'</div>' +
					'</div>' +
					'</div>' +
					'</div>',
				//翻页
				PAGES: '<div class="pt-page-turn">' +
					'<div class="pt-btn-group">' +
					//首页
					'<button class="pt-btn pt-btn-icon" @click="toPage(\'first\')">' +
					'<i class="icon-step-backward-o"></i>' +
					'</button>' +
					//向前翻页
					'<button class="pt-btn pt-btn-icon" @click="toPage(\'prev\')">' +
					//'<i class="fa fa-chevron-left"></i>' +
					'<i class="icon-arrow-left-o"></i>' +
					'</button>' +
					'</div>' +
					'<div class="pt-form-group">' +
					//跳转页面
					'<label for="name" class="pt-control-label">第</label>' +
					'<div class="pt-input-group">' +
					//跳转页面输入框
					'<input type="text" class="pt-form-control" placeholder="" :id="domParams.toPageInput.id" :value="domParams.toPageInput.value" @keyup.13="inputEnterToPage">' +
					//跳转页面下拉框
					'<div class="pt-input-group-btn" @click="toggleToPageSelect">' +
					'<button class="pt-btn pt-btn-default pt-btn-icon">' +
					'<i class="icon-arrow-down"></i>' +
					'</button>' +
					'</div>' +
					//跳转页面下拉列表
					'<div class="pt-input-group-select" :id="domParams.toPageSelect.id" :class="{ show:domParams.toPageSelect.isShow }">' +
					'<ul>' +
					'<li \
											v-for="pageNumber in domParams.toPageSelect.subdata" \
											:ns-data-value="pageNumber" \
											:class="{active:pageNumber === domParams.toPageInput.value}" \
											@click="selectToPage"\
										>' +
					'{{pageNumber}}' +
					'</li>' +
					'</ul>' +
					'</div>' +
					'</div>' +
					'<label for="name" class="pt-control-label">页</label>' +
					'</div>' +
					'<div class="pt-btn-group">' +
					//向后翻页
					'<button class="pt-btn pt-btn-icon" @click="toPage(\'next\')">' +
					'<i class="icon-arrow-right-o"></i>' +
					//'<i class="fa fa-chevron-right"></i>' +
					'</button>' +
					//尾页
					'<button class="pt-btn pt-btn-icon" @click="toPage(\'last\')">' +
					'<i class="icon-step-forward-o"></i>' +
					'</button>' +
					'</div>' +
					'</div>',
			},
		},
		MOBILE: {

		}
	}
	var vueTemplate = NetStarUtils.getTemplate(TEMPLATE);
	// 工作项配置状态配置
	var workItemStateManage = {
		// 待办
		dealt: {
			0: false,
			1: false,
			2: true,
			3: true,
			4: false,
			5: false,
			16: false,
			32: false,
			128: false,
		},
		// 状态名
		name: {
			4: 'transfer', // 转移
			5: 'file', // 归档
			16: 'delete', // 删除
			128: 'close', // 关闭
		},
		// 行或列状态
		trtd: {
			transfer: 'transfer-message', // 转移
			file: 'file-message', // 归档
			delete: 'delete-message', // 删除
			close: 'close-message', // 关闭
			rollback: 'again-message', // 重办
			emergency: 'emergency-message', // 应急
			suspend: 'suspend-message', // 挂起
			normal: 'normal-message', // 待办
			rollbackType:'rollback-message',//回退 sjj 20200115
		},
		// 图标状态
		icon: {
			transfer: 'icon-transtion-o', // 转移
			file: 'icon-file-check-o', // 归档
			delete: 'icon-trash-o', // 删除
			close: 'icon-close-circle-o', // 关闭
			rollback: 'icon-return', // 重办
			emergency: 'icon-flash', // 应急
			suspend: 'icon-minus-s-o', // 挂起
			normal: 'icon-sitemap', // 待办
			rollbackType:'icon-arrow-left-alt-o',//回退 sjj 20200115
		},
		// 文字状态
		word: {
			transfer: '转移', // 转移
			file: '归档', // 归档
			delete: '删除', // 删除
			close: '关闭', // 关闭
			rollback: '重办', // 重办
			emergency: '应急', // 应急
			suspend: '挂起', // 挂起
			normal: '待办', // 待办
			rollbackType:'回退',//回退 sjj 20200115
		}
	}
	//获取配置参数
	var configManager = {
		configs: {}, //运行时的config
		rawConfigs: {}, //原始的config
		DEFAULT: {
			THMINWIDTH: 20, //thead th的默认最小宽度
			THWIDTH: 80, //thead th的默认宽度
			THPADDING: 5, //thead th的padding（主要指左右），用于自动宽度计算
			THFONTSIZE: 12, //thead th的字体大小（主要指左右），用于自动宽度计算
			SCROLLWIDTH: 8, //主表滚动条的宽度
			HEADERHEIGHT: 34, //头部高度
			FOOTERHEIGHT: 25, //底部高度
			THEADHEIGHT: 31, //标题高度
			FOOTERPADDING: 10, //底部边距
			TOPBOTTOMPADDING: 0, //上下边距
			PADDINGBOTTOM: 8, //距离底部的边距
		},
		//这里都是系统列配置，不允许写其他的配置
		SYSTEMCOLUMNS: {
			//自动序号
			AUTOSERIAL: {
				field: 'NETSTAR-AUTOSERIAL',
				title: '<i class="fa fa-cog" onclick="NetStarGrid.userConfiger(this)" ></i>',
				columnType: 'autoserial',
				isSystemColumn: true,
				editable: false,
				width: 30,
				isResizeWidth: false,
			},
			//复选框
			CHECKSELECT: {
				field: 'NETSTAR-CHECKSELECT',
				title: '<label class="checkbox-inline" onclick="NetStarGrid.userAllSelect(this,\'table\')"></label>',
				columnType: 'checkselect',
				isSystemColumn: true,
				editable: false,
				width: 30,
				isResizeWidth: false,
			},
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
				//isColumn:true,//非列即行 不在某个单元格显示即在整体行上显示
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
		//设置默认值，只修改运行时config，不修改原始config
		setDefault: function (_gridConfig) {
			//有两个最基本的验证 必须包含data:object参数和columns:array参数
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
				type: 'POST', //Ajax.type
				data: {},
				dataSrc: 'rows', //默认的dataSrc
				isServerMode: false, //默认不打开服务器端模式
			}
			_gridConfig.data = NetStarUtils.getDefaultValues(_gridConfig.data, dataDefaultConfig);

			//把column根据id重新整理
			var columnById = {};
			var isNeedRowData = false;
			var treenodeIndex = -1;
			var treenodeTitle = '';
			for (var i = 0; i < _gridConfig.columns.length; i++) {
				var columnConfig = _gridConfig.columns[i];
				if (columnConfig.field) {
					columnById[columnConfig.field] = columnConfig;
				}
				if (typeof (columnConfig.editConfig) == "object" && columnConfig.editConfig.type == "business") {
					isNeedRowData = true;
					//sjj 20200115 如果自行配置了false属性
					if(typeof(columnConfig.editConfig.isNeedRowData)=='boolean'){
						isNeedRowData = columnConfig.editConfig.isNeedRowData;
					}
					if(columnConfig.editConfig.isNeedRowData == 'false'){
						columnConfig.editConfig.isNeedRowData = false;
						isNeedRowData = false;
					}
				}
				if ((!columnConfig.columnType || columnConfig.columnType == "text") && columnConfig.editConfig && columnConfig.editConfig.type == "business" && columnConfig.editConfig.isShowPlaceholder !== false) {
					columnConfig.columnType = 'placeholder';
				}

				//sjj 20191107 当前列如果是作为树节点展开关闭的操作列
				var isTreeNode = typeof (columnConfig.isTreeNode) == 'boolean' ? columnConfig.isTreeNode : false;
				if (isTreeNode) {
					treenodeIndex = i;
					treenodeTitle = columnConfig.chineseName;
				}
				if (treenodeIndex > -1) {
					_gridConfig.columns[treenodeIndex].title = '<div class="rowbtns tree-control-btns">' +
						'<button type="button" class="pt-btn" onclick=NetStarGrid.treeOpenHandler(this,"' + _gridConfig.id + '",true)><i class="icon-list-open"></i></button>' +
						'<button type="button" class="pt-btn" onclick=NetStarGrid.treeOpenHandler(this,"' + _gridConfig.id + '",false)><i class="icon-list-close"></i></button>' +
						'</div>' +
						'<label class="treenode-title">' + treenodeTitle + '</label>';

				}
			}
			for (var i = 0; i < _gridConfig.columns.length; i++) {
				var columnConfig = _gridConfig.columns[i];
				columnConfig.isNeedRowData = isNeedRowData;
			}

			_gridConfig.columnById = columnById;

			//ui默认配置
			var uiDefalutConfig = {
				isAutoSerial: true, //是否自动计算序列号
				isCheckSelect: false, //多选复选框
				isUseMessageState: false, //是否使用消息状态
				isHeader: false,
				height: 200,
				isEditMode: false, //编辑模式
				isHaveEditDeleteBtn: false, //编辑模式下是否有删除按钮
				isAllowAdd: true, //是否允许新增
				isUseHotkey: true, //是否使用快捷键 默认开启
				isPage: true, //是否分页
				pageLengthMenu: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 100, 200, 500, 1000, 2000], //每页多少
				pageLengthDefault: 20, //默认分页数量
				toPageDefault: 1, //默认第几页
				toPageMenu: [1], //默认只有一个分页
				isPreferContainerHeight: true, // 是否优先读取容器高度
				isReadStore: true, // 是否读取本地存储 默认是
				displayMode: 'table', //默认是表格展现形式，共有两种 table,block
				dragWidth: true, //是否支持列拖拽默认true不支持，可以通过设置false来支持
				styleExpress: {}, //sjj 20190805 设置样式（行，列，单元格）
				isOpenQuery: false, //是否开启查询
				isOpenAdvanceQuery: false, //是否开启高级查询
				isOpenFormQuery: false, //是否开启展开查询
				isShowHead:false,//是否显示标题头
				labelpageVmById:{},//sjj 20200111 界面是否以新标签打开取决于是否已经有id
			}
			_gridConfig.ui = NetStarUtils.getDefaultValues(_gridConfig.ui, uiDefalutConfig);
			if (_gridConfig.ui.isUseMessageState) {
				configManager.SYSTEMCOLUMNS.MSGSTATE.isColumn = true;
			}
			//sjj 20190311 如果是块状表格且开启了多选 则有标题
			if (_gridConfig.ui.isCheckSelect == true) {
				_gridConfig.ui.isShowTitle = true;
			}
			//是否开启了查询
			if (_gridConfig.ui.isOpenQuery || _gridConfig.ui.isOpenAdvanceQuery || _gridConfig.ui.isOpenFormQuery) {
				_gridConfig.ui.query = NetStarUtils.getListQueryData(_gridConfig.columns, {
					id: _gridConfig.id,
					value:_gridConfig.ui.quicklyQueryColumnValue
				})
			}
			var titleStr = _gridConfig.ui.title ? _gridConfig.ui.title : '';
			if(titleStr == ''){_gridConfig.ui.isShowHead = false;}
		},
		//获取配置
		getConfig: function (_gridConfig) {

			var gridConfig = $.extend(true, {}, _gridConfig);
			this.setDefault(gridConfig);

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
				return false;
			} else {
				//添加自定义标签和class
				gridConfig.$container.attr({
					"nsgirdpanel": "grid-el"
				});
				gridConfig.$container.addClass('nsgrid');
				if (gridConfig.ui.displayMode == 'block') {
					gridConfig.$container.addClass('nsgrid-block');
				}
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
				footerTable: {
					id: girdId + '-footertable',
					style: {},
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
				//每页多少条的输入框
				pageLengthInput: {
					id: girdId + '-pagelength-input',
					value: gridConfig.ui.pageLengthDefault, //默认分页 每页多少条

				},
				//每页多少条的select
				pageLengthSelect: {
					id: girdId + '-pagelength-select',
					subdata: gridConfig.ui.pageLengthMenu, //可选分页数量
					isShow: false, //是否隐藏select
				},
				//当前页的输入框
				toPageInput: {
					id: girdId + '-topage-input',
					value: gridConfig.ui.toPageDefault, //默认分页 每页多少条

				},
				//当前页的select
				toPageSelect: {
					id: girdId + '-topage-select',
					subdata: gridConfig.ui.toPageMenu, //可选分页数量
					isShow: false, //是否隐藏select
				},
				//拖拽
				dragContainer: {
					id: girdId + '-drag',
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
			gridConfig.dragColumns = this.getDragColumnsConfig(gridConfig); //sjj 20190319 添加拖拽列
			return gridConfig;
		},
		//config.data
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
			if (!$.isEmptyObject(_gridConfig.ui.orderDefaultData)) {
				//存在默认排序字段的参数
				nsVals.extendJSON(dataConfig.data, _gridConfig.ui.orderDefaultData);
			}
			if (dataConfig.isServerMode) {
				//sjj 开启了服务端翻页
				nsVals.extendJSON(dataConfig.data, {
					start: 0,
					length: _gridConfig.ui.pageLengthDefault
				});
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
		//获取排序类型
		getOrderType: function (columnConfig) {
			// var orderable = typeof (columnConfig.orderable) == 'boolean' ? columnConfig.orderable : false;//默认false 
			var orderable = typeof (columnConfig.orderable) == 'boolean' ? columnConfig.orderable : true; //默认true  lyw 20190506
			var orderType = orderable ? 'default' : '';
			if (columnConfig.orderType) {
				orderType = columnConfig.orderType;
			}
			return orderType;
		},
		//获取column.width
		getColumnWidth: function (columnConfig) {
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
		// 处理columns配置参数
		getColumnsConfig: function (_gridConfig) {
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
			// 通过本地存储的排序和隐藏重新排序列
			var isReadStore = typeof (_gridConfig.isReadStore) == "boolean" ? _gridConfig.isReadStore : true;
			if (isReadStore) {
				var storeId = _gridConfig.id;
				/*******************sjj 20190917 start */
				/***
				 * sjj 2019 0917 添加判断 如果模板页支持多开 
				 * 表格id是根据包名生成的，这样同一个表格会出现多个id，
				 * 但由于配置相同 所以需要给本地存储的时候按一个id去存储
				 */
				if (_gridConfig.package) {
					var packageNameSplit = _gridConfig.package.split('.');
					//判断最后一个是否是时间戳
					var lastPackageStr = packageNameSplit[packageNameSplit.length - 1];
					if (Number(lastPackageStr) && typeof(_gridConfig.templateId) == "string") {
						if (_gridConfig.templateId.indexOf(lastPackageStr) > -1) {
							storeId = _gridConfig.templateId.substring(0, _gridConfig.templateId.length - lastPackageStr.length - 1) + _gridConfig.id.substring(_gridConfig.id.indexOf('-list'));
						} else {
							storeId = _gridConfig.templateId + _gridConfig.id.indexOf('-list');
						}
					}
				}
				/*******************sjj 20190917 end */
				// var storeColumnsData = store.get('cw-'+storeId);
				var storeColumnsData = store.get(storeId);
				if(typeof(storeColumnsData)=='undefined'){
					storeColumnsData = store.get(storeId);
				}
				if(typeof(storeColumnsData)=='undefined'){
					storeColumnsData = store.get(_gridConfig.id);
				}
				_columnsConfig = NetstarComponent.tableColumnManager.getColumnsConfigByStore(_columnsConfig, storeColumnsData);
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

			//sjj 20190318 从缓存中读取是否有列宽配置项 前提是开启了列宽拖拽
			var storageData = {
				field: {}
			};
			if (_gridConfig.ui.dragWidth) {
				var storeId = _gridConfig.id;
				/*******************sjj 20190917 start */
				/***
				 * sjj 2019 0917 添加判断 如果模板页支持多开 
				 * 表格id是根据包名生成的，这样同一个表格会出现多个id，
				 * 但由于配置相同 所以需要给本地存储的时候按一个id去存储
				 */
				if (_gridConfig.package) {
					var packageNameSplit = _gridConfig.package.split('.');
					//判断最后一个是否是时间戳
					var lastPackageStr = packageNameSplit[packageNameSplit.length - 1];
					if (Number(lastPackageStr) && typeof(_gridConfig.templateId) == "string") {
						if (_gridConfig.templateId.indexOf(lastPackageStr) > -1) {
							storeId = _gridConfig.templateId.substring(0, _gridConfig.templateId.length - lastPackageStr.length - 1) + _gridConfig.id.substring(_gridConfig.id.indexOf('-list'));
						} else {
							storeId = _gridConfig.templateId + _gridConfig.id.indexOf('-list');
						}
					}
				}
				/*******************sjj 20190917 end */
				storageData = store.get('cw-' + storeId);
				if ($.isEmptyObject(storageData)) {
					storageData = {
						field: {}
					};
				}
			}
			var orderDefaultData = {}; //sjj 20190320 默认排序参数
			var isEditMode = _gridConfig.ui.isEditMode; //sjj 20190403 是否可编辑
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
				if (!isEditMode) {
					columnConfig.editable = isEditMode;
				}
				//获取columnType 新编辑器直接产生此参数，老配置方法需要转换
				columnConfig.columnType = this.getColumnType(columnConfig);
				columnConfig.orderType = this.getOrderType(columnConfig); //sjj 20190318 添加排序
				columnConfig.isResizeWidth = typeof (columnConfig.isResizeWidth) == 'boolean' ? columnConfig.isResizeWidth : true; //sjj 20190319 默认支持拖拽
				switch (columnConfig.orderType) {
					case 'asc':
						orderDefaultData = {
							orderField: columnConfig.field,
							orderType: 'asc'
						};
						break;
					case 'desc':
						orderDefaultData = {
							orderField: columnConfig.field,
							orderType: 'desc'
						};
						break;
				}
				//如果是自动计算宽度的column则加入到autoColumn中等待后续处理
				if (columnConfig.width == 'auto') {
					autoColumns.push(columnConfig);
				}

				//计算单元格宽度
				var columnWidth = this.getColumnWidth(columnConfig);
				if (storageData.field[columnConfig.field]) {
					//如果当前列存在于缓存中数据则列宽需要从缓存中读取配置 sjj 20190318
					columnWidth = storageData.field[columnConfig.field].w;
				}
				if (columnConfig.hidden == true) {
					// 如果是隐藏的
				} else {
					tableTotalWidth += columnWidth; //加入到总宽度 自动计算的加入的是0 到后面重新计算添加
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
				columnConfig.isTreeNode = typeof (columnConfig.isTreeNode) == 'boolean' ? columnConfig.isTreeNode : false;
			}
			_gridConfig.ui.orderDefaultData = orderDefaultData; //sjj 20190320 存储默认排序的配置参数
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
							var isIcon = false;
							if(btns[btnI].functionConfig){
								if(btns[btnI].functionConfig.icon){
									isIcon = true;
								}
							}
							if(isIcon == false){
								btnColumnWidth += btns[btnI].text.length * 15;
							}else{
								btnColumnWidth += 15;	
							}
							btnColumnWidth += 28;
							if (btnI > 0) {
								btnColumnWidth += 5;
							}
						}
						btnsColumn.width = btnColumnWidth;
						btnsColumn.styleObj = {
							'min-width': btnColumnWidth + 'px',
							'width': btnColumnWidth + 'px'
						};
						_columnsConfig.unshift(btnsColumn);
						tableTotalWidth += btnColumnWidth;
					} else {
						delete _gridConfig.ui.tableRowBtns
					}
				} else {
					delete _gridConfig.ui.tableRowBtns;
				}
			}
			//是否有列状态 sjj20190118 
			if (_gridConfig.ui.isUseMessageState) {
				//if(configManager.SYSTEMCOLUMNS.MSGSTATE.isColumn){
				var messageColumn = $.extend(true, {}, this.SYSTEMCOLUMNS.MSGSTATE.data);
				messageColumn.styleObj = {
					'min-width': messageColumn.width + 'px',
					'width': messageColumn.width + 'px'
				};
				_columnsConfig.unshift(messageColumn);
				tableTotalWidth += messageColumn.width;
				//}
			}

			//是否有选中列
			if (_gridConfig.ui.isCheckSelect) {
				//自动序列号
				var checkSelectColumn = $.extend(true, {}, this.SYSTEMCOLUMNS.CHECKSELECT);
				checkSelectColumn.styleObj = {
					'min-width': checkSelectColumn.width + 'px',
					'width': checkSelectColumn.width + 'px'
				};
				_columnsConfig.unshift(checkSelectColumn);
				tableTotalWidth += checkSelectColumn.width;
			}

			//自动序号列
			if (_gridConfig.ui.isAutoSerial) {
				//自动序列号
				var autoSerialColumn = $.extend(true, {}, this.SYSTEMCOLUMNS.AUTOSERIAL);
				autoSerialColumn.styleObj = {
					'min-width': autoSerialColumn.width + 'px',
					'width': autoSerialColumn.width + 'px'
				};
				_columnsConfig.unshift(autoSerialColumn);
				tableTotalWidth += autoSerialColumn.width;
				//如果有合计则这里显示合计文字
			}

			//行编辑模式下存在删除按钮 sjj20190121 
			//if(_gridConfig.ui.isEditMode){
			//编辑模式
			if (_gridConfig.ui.isHaveEditDeleteBtn) {
				var deleteColumn = $.extend(true, {}, this.SYSTEMCOLUMNS.ROWDELETEBUTTON);
				deleteColumn.styleObj = {
					'min-width': deleteColumn.width + 'px',
					'width': deleteColumn.width + 'px'
				};
				//_columnsConfig.push(deleteColumn);
				_columnsConfig.splice(1, 0, deleteColumn);
				tableTotalWidth += deleteColumn.width;
			}
			//_gridConfig.ui.isHaveEditDeleteBtn = true;  //有删除按钮
			//}
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
		//处理含有拖拽列的配置参数 sjj 20190319 
		getDragColumnsConfig: function (_gridConfig) {
			var dragColumns = [];
			//columns参数必须存在
			var columnArray = _gridConfig.columns;
			if ($.isArray(columnArray) == false) {
				if (debugerMode) {
					console.error('表格Grid配置参数错误，columns应当是数组');
					console.error(_gridConfig);
				}
				return [];
			}
			//var moveDragWidth = -1; // 移动的距离
			var moveDragWidth = 0;//移动的距离
			var lineDragNumber = -1;//表格的线有几条 排除开始和结束
			for (var columnI = 0; columnI < columnArray.length; columnI++) {
				var columnData = columnArray[columnI];
				moveDragWidth += columnData.width; //当前移动的宽度
				lineDragNumber++;
				if (columnData.isResizeWidth) {

					//开启了拖拽列
					var leftWidth = moveDragWidth - columnI;
					columnData.left = leftWidth;
					columnData.dragStyleObj = {
						'left': leftWidth + 'px'
					};
					dragColumns.push(columnData);
				}
			}
			return dragColumns;
		},
		//处理ui配置参数
		getUIConfig: function (_gridConfig) {
			var uiConfig = _gridConfig.ui;
			//20200107 添加是否允许复制参数的定义
			uiConfig.isAllowCopy = typeof(uiConfig.isAllowCopy)=='boolean' ? uiConfig.isAllowCopy : true;//20200107 添加是否允许复制参数的定义
			if(uiConfig.isEditMode){
				uiConfig.isAllowCopy = false;//20200107 添加是否允许复制参数的定义
			}
			var commonTableHeight =
				//configManager.DEFAULT.HEADERHEIGHT + 
				configManager.DEFAULT.THEADHEIGHT +
				configManager.DEFAULT.TOPBOTTOMPADDING;
			//configManager.DEFAULT.FOOTERHEIGHT;
			if (!$.isEmptyObject(uiConfig.query)) {
				commonTableHeight += configManager.DEFAULT.HEADERHEIGHT;
			}
			if(uiConfig.isShowHead){
				commonTableHeight += 30;
			}
			if (uiConfig.isPage) {
				commonTableHeight += configManager.DEFAULT.FOOTERHEIGHT;
			}
			if (typeof (uiConfig.isThead) == 'boolean') {
				if (uiConfig.isThead == false) {
					commonTableHeight -= configManager.DEFAULT.THEADHEIGHT;
				}
			}
			var containerTableHeight = _gridConfig.ui.height - commonTableHeight;

			//表格容器和scrollY的高
			_gridConfig.domParams.contentTableContainer.style.height = containerTableHeight + 'px';
			_gridConfig.domParams.scrollY.style.height = containerTableHeight + 28 + 'px';
			//给三个表格的style添加 width
			_gridConfig.domParams.headerTable.style.width = _gridConfig.ui.tableWidth + 'px';
			if (uiConfig.displayMode != 'block') {
				_gridConfig.domParams.contentTable.style.width = _gridConfig.ui.tableWidth + 'px';
			}
			_gridConfig.domParams.footerTable.style.width = _gridConfig.ui.tableWidth + 'px';
			_gridConfig.domParams.scrollX.style.width = _gridConfig.ui.tableWidth + 'px';

			//判断是否需要横向滚动条
			var isUse = _gridConfig.ui.tableWidth > _gridConfig.ui.containerWidth;
			if (uiConfig.displayMode == 'block') {
				isUse = false;
			}
			_gridConfig.domParams.scrollX.isUse = isUse;
			if (isUse == false) {
				_gridConfig.domParams.scrollX.containerStyle = {
					visibility: "hidden",
				}
			} else {
				_gridConfig.domParams.scrollX.containerStyle = {
					visibility: "visible",
				}
				//如果横向滚动条可见，则需要容器增加padding
				if (_gridConfig.ui.footerColumns) {
					//sjj 20190408如果有合计列则距离底部应该是行高的距离
					configManager.DEFAULT.PADDINGBOTTOM = 28;
				}
				if (_gridConfig.ui.displayMode == 'block') {

				} else {
					_gridConfig.domParams.contentTableContainer.style['padding-bottom'] = configManager.DEFAULT.PADDINGBOTTOM + 'px';
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
			// lyw 统一配置 以下配置之前是在获取行数据方法中的 getRowData
			//是否有编辑状态下的删除按钮
			if (_gridConfig.ui.isHaveEditDeleteBtn) {
				//插入当前删除按钮事件到按钮组中
				if ($.isArray(_gridConfig.ui.tableRowBtns) == false) {
					_gridConfig.ui.tableRowBtns = [];
				}

				var btnConfig = {
					text: 'X',
					handler: function (data) {
						NetStarGrid.delRow(data.rowData, data.gridId, data.rowIndex);
					},
					index: _gridConfig.ui.tableRowBtns.length.toString(),
					gridId: _gridConfig.id,
					html: '<span>X</span>',
					field : 'NETSTAR-DELETE',
				};
				//sjj 20190315 根据当前显示形式修改
				if (_gridConfig.ui.displayMode == 'block') {
					btnConfig.html = '<i class="icon-close"></i><span></span>';
				}
				//sjj 20190312 如果当前ui中deleteajax存在 则走ajax调用执行方法
				if (!$.isEmptyObject(_gridConfig.ui.deleteAjax)) {
					btnConfig.handler = function (data) {
						NetstarBlockList.deleteAjaxRow(data);
					}
				}
				//插入当前删除按钮事件到按钮组中
				_gridConfig.ui.tableRowBtns.push(btnConfig);
				// var btnsHtml = NetStarUtils.getTemplateHtml(vueTemplate.BODY.ROWDELETEBUTTON, btnConfig, false);
				// rowData['NETSTAR-DELETE'] = btnsHtml;
			}
			return uiConfig;
		}
	}
	//数据配置参数
	var dataManager = {
		getServerModeData: function (_gridConfig) {
			if (_gridConfig.data.isServerMode) {
				if(typeof(_gridConfig.ui.refreshGridHandler)=='function'){
					//自定义了刷新方法
					_gridConfig.ui.refreshGridHandler(_gridConfig);
				}else{
					NetStarGrid.refreshById(_gridConfig.id);
				}
			}
		}, //获取服务端数据
		//设置gird的数据源 
		resetData: function (tableRowsData, gridId, displayMode) {
			//tableRowsData:array [{id:'',value:""},{....}] 整个表格的所有行数据
			//gridId:string gird的id
			var grid = NetStarGrid.configs[gridId];
			displayMode = displayMode ? displayMode : ''; //sjj 20190311 是否定义了显示类型
			switch (displayMode) {
				case 'block':
					//sjj 20190311
					grid = NetstarBlockList.configs[gridId];
					break;
			}
			if (typeof (grid) != 'object') {
				console.error('id:' + gridId + ' 找不到相关配置文件，请核实');
			} else {
				//更新原始数据 并渲染来自于监视器
				grid.gridConfig.data.dataSource = tableRowsData;
				grid.vueConfig.data.originalRows = tableRowsData;
				var pageLength = grid.gridConfig.ui.pageLengthDefault;
				var tableRowsLength = tableRowsData.length;
				if (grid.gridConfig.data.isServerMode) {
					//服务端翻页 sjj20190402
					if(!$.isEmptyObject(grid.gridConfig.domParams.serverData)){
						tableRowsLength = Number(grid.gridConfig.domParams.serverData.total);
					}
				}
				var pageNumber = Math.ceil(tableRowsLength / pageLength);
				grid.vueConfig.data.pageNumberWithMax = i18n.pageNumberWithMax.replace(/_PAGES_/g, pageNumber).replace(/_MAX_/g, tableRowsLength);
			}
		},
		//编辑行数据
		editRow: function (rowData, gridId, editRowIndex) {
			//不存在主键id的情况此方法走不通
			var grid = NetStarGrid.configs[gridId];
			if (typeof (grid) == 'undefined') {
				grid = NetstarBlockList.configs[gridId];
			}
			if (typeof (grid) != 'object') {
				console.error('id:' + gridId + ' 找不到相关配置文件，请核实');
			} else {
				//更新原始数据 渲染来自于监视器
				var originalRows = grid.vueConfig.data.originalRows; //返回的总数据
				var rows = grid.vueConfig.data.rows; //当前显示的行数据
				var idField = grid.gridConfig.data.idField;
				var editNsIndex = -1;
				var originalStartI = 0;
				var startI = 0;
				if (grid.gridConfig.data.isServerMode == false) {
					startI = grid.vueConfig.data.page.start;
				}
				if (typeof (editRowIndex) == 'number') {
					editNsIndex = editRowIndex;
					originalStartI = editNsIndex + startI;
				} else {
					//存在主键id的情况下可以这么走编辑  
					for (var i = 0; i < rows.length; i++) {
						var data = rows[i];
						if (originalRows[i + startI]) {
							//当前显示的值存在于原始数据值当中
							if (data[idField] == rowData[idField]) {
								editNsIndex = i;
								originalStartI = i + startI;
								break;
							}
						}
					}
				}
				if (editNsIndex > -1) {
					$.each(rowData, function (key, value) {
						var columnConfig = grid.gridConfig.columnById[key];
						if (typeof (columnConfig) == 'object') {
							//有可能需要处理的数据
							rows[editNsIndex][key] = NetStarGrid.dataManager.getValueByColumnType(rowData[key], rowData, columnConfig);
						} else {
							//没有配置， 这些是不用处理的数据
							rows[editNsIndex][key] = rowData[key];
						}
					});
					originalRows[originalStartI] = rowData;
					grid.vueConfig.data.originalRows = $.extend(true, [], originalRows)
					// nsVals.extendJSON(originalRows[originalStartI],rowData);
				}
			}
		},
		//根据字段和值获取当前操作的数据
		getDataByFieldAndValue: function (gridId, fieldKey, fieldValue) {
			//gridId:string gird的id
			//fieldKey:字段名称
			//fieldValue 字段值
			//不存在主键id的情况此方法走不通
			var grid = NetStarGrid.configs[gridId];
			var rowData = {};
			if (typeof (grid) != 'object') {
				console.error('id:' + gridId + ' 找不到相关配置文件，请核实');
			} else {
				var originalRows = grid.vueConfig.data.originalRows; //返回的总数据
				var idField = grid.gridConfig.data.idField;
				var dataNsIndex = -1;
				for (var i = 0; i < originalRows.length; i++) {
					if (originalRows[i][fieldKey] == fieldValue) {
						dataNsIndex = i;
						break;
					}
				}
				if (dataNsIndex > -1) {
					rowData = originalRows[dataNsIndex];
				} else {
					console.warn(fieldKey + "::" + fieldValue);
				}
			}
			return rowData;
		},
		//设置当前操作的值根据字段和值
		setDataByFieldAndValue: function (gridId, fieldKey, fieldValue, rowData) {
			//gridId:string gird的id
			//fieldKey:字段名称
			//fieldValue 字段值
			//data 当前值
			var grid = NetStarGrid.configs[gridId];
			if (typeof (grid) != 'object') {
				console.error('id:' + gridId + ' 找不到相关配置文件，请核实');
			} else {
				var originalRows = grid.vueConfig.data.originalRows; //返回的总数据
				var rows = grid.vueConfig.data.rows; //当前显示的行数据
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
						if (data[fieldKey] == fieldValue) {
							dataNsIndex = i;
							originalNsIndex = i + startI;
							break;
						}
					}
				}
				if (dataNsIndex > -1) {
					$.each(rowData, function (key, value) {
						//获取column配置
						var columnConfig = grid.gridConfig.columnById[key];
						if (typeof (columnConfig) == 'object') {
							//有可能需要处理的数据
							rows[dataNsIndex][key] = NetStarGrid.dataManager.getValueByColumnType(rowData[key], rowData, columnConfig);
						} else {
							//没有配置， 这些是不用处理的数据
							rows[dataNsIndex][key] = rowData[key];
						}
					});

					/************************* lyw start 行状态************************/
					rows[dataNsIndex]['NETSTAR-MSGSTATE'] = dataManager.getRowState(rowData);
					/************************* lyw end 行状态************************/
					nsVals.extendJSON(originalRows[originalNsIndex], rowData);
				}
			}
		},
		//添加行数据
		addRow: function (rowData, gridId, index) {
			//tableRowsData:array [{id:'',value:""},{....}] 整个表格的所有行数据
			//gridId:string gird的id
			//index:number  插入的位置，默认 0 是插入到最开始， -1是插入到最后
			var insertIndex = index ? index : 0;
			var grid = NetStarGrid.configs[gridId];
			if (typeof (grid) == 'undefined') {
				grid = NetstarBlockList.configs[gridId];
			}
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
		//获取全部渲染后的行数据，
		getRows: function (_rows, _gridConfig) {
			//_rows : array 原始行数据
			//return array 渲染后的行数据
			var rows = [];
			/*******lyw通过行按钮设置行数据参数20200310 start******/
			// 设置行内按钮数据 原来在getRowData方法中，现在整体赋值
			// 原因NetStarUtils.getTemplateHtml方法花费时间太长没有必要每一行都执行，所有行都一样
			var btns = _gridConfig.ui.tableRowBtns;
			var deleteHtml = ''; // 删除按钮
			var commonBtnsHtml = ''; // 普通功能按钮
			if ($.isArray(btns) && btns.length) {
				//ROWBUTTON
				for (var btnI = 0; btnI < btns.length; btnI++) {
					var btnConfig = btns[btnI];
					btnConfig.index = btnI.toString(); //由于是字符串替换所以要转成数字
					btnConfig.gridId = _gridConfig.id;
					var ROWBUTTONHTML = vueTemplate.BODY.ROWBUTTON;
					if (btnConfig.functionConfig) {
						if (btnConfig.functionConfig.icon) {
							btnConfig.icon = btnConfig.functionConfig.icon;
							ROWBUTTONHTML = vueTemplate.BODY.ROWICONBUTTON;
						}
					}
					var _btnsHtml = NetStarUtils.getTemplateHtml(ROWBUTTONHTML, btnConfig, false);
					// btnsHtml += NetStarUtils.getTemplateHtml(ROWBUTTONHTML, btnConfig, false);
					switch(btnConfig.field){
						case 'NETSTAR-DELETE':
							deleteHtml = _btnsHtml;
							break;
						default:
							commonBtnsHtml += _btnsHtml;
							break;
					}
				}
			}
			/*******lyw通过行按钮设置行数据参数20200310 end******/
			for (var i = 0; i < _rows.length; i++) {
				if (typeof (_rows[i]) != 'object') {
					continue;
				}
				var rowData = this.getRowData(_rows[i], _gridConfig);
				rowData.netstarEmptyRowFlag = false; //是否是空行标识
				if(deleteHtml.length > 0){
					rowData['NETSTAR-DELETE'] = deleteHtml;
				}
				if(commonBtnsHtml.length > 0){
					rowData['NETSTAR-BTNS'] = commonBtnsHtml;
				}
				rows.push(rowData);
			}
			//如果是编辑模式至少要有一个空行 且编辑模式不分页
			if (_gridConfig.ui.isEditMode) {
				if (_gridConfig.ui.isAllowAdd) {
					//判断时候需要添加新的空行：
					//如果当前是编辑模式且不可用空行，则添加一个空行
					rows.push({
						netstarEmptyRowFlag: true
					});
				}
			}

			function setAllowClick() {
				if (_gridConfig.ui.isEditMode) {
					var columnById = _gridConfig.columnById;
					var isSetTips = false;
					for (var fieldId in columnById) {
						// if (columnById[fieldId].editable && columnById[fieldId].editConfig && columnById[fieldId].editConfig.type == "business" && columnById[fieldId].editConfig.isShowPlaceholder !== false) {
						if (columnById[fieldId].editable && columnById[fieldId].editConfig) {
							isSetTips = true;
							for (var dataI = 0; dataI < rows.length; dataI++) {
								// if (!rows[dataI][fieldId]) {
								// 	// rows[dataI][fieldId] = '<span class="pt-placeholder-span">可点击</span>';
								// 	rows[dataI]["NETSTAR-TIPS-BUSINESS"] = true;
								// }
								if (rows[dataI].netstarEmptyRowFlag) {
									// rows[dataI]["NETSTAR-TIPS-BUSINESS"] = true;
									rows[dataI]["NETSTAR-TIPS-PLACEHOLDER"] = true;
									break;
								}
							}
						}
						if(isSetTips){
							break;
						}
					}
				}
			}
			//如果没定义最小显示条数 结束返回
			if (typeof (_gridConfig.ui.minPageLength) == 'undefined') {
				setAllowClick();
				return rows
			} else {
				//需要继续还行
			}
			//如果数量已经够了 结束返回
			if (_gridConfig.ui.minPageLength <= _rows.length) {
				setAllowClick()
				return rows
			} else {
				//需要继续还行
			}
			//还不够, 需要添加空数据
			if (_gridConfig.ui.isAllowAdd) {
				for (var plusI = _rows.length; plusI < _gridConfig.ui.minPageLength; plusI++) {
					rows.push({
						netstarEmptyRowFlag: true
					});
				}
			}
			setAllowClick()
			return rows;
		},
		//获取行数据
		getRowData: function (_rowData, _gridConfig) {
			var rowData = {};
			var _this = this;
			var colStyleExpress = _gridConfig.ui.styleExpress.col ? _gridConfig.ui.styleExpress.col : {};
			var rowStyleExpress = _gridConfig.ui.styleExpress.row ? _gridConfig.ui.styleExpress.row : {};
			rowData['NETSTAR-TRSTYLE'] = {};

			$.each(_rowData, function (key, value) {
				//获取column配置
				var columnConfig = _gridConfig.columnById[key];
				if (rowStyleExpress[key]) {
					var rowStyleStr = NetStarUtils.getStyleByCompareValue({
						rowData: _rowData,
						tdField: key,
						styleExpress: rowStyleExpress[key]
					});
					for (var attrStyle in rowStyleStr) {
						rowData['NETSTAR-TRSTYLE'][attrStyle] = rowStyleStr[attrStyle];
					}
				}
				if (typeof (columnConfig) == 'object') {
					//有可能需要处理的数据
					if (colStyleExpress[key]) {
						var styleStr = NetStarUtils.getStyleByCompareValue({
							rowData: _rowData,
							tdField: key,
							styleExpress: colStyleExpress[key]
						});
						for (var attrStyle in styleStr) {
							columnConfig.styleObj[attrStyle] = styleStr[attrStyle];
						}
					}
					if (columnConfig.columnType == 'thumb') {
						// cy.202003201 处理ids 转为url数组
						var fileIds =  _rowData[key];
						// fileIds = fileIds +',1327781183131485170,1327781272252056562'; 模拟ids用
						var fileIdArr = fileIds.split(',');
						var fileUrlArr = [];
						var authorization = NetStarUtils.OAuthCode.get();
						for(var i = 0; i<fileIdArr.length; i++){
							var fileUrl = getRootPath() + '/files/images/' + fileIdArr[i] + '?Authorization=' + authorization;
							fileUrlArr.push(fileUrl);
						}
						rowData['NETSTAR-FILEURL-' + key] = fileUrlArr;
						/* cy.bak.202003201 只处理id，不处理ids 临时备份 一个月后删除
						rowData['NETSTAR-URL'] = getRootPath() + '/files/images/' + _rowData[key];
						var authorization = NetStarUtils.OAuthCode.get();
						if (authorization) {
							rowData['NETSTAR-URL'] += '?Authorization=' + authorization;
						}
						*/
					}
					rowData[key] = _this.getValueByColumnType(_rowData[key], _rowData, columnConfig);
				} else {
					//没有配置， 这些是不用处理的数据
					rowData[key] = _rowData[key];
				}
			});
			// 执行 设置行显示数据 方法 lyw 20190917
			if (typeof (_gridConfig.ui.setRowShowDataHandler) == "function") {
				_gridConfig.ui.setRowShowDataHandler(rowData);
			}
			//添加是否选中标识 如果服务器端发送过来的数据已经带有此标识 则使用服务器标记
			if (_gridConfig.ui.selectMode != 'none') {
				if (typeof (rowData.netstarSelectedFlag) == 'undefined') {
					rowData.netstarSelectedFlag = false;
				}
			}
			//添加是否禁用标识 如果服务器端发送过来的数据已经带有此标识 则使用服务器标记 Sjj 20190325
			if (typeof (rowData['NETSTAR-TRDISABLE']) == 'undefined') {
				rowData['NETSTAR-TRDISABLE'] = false;
			}

			//生成行复选框的id 
			if (_gridConfig.ui.isCheckSelect == true) {
				rowData.netstarCheckboxSelectedFlag = typeof (rowData.netstarCheckboxSelectedFlag) == "boolean" ? rowData.netstarCheckboxSelectedFlag : false;
			}

			//如果有按钮 getColumnConfig中已经处理了意外情况
			// if (_gridConfig.ui.tableRowBtns) {
			// 	//ROWBUTTON
			// 	var btnsHtml = '';
			// 	var btns = _gridConfig.ui.tableRowBtns;
			// 	for (var btnI = 0; btnI < btns.length; btnI++) {
			// 		var btnConfig = btns[btnI];
			// 		btnConfig.index = btnI.toString(); //由于是字符串替换所以要转成数字
			// 		btnConfig.gridId = _gridConfig.id;
			// 		var ROWBUTTONHTML = vueTemplate.BODY.ROWBUTTON;
			// 		if (btnConfig.functionConfig) {
			// 			if (btnConfig.functionConfig.icon) {
			// 				btnConfig.icon = btnConfig.functionConfig.icon;
			// 				ROWBUTTONHTML = vueTemplate.BODY.ROWICONBUTTON;
			// 			}
			// 		}
			// 		var _btnsHtml = NetStarUtils.getTemplateHtml(ROWBUTTONHTML, btnConfig, false);
			// 		// btnsHtml += NetStarUtils.getTemplateHtml(ROWBUTTONHTML, btnConfig, false);
			// 		switch(btnConfig.field){
			// 			case 'NETSTAR-DELETE':
			// 				rowData[btnConfig.field] = _btnsHtml;
			// 				break;
			// 			default:
			// 				btnsHtml += _btnsHtml;
			// 				break;
			// 		}
			// 	}
			// 	rowData['NETSTAR-BTNS'] = btnsHtml;
			// }

			//是否有编辑状态下的删除按钮
			// if (_gridConfig.ui.isHaveEditDeleteBtn) {

			// 	//插入当前删除按钮事件到按钮组中
			// 	if ($.isArray(_gridConfig.ui.tableRowBtns) == false) {
			// 		_gridConfig.ui.tableRowBtns = [];
			// 	}

			// 	var btnConfig = {
			// 		text: 'X',
			// 		handler: function (data) {
			// 			NetStarGrid.delRow(data.rowData, data.gridId, data.rowIndex);
			// 		},
			// 		index: _gridConfig.ui.tableRowBtns.length.toString(),
			// 		gridId: _gridConfig.id,
			// 		html: '<span>X</span>'
			// 	};
			// 	//sjj 20190315 根据当前显示形式修改
			// 	if (_gridConfig.ui.displayMode == 'block') {
			// 		btnConfig.html = '<i class="icon-close"></i><span></span>';
			// 	}
			// 	//sjj 20190312 如果当前ui中deleteajax存在 则走ajax调用执行方法
			// 	if (!$.isEmptyObject(_gridConfig.ui.deleteAjax)) {
			// 		btnConfig.handler = function (data) {
			// 			NetstarBlockList.deleteAjaxRow(data);
			// 		}
			// 	}
			// 	//插入当前删除按钮事件到按钮组中
			// 	_gridConfig.ui.tableRowBtns.push(btnConfig);
			// 	var btnsHtml = NetStarUtils.getTemplateHtml(vueTemplate.BODY.ROWDELETEBUTTON, btnConfig, false);
			// 	rowData['NETSTAR-DELETE'] = btnsHtml;
			// }
			if (_gridConfig.ui.displayMode != 'treeGrid') {
				/************************* lyw start 行状态************************/
				rowData['NETSTAR-MSGSTATE'] = dataManager.getRowState(rowData);
				/************************* lyw end 行状态************************/
			} else {
				//添加是否打开树节点标记 sjj 20190626
				if (typeof (rowData.netstarOpen) == 'undefined') {
					rowData.netstarOpen = false;
				}

				//添加当前父节点是展开还是关闭 sjj 20190626
				if (typeof (rowData.netstarExpand) == 'undefined') {
					rowData.netstarExpand = false;
				}
			}

			return rowData;
		},
		getRowState: function (rowData) {
			var workItemState = rowData.workItemState; // 工作项状态 原始数据有工作项状态NETSTAR-MSGSTATE
			var state = 'normal'; // 待办
			var lineHaveState = false;

			function setState() {
				if (rowData.hasEmergency) {
					state = 'emergency';
				} else if (rowData.hasSuspend) {
					state = 'suspend';
				} else if (rowData.hasRollback) {
					state = 'rollback';
				}
				//回退类型  0相当于hasRollback: false, 1和2时显示重办, 3时显示回退 sjj 20200115
				if(typeof(rowData.rollbackType)=='number'){
					if(rowData.rollbackType == 0){
						state = 'normal';
					}else if(rowData.rollbackType == 1 || rowData.rollbackType == 2){
						state = 'rollback';
					}else if(rowData.rollbackType == 3){
						state = 'rollbackType';
					}
				}
			}

			function setStateByWorkItemState(_workItemState) {
				if (workItemStateManage.dealt[_workItemState]) {
					// 待办
					setState()
				} else {
					state = workItemStateManage.name[_workItemState];
				}
			}
			if (typeof (workItemState) != "undefined") {
				lineHaveState = true;
				setStateByWorkItemState(workItemState);
			} else {
				setState();
			}

			// 设置状态添加的字段 如果有workItemState则不执行
			if (lineHaveState || !rowData['netstar-workItemState']) {
				return state ? state : 'normal';
			}
			workItemState = rowData['netstar-workItemState'];
			delete rowData['netstar-workItemState'];
			setStateByWorkItemState(workItemState);
			return state ? state : 'normal';
		},
		getValueByColumnType: function (originalValue, rowData, columnConfig) {
			var returnValue;
			switch (columnConfig.columnType) {
				case 'htmlRender':
					returnValue = originalValue;
					if (columnConfig.field == 'propertyValue' && originalValue) {
						var propertyValueArray = JSON.parse(originalValue);
						var propertyValueHtml = '';
						for (var p = 0; p < propertyValueArray.length; p++) {
							var propertyData = propertyValueArray[p];
							propertyValueHtml += '<span class="tag">' + propertyData.propName + '：</span>' +
								'<span class="code">' + propertyData.customValue + '</span>';
							if (p < propertyValueArray.length - 1) {
								propertyValueHtml += ';';
							}
						}
						returnValue = '<div class="pt-list-content-item">' + propertyValueHtml + '</div>';
					}
					break;
				case 'thumb':
					//默认图片地址+id
					//returnValue = originalValue;
					returnValue = getRootPath() + '/files/images/' + originalValue + ':0.1';
					var authorization = NetStarUtils.OAuthCode.get();
					if (authorization) {
						returnValue += '?Authorization=' + authorization;
					}
					break;
				case 'diffUnit':
					//时间差
					if (originalValue) {
						returnValue = NetStarUtils.getDiffByTimeUnit(originalValue);
					}
					break;
				case 'timeUnit':
					if (originalValue) {
						var originalNumValue = Number(originalValue);
						var years = moment.duration(originalNumValue).years();
						var months = moment.duration(originalNumValue).months();
						var days = moment.duration(originalNumValue).days();
						var hours = moment.duration(originalNumValue).hours();
						var minutes = moment.duration(originalNumValue).minutes();
						var seconds = moment.duration(originalNumValue).seconds();
						var returnValue = '';
						if (years) {
							returnValue += years + '年'
						}
						if (months) {
							returnValue += months + '月'
						}
						if (days) {
							returnValue += days + '日'
						}
						if (hours) {
							returnValue += hours + '时'
						}
						if (minutes) {
							returnValue += minutes + '分'
						}
						if (seconds) {
							returnValue += seconds + '秒'
						}
					}
					break;
				case 'func':
					returnValue = typeof (columnConfig.formatHandler) == "function" ? columnConfig.formatHandler(originalValue, rowData, columnConfig) : '';
					break;
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
					returnValue = NetStarUtils.valueConvertManager.getDateTimeStringByTimestamp(originalValue, {
						format: formatStr
					});
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
					returnValue = NetStarUtils.valueConvertManager.getMoneyStringByNumber(originalValue, options);
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
				case 'checkbox':
					var editConfig = columnConfig.editConfig;
					var formatDate = {};
					if ($.isArray(editConfig.subdata) && editConfig.subdata.length > 0) {
						var subdata = editConfig.subdata;
						var valueField = editConfig.valueField;
						var textField = editConfig.textField;
						for (var subdataI = 0; subdataI < subdata.length; subdataI++) {
							var formatDataValue = subdata[subdataI][valueField];
							if(formatDataValue == originalValue){
								returnValue = subdata[subdataI][textField];
								break;
							}
						}
					}
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
						if(editConfig.selectMode == 'checkbox'){
							if(typeof(originalValue)=='string'){
								var dataArray = originalValue.split(',');
								var textArray = [];
								for (var dataI = 0; dataI < dataArray.length; dataI++) {
									textArray.push(formatDate[dataArray[dataI]]);
								}
								returnValue = textArray.join(',');
							}
						}else{
							returnValue = NetStarUtils.valueConvertManager.getDictionaryByDictionary(originalValue, columnConfig.formatHandler.data.formatDate);
						}
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
					returnValue = NetStarUtils.getHtmlByRegular(rowData, columnConfig.formatHandler.data);
					//渲染字段
					break;
				case 'href':
					if (columnConfig.formatHandler.data.field) {
						returnValue = rowData[columnConfig.formatHandler.data.field];
					}
					break;
				case 'upload':
					// if(columnConfig.editConfig.isMultiple){
					// 	returnValue = originalValue.length > 0 ? originalValue.length + '个附件' : '';
					// }else{
					// 	if(originalValue.length == 1){
					//         returnValue = originalValue[0][columnConfig.editConfig.textField];
					//     }
					// }
					if (originalValue) {
						var valArr = typeof (originalValue) == "string" ? originalValue.split(',') : [];
						returnValue = valArr.length > 0 ? valArr.length + '个附件' : '';
					}
					break;
				case 'buildPdf':
					if (originalValue) {
						var valArr = typeof (originalValue) == "string" ? originalValue.split(',') : [];
						returnValue = valArr.length == 1 ? '附件' : valArr.length + '个附件';
					} else {
						returnValue = '生成';
					}
					break;
				case 'cubesInput':
					if (originalValue) {
						returnValue = "编辑";
					}
					break;
				case 'standardInput':
					if (originalValue) {
						returnValue = "查看";
					}
					break;
				case 'textFieldReplace':
					// id替换 下拉框或单选/多选时 保存的是id需要返显name 这种类型会根据该行返显的显示字段显示
					if (originalValue) {
						var data = columnConfig.formatHandler.data;
						var textField = data && data.textField ? data.textField : '';
						returnValue = rowData[textField] ? rowData[textField] : '';
					}
					break;
				default:
					//不需要转换的类型
					if (typeof (columnConfig.editConfig) == 'object') {
						var editConfig = columnConfig.editConfig;
						switch (editConfig.type) {
							case 'select':
								if (columnConfig.gridId) {
									if (NetstarComponent.config[columnConfig.gridId]) {
										if (NetstarComponent.config[columnConfig.gridId].config) {
											if (NetstarComponent.config[columnConfig.gridId].config[columnConfig.field]) {
												var selectConfig = NetstarComponent.config[columnConfig.gridId].config[columnConfig.field];
												var subdata = selectConfig.subdata;
												for (var selectI = 0; selectI < subdata.length; selectI++) {
													if (subdata[selectI][selectConfig.valueField] == originalValue) {
														returnValue = subdata[selectI][selectConfig.textField];
														break;
													}
												}
											} else {
												console.warn('列字段配置不存在');
											}
										} else {
											console.warn('相关配置不存在');
										}
									} else {
										console.warn('grid容器id不存在');
									}
								}
								break;
							default:
								returnValue = originalValue;
								break;
						}
					} else {
						returnValue = originalValue;
					}
					break;
			}
			return returnValue;
		},
		//设置分页
		toPageByNumber: function (pageNumber, gridConfig, vueData) {
			//pageNumber:number 第几页 第一页是0
			//刷新数据
			//如果是服务端翻页 sjj 20190402
			var allRows = vueData.originalRows;
			var pageRows = dataManager.getRowsByPage(pageNumber, allRows, gridConfig);
			var tableRowLength = allRows.length;
			if (pageRows.length > 0) {
				//如果设置了uiconfig defaultSelectedIndex sjj 20190123
				if (typeof (gridConfig.ui.defaultSelectedIndex) == 'number') {
					var isHasSelected = false;
					for (var i = 0; i < pageRows.length; i++) {
						if (pageRows[i].netstarSelectedFlag === true) {
							isHasSelected = true;
							break;
						}
					}
					if (gridConfig.ui.defaultSelectedIndex >= 0 && !isHasSelected) {
						if (gridConfig.ui.selectMode == 'single') {
							for (var i = 0; i < pageRows.length; i++) {
								pageRows[i].netstarSelectedFlag = false;
							}
						}
						if (pageRows[gridConfig.ui.defaultSelectedIndex]) {
							pageRows[gridConfig.ui.defaultSelectedIndex].netstarSelectedFlag = true;
						}
					}
				}
				// 如果设置了隐藏行 通过行序列号设置
				if ($.isArray(gridConfig.ui.trHideByOrderArr)) {
					var trHideByOrderArr = gridConfig.ui.trHideByOrderArr;
					for (var i = 0; i < pageRows.length; i++) {
						pageRows[i]['NETSTAR-TRHIDDEN'] = false;
					}
					for(var i=0; i<trHideByOrderArr.length; i++){
						if(pageRows[trHideByOrderArr[i]]){
							pageRows[trHideByOrderArr[i]]['NETSTAR-TRHIDDEN'] = true;
						}
					}
				}

			}
			vueData.rows = pageRows;
			if (gridConfig.data.isServerMode) {
				//服务端翻页 sjj 20190402
				if(!$.isEmptyObject(gridConfig.domParams.serverData)){
					tableRowLength = Number(gridConfig.domParams.serverData.total);
				}
			}
			//刷新列表下拉框
			var pageSelectSubdata = dataManager.getPageSelectSubdata(allRows, gridConfig);
			gridConfig.domParams.toPageSelect.subdata = pageSelectSubdata;
			gridConfig.domParams.toPageSelect.length = pageSelectSubdata.length;
			//重置页面显示
			gridConfig.domParams.toPageInput.value = pageNumber + 1;
			vueData.$data.page.length = gridConfig.ui.pageLengthDefault;
			vueData.$data.page.start = pageNumber * vueData.$data.page.length; //这个会影响自动计算的索引

			//重置页面scorll
			//显示共多少页多少行 sjj 20190119
			vueData.pageNumberWithMax = i18n.pageNumberWithMax.replace(
				/_PAGES_/g,
				Math.ceil(tableRowLength / gridConfig.ui.pageLengthDefault)).replace(/_MAX_/g, tableRowLength);
			//如果当前允许全选 设置选中状态 sjj20190119
			if (typeof (NetStarGrid.configs[gridConfig.id]) == "object") { // lyw 20190906 dataSource 数据初始化时分页 此时NetStarGrid.configs[gridConfig.id]还没有
				methodsManager.body.setUserAllSelectCheckState(vueData, gridConfig.ui.displayMode);
			}
		},
		//获取分页后的数据
		getRowsByPage: function (pageNumber, allRows, gridConfig) {
			//pageNumber:number 需要第几页的数据 第一页：0
			//allRows:array     数组 所有的页面 如果是服务器端则全部渲染，如果是客户端则只返回部分
			if (typeof (pageNumber) != 'number') {
				pageNumber = 0;
			}
			var pageRows = [];
			if (gridConfig.ui.isPage) {
				var pageLength = gridConfig.ui.pageLengthDefault;
				if (gridConfig.data.isServerMode) {
					pageRows = allRows;
				} else {
					//获取从第几条开始到第几页结束
					var startIndex = pageNumber * pageLength;
					var endIndex = startIndex + pageLength;
					for (var i = startIndex; i < endIndex; i++) {
						if (typeof (allRows[i]) == 'object') {
							pageRows.push(allRows[i]);
						}
					}
				}
			} else {
				pageRows = allRows;
			}
			//执行渲染，并且补充长度到最小长度
			pageRows = this.getRows(pageRows, gridConfig);
			return pageRows;
		},
		//获取分页下拉列表
		getPageSelectSubdata: function (allRows, gridConfig) {
			//allRows array 当前可见的所有行
			//return array [1,2,3,4]
			var listLength = allRows.length;
			if (gridConfig.data.isServerMode) {
				if(!$.isEmptyObject(gridConfig.domParams.serverData)){
					listLength = Number(gridConfig.domParams.serverData.total);
				}
			}
			var pageArray = [];
			var pageLength = gridConfig.ui.pageLengthDefault;
			var pageNumber = Math.ceil(listLength / pageLength);
			for (var i = 0; i < pageNumber; i++) {
				pageArray.push(i + 1);
			}
			return pageArray;
		},
		//根据ajax获取数据并刷新
		ajax: function (_gridConfig) {
			var _this = this;
			//修改空数据面板状态
			_gridConfig.domParams.panelOfEmptyRows = {
				isShow: true,
				class: 'loading',
				info: i18n.loadingInfo,
			};
			var ajaxOptions = {
				url: _gridConfig.data.src, //地址
				data: _gridConfig.data.data, //参数
				type: _gridConfig.data.type,
				contentType: _gridConfig.data.contentType,
			}
			if(_gridConfig.ui.quicklyQueryColumnValue){
				//快速查询默认值的定义
				ajaxOptions.data.keyword = _gridConfig.ui.quicklyQueryColumnValue;
				ajaxOptions.data.quicklyQueryColumnValue = _gridConfig.ui.quicklyQueryColumnValue;
				if(!$.isEmptyObject(_gridConfig.ui.query)){
					if(_gridConfig.ui.query.quickQueryFieldArr.length > 0){
						ajaxOptions.data.quicklyQueryColumnNames = _gridConfig.ui.query.quickQueryFieldArr;
					}
				}
				delete _gridConfig.ui.quicklyQueryColumnValue;
			}
			if (_gridConfig.data.isServerMode) {
				//如果开启了服务端翻页需要传送起始页码和条数
				//var configs = NetStarGrid.configs[_gridConfig.id];
				//var pageParams = {
				//	start:configs.vueObj.page.start,
				//length:configs.vueObj.page.length,
				//};
				//nsVals.extendJSON(ajaxOptions.data,pageParams);
			}
			NetStarUtils.ajax(ajaxOptions, function (res, _ajaxOptions) {
				//获取ajax返回结果
				if (res.success) {
					//调用ajax成功
					_gridConfig.domParams.panelOfEmptyRows = {
						isShow: false,
						class: '',
						info: '',
					}
					if (_gridConfig.data.isServerMode) {
						//服务端请求
						_gridConfig.domParams.serverData = res;
					}
					var dataSrc = _gridConfig.data.dataSrc;
					var rows = $.extend(true, [], res[dataSrc]);
					//如果返回的不是数组，可能是空数组
					if ($.isArray(rows) == false) {
						rows = [];
					}
					if (rows.length > 0) {
						//sjj 20190624 
						if (_gridConfig.ui.displayMode == 'treeGrid') {
							rows = NetStarUtils.getDataByFormatTreeData(rows, _gridConfig.ui.level);
						}
						//如果定义了排重 sjj 20190301
						if (!$.isEmptyObject(_gridConfig.ui.hideValueOption)) {
							var listArray = _gridConfig.ui.hideValueOption.list;
							var distinctIdField = _gridConfig.ui.hideValueOption.idField;
							var idField = _gridConfig.data.idField;
							if ($.isArray(listArray) && distinctIdField) {
								//存在要排重的数据并且存在排重字段
								var idsArray = []; //把存在的ids值记录下来
								for (var listI = 0; listI < listArray.length; listI++) {
									if (listArray[listI][distinctIdField]) {
										idsArray.push(listArray[listI][distinctIdField]);
									}
								}
								if (idsArray.length > 0) {
									//如果排重的字段值存在 去当前返回的rows数据里匹配查找
									var rowsDataArray = [];
									for (var rowI = 0; rowI < res[dataSrc].length; rowI++) {
										var rowData = res[dataSrc][rowI];
										//服务器端模式下使用只读而非删除行数据 ERP.J cy 20200305 
										if(_gridConfig.data.isServerMode){
											var isReadOnly = idsArray.indexOf(rowData[idField]) > -1
											if(isReadOnly){
												rowData['NETSTAR-TRDISABLE'] = isReadOnly;
											}
											
											rowsDataArray.push(rowData);
										}else{
											if (idsArray.indexOf(rowData[idField]) == -1) {
												//记录下不存在排重的数据
												rowsDataArray.push(rowData);
											}
										}
										
									}
									rows = rowsDataArray;
								}
							}
						}
						if (!$.isEmptyObject(_gridConfig.ui.defaultValueOption)) {
							//20191016 新增逻辑 当前选择的值可以进行多选 对应lims优化 表单业务组件多选新增时原选择保留问题
							var idsArray = []; //把存在的ids值记录下来
							var listArray = _gridConfig.ui.defaultValueOption.value;
							var distinctIdField = _gridConfig.ui.defaultValueOption.idField;
							var idField = _gridConfig.data.idField;
							for (var listI = 0; listI < listArray.length; listI++) {
								if (listArray[listI][distinctIdField]) {
									idsArray.push(listArray[listI][distinctIdField]);
								}
							}
							for (var rowI = 0; rowI < rows.length; rowI++) {
								var rowData = rows[rowI];
								if (idsArray.indexOf(rowData[idField]) > -1) {
									//设置多选中状态
									rowData.netstarCheckboxSelectedFlag = true;
									if(_gridConfig.ui.selectMode == 'single' && _gridConfig.ui.displayMode == "block"){
										rowData.netstarSelectedFlag = true;
									}
								}
							}
						}
						//服务端返回值存在选中值 
						if (typeof (_gridConfig.ui.defaultSelectedIndex) == 'number') {
							//是否存在自定义的选中值
							if(rows[_gridConfig.ui.defaultSelectedIndex]){
								rows[_gridConfig.ui.defaultSelectedIndex].netstarSelectedFlag = true;
							}
						}
					} else {
						if (_gridConfig.ui.displayMode == 'blockList') {
							_gridConfig.domParams.panelOfEmptyRows = {
								isShow: true,
								class: 'no-data',
								info: i18n.noData,
							};
						}
					}
					_this.resetData(rows, _gridConfig.id, _gridConfig.ui.displayMode);
					//执行ajax完成后的回调（config.ui.ajaxSuccessHandler）
					if (typeof (_gridConfig.data.ajaxSuccessHandler) == 'function') {
						_gridConfig.data.ajaxSuccessHandler(rows, _gridConfig.id);
					}
				} else {
					//调用ajax失败
					_gridConfig.domParams.panelOfEmptyRows = {
						isShow: true,
						class: 'loadedError',
						info: i18n.loadedError,
					}
				}
			}, true)
		},
		//sjj 20190416 处理单行数据的格式化
		formatSingleRowData: function (rowData, columns) {
			// cy 0329 star--------------------
			// 根据数据库字段类型转换数据值
			function getDataByVariableType(data, columnConfig) {
				switch (columnConfig.variableType) {
					case 'number':
						// 数字类型 转化boolean为数值
						if (typeof (data) == "boolean") {
							data = Number(data);
						} else if (data === '') {
							data = undefined;
						}
						break;
					case 'date':
						if (typeof (data) != 'number') {
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
		formatGetData: function (rowsData, columns) {
			if (!$.isArray(rowsData)) {
				nsAlert('获取的表格数据错误', 'error');
				console.error('获取的表格数据错误');
				console.error(rowsData);
				return;
			}
			for (var rowI = 0; rowI < rowsData.length; rowI++) {
				this.formatSingleRowData(rowsData[rowI], columns);
			}
		},
		//sjj 20190419 验证每行的数据是否都为空
		validIsAllEmptyByRowData: function (_rowData) {
			//行数据  //字段id  字段值
			//根据列字段的总数去判断 如果当前为空值的列等于总列的字段总和 那么则是都为空了
			var isEmpty = false;
			var emptyLength = 0; //空值的数量
			var totalLength = 0; //总共要计算的值长度
			for (var value in _rowData) {
				switch (typeof (_rowData[value])) {
					case 'string':
						if (_rowData[value] == '') {
							emptyLength++;
						}
						break;
					case 'object':
						if ($.isEmptyObject(_rowData[value])) {
							emptyLength++;
						}
						break;
				}
				totalLength++;
			}
			if (emptyLength == totalLength) {
				isEmpty = true;
			}
			if (totalLength == 1) {
				//长度为1只存在状态值
				if (typeof (_rowData.objectState) == 'number') {
					isEmpty = true;
				}
			}
			return isEmpty;
		},
		verifyGetData:function(rowsData,columns){
			var verifyRuleObj = {};
			var verifyResult = true;
			var hasRequired = {
				required: false,
				info: []
			};
			var legalMsg = '';
			for (var columnId in columns) {
				var columnData = columns[columnId];
				var editConfig = typeof(columnData.editConfig)=='object' ? columnData.editConfig : {};
				var rulesStr = editConfig.rules;
				if (rulesStr && rulesStr.indexOf('required') != -1){
					hasRequired.required = true;
					hasRequired.info.push({
						id:editConfig,
						name:editConfig.label
					})
					verifyRuleObj[editConfig.id] = {
						keyField:editConfig.id,
						rules:rulesStr,
						type:editConfig.type,
						name:editConfig.label
					};
				}
			}
			for (var index = 0; index < rowsData.length; index++) {
				var item = rowsData[index];
				var isContinue = true;
				for(var verifyI in verifyRuleObj){  
				   if(typeof(item[verifyI])=='undefined'){
					  //终止循环
					  isContinue = false;
					  var islegal = NetstarComponent.validatValue(verifyRuleObj[verifyI]);
					  if(islegal.validatInfo.indexOf(',') != -1){
						 islegal.validatInfo = islegal.validatInfo.substr(0, islegal.validatInfo.length - 1);
					  }
					  if(islegal.validatInfo == ''){
						islegal.validatInfo = '必填';
					  }
					  if(legalMsg.indexOf(key) == -1){
						 legalMsg = verifyRuleObj[verifyI].name + ': ' + islegal.validatInfo + ',';
					  }
					  verifyResult = false;
					  break;
				   }
				}
				if(isContinue){
				   for (var key in item) {
					  if (item.hasOwnProperty(key) && typeof verifyRuleObj[key] != 'undefined') {
						 var value = item[key];
						 var element = verifyRuleObj[key];
						 element.value = value;
						 var islegal = NetstarComponent.validatValue(element);
						 if (!islegal.isTrue) {
							if (islegal.validatInfo.indexOf(',') != -1) {
							   islegal.validatInfo = islegal.validatInfo.substr(0, islegal.validatInfo.length - 1);
							}
							if(islegal.validatInfo == ''){
								islegal.validatInfo = '必填';
							}
							if (legalMsg.indexOf(key) == -1) {
							   legalMsg = element.name + ': ' + islegal.validatInfo + ',';
							}
							verifyResult = false;
						 }
					  }
				   }
				}
			}
			if(!verifyResult) {
				legalMsg = legalMsg.substr(0, legalMsg.length - 1);
				nsalert(legalMsg, 'error');
			}
			return verifyResult;
		},
		//获取数据
		getData: function (gridId,isValid) {
			isValid = typeof(isValid)=='boolean' ? isValid : false; //默认不验证如果传送了boolean类型的true则对整体值进行验证 sjj 20191223
			var _this = this;
			var configs = NetStarGrid.configs[gridId]; //获取grid配置项
			if (typeof (configs) == 'undefined') {
				configs = NetstarBlockList.configs[gridId];
			}
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
								if (key.indexOf('netstarSelectedFlag') != -1) {
									delete allData[rowI][key];
								}
							}
						}
					}
					//sjj 20190419 添加行数据的处理 如果当前行数据中全部都是空值
					var isAllEmplty = this.validIsAllEmptyByRowData(allData[rowI]);
					if (!isAllEmplty) {
						rowsData.push(allData[rowI]);
					}
				}
			}
			_this.formatGetData(rowsData, columns); // lyw 格式化获取的表格数据
			var verifyResult = true;
			if(isValid){
				verifyResult = _this.verifyGetData(rowsData,columns);//sjj 20191223
			}
			if(!verifyResult){
				//验证未通过返回false
				return false;
			}else{
				return rowsData;
			}
		},
		//删除行数据
		delRow: function (rowData, gridId, index) {
			//tableRowsData:array [{id:'',value:""},{....}] 整个表格的所有行数据
			//gridId:string gird的id
			var grid = NetStarGrid.configs[gridId];
			if (gridId.indexOf('blockList') > -1) {
				grid = NetstarBlockList.configs[gridId];
			}
			if (typeof (grid) != 'object') {
				console.error('id:' + gridId + ' 找不到相关配置文件，请核实');
			} else {
				var originalRows = grid.vueConfig.data.originalRows; //返回的总数据
				var rows = grid.vueConfig.data.rows; //当前显示的行数据
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
					rows.splice(dataNsIndex, 1); //删除其对应位置
					originalRows.splice(originalNsIndex, 1);
				} else {
					console.error('delIndex:' + dataNsIndex + ' 找不到对应行数据，请核实');
				}
			}
		},
		//设置行选中 sjj20190122 
		setRowSelectedByIndex: function (indexs, gridId, isCancelOthers) {
			/*
			 *indexs 		 array  行下标
			 *gridId  		 string  容器id
			 *isCancelOthers  boolean 是否取消其他行的选中  默认false 不取消
			 */
			var config = NetStarGrid.configs[gridId];
			var indexsArray = [];
			if ($.isArray(indexs)) {
				//是数组
				indexsArray = indexs;
			}
			var isContinue = true; //默认继续
			var errorInfoStr = ''; //错误提示语
			if (typeof (config) != 'object') {
				//不存在当前配置
				var errorInfoStr = 'setRowSelectedById(ids,gridId,isCancelOthers)方法出错，当前gridId：' + gridId + '错误， 该Grid不存在';
				isContinue = false;
			} else if (indexsArray.length == 0) {
				//行位置不存在
				var errorInfoStr = 'setRowSelectedById(ids,gridId,isCancelOthers)方法出错，当前idsArray：' + indexsArray + '错误， 该idsArray不存在';
				isContinue = false;
			}
			if (isContinue) {
				//位置存在 容器id存在
				var idField = config.gridConfig.data.idField; //主键id
				var rows = config.vueConfig.data.rows; //当前显示的行数据
				var originalRows = config.vueObj.originalRows; //原始数据
				//当前显示的行数据存在于原始数据当中才可以设置选中状态
				for (var i = 0; i < rows.length; i++) {
					var data = rows[i];
					if (originalRows[i]) {
						if (indexsArray.indexOf(i) > -1) {
							//存在行设置选中
							data.netstarSelectedFlag = true; //设置行选中
						}
					}
				}
			} else {
				nsalert(errorInfoStr, 'error');
				console.error(errorInfoStr)
			}
		},
		//设置行选中 sjj20190122 
		setRowSelectedById: function (ids, gridId, isCancelOthers) {
			/*
			 *ids 			 array  行下标
			 *gridId  		 string  容器id
			 *isCancelOthers  boolean 是否取消其他行的选中  默认false 不取消
			 */
			var config = NetStarGrid.configs[gridId];
			var idsArray = [];
			if ($.isArray(ids)) {
				//是数组
				idsArray = ids;
			}
			if (typeof (isCancelOthers) != 'boolean') {
				isCancelOthers = true;
			}
			var isContinue = true; //默认继续
			var errorInfoStr = ''; //错误提示语
			if (typeof (config) != 'object') {
				//不存在当前配置
				var errorInfoStr = 'setRowSelectedById(ids,gridId,isCancelOthers)方法出错，当前gridId：' + gridId + '错误， 该Grid不存在';
				isContinue = false;
			} else if (idsArray.length == 0) {
				//行位置不存在
				var errorInfoStr = 'setRowSelectedById(ids,gridId,isCancelOthers)方法出错，当前idsArray：' + idsArray + '错误， 该idsArray不存在';
				isContinue = false;
			}
			if (isContinue) {
				//位置存在 容器id存在
				var idField = config.gridConfig.data.idField; //主键id
				var rows = config.vueConfig.data.rows; //当前显示的行数据
				var originalRows = config.vueObj.originalRows; //原始数据
				//当前显示的行数据存在于原始数据当中才可以设置选中状态
				if (isCancelOthers) {
					for (var rowI = 0; rowI < rows.length; rowI++) {
						var data = rows[rowI];
						if (originalRows[rowI]) {
							data.netstarSelectedFlag = false;
						}
					}
				}
				for (var i = 0; i < rows.length; i++) {
					var data = rows[i];
					if (originalRows[i]) {
						if (ids.indexOf(data[idField]) > -1) {
							//存在行设置选中
							data.netstarSelectedFlag = true; //设置行选中
						}
					}
				}
			} else {
				nsalert(errorInfoStr, 'error');
				console.error(errorInfoStr)
			}
		},
		//根据index滚动列表到指定行 cy20200306
		scrollByIndex:function(ids, gridId){
			debugger;
		},
		//设置grid第一个可编辑的列获取焦点
		setFirstEditRowState: function (gridId) {
			/*
			 *gridId  		 string  容器id
			 */
			var config = NetStarGrid.configs[gridId];
			if (config) {
				var _gridConfig = config.gridConfig;
				var _tableVueConfig = config.vueConfig;
				var $container = _gridConfig.domParams.contentTable.$dom;
				var _$td = $container.children('tbody').children().eq(0).children('[ns-editable="true"]').eq(0);
				tdEditor.show(_$td, _gridConfig, _tableVueConfig);
			}
		},
		//设置编辑列
		setEditColumn: function (gridId) {
			/*
			 *gridId  		 string  容器id
			 */
			var config = NetStarGrid.configs[gridId];
			var _gridConfig = config.gridConfig;
			var _tableVueConfig = config.vueConfig;
			var $container = $('#' + _gridConfig.id + '-contenttable tbody tr td[ns-editable]');
			$container.attr('ns-editable', true);
			$.each($container, function (key, value) {
				var $td = $(this);
				tdEditor.show($td, _gridConfig, _tableVueConfig);
			})
		},
		// 获取需要计算的行结果 通过行数据 lyw 20190730
		getCountResult: function (rowData, fieldCountFuncObj) {
			var countData = {};
			var fieldRex = /\{\{(.*?)\}\}/;
			for (var fieldKey in fieldCountFuncObj) {
				var countFuncArr = fieldCountFuncObj[fieldKey];
				var countFuncStr = '';
				for (var arrI = 0; arrI < countFuncArr.length; arrI++) {
					var str = countFuncArr[arrI];
					if (fieldRex.test(str)) {
						var fieldId = str.match(fieldRex)[1];
						var fieldVal = rowData[fieldId];
						str = Number(fieldVal);
						if (isNaN(str)) {
							str = 0;
						}
					}
					countFuncStr += str;
				}
				var result = eval(countFuncStr);
				if (typeof (result) != "boolean") {
					var resultStr = result.toString();
					if (resultStr.indexOf('.') > -1) {
						var resultStrArr = resultStr.split('.');
						var resultStrMix = resultStrArr[1];
						if (resultStrMix.length == 17) {
							resultStr = result.toFixed(16);
						}
					}
					countData[fieldKey] = Number(resultStr);
				} else {
					countData[fieldKey] = result;
				}
			}
			return countData;
		},
		// 根据列配置设置原始数据 lyw 20190730
		setOriginalRowsByColumnConfig: function (columns, vueConfig) {
			var allRows = vueConfig.originalRows;
			for (var columnI = 0; columnI < columns.length; columnI++) {
				if (typeof (columns[columnI].editConfig) == "object" && typeof (columns[columnI].editConfig.countFuncConfig) == "object") {
					var editConfig = columns[columnI].editConfig;
					for (var rowI = 0; rowI < allRows.length; rowI++) {
						var rowData = allRows[rowI];
						if (!$.isEmptyObject(rowData)) {
							var countData = dataManager.getCountResult(rowData, editConfig.countFuncConfig);
							for (var fieldKey in countData) {
								rowData[fieldKey] = countData[fieldKey];
							}
						}
					}
				}
			}
		},
	}

	var htmlManager = {
		//需要先设置容器的高度，以防止页面闪烁
		setContainer: function (_gridConfig) {
			// 如果容器设置了高度 那么用设置的高度替换掉已有的高度 ，否则设置高度为已有的高度
			var $container = $('#' + _gridConfig.id); // 容器
			var containerHeight = $container.height(); // 容器高度
			var isHadSetHeight = true; // 是否设置了高度 并且需要设置高度 _gridConfig.ui.height存在则设置，不存在则不设置
			if (_gridConfig.ui) {
				if (_gridConfig.ui.height) {
					if (containerHeight == 0) {
						isHadSetHeight = false;
						containerHeight = _gridConfig.ui.height;
					} else {
						if (_gridConfig.ui.isPreferContainerHeight == true) {
							//是否优先使用容器高度
							_gridConfig.ui.height = containerHeight;
						} else {
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
				$container.css(styleObj);
			}
			//处理容器CSS样式问题
		},
		getHtml: function (_gridConfig, _vueConfig) {
			var html = '';
			//头部
			var headerHtml = this.getHeaderHtml(_gridConfig, _vueConfig);
			html += headerHtml;
			//主体body 包含三个表格
			var bodyHtml = this.getBodyHtml(_gridConfig, _vueConfig);
			html += bodyHtml;
			//footer 主要是按钮区域和页码
			var footerHtml = this.getFooterHtml(_gridConfig, _vueConfig);
			html += footerHtml;

			return html;
		},
		getHeaderHtml: function (_gridConfig, _vueConfig) {
			var html = '';
			var headerContainer = vueTemplate.HEADER.CONTAINER;
			html = NetStarUtils.getTemplateHtml(headerContainer, vueTemplate.HEADER);
			return html;
		},
		getBodyHtml: function (_gridConfig, _vueConfig) {
			var html = '';
			var bodyContainer = vueTemplate.BODY.CONTAINER;
			//处理是否有footer table 默认有footer 否则就删除掉容器
			if (_gridConfig.ui.footerColumns) {
				if (_gridConfig.ui.footerColumns.length == 0) {
					bodyContainer = bodyContainer.replace(/\{\{FOOTERTABLE\}\}/, '');
				} else {
					//有footer需要显示的列
					var footerTdsHtml = this.getFooterTableHtml(_gridConfig, _vueConfig);
					bodyContainer = bodyContainer.replace(/\{\{FOOTERTABLE\}\}/, footerTdsHtml);
				}
			} else {
				bodyContainer = bodyContainer.replace(/\{\{FOOTERTABLE\}\}/, '');
			}
			html = NetStarUtils.getTemplateHtml(bodyContainer, vueTemplate.BODY);
			return html;
		},
		//获取footerTable的代码 如果没有column
		getFooterTableHtml: function (_gridConfig, _vueConfig) {
			//{{ns-footer-tds} 替换为td html
			var html = '';
			var footerColumns = {};
			for (var i = 0; i < _gridConfig.columns.length; i++) {
				var columnConfig = _gridConfig.columns[i];
				var tdHtml = '';
				//需要按照字段处理的
				switch (columnConfig.columnType) {
					case 'autoserial':
						//对应合计两个字
						// tdHtml = i18n.footerValueSum;
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
				}

				html += '<td class="thead-th footer-' + columnConfig.columnType + '"' + footerTypeAttr + '>' + tdHtml + '</td>';
			}

			var footerTemplate = vueTemplate.BODY.FOOTERTABLE;
			html = footerTemplate.replace(/\{\{ns-footer-tds\}\}/, html);

			//_vueConfig.computed.footer = {};
			$.each(footerColumns, function (key, config) {
				var fieldName = config.field;
				_vueConfig.computed[key] = function () {
					var returnNumber = 0;
					for (var i = 0; i < this.originalRows.length; i++) {
						var rowData = this.originalRows[i];
						if(typeof(rowData)=='undefined'){
							rowData = {};
						}
						var value = rowData[fieldName];
						if (typeof (value) == 'number') {
							returnNumber += value;
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
					switch(config.columnType){
						case 'href':
							break;
						default:
							returnNumber = dataManager.getValueByColumnType(returnNumber, {}, config);
							break;
					}
					return returnNumber;
				}
			});


			return html;
		},
		//获取footer代码 包括页面 按钮容器等
		getFooterHtml: function (_gridConfig, _vueConfig) {
			var html = '';
			var footerContainer = vueTemplate.FOOTER.CONTAINER;
			var isHavePage = _gridConfig.ui.isPage; //是否有分页  没有分页就需要去掉{{TOTALINFO}}{{PAGELENGTHMENU}}{{PAGES}}
			if (isHavePage == false) {
				return ''; //返回完全不需要输出footer, 临时先写成这样，随着功能增加，需要增加判断
			}
			//var isHaveBtns = $.isArray(_gridConfig.ui.btns);
			html = NetStarUtils.getTemplateHtml(footerContainer, vueTemplate.FOOTER);
			return html;
		}
	};

	var vueManager = {
		getData: function (gridConfig) {

			//基本数据格式
			var vueData = {
				//头部部分 用于标题 内部搜索等
				header: {
					isShow: false,
					isShowAdvance: false,
				},
				//底部部分 用于统计合计等
				footer: {
					isShow: false,
				},
				//基础属性
				/** 三个实际上的表格属性统一 id styleObj
				 * headerTable：{
				 * 		id:'',
				 * 		styleObj:{width:'1550px'} 
				 * }
				 */
				domParams: {
					// headerTable:{},  头部
					// contentTable:{}, 内容
					// footerTable:{},  底部
				},
				//数据
				rows: [],
				//列描述
				columns: [],
				dragColumns: [],
				//页描述
				page: {
					start: 0, //从第几条开始
					length: gridConfig.ui.pageLengthDefault, //当前显示长度
					pageLength: gridConfig.ui.pageLengthMenu, //可选分页数量
				},
				search: {
					keyword: ''
				},
				ui: gridConfig.ui, //ui参数, 包含是否有自动序列号, 是否有checkSelect
				pageNumberWithMax: '',
			};
			//头部处理
			if (gridConfig.ui.title) {
				vueData.header.title = gridConfig.ui.title ? gridConfig.ui.title : '';
				vueData.header.isShow = gridConfig.ui.isShowHead;
			}
			if (!$.isEmptyObject(gridConfig.ui.query)) {
				if (gridConfig.ui.isOpenQuery || gridConfig.ui.isOpenAdvanceQuery || gridConfig.ui.isOpenFormQuery) {
					//存在查询框
					vueData.header.isFilterShow = true;
					vueData.header.isShow = true;
					vueData.header.queryId = gridConfig.ui.query.id;
				}
				if(!gridConfig.ui.isOpenFormQuery){
					if (gridConfig.ui.isOpenAdvanceQuery) {
						vueData.header.isShowAdvance = true;
						vueData.header.advanceQueryId = 'advance-' + gridConfig.ui.query.id;
					}
				}
				
			}
			//复制基本数据
			if (gridConfig.domParams) {
				vueData.domParams = gridConfig.domParams;
			}

			//复制列配置
			if (gridConfig.columns) {
				vueData.columns = gridConfig.columns;
				vueData.columnById = {};
				for (var columnI = 0; columnI < vueData.columns.length; columnI++) {
					var columnConfig = vueData.columns[columnI];
					columnConfig.gridId = gridConfig.id;
					var key = columnConfig.field
					vueData.columnById[key] = columnConfig;
				}
			}
			//复制行数据
			if (gridConfig.data.src) {
				//ajax数据源 先填充空行到数据源
				vueData.originalRows = [];
				vueData.rows = dataManager.getRows([], gridConfig);
				dataManager.ajax(gridConfig);
			} else {
				if (!$.isArray(gridConfig.data.dataSource)) {
					gridConfig.data.dataSource = [];
				}
				//如果定义了数据源
				vueData.originalRows = gridConfig.data.dataSource;
				vueData.rows = dataManager.getRows(gridConfig.data.dataSource, gridConfig);
			}

			//sjj 20190319 拖拽列
			if (gridConfig.dragColumns) {
				vueData.dragColumns = gridConfig.dragColumns;
			}
			vueData.idField = gridConfig.data.idField;
			vueData.isServerMode = gridConfig.data.isServerMode;
			return vueData;
		},
		getVueConfig: function (_gridConfig) {
			var vueConfig = {
				id: _gridConfig.id,
				el: _gridConfig.el,
				data: this.getData(_gridConfig),
				contentTableAttr: {
					isRefreshSource: false, //是否刷新了数据
					$table: '', //主要内容表格
				},
				component: {},
				watch: {
					search: {
						keyword: function (value) {
							console.log(value);
						}
					},
					rows: {
						deep: true,
						handler: function (newValues, oldValues) {
							this.$options.contentTableAttr.isRefreshSource = true;
							//修改数据源属性
							//console.log('rows edit');
							//sjj 20190321 重绘回调事件
							if (typeof (this.ui.drawHandler) == 'function') {
								//this.ui.drawHandler(this);
								var delay = typeof (this.ui.delay) == 'number' ? this.ui.delay : 0;
								var _this = this;
								if (this.ui.timer) {
									clearTimeout(this.ui.timer);
								}
								this.ui.timer = setTimeout(function () {
									_this.ui.drawHandler(_this);
								}, delay);

							}
						}
					},
					originalRows: {
						//数据源发生变化时候重新分页
						handler: function (newRowsData, oldRowsData) {
							//console.log('originalRows edit')
							//监视原始数据，分页后刷新显示数据 
							var gridConfig = NetStarGrid.configs[[this.$options.id]].gridConfig;
							//编辑模式下需要清除unsaved class 且不分页，所以行下标就可以对应数据下标
							if (gridConfig.ui.isEditMode) {
								var $trs = gridConfig.domParams.contentTableContainer.$dom.find('tbody tr');
								for (var trI = 0; trI < $trs.length; trI++) {
									if (typeof (newRowsData[trI]) != 'object') {
										$trs.eq(trI).find('td.unsaved').removeClass('unsaved');
									}
								}
							}
							var startLength = 0;
							if (gridConfig.data.isServerMode) {
								startLength = NetStarGrid.configs[[this.$options.id]].vueObj.domParams.toPageInput.value - 1;
							}
							if (NetStarGrid.configs[[this.$options.id]].vueObj.page.start == 0) {
								startLength = 0;
							}
							dataManager.setOriginalRowsByColumnConfig(gridConfig.columns, this); // lyw 20190730 根据列配置设置原始数据
							dataManager.toPageByNumber(startLength, gridConfig, this);
							// 设置查看按钮
							if (gridConfig.ui.displayMode != 'treeGrid') {
								setViewConfig(NetStarGrid.configs[[this.$options.id]]);
							}
							if (typeof (gridConfig.ui.originalRowsChangeHandler) == "function") {
								gridConfig.ui.originalRowsChangeHandler(newRowsData, oldRowsData);
							}
						}
					}
				},
				methods: {
					searchInputKeyupHandler: function () {
						console.log('1 searchInputKeyupHandler')
					},
					filterSearchHandler: function () {
						console.log('2 filterSearchHandler')
					},
					checkAllSelect: function (ev) {
						console.log(ev)
					},
					rowBtnClickHandler: function (ev) {
						console.log(ev)
					},
					//header和footer表格跟随内容表格移动
					scrollXContentTable: function (ev) {
						methodsManager.scrollXTableHandler(ev, this);
					},
					scrollYContentTable: function (ev) {
						methodsManager.scrollYTableHandler(ev, this);
					},
					contentWheelHandler: function (ev) {
						methodsManager.contentWheelHandler(ev, this);
					},
					//footer部分的方法
					togglePageLengthSelect: function (ev) {
						methodsManager.footer.togglePageLengthSelect(ev, this);
					},
					selectPageLength: function (ev) {
						methodsManager.footer.selectPageLength(ev, this);
					},
					toPage: function (toPageStr) {
						methodsManager.footer.toPage(toPageStr, this);
					},
					toggleToPageSelect: function (ev) {
						methodsManager.footer.toggleToPageSelect(ev, this);
					},
					selectToPage: function (ev) {
						methodsManager.footer.selectToPage(ev, this);
					},
					//body 行选中
					rowClickHandler: function (ev) {
						methodsManager.body.rowClickHandler(ev, this);
					},
					rowdbClickHandler: function (ev) {
						methodsManager.body.rowdbClickHandler(ev, this);
					},
					checkboxSelelctHandler: function (ev) {
						methodsManager.body.checkboxSelelctHandler(ev, this);
					},
					//设置行状态标记
					netstarRowStateFlag: function (data) {
						return methodsManager.body.rowStateClassHandler(data, this);
					},
					//如果是treeGrid列表展示形式需要添加classs sjj 20190627
					netstarTreeGridFlag: function (data) {
						return methodsManager.body.addClassByRowData(data, this);
					},
					//设置列状态标记
					NetstarTdStateFlag: function (data, column) {
						return methodsManager.body.columnStateClassHandler(data, column, this);
					},
					NetstarTdStyle: function (data, column, rowIndex) {
						return methodsManager.body.columnStyleByTd(data, column, rowIndex, this);
					},
					//手动输入显示每页条数
					inputEnterPageLength: function (ev) {
						methodsManager.footer.inputEnterPageLength(ev, this);
					},
					//手动输入当前显示第几页
					inputEnterToPage: function (ev) {
						methodsManager.footer.inputEnterToPage(ev, this);
					},
					NetStarColumnStateText: function (data, columnCofig) {
						var returnValue = workItemStateManage.word[data[columnCofig.field]];
						return returnValue ? returnValue : '';
					},
					NetstarColumnStateIcon: function (data, columnCofig) {
						var iconClassStr = workItemStateManage.icon[data[columnCofig.field]];
						return iconClassStr ? iconClassStr : '';;
					},
					//sjj 20190316 根据排序类型添加class
					NetstarOrderClass: function (column) {
						var orderClassStr = '';
						switch (column.orderType) {
							case 'asc':
								orderClassStr = 'sorting-asc';
								break;
							case 'desc':
								orderClassStr = 'sorting-desc';
								break;
							case 'default':
								orderClassStr = 'sorting';
								break;
							default:
								orderClassStr = 'sorting-disabled';
								break;
						}
						if (column.isTreeNode) {
							//当前列作为树节点
							orderClassStr = 'td-tree-control';
						}
						return orderClassStr;
					},
					//sjj 20190316 类排序事件
					columnOrderHandler: function (ev) {
						methodsManager.columnOrderHandler(ev, this);
					},
					//sjj 20190410 行内超链接跳转
					rowHrefLinkJump: function (ev) {
						methodsManager.rowHrefLinkJump(ev, this);
					},
					//sjj 20190624 树节点
					rowTreeNodeOpen: function (ev, index) {
						methodsManager.rowTreeNodeOpen(ev, index, this);
					},
					// 多值输入 lyw 20190725
					cubesInputOpen: function (ev, index, columnCofig, rowData) {
						ev.stopPropagation();
						methodsManager.cubesInputOpen(ev, index, columnCofig, rowData, _gridConfig, this);
					},
					// 标准值输入 lyw 20190822
					standardInputOpen: function (ev, index, columnCofig, rowData) {
						ev.stopPropagation();
						methodsManager.standardInputOpen(ev, index, columnCofig, rowData, _gridConfig, this);
					},
					// 生成预览pdf
					buildPdfFunc: function (ev, index, columnCofig, rowData) {
						ev.stopPropagation();
						methodsManager.buildPdfFunc(ev, index, columnCofig, rowData, _gridConfig, this);
					},
					//json数据转list表格
					jsonToListByClick:function(ev,index,columnCofig,rowData){
						ev.stopPropagation();
						methodsManager.jsonToListByClick(ev, index, columnCofig, rowData, _gridConfig, this);
					}
				},
				mounted: function () {
					//初始化表格的body，以及三个主要Table对象 都是$dom对象
					methodsManager.initDomParams(this);
					//如果存在数据源 data.dataSource 则需要刷新纵向滚动条的高度
					methodsManager.refreshScrollY(this);
					//如果开启了支持拖拽列宽，需要支持拖拽列宽的操作  sjj 20190318
					if (this.ui.dragWidth) {
						methodsManager.dragWidth(this);
					}
					// lyw 20190716 判断是否设置了全部选中
					var originalRows = this.originalRows;
					if (originalRows.length > 0) {
						var isAllCheckSelect = true;
						for (var i = 0; i < originalRows.length; i++) {
							if (typeof (originalRows[i].netstarCheckboxSelectedFlag) != "boolean" || originalRows[i].netstarCheckboxSelectedFlag == false) {
								isAllCheckSelect = false;
								break;
							}
						}
						if (isAllCheckSelect) {
							var $label = this.domParams.headerTable.$dom.find('.checkbox-inline');
							$label.addClass('checked');
						}
					}
					if (_gridConfig.ui.isPage) {
						// 设置分页 lyw 20190906
						dataManager.toPageByNumber(0, _gridConfig, this);
					}
				},
				updated: function () {
					//刷新数据源了，则需要重新设定滚动条的高度
					var isRefreshSource = this.$options.contentTableAttr.isRefreshSource;
					if (isRefreshSource) {
						methodsManager.refreshScrollY(this);


						// var $images = $('#' + this.domParams.contentTable.id + ' tbody');
						// if ($images.length > 0) {
						// 	var options = {
						// 		url: 'data-original',
						// 		toggleOnDblclick:false,
						// 	};
						// 	if (this.imageByViewer) {
						// 		this.imageByViewer.destroy();
						// 	}
						// 	this.imageByViewer = new Viewer($images[0], options);
						// 	/*var imgLength = 0;
						// 	$.each(this.imageByViewer.images,function(key,value){
						// 		var src = $(value).attr('src');
						// 		if(src){
						// 			imgLength++;
						// 		}
						// 	});
						// 	this.imageByViewer.length = imgLength;*/
						// }
					}
				},
				//需要自动计算的变量
				computed: {}

			};
			//单元格编辑，如果没有编辑权限则不能进入编辑模式， 需要根据config文件生成新方法
			vueConfig.methods.tdClickHandler = function (ev,index, columnCofig, rowData) {
				methodsManager.tdClickHandler(ev, _gridConfig, vueConfig,rowData);
			}
			return vueConfig;
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

			//拖拽handler容器位置修改
			var leftStr = '-' + scrollLeft + 'px';
			_vueConfig.$data.domParams.dragContainer.style = {left: leftStr};
		},
		//表格单元格的单击事件
		tdClickHandler: function (ev, gridConfig, vueConfig,rowData) {
			var $td = $(ev.currentTarget);
			if (gridConfig.ui.isEditMode) {
				tdEditor.show($td, gridConfig, vueConfig);
			} else {
				//不支持编辑模式 可以稍微做一点响应 用于提示
				//sjj 20200107 判断当前点击的列
				var colField = $td.attr('ns-field');
				if(colField == 'NETSTAR-AUTOSERIAL'){
					var html = '';
					for(var colI in gridConfig.columnById){
						var cData = gridConfig.columnById[colI];
						var valueStr = rowData[cData.field] ? rowData[cData.field] : '';
						if(!cData.hidden){
							html += '<li>'+cData.title+'：'+valueStr+'</li>';
						}
					}
					var copyId = 'copy-'+gridConfig.id;
					if($('#'+copyId).length > 0){
						$('#'+copyId).remove();
					}
					var leftOffset = $td.offset().left;
					var topOffset = $td.offset().top;
					if($('#'+gridConfig.id).closest('container').length == 1){
						$('#'+gridConfig.id).closest('container').append('<div class="pt-intro-copy" id="'+copyId+'" style="left:'+leftOffset+'px;top:'+topOffset+'px;"><ul>'+html+'</ul></div>');
					}else{
						$('body').append('<div class="pt-intro-copy" id="'+copyId+'" style="left:'+leftOffset+'px;top:'+topOffset+'px;z-index:9999;"><ul>'+html+'</ul></div>');
					}
					$('#'+copyId+' ul > li').on('click',function(ev){
						var $this = $(this);
						var valueStr = $this.text();
						valueStr = valueStr.split('：')[1];
						NetStarUtils.getCopyByValue(valueStr);
						$this.closest('.pt-intro-copy').remove();
					});
					function outClickHandlerByCopyTr(ev){
						var isOut = $(ev.target).closest('.pt-intro-copy').length == 0;
						if(isOut){
							if(ev.target.className == 'autoserial copy-autoserial'){
								isOut = false;
							}
						}
						if(isOut){
							$('.pt-intro-copy').remove();
							$('body').off('click',outClickHandlerByCopyTr);
						}
					}
					$('body').on('click',outClickHandlerByCopyTr);
				}
			}
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
			if (vueConfig.ui.displayMode == 'block') {
				isScroll = false;
			}
			if (isScroll) {
				//如果需要 则显示滚动条并写入高度
				vueConfig.domParams.scrollY.$dom.parent().css({
					'visibility': 'visible',
					'padding-bottom':'28px', //cy 20200307 纵向滚动条容器本身也需要边距
				});
				//sjj 20190509如果有纵向滚动条则需要有一行行高的边距值
				vueConfig.domParams.contentTableContainer.style['padding-bottom'] = '28px';
			} else {
				//如果不需要 则不显示滚动条 高度写入无关紧要
				vueConfig.domParams.scrollY.$dom.parent().css({
					'visibility': 'hidden'
				});
			}
		},
		//在内容表格滚动滚轮
		contentWheelHandler: function (ev, _vueConfig) {
			if (ev.ctrlKey) {
				//如果按下了ctrl 现在浏览器很可能是默认为缩放表格了
				ev.preventDefault();
			}
			var currentTime = moment().format('x');
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

				var yscrollHeight = _vueConfig.domParams.scrollY.$dom.parent().scrollTop();
				var yHeight = _vueConfig.domParams.scrollY.$dom.parent().outerHeight();
				var $trs = _vueConfig.domParams.contentTable.$dom.find('tbody tr');
				var tableHeight = _vueConfig.domParams.contentTable.$dom.outerHeight();
				var contentTableHeight = $contentTableContainer.outerHeight();
				
				for (var rowI = 0; rowI < _vueConfig.rows.length; rowI++) {
					var rowData = _vueConfig.rows[rowI];
					if (rowData.netstarSelectedFlag) {
						selectIndex = rowI;
						rowData.netstarSelectedFlag = false;
					}
				}
				var nowTime = moment().format('x');
				var diffTime = nowTime - currentTime;
				var targetSelectedIndex = selectIndex; //即将选中的行下标
				var findPosition;
				if (ev.deltaY > 0) {
					//实际值是100 发生了向下滚动
					findPosition = 'after';
					targetSelectedIndex = selectIndex < _vueConfig.rows.length - 1 ? selectIndex + 1 : selectIndex;
				} else {
					//实际值是-100 向上滚动
					findPosition = 'before';
					targetSelectedIndex = selectIndex >= 1 ? selectIndex - 1 : selectIndex;
				}
				if (_vueConfig.ui.displayMode == 'treeGrid') {
					if (_vueConfig.rows[selectIndex].isParent) {
						//当前节点是父节点并且处于关闭状态
						if (!_vueConfig.rows[selectIndex].netstarExpand) {
							//当前节点没有展开子节点滚轮选中需要选中到下一个不包含在此文件的行
							var findIndex = NetStarUtils.getParentIndexBySelectedIndex(_vueConfig.rows, selectIndex, findPosition);
							if (findIndex > -1) {
								targetSelectedIndex = findIndex;
							}
						}
					}
				}
				//var trHeight = 0;
				//for(var i = 0; i<(selectIndex-1); i++){
				//trHeight += $trs.eq(i).outerHeight();
				//}
				var diffHeight = 0;
				var trIndex = -1;
				//当前滚动是否已经滚动到底部 如果是则不重新计算位置
				var isCount = true;
				if (targetSelectedIndex == _vueConfig.rows.length - 1) {
					//当前是最后一条数据
					isCount = false;
					if (_vueConfig.rows[targetSelectedIndex].netstarSelectedFlag === true) {
						targetSelectedIndex = targetSelectedIndex - 1;
					}
				} else if ((tableHeight - yscrollHeight) < contentTableHeight) {
					isCount = false;
					if (findPosition == 'after') {
						if($trs.eq(targetSelectedIndex).length == 1){
							if ($trs.eq(targetSelectedIndex).position().top < 0) {
								var sIndex = -1;
								for (var rowI = 0; rowI < _vueConfig.rows.length; rowI++) {
									var rowData = _vueConfig.rows[rowI];
									var $tr = $trs.eq(rowI);
									var positionTop = $tr.position().top;
									if (positionTop == -1 || positionTop > 0) {
										sIndex = rowI;
										break;
									}
								}
								if (sIndex > -1) {
									targetSelectedIndex = sIndex;
								}
							}
						}
					}
				}
				if (isCount) {
					if (yscrollHeight == 0 && diffHeight == 0 && findPosition == 'before') {
						targetSelectedIndex = 0;
					} else {
						for (var rowI = 0; rowI < _vueConfig.rows.length; rowI++) {
							var rowData = _vueConfig.rows[rowI];
							var $tr = $trs.eq(rowI);
							var offsetTop = $tr.offset().top;
							var positionTop = $tr.position().top;
							if (offsetTop < yscrollHeight && (positionTop == -1 || positionTop > 0)) {
								trIndex = rowI;
								diffHeight = offsetTop;
								break;
							}
						}
						if (findPosition == 'before' && targetSelectedIndex < trIndex) {
							//向上滚动，位置应该要比替换的大
						} else {
							if (yscrollHeight > 0 && diffHeight > 0 && trIndex > -1) {
								targetSelectedIndex = trIndex;
							}
						}
					}
				}

				//_vueConfig.ui.displayMode treeGrid 判断当前滑动行是不是父节点如果是并且是折叠状态，滑动的时候要跳到下一个可见的节点
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
					// 执行选中回调事件
					var configs;
					var id = _vueConfig.$options.id;
					switch (_vueConfig.ui.displayMode) {
						case 'block':
							configs = NetstarBlockList.configs[id];
							break;
						case 'table':
						default:
							configs = NetStarGrid.configs[id];
							break;
					}
					var gridConfig = configs.gridConfig;
					if (typeof (gridConfig.ui.selectedHandler) == "function") {
						gridConfig.ui.selectedHandler(_vueConfig.rows[targetSelectedIndex], _vueConfig.$data, _vueConfig, gridConfig);
					}
				}
			}
		},
		//sjj 20190318 拖拽列宽
		dragWidth: function (_vueConfig) {
			//如果有拖拽控制器，则清除
			var $handlers = $('#' + _vueConfig.domParams.dragContainer.id + ' .handler');
			//添加事件
			$handlers.off('click');
			$handlers.on('click', function (ev) {
				ev.stopPropagation();
			})
			$handlers.off('mousedown');
			$handlers.on('mousedown', {
				vueConfig: _vueConfig
			}, function (ev) {
				ev.stopPropagation();
				var vueConfig = ev.data.vueConfig;
				var $handler = $(this);
				$handler.addClass('pt-move');
				var tdField = $handler.attr('ns-field');
				var gridId = vueConfig.domParams.container.id;
				var grid = NetStarGrid.configs[gridId];
				var evData = {
					tdField: tdField,
					left: $handler.offset().left,
					columnConfig: grid.gridConfig.columnById[tdField],
					gridId: gridId,
					startX: ev.pageX,
					$dom: $handler
				};
				var tableWidth = grid.vueObj.ui.tableWidth - grid.vueObj.columnById[tdField].width;

				function dragWidthMouseMove(mouseMoveEvent) {
					mouseMoveEvent.stopPropagation();
					var startX = mouseMoveEvent.data.startX;
					var startLeft = mouseMoveEvent.data.left;
					var currentX = mouseMoveEvent.pageX;
					var tdField = mouseMoveEvent.data.tdField;

					var offsetX = currentX - startX; //移动值
					//console.log('offsetX:'+offsetX);
					//未使用tab
					var moveLeft = startLeft + offsetX;
					//var currentWidth = currentX - startX + baseWidth;
					var currentWidth = offsetX + mouseMoveEvent.data.columnConfig.originalWidth;
					var gridId = mouseMoveEvent.data.gridId;
					var configs = NetStarGrid.configs[gridId];
					var minwidth = configs.vueObj.columnById[tdField].minwidth;
					if (currentWidth < minwidth) {
						return;
					}
					configs.vueObj.columnById[tdField].width = currentWidth;
					configs.vueObj.columnById[tdField].styleObj.width = (currentWidth - 1) + 'px';
					configs.vueObj.columnById[tdField].styleObj["max-width"] = (currentWidth - 1) + 'px';
					//减去原始占用的列宽加上现在的列宽
					configs.vueObj.ui.tableWidth = tableWidth + currentWidth;
					configs.vueObj.domParams.headerTable.style.width = configs.vueObj.ui.tableWidth + 'px'; //标题头 样式列宽
					configs.vueObj.domParams.contentTable.style.width = configs.vueObj.ui.tableWidth + 'px';
					configs.vueObj.domParams.footerTable.style.width = configs.vueObj.ui.tableWidth + 'px';

					configs.vueObj.domParams.scrollX.style.width = configs.vueObj.ui.tableWidth + 'px'; //横向滚动条的列宽
					//判断是否需要横向滚动条
					var isUse = configs.vueObj.ui.tableWidth > configs.vueObj.ui.containerWidth;
					configs.vueObj.domParams.scrollX.isUse = isUse;
					if (isUse == false) {
						configs.vueObj.domParams.scrollX.containerStyle = {
							visibility: "hidden",
						}
					} else {
						configs.vueObj.domParams.scrollX.containerStyle = {
							visibility: "visible",
						}
						//如果横向滚动条可见，则需要容器增加padding
						configs.vueObj.domParams.contentTableContainer.style['padding-bottom'] = configManager.DEFAULT.PADDINGBOTTOM + 'px';
					}
					//console.log(moveLeft)
					configManager.getDragColumnsConfig(configs.gridConfig); //拖拽列的举例计算
				}

				function dragWidthMouseUp(mouseUpEvent) {
					mouseUpEvent.stopPropagation();
					mouseUpEvent.data.$dom.attr('class', 'handler');
					var gridId = mouseUpEvent.data.gridId;
					var cwGridId = 'cw-' + gridId;
					/*******************sjj 20190917 start */
					/***
					 * sjj 2019 0917 添加判断 如果模板页支持多开 
					 * 表格id是根据包名生成的，这样同一个表格会出现多个id，
					 * 但由于配置相同 所以需要给本地存储的时候按一个id去存储
					 */
					var _gridConfig = NetStarGrid.configs[gridId].gridConfig;
					if (_gridConfig.package) {
						var packageNameSplit = _gridConfig.package.split('.');
						//判断最后一个是否是时间戳
						var lastPackageStr = packageNameSplit[packageNameSplit.length - 1];
						if (Number(lastPackageStr)) {
							if (_gridConfig.templateId.indexOf(lastPackageStr) > -1) {
								cwGridId = 'cw-'+  _gridConfig.templateId.substring(0, _gridConfig.templateId.length - lastPackageStr.length - 1) + _gridConfig.id.substring(_gridConfig.id.indexOf('-list'));
							} else {
								cwGridId = 'cw-' + _gridConfig.templateId + _gridConfig.id.indexOf('-list');
							}
						}
					}
					/*******************sjj 20190917 end */
					var tdField = mouseUpEvent.data.tdField;
					//var startX = mouseUpEvent.data.startX;
					//var currentX = mouseUpEvent.pageX;
					//当前单元格宽度和下面单元格的宽度
					var currentWidth = mouseUpEvent.data.columnConfig.width;
					mouseUpEvent.data.columnConfig.originalWidth = currentWidth;
					var gridStorageData = store.get(cwGridId);
					if (typeof (gridStorageData) == 'undefined') {
						//该表格没有被存储
						gridStorageData = {
							field: {}
						};
					}
					//非tab模式直接存当前列的宽度
					if (typeof (gridStorageData.field[tdField]) == 'undefined') {
						gridStorageData.field[tdField] = {
							w: currentWidth
						};
					} else {
						gridStorageData.field[tdField].w = currentWidth;
					}
					//缓存处理
					gridStorageData.timestamp = new Date().getTime();
					store.set(cwGridId, gridStorageData);
					$(document).off("mousemove", dragWidthMouseMove);
					$(document).off("mouseup", dragWidthMouseUp);
					//调用保存
				}
				$(document).on("mousemove", evData, dragWidthMouseMove);
				$(document).on('mouseup', evData, dragWidthMouseUp);
			})
		},
		body: {
			//选中行的操作
			rowClickHandler: function (ev, _vueData) {
				var target = ev.target;
				if(target.tagName.toLowerCase() === 'img'){
					var $images = $('#' + _vueData.domParams.contentTable.id + ' tbody');
					if ($images.length > 0) {
						var options = {
							url: 'data-original',
							toggleOnDblclick:false,
						};
						if (_vueData.imageByViewer) {
							_vueData.imageByViewer.destroy();
						}
						_vueData.imageByViewer = new Viewer($images[0], options);
					}
				  	return;
				}
				var id = _vueData.$options.id;
				var configs;
				var rowIndex = -1;
				var rows = _vueData.$data.rows;
				switch (_vueData.ui.displayMode) {
					case 'block':
						configs = NetstarBlockList.configs[id];
						rowIndex = $(ev.target).closest('div[ns-rowindex]').attr('ns-rowindex');
						break;
					case 'table':
					default:
						configs = NetStarGrid.configs[id];
						var $tr = $(ev.target).closest('tr');
						rowIndex = $tr.attr('ns-rowindex');
						break;
				}
				var gridConfig = configs.gridConfig;
				rowIndex = parseInt(rowIndex);
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
					var _rowIndex = rowIndex;
					if (gridConfig.data.isServerMode == false) {
						//客户端获取数据
						rowData = originalRows[rowIndex + configs.vueConfig.data.page.start];
						_rowIndex = rowIndex + configs.vueConfig.data.page.start;
					} else {
						rowData = originalRows[rowIndex];
					}
					dataManager.formatSingleRowData(rowData, gridConfig.columnById);
					//返回参数中第一个永远是操作行数据，从第二个参数中可以通过判断netstarSelectedFlag获取多选状态下的
					var callbackData = gridConfig.ui.selectedHandler(rowData, _vueData.$data, _vueData, gridConfig, _rowIndex);
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
				if ($(ev.target).hasClass('disabled')) {
					return;
				}
				var configs = NetStarGrid.configs[id];
				var rowIndex = $tr.attr('ns-rowindex');
				switch (_vueData.ui.displayMode) {
					case 'block':
						configs = NetstarBlockList.configs[id];
						rowIndex = $(ev.target).closest('.pt-block-list').attr('ns-rowindex');
						break;
				}
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
					} else {
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
				var configs;
				var rowIndex = $tr.attr('ns-rowindex');
				switch (_vueData.ui.displayMode) {
					case 'block':
						configs = NetstarBlockList.configs[id];
						rowIndex = $(ev.target).closest('.pt-block-list').attr('ns-rowindex');
						break;
					case 'table':
					default:
						configs = NetStarGrid.configs[id];

						break;
				}
				rowIndex = parseInt(rowIndex);
				var gridConfig = configs.gridConfig;

				var rows = _vueData.$data.rows;
				var rowData = rows[rowIndex];
				var originalRows = configs.vueConfig.data.originalRows;
				if (gridConfig.data.isServerMode == false) {
					//客户端获取数据
					rowData = originalRows[rowIndex + configs.vueConfig.data.page.start];
				} else {
					rowData = originalRows[rowIndex];
				}
				// 如果行只读则不执行双击回调
				if(rowData['NETSTAR-TRDISABLE']){
					nsAlert('当前行数据禁用', 'warning');
					console.warn('当前行数据禁用');
					return false;
				}
				dataManager.formatSingleRowData(rowData, gridConfig.columnById);
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
				var rowClassStr = '';
				if (!configManager.SYSTEMCOLUMNS.MSGSTATE.isColumn) {
					var msgstateConfig = configManager.SYSTEMCOLUMNS.MSGSTATE.data;
					rowClassStr = workItemStateManage.trtd[data[msgstateConfig.field]] ? workItemStateManage.trtd[data[msgstateConfig.field]] : '';
				}
				// if (_vueData.ui.isUseMessageState) {
				// 	if (data['NETSTAR-TRDISABLE']) {
				// 		rowClassStr += ' tr-disabled';
				// 	}
				// }
				return rowClassStr;
			},
			//treeGrid 添加class sjj
			addClassByRowData: function (data, _vueData) {
				var rowClassStr = '';
				if (_vueData.ui.displayMode == 'treeGrid') {
					if (data.isParent) {
						if (data.netstarExpand) {
							rowClassStr = 'tr-close-mark';
						} else {
							rowClassStr = 'tr-open-mark';
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
						columnClassStr = workItemStateManage.trtd[data[column.field]] ? workItemStateManage.trtd[data[column.field]] : '';
						break;
					case 'autoserial':
						// sjj 20200107 如果允许复制 显示复制图标 否则显示箭头图标
						if(_vueData.ui.isAllowCopy){
							columnClassStr = 'copy-autoserial';
						}
						break;
				}
				return columnClassStr;
			},
			columnStyleByTd: function (data, column, _rowIndex, _vueData) {
				var styleStr = column.styleObj;
				var styleExpress = _vueData.ui.styleExpress;
				var key = column.field;
				if (!$.isEmptyObject(styleExpress[key])) {
					//针对单元格添加样式
					var isServerMode = _vueData.isServerMode;
					if ($.isArray(_vueData.originalRows)) {
						if (_vueData.originalRows.length > 0) {
							var rowData = _vueData.originalRows[_rowIndex];
							if (isServerMode == false) {
								rowData = _vueData.originalRows[_rowIndex + _vueData.page.start];
							}
							if (!$.isEmptyObject(rowData)) {
								styleStr = NetStarUtils.getStyleByCompareValue({
									rowData: rowData,
									tdField: key,
									styleExpress: styleExpress[key]
								});
							}
							// if (!$.isEmptyObject(styleStr)) { // lyw注释,原因:条件不合适时styleExpress不反回样式为空,将不与现在样式拼，表格错位
								//存在样式表
								nsVals.extendJSON(styleStr, column.styleObj);
							// }
						}
					}
				}
				return styleStr;
			},
			//是否需要添加半选状态
			setUserAllSelectCheckState: function (_vueData, displayMode) {
				//当前选中的行 和 当前显示的行数据进行比较 长度相同则是全选 否则是半选
				var $headerTable = _vueData.domParams.headerTable.$dom;
				var rows = _vueData.$data.rows; //当前显示的行数据
				var id = _vueData.$options.id; //容器id
				var checkedSelectData = NetStarGrid.getCheckedData(id, displayMode); //获取当前选中行
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
		},
		footer: {
			//切换 选择页面长度下拉框 是否显示
			togglePageLengthSelect: function (ev, _vueConfig) {
				var isShow = _vueConfig.$data.domParams.pageLengthSelect.isShow;
				//现在隐藏则显示，现在显示则隐藏
				var setShow = !isShow;
				_vueConfig.$data.domParams.pageLengthSelect.isShow = setShow;
				//sjj 20190507 如果当前是显示则要添加点击不包含此区域的其他位置时关闭当前弹出的页面长度下拉框
				if (setShow) {
					function documentPageLengthSelect(ev) {
						var target = ev.target;
						var pageLengthSelect = ev.data.pageLengthSelect;
						var elementSetting = $('#' + pageLengthSelect.id).parent()[0];
						if (elementSetting != target && !$.contains(elementSetting, target)) {
							pageLengthSelect.isShow = false;
							$(document).off('click', documentPageLengthSelect);
						}
					}
					$(document).on('click', {
						pageLengthSelect: _vueConfig.$data.domParams.pageLengthSelect
					}, documentPageLengthSelect);
				}
			},
			//选中 切换页面长度
			selectPageLength: function (ev, _vueData) {
				var pageLength = _vueData.domParams.pageLengthInput.value;
				var selectPageLength = $(ev.srcElement).attr('ns-data-value');
				selectPageLength = parseInt(selectPageLength);

				if (pageLength != selectPageLength) {
					_vueData.domParams.pageLengthInput.value = selectPageLength;
					var id = _vueData.domParams.container.id;
					//修改默认的分页数量
					//var gridConfig = NetStarGrid.configs[id].gridConfig;
					var gridConfig = {};
					if (NetStarGrid.configs[id]) {
						gridConfig = NetStarGrid.configs[id].gridConfig;
					} else {
						gridConfig = NetstarBlockList.configs[id].gridConfig;
					}
					gridConfig.ui.pageLengthDefault = selectPageLength;
					dataManager.toPageByNumber(0, gridConfig, _vueData);
					dataManager.getServerModeData(gridConfig); //sjj 20190402 ajax调用服务端请求
				}
				_vueData.domParams.pageLengthSelect.isShow = false;
			},
			//跳转到指定页面
			toPage: function (pageStr, _vueData) {
				//pageStr:string  跳转到页面 有四个固定的值 first prev next last 
				var id = _vueData.domParams.container.id;
				var girdConfig = {};
				if (NetStarGrid.configs[id]) {
					girdConfig = NetStarGrid.configs[id].gridConfig;
				} else {
					girdConfig = NetstarBlockList.configs[id].gridConfig;
				}
				var currentPageNumber = _vueData.domParams.toPageInput.value - 1; //当前页 第一页是1 减去1后是0
				var pageLength = _vueData.domParams.toPageSelect.length; //共多少页
				var toPageNumber = 0;
				if (typeof (pageLength) == 'undefined') {
					pageLength = 1;
				}
				switch (pageStr) {
					case 'first':
						toPageNumber = 0;
						break;
					case 'prev':
						toPageNumber = currentPageNumber - 1;
						if (toPageNumber < 0) {
							toPageNumber = 0;
						}
						break;
					case 'next':
						toPageNumber = currentPageNumber + 1;
						if (toPageNumber > pageLength - 1) {
							toPageNumber = pageLength - 1;
						}
						break;
					case 'last':
						toPageNumber = pageLength - 1;
						break;
				}
				if (toPageNumber != currentPageNumber) {
					dataManager.toPageByNumber(toPageNumber, girdConfig, _vueData);
					dataManager.getServerModeData(girdConfig); //sjj 20190402 ajax调用服务端请求
				}

			},
			//切换是否显示页面下拉框
			toggleToPageSelect: function (ev, _vueData) {
				var isShow = _vueData.domParams.toPageSelect.isShow;
				//现在隐藏则显示，现在显示则隐藏
				var setShow = !isShow;
				_vueData.domParams.toPageSelect.isShow = setShow;
				//sjj 20190507 如果当前是显示则要添加点击不包含此区域的其他位置时关闭当前弹出的页面长度下拉框
				if (setShow) {
					function documentToPageSelect(ev) {
						var target = ev.target;
						var toPageSelect = ev.data.toPageSelect;
						var elementSetting = $('#' + toPageSelect.id).parent()[0];
						if (elementSetting != target && !$.contains(elementSetting, target)) {
							toPageSelect.isShow = false;
							$(document).off('click', documentToPageSelect);
						}
					}
					$(document).on('click', {
						toPageSelect: _vueData.domParams.toPageSelect
					}, documentToPageSelect);
				}
			},
			selectToPage: function (ev, _vueData) {
				//需要从当前操作元素上读取页数
				var id = _vueData.domParams.container.id;
				//var girdConfig = NetStarGrid.configs[id].gridConfig;
				var girdConfig = {};
				if (NetStarGrid.configs[id]) {
					girdConfig = NetStarGrid.configs[id].gridConfig;
				} else {
					girdConfig = NetstarBlockList.configs[id].gridConfig;
				}
				var currentToPage = _vueData.domParams.toPageInput.value - 1;
				var toPageNumber = $(ev.srcElement).attr('ns-data-value');
				toPageNumber = parseInt(toPageNumber) - 1;

				if (currentToPage != toPageNumber) {
					dataManager.toPageByNumber(toPageNumber, girdConfig, _vueData);
					dataManager.getServerModeData(girdConfig); //sjj 20190402 ajax调用服务端请求
				}
				_vueData.domParams.toPageSelect.isShow = false;
			},
			//通过文本输入显示每页显示条数
			inputEnterPageLength: function (ev, _vueData) {
				var pageLength = _vueData.domParams.pageLengthInput.value;
				var selectPageLength = $(ev.srcElement).val();
				selectPageLength = parseInt(selectPageLength);

				if (pageLength != selectPageLength) {
					_vueData.domParams.pageLengthInput.value = selectPageLength;
					var id = _vueData.domParams.container.id;
					//修改默认的分页数量
					//var gridConfig = NetStarGrid.configs[id].gridConfig;
					var gridConfig = {};
					if (NetStarGrid.configs[id]) {
						gridConfig = NetStarGrid.configs[id].gridConfig;
					} else {
						gridConfig = NetstarBlockList.configs[id].gridConfig;
					}
					gridConfig.ui.pageLengthDefault = selectPageLength;
					dataManager.toPageByNumber(0, gridConfig, _vueData);
					dataManager.getServerModeData(gridConfig); //sjj 20190402 ajax调用服务端请求
				}
				_vueData.domParams.pageLengthSelect.isShow = false;
			},
			//通过文本输入显示当前是第几页
			inputEnterToPage: function (ev, _vueData) {
				//需要从当前操作元素上读取页数
				var id = _vueData.domParams.container.id;
				//var girdConfig = NetStarGrid.configs[id].gridConfig;
				var girdConfig = {};
				if (NetStarGrid.configs[id]) {
					girdConfig = NetStarGrid.configs[id].gridConfig;
				} else {
					girdConfig = NetstarBlockList.configs[id].gridConfig;
				}
				var currentToPage = _vueData.domParams.toPageInput.value - 1;
				var toPageNumber = $(ev.srcElement).val();
				toPageNumber = parseInt(toPageNumber) - 1;

				if (currentToPage != toPageNumber) {
					dataManager.toPageByNumber(toPageNumber, girdConfig, _vueData);
					dataManager.getServerModeData(girdConfig); //sjj 20190402 ajax调用服务端请求
				}
				_vueData.domParams.toPageSelect.isShow = false;
			}
		},
		//列排序事件
		columnOrderHandler: function (ev, _vueData) {
			var field = $(ev.target).attr('ns-field');
			var column = _vueData.columnById[field];
			// var orderable = typeof (column.orderable) == 'boolean' ? column.orderable : false;
			var orderable = typeof (column.orderable) == 'boolean' ? column.orderable : true;
			if (orderable) {
				var gridId = _vueData.domParams.container.id;
				var configs = NetStarGrid.configs[gridId];
				var isServerMode = configs.gridConfig.data.isServerMode;
				var rows = _vueData.rows;
				var originalRows = _vueData.originalRows;
				var orderType;
				switch (column.orderType) {
					case 'default':
						orderType = 'asc';
						break;
					case 'asc':
						orderType = 'desc';
						break;
					case 'desc':
						orderType = 'asc';
						break;
				}
				for (var columnField in _vueData.columnById) {
					_vueData.columnById[columnField].orderType = 'default';
				}
				column.orderType = orderType;
				if (isServerMode) {
					//服务端
					var data = NetStarGrid.configs[gridId].gridConfig.data.data;
					nsVals.extendJSON(data, {
						orderField: field,
						orderType: orderType
					});
					NetStarGrid.refreshById(gridId, data);
				} else {
					//客户端
					switch (orderType) {
						case 'desc':
							if (column.columnType == 'number') {
								/*rows.sort(function (a, b) {
									return b[field] - a[field];
								});*/
								originalRows.sort(function (a, b) {
									return b[field] - a[field];
								});
							} else {
								/*rows.sort(function (a, b) {
									if (a[field] < b[field]) return 1;
									if (a[field] > b[field]) return -1;
									return 0;
								});*/
								originalRows.sort(function (a, b) {
									if (a[field] < b[field]) return 1;
									if (a[field] > b[field]) return -1;
									return 0;
								});
							}
							break;
						case 'asc':
							if (column.columnType == 'number') {
								/*rows.sort(function (a, b) {
									return a[field] - b[field];
								});*/
								originalRows.sort(function (a, b) {
									return a[field] - b[field];
								});
							} else {
								/*rows.sort(function (a, b) {
									if (a[field] < b[field]) return -1;
									if (a[field] > b[field]) return 1;
									return 0;
								});*/
								originalRows.sort(function (a, b) {
									if (a[field] < b[field]) return -1;
									if (a[field] > b[field]) return 1;
									return 0;
								});
							}
							break;
					}
				}
			}
		},
		//sjj 20190410 行内超链接跳转
		rowHrefLinkJump: function (ev, _vueData) {
			var $this = $(ev.currentTarget);
			var field = $this.attr('ns-field');
			var columnConfig = _vueData.columnById[field];
			var formatHandler = columnConfig.formatHandler;
			var url = formatHandler.data.url;
			var titleStr = formatHandler.data.title ? formatHandler.data.title : '';
			var gridId = _vueData.$options.id; //容器id
			var $tr = $this.closest('tr');
			var originalRows = _vueData._data.originalRows;
			var rowIndex = Number($tr.attr('ns-rowindex'));
			var configs = NetStarGrid.configs[gridId];
			var gridConfig = configs.gridConfig;
			var rowData = $.extend(true, {}, originalRows[rowIndex]);
			if (gridConfig.data.isServerMode == false) {
				rowData = $.extend(true, {}, originalRows[rowIndex + _vueData.page.start]);
			}

			// 
			if(typeof(formatHandler.data.urlSubdata) == "string" && formatHandler.data.urlSubdata.length > -1){
				var urlSubdata = JSON.parse(formatHandler.data.urlSubdata);
				var subdataField = formatHandler.data.subdataField;
				var urlObj = false;
				var subdataFieldValue = rowData[subdataField];
				for(var i=0; i<urlSubdata.length; i++){
					var subdataObj = urlSubdata[i];
					if(subdataObj.value === subdataFieldValue){
						urlObj = subdataObj;
						break;
					}
				}
				if(urlObj){
					url = urlObj.url;
					if(typeof(url) == "string" && url.indexOf('http') != 0){
						url = getRootPath() + url;
					}
					if(typeof(urlObj.data) == "object"){
						var urlData = nsVals.getVariableJSON(urlObj.data, rowData);
						nsVals.extendJSON(rowData, urlData);
					}
					if(typeof(urlObj.title) == "string"){
						titleStr = urlObj.title;
					}
				}
			}
			if(typeof(url) != "string" || url.length == 0){
				nsAlert('没有找到url','error');
				console.error('没有找到url');
				return false;
			}
			//目前限制添加读取是根据模板id跳转的，所以需要判断是否存在模板id 
			if (gridId.indexOf('layout') > -1) {
				var packageName = '';
				if(gridConfig.package){
					packageName = gridConfig.package;
				}else{
					packageName = gridId.substring(18, gridId.lastIndexOf('-list'));
					packageName = packageName.replace(/\-/g, '.');
				}
				if (NetstarTemplate.templates.configs[packageName]) {
					if (!$.isEmptyObject(NetstarTemplate.templates.configs[packageName].pageParam)) {
						if(formatHandler.data.isFirstUseRow){
							nsVals.extendJSON(NetstarTemplate.templates.configs[packageName].pageParam, rowData);
						}else{
							nsVals.extendJSON(rowData, NetstarTemplate.templates.configs[packageName].pageParam);
						}
					}
				}
				var packageNameSufficStr = new Date().getTime();
				var idField = _vueData.idField;
				if(idField){
					packageNameSufficStr = rowData[idField] ? rowData[idField] : packageNameSufficStr;
				}
				var tempValueName = packageName + packageNameSufficStr;
				var isAllwaysNewTab = typeof(formatHandler.data.isAllwaysNewTab)=='boolean' ? formatHandler.data.isAllwaysNewTab : true;
				if(isAllwaysNewTab){
					tempValueName = {
						packageName: tempValueName,
						isMulitTab: isAllwaysNewTab,
					}
					tempValueName = JSON.stringify(tempValueName);
				}else{
					tempValueName = packageName;
				}
				if (typeof (NetstarTempValues) == 'undefined') {
					NetstarTempValues = {};
				}

				var templateName = formatHandler.data.templateName;
				var parameterFormat = {};
				if (formatHandler.data.parameterFormat) {
					var parameterFormat = JSON.parse(formatHandler.data.parameterFormat);
					if(parameterFormat.dialogType){
						templateName = parameterFormat.dialogType;
						parameterFormat = parameterFormat;
					}else{
						var chargeData = nsVals.getVariableJSON(parameterFormat, rowData);
						nsVals.extendJSON(rowData, chargeData);
					}
				}
				/***是否发送查询数据start***/
				if(formatHandler.data.isSendQueryModel){
					var gridData = gridConfig.data.data;
					if(typeof(gridData) == "object" && !$.isEmptyObject(gridData)){
						rowData.queryModel = gridData;
					}
				}
				/***是否发送查询数据end***/
				var readonly = typeof (formatHandler.data.readonly) == 'boolean' ? formatHandler.data.readonly : false;
				rowData.readonly = readonly;
				NetstarTempValues[tempValueName] = rowData;
				//businessDataBaseEditor  templateName
				if(url.indexOf('?')>-1){
					var search = url.substring(url.indexOf('?')+1,url.length);
					var paramsObj = search.split('&');
					var resultObject = {};
					for (var i = 0; i < paramsObj.length; i++){
						var idx = paramsObj[i].indexOf('=');
						if (idx > 0){
							resultObject[paramsObj[i].substring(0, idx)] = paramsObj[i].substring(idx + 1);
						}
					}
					$.each(resultObject, function (key, text) {
						NetstarTempValues[tempValueName][key] = text;
					});
					url = url.substring(0,url.indexOf('?'));
				}

				url = url + '?templateparam=' + encodeURIComponent(tempValueName);

				switch (templateName) {
					case 'businessDataBaseEditor':
						var ajaxConfig = {
							url: url,
							type: 'GET',
							dataType: 'html',
							context: {
								config: {
									value: rowData
								},
							},
							success: function (data) {
								var _config = this.config;
								var _configStr = JSON.stringify(_config);
								var funcStr = 'nsProject.showPageData(pageConfig,' + _configStr + ')';
								var starStr = '<container>';
								var endStr = '</container>';
								var containerPage = data.substring(data.indexOf(starStr) + starStr.length, data.indexOf(endStr));
								var exp = /NetstarTemplate\.init\((.*?)\)/;
								var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
								containerPage = containerPage.replace(containerPage.match(exp)[0], funcStrRep);
								var $container = nsPublic.getAppendContainer();
								$container.append(containerPage);
							}
						};
						// $.ajax(ajaxConfig);
						var pageConfig = {
							pageIidenti: url,
							url: url,
							plusData: {
								config: {
									value: rowData
								},
								gridId: gridId,
							},
							callBackFunc: function (isSuccess, data, _pageConfig) {
								if (isSuccess) {
									var _config = _pageConfig.plusData.config;
									var _configStr = JSON.stringify(_config);
									var funcStr = 'nsProject.showPageDataByGrid(pageConfig,' + _configStr + ',"' + _pageConfig.plusData.gridId + '")';
									var starStr = '<container>';
									var endStr = '</container>';
									var containerPage = data.substring(data.indexOf(starStr) + starStr.length, data.indexOf(endStr));
									var exp = /NetstarTemplate\.init\((.*?)\)/;
									var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
									containerPage = containerPage.replace(containerPage.match(exp)[0], funcStrRep);
									var $container = nsPublic.getAppendContainer();
									$container.append(containerPage);
								}
							}
						}
						pageProperty.getAndCachePage(pageConfig);
						break;
					case 'tree':
						var dialogConfig = {
							id: 'tree-dialog-component',
							title: titleStr,
							templateName: 'PC',
							height:520,
							width : 420,
							shownHandler : function(_shownData){
								var treeConfig = {
									container:_shownData.config.bodyId,
									selectMode:'single',
									readonly:readonly,
									editorConfig:{
										idField:parameterFormat.idField,
										textField:parameterFormat.textField,
										parentIdField:parameterFormat.parentIdField
									},
									ajax:{
										url:formatHandler.data.url,
										type:'get',
										dataSrc:'rows',
										contentType:'application/x-www-form-urlencoded',
										data:{id:rowData[parameterFormat.sendIdField]}
									},
									queryConfig:{
										id:'query-'+_shownData.config.bodyId
									},
									defaultPositionId:rowData[parameterFormat.sendIdField]
								};
								NetstarTreeList.init(treeConfig);
							}
						};
						NetstarComponent.dialogComponent.init(dialogConfig);
						break;
					default:
						if (!$.isEmptyObject(rowData)) {
							titleStr = NetStarUtils.getHtmlByRegular(rowData, titleStr);
						}
						NetstarUI.labelpageVm.loadPage(url, titleStr, isAllwaysNewTab,{},true);
						break;
				}
			}
		},
		//sjj 20190624 树节点单击展开节点事件
		rowTreeNodeOpen: function (ev, rowIndex, _vueData) {
			ev.preventDefault();
			ev.stopPropagation();
			var $this = $(ev.currentTarget);
			var $tr = $this.closest('tr');
			var nId = $tr.attr('ns-id'); //当前节点id
			var parentId = $tr.attr('primaryid'); //当前节点的父节点id 
			var nslevel = Number($tr.attr('nslevel'));
			var rows = _vueData.rows;
			var isSingleExpand = typeof (_vueData.ui.isSingleExpand) == 'boolean' ? _vueData.ui.isSingleExpand : true; //是否保持单节点展开
			var parendField = _vueData.ui.parentField;
			var idField = _vueData.idField;
			var rowData = rows[rowIndex]; //获取当前行数据

			function setAttrByRowData(pid, isOpen) {
				for (var rowI = 0; rowI < rows.length; rowI++) {
					var cData = rows[rowI];
					if (cData[parendField] == pid) {
						cData.netstarOpen = isOpen; //子节点是否显示
						var cOpen = isOpen;
						if (cData.isParent) {
							if (isOpen === true && cData.netstarExpand === false) {
								cOpen = false;
							}
						}
						setAttrByRowData(cData[idField], cOpen);
					}
				}
			}
			if (isSingleExpand) {
				//保持单节点展开
				//如果当前节点处于闭合状态此时要展开则把和其同级的先关闭
				if (!rowData.netstarExpand) {
					//当前是闭合状态需要改变成打开状态同时把同级的节点作为闭合状态
					for (var rowI = 0; rowI < rows.length; rowI++) {
						//先找到同级元素
						var treeData = rows[rowI];
						if (treeData[idField] == nId) {
							treeData.netstarExpand = true; //当前处于开启状态
							//如果当前是作为父节点则把其节点的open状态也打开
							setAttrByRowData(treeData[idField], true);
						} else if (treeData[parendField] == parentId) {
							treeData.netstarExpand = false; //把同级元素的展开操作改为关闭状态
							//如果当前是作为父节点则把其节点的open状态也关闭
							setAttrByRowData(treeData[idField], false);
						}
					}
				} else {
					//当前是展开状态需要关闭
					for (var rowI = 0; rowI < rows.length; rowI++) {
						//先找到同级元素
						var treeData = rows[rowI];
						if (treeData[idField] == nId) {
							treeData.netstarExpand = false; //当前处于开启状态
							//如果当前是作为父节点则把其节点的open状态也打开
							setAttrByRowData(treeData[idField], false);
						}
					}
				}
			} else {
				for (var rowI = 0; rowI < rows.length; rowI++) {
					if (rows[rowI][parendField] == nId) {
						rows[rowI].netstarOpen = !rows[rowI].netstarOpen; //子节点是否显示
						setAttrByRowData(rows[rowI][idField], rows[rowI].netstarOpen);
					}
					if (rows[rowI][idField] == nId) {
						rows[rowI].netstarExpand = !rows[rowI].netstarExpand; //当前节点是展开还是关闭状态
					}
				}
			}
		},
		// 多值输入 lyw 20190725
		cubesInputOpen: function (ev, index, columnCofig, rowData, gridConfig, vueConfig) {
			if (typeof (columnCofig.editConfig) == "object" && columnCofig.editConfig.type == "cubesInput") {
				if (typeof (columnCofig.editConfig.getAjax) == "object" && typeof (columnCofig.editConfig.getAjax.url) == "string") {} else {
					nsAlert('多值输入表单配置错误');
					return false;
				}
			} else {
				nsAlert('多值输入表单配置错误');
				return false;
			}
			var editConfig = columnCofig.editConfig;
			var originalRows = $.extend(true, [], vueConfig.originalRows);
			editConfig.relationData = {
				row: originalRows[index],
				table: originalRows,
			};
			if (typeof (gridConfig.getPageDataFunc) == "function") {
				editConfig.relationData.pageVo = gridConfig.getPageDataFunc();
			}
			var getAjaxData = NetstarComponent.commonFunc.getFormDataByTable(editConfig, 'getAjax');
			var cubesInputConfig = {
				type: 'dialog',
				id: gridConfig.id + '-cubes-input',
				readonly: typeof (columnCofig.editable) == "boolean" ? !columnCofig.editable : true,
			};
			var ajaxConfig = $.extend(true, {}, columnCofig.editConfig.getAjax);
			ajaxConfig.data = getAjaxData;
			ajaxConfig.plusData = {
				cubesInputConfig: cubesInputConfig,
				editConfig: columnCofig.editConfig,
			}
			NetStarUtils.ajax(ajaxConfig, function (res, _ajaxConfig) {
				if (res.success) {
					var dataSrc = _ajaxConfig.dataSrc;
					var data = typeof (dataSrc) == "string" && dataSrc.length > 0 ? res[dataSrc] : res;
					var cubesInputConfig = _ajaxConfig.plusData.cubesInputConfig;
					cubesInputConfig.confirmHandler = function (resData, _cubesInputConfig) {
						var saveAjax = $.extend(true, {}, columnCofig.editConfig.saveAjax);
						saveAjax.data = resData;
						console.log(resData);
						NetStarUtils.ajax(saveAjax, function (res, _ajaxConfig) {
							if (res.success) {
								nsAlert('保存成功');
							}
						})
					}
					NetstarCubesInput.init(cubesInputConfig, data);
				}
			});
		},
		// 标准值输入 lyw 20190725
		standardInputOpen: function (ev, index, columnCofig, rowData, gridConfig, vueConfig) {
			if (typeof (columnCofig.editConfig) == "object" && columnCofig.editConfig.type == "standardInput") {
				if (typeof (columnCofig.editConfig.ajax) == "object" && typeof (columnCofig.editConfig.ajax.url) == "string") {} else {
					nsAlert('标准值输入表单配置错误');
					return false;
				}
			} else {
				nsAlert('标准值输入表单配置错误');
				return false;
			}
			var editConfig = columnCofig.editConfig;
			var originalRows = $.extend(true, [], vueConfig.originalRows);
			editConfig.relationData = {
				row: originalRows[index],
				table: originalRows,
			};
			if (typeof (gridConfig.getPageDataFunc) == "function") {
				editConfig.relationData.pageVo = gridConfig.getPageDataFunc();
			}
			// editConfig.ajax.data = NetstarComponent.commonFunc.getFormDataByTable(editConfig, 'ajax');
			var ajaxConfig = $.extend(true, {}, editConfig.ajax);
			ajaxConfig.data = NetstarComponent.commonFunc.getFormDataByTable(editConfig, 'ajax');
			var standardConfig = {
				type: 'dialog',
				id: gridConfig.id + '-standard-input',
				readonly: true,
				ajax: ajaxConfig,
				subDataAjax: editConfig.subdataAjax,
				attrValueField: editConfig.attrValueField,
				attrTextField: editConfig.attrTextField,
				confirmHandler: function (resData, _standardConfig) {
					console.log(resData);
				}
			};
			NetstarStandardInput.init(standardConfig);
		},
		buildPdfFuncByBlockList: function (ev, index, gridId, columnField) {
			var gird = NetstarBlockList.configs[gridId];
			var vueConfig = gird.vueObj;
			var columnConfig = gird.gridConfig.columnById[columnField];
			var rowData = vueConfig.originalRows[index];
			this.buildPdfFunc(ev, index, columnConfig, rowData, gird.gridConfig, vueConfig);
		},
		// 通过ids获取文件信息
		getFileByIds: function (ids, config, callBackFunc) {
			var ajaxConfig = {
				url: getRootPath() + '/files/getListByIds',
				data: {
					ids: ids,
					hasContent: false,
				},
				type: 'GET',
				//cy 191026 修改 根据lyw截图
				contentType: 'application/x-www-form-urlencoded',
				plusData: {
					callBackFunc: callBackFunc,
					config: config,
				},
			}
			NetStarUtils.ajax(ajaxConfig, function (res, _ajaxConfig) {
				if (res.success) {
					var plusData = _ajaxConfig.plusData;
					var _config = plusData.config;
					if (typeof (res.rows) != "object") {
						nsAlert('获取文件返回值错误', 'error');
						console.error('获取文件返回值错误');
						console.error(res);
						console.error(_config);
						return false;
					}
					if (typeof (plusData.callBackFunc) == "function") {
						plusData.callBackFunc(res.rows, _config);
					}
				} else {
					// nsalert("获取文件失败");
					console.error(res.msg, 'error');
				}
			})
		},
		// 生成/预览 pdf
		buildPdfFunc: function (ev, index, columnCofig, rowData, gridConfig, vueConfig) {
			var pageLengthDefault = vueConfig.page.length;
			var start = vueConfig.page.start;
			index = start + index;
			var originalRows = $.extend(true, [], vueConfig.originalRows);
			var originalRow = originalRows[index];
			// 判断是生成 还是 预览
			var isBuildPdf = rowData[columnCofig.field] == "生成" || typeof (rowData[columnCofig.field]) == "undefined" ? true : false;
			var editConfig = columnCofig.editConfig;
			if (isBuildPdf) {
				if (typeof (editConfig.produceFileAjax) != "object" || typeof (editConfig.produceFileAjax.url) != "string") {
					nsAlert('请检查配置，没有配置生成pdf方法');
					return false;
				}
				var produceFileAjax = $.extend(true, {}, editConfig.produceFileAjax);
				editConfig.relationData = {
					row: originalRow,
					table: originalRows,
				};
				if (typeof (gridConfig.getPageDataFunc) == "function") {
					editConfig.relationData.pageVo = gridConfig.getPageDataFunc();
				}
				var data = NetstarComponent.commonFunc.getFormDataByTable(editConfig, 'produceFileAjax');
				produceFileAjax.data = data;
				produceFileAjax.plusData = {
					gridId: gridConfig.id,
					fieldId: columnCofig.field,
					index: index,
					originalRow: originalRow,
					valueField: editConfig.valueField,
				}
				NetStarUtils.ajax(produceFileAjax, function (res, _ajaxConfig) {
					if (res.success) {
						nsalert("生成成功");
						var _originalRow = _ajaxConfig.plusData.originalRow;
						var data = res;
						if (_ajaxConfig.dataSrc) {
							data = res[_ajaxConfig.dataSrc];
						}
						if (data[_ajaxConfig.plusData.valueField]) {
							_originalRow[_ajaxConfig.plusData.fieldId] = data[_ajaxConfig.plusData.valueField];
							NetStarGrid.dataManager.editRow(_originalRow, _ajaxConfig.plusData.gridId, _ajaxConfig.plusData.index);
						} else {
							if (data[_ajaxConfig.plusData.fieldId]) {
								_originalRow[_ajaxConfig.plusData.fieldId] = data[_ajaxConfig.plusData.fieldId];
								NetStarGrid.dataManager.editRow(_originalRow, _ajaxConfig.plusData.gridId, _ajaxConfig.plusData.index);
							} else {
								nsalert("生成返回参数错误，请检查配置");
								console.error(data);
								console.error(_ajaxConfig.plusData);
							}
						}
					} else {
						nsalert("生成失败");
						console.error(res);
					}
				})
				return;
			}
			if (typeof (editConfig.previewAjax) != "object" || typeof (editConfig.previewAjax.url) != "string") {
				nsAlert('请检查配置，没有配置预览pdf方法');
				return false;
			}
			// var previewUrl = editConfig.previewAjax.url + originalRow[columnCofig.field];
			// window.open(previewUrl +'?Authorization='+NetStarUtils.OAuthCode.get());
			// var ids = originalRow[columnCofig.field].split(',');
			var ids = originalRow[columnCofig.field];
			// var previewUrlArr = [];
			// for(var i=0; i<ids.length; i++){
			// 	previewUrlArr.push({
			// 		originalName : i,
			// 		id : ids[i],
			// 		suffix : 'pdf',
			// 		url : editConfig.previewAjax.url + ids[i],
			// 	})
			// }
			// if(columnCofig.formatHandler && columnCofig.formatHandler.data && columnCofig.formatHandler.data.fileVoList){
			// 	previewUrlArr = $.isArray(rowData[columnCofig.formatHandler.data.fileVoList]) ? rowData[columnCofig.formatHandler.data.fileVoList] : [];
			// }
			methodsManager.getFileByIds(ids, editConfig, function (files, _config) {
				var _files = [];
				for (var i = 0; i < files.length; i++) {
					var contentType = files[i].contentType;
					var suffix = contentType.substring(contentType.lastIndexOf('/') + 1);
					//cy 191026 修改 根据lyw截图
					if (files[i].suffix) {
						suffix = files[i].suffix;
					}
					var fileObj = {
						id: files[i].id,
						originalName: files[i].originalName,
						suffix: suffix,
					};
					_files.push(fileObj);
				}
				NetstarUI.pdfDialog.dialog({
					url: '',
					zoomFit: 'width',
					isDownload: true, //是否有下载
					urlArr: _files,
					pdfUrlPrefix: _config.previewAjax.url,
					imgUrlPrefix: _config.previewImagesAjax.url,
				});
			});
			// if(!$.isArray(previewUrlArr) || previewUrlArr.length == 0){
			// 	nsAlert('请检查表格数据是否正确','error');
			// 	console.error('请检查表格数据是否正确');
			// 	console.error(rowData);
			// 	console.error(columnCofig);
			// 	return false
			// }
			// NetstarUI.pdfDialog.dialog({
			// 	url:        previewUrlArr[0].url,
			// 	zoomFit:    'width',
			// 	isDownload: true,             //是否有下载
			// 	urlArr :  	previewUrlArr,
			// 	pdfUrlPrefix : editConfig.previewAjax.url,
			// 	imgUrlPrefix : editConfig.previewImagesAjax.url,
			// });
		},
		//json数据转list表格 sjj 20191209
		jsonToListByClick:function(ev, index, columnConfig, rowData, gridConfig, _vueData){
			var id = _vueData.$options.id;
			var configs = NetStarGrid.configs[id];
			var originalRows = configs.vueConfig.data.originalRows;
			var rows = configs.vueConfig.data.rows;
			var columnField = columnConfig.field;
			var listStr = rowData[columnField];
			var formatData = columnConfig.formatHandler.data ? columnConfig.formatHandler.data : {};
			var fieldArray = [];
			if($.isArray(formatData.field)){
				fieldArray = formatData.field;
			}
			if(fieldArray.length == 0){
				nsalert('请配置列字段','error');
				return;
			}
			var gridDataSource = [];
			if(listStr){
				gridDataSource = JSON.parse(listStr);
			}
			var titleStr = formatData.title ? formatData.title : '';
			var dialogCommon = {
				id:'dialog-gridlist-common',
				title: titleStr,
				templateName: 'PC',
				width:600,
				height:'auto',
				shownHandler:function(_showDialogConfig){
					var gridListByDialogConfig = {
						id: _showDialogConfig.config.bodyId,
						data:{
							isPage: false,
							isSearch: false,
							isServerMode: false,
							dataSource:gridDataSource,
						},
						columns:fieldArray,
						ui:{
							height:400,
							isEditMode:true,//可以编辑
							isHaveEditDeleteBtn:true,//带删除按钮
							minPageLength: 5,
							pageLengthDefault: 5, 
						}
					};
					NetStarGrid.init(gridListByDialogConfig);
					var btnConfig = {
						id:_showDialogConfig.config.footerIdGroup,
						isShowTitle:false,
						btns:[
						   {
							  text:'确定',
							  handler:function(data){
								  var listArr = NetStarGrid.dataManager.getData('dialog-dialog-gridlist-common-body');
								  originalRows[index][columnField] = JSON.stringify(listArr);
								  rows[index][columnField] = JSON.stringify(listArr);
								  NetstarComponent.dialog['dialog-gridlist-common'].vueConfig.close();//关闭弹出框
							  }
						   },{
							  text:'取消',
							  handler:function(data){
								  NetstarComponent.dialog['dialog-gridlist-common'].vueConfig.close();//关闭弹出框
							  }
						   }
						]
					};
					vueButtonComponent.init(btnConfig);
				},
				hiddenHandler:function(){}
			};
			NetstarComponent.dialogComponent.init(dialogCommon);
		},
	}

	//对外的方法
	var controllerManager = {
		//获取选中的数据 不是checkbox的数据
		getSelectedData: function (gridId) {
			var config = NetStarGrid.configs[gridId];
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
		//checkbox勾选中的数据
		getCheckedData: function (gridId, displayMode) {
			var config;
			switch (displayMode) {
				case 'block':
					config = NetstarBlockList.configs[gridId];
					break;
				case 'table':
				default:
					config = NetStarGrid.configs[gridId];
					break;
			}
			if (typeof (config) != 'object') {
				var errorInfoStr = 'getCheckedData(gridId)方法出错，当前gridId：' + gridId + '错误， 该Grid不存在';
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
					if (data.netstarCheckboxSelectedFlag) {
						selectedRows.push(originalRows[i + startI]);
					}
				}
			}
			return selectedRows;
		},
		//刷新表格 是否修改参数可选
		refreshById: function (gridId, ajaxData) {
			//gridId:string 必填
			//ajaxData:object ajax参数
			var config = NetStarGrid.configs[gridId] ? NetStarGrid.configs[gridId] : NetstarBlockList.configs[gridId];
			if (typeof (config) != 'object') {
				nsalert('refreshById(gridId)方法出错，当前gridId：' + gridId + '错误， 该Grid不存在');
				console.error('refreshById(gridId)方法出错，当前gridId：');
				console.error(gridId);
				return false;
			}
			//console.warn(config.gridConfig);
			if (typeof (ajaxData) == 'object') {
				config.gridConfig.data.data = ajaxData;
			};

			//如果是服务端翻页 sjj 
			if (config.gridConfig.data.isServerMode) {
				var start = config.vueObj.page.start;
				//var length = config.vueObj.page.length;
				var length = config.vueObj.domParams.pageLengthInput.value;
				nsVals.extendJSON(config.gridConfig.data.data, {
					start: start,
					length: length
				});
			}
			dataManager.ajax(config.gridConfig);
		},
		//刷新表格	根据表格id和表格数据(Array)
		refreshDataById: function (gridId, gridData) {
			var config = NetStarGrid.configs[gridId];
			if (typeof config == 'undefined') {
				console.error("gridId传入错误");
				return false;
			}
			if (!(gridData instanceof Array)) {
				console.error("gridData类型应为数组");
				console.error(gridData)
				return false;
			};
			config.vueObj.originalRows = $.extend(true, [], gridData);
		},
		//行按钮点击事件
		rowBtnsHandler: function (event, gridId, _this) {
			event.stopPropagation();
			//当前操作DOMf
			var $btn = $(_this);
			var btnIndex = $btn.attr('ns-index');
			btnIndex = parseInt(btnIndex);

			//找到方法
			var configs = NetStarGrid.configs[gridId];

			//定位操作数据
			var rowIndex = $btn.closest('tr').attr('ns-rowindex');
			if (gridId.indexOf('blockList') > -1) {
				configs = NetstarBlockList.configs[gridId];
				rowIndex = $btn.closest('div[ns-rowindex]').attr('ns-rowindex');
			}
			var btns = configs.gridConfig.ui.tableRowBtns;
			var btnHandler = btns[btnIndex].handler;

			rowIndex = parseInt(rowIndex);
			var tableData = configs.vueObj.originalRows;
			var rowData = tableData[rowIndex];

			//服务端获取值
			var _rowIndex = rowIndex;
			if (configs.gridConfig.data.isServerMode == false) {
				rowData = tableData[rowIndex + configs.vueConfig.data.page.start];
				_rowIndex = rowIndex + configs.vueConfig.data.page.start;
			} else {
				rowData = tableData[rowIndex];
			}

			var returnRowData = $.extend(true, {}, rowData);
			var returnTableData = $.extend(true, {}, tableData);

			var returnObj = {};
			returnObj.gridId = gridId;
			returnObj.rowIndex = rowIndex;
			returnObj.originalIndex = _rowIndex;
			returnObj.rowData = returnRowData;
			returnObj.gridData = returnTableData;
			returnObj.$btn = $btn;
			returnObj.buttonIndex = btnIndex;
			returnObj.vueData = configs.vueData;

			//执行方法 输出数据, 如果该方法直接返回了数据则直接替换当前数据
			var callBackData = btnHandler(returnObj);
			if (typeof (callBackData) == 'object') {
				rowData = callBackData
			}
		},

		//
		userConfiger: function (_dom) {
			var gridId = $(_dom).closest('[nsgirdpanel="grid-el"]').attr('id');
			var configs = NetStarGrid.configs[gridId];
			NetstarComponent.tableColumnManager.init(configs);
		},
		//全选功能
		userAllSelect: function (_dom, displayMode) {
			var $dom = $(_dom);
			$dom.toggleClass('checked'); //添加取消checked属性
			var checkboxSelectedFlag = false; //选中标识 默认false不选中
			if ($dom.hasClass('checked')) {
				//选中
				checkboxSelectedFlag = true; //当前是选中状态 选中标识为true
			}

			if ($dom.hasClass('half-checked')) {
				//有半选状态
				$dom.removeClass('half-checked'); //移除半选
				$dom.removeClass('checked');
				checkboxSelectedFlag = false; //半选状态点击就是全部取消选中
			}
			var gridId = $dom.closest('[nsgirdpanel="grid-el"]').attr('id'); //获取容器id
			var configs; //获取整体配置参数的定义
			switch (displayMode) {
				case 'block':
					configs = NetstarBlockList.configs[gridId];
					break;
				case 'table':
				default:
					configs = NetStarGrid.configs[gridId];
					break;
			}
			var rowsData = configs.vueConfig.data.rows; //获取当前显示行数据
			for (var rowI = 0; rowI < rowsData.length; rowI++) {
				//设置当前数据选中状态
				//禁用状态下不参与设置sjj 20190314 
				if (rowsData[rowI]['NETSTAR-TRDISABLE']) {

				} else {
					rowsData[rowI].netstarCheckboxSelectedFlag = checkboxSelectedFlag;
				}
			}
		},
	}
	//单元格编辑器
	var tdEditor = {
		// 编辑的当前行
		rowIndex: 0,
		// 编辑的当前列
		colIndex: 0,
		//展示面板，初始化容器
		show: function ($td, gridConfig, vueConfig) {
			// 若果$td.length==0，返回
			if ($td.length == 0) {
				return false;
			}
			//获取当前单元格的相关配置项包含：  当前值 行数据 表格数据 列配置 第几行（index）等
			var tdData = tdManager.getData($td, gridConfig, vueConfig);
			//如果当前单元格不可编辑，则停止执行
			if (tdData.column.editable == false || typeof (tdData.column.editable) == "undefined") {
				return false;
			}
			if (tdData.column.columnType == "cubesInput" || tdData.column.columnType == "standardInput") {
				// 列类型为多值输入/标准值输入/多维度输入时当前单元格不可编辑，则停止执行
				return false;
			}
			var tdPosition = tdManager.getPosition($td);
			tdData.position = tdPosition;

			//比较要显示的单元格编辑器与表格右边 如果编辑器的右边超出了，需要滚动表格
			var $table = gridConfig.domParams.contentTableContainer.$dom;
			var tablePosition = tdManager.getPosition($table);

			var tdRight = tdData.position.left + tdData.position.width;
			var tableRight = tablePosition.left + tablePosition.width;
			//编辑器超出表格范围，需要滚动表格
			var scrollLeftNumber = tdRight - tableRight + configManager.DEFAULT.SCROLLWIDTH + gridConfig.domParams.contentTableContainer.$dom.scrollLeft();
			if (scrollLeftNumber > 0) {
				//右边超出
				gridConfig.domParams.scrollX.$dom.parent().scrollLeft(scrollLeftNumber);
				gridConfig.domParams.contentTableContainer.$dom.scrollLeft(scrollLeftNumber);
				gridConfig.domParams.footerTableContainer.$dom.scrollLeft(scrollLeftNumber);
				gridConfig.domParams.headerTableContainer.$dom.scrollLeft(scrollLeftNumber);

				//拖拽handler容器位置修改
				var leftStr = '-' + scrollLeft + 'px';
				gridConfig.domParams.dragContainer.style = {left: leftStr};

				//重新获取位置
				tdPosition = tdManager.getPosition($td);
				tdData.position = tdPosition;
			} else if (tdPosition.left < tablePosition.left) {
				//左边超出
				var scrollLeft = gridConfig.domParams.scrollX.$dom.parent().scrollLeft();
				scrollLeft = gridConfig.domParams.scrollX.$dom.parent().scrollLeft() + (tdPosition.left - tablePosition.left);
				
				gridConfig.domParams.scrollX.$dom.parent().scrollLeft(scrollLeft);
				gridConfig.domParams.contentTableContainer.$dom.scrollLeft(scrollLeft);
				gridConfig.domParams.footerTableContainer.$dom.scrollLeft(scrollLeft);
				gridConfig.domParams.headerTableContainer.$dom.scrollLeft(scrollLeft);

				//拖拽handler容器位置修改
				var leftStr = '-' + scrollLeft + 'px';
				gridConfig.domParams.dragContainer.style = {left: leftStr};

				//重新获取位置
				tdPosition = tdManager.getPosition($td);
				tdData.position = tdPosition;
			}

			// cy 20200307 判断是否上下超出范围 由于键盘驱动可能出现上下超出的问题
			// 获取底部表格高度
			var footerTableHeight = 0;
			if(gridConfig.domParams.footerTableContainer && gridConfig.domParams.footerTableContainer.$dom ){
				footerTableHeight = gridConfig.domParams.footerTableContainer.$dom.outerHeight();
			}
			//最大可视区域底部 单元格的位置 - 表格最大显示区域的底部 - 表格滚动位置 如果大于0 则是超出了表格底部
			var maxBottom = ( tablePosition.top + tablePosition.height ) - footerTableHeight; 
			var outBottom = ( tdPosition.top +tdPosition.height ) - maxBottom;
			var isOutBottom = outBottom > 0;
			//如果超出则需要滚动条处理并修改显示编辑表单的位置
			if(isOutBottom){
				var scrollTop = gridConfig.domParams.scrollY.$dom.parent().scrollTop() + outBottom;
				gridConfig.domParams.contentTableContainer.$dom.scrollTop(scrollTop);
				gridConfig.domParams.scrollY.$dom.parent().scrollTop(scrollTop);
				tdPosition.top = tdManager.getPosition($td).top;
				tdData.position = tdPosition;
			}else{
				// 超出底部和超出顶部不能同时出现 如果同时出现，优先照顾超出底部，理论上这种情况不应该出现
				if(tdPosition.top < tablePosition.top){
					var scrollTop = gridConfig.domParams.scrollY.$dom.parent().scrollTop() - (tablePosition.top - tdPosition.top);
					gridConfig.domParams.contentTableContainer.$dom.scrollTop(scrollTop);
					gridConfig.domParams.scrollY.$dom.parent().scrollTop(scrollTop);
					tdPosition.top = 0;
					tdData.position = tdPosition;
				}
			}

			
			
			// // 获取是否超出高度
			// var outTop = tdPosition.top - tablePosition.top;
			// console.log('outTop:'+outTop);
			// if(outTop < 0){
			// 	gridConfig.domParams.contentTableContainer.$dom.scrollTop(outTop);
			// 	gridConfig.domParams.scrollY.$dom.parent().scrollTop(outTop);
			// 	tdPosition = tdManager.getPosition($td);
			// 	tdData.position = tdPosition;
			// }
			var containerObj = this.getContainer(tdData, $td, gridConfig, vueConfig);
			this.initComponent(containerObj, tdData, $td, gridConfig, vueConfig);
		},
		//切换到下一个可编辑的单元格
		enterNextTd: function ($currentTd, gridConfig, vueConfig) {
			var columns = gridConfig.columns;
			var currentColIndex = $currentTd.index();
			var currentCloConfig = columns[currentColIndex];
			//如果当前行有可编辑的单元格则跳转，没有则在下一行找，如果没有下一行则添加行
			var $nextTd = $currentTd.next();
			if ($nextTd.length == 0) {
				//下一个已经不存在了，则已经是行结尾了
				var $nextRow = $currentTd.parent().next();
				if ($nextRow.length == 1) {
					$nextTd = $nextRow.children('td').first();
				} else {
					//没有下一行，需要新增一行并切换过去
					console.error('没有下一行了， 这是暂时没处理的情况');
				}
			}
			//如果下一个可编辑单元格已经找不到了
			var isEnd = false;
			// 如果组件和下一个组件都是业务组件并且配置相同则不跳转
			var isSameBusiness = false;
			var nextColIndex = $nextTd.index();
			var nextColConfig = columns[nextColIndex];
			if (currentCloConfig.columnType == "business" && currentCloConfig.columnType == nextColConfig.columnType) {
				if (currentCloConfig.editConfig.search.url == nextColConfig.editConfig.search.url) {
					isSameBusiness = true;
				}
			}
			while (($nextTd.attr('ns-editable') == undefined || isSameBusiness == true) && isEnd == false) {
				isSameBusiness = false;
				$nextTd = $nextTd.next();
				if ($nextTd.length == 0) {
					isEnd = true;
				} else {
					nextColIndex = $nextTd.index();
					nextColConfig = columns[nextColIndex];
					if (currentCloConfig.columnType == "business" && currentCloConfig.columnType == nextColConfig.columnType) {
						if (currentCloConfig.editConfig.search.url == nextColConfig.editConfig.search.url) {
							isSameBusiness = true;
						}
					}
				}
			}
			//如果找不到下一个可编辑的td 则是行结束
			if (isEnd === true) {
				//sjj 20190113 切换到下一行第一个可编辑的单元格
				if ($currentTd.closest('tr').next().length == 1) {
					$nextTd = $currentTd.closest('tr').next().children('td[ns-editable=true]').eq(0);
				}
			}
			if ($nextTd.length == 1) {
				//如果找到下一个编辑单元格 则切换到该单元格
				this.show($nextTd, gridConfig, vueConfig);
			} else {
				console.warn($currentTd);
				console.warn($nextTd);
			}

		},
		//切换到下一个可编辑的单元格 通过上下左右home/end/pageUp/pageDown/esc
		switchNextTd: function (keyCode, $currentTd, gridConfig, vueConfig) {
			var columns = gridConfig.columns;
			// 当前行
			var $currentTr = $currentTd.parent();
			// 当前行位置
			var currentRowIndex = $currentTr.index();
			// 当前列位置
			var currentColIndex = $currentTd.index();
			// 当前单元格配置
			var currentCloConfig = columns[currentColIndex];
			var isEnd = false;
			var $nextTd;
			var nextColIndex;
			var nextColConfig;
			// 如果组件和下一个组件都是业务组件并且配置相同则不跳转
			var isSameBusiness = false;
			switch(keyCode){
				case 37:
					// 左
					$nextTd = $currentTd.prev();
					var $prevRow = $currentTr.prev();
					if ($nextTd.length == 0) {
						//下一个已经不存在了，则已经是行结尾了
						if ($prevRow.length == 1) {
							$nextTd = $prevRow.children('td').last();
						} else {
							//没有下一行，需要新增一行并切换过去
							console.error('没有上一行了， 这是暂时没处理的情况');
						}
					}
					nextColIndex = $nextTd.index();
					nextColConfig = columns[nextColIndex];
					if (currentCloConfig.columnType == "business" && currentCloConfig.columnType == nextColConfig.columnType) {
						if (currentCloConfig.editConfig.search.url == nextColConfig.editConfig.search.url) {
							isSameBusiness = true;
						}
					}
					while (($nextTd.attr('ns-editable') == undefined || isSameBusiness == true) && isEnd == false) {
						isSameBusiness = false;
						$nextTd = $nextTd.prev();
						if ($nextTd.length == 0) {
							isEnd = true;
						} else {
							nextColIndex = $nextTd.index();
							nextColConfig = columns[nextColIndex];
							if (currentCloConfig.columnType == "business" && currentCloConfig.columnType == nextColConfig.columnType) {
								if (currentCloConfig.editConfig.search.url == nextColConfig.editConfig.search.url) {
									isSameBusiness = true;
								}
							}
						}
					}
					//如果找不到下一个可编辑的td 则是行结束
					if (isEnd === true) {
						console.warn('is end data');
						//sjj 20190113 切换到下一行第一个可编辑的单元格
						if ($prevRow.length == 1) {
							var $editTd = $prevRow.children('td[ns-editable=true]');
							$nextTd = $editTd.eq($editTd.length - 1);
						}
					}
					break;
				case 38:
					// 上
					var $prevTr = $currentTr.prev();
					if($prevTr.length == 1){
						$nextTd = $prevTr.children().eq(currentColIndex);
					}
					if (currentCloConfig.columnType == "business") {
						isSameBusiness = true;
					}
					break;
				case 39:
					// 右
					$nextTd = $currentTd.next();
					if ($nextTd.length == 0) {
						//下一个已经不存在了，则已经是行结尾了
						var $nextRow = $currentTr.next();
						if ($nextRow.length == 1) {
							$nextTd = $nextRow.children('td').first();
						} else {
							//没有下一行，需要新增一行并切换过去
							console.error('没有下一行了， 这是暂时没处理的情况');
						}
					}
					nextColIndex = $nextTd.index();
					nextColConfig = columns[nextColIndex];
					if (currentCloConfig.columnType == "business" && currentCloConfig.columnType == nextColConfig.columnType) {
						if (currentCloConfig.editConfig.search.url == nextColConfig.editConfig.search.url) {
							isSameBusiness = true;
						}
					}
					while (($nextTd.attr('ns-editable') == undefined || isSameBusiness == true) && isEnd == false) {
						isSameBusiness = false;
						$nextTd = $nextTd.next();
						if ($nextTd.length == 0) {
							isEnd = true;
						} else {
							nextColIndex = $nextTd.index();
							nextColConfig = columns[nextColIndex];
							if (currentCloConfig.columnType == "business" && currentCloConfig.columnType == nextColConfig.columnType) {
								if (currentCloConfig.editConfig.search.url == nextColConfig.editConfig.search.url) {
									isSameBusiness = true;
								}
							}
						}
					}
					//如果找不到下一个可编辑的td 则是行结束
					if (isEnd === true) {
						console.warn('is end data');
						//sjj 20190113 切换到下一行第一个可编辑的单元格
						if ($currentTr.next().length == 1) {
							$nextTd = $currentTr.next().children('td[ns-editable=true]').eq(0);
						}
					}
					break;
				case 40:
					// 下
					var $nextTr = $currentTr.next();
					if($nextTr.length == 1){
						$nextTd = $nextTr.children().eq(currentColIndex);
					}
					if (currentCloConfig.columnType == "business") {
						isSameBusiness = true;
					}
					break;
				case 36: // home
				case 33: // pageUp
					var $table = $currentTd.closest('tbody');
					$nextTd = $table.find('td[ns-editable="true"]').eq(0);
					break;
				case 35: // end
				case 34: // pageDown
					var $table = $currentTd.closest('tbody');
					var $tds = $table.find('td[ns-editable="true"]');
					$nextTd = $tds.eq($tds.length-1);
					break;
				case 27: // esc
					$nextTd = $currentTd;
					break;
			}
			if($nextTd && $nextTd.length == 1){
				var tdData = tdManager.getData($nextTd, gridConfig, vueConfig);
				var columnConfig = tdData.column;
				if (columnConfig.isNeedRowData && typeof(columnConfig.editConfig) == "object" && columnConfig.editConfig.type != "business") {
					// 是否需要有行数据
					var $nextTdTr = $nextTd.closest('tr');
					var rowIndex = $nextTdTr.attr('ns-rowindex');
					rowIndex = parseInt(rowIndex); // 获取当前行的index
					var originalRows = vueConfig.data.originalRows;
					if (typeof (originalRows[rowIndex]) == "undefined") {
						var _$nextTd = $nextTdTr.find('td[ns-edit-type="business"]');
						if(_$nextTd){
							$nextTd = _$nextTd;
						}
					}
				}
				//如果找到下一个编辑单元格 则切换到该单元格
				this.show($nextTd, gridConfig, vueConfig);
			} else {
				console.warn($currentTd);
				console.warn($nextTd);
			}
		},
		// 获得表格编辑容器的层级位置 z-index
		getEditorZIndex: function (id) {
			var zIndexStyle = "";
			var $parents = $('#' + id).parents();
			for (var i = 0; i < $parents.length; i++) {
				var parentDom = $parents[i];
				var zIndex = parentDom.style.zIndex;
				if (zIndex.length > 0) {
					zIndexStyle = 'style="z-index:' + (Number(zIndex) + 1) + ';"';
					break;
				}
			}
			return zIndexStyle;
		},
		//插入编辑器容器
		getContainer: function (tdData, $td, gridConfig, vueConfig) {
			//return $container:jqueryDom 已经添加到页面
			//先移除编辑器面板
			var containerId = gridConfig.el;
			var _$gridContainer = $(containerId).closest('container');
			if (_$gridContainer.length == 0) {
				_$gridContainer = $('body');
			}
			var $editorContainer = _$gridContainer.find('.table-editor-container');
			this.removeComponent($editorContainer);

			//建立新编辑器面板
			var editorId = gridConfig.id + '-tdEditor-container';
			var zIndexStyle = this.getEditorZIndex(gridConfig.id);
			var $container = $('<div id="' + editorId + '" class="table-editor-container" ns-table-datasource="' + vueConfig.el + '" ' + zIndexStyle + '><editorinput></editorinput></div>');
			//编辑器的容器位置大小
			var tdPosition = tdData.position;
			//容器的大小
			var containerStyleObj = {
				top: tdPosition.top + 'px',
				left: tdPosition.left + 'px',
				width: tdPosition.width + 'px',
				height: tdPosition.height + 'px',
			}
			$container.attr({
				':style': 'containerStyleObj'
			});
			var $gridContainer = $('#' + gridConfig.id).closest('container');
			if ($gridContainer.length == 0) {
				$gridContainer = $('body');
			}
			$gridContainer.append($container);

			return {
				$container: $container,
				el: '#' + editorId,
				styleObj: containerStyleObj,
			};
		},
		//保存编辑后的值，如果修改过，则显示修改过的标识
		saveValue: function (editValue, editRowIndex, editColumn, $td, gridConfig, vueConfig) {
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
					var _editValue = typeof (editValue) == "number" ? editValue.toString() : '';
					if (rex.test(editValue) && _editValue.length < 16) {
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
				/*var rows = $.extend(true, [], vueConfig.data.originalRows);
				if (typeof (rows[editRowIndex]) == "undefined") {
					rows[editRowIndex] = {};
				}
				rows[editRowIndex][editColumn.field] = editValue;
				//需要做格式化处理
				vueConfig.data.rows = dataManager.getRows(rows, gridConfig);

				$td.addClass('unsaved');*/
			}
			if (isModified) {
				//当前行进行了修改 sjj 20190909  修改原因之前写的逻辑只能改变当前文本的值这样当有合计需要计算的时候不会进行计算 所以需要修改此方法 改变数组的值来达到计算
				var originalRowsArray = vueConfig.data.originalRows;
				var modifyRowData = {};
				editRowIndex = Number(editRowIndex);
				if (typeof (originalRowsArray[editRowIndex]) == 'object') {
					//存在该行
					modifyRowData = $.extend(true, {}, originalRowsArray[editRowIndex]);
					modifyRowData[editColumn.field] = editValue;
					NetStarGrid.dataManager.editRow(modifyRowData, gridConfig.id, Number(editRowIndex));
				} else {
					if(editValue === ''){ return; }
					//新添加行
					var newOriginalData = {};
					for (var i = 0; i < gridConfig.columns.length; i++) {
						var columnConfig = gridConfig.columns[i];
						modifyRowData[columnConfig.field] = null;
						newOriginalData[columnConfig.field] = null;
					}
					for(var i=originalRowsArray.length; i<editRowIndex+1; i++){
						originalRowsArray.push(modifyRowData);
					}
					originalRowsArray[editRowIndex] = newOriginalData;
					originalRowsArray[editRowIndex][editColumn.field] = editValue;
					NetStarGrid.refreshDataById(gridConfig.id,originalRowsArray);
					//NetStarGrid.dataManager.addRow(modifyRowData, gridConfig.id, editRowIndex);
				}
			}

			/*var originalRows = vueConfig.data.originalRows;
			//如果原始数据有该行，则读取原始数据，否则则是'';
			var originalValue = '';
			if (typeof (originalRows[editRowIndex]) == 'object') {
				var originalValue = originalRows[editRowIndex][editColumn.field];
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

			var tempRows = $.extend(true, [], vueConfig.data.rows);*/
		},
		//初始化编辑器组件
		initComponent: function (containerObj, tdData, $td, gridConfig, vueConfig) {
			var _this = this;
			_this.$td = $td;
			var columnConfig = tdData.column;
			var tdPosition = tdData.position;
			//编辑器内部的输入组件
			var formType = "text";
			switch (columnConfig.variableType) {
				case "number":
					formType = 'number';
					break;
				case "date":
					formType = 'date';
					break;
			}
			var defaultComponentConfig = {
				id: 'editor',
				// type:columnConfig.columnType, 
				type: formType,
				formSource: 'table',
				templateName: 'PC',
				value: (tdData.value === null || typeof (tdData.value) == "undefined") ? '' : tdData.value, // 当前单元格的value值。如果不存在设置“”
				formID: gridConfig.id,
				variableType: 'string',
				tableIndex: tdData.index,
			};
			if (columnConfig.isEditByFunc && columnConfig.columnType == "func" && typeof (columnConfig.valueFormatHandler) == "function") {
				defaultComponentConfig.value = columnConfig.valueFormatHandler(tdData.value, tdData.row, columnConfig);
			}
			//读取编辑属性
			var editConfig = $.extend(true, {}, columnConfig.editConfig);
			if (typeof (editConfig) == 'undefined') {
				editConfig = {};
			}
			if (typeof (columnConfig.viewConfig) == 'object') {
				columnConfig.viewConfig.tableIndex = tdData.index;
			}
			NsUtils.setDefaultValues(editConfig, defaultComponentConfig);
			// 删除表单设置的只读参数 原因：表格编辑可以走到现在说明 表格字段是可编辑的去掉表单配置的只读
			delete editConfig.readonly;
			delete editConfig.disabled;
			// // 业务组件value值转换
			// switch (editConfig.type) {
			// 	case 'business':
			// 		if (typeof (editConfig.textField) == "string") {
			// 			if (typeof (editConfig.value) == "string" && editConfig.value != "") {
			// 				var valueObj = {};
			// 				valueObj[editConfig.textField] = editConfig.value;
			// 				editConfig.value = [valueObj];
			// 			}
			// 		} else {
			// 			console.error('表格业务组件配置错误：textField必填');
			// 			console.error(editConfig);
			// 		}
			// 		editConfig.gridConfig = {
			// 			gridConfig: gridConfig,
			// 			gridData: vueConfig.data.originalRows,
			// 		};
			// 		break;
			// }
			// 指向对应组件
			var editorComponent;
			if (typeof (NetstarComponent[editConfig.type]) == 'object') {
				//是否可调用其他组件
				editorComponent = NetstarComponent[editConfig.type];
			} else {
				//找不到就用基本的文本组件
				if (debugerMode) {
					console.error('找不到当前单元格对应的组件类型：' + editConfig.type);
					console.error(editConfig);
				}
				editConfig.type = 'text';
				editorComponent = NetstarComponent.text;
			}
			var rowIndex = $td.closest('tr').attr('ns-rowindex');
			rowIndex = parseInt(rowIndex); // 获取当前行的index
			_this.rowIndex = rowIndex;
			_this.colIndex = $td.index(); // 获取当前列的index

			// 添加当前组件所在行选中
			var vueObj = NetStarGrid.configs[vueConfig.id].vueObj;
			var rows = $.extend(true, [], vueObj.rows);
			for(var i=0; i<rows.length; i++){
				if(i == rowIndex){
					rows[i].netstarSelectedFlag = true;
				}else{
					rows[i].netstarSelectedFlag = false;
				}
			}
			vueObj.rows = rows;

			// 不同组件类型的特殊处理
			switch (editConfig.type) {
				case 'business':
					// 业务组件value值转换
					if (typeof (editConfig.textField) == "string") {
						if (typeof (editConfig.value) == "string" && editConfig.value != "") {
							var valueObj = {};
							// valueObj[editConfig.textField] = editConfig.value;
							if (columnConfig.columnType == "renderField") {
								valueObj[editConfig.textField] = dataManager.getValueByColumnType(editConfig.value, vueConfig.data.originalRows[rowIndex], columnConfig);
							} else {
								valueObj[editConfig.textField] = editConfig.value;
							}
							valueObj[editConfig.valueField] = editConfig.value;
							editConfig.value = [valueObj];
						}
					} else {
						console.error('表格业务组件配置错误：textField必填');
						console.error(editConfig);
					}
					editConfig.gridConfig = {
						gridConfig: gridConfig,
						gridData: vueConfig.data.originalRows,
					};
					// 获取页面数据 用于选中或回车时发送请求
					// var packageStr = gridConfig.package; // 包名
					// if(typeof(packageStr)=="undefined"){
					// 	console.log('表格配置错误：package必填');
					// 	console.log(gridConfig);
					// }else{
					// 	var templateConfigOBJ = NetstarTemplate.templates.processDocBase.aggregate[packageStr];
					// 	if(typeof(templateConfigOBJ)=="undefined"){
					// 		console.log('表格配置错误：package配置错误-'+packageStr);
					// 		console.log(NetstarTemplate.templates.processDocBase.aggregate);
					// 	}else{
					// 		var templateConfig = templateConfigOBJ.config; // 模板页面配置
					// 		var pageData = NetstarTemplate.templates.processDocBase.getPageData(packageStr, false); // 页面数据
					// 		if(typeof(pageData) != 'object'){
					// 			nsalert('获取页面数据错误');
					// 			console.error('获取页面数据错误');
					// 		}
					// 	}
					// }
					break;
				default:
					// 判断表格行数据是否存在不存在不可编辑
					if (columnConfig.isNeedRowData) {
						// 是否需要有行数据
						var originalRows = vueConfig.data.originalRows;
						if (typeof (originalRows[rowIndex]) == "undefined") {
							editConfig.disabled = true;
						}
					}
					break;
			}
			editConfig.relationData = {
				row: vueConfig.data.originalRows[rowIndex],
				table: vueConfig.data.originalRows,
			};
			editConfig.packageName = gridConfig.package;
			if (typeof (gridConfig.getPageDataFunc) == "function") {
				editConfig.relationData.pageVo = gridConfig.getPageDataFunc();
			}
			editConfig.inputWidth = tdPosition.width;
			editConfig.inputHeight = tdPosition.height;
			editConfig.$validate = $td;
			this.editorConfig = editConfig;
			editConfig.currentRowIndex = rowIndex;
			var componentVueConfig = editorComponent.getComponentConfig(editConfig);
			//重新定义componentVueConfig中的部分属性和事件
			//重新定义回车事件 回车则保存当前值并切换到下一个
			switch (editConfig.type) {
				case 'business':
					componentVueConfig.methods.buttonClick = function (ev) {
						NetstarComponent.business.buttonClick(editConfig);
						var $gridContainer = $(ev.target).closest('container');
						if ($gridContainer.length == 0) {
							$gridContainer = $('body');
						}
						var $editorContainer = $gridContainer.find('.table-editor-container');
						_this.removeComponent($editorContainer);
					}
					componentVueConfig.methods.inputEnter = function (enterEvent) {
						// alert('inputEnter');
						enterEvent.stopImmediatePropagation();
						if (!this.isEnterDown) {
							return;
						}
						this.isEnterDown = false;
						if (editConfig.isShowDialog && typeof (editConfig.returnData) == "object" && typeof (editConfig.returnData.documentEnterHandler) == 'function') {
							editConfig.returnData.documentEnterHandler();
						} else {
							var componentConfig = editConfig;
							var componentVueConfig = this;
							NetstarComponent.business.searchByEnter(componentConfig, componentVueConfig, function (context, data) {
								var _config = context.config;
								var _vueConfig = context.vueConfig;
								if (data.success) {
									var dataSrc = _config.search.dataSrc;
									var editValue = data[dataSrc];
									if ($.isArray(editValue) && editValue.length == 1) {
										_vueConfig.setValue(editValue); // 赋值
										var editRowIndex = tdEditor.rowIndex; //当前行的index
										var editColumn = columnConfig; //当前列配置
										// _this.saveValue(editValue, editRowIndex, editColumn, $td, gridConfig, vueConfig);
										setTimeout(function () {
											_vueConfig.completeHandler('enter');
											// _this.enterNextTd($td, gridConfig, vueConfig);
										}, 0)
									} else {
										NetstarComponent.business.buttonClick(_config, _vueConfig, true);
									}
								} else {
									NetstarComponent.business.buttonClick(_config, _vueConfig, true);
								}
							});
						}
						var $gridContainer = $(enterEvent.target).closest('container');
						if ($gridContainer.length == 0) {
							$gridContainer = $('body');
						}
						var $editorContainer = $gridContainer.find('.table-editor-container');
						_this.removeComponent($editorContainer);
					}
					componentVueConfig.methods.completeHandler = function (btnName, pageJson) {
						var componentConfig = editConfig;
						//如果在editConfig中添加了 completeHandler 选择完成后回调，则不执行默认的完成后回调 cy 20191112 start --------
						//回调用的数据
						var callbackConfig = {
							containerObj: containerObj,
							tdData: tdData,
							editConfig: editConfig,
							$td: $td,
							gridConfig: gridConfig,
							vueConfig: vueConfig,
						};
						//如果返回值是boolean而且是false 则不再继续执行
						if (typeof (editConfig.completeHandler) == 'function') {
							var callbackObj = editConfig.completeHandler(callbackConfig);
							if (typeof (callbackObj) == 'boolean') {
								if (callbackObj == false) {
									return;
								}
							}
						}
						//如果在editConfig中添加了完成后回调，则不执行默认的完成后回调 cy 20191112 end   --------

						//如果在editConfig中配置了isNeedRowData == false，则不执行getRowData完成后回调 sjj 20200116 start --------
						if(editConfig.isNeedRowData === false && $.isEmptyObject(editConfig.getRowData)){
							var _tableVueObj = NetStarGrid.configs[editConfig.formID].vueObj; // 表格vue配置
							// var gOriginalRows = _tableVueObj.originalRows;
							var gOriginalRows = $.extend(true, [], _tableVueObj.originalRows);
							// var gRows = _tableVueObj.rows;
							var rowIndex = editConfig.rowIndex;//当前行下标
							var componentVueConfig = this;
							var value = componentVueConfig.getSourceValue(false);
							switch(editConfig.selectMode){
								case 'single':
									if(!$.isArray(value)){
										value = [value];
									}
									break;
								case 'checkbox':
								case 'multi':
									break;
                            }
                            if(typeof(gOriginalRows[rowIndex]) == "undefined"){
                                gOriginalRows[rowIndex] = {};
                            }
							gOriginalRows[rowIndex] = typeof(gOriginalRows[rowIndex])=='object' ? gOriginalRows[rowIndex] : {};
							if(editConfig.outputFields){
								var outputData = NetStarUtils.getFormatParameterJSON(editConfig.outputFields,value);
								for(var outputI in outputData){
									gOriginalRows[rowIndex][outputI] = outputData[outputI];
									// gRows[rowIndex][outputI] = outputData[outputI];
								}
							}else{
								var idsArr = [];
								for(var v=0; v<value.length; v++){
									idsArr.push(value[v][editConfig.id]);
								}
								gOriginalRows[rowIndex][editConfig.id] = idsArr.join(',');
                            }
                            _tableVueObj.originalRows = gOriginalRows;
							return;
						}
						//如果在editConfig中配置了isNeedRowData == false，则不执行getRowData完成后回调 sjj 20200116 end --------
						var componentVueConfig = this;
						var value = componentVueConfig.getSourceValue(false);
						// 验证value和getRowData
						if (typeof (value) == "object") {
							// if(value.length >0){
							// 	//选中了有效数据
							// 	var selectData  = [value[0]];
							// }
							if ($.isArray(value)) {
								var selectData = value;
							} else {
								var selectData = [value];
							}
						} else {
							return;
						}
						if (typeof (editConfig.getRowData) != 'object') {
							return;
						}
						if (typeof (editConfig.getRowData.url) != 'string') {
							return;
						}

						for (var dataI = 0; dataI < vueConfig.data.originalRows.length; dataI++) {
							if (typeof (vueConfig.data.originalRows[dataI]) == "object" && vueConfig.data.originalRows[dataI][NSCHECKEDFLAG.KEY] == true) {
								delete vueConfig.data.originalRows[dataI][NSCHECKEDFLAG.KEY]
							}
						}
						// 当前行数据
						var rowIndexData = vueConfig.data.originalRows[tdEditor.rowIndex];
						// 新增行数据行数据
						if (typeof (rowIndexData) == 'undefined' || rowIndexData === null) {
							rowIndexData = {};
						} else {
							rowIndexData[NSCHECKEDFLAG.KEY] = NSCHECKEDFLAG.VALUE;
						}
						// 获取页面数据
						var pageData = {};
						if (typeof (editConfig.getTemplateValueFunc) == "function") {
							pageData = editConfig.getTemplateValueFunc();
						}
						var voData = $.extend(true, {}, pageData); // 页面参数
						// lyw 20190902 原来：selectedKey='selectedList' 现在：selectedKey同过配置获得 原因：如果页面有两个表格则不知道操作的哪个表格
						var selectedKey = typeof (editConfig.selectedKey) == "string" && editConfig.selectedKey.length > 0 ? editConfig.selectedKey : 'selectedList';
						voData[selectedKey] = selectData;
						// 获取格式化后的ajaxData 
						var ajaxData = voData;
						if (typeof (editConfig.getRowData.data) == 'object' && !$.isEmptyObject(editConfig.getRowData.data)) {
							ajaxData = NetStarUtils.getFormatParameterJSON(editConfig.getRowData.data, voData);
						}
						var contentType = 'application/json';
						if (typeof (editConfig.getRowData.contentType) == "string" && editConfig.getRowData.contentType.length > 0) {
							contentType = editConfig.getRowData.contentType;
						}
						// 发送ajax根据value值查询行数据 
						var ajaxConfig = {
							url: editConfig.getRowData.url,
							type: typeof (editConfig.getRowData.type) == "string" ? editConfig.getRowData.type : 'GET',
							dataType: 'json',
							contentType: contentType, //"application/json",
							plusData: {
								// componentConfig:componentConfig,
								// componentVueConfig:componentVueConfig,
								// tableVueConfig:vueConfig,
								// gridConfig:gridConfig,
								tableId: vueConfig.id,
								componentId: componentConfig.id,
								formId: componentConfig.formID,
								selectedList: voData.selectedList,
								td: {
									index: tdData.index,
									id: tdData.id,
									field: tdData.column.field,
									editConfig: tdData.editConfig,
								},
							},
							data: ajaxData,
						}
						NetStarUtils.ajax(ajaxConfig, function (data, _ajaxConfig) {

							//如果在editConfig中添加了ajaxCompleteHandler AJAX完成后回调，则不执行默认的完成后回调 cy 20191112 start --------
							//如果返回值是boolean而且是false 则不再继续执行
							if (typeof (editConfig.ajaxCompleteHandler) == 'function') {
								var callbackObj = editConfig.ajaxCompleteHandler(_ajaxConfig.plusData, data);
								if (typeof (callbackObj) == 'boolean') {
									if (callbackObj == false) {
										return;
									}
								}
							}
							//如果在editConfig中添加了完成后回调，则不执行默认的完成后回调 cy 20191112 end   --------

							// var _componentConfig = _ajaxConfig.plusData.componentConfig; // 组件配置
							// var _componentVueConfig = _ajaxConfig.plusData.componentVueConfig; // 组件vue配置
							var _tableId = _ajaxConfig.plusData.tableId;
							var _componentId = _ajaxConfig.plusData.componentId;
							var _formId = _ajaxConfig.plusData.formId;
							var _selectedList = _ajaxConfig.plusData.selectedList;
							// var _tableVueConfig = NetStarGrid.configs[_ajaxConfig.plusData.tableVueConfig.id].vueConfig; // 表格vue配置
							// var _gridConfig = _ajaxConfig.plusData.gridConfig; // 表格配置
							var _componentConfig = NetstarComponent.config[_formId].config[_componentId]; // 组件配置
							var _componentVueConfig = NetstarComponent.config[_formId].vueConfig[_componentId];; // 组件vue配置
							var _tableVueConfig = NetStarGrid.configs[_tableId].vueConfig; // 表格vue配置
							var _gridConfig = NetStarGrid.configs[_tableId].gridConfig; // 表格配置
							var rowData = data;
							if (typeof (_componentConfig.getRowData.dataSrc) == "string") {
								rowData = data[_componentConfig.getRowData.dataSrc];
							}
							_componentConfig.isDeleteObjectState = typeof(_componentConfig.isDeleteObjectState) == "boolean" ? _componentConfig.isDeleteObjectState : false; 
							// 是否需要删除objectState
							if(_componentConfig.isDeleteObjectState){
								NetStarUtils.deleteAllObjectState(rowData);
							}
							if (!$.isArray(rowData)) {
								console.error('返回的数据错误');
								console.error(data);
								console.error(_componentConfig);
								console.error(_componentVueConfig);
								return;
							}
							// 修改,添加行数据
							// 先刷新表格在获得组件
							var rowIndex = tdEditor.rowIndex;
							var colIndex = tdEditor.colIndex;
							var originalRows = $.extend(true, [], _tableVueConfig.data.originalRows);
							// 判断上一行是否有数据
							// if(rowIndex > originalRows.length){
							// 	nsalert('请顺序新增行','error');
							// 	console.error('请顺序新增行');
							// 	return;
							// }
							for (var rowI = 0; rowI < rowData.length; rowI++) {
								originalRows[rowIndex] = rowData[rowI];
								rowIndex++;
							}
							// 添加空行
							for (var rowI = 0; rowI < rowIndex; rowI++) {
								if (typeof (originalRows[rowI]) == 'undefined') {
									originalRows[rowI] = {};
								}
							}
							_tableVueConfig.data.originalRows = originalRows;

							setTimeout(function () {
								// btnName：selected---选中，把返回的数据赋值到表格当前行，并换行
								// btnName：selectedclose---选中并关闭，把返回的数据赋值到表格当前行，并切换焦点到当前行中下一个可编辑的字段
								switch (btnName) {
									case 'enter':
									case 'selectedclose':
									case 'doubleClick':
										var currentRowIndex = editConfig.currentRowIndex;
										// var _$td = tdEditor.$td.parents('tbody').children().eq(rowIndex - 1).children().eq(colIndex);
										var _$td = tdEditor.$td.parents('tbody').children().eq(currentRowIndex).children().eq(colIndex);
										_this.enterNextTd(_$td, _gridConfig, _tableVueConfig);
										break;
									default:
										// var _$td = tdEditor.$td.parents('tbody').children().eq(rowIndex).children().eq(colIndex);
										// tdEditor.show(_$td, _gridConfig, _tableVueConfig);
										// tdEditor.rowIndex = tdEditor.rowIndex + 1;
										tdEditor.rowIndex = rowIndex;
										var obj = {
											originalRowData: originalRows,
											rowData: rowData,
											gridId: _gridConfig.id,
										}
										_componentConfig.returnData.selectedComplateHandler(obj);
										break;
								}
							}, 0);
						});
					}
					break;
				case 'upload':
					componentVueConfig.methods.changeComplete = function () {
						var editValue = this.getValue(false);
						if (editValue === false) {
							editValue = '';
							console.error('输入值错误');
							console.error(editValue);
						}
						var editRowIndex = rowIndex; //当前行的index
						var editColumn = columnConfig; //当前列配置
						_this.saveValue(editValue, editRowIndex, editColumn, $td, gridConfig, vueConfig);
					}
					break;
				default:
					if(editConfig.type == 'provinceselect'){
						var keyupFunc = componentVueConfig.methods.keyup;
					}
					componentVueConfig.methods.keyup = function(ev){
						this.isKeyupEcs = false;
						var keyCode = ev.keyCode;
						var isJump = false;
						var $target = $(ev.target);
						var targetDom = $target[0];
						var selectionStart = targetDom.selectionStart;
						var selectionEnd = targetDom.selectionEnd;
						var valueStr = targetDom.value;
						switch(keyCode){
							case 37: // 左
								if(selectionStart == selectionEnd){
									if(selectionStart != 0){
										targetDom.setSelectionRange(--selectionStart, --selectionEnd);
									}else{
										isJump = true;
									}
								}else{
									targetDom.setSelectionRange(selectionStart, selectionStart);
								}
								break;
							case 39: // 右
								if(selectionStart == selectionEnd){
									if(selectionStart != valueStr.length){
										targetDom.setSelectionRange(++selectionStart, ++selectionEnd);
									}else{
										isJump = true;
									}
								}else{
									targetDom.setSelectionRange(selectionEnd, selectionEnd);
								}
								break;
							case 38: // 上
							case 40: // 下
							case 36: // home
							case 35: // end
							case 34: // pageDown
							case 33: // pageUp
								isJump = true;
								break;
							case 27: // esc
								this.isKeyupEcs = true;
								isJump = true;
								// var $gridContainer = $target.closest('container');
								// if ($gridContainer.length == 0) {
								// 	$gridContainer = $('body');
								// }
								// var $editorContainer = $gridContainer.find('.table-editor-container');
								// tdEditor.removeComponent($editorContainer);
								break;
						}
						if(isJump){
							var editValue = this.getValue();
							if (editValue === false) {
								editValue = '';
								console.error('输入值错误');
								console.error(editValue);
							}
							var editRowIndex = rowIndex; //当前行的index
							var editColumn = columnConfig; //当前列配置
							_this.saveValue(editValue, editRowIndex, editColumn, $td, gridConfig, vueConfig);
							this.setRowOtherField();
							setTimeout(function () {
								_this.switchNextTd(keyCode, $td, gridConfig, vueConfig);
							}, 0)
						}else{
							if(editConfig.type == 'provinceselect'){
								if(keyCode == 13){
									this.inputEnter(ev);
								}else{
									keyupFunc(ev);
								}
							}
						}
					}
					componentVueConfig.methods.inputEnter = function (enterEvent) {
						if (editConfig.type == "textarea") {
							if (enterEvent.altKey == false) {
								// enter 跳转组件
							} else {
								// alt+enter 添加换行
								$(enterEvent.target).val(function (index, text) {
									return (text + '\n');
								});
								return false;
							}
						}
						var editValue = this.getValue();
						if (editValue === false) {
							editValue = '';
							console.error('输入值错误');
							console.error(editValue);
						}
						var editRowIndex = rowIndex; //当前行的index
						var editColumn = columnConfig; //当前列配置
						_this.saveValue(editValue, editRowIndex, editColumn, $td, gridConfig, vueConfig);
						this.setRowOtherField();
						setTimeout(function () {
							_this.enterNextTd($td, gridConfig, vueConfig);
						}, 0)
					}
					componentVueConfig.methods.blurHandler = function (changeEvent) {
						var isBlur = true;
						if(this.isKeyupEcs){
							this.isKeyupEcs = false;
							isBlur = false;
						}
						if (editConfig.type == "date" || editConfig.type == "select") {
							isBlur = this.isValidatValue; // 点击组件按钮，组件没有失去焦点
						}
						if (isBlur) {
							var editValue = this.getValue(true);
							if (editValue === false) {
								editValue = '';
								console.error('输入值错误');
								console.error(editValue);
							}
							var editRowIndex = rowIndex; //当前行的index
							var editColumn = columnConfig; //当前列配置
							_this.saveValue(editValue, editRowIndex, editColumn, $td, gridConfig, vueConfig);
							this.setRowOtherField();
							if (editConfig.type == 'select') {

							}
							//$('#'+this.id).closest('.table-editor-container').remove();
							if (typeof (editConfig.countFuncConfig) == "object") {
								var originalRows = $.extend(true, [], vueConfig.data.originalRows);
								var rowData = originalRows[editRowIndex];
								var countData = {};
								var fieldRex = /\{\{(.*?)\}\}/;
								var fieldCountFuncObj = editConfig.countFuncConfig;
								for (var fieldKey in fieldCountFuncObj) {
									var countFuncArr = fieldCountFuncObj[fieldKey];
									var countFuncStr = '';
									for (var arrI = 0; arrI < countFuncArr.length; arrI++) {
										var str = countFuncArr[arrI];
										if (fieldRex.test(str)) {
											var fieldId = str.match(fieldRex)[1];
											var fieldVal = rowData[fieldId];
											str = Number(fieldVal);
											if (isNaN(str)) {
												str = 0;
											}
										}
										countFuncStr += str;
									}
									// countData[fieldKey] = eval(countFuncStr);
									var result = eval(countFuncStr);
									if (typeof (result) != "boolean") {
										var resultStr = result.toString();
										if (resultStr.indexOf('.') > -1) {
											var resultStrArr = resultStr.split('.');
											var resultStrMix = resultStrArr[1];
											if (resultStrMix.length == 17) {
												resultStr = result.toFixed(16);
											}
										}
										countData[fieldKey] = Number(resultStr);
									} else {
										countData[fieldKey] = result;
									}
								}
								for (var fieldKey in countData) {
									rowData[fieldKey] = countData[fieldKey];
								}
								vueConfig.data.originalRows = originalRows;
							}
							if(typeof(editConfig.blurHandler) == "function"){
								editConfig.blurHandler(editConfig);
							}
							if(typeof(editConfig.tableBlurHandler) == "function"){
								editConfig.tableBlurHandler({
									config : editConfig,
									value : editValue,
									id : editConfig.id,
									text : editValue,
									vueConfig : this,
								});
							}
						}
					}
					// 通过字段配置设置当前行上其他字段的值  columnType==textFieldReplace时字段是select多保存textField字段
					componentVueConfig.methods.setRowOtherField = function () {
						var editColumn = columnConfig; //当前列配置
						var editRowIndex = rowIndex; //当前行的index
						var originalRowsArray = vueConfig.data.originalRows;
						if (typeof (originalRowsArray[editRowIndex]) == 'object') {
							//存在该行
							modifyRowData = $.extend(true, {}, originalRowsArray[editRowIndex]);
							var editValue = this.getValue(true);
							if (typeof (editValue) == "object") {
								modifyRowData = $.extend(false, modifyRowData, editValue);
								NetStarGrid.dataManager.editRow(modifyRowData, gridConfig.id, Number(editRowIndex));
							}
						} else {
							return false;
						}
						if (editColumn.columnType == 'textFieldReplace' && editColumn.formatHandler && editColumn.formatHandler.data && editColumn.formatHandler.data.textField) {
							var valueArray = this.valueArray;
							var isTree = false;  
							switch (editConfig.type) {
								case 'select':
									valueArray = this.valueArray;
									break;
								case 'treeSelect':
									isTree = true;
									valueArray = editConfig.checkNodes;
									break;
							}
							if ($.isArray(valueArray) && valueArray.length > 0) {
								var textField = editConfig.textField;
								var otherFieldVal = '';
								if(isTree){
									var showTextField = editConfig.showTextField;
									for (var i = 0; i < valueArray.length; i++) {
										var othVal = valueArray[i][textField];
										if(showTextField && valueArray[i][showTextField]){
											othVal = valueArray[i][showTextField];
										}
										otherFieldVal += othVal + ',';
									}
								}else{
									for (var i = 0; i < valueArray.length; i++) {
										otherFieldVal += valueArray[i][textField] + ',';
									}
								}
								otherFieldVal = otherFieldVal.substring(0, otherFieldVal.length - 1);
								var modifyRowData = {};
								if (typeof (originalRowsArray[editRowIndex]) == 'object') {
									//存在该行
									modifyRowData = $.extend(true, {}, originalRowsArray[editRowIndex]);
									modifyRowData[editColumn.formatHandler.data.textField] = otherFieldVal;
									NetStarGrid.dataManager.editRow(modifyRowData, gridConfig.id, Number(editRowIndex));
								}
							}
						}
					}
					break;
			}
			var editorVueConfig = {
				el: containerObj.el,
				data: {
					containerStyleObj: containerObj.styleObj
				},
				components: {
					'editorinput': componentVueConfig
				}
			};
			if (typeof (NetstarComponent.config[editConfig.formID]) == "object" && typeof (NetstarComponent.config[editConfig.formID].config[editConfig.id]) == "object") {
				// 保留之前的业务组件弹框返回参
				var prevConfig = NetstarComponent.config[editConfig.formID].config[editConfig.id];
				if (typeof (prevConfig.returnData) == "object" && prevConfig.type == "business" && editConfig.type == "business") {
					editConfig.returnData = prevConfig.returnData;
				}
			}
			NetstarComponent.config[editConfig.formID] = {
				vueConfig: {},
				config: {},
				source : {
					obj : {},
				},
			};
			NetstarComponent.config[editConfig.formID].config[editConfig.id] = editConfig;
			NetstarComponent.config[editConfig.formID].source.obj[editConfig.id] = editConfig;
			this.editorVue = new Vue(editorVueConfig);
			//聚焦并选中文本框
			if (typeof (this.editorVue.$children[0]) == "object") {
				var rowIndex = $td.closest('tr').attr('ns-rowindex');//sjj 2020011添加支持当前行号
				NetstarComponent.config[editConfig.formID].config[editConfig.id].rowIndex = rowIndex;//sjj 2020011添加支持当前行号
				this.editorVue.$children[0].focus();
			}
			NetstarComponent.config[editConfig.formID].vueConfig[editConfig.id] = this.editorVue.$children[0];
			//表格、页面的滚动，其他点击事件都会关闭编辑器
			_this.addRemoveListener($td);
		},
		//移除编辑器容器 同时也就挪走了编辑组件，同步关闭事件监听器
		removeComponent: function ($editorContainer) {
			if ($editorContainer.length > 0) {
				var editorConfig = this.editorConfig;
				var editorVueConfig = this.editorVue;
				var editorVueComConfig = false;
				if(editorVueConfig){
					editorVueComConfig = editorVueConfig.$children[0];
				}
				/******lyw 20190411 计算器组件需要重新获取，进行保存值 star********/
				if ($editorContainer.children('.pt-input-group').length > 0) {
					var $input = $editorContainer.children('.pt-input-group').children('input');
					if ($input.length == 1 && $input.attr('type') == "number") {
						$input.focus();
					}
				}
				/******lyw 20190411 计算器组件需要重新获取，进行保存值 end********/
				// 验证是否是日期组件 删除日器组件
				if(typeof(editorConfig) == "object"){
					switch(editorConfig.type){
						case 'date':
							var $input = $('#' + editorConfig.fullID);
							if(!editorConfig.isTime){
								$input.datepicker('destroy');
							}else{
								$input.datepicker('remove');
							}
							break;
						case 'provinceselect':
							var fullID = editorConfig.fullID;
							var provinceselectTabId = 'ns-provinceselect-' + fullID;
							var $provinceselectTab = $('#' + provinceselectTabId);
							$provinceselectTab.remove();
							break;
						case 'select':
							if(editorVueComConfig){
								if(editorConfig.panelVueObj){
									$(document).off("click", editorConfig.panelVueObj.isSearchDropDown);
								}
								if(typeof(editorVueComConfig.blurHandler)=='function'){
									editorVueComConfig.blurHandler();
								}
							}  
							break;
					}
				}
				// 销毁组件
				if(typeof(editorVueConfig) == "object"){
					editorVueConfig.$destroy();
					delete this.editorVue;
				}
				this.removeRemoveEditorListener();
				$editorContainer.remove();
				if ($('.pt-select-panel').length > 0) {
					// 下拉组件下拉框删除 以及下拉框添加的事件关闭
					$('.pt-select-panel').remove();
					$(document).off('keyup',NetstarComponent.select.panelComponentConfig.keyup);
				}
			}
		},
		//每次编辑器出现时候都需要重新初始化所有监听器
		addRemoveListener: function ($td) {
			//$td是当前点击正在初始化的单元格
			var _this = this;
			//点击了其他地方的监听器
			this.removeRemoveEditorListener();
			//sjj 20190509 把body的click事件改为了mousedown事件
			$('body').on('mousedown', {
				this: _this,
				$td: $td
			}, this.outClickHandler);
			$('body').on('mousewheel', {
				this: _this,
				$td: $td
			}, this.mouseWheelHandler);
		},
		removeRemoveEditorListener: function () {
			var _this = this;
			$('body').off('mousedown', this.outClickHandler); //sjj 20190509 把body的click事件改为了mousedown事件
			$('body').off('mousewheel', this.mouseWheelHandler);
		},
		//点击到外边移除编辑器和监听器
		outClickHandler: function (ev) {
			//如果当前操作对象不再编辑器里则是out
			var isOut = $(ev.target).closest('.table-editor-container').length == 0;
			if (isOut) {
				if (ev.target.type === "button") {
					// lyw 点击计算器不删除editor
					if (ev.target.parentNode && ev.target.parentNode.className === "calculator-row") {
						isOut = false;
					}
				}
				// 点击时间不删除editor
				if ((ev.target.className == 'hour' || ev.target.className == 'minute' || ev.target.className == 'month') && ev.target.localName === "span") {
					isOut = false;
				}
				var $parentsDate = $(ev.target).parents('.datepicker.datepicker-dropdown');
				if($parentsDate.length > 0){
						isOut = false;
				}
				if (ev.target.className == 'glyphicon icon-arrow-right' || ev.target.className === "glyphicon icon-arrow-left") {
					isOut = false;
				}
				if ((ev.target.className == 'switch' || ev.target.className == 'dow') && ev.target.nodeName == 'TH') {
					isOut = false;
				}
				var parentClass = $(ev.target).parent().parent().attr('class');
				if (parentClass && parentClass.indexOf('datetimepicker') > -1) {
					isOut = false;
				}
				if (ev.target.nodeName == 'LI') {
					isOut = false;
				}

				//sjj 2019106  如果当前下拉框出现滚动区域不可关闭
				if (ev.target.className == 'pt-dropdown') {
					if (ev.target.parentNode && ev.target.parentNode.className.indexOf('pt-input-group pt-select-panel')>-1){
						isOut = false;
					}
				}
				if($(ev.target).closest('.pt-pager').length == 1){
					//sjj 20200113
					isOut = false;
				}

				// lyw 点击provinceselect组件选择日期的tab不移除组件
				var _this = ev.data.this;
				var editorConfig = _this.editorConfig;
				var editorVueConfig = _this.editorVue;
				if(editorConfig.type == "provinceselect"){
					var fullID = editorConfig.fullID;
					var provinceselectTabId = 'ns-provinceselect-' + fullID;
					var $provinceselectTab = $(ev.target).closest('#' + provinceselectTabId);
					if($provinceselectTab.length > 0){
						isOut = false;
					}
				}
			}
			//如果当前操作也不在要点击的单元格里则不是out
			var $td = ev.data.$td;
			if ($td[0] == $(ev.target)[0] || $(ev.target).closest('td')[0] == $(ev.target)[0] || $td[0] == $(ev.target).closest('td')[0]) {
				isOut = false;
			}
			var _tdEditor = ev.data.this;
			if (isOut) {
				var $gridContainer = ev.data.$td.closest('container');
				if ($gridContainer.length == 0) {
					$gridContainer = $('body');
				}
				var $editorContainer = $gridContainer.find('.table-editor-container');
				_tdEditor.removeComponent($editorContainer);
			}
		},
		//一旦发现鼠标滚动，则关闭编辑器
		mouseWheelHandler: function (ev) {
			var _tdEditor = ev.data.this;
			$('body').off('mousewheel', _tdEditor.mouseWheelHandler);
			var isOut = true;
			if ($(ev.target).closest('.pt-select-panel').length == 1) {
				isOut = false;
			}
			if (isOut) {
				var $editorContainer = ev.data.$td.closest('container').find('.table-editor-container');
				_tdEditor.removeComponent($editorContainer);
			}
		}
	}

	//单元格管理器
	var tdManager = {
		//根据单元格获取列配置信息
		getColumn: function ($td, gridConfig) {
			var columnField = $td.attr('ns-field');
			var columnConfig = gridConfig.columnById[columnField];
			return columnConfig;
		},
		//获取数据返回值
		getData: function ($td, gridConfig, vueConfig) {

			//行数据
			var rowIndex = $td.closest('tr[ns-rowindex]').attr('ns-rowindex');
			rowIndex = parseInt(rowIndex);
			// rowIndex = vueConfig.data.page.start + rowIndex;

			//列数据
			var columnField = $td.attr('ns-field');
			var columnConfig = vueConfig.data.columnById[columnField];

			//获取行数据
			var value = '';
			// var rowData = gridConfig.data.dataSource[rowIndex];
			var rowData = vueConfig.data.originalRows[rowIndex];

			//凭空加出来的空行会找不到数据，返回空对象
			if (typeof (rowData) == 'undefined') {
				rowData = {};
				value = '';
			} else {
				value = rowData[columnField];
			}

			//返回值
			return {
				value: value, //当前单元格的值
				row: rowData, //当前行的值
				tableData: gridConfig.data.dataSource, //表格的值
				index: rowIndex, //index  行的索引值
				column: columnConfig //column 配置
			}
		},
		//获取位置宽高
		getPosition: function ($td) {
			var tdPosition = {
				top: $td.offset().top,
				left: $td.offset().left,
				width: $td.outerWidth() - 2,
				height: $td.outerHeight() - 2,
			}
			return tdPosition;
		},
	}

	//快捷键管理器
	var hotkeyManager = {
		//队列
		queue: [],
		//处理器 
		gridKeyupHandler: function (ev) {
			//还没有表格被初始化
			if (hotkeyManager.queue.length == 0) {
				return;
			}
			//查找是否可用
			var keyName = '';
			switch (ev.keyCode) {
				case 40:
					keyName = 'down';
					break;
				case 38:
					keyName = 'up';
					break;
				default:
					return;
					break;
			}
		},
		//添加监听器
		add: function (gridId) {
			var configs = NetStarGrid.configs[gridId];
			//使用参数指定了不调用快捷键则退出
			if (configs.gridConfig.ui.isUseHotkey != true) {
				return false;
			}

			this.queue.push({
				gridId: gridId,
				configs: NetStarGrid.configs[gridId],
			})
		},
		//初始化
		init: function () {
			$(document).on('keyup', this.gridKeyupHandler)
		},
	}
	hotkeyManager.init();
	// 设置表达式配置参数
	function setCountFuncConfig(_configs) {
		var columns = _configs.vueConfig.data.columns;
		var columnEditConfig = []; // 所有表单配置数组
		for (var colI = 0; colI < columns.length; colI++) {
			var columnConfig = columns[colI];
			var columnForm = {
				id: columnConfig.field,
			}
			if (typeof (columnConfig.editConfig) == "object") {
				if (typeof (columnConfig.editConfig.total) == "string") {
					columnForm.total = columnConfig.editConfig.total;
				}
			}
			columnEditConfig.push(columnForm);
		}
		var countObject = NetstarComponent.formComponent.getCountObj(columnEditConfig);
		if (!$.isEmptyObject(countObject)) {
			for (var colI = 0; colI < columns.length; colI++) {
				var columnConfig = columns[colI];
				if (typeof (countObject[columnConfig.field]) == "object") {
					if (typeof (columnConfig.editConfig) != "object") {
						columnConfig.editConfig = {};
					}
					columnConfig.editConfig.countFuncConfig = countObject[columnConfig.field];
				}
			}
		}
	}
	// 设置viewConfig
	function setViewConfig(_configs) {
		// 添加查看按钮
		var columns = _configs.vueConfig.data.columns;
		var originalRowsData = _configs.vueConfig.data.originalRows;
		var $table = _configs.vueConfig.contentTableAttr.$table;
		var $trs = $table.children('tbody').children('tr');
		for (var colI = 0; colI < columns.length; colI++) {
			var columnConfig = columns[colI];
			if (columnConfig.editable && typeof (columnConfig.viewConfig) == "object") {
				for (var dataI = 0; dataI < originalRowsData.length; dataI++) {
					var viewConfig = $.extend(true, {}, columnConfig.viewConfig);
					viewConfig.$container = $($trs[dataI]).children('[ns-field=' + columnConfig.field + ']');
					if (viewConfig.$container.children("button").length > 0) {
						viewConfig.$container.children("button").remove();
					}
					viewConfig.getValueFunc = function () {
						var rowindex = Number(this.$container.parent("tr").attr("ns-rowindex"));
						var rowData = originalRowsData[rowindex];
						console.log(rowData);
						return rowData;
					}
					NetstarComponent.viewer.init(viewConfig);
				}
			}
		}
	}
	// 刷新subdata对应的ajax 
	function refreshSubdataByAjax(configs) {
		var columns = configs.vueConfig.data.columns;
		var refreshColumns = []; // 需要刷新的列
		var refreshIndex = 0; // 刷新到的列
		for (var columnI = 0; columnI < columns.length; columnI++) {
			var columnConfig = columns[columnI];
			if (columnConfig.columnType == "subdataText" && typeof (columnConfig.formatHandler) != "object") {
				if (typeof (columnConfig.editConfig.url) == "string" && columnConfig.editConfig.isPreloadData !== false) {
					refreshColumns.push(columnConfig);
				}
			}
		}
		for (var refI = 0; refI < refreshColumns.length; refI++) {
			var editConfig = refreshColumns[refI].editConfig;
			var url = editConfig.url;
			var data = $.extend(true, {}, editConfig.data);
			var type = editConfig.method;
			if (typeof (data) == "object") {
				data = NetStarUtils.getFormatParameterJSON(data, {});
				for (var key in data) {
					if (data[key] == null) {
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
				var _configs = NetStarGrid.configs[tableId]; // 配置
				if (typeof (_configs) == 'undefined') {
					_configs = NetstarBlockList.configs[tableId]; // 配置
				}
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

	function confirmQuickQueryHandler(_queryObj) {
		var formId = _queryObj.formId;
		var gridId = _queryObj.gridId;
		var formJson = NetstarComponent.getValues(formId);
		var paramJson = {};
		var _gridConfig = {};
		if(NetStarGrid.configs[gridId]){
			_gridConfig = NetStarGrid.configs[gridId].gridConfig;
		}else{
			_gridConfig = NetstarBlockList.configs[gridId].gridConfig;
		}
		var uiConfig = _gridConfig.ui;
		if (formJson.filtermode == 'quickSearch') {
			if (formJson.filterstr) {
				paramJson = {
					keyword: formJson.filterstr,
					//quicklyQueryColumnNames:[],
					quicklyQueryColumnValue:formJson.filterstr,
				};
				if(uiConfig.query.quickQueryFieldArr.length > 0){
					paramJson.quicklyQueryColumnNames = uiConfig.query.quickQueryFieldArr;
				}
			}
		} else {
			var queryConfig = NetstarComponent.config[formId].config[formJson.filtermode];
			if (!$.isEmptyObject(queryConfig)) {
				if (formJson[formJson.filtermode]) {
					if (queryConfig.type == 'business' && typeof (queryConfig.outputFields) == "undefined") {
						switch (queryConfig.selectMode) {
							case 'single':
								paramJson[formJson.filtermode] = formJson[formJson.filtermode][queryConfig.idField];
								break;
							case 'checkbox':
								paramJson[formJson.filtermode] = formJson[formJson.filtermode][0][queryConfig.idField];
								break;
						}
					} else {
						paramJson[formJson.filtermode] = formJson[formJson.filtermode];
					}
				}
				if (typeof (formJson[formJson.filtermode]) == 'number') {
					paramJson[formJson.filtermode] = formJson[formJson.filtermode];
				}
				if (queryConfig.type == 'dateRangePicker') {
					var startDate = formJson.filtermode + 'Start';
					var endDate = formJson.filtermode + 'End';
					paramJson[startDate] = formJson[startDate];
					paramJson[endDate] = formJson[endDate];
				}else if(queryConfig.type == 'valuesInput'){
					var valuesInputStr = queryConfig.value;
					if(typeof(valuesInputStr)=='object'){
						$.each(valuesInputStr,function(k,v){
							paramJson[k] = v;
						})
					}
				}
			} else {
				if (formJson.filterstr) {
					paramJson[formJson.filtermode] = formJson.filterstr;
				}
			}
		}
		if(NetStarGrid.configs[gridId]){
			NetStarGrid.configs[gridId].vueObj.domParams.toPageInput.value = 1;
		}else{
			NetstarBlockList.configs[gridId].vueObj.domParams.toPageInput.value = 1;
		}
		if (typeof (uiConfig.callBackFuncByQuery) == 'function') {
			uiConfig.callBackFuncByQuery(_gridConfig, _gridConfig.package, paramJson);
		} else {
			if(!$.isEmptyObject(uiConfig.paramsData)){
				$.each(uiConfig.paramsData,function(k,v){
					if(typeof(paramJson[k])=='undefined'){
						paramJson[k] = v;
					}
				});
			}
			NetStarGrid.refreshById(gridId, paramJson);
		}
	}

	function queryListHandler(_configs) {
		function confirmQueryHandler(ev) {
			var $this = $(this);
			var formId = $this.attr('containerid');
			var prefix = 'query-';
			var gridId = formId.substring(prefix.length, formId.length);
			confirmQuickQueryHandler({
				gridId: gridId,
				formId: formId
			});
		}
		function queryFunc(formJson, queryFormArr, gridId){
			for (var i = 0; i < queryFormArr.length; i++) {
				var fieldId = queryFormArr[i].id;
				if (formJson[fieldId]) {
					if (queryFormArr[i].type == 'business' && typeof (queryFormArr[i].outputFields) == "undefined") {
						switch (queryFormArr[i].selectMode) {
							case 'single':
								formJson[fieldId] = formJson[fieldId][queryFormArr[i].idField];
								break;
							case 'checkbox':
								formJson[fieldId] = formJson[fieldId][0][queryFormArr[i].idField];
								break;
						}
					}
				}
			}
			formJson = nsServerTools.deleteEmptyData(formJson);
			var _gridConfig = {};
			if(NetStarGrid.configs[gridId]){
				_gridConfig = NetStarGrid.configs[gridId].gridConfig;
			}else{
				_gridConfig = NetstarBlockList.configs[gridId].gridConfig;
			}
			var uiConfig = _gridConfig.ui;
			if (typeof (uiConfig.callBackFuncByQuery) == 'function') {
				uiConfig.callBackFuncByQuery(_gridConfig, _gridConfig.package,formJson,'advance');
			}else{
				if(!$.isEmptyObject(uiConfig.paramsData)){
					$.each(uiConfig.paramsData,function(k,v){
						if(typeof(formJson[k])=='undefined'){
							formJson[k] = v;
						}
					});
				}
				NetStarGrid.refreshById(gridId, formJson);
			}
		}
		//sjj 如果有查询条件输出查询
		var uiConfig = _configs.gridConfig.ui;
		var queryConfig = uiConfig.query ? uiConfig.query : {
			queryForm: [],
			advanceForm: [],
			form: [],
		};
		if(uiConfig.isOpenFormQuery && queryConfig.form.length > 0){
			var formConfig = {
				id: queryConfig.id,
				// formStyle: 'pt-form-normal',
				plusClass: 'pt-form-query',
				isSetMore: false,
				form: queryConfig.form,
				defaultComponentWidth : '25%',
				completeHandler: function () {
					var btnHtml = '<div class="pt-btn-group pt-form-query-btn">' +
						'<button type="button" class="pt-btn pt-btn-warning pt-btn-search pt-btn-icon" nstype="refresh" containerid="' + queryConfig.id + '"><i class="icon-search"></i></button>' +
						'</div>';
					$('#' + queryConfig.id).children().children('.pt-form-footer').append(btnHtml);
					$('button[containerid="' + formConfig.id + '"]').off('click');
					$('button[containerid="' + formConfig.id + '"]').on('click', function(ev){
						var $this = $(this);
						var formId = $this.attr('containerid');
						var prefix = 'query-';
						var gridId = formId.substring(prefix.length, formId.length);
						var formJson = NetstarComponent.getValues(formId, false);
						queryFunc(formJson, queryConfig.form, gridId);
					});
					// 展开搜索加载完成后计算表格高度_configs.vueObj.domParams.contentTableContainer.style.height
					var gridId = _configs.gridConfig.id;
					var $grid = $('#' + gridId);
					var gridHeight = $grid.height();
					var queryHeight = $('#' + queryConfig.id).closest('.grid-header').height() + 10;
					var $gridContainer = $grid.children('.pt-grid-body').children('.pt-container');
					var gridFooterHeight = $grid.children('.pt-grid-footer').height();
					var $gridContainerHead = $gridContainer.children('.pt-grid-body-head');
					var gridContainerHeadBodyHeight = gridHeight - queryHeight - gridFooterHeight - $gridContainerHead.height();
					_configs.vueObj.domParams.contentTableContainer.style.height = gridContainerHeadBodyHeight + 'px';
					_configs.vueObj.domParams.scrollY.style.height = gridContainerHeadBodyHeight + 28 + 'px';
				}
			};
			NetstarComponent.formComponent.show(formConfig, {});
			return;
		}
		if (uiConfig.isOpenQuery && queryConfig.queryForm.length > 0) {
			//支持快速查询
			var formConfig = {
				id: queryConfig.id,
				formStyle: 'pt-form-normal',
				plusClass: 'pt-custom-query',
				isSetMore: false,
				form: queryConfig.queryForm,
				completeHandler: function () {
					var btnHtml = '<div class="pt-btn-group">' +
						'<button type="button" class="pt-btn pt-btn-default pt-btn-icon" nstype="refresh" containerid="' + queryConfig.id + '"><i class="icon-search"></i></button>' +
						'</div>';
					$('#' + queryConfig.id).append(btnHtml);
					$('button[containerid="' + formConfig.id + '"]').off('click', confirmQueryHandler);
					$('button[containerid="' + formConfig.id + '"]').on('click', confirmQueryHandler);
				}
			};
			NetstarComponent.formComponent.show(formConfig, {});
			setTimeout(function () {
				//绑定回车事件
				var componentVueconfig = NetstarComponent.config[formConfig.id].vueConfig;
				for (var fieldId in componentVueconfig) {
					if (fieldId != 'filtermode') {
						var elementConfig = componentVueconfig[fieldId];
						componentVueconfig[fieldId].inputEnter = function (event) {
							if (elementConfig.isShowDialog && typeof (elementConfig.returnData) == "object" && typeof (elementConfig.returnData.documentEnterHandler) == 'function') {
								elementConfig.returnData.documentEnterHandler();
							} else {
								event.stopImmediatePropagation();
								var elementId = $(event.currentTarget).attr('id');
								this.blur();
								var formId = $(this.$el).closest('.pt-form-body').attr('id');
								elementId = elementId.substring(formId.length + 1, elementId.length);
								formId = formId.substring(5, formId.length);

								var elementComponentConfig = NetstarComponent.config[formId].config[elementId];
								if (elementComponentConfig.type == 'businessSelect') {
									var vueConfig = NetstarComponent.config[formId].vueConfig[elementId];
									NetstarComponent.businessSelect.searchByEnter(elementComponentConfig, vueConfig, function (context, data) {
										var plusData = data.plusData;
										var _config = context.config ? context.config : NetstarComponent.config[formId].config[plusData.componentId];
										var _vueConfig = context.vueConfig ? context.vueConfig : NetstarComponent.config[formId].vueConfig[plusData.formID];
										_vueConfig.loadingClass = '';
										if (data.success) {
											var dataSrc = _config.search.dataSrc;
											var value = data[dataSrc];
											if ($.isArray(value) && value.length == 1) {
												_vueConfig.setValue(value); // 赋值
											}
											var gridId = formId.substring(6, formId.length);
											var templateId = gridId.substring(0, gridId.lastIndexOf('-list'));
											if (templateId) {
												config = NetstarTemplate.templates.businessDataBase.data[templateId].config;
											}
											confirmQuickQueryHandler({
												gridId: gridId,
												formId: formId
											});
										}
									});
								} else if (elementComponentConfig.type == 'business') {
									var vueConfig = NetstarComponent.config[formId].vueConfig[elementId];
									NetstarComponent.business.searchByEnter(elementComponentConfig, vueConfig, function (context, data) {
										var plusData = data.plusData;
										var _config = context.config ? context.config : NetstarComponent.config[formId].config[plusData.componentId];
										var _vueConfig = context.vueConfig ? context.vueConfig : NetstarComponent.config[formId].vueConfig[plusData.formID];
										_vueConfig.loadingClass = '';
										if (data.success) {
											var dataSrc = _config.search.dataSrc;
											var value = data[dataSrc];
											if ($.isArray(value) && value.length == 1) {
												_vueConfig.setValue(value); // 赋值
											}
											var gridId = formId.substring(6, formId.length);
											confirmQuickQueryHandler({
												gridId: gridId,
												formId: formId
											});
										}
									});
								} else {
									var gridId = formId.substring(6, formId.length);
									confirmQuickQueryHandler({
										gridId: gridId,
										formId: formId
									});
								}
							}
						}
					}
				}
			}, 100)
		}
		if (uiConfig.isOpenAdvanceQuery && queryConfig.advanceForm.length > 0) {
			//高级查询
			var advancedQueryId = 'advance-' + queryConfig.id;
			var advancedQueryConfig = {
				id: advancedQueryId,
				title: '高级查询',
				getAjaxData: {
					panelId: advancedQueryId,
				},
				saveAjaxData: {
					panelId: advancedQueryId,
				},
				delAjaxData: {},
				form: queryConfig.advanceForm,
				queryHandler: function (formJson, _config) {
					var gridId = queryConfig.id.substring(6, queryConfig.id.length);
					var formId = _config.queryTermId;
					store.set(formId, formJson);
					var queryFormArr = _config.form;
					queryFunc(formJson, queryFormArr, gridId);
					// for (var i = 0; i < queryFormArr.length; i++) {
					// 	var fieldId = queryFormArr[i].id;
					// 	if (formJson[fieldId]) {
					// 		if (queryFormArr[i].type == 'business' && typeof (queryFormArr[i].outputFields) == "undefined") {
					// 			switch (queryFormArr[i].selectMode) {
					// 				case 'single':
					// 					formJson[fieldId] = formJson[fieldId][queryFormArr[i].idField];
					// 					break;
					// 				case 'checkbox':
					// 					formJson[fieldId] = formJson[fieldId][0][queryFormArr[i].idField];
					// 					break;
					// 			}
					// 		}
					// 	}
					// }
					// formJson = nsServerTools.deleteEmptyData(formJson);
					// var _gridConfig = {};
					// if(NetStarGrid.configs[gridId]){
					// 	_gridConfig = NetStarGrid.configs[gridId].gridConfig;
					// }else{
					// 	_gridConfig = NetstarBlockList.configs[gridId].gridConfig;
					// }
					// var uiConfig = _gridConfig.ui;
					// if (typeof (uiConfig.callBackFuncByQuery) == 'function') {
					// 	uiConfig.callBackFuncByQuery(_gridConfig, _gridConfig.package,formJson,'advance');
					// }else{
					// 	if(!$.isEmptyObject(uiConfig.paramsData)){
					// 		$.each(uiConfig.paramsData,function(k,v){
					// 			if(typeof(formJson[k]=='undefined')){
					// 				formJson[k] = v;
					// 			}
					// 		});
					// 	}
					// 	NetStarGrid.refreshById(gridId,formJson);
					// }
				},
			}
			NetstarComponent.advancedQuery.init(advancedQueryConfig);
		}
	}
	//完成后处理器
	function initCompleteHandler(_configs) {
		// 添加查看按钮
		// if(_configs.gridConfig.ui.displayMode != 'treeGrid'){  // 当是treeGrid时跳过了一下方法，不知道原因；因此下拉框subdataText不能正常显示所以注掉了 lyw 20191024
		setViewConfig(_configs);
		setCountFuncConfig(_configs);
		//刷新subdata对应的ajax 
		refreshSubdataByAjax(_configs);
		// }
		//完成回调
		if (typeof (_configs.gridConfig.ui.completeHandler) == 'function') {
			_configs.gridConfig.ui.completeHandler(_configs);
		}
		queryListHandler(_configs);
	}

	function getVueConfig(_gridConfig) {
		/**
		 *_gridConfig:object {
		 *  data:[],    //数据描述参数
		 *  columns:[], //列配置参数     
		 * } 
		 **/
		//调用基本的设置默认值
		configManager.setDefault(_gridConfig);
		//先对容器进行设置高度，防止因为高度变化引起的闪烁
		htmlManager.setContainer(_gridConfig);

		var gridConfig = configManager.getConfig(_gridConfig);
		if (!gridConfig) {
			return false;
		}
		//获取与VUE标签匹配的VUE配置文件
		var vueConfig = vueManager.getVueConfig(gridConfig);
		//获取带VUE标签的代码
		var html = htmlManager.getHtml(gridConfig, vueConfig);


		return {
			html: html,
			vueConfig: vueConfig,
			gridConfig: gridConfig,
		};
	}

	function init(gridConfig) {
		//准备VUE输出 返回html和vue的整体参数
		var grid = NetStarGrid.getVueConfig(gridConfig);
		if (grid) {
			//先输出带VUE标签的HTML到相应的容器内
			$(grid.vueConfig.el).html(grid.html);
			//执行VUE渲染
			var vueObj = new Vue(grid.vueConfig);
			var configs = {
				original: gridConfig, //原始配置参数
				gridConfig: grid.gridConfig, //运行时配置参数
				vueConfig: grid.vueConfig, //vue配置参数
				vueObj: vueObj, //vue对象 
			}
			NetStarGrid.configs[gridConfig.id] = configs;
			initCompleteHandler(configs);
			//添加快捷键
			hotkeyManager.add(gridConfig.id);
			return vueObj;
		} else {
			return false;
		}
	}
	return {
		VERSION: '0.9.1', //cy 开始开发时间：2018/12/10 初步测试成时间：2019/01/29
		getVueConfig: getVueConfig,
		init: init,
		configs: {},
		resetData: function (tableRowsData, gridId,displayMode) {
			//tableRowsData:array 要填充的数据对象，格式：[{},{},...]
			//gridId:string  grid的id
			//对表格数据整体重新赋值 
			dataManager.resetData.call(dataManager, tableRowsData, gridId,displayMode);
		},
		addRow: function (rowData, gridId, insertIndex) {
			//rowData:object 要填充的数据对象，格式：{id:1,name:"name"}
			//gridId:string  grid的id
			//对表格添加数据一行数据
			dataManager.addRow.call(dataManager, rowData, gridId, insertIndex);
		},
		editRow: function (rowData, gridId, editRowIndex) {
			//rowData:object 要填充的数据对象，格式：{id:1,name:"name"}
			//gridId:string  grid的id
			//对表格添加数据一行数据
			dataManager.editRow.call(dataManager, rowData, gridId, editRowIndex);
		}, //编辑行
		//删除行
		delRow: function (rowData, gridId, deleteIndex) {
			/*
			 *rowData object 行数据
			 *gridId string  容器id
			 */
			//对表格删除一行数据
			dataManager.delRow.call(dataManager, rowData, gridId, deleteIndex);
		},
		//根据行下标设置行选中
		setRowSelectedByIndex: function (indexsArray, gridId, isCancelOthers) {
			/*
			 *indexsArray array 行下标
			 *gridId   string  容器id
			 *isCancelOthers boolean 是否取消其他行选中
			 */
			dataManager.setRowSelectedByIndex.call(dataManager, indexsArray, gridId, isCancelOthers);
		},
		//根据id设置行选中 
		setRowSelectedById: function (idsArray, gridId, isCancelOthers) {
			/*
			 *idsArray array 行id
			 *gridId   string  容器id
			 *isCancelOthers boolean 是否取消其他行选中
			 */
			dataManager.setRowSelectedById.call(dataManager, idsArray, gridId, isCancelOthers);
		},
		//设置当前第一个可编辑的单元格状态获取焦点
		setFirstEditRowState: function (gridId) {
			/*
			 *gridId   string  容器id
			 */
			dataManager.setFirstEditRowState.call(dataManager, gridId);
		},
		//设置编辑列
		setEditColumn: function (gridId) {
			/*
			 *gridId   string  容器id
			 */
			dataManager.setEditColumn.call(dataManager, gridId);
		},
		//根据字段和值获取数据
		getDataByFieldAndValue: function (gridId, fieldKey, fieldValue) {
			return dataManager.getDataByFieldAndValue.call(dataManager, gridId, fieldKey, fieldValue);
		},
		//根据字段和值设置data
		setDataByFieldAndValue: function (gridId, fieldKey, fieldValue, data) {
			dataManager.setDataByFieldAndValue.call(dataManager, gridId, fieldKey, fieldValue, data);
		},
		rowBtnsHandler: controllerManager.rowBtnsHandler, //行内按钮点击事件
		dataManager: dataManager, //数据管理器
		methods: controllerManager, //对外方法
		getSelectedData: controllerManager.getSelectedData, //获取选中的数据
		getCheckedData: controllerManager.getCheckedData, //获取checkbox选中的数据
		refreshById: controllerManager.refreshById, //刷新表格数据
		refreshDataById: controllerManager.refreshDataById, //刷新表格数据 根据id和data
		userConfiger: controllerManager.userConfiger, //用户配置工具
		userAllSelect: controllerManager.userAllSelect, //使用全选功能
		rowDelHandler: controllerManager.rowDelHandler, //行删除
		configManager: configManager, //获取配置参数
		vueManager: vueManager, //vue配置参数
		methodsManager: methodsManager, //方法
		htmlManager: htmlManager, //html
		initCompleteHandler: initCompleteHandler, //完成之后的回调 
		getTemplate: function () {
			return TEMPLATE;
		},
		treeOpenHandler: function (ev, gridId, isExpand) {
			var $this = $(ev);
			$this.addClass('selected');
			$this.siblings().removeClass('selected');
			this.treeExpandByGridId(gridId, isExpand);
		},
		//sjj 20191106 treeGrid支持全部展开全部关闭的方法
		treeExpandByGridId: function (gridId, isExpand) {
			isExpand = typeof (isExpand) == 'boolean' ? isExpand : true; //默认全部展开
			var rows = NetStarGrid.configs[gridId].vueObj.originalRows;
			if (!$.isArray(rows)) {
				rows = [];
			}
			//全部展开 节点都展开 netstarExpand netstarOpen都为true 
			//全部关闭 节点关闭状态 netstarExpand netstarOpen
			for (var rowI = 0; rowI < rows.length; rowI++) {
				if (isExpand) {
					//如果是全部展开 父节点处于闭合状态 子节点打开
					rows[rowI].netstarExpand = true;
					if (rows[rowI].isParent) {
						//当前是父节点需要显示出来
						rows[rowI].netstarOpen = true;
					} else {
						rows[rowI].netstarOpen = true;
					}
				} else {
					//全部关闭 父节点处于闭合状态 
					rows[rowI].netstarExpand = false;
					if (rows[rowI].isParent && rows[rowI].netstarLevel == 0) {
						//当前是父节点需要显示出来
						rows[rowI].netstarOpen = true;
					} else {
						rows[rowI].netstarOpen = false;
					}
				}
			}
			NetStarGrid.refreshDataById(gridId, rows);
		}
	}
})(jQuery)