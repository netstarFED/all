nsUI.formPlate = {
	config:{}
}
//初始化
nsUI.formPlate.init = function (config) {
	//验证和赋默认值
	nsUI.formPlate.verification(config);
	//表单的话直接请求ajax
	if (config.manner == 'form') {
		//ajax请求数据初始化页面
		nsUI.formPlate.formAjax();
	}
	//表格交由baseDataTable
	if (config.manner == 'table') {
		nsUI.formPlate.tableAjax();
	}
}
//验证
nsUI.formPlate.verification = function(config) {
	var config = config;
	if(debugerMode){
		var mannerOptions = [
			['manner','string',true],			//form还是table
		]
		nsDebuger.validOptions(mannerOptions, config);
		var baseOptions = [
			['id','string',true], 				//容器id
			['url','string',true],  			//ajax地址
			['dataSrc','string'],
			['type','string'],
			['data','string'],	
			['title','string',true],			//标题
			['showNumber','boolean'],			//显示个数
		]
		nsDebuger.validOptions(baseOptions, config);
		if (config.manner == 'table') {
			var configOptions = [
				['dataConfig','object',true], 		
				['columnConfig','array',true],  	
				['uiConfig','object',true],			
				['btnConfig','object'],		
			]
			nsDebuger.validOptions(configOptions, config);
		}
		if (config.manner == 'form') {
			var configOptions = [
				['pattern','string',true],		
			]
			nsDebuger.validOptions(configOptions, config);
		}
	}
	nsUI.formPlate.config = nsUI.formPlate.setDefault(config);
}
//设置默认值
nsUI.formPlate.setDefault = function (config) {
	var config = config;
	config.showNumber = config.showNumber ? config.showNumber : false;
	config.showBtn = config.showBtn ? config.showBtn : false;
	config.type = config.type ? config.type : 'GET';
	config.dataSrc = config.dataSrc ? config.dataSrc : 'rows';	
	config.data = config.data ? config.data : {};
	for (var formI = 0; formI < config.form.length; formI++) {
		if (config.form[formI].length) {
			for (var formII = 0; formII < config.form[formI].length; formII++) {
				config.form[formI][formII].readonly = true;
			}
		} else {
			config.form[formI].readonly = true;
		}
	}
	return config;
}
//ajax请求form数据
nsUI.formPlate.formAjax = function () {
	var config = nsUI.formPlate.config;
	//ajax请求
	var ajaxJson = {
		url:config.url,
		type:config.type,
		data:config.data,
		dataSrc:config.dataSrc
	}
	nsVals.ajax(ajaxJson, function(data){
		console.log(ajaxJson);
		var rowsData = data[ajaxJson.dataSrc];
		if(!rowsData.length){
			nsUI.formPlane.data[rowsData.id] = rowsData;
		}else{
			if(ajaxJson.data.customerId){
				nsUI.formPlate.data[ajaxJson,data.customerId].linkmanList = {};
				var currentLinkList = nsUI.formPlate.data[ajaxJson.data.customerId].linkmanList;
				for(var i = 0;i<rowsData.length;i++){
					currentLinkList[rowsData[i].id] = rowsData[i];
				}
			}
		}
		//初始化容器
		nsUI.formPlate.initContainer(config);
		//初始化标题
		nsUI.formPlane.initTitle(config,rowsData);
		//初始化form容器
		nsUI.formPlate.initFormContainer(config,rowsData);
		//初始化按钮
		if (config.btns) { 
			nsButton.initBtnsByContainerID('btn-'+config.id, config.btns);
		}
		//根据数据的长度来初始化form容器个数
		nsUI.formPlate.initFormContainer(config, rowsData);
		if (rowsData.length) {
			for (var i = 0; i < rowsData.length; i++) {
				//初始化form
				for (var keyField in rowsData[i]) {
					rowsData[i][keyField] = (rowsData[i][keyField] != null) ? rowsData[i][keyField] : '- -';
				}
				var newConfig = $.extend(true,{},config);
				newConfig.id = config.id + '-container-' + i;
				//初始化表单
				formPlane.formInit(newConfig);
				//初始化表单按钮
				if (config.formBtns) {
					nsButton.initBtnsByContainerID('btn-form-'+config.id+'-'+i, config.formBtns);
				}
				//用返回的数据填充表单
				formPlane.fillValues(rowsData[i],newConfig.id);
			}
		} else {
			//初始化form
			// for (var keyField in rowsData) {
			// 	rowsData[keyField] = (rowsData[keyField] != null) ? rowsData[keyField] : '- -';
			// }
			for(var index=0;index<config.form.length;index++){
				if(typeof(rowsData[config.form[index].id]) != "undefined"){
					config.form[index].value = rowsData[config.form[index].id];
				}else{
					config.form[index].value = rowsData[config.form[index].id];
				}
			}
			var newConfig = $.extend(true,{},config);
			newConfig.id = config.id + '-container';
			//初始化表单
			formPlane.formInit(newConfig);
			//初始化表单按钮
			if (config.formBtns) {
				nsButton.initBtnsByContainerID('btn-form-'+config.id, config.formBtns);
			}
			//用返回的数据填充表单
			// formPlane.fillValues(rowsData,newConfig.id);
		}
		// //初始化标题
		// nsUI.formPlate.initTitle(config, rowsData);
		// //初始化按钮
		// if (config.btns) { 
		// 	nsButton.initBtnsByContainerID('btn-'+config.id, config.btns);
		// }
	})
}
//ajax请求table数据
nsUI.formPlate.tableAjax = function () {
	var config = nsUI.formPlate.config;
	//ajax请求
	var ajaxJson = {
		url:config.url,
		type:config.type,
		data:config.data,
		dataSrc:config.dataSrc
	}
	nsVals.ajax(ajaxJson, function(data){
		console.log(ajaxJson);
		var rowsData = data[ajaxJson.dataSrc];
		for (var i = 0; i < rowsData.length; i++) {
			for (var keyField in rowsData[i]) {
				if(typeof(rowsData[i][keyField]) == 'string') {
					rowsData[i][keyField] = (rowsData[i][keyField] != '') ? rowsData[i][keyField] : '- -';
				}
				if(typeof(rowsData[i][keyField]) == 'number') {
					rowsData[i][keyField] = (rowsData[i][keyField] != null) ? rowsData[i][keyField] : '- -';
				}
			}
		}
		nsUI.formPlate.initContainer(config);
		//初始化标题
		nsUI.formPlate.initTitle(config, rowsData.length);
		//加标题按钮点击事件
		// $('#'+config.titleId).find('[ns-control="click"]').on('click',function(ev){
		// 	// var nsIndex = $(this).attr('ns-index');
		// 	if(typeof(config.handler)=='function'){
		// 		return config.handler(rowsData);
		// 	}
		// })
		config.dataConfig.dataSource = rowsData;
		baseDataTable.init(config.dataConfig,config.columnConfig,config.uiConfig);
		
	})
}
//初始化标题
nsUI.formPlate.initTitle = function (config, rowsData) {
	var config = config;
	var html = '';
	var numberHtml = '';
	if (config.showNumber && rowsData.length) {
		numberHtml = '（'+ rowsData.length +'）';
	}
	html = '<h6>'+ config.title + numberHtml + '</h6>';
	html += '<div class="btn-group" id="btn-'+config.id+'"></div>'
	$('#' + config.id + '-title').html(html);
}
//初始化容器
nsUI.formPlate.initContainer = function (config) {
	var config = config;
	var html = '';
	html = '<div class="form-view-title" id="'+config.id+'-title"></div>'
    if (config.manner == 'form') {
    	html += '<div id="'+config.id+'-container"></div>'
    }
    if (config.manner == 'table') {
    	html += '<table id="'+config.id+'-container"></table>'
    }
    html = '<div class="form-view" id="panel-'+config.id+'">'+html+'</div>'
	$('#' + config.id).html(html);
}
//初始化表单容器
nsUI.formPlate.initFormContainer = function (config, rowsData) {
	var html = '';
	//循环增加容器
	if (rowsData.length) {
		for (var i = 0; i < rowsData.length; i++) {
			var newConfig = $.extend(true,{},config);
			newConfig.id = config.id + '-container-' + i; 
			var htmlBase = '<div class="form-content" id="'+ newConfig.id +'"></div>';
			if (config.pattern == 'linkman') {
				html += '<div class="col-xs-6">'
							+'<div class="form-view-block">'
								+'<div class="form-view-subtitle">'
									+'<div id="btn-form-'+config.id+'-'+i+'" class="btn-group" ns-index="'+i+'" ns-control="click">'
									+'</div>'
								+'</div>'
								+ htmlBase
							+'</div>'
						+'</div>'
			} else {
				html += htmlBase;
			}
		}
	} else {
		var newConfig = $.extend(true,{},config);
		newConfig.id = config.id + '-container'; 
		var htmlBase = '<div class="form-content" id="'+ newConfig.id +'"></div>';
		if (config.pattern == 'linkman') {
			html += '<div class="col-xs-6">'
						+'<div class="form-view-block">'
							+'<div class="form-view-subtitle">'
								+'<div id="btn-form-'+config.id+'" class="btn-group">'
								+'</div>'
							+'</div>'
							+ htmlBase
						+'</div>'
					+'</div>'
		} else {
			html += htmlBase;
		}
	}
	
	$('#'+config.id+'-container').html(html);
}