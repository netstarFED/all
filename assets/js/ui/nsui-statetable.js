/**
 * 带状态和弹出框的静态表格
 */
nsUI.stateTable = function(tableID,dataJson){
	var firstTr = $("table#"+tableID+" tr").eq(0);
	var colNum = firstTr.children('td').length;
	var widthNum  = 100/colNum+'%';
	firstTr.children('td').attr('style','width:'+widthNum);
	var popoverOption = {
		'placement':"top",
		'container':"body",
		'trigger':'hover'
	}
	$("table#"+tableID+" tr td[data-content]").popover(popoverOption);
	if(typeof(dataJson)!='object'){
		return false;
	};
	
	var ruleObjArr = []
	$.each(dataJson, function(key,value){
		var cObj = {};
		cObj[key] = value;
		ruleObjArr.push(cObj);
	});
	var ruleObjOrderArr = ruleObjArr.sort(
		function(a, b)
		{
			var aValue,bValue;
			for(var key in a){
				aValue = a[key];
			}
			for(var key in b){
				bValue = b[key];
			}
			if(aValue < bValue) return -1;
			if(aValue > bValue) return 1;
			return 0;
		}
	);
	var ruleOrderArr = [];
	var ruleOrderKeyArr = [];
	var noneClassKeyIndex = 0;
	$.each(ruleObjOrderArr, function(i,value){
		var valueArr;
		var valueKey;
		var keyIndex;
		for(var key in value){
			valueKey = key;
			valueArr = value[key];
			if(key=='none'){
				noneClassKeyIndex = keyIndex;
			}
			keyIndex++;
		}
		ruleOrderKeyArr.push(valueKey);
		ruleOrderArr.push(valueArr);
	});
	var tdArr = $("table#"+tableID+" tr td");
	for(var tdI=0; tdI<tdArr.length; tdI++){
		if($(tdArr[tdI]).text()!=''){
			var tdNum = Number($(tdArr[tdI]).text());
			var tdNumIndex = noneClassKeyIndex;  //默认为none所对应的下表
			for(var arrI=0; arrI<ruleOrderArr.length; arrI++){
				//console.log('i:'+arrI);
				//console.log(ruleOrderArr[arrI])
				if(arrI==(ruleOrderArr.length-1)){
					//最后一次循环
					if(ruleOrderArr[arrI][0]!=ruleOrderArr[arrI][1]){
						if(tdNum>=ruleOrderArr[arrI][0]&&tdNum<=ruleOrderArr[arrI][1]){
							tdNumIndex = arrI;
						}
					}else{
						if(tdNum==ruleOrderArr[arrI][0]){
							tdNumIndex = arrI;
						}
					}
				}else{
					if(ruleOrderArr[arrI][1]==ruleOrderArr[arrI][1]){
						//当前组的最大数等于下一组的最小数 执行大于等于第一个数，小于第二个数
						if(ruleOrderArr[arrI][0]!=ruleOrderArr[arrI][1]){
							if(tdNum>=ruleOrderArr[arrI][0]&&tdNum<ruleOrderArr[arrI][1]){
								tdNumIndex = arrI;
							}
						}else{
							if(tdNum==ruleOrderArr[arrI][0]){
								tdNumIndex = arrI;
							}
						}
					}else{
						//当前组的最大数等于下一组的最小数 执行大于等于第一个数，小于等于第二个数
						if(ruleOrderArr[arrI][0]!=ruleOrderArr[arrI][1]){
							if(tdNum>=ruleOrderArr[arrI][0]&&tdNum<=ruleOrderArr[arrI][1]){
								tdNumIndex = arrI;
							}
						}else{
							if(tdNum==ruleOrderArr[arrI][0]){
								tdNumIndex = arrI;
							}
						}
					}
				}

			}
			var className ='';
			if(typeof(ruleOrderKeyArr[tdNumIndex])!='undefined'){
				className = ruleOrderKeyArr[tdNumIndex];
				$(tdArr[tdI]).addClass(className);
			}

		}

	}
}