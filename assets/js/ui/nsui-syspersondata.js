/********************************************************************
 * 人员选择器
 */
nsUI.personSystem = {};
nsUI.personSystem.config = {
	person:{
		data:[],
		attribute:{}
	},
	group:{
		data:[],
		attribute:{}
	}
}
//初始化加载人员和组织数据
nsUI.personSystem.init = function(config){
	nsUI.personSystem.personAjax(config.personAjax);
	nsUI.personSystem.personAttribute(config.personAjax.localDataConfig);
	nsUI.personSystem.groupAjax(config.groupAjax);
	nsUI.personSystem.config.group.attribute = config.groupAjax;
}
//人员列表数据初始化
nsUI.personSystem.personAjax = function(personAjax){
	var param = typeof(personAjax.data) == 'undefined' ?'':personAjax.data;
	var type = typeof(personAjax.type) == 'undefined' ?'POST':personAjax.type;
	$.ajax({
		url:			personAjax.url,	
		data:			param,
		type:			type,
		dataType: 		"json",
		success: function(data){
			if(data.success){
				nsUI.personSystem.config.person.data = data[personAjax.dataSrc];
			}else{
				nsAlert(language.ui.nsuisyspersondata.personAjax,'error');
			}
		},
		error:function(e){
			nsAlert(e.msg,'error');
		}
	});
}
//读取人员配置属性
nsUI.personSystem.personAttribute = function(localDataConfig){
	var columnNum = 0; 		//统计列显示列数量
	var columnTitle = [];	//存放配置中有设置显示标题的
	var columnType = [];	//存放配置中有设置显示类型的
	var columnData = [];	//拼接可显示的数组下标
	var columnWidth = [];	//存放配置中可显示标题列宽度
	var dataSearch = [];	//存放配置列中设置了允许搜索的下标
	var dataKey = [];		//拼接数组id字段
	var dataTitle = [];		//给所有的配置列添加标题
	var autoWidthColumnNum = 0   	//自动计算的列数量
	var autoWidthColumnTotal = 0	//自动计算的列宽度 百分比
	var groupIndex = -1; 	//判断该列是否是部门id
	var nameIndex = -1;  	//是不是姓名
	var idIndex = 1;		//是不是ID
	for(var col = 0; col < localDataConfig.length; col ++){
		//如果存在显示列标题，则记录下来显示列顺序下标
		if(localDataConfig[col].visible){
			columnData[localDataConfig[col].visible-1] = col;
			columnNum++;
		}
		var columnSearch = typeof(localDataConfig[col].search) == 'undefined' ?false:localDataConfig[col].search;
		if(columnSearch){
			dataSearch.push(col);
		}
		if(localDataConfig[col].key){
			dataKey.push(localDataConfig[col].key);
		}else{
			dataKey.push(-1);
		}
		if(localDataConfig[col].title){
			dataTitle.push(localDataConfig[col].title);
		}else{
			dataTitle.push('');
		}
		var isDepart = typeof(localDataConfig[col].isDepart) == 'undefined'?false:localDataConfig[col].isDepart;
		if(isDepart){
			groupIndex = col;
		}
		var isName = typeof(localDataConfig[col].isName) == 'undefined'?false:localDataConfig[col].isName;
		if(isName){
			nameIndex = col;
		}
		var isID = typeof(localDataConfig[col].isID) == 'undefined'?false:localDataConfig[col].isID;
		if(isID){
			idIndex = col;
		}
	}
	for(var colI = 0; colI < columnData.length; colI ++){
		var currentData = localDataConfig[columnData[colI]];//读取是第几列
		columnTitle.push(currentData.title);
		columnType.push(currentData.type);
		//判断当前显示列是否设置了宽度
		if(typeof(currentData.width)=='undefined'){
			autoWidthColumnNum++;
		}else if(typeof(currentData.width)=='number'){
			autoWidthColumnTotal+=currentData.width;
		}else{
			nsalert(language.ui.nsuisyspersondata.personAttributeWidth,'error');
		}
		columnWidth.push(currentData.width);
	}
	//计算列宽
	if(autoWidthColumnNum>0){
		if(autoWidthColumnTotal<=100){
			var columnWidthStr = parseInt(((100-autoWidthColumnTotal)/autoWidthColumnNum)*1000)/1000+'%';
			for(var i=0; i<columnWidth.length; i++){
				if(typeof(columnWidth[i])=='undefined'){
					columnWidth[i] = columnWidthStr;
				}else{
					columnWidth[i] = columnWidth[i]+'%';
				}
			}
		}else{
			nsalert(language.ui.nsuisyspersondata.personAttributeHundred);
		}
	}
	nsUI.personSystem.config.person.attribute = {
		columnData	:	columnData,				//显示列数据
		columnType  :	columnType, 			//显示列类型
		columnNum   :	columnNum, 				//列数量
		columnWidth :	columnWidth, 			//列宽
		columnTitle :	columnTitle, 			//标题数组

		groupIndex  :	groupIndex, 			//部门id的列下标
		nameIndex   :	nameIndex, 				//人员姓名的列下标
		idIndex     :	idIndex, 				//ID的列下标
		dataSearch  :	dataSearch,				//可以搜索的数组
		dataKey     :	dataKey, 				//key 每个数据对象都有 没有的是-1
		dataTitle   :	dataTitle, 				//标题 每个数据对象都有 没有的是''
	}
}
//组织树数据
nsUI.personSystem.groupAjax = function(groupAjax){
	var deptData = typeof(groupAjax.data) == 'undefined' ?'':groupAjax.data;
	var deptType = typeof(groupAjax.type) == 'undefined' ?'POST':groupAjax.type;
	$.ajax({
		url:			groupAjax.url,	
		data:			deptData,
		type:			deptType,
		dataType: 		"json",
		success: function(data){
			if(data.success){
				nsUI.personSystem.config.group.data = data[groupAjax.dataSrc];
			}
		}
	})
}