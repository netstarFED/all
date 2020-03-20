/*******省市区简码start****************************/

/*******省市区简码end****************************/
provinceSelect.initSelect = (function($){
	var provincePlane = {};//存放所有的操作对象以及值
	function init(formID,selectProArr){
		for(var i = 0; i < selectProArr.length; i ++){
			var selProID = 'form-'+formID+'-'+selectProArr[i].id;
			var currentID = selProID;
			provincePlane[currentID] = {};
			provincePlane[currentID].container = {};//包含的对象dom
			provincePlane[currentID].data = {};//拿到所有的数据
			provincePlane[currentID].attribute = selectProArr[i];//拿到所有的属性
			if(typeof(selectProArr[i].url)=='string'){
				//ajax读值方式
				if(selectProArr[i].url !== ''){
					var config = {
						url:selectProArr[i].url,
						type:selectProArr[i].method ? selectProArr[i].method : 'GET',
						data:selectProArr[i].data ? selectProArr[i].data : {},
					};
					provincePlane[currentID].data = getAJAX(config);
				}else{
					console.log('url参数有误');
				}
			}else if(typeof(selectProArr[i].dataSource)!='undefined'){
				//自定义读值
				provincePlane[currentID].data = selectProArr[i].dataSource;
			}else{
				//两者都不是则数据为空
				provincePlane[currentID].data = [];
			}
			provincePlane[currentID].currentPid = -1;//存放当前pid
			provincePlane[currentID].level = 0;//当前等级
			provincePlane[currentID].currentData = getCurrentData(currentID,-1); //获取当前显示的数据值

			provincePlane[currentID].isComplete = false;

			var provinceSelectArr = getLevelData(currentID);//分别得到省，市，区数据
			provincePlane[currentID].provinceData = provinceSelectArr[0];//得到省
			provincePlane[currentID].cityData = provinceSelectArr[1];//得到市
			provincePlane[currentID].areaData = provinceSelectArr[2];//得到区

			var $input = $('#'+selProID);
			var planeID = selProID+'-plane';
			var planesHtml = getPlanesHtml(planeID);
			$input.parent().after(planesHtml);
			var $Plane = $('#'+planeID);
			provincePlane[currentID].container.input = $input;
			provincePlane[currentID].container.plane = $Plane;
			provincePlane[currentID].inputValue = '';//输入框的值
			provincePlane[currentID].isShow = false;	//显示 or 隐藏 面板
			$input.val('');
			$input.on('focus',function(ev){
				var ID = $(this).attr('id');
				planeShow(ID);
				if($.trim($(this).val()) == ''){
					refreshPlane(ID);
				}else{
					if(provincePlane[ID].inputValue == $.trim($(this).val())){
						//不刷新数据
					}else{
						refreshPlane(ID);
					}
				}
			});
		}
		//console.log(provincePlane);
	}	
	//初始化数据面板
	function getPlanesHtml(planeID){
		var planesHtml = '<div class="province-plane" id="'+planeID+'"></div>';
		return planesHtml;
	}
	//分别读取到省市区数据值
	function getLevelData(id){
		var allData = provincePlane[id].data;
		var provinceData = [];
		var cityData = [];
		var areaData = [];
		for(var i=0; i<allData.length; i++){
			switch(allData[i].level){
				case "0":
					provinceData.push(allData[i]);
					break;
				case "1":
					cityData.push(allData[i]);
					break;
				case "2":
					areaData.push(allData[i]);
					break;
			}
		}
		return [provinceData,cityData,areaData];
	}
	//根据pid查找到对应显示的数据

	//搜索获取值  键盘操作获取值  鼠标点击获取值
	function getCurrentData(id,pid){
		var allData = provincePlane[id].data;
		var currentData = [];
		for(var allI=0;allI<allData.length;allI++){
			if(allData[allI].pid == pid){
				currentData.push(allData[allI]);
			}
		}
		return currentData;
	}
	//打开还是关闭搜索面板
	function planeShow(id){
		var $input = provincePlane[id].container.input;
		var $planes = provincePlane[id].container.plane;
		$input.parent().children('label.has-error').remove();
		if($planes.hasClass('show')){
			//已经打开
		}else{
			$planes.addClass('show');
			$input.on('keyup',inputKeyupHandler);
			$(document).on('keyup',{inputDom:$input},documentKeyupHandler);
			provincePlane[id].isShow = true;
		}
	}

	function inputKeyupHandler(ev){
		var isUseListData = false;
		var id = $(ev.target).attr('id');
		var $input = provincePlane[id].container.input;
		if($.trim($input.val())===''){
			$input.parent().children('a.close').remove();
		}
		if(provincePlane[id].inputValue == $.trim($input.val())){
			//如果相等则不用重新搜索
			isUseListData = true;
		}else{
			provincePlane[id].inputValue = $.trim($input.val());
		}
		if(!isUseListData){
			provincePlane[id].currentData = searchValue(id);
			refreshPlane(id);
		}
	}
	function searchValue(id){
		var valueStr = provincePlane[id].inputValue;
		var searchArr = [];
		if(valueStr!=''){
			//有搜索条件
			valueStr = valueStr.toLocaleUpperCase();
			var provinceSelData = provincePlane[id].data;
			var pidArr = [];//搜索到的pid
			for(var proI=0; proI<provinceSelData.length; proI++){
				var searchStr = provinceSelData[proI];
				if(searchStr.pyCode.indexOf(valueStr)>-1 || searchStr.name.indexOf(valueStr)>-1 || searchStr.wbCode.indexOf(valueStr)>-1){
					searchArr.push(provinceSelData[proI]);
					pidArr.push(provinceSelData[proI].id);
				}
				if(searchArr.length >=10){
					break;
				}
			}
			if(pidArr.length == 1){
				searchArr = getCurrentData(id,pidArr[0]);
			}
		}else{
			//无搜索条件
			searchArr = provincePlane[id].provinceData;
		}
		return searchArr;
	}
	function documentKeyupHandler(ev){
		var $target = $(ev.target);
		$input = ev.data.inputDom;
		if($input.attr('id') == $target.attr('id')){
			var inputID = $(ev.target).attr('id');
			$input = provincePlane[inputID].container.input;
			$planes = provincePlane[inputID].container.plane;
			switch(ev.keyCode){
				case 39:
					//右
					var selectItem = $planes.children('.current');
					if(selectItem.length == 1){
						var nextItem = false;
						function getNextItem(item){
							if(item.next().attr('class')=='pro-sel-content'){
								nextItem = item.next();
							}
						}
						getNextItem(selectItem);
						if(nextItem!=false){
							nextItem.addClass('current');
							selectItem.removeClass('current');
						};
					}
					break;
				case 37:
					//左 
					var selectItem = $planes.children('.current');
					if(selectItem.length == 1){
						var prevItem = false;
						function getPrevItem(item){
							if(item.prev().attr('class')=='pro-sel-content'){
								prevItem = item.prev();
							}
						}
						getPrevItem(selectItem);
						if(prevItem!=false){
							currentItem = prevItem;
							prevItem.addClass('current');
							selectItem.removeClass('current');
						};
					}
					break;
				case 32:
					//空格是添加
					if($input.val().indexOf(' ')>-1){
						//input中有空格，过滤掉输入法的空格事件
						var selectItem = $planes.children('.current');
						if(selectItem.length==1){
							var id = selectItem.attr('ns-id');
							// /var data = searchValue(id);
						}
					}
					break;
				case 13:
					//确认完成
					var selectItem = $planes.children('.current');
					confirmInputvalueHandler(selectItem);
					break;
				default:
					
					break;
			}
		}
	}
	function refreshPlane(id){
		var $planes = provincePlane[id].container.plane;
		var data = provincePlane[id].currentData;
		var attribute = provincePlane[id].attribute;
		//console.log(provincePlane[id].isComplete);
		if(!provincePlane[id].isComplete){
			
			$planes.html(getPlaneHtml(data,attribute));
			$planes.children('span').on('click',function(ev){
				var $dom = $(this);
				confirmInputvalueHandler($dom);
			});
		}else{
			closePlane(id);
		}
		//console.log('refresh');
		if(provincePlane[id].inputValue != ''){
			clearData(id);
		}
	}
	//确认选择事件
	function confirmInputvalueHandler(dom){
		//console.log(dom)
		var inputID = dom.closest('div').attr('id');
		var tempID = '-plane';
		var actulyLength = inputID.length-tempID.length;
		inputID = inputID.substr(0,actulyLength);
		var textStr = $.trim(dom.text());

		var tID = dom.attr('ns-id');
		var currentPid = dom.attr('ns-pid');
		var cLevel = dom.attr('ns-level');
		var $input = provincePlane[inputID].container.input;
		var searchArr =  getCurrentData(inputID,tID);
		//选择值，先判断当前input是否含有内容
		//如果当前值为空
		var inputValue = getParentData(inputID,currentPid);
		var showStr = '';
		if(inputValue !=''){
			showStr =  inputValue+','+textStr;
		}else{
			showStr = textStr;
		}
		provincePlane[inputID].container.input.val(showStr);
		provincePlane[inputID].inputValue = showStr;
		provincePlane[inputID].currentData = searchArr;
		provincePlane[inputID].currentPid = currentPid;
		provincePlane[inputID].level = cLevel;
		if(Number(cLevel) == 1 && searchArr.length == 0){
			provincePlane[inputID].isComplete = true;
		}
		refreshPlane(inputID);           
	}

	function getParentData(id,cid){
		var data = provincePlane[id].data;
		var inputValue = '';
		//cid为-1的情况
		if(cid != -1){
			var isLevel;
			var levelID;
			for(var i=0; i<data.length; i++){
				if(data[i].id == cid){
					inputValue = data[i].name;
					isLevel = data[i].level;
					levelID = data[i].pid;
				}
			}
			//console.log(isLevel);
			if(Number(isLevel)!=0){
				for(var c=0; c<data.length;c++){
					if(data[c].id == levelID){
						provincePlane[id].isComplete = true;
						inputValue = data[c].name +','+inputValue;
					}
				}
			}
		}
		return inputValue;
	}
	
	function closePlane(id){
		var $planes = provincePlane[id].container.plane;
		var $input = provincePlane[id].container.input;
		if($planes.hasClass('show')){
			$planes.removeClass('show');
			$input.off('keyup',inputKeyupHandler);
			$(document).off('keyup',{inputDom:$input},documentKeyupHandler);
			provincePlane[id].isShow = false;
			$planes.html('');
			provincePlane[id].inputValue = $.trim($input.val());
			provincePlane[id].isComplete = false;
		}
	}
	function clearData(id){
		var $input = provincePlane[id].container.input;
		var closeHtml = getCloseMarkHtml();
		$input.parent().children('a.close').remove();
		$input.after(closeHtml);
		$inputMaskClose = $input.parent().children('a.close');
		$inputMaskClose.on('click',function(ev){
			//关闭按钮
			//1.清空数据 
			var inputID = $(ev.target).parent().children('input').attr('id');
			var $input = provincePlane[inputID].container.input;
			$input.val('');
			$(this).remove();
			$input.on('keyup',inputKeyupHandler);
			$(document).on('keyup',{inputDom:$input},documentKeyupHandler);
			provincePlane[inputID].inputValue = '';
			provincePlane[id].currentData = provincePlane[id].provinceData;
		});
	}
	function getCloseMarkHtml(){
		var closeHtml = '<a class="close" id="close"></a>';
		return closeHtml;
	}
	function getPlaneHtml(data,attribute){
		var planeHtml = '';
		if(data.length == 0){
			planeHtml = getErrorHtml(language.common.provinceselect.noMessage);
		}else{
			for(var i = 0; i < data.length; i ++){
				var currentClassStr = i==0 ? 'pro-sel-content current' : 'pro-sel-content';
				planeHtml += '<span ns-id="'+data[i].id+'" ns-index="'+i+'" class="'+currentClassStr+'" ns-pid="'+data[i].pid+'" ns-level="'+data[i].level+'">'+data[i][attribute.textField]+'</span>';
			}
		}
		return planeHtml;
	}
	function getErrorHtml(msg){
		var errorHtml = '<div class="has-error"><p class="tips">'+msg+'</p></div>';
		return errorHtml;
	}
	function getAJAX(config){
		var returnData;
		$.ajax({
			url:config.url,
			type:config.type,
			data:config.data,
			dataType:'json',
			async:false,
			success:function(data){
				returnData = data;
			},
			error:function(){
				returnData = [];
			}
		});
		return returnData;
	}
	return {
		init:init,  				//初始化方法
	}
})(jQuery);
//下拉框关闭状态
provinceSelect.isClose = false;
//展开的下拉框id
provinceSelect.domId = '';
provinceSelect.data = {};
provinceSelect.getlinkDataByCode = function(){
	var linkJson = {};
	var linkArray = provinceInfo;
	function getData(cData,level,data){
		var cField = 'cField';
		var dataObj = {};
		switch(level){
			case 0:
				cField = 'pro';
				break;
			case 1:
				cField = 'city';
				break;
			case 2:
				cField = 'area';
				break;
		}
		for(var dataI=0; dataI<cData.length; dataI++){
			var json = {
				code:cData[dataI].code,
				name:cData[dataI].name
			}
			var cJson = {pro:{},city:{},area:{}};
			cJson[cField] = json;
			if(level == 1){cJson.pro = data;}
			if(level == 2){
				cJson.city = data;
			}
			dataObj[json.code] = cJson;
			if($.isArray(cData[dataI].sub)){
				dataObj = $.extend(true,dataObj,getData(cData[dataI].sub,level+1,json));
			}
		}
		return dataObj;
	}
	provinceSelect.data = getData(linkArray,0);
}
provinceSelect.getlinkDataByCode();
provinceSelect.init = function(formID,provSelectArr){
	for(var provSelI=0; provSelI<provSelectArr.length; provSelI++){
		var proselectID = 'form-'+formID+'-'+provSelectArr[provSelI].id+'-province';
		var cityselectID = 'form-'+formID+'-'+provSelectArr[provSelI].id+'-city';
		var areaSelectID = 'form-'+formID+'-'+provSelectArr[provSelI].id+'-area';
		var $pro = $('#'+proselectID);
		var $city = $('#'+cityselectID);
		var $area = $('#'+areaSelectID);
		if(!$.isEmptyObject(provSelectArr[provSelI].setRange)){
			//如果定义了显示隐藏值
			var setRange = provSelectArr[provSelI].setRange;
			var proJson = setRange.pro;//省份配置
			if(proJson.hidden){$pro.closest('.form-td').addClass('hidden');}
			if(proJson.readOnly){$pro.prop('disabled',true)};
			var cityJson = setRange.city;
			if(cityJson.hidden){$city.closest('.form-td').addClass('hidden');}
			if(cityJson.readOnly){$city.prop('disabled',true)}
			var areaJson = setRange.area;
			if(areaJson.hidden){$area.closest('.form-td').addClass('hidden');}
			if(areaJson.readOnly){$area.prop('disabled',true)}
		}
		$pro.selectBoxIt().on('open', function(){
			$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
			provinceSelect.domId = proselectID;
			provinceSelect.isOpenDefaultHandler();
		});
		$pro.selectBoxIt().on('close',function(ev){
			provinceSelect.isClose = true;
			var currentValueStr = $.trim($(this).find('option:selected').text());
			var currentData = provinceSelect.getProvData(currentValueStr);
			currentData = currentData[0];
			var curID = $(this).attr('id');
			curID = curID.substring(0,curID.length-8);
			$dom = $('#'+curID+'city');
			provinceSelect.componentHtml($dom,currentData);
			var $areaDom = $('#'+curID+'area');
			var areaData = provinceSelect.getCityData(currentValueStr,$dom.find('option:selected').text().trim());
			provinceSelect.componentHtml($areaDom,areaData);
		});
		$city.selectBoxIt().on('open', function(){
			$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
			provinceSelect.domId = cityselectID;
			provinceSelect.isOpenDefaultHandler();
		});
		$city.selectBoxIt().on('close',function(ev){
			provinceSelect.isClose = true;
			var cityValueStr = $.trim($(this).find('option:selected').text());
			var curID = $(this).attr('id');
			curID = curID.substring(0,curID.length-4);
			var proValueStr = $.trim($('#'+curID+'province').find('option:selected').text());
			var	currentData = provinceSelect.getCityData(proValueStr,cityValueStr);	
			var $dom = $('#'+curID+'area');
			provinceSelect.componentHtml($dom,currentData);
		});
		$area.selectBoxIt().on('open', function(){
			$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
			provinceSelect.domId = areaSelectID;
			provinceSelect.isOpenDefaultHandler();
		});
		$area.selectBoxIt().on('close',function(ev){
			provinceSelect.isClose = true;
		})
	}
}
//====================wxk===回车触发第一个按钮事件=======================
//根据下拉框是否关闭控制下拉框执行keydown
provinceSelect.isOpenDefaultHandler = function(){
	// console.log('下拉框事件绑定--------------------------')
	// console.log(provinceSelect.domId)
	$('#'+provinceSelect.domId+'SelectBoxIt').on('keydown',function(ev){
		if(provinceSelect.isClose){
			//console.warn('isClose:'+provinceSelect.isClose);
			ev.stopPropagation();
			ev.preventDefault();
		}
		provinceSelect.isClose = false;
	})
}
provinceSelect.componentHtml = function($dom,currentData,valueStr){
	var optionHtml = '';
	valueStr = typeof(valueStr) == 'undefined' ? '' :valueStr;
	var emptyHtml = '<option value=""></option>';
	if($.isArray(currentData)){
		if(currentData.length > 0){
			optionHtml = emptyHtml;
			for(var optionI=0; optionI<currentData.length; optionI++){
				var optionname = currentData[optionI].name;
				var selectedStr = '';
				if(optionname == valueStr){
					selectedStr = 'selected';
				}
				optionHtml += '<option value="'+currentData[optionI].code+'" '+selectedStr+'>'+optionname+'</option>';
			}
		}else{
			optionHtml = emptyHtml;
		}
	}else{
		optionHtml = emptyHtml;
	}
	$dom.html(optionHtml);
	var selectBoxOption = $dom.selectBoxIt().data("selectBox-selectBoxIt");
	selectBoxOption.refresh();
}
//根据当前选中省份来获取其下属的所有的市
provinceSelect.getProvData = function(currentValueStr){
	var data = [];
	var currentCode = '';
	for(var proI=0; proI<provinceInfo.length;proI++){
		var proname = provinceInfo[proI].name;
		if(proname == currentValueStr){
			data = provinceInfo[proI].sub;
			currentCode = provinceInfo[proI].code;
		}
	}
	return [data,currentCode];
}
provinceSelect.getCityData = function(provalue,cityvalue){
	var cityData = [];
	var areaData = [];
	for(var proI=0; proI<provinceInfo.length; proI++){
		var proname = provinceInfo[proI].name;
		if(proname == provalue){
			cityData = provinceInfo[proI].sub;
		}
	}
	if($.isArray(cityData)){
		for(var cityI=0; cityI<cityData.length; cityI++){
			if(cityData[cityI].name == cityvalue){
				areaData = cityData[cityI].sub;
			}
		}
	}
	return areaData;
}

