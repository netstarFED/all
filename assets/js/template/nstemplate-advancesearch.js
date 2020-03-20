/***
***高级搜索模板组成包含button,form,table,tab
*****/
/******************** 搜索模板 start ***********************/
nsTemplate.templates.advanceSearch = (function(){
	function templateInit(){
		nsTemplate.templates.advanceSearch.data = {};  
		/* 保存在该对象上的数据分为四个：
		 * config(运行时参数)，
		 * original（原始配置参数）
		 */
	}
	var config = {};
	var templateData = {};
	//初始化方法
	function init(_config){
		config = _config;
		//第一次执行初始化模板
		if(typeof(nsTemplate.templates.advanceSearch.data)=='undefined'){
			templateInit();
		}
		//记录config
		nsTemplate.templates.advanceSearch.data[config.id] = {
			original:$.extend(true,{},config),
			config:config
		}
		templateData = nsTemplate.templates.advanceSearch.data[config.id];
		//验证
		function advanceSearchsValidate(){
			var isValid = true;
			var validArr = 
			[
				['title','string',true],
				['beforeInitHandler','function'],
				['afterInitHandler','function'],
				['beforeSubmitHandler','function'],
				['isShowTitle','boolean'],
				['isFormHidden','boolean'],
				['form','object',true],
				['table','object',true],
				['nav','object'],
				['tab','object']
			];
			isValid = nsDebuger.validOptions(validArr,config);
			if(isValid == false){return false;}
			var validFormArr = 
			[
				['field','array',true],
				['hide','array'],
				['isUserControl','boolean'],
				['isUserContidion','boolean']
			];
			isValid = nsDebuger.validOptions(validFormArr,config.form);
			if(isValid == false){return false;}
			var validTableArr = 
			[
				['field','array',true],
				['hide','array'],
				['ajax','object'],
				['title','string'],
				['btns','array'],
				['tableRowBtns','array'],
				['dataReturnbtns','function'],
				['ui','object']
			];
			isValid = nsDebuger.validOptions(validTableArr,config.table);
			if(isValid == false){return false;}
			return isValid;
		}
		if(debugerMode){
			if(!advanceSearchsValidate()){
		 		return false;
		 	}
		}
		//设置默认值
		function setDefault(){
			config.browersystem = nsVals.browser.browserSystem;
			//layout的默认配置参数
			config.navId = 'nav';
			config.tableId = 'table';
			config.formId = 'form';
			config.fullFormId = config.id + '-'+config.formId;
			config.fullTableId = 'table-'+config.id+'-'+config.tableId;
			config.navJson = 'navJson';
			config.tableJson = 'tableJson';
			config.formJson = 'formJson';
			config.tabId = 'tabs';
			config.btnId = 'btns';
			config.title = typeof(config.title) == 'string' ? config.title : '';
			config.isFormHidden = typeof(config.isFormHidden)=='boolean' ? config.isFormHidden : false;
			config.isShowTitle = typeof(config.isShowTitle)=='boolean' ? config.isShowTitle : true;
			config.isShowHistoryBtn = typeof(config.isShowHistoryBtn)=='boolean' ? config.isShowHistoryBtn : false;
			if(typeof(config.nav)!='object'){
				config.nav = {};config.nav.field = [];
			}else{
				if(!$.isArray(config.nav.field)){config.nav.field = [];}
			}
			if(!$.isArray(config.form.hide)){config.form.hide = [];}
			if(!$.isArray(config.table.hide)){config.table.hide = [];}
			if(!$.isArray(config.table.tableRowBtns)){config.table.tableRowBtns = [];}
			if(!$.isArray(config.table.btns)){config.table.btns = [];}
			config.form.isUserControl = typeof(config.form.isUserControl) == 'boolean' ? config.form.isUserControl : true;
			config.form.isUserContidion = typeof(config.form.isUserContidion) == 'boolean' ? config.form.isUserContidion : true;
			config.table.ui = typeof(config.table.ui)=='object' ? config.table.ui : {};
			config.browersystem = nsVals.browser.browserSystem;
		}
		//输出html
		function getHtml(){
			var navHtml = '';
			navHtml = '<nav ns-id="'+config.navId+'" ns-config="'+config.navJson+'" ns-options="border:left,class:nav-form,templates:advanceSearch"></nav>';
			var isShowHistoryBtn = config.isShowHistoryBtn;
			var btnHtml = '<panel ns-id="'+config.btnId+'" ns-options="border:left,class:nav-form"></panel>';
			var tabHtml = '';
			if(!$.isEmptyObject(config.tab)){
				tabHtml = '<panel ns-id="'+config.tabId+'"></panel>';
			}
			var html = '<layout id="'+config.id+'" ns-package="'+config.package+'" ns-options="templates:advanceSearch,isShowHistoryBtn:'+isShowHistoryBtn+'">'
							+navHtml
							+btnHtml
							+tabHtml
							+'<panel ns-id="'+config.formId+'" ns-options="col:12" ns-config="form:'+config.formJson+'"></panel>'
							+'<panel ns-id="'+config.tableId+'" ns-options="col:12,class:senior-search" ns-config="table:'+config.tableJson+'"></panel>'
						+'</layout>';
			return html;
		}
		function getTabData(){
			if(!$.isEmptyObject(config.tab)){
				var tabIndex = config.tab.index;
				if($.isArray(config.form.field[tabIndex].subdata)){
					if(config.form.field[tabIndex].subdata.length > 0){
						getTabHtml(tabIndex);
					}
				}
			}
		}
		function getTabHtml(tabIndex){
			var tabArr = config.form.field[tabIndex].subdata;
			var tabHtml = '<ul class="nav nav-tabs nav-tabs-justified" nsform-index="'+config.form.field[tabIndex].id+'">';
			for(var tabI=0; tabI<tabArr.length; tabI++){
				var classStr = tabI == 0 ? 'active' : '';
				tabHtml += '<li class="'+classStr+'"><a href="javascript:void()" data-toggle="tab" ns-id="'+tabArr[tabI][config.form.field[tabIndex].valueField]+'">'+tabArr[tabI][config.form.field[tabIndex].textField]+'</a></li>';
			}
			tabHtml += '</ul>';
			var tabID = config.id + '-tabs';
			$('#'+tabID).html(tabHtml);
			$('#'+tabID+' li a').on('click',function(ev){
				refresh(config);
			});
		}
		function createJson(){
			var obj = eval(config.package + '={}');
			//导航按钮数据
			obj[config.navJson] = {
				title:				config.title,
				isShowTitle:		config.isShowTitle,
				btns:				[]
			};
			//form数据
			var formFieldArray = config.form.field;
			nsTemplate.setFieldHide('form', formFieldArray, config.form.hide);
			for(var i=0; i<formFieldArray.length; i++){
				formFieldArray[i].commonChangeHandler = formCommonChangeHandler;
			}
			obj[config.formJson] = {
				isUserControl:config.form.isUserControl,//是否开启用户自定义配置
				isUserContidion:config.form.isUserContidion,//是否查看筛选条件
				form:formFieldArray
			};
			//table数据
			var tableFieldArray = config.table.field;
			nsTemplate.setFieldHide('table',tableFieldArray,config.table.hide);
			//筛选条件
			var formParamsObject = {};
			for(var paramI=0; paramI<formFieldArray.length; paramI++){
				if(formFieldArray[paramI].value){
					formParamsObject[formFieldArray[paramI].id] = formFieldArray[paramI].value;
				}
				if(formFieldArray[paramI].value === 0){
					formParamsObject[formFieldArray[paramI].id] = formFieldArray[paramI].value;
				}
			}
			var tableParamsObject = $.extend(true,config.table.ajax.select.data,formParamsObject);
			obj[config.tableJson] = {
				columns: tableFieldArray,
				data: {
					src: config.table.ajax.select.src,
					type: config.table.ajax.select.type, //GET POST
					dataSrc: config.table.ajax.select.dataSrc,
					data: tableParamsObject, //参数对象{id:1,page:100}
					isServerMode: typeof(config.table.ajax.select.isServerMode)=='boolean'?config.table.ajax.select.isServerMode:false, //是否开启服务器模式
					isSearch: true, //是否开启搜索功能
					isPage: true, //是否开启分页
				},
				ui: {
					pageLengthMenu: 10, 			//可选页面数  auto是自动计算  all是全部
					isMulitSelect: true,					 //是否单选
					isUseTabs:								true,							//是否使用tabs状态
					isUseMax:true,
					dragWidth: true,
					isUseCleanLocalStorage:true,
				},
				btns:{
					title:config.table.title,
					selfBtn:[]
				}
			};
			//如果自定义了ui配置
			for(var ui in config.table.ui){
				obj[config.tableJson].ui[ui] = config.table.ui[ui];
			}
			//table单元格里自定义列按钮
			if(config.table.tableRowBtns.length > 0){
				var columnBtnArr =  nsTemplate.runObjColumnBtnHandler(config.table.tableRowBtns,tableRowBtnHandler);
				var columnBtns = columnBtnArr[0];
				config.table.tableRowBtnHandler = columnBtnArr[1];
				var btnWidth = columnBtns.length * 30 + 10;
				var customerBtnJson = {
					title: '操作',
					width:btnWidth,
					tabPosition:'after',
					formatHandler: {
						type: 'button',
						data: {
							subdata:columnBtns
						}
					}
				};
				if(typeof(config.table.dataReturnbtns)=='function'){
					customerBtnJson.formatHandler.data.dataReturn = config.table.dataReturnbtns;
				}
				obj[config.tableJson].columns.push(customerBtnJson);
			}
			//table自定义操作按钮
			if(config.table.btns.length > 0){
				var btnGroupArr = nsTemplate.runObjBtnHandler(config.table.btns,tableLevelBtnHandler,tableLevelTwoBtnHandler);
				obj[config.tableJson].btns.selfBtn = btnGroupArr[0];
				config.table.tableBtnHandler = btnGroupArr[1];
			}
		}
		//刷新表格
		function refresh(){
			var $container = $('#'+config.fullFormId).find('.search-link');//筛选条件的dom元素
			var formJson = nsForm.getFormJSON(config.fullFormId);
			//读取表格默认请求的参数
			var tableJson = baseDataTable.data[config.fullTableId].dataConfig.data;
			var paramObject = $.extend(true,tableJson,formJson);
			//如果筛选条件有空的删除不作为筛选条件
			for(key in paramObject){
				if(paramObject[key] === ''){
					delete paramObject[key];
				}
			}
			//如果刷新前要进行参数操作
			if(typeof(config.beforeSubmitHandler)=='function'){
				paramObject = config.beforeSubmitHandler(paramObject);
				if(paramObject === false){return;}
			}
			//刷新筛选条件
			var searchData = nsForm.getFormData(config.fullFormId);
			refreshFormContidionHtml();
			function refreshFormContidionHtml(){
				var liHtml = '';
				for(var searchID in searchData){
					if(searchData[searchID].value === '' || searchData[searchID].text == '全部'){
						delete searchData[searchID];
					}
				}
				if(!$.isEmptyObject(searchData)){
					for(var search in searchData){
						liHtml += '<li ns-id="'+search+'">'+searchData[search].label+':'+searchData[search].text+'</li>';
					}
				}else{
					liHtml = '<li class="empty">暂无</li>';
				}
				$container.html(liHtml);
				$container.children('li').not('.empty').off('click');
				$container.children('li').not('.empty').on('click',function(ev){
					var $this = $(this);
					var nID = $this.attr('ns-id');
					delete searchData[nID];
					var fillvalues = {}
					fillvalues[nID] = '';
					nsForm.fillValues(fillvalues,config.fullFormId);
					var $container = $this.closest('.search-link');
					var formJson = nsForm.getFormJSON(config.fullFormId,false);
					var tableID = config.fullTableId;
					var tableParamDta = baseDataTable.data[tableID].dataConfig.data;
					var paramObject = $.extend({},tableParamDta,formJson);
					delete paramObject['empty_param_object'];
					//清空参数为空的值
					for(key in paramObject){
						if(paramObject[key] === ''){
							delete paramObject[key];
						}
					}
					if($.isEmptyObject(paramObject)){
						paramObject['empty_param_object'] = new Date().getTime();
					}
					baseDataTable.reloadTableAJAX(tableID,paramObject);
					refreshFormContidionHtml();
				});
			}
			//刷新表格
			baseDataTable.reloadTableAJAX(config.fullTableId,paramObject);
		}
		//form组件改变值回调方法
		function formCommonChangeHandler(runObj){
			nsTemplate.runObjHandler(config.form.changeHandler,'before',[runObj]);
			nsTemplate.runObjHandler(config.form.changeHandler,'change',[
				{
					after:function(runObj){
						refresh();
					}
				},runObj
			]);
			nsTemplate.runObjHandler(config.form.changeHandler,'after',[runObj]);
		}
		//table行按钮触发事件
		function tableRowBtnHandler(data){
			data.config = config;
			var runHandler = config.table.tableRowBtnHandler[data.buttonIndex];
			if(typeof(runHandler)=='object'){
				if(typeof(runHandler.before)=='function'){
					nsTemplate.runObjHandler(runHandler, 'before', [data]);
				}
				if(typeof(runHandler.handler)=='function'){
					nsTemplate.runObjHandler(runHandler,'handler',[data]);
				}
				if(typeof(runHandler.after)=='function'){
					nsTemplate.runObjHandler(runHandler, 'after', [data]);
				}
			}else{
				if(typeof(runHandler)=='function'){
					nsTemplate.runObjHandler(config.table.tableRowBtnHandler[data.nsIndex],'handler',[data]);
				}
			}
		}
		//table一级按钮触发事件
		function tableLevelBtnHandler(data){
			data.config = config;
			var runHandler = config.table.tableBtnHandler[data.nsIndex].handler;
			if(typeof(runHandler)=='object'){
				if(typeof(runHandler.before)=='function'){
					nsTemplate.runObjHandler(runHandler, 'before', [data]);
				}
				if(typeof(runHandler.btn.handler)=='function'){
					nsTemplate.runObjHandler(runHandler.btn,'handler',[data]);
				}
				if(typeof(runHandler.after)=='function'){
					nsTemplate.runObjHandler(runHandler, 'after', [data]);
				}
			}else{
				if(typeof(runHandler)=='function'){
					nsTemplate.runObjHandler(config.table.tableBtnHandler[data.nsIndex],'handler',[data]);
				}
			}
		}
		//table二级（下拉按钮）事件事件
		function tableLevelTwoBtnHandler(data){
			data.config = config;
			var runHandler = config.table.tableBtnHandler[data.nsIndex][data.nsSubIndex].handler;
			if(typeof(runHandler)=='object'){
				if(typeof(runHandler.before)=='function'){
					nsTemplate.runObjHandler(runHandler, 'before', [data]);
				}
				if(typeof(runHandler.btn.handler)=='function'){
					nsTemplate.runObjHandler(runHandler.btn,'handler',[data]);
				}
				if(typeof(runHandler.after)=='function'){
					nsTemplate.runObjHandler(runHandler, 'after', [data]);
				}
			}else{
				if(typeof(runHandler)=='function'){
					nsTemplate.runObjHandler(config.table.tableBtnHandler[data.nsIndex][data.nsSubIndex],'handler',[data]);
				}
			}
		}
		//按钮调用
		function createBtnJson(){
			if(!$.isEmptyObject(config.nav)){
				if($.isArray(config.nav.field)){
					var btnGroupArr = nsTemplate.runObjBtnHandler(config.nav.field,baseBtnHandler,subBtnHandler);
					var btnArr = btnGroupArr[0];
					var origalBtnJson = btnGroupArr[1];
					var navId = config.id + '-btns';
					var navJson = {
						id:navId,
						btns:[btnArr],
						isShowTitle:typeof(config.isShowTitle)=='boolean' ? config.isShowTitle : false,
					}
					nsNav.init(navJson);
				}
			}
			function baseBtnHandler(element){
				var nIndex = element.attr('fid');
				var callbackHandler = origalBtnJson[nIndex];
				nsTemplate.runObjHandler(callbackHandler,'handler',[
					{
						before:function(){
							console.log('before')
						}
					}
				]);
			}
			function subBtnHandler(element){
				var nIndex = element.children('a').attr('fid');
				var subIndex = element.children('a').attr('optionid');
				callbackHandler = origalBtnJson[nIndex][subIndex];
				nsTemplate.runObjHandler(callbackHandler,'handler',[
					{
						before:function(){
							
						}
					}
				]);
			}
		}
		setDefault();
		var html = getHtml();
		//围加根html
		html = nsTemplate.aroundRootHtml(html);
		//将html添加到页面
		nsTemplate.appendHtml(html);
		//创建模板Json对象
		createJson();
		//初始化layout
		if(typeof(config.beforeInitHandler)=='function'){
			//初始化之前调用
			var package = config.package;
			package = eval(package);
			package = config.beforeInitHandler(package);
		}
		nsLayout.init(config.id);
		if(config.isFormHidden == true){
			//隐藏
			$('#'+config.id+'-form').hide();
			$('#'+config.id+'-tabs').hide();
		}
		getTabData();//创建tab
		if(config.browersystem == 'pc'){
			createBtnJson();//生成btn按钮
			var $nav = $('#'+config.id+'-btns');
			var navWidth = 0;
			var navTop = 0;
			if($nav.length==1){
				navWidth = $nav.outerWidth();
				navTop = $nav.offset().top;
			}
			var formID = config.id+'-form';
			var btnTop = 0 ;
			var $btn = $('button[ns-form="form-'+formID+'"]');
			if($btn.length == 1){
				btnTop = $btn.offset().top;
			}
			var navTitleTop = 0;
			if(config.isShowTitle){
				navTitleTop = $('.breadcrumb-container').offset().top;
			}
			var spaceTop = btnTop - navTop + (btnTop-navTitleTop);
			if(!$.isEmptyObject(config.tab)){
				spaceTop = btnTop - navTop + 13;
			}else{
				$btn.css('top','-13px');
			}
			$nav.css({'top':spaceTop+'px'});
		}
		if(typeof(config.afterInitHandler)=='function'){
			//初始化之后调用
			config.afterInitHandler();
		}
	}
	//清空方法
	function clear(id){
		var config = nsTemplate.templates.advanceSearch.data[id].config;
		nsForm.clearData(config.fullFormId);
		baseDataTable.clearData(config.fullTableId);
	}
	return {
		init:init,
		clear:clear
	}
})(jQuery)
/******************** 搜索模板 end ***********************/