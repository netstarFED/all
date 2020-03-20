var nsFuncEditor = (function($){
	var config = {};
	// 表单数组配置对象['englishName','chineseName','suffix','functionClass','dataSrc','type','dataFormat'];
	var getTypeData = {
		webSocketUrl:{
			id:'webSocketUrl',
			label:'webSocketUrl',
			type:'text',
			column:12,
		},
		valueField:{
			id:'valueField',
			label:'valueField',
			type:'text',
			column:12,
		},
		textField:{
			id:'textField',
			label:'textField',
			type:'text',
			column:12,
		},
		btnType:{
			id:'btnType',
			label:'btnType',
			type:'select',
			column:12,
			textField:'id',
			valueField:'name',
			subdata:[
				{
					id:'print',
					name:'print'
				},{
					id:'preview',
					name:'preview'
				},{
					id:'printAjax',
					name:'printAjax'
				},{
					id:'previewAjax',
					name:'previewAjax'
				},
			],
		},
		englishName:{
			id:'englishName',
			label:'英文名',
			type:'text',
			column:12,
			readonly:true,
			rules:'required',
		},
		chineseName:{
			id:'chineseName',
			label:'中文名',
			type:'text',
			column:12,
			readonly:true,
		},
		defaultMode:{
			id:'defaultMode',
			label:'defaultMode',
			type:'select',
			column:12,
			textField:'name',
			valueField:'id',
			// rules:'required',
			// value:'dialog',
			subdata:[
				{
					id:'dialog',
					name:'dialog',
				},
				{
					id:'valueDialog',
					name:'valueDialog',
				},
				{
					id:'confirm',
					name:'confirm',
				},
				{
					id:'toPage',
					name:'toPage',
				},
				{
					id:'changePage',
					name:'changePage',
				},
				{
					id:'ajaxDialog',
					name:'ajaxDialog',
				},
				{
					id:'templatePrint',
					name:'templatePrint',
				},
				{
					id:'loadPage',
					name:'loadPage',
				},
				{
					id:'component',
					name:'component',
				},
				{
					id:'editorDialog',
					name:'editorDialog',
				},
				{
					id:'addInfoDialog',
					name:'addInfoDialog',
				},
				{
					id:'newtab',
					name:'newtab',
				},
				{
					id:'viewerDialog',
					name:'viewerDialog',
				},
				{
					id:'custom',
					name:'custom',
				},
				{
					id:'tel',
					name:'tel',
				},
				{
					id:'email',
					name:'email',
				},
				{
					id:'successMessage',
					name:'successMessage',
				},
				{
					id:'excelImportVer2',
					name:'数据导入',
				},
			],
		},
		componentName:{
			id:'componentName',
			label:'componentName',
			type:'text',
			column:12,
			// rules:'required',
		},
		text:{
			id:'text',
			label:'text',
			type:'textarea',
			column:12,
			// rules:'required',
		},
		title:{
			id:'title',
			label:'title',
			type:'text',
			column:12,
			// rules:'required',
		},
		btntext:{
			id:'btntext',
			label:'btntext',
			type:'text',
			column:12,
			// rules:'required',
		},
		dataSrc:{
			id:'dataSrc',
			label:'dataSrc',
			type:'text',
			column:12,
			// rules:'required',
		},
		functionField:{
			id:'functionField',
			label:'展示字段',
			type:'select',
			column:12,
			textField:'chineseName',
			valueField:'englishName',
			// rules:'required',
		},
		suffix:{
			id:'suffix',
			label:'url',
			type:'text',
			column:12,
			rules:'required',
		},
		ajaxData:{
			id:'ajaxData',
			label:'ajaxData',
			type:'textarea',
			column:12,
		},
		functionClass:{
			id:'functionClass',
			label:'类名 modal/list',
			type:'select',
			column:12,
			textField:'name',
			valueField:'id',
			// rules:'required',
			value:'modal',
			subdata:[
				{
					id:'modal',
					name:'modal',
				},{
					id:'list',
					name:'list',
				}
			],
		},
		dataFormat:{
			id:'dataFormat',
			label:'dataFormat',
			type:'select',
			column:12,
			textField:'name',
			valueField:'id',
			// rules:'required',
			subdata:[
				{
					id:'id',
					name:'id',
				},{
					id:'ids',
					name:'ids',
				},{
					id:'childIds',
					name:'childIds',
				},{
					id:'object',
					name:'object',
				},{
					id:'onlyChildIds',
					name:'onlyChildIds',
				},{
					id:'normal',
					name:'normal',
				},{
					id:'list',
					name:'list',
				},{
					id:'custom',
					name:'custom',
				},{
					id:'volist',
					name:'volist',
				},
			],
		},
		type:{
			id:'type',
			label:'type',
			type:'select',
			column:12,
			textField:'name',
			valueField:'id',
			// rules:'required',
			subdata:[
				{
					id:'GET',
					name:'GET',
				},{
					id:'POST',
					name:'POST',
				},
			],
		},
		width:{
			id:'width',
			label:'width',
			type:'text',
			column:12,
		},
		height:{
			id:'height',
			label:'height',
			type:'text',
			column:12,
		},
		contentType:{
			id:'contentType',
			label:'contentType',
			type:'select',
			column:12,
			value:'application/x-www-form-urlencoded',
			textField:'name',
			valueField:'id',
			subdata:[
				{
					id:'application/x-www-form-urlencoded',
					name:'application/x-www-form-urlencoded',
				},{
					id:'application/json',
					name:'application/json',
				},
			]
		},
		voId:{
			id:'voId',
			label:'voId',
			type:'select',
			column:12,
			rules:'required',
			textField:'voName',
			valueField:'voId',
		},
		dataSrc:{
			id:'dataSrc',
			label:'dataSrc',
			type:'select',
			column:12,
			textField:'name',
			valueField:'id',
			subdata:[
				{
					id:'data',
					name:'data',
				},{
					id:'rows',
					name:'rows',
				},
			],
		},
		dataLevel:{
			id:'dataLevel',
			label:'dataLevel',
			type:'select',
			column:12,
			textField: 'name',
			valueField:'id',
			subdata: [
				{
					id:'parent',
					name:'parent'
				},{
					id:'child',
					name:'child'
				},{
					id:'brothers',
					name:'brothers'
				},{
					id:'onlyChildIds',
					name:'onlyChildIds'
				},{
					id:'id',
					name:'id'
				},{
					id:'ids',
					name:'ids'
				},{
					id:'brothers',
					name:'brothers'
				},{
					id:'none',
					name:'none'
				}
			],
		},
		isCloseWindow:{
			id:'isCloseWindow',
			label:'isCloseWindow',
			type:'radio',
			column:12,
			textField:'name',
			valueField:'id',
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
		callbackAjax:{
			id:'callbackAjax',
			label:'callbackAjax',
			type:'text',
			column:12,
		},
		requestSource:{
			id:'requestSource',
			label:'requestSource',
			type:'radio',
			column:12,
			textField:'name',
			valueField:'id',
			subdata:[
				{
					id:'selected',
					name:'selected',
				},{
					id:'checkbox',
					name:'checkbox',
				},{
					id:'thisVo',
					name:'thisVo',
				},{
					id:'none',
					name:'none',
				},
			],
		},
		editorType:{
			id:'editorType',
			label:'editorType',
			type:'checkbox',
			column:12,
			textField:'name',
			valueField:'id',
			subdata:[
				{
					id:'add',
					name:'新增',
				},{
					id:'copyAdd',
					name:'复制新增',
				},{
					id:'edit',
					name:'编辑',
				}
			],
		},
		isMainDbAction:{
			id:'isMainDbAction',
			label:'isMainDbAction',
			type:'radio',
			column:12,
			textField:'name',
			valueField:'id',
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
		keyField:{
			id:'keyField',
			label:'keyField',
			type:'text',
			column:12,
		},
		isAlwaysNewTab:{
			id:'isAlwaysNewTab',
			label:'是否用新TAB打开',
			type:'radio',
			column:12,
			textField:'name',
			valueField:'id',
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
		isSetMore:{
			id:'isSetMore',
			label:'是否设置更多',
			type:'radio',
			column:12,
			textField:'name',
			valueField:'id',
			value:"true",
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
		isEditMode:{
			id:'isEditMode',
			label:'编辑状态',
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
				},
			],
		},
		isInlineBtn:{
			id:'isInlineBtn',
			label:'是否行内按钮',
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
		isMobileInlineBtn:{
			id:'isMobileInlineBtn',
			label:'是否手机行内按钮',
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
				},
			],
		},
		disabledExpression:{
			id:'disabledExpression',
			label:'禁用表达式',
			type:'text',
			column:12,
		},
		isHaveSaveAndAdd:{
			id:'isHaveSaveAndAdd',
			label:'是否保存并新增',
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
				},
			],
		},
		parameterFormat:{
			id:'parameterFormat',
			label:'参数格式化',
			type:'textarea',
			column:12,
		},
		sourceField:{
			id:'sourceField',
			label:'sourceField',
			type:'text',
			column:12,
		},
		isCopyObject:{
			id:'isCopyObject',
			label:'isCopyObject',
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
		isReadonly:{
			id:'isReadonly',
			label:'是否只读',
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
		isUseAjaxByCopyAdd:{
			id:'isUseAjaxByCopyAdd',
			label:'使用ajax复制',
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
				},
			],
		},
		formatValueData:{
			id:'formatValueData',
			label:'formatValueData',
			type:'textarea',
			column:12,
		},
		validateParams:{
			id:'validateParams',
			label:'validateParams',
			type:'textarea',
			column:12,
		},
		getDataByAjax:{
			id:'getDataByAjax',
			label:'getDataByAjax',
			type:'textarea',
			column:12,
		},
		successMsg:{
			id:'successMsg',
			label:'successMsg',
			type:'text',
			column:12,
		},
		successOperate:{
			id:'successOperate',
			label:'successOperate',
			type:'radio',
			column:12,
			textField:'name',
			valueField:'id',
			value:'',
			isHasClose : true,
			subdata:[
				{
					id:'refresh',
					name:'refresh',
				},{
					id:'delete',
					name:'delete',
				},{
					id:'edit',
					name:'edit',
				},{
					id:'add',
					name:'add',
				},
			],
		},
		draftFields : {
			id:'draftFields',
			label:'draftFields',
			type:'textarea',
			column:12,
		},
		btnsConfig : {
			id:'btnsConfig',
			label:'按钮配置',
			type:'checkbox',
			column:12,
			textField:'name',
			valueField:'id',
			value:['isUseSave', 'isUseSaveSubmit', 'isUseDraft'],
			subdata:[
				{
					id:'isUseSave',
					name:'保存',
				},{
					id:'isUseSaveSubmit',
					name:'保存并提交',
				},{
					id:'isUseDraft',
					name:'保存到草稿箱',
				}
			],
		},
		matrixVariable : {
			id:'matrixVariable',
			label:'matrixVariable',
			type:'text',
			column:12,
		},
		listName : {
			id:'listName',
			label:'listName',
			type:'text',
			column:12,
		},
		isSendPageParams:{
			id:'isSendPageParams',
			label:'是否发送页面参数',
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
				},
			],
		},
		isIsSave:{
			id:'isIsSave',
			label:'是否是保存按钮',
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
		// dataImport
		'download-suffix':{
			id:'download-suffix',
			label:'下载url',
			type:'text',
			column:12,
			rules:'required',
		},
		'uploadAjax-suffix':{
			id:'uploadAjax-suffix',
			label:'上传url',
			type:'text',
			column:12,
			rules:'required',
		},
		'importAjax-suffix':{
			id:'importAjax-suffix',
			label:'导入url',
			type:'text',
			column:12,
			rules:'required',
		},
		'uploadAjax-dataSrc':{
			id:'uploadAjax-dataSrc',
			label:'上传dataSrc',
			type:'text',
			column:12,
		},
		'importAjax-dataSrc':{
			id:'importAjax-dataSrc',
			label:'导入dataSrc',
			type:'text',
			column:12,
		},
		'uploadAjax-type':{
			id:'uploadAjax-type',
			label:'上传type',
			type:'select',
			column:12,
			textField:'name',
			valueField:'id',
			subdata:[
				{
					id:'GET',
					name:'GET',
				},{
					id:'POST',
					name:'POST',
				},
			],
		},
		'importAjax-type':{
			id:'importAjax-type',
			label:'导入type',
			type:'select',
			column:12,
			textField:'name',
			valueField:'id',
			subdata:[
				{
					id:'GET',
					name:'GET',
				},{
					id:'POST',
					name:'POST',
				},
			],
		},
		'uploadAjax-contentType':{
			id:'uploadAjax-contentType',
			label:'上传contentType',
			type:'select',
			column:12,
			value:'application/x-www-form-urlencoded',
			textField:'name',
			valueField:'id',
			subdata:[
				{
					id:'application/x-www-form-urlencoded',
					name:'application/x-www-form-urlencoded',
				},{
					id:'application/json',
					name:'application/json',
				},
			]
		},
		'importAjax-contentType':{
			id:'importAjax-contentType',
			label:'导入contentType',
			type:'select',
			column:12,
			value:'application/x-www-form-urlencoded',
			textField:'name',
			valueField:'id',
			subdata:[
				{
					id:'application/x-www-form-urlencoded',
					name:'application/x-www-form-urlencoded',
				},{
					id:'application/json',
					name:'application/json',
				},
			]
		},
		'uploadAjax-data':{
			id:'uploadAjax-data',
			label:'上传data',
			type:'textarea',
			column:12,
		},
		'importAjax-data':{
			id:'importAjax-data',
			label:'导入data',
			type:'textarea',
			column:12,
		},
		columns : {
			id : 'columns',
			label : '导入展示字段',
			type:'select',
			column:12,
			textField:'chineseName',
			valueField:'englishName',
		},
		templateId : {
			id:'templateId',
			label:'导入模板ID',
			type:'text',
			column:12,
		},
		shortcutKey : {
			id:'shortcutKey',
			label:'快捷键',
			type:'text',
			column:12,
		},
		isKeepSelected : {
			id:'isKeepSelected',
			label:'是否行选中',
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
	};
	var helpConfig = {
		webSocketUrl:{
			title : 'webSocketUrl',
			name : 'webSocketUrl',
			value : getRootPath() + '/htmlpage/help.html',
		},
		valueField:{
			title : 'valueField',
			name : 'valueField',
			value : getRootPath() + '/htmlpage/help.html',
		},
		textField:{
			title : 'textField',
			name : 'textField',
			value : getRootPath() + '/htmlpage/help.html',
		},
		btnType:{
			title : 'btnType',
			name : 'btnType',
			value : getRootPath() + '/htmlpage/help.html',
		},
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
		defaultMode:{
			title : 'defaultMode',
			name : 'defaultMode',
			value : getRootPath() + '/htmlpage/help.html',
		},
		componentName:{
			title : 'componentName',
			name : 'componentName',
			value : getRootPath() + '/htmlpage/help.html',
		},
		text:{
			title : 'text',
			name : 'text',
			value : getRootPath() + '/htmlpage/help.html',
		},
		title:{
			title : 'title',
			name : 'title',
			value : getRootPath() + '/htmlpage/help.html',
		},
		btntext:{
			title : 'btntext',
			name : 'btntext',
			value : getRootPath() + '/htmlpage/help.html',
		},
		dataSrc:{
			title : 'dataSrc',
			name : 'dataSrc',
			value : getRootPath() + '/htmlpage/help.html',
		},
		functionField:{
			title : 'functionField',
			name : 'functionField',
			value : getRootPath() + '/htmlpage/help.html',
		},
		suffix:{
			title : 'suffix',
			name : 'suffix',
			value : getRootPath() + '/htmlpage/help.html',
		},
		ajaxData:{
			title : 'ajaxData',
			name : 'ajaxData',
			value : getRootPath() + '/htmlpage/help.html',
		},
		functionClass:{
			title : 'functionClass',
			name : 'functionClass',
			value : getRootPath() + '/htmlpage/help.html',
		},
		dataFormat:{
			title : 'dataFormat',
			name : 'dataFormat',
			value : getRootPath() + '/htmlpage/help.html',
		},
		type:{
			title : 'type',
			name : 'type',
			value : getRootPath() + '/htmlpage/help.html',
		},
		width:{
			title : 'width',
			name : 'width',
			value : getRootPath() + '/htmlpage/help.html',
		},
		height:{
			title : 'height',
			name : 'height',
			value : getRootPath() + '/htmlpage/help.html',
		},
		contentType:{
			title : 'contentType',
			name : 'contentType',
			value : getRootPath() + '/htmlpage/help.html',
		},
		voId:{
			title : 'voId',
			name : 'voId',
			value : getRootPath() + '/htmlpage/help.html',
		},
		dataSrc:{
			title : 'dataSrc',
			name : 'dataSrc',
			value : getRootPath() + '/htmlpage/help.html',
		},
		dataLevel:{
			title : 'dataLevel',
			name : 'dataLevel',
			value : getRootPath() + '/htmlpage/help.html',
		},
		isCloseWindow:{
			title : 'isCloseWindow',
			name : 'isCloseWindow',
			value : getRootPath() + '/htmlpage/help.html',
		},
		callbackAjax:{
			title : 'callbackAjax',
			name : 'callbackAjax',
			value : getRootPath() + '/htmlpage/help.html',
		},
		requestSource:{
			title : 'requestSource',
			name : 'requestSource',
			value : getRootPath() + '/htmlpage/help.html',
		},
		editorType:{
			title : 'editorType',
			name : 'editorType',
			value : getRootPath() + '/htmlpage/help.html',
		},
		isMainDbAction:{
			title : 'isMainDbAction',
			name : 'isMainDbAction',
			value : getRootPath() + '/htmlpage/help.html',
		},
		keyField:{
			title : 'keyField',
			name : 'keyField',
			value : getRootPath() + '/htmlpage/help.html',
		},
		isAlwaysNewTab:{
			title : 'isAlwaysNewTab',
			name : 'isAlwaysNewTab',
			value : getRootPath() + '/htmlpage/help.html',
		},
		isSetMore:{
			title : 'isSetMore',
			name : 'isSetMore',
			value : getRootPath() + '/htmlpage/help.html',
		},
		isEditMode:{
			title : 'isEditMode',
			name : 'isEditMode',
			value : getRootPath() + '/htmlpage/help.html',
		},
		isInlineBtn:{
			title : 'isInlineBtn',
			name : 'isInlineBtn',
			value : getRootPath() + '/htmlpage/help.html',
		},
		disabledExpression:{
			title : 'disabledExpression',
			name : 'disabledExpression',
			value : getRootPath() + '/htmlpage/help.html',
		},
		isHaveSaveAndAdd:{
			title : 'isHaveSaveAndAdd',
			name : 'isHaveSaveAndAdd',
			value : getRootPath() + '/htmlpage/help.html',
		},
		parameterFormat:{
			title : 'parameterFormat',
			name : 'parameterFormat',
			value : getRootPath() + '/htmlpage/help.html',
		},
		sourceField:{
			title : 'sourceField',
			name : 'sourceField',
			value : getRootPath() + '/htmlpage/help.html',
		},
		isCopyObject:{
			title : 'isCopyObject',
			name : 'isCopyObject',
			value : getRootPath() + '/htmlpage/help.html',
		},
		isReadonly:{
			title : 'isReadonly',
			name : 'isReadonly',
			value : getRootPath() + '/htmlpage/help.html',
		},
		isUseAjaxByCopyAdd:{
			title : 'isUseAjaxByCopyAdd',
			name : 'isUseAjaxByCopyAdd',
			value : getRootPath() + '/htmlpage/help.html',
		},
		formatValueData:{
			title : 'formatValueData',
			name : 'formatValueData',
			value : getRootPath() + '/htmlpage/help.html',
		},
		validateParams:{
			title : 'validateParams',
			name : 'validateParams',
			value : getRootPath() + '/htmlpage/help.html',
		},
		getDataByAjax:{
			title : 'getDataByAjax',
			name : 'getDataByAjax',
			value : getRootPath() + '/htmlpage/help.html',
		},
		successMsg:{
			title : 'successMsg',
			name : 'successMsg',
			value : getRootPath() + '/htmlpage/help.html',
		},
		successOperate:{
			title : 'successOperate',
			name : 'successOperate',
			value : getRootPath() + '/htmlpage/help.html',
		},
		draftFields : {
			title : 'draftFields',
			name : 'draftFields',
			value : getRootPath() + '/htmlpage/help.html',
		},
		btnsConfig : {
			title : 'btnsConfig',
			name : 'btnsConfig',
			value : getRootPath() + '/htmlpage/help.html',
		},
		matrixVariable : {
			title : 'matrixVariable',
			name : 'matrixVariable',
			value : getRootPath() + '/htmlpage/help.html',
		},
		listName : {
			title : 'listName',
			name : 'listName',
			value : getRootPath() + '/htmlpage/help.html',
		},
		isSendPageParams : {
			title : 'isSendPageParams',
			name : 'isSendPageParams',
			value : getRootPath() + '/htmlpage/help.html',
		},
	};
	// basePanel 表单配置
	var basePanelFormArrList = {
		dialog:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','type','dataFormat','dataSrc','dataLevel','text','title','functionField','ajaxData','width','height',"requestSource","isMainDbAction","isSetMore",'isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','getDataByAjax','successMsg','successOperate','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		valueDialog:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','type','dataFormat','dataSrc','dataLevel','text','title','functionField','ajaxData',"requestSource","isMainDbAction","isSetMore",'isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','getDataByAjax','successMsg','successOperate','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		ajaxDialog:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','type','dataFormat','dataSrc','dataLevel','text','title','functionField','ajaxData',"requestSource","isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','getDataByAjax','successMsg','successOperate','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		confirm:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','type','dataFormat','dataSrc','text','dataLevel','title','ajaxData',"requestSource","isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','successMsg','successOperate','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		toPage:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','type','dataSrc','dataLevel','text','title','suffix','width','height',"requestSource","isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		changePage:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','type','dataSrc','dataLevel','text','title','suffix','width','height',"requestSource","isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		templatePrint:['englishName','chineseName','defaultMode','functionClass','suffix','ajaxData','text','callbackAjax','webSocketUrl','btnType','textField','valueField',"requestSource","isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','matrixVariable','listName','isSendPageParams','shortcutKey','isKeepSelected'],
		loadPage:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','type','dataSrc','dataLevel','text','title','suffix',"requestSource","isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		component:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','type','dataFormat','dataSrc','dataLevel','text','title','functionField','ajaxData','componentName',"requestSource","isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		// workflowViewer:['englishName','chineseName','defaultMode','functionClass','text'],
		editorDialog:['englishName','chineseName','defaultMode','functionClass','suffix','type','contentType','title',"editorType","isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','isHaveSaveAndAdd','isCopyObject','isUseAjaxByCopyAdd','parameterFormat','validateParams','matrixVariable','isSendPageParams','formatValueData','shortcutKey','isKeepSelected'],
		viewerDialog:['englishName','chineseName','defaultMode','functionClass','suffix','type','contentType','text','title',"isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','isHaveSaveAndAdd','isReadonly','parameterFormat','validateParams','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		addInfoDialog:['englishName','chineseName','defaultMode','functionClass','suffix','type','contentType','text','keyField','title',"isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','isHaveSaveAndAdd','formatValueData','parameterFormat','validateParams','getDataByAjax','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		'':['englishName','chineseName','defaultMode','functionClass','isCloseWindow','type','dataFormat','dataSrc','text','dataLevel','title','ajaxData',"requestSource","isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		newtab:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','type','dataSrc','dataLevel','text','title','suffix',"requestSource","isMainDbAction",'isAlwaysNewTab','isEditMode','isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','matrixVariable','isSendPageParams','formatValueData','shortcutKey','isKeepSelected'],		
		custom:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','type','dataFormat','dataSrc','text','dataLevel','title','ajaxData',"requestSource","isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','successMsg','successOperate','matrixVariable','isSendPageParams','isIsSave','shortcutKey','isKeepSelected'],
		tel:['englishName','chineseName','defaultMode','functionClass','text','sourceField','parameterFormat','validateParams','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		email:['englishName','chineseName','defaultMode','functionClass','text','sourceField','parameterFormat','validateParams','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		successMessage:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','type','dataFormat','dataSrc','dataLevel','text','title','ajaxData','width','height',"requestSource","isMainDbAction","isSetMore",'isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','getDataByAjax','successMsg','successOperate', 'draftFields', 'btnsConfig','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		dataImport:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','type','text','title',"requestSource",'download-suffix','uploadAjax-suffix','uploadAjax-dataSrc','uploadAjax-type','uploadAjax-contentType','uploadAjax-data','importAjax-suffix','importAjax-dataSrc','importAjax-type','importAjax-contentType','importAjax-data','columns','shortcutKey','isKeepSelected'],
		excelImportVer2:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','type','text','title',"requestSource","templateId",'shortcutKey','isKeepSelected'],
	}
	var addFormArrList = {
		dialog:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','dataSrc','type','contentType','voId','dataFormat','dataLevel','text','title','functionField','ajaxData','width','height',"requestSource","isMainDbAction","isSetMore",'isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','getDataByAjax','successMsg','successOperate','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		valueDialog:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','dataSrc','type','contentType','voId','dataFormat','dataLevel','text','title','functionField','ajaxData',"requestSource","isMainDbAction","isSetMore",'isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','getDataByAjax','successMsg','successOperate','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		ajaxDialog:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','suffix','dataSrc','type','contentType','voId','dataFormat','dataLevel','text','title','functionField','ajaxData',"requestSource","isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','getDataByAjax','successMsg','successOperate','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		confirm:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','dataSrc','type','contentType','voId','dataFormat','dataLevel','text','title','ajaxData',"requestSource","isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','successMsg','successOperate','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		toPage:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','suffix','type','contentType','voId','dataLevel','text','width','height',"requestSource","isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		changePage:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','type','contentType','voId','dataLevel','text','suffix','width','height',"requestSource","isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','validateParams','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		templatePrint:['englishName','chineseName','defaultMode','functionClass','voId','suffix','ajaxData','text','callbackAjax','webSocketUrl','btnType','textField','valueField',"requestSource","isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','matrixVariable','listName','isSendPageParams','shortcutKey','isKeepSelected'],
		loadPage:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','type','contentType','voId','dataLevel','text','suffix','width','height',"requestSource","isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		component:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','suffix','dataSrc','type','voId','dataFormat','dataLevel','text','title','functionField','ajaxData','componentName',"requestSource","isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		// workflowViewer:['englishName','chineseName','defaultMode','functionClass','voId','text'],
		editorDialog:['englishName','chineseName','defaultMode','functionClass','suffix','type','contentType','voId',"editorType","isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','isHaveSaveAndAdd','isCopyObject','isUseAjaxByCopyAdd','parameterFormat','validateParams','matrixVariable','isSendPageParams','formatValueData','shortcutKey','isKeepSelected'],
		viewerDialog:['englishName','chineseName','defaultMode','functionClass','suffix','type','contentType','text','voId',"isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','isHaveSaveAndAdd','isReadonly','parameterFormat','validateParams','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		'':['englishName','chineseName','defaultMode','functionClass','isCloseWindow','dataSrc','type','contentType','voId','dataFormat','dataLevel','text','title','ajaxData',"requestSource","isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','isHaveSaveAndAdd','parameterFormat','validateParams','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		addInfoDialog:['englishName','chineseName','defaultMode','functionClass','suffix','type','contentType','text','keyField','voId',"isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','formatValueData','parameterFormat','validateParams','getDataByAjax','matrixVariable','isSendPageParams'],
		newtab:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','suffix','type','contentType','voId','dataLevel','text','width','height',"requestSource","isMainDbAction",'isAlwaysNewTab','isEditMode','isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','matrixVariable','isSendPageParams','formatValueData','shortcutKey','isKeepSelected'],
		custom:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','dataSrc','type','contentType','voId','dataFormat','dataLevel','text','title','ajaxData',"requestSource","isMainDbAction",'isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','successMsg','successOperate','matrixVariable','isSendPageParams','isIsSave','shortcutKey','isKeepSelected'],
		tel:['englishName','chineseName','defaultMode','functionClass','voId','text','sourceField','parameterFormat','validateParams','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		email:['englishName','chineseName','defaultMode','functionClass','voId','text','sourceField','parameterFormat','validateParams','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		successMessage:['englishName','chineseName','defaultMode','functionClass','isCloseWindow','dataSrc','type','contentType','voId','dataFormat','dataLevel','text','title','ajaxData','width','height',"requestSource","isMainDbAction","isSetMore",'isInlineBtn','isMobileInlineBtn','disabledExpression','parameterFormat','validateParams','getDataByAjax','successMsg','successOperate', 'draftFields', 'btnsConfig','matrixVariable','isSendPageParams','shortcutKey','isKeepSelected'],
		dataImport:['englishName','chineseName','defaultMode','functionClass','voId','isCloseWindow','type','text','title',"requestSource",'download-suffix','uploadAjax-suffix','uploadAjax-dataSrc','uploadAjax-type','uploadAjax-contentType','uploadAjax-data','importAjax-suffix','importAjax-dataSrc','importAjax-type','importAjax-contentType','importAjax-data','columns','shortcutKey','isKeepSelected'],
		excelImportVer2:['englishName','chineseName','defaultMode','functionClass','voId','isCloseWindow','type','text','title',"requestSource","templateId",'shortcutKey','isKeepSelected'],
	};
	// 编辑器整体框架
	var container = {
		// 预览数据
		previewData:{},
		// 面板编辑器（整体）
		getEditorPanel:function(editId){
			var dialogClass = '';
			var columnClass = 'col-xs-' + config.column;
			var maskHtml = '';
			if(config.type == 'dialog'){
				// 弹框设置的class 和 特殊HTML
				dialogClass = 'component-editor-modal fadeInDown animated';
				columnClass = '';
				// maskHtml = '<div class="fadeIn animated" style="position: fixed;top: 0;right: 0;bottom: 0;left: 0;background: rgba(0, 0, 0, 0.5);z-index: 1048;"></div>';
			}
			return $('<div  class="'+columnClass+'" id="'+editId+'">'
						+'<div class="component-editor '+dialogClass+'">'
							+'<div class="component-editor-header">'
								+'<h4 class="component-editor-title">组件编辑器</h4>'
								+'<ul class="component-editor-tab-nav" id="'+editId+'-header"></ul>'
							+'</div>'
							+'<div class="component-editor-body" id="'+editId+'-body">'
							+'</div>'
							+'<div class="component-editor-footer" id="'+editId+'-footer">'
							+'</div>'
						+'</div>'
						+maskHtml
					+'</div>');
		},
		// 获得头部Html对象
		getHeaderObj:function(){
			return $('<li class="component-editor-tab-nav-item">'
						+'<a href="javascript:void(0)">基本配置</a>'
					+'</li>');
		},
		// 获得底部HTML对象
		getFooterObj:function(){
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
			return $footer;
		},
		// 返回 预览的jQuery对象
		returnPreviewObj:function(){
			var containerPreview = '<div class="preview" id="'+this.previewId+'"></div>';
			return $(containerPreview)
		},
		// 预览
		preview:function(_previewData){
			/*
				text：按钮name
				title：弹框标题
				suffix：toPage/changePagedizhi
				btntext：弹框按钮name
				defaultMode：弹框类型
				ajaxData：ajax传参 预览没有用
				dataFormat：传参类型 预览没有用
			 */
			var $preview = this.returnPreviewObj();
			$('#'+config.id+'-body').append($preview);
			var previewData = $.extend(true,{},_previewData);
			function dialogFunInPreview(){
				// 根据defaultMode判断配置的弹框类型
				switch(previewData.defaultMode){
					case 'dialog':
					case 'valueDialog':
					case 'ajaxDialog':
						var diaObj = {
							id: 	this.previewId+'-dialog',
							title: 	previewData.title,
							size: 	"b",
							form: 	[],
							btns:[
								{
									text: 		previewData.btntext,
									handler: 	function(){},
								}
							]
						}
						nsdialog.initShow(diaObj);
						break;
					case 'toPage':
					case 'changePage':
						var diaObj = {
							url:getRootPath() + previewData.suffix,
							loadedHandler:function(){
								$('#nsPopContainer').children().eq(0).css('z-index','1050');
							},
						}
						nsFrame.popPageConfig(diaObj);
						break;
					case 'confirm':
						nsConfirm(previewData.title,function(isdelete){
						},"success");
						break;
				}
			}
			var btnsObj = {
				text:previewData.text,
				handler: 	function(){
					dialogFunInPreview();
				}
			};
			nsButton.initBtnsByContainerID(this.previewId,[btnsObj]);
		},
		// 添加footer事件
		footerOnClick:function($footer){
			$footer.find('button').eq(0).on('click',function(){
				// config.editorData = container.getEditorData();
				// config.saveData = container.getEditorData();
				//var sourceData = basePanel.getValues(); // 获取编辑器数据
				//var formatData = basePanel.formatEditData(sourceData); // 格式化编辑数据
				config.saveData = container.getSaveData();

				// nsAlert('保存成功');
				if(typeof(config.confirmHandler) == 'function'){
					config.confirmHandler(config.saveData);
				}
			});
			$footer.find('button').eq(1).on('click',function(){
				if($('#'+container.containerId).find('#'+container.previewId).length>0){
					$('#'+container.containerId).find('#'+container.previewId).remove();
				}else{
					container.previewData = basePanel.formatEditData(container.getSaveData());
					if(container.previewData){
						container.preview(container.previewData);
					}
				}
			});
			$footer.find('button').eq(2).on('click',function(){
				// container.closeFrame();
				function closeFun(){
					$('#'+config.id).remove();
					if(typeof(config.hideHandler) == 'function'){
						config.hideHandler(config.saveData);
					}
				}
				if(config.type == 'dialog'){
					$('.component-editor-modal').removeClass('fadeInDown').addClass('fadeOutUp');
					$('.component-editor-modal').siblings('.fadeIn').removeClass('fadeIn').addClass('fadeOut');
					$('.component-editor-modal').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', closeFun);
					container.endInitStyle();
				}else{
					closeFun();
				}
				// setTimeout(function(){
				// 	$('#'+config.id).remove();
				// 	if(typeof(config.hideHandler) == 'function'){
				// 		config.hideHandler(config.saveData);
				// 	}
				// },300);
				// $('#'+config.id).remove();
				// if(typeof(config.hideHandler) == 'function'){
				// 	config.hideHandler(config.saveData);
				// }
			});
		},
		closeFrame:function(){
			function closeFun(){
				$('#'+config.id).remove();
			}
			if(config.type == 'dialog'){
				$('.component-editor-modal').removeClass('fadeInDown').addClass('fadeOutUp');
				$('.component-editor-modal').siblings('.fadeIn').removeClass('fadeIn').addClass('fadeOut');
				$('.component-editor-modal').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', closeFun);
				container.endInitStyle();
			}else{
				closeFun();
			}
		},
		// 获得编辑数据
		getEditorData:function(){
			// var valData = basePanel.getValues();
			// var editorData = config.editorData;
			// for(key in valData){
			// 	editorData[key] = valData[key];
			// }
			// return editorData;
			var saveData = basePanel.getValues();
			return saveData;
		},
		// 获取保存数据
		getSaveData:function(){
			var editorData = $.extend(true,{},config.editorData);
			var sourceData = basePanel.getValues(); // 获取编辑器数据
			if(sourceData){
				for(var sorKey in sourceData){
					editorData[sorKey] = sourceData[sorKey];
				}
				delete editorData.resJson;
				delete editorData.formatData;
				delete editorData.sourceData;
				// sourceData.id = editorData.id;
				// sourceData.voName = editorData.voName;
				// var formatData = basePanel.formatEditData(sourceData); // 格式化编辑数据
				// var saveData = {
				// 	voName:editorData.voName,
				// 	chineseName:editorData.chineseName,
				// 	englishName:editorData.englishName,
				// 	functionClass:editorData.functionClass,
				// 	functionIntro:editorData.functionIntro,
				// 	title:formatData.title,
				// 	id:formatData.id,
				// };
				// saveData.sourceData = sourceData;//原始数据
				// saveData.formatData = formatData;//格式化后的数据
				if(config.isAdd){
					var requiredAttr = ['englishName','functionClass','defaultMode','suffix','type','voId','contentType'];
					for(var attrI=0;attrI<requiredAttr.length;attrI++){
						if(editorData[requiredAttr[attrI]] == ''){
							nsAlert('参数'+requiredAttr[attrI]+'没有配置','error');
							console.error(editorData);
							return false;
						}
					}
					var voInfo = config.voIdList[editorData.voId];
					for(var voAttr in voInfo){
						editorData[voAttr] = voInfo[voAttr];
					}
				}
			}else{
				editorData = false;
			}
			// return saveData;
			return editorData;
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
		// 初始化 入口方法
		init:function(){
			this.previewId = config.id + '-plane-preview'; //预览的id
			this.$editor = this.getEditorPanel(config.id);
			this.$header = this.getHeaderObj();
			this.$footer = this.getFooterObj();
			this.footerOnClick(this.$footer);
			this.$editor.find('#'+config.id+'-header').append(this.$header);
			this.$editor.find('#'+config.id+'-footer').append(this.$footer);
			// 在页面中扯入容器
			config.$container.append(this.$editor);
			// 初始化内容
			basePanel.init(config.id+'-body');
			if(config.type == 'dialog'){
				this.initStyle();
			}
		},
	}
	// 基本面板
	var basePanel = {
		valueObj:{},
		formJson:{
			id:  		'',
			size: 		"standard",
			format: 	"standard",
			fillbg: 	true,
		},
		// 获取functionField的value值
		getFuncFieldValue:function(str){
			str = str.replace('\"','');
			str = str.substring(str.indexOf('(')+1,str.length-1);
			var strArr = str.split(',');
			return strArr[1];
		},
		// 获取值
		getValues:function(){
			var formData = nsForm.getFormJSON(this.formJson.id);
			return formData;
		},
		// 格式化编辑数据
		formatEditData:function(_editorData){
			var formatData = $.extend(true,{},_editorData);
			// 清空之前保存的参数 当前类型不需要的参数
			// var defaultMode = formatData.defaultMode;
			// var funcConfigArr = addFormArrList[defaultMode];
			// if(funcConfigArr){
			// 	for(var key in getTypeData){
			// 		if(funcConfigArr.indexOf(key)==-1){
			// 			delete formatData[key];
			// 		}
			// 	}
			// }
			for(var attrKey in formatData){
				if(formatData[attrKey] == ''){
					continue;
				}
				switch(attrKey){
					case 'width':
					case 'height':
						if(formatData[attrKey].indexOf('%')>-1){
							formatData[attrKey] = formatData[attrKey];
						}else{
							formatData[attrKey] = parseInt(formatData[attrKey]);
						}
						break;
					case 'functionField':
						formatData.functionField = 'nsProject.getFieldsByState('+formatData.entityName+'.'+formatData.voName+',"'+formatData.functionField+'",{isColumn:false,isDialog:true,isValidSave:true})';
						break;
					case 'ajaxData':
					case 'getDataByAjax':
					case 'getPageDataExpression':
						formatData[attrKey] = JSON.parse(formatData[attrKey]);
						break;
					case 'editorType':
						// console.log(formatData[attrKey]);
						if(formatData.defaultMode == "editorDialog"){
							if(formatData[attrKey]!=""){
								var textArr = [];
								var textObj = {
									add : "新增",
									copyAdd : "复制新增",
									edit : "编辑",
									passiveAdd : '被动新增',
								}
								for(var editorTypeI=0;editorTypeI<formatData[attrKey].length;editorTypeI++){
									textArr.push(textObj[formatData[attrKey][editorTypeI]]);
								}
								formatData.text = textArr.toString();
							}
							formatData[attrKey] = formatData[attrKey].toString();
						}
						break;
					case 'isCloseWindow':
					case 'isCopyObject':
					case 'isMainDbAction':
					case 'isAlwaysNewTab':
					case 'isSetMore':
					case 'isEditMode':
					case 'isInlineBtn':
					case 'isMobileInlineBtn':
					case 'isHaveSaveAndAdd':
					case 'isUseAjaxByCopyAdd':
					case 'isReadonly':
					case 'isSendPageParams':
					case 'isIsSave':
					case 'isKeepSelected':
						if(formatData[attrKey] == 'true'){
							formatData[attrKey] = true;
						}
						if(formatData[attrKey] == 'false'){
							formatData[attrKey] = false;
						}
						break;
					case 'columns':
						formatData.columns = 'nsProject.getFieldsByState('+formatData.entityName+'.'+formatData.voName+',"'+formatData.columns+'",{isColumn:true,isDialog:true,isValidSave:true})';
						break;
					case 'download-suffix':
						formatData.suffix = formatData['download-suffix'];
						delete formatData[attrKey];
						break;
					case 'uploadAjax-suffix':
					case 'importAjax-suffix':
					case 'uploadAjax-dataSrc':
					case 'importAjax-dataSrc':
					case 'uploadAjax-type':
					case 'importAjax-type':
					case 'uploadAjax-contentType':
					case 'importAjax-contentType':
					case 'uploadAjax-data':
					case 'importAjax-data':
						var fieldNameArr = attrKey.split('-');
						var fieldName1 = fieldNameArr[0];
						var fieldName2 = fieldNameArr[1];
						if(typeof(formatData[fieldName1])!="object"){
							formatData[fieldName1] = {};
						}
						switch(fieldName2){
							case "data":
								if(formatData[attrKey].length>0){
									formatData[attrKey] = JSON.parse(formatData[attrKey]);
								}
								break;
						}
						formatData[fieldName1][fieldName2] = formatData[attrKey];
						delete formatData[attrKey];
						break;
				}
			}
			// var sourceEditorData = config.editorData;
			// for(var key in sourceEditorData){
			// 	if(!formatData[key] &&　key != 'resJson'){
			// 		formatData[key] = sourceEditorData[key];
			// 	}
			// }
			return formatData;
		},
		// 赋默认值
		setValues:function(obj){
			formPlane.fillValues(obj,this.formJson.id);
		},
		// 设置默认值
		setDefault:function(arr){
			function setValByData(obj){
				for(index=0;index<arr.length;index++){
					if(typeof(obj[arr[index].id])!="undefined"){
						arr[index].value = obj[arr[index].id];
					}
				}
			}
			if(config.editorData){
				setValByData(config.editorData);
			}
			if(!$.isEmptyObject(this.valueObj)){
				setValByData(this.valueObj);
			}
		},
		// 获得表单数组
		getFormArr:function(_defaultMode){
			// var arr = ['englishName','chineseName','defaultMode','text','title','btntext','functionField'];
			var arr = basePanelFormArrList[_defaultMode];
			if(config.isAdd){
				arr = addFormArrList[_defaultMode];
			}
			var formArr = [];
			for(index=0;index<arr.length;index++){
				var functionFieldObj = $.extend(true,{},getTypeData[arr[index]]);
				switch(arr[index]){
					case 'columns':
					case 'functionField':
						// 判断是否配置展示字段
						/*if(config.functionField){
							functionFieldObj.subdata = config.functionField.stateList;
							formArr.push(functionFieldObj);
						}*/
						if(config.stateList){
							functionFieldObj.subdata = config.stateList;
							formArr.push(functionFieldObj);
						}
						break;
					case 'defaultMode':
						// changeHandler 联动
						functionFieldObj.changeHandler = function(selectId){
							// if(selectId != ''){
								basePanel.valueObj = nsForm.getFormJSON(basePanel.formJson.id,false);
								basePanel.refreshPanel(selectId);
							// }
						}
						formArr.push(functionFieldObj);
						break;
					case 'englishName':
					case 'chineseName':
						if(config.isAdd){
							functionFieldObj.readonly = false;
						}
						formArr.push(functionFieldObj);
						break;
					case 'voId':
						functionFieldObj.subdata = config.voSubdataList;
						if(arr.indexOf('functionField')>-1){
							functionFieldObj.changeHandler = function(voId){
								if(voId!=''){
									config.stateList = config.voStateSubdataList[voId];
									var functionFieldObj = {
										id:'functionField',
										subdata:config.stateList,
									}
									nsForm.edit([functionFieldObj],basePanel.formJson.id);
								}
							}
						}
						if(arr.indexOf('columns')>-1){
							functionFieldObj.changeHandler = function(voId){
								if(voId!=''){
									config.stateList = config.voStateSubdataList[voId];
									var functionFieldObj = {
										id:'columns',
										subdata:config.stateList,
									}
									nsForm.edit([functionFieldObj],basePanel.formJson.id);
								}
							}
						}
						formArr.push(functionFieldObj);
						break;
					case 'functionClass':
						if(_defaultMode == 'tel' || _defaultMode == 'email'){
							functionFieldObj.hidden = true;
							functionFieldObj.value = 'modal';
						}
						formArr.push(functionFieldObj);
						break;
					default:
						formArr.push(functionFieldObj);
						break;
				}
			}
			return formArr;
		},
		// 设置表单
		setEditorForm:function(_defaultMode){
			if(typeof(_defaultMode) == 'undefined'){
				if(config.editorData.defaultMode){
					var defaultMode = config.editorData.defaultMode;
				}else{
					var defaultMode = 'dialog';
				}
			}else{
				var defaultMode = _defaultMode;
			}
			var formArr = this.getFormArr(defaultMode);
			this.setDefault(formArr);
			this.formJson.form = formArr;
			this.formJson.helpConfig = helpConfig;
			formPlane.formInit(this.formJson);
		},
		// 刷新面板 
		refreshPanel:function(_defaultMode){
			this.setEditorForm(_defaultMode);
		},
		// 初始化 入口方法
		init:function(id){
			this.valueObj = {};
			this.formJson.id = id;
			// 设置表单
			this.setEditorForm();
		},
	};
	// 验证参数
	function parameterValidata(_sourceObj){
		var sourceObj = $.extend(true,{},_sourceObj);
		var defaultObj = {
			id:'editor-func',
			containerId:'body',
			column:6,
			type:'dialog',
			isAdd:false,
			voList:[],
			editorData:{},//编辑数据
		};
		nsVals.setDefaultValues(sourceObj, defaultObj); //设置默认属性值
		if(sourceObj.isAdd){
			if(sourceObj.voList.length == 0){
				nsAlert('新增方法必须配置voList，请检查配置','error');
				config = false;
				return;
			}else{
				sourceObj.editorData.entityName = sourceObj.voList[0].entityName;
				sourceObj.editorData.mindMapId = sourceObj.voList[0].mindMapId;
			}
		}
		config = sourceObj;
		config.sourceObj = _sourceObj;
	}
	// 初始化数据
	function initData(){
		var voList = config.voList;
		var voSubdataList = []; // vo下拉列表
		var voStateSubdataList = {}; // 状态下拉列表
		var voIdList = {}; // vo列表
		for(var voI=0;voI<voList.length;voI++){
			var subdataObj = {
				voId:voList[voI].id,
				voName:voList[voI].voName,
				voFullName:voList[voI].voFullName,
			};
			voIdList[subdataObj.voId] = subdataObj;
			voSubdataList.push(subdataObj);
			voStateSubdataList[voList[voI].id] = [];
			var statesList = voList[voI].processData.states;
			for(var stateI=0;stateI<statesList.length;stateI++){
				var stateObj = {
					englishName:statesList[stateI].englishName,
					chineseName:statesList[stateI].chineseName,
				}
				voStateSubdataList[voList[voI].id].push(stateObj);
			}
		}
		config.voSubdataList = voSubdataList;
		config.voStateSubdataList = voStateSubdataList;
		config.voIdList = voIdList;
	}
	function init(_sourceObj){
		config = {};
		// 参数验证
		parameterValidata(_sourceObj);
		if(config){
			if(config.type == 'dialog'){
				config.$container = $('body');
			}else{
				if(config.containerId == 'body'){
					config.$container = $('body');
				}else{
					config.$container = $('#'+config.containerId);
				}
			}
			if(config.isAdd){
				initData();
			}
			container.init();
		}
	}
	return {
		init:init,
		getConfig:function(){ return config },
		closeFrame:container.closeFrame,
		getFormatData:basePanel.formatEditData,
	}
})(jQuery)