/********************************************************************
 * CRM时间轴开始
 * 
 */
// nsUI.logTimeLine是时间轴基本数据对象
// templete是模板
// data是数据
// config是配置参数
// refreshArgObj刷新参数对象
// $container加上~
//服务器加是否显示评论的字段，模板加一个是否显示评论按钮字段，不显示出一个下拉箭头
nsUI.logTimeline = {
	templete:[],
	data:[],
	config:{},
	refreshArgObj:{},
	templeteState:false,
	dataState:false
};
//初始化配置，传入配置参数
nsUI.logTimeline.initConfig = function(config) {
	//config.id 			//标签id
	//config.isShowComment	//是否展开评论面板
	//config.field:{		//数据源字段
	// 		idField: 'id',		
	// 		typeField: 'type',
	// 		timeField: 'time',
	// 		user_idField: 'user_id',
	// 		user_nameField: 'user_name',
	// 		user_imgField: 'user_img',
	// 		custom_idField: 'custom_id',
	// 		custom_nameField: 'custom_name',
	// 		operation_source_idField: 'operation_source_id',
	// 		operation_source_nameField: 'operation_source_name',
	// 		operation_source_typeField: 'operation_source_type',
	// 		operation_nameField: 'operation_name',
	// 		operation_valueField: 'operation_value',
	// 		operation_templete_idField: 'operation_templete_id',
	// 		permit_commentField: 'permit_comment',
	// 		contentField: 'content',
	// 		contact_typeField: 'contact_type',
	// 		commentField: 'comment',
	// 		comment_idField: 'comment_id',	
	// 		comment_user_idField: 'comment_user_id',
	// 		comment_user_nameField: 'comment_user_name',
	// 		comment_user_imgField: 'comment_user_img',
	// 		comment_valueField: 'comment_value',	
	// 		comment_timeField: 'comment_time'
	// 	},
	//config.data:{基础数据
	// 	url请求路径
	// 	type类型
	// 	data参数对象{键:nsUI.logTimeline.check}
	// 	dataSrc数据头
	// }
	//config.templete:{模板数据
	// 	url请求路径
	// 	type类型
	// 	data参数对象
	// 	dataSrc数据头
	// }
	//config.commentSend:{评论发送
	// 	url请求路径
	// 	type类型
	// 	data参数对象{键:nsUI.logTimeline.inputValue}
	// 	dataSrc数据头
	// }
	//config.commentDelete:{评论删除
	// 	url请求路径
	// 	type类型
	// 	data参数对象
	// 	dataSrc数据头
	// }


	var config = config;
	//做debugger验证
	if(debugerMode){
		var configOptions = [
			['id','string',true], 				//容器id
			['isShowComment','boolean'], 		//是否展开评论面板
			['field','object',true],  			//数据ajax
			['data','object',true],  			//数据ajax
			['templete','object',true], 		//模板ajax
			['commentSend','object',true], 		//发送评论ajax
			['commentDelete','object',true], 	//删除评论ajax
		]
		nsDebuger.validOptions(configOptions, config);
		//四个ajax对象分别验证
		var validOptionsArray = [config.data, config.templete, config.commentSend, config.commentDelete]
		for(var vI = 0; vI<validOptionsArray.length; vI++){
			var optionsArr = [
				['url','string',true],  		//controllerURL
				['type','string'], 				//类型
				['data','object'], 				//数据
				['dataSrc','string'], 			//数据头
			]
			nsDebuger.validOptions(optionsArr,validOptionsArray[vI]);
		}
		//数据源字段验证
		var fieldObj = config.field;
		var field;
		for(field in fieldObj){
			var optionsArr = [
				[field,'string',true],  		//字段
			]
			nsDebuger.validOptions(optionsArr,fieldObj);
		}
	}
	// 设置默认值setDefault 复制到config中留用
	nsUI.logTimeline.config = nsUI.logTimeline.setDefault(config);
}
// 设置默认值
nsUI.logTimeline.setDefault = function(config) {
	//设置默认值
	var config = config;
	config.isShowComment = config.isShowComment ? config.isShowComment : false;
	var configArray = ['data', 'templete', 'commentSend', 'commentDelete'];
	for (var i = 0; i < configArray.length; i++) {
		//将属性值赋给arg
		var arg = configArray[i];
		config[arg].type = config[arg].type ? config[arg].type : 'GET';
		config[arg].dataSrc = config[arg].dataSrc ? config[arg].dataSrc : 'rows';	
		config[arg].data = config[arg].data ? config[arg].data : {};
	}
	// 定义字段默认值
	var fieldDefaultObj = {
			idField: 'id',	
			typeField: 'type',
			timeField: 'time',
			user_idField: 'user_id',
			user_nameField: 'user_name',
			user_imgField: 'user_img',
			custom_idField: 'custom_id',
			custom_nameField: 'custom_name',
			operation_source_idField: 'operation_source_id',
			operation_source_nameField: 'operation_source_name',
			operation_source_typeField: 'operation_source_type',
			operation_nameField: 'operation_name',
			operation_valueField: 'operation_value',
			operation_templete_idField: 'operation_templete_id',
			permit_commentField: 'permit_comment',
			contentField: 'content',
			contact_typeField: 'contact_type',
			commentField: 'comment',
			comment_idField: 'comment_id',	
			comment_user_idField: 'comment_user_id',
			comment_user_nameField: 'comment_user_name',
			comment_user_imgField: 'comment_user_img',
			comment_valueField: 'comment_value',	
			comment_timeField: 'comment_time'
		}
		// 定义循环变量
		var field;
		for(field in config.field) {
			// 设置默认值
			config.field[field] = config.field[field] ? config.field[field] : fieldDefaultObj[field];
		}
	return config;
}
// ajax获取模板
nsUI.logTimeline.templeteAjax = function() {
	// 返回模板数据
	var templeteConfig = nsUI.logTimeline.config.templete;
	// nsUI.logTimeline.templete = res;
	if(templeteConfig.url){
 		//如果存在ajax请求链接
 		var ajaxJson = {
 			url:templeteConfig.url,
 			type:templeteConfig.type,
 			data:templeteConfig.data,
 			dataSrc:templeteConfig.dataSrc
 		}
 		nsVals.ajax(ajaxJson,function(data){
 			var rowsData = data[ajaxJson.dataSrc];
 			nsUI.logTimeline.templete = rowsData;
 			nsUI.logTimeline.templeteState = true;
 			// ajax回调函数
 			nsUI.logTimeline.ajaxCallback(0);
		});
 	}else{
 		nsalert('模板URL参数错误','error');
 		console.log(templeteConfig);
 		return false;
 	}
}
// ajax获取真实数据 flag参数决定刷新日志还是刷新评论,permitState参数是否允许评论
nsUI.logTimeline.dataAjax = function(flag, index, permitState) {
	// 返回真实数据
	var dataConfig = nsUI.logTimeline.config.data;
	// nsUI.logTimeline.data = res;
	if(dataConfig.url){
 		//如果存在ajax请求链接
 		var ajaxJson = {
 			url:dataConfig.url,
 			type:dataConfig.type,
 			data:nsUI.logTimeline.refreshArgObj,
 			dataSrc:dataConfig.dataSrc
 		}
 		nsVals.ajax(ajaxJson, function(data){
 			console.log(ajaxJson);
 			var rowsData = data[ajaxJson.dataSrc];
 			nsUI.logTimeline.data = rowsData;
 			nsUI.logTimeline.dataState = true;
 			// ajax回调函数
 			nsUI.logTimeline.ajaxCallback(flag, index, permitState);
		});
 	}else{
 		nsalert('数据源URL参数错误');
 		console.error(dataConfig);
 		return false;
 	}
}
// ajax回调函数	flag参数决定刷新日志还是刷新评论,permitState参数是否允许评论
nsUI.logTimeline.ajaxCallback = function(flag, index, permitState) {
	// 根据两个ajax的完成状态来确定是否真正获取到了值
	// 获取到再真正初始化页面
	var templeteState = nsUI.logTimeline.templeteState;
	var dataState = nsUI.logTimeline.dataState;
	if (templeteState && dataState) {
		// flag: 	0刷新日志列表	1刷新评论按钮
		if(flag == 0){
			nsUI.logTimeline.initList();
			nsUI.logTimeline.initCommentList();
		}else if(flag == 1){
			// 执行initCommentListSingle方法重新拼接时间轴
			nsUI.logTimeline.initCommentListSingle(index, permitState);
		}
		// nsUI.logTimeline.dataState = false;
	}
}
// 初始化
nsUI.logTimeline.init = function(config) {
	//初始化数据获取状态为false
	nsUI.logTimeline.templeteState = false;
	nsUI.logTimeline.dataState = false;
	//初始化配置initConfig
	nsUI.logTimeline.initConfig(config);
	//初始化容器initContainer
	nsUI.logTimeline.initContainer(config);
	//执行两个ajax,在回调中处理初始化列表
	nsUI.logTimeline.templeteAjax();
	nsUI.logTimeline.dataAjax(0);
}
//初始化容器
nsUI.logTimeline.initContainer = function() {
	var html = '';
	//初始化div容器
	html = 	'<div class="timeline-log timeline-log-panel" id="logTimeline-' + nsUI.logTimeline.config.id + '">'
				// +'<div class="list-container"><div>'
			+'</div>'
			// '<div id="logTimeline-' + nsUI.logTimeline.config.id + '">'
			// +'<span>'+ nsUI.logTimeline.config.head.title + '</span>'
			// +'<input type="checkbox" style="display:block" onclick="nsUI.logTimeline.nav()">'+nsUI.logTimeline.config.head.checkboxName+'</input>'
			// +'<button id="logTimelineNav" onclick="nsUI.logTimeline.dialog()">' +nsUI.logTimeline.config.head.navName + '</button>'
			// +'<div id="logTimeline-list"><div>'
			// +'</div>'
	//返回容器框架
	var config = nsUI.logTimeline.config;
	config.$container = $('#' + nsUI.logTimeline.config.id);
	config.$container.html(html);
	config.$listContainer = $('#logTimeline-' + nsUI.logTimeline.config.id);
	// return html
}
//初始化列表
nsUI.logTimeline.initList = function() {
	//获取列表数据
	//初始化列表initList,错误处理，数据不全处理
	var html = '';
	if(nsUI.logTimeline.data.length > 0) {
		//for循环，模板匹配选择，拼接列表
		var field = nsUI.logTimeline.config.field;
		var data = nsUI.logTimeline.data;
		var templete = nsUI.logTimeline.templete;
		for (var listI = 0; listI < data.length; listI++) {
			//当前数据
			var currentData = data[listI];
			//接触方式
			var contactType = '';
			if (currentData[field.contact_typeField]) {
				contactType =  '<div class="type">'
									+'<span>'+ currentData[field.contact_typeField] +'</span>'
							   +'</div>';
			}
			// 模板代码段
			var templeteMatch = nsUI.logTimeline.templeteMatch(currentData, listI).templeteMatch;
			// 时间轴上图标
			var iconChoosen = nsUI.logTimeline.templeteMatch(currentData, listI).iconChoosen;
			//正文不是undefined的加正文
			var content = ''
			if(typeof(currentData[field.contentField]) != 'undefined'){
				content = '<div class="card-block">'+ currentData[field.contentField] + '</div>'
			}
			//时间轴时间
			var timelineTime = '';
			if(listI == 0){timelineTime = '<div class="date">'+nsUI.timeDisplay(currentData[field.timeField]).showTime+'</div>'}
			if(0 < listI && listI < data.length) {
				// 当前item日期与上一个item日期相同,则不显示时间
				var thisTime = nsUI.timeDisplay(currentData[field.timeField]).showTime;
				var lastTime = nsUI.timeDisplay(data[listI - 1][field.timeField]).showTime;
				if(thisTime == lastTime){
					timelineTime = ''
				}else{
					timelineTime = '<div class="date">'+nsUI.timeDisplay(currentData[field.timeField]).showTime+'</div>'
				}
			}
			// 列表拼接
			html += timelineTime
					+'<div id="logTimeline-list-' + listI + '" class="timeline-log-panel-item">'
						+'<div class="timeline-log-panel-item-mark">'
							// 图标标记需要判断处理
							+iconChoosen
							// +'<i class="fa fa-heart"></i>'
						+'</div>'
						+'<div class="card">'
							+'<div class="card-header">'
								+'<div class="user-photo">'
									+'<img src="' + currentData[field.user_imgField] + '" alt="" />'
								+'</div>'
								+'<div class="user-name">' + currentData[field.user_nameField] + '</div>'
								+ contactType
								+'<div class="card-header-after">' + nsUI.timeDisplay(currentData[field.timeField]).timeDetail + '</div>'
							+'</div>'
							+ content
							+'<div class="card-footer">'
								+ templeteMatch
							+'</div>'
							+'<div id="logTimeline-commentList-'+listI+'" class="timeline-log-reply hidden"></div>'
						+'</div>'
					+'</div>'
		}
	} else if(nsUI.logTimeline.data.length == 0){
		// 没有数据
		// 缺东西
		html = '<div class="timeline-log-panel-item">您还没有操作日志！</div>';
	}
	var config = nsUI.logTimeline.config;
	config.$listContainer.html(html);
	//返回列表html
}
//模板替换方法
nsUI.logTimeline.templeteMatch = function(currentData, index) {
	// 图标替换
	var iconChoosen = '';
	var field = nsUI.logTimeline.config.field;
	//存储模板
	var templete = nsUI.logTimeline.templete;
	//预存返回的模板匹配html
	var templeteMatch = '';
	var source = '';
	//来源类型
	var sourceType = currentData[field.operation_source_typeField];
	//接触类型
	var contactType = currentData[field.contact_typeField];
	var strArray = currentData[field.operation_valueField].split(',');
	//用currentData中的模板id匹配模板，做替换
	for (var tempI = 0; tempI < templete.length; tempI++) {
		//当前模板
		var currentTemplete = templete[tempI];
		if (currentTemplete.id == currentData[field.operation_templete_idField]) {
			// 评论按钮
			var commentBtn = '';
			//评论按钮状态是不是true，是的话加评论功能
			if(currentTemplete.comment_btn) {
				//允许评论状态
				var permitState = currentData[field.permit_commentField];
				// 评论按钮
				commentBtn = nsUI.logTimeline.initCommentBtn(index, permitState);
			}
			source = currentTemplete.source[sourceType];
			//来源字段替换
			source = source.replace(/{source_name}/g, currentData[field.operation_source_nameField])
					.replace(/{source_id}/g, currentData[field.operation_source_idField])
			templeteMatch = currentTemplete.templete;
			//模板字段替换
			templeteMatch = templeteMatch.replace(/{source}/g, source)
							.replace(/{name}/g, currentData[field.operation_nameField]);
			for(strArrayI = 0; strArrayI<strArray.length; strArrayI++){
				// var valueRep  = new RegExp('value'+strArrayI, 'g');
				var valueRep  = new RegExp('{value'+strArrayI+'}','g');
				//若模板中timeTranslate有值，进行时间转换
				if(currentTemplete.timeTranslate){
					templeteMatch = templeteMatch.replace(valueRep, moment(strArray[strArrayI]).format('YYYY-MM-DD HH:mm')); 
				} else {
					templeteMatch = templeteMatch.replace(valueRep, strArray[strArrayI]);
				}
			}
			//模板拼接
			templeteMatch = '<div class="card-footer-before"><div class="card-footer-text">' + templeteMatch + '</div></div>' + commentBtn
			//图标匹配
			iconChoosen = currentTemplete.icon[contactType];
			iconChoosen = '<i class="fa fa-' + iconChoosen + '"></i>'
		}
	}
	return {
		templeteMatch: templeteMatch,
		iconChoosen: iconChoosen
	};
}
// 初始化评论容器 permitState参数是否允许评论
nsUI.logTimeline.initCommentBtn = function(index, permitState) {
	// 初始化评论框架
	var field = nsUI.logTimeline.config.field;
	var html = '';
	html = '<div class="card-footer-after">'
				+'<a id="logTimeline-Btn-' + index + '" ns-Index="' + index +'" onclick="nsUI.logTimeline.commentPanelFunc('+index+','+permitState+')" class="btn btn-white"> <i class="fa fa fa-comment-o"></i>'
					+'评论(' + nsUI.logTimeline.data[index][field.commentField].length + ')'
				+'</a>'
			+'</div>'
	// 返回html
	return html;
}
//初始化全部评论
nsUI.logTimeline.initCommentList = function(){
	var field = nsUI.logTimeline.config.field;
	var data = nsUI.logTimeline.data;
	for (var index = 0; index < data.length; index++) {
		if(typeof(data[index][field.commentField]) != 'undefined') {
			var html = '';
			var currentData = data[index];
			var currentComment = currentData[field.commentField];
			// permitState参数是否允许评论
			var permitState = currentData[field.permit_commentField];
			html = nsUI.logTimeline.initComment(index, currentComment, permitState);
			$('#logTimeline-commentList-' + index).html(html);
			// 当前展开状态
			var isShowComment = nsUI.logTimeline.config.isShowComment;
			if (isShowComment) {
				$('#logTimeline-commentList-'+index).removeClass('hidden');
			} else {
				$('#logTimeline-commentList-'+index).addClass('hidden');
			}
		}
	}
}
//初始化单条评论 permitState参数是否允许评论
nsUI.logTimeline.initCommentListSingle = function(index, permitState) {
	var field = nsUI.logTimeline.config.field;
	//获取评论列表数据
	var currentComment = nsUI.logTimeline.data[index][field.commentField];
	var html = '';
	html = nsUI.logTimeline.initComment(index, currentComment, permitState);
	//返回评论html
	$('#logTimeline-commentList-'+index).html(html);
}
//单日志和多日志拼接评论公共方法
nsUI.logTimeline.initComment = function(index, currentComment, permitState) {
	var field = nsUI.logTimeline.config.field;
	var html = '';
	if(currentComment.length > 0) {
		//for循环拼接评论代码
		for (var i = 0; i < currentComment.length; i++) {
			var comment = currentComment[i];
			//删除html代码
			var deleteHtml = '';
			//不允许评论则不可删除
			if (permitState) {
				deleteHtml = '<div class="card-footer">'
								+'<div class="card-footer-after">'
									+'<a id="commentDelete-'+i+'" class="btn btn-icon btn-white" onclick="nsUI.logTimeline.commentDelete('+index+','+i+','+permitState+')">'
										+'<i class="fa fa-trash"></i>'
									+'</a>'
								+'</div>'
							+'</div>'
			}
			html += '<div class="card">'
						+'<div class="card-header">'
							+'<div class="user-photo">'
								+'<img src="'+ comment[field.comment_user_imgField] +'" alt="" />'
							+'</div>'
							+'<div class="user-name">'+ comment[field.comment_user_nameField] +'</div>'
							+'<div class="card-header-after">'+ nsUI.timeDisplay(comment[field.comment_timeField]).timeDetail +'</div>'
						+'</div>'
						+'<div class="card-block">'+comment[field.comment_valueField]+'</div>'
						+ deleteHtml
					+'</div>'
		}
	} else if (currentComment.length == 0) {
		html = '<div class="card">'
					+'<div class="card-header">'
						+ '暂无评论!'
					+'</div>'
				+'</div>'
	}
	// 如果允许评论,追加输入框和评论按钮
	if (permitState) {
		html += '<div class="form-group">'
				+'<div class="input-group">'
					+'<input id="commentInput-'+index+'" type="text" class="form-control" placeholder="请输入要评论的内容..." />'
					+'<div class="input-group-btn">'
						+'<button class="btn" type="button" onclick="nsUI.logTimeline.commentSend('+index+','+permitState+')">评论</button>'
					+'</div>'
				+'</div>'
			+'</div>'
	}
	return html;
}
// 刷新列表
nsUI.logTimeline.refreshList = function(object) {
	if(object){
		nsUI.logTimeline.refreshArgObj = object;
	}
	// 调用dataAjax重新获取数据
	// 先初始化数据ajax请求完成状态为false
	nsUI.logTimeline.dataState = false;
	// 回调中刷新列表数据,传0刷新日志列表
	nsUI.logTimeline.dataAjax(0);
}
// 刷新评论 permitState参数是否允许评论
nsUI.logTimeline.refreshComment = function(index, permitState) {
	// 调用dataAjax重新获取数据
	// 先初始化数据ajax请求完成状态为false
	nsUI.logTimeline.dataState = false;
	// 回调中刷新列表数据,传1刷新评论列表
	nsUI.logTimeline.dataAjax(1, index, permitState);
}
// 评论面板展开合拢 permitState参数是否允许评论
nsUI.logTimeline.commentPanelFunc = function(index, permitState) { 
	// 点击切换展开合拢
	$('#logTimeline-commentList-'+index).toggleClass('hidden');
}
// 评论发送
nsUI.logTimeline.commentSend = function(index, permitState) {
	//输入框输入值
	var inputValue = $('#commentInput-' + index).val();
	//需传出的参数键值对获取
	var data = nsUI.logTimeline.data[index];
	var config = nsUI.logTimeline.config;
	var idField = config.field.idField;
	var commentValue = config.field.comment_valueField;
	var obj = {};
	obj[idField] = data[idField];
	obj[commentValue] = inputValue;
	// 点击评论发送，根据inputvalue判断是否调用ajax传值
	if (inputValue) {
		var ajaxJson = {
			url:nsUI.logTimeline.config.commentSend.url,
			type:nsUI.logTimeline.config.commentSend.type,
			data:obj,
			dataSrc:nsUI.logTimeline.config.commentSend.dataSrc
		}
		nsVals.ajax(ajaxJson,function(data){
			console.log(ajaxJson);
			nsalert('发送成功！');
			// 清空输入框内容
			$('#commentInput-' + index).val('');
			// 刷新评论
			nsUI.logTimeline.refreshComment(index, permitState);
		});
	}else{
		nsalert('不能发送空消息', 'error');
	}
	
}
// 评论删除按钮显示隐藏
// nsUI.logTimeline.commentDeleteShow = function(index, i) { 
// 	// 点击小箭头切换显示删除按钮
// 	if(nsUI.logTimeline.data[index].comment[i].showDelete) {
// 		nsUI.logTimeline.data[index].comment[i].showDelete = false;
// 		$('#commentDelete-' + i).addClass('hidden');
// 	} else {
// 		nsUI.logTimeline.data[index].comment[i].showDelete = true;
// 		$('#commentDelete-' + i).removeClass('hidden');
// 	}
// }
//评论删除
nsUI.logTimeline.commentDelete = function(index, i, permitState) {
	// 点击删除调用ajax传值
	var field = nsUI.logTimeline.config.field;
	var currentComment = nsUI.logTimeline.data[index][field.commentField][i];
	var comment_idField = nsUI.logTimeline.config.field.comment_idField;
	var obj = {};
	//将页面定义好的参数键值对加入参数对象中
	obj[field.idField] = nsUI.logTimeline.data[index][field.idField];//数据源列表id键值对
	obj[field.comment_idField] = currentComment[field.comment_idField];//评论列表id键值对
	var ajaxJson = {
		url:nsUI.logTimeline.config.commentDelete.url,
		type:nsUI.logTimeline.config.commentDelete.type,
		data:obj,
		dataSrc:nsUI.logTimeline.config.commentDelete.dataSrc
	}
	nsVals.ajax(ajaxJson,function(data){
		// 刷新评论
		console.log(ajaxJson);
		nsalert('删除成功！');
		nsUI.logTimeline.refreshComment(index, permitState);
	});
}
//框架按钮点击事件
// nsUI.logTimeline.nav = function() {
// 	// jquery切换勾选状态
// 	if(nsUI.logTimeline.check) {
// 		nsUI.logTimeline.check = false;
// 		$('#logTimeline-' + nsUI.logTimeline.config.id).removeClass('checked');
// 	} else {
// 		nsUI.logTimeline.check = true;
// 		$('#logTimeline-' + nsUI.logTimeline.config.id).addClass('checked');
// 	}
// 	// 调用列表刷新
// 	nsUI.logTimeline.refreshList();
// }
// 写跟进弹窗
// nsUI.logTimeline.dialog = function() {
// 	console.log('111')
// }
/********************************************************************
 * CRM时间轴结束
 */
// 		数据，代码，动作 三步执行。