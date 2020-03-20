baseFrame.init = function(){
	var navHeight = getHeight(".navbar.user-info-navbar");
	var titleHeight = getHeight(".page-title.nav-form");
	$(".frame-left").attr("style","top:"+(navHeight+titleHeight+15)+"px");
}
//添加动画的三个方法
$.fn.extend({
	//添加动画
	animateCss: function (animationName) {
		var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
		this.addClass('animated ' + animationName).one(animationEnd, function() {
			$(this).removeClass('animated ' + animationName);
		});
	},
	//把隐藏的组件显示出来并添加动画
	animateShow: function (animationName) {
		var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
		$(this).css('display','block');
		this.addClass('animated ' + animationName).one(animationEnd, function() {
			$(this).removeClass('animated ' + animationName);
		});
	},
	//把显示的组件隐藏起来并添加动画
	animateHide: function (animationName) {
		var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
		this.addClass('animated ' + animationName).one(animationEnd, function() {
			$(this).removeClass('animated ' + animationName);
			$(this).css('display','none');
		});
	}
});