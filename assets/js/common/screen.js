/**
 * 设置内容区域最大化 部分浏览器无效
 * 
 * @returns
 */
function nsfullscreen(){
	if(!isFullScrenn){
		var docElm = document.documentElement;
		var isRun = false;
		if (docElm.requestFullscreen) { 
			isRun = true;
			docElm.requestFullscreen(); 
		}
		else if (docElm.mozRequestFullScreen) { 
			isRun = true;
			docElm.mozRequestFullScreen(); 
		}
		else if (docElm.webkitRequestFullScreen) { 
			isRun = true;
			docElm.webkitRequestFullScreen(); 
	 	}
		else if (docElm.msRequestFullscreen) {
			isRun = true;
			docElm.msRequestFullscreen();
		}
		if(isRun){
			if(isFullScrenn == false){
				isFullScrenn = true;
				toastr.success(language.common.screen.fullScreen);
				$("#icon-fullscreen").attr("class","fa-compress")
			}
		}else{
			toastr.warning(language.common.screen.noFullScreen);
		}
		
		// setTimeout(function(){
		// 	var screenHeight = window.screen.height;
		// 	var documentHeight = document.body.scrollHeight;
		// 	isFullHeight = screenHeight==documentHeight;
		// 	var screenWidth = window.screen.width;
		// 	var documentWidth = document.body.scrollWidth;
		// 	isFullWidth = screenWidth==documentWidth;

		// 	if(isFullWidth||isFullHeight){
		// 		toastr.success(language.common.screen.fullScreen);
		// 		isFullScrenn = true;
		// 		$("#icon-fullscreen").attr("class","fa-compress")
		// 	}else{
		// 		toastr.warning(language.common.screen.noFullScreen);
		// 	}
		// },100);
	}else{
		if(document.exitFullscreen) {
			document.exitFullscreen();
		} 
		else if(document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} 
		else if(document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}
		else if (document.msExitFullscreen) {  
            document.msExitFullscreen();  
        }
		isFullScrenn = false;
		$("#icon-fullscreen").attr("class","fa-arrows-alt")
	}
	
}