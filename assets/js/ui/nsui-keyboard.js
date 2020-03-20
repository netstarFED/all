nsUI.keyboard = function(key){
	for(var type in key){
		var keyJson = key[type];
		$.each(keyJson, function(i, e) { 
			var newElement = ( /[\+]+/.test(i) ) ? i.replace("+","_") : i;
			$(document).bind('keydown', i, function assets(ev) {
				var keyboardFunc = e;
				keyboardFunc();
				return false;
			});
		});
	}
}
function keyboardPlane(key){
	for(var type in key){
		var keyJson = key[type];
		$.each(keyJson, function(i, e) { 
			var newElement = ( /[\+]+/.test(i) ) ? i.replace("+","_") : i;
			$(document).bind('keydown', i, function assets(ev) {
				var keyboardFunc = e;
				keyboardFunc();
				return false;
			});
		});
	}
}