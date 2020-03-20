var nsDataFormat = {}
nsDataFormat.formatProvince = (function($){
    var provinceNameByCode = {};
    var provinceInfoByCode = {};
    
    if($.isArray(provinceInfo)){
        var provinceInfoObj = {};
        function setprovinceInfoObj(arr, index){
            var end = index*2;
            var parentEnd = (index-1)*2;
            for(var i=0;i<arr.length;i++){
                var obj = arr[i];
                var code = obj.code;
                code = code.substring(0, end);
                var parentCode = code.substring(0, parentEnd);
                var parentObj = provinceInfoObj[parentCode];
                if(typeof(parentObj)=="object"){
                    var name = obj.name;
                    name = parentObj.name + ' ' + name;
                    obj.name = name
                }
                provinceInfoObj[code] = obj;
                if($.isArray(obj.sub)){
                    setprovinceInfoObj(obj.sub, index+1);
                }
            }
        }
        var _provinceInfo = $.extend(true, [], provinceInfo);
        setprovinceInfoObj(_provinceInfo, 1);
        for(var key in provinceInfoObj){
            provinceNameByCode[provinceInfoObj[key].code] = provinceInfoObj[key].name;
            provinceInfoByCode[provinceInfoObj[key].code] = provinceInfoObj[key];
        }
    }
    return {
        provinceInfo : provinceInfo,
        provinceNameByCode : provinceNameByCode, 
        provinceInfoByCode : provinceInfoByCode,
    }
})(jQuery)