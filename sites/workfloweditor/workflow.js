// var serverUrl = 'http://api.cloud.netstar-soft.com';
var serverUrl = 'http://api.cloud.netstar-soft.com';
var urlConfig = store.get('NetstarResetServerInfo');
if(urlConfig && urlConfig.url){
	serverUrl = urlConfig.url;
}
getRootPath = function(){
	return serverUrl;
}
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
            cannotReplay:'0',
            noNeedTransactor:'0'
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
        cannotReplay:'baseAttr-moreSet',
        noNeedTransactor: 'baseAttr-moreSet',
	},
	// 保存字段的key值 {id:'',type:''} --> {name:{id:''},type:''}
	fieldParentName:{
		n:'incomingDef',
		mustTos:'incomingDef',
		'outgoingDef-application':'outgoingDef',
		'outgoingDef-group':'outgoingDef',
		'timerDuration':'timerDef',
		'timerType':'timerDef',
		'timerWay':'timerDef',
		'timerDef-application':'timerDef',
		'group':'timerDef',
        'mileStoneApp': 'timerDef',
        'mileStoneApi': 'timerDef',
		
        'beforeCompleteApp': 'callbackDef',
        'beforeCompleteApi': 'callbackDef',
        'afterCompleteApp': 'callbackDef',
        'afterCompleteApi': 'callbackDef',
        'beforeForwardApp': 'callbackDef',
        'beforeForwardApi': 'callbackDef',
        'afterForwardApp': 'callbackDef',
        'afterForwardApi': 'callbackDef',
        'beforeRollbackApp': 'callbackDef',
        'beforeRollbackApi': 'callbackDef',
        'afterRollbackApp': 'callbackDef',
        'afterRollbackApi': 'callbackDef',
        'pendingToWaitingApp': 'callbackDef',
        'pendingToWaitingApi': 'callbackDef',
        'afterArchivedApp': 'callbackDef',
        'afterArchivedApi': 'callbackDef',
        
        'startIdsWhenWaiting':'deadlineDef',
        'startIdsWhenCompleted':'deadlineDef',
        'startIdsWhenForwarded':'deadlineDef',
        'closeIdsWhenWaiting':'deadlineDef',
        'closeIdsWhenCompleted':'deadlineDef',
        'closeIdsWhenForwarded':'deadlineDef',
	},
	// 需要拆分的值 {name:{id:''},type:''} --> {id:'',type:''}
	fieldHaveChild:{
		incomingDef:{},
		outgoingDef:{},
		timerDef:{},
        callbackDef: {},
        deadlineDef: {},
	},
	// 所有表单数据
	pageFormData:{
		// 基本属性
		baseAttr:{
			activityName:{
				id:'activityName',
				label:'活动名称',
				type:'text',
				readonly:true,
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
					{ id:'autoComplete',name:'自动签收' },//0 自动,1 手动
					{ id:'autoForward',name:'自动转移' },//0 自动,1 手动
					{ id:'endFlag',name:'可终止流程' },//0 false
					{ id:'canNotRollBack',name:'不可驳回' },//0 false
					{ id:'loopFlag',name:'自循环  ' },//0 false
					{ id:'doWhenforward',name:'提交时输入办理意见' },//0 false
					{ id:'doWhenRollBack',name:'驳回时输入办理意见' },//0 false
                    { id:'cannotReplay',name:'禁止复盘  '},
                    { id:'autoCompleteBridge',name:'自动签收接口' },
                    { id:'autoForwardBridge',name:'自动转移接口' },
                    { id:'noNeedTransactor',name:'不需要办理人' },
				],
                changeHandler: function () {
                    var formJson = nsForm.getFormJSON('dialog-body');
                    var thisSelectId = formJson['baseAttr-moreSet'];
                    var loopFlagType = formJson['loopFlagType'];
                    var endFlagType = formJson['endFlagType'];
                    var editLoopArr = [{
                        id: 'loopFlagType',
                    }, {
                        id: 'loopFlagExpression',
                    }, {
                        id: 'loopFlagExpression',
                    }, {
                        id: 'loopFlagApplication',
                    }, {
                        id: 'loopFlagGroup',
                    }]
                    var editEndArr = [{
                        id: 'endFlagType',
                    }, {
                        id: 'endFlagExpression',
                    }, {
                        id: 'endFlagExpression',
                    }, {
                        id: 'endFlagApplication',
                    }, {
                        id: 'endFlagGroup',
                    }]
                    var editCompleteModeArr = [
                        {
                            id: 'completeModeExpression'
                        },{
                            id: 'completeModeApplication'
                        },{
                            id: 'completeModeGroup'
                        }
                    ]
                    var editForwardModeArr = [
                        {
                            id: 'forwardModeExpression'
                        },{
                            id: 'forwardModeApplication'
                        },{
                            id: 'forwardModeGroup'
                        }
                    ]
					if(typeof(thisSelectId)!='undefined'&&thisSelectId.indexOf('loopFlag') > -1){
                        editLoopArr.forEach(obj => obj.hidden = false);
                        switch (loopFlagType) {
                            case 'mvel':
                                editLoopArr[3].hidden = true;
                                editLoopArr[4].hidden = true;
                                break;
                            case 'bridge':
                                editLoopArr[3].hidden = false;
                                editLoopArr[4].hidden = false;
                                break;
                        }
					}else{
                        editLoopArr.forEach(obj => obj.hidden = true);
					}
                    if(typeof(thisSelectId)!='undefined'&&thisSelectId.indexOf('endFlag') > -1){
                        editEndArr.forEach(obj => obj.hidden = false);
                        switch (endFlagType) {
                            case 'mvel':
                                editEndArr[3].hidden = true;
                                editEndArr[4].hidden = true;
                                break;
                            case 'bridge':
                                editEndArr[3].hidden = false;
                                editEndArr[4].hidden = false;
                                break;
                        }
                    }else{
                        editEndArr.forEach(obj => obj.hidden = true);
                    }
                    if (typeof(thisSelectId)!='undefined' && thisSelectId.indexOf('autoCompleteBridge') > -1){
                        editCompleteModeArr.forEach(obj => obj.hidden = false);
                    } else {
                        editCompleteModeArr.forEach(obj => obj.hidden = true);
                    }
                    if (typeof(thisSelectId)!='undefined' && thisSelectId.indexOf('autoForwardBridge') > -1){
                        editForwardModeArr.forEach(obj => obj.hidden = false);
                    } else {
                        editForwardModeArr.forEach(obj => obj.hidden = true);
                    }
                    nsForm.edit(editLoopArr.concat(editEndArr).concat(editCompleteModeArr).concat(editForwardModeArr), 'dialog-body');
				},
            },
            loopFlagType: {
                id: 'loopFlagType',
                label: '自循环条件方式',
                type: 'radio',
                column: 12,
                textField: 'name',
                valueField: 'id',
                subdata: [{
                    id: 'mvel',
                    name: '条件表达式',
                    isChecked: true,
                }, {
                    id: 'bridge',
                    name: '转移接口',
                    isChecked: false,
                }],
                changeHandler: function (value) {
                    var loopApp = nsForm.getFormJSON(nsWorkFlow.page.allId.bodyId)['loopFlagApplication'];
                    var editArr = [{
                        id: 'loopFlagExpression',
                    }, {
                        id: 'loopFlagApplication',
                    }, {
                        id: 'loopFlagGroup',
                        data: {
                            application: loopApp ? loopApp : '',
                            interfaceClazz: 'com.netstar.nsworkflow.engine.transition.TransitionBridge'
                        },
                    }]
                    switch (value) {
                        case 'mvel':
                            editArr[1].hidden = true;
                            editArr[2].hidden = true;
                            break;
                        case 'bridge':
                            editArr[1].hidden = false;
                            editArr[2].hidden = false;
                            break;
                    }
                    nsForm.edit(editArr, nsWorkFlow.page.allId.bodyId);
                }
			},
			loopFlagExpression:{
                id:'loopFlagExpression',
                label:'自循环表达式',
                type:'text',
                column:12,
				hidden:false,
            },
            loopFlagApplication: {
                id: 'loopFlagApplication',
                label: '自循环接口应用名',
                type: 'select',
                column: 6,
                data: {interfaceClazz: 'com.netstar.nsworkflow.engine.transition.TransitionBridge'},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/applications',
                changeHandler: function (value) {
                    var editObjArr = [
                        {
                            id: 'loopFlagGroup',
                            data: {
                                application: value,
                                interfaceClazz: 'com.netstar.nsworkflow.engine.transition.TransitionBridge'
                            },
                        }
                    ]
                    nsForm.edit(editObjArr, nsWorkFlow.page.allId.bodyId);
                }
            },
            loopFlagGroup: {
                id: 'loopFlagGroup',
                label: '自循环接口名',
                type: 'select',
                column: 6,
                data: {},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/groups',
			},
            endFlagType: {
                id: 'endFlagType',
                label: '条件终止条件方式',
                type: 'radio',
                column: 12,
                textField: 'name',
                valueField: 'id',
                subdata: [{
                    id: 'mvel',
                    name: '条件表达式',
                    isChecked: true,
                }, {
                    id: 'bridge',
                    name: '接口',
                    isChecked: false,
                }],
                changeHandler: function (value) {
                    var endApp = nsForm.getFormJSON(nsWorkFlow.page.allId.bodyId)['endFlagApplication'];
                    var editArr = [{
                        id: 'endFlagExpression',
                    }, {
                        id: 'endFlagApplication',
                    }, {
                        id: 'endFlagGroup',
                        data: {
                            application: endApp ? endApp : '',
                            interfaceClazz: 'com.netstar.nsworkflow.engine.transition.TransitionBridge'
                        },
                    }]
                    switch (value) {
                        case 'mvel':
                            editArr[1].hidden = true;
                            editArr[2].hidden = true;
                            break;
                        case 'bridge':
                            editArr[1].hidden = false;
                            editArr[2].hidden = false;
                            break;
                    }
                    nsForm.edit(editArr, nsWorkFlow.page.allId.bodyId);
                }
            },
            canUndoComplete: {
                id: 'canUndoComplete',
                label: '是否允许撤销结束',
                type: 'radio',
                column: 12,
                textField: 'name',
                valueField: 'id',
                subdata: [{
                    id: 'true',
                    name: '是',
                    isChecked: false,
                },{
                    id: 'false',
                    name: '否',
                    isChecked: true,
                }]
            },
            endFlagExpression:{
                id:'endFlagExpression',
                label:'条件终止表达式',
                type:'text',
                column:12,
                hidden:false,
            },
            endFlagApplication: {
                id: 'endFlagApplication',
                label: '条件终止接口应用名',
                type: 'select',
                column: 6,
                data: {interfaceClazz: 'com.netstar.nsworkflow.engine.transition.TransitionBridge'},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/applications',
                changeHandler: function (value) {
                    var editObjArr = [
                        {
                            id: 'endFlagGroup',
                            data: {
                                application: value,
                                interfaceClazz: 'com.netstar.nsworkflow.engine.transition.TransitionBridge'
                            },
                        }
                    ]
                    nsForm.edit(editObjArr, nsWorkFlow.page.allId.bodyId);
                }
            },
            endFlagGroup: {
                id: 'endFlagGroup',
                label: '条件终止接口名',
                type: 'select',
                column: 6,
                data: {},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/groups',
            },
            completeModeExpression:{
                id:'completeModeExpression',
                label:'自动签收表达式',
                type:'text',
                column:12,
                hidden:true,
            },
            completeModeApplication: {
                id: 'completeModeExpression',
                label: '自动签收接口应用名',
                type: 'select',
                column: 6,
                data: {interfaceClazz: 'com.netstar.nsworkflow.business.api.complete.ActivityCompleteMode'},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/applications',
                hidden:true,
                changeHandler: function (value) {
                    var editObjArr = [
                        {
                            id: 'completeModeGroup',
                            data: {
                                application: value,
                                interfaceClazz: 'com.netstar.nsworkflow.business.api.complete.ActivityCompleteMode'
                            },
                        }
                    ]
                    nsForm.edit(editObjArr, nsWorkFlow.page.allId.bodyId);
                }
            },
            completeModeGroup: {
                id: 'completeModeGroup',
                label: '自动签收接口名',
                type: 'select',
                column: 6,
                data: {},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/groups',
                hidden:true,
            },
            forwardModeExpression:{
                id:'forwardModeExpression',
                label:'自动转移表达式',
                type:'text',
                column:12,
                hidden:true,
            },
            forwardModeApplication: {
                id: 'forwardModeApplication',
                label: '自动转移接口应用名',
                type: 'select',
                column: 6,
                data: {interfaceClazz: 'com.netstar.nsworkflow.business.api.forward.ActivityForwardMode'},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/applications',
                hidden:true,
                changeHandler: function (value) {
                    var editObjArr = [
                        {
                            id: 'forwardModeGroup',
                            data: {
                                application: value,
                                interfaceClazz: 'com.netstar.nsworkflow.business.api.forward.ActivityForwardMode'
                            },
                        }
                    ]
                    nsForm.edit(editObjArr, nsWorkFlow.page.allId.bodyId);
                }
            },
            forwardModeGroup: {
                id: 'forwardModeGroup',
                label: '自动转移接口名',
                type: 'select',
                column: 6,
                data: {},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/groups',
                hidden:true,
            }
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
					{ id:'transactorsDef',name:'本环节办理人',isChecked: true },
					{ id:'transactorApi',name:'获取办理人接口',isChecked: false },
				],
				changeHandlerData:{
					"transactorsDef":{
						hidden:{
							transactorsDef:false,
                            application: true,
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
			},
			setOtherTransactorDef:{
				id:'setOtherTransactorDef',
				label:'需设置办理人的后续环节',
                type:'select2',
                multiple: true,
				textField:'activityName',
				valueField:'domId',
				column:12,
				subdata:[]
			},
			transactorsDef:{
				id:'transactorsDef',
				label:'本环节办理人',
				type:'transactor',
				column:12,
				hidden:false,
				user:{
					candidateUsers:{
						personAjax:		{
							url:			serverUrl + '/wfProcess/getUsers',	
							type:			'GET',
							data:			{},	
							dataSrc:		'rows',
							localDataConfig:[
								{key:'index',search:false},
								{key:'userId',search:false,isID:true},
								{key:'userName',search:true,title:'员工',type:'string',visible:1,isName:true},
								{key:'deptId',search:false,isDepart:true},
								{key:'deptName',search:true,title:'部门名称',type:'string',visible:2}
							]
						},
						groupAjax:		{
							textField:		'deptName',
							valueField:		'deptId',
							parentId:		'parentId',
							dataSrc:		'rows',
							url:			serverUrl + '/wfProcess/getDepts',	
							type:			'GET',
							data:			{},	
						}
					},
					userOfOtherActivity:{
                        type:'select',
						textField:'activityName',
						valueField:'activityId',
						subdata:[]
					},
				},
				role:{
                    role: {
						textField:'roleName',
						valueField:'roleId',
						dataSrc:'rows',
                        type:'select',
						url:serverUrl+'/wfProcess/getRoles',
					},
					candidateDept:{
						textField:'deptName',
						valueField:'deptId',
						dataSrc:'rows',
                        type:'select',
						url:serverUrl+'/wfProcess/getDepts',
					},
					deptOfOtherActivity:{
                        type:'select',
                        textField:'activityName',
                        valueField:'activityId',
						subdata:[]
					},
				},
				post:{
                    post: {
						textField:'postName',
						valueField:'postId',
						dataSrc:'rows',
                        type:'select',
						url:serverUrl+'/wfProcess/getPosts',
					},
					candidateDept:{
						textField:'deptName',
						valueField:'deptId',
						dataSrc:'rows',
                        type:'select',
						url:serverUrl+'/wfProcess/getDepts',
					},
					deptOfOtherActivity:{
                        type:'select',
                        textField:'activityName',
                        valueField:'activityId',
						subdata:[]
					},
				},
				dept:{
					candidateDept:{
						textField:'deptName',
						valueField:'deptId',
						dataSrc:'rows',
                        type:'select',
						url:serverUrl+'/wfProcess/getDepts',
					},
				},
				group:{
					candidateGroup:{
						textField:'groupName',
						valueField:'groupId',
						dataSrc:'rows',
                        type:'select',
						url:serverUrl+'/wfProcess/getGroups',
					},
				},
			},
			application:{
				id:'application',
				label:'应用名',
				type:'select',
                hidden: true,                           
				column:6,
                data: {interfaceClazz: 'com.netstar.nsworkflow.business.api.transactor.Transactor'},
				textField:'name',
				valueField:'name',
				dataSrc:'rows',
				url:serverUrl+'/dubboApi/applications',
                changeHandler: function (value) {
                    var editObjArr = [
                        {
                            id: 'api',
                            data: {
                                application: value,
                                interfaceClazz: 'com.netstar.nsworkflow.business.api.transactor.Transactor'
                            },
                            value: '',
                        }
                    ]
                    nsForm.edit(editObjArr, nsWorkFlow.page.allId.bodyId);
                }
			},
			api:{
				id:'api',
				label:'组名',
				type:'select',
				hidden:true,
				column:6,
                data: {},
				textField:'name',
				valueField:'name',
				dataSrc:'rows',
				url:serverUrl+'/dubboApi/groups',
			},
		},
        // 回调接口设置
        callbackSet: {
            'beforeCompleteApp': {
                id: 'beforeCompleteApp',
                label: '签收前',
                type: 'select',
                column: 6,
                data: {interfaceClazz: 'com.netstar.nsworkflow.business.api.callback.WorkflowCallback'},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/applications',
                changeHandler: function (value) {
                    var editObjArr = [
                        {
                            id: 'beforeCompleteApi',
                            data: {
                                application: value,
                                interfaceClazz: 'com.netstar.nsworkflow.business.api.callback.WorkflowCallback'
                            },
                            value: '',
                        }
                    ]
                    nsForm.edit(editObjArr, nsWorkFlow.page.allId.bodyId);
                }
            },
            'beforeCompleteApi': {
                id: 'beforeCompleteApi',
                type: 'select',
                column: 6,
                data: {},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/groups',
            },
            'afterCompleteApp': {
                id: 'afterCompleteApp',
                label: '签收后',
                type: 'select',
                column: 6,
                data: {interfaceClazz: 'com.netstar.nsworkflow.business.api.callback.WorkflowCallback'},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/applications',
                changeHandler: function (value) {
                    var editObjArr = [
                        {
                            id: 'afterCompleteApi',
                            data: {
                                application: value,
                                interfaceClazz: 'com.netstar.nsworkflow.business.api.callback.WorkflowCallback'
                            },
                            value: '',
                        }
                    ]
                    nsForm.edit(editObjArr, nsWorkFlow.page.allId.bodyId);
                }
            },
            'afterCompleteApi': {
                id: 'afterCompleteApi',
                type: 'select',
                column: 6,
                data: {},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/groups',
            },

            'beforeForwardApp': {
                id: 'beforeForwardApp',
                label: '提交前',
                type: 'select',
                column: 6,
                data: {interfaceClazz: 'com.netstar.nsworkflow.business.api.callback.WorkflowCallback'},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/applications',
                changeHandler: function (value) {
                    var editObjArr = [
                        {
                            id: 'beforeForwardApi',
                            data: {
                                application: value,
                                interfaceClazz: 'com.netstar.nsworkflow.business.api.callback.WorkflowCallback'
                            },
                            value: '',
                        }
                    ]
                    nsForm.edit(editObjArr, nsWorkFlow.page.allId.bodyId);
                }
            },
            'beforeForwardApi': {
                id: 'beforeForwardApi',
                type: 'select',
                column: 6,
                data: {},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/groups',
            },
            'afterForwardApp': {
                id: 'afterForwardApp',
                label: '提交后',
                type: 'select',
                column: 6,
                data: {interfaceClazz: 'com.netstar.nsworkflow.business.api.callback.WorkflowCallback'},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/applications',
                changeHandler: function (value) {
                    var editObjArr = [
                        {
                            id: 'afterForwardApi',
                            data: {
                                application: value,
                                interfaceClazz: 'com.netstar.nsworkflow.business.api.callback.WorkflowCallback'
                            },
                            value: '',
                        }
                    ]
                    nsForm.edit(editObjArr, nsWorkFlow.page.allId.bodyId);
                }
            },
            'afterForwardApi': {
                id: 'afterForwardApi',
                type: 'select',
                column: 6,
                data: {},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/groups',
            },

            'beforeRollbackApp': {
                id: 'beforeRollbackApp',
                label: '回退前',
                type: 'select',
                column: 6,
                data: {interfaceClazz: 'com.netstar.nsworkflow.business.api.callback.WorkflowCallback'},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/applications',
                changeHandler: function (value) {
                    var editObjArr = [
                        {
                            id: 'beforeRollbackApi',
                            data: {
                                application: value,
                                interfaceClazz: 'com.netstar.nsworkflow.business.api.callback.WorkflowCallback'
                            },
                            value: '',
                        }
                    ]
                    nsForm.edit(editObjArr, nsWorkFlow.page.allId.bodyId);
                }
            },
            'beforeRollbackApi': {
                id: 'beforeRollbackApi',
                type: 'select',
                column: 6,
                data: {},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/groups',
            },
            'afterRollbackApp': {
                id: 'afterRollbackApp',
                label: '回退后',
                type: 'select',
                column: 6,
                data: {interfaceClazz: 'com.netstar.nsworkflow.business.api.callback.WorkflowCallback'},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/applications',
                changeHandler: function (value) {
                    var editObjArr = [
                        {
                            id: 'afterRollbackApi',
                            data: {
                                application: value,
                                interfaceClazz: 'com.netstar.nsworkflow.business.api.callback.WorkflowCallback'
                            },
                            value: '',
                        }
                    ]
                    nsForm.edit(editObjArr, nsWorkFlow.page.allId.bodyId);
                }
            },
            'afterRollbackApi': {
                id: 'afterRollbackApi',
                type: 'select',
                column: 6,
                data: {},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/groups',
            },

            'pendingToWaitingApp': {
                id: 'pendingToWaitingApp',
                label: '未决转待办',
                type: 'select',
                column: 6,
                data: {interfaceClazz: 'com.netstar.nsworkflow.business.api.callback.WorkflowCallback'},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/applications',
                changeHandler: function (value) {
                    var editObjArr = [
                        {
                            id: 'pendingToWaitingApi',
                            data: {
                                application: value,
                                interfaceClazz: 'com.netstar.nsworkflow.business.api.callback.WorkflowCallback'
                            },
                            value: '',
                        }
                    ]
                    nsForm.edit(editObjArr, nsWorkFlow.page.allId.bodyId);
                }
            },
            'pendingToWaitingApi': {
                id: 'pendingToWaitingApi',
                type: 'select',
                column: 6,
                data: {},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/groups',
            },

            'afterArchivedApp': {
                id: 'afterRollbackApp',
                label: '归档后',
                type: 'select',
                column: 6,
                data: {interfaceClazz: 'com.netstar.nsworkflow.business.api.callback.WorkflowCallback'},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/applications',
                changeHandler: function (value) {
                    var editObjArr = [
                        {
                            id: 'afterArchivedApi',
                            data: {
                                application: value,
                                interfaceClazz: 'com.netstar.nsworkflow.business.api.callback.WorkflowCallback'
                            },
                            value: '',
                        }
                    ]
                    nsForm.edit(editObjArr, nsWorkFlow.page.allId.bodyId);
                }
            },
            'afterArchivedApi': {
                id: 'afterRollbackApi',
                type: 'select',
                column: 6,
                data: {},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/groups',
            },
        },
        // 传阅-催办人设置
        hastenSet: {
            hastenFlag: {
                id:'hastenFlag',
                label:'是否启用催办',
                type:'radio',
                textField:'name',
                valueField:'id',
                column:12,
                subdata:[
                    { id:'1',name:'是',isChecked: false },
                    { id:'0',name:'否',isChecked: true },
                ],
                changeHandlerData:{
                    "1":{
                        hidden:{
                            'hastenDef':false,
                        }
                    },
                    "0":{
                        hidden:{
                            'hastenDef':true,
                        }
                    }
                },
			},
			hastenDef:{
                id:'hastenDef',
                label:'催办人',
                type:'transactor',
                column:12,
                hidden:true,
                user:{
                    candidateUsers:{
                        personAjax:		{
                            url:			serverUrl + '/wfProcess/getUsers',
                            type:			'GET',
                            data:			{},
                            dataSrc:		'rows',
                            localDataConfig:[
                                {key:'index',search:false},
                                {key:'userId',search:false,isID:true},
                                {key:'userName',search:true,title:'员工',type:'string',visible:1,isName:true},
                                {key:'deptId',search:false,isDepart:true},
                                {key:'deptName',search:true,title:'部门名称',type:'string',visible:2}
                            ]
                        },
                        groupAjax:		{
                            textField:		'deptName',
                            valueField:		'deptId',
                            parentId:		'parentId',
                            dataSrc:		'rows',
                            url:			serverUrl + '/wfProcess/getDepts',
                            type:			'GET',
                            data:			{},
                        }
                    },
                    userOfOtherActivity:{
                        type:'select',
                        textField:'activityName',
                        valueField:'activityId',
                        subdata:[]
                    },
                },
                role:{
                    role: {
                        textField:'roleName',
                        valueField:'roleId',
                        dataSrc:'rows',
                        type:'select',
                        url:serverUrl+'/wfProcess/getRoles',
                    },
                    candidateDept:{
                        textField:'deptName',
                        valueField:'deptId',
                        dataSrc:'rows',
                        type:'select',
                        url:serverUrl+'/wfProcess/getDepts',
                    },
                    deptOfOtherActivity:{
                        type:'select',
                        textField:'activityName',
                        valueField:'activityId',
                        subdata:[]
                    },
                },
                post:{
                    post: {
                        textField:'postName',
                        valueField:'postId',
                        dataSrc:'rows',
                        type:'select',
                        url:serverUrl+'/wfProcess/getPosts',
                    },
                    candidateDept:{
                        textField:'deptName',
                        valueField:'deptId',
                        dataSrc:'rows',
                        type:'select',
                        url:serverUrl+'/wfProcess/getDepts',
                    },
                    deptOfOtherActivity:{
                        type:'select',
                        textField:'activityName',
                        valueField:'activityId',
                        subdata:[]
                    },
                },
                dept:{
                    candidateDept:{
                        textField:'deptName',
                        valueField:'deptId',
                        dataSrc:'rows',
                        type:'select',
                        url:serverUrl+'/wfProcess/getDepts',
                    },
                },
                group:{
                    candidateGroup:{
                        textField:'groupName',
                        valueField:'groupId',
                        dataSrc:'rows',
                        type:'select',
                        url:serverUrl+'/wfProcess/getGroups',
                    },
                },
			},
            ccFlag: {
                id:'ccFlag',
                label:'是否启用传阅',
                type:'radio',
                textField:'name',
                valueField:'id',
                column:12,
                subdata:[
                    { id:'1',name:'是',isChecked: false },
                    { id:'0',name:'否',isChecked: true },
                ], 
                changeHandlerData:{
                    "1":{
                        hidden:{
                            'ccDef':false,
                        }
                    },
                    "0":{
                        hidden:{
                            'ccDef':true,
                        }
                    }
                },
			},
			ccDef:{
                id:'ccDef',
                label:'传阅人',
                type:'transactor',
                column:12,
                hidden:true,
                user:{
                    candidateUsers:{
                        personAjax:		{
                            url:			serverUrl + '/wfProcess/getUsers',
                            type:			'GET',
                            data:			{},
                            dataSrc:		'rows',
                            localDataConfig:[
                                {key:'index',search:false},
                                {key:'userId',search:false,isID:true},
                                {key:'userName',search:true,title:'员工',type:'string',visible:1,isName:true},
                                {key:'deptId',search:false,isDepart:true},
                                {key:'deptName',search:true,title:'部门名称',type:'string',visible:2}
                            ]
                        },
                        groupAjax:		{
                            textField:		'deptName',
                            valueField:		'deptId',
                            parentId:		'parentId',
                            dataSrc:		'rows',
                            url:			serverUrl + '/wfProcess/getDepts',
                            type:			'GET',
                            data:			{},
                        }
                    },
                    userOfOtherActivity:{
                        type:'select',
                        textField:'activityName',
                        valueField:'activityId',
                        subdata:[]
                    },
                },
                role:{
                    role: {
                        textField:'roleName',
                        valueField:'roleId',
                        dataSrc:'rows',
                        type:'select',
                        url:serverUrl+'/wfProcess/getRoles',
                    },
                    candidateDept:{
                        textField:'deptName',
                        valueField:'deptId',
                        dataSrc:'rows',
                        type:'select',
                        url:serverUrl+'/wfProcess/getDepts',
                    },
                    deptOfOtherActivity:{
                        type:'select',
                        textField:'activityName',
                        valueField:'activityId',
                        subdata:[]
                    },
                },
                post:{
                    post: {
                        textField:'postName',
                        valueField:'postId',
                        dataSrc:'rows',
                        type:'select',
                        url:serverUrl+'/wfProcess/getPosts',
                    },
                    candidateDept:{
                        textField:'deptName',
                        valueField:'deptId',
                        dataSrc:'rows',
                        type:'select',
                        url:serverUrl+'/wfProcess/getDepts',
                    },
                    deptOfOtherActivity:{
                        type:'select',
                        textField:'activityName',
                        valueField:'activityId',
                        subdata:[]
                    },
                },
                dept:{
                    candidateDept:{
                        textField:'deptName',
                        valueField:'deptId',
                        dataSrc:'rows',
                        type:'select',
                        url:serverUrl+'/wfProcess/getDepts',
                    },
                },
                group:{
                    candidateGroup:{
                        textField:'groupName',
                        valueField:'groupId',
                        dataSrc:'rows',
                        type:'select',
                        url:serverUrl+'/wfProcess/getGroups',
                    },
                },
			}
        },
		// 时限设置
		timeSet:{
            startIdsWhenWaiting:{
				id:'startIdsWhenWaiting',
				label:'待办时启动',
                type: 'select2',
                column: 12,
                multiple: true,
                textField: 'wfDeadlineDefDeadlineName',
                valueField: 'wfDeadlineDefId',
                dataSrc: 'rows',
                url: serverUrl + '/wfProcess/getDeadlineDefList',
			},
            startIdsWhenCompleted:{
				id:'startIdsWhenCompleted',
				label:'签收时启动',
                type: 'select2',
                column: 12,
                multiple: true,
                textField: 'wfDeadlineDefDeadlineName',
                valueField: 'wfDeadlineDefId',
                dataSrc: 'rows',
                url: serverUrl + '/wfProcess/getDeadlineDefList',
			},
            startIdsWhenForwarded:{
                id:'startIdsWhenForwarded',
                label:'转移时启动',
                type: 'select2',
                column: 12,
                multiple: true,
                textField: 'wfDeadlineDefDeadlineName',
                valueField: 'wfDeadlineDefId',
                dataSrc: 'rows',
                url: serverUrl + '/wfProcess/getDeadlineDefList',
            },
            closeIdsWhenWaiting:{
                id:'closeIdsWhenWaiting',
                label:'待办时关闭',
                type: 'select2',
                column: 12,
                multiple: true,
                textField: 'wfDeadlineDefDeadlineName',
                valueField: 'wfDeadlineDefId',
                dataSrc: 'rows',
                url: serverUrl + '/wfProcess/getDeadlineDefList',
            },
            closeIdsWhenCompleted:{
                id:'closeIdsWhenCompleted',
                label:'签收时关闭',
                type: 'select2',
                column: 12,
                multiple: true,
                textField: 'wfDeadlineDefDeadlineName',
                valueField: 'wfDeadlineDefId',
                dataSrc: 'rows',
                url: serverUrl + '/wfProcess/getDeadlineDefList',
            },
            closeIdsWhenForwarded:{
                id:'closeIdsWhenForwarded',
                label:'转移时关闭',
                type: 'select2',
                column: 12,
                multiple: true,
                textField: 'wfDeadlineDefDeadlineName',
                valueField: 'wfDeadlineDefId',
                dataSrc: 'rows',
                url: serverUrl + '/wfProcess/getDeadlineDefList',
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
					{ id:'1',name:'顺序' },
					{ id:'2',name:'并行' },
					{ id:'3',name:'异或' },
					{ id:'4',name:'条件' },
					{ id:'10',name:'发散' },
					{ id:'11',name:'分批' },
                    {id: '20', name: '合并取消' },
				],
                changeHandler: function (selectId) {
                    var formData = nsForm.getFormData(nsWorkFlow.page.allId.bodyId);
                    if (formData.hasOwnProperty('outgoingDef-application')) {
                        formData['outgoingDef-application'].config.subdata = [];
                    }
                    if (formData.hasOwnProperty('outgoingDef-group')) {
                        formData['outgoingDef-group'].config.subdata = [];
                    }
					var values = nsWorkFlow.page.value;
                    if (selectId == '10' || selectId == '11') {
                        var middleActivities = [];
                        if (values['incomingDomId']) {
                            middleActivities = nsWorkFlow.prototype.getMiddleActivities(values['domId'],values['incomingDomId']);
                        }
                    }
					var editObjArr = [
						{
							id:'incomingDomId',
							value:'',
						},{
							id:'outgoingDef-application',
							value:'',
						},{
							id:'outgoingDef-group',
							value:'',
						},{
					        id:'validations',
                            value:'',
                        }
					]
                    switch (selectId) {
                        case '1':
                            editObjArr[0].hidden = true;
                            editObjArr[0].readonly = true;
                            editObjArr[1].hidden = true;
                            editObjArr[2].hidden = true;
                            editObjArr[3].hidden = true;
                            break;
                        case '2':
                            editObjArr[0].hidden = true;
                            editObjArr[0].readonly = true;
                            editObjArr[1].hidden = true;
                            editObjArr[2].hidden = true;
                            editObjArr[3].hidden = true;
                            break;
                        case '3':
                            editObjArr[0].hidden = true;
                            editObjArr[0].readonly = true;
                            editObjArr[1].hidden = true;
                            editObjArr[2].hidden = true;
                            editObjArr[3].hidden = true;
                            break;
                        case '4':
                            editObjArr[0].hidden = true;
                            editObjArr[0].readonly = true;
                            editObjArr[1].hidden = true;
                            editObjArr[2].hidden = true;
                            editObjArr[3].hidden = true;
                            break;
                        case '10':
                            editObjArr[0].hidden = false;
                            editObjArr[0].readonly = true;
                            editObjArr[1].hidden = false;
                            editObjArr[1].data = {interfaceClazz: 'com.netstar.nsworkflow.business.api.diverging.Diverging'};
                            editObjArr[2].hidden = false;
                            editObjArr[3].hidden = false;
                            editObjArr[3].subdata = middleActivities;
                            break;
                        case '11':
                            editObjArr[0].hidden = false;
                            editObjArr[0].readonly = true;
                            editObjArr[1].hidden = false;
                            editObjArr[1].data = {interfaceClazz: 'com.netstar.nsworkflow.business.api.batch.Batch'};
                            editObjArr[2].hidden = false;
                            editObjArr[3].hidden = false;
                            editObjArr[3].subdata = middleActivities;
                            break;
                        case '20':
                            editObjArr[0].hidden = false;
                            editObjArr[0].readonly = false;
                            editObjArr[1].hidden = true;
                            editObjArr[2].hidden = true;
                            editObjArr[3].hidden = true;
                            break;
                    }
                    nsForm.edit(editObjArr, nsWorkFlow.page.allId.bodyId);
                }
			},
			'incomingDomId':{
				id:'incomingDomId',
				label:'对应的汇聚活动',
				type:'select',
				column:12,
                textField:'activityName',
                valueField:'domId',
				subdata:[],
				disabled:true,
			},
			'outgoingDef-application':{
				id:'outgoingDef-application',
                label: '接口',
				type:'select',
				column:6,
				textField:'name',
				valueField:'name',
				dataSrc:'rows',
				hidden:true,
				url:serverUrl+'/dubboApi/applications',
                changeHandler: function (value) {
                    var editObjArr = [
                        {
                            id: 'outgoingDef-group',
                            data: {
                                application: value,
                            },
                            value: '',
                        }
                    ]
                    var formData = nsForm.getFormData(nsWorkFlow.page.allId.bodyId);
                    if (formData.outgoingWay) {
                        var outgoingValue = formData.outgoingWay.value;
                        switch (outgoingValue) {
                            case '10':
                                editObjArr[0].data.interfaceClazz = 'com.netstar.nsworkflow.business.api.diverging.Diverging';
                                break;
                            case '11':
                                editObjArr[0].data.interfaceClazz = 'com.netstar.nsworkflow.business.api.batch.Batch';
                                break;
                        }
                    }
                    nsForm.edit(editObjArr, nsWorkFlow.page.allId.bodyId);
                }
			},
			'outgoingDef-group':{
				id:'outgoingDef-group',
				label:'',
				type:'select',
				column:6,
				data:{application:'{this.outgoingDef-application}'},
				textField:'name',
				valueField:'name',
				dataSrc:'rows',
				hidden:true,
				url:serverUrl+'/dubboApi/groups',
			},
            'validations':{
			    id: 'validations',
                label: '中间验证环节',
                type:'select2',
                column:12,
                multiple: true,
                textField:'activityName',
                valueField:'domId',
                hidden: true,
                subdata:[]
            }   // 指定分批或发散转移时,指定验证环节(中间环节)
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
					{ id:'1',name:'顺序汇聚' },
					{ id:'2',name:'并行汇聚' },
					{ id:'3',name:'异或汇聚' },
					{ id:'10',name:'发散汇聚' },
					{ id:'14',name:'必达汇聚' },
					{ id:'16',name:'条件汇聚' },
					{ id:'20',name:'流程合并' },
					{ id:'12',name:'投票汇聚' },
					{ id:'11',name:'分批汇聚' },
					{ id:'32',name:'多重汇聚' },
				],
				changeHandlerData:{
					"1":{
						hidden:{
							outgoingDomId:true,
							mustTos:true,
							n:true,
						}
					},
					"2":{
						hidden:{
							outgoingDomId:true,
							mustTos:true,
							n:true,
						}
					},
					"3":{
						hidden:{
							outgoingDomId:true,
							mustTos:true,
							n:true,
						}
					},
					"10":{
						hidden:{
							outgoingDomId:false,
							mustTos:true,
							n:true,
						}
					},
					"14":{
						hidden:{
							outgoingDomId:true,
							mustTos:false,
							n:true,
						}
					},
					"16":{
						hidden:{
							outgoingDomId:false,
							mustTos:true,
							n:true,
						}
					},
					"32":{
						hidden:{
							outgoingDomId:false,
							mustTos:true,
							n:true,
						}
					},
					"20":{
						hidden:{
							outgoingDomId:true,
							mustTos:true,
							n:true,
						}
					},
					"12":{
						hidden:{
							outgoingDomId:true,
							mustTos:true,
							n:false,
						}
					},
					"11":{
						hidden:{
							outgoingDomId:false,
							mustTos:true,
							n:true,
						}
					},
					"8":{
						hidden:{
							outgoingDomId:true,
							mustTos:true,
							n:true,
						}
					},
				},
			},
			outgoingDomId:{
				id:'outgoingDomId',
				label:'对应的转移',
				type:'select',
				column:12,
				hidden:true,
				textField:'activityName',
				valueField:'domId',
				subdata:[],
			},
			mustTos:{
				id:'mustTos',
				label:'必达项',
				type:'select',
				column:12,
				subdata:[],
				hidden:true,
                textField:'activityName',
                valueField:'domId',
			},
			n:{
				id:'n',
				label:'需汇聚数量',
				type:'text',
				rules:'number',
				column:12,
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
                    {id: '3', name: '里程碑接口'},
				],
                changeHandler: function (value) {
                    var editObjArr = [
                        {
                            id: 'timerDuration',
                            value: '',
                        },
                        {
                            id: 'timerType',
                            value: '',
                        },
                        {
                            id: 'timerDef-application',
                            value: '',
                        },
                        {
                            id: 'group',
                            value: '',
                        },
                        {
                            id: 'mileStoneApp',
                            value: '',
                        },
                        {
                            id: 'mileStoneApi',
                            value: '',
                        },
                    ]
                    switch (value) {
                        case '1':
                            editObjArr[0].hidden = false;
                            editObjArr[1].hidden = false;
                            editObjArr[2].hidden = true;
                            editObjArr[3].hidden = true;
                            editObjArr[4].hidden = true;
                            editObjArr[5].hidden = true;
                            break;
                        case '2':
                            editObjArr[0].hidden = true;
                            editObjArr[1].hidden = true;
                            editObjArr[2].hidden = false;
                            editObjArr[3].hidden = false;
                            editObjArr[4].hidden = true;
                            editObjArr[5].hidden = true;
                            break;
                        case '3':
                            editObjArr[0].hidden = true;
                            editObjArr[1].hidden = true;
                            editObjArr[2].hidden = true;
                            editObjArr[3].hidden = true;
                            editObjArr[4].hidden = false;
                            editObjArr[5].hidden = false;
                            break;

                    }
                    nsForm.edit(editObjArr, nsWorkFlow.page.allId.bodyId);
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
                data: {interfaceClazz: 'com.netstar.nsworkflow.business.api.timer.Timer'},
				hidden:true,
				textField:'name',
				valueField:'name',
				dataSrc:'rows',
				url:serverUrl+'/dubboApi/applications',
                changeHandler: function (value) {
                    var editObjArr = [
                        {
                            id: 'group',
                            data: {
                                application: value,
                                interfaceClazz: 'com.netstar.nsworkflow.business.api.timer.Timer'
                            },
                            value: '',
                        }
                    ]
                    nsForm.edit(editObjArr, nsWorkFlow.page.allId.bodyId);
                }
			},
			group:{
				id:'group',
				label:'',
				type:'select',
				column:6,
				hidden:true,
                data: {},
				textField:'name',
				valueField:'name',
				dataSrc:'rows',
				url:serverUrl+'/dubboApi/groups',
			},
            'mileStoneApp': {
                id: 'mileStoneApp',
                label: '',
                type: 'select',
                column: 6,
                data: {interfaceClazz: 'com.netstar.nsworkflow.business.api.timer.MileStone'},
                hidden: true,
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/applications',
                changeHandler: function (value) {
                    var editObjArr = [
                        {
                            id: 'group',
                            data: {
                                application: value,
                                interfaceClazz: 'com.netstar.nsworkflow.business.api.timer.MileStone'
                            },
                            value: '',
                        }
                    ]
                    nsForm.edit(editObjArr, nsWorkFlow.page.allId.bodyId);
                }
            },
            'mileStoneApi': {
                id: 'mileStoneApi',
                label: '',
                type: 'select',
                column: 6,
                hidden: true,
                data: {},
                textField: 'name',
                valueField: 'name',
                dataSrc: 'rows',
                url: serverUrl + '/dubboApi/groups',
            },
		},
		// 子流程
		child:{
            	subProcessId:{
                    id:'subProcessId',
                    label:'子流程',
                    type:'select',
                    column:12,
                    textField:'wfProcessProcessName',
                    valueField:'wfProcessId',
                    dataSrc:'rows',
                    url:serverUrl+'/wfProcess/getProcessList'
                },
				needReturn:{
					id:'needReturn',
					label:'是否需要返回',
					type:'checkbox',
					textField:'name',
					valueField:'id',
					column:12,
					subdata:[
                        { id:'1',name:'' }
					]
				}
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
                    { id: 'loopFlagType',},
					{ id:'loopFlagExpression', },
                    { id: 'loopFlagApplication',},
                    { id: 'loopFlagGroup',},
                    { id: 'endFlagType',},
					{ id:'endFlagExpression', },
                    { id: 'endFlagApplication',},
                    { id: 'endFlagGroup',},
                    { id:'completeModeExpression', },
                    { id: 'completeModeApplication',},
                    { id: 'completeModeGroup',},
                    { id:'forwardModeExpression', },
                    { id: 'forwardModeApplication',},
                    { id: 'forwardModeGroup',}
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
                title: '回调接口设置',
                fieldType: 'callbackSet',
                fieldName: [
                    {id: 'beforeCompleteApp',},
                    {id: 'beforeCompleteApi',},
                    {id: 'afterCompleteApp',},
                    {id: 'afterCompleteApi',},
                    {id: 'beforeForwardApp',},
                    {id: 'beforeForwardApi',},
                    {id: 'afterForwardApp',},
                    {id: 'afterForwardApi',},
                    {id: 'beforeRollbackApp',},
                    {id: 'beforeRollbackApi',},
                    {id: 'afterRollbackApp',},
                    {id: 'afterRollbackApi',},
                    {id: 'pendingToWaitingApp',},
                    {id: 'pendingToWaitingApi',},
                ]
            }, {
                title:'传阅-催办人设置',
                fieldType:'hastenSet',
                fieldName:[
                    { id:'hastenFlag', },
                    { id:'hastenDef', },
                    { id:'ccFlag', },
                    { id:'ccDef', }
                ]
            },{
				title:'时限设置',
				fieldType:'timeSet',
				fieldName:[
					{ id:'startIdsWhenWaiting', },
					{ id:'startIdsWhenCompleted', },
					{ id:'startIdsWhenForwarded', },
					{ id:'closeIdsWhenWaiting', },
					{ id:'closeIdsWhenCompleted', },
					{ id:'closeIdsWhenForwarded', },
				]
			},{
				title:'转移设置',
				fieldType:'transferSet',
				fieldName:[
					{ id:'outgoingWay', },
					{ id:'incomingDomId', },
					{ id:'outgoingDef-application', },
					{ id:'outgoingDef-group', },
                    { id:'validations' },
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
                    {id: 'mileStoneApp',},
                    {id: 'mileStoneApi',},
				]
			}
		],
        subprocess:[
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
            }, {
                title: '回调接口设置',
                fieldType: 'callbackSet',
                fieldName: [
                    {id: 'beforeCompleteApp',},
                    {id: 'beforeCompleteApi',},
                    {id: 'afterCompleteApp',},
                    {id: 'afterCompleteApi',},
                    {id: 'beforeForwardApp',},
                    {id: 'beforeForwardApi',},
                    {id: 'afterForwardApp',},
                    {id: 'afterForwardApi',},
                    {id: 'beforeRollbackApp',},
                    {id: 'beforeRollbackApi',},
                    {id: 'afterRollbackApp',},
                    {id: 'afterRollbackApi',},
                    {id: 'pendingToWaitingApp',},
                    {id: 'pendingToWaitingApi',},
                ]
            }, {
				title:'时限设置',
				fieldType:'timeSet',
				fieldName:[
                    { id:'startIdsWhenWaiting', },
                    { id:'startIdsWhenCompleted', },
                    { id:'startIdsWhenForwarded', },
                    { id:'closeIdsWhenWaiting', },
                    { id:'closeIdsWhenCompleted', },
                    { id:'closeIdsWhenForwarded', },
				]
			},{
				title:'转移设置',
				fieldType:'transferSet',
				fieldName:[
					{ id:'outgoingWay', },
					{ id:'incomingDomId', },
					{ id:'outgoingDef-application', },
					{ id:'outgoingDef-group', },
                    { id:'validations' },
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
					{ id:'subProcessId', },
					{ id:'needReturn', },
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
				]
			},
			{
				title:'时限设置',
				fieldType:'timeSet',
				fieldName:[
                    { id:'startIdsWhenWaiting', },
                    { id:'startIdsWhenCompleted', },
                    { id:'startIdsWhenForwarded', },
                    { id:'closeIdsWhenWaiting', },
                    { id:'closeIdsWhenCompleted', },
                    { id:'closeIdsWhenForwarded', },
				]
			},
			{
				title:'转移设置',
				fieldType:'transferSet',
				fieldName:[
					{ id:'outgoingWay', },
					{ id:'incomingDomId', },
					{ id:'outgoingDef-application', },
					{ id:'outgoingDef-group', },
                    { id:'validations' },
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
                    { id:'startIdsWhenWaiting', },
                    { id:'startIdsWhenCompleted', },
                    { id:'startIdsWhenForwarded', },
                    { id:'closeIdsWhenWaiting', },
                    { id:'closeIdsWhenCompleted', },
                    { id:'closeIdsWhenForwarded', },
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
		        title: '基本属性',
		        fieldType: 'baseAttr',
		        fieldName: [
		            {id: 'canUndoComplete',}
		        ]
		    },
			{
				keyField:'key',
				idField:'id',
				title:'时限设置',
				fieldType:'timeSet',
				fieldName:[
                    { id:'startIdsWhenWaiting', },
                    { id:'startIdsWhenCompleted', },
                    { id:'startIdsWhenForwarded', },
                    { id:'closeIdsWhenWaiting', },
                    { id:'closeIdsWhenCompleted', },
                    { id:'closeIdsWhenForwarded', },
				]
			},
            {
                title: '回调接口设置',
                fieldType: 'callbackSet',
                fieldName: [
                    {id: 'afterArchivedApp',},
                    {id: 'afterArchivedApi',},
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
                case 'endFlag':
				case "loopFlag":
                case 'cannotReplay':
                case 'noNeedTransactor':
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
					formatValueData[attrId] = JSON.parse(value[attrId]);
					formatValueData[fieldRelationParent[attrId]] = attrId;
					break;
                case 'callbackDef':
                    if(typeof(value[attrId]) == "string" && value[attrId].length > 0){
                        formatValueData[attrId] = JSON.parse(value[attrId]);
                    }else{
                        formatValueData[attrId] = [];
                    }
                    break;
                case 'hastenDef':
                case 'ccDef':
					formatValueData[attrId] = JSON.parse(value[attrId]);
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
                case 'setOtherTransactorDef':
                	if(typeof(value[attrId])=='string'&&value[attrId].length>0){
                        var setOtherTransactorDefArr = value[attrId].split(',');
                        formatValueData[attrId] = setOtherTransactorDefArr;
					}
                    break;
				default:
					if(typeof(fieldHaveChild[attrId])!='undefined'){
						var defValue;
						if(typeof(value[attrId]) == 'object'){
						    defValue = value[attrId]
                        }else {
                            defValue = JSON.parse(value[attrId]);
                        }
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
			if(attrId != 'baseAttr-moreSet' && value[attrId] == ''){
				continue;
			}
			switch(attrId){
				case 'baseAttr-moreSet':
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
        switch (value['transactorSet-selectSet']) {
            case 'transactorsDef':
                delete formatValueData.transactorApi;
                break
            case 'transactorApi':
                delete formatValueData.transactorsDef;
                break;
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
		// 上次显示的id
		prevActiveId:'',
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
                _this.prevActiveId = _this.activeId;
				_this.activeId = liNsId;
				_this.saveData(_this.prevActiveId);
				_this.setActiveTab();
			})
			$btns.on('click',function(){
				var $this = $(this);
				var $i = $this.children();
				if($i.hasClass('fa-save')){
					_this.saveData(_this.activeId);
					if(typeof(_this.config.confirmHandler)=='function'){
						var formatValueData = nsWorkFlow.formatValue(_this.value);
						_this.config.confirmHandler(formatValueData);
					}
				}
				if($i.hasClass('fa-close')){
					_this.closePanel();
					if(typeof(_this.config.closeHandler)=='function'){
						_this.saveData(_this.activeId);
						_this.config.closeHandler(_this.sourceValue,_this.value);
					}
				}
			})
		},
		// 设置面板默认值
        setPanelValue: function (formArr, nsId) {
			var values = this.value;
            //处理自循环表达式文本框是否显示
            if (nsId == 'baseAttr' && formArr.length >= 9) {
                var thisSelectId = values['baseAttr-moreSet'];
                var loopFlagType = values['loopFlagType'];
                var endFlagType = values['endFlagType'];
                if (typeof(thisSelectId) != 'undefined' && thisSelectId.indexOf('loopFlag') > -1) {
                    formArr[5].hidden = false;
                    formArr[6].hidden = false;
                    switch (loopFlagType) {
                        case 'mvel':
                            formArr[7].hidden = true;
                            formArr[8].hidden = true;
                            break;
                        case 'bridge':
                            formArr[7].hidden = false;
                            formArr[8].hidden = false;
                            break;
                    }
                    if (values['loopFlagApplication']) {
                        formArr[8].data = {
                            application: values['loopFlagApplication'],
                            interfaceClazz: 'com.netstar.nsworkflow.engine.transition.TransitionBridge'
                        }
                    }
                } else {
                    formArr[5].hidden = true;
                    formArr[6].hidden = true;
                    formArr[7].hidden = true;
                    formArr[8].hidden = true;
                    
                }
                if (typeof(thisSelectId) != 'undefined' && thisSelectId.indexOf('endFlag') > -1) {
                    formArr[9].hidden = false;
                    formArr[10].hidden = false;
                    switch (endFlagType) {
                        case 'mvel':
                            formArr[11].hidden = true;
                            formArr[12].hidden = true;
                            break;
                        case 'bridge':
                            formArr[11].hidden = false;
                            formArr[12].hidden = false;
                            break;
                    }
                    if (values['endFlagApplication']) {
                        formArr[12].data = {
                            application: values['endFlagApplication'],
                            interfaceClazz: 'com.netstar.nsworkflow.engine.transition.TransitionBridge'
                        }
                    }
                } else {
                    formArr[9].hidden = true;
                    formArr[10].hidden = true;
                    formArr[11].hidden = true;
                    formArr[12].hidden = true;
                }
            }
            if (nsId == 'transactorSet') {
                if (values['application']) {
                    formArr[3].data = {
                        application: values['application'],
                        interfaceClazz: 'com.netstar.nsworkflow.business.api.transactor.Transactor'
                    }
                }
                var transactorType = values['transactorSet-selectSet'];
                switch (transactorType) {
                    case 'transactorsDef':
                        formArr[1].hidden = false;
                        formArr[2].hidden = true;
                        formArr[3].hidden = true;
                        break;
                    case 'transactorApi':
                        formArr[1].hidden = true;
                        formArr[2].hidden = false;
                        formArr[3].hidden = false;
                        break;
                }
            }
            if (nsId == 'delays') {
                var timerWay = values['timerWay'];
                switch (timerWay) {
                    case '1':
                        formArr[2].hidden = false;
                        formArr[3].hidden = false;
                        formArr[4].hidden = true;
                        formArr[5].hidden = true;
                        formArr[6].hidden = true;
                        formArr[7].hidden = true;
                        break;
                    case '2':
                        formArr[2].hidden = true;
                        formArr[3].hidden = true;
                        formArr[4].hidden = false
                        formArr[5].hidden = false;
                        formArr[6].hidden = true;
                        formArr[7].hidden = true;
                        break;
                    case '3':
                        formArr[2].hidden = true;
                        formArr[3].hidden = true;
                        formArr[4].hidden = true;
                        formArr[5].hidden = true;
                        formArr[6].hidden = false
                        formArr[7].hidden = false;
                        break;
                }
                if (values['timerDef-application']) {
                    formArr[5].data = {
                        application: values['timerDef-application'],
                        interfaceClazz: 'com.netstar.nsworkflow.business.api.timer.Timer'
                    }
                }
                if (values['mileStoneApp']) {
                    formArr[7].data = {
                        application: values['mileStoneApp'],
                        interfaceClazz: 'com.netstar.nsworkflow.business.api.timer.MileStone'
                    }
                }
            }
            //处理分批/发散接口配置是否显示及参数
            if (nsId == 'transferSet') {
                var outgoingWay = values['outgoingWay'];
                if (outgoingWay == '10' || outgoingWay == '11') {
                    formArr[2].hidden = false;
                    formArr[3].hidden = false;
                    formArr[4].hidden = false;
                    var middleActivities = [];
                    if (values['incomingDomId']) {
                        middleActivities = nsWorkFlow.prototype.getMiddleActivities(values['domId'],values['incomingDomId']);
                    }
                    formArr[2].subdata = [];
                    formArr[3].subdata = [];
                    formArr[4].subdata = middleActivities;
                    switch (outgoingWay) {
                        case '10':
                            formArr[2].data = {interfaceClazz: 'com.netstar.nsworkflow.business.api.diverging.Diverging'}
                            formArr[3].data = {
                                application: values['outgoingDef-application'],
                                interfaceClazz: 'com.netstar.nsworkflow.business.api.diverging.Diverging'
                            }
                            break;
                        case '11':
                            formArr[2].data = {interfaceClazz: 'com.netstar.nsworkflow.business.api.batch.Batch'}
                            formArr[3].data = {
                                application: values['outgoingDef-application'],
                                interfaceClazz: 'com.netstar.nsworkflow.business.api.batch.Batch'
                            }
                            break;
                    }
                } else {
                    formArr[2].hidden = true;
                    formArr[3].hidden = true;
                }
                if (outgoingWay == '20') {
                    formArr[1].readonly = false;
                } else {
                    formArr[1].readonly = true;
                }
            }

            if (nsId == 'callbackSet') {
                if (formArr.length == 14) {
                    var callbackInterface = 'com.netstar.nsworkflow.business.api.callback.WorkflowCallback';
                    formArr[1].data = {
                        application: values['beforeCompleteApp'],
                        interfaceClazz: callbackInterface
                    }
                    formArr[3].data = {
                        application: values['afterCompleteApp'],
                        interfaceClazz: callbackInterface
                    }

                    formArr[5].data = {
                        application: values['beforeForwardApp'],
                        interfaceClazz: callbackInterface
                    }
                    formArr[7].data = {
                        application: values['afterForwardApp'],
                        interfaceClazz: callbackInterface
                    }

                    formArr[9].data = {
                        application: values['beforeRollbackApp'],
                        interfaceClazz: callbackInterface
                    }
                    formArr[11].data = {
                        application: values['afterRollbackApp'],
                        interfaceClazz: callbackInterface
                    }
                    formArr[13].data = {
                        application: values['pendingToWaitingApp'],
                        interfaceClazz: callbackInterface
                    }
                } else {
                    formArr[1].data = {
                        application: values['afterArchivedApp'],
                        interfaceClazz: callbackInterface
                    }
                }
            }
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
                } else {
                    if (fieldId == 'group' && values['timerDef-group']) {
                        formArr[fieldI].value = values['timerDef-group'];
                        if (typeof(formArr[fieldI].changeHandlerData) == 'object') {
                            var changeHandlerDataObj = formArr[fieldI].changeHandlerData[formArr[fieldI].value];
                            if (changeHandlerDataObj) {
                                setField.push(changeHandlerDataObj);
                            }
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
        block : {
            TEMPLATE : '<div class="">'
                            + '<div class="pt-btn-group">'
                                + '<button class="pt-btn pt-btn-default" @click="add">新增</button>'
                            + '</div>'
                            + '<div class="" v-for="(row,index) in rows">'
                                    + '<div class="" v-for="column in columns">'
                                        + '<div class="" @click="clickTdHandler($event, index, row, column)">'
                                            + '<span class="">{{column.title}}</span>'
                                            + '<span class="">{{(column.formatHandler ? column.formatHandler(row[column.field], row) : row[column.field])}}</span>'
                                        + '</div>'
                                        + '<div class="" iseditcontainer="true" v-if="row[\'dom-id-\'+column.field]" :id="row[\'dom-id-\'+column.field]">'
                                        + '</div>'
                                    + '</div>'
                                    + '<div class="pt-btn-group">'
                                        + '<button class="pt-btn pt-btn-icon pt-btn-default" @click="deleteFunc($event, index)">'
                                            + '<i class="icon icon-trash-o"></i>'
                                        + '</button>'
                                    + '</div>'
                            + '</div>'
                        + '<div>',
            subdataObj : {
                app : [],
                callbackType : [
                    {
                        id : 'beforeComplete',
                        name : '签收前',
                    },{
                        id : 'afterComplete',
                        name : '签收后',
                    },{
                        id : 'beforeForward',
                        name : '提交前',
                    },{
                        id : 'afterForward',
                        name : '提交后',
                    },{
                        id : 'beforeRollback',
                        name : '回退前',
                    },{
                        id : 'afterRollback',
                        name : '回退后',
                    },{
                        id : 'pendingToWaiting',
                        name : '未决转待办',
                    },{
                        id : 'afterArchived',
                        name : '归档后',
                    }
                ],
                callRollbackTime : [
                    {
                        id : 'passBy',
                        name : '回退经过时调用',
                    },{
                        id : 'target',
                        name : '回退至此时调用',
                    }
                ],
            },
            columns : [
                {
                    field : 'app',
                    title : '回调方法服务',
                    editable : true,
                    editConfig : {
                        type : 'select',
                        textField : 'name',
                        valueField : 'name',
                        subdataName : 'app',
                    }
                },{
                    field : 'api',
                    title : '回调方法',
                    editable : true,
                    editConfig : {
                        type : 'select',
                        textField : 'name',
                        valueField : 'name',
                        dataSrc: 'rows',
                        data : {
                            interfaceClazz : 'com.netstar.nsworkflow.business.api.callback.WorkflowCallback',
                            application : "{row.app}"
                        },
                        url: serverUrl + '/dubboApi/groups',
                        method : 'GET',
                        contentType : 'application/x-www-form-urlencoded',
                    }
                },{
                    field : 'params',
                    title : '参数',
                    editable : true,
                    editConfig : {
                        type : 'text',
                    }
                },{
                    field : 'callbackType',
                    title : '状态',
                    editable : true,
                    editConfig : {
                        type : 'select',
                        textField : 'name',
                        valueField : 'id',
                        subdataName : 'callbackType',
                    }
                },{
                    field : 'callRollbackTime',
                    title : '调用位置',
                    editable : true,
                    editConfig : {
                        type : 'radio',
                        textField : 'name',
                        valueField : 'id',
                        subdataName : 'callRollbackTime',
                    }
                }
            ],
            addObj : {
                app : '',
                api : '',
                params : '',
                callbackType : '',
                callRollbackTime : '',
            },
            getColumns : function(){
                var columns = this.columns;
                var subdataObj = this.subdataObj;
                for(var i=0; i<columns.length; i++){
                    var column = columns[i];
                    if(column.editConfig){
                        var subdataName = column.editConfig.subdataName;
                        if(subdataObj[subdataName]){
                            var subdata = subdataObj[subdataName];
                            column.editConfig.subdata = subdata;
                            var textField = column.editConfig.textField ? column.editConfig.textField : 'text';
                            var valueField = column.editConfig.valueField ? column.editConfig.valueField : 'value';
                            var subdataReplace = {};
                            for(var subI=0; subI<subdata.length; subI++){
                                subdataReplace[subdata[subI][valueField]] = subdata[subI][textField];
                            }
                            column.formatHandler = (function(subdataReplace){
                                return function(value, row){
                                    if(typeof(subdataReplace[value]) != "undefined"){
                                        value = subdataReplace[value];
                                    }
                                    return value;
                                }
                            })(subdataReplace)
                        }
                    }
                }
                return columns;
            },
            getColumnsById : function(columns){
                var columnsById = {};
                for(var i=0; i<columns.length; i++){
                    columnsById[columns[i].field] = columns[i];
                }
                return columnsById;
            },
            getRows : function(list, columnsById){
                var rows = [];
                for(var i=0; i<list.length; i++){
                    var row = $.extend(true, {}, list[i]);
                    for(var key in row){
                        if(columnsById[key] && columnsById[key].editable){
                            row['dom-id-' + key] = 'ns-field-edit-' + key + '-' + i;
                        }
                    }
                    rows.push(row);
                }
                return rows;
            },
            init : function(values, domId){
                var _this = this;
                var html = _this.TEMPLATE;
                $('#' + domId).html(html);
                var columns = _this.getColumns();
                var list = $.isArray(values.callbackDef) ? values.callbackDef : [];
                var columnsById = _this.getColumnsById(columns);
                var rows = _this.getRows(list, columnsById);
                this.vueObj = new Vue({
                    el : '#' + domId,
                    data : {
                        rows : rows,
                        list : $.extend(true, [], list),
                        columns : columns,
                        columnsById : columnsById,
                    },
                    watch : {
                        list : function(newList){
                            this.rows = _this.getRows(newList, this.columnsById);
                            values.callbackDef = newList;
                        },
                    },
                    methods : {
                        add : function(){
                            var list = $.extend(true, [], this.list);
                            list.push(_this.addObj);
                            this.list = list;
                        },
                        deleteFunc : function(ev, index){
                            var __this = this;
                            nsConfirm('确定删除吗？', function(isDel){
                                if(isDel){
                                    var list = $.extend(true, [], __this.list);
                                    list.splice(index, 1);
                                    __this.list = list;
                                }
                            })
                        },
                        removeComponent:function($editorContainer){
                            if ($editorContainer.length > 0) {
                                var domId = $editorContainer.attr('id');
                                var editorConfig;
                                var editorVueComConfig;
                                if(NetstarComponent.config[domId] && NetstarComponent.config[domId].vueConfig){
                                    for(var key in NetstarComponent.config[domId].vueConfig){
                                        editorConfig = NetstarComponent.config[domId].config[key];
                                        editorVueComConfig = NetstarComponent.config[domId].vueConfig[key];
                                    }
                                }
                                /******lyw 20190411 计算器组件需要重新获取，进行保存值 end********/
                                // 验证是否是日期组件 删除日器组件
                                if(typeof(editorConfig) == "object"){
                                    switch(editorConfig.type){
                                        case 'date':
                                            break;
                                        case 'provinceselect':
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
                                $editorContainer.html('');
                                if ($('.pt-select-panel').length > 0) {
                                    // 下拉组件下拉框删除 以及下拉框添加的事件关闭
                                    $('.pt-select-panel').remove();
                                    $(document).off('keyup',NetstarComponent.select.panelComponentConfig.keyup);
                                }
                            }
                        },
                        removeRemoveEditorListener : function(){
                            $('body').off('mousedown', this.outClickHandler);
                        },
                        outClickHandler:function(ev){
                            //如果当前操作对象不再编辑器里则是out
                            var isOut = $(ev.target).closest('[iseditcontainer]').length == 0;
                            if (isOut) {
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
                                var $editorContainer = $gridContainer.find('[iseditcontainer]');
                                _tdEditor.removeComponent($editorContainer);
                            }
                        },
                        addRemoveListener : function($dom){
                            //$td是当前点击正在初始化的单元格
                            var _this = this;
                            //点击了其他地方的监听器
                            this.removeRemoveEditorListener();
                            //sjj 20190509 把body的click事件改为了mousedown事件
                            $('body').on('mousedown', {
                                this: _this,
                                $td: $dom
                            }, this.outClickHandler);
                        },
                        showFormEditor : function(editConfig, index, row, column){
                            var _this = this;
                            var domId = row['dom-id-' + column.field];
                            editConfig.changeHandler = function(obj){
                                var editValue = obj.vueConfig.getValue();
                                var list = $.extend(true, [], _this.list);
                                // 赋值
                                var sourceValue = list[index][obj.id];
                                if(obj.id == "app"){
                                    if(sourceValue != editValue){
                                        list[index].api = '';
                                    }
                                }
                                list[index][obj.id] = editValue;
                                _this.list = list;
                                // 移除 
                                _this.removeComponent($('#' + domId));
                            }
                            var formConfig = {
                                id : domId,
                                isSetMore : false,
                                formStyle : 'pt-form-normal',
                                formSource : 'table',
                                form : [
                                    editConfig
                                ],
                                completeHandler : (function(domId, fieldId){
                                    return function(obj){
                                        NetstarComponent.config[domId].vueConfig[fieldId].focus()
                                    }
                                })(domId, column.field)
                            }
                            NetstarComponent.formComponent.show(formConfig);
                            // 其他点击事件都会关闭编辑器
                            _this.addRemoveListener($('#' + domId));
                        },
                        clickTdHandler(ev, index, row, column){
                            if(!column.editable){ return false; }
                            var domId = row['dom-id-' + column.field];
                            var editConfig = column.editConfig;
                            editConfig.id = column.field;
                            editConfig.isStartToChange = false;
                            editConfig.isShowPanel = true;
                            editConfig.value = row[column.field] == undefined ? '' : row[column.field];
                            editConfig.relationData = {
                                row : row,
                            }
                            this.showFormEditor(editConfig, index, row, column);
                        }
                    }
                })
            }
        },
		// 刷新面板
		refreshTabsPanel:function(nsId){
			var formArr = $.extend(true, [], this.fields[nsId]);
            var allId = this.allId;
            switch(nsId){
                case 'callbackSet':
                    NetStarUtils.ajax({
                        data: {interfaceClazz: 'com.netstar.nsworkflow.business.api.callback.WorkflowCallback'},
                        dataSrc: 'rows',
                        url: serverUrl + '/dubboApi/applications',
                        type : 'GET',
                        contentType : 'application/x-www-form-urlencoded',
                    }, (function(_this, values, domId){
                        return function(res){
                            var arr = [];
                            if(res.success){
                                arr = res.rows ? res.rows : [];
                            }
                            _this.block.subdataObj.app = arr;
                            _this.block.init(values, domId);
                        }
                    })(this, this.value, allId.bodyId))
                    break;
                default:
                    this.setPanelValue(formArr, nsId);
                    var formJson = {
                        id:  		allId.bodyId,
                        size: 		"standard",
                        format: 	"standard",
                        fillbg: 	true,
                        form:		formArr,
                    }
                    formPlane.formInit(formJson);
                    break;
            }
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
		saveData:function(saveId){
            if(saveId == "callbackSet"){
                return;
            }
			var formData = nsForm.getFormJSON(this.allId.bodyId,true);
			var value = this.value;
			for(var key in formData){
				value[key] = formData[key];
				if(key == 'baseAttr-moreSet' && formData[key] == ''){
				    value[key] = [];
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
		//选择汇聚时,指定对应的转移环节
		this.pageFormData.convergingSet.outgoingDomId.subdata = config.beforeProcessSub;
        this.pageFormData.convergingSet.mustTos.subdata = config.beforeProcessSub;
		
        this.pageFormData.transactorSet.setOtherTransactorDef.subdata =  config.afterProcessSub
            .filter(activity => activity.activityType == '1');
        //配置合并取消转移时,需要指定汇聚(前面的环节).
        //但指定分批或发散转移时,需要回显对应的汇聚(后面的环节).所以这里需要列出所有选项.
        this.pageFormData.transferSet.incomingDomId.subdata = config.allProcessSub;
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
        lineConfigDialog:function (cell,data) {
            var json = {
                api:this,
                cell:cell,
                data:data
            };
            if(typeof(this.funcConfig.lineConfigDialog)=='function'){
                this.funcConfig.lineConfigDialog(json);//ui方法
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
		setcallbackDialog:function(){
			var json = {
				api:this,
			}
			if(typeof(this.funcConfig.setcallbackDialog)=='function'){
				this.funcConfig.setcallbackDialog(json);//ui方法
			}
		},
		saveDeadlines:function(data){
			var deadlinesArr = [];
			for(var i=0; i<data.length; i++){
				deadlinesArr.push(data[i]);
			}
			this.data.deadlines = deadlinesArr;
            //保存时限设置时，调用保存方法，否则重新打开时限设置时数据无法显示。
            this.saveAjax();
		},//保存时限设置  deadlines
		saveSetCallback:function(data){
			this.data.callbacks = data;
			nsdialog.hide();
			//this.saveAjax();
		},
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
			if(res){
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
			}
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
            // 判断是环节还是连线
            if (!config.hasOwnProperty('transitionTag')) {
                //删掉没有的属性
                for (var dataItem in json) {
                    if (!config.hasOwnProperty(dataItem)) {
                        delete json[dataItem];
                    }
                }
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
			if(this.data.callbacks){json.callbacks = this.data.callbacks;}
			return json;
		},//获取json格式的数据
		getData:function(){
			if(this.funcConfig.getAjax){
				var getAjaxConfig = this.funcConfig.getAjax;
				//var params = {processId:urlParams.processId,processName:urlParams.processName};
				var params = 'processId='+this.funcConfig.processId+'&processName='+this.funcConfig.processName;
				var url = getAjaxConfig.url + '?' +params;
				var appThis = this.dom;
				var pThis = this;
				this.getAjax(url,params,function(res){
					res = JSON.parse(res);
					if(res.success == true){
						//var resData = JSON.parse(res.data.json);
						var xml = res.data.wfProcessLayoutLayoutXml;
						var processName = res.data.wfProcessLayoutProcessName;
						var json = res.data.wfProcessLayoutLayout;
						if(xml){
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
                            else{
                                throw {
                                    message: mxResources.get('notADiagramFile') || 'Invalid data',
                                    toString: function() { return this.message; }
                                };
                            }
                        };
                        var editorUi = appThis.actions.editorUi;
                        var testXML = mxUtils.trim(xml);
                        var node = mxUtils.parseXml(testXML).documentElement;
                        editorUi.editor.setGraphXml(node);
                    }
                        if (processName) {
                            appThis.fname.innerHTML = '';
                            mxUtils.write(appThis.fname, processName);
                            appThis.fname.setAttribute('title', processName + ' - ' + mxResources.get('rename'));
                        }
                    pThis.dom.editor.setStatus('');
						pThis.init(json);
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
					xhr.setRequestHeader("Authorization",NetStarUtils.OAuthCode.get()); // 可以定义请求头带给后端
					xhr.onreadystatechange = function() {
						// readyState == 4说明请求已完成
						if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 304) { 
							// 从服务器获得数据 
							fn.call(this, xhr.responseText);  
						}
					};
					xhr.send();
				},
				// data应为'a=a1&b=b1'这种字符串格式，在jq里如果data为对象会自动将对象转成这种字符串格式
				post: function (url, data, fn) {
					var xhr = new XMLHttpRequest();
					xhr.open("POST", url, true);
					xhr.setRequestHeader("Authorization",NetStarUtils.OAuthCode.get()); // 可以定义请求头带给后端
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
			for (var i = 0; i < json.activities.length; i++) {
                for (var key in json.activities[i]) {
                    if (key.match(/^\w*Def$/)) {
                    	if(typeof (json.activities[i][key]) != 'string') {
                            json.activities[i][key] = JSON.stringify(json.activities[i][key]);
                        }
                    }
                }
            }
            console.log(xml);
			console.log(json);
			xml = encodeURIComponent(xml);
			var processId = this.funcConfig.processId;
			var param = 'xml='+xml+'&processId='+processId+'&objectState=1&json='+ encodeURIComponent(JSON.stringify(json));
			if(this.funcConfig.saveAjax){
				var url = this.funcConfig.saveAjax.url;
				var method = this.funcConfig.saveAjax.type ? this.funcConfig.saveAjax.type : 'post';
				method = method.toLocaleLowerCase();
				var saveConfig = this;
				this.getAjax(url,param,function(res){
					if(typeof res == 'string'){
						res = JSON.parse(res);
					}
					if(res.success){
                        nsalert(res.msg,'success');
						var json = {
							api:saveConfig,
							data:res
						}
						if(typeof(saveConfig.funcConfig.saveAjax.callBack)=='function'){
							return saveConfig.funcConfig.saveAjax.callBack(json);
						}
					} else {
						if(res.msg){
                            console.log(res.msg)
                            nsalert(res.msg,'error');
                        } else {
							nsalert("保存失败",'error')
						}
					}
				},method);
			}
		},
		getAllActivitiesAndLine:function(){
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
							var shapeType = shape;
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
                        configData.domId = nodeData._id;
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
        getMiddleActivities:function (beginDomId,afterDomId) {
		    var arr = [];
            var afterArr = this.getActivitiesByDomId(beginDomId,'after');
            var beforeArr = this.getActivitiesByDomId(afterDomId,'before');
            for (var i=0; i<afterArr.length; i++) {
                for (var j=0; j<beforeArr.length; j++) {
                    if (afterArr[i].domId == beforeArr[j].domId) {
                        arr.push(afterArr[i]);
                    }
                }
            }
            return arr;
        },//获取中间环节
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
                if (cell.children && cell.children[0]) {
                    activityJson.transitionTag = cell.children[0].value;
                }
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
                    var shapeType = shape;
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
            if(!cell.isEdge()){
                ui.process.configDialog(cell,ui.process.data.processJson[cell.id]);
            } else {
            	ui.process.lineConfigDialog(cell,ui.process.data.processJson[cell.id]);
			}
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
                    ui.actions.get((ui.mode == null) ? 'saveAs' : 'save').funct();
                }));
            }
        }
	}
}
