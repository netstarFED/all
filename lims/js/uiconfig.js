var nsUIConfig = {
	formHeightMode:'compact', 	//compact 紧凑模式 高度32 wide 宽松模式 高度40 默认是wide模式
	tableHeightMode:'compact',  //compact 紧凑模式 高度32 wide 宽松模式 高度40 默认是wide模式
	systemDictUrl:'/assets/json/dict/dicttype.json', //生成字典默认地址 lyw
}
var nsEngine = {
	// lyw 流程图相关参数
	workFlowPreviewConfig:{
		url:'/assets/json/workflow/viewer-demo-4.json?', //  流程图地址
		panelUrl:'/assets/json/workflow/time.json?workitemId=', // 流程图面板地址
		// 面板显示信息
		TEMPLATEWORD:
		{
			0:'{userName} 开始了{itemName}', 	// 开始
			1:'{userName} 签收了此流程', 		// 签收
			2:'{userName} 提交了此流程', 		// 提交
			3:'{userName} 回退了此流程', 		// 回退
			4:'{userName} 撤回了此流程', 		// 撤回
			5:'{userName} 挂起了此流程', 		// 挂起
			6:'{userName} 恢复了此流程', 		// 恢复
			7:'{userName} 应急了此流程', 		// 应急
			8:'{userName} 驳回了此流程', 		// 驳回
		},
		// 面板按钮
		TEMPLATEBTNS:{
			// 开始
			0:[],
			// 签收
			1:[], 
			2:[
				{
					name:'签收',
					func:function(data){
						console.log(data);
						console.log('签收');
					},
				},{
					name:'回退',
					func:function(data){
						console.log(data);
						console.log('回退');
					},
				}
			], 
			3:[
				{
					name:'回退',
					func:function(data){
						console.log(data);
						console.log('回退');
					},
				},{
					name:'提交',
					func:function(data){
						console.log(data);
						console.log('提交');
					},
				},{
					name:'提交',
					func:function(data){
						console.log(data);
						console.log('提交');
					},
				}
			], 
			4:[
				{
					name:'撤回',
					func:function(data){
						console.log(data);
						console.log('撤回');
					},
				},{
					name:'应急',
					func:function(data){
						console.log(data);
						console.log('应急');
					},
				}
			],
			5:[
				{
					name:'应急',
					func:function(data){
						console.log(data);
						console.log('应急');
					},
				}
			], 
			6:[], 
		},
	}
}
var nserp = {
	sale:{},
	order:{},
	custom:{},
}
var nsPhysical = {
	custom:{},//自定义配置
};//体检
