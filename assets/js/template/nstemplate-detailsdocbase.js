/****
***表单表格模板包含form，table,button(导航上显示的按钮)
****
********/
/******************** 表单表格模板 start ***********************/
nsTemplate.templates.detailsDocBase = (function(){
	var config = {};//当前配置参数
	var originalConfig = {};//原始配置
	var mainIdField = '';//主表id
	var mainKeyField = '';//主表vo名称
	var mainVoDataObject = {};//初始化主表vo
	var voDataArray = [];//初始化调用vo的集合
	var listDataArray = [];//初始化调用list的集合
	var filterListDataArray = [];//初始化使用过滤列表的集合
	var filterListDataObject = {};
	var currentDataObject = {};//当前数据
	var serverDataObject = {};//服务端返回数据
	var btnDataObject = {};//按钮
	var optionsConfig = {
		source:'form',
		dialogBeforeHandler:dialogBeforeHandler,
		ajaxBeforeHandler:ajaxBeforeHandler,
		ajaxAfterHandler:ajaxAfterHandler,
		loadPageHandler:loadPageHandler,
		closePageHandler:closePageHandler,
	};
	function dialogBeforeHandler(data){
		data.value = currentDataObject;
		data.btnOptionsConfig = {
			descritute:{keyField:mainKeyField,idField:mainIdField}
		}
		return data;
	}
	function ajaxBeforeHandler(handlerObj){
		handlerObj.config = config;
		handlerObj.ajaxConfigOptions = {
			idField:mainIdField,
			keyField:mainKeyField,
			pageParam:config.pageParam,
			parentObj:config.parentObj
		};
		return handlerObj;
	}
	function ajaxAfterHandler(res){}
	function loadPageHandler(data){}
	function closePageHandler(data){}
	function getContainerHtml(){
		var components = config.components;
		var contentHtml = '';
		for(var componentI=0; componentI<components.length; componentI++){
			var componentData = components[componentI];
			var containerId = componentData.type + '-'+componentI+'-'+config.id;
			var classStr = 'content-'+componentData.type;
			if(componentData.plusClass){
				//自定义了class
				classStr += ' '+componentData.plusClass;
			}
			switch(componentData.type){
				case 'vo':
					voDataArray.push({
						id:containerId,
						keyField:componentData.keyField,
						parent:componentData.parent,
						formSource:'staticData',
						form:componentData.field
					});
					contentHtml += '<div class="'+classStr+'" id="'+containerId+'"></div>';
					break;
				case 'list':
					var isFilterList = typeof(componentData.isFilterList) == 'boolean' ? componentData.isFilterList : false;
					if(isFilterList){
						//过滤列表分类
						var filterClassStr = 'filterlist-li';
						var filterFieldConfig = componentData.filterFieldConfig;
						var isShowAll = typeof(filterFieldConfig.isAll) == 'boolean' ? filterFieldConfig.isAll : true;
						var liHtml = '<li ns-key="0">全部</li>';
						var titleJson = {
							0:'全部'
						};
						$.each(filterFieldConfig.fieldObject,function(key,value){
							titleJson[key] = value.title;
							var liClassStr = value.selected ? 'active' : '';
							liHtml += '<li ns-key="'+key+'" class="'+liClassStr+'">'+value.title+'</li>';
						})
						contentHtml += '<div class="filterlist-ul"><ul id="'+containerId+'-ul" ns-containerid="'+containerId+'">'+liHtml+'</ul></div>'
										+'<div class="'+classStr+'" id="'+containerId+'"></div>';
						filterListDataArray.push({containerId:containerId,data:componentData});
						filterListDataObject[containerId] = {
							config:componentData,
							titleJson:titleJson
						};
					}else{
						contentHtml += '<div class="'+classStr+'" id="'+containerId+'"></div>';
						listDataArray.push({containerId:containerId,data:componentData});
					}
					break;
			}
		}
		var btnHtml = '';
		if($.isArray(config.btns)){
			nsTemplate.setBtnDataChargeHandler(config.btns,optionsConfig);
			var btnsArray = $.extend(true,[],config.btns);//克隆 
			btnsArray = nsTemplate.getBtnArrayByBtns(btnsArray);//得到按钮值
			btnDataObject = {
				id:'btns-'+config.id,
				isShowTitle:false,
				btns:[btnsArray]
			};
			btnHtml = '<div class="nav-form components-btn" id="btns-'+config.id+'"></div>';
		}
		var html = '<div class="template-detailsdocbase" id="'+config.id+'">'+contentHtml+btnHtml+'</div>';
		return html;
	}//得到容器html
	function containerInit(){
		var html = getContainerHtml();
		var $container = $('container');
		if($container.length > 0){
			$container = $('container:last');
		}
		$container.prepend(html);//输出面板
	}//生成html
	function btnInit(){
		if(!$.isEmptyObject(btnDataObject)){
			nsNav.init(btnDataObject);
		}
	}
	function listDataInit(){
		if(listDataArray.length > 0){
			for(var listI=0; listI<listDataArray.length; listI++){
				var listData = listDataArray[listI].data;
				var tableJson = {
					data:{
						tableId:'table-'+listDataArray[listI].containerId,
						dataSource:[],
					},
					ui:{isClose:false}
				};
				if(listData.displayMode){tableJson.ui.displayMode = listData.displayMode;}
				if(listData.idField){tableJson.data.primaryID = listData.idField;}
				nsList.init(tableJson.data,listData.field,tableJson.ui);
			}
		}
	}//单列表初始化
	function filterListDataComponentInit(index,containerId){
		var configObj = $.extend(true,{},filterListDataObject[containerId].config);
		var data = filterListDataObject[containerId].data;
		var titleJson = filterListDataObject[containerId].titleJson;
		var filterConfig = configObj.filterFieldConfig;
		var classField = filterConfig.classField;
		var fieldConfig = filterConfig.fieldObject[index];
		var tableJson = {
			data:{
				tableID:'table-'+containerId,
			},
			ui:{
				$container:$('#'+containerId),
				displayMode:configObj.displayMode,
				isClose:false,
				isSerialNumber:false,//是否自定序列号
				classConfig:{
					classField:classField,//分类id
					data:titleJson
				},
				selectMode:'none',
			}
		}
		if(fieldConfig){
			//存在field字段
			tableJson.column = fieldConfig.field;
			tableJson.data.dataSource = data[index];
			if($.isArray(fieldConfig.btns)){
				nsTemplate.setBtnDataChargeHandler(fieldConfig.btns,optionsConfig);
				var btnsArray = $.extend(true,[],fieldConfig.btns);//克隆 
				btnsArray = nsTemplate.getBtnArrayByBtns(btnsArray);//得到按钮值
				var formatButtonJson = {
					field:'nsTemplateButton',
					position:'right',
					type:'button',
					formatHandler:{
						type:'moblieButtons',
						text:'省略',
						data:{
							subdata:btnsArray
						}
					}	
				};
				//如果最后一个是按钮删除重新赋值目的为了防止重复多次添加操作
				for(var tColumnI=0; tColumnI<tableJson.column.length; tColumnI++){
					if(tableJson.column[tColumnI].field == 'nsTemplateButton'){
						tableJson.column.splice(tColumnI,1);
					}
				}
				tableJson.column.push(formatButtonJson);
			}
		}else{
			tableJson.data.dataSource = data.all;
			tableJson.column = {};
			$.each(filterConfig.fieldObject,function(key,value){
				tableJson.column[key] = value;
				if($.isArray(value.btns)){
					nsTemplate.setBtnDataChargeHandler(value.btns,optionsConfig);
					var btnsArray = $.extend(true,[],value.btns);//克隆 
					btnsArray = nsTemplate.getBtnArrayByBtns(btnsArray);//得到按钮值
					var formatButtonJson = {
						field:'nsTemplateButton',
						position:'right',
						type:'button',
						formatHandler:{
							type:'moblieButtons',
							text:'省略',
							data:{
								subdata:btnsArray
							}
						}	
					};
					//如果最后一个是按钮删除重新赋值目的为了防止重复多次添加操作
					for(var tColumnI=0; tColumnI<tableJson.column[key].field.length; tColumnI++){
						if(tableJson.column[key].field[tColumnI].field == 'nsTemplateButton'){
							tableJson.column[key].field.splice(tColumnI,1);
						}
					}
					tableJson.column[key].field.push(formatButtonJson);
				}
			});
		}
		nsList.init(tableJson.data,tableJson.column,tableJson.ui);
	}//调用列表生成方法
	function filterListClickHandler(ev){
		var $this = $(this);
		var key = $this.attr('ns-key');
		var containerId = $this.closest('ul').attr('ns-containerid');
		filterListDataComponentInit(key,containerId);
	}//筛选列表查询
	function getFilterListClassData(configObj){
		var dataArray = currentDataObject[configObj.keyField];
		var filterFieldConfig = configObj.filterFieldConfig;
		var classField = filterFieldConfig.classField;
		var classData = {
			all:dataArray
		};
		for(var dataI=0; dataI<dataArray.length; dataI++){
			var data = dataArray[dataI];
			if(!$.isArray(classData[data[classField]])){
				classData[data[classField]] = [];
			}
			classData[data[classField]].push(data);
		}
		return classData;
	}//
	function filterListDataInit(){
		if(filterListDataArray.length > 0){
			//默认显示选中的 如果没有默认选中则默认显示第一个
			for(var listI=0; listI<filterListDataArray.length; listI++){
				var listData = filterListDataArray[listI].data;
				var containerId = filterListDataArray[listI].containerId;
				var liId = containerId + '-ul';
				var $ul = $('#'+liId);
				var $liList = $ul.children('li');
				var $li = $('#'+liId+' li.active');
				if($li.length == 0){
					$li = $('#'+liId+' li:first');
				}
				var classType = $li.attr('ns-key');//读取所属分类
				var classData = getFilterListClassData(listData);
				filterListDataObject[containerId].data = classData;
				filterListDataComponentInit(classType,containerId);
				$liList.off('click',filterListClickHandler);
				$liList.on('click',filterListClickHandler);
			}
		}
	}//带列表过滤的初始化
	function voDataInit(){
		if(voDataArray.length > 0){
			for(var voI=0; voI<voDataArray.length; voI++){
				voData = voDataArray[voI];
				if(!$.isEmptyObject(currentDataObject)){
					//是通过getvalueajax获取到的当前值 需要进行给初始化赋值
					var valueJson = {};
					if(voData.parent == 'root'){
						valueJson = currentDataObject;
					}else{
						if(voData.keyField){
							valueJson = currentDataObject[voData.keyField];
						}
					}
					if(!$.isEmptyObject(valueJson)){
						for(var fieldI=0; fieldI<voData.form.length; fieldI++){
							voData.form[fieldI].value = valueJson[voData.form[fieldI].id];
						}
					}
				}
				nsForm.init(voData);
			}
		}
	}//vo初始化
	function dataInit(){
		voDataInit();
		listDataInit();
		filterListDataInit();
		btnInit();
	}
	function ajaxInit(){
		if(typeof(config.getValueAjax)=='object'){
			//定义了getValueAjax
			if(config.getValueAjax.src){
				var getValueAjax = nsVals.getAjaxConfig(config.getValueAjax,config.pageParam,{idField:mainIdField,keyField:mainKeyField});
				nsVals.ajax(getValueAjax,function(res){
					if(res.success){
						var data = res.data;
						serverDataObject = $.extend(true,{},data);
						currentDataObject = data;
						dataInit();
					}else{
						//失败
					}
				},true)
			}
		}else{
			dataInit();
		}
	}
	function setDefault(){
		var components = config.components;
		for(var componentI=0; componentI<components.length; componentI++){
			//查找主表id vo
			var componentData = components[componentI];
			if(componentData.parent == 'root'){
				mainIdField = componentData.idField;
				mainKeyField = componentData.keyField;
				break;
			}
		}
	}//设置默认值
	function init(_config){
		//第一次执行初始化模板
		if(typeof(nsTemplate.templates.detailsDocBase.data)=='undefined'){
			nsTemplate.templates.detailsDocBase.data = {};  
			/* 保存在该对象上的数据分为四个：
			 	* config(运行时参数)，
			 	* original（原始配置参数）
			*/
		}
		function configValidate(_config){
			var isValid = true;

			//整体参数验证
			var validArr =
				[
					['template', 'string', true], //模板
					['package', 'string', true], //包名
					['size', 'string'], //尺寸
					['title','string'],//标题
					['getValueAjax', 'object'], //数据方法的配置
					['components', 'array', true], //组件配置
				]
			isValid = nsDebuger.validOptions(validArr, _config);
			if (isValid == false) {
				return false;
			}
		}//验证配置参数
		//验证配置参数 验证错误则不执行
		if (configValidate(_config) == false) {
			nsalert('配置文件验证失败', 'error');
			console.error('配置文件验证失败');
			console.error(_config);
			return false;
		}
		originalConfig = $.extend(true,{},_config);
		config = _config;
		//记录config
		nsTemplate.templates.detailsDocBase.data[config.id] = {
			original:originalConfig,
			config:config
		}
		setDefault();
		containerInit();
		ajaxInit();
	}//初始化
	function componentInit(){

	}//组件调用初始化
	return {
		init:								init,							//模板初始化调用
		componentInit:						componentInit,					//调用某个组件初始化
		dialogBeforeHandler:				dialogBeforeHandler,			//弹框调用前置方法
		ajaxBeforeHandler:					ajaxBeforeHandler,				//弹框ajax保存前置方法
		ajaxAfterHandler:					ajaxAfterHandler,				//弹框ajax保存后置方法
		loadPageHandler:					loadPageHandler,				//弹框初始化加载方法
		closePageHandler:					closePageHandler,				//弹框关闭方法
	}
})(jQuery)
/******************** 表单表格模板 end ***********************/