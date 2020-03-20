var nsEditorPage = {}
nsEditorPage.init = function(config){
	// 验证并设置默认值
	nsEditorPage.setDefault(config);
	$.ajax({
		url:config.url,
		type:config.type,
		dataType:config.dataType,
		success:function(data){
			if(data.success){
				config.sourceData = $.extend(true,{},data[config.dataSrc]); // 保存原始数据
				config.handlerData = nsEditorPage.getInitData(data[config.dataSrc]); // 处理后的数据
				nsEditorPage.generatingPage(config);
			}
		}
	})
}
// 生成页面
nsEditorPage.generatingPage = function(config){
	// var dialog = config.handlerData.dataArr; // 表格显示的数据
	// 插入插表格的容器
	$("container").append('<div class="row form-content" id="'+config.tableId+'-parent">'
							+'<div class="col-sm-5 main-panel">'
								+'<div class="panel panel-default">'
									+'<div class="panel-body" id="'+config.tableId+'">'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>');
	// 生成页面表格
	nsEditorPage.pageGeneratingTable(config);
}
// 生成页面表格
nsEditorPage.pageGeneratingTable = function(config){
	var dataConfig = {
		tableID:				config.tableId + '-table',
		dataSource: 			config.handlerData.dataArr
	}
	var columnConfig = [
		{
			field:'englishName',
			title:'englishName'
		},{
			field:'chineseName',
			title:'chineseName'
		},{
			field:'variableType',
			title:'variableType'
		},{
			field:'btns',
			title:'操作',
			formatHandler:{
				type: 'button',
				data: [
					{
						"编辑":function(selectLineData){
							nsEditorPage.editorPanle(selectLineData,config);
						}
					}
				]
			}
		}
	]
	var uiConfig = {
		searchTitle: 		"查询",					//搜索框前面的文字，默认为检索
		searchPlaceholder: 	"中文名，英文名",		//搜索框提示文字，默认为可搜索的列名
	}
	var btnConfig = {
		selfBtn:[
			{
				text:'新增',
				handler:function(){

				}
			}
		]
	}
	// 插入表格容器
	$('#'+config.tableId).append('<div class="table-responsive">'
									+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="'+config.tableId + '-table'+'">'
									+'</table>'
								+'</div>');
	// 生成表格
	baseDataTable.init(dataConfig, columnConfig, uiConfig,btnConfig);
}
// 生成编辑面板
nsEditorPage.editorPanle = function(selectLineData,config){
	var rowData = selectLineData.rowData;
	var object = {
		baseData:rowData,
		allData:config.sourceData,
		id:'editor',
		// containerId:'client-table-parent',
		type:'dialog',
		column:7,
	}
	var saveData = {};
	nsComponentEditor.init(object,saveData);
}
// 设置默认值
nsEditorPage.setDefault = function(config){
	var defaultJson = {
		url: 				getRootPath() + '/assets/json/edit/form.json',	//默认菜单url
		type:       	 	'GET', 											//默认ajax请求方式是GET请求
		data: 				{},												//默认请求的参数是否为空
		dataSrc: 			'rows',											//默认的数据源data
		dataType: 			'json',											//默认返回类型
		tableId: 			'client-table',									//默认显示表格容器id
		editorId: 			'modal',										//默认显示编辑容器

	}
	nsVals.setDefaultValues(config,defaultJson);
}
// 处理原始数据 处理成包含两个数组的对象
nsEditorPage.getInitData = function(data){
	var dataObj = {
		keyArr:[],
		dataArr:[]
	};
	for(var key in data){
		dataObj.keyArr.push(key);
		dataObj.dataArr.push(data[key]);
	}
	return dataObj;
}
var nsComponentEditor = (function($){
	// 表单数组配置对象
	var getTypeData = {
		outFields:{
			id:'outFields',
			label:'outFields',
			type:'textarea',
			column:12,
		},
		label:{
			id:'label',
			label:'label',
			type:'text',
			column:12,
		},
		primaryKey:{
			id:'primaryKey',
			label:'主键',
			type:'text',
			column:12,
		},
		displayField:{
			id:'displayField',
			label:'显示字段',
			type:'text',
			column:12,
		},
		readonly:{
			id:'readonly',
			label:'只读',
			type:'radio',
			textField:'name',
			valueField:'id',
			column:12,
			value:'false',
			subdata:[
				{id:'true',name:'true'},
				{id:'false',name:'false'}
			]
		},
		urlType:{
			id:'urlType',
			label:'urlType',
			type:'radio',
			textField:'name',
			valueField:'id',
			column:12,
			value:'items',
			subdata:[
				{id:'items',name:'items'},
				{id:'pfItems',name:'pfItems'}
			]
		},
		width:{
			id:'width',
			type:'text',
			label:'列宽',
			column:12,
		},
		height:{
			id:'height',
			type:'text',
			label:'高度',
			column:12,
		},
		url:{
			id:'url',
			type:'text',
			label:'地址',
			column:12,
		},
		dataSrc:{
			id:'dataSrc',
			type:'text',
			label:'数据源',
			column:12,
		},
		data:{
			id:'data',
			type:'textarea',
			label:'传参',
			column:12,
		},
		method:{
			id:'method',
			label:'发送方式',
			type:'radio',
			textField:'name',
			valueField:'id',
			column:12,
			value:'POST',
			subdata:[
				{id:'GET',name:'GET'},
				{id:'POST',name:'POST'}
			]
		},
		isHasClose:{
			id:'isHasClose',
			label:'是否显示清空按钮',
			type:'radio',
			textField:'name',
			valueField:'id',
			column:12,
			value:'false',
			subdata:[
				{id:'true',name:'true'},
				{id:'false',name:'false'}
			]
		},
		multiple:{
			id:'multiple',
			label:'多选',
			type:'radio',
			textField:'name',
			valueField:'id',
			column:12,
			value:'false',
			subdata:[
				{id:'true',name:'true'},
				{id:'false',name:'false'}
			]
		},
		filltag:{
			id:'filltag',
			label:'自输入添加标签',
			type:'radio',
			textField:'name',
			valueField:'id',
			column:12,
			value:'false',
			subdata:[
				{id:'true',name:'true'},
				{id:'false',name:'false'}
			]
		},
		isAllowClear:{
			id:'isAllowClear',
			label:'清空选择',
			type:'radio',
			textField:'name',
			valueField:'id',
			column:12,
			value:'false',
			subdata:[
				{id:'true',name:'true'},
				{id:'false',name:'false'}
			]
		},
		isCloseSearch:{
			id:'isCloseSearch',
			label:'开启搜索项',
			type:'radio',
			textField:'name',
			valueField:'id',
			column:12,
			value:-1,
			subdata:[
				{id:1,name:'true'},
				{id:-1,name:'false'}
			]
		},
		maximumItem:{
			id:'maximumItem',
			label:'最多允许选择项',
			type:'text',
			column:12,
		},
		textField:{
			id:'textField',
			label:'文本属性',
			type:'text',
			value:'value',
			column:12,
		},
		valueField:{
			id:'valueField',
			label:'文本值属性',
			type:'text',
			value:'id',
			column:12,
		},
		haschildField:{
			id:'haschildField',
			label:'含有子菜单id',
			type:'radio',
			textField:'name',
			valueField:'id',
			column:12,
			value:'false',
			subdata:[
				{id:'true',name:'true'},
				{id:'false',name:'false'}
			]
		},
		fullnameField:{
			id:'fullnameField',
			label:'全称属性id',
			type:'text',
			column:12,
		},
		isCheck:{
			id:'isCheck',
			label:'多选',type:'radio',
			textField:'name',
			valueField:'id',
			column:12,
			value:'false',
			subdata:[
				{id:'true',name:'true'},
				{id:'false',name:'false'}
			]
		},
		isCheckParent:{
			id:'isCheckParent',
			label:'选中父节点',type:'radio',
			textField:'name',
			valueField:'id',
			column:12,
			value:'false',
			subdata:[
				{id:'true',name:'true'},
				{id:'false',name:'false'}
			]
		},
		isRadio:{
			id:'isRadio',
			label:'radio样式选择',
			type:'radio',
			textField:'name',
			valueField:'id',
			column:12,
			value:'false',
			subdata:[
				{id:'true',name:'true'},
				{id:'false',name:'false'}
			]
		},
		isDefaultDate:{
			id:'isDefaultDate',
			label:'显示默认日期',
			type:'radio',
			textField:'name',
			valueField:'id',
			column:12,
			value:'false',
			subdata:[
				{id:'true',name:'true'},
				{id:'false',name:'false'}
			]
		},
		format:{
			id:'format',
			label:'日期时间格式',
			type:'text',
			column:12,
		},
		column:{
			id:'column',
			label:'表单宽度',
			type:'radio',
			textField:'name',
			valueField:'id',
			column:12,
			value:'3',
			subdata:[
				{id:'3',name:'3'},
				{id:'4',name:'4'},
				{id:'6',name:'6'},
				{id:'12',name:'12'},
			]
		},
		html:{
			id:'html',
			type:'textarea',
			label:'html',
			column:12,
		},
		note:{
			id:'note',
			type:'textarea',
			label:'html',
			column:12,
		},
		custom:{
			id:'custom',
			type:'textarea',
			label:'自定义配置 ',
			height:300,
			column:12,
		},
		formOrTable:{
			id:'formOrTable',
			type:'radio',
			label:'显示形式 ',
			textField:'name',
			valueField:'id',
			column:12,
			value:'form',
			subdata:[
				{id:'form',name:'表单'},
				{id:'table',name:'表格'}
			]
		},
		dictArguments:{
			id:'dictArguments',
			type:'text',
			label:'dictArguments',
			required:true,
			column:12,
		},
		columnType:{
			id : 'columnType',
			label : '表格列类型',
			type : 'select',
			textField : 'name',
			valueField : 'id',
			column : 12,
			subdata:[
				{ id : 'stringReplace' , name : 'stringReplace', },
				{ id : 'columnState' , name : 'columnState' , },
				{ id : 'money' , name : 'money 自定义formatType', },
				{ id : 'number' , name : 'number 自定义formatType', },
				{ id : 'radio' , name : 'radio 自定义radio', },
				{ id : 'checkbox' , name : 'checkbox 自定义checkbox', },
				{ id : 'selectbase' , name : 'selectbase 自定义select', },
				{ id : 'date' , name : 'date 自定义date', },
				{ id : 'datetime' , name : 'datetime 自定义datetime', },
				{ id : 'href' , name : 'href 自定义href', },
				{ id : 'upload' , name : 'upload 自定义upload上传', },
				{ id : 'input' , name : 'input 自定义input', },
				{ id : 'formatDate' , name : 'formatDate 格式化时间戳', },
				{ id : 'dictionary' , name : 'dictionary 自定义dictionary', },
				{ id : 'switch' , name : 'switch', },
				{ id : 'thumb' , name : 'thumb', },
				{ id : 'multithumb' , name : 'multithumb', },
				{ id : 'codeToName' , name : 'codeToName', },
			],
		},
		columnTypeData:{
			id : 'columnTypeData',
			label : '表格列数据',
			type : 'textarea',
			column : 12,
			hidden : true,
		},
		columnTypeText:{
			id : 'columnTypeText',
			label : '表格列数据名称',
			type : 'text',
			column : 12,
			hidden : true,
		},
		max:{
			id:'max',
			label:'max',
			type:'text',
			rules:'number',
			column:12,
		},
		step:{
			id:'step',
			label:'step',
			type:'text',
			rules:'number',
			column:12,
		},
		value:{
			id:'value',
			label:'默认值',
			type:'text',
			column:12,
		},
		model:{
			id:'model',
			label:'编辑器模式',
			type:'radio',
			column:12,
			textField:'name',
			valueField:'id',
			value:'standard',
			subdata:[
				{
					id:'min',
					name:'min',
				},{
					id:'standard',
					name:'standard',
				},{
					id:'all',
					name:'all',
				},{
					id:'custom',
					name:'custom',
				}
			],
		},
		toolbars:{
			id:'toolbars',
			label:'自定义按钮组',
			type:'select2',
			column:12,
			textField:'name',
			valueField:'id',
			multiple:true,
			subdata:[
			    {
			        "id": "anchor",
			        "name": "锚点"
			    },
			    {
			        "id": "undo",
			        "name": "撤销"
			    },
			    {
			        "id": "redo",
			        "name": "重做"
			    },
			    {
			        "id": "bold",
			        "name": "加粗"
			    },
			    {
			        "id": "indent",
			        "name": "首行缩进"
			    },
			    {
			        "id": "snapscreen",
			        "name": "截图"
			    },
			    {
			        "id": "italic",
			        "name": "斜体"
			    },
			    {
			        "id": "underline",
			        "name": "下划线"
			    },
			    {
			        "id": "strikethrough",
			        "name": "删除线"
			    },
			    {
			        "id": "subscript",
			        "name": "下标"
			    },
			    {
			        "id": "fontborder",
			        "name": "字符边框"
			    },
			    {
			        "id": "superscript",
			        "name": "上标"
			    },
			    {
			        "id": "formatmatch",
			        "name": "格式刷"
			    },
			    {
			        "id": "source",
			        "name": "源代码"
			    },
			    {
			        "id": "blockquote",
			        "name": "引用"
			    },
			    {
			        "id": "pasteplain",
			        "name": "纯文本粘贴模式"
			    },
			    {
			        "id": "selectall",
			        "name": "全选"
			    },
			    {
			        "id": "print",
			        "name": "打印"
			    },
			    {
			        "id": "preview",
			        "name": "预览"
			    },
			    {
			        "id": "horizontal",
			        "name": "分隔线"
			    },
			    {
			        "id": "removeformat",
			        "name": "清除格式"
			    },
			    {
			        "id": "time",
			        "name": "时间"
			    },
			    {
			        "id": "date",
			        "name": "日期"
			    },
			    {
			        "id": "unlink",
			        "name": "取消链接"
			    },
			    {
			        "id": "insertrow",
			        "name": "前插入行"
			    },
			    {
			        "id": "insertcol",
			        "name": "前插入列"
			    },
			    {
			        "id": "mergeright",
			        "name": "右合并单元格"
			    },
			    {
			        "id": "mergedown",
			        "name": "下合并单元格"
			    },
			    {
			        "id": "deleterow",
			        "name": "删除行"
			    },
			    {
			        "id": "deletecol",
			        "name": "删除列"
			    },
			    {
			        "id": "splittorows",
			        "name": "拆分成行"
			    },
			    {
			        "id": "splittocols",
			        "name": "拆分成列"
			    },
			    {
			        "id": "splittocells",
			        "name": "完全拆分单元格"
			    },
			    {
			        "id": "deletecaption",
			        "name": "删除表格标题"
			    },
			    {
			        "id": "inserttitle",
			        "name": "插入标题"
			    },
			    {
			        "id": "mergecells",
			        "name": "合并多个单元格"
			    },
			    {
			        "id": "deletetable",
			        "name": "删除表格"
			    },
			    {
			        "id": "cleardoc",
			        "name": "清空文档"
			    },
			    {
			        "id": "insertparagraphbeforetable",
			        "name": "表格前插入行"
			    },
			    {
			        "id": "insertcode",
			        "name": "代码语言"
			    },
			    {
			        "id": "fontfamily",
			        "name": "字体"
			    },
			    {
			        "id": "fontsize",
			        "name": "字号"
			    },
			    {
			        "id": "paragraph",
			        "name": "段落格式"
			    },
			    {
			        "id": "edittable",
			        "name": "表格属性"
			    },
			    {
			        "id": "edittd",
			        "name": "单元格属性"
			    },
			    {
			        "id": "link",
			        "name": "超链接"
			    },
			    {
			        "id": "emotion",
			        "name": "表情"
			    },
			    {
			        "id": "spechars",
			        "name": "特殊字符"
			    },
			    {
			        "id": "searchreplace",
			        "name": "查询替换"
			    },
			    {
			        "id": "map",
			        "name": "Baidu地图"
			    },
			    {
			        "id": "gmap",
			        "name": "Google地图"
			    },
			    {
			        "id": "insertvideo",
			        "name": "视频"
			    },
			    {
			        "id": "help",
			        "name": "帮助"
			    },
			    {
			        "id": "justifyleft",
			        "name": "居左对齐"
			    },
			    {
			        "id": "justifyright",
			        "name": "居右对齐"
			    },
			    {
			        "id": "justifycenter",
			        "name": "居中对齐"
			    },
			    {
			        "id": "justifyjustify",
			        "name": "两端对齐"
			    },
			    {
			        "id": "forecolor",
			        "name": "字体颜色"
			    },
			    {
			        "id": "backcolor",
			        "name": "背景色"
			    },
			    {
			        "id": "insertorderedlist",
			        "name": "有序列表"
			    },
			    {
			        "id": "insertunorderedlist",
			        "name": "无序列表"
			    },
			    {
			        "id": "fullscreen",
			        "name": "全屏"
			    },
			    {
			        "id": "directionalityltr",
			        "name": "从左向右输入"
			    },
			    {
			        "id": "directionalityrtl",
			        "name": "从右向左输入"
			    },
			    {
			        "id": "rowspacingtop",
			        "name": "段前距"
			    },
			    {
			        "id": "rowspacingbottom",
			        "name": "段后距"
			    },
			    {
			        "id": "pagebreak",
			        "name": "分页"
			    },
			    {
			        "id": "insertframe",
			        "name": "插入Iframe"
			    },
			    {
			        "id": "imagenone",
			        "name": "默认"
			    },
			    {
			        "id": "imageleft",
			        "name": "左浮动"
			    },
			    {
			        "id": "imageright",
			        "name": "右浮动"
			    },
			    {
			        "id": "attachment",
			        "name": "附件"
			    },
			    {
			        "id": "imagecenter",
			        "name": "居中"
			    },
			    {
			        "id": "wordimage",
			        "name": "图片转存"
			    },
			    {
			        "id": "lineheight",
			        "name": "行间距"
			    },
			    {
			        "id": "edittip",
			        "name": "编辑提示"
			    },
			    {
			        "id": "customstyle",
			        "name": "自定义标题"
			    },
			    {
			        "id": "autotypeset",
			        "name": "自动排版"
			    },
			    {
			        "id": "webapp",
			        "name": "百度应用"
			    },
			    {
			        "id": "touppercase",
			        "name": "字母大写"
			    },
			    {
			        "id": "tolowercase",
			        "name": "字母小写"
			    },
			    {
			        "id": "background",
			        "name": "背景"
			    },
			    {
			        "id": "template",
			        "name": "模板"
			    },
			    {
			        "id": "scrawl",
			        "name": "涂鸦"
			    },
			    {
			        "id": "music",
			        "name": "音乐"
			    },
			    {
			        "id": "inserttable",
			        "name": "插入表格"
			    },
			    {
			        "id": "drafts",
			        "name": "从草稿箱加载"
			    },
			    {
			        "id": "charts",
			        "name": "图表"
			    },
			    {
			        "id": "kityformula",
			        "name": "公式插件"
			    }
			]
		},
		wordCount:{
			id:'wordCount',
			label:'显示总字数',
			type:'radio',
			column:12,
			textField:'name',
			valueField:'id',
			value:'false',
			subdata:[
				{
					id:'true',
					name:'true',
				},{
					id:'false',
					name:'false',
				},
			],
		},
		dropdownFilter:{
			id:'dropdownFilter',
			label:'显示分组',
			type:'text',
			column:12,
		},
		selfData:{
			id:'selfData',
			label:'自定义搜索项值',
			type:'text',
			column:12,
		},
		order:{
			id:'order',
			label:'对搜索结果排序',
			type:'radio',
			column:12,
			textField:'name',
			valueField:'id',
			value:'asc',
			subdata:[
				{
					id:'asc',
					name:'升序',
				},{
					id:'desc',
					name:'降序',
				},
			],
		},
		searchField:{
			id:'searchField',
			label:'检索的id',
			type:'text',
			column:12,
		},
		addHandler:{
			id:'addHandler',
			label:'添加的方法',
			type:'textarea',
			column:12,
		},
		localDataConfig:{
			id:'localDataConfig',
			label:'源数据属性',
			type:'textarea',
			column:12,
		},
		completeHandler:{
			id:'completeHandler',
			label:'完成后',
			type:'textarea',
			column:12,
		},
		pyCode:{
			id:'pyCode',
			label:'拼音',
			type:'text',
			column:12,
		},
		wbCode:{
			id:'wbCode',
			label:'五笔',
			type:'text',
			column:12,
		},
		parentId:{
			id:'parentId',
			label:'parentId',
			type:'text',
			column:12,
		},
		localDataConfig:{
			id:'localDataConfig',
			label:'人员数组',
			type:'textarea',
			column:12,
		},
		expressionField:{
			id:'expressionField',
			label:'字段名1',
			type:'text',
			column:12,
		},
		expressionField1:{
			id:'expressionField1',
			label:'字段名2',
			type:'text',
			column:12,
		},
		orderable:{
			id:'orderable',
			label:'是否允许列排序',
			type:'radio',
			column:12,
			textField:'name',
			valueField:'id',
			value:'false',
			subdata:[
				{
					id:'true',
					name:'true',
				},{
					id:'false',
					name:'false',
				}
			],
		},
		searchable:{
			id:'searchable',
			label:'是否允许列搜索',
			type:'radio',
			column:12,
			textField:'name',
			valueField:'id',
			value:'false',
			subdata:[
				{
					id:'true',
					name:'true',
				},{
					id:'false',
					name:'false',
				}
			],
		},
		total:{
			id:'total',
			label:'是否计算该列小计',
			type:'radio',
			column:12,
			textField:'name',
			valueField:'id',
			value:'false',
			subdata:[
				{
					id:'true',
					name:'true',
				},{
					id:'false',
					name:'false',
				}
			],
		},
		precision:{
			id:'precision',
			label:'列的小数位数',
			type:'text',
			column:12,
		},
		tooltip:{
			id:'tooltip',
			label:'提示信息',
			type:'radio',
			column:12,
			textField:'name',
			valueField:'id',
			value:'false',
			subdata:[
				{
					id:'true',
					name:'true',
				},{
					id:'false',
					name:'false',
				}
			],
		},
		hidden:{
			id:'hidden',
			label:'隐藏列',
			type:'radio',
			column:12,
			textField:'name',
			valueField:'id',
			value:'false',
			subdata:[
				{
					id:'true',
					name:'true',
				},{
					id:'false',
					name:'false',
				}
			],
		},
		supportFormat:{
			id:'supportFormat',
			label:'文件类型',
			type:'select2',
			column:12,
			textField:'name',
			valueField:'id',
			isCloseSearch:true,
			// subdata:mimeTypeSub,
		},
		uploadSrc:{
			id:'uploadSrc',
			label:'地址',
			type:'text',
			column:12,
		},
		fieldLength:{
			id:'fieldLength',
			label:'字段长度',
			type:'text',
			column:12,
		},
		rangeType:{
			id:'rangeType',
			label:'日期分类',
			type:'radio',
			column:12,
			textField:'name',
			valueField:'id',
			value:'after',
			subdata:[
				{
					id:'before',
					name:'before',
				},{
					id:'after',
					name:'after',
				}
			],
		},
		isMulitSelect:{
			id:'isMulitSelect',
			label:'多选',
			type:'radio',
			column:12,
			textField:'name',
			valueField:'id',
			value:'false',
			subdata:[
				{
					id:'true',
					name:'true',
				},{
					id:'false',
					name:'false',
				}
			],
		},
		isSingleSelect:{
			id:'isSingleSelect',
			label:'单选',
			type:'radio',
			column:12,
			textField:'name',
			valueField:'id',
			value:'true',
			subdata:[
				{
					id:'true',
					name:'true',
				},{
					id:'false',
					name:'false',
				}
			],
		},
		isPage:{
			id:'isPage',
			label:'是否翻页',
			type:'radio',
			column:12,
			textField:'name',
			valueField:'id',
			value:'true',
			subdata:[
				{
					id:'true',
					name:'true',
				},{
					id:'false',
					name:'false',
				}
			],
		},
		dataFormat:{
			id:'dataFormat',
			label:'格式化',
			type:'radio',
			column:12,
			textField:'name',
			valueField:'id',
			value:'ids',
			subdata:[
				{
					id:'ids',
					name:'ids',
				},{
					id:'list',
					name:'list',
				},{
					id:'none',
					name:'none',
				}
			],
		},
		idField:{
			id:'idField',
			label:'idField',
			type:'text',
			column:12,
		},
		columnConfig:{
			id:'columnConfig',
			label:'columnConfig',
			type:'textarea',
			column:12,
		},
		pageLengthMenu:{
			id:'pageLengthMenu',
			label:'显示行个数',
			type:'text',
			value:5,
			column:12,
		},
		'contentType':{
			id:'contentType',
			label:'Content-Type',
			type:'text',
			column:12,
		},
		'isAllowFiles':{
			id:'isAllowFiles',
			label:'上传文件数量',
			type:'number',
			column:12,
		},
		'relationField':{
			id:'relationField',
			label:'关联字段',
			type:'text',
			column:12,
		},
		'rowColor':{
			id:'rowColor',
			label:'rowColor',
			type:'textarea',
			column:12,
		},
	}
	// 显示内容
	var componentTypeData = {
		tableForm:{
			rules:false,
			label:false,
			base:true,
			readonly:false,
			listData:true,
			changeHandlerData:false,
			other:true,
			showType:true,
		},
		text:{
			rules:[
				{value:'required',text:'必填'},
				{value:'email',text:'email'},
				{value:'url',text:'url'},
				{value:'ismobile',text:'手机号'},
				{value:'postalcode',text:'邮政编码'},
				{value:'Icd',text:'身份证号'},
				{value:'bankno',text:'银行卡号'},
				{value:'creditcard',text:'信用卡号'},
				{value:'number',text:'数字'},
				{value:'positiveInteger',text:'正整数'},
				// {value:'precision',text:'数字合法'},
				{value:'negative',text:'负数合法'},
				{value:'year',text:'年份'},
				{value:'month',text:'月份'},
				{value:'dateISO',text:'有效日期'},
				{value:'min=0',text:'正数'},
			],
			label:true,
			base:true,
			readonly:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
		},
		select:{
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
			readonly:true,
			base:true,
			listData:true,
			changeHandlerData:true,
			other:true,
			showType:true,
		},
		select2:{
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
			readonly:true,
			base:true,
			listData:true,
			changeHandlerData:true,
			other:true,
			showType:true,
		},
		radio:{
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
			readonly:true,
			base:true,
			listData:true,
			changeHandlerData:true,
			other:true,
			showType:true,
		},
		checkbox:{
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
			readonly:true,
			base:true,
			listData:true,
			changeHandlerData:true,
			other:true,
			showType:true,
		},
		date:{
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
			readonly:true,
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
		},
		datetime:{
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
			readonly:true,
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
		},
		daterangeRadio:{
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
			readonly:true,
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
		},
		custom:{
			label:false,
			rules:false,
			readonly:false,
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:false,
		},
		hidden:{
			label:true,
			rules:false,
			readonly:false,
			base:true,
			listData:false,
			changeHandlerData:false,
			other:false,
			showType:true,
		},
		textarea:{
			rules:[
				{value:'required',text:'必填'},
				{value:'number',text:'数字'},
			],
			label:true,
			readonly:true,
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
		},
		'select-dict':{
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
			readonly:true,
			base:true,
			listData:false,
			changeHandlerData:true,
			other:true,
			showType:true,
		},
		'select2-dict':{
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
			readonly:true,
			base:true,
			listData:false,
			changeHandlerData:true,
			other:true,
			showType:true,
		},
		'radio-dict':{
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
			readonly:true,
			base:true,
			listData:false,
			changeHandlerData:true,
			other:true,
			showType:true,
		},
		'checkbox-dict':{
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
			readonly:true,
			base:true,
			listData:false,
			changeHandlerData:true,
			other:true,
			showType:true,
		},
		switch:{
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
			readonly:true,
			base:true,
			listData:false,
			changeHandlerData:true,
			other:true,
			showType:true,
		},
		uploadImage:{
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
			readonly:false,
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
		},
		'uploadSingle':{
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
			readonly:false,
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
		},
		'upload-single':{
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
			readonly:false,
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
		},
		graphicsInput:{
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
			readonly:false,
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
		},
		'provincelink-select':{
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
			readonly:true,
			base:true,
			listData:false,
			changeHandlerData:false,
			other:false,
			showType:true,
		},
		ueditor:{
			rules:false,
			label:true,
			readonly:true,
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
		},
		typeaheadtemplate:{
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
			readonly:true,
			base:true,
			listData:true,
			changeHandlerData:false,
			other:true,
			showType:true,
		},
		'organiza-select':{
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
			readonly:true,
			base:true,
			listData:true,
			changeHandlerData:false,
			other:true,
			showType:true,
		},
		'input-select':{
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
			readonly:true,
			base:true,
			listData:true,
			changeHandlerData:false,
			other:true,
			showType:true,
		},
		'person-select':{
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
			readonly:true,
			base:true,
			listData:true,
			changeHandlerData:false,
			other:true,
			showType:true,
		},
		colorpickerinput:{
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
			readonly:true,
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
		},
		expression:{
			rules:false,
			label:true,
			readonly:true,
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
		},
		label:{
			label:true,
			rules:false,
			readonly:false,
			base:true,
			listData:false,
			changeHandlerData:false,
			other:false,
			showType:false,
		},
		note:{
			label:false,
			rules:false,
			base:true,
			readonly:false,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:false,
		},
		html:{
			label:false,
			rules:false,
			base:true,
			readonly:false,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:false,
		},
		hr:{
			label:false,
			rules:false,
			base:true,
			readonly:false,
			listData:false,
			changeHandlerData:false,
			other:false,
			showType:false,
		},
		title:{
			label:true,
			rules:false,
			readonly:false,
			base:true,
			listData:false,
			changeHandlerData:false,
			other:false,
			showType:false,
		},
		br:{
			label:false,
			rules:false,
			readonly:false,
			base:true,
			listData:false,
			changeHandlerData:false,
			other:false,
			showType:false,
		},
		element:{
			label:true,
			rules:false,
			readonly:false,
			base:true,
			listData:false,
			changeHandlerData:false,
			other:false,
			showType:false,
		},
	}
	// type下拉 内容
	var variableType = {
		string:['text','select','select2','radio','checkbox','note','html','element','hidden','custom','textarea','switch','select-dict','select2-dict','radio-dict','checkbox-dict','graphicsInput','uploadImage','uploadSingle','provincelink-select','ueditor','typeaheadtemplate','organiza-select','input-select','person-select','colorpickerinput','expression','tableForm'],
		date:['date','datetime','daterangeRadio','hidden','custom'],
		number:['text','select2','select','radio','checkbox','hidden','custom','textarea','switch','select-dict','select2-dict','radio-dict','checkbox-dict','graphicsInput','uploadImage','uploadSingle','provincelink-select','ueditor','typeaheadtemplate','organiza-select','input-select','person-select','colorpickerinput','expression','tableForm'],
		boolean:['radio','checkbox','hidden','switch','custom','graphicsInput','uploadImage','uploadSingle','provincelink-select','ueditor','typeaheadtemplate','organiza-select','input-select','person-select','colorpickerinput','expression','tableForm'],
		other:['label','title','html','note','hr','br'],
	}
	var help = {
		/*text:'',
		select:'',
		select2:'',
		radio:'',
		checkbox:'',*/
		note:'基本用法',
		html:'基本用法',
		element:'基本用法',
		/*hidden:'',*/
		custom:'自定义',
		/*textarea:'',*/
		switch:'参见checkbox',
		'select-dict':'字典',
		'select2-dict':'字典',
		'radio-dict':'字典',
		'checkbox-dict':'字典',
		graphicsInput:'星级评选',
		uploadImage:'上传头像',
		'uploadSingle':'upload上传',
		'provincelink-select':'省市县三级联动',
		ueditor:'UEditor',
		typeaheadtemplate:'typeahead使用',
		'organiza-select':'组织树输入框',
		'input-select':'系统输入下啦框',
		'person-select':'人员选择器',
		colorpickerinput:'color选择器',
		expression:'变量编辑器',
		/*date:'',
		datetime:'',*/
		tableForm:'弹框预定义功能 表格组件',
	}
	// 其它面板 表单显示内容
	var formConfig = {
		ajax:['url','method','dataSrc','data'],
		all:['width','column'],
		form:['column'],
		table:['width','fieldLength','columnType','columnTypeData','hidden','orderable','searchable','total','tooltip','rowColor'],
		select2:['textField','valueField','multiple','filltag','isAllowClear','maximumItem','isCloseSearch','outFields','contentType'],
		select:['textField','valueField','contentType','relationField','outFields'],
		radio:['isHasClose','textField','valueField','outFields','contentType'],
		checkbox:['textField','valueField','outFields','contentType'],
		date:['isDefaultDate','format'],
		datetime:['isDefaultDate','format'],
		element:['width'],
		html:['html'],
		note:['note'],
		custom:['formOrTable','custom'],
		textarea:['height'],
		'select-dict':['dictArguments','textField','valueField','outFields'],
		'select2-dict':['dictArguments','textField','valueField','multiple','filltag','isAllowClear','maximumItem','isCloseSearch','outFields'],
		'radio-dict':['dictArguments','textField','valueField','isHasClose','outFields'],
		'checkbox-dict':['dictArguments','textField','valueField','outFields'],
		graphicsInput:['max','step'],
		ueditor:['height','value','model','toolbars','wordCount'],
		typeaheadtemplate:['selfData','order'],
		'organiza-select':['value','searchField','addHandler','localDataConfig','completeHandler'],
		'input-select':['textField','valueField','url','method','data'],
		'person-select':['textField','valueField','pyCode','wbCode','parentId','url','method','dataSrc','data','localDataConfig'],
		colorpickerinput:['value'],
		expression:['expressionField1','urlType','primaryKey','displayField'],
		'uploadSingle':['textField','valueField','supportFormat','isAllowFiles','dataSrc'],
		'uploadImage':['textField','valueField'],
		daterangeRadio:['rangeType'],
		tableForm:['isMulitSelect','isSingleSelect','isPage','dataFormat','idField','columnConfig'],
		text:['value'],
		switch:['value'],
	}
	var config = {};
	var errorData = [];
	var container = {
		// 预览表单配置
		formJson:{
			id:  		'',
			size: 		"standard",
			format: 	"standard",
			fillbg: 	true, 
		},
		// 返回编辑面板对象
		returnEditorObj:function(){
			var baseConfig = config.formatConfig;
			var dialogClass = '';
			var maskHtml = '';
			var columnClass = 'col-xs-'+baseConfig.column;
			if(baseConfig.type == 'dialog'){
				// 弹框设置的class 和 特殊HTML
				dialogClass = 'component-editor-modal fadeInDown animated';
				columnClass = '';
				// maskHtml = '<div class="fadeIn animated" style="position: fixed;top: 0;right: 0;bottom: 0;left: 0;background: rgba(0, 0, 0, 0.5);z-index: 1048;"></div>';
			}
			return $('<div  class="'+columnClass+'" id="'+this.containerId+'">'
						+'<div class="component-editor '+dialogClass+'">'
							+'<div class="component-editor-header">'
								+'<h4 class="component-editor-title">组件编辑器</h4>'
								+'<ul class="component-editor-tab-nav" id="'+this.tabsId+'"></ul>'
							+'</div>'
							+'<div class="component-editor-body" id="'+this.planeId+'">'
							+'</div>'
							+'<div class="component-editor-footer" id="'+this.btnsId+'">'
							+'</div>'
						+'</div>'
						+maskHtml
					+'</div>');
		},
		// 返回footer 并 绑定button事件
		returnFooterObj:function(){
			var $footer = $('<div class="btn-group">'
								+'<button class="btn btn-info">'
									+'<i class="fa fa-save"></i>'
									+'<span>确定</span>'
								+'</button>'
								+'<button class="btn btn-info">'
									+'<i class="fa fa-eye"></i>'
									+'<span>预览</span>'
								+'</button>'
								+'<button class="btn btn-info">'
									+'<i class="fa fa-close"></i>'
									+'<span>关闭</span>'
								+'</button>'
							+'</div>');
			this.footerOnClick($footer);
			return $footer;
		},
		// footer 中 点击事件
		footerOnClick:function($footer){
			$footer.find('button').eq(0).on('click',function(){
				container.saveData();
				config.saveJson = config.data;
				var isTrue = validationSaveJson(config.saveJson);
				if(isTrue){
					if(typeof(config.confirmHandler) == 'function'){
						config.saveJson.editBtnName = 'edit';
						config.confirmHandler(config.saveJson);
					}
				}else{
					nsAlert('检查是否存在未配置项','error');
					return false;
				}
			});
			$footer.find('button').eq(1).on('click',function(){
				if($('#'+container.containerId).find('#'+container.previewId).length>0){
					$('#'+container.containerId).find('#'+container.previewId).remove();
				}else{
					var formatData = getFormatData(config.data);
					container.preview(formatData);
				}
			});
			$footer.find('button').eq(2).on('click',function(){
				// container.closeFrame();
				function closeFun(){
					$('#'+container.containerId).remove();
					if(typeof(config.hideHandler) == 'function'){
						if(config.saveJson){
							config.hideHandler(config.saveJson);
						}else{
							config.hideHandler(false);
						}
					}
				}
				var baseConfig = config.formatConfig;

				if(baseConfig.type == 'dialog'){
					$('.component-editor-modal').removeClass('fadeInDown').addClass('fadeOutUp');
					$('.component-editor-modal').siblings('.fadeIn').removeClass('fadeIn').addClass('fadeOut');
					$('.component-editor-modal').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', closeFun);
					container.endInitStyle();
				}else{
					closeFun();
				}
				// $('#'+container.containerId).remove();
				// if(typeof(config.hideHandler) == 'function'){
				// 	if(config.saveJson[config.data.chineseName]){
				// 		config.hideHandler(config.saveJson[config.data.chineseName]);
				// 	}else{
				// 		config.hideHandler(false);
				// 	}
				// }
			});
		},
		closeFrame:function(){
			function closeFun(){
				$('#'+container.containerId).remove();
				/*if(typeof(config.hideHandler) == 'function'){
					if(config.saveJson){
						config.hideHandler(config.saveJson);
					}else{
						config.hideHandler(false);
					}
				}*/
			}
			var baseConfig = config.formatConfig;

			if(baseConfig.type == 'dialog'){
				$('.component-editor-modal').removeClass('fadeInDown').addClass('fadeOutUp');
				$('.component-editor-modal').siblings('.fadeIn').removeClass('fadeIn').addClass('fadeOut');
				$('.component-editor-modal').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', closeFun);
				container.endInitStyle();
			}else{
				closeFun();
			}
		},
		// 返回 预览的jQuery对象
		returnPreviewObj:function(displayType){
			var containerPreview = '<div class="preview" id="'+this.previewId+'">';
			switch(displayType){
				case 'form':
					containerPreview += '<div id="'+this.previewId+'-form"></div>'
					break;
				case 'all':
					containerPreview += '<div id="'+this.previewId+'-form"></div>'
										+'<div class="table-responsive">'
											+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="'+this.previewId+'-table">'
											+'</table>'
										+'</div>'
					break;
				case 'table':
					containerPreview += '<div class="table-responsive">'
											+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="'+this.previewId+'-table">'
											+'</table>'
										+'</div>'
					break;
			}
			containerPreview += '</div>';
			return $(containerPreview)
		},
		// 预览
		preview:function(_saveData){
			var $preview = this.returnPreviewObj(_saveData.displayType);
			$('#'+this.planeId).append($preview);
			var saveData = $.extend(true,{},_saveData);
			function formatFormUrlInPreview(parAarr){
				for(var index=0;index<parAarr.length;index++){
					if(saveData.form[parAarr[index]]){
						if(saveData.form[parAarr[index]].url){
							saveData.form[parAarr[index]].url = getRootPath() + saveData.form[parAarr[index]].url;
						}
					}
				}
			}
			if(saveData.form){
				if(saveData.form.url){
					saveData.form.url = getRootPath() + saveData.form.url;
				}
				var attrUrlArr = ['selectConfig','saveAjax','personAjax','groupAjax'];
				formatFormUrlInPreview(attrUrlArr); // 格式化url
			}
			switch(saveData.displayType){
				case 'form':
					var formJson = this.formJson;
					formJson.id = this.previewId+'-form';
					formJson.form = [saveData.form];
					formPlane.formInit(formJson);
					break;
				case 'all':
					var formJson = this.formJson;
					formJson.id = this.previewId+'-form'
					formJson.form = [saveData.form]
					formPlane.formInit(formJson);
					this.previewTable(saveData);
					break;
				case 'table':
					this.previewTable(saveData);
					break;
			}
		},
		// 清除预览
		clearPreview:function(){
			if($('#'+this.previewId).length>0){
				$('#'+this.previewId).remove();					// 移除预览
			}
		},
		// 预览表格配置
		previewTable:function(saveData){
			// var dataSource = getDefaultTableData(saveData.table);
			var dataSourceObj = {};
			dataSourceObj[saveData.table.field] = saveData.table.title;
			var listDataDataConfig = {
				tableID:				this.previewId+'-table',
				dataSource: 			[dataSourceObj],
				isSearch: 				false,
			}
			var listDataConfig = [saveData.table]
			var listDataUiConfig = {
				searchTitle: 		"查询",
				searchPlaceholder: 	"textField",
			}
			baseDataTable.init(listDataDataConfig, listDataConfig, listDataUiConfig);
		},
		// tabs 显示列表及绑定的编辑内容容器（基本编辑，changeHandlerData,列表数据，其他，显示类型）
		tabs:[
			{
				id:'base',
				name:'基本配置',
				container:function(){
					return $('<div id="'+container.basePlaneId+'"></div>')
				}
			},{
				id:'listData',
				name:'列表数据',
				container:function(){
					return $('<div id="'+container.listDataPlaneId+'"></div>')
				}
			},{
				id:'changeHandlerData',
				name:'关联操作',
				container:function(){
					return $('<div id="'+container.changeHandlerDataPlaneId+'"></div>')
				}
			},{
				id:'showType',
				name:'显示形式',
				container:function(){
					return $('<div id="'+container.showTypePlaneId+'"></div>')
				}
			},{
				id:'other',
				name:'其他',
				container:function(){
					return $('<div id="'+container.otherPlaneId+'"></div>')
				}
			}
		],
		// 返回 tabs 的jQuery对象
		returnTabsObj:function(){
			var tabsListHtml = '';
			for(index=0;index<this.tabs.length;index++){
				if(config.system[this.tabs[index].id]){
					tabsListHtml += '<li class="component-editor-tab-nav-item" id="'+this.tabsId+'-'+this.tabs[index].id+'">'
									+'<a href="javascript:void(0)">'+this.tabs[index].name+'</a>'
								+'</li>';
				}
			}
			var $tabsListHtml = $(tabsListHtml);
			$tabsListHtml.eq(0).children('a').addClass('current');
			this.tabsOnClick($tabsListHtml);
			return $tabsListHtml;
		},
		// 刷新编辑内容面板
		refreshEditorPlane:function(id){
			var idArr = id.split('-');
			var tabName = idArr[idArr.length-1];
			for(index=0;index<this.tabs.length;index++){
				if(this.tabs[index].id == tabName){
					this.clearPreview();// 移除预览
					$('#'+this.contentName).remove();								// 移除正在显示的 编辑内容
					this.contentName = this.tabs[index].container().attr('id');		// 修改contentName，当前编辑内容 id
					this.$container = this.tabs[index].container();					// 选择当前编辑内容的容器
					$('#'+this.planeId).append(this.$container);				// 插入当前编辑容器
					this.visibleEditorPlaneByType(tabName);							// 插入当前编辑容器面板
					break;
				}
			}
		},
		// 根据（base，changeHandlerData，showType，other，listData）初始化编辑面板内容
		visibleEditorPlaneByType:function(tabName){
			switch(tabName){
				case 'base':
					basePlane.init(this.basePlaneId);
					break;
				case 'listData':
					switch(config.data.type){
						case 'typeaheadtemplate':
						case 'organiza-select':
						case 'person-select':
						case 'tableForm':
							config.isOnlyAjax = true;
							config.data.isUseAjax = true;
							break;
						default:
							config.isOnlyAjax = false;
							break;
					}
					listDataPlane.init(this.listDataPlaneId);
					break;
				case 'changeHandlerData':
					changeHandlerDataPlane.init(this.changeHandlerDataPlaneId);
					break;
				case 'showType':
					showTypePlane.init(this.showTypePlaneId);
					break;
				case 'other':
					otherPlane.init(this.otherPlaneId);
					break;
			}
		},
		// 绑定 tabs 点击事件
		tabsOnClick:function($tabsListHtml){
			$tabsListHtml.on('click',function(){
				var id = $(this).attr('id');
				lightTab(id); 							// 点亮点击菜单
				container.saveData(); 					// 保存当前编辑面板内容
				container.refreshEditorPlane(id);		// 根据 点亮菜单id 刷新 编辑内容面板
			})
		},
		// 保存 当前编辑面板内容 数据
		saveData:function(){
			var contentNameArr = this.contentName.split('-');
			var conName = contentNameArr[contentNameArr.length-1]; // 获得保存类型
			switch(conName){
				case 'base':
					this.saveBaseData();
					break;
				case 'listData':
					this.saveListData();
					break;
				case 'showType':
					this.saveShowTypeData();
					break;
				case 'other':
					this.saveOtherData();
					break;
			}
		},
		// 保存 基本数据
		saveBaseData:function(){
			var formData = nsForm.getFormJSON(this.contentName);
			for(typeName in formData){
				config.data[typeName] = formData[typeName];
			}
		},
		// 保存 列表数据
		saveListData:function(){
			var listSaveCon = listDataPlane.contentName;
			var listSaveConArr = listSaveCon.split('-');
			var listSaveName = listSaveConArr[listSaveConArr.length-1];
			switch(listSaveName){
				case 'subdata':
					config.data.isUseAjax = false;
					var tableData = baseDataTable.allTableData(subdataPlane.tableId,'valueField');
					config.data.subdata = tableData;
					break;
				case 'ajax':
					config.data.isUseAjax = true;
					var formData = nsForm.getFormJSON(ajaxPlane.formJson.id);
					config.data.ajax = formData;
					break;
			}
		},
		// 保存 显示类型 数据
		saveShowTypeData:function(){
			var showTypeSaveCon = showTypePlane.contentName;
			var showTypeSaveConArr = showTypeSaveCon.split('-');
			var showTypeSaveName = showTypeSaveConArr[showTypeSaveConArr.length-1];
			var saveFormData = nsForm.getFormJSON(showTypeSaveCon);
			config.data[showTypeSaveName] = saveFormData;
			config.data.displayType = showTypeSaveName;
		},
		// 保存 其他 数据
		saveOtherData:function(){
			var otherFormData = nsForm.getFormJSON(this.otherPlaneId);
			config.data.other = otherFormData;
		},
		// 刷新tabs 和 编辑面板
		refreshTabsAndEditPlane:function(){
			$('#'+this.tabsId).children().remove();
			$('#'+this.planeId).children().remove();
			this.$tabsListHtml = this.returnTabsObj();								// 获得 tabs 的 jQuery 对象
			$('#'+this.tabsId).append(this.$tabsListHtml);							// 插入编辑器tabs
			this.$container = this.tabs[0].container();								// 默认显示基本编辑面板
			$('#'+this.planeId).append(this.$container);						// 插入基本编辑面板容器
			basePlane.init(this.basePlaneId);														// 初始化基本编辑面板
		},
		// 结束样式初始化
		endInitStyle:function(){
			$('.component-editor-modal').css({
			    'animation-duration': 0.3+'s',    	//动画持续时间
			    'animation-delay': 0+'s',    		//动画延迟时间
			    'animation-iteration-count': 1,    	//动画执行次数
			    'animation-timing-function': 'ease-in',
			});
			$('.component-editor-modal').siblings().css({
			    'animation-duration': 0.3+'s',    	//动画持续时间
			    'animation-delay': 0+'s',    		//动画延迟时间
			    'animation-iteration-count': 1,    	//动画执行次数
			    'animation-timing-function': 'ease-in',
			});
		},
		// 初始化样式
		initStyle:function(){
			$('.component-editor-modal').css({
			    'animation-duration': 0.3+'s',    	//动画持续时间
			    'animation-delay': 0+'s',    		//动画延迟时间
			    'animation-iteration-count': 1,    	//动画执行次数
			    'animation-timing-function': 'ease-out',
			});
			$('.component-editor-modal').siblings().css({
			    'animation-duration': 0.3+'s',    	//动画持续时间
			    'animation-delay': 0+'s',    		//动画延迟时间
			    'animation-iteration-count': 1,   	//动画执行次数
			    'animation-timing-function': 'ease-out',
			});
		},
		// 初始化 编辑器
		init:function(){
			this.containerId = config.formatConfig.id; //面板id
			this.tabsId = config.formatConfig.id + '-tabs'; //tabs的id
			this.btnsId = config.formatConfig.id + '-btns'; //btns的id
			this.planeId = config.formatConfig.id + '-plane'; //配置面板的id
			this.previewId = config.formatConfig.id + '-plane-preview'; //预览的id
			this.basePlaneId = config.formatConfig.id + '-plane-base'; //基本配置的id
			this.listDataPlaneId = config.formatConfig.id + '-plane-listData'; //列表数据的id
			this.changeHandlerDataPlaneId = config.formatConfig.id + '-plane-changeHandlerData'; //关联操作的id
			this.showTypePlaneId = config.formatConfig.id + '-plane-showType'; //显示形式的id
			this.otherPlaneId = config.formatConfig.id + '-plane-other'; //其他的id

			this.contentName = this.basePlaneId; //正在配置的面板 默认基本配置

			this.$editor = this.returnEditorObj();									// 获得 编辑器 整体面板 的 jQuery 对象
			this.$tabsListHtml = this.returnTabsObj();								// 获得 tabs 的 jQuery 对象
			this.$footer = this.returnFooterObj();									// 获得 footer 的 jQuery 对象
			this.$container = this.tabs[0].container();								// 默认显示基本编辑面板
			this.show();
		},
		show:function(){
			$('#'+this.containerId).remove(); 									// 移除已存在的编辑器
			config.$container.append(this.$editor);								// 插入编辑器整体面板
			$('#'+this.tabsId).append(this.$tabsListHtml);						// 插入编辑器tabs
			$('#'+this.btnsId).append(this.$footer);							// 插入编辑器footer
			$('#'+this.planeId).append(this.$container);						// 插入基本编辑面板容器
			basePlane.init(this.basePlaneId);									// 初始化基本编辑面板
			if(config.formatConfig.type == 'dialog'){
				this.initStyle();
			}
		}
	}
	// 基本编辑面板
	var basePlane = {
		formJson:{
			id:  		'',
			size: 		"standard",
			format: 	"standard",
			fillbg: 	true,
		},
		// 基本编辑面板 表单数组
		getFormArr:function(){
			// 根据variableType判断type的下拉框数据
			var typeSelectListName = config.data.variableType;
			var typeSelectList = [];
			for(index=0;index<variableType[typeSelectListName].length;index++){
				var text = variableType[typeSelectListName][index];
				if(help[variableType[typeSelectListName][index]]){
					text += ' '+help[variableType[typeSelectListName][index]];
				}
				typeSelectList.push({
					value:variableType[typeSelectListName][index],
					text:text,
				});
			}
			var baseFormArr = [];
			switch(typeSelectListName){
				case 'other':
					baseFormArr = [
						{
							id: 					'type',
							label: 					'type',
							type: 					'select',
							column: 				12,
							subdata: 				typeSelectList,
							changeHandler: 			function(id){
								if(id!=''){
									config.data.type = id;
									config.system = componentTypeData[config.data.type];
									initData(config.data,id);
									container.refreshTabsAndEditPlane();
								}
							}
						},{
							id: 					'fieldIndex',
							label: 					'字段',
							type: 					'select',
							column: 				12,
							textField: 				'chineseName',
							valueField: 			'gid',
							rules: 					'required',
							subdata: 				config.allDataArray,
						}
					]
					this.baseConfigData = {
						type:config.data.type,
						fieldIndex:config.data.fieldIndex,
					};
					break;
				default:
					baseFormArr = [
						{
							id: 					'englishName',
							label: 					'englishName',	
							column: 				12,
							readonly: 				true,
							type: 					'text',
						},{
							id: 					'chineseName',
							label: 					'chineseName',
							column: 				12,
							readonly: 				true,
							type: 					'text',
						},{
							id: 					'type',
							label: 					'type',
							type: 					'select',
							column: 				12,
							subdata: 				typeSelectList,
							changeHandler: 			function(id){
								if(id!=''){
									config.data.type = id;
									config.system = componentTypeData[config.data.type];
									initData(config.data,id);
									container.refreshTabsAndEditPlane();
								}
							}
						}
					];
					// 基本配置页面的数据
					this.baseConfigData = {
						englishName:config.data.englishName,
						chineseName:config.data.chineseName,
						type:config.data.type,
					};
					break;
			}
			// 根据type值判断是否存在rules 存在 设置下拉数组
			if(config.system.rules){
				baseFormArr.push({
					id: 		'rules',
					label: 		'rules',
					type: 		'select2',
					column: 	12,	
					subdata: 	config.system.rules,
					multiple: 	true,
				})
				this.baseConfigData.rules = config.data.rules;
			}
			if(config.system.label){
				baseFormArr.push($.extend(true,{},getTypeData['label']));
				this.baseConfigData.label = config.data.label;
			}
			if(config.system.readonly){
				baseFormArr.push($.extend(true,{},getTypeData['readonly']));
				this.baseConfigData.readonly = config.data.readonly;
			}
			// 设置默认值
			setDefaultData(this.baseConfigData,baseFormArr);
			return baseFormArr;
		},
		// 基本编辑面板初始化
		init:function(containerId){
			this.formJson.id = containerId;
			this.show();
		},
		show:function(){
			// 设置表单
			var formJson = this.formJson;
			formJson.form = this.getFormArr();
			formPlane.formInit(formJson);
		}
	}
	// 列表数据编辑面板
	var listDataPlane = {
		// 返回 编辑内容的容器
		returnContentObj:function(){
			return $('<div id="'+this.contentId+'"></div>')
		},
		// 列表数据 tabs 显示列表及绑定的编辑内容容器
		tabs:[
			{
				name:'subdata',
				container:function(){
					return $('<div id="'+listDataPlane.subdataContentId+'"></div>')
				}
			},{
				name:'ajax',
				container:function(){
					return $('<div id="'+listDataPlane.ajaxContentId+'"></div>')
				}
			}
		],
		// 返回 tabs 的 jQuery 对象
		returnTabsObj:function(){
			var $tabsListHtml = $('<ul class="component-editor-tab-subnav">'
									+'<li class="component-editor-tab-subnav-item" id="'+this.subdataTab+'">'
										+'<a href="javascript:void(0)">subdata</a>'
									+'</li>'
									+'<li class="component-editor-tab-subnav-item" id="'+this.ajaxTab+'">'
										+'<a href="javascript:void(0)">ajax</a>'
									+'</li>'
								+'</ul>');
			if(config.data.isUseAjax){
				$tabsListHtml.children().eq(1).children().addClass("current")
			}else{
				$tabsListHtml.children().eq(0).children().addClass("current")
			}
			this.tabsOnClick($tabsListHtml);
			return $tabsListHtml;
		},
		// 刷新 编辑内容 （subdata/ajax）
		refreshListDataPlane:function(id){
			var idArr = id.split('-');
			var tabName = idArr[idArr.length-1];												// 显示类型
			for(index=0;index<this.tabs.length;index++){
				if(this.tabs[index].name == tabName){
					container.clearPreview();// 移除预览
					$('#'+this.contentId).children().remove(); 		// 清空容器
					this.$container = this.tabs[index].container();								// 获得要显示的面板容器
					$('#'+this.contentId).append(this.$container);		// 插入容器
					this.visibleEditorPlaneByType(tabName);										// 插入当前编辑容器面板
					this.contentName = this.$container.attr('id');									// 修改contentName，当前编辑内容 id
					break;
				}
			}
		},
		// 绑定 tabs 点击事件
		tabsOnClick:function($tabsListHtml){
			$tabsListHtml.children().on('click',function(){
				var id = $(this).attr('id');
				lightTab(id); 								// 点亮点击菜单
				listDataPlane.saveData(); 					// 保存当前编辑面板内容
				listDataPlane.refreshListDataPlane(id);		// 根据 点亮菜单id 刷新 编辑内容面板
			})
		},
		// 保存 当前编辑面板内容 数据
		saveData:function(){
			var listSaveCon = this.contentName;
			var listSaveConArr = listSaveCon.split('-');
			var listSaveName = listSaveConArr[listSaveConArr.length-1];
			switch(listSaveName){
				case 'subdata':
					config.data.isUseAjax = false;
					var tableData = baseDataTable.allTableData(subdataPlane.tableId,'valueField');
					config.data.subdata = tableData;
					break;
				case 'ajax':
					config.data.isUseAjax = true;
					var formData = nsForm.getFormJSON(this.ajaxContentId);
					config.data.ajax = formData;
					break;
			}
		},
		// 根据（base，changeHandlerData，showType，other，listData）初始化编辑面板内容
		visibleEditorPlaneByType:function(tabName){
			switch(tabName){
				case 'subdata':
					subdataPlane.init(this.subdataContentId);
					break;
				case 'ajax':
					ajaxPlane.init(this.ajaxContentId);
					break;
			}
		},
		// 初始化 列表数据 面板0
		init:function(containerId){
			this.subdataTab = containerId + '-subdata';
			this.ajaxTab = containerId + '-ajax';
			this.contentId = containerId + '-content';
			this.subdataContentId = containerId + '-content-subdata';
			this.ajaxContentId = containerId + '-content-ajax';
			this.$tabs = this.returnTabsObj(); 												// 获得 tabs 的jQuery对象
			this.$content = this.returnContentObj();											// 获取 编辑内容容器
			this.show(containerId);

		},
		show:function(containerId){
			$('#'+containerId).append(this.$tabs);							// 插入 tabs
			$('#'+containerId).append(this.$content);						// 插入编辑内容容器
			// isUseAjax 是否是ajax 默认否
			if(config.data.isUseAjax){
				// ajax 面板 初始化
				this.$container = this.tabs[1].container();
				$('#'+this.contentId).append(this.$container);
				ajaxPlane.init(this.ajaxContentId);
				this.contentName = this.ajaxContentId;
			}else{
				// subdata 面板 初始化
				this.$container = this.tabs[0].container();
				$('#'+this.contentId).append(this.$container);
				subdataPlane.init(this.subdataContentId);
				this.contentName = this.subdataContentId;
			}
			// 仅显示ajax 禁用 subdata
			if(config.isOnlyAjax){
				$('#'+this.subdataTab).css("pointer-events","none");
			}
		}
	}
	// 列表数据 的 subdata 面板
	var subdataPlane = {
		// 表格容器
		content:function(){
			return $('<div class="table-responsive">'
					+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="'+this.tableId+'">'
					+'</table>'
				+'</div>')
		},
		// 返回表格配置参数
		getSubdataTable:function(){
			if($.isArray(config.data.subdata)){
				var dataSource = config.data.subdata;
			}else{
				var dataSource = [];
			}
			var listDataDataConfig = {
				tableID:				subdataPlane.tableId,
				dataSource: 			dataSource
			}
			var listDataConfig = [
				{
					field:'textField',
					title:'textField'
				},{
					field:'valueField',
					title:'valueField'
				},{
					field:'isDisabled',
					title:'isDisabled'
				},{
					field:'selected',
					title:'selected'
				},{
					field:'handler',
					title:'操作',
					formatHandler:{
						type: 'button',
						data: [
							{
								"编辑":function(rowData){
									subdataPlane.editSelect(rowData);
								}
							},{
								"删除":function(rowData){
									nsConfirm("确认要删除吗？",function(isdelete){
										if(isdelete){
											var trObj = rowData.obj.closest('tr');
											baseDataTable.delRowData(subdataPlane.tableId,trObj);
										}
									},"success");
									
								}
							}
						]
					}
				}
			]
			var listDataUiConfig = {
				searchTitle: 		"查询",					//搜索框前面的文字，默认为检索
				searchPlaceholder: 	"textField",			//搜索框提示文字，默认为可搜索的列名
			}
			var listDataBtnConfig = {
				selfBtn:[
					{
						text:'新增',
						handler:function(){
							subdataPlane.addSelect();
						}
					}
				]
			}
			return {
				listDataDataConfig:listDataDataConfig,
				listDataConfig:listDataConfig,
				listDataUiConfig:listDataUiConfig,
				listDataBtnConfig:listDataBtnConfig,
			}
		},
		// 编辑表单数组
		editArr:[
			{
				id: 	'textField',
				label: 	'textField',
				type: 	'text',
				rules: 	'required',
			},{
				id: 	'valueField',
				label: 	'valueField',
				type: 	'text',
				rules: 	'required',
			},{
				id: 	'isDisabled',
				label: 	'isDisabled',
				type: 	'radio',
				value: 	'false',
				subdata:[
					{
						text: 	'true',
						value: 	'true'
					},{
						text: 	'false',
						value: 	'false'
					}
				],
			},{
				id: 	'selected',
				label: 	'selected',
				type: 	'radio',
				value: 	'false',
				subdata:[
					{
						text: 	'true',
						value: 	'true'
					},{
						text: 	'false',
						value: 	'false'
					}
				],
			}
		],
		// 新增下了框
		addSelect:function(){
			var dialogJson = $.extend(true,{},this.dialogObject);
			dialogJson.form = $.extend(true,[],this.editArr);
			dialogJson.btns[0].handler = function(){
				var dialogData = nsForm.getFormJSON("dialogPlane");
				if(dialogData){
					var tableData = baseDataTable.allTableData(subdataPlane.tableId,'valueField');
					var isHave = false;
					for(var index=0;index<tableData.length;index++){
						if(tableData[index].valueField == dialogData.valueField){
							isHave = true;
							break;
						}
					}
					if(isHave){
						nsAlert('valueField重复');
					}else{
						var addData = [dialogData];
						baseDataTable.addTableRowData(subdataPlane.tableId,addData);
						if(config.isMoreDialog){
							nsdialogMore.hide();
						}else{
							nsdialog.hide();
						}
						nsalert('成功');
					}
				}
			}
			dialogJson.isMoreDialog = config.isMoreDialog;
			nsdialog.initShow(dialogJson);
		},
		// 修改下拉框
		editSelect:function(rowDataJson){
			var dialogJson = $.extend(true,{},this.dialogObject);
			dialogJson.form = $.extend(true,[],this.editArr);
			var rowData = rowDataJson.rowData;
			for(index=0;index<dialogJson.form.length;index++){
				if(rowData[dialogJson.form[index].id]){
					dialogJson.form[index].value = rowData[dialogJson.form[index].id];
				}
			}
			dialogJson.btns[0].handler = function(){
				var dialogData = nsForm.getFormJSON("dialogPlane");
				if(dialogData){
					var origalTableData = $.extend(true,{},rowDataJson);
					var rowIndexNumber = origalTableData.rowIndexNumber;
					var tableData = baseDataTable.allTableData(subdataPlane.tableId,'valueField');
					var isHave = false;
					for(var index=0;index<tableData.length;index++){
						if(index!=rowIndexNumber && tableData[index].valueField == dialogData.valueField){
							isHave = true;
							break;
						}
					}
					if(isHave){
						nsAlert('valueField重复');
					}else{
						var origalData = baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data();
						for(var key in origalData){
							if(dialogData[key]){
								if(dialogData[key] != origalData[key]){
									origalData[key] = dialogData[key];
								}
							}
						}
						baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data(origalData).draw(false);
						if(config.isMoreDialog){
							nsdialogMore.hide();
						}else{
							nsdialog.hide();
						}
						nsalert('成功');
					}
				}
			}
			dialogJson.isMoreDialog = config.isMoreDialog;
			nsdialog.initShow(dialogJson);
		},
		// 弹框配置
		dialogObject:{
			id: 	"dialogPlane",
			title: 	"编辑",
			size: 	"m",
			btns:[
				{
					text: 		'确认',
				}
			]
		},
		// subdata 面板初始化
		init:function(containerId){
			this.tableId = containerId + '-table';
			this.subdataTable = this.getSubdataTable();
			this.$content = this.content();
			this.show(containerId);
		},
		show:function(containerId){
			$('#'+containerId).append(this.$content);
			baseDataTable.init(this.subdataTable.listDataDataConfig, this.subdataTable.listDataConfig, this.subdataTable.listDataUiConfig, this.subdataTable.listDataBtnConfig);
		}
	}
	// 列表数据 的 ajax 面板
	var ajaxPlane = {
		formJson:{
			id:  		'',
			size: 		"standard",
			format: 	"standard",
			fillbg: 	true, 
		},
		// 返回 ajax 配置面板 表单数组 并赋默认值
		getAjaxFormArr:function(){
			var ajaxArr = formConfig.ajax;
			var ajaxFormArr = [];
			for(index=0;index<ajaxArr.length;index++){
				ajaxFormArr.push($.extend(true,{},getTypeData[ajaxArr[index]]));
			}
			if(config.data.ajax){
				for(index=0;index<ajaxFormArr.length;index++){
					if(config.data.ajax[ajaxFormArr[index].id]){
						ajaxFormArr[index].value = config.data.ajax[ajaxFormArr[index].id];
					}
				}
			}
			return ajaxFormArr;
		},
		// 初始化 ajax 配置面板
		init:function(containerId){
			this.formJson.id = containerId;
			this.show();
		},
		show:function(){
			var formJson = this.formJson;
			formJson.form = this.getAjaxFormArr();
			formPlane.formInit(formJson);
		}
	}
	// changeHandlerData 编辑面板
	var changeHandlerDataPlane = {
		// 列表数据 tabs 显示列表及绑定的编辑内容容器
		tabs:[
			{
				name:'readonly',
				container:function(){
				  return changeHandlerDataPlane.changeHandlerTable('readonly');
				}
			},{
				name:'hidden',
				container:function(){
				  return changeHandlerDataPlane.changeHandlerTable('hidden');
				}
			},{
				name:'disabled',
				container:function(){
				  return changeHandlerDataPlane.changeHandlerTable('disabled');
				}
			},{
				name:'value',
				container:function(){
				  return changeHandlerDataPlane.changeHandlerTable('value');
				}
			},
		],
		// 当前位置 配置内容是(readonly,hidden,value,disabled)
		addPosition:'readonly',
		otherClassName:'nsRestoreDefaultObj',
		// 返回 tabs 的 jQuery 对象
		returnTabsObj:function(containerId){
			var tabsListHtml = '<ul class="component-editor-tab-subnav">';
			for(index=0;index<this.tabs.length;index++){
			var current = '';
			if(this.addPosition == this.tabs[index].name){
			  current = 'current';
			}
			tabsListHtml += '<li class="component-editor-tab-subnav-item" id="'+containerId+'-'+this.tabs[index].name+'">'
			          +'<a href="javascript:void(0)" class="'+current+'">'+this.tabs[index].name+'</a>'
			        +'</li>'
			}
			tabsListHtml += '</ul>';
			var $tabsListHtml = $(tabsListHtml);
			this.tabsOnClick($tabsListHtml);
			return $tabsListHtml;
		},
		// tabs 点击事件
		tabsOnClick:function($tabsListHtml){
			$tabsListHtml.children().on('click',function(){
				var id = $(this).attr('id');
				lightTab(id);
				changeHandlerDataPlane.refreshTable(id);
			});
		},
		// 根据id：readonly，hidden，disabled，value刷新表格面板
		refreshTable:function(id){
			var idArr = id.split('-');
			var tabName = idArr[idArr.length-1];
			for(index=0;index<this.tabs.length;index++){
				if(this.tabs[index].name == tabName){
					container.clearPreview();// 移除预览
					$('#'+this.contentId).children().remove(); 	// 移除表格
					this.$container = this.tabs[index].container();  								// 获得表格 的 jQuery对象
					$('#'+this.contentId).append(this.$container); 	// 插入表格
					this.addPosition = tabName; 													// addPosition 赋值 为 当前 位置
					break;
				}
			}
		},
		// 返回表格 容器
		tableContainer:function(){
			return $('<div class="component-editor-tab-subcontent" id="'+this.contentId+'"></div>');
		},
		// 返回表格
		changeHandlerTable:function(type){
			var $tableContainer = $('<table class="table table-bordered changehandlertable" id="'+this.contentId+'-'+type+'">'
										+'<thead>'
											+'<tr>'
												+'<th>值</th>'
												+'<th>设置</th>'
												+'<th class="row-control">操作</th>'
											+'</tr>'
										+'</thead>'
										+'<tbody>'  
										+'</tbody>'
									+'</table>');
			// 获得显示数据列表
			var changeHandlerData = config.data.changeHandlerData;
			var lineHtml = '';
			if($.isEmptyObject(changeHandlerData[type])){
				lineHtml = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty">没有数据</td></tr>'
			}else{
				for(var className in changeHandlerData[type]){
					var showClassName = className;
					if(className == changeHandlerDataPlane.otherClassName){
						showClassName = '其它';
					}
					var onelineHtml = '';
					if($.isEmptyObject(changeHandlerData[type][className])){
						onelineHtml = '<tr>'
							+'<td idText="'+className+'">'+showClassName+'</td>'
							+'<td></td>'
							+'<td class="td-btn">'
								+'<button class="btn btn-white btn-icon"><i class="fa fa-edit"></i>'
								+'</button>'
								+'<button class="btn btn-warning btn-icon"><i class="fa fa-trash"></i>'
								+'</button>'
							+'</td>'
						+'</tr>'
				  	}else{
					    var conHtml = '';
						for(conName in changeHandlerData[type][className]){
							if(type == "value"){
								conHtml += '<span>'+conName+':'+changeHandlerData[type][className][conName]+'</span>';
							}else{
								if(changeHandlerData[type][className][conName]){
									conHtml += '<span idText="'+conName+'">'+conName+'</span>';
								}
							}
						}
						onelineHtml = '<tr>'
										+'<td idText="'+className+'">'+showClassName+'</td>'
										+'<td>'+conHtml+'</td>'
										+'<td class="td-btn">'
											+'<button class="btn btn-white btn-icon"><i class="fa fa-edit"></i>'
											+'</button>'
											+'<button class="btn btn-warning btn-icon"><i class="fa fa-trash"></i>'
											+'</button>'
										+'</td>'
									+'</tr>'
					}
					lineHtml += onelineHtml;
				}
			}
			$tableContainer.find('tbody').append(lineHtml);
			this.tableBtnOnClick($tableContainer);
			return $tableContainer;
		},
		// 新增按钮容器
		addContainer:function(){
			return $('<div id="'+this.addBtnId+'"></div>');
		},
		// 新增按钮 数组
		addBtnArr:[
			{
				text:     '新增',
				handler:   function(){
					switch(changeHandlerDataPlane.addPosition){
						case 'readonly':
						case 'hidden':
						case 'disabled':
							changeHandlerDataPlane.addChangeHandlerData();
							break;
						case 'value':
							
							break;
					}
				}
			}
		],
		// 新增数组
		addArr:[
			{
				id:     'className',
				label:     '值',
				type:     'text',
				changeHandler:function(values){
					var editObj = {
						id:'className2',
						value:'',
					}
					if(values.length>0){
						editObj.hidden = true;
					}else{
						editObj.hidden = false;
					}
					nsForm.edit([editObj],'dialogPlane');
				},
			},{
				id:     'className2',
				label:     '其它',
				type:     'checkbox',
				textField:'name',
				valueField:'id',
				onlyshowone:true,
				displayClass:"switch",
				subdata: 	[
					{
						id:'nsRestoreDefaultObj',
						name:'',
					}
				],
				changeHandler:function(values){
					var editObj = {
						id:'className',
						value:'',
					}
					if(values==1){
						editObj.hidden = true;
					}else{
						editObj.hidden = false;
					}
					nsForm.edit([editObj],'dialogPlane');
				},
			},{
				id:     'typeName',
				label:     '选择',
				type:     'checkbox',
				textField:'name',
				valueField:'id',
			},
		],
		// 新增
		addChangeHandlerData:function(){
			var addArr = $.extend(true,[],this.addArr);
			addArr[2].subdata=config.changeHandlerDataSelect;
			var dialogObject = this.dialogObject;
			dialogObject.form = addArr;
			// dialogObject.btns[0].handler = this.addBtnfun;
			dialogObject.btns[0].handler = function(){
				changeHandlerDataPlane.addAndEditData('add');
			};
			dialogObject.isMoreDialog = config.isMoreDialog;
			nsdialog.initShow(dialogObject);
		},
		// 弹框配置
		dialogObject:{
			id: 	"dialogPlane",
			title: 	"新增",
			size: 	"m",
			btns:[
				{
					text: 		'确认',
				}
			]
		},
		// 验证新增修改是否合法
		addAndEditData:function(type,rowData){
			var dialogData = nsForm.getFormJSON("dialogPlane");
			if(dialogData){
				var className = '';
				if(dialogData.className.length>0){
					className = dialogData.className;
				}else{
					if(dialogData.className2==1){
						className = changeHandlerDataPlane.otherClassName;
					}
				}
				if(className == ''){
					nsAlert('没有填写：值/其它','error');
					return false;
				}
				// 恢复默认状态可以选择typeName为空其他不可以
				if(className != changeHandlerDataPlane.otherClassName){
					if(dialogData.typeName==''){
						nsAlert('没有选择changHandler/选择字段','error');
						return false;
					}
				}
				if(type=='add'){
					if(typeof(config.data.changeHandlerData[changeHandlerDataPlane.addPosition][className])=='object'){
						nsAlert('值重复','error');
						return false;
					}
				}else{
					if(className!=rowData.className){
						if(typeof(config.data.changeHandlerData[changeHandlerDataPlane.addPosition][className])=='object'){
							nsAlert('值重复','error');
							return false;
						}else{
							delete config.data.changeHandlerData[changeHandlerDataPlane.addPosition][rowData.className];
						}
					}
				}
				config.data.changeHandlerData[changeHandlerDataPlane.addPosition][className] = {};
				var changeHandlerDataClassName = config.data.changeHandlerData[changeHandlerDataPlane.addPosition][className];
				for(index=0;index<dialogData.typeName.length;index++){
					changeHandlerDataClassName[dialogData.typeName[index]] = true;
				}
				var voAllFieldsIdObj = config.voAllFieldsIdObj;
				for(var fieldId in voAllFieldsIdObj){
					if(!changeHandlerDataClassName[fieldId]){
						changeHandlerDataClassName[fieldId] = false;
					}
				}
				changeHandlerDataPlane.refreshTable(changeHandlerDataPlane.addPosition);
				if(config.isMoreDialog){
					nsdialogMore.hide();
				}else{
					nsdialog.hide();
				}
			}
		},
		// 新增 方法
		addBtnfun:function(){
			var dialogData = nsForm.getFormJSON("dialogPlane");
			if(dialogData){
				if(typeof(config.data.changeHandlerData[changeHandlerDataPlane.addPosition][dialogData.className])=='object'){
					nsAlert('值重复','error');
					return false;
				}
				// 恢复默认状态可以选择typeName为空其他不可以
				if(dialogData.className != changeHandlerDataPlane.otherClassName){
					if(dialogData.typeName==''){
						nsAlert('没有选择changHandler/选择字段','error');
						return false;
					}
				}
				config.data.changeHandlerData[changeHandlerDataPlane.addPosition][dialogData.className] = {};
				var changeHandlerDataClassName = config.data.changeHandlerData[changeHandlerDataPlane.addPosition][dialogData.className];
				for(index=0;index<dialogData.typeName.length;index++){
					changeHandlerDataClassName[dialogData.typeName[index]] = true;
				}
				var voAllFieldsIdObj = config.voAllFieldsIdObj;
				for(var fieldId in voAllFieldsIdObj){
					if(!changeHandlerDataClassName[fieldId]){
						changeHandlerDataClassName[fieldId] = false;
					}
				}
				changeHandlerDataPlane.refreshTable(changeHandlerDataPlane.addPosition);
				if(config.isMoreDialog){
					nsdialogMore.hide();
				}else{
					nsdialog.hide();
				}
			}
		},
		// 修改 方法
		editBtnfun:function(rowData){
			var dialogData = nsForm.getFormJSON("dialogPlane");
			if(dialogData){
				if(dialogData.className!=rowData.className){
					if(typeof(config.data.changeHandlerData[changeHandlerDataPlane.addPosition][dialogData.className])=='object'){
						nsAlert('值重复','error');
						return false;
					}else{
						delete config.data.changeHandlerData[changeHandlerDataPlane.addPosition][rowData.className];
					}
				}
				// 恢复默认状态可以选择typeName为空其他不可以
				if(dialogData.className != changeHandlerDataPlane.otherClassName){
					if(dialogData.typeName==''){
						nsAlert('没有选择changHandler/选择字段','error');
						return false;
					}
				}
				config.data.changeHandlerData[changeHandlerDataPlane.addPosition][dialogData.className] = {};
				var changeHandlerDataClassName = config.data.changeHandlerData[changeHandlerDataPlane.addPosition][dialogData.className];
				for(index=0;index<dialogData.typeName.length;index++){
					changeHandlerDataClassName[dialogData.typeName[index]] = true;
				}
				var voAllFieldsIdObj = config.voAllFieldsIdObj;
				for(var fieldId in voAllFieldsIdObj){
					if(!changeHandlerDataClassName[fieldId]){
						changeHandlerDataClassName[fieldId] = false;
					}
				}
				changeHandlerDataPlane.refreshTable(changeHandlerDataPlane.addPosition);
				if(config.isMoreDialog){
					nsdialogMore.hide();
				}else{
					nsdialog.hide();
				}
			}
		},
		editChangeHandlerData:function(rowData){
			var addArr = $.extend(true,[],this.addArr);
			addArr[2].subdata=config.changeHandlerDataSelect;
			
			addArr[2].value = rowData.typeName;
			if(rowData.className == changeHandlerDataPlane.otherClassName){
				addArr[0].hidden = true;
				addArr[1].value = changeHandlerDataPlane.otherClassName;
			}else{
				addArr[0].value = rowData.className;
				addArr[1].hidden = true;
			}
			var dialogObject = this.dialogObject;
			dialogObject.form = addArr;
			dialogObject.btns[0].handler = function(){
				// changeHandlerDataPlane.editBtnfun(rowData);
				changeHandlerDataPlane.addAndEditData('edit',rowData);
			};
			dialogObject.isMoreDialog = config.isMoreDialog;
			nsdialog.initShow(dialogObject);
		},
		// table 表格的点击事件
		tableBtnOnClick:function($tableContainer){
			var $tbodyTr = $tableContainer.find("tbody").children("tr");
			for(var index=0;index<$tbodyTr.length;index++){
				$tbodyTr.eq(index).children("td").eq(2).children('button').on('click',function(){
					var $this = $(this);
					var $thisParent = $this.parents('tr').children();
					var $span = $thisParent.eq(1).children('span');
					var valueNameArr = [];
					if($span.length == 0){

					}else{
						for(var index=0;index<$span.length;index++){
							valueNameArr.push($span.eq(index).attr('idText'));
						}
					}

					var lineData = {
						className:$thisParent.eq(0).attr('idText'),
						typeName:valueNameArr
					}
					var $thisClassI = $this.children('i');
					if($thisClassI.hasClass('fa-edit')){
						changeHandlerDataPlane.editChangeHandlerData(lineData);
					}
					if($thisClassI.hasClass('fa-trash')){
						changeHandlerDataPlane.deleteChangeHandlerData(lineData);
					}
				})
			}
			// $tableContainer.find("tbody").children("tr")
		},
		// 
		selectIsTrueArr:[
			{
				id:'valueName',
				label:'显示状态',
				type:'select2',
				multiple:true,
				maximumItem:100,
				textField:'text',
				valueField:'value',
				subdata:[
					{
						text:'姓名',
						value:'11'
					}
				],
			}
		],
		valueIsTextArr:[],
		deleteChangeHandlerData:function(rowData){
			nsConfirm("确认要删除吗？",function(isdelete){
				if(isdelete){
					delete config.data.changeHandlerData[changeHandlerDataPlane.addPosition][rowData.className];
					changeHandlerDataPlane.refreshTable(changeHandlerDataPlane.addPosition);
				}
			},"success");
		},
		init:function(containerId){
			this.addBtnId = containerId + '-add';
			this.contentId = containerId + '-content';
			this.$tabs = this.returnTabsObj(containerId);																	// 获得 tabs 的 jQuery 对象
			this.$tableContainer = this.tableContainer();														// 获得 table 容器 的 jQuery 对象
			this.$changeHandlerTable = this.changeHandlerTable(this.addPosition);								// 获得表格jQuery对象
			this.$add = this.addContainer();																		// 新增容器
			this.show(containerId);
		},
		show:function(containerId){
			$('#'+containerId).append(this.$tabs);									// 插入tabs
			$('#'+containerId).append(this.$add);									// 插入新增容器
			this.$tableContainer.append(this.$changeHandlerTable);													// 把表格jQuery对象插入 表格容器 中
			$('#'+containerId).append(this.$tableContainer);							// 插入表格
			nsButton.initBtnsByContainerID(this.addBtnId,this.addBtnArr);	// 初始化新增按钮
		}
	}
	// 显示类型 编辑面板
	var showTypePlane = {
		formJson:{
			id:  		'',
			size: 		"standard",
			format: 	"standard",
			fillbg: 	true, 
		},
		// 返回 配置面板 容器
		returnContentObj:function(){
			return $('<div id="'+this.contentId+'"></div>')
		},
		// 列表数据 tabs 显示列表及绑定的编辑内容容器
		tabs:[
			{
				name:'all',
				container:function(){
					return $('<div id="'+showTypePlane.contentId+'-all"></div>');
				}
			},{
				name:'form',
				container:function(){
					return $('<div id="'+showTypePlane.contentId+'-form"></div>');
				}
			},{
				name:'table',
				container:function(){
					return $('<div id="'+showTypePlane.contentId+'-table"></div>');
				}
			}
		],
		// 返回 tabs 的 jQuery 对象
		returnTabsObj:function(containerId){
			var tabsListHtml = '<ul class="component-editor-tab-subnav">';
			for(index=0;index<this.tabs.length;index++){
				var current = '';
				if(config.data.displayType == this.tabs[index].name){
					current = 'current';
				}
				tabsListHtml += '<li class="component-editor-tab-subnav-item" id="'+containerId+'-'+this.tabs[index].name+'">'
									+'<a href="javascript:void(0)" class="'+current+'">'+this.tabs[index].name+'</a>'
								+'</li>'
			}
			tabsListHtml += '</ul>';
			var $tabsListHtml = $(tabsListHtml);
			this.tabsOnClick($tabsListHtml);
			return $tabsListHtml;
		},
		// tabs 点击事件
		tabsOnClick:function($tabsListHtml){
			$tabsListHtml.children().on('click',function(){
				var id = $(this).attr('id');
				lightTab(id);
				showTypePlane.saveData();
				showTypePlane.refreshForm(id);
			})
		},
		// 保存 当前编辑面板内容 数据
		saveData:function(){
			var showTypeSaveCon = this.contentName;
			var showTypeSaveConArr = showTypeSaveCon.split('-');
			var showTypeSaveName = showTypeSaveConArr[showTypeSaveConArr.length-1];
			var saveFormData = nsForm.getFormJSON(showTypeSaveCon);
			config.data[showTypeSaveName] = saveFormData;
			switch(showTypeSaveName){
				case 'all':
					var formArr = $.extend(true,[],formConfig.form);
					var tableArr = $.extend(true,[],formConfig.table);
					config.data.form = addNewType(formArr,saveFormData);
					config.data.table = addNewType(tableArr,saveFormData);
					break;
				case 'table':
				case 'form':
					config.data.all = allType(saveFormData,config.data.all);
					break;
			}
			function allType(obj,objAll){
				for(var keyName in obj){
					objAll[keyName] = obj[keyName];
				}
				return objAll;
			}
			function addNewType(arr,obj){
				var returnObj = {};
				for(index=0;index<arr.length;index++){
					if(obj[arr[index]]){
						returnObj[arr[index]] = obj[arr[index]];
					}
				}
				return returnObj;
			}
		},
		// 刷新 表单
		refreshForm:function(id){
			var idArr = id.split('-');
			var tabName = idArr[idArr.length-1];
			for(index=0;index<this.tabs.length;index++){
				if(this.tabs[index].name == tabName){
					$('#'+this.contentId).children().remove();   // 移除当前表单
					this.$container = this.tabs[index].container();							// 刷新表单容器
					$('#'+this.contentId).append(this.$container);	// 插入表单容器
					this.showForm(tabName);											// 显示表单内容
					this.contentName = this.$container.attr('id');								// 当前显示的表单 id
					break;
				}
			}
		},
		// 显示的表单数组
		getShowFormArr:function(tabName){
			if(tabName == 'all'){
				var showArr = $.extend(true,[],formConfig.form);
				var tableArr = $.extend(true,[],formConfig.table);
				for(index=0;index<tableArr.length;index++){
					showArr.push(tableArr[index]);
				}
			}else{
				var showArr = formConfig[tabName];
			}
			var showFormArr = [];
			for(index=0;index<showArr.length;index++){
				// 维数组的columnsType加changeHandler
				switch(showArr[index]){
					case 'columnType':
						var columnsTypeObj = $.extend(true,{},getTypeData[showArr[index]]);
						columnsTypeObj.changeHandler = function(value){
							var $this = $(this);
							var thisId = $this[0].fullID;
							var formId = thisId.substring(thisId.indexOf('-')+1,thisId.lastIndexOf('-'));
							showTypePlane.isHideColumnTypeData(value,formId);
						}
						showFormArr.push(columnsTypeObj);
						break;
					case 'columnTypeData':
					// case 'columnTypeText':
						var tableObj = $.extend(true,{},getTypeData[showArr[index]]);
						if(config.data[config.data.displayType].columnTypeData){
							tableObj.hidden = false;
						}
						showFormArr.push(tableObj);
						break;
					default:
						showFormArr.push($.extend(true,{},getTypeData[showArr[index]]));
						break;
				}
			}
			if(config.data[tabName]){
				for(index=0;index<showFormArr.length;index++){
					if(config.data[tabName][showFormArr[index].id]){
						showFormArr[index].value = config.data[tabName][showFormArr[index].id];
					}
				}
			}
			return showFormArr;
		},
		// 是否显示列数据状态配置
		isHideColumnTypeData:function(columnType,formID){
			var dataHidden = true;
			var dataValue = '';
			// var textHidden = true;
			// var textValue = '';
			switch(columnType){
				case 'columnState':
					dataHidden = false;
					dataValue = '{}';
					break;
				case 'href':
					dataHidden = false;
					dataValue = '[{text:"我是超链接",handler:function(obj){console.log(obj);}}]';
					break;
				case 'input':
					dataHidden = false;
					dataValue = '[{value:"aa",handler:function(obj){console.log("带btn的input");console.log(obj)},type:"enter",btns:[{text:"更多",handler:function(obj){console.log("更多");console.log(obj)}}]}]';
					break;
				case 'number':
				case 'money':
					dataHidden = false;
					dataValue = 2;
					break;
				case 'upload':
					dataHidden = false;
					dataValue = '{}';
					break;
					break;
				case 'multithumb':
					dataHidden = false;
					dataValue = '';
					break;
				default:
					break;
			}
			var columnTypeDataObj = {
				id:     	'columnTypeData',
				hidden:   	dataHidden,
				value: 		dataValue,
			}
			// var columnTypeTextObj = {
			// 	id:     	'columnTypeText',
			// 	hidden:   	textHidden,
			// 	value: 		textValue,
			// }
			if(columnType == 'columnState'){
				columnTypeDataObj.height = 50;
				// columnTypeDataObj.value = ;
			}
			nsForm.edit([columnTypeDataObj],formID)
		},
		// 显示表单内容
		showForm:function(tabName){
			var formID = this.contentId + '-'+ tabName;
			this.formJson.id = formID;
			var formJson = this.formJson;
			formJson.form = this.getShowFormArr(tabName);
			formPlane.formInit(formJson);
		},
		// 初始化 显示类型 编辑面板
		init:function(containerId){
			this.contentId = containerId + '-content';
			this.$tabs = this.returnTabsObj(containerId);
			this.$content = this.returnContentObj();
			switch(config.data.displayType){
				case 'all':
					this.$container = this.tabs[0].container();
					break;
				case 'form':
					this.$container = this.tabs[1].container();
					break;
				case 'table':
					this.$container = this.tabs[2].container();
					break;
			}
			this.contentName = this.$container.attr('id');
			this.show(containerId);
		},
		show:function(containerId){
			$('#'+containerId).append(this.$tabs);
			$('#'+containerId).append(this.$content);
			$('#'+this.contentId).append(this.$container);
			this.showForm(config.data.displayType);
		}
	}
	// 其他 编辑面板
	var otherPlane = {
		formJson:{
			id:  		'',
			size: 		"standard",
			format: 	"standard",
			fillbg: 	true, 
		},
		// 其它编辑面板显示的表单数组
		otherPanelFormArr:function(){
			var otherArr = formConfig[config.data.type];
			var otherFormArr = [];
			for(index=0;index<otherArr.length;index++){
				// otherFormArr.push($.extend(true,{},getTypeData[otherArr[index]]));
				var otherObj = $.extend(true,{},getTypeData[otherArr[index]]);
				switch(otherArr[index]){
					case 'url':
					case 'method':
					case 'data':
					case 'dataSrc':
						switch(config.data.type){
							case 'input-select':
								otherObj.label = "保存 "+otherObj.label;
								break;
							case 'person-select':
								otherObj.label = 'person ' + otherObj.label;
								break;
						}
						break;
					case 'supportFormat':
						otherObj.subdata = mimeTypeSub;
						break;
				}
				otherFormArr.push(otherObj);
			}
			if(config.data.other){
				for(index=0;index<otherFormArr.length;index++){
					if(config.data.other[otherFormArr[index].id]){
						otherFormArr[index].value = config.data.other[otherFormArr[index].id];
					}
				}
			}
			return otherFormArr;
		},
		// 初始化其它编辑面板
		init:function(containerId){
			this.formJson.id = containerId;
			this.show();
		},
		show:function(){
			var formJson = this.formJson;
			formJson.form = this.otherPanelFormArr();
			formPlane.formInit(formJson);
		}
	}
	// 格式化 changeHandlerData数据
	function formatChangeHandlerData(changeHandlerData){
		var changeHandlerDataObj = {};
		for(var typeName in changeHandlerData){
			for(var className in changeHandlerData[typeName]){
				if(typeof(changeHandlerDataObj[className])=='undefined'){
					changeHandlerDataObj[className]={};
					changeHandlerDataObj[className][typeName]={};
				}
				if(typeof(changeHandlerDataObj[className][typeName])=='undefined'){
					changeHandlerDataObj[className][typeName]={};
				}
				for(var idName in changeHandlerData[typeName][className]){
					changeHandlerDataObj[className][typeName][idName] = changeHandlerData[typeName][className][idName];
				}
			}
		}
		return changeHandlerDataObj;
	}
	// 初始化 changeHandlerData数据
	function initChangeHandlerData(changeHandlerData){
		var changeHandlerDataObj = {};
		for(var className in changeHandlerData){
			for(var typeName in changeHandlerData[className]){
				if(typeof(changeHandlerDataObj[typeName]) == 'undefined'){
					changeHandlerDataObj[typeName] = {};
					changeHandlerDataObj[typeName][className] = {}
				}
				for(var idName in changeHandlerData[className][typeName]){
					changeHandlerDataObj[typeName][className][idName] = changeHandlerData[className][typeName][idName];
				}
			}
		}
		return changeHandlerDataObj;
	}
	//设置默认值（准备结构化数据）config.data
	function setDefault(baseData){
		config.baseData = $.extend(true, {}, baseData);
		var _baseData = $.extend(true, {}, baseData);
		var defaultValue = {
			englishName: '',
			chineseName: '',
			label:'',
			variableType: 'string',
			javaDataType: '',
			readonly: '',
			rules:'',
			isUseAjax:false,  //是否使用ajax，如果否则读取subdata
			ajax:{},
			subdata:[],
			displayType:'all',  //显示的位置 表单/表格 ， 默认全部显示
			all:{},
			form:{},
			table:{},
			other:{},
			changeHandlerData:{},
			gid:'',
			voName:'',
			isSet:'是',
			fieldIndex:'',
		}
		nsVals.setDefaultValues(_baseData, defaultValue); //设置默认属性值
		if(_baseData.displayType == ''){
			_baseData.displayType = 'all';
		}
		if(typeof(_baseData.type) == 'undefined' || _baseData.type == ''){
			switch(_baseData.variableType){
				case 'date':
					_baseData.type = 'date';
					break;
				case 'boolean':
					_baseData.type = 'radio';
					break;
				case 'other':
					_baseData.type = 'label';
					break;
				default:
					_baseData.type = 'text';
					break;
			}
		}
		// changeHandlerData 子对象设置默认值 {}
		if($.isEmptyObject(_baseData.changeHandlerData)){
			_baseData.changeHandlerData = {
				readonly:{},
				hidden:{},
				disabled:{},
				value:{}
			}
		}else{
			// _baseData.changeHandlerData = initChangeHandlerData(_baseData.changeHandlerData);
		}
		config.data = {
			id: _baseData.englishName,
			englishName: _baseData.englishName,
			chineseName: _baseData.chineseName,
			label: _baseData.label,
			readonly: _baseData.readonly,
			rules: _baseData.rules,
			variableType: _baseData.variableType,
			type: _baseData.type,
			isUseAjax: _baseData.isUseAjax,  //是否使用ajax，如果否则读取subdata
			ajax: _baseData.ajax,
			subdata: _baseData.subdata,
			displayType: _baseData.displayType,  //显示的位置 表单/表格 ， 默认全部显示
			all: _baseData.all,
			form: _baseData.form,
			table: _baseData.table,
			other: _baseData.other,
			changeHandlerData: _baseData.changeHandlerData,
			gid:_baseData.gid,
			voName:_baseData.voName,
			fieldIndex:_baseData.fieldIndex,
			isSet:'是',
		}
		switch(config.data.type){
			case 'upload-single':
				config.data.type = 'uploadSingle';
				break;
		}
		config.system = componentTypeData[config.data.type]; // 默认编辑器配置
	}
	// 验证保存数据
	function validationSaveJson(saveJson){
		var formatJson = getFormatData(saveJson);
		if(!formatJson){
			return false;
		}
		if(formatJson.displayType == 'table'){
			return true;
		}
		var formConfig = formatJson.form;
		var returnBool = true;
		function isHaveFields(obj, arr){
			for(var i=0;i<arr.length;i++){
				if(typeof(obj[arr[i]])=='undefined'){
					return false;
				}
			}
			return true;
		}
		switch(formatJson.type){
			case 'select':
			case 'select2':
			case 'radio':
			case 'checkbox':
				if(formatJson.form.mindjetType == 'dict'){
					returnBool = isHaveFields(formConfig, ['dictArguments']);
				}else{
					if($.isArray(formConfig.subdata)){
					}else{
						returnBool = isHaveFields(formConfig, ['suffix']);
					}
				}
				break;
			case 'uploadImage':
			case 'uploadSingle':
			case 'upload-single':
				returnBool = isHaveFields(formConfig, ['valueField','textField','dataSrc']);
				break;
			case 'organiza-select':
				returnBool = isHaveFields(formConfig, ['suffix','searchField','localDataConfig']);
				break;
			case 'input-select':
				if(typeof(formConfig.selectConfig)=='object'){
					if(!$.isArray(formConfig.selectConfig.subdata)){
						returnBool = isHaveFields(formConfig.selectConfig, ['suffix']);
					}
				}else{
					returnBool = false;
				}
				break;
			case 'person-select':
				if(typeof(formConfig.personAjax)=='object'){
					returnBool = isHaveFields(formConfig.personAjax, ['suffix','type','dataSrc']);
					if(!$.isArray(formConfig.personAjax.localDataConfig)){
						returnBool = false;
					}
				}else{
					returnBool = false;
				}
				break;
			case 'expression':
				returnBool = isHaveFields(formConfig, ['expressionField1','primaryKey','displayField']);
				break;
		}
		return returnBool;
	}
	// 保存数据格式化
	function getFormatData(_sourceData){
		/*config.data.gid = config.sourceConfig.baseData.gid;
		config.data.voName = config.sourceConfig.baseData.voName;*/
		var sourceData = $.extend(true,{},_sourceData);
		var system = componentTypeData[sourceData.type];
		if(sourceData.type == ''){
			nsalert('没有设置组件类型','error');
			return false;
		}
		// 过滤编辑属性
		var filterAttrData = {
			id: sourceData.id,
			englishName: sourceData.englishName,
			chineseName: sourceData.chineseName,
			variableType: sourceData.variableType,
			javaDataType: sourceData.javaDataType,
			mindjetType: sourceData.type,
			isSet: '是',
			displayType: sourceData.displayType,
			gid: sourceData.gid,
			voName: sourceData.voName,
		}
		switch(sourceData.type){
			case 'note':
			case 'html':
			case 'element':
			case 'label':
			case 'title':
			case 'hr':
			case 'br':
				filterAttrData = {
					variableType: sourceData.variableType,
					mindjetType: sourceData.type,
					displayType: sourceData.displayType,
					type: sourceData.type,
					gid: sourceData.gid,
				};
				break;
			default:
				break;
		}
		switch(sourceData.type){
			case 'note':
			case 'html':
				filterAttrData.displayType = 'form';
				break;
			case 'element':
			case 'label':
			case 'title':
			case 'hr':
			case 'br':
				filterAttrData.element = sourceData.type;
				filterAttrData.width = '100%';
				filterAttrData.displayType = 'form';
				break;
			case 'custom':
				if(sourceData.other.custom == ''){
					nsAlert('没有配置自定义配置');
					return false;
				}
				var formOrTable = sourceData.other.formOrTable;
				var customConfig = JSON.parse(sourceData.other.custom);
				var formatData = {
					displayType:formOrTable
				}
				filterAttrData.displayType = formOrTable;
				formatData[formOrTable] = filterAttrData;
				splicingTwoObjects(formatData[formOrTable],customConfig);
				return formatData;
				break;
			case 'select-dict':
			case 'select2-dict':
			case 'radio-dict':
			case 'checkbox-dict':
				var typeArr = sourceData.type.split('-');
				filterAttrData.type = typeArr[0];
				filterAttrData.mindjetType = typeArr[1];
				break;
			default:
				filterAttrData.type = sourceData.type;
				break;
		}
		if(system.label){
			filterAttrData.label = sourceData.label == '' ? sourceData.chineseName : sourceData.label;
		}
		if(system.readonly){
			if(sourceData.readonly == 'true'){
				filterAttrData.readonly = true;
			}else{
				filterAttrData.readonly = false;
			}
			
		}
		if(system.rules){
			filterAttrData.rules = sourceData.rules;
		}
		if(system.other){
			setOtherAttrByOther(filterAttrData,sourceData);
		}
		if(system.changeHandlerData){
			filterAttrData.changeHandlerData = formatChangeHandlerData(sourceData.changeHandlerData);
		}
		if(system.listData){
			if(sourceData.isUseAjax){
				for(var ajaxType in sourceData.ajax){
					filterAttrData[ajaxType] = sourceData.ajax[ajaxType];
				}
			}else{
				filterAttrData.subdata = [];
				var textField = typeof(filterAttrData.textField) == 'undefined' ? 'value' : filterAttrData.textField;
				var valueField = typeof(filterAttrData.valueField) == 'undefined' ? 'id' : filterAttrData.valueField;
				filterAttrData.textField = textField;
				filterAttrData.valueField = valueField;
				// 根据 textField和valueField 定义下拉列表的text/value值
				for(index=0;index<sourceData.subdata.length;index++){
					// 判断isDisabled/selected 根据定义 isDisabled/selected
					var isDisabledFormax = sourceData.subdata[index].isDisabled;
					var selectedFormax = sourceData.subdata[index].selected;
					if(isDisabledFormax == 'true'){
						isDisabledFormax = true;
					}else{
						isDisabledFormax = false;
					}
					if(selectedFormax == 'true'){
						selectedFormax = true;
					}else{
						selectedFormax = false;
					}
					var subdataObj = {
						isDisabled:isDisabledFormax,
						selected:selectedFormax,
					}
					subdataObj[textField] = sourceData.subdata[index].textField;
					subdataObj[valueField] = sourceData.subdata[index].valueField;
					filterAttrData.subdata.push(subdataObj);
				}
			}
		}
		var formatData = {
				displayType:filterAttrData.displayType,
				type:filterAttrData.type,
			};
		switch(formatData.displayType){
			case 'all':
				var formShow = formConfig.form;//表单独有的
				formatData.form = getVisibleObj(filterAttrData,formShow,sourceData[sourceData.displayType]);
				setFormObj(formatData.form);
				var tableShow = formConfig.table;//表格独有的
				var tableObj = getTableConfig(filterAttrData);
				formatData.table = getVisibleObj(tableObj,tableShow,sourceData[sourceData.displayType]);
				setTableObj(formatData.table,filterAttrData);
				break;
			case 'form':
				var formShow = formConfig.form;
				formatData.form = getVisibleObj(filterAttrData,formShow,sourceData[sourceData.displayType]);
				setFormObj(formatData.form);
				break;
			case 'table':
				var tableShow = formConfig.table;
				var tableObj = getTableConfig(filterAttrData);
				formatData.table = getVisibleObj(tableObj,tableShow,sourceData[sourceData.displayType]);
				setTableObj(formatData.table,filterAttrData);
				break;
		}
		return formatData;
	}
	// 获得其他配置
	function setOtherAttrByOther(obj,sourceObj){
		deleteEmptyString(sourceObj.other);
		function setAttr(arr,newObj,souObj){
			/**
			 * arr 			attrArr
			 * newObj		obj.saveAjax
			 * souObj 		sourceObj.other
			 */
			for(attrI=0;attrI<arr.length;attrI++){
				if(souObj[arr[attrI]]){
					newObj[arr[attrI]] = souObj[arr[attrI]];
				}
			}
		}
		// 处理其他配置 需要添加到特殊对象中的特殊处理默认添加最外层
		switch(sourceObj.type){
			case 'input-select':
				obj.textField = sourceObj.other.textField;
				obj.valueField = sourceObj.other.valueField;
				obj.saveAjax = {};
				var attrArr = ['url','method','data'];
				// 添加到saveAjax对象
				setAttr(attrArr,obj.saveAjax,sourceObj.other);
				break;
			case 'person-select':
				obj.textField = sourceObj.other.textField;
				obj.valueField = sourceObj.other.valueField;
				obj.wbCode = sourceObj.other.wbCode;
				obj.pyCode = sourceObj.other.pyCode;
				obj.parentId = sourceObj.other.parentId;
				obj.personAjax = {};
				var attrArr = ['url','method','data','dataSrc','localDataConfig'];
				// 添加到personAjax对象
				setAttr(attrArr,obj.personAjax,sourceObj.other);
				break;
			default:
				for(var key in sourceObj.other){
					obj[key] = sourceObj.other[key];
				}
				break;
		}
	}
	// 删除对象中空的字符串
	function deleteEmptyString(object){
		for(key in object){
			if(object[key].length == 0){
				delete object[key];
			}
		}
	}
	// 把两个对象拼接在一起
	function splicingTwoObjects(object1,object2){
		for(var key in object2){
			object1[key] = object2[key];
		}
	}
	// 获取显示对象 根据 addArr（表单/表格 配置的字段）在addObj中挑选字段添加到sourceObj中返回对象
	function getVisibleObj(_sourceObj,addArr,addObj){
		var sourceObj = $.extend(true,{},_sourceObj);
		for(index=0;index<addArr.length;index++){
			if(addObj[addArr[index]]){
				sourceObj[addArr[index]] = addObj[addArr[index]];
			}
		}
		return sourceObj;
	}
	// 表单对象处理
	function setFormObj(obj){
		//标题框处理
		if(typeof(obj.element) == "string"){
			obj.width = '100%';
			return obj;
		}
		// 选择下拉框selected改为isChecked
		function formatSubdata(subdata){
			for(var subI=0;subI<subdata.length;subI++){
				subdata[subI].isChecked = subdata[subI].selected;
				delete subdata[subI].selected;
			}
			return subdata;
		}
		//需要根据类型处理的field对象
		switch(obj.type){
			case 'provincelink-select':
				// 省市联动 默认column：6
				if(typeof(obj.column)=="undefined"){
					obj.column = 6;
				}
				break;
			case 'radio':
				if(obj.subdata){
					if(obj.subdata.length > 0){
						obj.subdata = formatSubdata(obj.subdata);
					}
				}
				break;
			case 'checkbox':
				//多选，没有subdata，label包含是否/isOnlyShowOneCheckbox
				if(obj.subdata){
					if(obj.subdata.length == 0){
						if(obj.label.indexOf("是否") > -1){ //当有是否字样时 设置默认属性isOnlyShowOneCheckbox = true；
							obj.isOnlyShowOneCheckbox = true;
						}
						if(obj.isOnlyShowOneCheckbox){
							obj.subdata = [
								{
									text:'',
									value:'1'
								}
							];
						}
					}else{
						obj.subdata = formatSubdata(obj.subdata);
					}
				}
				break;
			case 'switch':
				//多选，显示一个选项，特殊样式（label的class是：switch-inline）
				obj.type = "checkbox";
				obj.isOnlyShowOneCheckbox = true;
				obj.displayClass = "switch";
				obj.subdata = [
					{
						text:'',
						value:'1'
					}
				];
				break;
			case  'textarea':
				if(typeof(obj.column)=='undefined'){
					obj.column = 12;
				}
				break;
			case 'uploadImage':
				// obj.textField = "imgurl";
				// obj.valueField = "id";
				// obj.url = getRootPath() + '/File/upload';
				// obj.changeHandler = function(data){
				// 	return {
				// 		id:'0001',
				// 		imgurl:'http://ui-pc:8888/NPE/image/login/pe.png'
				// 	}
				// }
				break;
			case 'uploadSingle':
				// obj.textField = "name";
				// obj.valueField = "id";
				// obj.supportFormat = '.doc,image/*,.xls';
				// obj.uploadSrc = getRootPath() + '/File/upload';
				// obj.changeHandler = function(data){
				// 	return {
				// 		id:'0001',
				// 		name:'1111.doc'
				// 	}
				// }
				break;
			case 'graphicsInput':
				obj.max = typeof(obj.max) == "string" || typeof(obj.max) == "number" ? obj.max : 5;
				obj.step = typeof(obj.step) == "string" || typeof(obj.step) == "number" ? obj.step : 0.5;
				break;
			case 'typeaheadtemplate':
				if(obj.url == ''){
					delete obj.url;
				}
				break;
			case 'input-select':
				var selectConfigArr = ['textField','valueField','url','dataSrc','method','data','subdata'];
				obj.selectConfig = {};
				for(attrI = 0; attrI < selectConfigArr.length; attrI++){
					if(obj[selectConfigArr[attrI]]){
						obj.selectConfig[selectConfigArr[attrI]] = obj[selectConfigArr[attrI]];
						delete obj[selectConfigArr[attrI]];
					}
				}
				break;
			case 'person-select':
				var selectConfigArr = ['textField','valueField','url','dataSrc','method','data','wbCode','pyCode','parentId'];
				obj.groupAjax = {};
				for(attrI = 0; attrI < selectConfigArr.length; attrI++){
					if(obj[selectConfigArr[attrI]]){
						obj.groupAjax[selectConfigArr[attrI]] = obj[selectConfigArr[attrI]];
						delete obj[selectConfigArr[attrI]];
					}
				}
				break;
			case 'expression':
				var selectConfigArr = ['url','dataSrc','method','data'];
				obj.dataSource = [];
				obj.listAjax = {};
				for(attrI = 0; attrI < selectConfigArr.length; attrI++){
					if(obj[selectConfigArr[attrI]]){
						if(selectConfigArr[attrI] == 'method'){
							obj.listAjax.type =  obj[selectConfigArr[attrI]];
						}else{
							obj.listAjax[selectConfigArr[attrI]] = obj[selectConfigArr[attrI]];
						}
						delete obj[selectConfigArr[attrI]];
					}
				}
				break;
			case 'tableForm':
				obj.type = 'table';
				if(obj.url){
					obj.src = obj.url;
					delete obj.url;
				}
				if(obj.method){
					obj.srctype = obj.method;
					delete obj.method;
				}
				break;
			default:
				break;
		}
		//field字段类型转换
		$.each(obj, function(fieldName, fieldValue){
			switch(fieldName){
				//转换为数字的属性
				case 'column':
				case 'height':
				case 'maximumItem':
				case 'pageLengthMenu':
				case 'isAllowFiles':
					// if(typeof(fieldValue)!='number'){
					// 	obj[fieldName] = parseInt(fieldValue);
					// }
					if(obj[fieldName] != ''&&typeof(obj[fieldName])!='number'){
						obj[fieldName] = parseInt(obj[fieldName]);
					}
					if(obj[fieldValue] == NaN){
						errorData.push(obj.englishName+'的'+fieldName + '定义错误：'+ fieldValue+', '+fieldName+'-warn');
						console.warn(fieldName + '定义错误：'+ fieldValue+', '+fieldName+'-warn');
						delete obj[fieldName];
					}
					break;
				//转换为布尔值
				case 'isDefaultDate':
				case 'multiple':
				case 'filltag':
				case 'isAllowClear':
				case 'isHasClose':
				case 'wordCount':
				case 'isPage':
				case 'isMulitSelect':
				case 'isSingleSelect':
					if(fieldValue=='true'){
						obj[fieldName] = true;
					}
					if(fieldValue=='false'){
						obj[fieldName] = false;
					}
					break;
				case 'isCloseSearch':
					if(fieldValue=='-1'){
						obj[fieldName] = -1;
					}
					if(fieldValue=='1'){
						obj[fieldName] = 1;
					}
					break;
				case 'label':
					var labelIsChinese = /[\u4e00-\u9fa5]/;
					var labelLength = 0;
					for(i=0;i<fieldValue.length;i++){
					    if(labelIsChinese.test(fieldValue[i])){
					        labelLength += 2;
					    }else{
					        labelLength++;
					    }
					}
					if(typeof(obj.plusClass)!="string"){
						if(labelLength<=14){

						}else{
							if(labelLength>=14 && labelLength<=20){
								obj.plusClass = "width:140";
								obj.plusClassIsWithCol = true;
							}else{
								if(labelLength>20){
									obj.plusClass = "width:200";
									obj.plusClassIsWithCol = true;
								}
							}
						}
					}else{
						if(typeof(obj.plusClassIsWithCol)!="string"){
							if(obj.plusClass != "strongtext"){
								obj.plusClassIsWithCol = true;
							}
						}
					}
					break;
				// 字符串转换为数组 ****，****，****
				case 'toolbars':
					if(fieldValue.length>0){
						fieldValue = fieldValue.split(',');
						obj[fieldName] = fieldValue;
					}
					break;
				// 字符串转换为数组 [{},{}] / 方法 / ['','']
				case 'addHandler':
				case 'completeHandler':
				case 'listAjaxFields':
				case 'assistBtnWords':
				// case 'toolbars':
				case 'selfData':
				case 'columnConfig':
					if(fieldValue.length>0){
						obj[fieldName] = eval('(' + fieldValue + ')');
					}
					break;
				case 'localDataConfig':
					if(fieldValue.length>0){
						obj[fieldName] = eval(fieldValue);
					}
					break;
				case 'data':
				// case 'outFields':
					if(fieldValue.length>0){
						obj[fieldName] = JSON.parse(fieldValue);
					}
					break;
				case 'personAjax':
				case 'groupAjax':
					if(fieldValue.method){
						obj[fieldName].type = fieldValue.method
						delete obj[fieldName].method;
					}
					if(fieldValue.localDataConfig){
						fieldValue.localDataConfig = eval(obj[fieldName].localDataConfig);
					}
				case 'saveAjax':
				case 'selectConfig':
					if(fieldValue.data){
						if(fieldValue.data.length>0){
							obj[fieldName].data = JSON.parse(fieldValue.data);
						}
					}
					break;
				case 'supportFormat':
					fieldValue = fieldValue.replace(/\ /g,', ');
					obj[fieldName] = fieldValue;
					break;
				case 'rules':
					fieldValue = fieldValue.replace(/\,/g,' ');
					obj[fieldName] = fieldValue;
					break;
			}
		})
		// 验证url 如果地址是以http开头则认为是完整的否则分为是后缀 删除url加suffix
		validUrl(obj)
	}
	// 验证url 如果地址是以http开头则认为是完整的否则分为是后缀 删除url加suffix
	function validUrl(obj){
		function editUrl(_obj){
			for(var key in _obj){
				switch(typeof(_obj[key])){
					case 'string':
					case 'number':
					case 'boolean':
						if(key=='url'){
							if(_obj[key].indexOf('http')==0){}else{
								_obj.suffix = _obj[key];
								delete  _obj[key];
							}
						}
						break;
					case 'object':
						if($.isArray(_obj[key])){
							for(var arrI = 0; arrI<_obj[key].length; arrI++){
								if(typeof(_obj[key][arrI])=='object'){
									editUrl(_obj[key][arrI]);
								}
							}
						}else{
							editUrl(_obj[key]);
						}
						break;
					default:
						break;
				}
			}
		}
		editUrl(obj);
	}
	// 表格对象处理
	function setTableObj(obj,souObj){
		//不同类型对应的formatHandler
		var columnTypeData = nsMindjetToJSTools.columnTypeData;
		// 判断属性 转化
		for(var tableAttrName in obj){
			switch(tableAttrName){
				//转换为数字的属性
				case 'height':
				case 'precision':
				case 'width':
					var sourHeight = obj[tableAttrName];
					if(obj[tableAttrName] != ''&&typeof(obj[tableAttrName])!='number'){
						obj[tableAttrName] = parseInt(obj[tableAttrName]);
					}
					if(obj[tableAttrName] == NaN){
						errorData.push(obj.englishName+'的'+tableAttrName + '定义错误：'+ sourHeight+'height-warn');
						console.warn(tableAttrName + '定义错误：'+ sourHeight+'height-warn');
						delete obj[tableAttrName];
					}
					break;
				case 'orderable':
				case 'searchable':
				case 'total':
				case 'hidden':
				case 'tooltip':
				case 'isDefaultDate':
					if(obj[tableAttrName] != ''){
						if(obj[tableAttrName] == 'true'){
							obj[tableAttrName] = true;
						}else{
							obj[tableAttrName] = false;
						}
					}
					break;
				case 'fieldLength':
					if(obj.width){
						delete obj.fieldLength;
					}else{
						var fieldlength = parseInt(obj.fieldLength);
						obj.width = nsMindjetToJS.getTableFieldWidth(fieldlength);
						delete obj.fieldLength;
					}
					break;
				case 'rowColor':
					obj.rowColor = JSON.parse(obj.rowColor);
					break;
			}
		}
		var columnType = obj.columnType;
		//需要根据类型处理的column对象
		switch(columnType){
			case 'stringReplace':
				//格式化radio select
				if($.isArray(souObj.subdata)){
					var formatDate = {};
					for(var subdataI = 0; subdataI<souObj.subdata.length; subdataI++){
						var formatDataValue = souObj.subdata[subdataI][souObj.valueField];
						formatDate[formatDataValue] = souObj.subdata[subdataI][souObj.textField];
					}
					obj.formatHandler = $.extend(true,{},columnTypeData.stringReplace);
					obj.formatHandler.data = {formatDate:formatDate};
				}
				if(souObj.type == 'switch'){
					obj.formatHandler = $.extend(true,{},columnTypeData.stringReplace);
					obj.formatHandler.data = {
						formatDate:{
							"0":"否",
							"1":"是",
						}
					};
				}
				break;
			case 'columnState':
				obj.formatHandler = $.extend(true,{},columnTypeData.columnState);
				obj.formatHandler.data = JSON.parse(obj.columnTypeData);
				break;
			case 'money':
				// obj.formatType = columnTypeData[columnType];
				// obj.formatType.format = ",.00";
				// break;
			case 'number':
				obj.formatType = $.extend(true,{},columnTypeData[columnType]);
				obj.columnTypeData = Number(obj.columnTypeData);
				if(!isNaN(obj.columnTypeData)){
					var stringZero = '';
					for(i=0;i<obj.columnTypeData;i++){
						stringZero += "0";
					}
					obj.formatType.format = ",." + stringZero;
				}else{
					obj.formatType.format = ",.00"
				}
				break;
			case 'radio':
			case 'checkbox':
			case 'selectbase':
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				obj.formatHandler.data[0].textField = souObj.textField;
				obj.formatHandler.data[0].valueField = souObj.valueField;
				obj.formatHandler.data[0].subdata = souObj.subdata;
				break;
			case 'date':
				obj.width = 86;
			case 'datetime':
				if(columnType == 'datetime'){
					obj.width = 134;
				}
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				if(typeof(obj.isDefaultDate)!='undefined'){
					obj.formatHandler.data.isDefaultDate = obj.isDefaultDate;
				}
				break;
			case 'formatDate':
			case 'dictionary':
			case 'thumb': // 缩略图
			case 'codeToName': // 省市区 code码转化成名字
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				break;
			case 'switch':
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				break;
			case 'href':
			case 'input':
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				if(obj.columnTypeData.length>0){
					obj.formatHandler.data = eval(obj.columnTypeData);
				}
				break;
			case 'upload':
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				if(obj.columnTypeData.length>0){
					obj.formatHandler.data = JSON.parse(obj.columnTypeData);
				}
				break;
			case 'multithumb':// 多张缩略图
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				obj.formatHandler.data.voName = typeof(obj.columnTypeData)=='string'?obj.columnTypeData:'';
				break;
			default:
				break;
		}
	}
	// 获取表格需要的配置参数
	function getTableConfig(_sourceObj){
		var tableObj = {
			englishName: _sourceObj.englishName, 			// 英文名
			chineseName: _sourceObj.chineseName,			// 中文名
			variableType: _sourceObj.variableType, 			// 原始js类型
			javaDataType: _sourceObj.javaDataType,			// 原始java类型
			field : _sourceObj.id,							// 表格列id
			title : _sourceObj.label,
			mindjetType : _sourceObj.mindjetType,
			columnType:_sourceObj.columnType,
			columnTypeData:_sourceObj.columnTypeData,
			isSet: _sourceObj.isSet,
			displayType: _sourceObj.displayType,
			gid: _sourceObj.gid,
			voName: _sourceObj.voName,
		}
		if(tableObj.mindjetType == 'dict'){
			tableObj.dictArguments = _sourceObj.dictArguments;
		}
		if(typeof(_sourceObj.isDefaultDate)=='string'){
			tableObj.isDefaultDate = _sourceObj.isDefaultDate;
		}
		return tableObj;
	}
	// 点亮
	function lightTab(id){
		$('#'+id).parent().children().children().removeClass('current');
		$('#'+id).children().addClass('current');
	}
	// 设置默认值
	function setDefaultData(data,formArr){
		for(var index=0;index<formArr.length;index++){
			if(data[formArr[index].id]){
				formArr[index].value = data[formArr[index].id];
			}
		}
	}
	// 生成表单
	function setForm(id,formArr){
		var formJson = {
			id:  		id,
			size: 		"standard",
			format: 	"standard",
			fillbg: 	true, 
			form: 		formArr,
		}
		formPlane.formInit(formJson);
	}
	// 格式化 allData 生成数组
	/***
	 * "姓名":{"englishName":"name",
	 *			"chineseName":"姓名",
	 *			"javaDataType":"java.lang.Long",
	 *			"variableType":"string"
	 *		},
	 * 转化为[
	 * 	{
	 * 		"englishName":"name",
	 *		"chineseName":"姓名",
	 *		"javaDataType":"java.lang.Long",
	 *		"variableType":"string"
	 * 	}
	 * ]
	 ***/
	function setAllDataFormat(allData){
		var dataArr = [];
		for(var keyName in allData){
			dataArr.push(allData[keyName]);
		}
		config.allDataSourse = $.extend(true,{},allData);
		config.allDataArray = dataArr;
	}
	// 通过allData获得changeHandlerData的下拉框
	function getChangeHandlerDataSelectByAllData(){
		for(var index=0;index<config.allDataArray.length;index++){
			if(typeof(config.allDataArray[index].id) == 'undefined' || config.allDataArray[index].id == ''){
				config.allDataArray[index].id = config.allDataArray[index].englishName;
			}
			if(typeof(config.allDataArray[index].label) == 'undefined' || config.allDataArray[index].id == ''){
				config.allDataArray[index].label = config.allDataArray[index].chineseName;
			}
		}
		var changeHandlerDataSelect = [];
		for(var index=0;index<config.allDataArray.length;index++){
			var changeHandlerDataSelectObj = {
				id:config.allDataArray[index].id,
				name:config.allDataArray[index].label,
			}
			changeHandlerDataSelect.push(changeHandlerDataSelectObj);
		}
		return changeHandlerDataSelect;
	}
	// 参数验证
	function parameterValidata(_sourceConfig){
		config.sourceConfig = _sourceConfig;
		config.formatConfig = $.extend(true,{},_sourceConfig);
		var defaultValue = {
			id:'editor',
			type:'plane',
			containerId:'body',
			baseData:{},
			allData:{},
			column:6,
			isMoreDialog:false,
		}
		nsVals.setDefaultValues(config.formatConfig, defaultValue); //设置默认属性值
		if($.isEmptyObject(config.formatConfig.baseData)){
			nsAlert('配置错误，缺少baseData');
			return false;
		}
		if($.isEmptyObject(config.formatConfig.allData)){
			nsAlert('配置错误，缺少allData');
			return false;
		}
		var variableTypeArr = ['string','date','boolean','number','other'];
		if(variableTypeArr.indexOf(config.formatConfig.baseData.variableType)==-1){
			nsAlert('数据类型不正确，不识别 '+config.formatConfig.baseData.variableType+' 类型','error');
			return false;
		}
		switch(config.formatConfig.baseData.variableType){
			case 'other':
				break;
			default:
				// 判断gid和voName是否存在 不存在报错
				if(typeof(config.formatConfig.baseData.gid)=='undefined' || typeof(config.formatConfig.baseData.voName)=='undefined'){
					nsAlert('配置错误,缺少gid 或 voName');
				}
				break;
		}
		if(typeof(config.formatConfig.hideHandler) == 'function'){
			config.hideHandler = config.formatConfig.hideHandler;
		}
		if(typeof(config.formatConfig.confirmHandler) == 'function'){
			config.confirmHandler = config.formatConfig.confirmHandler;
		}
		return config.formatConfig;
	}
	// 刷新saveJson的中英文名字
	function refreshSaveJson(obj){
		/*
		 * chineseName
		 * englishName
		 * saveData
		 */
		var chineseName = obj.chineseName;
		var englishName = obj.englishName;
		var newSaveData = obj.saveData;
		var sourceData = newSaveData.sourceData;
		var formatData = newSaveData.formatData;
		sourceData.chineseName = chineseName;
		sourceData.englishName = englishName;
		if(formatData.form){
			formatData.form.chineseName = chineseName;
			formatData.form.englishName = englishName;
		}
		if(formatData.table){
			formatData.table.chineseName = chineseName;
			formatData.table.englishName = englishName;
		}
	}
	// 初始化数据
	function initData(sourceData,type){
		// for(var key in sourceData){
		// 	if($.isArray(sourceData[key])){
		// 		sourceData[key] = [];
		// 	}else{
		// 		if(typeof(sourceData[key]) == 'object'){
		// 			sourceData[key] = {};
		// 		}
		// 	}
		// }
		// setDefault(sourceData);
		var typeShow = componentTypeData[type];
		for(var key in typeShow){
			if(!typeShow[key]){
				switch(key){
					case 'rules':
					case 'label':
					case 'readonly':
					case 'changeHandlerData':
					case 'other':
					case 'showType':
						delete sourceData[key];
						break;
					case 'listData':
						delete sourceData.subdata;
						delete sourceData.ajax;
						delete sourceData.isUseAjax;
						break;
				}
			}
		}
		setDefault(sourceData);
	}
	// 获得当前vo的所有字段组成的对象
	function getVoAllFieldsIdObj(){
		var changeHandlerDataSelect = config.changeHandlerDataSelect;
		var voAllFieldsIdObj = {};
		for(var i=0;i<changeHandlerDataSelect.length;i++){
			voAllFieldsIdObj[changeHandlerDataSelect[i].id] = changeHandlerDataSelect[i].id;
		}
		return voAllFieldsIdObj;
	}
	// 初始化编辑器
	function init(sourceObj,saveJson){
		config = {};
		errorData = [];
		// 参数验证
		var formatConfig = parameterValidata(sourceObj);
		// if(saveJson[sourceObj.baseData.chineseName]){
		// 	config.saveData = saveJson[sourceObj.baseData.chineseName].formatData;
		// }
		if(formatConfig){
			// config.saveJson = saveJson; //保存的列表对象
			config.isMoreDialog = formatConfig.isMoreDialog;
			setDefault(formatConfig.baseData); 	//设置默认值（准备结构化数据）
			// saveDataFormat(); 		//格式化保存的数据

			// 确定编辑器插入的容器 弹框时插入body
			if(formatConfig.type == 'dialog'){
				config.$container = $('body');
			}else{
				if(formatConfig.containerId == 'body'){
					config.$container = $('body');
				}else{
					config.$container = $('#'+formatConfig.containerId);
				}
			}
			if($.isArray(formatConfig.allData)){
				config.allDataArray = $.extend(true,[],formatConfig.allData);
			}else{
				setAllDataFormat(formatConfig.allData);
			}
			config.changeHandlerDataSelect = getChangeHandlerDataSelectByAllData();
			config.voAllFieldsIdObj = getVoAllFieldsIdObj();
			container.init();
		}
	}
	var mimeTypeSub = [
	    {
	        "id": "application/envoy .evy",
	        "name": "application/envoy .evy"
	    },
	    {
	        "id": "application/fractals .fif",
	        "name": "application/fractals .fif"
	    },
	    {
	        "id": "application/futuresplash .spl",
	        "name": "application/futuresplash .spl"
	    },
	    {
	        "id": "application/hta .hta",
	        "name": "application/hta .hta"
	    },
	    {
	        "id": "application/internet-property-stream .acx",
	        "name": "application/internet-property-stream .acx"
	    },
	    {
	        "id": "application/mac-binhex40 .hqx",
	        "name": "application/mac-binhex40 .hqx"
	    },
	    {
	        "id": "application/msword .doc",
	        "name": "application/msword .doc"
	    },
	    {
	        "id": "application/msword .dot",
	        "name": "application/msword .dot"
	    },
	    {
	        "id": "application/octet-stream .*",
	        "name": "application/octet-stream .*"
	    },
	    {
	        "id": "application/octet-stream .bin",
	        "name": "application/octet-stream .bin"
	    },
	    {
	        "id": "application/octet-stream .class",
	        "name": "application/octet-stream .class"
	    },
	    {
	        "id": "application/octet-stream .dms",
	        "name": "application/octet-stream .dms"
	    },
	    {
	        "id": "application/octet-stream .exe",
	        "name": "application/octet-stream .exe"
	    },
	    {
	        "id": "application/octet-stream .lha",
	        "name": "application/octet-stream .lha"
	    },
	    {
	        "id": "application/octet-stream .lzh",
	        "name": "application/octet-stream .lzh"
	    },
	    {
	        "id": "application/oda .oda",
	        "name": "application/oda .oda"
	    },
	    {
	        "id": "application/olescript .axs",
	        "name": "application/olescript .axs"
	    },
	    {
	        "id": "application/pdf .pdf",
	        "name": "application/pdf .pdf"
	    },
	    {
	        "id": "application/pics-rules .prf",
	        "name": "application/pics-rules .prf"
	    },
	    {
	        "id": "application/pkcs10 .p10",
	        "name": "application/pkcs10 .p10"
	    },
	    {
	        "id": "application/pkix-crl .crl",
	        "name": "application/pkix-crl .crl"
	    },
	    {
	        "id": "application/postscript .ai",
	        "name": "application/postscript .ai"
	    },
	    {
	        "id": "application/postscript .eps",
	        "name": "application/postscript .eps"
	    },
	    {
	        "id": "application/postscript .ps",
	        "name": "application/postscript .ps"
	    },
	    {
	        "id": "application/rtf .rtf",
	        "name": "application/rtf .rtf"
	    },
	    {
	        "id": "application/set-payment-initiation .setpay",
	        "name": "application/set-payment-initiation .setpay"
	    },
	    {
	        "id": "application/set-registration-initiation .setreg",
	        "name": "application/set-registration-initiation .setreg"
	    },
	    {
	        "id": "application/vnd.ms-excel .xla",
	        "name": "application/vnd.ms-excel .xla"
	    },
	    {
	        "id": "application/vnd.ms-excel .xlc",
	        "name": "application/vnd.ms-excel .xlc"
	    },
	    {
	        "id": "application/vnd.ms-excel .xlm",
	        "name": "application/vnd.ms-excel .xlm"
	    },
	    {
	        "id": "application/vnd.ms-excel .xls",
	        "name": "application/vnd.ms-excel .xls"
	    },
	    {
	        "id": "application/vnd.ms-excel .xlt",
	        "name": "application/vnd.ms-excel .xlt"
	    },
	    {
	        "id": "application/vnd.ms-excel .xlw",
	        "name": "application/vnd.ms-excel .xlw"
	    },
	    {
	        "id": "application/vnd.ms-outlook .msg",
	        "name": "application/vnd.ms-outlook .msg"
	    },
	    {
	        "id": "application/vnd.ms-pkicertstore .sst",
	        "name": "application/vnd.ms-pkicertstore .sst"
	    },
	    {
	        "id": "application/vnd.ms-pkiseccat .cat",
	        "name": "application/vnd.ms-pkiseccat .cat"
	    },
	    {
	        "id": "application/vnd.ms-pkistl .stl",
	        "name": "application/vnd.ms-pkistl .stl"
	    },
	    {
	        "id": "application/vnd.ms-powerpoint .pot",
	        "name": "application/vnd.ms-powerpoint .pot"
	    },
	    {
	        "id": "application/vnd.ms-powerpoint .pps",
	        "name": "application/vnd.ms-powerpoint .pps"
	    },
	    {
	        "id": "application/vnd.ms-powerpoint .ppt",
	        "name": "application/vnd.ms-powerpoint .ppt"
	    },
	    {
	        "id": "application/vnd.ms-project .mpp",
	        "name": "application/vnd.ms-project .mpp"
	    },
	    {
	        "id": "application/vnd.ms-works .wcm",
	        "name": "application/vnd.ms-works .wcm"
	    },
	    {
	        "id": "application/vnd.ms-works .wdb",
	        "name": "application/vnd.ms-works .wdb"
	    },
	    {
	        "id": "application/vnd.ms-works .wks",
	        "name": "application/vnd.ms-works .wks"
	    },
	    {
	        "id": "application/vnd.ms-works .wps",
	        "name": "application/vnd.ms-works .wps"
	    },
	    {
	        "id": "application/winhlp .hlp",
	        "name": "application/winhlp .hlp"
	    },
	    {
	        "id": "application/x-bcpio .bcpio",
	        "name": "application/x-bcpio .bcpio"
	    },
	    {
	        "id": "application/x-cdf .cdf",
	        "name": "application/x-cdf .cdf"
	    },
	    {
	        "id": "application/x-compress .z",
	        "name": "application/x-compress .z"
	    },
	    {
	        "id": "application/x-compressed .tgz",
	        "name": "application/x-compressed .tgz"
	    },
	    {
	        "id": "application/x-cpio .cpio",
	        "name": "application/x-cpio .cpio"
	    },
	    {
	        "id": "application/x-csh .csh",
	        "name": "application/x-csh .csh"
	    },
	    {
	        "id": "application/x-director .dcr",
	        "name": "application/x-director .dcr"
	    },
	    {
	        "id": "application/x-director .dir",
	        "name": "application/x-director .dir"
	    },
	    {
	        "id": "application/x-director .dxr",
	        "name": "application/x-director .dxr"
	    },
	    {
	        "id": "application/x-dvi .dvi",
	        "name": "application/x-dvi .dvi"
	    },
	    {
	        "id": "application/x-gtar .gtar",
	        "name": "application/x-gtar .gtar"
	    },
	    {
	        "id": "application/x-gzip .gz",
	        "name": "application/x-gzip .gz"
	    },
	    {
	        "id": "application/x-hdf .hdf",
	        "name": "application/x-hdf .hdf"
	    },
	    {
	        "id": "application/x-internet-signup .ins",
	        "name": "application/x-internet-signup .ins"
	    },
	    {
	        "id": "application/x-internet-signup .isp",
	        "name": "application/x-internet-signup .isp"
	    },
	    {
	        "id": "application/x-iphone .iii",
	        "name": "application/x-iphone .iii"
	    },
	    {
	        "id": "application/x-javascript .js",
	        "name": "application/x-javascript .js"
	    },
	    {
	        "id": "application/x-latex .latex",
	        "name": "application/x-latex .latex"
	    },
	    {
	        "id": "application/x-msaccess .mdb",
	        "name": "application/x-msaccess .mdb"
	    },
	    {
	        "id": "application/x-mscardfile .crd",
	        "name": "application/x-mscardfile .crd"
	    },
	    {
	        "id": "application/x-msclip .clp",
	        "name": "application/x-msclip .clp"
	    },
	    {
	        "id": "application/x-msdownload .dll",
	        "name": "application/x-msdownload .dll"
	    },
	    {
	        "id": "application/x-msmediaview .m13",
	        "name": "application/x-msmediaview .m13"
	    },
	    {
	        "id": "application/x-msmediaview .m14",
	        "name": "application/x-msmediaview .m14"
	    },
	    {
	        "id": "application/x-msmediaview .mvb",
	        "name": "application/x-msmediaview .mvb"
	    },
	    {
	        "id": "application/x-msmetafile .wmf",
	        "name": "application/x-msmetafile .wmf"
	    },
	    {
	        "id": "application/x-msmoney .mny",
	        "name": "application/x-msmoney .mny"
	    },
	    {
	        "id": "application/x-mspublisher .pub",
	        "name": "application/x-mspublisher .pub"
	    },
	    {
	        "id": "application/x-msschedule .scd",
	        "name": "application/x-msschedule .scd"
	    },
	    {
	        "id": "application/x-msterminal .trm",
	        "name": "application/x-msterminal .trm"
	    },
	    {
	        "id": "application/x-mswrite .wri",
	        "name": "application/x-mswrite .wri"
	    },
	    {
	        "id": "application/x-netcdf .cdf",
	        "name": "application/x-netcdf .cdf"
	    },
	    {
	        "id": "application/x-netcdf .nc",
	        "name": "application/x-netcdf .nc"
	    },
	    {
	        "id": "application/x-perfmon .pma",
	        "name": "application/x-perfmon .pma"
	    },
	    {
	        "id": "application/x-perfmon .pmc",
	        "name": "application/x-perfmon .pmc"
	    },
	    {
	        "id": "application/x-perfmon .pml",
	        "name": "application/x-perfmon .pml"
	    },
	    {
	        "id": "application/x-perfmon .pmr",
	        "name": "application/x-perfmon .pmr"
	    },
	    {
	        "id": "application/x-perfmon .pmw",
	        "name": "application/x-perfmon .pmw"
	    },
	    {
	        "id": "application/x-pkcs12 .p12",
	        "name": "application/x-pkcs12 .p12"
	    },
	    {
	        "id": "application/x-pkcs12 .pfx",
	        "name": "application/x-pkcs12 .pfx"
	    },
	    {
	        "id": "application/x-pkcs7-certificates .p7b",
	        "name": "application/x-pkcs7-certificates .p7b"
	    },
	    {
	        "id": "application/x-pkcs7-certificates .spc",
	        "name": "application/x-pkcs7-certificates .spc"
	    },
	    {
	        "id": "application/x-pkcs7-certreqresp .p7r",
	        "name": "application/x-pkcs7-certreqresp .p7r"
	    },
	    {
	        "id": "application/x-pkcs7-mime .p7c",
	        "name": "application/x-pkcs7-mime .p7c"
	    },
	    {
	        "id": "application/x-pkcs7-mime .p7m",
	        "name": "application/x-pkcs7-mime .p7m"
	    },
	    {
	        "id": "application/x-pkcs7-signature .p7s",
	        "name": "application/x-pkcs7-signature .p7s"
	    },
	    {
	        "id": "application/x-sh .sh",
	        "name": "application/x-sh .sh"
	    },
	    {
	        "id": "application/x-shar .shar",
	        "name": "application/x-shar .shar"
	    },
	    {
	        "id": "application/x-shockwave-flash .swf",
	        "name": "application/x-shockwave-flash .swf"
	    },
	    {
	        "id": "application/x-stuffit .sit",
	        "name": "application/x-stuffit .sit"
	    },
	    {
	        "id": "application/x-sv4cpio .sv4cpio",
	        "name": "application/x-sv4cpio .sv4cpio"
	    },
	    {
	        "id": "application/x-sv4crc .sv4crc",
	        "name": "application/x-sv4crc .sv4crc"
	    },
	    {
	        "id": "application/x-tar .tar",
	        "name": "application/x-tar .tar"
	    },
	    {
	        "id": "application/x-tcl .tcl",
	        "name": "application/x-tcl .tcl"
	    },
	    {
	        "id": "application/x-tex .tex",
	        "name": "application/x-tex .tex"
	    },
	    {
	        "id": "application/x-texinfo .texi",
	        "name": "application/x-texinfo .texi"
	    },
	    {
	        "id": "application/x-texinfo .texinfo",
	        "name": "application/x-texinfo .texinfo"
	    },
	    {
	        "id": "application/x-troff .roff",
	        "name": "application/x-troff .roff"
	    },
	    {
	        "id": "application/x-troff .t",
	        "name": "application/x-troff .t"
	    },
	    {
	        "id": "application/x-troff .tr",
	        "name": "application/x-troff .tr"
	    },
	    {
	        "id": "application/x-troff-man .man",
	        "name": "application/x-troff-man .man"
	    },
	    {
	        "id": "application/x-troff-me .me",
	        "name": "application/x-troff-me .me"
	    },
	    {
	        "id": "application/x-troff-ms .ms",
	        "name": "application/x-troff-ms .ms"
	    },
	    {
	        "id": "application/x-ustar .ustar",
	        "name": "application/x-ustar .ustar"
	    },
	    {
	        "id": "application/x-wais-source .src",
	        "name": "application/x-wais-source .src"
	    },
	    {
	        "id": "application/x-x509-ca-cert .cer",
	        "name": "application/x-x509-ca-cert .cer"
	    },
	    {
	        "id": "application/x-x509-ca-cert .crt",
	        "name": "application/x-x509-ca-cert .crt"
	    },
	    {
	        "id": "application/x-x509-ca-cert .der",
	        "name": "application/x-x509-ca-cert .der"
	    },
	    {
	        "id": "application/ynd.ms-pkipko .pko",
	        "name": "application/ynd.ms-pkipko .pko"
	    },
	    {
	        "id": "application/zip .zip",
	        "name": "application/zip .zip"
	    },
	    {
	        "id": "audio/basic .au",
	        "name": "audio/basic .au"
	    },
	    {
	        "id": "audio/basic .snd",
	        "name": "audio/basic .snd"
	    },
	    {
	        "id": "audio/mid .mid",
	        "name": "audio/mid .mid"
	    },
	    {
	        "id": "audio/mid .rmi",
	        "name": "audio/mid .rmi"
	    },
	    {
	        "id": "audio/mpeg .mp3",
	        "name": "audio/mpeg .mp3"
	    },
	    {
	        "id": "audio/x-aiff .aif",
	        "name": "audio/x-aiff .aif"
	    },
	    {
	        "id": "audio/x-aiff .aifc",
	        "name": "audio/x-aiff .aifc"
	    },
	    {
	        "id": "audio/x-aiff .aiff",
	        "name": "audio/x-aiff .aiff"
	    },
	    {
	        "id": "audio/x-mpegurl .m3u",
	        "name": "audio/x-mpegurl .m3u"
	    },
	    {
	        "id": "audio/x-pn-realaudio .ra",
	        "name": "audio/x-pn-realaudio .ra"
	    },
	    {
	        "id": "audio/x-pn-realaudio .ram",
	        "name": "audio/x-pn-realaudio .ram"
	    },
	    {
	        "id": "audio/x-wav .wav",
	        "name": "audio/x-wav .wav"
	    },
	    {
	        "id": "image/bmp .bmp",
	        "name": "image/bmp .bmp"
	    },
	    {
	        "id": "image/cis-cod .cod",
	        "name": "image/cis-cod .cod"
	    },
	    {
	        "id": "image/gif .gif",
	        "name": "image/gif .gif"
	    },
	    {
	        "id": "image/ief .ief",
	        "name": "image/ief .ief"
	    },
	    {
	        "id": "image/jpeg .jpe",
	        "name": "image/jpeg .jpe"
	    },
	    {
	        "id": "image/jpeg .jpeg",
	        "name": "image/jpeg .jpeg"
	    },
	    {
	        "id": "image/jpeg .jpg",
	        "name": "image/jpeg .jpg"
	    },
	    {
	        "id": "image/pipeg .jfif",
	        "name": "image/pipeg .jfif"
	    },
	    {
	        "id": "image/svg+xml .svg",
	        "name": "image/svg+xml .svg"
	    },
	    {
	        "id": "image/tiff .tif",
	        "name": "image/tiff .tif"
	    },
	    {
	        "id": "image/tiff .tiff",
	        "name": "image/tiff .tiff"
	    },
	    {
	        "id": "image/x-cmu-raster .ras",
	        "name": "image/x-cmu-raster .ras"
	    },
	    {
	        "id": "image/x-cmx .cmx",
	        "name": "image/x-cmx .cmx"
	    },
	    {
	        "id": "image/x-icon .ico",
	        "name": "image/x-icon .ico"
	    },
	    {
	        "id": "image/x-portable-anymap .pnm",
	        "name": "image/x-portable-anymap .pnm"
	    },
	    {
	        "id": "image/x-portable-bitmap .pbm",
	        "name": "image/x-portable-bitmap .pbm"
	    },
	    {
	        "id": "image/x-portable-graymap .pgm",
	        "name": "image/x-portable-graymap .pgm"
	    },
	    {
	        "id": "image/x-portable-pixmap .ppm",
	        "name": "image/x-portable-pixmap .ppm"
	    },
	    {
	        "id": "image/x-rgb .rgb",
	        "name": "image/x-rgb .rgb"
	    },
	    {
	        "id": "image/x-xbitmap .xbm",
	        "name": "image/x-xbitmap .xbm"
	    },
	    {
	        "id": "image/x-xpixmap .xpm",
	        "name": "image/x-xpixmap .xpm"
	    },
	    {
	        "id": "image/x-xwindowdump .xwd",
	        "name": "image/x-xwindowdump .xwd"
	    },
	    {
	        "id": "message/rfc822 .mht",
	        "name": "message/rfc822 .mht"
	    },
	    {
	        "id": "message/rfc822 .mhtml",
	        "name": "message/rfc822 .mhtml"
	    },
	    {
	        "id": "message/rfc822 .nws",
	        "name": "message/rfc822 .nws"
	    },
	    {
	        "id": "text/css .css",
	        "name": "text/css .css"
	    },
	    {
	        "id": "text/h323 .323",
	        "name": "text/h323 .323"
	    },
	    {
	        "id": "text/html .htm",
	        "name": "text/html .htm"
	    },
	    {
	        "id": "text/html .html",
	        "name": "text/html .html"
	    },
	    {
	        "id": "text/html .stm",
	        "name": "text/html .stm"
	    },
	    {
	        "id": "text/iuls .uls",
	        "name": "text/iuls .uls"
	    },
	    {
	        "id": "text/plain .bas",
	        "name": "text/plain .bas"
	    },
	    {
	        "id": "text/plain .c",
	        "name": "text/plain .c"
	    },
	    {
	        "id": "text/plain .h",
	        "name": "text/plain .h"
	    },
	    {
	        "id": "text/plain .txt",
	        "name": "text/plain .txt"
	    },
	    {
	        "id": "text/richtext .rtx",
	        "name": "text/richtext .rtx"
	    },
	    {
	        "id": "text/scriptlet .sct",
	        "name": "text/scriptlet .sct"
	    },
	    {
	        "id": "text/tab-separated-values .tsv",
	        "name": "text/tab-separated-values .tsv"
	    },
	    {
	        "id": "text/webviewhtml .htt",
	        "name": "text/webviewhtml .htt"
	    },
	    {
	        "id": "text/x-component .htc",
	        "name": "text/x-component .htc"
	    },
	    {
	        "id": "text/x-setext .etx",
	        "name": "text/x-setext .etx"
	    },
	    {
	        "id": "text/x-vcard .vcf",
	        "name": "text/x-vcard .vcf"
	    },
	    {
	        "id": "video/mpeg .mp2",
	        "name": "video/mpeg .mp2"
	    },
	    {
	        "id": "video/mpeg .mpa",
	        "name": "video/mpeg .mpa"
	    },
	    {
	        "id": "video/mpeg .mpe",
	        "name": "video/mpeg .mpe"
	    },
	    {
	        "id": "video/mpeg .mpeg",
	        "name": "video/mpeg .mpeg"
	    },
	    {
	        "id": "video/mpeg .mpg",
	        "name": "video/mpeg .mpg"
	    },
	    {
	        "id": "video/mpeg .mpv2",
	        "name": "video/mpeg .mpv2"
	    },
	    {
	        "id": "video/quicktime .mov",
	        "name": "video/quicktime .mov"
	    },
	    {
	        "id": "video/quicktime .qt",
	        "name": "video/quicktime .qt"
	    },
	    {
	        "id": "video/x-la-asf .lsf",
	        "name": "video/x-la-asf .lsf"
	    },
	    {
	        "id": "video/x-la-asf .lsx",
	        "name": "video/x-la-asf .lsx"
	    },
	    {
	        "id": "video/x-ms-asf .asf",
	        "name": "video/x-ms-asf .asf"
	    },
	    {
	        "id": "video/x-ms-asf .asr",
	        "name": "video/x-ms-asf .asr"
	    },
	    {
	        "id": "video/x-ms-asf .asx",
	        "name": "video/x-ms-asf .asx"
	    },
	    {
	        "id": "video/x-msvideo .avi",
	        "name": "video/x-msvideo .avi"
	    },
	    {
	        "id": "video/x-sgi-movie .movie",
	        "name": "video/x-sgi-movie .movie"
	    },
	    {
	        "id": "x-world/x-vrml .flr",
	        "name": "x-world/x-vrml .flr"
	    },
	    {
	        "id": "x-world/x-vrml .vrml",
	        "name": "x-world/x-vrml .vrml"
	    },
	    {
	        "id": "x-world/x-vrml .wrl",
	        "name": "x-world/x-vrml .wrl"
	    },
	    {
	        "id": "x-world/x-vrml .wrz",
	        "name": "x-world/x-vrml .wrz"
	    },
	    {
	        "id": "x-world/x-vrml .xaf",
	        "name": "x-world/x-vrml .xaf"
	    },
	    {
	        "id": "x-world/x-vrml .xof",
	        "name": "x-world/x-vrml .xof"
	    }
	]
	return {
		init:init,
		getConfig:function(){return config},
		getConfigData:function(){return config.data;},
		refreshSaveJson:refreshSaveJson,
		closeFrame:container.closeFrame,
		getFormatData:getFormatData,
		errorData:errorData,
		mimeType:mimeTypeSub,
	}
})(jQuery)