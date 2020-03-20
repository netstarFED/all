var btnGroupIndex = 0;
commonConfig.getBtn = function(btnConfig,source,index,isShowIcon, isShowText){
	//btnConfig: {text:'显示文字',type:'info',columnID:0,handler:function,iconCls:"fa-upload"}
	var isShowIconBln = typeof(arguments[3])!='undefined'?arguments[3]:true;
	var isShowTextBln = typeof(arguments[4])!='undefined'?arguments[4]:true;
	var btnClass = "";
	//mdoal类默认按钮为info，其它默认为white
	if(typeof(btnConfig.type)=="undefined"){
		if(source == "modal"){
			btnClass = 'btn btn-info';
		}else if(source == "form"){
			btnClass = 'btn btn-white';
		}else if(source == "table"){
			btnClass = 'btn btn-white';
			btnHandler = '';
		}
	}else{
		btnClass = 'btn btn-'+btnConfig.type;
	}
	//如果传进来的处理参数不是字符串而是函数则不添加onclick
	var functionID = ''
	var btnHandler = '';
	var columnID = '';
	var isReturn = '';
	if(typeof(btnConfig.columnID)!='undefined'){
		columnID = 'columnID="'+btnConfig.columnID+'"';
	}
	if(typeof(btnConfig.handler)!='undefined'){
		//fid handler下标生成
		if(typeof(btnConfig.handler)=='function'){
			btnHandler = '';
			functionID = ' fid="'+index+'"';
		}else{
			//functionID = '';
			if(btnConfig.handler.indexOf("(")>-1){
				if(btnConfig.handler.indexOf("'")>-1){
					btnHandler = ' onclick="'+btnConfig.handler+';"';
				}else{
					btnHandler = " onclick='"+btnConfig.handler+";'";
				}
			}else{
				btnHandler = ' onclick="'+btnConfig.handler+'();"';
			}
		}
		//isReturn 是否返回参数
		if(typeof(btnConfig.isReturn)=='boolean'){
			if(btnConfig.isReturn){
				isReturn = 'isReturn="true"';
			}
		}
	}
	var iconHtml = "";
	//参考图标配置，如果自定义了，则不执行，后面的参考值会优先于前面的
	if(typeof(btnConfig.iconCls)=="undefined"){
		//成功和警告的默认图标
		if(btnConfig.type=="success"){
			iconHtml = '<i class="fa-check"></i> ';
		}else if(btnConfig.type=="warning"){
			iconHtml = '<i class="fa-remove"></i> ';
		}

		var btnText = btnConfig.text;
		if(btnText.indexOf("查看")>=0){
			iconHtml = '<i class="fa-file-text-o"></i> ';
		}
		if(btnText.indexOf("库存")>=0){
			iconHtml = '<i class="fa-file-text-o"></i> ';
		}
		if(btnText.indexOf("重置")>=0){
			iconHtml = '<i class="fa-recycle"></i> ';
		}
		if(btnText.indexOf("明细")>=0){
			iconHtml = '<i class="fa-file-text-o"></i> ';
		}
		if(btnText.indexOf("表格")>=0){
			iconHtml = '<i class="fa-table"></i> ';
		}
		if(btnText.indexOf("代码")>=0||btnText.indexOf("模板")>=0){
			iconHtml = '<i class="fa-code"></i> ';
		}
		if(btnText.indexOf("转账")>=0){
			iconHtml = '<i class="fa-exchange"></i> ';
		}
		if(btnText.indexOf("合同")>=0){
			iconHtml = '<i class="fa-file-text-o"></i> ';
		}
		if(btnText.indexOf("拍照")>=0){
			iconHtml = '<i class="fa-camera"></i> ';
		}
		if(btnText.indexOf("照片")>=0){
			iconHtml = '<i class="fa-file-image-o"></i> ';
		}
		if(btnText.indexOf("图片")>=0){
			iconHtml = '<i class="fa-file-image-o"></i> ';
		}
		if(btnText.indexOf("条码")>=0){
			iconHtml = '<i class="fa-barcode"></i> ';
		}
		if(btnText.indexOf("扫码")>=0){
			iconHtml = '<i class="fa-barcode"></i> ';
		}
		if(btnText.indexOf("上传")>=0){
			iconHtml = '<i class="fa-upload"></i> ';
		}
		if(btnText.indexOf("下载")>=0){
			iconHtml = '<i class="fa-download"></i> ';
		}
		if(btnText.indexOf("?")>=0){
			iconHtml = '<i class="fa-question-circle-o"></i>';
		}
		if(btnText.indexOf("编号")>=0){
			iconHtml = '<i class="fa-list-ol"></i> ';
		}
		if(btnText.indexOf("打印")>=0){
			iconHtml = '<i class="fa-print"></i> ';
		}
		if(btnText.indexOf("价格")>=0){
			iconHtml = '<i class="fa-rmb"></i> ';
		}
		if(btnText.indexOf("流程图")>=0){
			iconHtml = '<i class="fa-sitemap"></i> ';
		}
		if(btnText.indexOf("环节")>=0){
			iconHtml = '<i class="fa-cogs"></i> ';
		}
		if(btnText.indexOf("删除")>=0){
			iconHtml = '<i class="fa-trash"></i> ';
		}
		if(btnText.indexOf("搜索")>=0){
			iconHtml = '<i class="fa-search"></i> ';
		}
		if(btnText.indexOf("清除")>=0){
			iconHtml = '<i class="fa-trash"></i> ';
		}
		if(btnText.indexOf("导入")>=0){
			iconHtml = '<i class="fa-sign-in"></i> ';
		}
		if(btnText.indexOf("导出")>=0){
			iconHtml = '<i class="fa-sign-out"></i> ';
		}
		if(btnText.indexOf("结算")>=0){
			iconHtml = '<i class="fa-calculator "></i> ';
		}
		if(btnText.indexOf("上移")>=0){
			iconHtml = '<i class="fa-arrow-up"></i> ';
		}
		if(btnText.indexOf("下移")>=0){
			iconHtml = '<i class="fa-arrow-down"></i> ';
		}
		if(btnText.indexOf("升序")>=0){
			iconHtml = '<i class="fa-long-arrow-up"></i> ';
		}
		if(btnText.indexOf("降序")>=0){
			iconHtml = '<i class="fa-long-arrow-down"></i> ';
		}
		if(btnText.indexOf("置顶")>=0){
			iconHtml = '<i class="fa-fast-backward fa-rotate-90 fa-fontsize12"></i> ';
		}
		if(btnText.indexOf("置底")>=0){
			iconHtml = '<i class="fa-fast-backward fa-rotate-270 fa-fontsize12"></i> ';
		}
		if(btnText.indexOf("窗体")>=0){
			iconHtml = '<i class="fa-calculator"></i> ';
		}
		if(btnText.indexOf("更多")>=0){
			iconHtml = '<i class="fa-edit"></i> ';
		}
		if(btnText.indexOf("附件")>=0){
			iconHtml = '<i class="fa-paperclip"></i> ';
		}
		if(btnText.indexOf("分配")>=0){
			iconHtml = '<i class="fa-random"></i> ';
		}
		if(btnText.indexOf("项目")>=0){
			iconHtml = '<i class="fa-cube"></i> ';
		}
		if(btnText.indexOf("选中")>=0){
			iconHtml = '<i class="fa-mouse-pointer"></i> ';
		}
		if(btnText.indexOf("刷新")>=0){
			iconHtml = '<i class="fa-refresh"></i> ';
		}
		if(btnText.indexOf("回退")>=0){
			iconHtml = '<i class="fa-arrow-left"></i> ';
		}
		if(btnText.indexOf("前进")>=0){
			iconHtml = '<i class="fa-arrow-right"></i> ';
		}
		if(btnText.indexOf("返回")>=0){
			iconHtml = '<i class="fa-mail-reply"></i> ';
		}
		if(btnText.indexOf("上一步")>=0){
			iconHtml = '<i class="fa-arrow-left"></i> ';
		}
		if(btnText.indexOf("下一步")>=0){
			iconHtml = '<i class="fa-arrow-right"></i> ';
		}
		if(btnText.indexOf("复制")>=0){
			iconHtml = '<i class="fa-clone"></i> ';
		}
		if(btnText.indexOf("选择")>=0){
			iconHtml = '<i class="fa-mouse-pointer"></i> ';
		}
		if(btnText.indexOf("签名")>=0){
			iconHtml = '<i class="fa-pencil"></i> ';
		}
		if(btnText.indexOf("生成")>=0){
			iconHtml = '<i class="fa-retweet"></i> ';
		}
		if(btnText.indexOf("说明")>=0){
			iconHtml = '<i class="fa-file-text-o"></i> ';
		}
		if(btnText.indexOf("重选")>=0){
			iconHtml = '<i class="fa-mouse-pointer"></i> ';
		}
		if(btnText.indexOf("重选")>=0){
			iconHtml = '<i class="fa-recycle"></i> ';
		}
		if(btnText.indexOf("启用")>=0){
			iconHtml = '<i class="fa-repeat"></i> ';
		}
		if(btnText.indexOf("作废")>=0){
			iconHtml = '<i class="fa-ban"></i> ';
		}
		if(btnText.indexOf("维护")>=0){
			iconHtml = '<i class="fa-wrench"></i> ';
		}
		if(btnText.indexOf("默认")>=0){
			iconHtml = '<i class="fa-check-square"></i> ';
		}
		if(btnText.indexOf("意见")>=0){
			iconHtml = '<i class="fa-comments-o"></i> ';
		}
		if(btnText.indexOf("详细")>=0){
			iconHtml = '<i class="fa-file-text-o"></i> ';
		}
		if(btnText.indexOf("说明")>=0){
			iconHtml = '<i class="fa-file-text-o"></i> ';
		}
		if(btnText.indexOf("录入")>=0){
			iconHtml = '<i class="fa-pencil"></i> ';
		}
		if(btnText.indexOf("列表")>=0){
			iconHtml = '<i class="fa-list"></i> ';
		}
		if(btnText.indexOf("参数")>=0){
			iconHtml = '<i class="fa-database"></i> ';
		}
		if(btnText.indexOf("信息")>=0){
			iconHtml = '<i class="fa-file-text-o"></i> ';
		}
		if(btnText.indexOf("检测")>=0){
			iconHtml = '<i class="fa-cogs"></i> ';
		}
		if(btnText.indexOf("确定")>=0){
			iconHtml = '<i class="fa-check"></i> ';
		}
		if(btnText.indexOf("确认")>=0){
			iconHtml = '<i class="fa-check"></i> ';
		}
		if(btnText.indexOf("取消")>=0){
			iconHtml = '<i class="fa-ban"></i> ';
		}
		if(btnText.indexOf("运行")>=0){
			iconHtml = '<i class="fa-play"></i> ';
		}
		if(btnText.indexOf("保存")>=0){
			iconHtml = '<i class="fa-save"></i> ';
		}
		if(btnText.indexOf("统计")>=0){
			iconHtml = '<i class="fa-bar-chart"></i> ';
		}
		if(btnText.indexOf("支付")>=0){
			iconHtml = '<i class="fa-rmb"></i> ';
		}

	}else{
		if(btnConfig.iconCls!=""){
			iconHtml = '<i class="'+btnConfig.iconCls+'"></i> ';
		}
	}
	switch(btnConfig.text){
		case "添加附件":
			iconHtml = '<i class="fa-upload"></i> ';
			break;
		case "合同正文":
			iconHtml = '<i class="fa-file-text-o"></i> ';
			break;
	}
	//强制使用的ICON和按钮色彩
	switch(btnConfig.text){
		case "修改":
			btnClass = 'btn btn-info';
			iconHtml = '<i class="fa-edit"></i> ';
			break;
		case "作废":
		case "删除":
			btnClass = 'btn btn-warning';
			iconHtml = '<i class="fa-trash"></i> ';
			break;
		case "保存新增":
		case "保存":
			btnClass = 'btn btn-success';
			iconHtml = '<i class="fa-save"></i> ';
			break;
		case "提交":
			btnClass = 'btn btn-info';
			iconHtml = '<i class="fa-cloud-upload"></i> ';
			break;
		case "批准":
		case "记账":
		case "支付":
			btnClass = 'btn btn-info';
			iconHtml = '<i class="fa-check"></i> ';
			break;
		case "撤销":
			btnClass = 'btn btn-warning';
			iconHtml = '<i class="fa-rotate-left"></i> ';
			break;
		case "取消":
		case "作废":
		case "清除":
			btnClass = 'btn btn-white';
			iconHtml = '<i class="fa-ban"></i> ';
			break;
		case "新增":
		case "新建":
		case "添加":
			btnClass = 'btn btn-success';
			iconHtml = '<i class="fa-plus"></i> ';
			break;
		case "编辑":
			btnClass = 'btn btn-info';
			iconHtml = '<i class="fa-edit"></i> ';
			break;
		case "复制":
			btnClass = 'btn btn-info';
			iconHtml = '<i class="fa-copy"></i> ';
			break;
		case "搜索":
			btnClass = 'btn btn-info';
			iconHtml = '<i class="fa-search"></i> ';
			break;
		case "查看":
			btnClass = 'btn btn-info';
			iconHtml = '<i class="fa-eye"></i> ';
			break;
		case "打开":
			btnClass = 'btn btn-info';
			iconHtml = '<i class="fa-folder-open"></i>';
			break;
		case "查询":
			btnClass = 'btn btn-info';
			iconHtml = '<i class="fa-search"></i>';
			break;
		case "项目选择":
			btnClass = 'btn btn-info';
			iconHtml = '<i class="fa-tags"></i>';
			break;
	}
	
	
	iconHtml = isShowIconBln?iconHtml:'';
	textHtml = isShowTextBln?'<span>'+btnConfig.text+'</span>':'';
	var btnHtml = '';
	var btnSelectHtml = '';
	if(btnConfig.configShow==false&&typeof(btnConfig.configShow)=='boolean'){
		btnClass = btnClass+' hidden';
	}
	if(source=='table'&&isShowIcon==true&&isShowText==false){
		btnClass = btnClass+'  btn-icon';
	}
	var btnDisabled = '';
	if(typeof(btnConfig.disabled)!='undefined'){btnDisabled = btnConfig.disabled}
	if(btnConfig.subdata){
		btnSelectHtml = '<ul class="dropdown-menu" role="menu">';
		var btnHandlerGroup = '';
		var btnFunctionID = '';
		for(var childBtn in btnConfig.subdata){
			if(typeof(btnConfig.subdata[childBtn].handler)=='function'){
				btnHandlerGroup = '';
				btnFunctionID = ' fid="'+btnGroupIndex+'"';
			}else{
				btnFunctionID = '';
				if(btnConfig.subdata[childBtn].handler.indexOf("(")>-1){
					if(btnConfig.subdata[childBtn].handler.indexOf("'")>-1){
						btnHandlerGroup = ' onclick="'+btnConfig.subdata[childBtn].handler+';"';
					}else{
						btnHandlerGroup = " onclick='"+btnConfig.subdata[childBtn].handler+";'";
					}
				}else{
					btnHandlerGroup = ' onclick="'+btnConfig.subdata[childBtn].handler+'(this);"';
				}
			}
			btnGroupIndex++;
			btnSelectHtml += '<li '+btnFunctionID+isReturn+'>'
						  +'<a href="javascript:void(0);" '+btnHandlerGroup+btnFunctionID+isReturn+'>'
						  +btnConfig.subdata[childBtn].text
						  +'</a>'
						  +'</li>';
		}
		btnSelectHtml +='</ul>';
		btnHtml = '<div class="btn-group">'
					+'<button type="button" class="'+btnClass+' dropdown-toggle" data-toggle="dropdown">'
					+btnConfig.text
					+'<span class="caret"></span>'
					+'</button>'
					+btnSelectHtml;
	}else if(btnConfig.html){
		//下拉按钮
		btnHtml = '<div class="btn-group">'
					+'<button type="button" class="'+btnClass+' dropdown-toggle" data-toggle="dropdown">'
					+btnConfig.text
					+'<span class="caret"></span>'
					+'</button>'
					+btnConfig.html;
	}else{
		//普通按钮
		if(btnConfig.isOnlyIcon){
			//图标按钮
			btnClass += ' btn-icon'
			btnHtml = '<button type="button" class="'+btnClass+'" '+btnDisabled+' '+btnHandler+functionID+isReturn+columnID+'>'
					+iconHtml+'</button>';
		}else{
			//图文按钮
			btnHtml = '<button type="button" class="'+btnClass+'" '+btnDisabled+' '+btnHandler+functionID+isReturn+columnID+'>'
					+iconHtml+textHtml+'</button>';
		}
	}
	return btnHtml;
}