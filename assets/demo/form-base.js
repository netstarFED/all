
demos.form.base = {
	main:function(){
		this.navJson = 
		{
			//id: "demos-form-01-nav",
			btns:[
				[
					{
						text: 		'直接引用',
						handler: 	resFunc,
					},{
						text: 		'this引用',
						handler: 	this.thisFunc,
					},{
						text: 		'不支持字符串引用',
						handler: 	'abc',
					},{
						text: 		'第二个单页面',
						handler: 	openPage2,
					},{
						text: 		'第二个弹框',
						handler: 	newWindowPage,
					}
				],[
					{
						text: 		'保存',
						handler: 	save,
					},{
						text: 		'回传参数',
						handler: 	resultPara,
					}
				]
			],
		}

		this.formJson = 
		{
			id:  		"demos-form-01-form",
			name: 		'表单一',
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
						type:			'person-select',
						label:			'人员选择器',
						id:			'personSelect',	
						column:			6,
						rules: 			'required max:2', //required range:[5,10] max:2 min:3
						isUsedHistory:false,

						//historyArr: []  //如果整体配置读取本地存储后，可以对这个数组直接赋值，或者服务器端有历史记录，由于历史记录是默认打开项，所以需要服务器端先提供后，ajax可能会滞后
						handler: 		function(data){console.log(data)}, //操作结束后回调函数
						personAjax:		{
							url:			getRootPath() + '/assets/json/employ/employ.json',	
							type:			'GET',
							data:			{},	
							dataSrc:		'rows',
							//personArr:personArr,
							localDataConfig:[
								{key:'index',search:false},
								{key:'id',search:false,isID:true},
								//{key:'account',search:false},
								//{key:'empId',search:false},
								{key:'name',search:true,title:'员工',type:'string',visible:1,isName:true},
								//{key:'pyCode',search:true},
								//{key:'wbCode',search:true},
								//{key:'phone',search:true,title:'电话',type:'number',visible:2,width:50},
								{key:'deptId',search:false,isDepart:true},
								{key:'deptName',search:true,title:'部门名称',type:'string',visible:2}
							]
						},
						groupAjax:		{
							textField:		'deptName',
							valueField:		'deptId',
							//pyCode:			'pyCode',
							//wbCode:			'wbCode',
							parentId:		'parentId',
							dataSrc:		'rows',
							url:			getRootPath() + '/assets/json/employ/dept.json',	
							type:			'GET',
							data:			{},	
						}
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
		var columnConfig_widthmax = [ 
				{
					field : 'hazardClassName',
					title : '危害类别',
					width : 160,
				},{
					field : 'hazardCode',
					title : '危害类别2',
					width : 160,
				},{
					field : 'hazardName',
					title : '危害类别3',
					width : 160,
				},{
					field : 'hazardYear',
					title : '危害类别4',
					width : 160,
				},{
					field : 'disorder',
					title : '危害类别5',
					width : 160,
				},{
					field : 'hasYearMonth',
					title : '危害类别6',
					width : 160,
					formatHandler:	{
						type:'date',
						data:
						{
							formatDate:'YYYY-MM-DD'
						}
					}
				},{
					field : 'deffect',
					title : '危害类别7',
					width : 160,
				},{
					field : 'hazardDesc',
					title : '危害类别8',
					width : 160,
				},{
					field : 'remark',
					title : '危害类别9',
					width : 160,
				},{
					title : '按钮',
					width : 80,
					tabPosition:'after',
					formatHandler:{
						type:'button',
						data:
						[
							{'添加':function(){console.log('add')}},
							{'编辑':function(){console.log('edit')}}
						]
					}
					
				}
			]
		var dataSrc = getRootPath() + '/assets/json/guidebull.json';

		var dataConfig = {
			tableID: 		"table-demos-frame-configpage-panel-2",
			configTitle: 	"测试表格",
			src:  			dataSrc,
			type: 			"GET",			//GET POST
			data: 			'',				//参数对象{id:1,page:100}
			isServerMode:  	false,			//是否开启服务器模式
			isSearch:       true,      //是否开启搜索功能
			isPage:         true,      //是否开启分页
			dataSrc:        'data',
		}
		var uiConfig = {
			searchTitle: 		"危害搜索",				//搜索框前面的文字，默认为检索
			searchPlaceholder: 	"编号，名称",			//搜索框提示文字，默认为可搜索的列名
			//isSelectColumns: 	true, 					//是否开启列选择，默认为选择
			//isAllowExport: 		true,					//是否允许导出数据，默认允许
			//pageLengthMenu: 	[5,], 					//可选页面数  auto是自动计算  all是全部
			//isSingleSelect: true,			 			//是否单选
			isMulitSelect: 	true,			 			//是否多选
			defaultSelect:true,
			isUseTabs:true,							//
			scrollX:false,
		}
		var btnConfig = {
			selfBtn:	[
					{
						text:'导出全部xls',
						handler:function(){
							baseDataTable.exportXLS('table-demos-frame-layout4-tabs-1-second',true);
						}
					},{
						text:"删除行",
						handler:function(){
								baseDataTable.delSelectedRowdata('table-demos-frame-layout4-tabs-1-second');
						}
					}
				]
		}

		this.tableJson = {
			columns:columnConfig_widthmax,
			data:dataConfig,
			ui:uiConfig,
			btns:btnConfig
		}

		var formJson2 = 
		{
			id:  		"demos-form-02-form",
			size: 		"standard",
			format: 	"standard",
			fillbg: 	true,
			form:
			[
				[
					{
						id: 		'sqid',
						label: 		'申请编号f2',
						type: 		'text',
						rules: 		'required minlength=6',
						value: 		'aaaaaf',
						column: 	4,
					},
					{
						id: 		'sqdate',
						label: 		'申请日期f2',
						type: 		'date',
						rules: 		'required',
						column: 	4,
					}
				]
			]
		};
		
		//controlPlane.formNavInit(navJson);
		//formPlane.formInit(formJson);
		function resFunc(){
			alert("直接引用");
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
		function openPage2(){
			var url = getRootPath() + '/demos/form/basetest2.jsp';
			nsFrame.loadPage(url);
		}
		function changeWindowPage(){
			var url = getRootPath() + '/demos/form/basetest2.jsp';
			nsFrame.popPageChange(url);
		}
		function newWindowPage(){
			var url = getRootPath() + '/demos/form/basetest2.jsp';
			nsFrame.popPage(url);
		}
		//this.config = {nav:[navJson], form:[formJson, formJson2]};
		function resultPara(){
			nsalert("回传参数执行");
			console.log(formPlane.getFormJSON('demos-form-01-form'));
			demos.form.base.resultJson = formPlane.getFormJSON('demos-form-01-form');
			console.log(demos.form.base);
		}
		function save(){
			nsalert('保存成功');
			var c = nsForm.getFormJSON('demos-form-01-form');
			console.log(c);
		}
		/*this.autoSave = {
			form:[formJson],
			handler:save
		}*/
		nsLayout.init("demos-frame-layout4");
	},
	/*thisFunc:function (){
		nsalert("this引用成功");
	},*/
}

	
$(function(){
	nsFrame.init(demos.form.base);
});
	
	