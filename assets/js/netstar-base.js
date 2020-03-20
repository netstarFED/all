var nsUI = {};
var nsTree = {};
var nsFullcalendar = {};
var nsVals = {};
var debugerMode = true;		//是否开启调试模式，发布情况下必须关闭，会严重影响性能，并带来兼容性问题
var nsFormBase = {}; 		//基础表单组件 common/nsformbase.js
var nsDebuger = {};
var personUI = {};
var treeUI = {};
var isFullScrenn=false;
var mainmenu={};
var systemPeronselect = {
	person:{
		data:[],
		config:{}
	},
	group:{
		data:[],
		config:{}
	}
}
var baseFrame={};
var nsNav={};
var controlPlane={};
var nsMultiSelect={};
var formPlane={};
formPlane.data = {};
formPlane.rules = {};
formPlane.dropzoneFileJson = {};//存放的是当前上传文件的dom,在清空form表单的时候会用到
formPlane.dropzoneGetFile = {};//存放的是当前上传文件的file,清空删除文件都会用到，一个文件可以上传多个，所以存放每个下标和file对应值
formPlane.tempFileJson = {};//存放的是文件数量
formPlane.dropzoneStr = {};//一个表单支持多个上传组件，{'upload1':[],'upload2':[]} 
formPlane.uploadImageJson = {};//上传成功之后的显示图片
formPlane.dropzoneDataJson = {};
formPlane.selectTwoDom = {}; //存放select2元素
var nsForm=formPlane;
var nsFrame={};
var nsLayout={};
var commonConfig={};
var provinceSelect = {};
var popupBox = {};
var nsdialog = popupBox;
var popupBoxMore = {};
var nsdialogMore = popupBoxMore;
$.fn.datepicker.dates.cn = language.cn;
$.fn.datepicker.defaults.language = 'cn';
/******自动高度面板*************************/
$(document).ready(function(){
	//var maxHeight = $(window).height()-182;
	//$(".nspanel-autoheight").height(maxHeight);
	baseFrame.init();
});