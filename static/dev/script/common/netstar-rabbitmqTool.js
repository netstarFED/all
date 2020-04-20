var NetStarUtil = {
    rabbitmq:{},
    wangxingTong:{}
};


/**
 * rabbitmq订阅消息,取消订阅消息
 * param : exchange(交换机的名称) routingKey(路由) callback(回调函数)
 * 
 */
// NetStarUtil.rabbitmq.subscribeData = [];
// 订阅消息
NetStarUtil.rabbitmq.subscribe = function(exchange,routingKey,callback,client){
    var rabbitmqInit = {};
    if(!NetStarRabbitMQ.config){
        nsAlert("rabbitmq初始化失败");
        return;
    };
    if(!client){
        rabbitmqInit.client = NetStarRabbitMQ.client
    }else{
        rabbitmqInit.client = client;
    }
    // var ws = NetStarRabbitMQ.config.ws;
    
    // var client = Stomp.client(ws);
    // client.connect('admin','NetStar@123',function(){
        var target = "/exchange/" + exchange + "/" + routingKey; // 目标
        // 订阅该目标的消息
        rabbitmqInit.client.subscribe(target,function(data){
            // console.log("订阅的消息",data);
            var messageObj = JSON.parse(data.body);
            var obj = {};
            obj[exchange + routingKey] = messageObj;
            console.log("订阅的消息",obj)
            // NetStarUtil.rabbitmq.subscribeData.push(obj);
            callback(messageObj);
        })
    // },function(err){
    //     console.log(err);
    //     nsAlert('rabbitmq服务器连接出错')
    // })
}
// 取消订阅
NetStarUtil.rabbitmq.unSubscribe = function(exchange,routingKey,callback){

}
/**
 * 连接本地websocket服务器(拍照)
 * @param command   Obj  对象  {command:'打开摄像头'}或{command:'关闭摄像头'} 
 * @param callback  Fun  回调函数   传出一个参数 {messageType: "camaraData",image:"base64格式图片"}
 * 注: 1.必须在本地开启网星通服务器(NetStarTray.exe)
 *     2.指令必须写正确;
 *     3.调用NetStarUtil.wangxingTong.websocket(...)
 */
NetStarUtil.wangxingTong.websocket = function(command,callback){
    var ws = new WebSocket("ws://127.0.0.1:8888/Chat");
    NetStarUtil.wangxingTong.wsClient = ws;
    NetStarUtil.wangxingTong.wsClient.onopen = function(){
        console.log("Connection open ...");
        // 发送指令
        NetStarUtil.wangxingTong.wsClient.send(JSON.stringify(command));
    }
    NetStarUtil.wangxingTong.wsClient.onmessage = function(evt) {
        console.log("Received Message: " + evt.data);
        var obj = JSON.parse(evt.data);
        obj.image = "data:image/png;base64," + obj.image;
        callback(obj);
        NetStarUtil.wangxingTong.wsClient.close();
    };
    NetStarUtil.wangxingTong.wsClient.onclose = function(evt) {
        console.log("Connection closed.");
    }
}
/**
 * 功能:上传base64图片
 * 
 *           参数名      参数类型(英)     参数类型(中文)                     说明
 * @param  baseImageUrl    String            字符串                 base64格式的图片地址
 * @param  fileName        String            字符串                 base64格式的图片名称
 * @param  callback       Function           函数                回调函数,参数为服务器传回来的图片Id
 * 注: 1.调用NetStarUtil.wangxingTong.upLoadImage.init(...)
 *     2.可通过NetStarUtil.wangxingTong.upLoadImage.baseCode 访问当前base64格式的图片地址
 */
NetStarUtil.wangxingTong.upLoadImage = {
    baseCode:"",
    init:function(baseImageUrl,fileName,callback){
        var _this = this;
        _this.baseCode = baseImageUrl;
        _this.upLoadImage(baseImageUrl,fileName,function(res){
            callback(res)
        })
    },
    /**
     * @param base64Codes  图片的base64编码 
     * @param fileName     图片名称
     */
    upLoadImage:function(base64Codes,fileName,callback){
        var _this = this;
        var formData = _this.dataURLtoFile(base64Codes,fileName);
        console.log(formData);
        $.ajax({
            url: getRootPath() + "/files/uploadList",
            type: "POST",
            data: formData,
            contentType: false,
            processData: false, //默认为true，默认情况下，发送的数据将被转换为对象，设为false不希望进行转换
            headers: {
                authorization: NetStarUtils.OAuthCode.get()
            },
            success: function(res) {
                console.log(res);
                if(res.success){
                    callback(res);
                }else{
                    var obj = {status:false,info:"传参错误"}
                    callback(obj)
                }
            },
            fail:function(err){
                var obj = {status:false,info:err}
                callback(obj);
            }
        })
    },
    /**  
     * 将以base64的图片url数据转换file类型 
     * @param dataurl  用url方式表示的base64图片数据  
     * @param fileName 图片名称
     */  
    dataURLtoFile:function(dataurl,fileName){  
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),n = bstr.length,u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        var blob = new File([u8arr], fileName,{type:mime});
        var canvas = document.createElement('canvas');
        var formData = new FormData(document.forms[0]);
        formData.append("files", blob, fileName);
        return formData;
    }  
}
