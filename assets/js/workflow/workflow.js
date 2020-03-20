var nsWorkFlow = {
	// 通过一个属性判断其他属性 关联关系 父-子
	fieldRelationChild:{
		// 基本属性更多配置
		'baseAttr-moreSet':{
			autoComplete:'0',
			autoForward:'0',
			endFlag:'0',
			canNotRollBack:'0',
			loopFlag:'0',
			doWhenforward:'0',
			doWhenRollBack:'0',
		},
		// 办理人 选择设置
		'transactorSet-selectSet':{
			transactorsDef:'',
			application:'',
			api:'',
		},
	},
	// 通过一个属性判断其他属性 关联关系 子-父 checkbox
	fieldRelationParent:{
		autoComplete:'baseAttr-moreSet',
		autoForward:'baseAttr-moreSet',
		endFlag:'baseAttr-moreSet',
		canNotRollBack:'baseAttr-moreSet',
		loopFlag:'baseAttr-moreSet',
		doWhenforward:'baseAttr-moreSet',
		doWhenRollBack:'baseAttr-moreSet',
		transactorsDef:'transactorSet-selectSet',
		transactorApi:'transactorSet-selectSet',
	},
	// 保存字段的key值 {id:'',type:''} --> {name:{id:''},type:''}
	fieldParentName:{
		n:'incomingDef',
		mustTos:'incomingDef',
		'outgoingDef-application':'outgoingDef',
		'outgoingDef-api':'outgoingDef',
		'timerDuration':'timerDef',
		'timerType':'timerDef',
		'timerDef-application':'timerDef',
		'group':'timerDef',
	},
	// 需要拆分的值 {name:{id:''},type:''} --> {id:'',type:''}
	fieldHaveChild:{
		incomingDef:{},
		outgoingDef:{},
		timerDef:{},
	},
	// 所有表单数据
	pageFormData:{
		// 基本属性
		baseAttr:{
			activityName:{
				id:'activityName',
				label:'活动名称',
				type:'text',
				column:4,
			},
			activityNameExt:{
				id:'activityNameExt',
				label:'扩展名',
				type:'text',
				column:4,
			},
			nameDisplayWay:{
				id:'nameDisplayWay',
				label:'名称显示',
				type:'select',
				textField:'name',
				valueField:'id',
				column:4,
				subdata:[
					{ id:'1',name:'活动名称' },
					{ id:'2',name:'扩展名' },
					{ id:'3',name:'全名' },
				],
			},
			formUrl:{
				id:'formUrl',
				label:'表单URL',
				type:'text',
				column:12,
			},
			'baseAttr-moreSet':{
				id:'baseAttr-moreSet',
				label:'',
				type:'checkbox',
				textField:'name',
				valueField:'id',
				column:12,
				subdata:[
					{ id:'autoComplete',name:'自动签收' },
					{ id:'autoForward',name:'自动转移' },
					{ id:'endFlag',name:'可终止流程' },
					{ id:'canNotRollBack',name:'不可驳回' },
					{ id:'loopFlag',name:'自循环' },
					{ id:'doWhenforward',name:'提交时输入办理意见' },
					{ id:'doWhenRollBack',name:'驳回时输入办理意见' },
				],
			},
		},
		// 办理人设置
		transactorSet:{
			'transactorSet-selectSet':{
				id:'transactorSet-selectSet',
				label:'',
				type:'radio',
				textField:'name',
				valueField:'id',
				column:12,
				subdata:[
					{ id:'transactorsDef',name:'本环节办理人' },
					{ id:'transactorApi',name:'获取办理人接口' },
				],
				changeHandlerData:{
					"transactorsDef":{
						hidden:{
							transactorsDef:false,
							application:true,
							api:true,
						}
					},
					"transactorApi":{
						hidden:{
							transactorsDef:true,
							application:false,
							api:false,
						}
					}
				},
				changeHandler:function(selectId){
					var values = nsWorkFlow.page.value;
					if(selectId == 'transactorsDef'){
						delete values.transactorApi;
					}
					if(selectId == 'transactorApi'){
						delete values.transactorsDef;
					}
					var editObjArr = [
						{
							id:'transactorsDef',
							value:'',
						},{
							id:'application',
							value:'',
						},{
							id:'api',
							value:'',
						}
					]
					nsForm.edit(editObjArr,nsWorkFlow.page.allId.bodyId);
				}
			},
			setOtherTransactorDef:{
				id:'setOtherTransactorDef',
				label:'',
				type:'checkbox',
				textField:'name',
				valueField:'id',
				column:12,
				subdata:[
					{ id:'1',name:'需在本环节设置办理人的后续环节' },
				],
			},
			transactorsDef:{
				id:'transactorsDef',
				label:'本环节办理人',
				type:'transactor',
				column:12,
				hidden:true,
				user:{
					candidateUsers:{
						// textField:'name',
						// valueField:'id',
						// dataSrc:'data',
						// url:getRootPath()+'/assets/json/select.json',
						personAjax:		{
							url:			getRootPath() + '/assets/json/employ/employ.json',	
							type:			'GET',
							data:			{},	
							dataSrc:		'rows',
							localDataConfig:[
								{key:'index',search:false},
								{key:'id',search:false,isID:true},
								{key:'name',search:true,title:'员工',type:'string',visible:1,isName:true},
								{key:'deptId',search:false,isDepart:true},
								{key:'deptName',search:true,title:'部门名称',type:'string',visible:2}
							]
						},
						groupAjax:		{
							textField:		'deptName',
							valueField:		'deptId',
							parentId:		'parentId',
							dataSrc:		'rows',
							url:			getRootPath() + '/assets/json/employ/dept.json',	
							type:			'GET',
							data:			{},	
						}
					},
					userOfOtherActivity:{
						textField:'name',
						valueField:'id',
						subdata:[
							{ id:'1',name:'zhangsan' },
							{ id:'2',name:'lisi' },
							{ id:'3',name:'wangwu' },
						]
					},
				},
				role:{
					role:{
						textField:'name',
						valueField:'id',
						dataSrc:'data',
						url:getRootPath()+'/assets/json/select.json',
					},
					candidateDept:{
						textField:'name',
						valueField:'id',
						dataSrc:'data',
						url:getRootPath()+'/assets/json/select.json',
					},
					deptOfOtherActivity:{
						textField:'name',
						valueField:'id',
						subdata:[
							{ id:'1',name:'zhangsan' },
							{ id:'2',name:'lisi' },
							{ id:'3',name:'wangwu' },
						]
					},
				},
				post:{
					postId:{
						textField:'name',
						valueField:'id',
						dataSrc:'data',
						url:getRootPath()+'/assets/json/select.json',
					},
					candidateDept:{
						textField:'name',
						valueField:'id',
						dataSrc:'data',
						url:getRootPath()+'/assets/json/select.json',
					},
					deptOfOtherActivity:{
						textField:'name',
						valueField:'id',
						subdata:[
							{ id:'1',name:'zhangsan' },
							{ id:'2',name:'lisi' },
							{ id:'3',name:'wangwu' },
						]
					},
				},
				dept:{
					candidateDept:{
						textField:'name',
						valueField:'id',
						dataSrc:'data',
						url:getRootPath()+'/assets/json/select.json',
					},
				},
				group:{
					candidateGroup:{
						textField:'name',
						valueField:'id',
						dataSrc:'data',
						url:getRootPath()+'/assets/json/select.json',
					},
				},
			},
			application:{
				id:'application',
				label:'应用名',
				type:'select',
				hidden:true,
				column:6,
				relationField:'api',
				textField:'name',
				valueField:'id',
				dataSrc:'data',
				url:getRootPath()+'/assets/json/select.json',
			},
			api:{
				id:'api',
				label:'组名',
				type:'select',
				hidden:true,
				column:6,
				data:{application:'{this.application}'},
				textField:'name',
				valueField:'id',
				dataSrc:'data',
				url:getRootPath()+'/assets/json/select.json',
			},
		},
		// 时限设置
		timeSet:{
			deadlinesToStart:{
				id:'deadlinesToStart',
				label:'启动时限',
				type:'text',
				column:12,
				readonly:true,
			},
			deadlinesToEnd:{
				id:'deadlinesToEnd',
				label:'关闭时限',
				type:'text',
				column:12,
				readonly:true,
			},
		},
		// 消息设置
		newsSet:{
		},
		// 事件设置
		eventSet:{
			common41:{
				id:'common41',
				label:'事件地址',
				type:'text',
				column:12,
			},
			common42:{
				id:'common42',
				label:'代办事件',
				type:'radio',
				textField:'name',
				valueField:'id',
				column:12,
				subdata:[
					{ id:'0',name:'不存在' },
					{ id:'1',name:'执行' },
					{ id:'2',name:'不执行' },
				],
			},
			common43:{
				id:'common43',
				label:'签收事件',
				type:'radio',
				textField:'name',
				valueField:'id',
				column:12,
				subdata:[
					{ id:'0',name:'不存在' },
					{ id:'1',name:'执行' },
					{ id:'2',name:'不执行' },
				],
			},
			common44:{
				id:'common44',
				label:'回退至代办事件',
				type:'radio',
				textField:'name',
				valueField:'id',
				column:12,
				subdata:[
					{ id:'0',name:'不存在' },
					{ id:'1',name:'执行' },
					{ id:'2',name:'不执行' },
				],
			},
			common45:{
				id:'common45',
				label:'回退至签收事件',
				type:'radio',
				textField:'name',
				valueField:'id',
				column:12,
				subdata:[
					{ id:'0',name:'不存在' },
					{ id:'1',name:'执行' },
					{ id:'2',name:'不执行' },
				],
			},
		},
		// 转移设置
		transferSet:{
			outgoingWay:{
				id:'outgoingWay',
				label:'转移类型',
				type:'select',
				textField:'name',
				valueField:'id',
				column:12,
				subdata:[
					{ id:'0',name:'顺序' },
					{ id:'1',name:'并行' },
					{ id:'2',name:'条件' },
					{ id:'3',name:'发散' },
					{ id:'4',name:'分批' },
					{ id:'5',name:'合并取消' },
				],
				changeHandlerData:{
					"0":{
						hidden:{
							'incomingDomId':true,
							'outgoingDef-application':true,
							'outgoingDef-api':true,
						}
					},
					"1":{
						hidden:{
							'incomingDomId':false,
							'outgoingDef-application':true,
							'outgoingDef-api':true,
						}
					},
					"2":{
						hidden:{
							'incomingDomId':false,
							'outgoingDef-application':true,
							'outgoingDef-api':true,
						}
					},
					"3":{
						hidden:{
							'incomingDomId':true,
							'outgoingDef-application':false,
							'outgoingDef-api':false,
						}
					},
					"4":{
						hidden:{
							'incomingDomId':true,
							'outgoingDef-application':false,
							'outgoingDef-api':false,
						}
					},
					"5":{
						hidden:{
							'incomingDomId':false,
							'outgoingDef-application':true,
							'outgoingDef-api':true,
						}
					},
				},
				changeHandler:function(selectId){
					var values = nsWorkFlow.page.value;
					delete values['incomingDomId'];
					delete values['outgoingDef-application'];
					delete values['outgoingDef-api'];
					var editObjArr = [
						{
							id:'incomingDomId',
							value:'',
						},{
							id:'outgoingDef-application',
							value:'',
						},{
							id:'outgoingDef-api',
							value:'',
						}
					]
					nsForm.edit(editObjArr,nsWorkFlow.page.allId.bodyId);
				}
			},
			'incomingDomId':{
				id:'incomingDomId',
				label:'对应的汇聚活动',
				type:'select',
				column:12,
				textField:'name',
				valueField:'id',
				subdata:[],
				disabled:true,
			},
			'outgoingDef-application':{
				id:'outgoingDef-application',
				label:'URL',
				type:'select',
				column:6,
				relationField:'outgoingDef-api',
				textField:'name',
				valueField:'id',
				dataSrc:'data',
				hidden:true,
				url:getRootPath()+'/assets/json/select.json',
			},
			'outgoingDef-api':{
				id:'outgoingDef-api',
				label:'',
				type:'select',
				column:6,
				data:{'outgoingDef-application':'{this.outgoingDef-application}'},
				textField:'name',
				valueField:'id',
				dataSrc:'data',
				hidden:true,
				url:getRootPath()+'/assets/json/select.json',
			},
		},
		// 汇聚设置
		convergingSet:{
			incomingWay:{
				id:'incomingWay',
				label:'汇聚类型',
				type:'select',
				textField:'name',
				valueField:'id',
				column:12,
				subdata:[
					{ id:'0',name:'顺序' },
					{ id:'1',name:'并行汇聚' },
					{ id:'2',name:'异或汇聚' },
					{ id:'3',name:'发散汇聚' },
					{ id:'4',name:'必达汇聚' },
					{ id:'5',name:'流程合并' },
					{ id:'6',name:'投票汇聚' },
					{ id:'7',name:'分批汇聚' },
					{ id:'8',name:'多路汇聚' },
				],
				changeHandlerData:{
					"0":{
						hidden:{
							outgoingDomId:true,
							mustTos:true,
							n:true,
						}
					},
					"1":{
						hidden:{
							outgoingDomId:false,
							mustTos:true,
							n:true,
						}
					},
					"2":{
						hidden:{
							outgoingDomId:false,
							mustTos:true,
							n:true,
						}
					},
					"3":{
						hidden:{
							outgoingDomId:false,
							mustTos:true,
							n:true,
						}
					},
					"4":{
						hidden:{
							outgoingDomId:false,
							mustTos:false,
							n:true,
						}
					},
					"5":{
						hidden:{
							outgoingDomId:false,
							mustTos:true,
							n:true,
						}
					},
					"6":{
						hidden:{
							outgoingDomId:true,
							mustTos:true,
							n:false,
						}
					},
					"7":{
						hidden:{
							outgoingDomId:false,
							mustTos:true,
							n:true,
						}
					},
					"8":{
						hidden:{
							outgoingDomId:false,
							mustTos:true,
							n:true,
						}
					},
				},
				changeHandler:function(selectId){
					var values = nsWorkFlow.page.value;
					delete values.outgoingDomId;
					delete values.mustTos;
					delete values.n;
					var editObjArr = [
						{
							id:'outgoingDomId',
							value:'',
						},{
							id:'mustTos',
							value:'',
						},{
							id:'n',
							value:'',
						}
					]
					nsForm.edit(editObjArr,nsWorkFlow.page.allId.bodyId);
				}
			},
			outgoingDomId:{
				id:'outgoingDomId',
				label:'对应的转移',
				type:'select',
				column:12,
				hidden:true,
				textField:'name',
				valueField:'id',
				subdata:[],
			},
			mustTos:{
				id:'mustTos',
				label:'必达项',
				type:'select',
				column:12,
				subdata:[],
				hidden:true,
				textField:'name',
				valueField:'id',
			},
			n:{
				id:'n',
				label:'需汇聚数量',
				type:'select',
				column:12,
				subdata:[],
				hidden:true,
			},
		},
		// 延时设置
		delays:{
			timerFlag:{
				id:'timerFlag',
				label:'启用延时',
				type:'checkbox',
				textField:'name',
				valueField:'id',
				column:12,
				subdata:[
					{ id:'1',name:'' }
				],
			},
			timerWay:{
				id:'timerWay',
				label:'',
				type:'radio',
				textField:'name',
				valueField:'id',
				column:12,
				subdata:[
					{ id:'1',name:'固定时长' },
					{ id:'2',name:'获取时间点接口' },
				],
				changeHandlerData:{
					"1":{
						hidden:{
							timerDuration:false,
							timerType:false,
							'timerDef-application':true,
							group:true,
						}
					},
					"2":{
						hidden:{
							timerDuration:true,
							timerType:true,
							'timerDef-application':false,
							group:false,
						}
					}
				},
				changeHandler:function(selectId){
					var values = nsWorkFlow.page.value;
					delete values['timerDuration'];
					delete values['timerType'];
					delete values['timerDef-application'];
					delete values['group'];
					var editObjArr = [
						{
							id:'timerDuration',
							value:'',
						},{
							id:'timerType',
							value:'',
						},{
							id:'timerDef-application',
							value:'',
						},{
							id:'group',
							value:'',
						}
					]
					nsForm.edit(editObjArr,nsWorkFlow.page.allId.bodyId);
				}
			},
			timerDuration:{
				id:'timerDuration',
				label:'时长',
				type:'text',
				column:6,
				hidden:true,
			},
			timerType:{
				id:'timerType',
				label:'单位',
				type:'select',
				textField:'name',
				valueField:'id',
				column:6,
				hidden:true,
				subdata:[
					{ id:'1',name:'天' },
					{ id:'2',name:'小时' },
					{ id:'3',name:'分钟' },
				],
			},
			'timerDef-application':{
				id:'timerDef-application',
				label:'',
				type:'select',
				column:6,
				hidden:true,
				relationField:'group',
				textField:'name',
				valueField:'id',
				dataSrc:'data',
				url:getRootPath()+'/assets/json/select.json',
			},
			group:{
				id:'group',
				label:'',
				type:'select',
				column:6,
				hidden:true,
				data:{'timerDef-application':'{this.timerDef-application}'},
				textField:'name',
				valueField:'id',
				dataSrc:'data',
				url:getRootPath()+'/assets/json/select.json',
			},
		},
		// 子流程
		child:{
			subProcess:{
				id:'subProcess',
				label:'子流程',
				type:'text',
				column:12,
			},
		},
	},
	// 所有的页面配置tabs
	tab:{
		transition:[
			{
				title:'基本属性',
				fieldType:'baseAttr',
				fieldName:[
					{ id:'activityName', },
					{ id:'activityNameExt', },
					{ id:'nameDisplayWay', },
					{ id:'formUrl', },
					{ id:'baseAttr-moreSet', },
				]
			},{
				title:'办理人设置',
				fieldType:'transactorSet',
				fieldName:[
					{ id:'transactorSet-selectSet', },
					{ id:'transactorsDef', },
					{ id:'application', },
					{ id:'api', },
					{ id:'setOtherTransactorDef', },
				]
			},{
				title:'时限设置',
				fieldType:'timeSet',
				fieldName:[
					{ id:'deadlinesToStart', },
					{ id:'deadlinesToEnd', },
				]
			},{
				title:'转移设置',
				fieldType:'transferSet',
				fieldName:[
					{ id:'outgoingWay', },
					{ id:'incomingDomId', },
					{ id:'outgoingDef-application', },
					{ id:'outgoingDef-api', },
				]
			},{
				title:'汇聚设置',
				fieldType:'convergingSet',
				fieldName:[
					{ id:'incomingWay', },
					{ id:'outgoingDomId', },
					{ id:'mustTos', },
					{ id:'n', },
				]
			},{
				title:'延时设置',
				fieldType:'delays',
				fieldName:[
					{ id:'timerFlag', },
					{ id:'timerWay', },
					{ id:'timerDuration', },
					{ id:'timerType', },
					{ id:'timerDef-application', },
					{ id:'group', },
				]
			},{
				title:'子流程',
				fieldType:'child',
				fieldName:[
					{ id:'subProcess', },
				]
			}
		],
		dumb:[
			{
				title:'基本属性',
				fieldType:'baseAttr',
				fieldName:[
					{ id:'activityName', },
					{ id:'activityNameExt', },
					{ id:'nameDisplayWay', },
					{ id:'baseAttr-moreSet', },
				]
			},
			{
				title:'办理人设置',
				fieldType:'transactorSet',
				fieldName:[
					{ id:'transactorSet-selectSet', },
					{ id:'transactorsDef', },
					{ id:'application', },
					{ id:'api', },
					{ id:'setOtherTransactorDef', },
				]
			},
			{
				title:'时限设置',
				fieldType:'timeSet',
				fieldName:[
					{ id:'deadlinesToStart', },
					{ id:'deadlinesToEnd', },
				]
			},
			{
				title:'转移设置',
				fieldType:'transferSet',
				fieldName:[
					{ id:'outgoingWay', },
					{ id:'incomingDomId', },
					{ id:'outgoingDef-application', },
					{ id:'outgoingDef-api', },
				]
			},
			{
				title:'汇聚设置',
				fieldType:'convergingSet',
				fieldName:[
					{ id:'incomingWay', },
					{ id:'outgoingDomId', },
					{ id:'mustTos', },
					{ id:'n', },
				]
			},
			{
				title:'延时设置',
				fieldType:'delays',
				fieldName:[
					{ id:'timerFlag', },
					{ id:'timerWay', },
					{ id:'timerDuration', },
					{ id:'timerType', },
					{ id:'timerDef-application', },
					{ id:'group', },
				]
			}
		],
		start:[
			{
				keyField:'key',
				idField:'id',
				title:'时限设置',
				fieldType:'timeSet',
				fieldName:[
					{ id:'deadlinesToStart', },
					{ id:'deadlinesToEnd', },
				]
			},
			{
				keyField:'key',
				idField:'id',
				title:'延时设置',
				fieldType:'delays',
				fieldName:[
					{ id:'timerFlag', },
					{ id:'timerWay', },
					{ id:'timerDuration', },
					{ id:'timerType', },
					{ id:'timerDef-application', },
					{ id:'group', },
				]
			}
		],
		end:[
			{
				keyField:'key',
				idField:'id',
				title:'时限设置',
				fieldType:'timeSet',
				fieldName:[
					{ id:'deadlinesToStart', },
					{ id:'deadlinesToEnd', },
				]
			},
			{
				keyField:'key',
				idField:'id',
				title:'汇聚设置',
				fieldType:'convergingSet',
				fieldName:[
					{ id:'incomingWay', },
					{ id:'outgoingDomId', },
					{ id:'mustTos', },
					{ id:'n', },
				]
			},
			{
				keyField:'key',
				idField:'id',
				title:'延时设置',
				fieldType:'delays',
				fieldName:[
					{ id:'timerFlag', },
					{ id:'timerWay', },
					{ id:'timerDuration', },
					{ id:'timerType', },
					{ id:'timerDef-application', },
					{ id:'group', },
				]
			}
		]
	},
	// 验证数据
	validData:function(config){
		config.type = typeof(config.type)=='string'?config.type:'start';
		config.id = typeof(config.id)=='string'?config.id:'dialog';
		if(typeof(config.tabType)=='string'){
			if(typeof(this.tab[config.tabType])=='object'){
			}else{
				nsAlert('tabType配置错误，只是别transition/dumb/start/end','error')
				return false;
			}
		}else{
			nsAlert('没有配置tabType','error')
			return false;
		}
		if(!$.isArray(config.userOfOtherActivitySub)){
			config.userOfOtherActivitySub = [];
		}
		return true;
	},
	// 初始化value
	initValue:function(){
		var config = this.config;
		if(typeof(config.value)=='undefined'){
			return;
		}
		config.sourceValue = $.extend(true,{},config.value);
		var value = config.value;
		var formatValueData = {};
		var fieldRelationParent = this.fieldRelationParent;
		var fieldHaveChild = this.fieldHaveChild;
		for(var attrId in value){
			if(value[attrId] == ''||value[attrId] == '[]'){
				continue;
			}
			if(typeof(value[attrId])=='object'){
				var isEmpty = true;
				for(var key in value[attrId]){
					if(value[attrId][key]!=''){
						isEmpty = false;
					}
				}
				if(isEmpty){
					continue;
				}
			}
			switch(attrId){
				case 'autoComplete':
				case 'autoForward':
				case 'canNotRollBack':
				case 'doWhenforward':
				case 'doWhenRollBack':
					// checkbox 直接存的字段
					// checkbox选择出的字段 通过this.fieldRelationParent格式化
					if(typeof(fieldRelationParent[attrId])!='undefined'){
						var keyName = fieldRelationParent[attrId];
						if(typeof(formatValueData[keyName])!='object'){
							formatValueData[keyName] = [];
						}
						if(value[attrId] == '1' || value[attrId] == true){
							formatValueData[keyName].push(attrId);
						}
					}
					break;
				case 'transactorsDef':
					if(typeof(formatValueData[fieldRelationParent[attrId]])!='undefined'){
						delete formatValueData.application;
						delete formatValueData.api;
						console.error('transactorsDef与application/api不能同时设置');
					}
					formatValueData[attrId] = eval('['+value[attrId]+']');
					formatValueData[attrId] = formatValueData[attrId][0];
					formatValueData[fieldRelationParent[attrId]] = attrId;
					break;
				case 'transactorApi':
					if(typeof(formatValueData[fieldRelationParent[attrId]])!='undefined'){
						delete formatValueData[formatValueData[fieldRelationParent[attrId]]];
						console.error('transactorsDef与application/api不能同时设置');
					}
					formatValueData[fieldRelationParent[attrId]] = attrId;
					for(var key in value[attrId]){
						formatValueData[key] = value[attrId][key];
					}
					break;
				default:
					if(typeof(fieldHaveChild[attrId])!='undefined'){
						var defValue = JSON.parse(value[attrId]);
						var keyStare = '';
						if(attrId == 'outgoingDef'){
							keyStare = 'outgoingDef-';
						}
						for(var key in defValue){
							if(attrId == 'timerDef'&&key=='application'){
								keyStare = 'timerDef-';
							}
							formatValueData[keyStare+key] = defValue[key];
						}
					}else{
						formatValueData[attrId] = value[attrId];
					}
					break;
			}
		}
		config.value = formatValueData;
	},
	// 格式化value
	formatValue:function(value){
		var formatValueData = {};
		var fieldRelationChild = this.fieldRelationChild;
		var fieldParentName = this.fieldParentName;
		for(var attrId in value){
			if(value[attrId] == ''){
				continue;
			}
			switch(attrId){
				case 'baseAttr-moreSet':
					// checkbox 直接存的字段
					// checkbox选择出的字段 通过this.fieldRelationChild格式化
					if(typeof(fieldRelationChild[attrId])!='undefined'){
						var valueKeyObj = fieldRelationChild[attrId];
						var valueKeyArr = value[attrId];
						for(var valKey in valueKeyObj){
							if(valueKeyArr.indexOf(valKey)>-1){
								formatValueData[valKey] = '1';
							}else{
								formatValueData[valKey] = valueKeyObj[valKey];
							}
						}
					}
					break;
				case 'transactorSet-selectSet':
					break;
				case 'application':
				case 'api':
					if(typeof(formatValueData.transactorApi)=='undefined'){
						formatValueData.transactorApi = {};
					}
					formatValueData.transactorApi[attrId] = value[attrId];
					break;
				default:
					if(typeof(fieldParentName[attrId])!='undefined'){
						if(typeof(formatValueData[fieldParentName[attrId]])!='object'){
							formatValueData[fieldParentName[attrId]] = {};
						}
						var childKeyName = attrId;
						if(attrId.indexOf('-')>-1){
							childKeyName = attrId.split('-')[1];
						}
						formatValueData[fieldParentName[attrId]][childKeyName] = value[attrId];
					}else{
						formatValueData[attrId] = value[attrId];
					}
					break;
			}
		}
		return formatValueData;
	},
	// 初始化tabs数据
	initTabsData:function(){
		var config = this.config;
		config.tab = this.tab[config.tabType];
		for(var i=0;i<config.tab.length;i++){
			config.tab[i].type = 'form';
			var fieldName = $.isArray(config.tab[i].fieldName)?config.tab[i].fieldName:[];
			var fieldType = typeof(config.tab[i].fieldType)?config.tab[i].fieldType:'baseAttr'; //默认基本属性
			var pageFormDataNow = this.pageFormData[fieldType];
			if(typeof(pageFormDataNow)!=='object'){
				console.error(fieldType+'参数配置错误');
				console.error(config.tab[i]);
				config.tab[i].field = [];
				continue;
			}
			var tabForm = [];
			for(var j=0;j<fieldName.length;j++){
				var fieldId = fieldName[j].id;
				if(pageFormDataNow[fieldId]){
					var fieldForm = $.extend(true,{},pageFormDataNow[fieldId]);
					for(var attr in fieldName[j]){
						fieldForm[attr] = fieldName[j][attr];
					}
					tabForm.push(fieldForm);
				}else{
					console.error('不存在'+fieldId+'字段');
				}
			}
			config.tab[i].field = tabForm;
		}
	},
	// 设置value 根据设置的value值设置须显示的隐藏字段 没有用模板使用的getValueAjax赋值 需从模板中改
	setValueHidden:function(){
		var values = this.config.value;
		var tabs = this.config.tab;
		var showHidden = [];
		// 添加value值 获得需处理的隐藏字段
		for(var i=0;i<tabs.length;i++){
			var tabsField = tabs[i].field;
			var showField = [];
			for(var fieldI=0;fieldI<tabsField.length;fieldI++){
				var fieldId = tabsField[fieldI].id;
				if(values[fieldId]){
					tabsField[fieldI].value = values[fieldId];
					if(typeof(tabsField[fieldI].changeHandlerData)=='object'){
						var changeHandlerDataObj = tabsField[fieldI].changeHandlerData[tabsField[fieldI].value];
						if(changeHandlerDataObj){
							showField.push(changeHandlerDataObj);
						}
					}
				}
			}
			showHidden.push(showField);
		}
		function setAttrByShowAttr(fieldArr,setObj){
			var setType = '';
			for(var attrType in setObj){
				setType = attrType;
			}
			for(var i=0;i<fieldArr.length;i++){
				if(typeof(setObj[setType][fieldArr[i].id])!='undefined'){
					fieldArr[i][setType] = setObj[setType][fieldArr[i].id];
				}
			}
		}
		// 根据获得的隐藏字段id编辑隐藏字段
		for(var i=0;i<tabs.length;i++){
			var tabsField = tabs[i].field;
			var setArr = showHidden[i];
			for(var j=0;j<setArr.length;j++){
				setAttrByShowAttr(tabsField,setArr[j])
			}
		}
	},
	// 显示tab页面
	page:{
		// tab内容
		content:[],
		// 字段内容
		fields:{},
		// 正显示的id
		activeId:'',
		// 当前value值
		value:{},
		// 获取面板的html
		getPanelHtml:function(){
			var config = this.config;
			var allId = this.allId;
			var tabsHtml = '';
			for(var i=0;i<this.content.length;i++){
				var className = '';
				if(this.content[i].id == this.activeId){
					className = ' class="current"';
				}
				tabsHtml += '<li class="component-editor-tab-nav-item" nsid="'+this.content[i].id+'">'
							+	'<a href="javascript:void(0);" '+className+'>'+this.content[i].text+'</a>'
						+'</li>';
			}
			var panelHtml = '<div id="'+allId.containerId+'">'
							+'<div class="component-editor component-editor-modal fadeInDown animated">'
								+'<div class="component-editor-header" id="'+allId.titleId+'">'
									+'<h4 class="component-editor-title">'+config.title+'</h4>'
									+'<ul class="component-editor-tab-nav">'
										+tabsHtml
									+'</ul>'
								+'</div>'
								+'<div class="component-editor-body" id="'+allId.bodyId+'">'
								+'</div>'
								+'<div class="component-editor-footer" id="'+allId.footerId+'">'
									+'<div class="btn-group">'
										+'<button class="btn btn-info">'
											+'<i class="fa fa-save"></i>'
											+'<span>确定</span>'
										+'</button>'
										+'<button class="btn btn-info">'
											+'<i class="fa fa-close"></i>'
											+'<span>关闭</span>'
										+'</button>'
									+'</div>'
								+'</div>'
							+'</div>'
							+'<div class="fadeIn animated" style="position: fixed;top: 0;right: 0;bottom: 0;left: 0;background: rgba(0, 0, 0, 0.5);z-index: 1048;"></div>'
						+'</div>'
			var $panel = $(panelHtml);
			this.initPanelEvent($panel);
			return $panel;
		},
		// tab页切换
		setActiveTab:function(){
			var activeId = this.activeId;
			var $activeTab = this.$tabs.eq(0);
			for(var i=0;i<this.$tabs.length;i++){
				if(this.$tabs.eq(i).children().hasClass('current')){
					$activeTab = this.$tabs.eq(i);
				}
			}
			var currentTabId = $activeTab.attr('nsid');
			//如果当前的要切换的一样就不用执行了
			if(currentTabId == activeId){
				return;
			}
			//移除和添加active class
			$activeTab.children().removeClass('current');
			for(var i=0;i<this.$tabs.length;i++){
				if(this.$tabs.eq(i).attr('nsid') == activeId){
					this.$tabs.eq(i).children().addClass('current');
				}
			}
			this.refreshTabsPanel(activeId); 
		},
		// 初始化面板事件
		initPanelEvent:function($panel){
			var allId = this.allId;
			var $tabs = $panel.find('#'+allId.titleId).children('ul').children('li');
			var $btns = $panel.find('#'+allId.footerId).children('.btn-group').children('button');
			this.$tabs = $tabs;
			this.$btns = $btns;
			var _this = this;
			$tabs.on('click',function(){
				var $this = $(this);
				var liNsId = $this.attr('nsid');
				_this.activeId = liNsId;
				_this.saveData();
				_this.setActiveTab();
			})
			$btns.on('click',function(){
				var $this = $(this);
				var $i = $this.children();
				if($i.hasClass('fa-save')){
					_this.saveData();
					if(typeof(_this.config.confirmHandler)=='function'){
						var formatValueData = nsWorkFlow.formatValue(_this.value);
						_this.config.confirmHandler(formatValueData);
					}
				}
				if($i.hasClass('fa-close')){
					_this.closePanel();
					if(typeof(_this.config.closeHandler)=='function'){
						_this.saveData();
						_this.config.closeHandler(_this.sourceValue,_this.value);
					}
				}
			})
		},
		// 设置面板默认值
		setPanelValue:function(formArr){
			var values = this.value;
			// 添加value值 获得需处理的隐藏字段
			var setField = [];
			for(var fieldI=0;fieldI<formArr.length;fieldI++){
				var fieldId = formArr[fieldI].id;
				if(values[fieldId]){
					formArr[fieldI].value = values[fieldId];
					if(typeof(formArr[fieldI].changeHandlerData)=='object'){
						var changeHandlerDataObj = formArr[fieldI].changeHandlerData[formArr[fieldI].value];
						if(changeHandlerDataObj){
							setField.push(changeHandlerDataObj);
						}
					}
				}
			}
			function setAttrByShowAttr(fieldArr,setObj){
				var setType = '';
				for(var attrType in setObj){
					setType = attrType;
				}
				for(var i=0;i<fieldArr.length;i++){
					if(typeof(setObj[setType][fieldArr[i].id])!='undefined'){
						fieldArr[i][setType] = setObj[setType][fieldArr[i].id];
					}
				}
			}
			// 根据获得的隐藏字段id编辑隐藏字段
			for(var j=0;j<setField.length;j++){
				setAttrByShowAttr(formArr,setField[j])
			}
		},
		// 刷新面板
		refreshTabsPanel:function(nsId){
			var formArr = this.fields[nsId];
			this.setPanelValue(formArr);
			var allId = this.allId;
			var formJson = {
				id:  		allId.bodyId,
				size: 		"standard",
				format: 	"standard",
				fillbg: 	true,
				form:		formArr,
			}
			formPlane.formInit(formJson);
		},
		// 关闭弹框
		closePanel:function(){
			var allId = this.allId;
			$('#'+allId.containerId+' .component-editor-modal').removeClass('fadeInDown').addClass('fadeOutUp');
			$('#'+allId.containerId+' .component-editor-modal').siblings('.fadeIn').removeClass('fadeIn').addClass('fadeOut');
			$('#'+allId.containerId+' .component-editor-modal').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
				$('#'+allId.containerId).remove();
			});
		},
		// 初始化面板数据
		initPanelData:function(tabArr){
			for(var i=0;i<tabArr.length;i++){
				var tabContent = tabArr[i];
				var tabObj = {
					id:tabContent.fieldType,
					text:tabContent.title,
				}
				this.content.push(tabObj);
				this.fields[tabContent.fieldType] = tabContent.field;
			}
		},
		// 初始化id
		initID:function(souId){
			var configId = this.config.id;
			var allId = {};
			allId.containerId = configId + '-container';
			allId.titleId = configId + '-title';
			allId.bodyId = configId + '-body';
			allId.footerId = configId + '-footer';
			this.allId = allId;
		},
		// 保存数据
		saveData:function(){
			var formData = nsForm.getFormJSON(this.allId.bodyId,false);
			var value = this.value;
			for(var key in formData){
				value[key] = formData[key];
			}
			// 删除空
			for(var key in value){
				if(value[key]==''){
					delete value[key];
				}
			}
		},
		init:function(config){
			this.config = config;
			this.fields = {};
			this.content = [];
			this.initID();
			this.initPanelData(config.tab);
			this.activeId = this.content[0].id;
			this.sourceValue = $.extend(true,{},config.value);
			this.value = $.extend(true,{},config.value);
			var $panel = this.getPanelHtml();
			$('body').append($panel);
			this.refreshTabsPanel(this.activeId)
		},
	},
	// 初始化字段的subdata配置通过config参数
	initFieldsByConfig:function(){
		var config = this.config;
		this.pageFormData.transactorSet.transactorsDef.user.userOfOtherActivity.subdata = config.beforeProcessSub; 
		this.pageFormData.transactorSet.transactorsDef.role.deptOfOtherActivity.subdata = config.beforeProcessSub;
		this.pageFormData.transactorSet.transactorsDef.post.deptOfOtherActivity.subdata = config.beforeProcessSub;
		this.pageFormData.convergingSet.outgoingDomId.subdata = config.beforeProcessSub;
		this.pageFormData.convergingSet.mustTos.subdata = config.beforeProcessSub;

		this.pageFormData.transferSet.incomingDomId.subdata = config.afterProcessSub;
	},
	init:function(config){
		var isTrue = this.validData(config);
		if(isTrue){
			this.config = $.extend(true,{},config);
			this.initValue();
			this.initFieldsByConfig();
			this.initTabsData(this.config);
			this.page.init(this.config);
		}
	},
	prototype:{
		data:{
			original:{},//原始值
			activities:[],//当前活动的流程环节
			transitions:[],//当前环节之间的线连接
			processJson:{},//根据id存储相关联的数据
			processName:'',//当前操作的流程图标题
			/*activityJson:{},//操作编辑的数据  存放当前编辑需要填充的数据值根据domId存放
			configFunc:{
				configDialog:function(app, cell, data){
					app.getAllActivities();
				},
			}*/
		},
		funcConfig:{},
		configDialog:function(cell,data){
			var json = {
				api:this,
				cell:cell,
				data:data
			};
			json.data = this.data.processJson[cell.id];
			var deadlinesArr = this.data.deadlines ? this.data.deadlines : [];
			var startTimerStr = '';
			var endTimerStr = '';
			for(var i=0; i<deadlinesArr.length; i++){
				if(deadlinesArr[i].startDomId == cell.id){
					startTimerStr += deadlinesArr[i].deadlineName+',';
				}
				if(deadlinesArr[i].closeDomId == cell.id){
					endTimerStr += deadlinesArr[i].deadlineName+',';
				}
			}
			startTimerStr = startTimerStr.substring(0,startTimerStr.length-1);
			endTimerStr = endTimerStr.substring(0,endTimerStr.length-1);
			json.data.deadlinesToStart = startTimerStr;
			json.data.deadlinesToEnd = endTimerStr;

			if(typeof(this.funcConfig.configDialog)=='function'){
				this.funcConfig.configDialog(json);//ui方法
			}
		},
		deadlineDialog:function(){
			var json = {
				api:this,
			}
			if(typeof(this.funcConfig.deadlineDialog)=='function'){
				this.funcConfig.deadlineDialog(json);//ui方法
			}
		},//时限设置  弹框事件触发
		saveDeadlines:function(data){
			var deadlinesArr = [];
			for(var i=0; i<data.length; i++){
				deadlinesArr.push(data[i]);
			}
			this.data.deadlines = deadlinesArr;
		},//保存时限设置  deadlines
		configFunc:function(funcConfig){
			/**
				*configDialog  	配置事件的触发
				*saveAjax    	保存配置
				   *url  type  data callback
				getAjax   读取xml配置
					*url  type  data callback
				deadlineDialog 时限设置  弹框事件触发
				saveDeadlines 	保存时限设置  deadlines
			*/
			this.funcConfig = funcConfig;
		},//配置事件弹框
		setCurrentLineDataByCell:function(cell){
			console.log(cell)
		},//添加线的相关配置数据
		delCurrentLineDataByCell:function(cell){

		},//删除线的相关配置数据
		init:function(res){
			var jsonData = {};
			var originalData = JSON.parse(res);
			var resData = JSON.parse(res);
			for(var resI=0; resI<resData.activities.length; resI++){
				jsonData[resData.activities[resI].domId] = resData.activities[resI];
			}
			for(var lineI=0; lineI<resData.transitions.length; lineI++){
				jsonData[resData.transitions[lineI].domId] = resData.transitions[lineI];
			}
			this.data = {
				processName:resData.processName?resData.processName:'',//流程图标题没有则赋值空
				original:originalData,
				activities:originalData.activities,
				transitions:originalData.transitions,
				processJson:jsonData,
				deadlines:[],
			};
		},//初始化数据
		getCurrentLineDataById:function(fromDomId,toDomId){
			/*
				*fromDomId  起始连线点
				*toDomId 	结束连线点
			*/
			var lineIndex = -1;
			for(var lineI=0; lineI<this.data.transitions.length; lineI++){
				var tData = this.data.transitions[lineI];
				if(tData.fromDomId == fromDomId && tData.toDomId == toDomId){
					//根据起始点和结束点判断值相等则返回
					lineIndex = lineI;
					break;
				}
			}
			if(lineIndex == -1){
				console.log('不存在');
				return {};
			}
			return this.data.transitions[lineIndex] ? this.data.transitions[lineIndex] : {};
		},//获取到线的相关配置数据
		getCurrentProcessDataById:function(id){
			return this.data.processJson[id] ? this.data.processJson[id] : {};
		},//获取环节流程的相关配置数据
		getConfig:function(id){
			return this.data.processJson[id] ? this.data.processJson[id] : {};
		},//根据id获取当前流程数据
		saveConfig:function(id, config){
			//ok
			var json = this.data.processJson[id];
			if(typeof(json)!='object'){
				this.data.processJson[id] = {};
				json = this.data.processJson[id];
			}
			for(var data in config){
				json[data] = config[data];
			}
		},//保存配置参数
		isProcessByStyle:function(style){
			var shapeReg = /;shape=(.*?);/;
			//var styleStr = shapeReg.exec(';'+style);
			var isProcess = true;//默认操作是流程
			if(style.indexOf('edgeStyle')>-1){
				isProcess = false;//操作的线
			}
			return isProcess;
		},//根据样式判断当前操作的是线还是流程
		getXml:function(){
			var graphXml = this.dom.editor.getGraphXml();
			return graphXml;
		},//获取当前显示的画布
		getObjectData:function(){
			var res = this.getAllActivitiesAndLine();
			var json = {
				processName:this.data.processName ? this.data.processName : '',
				processId:this.funcConfig.processId,
				activities:res.processArr,
				transitions:res.lineArr,
			}
			if(this.data.deadlines){json.deadlines = this.data.deadlines;}
			return json;
		},//获取json格式的数据
		getData:function(){
			if(this.funcConfig.getAjax){
				var getAjaxConfig = this.funcConfig.getAjax;
				var params = {processId:urlParams.processId,processName:urlParams.processName};
				var url = getAjaxConfig.url;
				var appThis = this.dom;
				var pThis = this;
				this.getAjax(url,params,function(res){
					res = JSON.parse(res);
					if(res.success == true){
						//var resData = JSON.parse(res.data.json);
						var xml = res.data.xml;
						if(xml){
							//存在
							// var editorUi = appThis.actions.editorUi;
							// var data = editorUi.editor.graph.zapGremlins(mxUtils.trim(xml));
							// editorUi.editor.setGraphXml(mxUtils.parseXml(data).documentElement);
							// editorUi.editor.graph.model.endUpdate();
							// editorUi.editor.graph.stopEditing();
							// if(res.data.processName){
							// 	appThis.fname.innerHTML = '';
							// 	mxUtils.write(appThis.fname, res.data.processName);
							// 	appThis.fname.setAttribute('title', res.data.processName + ' - ' + mxResources.get('rename'));
							// }

							

							var editorSetGraphXml = Editor.prototype.setGraphXml;
							Editor.prototype.setGraphXml = function(node)
							{
								node = (node != null && node.nodeName != 'mxlibrary') ? this.extractGraphModel(node) : null;

								if (node != null)
								{
									// Checks input for parser errors
									var errs = node.getElementsByTagName('parsererror');
									
									if (errs != null && errs.length > 0)
									{
										var elt = errs[0];
										var divs = elt.getElementsByTagName('div');
										
										if (divs != null && divs.length > 0)
										{
											elt = divs[0];
										}
										
										throw {message: mxUtils.getTextContent(elt)};
									}
									else if (node.nodeName == 'mxGraphModel')
									{
										var style = node.getAttribute('style') || 'default-style2';
										
										// Decodes the style if required
										if (urlParams['embed'] != '1' && (style == null || style == ''))
										{
											var node2 = (this.graph.themes != null) ?
												this.graph.themes['default-old'] :
												mxUtils.load(STYLE_PATH + '/default-old.xml').getDocumentElement();
										    
										    if (node2 != null)
										    {
										    	var dec2 = new mxCodec(node2.ownerDocument);
										    	dec2.decode(node2, this.graph.getStylesheet());
										    }
										}
										else if (style != this.graph.currentStyle)
										{
										    var node2 = (this.graph.themes != null) ?
												this.graph.themes[style] :
												mxUtils.load(STYLE_PATH + '/' + style + '.xml').getDocumentElement()
										    
										    if (node2 != null)
										    {
										    	var dec2 = new mxCodec(node2.ownerDocument);
										    	dec2.decode(node2, this.graph.getStylesheet());
										    }
										}
							
										this.graph.currentStyle = style;
										this.graph.mathEnabled = (urlParams['math'] == '1' || node.getAttribute('math') == '1');
										
										var bgImg = node.getAttribute('backgroundImage');
										
										if (bgImg != null)
										{
											bgImg = JSON.parse(bgImg);
											this.graph.setBackgroundImage(new mxImage(bgImg.src, bgImg.width, bgImg.height));
										}
										else
										{
											this.graph.setBackgroundImage(null);
										}
										
										mxClient.NO_FO = ((this.graph.mathEnabled && !this.useForeignObjectForMath)) ?
											true : this.originalNoForeignObject;
										
										this.graph.useCssTransforms = !mxClient.NO_FO &&
											this.isChromelessView() &&
											this.graph.isCssTransformsSupported();
										this.graph.updateCssTransform();

										this.graph.setShadowVisible(node.getAttribute('shadow') == '1', false);
									}
							
									// Calls updateGraphComponents
									editorSetGraphXml.apply(this, arguments);
								}
								else
								{
									throw { 
									    message: mxResources.get('notADiagramFile') || 'Invalid data',
									    toString: function() { return this.message; }
									};
								}
							};

							// Editor.prototype.setGraphXml = function(node){
							// 	console.log(node)
							// }
							//test cy 181010
							var editorUi = appThis.actions.editorUi;
							var testXML = mxUtils.trim(xml);
							var node = mxUtils.parseXml(testXML).documentElement;
							editorUi.editor.setGraphXml(node);
						}
						pThis.dom.editor.setStatus('');
						pThis.init(res.data.json);
					}
				});
			}
		},
		getAjax:function(url, data, fn,method){
			method = method ? method : 'get';//默认请求方式get
			var Ajax = {
				get: function(url, fn) {
					// XMLHttpRequest对象用于在后台与服务器交换数据   
					var xhr = new XMLHttpRequest();            
					xhr.open('GET', url, true);
					xhr.onreadystatechange = function() {
						// readyState == 4说明请求已完成
						if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 304) { 
							// 从服务器获得数据 
							fn.call(this, xhr.responseText);  
						}
					};
					xhr.send();
				},
				// datat应为'a=a1&b=b1'这种字符串格式，在jq里如果data为对象会自动将对象转成这种字符串格式
				post: function (url, data, fn) {
					var xhr = new XMLHttpRequest();
					xhr.open("POST", url, true);
					// 添加http头，发送信息至服务器时内容编码类型
					xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");  
					xhr.onreadystatechange = function() {
						if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
							fn.call(this, xhr.responseText);
						}
					};
					xhr.send(data);
				}
			}
			if(method == 'get'){
				Ajax.get(url,fn);
			}else{
				Ajax.post(url,data,fn);
			}
		},//调用ajax
		saveAjax:function(){
			var xml = this.getXml().outerHTML;
			var json = this.getObjectData();
			var params = {
				xml:xml,
			}
			params.json = JSON.stringify(json);
			console.log(params)
			console.log(xml)
			if(this.funcConfig.saveAjax){
				var url = this.funcConfig.saveAjax.url;
				var method = this.funcConfig.saveAjax.type ? this.funcConfig.saveAjax.type : 'post';
				method = method.toLocaleLowerCase(method);
				var saveConfig = this;
				this.getAjax(url,params,function(res){
					if(res.success){
						var json = {
							api:saveConfig,
							data:res
						}
						if(typeof(saveConfig.funcConfig.saveAjax.callBack)=='function'){
							return saveConfig.funcConfig.saveAjax.callBack(json);
						}
						console.log(res)
					}
				},method);
			}
		},
		getAllActivitiesAndLine:function(){
			//1.  判断是否存在开始 如果不存在就不获取 获取所有环节和线
			//2. 遍历环节获取开始
			//3. 根据开始环节获取所有环节的顺序
			//4. 根据此时顺序获取具体环节信息返回【获取所有环节功能】
			
			//在3的基础上，获取指定domId的后续环节
			//根据 domId 遍历获取所有后续环节
			//根据 3 的顺序判断后续环节有没有顺序号在指定domId前的
			var xml = this.getXml().outerHTML;
			var x2js = new X2JS();
			var jsonObj = x2js.xml_str2json(xml);
			var nodes = jsonObj.mxGraphModel.root.mxCell;
			var shapeReg = /;shape=(.*?);/;
			var processArr = [];
			var lineArr = [];
			var startDomId = -1;
			for(var nodeI=0; nodeI<nodes.length; nodeI++){
				var nodeData = nodes[nodeI];
				if(nodeData._style){
					if(nodeData._edge){
						//线
					}else{
						//环节
						var style = shapeReg.exec(';'+nodeData._style);
						var shape = style[1];
						if(shape == 'mxgraph.flowchart.start_1' || shape == 'mxgraph.flowchart.start_2'){
							//找到其开始位置
							startDomId = nodeData._id;
							break;
						}
					}
				}
			}
			if(startDomId == -1){
				console.log(this.dom.handleError)
				this.dom.handleError({message:'未找到其开始环节'});
				return {
					lineArr:[],
					processArr:[]
				}
			}
			/*0开始环节 start_1 start_2
			1普通环节  只要有shape都是普通
			2结束环节 terminator
			3哑环节 自动签收，自动转移，不需要信息通知和接口调用   mxgraph.flowchart.loop_limit
			4 子流程环节 process
			5 会签环节  trapezoid*/
			var shapeJson = this.funcConfig.shape ? this.funcConfig.shape : {};
			for(var nodeI=0; nodeI<nodes.length; nodeI++){
				var nodeData = nodes[nodeI];
				var cJson = this.data.processJson[nodeData._id] ? this.data.processJson[nodeData._id] : {};
				var configData = JSON.parse(JSON.stringify(cJson));
				if(nodeData._style){
					var style = shapeReg.exec(';'+nodeData._style);
					//activityType
					if(style){
						//存在样式
						configData.domId = nodeData._id;
						configData.activityName = nodeData._value;
						//configData.activityType = style[1];
						var isNormal = true;//默认是普通环节
						var shapeStr;
						for(var shape in shapeJson){
							var shapeType = 'mxgraph.flowchart.'+shape;
							if(shapeType == style[1]){
								isNormal = false;
								shapeStr = shapeJson[shape];
								break;
							}
						}
						if(isNormal){shapeStr = 1;}
						configData.activityType = shapeStr;
						processArr.push(configData);
					}else if(nodeData._style.indexOf('edgeStyle')>-1){
						configData.fromDomId = nodeData._source;
						configData.toDomId = nodeData._target;
						configData.transitionTag = nodeData._value;
						lineArr.push(configData);
					}
				}
			}
			//startDomId
			var map = this.getOrderMap(startDomId,lineArr);
			return{
				lineArr:lineArr,
				processArr:processArr,
				orderMap:map
			};
		},//获取所有环节/获取所有连接线
		getAllActivities:function(){
			return this.getAllActivitiesAndLine().processArr;
		},//获取所有环节
		getBeforeActivities:function(domId){
			return this.getActivitiesByDomId(domId,'before');
		},//指定环节的前驱环节
		getAfterActivities:function(domId){
			return this.getActivitiesByDomId(domId,'after');
		},//获取指定环节的后续环节
		getOrderMap:function(id, lineArr){
			var domIdArr = [];
			var domIdCache = {};
			var waitArr = [id];
			function getToDomIds(fromDomId){
				var result = [];
				for(var lineI=0; lineI<lineArr.length; lineI++){
					var lineData = lineArr[lineI];
					if(lineData.fromDomId == domId){
						result.push(lineData.toDomId);
					}
				}
				return result;
			}
			while(waitArr.length > 0){
				var domId = waitArr.shift();
				if(!domIdCache[domId]){
					domIdCache[domId] = true;
					domIdArr.push(domId);
					var toDomIds = getToDomIds(domId);
					toDomIds.filter(id => !domIdCache[id]).forEach(id => waitArr.push(id));
				}
			}
			var map = {}; 
			for(var i = 0; i < domIdArr.length; i++)map[domIdArr[i]] = i;
			return map;
		},
		getAscOrder:function(id,lineArr){
			var domIdArr = [];
			var domIdCache = {};
			function getLineArr(domId){
				if(domIdCache[domId]){
					return;
				}
				domIdCache[domId] = true;
				for(var lineI=0; lineI<lineArr.length; lineI++){
					var lineData = lineArr[lineI];
					if(lineData.fromDomId == domId){
						if(domIdArr.indexOf(lineData.toDomId) == -1){
							domIdArr.push(lineData.toDomId);
						}
						getLineArr(lineData.toDomId);
					}
				}
			}
			getLineArr(id);
			return domIdArr;
		},//根据开始排序获取所有
		getDescOrder:function(id,lineArr){
			var domIdArr = [];
			var domIdCache = {};
			function getLineArr(domId){
				if(domIdCache[domId]){
					return;
				}
				domIdCache[domId] = true;
				for(var lineI=0; lineI<lineArr.length; lineI++){
					var lineData = lineArr[lineI];
					if(lineData.toDomId == domId){
						if(domIdArr.indexOf(lineData.fromDomId) == -1){
							domIdArr.push(lineData.fromDomId);
						}
						getLineArr(lineData.fromDomId);
					}
				}
			}
			getLineArr(id);
			return domIdArr;
		},//根据开始排序获取所有
		getActivitiesByDomId:function(domId,action){
			var dataJson = this.getAllActivitiesAndLine();
			var processArr = dataJson.processArr;
			var lineArr = dataJson.lineArr;
			var orderMap = dataJson.orderMap;
			//console.log(orderMap)
			var arr = [];
			switch(action){
				case 'after':
					//读取后续环节
					var afterMapArr = this.getAscOrder(domId,lineArr);
					for(var i=0; i<afterMapArr.length; i++){
						var data = afterMapArr[i];
						if(orderMap[domId] < orderMap[data]){
							arr.push(data);
						}
					}
					break;
				case 'before':
					//读取前续环节
					var beforeArr = this.getDescOrder(domId,lineArr);
					for(var i=0; i<beforeArr.length; i++){
						var data = beforeArr[i];
						if(orderMap[domId] > orderMap[data]){
							arr.push(data);
						}
					}
					break;
			}
			var activityJson = {};
			for(var p=0; p<processArr.length; p++){
				activityJson[processArr[p].domId] = processArr[p];
			}
			return arr.map(i => activityJson[i]);
		},//获取指定环节的后续环节/指定环节的前驱环节
		getIncomings:function(fromDomId){
			var lineArr = this.getAllProcessAndLine().lineArr;
			var fromArr = [];
			for(var lineI=0; lineI<lineArr.length; lineI++){
				if(lineArr[lineI].fromDomId == fromDomId){
					fromArr.push(lineArr[lineI]);
				}
			}
			return fromArr;
		},//获取指定节点转移
		getOutgoings:function(toDomId){
			var lineArr = this.getAllProcessAndLine().lineArr;
			var toArr = [];
			for(var lineI=0; lineI<lineArr.length; lineI++){
				if(lineArr[lineI].toDomId == toDomId){
					toArr.push(lineArr[lineI]);
				}
			}
			return toArr;
		},//指定环节的汇聚
		linkconfig:function(_json){
			var graph = _json.graph;
			var ui = _json.ui;
			var cell = graph.getSelectionCell() || graph.getModel().getRoot();
			//sjj20180927
			//var isEdge = graph.model.isEdge(cell);
			var activityJson = {};
			if(cell.isEdge()){
				var fromDomId = cell.source.copySourceId ? cell.source.copySourceId : cell.source.id;
				var toDomId = cell.target.copySourceId ? cell.target.copySourceId : cell.target.id;
				//var data = ui.process.getCurrentLineDataById(fromDomId,toDomId);
				//activityJson = JSON.parse(JSON.stringify(data));
				activityJson.transitionTag = cell.value;
				activityJson.fromDomId = cell.source.id;
				activityJson.toDomId = cell.target.id;
				activityJson.domId = cell.id;
			}else{
				//流程
				var domId = cell.copySourceId ? cell.copySourceId : cell.id;
				//var data = ui.process.getCurrentProcessDataById(domId);
				//activityJson = JSON.parse(JSON.stringify(data));
				activityJson.activityName = cell.value;
				activityJson.domId = cell.id;
				var isNormal = true;//默认是普通环节
				var shapeStr;
				var shapeJson = ui.process.funcConfig.shape ? ui.process.funcConfig.shape : {};
				var shapeReg = /;shape=(.*?);/;
				var style = shapeReg.exec(';'+cell.style);
				for(var shape in shapeJson){
					var shapeType = 'mxgraph.flowchart.'+shape;
					if(shapeType == style[1]){
						isNormal = false;
						shapeStr = shapeJson[shape];
						break;
					}
				}
				if(isNormal){shapeStr = 1;}
				activityJson.activityType = shapeStr;
			};
			ui.process.data.processJson[cell.id] = ui.process.data.processJson[cell.id] ? ui.process.data.processJson[cell.id] : {};
			for(var value in activityJson){
				ui.process.data.processJson[cell.id][value] = activityJson[value];
			}
			ui.process.configDialog(cell,ui.process.data.processJson[cell.id]);
		},//点击节点配置触发事件
		addUnsavedStatus:function(){
			var ui = this.dom;
			ui.editor.setStatus('<div class="geStatusAlert" style="cursor:pointer;overflow:hidden;">' +
			mxUtils.htmlEntities(mxResources.get('unsavedChangesClickHereToSave')) + '</div>');
			var links = ui.statusContainer.getElementsByTagName('div');
			if (links.length > 0)
			{
				mxEvent.addListener(links[0], 'click', mxUtils.bind(this, function()
				{
					ui.actions.get((ui.dom.mode == null) ? 'saveAs' : 'save').funct();
				}));
			}
		}
	}
}