/** 
 * 所配页面中显示每个模块
 * 
 * 入参:pageConfig 页面config   必传 
 *     isShowMask 是否显示遮罩  必传 true显示 false不显示
 *     indexObj 所选该字段下标  选传 {typeIndex:Number,fieldIndex:Number}(fieldIndex选传)
*/

var showModule = {
    packageName:"",
    components:[],
    pageField:[],
    currentPanel:{},

    // 初始化
    init:function(config,isShowMask,indexObj){
        var showMask = isShowMask;
        var pageConfig = "";
        if(!showMask == true){
            $(".mask").remove()
        }else{
            if(config.clickNodeEndHandler){
                pageConfig = config.pageConfig;
                showModule.controller.openEditByPosition = config.clickNodeEndHandler;
            }else{
                pageConfig = config;
            }
            // console.log(config);
            showModule.model.getBaseData(pageConfig,function(res){
                console.log("我要的数据",res);
                // setTimeout(()=>{
                    showModule.controller.drawBorderHtml(showMask);
                    if(showMask && indexObj){
                        showModule.controller.findDom(indexObj)
                    }
                    
                // },300);
            });
        }
        
        
    },
    // 数据层
    model:{
        // 获取基础数据
        getBaseData(pageConfig,cb){
            var _this = this;
            showModule.packageName = "nstemplate-layout-" + pageConfig.package.replace(/\./g, "-")+"-";
            showModule.components = pageConfig.components;
            _this.getMyData(showModule.components,cb);
        },
        // 将其变成一个二维数组
        /**
         * 
         * @param {*} components 数组
         * @param {*} cb 回调函数(转成二维数组)
         */
        getMyData(components,cb){
            var arr = [];
            for(var i = 0,len = components.length; i < len; i ++){
                var objPanel = {};
                objPanel.panelId = showModule.dealDataFuc.dealPanel(components[i].type,i)
                objPanel.panelName = components[i].type;
                objPanel.panelField = [];
                if((components[i].field) instanceof Array){
                    for(var j = 0,len1 = components[i].field.length; j < len1; j++){
                        objPanel.panelField.push((components[i].field[j].field) || (components[i].field[j].englishName) || (components[i].field[j].id)) 
                        // console.log((components[i].field[j].englishName) || (components[i].field[j].field) || (components[i].field[j].id))
                     };
                }
                arr.push(objPanel)
                
            };
            showModule.pageField = arr;
            cb(showModule.pageField)
        },

        
    },
    // 视图层
    view:{
        // 准备html工具
        // 面板的html
        panelHtml(param){
            var panelHtml = `<div class='hot-type state-default' data-paneltypefield=${JSON.stringify(param)} onclick="showModule.controller.pandelHandle(this)"></div>`
            return panelHtml;
        },
        // field字段的html
        panelFieldHtml(param){
            var panelFieldHtml = `<div class='hot-point state-default' data-paneltypefield=${JSON.stringify(param)} onclick="showModule.controller.pandelHandle(this)"></div>`;
            return panelFieldHtml;
        },
        // mask遮罩层
        maskHtml(){
            var mask = `<div class="mask"></div>`;
            return mask;
        },
        

    },
    // 业务逻辑层
    controller:{
        // 将model层的数据和view层html结构进行绑定
        drawBorderHtml(isShowMask){
            var _this = this;
            
            if(isShowMask){
                if($(".mask")[0]){
                    $(".mask").remove();
                };
                $(".main").append($(showModule.view.maskHtml()))
                var data = showModule.pageField;
                for(var i = 0,len = data.length; i < len; i ++){
                    var type = data[i];
                    var panelFieldsArr = type.panelField;
                    var domSizePlace = _this.getDomSizePlace($("#" + type.panelId))
                    $(".mask").append($(showModule.view.panelHtml({type:"template",typeIndex:i})).css(domSizePlace));
                    for(var j = 0,len1 = panelFieldsArr.length; j < len1; j ++){
                        var panelField = panelFieldsArr[j];
                        var obj = {info:showModule.components[i].field[j]};
                        var obj1 = {type:type.panelName,panelField:panelField,typeIndex:i,fieldIndex:j};
                        var domFieldSizePlace = _this.getDomSizePlace($("#" + type.panelId + " " + '[ns-field=' + panelField + ']'))
                        $(".mask").append($(showModule.view.panelFieldHtml(obj1)).css(domFieldSizePlace));
                    };
                }
            }else{
                $(".mask").remove();
            }
            
        },
        // 获取DOM元素的大小和位置
        getDomSizePlace(dom){
            var domSize = {
                width:dom.innerWidth(),
                height:dom.innerHeight()
            };
            var domPlace = dom.offset();
            var domplacesize = {};
            Object.assign(domplacesize,domSize,domPlace);
            var obj = {}
            for(var key in domplacesize){
                obj[key] = domplacesize[key] + "px";
            }
            return obj;
        },

        // 面板的点击事件
        pandelHandle(dom){
            $(".main .mask").children().removeClass("state-active");
            $(dom).addClass("state-active");
            var currentClickPanel = JSON.parse($(dom).attr("data-paneltypefield"));
            var info = showModule.controller.findsCptPanel(currentClickPanel);
            var obj = {};
            Object.assign(obj,currentClickPanel,info)
            showModule.currentPanel = obj;
            showModule.controller.openEditByPosition(showModule.currentPanel);
            // console.log("当前点击的面板",showModule.currentPanel)
        },
        // 根据点击的面板寻找components中对应的面板
        findsCptPanel(currentClickPanel){
            var componentsArr = showModule.components;
            var obj = {}
            if(currentClickPanel.fieldIndex != undefined){
                obj.info = componentsArr[currentClickPanel.typeIndex].field[currentClickPanel.fieldIndex];
            }else{
                obj.info = componentsArr[currentClickPanel.typeIndex]
            };
            return obj;
        },
        // 根据indexObj寻找面板中的对应的dom
        findDom(indexObj){
            $(".main .mask").children().removeClass("state-active");
            var domMaskArr = $(".mask").children();
            var currentDom = "";
            for(var i = 0,len = domMaskArr.length; i < len; i ++){
                var currentDomMask = JSON.parse($(domMaskArr[i]).attr("data-paneltypefield"));
                if(indexObj.fieldIndex != undefined){
                    if(indexObj.typeIndex == currentDomMask.typeIndex && indexObj.fieldIndex == currentDomMask.fieldIndex){
                        currentDom = domMaskArr[i];
                    }
                    
                }else{
                    if(indexObj.typeIndex == currentDomMask.typeIndex && currentDomMask.fieldIndex == undefined){
                        currentDom = domMaskArr[i]
                    }
                }
            };
            console.log(currentDom);
            $(currentDom).addClass("state-active");
            
        },
        

    },
    // 处理数据方法集合
    dealDataFuc:{
        // 处理panel(vo、list等)
        dealPanel(param,index){
            var panelId = "";
            if(param == "list"){
                panelId = showModule.packageName + param + "-" + index + "-headertable-container";
            }
            panelId = showModule.packageName + param + "-" + index;
            return panelId;
        }
    },
    
}