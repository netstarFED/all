var nsValid = {};
nsValid.msg = {
	required: "必填",
	remote: "验证未通过",
	email: "电子邮件",
	url: "有效网址",
	date: "不合法",
	dateISO: "有效日期 (YYYY-MM-DD)",
	number: "仅限数字",
	money: "仅限数字",
	positiveInteger:"正整数",
	integer:"整数",
	digits: "只能是数字",
	creditcard: "有效的信用卡号码",
	equalTo: "两次输入不同",
	extension: "后缀无效",
	maxlength: $.validator.format("最多 {0} 个字符"),
	minlength: $.validator.format("最少 {0} 个字符"),
	rangelength: $.validator.format("长度在 {0} 到 {1} 之间"),
	range: $.validator.format("范围在 {0} 到 {1} 之间"),
	max: $.validator.format("不大于 {0} 的数值"),
	min: $.validator.format("不小于 {0} 的数值"),
	ismobile:'手机号有误',
	mobile:'手机号有误',
	isphone:'座机号有误',
	phone:'座机号有误',
	isphone:'座机号有误',
	bankno:'银行卡号有误',
	postalcode:'邮政编码有误',
	tablename:'表名不合法',
	year:'年份有误',
	month:'月份有误',
	Icd:'身份证号有误',
	precision:'数字不合法',
	radio:'必填',
	checkbox:'必填',
	negative:'只能是负数',
	nonnegativeInteger:'只能是非负整数',
	nonnegative:'只能是非负数',
}
nsValid.getRules = function(ruleM,formID){
	var matchRules;
	var rules = ruleM;
	var value = {};
	var rulesNumber;
	if(rules.indexOf('=') > -1){
		//含有=号的
		//minlength min max maxlength precison equalTo range rangelength
		rules = rules.substring(0,rules.lastIndexOf('='));
		rulesNumber = ruleM.substring(ruleM.lastIndexOf('=')+1,ruleM.length);
	}
	switch(rules){
		case 'required':
		case 'radio':
		case 'checkbox':
		case 'number':
		case 'money':
		case 'positiveInteger':
		case 'nonnegativeInteger':
		case 'nonnegative':
		case 'integer':
		case 'email':
		case 'ismobile':
		case 'postalcode':
		case 'year':
		case 'month':
		case 'url':
		case 'date':
		case 'dateISO':	
		case 'Icd':
		case 'bankno':
		case 'select':
		case 'select2':
		case 'uploadSingle':
		case 'tablename':
		case 'negative':
			matchRules = true;
			break;

		case 'min':
			matchRules = rulesNumber;
			matchRules = Number(matchRules);
			break;
		case 'minlength':
			matchRules = rulesNumber;
			matchRules = Number(matchRules);
			break;
		case 'max':
			matchRules = rulesNumber;
			matchRules = Number(matchRules);
			break;
		case 'maxlength':
			matchRules = rulesNumber;
			matchRules = Number(matchRules);
			break;
		case 'range':
		case 'rangelength':
			matchRules = rulesNumber;
			break;
		case 'precision':
			matchRules = rulesNumber;
			matchRules = Number(matchRules);
			break;

		case 'equalTo':
			var toIDStr = ruleM;
			toIDStr = toIDStr.substr(toIDStr.indexOf("=")+1,toIDStr.length);
			toIDStr = "form-"+formID+"-"+toIDStr;
			matchRules = "#"+toIDStr;
			break;
		default:
			matchRules = false;
			break;
	}
	value.type = rules;
	value.rules = matchRules;
	return value;
}
nsValid.test = function(value,reg){
	var isPass = false;
	var debugerMatch = false;
	var regStr;
	var compareNum = 0;
	if(reg.indexOf('=') > -1){
		//含有=号的
		//minlength min max maxlength precison range rangelength
		compareNum = reg.substring(reg.lastIndexOf('=')+1,reg.length);
		reg = reg.substring(0,reg.lastIndexOf('='));
	}
	switch(reg){
		case 'ismobile':
		case 'mobile':
			//手机号验证
			regStr=/^(13[0-9]|14[0-9]|15[0-9]|16[0-9]|17[0-9]|18[0-9]|19[0-9])\d{8}$/;
			if(regStr.test(value)){
				isPass = true;
			}
			break;
		case 'isphone':
		case 'phone':
			//固定电话验证
			regStr = /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;//d*$;
			if(regStr.test(value)){
				isPass = true;
			}
			break;
		case 'postalcode':
			//邮政编码验证
			regStr = /^[0-9]\d{5}$/;
			if(regStr.test(value)){
				isPass = true;
			}
			break;
		case 'tablename':
			//只能输入26个英文字母和下划线
			regStr = /^[a-zA-Z_]*$/;
			if(regStr.test(value)){
				isPass = true;
			}
			break;
		case 'year':
			//年份验证
			regStr = /(19[\d][\d]|20[\d][\d])$/;
			if(regStr.test(value)){
				isPass = true;
			}
			break;
		case 'month':
			//月份验证
			regStr=/^(0?[1-9]|1[0-2])$/;
			if(regStr.test(value)){
				isPass = true;
			}
			break;
		case 'bankno':
			//银行卡号验证
			isPass = nsValid.bankno(value);
			break;
		case 'Icd':
			//身份证号验证
			isPass = nsValid.Icd(value);
			break;
		case 'positiveInteger':
		    //正整数验证
		    var g = /^[1-9]*[1-9][0-9]*$/;
		    if(g.test(value)){
		    	isPass = true;
		    }
		    break;
		case 'nonnegativeInteger':
		    //非负整数验证
		    var g = /^([1-9]\d*|[0]{1,1})$/;
		    if(g.test(value)){
		    	isPass = true;
		    }
		    break;
		case 'nonnegative':
		    //非负数验证
		    var g = /^\d+(\.{0,1}\d+){0,1}$/;
		    if(g.test(value)){
		    	isPass = true;
		    }
		    break;
		case 'integer':
		     //整数验证
		     /*var reg = /^-?[1-9]*[1-9][0-9]*$/;*/
		     var reg = /^-?\d+$/;
		     if(reg.test(value)){
		     	isPass = true;
		     }
		     break;	
		case 'max':
			if(Number(value) <= compareNum){
				isPass = true;
			}
			break;
		case 'negative':
			//负数验证
			if(Number(value) <= 0){
				isPass = true;
			}
			break;
		case 'email':
		     //邮箱验证
		     var reg = /^([a-zA-Z0-9\._-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
		     if(reg.test(value)){
		     	isPass = true;
		     }
		     break;
		default:
			debugerMatch = true;
			break;
	}
	if(debugerMode){
		if(debugerMatch){
			nsAlert('( '+reg+' ) 规则参数错误');
			isPass = false;
		}
	}
	return isPass;
}
//银行卡号验证
nsValid.bankno = function(bankno){
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
nsValid.Icd = function(code){
	//身份证只能是18或者15位
	if(code.length==18 || code.length==15){
		//继续走验证
	}else{
		return false;
	}
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
//小数位数验证
nsValid.precision = function(elestr,rules){
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
//身份证号的验证
$.validator.addMethod("Icd", function(value, element) { 
	return this.optional(element) || (nsValid.Icd(value));
}, nsValid.msg.Icd);
//nsValid.bankno银行卡号验证
$.validator.addMethod("bankno", function(value, element) { 
	return this.optional(element) || (nsValid.bankno(value));
}, nsValid.msg.bankno);

 // 电话号码验证
$.validator.addMethod("isphone", function(value, element) {
	return this.optional(element) || (nsValid.test(value,'isphone'));
}, nsValid.msg.isphone);
$.validator.addMethod("phone", function(value, element) {
	return this.optional(element) || (nsValid.test(value,'phone'));
}, nsValid.msg.phone);
// 手机号码验证
$.validator.addMethod("ismobile", function(value, element) {
	var ismobile=/^(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9])\d{8}$/;  
	var tel = /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;//d*$;
	return this.optional(element) || (nsValid.test(value,'ismobile'));
}, nsValid.msg.ismobile);
$.validator.addMethod("mobile", function(value, element) {
	var ismobile=/^(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9])\d{8}$/;  
	var tel = /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;//d*$;
	return this.optional(element) || (nsValid.test(value,'mobile'));
}, nsValid.msg.mobile);
//邮政编码验证
$.validator.addMethod("postalcode", function(value, element) { 
	return this.optional(element) || (nsValid.test(value,'postalcode'));
}, nsValid.msg.postalcode);
//邮箱验证
$.validator.addMethod("email", function(value, element) { 
	return this.optional(element) || (nsValid.test(value,'email'));
}, nsValid.msg.email);
//26个英文字母带下划线的验证
$.validator.addMethod("tablename", function(value, element) { 
	return this.optional(element) || (nsValid.test(value,'tablename'));
}, nsValid.msg.tablename);
//年份的验证
$.validator.addMethod("year", function(value, element) { 
	return this.optional(element) || (nsValid.test(value,'year'));
}, nsValid.msg.year);
//月份的验证
$.validator.addMethod("month", function(value, element) { 
	return this.optional(element) || (nsValid.test(value,'month'));
}, nsValid.msg.month);
$.validator.addMethod("precision", function(value, element, params) {
	return this.optional(element) || (nsValid.precision(value,params));
}, nsValid.msg.precision);
//正整数
$.validator.addMethod("positiveInteger",function(value,element){
  return this.optional(element) || (nsValid.test(value,'positiveInteger'));
},nsValid.msg.positiveInteger);
//非负整数
$.validator.addMethod("nonnegativeInteger",function(value,element){
  return this.optional(element) || (nsValid.test(value,'nonnegativeInteger'));
},nsValid.msg.nonnegativeInteger);
//非负数
$.validator.addMethod("nonnegative",function(value,element){
  return this.optional(element) || (nsValid.test(value,'nonnegative'));
},nsValid.msg.nonnegative);
//整数
$.validator.addMethod("integer",function(value,element){
  return this.optional(element) || (nsValid.test(value,'integer'));
},nsValid.msg.integer);
//负数
$.validator.addMethod("negative",function(value,element){
  return this.optional(element) || (nsValid.test(value,'negative'));
},nsValid.msg.negative);
//货币
$.validator.addMethod("money",function(value,element){
  return this.optional(element) || (nsValid.test(value,'money'));
},nsValid.msg.number);
$.extend($.validator.messages,nsValid.msg);
$.validator.setDefaults({
	errorClass:"has-error",
	validClass: "has-success",
});