//赋值
provinceSelect.fillValue = function(id,value){
	if(typeof(value) == 'object'){
		if(!$.isEmptyObject(value)){
			var proStr = typeof(value.province) == 'string' ? value.province : '';
			var cityStr = typeof(value.city) == 'string' ? value.city : '';
			var areaStr = typeof(value.city) == 'string' ? value.area : '';
			if(proStr !== ''){
				var proArr = provinceSelect.getProvData(proStr);
				var cityArr = proArr[0];
				var proCode = proArr[1];

				var $dom = $('#'+id+'-province');
				$dom.val(proCode);
				var proselectBoxit = $dom.selectBoxIt().data("selectBox-selectBoxIt");
				proselectBoxit.refresh();

				var areaArr = provinceSelect.getCityData(proStr,cityStr);

				provinceSelect.componentHtml($('#'+id+'-city'),cityArr,cityStr);
				provinceSelect.componentHtml($('#'+id+'-area'),areaArr,areaStr);
			}
		}
	}else{
		var codeData = provinceSelect.data[value];
		if(typeof(codeData)=='undefined'){
			codeData = {};
			console.log(value);
		}
		//省 市 区
		//区存放 区和市   市存放 市和省  省存放市和区
		if(!$.isEmptyObject(codeData.pro)){
			var proArr = provinceSelect.getProvData(codeData.pro.name); //省份名称
			var $dom = $('#'+id+'-province');
			$dom.val(codeData.pro.code);
			var proselectBoxit = $dom.selectBoxIt().data("selectBox-selectBoxIt");
			proselectBoxit.refresh();
			var areaArr = provinceSelect.getCityData(codeData.pro.name,codeData.city.name);
			provinceSelect.componentHtml($('#'+id+'-city'),proArr[0],codeData.city.name);
			provinceSelect.componentHtml($('#'+id+'-area'),areaArr,'');
		}else if(!$.isEmptyObject(codeData.city)){
			//不存在省
			var proJson = provinceSelect.data[codeData.city.code];
			var proArr = provinceSelect.getProvData(proJson.pro.name); //省份名称
			var $dom = $('#'+id+'-province');
			$dom.val(proJson.pro.code);
			var proselectBoxit = $dom.selectBoxIt().data("selectBox-selectBoxIt");
			proselectBoxit.refresh();
			var areaArr = provinceSelect.getCityData(proJson.pro.name,codeData.city.name);
			provinceSelect.componentHtml($('#'+id+'-city'),proArr[0],codeData.city.name);
			provinceSelect.componentHtml($('#'+id+'-area'),areaArr,codeData.area.name);
		}
	}
}

