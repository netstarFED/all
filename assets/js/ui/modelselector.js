/*******模型选择器 UI start**************/
/*****
*组成分3部分 
*输出元素部分包含标题+内容+按钮 
*面板事件有：关闭 确认 取消
*操作事件有：选择车型，品牌，车系，型号，排量，年款 
*标题和按钮是不变的，内容根据操作的事件来改变
*默认展示的是选择主类型
******/
nsUI.modelSelector = (function($){
	var config;																	//配置参数
	var $closePlane;															//关闭面板
	var $plane;																	//面板容器
	var $planeContent;															//内容
	var $checkbox;																//复选框
	var $showResult;															//结果显示
	var $breadcrumb;															//内容面包屑导航
	var $tabChecked;															//内容区域所有已勾选
	var $allCheckbox;															//全选的checkbox
	var resultListJson = {};													//结果值
	var dataByIdData = {};														//根据id存放数据
	var dataArr = [];															//当前查询结果值
	//清空初始化定义值
	function clearPlane(){
		config = undefined;	
		$closePlane = undefined;
		$plane = undefined;
		$planeContent = undefined;
		$checkbox = undefined;
		$showResult = undefined;
		$breadcrumb = undefined;
		$tabChecked = undefined;
		$allCheckbox = undefined;
		resultListJson = {};
		dataArr = [];
	}
	//初始化调用
	function init(configObj){
		clearPlane();															//先清空
		config = configObj;
		var widthStr = '';														//面板的宽度
		var marginStr = '';														//面板的左边距偏移量
		/**************面板宽度和左边距的计算 start*************************************************/
		switch(config.size){
			case 's':
				widthStr = 'width:400px;';
				marginStr = 'margin-left:-200px;';
				break;
			case 'm':
				widthStr = 'width:600px;';
				marginStr = 'margin-left:-300px;';
				break;
			case 'b':
				widthStr = 'width:800px;';
				marginStr = 'margin-left:-400px;';
				break;
			default:
				widthStr = 'width:800px;';
				marginStr = 'margin-left:-400px;';
				break;
		}		
		/**************面板宽度和左边距的计算  end**************************************************/
		var styleStr = 'style="'+widthStr+''+marginStr+'"';						//面板的内嵌样式	
		config.treeType = typeof(config.treeType) == 'string' ? config.treeType : 'POST';	//默认post请求
		config.data = typeof(config.data) == 'object' ? config.data : {};		//默认请求的参数
		config.url = typeof(config.url) == 'string' ? config.url : '';			//默认url链接
		config.conditionField = typeof(config.conditionField) == 'string' ? config.conditionField : '';	//默认条件字段
		config.levelField = typeof(config.levelField) == 'string' ? config.levelField : '';				//等级
		config.isClear = typeof(config.isClear)=='boolean' ? config.isClear : false;//默认不清空
		config.parentId = config.valueField;
		if(typeof(config.value)=='object'){
			if(!$.isEmptyObject(config.value)){
				//不为空
				var idsArr = [];
				if(typeof(config.value.id) == 'string'){
					if(config.value.id !==''){
                        idsArr = config.value.id.split(',');
					}
				}
				var valArr = [];
				if(typeof(config.value.value) == 'string'){
					if(config.value.value !== ''){
                        valArr = config.value.value.split(',');
					}
				}
				for(var idI=0; idI<idsArr.length; idI++){
					resultListJson[idsArr[idI]] = {
						id:idsArr[idI],
						value:valArr[idI]
					}
				}
			}
		}
		if(config.url == ''){
			return false;
		}
		/**************面板的输出html  start********************************************************/
		var titleHtml = getTitleHtml();											//面板标题
		var mainTitlehtml = getMainTitle();										//面板内容区域的面包屑
		var confirmFooterHtml = showResultHtml();								//显示搜索结果
		var footerBtnHtml = getFooterBtnHtml();									//按钮
		var loadHtml = getLoadingHtml();										//正在加载
		var contentHtml = '<div class="model-selector-detail">'
							+mainTitlehtml
							+'<div class="car-content">'+loadHtml+'</div>';
						+'</div>';
		var footerHtml = '<div class="car-footer">'+confirmFooterHtml+footerBtnHtml+'</div>';
		var containerHtml = '<div class="model-selector-plane" '+styleStr+'>'
								+titleHtml
								+contentHtml
								+footerHtml
							+'</div>';
		/**************面板的输出html  end**********************************************************/
		/**************弹框面板只能有一个  start****************************************************/
		if($('.model-selector-plane').length == 1){
			$('.model-selector-plane').remove();
		}
		if(typeof(config.container) == 'object'){
			//如果容器存在
			config.container.html(containerHtml);
		}else{
			$('body').append(containerHtml);
		}
		//按钮html
		var btnsJson = {
			id:'model-selector-button',
			isShowTitle:false,
			btns:[
				[
					{
						text:'确认',
						handler:confirmHandler
					},
					{
						text:'取消',
						handler:cancelHandler
					}
				]
			]
		};
		controlPlane.formNavInit(btnsJson);
		/**************弹框面板只能有一个  end******************************************************/
		/**************面板事件  start**************************************************************/
		$plane = $('.model-selector-plane');													//主面板
		$closePlane = $('[ns-control="model-selector-close"]');									//面板关闭
		$closePlane.off('click');					
		$closePlane.on('click',closePlane);
		$showResult = $('#confirm-list');														//结果
		$planeContent = $('.model-selector-detail').children('.car-content');					//内容区域 
		$breadcrumb = $('#car-breadcrumb');														//面包屑
		getAjax();																				//当前显示的活动内容区域
		/**************面板事件  end****************************************************************/
	}
	//正在加载
	function getLoadingHtml(){
		var html =  
			'<div class="input-loading">'
				+'<i class="fa fa-circle-o-notch fa-spin fa-fw"></i>'
			+'</div>'
		return html;
	}
	//按字母搜索
	function firstSpellHtml(){
		var letterHtml = '<ul class="first-spell" id="first-spell">'
							+'<li id="A">A</li>'
							+'<li id="B">B</li>'
							+'<li id="C">C</li>'
							+'<li id="D">D</li>'
							+'<li id="F">F</li>'
							+'<li id="G">G</li>'
							+'<li id="H">H</li>'
							+'<li id="J">J</li>'
							+'<li id="K">K</li>'
							+'<li id="L">L</li>'
							+'<li id="M">M</li>'
							+'<li id="N">N</li>'
							+'<li id="O">O</li>'
							+'<li id="P">P</li>'
							+'<li id="Q">Q</li>'
							+'<li id="R">R</li>'
							+'<li id="S">S</li>'
							+'<li id="T">T</li>'
							+'<li id="W">W</li>'
							+'<li id="X">X</li>'
							+'<li id="Y">Y</li>'
							+'<li id="Z">Z</li>'
						+'</ul>';
		return letterHtml;
	}
	//标题部分
	function getTitleHtml(){
		var titleStr = typeof(config.title) == 'string' ? config.title : '';
		var titleHtml = '<div class="model-selector-title">'
							+'<label>'+titleStr+'</label>'
							+'<a class="model-selector-close" href="javascript:void(0);" ns-control="model-selector-close">x</a>'
						+'</div>';
		return titleHtml;
	}
	//内容主标题
	function getMainTitle(){
		var tId = config.data[config.parentId];
		if(typeof(tId) == 'undefined'){tId = '';}
		var titleArr = config.titleArr;
		var isTitle = true;
		var liHtml = '';
		if($.isArray(titleArr)){
			if(titleArr.length == 0){
				isTitle = false;
			}
		}else{
			isTitle = false;
		}
		if(isTitle == true){
			liHtml = '<li class="tag-title level-choose-on" ts-index="0" ts-id="'+tId+'">'+titleArr[0]+'</li>';
			for(var liI=1; liI<titleArr.length; liI++){
				liHtml += '<li class="tag-title" ts-index="'+liI+'">'+titleArr[liI]+'</li>';
			}
		}
		var titleHtml = '<ul class="car-breadcrumb" id="car-breadcrumb">'+liHtml+'</ul>';
		var mainTitlehtml = '<div class="car-title">'
								+titleHtml
								+'<label class="checkbox-inline" for="model-selector-carmodels">全选</label>'
								+'<input type="checkbox" id="model-selector-carmodels" value="all" name="models-choose-checkbox" class="checkbox-options" />'
							+'</div>';
		return mainTitlehtml;
	}
	//默认显示内容
	function getAjax(){
		$.ajax({
            url:config.url, //请求的数据链接
            type:config.treeType,
            data:config.data,
            dataType:'json',
            context:config,
            success:function(data){
                config = this;
                if(typeof(config.dataSrc)!='string'){
                    dataArr = data;
                }else{
                    dataArr = data[config.dataSrc];
                }

                //放数据
                for(var dataI=0; dataI<dataArr.length; dataI++){
                	dataByIdData[dataArr[dataI][config.valueField]] = dataArr[dataI];
                }

                if(config.levelField){
                    //存在等级字段
                    if(data[config.levelField]){
                        var levelNumber = Number(data[config.levelField]);	//等级必须是数字
                        if(levelNumber >= 0){
                            //是数值
                            var $level = $breadcrumb.children('li[ts-index="'+data[config.levelField]+'"]');
                            $level.attr('ts-id',config.data[config.parentId]);
                            $level.addClass('level-choose-on');
                            $planeContent.attr('level-index',data[config.levelField]);
                        }
                    }
                }	//读取标题等级
                showContentHtml(dataArr,config);
            },
            error: function (error) {
                console.log(error);
            }
        });
	}
	//读取ajax返回内容
	function showContentHtml(dataArr,config){
		var isMask = true;
		var contentHtml = '';
		var titleArr = config.titleArr;
		var conditionHtml = '';
		var conditionJson = {};	
		if($.isArray(dataArr)){
			if(dataArr.length > 0){
				isMask = true;
			}else{
				isMask = false;
			}
		}else{
			isMask = false;
		}
		if(isMask == true){
			if(config.conditionField){
				//存在条件字段的前提
				for(var c=0; c<dataArr.length; c++){
					var conditionStr = dataArr[c][config.conditionField];
					if(conditionStr){
						if(typeof(conditionJson[conditionStr]) == 'undefined'){
							conditionJson[conditionStr] = [];
							conditionJson[conditionStr].push(dataArr[c]);
						}else{
							conditionJson[conditionStr].push(dataArr[c]);
						}
					}
				}
				var conditionArr = [];
				for(var spell in conditionJson){
					conditionArr.push(spell);
				}
				conditionArr.sort();
				conditionHtml = '<ul class="models-selector-firstspell" id="models-selector-firstspell">';
				if(conditionArr.length > 0){
					conditionHtml += '<li letter-index="all">全部</li>';
					for(var t=0; t<conditionArr.length; t++){
						conditionHtml += '<li letter-index="'+conditionArr[t]+'">'+conditionArr[t]+'</li>';
					}
				}
				conditionHtml += '</ul>';
			}
			contentHtml = '<ul class="models-selector-tab" id="models-selector-tab">';
			for(var i=0; i<dataArr.length; i++){
				var checkboxId = 'models-selector-checkbox-'+i;
				var isCheckedStr = '';
				var isDisabledStr = '';
				if(resultListJson[dataArr[i][config.valueField]]){
					//如果存在则选中
					isCheckedStr = 'checked';
					isDisabledStr = 'disabled';
				}
				contentHtml += '<li ms-value="'+dataArr[i][config.textField]+'" ms-index="'+dataArr[i][config.valueField]+'">'
								+'<span class="tab-tag">'
										+'<label class="checkbox-inline '+isCheckedStr+'" for="'+checkboxId+'"></label>'
										+'<input type="checkbox" class="checkbox-options" value="'+dataArr[i][config.valueField]+'" id="'+checkboxId+'" name="models-choose-checkbox" />'
								+'</span>'
								+'<label class="tab-label '+isDisabledStr+'">'+dataArr[i][config.textField]+'</label>'
							+'</li>';
			}
			contentHtml += '</ul>';
		}else{
			contentHtml = '<div class="empty-models-selector">未能检索出数据</div>';
		}
		$planeContent.html(conditionHtml+contentHtml);	
		if(!$.isEmptyObject(conditionJson)){
			//不为空的情况触发事件
			$('#models-selector-firstspell li').off('click');
			$('#models-selector-firstspell li').on('click',function(ev){
				var letterStr = $(this).attr('letter-index');
				var letterStrArr = conditionJson[letterStr];
				if(letterStr == 'all'){
					letterStrArr = dataArr;
				}
				getTabContentHtml(letterStrArr);
			});
		}	
		fillResultHtml();
	}
	//根据刷新条件读取内容
	function getTabContentHtml(letterArr){
		var contentHtml = '';
		for(var i=0; i<letterArr.length; i++){
			var checkboxId = 'models-selector-checkbox-'+i;
			var isCheckedStr = '';
			var isDisabledStr = '';
			if(resultListJson[letterArr[i][config.valueField]]){
				//如果存在则选中
				isCheckedStr = 'checked';
				isDisabledStr = 'disabled';
			}
			contentHtml += '<li ms-value="'+letterArr[i][config.textField]+'" ms-index="'+letterArr[i][config.valueField]+'">'
							+'<span class="tab-tag">'
									+'<label class="checkbox-inline '+isCheckedStr+'" for="'+checkboxId+'"></label>'
									+'<input type="checkbox" class="checkbox-options" value="'+letterArr[i][config.valueField]+'" id="'+checkboxId+'" name="models-choose-checkbox" />'
							+'</span>'
							+'<label class="tab-label '+isDisabledStr+'">'+letterArr[i][config.textField]+'</label>'
						+'</li>';
		}
		$('#models-selector-tab').html(contentHtml);
		refreshContentHandler();
	}
	//显示结果部分
	function showResultHtml(){
		var resultHtml = '<div class="car-result">'
							+'<label>已选车型：</label>'
							+'<ul class="confirm-list" id="confirm-list"></ul>'
						+'</div>';
		return resultHtml;
	}
	//按钮部分
	function getFooterBtnHtml(){
		var btnsHtml = '<div id="model-selector-button" class="model-selector-button nav-form"></div>';
		return btnsHtml;
	}
	//结果填充
	function fillResultHtml(){
		var liHtml = '';
		for(var listI in resultListJson){
			liHtml += '<li list-index="'+listI+'">'+resultListJson[listI].value+'</li>';
		}
		$showResult.html(liHtml);
		refreshContentHandler();
	}
	//checkbox事件的触发
	function checkboxHandler(ev){
		//选中事件和单击事件不可能同时支持
		var idStr = $.trim($(this).val());									//当前id
		var valueStr = $(this).closest('li').attr('ms-value');				//当前值
		$(this).prev().toggleClass('checked');								//是否添加选中状态
		if($(this).prev().hasClass('checked')){
			//选中状态下存放值
			if(idStr == 'all'){
				//全选
				$checkbox.each(function(){
					var idStr = $.trim($(this).val());
					var valStr = $(this).closest('li').attr('ms-value');		
					$(this).closest('li').children('label.tab-label').addClass('disabled');				
					if(idStr != 'all'){
						$(this).prev().addClass('checked');
						var valueJson = {id:idStr,value:valStr};
						resultListJson[idStr] = valueJson;
					}
				});
			}else{
				isCheckedHandler();//是否选中全选
				$(this).closest('li').children('label.tab-label').addClass('disabled');
				//不是全选
				var valueJson = {id:idStr,value:valueStr}
				resultListJson[idStr] = valueJson;
			}
		}else{
			if(idStr == 'all'){
				//全选
				$checkbox.each(function(){
					var idStr = $.trim($(this).val());
					$(this).closest('li').children('label.tab-label').removeClass('disabled');
					if(idStr != 'all'){
						$(this).prev().removeClass('checked');
						delete resultListJson[idStr];
					}
				})
			}else{
				isCheckedHandler();//是否选中全选
				$(this).closest('li').children('label.tab-label').removeClass('disabled');
				delete resultListJson[idStr];
			}
		}
		fillResultHtml();
	}
	function isCheckedHandler(){
		var allCheckboxLength = $checkbox.length-1;
		$tabChecked = $('#models-selector-tab li .tab-tag label.checked');
		var tabCheckedLength = $tabChecked.length;
		if(allCheckboxLength == tabCheckedLength){
			$allCheckbox.prev().addClass('checked');
		}else{
			$allCheckbox.prev().removeClass('checked');
		}
	}
	//tab ul li事件的触发
	function tabHandler(ev){
		var msId = $(this).closest('li').attr('ms-index');
		var msIndex = Number($(this).closest('div').attr('level-index'));
		config.data[config.parentId] = msId;
		var dataJson = {};
		msIndex = msIndex + 1;
		getAjax();
		var titleLength = config.titleArr.length - 1;
		if(msIndex == titleLength){
			//最后一级不触发单击事件
			$('#models-selector-tab > li > label').off('click');
		}
	}
	//全选事件和ul li事件
	function refreshContentHandler(){
		//刷新结果数据 1.如果是单击结果的刷新 2.勾选值的刷新
		$checkbox = $("input[name='models-choose-checkbox']");							//所有checkbox
		$allCheckbox = $('#model-selector-carmodels');									//全选的容器
		var $tabLi = $breadcrumb.children('li');										//所有标题
		var $selectorTab = $('#models-selector-tab > li > label:not(".disabled")');

		//所有checkbox触发单击事件
		$checkbox.off('click');
		$checkbox.on('click',checkboxHandler);
		//标题部分的单击事件
		$tabLi.off('click');
		$tabLi.on('click',function(ev){
			var tId = $(this).attr('ts-id');
			config.data[config.parentId] = tId;
			var tIndex = Number($(this).attr('ts-index'));
			getAjax();
		});
		//内容区域所有可单击事件禁用，只触发不含有.disabled的标签事件
		$('#models-selector-tab > li > label').off('click');
		$selectorTab.on('click',tabHandler);
		//显示结果区域部分的单击删除事件
		$showResult.children('li').off('click');
		$showResult.children('li').on('click',function(ev){
			var sId = $(this).attr('list-index');
			delete resultListJson[sId];
			$('#models-selector-tab li[ms-index="'+sId+'"] .tab-tag label').removeClass('checked');
			$('#models-selector-tab > li[ms-index="'+sId+'"] > label.tab-label').removeClass('disabled');
			//全选是否是选中状态
			if($allCheckbox.prev().hasClass('checked')){
				$allCheckbox.prev().removeClass('checked');
			}
			fillResultHtml();
		});	
	}
	//确认事件的触发
	function confirmHandler(){
		if(typeof(resultListJson) == 'object'){
			if($.isEmptyObject(resultListJson)){
				//值为空
				nsAlert('请先选择','error');
			}else{
				removePlane();
				var textsStr = getTexts();
				var idsStr = getValues();
				var $input = $('#'+config.fullID);
				if(config.isClear == false){
					$input.val(textsStr);
					$input.attr('ms-id',idsStr);
				}
				for(var id in resultListJson){
					resultListJson[id].data = dataByIdData[id];
				}
				if(typeof(config.confirmHandler) == 'function'){
					config.confirmHandler(resultListJson);
				}
			}
		}
	}
	//获取所有选中值的name
	function getTexts(){
		var textsStr = '';
		for(var listI in resultListJson){
			textsStr += resultListJson[listI].value + ',';
		}
		if(textsStr.indexOf(',') > -1){
			textsStr = textsStr.substr(0,textsStr.length-1);
		}
		return textsStr;
	}
	//获取所有选中值的id
	function getValues(){
		var valuesStr = '';
		for(var listI in resultListJson){
			valuesStr += resultListJson[listI].id + ',';
		}
		if(valuesStr.indexOf(',') > -1){
			valuesStr = valuesStr.substr(0,valuesStr.length-1);
		}
		return valuesStr;
	}
	//取消事件的触发
	function cancelHandler(){
		console.log('cancel');
		removePlane();
	}
	//关闭面板会触发关闭面板的操作
	function closePlane(){
		removePlane();
	}
	//移除面板只是把当前面板移除
	function removePlane(){
		console.log('removeplane');
		config.data[config.parentId] = $('#car-breadcrumb li:first').attr('ts-id');
		$plane.remove();
	}
	return {
		init:					init,		
		confirmHandler:			confirmHandler,
		cancelHandler:			cancelHandler,
		closePlane:				closePlane,
		removePlane:			removePlane,
		checkboxHandler:		checkboxHandler,
		getValues:				getValues
	}
})(jQuery);
/*******模型选择器 UI end**************/