<!--
 * @Desription: 文本输入及文本输入辅助
 * @Author: netstar.cy
 * @Date: 2019-10-20 08:59:13
 * @LastEditTime: 2019-10-20 09:01:58
 -->
<!--# include file="/lims/include/page-prefix.html" -->
<container>
<div class="page-title nav-form" id="nav">
	<!--按钮组-->
</div>
<div class="row form-content">
	<div class="col-sm-12" id="form-textInput">
		<!--form-->
	</div>
</div>
<div class="row">
	<div class="col-sm-12 nspanel">
		<div class="nspanel-title">
			输入辅助使用说明：
			<div class="nspanel-body">
			<ul class="code">
				<li>作用：按钮文本框，可插入替换文本文档的输入。</li>
			</ul>
			</div>
		</div>
		<div class="nspanel-body">
			<p>文本类型参数说明：</p>
			<table class="table table-bordered table-striped table-condensed table-hover code">
				<thead>
					<tr>
						<th></th>
						<th>参数</th>
						<th>类型</th>
						<th>说明</th>
						<th>默认值</th>
						<th>备注</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>1</td>
						<td>assistant</td>
						<td>array</td>
						<td>显示文本</td>
						<td>无</td>
						<td>有此字段则初始化出按钮和面板</td>
					</tr>
					<tr>
						<td>2</td>
						<td>isUseHtmlInput</td>
						<td>boolean</td>
						<td>html输入组件</td>
						<td>false</td>
						<td>目前只支持上下标 alt+'+'是下标，alt+shift+'+'是上标</td>
					</tr>
				</tbody>
			</table>
			<p>举例：</p>
			<pre>
var formJson = 
	{
		id:  		"form-textInput",
		size: 		"standard",
		format: 	"standard",
		fillbg: 	true,
		form:
		[{
				id: 		 		'textFactory',
				label: 		 		'输入辅助',
				type: 		 		'text-btn',
				// readonly: 			true,
				rules: 		 		'required',
				column: 	 		6,
				changeHandler: 		function(id,value,dom){
					console.log(id);
				},
				assistant: 		['a','b','c'], 
			}
		]
	};
	formPlane.formInit(formJson);
			</pre>
			<p>举例：</p>
			<pre>
var formJson = 
	{
		id:  		"form-textInput",
		size: 		"standard",
		format: 	"standard",
		fillbg: 	true,
		form:
		[{
				id: 		 		'textInputflag',
			 	label: 		 		'使用上下标',
			 	type: 		 		'text',
			 	column: 	 		6,
			 	value:  			'10&lt;sup&gt;2&lt;/sup&gt;中文字符 string',
			 	isUseHtmlInput: 		true,//是否支持html虚拟输入组件 目前只支持上下标<sub></sub><sup></sup>
			}
		]
	};
	formPlane.formInit(formJson);
			</pre>
		</div>
	</div>
</div>

<script type="text/javascript">
$(document).ready(function(){
	nsNav.init(navJson);
	formPlane.formInit(formJson);
})
var formJson = 
{
	id:  		"form-textInput",
	size: 		"standard",
	format: 	"standard",
	fillbg: 	true,
	form:
	[
		{
			element:'label',
			label:'输入辅助功能',
		}, {
			id: 		 		'textBtnInput',
			label: 		 		'type=text-btn',
			type: 		 		'text-btn',
			// readonly: 			true,
			rules: 		 		'required',
			column: 	 		6,
			changeHandler: 		function(id,value,dom){
				console.log(id);
			},
			btns: 		 		[
				{
					text:'搜索',
					handler:function(){
						nsalert('这是搜索按钮');
					}
				}
			],
			assistant: 		['d','e','f'], 
		},
		{
			id: 		 		'textFactory',
			label: 		 		'输入辅助',
			type: 		 		'text-btn',
			// readonly: 			true,
			rules: 		 		'required',
			column: 	 		6,
			changeHandler: 		function(id,value,dom){
				console.log(id);
			},
			assistant: 		['a','b','c'],
		},{
			element:'label',
			label:'快捷键使用上下标',
		}, {
		 	id: 		 		'textInput',
		 	label: 		 		'使用上下标',
		 	type: 		 		'text',
		 	column: 	 		6,
		 	value: '10<sup>2</sup>中文<sub>下标</sub>',
		 	//value: '100<sup>2</sup> 中间的字 <sub>sub</sub> English',
		 	isUseHtmlInput: 		true,//是否支持html虚拟输入组件 目前只支持上下标<sub></sub><sup></sup>


		},{
		 	id: 		 		'textInputPreview',
		 	label: 		 		'预览/开发模式',
		 	type: 		 		'text',
		 	column: 	 		6,
		 	value: '10<sup>2</sup>中文<sub>下标</sub>',
		 	//value: '100<sup>2</sup> 中间的字 <sub>sub</sub> English',
		 	isUseHtmlInput: 		true,//是否支持html虚拟输入组件 目前只支持上下标<sub></sub><sup></sup>
		 	htmlinputConfig:{
		 		isUsePreviewMode:true
		 	}
		},{
		 	id: 		 		'textInputReadOnly',
		 	label: 		 		'上下标只读模式',
		 	type: 		 		'text',
		 	column: 	 		6,
		 	readonly:true,
		 	//value: '100substr',
		 	value: '100<sup>2</sup> ',
		 	isUseHtmlInput: 		true,//是否支持html虚拟输入组件 目前只支持上下标<sub></sub><sup></sup>
		},{
			element:'label',
			label:'快捷键使用上下标回车',
		},{
		 	id: 		 		'textarea',
		 	label: 		 		'上下标回车',
		 	type: 		 		'textarea',
		 	column: 	 		6,
		 	value: '100<sup>2</sup> ',
		 	isUseHtmlInput: 		true,//是否支持html虚拟输入组件 目前只支持上下标<sub></sub><sup></sup>
		}
	]
};
var navJson = {
	id:'nav',
	title:'文本框输入辅助功能',
	btns:[]
}
</script>
</container>
<!--# include file="/lims/include/page-suffix.html" -->