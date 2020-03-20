//网星项目页面管理工具
var nsProjectPagesManager = {
	pages:{},  //相关页面
	voDataSourceManager:{}, 	//数据源处理工具
};

//VO数据源处理 
nsProjectPagesManager.voDataSource = 
(function($) {
	
	//初始化时候进入的回调函数
	var config;
	//初始化
	function init(_config){
		/* config:{  包含的参数
		 * 		voSaveAjax:{url, type, dataSrc}  保存VO相关数据接口
		 * 		voListAjax:{url, type, dataSrc}  获取vo列表的ajax配置
		 * }
		 */
		config = _config;
		//分配config参数
		dialogForImport.init();
		voManager.init();
	}
	//导入弹框 start ----------------------------------------------------------------
	var dialogForImport = {
		//基本配置
		config:{
			id: 'voImportDialog',
			title:'导入VO数据源',
			form:[],  //需要后续获取
			btns:[
				{
					text:'获取数据',
					handler:function(){
						var dialogValues = nsdialog.getFormJson();
						if(dialogValues){
							//获取VO数据源描述
							voManager.getVOSourceByUrl(dialogValues.vourl);
						}

					}
				},{
					text:'保存数据',
					//disabled:true,
					handler:function(){
						var _formatXMLJson = voManager.formatXMLJson;
						if(typeof(_formatXMLJson)!='object'){
							nsAlert('导出数据没有准备好');
							return;
						}
						if(typeof(_formatXMLJson.englishName)!='string'){
							nsAlert('导出数据没有准备好');
							return;
						}
						var dialogValues = nsdialog.getFormJson();
						switch(dialogForImport.type){
							case 'add':
								var isTure = nsProjectPagesManager.pages.voList.listTable.validataXmlName(_formatXMLJson.englishName);
								if(isTure){
									voManager.saveAjax(_formatXMLJson, dialogValues);
								}else{
									nsAlert('已存在同名的思维导图','error');
								}
								break;
							case 'edit':
								voManager.saveAjax(_formatXMLJson, dialogValues);
								break;
						}
					}
				},{
					text:'导出思维导图',
					//disabled:true,
					handler:function(){
						var _formatXMLJson = voManager.formatXMLJson;
						if(typeof(_formatXMLJson)!='object'){
							nsAlert('导出数据没有准备好');
							return;
						}
						if(typeof(_formatXMLJson.englishName)!='string'){
							nsAlert('导出数据没有准备好');
							return;
						}
						console.log(_formatXMLJson);
						voManager.exprotMindjetXML(_formatXMLJson);
					}
				},{
					text:'导出编辑的思维导图',
					handler:function(){
						nsProjectPagesManager.pages.voList.voMapTable.getFullXmmapJson(true,function(xmmapJson,statesNameJson){
							var xmmapFullJson = dialogForImport.getXmmapFullJson(xmmapJson,statesNameJson);
							for(var entityName in xmmapFullJson){
								xmmapFullJson.chineseName = entityName;
								xmmapFullJson.englishName = entityName;
							}
							console.log(xmmapFullJson);
							voManager.exprotMindjetXML(xmmapFullJson);
						})
					}
				}
			]
		},
		//服务器端配置
		server:{
			voSourceListAjax:{}, //vo数据源列表的ajax配置
		},
		//初始化时候进入的回调函数
		init:function(){
			this.server.voSourceListAjax = config.voSourceListAjax;
		},
		// 获得生成思维导图需要的xmmapJson
		getXmmapFullJson:function(sourceXmmapJson,statesNameJson){
			var xmmapFullJson = {};
			var chineseNameJson = {
				list:'列表方法',
				modal:'实体方法',
				fields:'基本字段',
				fieldBusiness:'业务字段',
				fieldVisual:'显示字段',
				fieldControl:'操作字段',
			};
			var fieldAttrJson = {
				id:'string',
				rules:'string',
				placeholder:'string',
				type:'string',
				label:'string',
				fieldLength:'number',
				addvalue:'object',
				format:'string',
				isDefaultDate:'boolean',
				textField:'string',
				valueField:'string',
				subdata:'object',
				isCloseSearch:'number',
				filltag:'boolean',
				url:'string',
				name:'string',
				dataSrc:'string',
				method:'string',
				englishName:'string',
				chineseName:'string',
				className:'string',
				isHaveChineseName:'boolean',
				variableType:'string',
				gid:'string',
			};
			var xmmapJson = $.extend(true,{},sourceXmmapJson);
			function addAttr(fieObj,newObj){
				for(var fieName in fieObj){
					if(fieldAttrJson[fieName] == typeof(fieObj[fieName])){
						newObj[fieName] = fieObj[fieName];
					}
				}
			}
			function setNspro(_xmmapJson,fullJson,parent){
				for(var name in _xmmapJson){
					switch(parent){
						case 'fieldControl':
							var formatFieldDate = nsComponentEditor.getFormatData(_xmmapJson[name]);
							var formatXmlField = {};
							var textName = name;
							if(typeof(_xmmapJson[name].englishName)=='string'){
								textName = _xmmapJson[name].englishName + '\n' + _xmmapJson[name].chineseName;
							}else{
								if(chineseNameJson[textName]){
									textName += '\n' + chineseNameJson[textName];
								}
							}
							fullJson[name] = {
								_nsproperty:{
									text:textName,
								}
							}
							// 判断表格表单
							switch(formatFieldDate.displayType){
								case 'all':
									addAttr(formatFieldDate.form,formatXmlField);
									addAttr(formatFieldDate.table,formatXmlField);
									break;
								case 'table':
									formatXmlField['只显示在表格'] = {};
									addAttr(formatFieldDate.table,formatXmlField);
									break;
								case 'form':
									formatXmlField['只显示在表单'] = {};
									addAttr(formatFieldDate.form,formatXmlField);
									break;
							}
							if($.isEmptyObject(formatXmlField)){
								formatXmlField = _xmmapJson[name];
							}
							for(var attr in formatXmlField){
								fullJson[name][attr] = formatXmlField[attr];
							}
							break;
						default:
							switch(name){
								case 'fields':
									fullJson.fields = {
										_nsproperty:{
											text:'fields\n基本字段',
										}
									};
									fullJson.fields.fieldBusiness = {
										_nsproperty:{
											text:'fieldBusiness\n业务字段',
										}
									}
									fullJson.fields.fieldVisual = {
										_nsproperty:{
											text:'fieldVisual\n显示字段',
										}
									}
									fullJson.fields.fieldControl = {
										_nsproperty:{
											text:'fieldControl\n操作字段',
										}
									}
									setNspro(_xmmapJson.fields,fullJson.fields.fieldControl,'fieldControl');
									break;
								case 'state':
									fullJson.state = {
										_nsproperty:{
											text:'state',
										}
									};
									var voStateAttr = statesNameJson[parent];
									for(var stateName in _xmmapJson[name]){
										var stateAttr = voStateAttr[stateName];
										fullJson.state[stateName] = {
											_nsproperty:{
												text:stateAttr.englishName+'\n'+stateAttr.chineseName,
											}
										}
										setNspro(_xmmapJson.state,fullJson.state,stateName);
									}
									break;
								case 'controller':
									fullJson.function = {
										_nsproperty:{
											text:'function',
										}
									};
									setNspro(_xmmapJson.controller,fullJson.function,name);
									break;
								case 'tabs':
									var tabsJson = {};
									for(var fieldName in _xmmapJson[name]){
										if(typeof(tabsJson[_xmmapJson[name][fieldName].mindjetTabNamePosition])!='object'){
											tabsJson[_xmmapJson[name][fieldName].mindjetTabNamePosition] = {
												name:_xmmapJson[name][fieldName].mindjetTabName,
												field:{},
											};
										}
										tabsJson[_xmmapJson[name][fieldName].mindjetTabNamePosition].field[fieldName] = _xmmapJson[name][fieldName];
									}
									for(var tabNum in tabsJson){
										fullJson['tab'+tabNum] = {
											_nsproperty:{
												text:'tab'+tabNum+'\n'+tabsJson[tabNum].name,
											}
										}
										setNspro(tabsJson[tabNum].field,fullJson['tab'+tabNum],tabNum);
									}
									break;
								default:
									if(typeof(_xmmapJson[name])=='object'){
										var textName = name;
										if(typeof(_xmmapJson[name].englishName)=='string'){
											textName = _xmmapJson[name].englishName + '\n' + _xmmapJson[name].chineseName;
										}else{
											if(chineseNameJson[textName]){
												textName += '\n' + chineseNameJson[textName];
											}
										}
										fullJson[name] = {
											_nsproperty:{
												text:textName,
											}
										}
										setNspro(_xmmapJson[name],fullJson[name],name);
									}else{
										fullJson[name] = _xmmapJson[name];
									}
									break;
							}
							break;
					}
					
				}
			}
			setNspro(xmmapJson,xmmapFullJson,'');
			return xmmapFullJson;
		},
		//返回dialog弹框的字段值，没有赋值
		//return array[{}] 字段值
		getFormField:function(type){
			var _this = this;
			var fieldArray = [
				{
					id: 		'selectvo',
					label: 		'选择数据源',
					type: 		'select2',
					column:		6,
					textField: 	this.server.voSourceListAjax.textField,  //'name',
					valueField: this.server.voSourceListAjax.valueField, //'url',
					url: 		this.server.voSourceListAjax.url,
					method: 	this.server.voSourceListAjax.type,
					dataSrc: 	this.server.voSourceListAjax.dataSrc,
					changeHandler:function(value){
						//选取VO列表
						if(value!=''){
							// var url = getRootPath() +'/'+ value;
							if(value.indexOf('/') == 0){
								var url = getRootPath() + value;
							}else{
								var url = getRootPath() +'/'+ value;
							}
							nsForm.fillValues({vourl:url}, _this.config.id);
							_this.setButtonState('get');
						}else{
							nsForm.fillValues({vourl:url}, '');
							_this.setButtonState('none');
						}
					}
				},{
					id: 		'vourl',
					label: 		'数据源地址',
					type: 		'text',
					placeholder: 'http:// ',
					rules:'required',
					readonly:true,
				}
			]
			switch(type){
				case 'add':
					fieldArray.push({
						id:"intro",
						label:"导入数据情况",
						height:160,
						readonly:true,
						type:"textarea"
					});
					break;
				case 'edit':
					fieldArray.push({
						id:"remark",
						label:"备注",
						height:260,
						readonly:true,
						type:"textarea"
					});
					fieldArray.push({
						id:'id',
						type:'hidden'
					})
					break;
			}
			return fieldArray;
		},
		//设置按钮是否禁用
		setButtonDisabled:function(disableArray){
			//disableArray：array [true,false,false] 最后一个按钮（取消）不能设置
			var $btns = $('#'+this.config.id+' .modal-footer button');
			for(var i = 0; i<$btns.length-1; i++){
				//默认为false 不禁用
				var isDisable = typeof(disableArray[i])=='boolean'?disableArray[i]:false;
				$btns.eq(i).attr('disabled', isDisable);
			}
		},
		//按钮状态 get/save/all/none
		setButtonState:function(stateName){
			//stateName : string 按钮状态 get/save/all/none
			switch(stateName){
				case 'get':
					//可获取数据的状态
					this.setButtonDisabled([false, true, true, true]);
					break;
				case 'save':
					//可保存数据的状态
					this.setButtonDisabled([true, false, false, true]);
					break;
				case 'saved':
					//保存完数据的状态
					this.setButtonDisabled([true, true, false, false]);
					break;
				case 'all':
					//全部可用
					this.setButtonDisabled([false, false, false, false]);
					break;
				case 'none':
					//全部不可用
					this.setButtonDisabled([true, true, true, true]);
					break;
			}
		},
		//新增弹框
		add:function(listTableId){
			this.type = 'add';
			var config = $.extend(true, {}, dialogForImport.config);
			config.form = dialogForImport.getFormField('add');
			nsdialog.initShow(config);
			this.setButtonState('none');
		},
		//编辑弹框
		edit:function(values){
			this.type = 'edit';
			var config = $.extend(true, {}, dialogForImport.config);
			config.form = dialogForImport.getFormField('edit');
			//如果曾经导入过，则显示导入地址
			var remarkStr = values.remark;
			if(remarkStr.indexOf('VO导入')>-1){
				var voStr = '';
				voStr = remarkStr.substring(remarkStr.indexOf('VO导入')+5);
				voStr = voStr.substring(0, voStr.indexOf('\r'));
				values.selectvo = voStr;
				values.vourl = getRootPath()+'/'+voStr;
			}

			nsForm.resetValues(values, config);
			nsdialog.initShow(config);
			this.setButtonState('get');
		}
	}
	//导入弹框 end 	 ----------------------------------------------------------------
	//VO数据源处理 start ------------------------------------------------------------
	var voManager = {
		//主要变量
		formatXMLJson:{},  //复杂的JSON，带中英文
		server:{
			voSourceAjax:{}
		},
		vosDetailJson:{}, //
		//初始化方法
		init:function(){
			this.server.voSourceAjax = config.voSourceAjax;
		},
		//获取服务器端VO数据描述
		getVOSourceByUrl:function(url, callbackFunc){
			var _this = this;
			// var ajaxConfig = {
			// 	url:url,
			// 	type:_this.server.voSourceAjax.type,
			// 	dataSrc:'',
			// }
			var ajaxConfig = {
				url:url,
				type: _this.server.voSourceAjax.type,
				success:function(res){
					var formatJson = getFormatJsonByVoRes(res);
					_this.vosDetailJson = voResManager.getFormatArray(res);
					if(typeof(formatJson)=='object'){
						nsAlert('数据获取成功','success');
						_this.formatXMLJson = formatJson;
						//设置弹框按钮为保存状态
						dialogForImport.setButtonState('save');
						var xmmapJsonName = formatJson.englishName;
						// 第一次到导入
						if(nsForm.data.voImportDialog.formInput.intro){
							var voNum = 0;
							var methodNum = 0;
							for(var i=0;i<_this.vosDetailJson.length;i++){
								if(_this.vosDetailJson[i].category == 'vo'){
									voNum++;
								}else{
									methodNum++;
								}
							}
							var hasDataStr = '生成json名：'+xmmapJsonName+'\n'+'vo：'+voNum+'个\n'+'method：'+methodNum+'个';
							nsForm.edit([{id:'intro',value:hasDataStr}],'voImportDialog');
						}
						if(typeof(callbackFunc)=='function'){
							callbackFunc(res);
						}

					}else{
						_this.formatXMLJson = {};
					}					
				},
				error:function(error){
					nsVals.defaultAjaxError(error);
				}
			}
			//读取 Authorization 并添加到headers 如果已经过期了则报错退出
			var authorization = NetStarUtils.OAuthCode.get();
			if(authorization == false && typeof(NetstarHomePage) == 'object'){
				if(NetstarHomePage.config.isUseToken === false){
					//不使用token
				}else{
					//没有合法的token信息 重新登录
					console.error('无法获取到token，重新登陆')
					NetStarUtils.OAuthCode.reLogin();
					return false;
				}
			}
			if(authorization){
				if(typeof(ajaxConfig.header) != 'object'){
					ajaxConfig.header = {};
				}
				ajaxConfig.header.Authorization = authorization;
			}
			if (ajaxConfig.header) {
				ajaxConfig.beforeSend = function (request) {
					$.each(ajaxConfig.header, function (key, value) {
						//ajaxConfig.header:object  {{data_auth_code: "1%2TESTCODE==/&;&"}, key:'value'}
						request.setRequestHeader(key, value);
					})
				}
			}
			$.ajax(ajaxConfig);
		},
		//保存数据
		saveAjax:function(_formatXMLJson, values){
			var _this = this;
			//values:object 
			var formatXMLJson = _formatXMLJson;
			var saveData = {};
			//初始化
			nsMindjetToJS.initByVoSource(formatXMLJson);
			var sourceJson = this.getClearSourceJSON(nsMindjetToJS.sourceJSJson);
			saveData = {
				name:formatXMLJson.englishName,
				jsonContent:JSON.stringify(sourceJson),  		//sourceJSON
				originalContent:JSON.stringify(resVoFields), 	//fields
				xmlContent:this.getMindJetXMLByFormatXMLJson(formatXMLJson),
			}
			saveData.remark = nsProjectPagesManager.pages.voList.voDataManager.getRemark({
				chinese:formatXMLJson.chineseName,
				english:formatXMLJson.englishName,
				source:'VO导入 '+values.selectvo,
				remark:values.remark
			});
			//如果有id 则是修改
			if(typeof(values.id)!='undefined'){
				saveData.id = values.id;
			}
			//saveData是主表 voMapList的数据
			// _this.vosDetailJson 是详表数据 voMap的vo和method
			nsProjectPagesManager.pages.voList.voMapManager.save(saveData, _this.vosDetailJson, function(res){
				// console.log(res);
				//按钮设为禁用
				dialogForImport.setButtonState('saved');
			});
			return;
			//保存数据
			nsProjectPagesManager.pages.voList.voDataManager.saveAjaxHander(saveData, function(res){
				//刷新列表
				dialogForImport.setButtonState('saved');
				var mindMapId = res.data.id;
				//主表保存完保存详细
				_this.saveDetailAjaxList(_this.vosDetailJson, mindMapId, function(saveRes){
					//详细保存完重新获取子表数据、
					nsProjectPagesManager.pages.voList.listTable.refresh(mindMapId);
					//_this.getVosDetailByMindMapId
				});
				
			})
		},
		//获取子表的数据
		getVosDetailByMindMapId:function(mindMapId){
			nsProjectPagesManager.pages.voList.voDataManager.saveVosDetailAjaxListHander(mindMapId, function(res){
				//成功了才回调
				if(res.success){
					if(typeof(callbackFunc)=='function'){
						callbackFunc(res);
					}
				}
			});
		},
		//批量保存VO和method
		saveDetailAjaxList:function(saveData, mindMapId, callbackFunc){
			var _this = this;
			//补充mindMapId 到每一条数据
			for(var i = 0; i<saveData.length; i++){
				saveData[i].mindMapId = mindMapId;
			}
			nsProjectPagesManager.pages.voList.voDataManager.saveVosDetailAjaxListHander(saveData, function(res){
				//成功了才回调
				if(res.success){
					if(typeof(callbackFunc)=='function'){
						callbackFunc(res);
					}
				}
			});
		},
		//导出思维导图  另存为xampp文件 必须先获取到formatXMLJson
		exprotMindjetXML:function(_formatXMLJson){
			if(typeof(_formatXMLJson)!='object' || $.isEmptyObject(_formatXMLJson)){
				nsalert('请先选择VO数据源并导入输入','error');
				return;
			}
			//获取XML
			var xml = this.getMindJetXMLByFormatXMLJson(_formatXMLJson);
			var fileName = _formatXMLJson.chineseName +'-'+ moment().format('YYYY.MM.DD');
			this.outputMindjetXML(fileName, xml);
		},
		//获取导出思维导图的XML
		getMindJetXMLByFormatXMLJson:function(_formatXMLJson){
			var outputXMLJson = {};
			//递归生产没有parent属性的object
			var formatXMLJson = _formatXMLJson;
			if(typeof(formatXMLJson)!='object' || $.isEmptyObject(formatXMLJson)){
				nsalert('请先选择VO数据源并导入输入','error');
				return;
			}
			//如果是复杂对象则继续递归，简单对象复制
			function getJsonData(_formatObj, _outputObj){
				for(key in _formatObj){
					switch(typeof(_formatObj[key])){
						case 'object':
							//parent会导致无法重复指向需要先删除
							if(key!='parent'){
								_outputObj[key] = {};
								getJsonData(_formatObj[key], _outputObj[key]);
							}
							break;
						case 'function':
							//不应该有此类型数据
							console.warn('function?');
							break;
						default:
							_outputObj[key] = _formatObj[key];
							break;
					}
					
				}
			}
			getJsonData(formatXMLJson, outputXMLJson);
			//获取XML
			var xml = nsMindjetToJSTools.getMindjetXMLByJson(outputXMLJson);
			return xml;
		},
		//另存思维导图XML(.xmapp)
		//导出数据为mindjetXML格式，直接另存为
		outputMindjetXML:function(fileName, xml){
			if(debugerMode){
				var validArr =
				[
					['fileName', 'string', true], //文件名称
					['xml', 'string', true], //xml 文本
				]
				isValid = nsDebuger.validParameter(validArr);
			}
			var base64data = "base64," + $.base64.encode(xml);
			nsVals.downloadFile(fileName+'.xmmap', 'data:application/xml;filename=exportData;' + base64data);
		},
		//获取干净的SourceJSON 去掉多余的_nsproperty;
		getClearSourceJSON:function(_sourceJSJson){
			var jsonName = nsMindjetToJS.formatXMLJson.englishName;
			_sourceJson = _sourceJSJson[jsonName];
			var sourceJson = $.extend(true, {}, _sourceJson);
			for(var key in _sourceJson){
				if(nsMindjetToJS.getTags().businessFilterToSystem.indexOf(key)==-1){
					//非系统自带的VO里有多余的_nsproperty属性
					delete sourceJson[key].state.defalut._nsproperty
					$.each(sourceJson[key].state.defalut.field, function(key,value){
						delete value._nsproperty;
					})
				}
			}
			//sourceJson[jsonName] = sourceJson;
			var resultJson = {};
			resultJson[jsonName] = sourceJson;
			return resultJson;
		},
	}
	//voMap res 数据源处理器 start ----------------------------------------------------------------
	var voResManager = {
		specialParamsNames:['id','ids'],
		//获取格式化后的数组
		getFormatArray:function(res){
			var _this = this;
			//先转成json {voname:{fields:[], methods:[]}
			//先处理成JSON再处理成数组
			var allDataJson = this.getAllDataJSON(res);
			// 使用的RequestBody方式传参。
			// {
			// 	Long   id;
			// 	Long   mindMapId;
			// 	Long   parentId;
			// 	String name;
			// 	String category;
			// 	String originalContent;
			// 	String processContent;
			// 	String config;
			// 	String config2;
			// 	String config3;
			// 	String remark;
			// }
			var saveArray = [];
			var methodsNameArray = [];
			$.each(allDataJson.vos, function(voNameKey,voDataValue){
				var methodNum = 0;
				for(var methodI = 0; methodI<voDataValue.methods.length; methodI++){
					var methodData = voDataValue.methods[methodI];
					//判断是否有重复的名称
					if(methodsNameArray.indexOf(methodData.englishName) == -1){
						methodNum++;
						methodsNameArray.push(methodData.englishName);
						var methodSaveJson = {
							name:methodData.englishName,
							category:'method',
							remark:methodData.chineseName,
							originalContent:methodData,
							//第一次导入则默认存入原始的解析数据
							processContent:methodData,
						}
						saveArray.push(methodSaveJson);
					}
				}
				// 根据variableType判断字段是否正确
				var formatVoDataValueFields = [];
				for(var fieI=0;fieI<voDataValue.fields.length;fieI++){
					switch(voDataValue.fields[fieI].variableType){
						case 'boolean':
						case 'date':
						case 'string':
						case 'number':
							formatVoDataValueFields.push(voDataValue.fields[fieI]);
							break;
						default:
							break;
					}
				}
				var voFieldNum = formatVoDataValueFields.length;
				//备注
				var remarkStr = voFieldNum + '个字段/' + methodNum+'个关联方法';
				//默认状态（全部）
				var defalutState = 
				{
					englishName:'defalut',
					chineseName:'默认全部字段',
					voName:voNameKey,
					gid:nsTemplate.newGuid(),
					// field:_this.getStateFromVOData(voDataValue.fields),
					field:_this.getStateFromVOData(formatVoDataValueFields),
				}
				//保存用的数据
				var voSaveData = {
					name:voNameKey,
					remark:remarkStr,
					category:'vo',
					originalContent:{
						fields:voDataValue.fields,
						states:[defalutState],
					},
					//第一次导入则默认存入原始的解析数据
					processContent:{
						// fields:voDataValue.fields,
						fields:formatVoDataValueFields,
						states:[defalutState],
					}
				};
				saveArray.push(voSaveData);
			})
			return saveArray;
		},
		//获取全部数据的JSON对象
		getAllDataJSON:function(res){
			var _this = this;
			var allDataJson = {};
			allDataJson.name = res.mapping.value[0]; 	//名称
			//方法中指向的VO才是有效VO
			var methodVoMap = this.getMethodVoMap(res);
			console.warn(res);
			console.warn(methodVoMap);
			//方法指向的VO中可能包含没有方法指向的VO，而该VO在字段中有指向
			var fieldVoMap = this.getFieldVoMap(res, methodVoMap);
			// 合并通过方法获得的vo和通过字段获得的vo
			for(var voName in fieldVoMap){
				methodVoMap[voName] = fieldVoMap[voName];
			}
			var vos = {};
			$.each(methodVoMap, function(voName, voMethodArray){
				if(typeof(vos[voName])=='undefined'){
					vos[voName] = {
						methods:[],
						fields:[],
					};
				}
				var methodArray = [];
				//生成方法数据
				for(var voMethodI = 0; voMethodI<voMethodArray.length; voMethodI++){
					var methodData = _this.getMethodData(voMethodArray[voMethodI], voName, res)
					methodArray.push(methodData);
				}
				vos[voName].methods = methodArray;

				//生成字段数据
				var voFieldArray = _this.getFieldsIncludeParent(voName, res);
				var fieldArray = [];
				var errorChineseNameArray = [];
				var chineseNameArray = [];
				for(var voFieldI = 0; voFieldI<voFieldArray.length; voFieldI++){
					var fieldData = _this.getFieldData(voFieldArray[voFieldI], voName, res);
					//如果没有中文则集中提示
					if(fieldData.isHaveChineseName == false){
						errorChineseNameArray.push(fieldData.englishName);
					}
					fieldArray.push(fieldData);
				}
				if(errorChineseNameArray.length>0){
					var errorNames = errorChineseNameArray.toString();
					_this.errorInfo(voName+'（共'+voFieldArray.length+'个字段）的'+errorChineseNameArray.length+'个字段'+errorNames + '没有获取到中文名称', res.voMap[voName]);
				}
				
				vos[voName].fields = fieldArray;

				allDataJson.vos = vos; 
			})
			return allDataJson;
		},
		//根据res返回有效的并且整合过VoMap 没有方法指向的不需要
		getMethodVoMap:function(res){
			//获取所有的VO的
			var voMapAll = {};
			$.each(res.voMap, function(voName,voValue){
				voMapAll[voName] = voValue;
			});
			//然后获取所有方法中回调有效的Vo
			var methodVos = {}; //方法中使用到的VO
			var paramsVos = {};

			//整理方法分类，按照返回VO分类
			for(var methodI = 0; methodI<res.methods.length; methodI++){
				var methodName = res.methods[methodI].name;
				//查找返回结果中的VO
				var methodReturnInfoObj = res.methods[methodI].returnInfo;
				if(methodReturnInfoObj.view == true){
					//返回结果是页面的跳过 该类方法在模板页中无效
					continue;
				}else{
					//判断方法返回值是否是已经定义的VO
					var returnVoName = methodReturnInfoObj.className;
					var voName = 'common';
					if(typeof(voMapAll[returnVoName])=='undefined'){
						console.warn('无法识别返回VO的方法：'+methodName);
						console.warn(methodReturnInfoObj);
					}else{
						//有返回对象的方法，以VO分类记录方法
						var validVoNameRex = /\<(\S*)\>/;
						var isTrueVoName = validVoNameRex.test(returnVoName);
						if(isTrueVoName){
							voName = returnVoName.match(/\<(\S*)\>/)[1];
						}else{
							// voName = 'other';
							console.warn('没有指定方法所在vo');
							console.warn(methodReturnInfoObj);
							continue;
						}
					}
					// <>中的vo不存在
					if(typeof(voMapAll[voName])=='undefined'){
						console.warn('无法识别返回VO的方法：'+methodName);
						console.warn(methodReturnInfoObj);
						continue;
					}
					//如果没有该VO则建立数组，存储VO
					if(typeof(methodVos[voName])=='undefined'){
						methodVos[voName] = [];
					}
					// methodVos[voName].push(res.methods[methodI]);
					if(res.voMap[voName]){
						methodVos[voName].push(res.methods[methodI]);
						continue;
					}else{
						console.warn('方法指向的vo:'+voName+'不存在');
						console.warn(res.methods[methodI]);
						continue;
					}
				}

				// 代码暂时没用了
				// 查找入参中的VO
				if(res.methods[methodI].params.length != 1 ){
					//如果长度不是1 则不可能是入参为JSON 也就不可能是VO
					continue;
				}else{
					params = res.methods[methodI].params[0];
					//如果是简单对象 不是VO
					if(params.simpleType){
						continue;
					}else{
						//是复杂对象 可能是VO了
						var paramsVoName = params.className;
						//如果能找到才是真正的VO相关入参
						if(typeof(voMapAll[paramsVoName])=='object'){
							if(typeof(paramsVos[paramsVoName])=='undefined'){
								paramsVos[paramsVoName] = [];
							}
							paramsVos[paramsVoName].push(res.methods[methodI]);
						}else{
							//暂不清楚这种情况怎么处理 没有遇到
						}
					}
				}
			}
			// 代码暂时没用了
			// 对结果进行合并计算
			for(var paramVoName in paramsVos){
				if(typeof(methodVos[paramVoName])!='object'){
					//如果返回方法中没有则需要添加
					methodVos[paramVoName] = paramsVos[paramVoName]
				}else{
					//已经有了就不用添加了 是入参和出参共用的VO 把入参关联方法加入进去
					
					//先组织判断是否包含的数组
					var mehthodsVoNames = [];
					for(var methodI = 0; methodI<methodVos[paramVoName].length; methodI++){
						mehthodsVoNames.push(methodVos[paramVoName][methodI].name);
					}

					//判断该方法是否已经包含在VO里
					for(var i = 0; i<paramsVos[paramVoName].length; i++){
						if(mehthodsVoNames.indexOf(paramsVos[paramVoName][i].name) == -1){
							methodVos[paramVoName].push(paramsVos[paramVoName][i]);
						}else{
							//已经有了
						}
					}

				}
			}
			return methodVos;
		},
		//根据field查找有关VO
		getFieldVoMap:function(res, methodVoMap){
			var fieldVoMap = {};
			for(var key in methodVoMap){
				fieldVoMap[key] = false;
			}
			function getVoMap(methodVoFields){
				if(typeof(methodVoFields)!='object'){
					//不知道啥意思，先放着
				}else{
					for(var fieldI=0;fieldI<methodVoFields.length;fieldI++){
						switch(methodVoFields[fieldI].className){
							case 'java.util.List':
								if($.isArray(methodVoFields[fieldI].actualClassNames)){
									var voFullName = methodVoFields[fieldI].actualClassNames[0];
								}else{
									break;
								}
								if(typeof(res.voMap[voFullName])=='object'){
									if(typeof(fieldVoMap[voFullName])=='undefined'){
										fieldVoMap[voFullName] = {};
										_methodVoFields =  res.voMap[voFullName].fields;
										getVoMap(_methodVoFields);
									}else{
										break;
									}
								}
								break;
						}
					}
				}

			}
			$.each(fieldVoMap, function(key,value){
				var methodVoFields = res.voMap[key].fields;
				getVoMap(methodVoFields);
			})
			// console.log(fieldVoMap);
			for(var voName in fieldVoMap){
				if(fieldVoMap[voName] == false){
					delete fieldVoMap[voName];
				}
			}
			return fieldVoMap;
		},
		//根据VO获取方法数据
		getMethodData:function(resMethodData, voName, res){
			/** 	{
			 *		name: "main" 	string 方法名称
			 * 		apiInfo:{ value:"客户管理界面" } 	中文名称，可能不存在
			 *		mapping:{
			 *			methods:["GET"],  					方法 ["GET","POST"]
			 *			value:["/getSupplierSelectorList"]  方法名称
			 *		}
			 *		params:[{ 								该属性如果是空数组 ，传值方式则为normal
			 * 			className:''						如果className为long 则为id， 如果是string，则为ids
			 *			paramType:"BODY",  					如果是BODY, 且className存在于VO中，传值方式等于object
			 * 												
			 *		}]
			 *		returnInfo:{
			 *			className:"com.netstar.response.ObjectResponse<com.netstar.erpcrm.vo.CustomerVo>"  方法返回的数据
			 *			responseBody:true  					是否返回vo
			 * 			view:false  						是否页面，如果是true，则用于跳转页面，暂不处理跳转页面的请求
			 *		}
			 * 	}
			 **/
			//resMethodData.apiInfo 中的信息是有可能不存在的信息需要处理
			var _this = this;
			//方法错误提示信息
			function methodErrorInfo(errorStr){
				_this.errorInfo(errorStr, resMethodData);
			}
			//方法中文名称 默认为英文名称
			var chineseNameStr = resMethodData.name;  
			if(typeof(resMethodData.apiInfo)=='object'){
				//apiInfo的信息可能不全
				if(typeof(resMethodData.apiInfo.value)=='string'){
					chineseNameStr = resMethodData.apiInfo.value;
				}else{
					methodErrorInfo('无法找到方法中文名:'+resMethodData.name);
				}
			}else{
				methodErrorInfo('无法找到方法中文名:'+resMethodData.name);
			}

			//dataFormat id/ids/object/common
			//contentType  application/json 和 （默认）application/x-www-form-urlencoded;
			var contentType = 'application/x-www-form-urlencoded'; //默认
			var dataFormatStr = 'object'; 							//dataFormat  string id/ids/object
			var ajaxParamsSourceVo = ''; 							//该参数是否来源于VO 如果为空则不是来源于VO
			var ajaxDataParams = ''; 								//ajaxData的参数字符串 例如 '{"customerId":"{customerId}"}''
			var ajaxDataVaildConfig = ''; 							//ajaxData的参数验证类型 例如'required'或者'{"customerId":"number required","customerName":"string"}}'
			var params = [];
			for(var paramKey in resMethodData.params){
				//权限码不影响参数类型 或者其他特定参数
				if(paramKey != 'data_auth_code'){
					params.push(resMethodData.params[paramKey]);
				}
			}
			//如果参数长度是1，则有可能包含VO或者特定参数，如果长度大于1，则只能是特定参数
			if(params.length == 1){
				var paramsClassName = params[0].className;
				var paramName = params[0].name; //
				if(params[0].paramType == 'BODY'){
					//如果是body 则contentType = 'application/json' 需要先编译JSON到字符串
					contentType = 'application/json';
					//该类型dataFormat是object 
					dataFormatStr = 'object';
					ajaxParamsSourceVo = paramsClassName;
					ajaxDataParams = '';
					ajaxDataVaildConfig = params[0].required ? 'required':''; //这种情况下只有是否必填的问题 目前没发现非必填的					
				}else{
					contentType = 'application/x-www-form-urlencoded';
					var isVoClass = typeof(res.voMap[paramsClassName]) == 'object'; //如果className是Vo中的名字，则是指向VO的所有参数都可用
					if(isVoClass){
						//如果入参是VO，则不用定义名称，也没有特殊名称
						dataFormatStr = 'object';
						ajaxParamsSourceVo = paramsClassName;
						ajaxDataParams = '';
						ajaxDataVaildConfig = params[0].required ? 'required':''; //这种情况下只有是否必填的问题 目前没发现非必填的	
					}else{
						//如果不是VO里的则是需要定义的参数名称的方法
						
						
						//如果参数名是id或ids等特殊单词，则同时也是dataFormat,不需要特定的ajaxData参数
						if(_this.specialParamsNames.indexOf(paramName) > -1){
							//预定义的dataFormat
							dataFormatStr = paramName;
							ajaxParamsSourceVo = '';
							ajaxDataParams = '';
							ajaxDataVaildConfig = params[0].required ? 'required':''; //这种情况下只有是否必填的问题 目前没发现非必填的	
						}else{
							//如果是合法的参数则自动生成ajaxData {customerName:"{customerName}"};
							dataFormatStr = 'object';
							ajaxParamsSourceVo = '';
							ajaxDataParams = '{"'+paramName+'":"{'+paramName+'}"}';
							//验证条件 是否验证 以及验证方式 例如 {"customerId":"required number"}
							//是否是合法的参数
							var isValidName = _this.isValidParamsName(paramName, resMethodData);
							if(isValidName){
								var validJson = {};
								var requiredStr = params[0].required ? 'required ':'';
								var paramsJSType = getJSVariableType(params[0].className);
								validJson[paramName] = requiredStr + paramsJSType;
								ajaxDataVaildConfig = JSON.stringify(validJson);
							}
						}
					}
				}
			}else{
				//长度超过1的只能是自定义格式，不能使复杂对象和标准的dataFormat 可能 例外是childids
				var isAllValid = true;
				var validJson = {};
				var ajaxDataJson = {};
				if(params[0] && params[0].paramType == 'BODY'){
					//如果是body 则contentType = 'application/json' 需要先编译JSON到字符串
					contentType = 'application/json';
				}
				for(var paramI = 0; paramI<params.length; paramI++){
					var paramName = params[paramI].name;
					//是否是合法的参数 只要有一个参数不合法就全不合法
					var isValidName = _this.isValidParamsName(paramName, resMethodData);
					if(isValidName == false){
						isAllValid = false;
					}
					var requiredStr = params[paramI].required ? 'required ':'';
					var paramsJSType = getJSVariableType(params[paramI].className);
					validJson[paramName] = requiredStr + paramsJSType;
					ajaxDataJson[paramName] = '{'+paramName+'}';
				}
				dataFormatStr = 'object';
				ajaxParamsSourceVo = '';
				//验证成功才能输出验证字符串，不然会出现不该有的验证
				if(isAllValid){
					ajaxDataVaildConfig = JSON.stringify(validJson);
				}
				ajaxDataParams = JSON.stringify(ajaxDataJson);
			}
			

			//根据返回数据类型确定dataSrc //"com.netstar.response.ObjectResponse<com.netstar.crm.vo.CustomerVo>"
			var dataSrcStr = resMethodData.returnInfo.className; 		
			//包含ObjectResponse 则为data,  包含ListResponse则为rows
			if(dataSrcStr.search(/ObjectResponse/)>-1){
				dataSrcStr = 'data';
			}else if(dataSrcStr.search(/ListResponse/)>-1){
				dataSrcStr = 'rows';
			}else{
				dataSrcStr = '';
				methodErrorInfo('不能识别返回DataSrc的方法:'+resMethodData.name);
			}

			//获取文件后缀
			var voSuffix = res.mapping.value[0];
			//服务器端传过来的URL有两种形式 /org/main 或者 org/main/ 需要在前面或者后面加'/'  最终结果输出 /path/path/  cy190620
			//前面没有在前面加
			var firstWord = voSuffix.substr(0,1);
			if(firstWord != '/'){
				voSuffix = '/' + voSuffix;
			}
			//后面没有在后面加
			var lastWord = voSuffix.substr(voSuffix.length -1 , 1);
			if(lastWord != '/'){
				voSuffix = voSuffix + '/';
			}

			//获取API名称
			var apiNameStr = resMethodData.mapping.value[0];
			//服务器端传过来的URL有两种形式 /getById 或者 getById 统一去掉'/'  最终结果输出 getById  cy190621
			//前面没有在前面加
			var firstApiNameStr= apiNameStr.substr(0,1);
			if(firstApiNameStr == '/'){
				apiNameStr = apiNameStr.substr(1);
			}

			var urlSuffixStr = voSuffix + apiNameStr;

			
			
			//console.warn('urlSuffixStr:'+urlSuffixStr);

			var formatData = {
				englishName: 	resMethodData.name, 				//显示的英文名称
				chineseName: 	chineseNameStr, 					//显示的中文名称
				dataFormat: 	dataFormatStr,						//dataFormat id/ids/object/
				dataSrc: 		dataSrcStr, 						//dataSrc rows/data
				suffix: 		urlSuffixStr, 						//url后缀，不包括域名
				type: 			resMethodData.mapping.methods[0], 	//ajax.type GET/POST
				contentType: 	contentType, 						//ajax.contentType  application/x-www-form-urlencoded application/json
				ajaxData: 		ajaxDataParams,						//ajax.data 默认为'', 也可能是格式化的{"cid":"{cid}"}
				ajaxDataVaildConfig:ajaxDataVaildConfig, 			//验证字符串 required 或者 {"customerId":"number"} {"customerId":"required number"}
				voName:voName, 										//所属VO的名字
			};
			if(resMethodData.mapping.methods.length>1){
				formatData.type = 'POST';
				formatData.OtherType = 'GET,POST';
			}
			return formatData;
		},
		//获取完整的field字段，综合ParentClassName之后
		getFieldsIncludeParent:function(voName, res){
			var fieldArray = [];
			var voNameArray = [];
			function getParentField(_voName){
				//防止互相喂父子关系 用voName数组防止互相
				if(voNameArray.indexOf(_voName)>-1){
					//console.warn(voName+ ' '+_voData.parentClassName)
					return;
				}else{
					voNameArray.push(_voName);
				}
				var _voData = res.voMap[_voName];
				if(_voData.fields){
					fieldArray = fieldArray.concat(_voData.fields);
					if(_voData.parentClassName){
						// if(_voData.parentClassName.indexOf('.entity.') == -1){
							getParentField(_voData.parentClassName);
						// }
					}
				}
			}
			getParentField(voName);
			return fieldArray;
		},
		//获取field参数
		getFieldData:function(resFieldData, voName, res){
			var _this = this;
			var fieldData = {};
			fieldData.englishName = resFieldData.name;
			fieldData.className = resFieldData.className;
			//添加id
			fieldData.gid = nsTemplate.newGuid();
			fieldData.variableType = getJSVariableType(resFieldData.className);
			//中文名称默认为英文名称，有可能不返回中文名称
			var chineseName = fieldData.englishName;
			//是否有中文名称
			var isHaveChineseName = false;
			if(resFieldData.apiInfo){
				if(typeof(resFieldData.apiInfo.value)=='string'){
					isHaveChineseName = true;
					chineseName = resFieldData.apiInfo.value;
				}
			}
			fieldData.chineseName = chineseName;
			fieldData.isHaveChineseName = isHaveChineseName;
			return fieldData;
		},
		//判断参数名称是否合法 如果是arg0 arg1等则为未定义的
		isValidParamsName:function(paramsName, resMethodData){
			var _this = this;
			var isValid = false;
			if(/^arg/.test(paramsName) == false){
				//如果不是以arg开头，则正确
				isValid = true;
			}else{
				//排除掉开头arg看剩下的是不是数字
				var argSuffix = paramsName.substring(3);
				if(/\D/.test(argSuffix)){
					//找到非数字字符了，那就是自定义的名字
					isValid = true;
				}
			}
			//不合法则提示
			if(isValid){
				//是合法的字符 console.warn('paramName:'+paramName);
			}else{
				//不合法则提示
				var chineseName = '(中文名称未定义)';
				if(resMethodData.apiInfo){
					chineseName = '('+resMethodData.apiInfo.value+')'
				}
				var errorInfoStr = '未定义参数名称的方法：'+resMethodData.name+chineseName+', 当前参数名 '+paramsName;
				_this.errorInfo(errorInfoStr, resMethodData);
			}
			return isValid;
		},
		//error显示
		errorInfo:function(errorStr, errorObj){
			console.error(errorStr);
			console.error(errorObj)
			nsAlert(errorStr,'error');
		},
		//设置默认状态，全部field都转成defalut
		//根据字段返回状态
		getStateFromVOData:function(voFieldArray){
			var stateArray = [];
			for(var fieldI = 0; fieldI<voFieldArray.length; fieldI++){
				var voFieldData = voFieldArray[fieldI];
				var stateJson = {
					englishName:voFieldData.englishName,
					chineseName:voFieldData.chineseName,
					gid:voFieldData.gid,
					mindjetIndexState:fieldI,

				}
				stateArray.push(stateJson);
			}
			return stateArray;
		}
	}

	//格式化VO数据源的格式代码
	var formatXMLJson = {};
	var levelTags = {};
	//主要方法，输出格式处理
	function getFormatJsonByVoRes(res){
		//levelTypeTags:json 根据上级对象获取当前类型和名称
		levelTags = nsMindjetToJS.getTags().getTagTypeByParentType;
		var voIndex = 2;
		var voPathStr = res.mapping.value[0];  //vo的path路径名称
		var voMap= {};
		var voFields = {};
		//获取字段 res.voMap
		$.each(res.voMap, function(voName,voData){
			//创建VO对象
			var voMapData = {};
			voMap[voName] = voMapData;

			//创建VO对象中的field
			if(voData.fields){
				var voFieldsData = getFieldData(res, voData, [voName], {});
				//使用短名字为名称 去掉了com.netstar 和 vo.
				//var shortVoName = getShortVoName(voName);
				voFields[voName] = voFieldsData;
			}
		})
		
		//获取方法并分类整理
		var methods = {
			data:{}, 		//返回实体对象的方法
			rows:{}, 		//返回列表的方法
			all:{}, 		//全部
			page:{}, 		//跳转页面用的方法 暂时没用
			other:{}, 		//不能识别用途的方法
			vo:{}
		};

		for(var methodI = 0; methodI<res.methods.length; methodI++){
			var methodData = res.methods[methodI];
			var methodOutputData = getMethodOutputData(methodData, res);
			//跳转页面用的方法暂时不用了 所以先跳过
			if(methodData.returnInfo.view == true){
				//页面用的
				methods.page[methodOutputData.englishName] = methodOutputData;
				continue;
			}

			//有效方法
			methods.all[methodOutputData.englishName] = methodOutputData;
			
			//分别存储用于表格和表单的
			switch(methodOutputData.dataSrc){
				case 'rows':
					//用于list的 如表格
					methods.rows[methodOutputData.englishName] = methodOutputData;
					break;
				case 'data':
					//用于modal的 如form 或者业务对象
					methods.data[methodOutputData.englishName] = methodOutputData;
					break;
				default:
					//不能识别用途的方法
					methods.other[methodOutputData.englishName] = methodOutputData;
					break;
			}

			//根据vo分别存储
			var methodsVoName = methodOutputData.fieldVoName;
			if(methodsVoName){
				if(typeof(methods.vo[methodsVoName])=='undefined'){
					methods.vo[methodsVoName] = {};
				}
				methods.vo[methodsVoName][methodOutputData.englishName] = methodOutputData;
			};
		}
		
		// lyw 注：没有执行任何操作
		//查找关联关系 使用同一个VO的rows和data
		/*$.each(methods.rows, function(listMethodName,listMethodData){

			var listVoName = listMethodData.returnVoName;
			var listVoShortName = getShortVoName(listVoName);
			listVoName = listVoName.match(/\<.*?\>/)[0];
			$.each(methods.data, function(modalMethodName,modalMethodData){
				var modalVoName = modalMethodData.returnVoName;
				modalVoName = modalVoName.match(/\<.*?\>/)[0];
				//当list和modal返回方法相同，则作用于同一个业务对象，插入到该方法的child
				// if(modalVoName == listVoName){
				// 	if(typeof(listMethodData.child)=='undefined'){
				// 		listMethodData.child = [];
				// 	}
				// 	listMethodData.child.push(modalMethodData);
				// }
			});
		})*/
		//根据方法查找有效可配的VO
		var sourceVo = {
			fields:voFields,
			user:{}
		};
		$.each(res.voMap, function(voName, voDataValue){
			//如果有相关的vo则保存
			if(voName.indexOf('.vo.')>-1){
				//不能包含如下'com.netstar.response.ObjectResponse<com.netstar.sale.vo.SaleReturnVo>'
				var isResponsePatt = /\<.*?\>/;
				if(isResponsePatt.test(voName) == false){
					sourceVo.user[voName] = voFields[voName];
				}
			}
		})
		//获取标签 
		var formatJson = getFormatJsonByMethodsAndVo(res, methods, sourceVo.user);
		//设置默认状态，全部field都转成defalut
		setDefalutState(formatJson[formatJson.englishName]);
		return formatJson;
	}
	function getFormatJsonByMethodsAndVo(res, methods, vos){
		//console.log(voJson);
		var formatJson = {};

		//formatJson基本结构
		var voJson = {
			field:{
				fieldBusiness:{},
				fieldControl:{},
				fieldVisual:{},
				_nsproperty:{
					chineseName:"field",
					englishName:"基本字段",
					index:14,  //这个值需要重新赋值，其实也用不着
					level:2,
					name:"field",
					text:"数据",
					type:"field",
					typeDesc:"基本字段"
				},
			},
			function:{
				save:{},
				query:{},
				business:{},
				_nsproperty:{
					chineseName:"function",
					englishName:"基本方法",
					index:15,  //这个值需要重新赋值，其实也用不着
					level:2,
					name:"function",
					text:"方法",
					type:"function",
					typeDesc:"基本方法"
				},
			}
		};
		var projectName = res.mapping.value[0];
		projectName = projectName.replace(/\//g, '_');
		//生成基本对象
		formatJson.englishName = projectName;
		formatJson.chineseName = projectName;
		var projectJson = {};
		formatJson[projectName] = projectJson;
		projectJson._nsproperty = getNsproperty({
			chineseName:projectName,
			englishName:projectName,
			parent:formatJson,
			level:0,
			type:'root',
			typeDesc:'根',
		})
		//添加VO
		//清空初始化 resVoFields
		resVoFields = {};
		$.each(vos, function(voName, voData){
			var shortVoName = getShortVoName(voName);
			var voJson = {};
			projectJson[shortVoName] = voJson;
			var shortVoName = getShortVoName(voName);
			voJson._nsproperty = getNsproperty({
				chineseName:shortVoName,
				englishName:shortVoName,
				parent:projectJson,
				text:shortVoName,
				level:1,
			}, levelTags);
			//设置vo中的field属性
			setVoField(voJson, voData);
			//设置vo中的function属性
			setVoFunction(voJson, methods.vo[voName]);
		})
		return formatJson;
	}
	//结果中的VO字段描述
	var resVoFields = {};
	//设置field属性
	function setVoField(voJson, voData){
		//field的基本属性
		voJson.field = {
			fieldBusiness:{},
			fieldControl:{},
			fieldVisual:{},
		}
		voJson.field._nsproperty = getNsproperty({
			parent:voJson,
			type:"field",
			typeDesc:"基本字段"
		});
		//字段分类的基本属性
		$.each(voJson.field, function(key, value){
			value._nsproperty = getNsproperty({
				englishName:key,
				parent:voJson.field
			});
		});
		//原始VO
		var resFields = [];
		resVoFields[voJson._nsproperty.chineseName] = resFields;
		//处理服务器返回的字段
		$.each(voData, function(id, _fieldData){
			//保存原始字段数据
			resFields.push(_fieldData);
			var fieldData = {};
			var isVoField = true;
			switch(_fieldData.variableType){
				case 'date':
					fieldData.type = 'date';
					break;
				case 'boolean':
					fieldData.type = 'switch';
					break;
				case 'string':
					fieldData.type = 'text';
					break;
				case 'number':
					fieldData.type = 'text';
					fieldData.rules = 'number';
					break;
				case 'volist':
					isVoField = false;
					break;
				default:
					if(debugerMode){
						console.warn('不能识别的变量类型：'+_fieldData.variableType);
					}
					fieldData.type = 'text';
					break;
			}
			//获取属性值
			if(isVoField){
				fieldData._nsproperty = getNsproperty({
					englishName:_fieldData.englishName,
					chineseName:_fieldData.chineseName,
					parent:voJson.field.fieldControl
				});
				//变量类型保留
				fieldData.nsVariableType = _fieldData.variableType;
				fieldData.nsChineseName = _fieldData.chineseName;
				voJson.field.fieldControl[id] = fieldData;
			}
			
		})
	}
	//设置function属性
	function setVoFunction(voJson, voMethods){
		//当前VO没有关联的方法则不执行
		if(typeof(voMethods)=='undefined'){
			return;
		}
		//field的基本属性
		voJson.function = {
			// data:{},
			// rows:{},
		}
		voJson.function._nsproperty = getNsproperty({
			parent:voJson,
			type:"function",
			typeDesc:"基本方法"
		});

		$.each(voMethods, function(methodName, methodAttr){
			switch(methodAttr.dataSrc){
				case 'rows':
					//列表类的方法
					if(typeof(voJson.function.list)=='undefined'){
						voJson.function.list = {};
						voJson.function.list._nsproperty = getNsproperty({
							englishName:'list',
							chineseName:'列表方法',
							parent:voJson.function
						})
					}
					voJson.function.list[methodName] = methodAttr;
					break;
				case 'data':
					//实体类的方法
					if(typeof(voJson.function.modal)=='undefined'){
						voJson.function.modal = {};
						voJson.function.modal._nsproperty = getNsproperty({
							englishName:'modal',
							chineseName:'实体方法',
							parent:voJson.function
						})
					}
					voJson.function.modal[methodName] = methodAttr;
					break;
				default:
					console.error(methodAttr.dataSrc);
					break;
			}
		})
	}
	//默认属性_nsproperty
	var _nspropertyIndex = 0;
	function getNsproperty(propertyObj){
		var _nsproperty = {};
		
		_nsproperty.parent = propertyObj.parent;
		//层级 没有指定则是父对象的level + 1
		if(typeof(propertyObj.level)=='number'){
			_nsproperty.level = propertyObj.level;
		}else{
			_nsproperty.level =_nsproperty.parent._nsproperty.level + 1;
		}
		
		//索引 递增
		_nspropertyIndex++;
		_nsproperty.index = _nspropertyIndex;

		//类型和类型描述
		if(propertyObj.type){
			//如果定义了type则直接执行
			_nsproperty.type = propertyObj.type;
			_nsproperty.typeDesc = propertyObj.typeDesc;
		}else{
			//如果没有定义type 则根据parent对象的类型执行
			var parentType = _nsproperty.parent._nsproperty.type;
			var parentTypeTags = levelTags[parentType];
			_nsproperty.type = parentTypeTags[0];
			_nsproperty.typeDesc = parentTypeTags[1];
		}
		
		//如果有英文没中文，则全都是英文，如果连英文都没有，则读类型
		if(propertyObj.englishName){
			_nsproperty.englishName = propertyObj.englishName;
			if(propertyObj.chineseName){
				_nsproperty.chineseName = propertyObj.chineseName;
			}else{
				_nsproperty.chineseName = propertyObj.englishName;
			}			
		}else{
			_nsproperty.englishName = _nsproperty.type;
			_nsproperty.chineseName = _nsproperty.typeDesc;
		}

		//生成Text
		if(typeof(propertyObj.text)!='string'){
			var textStr = _nsproperty.englishName;
			if(propertyObj.englishName != propertyObj.chineseName ){
				textStr = _nsproperty.englishName + '\n' + _nsproperty.chineseName;
			}
			_nsproperty.text = textStr;
		}else{
			_nsproperty.text  = propertyObj.text;
		}

		//名称
		_nsproperty.name = _nsproperty.englishName;

		return _nsproperty;
	}
	//获取method的数据描述
	function getMethodOutputData(methodData, res){
		//获取方法 res.methods
		//res.methods[method] 是个数组 数据元素 里面包含一个string， 四个object
		/* 	{
		 *		name: "main" 	string 方法名称
		 * 		apiInfo:{ value:"客户管理界面" } 	中文名称，可能不存在
		 *		mapping:{
		 *			methods:["GET"],  					方法 ["GET","POST"]
		 *			value:["/getSupplierSelectorList"]  方法名称
		 *		}
		 *		params:[{ 								该属性如果是空数组 ，传值方式则为normal
		 * 			className:''						如果className为long 则为id， 如果是string，则为ids
		 *			paramType:"BODY",  					如果是BODY, 且className存在于VO中，传值方式等于object
		 * 												
		 *		}]
		 *		returnInfo:{
		 *			className:"com.netstar.response.ObjectResponse<com.netstar.erpcrm.vo.CustomerVo>"  方法返回的数据
		 *			responseBody:true  					是否返回vo
		 * 			view:false  						是否页面，如果是true，则用于跳转页面，暂不处理跳转页面的请求
		 *		}
		 * 	}
		 */
		var voPathStr = res.mapping.value[0];  //vo的path路径名称
		var methodOutputData = {};
		//中英文名称
		methodOutputData.englishName = methodData.name;
		methodOutputData.chineseName = methodData.name;
		//中文名称可能不存在
		if(methodData.apiInfo){
			if(methodData.apiInfo.value){
				methodOutputData.chineseName = methodData.apiInfo.value;
			}
		}

		//url 
		var methodUrl = '/' + voPathStr + methodData.mapping.value[0];
		methodOutputData.suffix = methodUrl;

		//传值方法
		var methodAjaxDataFormatType = '';
		methodAjaxDataParams = {};
		if(methodData.params.length == 0){
			//没有入参
			methodAjaxDataFormatType = 'normal';
			methodAjaxDataParams = {};
		}else{
			//根据入参类型判断
			switch(methodData.params[0].className){
				case 'java.lang.Long':
					methodAjaxDataFormatType = 'id';
					break;
				case 'java.lang.String':
					methodAjaxDataFormatType = 'ids';
					break;
				default:
					if(res.voMap[methodData.params[0].className]){
						methodAjaxDataFormatType = 'object';
					}else{
						methodAjaxDataFormatType = 'object';
						//var alertStr = '不能识别参数类型的方法:'+methodData.name;
						//nsAlert(alertStr, 'warning');
						//console.warn(alertStr);
						//console.warn(methodData);
					}
					break;
			}
			//保存入参
			for(var paramI = 0; paramI<methodData.params.length; paramI++){
				//methodAjaxDataParams[]
			}
		}
		methodOutputData.dataFormat = methodAjaxDataFormatType;

		//ajax type
		var methodAjaxType = '';
		switch(methodData.mapping.methods.length){
			case 0:
				//没有此方法的都是跳转页面用的，所以默认的GET
				methodAjaxType = 'GET';
				break;
			case 1:
				//只有一个的读取
				methodAjaxType = methodData.mapping.methods[0];
				break;
			default:
				//GET POST都支持的用POST
				methodAjaxType = 'POST';
				break;
		}
		methodOutputData.type = methodAjaxType;

		//返回VO
		methodOutputData.returnVoName = methodData.returnInfo.className;
		//dataSrc
		var methodDataSrc = '';
		if(res.voMap[methodOutputData.returnVoName]){
			var methodReturnFields = res.voMap[methodOutputData.returnVoName].fields;
			for(var mrdi = 0; mrdi<methodReturnFields.length; mrdi++ ){
				var mrdFieldName = methodReturnFields[mrdi].name
				if(mrdFieldName == 'data' || mrdFieldName == 'rows'){
					methodDataSrc = mrdFieldName;
				}
			}
			methodOutputData.dataSrc = methodDataSrc;
		}
		//获得关联的vo lyw修改跳过没有<**>的即不能识别的方法
		if(res.voMap[methodOutputData.returnVoName]){
			var isHavefieldVoName = /\<.*?\>/.test(methodOutputData.returnVoName);
			if(isHavefieldVoName){
				var fieldVoName = methodOutputData.returnVoName.match(/\<.*?\>/)[0];
				fieldVoName = fieldVoName.substring(1, fieldVoName.length-1);
			}else{
				var fieldVoName = false;
			}
			methodOutputData.fieldVoName = fieldVoName;
		}else{
			methodOutputData.fieldVoName = false;
		}
		//console.warn(methodOutputData);
		return methodOutputData;
	}
	//获取field的数据描述
	function getFieldData(res, voData, voNameArray, _voFieldsData){
		/* res  		object 数据源
		 * voFields  	array 需要提取的field数组
		 * voNameArray  array 记录子集的路径 防止重复
		 * _voFields 	object 当前字段集合
		 */

		//服务器res.voMap.{vo}.fields JSON
		/* 	{里面包含四个有效值 array
		 *		name: "contractInsuredFlag" 	string 字段名称
		 *		className:"java.util.List" 		string 代表该字段类型 
		 *		array:true 						boolean 是否数组
		 *		actualClassNames:  ["com.netstar.sale.vo.SaleDetailVo"]  
		 * 										array 只有array为true时存在，里面是另一个VO的名字代表子集
		 * 		apiInfo:{value:"中文名"}  		apiInfo.value string 中文名称
		 * 	}
		 */
		var voFieldsData = _voFieldsData;
		var voFields = voData.fields
		for(var fieldI = 0; fieldI<voFields.length; fieldI++){

			//基本属性
			var fieldData = voFields[fieldI];
			var fieldOutputData = {};
			fieldOutputData.javaDataType = fieldData.className;   	//java变量类型 比如java.lang.Integer
			fieldOutputData.englishName = fieldData.name; 		 	//名称
			fieldOutputData.chineseName = fieldData.name;
			//中文名称可能不存在，如果有则读取
			if(fieldData.apiInfo){
				if(fieldData.apiInfo.value){
					fieldOutputData.chineseName = fieldData.apiInfo.value;
				}
			}
			//console.log(fieldData);
			//数据类型
			var variableType = getJSVariableType(fieldData.className);
			if(variableType != 'none'){
				//是数据库里的字段类型 存储变量类型
				fieldOutputData.variableType = variableType;
			}else{
				//其他类型的处理
				switch(fieldData.className){
					case 'java.util.List':
						//子集处理，拼装父子关系
						fieldOutputData.variableType = 'volist';
						var _voName = fieldData.actualClassNames[0];
						if(typeof(_voName)=='undefined'){
							var voNameMethodClassName = voNameArray[0];
							var methodArr = res.methods;
							for(var methodI=0;methodI<methodArr.length;methodI++){
								console.error('方法'+methodArr[methodI].name+'的返回值定义错误');
								console.error(methodArr[methodI]);
							}
							break;
						}
						//判断是否互相包含了
						if(voNameArray.indexOf(_voName)==-1){
							//将当前数据源名称加到层次数组中，用于判断是否出现的互相包含情况
							var shortVoName = getShortVoName(_voName);
							voNameArray.push(_voName);
							// voFieldsData[shortVoName] = {};
							// fieldOutputData = [voFieldsData[shortVoName]];
							if(typeof(res.voMap[_voName]) != "undefined"){ // lyw 20190425 排除actualClassNames返回java.util.string
								fieldOutputData.list = [{nsVoName:_voName}];
								getFieldData(res, res.voMap[_voName], voNameArray, fieldOutputData.list[0]);
							}
						}else{
							//发生了VO和VO之间互相指向，已经重复了
						}
						break;
				}
			}
			voFieldsData[fieldData.name] = fieldOutputData;
		}
		//查找包含field
		if(voData.parentClassName){
			var parentClassShortName = getShortVoName(voData.parentClassName);
			var parentClassNameSuffix = parentClassShortName.substring(0, parentClassShortName.indexOf('.'));
			//console.warn('voData.parentClassName:'+voData.parentClassName);
			//排除掉基本状态参数
			if(parentClassNameSuffix == 'entity'){
				//不用处理的数据 entity
				//console.warn(voData.parentClassName);
			}else{
				if(voData.parentClassName.indexOf("java.lang")==0){
					// 不需要处理 20190221
				}else{
					getFieldData(res, res.voMap[voData.parentClassName], voNameArray, voFieldsData);
				}
			}
			
		}
		return voFieldsData
	}
	//设置默认状态，全部field都转成defalut
	function setDefalutState(vosJson){
		$.each(vosJson, function(voName, voData){
			//忽略掉'_nsproperty' 
			if(typeof(voData.field)=='object'){
				var stateJson = getStateFromVOData(voData.field);
				voData.state = {'defalut': {'field':stateJson}};
				voData.state.defalut._nsproperty = {
					englishName:'defalut',
					chineseName:'默认全部字段',
					text:'default',
				}
			}
		})
	}
	//
	function getStateFromVOData(_voFields){
		var stateJson = {};
		//按照分类循环
		$.each(_voFields, function(voClassName, voClassData){
			if(voClassName != '_nsproperty'){
				//逐个字段添加
				$.each(voClassData, function(voFieldName, voFieldData){
					if(voFieldName != '_nsproperty' && voFieldData.nsVariableType != "none"){
						stateJson[voFieldName] = {
							mindjetIndexState:voFieldData._nsproperty.index,
							_nsproperty:{
								text:voFieldData._nsproperty.englishName,
								englishName:voFieldData._nsproperty.englishName,
								chineseName:voFieldData._nsproperty.chineseName,
							}
							
						}
					}
				});
			}
		});
		return stateJson;
	}
	//获取短voName
	function getShortVoName(voNameStr){
		//voNameStr  string 例如：
		//去掉开头统一的 com.netstar.
		var shortVoName = voNameStr.replace(/com\.netstar\./, '');
		//去掉中间统一的 vo.
		shortVoName = shortVoName.replace(/vo\./, '');
		//去掉中间的. 并且后面字母大写
		var shortVoName = shortVoName.replace(
			/\.[A-Za-z]/g,
			function($1){
				var str = $1.substring(1,2);
				str = str.toLocaleUpperCase();
				return str;
			});
		return shortVoName;
	}
	//转换Java返回的数据类型为JS的类型
	function getJSVariableType(javaVariableType){
		//javaVariableType string 例如：javaVariableType
		var jsVariableType = '';
		switch(javaVariableType){
			case 'java.lang.Integer':
			case 'java.lang.Short':
			case 'java.lang.Float':
			case 'java.lang.Double':
			case 'java.math.BigDecimal':
			case 'java.lang.Byte':
				jsVariableType = 'number';
				break;

			case 'java.lang.Boolean':
				jsVariableType = 'boolean';
				break;

			case 'java.sql.Date':
			case 'java.util.Date':
			case 'java.sql.Time':
			case 'java.sql.Timestamp':
			case 'java.util.Calendar':
				jsVariableType = 'date';
				break;

			case 'java.lang.String':
			case 'byte[]':
			case 'java.lang.Long':
				jsVariableType = 'string';
				break;
			default:
				//如果不在上述类型中，则不是标准字段类型
				jsVariableType = 'none';
				break;
		}
		return jsVariableType;
	}
	//可访问方法
	return {
		init:init, 												//初始化
		getJson:function(){return voManager.formatXMLJson;}, 	//返回格式化后的JSON
		dialogForImport:dialogForImport,  						//新增弹框 导入VO数据源用
		voManager:voManager,									//导出当前文本到mindjetXML文件
		voResManager:voResManager, 								//数据源处理器
	}
})(jQuery);