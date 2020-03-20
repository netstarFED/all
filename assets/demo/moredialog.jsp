<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/view/jsp/include.jsp"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<title>体检类别管理</title>
</head>
<body>
<div class="page-title nav-form">
	<!--按钮组-->
</div>
<div class="row form-content">
	<div class="col-sm-12" id="form-content-1">
		<!--form-->
	</div>
</div>
<script type="text/javascript">
	var navJson = {
		//id: "topnav",
		btns:[
			[
				{
					text: 		'保存',
					handler: 	'submitform',
				},{
					text: 		'提交',
					handler: 	'save',
				},{
					text: 		'撤销',
					handler: 	'abc',
				}
			],[
				{
					text: 		'上传附件',
					handler: 	'viewUpload',
				},{
					text: 		'查看附件',
					handler: 	'viewtable',
				},{
					text: 		'流程图',
					handler: 	'viewliucheng',
				}
			],[
				{
					text: 		'查看环节办理意见',
					handler: 	'viewState',
				},{
					text: 		'打印',
					handler: 	'abc',
				}
			]
		],
	}
	controlPlane.formNavInit(navJson);

	var formJson = 
	{
		id:  		"form-content-1",
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
	formPlane.formInit(formJson);

	function save(){
		nsalert("保存失败");
	}
	function abc(){
		alert("abc");
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
	function viewState(){
		var config = {
			id: 	"plane-viewState",
			title: 	"查看环节办理意见",
			size: 	"m",
			form:[
				{
					id: 		'username',
					label: 		'办理意见',
					type: 		'textarea',
					readonly: 	true,
					height: 	'200px',
					value: 		'办理意见',
					isFullWidth:true,
				}
			],
			btns:[]
		}
		popupBox.initShow(config);
	}
	function viewUpload(){
		var config = {
			id: 	"plane-viewState",
			title: 	"上传文件",
			note: 	"点击左边文件区域，或者拖拽文件到文件区域上传文件",
			size: 	"b",
			form:[
				{
					id: 		'sqfj-upload',
					type: 		'upload',
					src:  		getRootPath() + '/occuHazardController/getList',
					srctype: 	"GET",
					data: 		"",	
					uploadsrc:  'http://localhost/xenon/data/upload-file.php',
					isColumnsCounter: true,
					//isSingleSelect: true,
					isMulitSelect: true,

					column: [
						{
							field : 'hazardName',
							title : '附件名称',
						}, {
							field : 'hazardCode',
							title : '环节名称',
							width : 80,
						}, {
							field : 'hazardCode',
							title : '体积',
							width : 48,
						}, {
							field : 'hazardYear',
							title : '类型',
							width : 48,
						}
					],
				}
			],
			btns:[
				{
					text: 		'查看',
					handler: 	'viewtr',
				},{
					text: 		'删除',
					handler: 	'viewtr',
				}
			]
		}
		popupBox.initShow(config);
	}
	function viewtr() {
		var selectData = baseDataTable.getTableSelectData('sqfj-upload');
		console.log(selectData);
		console.log(selectData.length);
		//alert(selectData[0].hazardName);
	}
	function viewtr2() {
		var selectData = baseDataTable.getTableSelectData('damo-table');
		console.log(selectData);
		console.log(selectData.length);
		//alert(selectData[0].hazardName);
	}
	function submitform(){
		var formData = formPlane.getFormJSON('form-content-1');
		console.log(formData);
	}
	function viewtable(){
		var config = {
			id: 	"plane-viewTable",
			title: 	"表格面板",
			note: 	"这是一行注释，不用就不写了",
			size: 	"b",
			form:[
				{
					id: 		'damo-table',
					type: 		'table',
					src:  		getRootPath() + '/occuHazardController/getList',
					srctype: 	"GET",	
					data: 		"",	
					isColumnsCounter: true,
					//isSingleSelect: true,
					isMulitSelect: true,

					column: [
						{
							field : 'hazardName',
							title : '职业危害名称',
						}, {
							field : 'hazardCode',
							title : '职业危害编号',
							width : 80,
						}, {
							field : 'hazardCode',
							title : '危害编号',
							width : 48,
						}, {
							field : 'hazardYear',
							title : '危害年限',
							width : 48,
						}, {
							field : 'disorder',
							title : '显示顺序',
							width : 80,
						} 
					],
				}
			],
			btns:[
				{
					text: 		'查看',
					handler: 	'viewtr2',
				},{
					text: 		'删除',
					handler: 	'viewtr2',
				}
			]
		}
		popupBox.initShow(config);
	}
</script>
</body>
</html>