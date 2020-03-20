var NetstarComponentEditor = (function($){
	// 表单数组配置对象
	var getTypeData = {
		label:{
			id:'label',
			label:'label',
			type:'text',
			column:12,
		},
		disabled:{
			id:'disabled',
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
		'form-width':{
			id:'form-width',
			type:'text',
			label:'列宽(百分数)',
			column:12,
        },
		'form-hidden':{
			id:'form-hidden',
			label:'隐藏字段',
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
        inputWidth:{
            id:'inputWidth',
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
			label:'格式',
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
		value:{
			id:'value',
			label:'默认值',
			type:'text',
			column:12,
		},
		idField:{
			id:'idField',
			label:'idField',
			type:'text',
			column:12,
		},
		dialogTitle:{
			id:'dialogTitle',
			label:'dialogTitle',
			type:'text',
			column:12,
		},
		infoBtnName:{
			id:'infoBtnName',
			label:'infoBtnName',
			type:'text',
			column:12,
		},
		selectMode:{
			id:'selectMode',
			label:'selectMode',
			type:'radio',
            column:12,
            subdata:[
                {
                    text: 'single',
                    value: 'single',
                },{
                    text: 'checkbox',
                    value: 'checkbox',
                },{
                    text: 'noSelect',
                    value: 'noSelect',
                },
            ],
		},
		relationField:{
			id:'relationField',
			label:'关联字段',
			type:'text',
			column:12,
        },
		contentType:{
			id:'contentType',
			label:'content-Type',
			type:'text',
			column:12,
		},
		outputFields:{
			id:'outputFields',
			label:'outputFields',
			type:'textarea',
			column:12,
		},
		innerFields:{
			id:'innerFields',
			label:'innerFields',
			type:'textarea',
			column:12,
		},
		listExpression:{
			id:'listExpression',
			label:'下拉样式',
			type:'textarea',
			column:12,
		},
        'source-ajax':{
			element: 	'label',
            label: 		'source-ajax',
            width: 	 	'100%',
        },
        'search-ajax':{
			element: 	'label',
            label: 		'search-ajax',
            width: 	 	'100%',
        },
        'subdataAjax-ajax':{
			element: 	'label',
            label: 		'subdataAjax-ajax',
            width: 	 	'100%',
        },
        'getRowData-ajax':{
			element: 	'label',
            label: 		'getRowData-ajax',
            width: 	 	'100%',
		},
        'getFormData-ajax':{
			element: 	'label',
            label: 		'getFormData-ajax',
            width: 	 	'100%',
		},
        'getAjax-ajax':{
			element: 	'label',
            label: 		'getAjax-ajax',
            width: 	 	'100%',
        },
        'saveAjax-ajax':{
			element: 	'label',
            label: 		'saveAjax-ajax',
            width: 	 	'100%',
		},
        'form-element':{
			element: 	'label',
            label: 		'表单配置',
            width: 	 	'100%',
        },
        'table-element':{
			element: 	'label',
            label: 		'表格配置',
            width: 	 	'100%',
        },
        // 表格参数
		editable:{
			id:'editable',
			label:'是否允许编辑',
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
		'table-width':{
			id:'table-width',
			type:'text',
			label:'列宽',
			column:12,
        },
		fieldLength:{
			id:'fieldLength',
			label:'字段长度',
			type:'text',
			column:12,
		},
		'table-hidden':{
			id:'table-hidden',
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
		orderable:{
			id:'orderable',
			label:'是否允许列排序',
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
		rowColor:{
			id:'rowColor',
			label:'rowColor',
			type:'textarea',
			column:12,
        },
		'columnFormat-type':{
			id : 'type',
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
				{ id : 'renderField' , name : 'renderField', },
				{ id : 'cubesInput' , name : '标准值（多维输入）', },
				{ id : 'timeUint' , name : '时间单位', },
			],
		},
		'columnFormat-format':{
			id : 'format',
			label : '表格列数据',
			type : 'textarea',
			column : 12,
			hidden : true,
		},
        'footer-type':{
            id:'type',
			label:'type',
			type:'radio',
			column:12,
			isHasClose:true,
            subdata:[
                {
                    text:'average', //平均
                    value:'average',
                },{
                    text:'sum', //合计
                    value:'sum',
                },{
                    text:'expression', //合计
                    value:'expression',
                }
            ]
        },
        'footer-content':{
            id:'content',
			label:'content',
			type:'textarea',
			column:12,
        },
        'viewConfig-type':{
            id:'type',
			label:'type',
			type:'radio',
            column:12,
            subdata:[
                {
                    text:'viewerList',
                    value:'viewerList',
                },{
                    text:'viewerVo',
                    value:'viewerVo',
                }
            ]
		},
		total:{
			id:'total',
			label:'表达式',
			type:'textarea',
            column:12,
		},
		isDistinct:{
			id:'isDistinct',
			label:'isDistinct',
			type:'radio',
			column:12,
			value:'false',
			subdata:[
				{
					text:'true',
					value:'true',
				},{
					text:'false',
					value:'false',
				}
			],
		},
		isDefaultSubdataText:{
			id:'isDefaultSubdataText',
			label:'默认字符串替换',
			type:'radio',
			column:12,
			value:'true',
			subdata:[
				{
					text:'true',
					value:'true',
				},{
					text:'false',
					value:'false',
				}
			],
		},
		decimalDigit:{
			id:'decimalDigit',
			label:'小数位数',
			type:'text',
            column:12,
		},
		isObjectValue:{
			id:'isObjectValue',
			label:'value是vo',
			type:'radio',
			column:12,
			value:'false',
			subdata:[
				{
					text:'true',
					value:'true',
				},{
					text:'false',
					value:'false',
				}
			],
		},
		places:{
			id:'places',
			label:'小数位数',
			type:'text',
			column:12,
			hidden:true,
		},
		totalSymbol:{
			id:'totalSymbol',
			label:'合计',
			type:'text',
			column:12,
			hidden:true,
		},
		symbol:{
			id:'symbol',
			label:'标识符',
			type:'text',
			column:12,
			value:'￥',
			hidden:true,
		},
		thousand:{
			id:'thousand',
			label:'千分分隔符',
			type:'text',
            column:12,
			value:',',
			hidden:true,
		},
		decimal:{
			id:'decimal',
			label:'替换小数点',
			type:'text',
			column:12,
			value:'.',
			hidden:true,
		},
		distinctField:{
			id:'distinctField',
			label:'排重字段',
			type:'text',
			column:12,
			value:'',
		},
		fieldStart:{
			id:'fieldStart',
			label:'开始日期',
			type:'text',
			column:12,
			value:'',
		},
		fieldEnd:{
			id:'fieldEnd',
			label:'结束日期',
			type:'text',
			column:12,
			value:'',
		},
		fieldEnd:{
			id:'fieldEnd',
			label:'结束日期',
			type:'text',
			column:12,
			value:'',
		},
		remoteAjax:{
			id:'remoteAjax',
			label:'验证ajax',
			type:'text',
			column:12,
			value:'',
		},
		'subFields-code':{
			id:'subFields-code',
			label:'code',
			type:'text',
			column:12,
			value:'',
		},
		'subFields-longitude':{
			id:'subFields-longitude',
			label:'经度',
			type:'text',
			column:12,
			value:'',
		},
		'subFields-latitude':{
			id:'subFields-latitude',
			label:'纬度',
			type:'text',
			column:12,
			value:'',
		},
		'searchMode':{
			id:'searchMode',
			label:'搜索',
			type:'radio',
			column:12,
			value:'',
			subdata:[
				{
					text:'client',
					value:'client',
				},{
					text:'server',
					value:'server',
				},{
					text:'none',
					value:'none',
				}
			],
		
		},
		'searchName':{
			id:'searchName',
			label:'搜索名',
			type:'text',
			column:12,
			value:'',
		},
		'assignExpres':{
			id:'assignExpres',
			label:'vo赋值',
			type:'textarea',
			column:12,
			value:'',
		},
		mapType : {
			id:'mapType',
			label:'地图类型',
			type:'radio',
			column:12,
			value:'qq',
			subdata:[
				{
					text:'qq',
					value:'qq',
				},{
					text:'baidu',
					value:'baidu',
				}
			],
		},
		title : {
			id:'title',
			label:'title',
			type:'text',
			column:12,
			hidden:true,
		},
		field : {
			id:'field',
			label:'field',
			type:'text',
			column:12,
			hidden:true,
		},
		parameterFormat : {
			id:'parameterFormat',
			label:'parameterFormat',
			type:'textarea',
			column:12,
			hidden:true,
		},
		validateParams:{
			id:'validateParams',
			label:'validateParams',
			type:'textarea',
			column:12,
		},
		templateName : {
			id:'templateName',
			label:'templateName',
			type:'text',
			column:12,
			hidden:true,
		},
		readonly : {
			id:'readonly',
			label:'readonly',
			type:'radio',
			column:12,
			value:'false',
			hidden:true,
			subdata:[
				{
					text:'false',
					value:'false',
				},{
					text:'true',
					value:'true',
				}
			],
		},
		ranges : {
			id:'ranges',
			label:'ranges',
			type:'radio',
			column:12,
			value:'true',
			subdata:[
				{
					text:'false',
					value:'false',
				},{
					text:'true',
					value:'true',
				}
			],
		},
		children : {
			id:'children',
			label:'子级名称',
			type:'text',
			column:12,
		},
		fullnameField : {
			id:'fullnameField',
			label:'fullnameField',
			type:'text',
			column:12,
		},
		level : {
			id:'level',
			label:'level',
			type:'text',
			column:12,
		},
		isMultiple : {
			id:'isMultiple',
			label:'是否多选',
			type:'radio',
			column:12,
			value:'false',
			subdata:[
				{
					text:'false',
					value:'false',
				},{
					text:'true',
					value:'true',
				}
			],
		},
		defaultSearchData : {
			id:'defaultSearchData',
			label:'查询默认数据',
			type:'textarea',
			column:12,
		},
		isUseUEditor : {
			id:'isUseUEditor',
			label:'使用ueditor',
			type:'radio',
			column:12,
			value:'false',
			subdata:[
				{
					text:'false',
					value:'false',
				},{
					text:'true',
					value:'true',
				}
			],
		},
		model : {
			id:'model',
			label:'查询默认数据',
			type:'textarea',
			value:'standard',
			column:12,
		},
		panelConfig : {
			id:'panelConfig',
			label:'面板配置',
			type:'textarea',
			column:12,
		},
		valueExpression : {
			id:'valueExpression',
			label:'valueExpression',
			type:'text',
			column:12,
		},
		setValueExpression : {
			id:'setValueExpression',
			label:'setValueExpression',
			type:'textarea',
			column:12,
		},
		voField : {
			id:'voField',
			label:'voField',
			type:'text',
			column:12,
		},
		accept : {
			id:'accept',
			label:'accept',
			type:'text',
			column:12,
		},
		urlField : {
			id:'urlField',
			label:'url字段',
			type:'text',
			column:12,
		},
		thumUrlField : {
			id:'thumUrlField',
			label:'缩略图字段',
			type:'text',
			column:12,
		},
		isTurnTree : {
			id:'isTurnTree',
			label:'是否转换树',
			type:'radio',
			column:12,
			value:'false',
			subdata:[
				{
					text:'false',
					value:'false',
				},{
					text:'true',
					value:'true',
				}
			],
		},
		isShowThum : {
			id:'isShowThum',
			label:'是否显示缩略图',
			type:'radio',
			column:12,
			value:'true',
			subdata:[
				{
					text:'false',
					value:'false',
				},{
					text:'true',
					value:'true',
				}
			],
		},
		fileTypeField : {
			id:'fileTypeField',
			label:'文件类型字段',
			type:'text',
			column:12,
		},
		btns : {
			id:'btns',
			label:'按钮',
			type: 		'select2',
			column: 	12,	
			subdata: 	[
				{ text : 'upload', value : 'upload'},
				{ text : 'edit', value : 'edit'},
				{ text : 'delete', value : 'delete'},
				{ text : 'download', value : 'download'},
				{ text : 'print', value : 'print'},
			],
			multiple: 	true,
		},
		parentId : {
			id:'parentId',
			label:'父字段',
			type:'text',
			column:12,
		},
        isPreloadData:{
			id:'isPreloadData',
			label:'预先加载',
			type: 		'radio',
			column: 	12,	
			subdata: 	[
				{ text : 'true', value : 'true'},
				{ text : 'false', value : 'false'},
			],
		},

		// 表格字段
        isTreeNode:{
			id:'isTreeNode',
			label:'isTreeNode',
			type: 		'radio',
			column: 	12,	
			subdata: 	[
				{ text : 'true', value : 'true'},
				{ text : 'false', value : 'false'},
			],
			multiple: 	true,
		},
	}
	// 帮助配置
	var helpConfig = {
		englishName:{
			title : 'englishName',
			name : 'englishName',
			value : getRootPath() + '/htmlpage/help.html',
		},
		chineseName:{
			title : 'chineseName',
			name : 'chineseName',
			value : getRootPath() + '/htmlpage/help.html',
		},
		type:{
			title : 'type',
			name : 'type',
			value : getRootPath() + '/htmlpage/help.html',
		},
		rules:{
			title : 'rules',
			name : 'rules',
			value : getRootPath() + '/htmlpage/help.html',
		},
		moreRules:{
			title : 'moreRules',
			name : 'moreRules',
			value : getRootPath() + '/htmlpage/help.html',
		},
		label:{
			title : 'label',
			name : 'label',
			value : getRootPath() + '/htmlpage/help.html',
		},
		disabled:{
			title : 'disabled',
			name : 'disabled',
			value : getRootPath() + '/htmlpage/help.html',
		},
		'form-width':{
			title : 'form-width',
			name : 'form-width',
			value : getRootPath() + '/htmlpage/help.html',
        },
		'form-hidden':{
			title : 'form-hidden',
			name : 'form-hidden',
			value : getRootPath() + '/htmlpage/help.html',
		},
        inputWidth:{
			title : 'inputWidth',
			name : 'inputWidth',
			value : getRootPath() + '/htmlpage/help.html',
        },
		height:{
			title : 'height',
			name : 'height',
			value : getRootPath() + '/htmlpage/help.html',
		},
		url:{
			title : 'url',
			name : 'url',
			value : getRootPath() + '/htmlpage/help.html',
		},
		dataSrc:{
			title : 'dataSrc',
			name : 'dataSrc',
			value : getRootPath() + '/htmlpage/help.html',
		},
		data:{
			title : 'data',
			name : 'data',
			value : getRootPath() + '/htmlpage/help.html',
		},
		method:{
			title : 'method',
			name : 'method',
			value : getRootPath() + '/htmlpage/help.html',
        },
		isHasClose:{
			title : 'isHasClose',
			name : 'isHasClose',
			value : getRootPath() + '/htmlpage/help.html',
		},
		isAllowClear:{
			title : 'isAllowClear',
			name : 'isAllowClear',
			value : getRootPath() + '/htmlpage/help.html',
		},
		textField:{
			title : 'textField',
			name : 'textField',
			value : getRootPath() + '/htmlpage/help.html',
		},
		valueField:{
			title : 'valueField',
			name : 'valueField',
			value : getRootPath() + '/htmlpage/help.html',
		},
		isDefaultDate:{
			title : 'isDefaultDate',
			name : 'isDefaultDate',
			value : getRootPath() + '/htmlpage/help.html',
		},
		format:{
			title : 'format',
			name : 'format',
			value : getRootPath() + '/htmlpage/help.html',
		},
		column:{
			title : 'column',
			name : 'column',
			value : getRootPath() + '/htmlpage/help.html',
		},
		formOrTable:{
			title : 'formOrTable',
			name : 'formOrTable',
			value : getRootPath() + '/htmlpage/help.html',
		},
		dictArguments:{
			title : 'dictArguments',
			name : 'dictArguments',
			value : getRootPath() + '/htmlpage/help.html',
		},
		value:{
			title : 'value',
			name : 'value',
			value : getRootPath() + '/htmlpage/help.html',
		},
		idField:{
			title : 'idField',
			name : 'idField',
			value : getRootPath() + '/htmlpage/help.html',
		},
		dialogTitle:{
			title : 'dialogTitle',
			name : 'dialogTitle',
			value : getRootPath() + '/htmlpage/help.html',
		},
		infoBtnName:{
			title : 'infoBtnName',
			name : 'infoBtnName',
			value : getRootPath() + '/htmlpage/help.html',
		},
		selectMode:{
			title : 'selectMode',
			name : 'selectMode',
			value : getRootPath() + '/htmlpage/help.html',
		},
		relationField:{
			title : 'relationField',
			name : 'relationField',
			value : getRootPath() + '/htmlpage/help.html',
        },
		contentType:{
			title : 'contentType',
			name : 'contentType',
			value : getRootPath() + '/htmlpage/help.html',
		},
		outputFields:{
			title : 'outputFields',
			name : 'outputFields',
			value : getRootPath() + '/htmlpage/help.html',
		},
		listExpression:{
			title : 'listExpression',
			name : 'listExpression',
			value : getRootPath() + '/htmlpage/help.html',
		},
        // 表格参数
		editable:{
			title : 'editable',
			name : 'editable',
			value : getRootPath() + '/htmlpage/help.html',
		},
		'table-width':{
			title : 'table-width',
			name : 'table-width',
			value : getRootPath() + '/htmlpage/help.html',
        },
		fieldLength:{
			title : 'fieldLength',
			name : 'fieldLength',
			value : getRootPath() + '/htmlpage/help.html',
		},
		'table-hidden':{
			title : 'table-hidden',
			name : 'table-hidden',
			value : getRootPath() + '/htmlpage/help.html',
		},
		orderable:{
			title : 'orderable',
			name : 'orderable',
			value : getRootPath() + '/htmlpage/help.html',
		},
		searchable:{
			title : 'searchable',
			name : 'searchable',
			value : getRootPath() + '/htmlpage/help.html',
		},
		total:{
			title : 'total',
			name : 'total',
			value : getRootPath() + '/htmlpage/help.html',
		},
		tooltip:{
			title : 'tooltip',
			name : 'tooltip',
			value : getRootPath() + '/htmlpage/help.html',
		},
		rowColor:{
			title : 'rowColor',
			name : 'rowColor',
			value : getRootPath() + '/htmlpage/help.html',
        },
		'columnFormat-type':{
			title : 'columnFormat-type',
			name : 'type',
			value : getRootPath() + '/htmlpage/help.html',
		},
		'columnFormat-format':{
			title : 'columnFormat-format',
			name : 'format',
			value : getRootPath() + '/htmlpage/help.html',
		},
        'footer-type':{
			title : 'footer-type',
			name : 'type',
			value : getRootPath() + '/htmlpage/help.html',
        },
        'viewConfig-type':{
			title : 'viewConfig-type',
			name : 'type',
			value : getRootPath() + '/htmlpage/help.html',
		},
		total:{
			title : 'total',
			name : 'total',
			value : getRootPath() + '/htmlpage/help.html',
		},
		isDistinct:{
			title : 'isDistinct',
			name : 'isDistinct',
			value : getRootPath() + '/htmlpage/help.html',
		},
		isDefaultSubdataText:{
			title : 'isDefaultSubdataText',
			name : 'isDefaultSubdataText',
			value : getRootPath() + '/htmlpage/help.html',
		},
		decimalDigit:{
			title : 'decimalDigit',
			name : 'decimalDigit',
			value : getRootPath() + '/htmlpage/help.html',
		},
		isObjectValue:{
			title : 'isObjectValue',
			name : 'isObjectValue',
			value : getRootPath() + '/htmlpage/help.html',
		},
		places:{
			title : 'places',
			name : 'places',
			value : getRootPath() + '/htmlpage/help.html',
		},
		symbol:{
			title : 'symbol',
			name : 'symbol',
			value : getRootPath() + '/htmlpage/help.html',
		},
		thousand:{
			title : 'thousand',
			name : 'thousand',
			value : getRootPath() + '/htmlpage/help.html',
		},
		decimal:{
			title : 'decimal',
			name : 'decimal',
			value : getRootPath() + '/htmlpage/help.html',
		},
		distinctField:{
			title : 'distinctField',
			name : 'distinctField',
			value : getRootPath() + '/htmlpage/help.html',
		},
		fieldStart:{
			title : 'fieldStart',
			name : 'fieldStart',
			value : getRootPath() + '/htmlpage/help.html',
		},
		fieldEnd:{
			title : 'fieldEnd',
			name : 'fieldEnd',
			value : getRootPath() + '/htmlpage/help.html',
		},
		remoteAjax:{
			title : 'remoteAjax',
			name : 'remoteAjax',
			value : getRootPath() + '/htmlpage/help.html',
		},
		'subFields-code':{
			title : 'subFields-code',
			name : 'subFields-code',
			value : getRootPath() + '/htmlpage/help.html',
		},
		'subFields-longitude':{
			title : 'subFields-longitude',
			name : 'subFields-longitude',
			value : getRootPath() + '/htmlpage/help.html',
		},
		'subFields-latitude':{
			title : 'subFields-latitude',
			name : 'subFields-latitude',
			value : getRootPath() + '/htmlpage/help.html',
		},
		'searchMode':{
			title : 'searchMode',
			name : 'searchMode',
			value : getRootPath() + '/htmlpage/help.html',
		},
		'searchName':{
			title : 'searchName',
			name : 'searchName',
			value : getRootPath() + '/htmlpage/help.html',
		},
		mapType : {
			title : 'mapType',
			name : 'mapType',
			value : getRootPath() + '/htmlpage/help.html',
		},
		title : {
			title : 'title',
			name : 'title',
			value : getRootPath() + '/htmlpage/help.html',
		},
		field : {
			title : 'field',
			name : 'field',
			value : getRootPath() + '/htmlpage/help.html',
		},
		parameterFormat : {
			title : 'parameterFormat',
			name : 'parameterFormat',
			value : getRootPath() + '/htmlpage/help.html',
		},
		templateName : {
			title : 'templateName',
			name : 'templateName',
			value : getRootPath() + '/htmlpage/help.html',
		},
		readonly : {
			title : 'readonly',
			name : 'readonly',
			value : getRootPath() + '/htmlpage/help.html',
		},
		ranges : {
			title : 'ranges',
			name : 'ranges',
			value : getRootPath() + '/htmlpage/help.html',
		},
		children : {
			title : 'children',
			name : 'children',
			value : getRootPath() + '/htmlpage/help.html',
		},
		fullnameField : {
			title : 'fullnameField',
			name : 'fullnameField',
			value : getRootPath() + '/htmlpage/help.html',
		},
		level : {
			title : 'level',
			name : 'level',
			value : getRootPath() + '/htmlpage/help.html',
		},
		isMultiple : {
			title : 'isMultiple',
			name : 'isMultiple',
			value : getRootPath() + '/htmlpage/help.html',
		},
		defaultSearchData : {
			title : 'defaultSearchData',
			name : 'defaultSearchData',
			value : getRootPath() + '/htmlpage/help.html',
		},
		isUseUEditor : {
			title : 'isUseUEditor',
			name : 'isUseUEditor',
			value : getRootPath() + '/htmlpage/help.html',
		},
		model : {
			title : 'model',
			name : 'model',
			value : getRootPath() + '/htmlpage/help.html',
		},
		panelConfig : {
			title : 'panelConfig',
			name : 'panelConfig',
			value : getRootPath() + '/htmlpage/help.html',
		},
		valueExpression : {
			title : 'valueExpression',
			name : 'valueExpression',
			value : getRootPath() + '/htmlpage/help.html',
		},
		voField : {
			title : 'voField',
			name : 'voField',
			value : getRootPath() + '/htmlpage/help.html',
		},
	}
	// 显示内容
	var componentTypeData = {
		business:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'},
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
            showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		businessSelect:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'},
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
            showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		text:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'},
				{value:'remote',text:'ajax验证'},
				{value:'ismobile',text:'手机号'},
				{value:'isphone',text:'固定电话'},
				{value:'fax',text:'传真'},
				{value:'postalcode',text:'邮政编码'},
				{value:'email',text:'邮箱'},
				{value:'url',text:'地址'},
				{value:'Icd',text:'身份证号'},
			],
			moreRules:true,
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		number:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'},
				{value:'ismobile',text:'手机号'},
				{value:'isphone',text:'固定电话'},
				{value:'postalcode',text:'邮政编码'},
				{value:'Icd',text:'身份证号'},
				{value:'bankno',text:'银行卡号'},
				{value:'positiveInteger',text:'正整数'},
				{value:'negative',text:'负数合法'},
				{value:'min=0',text:'大于等于0'},
				{value:'positive',text:'正数'},
				{value:'nonnegativeInteger',text:'非负整数'},
				{value:'integer',text:'整数'},
			],
			moreRules:true,
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		select:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:true,
			changeHandlerData:true,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		radio:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:true,
			changeHandlerData:true,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		checkbox:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:true,
			changeHandlerData:true,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		date:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		hidden:{
            // 表单基本配置
			label:true,
			rules:false,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:false,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		textarea:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'},
				{value:'number',text:'数字'},
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		'select-dict':{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:true,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		'select2-dict':{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:true,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		'radio-dict':{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:true,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		'checkbox-dict':{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:true,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		switch:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:true,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
        },
        provinceselect:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:false,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
        map:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
        dateRangePicker:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
        treeSelect:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:true,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
        valuesInput:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:true,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
        upload:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
        timeUnit:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:false,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
        uploadImage:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'}
			],
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
        adderSubtracter:{
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'},
				{value:'ismobile',text:'手机号'},
				{value:'isphone',text:'固定电话'},
				{value:'postalcode',text:'邮政编码'},
				{value:'Icd',text:'身份证号'},
				{value:'bankno',text:'银行卡号'},
				{value:'positiveInteger',text:'正整数'},
				{value:'negative',text:'负数合法'},
				{value:'min=0',text:'大于等于0'},
				{value:'positive',text:'正数'},
				{value:'nonnegativeInteger',text:'非负整数'},
				{value:'integer',text:'整数'},
			],
			moreRules:true,
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:false,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
		cubesInput: {
            // 表单基本配置
			rules:[
				{value:'required',text:'必填'},
			],
			moreRules:false,
			label:true,
            // tab页配置
			base:true,
			listData:false,
			changeHandlerData:false,
			other:true,
			showType:true,
            columnFormat:true,
            footer:true,
            viewConfig:true,
		},
	}
	// type下拉 内容
	var variableType = {
		string:['text','number','select','radio','checkbox','radio-dict','select-dict','checkbox-dict','business','date','textarea','hidden','provinceselect','map','businessSelect','valuesInput','treeSelect','upload','timeUnit','uploadImage','adderSubtracter'],
		date:['date', 'dateRangePicker','hidden'],
		number:['text','number','select','radio','checkbox','radio-dict','select-dict','checkbox-dict','business','hidden','provinceselect','businessSelect','valuesInput','treeSelect','timeUnit','adderSubtracter'],
		boolean:['text','number','select','radio','checkbox','radio-dict','select-dict','checkbox-dict','hidden'],
		other:['label','title','html','note','hr','br'],
	}
	// 其它面板 表单显示内容
	var formConfig = {
        // 组件其它配置
		select:['textField','valueField','contentType','relationField','outputFields','total','isObjectValue','listExpression','panelConfig','selectMode','isPreloadData'],
		radio:['isHasClose','textField','valueField','relationField','outputFields','total','isObjectValue','contentType','searchMode','searchName'],
		checkbox:['textField','valueField','relationField','outputFields','total','isObjectValue','searchMode','searchName'],
		date:['isDefaultDate','format','fieldStart','fieldEnd','ranges'],
		textarea:['height','total','isUseUEditor','model'],
		'select-dict':['dictArguments','textField','valueField','relationField','outputFields','total','isObjectValue','selectMode'],
		'radio-dict':['dictArguments','textField','valueField','isHasClose','relationField','outputFields','total','isObjectValue'],
		'checkbox-dict':['dictArguments','textField','valueField','relationField','outputFields','total','isObjectValue'],
		text:['value','total','remoteAjax'],
		number:['value','total','decimalDigit'],
        business:['dialogTitle','infoBtnName','selectMode','idField','textField','voField','relationField','defaultSearchData','parameterFormat','validateParams','outputFields','innerFields','assignExpres','source-ajax','search-ajax','getRowData-ajax','getFormData-ajax','subdataAjax-ajax'],
        businessSelect:['selectMode','idField','textField','voField','relationField','listExpression','panelConfig','defaultSearchData','outputFields','innerFields','assignExpres','source-ajax','getRowData-ajax','getFormData-ajax'],
		provinceselect:['',''],
		map : ['mapType','subFields-code','subFields-longitude','subFields-latitude'],
		dateRangePicker : ['ranges','isDefaultDate','format','fieldStart','fieldEnd'],
		treeSelect : ['textField','valueField','fullnameField','contentType','children','parentId','level','isMultiple','outputFields','isTurnTree'],
		valuesInput : ['format'],
		upload : ['textField','valueField','isMultiple','accept','urlField','thumUrlField','isShowThum','fileTypeField','btns'],
		uploadImage : ['textField','valueField','isMultiple','fileTypeField'],
		cubesInput : ['getAjax-ajax','saveAjax-ajax'],
        // 表单配置
		ajax:['url','method','dataSrc','data','contentType'],
		form:['disabled','form-width','inputWidth','form-hidden','isDistinct','distinctField','valueExpression','setValueExpression'],
        // 表格配置
        table:['editable','table-width','fieldLength','table-hidden','orderable','searchable','total','tooltip','rowColor','isDefaultSubdataText','isTreeNode'],
        columnFormat:['columnFormat-type','columnFormat-format','places','symbol','thousand','decimal','url','title','readonly','field','parameterFormat','templateName','totalSymbol'],
        footer:['footer-type', 'footer-content'],
        viewConfig:['viewConfig-type','url','method','dataSrc','data'],
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
							+'<div class="component-editor-body" id="'+this.panelId+'">'
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
                        config.saveJson.editBtnName = 'edit2';
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
			$('#'+this.panelId).append($preview);
			var saveData = $.extend(true,{},_saveData);
			function formatFormUrlInPreview(parAarr){
				for(var index=0;index<parAarr.length;index++){
					if(saveData.form[parAarr[index]]){
						if(saveData.form[parAarr[index]].url){
							saveData.form[parAarr[index]].url = getRootPath() + saveData.form[parAarr[index]].url;
						}
						if(saveData.form[parAarr[index]].suffix){
							saveData.form[parAarr[index]].url = getRootPath() + saveData.form[parAarr[index]].suffix;
						}
					}
				}
			}
			if(saveData.form){
				if(saveData.form.url){
					saveData.form.url = getRootPath() + saveData.form.url;
				}
				var attrUrlArr = ['selectConfig','saveAjax','personAjax','groupAjax','source','search','subdataAjax','getRowData','getFormData','getAjax','saveAjax'];
				formatFormUrlInPreview(attrUrlArr); // 格式化url
			}
			switch(saveData.displayType){
				case 'form':
					var formJson = this.formJson;
					formJson.id = this.previewId+'-form';
					formJson.form = [saveData.form];
					// formPlane.formInit(formJson);
					var componentConfig = NetstarComponent.formComponent.getFormConfig(formJson);
                    NetstarComponent.formComponent.init(componentConfig, formJson);
					break;
				case 'all':
					var formJson = this.formJson;
					formJson.id = this.previewId+'-form'
					formJson.form = [saveData.form]
					var componentConfig = NetstarComponent.formComponent.getFormConfig(formJson);
                    NetstarComponent.formComponent.init(componentConfig, formJson);
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
					return $('<div id="'+container.basePanelId+'"></div>')
				}
			},{
				id:'listData',
				name:'列表数据',
				container:function(){
					return $('<div id="'+container.listDataPanelId+'"></div>')
				}
			},{
				id:'changeHandlerData',
				name:'关联操作',
				container:function(){
					return $('<div id="'+container.changeHandlerDataPanelId+'"></div>')
				}
			},{
				id:'showType',
				name:'显示形式',
				container:function(){
					return $('<div id="'+container.showTypePanelId+'"></div>')
				}
			},{
				id:'columnFormat',
				name:'列类型',
				container:function(){
					return $('<div id="'+container.columnFormatPanelId+'"></div>')
				}
			},{
				id:'footer',
				name:'footer',
				container:function(){
					return $('<div id="'+container.footerPanelId+'"></div>')
				}
			},{
				id:'viewConfig',
				name:'表格显示组件',
				container:function(){
					return $('<div id="'+container.viewConfigPanelId+'"></div>')
				}
			},{
				id:'other',
				name:'其他',
				container:function(){
					return $('<div id="'+container.otherPanelId+'"></div>')
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
		refreshEditorPanel:function(id){
			var idArr = id.split('-');
			var tabName = idArr[idArr.length-1];
			for(index=0;index<this.tabs.length;index++){
				if(this.tabs[index].id == tabName){
					this.clearPreview();// 移除预览
					$('#'+this.contentName).remove();								// 移除正在显示的 编辑内容
					this.contentName = this.tabs[index].container().attr('id');		// 修改contentName，当前编辑内容 id
					this.$container = this.tabs[index].container();					// 选择当前编辑内容的容器
					$('#'+this.panelId).append(this.$container);				// 插入当前编辑容器
					this.visibleEditorPanelByType(tabName);							// 插入当前编辑容器面板
					break;
				}
			}
		},
		// 根据（base，changeHandlerData，showType，other，listData）初始化编辑面板内容
		visibleEditorPanelByType:function(tabName){
			switch(tabName){
				case 'base':
					basePanel.init(this.basePanelId);
					break;
				case 'listData':
					switch(config.data.type){
						case 'typeaheadtemplate':
						case 'organiza-select':
						case 'person-select':
						case 'tableForm':
						case 'treeSelect':
							config.isOnlyAjax = true;
							config.data.isUseAjax = true;
							break;
						default:
							config.isOnlyAjax = false;
							break;
					}
					listDataPanel.init(this.listDataPanelId);
					break;
				case 'changeHandlerData':
					changeHandlerDataPanel.init(this.changeHandlerDataPanelId);
					break;
				case 'showType':
					showTypePanel.init(this.showTypePanelId);
					break;
				case 'columnFormat':
                case 'footer':
                case 'viewConfig':
                    commonTabPanel.init(this[tabName+'PanelId'], tabName);
					break;
                case 'other':
                    otherPanel.init(this.otherPanelId);
                    break;
			}
		},
		// 绑定 tabs 点击事件
		tabsOnClick:function($tabsListHtml){
			$tabsListHtml.on('click',function(){
				var id = $(this).attr('id');
				lightTab(id); 							// 点亮点击菜单
				container.saveData(); 					// 保存当前编辑面板内容
				container.refreshEditorPanel(id);		// 根据 点亮菜单id 刷新 编辑内容面板
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
                case 'columnFormat':
                case 'footer':
                case 'viewConfig':
                    this.saveCommonPanelData(conName);
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
			var listSaveCon = listDataPanel.contentName;
			var listSaveConArr = listSaveCon.split('-');
			var listSaveName = listSaveConArr[listSaveConArr.length-1];
			switch(listSaveName){
				case 'subdata':
					config.data.isUseAjax = false;
					var tableData = baseDataTable.allTableData(subdataPanel.tableId,'valueField');
					config.data.subdata = tableData;
					break;
				case 'ajax':
					config.data.isUseAjax = true;
					var formData = nsForm.getFormJSON(ajaxPanel.formJson.id);
					config.data.ajax = formData;
					break;
			}
		},
		// 保存 显示类型 数据
		saveShowTypeData:function(){
			var showTypeSaveCon = showTypePanel.contentName;
			var showTypeSaveConArr = showTypeSaveCon.split('-');
			var showTypeSaveName = showTypeSaveConArr[showTypeSaveConArr.length-1];
			var saveFormData = nsForm.getFormJSON(showTypeSaveCon);
			config.data[showTypeSaveName] = saveFormData;
			config.data.displayType = showTypeSaveName;
		},
		// 保存 其他 数据
		saveOtherData:function(){
			var otherFormData = nsForm.getFormJSON(this.otherPanelId);
			config.data.other = otherFormData;
        },
        // 保存 通用面板数据
        saveCommonPanelData:function(name){
            // name 面板名字 columnFormat/viewConfig/footer
            var commonFormData = nsForm.getFormJSON(this[name + 'PanelId']);
			config.data[name] = commonFormData;
        },
		// 刷新tabs 和 编辑面板
		refreshTabsAndEditPanel:function(){
			$('#'+this.tabsId).children().remove();
			$('#'+this.panelId).children().remove();
			this.$tabsListHtml = this.returnTabsObj();								// 获得 tabs 的 jQuery 对象
			$('#'+this.tabsId).append(this.$tabsListHtml);							// 插入编辑器tabs
			this.$container = this.tabs[0].container();								// 默认显示基本编辑面板
			$('#'+this.panelId).append(this.$container);						    // 插入基本编辑面板容器
			basePanel.init(this.basePanelId);									    // 初始化基本编辑面板
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
			this.panelId = config.formatConfig.id + '-panel'; //配置面板的id
			this.previewId = config.formatConfig.id + '-panel-preview'; //预览的id
			this.basePanelId = config.formatConfig.id + '-panel-base'; //基本配置的id
			this.listDataPanelId = config.formatConfig.id + '-panel-listData'; //列表数据的id
			this.changeHandlerDataPanelId = config.formatConfig.id + '-panel-changeHandlerData'; //关联操作的id
			this.showTypePanelId = config.formatConfig.id + '-panel-showType'; //显示形式的id
			this.otherPanelId = config.formatConfig.id + '-panel-other'; //其他的id
			this.columnFormatPanelId = config.formatConfig.id + '-panel-columnFormat'; //columnFormat
			this.footerPanelId = config.formatConfig.id + '-panel-footer'; //footer
			this.viewConfigPanelId = config.formatConfig.id + '-panel-viewConfig'; //viewConfig

			this.contentName = this.basePanelId; //正在配置的面板 默认基本配置

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
			$('#'+this.panelId).append(this.$container);						// 插入基本编辑面板容器
			basePanel.init(this.basePanelId);									// 初始化基本编辑面板
			if(config.formatConfig.type == 'dialog'){
				this.initStyle();
			}
		}
	}
	// 基本编辑面板
	var basePanel = {
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
				// if(help[variableType[typeSelectListName][index]]){
				// 	text += ' '+help[variableType[typeSelectListName][index]];
				// }
				switch(text){
					case 'uploadImage':
					case 'adderSubtracter':
						text += ' mobile';
						break;
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
									container.refreshTabsAndEditPanel();
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
									container.refreshTabsAndEditPanel();
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
			if(config.system.moreRules){
				baseFormArr.push({
					id: 		'moreRules',
					label: 		'moreRules',
					type: 		'textarea',
					column: 	12,
				})
				this.baseConfigData.moreRules = config.data.moreRules;
			}

			if(config.system.label){
				baseFormArr.push($.extend(true,{},getTypeData['label']));
				this.baseConfigData.label = config.data.label;
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
			formJson.helpConfig = helpConfig;
			formPlane.formInit(formJson);
		}
	}
	// 列表数据编辑面板
	var listDataPanel = {
		// 返回 编辑内容的容器
		returnContentObj:function(){
			return $('<div id="'+this.contentId+'"></div>')
		},
		// 列表数据 tabs 显示列表及绑定的编辑内容容器
		tabs:[
			{
				name:'subdata',
				container:function(){
					return $('<div id="'+listDataPanel.subdataContentId+'"></div>')
				}
			},{
				name:'ajax',
				container:function(){
					return $('<div id="'+listDataPanel.ajaxContentId+'"></div>')
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
		refreshListDataPanel:function(id){
			var idArr = id.split('-');
			var tabName = idArr[idArr.length-1];												// 显示类型
			for(index=0;index<this.tabs.length;index++){
				if(this.tabs[index].name == tabName){
					container.clearPreview();// 移除预览
					$('#'+this.contentId).children().remove(); 		// 清空容器
					this.$container = this.tabs[index].container();								// 获得要显示的面板容器
					$('#'+this.contentId).append(this.$container);		// 插入容器
					this.visibleEditorPanelByType(tabName);										// 插入当前编辑容器面板
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
				listDataPanel.saveData(); 					// 保存当前编辑面板内容
				listDataPanel.refreshListDataPanel(id);		// 根据 点亮菜单id 刷新 编辑内容面板
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
					var tableData = baseDataTable.allTableData(subdataPanel.tableId,'valueField');
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
		visibleEditorPanelByType:function(tabName){
			switch(tabName){
				case 'subdata':
					subdataPanel.init(this.subdataContentId);
					break;
				case 'ajax':
					ajaxPanel.init(this.ajaxContentId);
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
				ajaxPanel.init(this.ajaxContentId);
				this.contentName = this.ajaxContentId;
			}else{
				// subdata 面板 初始化
				this.$container = this.tabs[0].container();
				$('#'+this.contentId).append(this.$container);
				subdataPanel.init(this.subdataContentId);
				this.contentName = this.subdataContentId;
			}
			// 仅显示ajax 禁用 subdata
			if(config.isOnlyAjax){
				$('#'+this.subdataTab).css("pointer-events","none");
			}
		}
	}
	// 列表数据 的 subdata 面板
	var subdataPanel = {
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
				tableID:				subdataPanel.tableId,
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
									subdataPanel.editSelect(rowData);
								}
							},{
								"删除":function(rowData){
									nsConfirm("确认要删除吗？",function(isdelete){
										if(isdelete){
											var trObj = rowData.obj.closest('tr');
											baseDataTable.delRowData(subdataPanel.tableId,trObj);
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
							subdataPanel.addSelect();
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
				var dialogData = nsForm.getFormJSON("dialogPanel");
				if(dialogData){
					var tableData = baseDataTable.allTableData(subdataPanel.tableId,'valueField');
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
						baseDataTable.addTableRowData(subdataPanel.tableId,addData);
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
				var dialogData = nsForm.getFormJSON("dialogPanel");
				if(dialogData){
					var origalTableData = $.extend(true,{},rowDataJson);
					var rowIndexNumber = origalTableData.rowIndexNumber;
					var tableData = baseDataTable.allTableData(subdataPanel.tableId,'valueField');
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
			id: 	"dialogPanel",
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
	var ajaxPanel = {
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
			formJson.helpConfig = helpConfig;
			formPlane.formInit(formJson);
		}
	}
	// changeHandlerData 编辑面板
	var changeHandlerDataPanel = {
		// 列表数据 tabs 显示列表及绑定的编辑内容容器
		tabs:[
			{
				name:'readonly',
				container:function(){
				  return changeHandlerDataPanel.changeHandlerTable('readonly');
				}
			},{
				name:'hidden',
				container:function(){
				  return changeHandlerDataPanel.changeHandlerTable('hidden');
				}
			},{
				name:'disabled',
				container:function(){
				  return changeHandlerDataPanel.changeHandlerTable('disabled');
				}
			},{
				name:'value',
				container:function(){
				  return changeHandlerDataPanel.changeHandlerTable('value');
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
				changeHandlerDataPanel.refreshTable(id);
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
					if(className == changeHandlerDataPanel.otherClassName){
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
					switch(changeHandlerDataPanel.addPosition){
						case 'readonly':
						case 'hidden':
						case 'disabled':
							changeHandlerDataPanel.addChangeHandlerData();
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
					nsForm.edit([editObj],'dialogPanel');
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
					nsForm.edit([editObj],'dialogPanel');
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
				changeHandlerDataPanel.addAndEditData('add');
			};
			dialogObject.isMoreDialog = config.isMoreDialog;
			nsdialog.initShow(dialogObject);
		},
		// 弹框配置
		dialogObject:{
			id: 	"dialogPanel",
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
			var dialogData = nsForm.getFormJSON("dialogPanel");
			if(dialogData){
				var className = '';
				if(dialogData.className.length>0){
					className = dialogData.className;
				}else{
					if(dialogData.className2==1){
						className = changeHandlerDataPanel.otherClassName;
					}
				}
				if(className == ''){
					nsAlert('没有填写：值/其它','error');
					return false;
				}
				// 恢复默认状态可以选择typeName为空其他不可以
				if(className != changeHandlerDataPanel.otherClassName){
					if(dialogData.typeName==''){
						nsAlert('没有选择changHandler/选择字段','error');
						return false;
					}
				}
				if(type=='add'){
					if(typeof(config.data.changeHandlerData[changeHandlerDataPanel.addPosition][className])=='object'){
						nsAlert('值重复','error');
						return false;
					}
				}else{
					if(className!=rowData.className){
						if(typeof(config.data.changeHandlerData[changeHandlerDataPanel.addPosition][className])=='object'){
							nsAlert('值重复','error');
							return false;
						}else{
							delete config.data.changeHandlerData[changeHandlerDataPanel.addPosition][rowData.className];
						}
					}
				}
				config.data.changeHandlerData[changeHandlerDataPanel.addPosition][className] = {};
				var changeHandlerDataClassName = config.data.changeHandlerData[changeHandlerDataPanel.addPosition][className];
				for(index=0;index<dialogData.typeName.length;index++){
					changeHandlerDataClassName[dialogData.typeName[index]] = true;
				}
				var voAllFieldsIdObj = config.voAllFieldsIdObj;
				for(var fieldId in voAllFieldsIdObj){
					if(!changeHandlerDataClassName[fieldId]){
						changeHandlerDataClassName[fieldId] = false;
					}
				}
				changeHandlerDataPanel.refreshTable(changeHandlerDataPanel.addPosition);
				if(config.isMoreDialog){
					nsdialogMore.hide();
				}else{
					nsdialog.hide();
				}
			}
		},
		// 新增 方法
		addBtnfun:function(){
			var dialogData = nsForm.getFormJSON("dialogPanel");
			if(dialogData){
				if(typeof(config.data.changeHandlerData[changeHandlerDataPanel.addPosition][dialogData.className])=='object'){
					nsAlert('值重复','error');
					return false;
				}
				// 恢复默认状态可以选择typeName为空其他不可以
				if(dialogData.className != changeHandlerDataPanel.otherClassName){
					if(dialogData.typeName==''){
						nsAlert('没有选择changHandler/选择字段','error');
						return false;
					}
				}
				config.data.changeHandlerData[changeHandlerDataPanel.addPosition][dialogData.className] = {};
				var changeHandlerDataClassName = config.data.changeHandlerData[changeHandlerDataPanel.addPosition][dialogData.className];
				for(index=0;index<dialogData.typeName.length;index++){
					changeHandlerDataClassName[dialogData.typeName[index]] = true;
				}
				var voAllFieldsIdObj = config.voAllFieldsIdObj;
				for(var fieldId in voAllFieldsIdObj){
					if(!changeHandlerDataClassName[fieldId]){
						changeHandlerDataClassName[fieldId] = false;
					}
				}
				changeHandlerDataPanel.refreshTable(changeHandlerDataPanel.addPosition);
				if(config.isMoreDialog){
					nsdialogMore.hide();
				}else{
					nsdialog.hide();
				}
			}
		},
		// 修改 方法
		editBtnfun:function(rowData){
			var dialogData = nsForm.getFormJSON("dialogPanel");
			if(dialogData){
				if(dialogData.className!=rowData.className){
					if(typeof(config.data.changeHandlerData[changeHandlerDataPanel.addPosition][dialogData.className])=='object'){
						nsAlert('值重复','error');
						return false;
					}else{
						delete config.data.changeHandlerData[changeHandlerDataPanel.addPosition][rowData.className];
					}
				}
				// 恢复默认状态可以选择typeName为空其他不可以
				if(dialogData.className != changeHandlerDataPanel.otherClassName){
					if(dialogData.typeName==''){
						nsAlert('没有选择changHandler/选择字段','error');
						return false;
					}
				}
				config.data.changeHandlerData[changeHandlerDataPanel.addPosition][dialogData.className] = {};
				var changeHandlerDataClassName = config.data.changeHandlerData[changeHandlerDataPanel.addPosition][dialogData.className];
				for(index=0;index<dialogData.typeName.length;index++){
					changeHandlerDataClassName[dialogData.typeName[index]] = true;
				}
				var voAllFieldsIdObj = config.voAllFieldsIdObj;
				for(var fieldId in voAllFieldsIdObj){
					if(!changeHandlerDataClassName[fieldId]){
						changeHandlerDataClassName[fieldId] = false;
					}
				}
				changeHandlerDataPanel.refreshTable(changeHandlerDataPanel.addPosition);
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
			if(rowData.className == changeHandlerDataPanel.otherClassName){
				addArr[0].hidden = true;
				addArr[1].value = changeHandlerDataPanel.otherClassName;
			}else{
				addArr[0].value = rowData.className;
				addArr[1].hidden = true;
			}
			var dialogObject = this.dialogObject;
			dialogObject.form = addArr;
			dialogObject.btns[0].handler = function(){
				// changeHandlerDataPanel.editBtnfun(rowData);
				changeHandlerDataPanel.addAndEditData('edit',rowData);
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
						changeHandlerDataPanel.editChangeHandlerData(lineData);
					}
					if($thisClassI.hasClass('fa-trash')){
						changeHandlerDataPanel.deleteChangeHandlerData(lineData);
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
					delete config.data.changeHandlerData[changeHandlerDataPanel.addPosition][rowData.className];
					changeHandlerDataPanel.refreshTable(changeHandlerDataPanel.addPosition);
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
	var showTypePanel = {
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
					return $('<div id="'+showTypePanel.contentId+'-all"></div>');
				}
			},{
				name:'form',
				container:function(){
					return $('<div id="'+showTypePanel.contentId+'-form"></div>');
				}
			},{
				name:'table',
				container:function(){
					return $('<div id="'+showTypePanel.contentId+'-table"></div>');
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
				showTypePanel.saveData();
				showTypePanel.refreshForm(id);
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
                showArr.splice(0, 0, 'form-element');
                showArr.push('table-element');
				for(index=0;index<tableArr.length;index++){
					showArr.push(tableArr[index]);
				}
			}else{
				var showArr = formConfig[tabName];
			}
			var showFormArr = [];
			for(index=0;index<showArr.length;index++){
                var obj = $.extend(true,{},getTypeData[showArr[index]]);
				showFormArr.push(obj);
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
		// 显示表单内容
		showForm:function(tabName){
			var formID = this.contentId + '-'+ tabName;
			this.formJson.id = formID;
			var formJson = this.formJson;
			formJson.form = this.getShowFormArr(tabName);
			formJson.helpConfig = helpConfig;
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
	var otherPanel = {
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
				var otherObj = $.extend(true,{},getTypeData[otherArr[index]]);
                otherFormArr.push(otherObj);
                // 添加source-ajax/search-ajax/subdataAjax-ajax的ajax配置
                if(otherArr[index].indexOf('-')>0){
                    var strArr = otherArr[index].split('-');
                    var str1 = strArr[0];
                    var str2 = strArr[1];
                    if(str2 == "ajax"){
                        var ajaxArr = formConfig.ajax;
                        for(var ajaxI=0;ajaxI<ajaxArr.length;ajaxI++){
                            var ajaxObj = $.extend(true,{},getTypeData[ajaxArr[ajaxI]]);
                            ajaxObj.id = str1 + '-' + ajaxObj.id;
                            otherFormArr.push(ajaxObj);
                        }
                    }
                }
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
			for(var i=0; i<formJson.form.length; i++){
				if(formJson.form[i].id == "parameterFormat"){
					formJson.form[i].hidden = false;
				}
			}
			formJson.helpConfig = helpConfig;
			formPlane.formInit(formJson);
		}
    }
    // 通用tab页的配置面板
    var commonTabPanel = {
        formJson:{
			id:  		'',
			size: 		"standard",
			format: 	"standard",
			fillbg: 	true, 
		},
		// 通用编辑面板显示的表单数组 根据type获取显示字段
		formArr:function(type){
			var arr = formConfig[type];
            var formArr = [];
			for(index=0;index<arr.length;index++){
                var obj = $.extend(true,{},getTypeData[arr[index]]);
                switch(arr[index]){
					case 'columnFormat-type':
                        obj.changeHandler = function(value){
							var $this = $(this);
							var thisId = $this[0].fullID;
							var formId = thisId.substring(thisId.indexOf('-')+1,thisId.lastIndexOf('-'));
							commonTabPanel.isHideColumnTypeData(value, formId, 'format');
						}
						break;
					case 'columnFormat-format':
						// if(config.data[type].format){
						// 	obj.hidden = false;
						// }
						if(	config.data[type].type == 'columnState' ||
							config.data[type].type == 'href' ||
							config.data[type].type == 'input' ||
							// config.data[type].type == 'upload' ||
							config.data[type].type == 'renderField' ||
							config.data[type].type == 'dictionary' ||
							config.data[type].type == 'datetime' ||
							config.data[type].type == 'multithumb'
						  ){
							obj.hidden = false;
						}
						break;
					case 'footer-type':
						obj.changeHandler = function(value){
							var $this = $(this);
							var thisId = $this[0].fullID;
							var formId = thisId.substring(thisId.indexOf('-')+1,thisId.lastIndexOf('-'));
							commonTabPanel.setFooterHide(value, formId, 'content');
						}
						break;
					case 'footer-content':
						obj.hidden = true;
						if(type === 'footer'){
							if(config.data[type] && config.data[type].type == 'expression'){
								obj.hidden = false;
							}
						}
						break;
					case 'symbol':
					case 'decimal':
					case 'totalSymbol':
						if(config.data[type].type == 'money'){
							obj.hidden = false;
						}
						break;
					case 'places':
					case 'thousand':
						if(	config.data[type].type == 'number' ||
							config.data[type].type == 'money'
						){
							obj.hidden = false;
						}
						break;
					case 'url':
					case 'readonly':
					case 'title':
					case 'parameterFormat':
					case 'field':
					case 'templateName':
						if(config.data[type].type == 'href'){
							obj.hidden = false;
						}else{
							obj.hidden = true;
						}
						break;

                }
                formArr.push(obj);
			}
			if(config.data[type]){
				for(index=0;index<formArr.length;index++){
					if(config.data[type][formArr[index].id]){
                        formArr[index].value = config.data[type][formArr[index].id];
					}
				}
			}
			return formArr;
		},
		// footer表单显示隐藏
		setFooterHide : function(typeValue, formID, componentId){
			var isHide = true;
			switch(typeValue){
				case 'expression':
					isHide = false;
					break;
			}
			var editArr = [
				{
					id : componentId,
					hidden : isHide,
					value : '',
				}
			];
			nsForm.edit(editArr, formID);
		},
		// 是否显示列数据状态配置
		isHideColumnTypeData:function(columnFormat, formID, componentId){
			var dataHidden = true;
			var dataValue = '';
			var hideObj = {
				places : true,
				symbol : true,
				thousand : true,
				decimal : true,
				totalSymbol : true,
				title : true,
				url : true,
				readonly : true,
				field : true,
				parameterFormat : true,
				templateName : true,
			}
			var valueObj = {
				places : '',
				symbol : '',
				thousand : '',
				decimal : '',
				totalSymbol : '',
				title : '',
				url : '',
				readonly : 'false',
				field : '',
				parameterFormat : '',
				templateName : '',
			}
			// var textHidden = true;
			// var textValue = '';
			function showById(_showArr){
				for(var i=0; i<_showArr.length; i++){
					hideObj[_showArr[i]] = false;
				}
			}
			switch(columnFormat){
				case 'columnState':
					dataHidden = false;
					dataValue = '{}';
					break;
				case 'href':
					var showArr = ['url','title','readonly','field','parameterFormat','templateName'];
					showById(showArr);
					break;
				case 'input':
					dataHidden = false;
					dataValue = '[{value:"aa",handler:function(obj){console.log("带btn的input");console.log(obj)},type:"enter",btns:[{text:"更多",handler:function(obj){console.log("更多");console.log(obj)}}]}]';
					break;
				case 'upload':
					// dataHidden = false;
					// dataHidden = false;
					// dataValue = '{}';
					break;
				case 'multithumb':
				case 'renderField':
				case 'dictionary':
				case 'datetime':
					dataHidden = false;
					dataValue = '';
					break;
				case 'money':
					var showArr = ['places','symbol','thousand','decimal', 'totalSymbol'];
					showById(showArr);
					valueObj.places = '2';
					valueObj.symbol = '￥';
					valueObj.thousand = ',';
					valueObj.decimal = '.';
					valueObj.totalSymbol = '';
					break;
				case 'number':
					var showArr = ['places','thousand'];
					showById(showArr);
					valueObj.places = '2';
					valueObj.thousand = ',';
					break;
				default:
					break;
			}
			var columnFormatDataObj = {
				id:     	componentId,
				hidden:   	dataHidden,
				value: 		dataValue,
			}
			if(columnFormat == 'columnState'){
				columnFormatDataObj.height = 50;
			}
			var editArr = [columnFormatDataObj];
			for(var key in hideObj){
				var comObj = {
					id:     	key,
					hidden:   	hideObj[key],
					value: 		valueObj[key],
				};
				editArr.push(comObj);
			}
			nsForm.edit(editArr,formID)
		},
		// 初始化其它编辑面板
		init:function(containerId, type){
			this.formJson.id = containerId;
			this.show(type);
		},
		show:function(type){
			var formJson = $.extend(true, {}, this.formJson);
			formJson.form = this.formArr(type);
			formJson.helpConfig = helpConfig;
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
			columnFormat:{},
			footer:{},
			viewConfig:{},
			className : '',
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
			columnFormat:_baseData.columnFormat,
			footer:_baseData.footer,
			viewConfig:_baseData.viewConfig,
			moreRules:_baseData.moreRules,
			className: _baseData.className,
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
			id: sourceData.englishName,
			englishName: sourceData.englishName,
			chineseName: sourceData.chineseName,
			variableType: sourceData.variableType,
			javaDataType: sourceData.javaDataType,
			mindjetType: sourceData.type,
			isSet: '是',
			displayType: sourceData.displayType,
			gid: sourceData.gid,
			voName: sourceData.voName,
			className: sourceData.className,
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
        // 此处没用
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
		if(system.rules){
			filterAttrData.rules = sourceData.rules;
		}
		if(system.moreRules){
			filterAttrData.moreRules = sourceData.moreRules;
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
		if(system.columnFormat){
			filterAttrData.columnFormat = sourceData.columnFormat;
		}
		if(system.footer){
			filterAttrData.footer = sourceData.footer;
		}
		if(system.viewConfig){
			filterAttrData.viewConfig = sourceData.viewConfig;
		}
		var formatData = {
				displayType:filterAttrData.displayType,
				type:filterAttrData.type,
			};
		switch(formatData.displayType){
			case 'all':
				var formShow = formConfig.form;//表单独有的
				var formObj = getFormConfig(filterAttrData);
				formatData.form = getVisibleObj(formObj,formShow,sourceData[sourceData.displayType]);
				setFormObj(formatData.form);
				var tableShow = formConfig.table;//表格独有的
				var tableObj = getTableConfig(filterAttrData, formatData.form);
				formatData.table = getVisibleObj(tableObj,tableShow,sourceData[sourceData.displayType]);
				setTableObj(formatData.table,filterAttrData);
				break;
			case 'form':
				var formShow = formConfig.form;
				var formObj = getFormConfig(filterAttrData);
				formatData.form = getVisibleObj(formObj,formShow,sourceData[sourceData.displayType]);
				setFormObj(formatData.form);
				break;
            case 'table':
				var formShow = formConfig.form;
				var formObj = getFormConfig(filterAttrData);
				editConfig = getVisibleObj(formObj,formShow,sourceData[sourceData.displayType]);
				setFormObj(editConfig);
				var tableShow = formConfig.table;
				var tableObj = getTableConfig(filterAttrData, editConfig);
				formatData.table = getVisibleObj(tableObj,tableShow,sourceData[sourceData.displayType]);
                setTableObj(formatData.table,filterAttrData);
				break;
        }
        // console.log(formatData);
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
                var keyStr = addArr[index];
                // 查询正确的key值
                if(keyStr.indexOf('-')>0){
                    var keyArr = keyStr.split('-');
                    var typeStr = keyArr[0];
                    var valStr = keyArr[1];
                    if(typeStr == 'form'||typeStr == 'table'){
                        keyStr = valStr;
                    }
                }
				sourceObj[keyStr] = addObj[addArr[index]];
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
			case 'text':
			case 'number':
			case 'adderSubtracter':
				if(obj.moreRules && obj.moreRules.length > 0){
					obj.rules += ',' + obj.moreRules;
				}
				break;
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
				case 'inputWidth':
				case 'maximumItem':
				case 'pageLengthMenu':
				case 'isAllowFiles':
				case 'decimalDigit':
				case 'level':
					if(obj[fieldName] != ''&&typeof(obj[fieldName])!='number'){
						obj[fieldName] = parseInt(obj[fieldName]);
					}
					if(isNaN(obj[fieldName])){
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
				case 'hidden':
				case 'disabled':
				case 'isDistinct':
				case 'isObjectValue':
				case 'ranges':
				case 'isMultiple':
				case 'isUseUEditor':
				case 'isTreeNode':
				case 'isTurnTree':
				case 'isPreloadData':
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
				case 'outputFields':
				case 'defaultSearchData':
				case 'panelConfig':
				case 'assignExpres':
				case 'innerFields':
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
                case 'source-url':
                case 'source-dataSrc':
                case 'source-method':
                case 'source-data':
                case 'source-contentType':
                case 'search-url':
                case 'search-dataSrc':
                case 'search-method':
                case 'search-data':
                case 'search-contentType':
                case 'subdataAjax-url':
                case 'subdataAjax-dataSrc':
                case 'subdataAjax-method':
                case 'subdataAjax-data':
                case 'subdataAjax-contentType':
                case 'getRowData-url':
                case 'getRowData-dataSrc':
                case 'getRowData-method':
                case 'getRowData-data':
                case 'getRowData-contentType':
                case 'getFormData-url':
                case 'getFormData-dataSrc':
                case 'getFormData-method':
                case 'getFormData-data':
                case 'getFormData-contentType':
                case 'subFields-code':
                case 'subFields-longitude':
                case 'subFields-latitude':

				case 'getAjax-url':
				case 'getAjax-dataSrc':
				case 'getAjax-method':
				case 'getAjax-data':
				case 'getAjax-contentType':

				case 'saveAjax-url':
				case 'saveAjax-dataSrc':
				case 'saveAjax-method':
				case 'saveAjax-data':
				case 'saveAjax-contentType':
                    var fieldNameArr = fieldName.split('-');
                    var fieldName1 = fieldNameArr[0];
                    var fieldName2 = fieldNameArr[1];
                    if(typeof(obj[fieldName1])!="object"){
                        obj[fieldName1] = {};
                    }
                    if(fieldName2 == "method"){
                        fieldName2 = 'type';
					}
					switch(fieldName2){
						case "method":
							fieldName2 = 'type';
							break;
						case "data":
							if(fieldValue.length>0){
								fieldValue = JSON.parse(fieldValue);
							}
							break;
					}
                    obj[fieldName1][fieldName2] = fieldValue;
                    delete obj[fieldName];
                    break;
			}
		})
		// 验证url 如果地址是以http开头则认为是完整的否则分为是后缀 删除url加suffix
		validUrl(obj)
		// 删除对象中的空字符
		for(var key in obj){
			if(typeof(obj[key])=="object"){
				deleteEmptyString(obj[key]);
			}
		}
		// 删除空对象
		for(var key in obj){
			if(typeof(obj[key])=="object"&&$.isEmptyObject(obj[key])){
				delete obj[key];
			}else{
				switch(key){
					case 'getRowData':
					case 'getAjax':
					case 'saveAjax':
					case 'getFormData':
					case 'subdataAjax':
					case 'search':
					case 'source':
					case 'viewConfig':
						if(typeof(obj[key].suffix)!="string"&&typeof(obj[key].url)!="string"){
							delete obj[key];
						}
						break;
				}
			}
		}
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
				case 'editable':
				case 'isDefaultSubdataText':
				case 'isTreeNode':
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
		// 删除对象中的空字符
		for(var key in obj){
			if(typeof(obj[key])=="object"){
				deleteEmptyString(obj[key]);
			}
		}
		// 删除空对象
		for(var key in obj){
			if(typeof(obj[key])=="object"&&$.isEmptyObject(obj[key])){
				delete obj[key];
			}else{
				switch(key){
					case 'viewConfig':
						if(typeof(obj[key].suffix)!="string"&&typeof(obj[key].url)!="string"){
							delete obj[key];
						}
						break;
				}
			}
		}
        var columnFormatObj = obj.columnFormat;
        if($.isEmptyObject(columnFormatObj)){
            return;
        }
        var columnType = columnFormatObj.type;
        var columnFormat = columnFormatObj.format;
		//需要根据类型处理的column对象
		switch(columnType){
			case 'stringReplace':
				//格式化radio select
				if(souObj.type == "radio"||souObj.type == "checkbox"||souObj.type == "select"||souObj.type == 'switch'){
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
				}else{
					var errorStr = souObj.englishName + '配置的类型' + souObj.type + '不支持stringReplace（字符串替换）';
					nsAlert(errorStr,'error');
					console.error(errorStr);
					console.error(souObj);
					console.error(obj);
					delete obj.formatHandler;
				}
				break;
			case 'columnState':
				obj.formatHandler = $.extend(true,{},columnTypeData.columnState);
				obj.formatHandler.data = JSON.parse(columnFormat);
				break;
			case 'money':
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				obj.formatHandler.data = {};
				obj.formatHandler.data.format = {
					places : columnFormatObj.places,
					symbol : columnFormatObj.symbol,
					thousand : columnFormatObj.thousand,
					decimal : columnFormatObj.decimal,
					totalSymbol : columnFormatObj.totalSymbol,
				}
				// var columnFormat = Number(columnFormat);
				// if(!isNaN(columnFormat)){
				// 	var stringZero = '';
				// 	for(i=0;i<columnFormat;i++){
				// 		stringZero += "0";
				// 	}
				// 	obj.formatHandler.format = ",." + stringZero;
				// }else{
				// 	obj.formatHandler.format = ",.00"
				// }
				break;
			case 'number':
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				obj.formatHandler.data = {};
				obj.formatHandler.data.format = {
					places : columnFormatObj.places,
					thousand : columnFormatObj.thousand,
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
				// obj.width = 86;
				obj.width = 100;
			case 'datetime':
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				if(typeof(obj.isDefaultDate)!='undefined'){
					obj.formatHandler.data.isDefaultDate = obj.isDefaultDate;
				}
				if(columnFormat && columnFormat.length > 0){
					obj.formatHandler.data.formatDate = columnFormat;
				}else{
					if(columnType == 'datetime'){
						// obj.width = 134;
						obj.width = 150;
					}
				}
				break;
			case 'formatDate':
			// case 'dictionary':
			case 'thumb': // 缩略图
			case 'codeToName': // 省市区 code码转化成名字
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				break;
			case 'switch':
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				break;
			// case 'href':
			case 'input':
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				if(columnFormat.length>0){
					obj.formatHandler.data = eval(columnFormat);
				}
				break;
			case 'dictionary':
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				if(columnFormat && columnFormat.length > 0){
					obj.formatHandler.data = JSON.parse(columnFormat);
				}
				break;
			case 'href':
				// obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				// if(columnFormat.length>0){
				// 	obj.formatHandler.data = JSON.parse(columnFormat);
				// }
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				obj.formatHandler.data = {
					url : columnFormatObj.url,
					title : columnFormatObj.title,
					field : columnFormatObj.field,
					readonly : columnFormatObj.readonly === "true" ? true : false,
					parameterFormat : columnFormatObj.parameterFormat,
					templateName : columnFormatObj.templateName,
				}
				break;
			case 'upload':
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				// if(columnFormat.length>0){
				// 	obj.formatHandler.data = JSON.parse(columnFormat);
				// }
				break;
			case 'multithumb':// 多张缩略图
				obj.formatHandler = $.extend(true,{},columnTypeData[columnType]);
				obj.formatHandler.data.voName = typeof(columnFormat)=='string'?columnFormat:'';
				break;
			case 'renderField':
				obj.formatHandler = {
					type : columnType,
				};
				obj.formatHandler.data = typeof(columnFormat)=='string'?columnFormat:'';
				break;
			case 'cubesInput':
				obj.formatHandler = {
					type : columnType,
				};
				break;
			default:
				break;
		}
		if(typeof(columnType)=="string" && typeof(obj.formatHandler)=="object"){
			obj.columnType = columnType;
		}
        delete obj.columnFormat;
    }
    // 获取表单需要的配置参数
    function getFormConfig(_sourceObj){
        var formObj = {}
        for(var key in _sourceObj){
            if(key != 'columnFormat'&&key != 'footer'&&key != 'viewConfig'){
                formObj[key] = _sourceObj[key];
            }
        }
		return formObj;
    }
	// 获取表格需要的配置参数
	function getTableConfig(_sourceObj, editConfig){
		var tableObj = {
			englishName: _sourceObj.englishName, 			// 英文名
			chineseName: _sourceObj.chineseName,			// 中文名
			variableType: _sourceObj.variableType, 			// 原始js类型
			javaDataType: _sourceObj.javaDataType,			// 原始java类型
			field : _sourceObj.id,							// 表格列id
			title : _sourceObj.label,
			mindjetType : _sourceObj.mindjetType,
			isSet: _sourceObj.isSet,
			displayType: _sourceObj.displayType,
			gid: _sourceObj.gid,
            voName: _sourceObj.voName,
            columnFormat: _sourceObj.columnFormat,
            footer: _sourceObj.footer,
			viewConfig: _sourceObj.viewConfig,
			// columnType:_sourceObj.type,
		}
		if(tableObj.mindjetType == 'dict'){
			tableObj.dictArguments = _sourceObj.dictArguments;
		}
		if(typeof(_sourceObj.isDefaultDate)=='string'){
			tableObj.isDefaultDate = _sourceObj.isDefaultDate;
        }
        if(typeof(editConfig)=="object"){
            tableObj.editConfig = $.extend(true, {}, editConfig);
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
			type:'panel',
			containerId:'body',
			isAdd:false,//是否新增
			baseData:{},
			allData:{},
			column:6,
			isMoreDialog:false,
		}
		nsVals.setDefaultValues(config.formatConfig, defaultValue); //设置默认属性值
		if(!config.formatConfig.isAdd){
			// 修改字段
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
	function init(sourceObj){
        // 验证type类型 不存在的类型保存返回
        if(sourceObj.baseData&&sourceObj.baseData.type!=""&&typeof(componentTypeData[sourceObj.baseData.type]) == 'undefined'){
            nsAlert('该类型不存在，不可修改，请检查配置','error');
            return;
        }
		config = {};
		errorData = [];
		// 参数验证
		var formatConfig = parameterValidata(sourceObj);
		if(formatConfig){
			config.isMoreDialog = formatConfig.isMoreDialog;
			setDefault(formatConfig.baseData); 	//设置默认值（准备结构化数据）
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