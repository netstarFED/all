/*
 * @Desription: 文件说明
 * @Author: netstar.cy
 * @Date: 2019-08-22 16:44:22
 * @LastEditTime: 2019-11-04 21:00:03
 */
/********************************************************************
 * 项目选择器
 */
nsUI.projectSelect = (function($) {
	var config;
	var $btn;  							//外部按钮
	var $input;							//搜索框
	var $searchBtn; 					//搜索按钮
	var $list; 							//当前列表
	var $result;						//已选择列表
	var $arrAdd;						//添加
	var $arrAddAll; 					//批量添加
	var $arrRemove; 					//移除
	var $arrRemoveAll; 					//批量移除
	var $confirmBtn; 					//确认按钮
	var $cancelBtn; 					//取消按钮
	var $clsoeBtn; 						//关闭按钮
	var evenPageLength = 10;			//固定每页默认显示10条数据
	function init(configObj){
		if(config){
			$("#"+config.id).show();
			return false;
		}
		
		config = configObj;
		evenPageLength = typeof(config.pageLength)=='number' ? config.pageLength : 10;
		if(config.$btn){
			$btn = config.$btn; //已经废弃的属性 改为整页面弹框
		}
		$container = config.$container;
		var configID;
		if(config.id){
			//id存在
		}else{
			//自动添加ID
			if(config.$btn){
				config.id = $btn.closest(".page-title.nav-form").attr('id')+'-fid'+$btn.attr('fid'); //面板ID
			}else{
				config.id = 'nsUI-projectSelect-'+Math.round(Math.random()*1000000000+1);
			}
		}
		//清空数据数组，如果有赋值则不清空
		if(typeof(config.dataArr)=='undefined'){
			config.dataArr = [];
		}
		if(typeof(config.listArr)=='undefined'){
			config.listArr = [];
		}
		if(typeof(config.resultArr)=='undefined'){
			config.resultArr = [];
		}

		if(typeof(config.classArr)=='undefined'){
			config.classArr = [];
		}

		if(typeof(config.listAjax)=='object'){
			config.listAjax.tooltip = typeof(config.listAjax.tooltip)=='boolean' ? config.listAjax.tooltip : false;
		}
		//数据来源读取与本地数据
		if(typeof(config.classAjax)=='object'){
			if($.isArray(config.classAjax.dataSource)){config.classArr = config.classAjax.dataSource;}
		}

		config.selectedListArr = [];
		config.selectedResultArr = [];

		config.maximumItem = typeof(config.maximumItem) == 'number' ? config.maximumItem : 0;//sjj 20190415允许选择的最大条数
		//所包含DOM的id
		config.childrenID = {};
		config.childrenID.dropdown = config.id+'-menu'; 	//分类列表ID
		config.childrenID.list = config.id+'-list';  		//所有项目列表ID
		config.childrenID.tree = config.id+'-tree';  		//所有项目列表ID

		config.isUseHotkey = typeof(config.isUseHotkey) == 'boolean' ? config.isUseHotkey : true;//默认使用快捷键

		config.selectClassID = '-1'; //默认选中class是全部
		if(typeof(nsUI.projectSelect.data)!='object'){
			nsUI.projectSelect.data = {};
		}

		nsUI.projectSelect.data[config.id] = config;
		var listHeight = evenPageLength * 30 + 30;
		var pHeight = listHeight + 100;
		var pMargintop = -(pHeight / 2);
		var arrTop = listHeight / 3;

		var isLocalData = false;//默认来源于ajax请求
		if(config.dataArr.length > 0){isLocalData = true;} 

		if(typeof($container)!='object'){
			$('body').append(getPlaneHtml());  //默认情况下输出HTML到body最后
			$('#'+config.id).css({'height':pHeight+'px','margin-top':pMargintop+'px'});
		}else{
			if(typeof(config.containerMode)=='string'){
				if(config.containerMode == 'inner'){
					$container.addClass('project-select-container');
				}
			}
			$container.html(getPlaneHtml()); //作为其他组件的一部分输出HTML到制定HTML标签
			$container.css({'height':pHeight+'px'});
		}
		if(config.treeVisible){ // 显示树
			if(config.treeAjax){ // 存在树配置
				config.treeAjax.clickCallback = function(treeJson){
					var treeData = {};
					if($.isArray(config.treeAjax.ajaxDataField)){
						for(var index=0;index<config.treeAjax.ajaxDataField.length;index++){
							treeData[config.treeAjax.ajaxDataField[index]] = treeJson.treeNode[config.treeAjax.ajaxDataField[index]];
						}
					}
					if(typeof(config.treeAjax.ajaxDataField) == "string"){
						treeData[config.treeAjax.ajaxDataField] = treeJson.treeNode[config.treeAjax.ajaxDataField];
					}
					if(config.listAjax.url){
						getListAjax(treeData);
					}
				}
				config.treeAjax.fullID = 'form-' + config.childrenID.tree + '-' + config.treeAjax.id;
				config.treeAjax.$customContainer = $('#form-' + config.childrenID.tree + '-' + config.treeAjax.id).parent();
				treeUI.init(config.childrenID.tree,config.treeAjax); //初始化下拉树
			}else{
				// 不存在树配置 不执行 树初始化 生成标题 getTitleHtml() 已经报错 所以此处不报错
			}
		}

		//初始化键盘、焦点事件
		$input = $("#"+config.id+" .ps-title .ps-input input");
		$list = $("#"+config.id+" .ps-body .ps-list");
		$result = $("#"+config.id+" .ps-body .ps-select");
		$searchBtn = $("#"+config.id+" .ps-title .ps-input button");
		$arrAddAll = $("#"+config.id+' .arr .arr-add[ns-target="all"]');
		$arrAdd = $("#"+config.id+' .arr .arr-add[ns-target="single"]');
		$arrRemove = $("#"+config.id+' .arr .arr-remove[ns-target="single"]');
		$arrRemoveAll = $("#"+config.id+' .arr .arr-remove[ns-target="all"]');
		$confirmBtn = $("#"+config.id+" .ps-btn .btn-success");
		$cancelBtn = $("#"+config.id+" .ps-btn .btn-white");
		$clsoeBtn = $("#"+config.id+" .ps-title .ps-close-btn");

		// $treeInput = $('#form-'+config.id+'-tree-treeSelect');
		config.isUseHotkey = false;
		$list.css({'height':listHeight+'px'});
		$result.css({'height':listHeight+'px'});
		$arrAdd.parent().css({'height':listHeight+'px','padding-top':arrTop+'px'});
		
		//初始化窗口快捷键
		if(config.isUseHotkey){
			$(document).off("keyup",shortKeyHanlder);
			$(document).on("keyup",shortKeyHanlder);
		}
		//初始化搜索框
		$input.on('focus', function(ev){
			$input.on('blur',function(ev){
				$input.off("keyup",inputKeyupHandler);
				if(config.isUseHotkey){
					$(document).off("keyup",shortKeyHanlder);
					$(document).on("keyup",shortKeyHanlder);
				}
				removeDefaultReadyLi();
			});
			$input.on("keyup",inputKeyupHandler);
			if(config.isUseHotkey){
				$(document).off("keyup",shortKeyHanlder);
			}
			setDefaultReadyLi();
		});
		$input.focus();
		//初始化按钮
		$searchBtn.on('click',function(ev){
			searchValue();
		})
		$arrAdd.on('click',arrAddHandler);
		$arrAddAll.on('click',arrAddAllHandler);
		$arrRemove.on('click',arrRemoveHandler);
		$arrRemoveAll.on('click',arrRemoveAllHandler);
		$confirmBtn.on('click',cofirmBtnHandler);
		$cancelBtn.on('click',closeBtnHandler);
		$clsoeBtn.on('click',closeBtnHandler);

		//本地加载刷新数据
		if($.isArray(config.listAjax.dataSource)){getListData(config.listAjax.dataSource);}

		if(debugerMode){
			for(var dataI=0; dataI<config.dataArr.length; dataI++){
				if(typeof(config.dataArr[dataI][config.listAjax.classField])=='undefined'){
					console.warn('检索分类列表ID:'+dataI+'的值为'+config.dataArr[dataI][config.listAjax.classField]);
				}
			}
		}
	}
	//清除数据，下次点击重新初始化
	function clear(){
		if(config){
			$input.off("keyup");
			$arrAdd.off('click');
			$arrAddAll.off('click');
			$arrRemove.off('click');
			$arrRemoveAll.off('click');
			$confirmBtn.off('click');
			$cancelBtn.off('click');
			$clsoeBtn.off('click');
			$('#'+config.id).remove();
			config = undefined;
		}

	}
	function closeBtnHandler(ev){
		$("#"+config.id).hide();
		clear();	
	}
	function cofirmBtnHandler(ev){
		confirmHandler();
	}
	//返回参数
	function confirmHandler(){
		if(typeof(config) == 'undefined'){
			return;
		}
		var configHandler = config.confirmHandler;
		if(typeof(configHandler)=='function'){
			var resultStr = '';
			var configHandlerArr = [];
			var childIndexArr = [];
			for(var resultI=0; resultI<config.resultArr.length; resultI++){
				configHandlerArr.push(config.resultArr[resultI][config.listAjax.valueField]);
				resultStr += '"'+config.resultArr[resultI][config.listAjax.valueField]+'"';
				if(resultI<config.resultArr.length-1){
					resultStr += ',';
				}
				if(config.resultArr[resultI].hasChild){
					//含有子元素
					childIndexArr.push(resultI);
				}
			}
			for(var cIndex=0; cIndex<childIndexArr.length; cIndex++){
				var subArr = config.resultArr[childIndexArr[cIndex]][config.listAjax.childField];
				var childArr = [];//子元素集合
				for(var subI=0; subI<subArr.length; subI++){
					if(subArr[subI].isInSelect){
						childArr.push(subArr[subI]);
						configHandlerArr.push(subArr[subI][config.listAjax.valueField]);
						resultStr += ',"'+subArr[subI][config.listAjax.valueField]+'"';
					}
				}
				if(childArr.length == 0){
					var childItemname = config.resultArr[childIndexArr[cIndex]][config.listAjax.textField]
					nsalert('名称为"'+childItemname+'"子项目为空','error');
					return false;
				}
				config.resultArr[childIndexArr[cIndex]][config.listAjax.childField] = childArr;
			}
			resultStr = '['+resultStr+']';
			config.selected = resultStr;
			var resultObj = {};
			resultObj.string = resultStr;
			resultObj.array = config.resultArr;
			resultObj.value = configHandlerArr;
			configHandler(resultObj);
			if(typeof($container)!='object'){
				$("#"+config.id).hide();
				clear();
			}
		}
	}
	//输入框处理
	function inputKeyupHandler(ev){
		if(config.isUseHotkey){
			switch(ev.keyCode){
				case 32:
					var trimStr = $input.val();
					if(trimStr != $.trim(trimStr)){
						var $ready = $list.children('ul').children('li[ns-psid][class="ready"]');
						if($ready.length>0){
							var id = $ready.attr('ns-psid');
							selectAddList(id,$ready);
							refreshList();
							setDefaultReadyLi();
							var trimStr = $input.val();
							trimStr = $.trim(trimStr);
							$input.val(trimStr);
							$input.select();
						}
					}else{
						searchValue();
						setDefaultReadyLi();
					}
					break;

				case 40:
					//下：移动到下一个
					toNextLi();
					break;
				case 38:
					//上：移动到上一个
					toPrevLi();
					break;
				case 37:
					//上一页
					toPrevPage();
					setDefaultReadyLi();
					break;
				case 39:
					//下一页
					toNextPage();
					setDefaultReadyLi();
					break;
				case 13:
					//确认
					confirmHandler();
					break;
				case 27:
					//取消
					closeBtnHandler();
					break;
				default:
					//正常输入搜索
					searchValue();
					setDefaultReadyLi();
					break;
			}
		}else{
			//正常输入搜索
			searchValue();
			setDefaultReadyLi();
		}
	}

	function toNextLi(){
		//下：移动到下一个
		var $ready = $list.children('ul').children('li[ns-psid][class="ready"]');
		if($ready.length==0){
			return false;
		}
		//递归查找下一个
		var $nextReady;
		function getNext($dom){
			var $next = $dom.next('[ns-psid]');
			if($next.length==0){
				$nextReady = false;
				if(config.listPageIndex[1]<config.listArr.length-1){
					toNextPage();
					setDefaultReadyLi();
				}else{
					nsalert(language.ui.linelast,'warning');
				return false;
				}
			}else{
				if($next.attr('class')==''){
					$nextReady = $next;
				}else{
					getNext($next);
				}
			}
		}
		getNext($ready);
		if($nextReady){
			$ready.removeClass('ready');
			$nextReady.addClass('ready');
		}
	}
	function toPrevLi(){
		var $ready = $list.children('ul').children('li[ns-psid][class="ready"]');
		if($ready.length==0){
			return false;
		}
		//递归查找上一个
		var $preReady;
		function getNext($dom){
			var $pre = $dom.prev('[ns-psid]');
			if($pre.length==0){
				$preReady = false;
				if(config.listPageIndex[0]>0){
					toPrevPage();
					setDefaultLastReadyLi();
				}else{
					nsalert(language.ui.lineFirst,'warning');
					return false;
				}
			}else{
				if($pre.attr('class')==''){
					$preReady = $pre;
				}else{
					getNext($pre);
				}
			}
		}
		getNext($ready);
		if($preReady){
			$ready.removeClass('ready');
			$preReady.addClass('ready');
		}
	}
	function toNextPage(){
		if(config.listPageIndex[1]>=config.listArr.length-1){
			nsalert(language.ui.pagelast,'warning');
		}else{
			//refreshList([config.listPageIndex[0]+10,config.listPageIndex[1]+10]);
			refreshList([config.listPageIndex[0]+evenPageLength,config.listPageIndex[1]+evenPageLength]);//pageLength
		}
	}
	function toPrevPage(){
		if(config.listPageIndex[0]==0){
			nsalert(language.ui.pageFirst,'warning');
		}else{
			//refreshList([config.listPageIndex[0]-10,config.listPageIndex[1]-10]);
			refreshList([config.listPageIndex[0]-evenPageLength,config.listPageIndex[1]-evenPageLength]);
		}
	}
	//设定默认值
	function setDefaultReadyLi(){
		$list.children('ul').children('li[ns-psid][class="ready"]').removeClass('ready');
		$list.children('ul').children('li[ns-psid][class=""]').eq(0).addClass('ready');
	}
	function setDefaultLastReadyLi(){
		$list.children('ul').children('li[ns-psid][class="ready"]').removeClass('ready');
		$list.children('ul').children('li[ns-psid][class=""]').last().addClass('ready');
	}
	function removeDefaultReadyLi(){
		$list.children('ul').children('li[ns-psid][class="ready"]').removeClass('ready');
	}
	function searchValue(){
		var value = $input.val();
		//判断分类
		var searchClassOff = true;
		if(config.selectClassID=='-1'){
			//全部分类
			searchClassOff = true;
		}else{
			searchClassOff = false;
		}
		config.listArr = [];
		if(value==''){
			if(searchClassOff){
				config.listArr = [].concat(config.dataArr);
			}else{
				for(var dataI=0; dataI<config.dataArr.length; dataI++){
					if(typeof(config.dataArr[dataI][config.listAjax.classField]) == 'string' && config.dataArr[dataI][config.listAjax.classField].indexOf(',') > -1){
						//如果为,分割的字符串证明有多个分类id
						var classArray = config.dataArr[dataI][config.listAjax.classField].split(',');
						if(classArray.indexOf(config.selectClassID) > -1){
							config.listArr.push(config.dataArr[dataI]);
						}
					}else{
						if(config.dataArr[dataI][config.listAjax.classField]==config.selectClassID){
							config.listArr.push(config.dataArr[dataI]);
						}
					}
				}
			}
		}else{
			config.listArr = [];
			var isSearchPY = false; //是否拼音搜索
			if(config.listAjax.pyField){
				isSearchPY = true;
			}
			var isSearchWB = false;	//是否五笔搜索
			if(config.listAjax.wbField){
				isSearchWB = true;
			}
			//循环查找是否匹配
			for(var searchI=0; searchI<config.dataArr.length; searchI++){
				var isClassStr = false;//默认无可查询的分类
				var searchClassField = config.dataArr[searchI][config.listAjax.classField];
				if(typeof(searchClassField)!='string'){
					searchClassField = searchClassField.toString();
				}
				if(searchClassField.indexOf(',') > -1){
					//多个分类
					var classArr = config.dataArr[searchI][config.listAjax.classField].split(',');
					for(var classI=0; classI<classArr.length; classI++){
						if(config.selectClassID == classArr[classI]){
							//查询
							isClassStr = true;
						}
					}
				}else{
					if(config.dataArr[searchI][config.listAjax.classField] == config.selectClassID){
						isClassStr = true;
					}
				}
				//!searchClassOff && config.dataArr[searchI][config.listAjax.classField]!=config.selectClassID
				if(!searchClassOff && isClassStr == false){
					//如果有分类信息且不是当前分类
				}else{
					var isResult = false;
					var searchTextField = config.dataArr[searchI][config.listAjax.textField];
					if(typeof(searchTextField)!='string'){
						searchTextField = searchTextField.toString();
					}
					if(searchTextField.indexOf(value)>-1){
						isResult = true;
					}

					if(!isResult&&isSearchPY){ //只要有一个已经匹配，就不需要再往下搜索了
						if(config.dataArr[searchI][config.listAjax.pyField]){
							if(config.dataArr[searchI][config.listAjax.pyField].toLocaleUpperCase().indexOf(value.toLocaleUpperCase())>-1){
								isResult = true;
							}
						}
					}
					if(!isResult&&isSearchWB){
						if(config.dataArr[searchI][config.listAjax.wbField]){
							if(config.dataArr[searchI][config.listAjax.wbField].toLocaleUpperCase().indexOf(value.toLocaleUpperCase())>-1){
								isResult = true;
							}
						}
					}
					//如果任何一项匹配，则添加该条记录到listArr
					if(isResult){
						config.listArr.push(config.dataArr[searchI]);
					}
				}
			}
		}
		refreshList([0,evenPageLength-1]);
	}
	//快捷键处理
	function shortKeyHanlder(ev){
		switch(ev.keyCode){
			case 37:
				//左 上一页
				toPrevPage();
				break;
			case 39:
				//右 下一页
				toNextPage();
				break;
			case 38:
				//下 默认选中第一条
				//if()
				var $ready = $list.children('ul').children('li[ns-psid][class="ready"]');
				if($ready.length==0){
					setDefaultLastReadyLi();
				}else{
					toPrevLi();
				}
				
				break;
			case 40:
				//上，上一条
				var $ready = $list.children('ul').children('li[ns-psid][class="ready"]');
				if($ready.length==0){
					setDefaultReadyLi();
				}else{
					toNextLi();
				}
				break;
			case 13:
				//确认
				confirmHandler();
				break;
			case 27:
				//取消
				closeBtnHandler();
				break;
			case 32:
				//空格确认添加
				var $ready = $list.children('ul').children('li[ns-psid][class="ready"]');
				if($ready.length>0){
					var id = $ready.attr('ns-psid');
					selectAddList(id,$ready);
					refreshList();
					setDefaultReadyLi();
				}
		}
	}
	//获取面板HTML
	function getPlaneHtml(){
		var windowHeight = $(window).height();
		var planeHeight = 470;
		var planeStyleStr = '';
		
		//

		//获取面板代码
		var planeHtml = '';
		var titleHtml = getTitleHtml(); //title部分的HTML代码
		var listHtml = getListHtml();
		planeHtml = 
			'<div class="project-select-plane" id="'+config.id+'" style="'+planeStyleStr+'">'
				+titleHtml
				+'<div class="ps-body">'
					+'<div class="ps-list">'
						+listHtml
					+'</div>'
					+'<div class="arr">'
						+'<a class="arr-add none" href="javascript:void(0);" ns-target="all"><i class="fa fa-angle-double-right" aria-hidden="true"></i></a>'
						+'<a class="arr-add none" href="javascript:void(0);" ns-target="single"><i class="fa fa-angle-right" aria-hidden="true"></i></a>'
						+'<a class="arr-remove none" href="javascript:void(0);" ns-target="single"><i class="fa fa-angle-left" aria-hidden="true"></i></a>'
						+'<a class="arr-remove none" href="javascript:void(0);" ns-target="all"><i class="fa fa-angle-double-left" aria-hidden="true"></i></a>'
					+'</div>'
					+'<div class="ps-select">'
					+'</div>'
				+'</div>'
				+'<div class="ps-footer">'
					+'<div class="ps-help">'
						+'<span><i class="fa fa-keyboard-o" ></i> '+ language.ui.nsuiprojectselect.getPlaneHtmlSpanA+'</span><br>'
						+'<span><i class="fa fa-hand-o-up" ></i> '+language.ui.nsuiprojectselect.getPlaneHtmlSpanB+'</span>'
					+'</div>'
					+'<div class="ps-btn">'
						+'<button class="btn btn-success"><i class="fa fa-check"></i> '+language.ui.confirm+'</button>'
						+'<button class="btn btn-white"><i class="fa fa-ban"></i>'+language.ui.setDefaultCancel+'</button>'
					+'</div>'
				+'</div>'
			+'</div>';
		return planeHtml;
	}
	//------获取头部HTML代码 ps-title
	function getTitleHtml(){
		//标题部分HTML代码输出

		//判断class是否显示，如果显示，宽度是多少
		var classWidthStyle = '';
		if(typeof(config.classVisible)!='boolean'){
			config.classVisible = true;
		}

		var classHtml = '';
		if(config.classVisible){
			//如果显示
			var classListHtml = getClassListHtml(); //分类
			if(typeof(config.classWidth)=='number'){
				classWidthStyle = 'style="width:'+config.classWidth+'px; "';
			}else if(typeof(config.classWidth)=='string'){
				classWidthStyle = 'style="width:'+config.classWidth+'; "';
			}
			var getDefaultClassify = language.ui.nsuiprojectselect.getTitleHtmlClassify;
			if(!$.isEmptyObject(config.classAjax.value)){	
				if(typeof(config.classAjax.value)=='object'){
					if(config.classAjax.value[config.classAjax.textField]){
						getDefaultClassify = config.classAjax.value[config.classAjax.textField];
						config.selectClassID = config.classAjax.value[config.classAjax.valueField];
					}
				}
			}
			classHtml =
				'<div class="ps-select" '+classWidthStyle+'>'
					+'<button class="btn btn-default dropdown-toggle" type="button" id="'+config.childrenID.dropdown+'" data-toggle="dropdown">'
						+'<span class="name">'+ getDefaultClassify+'</span>'
						+'<span class="caret"></span>'
					+'</button>'
					+'<ul class="dropdown-menu" role="menu" aria-labelledby="'+config.childrenID.dropdown+'">'
						+classListHtml
					+'</ul>'
				+'</div>';
		}else{
			//如果不显示

		}
		//判断treeSelect是否显示，如果显示，宽度是多少
		var treeWidthStyle = '';
		if(typeof(config.treeVisible)!='boolean'){
			config.treeVisible = false;
		}
		//lyw
		var treeHtml = '';
		if(config.treeVisible){
			if(config.treeAjax){
				//如果显示
				if(typeof(config.treeAjax.treeWidth)=='number'){
					treeWidthStyle = 'style="width:'+config.treeAjax.treeWidth+'px; "';
				}else if(typeof(config.treeAjax.treeWidth)=='string'){
					treeWidthStyle = 'style="width:'+config.treeAjax.treeWidth+'; "';
				}
				config.treeAjax.id = "treeSelect";
				var treeCloseBtnID = 'form-' + config.childrenID.tree +'-treeSelect-tree-menuBtn';
				var treeNodeId = typeof(config.treeAjax.value) == 'undefined' ? '' : config.treeAjax.value;
				config.placeholder = typeof(config.placeholder) == 'string' ? config.placeholder : '';
				var treeID = 'form-' + config.childrenID.tree + '-treeSelect-tree';
				treeHtml = '<div class="ps-treeselect form-group">'
								+'<div class="form-item treeSelect">'
									+'<input class="form-control" '
									+treeWidthStyle
									+' name="form-'+config.childrenID.tree +'-treeSelect"'
									+' id="form-'+config.childrenID.tree+'-treeSelect"'
									+' placeholder="'+config.placeholder+'"'
									+' nodeid="'+treeNodeId+'"'
									+' type="text">'
									+'<a id="'+treeCloseBtnID+'" href="javascript:void(0)" class="treeselect-arrow">'
										+'<i class="fa fa-caret-down"></i>'
									+'</a>'
									// +'<ul id="'+treeID+'" class="ztree hide"></ul>'
								+'</div>'
							+'</div>';
			}else{
				nsAlert('没有配置树参数','error');
				console.error(config);
			}
		}else{
			//不显示
		}
		//title标题
		var titleText = language.ui.nsuiprojectselect.getTitleHtmlSelectItem+':';
		if(config.title === ''){
			//标题设置为空
			titleText = '';
		}
		if(config.title){
			titleText = config.title + ':';
		}
		var placeholderStr = language.ui.nsuiprojectselect.getTitleHtmlPlaceholderStr;
		if(typeof(config.searchPlaceHolder)=='string'){
			placeholderStr = config.searchPlaceHolder;
		}
		
		var searchHtml = '';
		if(typeof(config.searchVisible)!='boolean'){
			config.searchVisible = true;//默认显示搜索
		}
		if(config.searchVisible){
			//需要重新计算高度
			searchHtml = '<div class="ps-input">'
								+'<input type="text" id="aaa" name="aaa" placeholder="">'
								+'<button type="button"><i class="fa fa-search" aria-hidden="true"></i></button>'
							+'</div>';
		}
		
		var titleHtml = '<div class="ps-title">'
							+'<lable class="ps-label">'+titleText+'</lable>'
							+treeHtml
							+classHtml
							+searchHtml
							+'<a class="ps-close-btn" href="javascript:void(0);">x</a>'
						+'</div>';
		return titleHtml;
	}
	function getClassListHtml(){
		//标题部分 分类列表 HTML代码输出
		var classListHmtl = '';
		// if($.isArray(config.classArr)){
		// lyw 20180709 初始化时config.classArr默认[]数组 ， 所以按照数组长度判断
		if(config.classArr.length>0){
			for(var classI=0; classI<config.classArr.length; classI++){
				var className = config.classArr[classI][config.classAjax.textField];
				var classID = config.classArr[classI][config.classAjax.valueField];
				var hrefStr = 'javascript:nsUI.projectSelect.selectClass(\''+config.id+'\',\''+classID+'\',\''+className+'\');';
				classListHmtl+=
					'<li role="presentation" classID="'+classID+'">'
						+'<a role="menuitem" tabindex="-1" href="'+hrefStr+'">'+className+'</a>'
					+'</li>';
			}
			var allHrefStr = 'javascript:nsUI.projectSelect.selectClass(\''+config.id+'\',\'-1\',\''+language.ui.nsuiprojectselect.getTitleHtmlClassify+'\');';
			classListHmtl+=
				'<li role="presentation" class="divider"></li>'
				+'<li role="presentation">'
					+'<a role="menuitem" tabindex="-1" href="'+allHrefStr+'">'+language.ui.nsuiprojectselect.getTitleHtmlClassify+'</a>'
				+'</li>'
		}else{
			classListHmtl = 
				'<li role="presentation" classID="-1">'
					+'<a role="menuitem" tabindex="-1" href="javascript:void(0);">'
						+'<i class="fa fa-refresh fa-spin fa-3x fa-fw"></i> '+language.ui.loading+''
					+'</a>'
				+'</li>';
			getClassListAjax();
		}
		return classListHmtl;
	}
	function getClassListAjax(){
		//获取分类列表数据，刷新classArr数据
		//默认值
		//定义了url
		var data = config.classAjax.data?config.classAjax.data:'';
		var type = config.classAjax.type?config.classAjax.type:'post';
		var dataSrc = config.classAjax.dataSrc?config.classAjax.dataSrc:'rows';
		$.ajax({
			url:config.classAjax.url,
			data:data,
			type:type,
			success:function(data){
				var classListHmtl = '';
				if($.isArray(data[dataSrc])){
					//有分类信息
					config.classArr = data[dataSrc];
					classListHmtl = getClassListHtml();
				}else{
					//nsalert('分类信息不存在（classAjax.dataSrc：'+dataSrc+'）没有返回值  ','error');
					classListHmtl = '<li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:void(0);"><i class="fa fa-exclamation-circle"></i> '+language.ui.nsuiprojectselect.getClassListAjaxNoClassify+'</a></li>';
				};
				$('[aria-labelledby="'+config.childrenID.dropdown+'"]').html(classListHmtl);
				

			}
		})
	}
	//选中事件 外部可访问
	function selectClass(planeID,classID,className){
		//选中分类时间 改变selectClassID值
		$('#'+planeID+' .ps-title .ps-select button .name').html(className+' ');
		config.selectClassID = classID;
		searchValue();
	}
	//-------获取左侧列表HTML代码
	function getListHtml(indexArr){
		//indexArr数组
		var listHtml = '';
		if (config.dataArr.length>0) {
			//已经有了数组
			var start = 0;
			var end = 5;
			if(indexArr){
				start = indexArr[0];
				end = indexArr[1];
			}
			var moreHtml = '';
			if(end>=config.listArr.length-1){
				for(var moreI = config.listArr.length; moreI<=end; moreI++){
					moreHtml+=
						'<li><a href="javascript:void(0);">'
							+'<div class="index">'+(moreI+1)+'</div>'
							+'<div class="name"></div>'
						+'</a></li>'
				}
				end = config.listArr.length-1;
			}
			for(var i=start; i<=end; i++){
				var textStr = config.listArr[i][config.listAjax.textField]
				var valueStr = config.listArr[i][config.listAjax.valueField]
				var nullCls = config.listArr[i].isInResult?'null ':'';
				var selectedCls = config.listArr[i].isInSelect?'select':'';
				/**********2017-12-15 列表包含子元素*******************/
				var listChildHtml = '';
				var childLength = 0;//子元素长度
				if(config.listArr[i].hasChild){
					childLength = config.listArr[i][config.listAjax.childField].length;
				}
				if(childLength > 0){
					//长度大于0
					listChildHtml = '<span class="badge">'+childLength+'</span>';
				}
				/**********2017-12-15 列表包含子元素*******************/
				var liHtml = 
					'<li ns-psid="'+valueStr+'" class="'+nullCls+selectedCls+'"><a href="javascript:void(0);">'
						+'<div class="index">'+(i+1)+'</div>'
						+'<div class="name">'+textStr+listChildHtml+'</div>'
					+'</a></li>'
				listHtml+=liHtml;
			}
			listHtml = '<ul>'+listHtml+moreHtml+'</ul>';
			var listLength = config.listArr.length;
			//var pageLength = Math.ceil(config.listArr.length/10);
			//var currentPage = Math.ceil((start+1)/10);
			//pageLength
			var pageLength = Math.ceil(config.listArr.length/evenPageLength);
			var currentPage = Math.ceil((start+1)/evenPageLength);
			var lastJS = '';
			var lastCls = '';
			var nextJS = '';
			var nextCls = '';
			if(currentPage==1){
				lastJS = 'javascript:void(0);';
				lastCls = 'class="not"';
			}else{
				lastJS = 'javascript:nsUI.projectSelect.toPage('+(currentPage-1)+');';
			}
			if(currentPage==pageLength){
				nextJS = 'javascript:void(0);';
				nextCls = 'class="not"';
			}else{
				nextJS = 'javascript:nsUI.projectSelect.toPage('+(currentPage+1)+');';
			}
			if(config.listArr.length>0){
				listHtml += 
					'<div class="state">'
						+'<div class="page">'
							+'<a href="'+lastJS+'" '+lastCls+'>'
								+'<i class="fa fa-angle-left" aria-hidden="true"></i>'
							+'</a>'
						+'</div>'
						+'<div class="page">'
							+ currentPage+' / '+pageLength
						+'</div>'
						+'<div class="page">'
							+'<a href="'+nextJS+'" '+nextCls+'>'
								+'<i class="fa fa-angle-right" aria-hidden="true"></i>'
							+'</a>'
						+'</div>'
						+'<span> 共：'+listLength+'</span>'
					+'</div>';
			}else{
				listHtml += 
					'<div class="state">'
						+language.ui.nsuiprojectselect.getListHtmlSearch
					+'</div>';
			}
		}else{
			//发ajax获取数组
			listHtml = 
				'<div class="loading">'
					+'<i class="fa fa-refresh fa-spin"></i>'
					+'<p>'+language.ui.loading+'</p>'
				+'</div>';
			// getListAjax();
			if(config.treeVisible){
				getTreeDataByAjax();
			}else{
				if(config.listAjax.url){
					getListAjax();
				}
			}
		}
		return listHtml;
	}
	//发送ajax获取下拉树的数据
	function getTreeDataByAjax(){
		if(config.treeAjax){
			var data = typeof(config.treeAjax.data) == 'object' ? config.treeAjax.data : {};
			var type = typeof(config.treeAjax.treeType) == 'string' ? config.treeAjax.treeType : 'GET';
			var dataSrc = typeof(config.treeAjax.dataSrc) == 'string' ? config.treeAjax.dataSrc : 'rows';
			$.ajax({
				url:config.treeAjax.url,
				data:data,
				type:type,
				success:function(data){
					if(data.success){
						config.treeData = data[dataSrc];
						if(config.listAjax.url){
							getListAjax();
						}
					}	
				}
			})
		}
	}
	function toPage(pageID){
		//pageLength
		/*var start = (pageID-1)*10;
		var end = pageID*10-1;*/
		var start = (pageID-1)*evenPageLength;
		var end = pageID*evenPageLength-1;
		var indexArr = [start,end];
		refreshList(indexArr);
	}
	function getListError(error){
		//获取主要数据，列表信息错误
		if(config.listArr){
			config.listArr = [];
		}
		if(config.dataArr){
			config.dataArr = [];
		}
		var errorHtml = 
			'<div class="loading">'
				+'<i class="fa fa-exclamation-triangle"></i>'
				+'<p>'+error+'</p>'
			'</div>'
		$list.html(errorHtml)
	}
	function refreshList(indexArr){
		//indexArr是下标数组，第一个是开始，第二个是结束 [0,9]，指定输出行下标范围 读取config.listArr
		//如果为空，则刷新当前
		if(indexArr){
			config.listPageIndex = indexArr;
		}else{
			indexArr = config.listPageIndex;
		}
		listHtml = getListHtml(indexArr);
		$list.html(listHtml);
		var $li = $list.children('ul').children('li[ns-psid]');
		$li.on('click',function(ev){
			var liID = $(this).attr('ns-psid');
			if($(this).hasClass('null')){
				nsalert( language.ui.nsuiprojectselect.refreshList,'warning')
			}else{
				var timeStampStr = $(this).attr('timestamp');
				if(typeof(timeStampStr)=='string'){
					var currentTimestamp = new Date().getTime();
					var selectTimestamp = parseInt($(this).attr('timestamp'));
					if(currentTimestamp-selectTimestamp<500){
						//双击
						selectAddList(liID,this);
					}else{
						if($(this).hasClass('select')){
							//取消
							selectCancelList(liID,this);
						}else{
							//选中
							selectList(liID,this);
						}
					}
				}else{
					//选中
					selectList(liID,this);
				}
			}
		});
		var originalID;//存放原始点击的id
		if(config.listAjax.tooltip){
			$li.on('mouseenter',function(ev){
				ev.stopPropagation();
				var nsId = $(this).closest('li').attr('ns-psid');
				var target = $(this);
				var introJson = {
					nsId:nsId,
					target:target,
					event:ev,
					isParent:true,
					className:'ps-list-title'
				};
				fillPanelHtml(introJson);
			})
			$li.on('mouseleave',function(ev){
				if($('.ps-list-title').length > 0){
					$('.ps-list-title').remove();
				}
			})
		}
		//console.log(config.listAjax)
		$li.children('a').children('div.name').children('span').on('mouseenter',function(ev){
			ev.stopPropagation();
			var nsId = $(this).closest('li').attr('ns-psid');
			var target = $(this);
			//var isShow = true;//默认显示悬浮层
			//originalID = nsId;
			var introJson = {
				nsId:nsId,
				target:target,
				event:ev
			}
			fillPanelHtml(introJson);
			/*if(originalID === nsId){
				//判断悬浮层是否显示，如果显示则隐藏
				if($('.ps-intro').length > 0){
					isShow = false;
				}
			}
			if(isShow){
				//如果不相等
				
				$(document).on('click',{$container:target},function(ev){
					var $element = ev.data.$container;
					var dragel = $element[0];
					var target = ev.target;
					if(dragel != target && !$.contains(dragel,target)){
						$('.ps-intro').remove();
						$(document).off('click');
					}
				})
			}else{
				$('.ps-intro').remove();
			}*/
		});
		$li.children('a').children('div.name').children('span').on('mouseleave',function(ev){
			if($('.ps-intro').length > 0){
				$('.ps-intro').remove();
			}
		}); 
		//通过是否在结果中以及是否选中判断是否可以添加和批量添加 cy 20191104
		var isInSelectCount = 0;  //多少个选中的
		var isInResultCount = 0;  //多少个在结果中的
		for(var i = 0; i<config.dataArr.length; i++){
			var listData = config.dataArr[i];
			if(listData.isInSelect){
				isInSelectCount ++;
			}
			if(listData.isInResult){
				isInResultCount ++;
			}
		}
		//如果全部都在结果中则不能执行批量添加
		if(isInResultCount == config.dataArr.length){
			$arrAddAll.attr({'class':'arr-add none'});
		}else{
			$arrAddAll.attr({'class':'arr-add'});
		}
		if(isInSelectCount == 0){
			$arrAdd.attr({'class':'arr-add none'});
		}else{
			$arrAdd.attr({'class':'arr-add'});
		}
	}
	/***********2017-12-18 鼠标悬浮填充元素**********************/
	function fillPanelHtml(introJson){
		var nsId = introJson.nsId;
		var target = introJson.target;
		var currentOffset = target.offset();
		var parentOffset = target.closest('.project-select-plane').offset();
		var positionOffset = {
			left:currentOffset.left - parentOffset.left,
			top:currentOffset.top - parentOffset.top
		};
		var className = 'ps-intro';
		if(introJson.className){
			className = introJson.className;
		}
		var isParent = typeof(introJson.isParent)=='boolean' ? introJson.isParent : false;
		var outputHtml = '';
		var pointerStyleStr = '';
		if(isParent){
			outputHtml = '<p>'+config.dataArr[config.dataKey[nsId]][config.listAjax.textField]+'</p>';
			pointerStyleStr = ' pointer-events:none;';
		}else{
			var currentArr = config.dataArr[config.dataKey[nsId]][config.listAjax.childField];
			var liHtml = '';
			for(var curI=0; curI<currentArr.length; curI++){
				liHtml += '<li ns-psid="'+currentArr[curI][config.listAjax.valueField]+'" ns-pid="'+nsId+'">'+currentArr[curI][config.listAjax.textField]+'</li>';
			}
			outputHtml = '<ul>'+liHtml+'</ul>';
		}
		var positionStyle = 'left:'+positionOffset.left+'px;';  	//left			
		positionStyle += ' top:'+positionOffset.top+'px;';			//top
		var html = '<div class="'+className+'" style="'+positionStyle+' '+pointerStyleStr+'">'+outputHtml+'</div>';
		if($('.'+className).length > 0){$('.'+className).remove()}
		$('#'+config.id).append(html);
		/*$('#'+config.id).children('.ps-intro').children('ul').children('li[ns-psid]').on('click',function(ev){
			var nId = $(this).attr('ns-psid');
			var pId = $(this).attr('ns-pid');
			console.log('current:'+nId+',pId:'+pId)
		})*/
	}
	/***********2017-12-18 鼠标悬浮填充元素**********************/
	//逐条添加
	function arrAddHandler(ev){
		if($(this).hasClass('none')){
			nsalert(language.ui.nsuiprojectselect.arrAddHandler,'warning')
		}else{
			var removeObj = {};
			//先组织数据，后执行添加和删除
			for(var slI=0; slI<config.selectedListArr.length; slI++){
				var id = config.selectedListArr[slI][config.listAjax.valueField];
				var liDOM = $('#'+config.id+' [ns-psid="'+id+'"]');
				removeObj[id] = {};
				removeObj[id].id = config.selectedListArr[slI][config.listAjax.valueField];
				removeObj[id].liDOM = $('#'+config.id+' [ns-psid="'+id+'"]');
			}
			var isContinue = true;
			if(config.maximumItem > 0){
				if(config.resultArr.length + config.selectedListArr.length > config.maximumItem){
					isContinue = false;
				}
			}
			if(isContinue){
				$.each(removeObj,function(key,value){
					selectAddList(value.id,value.liDOM);
				})
			}else{
				nsalert(language.ui.nsuiprojectselect.maximumItem,'warning');
			}
			delete removeObj;
		}
	}
	//逐条删除
	function arrRemoveHandler(ev){
		if($(this).hasClass('none')){
			nsalert(language.ui.nsuiprojectselect.arrAddHandler,'warning')
		}else{
			var removeObj = {};
			//先组织数据，后执行添加和删除
			for(var slI=0; slI<config.selectedResultArr.length; slI++){
				var id = config.selectedResultArr[slI][config.listAjax.valueField];
				var liDOM = $('#'+config.id+' [ns-psid="'+id+'"]');
				removeObj[id] = {};
				removeObj[id].id = config.selectedResultArr[slI][config.listAjax.valueField];
				removeObj[id].liDOM = $('#'+config.id+' [ns-psid="'+id+'"]');
			}
			$.each(removeObj,function(key,value){
				selectRemoveResult(value.id,value.liDOM);
			})
			delete removeObj;
		}
	}
	//全部添加 20191104 cy
	function arrAddAllHandler(ev){
		config.dataArr = config.listArr;
		for(var i = 0; i<config.dataArr.length; i++){
			var listData = config.dataArr[i];
			listData.isInResult = true;
			if(listData.isInSelect){
				listData.isInSelect = false;
			}
			config.resultArr.push(listData);
		}
		refreshList();
		refreshResult();
	}
	//全部删除 20191104 cy
	function arrRemoveAllHandler(ev){
		config.dataArr = config.listArr;
		for(var i = 0; i<config.dataArr.length; i++){
			var listData = config.dataArr[i];
			if(listData.isInResult){
				listData.isInResult = false;
			}
			if(listData.isInSelect){
				listData.isInSelect = false;
			}
		}
		refreshList();
		config.resultArr = [];
		refreshResult();
	}
	//备选列表-选中
	function selectList(id,liDOM){
		var currentItem = config.dataArr[config.dataKey[id]];
		currentItem.isInSelect = true;
		$list.find('.ready').removeClass('ready');
		$(liDOM).addClass('select');
		$(liDOM).attr('timestamp',new Date().getTime());
		config.selectedListArr.push(currentItem);
		$arrAddAll.removeClass("none");
		$arrAdd.removeClass("none");
	}
	//备选列表-取消
	function selectCancelList(id,liDOM){
		var currentItem = config.dataArr[config.dataKey[id]];
		currentItem.isInSelect = false;
		$(liDOM).removeClass('select');
		$(liDOM).attr('timestamp',new Date().getTime());
		var currentIndex;
		for(var i=0; i<config.selectedListArr.length; i++){
			if(config.selectedListArr[i]==currentItem){
				currentIndex = i;
			}
		}
		config.selectedListArr.splice(currentIndex,1)
		if(config.selectedListArr.length==0){
			$arrAdd.addClass("none");
		}
	}
	//确认添加到已选择列表
	function selectAddList(id,liDOM){
		var currentItem;
		currentItem = config.dataArr[config.dataKey[id]];
		config.resultArr.push(currentItem);
		//从备选数组中删除当前对象
		var currentSLIndex;
		for(var slI=0; slI<config.selectedListArr.length; slI++){
			if(config.selectedListArr[slI]==currentItem){
				currentSLIndex = slI;
			}
		}
		config.selectedListArr.splice(currentSLIndex,1);
		currentItem.isInResult = true;
		currentItem.isInSelect = false;
		if(config.selectedListArr.length==0){
			$arrAdd.addClass("none");
		}
		refreshResult();
		if(liDOM){
			//处理DOM对象
			$(liDOM).attr('class','null');
		}
	}
	//sjj20181031 编辑config.resultArr结果值然后执行刷新数据
	function refreshResultData(dataArr){
		config.resultArr = dataArr;
		refreshResult();
	}
	//刷新结果列表
	function refreshResult(){
		var plusComponentType = config.plusComponentType;//附加组件类型
		var listHtml = '';
		var selectHtml = '';
		if(plusComponentType){
			selectHtml = '<span class="plus-component-icon"></span>';
		}
		for(var resultI = 0; resultI<config.resultArr.length; resultI++){
			var textStr = config.resultArr[resultI][config.listAjax.textField];
			var valueStr = config.resultArr[resultI][config.listAjax.valueField];
			var selectedCls = config.resultArr[resultI].isInSelect?'select':'';
			/***************2017-12-15 读取子元素*****************************/
			var childrenArr = [];
			var childrenHtml = '';
			if(config.resultArr[resultI].hasChild){
				childrenArr = config.resultArr[resultI][config.listAjax.childField];
			}
			var selectListDataArr = config.dataArr[config.dataKey[valueStr]][config.listAjax.childField];
			for(var childI=0; childI<childrenArr.length; childI++){
				var childTextStr = childrenArr[childI][config.listAjax.textField];
				var childValueStr = childrenArr[childI][config.listAjax.valueField];
				var boolSelect = typeof(childrenArr[childI][config.listAjax.selectField]) == 'boolean' ? childrenArr[childI][config.listAjax.selectField] : false;
				var selectedStr = boolSelect ? 'select' : '';
				if(selectListDataArr[childI].isInSelect  == true){selectedStr = 'select';}
				childrenHtml += '<li ns-psid="'+childValueStr+'" ns-pid="'+valueStr+'" class="ps-select-child '+selectedStr+'"><a href="javascript:void(0);">'
								+'<div class="name">'
									+childTextStr
								+'</div>'
							+'</a></li>';

			}
			//sjj20181031 针对选中值回显 适用于自定义组件显示的回显补充方法
			var plusComponentTypeHtml = '';
			if(typeof(config.plusComponentConfig)=='object'){
				if(config.resultArr[resultI][config.plusComponentConfig.textField]){
					plusComponentTypeHtml = '<span class="plus-component-text">'+config.resultArr[resultI][config.plusComponentConfig.textField]+'</span>';
				}
			}
			/***************2017-12-15 读取子元素*****************************/
			var liHtml = 
				'<li ns-psid="'+valueStr+'" class="'+selectedCls+'"><a href="javascript:void(0);">'
					+'<div class="index">'+(resultI+1)+'</div>'
					+'<div class="name">'
						+textStr
						+plusComponentTypeHtml
						+selectHtml
					+'</div>'
				+'</a></li>'
				+childrenHtml;
			listHtml+=liHtml;
		}
		listHtml = '<ul>'+listHtml+'</ul>'
		$result.html(listHtml);
		//sjj 20190415 允许选择的最大条数
		if(config.maximumItem > 0){
			//sjj 20190415设置了允许做多选择数量
			if(config.resultArr.length > config.maximumItem){
				$list.attr('disabled',true);
				nsalert(language.ui.nsuiprojectselect.maximumItem,'warning');
			}else{
				$list.removeAttr('disabled');
			}
		}
		$result.children('ul').children('li[ns-psid]').not('.ps-select-child').on('click',function(ev){
			var liID = $(this).attr('ns-psid');
			var timeStampStr = $(this).attr('timestamp');
			if(typeof(timeStampStr)=='string'){
				var currentTimestamp = new Date().getTime();
				var selectTimestamp = parseInt($(this).attr('timestamp'));
				if(currentTimestamp-selectTimestamp<500){
					//双击
					selectRemoveResult(liID,this);
				}else{
					if($(this).hasClass('select')){
						//取消
						selectCancelResult(liID,this);
					}else{
						//选中
						selectResult(liID,this);
					}
				}
			}else{
				//选中
				selectResult(liID,this);
			}
		});
		/**************2017-12-15 选中取消子元素***************************/
		$result.children('ul').children('li.ps-select-child').on('click',function(ev){
			var $this = $(this);
			var liID = $this.attr('ns-psid');
			var pID = $this.attr('ns-pid');
			var childItemArray = config.dataArr[config.dataKey[pID]][config.listAjax.childField];
			var currentItem = childItemArray[config.dataKey[liID]];
			if($this.hasClass('select')){
				//取消选中操作
				currentItem.isInSelect = false;
				$this.removeClass('select');
			}else{
				//添加选中
				currentItem.isInSelect = true;
				$this.addClass('select');
			}

			//sjj 20181112针对项目添加子级项目分类是否全选问题的处理
			var childSelectLength = 0;
			for(var childI=0; childI<childItemArray.length; childI++){
				if(childItemArray[childI].isInSelect){
					childSelectLength ++;
				}
			}
			if(childSelectLength == 0){
				//选中的长度为0 
				$this.siblings('[ns-psid="'+pID+'"]').removeAttr('class');
			}else{
				$this.siblings('[ns-psid="'+pID+'"]').attr('class','half-select');
			}
		})
		/**************2017-12-15 选中取消子元素**************************/
		/**************2018-09-08 追加下拉框 start**************************/
		var $li = $result.children('ul').children('li[ns-psid]');
		$li.children('a').children('div.name').children('span').on('click',function(ev){
			ev.stopPropagation();
			var nsId = $(this).closest('li').attr('ns-psid');
			var target = $(this);
			var introJson = {
				nsId:nsId,
				target:target,
				event:ev
			}
			var nsId = introJson.nsId;
			var target = introJson.target;
			var currentOffset = target.offset();
			var parentOffset = target.closest('.project-select-plane').offset();
			var positionOffset = {
				left:currentOffset.left - parentOffset.left,
				top:currentOffset.top - parentOffset.top
			}
			var positionStyle = 'left:'+positionOffset.left+'px;';  				//top
			positionStyle += ' top:'+positionOffset.top+'px;';					//left
			var selectConfig = config.plusComponentConfig;
			var currentArr = selectConfig.subdata;
			function getPlusComponentInit(currentArr){
				var liHtml = '';
				var jsonData = {};
				for(var curI=0; curI<currentArr.length; curI++){
					jsonData[currentArr[curI][selectConfig.valueField]] = currentArr[curI];
					liHtml += '<li ns-psid="'+currentArr[curI][selectConfig.valueField]+'" ns-pid="'+nsId+'">'+currentArr[curI][selectConfig.textField]+'</li>';
				}
				var html = '<div class="ps-intro" style="'+positionStyle+'"><ul>'+liHtml+'</ul></div>';
				if($('.ps-intro').length > 0){$('.ps-intro').remove();}
				$('#'+config.id).append(html);
				$('#'+config.id).children('.ps-intro').children('ul').children('li[ns-psid]').on('click',function(ev){
					var $this = $(this);
					var nId = $this.attr('ns-psid');
					var pId = $this.attr('ns-pid');
					for(var resultI=0; resultI<config.resultArr.length; resultI++){
						if(config.resultArr[resultI][config.listAjax.valueField] == pId){
							for(var data in jsonData[nId]){
								config.resultArr[resultI][data] = jsonData[nId][data];
							}
						}
					}
					var spanHtml = '<span class="plus-component-text">'+jsonData[nId][selectConfig.textField]+'</span>';
					var $cLi = $result.children('ul').children('li[ns-psid="'+pId+'"]');
					$cLi.find('.plus-component-text').remove();
					$cLi.find('.plus-component-icon').before(spanHtml);
					$this.closest('.ps-intro').remove();
				})
			}
			if(selectConfig.url){
				var ajaxData = {
					url:selectConfig.url, //请求的数据链接
					type:selectConfig.method,
					data:selectConfig.data,
					dataType:'json',
					context:selectConfig,
					success:function(data){
						var selectConfig = this;
						if(data.success){
							var currentArr = [];
							if(typeof(selectConfig.dataSrc)!='string'){
								currentArr = data;
							}else{
								currentArr = data[selectConfig.dataSrc];
							}
							if(!$.isArray(currentArr)){
								currentArr = [];
							}
							getPlusComponentInit(currentArr);
						}
					},
					error: function (error) {
						nsalert(language.common.nscomponent.part.selectajaxError,'error');
						if(debugerMode){
							console.log(error);
							console.log(this);
							console.error(config);
						}
					}
				}
				if(selectConfig.contentType){
					if(selectConfig.contentType == 'application/json'){
						ajaxData.contentType = 'application/json';
						ajaxData.data = JSON.stringify(ajaxData.data);
					}
				}
				$.ajax(ajaxData);
			}else{
				if($.isArray(currentArr)){
					getPlusComponentInit(currentArr);
				}
			}
		});

		if(config.resultArr.length == 0){
			$arrRemoveAll.attr({"class":"arr-remove none"});
		}else{
			$arrRemoveAll.attr({"class":"arr-remove"});
		}
		
		/**************2018-09-08 追加下拉框 end**************************/
	}
	//结果列表-选中
	function selectResult(id,liDOM){
		var currentItem = config.dataArr[config.dataKey[id]];
		currentItem.isInSelect = true;
		$(liDOM).attr('class','select');
		$(liDOM).attr('timestamp',new Date().getTime());
		config.selectedResultArr.push(currentItem);
		$arrRemove.removeClass("none");
		//如果当前对象中含有子集对象 sjj20181112
		if($.isArray(currentItem[config.listAjax.childField])){
			$(liDOM).siblings('li[ns-pid="'+id+'"]').addClass('select');
			for(var itemI=0; itemI<currentItem[config.listAjax.childField].length; itemI++){
				currentItem[config.listAjax.childField][itemI].isInSelect = true;
			}
		}
	}
	//结果列表-取消
	function selectCancelResult(id,liDOM){
		var currentItem = config.dataArr[config.dataKey[id]];
		currentItem.isInSelect = false;
		$(liDOM).removeAttr('class');
		$(liDOM).attr('timestamp',new Date().getTime());
		var currentIndex;
		for(var i=0; i<config.selectedResultArr.length; i++){
			if(config.selectedResultArr[i]==currentItem){
				currentIndex = i;
			}
		}
		config.selectedResultArr.splice(currentIndex,1)
		if(config.selectedResultArr.length==0){
			$arrRemove.addClass("none");
		}
		//如果当前对象中含有子集对象 sjj20181112
		if($.isArray(currentItem[config.listAjax.childField])){
			$(liDOM).siblings('li[ns-pid="'+id+'"]').removeClass('select');
			for(var itemI=0; itemI<currentItem[config.listAjax.childField].length; itemI++){
				currentItem[config.listAjax.childField][itemI].isInSelect = false;
			}
		}
	}
	//结果列表-删除
	function selectRemoveResult(id,liDOM){
		var currentItem;
		currentItem = config.dataArr[config.dataKey[id]];
		//从结果数组中删除当前对象
		var currentResultIndex;
		for(var srI=0; srI<config.resultArr.length; srI++){
			if(config.resultArr[srI]==currentItem){
				currentResultIndex = srI;
			}
		}
		config.resultArr.splice(currentResultIndex,1);
		//从备选数组中删除当前对象
		var currentSLIndex;
		for(var slI=0; slI<config.selectedResultArr.length; slI++){
			if(config.selectedResultArr[slI]==currentItem){
				currentSLIndex = slI;
			}
		}
		config.selectedResultArr.splice(currentSLIndex,1);
		if($.isArray(currentItem.children)){
			for(var childI=0; childI<currentItem[config.listAjax.childField].length; childI++){
				currentItem[config.listAjax.childField][childI].isInSelect = false;
			}
		}
		
		currentItem.isInResult = false;
		currentItem.isInSelect = false;
		if(config.selectedResultArr.length==0){
			$arrRemove.addClass("none");
		}
		refreshResult();
		refreshList();
	}

	function getListData(dataArray){
		if($.isArray(dataArray)){
			//有分类信息
			if(dataArray.length>0){
				config.dataArr = dataArray;
				config.dataKey = {};//根据id值得到数组索引

				for(var keyI = 0; keyI<config.dataArr.length; keyI++){
					config.dataKey[config.dataArr[keyI][config.listAjax.valueField]] = keyI;
					/***********************2017-12-15 键对值**************************/
					config.dataArr[keyI].hasChild = false;
					if($.isArray(config.dataArr[keyI][config.listAjax.childField])){
						config.dataArr[keyI].hasChild = true;
						var childArr = config.dataArr[keyI][config.listAjax.childField];
						for(var childI=0; childI<childArr.length; childI++){
							config.dataKey[childArr[childI][config.listAjax.valueField]] = childI;
							childArr[childI].isInSelect = childArr[childI][config.listAjax.selectField];
						}
					}
					/***********************2017-12-15 键对值**************************/
				}

				//如果有默认选中值，转换数据，刷新结果列表
				if(config.resultArr.length == 0){ //lyw
					if(config.selected&&config.selected!=''&&config.selected!='[]'){
						var selectedStr = config.selected;
						selectedStr = selectedStr.substring(1,selectedStr.length-1);
						var resultArr = selectedStr.split(",");

						config.resultArr = [];
						for(var resultI = 0; resultI<resultArr.length; resultI++){
							var valueStr = resultArr[resultI];
							valueStr = valueStr.replace(/'/g,"");
							valueStr = valueStr.replace(/"/g,'');
							var result = config.dataArr[config.dataKey[$.trim(valueStr)]];
							if(typeof(result)=='object'){
								result.isInResult = true; //修改在结果集状态
								config.resultArr.push(result);
							}else{
								nsalert('id：'+valueStr+language.ui.nsuiprojectselect.getListAjax,'error');
							}
							
						}
						refreshResult();
					}
				}

				//刷新列表
				if(config.selectClassID != '-1'){
					config.listArr = []; // 清空listArr lyw 20181108
					for(var dataI=0; dataI<config.dataArr.length; dataI++){
						if(config.dataArr[dataI][config.listAjax.classField].indexOf(',') > -1){
							//如果为,分割的字符串证明有多个分类id
							if(config.dataArr[dataI][config.listAjax.classField].indexOf(config.selectClassID) > -1){
								config.listArr.push(config.dataArr[dataI]);
							}
						}else{
							if(config.dataArr[dataI][config.listAjax.classField]==config.selectClassID){
								config.listArr.push(config.dataArr[dataI]);
							}
						}
					}
				}else{
					config.listArr = [].concat(dataArray);
				}
				refreshList([0,evenPageLength-1]);
				if(typeof(config.$container)!='object'){
					setDefaultReadyLi();
				}
			}else{
				getListError(language.ui.nsuiprojectselect.getListErrorA);
			}
		}else{
			getListError(language.ui.nsuiprojectselect.getListErrorB);
		};
	}
	// 获得树默认选择value的数据所对应的ajaxDataField字段对应的数据 lyw
	function getTreeSelectData(treeData){
		if(config.treeAjax){
			if(typeof(treeData)=='undefined' && typeof(config.treeAjax.value) != 'undefined'){
				var treeData = {};
				function getToAjaxData(treeArray){
					for(var i=0;i<treeArray.length;i++){
						if(config.treeAjax.value == treeArray[i][config.treeAjax.valueField]){
							if($.isArray(config.treeAjax.ajaxDataField)){
								for(var j=0;j<config.treeAjax.ajaxDataField.length;j++){
									treeData[config.treeAjax.ajaxDataField[j]] = treeArray[i][config.treeAjax.ajaxDataField[j]];
								}
							}
							if(typeof(config.treeAjax.ajaxDataField) == "string"){
								treeData[config.treeAjax.ajaxDataField] = treeArray[i][config.treeAjax.ajaxDataField];
							}
							break;
						}
						if($.isArray(treeArray[i].children)){
							getToAjaxData(treeArray[i].children);
						}
					}
				}
				getToAjaxData(config.treeData);
			}
			return treeData;
		}
	}
	function getListAjax(treeData){
		//获取列表数据，刷新listArr数据
		//默认值
		if(config.treeVisible){
			getTreeSelectData(treeData); // 获得树默认选择value的数据所对应的ajaxDataField字段对应的数据 lyw
			/*** 
			 * 修改前 获得树默认选择value的数据所对应的ajaxDataField字段对应的数据 lyw
			 * if(typeof(treeData)=='undefined' && typeof(config.treeAjax.value) != 'undefined'){
			 * 	var treeData = {};
			 * 	function getToAjaxData(treeArray){
			 * 		for(var i=0;i<treeArray.length;i++){
			 * 			if(config.treeAjax.value == treeArray[i][config.treeAjax.valueField]){
			 * 				if($.isArray(config.treeAjax.ajaxDataField)){
			 * 					for(var j=0;j<config.treeAjax.ajaxDataField.length;j++){
			 * 						treeData[config.treeAjax.ajaxDataField[j]] = treeArray[i][config.treeAjax.ajaxDataField[j]];
			 * 					}
			 * 				}
			 * 				if(typeof(config.treeAjax.ajaxDataField) == "string"){
			 * 					treeData[config.treeAjax.ajaxDataField] = treeArray[i][config.treeAjax.ajaxDataField];
			 * 				}
			 * 				break;
			 * 			}
			 * 			if($.isArray(treeArray[i].children)){
			 * 				getToAjaxData(treeArray[i].children);
			 * 			}
			 * 		}
			 * 	}
			 * 	getToAjaxData(config.treeData);
			 * }
			***/
		}
		var data = typeof(config.listAjax.data) == 'object'?config.listAjax.data:{};
		var type = typeof(config.listAjax.type) == 'string'?config.listAjax.type:'post';
		var dataSrc = typeof(config.listAjax.dataSrc) == 'string'?config.listAjax.dataSrc:'rows';
		if(!$.isEmptyObject(treeData)){
			for(key in treeData){
				data[key] = treeData[key];
			}
		}
		//定义了url
		$.ajax({
			url:config.listAjax.url,
			data:data,
			type:type,
			success:function(data){
				getListData(data[dataSrc]);
				//$('[aria-labelledby="'+config.childrenID.dropdown+'"]').html(classListHmtl);
			},
			error:function(error){
				getListError(language.ui.nsuiprojectselect.getListErrorC);
			}
		})
	}
	//返回选中数据
	function getData() {
		var returnArr = config.resultArr;
		if(config.resultArr.length==0){
			returnArr = false;
		}
		return returnArr;
	}
	function getDataIDs() {
		var idsArr = [];
		var idsStr = false
		for(var i=0; i<config.resultArr.length; i++){
			idsArr.push(config.resultArr[i][config.listAjax.valueField]);
		}
		if(idsArr.length==0){
			idsStr = false;
		}else{
			idsArr = idsArr.sort();
			idsStr = idsArr.join(',');
		}
		return idsStr;
	}
	return {
		init:init,  				//初始化方法
		selectClass:selectClass,  	//选中分类
		toPage:toPage, 				//跳转分页
		clear:clear, 				//清除操作数据，下次点击初始化
		getData:getData, 			//返回选中数据
		getDataIDs:getDataIDs, 		//返回选中数据字符串
		refreshResultData:refreshResultData,//刷新结果数据
	}
})(jQuery);