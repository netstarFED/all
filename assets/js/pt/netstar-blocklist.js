/*
 * @Desription: 块状表格组件
 * @Author: netstar.sjj
 * @Date: 2019-03-07 13:28:05
 */
"use strict";
//块状grid NetstarBlockList
var NetstarBlockList = (function () {
	//var TEMPLATE = $.extend(true,{},NetStarGrid.getTemplate());
	//var vueTemplate = NetStarUtils.getTemplate(TEMPLATE);
	//调用基本的设置默认值

	var isHaveGrid = typeof(NetStarGrid) == 'object';
	if(isHaveGrid == false){
		//如果还没有NetStarGrid，则不初始化
		return false;
	}

    var configManager = $.extend(true,{},NetStarGrid.configManager);
	var htmlManager = $.extend(true,{},NetStarGrid.htmlManager);
	var dataManager = NetStarGrid.dataManager;
	var methodsManager = $.extend(true,{},NetStarGrid.methodsManager);
	//configManager.SYSTEMCOLUMNS.CHECKSELECT.title = '<label class="checkbox-inline" onclick="NetStarGrid.userAllSelect(this,\'block\')"></label>';
	methodsManager.body.netStarColumnText = function(data,rowIndex,_vueData){
		var expression = _vueData.ui.listExpression;
		// [{"shopName":"店铺名称"},{"tel":"0311-88990022"}] => '<h3 class="title">{{shopName}}</h3><span>{{tel}}</span>' => '<h3 class="title">店铺名称</h3><span>0311-88990022</span>'
		//var expression = '<h3>{{itemName}}</h3><span>{{itemCateName}}</span><span>{{py}}</span>';
		var value = '';
		var column = _vueData.columnById;
		var iconClass = _vueData.ui.iconClass ? _vueData.ui.iconClass : {};
		var originalRow = _vueData.originalRows[rowIndex];
		if(expression){
			//value = NetStarUtils.getHtmlByRegular(data,expression);

            var rex1 = /\{\{(.*?)\}\}/g;
            var rex2 = /\{\{(.*?)\}\}/;
            var listHtml = expression;
            if(rex2.test(expression)){
				var strArr = expression.match(rex1);
				var formatExpArr = [];
				var oneFormatExpArr = [];
                for(var i=0; i<strArr.length; i++){
					if(strArr[i].indexOf('.')>-1){
						//找到当前包含的容器
						formatExpArr.push(i);
					}else{
						oneFormatExpArr.push(i);
						if(strArr[i].match(rex2)[1]=='iconClass'){
							//图标转换
							var chargeIconByField = $(listHtml).find('i[ns-icon]').attr('ns-icon');
							if(iconClass[chargeIconByField]){
								listHtml = listHtml.replace(strArr[i], iconClass[chargeIconByField][originalRow[chargeIconByField]] ? iconClass[chargeIconByField][originalRow[chargeIconByField]] : '');
							}
						}else{
							listHtml = listHtml.replace(strArr[i], data[strArr[i].match(rex2)[1]] ? data[strArr[i].match(rex2)[1]] : '');
						}
					}
				}
				
				if(formatExpArr.length > 0){
					//for(var j=0; j<formatExpArr.length; j++){
						var expstr = formatExpArr[0];
						var listData = NetStarUtils.getListDataByExp(data,strArr[expstr].match(rex2)[1]);

						function getContainerHtml(_exp,_data,_expStr){
							var expHtml = listHtml; 
							if($(listHtml).length > 0){
								var dom;
								var indexI;
								var expDomHtml = '';
								/***************先循环输出找到嵌套数据 start************* */
								var newListHtml = '';
								for(var i=0;i<$(listHtml).length; i++){
									var container = $(listHtml)[i];
									if(container.hasChildNodes()){
										//含有子元素
										for(var j=container.childNodes.length-1; j>=0; j--){
											var element = container.childNodes[j];
											if(element.hasChildNodes()){
												if(element.childNodes.length == 1){
													if(element.childNodes[0].nodeName == "#text"){
														if(element.innerText==''){
															container.removeChild(element);
														}
													}
												}else{
													if(element.childNodes[1].nodeName == "SPAN"){
														dom = element;
														indexI = i;
														expDomHtml = element.innerHTML;
														break;
													}
												}
											}else{
												if(element.innerText==''){
													container.removeChild(element);
												}
											}
										}
										newListHtml+= container.outerHTML;
									}
								}
								listHtml = newListHtml;
								/***************先循环输出找到嵌套数据 end************* */
								if($.isEmptyObject(_data)){
									//空
									var newHtml = '';
									for(var i=0;i<$(listHtml).length; i++){
										var tempElement = $(listHtml)[i];
										if(i === indexI){
											tempElement.innerHTML = '';
										}
										newHtml += tempElement.outerHTML;
									}
									expHtml = newHtml;
								}else{
									var fieldArray = _expStr.split('.');
									if($.isArray(_data)){
										var dataHtml = '';
										for(var listI=0; listI<_data.length; listI++){
											//if(_data[listI][fieldArray[fieldArray.length-1]]){
												var str = _data[listI][fieldArray[fieldArray.length-1]] ? _data[listI][fieldArray[fieldArray.length-1]] : '';
												var fieldHtml = expDomHtml.replace(_exp,str);
												if(formatExpArr.length > 0){
													for(var f=1; f<formatExpArr.length; f++){
														var tempFArr = strArr[formatExpArr[f]].match(rex2)[1].split('.');
														var fStr = _data[listI][tempFArr[tempFArr.length-1]] ? _data[listI][tempFArr[tempFArr.length-1]] : '';
														fieldHtml = fieldHtml.replace(strArr[formatExpArr[f]],fStr);
													}
												}
												//strArr[expstr].match(rex2)[1]
												if(fieldHtml.indexOf('<i')>-1){
													var spanDom = $(fieldHtml);
													spanDom[0].className = patientMonitorIcon[_data[listI].icon] ? 'icon '+patientMonitorIcon[_data[listI].icon]:'icon icon-minicode-heart-o';
													if(Number(_data[listI].resultFlag)){
														if(_data[listI].resultFlag === 1){
															spanDom[0].className += ' text-danger';
														}
													}
													fieldHtml = spanDom[0].outerHTML + spanDom[1].outerHTML;
												}
												dom.innerHTML = fieldHtml;
												dataHtml += dom.outerHTML;
											//}
										}
										var newHtml = '';
										for(var i=0;i<$(listHtml).length; i++){
											var tempElement = $(listHtml)[i];
											if(i === indexI){
												tempElement.innerHTML = dataHtml;
											}
											//tempElement.removeChild(tempElement.childNodes[0])
											newHtml += tempElement.outerHTML;
										}
										expHtml = newHtml;
									}else{
										//
									}
								}
							}
							return expHtml;
						}

						listHtml = getContainerHtml(strArr[expstr],listData,strArr[expstr].match(rex2)[1]);
					//}
				}
				/*for(var c=0; c<oneFormatExpArr.length; c++){
					var expstr = oneFormatExpArr[c];
					listHtml = listHtml.replace(strArr[expstr], data[strArr[expstr].match(rex2)[1]]);
				}*/
			}
			
			value = listHtml;
		}else{
			value = '<span>'+data[column.field]+'</span>';
		}
		//console.log(column."NETSTAR-BTNS")
		return value;
	};
	methodsManager.body.NetstarBlockState = function(data){
		var classStr = '';
		switch(Number(data.resultFlag)){
			case 1:
				classStr = 'pt-block-list-warning';
				break;
		}
		switch(Number(data.deviceState)){
			case 1:
				if(classStr){classStr += ' pt-state-online';}else{classStr = 'pt-state-online';}
				break;
			case 0:
				//离线
				if(classStr){classStr += ' pt-state-offline';}else{classStr = 'pt-state-offline';}
				break;
		}
		switch(Number(data.deviceBedState)){
			case 1:
				//if(classStr){classStr += ' pt-state-online';}else{classStr = 'pt-state-online';}
				break;
			case 0:
				//离床
				if(classStr){classStr += ' pt-state-unbed';}else{classStr = 'pt-state-unbed';}
				break;
		}
		return classStr;
	};
	methodsManager.body.checkboxSelelctHandler = function(ev, _vueData){
		var id = _vueData.$options.id;
		var $tr = $(ev.target).closest('.pt-block-list');
		var configs = NetstarBlockList.configs[id];
		var gridConfig = configs.gridConfig;
		var rowIndex = $tr.attr('ns-rowindex');
		rowIndex = parseInt(rowIndex);
		var rows  = _vueData.$data.rows;
		var rowData = rows[rowIndex];
		var setFlag = ! rowData.netstarCheckboxSelectedFlag; //如果是已选则取消，未选中则选中
		rowData.netstarCheckboxSelectedFlag = setFlag;
		//sjj 20190119 设置全选状态
		this.setUserAllSelectCheckState(_vueData,'block');
		//回调行选中事件
		if(gridConfig.ui.checkboxSelectedHandler){
			var originalRows = configs.vueConfig.data.originalRows;
			if(gridConfig.data.isServerMode == false){
				//客户端获取数据
				rowData = originalRows[rowIndex + configs.vueConfig.data.page.start];
			}
			//返回参数中第一个永远是操作行数据，从第二个参数中可以通过判断netstarSelectedFlag获取多选状态下的
			var callbackData = gridConfig.ui.checkboxSelectedHandler(rowData, _vueData.$data, _vueData, gridConfig)
			//如果有返回值，则刷新行数据
			if(typeof(callbackData) == 'object'){
				rowData = callbackData;
			}
		}
	};
	var vueManager = {
		getData:function(gridConfig){

			//基本数据格式
			var vueData = {
				idField:gridConfig.data.idField,
				plusClass:gridConfig.plusClass,
				//头部部分 用于标题 内部搜索等
				header:{
					isShow:false,
				},
				//底部部分 用于统计合计等
				footer:{
					isShow:false,
				},
				//基础属性
				/** 三个实际上的表格属性统一 id styleObj
				 * headerTable：{
				 * 		id:'',
				 * 		styleObj:{width:'1550px'} 
				 * }
				 */
				domParams:{
					// headerTable:{},  头部
					// contentTable:{}, 内容
					// footerTable:{},  底部
				},
				//数据
				rows:[],
				//列描述
				columns:[],
				//页描述
				page:{
					start:0, 										//从第几条开始
					length:gridConfig.ui.pageLengthDefault, 		//当前显示长度
					pageLength:gridConfig.ui.pageLengthMenu, 		//可选分页数量
				},
				search:{
					keyword:''
				},
				ui:gridConfig.ui, //ui参数, 包含是否有自动序列号, 是否有checkSelect
				pageNumberWithMax:'',
			};
			//头部处理
			var isHaveHeaderPanel = false;  //是否有头部面板
			if(gridConfig.ui.title){
				vueData.header.title = gridConfig.ui.title;
				isHaveHeaderPanel = true;
			}

			//复制基本数据
			if(gridConfig.domParams){
				vueData.domParams = gridConfig.domParams;
			}

			//复制列配置
			if(gridConfig.columns){
				vueData.columns = gridConfig.columns;
				vueData.columnById = {};
				for(var columnI = 0; columnI<vueData.columns.length; columnI++){
					var columnConfig = vueData.columns[columnI];
					columnConfig.gridId = gridConfig.id;
					var key = columnConfig.field
					vueData.columnById[key] = columnConfig;
				}
			}
			//复制行数据
			if(gridConfig.data.src){
                //ajax数据源 先填充空行到数据源
                vueData.originalRows = [];
                vueData.rows = dataManager.getRows([], gridConfig);
                dataManager.ajax(gridConfig);
			}else{
				if(!$.isArray(gridConfig.data.dataSource)){
					gridConfig.data.dataSource = [];
				}
				if(gridConfig.data.dataSource.length == 0){
					gridConfig.domParams.panelOfEmptyRows = {
						isShow:true,
						class:'no-data',
						info:'暂无数据' 
					};
				}else{
					gridConfig.domParams.panelOfEmptyRows = {
						isShow:false,
						class:'',
						info:'' 
					};
				}
                //如果定义了数据源
                vueData.originalRows = gridConfig.data.dataSource;
				vueData.rows = dataManager.getRows(gridConfig.data.dataSource, gridConfig);
            }
			
			return vueData;
		},
		getVueConfig:function(_gridConfig){
			var vueConfig = {
                id:_gridConfig.id, 
				el:_gridConfig.el,
				data:this.getData(_gridConfig),
				contentTableAttr:{
					isRefreshSource:false, //是否刷新了数据
					$table:'', //主要内容表格
				},
				component:{},
				watch:{
					search:{
						keyword: function (value) {
							console.log(value);
						}
					},
					rows:{
						deep:true,
						handler:function(newValues, oldValues){
							this.$options.contentTableAttr.isRefreshSource = true;
							//修改数据源属性
							//console.log('rows edit');
						}
                    },
                    originalRows:{
                        //数据源发生变化时候重新分页
                        handler:function(newRowsData, oldRowsData){
							//监视原始数据，分页后刷新显示数据 
							var gridConfig = NetstarBlockList.configs[[this.$options.id]].gridConfig;
							if(newRowsData.length == 0){
								gridConfig.domParams.panelOfEmptyRows = {
									isShow:true,
									class:'no-data',
									info:'暂无数据' 
								};
							}else{
								gridConfig.domParams.panelOfEmptyRows = {
									isShow:false,
									class:'',
									info:'' 
								};
							}
							//编辑模式下需要清除unsaved class 且不分页，所以行下标就可以对应数据下标
							if(gridConfig.ui.isEditMode){
								var $trs = gridConfig.domParams.contentTableContainer.$dom.find('tbody tr');
								for(var trI = 0; trI<$trs.length; trI++){
									if(typeof(newRowsData[trI]) != 'object'){
										$trs.eq(trI).find('td.unsaved').removeClass('unsaved');
									}
								}
							}
							dataManager.toPageByNumber(0, gridConfig, this);
                        }
                    }
				},
				methods:{
					searchInputKeyupHandler:function(){
                        console.log('1 searchInputKeyupHandler')
                    },
                    filterSearchHandler:function(){
                        console.log('2 filterSearchHandler')
					},
					checkAllSelect:function(ev){
						console.log(ev)
					},
					rowBtnClickHandler:function(ev){
						console.log(ev)
					},
                    //header和footer表格跟随内容表格移动
					scrollXContentTable:function(ev){
						//methodsManager.scrollXTableHandler(ev, this);
					},
					scrollYContentTable:function(ev){
						//methodsManager.scrollYTableHandler(ev, this);
                    },
                    contentWheelHandler:function(ev){
                        //methodsManager.contentWheelHandler(ev, this);
					},
					//footer部分的方法
                    togglePageLengthSelect:function(ev){
                        methodsManager.footer.togglePageLengthSelect(ev, this);
                    },
                    selectPageLength:function(ev){
                        methodsManager.footer.selectPageLength(ev, this);
                    },
                    toPage:function(toPageStr){
                        methodsManager.footer.toPage(toPageStr, this);
                    },
                    toggleToPageSelect:function(ev){
                        methodsManager.footer.toggleToPageSelect(ev, this);
                    },
                    selectToPage:function(ev){
                        methodsManager.footer.selectToPage(ev, this);
					},
					//body 行选中
					rowClickHandler:function(ev){
						methodsManager.body.rowClickHandler(ev, this);
					},
					rowdbClickHandler:function(ev){
						methodsManager.body.rowdbClickHandler(ev, this);
					},
					checkboxSelelctHandler:function(ev){
						methodsManager.body.checkboxSelelctHandler(ev, this);
					},
					//设置行状态标记
					netstarRowStateFlag:function(data){
						return methodsManager.body.rowStateClassHandler(data,this);
					},
					//设置列状态标记
					NetstarTdStateFlag:function(data,column){
						return methodsManager.body.columnStateClassHandler(data,column,this);
					},
					//手动输入显示每页条数
					inputEnterPageLength:function(ev){
						methodsManager.footer.inputEnterPageLength(ev, this);
					},
					//手动输入当前显示第几页
					inputEnterToPage:function(ev){
						methodsManager.footer.inputEnterToPage(ev, this);
					},
					netStarColumnText:function(data,rowIndex){
						return methodsManager.body.netStarColumnText(data,rowIndex,this);
					},
					NetstarBlockState:function(data){
						return methodsManager.body.NetstarBlockState(data,this);
					},
					NetstarOrderClass:function(column){
						var orderClassStr = '';
						switch (column.orderType) {
							case 'asc':
								orderClassStr = 'sorting-asc';
								break;
							case 'desc':
								orderClassStr = 'sorting-desc';
								break;
							case 'default':
								orderClassStr = 'sorting';
								break;
							default:
								orderClassStr = 'sorting-disabled';
								break;
						}
						return orderClassStr;
					},
				},
				mounted:function() {
					//初始化表格的body，以及三个主要Table对象 都是$dom对象
					methodsManager.initDomParams(this);
					//如果存在数据源 data.dataSource 则需要刷新纵向滚动条的高度
					methodsManager.refreshScrollY(this);
				},
				updated:function(){
					//刷新数据源了，则需要重新设定滚动条的高度
					var isRefreshSource = this.$options.contentTableAttr.isRefreshSource;
					if(isRefreshSource){
						methodsManager.refreshScrollY(this);
					}
                },
                //需要自动计算的变量
                computed:{
                }

            };
			return vueConfig;
		}
	};

	function getVueConfig(_gridConfig){
		/**
		 *_gridConfig:object {
		 *  data:[],    //数据描述参数
		 *  columns:[], //列配置参数     
		 * } 
		 **/
        configManager.setDefault(_gridConfig);
		//先对容器进行设置高度，防止因为高度变化引起的闪烁
		htmlManager.setContainer(_gridConfig);
		
        var gridConfig = configManager.getConfig(_gridConfig);
        //获取与VUE标签匹配的VUE配置文件
		var vueConfig = vueManager.getVueConfig(gridConfig);
		//获取带VUE标签的代码
		var html = htmlManager.getHtml(gridConfig, vueConfig);
		return {
			html:html,  
            vueConfig:vueConfig,
            gridConfig:gridConfig,
		};
	}
	function init(gridConfig){
		//设置类型 defaultMode
		var defaultUI = {
			displayMode:'block',
			isHaveEditDeleteBtn:true,
			isCheckSelect:false,
			isHeader:false,
			isPage:false,
			isThead:false,
		};
		NsUtils.setDefaultValues(gridConfig.ui,defaultUI);
		//准备VUE输出 返回html和vue的整体参数
		var grid = NetstarBlockList.getVueConfig(gridConfig);
		//先输出带VUE标签的HTML到相应的容器内
		$(grid.vueConfig.el).html(grid.html);
		//执行VUE渲染
		var vueObj = new Vue(grid.vueConfig);
		var configs = {
            original:gridConfig,            //原始配置参数
			gridConfig:grid.gridConfig,     //运行时配置参数
			vueConfig:grid.vueConfig,       //vue配置参数
			vueObj:vueObj,                  //vue对象 
		};
		NetstarBlockList.configs[gridConfig.id] = configs;
		NetStarGrid.initCompleteHandler(configs);
	}
	function deleteAjaxRow(data){
		/*
			data object
		*/
		var configs = NetstarBlockList.configs[data.gridId];
		var deleteAjax = configs.gridConfig.ui.deleteAjax;
		var ajaxConfig = nsVals.getAjaxConfig(deleteAjax,data.rowData,{idField:configs.gridConfig.data.idField});
		ajaxConfig.plusData = {
			data:data
		};
		nsVals.ajax(ajaxConfig,function(res,ajaxData){
			if(res.success){
				var data = ajaxData.plusData;
				NetStarGrid.delRow(data.rowData,data.gridId,data.rowIndex);
			}
		},true)
	}
	function setDataByFieldAndValue(gridId, fieldKey,rowData) {
		//gridId:string gird的id
		//fieldKey:字段名称
		//fieldValue 字段值
		//data 当前值
		var grid = NetstarBlockList.configs[gridId];
		if (typeof (grid) != 'object') {
			console.error('id:' + gridId + ' 找不到相关配置文件，请核实');
		} else {
			var originalRows = grid.vueConfig.data.originalRows;//返回的总数据
			var rows = grid.vueConfig.data.rows;  //当前显示的行数据
			var startI=0;
			if(grid.gridConfig.data.isServerMode == false){
				startI = grid.vueConfig.data.page.start;
			}
			
			var dataNsIndex = -1;
			var originalNsIndex = -1;
			for(var i = 0; i<rows.length; i++){
				var data = rows[i];
				if(originalRows[i+startI]){
					//当前显示的值存在于原始数据值当中
					if(data[fieldKey] == rowData[fieldKey]){
						dataNsIndex = i;
						originalNsIndex = i+startI;
						break;
					}
				}
			}
			if(dataNsIndex > -1){
				$.each(rowData, function(key,value){
					//获取column配置
					var columnConfig = grid.gridConfig.columnById[key];
					if(typeof(columnConfig) == 'object'){
						//有可能需要处理的数据
						rows[dataNsIndex][key] = NetStarGrid.dataManager.getValueByColumnType(rowData[key], rowData, columnConfig);
					}else{
						//没有配置， 这些是不用处理的数据
						rows[dataNsIndex][key] = rowData[key];
					}
				});
				var listNsIndex = -1;
				if($.isArray(rows[dataNsIndex].itemResultVoList)){
					for(var listI=0; listI<rows[dataNsIndex].itemResultVoList.length; listI++){
						if(rows[dataNsIndex].itemResultVoList[listI].itemId == rowData.itemId){
							listNsIndex = listI;
							break;
						}
					}
					if(listNsIndex > -1){
						rows[dataNsIndex].itemResultVoList[listNsIndex].result = rowData.result;
						rows[dataNsIndex].itemResultVoList[listNsIndex].resultFlag = rowData.resultFlag;
						originalRows[originalNsIndex].itemResultVoList[listNsIndex].result = rowData.result;
						originalRows[originalNsIndex].itemResultVoList[listNsIndex].resultFlag = rowData.resultFlag;
						refreshDataById(gridId,originalRows);
					}
				}
			}
		}
	}
	function refreshDataById(gridId, gridData){
		var config = NetstarBlockList.configs[gridId];
		if (typeof config == 'undefined') {
			console.error("gridId传入错误");
			return false;
		}
		if (!(gridData instanceof Array)) {
			console.error("gridData类型应为数组");
			console.error(gridData)
			return false;
		};
		config.vueObj.originalRows = $.extend(true, [], gridData);
	}
	
	//根据字段和值获取当前操作的数据
	function getDataByFieldAndValue(gridId, fieldKey, fieldValue){
		//gridId:string gird的id
		//fieldKey:字段名称
		//fieldValue 字段值
		//不存在主键id的情况此方法走不通
		var grid = NetstarBlockList.configs[gridId];
		var rowData = {};
		if (typeof (grid) != 'object') {
			console.error('id:' + gridId + ' 找不到相关配置文件，请核实');
		} else {
			var originalRows = grid.vueConfig.data.originalRows;//返回的总数据
			var idField = grid.gridConfig.data.idField;
			var dataNsIndex = -1;
			for (var i = 0; i < originalRows.length; i++) {
				if (originalRows[i][fieldKey] == fieldValue) {
					dataNsIndex = i;
					break;
				}
			}
			if (dataNsIndex > -1) {
				rowData = originalRows[dataNsIndex];
			} else {
				console.warn(fieldKey + "::" + fieldValue);
			}
		}
		return rowData;
	}
	var controllerManager = {
		getSelectedData:function(gridId){
			var config = NetstarBlockList.configs[gridId];
			if (typeof (config) != 'object') {
				var errorInfoStr = 'getSelectedData(gridId)方法出错，当前gridId：' + gridId + '错误， 该Grid不存在';
				nsalert(errorInfoStr, 'error');
				console.error(errorInfoStr)
				return false;
			} var originalRows = config.vueObj.originalRows;
			var rows = config.vueObj.rows;
			var selectedRows = [];
			var startI = 0;
			if (config.gridConfig.data.isServerMode == false) {
				startI = config.vueConfig.data.page.start;
			}
			for (var i = 0; i < rows.length; i++) {
				var data = rows[i];
				if (originalRows[i + startI]) {
					if (data.netstarSelectedFlag) {
						selectedRows.push(originalRows[i + startI]);
					}
				}
	
			}
			return selectedRows;
		}
	};
	return{
		init:init,
		getVueConfig:getVueConfig,
		configs:{},
		deleteAjaxRow:deleteAjaxRow,
		setDataByFieldAndValue:setDataByFieldAndValue,
		refreshDataById:refreshDataById,
		getSelectedData:controllerManager.getSelectedData,
		getDataByFieldAndValue : getDataByFieldAndValue,
	}
})(jQuery)