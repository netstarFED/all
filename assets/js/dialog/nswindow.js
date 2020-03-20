var nswindow = {};
nswindow.configDefault = function(config){
	if(typeof(config.container)=='undefined'){
		config.container = 'body';
	}
}
nswindow.filterCode = function(filterHtml,tag){
	var firstTag = filterHtml.substr(filterHtml.indexOf("<"+tag), 100);
	firstTag = firstTag.substring(0, firstTag.indexOf(">")+1);
	var lastTag = filterHtml.substr(filterHtml.lastIndexOf(tag+">")-100+tag.length+1,100);
	lastTag = lastTag.substr(lastTag.lastIndexOf("<"),lastTag.length);
	filterHtml = filterHtml.substring(filterHtml.indexOf(firstTag)+firstTag.length, filterHtml.lastIndexOf(lastTag));
	return filterHtml;
}
nswindow.data = {};
nswindow.getContainer = function(config,containerID){
	var windowHeight = $(window).height()-100;
	windowHeight = "height:"+windowHeight+"px; ";
	var slideWidth = $(".sidebar-menu").width();
	var windowWidth = $(window).width()-100-slideWidth;
	windowWidth = "width:"+windowWidth+"px; ";

	var styleStr = 'style="'+windowHeight+windowWidth+'"';
	var windowHtml = '<div id="'+containerID+'" class="nswindow" '+styleStr+'></div>';
	$(".page-container").children(".main-content").append(windowHtml);
}
nswindow.init = function(config){
	nswindow.configDefault(config);
	var containerID = "dialog-more-"+Math.floor(Math.random()*10000000000+1);
	nswindow.getContainer(config,containerID);
	$.ajax(
	{
		url: config.url,
		data:"",
		success:function(data){
			dataObj = data;
			var formatStr = data;
			formatStr = nswindow.filterCode(formatStr,config.container);
			console.log(formatStr);
			$("#"+containerID).html(formatStr);
			$("#"+containerID).find("#dialog-more").remove();
			$("#"+containerID).find("#placeholder-popupbox").remove();
			$("#"+containerID).find('.page-loading-overlay').remove();
			$("#"+containerID).find('.settings-pane').remove();

			//$.colorbox({inline:true, href:$("#"+containerID)});
		}
	});
}
nswindow.refresh = function(){
	
}