/**
 * 获取容器可用高度
 * 
 * @returns 容器可用高度 number 像素单位
 */
function getHeight(domStr){
	var dom = $(domStr);
	if(dom.length>=1){
		var fullHeightNum = 0;
		fullHeightNum += dom.height();
		fullHeightNum += parseInt(dom.css('padding-top'));
		fullHeightNum += parseInt(dom.css('padding-bottom'));
		fullHeightNum += parseInt(dom.css('border-top-width'));
		fullHeightNum += parseInt(dom.css('border-bottom-width'));
		fullHeightNum += parseInt(dom.css('margin-top'));
		fullHeightNum += parseInt(dom.css('margin-bottom'));
		if(isNaN(fullHeightNum)){
			fullHeightNum = 0;
		}
		return fullHeightNum;
	}else{
		return 0;
	};	
}
function getContainerHeight(domStr){
	var dom = $(domStr);
	if(dom.length>=1){
		var fullHeightNum = 0;
		fullHeightNum += dom.height();
		fullHeightNum += parseInt(dom.css('padding-top'));
		fullHeightNum += parseInt(dom.css('padding-bottom'));
		fullHeightNum += parseInt(dom.css('border-top-width'));
		fullHeightNum += parseInt(dom.css('border-bottom-width'));
		if(isNaN(fullHeightNum)){
			fullHeightNum = 0;
		}
		return fullHeightNum;
	}else{
		return 0;
	};	
}
/**
 * 获取容器可用高度
 * 
 * @returns 屏幕内容区域可用高度 number 像素单位
 */
function getMainHeight(){
	var usageHeightNum = 0;
	//四个部件
	usageHeightNum += getHeight(".navbar.user-info-navbar");
	usageHeightNum += getHeight("div.page-title");
	usageHeightNum += getHeight("footer.main-footer");
	usageHeightNum += getHeight("#panel-menus .panel-heading");
	//其它content占用的位置
	usageHeightNum += parseInt($(".main-content").css('padding-top')); //去掉内容框的padding-top
	var planeBodyHeight = $(window).height()-usageHeightNum; 
	return planeBodyHeight;
}