/**
 * validator 默认值设置
 * 
 * @returns
 */
// 手机号码验证
$.validator.addMethod("ismobile", function(value, element) {
	var ismobile=/^(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9]|19[0-9])\d{8}$/;  
	var tel = /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;//d*$;
	return this.optional(element) || (tel.test(value) || ismobile.test(value));
}, language.common.validate.ismobileError);

//自动完成搜索

//邮政编码验证
$.validator.addMethod("postalcode", function(value, element) { 
	return this.optional(element) || (/^[0-9]\d{5}$/.test(value));
}, language.common.validate.postcodeError);

//年份的验证
$.validator.addMethod("year", function(value, element) { 
	return this.optional(element) || (/(19[\d][\d]|20[\d][\d])$/.test(value) && value.length <= 4);
}, language.common.validate.yearSection);

//月份的验证
$.validator.addMethod("month", function(value, element) { 
	return this.optional(element) || (value >= 1 && value <= 12);
}, language.common.validate.monthSection);
//身份证号的验证
$.validator.addMethod("Icd", function(value, element) { 
	return this.optional(element) || (IdentityCodeValid(value));
}, language.common.validate.IcdLegitimate);

//luhmCheck银行卡号验证
$.validator.addMethod("bankno", function(value, element) { 
	return this.optional(element) || (luhmCheck(value));
}, language.common.validate.banknoLegitimate);

function stripHtml(value) {
	// remove html tags and space chars
	return value.replace(/<.[^<>]*?>/g, " ").replace(/&nbsp;|&#160;/gi, " ")
	// remove punctuation
	.replace(/[.(),;:!?%#$'\"_+=\/\-“”’]*/g, "");
}
/*$.validator.addMethod("maxWords", function(value, element, params) {
	return this.optional(element) || stripHtml(value).match(/\b\w+\b/g).length <= params;
}, $.validator.format("Please enter {0} words or less."));*/

$.validator.addMethod("precision", function(value, element, params) {
	return this.optional(element) || (commonConfig.getRulesPrecisionNumber(value,params));
}, language.common.validate.wrongful);

$.extend($.validator.messages, {
	required:language.common.validate.required,
	remote: language.common.validate.remote,
	email: language.common.validate.email,
	url: language.common.validate.url,
	date: language.common.validate.date,
	dateISO: language.common.validate.dateISO,
	number:language.common.validate.number,
	positiveInteger:language.common.validate.positiveInteger,
	integer:language.common.validate.integer,
	digits:language.common.validate.digits,
	creditcard: language.common.validate.creditcard,
	equalTo: language.common.validate.equalTo,
	extension: language.common.validate.extension,
	maxlength: $.validator.format(language.common.validate.maxlength),
	minlength: $.validator.format(language.common.validate.minlength),
	rangelength: $.validator.format(language.common.validate.rangelength),
	range: $.validator.format(language.common.validate.range),
	max: $.validator.format(language.common.validate.max),
	min: $.validator.format(language.common.validate.min)
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
	if(value == language.common.validate.required){
		isSelect = false;
	}
	if(value == language.common.validate.optional){
		isSelect = false;
	}
	if(value == language.common.validate.select){
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