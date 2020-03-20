/***************************************************************************************************
 * nsUI.soundplayer  
 * 声音播放器
 * @returns true/false
 */
//配置文件
$(document).ready(function(){
	nsUI.soundList = {
		insert: 	getRootPath() + '/assets/sound/insert.wav', 	//插入成功
		stop: 		getRootPath() + '/assets/sound/stop.wav', 		//停止执行
	}
})

nsUI.soundplayer = (function(){
	var config = {mute:false}
	var soundList = nsUI.soundList;
	var soundUrl;
	//播放声音
	function play(url){
		//如果静音弹框警告
		// if(config.mute){
		// 	nsConfirm('已经设置为静音，是否开启？', setMuteFalse, 'warning')
		// 	return false;
		// }
		//是否静音
		if(config.mute){
			return;
		}
		var borswer = window.navigator.userAgent.toLowerCase();
		if(borswer.indexOf( "ie" )>=0){
			//IE老版本
			var playerEmbedHtml = 
				'<embed '
					+'name="nsaudioplayer" '
					+'src="'+url+'" '
					+'autostart="true" '
					+'hidden="true" '
					+'loop="false"'
				+'>'
				+'</embed>';

			if ($("body").find('[name="nsaudioplayer]').length<=0){
				$("body").append(playerEmbedHtml);
			}else{
				$('[name="nsaudioplayer]').attr('src',url);
			}
			
			var embed = document.nsaudioplayer;
			embed.volume = 100;
		}else{
			//非IE
			var playerHtml = 
				'<audio id="ns-audioplayer" '
					+'src="'+url+'" '
					+'hidden="true" '
				+'>';
			if($("#ns-audioplayer").length <= 0 ){
				$("body").append(playerHtml);
			}else{
				$("#ns-audioplayer").attr('src',url);
			}
			
			var audio = document.getElementById("ns-audioplayer");
			audio.play();
		}
	}
	//插入
	function insert(){
		soundUrl = nsUI.soundList.insert;
		play(soundUrl);
	}
	//停止
	function stop(){
		soundUrl = nsUI.soundList.stop;
		play(soundUrl);
	}
	//是否设置静音
	function setMute(isMute){
		//是否设置为静音 true/false
		if(debugerMode){
			if(typeof(isMute)!='boolean'){
				console.error('setMute方法只能接受boolean值参数，当前参数是：'+isMute);
				return;
			}
		}
		
		config.mute = isMute;
	}
	return {
		play:play,
		stop:stop,
		insert:insert,
		config:config,
		setMute:setMute
	}
})(jQuery);