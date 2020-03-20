/*
 * @Desription: 结果录入
 * @Author: netstar.cy
 * @Date: 2017-09-12 11:18:19
 * @LastEditTime: 2019-01-27 15:11:55
 */

NetstarUI.resultTable = {
	data:{},  		//基础数据
	currentTdID:'', //当前操作单元格
	saveingData:{}, //保存中的数据
	shortkeyType:'table',
	runAddKey:[],//执行属性，除这些属性，其他在刷新时应该删除
	cacheAjaxData:{}//离线缓存的数据
}
//入口的初始化方法
NetstarUI.resultTable.init = function(config, reIntoData){
	if(debugerMode){
		var validParameterArr = [
			[config,'object',true]
		]
		nsDebuger.validParameter(validParameterArr);
		var validArr = 
		[
			['id','string',true],
			['tableAjax','object',true],
			['isUseSettingWidthSize','boolean'],
			['isUseSettingHeightSize','boolean'],
			['isUseBtnPanel','boolean'],
			['unUseSettingStyle','array'],
		]
		nsDebuger.validOptions(validArr,config);
		var validTableAjaxArr = 
		[
			['url','string',true],
			['type','string'],
			['data','object'],
			['dataSrc','string',true],
		]
		nsDebuger.validOptions(validTableAjaxArr,config.tableAjax);
		var validSaveAjaxArr = 
		[
			['url','string',true],
			['type','string'],
			['data','object'],
			['dataSrc','string',true],
		]
		nsDebuger.validOptions(validSaveAjaxArr,config.saveAjax);
		var validHistoryAjaxArr = 
		[
			['url','string',true],
			['type','string'],
			['data','object'],
			['dataSrc','string',true],
		]
		nsDebuger.validOptions(validHistoryAjaxArr,config.historyAjax);
	}
	//保存原始对象
	NetstarUI.resultTable.originalConfig = $.extend(true,{},config);
	NetstarUI.resultTable.setDefalut(config);
	//如果是离线复原
	if(typeof(reIntoData) == 'object' && reIntoData.isReInto){
		//是否跨域请求上传
		NetstarUI.resultTable.isJsonp = true;//是否跨域上传
		NetstarUI.resultTable.cacheAjaxData = typeof(reIntoData.cacheAjaxData)=='string'?JSON.parse(reIntoData.cacheAjaxData):reIntoData.cacheAjaxData;
		var keys = Object.keys(NetstarUI.resultTable.cacheAjaxData);
		if(keys.length>0){
			NetstarUI.resultTable.loadPadData(NetstarUI.resultTable.cacheAjaxData[keys[0]]);
			NetstarUI.resultTable.setCacheList(keys[0]);
		}
		NetstarUI.resultTable.fullScreenMode();
		
	}else{
		NetstarUI.resultTable.loadData(config);
	}
	if(NetstarUI.resultTable.runAddKey.length == 0){
		for(key in NetstarUI.resultTable){
			NetstarUI.resultTable.runAddKey.push(key);
		}
	}
}
//重新加载时需删除非必要属性
NetstarUI.resultTable.clearKey = function(){
	if(NetstarUI.resultTable.runAddKey.length>0){
		for(key in NetstarUI.resultTable){
			if($.inArray(key, NetstarUI.resultTable.runAddKey) < 0){
				delete NetstarUI.resultTable[key];
			}
		}
	}
}
//设置默认值和所需值
NetstarUI.resultTable.setDefalut = function(config){
	config.timeStamp = new Date().getTime();
	var defaultConfig = {
		isUseSettingWidthSize:false,  	//是否使用设置的宽度，默认不使用，自动适应宽度
		isUseSettingHeightSize:true,	//是否使用设置的高度，默认使用
		isUseControlPanel:true, 		//是否有控制面板（按钮组）
		isUseSettingIndex:false, 		//是否使用配置的index属性。
		setAutoIndex:'', 				//则为服务器端数据添加 nsCompleteIndex属性 h/v 横/竖
	}
	$.each(defaultConfig, function(key,value){
		if(typeof(defaultConfig[key])=='undefined'){
			config[key] = value;
		}
	})
	if(typeof(config.containerID)=='undefined'){
		config.containerID = config.id;
	}
	config.$container = $('#'+config.containerID);
	//是否显示历史记录
	if(typeof(config.isShowHistory)!='boolean'){
		config.isShowHistory = true;
	}
	//默认设置
	if(typeof(config.default)!='object'){
		config.default = {
			urlPrefix:'',  						//默认前缀url是空
			inputLength:5, 						//输入框宽度是5
			selectLength:5, 					//下拉框宽度是5
		}
	}else{
		if(typeof(config.default.urlPrefix)!='string'){
			config.default.urlPrefix = '';
		}
		if(typeof(config.default.inputLength)!='number'){
			config.default.inputLength = 5;
		}
		if(typeof(config.default.selectLength)!='number'){
			config.default.selectLength = 5;
		}
	}
	//checkboxajax的默认值 与上面的不同，只有存在才有默认值
	if(typeof(config.default.checkboxajax)=='object'){
		if(typeof(config.default.checkboxajax.type)!='string'){
			config.default.checkboxajax.type = 'POST';
		}
		if(typeof(config.default.checkboxajax.dataSrc)!='string'){
			config.default.checkboxajax.dataSrc = 'row';
		}
		//默认显示名称
		if($.isArray(config.default.checkboxajax.show)==false){
			config.default.checkboxajax.show = ['name'];
		}
	}
	//日期输入框的默认值
	if(typeof(config.default.datestring)=='undefined'){
		config.default.datestring = {
			format:'MM/DD'
		}
	}
	if(typeof(config.isUseAutoWindowHeight)!='boolean'){
		config.isUseAutoWindowHeight = true;
	}
	if(debugerMode){
		if(config.$container.length==0){
			console.error('结果录入容器无法找到');
			console.error(config);
		}
	}
	NetstarUI.resultTable.config = config;

	//如果有缓存列表组件存在则删除
	NetstarUI.resultTable.fullScreenState = false; //是否全屏状态
	NetstarUI.resultTable.offlineState = false; //是否离线状态
	NetstarUI.resultTable.isJsonp = false;//是否跨域上传
	if($('#resultTableContainer-cachePanel-cacheSelect')){
		$('#resultTableContainer-cachePanel-cacheSelect').remove();
	}
}
//加载数据文件
NetstarUI.resultTable.loadData = function(config){
	NetstarUI.resultTable.clearKey();
	//添加基础样式和loading
	config.$container.addClass('resultinput');
	if(config.isUseAutoWindowHeight){
		config.$container.height($(window).height()-config.$container.offset().top-60);
	}
	config.$container.html(nsVals.loadingHtml);
	nsVals.ajax(config.tableAjax, function(data){
		if(data.success){
			if(debugerMode){
				if(typeof(data)=='undefined'){
					console.error('返回值未定义');
					return false;
				}
				if(data.msg && data.msg != ''){
					nsalert(data.msg, 'error');
				}
				if(typeof(data[config.tableAjax.dataSrc])=='undefined'){
					console.error(data[config.tableAjax.dataSrc]+'返回结果中数据字段未定义，请检查字段名 config.tableAjax.dataSrc:'+config.tableAjax.dataSrc);
					console.error(data);
					return false;
				}
			}
			NetstarUI.resultTable.data = data[config.tableAjax.dataSrc];
			NetstarUI.resultTable.vaildData(NetstarUI.resultTable.data);
			NetstarUI.resultTable.initPanel(config, NetstarUI.resultTable.data);
		}
	})
}
//加载pad数据
NetstarUI.resultTable.loadPadData = function(rowAjaxCacheData){
	NetstarUI.resultTable.clearKey();
	var config = NetstarUI.resultTable.config;
	NetstarUI.resultTable.offlineState = true;
	//添加基础样式和loading
	config.$container.addClass('resultinput');

	config.$container.html(nsVals.loadingHtml);
	var data = rowAjaxCacheData.data;

	NetstarUI.resultTable.data = data[config.tableAjax.dataSrc];
	NetstarUI.resultTable.vaildData(NetstarUI.resultTable.data);
	NetstarUI.resultTable.initPanel(config, NetstarUI.resultTable.data);
	//是否跨域请求，需刷新数据
	if(NetstarUI.resultTable.isJsonp){
		//所有修改后缓存数据
        NetstarUI.resultTable.getAllStorage(function(data){
            if(data && $.isArray(data.rows) && data.rows.length>0){
                for(i = 0; i<data.rows.length; i++){//循环修改记录，依次更新表格
                	var body = JSON.parse(data.rows[i].body);
                	  var obj = [];
                    if(body.jsonRows && body.jsonRows.length>0){
                        obj = JSON.parse(body.jsonRows);
                    }
          			NetstarUI.resultTable.serverDataHandler(obj);     
				}
            }
        }, function(error){
        },{});
	}
}
//检查是否Data文件是否有效
NetstarUI.resultTable.vaildData = function(data){
	if(debugerMode){
		if(typeof(data)!='object'){
			console.error('基础数据 ajax返回的对象类型错误 \n 当前值：'+ data + '\n 当前类型是：' + typeof(data) + '  应当是JSON或者object类型');
			return false;
		}
		if(typeof(data.tableData)!='object'){
			console.error('基础数据 ajax返回的对象不包含 tableData对象 当前数据如下：');
			console.error(data)
			return false;
		}
		for(tableID in data.tableData){
			if(typeof(data.tableData[tableID].rows)!='object'){
				console.error('ajax返回的表格数据不完整，必须包含 rows html base对象 当前数据如下：');
				console.error(data.tableData[tableID])
			}else{
				for(tr in data.tableData[tableID].rows){
					if(typeof(data.tableData[tableID].rows[tr])!='object'){
						console.error('ajax返回的表格数据不完整，rows对象中应当包含表格行对象 当前数据如下：');
						console.error(data.tableData[tableID]);
					}else{
						
					}
				}
			}

			//html对象中应当包含html字符串
			if(typeof(data.tableData[tableID].html)!='object'){
				console.error('ajax返回的表格数据不完整，必须包含 rows html base对象 当前数据如下：');
				console.error(data.tableData[tableID])
			}else{
				if(typeof(data.tableData[tableID].html.html)!='string'){
					console.error('ajax返回的表格数据不完整，html对象中应当包含html字符串 当前数据如下：');
					console.error(data.tableData[tableID].html)
				}
			}

			//base对象中应当包含 columnWidthArray rowHeightArray 两个数组
			if(typeof(data.tableData[tableID].base)!='object'){
				console.error('ajax返回的表格数据不完整，必须包含 rows html base对象 当前数据如下：');
				console.error(data.tableData[tableID])
			}else{
				if($.isArray(data.tableData[tableID].base.columnWidthArray) == false){
					console.error('ajax返回的表格数据不完整，base对象中应当包含 columnWidthArray 数组 当前数据如下：');
					console.error(data.tableData[tableID].base)
				}
				if($.isArray(data.tableData[tableID].base.rowHeightArray) == false){
					console.error('ajax返回的表格数据不完整，base对象中应当包含 rowHeightArray 数组 当前数据如下：');
					console.error(data.tableData[tableID].base)
				}
			}
		}
	}
}
//初始化结果录入面板
NetstarUI.resultTable.initPanel = function(config,data){
	NetstarUI.resultTable.initTablesData(config,data);
	NetstarUI.resultTable.initTables(config,data);
	NetstarUI.resultTable.initInputPanel(config,data);
	NetstarUI.resultTable.initHistoryPanel(config,data);
	NetstarUI.resultTable.initControlPanel(config,data);
	NetstarUI.resultTable.initShortkey();
	if(NetstarUI.resultTable.saveTimer){
		window.clearTimeout(NetstarUI.resultTable.saveTimer)
	}
	NetstarUI.resultTable.autoSaveTimerInit(config,data);
	NetstarUI.resultTable.mulitSelectTD();
	NetstarUI.resultTable.autoSubmitHandler();
}
//初始化表格数据
NetstarUI.resultTable.initTablesData = function(config,data){
	data.tdData = {}; 				//根据表格显示组织的单元格数据
	data.tdDataBynsId = {};			//根据nsId组织的单元格数据
	data.tdDataBySimpleId = {};  	//根据样品组织的单元格数据
	data.tdDateByNodeName = {}; 	//根据样品所属节点名称组织的单元单元格数据
	data.sampleIdSort = {}; 		//样品ID数据导入顺序  [{sampleid:2501,type:'defalut',defalutSort:0},{sampleid:2502,type:'defalut',defalutSort:0}]
	data.inputTdIDArr = [];
	var tableIndex = -1;
	var tdSort = 0;
	var simpleIdDefalseSortIndex = 0; 	 								//默认的样品数据导入顺序
	NetstarUI.resultTable.setSimpleIdOrderData = {current:0, length:0, order:[]};  	//添加排序

	$.each(data.tableData,  function(key,tableData){
		tableIndex++;
		//设置表格显示宽高所用的数据
		//1. tableData[tableID].base.tableWidth 表格的整体宽度
		//2. tableData[tableID].base.columnWidthStringArray 表格列宽显示字符串
		var totalWidth = 0;
		for(var theadI1=0; theadI1<tableData.base.columnWidthArray.length; theadI1++){
			totalWidth += tableData.base.columnWidthArray[theadI1];
		}
		tableData.base.tableWidth = totalWidth;
		tableData.base.columnWidthStringArray = [];
		tableData.base.columnsLength = tableData.base.columnWidthArray.length;
		tableData.base.rowsLength = tableData.base.rowHeightArray.length;
		for(var theadI=0; theadI<tableData.base.columnWidthArray.length; theadI++){
			if(config.isUseSettingWidthSize){
				var tdWidth = tableData.base.columnWidthArray[theadI];
				tableData.base.columnWidthStringArray[theadI] = tdWidth+'px';
			}else{
				var tdWidth = tableData.base.columnWidthArray[theadI]/totalWidth*100;
				tdWidth = parseInt(tdWidth*100)/100;
				tableData.base.columnWidthStringArray[theadI] = tdWidth+'%';
			}
		}

		//根据表格HTML数据补充
		//1. tableData[tableID].html.xml 格式化后XML对象
		//2. tableData[tableID].html.$xml 格式化后XML的Jquery DOM对象
		//3. tableData[tableID].html.tableID 
		var tableHtml = tableData.html.html;
		//添加tbody标签
		tableHtml = tableHtml.substring(0,tableHtml.indexOf('>')+1)+'<tbody>'+tableHtml.substring(tableHtml.indexOf('>')+1,tableHtml.length)
		tableHtml = tableHtml.substring(0,tableHtml.lastIndexOf('<'))+'</tbody>'+tableHtml.substring(tableHtml.lastIndexOf('<'),tableHtml.length)
		//设置对象
		var xml = $.parseXML(tableHtml);
		var $xml = $table = $(tableHtml);
		var tableID = $table.attr('id');
		if(debugerMode){
			if(typeof(tableID)=='undefined'){
				console.error('返回HTML中的表格 定义中没有定义id');
			}
		}
		tableData.html.xml = xml;
		tableData.html.$xml = $xml;
		tableData.html.tableID = tableID;
		//添加宽度控制列
		var theadHtml = '<th class="first-top"></th>';
		for(var theadI=0; theadI<tableData.base.columnWidthStringArray.length; theadI++){
			theadHtml += '<th style="width:'+tableData.base.columnWidthStringArray[theadI]+'" ns-columnindex="'+theadI+'">'+theadI+'</th>';
		}
		theadHtml = '<thead><tr>'+theadHtml+'</tr></thead>';
		$table.prepend(theadHtml);

		//添加表格样式
		$table.attr('class','table-result');
		//根据表格HTML内容核对rows内容
		var $trs = $table.children('tbody').children('tr');
		//建立行列二维数据 没填充前是false，填充完是tdID
		var tableIndexArr = [];
		for(var trIndex = 0; trIndex<tableData.base.rowsLength; trIndex++){
			tableIndexArr.push([]);
			for(var tdIndex = 0; tdIndex<tableData.base.columnsLength;tdIndex++){
				tableIndexArr[trIndex].push(false);
			}
		}
		//核对行数据
		for(var trI=0; trI<$trs.length; trI++){
			var $tr = $($trs[trI]);
			var trID = $tr.attr('id');
			var $tds = $tr.children();
			//id是必须的
			if(debugerMode){
				if(typeof(trID)=='undefined'){
					console.error('表格HTML中的第'+trI+'行 没有定义id \n'+$tr[0].outerHTML);
				}
			}
			if(typeof(tableData.rows[trID])!='object'){
				tableData.rows[trID] = {};
			}
			//核对单元格数据
			for(var tdI = 0; tdI<$tds.length; tdI++){
				var $td = $tds.eq(tdI);
				var tdID = $td.attr('id');
				//id是必须的
				if(debugerMode){
					if(typeof(tdID)=='undefined'){
						console.error('返回HTML中的单元格 定义中没有定义id \n'+$td[0].outerHTML);
					}
				}
				//整理表格数据
				var tdData = NetstarUI.resultTable.getTdData(data.tableData[tableID].rows[trID][tdID],tdID);
				data.tableData[tableID].rows[trID][tdID] = tdData;
				
				//填充表格数据
				var styleStr = '';
				if(typeof(tdData.style)=='object'){
					styleStr = NetstarUI.resultTable.getStyleString(tdData.style,config);
					tdData.styleStr = styleStr;
					$td.attr('style',styleStr);
				}else if(typeof(tdData.style)=='string'){
					styleStr = tdData.style;
					tdData.styleStr = styleStr;
					$td.attr('style',styleStr);
				}else if(typeof(tdData.style)=='undefined'){
					//没定义样式
				}

				if(typeof(tdData.type)=='undefined'){
					tdData.type = 'none';
				}

				if(typeof(tdData.state)=='undefined'){
					tdData.state = '';
				}
				tdData.sort = tdSort; //顺序
				tdSort++;
				//是否只读-后台数据-配置参数优先
				if(config.isAllReadonly){
					$td.attr('ns-readonly','readonly');
					tdData.readonly = true;
				}else{
					if(tdData.readonly){
						$td.attr('ns-readonly','readonly');
					}else{
						tdData.readonly = false;
					}
				}
								
				var nsID = tableID+'.'+trID+'.'+tdID;
				tdData.id = tdID;
				tdData.fullID = nsID;
				tdData.tableID = key;
				if(typeof(tdData.originalType)=='undefined'){
					tdData.originalType = tdData.type;
				}

				//根据类型分别初始化数据
				switch(tdData.originalType){
					case 'none':
						//处理图片地址 仅处理没有写有@的路径
						if(tdData.value.real){
							var isImageTag = tdData.value.real.indexOf('<img')>-1;
							if(isImageTag){
								var isNotHttp = tdData.value.real.indexOf('@') > -1;
								if(isNotHttp){
									tdData.value.visible = tdData.value.real.replace(/@/,getRootPath());
								}
								
							}
						}
						break;
					case 'string':
					case 'textarea':
					case 'select':
						break;
					case 'number':
						tdData.value.visible = NetstarUI.resultTable.getVisibleFromReal(tdData);
						break;
					case 'date':
						//先设置默认时间格式
						if(typeof(tdData.subdata)!='object'){
							tdData.subdata = {
								format:nsVals.default.momentDate
							}
						}else{
							if(typeof(tdData.subdata.format)!='string'){
								tdData.subdata.format = nsVals.default.momentDate;
							}
						}
						if(typeof(tdData.value.real)=='undefined'){
							//如果日期未定义
							tdData.value = {
								real:'',
								visible:''
							}
							//如果要默认日期
							if(tdData.subdata.isDefaultToday){
								tdData.value.real = new Date().getTime();
								tdData.value.visible = NetstarUI.resultTable.getVisibleFromReal(tdData);
							}
						}else{
							//如果定义了，则翻译时间戳
							if(typeof(tdData.value.real)=='string'){
								if(tdData.value.real == ''){
									var isDefaultToday = false;
									if(typeof(tdData.subdata)=='object'){
										if(typeof(tdData.subdata.isDefaultToday)=='boolean'){
											isDefaultToday = tdData.subdata.isDefaultToday;
											if(tdData.subdata.isDefaultToday == false){
												isDefaultToday = false;
											}
										}
									}
									if(isDefaultToday){
										tdData.value.real = new Date().getTime();
										tdData.value.visible = NetstarUI.resultTable.getVisibleFromReal(tdData);
									}else{
										tdData.value.real = '';
										tdData.value.visible = '';
									}
								}else{
									tdData.value.real = parseInt(tdData.value.real);
									tdData.value.visible = NetstarUI.resultTable.getVisibleFromReal(tdData);
								}
							}
						}
						break;
					case 'multiinput':
						// 多个输入框的形式
						// value.visible  		string html 表格输出
						// value.inputVisible 	string html 编辑面板输出
						// value.visibleExp 	string 载入的visilbe 原始公式
						// value.real 			object {}真实值
						if(typeof(tdData.value.visibleExp)=='undefined'){
							tdData.value.visibleExp = tdData.value.visible.replace(/ /g,'');
						}
						var visibleExpStr = tdData.value.visibleExp;
						var visibleHtml = visibleExpStr;
						var visibleInputHtml = visibleExpStr;
						var matches = visibleExpStr.match(/{/g);
						var inputNumber = matches == null ? 0 : matches.length;
						var indexofIndex = 0;
						for(var inputComponentI = 0; inputComponentI<inputNumber; inputComponentI++){
							var firstIndex = visibleExpStr.indexOf('{',indexofIndex);
							var secondIndex = visibleExpStr.indexOf('}',indexofIndex);
							var replaceStr = visibleExpStr.substring(firstIndex, secondIndex+1);
							var keyStr = replaceStr.replace(/{/,'').replace(/}/,'')
							var spanClassName = 'multiinput-underline-span';
							var inputWordNum = config.default.inputLength;  //一共几个下划线，显示几个字母的宽度 默认五个
							var matchUnderlineArr = replaceStr.match(/_/g);
							if($.isEmptyObject(matchUnderlineArr)){
								//如果不是下划线
								var matchEqualArr = replaceStr.match(/=/g);
								if($.isEmptyObject(matchEqualArr)){
									//也不包括等号 不带下划线的输入框
									//那就使用默认值
								}else{
									spanClassName = 'multiinput-noline-span';
									inputWordNum = matchEqualArr.length;
									keyStr = keyStr.replace(/=/g,'');
								}
							}else{
								inputWordNum = matchUnderlineArr.length;
								keyStr = keyStr.replace(/_/g,'');
							}
							indexofIndex = secondIndex+1;
							
							var targetStr = ''
							var styleStr = 'style="min-width:'+(inputWordNum*12)+'px"';
							targetStr += styleStr;
							var valueStr = tdData.value.real[keyStr];
							if(valueStr==''){
								valueStr = '　';　//全角空格
							}
							targetStr = '<span class="'+spanClassName+'" ns-keyindex="'+inputComponentI+'" ns-keyname="'+keyStr+'" '+targetStr+'>'+valueStr+'</span>';
							visibleHtml = visibleHtml.replace(replaceStr, targetStr)

							styleStr = 'style="min-width:'+(inputWordNum*12)+'px; width:'+(inputWordNum*12)+'px"';
							inputTargetStr = '<input class="multiinput-input" '+styleStr+' name="'+(tdID+'-'+keyStr)+'" id="'+(tdID+'-'+keyStr)+'" ns-keyname="'+keyStr+'" />';
							visibleInputHtml = visibleInputHtml.replace(replaceStr, inputTargetStr);
						}
						tdData.value.visible = visibleHtml;
						tdData.value.inputVisible = visibleInputHtml;
						break;
					case 'uploadtitle':
						//添加上传标题的类型
						var formatValueObj = NetstarUI.resultTable.getUploadVisible(tdData);
						tdData.value.visible = formatValueObj.visible;
						tdData.value.edit = formatValueObj.edit;
						break;
					case 'checkbox':
						var valueRealArr = [];
						var moreValueStr = '';  		//更多的具体值
						var moreOptionName = '';    	//更多的显示文字
						var moreOptionLength = 3; 		//更多下划线的长度
						var moreOptionIndex = -1; 		//更多在subdata中的位置
						var isWithMoreOption = false; 	//是否有更多，约定的方式是是否在subdata里有__,两个下划线

						//转换
						valueRealArr = tdData.value.real.split('|');
						tdData.valueRealArr = valueRealArr;
						//判断是否有更多输入框
						for(var subdataI=0; subdataI<tdData.subdata.length; subdataI++){
							if(tdData.subdata[subdataI].indexOf('__')>=0){
								//如果包含_数据，
								if(isWithMoreOption==false){
									isWithMoreOption = true;
									moreOptionName = tdData.subdata[subdataI];
									moreOptionIndex = subdataI;
								}else{
									//只能有一个更多
									nsalert('只能有一个补充输入框，请检查录入标点设置','error');
									console.warn('只能有一个补充输入框，请检查录入标点设置','error');
									console.warn(tdData)
									tdData.subdata[subdataI] = false;
								}
							}
						}

						//更多相关变量 tdData.moreOption{name:,length:,value:}
						if(isWithMoreOption){
							//debugger
							moreOptionLength = moreOptionName.match(/_/g).length;
							moreOptionName = moreOptionName.replace(/_/g,'');
							//获取选中的更多
							if(tdData.value.real!=''){
								for(var valueRealI=0; valueRealI<valueRealArr.length; valueRealI++){
									if(tdData.subdata.indexOf(valueRealArr[valueRealI])==-1){
										moreValueStr +=  valueRealArr[valueRealI]+' ';
									}
								}
							}
							if(moreValueStr!=''){
								moreValueStr = $.trim(moreValueStr);
							}
							tdData.moreOption = {
								name:moreOptionName,
								length:moreOptionLength,
								value:moreValueStr,
								index:moreOptionIndex
							}
						}
						tdData.isWithMoreOption = isWithMoreOption;
						var formatValueObj = NetstarUI.resultTable.getCheckboxVisible(tdData);
						tdData.value.visible = formatValueObj.visible;
						tdData.value.edit = formatValueObj.edit;
						break;
					case 'checkboxajax':
						if(typeof(tdData.value.real)=='string'){

							var caRealValue = tdData.value.real == ''?[]:tdData.value.real.split(',');
							//没有最基本的配置参数就报错
							if(debugerMode){
								if(typeof(config.default.checkboxajax)!='object'){
									console.error('无法读取系统数据多选组件配置，请配置 config.default.checkboxajax');
									return false;
								}
							}
							//设置是否多选和是否转化为数字的默认值
							if(typeof(config.default.checkboxajax.isNumberID)!='boolean'){
								config.default.checkboxajax.isNumberID = false;
							}
							if(typeof(config.default.checkboxajax.isMultiSelect)!='boolean'){
								config.default.checkboxajax.isMultiSelect = false;
							}
							//如有有需要，则转id为数字
							if(config.default.checkboxajax.isNumberID){
								for(var realValueI = 0; realValueI<caRealValue.length; realValueI++){
									caRealValue[realValueI] = parseInt(caRealValue[realValueI]);
								}
							}
							tdData.value.real = caRealValue;
						}
						var formatValueObj = NetstarUI.resultTable.getCheckboxAjaxVisible(tdData,config);
						tdData.value.visible = formatValueObj.visible;
						tdData.value.edit = formatValueObj.edit;
						break;
					case 'datestring':
						//转化为文本组件，并加上格式化输入和日期验证
						tdData.type = 'string';
						var formatStr = config.default.datestring.format;
						if(typeof(tdData.subdata)=='object'){
							if(typeof(tdData.subdata.format)=='string'){
								formatStr = tdData.subdata.format;
							}
						}
						//日期转大写
						formatStr = formatStr.toUpperCase();
						//找到过滤用字符，向后传值要删除过滤字符
						var filterStringArray = formatStr.match(/[^A-Z]/g);
						//格式化数据的字符串
						var maskString = formatStr.replace(/[A-Z]/g,'9');
						tdData.momentRules = formatStr;
						tdData.filterStringArray = filterStringArray;
						tdData.maskString = maskString;
						if(typeof(tdData.value.real)=='string'){
							var realStr = tdData.value.real;
							var visibleStr = maskString.replace(/9/g,'*');
							var matchArr = maskString.match(/9/g);
							if(realStr == ''){
								visibleStr = '';
							}else if(matchArr.length = realStr.length){
								//转化visible
								for(var replaceI = 0; replaceI<matchArr.length; replaceI++){
									visibleStr = visibleStr.replace(
										'*',
										realStr.substr(replaceI,1)
									)
								}
							}else{
								if(debugerMode){
									console.error('无法解析datestring组件的值：'+realStr+' 到'+formatStr+'的格式');
								}
							}
							tdData.value.visible = visibleStr;
						}else{
							tdData.value.visible = '';
						}
						break;
					case 'scientificInput':
						//转化为数字输入框，并加上format方法
						tdData.type = 'number';
						if(typeof(tdData.rules)!='string'){
							//没有就加验证
							tdData.rules = 'number';
						}else{
							//有了的话看看需不需要补充
							if(tdData.rules.indexOf('number')==-1){
								tdData.rules += ' number';
							}
						}
						
						if(debugerMode){
							if(typeof(tdData.subdata)=='undefined'){
								console.error('必须定义最大最小值属性');
								console.error(tdData);
							}else{
								if(typeof(tdData.subdata.max)!='number' || typeof(tdData.subdata.min)!='number' ){
									console.error('必须定义最大最小值属性');
									console.error(tdData);
								}
							}
						}
						//小数点位数默认为1
						var pointPlace = 1;
						if(typeof(tdData.subdata.pointPlace)=='number'){
							pointPlace = tdData.subdata.pointPlace;
						}else{
							tdData.subdata.pointPlace = pointPlace;
						}
						//取整规则 2取整 0四舍五入 1四舍六入
						var integerPlace = 0;
						if(typeof(tdData.subdata.integerPlace)=='number'){
							//合法
						}else{
							tdData.subdata.integerPlace = integerPlace;
						}
						visibleStr = NetstarUI.resultTable.getScientificValue(tdData.subdata, tdData.value.real);
						tdData.value.visible = visibleStr;
						break;
					case 'multiselect':
						var valueStr = NetstarUI.resultTable.getMultiselectValue(tdData);
						tdData.value.real = valueStr[0];
						tdData.value.visible = valueStr[1];
						break;
					case 'multiupload':
						//批量上传图片 sjj20180319
						//初始化默认显示图片
						var formatValueObj = NetstarUI.resultTable.getUploadVisible(tdData);
						tdData.value.visible = formatValueObj.visible;
						tdData.value.edit = formatValueObj.edit;
						break;
					default:
						if(debugerMode){console.error('不识别的类型:'+tdData.type)};
						break;
				}
				//添加组件属性值
				var className = tdData.type;
				if(tdData.originalType != tdData.type){
					className = tdData.type+' '+tdData.originalType;
				}
				if(typeof(tdData.plusClass)=='string'){
					className += ' '+tdData.plusClass;
				}
				$td.attr('class', className);
				$td.attr('ns-id',tdData.nsId);
				$td.attr('ns-type',tdData.type);
				$td.attr('ns-original-type',tdData.originalType);


				//是否自动发送
				if(tdData.value.autoSubmit){
					if(typeof(NetstarUI.resultTable.autoSubmitData)=='undefined'){
						NetstarUI.resultTable.autoSubmitData = [];
					}
					NetstarUI.resultTable.autoSubmitData.push(tdData);
				}
				//判断历史记录
				var tdhtml = tdData.value.visible;
				//历史记录
				if(typeof(tdData.value.data)!='object'){
					tdData.value.data = {};
				}
				if(typeof(tdData.history)=='number'){
					var historyNumber = tdData.history;
					if(historyNumber>99){
						historyNumber = 99;
					}
					if(tdData.history>0 && config.isShowHistory){
						tdhtml+='<div class="history">'+historyNumber+'</div>'
					}
				}else{
					tdData.history = 0;
				}
				
				//批注信息
				if(typeof(tdData.notes)=='number'){
					var notesType = '';
					switch(tdData.notes){
						case 0:
							//没有批注
							break;
						case 1:
							//未读批注
							notesType = 'wait'
							break;
						case 2:
							//已读批注
							notesType = 'read'
							break;
						default:
							if(debugerMode){
								console.error('不能识别的批注类型：'+tdData.notes)
							}
					}
					if(tdData.notes != 0){
						tdhtml+='<a href="javascript:void(0);" class="notes '+notesType+'" ns-notes-type="'+tdData.notes+'"></a>';
					}
					
				}
				$td.html(tdhtml);

				//整体数据引用
				data.tdData[tdID] = tdData; //用于检索用的，以tdID为标识
				data.tdDataBynsId[tdData.nsId] = tdData; //用于检索用的，以tdID为标识
				//根据样品建立的数据集
				var sampleId = tdData.value.data.sampleId;
				if(sampleId){
					//样品数据集
					if(typeof(data.tdDataBySimpleId[sampleId])=='undefined'){
						//建立样品数据集
						data.tdDataBySimpleId[sampleId] = {};
						//建立样品数据集排序对象
						data.sampleIdSort[sampleId] = {
							sampleId:sampleId,
							sort:simpleIdDefalseSortIndex,
							type:'default',
							first:tdID
						}
						simpleIdDefalseSortIndex++;
					}

					var itemName = tdData.value.data.nodeName;
					//由于平行样所以每个字段都是数组
					if(typeof(data.tdDataBySimpleId[sampleId][itemName])=='undefined'){
						data.tdDataBySimpleId[sampleId][itemName] = [];
					}
					data.tdDataBySimpleId[sampleId][itemName].push(tdData);

					//样品属性名称数据集
					if(typeof(data.tdDateByNodeName[itemName])=='undefined'){
						data.tdDateByNodeName[itemName] = [];
					}
					data.tdDateByNodeName[itemName].push(tdData);
				}
				if(tdData.type!='none'&&tdData.readonly==false){
					data.inputTdIDArr.push(tdID);
				}
				
				//设定默认操作对象，第一个
				if(NetstarUI.resultTable.currentTdID==''){
					NetstarUI.resultTable.currentTdID = tdID;
				}
				//填充tableIndexArr 填充当前
				for(var colspanI=0; colspanI<tdData.index.colspan; colspanI++){
					if(debugerMode){
						if(typeof(tableIndexArr[tdData.index.row-1])=='undefined'){
							console.error('表格的行高度设置与表格数据不符，表格数据中的行定义超出航高度设置数量')
						}
					}
					tableIndexArr[tdData.index.row-1][tdData.index.column-1+colspanI] = tdID;
					for(var rowspanI=1; rowspanI<tdData.index.rowspan;  rowspanI++){
						tableIndexArr[tdData.index.row-1+rowspanI][tdData.index.column-1+colspanI] = tdID;
					}
				}
			}
			//表格行高控制列
			var rowHeight = tableData.base.rowHeightArray[trI];
			if(debugerMode){
				if(typeof(rowHeight)=='undefined'){
					console.error('表格:'+tableID+'的行高定义不完整,当前行为第'+trI+'行，行ID：'+trID);
					console.error(tableData.base.rowHeightArray)
				}
			}
			if(config.isUseSettingHeightSize == false){
				if(tableData.base.rowHeightArray[trI]<12 || tableData.base.rowHeightArray[trI]>30){
					//太高的或者太低的应该有特殊意图
					rowHeight = tableData.base.rowHeightArray[trI];
				}else{
					//默认高度是30
					rowHeight = 30 
				}
				
			}else{
				rowHeight = tableData.base.rowHeightArray[trI];
			}
			var firstTdHtml = '<td ns-rowindex="'+trI+'" class="first-rowtd" style="height:'+rowHeight+'px"></td>';
			$tr.prepend(firstTdHtml);
		}
		tableData.mapArr = tableIndexArr;
		tableData.html.xml = xml;
		tableData.html.$xml = $xml;
	})
	/**
	 * lyw
	 * setAutoIndex / isUseSettingIndex （是否为服务器端数据添加 nsCompleteIndex属性控制回车横纵跳转，添加nsCompleteIndex属性）/（isUseSettingIndex：是否读取nsCompleteIndex属性）
	 * 只设置 isUseSettingIndex==true 表示读取服务器配置的nsCompleteIndex属性
	 * 只设置 setAutoIndex==“h/v” 不起作用
	 * 配置 isUseSettingIndex==true&&setAutoIndex==“h/v” 表示自动配置nsCompleteIndex，然后根据nsCompleteIndex判断跳转
	 * 配置 isUseSettingIndex==false setAutoIndex配任何参数不起作用 走默认 相当于此处没写
	 * nsCompleteIndex  number 根据nsCompleteIndex数字顺序判断跳转
	 * isAutoSetNsCompleteIndex boolean setAutoIndex=“h/v”时自动添加nsCompleteIndex时是否已经添加过了，添加过的不进行二次添加，例如单元格占两列时执行第一列跳转
	 */
	// 是否为服务器端数据添加 nsCompleteIndex属性, h/v 横/竖
	if(config.setAutoIndex == "h" || config.setAutoIndex == "v"){
		var autoIndexArr = [];
		for(var tableId in data.tableData){
			var tableIndexArr = data.tableData[tableId].mapArr;
			var rowLength = tableIndexArr.length;
			if(!$.isArray(tableIndexArr[0])){
				continue;
			}
			var colLength = tableIndexArr[0].length;
			if(config.setAutoIndex == "h"){
				for(var rowI=0; rowI<rowLength; rowI++){
					for(var colI=0; colI<colLength; colI++){
						var ctdId = tableIndexArr[rowI][colI];
						autoIndexArr.push(ctdId);
					}
				}
			}else{
				for(var colI=0; colI<colLength; colI++){
					for(var rowI=0; rowI<rowLength; rowI++){
						var ctdId = tableIndexArr[rowI][colI];
						autoIndexArr.push(ctdId);
					}
				}
			}
		}
		var nsCompleteIndex = 0;
		for(var tdI=0; tdI<autoIndexArr.length; tdI++,nsCompleteIndex++){
			var tdID = autoIndexArr[tdI];
			if(data.tdData[tdID] && data.tdData[tdID].isAutoSetNsCompleteIndex!=true){
				data.tdData[tdID].nsCompleteIndex = nsCompleteIndex;
				data.tdData[tdID].isAutoSetNsCompleteIndex = true;
			}
		}
	}
	// 是否使用配置的index属性  nsCompleteIndex
	if(config.isUseSettingIndex){
		var inputTdIDArr = [];
		var tdDataArr = [];
		for(ctdID in data.tdData){
			var ctdData = data.tdData[ctdID];
			if(ctdData.type!='none'&&ctdData.readonly==false&&typeof(ctdData.nsCompleteIndex)=="number"){
				tdDataArr.push(ctdData);
			}
		}
		tdDataArr.sort(function(a,b){
            return a.nsCompleteIndex-b.nsCompleteIndex
		});
		for(var i=0;i<tdDataArr.length;i++){
			inputTdIDArr.push(tdDataArr[i].id);
		}
		data.inputTdIDArr = inputTdIDArr;
	}
	/********lywsetAutoIndex/isUseSettingIndex相关代码完*********/

	//生成上下左右
	for(ctdID in data.tdData){
		var ctdData = data.tdData[ctdID];
		var cRow = ctdData.index.row-1;
		var cCol = ctdData.index.column-1;
		var tableData = NetstarUI.resultTable.data.tableData[ctdData.tableID];
		var tableIndexArr = tableData.mapArr;
		//上面的
		var upTdID = '';
		if(ctdData.index.row == 1){
			upTdID = false;
		}else{
			upTdID = tableIndexArr[cRow-1][cCol]
		}
		//下面的
		var downTdID = '';
		if(ctdData.index.row == tableData.base.rowsLength){
			downTdID = false;
		}else if(cRow + ctdData.index.rowspan == tableData.base.rowsLength){
			downTdID = false;
		}else{
			downTdID = tableIndexArr[cRow+ctdData.index.rowspan][cCol];
		}
		//左边的
		var leftTdID = '';
		if(ctdData.index.column == 1){
			leftTdID = false;
		}else{
			leftTdID = tableIndexArr[cRow][cCol-1];
		}
		//右边的
		var rigthTdID = '';
		if(ctdData.index.column == tableData.base.columnsLength){
			rigthTdID = false;
		}else if(cCol + ctdData.index.colspan == tableData.base.columnsLength){
			rigthTdID = false;
		}else{
			rigthTdID = tableIndexArr[cRow][cCol+ctdData.index.colspan];
		}

		ctdData.neighbours = {
			up:upTdID,
			down:downTdID,
			left:leftTdID,
			right:rigthTdID,
			//enter:enterTdID
		}
	}

	//设置可编辑的单元格enter操作的tdID
	var inputTdIDlength = data.inputTdIDArr.length;
	if(inputTdIDlength==0){
		return false;  //如果一个输入组件都没有就不执行enter了
	}
	var inputTDsortArr = [];
	for(var inputI=0; inputI<data.inputTdIDArr.length-1; inputI++){
		data.tdData[data.inputTdIDArr[inputI]].neighbours.enter = data.inputTdIDArr[inputI+1];
		inputTDsortArr.push(data.tdData[data.inputTdIDArr[inputI]].sort)
	}
	//最后一个输入组件enter后回到第一个
	data.tdData[data.inputTdIDArr[inputTdIDlength-1]].neighbours.enter = data.inputTdIDArr[0];

	//设置不可编辑单元格的enter操作对应的ID，下一个可编辑单元格，后面的是倒数第一个
	inputTDsortArr.push(data.tdData[data.inputTdIDArr[inputTdIDlength-1]].sort);
	inputTDsortArr.sort(function(a,b){return a-b});

	//根据序列号获得enter的id
	function getEnterTdID(sortNumber){
		var returnSortNumber;
		if(sortNumber<inputTDsortArr[0]){
			returnSortNumber = 0;
		}else if(sortNumber>inputTDsortArr[inputTDsortArr.length-1]){
			returnSortNumber = inputTDsortArr.length-1;
		}else{
			for(var sortI=0;  sortI<inputTDsortArr.length-1; sortI++){
				if(sortNumber>inputTDsortArr[sortI] && sortNumber<inputTDsortArr[sortI+1]){
					returnSortNumber = sortI+1;
				}
			}
		}
		return data.inputTdIDArr[returnSortNumber];
	}


	for(tdID in data.tdData){
		if(data.tdData[tdID].type=='none' || data.tdData[tdID].readonly==true){
			data.tdData[tdID].neighbours.enter = getEnterTdID(data.tdData[tdID].sort);
		}
	}

	//设置样品总长度
	var simpleTotalLength = 0;
	for(var simpleID in NetstarUI.resultTable.data.tdDataBySimpleId){
		simpleTotalLength++;
	}
	NetstarUI.resultTable.setSimpleIdOrderData.length = simpleTotalLength;
}
//根据类型格式化不同组件的基本属性 获取visible的值
NetstarUI.resultTable.getVisibleFromReal = function(tdData){
	var config = NetstarUI.resultTable.config;
	var tdID = tdData.id;
	var visibleStr = tdData.value.real;
 	switch(tdData.originalType){
		case 'none':
		case 'string':
		case 'textarea':
		case 'select':
			break;
		case 'uploadtitle':
		case 'multiupload':
			//图片上传 多图片上传 20180319sjj
			//添加上传类型的输出html
			var formatValueObj = NetstarUI.resultTable.getUploadVisible(tdData);
			visibleStr = formatValueObj.visible;
			break;
		case 'number':
			//readonly并且visible有值
			if(tdData.readonly == true && tdData.value.visible !== ''){
				visibleStr = tdData.value.visible;
			}else{
				if(typeof(tdData.subdata)=='object'){
					if(tdData.subdata.stateColor){
						//状态颜色 负数为红色 正数为绿色 
						var visibleNumberHtml = tdData.value.real;
						if(tdData.value.real>=0){
							visibleNumberHtml = '<span class="plus">'+visibleNumberHtml+'</span>';
						}else{
							visibleNumberHtml = '<span class="minus">'+visibleNumberHtml+'</span>';
						}
						visibleStr = visibleNumberHtml;
					}
					if(tdData.subdata.showPlus){
						//是否在正数时显示加号
						if(tdData.value.real>0){
							visibleStr = '+'+tdData.value.real;
						}
					}

				}
			}
			break;
		case 'date':
			visibleStr = moment(tdData.value.real).format(tdData.subdata.format.toUpperCase());
			break;
		case 'multiinput':
			// 多个输入框的形式
			// value.visible  		string html 表格输出
			// value.visibleExp 	string 载入的visilbe 原始公式
			var visibleExpStr = tdData.value.visibleExp;
			var visibleHtml = visibleExpStr;
			var visibleInputHtml = visibleExpStr;
			var inputNumber = visibleExpStr.match(/{/g).length;
			var indexofIndex = 0;
			for(var inputComponentI = 0; inputComponentI<inputNumber; inputComponentI++){
				var firstIndex = visibleExpStr.indexOf('{',indexofIndex);
				var secondIndex = visibleExpStr.indexOf('}',indexofIndex);
				var replaceStr = visibleExpStr.substring(firstIndex, secondIndex+1);
				var keyStr = replaceStr.replace(/{/,'').replace(/}/,'')
				var spanClassName = 'multiinput-underline-span';
				var inputWordNum = config.default.inputLength;  //一共几个下划线，显示几个字母的宽度 默认五个
				var matchUnderlineArr = replaceStr.match(/_/g);
				if($.isEmptyObject(matchUnderlineArr)){
					//如果不是下划线
					var matchEqualArr = replaceStr.match(/=/g);
					if($.isEmptyObject(matchEqualArr)){
						//也不包括等号 不带下划线的输入框
						//那就使用默认值
					}else{
						spanClassName = 'multiinput-noline-span';
						inputWordNum = matchEqualArr.length;
						keyStr = keyStr.replace(/=/g,'');
					}
				}else{
					inputWordNum = matchUnderlineArr.length;
					keyStr = keyStr.replace(/_/g,'');
				}
				indexofIndex = secondIndex+1;
				
				var targetStr = ''
				var styleStr = 'style="min-width:'+(inputWordNum*12)+'px"';
				targetStr += styleStr;
				var valueStr = tdData.value.real[keyStr];
				if(valueStr==''){
					valueStr = '　';　//全角空格
				}
				targetStr = '<span class="'+spanClassName+'" ns-keyindex="'+inputComponentI+'" ns-keyname="'+keyStr+'" '+targetStr+'>'+valueStr+'</span>';
				visibleHtml = visibleHtml.replace(replaceStr, targetStr)
			}
			visibleStr = visibleHtml;
			break;
		case 'checkbox':
			var formatValueObj = NetstarUI.resultTable.getCheckboxVisible(tdData);
			visibleStr = formatValueObj.visible;
			break;
		case 'checkboxajax':
			if(debugerMode){
				console.error('暂时不能处理');
			}
			break;
		case 'datestring':
			//转化为文本组件，并加上格式化输入和日期验证
			if(typeof(tdData.value.real)=='string'){
				var realStr = tdData.value.real;
				visibleStr = tdData.maskString.replace(/9/g,'*');
				var matchArr = tdData.maskString.match(/9/g);
				if(realStr == ''){
					visibleStr = '';
				}else if(matchArr.length = realStr.length){
					//转化visible
					for(var replaceI = 0; replaceI<matchArr.length; replaceI++){
						visibleStr = visibleStr.replace(
							'*',
							realStr.substr(replaceI,1)
						)
					}
				}else{
					if(debugerMode){
						console.error('无法解析datestring组件的值：'+realStr+' 到'+formatStr+'的格式');
					}
				}
			}else{
				visibleStr = '';
			}
			break;
		case 'scientificInput':
			//小数点位数默认为1
			visibleStr = NetstarUI.resultTable.getScientificValue(tdData.subdata, tdData.value.real);
			break;
		case 'multiselect':
			break;
		default:
			if(debugerMode){console.error('不识别的类型:'+tdData.type)};
			break;
	}
	return visibleStr;
 }
//根据类型格式化不同组件的基本属性 获取edit的值
NetstarUI.resultTable.getEditFromReal = function(tdData){
	var config = NetstarUI.resultTable.config;
	var tdID = tdData.id;
	var editStr = tdData.value.real;
 	switch(tdData.originalType){
		case 'none':
		case 'string':
		case 'textarea':
		case 'select':
		case 'number':
			break;
		case 'date':
			editStr = moment(tdData.value.real).format(tdData.subdata.format.toUpperCase());
			break;
		case 'multiinput':
			//用到了再说吧
			if(debugerMode){
				console.error('暂时不能处理');
			}
			break;
		case 'uploadtitle':
		case 'multiupload':
			//编辑上传
			console.log('upload-edit')
			break;
		case 'checkbox':
			var formatValueObj = NetstarUI.resultTable.getCheckboxVisible(tdData);
			visibleStr = formatValueObj.edit;
			break;
		case 'checkboxajax':
			//用到了再说吧
			if(debugerMode){
				console.error('暂时不能处理');
			}
			break;
		case 'datestring':
			//用到了再说吧
			if(debugerMode){
				console.error('暂时不能处理');
			}
			break;
		case 'scientificInput':
			//小数点位数默认为1
			break;
		case 'multiselect':
			break;
		default:
			if(debugerMode){console.error('不识别的类型:'+tdData.type)};
			break;
	}
	return visibleStr;
 }
//初始化表格
NetstarUI.resultTable.initTables = function(config,data){
	var html = ''
	$.each(data.tableData,  function(key,tableData){
		tableHtml = tableData.html.$xml[0].outerHTML;
		//tableHtml = (new XMLSerializer()).serializeToString(tableData.html.xml);
		html += tableHtml;
	})
	//添加输入控件容器
	config.inputcomponentID = config.id+'-inputcomponent';
	var inputHtml = '<div id="'+config.inputcomponentID+'" class="input-component" style="display:none;"></div>';
	html += inputHtml;
	//添加历史记录容器
	config.historyPanelID = config.id+'-historyPanel';
	var historyHtml = '<div id="'+config.historyPanelID+'" class="history-panel" style="display:none;"></div>';
	html += historyHtml;
	//添加控制面板容器
	var controlPanelHtml = '<div id="resultTableControlPanel" class="control-panel padmode"></div>';
	//html += controlPanelHtml;
	//生成html
	config.$container.html(html);

	var controlPanel = $('#resultTableControlPanel');
	if(controlPanel){
		controlPanel.remove();
	}
	config.$container.after(controlPanelHtml);
	

	config.$historyPanel = $('#'+config.historyPanelID);
	//初始化各个表格的$dom对象
	config.$tables = {};
	for(tdID in data.tdData){
		data.tdData[tdID].$td = $('#'+tdID);
		//显示data中设定的颜色
		var tdData = data.tdData[tdID];
		if(typeof(tdData.value)=='object'){
			if(typeof(tdData.value.data)=='object'){
				//修改背景色
				if(typeof(tdData.value.data.background)=='string'){
					data.tdData[tdID].$td.css("background",tdData.value.data.background);
				}
				//修改字体颜色
				if(typeof(tdData.value.data.color)=='string'){
					data.tdData[tdID].$td.css("color",tdData.value.data.color);
				}
			}
		}
		
		
	}
	for(tableID in NetstarUI.resultTable.data.tableData){
		config.$tables[tableID] = config.$container.children('#'+tableID);
		var settingTableWidth;
		if(config.isUseSettingWidthSize){
			settingTableWidth = NetstarUI.resultTable.data.tableData[tableID].base.tableWidth;
			config.$tables[tableID].width(settingTableWidth);
		}else{
			settingTableWidth = '100%';
			config.$tables[tableID].css('width',settingTableWidth);
		}
		config.$tables[tableID].children('tbody').children('tr').children('td').not('.first-rowtd').off('click')
		config.$tables[tableID].children('tbody').children('tr').children('td').not('.first-rowtd').on('click', NetstarUI.resultTable.tdClickHandler);
		config.$tables[tableID].children('tbody').children('tr').children('td').not('.first-rowtd').off('mouseenter')
		config.$tables[tableID].children('tbody').children('tr').children('td').not('.first-rowtd').on('mouseenter', NetstarUI.resultTable.tdMouseenterHandler);
		config.$tables[tableID].children('tbody').children('tr').children('td').not('.first-rowtd').off('mouseleave')
		config.$tables[tableID].children('tbody').children('tr').children('td').not('.first-rowtd').on('mouseleave', NetstarUI.resultTable.tdMouseleaveHandler);
	}
	config.$container.find('.history').on('click',NetstarUI.resultTable.historyClickHandler);
	config.$container.find('.notes').on('click',NetstarUI.resultTable.notesClickHandler);

	//重新格式化需要的组件代码
	setTimeout(resizeTdByType, 10)
	function resizeTdByType(){
		for(tdID in NetstarUI.resultTable.data.tdData){
			var tdData = NetstarUI.resultTable.data.tdData[tdID]
			if(tdData.type == 'checkboxajax'){
				//只有一个输入框的checkboxajax输入框宽度自动计算
				if(tdData.isWithMoreOption && tdData.selectIndex == 0){
					tdData.options[0].length = (tdData.$td.innerWidth() - 30) / 12;
					var html = NetstarUI.resultTable.getCheckboxAjaxVisible(tdData, config);
					tdData.value.visible = html.visible;
					tdData.value.edit = html.edit;
					tdData.$td.html(html.visible);
				}
			}
		}
	}
}
//返回输入组件HTML
NetstarUI.resultTable.getInputComponentHtml = function(config,data){
	var html = '';
	var inputID = 'resultTableContainer-inputcomponent-input'
	html+=	'<div class="input-none" ns-class="none"></div>';  //none类型
	//uploadtitle类型
	html+= '<div class="input-uploadtitle" ns-class="uploadtitle"></div>';
	//multiupload
	html+= '<div class="input-multiupload" ns-class="multiupload"></div>';
	//string类型
	html+=	'<div class="input-string" ns-class="string">'
				+'<input id="'+inputID+'-string"  name="'+inputID+'-string"  type="text">'
			+'</div>'; 
	//number类型
	html+=	'<div class="input-number" ns-class="number">'
				+'<input id="'+inputID+'-number"  name="'+inputID+'-number" type="text">'
			+'</div>'; 
	//textarea类型
	html+=	'<div class="input-textarea" ns-class="textarea">'
				+'<textarea id="'+inputID+'-textarea"  name="'+inputID+'-textarea"></textarea>'
			+'</div>'; 
	//select类型
	html+=	'<div class="input-select" ns-class="select">'
				+'<input id="'+inputID+'-select"  name="'+inputID+'-select" type="text">'
			+'</div>'; 
	//date类型
	html+=	'<div class="input-date" ns-class="date">'
				+'<input id="'+inputID+'-date"  name="'+inputID+'-date" type="text">'
			+'</div>'; 
	//multiinput 类型
	html+=	'<div class="input-multiinput" ns-class="multiinput">'
				+'<div id="'+inputID+'-multiinput" class="input-multiinput-container"></div>'
			+'</div>'; 
	//checkbox 类型
	html+=	'<div class="input-checkbox" ns-class="checkbox">'
				+'<div id="'+inputID+'-checkbox" class="input-checkbox-container"></div>'
			+'</div>'; 
	//checkbox-ajax 类型
	html+=	'<div class="input-checkboxajax" ns-class="checkboxajax">'
				+'<div id="'+inputID+'-checkboxajx" class="input-checkboxajax-container"></div>'
			+'</div>'; 
	//multiselect 类型
	html+=	'<div class="input-multiselect" ns-class="multiselect">'
				+'<input id="'+inputID+'-multiselect" name="'+inputID+'-multiselect" type="text">'
			+'</div>';
	//外包容器，form
	html = '<form id="resultTableContainer-inputcomponent-form"  method="get" autocomplete="off" action="" class="component-container">'+html+'</form>';
	return html;
}
//初始化输入面板
NetstarUI.resultTable.initInputPanel = function(config,data){
	config.$editPanel = config.$container.children('#'+config.inputcomponentID);
	var html = NetstarUI.resultTable.getInputComponentHtml(config,data);
	config.$editPanel.html(html);
	config.$editPanelForm = config.$editPanel.children('form.component-container')
	//初始化各个面板
	//none
	config.$editPanelNone = config.$editPanelForm.children('div[ns-class="none"]');
	//uploadtitle
	config.$editPanelUploadtitle = config.$editPanelForm.children('div[ns-class="uploadtitle"]');
	//multiupload
	config.$editPanelMultiupload = config.$editPanelForm.children('div[ns-class="multiupload"]');
	//string
	config.$editPanelString = config.$editPanelForm.children('div[ns-class="string"]');
	config.$editPanelStringInput = config.$editPanelString.children('input');
	//number
	config.$editPanelNumber = config.$editPanelForm.children('div[ns-class="number"]');
	config.$editPanelNumberInput = config.$editPanelNumber.children('input');

	config.$editPanelSelect = config.$editPanelForm.children('div[ns-class="select"]');
	//date
	config.$editPanelDate = config.$editPanelForm.children('div[ns-class="date"]');
	config.$editPanelDateInput = config.$editPanelDate.children('input');
	//textarea
	config.$editPanelTextarea = config.$editPanelForm.children('div[ns-class="textarea"]');
	config.$editPanelTextareaInput = config.$editPanelTextarea.children('textarea');
	//multiinput
	config.$editPanelMultiinput = config.$editPanelForm.children('div[ns-class="multiinput"]');
	config.$editPanelMultiinputInput = config.$editPanelMultiinput.children('div');
	//checkbox
	config.$editPanelCheckbox = config.$editPanelForm.children('div[ns-class="checkbox"]');
	config.$editPanelCheckboxInput = config.$editPanelCheckbox.children('div');
	//checkboxajax
	config.$editPanelCheckboxajax = config.$editPanelForm.children('div[ns-class="checkboxajax"]');
	config.$editPanelCheckboxajaxInput = config.$editPanelCheckboxajax.children('div');
	//multiselect
	config.$editPanelMultiselect = config.$editPanelForm.children('div[ns-class="multiselect"]');
}
//多选事件
NetstarUI.resultTable.mulitSelectTD = function(){
	var config = this.config;
	var start = {}; 	//开始坐标 x,y
	var end = {};		//结束坐标 x,y
	var tablePosition = {}; 		//表格左上角坐标可见位置 x,y
	var containerPosition = {}; //容器位置
	var $firstTD = config.$container.find('table:first tbody tr:first td[ns-type]:first');
	var $endTD = config.$container.find('table:last tbody tr:last td[ns-type]:last');
	var $selectZone;

	//添加选择区域
	if(config.$container.children('.select-zone')>0){
		config.$container.children('.select-zone').remove();
	}
	config.$container.append('<div id="resultTableSelectZone" class="select-zone" style="display:none"></div>');
	$selectZone = config.$container.children('#resultTableSelectZone');
	config.$selectZone = $selectZone;

	//mouseDown 开始画
	function selectStart(ev){
		if($(ev.target).closest('#resultTableContainer-inputcomponent').length!=0){
			//如果是在输入组件里面，则不执行
			return;
		}else{
			ev.preventDefault();
		}
		//ev.preventDefault();
		//debugger
		//表格位置
		tablePosition.x = $firstTD.offset().left;
		tablePosition.y = $firstTD.offset().top;
		//开始
		start.x = ev.pageX;
		start.y = ev.pageY;
		//容器位置
		containerPosition.left = config.$container.offset().left;
		containerPosition.top = config.$container.offset().top;
		containerPosition.right = containerPosition.left + config.$container.outerWidth();
		containerPosition.bottom = containerPosition.top + config.$container.outerHeight();
		
		$(document).off('mouseup',selectEnd);
		$(document).on('mouseup',selectEnd);

		$(document).off('mousemove',selectMove);
		$(document).on('mousemove',selectMove);
	}
	//画出选择区域
	function selectMove(ev){
		var move = {
			x:ev.pageX,
			y:ev.pageY
		}
		if(Math.abs(move.x-start.x)<10 && Math.abs(move.y-start.y)<10){
			//位置移动小于20则视为点击
			$selectZone.css('display','none');
		}else{
			ev.stopPropagation();
			//根据拖拽方向 判断上下左右
			var zone =  {};
			if(start.x < ev.pageX){
				zone.left = start.x-containerPosition.left;
				zone.right = containerPosition.right - ev.pageX;
			}else{
				zone.left = ev.pageX - containerPosition.left;
				zone.right = containerPosition.right - start.x;
			}

			if(start.y < ev.pageY){
				zone.top = start.y-containerPosition.top;
				zone.bottom = containerPosition.bottom - ev.pageY;
			}else{
				zone.top = ev.pageY - containerPosition.top;
				zone.bottom = containerPosition.bottom - start.y;
			}
			$selectZone.css({
				'display':'block', 
				'top':zone.top, 
				'left':zone.left, 
				'right':zone.right, 
				'bottom':zone.bottom
			});
		}
	}
	//画选择区域完成，鼠标mouseup
	function selectEnd(ev){
		$(document).off('mouseup',selectEnd);
		$(document).off('mousemove',selectMove);
		//结束
		end.x = ev.pageX;
		end.y = ev.pageY;
		if(Math.abs(end.x-start.x)<10 && Math.abs(end.y-start.y)<10){
			//位置移动小于20则视为点击
			$selectZone.css('display','none');
		}else{
			ev.stopPropagation();
			//隐藏输入表单
			config.$editPanel.css('display','none');
			var selectZonePostion =  {};
			//不是绝对定位用的，就是x1,y1,x2,y2,对角坐标点
			if(start.x < ev.pageX){
				selectZonePostion.x1 = start.x-containerPosition.left;
			}else{
				selectZonePostion.x1 = ev.pageX - containerPosition.left;
			}
			selectZonePostion.x2 = selectZonePostion.x1 + $selectZone.outerWidth();

			if(start.y < ev.pageY){
				selectZonePostion.y1 = start.y-containerPosition.top;
			}else{
				selectZonePostion.y1 = ev.pageY - containerPosition.top;
			}
			selectZonePostion.y2 = selectZonePostion.y1 + $selectZone.outerHeight();

			getSelectTD(selectZonePostion);
			$selectZone.css('display','none');
			$(document).off('click',clickCancelSelectTDHandler);
			setTimeout(function(timerEvent){
				$(document).on('click',clickCancelSelectTDHandler);
			},500);
		}
	}
	//获取选中单元格并标注
	function getSelectTD(zone){
		//取消上次选择的
		config.$container.find('.inselectzone').removeClass('inselectzone');
		//添加新的
		var selectedTdID = [];
		for(tdID in NetstarUI.resultTable.data.tdData){
			var tdPosition = {};
			var $td = NetstarUI.resultTable.data.tdData[tdID].$td
			var tdOffset = $td.offset();
			tdPosition.x1 = tdOffset.left-containerPosition.left;
			tdPosition.x2 = tdPosition.x1+$td.outerWidth();
			tdPosition.y1 = tdOffset.top-containerPosition.top;
			tdPosition.y2 = tdPosition.y1+$td.outerHeight();
			//返回是否在区域内
			function getIsInSelect(){
				//排除掉范围外的剩下的是选择范围内的
				if(tdPosition.x2<zone.x1 || tdPosition.x1>zone.x2){
					return false;
				}
				if(tdPosition.y2<zone.y1 || tdPosition.y1>zone.y2){
					return false;
				}
				return true;
			}
			var isInSelect = getIsInSelect();
			if(isInSelect){
				selectedTdID.push(tdID);
				$td.addClass('inselectzone');
			}
		}
		NetstarUI.resultTable.selected = selectedTdID;
	}
	//添加单击取消选择事件
	function clickCancelSelectTDHandler(ev){
		$(document).off('click',clickCancelSelectTDHandler);
		config.$container.find('.inselectzone').removeClass('inselectzone');
	}
	//启动监听
	config.$container.off('mousedown',selectStart);
	config.$container.on('mousedown',selectStart);
}
//初始化历史记录面板
NetstarUI.resultTable.initHistoryPanel = function(config,data){
}
//控制面板
NetstarUI.resultTable.initControlPanel = function(config,data){
	if(config.isUseControlPanel == false){
		return;
	}
	$controlPanel = $('#resultTableControlPanel');
	config.$controlPanel = $controlPanel;
	var btnArr =
		[
			{
				text: 		'复制',
				handler: 	NetstarUI.resultTable.copy,
				isShowText: false,
				index:{
					fid:0
				}
			},{
				text: 		'粘贴',
				handler: 	NetstarUI.resultTable.paste,
				isShowText: false
			},
			// {
			// 	text: 		'批量编辑',
			// 	handler: 	NetstarUI.resultTable.multiedit,
			// 	isShowText: false
			// },
			{
				text: 		'预览模式',
				handler: 	NetstarUI.resultTable.previewMode,
				isShowText: false
			},{
				text: 		'输入模式',
				handler: 	NetstarUI.resultTable.inputMode,
				isShowText: false
			},{
				text: 		'全屏模式',
				handler: 	NetstarUI.resultTable.fullScreenMode,
				isShowText: false
			},{
				text: 		'退出全屏',
				handler: 	NetstarUI.resultTable.exitFullScreenMode,
				isShowText: false
			},{
				text: 		'离线模式',
				handler: 	NetstarUI.resultTable.offlineMode,
				isShowText: false
			},{
				text: 		'退出离线',
				handler: 	NetstarUI.resultTable.exitOfflineMode,
				isShowText: false
			}
		]
	config.btns = btnArr;
	if(typeof(config.initControlPanelHandler)=='function'){
		btnArr = config.initControlPanelHandler(btnArr);
	}
	//lyw 对按钮处理后
	if(btnArr.length == 0){
		$("#resultTableContainer").css('padding-top',4+'px');
	}
	nsButton.initBtnsByContainerID('resultTableControlPanel', btnArr, true);
}

//发送自动保存的数据
NetstarUI.resultTable.autoSubmitHandler = function(){
	if($.isArray(NetstarUI.resultTable.autoSubmitData) == false){
		return;
	}
	var config = NetstarUI.resultTable.config;
	var formatSubmitData = [];
	
	for(var sdI = 0; sdI<NetstarUI.resultTable.autoSubmitData.length; sdI++){
		cdata = NetstarUI.resultTable.autoSubmitData[sdI];
		switch(cdata.type){
			case 'multiinput':
				//multiinput要拆分数据后发送
				for(var subValueKey in cdata.value.data){
					var tdValue = {};
					tdValue.id = cdata.value.data[subValueKey].id;
					tdValue.value = cdata.value.real[subValueKey].toString();
					tdValue.data = cdata.value.data[subValueKey];
					if(subValueKey == cdata.main){
						tdValue.visible = cdata.value.visible;
					}
					tdValue.type = cdata.type;
					tdValue.autoSubmit = true;
					formatSubmitData.push(tdValue);
				}
				break;
			default:
				//case 'checkboxajax':
				var tdValue = {};
				tdValue.id = cdata.nsId;
				tdValue.visible = cdata.value.visible;
				tdValue.value = cdata.value.real.toString();
				tdValue.data = cdata.value.data;
				tdValue.type = cdata.type;
				tdValue.autoSubmit = true;
				formatSubmitData.push(tdValue);
				break;
		}
	}
	config.saveAjax.data.jsonRows = JSON.stringify(formatSubmitData);
	//在线和离线两种模式
	if(NetstarUI.resultTable.offlineState){
		console.log('offlineState');
		NetstarUI.resultTable.addStorage(function(data){
			console.log('OK');
			//成功了啥都不干
		}, function(error){
			console.log(error);
		}, {
			url:config.saveAjax.url,
			body:JSON.stringify(config.saveAjax.data)
		});
	}else{
		$.ajax({
			url: 		config.saveAjax.url,
			data: 		config.saveAjax.data,
			type: 		config.saveAjax.type,
			dataType: 	'json',
			success:function(data){
				if(data.success){
					//成功了啥都不干
				}else{
					nsalert(data.result);
				}
			},
			error:function(error){
				nsVals.defaultAjaxError(error);
			}
		});
	}
}

/**2017-11-24***/
//单元格悬停事件
NetstarUI.resultTable.tdMouseenterHandler = function(ev){
	var $td = $(this);
	NetstarUI.resultTable.showContentPanel($td);
}
//单元格移除悬停事件
NetstarUI.resultTable.tdMouseleaveHandler = function(ev){
	var timer = $(this).data("timer");
	if($('.resultTable-tooltip-title').length > 0){
		$('.resultTable-tooltip-title').remove()
	}
	clearTimeout(timer);
}

//单元格单击事件
NetstarUI.resultTable.tdClickHandler = function(ev){
	var $td = $(this);
	var inputResizeData = NetstarUI.resultTable.getResizeDataByDom($td);
	inputResizeData.$target = $(ev.target);
	NetstarUI.resultTable.showEditPanel(inputResizeData);
}
//根据目标ID，返回输入组件所需的基础数据
NetstarUI.resultTable.getResizeDataByDom = function($dom){
	var cid = $dom.attr('id');
	var tdData = NetstarUI.resultTable.data.tdData[cid];
	//top值要区分 是否全屏模式全屏模式要添加滚动偏差值
	//debugger
	// console.log('$dom.position().top;:'+$dom.position().top);
	// console.log('scrollTop:'+NetstarUI.resultTable.config.$container.scrollTop());
	var topNumber = $dom.position().top;
	// if(NetstarUI.resultTable.fullScreenState){
		topNumber += NetstarUI.resultTable.config.$container.scrollTop(); //lyw
	// }
	var inputResizeData = {
		id:cid,
		nsID:$dom.attr('ns-id'),
		top: topNumber,
		left: $dom.position().left,
		height:$dom.outerHeight()+1,
		width:$dom.outerWidth()+1,
		tdData:tdData,
	}
	// inputResizeData.top = inputResizeData.top + NetstarUI.resultTable.config.$container.scrollTop();
	// inputResizeData.top = inputResizeData.top;
	inputResizeData.left = inputResizeData.left + NetstarUI.resultTable.config.$container.scrollLeft();
	// console.warn(inputResizeData.top);
	return inputResizeData;
}

/*********2017-11-24***********************/
//鼠标悬停事件
NetstarUI.resultTable.showContentPanel = function($td){
	if($('.resultTable-tooltip-title').length > 0){
		$('.resultTable-tooltip-title').remove()
	}
	var timer = $td.data("timer");
	clearTimeout(timer);
	var that = $td;
	var timerNumber = 500;
	var config = NetstarUI.resultTable.config;
	if(typeof(config.timer)=='number'){
		timerNumber = config.timer;
	}
	timer = setTimeout(function() {
		var config = NetstarUI.resultTable.config;
		var inputResizeData = NetstarUI.resultTable.getResizeDataByDom(that);
		var textStr = $.trim(inputResizeData.tdData.value.visible);
		if(textStr){
			var tooltipHtml = "<div class='resultTable-tooltip-title'>"+textStr+"</div>";
			config.$container.append(tooltipHtml)
		}
	}, timerNumber);
	$td.data("timer", timer);
}

//改变input输入组件大小
NetstarUI.resultTable.showEditPanel = function(resizeData){
	//inputResizeData = {
	// 	id：tdID
	// 	nsID:全名ID(tableID+'.'+trID+'.'+tdID)
	// 	top: 以面板为坐标的x
	// 	left:以面板为坐标的y
	//  height: 高
	//  width: 	宽
	// 	tdData:当前数据
	// }
	var config = NetstarUI.resultTable.config
	var $input = config.$editPanel;
	//var $currentInputPanel = $input.children('.component-container').children('div[ns-class="'+resizeData.tdData.type+'"]');
	var tdData = resizeData.tdData;

	//切换显示状态
	$input.attr('class','input-component '+tdData.type);
	$input.children('.component-container').children('div.show').removeClass('show');
	var type = tdData.type;
	//readonly 或者loading中都不能用
	if(tdData.readonly || tdData.state=='process'){
		type = 'none';
		config.$editPanelNone.addClass('show');
	}else{
		var upperType = type.substring(0,1).toUpperCase() + type.substring(1);
		config['$editPanel'+upperType].addClass('show');
	}
	
	var cssObj = {
		display:'block',
		top:resizeData.top+'px',
		left:resizeData.left+'px',
		height:resizeData.height+'px',
		width:resizeData.width+'px'
	};
	NetstarUI.resultTable.config.$editPanel.css(cssObj);
	
	//快捷键重置
	NetstarUI.resultTable.shortkeyType = 'table';	
	switch(type){
		case 'none':
			break;
		case 'string':
			NetstarUI.resultTable.stringInit(resizeData);
			break;
		case 'number':
			NetstarUI.resultTable.numberInit(resizeData);
			break;
		case 'select':
			NetstarUI.resultTable.inputSelectInit(resizeData);
			break;
		case 'date':
			NetstarUI.resultTable.dateInit(resizeData);
			break;
		case 'textarea':
			NetstarUI.resultTable.textareaInit(resizeData);
			break;
		case 'multiinput':
			NetstarUI.resultTable.multiinputInit(resizeData);
			break;
		case 'uploadtitle':
			NetstarUI.resultTable.uploadtitleInit(resizeData);
			break;
		case 'checkbox':
			NetstarUI.resultTable.checkboxInit(resizeData);
			break;
		case 'checkboxajax':
			NetstarUI.resultTable.checkboxAjaxInit(resizeData);
			break;
		case 'multiselect':
			NetstarUI.resultTable.inputMultiselectInit(resizeData);
			break;
		case 'multiupload':
			//多图片上传 sjj20180319
			NetstarUI.resultTable.multiuploadInit(resizeData);
			break;
		default:
			if(debugerMode){
				console.error('输入类型未定义'+resizeData.tdData.type);
				console.error(resizeData.tdData);
			}
			break;
	}
	NetstarUI.resultTable.currentTdID = resizeData.id;
}
//添加验证规则
NetstarUI.resultTable.addRules = function(tdData){
	if(tdData.type == 'number'){
		if(typeof(tdData.rules)!='string'){
			tdData.rules = 'number';
		}else{
			if(tdData.rules.indexOf('number')==-1){
				tdData.rules += ' number';
			}
		}
	}
	if(typeof(tdData.rules)=='undefined'){
		$('#resultTableContainer-inputcomponent-form').validate().resetForm();
		return;
	}

	$('#resultTableContainer-inputcomponent-form').validate().resetForm();

	var value = {};
	var rulesArr = tdData.rules.split(' ');
	for(var ruleI = 0; ruleI < rulesArr.length; ruleI ++){
		var getRulesStr = nsValid.getRules(rulesArr[ruleI],'resultTableContainer-inputcomponent-form');
		value[getRulesStr.type] = getRulesStr.rules;
	}
	var inputID = 'resultTableContainer-inputcomponent-input-'+tdData.type;
	
	switch(tdData.type){
		case 'string':
		case 'number':
			$('#'+inputID).rules('remove');
			$('#'+inputID).rules('add',value);
			break;
		default:
			if(debugerMode){
				console.error('不能识别的验证控件类型：'+tdData.type);
				console.error(tdData);
			}
			break;
	}	
}
//文本框初始化
NetstarUI.resultTable.stringInit = function(resizeData){
	var tdData = resizeData.tdData;
	var $currentInput = this.config.$editPanelStringInput;
	// console.log(resizeData);
	var inputValue = tdData.value.visible;
	$currentInput.val(inputValue);
	if(typeof(tdData.maskString)=='string'){
		$currentInput.inputmask(tdData.maskString);
	}else{
		if($currentInput.inputmask){
			$currentInput.inputmask('remove');
		}
	}
	$currentInput.select();
	NetstarUI.resultTable.addRules(tdData);
	//lyw
	if($("#resultTableContainer-inputcomponent").find("div.shortcut-html-input")){
		$("#resultTableContainer-inputcomponent").find("div.shortcut-html-input").remove();
	}
	if(tdData.originalType == "string"){
		$("#resultTableContainer-inputcomponent-input-string").off('keyup');
		$("#resultTableContainer-inputcomponent-input-string").off('keydown');
		if(typeof(tdData.subdata) == "object"){
			if(tdData.subdata.isUseHtmlInput){
				var tdDataConfiger = {
					$container:$("#resultTableContainer-inputcomponent"),
					$input:$("#resultTableContainer-inputcomponent-input-string"),
					value:tdData.value.visible
				}
				NetstarUI.htmlInput.init(tdDataConfiger,"resulttable");
			}else{
				// $("#resultTableContainer-inputcomponent-input-string").off('keyup');
				// $("#resultTableContainer-inputcomponent-input-string").off('keydown');
			}
		}
	}	
}
//数字框初始化
NetstarUI.resultTable.numberInit = function(resizeData){
	var tdData = resizeData.tdData;
	var $currentInput = this.config.$editPanelNumberInput;
	var inputValue = tdData.value.real;
	//科学计数法显示原始值
	//if(tdData.originalType == 'scientificInput'){
	// 	inputValue = tdData.value.real;
	//}
	$currentInput.val(inputValue);
	$currentInput.select();
	NetstarUI.resultTable.addRules(tdData);
}
//转化成科学计数法的显示值
NetstarUI.resultTable.getScientificValue = function(subdata, realValue){
	var visibleStr = '';
	var realNumber = 0;
	var pointPlace = subdata.pointPlace;
	var integerPlace = subdata.integerPlace;
	var isShowOne = typeof(subdata.isShowOne)=='boolean' ? subdata.isShowOne : true;
	if(typeof(realValue)=='string'){
		if(realValue==''){
			visibleStr = '';
		}else{
			realNumber = parseFloat(realValue);
			var neg = "";  //前缀正负号
			if(realNumber==0){
				visibleStr = '0';
			}else{
				//如果值小于0
				if(realNumber<0){
					neg = "-";
					realNumber = Math.abs(realNumber);
				}
				subdata.min = typeof(subdata.min) == 'number' ? subdata.min : -99999999999999999999;
				subdata.max = typeof(subdata.max) == 'number' ? subdata.max : 99999999999999999999;
				if(realNumber<subdata.min || realNumber>subdata.max){
					var n = 0;
					var n = NetstarUI.resultTable.floatCharge(Math.log(realNumber),Math.LN10);	//返回指定数字以 10 为底的对数 
					var num = Math.pow(10,n);					 	//表示10的n次幂
					realNumber = realNumber / num;
					//如果是小于1的 上述计算需要处理为科学计数法位数
					if(realNumber<1){
						realNumber = realNumber*10;
						if(n<0){
							n = n-1;
						}else if(n>0){
							n = n+1;
						}
					}
					if(integerPlace == 2){
						//取整
						realNumber = realNumber.toFixed(pointPlace);
						realNumber = parseFloat(realNumber);
					}else if(integerPlace == 0){
						//四舍五入
						//保留几位小数点
						if(pointPlace>=1){
							realNumber = Math.round(realNumber*(Math.pow(10,pointPlace)))/(Math.pow(10,pointPlace));
						}else if(pointPlace==0){
							realNumber = Math.round(realNumber);
						}
					}else if(integerPlace == 1){
						//四舍六入
						//保留几位小数
						realNumber = NetstarUI.resultTable.formatFloat(realNumber,pointPlace);
					}
					visibleStr = neg + realNumber+' * 10<sup>'+n+'</sup>';
					if(isShowOne == false && Number(realNumber)==1){
						visibleStr = neg + ' 10<sup>'+n+'</sup>';
					}
				}else{
					visibleStr = realValue;
				}
			}
		}
	}
	return visibleStr;
}

//四舍六入
NetstarUI.resultTable.formatFloat = function(num,precision){
	var carry = 0; //存放进位标志
	var num,multiple; //num为原浮点数放大multiple倍后的数，multiple为10的length次方
	var str = num + ''; //将调用该方法的数字转为字符串
	var dot = str.indexOf("."); //找到小数点的位置  12345 1.234  5后非0就近1 5后为零看5前 ，5前为偶不进 ，为奇数就近1
	//12346  1.235
	//如果是5 ，判断前面那位是否是偶数，偶数不进，奇数进
	var prevNum = str.substr(dot+precision,1);
	var curNum = str.substr(dot+precision+1,1);
   	var afterNum = str.substr(dot+precision+2,1);
   	var isPosition = false;
	if(Number(curNum) == 5){
		if(Number(afterNum)==0){
			isPosition = true;
		}
	}
	if(isPosition){
		var isOdd = (prevNum%2 ==0) ? true:false;
    	if(isOdd == false){carry=1;}
    }else{
		if(str.substr(dot+precision+1,1)>=5) carry=1; //找到要进行舍入的数的位置，手动判断是否大于等于5，满足条件进位标志置为1
    }
	
	multiple = Math.pow(10,precision); //设置浮点数要扩大的倍数
	num = Math.floor(num * multiple) + carry; //去掉舍入位后的所有数，然后加上我们的手动进位数
	var result = num/multiple + ''; //将进位后的整数再缩小为原浮点数
	dot = result.indexOf(".");
	if(dot < 0){
	    result += '.';
	    dot = result.indexOf(".");
	}
	var len = result.length - (dot+1);
	if(len < precision){
	    for(var i = 0; i < precision - len; i++){
	        result += 0;
	    }
	}
	return result;
}
//浮点数精确转换
NetstarUI.resultTable.floatCharge = function(a,b){
	var o1 = NetstarUI.resultTable.floatToInteger(a);
	var o2 = NetstarUI.resultTable.floatToInteger(b);
	var n1 = o1.num;
	var n2 = o2.num;
	var t1 = o1.times;
	var t2 = o2.times;
	var value = (n1 / n2) * (t2 / t1);
	var valueStr = value.toString();
	var pointPosition = valueStr.length - valueStr.indexOf('.')-1;
	value = value.toFixed(pointPosition - 1);
	value = parseInt(value);
	return value;
}
NetstarUI.resultTable.floatToInteger = function(floatNum){
	var ret = {times: 1, num: 0};
	if (isInteger(floatNum)) {
		ret.num = floatNum;
		return ret;
	}
	/*
	* 判断obj是否为一个整数
	*/
	function isInteger(obj) {
		return Math.floor(obj) === obj;  //Math.floor 向下取整
	}
	var strfi = floatNum + '';//转换成字符串处理
	var dotPos = strfi.indexOf('.');//小数点位置
	var len = strfi.substr(dotPos+1).length;
	var times = Math.pow(10, len);//以10 为底的 y 次方值
	var intNum = parseInt(floatNum * times + 0.5, 10);
	ret.times = times;
	ret.num = intNum;
	return ret;
}
//文本下拉框初始化
NetstarUI.resultTable.inputSelectInit = function(resizeData){
	//select 下拉框选中事件
	function selectClick(ev){
		var selectValue = $(this).html();
		var selectId = $(this).attr('ns-id');
		$currentInput.val(selectValue);
		var value = {
			real:selectId,
			visible:selectValue
		}
		NetstarUI.resultTable.saveTdData(tdData.id,value);
		NetstarUI.resultTable.refreshTd(tdData.id);
		closeSelect();
	}
	function closeSelect(){
		$currentInputPanel.children('div.select-list').addClass('hide');
		NetstarUI.resultTable.shortkeyType = 'table';
	}
	function outerClickHandler(ev){
		var isInInputComponent = $(ev.target).closest('.input-component').length;
		if(isInInputComponent==0){
			$(document).off('mousedown',outerClickHandler);
			$currentInputPanel.children('div.select-list').addClass('hide');
			NetstarUI.resultTable.shortkeyType = 'table';
		}
	}
	//初始化过程
	var $editPanel = NetstarUI.resultTable.config.$editPanel;
	var $currentInputPanel = $editPanel.children('.component-container').children('div[ns-class="'+resizeData.tdData.type+'"]');
	var tdData = resizeData.tdData;
	$currentInputPanel.html('<input id="resultTableContainer-inputcomponent-input-select"  name="resultTableContainer-inputcomponent-input-select" type="text">');
	var $currentInput = $currentInputPanel.children('input');
	$currentInput.val(tdData.value.visible);
	$currentInput.select();
	if(debugerMode){
		if($.isArray(tdData.subdata)==false){
			console.error('id:'+tdData.id+'的subdata属性未定义');
		}
	}
	//拼接下拉框内容
	var subdata = tdData.subdata;
	var selectHtml = '';
	for(var subdataI=0; subdataI<subdata.length; subdataI++){
		var optionClass = 'select-list-option';
		if(subdata[subdataI]==tdData.value.visible){
			optionClass += ' current';
		}
		optionClass = 'class="'+optionClass+'"';
		var nameStr = subdata[subdataI];
		var idStr = subdata[subdataI];
		if(typeof(subdata[subdataI])=='object'){
			nameStr = subdata[subdataI].name;
			idStr = subdata[subdataI].id;
		}
		selectHtml += '<a '+optionClass+' href="javascript:void(0);" ns-id="'+idStr+'">'+nameStr+'</a>';
	}
	if(subdata.length==0){
		selectHtml += '<div class="empty">未定义下拉选项</div>';
	}
	selectHtml = '<div class="select-list" style="top:'+(resizeData.height-2)+'px; width:'+resizeData.width+'px; ">'+selectHtml+'</ul>';
	$currentInputPanel.append(selectHtml);
	//选中确认事件
	$currentInputPanel.children('div.select-list').children('a').on('click',selectClick);
	//输入框点击或者获得焦点的时候，打开下拉表单
	$currentInput.on('click',function(ev){
		if($currentInputPanel.children('div.select-list').hasClass('hide')){
			$currentInput.select();
			$currentInputPanel.children('div.select-list').removeClass('hide');
			NetstarUI.resultTable.shortkeyType = 'select';
			$(document).on('mousedown',outerClickHandler);
		}
	})
	NetstarUI.resultTable.shortkeyType = 'select';
	$(document).off('mousedown',outerClickHandler);
	$(document).on('mousedown',outerClickHandler);
}
//筛选多选值
NetstarUI.resultTable.inputMultiselectFilter = function(multifilterJson,selectValue,selectId){
	var realArr = multifilterJson.real;
	var visibleArr = multifilterJson.visible;
	if(!$.isArray(realArr)){realArr = [];}
	if(!$.isArray(visibleArr)){visibleArr = [];}
	if(selectValue){
		var isExistVal = -1;
		for(var i=0;i<visibleArr.length;i++){if(visibleArr[i]==selectValue){isExistVal = i;}}
		if(isExistVal == -1){visibleArr.push(selectValue);}else{visibleArr.splice(isExistVal,1);}
	}
	if(selectId){
		var isExistId = -1;
		for(var r=0;r<realArr.length;r++){if(realArr[r]==selectId){isExistId = r;}}
		if(isExistId == -1){realArr.push(selectId);}else{realArr.splice(isExistId,1);}
	}
	var realStr = '';
	var visibleStr = '';
	visibleStr = visibleArr.join(',');
	realStr = realArr.join(',');
	return [realStr,visibleStr];
}
//多选下拉框
NetstarUI.resultTable.inputMultiselectInit = function(resizeData){
	var $editPanel = NetstarUI.resultTable.config.$editPanel;
	var $currentInputPanel = $editPanel.children('.component-container').children('div[ns-class="'+resizeData.tdData.type+'"]');
	var tdData = resizeData.tdData;
	$currentInputPanel.html('<div class="resultTableContainer-inputcomponent-panel-multiselect">');
	var $currentInput = $currentInputPanel.children('.resultTableContainer-inputcomponent-panel-multiselect');
	//$currentInput.html(tdData.value.visible);
	$currentInput.select();
	//拼接下拉框内容
	var subdata = tdData.subdata;
	var selectHtml = '';
	var selectedArr;
	if(tdData.value.visible === ''){selectedArr = [];}else{selectedArr = tdData.value.visible.split(',');}
	if(subdata.length > 0){
		selectHtml += '<div class="multiselect-search-panel"><input type="text" class="multiselect-search" /></div>'
					+'<div class="select-scroll">';
		for(var subdataI=0; subdataI<subdata.length; subdataI++){
			var optionClass = 'select-list-option';
			for(var selectI=0; selectI<selectedArr.length; selectI++){
				if(subdata[subdataI].name == selectedArr[selectI]){
					optionClass += ' current';
				}
			}
			optionClass = 'class="'+optionClass+'"';
			var nameStr = subdata[subdataI].name;
			var idStr = subdata[subdataI].id;
			selectHtml += '<a '+optionClass+' href="javascript:void(0);" ns-id="'+idStr+'">'+nameStr+'</a>';
		}
		selectHtml += '</div>';
	}else{
		selectHtml += '<div class="empty">未定义下拉选项</div>';
	}
	selectHtml = '<div class="select-list" style="top:'+(resizeData.height-2)+'px; width:'+resizeData.width+'px; ">'+selectHtml+'</div>';
	$currentInputPanel.append(selectHtml);
	//$currentInput.closest('.resultinput').scrollTop($('.input-multiselect').offset().top-50);
	//选中确认事件
	var $selectList = $currentInputPanel.children('div.select-list');
	$selectList.find('a').off('click',selectClick);
	$selectList.find('a').on('click',selectClick);
	var inputValue = '';
	$selectList.find('input[type="text"]').on('keyup',function(ev){
		var $this = $(this);
		var value = $.trim($this.val());
		var subdata = tdData.subdata;
		var filterArr = [];
		var isUseListData = false;
		if(inputValue == value){
			//如果相等则不用重新搜索
			isUseListData = true;
		}else{
			inputValue = value;
		}
		if(!isUseListData){
			var regStr = /^[a-zA-Z_]*$/;
			if(regStr.test(value)){
				//如果是字母则不区分大小写
				value = value.toLowerCase();
			}
			for(var i=0; i<subdata.length; i++){
				var name = subdata[i].name.toLowerCase();
				if(name.indexOf(value) > -1){
					//刷新数据
					filterArr.push(subdata[i]);
				}
			}
			refreshSelect(filterArr);
		}
	});
	function refreshSelect(filterData){
		var html = '';
		if(filterData.length > 0){
			html = '<div class="select-scroll">';
			for(var subdataI=0; subdataI<filterData.length; subdataI++){
				var optionClass = 'select-list-option';
				for(var selectI=0; selectI<selectedArr.length; selectI++){
					if(filterData[subdataI].name == selectedArr[selectI]){
						optionClass += ' current';
					}
				}
				optionClass = 'class="'+optionClass+'"';
				var nameStr = filterData[subdataI].name;
				var idStr = filterData[subdataI].id;
				html += '<a '+optionClass+' href="javascript:void(0);" ns-id="'+idStr+'">'+nameStr+'</a>';
			}
			html += '</div>';
		}else{
			html = '<div class="empty">未定义下拉选项</div>';
		}
		$selectList.children('.multiselect-search-panel').siblings().remove();
		$selectList.append(html);
		$selectList.find('a').off('click',selectClick);
		$selectList.find('a').on('click',selectClick);
	}
	//输入框点击或者获得焦点的时候，打开下拉表单
	$currentInput.on('click',function(ev){
		if($currentInputPanel.children('div.select-list').hasClass('hide')){
			$currentInput.select();
			$currentInputPanel.children('div.select-list').removeClass('hide');
			NetstarUI.resultTable.shortkeyType = 'multiselect';
			$(document).on('mousedown',outerClickHandler);
		}
	})
	NetstarUI.resultTable.shortkeyType = 'multiselect';
	$(document).off('mousedown',outerClickHandler);
	$(document).on('mousedown',outerClickHandler);
	var multiValue = {
		real:tdData.value.real,
		visible:tdData.value.visible
	};
	var multifilterJson = {
		real:[],
		visible:[]
	};
	if(tdData.value.real){
		multifilterJson.real = tdData.value.real.split(',');
		multifilterJson.visible = tdData.value.visible.split(',');
	}
	NetstarUI.resultTable.multiselectJson = multifilterJson;
	function selectClick(ev){
		var $this = $(this);
		var selectValue = $.trim($this.html());
		var selectId = $.trim($this.attr('ns-id'));
		if($this.hasClass('current')){
			//已经选中是取消选中
			$this.removeClass('current');
		}else{
			$this.addClass('current')
		}
		var valueStr = NetstarUI.resultTable.inputMultiselectFilter(multifilterJson,selectValue,selectId);
		NetstarUI.resultTable.multiselectJson = valueStr;
		multiValue.real = valueStr[0];
		multiValue.visible = valueStr[1];
		tdData.$td.html(multiValue.visible);
		//NetstarUI.resultTable.saveTdData(tdData.id,value);
		//NetstarUI.resultTable.refreshTd(tdData.id);
		//closeSelect();
	}
	function closeSelect(){
		$currentInputPanel.children('div.select-list').addClass('hide');
		NetstarUI.resultTable.shortkeyType = 'table';
	}
	function outerClickHandler(ev){
		var isInInputComponent = $(ev.target).closest('.input-component').length;
		if(isInInputComponent==0){
			$(document).off('mousedown',outerClickHandler);
			$currentInputPanel.children('div.select-list').addClass('hide');
			NetstarUI.resultTable.shortkeyType = 'table';
		}
	}
}
//文本下拉框快捷键
NetstarUI.resultTable.inputSelectShortkey = function(direction){
	var $inputPlane = NetstarUI.resultTable.config.$editPanel;
	var $panel = $inputPlane.children('.component-container').children('div[ns-class="select"]');
	var $selectList = $panel.children('.select-list');

	var $currentOption = $selectList.children('.current');
	var $input = $panel.children('input');
	var $targetOption;
	var isMove = true;
	switch(direction){
		case 'up':
			$input.blur();
			if($currentOption.length>0){
				$targetOption = $currentOption.prev();
			}else{
				$targetOption = $selectList.children('a.select-list-option:last');
			}
			break;
		case 'down':
			$input.blur();
			if($currentOption.length>0){
				$targetOption = $currentOption.next();
			}else{
				$targetOption = $selectList.children('a.select-list-option:first');
			}
			
			break;
		case 'enter':
			isMove = false;
			break;
		default:
			if(debugerMode){
				console.error('NetstarUI.resultTable.inputSelectShortkey 中不能识别的方向:'+direction)
			}
	}

	if(isMove){
		//是移动，上下操作
		if($targetOption.length!=0){
			$targetOption.addClass('current');
			$currentOption.removeClass('current');
		}
	}else{
		//非移动 回车操作
		var isInputFocus = $input.is(':focus');
		var value = '';
		if(isInputFocus){
			value = $input.val();
		}else{
			value = $currentOption.html();
		}
		value = {visible:value, real:value}
		NetstarUI.resultTable.saveTdData(NetstarUI.resultTable.currentTdID,value);
		NetstarUI.resultTable.refreshTd(NetstarUI.resultTable.currentTdID);
	}
}
NetstarUI.resultTable.inputMultiselectShortKey = function(direction,event){
	var $inputPlane = NetstarUI.resultTable.config.$editPanel;
	var $panel = $inputPlane.children('.component-container').children('div[ns-class="multiselect"]');
	var $selectList = $panel.children('.select-list').children('.select-scroll');

	var $currentOption = $selectList.children('.selected');
	if($currentOption.length >1){$currentOption = $currentOption.eq(0)};
	var $targetOption;
	var isMove = true;
	switch(direction){
		case 'up':
			if($currentOption.length>0){
				$targetOption = $currentOption.prev();
			}else{
				$targetOption = $selectList.children('a.select-list-option:last');
			}
			$targetOption.addClass('current');
			$currentOption.removeClass('current');
			$targetOption.addClass('selected');
			$currentOption.removeClass('selected');
			break;
		case 'down':
			if($currentOption.length>0){
				$targetOption = $currentOption.next();
			}else{
				$targetOption = $selectList.children('a.select-list-option:first');
			}
			$targetOption.addClass('current');
			$currentOption.removeClass('current');
			$targetOption.addClass('selected');
			$currentOption.removeClass('selected');
			break;
		case 'enter':
			isMove = false;
			//非移动 回车操作
			var valArr = NetstarUI.resultTable.inputMultiselectFilter(NetstarUI.resultTable.multiselectJson);
			var valueStr = valArr[1];
			var idsStr = valArr[0];
			var valueJson = {visible:valueStr, real:idsStr};
			NetstarUI.resultTable.saveTdData(NetstarUI.resultTable.currentTdID,valueJson);
			NetstarUI.resultTable.refreshTd(NetstarUI.resultTable.currentTdID);
			break;
		case 'space':
			//空格
			//空格触发选中事件
			event.preventDefault();	
			var value = $.trim($currentOption.html());
			var id = $.trim($currentOption.attr('ns-id'));
			var valArr = NetstarUI.resultTable.inputMultiselectFilter(NetstarUI.resultTable.multiselectJson,value,id);
			var valueStr = valArr[1];
			var idsStr = valArr[0];
			$('#'+NetstarUI.resultTable.currentTdID).html(valueStr);
			$('#'+NetstarUI.resultTable.currentTdID).attr('ns-id',idsStr);
			break;
		default:
			if(debugerMode){
				console.error('NetstarUI.resultTable.inputSelectShortkey 中不能识别的方向:'+direction)
			}
	}

}
//日期
NetstarUI.resultTable.dateInit = function(resizeData){
	
	var tdData = resizeData.tdData;
	var $editPanel = NetstarUI.resultTable.config.$editPanel;
	var $currentInput = this.config.$editPanelDateInput;
	$currentInput.datepicker('destroy');
	var options = {
		language:language.default.language,
		autoclose:true,
		todayHighlight:true,
		format:language.default.dateFormat,
		weekStart:language.default.weekStart,
	}
	options.format = options.format.toLowerCase();
	
	var updateStr = moment(tdData.value.real).format('YYYY-MM-DD');
	$currentInput.val(updateStr);
	
	$currentInput.datepicker(options).off('changeDate');
	$currentInput.datepicker(options).on('changeDate',function(ev){
		var date = ev.date;
		var timeStamp = date.getTime();
		var value = {
			real:timeStamp,
			visible:moment(timeStamp).format(options.format.toUpperCase())
		}
		NetstarUI.resultTable.saveTdData(tdData.id,value);
		NetstarUI.resultTable.refreshTd(tdData.id);
	});
	$currentInput.datepicker('show');
	$currentInput.datepicker('update',updateStr);
	$currentInput.inputmask("9999-99-99");
	$currentInput.focus();

	
	// $currentInput.on('focus',function(ev){
	// 	NetstarUI.resultTable.shortkeyType = 'date-input';
	// 	$currentInput.on('keydown',function(ev){
	// 		ev.stopPropagation(); 
	// 	});
	// })
	NetstarUI.resultTable.shortkeyType = 'date';
}
//textarea初始化
NetstarUI.resultTable.textareaInit = function(resizeData){
	var tdData = resizeData.tdData;
	var $editPanel = NetstarUI.resultTable.config.$editPanel;
	var $currentInput = this.config.$editPanelTextareaInput;

	var widthNumber = tdData.$td.outerWidth() + 1;
	$currentInput.css('width',widthNumber);
	$currentInput.val(tdData.value.real);
	$currentInput.select();
	NetstarUI.resultTable.shortkeyType = 'textarea';
	//lyw
	if($("#resultTableContainer-inputcomponent").find("div.shortcut-html-input")){
		$("#resultTableContainer-inputcomponent").find("div.shortcut-html-input").remove();
	}
	

	if(tdData.originalType == "textarea"){
		$("#resultTableContainer-inputcomponent-input-textarea").off('keyup');
		$("#resultTableContainer-inputcomponent-input-textarea").off('keydown');
		if(typeof(tdData.subdata) == "object"){
			if(tdData.subdata.isUseHtmlInput){
				var tdDataConfiger = {
					$container:$("#resultTableContainer-inputcomponent"),
					$input:$("#resultTableContainer-inputcomponent-input-textarea"),
					// value:tdData.value.visible,
					value:tdData.value.real,
					type:'textarea',
				}
				NetstarUI.htmlInput.init(tdDataConfiger,"resulttable");
			}else{
				// $("#resultTableContainer-inputcomponent-input-textarea").off('keyup');
				// $("#resultTableContainer-inputcomponent-input-textarea").off('keydown');
			}
		}
	}	
}
//multiinput 多输入框组件
NetstarUI.resultTable.multiinputInit = function(resizeData){
	var $container = NetstarUI.resultTable.config.$editPanelMultiinputInput;
	var tdData = resizeData.tdData;
	$container.html(tdData.value.inputVisible);
	$container.css('margin-top','-'+$container.outerHeight()/2+'px');
	for(inputI  in tdData.value.real){
		var inputID = tdData.id +'-'+ inputI;
		$container.find('#'+inputID).val(tdData.value.real[inputI]);
	}
	var targetIndex = 0;
	if(resizeData.$target){
		targetIndex = parseInt(resizeData.$target.attr('ns-keyindex'));
	}
	var $focusInput = $container.find('input').eq(targetIndex);
	$focusInput.focus();
	$focusInput.select();
	NetstarUI.resultTable.shortkeyType = 'multiinput';

	function multiinputShortkey(keyType){
		switch(keyType){
			case 'tab':
				var $tabTargetInput;
				var $currentInput = $container.find('input:focus');
				if($currentInput.length>0){
					$tabTargetInput = $container.find('input').eq($currentInput.index()+1)
					if($tabTargetInput.length==0){
						NetstarUI.resultTable.shortkeyMoveInput('enter');
					}
				}else{
					$tabTargetInput = $container.find('input').eq(0)
				}
				$tabTargetInput.focus();
				$tabTargetInput.select();
				break;
			case 'enter':
				var isEdit = false;
				var currentValue = {
					real:{},
					visible:''
				};
				var visibleHtml = tdData.value.visible;
				//分开取值
				for(inputKey in tdData.value.real){
					var keyValue = $container.find('input[ns-keyname="'+inputKey+'"]').val();
					//获取real
					keyValue = $.trim(keyValue);
					currentValue.real[inputKey] = tdData.value.real[inputKey];
					if(tdData.value.real[inputKey]!=keyValue){
						//设置real
						isEdit = true;
						currentValue.real[inputKey] = keyValue;
						visibleHtml = NetstarUI.resultTable.getMultiinputVisible(inputKey, keyValue, visibleHtml);
					}
				}
				currentValue.visible = visibleHtml;
				if(isEdit){
					return currentValue;
				}else{
					return false;
				};
				break;
		}
	}
	NetstarUI.resultTable.multiinputShortkey = multiinputShortkey;
}
//获取多输入框组件visible
NetstarUI.resultTable.getMultiinputVisible = function(inputKey, keyValue, visibleHtml){
	//获取visible 
	//inputKey是子数据的名字，keyvalue是新值，visibleHtml是value.visible
	var keySpanHtml = 'ns-keyname="'+inputKey+'"'
	var keyIndex = visibleHtml.indexOf(keySpanHtml)
	var firstIndex = visibleHtml.indexOf('>',keyIndex);
	var secondIndex = visibleHtml.indexOf('<',keyIndex);
	var spanValue = visibleHtml.substring(firstIndex+1,secondIndex);
	var replaceRegExp = new RegExp(spanValue);
	if(keyValue==''){
		keyValue = '　';
	}
	var foramtVisibleHtml = visibleHtml.substr(0, firstIndex+1) + keyValue + visibleHtml.substr(secondIndex, visibleHtml.length);
	return foramtVisibleHtml;
}

//处理多图片上传 sjj20180319
NetstarUI.resultTable.multiuploadInit = function(resizeData){
	var tdData = resizeData.tdData;
	var tConfig = this.config;
	var $container = tConfig.$editPanelMultiupload;
	if(resizeData.$target){
		if(resizeData.$target.is('img')){
			var formHtml = '';
			var nsIndex = resizeData.$target.attr('ns-index');
			var uploadData = NetstarUI.resultTable.data.tdData[tdData.id].subdata;
			var uploadField = NetstarUI.resultTable.config.default.uploadSaveAjax.field;
			for(var imageI=0; imageI<uploadData.length; imageI++){
				var classStr = 'img-big';
				if(imageI == nsIndex){
					classStr += ' show';
				}
				formHtml += '<span class="'+classStr+'" ns-index="'+imageI+'" ns-id="'+uploadData[imageI][uploadField.id]+'" ns-bigId="'+uploadData[imageI].bigThumbFileId+'" ns-imgId="'+tdData.id+'">'
								+'<img src="'+uploadData[imageI][uploadField.bigThumb]+'" ns-index="'+imageI+'" width="100" height="100">'
								+'<span><input type="text" class="form-control" id="uploadname" value="'+uploadData[imageI][uploadField.title]+'"></span>'
							+'</span>';
			}
			var html1 = '<div class="help-info-total">'
						+'<div class="help-before" onclick="imagePrev()"><i class="fa fa-angle-left"></i></div>'
						+'<div class="upload-images-content">'
						+ formHtml
						+'</div>'
						+'<div class="help-after" onclick="imageNext()"><i class="fa fa-angle-right"></i></div>'
					+'</div>'
					;
			var imageInfo = {
				id: 	"plane-lookImage",
				title: 	"查看缩略图",
				form:[
					{
						html:html1
					}
				],
				btns:[
					{
						text:'上移',
						isShowText:false,
						handler:function(){
							var nsIndex = Number($('.upload-images-content .img-big.show').attr('ns-index')); 
							if(nsIndex > 0){
								var orderId = Number(tdData.subdata[nsIndex].orderId);
								var postData = {
									title:$.trim($('.img-big.show').find('input').val()),
									id:$.trim($('.img-big.show').attr('ns-id')),
									testDataId:tdData.nsId,
									bigThumbFileId:$.trim($('.img-big.show').attr('ns-bigId')),
									orderId:orderId - 1,
								};
	                            var _postData = $.extend({},NetstarUI.resultTable.config.saveAjax.data,postData);
								$.ajax({
									url: 		NetstarUI.resultTable.config.default.uploadSaveAjax.src,
									data: 		_postData,
									type: 		'POST',
									dataType: 	'json',
									success:function(data){
										if(data.success){
											var nsIndex = $('.img-big.show').attr('ns-index');
											nsIndex = Number(nsIndex);
											var rowsData = data[NetstarUI.resultTable.config.default.uploadSaveAjax.dataSrc];
											//var configField = data[NetstarUI.resultTable.config.default.uploadSaveAjax].field;
											tdData.subdata[nsIndex].orderId = orderId - 1;
											tdData.subdata[nsIndex-1].orderId = orderId;
											nsdialog.hide();
											NetstarUI.resultTable.getUploadResult(resizeData);
										}else{
											nsalert(data.result);
										}
									},
									error:function(error){
										nsVals.defaultAjaxError(error);
									}
								})
							}else{
								nsalert('已经是第一张了','error')
							}
						}
					},
					{
						text:'下移',
						isShowText:false,
						handler:function(){
							var totalLength = $('.upload-images-content > span').length-1;
							var nsIndex = Number($('.upload-images-content .img-big.show').attr('ns-index')); 
							if(nsIndex < totalLength){
								var orderId = Number(tdData.subdata[nsIndex].orderId);
								var postData = {
									title:$.trim($('.img-big.show').find('input').val()),
									id:$.trim($('.img-big.show').attr('ns-id')),
									testDataId:tdData.nsId,
									bigThumbFileId:$.trim($('.img-big.show').attr('ns-bigId')),
									orderId:orderId + 1
								};
	                            var _postData = $.extend({},NetstarUI.resultTable.config.saveAjax.data,postData);
								$.ajax({
									url: 		NetstarUI.resultTable.config.default.uploadSaveAjax.src,
									data: 		_postData,
									type: 		'POST',
									dataType: 	'json',
									success:function(data){
										if(data.success){
											var nsIndex = $('.img-big.show').attr('ns-index');
											nsIndex = Number(nsIndex);
											var rowsData = data[NetstarUI.resultTable.config.default.uploadSaveAjax.dataSrc];
											//var configField = data[NetstarUI.resultTable.config.default.uploadSaveAjax].field;
											tdData.subdata[nsIndex].orderId = orderId + 1;
											tdData.subdata[nsIndex+1].orderId = orderId;
											nsdialog.hide();
											NetstarUI.resultTable.getUploadResult(resizeData);
										}else{
											nsalert(data.result);
										}
									},
									error:function(error){
										nsVals.defaultAjaxError(error);
									}
								})
							}else{
								nsalert('已经是最后一张了','error');
							}
						}
					},
					{
						text:'下载',
						handler:function(){
							var id = $.trim($('.img-big.show').attr('ns-bigId'));
							var downConfig = NetstarUI.resultTable.config.default.uploadAjax.downLoadAjax;
							//var url = downConfig.src+"?"+downConfig.id+"="+id;
							var url = downConfig.src;
							if(url.indexOf('?')>=0){
								url = url+'&'+downConfig.id+'='+id;
							}else{
								url = url+'?'+downConfig.id+'='+id;
							}
							window.location = url;
						}
					},
					{
						text:'保存',
						handler:function(){
							var postData = {
								title:$.trim($('.img-big.show').find('input').val()),
								id:$.trim($('.img-big.show').attr('ns-id')),
								testDataId:tdData.nsId,
								bigThumbFileId:$.trim($('.img-big.show').attr('ns-bigId')),
							};
                            var _postData = $.extend({},NetstarUI.resultTable.config.saveAjax.data,postData);
							$.ajax({
								url: 		NetstarUI.resultTable.config.default.uploadSaveAjax.src,
								data: 		_postData,
								type: 		'POST',
								dataType: 	'json',
								success:function(data){
									if(data.success){
										var nsIndex = $('.img-big.show').attr('ns-index');
										var rowsData = data[NetstarUI.resultTable.config.default.uploadSaveAjax.dataSrc];
										var configField = NetstarUI.resultTable.config.default.uploadSaveAjax.field;
										tdData.subdata[nsIndex][configField.title] = rowsData[0][configField.title];
										nsalert('保存成功');
										nsdialog.hide();
										NetstarUI.resultTable.getUploadResult(resizeData);
									}else{
										nsalert(data.result);
									}
								},
								error:function(error){
									nsVals.defaultAjaxError(error);
								}
							})
						}
					},
					{
						text:'删除',
						handler:function(){
							var nsId = $('.img-big.show').attr('ns-id');
							var nsIndex = $('.img-big.show').attr('ns-index');
							var nsImgid = $('.img-big.show').attr('ns-imgId');
							$.ajax({
								url: 		NetstarUI.resultTable.config.default.uploadDelAjax.src,
								data: 		{id:nsId},
								type: 		'post',
								dataType: 	'json',
								success:function(data){
									if(data.success){
										tdData.subdata.splice(nsIndex,1);
										nsalert('删除成功');
										nsdialog.hide();
										NetstarUI.resultTable.getUploadResult(resizeData);
									}else{
										nsalert(data.result);
									}
								},
								error:function(error){
									nsVals.defaultAjaxError(error);
								}
							})
						}
					},
					{
						text:'关闭',
						handler:function(){
							var $container = NetstarUI.resultTable.config.$editPanelMultiupload;
							NetstarUI.resultTable.config.$editPanel.removeAttr('style');
							NetstarUI.resultTable.config.$editPanel.removeClass('multiupload');
							$container.removeClass('show');
							nsdialog.hide();
						}
					}
				],
				isCancelBtnShow:false,
				hideHandler:function(){
					var $container = NetstarUI.resultTable.config.$editPanelMultiupload;
					NetstarUI.resultTable.config.$editPanel.removeAttr('style');
					NetstarUI.resultTable.config.$editPanel.removeClass('multiupload');
					$container.removeClass('show');
					nsdialog.hide();
				}
			}
			nsdialog.initShow(imageInfo);
		}
	}
	$container.html(tdData.value.edit);
	$container.children('button[type="button"]').on('click',clickHandler);
	//testDataId:tdData.nsId
	//var _postData = $.extend({},NetstarUI.resultTable.config.uploadAllAjax.data,postData);
	/*var uploadParams = '?testDataId='+tdData.nsId;
	if(typeof(NetstarUI.resultTable.config.uploadAllAjax.data)=='object'){

	}
	for(var params in NetstarUI.resultTable.config.uploadAllAjax.data){
		uploadParams +='&'+params+'='+NetstarUI.resultTable.config.uploadAllAjax.data[params];
	};
	console.log(uploadParams)*/
	function clickHandler(){
		var multiUploadConfig = {
			id: 	"mutiupload-dialog",
			title: 	"上传文件",
			note: 	"点击左边文件区域，或者拖拽文件到文件区域上传文件",
			size: 	"b",
			isCancelBtnShow:false,
			form:[
				{
					id: 		'multiupload-table',
					type: 		'upload',
					dataSource: tdData.subdata,
					dataSrc:	tConfig.default.uploadAllAjax.dataSrc,
					uploadsrc:  tConfig.default.uploadAllAjax.src+'&testDataId='+tdData.nsId,
					isAllowFiles:500,
					changeHandler:uploadSuccessHandler,
					isPage:true,
					isSearch:false,
					isSingleSelect:true,
					pageLengthMenu:10,
					supportFormat:'image/*',
					column: [
						{
							field : 'title',
							title : '标题',
							formatHandler:{
								type:'input',
								/*data:[
									{handler:function(obj){}}
								]*/
							}
						},{
							field : 'smallThumb',
							title : '缩略图',
							width:100,
							formatHandler:function(value,row){
								return '<img src="'+value+'" alt="'+row.title+'" width="30px" height="30px" />';
							}
						},/*{
							field:'orderId',
							title:'序列号',	
						},*/{
							field:'operator',
							title:'操作',
							width:120,
							formatHandler:{
								type:'button',
								data:
								[
									{'下载':downHandler},
									{'删除':delHandler},
									{'上移':prevMoveHandler},
									{'下移':nextMoveHandler}
								]
							}
						}
					],
				}
			],
			btns:[
				{
					text: 		'保存',
					handler: 	saveHandler,
				},{
					text: 		'关闭',
					handler: 	closeHandler,
				}
			]
		}
		nsdialog.initShow(multiUploadConfig);
	}
	//上传成功
	function uploadSuccessHandler(data){
		var uploadField = NetstarUI.resultTable.config.default.uploadAllAjax.field;
		var rowData = data[NetstarUI.resultTable.config.default.uploadAllAjax.dataSrc];
		/*return {
			id:rowData[0][uploadField.id],
			name:rowData[0][uploadField.name]
		}*/
		/*var rowData = [{
			"id":"0003",
			"name":"3.png",
			"title":"我是新标题111",
			"smallThumb":"/NPE/assets/images/album-image-full.jpg",
			"bigThumb":"/NPE/assets/images/album-image-full.jpg",
			"orderId":3,
			"bigThumbFileId":"003"
		}]*/
		rowData[0].orderId = baseDataTable.getAllTableData('form-mutiupload-dialog-multiupload-table').length + 1;
		baseDataTable.addTableRowData('form-mutiupload-dialog-multiupload-table',rowData);
	}
	//下载操作
	function downHandler(obj){
		var id = obj.rowData.bigThumbFileId;
		var downConfig = NetstarUI.resultTable.config.default.uploadAjax.downLoadAjax;
		var url = downConfig.src;
		if(url.indexOf('?')>=0){
			url = url+'&'+downConfig.id+'='+id;
		}else{
			url = url+'?'+downConfig.id+'='+id;
		}
		window.location = url;
	}
	//保存操作
	function saveHandler(){
		var tableData = baseDataTable.getAllTableData('form-mutiupload-dialog-multiupload-table'); 
		var saveObject = {jsonRows:JSON.stringify(tableData),testDataId:tdData.nsId};
		var _postData = $.extend({},NetstarUI.resultTable.config.saveAjax.data,saveObject);
		$.ajax({
			url: 		NetstarUI.resultTable.config.default.uploadAllSaveAjax.src,
			data: 		_postData,
			type: 		'POST',
			dataType: 	'json',
			success:function(data){
				if(data.success){
					resizeData.tdData.subdata = data.row;
					nsdialog.hide();
					NetstarUI.resultTable.getUploadResult(resizeData);
				}else{
					nsalert(data.result);
				}
			},
			error:function(error){
				/*var rowData = [{
						"id":"0003",
						"name":"3.png",
						"title":"我是新标题111",
						"smallThumb":"/NPE/assets/images/album-image-full.jpg",
						"bigThumb":"/NPE/assets/images/album-image-full.jpg",
						"orderId":3,
						"bigThumbFileId":"003"
					}]
				resizeData.tdData.subdata = rowData;
				nsdialog.hide();
				NetstarUI.resultTable.getUploadResult(resizeData);*/
				nsVals.defaultAjaxError(error);
			}
		})
	}
	//删除操作
	function delHandler(obj){
		var nsId = obj.rowData.id;
		baseDataTable.delRowData('form-mutiupload-dialog-multiupload-table',obj.obj.closest('tr'));
	}
	//关闭操作
	function closeHandler(){
		var $container = NetstarUI.resultTable.config.$editPanelMultiupload;
		NetstarUI.resultTable.config.$editPanel.removeAttr('style');
		NetstarUI.resultTable.config.$editPanel.removeClass('multiupload');
		$container.removeClass('show');
		nsdialog.hide();
	}
	//上移
	function prevMoveHandler(data){
		var tableData = baseDataTable.getAllTableData(data.tableId);
		tableData.sort(compare);
	    function compare(value1,value2){
	    	if(value1.orderId < value2.orderId){
	    		return -1;
	    	}else if(value1.orderId > value2.orderId){
	    		return 1;
	    	}else{
	    		return 0;
	    	}
	    }
		var cRow = data.obj.closest('tr');
		var currentNsIndex = parseInt(data.rowData.orderId);//当前序列号
		var currentRowIndex = cRow.index();//当前行号
		var endRowIndex = currentRowIndex - 1;//目标行号
		if(currentRowIndex === 0){
			nsalert('已经是顶部了');
			return false;
		}
		var rowIndexArr = [];
		var dataArr = [];
		var existSortLength = tableData.length;
		for(var rowI=0; rowI<existSortLength; rowI++){
			var nsIndex = tableData[rowI].orderId;//排序序列号
			var dataObj = {
				originaRowIndex:rowI,
				originalNsIndex:nsIndex,
			};
			rowIndexArr.push(rowI);
			dataArr.push(dataObj);
		}
		rowIndexArr.splice(currentRowIndex, 1);//删除元素
		rowIndexArr.splice(endRowIndex, 0, currentRowIndex);//在第几个元素之前追加一个新元素
		for(var rowI = 0; rowI<existSortLength; rowI++){
			dataArr[rowIndexArr[rowI]].editNsIndex = dataArr[rowI].originalNsIndex;
			dataArr[rowIndexArr[rowI]].editRowIndex = dataArr[rowI].originaRowIndex;
		}
		for(var dataI = 0; dataI<existSortLength; dataI++){
			tableData[dataI].orderId = dataArr[dataI].editNsIndex;
		}
		tableData.sort(function(a,b){
			return a.orderId - b.orderId
		});
		var prevRow = cRow.prev();
		cRow.children('th').html(endRowIndex+1);
		prevRow.children('th').html(currentRowIndex+1);
		cRow.insertBefore(prevRow); 
	}
	//下移
	function nextMoveHandler(data){
		var tableData = baseDataTable.getAllTableData(data.tableId);
		tableData.sort(compare);
	    function compare(value1,value2){
	    	if(value1.orderId < value2.orderId){
	    		return -1;
	    	}else if(value1.orderId > value2.orderId){
	    		return 1;
	    	}else{
	    		return 0;
	    	}
	    }
		var cRow = data.obj.closest('tr');
		var currentNsIndex = parseInt(data.rowData.orderId);//当前序列号
		var currentRowIndex = cRow.index();//当前行号
		var endRowIndex = currentRowIndex + 1;//目标行号
		if(currentRowIndex === tableData.length-1){
			nsalert('已经是底部了');
			return false;
		}	
		var rowIndexArr = [];
		var dataArr = [];
		var existSortLength = tableData.length;
		for(var rowI=0; rowI<existSortLength; rowI++){
			var nsIndex = tableData[rowI].orderId;//排序序列号
			var dataObj = {
				originaRowIndex:rowI,
				originalNsIndex:nsIndex,
			};
			rowIndexArr.push(rowI);
			dataArr.push(dataObj);
		}
		rowIndexArr.splice(currentRowIndex, 1);//删除元素
		rowIndexArr.splice(endRowIndex, 0, currentRowIndex);//在第几个元素之前追加一个新元素
		for(var rowI = 0; rowI<existSortLength; rowI++){
			dataArr[rowIndexArr[rowI]].editNsIndex = dataArr[rowI].originalNsIndex;
			dataArr[rowIndexArr[rowI]].editRowIndex = dataArr[rowI].originaRowIndex;
		}
		for(var dataI = 0; dataI<existSortLength; dataI++){
			tableData[dataI].orderId = dataArr[dataI].editNsIndex;
		}
		tableData.sort(function(a,b){
			return a.orderId - b.orderId
		});
		var nextRow = cRow.next();  
		cRow.children('th').html(endRowIndex+1);
		nextRow.children('th').html(currentRowIndex+1);
		if(nextRow){cRow.insertAfter(nextRow);}
	}
}
//上传添加标题初始化
NetstarUI.resultTable.uploadtitleInit = function(resizeData){
	var tdData = resizeData.tdData;
	var $container = this.config.$editPanelUploadtitle;
	if(resizeData.$target){
		if(resizeData.$target.is('img')){
			var formHtml = '';
			var nsIndex = resizeData.$target.attr('ns-index');
			var uploadData = NetstarUI.resultTable.data.tdData[tdData.id].subdata;
			var uploadField = NetstarUI.resultTable.config.default.uploadSaveAjax.field;
			for(var imageI=0; imageI<uploadData.length; imageI++){
				var classStr = 'img-big';
				if(imageI == nsIndex){
					classStr += ' show';
				}
				formHtml += '<span class="'+classStr+'" ns-index="'+imageI+'" ns-id="'+uploadData[imageI][uploadField.id]+'" ns-bigId="'+uploadData[imageI].bigThumbFileId+'" ns-imgId="'+tdData.id+'">'
								+'<img src="'+uploadData[imageI][uploadField.bigThumb]+'" ns-index="'+imageI+'" width="100" height="100">'
								+'<span><input type="text" class="form-control" id="uploadname" value="'+uploadData[imageI][uploadField.title]+'"></span>'
							+'</span>';
			}
			var html1 = '<div class="help-info-total">'
						+'<div class="help-before" onclick="imagePrev()"><i class="fa fa-angle-left"></i></div>'
						+'<div class="upload-images-content">'
						+ formHtml
						+'</div>'
						+'<div class="help-after" onclick="imageNext()"><i class="fa fa-angle-right"></i></div>'
					+'</div>'
					;
			var imageInfo = {
				id: 	"plane-lookImage",
				title: 	"查看缩略图",
				form:[
					{
						html:html1
					}
				],
				btns:[
					{
						text:'上移',
						isShowText:false,
						handler:function(){
							var nsIndex = Number($('.upload-images-content .img-big.show').attr('ns-index')); 
							if(nsIndex > 0){
								var orderId = Number(tdData.subdata[nsIndex].orderId);
								var postData = {
									title:$.trim($('.img-big.show').find('input').val()),
									id:$.trim($('.img-big.show').attr('ns-id')),
									testDataId:tdData.nsId,
									bigThumbFileId:$.trim($('.img-big.show').attr('ns-bigId')),
									orderId:orderId - 1,
								};
	                            var _postData = $.extend({},NetstarUI.resultTable.config.saveAjax.data,postData);
								$.ajax({
									url: 		NetstarUI.resultTable.config.default.uploadSaveAjax.src,
									data: 		_postData,
									type: 		'POST',
									dataType: 	'json',
									success:function(data){
										if(data.success){
											var nsIndex = $('.img-big.show').attr('ns-index');
											nsIndex = Number(nsIndex);
											var rowsData = data[NetstarUI.resultTable.config.default.uploadSaveAjax.dataSrc];
											//var configField = data[NetstarUI.resultTable.config.default.uploadSaveAjax].field;
											tdData.subdata[nsIndex].orderId = orderId - 1;
											tdData.subdata[nsIndex-1].orderId = orderId;
											nsdialog.hide();
											NetstarUI.resultTable.getUploadResult(resizeData);
										}else{
											nsalert(data.result);
										}
									},
									error:function(error){
										nsVals.defaultAjaxError(error);
									}
								})
							}else{
								nsalert('已经是第一张了','error')
							}
						}
					},
					{
						text:'下移',
						isShowText:false,
						handler:function(){
							var totalLength = $('.upload-images-content > span').length-1;
							var nsIndex = Number($('.upload-images-content .img-big.show').attr('ns-index')); 
							if(nsIndex < totalLength){
								var orderId = Number(tdData.subdata[nsIndex].orderId);
								var postData = {
									title:$.trim($('.img-big.show').find('input').val()),
									id:$.trim($('.img-big.show').attr('ns-id')),
									testDataId:tdData.nsId,
									bigThumbFileId:$.trim($('.img-big.show').attr('ns-bigId')),
									orderId:orderId + 1
								};
	                            var _postData = $.extend({},NetstarUI.resultTable.config.saveAjax.data,postData);
								$.ajax({
									url: 		NetstarUI.resultTable.config.default.uploadSaveAjax.src,
									data: 		_postData,
									type: 		'POST',
									dataType: 	'json',
									success:function(data){
										if(data.success){
											var nsIndex = $('.img-big.show').attr('ns-index');
											nsIndex = Number(nsIndex);
											var rowsData = data[NetstarUI.resultTable.config.default.uploadSaveAjax.dataSrc];
											//var configField = data[NetstarUI.resultTable.config.default.uploadSaveAjax].field;
											tdData.subdata[nsIndex].orderId = orderId + 1;
											tdData.subdata[nsIndex+1].orderId = orderId;
											nsdialog.hide();
											NetstarUI.resultTable.getUploadResult(resizeData);
										}else{
											nsalert(data.result);
										}
									},
									error:function(error){
										nsVals.defaultAjaxError(error);
									}
								})
							}else{
								nsalert('已经是最后一张了','error');
							}
						}
					},
					{
						text:'下载',
						handler:function(){
							var id = $.trim($('.img-big.show').attr('ns-bigId'));
							var downConfig = NetstarUI.resultTable.config.default.uploadAjax.downLoadAjax;
							//var url = downConfig.src+"?"+downConfig.id+"="+id;
							var url = downConfig.src;
							if(url.indexOf('?')>=0){
								url = url+'&'+downConfig.id+'='+id;
							}else{
								url = url+'?'+downConfig.id+'='+id;
							}
							window.location = url;
						}
					},
					{
						text:'保存',
						handler:function(){
							var postData = {
								title:$.trim($('.img-big.show').find('input').val()),
								id:$.trim($('.img-big.show').attr('ns-id')),
								testDataId:tdData.nsId,
								bigThumbFileId:$.trim($('.img-big.show').attr('ns-bigId')),
							};
                            var _postData = $.extend({},NetstarUI.resultTable.config.saveAjax.data,postData);
							$.ajax({
								url: 		NetstarUI.resultTable.config.default.uploadSaveAjax.src,
								data: 		_postData,
								type: 		'POST',
								dataType: 	'json',
								success:function(data){
									if(data.success){
										var nsIndex = $('.img-big.show').attr('ns-index');
										var rowsData = data[NetstarUI.resultTable.config.default.uploadSaveAjax.dataSrc];
										var configField = NetstarUI.resultTable.config.default.uploadSaveAjax.field;
										tdData.subdata[nsIndex][configField.title] = rowsData[0][configField.title];
										nsalert('保存成功');
										nsdialog.hide();
										NetstarUI.resultTable.getUploadResult(resizeData);
									}else{
										nsalert(data.result);
									}
								},
								error:function(error){
									nsVals.defaultAjaxError(error);
								}
							})
						}
					},
					{
						text:'删除',
						handler:function(){
							var nsId = $('.img-big.show').attr('ns-id');
							var nsIndex = $('.img-big.show').attr('ns-index');
							var nsImgid = $('.img-big.show').attr('ns-imgId');
							$.ajax({
								url: 		NetstarUI.resultTable.config.default.uploadDelAjax.src,
								data: 		{id:nsId},
								type: 		'post',
								dataType: 	'json',
								success:function(data){
									if(data.success){
										tdData.subdata.splice(nsIndex,1);
										nsalert('删除成功');
										nsdialog.hide();
										NetstarUI.resultTable.getUploadResult(resizeData);
									}else{
										nsalert(data.result);
									}
								},
								error:function(error){
									nsVals.defaultAjaxError(error);
								}
							})
						}
					},
					{
						text:'关闭',
						handler:function(){
							var $container = NetstarUI.resultTable.config.$editPanelUploadtitle;
							NetstarUI.resultTable.config.$editPanel.removeAttr('style');
							NetstarUI.resultTable.config.$editPanel.removeClass('uploadtitle');
							$container.removeClass('show');
							nsdialog.hide();
						}
					}
				],
				isCancelBtnShow:false,
				hideHandler:function(){
					var $container = NetstarUI.resultTable.config.$editPanelUploadtitle;
					NetstarUI.resultTable.config.$editPanel.removeAttr('style');
					NetstarUI.resultTable.config.$editPanel.removeClass('uploadtitle');
					$container.removeClass('show');
					nsdialog.hide();
				}
			}
			nsdialog.initShow(imageInfo);
		}
	}
	$container.html(tdData.value.edit);
	//点击事件
	$container.children('button[type="button"]').on('click',clickHandler);
	function clickHandler(){
		var config = {
			id: 	"plane-viewState",
			title: 	"弹框",
			size: 	"s",
			form:[
					{
						id: 		'sqid',
						label: 		'上传标题',
						type: 		'text',
						column: 	4,
					},{
						id: 		'imgId',
						label: 		'上传文件',
						type: 		'upload_single',
						column: 	8,
						rules: 		'upload',
						uploadSrc: 	NetstarUI.resultTable.config.default.uploadAjax.src,
						ismultiple:false,
						textField:'name',
						valueField:'id',
						isAllowFiles:1,
						supportFormat:'image/*',
						changeHandler:function(data){
							var uploadField = NetstarUI.resultTable.config.default.uploadAjax.field;
							var rowData = data.data[NetstarUI.resultTable.config.default.uploadAjax.dataSrc];
							return {
								id:rowData[0][uploadField.id],
								name:rowData[0][uploadField.name]
							}
						},
					}
				],
				btns:[
					{
						text: 		'确认',
						handler: 	function(){
							var formJson = nsForm.getFormJSON("plane-viewState");
							var postData = {
								title:formJson.sqid,
								id:'',
								testDataId:tdData.nsId,
								bigThumbFileId:formJson.imgId,
							};
                            var _postData = $.extend({},NetstarUI.resultTable.config.saveAjax.data,postData);
							$.ajax({
								url: 		NetstarUI.resultTable.config.default.uploadSaveAjax.src,
								data: 		_postData,
								type: 		'POST',
								dataType: 	'json',
								success:function(data){
									if(data.success){
										var rowsData = data[NetstarUI.resultTable.config.default.uploadSaveAjax.dataSrc];
										tdData.subdata.push(rowsData[0]);
										nsalert('保存成功');
										nsdialog.hide();
										NetstarUI.resultTable.getUploadResult(resizeData);
									}else{
										nsalert(data.result);
									}
								},
								error:function(error){
									nsVals.defaultAjaxError(error);
								}
							})
						},
					}
				]
		}
		popupBox.initShow(config);
	}
}
//上一张图片
function imagePrev(){
	var nsIndex = Number($('.upload-images-content .img-big.show').attr('ns-index'));
	if(nsIndex > 0){
		//显示图片
		$('.upload-images-content > span').removeClass('show');
		var imageIndex = nsIndex - 1;
		$('.upload-images-content span[ns-index="'+imageIndex+'"]').addClass('show')
	}else{
		//已经是第一张了
		nsalert('已经是第一张了','warning')
	}
}
//下一张图片
function imageNext(){
	var totalLength = $('.upload-images-content > span').length-1;
	var nsIndex = Number($('.upload-images-content .img-big.show').attr('ns-index')); 
	if(nsIndex < totalLength){
		$('.upload-images-content > span').removeClass('show');
		var imageIndex = nsIndex + 1;
		$('.upload-images-content span[ns-index="'+imageIndex+'"]').addClass('show')
	}else{
		nsalert('已经是最后一张了','warning')	
	}
}
NetstarUI.resultTable.getUploadResult = function(resizeData){
	var tdData = resizeData.tdData;
	tdData.subdata.sort(compare);
    function compare(value1,value2){
    	if(value1.orderId < value2.orderId){
    		return -1;
    	}else if(value1.orderId > value2.orderId){
    		return 1;
    	}else{
    		return 0;
    	}
    }
	var formatValueObj = NetstarUI.resultTable.getUploadVisible(tdData);
	var value = {
		real:formatValueObj.visible,
		visible:formatValueObj.visible
	}
	if(tdData.type=='uploadtitle'){
		var $container = this.config.$editPanelUploadtitle;
		this.config.$editPanel.removeAttr('style');
		this.config.$editPanel.removeClass('uploadtitle');
		$container.removeClass('show');
	}else if(tdData.type=='multiupload'){
		var $container = this.config.$editPanelMultiupload;
		this.config.$editPanel.removeAttr('style');
		this.config.$editPanel.removeClass('uploadtitle');
		$container.removeClass('show');
	}
	
	tdData.$td.html(formatValueObj.visible);
	var classStr = tdData.type+' '+tdData.state;
	tdData.$td.attr('class',classStr);

	NetstarUI.resultTable.data.tdData[tdData.id].subdata = tdData.subdata;
	NetstarUI.resultTable.data.tdData[tdData.id].value.visible = value.visible;
	NetstarUI.resultTable.data.tdData[tdData.id].value.real = value.real;
}
//checkbox 多选输入组件
NetstarUI.resultTable.checkboxInit = function(resizeData){
	var tdData = resizeData.tdData;
	NetstarUI.resultTable.currentTdID = tdData.id
	var $container = this.config.$editPanelCheckboxInput;
	$container.html(tdData.value.edit);
	$container.css('margin-top','-'+$container.outerHeight()/2+'px');
	var optionsLength = tdData.subdata.length;
	var isWithMoreOption = tdData.isWithMoreOption;
	var $moreInput;  //补充的输入框
	var tempInputValue; //补充的输入框
	if(isWithMoreOption){
		$moreInput = $container.find('input[type="text"]');
		tempInputValue = tdData.moreOption.value;
	}
	var tabIndex = 0;
	//判断点击对象
	if(resizeData.$target){
		var targetValue = resizeData.$target.attr('ns-keyindex');
		if(targetValue){
			var targetIndex = parseInt(targetValue);
			if(targetIndex==optionsLength){
				//点击的input
				$moreInput.focus();
				$moreInput.select();
			}else{
				//点击的是checkbox
				$targetLabel = $container.children('label.checkbox-inline').eq(targetIndex);
				//$targetLabel.toggleClass('checked');
				optionFocus($targetLabel);
				optionChecked($targetLabel);
			}
			tabIndex = targetIndex;
		}
	}
	
	
	NetstarUI.resultTable.shortkeyType = 'checkbox';	
	//点击事件
	$container.children('input[type="checkbox"]').on('change',changeHandler);
	//获取value
	function getValue(){
		var realValue = '';
		var checkedDom = $container.children('input[type="checkbox"]:checked');
		for(var domI = 0; domI<checkedDom.length; domI++){
			var valueIndex = parseInt($(checkedDom[domI]).val());
			if(isWithMoreOption){
				if(valueIndex!=tdData.moreOption.index){
					realValue += tdData.subdata[valueIndex];
				}else{
					realValue += $moreInput.val();
				}
			}else{
				realValue += tdData.subdata[valueIndex];
			}
			if(domI<checkedDom.length-1){
				realValue+='|'
			}
		}
		var valueObj = {};
		valueObj.real = realValue;
		if(tdData.isWithMoreOption){
			valueObj.moreValue = $moreInput.val();
		}
		return valueObj;
	}
	//点击 change 事件 
	function changeHandler(ev){
		var value = parseInt($(this).val());
		tabIndex = value;
		var $targetLabel = $(this).prev();
		optionFocus($targetLabel);
		optionChecked($targetLabel);
	}
	//选择焦点事件
	function optionFocus($focusLabel){
		$container.children('label.checkbox-inline.focus').removeClass('focus');
		$focusLabel.addClass('focus');
		//移除input输入框的焦点
		if(isWithMoreOption){
			if($moreInput.is(':focus')){
				$moreInput.blur();
			}
		}
	}
	function optionChecked($checkedLabel){
		$checkedLabel.toggleClass('checked');
		var checkedResult = false;
		if($checkedLabel.hasClass('checked')){
			checkedResult = true;
		}else{
			checkedResult = false;
		}
		$checkedLabel.next().prop('checked',checkedResult);
		var checkedKeyIndex = parseInt($checkedLabel.attr('ns-keyindex'));
		if(isWithMoreOption){
			if(checkedKeyIndex == optionsLength-1){
				if(checkedResult){
					if($moreInput.val()==''){
						$moreInput.val(tempInputValue);
					}
					$moreInput.focus();
					$moreInput.select();
				}else{
					tempInputValue = $moreInput.val();
					$moreInput.val('');
				}
			}
		}
		/*********** lyw 20190823  start ***************/
		var checkboxValue = getValue();
		var value = {
			real:checkboxValue.real,
			visible:'temp'
		}
		NetstarUI.resultTable.saveTdData(NetstarUI.resultTable.currentTdID,value);
		if(tdData.isWithMoreOption){
			tdData.moreOption.value = checkboxValue.moreValue;
		}
		var valueRealArr = value.real.split('|');
		tdData.valueRealArr = valueRealArr;
		var formatValueObj = NetstarUI.resultTable.getCheckboxVisible(tdData);
		tdData.value.visible = formatValueObj.visible;
		tdData.value.edit = formatValueObj.edit;
		NetstarUI.resultTable.refreshTd(NetstarUI.resultTable.currentTdID);
		/*********** lyw 20190823  end ***************/
	}
	//快捷键 tab是内部切换，空格是选中，left，right是左右
	function checkboxInputShortkey(keyType, event){
		switch(keyType){
			case 'tab':
				//checkbox之间移动
				if(tabIndex < $container.children('label.checkbox-inline').length-1){
					tabIndex++;
					var $currentTabOption = $container.children('label.checkbox-inline').eq(tabIndex);
					optionFocus($currentTabOption);
				}else if(tabIndex == $container.children('label.checkbox-inline').length-1){
					//移动到input
					tabIndex++;
					$moreInput.focus();
					$moreInput.select();
				}else{
					//最后一个就挪到下一个了
					NetstarUI.resultTable.shortkeyMoveInput('enter');
				}
				break;
			case 'left':
				if(tabIndex==0){
					//如果是第一个，那就上一个单元格
					NetstarUI.resultTable.shortkeyMoveInput('left');
				}else{
					//上一个option
					tabIndex--;
					var $prevOption = $container.children('label.checkbox-inline').eq(tabIndex);
					optionFocus($prevOption);
				}
				break;
			case 'right':
				if(tabIndex==$container.children('label.checkbox-inline').length){
					//如果是最后一个，那就上一个单元格
					NetstarUI.resultTable.shortkeyMoveInput('right');
				}else{
					//下一个option
					tabIndex++;
					var $nextOption = $container.children('label.checkbox-inline').eq(tabIndex);
					optionFocus($nextOption);
				}
				break;
			case 'space':
				//如果当前输入焦点在输入框里，则不屏蔽空格的默认事件，否则则执行选中事件
				var isDefaultEvent = true;
				if(isWithMoreOption){
					if($moreInput.is(':focus')){
						isDefaultEvent = false;
					}
				}
				if(isDefaultEvent == false){
					return;	
				}
				//空格触发选中事件
				event.preventDefault();
				var $currentLabel = $container.children('label.checkbox-inline.focus');
				if($currentLabel.length==0){
					$currentLabel = $container.children('label.checkbox-inline').eq(0);
					optionFocus($currentLabel);
				}
				optionChecked($currentLabel);
				break;
			case 'enter':
				return getValue();
				break;
			default:
				if(debugerMode){
					console.error('checkboxInputShortkey 中不能识别的快捷键:'+keyType);
				}
				break;
		}
	}
	NetstarUI.resultTable.checkboxInputShortkey = checkboxInputShortkey;
}
//根据real和subdata获取value.visible和value.edit
NetstarUI.resultTable.getUploadVisible = function(tdData){
	var visibleHtml = '';
	var editHtml = '';
	var imageHtml = '';
	//tdData.subdata存放的是默认的上传文件
	var uploadConfig = NetstarUI.resultTable.config.default.uploadSaveAjax;
    if(typeof(tdData.subdata) == 'undefined'){
        tdData.subdata = [];
    }
    if(tdData.type == 'uploadtitle'){
	    tdData.subdata.sort(compare);
	    function compare(value1,value2){
	    	if(value1.orderId < value2.orderId){
	    		return -1;
	    	}else if(value1.orderId > value2.orderId){
	    		return 1;
	    	}else{
	    		return 0;
	    	}
	    }
    }
    if(tdData.subdata.length > 0){
		for(var imageI=0; imageI<tdData.subdata.length; imageI++){
			var srcStr = tdData.subdata[imageI][uploadConfig.field.smallThumb];
			var imageId = tdData.subdata[imageI][uploadConfig.field.id];
			if(typeof(tdData.subdata[imageI].orderId)=='undefined'){
				tdData.subdata[imageI].orderId = imageI+1;
			}
			imageHtml += '<img src="'+srcStr+'" ns-id="'+imageId+'" width="30" height="30"  ns-index="'+imageI+'" />';
		}
    }else{
    	if(tdData.readonly == false){
    		imageHtml = '<div class="empty-multiupload">点我选择添加上传</div>';
    	}
    }
	visibleHtml += imageHtml;
	editHtml += '<button type="button" class="btn btn-info btn-icon  btn-icon"><i class="fa-plus"></i></button>';
	return {
		'visible':visibleHtml,
		'edit':editHtml
	};
}
//multiselect获取值
NetstarUI.resultTable.getMultiselectValue = function(tdData){
	if(!$.isArray(tdData.subdata)){tdData.subdata = [];}
	var visibleStr = '';
	var realStr = '';
	if(tdData.value.real){realStr = tdData.value.real;}
	if(tdData.value.visible){visibleStr = tdData.value.visible;}
	if(typeof(tdData.value.real)=='string'){
		if(tdData.value.visible === ''){
			var idsArr = tdData.value.real.split(',');
			for(var subI=0; subI<tdData.subdata.length; subI++){
				for(var idI=0; idI<idsArr.length; idI++){
					if(tdData.subdata[subI].id == idsArr[idI]){
						visibleStr += tdData.subdata[subI].name + ',';
					}
				}
			}
		}
		visibleStr = visibleStr.substring(0,visibleStr.lastIndexOf(','));
	}
	realStr = realStr.substring(0,realStr.lastIndexOf(','));
	return [realStr,visibleStr];
}
//根据real和subdata获取value.visible和value.edit 多选组件
NetstarUI.resultTable.getCheckboxVisible = function(tdData){
	//return {visible:'...', edit:'...'} HTML代码
	var visibleHtml = '';
	var editHtml = '';
	var normalOptionLength = tdData.subdata.length;

	//如果有更多，则最后一项不是普通checkbox
	if(tdData.isWithMoreOption){
		normalOptionLength = normalOptionLength - 1;
	}
	for(var checkI = 0; checkI<normalOptionLength; checkI++){
		if(tdData.subdata[checkI]=='<br/>'){
			visibleHtml += '<br/>';
			editHtml +='<br/>';
		}else{
			var checkboxID = tdData.id+'-checkbox-'+checkI;
			var checkboxName = tdData.id+'-checkbox';
			var isChecked = '';
			var checkboxAttr = '';
			if(tdData.value.real==''){
				//没有默认值
			}else{
				if(tdData.valueRealArr.indexOf(tdData.subdata[checkI])>-1){
					isChecked = 'checked';
					checkboxAttr = ' checked';
				}
			}
			visibleHtml += '<label ns-keyindex="'+checkI+'" class="checkbox-inline '+isChecked+'">'+tdData.subdata[checkI]+'</label>';
			editHtml+= 
				'<label ns-keyindex="'+checkI+'" class="checkbox-inline '+isChecked+'" for="'+checkboxID+'">'
					+tdData.subdata[checkI]
				+'</label>'
				+'<input id="'+checkboxID+'" name="'+checkboxName+'" '
					+'class="checkbox-options" type="checkbox" '
					+'value="'+checkI+'"'
					+checkboxAttr
				+'/>';
		}
	}

	//添加更多输入框
	if(tdData.isWithMoreOption){
		var moreOptionValueStr; 	//补充输入框的值
		var moreOptionChecked; 		//补充输入框是否显示选中状态
		if(tdData.moreOption.value=='' || tdData.moreOption.value=='　'){
			moreOptionValueStr = '　';
			moreOptionChecked = '';
		}else{
			moreOptionValueStr = tdData.moreOption.value;
			moreOptionChecked = ' checked';
		}
		var moreOptionStyle = '';
		if(tdData.moreOption.length!=2){
			moreOptionStyle = 'style="min-width:'+ (tdData.moreOption.length*12+10) +'px;"';
		}
		//输出下划线
		visibleHtml += 
			'<label ns-keyindex="'+(tdData.subdata.length-1)+'" class="checkbox-inline'+moreOptionChecked+'" >'
				+tdData.moreOption.name
				+'<span ns-keyindex="'+tdData.subdata.length+'" class="checkbox-more-underline" '+moreOptionStyle+'>'
					+moreOptionValueStr
				+'</span>'
			+'</label>'
		editHtml += 
			'<label ns-keyindex="'+(tdData.subdata.length-1)+'" class="checkbox-inline'+moreOptionChecked+'"  for="'+tdData.id+'-checkbox-input">'
				+tdData.moreOption.name
				+'<input id="'+tdData.id+'-more-input" name="'+tdData.id+'-more-input" '
					+'class="checkbox-input" type="text" '
					+'value="'+moreOptionValueStr+'" '
					+moreOptionStyle
				+'/>'
			+'</label>'
			+'<input id="'+tdData.id+'-checkbox-input" name="'+tdData.id+'-checkbox'+'" '
				+'class="checkbox-options" type="checkbox" '
				+'value="'+tdData.moreOption.index+'"'
				+ moreOptionChecked
			+'/>';
	}
	return {
		'visible':visibleHtml,
		'edit':editHtml
	};
}
//checkboxajax
NetstarUI.resultTable.checkboxAjaxInit = function(resizeData){ 
	var tdData = resizeData.tdData;
	var $container = this.config.$editPanelCheckboxajaxInput;
	//基本显示内容
	$container.html(tdData.value.edit);
	$container.css('margin-top','-'+$container.outerHeight()/2+'px');
	var options = tdData.options;
	//填充input的value 初始化的时候没有基础数据，所以value未赋值
	var isWithMoreOption = tdData.isWithMoreOption;
	var $moreinputContainer; 	//输入框容器
	var $moreValues; 			//选中值容器
	var $moreInput;  			//补充的输入框
	var $moreSelect; 			//补充的下拉框
	var $moreTabletbody; 		//下拉表格body
	var tempInputValue = '';

	var optionsLength = tdData.options.length;
	var tabIndex = 0;
	
	var selectValues; //select的对应值
	if(isWithMoreOption){
		selectValues = tdData.options[tdData.selectIndex].value;
		initMoreInput();
	}
	
	//checkbox的对应值
	var checkboxValues = [];
	if(tdData.value.real){
		for(var optionI = 0; optionI<tdData.options.length; optionI++){
			if(optionI!=tdData.selectIndex){
				if(tdData.value.real.indexOf(tdData.options[optionI].id)>=0){
					checkboxValues.push(tdData.options[optionI].id);
				}
			}
		}
	}
	//判断点击显示对象，激活对应输入组件
	if(resizeData.$target){
		var targetValue = resizeData.$target.attr('ns-keyindex');
		if(targetValue){
			if(isWithMoreOption){
				if(targetValue==options[tdData.selectIndex].ajaxID){
					//点击的input
					$moreInput.focus();
					$moreInput.select();
					//refreshSelectTable();
				}else{
					//点击的是checkbox
					var targetIndex = parseInt(targetValue);
					$targetLabel = $container.children('label.checkbox-inline').eq(targetIndex);
					optionFocus($targetLabel);
					optionChecked($targetLabel);
				}
			}else{
				//点击的是checkbox
				var targetIndex = parseInt(targetValue);
				$targetLabel = $container.children('label.checkbox-inline').eq(targetIndex);
				optionFocus($targetLabel);
				optionChecked($targetLabel);
			}
			
			tabIndex = targetIndex;
		}
	}
	//快捷键类型
	NetstarUI.resultTable.shortkeyType = 'checkboxajax';	
	//点击事件
	$container.children('input[type="checkbox"]').on('change',changeHandler);
	//格式化输入框
	function initMoreInput(){
		
		var commonName = 		options[tdData.selectIndex].outputName;
		$moreinputContainer = 	$container.children('#'+commonName+'-more-input-container');
		$moreInput =  			$moreinputContainer.children('#'+commonName+'-more-input');
		$moreValues = 			$moreinputContainer.children('#'+commonName+'-more-values');
		$moreSelect = 			$container.children('#'+commonName+'-more-select-table');

		initInputText();
		initValuePanel();
		initSelectTable();

		$moreTabletbody = $moreSelect.find('table tbody');
	}
	//格式化多选下拉框
	function initValuePanel(){
		var nameHtml = NetstarUI.resultTable.checkboxAjaxGetName(selectValues, tdData.formatData);
		//分隔符是<span class="blankspace"></span>
		var nameArray = nameHtml.split('<span class="blankspace"></span>')
		nameHtml = '';
		for(var nameI = 0; nameI<nameArray.length; nameI++){
			nameHtml += 
				'<a class="values-tag" href="javascript:void(0);" ns-values-tagindex="'+nameI+'" ns-values-tagid="'+selectValues[nameI]+'">'
					+nameArray[nameI]
					+'<div class="values-tag-close"></div>'
				+'</a>'
		}
		$moreValues.html(nameHtml);
		$moreInput.css('padding-left',$moreValues.outerWidth()+'px');
		$moreValues.children('.values-tag').off('click');
		$moreValues.children('.values-tag').on('click', function(ev){
			var $tag = $(this);
			var tagID = $tag.attr('ns-values-tagid');
			if($(ev.target).hasClass('values-tag-close')){
				//点击的是关闭按钮 删除值
				removeSelectValue(tagID);
			}else{
				$moreInput.focus();
				moreSelectPanelShow();
			}
			
		})
		//其它选项是否被选中
		var $inputCheckbox = $container.children('label.checkbox-inline').eq(tdData.selectIndex);
		if(selectValues.length>0){
			//有值，应该选中
			if($inputCheckbox.hasClass('checked')){
				//有值且已选中，不操作了
			}else{
				$inputCheckbox.addClass('checked');
			}
		}else{
			if($inputCheckbox.hasClass('checked')){
				$inputCheckbox.removeClass('checked');
			}else{
				//有值且已选中，不操作了
			}
		}
	}
	//初始化下拉表格
	function initSelectTable(){
		var html = 
			'<table>'
				+'<tbody>'
					//+getSelectTableRows('all');
				+'</tbody>'
			+'</table>'
		$moreSelect.html(html);
		//刷新位置
		var containerPosition = $moreinputContainer.position();
		$moreSelect.css({
			'left': $moreinputContainer.position().left+'px',
			'width':$moreInput.outerWidth()+'px',
			'display':'none'
		});
	}
	//初始化输入框
	function initInputText(){
		var original = {value:''};
		$moreInput.on('keyup', original, function(ev){
			var searhKeyword = $moreInput.val();
			searhKeyword = $.trim(searhKeyword);
			if(searhKeyword!=ev.data.value){
				if(searhKeyword!=''){
					original.value = searhKeyword;
					refreshSelectTable();
				}else{
					if(ev.keyCode == 8){
						initInputTextHandler('delete');
					}
					refreshSelectTable();
				}
				
			}else{
				//如果相等，就看看是不是输入的空格 上下 删除
				switch(ev.keyCode){
					case 32:
						//空格确认选中
						initInputTextHandler('confirm');
						original.value = '';
						ev.stopPropagation();
						break;
					case 38:
						//上一个
						initInputTextHandler('up');
						break;
					case 40:
						//下一个
						initInputTextHandler('down');
						break;
					case 8:
						//删除
						if(searhKeyword==''){
							initInputTextHandler('delete');
							original.value = '';
						}
						break;
					default:
						//其它按钮不处理
						break;
				}
			}
		})
		$moreInput.on('focus',function(ev){
			//var searhKeyword = $moreInput.val();
			//searhKeyword = $.trim(searhKeyword);
			var isMoreCheck = $container.children('label.checkbox-inline').eq(tdData.selectIndex).hasClass('checked');
			// if(isMoreCheck == false){
			// 	selectValues = [];
			// 	initValuePanel();
			// 	var tbodyHtml = getSelectTableRows(searhKeyword);
			// 	$moreTabletbody.html(tbodyHtml);
			// }else{

			// }
			refreshSelectTable();
		})
	}
	//添加删除控制
	function initInputTextHandler(eventName){
		var $activeTr = $moreTabletbody.children('tr.default'); //默认行
		var activeID = $activeTr.attr('ns-keyid'); 				//数据ID
		if(NetstarUI.resultTable.config.default.checkboxajax.isNumberID){
			activeID = parseInt(activeID);
		}
		var activeDataIndex = $activeTr.attr('ns-keyindex'); 	//数据索引
		activeDataIndex = parseInt(activeDataIndex); 			
		var activeTrIndex = $activeTr.index(); 					//行索引
		var trLength = $moreTabletbody.children('tr').length; 	//一共多少行
		switch(eventName){
			case 'confirm':
				//debugger
				var isChecked = $activeTr.hasClass('checked'); //是否是选中状态
				if(isChecked){
					$activeTr.removeClass('checked');
					$activeTr.find('label.checkbox-inline').removeClass('checked');
					var selectInputValue = options[tdData.selectIndex].value;
					selectInputValue.splice(selectInputValue.indexOf(activeID), 1);
					initValuePanel();
				}else{
					$activeTr.addClass('checked'); 
					$activeTr.find('label.checkbox-inline').addClass('checked');
					var selectInputValue = options[tdData.selectIndex].value;
					selectInputValue.push(activeID);
					initValuePanel();
				}
				$moreInput.val('');
				break;
			case 'up':
				if(trLength<=1){
					//如果只有一行数据或者没有数据
					return false;
				}
				if(activeTrIndex == 0){
					//第一行 不能往上走了
				}else{
					$activeTr.removeClass('default');
					$activeTr.prev().addClass('default');
				}
				break;
			case 'down':
				if(trLength<=1){
					//如果只有一行数据或者没有数据
					return false;
				}
				if(activeTrIndex == trLength - 1){
					//最后一行 不能往下走了
				}else{
					$activeTr.removeClass('default');
					$activeTr.next().addClass('default');
				}
				break;
			case 'delete':
				var selectInputValue = options[tdData.selectIndex].value;
				var deleteID = selectInputValue[selectInputValue.length-1];
				selectInputValue.splice(selectInputValue.length-1, 1);
				initValuePanel();
				var $unSelectTr = $moreTabletbody.find('tr.checked[ns-keyid="'+deleteID+'"]');
				if($unSelectTr.length==1){
					$unSelectTr.removeClass('checked');
					$unSelectTr.find('label.checkbox-inline').removeClass('checked');
				}
				break;
			default:
				if(debugerMode){
					console.error('不能识别的操作类型');
				}
				break
		}
	}
	//刷新下拉列表
	function refreshSelectTable(){
		//关键字
		var keyword = $moreInput.val();
		keyword = $.trim(keyword);
		if(keyword==''){
			keyword = 'all';  //为空则获取全部数据
		}

		var tbodyHtml = getSelectTableHtml(keyword);
		$moreTabletbody.html(tbodyHtml);
		$moreTabletbody.children('tr').not('.empty').off('click');
		$moreTabletbody.children('tr').not('.empty').on('click', function(ev){
			var $tr = $(this)
			if($tr.hasClass('default')==false){
				$moreTabletbody.children('tr.default').removeClass('default');
				$tr.addClass('default');
			}
			initInputTextHandler('confirm');
		})
		showSelectTable();
	}
	//删除下拉选项
	function removeSelectValue(id){
		if(NetstarUI.resultTable.config.default.checkboxajax.isNumberID){
			//id是否是数字
			id = parseInt(id);
		}
		var selectedValue = options[tdData.selectIndex].value;
		selectedValue = selectedValue.splice(selectedValue.indexOf(id),1);
		initValuePanel();
		var $unSelectTr = $moreTabletbody.find('tr.checked[ns-keyid="'+id+'"]');
		if($unSelectTr.length==1){
			$unSelectTr.removeClass('checked');
			$unSelectTr.find('label.checkbox-inline').removeClass('checked');
		}
	}
	//获取列表表格的值
	function getSelectTableHtml(keyword){
		var searchData = [];
		if(keyword=='all'){
			searchData = tdData.formatData;
		}else{
			searchData = searchTableData(keyword);
		}
		var tbodyHtml = '';
		for(var dataI = 0; dataI<searchData.length; dataI++){
			var rowData = searchData[dataI];
			var tdsHtml = '';
			//单元格数据
			var checkCls = options[tdData.selectIndex].value.indexOf(rowData.id)>=0?' checked':'';
			var defaultCls = dataI == 0? ' default':'';
			tdsHtml+=
				'<td>'
				+'<label '
					+'ns-keyindex="'+rowData.nsIndex+'" '
					+'ns-keyid="'+rowData.id+'" '
					+'class="checkbox-inline'+checkCls+defaultCls+'" '
				+'>'
				+'</td>'
			for(var showI = 0; showI<tdData.show.length; showI++){
				tdsHtml += 
					'<td>'
						+rowData[tdData.show[showI]]
					+'</td>';
			}
			//行数据
			var trHtml = 
				'<tr '
					+'ns-keyindex="'+rowData.nsIndex+'" '
					+'ns-keyid="'+rowData.id+'" '
					+'class="checkboxajax-select-tr'+checkCls+defaultCls+'"'
				+'>'
					+tdsHtml
				+'</tr>'
			tbodyHtml += trHtml;
			//最大十条
			if(dataI==9){
				dataI = tdData.formatData.length;
			}
		}
		if(searchData.length == 0){
			tbodyHtml = '<tr class="empty"><td>没有找到匹配的项目<td></tr>'
		}
		return tbodyHtml;
	}
	//搜索数据
	function searchTableData(keyword){
		var resultData = [];
		for(var dataI = 0; dataI<tdData.formatData.length; dataI++){
			var isMatching = false;
			$.each(tdData.formatData[dataI], function(keyname,value){
				//debugger
				if(typeof(value)=='string'){
					if(keyname!='id'&&keyname!='nsIndex'){

						if(keyname == NetstarUI.resultTable.config.default.checkboxajax.field.py){
							keyword = keyword.toUpperCase();
						}
						if(value.indexOf(keyword)>=0){
							isMatching = true;
						}
					}
				}
			})
			if(isMatching){
				resultData.push(tdData.formatData[dataI]);
			}
		}
		return resultData;
	}
	//显示下拉列表
	function showSelectTable(){
		$moreSelect.show();
		function moreSelectOutClickHanlder(ev){
			var $evTarget = $(ev.target);
			var isOutClick = $evTarget.closest('.checkboxajax-more-select-table').length == 0?true:false;
			var isInInput = $evTarget.hasClass('checkboxajax-more-input');
			var isInUnderline = $evTarget.hasClass('checkbox-more-underline');
			if(isInInput || isInUnderline){
				//如果点击的是显示下划线或者输入框也不隐藏
				isOutClick = false;
			}
			if($moreInput.is(':focus')){
				//如果输入焦点在文本框里面
				isOutClick = false;
			}
			if(isOutClick){
				$(document).off('click', moreSelectOutClickHanlder);
				$moreSelect.hide();
			}
		}
		$(document).off('click', moreSelectOutClickHanlder);
		$(document).on('click', moreSelectOutClickHanlder);
	}
	//获取value 保存用时调用
	function getValue(){
		var realValue = $.extend(true, [], checkboxValues);
		if(isWithMoreOption){
			var isMoreCheck = false;
			//如果 selectIndex == 0 则代表没有选项，只有下拉框对应的样式是checkbox-inline-none
			if(tdData.selectIndex == 0){
				//isMoreCheck = $container.children('label.checkbox-inline-none').eq(tdData.selectIndex).hasClass('checked');
				isMoreCheck = true;
			}else{
				isMoreCheck = $container.children('label.checkbox-inline').eq(tdData.selectIndex).hasClass('checked');
			}
			//如果有则进行拼接
			if(isMoreCheck){
				realValue = realValue.concat(selectValues);
			}else{
				//如果更多没有被选中，则需要重新核实多选的选项
				var newSelectValue = [];
				for(var selectValueI = 0; selectValueI<tdData.options[tdData.selectIndex].value.length; selectValueI++){
					if(realValue.indexOf(tdData.options[tdData.selectIndex].value[selectValueI])>=0){
						newSelectValue.push(tdData.options[tdData.selectIndex].value[selectValueI]);
					}
				}
				tdData.options[tdData.selectIndex].value = newSelectValue;
			}
		}
		return realValue;
	}
	//点击 change 事件 外面的checkbox复选框，不包含更多输入框中的复选框
	function changeHandler(ev){
		var value = parseInt($(this).val());
		tabIndex = value;
		var $targetLabel = $(this).prev();
		optionFocus($targetLabel);
		optionChecked($targetLabel);
	}
	//选择焦点事件
	function optionFocus($focusLabel){
		$container.children('label.checkbox-inline.focus').removeClass('focus');
		$focusLabel.addClass('focus');
		//移除input输入框的焦点
		if(isWithMoreOption){
			if($moreInput.is(':focus')){
				$moreInput.blur();
			}
		}
	}
	function optionChecked($checkedLabel){
		$checkedLabel.toggleClass('checked');
		var checkedResult = $checkedLabel.hasClass('checked')?true:false;
		var checkedKeyIndex = parseInt($checkedLabel.attr('ns-keyindex'));
		$checkedLabel.next().prop('checked',checkedResult);
		//根据ID进行数据添加或者删除
		var checkedValue = $checkedLabel.next('input').val();
		if(NetstarUI.resultTable.config.default.checkboxajax.isNumberID){
			checkedValue = parseInt(checkedValue);
		}
		
		
		if(checkedKeyIndex == tdData.selectIndex){
			$moreInput.val('');  //只要点击就清理inputtext
			if(checkedResult){
				//确认更多复选框
				$moreInput.focus();
				$moreInput.select();
				//refreshSelectTable();
				//debugger;
			}else{
				//取消更多复选框
				//tempInputValue = $moreInput.val();
				selectValues.splice(0, selectValues.length);
				initValuePanel();
				$moreSelect.hide();
			}
		}else{
			//点击的不是更多复选框
			if(checkedResult){
				//添加操作
				if(checkboxValues.indexOf(checkedValue)==-1){
					checkboxValues.push(checkedValue);
				}
			}else{
				//取消操作
				if(checkboxValues.indexOf(checkedValue)>=0){
					checkboxValues.splice(checkboxValues.indexOf(checkedValue),1);
				}
			}
			if(isWithMoreOption){
				$moreSelect.hide();
			}
			
		}
	}
	//快捷键 tab是内部切换，空格是选中，left，right是左右
	function checkboxajaxInputShortkey(keyType, event){
		var isInput = $(event.target).hasClass('checkboxajax-more-input');
		//当前操作对象是否更多input
		switch(keyType){
			case 'tab':
				//checkbox之间移动
				if(tabIndex < $container.children('label.checkbox-inline').length-1){
					tabIndex++;
					var $currentTabOption = $container.children('label.checkbox-inline').eq(tabIndex);
					optionFocus($currentTabOption);
				}else if(tabIndex == $container.children('label.checkbox-inline').length-1){
					//移动到input
					tabIndex++;
					$moreInput.focus();
					$moreInput.select();
				}else{
					//最后一个就挪到下一个了
					NetstarUI.resultTable.shortkeyMoveInput('enter');
				}
				break;
			case 'left':
				if(isInput){
					//如果是在input里，则执行默认操作
				}else{
					if(tabIndex==0){
						//如果是第一个，那就上一个单元格
						NetstarUI.resultTable.shortkeyMoveInput('left');
					}else{
						//上一个option
						tabIndex--;
						var $prevOption = $container.children('label.checkbox-inline').eq(tabIndex);
						optionFocus($prevOption);
					}
				}
				
				break;
			case 'right':
				if(isInput){
					//如果是在input里，则执行默认操作
				}else{
					if(tabIndex==$container.children('label.checkbox-inline').length){
						//如果是最后一个，那就上一个单元格
						NetstarUI.resultTable.shortkeyMoveInput('right');
					}else{
						//下一个option
						tabIndex++;
						var $nextOption = $container.children('label.checkbox-inline').eq(tabIndex);
						optionFocus($nextOption);
					}
				}
				break;
			case 'space':
				//如果当前输入焦点在输入框里，则不屏蔽空格的默认事件，否则则执行选中事件
				var isDefaultEvent = true;
				if(isWithMoreOption){
					//如果当前输入焦点在输入框里, 屏蔽空格的checkbox选中事件
					if($moreInput.is(':focus')){
						isDefaultEvent = false;
					}
					//如果下拉列表打开
					if($moreSelect.css('display')!='none'){
						initInputTextHandler('confirm');
						event.preventDefault();
						isDefaultEvent = false;
					}
				}
				if(isDefaultEvent == false){
					return;	
				}
				//空格触发选中事件
				event.preventDefault();
				var $currentLabel = $container.children('label.checkbox-inline.focus');
				if($currentLabel.attr('ns-keyindex')){

				}
				if($currentLabel.length==0){
					$currentLabel = $container.children('label.checkbox-inline').eq(0);
					optionFocus($currentLabel);
				}
				optionChecked($currentLabel);
				break;
			case 'enter':
				return getValue();
				break;
			default:
				if(debugerMode){
					console.error('checkboxajaxInputShortkey 中不能识别的快捷键:'+keyType);
				}
				break;
		}
	}
	NetstarUI.resultTable.checkboxajaxInputShortkey = checkboxajaxInputShortkey;
}
//根据real和subdata获取value.visible和value.edit
NetstarUI.resultTable.getCheckboxAjaxVisible = function(tdData,config){
	var visibleHtml = '';
	var editHtml = '';
	//如果不是初始化，则tdData.options已经有了只要根据值重新格式化就可以了
	if(typeof(tdData.options)=='object'){
		for(var optionI = 0; optionI<tdData.options.length; optionI++){
			var formatStringObj = formatString(tdData.options[optionI],optionI);
			visibleHtml += formatStringObj.visible;
			editHtml += formatStringObj.edit;
		}
		return {
			'visible':visibleHtml,
			'edit':editHtml
		}
	}

	//初始化时候执行 
	var formatStr = tdData.value.format;
	var formatLength = formatStr.match(/{/g).length;
	//拆分字符串 转化为配置参数
	var options = [];
	var selectIndex = -1;  //下拉选择框的位置
	for(var subIndex = 0; subIndex<formatLength; subIndex++){
		var outputIndex = formatLength-1-subIndex;
		var subOptionStr = formatStr.substring(formatStr.lastIndexOf('{'),formatStr.length);
		formatStr = formatStr.substring(0, formatStr.lastIndexOf('{'));

		//获取配置参数
		var configStr = subOptionStr.substring(subOptionStr.indexOf('{')+1, subOptionStr.indexOf('}'));
		configStr = configStr.replace(/ /g,''); 	//去掉空格
		configStr = configStr.replace(/：/g,':'); 	//冒号转成英文
		configStr = configStr.replace(/，/g,','); 	//逗号转成英文
		var configOption = {};
		var configArr = configStr.split(',');
		for(var configI = 0; configI<configArr.length; configI++){
			var optionStr = configArr[configI];
			var key = optionStr.substring(0,optionStr.indexOf(':'));
			var value = optionStr.substring(optionStr.indexOf(':')+1, optionStr.length);
			value = value.replace(/'/g,'');
			if(key=='url'){
				value = config.default.urlPrefix+value;
			}
			configOption[key] = value;
		}
		//获取显示字符串
		var showStr = subOptionStr.substring(subOptionStr.indexOf('}')+1, subOptionStr.length);
		//判断类型
		var strType = '';
		if(typeof(configOption.url)=='string'){
			strType = 'select';
		}else if(typeof(configOption.id)=='string'){
			strType = 'checkbox';
		}
		configOption.subType = strType;
		//根据类型需要进一步加工
		if(strType == 'select'){
			if(showStr.indexOf('_')>=0){
				configOption.length = showStr.match(/_/g).length;
				configOption.inputPosition = showStr.search(/_/);
				showStr = showStr.replace(/_/g,'');
			}else{
				configOption.length = config.default.selectLength;   	//输入框长度
				configOption.inputPosition = showStr.length;  			//插入位置
			}
			configOption.ajaxID = outputIndex+'-select-'+tdData.nsId;

			//重新组织data数据
			if(typeof(configOption.data)=='string'){
				configOption.data = nsVals.getJsonFromEqualAnd(configOption.data);
			}else{
				configOption.data = {};
			}
			//重新组织field
			if(typeof(configOption.field)=='string'){
				configOption.field = nsVals.getJsonFromEqualAnd(configOption.field);
			}
			//重新组织show
			if(typeof(configOption.show)=='string'){
				configOption.show = configOption.show.split('&');
			}
			//选择组件的索引值
			selectIndex = outputIndex;
		}else if(strType == 'checkbox'){
			if(config.default.checkboxajax.isNumberID){
				configOption.id = parseInt(configOption.id);
			}
		}
		configOption.showStr = showStr;
		//输出到页面的ID和name
		configOption.outputName = tdData.id+'-checkboxajax';
		configOption.outputID = tdData.id+'-checkboxajax-'+outputIndex;
		options.unshift(configOption)
	}
	//查找下拉输入框的值
	var selectValue = $.extend(true, [], tdData.value.real);
	for(var optionI = 0; optionI<options.length; optionI++){
		if(options[optionI].subType == "checkbox"){
			if(selectValue.indexOf(options[optionI].id)>=0){
				selectValue.splice(selectValue.indexOf(options[optionI].id),1);
			}
		}
	}
	if(selectIndex != -1){
		options[selectIndex].value = selectValue;
	}
	//把参数转换为HTML
	function formatString(configOption, subIndex){
		//配置参数 分别输出 编辑面板代码和显示面板代码
		var visibleStr = ''
		var editStr = '';
		
		switch(configOption.subType){
			case 'checkbox':
				var checkedCls = '';
				var checkboxAttr = '';
				if(tdData.value.real.indexOf(configOption.id)>=0){
					checkedCls = ' checked';
					checkboxAttr = 'checked';
				}
				visibleStr = 
					'<label ns-keyindex="'+subIndex+'" '
						+'class="checkbox-inline'+checkedCls+'"'
					+'>'
						+configOption.showStr
					+'</label>';
				editStr = 
					'<label ns-keyindex="'+subIndex+'" '
						+'class="checkbox-inline '+checkedCls+'" '
						+'for="'+configOption.outputID+'"'
					+'>'
						+configOption.showStr
					+'</label>'
					+'<input id="'+configOption.outputID+'" name="'+configOption.outputName+'" '
						+'class="checkbox-options" type="checkbox" '
						+'value="'+configOption.id+'" '
						+checkboxAttr
					+'/>';
				break;
			case 'select':
				var valueStr = '　';
				var checkedCls = '';
				var checkboxAttr = '';
				if($.isArray(configOption.value)){
					if(configOption.value.length > 0){
						valueStr = '<i class="fa fa-spinner fa-spin"></i>';
					}else{
						valueStr = '';
					}
					
					checkedCls = ' checked';
					checkboxAttr = 'checked';
				}
				//如果不是第一次执行，已经有了基础数据了
				if($.isArray(tdData.formatData)){
					valueStr = NetstarUI.resultTable.checkboxAjaxGetName(configOption.value, tdData.formatData);
				};
				//如果value是空，也执行则替换为全角空格，去掉选中标识
				if(valueStr==''){
					valueStr = '　';
				}
				if(configOption.value.length == 0){
					checkedCls = '';
					checkboxAttr = '';
				}
				//显示用 如果只有输入框则不显示勾选框
				var inputCheckboxCls = 'checkbox-inline';
				if(configOption.inputPosition == 0){
					inputCheckboxCls = 'checkbox-inline-none';
				}
				var showStr = 
					configOption.showStr
					+'<span '
						+'ns-keyindex="'+configOption.ajaxID+'" '
						+'class="checkbox-more-underline" '
						+'style="min-width:'+(configOption.length*12+8)+'px;"'
					+'>'
					+valueStr
					+'</span>';
				visibleStr = 
					'<label ns-keyindex="'+subIndex+'" '
						+'class="'+inputCheckboxCls+checkedCls+'"'
					+'>'
						+showStr
					+'</label>';
				//编辑用
				editStr = 
					//复选框label
					'<label ns-keyindex="'+subIndex+'" '
						+'class="'+inputCheckboxCls+' '+checkedCls+'" '
						+'for="'+configOption.outputID+'"'
					+'>'
						+configOption.showStr
					+'</label>'
					//复选框 checkbox
					+'<input id="'+configOption.outputID+'" name="'+configOption.outputName+'" '
						+'class="checkbox-options" type="checkbox" '
						+'value="moreinput" '
						+checkboxAttr
					+'/>'
					//输入框容器
					+'<div '
						+'id="'+configOption.outputName+'-more-input-container" '
						+'class="checkboxajax-more-input-container" '
					+'>'
						//输入框显示值容器
						+'<div '
							+'id="'+configOption.outputName+'-more-values" '
							+'class="checkboxajax-more-values"'
						+'>'
						+'</div>'
						//输入框
						+'<input '
							+'id="'+configOption.outputName+'-more-input" '
							+'name="'+configOption.outputName+'-more-input" '
							+'class="checkboxajax-more-input" '
							+'type="text" '
							+'style="min-width:'+(configOption.length*12+8)+'px;"'
						+'>'
					+'</div>'
					//下拉显示列表
					+'<div '
						+'id="'+configOption.outputName+'-more-select-table" '
						+'class="checkboxajax-more-select-table" '
					+'></div>'
				break;
			default:
				if(debugerMode){
					console.error('配置字符串错误，无法识别：'+subOptionStr);
				}
				break;
		}
		return {
			visible:visibleStr,
			edit:editStr
		}
	}
	for(var subI = 0; subI<formatLength; subI++){
		var formatStringObj = formatString(options[subI],subI);
		visibleHtml += formatStringObj.visible;
		editHtml += formatStringObj.edit;
	}
	tdData.options = options;
	tdData.selectIndex = selectIndex;
	tdData.isWithMoreOption = selectIndex != -1;
	//是否需要发送ajax获取数据
	var isNeedGetData = false;
	if(selectIndex != -1){
		//如果是只读的，且没有选中值就不用发了
		if(tdData.readonly == true && selectValue.length == 0){
			isNeedGetData = false;
		}else{
			isNeedGetData = true;
		}
	}
	//需要发送ajax获取数据
	if(isNeedGetData){
		//如果存在要输入或者要赋值的下拉输入框，则发送ajax，获取数据
		var selectOption = options[selectIndex];
		var checkBoxIDArray = [];
		for(var optionI = 0; optionI<options.length; optionI++){
			if(optionI!=selectIndex){
				checkBoxIDArray.push(options[optionI].id);
			}
		}
		var ajaxType = config.default.checkboxajax.type;
		var ajaxData = $.extend({},config.default.checkboxajax.data,selectOption.data);
		var ajaxConfig = {
			url:selectOption.url,
			data:ajaxData,
			type:ajaxType,
			plusData:{
				tableID:config.id,
				tdID:tdData.id,
				option:selectOption,
				checkBoxIDArray:checkBoxIDArray
			}
		}
		nsVals.ajax(ajaxConfig, function(data,ajax){

			var plusData = ajax.plusData;
			var option = plusData.option;
			var checkBoxIDArray = plusData.checkBoxIDArray; //checkbox已经使用了的id
			var dataSrc = config.default.checkboxajax.dataSrc;
			var baseData = data[dataSrc];
			//验证源数据
			if(debugerMode){
				if($.isArray(baseData)==false){
					console.error('checkboxajax组件的数据源错误 当前td为：'+plusData.tdID+'，url:'+ajax.url+', dataSrc:'+dataSrc);
				}
			}
			//获取数据源field
			var dataField = config.default.checkboxajax.field;
			if(typeof(option.field)=='object'){
				if(typeof(dataField)=='undefined'){
					dataField = option.field;
				}else{
					$.each(option.field, function(key,value){
						if(typeof(option.field[key])=='string'){
							if(option.field[key]==''){
								delete dataField[key];
							}else{
								 dataField[key] = option.field[key]
							}
						}
					})
				}
			}
			//获取可视字段
			if($.isArray(option.show)==false){
				option.show = config.default.checkboxajax.show;
			}
			tdData.show = option.show;
			//查找名称

			//格式化数据源
			var formatData = [];
			var nsIndex = 0;
			for(var dataI = 0; dataI<baseData.length; dataI++){

				var originalData = baseData[dataI];
				if(checkBoxIDArray.indexOf(originalData.id)>=0){
					//如果已经在checkbox上了，就不要添加了
				}else{
					var rowData = {};
					for(key in dataField){
						rowData[key] = originalData[dataField[key]]
					};
					rowData.nsIndex = nsIndex;
					nsIndex++;
					formatData.push(rowData);
				}
			}
			tdData.formatData = formatData;
			//获取值
			var nameStr = NetstarUI.resultTable.checkboxAjaxGetName(option.value, formatData, tdData.value.real);
			if(nameStr==''){
				nameStr = '　';
			}
			$('#'+plusData.tableID+' #'+plusData.tdID+' [ns-keyindex="'+option.ajaxID+'"]').html(nameStr)
		})
	}else{
		//如果不需要发送ajax又输出了loading，则替换掉加载图标
		var loadingTagStr = '<i class="fa fa-spinner fa-spin"></i>';
		if(visibleHtml.indexOf(loadingTagStr)>-1){
			visibleHtml = visibleHtml.replace(new RegExp(loadingTagStr), '');
		}
	}
	return {
		'visible':visibleHtml,
		'edit':editHtml
	}
}
//根据id数组，返回显示名称
NetstarUI.resultTable.checkboxAjaxGetName = function(idArray,formatData, realValue){
	var nameStr = '';
	var spliceIndexArray = [];  //存放无法匹配结果的数组
	if(idArray.length>0){
		for(var valueI = 0; valueI<idArray.length; valueI++){
			var valueID = idArray[valueI];
			var isMatching = false;
			for(var rowI = 0; rowI<formatData.length; rowI++){
				if(formatData[rowI].id==valueID){
					if(nameStr!=''){
						nameStr += '<span class="blankspace"></span>';
						//添加空格
					}
					nameStr+=formatData[rowI].name;
					isMatching = true;
				}
			}
			if(isMatching==false){
				console.error('系统数据多选组件存在不匹配的id:'+valueID);
				//nsalert('系统数据多选组件存在不匹配的id:'+valueID, 'warning');
				spliceIndexArray.push(valueID);
			}
		}
		//把不匹配的数据删掉，防止影响后续结果
		for(var spliceI = 0; spliceI<spliceIndexArray.length; spliceI++){
			idArray.splice(idArray.indexOf(spliceIndexArray[spliceI]),1);
			if(realValue){
				realValue.splice(realValue.indexOf(spliceIndexArray[spliceI]),1);
			}
		}
	}
	return nameStr;
}
//快捷键 上下左右回车  ctrl+alt+f 全屏/退出全拼
NetstarUI.resultTable.initShortkey = function(){
	$(document).off('keydown');
	$(document).on('keydown',function(ev){
		var tdData = NetstarUI.resultTable.data.tdData[NetstarUI.resultTable.currentTdID];
		function moveInput(direction){
			var moveTargetID = tdData.neighbours[direction];
			if(moveTargetID){
				var inputResizeData = NetstarUI.resultTable.getResizeDataByDom($('#'+moveTargetID));
				NetstarUI.resultTable.showEditPanel(inputResizeData);
			}
		}
		NetstarUI.resultTable.shortkeyMoveInput = moveInput;
		switch(ev.keyCode){
			case 38:
				//上
				switch(NetstarUI.resultTable.shortkeyType){
					case 'select':
						//下拉框状态下是
						ev.stopPropagation(); 
						NetstarUI.resultTable.inputSelectShortkey('up');
						ev.preventDefault(); 
						break;
					case 'date':
						//日期状态下组件接管上下左右
						ev.preventDefault(); 
						break;
					case 'table':
						//表格状态下是下面的单元格
						ev.stopPropagation(); 
						moveInput('up');
						break;
					case 'multiselect':
						ev.stopPropagation();
						NetstarUI.resultTable.inputMultiselectShortKey('up');
						ev.preventDefault();
						break;
					default:
						break;	
				}
				break;
			case 40:
				//下
				switch(NetstarUI.resultTable.shortkeyType){
					case 'select':
						//下拉框状态下是
						ev.stopPropagation(); 
						NetstarUI.resultTable.inputSelectShortkey('down');
						ev.preventDefault(); 
						break;
					case 'date':
						//日期状态下组件接管上下左右
						ev.preventDefault(); 
						break;
					case 'table':
						//表格状态下是下面的单元格
						ev.preventDefault(); 
						moveInput('down');
						break;
					case 'multiselect':
						ev.stopPropagation();
						NetstarUI.resultTable.inputMultiselectShortKey('down');
						ev.preventDefault();
						break;
					default:
						break;	
				}
				break;
			case 37:
				//左
				ev.stopPropagation(); 
				switch(NetstarUI.resultTable.shortkeyType){
					case 'date':
						//日期状态下组件接管上下左右
						break;
					case 'checkbox':
						//移动到上一个option
						NetstarUI.resultTable.checkboxInputShortkey('left',ev);
						break;
					case 'checkboxajax':
						//移动到上一个option
						NetstarUI.resultTable.checkboxajaxInputShortkey('left',ev);
						break;
					case 'select':
					case 'table':
					case 'multiselect':
						//表格状态下是下面的单元格
						//lye 2018/04/17
						//表格中的表单获得焦点时，判断是否是 最左
						var currentInputPanel = NetstarUI.resultTable.config.$editPanel.children('.component-container').children('.show');
						if(currentInputPanel.length > 0){
							var currentInputPanelInput = currentInputPanel.children("input");
							if(currentInputPanelInput.length>0){
								var selectionStart = currentInputPanelInput[0].selectionStart;
								if(selectionStart>0){
									break;
								}
							}
						}
						moveInput('left');
						break;
					default:
						break;	
				}
				break;
			case 39:
				//右
				switch(NetstarUI.resultTable.shortkeyType){
					case 'date':
						//日期状态下组件接管上下左右
						ev.preventDefault(); 
						break;
					case 'checkbox':
						//移动到上一个option
						NetstarUI.resultTable.checkboxInputShortkey('right',ev);
						break;
					case 'checkboxajax':
						//移动到上一个option
						NetstarUI.resultTable.checkboxajaxInputShortkey('right',ev);
						break;
					case 'select':
					case 'table':
					case 'multiselect':
						//表格状态下是下面的单元格
						//lye 2018/04/17
						//表格中的表单获得焦点时，判断是否是  最右
						var currentInputPanel = NetstarUI.resultTable.config.$editPanel.children('.component-container').children('.show');
						if(currentInputPanel.length > 0){
							var currentInputPanelInput = currentInputPanel.children("input");
							if(currentInputPanelInput.length>0){
								var selectionStart = currentInputPanelInput[0].selectionStart;
								var valueLength = currentInputPanelInput.val().length;
								if(selectionStart<valueLength){
									ev.stopPropagation(); 
									break;
								}
							}
						}
						ev.stopPropagation(); 
						moveInput('right');
						break;
					default:
						break;	
				}
				break;
			case 13:
				//回车确认
				var currentInputPanel = NetstarUI.resultTable.config.$editPanel.children('.component-container').children('.show');
				if(currentInputPanel.length != 0){
					ev.preventDefault();
					var isValid = NetstarUI.resultTable.validValue(tdData);
					if(isValid==false){
						return false;
					}
					switch(NetstarUI.resultTable.shortkeyType){
						case 'select':
							//下拉框状态下的确认
							NetstarUI.resultTable.inputSelectShortkey('enter');
							moveInput('enter');
							break;
						case 'date':
							moveInput('enter');
							break;
						case 'textarea':
							// if(ev.shiftKey){
								//如果是shift+enter 则添加回车符号  NetstarUI.htmlInput.init中添加了alt+enter这里没用了
								// var currentText = NetstarUI.resultTable.config.$editPanelTextareaInput.val();
								// var textarea = NetstarUI.resultTable.config.$editPanelTextareaInput
								// var cursorPosition = textarea.getCursorPosition();
								// currentText = currentText.substring(0,cursorPosition)+'\r'+currentText.substring(cursorPosition,currentText.length);
								// textarea.val(currentText);
								// textarea.setCursorPosition(cursorPosition+1);
							// }else{
								var value = NetstarUI.resultTable.getInputValue();
								NetstarUI.resultTable.saveTdData(NetstarUI.resultTable.currentTdID,value);
								NetstarUI.resultTable.refreshTd(NetstarUI.resultTable.currentTdID);
								moveInput('enter');
							// }
							break;
						case 'multiinput':
							var value = NetstarUI.resultTable.multiinputShortkey('enter');
							if(value){
								NetstarUI.resultTable.saveTdData(NetstarUI.resultTable.currentTdID,value);
								NetstarUI.resultTable.refreshTd(NetstarUI.resultTable.currentTdID);
							}
							moveInput('enter');
							break;
						case 'checkbox':
							var checkboxValue = NetstarUI.resultTable.checkboxInputShortkey('enter');
							var value = {
								real:checkboxValue.real,
								visible:'temp'
							}
							NetstarUI.resultTable.saveTdData(NetstarUI.resultTable.currentTdID,value);
							if(tdData.isWithMoreOption){
								tdData.moreOption.value = checkboxValue.moreValue;
							}
							var valueRealArr = value.real.split('|');
							tdData.valueRealArr = valueRealArr;
							var formatValueObj = NetstarUI.resultTable.getCheckboxVisible(tdData);
							tdData.value.visible = formatValueObj.visible;
							tdData.value.edit = formatValueObj.edit;
							NetstarUI.resultTable.refreshTd(NetstarUI.resultTable.currentTdID);
							if(value){
								//NetstarUI.resultTable.saveTdData(NetstarUI.resultTable.currentTdID,value);
								//NetstarUI.resultTable.refreshTd(NetstarUI.resultTable.currentTdID);
							}
							moveInput('enter');
							break;
						case 'checkboxajax':
							var idArray = NetstarUI.resultTable.checkboxajaxInputShortkey('enter',ev);
							var value = {
								real:idArray,
								visible:'temp'
							}
							NetstarUI.resultTable.saveTdData(NetstarUI.resultTable.currentTdID,value);
							var htmlObj = NetstarUI.resultTable.getCheckboxAjaxVisible(tdData, this.config);
							tdData.value.visible = htmlObj.visible;
							tdData.value.edit = htmlObj.edit;
							NetstarUI.resultTable.refreshTd(NetstarUI.resultTable.currentTdID);
							moveInput('enter');
							break;
						case 'table':
							//表格状态下是确认 如果是下拉列表则已经储存过数据，不用储存了
							if(tdData.type!='select'){
								var value = NetstarUI.resultTable.getInputValue();
								if(value!=false){
									NetstarUI.resultTable.saveTdData(NetstarUI.resultTable.currentTdID,value);
									NetstarUI.resultTable.refreshTd(NetstarUI.resultTable.currentTdID);
								}
							}
							moveInput('enter');
							break;
						case 'multiselect':
							NetstarUI.resultTable.inputMultiselectShortKey('enter');
							moveInput('enter');
							break;
						default:
							break;	
					}
				}
				break;
			//TAB
			case 9:
				ev.preventDefault(); 
				switch(NetstarUI.resultTable.shortkeyType){
					case 'multiinput':
						NetstarUI.resultTable.multiinputShortkey('tab');
						break;
					case 'checkbox':
						NetstarUI.resultTable.checkboxInputShortkey('tab');
						break;
					case 'checkboxajax':
						NetstarUI.resultTable.checkboxajaxInputShortkey('tab',ev);
						break;
					default:
						moveInput('enter');
						break;
				}
				break;
			//空格
			case 32:
				switch(NetstarUI.resultTable.shortkeyType){
					case 'checkbox':
						NetstarUI.resultTable.checkboxInputShortkey('space',ev);
						break;
					case 'checkboxajax':
						NetstarUI.resultTable.checkboxajaxInputShortkey('space',ev);
						break;
					case 'multiselect':
						NetstarUI.resultTable.inputMultiselectShortKey('space',ev);
						break;
					default:
						break;
				}
				break;
			//ctrl+alt+f 全屏/退出全拼 lyw 20180329
			case 70:
				if(ev.ctrlKey && ev.altKey){
					var config = NetstarUI.resultTable.config;
					var $container = config.$container;
					if($container.hasClass('fullscreen')){
						NetstarUI.resultTable.exitFullScreenMode();
					}else{
            			NetstarUI.resultTable.fullScreenMode();
            		}
				}
				break;
			default:
				break;
		}
	})
}
//验证输入值是否合法
NetstarUI.resultTable.validValue = function(tdData){
	//标准valid验证
	if(typeof(tdData.rules)=='string'){
		if($('#resultTableContainer-inputcomponent-form').valid()==false){
			return false;
		}
	}
	//获取输入值  同时表示出来验证
	var $validInput;
	function getInputValue(){
		var inputValue = '';
		switch(tdData.type){
			case 'string':
				var inputDomName = tdData.type.substring(0,1).toUpperCase() + tdData.type.substring(1);
				inputDomName = '$editPanel'+inputDomName+'Input';
				$validInput = NetstarUI.resultTable.config[inputDomName];
				inputValue = $validInput.val();
				break;
		}
		return inputValue;
	}
	//显示错误提示信息
	function showError(msg){
		var errorInputID = $validInput.attr('id')
		var errorHtml = 
			'<label id="'+errorInputID+'-error" '
				+'class="has-error" '
				+'for="'+errorInputID+'"'
			+'>'
				+msg
			+'</label>';
		if($validInput.parent().children('.has-error').length>=1){
			$validInput.parent().children('.has-error').remove();
		}
		$validInput.after(errorHtml);
	}
	//mask验证
	if(typeof(tdData.maskString)=='string'){
		inputValue = getInputValue();
		if(inputValue!=''){
			if(inputValue.indexOf('_')>=0){
				showError('输入不完整');
				return false;
			}
		}
	}
	//日期验证
	if(typeof(tdData.momentRules)=='string'){
		inputValue = getInputValue();
		if(inputValue!=''){
			//长度不等就不等于
			if(inputValue.length != tdData.momentRules.length){
				showError('输入不完整');
				return false;
			}else{
				if(moment(inputValue,tdData.momentRules).isValid()){
					//验证通过
				}else{
					showError('输入时间格式不合法');
					return false;
				}
			}
		}
	}
	return true;
}
//获取输入组件的值
NetstarUI.resultTable.getInputValue = function(){
	var currentInputPanel = NetstarUI.resultTable.config.$editPanel.children('.component-container').children('.show');
	var currentInputType = currentInputPanel.attr('ns-class');
	var tdData = NetstarUI.resultTable.data.tdData[NetstarUI.resultTable.currentTdID];
	var value = {};
	switch(currentInputType){
		case 'none':
			return false;
			break;
		case 'string':
			var valueStr = currentInputPanel.children('input').val();
			value.visible = valueStr;
			value.real = valueStr;
			if($.isArray(tdData.filterStringArray)){
				for(filterI = 0; filterI<tdData.filterStringArray.length; filterI++){
					value.real = value.real.replace(tdData.filterStringArray[filterI],'');
				}
			}
			break;
		case 'number':
			var valueStr = currentInputPanel.children('input').val();
			value.real = parseFloat(valueStr);

			//如果区别显示正负数
			if(typeof(tdData.subdata)=='object' && !isNaN(value.real)){
				if(tdData.subdata.stateColor){
					//显示红色绿色表示正负
					valueStr = value.real;
					if(value.real>0){
						valueStr = '<span class="plus">'+valueStr+'</span>'
					}else{
						valueStr = '<span class="minus">'+valueStr+'</span>'
					}
				}
				if(tdData.subdata.showPlus){
					//是否在正数时显示加号
					valueStr = value.real;
					if(value.real>0){
						valueStr = '+'+valueStr;
					}
				}
			}
			
			//科学计数法组件重新获取格式化后的字符串
			if(tdData.originalType == 'scientificInput'){
				value.visible = NetstarUI.resultTable.getScientificValue(tdData.subdata, valueStr)
			}else{
				value.visible = valueStr;
			}
			if(isNaN(value.real)){
				value.real = '';
				value.visible = '';
			}
			break;
		case 'date':
			break;
		case 'select':
			//已经重新定义enter事件，这里不写了
			return false;
			break;
		case 'textarea':
			var valueStr = currentInputPanel.children('textarea').val();
			value.real = valueStr;
			valueStr = valueStr.replace(/\r{0,}\n/g,'<br>').replace(/\s/g,'&nbsp;').replace(/\t/g,'&nbsp;&nbsp;&nbsp;&nbsp;' );
			//valueStr = valueStr.replace(/\n/g,'<br>');
			//valueStr = valueStr.replace(/\n/g,'<br>');
			value.visible = valueStr;
			break;
		case 'uploadtitle':
		case 'multiupload':
			//上传图片 20180319 sjj
			return false;
			break;
		case 'multiselect':
			break;
		default:
			if(debugerMode){
				console.error('输入框类型无法识别');
			}
			break;
	}
	return value;
}
//保存单元格数据，不完整，enter事件中有另一部分
NetstarUI.resultTable.saveTdData = function(tdID,value){
	var tdData = NetstarUI.resultTable.data.tdData[tdID];
	var isEdit = false;
	switch(tdData.type){
		case 'checkboxajax':
			if(value.real.length!=tdData.value.real.length){
				isEdit = true;
			}
			for(var valueI = 0; valueI<value.real.length; valueI++){
				var isInValue = tdData.value.real.indexOf(value.real[valueI]);
				if(isInValue == -1){
					isEdit = true;
				}
			}
			break;
		default:
			isEdit = tdData.value.real!==value.real
			break;
	}
	//只有修改过才改变状态
	if(isEdit){
		tdData.value.real = value.real;
		tdData.value.visible = value.visible;
		tdData.state = 'edit';
		//tdData.history ++;
	}
}
//刷新单元格
NetstarUI.resultTable.refreshTd = function(tdID){
	var tdData = NetstarUI.resultTable.data.tdData[tdID];
	var html = tdData.value.visible;
	var config = NetstarUI.resultTable.config;
	//历史
	if(tdData.history>0 && config.isShowHistory){
		var historyNumber = tdData.history;
		if(historyNumber>99){
			historyNumber = 99;
		}
		html+='<div class="history">'+historyNumber+'</div>';
	}
	//样品排序
	if(typeof(tdData.setSampleOrder)=='number'){
		html+='<div class="simpleorder">'+tdData.setSampleOrder+'</div>';
	}
	tdData.$td.html(html);
	var classStr = tdData.type+' '+tdData.state;
	tdData.$td.attr('class',classStr)
	tdData.$td.find('.history').on('click',NetstarUI.resultTable.historyClickHandler)
}

//获取style字符串
NetstarUI.resultTable.getStyleString = function(styleJson,config){
	var styleStr = ''
	function getStyleName(nameStr){
		while(nameStr.search(/[A-Z]/)>-1){
			var firstA = nameStr.substr(nameStr.search(/[A-Z]/),1);
			nameStr = nameStr.replace(firstA,'-'+firstA.toLowerCase());
		}
		return nameStr;
	}
	if($.isArray(config.unUseSettingStyle)){
		for(var nameGroupI = 0;  nameGroupI<config.unUseSettingStyle.length; nameGroupI++){
			var styleClassName = config.unUseSettingStyle[nameGroupI]
			delete styleJson[styleClassName];
		}
	}
	
	for(styleClass in styleJson){
		switch(styleClass){
			case 'background':
				styleStr += styleClass+':'+styleJson[styleClass]+'; ';
				break;
			case 'align':
			case 'font':
				var textDecoration = ''; //用于处理textDecorationUnderline 和 textDecorationLineThrough 两个特殊属性
				for(styleName in styleJson[styleClass]){
					if(styleJson[styleClass][styleName]!=''){
						switch(styleName){
							case 'textDecorationUnderline':
							case 'textDecorationLineThrough':
								textDecoration += styleJson[styleClass][styleName]+' ';
								break;
							default:
								var formatStyleName = getStyleName(styleName);
								styleStr += formatStyleName+':'+styleJson[styleClass][styleName]+'; ';
								break;
						}
					}
				}
				if(textDecoration!=''){
					styleStr += "text-decoration"+':'+textDecoration+'; ';
				}
				break;
			case 'border':
				if(styleJson[styleClass]==''){
					//为空则代表人为设置了没有边框
					styleStr += 'border:none; ';
				}else{
					for(styleName in styleJson[styleClass]){
						if(styleJson[styleClass][styleName]!=''){
							var formatStyleName = getStyleName(styleName);
							formatStyleName = 'border-'+formatStyleName;
							styleStr += formatStyleName+':'+styleJson[styleClass][styleName]+'; ';
						}else{
							var formatStyleName = getStyleName(styleName);
							formatStyleName = 'border-'+formatStyleName;
							styleStr += formatStyleName+':none; ';
						}
					}
				}
				break;
			case 'format':
				//这个不处理
				break;
			default:
				if(debugerMode){
					console.error('不能识别的的style数据类型：'+styleClass);
					console.error(styleJson);
				}
				break;
		}
	}
	return styleStr;
}
//统一单元格数据的value和默认值
NetstarUI.resultTable.getTdData = function(tdData,tdID){
	if(typeof(tdData)=='object'){
		//根据类型改变value值
		switch(typeof(tdData.value)){
			case 'undefined':
				tdData.value = {real:'',visible:''};
				break;
			case 'string':
			case 'number':
				tdData.value = {real:tdData.value,visible:tdData.value};
				break;
			case 'object':
				if(debugerMode){
					if(tdData.value==null){
						console.error('单元格数据中的value不能为null，如果为空可以返回""');
						console.error(tdData);
					}else if(typeof(tdData.value.real)=='undefined'||typeof(tdData.value.visible)=='undefined'){
						console.error('单元格数据中的value不合法');
						console.error(tdData);
					}
				}
				break;
			default:
				if(debugerMode){
					console.error('单元格数据中的value不合法');
					console.error(tdData);
				}
				break;
		}
	}else{
		//没有值
		// tdData = {
		// 	type:'none',
		// 	value:{real:'',visible:''},
		// }
		console.error('单元格：'+tdID+'没有定义')
	}
	return tdData;
}
//获取保存数值
NetstarUI.resultTable.getSubmitData = function(){
	var values = [];
	for(tdID in NetstarUI.resultTable.data.tdData){
		var tdData = NetstarUI.resultTable.data.tdData[tdID];
		
		if(tdData.state == 'edit'){
			var tdValue = {};
			tdValue.id = tdData.nsId;  
			tdValue.value = tdData.value.real;
			tdValue.data = tdData.value.data;
			tdValue.visible = tdData.value.visible;
			tdValue.uitype = tdData.originalType;
			if(tdValue.uitype == 'multiinput'){
				tdValue.main = tdData.value.main;
			}
			values.push(tdValue);		
		}
	}
	if(values.length==0){
		return false;
	}
	return values;
}
//保存结果处理
NetstarUI.resultTable.savedHandler = function(config,submitData){
	//整理要发送出去的数据
	var formatSubmitData = [];
	
	for(var sdI = 0; sdI<submitData.length; sdI++){
		cdata = submitData[sdI];
		switch(cdata.uitype){
			case 'multiinput':
				//multiinput要拆分数据后发送
				var mainID = cdata.main;
				for(var subValueKey in cdata.value){
					var tdValue = {};
					tdValue.id = cdata.data[subValueKey].id;
					tdValue.value = cdata.value[subValueKey];
					tdValue.data = cdata.data[subValueKey];
					if(subValueKey == cdata.main){
						tdValue.visible = cdata.visible;
						tdValue.uitype = 'multiinput';
					}else{
						tdValue.uitype = 'multiinput-sub-'+cdata.data[mainID].id;
					}
					formatSubmitData.push(tdValue);
				}
				break;
			case 'checkboxajax':
				//multiinput要拆分数据后发送
				var tdValue = $.extend(true,{},cdata);
				tdValue.value = tdValue.value.toString();
				formatSubmitData.push(tdValue);
				break;
			default:
				formatSubmitData.push(cdata);
				break;
		}
	}
	config.saveAjax.data.jsonRows = JSON.stringify(formatSubmitData);
	//将表格状态修改
	for(submitI = 0; submitI<submitData.length; submitI++){
		var tdID = submitData[submitI].id;
		NetstarUI.resultTable.data.tdDataBynsId[tdID].state = 'process';
		NetstarUI.resultTable.refreshTd(NetstarUI.resultTable.data.tdDataBynsId[tdID].id);
	}
	//ajax发送错误
	function ajaxerror(){
		for(submitI = 0; submitI<submitData.length; submitI++){
			var tdID = submitData[submitI].id;
			NetstarUI.resultTable.data.tdDataBynsId[tdID].state = 'edit';
			NetstarUI.resultTable.refreshTd(tdID);
		}
	}
	//在线和离线两种模式 
	if(NetstarUI.resultTable.offlineState == false){
		$.ajax({
			url: 		config.saveAjax.url,
			data: 		config.saveAjax.data,
			type: 		config.saveAjax.type,
			dataType: 	'json',
			success:function(data){
				if(data.success){
					if(debugerMode){
						if(typeof(data)=='undefined'){
							console.error(config.saveAjax+'的返回值未定义');
							return false;
						}
					}
					//如果数据合法则刷新对应数据
					var resultData = data[config.saveAjax.dataSrc];
					if($.isArray(resultData)){
						if(resultData.length>0){
							NetstarUI.resultTable.serverDataHandler(resultData);
							if(typeof(config.callback.saveFunc)=='function'){
								config.callback.saveFunc(resultData);
							}
						}
					}
				}else{
					nsalert(data.result);
				}
			},
			error:function(error){
				nsVals.defaultAjaxError(error);
			}
		})
	}else{
		console.log('offlineState');
		NetstarUI.resultTable.addStorage(function(data){
			//将表格状态修改
			for(submitI = 0; submitI<submitData.length; submitI++){
				var tdID = submitData[submitI].id;
				NetstarUI.resultTable.data.tdDataBynsId[tdID].state = 'complete';
				NetstarUI.resultTable.refreshTd(NetstarUI.resultTable.data.tdDataBynsId[tdID].id);
			}
		}, function(error){
			console.log(error);
		}, {
			url:config.saveAjax.url,
			body:JSON.stringify(config.saveAjax.data)
		});
	}
	
};
//发送结果处理 修改数据，刷新单元格
NetstarUI.resultTable.serverDataHandler = function(resultDatas){
	for(var valueI = 0; valueI<resultDatas.length; valueI++){
		var resultData = resultDatas[valueI];
		var tdID = resultData.id;
		var tdData = NetstarUI.resultTable.data.tdDataBynsId[tdID];
		if(typeof(tdData)=='object'){
			//如果存在该单元格，则刷新
			tdData.state = 'complete';
			if(tdData.type!='none'){
				//tdData.history ++;
			}
			if(!resultData.uitype){
				resultData.uitype = '_';
			}
			var resultDataType = resultData.uitype;
			var multiinputMainId = -1;
			if(resultDataType.indexOf('multiinput-sub')>=0){
				multiinputMainId = parseInt(resultDataType.substring(15, resultDataType.length));
				resultDataType = 'multiinput-sub';
			}
			if(resultDataType=='_'){
				resultDataType = tdData.originalType;
			}
			if(resultDataType == 'multiselect'){
				tdData.value.real = resultData.value;
				if(resultData.value !== ''){
					var realStr = resultData.value.split(',');
					var valueStr = '';
					for(var subI=0; subI<tdData.subdata.length; subI++){
						for(var idI=0; idI<realStr.length; idI++){
							if(tdData.subdata[subI].id == realStr[idI]){
								valueStr += tdData.subdata[subI].name + ',';
							}
						}
					}
					valueStr = valueStr.substring(0,valueStr.lastIndexOf(','));
					tdData.value.visible = valueStr;
				}
			}
			if(tdData.value.real != resultData.value){
				switch(resultDataType){
					case 'string':
					case 'number':
					case 'select':
					case 'none':
						tdData.value.real = resultData.value;
						tdData.value.visible = tdData.value.real;
						break;
					case 'date':
						tdData.value.real = resultData.value;
						tdData.value.visible = moment(tdData.value.real).format(tdData.subdata.format.toUpperCase());
						break;
					case 'multiinput':
					case 'multiinput-sub':
						//暂不处理
						break;
					default:
						tdData.value.real = resultData.value;
						break;
				}
			}
			if(typeof(resultData.history)=='number'){
				tdData.history = resultData.history;
			}
			NetstarUI.resultTable.refreshTd(tdData.id);
			
			//修改字体颜色
			if(typeof(resultDatas[valueI].color)=='string'){
				tdData.$td.css("color",resultDatas[valueI].color);
			}
			//修改背景色
			if(typeof(resultDatas[valueI].background)=='string'){
				tdData.$td.css("background",resultDatas[valueI].background);
			}
		}else{
			//不存在该单元格，暂不处理
		}
		
	}
}
//自动保存，如果有变化则保存
NetstarUI.resultTable.autoSaveTimerInit = function(config,data){
	NetstarUI.resultTable.saveTimer =  window.setTimeout(function(ev){
		//如果有变化则保存
		var editValues = NetstarUI.resultTable.getSubmitData();
		var config = NetstarUI.resultTable.config;
		if(editValues!=false){
			NetstarUI.resultTable.savedHandler(config,editValues);
		}
		//如果表格还存在则继续启动自动保存
		if($('#'+config.containerID).length==1){
			window.clearTimeout(NetstarUI.resultTable.saveTimer);
			NetstarUI.resultTable.autoSaveTimerInit(config,data);
		}else{
			window.clearTimeout(NetstarUI.resultTable.saveTimer);
		}
	},config.saveTimer*1000)
}
//历史记录
NetstarUI.resultTable.historyClickHandler = function(ev){
	var tdID = $(this).closest('td').attr('id');
	var tdData = NetstarUI.resultTable.data.tdData[tdID];
	var config = NetstarUI.resultTable.config;
	var $td = $('#'+tdData.id)
	var position = $td.position();
	var positionTop = position.top+$td.outerHeight();
	var positionLeft = position.left+$td.outerWidth()-400+1;
	positionTop = positionTop + NetstarUI.resultTable.config.$container.scrollTop();
	positionLeft = positionLeft + NetstarUI.resultTable.config.$container.scrollLeft();
	//超出屏幕隐藏
	if(positionLeft<20){
		positionLeft = 20;
	}
	var rowNumber = parseInt($(this).html())+1;
	var minHeight = 30*rowNumber;
	config.$historyPanel.css({'display':'block', 'top':positionTop, 'left':positionLeft, 'min-height':minHeight});
	config.$historyPanel.html(nsVals.loadingHtml);
	function hideHistoryPanel(ev){
		$(document).off('click',hideHistoryPanel);
		config.$historyPanel.css({'display':'none'});
	}
	$(document).off('click',hideHistoryPanel);
	$(document).on('click',hideHistoryPanel);

	var historyData;
	switch(tdData.type){
		case 'multiinput':
			historyData = tdData.value.data[tdData.value.main];
			break;
		default:
			historyData = tdData.value.data;
			break;
	}
	//添加history数据
	config.historyAjax.data.jsonRows = JSON.stringify(historyData);
	$.ajax({
		url: 		config.historyAjax.url,
		data: 		config.historyAjax.data,
		type: 		config.historyAjax.type,
		dataType: 	'json',
		success:function(data){
			if(data.success){
				if(debugerMode){
					if(typeof(data)=='undefined'){
						console.error(config.historyAjax+'的返回值未定义');
						return false;
					}
				}
				//如果数据合法则刷新对应数据
				var resultData = data[config.historyAjax.dataSrc];
				if($.isArray(resultData)){
					if(resultData.length>0){
						NetstarUI.resultTable.refreshHistoryPlane(resultData,tdData);
					}
				}
			}else{
				nsalert(data.result);
			}
		},
		error:function(error){
			nsVals.defaultAjaxError(error);
		}
	})
	ev.stopPropagation();
}
//批注回调
NetstarUI.resultTable.notesClickHandler = function(ev){
	var tdID = $(this).closest('td').attr('id');
	var config = NetstarUI.resultTable.config;
	//返回值
	var returnValue = NetstarUI.resultTable.getOutputData(tdID);
	if(typeof(config.callback.notesFunc)=='function'){
		config.callback.notesFunc(returnValue);
	}
	ev.stopPropagation();
}
//批注状态修改
NetstarUI.resultTable.notesChangeState = function(nsId, type){
	//批注状态修改 
	//nsId是必填 数字number类型  type是状态标识 0是没有 1是未读 2是已读
	if(debugerMode){
		if(typeof(nsId)!='number'){
			console.error('nsId是必填 number类型，当前值：'+nsId+'');
		}
	}
	var tdData = NetstarUI.resultTable.data.tdDataBynsId[nsId];
	if(debugerMode){
		if(typeof(tdData)=='undefined'){
			console.error('无法找到单元格对象，请核实nsId：'+nsId);
		}
	}
	var $td = tdData.$td;
	//保存原始值用于判断是否需要添加事件
	var originalNoteType = tdData.notes;
	//改变数据值
	tdData.notes = type;
	var isHaveNotes = $td.children('.notes').length >= 1 ? true:false; 
	switch(type){
		case 0:
			if(isHaveNotes){
				$td.children('.notes').remove();
			}
			break;
		case 1:
			if(isHaveNotes){
				$td.children('.notes').attr('class', 'notes wait');
			}else{
				$td.append('<a href="javascript:void(0);" class="notes wait" ns-notes-type="1"></a>');
			}
			break;
		case 2:
			if(isHaveNotes){
				$td.children('.notes').attr('class', 'notes read');
			}else{
				$td.append('<a href="javascript:void(0);" class="notes read" ns-notes-type="1"></a>');
			}
			break;
	}
	//如果是添加的notes标签，则添加事件
	if(originalNoteType == 0){
		$td.children('a.notes').on('click', NetstarUI.resultTable.notesClickHandler)
	}
}
//获取当前选中的数据，批注新建调用方法
NetstarUI.resultTable.getCurrentData = function(){
	if($("#resultTableContainer-inputcomponent").length == 0){
		return false;
	}else{
		var isEditState = $("#resultTableContainer-inputcomponent").css('display')=='block';
		if(isEditState == false ){
			return false;
		}
	}
	var outputValue = NetstarUI.resultTable.getOutputData(NetstarUI.resultTable.currentTdID);
	if(outputValue.type == 'none'){
		return false;
	}
	return outputValue;
}
//获取基础回调数据
NetstarUI.resultTable.getOutputData = function(tdID){
	var tdData = NetstarUI.resultTable.data.tdData[tdID];
	var config = NetstarUI.resultTable.config;
	var $td = tdData.$td;
	var position = $td.position();
	position.height = $td.outerHeight();
	position.width = $td.outerWidth();

	//返回值
	var outputValue = {
		value:  		tdData.value.real,
		data: 			tdData.value.data,
		visible:  		tdData.value.visible,
		id: 			tdData.nsId,
		type: 			tdData.originalType, 
		position: 		position, 				//top left width height
		tableID: 		tdData.tableID, 		//表格ID
		notesType: 		tdData.notes,  			//签收状态值 0 没有 1 未读 2 已读
		history: 		tdData.history, 		//历史记录
		tablePosition: { 						//行列
			column: 	tdData.index.column,
			row: 		tdData.index.row,
		},
	}
	return outputValue;
}
//刷新历史面板
NetstarUI.resultTable.refreshHistoryPlane = function(historyArray,tdData){
 	var html = '';
	for(var historyI = 0; historyI<historyArray.length; historyI++){
		var trData = historyArray[historyI];
		//格式化两个value
		// switch(tdData.type){
		// 	case 'number':
		// 		if(typeof(trData.value)=="number"){
		// 			trData.visibleValue = String(trData.value);
		// 			trData.visibleBeforeValue = String(trData.beforeValue);
		// 		}else{
		// 			trData.visibleValue = '';
		// 			trData.visibleBeforeValue = '';
		// 		}
		// 		break;
		// 	case 'string':
		// 	case 'select':
		// 	case 'textarea':
		// 	case 'none':
		// 		if(typeof(trData.value)=="string"){
		// 			trData.visibleValue = trData.value;
		// 			trData.visibleBeforeValue = trData.beforeValue;
		// 		}else{
		// 			trData.visibleValue = '';
		// 			trData.visibleBeforeValue = '';
		// 		}
		// 		break;
		// 	case 'date':
		// 		if(typeof(trData.value)=="number"){
		// 			trData.visibleValue = moment(trData.value).format(tdData.format.toUpperCase());
		// 			trData.visibleBeforeValue = moment(trData.beforeValue).format(tdData.format.toUpperCase());
		// 		}else{
		// 			trData.visibleValue = '';
		// 			trData.visibleBeforeValue = '';
		// 		}
		// 		break;
		// 	default:
		// 		trData.visibleValue = String(trData.value);
		// 		trData.visibleBeforeValue = String(trData.beforeValue);
		// 		if(debugerMode){
		// 			console.warn('历史记录列表中有未定义的组件类型');
		// 			console.warn(trData);
		// 		}
		// 		break;
		// }
		//格式化日期
		if(typeof(trData.updateDate)=='number'){
			trData.visibleUpdateDate = moment(trData.updateDate).format(nsVals.default.momentDataTime);
		}else{
			trData.visibleUpdateDate = '';
		}
		//人员处理
		if(typeof(trData.updateByName)=='string'){
			trData.visibleUpdateByName = trData.updateByName;
		}else{
			trData.visibleUpdateByName = '';
		}
		var trHtml = '';
		trHtml += '<td>'+ (historyI+1) +'</td>';
		trHtml += '<td>'+ trData.visible +'</td>';
		//trHtml += '<td>'+ trData.visibleBeforeValue +'</td>';
		trHtml += '<td>'+ trData.visibleUpdateByName +'</td>';
		trHtml += '<td>'+ trData.visibleUpdateDate +'</td>';
		trHtml = '<tr>'+trHtml+'</tr>';
		html += trHtml;
	}
	var theadHtml = 
		'<thead><tr>'
			+'<th>&nbsp</th>'
			+'<th>值</th>'
			//+'<th>改前值</th>'
			+'<th>录入人</th>'
			+'<th>录入时间</th>'
		+'</tr></thead>'
	var tbodyHtml = '<tbody>'+html+'</tbody>'
	html = '<table>'+theadHtml+tbodyHtml+'</table>'
	NetstarUI.resultTable.config.$historyPanel.html(html);
}
//获取选中单元的值
NetstarUI.resultTable.getSelectValue = function(isIncludeNone){
	var _isIncludeNone = false;
	if(typeof(isIncludeNone)=='boolean'){
		_isIncludeNone = isIncludeNone;
	}
	var value = {};
	var tdData = this.data.tdData[this.currentTdID];
	if(_isIncludeNone==false){
		if(tdData.type=='none'){
			nsalert('所选单元格是静态数据，不能执行 getSelectValue 方法','error')
			return false;
		}
	}
	value.real = tdData.value.real;
	value.visible = tdData.value.visible;
	value.type = tdData.type;
	return value;
}
//复制
NetstarUI.resultTable.copy = function(isIncludeNone){
	//是否支持对静态单元格的赋值
	var _isIncludeNone = true;
	if(typeof(isIncludeNone)=='boolean'){
		_isIncludeNone = isIncludeNone;
	}
	var copyValue = NetstarUI.resultTable.getSelectValue(_isIncludeNone);
	nsalert('复制成功 '+copyValue.visible, 'success');
	NetstarUI.resultTable.copyValue = copyValue;
}
//黏贴
NetstarUI.resultTable.paste = function(){
	//是否有要复制的
	if(typeof(NetstarUI.resultTable.copyValue)=='undefined'){
		nsalert('请先选择要复制的单元格','error');
		return;
	}
	//是否有选中的单元格
	if(NetstarUI.resultTable.config.$container.find('td.inselectzone').length==0){
		nsalert('请先选择要粘贴的单元格','error');
		return;
	}
	//批量赋值操作
	var filterSelectArray = [];
	for(var selectI = 0; selectI<NetstarUI.resultTable.selected.length; selectI++){
		//如果不是手工输入的值 只对同类型的进行粘贴操作
		if(NetstarUI.resultTable.copyValue.type!='notd'){
			//类型相同
			if(NetstarUI.resultTable.data.tdData[NetstarUI.resultTable.selected[selectI]].type == NetstarUI.resultTable.copyValue.type){
				//不是只读
				if(NetstarUI.resultTable.data.tdData[NetstarUI.resultTable.selected[selectI]].readonly){
					//如果是只读，就过滤掉
				}else{
					filterSelectArray.push(NetstarUI.resultTable.selected[selectI]);
				}
			}
		}else if(NetstarUI.resultTable.copyValue.type=='notd'){
		//如果是手工输入的,就不匹配类型了
			filterSelectArray.push(NetstarUI.resultTable.selected[selectI]);
		}
	}
	if(filterSelectArray.length==0){
		nsalert('选中的单元格无效，请重新选择','error');
		return;
	}
	var isComplete = NetstarUI.resultTable.setValues(NetstarUI.resultTable.copyValue, filterSelectArray);
	if(isComplete){
		nsalert('粘贴完成','success');
	}
}
//对单元格批量赋值，可以用于复制黏贴
NetstarUI.resultTable.setValues = function(value, idArr, isOnlyData){
	//value是源值，{real:'1',visible:'1'},  value.data是可选参数
	//value可以是字符串或者是数字
	//idArr可以是ID数组，也可以是单独的一个ID
	//isOnlyData 是可选参数指定是否只更新data, 不更新
	//return 是否成功替换
	if(debugerMode){
		var validParameterArr = [
			[value,'object string number boolean',true],
			[idArr,'array string',true]
		]
		nsDebuger.validParameter(validParameterArr);
	}
	//是否只修改data
	var isOnlyEditData = false;
	if(typeof(isOnlyData)=='boolean'){
		isOnlyEditData = isOnlyData;
	}
	//数据源对象
	var sourceValue = {};
	if(typeof(value)=='object'){
		if(debugerMode){
			if(typeof(value.real)=='undefined' || typeof(value.visible)=='undefined'){
				console.error('setValues的参数value，不包含real和visible对象');
			}
		}
		if(isOnlyEditData==false){
			sourceValue.real = value.real;
			sourceValue.visible = value.visible;
		}
		if(typeof(value.data)=='object'){
			sourceValue.data = value.data;
		}
	};
	//批量赋值
	var targetIDArr = [];
	if(typeof(idArr)=='string'){
		targetIDArr.push(idArr);
	}else{
		targetIDArr = idArr;
	}

	if(targetIDArr.length==0){
		nsalert('请先选择要赋值的单元格对象','error');
		return false;
	}else{
		for(var i = 0; i<targetIDArr.length; i++){
			var tdData = this.data.tdData[targetIDArr[i]];
			if(isOnlyEditData==false){
				//只读的不处理
				function setValue(_sourceValue){
					NetstarUI.resultTable.saveTdData(tdData.id,_sourceValue);
					NetstarUI.resultTable.refreshTd(targetIDArr[i]);
					if(typeof(sourceValue.data)=='object'){
						tdData.value.data = sourceValue.data;
					}
				}
				//var filterSourceValue = $.extend(true,{},sourceValue);
				switch(tdData.type){
					case 'multiinput':
						//多输入框的根据子数据集是否匹配判定如何添加
						var multiinputSourceValue = {
							real:{},
							visible:tdData.value.visible
						};
						for(valueKey in tdData.value.real){
							var isIncludeSourceValue = false;  //源数据中是否包含子数据
							for(sourceValueKey in sourceValue.real){
								if(valueKey==sourceValueKey){
									isIncludeSourceValue = true;
								}
							}
							if(isIncludeSourceValue){
								multiinputSourceValue.real[valueKey] = sourceValue.real[valueKey];
								//debugger
								multiinputSourceValue.visible = NetstarUI.resultTable.getMultiinputVisible(valueKey, sourceValue.real[valueKey], multiinputSourceValue.visible);
							}
						}
						setValue(multiinputSourceValue);
						break;
					default:
						setValue(sourceValue)
						break;
				}
				
			}
			
		}
		return true;
	}
	return false;
}
//使用原始尺寸显示
NetstarUI.resultTable.previewMode = function(){
	var config = $.extend(true, {}, NetstarUI.resultTable.originalConfig);
	config.isUseSettingWidthSize = true;
	config.isUseSettingHeightSize = true;
	if(config.unUseSettingStyle){
		delete config.unUseSettingStyle;
	}
	NetstarUI.resultTable.init(config);
}
//使用页面优化方式显示
NetstarUI.resultTable.inputMode = function(){
	var config = $.extend(true, {}, NetstarUI.resultTable.originalConfig);
	config.isUseSettingWidthSize = false;
	config.isUseSettingHeightSize = false;
	config.unUseSettingStyle = ['border','background','align','font'];
	NetstarUI.resultTable.init(config);
}
//批量编辑 停止开发的功能
NetstarUI.resultTable.multiedit = function(){
	var $selectedTDs = NetstarUI.resultTable.config.$container.find('td.inselectzone');
	var $selectedvalidTDs = $selectedTDs.not('.none')
	//是否有选中的
	if($selectedTDs.length==0){
		nsalert('请先选择单元格','error');
		return;
	}
	//选中的不能都是none
	if($selectedvalidTDs.length==0){
		nsalert('您选中的是不可编辑的单元格','error');
		return;
	}
	//对类型进行过滤分组
	var typeClassArr = {}
	for(var selectI = 0; selectI<NetstarUI.resultTable.selected.length; selectI++){
		var selectTDID = NetstarUI.resultTable.selected[selectI];
		var tdData = NetstarUI.resultTable.data.tdData[selectTDID];
		switch(tdData.type){
			case 'none':
				break;
			default:
				if(typeof(typeClassArr[tdData.type])=='undefined'){
					typeClassArr[tdData.type] = [];
				}
				typeClassArr[tdData.type].push(selectTDID);
				break;
		}
	}
	function multiedit(){
		
		var values = nsdialog.getFormJson();
	}
	var config = {
		id: 	"plane-multiedit",
		title: 	"批量编辑",
		size: 	"s",
		form:[
			{
				id: 		'value',
				label: 		'内容',
				type: 		'text',
				rules: 		'required',
				placeholder:''
			}
		],
		btns:[
			{
				text: 		'确认修改',
				handler: 	multiedit
			}
		]
	}
	nsdialog.initShow(config);
}
//设置样品id，设置实验顺序
NetstarUI.resultTable.setSampleOrder = function(sampleId){
	//  sampleId应当是数字或者能够转化为数字的字符串
	var sampleID;
	if(typeof(sampleId)!='number'){
		sampleID = parseInt(sampleId);
	}else{
		sampleID = sampleId;
	}
	var simpleLength = 0;
	var simpleSort = [];
	var simpleSetSort = [];
	$.each(NetstarUI.resultTable.data.sampleIdSort, function(key,value){
		simpleLength++;
		simpleSort.push(key);
		if(value.type=='set'){
			simpleSetSort.push(key);
		}
	})
	//正确的返回对象
	var errorReturnData = {
		success:false,
		sampleId:sampleId,
	}
	//错误的返回对象
	var successReturnData = {
		success:true,
		sampleId:sampleId,
		msg:'扫码成功'
	}
	if(debugerMode){
		if(typeof(sampleID)!='number'){
			console.error('sampleId参数不合法:'+sampleId);
			return returnError();
		}else if(sampleID==NaN){
			console.error('sampleId参数不合法:'+sampleId);
			return returnError();
		}
	}
	var setSimpleIdOrderData = NetstarUI.resultTable.setSimpleIdOrderData;
	if(typeof(NetstarUI.resultTable.data.sampleIdSort[sampleID])=='object'){
		var sortConifg = NetstarUI.resultTable.data.sampleIdSort[sampleID];
		//判断是添加或者修改
		if(setSimpleIdOrderData.order.indexOf(sampleID)>=0){
			if(setSimpleIdOrderData.order.indexOf(sampleID) == setSimpleIdOrderData.order.length - 1 ){
				errorReturnData.msg = '重复扫码';
				return returnError();
			}else{
				var currentOrder = setSimpleIdOrderData.order.indexOf(sampleID);
				setSimpleIdOrderData.order.splice(currentOrder,1);
				setSimpleIdOrderData.order.push(sampleID);
				successReturnData.msg = '修改排序';
				return returnSuccess();
			}
		}else{
			setSimpleIdOrderData.order.push(sampleID);
			errorReturnData.msg = '扫码成功';
			return returnSuccess();
		}
		
		return true;
	}else{
		if(debugerMode){
			console.error('无法在数据中找到sampleId:'+sampleId);
			console.error('可用的sampleId：'+simpleSort.toString());
			return returnError();
		}
	}

	//错误的返回
	function returnError(){
		nsalert(errorReturnData.msg, 'error');
		NetstarUI.soundplayer.stop();
		return errorReturnData;
	}
	//成功的返回
	function returnSuccess(){
		NetstarUI.soundplayer.insert();
		for(var orderI = 0; orderI<setSimpleIdOrderData.order.length; orderI++){
			var orderObj = NetstarUI.resultTable.data.sampleIdSort[setSimpleIdOrderData.order[orderI]];
			orderObj.sort = orderI;
			orderObj.type = 'set';
			var tdData = NetstarUI.resultTable.data.tdData[orderObj.first];
			tdData.setSampleOrder = orderI+1;
			NetstarUI.resultTable.refreshTd(tdData.id)
		}
		if(setSimpleIdOrderData.order.length == setSimpleIdOrderData.length){
			successReturnData.msg += ' 全部样品排序完成'
		}
		nsalert(successReturnData.msg, 'success');
		return successReturnData;
	}
}
//设置样品id顺序的外接接口
NetstarUI.resultTable.setSampleOrderInterface = function(sampleIDObj){
	if(debugerMode){
		if(typeof(sampleIDObj)!='object'){
			console.error('样品排序接口传入参数错误，数据类型应当是object类型，例如{sampleId:123}，当前类型是：'+typeof(sampleIDObj));
			return false;
		}else{
			if(typeof(sampleIDObj.sampleId)!='number'){
				console.error('样品排序接口传入参数错误，数据类型中应当包含sampleId，例如{sampleId:123}，当前的sampleId是：'+sampleIDObj.sampleId);
				return false;
			}
		}
	}
	return NetstarUI.resultTable.setSampleOrder(sampleIDObj.sampleId);
}
//批量输入样品数据
NetstarUI.resultTable.setSampleData = function(data){
	
	//正确的返回对象
	var errorReturnData = {
		success:false,
	}
	//错误的返回对象
	var successReturnData = {
		success:true,
		msg:'样品数据导入成功'
	}
	//错误的返回
	function returnError(){
		nsalert(errorReturnData.msg, 'error');
		NetstarUI.soundplayer.stop();
		return errorReturnData;
	}
	//成功的返回
	function returnSuccess(){
		NetstarUI.soundplayer.insert();
		nsalert(successReturnData.msg, 'success');
		return successReturnData;
	}
	//获得排序
	function getSortArray(){
		var setSortArray = [];
		var defaultSortArray = [];
		for(key in NetstarUI.resultTable.data.sampleIdSort){
			var csdata = NetstarUI.resultTable.data.sampleIdSort[key];
			if(csdata.type=='default'){
				defaultSortArray.push(csdata);
			}else if(csdata.type=='set'){
				setSortArray.push(csdata);
			}
		}
		defaultSortArray.sort(function(a,b){
			return a.sort - b.sort;
		})
		setSortArray.sort(function(a,b){
			return a.sort - b.sort;
		})
		return setSortArray.concat(defaultSortArray);
	}
	//根据名称插入数据
	function insertDataByName(insertData, sampleData, dateI){
		var returnBln = true;
		for(name in insertData){
			if(typeof(sampleData[name])=='undefined'){
				errorReturnData.msg = '无法找到对应的样品数据 itemname：'+name;
				//return false;
			} else {
				var tdData = undefined;
				for(var tdI = 0; tdI<sampleData[name].length; tdI++){
					if(sampleData[name][tdI].value.real!=''){						
					} else {
						//找到没有数据的就退出
						tdData = sampleData[name][tdI];
						break;
					}
				}
				
				if(typeof(tdData)=='undefined'){
					errorReturnData.msg = '无法找到对应的样品数据：'+name;
					//return false;
				} else {
					var value = {
						real:insertData[name],
						visible:'temp'
					}
					NetstarUI.resultTable.saveTdData(tdData.id, value);
					tdData.value.visible = NetstarUI.resultTable.getVisibleFromReal(tdData);
					NetstarUI.resultTable.refreshTd(tdData.id);	
				}
			}
		}
		return true;
	}
	//流程处理
	if($.isArray(data)==false){
		errorReturnData.msg = '数据导入格式错误，请核实数据';
		return returnError();
	}
	var isAllSuccess = true;  //是否全部成功
	var autoOrder = 0;
	for(var dataI = 0; dataI<data.length; dataI++){
		var sampleID = data[dataI].sampleId;
		//如果没有sampleId则查找是否有排序号
		if(typeof(sampleID)=='undefined'){
			var orderID = data[dataI].testNo;
			if(typeof(orderID)!='undefined'){
				if(typeof(orderID)!='string'){
					orderID = parseInt(orderID);
				}
				orderID  = orderID - 1;
				var sortArray = getSortArray();
				sampleID = sortArray[orderID].sampleId;
			}else{
				var isSingleData = false;
				if(data.length==1){
					if(data[0].itemValues.length==1){
						isSingleData = true;
					}
				}
				//如果只有一个值，则看看当前的编辑对象是否符合传入参数的nodeName，如果符合，则操作当前编辑对象
				if(isSingleData){
					var editTdData = NetstarUI.resultTable.data.tdData[NetstarUI.resultTable.currentTdID];
					var dataNodeName = ''
					$.each(data[0].itemValues[0], function(key,value){
						dataNodeName = key;
					});
					var tdNodeName = editTdData.value.data.nodeName;					
					if (dataNodeName.indexOf("*") == 0){
						//当传入的值为*开头时，直接付给现在编辑的框，如果当前没有编辑框则提示
						var currentInputPanel = NetstarUI.resultTable.config.$editPanel.children('.component-container').children('.show')
						var currentInputType = currentInputPanel.attr('ns-class');
						var tdData = NetstarUI.resultTable.data.tdData[NetstarUI.resultTable.currentTdID];
						var insValue = data[0].itemValues[0][dataNodeName];
						switch(currentInputType){
							case 'none':
								errorReturnData.msg = '请选择一个可编辑的单元格';
								return returnError();
								break;
							case 'string':
								currentInputPanel.children('input').val(insValue);
								break;
							case 'number':
								currentInputPanel.children('input').val(insValue);
								break;		
							case 'textarea':
								currentInputPanel.children('textarea').val(insValue);
								break;		
							default:
								errorReturnData.msg = '请选择一个可编辑的单元格';
								return returnError();								
								break;
						}
						return returnSuccess();
						
					} else if(dataNodeName == tdNodeName){
						//如果当前编辑符合传入数据要求则插入
						var value = {
							real:data[0].itemValues[0][dataNodeName],
							visible:'temp'
						}
						NetstarUI.resultTable.saveTdData(editTdData.id, value);
						editTdData.value.visible = NetstarUI.resultTable.getVisibleFromReal(editTdData);
						NetstarUI.resultTable.refreshTd(editTdData.id);

						//下一个同类型的
						var nodeNameData = NetstarUI.resultTable.data.tdDateByNodeName[dataNodeName];
						var currentNodeIndex = -1;
						for(var nodeI = 0; nodeI<nodeNameData.length; nodeI++){
							if(nodeNameData[nodeI].id == editTdData.id){
								currentNodeIndex = nodeI;
							}
						}
						if(currentNodeIndex<nodeNameData.length-1){
							var nextSampleNameTdId = nodeNameData[currentNodeIndex+1].id;
						}else{
							var nextSampleNameTdId = nodeNameData[0].id;
						}
						var inputResizeData = NetstarUI.resultTable.getResizeDataByDom($('#'+nextSampleNameTdId));
						NetstarUI.resultTable.showEditPanel(inputResizeData);
						// var nextSampleNameTdId = ''
						
						// if(nextSampleNameTdId){
						// 	var inputResizeData = NetstarUI.resultTable.getResizeDataByDom($('#'+nextSampleNameTdId));
						// 	NetstarUI.resultTable.showEditPanel(inputResizeData);
						// }
						return returnSuccess();
					}
				}

				//没有id 也没有排序号，就去找选中的或者空的
				var sortArray = [];
				
				if($.isArray(NetstarUI.resultTable.selected)){
					//有选择对象
					for(var selectI = 0; selectI<NetstarUI.resultTable.selected.length; selectI++){
						var selectID = NetstarUI.resultTable.selected[selectI];
						var selectData = NetstarUI.resultTable.data.tdData[selectID];
						if(selectData.value.data.sampleId){
							sortArray.push({
								sampleID:selectData.value.data.sampleId,
								sort:selectData.sort
							})
						}
					}
					
					sortArray.sort(function(a,b){
						return a.sort-b.sort;
					})
					sampleID = sortArray[autoOrder].sampleID;
				}else{
					//没有选择对象
					$.each(NetstarUI.resultTable.data.sampleIdSort, function(key,value){
						var firstTdID = value.first;
						sortArray.push({
							sampleID:key,
							row:NetstarUI.resultTable.data.tdData[firstTdID].index.row
						})
					})
					sortArray.sort(function(a,b){
						return a.row-b.row;
					})
					var itemValue = data[dataI].itemValues[0];
					var sortFilterArray = [];
					autoOrder = 0;
					for(var sortI = 0; sortI<sortArray.length; sortI++){
						var sampleTdDatas = NetstarUI.resultTable.data.tdDataBySimpleId[sortArray[sortI].sampleID];
						var isEmpty = true;
						var isSearchOk = false;
						$.each(itemValue, function(key,value){
							if(typeof(sampleTdDatas[key])=='undefined'){
								isEmpty = false;
							} else {
								for(var tdI = 0; tdI<sampleTdDatas[key].length; tdI++){
									if(sampleTdDatas[key][tdI].value.real!=''){
										isEmpty = false;
									} else {
										isSearchOk = true;
									}
								}
							}
						})
						//if(isEmpty){
						//	sortFilterArray.push(sortArray[sortI]);
						//}
						if (isSearchOk) {
							//只要找到一个合适的就算
							sortFilterArray.push(sortArray[sortI]);
						}
					}
					if(typeof(sortFilterArray[autoOrder])!='object'){
						//过滤后查不到信息了
						errorReturnData.msg = '无法找到可用样品行';
						return returnError();
					}
					sampleID = sortFilterArray[autoOrder].sampleID;
					autoOrder++;
				}
				
			}
		}
		var sampleData = NetstarUI.resultTable.data.tdDataBySimpleId[sampleID];
		var insertData = data[dataI].itemValues;
		if(typeof(sampleData)=='undefined'){
			errorReturnData.msg = '无法找到对应的样品数据：'+sampleID;
			return returnError();
		}else{
			//数组平行样
			for(var pxyI = 0; pxyI<insertData.length; pxyI++){
				var isSuccess = insertDataByName(insertData[pxyI], sampleData, pxyI);
				if(isSuccess == false){
					isAllSuccess = false;
				}
			}
		}
	}
	if(isAllSuccess){
		return returnSuccess();
	}else{
		return returnError();
	}
	
}
NetstarUI.resultTable.setSampleDataInterface = function(data){
	if(debugerMode){
		if($.isArray(data)==false){
			console.error('样品数据错误，必须是数组格式');
			console.error(data);
		}
	}
	return NetstarUI.resultTable.setSampleData(data);
}
//全屏模式
NetstarUI.resultTable.fullScreenMode = function(){
  var config = NetstarUI.resultTable.config;
  var $container = config.$container;
  if($container.hasClass('fullscreen')){
    
  }else{
    //添加全屏样式
    $container.addClass('fullscreen');
    
    //$('body').css('overflow','hidden');
    
    var offset = NetstarUI.resultTable.config.$container.offset();
    $container.css({
      'top': '-'+offset.top+'px',
      'left': '-'+offset.left+'px',
      'height': $(window).height() + 900,
      'width': $(window).width()-20//超出容器高度，右侧会有滚动条的宽度，所以-20不会出现横向滚动条
    });

    NetstarUI.resultTable.fullScreenState = true;
  }  
  config.$editPanel.css('display','none');
}
NetstarUI.resultTable.exitFullScreenMode = function(){
  var config = NetstarUI.resultTable.config;
  var $container = config.$container;
  if($container.hasClass('fullscreen')){
    //移除全屏样式
    $container.removeClass('fullscreen');
    
    $container.css({
      'top': '',
      'left': '',
      'height': '',
      'width': ''
    });

    NetstarUI.resultTable.fullScreenState = false;
  }
  config.$editPanel.css('display','none');
}
NetstarUI.resultTable.offlineMode = function(){

	var config = NetstarUI.resultTable.config;
	//如果已经打开缓存列表或在离线编辑状态下，按钮不起作用
	if(config.$container.hasClass('cacheListMode') || NetstarUI.resultTable.offlineState){
		return;
	}
	//console.log(config);
	var cacheConfig = config.cache;
	var serverCacheData = [];  //服务器端数据
	var readyForCacheData = []; //准备缓存的数据
	NetstarUI.resultTable.cacheAjaxData = {};
	NetstarUI.resultTable.offlineData = {
		server:serverCacheData,
		ready:readyForCacheData,
		local:[]
	}
	//初始化缓存功能容器
	NetstarUI.resultTable.fullScreenMode();
	initCacheListContainer();
	//获取服务端资源数据
	$.ajax({
		url: 		cacheConfig.cachelistAjax.url,
		data: 		cacheConfig.cachelistAjax.data,
		type: 		cacheConfig.cachelistAjax.type,
		dataType: 	'json',
		success:function(data){
			initCacheListTable(data[cacheConfig.cachelistAjax.dataSrc]);
			initCacheSelectedListTable();
		},
		error:function(error){
			nsVals.defaultAjaxError(error);
		}
	});
	
	//离线原始配置存储到pad
	NetstarUI.resultTable.addCache(function() {
		console.log("addCache config OK");
	}, function(error) {
		console.log(error);
	}, {
		url: 'originalConfig',
		body: JSON.stringify(NetstarUI.resultTable.originalConfig)
	});
	
	//离线账户存储到pad
	NetstarUI.resultTable.addCache(function() {
		console.log("addCache account OK");
	}, function(error) {
		console.log(error);
	}, {
		url: 'account',
		body: $('#main-account').val()
	});
	
	//离线账户名称存储到pad
	NetstarUI.resultTable.addCache(function() {
		console.log("addCache userId2 as userName OK");
	}, function(error) {
		console.log(error);
	}, {
		url: 'userName',
		body: $('#main-userId').val()
	});

	//初始化缓存列表容器
	function initCacheListContainer(){
		var html = 
			'<div id="resultTableContainer-cachePanel" class="cache-panel selectcache">'
				
				//缓存资源列表 start --------
				+'<div  id="resultTableContainer-cachePanel-list" class="cache-panel-list selectcache row">'
					//标题
					+'<div  class="cache-panel-title">'
						+'<h1>请选择您需要缓存的数据</h1>'
						+'<span>只有缓存的数据可以脱机使用，请注意不要关闭此页面</span>'
					+'</div>'
					+'<div  class="cache-panel-listbtns padmode" id="resultTableContainer-cachePanel-list-btns">'
					+'</div>'
					//加载等待
					+'<div  class="cache-panel-loading">'
					+'</div>'
					//服务器端资源列表
					+'<div class="cache-panel-list-server col-xs-9 padmode">'
						+'<div class="table-responsive">'
							+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" '
							+'id="resultTableContainer-cachePanel-server-table">'
							+'</table>'
						+'</div>'
					+'</div>'
					//已选择资源及状态
					+'<div class="cache-panel-list-localstorage col-xs-3 padmode">'
						+'<div class="table-responsive">'
							+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" '
							+'id="resultTableContainer-cachePanel-localstorage-table">'
							+'</table>'
						+'</div>'
					+'</div>'
				+'</div>'
				//缓存资源列表 end --------
			+'</div>'
		config.$container.addClass('cacheListMode');
		config.$container.append(html);

		config.$cachePanel = $('#resultTableContainer-cachePanel');
		config.$cachePanelList = $('#resultTableContainer-cachePanel-list');
		config.$cachePanelListBtns = $('#resultTableContainer-cachePanel-list-btns');

		var listBtns = [
			{
				text: 		'全部缓存',
				handler: 	getAllAjaxData,
			},{
				text: 		'缓存选中数据',
				handler: 	getSelectedAjaxData,
			},{
				text: 		'离线模式',
				handler: 	NetstarUI.resultTable.offlineMode,
				isShowText: false
			},{
				text: 		'退出离线',
				handler: 	NetstarUI.resultTable.exitOfflineMode,
				isShowText: false
			},{
				text: 		'开始录入',
				handler: 	inputAllResultTable,
				isShowText: false
			}]
		nsButton.initBtnsByContainerID('resultTableContainer-cachePanel-list-btns', listBtns);
	}
	//服务器端资源列表表格初始化
	function initCacheListTable(initData){

		for(var iDataI = 0; iDataI<initData.length; iDataI++){
			var isReadyCache = true; 
			var isCached = false;
			//是否加入到批量缓存
			initData[iDataI].isReadyCache = isReadyCache;
			//是否已经缓存
			initData[iDataI].isCached = isCached;
			//缓存唯一索引
			initData[iDataI].cacheRowIndex = iDataI;
		}
		serverCacheData = initData;
		NetstarUI.resultTable.offlineData.server = serverCacheData;
		console.log(NetstarUI.resultTable.offlineData.server);
		var dataConfig = {	
			tableID:		"resultTableContainer-cachePanel-server-table",
			isSearch: false,
			dataSource: initData
		}
		
		var columnConfig = [
			{
				field : NetstarUI.resultTable.config.cache.cacheListKeyName,
				title : '任务组名称',
			}, 
			{
				field:'isCached',
				title:'已缓存',
				width:80,
				formatHandler:function(value,row,meta){
					var stateHtml = '';
					if(value){
						stateHtml = '<i class="fa-check"></i>';
					}else{
						stateHtml = '';
					}
					return stateHtml
				}
			}, 
			{
				title:'缓存管理',
				width:150,
				formatHandler:{
					type:'button',
					data:{
						dataReturn:function(columnValue,row,meta,formatData){
							//是否可以删除或者下载
							if(row.isCached == false){
								return [true]
							}else{
								return [false]
							}
						},
						dataReturnType: 'disabled',
						subdata:[
						{
							'下载':selectCacheData,
						}
					]
					},
					
				}
			}
		]
		var uiConfig = {
			searchTitle: 		"搜索",					//搜索框前面的文字，默认为检索
			searchPlaceholder: 	"名称",					//搜索框提示文字，默认为可搜索的列名
			pageLengthMenu: 	8, 	//可选页面数  auto是自动计算  all是全部
			isMulitSelect: true,			 			//是否多选
			onselectHandler:function(data){console.log(data)}
		}
		baseDataTable.init(dataConfig, columnConfig, uiConfig);

		//关闭loading
		config.$cachePanelList.children('.cache-panel-loading').hide();
	}
	//缓存管理 - 下载
	function selectCacheData(row){
		if(row.rowData.isCached){
			//已缓存的数据，不能再缓存
			nsalert('已经缓存','warning');
		}else{
			
			//修改按钮状态
			row.obj.attr('disabled','disabled');
			row.obj.next().removeAttr('disabled');
			//修改行状态
			selectRow(row.rowIndex.selector.rows, true);
			//修改数据
			row.rowData.isCached = true;
			readyForCacheData.push(row.rowData);
			getAjaxData(row.rowData);

			refreshLocalstorageTable();
		}
	}
	//缓存管理 - 取消
	function cancelCacheData(row){
		if(row.rowData.isCached == false){
			//未缓存的数据，不能取消
			nsalert('未缓存','warning');
		}else{
			//修改按钮状态
			//row.obj.attr('disabled','disabled');
			//row.obj.prev().removeAttr('disabled');
			//修改行状态
			var allData = baseDataTable.getAllTableData("resultTableContainer-cachePanel-server-table");
			if($.inArray(row.rowData,allData) > -1){
				var nIndex = $.inArray(row.rowData,allData);
				var trDoms = baseDataTable.table["resultTableContainer-cachePanel-server-table"].rows().nodes();
				var $tr = $(trDoms[nIndex]);
				selectRow($tr, false);
			}
			//修改数据
			row.rowData.isCached = false;
			readyForCacheData.splice($.inArray(row.rowData, readyForCacheData),1);
			//离线删除pad
			NetstarUI.resultTable.removeCache(function(data) {
				console.log("removeCache OK");
			}, function(error) {
				console.log(error);
			}, {
				url: row.rowData.cacheRowIndex
			});
			delete NetstarUI.resultTable.cacheAjaxData[row.rowData.cacheRowIndex];
			refreshLocalstorageTable();
		}
	}
	//选中行的动作
	function selectRow($row, isSelected){
		var table = baseDataTable.table["resultTableContainer-cachePanel-server-table"];
		baseDataTable.setDisabledRow($row, isSelected);
		var data = table.row($row).data();
		data.isCached = isSelected;
		table.row($row).data(data).draw(false);
	}
	//获取ajax数据
	function getAjaxData(rowData){
		//拼装参数
		var names = cacheConfig.cacheDataAjax.dataNames;
		var ajaxData = {}
		for(name in names){
			if(typeof(rowData[names[name]])=='undefined'){
				console.error(name+':'+rowData[names[name]]+' 数据不存在请核实');
				console.error(rowData);
			}
			ajaxData[name] = rowData[names[name]];
		}
		var context = {
			ajaxData: ajaxData,
			rowData:rowData
		}
		//获取表格数据
		$.ajax({
			url: 		cacheConfig.cacheDataAjax.url,
			data: 		ajaxData,
			context: 	context,
			type: 		cacheConfig.cacheDataAjax.type,
			dataType: 	'json',
			success:function(data){
				console.log(data);
				NetstarUI.resultTable.cacheAjaxData[this.rowData.cacheRowIndex] = {
					data:data,
					row:this.rowData,
					ajaxData:this.ajaxData,
				};
				
				//离线模式变量存储到pad
				NetstarUI.resultTable.addCache(function() {
					console.log("addCache offlineMode OK");
				}, function(error) {
					console.log(error);
				}, {
					url: 'offlineMode',
					body: 'true'
				});
				//离线数据存储到pad
				NetstarUI.resultTable.addCache(function() {
					console.log("addCache OK");
				}, function(error) {
					console.log(error);
				}, {
					url: this.rowData.cacheRowIndex,
					body: JSON.stringify(NetstarUI.resultTable.cacheAjaxData[this.rowData.cacheRowIndex])
				});
			},
			error:function(error){
				nsVals.defaultAjaxError(error);
			}
		})
	}
	//获取选中
	function getSelectedAjaxData(res){
		var rows = baseDataTable.getTableSelectData('resultTableContainer-cachePanel-server-table');
		rows = $.unique(rows.sort()); 
		var rowsEnd = [];
		for(i = 0;i<rows.length;i++){   //lyw  不重复下载
			if(!rows[i].isCached){
				rowsEnd.push(rows[i]);
			}
		}
		
		//获取缓存数据
		getRowsAjaxData(rowsEnd);

		refreshLocalstorageTable();
		refreshServerTable();
	}
	//全部获取
	function getAllAjaxData(){
		var rows = baseDataTable.getAllTableData('resultTableContainer-cachePanel-server-table');
		
		var rowsEnd = [];
		for(i = 0;i<rows.length;i++){   //lyw  不重复下载
			if(!rows[i].isCached){
				rowsEnd.push(rows[i]);
			}
		}

		//获取缓存数据
		getRowsAjaxData(rowsEnd);

		refreshLocalstorageTable();
		refreshServerTable();
	}
	//获取缓存数据
	function getRowsAjaxData(rows){
		for (var i = 0; i < rows.length; i++) {
			rows[i].isCached = true;
			readyForCacheData.push(rows[i]); //lyw
			getAjaxData(rows[i]);
		}
	}
	//刷新服务器数据列表
	function refreshServerTable(){

		var table = baseDataTable.table["resultTableContainer-cachePanel-server-table"]
		table.clear();
		table.rows.add(serverCacheData)
		table.rows().invalidate().draw(false);
		
	}
	//刷新本地缓存列表
	function refreshLocalstorageTable(){
		var table = baseDataTable.table["resultTableContainer-cachePanel-localstorage-table"]
		table.clear();
		table.rows.add(readyForCacheData)
		table.rows().invalidate().draw(false);
	}
	//服务器端资源列表表格初始化
	function initCacheSelectedListTable(){
		//console.log(readyForCacheData);
		var dataConfig = {	
			tableID:		"resultTableContainer-cachePanel-localstorage-table",
			isSearch:false,
			dataSource: 	readyForCacheData
		}
		var columnConfig = [
			{
				field : cacheConfig.cacheListKeyName,
				title : '已缓存任务组名称',
			},{
				title:'缓存管理',
				width:150,
				formatHandler:{
					type:'button',
					data:{
						/*dataReturn:function(columnValue,row,meta,formatData){
							//是否可以删除或者下载
							if(row.isCached == false){
								return [true, false, false]
							}else{
								return [false , true, true]
							}
						},*/
						//dataReturnType: 'disabled',
						subdata:[
							{
								'删除':cancelCacheData,
							},
							{
								'编辑':inputResultTable,
							}
						]
					},
				}
			}
		]
		var uiConfig = {
			searchTitle: 		"搜索",					//搜索框前面的文字，默认为检索
			searchPlaceholder: 	"名称",					//搜索框提示文字，默认为可搜索的列名
			pageLengthMenu: 	8, 	//可选页面数  auto是自动计算  all是全部
			isMulitSelect: false,			 			//是否单选
			isSingleSelect: true,
			//onselectHandler:function(data){console.log(data)}
		}
		baseDataTable.init(dataConfig, columnConfig, uiConfig);
	}
	//输入结果录入表单
	function inputResultTable(row){
		config.$container.removeClass('cacheListMode');
		
		config.$cachePanel.hide();
		
		NetstarUI.resultTable.loadPadData(NetstarUI.resultTable.cacheAjaxData[row.rowData.cacheRowIndex]);
		NetstarUI.resultTable.setCacheList(row.rowData.cacheRowIndex);
	}
	//开始录入
	function inputAllResultTable(){
		if(typeof(NetstarUI.resultTable.cacheAjaxData) == 'object'){
			var keys = Object.keys(NetstarUI.resultTable.cacheAjaxData);
			if(keys.length>0){
				config.$container.removeClass('cacheListMode');
				
				config.$cachePanel.hide();
				
				NetstarUI.resultTable.loadPadData(NetstarUI.resultTable.cacheAjaxData[keys[0]]);
				NetstarUI.resultTable.setCacheList(keys[0]);
			}
		}
	}
}
//生成结果录入缓存数据列表
NetstarUI.resultTable.setCacheList = function(currentIndex){
	var lihtml = '';
	var cacheAjaxData = NetstarUI.resultTable.cacheAjaxData;
	for(var data in cacheAjaxData){
		console.log(data);
		console.log(cacheAjaxData[data].row)
		var currentHtml = '';
		if(currentIndex == cacheAjaxData[data].row.cacheRowIndex){
			currentHtml = ' class="current"';
		}
		lihtml += 
			'<li'+currentHtml+' ns-index="'+data+'">'
				+cacheAjaxData[data].row[NetstarUI.resultTable.config.cache.cacheListKeyName]
			+'</li>'
	}
	var html = 
		'<div class="cache-panel-list-cacheselect" id="resultTableContainer-cachePanel-cacheSelect">'
			+'<ul>'
				+lihtml
			+'</ul>'
		+'</div>';
	var config = NetstarUI.resultTable.config;
	config.$controlPanel.after(html);
	config.$cachePanelSelect = $('#resultTableContainer-cachePanel-cacheSelect');
	config.$cachePanelSelect.on('click', function(ev){
		if(config.$cachePanelSelect.hasClass('active')){
			config.$cachePanelSelect.removeClass('active');
		}else{
			config.$cachePanelSelect.addClass('active');
			config.$cachePanelSelect.find('li').not('.current').off('click');
			config.$cachePanelSelect.find('li').not('.current').one('click',function(ev){
				var curArr = config.$cachePanelSelect.find('li').filter('.current');
				if(curArr.length > 0){
					$(curArr[0]).removeClass('current');
				}
				var $cur = $(ev.target);
				$cur.addClass('current');
				var cacheRowIndex = parseInt($cur.attr('ns-index'));
				NetstarUI.resultTable.loadPadData(cacheAjaxData[cacheRowIndex]);
			});
		}
	});
}
//退出离线模式
NetstarUI.resultTable.exitOfflineMode = function(){
	var config = NetstarUI.resultTable.config;
	//如果打开的是缓存列表模式退出
	if(config.$container.hasClass('cacheListMode')){
		removeCacheListMode();
		NetstarUI.resultTable.exitFullScreenMode();
	}else if(NetstarUI.resultTable.offlineState){//离线编辑模式
		if(typeof(cordova)!='undefined'){
			NetstarUI.resultTable.getAllStorage(function(data){
				console.log(data);
				if(data && $.isArray(data.rows) && data.rows.length>0){
					nsconfirm('您将要退出离线模式，存在未上传数据，是否上传并退出？', function(isConfirm) {
						if (isConfirm) {
							if(NetstarUI.resultTable.isJsonp){//跨域									
								//判断是否能连接服务器
								var url = app.serverUrl + '/uiInf/connect';
								var conn = canConnectServer(url);
								if(conn){
									window.top.location.href = app.serverUrl + "/uiInf/resultUpload";
								}else{
									nsalert('未能连接服务器，上传失败');
								}
							}else{
								var url = getRootPath() + '/uiInf/connect';
								var conn = canConnectServer(url);
								if(conn){
									//循环上传
									var successFlag = NetstarUI.resultTable.uploadCacheData(data.rows);
									if(successFlag){
										//循环上传，成功之后刷新页面
										NetstarUI.resultTable.offlineState = false;
										//移除缓存下拉框
										removeCacheSelect();
										removeCacheListMode();
										NetstarUI.resultTable.exitFullScreenMode();
										//重新初始化页面
										NetstarUI.resultTable.init(NetstarUI.resultTable.originalConfig);
									}
								}else{
									nsalert('未能连接服务器，上传失败');
								}
							}
						}
					}, 'warning');
				}else{//不存在需上传的缓存数据
					NetstarUI.resultTable.offlineState = false;
					//移除缓存下拉框
					removeCacheSelect();
					removeCacheListMode();
					NetstarUI.resultTable.exitFullScreenMode();
					//重新初始化页面
					NetstarUI.resultTable.init(NetstarUI.resultTable.originalConfig);
				}
			}, function(error){
				console.log(error);
			},{});
		}else{//pad获取缓存插件不存在
			NetstarUI.resultTable.offlineState = false;
			//移除缓存下拉框
			removeCacheSelect();
			removeCacheListMode();
			NetstarUI.resultTable.exitFullScreenMode();
			//重新初始化页面
			NetstarUI.resultTable.init(NetstarUI.resultTable.originalConfig);
		}
	}
	//移除缓存列表
	function removeCacheListMode(){
		if(config.$cachePanel){
			if(config.$container.hasClass('cacheListMode')){
				config.$container.removeClass('cacheListMode');
			}
			config.$cachePanel.remove();
			delete config.$cachePanel;
			delete config.$cachePanelList;
			delete config.$cachePanelListBtns;
		}
	}
	////移除缓存下拉框
	function removeCacheSelect(){
		config.$cachePanelSelect.remove();
		delete config.$cachePanelSelect;
	}
	//判断是否能连接服务器
	function canConnectServer(url){
		var conn = false;
		if(url){
			$.ajax({
				url: url,
				async: false,
				dataType: 'json',
				type: 'get',
				complete: function(response) {
					if(response.status == 200) {
						conn = true;//能访问服务器
					}
				}
			});
		}
		return conn;
	}
}
//循环数组上传
NetstarUI.resultTable.uploadCacheData = function(rows){
	var successFlag = false;
	var count = rows.length;
	for (var i = 0; i < rows.length; i++) {
		var row = rows[i];
		var aData = JSON.parse(row.body);
		$.ajax({
			url: row.url,
			data: aData,
			type: 'post',
			dataType: 'json',
			async: false,
			success: function(data){
				if(data.success){
					count--;
				}else{
					nsalert(data.result);
				}
			},
			error:function(error){
				nsVals.defaultAjaxError(error);
			}
		});
	}
	//全部上传成功,然后删除需上传缓存
	if(count == 0 && typeof(cordova)!='undefined'){
		successFlag = true;
		NetstarUI.resultTable.removeStorage(function(data){
			console.log("removeAllStorage OK");
		}, function(error){
			console.log(error);
		}, {});
		//删除缓存数据
		NetstarUI.resultTable.removeAllCache(function(data) {
			console.log("removeAllCache OK");
		}, function(error) {
			console.log(error);
		}, {});
	}
	return successFlag;
}
//新增缓存数据：url相同，则覆盖；para结构:{url:'',body:''}
NetstarUI.resultTable.addCache = function(successCallback, errorCallback,para){
	if(typeof(cordova)!='undefined'){
		cordova.plugins.netstar.offlinecache.addCache(function() {
			successCallback();
		}, function(error) {
			errorCallback(error);
		}, para);
	}else{
		console.log('cordova is undefined');
	}
}
//删除缓存数据：url必填
NetstarUI.resultTable.removeCache = function(successCallback, errorCallback,para){
	if(typeof(cordova)!='undefined'){
		cordova.plugins.netstar.offlinecache.removeCache(function(data) {
			successCallback(data);
		}, function(error) {
			errorCallback(error);
		}, para);
	}else{
		console.log('cordova is undefined');
	}
}
//删除所有缓存数据
NetstarUI.resultTable.removeAllCache = function(successCallback, errorCallback,para){
	if(typeof(cordova)!='undefined'){
		cordova.plugins.netstar.offlinecache.removeAllCahce(function(data) {
			successCallback(data);
		}, function(error) {
			errorCallback(error);
		}, para);
	}else{
		console.log('cordova is undefined');
	}
}
//获取缓存数据：url必填
NetstarUI.resultTable.getCache = function(successCallback, errorCallback,para){
	if(typeof(cordova)!='undefined'){
		cordova.plugins.netstar.offlinecache.getCache(function(data) {
			successCallback(data);
		}, function(error) {
			errorCallback(error);
		}, para);
	}else{
		console.log('cordova is undefined');
	}
}
//获取缓存数据：获取全部数据
NetstarUI.resultTable.getAllCache = function(successCallback, errorCallback,para){
	if(typeof(cordova)!='undefined'){
		cordova.plugins.netstar.offlinecache.getAllCache(function(data) {
			successCallback(data);
		}, function(error) {
			errorCallback(error);
		}, para);
	}else{
		console.log('cordova is undefined');
	}
}
//新增数据：即使url相同，也会增加
NetstarUI.resultTable.addStorage = function(successCallback, errorCallback,para){
	if(typeof(cordova)!='undefined'){
		cordova.plugins.netstar.offlinecache.addStorage(function(data) {
			successCallback(data);
		}, function(error) {
			errorCallback(error);
		}, para);
	}else{
		console.log('cordova is undefined');
	}
}
//删除数据：无参数，直接删除全部
NetstarUI.resultTable.removeStorage = function(successCallback, errorCallback,para){
	if(typeof(cordova)!='undefined'){
		cordova.plugins.netstar.offlinecache.removeStorage(function(data) {
			successCallback(data);
		}, function(error) {
			errorCallback(error);
		}, para);
	}else{
		console.log('cordova is undefined');
	}
}
//获取全部上传数据
NetstarUI.resultTable.getAllStorage = function(successCallback, errorCallback,para){
	if(typeof(cordova)!='undefined'){
		cordova.plugins.netstar.offlinecache.getAllStorage(function(data) {
			successCallback(data);
		}, function(error) {
			errorCallback(error);
		}, para);
	}else{
		console.log('cordova is undefined');
	}
}