/****
***格式化树结构数据****
********/
/******************** 格式化树结构数据 start ***********************/
nsDataFormat = {
	tree:{},//存放tree对象集
};
nsDataFormat.getTreeDataByRows = function(resData, resConfig){
	var textField = resConfig.textField;
	var valueField = resConfig.valueField;
	var parentIdField = resConfig.parentIdField;
	var idField = resConfig.idField;
	var openState = resConfig.openState;
	var childIdField = resConfig.childIdField;
	var dataByIdObject = {};//根据id读取数据
	var dataByPidObject = {};//根据pid存放子元素id
	//排序从小到大
	resData.sort(function(a,b){
		return a[idField] - b[idField];
	});
	var tempRootId = -1;
	var parentIdTempObj = {};
	var idTempObj = {};
	
	var treeData = nsDataFormat.convertToTree(resData,idField,parentIdField,childIdField);
	if(openState){
		switch(openState.type){
			case 'level':
				//按层级关系
				getTreeOpenByLevel(openState.value);
				break;
			case 'id':
				//根据id值
				getTreeOpenById(openState.value);
				break;
			case 'field':
				//按字段值
				getTreeOpenByField(openState.value);
				break;
		}
	}
	function getTreeOpenByLevel(value){
		if(value[0] === -1){
			for(var levelI=0; levelI<resData.length; levelI++){
				resData[levelI].open = true;
			}
		}else{
			//树结构共有几层
			var totalTreeLevel = 0;
			var dataByLevelObject = {};	//按等级来存放数据
			for(var i=0; i<treeData.length; i++){
				//treeData[i].level = 0;
				if(dataByLevelObject[0]){
					dataByLevelObject[0].push(treeData[i]);
				}else{
					dataByLevelObject[0] = [];
					dataByLevelObject[0].push(treeData[i]);
				}
				if($.isArray(treeData[i].children)){
					getLevel(treeData[i].children,0);
				}
			}
			function getLevel(childData,total){
				total ++;
				for(var childI=0; childI<childData.length; childI++){
					//childData[childI].level = total;
					totalTreeLevel = total;
					if(dataByLevelObject[total]){
						dataByLevelObject[total].push(childData[childI]);
					}else{
						dataByLevelObject[total] = [];
						dataByLevelObject[total].push(childData[childI]);
					}
					if($.isArray(childData[childI].children)){
						getLevel(childData[childI].children,total);
					}
				}
			}
			for(var levelI=0; levelI<value.length; levelI++){
				if(levelI > totalTreeLevel){
					//给定的等级要大于目前总共有的等级
					continue;
				}
				var levelNumber = value[levelI];
				for(var nextI=0; nextI<levelNumber; nextI++){
					var cData = dataByLevelObject[nextI];
					for(var dataI=0; dataI<cData.length; dataI++){
						cData[dataI].open = true;
					}
				}
			}
		}
	}
	function getTreeOpenById(value){
		for(var idI=0; idI<resData.length; idI++){
			if(value.indexOf(resData[idI][idField])>-1){
				resData[idI].open = true;
			}
		}
	}
	function getTreeOpenByField(value){
		for(var idI=0; idI<resData.length; idI++){
			resData[idI].open = resData[idI][value[0]];
		}
	}
	return treeData;
}
//list转tree lyw 20180426
nsDataFormat.convertToTree = function(rows,idField,parentIdField,childIdField){
	var idMap = {};
	for(var i = 0; i < rows.length; i++){
		idMap[rows[i][idField]] = rows[i];
	}
	var result = [];
	for(var i = 0; i < rows.length; i++){
		var row = rows[i];	
		if(row[parentIdField] && idMap[row[parentIdField]]){
			var parent = idMap[row[parentIdField]];
			if(!$.isArray(parent.children)){
				parent[childIdField] = [];
			}
			parent.isParent = true;
			parent[childIdField].push(row);
		}else{
			result.push(row);
		}
	}
	return result;
}
//多层数据转换
nsDataFormat.multiLevelCharge = function(data,configObj){
	var treeDataArray = [];
	var treeTextField = configObj.textField;
	var treeValueField = configObj.valueField;
	var treeIdField = configObj.idField;
	var treeChildIdField = configObj.childIdField;
	var textSrcField = treeTextField.substring(0,treeTextField.indexOf('.'));
	var textField = treeTextField.substring(treeTextField.indexOf('.')+1,treeTextField.length);
	//解析文本对应的id和数据来源
	var valueSrcField = treeValueField.substring(0,treeValueField.indexOf('.'));
	var valueField = treeValueField.substring(treeValueField.indexOf('.')+1,treeValueField.length);
	//解析唯一标识id和数据来源
	var idSrcField = treeIdField.substring(0,treeIdField.indexOf('.'));
	var idField = treeIdField.substring(treeIdField.indexOf('.')+1,treeIdField.length);
	for(var indexI=0; indexI<data.length; indexI++){
		var cTreeData = {parentId:'-1'};
		cTreeData[textField] = data[indexI][textSrcField][textField];
		cTreeData[valueField] = data[indexI][valueSrcField][valueField];
		cTreeData[idField] = data[indexI][idSrcField][idField];
		if($.isArray(data[indexI][treeChildIdField])){
			cTreeData[treeChildIdField] = getChildData(data[indexI][treeChildIdField],data[indexI][valueSrcField][valueField]);
		}
		treeDataArray.push(cTreeData);
	}
	//递归读取tree子元素
	function getChildData(childData,pid){
		var childArray = [];
		for(var childI=0; childI<childData.length; childI++){
			var cJson = {parentId:pid};
			cJson[textField] = childData[childI][textSrcField][textField];
			cJson[valueField] = childData[childI][valueSrcField][valueField];
			cJson[idField] = childData[childI][idSrcField][idField];
			if($.isArray(childData[childI][treeChildIdField])){
				cJson[treeChildIdField] = getChildData(childData[childI][treeChildIdField],childData[childI][valueSrcField][valueField]);
			}
			childArray.push(cJson);
		}
		return childArray;
	}
	return treeDataArray;
}
/********************* 格式化树结构数据 end  ***********************/
/********************* lyw 20190412 地址添加五笔拼音,生成新对象code-->地址信息 start ***********************/
$(document).ready(function(){
	nsDataFormat.formatProvince = (function($){
		var provinceNameByCode = {};
		var provinceInfoByCode = {};

		//获取五笔编码和拼音编码有问题存在，临时处理如下
		var getWBCode = function(str){return str};
		var getPYCode = function(str){return str};
		if(typeof(NetstarIME)=='object'){
			getWBCode = NetstarIME.getWBCode;
			getPYCode = NetstarIME.getPYCode;
		}
		
		if($.isArray(provinceInfo)){
			// 设置五笔/拼音
			for(var i=0;i<provinceInfo.length;i++){
				var nameI = provinceInfo[i].name;
				var wbI = getWBCode(nameI);
				var pinyinI = getPYCode(nameI);
				provinceInfo[i].wb = wbI;
				provinceInfo[i].pinyin = pinyinI;
				var subI = provinceInfo[i].sub;
				if($.isArray(subI)){
					for(var j=0;j<subI.length;j++){
						var nameJ = subI[j].name;
						var wbJ = getWBCode(nameJ);
						var pinyinJ = getPYCode(nameJ);
						subI[j].wb = wbJ;
						subI[j].pinyin = pinyinJ;
						var subJ = subI[j].sub;
						if($.isArray(subJ)){
							for(var k=0;k<subJ.length;k++){
								var nameK = subJ[k].name;
								var wbK = getWBCode(nameK);
								var pinyinK = getPYCode(nameK);
								subJ[k].wb = wbK;
								subJ[k].pinyin = pinyinK;
							}
						}
					}
				}
			}
			var provinceInfoObj = {};
			function setprovinceInfoObj(arr, index){
				var end = index*2;
				var parentEnd = (index-1)*2;
				for(var i=0;i<arr.length;i++){
					var obj = arr[i];
					var code = obj.code;
					code = code.substring(0, end);
					var parentCode = code.substring(0, parentEnd);
					var parentObj = provinceInfoObj[parentCode];
					if(typeof(parentObj)=="object"){
						var name = obj.name;
						name = parentObj.name + ' ' + name;
						obj.name = name
					}
					provinceInfoObj[code] = obj;
					if($.isArray(obj.sub)){
						setprovinceInfoObj(obj.sub, index+1);
					}
				}
			}
			var _provinceInfo = $.extend(true, [], provinceInfo);
			setprovinceInfoObj(_provinceInfo, 1);
			for(var key in provinceInfoObj){
				provinceNameByCode[provinceInfoObj[key].code] = provinceInfoObj[key].name;
				provinceInfoByCode[provinceInfoObj[key].code] = provinceInfoObj[key];
			}
		}
		return {
			provinceInfo : provinceInfo,
			provinceNameByCode : provinceNameByCode, 
			provinceInfoByCode : provinceInfoByCode,
		}
	})(jQuery)
})
/********************* lyw 20190412 地址添加五笔拼音,生成新对象code-->地址信息 end *************************/
/******已知根id的情况处理数据 start****/
	/*for(var dataI=0; dataI<resData.length; dataI++){
		//判断此元素的pid是否存在于数据对象中
		if(isExistInArray(resData[dataI][parentIdField],dataByPidObject)>-1){
			dataByPidObject[resData[dataI][parentIdField]].push(resData[dataI][idField]);
		}else{
			dataByPidObject[resData[dataI][parentIdField]] = [];
			dataByPidObject[resData[dataI][parentIdField]].push(resData[dataI][idField]);
		}
		dataByIdObject[resData[dataI][idField]] = resData[dataI];
	}
	//判断是否存在于数组中
	function isExistInArray(cData,allData){
		var index = -1;
		var increaseNum = 0;
		for(key in allData){
			increaseNum++;
			if(key == cData){
				index = increaseNum-1;
				break;
			}
		}
		return index;
	}
	//递归子元素
	function getChildData(pid){
		var cArray = [];
		var cPidArray = dataByPidObject[pid];
		for(var i=0; i<cPidArray.length; i++){
			cArray.push(dataByIdObject[cPidArray[i]]);
			if(isExistInArray(cPidArray[i],dataByPidObject)==-1)
			{
				//终止
				continue;
			}
			cArray[i].children = getChildData(cPidArray[i]);
		}
		return cArray;
	}
	var pidArray = [];
	for(var pid in dataByPidObject){
		pidArray.push(pid);
	}
	var treeData = getChildData(pidArray[0]);*/
/******已知根id的情况处理数据 end****/