var nsTransactorEditor = (function($){
	// 表单数组配置对象
	var getTypeData = {}
	var config = {};
	var editorData = {}; // 没有格式化
	var editorDataArr = []; // 没有格式化
	var sourceValuesData = []; // 原始的value数据
	// tabs
	var tabs = {
		id:'',
		// 当前编辑的面板名
		activeId:'',
		// tab列表内容
		content:[
			{id:'user', text:'人员选择'},
			{id:'role', text:'角色选择'},
			{id:'post', text:'岗位选择'},
			{id:'dept', text:'部门选择'},
			{id:'group', text:'组选择'},
		],
		getHtml:function(){
			var tabsHtml = '';
			for(var i=0;i<this.content.length;i++){
				var className = '';
				if(this.content[i].id == this.activeId){
					className = ' class="current"';
				}
				tabsHtml += '<li class="component-editor-tab-nav-item" nsid="'+this.content[i].id+'">'
							+	'<a href="javascript:void(0);" '+className+'>'+this.content[i].text+'</a>'
						+'</li>';
			}
			return tabsHtml;
		},
		iniTabtEvent:function(){
			var _this = this;
			var $tab = _this.$tabs.children();
			$tab.on('click',function(ev){
				container.saveData(); // 保存当前面板数据
				var $thisTab = $(this);
				var activeId = $thisTab.attr('nsid');
				tabs.activeId = activeId;
				_this.setActiveTab(activeId);
			})
		},
		setActiveTab:function(){
			var activeId = this.activeId;
			var $activeTab = this.$tabs.children().eq(0);
			for(var i=0;i<this.$tabs.children().length;i++){
				if(this.$tabs.children().eq(i).children().hasClass('current')){
					$activeTab = this.$tabs.children().eq(i);
				}
			}
			var currentTabId = $activeTab.attr('nsid');
			//如果当前的要切换的一样就不用执行了
			if(currentTabId == activeId){
				return;
			}
			
			//移除和添加active class
			$activeTab.children().removeClass('current');
			for(var i=0;i<this.$tabs.children().length;i++){
				if(this.$tabs.children().eq(i).attr('nsid') == activeId){
					this.$tabs.children().eq(i).children().addClass('current');
				}
			}
			container.refreshTabsPanel(activeId); 
		},
		init:function(tabId){
			this.activeId = tabId;
			var tabsId = container.tabsId;
			this.id = tabsId;
			this.$tabs = $('#'+this.id);
			this.$tabs.html(this.getHtml());
			this.iniTabtEvent();
		}
	}
	var btns = {
		getHtml:function(){
			return '<div class="btn-group">'
						+'<button class="btn btn-info">'
							+'<i class="fa fa-save"></i>'
							+'<span>确定</span>'
						+'</button>'
						+'<button class="btn btn-info">'
							+'<i class="fa fa-close"></i>'
							+'<span>关闭</span>'
						+'</button>'
					+'</div>'
		},
		refreshInput:function(){
			var formID = config.fullID.substring(5,config.fullID.length-config.id.length-1);
			nsForm.edit([config],formID)
		},
		initBtnsEvent:function(){
			var buttons = this.$btns.children().children();
			function hideEditPanel(){
				$('#'+container.containerId+' .component-editor-modal').removeClass('fadeInDown').addClass('fadeOutUp');
				$('#'+container.containerId+' .component-editor-modal').siblings('.fadeIn').removeClass('fadeIn').addClass('fadeOut');
				$('#'+container.containerId+' .component-editor-modal').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
					$('#'+container.containerId).remove();
				});
			}
			buttons.eq(0).on('click',function(event){
				container.saveData();
				for(var i=0;i<editorDataArr.length;i++){
					var isRepeat = false;
					for(var j=0;j<config.value.length;j++){
						isRepeat = nsVals.isEqualObject(config.value[j],editorDataArr[i]);
						if(isRepeat){
							console.warn('重复配置不添加');
							console.warn(config.value[j]);
							break;
						}
					}
					if(!isRepeat){
						sourceValuesData.push(editorDataArr[i]);
					}
				}
				config.value = sourceValuesData;
				btns.refreshInput();
				hideEditPanel();
				if(typeof(config.changeHandler)=='function'){
					var isSame = true;
					if(sourceValuesData.length!=config.value.length){
						isSame = false;
					}else{
						for(var i=0;i<sourceValuesData.length;i++){
							var isHave = false;
							for(var j=0;j<config.value.length;j++){
								if(sourceValuesData[i].type == config.value[j].type){
									isHave = true;
									isSame = nsVals.isEqualObject(sourceValuesData[i],config.value[j]);
									break;
								}
							}
							if(!isHave){
								isSame = false;
							}
						}
					}
					if(!isSame){
						config.changeHandler(config.value,config);
					}
				}
			})
			buttons.eq(1).on('click',function(event){
				hideEditPanel();
			})
		},
		init:function(){
			var btnsId = container.btnsId;
			this.id = btnsId;
			this.$btns = $('#'+this.id);
			this.$btns.html(this.getHtml());
			this.initBtnsEvent();
		}
	}
	// 编辑面板基本方法
	var container = {
		// 当前编辑的面板名
		content:{
			// 人员选择
			user:[
				{
					id:'user',
					label:'',
					type:'radio',
					textField:'name',
					valueField:'id',
					column:12,
					subdata:[
						{
							id:'processCreaterFlag',
							name:'流程创建者'
						},{
							id:'userOfPreviousActivity',
							name:'上一环节办理人'
						},{
							id:'userOfOtherActivity',
							name:'其他环节办理人'
						},{
							id:'candidateUsers',
							name:'设定人'
						}
					],
					changeHandler:function(value){
						var editArr = [
							{
								id:'userOfOtherActivity',
								hidden:true,
								value:'',
							},{
								id:'candidateUsers',
								hidden:true,
								value:'',
								subdata:undefined,
							}
						]
						switch(value){
							case 'userOfOtherActivity':
								editArr[0].hidden = false;
								break;
							case 'candidateUsers':
								editArr[1].hidden = false;
								break;
						}
						nsForm.edit(editArr,container.planeId);
                        var activities = nsWorkFlow.prototype.getAllActivities();
                        nsForm.edit([
                            {
                                id: 'userOfOtherActivity',
                                subdata:activities,
                            }
                        ], container.planeId);
					}
				},{
					id:'userOfOtherActivity',
					label:'其它环节',
					type:'select',
					textField:'name',
					valueField:'id',
					column:12,
					hidden:true,
				},{
					id:'candidateUsers',
					label:'人员',
					type:'person-select',
					column:12,
					hidden:true,
					personAjax:		{},
					groupAjax:		{},
				}
			],
			// 角色选择
			role:[
				{
                    id: 'role',
					label:'角色',
					type:'select',
					textField:'name',
					valueField:'id',
					column:12,
				},{
                    id: 'role-type',
					label:'',
					type:'radio',
					textField:'name',
					valueField:'id',
					column:12,
					subdata:[
						{
							id:'allDeptFlag',
							name:'所有部门'
						},{
							id:'deptOfPreviousActivity',
							name:'上一环节办理人所在部门'
						},{
							id:'deptOfOtherActivity',
							name:'其他环节办理人所在部门'
						},{
							id:'candidateDept',
							name:'设定部门'
						}
					],
					changeHandler:function(value){
						var editArr = [
							{
								id:'deptOfOtherActivity',
								hidden:true,
								value:'',
							},{
								id:'candidateDept',
								hidden:true,
								value:'',
								subdata:undefined,
							}
						]
						switch(value){
							case 'deptOfOtherActivity':
								editArr[0].hidden = false;
								break;
							case 'candidateDept':
								editArr[1].hidden = false;
								break;
						}
						nsForm.edit(editArr,container.planeId);
                        var activities = nsWorkFlow.prototype.getAllActivities();
                        nsForm.edit([
                            {
                                id: 'deptOfOtherActivity',
                                subdata:activities,
                            }
                        ], container.planeId);
					}
				},{
					id:'deptOfOtherActivity',
					label:'其他环节办理人所在部门',
					type:'select',
					textField:'name',
					valueField:'id',
					column:12,
					hidden:true,
				},{
					id:'candidateDept',
					label:'设定部门',
					type:'select',
					textField:'name',
					valueField:'id',
					column:12,
					hidden:true,
				}
			],
			// 岗位选择
			post:[
				{
                    id: 'post',
					label:'岗位',
					type:'select',
					textField:'name',
					valueField:'id',
					column:12,
				},{
                    id: 'post-type',
					label:'',
					type:'radio',
					textField:'name',
					valueField:'id',
					column:12,
					subdata:[
						{
							id:'allDeptFlag',
							name:'所有部门'
						},{
							id:'deptOfPreviousActivity',
							name:'上一环节办理人所在部门'
						},{
							id:'deptOfOtherActivity',
							name:'其他环节办理人所在部门'
						},{
							id:'candidateDept',
							name:'设定部门'
						}
					],
					changeHandler:function(value){
						var editArr = [
							{
								id:'deptOfOtherActivity',
								hidden:true,
								value:'',
							},{
								id:'candidateDept',
								hidden:true,
								value:'',
								subdata:undefined,
							}
						]
						switch(value){
							case 'deptOfOtherActivity':
								editArr[0].hidden = false;
								break;
							case 'candidateDept':
								editArr[1].hidden = false;
								break;
						}
						nsForm.edit(editArr,container.planeId);
                        var activities = nsWorkFlow.prototype.getAllActivities();
                        nsForm.edit([
                            {
                                id: 'deptOfOtherActivity',
                                subdata:activities,
                            }
                        ], container.planeId);
					}
				},{
					id:'deptOfOtherActivity',
					label:'其他环节办理人所在部门',
					type:'select',
					textField:'name',
					valueField:'id',
					column:12,
					hidden:true,
				},{
					id:'candidateDept',
					label:'设定部门',
					type:'select',
					textField:'name',
					valueField:'id',
					column:12,
					hidden:true,
				}
			],
			// 部门选择
			dept:[
				{
					id:'candidateDept',
					label:'部门',
					type:'select',
					textField:'name',
					valueField:'id',
					column:12,
				}
			],
			// 组选择
			group:[
				{
					id:'candidateGroup',
					label:'组',
					type:'select',
					textField:'name',
					valueField:'id',
					column:12,
				}
			],
		},
		// 设置默认的value值
		setDefaultValue:function(formArr,activeId){
			var values = editorData[activeId];
			if(values){
				for(var i=0;i<formArr.length;i++){
					if(values[formArr[i].id]){
						formArr[i].value = values[formArr[i].id];
						switch(formArr[i].id){
							case 'user':
								switch(values[formArr[i].id]){
									case 'userOfOtherActivity':
										formArr[1].hidden = false;
										break;
									case 'candidateUsers':
										formArr[2].hidden = false;
										break;
								}
								break;
						}
					}
				}
			}
		},
		// 获得整体面板的html
		getEditorHtml:function(){
			return $('<div id="'+this.containerId+'">'
						+'<div class="component-editor component-editor-modal transactor fadeInDown animated">'
							+'<div class="component-editor-header">'
								+'<h4 class="component-editor-title">'+this.title+'</h4>'
								+'<ul class="component-editor-tab-nav" id="'+this.tabsId+'">'
								+'</ul>'
							+'</div>'
							+'<div class="component-editor-body" id="'+this.planeId+'">'
							+'</div>'
							+'<div class="component-editor-footer" id="'+this.btnsId+'">'
							+'</div>'
						+'</div>'
						+'<div class="fadeIn animated" style="position: fixed;top: 0;right: 0;bottom: 0;left: 0;background: rgba(0, 0, 0, 0.5);z-index: 1048;"></div>'
					+'</div>');
		},
		// 格式化form表单数组
		formatFormArr:function(formArr){
			var activeId = this.activeId;
			var formatAttr = config[activeId];
			for(var i=0;i<formArr.length;i++){
				if(formatAttr[formArr[i].id]){
					for(var key in formatAttr[formArr[i].id]){
						formArr[i][key] = formatAttr[formArr[i].id][key];
					}
				}
			}
		},
		refreshTabsPanel:function(activeId){
			var _this = this;
			_this.activeId = activeId;
			var formArr = $.extend(true,[],container.content[_this.activeId]);
			_this.formatFormArr(formArr);
			_this.setDefaultValue(formArr,_this.activeId);
			$('#'+_this.planeId).children().remove();
			_this.formArr = formArr;
			var formJson = {
				id:  		_this.planeId,
				size: 		"standard",
				format: 	"standard",
				fillbg: 	true,
				form:       formArr,
			}
			formPlane.formInit(formJson);
		},
		saveData:function(){
			var tab = tabs.activeId; // 当前数据类型
			var formJson = nsForm.getFormJSON(this.planeId,false);
			var formData = nsForm.getFormData(this.planeId); // 获得表单数据
			editorData[tab] = $.extend(true,{},formJson);
			// console.log(this.formArr);
			// 格式化value
			for(var attrKey in editorData[tab]){
				switch(attrKey){
					case 'candidateUsers':
						var candidateUsersData = formJson[attrKey];
						var valueFieldIndex = '';
						var localDataConfig =  config[tab][attrKey].personAjax.localDataConfig;
						for(var i=0;i<localDataConfig.length;i++){
							if(localDataConfig[i].isID){
								valueFieldIndex = i;
							}
						}
						var valObjArr = [];
						for(var i=0;i<candidateUsersData.length;i++){
							valObjArr.push(candidateUsersData[i][valueFieldIndex]);
						}
						editorData[tab][attrKey] = valObjArr;
						break;
				}
			}
			// 获得格式化的数据
			var editObj = {};
			for(var attrKey in formData){
				switch(attrKey){
					case 'user':
                    case 'role-type':
                    case 'post-type':
						switch(formData[attrKey].value){
							case 'processCreaterFlag':
							case 'userOfPreviousActivity':
							case 'allDeptFlag':
							case 'deptOfPreviousActivity':
								editObj[formData[attrKey].value] = true;
								break;
						}
						break;
					case 'candidateUsers':
						var candidateUsersData = formJson[attrKey];
						var valueField = '';
						var valueFieldIndex = '';
						var textField = '';
						var textFieldIndex = '';
						var localDataConfig =  config[tab][attrKey].personAjax.localDataConfig;
						for(var i=0;i<localDataConfig.length;i++){
							if(localDataConfig[i].isID){
								valueField = localDataConfig[i].key;
								valueFieldIndex = i;
							}
							if(localDataConfig[i].isName){
								textField = localDataConfig[i].key;
								textFieldIndex = i;
							}
						}
						var valObjArr = [];
						for(var i=0;i<candidateUsersData.length;i++){
							var valObj = {};
							valObj[textField] = candidateUsersData[i][textFieldIndex];
							valObj[valueField] = candidateUsersData[i][valueFieldIndex];
							valObjArr.push(valObj);
						}
						editObj[attrKey] = valObjArr;
						break;
					default:
						if(formData[attrKey].value){
							var valArr = formData[attrKey].value.split(',');
							var textArr = formData[attrKey].text.split(',');
							var textField = config[tab][attrKey].textField;
							var valueField = config[tab][attrKey].valueField;
							var valObjArr = [];
							var valObj = {};
							for(var i=0;i<valArr.length;i++){
								valObj = {};
								valObj[textField] = textArr[i];
								valObj[valueField] = valArr[i];
								valObjArr.push(valObj);
							}
							editObj[attrKey] = valObj;
						}
						break;
				}
			}
			if(!$.isEmptyObject(editObj)){
				editObj.type = tab;
				var isHave = false;
				for(var i=0;i<editorDataArr.length;i++){
					if(editorDataArr[i].type == editObj.type){
						editorDataArr[i] = editObj;
						isHave = true;
					}
				}
				if(!isHave){
					editorDataArr.push(editObj);
				}
			}
		},
		init:function(){
			this.title = config.label;
			this.containerId = config.id + '-container';
			this.tabsId = config.id + '-tabs';
			this.planeId = config.id + '-plane';
			this.btnsId = config.id + '-btns';
			var editHtml = this.getEditorHtml();
			$('body').append(editHtml);
			tabs.init('user');
			this.refreshTabsPanel('user');
			btns.init();
		}
	}
	function init(_config){
		config = _config;
		editorData = {}; // 编辑数据
		editorDataArr = []; // 编辑数据
		sourceValuesData = $.isArray(config.value)?$.extend(true,[],config.value):[];
		container.init();
	}
	return {
		init:init,
		getConfig:function(){return config},
	}
})(jQuery)