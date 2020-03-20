var nsButton = {};
var btnGroupIndex = 0;

nsButton.defaultKeyword = {}
//level1关键字是包含关系，只要包含文字则显示图标
//nsbutton生成展示页面开始
nsButton.defaultKeyword.level1 = {

	// 基础图标
	'模板':'fa-wpforms',
	'新增':'fa-plus',
	'编辑':'fa-edit',
	'删除':'fa-trash',
	'查询':'fa-search',
	'保存':'fa-save',
	'打印':'fa-print',
	'图片':'fa-image',
	'拍照':'fa-camera',
	'表格':'fa-table',
	'表单':'fa-wpforms',
	'查看':'fa-eye',
	'上传':'fa-upload',
	'下载':'fa-download',
	'复制':'fa-clone',
	'粘贴':'fa-clipboard',
	'剪切':'fa-scissors',
	'分享':'fa-share-alt',
	'选择':'fa-mouse-pointer',
	'计算':'fa-calculator',
	'导入':'fa-sign-in',
	'导出':'fa-sign-out',
	'设置':'fa-cog',
	'打开':'fa-folder-open',
	'关闭':'fa-close',
	'云':'fa-cloud',
	'后退':'fa-arrow-left',
	'前进':'fa-arrow-right',
	'上移':'fa-arrow-up',
	'下移':'fa-arrow-down',
	'刷新':'fa-refresh',	
	'重置':'fa-rotate-left',
	'附件':'fa-paperclip',
	'取消':'fa-ban',
	'时间':'fa-clock-o',
	'日期':'fa-calendar',
	'列表':'fa-list',
	'文件':'fa-file-text',
	'提交':'fa-check',
	'信息':'fa-envelope',
	'参数':'fa-database',
	'标签':'fa-tags',
	'用户':'fa-user',
	'客户':'fa-user',
	'支付':'fa-credit-card',
	'统计':'fa-bar-chart',
	'返回':'fa-mail-reply', 
	'提醒':'fa-bell',
	'发送':'fa-send',
	'确认':'fa-check',
	'回复':"fa-commenting",
	'任务':"fa-tasks",
	'数据':"fa-database",
	'同步':"fa-random",
	'同步体检项目':"fa-random",
	'转移':"fa-share-square-o",
	'申请':"fa-file-text-o",
	'配置':"fa-ellipsis-v",
	'首页':"fa-home",
    "关注":"icon-star",
	"取消关注":"icon-star-o",	

	// 扩展图标
	'新建':'fa-plus',
	'修改':'fa-edit',
    '更多':'fa-edit',
    '省略':'icon-ellipsis-circle-h',
	'签收':'fa-check',
	'清除':'fa-trash',
	'移除':'fa-trash',
	'代码':'fa-code',
	'转账':'fa-exchange',
	'转换':'fa-exchange',
	'照片':'fa-image',
	'?':'fa-question-circle',
	'x':'fa-times-circle',
	'帮助':'fa-question-circle',
	'编号':'fa-list-ol',
	'流程图':'fa-recycle',
	'回收':'fa-recycle',
	'环节':'fa-dot-circle-o',
	'搜索':'fa-search',
	'审核':'fa-search',
	'调入':'fa-sign-in',
	'样品接收':'fa-sign-in',
	'盘点':'fa-calculator',
	'结果计算':'fa-calculator',
	'调出':'fa-sign-out',
	'升序':'fa-long-arrow-up',
	'方法':'fa-code',
	'降序':'fa-long-arrow-down',
	'置顶':'fa-fast-backward fa-rotate-90us',
	'置底':'fa-fast-backward fa-rotate-270',
	'窗体':'fa-window-maximize',
	'分配':'fa-share-alt',
	'选中':'fa-mouse-pointer',
	'重选':'fa-mouse-pointer',
	'标准查新':'fa-refresh',
	'退回':'fa-arrow-left',
	'回退':'fa-arrow-left',
	'前进':'fa-arrow-right',
	'上一步':'fa-arrow-left',
	'下一步':'fa-arrow-right',
	'上一位':'fa-arrow-left',
	'下一位':'fa-arrow-right',
	'复制项目':'fa-clone',
	'签名':'fa-pencil',
	'录入':'fa-keyboard-o',
	'生成':'fa-retweet',
	'启用':'fa-rotate-left',
	'转办':'fa-rotate-left',
	'作废':'fa-ban',
	'禁用':'fa-ban',
	'维护':'fa-wrench',
	'默认':'fa-check-square',
	'意见':'fa-comments-o',
	'确定':'fa-check',
	'同意':'fa-check-square',
	'批准':'fa-check',
	'运行':'fa-play',
	'升级':'fa-cloud-upload',
	'解锁':'fa-unlock-alt',
	'清空':'fa-times-circle-o',
	'购买记录':'fa-clock-o',
	'其他功能':'fa-asterisk',
	'调拨申请':'fa-random',
	'扩展':'fa-arrows-alt',
	'流程管理':'fa-sort-amount-desc',
	'标准管理':'fa-cogs',
	'方法管理':'fa-cogs',
	'调整':'fa-cogs',
	'自定义表单':'fa-toggle-on',
	'设备管理':'fa-window-restore',
	'编号维护':'fa-sort-numeric-asc',
	'记录表格管理':'fa-table',
	'表格配置':'fa-table',
	'预览':'fa-eye',
	'显示':'fa-eye',
	'隐藏':'fa-eye-slash',
	'解析表':'fa-bar-chart',
	'销毁':'fa-fire',
	'分组':'fa-object-group',
	'组织矩阵':'fa-codepen',
	'技能矩阵':'fa-codepen',
	'发放':'fa-send',
	'发放文件':'fa-send',
	'交车单':'fa-car',
	'预览模式':'fa-eye',
	'输入模式':'fa-keyboard-o',
	'清除表格个人记录':'fa-eraser',
	'示例':'fa-cube',
	'拆分':'fa-unlink',
	'初始化':'fa-history',
	'获取值':'fa-crosshairs',
	'页面配置':'fa-code',
	'下级单位':'fa-sitemap',
	'添加批注':'fa-commenting',
	'结束':'fa-step-forward',
	'全屏':'fa-arrows-alt',
	'全屏模式':'fa-arrows-alt',
	'退出全屏':'fa-compress',
	'离线模式':'fa-cloud-download',
	'退出离线':'fa-cloud-upload',
	'缓存':'fa-cloud-download',
	'指定批次':'fa-sort-alpha-asc',
	'指定序列号':'fa-sort-numeric-asc',
	'测试':'fa-code',
	'自动':'fa-retweet',
	'报告':'fa-file-text-o',
	'终止':'fa-stop-circle-o',
	'延期':'fa-hourglass-end',
	'重选记录':'fa-check-square-o',
	'采集数据':'fa-stack-overflow',
	'分包':'fa-unlink',
	'复检':'fa-retweet',
	'授权':'fa-key',
	'借阅归还':'fa-stack-overflow',
	'公海':"fa-sitemap",
	'添加协作人':"fa-user-plus",
	'添加联系人':"fa-user-plus",
	'刷新方法':"fa-refresh",
	'选择方法':"fa-mouse-pointer",
	'写跟进':"fa-crosshairs",
	'赋值':"fa-bookmark",
	'重选类别':"fa-check-circle-o",
	'原始记录':"fa-clock-o",
	'增加使用记录':"fa-plus-square",
	'仪器校准':"fa-crosshairs",
	'收费情况':"fa-rmb",
	'合并':"fa-object-group",
	'加急':"fa-rocket",
	'开始':"fa-play-circle-o",
	'结束':"fa-stop-circle-o",
	'结论':"fa-commenting",
	'流转备注':"fa-commenting",
	'释放':"fa-share-square-o",
	'处理':"fa-sign-out",
	'货币':"fa-rmb",
	'百分比':"fa-percent",
	'指纹':"fa-hand-pointer-o",
	'档案':"fa-vcard-o",
	'完成主检':"fa-podcast",
	'完成审核':"fa-calendar-check-o",
	'体检结果':"fa-newspaper-o",
	'重置方法':"fa-reply",
	'刷新方法与标准':"fa-recycle",
	'驳回':"fa-share-square",
	'关联页面':'fa-window-restore',
	'签入':'fa-sign-in',
	'签出':'fa-sign-out',
	'必检':'fa-check',
	'不必检':'fa-close',
	'生成记录':'fa-indent',
	'生成报告':'fa-paste',
	'作业指导书':'fa-book',
	'接收仪器数据':'fa-database',
	'日志':'fa-file-text-o',
	'零件':'fa-gears',
    '样品':'fa-eyedropper',
    '备注及留样':'fa-eyedropper',
    '工作流':'fa-random',
    '复核':'fa-check-square-o',

    

		
	// 角色管理
	'人员管理':'fa-users',
	'增加角色':'fa-user-plus',
	'移除用户':'fa-user-times"',
	'删除角色':'fa-user-times"',
	'关联用户':'fa-address-book-o',
	'人员档案':'fa-users',
	'设置角色':'fa-user-circle',
	'指定办理人':'fa-users',

	// 文档管理
	'合同':'fa-file-text-o',
	'明细':'fa-file-text-o',
	'说明':'fa-file-text-o',
	'详细':'fa-file-text-o',
	'业务单据':'fa-paste',
	'文件管理':'fa-file-word-o',
	'增加合同':'fa-plus',
	'新增文件':'fa-plus',
	'查看合同':'fa-eye',
	'修改文件':'fa-pencil',
	'手动归档':'fa-hand-o-up',
	'保存为模版':'fa-save',
	
	'记录模板':'fa-wpforms',
	'选择模板':'fa-wpforms',
	'合同正文':'fa-wpforms',
	'权限':'fa-podcast',

	// 财务管理
	'提现':'fa-rmb',
	'收款':'fa-rmb',
	'调价':'fa-rmb',
	'人民币':'fa-rmb',
	'价格':'fa-rmb',
	'划价':'fa-rmb',
	'记账':'fa-pencil-square-o',
	'开账':'fa-book',
	'收票':'fa-ticket',
	'开票':'fa-ticket',
	'税率':'fa-ticket',
	'付款':'fa-credit-card',
	'统计':'fa-bar-chart',
	'结算':'fa-calculator',

	// 产品管理
	'项目':'fa-cube',
	'配件':'fa-paperclip',
	'上架':'fa-arrow-circle-o-up',
	'下架':'fa-arrow-circle-o-down',
	'检测':'fa-flask',
	'库存':'fa-cubes',
	'条码':'fa-barcode',
	'扫码':'fa-barcode',
	'入库':'fa-sign-in',
	'出库':'fa-sign-out',
	
	// 专用图标
	'设置矩阵条件':'fa-server',
	'留样管理':'fa-eyedropper',
	'采样':'fa-eyedropper',
	'采样点':'fa-eyedropper',
	'试验大纲':'fa-list-alt',
	'扣分清零':'fa-times-circle-o',
	'重选方法':'fa-history',
	'修改推荐方法':'fa-file-powerpoint-o',
	'修改推荐标准':'fa-sliders',
	'缓存选中数据':'fa-database',
	'数据源':'fa-database',
	'设备类型':'fa-server',
	'设备':'fa-dashboard',
	
	'质控':'fa-balance-scale',
	'资质':'fa-trophy',
	'VO数据':'fa-cubes',

	'放大':'fa-search-plus',
	'缩小':'fa-search-minus',
}
nsButton.defaultKeyword.level2 = {
	'添加附件':'fa-upload',
	'合同正文':'fa-file-text-o',
}
nsButton.defaultKeyword.level3 = {
	'修改':['info','fa-edit'],
	'作废':['warning','fa-trash'],
	'删除':['warning','fa-trash'],
	'保存新增':['success','fa-save'],
	'保存':['success','fa-save'],
	'提交':['info','fa-cloud-upload'],
	'批准':['info','fa-check'],
	'记账':['info','fa-check'],
	'支付':['info','fa-check'],
	'撤销':['warning','fa-rotate-left'],
	'取消':['white','fa-ban'],
	'作废':['white','fa-ban'],
	'清除':['white','fa-ban'],
	'新增':['success','fa-plus'],
	'新建':['success','fa-plus'],
	'添加':['success','fa-plus'],
	'编辑':['info','fa-edit'],
	'批量编辑':['info','fa-edit'],
	'复制':['info','fa-copy'],
	'剪切':['info','fa-cut'],
	'粘贴':['info','fa-clipboard'],
	'搜索':['info','fa-search'],
	'查看':['info','fa-eye'],
	'打开':['info','fa-folder-open'],
	'查询':['info','fa-search'],
	'项目选择':['info','fa-tags'],
	'拖拽':['info','fa-navicon'],
}
nsButton.defaultKeyword.type = {
	'success':'fa-check',
	'warning':'fa-remove',
	'info':'fa-info-circle',
}
//nsbutton生成展示页面结束
//设置默认值
nsButton.setDefault = function(btnConfig,source,index,isShowIcon, isShowText){
	//console.log(btnConfig);
	//设定默认值,默认值可以直接写在btnConfig中，也支持早期版本的参数传入方式
	//所有默认值都优先计算btnConfig中的值
	//source的有效值包括table form modal(弹出框)
	if(typeof(btnConfig.source)!='string'){
		btnConfig.source = typeof(source)=='string'?source:'';
	}
	//默认返回参数
	btnConfig.isReturn = typeof(btnConfig.isReturn) == 'boolean' ? btnConfig.isReturn : false;
	//默认显示图标
	if(typeof(btnConfig.isShowIcon)!='boolean'){
		btnConfig.isShowIcon = typeof(isShowIcon)=='boolean'?isShowIcon:true;
	}
	//默认显示文字
	if(typeof(btnConfig.isShowText)!='boolean'){
		if(btnConfig.source=='table'){
			btnConfig.isShowText = typeof(isShowText)=='boolean'?isShowText:false;
		}else{
			btnConfig.isShowText = typeof(isShowText)=='boolean'?isShowText:true;
		}
	}

	//默认不显示tooltip, 如果是不显示文字则默认显示tooltip
	if(typeof(btnConfig.isTooltip)!='boolean'){
		if(btnConfig.isShowText){
			btnConfig.isTooltip = false;
		}else{
			btnConfig.isTooltip = true;
		}
	}
	//tooltipTitle, 默认使用text文字当tooltipTitel

	if(btnConfig.isTooltip){
		if(typeof(btnConfig.tooltipTitle)!='string'){
			btnConfig.tooltipTitle = btnConfig.text;
		}
	}
	//详见nsButton.getHtml开始时的注释
	if(typeof(btnConfig.index)!='object'){
		if(typeof(index)!='undefined'){
			btnConfig.index = {'fid':index};
		}
		if(typeof(btnConfig.columnID)!='undefined'){
			if(typeof(btnConfig.index)!='object'){
				btnConfig.index = {};
			}
			btnConfig.index.columnID = btnConfig.columnID;
		}
	}else{
		//存在index值
		if(typeof(index)=='string'){
			btnConfig.index.fid = index;
		}
	}
	//如果modal则默认的class是btn-info,其它默认是btn-white
	if(typeof(btnConfig.btnCls)!='string'){
		if(typeof(btnConfig.type)!="string"){
			if(btnConfig.source=='modal'){
				btnConfig.btnCls = 'btn btn-info';
			}else{
				btnConfig.btnCls = 'btn btn-white';
			}
		}else{
			btnConfig.btnCls = 'btn btn-'+btnConfig.type;
		}
		btnConfig.isCustomBtnCls = false;
	}else{
		btnConfig.isCustomBtnCls = true;
	}
	//btnConfig.parameter默认为空，不回传参数
	if(typeof(btnConfig.parameter)!='string'){
		btnConfig.parameter = '';
	}
	//是否显示configShow或isVisible
	if(typeof(btnConfig.configShow)!='boolean'){
		if(typeof(btnConfig.isVisible) == 'boolean'){
			btnConfig.configShow = btnConfig.isVisible;
		}else{
			btnConfig.configShow = true;
		}
	}
	return btnConfig;
}
//根据文本返回icon的class，可能包括btn的class
nsButton.getIconAndColorByText = function(text){
	var iconCls = '';
	var btnCls = '';
	//最高优先级的图标和颜色
	if(typeof(nsButton.defaultKeyword.level3[text])=='object'){
		//字典对象中存储例子  '修改':['info','fa-edit']
		iconCls = nsButton.defaultKeyword.level3[text][1];
		btnCls = 'btn btn-'+nsButton.defaultKeyword.level3[text][0];
	}
	if(iconCls==''){
		//第二优先级 必须等于才生成对应图标
		if(typeof(nsButton.defaultKeyword.level2[text])=='string'){
			iconCls = nsButton.defaultKeyword.level2[text];
		}
	}	
	if(iconCls==''){
		//最低匹配结果 如果包含关键字则生成对应图标
		for(level1key in nsButton.defaultKeyword.level1){
			if(text.indexOf(level1key)>-1){
				iconCls = nsButton.defaultKeyword.level1[level1key]
			}
		}
	}
	return{
		'iconCls':iconCls,
		'btnCls':btnCls
	}
}
//获取图标和按钮类型
//return {iconCls:'fa-check', btnCls:'btn btn-info'}
//要调用此函数只需要包含text即可，或者传入{text:'文字内容'}
nsButton.getIconAndButtonClassByConfig = function(btnConfig){
	var iconCls = '';
	var btnCls = '';
	//有自定义属性,直接返回对应值
	if(typeof(btnConfig.iconCls)=='string' && typeof(btnConfig.btnCls)=='string'){
		iconCls = btnConfig.iconCls;
		btnCls = btnConfig.btnCls;
		return {
			'iconCls':iconCls,
			'btnCls':btnCls
		}
	}

	//没有自定义属性，需要根据关键字决定
	//根据类型生成的默认图标
	if(typeof(nsButton.defaultKeyword.type[btnConfig.type])=='string'){
		iconCls = nsButton.defaultKeyword.type[btnConfig.type];
	}
	
	var btnText = btnConfig.text;
	var matchingObj = nsButton.getIconAndColorByText(btnText)
	iconCls = matchingObj.iconCls;
	//如果是自定义的btnCls则优先级最高
	btnCls = btnConfig.isCustomBtnCls == true ? btnConfig.btnCls : matchingObj.btnCls;
	
	//如果还是空，才读默认的

	//btnCls = btnCls == '' ? btnConfig.btnCls : matchingObj.btnCls
	if(btnCls == ''){
		btnCls = btnConfig.btnCls;
	}
	//如果只有icon 添加btn-icon类
	if(btnConfig.isShowText == false){
		btnCls+=' btn-icon';
	}
	return {
		'iconCls':iconCls,
		'btnCls':btnCls
	}
}
//返回数组对应的HTML
nsButton.getHtmlByConfigArray = function(btnConfigArray){
	//[{text:'',handler:function(){}}, {text:'',handler:function(){}}]
	var html = ''
	for(var btnI = 0; btnI<btnConfigArray.length; btnI++){
		html += nsButton.getHtml(btnConfigArray[btnI]);
	}
	return html;
}
nsButton.getHtml = function(btnConfig,source,index,isShowIcon, isShowText){
	//btnConfig: {
	//	text:string  			显示文字 必填,
	// 	type:'info',			按钮状态 'success/warning/error/info/white'	
	// 	columnID:number,		表格第几列（已被index替代）
	//  index:object, 			附加参数 目前用于function多维数组定位	{fid:1, cid=3}则btn标签会出现fid="1", cid="3"	
	// 	handler:function,		回调函数 必填
	//  parameter:'string', 	回调函数的参数
	// 	iconCls:"fa-upload",	icon的样式
	//  btnCls:string, 			按钮样式
	// 	isReturn:boolean,		如果为true，则返回参数，否则不返回参数 
	// 	configShow:boolean, 	默认true, 是否显示
	//  source:string, 			来源 table modal（弹出框） plane form
	//  isShowText:boolean, 	是否显示图标
	//  isShowIcon:boolean, 	是否显示文字
	//	disabled:boolean, 		是否可用
	//  html:string(html), 		下拉菜单容器的html代码 	subdata和html是排斥的
	// }
	//source,index,isShowIcon,isShowText对应btnConfig的同样字段 原函数中的index是数字，被转换为{fid:index}
	//btnConfig.index是一个object，格式如下：{fid:1,col:3,option:4},则输出fid="1" col="2",key值自定义
	//参数是btnConfig.parameter 目前只支持字符串

	if($.isArray(btnConfig.subdata)){
		//含有下拉按钮,仅限导航按钮的使用
		var dropdownArr = [];
		var dropData = btnConfig.subdata;
		var subitemIndex = 0;  //第几个下拉列表
		for(var dropI=0; dropI<dropData.length; dropI++){
			var toggleJson = {};
			toggleJson.index = {
				fid:index,
				optionid:subitemIndex,
			};
			if(typeof(dropData[dropI].index)=='object'){
				for(var attr in dropData[dropI].index){
					toggleJson[attr] = dropData[dropI].index[attr];
				}
			}
			if(dropData[dropI].href){
				toggleJson.href = dropData[dropI].href;
			}
			toggleJson.disabled = typeof(dropData[dropI].disabled)=='boolean' ? dropData[dropI].disabled : false;
			toggleJson.text = dropData[dropI].text;
			//是否显示configShow或isVisible
			toggleJson.configShow = dropData[dropI].configShow;
			if(typeof(dropData[dropI].configShow)!='boolean'){
				if(typeof(dropData[dropI].isVisible) == 'boolean'){
					toggleJson.configShow = dropData[dropI].isVisible;
				}else{
					toggleJson.configShow = true;
				}
			}
			toggleJson.handler = dropData[dropI].handler;
			dropdownArr.push(toggleJson);
			subitemIndex++;
		}
		btnConfig.fid = index;
		btnConfig.subdata = dropdownArr;
		if(typeof(btnConfig.configShow)!='boolean'){
			if(typeof(btnConfig.isVisible) == 'boolean'){
				btnConfig.configShow = btnConfig.isVisible;
			}else{
				btnConfig.configShow = true;
			}
		}
		//sjj20181024 针对下拉选择添加支持方式
		switch(btnConfig.dropdownType){
			case 'saveCustom':
				html = nsButton.getSaveCustomDropdownHtml(btnConfig);
				break;
			case 'simple':
			default:
				html = nsButton.getDropdownHtml(btnConfig);
				break;
		}
	}else if(typeof(btnConfig.html)=='string'){
		//高级搜索中使用html是一个ul标签是配置好的
		html = '<div class="btn-group">'
						+'<button type="button" class="btn btn-white dropdown-toggle" data-toggle="dropdown">'
						+btnConfig.text
						+'<span class="caret"></span>'
						+'</button>'
						+btnConfig.html
					+'</div>';
	}else if(typeof btnConfig.ajaxConfig != 'undefined'){
		//lxh ajax处理
		switch(btnConfig.dropdownType){
			case 'ajaxShowIndex':
				return nsButton.getAjaxDropdownHtml(btnConfig);
				break;
			default:
				break;
		}
		//lxh ajax处理
	}else{
		btnConfig = nsButton.setDefault(btnConfig,source,index,isShowIcon, isShowText);
		var onclickAttr = ''; //onClick属性
		if(typeof(btnConfig.handler)=='string'){
			//如果带着()，则需要判断里面的引号是单引号还是双引号，有括号就不要使用参数了
			if(btnConfig.handler.indexOf("(")>-1){
				if(btnConfig.handler.indexOf("'")>-1){
					onclickAttr = ' onclick="'+btnConfig.handler+';"';
				}else{
					onclickAttr = " onclick='"+btnConfig.handler+";'";
				}
			}else{
				//如果有参数，把其中的双引号改成单引号
				btnConfig.parameter = btnConfig.parameter.replace(/\"/g,"'")
				onclickAttr = ' onclick="'+btnConfig.handler+'('+btnConfig.parameter+');"';
			}
		}

		var html = '';
		//console.log(btnConfig)
		var classObj = nsButton.getIconAndButtonClassByConfig(btnConfig);
		var btnCls = classObj.btnCls;
		//生成icon
		if(btnConfig.isShowIcon){
			html = classObj.iconCls==''?'':'<i class="'+classObj.iconCls+'"></i>';
		}
		//是否加上文字
		if(btnConfig.isShowText){
			html = html+'<span>'+btnConfig.text+'</span>';
		}
		//如果是表格 则需要给按钮的class加上
		if(btnConfig.source=='table' && btnConfig.isShowIcon==true && btnConfig.isShowText==false){
			btnCls = btnCls+'  btn-icon';
		}
		//是否隐藏
		if(btnConfig.configShow==false){
			btnCls = btnCls+' hidden';
		}
		var attrHtml = '';
		//function位置参数
		if(btnConfig.index){
			for(key in btnConfig.index){
				attrHtml += ' '+key+'="'+btnConfig.index[key]+'"';
			}
		}
		//是否有提示
		if(btnConfig.isTooltip){
			attrHtml += ' data-toggle="tooltip" title="'+btnConfig.tooltipTitle+'"';
		}
		if(btnConfig.disabled){
			attrHtml +=' disabled="disabled"';
		}
		//是否返回ev对象
		if(typeof(btnConfig.isReturn)=='boolean'){
			if(btnConfig.isReturn){
				attrHtml += 'isReturn="true"';
			}
		}
		//生成按钮代码
		html = 
			'<button type="button" '
				+'class="'+btnCls+'" '
				+onclickAttr
				+attrHtml
				//+tableTooltip+' '+tableToolTitle+' '+btnDisabled+' '+btnHandler+functionID+isReturn+columnID
			+'>'
				+html
			+'</button>';
	}
	return html;
}
//lxh 打印处理
nsButton.getAjaxDropdownHtml = function(btnGroupConfig){
	/**
	 * englishName:"",
	 * chineseName:"",
	 * defaultMode:"templateId",
	 * functionClass:"modal/list",
	 * url:"",
	 * ajaxData:{},
	 * text:"",
	 * callbackAjax:""
	 */
	if(!$.isEmptyObject(btnGroupConfig.ajaxConfig)){
		var ajaxConfig = btnGroupConfig.ajaxConfig;
		var data = ajaxConfig.data;
		var dataSrc = ajaxConfig.dataSrc;
		var ajax = nsVals.getAjaxConfig(ajaxConfig,data);
		var valueField = btnGroupConfig.valueField;
		var textField = btnGroupConfig.textField;
		//发送ajax请求
		nsVals.ajax(ajax,function(res){
			if(res.success){
				btnGroupConfig.ajaxData = res[dataSrc];
				btnGroupConfig.subdata = [];
				if($.isArray(res[dataSrc])){
					$.each(res[dataSrc],function(index,item){
						var subDataItem = {};
						subDataItem.index = {
							fid:btnGroupConfig.index.fid,
							customerindex:btnGroupConfig.index.customerIndex,
							templateid:item[valueField],
						}
						subDataItem.text = item[textField];
						btnGroupConfig.subdata.push(subDataItem);
					});
					//dom操作
					var $mainDiv = $('div[dropdown-index='+ btnGroupConfig.index.fid +']');
					$mainDiv.append(nsButton.getAjaxCustomDropdownHtml(btnGroupConfig));
					// 添加节点时，先从本地存储获取到上次最后一次点击再比对，然后添加到按钮中
					var lastPrintTemplateId = localStorage.getItem('lastPrintTemplateId');
					var $mainBtn = $mainDiv.find('button[ns-type="event"]');
					$.each(res[dataSrc],function(idx,itm){
						if(lastPrintTemplateId == itm[valueField]){
							$mainBtn.attr('templateid',lastPrintTemplateId);
							$mainBtn.find('span').html(''+ (btnGroupConfig.clickShow || '打印') +':<span class="badge">'+ (idx + 1) +'</span>');
						}
					});
					//按钮添加事件
					var $ajaxPrintbtn = $mainDiv.find('button[ns-type="event"]');
					$ajaxPrintbtn.off();
					$ajaxPrintbtn.on('click',function(e){
						var $this = $(this);
						var templateId = $(this).attr('templateid');
						var callbackAjax = btnGroupConfig.callbackAjax;
						if(typeof templateId != 'undefined'){
							var customerIndex = $(this).attr('customerindex') || $(this).attr('fid');

							if(typeof(btnGroupConfig.handler)=='function'){
								btnGroupConfig.handler({
									$dom:$this,
									customerIndex:customerIndex,
									templateId:templateId,
									callbackAjax:callbackAjax
								});
							}

						}
					});
					//给每个ul下的button添加事件
					var $btns = $mainDiv.find('ul').find('button');
					$btns.on('click',function(e){
						var $this = $(this);
						var templateId = $(this).attr('templateid');
						var callbackAjax = btnGroupConfig.callbackAjax;
						var customerIndex = $(this).attr('customerindex') || $(this).attr('fid');
						if(typeof templateId != 'undefined'){

							if(typeof(btnGroupConfig.handler)=='function'){
								localStorage.setItem('lastPrintTemplateId',templateId);
								btnGroupConfig.handler({
									$dom:$this,
									customerIndex:customerIndex,
									templateId:templateId,
									callbackAjax:callbackAjax
								});
								$mainBtn.attr('templateid',templateId);
								$mainBtn.find('span').html(''+ (btnGroupConfig.clickShow || '打印') +':<span class="badge">'+ (Number($(this).attr('ns-index')) + 1) +'</span>');
							}

						}
					});
				}
				typeof cb == 'function' && cb(nsButton.getAjaxCustomDropdownHtml(btnGroupConfig));
			}else{
				return nsalert("ajax返回数据错误");
			}
		});
	}
	var btnHtml = '<div class="btn-group">'
					+'<button class="btn btn-white" callbackajax="'+ btnGroupConfig.callbackAjax +'" customerindex="'+ btnGroupConfig.index.customerIndex +'" fid="'+ btnGroupConfig.index.fid +'" ns-type="event"> <i class="fa-print"></i>'
						+'<span>'+ (btnGroupConfig.text || '打印') +'</span>'
					+'</button>'
					+'<button class="btn btn-white btn-icon" ns-type="drop"> <i class="fa-caret-down"></i>'
					+'</button>'
				+'</div>';
	var btnHtmlExpUl = '<div class="btn-group"><div class="btn-dropdown dropdown-saveCustom-panel" dropdown-index="'+btnGroupConfig.index.fid+'">'+btnHtml+'</div></div>';
	return btnHtmlExpUl;
};
nsButton.getAjaxCustomDropdownHtml = function(btnGroupConfig){
	var dropdownArray = btnGroupConfig.subdata;
	var ulHtml = '<ul class="dropdown-menu dropdown-saveCustom-ul">';
	for(var dropI=0;dropI<dropdownArray.length; dropI++){
		//如果是function则是普通下拉按钮
		var attributeClassStr = '';
		for(var key in dropdownArray[dropI].index){
			attributeClassStr += ' '+key+'="'+dropdownArray[dropI].index[key]+'"';
		}
		ulHtml += '<li class="dropdown-item">'
						+'<button class="btn btn-default" '+attributeClassStr+' customerindex="'+ btnGroupConfig.index.fid +'" ns-index="'+ dropI +'">'
							+'<i class="fa-print"></i>'
							+'<span>'+dropdownArray[dropI].text+'</span>'
						+'</button>'
					+'</li>';
	}
	ulHtml += '</ul>';
	return ulHtml;
}
//lxh 打印处理
nsButton.getSaveCustomDropdownHtml = function(btnGroupConfig){
	var dropdownArray = btnGroupConfig.subdata;
	var defaultShowStr = dropdownArray[0].text;
	var defaultIndex = 0;
	if(typeof(btnGroupConfig.defaultIndex)=='number'){
		//定义了默认要显示的下拉项
		if(btnGroupConfig.defaultIndex > -1 && btnGroupConfig.defaultIndex < dropdownArray.length){
			defaultShowStr = dropdownArray[btnGroupConfig.defaultIndex].text;
			defaultIndex = btnGroupConfig.defaultIndex;
		}
	}
	var defalutAttrClassStr = '';
	for(key in dropdownArray[defaultIndex].index){
		defalutAttrClassStr += ' '+key+'="'+dropdownArray[defaultIndex].index[key]+'"';
	}
	var btnHtml = '<div class="btn-group">'
					+'<button class="btn btn-white" ns-type="event" '+defalutAttrClassStr+'> <i class="fa-print"></i>'
						+'<span>'+defaultShowStr+'</span>'
					+'</button>'
					+'<button class="btn btn-white btn-icon" ns-type="drop"> <i class="fa-caret-down"></i>'
					+'</button>'
				+'</div>';
	var ulHtml = '<ul class="dropdown-menu dropdown-saveCustom-ul">';	
	for(var dropI=0;dropI<dropdownArray.length; dropI++){
		//如果是function则是普通下拉按钮
		var attributeClassStr = '';
		for(key in dropdownArray[dropI].index){
			attributeClassStr += ' '+key+'="'+dropdownArray[dropI].index[key]+'"';
		}
		ulHtml += '<li class="dropdown-item">'
						+'<button class="btn btn-default" '+attributeClassStr+'>'
							+'<i class="fa-print"></i>'
							+'<span>'+dropdownArray[dropI].text+'</span>'
						+'</button>'
					+'</li>';
	}
	ulHtml += '</ul>';		
	return '<div class="btn-group"><div class="btn-dropdown dropdown-saveCustom-panel" dropdown-index="'+btnGroupConfig.index.fid+'">'+btnHtml+ulHtml+'</div></div>';
}
nsButton.getDropdownHtml = function(btnGroupConfig){
	var html = ''
	var style = '';
	for(var liI = 0; liI<btnGroupConfig.subdata.length; liI++){
		var iconHtml = '';
		var text = btnGroupConfig.subdata[liI].text;
		if(btnGroupConfig.subdata[liI].iconCls){
			iconHtml = btnGroupConfig.subdata[liI].iconCls;
			text= '<span>'+text+'</span>';
		}
		var hrefAttr = 'javascript:void(0);';
		if(btnGroupConfig.subdata[liI].href){
			hrefAttr = btnGroupConfig.subdata[liI].href;
		}
		if(typeof(btnGroupConfig.subdata[liI].handler)=='function'){
			//如果是function则是普通下拉按钮
			attrHtml = '';
			for(key in btnGroupConfig.subdata[liI].index){
				attrHtml += ' '+key+'="'+btnGroupConfig.subdata[liI].index[key]+'"';
			}
			text = '<a href="'+hrefAttr+'" '+attrHtml+'>'+iconHtml+text+'</a>';
		}else if(typeof(btnGroupConfig.subdata[liI].handler)=='object'){
			//如果是对象则是包含子按钮的
			//console.log(btnGroupConfig.subdata[liI].handler);
			if(typeof(btnGroupConfig.subdata[liI].handler.width)=='number'){
				style = 'width:'+btnGroupConfig.subdata[liI].handler.width+'px';
			}
			text = nsButton.getDropdownSubButtonHtml(btnGroupConfig, text, liI)
		}else if(typeof(btnGroupConfig.subdata[liI].handler)=='string'){
			var onclickAttr = '';
			if(btnGroupConfig.subdata[liI].handler.indexOf("(")>-1){
				if(btnGroupConfig.subdata[liI].handler.indexOf("'")>-1){
					onclickAttr = ' onclick="'+btnGroupConfig.subdata[liI].handler+';"';
				}else{
					onclickAttr = " onclick='"+btnGroupConfig.subdata[liI].handler+";'";
				}
			}else{
				onclickAttr = ' onclick="'+btnGroupConfig.subdata[liI].handler+'(this);"';
			}
			text = '<a href="'+hrefAttr+'" '+onclickAttr+'>'+iconHtml+text+'</a>';
		}else{
			if(btnGroupConfig.subdata[liI].href){
				text = '<a href="'+hrefAttr+'">'+iconHtml+text+'</a>';
			}
		}
		var isShowCls = btnGroupConfig.subdata[liI].configShow ? '' : ' class="hide"';
		var isDisableAttr = btnGroupConfig.subdata[liI].disabled ? ' disabled="disabled"' : '';
		html+= 
			'<li '+ isShowCls +' '+isDisableAttr+'>'
				+text
			+'</li>';
	}
	style = 'style="'+style+'"';
	var isBtnShowCls = btnGroupConfig.configShow ? '' : 'hide';
	var buttonHtml = '<button type="button" class="btn btn-white  btn-icon dropdown-toggle" data-toggle="dropdown">'
						+btnGroupConfig.text
						+'<span class="caret"></span>'
					+'</button>';
	var isShowBtnAttr = 'isShowBtn=true';
	if(typeof(btnGroupConfig.hidden)=='boolean'){
		if(btnGroupConfig.hidden == true){
			buttonHtml = '';
			isShowBtnAttr = 'isShowBtn=false';
		}
	}		

	var closeHtml = '';
	if(nsVals.browser.browserSystem == 'mobile'){
		buttonHtml = '<button type="button" class="btn btn-white" ns-type="dropdown">'
						+btnGroupConfig.text
							+'<span class="caret"></span>'
					+'</button>';
		closeHtml = '<li class="mobile-cancel" nstype="cancel" '+isShowBtnAttr+'><a href="javascript:void(0);">取消</a></li>';
	}		
	html =  '<div class="btn-group ' + isBtnShowCls + '" browserSystem="'+nsVals.browser.browserSystem+'">'
				+buttonHtml
				+'<ul class="dropdown-menu" role="menu" '+style+'>'
					+html
					+closeHtml
				+'</ul>'
			+'</div>';
	return html;
}
nsButton.getDropdownSubButtonHtml = function(btnGroupConfig,text,liI){
	//console.log(btnGroupConfig);
	//text是文字，liI是第几行
	var html = '';
	var subbtnConfig = {};
	subbtnConfig.source = btnGroupConfig.source; 
	subbtnConfig.index = jQuery.extend({}, btnGroupConfig.subdata[liI].index);
	subbtnConfig.index.subbtnid = 0;
	var titleAttr = '';
	var titleAttrHtml = '';
	for(keyAttr in subbtnConfig.index){
		titleAttrHtml += ' '+keyAttr+'="'+subbtnConfig.index[keyAttr]+'"';
	}
	var titleHtml = '<div class="li-title">'
						+'<a  class="li-title-a" '+titleAttrHtml+' href="javascript:void(0);">'
							+text
						+'</span>'
					+'</div>';
	var subbtnHtml = '';
	var liConfig = btnGroupConfig.subdata[liI].handler;
	for(var subBtnI=0; subBtnI<liConfig.btns.length; subBtnI++){
		var isNotTitleHandler = true;
		var subbtnConfig = {};
		subbtnConfig.source = btnGroupConfig.source; 
		subbtnConfig.index = jQuery.extend({}, btnGroupConfig.subdata[liI].index);
		subbtnConfig.index.subbtnid = subBtnI+1;  //添加子按钮的id +1是因为标题是个handler
		for(keyText in liConfig.btns[subBtnI]){
			//title-handler是标题用的function
			//处理值的 {'添加表格':ssMoreIconHandler, 'isShowText':true}，最多有两个值
			if(keyText=='isShowText'){
				if(liConfig.btns[subBtnI].isShowText==true){
					subbtnConfig.isShowText = true
				}
			}else{
				subbtnConfig.text = keyText;
			}
		}
		if(isNotTitleHandler){
			subbtnHtml += nsButton.getHtml(subbtnConfig);
		}
	}
	html = titleHtml + '<div class="li-btns">' + subbtnHtml + "</div>";
	return html;
}
//根据ID生成HTML
nsButton.handlerArray = {};
nsButton.configArray = {};
nsButton.initBtnsByContainerID = function(containerID, btnConfigArray, isOnlyIcon){
	//containerID 		容器ID
	//btnConfigArray  	按钮数组[{text:'string', handler:function},{...}]
	//是否只显示图标
	if(debugerMode){
		var validParameterArr = [
			[containerID,'string',true],
			[btnConfigArray,'array',true],
			[isOnlyIcon,'boolean']
		]
		nsDebuger.validParameter(validParameterArr);
	}
	var $container = $('#'+containerID);
	var html = '';
	nsButton.handlerArray[containerID] = [];
	nsButton.configArray[containerID] = [];
	for(var btnI=0; btnI<btnConfigArray.length; btnI++){
		var btnConfig = btnConfigArray[btnI];
		if(isOnlyIcon){
			btnConfig.isShowText = false;
		}
		btnConfig.index = {fid:btnI, 'data-container':containerID};
		html += nsButton.getHtml(btnConfig);
		nsButton.handlerArray[containerID].push(btnConfig.handler);
	}
	html = '<div class="btn-group" id="'+containerID+'-btngroup">'+html+'</div>';
	if($container.children('#'+containerID+'-btngroup').length>0){
		$container.children('#'+containerID+'-btngroup').remove();
	}
	$container.append(html);
	$container.children('#'+containerID+'-btngroup').children('button').on('click',function(ev){
		var fid = $(this).attr('fid');
		fid = parseInt(fid);
		var _containerID = $(this).attr('data-container');
		var handlerFunc = nsButton.handlerArray[_containerID][fid];
		// handlerFunc();
		var thisBtnToFormID = $(this).parent().parent().parent().next().attr("id");//返回表单id 李亚伟 20180308
		handlerFunc(thisBtnToFormID);
	})
}
//设置按钮是否全部禁用
nsButton.setAllDisable = function(navID,isDisable){
	/*
		*navID 			string		按钮容器id
		*isDisable		boolean		是否禁用按钮
	*/
	//如果开启debugerMode模式
	if(debugerMode){
		var validParameterArr = [
			[navID,'string',true],
			[isDisable,'boolean']
		]
		nsDebuger.validParameter(validParameterArr);
	}
	var $btns = $('#'+navID+' button.btn');
	if($btns.length == 0){
		nsalert('按钮容器不存在，请检查id配置是否正确'+navID);
		return;
	}
	if(isDisable){
		$btns.attr('disabled','disabled');
	}else{
		$btns.removeAttr('disabled');
	}
}
//导航栏按钮批量禁用
nsButton.setDisable = function(navID,index){
	/*
		*navID 		string		按钮容器id
		*index		array		下标  只能是0,1 0代表只读 1可用 举例[0,1,0,0,1] 除第2个和第五个按钮可用其他禁用
	*/
	//如果开启debugerMode模式
	if(debugerMode){
		var validParameterArr = [
			[navID,'string',true],
			[index,'object']
		]
		nsDebuger.validParameter(validParameterArr);
	}
	var indexArray = index;
	//根据indexArray 有针对性的设置是否只读
	var $btns = $('#'+navID+' button.btn');
	if($btns.length == 0){
		nsalert('按钮容器不存在，请检查id配置是否正确'+navID);
		return;
	}
	if($btns.length != indexArray.length){
		console.log(indexArray)
		return;
	}
	for(var indexI=0; indexI<indexArray.length; indexI++){
		var isDisable = indexArray[indexI] == 0 ? true : false;//0只读，1可用
		var $this = $($btns[indexI]);
		if(isDisable){
			$this.attr('disabled',true);
		}else{
			$this.removeAttr('disabled');
		}
	}
	/*if(debugerMode){
		var validParameterArr = [
			[navID,'string',true],
			[isDisable,'boolean'],
			[index,'object number']
		]
		nsDebuger.validParameter(validParameterArr);
	}
	var $btns;
	if(typeof(index)=='undefined'){
		$btns = $('#'+navID).find('button.btn');
	}else if(typeof(index)=='number'){
		$btns = $('#'+navID).find('button.btn').eq(index);
		console.log($btns);
	}else if(typeof(index)=='string'){
		var $allbtns = $('#'+navID).find('button.btn');
		for(var btnI=0; btnI<$allbtns.length; btnI++){
			console.log($allbtns.eq(btnI).html())
		}

	}else if($.isArray(index)){
		//如果是数组，则禁用掉指定组[1]，如果数组有两个数[1,3]，则禁用掉第几组的第几个
		if(typeof(index[0])=='number'){
			$btns = $('#'+navID).children('.btn-group').eq(index[0]).children('button.btn');
		}
		if(index.length==2){
			$btns = $btns.eq(index[1]);
		}
		
	}
	
	//找不到
	if(debugerMode){
		if($btns.length==0){
			console.warn('没有满足条件参数的按钮，请检查 nsButton.setDisabled() 的 第三个参数')
		}
	}
	//true是执行禁用，false是解除禁用
	if(typeof(isDisable)=='undefined'){
		isDisable = true;
	}
	if(isDisable){
		$btns.not('[disabled]').attr('disabled','disabled');
	}else{
		$btns.filter('[disabled]').removeAttr('disabled');
	}*/
}