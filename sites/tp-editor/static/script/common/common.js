// 添加的方法
var nsPublic = {
    getAppendContainer: function () {
        var insertLocation = $('container:not(.hidden)').not('.content');
        if ($('.nswindow .content').length > 0) {
            insertLocation = $('.nswindow .content:last');
        }
        return insertLocation;
    }
};

// 初始化页面时先用jquery初始,否则右侧面板不能使用
$(".main").append('<container class="pageView"></container>');

// 插入遮罩层mask-html文件
var insertMaskHtml = {
    container: `<div class="mask">
                    <div class="hot-area"></div>
                    <div class="mask-bg"></div>
                </div>`,
    insertMask: function () {
        var _this = this;
        $(".main").append(_this.container);
    }
};
insertMaskHtml.insertMask()

var config = ajaxDataJson();

// 获取key-value的json配置文件
function ajaxDataJson() {
    var obj = {};
    $.ajax({
        type: 'GET',
        url: '../home/codeMirror/pageKeyValue.json',
        dataType: "json",
        success: ((data) => {
            for (var key in data) {
                if (data[key] == "function") {
                    obj[key] = ["function(){}"];
                } else if (data[key] == "boolean") {
                    obj[key] = ["true", "false"];
                } else if (data[key] == "string") {
                    obj[key] = ['""'];
                } else if (data[key] == "number") {
                    obj[key] = [''];
                } else if (data[key] == "object") {
                    obj[key] = ['{}'];
                } else if (data[key] == "array") {
                    obj[key] = ['[]'];
                } else {
                    var array = [];
                    for (var i = 0; i < data[key].length; i++) {
                        var str =  data[key][i] ;
                        array.push(str);
                    }
                    obj[key] = array;
                }
            }
        })
    });
    return obj;
}


// 设定接口前缀
function getRootPathUrl() {
    var urlPrefix = JSON.parse(localStorage.getItem('NetstarResetServerInfo')).url;
    return urlPrefix;
}
// 获取token
function getHeader(index) {
    var contentType = ["application/json", "application/x-www-form-urlencoded"]
    var token = JSON.parse(localStorage.getItem('Authorization')).code;
    return {
        Authorization: token,
        "Content-Type": contentType[index]
    }
}


