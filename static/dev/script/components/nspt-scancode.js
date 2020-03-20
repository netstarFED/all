NetstarUI.scanCode = {
    keydownCodeArray:[],
    recordCodeArray:[],
    getStrByKeyCode:function(code){
        var str = code;
        if(code == 16){
            str = '';
        }else if(code == 189){
            str = '-';
        }else{
            str = String.fromCharCode(str);
        }
        return str;
    },
    bindDocumentKeyupByCode:function(ev){	
        //console.log('keyup')
        var isContinue = false;
        if(ev.data){
            if($('#'+ev.data.id).length > 0){
                isContinue = true;
            }
        }
        if(isContinue == false){
            $(document).off('keyup',NetstarUI.scanCode.bindDocumentKeyupByCode);
            return;
        }
        $('#'+ev.data.id).val('');
        var keydownCodeArray = NetstarUI.scanCode.keydownCodeArray;
        var str = String.fromCharCode(ev.keyCode);
        var isEnter = ev.keyCode == 13;
        if(isEnter == false){
            //不是回车则添加到数组
            var keyInfo = {
                keyCode:ev.keyCode,
                //keyChar:String.fromCharCode(ev.keyCode),
                keyChar:NetstarUI.scanCode.getStrByKeyCode(ev.keyCode),
                ts:new Date().getTime(),
                tsDistance:0,
            }
            if(keydownCodeArray.length > 0){
                keyInfo.tsDistance = keyInfo.ts - keydownCodeArray[keydownCodeArray.length-1].ts;
            }
        //	console.log(keyInfo);
            keydownCodeArray.push(keyInfo);
            
        }else{
            //如果是回车，则可能是扫描条码了
            var disArr = [];
            var lastInputIndex = 0;
            for(var i = keydownCodeArray.length - 1;  i>=0;  i--){
                disArr.push(keydownCodeArray[i].tsDistance);
                var tsDistance = keydownCodeArray[i].tsDistance;
                if(tsDistance > 100){
                    lastInputIndex = i;
                    //console.log("lastInputIndex:"+lastInputIndex);
                    break;
                }
            }
            var first = lastInputIndex;
            var codeStr = '';
            var codeArray = [];
            for(var codeI = first; codeI< keydownCodeArray.length; codeI++ ){
                codeStr += keydownCodeArray[codeI].keyChar;
                codeArray.push(keydownCodeArray[codeI]);
            }
            //console.log(keydownCodeArray);
            //console.log(disArr);
            //console.log(codeStr);
            //console.log(codeArray);
            NetstarUI.scanCode.keydownCodeArray = [];
            if(codeStr){
                //console.log(codeStr)
                if(typeof(ev.data.callBackFunc)=='function'){
                    ev.data.callBackFunc(codeStr);
                }
            }
        }
    },
    listener:function(data){
        NetstarUI.scanCode.keydownCodeArray = [];
        NetstarUI.scanCode.recordCodeArray = [];
        NetstarUI.scanCode.data = data;
        $(document).off('keyup',NetstarUI.scanCode.bindDocumentKeyupByCode);
        $(document).on('keyup',data,NetstarUI.scanCode.bindDocumentKeyupByCode);
    },
    remove:function(){
        $(document).off('keyup',NetstarUI.scanCode.bindDocumentKeyupByCode);
    },
}
NetstarUI.scanCode.remove();