//baidumap的省市联动-初始化方法
provinceSelect.initBaiDuMap = function(formID,provSelectArr){
	for(var provSelI=0; provSelI<provSelectArr.length; provSelI++){
		var proselectID = 'form-'+formID+'-'+provSelectArr[provSelI].id+'-province';
		var cityselectID = 'form-'+formID+'-'+provSelectArr[provSelI].id+'-city';
		var areaSelectID = 'form-'+formID+'-'+provSelectArr[provSelI].id+'-area';
		var $pro = $('#'+proselectID);
		var $city = $('#'+cityselectID);
		var $area = $('#'+areaSelectID);
		if(!$.isEmptyObject(provSelectArr[provSelI].setRange)){
			//如果定义了显示隐藏值
			var setRange = provSelectArr[provSelI].setRange;
			var proJson = setRange.pro;//省份配置
			if(proJson.hidden){$pro.closest('.form-td').addClass('hidden');}
			if(proJson.readOnly){$pro.prop('disabled',true)};
			var cityJson = setRange.city;
			if(cityJson.hidden){$city.closest('.form-td').addClass('hidden');}
			if(cityJson.readOnly){$city.prop('disabled',true)}
			var areaJson = setRange.area;
			if(areaJson.hidden){$area.closest('.form-td').addClass('hidden');}
			if(areaJson.readOnly){$area.prop('disabled',true)}
		}
		$pro.selectBoxIt().on('open', function(){
			$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
		});
		$pro.selectBoxIt().on('close',function(ev){
			var currentValueStr = $.trim($(this).find('option:selected').text());
			var currentData = provinceSelect.getProvData(currentValueStr);
			currentData = currentData[0];
			var curID = $(this).attr('id');
			curID = curID.substring(0,curID.length-8);
			$dom = $('#'+curID+'city');
			provinceSelect.componentHtml($dom,currentData);
			var $areaDom = $('#'+curID+'area');
			var areaData = provinceSelect.getCityData(currentValueStr,$dom.find('option:selected').text().trim());
			provinceSelect.componentHtml($areaDom,areaData);
			$('#'+curID+'longitude').val('');
			$('#'+curID+'latitude').val('');
			$('#'+curID+'address').val('');
		});
		$city.selectBoxIt().on('open', function(){
			$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
		});
		$city.selectBoxIt().on('close',function(ev){
			var cityValueStr = $.trim($(this).find('option:selected').text());
			var curID = $(this).attr('id');
			curID = curID.substring(0,curID.length-4);
			var proValueStr = $.trim($('#'+curID+'province').find('option:selected').text());
			var	currentData = provinceSelect.getCityData(proValueStr,cityValueStr);	
			var $dom = $('#'+curID+'area');
			provinceSelect.componentHtml($dom,currentData);
			$('#'+curID+'longitude').val('');
			$('#'+curID+'latitude').val('');
			$('#'+curID+'address').val('');
		});
		$area.selectBoxIt().on('open', function(){
			$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
		});
		$area.selectBoxIt().on('close', function(){
			var curID = $(this).attr('id');
			curID = curID.substring(0,curID.length-4);
			$('#'+curID+'longitude').val('');
			$('#'+curID+'latitude').val('');
			$('#'+curID+'address').val('');
		});
	}
}
//baidumap的省市联动-赋值
provinceSelect.fillValueBaiDuMap = function(id,value){
	if(typeof(value) == 'object'){
		if(!$.isEmptyObject(value)){
			var proStr = typeof(value.province) == 'string' ? value.province : '';
			var cityStr = typeof(value.city) == 'string' ? value.city : '';
			var areaStr = typeof(value.city) == 'string' ? value.area : '';
			var longitudeStr = typeof(value.longitude) == 'number' ? value.longitude : '';
			var latitudeStr = typeof(value.latitude) == 'number' ? value.latitude : '';
			var addressStr = typeof(value.address) == 'string' ? value.address : '';
			if($('#'+id+'-province').length > 0){
				if(proStr !== ''){
					var proArr = provinceSelect.getProvData(proStr);
					var cityArr = proArr[0];
					var proCode = proArr[1];

					var $dom = $('#'+id+'-province');
					$dom.val(proCode);
					var proselectBoxit = $dom.selectBoxIt().data("selectBox-selectBoxIt");
					proselectBoxit.refresh();
					if(proStr === cityStr){
						cityStr = "市辖区";
					}
					var areaArr = provinceSelect.getCityData(proStr,cityStr);

					provinceSelect.componentHtml($('#'+id+'-city'),cityArr,cityStr);
					provinceSelect.componentHtml($('#'+id+'-area'),areaArr,areaStr);
				}
			}
			if($('#'+id+'-longitude').length > 0){
				$('#'+id+'-longitude').val(longitudeStr);
			}
			if($('#'+id+'-latitude').length > 0){
				$('#'+id+'-latitude').val(latitudeStr);
			}
			if($('#'+id+'-address').length > 0){
				$('#'+id+'-address').val(addressStr);
			}
		}
	}
}