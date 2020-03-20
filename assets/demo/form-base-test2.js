
demos.form.base = {
	main:function(){
		var navJson = 
		{
			id: "demos-basetest2-nav",
			btns:
			[
				[
					{
						text: 		'这里是第二个套嵌页面',
						handler: 	demo,
					}
				],
				[
					{
						text: 		'命名相同的函数',
						handler: 	resFunc,
					},{
						text: 		'第二个页面的函数',
						handler: 	resFunc2,
					},{
						text: 		'this引用',
						handler: 	this.save,
					},{
						text: 		'不支持字符串引用',
						handler: 	'abc',
					}
				],[
					{
						text: 		'DEMO 流程图',
						handler: 	viewliucheng,
					}
				]
			],
		}

		var formJson = 
		{
			id:  		"demos-basetest2-form",
			size: 		"standard",
			format: 	"standard",
			fillbg: 	true,
			form:
			[
				[
					{
						id: 		'sqid',
						label: 		'申请编号',
						type: 		'text',
						rules: 		'required minlength=6',
						value: 		'aaaaaf',
						column: 	4,
					},
					{
						id: 		'sqdate',
						label: 		'申请日期',
						type: 		'date',
						rules: 		'required',
						column: 	4,
					},
					{
						id: 		'sqdate11',
						label: 		'申请日期2',
						type: 		'date',
						rules: 		'required',
						column: 	4,
					}
				],
				
				[
					{
						id: 		'sqperson',
						label: 		'申请人',
						type: 		'text',
						rules: 		'required',
						column: 	4,
					},{
						id: 		'sqdepartment',
						label: 		'部门',
						type: 		'text',
						rules: 		'required',
						column: 	4,
					},{
						id: 		'gcid',
						label: 		'工程编号',
						type: 		'text',
						rules: 		'required',
						placeholder:'请重复输入新密码',
						column: 	4,
					},{
						id: 		'gcname',
						label: 		'工程名称',
						type: 		'text',
						rules: 		'required',
						column: 	4,
					},{
						id: 		'wtname',
						label: 		'委托单位',
						type: 		'text',
						rules: 		'required',
						column: 	8,
					}
				],
				[
					{
						element: 	'label',
						label: 		'更改折扣',
					},{
						id: 		'percentChange1',
						label: 		'变更前',
						readonly: 	true,
						type: 		'text',
						column: 	4,
					},{
						id: 		'percentChange2',
						label: 		'变更后',
						type: 		'text',
						rules: 		'required number',
						column: 	4,
					},{
						element: 	'br',
					},{
						id: 		'percentChange',
						label: 		'变更原因',
						type: 		'textarea',
					}
				]
			]
		};
		
		controlPlane.formNavInit(navJson);
		formPlane.formInit(formJson);
		function demo(){
			nsalert('这里是第二个套嵌页面');
		}
		function resFunc(){
			nsalert("命名相同的函数");
		}
		function resFunc2(){
			nsalert("第二个页面的函数");
		}
		function viewliucheng(){
			var config = {
				id: 	"plane-viewliucheng",
				title: 	"查看流程图",
				size: 	"b",
				form:[
					{
						html: '<img width="710" height="507"  src="http://image6.huangye88.com/2013/03/28/2a569ac6dbab1216.jpg" title="这是一只狗">',
						isFullWidth:true,
					}
				],
				btns:[]
			}
			popupBox.initShow(config);
		}
	},
	save:function (){
		nsalert("this引用成功");
	}
}

	
$(function(){
	nsFrame.init(demos.form.base);
});
	
	