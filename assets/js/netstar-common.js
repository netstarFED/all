var debugerMode = true;
var nsVals = {};

var treeUI = {};//定义tree面板
var personUI = {};//定义人员面板
var selectFormPlane = {};
nsVals.containerHeight = function(){
	var unavailableHeight = 108; //nav和userinfo高度 调整样式表后重写这个数值
	var windowHeight = $(window).height();
	return (windowHeight-unavailableHeight);
}
//转化字符串成为JSON对象 格式是"a:b,c:d"->{a:b,c:d},字符串中不需要引号和双引号
nsVals.convertOptions = function(optionsStr){
	var options = {};
	var jsonStr = optionsStr;
	var jsonStrArr = jsonStr.split(',');
	if(jsonStr.indexOf(',')<0){
		jsonStrArr = [jsonStr];
	}
	for(var i=0; i<jsonStrArr.length; i++){
		var keyStr = jsonStrArr[i].substr(0,jsonStrArr[i].indexOf(":"));
		var valueStr = jsonStrArr[i].substr(jsonStrArr[i].indexOf(":")+1,jsonStrArr[i].length);
		//去掉字符串中的引号、空格，转化数字和boolean
		keyStr = $.trim(keyStr);
		valueStr = valueStr.replace(/'/g,"");
		valueStr = valueStr.replace(/"/g,'');
		valueStr = $.trim(valueStr);
		if(valueStr=='true'){
			valueStr = true;
		}else if(valueStr=='false'){
			valueStr = false;
		}else if(/^[1-9]\d*|0$/.test(valueStr)){
			valueStr = parseInt(valueStr);
		}
		options[keyStr] = valueStr;
	}

	return options;
}
//清除Null值
nsVals.clearNull = function(obj){
	$.each(obj,function(key,value){
		if(value==null){
			delete obj[key];
		}
	});
	return obj;
}
//获取rules中的数值 ‘max：2, length:3’
nsVals.getRuleNumber = function(configStr,valueName){
	var number;
	var validStr = configStr.substring(configStr.indexOf(valueName), configStr.length);
	
	var endIndexNum = validStr.indexOf(',')
	if(endIndexNum==-1){
		endIndexNum = validStr.length;
	}
	number = validStr.substring(validStr.indexOf(':')+1, endIndexNum);
	number = parseInt(number);
	return number;
}
var nsDebuger = {};
nsDebuger.state = true;
nsDebuger.navCustomConfigValid = function(config){
	var componentsArr = config.btns;
	nsDebuger.ArrTwoValid(componentsArr,'nav',config.id);
}
nsDebuger.formCustomConfigValid = function(config){
	var componentsArr = config.form;
	nsDebuger.ArrTwoValid(componentsArr,'form',config.id);
}
nsDebuger.ArrTwoValid = function(componentsArr,typeName,objName){
	for(var arr1 = 0; arr1<componentsArr.length; arr1++){
		for(var arr2 = 0; arr2<componentsArr[arr1].length; arr2++){
			var currentConfigData = componentsArr[arr1][arr2];
			if(typeName=='nav'){
				if(typeof(currentConfigData.id)=='undefined'||typeof(currentConfigData.text)=='undefined'||typeof(currentConfigData.handler)=='undefined'||typeof(currentConfigData.configShow)=='undefined'||typeof(currentConfigData.required)=='undefined'){
					nsalert(typeName+":"+objName+"参数不完整 第"+arr1+"组 / 第"+arr2+"个",'error');
				}
			}else if(typeName=='form'){
				//暂无规则
			}
		}
	}
}
nsDebuger.runCode = function(){
	var outHtml = $("#form-demo-code-outputHTML").val(); 
	nsdialog.hide();
	setTimeout(function(){
		var ctimer = new Date();
		var runTimer = ctimer.getTime();
		$('container .page-title.nav-form').after(outHtml);
		var ctimer2 = new Date();
		var runTimer2 = ctimer2.getTime();
		var runTimerLong = runTimer2-runTimer;
		ctimer = undefined;
		ctimer2 = undefined;

		nsalert("代码执行完毕 执行时间"+runTimerLong+'毫秒','success')
	},500);
}
nsDebuger.codeDialog = function(title,codeDomID,isRunCode){
	if(typeof(isRunCode)=='undefined'){
		isRunCode = true;
	}
	var configCodeDemo = {
		id: 	"demo-code",
		title: 	title,
		size: 	"b",
		form:[
			{
				id: 		'outputHTML',
				label: 		'HTML代码',
				type: 		'textarea',
				height: 	'300px',
				placeholder:'',
				value: 		function(){return $('#'+codeDomID).html();}
			}
		]
	}
	var btns = 
		[
			{
				text: 		'执行代码',
				handler: 	nsDebuger.runCode,
			}
		]
	if(isRunCode){
		configCodeDemo.btns = btns;
	}
	nsdialog.initShow(configCodeDemo);
}
/*!
	Autosize 3.0.17
	license: MIT
	http://www.jacklmoore.com/autosize
*/
!function(e,t){if("function"==typeof define&&define.amd)define(["exports","module"],t);else if("undefined"!=typeof exports&&"undefined"!=typeof module)t(exports,module);else{var n={exports:{}};t(n.exports,n),e.autosize=n.exports}}(this,function(e,t){"use strict";function n(e){function t(){var t=window.getComputedStyle(e,null);"vertical"===t.resize?e.style.resize="none":"both"===t.resize&&(e.style.resize="horizontal"),l="content-box"===t.boxSizing?-(parseFloat(t.paddingTop)+parseFloat(t.paddingBottom)):parseFloat(t.borderTopWidth)+parseFloat(t.borderBottomWidth),isNaN(l)&&(l=0),a()}function n(t){var n=e.style.width;e.style.width="0px",e.offsetWidth,e.style.width=n,e.style.overflowY=t,r()}function o(e){for(var t=[];e&&e.parentNode&&e.parentNode instanceof Element;)e.parentNode.scrollTop&&t.push({node:e.parentNode,scrollTop:e.parentNode.scrollTop}),e=e.parentNode;return t}function r(){var t=e.style.height,n=o(e),r=document.documentElement&&document.documentElement.scrollTop;e.style.height="auto";var i=e.scrollHeight+l;return 0===e.scrollHeight?void(e.style.height=t):(e.style.height=i+"px",s=e.clientWidth,n.forEach(function(e){e.node.scrollTop=e.scrollTop}),void(r&&(document.documentElement.scrollTop=r)))}function a(){r();var t=window.getComputedStyle(e,null),o=Math.round(parseFloat(t.height)),i=Math.round(parseFloat(e.style.height));if(o!==i?"visible"!==t.overflowY&&n("visible"):"hidden"!==t.overflowY&&n("hidden"),u!==o){u=o;var a=d("autosize:resized");e.dispatchEvent(a)}}if(e&&e.nodeName&&"TEXTAREA"===e.nodeName&&!i.has(e)){var l=null,s=e.clientWidth,u=null,c=function(){e.clientWidth!==s&&a()},p=function(t){window.removeEventListener("resize",c,!1),e.removeEventListener("input",a,!1),e.removeEventListener("keyup",a,!1),e.removeEventListener("autosize:destroy",p,!1),e.removeEventListener("autosize:update",a,!1),i["delete"](e),Object.keys(t).forEach(function(n){e.style[n]=t[n]})}.bind(e,{height:e.style.height,resize:e.style.resize,overflowY:e.style.overflowY,overflowX:e.style.overflowX,wordWrap:e.style.wordWrap});e.addEventListener("autosize:destroy",p,!1),"onpropertychange"in e&&"oninput"in e&&e.addEventListener("keyup",a,!1),window.addEventListener("resize",c,!1),e.addEventListener("input",a,!1),e.addEventListener("autosize:update",a,!1),i.add(e),e.style.overflowX="hidden",e.style.wordWrap="break-word",t()}}function o(e){if(e&&e.nodeName&&"TEXTAREA"===e.nodeName){var t=d("autosize:destroy");e.dispatchEvent(t)}}function r(e){if(e&&e.nodeName&&"TEXTAREA"===e.nodeName){var t=d("autosize:update");e.dispatchEvent(t)}}var i="function"==typeof Set?new Set:function(){var e=[];return{has:function(t){return Boolean(e.indexOf(t)>-1)},add:function(t){e.push(t)},"delete":function(t){e.splice(e.indexOf(t),1)}}}(),d=function(e){return new Event(e)};try{new Event("test")}catch(a){d=function(e){var t=document.createEvent("Event");return t.initEvent(e,!0,!1),t}}var l=null;"undefined"==typeof window||"function"!=typeof window.getComputedStyle?(l=function(e){return e},l.destroy=function(e){return e},l.update=function(e){return e}):(l=function(e,t){return e&&Array.prototype.forEach.call(e.length?e:[e],function(e){return n(e,t)}),e},l.destroy=function(e){return e&&Array.prototype.forEach.call(e.length?e:[e],o),e},l.update=function(e){return e&&Array.prototype.forEach.call(e.length?e:[e],r),e}),t.exports=l});

/* Scroll Monitor */
(function(e){if(typeof define!=="undefined"&&define.amd){define(["jquery"],e)}else if(typeof module!=="undefined"&&module.exports){var t=require("jquery");module.exports=e(t)}else{window.scrollMonitor=e(jQuery)}})(function(e){function m(){return window.innerHeight||document.documentElement.clientHeight}function y(){t.viewportTop=n.scrollTop();t.viewportBottom=t.viewportTop+t.viewportHeight;t.documentHeight=r.height();if(t.documentHeight!==d){g=i.length;while(g--){i[g].recalculateLocation()}d=t.documentHeight}}function b(){t.viewportHeight=m();y();x()}function E(){clearTimeout(w);w=setTimeout(b,100)}function x(){S=i.length;while(S--){i[S].update()}S=i.length;while(S--){i[S].triggerCallbacks()}}function T(n,r){function x(e){if(e.length===0){return}E=e.length;while(E--){S=e[E];S.callback.call(i,v);if(S.isOne){e.splice(E,1)}}}var i=this;this.watchItem=n;if(!r){this.offsets=p}else if(r===+r){this.offsets={top:r,bottom:r}}else{this.offsets=e.extend({},p,r)}this.callbacks={};for(var d=0,m=h.length;d<m;d++){i.callbacks[h[d]]=[]}this.locked=false;var g;var y;var b;var w;var E;var S;this.triggerCallbacks=function(){if(this.isInViewport&&!g){x(this.callbacks[o])}if(this.isFullyInViewport&&!y){x(this.callbacks[u])}if(this.isAboveViewport!==b&&this.isBelowViewport!==w){x(this.callbacks[s]);if(!y&&!this.isFullyInViewport){x(this.callbacks[u]);x(this.callbacks[f])}if(!g&&!this.isInViewport){x(this.callbacks[o]);x(this.callbacks[a])}}if(!this.isFullyInViewport&&y){x(this.callbacks[f])}if(!this.isInViewport&&g){x(this.callbacks[a])}if(this.isInViewport!==g){x(this.callbacks[s])}switch(true){case g!==this.isInViewport:case y!==this.isFullyInViewport:case b!==this.isAboveViewport:case w!==this.isBelowViewport:x(this.callbacks[c])}g=this.isInViewport;y=this.isFullyInViewport;b=this.isAboveViewport;w=this.isBelowViewport};this.recalculateLocation=function(){if(this.locked){return}var n=this.top;var r=this.bottom;if(this.watchItem.nodeName){var i=this.watchItem.style.display;if(i==="none"){this.watchItem.style.display=""}var s=e(this.watchItem).offset();this.top=s.top;this.bottom=s.top+this.watchItem.offsetHeight;if(i==="none"){this.watchItem.style.display=i}}else if(this.watchItem===+this.watchItem){if(this.watchItem>0){this.top=this.bottom=this.watchItem}else{this.top=this.bottom=t.documentHeight-this.watchItem}}else{this.top=this.watchItem.top;this.bottom=this.watchItem.bottom}this.top-=this.offsets.top;this.bottom+=this.offsets.bottom;this.height=this.bottom-this.top;if((n!==undefined||r!==undefined)&&(this.top!==n||this.bottom!==r)){x(this.callbacks[l])}};this.recalculateLocation();this.update();g=this.isInViewport;y=this.isFullyInViewport;b=this.isAboveViewport;w=this.isBelowViewport}function O(e){v=e;y();x()}var t={};var n=e(window);var r=e(document);var i=[];var s="visibilityChange";var o="enterViewport";var u="fullyEnterViewport";var a="exitViewport";var f="partiallyExitViewport";var l="locationChange";var c="stateChange";var h=[s,o,u,a,f,l,c];var p={top:0,bottom:0};t.viewportTop;t.viewportBottom;t.documentHeight;t.viewportHeight=m();var d;var v;var g;var w;var S;T.prototype={on:function(e,t,n){switch(true){case e===s&&!this.isInViewport&&this.isAboveViewport:case e===o&&this.isInViewport:case e===u&&this.isFullyInViewport:case e===a&&this.isAboveViewport&&!this.isInViewport:case e===f&&this.isAboveViewport:t();if(n){return}}if(this.callbacks[e]){this.callbacks[e].push({callback:t,isOne:n})}else{throw new Error("Tried to add a scroll monitor listener of type "+e+". Your options are: "+h.join(", "))}},off:function(e,t){if(this.callbacks[e]){for(var n=0,r;r=this.callbacks[e][n];n++){if(r.callback===t){this.callbacks[e].splice(n,1);break}}}else{throw new Error("Tried to remove a scroll monitor listener of type "+e+". Your options are: "+h.join(", "))}},one:function(e,t){this.on(e,t,true)},recalculateSize:function(){this.height=this.watchItem.offsetHeight+this.offsets.top+this.offsets.bottom;this.bottom=this.top+this.height},update:function(){this.isAboveViewport=this.top<t.viewportTop;this.isBelowViewport=this.bottom>t.viewportBottom;this.isInViewport=this.top<=t.viewportBottom&&this.bottom>=t.viewportTop;this.isFullyInViewport=this.top>=t.viewportTop&&this.bottom<=t.viewportBottom||this.isAboveViewport&&this.isBelowViewport},destroy:function(){var e=i.indexOf(this),t=this;i.splice(e,1);for(var n=0,r=h.length;n<r;n++){t.callbacks[h[n]].length=0}},lock:function(){this.locked=true},unlock:function(){this.locked=false}};var N=function(e){return function(t,n){this.on.call(this,e,t,n)}};for(var C=0,k=h.length;C<k;C++){var L=h[C];T.prototype[L]=N(L)}try{y()}catch(A){e(y)}n.on("scroll",O);n.on("resize",E);t.beget=t.create=function(t,n){if(typeof t==="string"){t=e(t)[0]}if(t instanceof e){t=t[0]}var r=new T(t,n);i.push(r);r.update();return r};t.update=function(){v=null;y();x()};t.recalculateLocations=function(){t.documentHeight=0;t.update()};return t})



/* Count It Up */
function countUp(a,b,c,d,e,f){for(var g=0,h=["webkit","moz","ms","o"],i=0;i<h.length&&!window.requestAnimationFrame;++i)window.requestAnimationFrame=window[h[i]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[h[i]+"CancelAnimationFrame"]||window[h[i]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(a){var c=(new Date).getTime(),d=Math.max(0,16-(c-g)),e=window.setTimeout(function(){a(c+d)},d);return g=c+d,e}),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(a){clearTimeout(a)}),this.options=f||{useEasing:!0,useGrouping:!0,separator:",",decimal:"."},""==this.options.separator&&(this.options.useGrouping=!1),null==this.options.prefix&&(this.options.prefix=""),null==this.options.suffix&&(this.options.suffix="");var j=this;this.d="string"==typeof a?document.getElementById(a):a,this.startVal=Number(b),this.endVal=Number(c),this.countDown=this.startVal>this.endVal?!0:!1,this.startTime=null,this.timestamp=null,this.remaining=null,this.frameVal=this.startVal,this.rAF=null,this.decimals=Math.max(0,d||0),this.dec=Math.pow(10,this.decimals),this.duration=1e3*e||2e3,this.version=function(){return"1.3.1"},this.printValue=function(a){var b=isNaN(a)?"--":j.formatNumber(a);"INPUT"==j.d.tagName?this.d.value=b:this.d.innerHTML=b},this.easeOutExpo=function(a,b,c,d){return 1024*c*(-Math.pow(2,-10*a/d)+1)/1023+b},this.count=function(a){null===j.startTime&&(j.startTime=a),j.timestamp=a;var b=a-j.startTime;if(j.remaining=j.duration-b,j.options.useEasing)if(j.countDown){var c=j.easeOutExpo(b,0,j.startVal-j.endVal,j.duration);j.frameVal=j.startVal-c}else j.frameVal=j.easeOutExpo(b,j.startVal,j.endVal-j.startVal,j.duration);else if(j.countDown){var c=(j.startVal-j.endVal)*(b/j.duration);j.frameVal=j.startVal-c}else j.frameVal=j.startVal+(j.endVal-j.startVal)*(b/j.duration);j.frameVal=j.countDown?j.frameVal<j.endVal?j.endVal:j.frameVal:j.frameVal>j.endVal?j.endVal:j.frameVal,j.frameVal=Math.round(j.frameVal*j.dec)/j.dec,j.printValue(j.frameVal),b<j.duration?j.rAF=requestAnimationFrame(j.count):null!=j.callback&&j.callback()},this.start=function(a){return j.callback=a,isNaN(j.endVal)||isNaN(j.startVal)?(console.log("countUp error: startVal or endVal is not a number"),j.printValue()):j.rAF=requestAnimationFrame(j.count),!1},this.stop=function(){cancelAnimationFrame(j.rAF)},this.reset=function(){j.startTime=null,j.startVal=b,cancelAnimationFrame(j.rAF),j.printValue(j.startVal)},this.resume=function(){j.stop(),j.startTime=null,j.duration=j.remaining,j.startVal=j.frameVal,requestAnimationFrame(j.count)},this.formatNumber=function(a){a=a.toFixed(j.decimals),a+="";var b,c,d,e;if(b=a.split("."),c=b[0],d=b.length>1?j.options.decimal+b[1]:"",e=/(\d+)(\d{3})/,j.options.useGrouping)for(;e.test(c);)c=c.replace(e,"$1"+j.options.separator+"$2");return j.options.prefix+c+d+j.options.suffix},j.printValue(j.startVal)}


/*! perfect-scrollbar - v0.5.2
* http://noraesae.github.com/perfect-scrollbar/ */
(function(e){"use strict";"function"==typeof define&&define.amd?define(["jquery"],e):"object"==typeof exports?e(require("jquery")):e(jQuery)})(function(e){"use strict";var t={wheelSpeed:1,wheelPropagation:!1,minScrollbarLength:null,maxScrollbarLength:null,useBothWheelAxes:!1,useKeyboard:!0,suppressScrollX:!1,suppressScrollY:!1,scrollXMarginOffset:0,scrollYMarginOffset:0,includePadding:!1},o=function(){var e=0;return function(){var t=e;return e+=1,".perfect-scrollbar-"+t}}();e.fn.perfectScrollbar=function(n,r){return this.each(function(){var l=e.extend(!0,{},t),a=e(this);if("object"==typeof n?e.extend(!0,l,n):r=n,"update"===r)return a.data("perfect-scrollbar-update")&&a.data("perfect-scrollbar-update")(),a;if("destroy"===r)return a.data("perfect-scrollbar-destroy")&&a.data("perfect-scrollbar-destroy")(),a;if(a.data("perfect-scrollbar"))return a.data("perfect-scrollbar");a.addClass("ps-container");var s,i,c,d,u,p,f,v,h,b,g=e("<div class='ps-scrollbar-x-rail'></div>").appendTo(a),m=e("<div class='ps-scrollbar-y-rail'></div>").appendTo(a),w=e("<div class='ps-scrollbar-x'></div>").appendTo(g),T=e("<div class='ps-scrollbar-y'></div>").appendTo(m),L=parseInt(g.css("bottom"),10),y=L===L,I=y?null:parseInt(g.css("top"),10),S=parseInt(m.css("right"),10),C=S===S,x=C?null:parseInt(m.css("left"),10),D="rtl"===a.css("direction"),X=o(),Y=parseInt(g.css("borderLeftWidth"),10)+parseInt(g.css("borderRightWidth"),10),P=parseInt(g.css("borderTopWidth"),10)+parseInt(g.css("borderBottomWidth"),10),k=function(e,t){var o=e+t,n=d-h;b=0>o?0:o>n?n:o;var r=parseInt(b*(p-d)/(d-h),10);a.scrollTop(r)},E=function(e,t){var o=e+t,n=c-f;v=0>o?0:o>n?n:o;var r=parseInt(v*(u-c)/(c-f),10);a.scrollLeft(r)},M=function(e){return l.minScrollbarLength&&(e=Math.max(e,l.minScrollbarLength)),l.maxScrollbarLength&&(e=Math.min(e,l.maxScrollbarLength)),e},W=function(){var e={width:c,display:s?"inherit":"none"};e.left=D?a.scrollLeft()+c-u:a.scrollLeft(),y?e.bottom=L-a.scrollTop():e.top=I+a.scrollTop(),g.css(e);var t={top:a.scrollTop(),height:d,display:i?"inherit":"none"};C?t.right=D?u-a.scrollLeft()-S-T.outerWidth():S-a.scrollLeft():t.left=D?a.scrollLeft()+2*c-u-x-T.outerWidth():x+a.scrollLeft(),m.css(t),w.css({left:v,width:f-Y}),T.css({top:b,height:h-P}),s?a.addClass("ps-active-x"):a.removeClass("ps-active-x"),i?a.addClass("ps-active-y"):a.removeClass("ps-active-y")},j=function(){g.hide(),m.hide(),c=l.includePadding?a.innerWidth():a.width(),d=l.includePadding?a.innerHeight():a.height(),u=a.prop("scrollWidth"),p=a.prop("scrollHeight"),!l.suppressScrollX&&u>c+l.scrollXMarginOffset?(s=!0,f=M(parseInt(c*c/u,10)),v=parseInt(a.scrollLeft()*(c-f)/(u-c),10)):(s=!1,f=0,v=0,a.scrollLeft(0)),!l.suppressScrollY&&p>d+l.scrollYMarginOffset?(i=!0,h=M(parseInt(d*d/p,10)),b=parseInt(a.scrollTop()*(d-h)/(p-d),10)):(i=!1,h=0,b=0,a.scrollTop(0)),b>=d-h&&(b=d-h),v>=c-f&&(v=c-f),W(),l.suppressScrollX||g.show(),l.suppressScrollY||m.show()},O=function(){var t,o;w.bind("mousedown"+X,function(e){o=e.pageX,t=w.position().left,g.addClass("in-scrolling"),e.stopPropagation(),e.preventDefault()}),e(document).bind("mousemove"+X,function(e){g.hasClass("in-scrolling")&&(E(t,e.pageX-o),j(),e.stopPropagation(),e.preventDefault())}),e(document).bind("mouseup"+X,function(){g.hasClass("in-scrolling")&&g.removeClass("in-scrolling")}),t=o=null},q=function(){var t,o;T.bind("mousedown"+X,function(e){o=e.pageY,t=T.position().top,m.addClass("in-scrolling"),e.stopPropagation(),e.preventDefault()}),e(document).bind("mousemove"+X,function(e){m.hasClass("in-scrolling")&&(k(t,e.pageY-o),j(),e.stopPropagation(),e.preventDefault())}),e(document).bind("mouseup"+X,function(){m.hasClass("in-scrolling")&&m.removeClass("in-scrolling")}),t=o=null},A=function(e,t){var o=a.scrollTop();if(0===e){if(!i)return!1;if(0===o&&t>0||o>=p-d&&0>t)return!l.wheelPropagation}var n=a.scrollLeft();if(0===t){if(!s)return!1;if(0===n&&0>e||n>=u-c&&e>0)return!l.wheelPropagation}return!0},B=function(){var e=!1,t=function(e){var t=e.originalEvent.deltaX,o=-1*e.originalEvent.deltaY;return(t===void 0||o===void 0)&&(t=-1*e.originalEvent.wheelDeltaX/6,o=e.originalEvent.wheelDeltaY/6),e.originalEvent.deltaMode&&1===e.originalEvent.deltaMode&&(t*=10,o*=10),t!==t&&o!==o&&(t=0,o=e.originalEvent.wheelDelta),[t,o]},o=function(o){var n=t(o),r=n[0],c=n[1];e=!1,l.useBothWheelAxes?i&&!s?(c?a.scrollTop(a.scrollTop()-c*l.wheelSpeed):a.scrollTop(a.scrollTop()+r*l.wheelSpeed),e=!0):s&&!i&&(r?a.scrollLeft(a.scrollLeft()+r*l.wheelSpeed):a.scrollLeft(a.scrollLeft()-c*l.wheelSpeed),e=!0):(a.scrollTop(a.scrollTop()-c*l.wheelSpeed),a.scrollLeft(a.scrollLeft()+r*l.wheelSpeed)),j(),e=e||A(r,c),e&&(o.stopPropagation(),o.preventDefault())};window.onwheel!==void 0?a.bind("wheel"+X,o):window.onmousewheel!==void 0&&a.bind("mousewheel"+X,o)},H=function(){var t=!1;a.bind("mouseenter"+X,function(){t=!0}),a.bind("mouseleave"+X,function(){t=!1});var o=!1;e(document).bind("keydown"+X,function(n){if(!(n.isDefaultPrevented&&n.isDefaultPrevented()||!t||e(document.activeElement).is(":input,[contenteditable]"))){var r=0,l=0;switch(n.which){case 37:r=-30;break;case 38:l=30;break;case 39:r=30;break;case 40:l=-30;break;case 33:l=90;break;case 32:case 34:l=-90;break;case 35:l=-d;break;case 36:l=d;break;default:return}a.scrollTop(a.scrollTop()-l),a.scrollLeft(a.scrollLeft()+r),o=A(r,l),o&&n.preventDefault()}})},K=function(){var e=function(e){e.stopPropagation()};T.bind("click"+X,e),m.bind("click"+X,function(e){var t=parseInt(h/2,10),o=e.pageY-m.offset().top-t,n=d-h,r=o/n;0>r?r=0:r>1&&(r=1),a.scrollTop((p-d)*r)}),w.bind("click"+X,e),g.bind("click"+X,function(e){var t=parseInt(f/2,10),o=e.pageX-g.offset().left-t,n=c-f,r=o/n;0>r?r=0:r>1&&(r=1),a.scrollLeft((u-c)*r)})},Q=function(){var t=function(e,t){a.scrollTop(a.scrollTop()-t),a.scrollLeft(a.scrollLeft()-e),j()},o={},n=0,r={},l=null,s=!1;e(window).bind("touchstart"+X,function(){s=!0}),e(window).bind("touchend"+X,function(){s=!1}),a.bind("touchstart"+X,function(e){var t=e.originalEvent.targetTouches[0];o.pageX=t.pageX,o.pageY=t.pageY,n=(new Date).getTime(),null!==l&&clearInterval(l),e.stopPropagation()}),a.bind("touchmove"+X,function(e){if(!s&&1===e.originalEvent.targetTouches.length){var l=e.originalEvent.targetTouches[0],a={};a.pageX=l.pageX,a.pageY=l.pageY;var i=a.pageX-o.pageX,c=a.pageY-o.pageY;t(i,c),o=a;var d=(new Date).getTime(),u=d-n;u>0&&(r.x=i/u,r.y=c/u,n=d),e.preventDefault()}}),a.bind("touchend"+X,function(){clearInterval(l),l=setInterval(function(){return.01>Math.abs(r.x)&&.01>Math.abs(r.y)?(clearInterval(l),void 0):(t(30*r.x,30*r.y),r.x*=.8,r.y*=.8,void 0)},10)})},R=function(){a.bind("scroll"+X,function(){j()})},z=function(){a.unbind(X),e(window).unbind(X),e(document).unbind(X),a.data("perfect-scrollbar",null),a.data("perfect-scrollbar-update",null),a.data("perfect-scrollbar-destroy",null),w.remove(),T.remove(),g.remove(),m.remove(),g=m=w=T=s=i=c=d=u=p=f=v=L=y=I=h=b=S=C=x=D=X=null},F=function(t){a.addClass("ie").addClass("ie"+t);var o=function(){var t=function(){e(this).addClass("hover")},o=function(){e(this).removeClass("hover")};a.bind("mouseenter"+X,t).bind("mouseleave"+X,o),g.bind("mouseenter"+X,t).bind("mouseleave"+X,o),m.bind("mouseenter"+X,t).bind("mouseleave"+X,o),w.bind("mouseenter"+X,t).bind("mouseleave"+X,o),T.bind("mouseenter"+X,t).bind("mouseleave"+X,o)},n=function(){W=function(){var e={left:v+a.scrollLeft(),width:f};y?e.bottom=L:e.top=I,w.css(e);var t={top:b+a.scrollTop(),height:h};C?t.right=S:t.left=x,T.css(t),w.hide().show(),T.hide().show()}};6===t&&(o(),n())},G="ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch,J=function(){var e=navigator.userAgent.toLowerCase().match(/(msie) ([\w.]+)/);e&&"msie"===e[1]&&F(parseInt(e[2],10)),j(),R(),O(),q(),K(),B(),G&&Q(),l.useKeyboard&&H(),a.data("perfect-scrollbar",a),a.data("perfect-scrollbar-update",j),a.data("perfect-scrollbar-destroy",z)};return J(),a})}});


/*!
 * hoverIntent v1.8.0 // 2014.06.29 // jQuery v1.9.1+
 * http://cherne.net/brian/resources/jquery.hoverIntent.html
 */
(function($){$.fn.hoverIntent=function(handlerIn,handlerOut,selector){var cfg={interval:100,sensitivity:6,timeout:0};if(typeof handlerIn==="object"){cfg=$.extend(cfg,handlerIn)}else{if($.isFunction(handlerOut)){cfg=$.extend(cfg,{over:handlerIn,out:handlerOut,selector:selector})}else{cfg=$.extend(cfg,{over:handlerIn,out:handlerIn,selector:handlerOut})}}var cX,cY,pX,pY;var track=function(ev){cX=ev.pageX;cY=ev.pageY};var compare=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);if(Math.sqrt((pX-cX)*(pX-cX)+(pY-cY)*(pY-cY))<cfg.sensitivity){$(ob).off("mousemove.hoverIntent",track);ob.hoverIntent_s=true;return cfg.over.apply(ob,[ev])}else{pX=cX;pY=cY;ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}};var delay=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);ob.hoverIntent_s=false;return cfg.out.apply(ob,[ev])};var handleHover=function(e){var ev=$.extend({},e);var ob=this;if(ob.hoverIntent_t){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t)}if(e.type==="mouseenter"){pX=ev.pageX;pY=ev.pageY;$(ob).on("mousemove.hoverIntent",track);if(!ob.hoverIntent_s){ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}}else{$(ob).off("mousemove.hoverIntent",track);if(ob.hoverIntent_s){ob.hoverIntent_t=setTimeout(function(){delay(ev,ob)},cfg.timeout)}}};return this.on({"mouseenter.hoverIntent":handleHover,"mouseleave.hoverIntent":handleHover},cfg.selector)}})(jQuery);


/*! Cookies.js - 0.4.0; */
(function(e){"use strict";var b=function(a,d,c){return 1===arguments.length?b.get(a):b.set(a,d,c)};b._document=document;b._navigator=navigator;b.defaults={path:"/"};b.get=function(a){b._cachedDocumentCookie!==b._document.cookie&&b._renewCache();return b._cache[a]};b.set=function(a,d,c){c=b._getExtendedOptions(c);c.expires=b._getExpiresDate(d===e?-1:c.expires);b._document.cookie=b._generateCookieString(a,d,c);return b};b.expire=function(a,d){return b.set(a,e,d)};b._getExtendedOptions=function(a){return{path:a&& a.path||b.defaults.path,domain:a&&a.domain||b.defaults.domain,expires:a&&a.expires||b.defaults.expires,secure:a&&a.secure!==e?a.secure:b.defaults.secure}};b._isValidDate=function(a){return"[object Date]"===Object.prototype.toString.call(a)&&!isNaN(a.getTime())};b._getExpiresDate=function(a,d){d=d||new Date;switch(typeof a){case "number":a=new Date(d.getTime()+1E3*a);break;case "string":a=new Date(a)}if(a&&!b._isValidDate(a))throw Error("`expires` parameter cannot be converted to a valid Date instance"); return a};b._generateCookieString=function(a,b,c){a=a.replace(/[^#$&+\^`|]/g,encodeURIComponent);a=a.replace(/\(/g,"%28").replace(/\)/g,"%29");b=(b+"").replace(/[^!#$&-+\--:<-\[\]-~]/g,encodeURIComponent);c=c||{};a=a+"="+b+(c.path?";path="+c.path:"");a+=c.domain?";domain="+c.domain:"";a+=c.expires?";expires="+c.expires.toUTCString():"";return a+=c.secure?";secure":""};b._getCookieObjectFromString=function(a){var d={};a=a?a.split("; "):[];for(var c=0;c<a.length;c++){var f=b._getKeyValuePairFromCookieString(a[c]); d[f.key]===e&&(d[f.key]=f.value)}return d};b._getKeyValuePairFromCookieString=function(a){var b=a.indexOf("="),b=0>b?a.length:b;return{key:decodeURIComponent(a.substr(0,b)),value:decodeURIComponent(a.substr(b+1))}};b._renewCache=function(){b._cache=b._getCookieObjectFromString(b._document.cookie);b._cachedDocumentCookie=b._document.cookie};b._areEnabled=function(){var a="1"===b.set("cookies.js",1).get("cookies.js");b.expire("cookies.js");return a};b.enabled=b._areEnabled();"function"===typeof define&& define.amd?define(function(){return b}):"undefined"!==typeof exports?("undefined"!==typeof module&&module.exports&&(exports=module.exports=b),exports.Cookies=b):window.Cookies=b})();

/**
 * 验证值参数是否有效
 * 
 * @returns true是
 */
function parameterValidator(value,errorStr){

}
/**
 * validator 默认值设置
 * 
 * @returns
 */
// 手机号码验证
$.validator.addMethod("ismobile", function(value, element) {
	var ismobile=/^(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9])\d{8}$/;  
	var tel = /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;//d*$;
	return this.optional(element) || (tel.test(value) || ismobile.test(value));
}, "格式有误!");

//自动完成搜索

//邮政编码验证
$.validator.addMethod("postalcode", function(value, element) { 
	return this.optional(element) || (/^[0-9]\d{5}$/.test(value));
}, "格式有误!");

//年份的验证
$.validator.addMethod("year", function(value, element) { 
	return this.optional(element) || (/(19[\d][\d]|20[\d][\d])$/.test(value) && value.length <= 4);
}, "请输入正确年份,1900-2099!");

//月份的验证
$.validator.addMethod("month", function(value, element) { 
	return this.optional(element) || (value >= 1 && value <= 12);
}, "请输入正确月份,1-12");
//身份证号的验证
$.validator.addMethod("Icd", function(value, element) { 
	return this.optional(element) || (IdentityCodeValid(value));
}, "请输入合法身份证号码!");

//luhmCheck银行卡号验证
$.validator.addMethod("bankno", function(value, element) { 
	return this.optional(element) || (luhmCheck(value));
}, "请输入正确的银行卡号!");

function stripHtml(value) {
	// remove html tags and space chars
	return value.replace(/<.[^<>]*?>/g, " ").replace(/&nbsp;|&#160;/gi, " ")
	// remove punctuation
	.replace(/[.(),;:!?%#$'\"_+=\/\-“”’]*/g, "");
}
$.validator.addMethod("maxWords", function(value, element, params) {
	return this.optional(element) || stripHtml(value).match(/\b\w+\b/g).length <= params;
}, $.validator.format("Please enter {0} words or less."));

$.validator.addMethod("precision", function(value, element, params) {console.log(params);
	return this.optional(element) || (commonConfig.getRulesPrecisionNumber(value,params));
}, "不合法!");

$.extend($.validator.messages, {
	required: "必填",
	remote: "验证未通过",
	email: "电子邮件地址",
	url: "有效网址",
	date: "有效日期",
	dateISO: "有效日期 (YYYY-MM-DD)",
	number: "有效数字",
	digits: "只能是数字",
	creditcard: "有效的信用卡号码",
	equalTo: "两次输入不同",
	extension: "后缀无效",
	maxlength: $.validator.format("最多 {0} 个字符"),
	minlength: $.validator.format("最少 {0} 个字符"),
	rangelength: $.validator.format("长度在 {0} 到 {1} 之间"),
	range: $.validator.format("范围在 {0} 到 {1} 之间"),
	max: $.validator.format("不大于 {0} 的数值"),
	min: $.validator.format("不小于 {0} 的数值")
});
$.validator.setDefaults({
	errorClass:"has-error",
	validClass: "has-success",
});

//上传文件的验证
function uploadValid(value){
	var isPassRules = false;
	if($.isArray(value)){
		if(value.length > 0){
			isPassRules = true;
		}
	}else{
		isPassRules = false;
	}
	return isPassRules;
}

//下拉框必填
function selectValid(value,selectArr){
	var isSelect = true;
	if(typeof(value) == 'undefined'){
		isSelect = false;
	}
	if(value === ''){
		isSelect = false;
	}
	if(value == '必填'){
		isSelect = false;
	}
	if(value == '选填'){
		isSelect = false;
	}
	if(selectArr){
		for(var i = 0; i< selectArr.length; i++){
			if(selectArr[i].selected == true){
				isSelect = true;
			}
		}
	}
	return isSelect;
}

function autoCompleteValid(id){
	var value = $('#'+id).val().trim();
	var isComplete = false;
	if(typeof(value)=='undefined' || value == ''){
		isComplete = false;
	}else{
		isComplete = true;
	}
	return isComplete;
}

//银行卡号校验
/**
 *bankno银行卡号
**/
function luhmCheck(bankno){
	var isPassCard = false;
	if (bankno.length < 16 || bankno.length > 19) {
		//银行卡位数应该是16或者19位
		isPassCard = false;
	}
	var num = /^\d*$/; //全数字
	if (!num.exec(bankno)) {
		isPassCard = false;
	}
	//开头6位
	var strBin="10,18,30,35,37,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,58,60,62,65,68,69,84,87,88,94,95,98,99";
	if (strBin.indexOf(bankno.substring(0, 2))== -1) {
		//银行卡号开头6位不符合规范"
		isPassCard = false;
	}
	var lastNum=bankno.substr(bankno.length-1,1);//取出最后一位（与luhm进行比较）
	var first15Num=bankno.substr(0,bankno.length-1);//前15或18位
	var newArr=new Array();
	for(var i=first15Num.length-1;i>-1;i--){ //前15或18位倒序存进数组
		newArr.push(first15Num.substr(i,1));
	}
	var arrJiShu=new Array(); //奇数位*2的积 <9
	var arrJiShu2=new Array(); //奇数位*2的积 >9
	var arrOuShu=new Array(); //偶数位数组
	for(var j=0;j<newArr.length;j++){
		if((j+1)%2==1){//奇数位
			if(parseInt(newArr[j])*2<9)
				arrJiShu.push(parseInt(newArr[j])*2);
			else
				arrJiShu2.push(parseInt(newArr[j])*2);
		}else{//偶数位
			arrOuShu.push(newArr[j]);
		}
	}
	var jishu_child1=new Array();//奇数位*2 >9 的分割之后的数组个位数
	var jishu_child2=new Array();//奇数位*2 >9 的分割之后的数组十位数
	for(var h=0;h<arrJiShu2.length;h++){
		jishu_child1.push(parseInt(arrJiShu2[h])%10);
		jishu_child2.push(parseInt(arrJiShu2[h])/10);
	}
	var sumJiShu=0; //奇数位*2 < 9 的数组之和
	var sumOuShu=0; //偶数位数组之和
	var sumJiShuChild1=0; //奇数位*2 >9 的分割之后的数组个位数之和
	var sumJiShuChild2=0; //奇数位*2 >9 的分割之后的数组十位数之和
	var sumTotal=0;
	for(var m=0;m<arrJiShu.length;m++){
		sumJiShu=sumJiShu+parseInt(arrJiShu[m]);
	}
	for(var n=0;n<arrOuShu.length;n++){
		sumOuShu=sumOuShu+parseInt(arrOuShu[n]);
	}
	for(var p=0;p<jishu_child1.length;p++){
		sumJiShuChild1=sumJiShuChild1+parseInt(jishu_child1[p]);
		sumJiShuChild2=sumJiShuChild2+parseInt(jishu_child2[p]);
	}
	//计算总和
	sumTotal=parseInt(sumJiShu)+parseInt(sumOuShu)+parseInt(sumJiShuChild1)+parseInt(sumJiShuChild2);
	//计算Luhm值
	var k= parseInt(sumTotal)%10==0?10:parseInt(sumTotal)%10;
	var luhm= 10-k;
	if(lastNum==luhm){
		//Luhm验证通过
		isPassCard =  true;
	}
	else{
		//银行卡号必须符合Luhm校验
		isPassCard =  false;
	}
	return isPassCard;
}

//身份证号合法性验证
// 支持15位和18位身份证号
// 支持地址编号、出生日期、校验位验证
function IdentityCodeValid(code) {
	var city = {
		11 : "北京",
		12 : "天津",
		13 : "河北",
		14 : "山西",
		15 : "内蒙古",
		21 : "辽宁",
		22 : "吉林",
		23 : "黑龙江 ",
		31 : "上海",
		32 : "江苏",
		33 : "浙江",
		34 : "安徽",
		35 : "福建",
		36 : "江西",
		37 : "山东",
		41 : "河南",
		42 : "湖北 ",
		43 : "湖南",
		44 : "广东",
		45 : "广西",
		46 : "海南",
		50 : "重庆",
		51 : "四川",
		52 : "贵州",
		53 : "云南",
		54 : "西藏 ",
		61 : "陕西",
		62 : "甘肃",
		63 : "青海",
		64 : "宁夏",
		65 : "新疆",
		71 : "台湾",
		81 : "香港",
		82 : "澳门",
		91 : "国外 "
	};
	var pass = true;

	if (!code || !/^([1-6]\d{5}(19|20)\d\d(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])\d{3}[0-9xX])|([1-6]\d{5}\d\d(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])\d{3})$/i.test(code)) {
		pass = false;
	}

	else if (!city[code.substr(0, 2)]) {
		pass = false;
	} else {
		// 18位身份证需要验证最后一位校验位
		if (code.length == 18) {
			code = code.split('');
			// ∑(ai×Wi)(mod 11)
			// 加权因子
			var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
			// 校验位
			var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
			var sum = 0;
			var ai = 0;
			var wi = 0;
			for (var i = 0; i < 17; i++) {
				ai = code[i];
				wi = factor[i];
				sum += ai * wi;
			}
			var last = parity[sum % 11];
			if (parity[sum % 11] != code[17]) {
				pass = false;
			}
		}
	}
	return pass;
}
/**
 * 获取路径
 * 
 * @returns
 */
function getRootPath() {
	var curWwwPath = window.document.location.href;
	var pathName = window.document.location.pathname;
	var pos = curWwwPath.indexOf(pathName);
	var localhostPaht = curWwwPath.substring(0, pos);
	var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
	return (localhostPaht + projectName);
}
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
/**
 * 设置内容区域最大化 部分浏览器无效
 * 
 * @returns
 */
var isFullScrenn = false;
function nsfullscreen(){
	if(!isFullScrenn){
		var docElm = document.documentElement;
		if (docElm.requestFullscreen) { 
			docElm.requestFullscreen(); 
		}
		else if (docElm.mozRequestFullScreen) { 
			docElm.mozRequestFullScreen(); 
		}
		else if (docElm.webkitRequestFullScreen) { 
			docElm.webkitRequestFullScreen(); 
	 	}
		else if (elem.msRequestFullscreen) {
			elem.msRequestFullscreen();
		}
		setTimeout(function(){
			var screenHeight = window.screen.height;
			var documentHeight = document.body.scrollHeight;
			isFullHeight = screenHeight==documentHeight;
			var screenWidth = window.screen.width;
			var documentWidth = document.body.scrollWidth;
			isFullWidth = screenWidth==documentWidth;

			if(isFullWidth||isFullHeight){
				toastr.success("已进入全屏，<br>按下ESC或者点击此按钮退出全屏");
				isFullScrenn = true;
				$("#icon-fullscreen").attr("class","fa-compress")
			}else{
				toastr.warning("您的浏览器不支持此方法，<br>您可以按下F11进入全屏<br>也可以更换为Google Chrome或者360浏览器、猎豹浏览器等推荐浏览器");
			}
		},100);
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
		isFullScrenn = false;
		$("#icon-fullscreen").attr("class","fa-arrows-alt")
	}
	
}



/**
 * 左侧菜单
 * 
 * @returns
 */
var mainmenu = {};
mainmenu.init = function(tid,sid,mainmenuIconConfig,homeUrl){
	nsVals.homeUrl = homeUrl;
	mainmenu.mainmenuIconConfig = {};
	var mainmenuDefaultIconConfig = {
		"基本结构": 		"fa-sitemap",
		"Form类": 			"fa-edit",
		"Table类": 			"fa-table",
		"汽修类": 			"fa-car",
		"dialog类": 		"fa-clipboard",
		"leftmenu类": 		"fa-list",
		"button类": 		"fa-mouse-pointer",
		"其他类UI": 		"fa-puzzle-piece",
		"奥来国信财务DEMO": "fa-rmb",
		"页面配置生成": 	"fa-file-text",
		"系统管理": 		"linecons-cog",
		"基础信息管理": 	"linecons-database",
		"项目管理": 		"linecons-calendar",
		"报表管理": 		"linecons-doc",
		"业务处理": 		"linecons-paper-plane",
		"编号规则": 		"linecons-tag",
		"采样管理": 		"linecons-inbox",
		"结果录入": 		"linecons-pencil",
	}
	mainmenu.mainmenuIconConfig = mainmenuDefaultIconConfig;
	for(var iconExist in mainmenu.mainmenuIconConfig){
		for(var icon in mainmenuIconConfig){
			if(icon  == iconExist){
				mainmenu.mainmenuIconConfig[iconExist] = mainmenuIconConfig[icon];
			}else{
				mainmenu.mainmenuIconConfig[icon] = mainmenuIconConfig[icon];
			}
		}
	}
	if(typeof(mainmenu.url)=='undefined'){
		mainmenu.url = getRootPath() + '/assets/json/mainmenu.json';
	}
	if(typeof(mainmenu.type)=='undefined'){
		mainmenu.type = "get";
	}
	if(typeof(mainmenu.data)=='undefined'){
		mainmenu.data = {id:0};
	}
	$.ajax({
			type: mainmenu.type,
			//url: getRootPath() + '/getMenu',
			url: mainmenu.url,
			data:mainmenu.data,
			dataType: "json",
			success: function(data){
				if(data.success){
					mainmenu.data = data;
					mainmenu.currentCalalogID = parseInt(tid);
					mainmenu.currentPageID = parseInt(sid);
					mainmenu.initNav(tid,sid);
					var menuHtml = "";
					for(var topMenuID=0;topMenuID<data.list.length;topMenuID++){
						var subMenuHtml="";
						if(data.list[topMenuID].list){
							subMenuHtml = getSubMenuHtml(data.list[topMenuID].list, topMenuID, sid);
						}
						var hrefStr = "javascript:void(0)";
						if(data.list[topMenuID].permitUrl!=""){
							hrefStr = getRootPath() + data.list[topMenuID].permitUrl;
							if(data.list[topMenuID].singlePageMode){
								var parameterStr = topMenuID;
								var parameterMiniMenu = 'false';
								if(data.list[topMenuID].minMenu){
									if(data.list[topMenuID].minMenu == true){
										parameterMiniMenu = 'true';
									}else{
										parameterMiniMenu = 'false';
									}
								}
								hrefStr = "javascript:nsFrame.loadMenu('"+hrefStr+"','"+parameterStr+"','"+parameterMiniMenu+"');";
							}else{
								var urlStr = hrefStr;
								if(urlStr.indexOf('?')>-1){
									urlStr = urlStr+'&tid='+topMenuID;
								}else{
									urlStr = urlStr+'?tid='+topMenuID;
								}
								hrefStr = urlStr;
							}
						}
						var activeHtml = topMenuID==tid?'class="opened active"':'';
						menuHtml+= 
						'<li '+activeHtml+'>'
							+'<a href="'+hrefStr+'">'
								+'<i class="'+getIcon(data.list[topMenuID].menuName)+'"></i>'
								+'<span class="title">'+data.list[topMenuID].text+'</span>'
							+'</a>'
							+subMenuHtml
						+'</li>'
					}
				}
				$("#main-menu").html(menuHtml);
				setup_sidebar_menu();
			},
			error:function(e){
				toastr.error("菜单加载出错");
			}
		});
	function getSubMenuHtml(listJson, topMenuID, sid){
		var subMenuHtml = "";
		for(var subMenuID = 0; subMenuID<listJson.length; subMenuID++){
			var hrefStr = "javascript:void(0)";
			if(listJson[subMenuID].singlePageMode){
				if(listJson[subMenuID].permitUrl!="" || listJson[subMenuID].permitUrl!=null){
					var url = getRootPath() + listJson[subMenuID].permitUrl;
					var parameterStr = topMenuID + '-' + subMenuID;
					var parameterMiniMenu = 'false';
					if(listJson[subMenuID].minMenu){
						if(listJson[subMenuID].minMenu == true){
							parameterMiniMenu = 'true';
						}
					}
					hrefStr = "javascript:nsFrame.loadMenu('"+url+"','"+parameterStr+"','"+parameterMiniMenu+"');";
				}
			}else{
				if(listJson[subMenuID].permitUrl!="" || listJson[subMenuID].permitUrl!=null){
					var urlStr = listJson[subMenuID].permitUrl;
					if(urlStr.indexOf('?')>-1){
						urlStr = urlStr+'&tid='+topMenuID+'&sid='+subMenuID;
					}else{
						urlStr = urlStr+'?tid='+topMenuID+'&sid='+subMenuID;
					}
					hrefStr = getRootPath() + urlStr;
				}
			}
			var activeHtml = subMenuID==sid?'class="opened active"':'';
			subMenuHtml+=
			 			'<li '+activeHtml+'>'
							+'<a href="'+hrefStr+'">'
								+'<span class="title">'+listJson[subMenuID].text+'</span>'
							+'</a>'
						+'</li>'
		}
		if(subMenuHtml!=""){
			subMenuHtml = '<ul>'+subMenuHtml+'</ul>'
		}
		return subMenuHtml;
	}
	function getIcon(name){
		var iconClass = mainmenu.mainmenuIconConfig[name];
		if(typeof(iconClass) == "undefined"){
			iconClass = "linecons-desktop";
		}
		return iconClass;
	}
}
mainmenu.initNav = function(tid,sid){
	var topNavHtml = "";
	if(tid!=-1){
		topNavHtml = 
			'<li>'
				+'<a href="javascript:void(0);">'+mainmenu.data.list[tid].menuName+'</a>'
			+'</li>'
	}
	var subNavHtml = "";
	if(typeof(sid)=='undefined'){
		sid = -1;
	}
	if(sid!=-1){
		subNavHtml = 
			'<li>'
				+'<a href="javascript:void(0);">'+mainmenu.data.list[tid].list[sid].menuName+'</a>'
			+'</li>'
	}
	var homeHref = getRootPath() + '/home?istree=1';
	if(nsVals.homeUrl){
		homeHref = 'javascript:nsFrame.loadPage("'+nsVals.homeUrl+'");';
	}
	var homeHtml = 
		'<li>'
			+'<a href="'+homeHref+'"><i class="fa-home"></i>首页</a>'
		+'</li>'
	$("#breadcrumb-env ol").html(homeHtml+topNavHtml+subNavHtml);
}
mainmenu.setMin = function(isSetMin){
	if(isSetMin){
		//isSetMin是true，最小化左侧主菜单
		if(public_vars.$sidebarMenu.hasClass('collapsed')){
		//如果已经关闭则不需要操作
		}else{
			public_vars.$sidebarMenu.addClass('collapsed');
			ps_destroy();

			var $openMenuLi = public_vars.$sidebarMenu.find("li.has-sub.opened");
			$openMenuLi.removeClass('expanded opened')
			$openMenuLi.children('ul').removeAttr('style')
		}
	}else{
		if(public_vars.$sidebarMenu.hasClass('collapsed')){
			public_vars.$sidebarMenu.removeClass('collapsed');
			ps_init();
		}else{
			//如果已经展开则不需要操作
		}
	}
}
mainmenu.setCurrentMenu = function(tid,sid){
	if(mainmenu.currentCalalogID==tid && mainmenu.currentPageID==sid){
		//没有改变
		return false;
	}
	if(mainmenu.currentCalalogID!=tid){
		//不在同一个目录下
		$("#main-menu").children("li.opened.active").removeClass('opened active');
		$("#main-menu").children("li.active").removeClass('active');
		var currentCalalogDom = $("#main-menu").children("li")[tid];
		if($(currentCalalogDom).hasClass('expanded')){
			$(currentCalalogDom).addClass('opened active');
		}else{
			$(currentCalalogDom).addClass('opened active expanded');
		}
		$(currentCalalogDom).children('ul').children("li.opened.active").removeClass('opened active');
		var currentPageDom = $(currentCalalogDom).children('ul').children("li")[sid];
		$(currentPageDom).addClass('opened active');
		mainmenu.currentCalalogID = tid;
		mainmenu.currentPageID = sid;
	}else{
		//在同一个目录下
		var currentCalalogDom = $("#main-menu").children("li")[tid];
		$(currentCalalogDom).children('ul').children("li.opened.active").removeClass('opened active');
		var currentPageDom = $(currentCalalogDom).children('ul').children("li")[sid];
		$(currentPageDom).addClass('opened active');
		mainmenu.currentPageID = sid;
	}
}

/**************************************************************************************************
 * baseFrame
 * 基础框架
 * 
 * @returns
 */
var baseFrame = {};
baseFrame.init = function(){
	var navHeight = getHeight(".navbar.user-info-navbar");
	var titleHeight = getHeight(".page-title.nav-form");
	$(".frame-left").attr("style","top:"+(navHeight+titleHeight+15)+"px");
}
$(document).ready(function(){
	baseFrame.init();
})


/***************************************************************************************************
 * 基础配置
 * 
 * @returns
 */
var commonConfig = {};

/**
 * 根据类型生成btn的HTML
 * 
 * @returns btnHtml
 */

var btnGroupIndex = 0;
commonConfig.getBtn = function(btnConfig,source,index,isShowIcon, isShowText){
	//btnConfig: {text:'显示文字',type:'info',columnID:0,handler:function,iconCls:"fa-upload"}
	var isShowIconBln = typeof(arguments[3])!='undefined'?arguments[3]:true;
	var isShowTextBln = typeof(arguments[4])!='undefined'?arguments[4]:true;
	var btnClass = "";
	var tableTooltip = '';
	var tableToolTitle = '';
	if(source == 'table'){
		tableTooltip = 'data-toggle="tooltip"';
		tableToolTitle = 'data-title="'+btnConfig.text+'"';
	}
	//mdoal类默认按钮为info，其它默认为white
	if(typeof(btnConfig.type)=="undefined"){
		if(source == "modal"){
			btnClass = 'btn btn-info';
		}else if(source == "form"){
			btnClass = 'btn btn-white';
		}else if(source == "table"){
			btnClass = 'btn btn-white';
			btnHandler = '';
		}
	}else{
		btnClass = 'btn btn-'+btnConfig.type;
	}
	//如果传进来的处理参数不是字符串而是函数则不添加onclick
	var functionID = ''
	var btnHandler = '';
	var columnID = '';
	var isReturn = '';
	if(typeof(btnConfig.columnID)!='undefined'){
		columnID = 'columnID="'+btnConfig.columnID+'"';
	}
	if(typeof(btnConfig.handler)!='undefined'){
		//fid handler下标生成
		if(typeof(btnConfig.handler)=='function'){
			btnHandler = '';
			functionID = ' fid="'+index+'"';
		}else{
			//functionID = '';
			if(btnConfig.handler.indexOf("(")>-1){
				if(btnConfig.handler.indexOf("'")>-1){
					btnHandler = ' onclick="'+btnConfig.handler+';"';
				}else{
					btnHandler = " onclick='"+btnConfig.handler+";'";
				}
			}else{
				btnHandler = ' onclick="'+btnConfig.handler+'();"';
			}
		}
		//isReturn 是否返回参数
		if(typeof(btnConfig.isReturn)=='boolean'){
			if(btnConfig.isReturn){
				isReturn = 'isReturn="true"';
			}
		}
	}
	var iconHtml = "";
	//参考图标配置，如果自定义了，则不执行，后面的参考值会优先于前面的
	if(typeof(btnConfig.iconCls)=="undefined"){
		//成功和警告的默认图标
		if(btnConfig.type=="success"){
			iconHtml = '<i class="fa-check"></i> ';
		}else if(btnConfig.type=="warning"){
			iconHtml = '<i class="fa-remove"></i> ';
		}

		var btnText = btnConfig.text;
		if(btnText.indexOf("查看")>=0){
			iconHtml = '<i class="fa-file-text-o"></i> ';
		}
		if(btnText.indexOf("库存")>=0){
			iconHtml = '<i class="fa-file-text-o"></i> ';
		}
		if(btnText.indexOf("重置")>=0){
			iconHtml = '<i class="fa-recycle"></i> ';
		}
		if(btnText.indexOf("明细")>=0){
			iconHtml = '<i class="fa-file-text-o"></i> ';
		}
		if(btnText.indexOf("表格")>=0){
			iconHtml = '<i class="fa-table"></i> ';
		}
		if(btnText.indexOf("代码")>=0||btnText.indexOf("模板")>=0){
			iconHtml = '<i class="fa-code"></i> ';
		}
		if(btnText.indexOf("转账")>=0){
			iconHtml = '<i class="fa-exchange"></i> ';
		}
		if(btnText.indexOf("合同")>=0){
			iconHtml = '<i class="fa-file-text-o"></i> ';
		}
		if(btnText.indexOf("拍照")>=0){
			iconHtml = '<i class="fa-camera"></i> ';
		}
		if(btnText.indexOf("照片")>=0){
			iconHtml = '<i class="fa-file-image-o"></i> ';
		}
		if(btnText.indexOf("图片")>=0){
			iconHtml = '<i class="fa-file-image-o"></i> ';
		}
		if(btnText.indexOf("条码")>=0){
			iconHtml = '<i class="fa-barcode"></i> ';
		}
		if(btnText.indexOf("扫码")>=0){
			iconHtml = '<i class="fa-barcode"></i> ';
		}
		if(btnText.indexOf("上传")>=0){
			iconHtml = '<i class="fa-upload"></i> ';
		}
		if(btnText.indexOf("下载")>=0){
			iconHtml = '<i class="fa-download"></i> ';
		}
		if(btnText.indexOf("?")>=0){
			iconHtml = '<i class="fa-question-circle-o"></i>';
		}
		if(btnText.indexOf("编号")>=0){
			iconHtml = '<i class="fa-list-ol"></i> ';
		}
		if(btnText.indexOf("打印")>=0){
			iconHtml = '<i class="fa-print"></i> ';
		}
		if(btnText.indexOf("价格")>=0){
			iconHtml = '<i class="fa-rmb"></i> ';
		}
		if(btnText.indexOf("流程图")>=0){
			iconHtml = '<i class="fa-sitemap"></i> ';
		}
		if(btnText.indexOf("环节")>=0){
			iconHtml = '<i class="fa-cogs"></i> ';
		}
		if(btnText.indexOf("删除")>=0){
			iconHtml = '<i class="fa-trash"></i> ';
		}
		if(btnText.indexOf("搜索")>=0){
			iconHtml = '<i class="fa-search"></i> ';
		}
		if(btnText.indexOf("清除")>=0){
			iconHtml = '<i class="fa-trash"></i> ';
		}
		if(btnText.indexOf("导入")>=0){
			iconHtml = '<i class="fa-sign-in"></i> ';
		}
		if(btnText.indexOf("导出")>=0){
			iconHtml = '<i class="fa-sign-out"></i> ';
		}
		if(btnText.indexOf("结算")>=0){
			iconHtml = '<i class="fa-calculator "></i> ';
		}
		if(btnText.indexOf("更多")>=0){
			iconHtml = '<i class="fa-edit"></i> ';
		}
		if(btnText.indexOf("上移")>=0){
			iconHtml = '<i class="fa-arrow-up"></i> ';
		}
		if(btnText.indexOf("下移")>=0){
			iconHtml = '<i class="fa-arrow-down"></i> ';
		}
		if(btnText.indexOf("升序")>=0){
			iconHtml = '<i class="fa-long-arrow-up"></i> ';
		}
		if(btnText.indexOf("降序")>=0){
			iconHtml = '<i class="fa-long-arrow-down"></i> ';
		}
		if(btnText.indexOf("置顶")>=0){
			iconHtml = '<i class="fa-fast-backward fa-rotate-90 fa-fontsize12"></i> ';
		}
		if(btnText.indexOf("置底")>=0){
			iconHtml = '<i class="fa-fast-backward fa-rotate-270 fa-fontsize12"></i> ';
		}
		if(btnText.indexOf("窗体")>=0){
			iconHtml = '<i class="fa-calculator"></i> ';
		}
		if(btnText.indexOf("附件")>=0){
			iconHtml = '<i class="fa-paperclip"></i> ';
		}
		if(btnText.indexOf("分配")>=0){
			iconHtml = '<i class="fa-random"></i> ';
		}
		if(btnText.indexOf("项目")>=0){
			iconHtml = '<i class="fa-cube"></i> ';
		}
		if(btnText.indexOf("选中")>=0){
			iconHtml = '<i class="fa-mouse-pointer"></i> ';
		}
		if(btnText.indexOf("刷新")>=0){
			iconHtml = '<i class="fa-refresh"></i> ';
		}
		if(btnText.indexOf("回退")>=0){
			iconHtml = '<i class="fa-arrow-left"></i> ';
		}
		if(btnText.indexOf("前进")>=0){
			iconHtml = '<i class="fa-arrow-right"></i> ';
		}
		if(btnText.indexOf("返回")>=0){
			iconHtml = '<i class="fa-mail-reply"></i> ';
		}
		if(btnText.indexOf("上一步")>=0){
			iconHtml = '<i class="fa-arrow-left"></i> ';
		}
		if(btnText.indexOf("下一步")>=0){
			iconHtml = '<i class="fa-arrow-right"></i> ';
		}
		if(btnText.indexOf("复制")>=0){
			iconHtml = '<i class="fa-clone"></i> ';
		}
		if(btnText.indexOf("选择")>=0){
			iconHtml = '<i class="fa-mouse-pointer"></i> ';
		}
		if(btnText.indexOf("签名")>=0){
			iconHtml = '<i class="fa-pencil"></i> ';
		}
		if(btnText.indexOf("生成")>=0){
			iconHtml = '<i class="fa-retweet"></i> ';
		}
		if(btnText.indexOf("说明")>=0){
			iconHtml = '<i class="fa-file-text-o"></i> ';
		}
		if(btnText.indexOf("重选")>=0){
			iconHtml = '<i class="fa-mouse-pointer"></i> ';
		}
		if(btnText.indexOf("重选")>=0){
			iconHtml = '<i class="fa-recycle"></i> ';
		}
		if(btnText.indexOf("启用")>=0){
			iconHtml = '<i class="fa-repeat"></i> ';
		}
		if(btnText.indexOf("作废")>=0){
			iconHtml = '<i class="fa-ban"></i> ';
		}
		if(btnText.indexOf("维护")>=0){
			iconHtml = '<i class="fa-wrench"></i> ';
		}
		if(btnText.indexOf("默认")>=0){
			iconHtml = '<i class="fa-check-square"></i> ';
		}
		if(btnText.indexOf("意见")>=0){
			iconHtml = '<i class="fa-comments-o"></i> ';
		}
		if(btnText.indexOf("详细")>=0){
			iconHtml = '<i class="fa-file-text-o"></i> ';
		}
		if(btnText.indexOf("说明")>=0){
			iconHtml = '<i class="fa-file-text-o"></i> ';
		}
		if(btnText.indexOf("录入")>=0){
			iconHtml = '<i class="fa-pencil"></i> ';
		}
		if(btnText.indexOf("列表")>=0){
			iconHtml = '<i class="fa-list"></i> ';
		}
		if(btnText.indexOf("参数")>=0){
			iconHtml = '<i class="fa-database"></i> ';
		}
		if(btnText.indexOf("信息")>=0){
			iconHtml = '<i class="fa-file-text-o"></i> ';
		}
		if(btnText.indexOf("检测")>=0){
			iconHtml = '<i class="fa-cogs"></i> ';
		}
		if(btnText.indexOf("确定")>=0){
			iconHtml = '<i class="fa-check"></i> ';
		}
		if(btnText.indexOf("确认")>=0){
			iconHtml = '<i class="fa-check"></i> ';
		}
		if(btnText.indexOf("取消")>=0){
			iconHtml = '<i class="fa-ban"></i> ';
		}
		if(btnText.indexOf("运行")>=0){
			iconHtml = '<i class="fa-play"></i> ';
		}
		if(btnText.indexOf("保存")>=0){
			iconHtml = '<i class="fa-save"></i> ';
		}
		if(btnText.indexOf("统计")>=0){
			iconHtml = '<i class="fa-bar-chart"></i> ';
		}
		if(btnText.indexOf("支付")>=0){
			iconHtml = '<i class="fa-rmb"></i> ';
		}
		if(btnText.indexOf("上架")>=0){
			iconHtml = '<i class="fa-arrow-circle-o-up"></i> ';
		}
		if(btnText.indexOf("下架")>=0){
			iconHtml = '<i class="fa-arrow-circle-o-down"></i> ';
		}

	}else{
		if(btnConfig.iconCls!=""){
			iconHtml = '<i class="'+btnConfig.iconCls+'"></i> ';
		}
	}
	switch(btnConfig.text){
		case "添加附件":
			iconHtml = '<i class="fa-upload"></i> ';
			break;
		case "合同正文":
			iconHtml = '<i class="fa-file-text-o"></i> ';
			break;
	}
	//强制使用的ICON和按钮色彩
	switch(btnConfig.text){
		case "修改":
			btnClass = 'btn btn-info';
			iconHtml = '<i class="fa-edit"></i> ';
			break;
		case "作废":
		case "删除":
			btnClass = 'btn btn-warning';
			iconHtml = '<i class="fa-trash"></i> ';
			break;
		case "保存新增":
		case "保存":
			btnClass = 'btn btn-success';
			iconHtml = '<i class="fa-save"></i> ';
			break;
		case "提交":
			btnClass = 'btn btn-info';
			iconHtml = '<i class="fa-cloud-upload"></i> ';
			break;
		case "批准":
		case "记账":
		case "支付":
			btnClass = 'btn btn-info';
			iconHtml = '<i class="fa-check"></i> ';
			break;
		case "撤销":
			btnClass = 'btn btn-warning';
			iconHtml = '<i class="fa-rotate-left"></i> ';
			break;
		case "取消":
		case "作废":
		case "清除":
			btnClass = 'btn btn-white';
			iconHtml = '<i class="fa-ban"></i> ';
			break;
		case "新增":
		case "新建":
		case "添加":
			btnClass = 'btn btn-success';
			iconHtml = '<i class="fa-plus"></i> ';
			break;
		case "编辑":
			btnClass = 'btn btn-info';
			iconHtml = '<i class="fa-eidt"></i> ';
			break;
		case "复制":
			btnClass = 'btn btn-info';
			iconHtml = '<i class="fa-copy"></i> ';
			break;
		case "搜索":
			btnClass = 'btn btn-info';
			iconHtml = '<i class="fa-search"></i> ';
			break;
		case "查看":
			btnClass = 'btn btn-info';
			iconHtml = '<i class="fa-eye"></i> ';
			break;
		case "打开":
			btnClass = 'btn btn-info';
			iconHtml = '<i class="fa-folder-open"></i>';
			break;
		case "查询":
			btnClass = 'btn btn-info';
			iconHtml = '<i class="fa-search"></i>';
			break;
		case "项目选择":
			btnClass = 'btn btn-info';
			iconHtml = '<i class="fa-tags"></i>';
			break;
	}
	
	
	iconHtml = isShowIconBln?iconHtml:'';
	textHtml = isShowTextBln?'<span>'+btnConfig.text+'</span>':'';
	var btnHtml = '';
	var btnSelectHtml = '';
	if(btnConfig.configShow==false&&typeof(btnConfig.configShow)=='boolean'){
		btnClass = btnClass+' hidden';
	}
	if(source=='table'&&isShowIcon==true&&isShowText==false){
		btnClass = btnClass+'  btn-icon';
	}
	var btnDisabled = '';
	if(typeof(btnConfig.disabled)!='undefined'){btnDisabled = btnConfig.disabled}
	if(btnConfig.subdata){
		btnSelectHtml = '<ul class="dropdown-menu">';
		var btnHandlerGroup = '';
		var btnFunctionID = '';
		for(var childBtn in btnConfig.subdata){
			if(typeof(btnConfig.subdata[childBtn].handler)=='function'){
				btnHandlerGroup = '';
				btnFunctionID = ' fid="'+btnGroupIndex+'"';
			}else{
				btnFunctionID = '';
				if(btnConfig.subdata[childBtn].handler.indexOf("(")>-1){
					if(btnConfig.subdata[childBtn].handler.indexOf("'")>-1){
						btnHandlerGroup = ' onclick="'+btnConfig.subdata[childBtn].handler+';"';
					}else{
						btnHandlerGroup = " onclick='"+btnConfig.subdata[childBtn].handler+";'";
					}
				}else{
					btnHandlerGroup = ' onclick="'+btnConfig.subdata[childBtn].handler+'();"';
				}
			}
			btnGroupIndex++;
			btnSelectHtml += '<li '+btnHandlerGroup+btnFunctionID+isReturn+'>'
						  +'<a href="javascript:void(0);">'
						  +btnConfig.subdata[childBtn].text
						  +'</a>'
						  +'</li>';
		}
		btnSelectHtml +='</ul>';
		btnHtml = '<div class="btn-group">'
					+'<button type="button" class="'+btnClass+' dropdown-toggle" data-toggle="dropdown">'
					+btnConfig.text
					+'<span class="caret"></span>'
					+'</button>'
					+btnSelectHtml;
	}else if(btnConfig.html){
		//下拉按钮
		btnHtml = '<div class="btn-group">'
					+'<button type="button" class="'+btnClass+' dropdown-toggle" data-toggle="dropdown">'
					+btnConfig.text
					+'<span class="caret"></span>'
					+'</button>'
					+btnConfig.html;
	}else{
		//普通按钮
		btnHtml = '<button type="button" class="'+btnClass+'" '+tableTooltip+' '+tableToolTitle+' '+btnDisabled+' '+btnHandler+functionID+isReturn+columnID+'>'
					+iconHtml+textHtml+'</button>';
	}
	return btnHtml;
}
commonConfig.converSelectHtml = function(inputConfig){
	var selectOptionHtml = '';
	var selectData = [];
	if(inputConfig.subdata){
		selectData = inputConfig.subdata;
	}else{
		var type = inputConfig.action ? inputConfig.action :'POST';
		$.ajax({
			url:inputConfig.url,
			data:inputConfig.data,
			type:type,
			dataType:'json',
			async:false,
			success:function(result){
				selectData = result;
			}
		});
	}
	for(var selectI=0; selectI<selectData.length; selectI++){
		var valueField = inputConfig.valueField ? inputConfig.valueField : 'value';
		var textField = inputConfig.textField ? inputConfig.textField : 'text';
		var isSelected = '';
		if(inputConfig.value){
			isSelected = selectData[selectI][valueField] == inputConfig.value ?"selected":"";
		}else{
			isSelected = selectData[selectI].selected ?"selected":"";
		}
		selectOptionHtml += '<option value="'+selectData[selectI][valueField]+'" '+isSelected+'>'+selectData[selectI][textField]+'</option>';
	}
	return selectOptionHtml;
}
commonConfig.component = function(inputConfig, formID, source, sizeName){
	//过滤掉null值
	if(inputConfig.value == null){
		inputConfig.value = '';
	}
	var size = arguments[3] ? arguments[3] : '';
	var inputHtml = "";
	var placeholderStr = commonConfig.getPlaceHolder(inputConfig);
	var readonlyStr = "";
	if(typeof(inputConfig.readonly)!="undefined"){
		if(inputConfig.readonly == true){
			readonlyStr = 'readonly="readonly"';
		}else if(inputConfig.readonly == false){
			readonlyStr = "";
		}
	}
	var inputIDName = typeof(inputConfig.id)=="undefined"?"":"form-"+formID+"-"+inputConfig.id;
	var valueStr = typeof(inputConfig.value)=="undefined"?"":inputConfig.value;
	if(typeof(inputConfig.value) == 'function'){
		valueStr = inputConfig.value();
	}else if(typeof(inputConfig.value) == 'number'){
		valueStr = valueStr.toString();
	}
	var labelHtml = "";
	var labelClassStr = "";
	var labelTextStr = "";
	var labelHeight = "";
	var labelWeight = "";
	if(typeof(inputConfig.height) == 'string'){
		if(inputConfig.height.indexOf('px')>-1){
			labelHeight = 'height: '+inputConfig.height+';';
		}else if(inputConfig.height.indexOf('%')>-1){
			labelHeight = 'height: '+inputConfig.height+';';
		}else{
			labelHeight = 'height: '+inputConfig.height+'px;';
		}
	}else if(typeof(inputConfig.height) == 'number'){
		labelHeight = 'height: '+inputConfig.height+'px;';
	}
	if(typeof(inputConfig.width) == 'string'){
		if(inputConfig.width.indexOf('px')>-1){
			labelWeight = 'width: '+inputConfig.width+';';
		}else if(inputConfig.width.indexOf('%')>-1){
			labelWeight = 'width: '+inputConfig.width+';';
		}else{
			labelWeight = 'width: '+inputConfig.width+'px;';
		}
	}else if(typeof(inputConfig.width) == 'number'){
		labelWeight = 'width: '+inputConfig.width+'px;';
	}
	var labelStyleStr = 'style="'+labelHeight+''+labelWeight+'"';
	if(typeof(inputConfig.label) == 'undefined' || inputConfig.label == ''){
		labelClassStr = "hide";
		labelTextStr = '';
	}else{
		labelClassStr = "";
		labelTextStr = inputConfig.label;
	}
	var formGroupHeight = '';
	if(inputConfig.height){
		formGroupHeight = 'style="height:'+inputConfig.height+'px;"';
	}
	//modal组件 ----------------------------------------------------------

	if(source=="modal"){
		var sizeArr = ["col-sm-4","col-sm-8"]
		switch(size){
			case 's':
				sizeArr = ["col-sm-4","col-sm-8"];
				break;
			case 'm':
				sizeArr = ["col-sm-3","col-sm-9"];
				break;
			default: 
				sizeArr = ["col-sm-2","col-sm-10"];
				break;
		}
		var modalSizeType = '';
		if(typeof(inputConfig.hidden)=='boolean'){
			if(inputConfig.hidden==true){
				modalSizeType  = ' hidden';
			}
		}else if(typeof(inputConfig.hidden)=='function'){
			var isHidden = inputConfig.hidden();
			if(isHidden==true){
				modalSizeType  = ' hidden';
			}
		}


		labelHtml = '<label class="control-label '+sizeArr[0]+' '+labelClassStr+' '+inputConfig.type+'-label" '+labelStyleStr+' for="'+inputIDName+'">'
						+labelTextStr
					+'</label>';
		if(inputConfig.type=="text"||inputConfig.type=="password"||inputConfig.type=="number"){
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="'+sizeArr[1]+'">'
								+'<input id="'+inputIDName+'" name="'+inputIDName+'" type="'+inputConfig.type+'" ns-type="'+inputConfig.type+'" placeholder="'+placeholderStr+'" class="form-control" value="'+valueStr+'" '+readonlyStr+'>'
							+'</div>'
					+'</div>';
		}else if(inputConfig.type=="hidden"){
			inputHtml = '<input id="'+inputIDName+'" name="'+inputIDName+'"  nstype="'+inputConfig.type+'" type="hidden" ns-type="hidden" value="'+valueStr+'" class="hidden">';
		}else if(inputConfig.type == 'text-btn'){
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="'+sizeArr[1]+'">'
								+'<input id="'+inputIDName+'" name="'+inputIDName+'" type="text" placeholder="'+placeholderStr+'" class="form-control" ns-type="'+inputConfig.type+'" value="'+valueStr+'" '+readonlyStr+'>';
			var btnArr = inputConfig.btns;
			if(typeof(btnArr)!='undefined' && btnArr.length >0){
				inputHtml += '<div class="input-group-btn text-btn">';
				for(var btn = 0 ; btn < btnArr.length; btn ++){
					var disabled = btnArr[btn].isDisabled?" disabled ":"";
					var btnJson = {};
					btnJson.text = btnArr[btn].text;
					btnJson.handler = btnArr[btn].handler;
					inputHtml+= commonConfig.getBtn(btnJson,'form',btn,true,false);					
				}						
				inputHtml += '</div>';
			}					
			inputHtml += '</div></div>';				
		}else if(inputConfig.type=="date"){
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="'+sizeArr[1]+'">'
								+'<div class="input-group">'
									+'<input id="'+inputIDName+'" name="'+inputIDName+'"  nstype="'+inputConfig.type+'" type="text" class="form-control datepicker" value="'+valueStr+'" readonly placeholder="'+placeholderStr+'" data-format="'+inputConfig.format+'">'
									+'<div class="input-group-addon">'
										+'<a href="javascript:void(0);"><i class="linecons-calendar"></i></a>'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type == 'datetime'){
			var dateID = inputIDName + '-date';
			var timeID = inputIDName + '-time';
			var datetimerDefaultValue = commonConfig.formatDate('','YYYY-MM-DD HH:MM:DD');
			//var datetimerValue = typeof(inputConfig.value) == 'undefined' ? datetimerDefaultValue:inputConfig.value;
			//var datetimerDefaultValue = commonConfig.formatDate(inputConfig.value,'YYYY-MM-DD HH:MM:DD');
			var datetimerValue = valueStr;
			var dateValue = '';
			var timeValue = '';
			if(datetimerValue){
				dateValue = datetimerValue.split(' ')[0];
				timeValue = datetimerValue.split(' ')[1];
				timeValue = typeof(timeValue) == 'undefined' ? '' : timeValue;
			}
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="'+sizeArr[1]+' datetimepicker">'
								+'<input id="'+dateID+'" name="'+dateID+'" nstype="'+inputConfig.type+'" type="text" class="form-control datepicker" value="'+dateValue+'" '+readonlyStr+' />'
								+'<input id="'+timeID+'" name="'+timeID+'" nstype="'+inputConfig.type+'" type="text" class="form-control timepicker" value="'+timeValue+'" '+readonlyStr+'  />' 
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="textarea"){
			var height = inputConfig.height;
			var labelHeight = '';
			if(height){
				if(typeof(height) == 'string'){
					var isAppend = false;
					if(height.indexOf('px')>-1){
						height = 'style="height: '+inputConfig.height+';"';
						isAppend = false;
					}else{
						height = 'style="height: '+inputConfig.height+'px;"';
						isAppend = true;
					}
					if(Number(height)>100){
						var tempHeight = inputConfig.height-20;
						if(isAppend){
							labelHeight = 'style="height: '+tempHeight+'px;"';
						}else{
							labelHeight = 'style="height: '+tempHeight+';"';
						}
					}else{
						if(isAppend){
							labelHeight = 'style="height: '+inputConfig.height+'px;"';
						}else{
							labelHeight = 'style="height: '+inputConfig.height+';"';
						}
					}
				}else{
					height = 'style="height: '+inputConfig.height+'px;"';
					var tempHeight = inputConfig.height-20;
					if(height > 100){
						labelHeight = 'style="height: '+tempHeight+'px;"';
					}else{
						labelHeight = 'style="height: '+inputConfig.height+'px;"';
					}
				}
			}else{
				height = '';
				labelHeight = '';
			}
			if(typeof(inputConfig.isFullWidth)!="undefined"){
				if(inputConfig.isFullWidth==true){
					sizeArr = ["hide","col-sm-12"];
				}
			}
			var textareaSize = '';
			if(typeof(inputConfig.column) == 'undefined'){
				textareaSize = 'col-sm-12';
			}else{
				textareaSize = modalSizeType;
			}
			inputHtml = '<div class="form-group '+textareaSize+'">'
							+labelHtml
							+'<div class="'+sizeArr[1]+'">'
								+'<textarea id="'+inputIDName+'" name="'+inputIDName+'"  nstype="'+inputConfig.type+'" placeholder="'+placeholderStr+'" class="form-control" '+readonlyStr+height+'>'+valueStr+'</textarea>'
							+'</div>'
						+'</div>';

		}else if(inputConfig.type=="upload"){
			inputHtml = '<div class="row '+modalSizeType+'">'
							+'<div class="col-sm-3 text-center">'
								+'<div id="advancedDropzone" class="droppable-area">'
									+'文件区域'
								+'</div>'
							+'</div>'
							+'<div class="col-sm-9">'
								+'<div class="table-responsive">'
									+'<table class="table table-bordered table-striped table-hover dataTable no-footer table-modal table-singlerow"  nstype="'+inputConfig.type+'" id="'+inputConfig.id+'">'
									+'</table>'
								+'</div>'
							+'</div>'
						+'</div>'

		}else if(inputConfig.type=='upload_single'){
			var dropzoneDefalutArr = inputConfig.subdata;
			var dropzoneDefalutHtml = '';
			if(typeof(dropzoneDefalutArr) != 'undefined'){
				var dropTextfield = inputConfig.textField;
				var dropValuefield = inputConfig.valueField;
				for(var dropIndex = 0; dropIndex < dropzoneDefalutArr.length; dropIndex ++){
					var dropDefaultId = dropzoneDefalutArr[dropIndex][dropValuefield];
					var dropDefaultvalue = dropzoneDefalutArr[dropIndex][dropTextfield];
					dropzoneDefalutHtml += '<span class="dropzone-upload-span">'
										+'<a href="javascript:void(0)" id="'+dropDefaultId+'" class="upload-close"></a>'
										+'<a href="javascript:void(0)" id="'+dropDefaultId+'" class="upload-title">'
										+dropDefaultvalue
										+'</a>'
										+'</span>';
				}
			}
			var isReadonly = typeof(inputConfig.readonly) == 'boolean' ? inputConfig.readonly : false;
			var readonlyStr = isReadonly ? 'upload-disabled' : '';
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="form-item upload '+sizeArr[1]+'">'
								+'<div class="input-group '+readonlyStr+'">'
									+'<div id="'+inputIDName+'" class="droppable-area-dialog dz-clickable form-control">'
									+dropzoneDefalutHtml
									+'</div>'
									+'<div class="input-group-addon">'
										+'<a href="javascript:void(0);"><i class="fa fa-upload"></i></a>'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="table"){
			inputHtml = '<div class="row"><div class="col-xs-12">'
							+'<div class="table-responsive">'
								+'<table class="table table-bordered table-striped table-hover dataTable no-footer table-modal table-singlerow" nstype="'+inputConfig.type+'" id="'+inputConfig.id+'">'
								+'</table>'
							+'</div>'
							+'</div></div>'
		}else if(inputConfig.type=="radio"){
			radioHtml = '';
			if(typeof(inputConfig.subdata)!="undefined"){
				for(var radioI = 0; radioI<inputConfig.subdata.length; radioI++){
					var radioCls = 'cbr cbr-primary';
					if(inputConfig.subdata[radioI].isChecked){
						var radioCls = 'cbr cbr-primary';
					}
					var radioTextStr = '';
					var radioValueStr = '';
					if(typeof(inputConfig.textField)=='undefined'){
						radioTextStr = inputConfig.subdata[radioI].text;
					}else{
						radioTextStr = inputConfig.subdata[radioI][inputConfig.textField];
					}
					if(typeof(inputConfig.valueField)=='undefined'){
						radioValueStr = inputConfig.subdata[radioI].value;
					}else{
						radioValueStr = inputConfig.subdata[radioI][inputConfig.valueField];
					}
					var checkedStr = '';
					if(valueStr){
						checkedStr = radioValueStr == valueStr ?"checked":"";
					}else{
						checkedStr = inputConfig.subdata[radioI].isChecked?" checked ":"";
					}

					var disabledStr = "";
					var disabledBool = inputConfig.subdata[radioI].isDisabled?inputConfig.subdata[radioI].isDisabled:false;
					if(disabledBool){
						disabledStr = "disabled";
					}else{
						disabledStr = "";
					}

					var radioMsgStr = '';
					if(inputConfig.subdata[radioI].msg){
						radioMsgStr = 'data-toggle="tooltip" title="'+inputConfig.subdata[radioI].msg+'"';
					}
					radioHtml += '<label class="radio-inline" '+radioMsgStr+'>'
									+'<input id="'+inputIDName+'-'+radioI+'"  nstype="'+inputConfig.type+'" type="radio" '+checkedStr+' '+disabledStr+' class="'+radioCls+'" name="'+inputIDName+'" value="'+radioValueStr+'" >'
									+radioTextStr
								+'</label>'
				}
			}
			//添加清空
			var radioClose = inputConfig.isHasClose ? inputConfig.isHasClose : false;
			var radioCloseLength = inputConfig.subdata.length;
			if(radioClose){
				radioHtml += '<label class="radio-inline control-label radio-clear">'
									+'<input id="'+inputIDName+'-'+radioCloseLength+'"  nstype="'+inputConfig.type+'-clear" type="radio" class="cbr cbr-primary hide" name="'+inputIDName+'" value="" />'
									+'清空'
								+'</label>'
			}
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="'+sizeArr[1]+'">'
								+ radioHtml
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="checkbox"){
			checkboxHtml = '';
			if(typeof(inputConfig.subdata)!="undefined"){
				for(var checkboxI = 0; checkboxI<inputConfig.subdata.length; checkboxI++){
					var checkboxCls = 'cbr cbr-primary';
					if(inputConfig.subdata[checkboxI].isChecked){
						checkboxCls = 'cbr cbr-primary';
					}
					var checkboxTextStr = '';
					var checkboxValueStr = '';
					if(typeof(inputConfig.textField)=='undefined'){
						checkboxTextStr = inputConfig.subdata[checkboxI].text;
					}else{
						checkboxTextStr = inputConfig.subdata[checkboxI][inputConfig.textField];
					}
					if(typeof(inputConfig.valueField)=='undefined'){
						checkboxValueStr = inputConfig.subdata[checkboxI].value;
					}else{
						checkboxValueStr = inputConfig.subdata[checkboxI][inputConfig.valueField];
					}

					var checkedStr = '';
					if(typeof(inputConfig.value) == 'function'){
						var defaultCheckStr = inputConfig.value();
						checkedStr = checkboxValueStr == defaultCheckStr ?"checked":"";
					}else if(typeof(inputConfig.value) == 'string' || typeof(inputConfig.value) == 'number'){
						if(inputConfig.value){
							checkedStr = inputConfig.value == checkboxValueStr ?"checked":"";
						}else{
							checkedStr = inputConfig.subdata[checkboxI].isChecked?" checked ":"";
						}
					}else if(typeof(inputConfig.value) == 'object'){
						for(var check in inputConfig.value){
							if(checkboxValueStr == inputConfig.value[check]){
								checkedStr = "checked";
							}
						}
					}
					
					
					var disabledStr = "";
					var disabledBool = inputConfig.subdata[checkboxI].isDisabled?inputConfig.subdata[checkboxI].isDisabled:false;
					if(disabledBool){
						disabledStr = "disabled";
					}else{
						disabledStr = "";
					}

					checkboxHtml += '<label class="radio-inline">'
									+'<input id="'+inputIDName+'-'+checkboxI+'"  nstype="'+inputConfig.type+'" type="checkbox" '+checkedStr+' '+disabledStr+' class="'+checkboxCls+'" name="'+inputIDName+'" value="'+inputConfig.subdata[checkboxI].value+'" >'
									+inputConfig.subdata[checkboxI].text
								+'</label>'
				}
			}
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="'+sizeArr[1]+'">'
								+ checkboxHtml
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="select"){
			selectHtml = '<option value="">'+placeholderStr+'</option>';
			var selectData;
			var selectAjaxData = {};
			if(inputConfig.data){
				selectAjaxData = inputConfig.data;
			}
			if(inputConfig.url =='' || inputConfig.url == null){
				selectData = inputConfig.subdata;
			}else{
				var ajaxUrl;
				if(typeof(inputConfig.url)=='function'){
					ajaxUrl = inputConfig.url();
				}else{
					ajaxUrl = inputConfig.url;
				}
				$.ajax({
					url:ajaxUrl, //请求的数据链接
					type:inputConfig.method,
					data:selectAjaxData,
					dataType:'json',
					async:false,
					success:function(rec){
						if(typeof(inputConfig.dataSrc)=='undefined'){
							selectData = rec;
						}else{
							for(data in rec){
								selectData = rec[inputConfig.dataSrc];
							}
						}
					},
					error: function () {
						nsalert('请检查数据格式是否合法','warning');
					}
				});
			}
			if(selectData){
				if(selectData.length > 0){
					for(var selectI = 0; selectI<selectData.length; selectI++){
						//var checkedStr = inputConfig.subdata[selectI].isChecked?" selected ":"";
						var textStr = '';
						var valueStrI = '';
						if(typeof(inputConfig.textField)=='undefined'){
							textStr = selectData[selectI].text;
						}else{
							textStr = selectData[selectI][inputConfig.textField];
						}
						if(typeof(inputConfig.valueField)=='undefined'){
							valueStrI = selectData[selectI].value;
						}else{
							valueStrI = selectData[selectI][inputConfig.valueField];
						}
						var checkedStr = '';
						if(valueStr){
							checkedStr = valueStr == valueStrI ?"selected":"";
						}else{
							checkedStr = selectData[selectI].selected?"selected":"";
						}
						var disabledStr = selectData[selectI].isDisabled?" disabled ":"";
						selectHtml += '<option value="'+valueStrI+'" '+checkedStr+' '+disabledStr+'>'
										+textStr
									+'</option>'
					}
				}else{
					if(valueStr){
						selectHtml += '<option value="'+valueStr+'" selected>'+valueStr+'</option>'; 
					}
				}
			}
			selectFormPlane.select[formID][inputConfig.id] = selectData; 
			var isSelectDiabled = inputConfig.disabled ? 'disabled' : '';
			selectHtml = '<select class="form-control" id="'+inputIDName+'" '+isSelectDiabled+'  nstype="'+inputConfig.type+'">'
							+selectHtml
						+'</select>'
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="'+sizeArr[1]+' form-item select">'
								+selectHtml
							+'</div>'
					+'</div>';
		}else if(inputConfig.type=="select2"){
			selectHtml = '<option value="">'+placeholderStr+'</option>';
			var select2GroupArr = inputConfig.subdata;//默认读取的是subdata值
			//是否是ajax方式读值
			if(typeof(inputConfig.url)=='string'){
				var isMethod = typeof(inputConfig.method) == 'string' ? inputConfig.method : 'GET';
				var params = typeof(inputConfig.params) == 'object' ? inputConfig.params : {};
				if(isMethod == ''){isMethod = 'GET'}
				$.ajax({
					url:inputConfig.url,
					dataType: "json", // 数据类型 
					type:isMethod,
					async:false,
					data:params,
					success:function(result){
						//是否定义了数据源参数
						if(typeof(inputConfig.dataSrc)=='undefined'){
							select2GroupArr = result;
						}else{
							select2GroupArr = result[inputConfig.dataSrc];
						}
					}
				})
			}
			if($.isArray(select2GroupArr)){
				//拿到的是数组格式
				var textField = typeof(inputConfig.textField)=='string' ? inputConfig.textField : 'text';
				var valueField = typeof(inputConfig.valueField)=='string' ? inputConfig.valueField : 'value';
				var childrenField = typeof(inputConfig.optchildren) == 'string' ? inputConfig.optchildren : 'children';
				for(var group in select2GroupArr){
					var textStr = select2GroupArr[group][textField];//文本值
					var optionStr = select2GroupArr[group][valueField];//id值
					//判断是否有分组的下拉框
					if($.isArray(select2GroupArr[group][childrenField])){
						//如果存在分组
						var childrenArr = select2GroupArr[group][childrenField];
						var groupTitle = typeof(inputConfig.optlabel) == 'string' ? inputConfig.optlabel : textField;
						selectHtml +='<optgroup label="'+select2GroupArr[group][groupTitle]+'">';
						for(var childI=0; childI < childrenArr.length; childI++){
							var childTextStr = childrenArr[childI][textField];
							var childValueStr = childrenArr[childI][valueField];
							var isDisabled = typeof(childrenArr[childI].isDisabled) == 'boolean' ? childrenArr[childI].isDisabled : false;
							var disabledStr = '';
							if(isDisabled){
								disabledStr = 'disabled';
							}
							var selectedStr = '';
							if(childrenArr[childI].selected == true){
								selectedStr = 'selected';
							}else{
								if(valueStr != ''){
									if(childValueStr == valueStr){
										selectedStr = 'selected';
									}
								}
							}
							selectHtml += '<option value="'+childValueStr+'" '+selectedStr+' '+disabledStr+'>'+childTextStr+'</option>';
						}
						selectHtml += '</optgroup>';
					}else{
						var selectedStr = '';
						if(select2GroupArr[group].selected == true){
							selectedStr = 'selected';
						}else{
							if(valueStr != ''){
								if(optionStr == valueStr){
									selectedStr = 'selected';
								}
							}
						}
						var isDisabled = typeof(select2GroupArr[group].isDisabled) == 'boolean' ? select2GroupArr[group].isDisabled : false;
						var disabledStr = '';
						if(isDisabled){
							disabledStr = 'disabled';
						}
						selectHtml += '<option value="'+optionStr+'" '+disabledStr+' '+selectedStr+'>'
										+textStr
									+'</option>';
					}
				}
			}
			var multiple = inputConfig.multiple ? 'multiple':'';
			var isDisabled = typeof(inputConfig.readonly) == 'boolean' ? inputConfig.readonly : false;
			if(typeof(inputConfig.disabled)=='boolean'){
				isDisabled = inputConfig.disabled;
			}
			var disabledStr = '';
			if(isDisabled){
				disabledStr = 'disabled';
			}
			selectHtml = '<select class="form-control" '+disabledStr+' id="'+inputIDName+'" '+multiple+'  nstype="'+inputConfig.type+'">'
							+selectHtml
						+'</select>'
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="form-item select2 '+sizeArr[1]+'">'
								+ selectHtml
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="typeahead"){
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="form-item '+sizeArr[1]+'">'
								+'<div class="typeahead__container">'
									+'<div class="typeahead__field">'
										+'<span class="typeahead__query">'
											+'<input id="'+inputIDName+'" class="form-control" nstype="'+inputConfig.type+'" type="search" placeholder="Search" autofocus autocomplete="off" />'
										+'</span>'
										+'<span class="typeahead__button">'
											+'<button type="button">'
												+'<span class="typeahead__search-icon"></span>'
											+'</button>'
										+'</span>'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="addSelectInput"){
			if(typeof(inputConfig.hiddenID)=="undefined"){
				inputConfig.hiddenID = inputConfig.id+'-hidden'+Math.round()*100000;
			}
			inputConfig.fullHiddenID = "form-"+formID+"-"+inputConfig.hiddenID;
			inputHtml = 
				'<div class="form-group '+modalSizeType+'">'
						+labelHtml
						+'<div class="'+sizeArr[1]+'">'
							+'<input id="'+inputIDName+'" name="'+inputIDName+'" type="text" placeholder="'+placeholderStr+'" class="form-control" value="'+valueStr+'" '+readonlyStr+'>'
							+'<input id="'+inputHiddenIDName+'" name="'+inputHiddenIDName+'" type="'+inputConfig.type+'-hidden" value="" >'
						+'</div>'
				+'</div>';
		}else if(inputConfig.type == 'tree-select'){
			var treeCloseBtnID = inputIDName +'-tree-menuBtn';
			var treeValueStr = typeof(inputConfig.text) == 'undefined' ?'':inputConfig.text;
			var treeNodeId = '';
			if(typeof(inputConfig.value) == 'function'){
				treeNodeId = inputConfig.value();
			}else{
				treeNodeId = inputConfig.value ? inputConfig.value :'';
			}
			var treeID = inputIDName +'-tree';
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="'+sizeArr[1]+'">'
								+'<input id="'+inputIDName+'" name="'+inputIDName+'" nodeid="'+treeNodeId+'" treeType="'+inputConfig.treeId+'" nstype="'+inputConfig.type+'" value="'+treeValueStr+'" class="form-control" type="text" readonly>'
								+'<a id="'+treeCloseBtnID+'" href="javascript:void(0)" class="treeselect-arrow"><i class="fa fa-caret-down"></i></a>'
								+'<ul id="'+treeID+'" class="ztree hide"></ul>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type == 'province-select'){
			var provinceData = provinceInfo;
			var provSelectedStr = '';//省
			var citySelectedStr = '';//市
			var areaSelectedStr = '';//区
			if(typeof(valueStr) == 'object'){
				provSelectedStr = valueStr.province ? valueStr.province : '';
				citySelectedStr = valueStr.city ? valueStr.city : '';
				areaSelectedStr = valueStr.area ? valueStr.area : '';
			}
			var cityData = [];
			var areaData = [];
			var isShowCityDom = 'hide';
			var isShowAreaDom = 'hide';
			var selectProHtml = '';//省份html
			var selectCityHtml = '';//市 html
			var selectAreaHtml = '';//区 html
			for(var proI = 0; proI < provinceData.length; proI ++){
				var currentProvname = provinceData[proI].name;
				var currentProval = currentProvname;  //value值等同于text文本值的显示
				if(currentProval == '省份'){
					currentProval = '';
				}
				var isSelected = '';
				//存在默认省份的设置
				if(provSelectedStr != ''){
					if(currentProvname == provSelectedStr){
						cityData = provinceData[proI].sub;
						isSelected = 'selected';
					}
				}
				selectProHtml += '<option value="'+currentProval+'" '+isSelected+'>'+currentProvname+'</option>';
			}
			if(provSelectedStr == ''){
				citySelectedStr = provinceData[0].name;
				cityData = provinceData[0].sub;
				areaSelectedStr = cityData[0].name;
			}
			if(citySelectedStr != ''){
				isShowCityDom = '';
				for(var cityI = 0; cityI < cityData.length; cityI ++){
					var currentCityname = cityData[cityI].name;
					var isCitySelected = '';
					if(currentCityname == citySelectedStr){
						areaData = cityData[cityI].sub;
						isCitySelected = 'selected';
					}
					selectCityHtml += '<option value="'+currentCityname+'" '+isCitySelected+'>'+currentCityname+'</option>';
				}
			}
			if(areaSelectedStr != ''){
				isShowAreaDom = '';
				for(var areaI = 0; areaI < areaData.length; areaI ++){
					var currentAreaname = areaData[areaI].name;
					var isAreaSelected = '';
					if(currentAreaname == areaSelectedStr){
						isAreaSelected = 'selected';
					}
					selectAreaHtml += '<option value="'+currentAreaname+'" '+isAreaSelected+'>'+currentAreaname+'</option>';
				}
			}
			selectProHtml = '<select class="form-control" nstype="'+inputConfig.type+'" data-pro="province" id="'+inputIDName+'-province">'
							+selectProHtml
						+'</select>';
			selectCityHtml = '<select class="form-control" nstype="'+inputConfig.type+'" data-pro="city" id="'+inputIDName+'-city">'
							+selectCityHtml
						+'</select>';
			selectAreaHtml = '<select class="form-control" nstype="'+inputConfig.type+'" data-pro="area" id="'+inputIDName+'-area">'
							+selectAreaHtml
						+'</select>';
			selectProHtml = '<div class="form-group" '+modalSizeType+'>'
								+'<label class="control-label  province-select-label '+sizeArr[1]+'" for="'+inputIDName+'-province">'
									+'省</label>'
								+'<div class="form-item select">'
									+ selectProHtml
								+'</div>'
							+'</div>';
			selectCityHtml = '<div class="form-td col-sm-4 col-xs-12">'
								+'<div class="form-group" '+modalSizeType+'>'
									+'<label class="control-label  province-select-label '+sizeArr[1]+'" for="'+inputIDName+'-city">'
									+'市</label>'
									+'<div class="form-item select">'
										+ selectCityHtml
									+'</div>'
								+'</div>'
							+'</div>';
			selectAreaHtml = '<div class="form-td col-sm-4 col-xs-12">'
							+'<div class="form-group" '+modalSizeType+'>'
								+'<label class="control-label  province-select-label '+sizeArr[1]+'" for="'+inputIDName+'-country">'
									+'区</label>'
								+'<div class="form-item select">'
									+ selectAreaHtml
								+'</div>'
							+'</div>'
						+'</div>';
			inputHtml = selectProHtml + selectCityHtml + selectAreaHtml;
		}

	//Form组件 ----------------------------------------------------------
	}else if(source=="form"){
		//组件尺寸
		var inputSize = "";
		if(typeof(inputConfig.column)=="undefined"){
			inputSize = " col-lg-3 col-md-4 col-sm-6 col-xs-12";
		}else{
			var columnNum = parseInt(inputConfig.column);
			if(columnNum<0||columnNum>12){
				columnNum = 12;
			}
			switch(columnNum){
				case 1:
					inputSize = " col-lg-1 col-md-1 col-sm-1 col-xs-1";
					break;
				case 2:
					inputSize = " col-lg-2 col-md-2 col-sm-6 col-xs-12";
					break;
				case 3:
					inputSize = " col-lg-3 col-md-4 col-sm-6 col-xs-12";
					break;
				case 4:
					inputSize = " col-md-4 col-sm-6 col-xs-12";
					break;
				case 6:
					inputSize = " col-sm-6 col-xs-12";
					break;
				case 8:
					inputSize = " col-md-8 col-xs-12";
					break;
				case 12:
					inputSize = " col-xs-12";
					break;
			}
		}
		if(inputConfig.hidden){
			inputSize  += ' hidden';
		}

		labelHtml = '<label class="control-label '+labelClassStr+' '+inputConfig.type+'-label" '+labelStyleStr+' for="'+inputIDName+'">'
						+labelTextStr
					+'</label>';
		if(inputConfig.type=="text"||inputConfig.type=="password"||inputConfig.type=="number"){
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<div class="form-item">'
									+'<input id="'+inputIDName+'" name="'+inputIDName+'"  nstype="'+inputConfig.type+'" type="'+inputConfig.type+'" placeholder="'+placeholderStr+'" class="form-control" value="'+valueStr+'" '+readonlyStr+'>'
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type =='textSelect'){
			//文本下拉框组件
			var selectOptionHtml = commonConfig.converSelectHtml(inputConfig.select);
			var selectID = 'form-'+formID+'-'+inputConfig.select.id;
			var isSelectDiabled = inputConfig.select.disabled ? 'disabled' : '';
			var selectPlaceHolder = commonConfig.getPlaceHolder(inputConfig.select);
			var selectDefaultOptionHtml = '<option value="">'+selectPlaceHolder+'</option>';
			var selectHtml = '<select id="'+selectID+'" name="'+selectID+'" class="form-control" nstype="'+inputConfig.type+'-select" '+isSelectDiabled+'>'
							+selectDefaultOptionHtml
							+selectOptionHtml
						+'</select>';
			var inputID = 'form-'+formID+'-'+inputConfig.text.id;
			var inputPlaceHolder = commonConfig.getPlaceHolder(inputConfig.text);
			var inputDefault = inputConfig.text.value ? inputConfig.text.value : '';
			var readonlyStr = inputConfig.text.readonly ? 'readonly="readonly"' :'';
			var inputHtml = '<input type="text" id="'+inputID+'" name="'+inputID+'" value="'+inputDefault+'" class="form-control" nstype="'+inputConfig.type+'-text" placeholder="'+inputPlaceHolder+'" '+readonlyStr+' />';
			var operationHtml = '';
			if(inputConfig.button){
				var buttonArr = inputConfig.button;
				for(var buttonI = 0; buttonI < buttonArr.length; buttonI ++){
					var btnJson = {};
					btnJson.text = buttonArr[buttonI].text;
					btnJson.handler = buttonArr[buttonI].handler;
					operationHtml += commonConfig.getBtn(btnJson,'form',buttonI,true,false);	
				}
				operationHtml = '<div class="btn-group" nstype="'+inputConfig.type+'_button">'
								+operationHtml
								+'</div>';
			}
			var hiddenTextHtml = '<input type="hidden" id="'+inputIDName+'" name="'+inputIDName+'" value="'+valueStr+'" />';
		
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<div class="form-item selectplane '+inputConfig.type+'" ns-id="'+inputConfig.id+'">'
									+hiddenTextHtml
									+inputHtml
									+selectHtml
									+operationHtml
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type == 'selectText'){
			//下拉框文本组件
			var selectOptionHtml = commonConfig.converSelectHtml(inputConfig.select);
			var selectID = 'form-'+formID+'-'+inputConfig.select.id;
			var isSelectDiabled = inputConfig.select.disabled ? 'disabled' : '';
			var selectPlaceHolder = commonConfig.getPlaceHolder(inputConfig.select);
			var selectDefaultOptionHtml = '<option value="">'+selectPlaceHolder+'</option>';
			var selectHtml = '<select id="'+selectID+'" name="'+selectID+'" class="form-control" nstype="'+inputConfig.type+'-select" '+isSelectDiabled+'>'
							+selectDefaultOptionHtml
							+selectOptionHtml
						+'</select>';
			var inputID = 'form-'+formID+'-'+inputConfig.text.id;
			var inputPlaceHolder = commonConfig.getPlaceHolder(inputConfig.text);
			var inputDefault = inputConfig.text.value ? inputConfig.text.value : '';
			var readonlyStr = inputConfig.text.readonly ? 'readonly="readonly"' :'';
			var inputHtml = '<input type="text" id="'+inputID+'" name="'+inputID+'" value="'+inputDefault+'" class="form-control" nstype="'+inputConfig.type+'-text" placeholder="'+inputPlaceHolder+'" '+readonlyStr+' />';
			var operationHtml = '';
			if(inputConfig.button){
				var buttonArr = inputConfig.button;
				for(var buttonI = 0; buttonI < buttonArr.length; buttonI ++){
					var btnJson = {};
					btnJson.text = buttonArr[buttonI].text;
					btnJson.handler = buttonArr[buttonI].handler;
					operationHtml += commonConfig.getBtn(btnJson,'form',buttonI,true,false);	
				}
				operationHtml = '<div class="btn-group" commonplane="moreSelectPlane" nstype="'+inputConfig.type+'_button">'
								+operationHtml
								+'</div>';
			}
			var hiddenTextHtml = '<input type="hidden" id="'+inputIDName+'" name="'+inputIDName+'" value="'+valueStr+'" />';
		
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<div class="form-item selectplane '+inputConfig.type+'" ns-id="'+inputConfig.id+'">'
									+hiddenTextHtml
									+selectHtml
									+inputHtml
									+operationHtml
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type == 'selectDate'){
			//下拉框日期组件
			var caseOptionHtml = commonConfig.converSelectHtml(inputConfig.caseSelect);
			var caseSelectID ='form-'+formID+'-'+inputConfig.caseSelect.id;
			var caseSelectHtml = '<select id="'+caseSelectID+'" name="'+caseSelectID+'" class="form-control" nstype="'+inputConfig.type+'-caseSelect">'
								+caseOptionHtml
							+'</select>';    
			var textInputID = 'form-'+formID+'-'+inputConfig.text.id;
			var textValue = inputConfig.text.value ? inputConfig.text.value :'';
			var readonlyStr = inputConfig.text.readonly ? 'readonly="readonly"' :'';
			var textPlaceholder = commonConfig.getPlaceHolder(inputConfig.text);
			var textHidden = inputConfig.text.hidden ? 'hide':'';
			var textHtml = '<input type="text" id="'+textInputID+'" name="'+textInputID+'" class="form-control '+textHidden+'" value="'+textValue+'" placeholder="'+textPlaceholder+'" '+readonlyStr+' nstype="'+inputConfig.type+'-text" />';
			var dateID = 'form-'+formID+'-'+inputConfig.date.id;
			var dateValue = inputConfig.date.value ? inputConfig.date.value :'';
			var dateReadonly = inputConfig.date.readonly ? 'readonly="readonly"':'';
			var dateHidden = inputConfig.date.hidden ? 'hide':'';
			var dateHtml = '<input type="text" id="'+dateID+'" name="'+dateID+'" class="form-control datepicker '+dateHidden+'" readonly value="'+dateValue+'" '+dateReadonly+' nstype="'+inputConfig.type+'-date"  />'
			
			var dateRangeID = 'form-'+formID+'-'+inputConfig.daterange.id;
			var daterangeStart = inputConfig.daterange.startDate ? inputConfig.daterange.startDate :'';
			var daterangeEnd = inputConfig.daterange.endDate ? inputConfig.daterange.endDate :'';
			var daterangevalue = '';
			if(daterangeStart){
				daterangevalue = daterangeStart + '至' +daterangeEnd;
			}
			var daterangeHidden = inputConfig.daterange.hidden ? 'hide':'';
			//var daterangeHtml = '<input type="text" id="'+dateRangeID+'" name="'+dateRangeID+'" class="form-control daterangepicker '+daterangeHidden+'" readonly value="'+daterangevalue+'" nstype="'+inputConfig.type+'-daterange" />'; 
			var daterangeHtml = '<div class="daterange daterange-inline add-ranges '+daterangeHidden+'" id="'+dateRangeID+'" nstype="'+inputConfig.type+'-daterange">'
								+'<i class="fa-calendar"></i>'
								+'<span>'+daterangevalue+'</span>'
							+'</div>';
			var hiddenTextHtml = '<input type="hidden" id="'+inputIDName+'" name="'+inputIDName+'" value="'+valueStr+'" />';
			var operationHtml = '';
			if(inputConfig.button){
				var buttonArr = inputConfig.button;
				for(var buttonI = 0; buttonI < buttonArr.length; buttonI ++){
					var btnJson = {};
					btnJson.text = buttonArr[buttonI].text;
					btnJson.handler = buttonArr[buttonI].handler;
					operationHtml += commonConfig.getBtn(btnJson,'form',buttonI,true,false);	
				}
				operationHtml = '<div class="btn-group" commonplane="moreSelectPlane" nstype="'+inputConfig.type+'_button">'
								+operationHtml
								+'</div>';
			}

			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<div class="form-item selectplane '+inputConfig.type+'" ns-id="'+inputConfig.id+'">'
									+hiddenTextHtml
									+caseSelectHtml
									+textHtml
									+dateHtml
									+daterangeHtml
									+operationHtml
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type == 'selectSelect'){
			//隐藏text
			var hiddenTextHtml = '<input type="hidden" id="'+inputIDName+'" name="'+inputIDName+'" value="'+valueStr+'" />';
			//下拉框下拉框组件
			var firstSelectOptionHtml = commonConfig.converSelectHtml(inputConfig.firstSelect);
			var selectID = 'form-'+formID+'-'+inputConfig.firstSelect.id;
			var isSelectDiabled = inputConfig.firstSelect.disabled ? 'disabled' : '';
			var firstPlaceHolder = commonConfig.getPlaceHolder(inputConfig.firstSelect);
			var firstDefaultOptionHtml = '<option value="">'+firstPlaceHolder+'</option>';
			var firstSelectHtml = '<select id="'+selectID+'" name="'+selectID+'" class="form-control" nstype="'+inputConfig.type+'-firstSelect" '+isSelectDiabled+'>'
							+firstDefaultOptionHtml
							+firstSelectOptionHtml
						+'</select>';
			
			var secondSelectOptionHtml = commonConfig.converSelectHtml(inputConfig.secondSelect);
			var secondID = 'form-'+formID+'-'+inputConfig.secondSelect.id;
			var secondDisabled = inputConfig.secondSelect.disabled ? 'disabled':'';
			var secondPlaceHolder = commonConfig.getPlaceHolder(inputConfig.secondSelect);
			var secondDefaultOptionHtml = '<option value="">'+secondPlaceHolder+'</option>';
			var secondSelectHtml = '<select id="'+secondID+'" name="'+secondID+'" class="form-control" nstype="'+inputConfig.type+'-secondSelect" '+secondDisabled+'>'
									+secondDefaultOptionHtml
									+secondSelectOptionHtml
								+'</select>';
			var operationHtml = '';
			if(inputConfig.button){
				var buttonArr = inputConfig.button;
				for(var buttonI = 0; buttonI < buttonArr.length; buttonI ++){
					var btnJson = {};
					btnJson.text = buttonArr[buttonI].text;
					btnJson.handler = buttonArr[buttonI].handler;
					operationHtml += commonConfig.getBtn(btnJson,'form',buttonI,true,false);	
				}
				operationHtml = '<div class="btn-group" commonplane="moreSelectPlane" nstype="'+inputConfig.type+'_button">'
								+operationHtml
								+'</div>';
			}
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<div class="form-item selectplane '+inputConfig.type+'" ns-id="'+inputConfig.id+'">'
								+hiddenTextHtml
								+firstSelectHtml
								+secondSelectHtml
								+operationHtml
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="hidden"){
			inputHtml = '<input id="'+inputIDName+'" name="'+inputIDName+'"  nstype="'+inputConfig.type+'" type="hidden" value="'+valueStr+'" class="hidden">';
		}else if(inputConfig.type=="date"){
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group">'
								+labelHtml
								+'<div class="form-item">'
									+'<div class="input-group" '+formGroupHeight+'>'
										+'<input id="'+inputIDName+'" name="'+inputIDName+'" nstype="'+inputConfig.type+'" type="text" class="form-control datepicker" value="'+valueStr+'" readonly placeholder="'+placeholderStr+'" data-format="'+inputConfig.format+'" >'
										+'<div class="input-group-addon">'
											+'<a href="javascript:void(0);"><i class="linecons-calendar"></i></a>'
										+'</div>'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type == "datetime"){
			var dateID = inputIDName + '-date';
			var timeID = inputIDName + '-time';
			var datetimerDefaultValue = commonConfig.formatDate('','YYYY-MM-DD HH:MM:DD');
			//var datetimerDefaultValue = commonConfig.formatDate(inputConfig.value,'YYYY-MM-DD HH:MM:DD');
			//var datetimerValue = typeof(inputConfig.value) == 'undefined' ? datetimerDefaultValue:inputConfig.value;
			var datetimerValue = valueStr;
			var dateValue = '';
			var timeValue = '';
			if(datetimerValue){
				dateValue = datetimerValue.split(' ')[0];
				timeValue = datetimerValue.split(' ')[1];
				timeValue = typeof(timeValue) == 'undefined' ? '' : timeValue;
			}
			inputHtml = '<div class="form-td datetimepicker '+inputSize+'">'
						+'<div class="form-group" '+formGroupHeight+'>'
							+labelHtml
							+'<div class="form-item datetimepicker">'
								+'<input id="'+dateID+'" name="'+dateID+'" nstype="'+inputConfig.type+'" type="text" class="form-control datepicker" value="'+dateValue+'" '+readonlyStr+' />'
								+'<input id="'+timeID+'" name="'+timeID+'" nstype="'+inputConfig.type+'" type="text" class="form-control timepicker" value="'+timeValue+'" '+readonlyStr+' />' 
							+'</div>'
						+'</div>'
					+'</div>';
		}else if(inputConfig.type == "daterangepicker"){
			//分隔符
			inputHtml = '<div class="form-td  '+inputSize+'">'
							+'<div class="form-group">'
								+labelHtml
								+'<div class="form-item datetimepicker">'
									+'<input type="text" name="'+inputIDName+'" id="'+inputIDName+'" class="form-control" readonly nstype="'+inputConfig.type+'">'
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="upload"){
			var dropzoneDefalutArr = inputConfig.subdata;
			var dropzoneDefalutHtml = '';
			if(typeof(dropzoneDefalutArr) != 'undefined'){
				var dropTextfield = inputConfig.textField;
				var dropValuefield = inputConfig.valueField;
				for(var dropIndex = 0; dropIndex < dropzoneDefalutArr.length; dropIndex ++){
					var dropDefaultId = dropzoneDefalutArr[dropIndex][dropValuefield];
					var dropDefaultvalue = dropzoneDefalutArr[dropIndex][dropTextfield];
					dropzoneDefalutHtml += '<span class="dropzone-upload-span">'
										+'<a href="javascript:void(0)" id="'+dropDefaultId+'" class="upload-close"></a>'
										+'<a href="javascript:void(0)" id="'+dropDefaultId+'" class="upload-title">'
										+dropDefaultvalue
										+'</a>'
										+'</span>';
				}
			}
			var isReadonly = typeof(inputConfig.readonly) == 'boolean' ? inputConfig.readonly : false;
			var readonlyStr = isReadonly ? 'upload-disabled' : '';
			inputHtml = '<div class="form-td '+inputSize+'">'
						+'<div class="form-group" '+formGroupHeight+'>'
							+labelHtml
							+'<div class="form-item upload">'
								+'<div class="input-group '+readonlyStr+'">'
									+'<div id="'+inputIDName+'" class="droppable-area-form dz-clickable">'
									+dropzoneDefalutHtml
									+'</div>'									
									+'<div class="input-group-addon">'
									+'<a href="javascript:void(0);"><i class="fa fa-upload"></i></a>'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>'
					+'</div>';
		}else if(inputConfig.type=="textarea"){
			var height = inputConfig.height;
			var labelHeight = '';
			if(height){
				if(typeof(height) == 'string'){
					var isAppend = false;
					if(height.indexOf('px')>-1){
						height = 'style="height: '+inputConfig.height+';"';
						isAppend = false;
					}else{
						height = 'style="height: '+inputConfig.height+'px;"';
						isAppend = true;
					}
					if(Number(height)>100){
						var tempHeight = inputConfig.height-20;
						if(isAppend){
							labelHeight = 'style="height: '+tempHeight+'px;"';
						}else{
							labelHeight = 'style="height: '+tempHeight+';"';
						}
					}else{
						if(isAppend){
							labelHeight = 'style="height: '+inputConfig.height+'px;"';
						}else{
							labelHeight = 'style="height: '+inputConfig.height+';"';
						}
					}
				}else{
					height = 'style="height: '+inputConfig.height+'px;"';
					var tempHeight = inputConfig.height-20;
					if(height > 100){
						labelHeight = 'style="height: '+tempHeight+'px;"';
					}else{
						labelHeight = 'style="height: '+inputConfig.height+'px;"';
					}
				}
			}else{
				height = '';
				labelHeight = '';
			}
			var textareaSize = '';
			if(typeof(inputConfig.column) == 'undefined'){
				textareaSize = 'col-sm-12';
			}else{
				textareaSize = inputSize;
			}
			inputHtml = '<div class="form-td '+textareaSize+'">'
							+'<div class="form-group">'
								+labelHtml
								+'<textarea id="'+inputIDName+'" name="'+inputIDName+'"  nstype="'+inputConfig.type+'" placeholder="'+placeholderStr+'" class="form-control" '+readonlyStr+height+'>'+valueStr+'</textarea>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type == 'tree-select'){
			var treeCloseBtnID = inputIDName +'-tree-menuBtn';
			var treeValueStr = typeof(inputConfig.text) == 'undefined' ?'':inputConfig.text;
			var treeNodeId = '';
			if(typeof(inputConfig.value) == 'function'){
				var treeNodeId = inputConfig.value();
			}else{
				treeNodeId = inputConfig.value ? inputConfig.value :'';
			}
			var treeID = inputIDName+'-tree';
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<input id="'+inputIDName+'" type="text" nodeid="'+treeNodeId+'" name="'+inputIDName+'" treeType="'+inputConfig.treeId+'" nstype="'+inputConfig.type+'" value="'+treeValueStr+'" class="form-control" readonly>'
								+'<a id="'+treeCloseBtnID+'" href="javascript:void(0)" class="treeselect-arrow"><i class="fa fa-caret-down"></i></a>'
								+'<ul id="'+treeID+'" class="ztree hide"></ul>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type == 'person-select'){
			var historyHtml = '';
			var isUsedHistory = true;
			var rightNum = 33;
			if(typeof(inputConfig.isUsedHistory)=='boolean'){
				if(inputConfig.isUsedHistory==false){
					isUsedHistory = false;
					rightNum = 3;
				}
			}else{
				inputConfig.isUsedHistory = true;
			}
			if(isUsedHistory){
				historyHtml = 
					'<a href="javascript:void(0);" class="person-select-plane-btn" style="right: 3px;" ns-control="historyInfo">'
						+'<i class="fa fa-clock-o"></i>'
					+'</a>';
			}
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<input id="'+inputIDName+'" type="text" name="'+inputIDName+'"  nstype="'+inputConfig.type+'" personType="'+inputConfig.type+'" value="'+valueStr+'" class="form-control">'
								+'<a href="javascript:void(0);" class="person-select-plane-btn" style="right: '+(rightNum+30)+'px;" ns-control="personInfo">'
									+'<i class="fa fa-user"></i>'
								+'</a>'
								+'<a href="javascript:void(0);" class="person-select-plane-btn" style="right: '+rightNum+'px;" ns-control="groupInfo">'
									+'<i class="fa fa-sitemap"></i>'
								+'</a>'
								+historyHtml
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="radio"){
			radioHtml = '';
			if(debugerMode){
				if(typeof(inputConfig.subdata)!="object"){
					nsAlert('单选按钮组'+inputConfig.id+' subdata必须是数组','error');
					return false;
				}
			}
			if(inputConfig.subdata){
				var isDisabledNum = 0;
				for(var radioI = 0; radioI<inputConfig.subdata.length; radioI++){
					var radioCls = 'cbr cbr-primary';
					if(inputConfig.subdata[radioI].isChecked){
						var radioCls = 'cbr cbr-primary';
					}
					var radioTextStr = '';
					var radioValueStr = '';
					if(typeof(inputConfig.textField)=='undefined'){
						radioTextStr = inputConfig.subdata[radioI].text;
					}else{
						radioTextStr = inputConfig.subdata[radioI][inputConfig.textField];
					}
					if(typeof(inputConfig.valueField)=='undefined'){
						radioValueStr = inputConfig.subdata[radioI].value;
					}else{
						radioValueStr = inputConfig.subdata[radioI][inputConfig.valueField];
					}

					var checkedStr = '';
					if(valueStr){
						checkedStr = valueStr == radioValueStr ? "checked" :"";
					}else{
						checkedStr = inputConfig.subdata[radioI].isChecked ? "checked":"";
					}

					var disabledStr = "";
					var disabledBool = inputConfig.subdata[radioI].isDisabled?inputConfig.subdata[radioI].isDisabled:false;
					if(disabledBool){
						disabledStr = "disabled";
						isDisabledNum++; //统计disable的数量
					}else{
						disabledStr = "";
					}
					var radioMsgStr = '';
					if(inputConfig.subdata[radioI].msg){
						radioMsgStr = 'data-toggle="tooltip" title="'+inputConfig.subdata[radioI].msg+'"';
					}
					radioHtml += '<label class="radio-inline" '+radioMsgStr+'>'
									+'<input id="'+inputIDName+'-'+radioI+'" nstype="'+inputConfig.type+'" type="radio" '+checkedStr+' '+disabledStr+' class="'+radioCls+'" name="'+inputIDName+'" value="'+radioValueStr+'" >'
									+radioTextStr
								+'</label>';
				}
			}
			var disabledCls = ''
			if(isDisabledNum == inputConfig.subdata.length){
				disabledCls = ' all-disabled'; //全部都不可用才输出不可用样式
			}
			var radioClose = typeof(inputConfig.isHasClose)=='boolean' ? inputConfig.isHasClose : false;
			if(radioClose){
				var radioCloseLength = inputConfig.subdata.length;
				radioHtml += 
					'<label class="radio-inline radio-clear">'
						+'<input id="'+inputIDName+'-'+radioCloseLength+'"  nstype="'+inputConfig.type+'-clear" type="radio" class="cbr cbr-primary hide" name="'+inputIDName+'" value="" />'
						+'清空'
					+'</label>'
			}
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<div class="form-item radio '+disabledCls+'">'
									+ radioHtml
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="checkbox"){
			checkboxHtml = '';
			if(typeof(inputConfig.subdata)!="undefined"){
				var isDisabledNum = 0;
				for(var checkboxI = 0; checkboxI<inputConfig.subdata.length; checkboxI++){
					var checkboxCls = 'cbr cbr-primary';
					if(inputConfig.subdata[checkboxI].isChecked){
						var checkboxCls = 'cbr cbr-primary';
					}
					var checkboxTextStr = '';
					var checkboxValueStr = '';
					if(typeof(inputConfig.textField)=='undefined'){
						checkboxTextStr = inputConfig.subdata[checkboxI].text;
					}else{
						checkboxTextStr = inputConfig.subdata[checkboxI][inputConfig.textField];
					}
					if(typeof(inputConfig.valueField)=='undefined'){
						checkboxValueStr = inputConfig.subdata[checkboxI].value;
					}else{
						checkboxValueStr = inputConfig.subdata[checkboxI][inputConfig.valueField];
					}

					var checkedStr = '';
					if(typeof(inputConfig.value) == 'function'){
						var defaultCheckStr = inputConfig.value();
						checkedStr = checkboxValueStr == defaultCheckStr ?"checked":"";
					}else if(typeof(inputConfig.value) == 'string' || typeof(inputConfig.value)=='number'){
						if(inputConfig.value){
							checkedStr = inputConfig.value == checkboxValueStr ?"checked":"";
						}else{
							checkedStr = inputConfig.subdata[checkboxI].isChecked?" checked ":"";
						}
					}else if(typeof(inputConfig.value) == 'object'){
						for(var check in inputConfig.value){
							if(checkboxValueStr == inputConfig.value[check]){
								checkedStr = "checked";
							}
						}
					}
					
					var disabledStr = "";
					var disabledBool = inputConfig.subdata[checkboxI].isDisabled?inputConfig.subdata[checkboxI].isDisabled:false;
					if(disabledBool){
						disabledStr = "disabled";
						isDisabledNum++; //统计disable的数量
					}else{
						disabledStr = "";
					}
					checkboxHtml += '<label class="checkbox-inline">'
									+'<input id="'+inputIDName+'-'+checkboxI+'"  nstype="'+inputConfig.type+'" type="checkbox" '+checkedStr+' '+disabledStr+' class="'+checkboxCls+'" name="'+inputIDName+'" value="'+checkboxValueStr+'" >'
									+checkboxTextStr
								+'</label>'
				}
			}else{
				checkboxHtml = '<label class="checkbox-inline">'
							+'<input id="'+inputIDName+'0"  nstype="'+inputConfig.type+'" type="checkbox"  class="cbr cbr-primary" name="'+inputIDName+'" value="1" >'
								+inputConfig.textField
								+'</label>'
			}
			var disabledCls = ''
			if(isDisabledNum == inputConfig.subdata.length){
				disabledCls = ' all-disabled'; //全部都不可用才输出不可用样式
			}
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<div class="form-item checkbox '+disabledCls+'">'
									+ checkboxHtml
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="select2"){
			selectHtml = '<option value="">'+placeholderStr+'</option>';
			var select2GroupArr = inputConfig.subdata;//默认读取的是subdata值
			//是否是ajax方式读值
			if(typeof(inputConfig.url)=='string'){
				var isMethod = typeof(inputConfig.method) == 'string' ? inputConfig.method : 'GET';
				var params = typeof(inputConfig.params) == 'object' ? inputConfig.params : {};
				if(isMethod == ''){isMethod = 'GET'}
				$.ajax({
					url:inputConfig.url,
					dataType: "json", // 数据类型 
					type:isMethod,
					async:false,
					data:params,
					success:function(result){
						//是否定义了数据源参数
						if(typeof(inputConfig.dataSrc)=='undefined'){
							select2GroupArr = result;
						}else{
							select2GroupArr = result[inputConfig.dataSrc];
						}
					}
				})
			}
			if($.isArray(select2GroupArr)){
				//拿到的是数组格式
				var textField = typeof(inputConfig.textField)=='string' ? inputConfig.textField : 'text';
				var valueField = typeof(inputConfig.valueField)=='string' ? inputConfig.valueField : 'value';
				var childrenField = typeof(inputConfig.optchildren) == 'string' ? inputConfig.optchildren : 'children';
				for(var group in select2GroupArr){
					var textStr = select2GroupArr[group][textField];//文本值
					var optionStr = select2GroupArr[group][valueField];//id值
					//判断是否有分组的下拉框
					if($.isArray(select2GroupArr[group][childrenField])){
						//如果存在分组
						var childrenArr = select2GroupArr[group][childrenField];
						var groupTitle = typeof(inputConfig.optlabel) == 'string' ? inputConfig.optlabel : textField;
						selectHtml +='<optgroup label="'+select2GroupArr[group][groupTitle]+'">';
						for(var childI=0; childI < childrenArr.length; childI++){
							var childTextStr = childrenArr[childI][textField];
							var childValueStr = childrenArr[childI][valueField];
							var selectedStr = '';
							if(childrenArr[childI].selected == true){
								selectedStr = 'selected';
							}else{
								if(valueStr != ''){
									if(childValueStr == valueStr){
										selectedStr = 'selected';
									}
								}
							}
							var isDisabled = typeof(childrenArr[childI].isDisabled) == 'boolean' ? childrenArr[childI].isDisabled : false;
							var disabledStr = '';
							if(isDisabled){
								disabledStr = 'disabled';
							}
							selectHtml += '<option value="'+childValueStr+'" '+selectedStr+' '+disabledStr+'>'+childTextStr+'</option>';
						}
						selectHtml += '</optgroup>';
					}else{
						var selectedStr = '';
						if(select2GroupArr[group].selected == true){
							selectedStr = 'selected';
						}else{
							if(valueStr != ''){
								if(optionStr == valueStr){
									selectedStr = 'selected';
								}
							}
						}
						var isDisabled = typeof(select2GroupArr[group].isDisabled) == 'boolean' ? select2GroupArr[group].isDisabled : false;
						var disabledStr = '';
						if(isDisabled){
							disabledStr = 'disabled';
						}
						selectHtml += '<option value="'+optionStr+'" '+selectedStr+' '+disabledStr+'>'
										+textStr
									+'</option>';
					}
				}
			}
			var multiple = inputConfig.multiple ? 'multiple':'';
			var isDisabled = typeof(inputConfig.readonly) == 'boolean' ? inputConfig.readonly : false;
			if(typeof(inputConfig.disabled)=='boolean'){
				isDisabled = inputConfig.disabled;
			}
			var disabledStr = '';
			if(isDisabled){
				disabledStr = 'disabled';
			}
			selectHtml = '<select class="form-control" '+disabledStr+' nstype="'+inputConfig.type+'" id="'+inputIDName+'" '+multiple+' >'
							+selectHtml
						+'</select>'
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<div class="form-item select2">'
									+ selectHtml
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="select"){
			selectHtml = '<option value="">'+placeholderStr+'</option>';
			var selectData;
			var selectAjaxData = {};
			if(inputConfig.data){
				selectAjaxData = inputConfig.data;
			}
			if(inputConfig.url =='' || inputConfig.url == null){
				selectData = inputConfig.subdata;
			}else{
				$.ajax({
					url:inputConfig.url, //请求的数据链接
					type:inputConfig.method,
					data:selectAjaxData,
					dataType:'json',
					async:false,
					success:function(rec){
						if(typeof(inputConfig.dataSrc)=='undefined'){
							selectData = rec;
						}else{
							for(data in rec){
								selectData = rec[inputConfig.dataSrc];
							}
						}
					},
					error: function () {
						nsalert('请检查数据格式是否合法','warning');
					}
				});
			}
			if(selectData){
				if(selectData.length > 0){
					for(var selectI = 0; selectI<selectData.length; selectI++){
						//var checkedStr = inputConfig.subdata[selectI].isChecked?" selected ":"";
						var textStr = '';
						var valueStrI = '';
						if(typeof(inputConfig.textField)=='undefined'){
							textStr = selectData[selectI].text;
						}else{
							textStr = selectData[selectI][inputConfig.textField];
						}
						if(typeof(inputConfig.valueField)=='undefined'){
							valueStrI = selectData[selectI].value;
						}else{
							valueStrI = selectData[selectI][inputConfig.valueField];
						}
						var checkedStr = '';
						if(valueStr){
							checkedStr = valueStr == valueStrI ? "selected":"";
						}else{
							checkedStr = selectData[selectI].selected ? "selected":"";
						}
						var disabledStr = selectData[selectI].isDisabled?" disabled ":"";
						selectHtml += '<option value="'+valueStrI+'" '+checkedStr+' '+disabledStr+'>'
										+textStr
									+'</option>'
					}
				}else{
					if(valueStr){
						selectHtml += '<option value="'+valueStr+'" selected>'+valueStr+'</option>'; 
					}
				}
			}
			selectFormPlane.select[formID][inputConfig.id] = selectData; 
			var isSelectDiabled = inputConfig.disabled ? 'disabled' : '';
			selectHtml = '<select class="form-control" id="'+inputIDName+'" '+isSelectDiabled+'>'
							+selectHtml
						+'</select>'
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<div class="form-item select">'
									+ selectHtml
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="text-btn"){
			var btnArr = inputConfig.btns;
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group">'
								+labelHtml
								+'<div class="form-item">'
									+'<div class="input-group">'
										+'<input id="'+inputIDName+'" name="'+inputIDName+'" '+readonlyStr+' nstype="'+inputConfig.type+'" type="text" class="form-control" placeholder="'+placeholderStr+'" value="'+valueStr+'">';
			if(typeof(btnArr)!='undefined' && btnArr.length >0){
				inputHtml += '<div class="input-group-btn text-btn">';
				for(var btn = 0 ; btn < btnArr.length; btn ++){
					var disabled = btnArr[btn].isDisabled?" disabled ":"";
					var btnJson = {};
					btnJson.text = btnArr[btn].text;
					btnJson.handler = btnArr[btn].handler;
					btnJson.disabled = disabled;
					inputHtml+= commonConfig.getBtn(btnJson,'form',btn,true,false);					
				}						
				inputHtml += '</div>';
			}							
			
			inputHtml += '</div>'
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="typeahead"){
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group">'
								+labelHtml
								+'<div class="form-item">'
									+'<div class="typeahead__container">'
										+'<div class="typeahead__field">'
											+'<span class="typeahead__query">'
												+'<input id="'+inputIDName+'" class="form-control"  nstype="'+inputConfig.type+'" type="search" placeholder="Search" autofocus autocomplete="off" />'
											+'</span>'
											+'<span class="typeahead__button">'
												+'<button type="button">'
													+'<span class="typeahead__search-icon"></span>'
												+'</button>'
											+'</span>'
										+'</div>'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="add-select-input"){
			if(typeof(inputConfig.hiddenID)=="undefined"){
				inputConfig.hiddenID = inputConfig.id+'-hidden-'+parseInt(Math.random()*100000+1);
			}
			if(typeof(inputConfig.submitIndex)=="number"){
				inputConfig.localDataHiddenIDIndex = inputConfig.submitIndex
			}
			var inputHiddenIDName = "form-"+formID+"-"+inputConfig.hiddenID;
			inputConfig.fullHiddenID = inputHiddenIDName;
			var tooltipHtml ='data-toggle="tooltip" data-placement="top" title="直接输入：张某 18610611123 则可自动保存为新用户" '
			inputHtml ='<div class="form-td add-select-input '+inputSize+'">'
							+'<div class="form-group">'
								+labelHtml
								+'<div class="form-item">'
									+'<div class="input-group">'
										+'<input id="'+inputIDName+'" name="'+inputIDName+'"  nstype="'+inputConfig.type+'" type="text" placeholder="'+placeholderStr+'" class="form-control" value="'+valueStr+'" '+readonlyStr+'>'
										+'<a href="javascript:void(0);" class="input-group-btn add-select-input-btn" ns-control="refresh"><i class="fa fa-refresh"></i></a>'
										+'<a href="javascript:void(0);" class="input-group-btn add-select-input-btn" ns-control="list"><i class="fa fa-list"></i></a>'
										+'<input id="'+inputHiddenIDName+'" name="'+inputHiddenIDName+'" nstype="'+inputConfig.type+'-hidden" type="hidden" >'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="organiza-select"){
			if(typeof(inputConfig.hiddenID)=="undefined"){
				inputConfig.hiddenID = inputConfig.id+'-origanize-hidden-'+parseInt(Math.random()*100000+1);
			}
			var inputHiddenIDName = "form-"+formID+"-"+inputConfig.hiddenID;
			inputConfig.fullHiddenID = inputHiddenIDName;
			var text = '';
			var tid = '';
			if(typeof(valueStr)=='object'){
				text = valueStr.text;
				tid = valueStr.id;
			}
			var addBtnHtml = '';
			if(typeof(inputConfig.addHandler) == 'function'){
				addBtnHtml = '<a href="javascript:void(0);" class="input-group-btn origanize-select-btn" ns-control="add"><i class="fa fa-plus"></i></a>';
			}
			inputHtml = '<div class="form-td '+inputConfig.type+' '+inputSize+'">'
							+'<div class="form-group">'
								+labelHtml
								+'<div class="form-item">'
									+'<div class="input-group">'
										+'<input class="form-control" '
										+' nstype="'+inputConfig.type+'"'
										+' name="'+inputIDName +'"'
										+' id="'+inputIDName+'"'
										+' placeholder="'+placeholderStr+'"'
										+' type="text"'
										+' value="'+text+'">'
										+'<a href="javascript:void(0);" class="input-group-btn origanize-select-btn" ns-control="search"><i class="fa fa-search"></i></a>'
										+addBtnHtml
										+'<input id="'+inputHiddenIDName+'" value="'+tid+'" name="'+inputHiddenIDName+'" nstype="'+inputConfig.type+'-hidden" type="hidden" >'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="province-select"){
			var provinceData = provinceInfo;
			var provSelectedStr = '';//省
			var citySelectedStr = '';//市
			var areaSelectedStr = '';//区
			if(typeof(valueStr) == 'object'){
				provSelectedStr = valueStr.province ? valueStr.province : '';
				citySelectedStr = valueStr.city ? valueStr.city : '';
				areaSelectedStr = valueStr.area ? valueStr.area : '';
			}
			var cityData = [];
			var areaData = [];
			var isShowCityDom = 'hide';
			var isShowAreaDom = 'hide';
			var selectProHtml = '';//省份html
			var selectCityHtml = '';//市 html
			var selectAreaHtml = '';//区 html
			for(var proI = 0; proI < provinceData.length; proI ++){
				var currentProvname = provinceData[proI].name;
				var currentProval = currentProvname;  //value值等同于text文本值的显示
				if(currentProval == '省份'){
					currentProval = '';
				}
				var isSelected = '';
				//存在默认省份的设置
				if(provSelectedStr != ''){
					if(currentProvname == provSelectedStr){
						cityData = provinceData[proI].sub;
						isSelected = 'selected';
					}
				}
				selectProHtml += '<option value="'+currentProval+'" '+isSelected+'>'+currentProvname+'</option>';
			}
			if(provSelectedStr == ''){
				citySelectedStr = provinceData[0].name;
				cityData = provinceData[0].sub;
				areaSelectedStr = cityData[0].name;
			}
			if(citySelectedStr != ''){
				isShowCityDom = '';
				for(var cityI = 0; cityI < cityData.length; cityI ++){
					var currentCityname = cityData[cityI].name;
					var isCitySelected = '';
					if(currentCityname == citySelectedStr){
						areaData = cityData[cityI].sub;
						isCitySelected = 'selected';
					}
					selectCityHtml += '<option value="'+currentCityname+'" '+isCitySelected+'>'+currentCityname+'</option>';
				}
			}
			if(areaSelectedStr != ''){
				isShowAreaDom = '';
				for(var areaI = 0; areaI < areaData.length; areaI ++){
					var currentAreaname = areaData[areaI].name;
					var isAreaSelected = '';
					if(currentAreaname == areaSelectedStr){
						isAreaSelected = 'selected';
					}
					selectAreaHtml += '<option value="'+currentAreaname+'" '+isAreaSelected+'>'+currentAreaname+'</option>';
				}
			}
			selectProHtml = '<select class="form-control" nstype="'+inputConfig.type+'" data-pro="province" id="'+inputIDName+'-province">'
							+selectProHtml
						+'</select>';
			selectCityHtml = '<select class="form-control" nstype="'+inputConfig.type+'" data-pro="city" id="'+inputIDName+'-city">'
							+selectCityHtml
						+'</select>';
			selectAreaHtml = '<select class="form-control" nstype="'+inputConfig.type+'" data-pro="area" id="'+inputIDName+'-area">'
							+selectAreaHtml
						+'</select>';

			selectProHtml = '<div class="form-td col-sm-4 col-xs-12">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+'<label class="control-label  province-select-label" for="'+inputIDName+'-province">'
									+'省</label>'
								+'<div class="form-item select">'
									+ selectProHtml
								+'</div>'
							+'</div>'
						+'</div>';
			selectCityHtml = '<div class="form-td col-sm-4 col-xs-12">'
								+'<div class="form-group" '+formGroupHeight+'>'
									+'<label class="control-label  province-select-label" for="'+inputIDName+'-city">'
									+'市</label>'
									+'<div class="form-item select">'
										+ selectCityHtml
									+'</div>'
								+'</div>'
							+'</div>';
			selectAreaHtml = '<div class="form-td col-sm-4 col-xs-12">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+'<label class="control-label  province-select-label" for="'+inputIDName+'-country">'
									+'区</label>'
								+'<div class="form-item select">'
									+ selectAreaHtml
								+'</div>'
							+'</div>'
						+'</div>';
			inputHtml = selectProHtml + selectCityHtml + selectAreaHtml;
		}else{				
			nsalert('配置类型参数：'+inputConfig.type+' 填写有误，请核实');
		}
		
	}
	return inputHtml;
}
commonConfig.getSelectData = function(inputConfig){
	if(inputConfig.url =='' || inputConfig.url == null){
		selectData = inputConfig.subdata;
	}else{
		var ajaxUrl = inputConfig.url;
		if(typeof(ajaxUrl)=='function'){
			ajaxUrl = ajaxUrl();
		}
		var ajaxData = inputConfig.data;
		if(typeof(ajaxData)=='function'){
			ajaxData = ajaxData();
		}
		$.ajax({
			url: 	ajaxUrl, 
			type: 	inputConfig.method,
			data: 	ajaxData,
			async:false,
			success:function(rec){
				if(typeof(inputConfig.dataSrc)=='undefined'){
					selectData = rec;
				}else{
					for(data in rec){
						selectData = rec[inputConfig.dataSrc];
					}
				}
			},
			error: function () {
				nsalert('请检查数据格式是否合法','warning');
			}
		});
	}
	return selectData;
}
commonConfig.getRules = function(jsonArray,formID){
	formPlane.fillValid[formID] = {};
	var fillObj = {};
	var validateObj = {};
	var rules = {};
	for(var inputI=0; inputI<jsonArray.length; inputI++){
		if(typeof(jsonArray[inputI].rules)!='undefined'){
			var key = "form-"+formID+"-"+jsonArray[inputI].id;
			var value = {};
			var rulesStr = jsonArray[inputI].rules;
			var rulesArr = rulesStr.split(' ');
			for(var ruleI=0;ruleI<rulesArr.length; ruleI++){
				if(rulesArr[ruleI]=='required'){
					value['required'] = true;
				};
				if(rulesArr[ruleI]=='number'){
					value['number'] = true;
				};
				if(rulesArr[ruleI]=='email'){
					value['email'] = true;
				};
				//手机号
				if(rulesArr[ruleI]=='ismobile'){
					value['ismobile'] = true;
				};
				//邮政编码
				if(rulesArr[ruleI]=='postalcode'){
					value['postalcode'] = true;
				};
				//年份
				if(rulesArr[ruleI]=='year'){
					value['year'] = true;
				};
				//月份
				if(rulesArr[ruleI]=='month'){
					value['month'] = true;
				};
				if(rulesArr[ruleI]=='url'){
					value['url'] = true;
				};
				if(rulesArr[ruleI]=='date'){
					value['date'] = true;
				};
				if(rulesArr[ruleI]=='dateISO'){
					value['dateISO'] = true;
				};
				if(rulesArr[ruleI].indexOf('equalTo=')>-1){
					var toIDStr = rulesArr[ruleI];
					toIDStr = toIDStr.substr(toIDStr.indexOf("=")+1,toIDStr.length);
					toIDStr = "form-"+formID+"-"+toIDStr;
					value['equalTo'] = "#"+toIDStr;
				};
				if(rulesArr[ruleI].indexOf('minlength=')>-1){
					value['minlength'] = commonConfig.getRuleNumber(rulesArr[ruleI],'minlength');
				};
				if(rulesArr[ruleI].indexOf('maxlength=')>-1){
					value['maxlength'] = commonConfig.getRuleNumber(rulesArr[ruleI],'maxlength');
				};
				if(rulesArr[ruleI].indexOf('min=')>-1){
					value['min'] = commonConfig.getRuleNumber(rulesArr[ruleI],'min');
				};
				if(rulesArr[ruleI].indexOf('max=')>-1){
					value['max'] = commonConfig.getRuleNumber(rulesArr[ruleI],'max');
				};
				if(rulesArr[ruleI].indexOf('range=')>-1){
					value['range'] = commonConfig.getRuleNumberArray(rulesArr[ruleI]);
				};
				if(rulesArr[ruleI].indexOf('rangelength=')>-1){
					value['rangelength'] = commonConfig.getRuleNumberArray(rulesArr[ruleI]);
				};

				if(rulesArr[ruleI].indexOf('precision')>-1){
					value['precision'] = commonConfig.getRuleNumber(rulesArr[ruleI],'precision');
				}
				//身份证
				if(rulesArr[ruleI]=='Icd'){
					value['Icd'] = true;
				};
				//银行卡号
				if(rulesArr[ruleI]=='bankno'){
					value['bankno'] = true;
				};
				if(rulesArr[ruleI]=='autocomplete'){
					fillObj[key] = autoCompleteValid(key);
				}
				if(rulesArr[ruleI]=='select'){
					fillObj[key] = selectValid(jsonArray[inputI].value,jsonArray[inputI].subdata);
				}
				if(rulesArr[ruleI]=='select2'){
					fillObj[key] = selectValid(jsonArray[inputI].value,jsonArray[inputI].subdata);
				}
				if(rulesArr[ruleI] == 'upload'){
					fillObj[key] = uploadValid(jsonArray[inputI].subdata);
				}
			}
			rules[key] = value;
		}
		validateObj['rules'] = rules;
		formPlane.fillValid[formID] = fillObj;

		validateObj['errorPlacement'] = function(error, element){
			if(element.attr('nstype')=='radio') {
		    	error.appendTo( element.closest('.form-item.radio'));
			}else{
				//error.appendTo(element);
				element.after(error)
			}
		}
		
	}
	return validateObj;
}
commonConfig.getRulesPrecisionNumber = function(elestr,rules){
	var eleRules;
	var isPassRules = false;
	elestr = Number(elestr);
	if(isNaN(elestr)){isPassRules = false}
	if(rules == 0){
		var interger =  /^\d+$/;
		var negative = /^((-\d+)|(0+))$/;
		if(interger.test(elestr) || negative.test(elestr)){
			isPassRules = true;
		}else{
			isPassRules = false;
		}
	}else{
		switch(rules){
			case 1:
				eleRules = /^\d{0,9}\.\d{0,1}$|^\d{0,9}$/;
				break;
			case 2:
				eleRules = /^\d{0,9}\.\d{0,2}$|^\d{0,9}$/;
				break;
			case 3:
				eleRules = /^\d{0,9}\.\d{0,3}$|^\d{0,9}$/;
				break;
			case 4:
				eleRules = /^\d{0,9}\.\d{0,4}$|^\d{0,9}$/;
				break;
			case 5:
				eleRules = /^\d{0,9}\.\d{0,5}$|^\d{0,9}$/;
				break;
		}
		if(eleRules.test(elestr)){
			isPassRules = true;
		}else{
			isPassRules = false;
		}
	}
	return isPassRules;
}
//默认输入的小数
commonConfig.getPrecisionNumber = function(str){
	var numberStr = str.substr(str.indexOf("=")+1,str.length);
	var number = parseInt(numberStr);
	return number;
}

commonConfig.getRuleNumber = function(configStr,valueName){
	/*var numberStr = str.substr(str.indexOf("=")+1,str.length);
	var number = parseInt(numberStr);
	return number;*/
	var number;
	if(configStr.indexOf(valueName)>-1){
		var validStr = configStr.substring(configStr.indexOf(valueName),configStr.length);
		var endIndexNum = validStr.split(' ');
		number = endIndexNum[0].substr(endIndexNum[0].indexOf("=")+1,endIndexNum[0].length);
	}
	number = parseInt(number);
	return number;
}
/**
 * 根据rules自动生成placeholder字符串
 */
commonConfig.getPlaceHolder = function(config){
	var placeholderStr = "";
	if(typeof(config.placeholder)=="undefined"){
		if(typeof(config.rules)!="undefined"){
			var tempPlaceholderStr = "";
			if(config.rules.indexOf("required")>=0){
				tempPlaceholderStr +="必填";
			}
			if(config.rules.indexOf("email")>=0){
				tempPlaceholderStr +=" xxx@xxx.xxx";
			}
			if(config.rules.indexOf("dateISO")>=0){
				tempPlaceholderStr +=" 年-月-日";
			}
			if(config.rules.indexOf("url")>=0){
				tempPlaceholderStr +=" 有效网址";
			}
			if(config.rules.indexOf("number")>=0){
				tempPlaceholderStr += " 数字";
			}
			if(config.rules.indexOf("minlength")>=0){
				tempPlaceholderStr += " 最少"+commonConfig.getRuleNumber(config.rules,'minlength')+"个字";
			}
			//验证小数位数
			if(config.rules.indexOf("precision") >= 0){
				tempPlaceholderStr += "	小数位数"+commonConfig.getRuleNumber(config.rules,'precision')+"位";
			}
			if(config.rules.indexOf("maxlength")>=0){
				tempPlaceholderStr += " 最多"+commonConfig.getRuleNumber(config.rules,'maxlength')+"个字";
			}
			if(config.rules.indexOf("min=")>=0){
				tempPlaceholderStr += " 不小于"+commonConfig.getRuleNumber(config.rules,'min')+"的数字";
			}
			if(config.rules.indexOf("max=")>=0){
				tempPlaceholderStr += " 不大于"+commonConfig.getRuleNumber(config.rules,'max')+"的数字";
			}
			if(config.rules.indexOf("range=")>=0){
				var tempRulesArr = commonConfig.getRuleNumberArray(config.rules);
				tempPlaceholderStr += " 数字 "+tempRulesArr[0]+"到"+tempRulesArr[1];
				tempRulesArr = null;
			}
			//如果还有手机，手机的验证
			if(config.rules.indexOf("ismobile")>=0){
				tempPlaceholderStr +=" 默认手机号11位";
			}
			//邮政编码
			if(config.rules.indexOf("postalcode")>=0){
				tempPlaceholderStr +="请输入邮政编码";
			}
			//四位年份
			if(config.rules.indexOf("year")>=0){
				tempPlaceholderStr +="请输入四位年份";
			}
			//月份1-12
			if(config.rules.indexOf("month")>=0){
				tempPlaceholderStr +="请输入月份";
			}
			//身份证号码的验证
			if(config.rules.indexOf("Icd")>=0){
				tempPlaceholderStr +="请输入身份证号码";
			}
			//银行卡号
			if(config.rules.indexOf("bankno")>=0){
				tempPlaceholderStr +="请输入银行卡号";
			}
			//下拉框
			if(config.rules.indexOf("select")>=0){
				tempPlaceholderStr = '必填';
			}
			if(config.rules.indexOf("select2")>=0){
				tempPlaceholderStr = '必填';
			}
			placeholderStr = tempPlaceholderStr;
		}else{
			placeholderStr = '';
		}
	}else{
		placeholderStr = config.placeholder;
	}
	return placeholderStr;
}
//日期比较，只能输入今天之前的日期
commonConfig.compareDate =  function(newDate){
	var currentDate = new Date();
	var year = currentDate.getFullYear();       //年
	var month = currentDate.getMonth() + 1;     //月
	var day = currentDate.getDate();            //日
	var oldDate = year + "-";
	if (month < 10) { oldDate += "0"; }
	oldDate += month + "-";
	if (day < 10) { oldDate += "0"; }
	oldDate += day + " ";
	var flag = false;
	var oldArr = oldDate.split('-');
	var newArr = newDate.split('-');
	var count = oldArr.length;
	for (var i = 0; i < count; i++) {
		if (parseInt(oldArr[i]) < parseInt(newArr[i])) {
			flag = true;
			break;
		} else if (parseInt(oldArr[i]) > parseInt(newArr[i])) {
			break;
		}
	}
	return flag;
}
commonConfig.getRuleNumberArray = function(str){
	//将'range=[13,23]'转成 12,23数组
	var b1 = str.indexOf('[');
	var b2 = str.indexOf(',');
	var b3 = str.indexOf(']');
	var number1 = parseInt(str.substring(b1+1,b2));
	var number2 = parseInt(str.substring(b2+1,b3));
	return [number1,number2];
}
/**
 * 格式化时间
 * dataNumber是毫秒数 如1471862506000 
 * isFullTime是否显示时分秒，默认为不显示
 * 
 * @returns 年/月/日  或者（isFullTime==false） 年/月/日 时:分:秒
 */
commonConfig.formatDate = function(dateNumber,isFullTime){
	var isFullTimeBln = arguments[1] ? arguments[1] : 'YYYY-MM-DD';
	var newDataNumber;
	var date;
	if(typeof(dateNumber)=="string"){
		if(dateNumber == ""){
			date = new Date();
		}else{	
			var newDataNumber = Number(dateNumber);
			if(isNaN(newDataNumber)){
				returnStr =  moment(dateNumber).format(isFullTimeBln);
				return returnStr;
			}else{
				date = new Date(newDataNumber);
			}
		}
	}else if(typeof(dateNumber)=="number"){
		date = new Date(dateNumber);
	}else if(typeof(dateNumber)=="undefined"){
		date = new Date();
	}else{
		return '';
	}
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var second = date.getSeconds();

	var monthStr = month<10?"0"+month:month.toString();
	var dayStr = day<10?"0"+day:day.toString();
	var hourStr = hour<10?"0"+hour:hour.toString();
	var minuteStr = minute<10?"0"+minute:minute.toString();
	var secondStr = second<10?"0"+second:second.toString();

	var returnStr = "";
	returnStr =  year+'-'+monthStr+'-'+dayStr+" "+hourStr+":"+minuteStr+":"+secondStr; 
	returnStr =  moment(returnStr).format(isFullTimeBln);
	return returnStr;
}
commonConfig.setSelectKeyValue = function(id,value,type){
	switch(type){
		case 'selectText':
			var selectStr = value.select;
			var textStr = value.text;
			$('#'+id+'CompareType').val(selectStr);
			var selectTextStr = $("#"+id+"CompareType").find("option:selected").text();
			$("#"+id+"CompareType").next().find('.selectboxit-btn .selectboxit-text').text(selectTextStr);
			$('#'+id+"DefaultValue1").val(textStr);
			break;
		case 'selectSelect':
			var firstStr = value.firstSelect;
			var secondStr = value.secondStr;
			$('#'+id+'CompareType').val(firstStr);
			var selectTextStr = $("#"+id+"CompareType").find("option:selected").text();
			$("#"+id+"CompareType").next().find('.selectboxit-btn .selectboxit-text').text(selectTextStr);
			
			$('#'+id+'DefaultValue1').val(secondStr);
			var selectTextStr1 = $("#"+id+"DefaultValue1").find("option:selected").text();
			$("#"+id+"DefaultValue1").next().find('.selectboxit-btn .selectboxit-text').text(selectTextStr1);
			
			break;
		case 'selectDate':
			var selectStr = value.select;
			var textStr = value.date;
			$('#'+id+'CompareType').val(selectStr);
			var selectTextStr = $("#"+id+"CompareType").find("option:selected").text();
			$("#"+id+"CompareType").next().find('.selectboxit-btn .selectboxit-text').text(selectTextStr);
			$('#'+id+'DefaultValue1Temp').val(textStr);
			$('#'+id+'DefaultValue1').val(textStr);
			$('#'+id+'DefaultValue2').val(textStr);
			break;
	}
}
//填充value，subdata是当前控件的附属数据，如单选则需要提供此数据
commonConfig.setKeyValue = function(id,value,type,subdata,valueField){
	//console.log("id:"+id+" value:"+value+" type:"+type);
	switch(type){
		case 'text':
			$("#"+id).val(value);
			break;
		case 'date':
			var regu = /^[-+]?\d*$/;
			if(regu.test(value)){
				value = commonConfig.formatDate(value);
			};
			$("#"+id).val(value);
			break;
		case 'datetime':
			var dateStr = value.split(' ')[0];
			var timeStr = value.split(' ')[1];
			timeStr = typeof(timeStr) == 'undefined' ? '' : timeStr;
			$('#'+id+'-date').val(dateStr);
			$('#'+id+'-time').val(timeStr);
			break;
		case 'checkbox':
			var checkboxData = subdata; 
			for(var chkI = 0; chkI<checkboxData.length; chkI++){
				if(checkboxData[chkI][valueField] == value){
					$("#"+id+"-"+chkI).get(0).checked = true;
				}else{
					$("#"+id+"-"+chkI).attr("checked",false);
				}
			}
			break;
		case 'radio':
			var radioData = subdata; 
			for(var radioI = 0; radioI<radioData.length; radioI++){
				if(radioData[radioI][valueField] == value){
					$("#"+id+"-"+radioI).get(0).checked = true;
				}else{
					$("#"+id+"-"+radioI).attr("checked",false);
				}
			}
			break;
		case 'select':
			$("#"+id).val(value);
			var selectTextStr = $("#"+id).find("option:selected").text();
			$("#"+id).next().find('.selectboxit-btn .selectboxit-text').text(selectTextStr);
			break;
		case 'select2':
			var $selectChange = $select2Change[id];
			$selectChange.val(value).trigger('change');
			break;
		case "province-select":
			var proviceID = id+'-province';
			var cityID = id+'-city';
			var areaID = id+'-area';
			if(typeof(value) == 'object'){
				if(typeof(value.province)!='undefined'){
					$('#'+proviceID).val(value.province);
					var selectBoxOption = $('#'+proviceID).selectBoxIt().data("selectBox-selectBoxIt");
					selectBoxOption.refresh();
				}
				if(typeof(value.city)!='undefined'){
					$('#'+cityID).val(value.city);
					var selectBoxOption = $('#'+cityID).selectBoxIt().data("selectBox-selectBoxIt");
					selectBoxOption.refresh();
				}
				if(typeof(value.area)!='undefined'){
					$('#'+areaID).val(value.area);
					var selectBoxOption = $('#'+areaID).selectBoxIt().data("selectBox-selectBoxIt");
					selectBoxOption.refresh();
				}
			}
			break;
		case "tree-select":
			var treeId = id +'-tree';
			$('#'+id).val(value.text);
			$('#'+id).attr("value",value.text);
			$('#'+id).attr("nodeid",value.value);
			treeUI.selectedTreeNode(treeId,value.value);
			break;
		default:
			$("#"+id).val(value);
			break;
	}		
}
/***************************************************************************************************
 * 导航按钮组
 * 
 * @returns
 */
var nsNav = {};
nsNav.json = {}; 				//原始数据
nsNav.btnHandler = {};			//普通按钮事件
nsNav.btnGroupHandler = {};		//按钮组事件
nsNav.config = {};
nsNav.init = function(navJson){
	if(typeof(navJson.id)=='undefined'){
		nsalert("导航按钮未定义",'error');
		return false;
	}
	if(typeof(navJson.btns)!='undefined'){
		nsNav.initBtns(navJson);
	}
}
nsNav.initConfigBtn = function(configObj,$container){
	var pageCode = 'document'; 
	if(configObj.pageCode){
		pageCode = configObj.pageCode;
	}
	var navID = configObj.nav[0].id;
	nsNav.config[navID] = configObj;
	var ulHtml = '';
	$.each(configObj,function(key,value){
		if(key=='nav'||key=='formJson'||key=='tableJson'){
			var listName;
			var listIcon;
			switch(key){
				case 'nav':
					listName = '导航按钮配置';
					listIcon = 'fa-inbox';
					break;
				case 'formJson':
					listName = '表单配置';
					listIcon = 'fa-terminal';
					break;
				case 'tableJson':
					listName = '表格配置';
					listIcon = 'fa-table';
					break;
			}
			var iconHtml = '<i class="fa '+listIcon+'"></i> ';
			var listHtml = '<li><a href="javascript:void(0);" pageCode="'+pageCode+'" configtype="'+key+'">'+listName+'</a></li>';
			listHtml+='<li class="divider"></li>';
			ulHtml +=listHtml;
		}
	})
	ulHtml+='<li><a href="javascript:void(0);" pageCode="'+pageCode+'" configtype="all">全部恢复默认</a></li>';
	ulHtml = '<ul class="dropdown-menu" role="menu">'+ulHtml+'</ul>';
	var configBtnHtml = '<div class="nav-config"><a class="nav-config-btn" href="javascript:void(0);"  data-toggle="dropdown"><i class="fa-cog"></i></a>'+ulHtml+'</div>';
	//根据参数决定输出位置
	if(typeof($container)=='object'){
		$container.html(configBtnHtml);
	}else{
		$("#"+navID).append(configBtnHtml);
	}
	
	$("#"+navID+' .nav-config ul.dropdown-menu li a').on("click",function(ev){
		//var navID = $(this).closest('.page-title.nav-form').attr('id');
		var type = $(this).attr('configtype');
		var pageCode = $(this).attr('pageCode');
		nsNav.configBtnHandler(pageCode,type);
	});
}
nsNav.configBtnHandler = function(pageCode,type){
	switch(type){
		case 'nav':
			nsCustomConfig.initButtonConfigPage(pageCode);
			break;
		case 'formJson':
			nsCustomConfig.initFormConfigPage(pageCode);
			break;
		case 'tableJson':
			nsCustomConfig.initTableConfigPage(pageCode);
			break;
		case 'all':
			nsCustomConfig.clearCustomData(pageCode);
			break;
	}
}
nsNav.initBtns = function(navJson){
	var btnsHtml = '';
	var btnHandlerArr = [];//button按钮的事件
	var groupBtnHandlerArr = [];//button按钮下拉框
	var btnIndex = 0;
	//获取普通按钮
	if($.isArray(navJson.btns)){
		for(var btnGroupID=0; btnGroupID<navJson.btns.length; btnGroupID++){
			var btnGroupHtml = '<div class="btn-group">';
			for(var btnID=0; btnID<navJson.btns[btnGroupID].length; btnID++){
				if(typeof(navJson.btns[btnGroupID][btnID].subdata)!='undefined'){
					for(var childBtn in navJson.btns[btnGroupID][btnID].subdata){
						if(typeof(navJson.btns[btnGroupID][btnID].subdata[childBtn].handler)=='function'){
							groupBtnHandlerArr.push(navJson.btns[btnGroupID][btnID].subdata[childBtn].handler);
						}else{
							groupBtnHandlerArr.push('');
						}
					}
				}
				btnGroupHtml += commonConfig.getBtn(navJson.btns[btnGroupID][btnID],"form",btnIndex);
				
				if(typeof(navJson.btns[btnGroupID][btnID].handler)=='function'){ 
					btnHandlerArr.push(navJson.btns[btnGroupID][btnID].handler);
				}else{
					btnHandlerArr.push('');
				};
				
				btnIndex++;
			}
			btnGroupHtml += "</div>";
			btnsHtml += btnGroupHtml;
		}
	}
	//获取大按钮
	var bigBtnsHtml = ''
	var bigBtnHandlerArr = [];
	if(typeof(navJson.bigBtns)=='object'){
		var bigBtnsObj = nsNav.btnBigInit(navJson, btnHandlerArr);
		bigBtnsHtml = bigBtnsObj.html;
		bigBtnHandlerArr = bigBtnsObj.handlerArr;
		if(bigBtnHandlerArr.length>0){
			//合并两个数组
			btnHandlerArr.push.apply(btnHandlerArr,bigBtnHandlerArr);
		}
	}
	//定制按钮容器
	var customBtnHtml = '';
	if(navJson.isCustom){
		customBtnHtml = '<div class="btn-custom"></div>'
	}
	var navHtml = btnsHtml + customBtnHtml + bigBtnsHtml;
	var navID = 'default';
	if(typeof(navJson.id)!="undefined"){
		$("#"+navJson.id).html(navHtml);
		navID = navJson.id;
	}else{
		$(".nav-form").html(navHtml);
	}
	if(navJson.isCustom){
		
	}
	nsNav.json[navID] = navJson;
	nsNav.btnHandler[navID] = btnHandlerArr;
	nsNav.btnGroupHandler[navID] = groupBtnHandlerArr;
	nsNav.btnInit(btnHandlerArr,groupBtnHandlerArr,navID);
}
//大按钮初始化
nsNav.btnBigInit = function(navJson, btnHandlerArr){
	var html = '';
	var handlerArr = [];
	function getFid(){
		var fid = btnHandlerArr.length + handlerArr.length;
		fid = 'fid="'+fid+'"';
		return fid;
	}
	//回退按钮
	if(typeof(navJson.bigBtns.histroyBtn)=='object'){
		if(typeof(navJson.bigBtns.histroyBtn.handler)=='function'){
			html +='<button class="btn-big btn-histroy" type="button" '+getFid()+'><i class="fa-chevron-left" ></i></button>';
			handlerArr.push(navJson.bigBtns.histroyBtn.handler);
		}else if(typeof(navJson.bigBtns.histroyBtn.handler)=='string'){
			html +='<button class="btn-big btn-histroy" type="button" onclick="'+navJson.bigBtns.histroyBtn.handler+'();"><i class="fa-chevron-left" ></i></button>';
			handlerArr.push('');
		}
	}
	//新增按钮
	if(typeof(navJson.bigBtns.addBtn)=='object'){
		if(typeof(navJson.bigBtns.addBtn.handler)=='function'){
			html +='<button class="btn-big btn-plus" type="button" '+getFid()+'><i class="fa-plus" ></i></button>';
			handlerArr.push(navJson.bigBtns.addBtn.handler);
		}else if(typeof(navJson.bigBtns.addBtn.handler)=='string'){
			html +='<button class="btn-big btn-plus" type="button" onclick="'+navJson.bigBtns.addBtn.handler+'();"><i class="fa-plus" ></i></button>';
			handlerArr.push('');
		}
	}
	//
	if(html != ''){
		html = '<div class="btn-group-big">'+html+'</div>';
	}
	return {
		html:html,
		handlerArr:handlerArr
	}
}
nsNav.btnInit = function(btnArr,btnGroupArr,navID){
	for(var btnI=0;btnI<btnArr.length; btnI++){
		if(btnArr[btnI]!=''){
			var btnDom
			if(navID=='default'){
				btnDom = $(".nav-form button")[btnI];
			}else{
				btnDom = $("#"+navID+".nav-form button")[btnI];
			}
			
			var controlPlaneID = 'default';
			if(btnArr[btnI]!=''){
				$(btnDom).off('click');
				$(btnDom).on('click',function(ev){
					if(typeof($(this).closest('.nav-form').attr('id'))=='undefined'){
						controlPlaneID = 'default';
					}else{
						controlPlaneID = $(this).closest('.nav-form').attr('id');
					}
					var functionID = Number($(this).attr('fid'));
					var btnHandler = nsNav.btnHandler[controlPlaneID][functionID];
					var isReturn = $(this).attr('isReturn')=='true'?true:false;
					if(isReturn){
						btnHandler(ev);
					}else{
						btnHandler();
					}
					
				});
			}
		}
	}
	for(var btnGroupIndex=0; btnGroupIndex<btnGroupArr.length;btnGroupIndex++){
		var childDom = $('.nav-form button.dropdown-toggle')[btnGroupIndex];
		var subBtnDom = $(childDom).nextAll();
		var controlPlaneID = 'default';
		$(subBtnDom).find('li').off('click');
		$(subBtnDom).find('li').on('click',function(ev){
			if(typeof($(this).closest('.nav-form').attr('id'))=='undefined'){
				controlPlaneID = 'default';
			}else{
				controlPlaneID = $(this).closest('.nav-form').attr('id');
			}
			var functionID = Number($(this).attr('fid'));
			if(isNaN(functionID)==false){
				var btnHandler = nsNav.btnGroupHandler[controlPlaneID][functionID];
				var isReturn = $(this).attr('isReturn')=='true'?true:false;
				if(isReturn){
					btnHandler(ev);
				}else{
					btnHandler();
				}
			}
		});
	}
}
/***************************************************************************************************
 * 控制面板管理  导航按钮组  老版本兼容留存
 * 
 * @returns
 */
var controlPlane = {};
controlPlane.formNavInit = function(navJson){
	nsNav.initBtns(navJson);
};

/***************************************************************************************************
 * formPlane 表单面板
 * formPlane.formInit 是初始化表单
 * formPlane.getFormJSON 获得表单JSON数组，格式是{id:value,id:value}
 * 
 * @returns
 */

var formPlane = {}
var nsForm = formPlane;
formPlane.data = {}; 
formPlane.rules = {};  //验证规则
formPlane.fillValid = {};
selectFormPlane.select = {};
formPlane.formInit = function(formJson,formContainer){
	selectFormPlane.select[formJson.id] = {};
	var validateArr = [];//需要验证的
	var btnHandlerArr = [];//按钮组件的事件
	var changeHandlerArr = [];//radio,checkbox组件的事件
	var dateFormatArr = [];//日期格式
	var dateTimeFormatArr = [];//日期时间格式
	var uploadHanlderJson = {};
	var radioTooltipJson = {};
	var typeaheadArr = [];
	var select2Arr = [];
	var textBtnArr = [];
	var treeSelectJson = {};
	var addSelectInputConfig = false; 	//是否有增查一体输入框
	var organizaSelectConfig = false;	//是否有组织架构输入框
	var personSelectJson = {};
	var isHavePopover = false;
	var isHaveTooltip = false;
	var selectDateJson = {};
	var daterangepickerJson = {};//日期区间组件
	var selectHandlerArr = [];
	var provSelectHandlerArr = [];//省市区联动
	var formHtml = "";
	for(var groupID = 0; groupID<formJson.form.length; groupID++){
		var groupHtml = '';
		for(var inputID = 0; inputID<formJson.form[groupID].length; inputID++){
			var inputHtml = "";
			if(typeof(formJson.form[groupID][inputID].id)!="undefined"){
				groupHtml += commonConfig.component(formJson.form[groupID][inputID], formJson.id, "form");
				if(formJson.form[groupID][inputID].type == 'person-select'){
					//人员选择器不能使用这个规则，独立处理
					if(formJson.form[groupID][inputID].rules){
						formJson.form[groupID][inputID].sRules = formJson.form[groupID][inputID].rules;
						delete formJson.form[groupID][inputID].rules;
					}
				}
				validateArr.push(formJson.form[groupID][inputID]);
				//按钮事件
				if(typeof(formJson.form[groupID][inputID].btnhandler)!='undefined'){
					btnHandlerArr.push(formJson.form[groupID][inputID]);
				}

				if(formJson.form[groupID][inputID].type == 'radio'){
					radioTooltipJson[formJson.form[groupID][inputID].id] = formJson.form[groupID][inputID];
				}
				//下拉框文本组件
				if(formJson.form[groupID][inputID].type == 'selectDate'){
					selectDateJson[formJson.form[groupID][inputID].id] = formJson.form[groupID][inputID];
				}
				//日期区间
				if(formJson.form[groupID][inputID].type == 'daterangepicker'){
					daterangepickerJson[formJson.form[groupID][inputID].id] = formJson.form[groupID][inputID];
				}
				if(formJson.form[groupID][inputID].type == 'typeahead'){
					typeaheadArr.push(formJson.form[groupID][inputID]);
				}
				//select
				if(formJson.form[groupID][inputID].type == 'select'){
					var tempID = formJson.form[groupID][inputID].id;
					var selJson = selectFormPlane.select[formJson.id];
					for(var s in selJson){
						if(s == tempID){
							formJson.form[groupID][inputID].subdata = selJson[s];
						}
					}
					selectHandlerArr.push(formJson.form[groupID][inputID]);
				}
				if(formJson.form[groupID][inputID].type == 'tree-select'){
					treeSelectJson[formJson.form[groupID][inputID].id] = formJson.form[groupID][inputID];
				}
				if(formJson.form[groupID][inputID].type == 'select2'){
					select2Arr.push(formJson.form[groupID][inputID]);
				}
				if(typeof(formJson.form[groupID][inputID].changeHandler)!='undefined'){
					//非text-btn类型的组件有函数，集中处理，以change为标准
					changeHandlerArr.push(formJson.form[groupID][inputID]);
				}
				if(formJson.form[groupID][inputID].type == 'text-btn'){
					textBtnArr.push(formJson.form[groupID][inputID]);
				}
				if(formJson.form[groupID][inputID].type == 'date' && !formJson.form[groupID][inputID].readonly){
					var currentFormat = {
						id:formJson.form[groupID][inputID].id,
						format:formJson.form[groupID][inputID].format,
						changeHandler:formJson.form[groupID][inputID].changeHandler
					};
					dateFormatArr.push(currentFormat);
				}
				if(formJson.form[groupID][inputID].type == 'upload' && !formJson.form[groupID][inputID].readonly){
					uploadHanlderJson[formJson.form[groupID][inputID].id] = formJson.form[groupID][inputID];
				}
				if(formJson.form[groupID][inputID].type == 'person-select'){
					personSelectJson[formJson.form[groupID][inputID].id] = formJson.form[groupID][inputID];
				}
				if(formJson.form[groupID][inputID].type == 'add-select-input'){
					if(addSelectInputConfig==false){
						addSelectInputConfig = formJson.form[groupID][inputID];
						isHaveTooltip = true;
					}else{
						nsAlert('增查一体输入框只能有一个','error');
					}
				}
				if(formJson.form[groupID][inputID].type == 'organiza-select'){
					if(organizaSelectConfig==false){
						organizaSelectConfig = formJson.form[groupID][inputID];
					}else{
						nsAlert('组织树结构只能有一个','error');
					}
				}
				if(formJson.form[groupID][inputID].type == 'datetime'){
					dateTimeFormatArr.push(formJson.form[groupID][inputID]);
				}
				if(formJson.form[groupID][inputID].type == 'province-select'){
					provSelectHandlerArr.push(formJson.form[groupID][inputID]);
				}
			}else{
				if(typeof(formJson.form[groupID][inputID].html)!="undefined"){
					groupHtml += formJson.form[groupID][inputID].html;				
				}else if(typeof(formJson.form[groupID][inputID].note)!="undefined"){
					//注释类型
					groupHtml += '<blockquote>'
									+'<p>'+formJson.form[groupID][inputID].note+'</p>'
								+'</blockquote>'
				}else if(typeof(formJson.form[groupID][inputID].element)!="undefined"){
					//预先定义的element元素
					if(formJson.form[groupID][inputID].element=="hr"){
						//横线
						groupHtml += '<div class="col-xs-12 element-hr"><hr></div><div class="clearfix"></div>';
					}else if(formJson.form[groupID][inputID].element=="label"){
						//组标签
						var elementLableTitle = '';
						var elementLableHide = '';
						if(formJson.form[groupID][inputID].label){
							elementLableTitle = formJson.form[groupID][inputID].label;
							elementLableHide = '';
						}else{
							//未定义lable
							elementLableTitle = '';
							elementLableHide = 'hide';
						}
						var labelHeight = '';
						var labelWeight = '';
						if(typeof(formJson.form[groupID][inputID].height) == 'string'){
							if(formJson.form[groupID][inputID].height.indexOf('px')>-1){
								labelHeight = 'height: '+formJson.form[groupID][inputID].height+';';
							}else if(formJson.form[groupID][inputID].height.indexOf('%')>-1){
								labelHeight = 'height: '+formJson.form[groupID][inputID].height+';';
							}else{
								labelHeight = 'height: '+formJson.form[groupID][inputID].height+'px;';
							}
						}else if(typeof(formJson.form[groupID][inputID].height) == 'number'){
							labelHeight = 'height: '+formJson.form[groupID][inputID].height+'px;';
						}
						if(typeof(formJson.form[groupID][inputID].width) == 'string'){
							if(formJson.form[groupID][inputID].width.indexOf('px')>-1){
								labelWeight = 'width: '+formJson.form[groupID][inputID].width+';';
							}else if(formJson.form[groupID][inputID].width.indexOf('%')>-1){
								labelWeight = 'width: '+formJson.form[groupID][inputID].width+';';
							}else{
								labelWeight = 'width: '+formJson.form[groupID][inputID].width+'px;';
							}
						}else if(typeof(formJson.form[groupID][inputID].width) == 'number'){
							labelWeight = 'width: '+formJson.form[groupID][inputID].width+'px;';
						}
						var labelStyleStr = 'style="'+labelHeight+''+labelWeight+'"';
						groupHtml += '<label class="grouplable '+elementLableHide+'" '+labelStyleStr+'>'+elementLableTitle+'</label>'
					}else if(formJson.form[groupID][inputID].element=="br"){
						//回车
						groupHtml += '<div class="col-xs-12 element-br"></div><div class="clearfix"></div>';
					}else if(formJson.form[groupID][inputID].element=="title"){
						//标题
						groupHtml += '<div class="col-xs-12 element-title"><label>'
							+'<i class="fa fa-arrow-circle-down"></i> '
							+formJson.form[groupID][inputID].label
						+'</label></div>';
					}
				}
			}
		}
		var groupCls = "row row-close";
		var groupHrHtml = '<div class="col-xs-12 element-space"></div>';
		if(typeof(formJson.format)!="undefined"){
			if(formJson.format=='standard'){
				groupCls = "row row-close";
				groupHrHtml = '<div class="col-xs-12 element-space"></div>';
			}else if(formJson.format=='close'){
				groupCls = "row row-close";
				groupHrHtml = '';
			}else if(formJson.format=='noline'){
				groupCls = "row";
				groupHrHtml = '';
			}
		}
		if(typeof(formJson.fillbg)!="undefined"){
			if(formJson.fillbg==true){
				groupCls += ' fillbg';
			}
		}
		if(groupID==(formJson.form.length-1)){
			groupHrHtml = '';
		}
		groupHtml = '<div class="'+groupCls+'">'+groupHtml+groupHrHtml+'</div>';
		formHtml +=groupHtml;
	}
	var sizeCls = '';
	var width = '';
	if(typeof(formJson.size)=="undefined"||formJson.size=="fullwidth"){
		//
	}else if(formJson.size=="standard"){
		sizeCls = ' '+formJson.size;
	}else{
		width = ' style="max-width: '+formJson.width+';"';
	}

	var panelHtml = '';
	if(formContainer){
		panelHtml = 
			'<form role="form" class="clearfix panel-form '+sizeCls+'"  id="form-'+formJson.id+'" method="get" action="" '+width+'>'
				+formHtml
			+'</form>'
	}else{
		panelHtml=
			'<div class="panel panel-default panel-form">'
				+'<div class="panel-body">'
					+'<form role="form" class="clearfix '+sizeCls+'"  id="form-'+formJson.id+'" method="get" action="" '+width+'>'
						+formHtml
					+'</form>'
				+'</div>'
			+'</div>';
	}

	if($("#"+formJson.id).length<1){
		nsalert("无法在页面上找到Form对象，请检查HTML和JSON中的id命名是否统一");
	}else if($("#"+formJson.id).length>1){
		nsalert("HTML中的from出现了ID重复,无法填充");
	}else{
		if(formContainer){
			$("#"+formJson.id+" "+formContainer).html(panelHtml);
		}else{
			$("#"+formJson.id).html(panelHtml);
		}
		
	}
	$('#form-'+formJson.id).on('keydown',function(event){
		if(event.keyCode == 13){
			return false;
		}
	})
	//是否有验证的对象
	if(validateArr.length>0){
		formPlane.validateForm(formJson.id,validateArr);
	}
	//
	if(!$.isEmptyObject(radioTooltipJson)){
		formPlane.radioTooltipPlane(formJson.id,radioTooltipJson);
	}
	//是否有日期类型
	if(dateFormatArr.length>0){
		formPlane.componentDate(formJson.id,dateFormatArr);
	}
	//日期时间类型
	if(dateTimeFormatArr.length>0){
		formPlane.componentDatetime(formJson.id,dateTimeFormatArr);
	}
	//是否有上传类型
	if(!$.isEmptyObject(uploadHanlderJson)){
		formPlane.componentUpload(formJson.id,uploadHanlderJson);
	}
	if(typeaheadArr.length>0){
		formPlane.componentTypeahead(formJson.id,typeaheadArr);
	}
	//tree-select类型
	if(!$.isEmptyObject(treeSelectJson)){
		treeUI.componentSelectPlane(formJson.id,treeSelectJson);
	}
	//person-select类型
	if(!$.isEmptyObject(personSelectJson)){
		personUI.componentPersonPlane(formJson.id,personSelectJson);
	}

	//初始化select组件
	$('.form-item.select select').selectBoxIt().on('open', function(){
		$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
	});

	$('.form-item.selectplane select').selectBoxIt().on('open',function(){
		$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
	})

	if(select2Arr.length>0){
		formPlane.componentSelect2(formJson.id,select2Arr);
	}

	if(textBtnArr.length > 0 ){
		formPlane.componentTextBtnHandler(formJson.id,textBtnArr);
	}
	//如果有增查一体输入框
	if(addSelectInputConfig!=false){
		nsUI.addSearchInput.init(formJson, addSelectInputConfig)
	}
	//如果有组织架构树
	if(organizaSelectConfig!=false){
		organizaSelectConfig.fullID = 'form-'+formJson.id+'-'+organizaSelectConfig.id;
		nsUI.organizaSelect.init(organizaSelectConfig);
	}
	//tooltip
	if(isHaveTooltip){
		//$('#form-'+formJson.id+' [data-toggle="tooltip"]').tooltip();
	}
	//激活popover
	if(isHavePopover){
		$('#form-'+formJson.id+' [data-toggle="popover"]').popover();
	}
	
	//给带按钮组件的按钮添加事件
	for(var textbtnI = 0; textbtnI<btnHandlerArr.length; textbtnI++){
		var clickInputID = '#form-'+formJson.id+'-'+btnHandlerArr[textbtnI].id;
		$(clickInputID).closest('.input-group').find('.btn').off('click');
		$(clickInputID).closest('.input-group').find('.btn').on('click',function(ev){
			var clickFormID = $(ev.target).closest('form').attr('id');
			var clickInputID = $(ev.target).closest('.input-group').find('input').attr('id');
			clickInputID = clickInputID.substr(clickFormID.length+1, clickInputID.length);
			clickFormID = clickFormID.substr(5,clickFormID.length);
			var btnClickHandler = formPlane.data[clickFormID].formInput[clickInputID].btnhandler;
			btnClickHandler();
		});
	}
	if(changeHandlerArr.length > 0){
		formPlane.componentHandler(formJson.id,changeHandlerArr);
	}
	if(selectHandlerArr.length > 0){
		formPlane.validateSelectPlane(formJson.id,selectHandlerArr);
	}
	if(!$.isEmptyObject(selectDateJson)){
		formPlane.selectDatePlane(formJson.id,selectDateJson);
	}
	if(!$.isEmptyObject(daterangepickerJson)){
		formPlane.daterangepickerPlane(formJson.id,daterangepickerJson);
	}
	if(provSelectHandlerArr.length > 0){
		provinceSelect.init(formJson.id,provSelectHandlerArr);
	}
	formPlane.selectMorePlane(formJson.id);
}
formPlane.init = formPlane.formInit;

formPlane.uploadTable = function(uploadJson){
	var tableArr = [];
	tableArr.push(uploadJson);
	popupBox.initTable(tableArr);
	formPlane.commonUpload(uploadJson);
}
formPlane.commonUpload = function(uploadJson){	
	var i = 1;
	var btnI = 0;
	$example_dropzone_filetable = $('#'+uploadJson.id);
	formPlane.dropzoneGetFile = {};
	formPlane.dropzoneGetFile['advancedDropzone'] = {};
	formPlane.dropzoneFile = {};
	formPlane.dropzoneFile['advancedDropzone'] = {};
	var uploadMaxFileLength = uploadJson.isAllowFiles ? Number(uploadJson.isAllowFiles):1;
	example_dropzone = $("#advancedDropzone").dropzone({
		url: uploadJson.uploadsrc,
		maxFiles:uploadMaxFileLength,
		dictMaxFilesExceeded:'您一次最多只能上传{{maxFiles}}个文件',
		addRemoveLinks:true,//添加移除文件
		dictInvalidFileType:'不支持上传的格式',
		dictResponseError:'文件上传失败',
		dictInvalidFileType:'文件名和类型不匹配',
		autoProcessQueue:true,//不自动上传
		init:function(){
			var dropzoneObj = this;
			formPlane.dropzoneFile['advancedDropzone'] = dropzoneObj;
		},
		addedfile: function(file)
		{
			if(i == 1)
			{
				$example_dropzone_filetable.find('tbody').html('');
			}
			
			var size = parseInt(file.size/1024, 10);
			size = size < 1024 ? (size + " KB") : (parseInt(size/1024, 10) + " MB");
			var	$el = $('<tr>\
							<th class="text-center">'+(i++)+'</th>\
							<td>'+file.name+'</td>\
							<td><div class="progress progress-striped"><div class="progress-bar progress-bar-warning"></div></div></td>\
							<td>'+size+'</td>\
							<td>Uploading...</td>\
						</tr>');
			
			$example_dropzone_filetable.find('tbody').append($el);
			file.fileEntryTd = $el;
			file.progressBar = $el.find('.progress-bar');
		},
		//一个文件被移除时发生
		removedfile:function(file){
			btnI--;
			if(btnI<0){
				btnI = 0;
				formPlane.dropzoneGetFile['advancedDropzone'] = {};
			}
		},
		uploadprogress: function(file, progress, bytesSent)
		{
			file.progressBar.width(progress + '%');
		},
		
		success: function(file,data)
		{
			file.fileEntryTd.find('td:last').html('<span class="text-success">上传成功</span>');
			file.progressBar.removeClass('progress-bar-warning').addClass('progress-bar-success');
			var btnHtml = '<td class="td-button">'
							+'<button type="button" class="btn btn-warning  btn-icon" fid="'+btnI+'" nstype="file-upload">'
								+'<i class="fa-trash"></i>'
							+'</button>'
						+'</td>';
			file.fileEntryTd.find('td:last').after(btnHtml);
			if(typeof(uploadJson.changeHandler)!='undefined'){
				var uploadFunc = uploadJson.changeHandler;
				uploadFunc(data,file);
			}
			formPlane.dropzoneGetFile['advancedDropzone'][btnI] = file;
			btnI++;
			file.fileEntryTd.find('button[nstype="file-upload"]').on('click',function(){
				var delFid = $(this).attr('fid');
				var removeFile = formPlane.dropzoneGetFile['advancedDropzone'][delFid];
				if(removeFile){
					formPlane.dropzoneFile['advancedDropzone'].removeFile(removeFile);
				}
			});
		},
		
		error: function(file,errorMessage)
		{
			file.fileEntryTd.find('td:last').closest('tr').remove();
			this.removeFile(file);
			//file.fileEntryTd.find('td:last').html('<span class="text-danger">失败</span>');
			//file.progressBar.removeClass('progress-bar-warning').addClass('progress-bar-red');
			nsalert(errorMessage);
		}
	});
	$("#advancedDropzone").css({
		minHeight: 200
	});
}
formPlane.disabledDropzone = function(formID,elementID){
	$('#form-'+formID+'-'+elementID).parent().toggleClass('upload-disabled');
}
//多文件上传
formPlane.moreUpload = function(isBoolean){
	var isDropzone = typeof(isBoolean) == 'boolean' ? isBoolean : true;
	if(!isDropzone){
		$('#advancedDropzone').parent().addClass('upload-disabled');
	}else{
		$('#advancedDropzone').parent().removeClass('upload-disabled');
	}
}
formPlane.radioTooltipPlane = function(formID,radioTooltipJson){
	for(var radioT in radioTooltipJson){
		var radioTooltip = radioTooltipJson[radioT].isTooltip ?radioTooltipJson[radioT].isTooltip:false;
		if(radioTooltip){
			var radioTooltipID = 'form-'+formID+'-'+radioT;
			$('input[name="'+radioTooltipID+'"]').closest('label').tooltip();
		}
	}
}

//日期区间
formPlane.daterangepickerPlane = function(formID,daterangepickerJson){
	var $daterangepickerDom = {};
	for(var rangeI in daterangepickerJson){
		var rangepickerID = 'form-'+formID+'-'+rangeI;
		var daterangeOpts = {};
		daterangeOpts = {
			format:'YYYY-MM-DD',
			separator:'至',
			applyClass : 'btn-sm btn-success',
			cancelClass : 'btn-sm btn-default',
			locale: {
				applyLabel: '确定',
				cancelLabel: '取消',
				fromLabel: '开始时间',
				toLabel:'结束时间',
				monthNames:["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
				daysOfWeek:["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
			},
		}
		$daterangepickerDom[rangeI] = $('#'+rangepickerID).daterangepicker(daterangeOpts);
	}
}
formPlane.selectMorePlane = function(formID){
	$('#form-'+formID+' [commonplane="moreSelectPlane"] button').on('click',function(ev){
		var btnFid = Number($(this).attr('fid'));
		var formID = $(ev.target).closest('form').attr('id');
		var planeID = $(ev.target).closest('.form-item').attr('ns-id');
		var $elementParentDom = $(ev.target).closest('.form-td');
		formID = formID.substr(5,formID.length);
		var returnFunc = formPlane.data[formID].formInput[planeID].button[btnFid].handler;
		if(returnFunc){
			returnFunc(planeID,$elementParentDom);
		}
	})
} 

//下拉框文本组件
formPlane.selectDatePlane = function(formID,selectDateJson){
	var $selectDateSelectDom = $('select[nstype="selectDate-caseSelect"]');
	$selectDateSelectDom.selectBoxIt().on('change',function(ev){
		var selectID = $(this).attr('id');
		var selectValue = $(this).val().trim();
		var selectText = $(this).find('option:selected').text().trim();
		var formID = $(ev.target).closest('form').attr('id');
		selectID = selectID.substr(formID.length+1,selectID.length);
		formID = formID.substr(5,formID.length);
		var returnID = $(ev.target).closest('.form-item').attr('ns-id');
		var returnFunc = formPlane.data[formID].formInput[returnID].caseSelect.changeHandler;
		if(returnFunc){
			var selectFunc = returnFunc(returnID);
			selectFunc(selectValue,selectText);
		}
	});
	$('input[nstype="selectDate-date"]').datepicker({
		format:'yyyy-mm-dd',
		autoclose:true,
		todayHighlight:true,
	});
	var daterangeOpts = {};
	daterangeOpts = {
		format:'YYYY-MM-DD',
		separator:'至',
		applyClass : 'btn-sm btn-success',
        cancelClass : 'btn-sm btn-default',
		locale: {
			applyLabel: '确定',
			cancelLabel: '取消',
			fromLabel: '开始时间',
			toLabel:'结束时间',
			monthNames:["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
			daysOfWeek:["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
		},
	}
	var $daterangepickerDom = $('div[nstype="selectDate-daterange"]');
	$daterangepickerDom.daterangepicker(daterangeOpts,function(start,end,label){
		var daterangevalue = start.format('YYYY-MM-DD')+'至'+end.format('YYYY-MM-DD');
		$daterangepickerDom.children('span').text(daterangevalue);
	});
	$daterangepickerDom.on('apply.daterangepicker',function(ev,picker){
		var startRange = picker.startDate.format('YYYY-MM-DD');
 		endRange = picker.endDate.format('YYYY-MM-DD');
 		var daterangevalue = startRange + '至' + endRange;
 		$daterangepickerDom.children('span').text(daterangevalue);
	});
}

formPlane.validateForm = function(formID,validateArr,formType){
	//保存Form对象基本数据
	var formDataID = formID;
	var formInput = {};
	var addRulesArr = [];
	for(var formInputI = 0; formInputI<validateArr.length; formInputI++){
		var formInputID = formDataID+'-'+validateArr[formInputI].id;
		formInputID = formInputID.substr(formDataID.length+1,formInputID.length);
		if(validateArr[formInputI].type == 'selectText' || validateArr[formInputI].type == 'textSelect'){
			//下拉框文本
			var inputID = validateArr[formInputI].text.id;
			var selectID = validateArr[formInputI].select.id;
			var inputJson = validateArr[formInputI].text;
			var selectJson = validateArr[formInputI].select;
			addRulesArr.push(inputJson,selectJson);
		}else if(validateArr[formInputI].type == 'selectDate'){
			//下拉框日期
			var caseSelectJson = validateArr[formInputI].caseSelect;
			var textJson = validateArr[formInputI].text;
			var dateJson = validateArr[formInputI].date;
			dateJson.id = dateJson.id;
			var daterangeJson = validateArr[formInputI].daterange;
			daterangeJson.id = daterangeJson.id;
			addRulesArr.push(caseSelectJson,textJson,dateJson,daterangeJson);
		}else if(validateArr[formInputI].type == 'selectSelect'){
			//下拉框下拉框
			var firstSelectJson = validateArr[formInputI].firstSelect;
			var secondSelectJson = validateArr[formInputI].secondSelect;
			addRulesArr.push(firstSelectJson,secondSelectJson);
		}else if(validateArr[formInputI].type == 'datetime'){
			//日期时间
			var requiredStr = '';
			if(validateArr[formInputI].rules){
				requiredStr = 'required';
			}
			var dateJson = {};
			dateJson.id = formInputID + '-date';
			dateJson.type = 'text';
			dateJson.rules = requiredStr;
			//formInput[dateJson.id] = dateJson;
			addRulesArr.push(dateJson);

			var timeJson = {};
			timeJson.id = formInputID + '-time';
			timeJson.type = 'text';
			timeJson.rules = requiredStr;
			//formInput[timeJson.id] = timeJson;
			addRulesArr.push(timeJson);
		}
		var formInputValue = validateArr[formInputI];
		formInput[formInputID] = formInputValue;
	}
	//保存form类型 默认为form
	var typeStr = 'form'
	if(typeof(formType)=='string'){
		if(formType == 'dialog' || formType == 'form'){
			typeStr = formType;
		}else{
			nsAlert('表格类型定义错误','error');
		}
	}
	formPlane.data[formDataID] = {id:formDataID,formInput:formInput, formType:typeStr};
	//添加验证规则
	var validateRulesArr = $.merge(validateArr,addRulesArr);
	var rules = commonConfig.getRules(validateRulesArr,formDataID);
	var validateObj = $("#form-"+formDataID).validate(rules);
	formPlane.rules[formDataID] = rules.rules; //验证规则
}
formPlane.validateSelectPlane = function(formID,selectArr){
	for(var selectI = 0; selectI < selectArr.length; selectI++){
		var selectID = 'form-'+formID+'-'+selectArr[selectI].id;
		$('#'+selectID).selectBoxIt().on('close',function(ev){
			var formID = $(ev.target).closest('form').attr('id');
			var selectID = $(ev.target).closest('select').attr('id');

			var changeSelectID = selectID.substr(formID.length+1, selectID.length);
			var changeFormID = formID.substr(5,formID.length);
			var changeHandler = formPlane.data[changeFormID].formInput[changeSelectID].changeHandler;
			var returnValue = $(ev.target).closest('select').val().trim();
			var returnText = $(ev.target).find('option:selected').text().trim();
			
			var SelectBoxItTextID = selectID+'SelectBoxItText';
			$('#'+SelectBoxItTextID).attr('data-val',returnValue);
			$('#'+SelectBoxItTextID).text(returnText);
			if(formPlane.data[changeFormID].formInput[changeSelectID].rules){
				if(formPlane.data[changeFormID].formInput[changeSelectID].rules.indexOf('select')>-1){
					if(returnValue){
						formPlane.fillValid[changeFormID][selectID] = true;
						$(ev.target).closest('div').find('.has-error').remove();
					}else{
						formPlane.fillValid[changeFormID][selectID] = false;
					}
				}
			}
			if(changeHandler){
				changeHandler(returnValue,returnText);
			}
		});
	}
	/*$('#form-'+formID+' .form-item.select select').selectBoxIt().on('close',function(ev){
		
	})*/
}
formPlane.init = formPlane.formInit;
//清空操作
formPlane.clearData = function(formID){
	var newFormID = 'form-'+formID;
	var formData = formPlane.data[formID].formInput;
	for(var inputID in formData){
		var currentKeyID = newFormID + '-' + inputID;
		var currentType = formData[inputID].type;
		switch(currentType){
			case "select":
				var id = "";
				var value = "";
				if(formData[inputID].rules){
					value = "必填";
				}else{
					value = "选填";
				}
				var textField = formData[inputID].textField;
				var valueField = formData[inputID].valueField;
				var defaultSelected = formData[inputID].value; 
				var selectElementID = currentKeyID + 'SelectBoxItText';
				$('#'+currentKeyID).val(id);
				$('#'+currentKeyID).closest('div').find('#'+selectElementID).text(value);
				$('#'+currentKeyID).closest('div').find('#'+selectElementID).attr('data-val',id);
				break;
			case "selectText":
				$('#'+currentKeyID+'CompareType').val('');
				var selectElementID = currentKeyID + 'CompareTypeSelectBoxItText';
				$('#'+currentKeyID+'CompareType').closest('div').find('#'+selectElementID).text("选填");
				$('#'+currentKeyID+'CompareType').closest('div').find('#'+selectElementID).attr('data-val','');
				$('#'+currentKeyID+'DefaultValue1').val('');
				break;
			case "selectSelect":
				$('#'+currentKeyID+'CompareType').val('');
				var selectElementID = currentKeyID + 'CompareTypeSelectBoxItText';
				$('#'+currentKeyID+'CompareType').closest('div').find('#'+selectElementID).text("选填");
				$('#'+currentKeyID+'CompareType').closest('div').find('#'+selectElementID).attr('data-val','');
				
				$('#'+currentKeyID+'DefaultValue1').val('');
				var selectElementID = currentKeyID + 'DefaultValue1SelectBoxItText';
				$('#'+currentKeyID+'DefaultValue1').closest('div').find('#'+selectElementID).text("选填");
				$('#'+currentKeyID+'DefaultValue1').closest('div').find('#'+selectElementID).attr('data-val','');
				
				break;
			case "selectDate":
				$('#'+currentKeyID+'CompareType').val('');
				var selectElementID = currentKeyID + 'CompareTypeSelectBoxItText';
				$('#'+currentKeyID+'CompareType').closest('div').find('#'+selectElementID).text("选填");
				$('#'+currentKeyID+'CompareType').closest('div').find('#'+selectElementID).attr('data-val','');
				$('#'+currentKeyID+'DefaultValue1Temp').val('');
				$('#'+currentKeyID+'DefaultValue1').val('');
				$('#'+currentKeyID+'DefaultValue2').val('');
				break;
			case "select2":
				$select2Change[currentKeyID].val('').trigger("change");
				break;
			case "datetime":
				$('#'+currentKeyID+'-date').val('');
				$('#'+currentKeyID+'-time').val('');
				break;
			case "radio":
			case "checkbox":
				$('input[name="'+currentKeyID+'"]').removeAttr('checked');
				break;
			case "upload":
				$('#'+currentKeyID).html('');
				var uploadFile = formPlane.dropzoneGetFile[inputID];
				var $uploadFileDom = formPlane.dropzoneFileJson[inputID];
				if(!$.isEmptyObject(uploadFile)){
					for(var fileI in uploadFile){
						$uploadFileDom.removeFile(uploadFile[fileI]);
					}
				}
				break;
			case "tree-select":
				$('#'+currentKeyID).val('');
				$('#'+currentKeyID).attr('value','');
				$('#'+currentKeyID).attr('nodeid','');
				break;
			default:
				$('#'+currentKeyID).val('');
				break;
		}
	}
}
//重置操作
formPlane.resetData = function(formID){
	var newFormID = 'form-'+formID;
	var formData = formPlane.data[formID].formInput;
	for(var inputID in formData){
		var currentKeyID = newFormID + '-' + inputID;
		if(formData[inputID].type == 'select'){
			var id = "";
			var value = "";
			if(formData[inputID].rules){
				value = "必填";
			}else{
				value = "选填";
			}
			var textField = formData[inputID].textField;
			var valueField = formData[inputID].valueField;
			var defaultSelected = formData[inputID].value; 
			var subdata = formData[inputID].subdata;
			for(var selectI in subdata){
				var textSelect = 'text';
				if(typeof(textField)=='undefined'){
					textSelect = 'text';
				}else{
					textSelect = textField;
				}
				var valueSelect = 'id';
				if(typeof(valueField)=='undefined'){
					valueSelect = 'id';
				}else{
					valueSelect = valueField;
				}
				if(subdata[selectI].selected){
					id = subdata[selectI][valueSelect];
					value = subdata[selectI][textSelect];
				}else if(typeof(defaultSelected)!='undefined'){
					if(subdata[selectI][valueSelect] == defaultSelected){
						id = subdata[selectI][valueSelect];
						value = subdata[selectI][textSelect];
					}
				}
			}
			var selectElementID = currentKeyID + 'SelectBoxItText';
			$('#'+currentKeyID).val(id);
			$('#'+currentKeyID).closest('div').find('#'+selectElementID).text(value);
			$('#'+currentKeyID).closest('div').find('#'+selectElementID).attr('data-val',id);
		}else if(formData[inputID].type == 'radio' || formData[inputID].type == 'checkbox'){
			$('input[name="'+currentKeyID+'"]').removeAttr('checked');
		}else{
			if(typeof(formData[inputID].value)!='undefined'){
				$('#'+currentKeyID).val(formData[inputID].value);
			}else{
				$('#'+currentKeyID).val('');
			}
		}
	}
}
formPlane.dropzoneFileJson = {};//存放的是当前上传文件的dom,在清空form表单的时候会用到
formPlane.dropzoneGetFile = {};//存放的是当前上传文件的file,清空删除文件都会用到，一个文件可以上传多个，所以存放每个下标和file对应值
formPlane.tempFileJson = {};//存放的是文件数量
formPlane.dropzoneStr = {};//一个表单支持多个上传组件，{'upload1':[],'upload2':[]} 
formPlane.componentUpload = function(formID,uploadHanlderJson){
	var tempFormID = 'form-'+formID;
	for(var fileIndex in uploadHanlderJson){
		formPlane.dropzoneFileJson[fileIndex] = {};
		formPlane.dropzoneGetFile[fileIndex] = {};
		formPlane.dropzoneStr[fileIndex] = [];
		var tempFileID = tempFormID + '-' + fileIndex;
		var currentFileID = fileIndex;
		var acceptedFiles = typeof(uploadHanlderJson[currentFileID].supportFormat) == 'undefined' ? "":uploadHanlderJson[currentFileID].supportFormat;
		var uploadMultiple = typeof(uploadHanlderJson[currentFileID].ismultiple) == 'undefined' ? false:uploadHanlderJson[currentFileID].ismultiple;
		var maxFiles = typeof(uploadHanlderJson[currentFileID].isAllowFiles) == 'undefined' ? 1:uploadHanlderJson[currentFileID].isAllowFiles;
		var defaultFilesLength = 0;
		if($.isArray(uploadHanlderJson[currentFileID].subdata)){
			var dropArr = uploadHanlderJson[currentFileID].subdata;
			defaultFilesLength = dropArr.length;
			//是否定义了valueField字段
			var uploadIdField = '';
			if(typeof(uploadHanlderJson[currentFileID].valueField)=='string'){
				if(uploadHanlderJson[currentFileID].valueField !== ''){
					uploadIdField = uploadHanlderJson[currentFileID].valueField;
				}
			} 
			for(var dropI=0; dropI<dropArr.length; dropI++){
				if(uploadIdField !== ''){
					formPlane.dropzoneStr[fileIndex].push(dropArr[dropI][uploadIdField]);
				}
			}
		}
		var fileI = 0;//初始化文件个数
		formPlane.tempFileJson[fileIndex] = defaultFilesLength;
		//判断是否含有只读属性
		var isReadonly = typeof(uploadHanlderJson[currentFileID].readonly) == 'boolean' ?uploadHanlderJson[currentFileID].readonly:false;
		if(isReadonly){
			//只读属性为真，则只可以进行下载不能上传和删除
			var downloadJson = {id:tempFileID,handler:uploadHanlderJson[currentFileID].downloadHandler}
			formPlane.dropzoneDownloadHandler(downloadJson);
		}else{		
			$('#'+tempFileID).dropzone({
				url: uploadHanlderJson[currentFileID].uploadSrc,
				paramName:tempFileID,
				acceptedFiles:acceptedFiles,
				uploadMultiple:uploadMultiple,	
				maxFiles:maxFiles,
				dictDefaultMessage:'选择上传',
				dictMaxFilesExceeded:'您一次最多只能上传{{maxFiles}}个文件',
				addRemoveLinks:true,//添加移除文件
				dictInvalidFileType:'不支持上传的格式',
				dictResponseError:'文件上传失败',
				dictInvalidFileType:'文件名和类型不匹配',
				autoProcessQueue:true,//不自动上传
				accept:function(file,done){
					var fileID = $(this.element).attr('id');
					var changeFormID = $('#'+fileID).closest('form').attr('id');
					var currentFileID = fileID.substr(changeFormID.length+1, fileID.length);
					var maxFilesLength = uploadHanlderJson[currentFileID].isAllowFiles;
					var tempFileLength = formPlane.tempFileJson[currentFileID];
					if(maxFilesLength == tempFileLength){
						done('您一次最多只能上传'+maxFilesLength+'个文件');
					}else{
						done();
					}
				},
				init:function(){
					var dropzoneObj = this;
					var filename = $(this.element).attr('id');
					var changeFormID = $('#'+filename).closest('form').attr('id');
					var currentFileID = filename.substr(changeFormID.length+1, filename.length);
					var returnObj = {};
					returnObj[filename] = {};
					returnObj[filename]['downloadhandler'] = uploadHanlderJson[currentFileID]['downloadHandler'];
					returnObj[filename]['delFileHandler'] = uploadHanlderJson[currentFileID]['delFileHandler'];					
					if(typeof(uploadHanlderJson[currentFileID].subdata)!='undefined'){
						formPlane.dropzoneHandler(dropzoneObj,returnObj);
					}
					formPlane.dropzoneFileJson[fileIndex] = dropzoneObj;
				},
				//添加了一个文件时发生
				addedfile:function(file){
					var fileID = $(this.element).attr('id');
					var size = parseInt(file.size/1024, 10);
					size = size < 1024 ? (size + " KB") : (parseInt(size/1024, 10) + " MB");
				},
				//一个文件被移除时发生上传时按一定间隔发生这个事件。
				//第二个参数为一个整数，表示进度，从 0 到 100。
				//第三个参数是一个整数，表示发送到服务器的字节数。
				//当一个上传结束时，Dropzone 保证会把进度设为 100。
				//注意：这个函数可能被以同一个进度调用多次。
				/*uploadprogress: function(file, progress, bytesSent)
				{
					console.log('progress');
				},*/
				//一个文件被移除时发生
				removedfile:function(file){
					var filename = $(this.element).attr('id');
					var changeFormID = $('#'+filename).closest('form').attr('id');
					var uploadFormID = changeFormID.substr(5,changeFormID.length);
					var currentFileID = filename.substr(changeFormID.length+1, filename.length);
					if(uploadHanlderJson[currentFileID].rules){
						if($('#'+filename).children('span').length > 0){
							formPlane.fillValid[uploadFormID][filename] = true;
						}else{
							formPlane.fillValid[uploadFormID][filename] = false;
						}
					}
					formPlane.tempFileJson[currentFileID] = $('#'+filename).children('span').length;
					if(formPlane.tempFileJson[currentFileID] == 0){
						formPlane.dropzoneGetFile[currentFileID] = {};
					}
				},
				//文件成功上传之后发生，第二个参数为服务器响应
				success: function(file,data)
				{
					var filename = $(this.element).attr('id');
					var changeFormID = $('#'+filename).closest('form').attr('id');
					var currentFileID = filename.substr(changeFormID.length+1, filename.length);
					var uploadFormID = changeFormID.substr(5,changeFormID.length);
					/*******验证开始start***************/
					formPlane.fillValid[uploadFormID][filename] = true;
					/*******验证结束end***************/

					var dropzoneObj = this;
					var receiveFileJson;
					/*******拿到返回值start***************/
					var returnObj = {};
					returnObj.data = data;
					returnObj.file = file;
					returnObj.fileInputId = currentFileID;
					if(typeof(uploadHanlderJson[currentFileID].changeHandler)!='undefined'){
						var uploadFunc = uploadHanlderJson[currentFileID].changeHandler;
						receiveFileJson = uploadFunc(returnObj);
					}
					/*******拿到返回值end***************/
					var loadfilevalue = '';//返回名称
					var loadFileID = '';//返回id
					if(typeof(receiveFileJson) == 'object'){
						var fileShowID = uploadHanlderJson[currentFileID]['valueField'];
						var fileShowvalueID = uploadHanlderJson[currentFileID]['textField'];
						loadFileID = receiveFileJson[fileShowID];
						loadfilevalue = receiveFileJson[fileShowvalueID];
					}else{
						//返回格式不对
					}
					if(loadFileID !== ''){formPlane.dropzoneStr[currentFileID].push(loadFileID)}//存放上传文件值
					var loadFileHtml = '<span class="dropzone-upload-span">'
									+'<a href="javascript:void(0)" id="'+loadFileID+'" ns-file="'+fileI+'" class="upload-close">'
									+'</a>'
									+'<a href="javascript:void(0)" id="'+loadFileID+'" class="upload-title">'
									+loadfilevalue+'</a>'
									+'</span>';
					$('#'+filename).append(loadFileHtml);
					formPlane.tempFileJson[currentFileID] = $('#'+filename).children('span').length;
					formPlane.dropzoneGetFile[currentFileID][fileI] = file;
					fileI++;
					var returnObj = {};
					returnObj[filename] = {};
					returnObj[filename]['downloadhandler'] = uploadHanlderJson[currentFileID]['downloadHandler'];
					returnObj[filename]['delFileHandler'] = uploadHanlderJson[currentFileID]['delFileHandler'];
					formPlane.dropzoneHandler(dropzoneObj,returnObj);
				},
				error: function(file,errorMessage)
				{
					nsAlert(errorMessage);
					var filename = $(this.element).attr('id');
					var changeFormID = $('#'+filename).closest('form').attr('id');
					var currentFileID = filename.substr(changeFormID.length+1, filename.length);
					if(typeof(uploadHanlderJson[currentFileID].errorHandler)!='undefined'){
						var uploadFunc = uploadHanlderJson[currentFileID].errorHandler;
						var returnObj = {};
						returnObj.file = file;
						returnObj.id = currentFileID;
						receiveFileJson = uploadFunc(returnObj);
					}	
					this.removeFile(file);
				}
			});
		}
	}
}
//只可以下载的方法
formPlane.dropzoneDownloadHandler = function(downloadJson){
	var fileID = downloadJson.id;
	var handler = downloadJson.handler;
	$('#'+fileID+' a.upload-title').off('click');
	$('#'+fileID+' a.upload-title').on('click',function(ev){
		var downloadID = $(this).attr('id');
		if(typeof(handler)=='function'){
			handler(downloadID);
		}
	})
}
//上传文件的删除方法
formPlane.dropzoneHandler = function(dropzoneObj,returnObj){
	var fileID = $(dropzoneObj.element).attr('id');
	$('#'+fileID+' a.upload-title').off('click');
	$('#'+fileID+' a.upload-title').on('click',function(ev){
		var downloadID = $(this).attr('id');
		if(typeof(returnObj[fileID]['downloadhandler'])!='undefined'){
			var downloadHandler = returnObj[fileID]['downloadhandler'];
			downloadHandler(downloadID);
		}
	})
	$('#'+fileID+' a.upload-close').off('click');
	$('#'+fileID+' a.upload-close').on('click',function(ev){
		$(this).closest('span').remove();
		var currID = $(this).attr('id');
		var delFid = $(this).attr('ns-file');
		var changeFormID = $('#'+fileID).closest('form').attr('id');
		var uploadFormID = changeFormID.substr(5,changeFormID.length);
		var currentFileID = fileID.substr(changeFormID.length+1, fileID.length);

		//删除文件判断是否在所要存储的数据当中
		var valueArr = formPlane.dropzoneStr[currentFileID];
		if($.isArray(valueArr)){
			for(var valueI=0; valueI<valueArr.length; valueI++){
				if(valueArr[valueI] == currID){
					valueArr.splice(valueI,1);
				}
			}
		}
		formPlane.dropzoneStr[currentFileID] = valueArr;
		var file = formPlane.dropzoneGetFile[currentFileID][delFid];
		if(file){
			dropzoneObj.removeFile(file);
		}else{
			var uploadRules = formPlane.data[uploadFormID].formInput[currentFileID].rules;
			if(uploadRules){
				if($('#'+fileID).children('span').length > 0){
					formPlane.fillValid[uploadFormID][fileID] = true;
				}else{
					formPlane.fillValid[uploadFormID][fileID] = false;
				}
			}
			formPlane.tempFileJson[currentFileID] = $('#'+fileID).children('span').length;
			if(formPlane.tempFileJson[currentFileID] == 0){
				formPlane.dropzoneGetFile[currentFileID] = {};
			}
		}
		if(typeof(returnObj[fileID]['delFileHandler'])!='undefined'){
			var removedFileHandler = returnObj[fileID]['delFileHandler'];
			removedFileHandler(currID);
		}
	})
}

var nsMultiSelect = {};
nsMultiSelect.Json = {};
nsMultiSelect.multiSelectInit = function(multiselectJson){
	var currentSelectJson = {};
	currentSelectJson.attribute = multiselectJson;
	var multiselectID = 'multi-'+multiselectJson.multiID;
	nsMultiSelect.Json[multiselectID] = {};
	var selectArr = [];
	if(typeof(multiselectJson.select)!='undefined'){
		selectArr = multiselectJson.select;
	}else{
		$.ajax({
			url:multiselectJson.url, //请求的数据链接
			type:multiselectJson.method,
			data:multiselectJson.data,
			async:false,
			success:function(rec){
				if(typeof(multiselectJson.dataSrc)=='undefined'){
					selectArr = rec;
				}else{
					for(d in rec){
						selectArr = rec[multiselectJson.dataSrc];
					}
				}
			},
			error: function () {
				nsalert('请检查数据格式是否合法','warning');
			}
		});
	}
	var selectOrder = multiselectJson.order;
	if(typeof(selectOrder)!='undefined'){
		selectArr = selectArr.sort(function(a,b){
			if(Number(a[selectOrder]) < Number(b[selectOrder])){return -1;}
			if(Number(a[selectOrder]) > Number(b[selectOrder])){return 1;}
			if(Number(a[selectOrder]) == Number(b[selectOrder])){return 0;}
		});
	}
	currentSelectJson.orderData = selectArr;
	nsMultiSelect.Json[multiselectID] = currentSelectJson;
	multiSelectHtml = nsMultiSelect.Data(multiselectID);
	if($("#"+multiselectJson.id).length<1){
		nsalert("无法在页面上找到multi对象，请检查HTML和JSON中的id命名是否统一");
	}else if($("#"+multiselectJson.id).length>1){
		nsalert("HTML中的multi出现了ID重复,无法填充");
	}else{
		$("#"+multiselectJson.id).html(multiSelectHtml);
	}
	nsMultiSelect.componentMulti(multiselectID);
}
nsMultiSelect.Data = function(multiID){
	var multiAttribute = nsMultiSelect.Json[multiID].attribute;
	var selectArr = nsMultiSelect.Json[multiID].orderData;
	var selectHtml = '';
	for(var select = 0 ; select < selectArr.length; select ++){
		var textField = '';
		var valueField = '';
		var labelField = '';
		var groupArrField = 'subdata';
		if(typeof(multiAttribute.labelField)=='undefined'){
			labelField = 'label';
		}else{
			labelField = multiAttribute.labelField;
		}
		if(typeof(multiAttribute.groupField)=='undefined'){
			groupArrField = 'subdata';
		}else{
			groupArrField = multiAttribute.groupField;
		}
		var groupArr = selectArr[select][groupArrField];
		if(typeof(groupArr) == 'undefined'){
			if(typeof(multiAttribute.textField)=='undefined'){
				textField = selectArr[select].text;
			}else{
				textField = selectArr[select][multiAttribute.textField];
			}
			if(typeof(multiAttribute.valueField)=='undefined'){
				valueField = selectArr[select].id;
			}else{
				valueField = selectArr[select][multiAttribute.valueField];
			}
			selectHtml += '<option value="'+valueField+'">'+textField+'</option>';
		}else{
			selectHtml += '<optgroup label="'+selectArr[select][labelField]+'">';
			for(var sub = 0; sub < groupArr.length; sub ++){
				if(typeof(multiAttribute.textField)=='undefined'){
					textField = groupArr[sub].text;
				}else{
					textField = groupArr[sub][multiAttribute.textField];
				}
				if(typeof(multiAttribute.valueField)=='undefined'){
					valueField = groupArr[sub].id;
				}else{
					valueField = groupArr[sub][multiAttribute.valueField];
				}
				selectHtml += '<option value="'+valueField+'">'+textField+'</option>';
			}
			selectHtml += '</optgroup>';
		}
	}
	multiSelectHtml = '<select name="'+multiID+'[]" id="'+multiID+'" class="form-control multi" multiple="multiple">'
					+selectHtml
					+'</select>';
	return multiSelectHtml;
}

/*********multiselect 初始化方法 start*************/
/**multiselectArrChange,multiSelectData*/
nsMultiSelect.componentMulti = function(multiselectID){
	var multiAttribute = nsMultiSelect.Json[multiselectID].attribute;
	var keepOrder = false;
	if(multiAttribute.keepOrder == true){
		keepOrder = true;
	}
	var selectableHeader = '';
	var selectionHeader = '';
	var selectableFooter = '';
	var selectionFooter = '';
	if(multiAttribute.headerType == 'text'){
		if(typeof(multiAttribute.selectableHeader)!='undefined'){
			selectableHeader = "<div class='custom-header'>"
							+multiAttribute.selectableHeader
							+"</div>";
		}
		if(typeof(multiAttribute.selectionHeader)!='undefined'){
			selectionHeader = "<div class='custom-header'>"
							+multiAttribute.selectionHeader
							+"</div>";
		}
		if(typeof(multiAttribute.selectableFooter)!='undefined'){
			selectableFooter = "<div class='custom-header'>"
							+multiAttribute.selectableFooter
							+"</div>";
		}
		if(typeof(multiAttribute.selectionFooter)!='undefined'){
			selectionFooter = "<div class='custom-header'>"
							+multiAttribute.selectionFooter
							+"</div>";
		}
	}else if(multiAttribute.headerType == 'search'){
		selectableHeader = "<input type='text' class='search-input form-control' autocomplete='off' placeholder='搜索...'>";
		selectionHeader = "<input type='text' class='search-input form-control' autocomplete='off' placeholder='搜索...'>";
	}
	var choseALLGroup = false;
	if(multiAttribute.choseALLGroup == true){
		choseALLGroup = true;
	}
	var selectID = 'multi-'+multiAttribute.multiID;
	$('#'+selectID).multiSelect({
		keepOrder:keepOrder,
		selectableHeader:selectableHeader,
		selectionHeader:selectionHeader,
		selectableFooter:selectableFooter,
		selectionFooter:selectionFooter,
		selectableOptgroup:choseALLGroup,
		cssClass:'selectMulti',
		afterInit: function()
		{
			// Add alternative scrollbar to list
			this.$selectableContainer.add(this.$selectionContainer).find('.ms-list').perfectScrollbar();
			
			var that = this,
			$selectableSearch = that.$selectableUl.prev();
			$selectionSearch = that.$selectionUl.prev();
			selectableSearchString = '#'+that.$container.attr('id')+' .ms-elem-selectable:not(.ms-selected)';
			selectionSearchString = '#'+that.$container.attr('id')+' .ms-elem-selection.ms-selected';
			that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
			.on('keydown', function(e){
				if (e.which === 40){
					that.$selectableUl.focus();
					return false;
				}
			});

			that.qs2 = $selectionSearch.quicksearch(selectionSearchString)
			.on('keydown', function(e){
				if (e.which == 40){
					that.$selectionUl.focus();
					return false;
				}
			});

			var selectedMulitID = this.$element.attr('id');
			nsMultiSelect.Json[selectedMulitID].data = [];
			nsMultiSelect.Json[selectedMulitID].obj = that;
			var _time = null;
			$(this.$selectableUl).off('dblclick');
			$(this.$selectableUl).on('dblclick','.ms-elem-selectable',function(ev){
				clearTimeout(_time);
				var selectedValue = $(this).data('msValue');
				var selectedText = $(ev.target).text().trim();
				//that.select(selectedValue);
				var $selectTableUI = that.$selectableUl;
				var selectionPid = that.$selectionUl.closest('div').attr('class');
				$('.'+selectionPid+' ul li').each(function(){
					if($(this).text().trim() == selectedText){
						$selectTableUI.find('li.selection-selected').removeClass('selection-selected');
						$(this).addClass('selection-selected');
						$(this).siblings().removeClass('selection-selected');
					}
				});
				var elementID = that.$element.attr('id');
				var selectJson = {"id":selectedValue,"text":selectedText,"type":"selection"};
				nsMultiSelect.multiSelectHandler(elementID,selectJson);
			});

			$(this.$selectableUl).off('click');
			$(this.$selectableUl).on('click','.ms-elem-selectable',function(ev){
				clearTimeout(_time);
				$(ev.target).closest('li').toggleClass('selection-selected');
				$(ev.target).closest('li').siblings().removeClass('selection-selected');	
				var selectedValue = $(this).data('msValue');
				var selectedText = $(ev.target).text().trim();
				_time = setTimeout(function(){
					//单击事件在这里
					var elementID = that.$element.attr('id');
					var selectJson = {"id":selectedValue,"text":selectedText,"type":"selected"};
					nsMultiSelect.multiSelectHandler(elementID,selectJson);
				},500);
			});
			var selectionTime = null;
			$(this.$selectionUl).off('click');
			$(this.$selectionUl).on('click','.ms-elem-selection',function(ev){
				clearTimeout(selectionTime);
				$(ev.target).closest('li').toggleClass('selection-selected');
				$(ev.target).closest('li').siblings().removeClass('selection-selected');	
				var selectedValue = $(this).data('msValue');
				var selectedText = $(ev.target).text().trim();
				selectionTime = setTimeout(function(){
					//单击事件在这里
					var elementID = that.$element.attr('id');
					var selectJson = {"id":selectedValue,"text":selectedText,"type":"cancelselected"};
					nsMultiSelect.multiSelectHandler(elementID,selectJson);
				},500);
			});
			$(this.$selectionUl).off('dblclick');
			$(this.$selectionUl).on('dblclick','.ms-elem-selection',function(ev){
				clearTimeout(selectionTime);
				var selectedValue = $(this).data('msValue');
				var selectedText = $(ev.target).text().trim();
				//that.deselect(selectedValue);
				var selectionPid = that.$selectableUl.closest('div').attr('class');
				var $slectionTableUI = that.$selectionUl;
				$('.'+selectionPid+' ul li').each(function(){
					if($(this).text().trim() == selectedText){
						$slectionTableUI.find('li.selection-selected').removeClass('selection-selected');
						$(this).addClass('selection-selected');
						$(this).siblings().removeClass('selection-selected');
					}
				});
				var elementID = that.$element.attr('id');
				var selectJson = {"id":selectedValue,"text":selectedText,"type":"cancelselection"};
				nsMultiSelect.multiSelectHandler(elementID,selectJson);
			});


		},
		afterSelect: function(values)
		{
			// Update scrollbar size
			this.$selectableContainer.add(this.$selectionContainer).find('.ms-list').perfectScrollbar('update');
			this.qs1.cache();
			this.qs2.cache();
			var elementID = this.$element.attr('id');
			var selectJson = {"id":values,"type":'selected'};
			nsMultiSelect.multiSelectedData(elementID,selectJson);
		},
		afterDeselect: function(values){
			this.qs1.cache();
			this.qs2.cache();
			var elementID = this.$element.attr('id');
			var selectJson = {"id":values,"type":'deselected'};
			nsMultiSelect.multiSelectedData(elementID,selectJson);
			
		}
	});
	if(typeof(multiAttribute.default)!='undefined'){
		$('#'+selectID).multiSelect('select',multiAttribute.default);
	}
	if(multiAttribute.isALLSelect == true){
		$('#'+selectID).multiSelect('select_all');
	}
	if(multiAttribute.isNotSelect == true){
		$('#'+selectID).multiSelect('deselect_all');
	}
}
/*********multiselect 初始化方法 end*************/

/**********multiselect返回函数的调用 start*****************/
nsMultiSelect.multiSelectHandler = function(elementID,selectJson){
	var selectedFunc;
	var selectionFunc;
	var cancelSelectedFunc;
	var cancelSelectionFunc;
	var multiAttribute = nsMultiSelect.Json[elementID].attribute;
	if(typeof(multiAttribute.selectedHanlder)!='undefined'){
		selectedFunc = multiAttribute.selectedHanlder;
	}
	if(typeof(multiAttribute.selectionHandler)!='undefined'){
		selectionFunc = multiAttribute.selectionHandler;
	}
	if(typeof(multiAttribute.cancelSelectedHandler)!='undefined'){
		cancelSelectedFunc = multiAttribute.cancelSelectedHandler;
	}
	if(typeof(multiAttribute.cancelSelectionHandler)!='undefined'){
		cancelSelectionFunc = multiAttribute.cancelSelectionHandler;
	}
	if(selectJson.type == 'selected'){
		if(typeof(selectedFunc)=='function'){
			selectedFunc(selectJson.id,selectJson.text);
		}
	}else if(selectJson.type == 'selection'){
		if(typeof(selectionFunc)=='function'){
			var receiveJson = selectionFunc(selectJson.id,selectJson.text);
			if(receiveJson.success){
				$('#'+elementID).multiSelect('select',selectJson.id)
			}else{
				nsalert(receiveJson.msg);
			}
		}
	}else if(selectJson.type == 'cancelselected'){
		if(typeof(cancelSelectedFunc)=='function'){
			cancelSelectedFunc(selectJson.id,selectJson.text);
		}
	}else if(selectJson.type == 'cancelselection'){
		if(typeof(cancelSelectionFunc)=='function'){
			var receiveJson = cancelSelectionFunc(selectJson.id,selectJson.text);
			if(receiveJson.success){
				$('#'+elementID).multiSelect('deselect',selectJson.id)
			}else{
				nsalert(receiveJson.msg);
			}
		}
	}
}
/**********multiselect返回函数的调用 end*****************/
/**********multiselect 排序start******************/
nsMultiSelect.multiSelectSort = function(elementID,type){
	var multiSelectArr = nsMultiSelect.Json[elementID];
	var multiSelectObj = multiSelectArr.obj;
	var multiSelectOrderJson = {};
	var $selectedSort = $(multiSelectObj.$container).find('.selection-selected');
	var selectedText = $selectedSort.text().trim();
	var containerID = $selectedSort.closest('div').attr('class');
	var containerPid = $('.'+containerID).parent().attr('id');
	if(typeof(containerID) == 'undefined'){
		nsalert('请先选中需要排序的值');
	}else{
		multiSelectOrderJson.selectedText = selectedText;
		var elementObj = $('#'+containerPid+' .'+containerID+' ul li');
		var elementFirstText = $('#'+containerPid+' .'+containerID+' ul li:first').text().trim();
		var elementEndText = $('#'+containerPid+' .'+containerID+' ul li:last').text().trim();
		var currentSelectObj ;
		var currentSelectIndex ;
		$(elementObj).each(function(key,values){
			if($(this).text().trim() == selectedText){
				currentSelectObj = $(values);
				currentSelectIndex = key;
			}
		});
		var thisLocation = elementObj.index(currentSelectObj);
		if(type == 'up'){
			if(thisLocation < 1 ){
				nsalert('系统提示,已移到最顶端了！');
			}else {
				function getPrevObj(cObj){
					var returnPrevObj = cObj.prev();
					if(returnPrevObj.css('display') == 'none'){
						getPrevObj(returnPrevObj);
					}else{
						multiSelectOrderJson.moveText = returnPrevObj.text().trim();
						returnPrevObj.before(currentSelectObj);
					}
				}
				getPrevObj(currentSelectObj);
				nsMultiSelect.multiSelectRefreshData(elementID,multiSelectOrderJson);
			}	
		}else if(type == 'down'){
			if(thisLocation >= elementObj.length - 1){
				nsalert('系统提示,已移到最底端了！');
			}else{
				function getNextObj(cObj){
					var returnNextObj = cObj.next();
					if(returnNextObj.css('display') == 'none'){
						getNextObj(returnNextObj);
					}else{
						multiSelectOrderJson.moveText = returnNextObj.text().trim();
						returnNextObj.after(currentSelectObj);
					}
				}
				getNextObj(currentSelectObj);
				nsMultiSelect.multiSelectRefreshData(elementID,multiSelectOrderJson);
			}
		}else if(type == 'top'){
			if( thisLocation < 1 ){
				nsalert('系统提示, 已移到最顶端了！');
			}else {
				multiSelectOrderJson.moveText = elementFirstText;
				currentSelectObj.parent().prepend(currentSelectObj);  //移动到最顶
				nsMultiSelect.multiSelectRefreshData(elementID,multiSelectOrderJson);
			}
		}else if(type == 'bottom'){
			if( thisLocation >= elementObj.length - 1 ){
				nsalert('系统提示,已移到最底端了！');
			}else {
				multiSelectOrderJson.moveText = elementEndText;
				currentSelectObj.parent().append(currentSelectObj);   //移动到最底
				nsMultiSelect.multiSelectRefreshData(elementID,multiSelectOrderJson);
			}
		}
	}
}
nsMultiSelect.multiSelectRefreshData = function(elementID,orderJson){
	var orderData = nsMultiSelect.Json[elementID].orderData;
	var orderAttribute = nsMultiSelect.Json[elementID].attribute;
	var valueField = typeof(orderAttribute.valueField) == 'undefined' ? 'id':orderAttribute.valueField;
	var textField = typeof(orderAttribute.textField) == 'undefined' ? 'text':orderAttribute.textField;
	var labelField = typeof(orderAttribute.labelField) == 'undefined' ? 'label':orderAttribute.labelField;
	var groupField = typeof(orderAttribute.groupField) == 'undefined' ? 'subdata':orderAttribute.groupField;
	var orderField = typeof(orderAttribute.order) == 'undefined' ? 'undefined':orderAttribute.order;		
	var selectedIndex = 0;
	var selectedMoveIndex = 0;
	for(var order in orderData){
		if(orderData[order][textField] == orderJson.selectedText){
			selectedIndex = order;
		}
		if(orderData[order][textField] == orderJson.moveText){
			selectedMoveIndex = order;
		}
	}
	var orderNumber = orderData[selectedIndex][orderField];
	var moveOrderNumber = orderData[selectedMoveIndex][orderField];
	orderData[selectedIndex][orderField] = moveOrderNumber;
	orderData[selectedMoveIndex][orderField] = orderNumber;
}
/**********multiselect 排序end********************/
/**********multiselect 选中值数组start********************/

nsMultiSelect.multiSelectedData = function(elementID,selectedJson){
	var selectedMulitID = elementID;
	var selectData = [];
	var multiAttribute = nsMultiSelect.Json[selectedMulitID].attribute;
	var selectData = nsMultiSelect.Json[selectedMulitID].orderData;
	var selectedArr = selectedJson.id;
	var defaultValue = multiAttribute.default;
	var valueField = typeof(multiAttribute.valueField) !='undefined' ? multiAttribute.valueField:'id';
	var textField = typeof(multiAttribute.textField) !='undefined' ? multiAttribute.textField:'text';
	var labelField = typeof(multiAttribute.labelField) !='undefined' ? multiAttribute.labelField:'label';
	var groupField = typeof(multiAttribute.groupField) !='undefined' ? multiAttribute.groupField:'subdata';
	var dataSrc = typeof(multiAttribute.dataSrc) !='undefined' ? multiAttribute.dataSrc:'';	
	nsMultiSelect.Json[selectedMulitID].dataSrc = dataSrc;
	for(var selected in selectData){
		if(typeof(selectData[selected][groupField])=='undefined'){
			for(var single = 0; single < selectedArr.length; single ++){
				if(selectData[selected][valueField] == selectedArr[single]){
					if(selectedJson.type == 'selected'){
						nsMultiSelect.Json[selectedMulitID].data.push(selectData[selected]);
					}else if(selectedJson.type == 'deselected'){
						nsMultiSelect.Json[selectedMulitID].data.splice(selectData[selected],1);
					}
				}
			}
		}else{
			var groupArr = selectData[selected][groupField];
			var groupLableField = selectData[selected][labelField];
			var groupJson = {};
			for(var group in groupArr){
				for(var double = 0; double < selectedArr.length; double++){
					if(groupArr[group][valueField] == selectedArr[double]){
						if(selectedJson.type == 'selected'){
							groupJson[labelField] = groupLableField;
							groupJson[groupField] = groupArr[group];
							nsMultiSelect.Json[selectedMulitID].data.push(groupJson);
						}else if(selectedJson.type == 'deselected'){
							var deselectArr = nsMultiSelect.Json[selectedMulitID].data;
							for(var deselect in deselectArr){
								var deselectGroupArr = deselectArr[deselect][groupField];
								for(var dSelect in deselectGroupArr){
									if(deselectGroupArr[dSelect] == selectedArr[double]){
										nsMultiSelect.Json[selectedMulitID].data.splice(deselect,1);
									}
								}
							}
						}
					}
				}
			}
		}
	}
}
/**********multiselect 选中值数组end********************/
/**
**value 文本id
**text 文本值
**index 填充位置
**nested 所填充到哪个分组
******/
nsMultiSelect.fillMultiValue = function(fillID,fillJson){
	var selectOptionJson = {};
	var multiAttribute = nsMultiSelect.Json[fillID].attribute;
	var valueField = typeof(multiAttribute.valueField) == 'undefined' ?'id':multiAttribute.valueField;
	var textField = typeof(multiAttribute.textField) == 'undefined' ?'text':multiAttribute.textField;
	var orderID = typeof(multiAttribute.singOrder) == 'undefined' ?'undefined':multiAttribute.singOrder;
	for(var fill in fillJson){
		selectOptionJson.value = fillJson[valueField];
		selectOptionJson.text = fillJson[textField];
	}
	nsMultiSelect.Json[fillID].orderData.push(fillJson);
	$('#'+fillID).multiSelect('addOption',selectOptionJson);
}
nsMultiSelect.componentMultiSelect = function(fillID,type,value){
	switch(type){
		case "refresh":
			$('#'+fillID).multiSelect('refresh');
			break;
		case "select_all":
			$('#'+fillID).multiSelect('select_all');
			break;
		case "deselect_all":
			$('#'+fillID).multiSelect('deselect_all');
			break;
		case "select":
			$('#'+fillID).multiSelect('select',value);
			break;
		case "deselect":
			$('#'+fillID).multiSelect('deselect',value);
			break;
		default:
			break;
	}
}
nsMultiSelect.getSelectJson = function(multiID){
	var dataJson = {};
	var dataSrc = nsMultiSelect.Json[multiID].dataSrc;
	dataJson[dataSrc] = nsMultiSelect.Json[multiID].data;
	return dataJson;
}

//日期时间类型
formPlane.componentDatetime = function(formID,dateTimeFormatArr){
	for(var datetimeIndex in dateTimeFormatArr){
		var datetimeID = 'form-'+formID+'-'+dateTimeFormatArr[datetimeIndex].id;
		var dateID = 'form-'+formID+'-'+dateTimeFormatArr[datetimeIndex].id+'-date';
		var timeID = 'form-'+formID+'-'+dateTimeFormatArr[datetimeIndex].id+'-time';
		var dateFormat = 'yyyy-mm-dd';
		var isShowseconds = true;
		if(typeof(dateTimeFormatArr[datetimeIndex].format)=='string'){
			var formatStr = dateTimeFormatArr[datetimeIndex].format;
			dateFormat = formatStr.split(' ')[0];
			if(typeof(formatStr.split(' ')[1])=='string'){
				//存在时间类型
				var timeFormat = formatStr.split(' ')[1];
				if(timeFormat.indexOf('ss') == -1){isShowseconds = false}
			}
		}
		$('#'+timeID).attr('seconds',isShowseconds);
		/**/
		var isDisabled = typeof(dateTimeFormatArr[datetimeIndex].disabled) == 'boolean' ? dateTimeFormatArr[datetimeIndex].disabled : false;
		if(isDisabled == false){	
			$('#'+dateID).off('focus');
			$('#'+dateID).on('focus',function(){
				var tempID = $(this).attr('id');
				var timeID = tempID.substr(0,tempID.length-5);
				timeID = timeID+'-time';
				$('#'+timeID).timepicker('hideWidget');
			});	
			$('#'+dateID).datepicker({
				format:dateFormat,
				autoclose:true,
				todayHighlight:true,
			}).on('changeDate', function(ev){
				var changeFormID = $(ev.target).closest('form').attr('id');  //formID
				var changeDateID = $(this).attr('id'); //dateID
				var changeDateTimeID = changeDateID.substr(changeFormID.length+1,changeDateID.length);
				changeDateTimeID = changeDateTimeID.substr(0,changeDateTimeID.length-5);
				changeFormID = changeFormID.substr(5,changeFormID.length);
				var changeHandler = formPlane.data[changeFormID].formInput[changeDateTimeID].changeHandler;
				var getTimerID = 'form-' + changeFormID + '-' + changeDateTimeID +'-time';
				var getTimervalue = $('#'+getTimerID).val().trim();
				if(typeof(changeHandler)=='function'){
					var changeDateVal = $(this).val().trim();
					var datetimervalue = changeDateVal + ' ' + getTimervalue;
					var returnObj = {};
					returnObj.datevalue = changeDateVal;
					returnObj.dateID = changeDateID;
					returnObj.timeValue = getTimervalue;
					returnObj.timeID = getTimerID;
					returnObj.datetimerID = changeDateTimeID;
					returnObj.datetimervalue = datetimervalue;
					changeHandler(returnObj);
				}
			});
			$('#'+timeID).timepicker({
				minuteStep: 1,//分钟间隔
				template: 'dropdown',//是否可选择 false,modal为只读
				showSeconds:isShowseconds,//是否显示秒
				secondStep:1,//秒间隔
				showMeridian:false,//24小时制  true为12小时制
				defaultTime: false,  //默认时间
				showInputs:false,
			}).on('hide.timepicker',function(ev){
				var changeFormID = $(ev.target).closest('form').attr('id');
				var currentTimeID = $(this).attr('id');
				var changeDateTimeID = currentTimeID.substr(changeFormID.length+1,currentTimeID.length);
				changeDateTimeID = changeDateTimeID.substr(0,changeDateTimeID.length-5);
				changeFormID = changeFormID.substr(5,changeFormID.length);
				var changeHandler = formPlane.data[changeFormID].formInput[changeDateTimeID].changeHandler;
				var getDateID = 'form-' + changeFormID + '-' + changeDateTimeID + '-date';
				var getDatevalue = $('#'+getDateID).val().trim();
				if(typeof(changeHandler)!='undefined'){
					var changeDateVal = $(this).val().trim();
					var datetimervalue = getDatevalue + ' ' + changeDateVal;
					var returnObj = {};
					returnObj.datevalue = getDatevalue;
					returnObj.dateID = getDateID;
					returnObj.timeValue = changeDateVal;
					returnObj.timeID = currentTimeID;
					returnObj.datetimerID = changeDateTimeID;
					returnObj.datetimervalue = datetimervalue;
					changeHandler(returnObj);
				}
			}).on('changeTime.timepicker',function(ev){
				var timeStr = ev.time.hours;
				if(Number(ev.time.minutes) < 10){
					timeStr += ':0'+ev.time.minutes;
				}else{
					timeStr +=':'+ev.time.minutes;
				}
				var isShowseconds = $(this).attr('seconds');
				if(isShowseconds == 'true'){
					if(Number(ev.time.seconds) < 10){
						timeStr += ':0'+ev.time.seconds;
					}else{
						timeStr += ':'+ev.time.seconds;
					}
				}
				$(this).val(timeStr);
			});
		}
	}
}

formPlane.componentDate = function(formID,dateFormatArr){
	for(var format in dateFormatArr){
		var currentFormatObj = $('#form-'+formID+'-'+dateFormatArr[format].id);
		var iconDatePickerObj = currentFormatObj.closest('div');
		iconDatePickerObj = iconDatePickerObj.find('.input-group-addon a');
		iconDatePickerObj.on('click',function(ev){
			var dateFormatObj = $(ev.target).closest('.input-group').children('input');
			dateFormatObj.datepicker('show');
		})
		var datepickerOption = {
			autoclose:true,
			todayHighlight:true,
			format:dateFormatArr[format].format
		};
		//初始化日期组件	
		$('#form-'+formID+'-'+dateFormatArr[format].id).datepicker({
			autoclose:true,
			todayHighlight:true,
			format:dateFormatArr[format].format,
		}).on('changeDate', function(ev){
			var changeFormID = $(ev.target).closest('form').attr('id');
			var changeInputID = $(this).attr('id');
			changeInputID = changeInputID.substr(changeFormID.length+1, changeInputID.length);
			changeFormID = changeFormID.substr(5,changeFormID.length);
			var changeHandler = formPlane.data[changeFormID].formInput[changeInputID].changeHandler;
			if(typeof(changeHandler)!='undefined'){
				var changeDateVal = $(this).val().trim();
				var returnObj = {};
				returnObj.id = changeInputID;
				returnObj.value = changeDateVal;
				changeHandler(returnObj);
			}
		});
	}
}
formPlane.componentTypeahead = function(formID,typeaheadArr){
	for(var typeaheadIndex in typeaheadArr){
		var typeaheadID = '#form-'+formID+'-'+typeaheadArr[typeaheadIndex].id;
		var typeaheadOrder = "asc";
		if(typeof(typeaheadArr[typeaheadIndex].order)!='undefined'){
			typeaheadOrder = typeaheadArr[typeaheadIndex].order;
		}
		var typeaheadSource = {};
		if(typeof(typeaheadArr[typeaheadIndex].sourceSrc)!='undefined'){
			if(typeaheadArr[typeaheadIndex].sourceSrc != ''){
				typeaheadSource = {
					ajax:{
						url:typeaheadArr[typeaheadIndex].sourceSrc,
						path:typeaheadArr[typeaheadIndex].dataSrc
					}
				};
			}else{
				//ajax为空，读自定义数据
				//typeaheadSource = {data:typeaheadArr[typeaheadIndex].selfData};
				typeaheadSource[typeaheadArr[typeaheadIndex].dataSrc] = {
					data: typeaheadArr[typeaheadIndex].selfData
				}
				/*typeaheadSource = {
					country: {
                		data: typeaheadArr[typeaheadIndex].selfData
            		},
            		capital: {
                		data: data.capitals
            		}
            	};*/
			}
		}
		typeof $.typeahead === 'function' && $.typeahead({
			input: typeaheadID,
			minLength: 1,
			maxItem: 20,
			order: typeaheadOrder,
			group: true,
			maxItemPerGroup: 3,//每组显示结果数
			groupOrder: function () {
				var scope = this,
				sortGroup = [];

				for (var i in this.result) {
					sortGroup.push({
						group: i,
						length: this.result[i].length
					});
				}

				sortGroup.sort(
					scope.helper.sort(
						["length"],
						false, // false = desc, the most results on top
						function (a) {
							return a.toString().toUpperCase()
						}
					)	
				);

				return $.map(sortGroup, function (val, i) {
					return val.group
				});
			},
            hint: true,
			dropdownFilter: typeaheadArr[typeaheadIndex].dropdownFilter,
			source:typeaheadSource,
			/*source: {
				ajax:{
					url:getRootPath() +'/assets/json/shortkey.json',
					path:typeaheadArr[typeaheadIndex].dataSrc
				}
			},*/
			callback: {
				onInit: function(node){
					
				},
				//键盘触发事件
				onNavigateBefore:function(node,query,event){
					if (~[38,40].indexOf(event.keyCode)) {
						event.preventInputChange = true;
					}
				},
				onSearch:function(node,query){
					var keyID = $(node).attr('id');
					for(var kID in formPlane.fillValid[formID]){
						if(kID == keyID){
							$('#'+kID).closest('span').find('.has-error').remove();
							if(query == ''){
								formPlane.fillValid[formID][kID] = false;
								$('#'+kID).closest('span').append('<label class="has-error">必填</label>');
							}else{
								formPlane.fillValid[formID][kID] = true;
							}
						}
					}
				},
				onResult: function (node, query, result, resultCount) {
					if (query === "") return;
						var text = "";
						var isQuery = true;
					if (result.length > 0 && result.length < resultCount) {
						text = "Showing <strong>" + result.length + "</strong> of <strong>" + resultCount + '</strong> elements matching "' + query + '"';
						isQuery = true;
					} else if (result.length > 0) {
						text = 'Showing <strong>' + result.length + '</strong> elements matching "' + query + '"';
						isQuery = true;
					} else {
						text = 'No results matching "' + query + '"';
						isQuery = false;
					}
					var queryID = $(node).attr('id');
					$('#'+queryID).closest('span').find('.has-error').remove();
					if(isQuery == false){
						$('#'+queryID).closest('span').append('<label class="has-error">未找到匹配值</label>');
					}
					for(var kID in formPlane.fillValid[formID]){
						if(kID == queryID){
							formPlane.fillValid[formID][kID] = isQuery;
						}
					}
					$('#result-container').html(text);
				},
				onShowLayout: function (node,query){
					
				},
				onHideLayout: function (node, query) {
					node.attr('placeholder', 'Search');
				},
			}
		});
	}
}
var $select2Change = {};
formPlane.componentSelect2 = function(formID,select2Arr){
	var mainID = 'form-'+formID+'-';
	for(var choseI=0; choseI<select2Arr.length; choseI++){
		//是否可以自定义添加标签
		var filltag = typeof(select2Arr[choseI].filltag) == 'boolean' ? select2Arr[choseI].filltag : false;
		//是否可以自定义关闭选项
		var isAllowClear = typeof(select2Arr[choseI].isAllowClear) == 'boolean' ? select2Arr[choseI].isAllowClear : true;
		//多选前提下，允许最多选择的项
		var maximumItem = typeof(select2Arr[choseI].maximumItem) == 'number' ? select2Arr[choseI].maximumItem : 3;
		//是否开启搜索
		var isCloseSearch = typeof(select2Arr[choseI].isCloseSearch) == 'number' ? select2Arr[choseI].isCloseSearch : 1;
		//默认值：如果是必填则显示，如果不是则不显示
		var placeholderStr = '';
		var sID = mainID+select2Arr[choseI].id;//完整的选项id
		if(select2Arr[choseI].rules){
			placeholderStr = '必填';
			//如果值存在验证通过
			if($('#'+sID).val()){
				formPlane.fillValid[formID][sID] = true;
			}
		}
		$select2Change[sID] = $('#'+sID).select2({
			placeholder: placeholderStr,//默认值
			tags:filltag,//手动添加自定义标签值
			maximumSelectionLength:maximumItem,//允许选择的条目数
			allowClear: isAllowClear,//是否清空选择项
			minimumResultsForSearch:isCloseSearch,
			width:'100%',
		});
	}
	$('.form-item.select2 select').on('select2:close', function (evt) {
		var keyID = $(evt.target).closest('select').attr('id');//当前select2元素的id
		var formMainID = $(evt.target).closest('form').attr('id');//form的id
		var formID = formMainID.substr(5,formMainID.length);
		var selFormID = 'form-'+formID;
		var selectID = keyID.substr(selFormID.length+1,keyID.length);
		var query = $(evt.target).closest('select').val();
		var queryText = $(evt.target).closest('select').find('option:selected').text().trim();
		//是否有验证
		for(var kID in formPlane.fillValid[formID]){
			if(kID == keyID){
				$('#'+kID).closest('div').find('.has-error').remove();
				if(query == '' || query == '请选择' || query == null){
					formPlane.fillValid[formID][kID] = false;
					$('#'+kID).closest('div').append('<label class="has-error">必填</label>');
				}else{
					formPlane.fillValid[formID][kID] = true;
				}
			}
		}
		var select2Func = formPlane.data[formID].formInput[selectID].changeHandler;
		if(typeof(select2Func) == 'function'){
			select2Func(query,queryText);
		}                   
	});	
}
formPlane.componentTextBtnHandler = function(formID,textBtnArr){
	for(var textBtn = 0; textBtn < textBtnArr.length; textBtn ++){
		var textID = 'form-'+formID+'-'+textBtnArr[textBtn].id;
		var $elementObj = $('#'+textID).closest('div').find('button');
		if(typeof($elementObj.attr('disabled'))=='undefined'){
			$elementObj.off('click');
			$elementObj.on('click',function(ev){
				var btnID = Number($(this).attr('fid'));
				var changeInputID = $(this).closest('div').parent().find('input').attr('id');
				var changeFormID = $(this).closest('form').attr('id');
				changeInputID = changeInputID.substr(changeFormID.length+1, changeInputID.length);
				changeFormID = changeFormID.substr(5,changeFormID.length);
				var btnArr = formPlane.data[changeFormID].formInput[changeInputID].btns;
				if(!isNaN(btnID)){
					if(typeof(btnArr[btnID].handler)=='function'){	
						var btnFunc = btnArr[btnID].handler;
						btnFunc();
					}
				} 
			})
		}
	}
}
formPlane.componentHandler = function(formID,changeHandlerArr){
	for(var changehandlerI = 0; changehandlerI<changeHandlerArr.length; changehandlerI++){
		var changehandlerInputID = 'form-'+formID+'-'+changeHandlerArr[changehandlerI].id;
		if(changeHandlerArr[changehandlerI].type=='radio' || changeHandlerArr[changehandlerI].type=='checkbox'){
			$('input[name="'+changehandlerInputID+'"]').on('change',function(ev){
				var changeFormID = $(ev.target).closest('form').attr('id');
				var changeInputID = $(ev.target).attr('name');
				changeInputID = changeInputID.substr(changeFormID.length+1, changeInputID.length);
				changeFormID = changeFormID.substr(5,changeFormID.length);
				var changeHandler = formPlane.data[changeFormID].formInput[changeInputID].changeHandler;
				var returnValue = $(ev.target).val();
				var returnObj = $(this);
				changeHandler(returnValue,returnObj);
			})
		}else if(changeHandlerArr[changehandlerI].type=='select'){
			//
		}else if(changeHandlerArr[changehandlerI].type == 'text' || changeHandlerArr[changehandlerI].type == 'text-btn' || changeHandlerArr[changehandlerI].type == 'number'){
			$('input[id="'+changehandlerInputID+'"]').on('keyup',function(ev){
				var changeFormID = $(ev.target).closest('form').attr('id');
				var changeSelectID = $(ev.target).closest('input').attr('id');
				changeSelectID = changeSelectID.substr(changeFormID.length+1, changeSelectID.length);
				changeFormID = changeFormID.substr(5,changeFormID.length);
				var changeHandler = formPlane.data[changeFormID].formInput[changeSelectID].changeHandler;
				var returnObj = {};
				returnObj.id = changeSelectID;
				returnObj.value = $(ev.target).val().trim();
				returnObj.obj = $(this);
				if(typeof(changeHandler)!='undefined'){
					changeHandler(changeSelectID,$(ev.target).val().trim(),returnObj);
				}
			})
		}
	}
}
//追加表单区域
formPlane.append = function(appendArr,formID,appendID){
	var appendHtml = '';
	var validateArr = [];
	var fillFormID = 'form-'+formID;
	for(var appendI = 0; appendI < appendArr.length; appendI ++){
		if(typeof(appendArr[appendI].id) == 'undefined'){
			if(typeof(appendArr[appendI].html)!='undefined'){
				appendHtml += appendArr[appendI].html;
			}
		}else{
			if($('#'+fillFormID+'-'+appendArr[appendI].id).length > 0){
				//已经存在的元素
				appendHtml += '';
			}else{
				appendHtml += commonConfig.component(appendArr[appendI],formID,'form');
				validateArr.push(appendArr[appendI]);
			}
		}
	}
	if(typeof(appendID) == 'undefined'){
		$('#'+fillFormID).children('.row').last().append(appendHtml);
	}else{
		$('#'+fillFormID+'-'+appendID).closest('.row.row-close.fillbg').append(appendHtml);
	}
	//是否有验证的对象
	if(validateArr.length>0){
		formPlane.validateForm(formID,validateArr);
	}
	//初始化select组件
	$('.form-item.select select').selectBoxIt().on('open', function(){
		$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
	});

	$('.form-item.selectplane select').selectBoxIt().on('open',function(){
		$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
	})
}
formPlane.delete = function(formID,deleteArr){
	if(typeof(deleteArr) == 'object'){
		for(var delI = 0; delI < deleteArr.length; delI ++){
			var delID = 'form-'+formID+'-'+deleteArr[delI];
			$('#'+delID).closest('.form-td').remove();
		}
	}
}
formPlane.selectAppend = function(formID,selectOptions){
	var selectID = selectOptions.id;
	var $select = $('#form-'+formID+'-'+selectID);
	var isDisabled = selectOptions.isDisabled ? selectOptions.isDisabled : false;
	var optionsArr = selectOptions.subdata;
	var optionStr = '';
	for(var optionI = 0; optionI < optionsArr.length; optionI ++){
		var selectedStr = optionsArr[optionI].selected ? 'selected':'';
		var optionStr = '<option value="'+optionsArr[optionI].value+'" '+selectedStr+'>'+optionsArr[optionI].text+'</option>';
	}
	$select.append(optionStr);
	if(isDisabled){
		$select.attr('disabled',true);
	}
	var $selectBoxOption = $select.selectBoxIt().data("selectBox-selectBoxIt");
	$selectBoxOption.refresh();
}
//将更改表单的部分区域
formPlane.edit = function(editJsonArr, formID){
	var changeHandlerArr = [];
	var refreshSelectArr = [];
	var dateFormatArr = [];
	var uploadHandlerJson = {};
	var textBtnArr = [];
	var treeSelectJson = {};
	var selectDateJson = {};
	var selectHandlerArr = [];
	var provSelectArr = [];
	var select2Arr = [];
	for(var i=0; i<editJsonArr.length; i++){
		var editJson = editJsonArr[i];
		var inputArr = formPlane.getInputContainerAndData(editJson.id,formID);
		var inputContainer = inputArr[0];
		var InputData = inputArr[1];
		$.each(editJson,function(key,value){
			if(key!='id'){
				InputData[key] = value;
			}
		});
		var formType = typeof(nsForm.data[formID].formType)=='string'?nsForm.data[formID].formType:'form';
		var componentHtml = '';
		if(formType=='dialog'|| formType=='modal'){
			formType = 'modal'; //弹出框修改传递的参数是dialog
			componentHtml = commonConfig.component(InputData,formID, formType, nsdialog.config.size);
		}else{
			componentHtml = commonConfig.component(InputData,formID, formType);
		}
		
		
		var hiddenInputID = 'form-'+formID+'-'+InputData.id;
		if(InputData.type == 'hidden'){
			if(inputContainer.parent().hasClass('row row-close')){
				$('#'+hiddenInputID).val(InputData.value);
			}
		}
		
		if(formType=='form'){
			var componentContainerHtml = componentHtml.substring(componentHtml.indexOf('=')+1,componentHtml.indexOf('>'));
			componentHtml = componentHtml.substring(componentHtml.indexOf('>')+1,componentHtml.lastIndexOf('<'));
			inputContainerAttr = componentContainerHtml.substring(componentContainerHtml.indexOf('"')+1,componentContainerHtml.length-1);
			inputContainer.closest('.form-td').attr('class',inputContainerAttr);
			inputContainer.closest('.form-td').html(componentHtml);
		}else if(formType=='modal'){
			var componentClassStr = componentHtml.substring(componentHtml.indexOf('class="')+7,componentHtml.indexOf('>'));
			componentClassStr = componentClassStr.substring(0,componentHtml.indexOf('"'));
			componentHtml = componentHtml.substring(componentHtml.indexOf('>')+1,componentHtml.lastIndexOf('<'));
			inputContainer.closest('.form-group ').attr('class',componentClassStr);
			inputContainer.closest('.form-group ').html(componentHtml);
		}
		
		if(typeof(InputData.id)!='undefined'){
			if(typeof(InputData.changeHandler)!='undefined'){
				//非text-btn类型的组件有函数，集中处理，以change为标准
				changeHandlerArr.push(InputData);
			}
			if(InputData.type=='select'){
				refreshSelectArr.push(InputData);
			}
			if(InputData.type == 'select2'){
				select2Arr.push(InputData);
			}
			var inputReadonly = InputData.readonly ? InputData.readonly : false;
			if(InputData.type == 'date' && inputReadonly == false){
				dateFormatArr.push(InputData);
			}
			if(InputData.type == 'upload' && inputReadonly == false){
				uploadHandlerJson[InputData.id] = InputData;
			}
			if(InputData.type == 'text-btn'){
				textBtnArr.push(InputData);
			}
			if(InputData.type == 'select'){
				selectHandlerArr.push(InputData);
			}
			if(InputData.type == 'tree-select'){
				treeSelectJson[InputData.id] = InputData;
			}
			if(InputData.type == 'selectDate'){
				selectDateJson[InputData.id] = InputData;
			}
			if(InputData.type == 'province-select'){
				provSelectArr.push(InputData);
			}
		}
	}
	if(selectHandlerArr.length > 0){
		formPlane.validateSelectPlane(formID,selectHandlerArr);
	}

	if(provSelectArr.length > 0){
		provinceSelect.init(formID,provSelectArr);
	}
	//selectDate
	if(!$.isEmptyObject(selectDateJson)){
		formPlane.selectDatePlane(formID,selectDateJson);
	}
	formPlane.selectMorePlane(formID);
	//tree-select
	if(!$.isEmptyObject(treeSelectJson)){
		treeUI.componentSelectPlane(formID,treeSelectJson);
	}
	//select2
	if($.isArray(select2Arr)){
		formPlane.componentSelect2(formID,select2Arr);
	}
	//text-btn
	if(textBtnArr.length > 0 ){
		formPlane.componentTextBtnHandler(formID,textBtnArr);
	}
	//是否有日期类型
	if(dateFormatArr.length>0){
		formPlane.componentDate(formID,dateFormatArr);
	}
	//是否有上传类型
	if(!$.isEmptyObject(uploadHandlerJson)){
		formPlane.componentUpload(formID,uploadHandlerJson);
	}
	var selectDiabledArr = [];
	var cancelSelectDisableArr = [];
	for(refreshSel in refreshSelectArr){
		var refreshFormID = 'form-'+formID+'-'+refreshSelectArr[refreshSel].id;
		var refreshDisabled = false;
		if(typeof(refreshSelectArr[refreshSel].disabled) != 'undefined'){
			refreshDisabled = refreshSelectArr[refreshSel].disabled;
			if(refreshDisabled == true){
				selectDiabledArr.push(refreshFormID);
			}else{
				cancelSelectDisableArr.push(refreshFormID);
			}
		}
	}
	if(selectDiabledArr.length > 0){
		for(var selected in selectDiabledArr){
			$('#'+selectDiabledArr[selected]).attr('disabled',true);
		}
	}
	if(cancelSelectDisableArr.length > 0){
		for(var selected in selectDiabledArr){
			$('#'+selectDiabledArr[selected]).attr('disabled',false);
		}
	}
	formPlane.componentHandler(formID,changeHandlerArr);
	//初始化select组件
	$('.form-item.select select').selectBoxIt().on('open', function(){
		$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
	});

	$('.form-item.selectplane select').selectBoxIt().on('open',function(){
		$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
	})
}
/***************************************************************************************************
 * formPlane.getInputContainerAndData
 * arguments inputID 原始input id
 * arguments formID  表单的id，预留参数，暂不使用，用于区分多表单
 *
 * @returns 数组, [0]是该组件的jquery DOM对象，[1]是原始数据
 */
formPlane.getInputContainerAndData = function(inputID,formID){
	var formInputData = {};
	var InputData = {};
	for(var form in formPlane.data){
		var formInputData = formPlane.data[formID].formInput;
		InputData = formInputData[inputID];
		if(!$.isEmptyObject(InputData)){
			var inputContainer;
			if(InputData.type == 'radio' || InputData.type == 'checkbox'){
				var nameID = 'form-'+formPlane.data[formID].id+'-'+InputData.id;
				inputContainer = $('input[name="'+nameID+'"]');
			}else if(InputData.type=="province-select"){
				var nameID = 'form-'+formPlane.data[formID].id+'-'+InputData.id+'-province';
				inputContainer = $('#'+nameID);
			}else if(InputData.type == 'datetime'){
				inputContainer = $("#form-"+formPlane.data[formID].id+'-'+InputData.id+'-date');
			}else{
				inputContainer = $("#form-"+formPlane.data[formID].id+'-'+InputData.id);
			}
			return [inputContainer,InputData];
		}
	}
	if($.isEmptyObject(formInputData)){
		nsalert("无法找到表单");
	}else{
		if($.isEmptyObject(InputData)){
			nsalert("无法找到已有组件数据");
		}
	}
	return false;
}
//将数据填充到表单中
formPlane.setValues = function(json,fillformID){
	json = nsVals.clearNull(json);
	formPlane.fillValues(json,fillformID);
}
formPlane.fillValues = function(json,fillformID){
	var formID = arguments[1] ? arguments[1] : '';
	var formIDStr = formID;
	if(formIDStr == ''){
		for(var form in formPlane.data){
			formID = form;
			formIDStr = 'form-'+form;
		}
	}else{
		formIDStr = 'form-'+formID;
	}
	$.each(json,function(key,value){
		if(typeof(formPlane.data[formID].formInput[key])!='undefined'){

			var inputID = formIDStr+'-'+key;
			var inputValue = value;
			var inputType = formPlane.data[formID].formInput[key].type;
			var subdata = '';
			var valueField = 'value';
			if(formPlane.data[formID].formInput[key].valueField){
				valueField = formPlane.data[formID].formInput[key].valueField;
			}
			if(inputType=='radio'){
				subdata = formPlane.data[formID].formInput[key].subdata;
			}
			if(inputType=='checkbox'){
				subdata = formPlane.data[formID].formInput[key].subdata;
			}
			if(inputType=='add-select-input'){
				var configData = formPlane.data[formID].formInput[key];
				var currentData = '';
				for(var valueI = 0; valueI<configData.localDataArr.length; valueI++){
					if(configData.localDataArr[valueI][configData.localDataHiddenIDIndex]==value){
						currentData = configData.localDataArr[valueI];
						break;
					}
				}
				if(currentData!=''){
					var fillValuesArr = [];
					for(var columnI = 0; columnI<configData.columnData.length; columnI++){
						fillValuesArr.push(currentData[configData.columnData[columnI]]);
					}
					fillValuesArr.push(currentData[configData.localDataHiddenIDIndex]);
					nsUI.addSearchInput.fillValue(fillValuesArr,configData,$('#'+inputID))
				}else{
					if(value!=''||value!=undefined){
						nsalert(configData.label+'返回值错误');
						nsUI.addSearchInput.clearValue(configData,$('#'+inputID),true);
					}
				}
			}else if(inputType == 'organiza-select'){
				var configData = formPlane.data[formID].formInput[key];
				if(typeof(value)=='object'){
					$('#'+configData.fullID).val(value.text);
					$('#'+configData.fullHiddenID).val(value.id);
				}
			}else if(inputType == 'selectDate'){
				commonConfig.setSelectKeyValue(inputID,inputValue,inputType);
			}else if(inputType == 'selectSelect'){
				commonConfig.setSelectKeyValue(inputID,inputValue,inputType);
			}else if(inputType == 'selectText'){
				commonConfig.setSelectKeyValue(inputID,inputValue,inputType);
			}else if(inputType == 'person-select'){
				nsUI.personSelect.setValue(value);
			}else if(inputType == 'province-select'){
				provinceSelect.fillValue(inputID,inputValue);
			}else{
				commonConfig.setKeyValue(inputID,inputValue,inputType,subdata,valueField);
				if(typeof(formPlane.fillValid[formID][inputID])!='undefined'){
					formPlane.fillValid[formID][inputID] = true;
				}
			}
		}
	});
}
//得到表单所有值
formPlane.getAllFormData = function(formID){
	var formData = {};
	for(var inputJson in formPlane.data[formID].formInput){
		var inputkey;
		var inputValue;
		var inputType = formPlane.data[formID].formInput[inputJson].type;
		inputkey = inputJson;
		if(inputType == 'radio'){
			inputValue = $('#form-'+formID+' input[name="form-'+formID+'-'+inputkey+'"]:checked').val();
		}else if(inputType == 'checkbox'){
			var checkboxObj = $('#form-'+formID+' input[name="form-'+formID+'-'+inputkey+'"]');
			if(checkboxObj.length == 1){
				if($(checkboxObj).is(':checked')){
					inputValue = 1;
				}else{
					inputValue = 0;
				}
			}else{
				if($('#form-'+formID+' input[name="form-'+formID+'-'+inputkey+'"]:checked').length > 0){
					var chkArr = [];
					$('#form-'+formID+' input[name="form-'+formID+'-'+inputkey+'"]:checked').each(function(ev){
						chkArr.push($(this).val());
					});
					inputValue = chkArr;
				}else{
					inputValue = "";
				}
			}
		}else{
			inputValue = $('#form-'+formID+' #form-'+formID+'-'+inputkey).val();
		}
		formData[inputkey] = inputValue;
	}
	return formData;
}
//将表单内容生成json  
//isNeedValid (boolean) 是否要验证，默认为true，需要验证
formPlane.getFormJSON = function(formID,isNeedValid){
	//初始化验证
	if(typeof(formID)!='string'){
		nsalert('getFormJSON参数错误，必须提供config中form的id','error');
		return false;
	}
	if($("#form-"+formID).length==0){
		nsalert('表单ID：'+formID+' 不存在','error');
		return false;
	}
	if(typeof(isNeedValid)!='boolean'){
		isNeedValid = true;
	}

	//判断是否通过验证，返回值为是否通过验证，true
	function getFormValid(){
		var validBln = true;
		//默认验证规则是否通过
		if($("#form-"+formID).valid()==false){
			validBln = false;
		}
		//下拉框等自定义组件的验证，外部验证
		var fillValid = true;
		var errorArrID = [];
		for(var valid in formPlane.fillValid[formID]){
			if(formPlane.fillValid[formID][valid] == false){
				fillValid = false;
				errorArrID.push(valid);
			}
		}
		if(fillValid==false){
			for(var index in errorArrID){
				if($('#'+errorArrID[index]).parent().children().hasClass('has-error')){
					$('#'+errorArrID[index]).parent().find('.has-error').remove();
				}
				$('#'+errorArrID[index]).parent().append('<label class="has-error">必填</label>');
			}
			validBln = false;
		}
		//人员选择器等，内部验证组件
		for(var inputkey in formPlane.data[formID].formInput){
			var config = formPlane.data[formID].formInput[inputkey];
			var inputType = config.type;
			switch(inputType){
				//人员选择器
				case 'person-select':
					var isPSvalid = nsUI.personSelect.isValid(nsForm.data[formID].formInput[inputkey]);
					if(isPSvalid==false){
						validBln = false;
					}
					break;
			}
		}
		return validBln;
	}
	//获取数据
	function getJson(){
		var formDataJson = {};
		for(var inputkey in formPlane.data[formID].formInput){
			var inputValue;
			var config = formPlane.data[formID].formInput[inputkey];
			var inputType = config.type;
			switch(inputType){
				case 'selectText':
				case 'textSelect':
					//下拉框文本  //文本下拉框
					formDataJson[inputkey] = $('#form-'+formID+' #form-'+formID+'-'+inputkey).val();
					var selectID = config.select.id;
					var textID = config.text.id;
					var formSelectID = 'form-'+formID+'-'+selectID;
					var selectvalue = $('#form-'+formID+' #'+formSelectID).val().trim();
					formDataJson[selectID] = selectvalue;
					var formTextID = 'form-'+formID+'-'+textID;
					var textvalue = $('#form-'+formID+' #'+formTextID).val().trim();
					formDataJson[textID] = textvalue;
					break;
				case 'selectDate':
					//下拉框日期组件
					var formPreID = 'form-'+formID+'-';
					var caseSelectID = config.caseSelect.id;
					var caseSelectvalue = $('#form-'+formID+' #'+formPreID+caseSelectID).val().trim();
					var textID = config.text.id;
					var textvalue = $('#form-'+formID+' #'+formPreID+textID).val().trim();
					var dateID = config.date.id;
					var datevalue = $('#form-'+formID+' #'+formPreID+dateID).val().trim();
					var dateRangeID = config.daterange.id;
					var daterangevalue = $('#form-'+formID+' #'+formPreID+dateRangeID).children('span').text().trim();
					if(daterangevalue){
						var daterangeStart = daterangevalue.split('至')[0];
						var daterangeEnd = daterangevalue.split('至')[1];
						formDataJson[dateID] = daterangeStart;
						formDataJson[dateRangeID] = daterangeEnd;
					}else{
						formDataJson[dateID] = datevalue;
						formDataJson[dateRangeID] = '';
					}
					formDataJson[caseSelectID] = caseSelectvalue;
					formDataJson[textID] = textvalue;

					formDataJson[inputkey] = $('#form-'+formID+' #form-'+formID+'-'+inputkey).val();
					break;
				case 'selectSelect':
					//下拉框下拉框组件
					var formPreID = 'form-'+formID+'-';
					var firstSelectID = config.firstSelect.id;
					var secondSelectID = config.secondSelect.id;
					var firstvalue = $('#form-'+formID+' #'+formPreID+firstSelectID).val().trim();
					var secondvalue = $('#form-'+formID+' #'+formPreID+secondSelectID).val().trim();
					formDataJson[firstSelectID] = firstvalue;
					formDataJson[secondSelectID] = secondvalue;
					formDataJson[inputkey] = $('#form-'+formID+' #form-'+formID+'-'+inputkey).val();
					break;
				case 'radio':
					//单选
					inputValue = $('#form-'+formID+' input[name="form-'+formID+'-'+inputkey+'"]:checked').val();
					formDataJson[inputkey] = inputValue;
					break;
				case 'checkbox':
					//复选
					var checkboxObj = $('#form-'+formID+' input[name="form-'+formID+'-'+inputkey+'"]');
					if(checkboxObj.length == 1){
						if($(checkboxObj).is(':checked')){
							inputValue = 1;
						}else{
							inputValue = 0;
						}
					}else{
						if($('#form-'+formID+' input[name="form-'+formID+'-'+inputkey+'"]:checked').length > 0){
							var chkArr = [];
							$('#form-'+formID+' input[name="form-'+formID+'-'+inputkey+'"]:checked').each(function(ev){
								chkArr.push($(this).val());
							});
							inputValue = chkArr;
						}else{
							inputValue = "";
						}
					}
					formDataJson[inputkey] = inputValue;
					break;
				case 'add-select-input':
				case 'organiza-select':
					//增删一体输入框
					inputValue = $('#'+config.fullHiddenID).val();
					formDataJson[inputkey] = inputValue;
					break;
				case 'tree-select':
					//下拉框树
					inputValue = $('#form-'+formID+' #form-'+formID+'-'+inputkey).attr('nodeId');
					formDataJson[inputkey] = inputValue;
					break;
				case 'datetime':
					//日期时间组件
					var dateValue = $('#form-'+formID+' #form-'+formID+'-'+inputkey+'-date').val().trim();
					var timeValue = $('#form-'+formID+' #form-'+formID+'-'+inputkey+'-time').val().trim();
					if(typeof(timeValue) == 'undefined'){
						inputValue = dateValue;
					}else if(typeof(timeValue)=='string'){
						if(timeValue !== ''){
							inputValue = dateValue +' '+timeValue;
						}
					}
					inputValue = typeof(inputValue) == 'undefined' ? '' : inputValue;
					formDataJson[inputkey] = inputValue;
					break;
				case 'person-select':
					inputValue = nsForm.data[formID].formInput[inputkey].resultPersonArr;
					formDataJson[inputkey] = inputValue;
					break;
				case 'province-select':
					var tempElementID = 'form-'+formID+'-';
					var provinceID = tempElementID+inputkey+'-province';
					var cityID = tempElementID+inputkey+'-city';
					var areaID = tempElementID+inputkey+'-area';
					var valueJson = {};
					valueJson.province = $('#'+provinceID).val();
					var cityvalue = $('#'+cityID).val();
					if(cityvalue === null || cityvalue === ''){
						valueJson.city = '';
					}else{
						valueJson.city = cityvalue;
					}
					var areavalue = $('#'+areaID).val();
					if(areavalue === null || cityvalue === ''){
						valueJson.area = '';
					}else{
						valueJson.area = areavalue;
					}
					formDataJson[inputkey] = valueJson;
					break;
				case 'upload':
				case 'upload_single':
				case 'upload-single':
					var valueArr = formPlane.dropzoneStr[inputkey];
					valueArr = valueArr.join(',');
					formDataJson[inputkey] = valueArr;
					break;
				case 'select2':
					inputValue = $('#form-'+formID+' #form-'+formID+'-'+inputkey).val();
					if($.isArray(inputValue)){
						inputValue = inputValue.join(',');
					}
					formDataJson[inputkey] = inputValue;
					break;
				default:
					inputValue = $('#form-'+formID+' #form-'+formID+'-'+inputkey).val();
					formDataJson[inputkey] = inputValue;
					break;
			}
		}
		return formDataJson;
	}

	//返回json,或者返回false，验证不通过
	if(isNeedValid){
		var isPastValid = getFormValid();
		if(isPastValid == false){
			nsalert('验证失败，请核实填写的内容');
			return false;
		}else{
			return getJson();
		}
	}else{
		return getJson();
	}
	
}
/******************************************nsFrame*************************************************
 * nsFrame 基本Frame控制
 * 
 * @returns
 */

var nsFrame = {};
nsFrame.popContainer = {}; 	//弹框
nsFrame.popDrag = {};		//拖拽
nsFrame.minContainer = {};	//最小化窗口
//显示加载
nsFrame.loading = function(){
	public_vars.$pageLoadingOverlay.removeClass('loaded');
};
//加载完成
nsFrame.loaded= function(){
	public_vars.$pageLoadingOverlay.addClass('loaded');
};
nsFrame.setRootObj = function(rootObj){
	nsFrame.rootObj = rootObj;
};
nsFrame.showingPageArr = [];
/** 异步单页面初始化 **/
nsFrame.init = function(pageObj){
	var nameStr = 'root';
	var currentNameStr = '';
	function getName(runObj){
		$.each(runObj,function(key,value){
			nameStr = nameStr+'-'+key;
			if(value == pageObj){
				currentNameStr = nameStr;
			}
			if(typeof(value)=='object'){
				getName(value);
			}
		});
	}
	//getName(nsFrame.rootObj);
	if(typeof(pageObj)!='object'){
		nsalert("nsFrame.init()参数未定义",'error');
		return false;
	};
	if(typeof(pageObj.main)!='function'){
		nsalert("没有找到main方法，无法完成初始化",'error');
		return false;
	}
	
	pageObj.main();

	//如果存在自定义配置对象
		// 如果存在自定义配置对象
	if(typeof(pageObj.config)=='object' && typeof(pageObj.pageCode)!='undefined' ){
		nsCustomConfig.init(pageObj.config);
	}else{
		nsFrame.currentConfig = false;
	}
	nsFrame.showingPageArr.push(pageObj);
}
nsFrame.configDefault = function(config){
	if(typeof(config.container)=='undefined'){
		config.container = 'container';
	}
	if(typeof(config.filterContainer)=='undefined'){
		config.filterContainer = 'body';
	}
}
//左侧菜单点击
nsFrame.loadMeun = nsFrame.loadMenu; //保留错误名称
nsFrame.loadMenu = function(url,parameterStr,parameterMiniMenu,data){
	
	var parameterArr = parameterStr.split("-");
	for(var pIndex=0; pIndex<parameterArr.length; pIndex++){
		parameterArr[pIndex] = parseInt(parameterArr[pIndex]);
	}
	mainmenu.initNav(parameterArr[0],parameterArr[1]);
	mainmenu.setCurrentMenu(parameterArr[0],parameterArr[1]);
	//是否最小化主菜单
	if(parameterMiniMenu=="true"){
		mainmenu.setMin(true);
	}else if(parameterMiniMenu=="false"){
		mainmenu.setMin(false);
	}

	//是否有附加参数，只能以get方式转出
	if(data){
		if(typeof(data)=='string'){
			data = JSON.parse(data);
		}
		var dataStr = '';
		$.each(data, function(key,value){
			dataStr += key+'='+value;
		})
		if(url.indexOf('?')==-1){
			url += '?'+ dataStr;
		}else{
			url += dataStr;
		}
	}
	nsFrame.loadPage(url);
}
nsFrame.loadPage = function(url){
	var config = {
		url: url,
		filterContainer: "container",
		container: 	"container",
	}
	nsFrame.initPage(config);
}

//简单方式打开
nsFrame.popPage = function(url){
	var config = {url:url};
	nsFrame.popPageConfig(config);
}
//当前窗口更换页面
nsFrame.popPageChange = function(url,ev){
	var config = {
		url: 		url,
		filterContainer: "container",
		container: 	"#nsPopContainer .content",
	};
	nsFrame.initPage(config,'popPageChange');
}
//配置方式打开
nsFrame.popPageConfig = function(config){
	var initConfig = nsFrame.popContainerInit(config);
	nsFrame.popPageShow(initConfig);
}

//容器及配置初始化
nsFrame.popContainerInit = function(config){
	if(config.url){
		//初始化弹出框所用DOM和Object
		if($.isEmptyObject(nsFrame.popContainer)){
			$("body").append('<div id="nsPopContainer" class="nspop-container page-container"></div>');
			nsFrame.popContainer.init = true;
			nsFrame.popContainer.windows = {};
			nsFrame.popContainer.length = 0;
		}
	}else{
		//url是必须的，其它都是选填的
		nsalert("弹出页面的URL未指定",'error');
		return false;
	}

	var initConfig = {};
	initConfig.url = config.url;
	//宽度
	var windowWidthNum;
	if(config.width){
		if(typeof(config.width)=='number'){
			windowWidthNum = config.width;
			initConfig.width = config.width+"px";
		}else{
			if(config.width=='default'){
				windowWidthNum = 960;
				initConfig.width = '960px';
			}else if(config.width=='auto'){
				windowWidthNum = ($(window).width()-100);
				initConfig.width = windowWidthNum+"px";
			}else{
				//有配置数字
				var widthStr = config.width;
				if(widthStr.indexOf('px')>=0){
					windowWidthNum = parseInt(widthStr.substr(0,widthStr.indexOf('px')));
				}else if(widthStr.indexOf('%')>=0){
					windowWidthNum = parseInt(widthStr.substr(0,widthStr.indexOf('%')));
					windowWidthNum = parseInt($(window).width()*windowWidthNum/100);
				}
				initConfig.width = widthStr;
			}
		}
	}else{
		windowWidthNum = $(window).width()-100;
		initConfig.width = ($(window).width()-100)+"px";
	}

	//自动居中
	initConfig.left = parseInt(($(window).width()-windowWidthNum)/2)+'px';
	initConfig.top = '50px';

	//高度
	if(config.height){
		if(typeof(config.height)=='number'){
			initConfig.height = config.height+"px";
		}else{
			initConfig.height = config.height;
		}
	}else{
		//initConfig.height = ($(window).height()-100)+"px";
		initConfig.height = 'auto';
	}
	//标题
	if(config.title){
		initConfig.title = config.title;
	}else{
		initConfig.title = '';
	}
	//关闭回调函数
	if(typeof(config.closeHandler)=='function'){
		initConfig.closeHandler = config.closeHandler;
	}else{
		initConfig.closeHandler = function(){};
	}
	//加载调用函数
	if(typeof(config.loadedHandler)=='function'){
		initConfig.loadedHandler = config.loadedHandler;
	}else{
		initConfig.loadedHandler = function(){};
	}
	//加载调用函数
	if(typeof(config.data)=='object'){
		initConfig.data = config.data;
	}
	//是否有背景,默认有背景
	if(config.bg){
		initConfig.bg = config.bg;
	}else{
		initConfig.bg = true;
	}

	return initConfig;
}
//生成弹框，等待加载页面  
//containerID如果存在，则不在生成，主要用于恢复最小化窗口用
//restoreValues，则用于自动填充
nsFrame.popPageShow = function(config,containerID,restoreValues){
	if(!nsFrame.popContainer.init){
		return false;
	}
	var windowID;
	if(containerID){
		windowID = containerID;
	}else{
		function getWindowID(){
			var winID = "container-"+Math.floor(Math.random()*10000000000+1);
			if(nsFrame.popContainer.windows[windowID]){
				winID = getWindowID();
			}
			return winID;
		}
		windowID = getWindowID();
	}
	
	var windowsNum = 0; 
	$.each(nsFrame.popContainer.windows,function(key,value){
		windowsNum++;
	});
	config.id = windowID;
	config.zindex = windowsNum;
	nsFrame.popContainer.length = windowsNum+1;
	nsFrame.popContainer.windows[windowID] = {};
	nsFrame.popContainer.windows[windowID].config = config;

	var windowHTML = nsFrame.getWindowHTML(config,windowID);
	$("#nsPopContainer").append(windowHTML);
	if(config.bg){
		if($("#nsPopContainer").find(".nspop-bg").length==0){
			$("#nsPopContainer").append('<div class="nspop-bg"></div>');
		}
	}
	
	//关闭窗口
	$("#nsPopContainer #"+windowID+" .window-close").on('click',function(ev){
		var currentWindowID = $(this).closest('.nswindow').attr('id');
		nsFrame.popPageCloseByID(currentWindowID);
	});

	//最小化窗口
	/*$("#nsPopContainer #"+windowID+" .window-min").on('click',function(ev){
		var currentWindowID = $(this).closest('.nswindow').attr('id');
		nsFrame.popPageMinByID(currentWindowID);
	});*/
	var ajaxconfig = {
		containerID:windowID,
		url: config.url,
		filterContainer: "container",
		container: 	"#"+windowID+" .content",
	}
	nsFrame.initPage(ajaxconfig, "popPageShow", restoreValues);
}
nsFrame.popPageCloseByID = function(id){
	$("#nsPopContainer #"+id+" .window-close").off("click");
	$("#nsPopContainer #"+id).remove();
	nsFrame.popContainer.windows[id].config.closeHandler();
	delete nsFrame.popContainer.windows[id];
	nsFrame.popContainer.length -=1;
	if(nsFrame.popContainer.length == 0){
		if($("#nsPopContainer").find(".nspop-bg").length>0){
			$("#nsPopContainer .nspop-bg").remove();
		}
	}
}
nsFrame.popPageClose = function(){
	if($.isEmptyObject(nsFrame.popContainer.windows)){
		return false;
	}
	$.each(nsFrame.popContainer.windows, function(key,value){
		var id = key;
		nsFrame.popContainer.windows[id].config.closeHandler();
	})
	$("#nsPopContainer .window-close").off("click");
	$("#nsPopContainer").html('');
	nsFrame.popContainer.windows = {};
	nsFrame.popContainer.length = 0;
}
nsFrame.popPageMinByID = function(id){
	if($.isEmptyObject(nsFrame.minContainer)){
		nsFrame.minContainer.windows = {};
		nsFrame.minContainer.length = 0;
		$("body").append('<div id="nsMinContainer" class="nsmin-container"><div class="blocks"></div></div>');
	}
	var titleName = nsFrame.popContainer.windows[id].config.title;
	nsFrame.minContainer.windows[id] = {};
	nsFrame.minContainer.windows[id].id = id;
	nsFrame.minContainer.windows[id].html = $("#nsPopContainer #"+id).html();
	var values = {};
	var valuesDoms = $("#nsPopContainer #"+id+' .content [id]');
	for(var valueIndex = 0; valueIndex<valuesDoms.length; valueIndex++){
		if($(valuesDoms[valueIndex]).val()!=''){
			values[$(valuesDoms[valueIndex]).attr('id')] = {
				value:$(valuesDoms[valueIndex]).val(),
				nstype:$(valuesDoms[valueIndex]).attr('nstype')
			}
		}
	}
	valuesDoms = null;
	nsFrame.minContainer.windows[id].values = values
	nsFrame.minContainer.windows[id].config =  nsFrame.popContainer.windows[id].config;
	nsFrame.minContainer.length = nsFrame.minContainer.length+1;

	//$("#nsPopContainer #"+id+" .window-min").off("click");
	$("#nsPopContainer #"+id+" .window-close").off("click");
	$("#nsPopContainer #"+id).remove();

	nsFrame.popContainer.windows[id] = ''
	delete nsFrame.popContainer.windows[id];
	nsFrame.popContainer.length -=1;
	if(nsFrame.popContainer.length == 0){
		if($("#nsPopContainer").find(".nspop-bg").length>0){
			$("#nsPopContainer .nspop-bg").remove();
		}
	}
	$('#nsMinContainer .blocks').append('<div wid="'+id+'"  class="min-block">'+titleName+'</div>')
	$('#nsMinContainer [wid="'+id+'"]').on('click',function(ev){
		var wid = $(ev.target).attr('wid');
		nsFrame.minOpenPage(wid);
	})
}
//恢复最小化窗口
nsFrame.minOpenPage = function(containerID){
	var config = nsFrame.minContainer.windows[containerID].config;
	var values = nsFrame.minContainer.windows[containerID].values;
	nsFrame.popPageShow(config, containerID, values);
	//$('#nsPopContainer #'+containerID).html(nsFrame.minContainer.windows[containerID].html);
	//var values = nsFrame.minContainer.windows[containerID].values;
	$('#nsMinContainer [wid="'+containerID+'"]').off('click');
	$('#nsMinContainer [wid="'+containerID+'"]').remove();
	delete nsFrame.minContainer.windows[containerID];
	nsFrame.minContainer.length -=1;
}
nsFrame.getWindowHTML = function(config,windowID){
	var windowHeight = config.height=='auto'?'':"height:"+config.height+"; ";
	var slideWidth = $(".sidebar-menu").width();
	var windowWidth = "width:"+config.width+"; ";
	var currentWindowLeft, currentWindowTop; 	//已经打开窗口的位置
	var windowLeft,windowTop;				//新窗口的位置
	if(nsFrame.popContainer.length>=2){
		//是否是第二个窗口，如果是，就要不能跟第一个重合
		$.each(nsFrame.popContainer.windows,function(key,value){
			if(key!=windowID){
				currentWindowLeft = $('#'+key).position().left;
				currentWindowTop = $('#'+key).position().top;
				windowLeft = (currentWindowLeft+'px')==config.left?(currentWindowLeft+30)+'px':config.left;
				windowTop = (currentWindowTop+'px')==config.top?(currentWindowTop+30)+'px':config.top;
			}
		})
	}
	if(typeof(windowLeft)=='undefined'){
		windowLeft  = config.left;
		windowTop = config.top;
	}
	//window的高和$(document)
	if($(document).scrollTop()>0){
		if($(window).height() != $(document).height()){
			var tempHeight = $(document).height() - $(window).height();
			if(typeof(windowTop) == 'string'){
				if(windowTop.indexOf('px')>-1){
					windowTop = windowTop.substr(0,windowTop.length-2);
					windowTop = Number(windowTop);
				}
			}
			windowTop = windowTop + tempHeight +'px';
		}
	}
	windowLeft = 'left:'+windowLeft+"; ";
	windowTop = 'top:'+windowTop+"; ";
	var zindexNum = config.zindex+801;
	var zindex = "z-index:"+(config.zindex+801)+"; ";
	var windowTitle = config.title ? config.title :'';
	var styleStr = 'style="'+windowHeight+windowWidth+windowLeft+windowTop+zindex+'"';
	//<div class="window-min"><i class="fa fa-minus"></i></div>
	var containerHtml = '<div class="window-title">'+windowTitle+'</div><div class="window-close">x</div><div class="content"></div>';
	var windowHtml = '<div id="'+windowID+'" class="nswindow main-content table-content" '+styleStr+'>'+containerHtml+'</div>';
	return windowHtml;
}
nsFrame.initPage = function(config,popMode,restoreValues){
	var containerID;
	if(popMode=='popPageShow'){
		containerID = config.containerID+" .content";
	}else if(popMode=='popPageChange'){
		containerID = config.containerID+" .content";
	}else{
		nsFrame.configDefault(config);
		containerID = "container-more-"+Math.floor(Math.random()*10000000000+1);
		$(config.container).attr('id',containerID);
	}
	var configMethod = config.method ? config.method : 'GET';
	var configParams = config.params ? config.params : '';
	$.ajax(
	{
		url: config.url,
		type:configMethod,
		data:configParams,
		cache:false,
		success:function(data){
			var isSuccess = true;
			if(typeof(data) == 'object'){
				isSuccess = data.success;
			}
			if(isSuccess){
				dataObj = data;
				var formatStr = data;
				formatStr = nsFrame.filterCode(formatStr,config.filterContainer);
				var containerDom = $("#"+containerID);
				containerDom.html(formatStr);
				//移除无用DOM和重复DOM
				containerDom.find("#dialog-more").remove();
				containerDom.find("#placeholder-popupbox").remove();
				containerDom.find('.page-loading-overlay').remove();
				containerDom.find('.settings-pane').remove();
				//拖动窗口
				if(popMode=='popPageShow' || popMode=='popPageChange'){
			
					/*containerDom.find('.page-title.nav-form').on("mousedown",function(event){
						var winID = $(this).closest('.nswindow').attr('id');
						if(typeof(winID)=='string'){
							var $window = $("#"+winID);
							nsFrame.popDrag.id = winID;
							nsFrame.popDrag.mDown = true;
							var downX = event.pageX;
							var downY = event.pageY;
							var positionX = $window.position().left;
							var positionY = $window.position().top;
							$(document).on('mousemove',function(ev){
								var moveX = positionX+ev.pageX-downX;
								var moveY = positionY+ev.pageY-downY;
								if(moveX < 10){
									moveX = 10;
									positionX = $window.position().left;
								}
								if(moveX > ($(window).width()-$window.width())-10){
									moveX = $(window).width()-$window.width()-10;
								}

								if(moveY < 10){
									moveY = 10;
								}
								if(moveX > ($(window).height()-$window.height())-10){
									moveY = $(window).height()-$window.height()-10;
								}
								$window.css({'left':moveX, 'top':moveY});
							});
							$(document).on('mouseup',function(ev){
								$(document).off('mousemove');
								$(document).off('mouseup');
							});
						}
					});*/
				}
				//弹框新开页面需要计算高度和位置，并且调用loaded函数
				if(popMode=='popPageShow'){
					if(nsFrame.popContainer.windows[config.containerID].config.height == 'auto'){
						var cHeight = containerDom.height();
						if(cHeight<300){
							cHeight = 300;
						}else if(cHeight>($(window).height()-100)){
							cHeight = $(window).height()-100;
						}
						var cHeightStyle = ' height:'+cHeight+'px;';
						var cStyle = $("#"+config.containerID).attr('style')+cHeightStyle;
						$("#"+config.containerID).attr('style',cStyle);
					}
					if(typeof(restoreValues)!='undefined'){
						$.each(restoreValues,function(key,value){
							commonConfig.setKeyValue(key,value.value,value.nstype);
						})
					}
					if(typeof(nsFrame.popContainer.windows[config.containerID].config.loadedHandler) == 'function'){
						var loadedHandler = nsFrame.popContainer.windows[config.containerID].config.loadedHandler;
						loadedHandler();
					}
				}
			}else{
				var errorMessage = data.msg?data.msg:'返回数据报错';
				nsAlert(errorMessage);
			}
		}
	});
}
nsFrame.filterCode = function(filterHtml,tag){
	var firstTag = filterHtml.substr(filterHtml.indexOf("<"+tag), 100);
	firstTag = firstTag.substring(0, firstTag.indexOf(">")+1);
	var lastTag = filterHtml.substr(filterHtml.lastIndexOf(tag+">")-100+tag.length+1,100);
	lastTag = lastTag.substr(lastTag.lastIndexOf("<"),lastTag.length);
	filterHtml = filterHtml.substring(filterHtml.indexOf(firstTag)+firstTag.length, filterHtml.lastIndexOf(lastTag));
	return filterHtml;
}
var demos = {};
demos.form = {};
demos.frame = {};
demos.ui = {};
demos.table = {};
nsFrame.setRootObj(demos);

/**
 * 设置页面布局
 * 
 * nsLayout.data 布局对象
 */
var nsLayout = {};
nsLayout.data = {};
//转化字符串成为JSON对象 格式是"a:b,c:d"->{a:b,c:d},字符串中不需要引号和双引号
nsLayout.convertOptions = function(optionsStr){
	if(typeof(optionsStr)=='undefined'){
		//如果配置字符串未定义则直接返回默认
		return {'position':'default'};
	}else{
		return nsVals.convertOptions(optionsStr);
	}
}
nsLayout.setNavDefaultsOptions = function(options){

}
nsLayout.setPanelDefaultOptions = function(options){
	var formatOptions = options;
	
	if(options.position){
		//如果位置存在则暂时无需处理
	}else{
		formatOptions.position = 'default';
	}
	if(typeof(formatOptions.col)=='undefined'){
		formatOptions.col = 12;
	};
	formatOptions.beforeHeight = this.height;  					//之前组件占用的高度
	formatOptions.rowId = this.rowNum;  						//第几行
	formatOptions.colId = this.colNum-this.rowNum*12; 	 		//第几列
	this.colNum += formatOptions.col;
	if(this.colNum%12==0){
		this.rowNum++;
		if(formatOptions.height){
			if(formatOptions.height!='auto'){
				this.height += formatOptions.height; //已占用高度
			}
		}else{
			this.height += 30;
		}
	}
	return formatOptions;
}
nsLayout.setPanelTabsDefaultOptions = function(tabsObj){
	
	var tabArrs = tabsObj.container.children('tab');
	tabsObj.isTabWidth = true;
	if(tabArrs.length>0){
		tabsObj.tab = {};
		var tabClassWidth = [];
		var tabClassNumber = 0;//设置宽度的总和相加是否为100%
		for(var tabI = 0; tabI<tabArrs.length; tabI++){
			var $tab = $(tabArrs[tabI]);
			var tab = {};
			tab.container = $tab;
			if(typeof($tab.attr('ns-id'))=='undefined'){
				tab.nsId = 'tab'+tabI;
				tab.id = tabsObj.id+'-'+tab.nsId;
			}else{
				tab.nsId = $tab.attr('ns-id');
				tab.id = tabsObj.id+'-'+tab.nsId;
			}
			tab.optionsStr = $tab.attr("ns-options");
			tab.options = nsLayout.convertOptions(tab.optionsStr);
			if(typeof(tab.options.title)=='undefined'){
				tab.options.title = tab.nsId;
			}
			if(typeof(tab.options.width) == 'number'){
				tabClassNumber += tab.options.width;
			}else{
				tabClassWidth.push(tabI);
			}
			tabsObj.tab[tab.nsId] = tab;
		}
		if(tabClassNumber > 100){
			//tab宽大于100抛出异常
			tabsObj.isTabWidth = false;
		}
		if(tabClassNumber < 100){
			//小于100,判断一下是否是有未设置宽度的tab,如果没有则抛出异常，否则未设置的宽度tab自适应列宽
			if(tabClassWidth.length > 0){
				//有未设置的宽度
				var tempWidth = 100 - tabClassNumber;
				var widthPercent = tempWidth / tabClassWidth.length;
				widthPercent = parseFloat(widthPercent.toFixed(2));
				for(var classI = 0; classI < tabArrs.length; classI++){
					if($.inArray(classI,tabClassWidth)>-1){
						var $tab = $(tabArrs[classI]);
						var tab = {};
						tab.container = $tab;
						if(typeof($tab.attr('ns-id'))=='undefined'){
							tab.nsId = 'tab'+tabI;
							tab.id = tabsObj.id+'-'+tab.nsId;
						}else{
							tab.nsId = $tab.attr('ns-id');
							tab.id = tabsObj.id+'-'+tab.nsId;
						}
						tab.optionsStr = $tab.attr("ns-options");
						tab.options = nsLayout.convertOptions(tab.optionsStr);
						if(typeof(tab.options.title)=='undefined'){
							tab.options.title = tab.nsId;
						}
						tab.options.width = widthPercent;
						tabsObj.tab[tab.nsId] = tab;
					}
				}
			}else{
				//tab宽小于100抛出异常
				tabsObj.isTabWidth = false;
			}
		}
	}
	return tabsObj;
}
nsLayout.init = function(layoutID,pageDom){
	//合法性验证
	if(typeof(layoutID)!='string'){
		nsalert("参数只能是ID字符串",'error');
		return false;
	}
	var $container = $("#"+layoutID);
	if($.isEmptyObject($container)||$container.length==0){
		nsalert("nsLayout.init()参数："+layoutID+" 错误，无法找到指定ID对应的DOM",'error');
		return false;
	}
	nsLayout.data[layoutID] = {};
	var layoutData = nsLayout.data[layoutID];
	layoutData.id = layoutID;
	layoutData.container = $container;
	layoutData.optionsStr = $container.attr('ns-options');
	layoutData.options = nsLayout.convertOptions(layoutData.optionsStr);
	//是否支持自定义配置
	if(layoutData.options.custom){
		layoutData.customConfig = {};
	}else{
		layoutData.customConfig = false;
	}
	//处理导航栏部分
	var $nav = $container.children('nav');
	if($nav.length>1){
		nsalert("主导航只能有一个",'error');
		return false;
	}else if($nav.length == 1){
		//处理导航栏数据
		layoutData.nav = {};
		layoutData.nav.nsId = $nav.attr('ns-id');
		layoutData.nav.id = layoutData.id+"-"+layoutData.nav.nsId;
		layoutData.nav.initContainer = $nav;
		if(typeof($nav.attr('ns-config'))!='undefined'){
			try{
				var package = $container.attr('ns-package')
				var config = $nav.attr('ns-config');
				if(config.indexOf('nav:')){
					config = config.replace(/nav:/,'');
				}
				config = $.trim(config)
				if(package){
					config = package+'.'+config;
				}
				layoutData.nav.config = eval(config);
			}catch(error){
				var errInfo = "导航栏-按钮参数错误：" + error.message + "\n\n";
				nsalert(errInfo,'error');
			}
		}
		layoutData.nav.options = nsLayout.convertOptions($nav.attr("ns-options"));
		nsLayout.initNav(layoutData);
	}else{
		//没有导航栏数据
	}
	var htmlCodeArr = [];
	var planeRowsArr = [];
	this.rowNum = 0;
	this.colNum = 0;
	this.height = 0;

	//处理普通面板
	var panels = $container.children('panel');
	if(panels.length<1){
		//没有面板组件
	}else{
		layoutData.panels = {};
		for(var panelIndex=0; panelIndex<panels.length; panelIndex++){
			var $panel = $(panels[panelIndex]);
			var panel = {};
			panel.nsId = $panel.attr("ns-id");
			panel.id = layoutData.id+'-'+panel.nsId;
			panel.container = $panel;
			panel.optionsStr = $panel.attr('ns-options');
			panel.options = nsLayout.convertOptions(panel.optionsStr);
			panel.options = nsLayout.setPanelDefaultOptions(panel.options);
			panel.config = nsLayout.getPanelConfig($container, $panel);
			layoutData.panels[panel.id] = panel;
			var outputPanelHtml = nsLayout.getPanelHtml(layoutData,panel);
			panel.beforeHeight = this.height;
			htmlCodeArr.push(outputPanelHtml);
		}
	}
	
	//tabs 普通tabs
	var tabs =  $container.children('tabs');
	if(tabs.length<1){
		//没有Tab组件
	}else{
		layoutData.tabs = {};
		if(typeof(layoutData.panels)=='undefined'){
			layoutData.panels = {};
		}
		for(var tabsI=0; tabsI<tabs.length; tabsI++){
			var $tabs = $(tabs[tabsI]);
			var tabs = {};
			tabs.nsId = $tabs.attr('ns-id');
			tabs.id = layoutData.id+"-"+tabs.nsId;
			tabs.container = $tabs;
			tabs.optionsStr = $tabs.attr('ns-options');
			tabs.options = nsLayout.convertOptions(tabs.optionsStr);
			tabs.options = nsLayout.setPanelDefaultOptions(tabs.options);
			tabs = nsLayout.setPanelTabsDefaultOptions(tabs); //获取单独的属性
			layoutData.tabs[tabs.nsId] = tabs;

			$.each(tabs.tab,function(key,value){
				var tabobj = tabs.tab[key];
				tabobj.config = nsLayout.getPanelConfig($container, value.container);
				layoutData.panels[tabobj.id] = tabobj;
			})
			var outputTabsHtml = nsLayout.getTabsHtml(tabs);
			htmlCodeArr.push(outputTabsHtml);
		}
	}
	//输出HTML
	var outputHTMLCode = '';
	if(htmlCodeArr.length>0){
		for(var codeI=0; codeI<htmlCodeArr.length; codeI++){
			outputHTMLCode+=htmlCodeArr[codeI];
		}
		var rowClass = '';
		if(layoutData.options.type){
			rowClass = layoutData.options.type;
		}
		layoutData.rowTotal = this.rowNum;
		layoutData.colTotal = this.colNum;
		//layoutData.height = this.height;
		delete this.rowNum;
		delete this.colNum;
		delete this.height;

		outputHTMLCode = 
			'<div class="row layout-planes '+rowClass+'" id="'+layoutData.id+'">'
				+ outputHTMLCode
			+'</div>';
		$container.after(outputHTMLCode);

		if(layoutData.options.custom){
			//允许自定义配置
			layoutData.customConfig.pageCode = layoutData.id;
			$.each(layoutData.panels,function(panelID,panelData){
				if(panelData.config){
					try{
						var configObj = {};
						configObj = eval(panelData.config.value);
						configObj.id = panelData.id;
						//处理表单
						if(panelData.config.type=='form'){
							if(layoutData.customConfig.formJson){
								//如果有formJson
							}else{
								//第一个formJson，先新建
								layoutData.customConfig['formJson'] = [];
							}
							layoutData.customConfig.formJson.push(configObj);
						//处理table
						}else if(panelData.config.type=='table'){
							if(layoutData.customConfig.tableJson){ 
								//如果有tableJson
							}else{
								//第一个tableJson，先新建
								layoutData.customConfig['tableJson'] = [];
								layoutData.customConfig['tableConfig'] = {};
							}
							var columnUser = {};
							columnUser.id = 'table-'+configObj.id;
							columnUser.configTitle = configObj.data.configTitle;
							columnUser.columns = configObj.columns;

							layoutData.customConfig.tableConfig[columnUser.id] = configObj
							layoutData.customConfig.tableJson.push(columnUser);
							//表格组件需要添加table标签
							var panelHeight = $("#"+panelData.id).height()
							var tabelHtml = 
							'<div class="table-responsive" style="height:'+panelHeight+'px;">'
								+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" '
								+'id="table-'+configObj.id+'">'
								+'</table>'
							+'</div>'
							$("#"+configObj.id+' .panel-body').html(tabelHtml);
						}else if(panelData.config.type=='tree'){
							//tree类型添加HTML
							if(layoutData.customConfig.treeJson){ 
								//如果有treeJson
							}else{
								//第一个treeJson，先新建
								layoutData.customConfig['treeJson'] = {};
							}
							var treeHtml = 
							'<div id="tree-'+configObj.id+'"></div>'
							$("#"+configObj.id+' .panel-body').html(treeHtml);
							configObj.id = 'tree-'+panelData.id;
							configObj.isLayout = true;
							nsTree.init(configObj);
						}else if(panelData.config.type == 'ztree'){
							configObj.id = panelData.id;
							treeSelectorUI.treePlane.init(configObj);
						}
					}catch(error){
						var errInfo = "面板"+panelData.nsId +" config参数错误：<br>" + error.message + "\n\n";
						nsalert(errInfo,'error');
					}
					
				}
			});
			nsCustomConfig.init(layoutData.customConfig);
		}else{
			//不允许自定义配置
			$.each(layoutData.panels,function(panelID,panelData){
				if(panelData.config){
					var configObj;
					//try{

						configObj = eval(panelData.config.value);
						configObj.id = panelData.id;
						if(panelData.config.type=='form'){
							nsForm.init(configObj,'.panel-body');
						}else if(panelData.config.type=='table'){
							configObj.data.tableID = 'table-'+panelData.id;
							var containerConfig = {};
							containerConfig.height = $("#"+panelData.id).height();
							var tabelHtml = 
							'<div class="table-responsive" style="height:'+containerConfig.height+'px;">'
								+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" '
								+'id="table-'+panelData.id+'">'
								+'</table>'
							+'</div>'
							$("#"+panelData.id+' .panel-body').html(tabelHtml);
							
							baseDataTable.init(configObj.data, configObj.columns, configObj.ui, configObj.btns, containerConfig);
						}else if(panelData.config.type=='tree'){
							//tree类型添加HTML
							if(layoutData.customConfig.treeJson){ 
								//如果有treeJson
							}else{
								//第一个treeJson，先新建
								layoutData.customConfig['treeJson'] = {};
							}
							var treeHtml = '<div id="tree-'+configObj.id+'"></div>';
							$("#"+panelData.id+' .panel-body').html(treeHtml);
							configObj.id = 'tree-'+panelData.id;
							configObj.isLayout = true;
							nsTree.init(configObj);
						}else if(panelData.config.type == 'ztree'){
							configObj.id = panelData.id;
							treeSelectorUI.treePlane.init(configObj);
						}
					/*}catch(error){
						var errInfo = "面板"+panelData.nsId +" config参数错误：" + error.message + "\n\n";
						nsalert(errInfo,'error');
					}*/
					
				}
			});
		}
		nsLayout.resizeHandler();
	}
}
nsLayout.getPanelConfig = function($container,$panel){
	if(typeof($panel.attr('ns-config'))!='undefined'){
		var package = $container.attr('ns-package')
		var config = $panel.attr('ns-config');
		//统一写法，支持在nav标签里写nav：，但是要去掉才能用
		if(config.indexOf('nav:')){
			config = config.replace(/nav:/,'');
		}
		var configType = config.substr(0,config.indexOf(":"));
		var configStr = config.substr(config.indexOf(":")+1,config.length);
		configType = $.trim(configType);
		configStr = $.trim(configStr);
		package = $.trim(package);
		if(package){
			configStr = package+'.'+configStr;
		}
		var configJson = 
		{
			"type":configType,
			"value":configStr
		};
		return configJson;
	}else{
		return false;
	}
}
//页面发生变化调用，主要用于计算自动高度
nsLayout.resizeHandler = function(){
	$(window).resize(function(){
		//修改autoHeight面板的高度样式
		var $autoHeightArr = $('.nspanel.autoHeight');
		for(var i=0; i<$autoHeightArr.length; i++){
			var $autoHeight = $($autoHeightArr[i]);
			var styleStr = $autoHeight.attr('style');
			var heightStyleStr = styleStr.substr(styleStr.indexOf('height:')+7,10);
			heightStyleStr = heightStyleStr.substr(0,heightStyleStr.indexOf('px'));
			if(parseInt(heightStyleStr)>0){
				var heightNum = nsVals.containerHeight();
				var $layout = $autoHeight.parent();
				var layoutData = nsLayout.data[$layout.attr('id')];
				var panelData = layoutData.panels[$autoHeight.attr('id')];

				if(layoutData.options.type=='nospace'){
					heightNum = heightNum - panelData.options.beforeHeight -2;
				}else{
					heightNum = heightNum - panelData.options.beforeHeight -20 - panelData.options.rowId*10;
				}
				//处理行间距
				if(typeof(panelData.options.afterHeight)=='number'){
					if(layoutData.options.type=='nospace'){
						heightNum = heightNum-panelData.options.afterHeight;
					}else{
						var afterRowNum = 0
						if(typeof(panelData.options.afterRow)=='number'){
							afterRowNum = panelData.options.afterRow;
						}
						heightNum = heightNum-panelData.options.afterHeight-afterRowNum*10;
					}
				}
				styleStr = styleStr.replace('height:'+heightStyleStr,'height:'+heightNum);
				$autoHeight.attr('style',styleStr);
			}
		}
	});
}
//初始化nav
nsLayout.initNav = function(layoutData){
	function resetModalBtns(btnsConfig){
	//修改按钮组输出类型，第一组是文字按钮，从第二组开始都是图标按钮
		for(var arrI = 0; arrI<btnsConfig.btns.length; arrI++){
			if(arrI==0){
				//第一组暂时不动，保持原样，以后会对数据进行过滤
			}else{
				//之后的组只显示图标
				for(var btnI=0; btnI<btnsConfig.btns[arrI].length; btnI++){
					btnsConfig.btns[arrI][btnI].isOnlyIcon = true;
				}
			}
		}
	}
	//如果没有指定位置，则默认为default
	if(typeof(layoutData.nav.options.position)!='string'){
		layoutData.nav.options.position = 'default';
	}
	var layoutType = layoutData.options.type;
	if(typeof(layoutType)!='string'){
		layoutType = 'standard';
	}
	var navHtml = '';
	if(layoutData.nav.options.position=='default'){
		navHtml = '<div class="page-title nav-form" id="'+layoutData.nav.id+'"></div>'
	}
	layoutData.container.before(navHtml);
	layoutData.nav.config.id = layoutData.nav.id;
	if(layoutType=='standard'){
		//如果是普通页面
		if(layoutData.nav.config){
			if(layoutData.options.custom){
				//如果定制
				layoutData.customConfig.nav = [layoutData.nav.config];
			}else{
				nsNav.init(layoutData.nav.config);
			}
		}
	}else if(layoutType=='modal'){
		//如果是模态页面
		if(typeof(layoutData.nav.options)!='object'){
			layoutData.nav.options = {};
		}
		//自定义按钮配置项
		if(layoutData.options.custom){
			layoutData.nav.config.customContainer = {pageCode: layoutData.id}; //初始化自定义配置对象
			//默认跟随layout总体配置
			layoutData.nav.config.isCustom = true;
			
			if(typeof(layoutData.nav.options.custom)!='boolean'){
				//不设置是否控制则跟随layout的控制,则视为允许配置
				layoutData.nav.options.isConfig = true;
			}else{
				layoutData.nav.options.isConfig = layoutData.nav.options.custom;
			}
			//如果是要控制则配置所需项目
			if(layoutData.nav.options.isConfig == true){
				layoutData.nav.config.customContainer.nav = true;
			}
		}
		//搜索框容器
		//0 是无 none，1是简单模式 simple，2是条件模式 select，3是高级模式 advance
		if(typeof(layoutData.nav.config.search)!='object'){
			//默认是1，默认打开
			layoutData.nav.options.searchClassID = 1;
			layoutData.nav.config.search = {
				mode: 'simple',
				placeholder: '',
				info:''
			};
		}else{
			if(typeof(layoutData.nav.config.search.mode)!='string'){
				nsalert('搜索模式配置错误(search.mode)','error');
				layoutData.nav.config.search.mode = 'simple';
			}
		}
		//layout的参数options.searchMode
		layoutData.nav.options.searchMode = layoutData.nav.config.search.mode;
		//修改按钮状态
		resetModalBtns(layoutData.nav.config); 
		layoutData.nav.config.pageCode = layoutData.id;
		layoutData.nav.config.modalClass = layoutData.options.modalClass;
		switch(layoutData.options.modalClass){
			case 'table':
				nsNav.init(layoutData.nav.config);
				break;
			default:
				nsalert('页面模态错误','error');
				break;
		}
		
	}
}
nsLayout.getPanelHtml = function(layoutData,panelData,type){
	var panelHtml = '';
	var style = '';
	var autoClass = '';
	if(panelData.options.height){
		if(panelData.options.height=='auto'){
			autoClass = ' autoHeight';
			var heightNum = nsVals.containerHeight();
			if(layoutData.options.type=='nospace'){
				heightNum = heightNum - this.height -2;
			}else{
				heightNum = heightNum - this.height -20 - panelData.options.rowId*10;
			}
			//处理行间距
			if(typeof(panelData.options.afterHeight)=='number'){
				if(layoutData.options.type=='nospace'){
					heightNum = heightNum-panelData.options.afterHeight;
				}else{
					var afterRowNum = 1
					if(typeof(panelData.options.afterRow)=='number'){
						afterRowNum = panelData.options.afterRow;
					}
					heightNum = heightNum-panelData.options.afterHeight-afterRowNum*10;
				}
			}
			style += 'height:'+heightNum+'px; ';
		}else if(typeof(panelData.options.height)=='number'){
			style += 'height:'+panelData.options.height+'px; ';
		}else{
			style += 'height:'+panelData.options.height+'; ';
		}
	}
	if(panelData.options.width){
		if(typeof(panelData.options.width)=='number'){
			style += 'width:'+panelData.options.width+'px; ';
		}else{
			style += 'width:'+panelData.options.width+'; ';
		}
	}
	var typeClass = ' nspanel';
	if(type){
		typeClass+=' '+type; //暂时不用了
	}
	var borderClass = ''
	if(panelData.options.border){
		borderClass = " border-"+panelData.options.border;
	}
	var colClass = 'col-xs-12 col-sm-'+panelData.options.col;
	var panelType = 'panel-form';

	var layoutTypeClass = '';
	if(panelData.config.type){
		layoutTypeClass = ' layout-'+panelData.config.type;
	}
	switch(panelData.config.type){
		case 'table':
			panelType = panelType+' panel-table';
			break;
	}
	var panelBodyHtml = '<div class="panel panel-default '+panelType+'"><div class="panel-body"></div></div>';
	if(panelData.options.position=='default'){
		panelHtml = '<div id="'+panelData.id+'" class="'+colClass+typeClass+layoutTypeClass+borderClass+autoClass+'" style="'+style+'" >'+panelBodyHtml+'</div>';
	}
	return panelHtml;
}
nsLayout.initPanels = function(data,panelshtml){
	var sizeClass = "";
	if(data.options.size=="standard"){
		sizeClass = 'standard'
	}
	var rowHtml = '<div class="row '+sizeClass+'">'+panelshtml+'</div>'
	data.container.after(rowHtml);
}
nsLayout.getPanelTabsHtml = function(data){
	var tabsHtml = "";
	var tabTitleHtml = '';
	
	if(data.tab){
		var tabHtml = '';
		var tabNavHtml = '';
		var tabIndex = 0;
		$.each(data.tab,function(key,value){
			var navActiveClass = '';
			var tabActiveClass = '';
			if(tabIndex==0){
				navActiveClass = ' class="active"';
				tabActiveClass = ' active'
				tabIndex++;
			}
			tabHtml += '<div class="tab-pane'+tabActiveClass+'" id="'+value.id+'"></div>';
			tabNavHtml +='<li'+navActiveClass+'><a href="#'+value.id+'" data-toggle="tab">'+value.options.title+'</a></li>';
		});
		tabTitleHtml =
			'<div class="panel-options">'
				+'<ul class="nav nav-tabs">'
					+tabNavHtml
				+'</ul>'
			+'</div>';
		tabHtml = 
			'<div class="panel-body">'	
				+'<div class="tab-content">'
					+tabHtml
				+'</div>'
			+'</div>'
		tabsHtml+=tabHtml;
	}
	//标题
	if(data.options.title){
		tabTitleHtml = 
		'<div class="panel-heading">'
			+'<h3 class="panel-title">'+data.options.title+'</h3>'
			+tabTitleHtml
		+'</div>';
	}
	tabsHtml = 
		'<div class="panel panel-default panel-tabs" id="'+data.id+'">'
			+tabTitleHtml
			+tabsHtml
		+'</div>'
	var bgClass = '';
	if(data.options.bg=='none'){
		bgClass = 'nspanel-nobg';
	}
	var colClass = 'col-xs-12 col-sm-'+data.options.col;
	tabsHtml = 	'<div class="'+colClass+'  nspanel nspanel-tab '+bgClass+'">'+tabsHtml+'</div>'
	return tabsHtml;
}
nsLayout.getTabsHtml = function(data){
	var tabsHtml = "";
	var tabTitleHtml = '';
	if(data.tab){
		var tabHtml = '';
		var tabNavHtml = '';
		var tabIndex = 0;
		$.each(data.tab,function(key,value){
			var navActiveClass = '';
			var tabActiveClass = '';
			if(tabIndex==0){
				navActiveClass = ' class="active"';
				tabActiveClass = ' active'
				tabIndex++;
			}
			var tabClassStr = '';
			if(data.isTabWidth){
				tabClassStr = 'style="width:'+value.options.width+'%;"';
			}
			tabHtml += '<div class="tab-pane'+tabActiveClass+'" id="'+value.id+'"><div class="panel panel-default panel-form"><div class="panel-body"></div></div></div>';
			tabNavHtml +='<li '+navActiveClass+' '+tabClassStr+'><a href="#'+value.id+'" data-toggle="tab">'+value.options.title+'</a></li>';
		});
		tabNavHtml =
			'<ul class="nav nav-tabs nav-tabs-justified">'
				+tabNavHtml
			+'</ul>';
		var tableHeightStyle = '';
		if(data.options.height){
			tableHeightStyle = 'height:'+(data.options.height-30)+'px;'
		}
		tabHtml = 
			'<div class="tab-content" style="'+tableHeightStyle+'">'
				+tabHtml
			+'</div>';
		tabsHtml+=tabHtml;
	}
	
	tabsHtml = tabNavHtml+tabsHtml;
	return tabsHtml;
}
/***************************************************************************************************
 * Alert
 * 
 * @returns
 */
toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "rtl": false,
  "positionClass": "toast-top-right",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": 200,
  "hideDuration": 500,
  "timeOut": 2000,
  "extendedTimeOut": 1000,
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
/***************************************************************************************************
 * nsalert('提示信息','error','plus')
 * 后两项为选填，iconStr参数只能使用fa fa-系列的图标
 * @returns
 */
function nsalert(str,stateStr,iconStr,timer){
	if(typeof(str)!='string'){
		nsalert("nsalert传入参数错误",'error');
		return false;
	};

	var icon = '';
	var state = '';
	
	//计算默认值
	if(str.indexOf("成功")>-1||str.indexOf("完成")>-1){
		icon = '<i class="fa fa-check"></i> ';
		state = 'success';
	}else if(str.indexOf("失败")>-1||str.indexOf("错误")>-1||str.indexOf("error")>-1||str.indexOf("有误")>-1){
		icon = '<i class="fa fa-warning"></i> ';
		state = 'error';
	}else if(str.indexOf("提醒")>-1||str.indexOf("警告")>-1||str.indexOf("提示")>-1||str.indexOf("无法")>-1||str.indexOf("禁止")>-1){
		icon = '<i class="fa fa-warning"></i> ';
		state = 'warning';
	}
	//有iconStr参数
	if(typeof(iconStr) != 'undefined'){
		icon = '<i class="fa fa-'+iconStr+'"></i> ';
	}
	//有stateStr参数
	if(typeof(stateStr) != 'undefined'){
		state = stateStr;
	}
	if(state==''){
		state = 'info';
	}
	if(icon==''){
		if(state == "error"||state == "warning"){
			icon = '<i class="fa fa-warning"></i> ';
		}else if(state == "success"){
			icon = '<i class="fa fa-check"></i> ';
		}else if(state == "info"){
			icon = '<i class="fa fa-comment"></i> ';
		}
	}
	var alertStr = icon+str;

	var tempTimer = 2000;
	if(timer){
		tempTimer = timer;
	}
	toastr.options.timeOut = tempTimer;
	toastr.options.extendedTimeOut = 1000;
	switch(state){
		case "success":
			toastr.success(alertStr);
			break;
		case "info":
			toastr.info(alertStr);
			break;
		case "warning":
			toastr.warning(alertStr);
			break;
		case "error":
			toastr.error(alertStr);
			break;
	}
}
var nsAlert = nsalert;
/***************************************************************************************************
 * nsconfirm('提示信息',function,'error')
 * @returns true/false
 */
function nsalertbtn(str,handler,stateStr){
	toastr.options.timeOut = 0;
	toastr.options.extendedTimeOut = 0;
	var randomCode = parseInt(Math.random()*100000+1);
	var confirmStr = 
		'<div class="nsconfirm">'
			+'<div class="message">'
			+str
			+'</div>'
			+'<div class="btn-group">'
				+'<button type="button" id="confirm-btn-ok-'+randomCode+'" class="btn btn-white">'
					+'确认'
				+ '</button>'
				+'<button type="button" id="confirm-btn-cancel-'+randomCode+'" class="btn btn-white">'
					+'取消'
				+ '</button>'
			+'</div>'
		+'</div>'
	if(typeof(stateStr)=='string'){

	}else{
		stateStr = 'info';
	}
	switch(stateStr){
		case "success":
			toastr.success(confirmStr);
			break;
		case "info":
			toastr.info(confirmStr);
			break;
		case "warning":
			toastr.warning(confirmStr);
			break;
		case "error":
			toastr.error(confirmStr);
			break;
	}
	toastr.options.timeOut = 2000;
	toastr.options.extendedTimeOut = 1000;
	$('#confirm-btn-ok-'+randomCode).on('click',function(){
		$(this).off('click');
		handler(true);
	});
	$('#confirm-btn-cancel-'+randomCode).on('click',function(){
		$(this).off('click');
		handler(false);
	});
}
var nsConfirm = nsconfirm;

/**************tree 初始化操作**************************/
treeUI.componentSelectPlane = function(formID,treeSelectJson){
	for(var treeId in treeSelectJson){
		treeUI.init(formID,treeSelectJson[treeId]);
	}
}
treeUI.init = function(formID,ztreeJson){
	var inputID = 'form-'+formID+'-'+ztreeJson.id;
	var treeId = inputID+'-tree';
	treeUI[treeId] = {};
	treeUI[treeId].baseConfig = ztreeJson;
	treeUI[treeId].inputContainer = $('#'+inputID);
	treeUI[treeId].treeContainer = $('#'+treeId);
	treeUI[treeId].treeBtnContainer = $('#'+treeId+'-menuBtn');
	treeUI[treeId].data = {};
	treeUI[treeId].selectedNode = {};
	var setting = {
		data: {
			simpleData: {
				enable: true
			},
			key:{
				url:'urlNullAndEmpty'  //防止url命名冲突 urlNullAndEmpty是不存在的返回值，所以很长
			}
		},
		view: {
			expandSpeed: ""
		},

		callback: {
			onClick: treeUI.treenodeClick,
			onCheck: treeUI.treenodeOncheck,
			onAsyncSuccess:treeUI.ajaxCompete
		}
	}
	//false表示同步加载数据
	var treeAsync = ztreeJson.async ? ztreeJson.async : false;
	if(treeAsync){
		setting.async = {
			enable: true,
			url: treeUI.getUrl,
			dataFilter: treeUI.ajaxDataFilter,
			type:"GET",
		}
	}
	if(ztreeJson.isCheck){
		var isCheckParent = ztreeJson.isCheckParent ? ztreeJson.isCheckParent : false;
		if(isCheckParent == true){
			setting.check = {
				enable: true,
				chkboxType: { "Y": "p", "N": "ps" }
			}
		}else{
			setting.check = {
				enable: true,
				chkboxType: { "Y": "s", "N": "s" }
			}
		}
	}
	if(ztreeJson.isRadio){
		setting.check = {
			enable: true,
			chkStyle: "radio",
			radioType: "all"
		}
	}
	treeUI.initAjaxTreedata(treeId,setting);
}
treeUI.getUrl = function(treeId, treeNode){
	var param = "parentId="+treeNode.id;
	var paramUrl = treeUI[treeId].baseConfig.url;
	treeUI[treeId].baseConfig.data.parentId = treeNode.id;
	return paramUrl + "?" + param;
}
treeUI.ajaxDataFilter = function(treeId, parentNode, responseData){
	var resceiveData = treeUI.compontFieldPlane(treeId,responseData);
	return resceiveData;
}
treeUI.initAjaxTreedata = function(treeId,setting){
	var treeConfig = treeUI[treeId].baseConfig;
	$.ajax({
		url: treeConfig.url,	
		data:treeConfig.data,
		type:treeConfig.treeType,
		dataType: "json",
		success: function(data){
			if(data.success){
				var zNodes = treeUI.compontFieldPlane(treeId,data);
				if(treeConfig.readonly == true){
					var inputContainer = treeUI[treeId].inputContainer;
					var selectedNodeId = treeUI[treeId].selectedNode['parentId'].selectedNodeId;
					var treevalue = treeUI[treeId].selectedNode['parentId'].selectedNodeValue;
					if(selectedNodeId !=''){
						inputContainer.attr("value", treevalue);
						inputContainer.attr("nodeid",selectedNodeId);
					}
				}else{
					$.fn.zTree.init($("#"+treeId),setting,zNodes);
					treeUI.componentInput(treeId);
				}
			}
		}
	})
}
treeUI.compontFieldPlane = function(treeId,responseData){
	var treeConfig = treeUI[treeId].baseConfig;
	var resceiveData = responseData[treeConfig.dataSrc];
	var selectedNode = '';
	if(typeof(treeConfig.value) == 'function'){
		selectedNode = treeConfig.value();
	}else{
		selectedNode = treeConfig.value;
	}
	treeUI[treeId].data['parentId'] = {};
	treeUI[treeId].selectedNode['parentId'] = {};
	treeUI[treeId].selectedNode['parentId'].selectedNodeId = '';
	treeUI[treeId].selectedNode['parentId'].selectedNodeValue = '';
	resetData(resceiveData);
	function resetData(resceiveData){
		if(resceiveData){
			for(var i = 0; i < resceiveData.length; i ++){
				var ishavechild = resceiveData[i][treeConfig.haschildField];
				var ishavechildBool = true;//是否含有子元素
				if(ishavechild){
					if(Number(ishavechild) == 0){
						ishavechildBool = false;
					}else if(ishavechild == null){
						ishavechildBool = false;
					}
				}else{
					var treeChildrenField = 'children';
					if(treeConfig.children){
						treeChildrenField = treeConfig.children;
					}
					if(resceiveData[i][treeChildrenField] == null){
						ishavechildBool = false;
					}else if(resceiveData[i][treeChildrenField].length == 0){
						ishavechildBool = false;
					}
				}
				resceiveData[i].isParent = ishavechildBool;
				resceiveData[i].name = resceiveData[i][treeConfig.textField];
				resceiveData[i].id = resceiveData[i][treeConfig.valueField];
				if(treeConfig.parentId){
					resceiveData[i].pId = resceiveData[i][treeConfig.parentId];
				}else{
					resceiveData[i].pId = resceiveData[i].parentId;
				}
				if(ishavechildBool){
					resetData(resceiveData[i].children);
				}
				if(typeof(selectedNode) == 'string'){
					if(selectedNode.indexOf(',')>-1){
						var selectTreeArr = selectedNode.split(",");
						for(var nodeI=0; nodeI<selectTreeArr.length; nodeI++){
							if(resceiveData[i][treeConfig.valueField] == selectTreeArr[nodeI]){
								treeUI[treeId].selectedNode['parentId'].selectedNodeId += resceiveData[i][treeConfig.valueField]+",";
								treeUI[treeId].selectedNode['parentId'].selectedNodeValue += resceiveData[i][treeConfig.textField]+",";
								resceiveData[i].checked = true;
							}
						}
					}else{
						if(resceiveData[i][treeConfig.valueField] == selectedNode){
							treeUI[treeId].selectedNode['parentId'].selectedNodeId = resceiveData[i][treeConfig.valueField];
							treeUI[treeId].selectedNode['parentId'].selectedNodeValue = resceiveData[i][treeConfig.textField];
							resceiveData[i].checked = true;
						}
					}
				}else{
					if(resceiveData[i][treeConfig.valueField] == selectedNode){
						treeUI[treeId].selectedNode['parentId'].selectedNodeId = resceiveData[i][treeConfig.valueField];
						treeUI[treeId].selectedNode['parentId'].selectedNodeValue = resceiveData[i][treeConfig.textField];
						resceiveData[i].checked = true;
					}
				}
				treeUI[treeId].data['parentId'][resceiveData[i][treeConfig.valueField]] = resceiveData[i];
			}
		}
	}
	var sTreeId = treeUI[treeId].selectedNode['parentId'].selectedNodeId;
	if(typeof(sTreeId) == 'string'){
		if(sTreeId.indexOf(',')>-1){
			treeUI[treeId].selectedNode['parentId'].selectedNodeId = sTreeId.substr(0,sTreeId.length-1);
		}
	}
	var sTreeValue = treeUI[treeId].selectedNode['parentId'].selectedNodeValue;
	if(typeof(sTreeValue)=='string'){
		if(sTreeValue.indexOf(',')>-1){
			treeUI[treeId].selectedNode['parentId'].selectedNodeValue = sTreeValue.substr(0,sTreeValue.length-1);
		}
	}
	return resceiveData;
}
treeUI.ajaxCompete = function(event,treeId,treeNode,msg){
	var inputContainer = treeUI[treeId].inputContainer;
	var treeConfig = treeUI[treeId].baseConfig;
	treeUI.selectedTreeNode(treeId);
}
treeUI.componentInput = function(treeId){
	var inputContainer = treeUI[treeId].inputContainer;
	var treeConfig = treeUI[treeId].baseConfig;
	var selectedNodeId = treeUI[treeId].selectedNode['parentId'].selectedNodeId;
	var treeFullname = treeUI[treeId].baseConfig.fullnameField;
	var treevalue = treeUI[treeId].selectedNode['parentId'].selectedNodeValue;
	if(selectedNodeId !=''){
		inputContainer.attr("value", treevalue);
		inputContainer.attr("nodeid",selectedNodeId);
	}
	treeUI.selectedTreeNode(treeId);
	if(treevalue !== ''){
		treeUI.clear(treeId);
	}
	inputContainer.on('focus',function(ev){
		$(this).on('click',function(ev){
			var treeId = $(this).attr('id');
			treeId = treeId+'-tree';
			var treeContainer = treeUI[treeId].treeContainer;
			if(treeContainer.hasClass('hide')){
				treeContainer.removeClass('hide');
			}else{
				treeContainer.addClass('hide');
			}
			var inputObj = $(this);
			var inputOffset = $(this).offset();
			var inputId = $(this).attr('id');
			//$("#"+treeId).css({left:inputOffset.left + "px", top:inputOffset.top + inputObj.outerHeight() + "px"}).slideDown("fast");
			$("body").on("mousedown",{treeId:treeId,inputId:inputId},treeUI.onBodyDown);
		});
	})
	var btnContainer = treeUI[treeId].treeBtnContainer;
	btnContainer.on('click',function(ev){
		var currentBtnID = $(ev.target).closest('a').attr('id');
		var treeId = currentBtnID.substr(0,currentBtnID.length-8);
		var treeContainer = treeUI[treeId].treeContainer;
		if(treeContainer.hasClass('hide')){
			treeContainer.removeClass('hide');
		}else{
			treeContainer.addClass('hide');
		}
		var inputContainer = treeUI[treeId].inputContainer;
		inputId = inputContainer.attr('id');
		$("body").on("mousedown",{treeId:treeId,inputId:inputId},treeUI.onBodyDown);
	});
}
treeUI.clear = function(treeId){
	var inputvalue = treeUI[treeId].selectedNode['parentId'].selectedNodeValue;
	var inputContainer = treeUI[treeId].inputContainer;
	if(inputvalue === ''){
		//如果值为空，则不需要关闭
		if(inputContainer.parent().children('a.tree-close').length > 0){
			inputContainer.parent().children('a.tree-close').remove();
		}
	}else{
		var closeContainer = inputContainer.parent().children('.tree-close');
		if(inputContainer.parent().children('a.tree-close').length == 0){
			inputContainer.after('<a href="javascript:void(0)" class="tree-close"></a>');
			closeContainer = inputContainer.parent().children('.tree-close');
		}
		closeContainer.off('click');
		closeContainer.on('click',function(ev){
			var inputContainer = $(ev.target).closest('.form-group').children('input');
			var inputID = inputContainer.attr('id');
			inputContainer.val('');
			inputContainer.attr("value", '');
			inputContainer.attr("nodeid",'');
			var treeId = inputID+'-tree';
			treeUI[treeId].selectedNode['parentId'].selectedNodeId = '';
			treeUI[treeId].selectedNode['parentId'].selectedNodeValue = '';
			var treeObj = $.fn.zTree.getZTreeObj(treeId);
			treeObj.cancelSelectedNode();
			treeObj.checkAllNodes();
			$(this).off('click');
			$(this).remove();
		});
	}
}
treeUI.onBodyDown = function(ev){
	var treeId = ev.data.treeId;
	var inputId = ev.data.inputId;
	var inputContainer = treeUI[treeId].inputContainer;
	var treeContainer = treeUI[treeId].treeContainer;;
	var dragel = treeContainer[0];
	var target = ev.target;
	if(dragel != target && !$.contains(dragel,target)){
		treeUI.hideMenu(treeId);
	}
}
treeUI.hideMenu = function(treeId){
	var treeContainer = treeUI[treeId].treeContainer;
	treeContainer.addClass('hide');
	treeContainer.fadeOut("fast");
	var inputContainer = treeUI[treeId].inputContainer;
	inputContainer.off('click');
	$("body").off("mousedown",treeUI.onBodyDown);
	treeUI.clear(treeId);
}
treeUI.treenodeClick = function(event,treeId,treeNode,clickFlag){
	var ztreeUI = $.fn.zTree.getZTreeObj(treeId);
	var treeConfig = treeUI[treeId].baseConfig;
	if(clickFlag == 1){
		//是单击事件
		//判断是否支持多选
		var nodesName = "";//节点名称
		var nodesId = ""; //节点id
		var isCheck = typeof(treeConfig.isCheck) == 'boolean' ? treeConfig.isCheck : false;
		if(isCheck){
			ztreeUI.checkNode(treeNode, !treeNode.checked, null, true);//选中取消勾选状态
			var zTree = $.fn.zTree.getZTreeObj(treeId);
			var nodes = zTree.getCheckedNodes(true);
			for(var i=0; i<nodes.length; i++){
				if(typeof(treeConfig.fullnameField)=='string'){
					//是否有全称字段
					nodesName += nodes[i][treeConfig.fullnameField]+",";
				}else{
					nodesName += nodes[i][treeConfig.textField]+",";
				}
				nodesId += nodes[i].id+",";
			}
			nodesName = nodesName.substring(0, nodesName.length-1);
			nodesId = nodesId.substring(0, nodesId.length-1);
		}else{
			//单选处理
			nodesId = treeNode.id;
			if(typeof(treeConfig.fullnameField)=='string'){
				//是否有全称字段
				nodesName = treeNode[treeConfig.fullnameField];
			}else{
				//因为textField字段是必填项
				nodesName = treeNode[treeConfig.textField];
			}
		}
		var $input = treeUI[treeId].inputContainer;
		$input.val(nodesName);
		$input.attr("value", nodesName);
		$input.attr("nodeId",nodesId);
		$input.removeClass('has-error');
		$input.parent().children('label.has-error').remove();
		treeUI[treeId].selectedNode['parentId'].selectedNodeId = nodesId;
		treeUI[treeId].selectedNode['parentId'].selectedNodeValue = nodesName;
		var returnFunc = treeConfig.clickCallback;
		if(typeof(returnFunc) == 'function'){
			var returnObj = {};
			returnObj.treeId = treeId;
			returnObj.inputContainer = $input;
			returnObj.value = nodesName;
			returnObj.id = nodesId;
			returnFunc(returnObj);
		}
		if(isCheck == false){
			treeUI.hideMenu(treeId);
		}
	}
}
treeUI.treenodeOncheck = function(event,treeId,treeNode){
	var zTree = $.fn.zTree.getZTreeObj(treeId);
	var nodes = zTree.getCheckedNodes(true);
	var treeConfig = treeUI[treeId].baseConfig;
	var nodesName = '';
	var nodesId = '';
	for(var i=0; i<nodes.length; i++){
		if(typeof(treeConfig.fullnameField)=='string'){
			//是否有全称字段
			nodesName += nodes[i][treeConfig.fullnameField]+",";
		}else{
			nodesName += nodes[i][treeConfig.textField]+",";
		}
		nodesId += nodes[i].id+",";
	}
	nodesName = nodesName.substring(0, nodesName.length-1);
	nodesId = nodesId.substring(0, nodesId.length-1);
	var $input = treeUI[treeId].inputContainer;
	$input.val(nodesName);
	$input.attr("value", nodesName);
	$input.attr("nodeId",nodesId);
	var returnFunc = treeConfig.checkCallback;
	if(typeof(returnFunc) == 'function'){
		var returnObj = {};
		returnObj.treeId = treeId;
		returnObj.inputContainer = $input;
		returnObj.value = nodesName;
		returnObj.id = nodesId;
		returnFunc(returnObj);
	}
}
//默认选中节点
treeUI.selectedTreeNode = function(treeId,nodeId){
	var treeObj = $.fn.zTree.getZTreeObj(treeId);
	/*var parentcateid = 'parentId';
	for(var pID in treeUI[treeId].baseConfig.data){
		parentcateid = pID;
	}*/
	var sTreeNodesID = typeof(nodeId) == 'undefined' ? treeUI[treeId].selectedNode['parentId'].selectedNodeId : nodeId;
	//var treeAsync = treeUI[treeId].baseConfig.async ? treeUI[treeId].baseConfig.async:false;
	var nodes = [];
	if(typeof(sTreeNodesID) == 'string'){
		if(sTreeNodesID.indexOf(',')>-1){
			sTreeNodesID = sTreeNodesID.split(',');
			for(var nodeI=0; nodeI<sTreeNodesID.length; nodeI++){
				var treeData = treeObj.getNodesByParam('id',sTreeNodesID[nodeI]);
				treeObj.selectNode(treeData[nodeI],true);
			}
		}else{
			var treeData = treeObj.getNodesByParam("id",sTreeNodesID);
			treeObj.selectNode(treeData[0]);
		}
	}else{
		var treeData = treeObj.getNodesByParam("id",sTreeNodesID);
		treeObj.selectNode(treeData[0]);
	}
}
//更新节点
treeUI.updateTreeNode = function(treeId){
	var treeObj = $.fn.zTree.getZTreeObj(treeId);
	/*var parentcateid = 'parentId';
	for(var pID in treeUI[treeId].baseConfig.data){
		parentcateid = pID;
	}*/
	var sTreeNodesID = treeUI[treeId].selectedNode['parentId'].selectedNodeId;
	//var treeAsync = treeUI[treeId].baseConfig.async ? treeUI[treeId].baseConfig.async:false;
	var nodes = [];
	console.log(typeof(sTreeNodesID));
	if(typeof(sTreeNodesID) == 'string'){
		if(sTreeNodesID.indexOf(',')>-1){
			sTreeNodesID = sTreeNodesID.split(',');
			for(var nodeI=0; nodeI<sTreeNodesID.length; nodeI++){
				var treeData = treeObj.getNodesByParam('id',sTreeNodesID[nodeI]);
				treeObj.updateNode(treeData[nodeI],true);
			}
		}else{
			var treeData = treeObj.getNodesByParam("id",sTreeNodesID);
			console.log(treeData);
			treeObj.updateNode(treeData[0]);
		}
	}else{
		var treeData = treeObj.getNodesByParam("id",sTreeNodesID);
		treeObj.updateNode(treeData[0]);
	}
	/*var treeObj = $.fn.zTree.getZTreeObj(treeId);
	var nodes = treeObj.getNodes();
	treeObj.updateNode(nodes[updateNodeIndex]);*/
}
/**************tree 初始化操作 end**************************/

personUI.componentPersonPlane = function(formID,personJson){
	for(var person in personJson){
		var config = personJson.personSelect;
		config.formID = formID;
		nsUI.personSelect.init(config);
	}	
}
personUI.init = function(formID,personJson){
	var choseInputID = 'form-'+formID+'-'+personJson.id;
	personUI[choseInputID] = {};
	personUI[choseInputID].inputContainer = $('#'+choseInputID);
	personUI[choseInputID].baseConfig = personJson;//初始化配置参数
	personUI[choseInputID].searchStr = ''; //初始化默认搜索值
	personUI[choseInputID].employArr = [];//员工模块的搜索信息
	personUI[choseInputID].deptArr = [];//部门模块的搜索信息
	personUI[choseInputID].historyArr = []; //历史记录的搜索信息
	personUI[choseInputID].component = {};//存放三个模板元素
	personUI[choseInputID].currentType = 'history';//默认当前搜索显示员工面板
	personUI.initEmployData(choseInputID,personJson.employAjax);//初始化人员数据
	personUI.initDeptData(choseInputID,personJson.deptAjax);//初始化组织架构数据
	personUI.initComponentPlane(choseInputID);
	//触发获取焦点事件
	personUI.initSearchHandler(choseInputID);
}
/****人员，组织架构，历史记录 面板默认数据隐藏显示 start*****/
personUI.initComponentPlane = function(choseInputID){
	var inputContainer = personUI[choseInputID].inputContainer;
	//员工面板
	var employPlaneMainHtml = '<div class="person-employ-plane show-person-plane">'
							+'<div class="row">'
							+'<div class="col-sm-8">'
							+'<table cellspacing="0" id="person-employ-table" class="table table-singlerow table-hover table-striped table-condensed">'
							+'<tbody>'
							+'</tbody>'
							+'</table>'
							+'</div>'
							+'<div class="col-sm-4 person-employ-history">'
							+'<div class="load-span-panel">'
							+'</div>'
							+'</div>'
							+'</div>'
							+'</div>';
	inputContainer.closest('.form-group').after(employPlaneMainHtml);
	var employMainContainer = inputContainer.closest('.form-td').children('.person-employ-plane');
	//组织架构面板
	var departPlaneMainHtml = '<div class="person-Depart-plane show-person-plane">'
								+'<div class="row">'
									+'<div class="col-sm-8">'
										+'<ul id="person-Depart-tree" class="ztree">'
										+'</ul>'
									+'</div>'
									+'<div class="col-sm-4 person-Depart-history">'
										+'<div class="load-span-panel">'
										+'</div>'
									+'</div>'
								+'</div>'
							+'</div>';
	inputContainer.closest('.form-group').after(departPlaneMainHtml);
	var departMainContainer = inputContainer.closest('.form-td').children('.person-Depart-plane');
	//历史记录模板
	var historyPlaneMainHtml = '<div class="person-history-plane show-person-plane">'
							+'<div class="row">'
							+'<div class="col-sm-8">'
							+'<table cellspacing="0" id="person-history-table" class="table table-singlerow table-hover table-striped table-condensed">'
							+'<tbody>'
							+'</tbody>'
							+'</table>'
							+'</div>'
							+'<div class="col-sm-4 person-history-history">'
							+'<div class="load-span-panel">'
							+'</div>'
							+'</div>'
							+'</div>'
							+'</div>';
	inputContainer.closest('.form-group').after(historyPlaneMainHtml);
	var historyMainContainer = inputContainer.closest('.form-td').children('.person-history-plane');
	personUI[choseInputID].component['employ'] = employMainContainer;
	var employRecordContainer = employMainContainer.children().children('.person-employ-history');
	personUI[choseInputID].component['employ'].recordContainer = employRecordContainer;
	var deptRecordContainer = departMainContainer.children().children('.person-Depart-history');
	personUI[choseInputID].component['depart'] = departMainContainer;
	personUI[choseInputID].component['depart'].recordContainer = deptRecordContainer;
	var historyRecordContainer = historyMainContainer.children().children('.person-history-history');
	personUI[choseInputID].component['history'] = historyMainContainer;
	personUI[choseInputID].component['history'].recordContainer = historyRecordContainer;
	personUI.componentModelPlane(choseInputID);
}
personUI.componentModelPlane = function(choseInputID){
	var currentType = personUI[choseInputID].currentType;
	var componentContainer = personUI[choseInputID].component;
	for(var componI in componentContainer){
		componentContainer[componI].addClass('hide');
		if(componI == currentType){
			currentType == componI;
		}
	}
	if(currentType){componentContainer[currentType].removeClass('hide');}
}
/****人员，组织架构，历史记录 面板默认数据隐藏显示 end*****/
/****搜索信息面板 start*****/
personUI.initSearchHandler = function(choseInputID){
	var inputContainer = personUI[choseInputID].inputContainer;
	inputContainer.on('focus',personUI.inputFocusHandler);
	//选择人按钮
	var employContainer = inputContainer.parent().children('[ns-control="personInfo"]');
	employContainer.on('click',function(ev){
		var searchObj = {};
		var inputContainer = $(this).parent().children('[nstype="person-select"]');
		inputContainer.parent().children('.person-person-handler').remove();
		var employInputID = inputContainer.attr('id');
		var searchStr = inputContainer.val().trim();
		searchStr = searchStr.toLocaleUpperCase();
		personUI[employInputID].searchStr = searchStr;
		personUI[employInputID].currentType = 'employ';
		//传送inputID,input元素,要显示的数组值
		personUI.matchComponentEmploy(employInputID);
	});
	//选择组织架构按钮
	var departContainer = inputContainer.parent().children('[ns-control="departOrg"]');
	departContainer.on('click',function(ev){
		var inputContainer = $(this).parent().children('[nstype="person-select"]');
		inputContainer.parent().children('.person-person-handler').remove();
		var deparInputID = inputContainer.attr('id');
		personUI[deparInputID].currentType = 'depart';
		var searchStr = inputContainer.val().trim();
		searchStr = searchStr.toLocaleUpperCase();
		personUI[deparInputID].searchStr = searchStr;
		personUI.matchComponentDepart(deparInputID);
	});
	//选择历史记录按钮
	var personHistoryContainer = inputContainer.parent().children('[ns-control="history"]');
	personHistoryContainer.on('click',function(ev){
		var searchObj = {};
		var inputContainer = $(this).parent().children('[nstype="person-select"]');
		inputContainer.parent().children('.person-person-handler').remove();
		var historyInputID = inputContainer.attr('id');
		var searchStr = inputContainer.val().trim();
		searchStr = searchStr.toLocaleUpperCase();
		personUI[historyInputID].currentType = 'history';
		personUI[historyInputID].searchStr = searchStr;
		personUI.matchComponentHistory(historyInputID);
	});
}
//搜索文本获取焦点触发事件
personUI.inputFocusHandler = function(ev){
	//显示历史记录
	personUI.showTopTenthHistory($(this).attr('id'));
	//关闭焦点事件，触发键盘按下事件
	$(this).off('focus');
	$(this).on('blur',function(ev){
		$(this).off('blur');
		$(this).on('focus',personUI.inputFocusHandler);
		var id = $(this).attr('id');
		//$(document).on('click',{id:id},personUI.clickHiddenPersonUIPlane);
	})	
	$(this).on('keyup',personUI.inputKeyupHandler);
}
//搜索人员的键盘按下事件
personUI.inputKeyupHandler = function(ev){
	var searchStr = $(ev.target).val().trim();
	var searchID = $(this).attr('id');
	searchStr = searchStr.toLocaleUpperCase();
	var currentType = personUI[searchID].currentType;
	if(personUI[searchID].searchStr != searchStr){
		personUI[searchID].searchStr = searchStr;
	}
	switch(currentType){
		case "employ":
			personUI.matchComponentEmploy(searchID);
			break;
		case "depart":
			personUI.matchComponentDepart(searchID);
			break;
		case "history":
			personUI.showTopTenthHistory(searchID);
			break;
	}
}
/********搜索相关面板无数据显示的操作 start*******/
personUI.componentEmptyHtml = function(type){
	//未检索出历史记录信息
	var emptyTitleHtml = '';
	var currentType = type;
	switch(currentType){
		case "history":
			emptyTitleHtml = '暂无历史记录';
			break;
		case "employ":
			emptyTitleHtml = '暂无人员信息';
			break;
		case "depart":
			emptyTitleHtml = '暂无相关部门';
			break;
	}
	emptyTitleHtml = '<div class="selectDemo-dropdown">'
							+'<div class="row"><div class="col-sm-8">'
							+'<p class="tips">'
							+emptyTitleHtml
							+'</p>'
							+'</div></div>'
						+'</div>';
	return emptyTitleHtml;
}
/********搜索相关面板无数据显示的操作 end**********/
/********历史记录相关面板操作 start****************/
personUI.matchComponentHistory = function(searchID){
	//////
	////
	//
	personUI.showTopTenthHistory(searchID);
}
//显示历史记录
personUI.showTopTenthHistory = function(choseInputID){
	//最近搜索的10条数据
	var inputContainer = personUI[choseInputID].inputContainer;
	var searchStr = inputContainer.val().trim();
	searchStr = searchStr.toLocaleUpperCase(searchStr);
	var historyArr = [];
	if(inputContainer.val().trim() == ''){
		//显示历史记录
	}else{
		//搜索历史记录
	}
	personUI.matchHistoryData(choseInputID,historyArr);
}
//检索拼接最近历史记录10条数据
personUI.matchHistoryData = function(matchID,historyArr){
	var dataArr = historyArr;
	var personTitleHtml = '';
	if(dataArr.length > 0){
		//填充检索出来的历史记录信息
		for(var dataI = 0; dataI < dataArr.length; dataI ++){

		}
	}else{
		personTitleHtml = personUI.componentEmptyHtml('history');
	}
	var historyMainContainer = personUI[matchID].component['history'];
	var historyTableContainer = historyMainContainer.find('table tbody');	
	historyTableContainer.html(personTitleHtml); 
	personUI.componentModelPlane(matchID);
}
/********历史记录相关面板操作 end *****************/
/********人员信息相关面板操作 start****************/
//AJAX 初始化读取所有人员信息
personUI.initEmployData = function(choseInputID,employAjax){
	var localDataConfig = employAjax.localDataConfig;
	var columnNum = 0; 		//统计列显示列数量
	var columnTitle = [];	//存放配置中有设置显示标题的
	var columnType = [];	//存放配置中有设置显示类型的
	var columnData = [];	//拼接可显示的数组下标
	var columnWidth = [];	//存放配置中可显示标题列宽度
	var dataSearch = [];	//存放配置列中设置了允许搜索的下标
	var dataKey = [];		//拼接数组id字段
	var dataTitle = [];		//给所有的配置列添加标题
	var autoWidthColumnNum = 0   	//自动计算的列数量
	var autoWidthColumnTotal = 0	//自动计算的列宽度 百分比
	var departIndex = -1;//判断该列是否是部门id
	for(var col = 0; col < localDataConfig.length; col ++){
		//如果存在显示列标题，则记录下来显示列顺序下标
		if(localDataConfig[col].visible){
			columnData[localDataConfig[col].visible-1] = col;
			columnNum++;
		}
		var columnSearch = typeof(localDataConfig[col].search) == 'undefined' ?false:localDataConfig[col].search;
		if(columnSearch){
			dataSearch.push(col);
		}
		if(localDataConfig[col].key){
			dataKey.push(localDataConfig[col].key);
		}else{
			dataKey.push(-1);
		}
		if(localDataConfig[col].title){
			dataTitle.push(localDataConfig[col].title);
		}else{
			dataTitle.push('');
		}
		var isDepart = typeof(localDataConfig[col].isDepart) == 'undefined'?false:localDataConfig[col].isDepart;
		if(isDepart){
			departIndex = col;
		}
	}
	for(var colI = 0; colI < columnData.length; colI ++){
		var currentData = localDataConfig[columnData[colI]];//读取是第几列
		columnTitle.push(currentData.title);
		columnType.push(currentData.type);
		//判断当前显示列是否设置了宽度
		if(typeof(currentData.width)=='undefined'){
			autoWidthColumnNum++;
		}else if(typeof(currentData.width)=='number'){
			autoWidthColumnTotal+=currentData.width;
		}else{
			nsalert('宽度参数错误','error');
		}
		columnWidth.push(currentData.width);
	}
	//计算列宽
	if(autoWidthColumnNum>0){
		if(autoWidthColumnTotal<=100){
			var columnWidthStr = parseInt(((100-autoWidthColumnTotal)/autoWidthColumnNum)*1000)/1000+'%';
			for(var i=0; i<columnWidth.length; i++){
				if(typeof(columnWidth[i])=='undefined'){
					columnWidth[i] = columnWidthStr;
				}else{
					columnWidth[i] = columnWidth[i]+'%';
				}
			}
		}else{
			nsalert('宽度设置错误，请设置为数字，总和不大于100');
		}
	}
	employAjax.columnData  = columnData;		//显示列数据
	employAjax.columnType  = columnType; 		//显示列类型
	employAjax.columnNum   = columnNum; 		//列数量
	employAjax.columnWidth = columnWidth; 		//列宽
	employAjax.columnTitle = columnTitle; 		//标题数组

	employAjax.departIndex = departIndex;       //部门id的列下标

	employAjax.dataSearch = dataSearch;			//可以搜索的数组

	employAjax.dataKey    = dataKey; 			//key 每个数据对象都有 没有的是-1
	employAjax.dataTitle  = dataTitle; 			//标题 每个数据对象都有 没有的是''
	var employData = typeof(employAjax.data) == 'undefined' ?'':employAjax.data;
	var employType = typeof(employAjax.type) == 'undefined' ?'POST':employAjax.type;
	$.ajax({
		url:			employAjax.url,	
		data:			employData,
		type:			employType,
		dataType: 		"json",
		success: function(data){
			if(data.success){
				personUI[choseInputID].employData = data[employAjax["dataSrc"]];
			}
		}
	})
}
//根据检索项，检索数据
personUI.matchComponentEmploy = function(searchID){
	//允许搜索项
	var isAllowSearch = personUI[searchID].baseConfig.employAjax.dataSearch;
	var employData = personUI[searchID].employData;
	var searchStr = personUI[searchID].searchStr;
	//搜索项不为空进行检索数据
	var dataArr = [];
	if(employData.length >0){
		for(var personI = 0; personI < employData.length; personI ++){
			for(var matchI = 0; matchI < employData[personI].length; matchI ++){
				if(isAllowSearch.indexOf(matchI)>-1){
					var searchName = employData[personI][matchI];
					searchName = searchName.toString();
					if(searchName.indexOf(searchStr)>-1){
						dataArr.push(employData[personI]);
						break;
					};
				}
			}
		}
	}
	matchEmployObj = {};
	matchEmployObj.dataArr = dataArr;
	matchEmployObj.searchID = searchID;
	personUI.matchEmployData(matchEmployObj);
}
//将检索出的数据进行显示
personUI.matchEmployData = function(matchEmployObj){
	var searchID = matchEmployObj.searchID;
	var searchData = matchEmployObj.dataArr;//检索过的数组

	var searchStr = personUI[searchID].searchStr;
	var currentType = personUI[searchID].currentType;//当前点击的模板显示类型
	var employConfig = personUI[searchID].baseConfig.employAjax;
	var columnData = employConfig.columnData;
	
	var personTitleHtml = '';
	var personRowsHtml = '';
	var personEmptyRowHtml = '';
	if(searchData.length > 0){
		//检索出数据的处理
		personTitleHtml = matchGetTitleHtml(employConfig);
		var serchLength = searchData.length >= 10 ? 10:searchData.length;
		for(var person = 0; person < serchLength; person ++){
			personRowsHtml+= matchGetRowsHtml(searchData[person],person);
		}
		if(searchData.length < 10){
			var fillEmptyRowLength = 10 - searchData.length;
			var fillColumnLength = employConfig.columnNum;
			for(var fillI = 0; fillI < fillEmptyRowLength; fillI ++){
				personEmptyRowHtml += '<tr>';
				for(var columnI = 0; columnI < fillColumnLength; columnI ++){
					personEmptyRowHtml += '<td></td>';
				}
				personEmptyRowHtml += '</tr>';
			}
			personRowsHtml += personEmptyRowHtml;
		}
	}else{
		personTitleHtml = personUI.componentEmptyHtml('employ');
	}
	function matchGetTitleHtml(employConfig){
		//获取标题代码
		personTitleHtml = '';
		var columnTitle = employConfig.columnTitle;
		for(var titleI=0; titleI<columnTitle.length; titleI++){
			personTitleHtml += '<td style="width:'+employConfig.columnWidth[titleI]+'">'+columnTitle[titleI]+'</td>';
		}
		personTitleHtml = '<tr>'+personTitleHtml+'</tr>';
		return personTitleHtml;
	}
	function matchGetRowsHtml(data,indexID){
		var columnDataArr = [];
		//获取行代码
		var currentRowClass = '';
		if(indexID==0){
			currentRowClass = 'selected';
		}
		var rowHtml = '';
		if(typeof(searchStr)=='undefined'){
			searchStr = '';
		}
		for(var columnI = 0; columnI < columnData.length; columnI++){
			var matchName= data[columnData[columnI]];
			columnDataArr.push(data[columnData[columnI]]);
		}
		for(var colI=0; colI<columnDataArr.length; colI++){
			rowHtml +='<td style="width:'+employConfig.columnWidth[colI]+'">'
					+columnDataArr[colI]
					+'</td>';
		}
		rowHtml = '<tr class="'+currentRowClass+' person-select-content" rowindexid="'+data[0]+'">'
					+rowHtml
				+'</tr>';
		return rowHtml;
	}
	personUI.componentEmployHtml(searchID,personRowsHtml,personTitleHtml);
	personUI.componentModelPlane(searchID);
	//整体按下事件需要传送元素ID，处理的html元素
	$(document).on('keyup',{searchID:searchID},personUI.documentKeyHandler);
}
//将筛选结果进行html组装
personUI.componentEmployHtml = function(searchID,rowHtml,titleHtml){
	var employMainContainer = personUI[searchID].component['employ'];
	var employTableContainer = employMainContainer.find('table tbody');	
	employTableContainer.html(rowHtml+titleHtml);
	//table tr行单击事件
	employTableContainer.children('tr.person-select-content').on('click',function(ev){
		var rowID = parseInt($(this).attr('rowindexid'));
		var selectRowObj = {};
		selectRowObj.searchID = searchID;
		selectRowObj.currentRowID = rowID;
		selectRowObj.employData = personUI[searchID].employData;
		if($(this).hasClass('selected')){
			$(this).removeClass('selected');
		}else{
			$(this).addClass('selected');
			$(this).siblings('tr').removeClass('selected');
		}
		//触发选中行事件，传送inputID,当前行rowID,和处理的数组.
		personUI.selectRow(selectRowObj);
	});
}
//单击行触发事件

personUI.selectRow = function(searchObj){
	var valueArr = [];
	var employArr = personUI[searchObj.searchID].employArr;
	var rowID = searchObj.currentRowID;
	var localDataArr = searchObj.employData;
	var columnData = personUI[searchObj.searchID].baseConfig.employAjax.columnData;
	var currentType = personUI[searchObj.searchID].currentType;
	var inputContainer = personUI[searchObj.searchID].inputContainer;
	var fillContainer = personUI[searchObj.searchID].component[currentType].recordContainer;
	var valueArr = [];
	for(var cdI = 0; cdI < columnData.length; cdI++){
		valueArr.push(localDataArr[rowID][columnData[cdI]]);
	}
	var existID = -1;
	for(var employI = 0; employI < employArr.length; employI ++){
		if(isObjectValueEqual(valueArr,employArr[employI])){
			existID = employI;
		}
	}
	if(existID >= 0){
		employArr[existID] = valueArr;
	}else{
		employArr.push(valueArr);
	}
	if(employArr.length > 0){
		personUI.fillValue(employArr,inputContainer,fillContainer);
	}
	$(document).off('keyup',personUI.documentKeyHandler);
}
/********人员信息相关面板操作 end****************/
/********组织架构相关面板操作 start****************/
//AJAX 初始化读取所有组织架构信息
personUI.initDeptData = function(choseInputID,deptAjax){
	var deptData = typeof(deptAjax.data) == 'undefined' ?'':deptAjax.data;
	var deptType = typeof(deptAjax.type) == 'undefined' ?'POST':deptAjax.type;
	$.ajax({
		url:			deptAjax.url,	
		data:			deptData,
		type:			deptType,
		dataType: 		"json",
		success: function(data){
			if(data.success){
				personUI[choseInputID].deptData = data[deptAjax["dataSrc"]];
			}
		}
	})
}
//根据检索项，检索数据
personUI.matchComponentDepart = function(searchID){
	personUI["person-Depart-tree"] = personUI.converDepartConfigData(searchID);
	var inputContainer = personUI[searchID].inputContainer;
	var matchValue = personUI[searchID].searchStr;
	var inputValue = inputContainer.val().trim();
	inputValue.toLocaleUpperCase();
	var matchAllData = personUI[searchID].deptData;
	var matchConfig = personUI[searchID].baseConfig.deptAjax;
	var departContainer = personUI[searchID].component['depart'];
	var fillContainer = departContainer.recordContainer;
	var matchArr = [];
	var fillHtml = '';
	var matchDepartArr = [];
	if(inputValue == ''){
		if(matchValue != inputValue){
			matchDepartArr = [];
		}else{
			matchDepartArr = matchAllData;
		}
	}else{
		if(matchValue.indexOf('全')>-1 || matchValue.indexOf('部')>-1){
			matchDepartArr = matchAllData;
			for(var matchI = 0; matchI < matchAllData.length; matchI ++){
				matchID = matchAllData[matchI][matchConfig['valueField']];
				matchArr.push(matchID);
			}
		}else{
			for(var matchI = 0; matchI < matchAllData.length; matchI ++){
				var matchName = matchAllData[matchI][matchConfig['textField']];
				if(matchName.indexOf(matchValue) > -1){
					matchDepartArr.push(matchAllData[matchI]);
					matchID = matchAllData[matchI][matchConfig['valueField']];
					matchArr.push(matchID);
				}
			}
		}
	}
	personUI.matchDepartData(searchID,matchDepartArr);
	if(matchDepartArr.length > 0){
		if(matchArr.length > 0){	
			for(var deptI = 0; deptI < matchArr.length; deptI ++){
				var treeJson = personUI['person-Depart-tree'];
				var fillData = treeJson[matchArr[deptI]];
				fillHtml += personUI.componentDepartHtml(fillData);
			} 
			fillContainer.html(fillHtml);
			var closeContainer = inputContainer.parent().children('.person-person-handler').children('.handler-btn');
			personUI.componentPlaneHandler(closeContainer,fillContainer);
		}else{
			fillContainer.html('该部门下暂无人员');
		}
	}else{
		fillHtml = personUI.componentEmptyHtml('depart');
		departContainer.children().find('.ztree').html(fillHtml);
		fillContainer.html('该部门下暂无人员');
	}
	personUI.componentModelPlane(searchID);
}
//将检索出的数据进行显示
personUI.matchDepartData = function(searchID,departData){
	var departConfig = personUI[searchID].baseConfig.deptAjax;
	//填充组织架构数据
	var setting = {
		data: {
			simpleData: {
				enable: true,
			}
		},
		view: {
			expandSpeed: ""
		},
		callback: {
			onClick: personUI.matchDepartTreenodeClick,
		}
	}
	var zNodes = personUI.converDepartField(departData,departConfig);
	$.fn.zTree.init($("#person-Depart-tree"),setting,zNodes);
}
//根据树结构来转换要显示的字段名称
personUI.converDepartField = function(data,config){
	var treeConfig = config;
	var resceiveData = data;
	for(var i = 0; i < resceiveData.length; i ++){
		var ishavechild = resceiveData[i]["children"];
		var ishavechildBool = true;
		if(Number(ishavechild) == 0){
			ishavechildBool = false;
		}else if(ishavechild == null){
			ishavechildBool = false;
		}
		resceiveData[i].isParent = ishavechildBool;
		resceiveData[i].name = resceiveData[i][treeConfig["textField"]];
		resceiveData[i].id = resceiveData[i][treeConfig["valueField"]];
	}
	var rootNodes = {};
	rootNodes[treeConfig["textField"]] = '全部';
	rootNodes[treeConfig["valueField"]] = '-1';
	rootNodes["open"] = true;
	rootNodes["children"]  = resceiveData;
	resceiveData = rootNodes;
	return resceiveData;
}
//根据部门id拼接部门下的人员信息数组
personUI.converDepartConfigData = function(choseInputID){
	var dataJson = {};
	var employData = personUI[choseInputID].employData;
	var departIndex = personUI[choseInputID].baseConfig.employAjax.departIndex;
	var columnData = personUI[choseInputID].baseConfig.employAjax.columnData;
	for(var totalI = 0; totalI < employData.length; totalI ++){
		var tempColumnArr = [];
		var tempColumnData = personUI.converDepartConfigDataField(employData[totalI],columnData);
		var cIndex = employData[totalI][departIndex];
		tempColumnArr.push(tempColumnData);
		var existID = -1;
		for(var existI in dataJson){
			if(existI == cIndex){
				existID = cIndex;
			}
		}
		if(existID >= 0){
			dataJson[existID].push(tempColumnArr[0]);
		}else{
			dataJson[cIndex] = tempColumnArr;
		}
	}
	return dataJson; 
}
//根据部门id拼接部门下的人员信息数组
personUI.converDepartConfigDataField = function(data,columnData){
	var columnDataArr = [];
	for(var columnI = 0; columnI < columnData.length; columnI++){
		var matchName= data[columnData[columnI]];
		columnDataArr.push(matchName);
	}
	return columnDataArr;
}
//树节点单击事件
personUI.matchDepartTreenodeClick = function(event,treeId,treeNode,clickFlag){
	var treeJson = personUI[treeId];
	var inputFillContainer = $(event.target).closest('.form-td').children('.form-group').children('[nstype="person-select"]');
	var inputFillID = inputFillContainer.attr('id');
	var closeContainer = inputFillContainer.parent().children('.person-person-handler').children('.handler-btn');
	var firstChildContainer = personUI[inputFillID].component['depart'];
	var fillContainer = firstChildContainer.recordContainer;
	var fillHtml = '';
	if(treeNode.id == '-1'){
		for(var treeI in treeJson){
			var fillData = treeJson[treeI];
			fillHtml += personUI.componentDepartHtml(fillData);
		}
	}else{
		var fillData = treeJson[treeNode.id];
		if(fillData){
			fillHtml = personUI.componentDepartHtml(fillData);
		}else{
			fillHtml = '该部门下暂无人员';
		}
	}
	fillContainer.html(fillHtml);
	personUI.componentPlaneHandler(closeContainer,fillContainer);
}
//将筛选结果进行html组装
personUI.componentDepartHtml = function(data){
	var fillHtml = '';
	if(data){
		for(var fillI = 0; fillI < data.length; fillI++){
			fillHtml += '<span class="load-span" spanid="'+fillI+'">'
							+'<a href="javascript:void(0)" class="load-close">'
								+'<i class="fa fa-times-circle"></i>'
							+'</a>'
							+'<a href="javascript:void(0)" class="load-span-title">'
							+data[fillI][0]
							+'</a>'
						+'</span>';
		}
	}
	return fillHtml;
}
/********组织架构相关面板操作 end****************/



personUI.getFillTitleHtml = function(name,length){
	var fillTitleHtml = '';
	fillTitleHtml = '<div class="load-span-panel person-person-handler">'
						+'<span class="load-span">'
							+'<a href="javascript:void(0)" class="load-span-title">'+name+'</a>'
						+'</span>'						
						+'<span class="handler-btn">共'
						+length
						+'条结果'
						+'<i class="fa fa-times-circle"></i>'
						+'</span>'
					+'</div>';
		return fillTitleHtml;
}
personUI.getFillContentHtml = function(valueArr){
	var valuelength = valueArr.length;
	var fillcontentHtml = '';
	for(var totalI = 0; totalI < valuelength; totalI ++){
		fillcontentHtml += '<span class="load-span" spanid="'+totalI+'">'
						+'<a href="javascript:void(0)" class="load-close person-history-btn">'
							+'<i class="fa fa-times-circle"></i>'
						+'</a>'
						+'<a href="javascript:void(0)" class="load-span-title">'
						+valueArr[totalI][0]
						+'</a>'
					+'</span>'
	}
	return fillcontentHtml;
}
//填充值
personUI.fillValue = function(valueArr,inputContainer,fillContainer){
	var valuelength = valueArr.length;
	inputContainer.parent().children('.person-person-handler').remove();
	var fillTitleHtml = personUI.getFillTitleHtml(valueArr[0][0],valuelength);
	inputContainer.parent().append(fillTitleHtml);
	var fillRowHtml = personUI.getFillContentHtml(valueArr);
	var closeContainer = inputContainer.parent().children('.person-person-handler').children('.handler-btn');
	fillContainer.html(fillRowHtml);
	personUI.componentPlaneHandler(closeContainer,fillContainer);
}
//显示记录列表的关闭事件
personUI.componentPlaneHandler = function(closeContainer,fillContainer){
	closeContainer.on('click',function(ev){
		$(this).off('click');
		var inputContainer = $(ev.target).closest('.form-group').children('[nstype="person-select"]');
		var matchID = inputContainer.attr('id');
		$(this).closest('div').remove();
		inputContainer.val('');
		personUI.clearValue(matchID);
	});
	var inputContainer = closeContainer.closest('.form-group').children('[nstype="person-select"]');
	var clickElementContainer = fillContainer.children();	
	clickElementContainer.on('click',function(ev){
		$(this).off('click');
		var spanid = parseInt($(ev.target).closest('span').attr('spanid'));
		$(this).remove();
		inputContainer.parent().children('.person-person-handler').remove();
		var matchID = inputContainer.attr('id');
		var currentType = personUI[matchID].currentType;
		var valueArr = [];
		switch(currentType){
			case "employ":
				valueArr = personUI[matchID].employArr;
				break;
			case "depart":
				valueArr = personUI[matchID].deptArr;
				break;
			case "history":
				valueArr = personUI[matchID].historyArr;
				break;
		}
		valueArr.splice(spanid,1);
		var valuelength = valueArr.length;
		var fillTitleHtml = personUI.getFillTitleHtml(valueArr[0][0],valuelength);
		inputContainer.parent().append(fillTitleHtml);
	});
}
//整体接收的键盘事件
personUI.documentKeyHandler = function(ev){
	var searchID = ev.data.searchID;
	var keyCodeNumber = Number(ev.keyCode);
	var currentType = personUI[searchID].currentType;
	if(currentType == 'employ'){
		var employMainContainer = personUI[searchID].component['employ'];
		var employTableContainer = employMainContainer.find('table tbody');
		var $currentRow = employTableContainer.children('.selected');

		var returnSelectObj = {};
		returnSelectObj.searchID = searchID;
		returnSelectObj.employData = personUI[searchID].employData;

		switch(keyCodeNumber){
			case 13:
				//回车
				if($currentRow.length > 0){
					var currentRowID = parseInt($currentRow.attr('rowindexid'));
					returnSelectObj.currentRowID = currentRowID;
					//触发选中行事件，传送inputID,当前行rowID,和处理的数组
					personUI.selectRow(returnSelectObj);
				}
				break;
			case 40:
				//下移
				if($currentRow.next().hasClass('person-select-content')){
					$currentRow.removeClass('selected');
					$currentRow.next().addClass('selected');
				}
				break;
			case 38:
				//上移
				if($currentRow.prev().hasClass('person-select-content')){
					$currentRow.removeClass('selected');
					$currentRow.prev().addClass('selected');
				}
				break;
			case 27:
				//ESC 关闭
				personUI.closePlane(searchID);
				break;
			case 32:
				//空格
				if($currentRow.length > 0){
					var currentRowID = parseInt($currentRow.attr('rowindexid'));
					returnSelectObj.currentRowID = currentRowID;
					//触发选中行事件，传送inputID,当前行rowID,和处理的数组
					personUI.selectRow(returnSelectObj);
				}
				break;
		}
	}
	
}
//移除面板
personUI.closePlane = function(choseInputID){
	var inputContainer = personUI[choseInputID].inputContainer;
	$(document).off('keyup', personUI.documentKeyHandler);
	//激活方法
	inputContainer.on('focus',function(ev){
		$(this).off('focus');
		personUI.showTopTenthHistory($(this).attr('id'));
		$(this).on('keyup', personUI.inputKeyupHandler);
	});
	personUI[choseInputID].currentType = 'history';
	personUI.componentModelPlane(choseInputID);
}
//清除面板
personUI.clearValue = function(choseInputID){
	personUI[choseInputID].employArr = [];
	personUI[choseInputID].deptArr = [];
	personUI[choseInputID].historyArr = [];
	var currentType = personUI[choseInputID].currentType;
	switch(currentType){
		case "employ":
			personUI[choseInputID].component['employ'].recordContainer.html('');
			break;
		case "depart":
			personUI[choseInputID].component['depart'].recordContainer.html('');
			break;
		case "history":
			personUI[choseInputID].component['depart'].recordContainer.html('');
			break;
	}
	personUI.componentModelPlane(choseInputID);
}
personUI.clickHiddenPersonUIPlane = function(ev){
	$(document).off('click',personUI.clickHiddenPersonUIPlane);
	var currentPlaneID = ev.data.id;
	var personContainer = personUI[currentPlaneID].component;
	var dragel = personContainer['employ'].closest('.form-td');
	var target = ev.target;
	if(dragel != target && !$.contains(dragel,target)){
		personUI.closePlane(currentPlaneID);
	}
}
/****搜索信息面板 end*****/

/************** 新左侧菜单 买树宇 start **************/
nsFrame.loadMenuNew = function(url,parameterStr,parameterMiniMenu,data){
	var parameterArr = parameterStr.split("-");
	for(var pIndex=0; pIndex<parameterArr.length; pIndex++){
		parameterArr[pIndex] = parseInt(parameterArr[pIndex]);
	}
	mainmenu.initNavNew(parameterArr[0],parameterArr[1]);
	mainmenu.setCurrentMenu(parameterArr[0],parameterArr[1]);
	//是否最小化主菜单
	if(parameterMiniMenu=="true"){
		mainmenu.setMin(true);
	}else if(parameterMiniMenu=="false"){
		mainmenu.setMin(false);
	}

	//是否有附加参数，只能以get方式转出
	if(data){
		if(typeof(data)=='string'){
			data = JSON.parse(data);
		}
		var dataStr = '';
		$.each(data, function(key,value){
			dataStr += key+'='+value;
		})
		if(url.indexOf('?')==-1){
			url += '?'+ dataStr;
		}else{
			url += dataStr;
		}
	}
	nsFrame.loadPage(url);
}
mainmenu.initNew = function(tid,sid,mainmenuIconConfig,homeUrl){
	nsVals.homeUrl = homeUrl;
	mainmenu.mainmenuIconConfig = {};
	var mainmenuDefaultIconConfig = {
		"基本结构": 		"fa-sitemap",
		"Form类": 			"fa-edit",
		"Table类": 			"fa-table",
		"汽修类": 			"fa-car",
		"dialog类": 		"fa-clipboard",
		"leftmenu类": 		"fa-list",
		"button类": 		"fa-mouse-pointer",
		"其他类UI": 		"fa-puzzle-piece",
		"奥来国信财务DEMO": "fa-rmb",
		"页面配置生成": 	"fa-file-text",
		"系统管理": 		"linecons-cog",
		"基础信息管理": 	"linecons-database",
		"项目管理": 		"linecons-calendar",
		"报表管理": 		"linecons-doc",
		"业务处理": 		"linecons-paper-plane",
		"编号规则": 		"linecons-tag",
		"采样管理": 		"linecons-inbox",
		"结果录入": 		"linecons-pencil",
	}
	mainmenu.mainmenuIconConfig = mainmenuDefaultIconConfig;
	for(var iconExist in mainmenu.mainmenuIconConfig){
		for(var icon in mainmenuIconConfig){
			if(icon  == iconExist){
				mainmenu.mainmenuIconConfig[iconExist] = mainmenuIconConfig[icon];
			}else{
				mainmenu.mainmenuIconConfig[icon] = mainmenuIconConfig[icon];
			}
		}
	}
	if(typeof(mainmenu.url)=='undefined'){
		mainmenu.url = getRootPath() + '/assets/json/mainmenu.json';
	}
	if(typeof(mainmenu.type)=='undefined'){
		mainmenu.type = "get";
	}
	if(typeof(mainmenu.data)=='undefined'){
		mainmenu.data = {id:0};
	}
	$.ajax({
			type: mainmenu.type,
			//url: getRootPath() + '/getMenu',
			url: mainmenu.url,
			data:mainmenu.data,
			dataType: "json",
			success: function(data){
				if(data.success){
					mainmenu.data = data;
					mainmenu.currentCalalogID = parseInt(tid);
					mainmenu.currentPageID = parseInt(sid);
					mainmenu.initNavNew(tid,sid);
					var menuHtml = "";
					for(var topMenuID=0;topMenuID<data.rows.length;topMenuID++){
						var subMenuHtml="";
						if(data.rows[topMenuID].children){
							subMenuHtml = getSubMenuHtml(data.rows[topMenuID].children, topMenuID, sid);
						}
						var hrefStr = "javascript:void(0)";
						if(data.rows[topMenuID].url!=""){
							hrefStr = getRootPath() + data.rows[topMenuID].url;
							//if(data.rows[topMenuID].singlePageMode){
							if(true){
								var parameterStr = topMenuID;
								var parameterMiniMenu = 'false';
								if(data.rows[topMenuID].minMenu){
									if(data.rows[topMenuID].minMenu == true){
										parameterMiniMenu = 'true';
									}else{
										parameterMiniMenu = 'false';
									}
								}
								hrefStr = "javascript:nsFrame.loadMenuNew('"+hrefStr+"','"+parameterStr+"','"+parameterMiniMenu+"');";
							}else{
								var urlStr = hrefStr;
								if(urlStr.indexOf('?')>-1){
									urlStr = urlStr+'&tid='+topMenuID;
								}else{
									urlStr = urlStr+'?tid='+topMenuID;
								}
								hrefStr = urlStr;
							}
						}
						var activeHtml = topMenuID==tid?'class="opened active"':'';
						menuHtml+= 
						'<li '+activeHtml+'>'
							+'<a href="'+hrefStr+'">'
								+'<i class="'+getIcon(data.rows[topMenuID].name)+'"></i>'
								+'<span class="title">'+data.rows[topMenuID].name+'</span>'
							+'</a>'
							+subMenuHtml
						+'</li>'
					}
				}
				$("#main-menu").html(menuHtml);
				setup_sidebar_menu();
			},
			error:function(e){
				toastr.error("菜单加载出错");
			}
		});
	function getSubMenuHtml(listJson, topMenuID, sid){
		var subMenuHtml = "";
		for(var subMenuID = 0; subMenuID<listJson.length; subMenuID++){
			var hrefStr = "javascript:void(0)";
			//if(listJson[subMenuID].singlePageMode){
			if(true){
				if(listJson[subMenuID].url!="" || listJson[subMenuID].url!=null){
					var url = getRootPath() + listJson[subMenuID].url;
					var parameterStr = topMenuID + '-' + subMenuID;
					var parameterMiniMenu = 'false';
					if(listJson[subMenuID].minMenu){
						if(listJson[subMenuID].minMenu == true){
							parameterMiniMenu = 'true';
						}
					}
					hrefStr = "javascript:nsFrame.loadMenuNew('"+url+"','"+parameterStr+"','"+parameterMiniMenu+"');";
				}
			}else{
				if(listJson[subMenuID].url!="" || listJson[subMenuID].url!=null){
					var urlStr = listJson[subMenuID].url;
					if(urlStr.indexOf('?')>-1){
						urlStr = urlStr+'&tid='+topMenuID+'&sid='+subMenuID;
					}else{
						urlStr = urlStr+'?tid='+topMenuID+'&sid='+subMenuID;
					}
					hrefStr = getRootPath() + urlStr;
				}
			}
			var activeHtml = subMenuID==sid?'class="opened active"':'';
			subMenuHtml+=
			 			'<li '+activeHtml+'>'
							+'<a href="'+hrefStr+'">'
								+'<span class="title">'+listJson[subMenuID].name+'</span>'
							+'</a>'
						+'</li>'
		}
		if(subMenuHtml!=""){
			subMenuHtml = '<ul>'+subMenuHtml+'</ul>'
		}
		return subMenuHtml;
	}
	function getIcon(name){
		var iconClass = mainmenu.mainmenuIconConfig[name];
		if(typeof(iconClass) == "undefined"){
			iconClass = "linecons-desktop";
		}
		return iconClass;
	}
}
mainmenu.initNavNew = function(tid,sid){
	var topNavHtml = "";
	if(tid!=-1){
		topNavHtml = 
			'<li>'
				+'<a href="javascript:void(0);">'+mainmenu.data.rows[tid].name+'</a>'
			+'</li>'
	}
	var subNavHtml = "";
	if(typeof(sid)=='undefined'){
		sid = -1;
	}
	if(sid!=-1){
		subNavHtml = 
			'<li>'
				+'<a href="javascript:void(0);">'+mainmenu.data.rows[tid].children[sid].name+'</a>'
			+'</li>'
	}
	var homeHref = getRootPath() + '/home';
	if(nsVals.homeUrl){
		homeHref = 'javascript:nsFrame.loadPage("'+nsVals.homeUrl+'");';
	}
	var homeHtml = 
		'<li>'
			+'<a href="'+homeHref+'"><i class="fa-home"></i>首页</a>'
		+'</li>'
	$("#breadcrumb-env ol").html(homeHtml+topNavHtml+subNavHtml);
}

/************** 新左侧菜单 买树宇 end **************/