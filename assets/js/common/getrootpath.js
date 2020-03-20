/**
 * 获取路径
 * 
 * @returns
 */
var AJAXASYNC = true;

function getRootPath() {
	// var curWwwPath = window.document.location.href;
	// var pathName = window.document.location.pathname;
	// var pos = curWwwPath.indexOf(pathName);
	// var localhostPaht = curWwwPath.substring(0, pos);
	// var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
	// return (localhostPaht + projectName);
	// lyw 20181213
	// 地址问号后边的内容
	var url = window.document.location.href;
	var paraStr = url.substr(url.indexOf('?') + 1);
	var paraArr = paraStr.split('&');
	var paraObj = {};
	for (var paraI = 0; paraI < paraArr.length; paraI++) {
		equalIndex = paraArr[paraI].indexOf('=');
		paraName = paraArr[paraI].substr(0, equalIndex);
		paraValue = paraArr[paraI].substr(equalIndex + 1);
		paraObj[paraName] = paraValue;
	}
	// 完整地址的参数 
	var pathName = window.document.location.pathname;
	var pos = url.indexOf(pathName);
	var localhostPaht = url.substring(0, pos);
	var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
	// 判断地址参数
	var singlePageMode = paraObj.singlePageMode;
	if (typeof (singlePageMode) == 'undefined') {
		singlePageMode = true;
	} else {
		if (singlePageMode == "true") {
			singlePageMode = true;
		} else {
			singlePageMode = false;
		}
	}
	if (!singlePageMode) {
		AJAXASYNC = false;
		return localhostPaht;
	} else {
		return (localhostPaht + projectName);
	}
}