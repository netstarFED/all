/*******配件选择器 UI start**************/
/*****
*组成分四部分       
*1.检索部分 是一个form表单
*2.检索来源数据 是一个datatable的表格
*3.查询结果，是一个显示结果的容器
*4.完成操作， 是确认or清空搜索项
******/
nsUI.inputSelect = (function($){
	var config;																	//配置参数
	var configJson = {};														//多个输入下拉框的配置
	function init(configObj){
		config = configObj;														//赋值配置
		if(typeof(config.id) == 'undefined'){
			return;
		}
		var $input = $('#'+config.fullID);										//输入框赋值
		var selectPlaneHtml = getSelectPlane();									//得到下拉框选择面板
		$input.closest('.form-group').after(selectPlaneHtml);					//追加下拉框选择面板
		var $selectBtn = $('#'+config.fullID+'-selectBtn');						//下拉框按钮	
		var $selectPlane = $('#'+config.fullID+'-plane');						//下拉框面板

		config.$input = $input;
		config.$selectBtn = $selectBtn;
		config.$selectPlane = $selectPlane;
		configJson[config.fullID] = config;
		if(configObj.readonly == true){
			$input.off('focus');
			$selectBtn.off('click');
		}else{
			$input.on('focus',function(ev){
				var $input = $(this);
				var inputID = $.trim($input.attr('id'));
				$input.off('focus');
				//showSelectPlane(configJson[inputID]);//显示面板
				$input.on('keyup',inputKeyupHandler);//输入框按下事件
				//$(this).on('change',inputChangeHandler);//输入框改变事件触发
				$input.on('blur',{config:configJson[inputID]},function(ev){
					//hidden
					var config = ev.data.config;
					var $selectPlane = config.$selectPlane;
					if(typeof(config.changeHandler)=='function'){
						config.changeHandler($.trim($(this).val()),{config:config,$dom:$(this)});				//是否有回调函数
					}
					window.setTimeout(function(event){
						hiddenSelectplane(config);
					},200);
					//hiddenSelectplane(config);
				});
			})										
			$selectBtn.off('click');//下拉框按钮事件触发
			$selectBtn.on('click',{config:config},selectBtnHandler);
		}											
	}
	//正在加载
	function getLoadingHtml(){
		var html =  
			'<div class="input-loading">'
				+'<i class="fa fa-circle-o-notch fa-spin fa-fw"></i>'
			+'</div>'
		return html;
	}
	//得到下拉输入框面板
	function getSelectPlane(){
		var selectHtml = '';
		if(typeof(config.selectConfig) == 'object'){
			if(!$.isEmptyObject(config.selectConfig)){
				var subdata = [];
				var selectConfig = config.selectConfig;
				if(selectConfig.url){
					selectHtml = getLoadingHtml();	//正在加载中
					//如果存在url参数配置，则url方式读值
					var method = typeof(selectConfig.method) == 'string' ? selectConfig.method : 'GET';
					var data = typeof(selectConfig.data) == 'object' ? selectConfig.data : {};
					$.ajax({
						url:selectConfig.url, //请求的数据链接
						type:method,
						data:data,
						dataType:'json',
						context:config,
						success:function(data){
							config = this;
							var subdata;
							if(typeof(config.selectConfig.dataSrc)!='string'){
								subdata = data;
							}else{
								subdata = data[config.selectConfig.dataSrc];
							}
							config.selectConfig.subdata = subdata;
							$('#'+config.fullID+'-plane').children('.input-loading').remove();
							$('#'+config.fullID+'-plane').html(appendSelectHtml(config));
						},
						error: function (error) {
							nsAlert(  language.ui.inputSelect.selectPlaneHtml  );
						}
					});
				}
				selectHtml = appendSelectHtml(config);
			}
		}else{
			selectHtml = emptyHtml();
		}
		var selectPlaneHtml = '<div class="input-select-plane" id="'+config.fullID+'-plane">'+selectHtml+'</div>';
		return selectPlaneHtml;
	}
	//刷新下拉输入面板内容
	function refreshHtml(configObj,subdata){
		var config = configObj.selectConfig;
		var textField = config.textField;
		var valueField = config.valueField;
		var selectHtml = '';
		if($.isArray(subdata)){
			for(var i=0; i<subdata.length; i++){
				var selectedStr = '';
				if(valueStr){
					selectedStr = subdata[i][textField] == valueStr ? 'plane-content current' : 'plane-content';
				}else{
					selectedStr = subdata[i].selected ? 'plane-content current' : 'plane-content';
				}
				selectHtml += '<div class="'+selectedStr+'" ns-index="'+i+'">'
								+'<a href="javascript:void(0);">'
									+'<span>'+subdata[i][textField]+'</span>'
								+'</a>'
							+'</div>';
			}
		}else{
			selectHtml = emptyHtml();
		}
		return selectHtml;
	}
	//追加下拉面板内容
	function appendSelectHtml(configObj){
		var config = configObj.selectConfig;
		var textField = config.textField;
		var valueField = config.valueField;
		var subdata = config.subdata;
		var valueStr = configObj.value;
		if(typeof(valueStr) == 'function'){
			valueStr = valueStr();
		}
		var selectHtml = '';
		if($.isArray(subdata)){
			for(var i=0; i<subdata.length; i++){
				var selectedStr = '';
				if(valueStr){
					selectedStr = subdata[i][textField] == valueStr ? 'plane-content current' : 'plane-content';
				}else{
					selectedStr = subdata[i].selected ? 'plane-content current' : 'plane-content';
				}
				selectHtml += '<div class="'+selectedStr+'" ns-index="'+i+'" ns-id="'+subdata[i][valueField]+'">'
								+'<a href="javascript:void(0);">'
									+'<span>'+subdata[i][textField]+'</span>'
								+'</a>'
							+'</div>';
			}
		}else{
			selectHtml = emptyHtml();
		}
		return selectHtml;
	}
	//当值不存在的时候输出的html
	function emptyHtml(){
		var emptyHtml =	'<div class="empty"><i class="fa fa-ban"></i><p>'+language.ui.inputSelect.emptyHtml+'</p></div>';
		return emptyHtml;
	}
	//输入框改变事件
	function inputChangeHandler(ev){
		var inputID = $(this).attr('id');
		var config = configJson[inputID];								//得到配置信息
		var $selectPlane = config.$selectPlane;
		if(typeof(config.changeHandler)=='function'){
			config.changeHandler($.trim($(this).val()),{config:config,$dom:$(this)});				//是否有回调函数
		}
		hiddenSelectplane(config);
	}
	//下拉选择框按钮触发事件
	function selectBtnHandler(ev){
		var config = ev.data.config;
		//config.$input.focus();
		showSelectPlane(config);//显示面板
	}
	//下拉文本值选择触发事件
	function selectHandler(ev){
		var $this = $(this);
		var config = ev.data.config;
		//获取当前要填充的配置元素
		var $dom = $this.closest('.input-select-plane');
		var $input = config.$input;
		var valueStr = $.trim($this.children('a').children('span').text());
		var id = $this.attr('ns-id');
		//给当前添加选中状态，移除其他同级元素的选中状态
		$this.addClass('current');
		$this.siblings().removeClass('current');

		if(typeof(config.changeHandler)=='function'){
			config.changeHandler(valueStr,{json:{value:id,text:valueStr},config:config});				//是否有回调函数
		}
		//调用赋值
		fillValue($input,$dom,valueStr,config);
	}
	//隐藏下拉选择面板
	function hiddenSelectplane(config){
		var $selectPlane = config.$selectPlane;
		var $input = config.$input;
		var saveBtn = config.fullID + '-saveBtn';
		if($('#'+saveBtn).length > 0){$("#"+saveBtn).remove()}
		$selectPlane.removeClass('show');
		$selectPlane.children('.plane-content.current').removeClass('current');
		$selectPlane.children('.plane-content').off('click');
		$input.on('keyup',inputKeyupHandler);
		$(document).off('keyup',{config:config},documentKeyHandler);
		//config.$input.focus();
		//$(document).off('click',documentClickHandler);
	}
	//显示下拉选择面板
	function showSelectPlane(config){
		var $selectPlane = config.$selectPlane;
		if($selectPlane.hasClass('show')){
			//关闭面板
			hiddenSelectplane(config);
		}else{
			$selectPlane.addClass('show');
			$selectPlane.closest('.form-td').siblings().children('.input-select-plane').removeClass('show');
			$selectPlane.children('.plane-content').off('click',{config:config},selectHandler);
			$selectPlane.children('.plane-content').on('click',{config:config},selectHandler);
			config.$input.off('keyup',inputKeyupHandler);
			$(document).on('keyup',{config:config},documentKeyHandler);//触发整体键盘操作事件
			//$(document).on('click',evData,documentClickHandler);//触发整体键盘单击事件
		}
	}
	function documentClickHandler(ev){
		//点击屏幕无关位置关闭弹框
		//判断当前点击区域是否在指定区域如果没有则移除面板
		//console.log($(ev.target).closest('.input-select-plane').length);
		var config = ev.data.config;
		var $plane = config.$selectPlane;
		var dragel = $plane[0];
		var target = ev.target;
		if(dragel != target && !$.contains(dragel,target)){
			if(target == config.$input[0]){
				
			}else{
				hiddenSelectplane(config);
			}
		}
	}
	//鼠标按下事件
	function inputKeyupHandler(ev){
		var inputID = $.trim($(this).attr('id'));
		var valueStr = $.trim($(this).val());
		searchValue(inputID,valueStr);
	}
	//检索值
	function searchValue(searchID,valueStr){
		var selectConfig = configJson[searchID].selectConfig;
		var config = configJson[searchID];
		var dataArr = selectConfig.subdata;
		var isAdd = true;//是否需要保存添加值
		var dIndex = 0;//记录下标
		var contidionArr = [];
		for(var dataI=0; dataI<dataArr.length; dataI++){
			if(dataArr[dataI][selectConfig.textField] == valueStr){
				isAdd = false;
				dIndex = dataI;
				break;
			}
		}
		for(var searchI=0; searchI<dataArr.length; searchI++){
			if(dataArr[searchI][selectConfig.textField].indexOf(valueStr)>-1){
				contidionArr.push(dataArr[searchI]);
			}
		}
		if(isAdd){
			//为真需要添加
			if(config.saveAjax){
				addValue(valueStr,config);	
			}else{
				//console.log('add')
			}
		}else{
			//不需要添加
			if(config.saveAjax){
				var saveBtnId = config.fullID + '-saveBtn';
				if($('#'+saveBtnId).length > 0){$('#'+saveBtnId).remove()};
			}else{
				if(contidionArr.length>0){
					var html = appendSelectHtml(config,contidionArr);
					//console.log(html)
				}
			}
		}
	}
	function addValue(valueStr,config){
		var saveBtnId = config.fullID + '-saveBtn';
		if($('#'+saveBtnId).length > 0){$('#'+saveBtnId).remove()};
		var saveBtn = '<a href="javascript:void(0)" id="'+saveBtnId+'" class="input-select-btn"><i class="fa fa-save"></i></a>';
		config.$selectBtn.parent().append(saveBtn);
		$('#'+saveBtnId).off('click');
		$("#"+saveBtnId).on('click',function(ev){
			var bID = $.trim($(this).attr('id'));
			var tempStr = '-saveBtn';
			var inputID = bID.substring(0,bID.length-tempStr.length);
			var config = configJson[inputID];
			var params = $.extend(true,{},config.saveAjax.data);
			params[config.selectConfig.textField] = valueStr;
			params[config.selectConfig.valueField] = valueStr;
			$.ajax({
				url:			config.saveAjax.url,	
				data:			params,
				type:			config.saveAjax.method,
				dataType: 		"json",
				context: 		config,
				success: function(data){
					if(data.success){
						config = this;
						config.selectConfig.subdata.push(params);
						var selectHtml = appendSelectHtml(config);
						config.$selectPlane.html(selectHtml);
						config.$selectPlane.children('.plane-content').off('click',{config:config},selectHandler);
						config.$selectPlane.children('.plane-content').on('click',{config:config},selectHandler);
						hiddenSelectplane(config)
					}
				},
			})
		})
	}
	function isExistValue(valueStr,config){
		var saveBtnId = config.id + '-saveBtn';
		
		if($('#'+saveBtnId).length > 0){$('#'+saveBtnId).remove()};
		config.$selectPlane.children('.current').removeClass('current');
		if(isAdd){
			config.$selectPlane.children().eq(dIndex).addClass('current');
		}else{
			
		}
	}
	//键盘操作 上下键控制选择值
	function documentKeyHandler(ev){
		var config = ev.data.config;
		var $plane = config.$selectPlane;
		var $currentRow = $plane.children('.current');//读取当前操作选中行的面板
		switch(ev.keyCode){
			case 13:
				//enter
				if($currentRow.length == 1){
					var valueStr = $.trim($currentRow.children('a').children('span').text());
					//调用赋值
					fillValue(config.$input,config.$selectPlane,valueStr,config);
				}
				break;
			case 40:
				//up
				if($currentRow.length == 1){
					var nextItem = false;
					function getNextItem(item){
						if(item.next().attr('class')=='plane-content'){
							nextItem = item.next();
						}else{
							if(item.next().length!=0){
								//如果有下一个
								getNextItem(item.next());
							}else{
								nsAlert(language.ui.inputSelect.nextItem);
							} 
						}
					}
					getNextItem($currentRow);
					if(nextItem!=false){
						nextItem.addClass('current');
						$currentRow.removeClass('current');
					};
				}else{
					$plane.children('.plane-content').eq(0).addClass('current');
				}
				break;
			case 38:
				//down
				if($currentRow.length == 1){
					var prevItem = false;
					function getPrevItem(item){
						if(item.prev().attr('class')=='plane-content'){
							prevItem = item.prev();
						}else{
							if(item.prev().length!=0){
								getPrevItem(item.prev());
							}else{
								nsAlert(language.ui.inputSelect.prevItem);
							}
							
						}
					}
					getPrevItem($currentRow);
					if(prevItem!=false){
						prevItem.addClass('current');
						$currentRow.removeClass('current');
					};
				}
				break;
			case 27:
				//esc 关闭
				hiddenSelectplane(config);
				break;
		}
	}

	//填充值
	function fillValue($input,$selectPlane,valueStr,config){
		//需要的条件 填充的元素 具体填充的值
		$input.val(valueStr);									//填充值
		hiddenSelectplane(config);						//关闭面板操作
		/*if(typeof(config.changeHandler) == 'function'){
			config.changeHandler(valueStr);						//如果有返回函数则返回回调事件
		}*/
	}
	//清空值
	function clearValue($input){
		$input.val('');
	}
	function getConfig(){
		return configJson;
	}
	return {
		init:			init,
		getConfig:		getConfig,
		clearValue:		clearValue
	}
})(jQuery);
/*******配件选择器 UI end**************/