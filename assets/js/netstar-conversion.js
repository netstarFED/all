/**
*数据二次转换
*/
var nsConversion = (function(){
	var nstemplate = {
		screenWidth:$(window).width(),    //屏幕宽
		screenHeight:$(window).height(),	//屏幕高
		menuWidth:240,  //菜单宽
		paddingTwo:30,	//内容显示区域外边距
		labelWidth:100,	//标题栏宽度
		scrollbar:17,	//滚动条看度
		tableDefWidth :30, //表格字段列默认宽度
		tableMinWidth :20,//表格字段列最小宽度
		tableMaxWidth: 150,//表格字段列最大宽度
		fieldConfig:{}		//字段配置
	};
	// function init(data){
	// 	for(di in data.CRMnscrm){
	// 			//table和form字段数据
	// 			if(data.CRMnscrm[di]['field']){
	// 				nstemplate.fieldConfig[di] = {};
	// 				nstemplate.fieldConfig[di] = initField(di,data.CRMnscrm[di].field);
	// 			};
	// 		}
	// 		//return nstemplate;
	// }



	/*
	*初始化表单和表格字段
	*/
	function initField(key,field){
		//form表单和table表格列字段
		var fieldData = {
			formField : [],
		 	tableField :[]
		};
		for(var ci=0;ci<field.length;ci++){
			var datai = field[ci];
			var formObj=initFormData(datai);
			//测试
			//formObj.fieldlength = 11;
			if(formObj){
				fieldData.formField.push(formObj);
			}
			var tableObj=initTableData(datai);
			if(tableObj){
				fieldData.tableField.push(tableObj);
			}
		}
		var dataArr = fieldData.formField;
		if(dataArr.length > 0){
			for(var dai = 0;dai<dataArr.length;dai++){
			dataArr[dai].column=getFormFieldWidth(dataArr[dai]);
			}
		}
		return fieldData;
	}
	//计算字段列宽
	function getFormFieldWidth(datai){
		//字段长度
		var fieldlength = datai.fieldLength;
		//form表单宽度
		var formWidth = nstemplate.screenWidth - nstemplate.menuWidth - nstemplate.paddingTwo - nstemplate.scrollbar;
		//计算组件所需长度
		var fieldwidth = fieldlength*14 + nstemplate.labelWidth;
		// 栅格尺寸
		var colLength = formWidth/12;
		//向上取整  col-md-x
		var colWidth = Math.ceil(fieldwidth/colLength);
	    return colWidth;
	}
	//初始化表单配置
	function initFormData(datai){
		var componentAttrVaild = {
			text:{id:'string',rules:'string',placeholder:'string',name:'string',type:'string',label:'string',fieldLength:'number'},
			date:{id:'string',addvalue:'object',name:'string',type:'string',label:'string',fieldLength:'number'},
			select:{id:'string',filltag:'boolean',rules:'string',type:'string',label:'string',fieldLength:'number',textField:'string',valueField:'string',subdata:'array',isCloseSearch:'number',name:'string'},
			provinceselect:{id:'string',name:'string',type:'string',label:'string',fieldLength:'number'},
			textarea:{id:'string',name:'string',type:'string',label:'string',fieldLength:'number'}
		}
		var obj = {};
		for(ty in componentAttrVaild){
			if(datai.type == ty){
				var configiVaild = componentAttrVaild[ty];
				var newObj = {};
				for(cv in configiVaild){
					if(typeof(datai[cv]) == configiVaild[cv] || typeof(datai[cv]) == 'function'){
						obj[cv] = datai[cv];
					}else{
						if(datai[cv]){
							switch(configiVaild[cv]){
							case 'string':
								//newObj[cv] = datai[cv].toString();
								console.warn( cv + '的值：'+datai[cv] + '类型错误，当前类型为' + typeof(datai[cv]) +'，应当是'+configiVaild[cv]);
								break;
							case 'number':
								console.warn( cv + '的值：'+datai[cv] + '类型错误，当前类型为' + typeof(datai[cv]) +'，应当是'+configiVaild[cv]);
								break;
							case 'object':
								console.warn( cv + '的值：'+datai[cv] + '类型错误，当前类型为' + typeof(datai[cv]) +'，应当是'+configiVaild[cv]);
								break;
							case 'array':
							    console.warn( cv + '的值：'+datai[cv] + '类型错误，当前类型为' + typeof(datai[cv]) +'，应当是'+configiVaild[cv]);
								break;
							case 'boolean':
								console.warn( cv + '的值：'+datai[cv] + '类型错误，当前类型为' + typeof(datai[cv]) +'，应当是'+configiVaild[cv]);
								break;
							// case 'undefined':
							// 	break;
						}
						}
					}
				}
			}
		}
		return obj;
	}
	/**
	* 初始化表格配置
	*/
	function initTableData(datai){
	if(datai.id){
		var obje = {};
		for(di in datai){
			switch(di){
				case 'id':
					obje.field = datai['id'];
					break;
				case 'name':
					obje.title = typeof(datai['name']) == 'string'?datai['name']:'';
					break;
				case 'fieldlength':
				 	obje.width = getTableFieldWidth(datai['fieldlength']);
				 	break;
			}
		}
		return obje;
	}else{
		nsalert('数据不完整','error');
		//console.log(datai);
	}
	//获取表格字段宽度
	var getTableFieldWidth = function(fieldlength){
		//字段长度
		var width = 0;
		if(fieldlength){
			var fieldWidth = fieldlength*15;
			/**
			*tableMinWidth:表格字段列最小宽度
			*tableMaxWidth:表格字段列最大宽度
			*tableDefWidth:表格字段列默认宽度
			*/
			if(fieldWidth<=nstemplate.tableMinWidth){
				width = nstemplate.tableDefWidth
			}else if(fieldWidth > nstemplate.tableMaxWidth){
				width = nstemplate.tableMaxWidth
			}else{
				width = fieldWidth;
			}
			return width;
		}else{
			width = undefined;
		}
	}
	}
	//return initField;
	return {
		initField:initField,
		//init:init,
		nstemplate:nstemplate
	}

})(jQuery)





