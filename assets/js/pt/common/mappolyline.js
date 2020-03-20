NetstarBDMapPolyLine = (function($){
    // 地图配置
    var configs = {};
    var config = {};
    // 设置默认配置
    function setDefault(){}
    // 设置默认配置
    function setConfig(){
        config.$container = $('#' + config.id);
        config.panelId = config.id + '-panel';
        config.mapId = config.id + '-panel-map';
        config.operateId = config.id + '-panel-operate';
        config.btnsId = config.id + '-panel-operate-btns';
        config.operateSelectId = config.id + '-panel-operate-select';
        config.polylinesManage = {
            index : -1,
            lines : [],
            isAllowDraw : false,    // 是否允许绘制折线
        }
    }
    // 验证config
    function validata(){
        return true;
    }
    // 获取地点信息
    function getAddressInfo(config, callBackFunc){
        var ajaxConfig = $.extend(true, {}, config.ajax);
        ajaxConfig.plusData = config.ajax;
        ajaxConfig.plusData.callBackFunc = callBackFunc;
        ajaxConfig.plusData.mapName = config.id;
        NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
            if(res.success){
                var plusData = _ajaxConfig.plusData;
                var data = res[plusData.dataSrc];
                if(typeof(plusData.callBackFunc) == "function"){
                    plusData.callBackFunc(data, plusData.mapName);
                }
            }
        }, true)
    }
    // 地图管理
    var mapManager = {
        html : '<div id="{{panelId}}" class="bdmap-polyline-container">'
                    //地图容器
                    + '<div id="{{mapId}}"  style="{{styleStr}}"></div>'
                    
                    //底部操作面板
                    + '<div id="{{operateId}}"  class="panel">'
                        //按钮容器
                        + '<div id="{{btnsId}}"  class="subpanel btns-container">'
                            + '<button ns-type="polyline" class="btn editor-btn">编辑模式</button>'
                        + '</div>'
                        //编辑模式下的操作组件(例如：选择线条select)的容器
                        + '<div class="subpanel select-container">'
                            + '<span class="title">请选择新增线段类型：</span>'
                            + '<select class="select" id="{{operateSelectId}}">'
                                + '<option value="1">在建</option>'
                                + '<option value="2">规划</option>'
                                + '<option value="3">完成</option>'
                            + '</select>'
                        + '</div>'
                    + '</div>'
                + '</div>',
        iconUrl : {
            "1" : {
                url : getRootPath() + '/public/static/assets/css/img/yuan2.png',
                size : new BMap.Size(22,22),
            },
            "2" : {
                url : getRootPath() + '/public/static/assets/css/img/yuan3.png',
                size : new BMap.Size(13,13),
            },
        },
        style : {
            circle : {
                strokeColor : 'red', 
                strokeWeight : 2, 
                strokeOpacity : 1,
                strokeStyle: "solid",
                fillOpacity : 0,
            },
            polyline : {
                strokeColor : "red",        //边线颜色
                strokeWeight : 3,           //边线的宽度，以像素为单位
                strokeStyle : 'solid',      //边线的样式，solid或dashed
                strokeOpacity : 1,
            }
        },
        lineLevelStyle : {
            "1" : {
                strokeColor : "#fc0100",
                strokeWeight : "4",
            },
            "2" : {
                strokeColor : "#000000",
                strokeWeight : "4",
            },
            "3" : {
                strokeColor : "#17179e",
                strokeWeight : "4",
            }
        },
        circleLevelStyle : {
            "1" : {
                strokeWeight : 3, 
                strokeColor : "red",
            },
            "2" : {
                strokeColor : "red",
            },
            "3" : {
                strokeColor : "black",
            }
        },
        // 获取容器
        getHtml : function(){
            var html = this.html;
            html = html.replace('{{panelId}}', config.panelId);
            html = html.replace('{{mapId}}', config.mapId);
            html = html.replace('{{btnsId}}', config.btnsId);
            html = html.replace('{{operateId}}', config.operateId);
            html = html.replace('{{operateSelectId}}', config.operateSelectId);
            var heightStr = "height:" + config.height + 'px';
            html = html.replace('{{styleStr}}', heightStr);
            return html
        },
        // 设置dom容器
        setContaine : function(_config){
            var html = this.getHtml(_config);
            _config.$container.html(html);
            _config.$panel = $('#' + _config.panelId);
            _config.$map = $('#' + _config.mapId);
            _config.$btns = $('#' + _config.btnsId).find('button');
            _config.$select = $('#' + _config.operateSelectId);
        },
        // 显示地图
        showMap : function(_config){
            var map = new BMap.Map(_config.mapId, { 
                enableMapClick : false,
                minZoom : 7,
                maxZoom : 10,
            });
            var poi = new BMap.Point(116.307852,40.057031);
            map.centerAndZoom(poi, 7);
            map.enableScrollWheelZoom();
            map.disableDoubleClickZoom();
            var control = new BMap.NavigationControl({
                type : BMAP_NAVIGATION_CONTROL_LARGE,
                anchor : BMAP_ANCHOR_TOP_RIGHT
            });
            map.addControl(control);
            _config.map = map;
        },
        // 标注地址
        addressMark : function(){
            var addressInfos = config.addressInfos;
            var map = config.map;
            var circleMarks = [];
            for(var i=0; i<addressInfos.length; i++){
                // var circleOptions = $.extend(true, {}, mapManager.style.circle);
                var level = addressInfos[i][config.levelField];
                // var circleStyle = mapManager.circleLevelStyle[level.toString()];
                // for(var key in circleStyle){
                //     circleOptions[key] = circleStyle[key];
                // }
                // 点
                var point = new BMap.Point(addressInfos[i][config.lngField], addressInfos[i][config.latField]);
                // 图片地址
                var iconObj = mapManager.iconUrl[level.toString()];
                var iconUrl = iconObj.url;
                var myIcon = new BMap.Icon(iconUrl, iconObj.size);
                var marker = new BMap.Marker(point, {
                    icon : myIcon
                });  // 创建标注
                map.addOverlay(marker);              // 将标注添加到地图中
                // switch(level.toString()){
                //     case "1":
                //         var circle = new BMap.Circle(point, 4000, circleOptions);
                //         map.addOverlay(circle);
                //         var _circleOptions = $.extend(true, {}, circleOptions);
                //         _circleOptions.fillColor = _circleOptions.strokeColor;
                //         _circleOptions.fillOpacity = 1;
                //         var _circle = new BMap.Circle(point, 2000, _circleOptions);
                //         // map.addOverlay(_circle);
                //         break;
                //     default:
                //         var circle = new BMap.Circle(point, 3000, circleOptions);
                //         map.addOverlay(circle);
                //         break;
                // }
                // var circleConfig = {
                //     map : map,
                //     circle : circle,
                //     point : point,
                //     addressInfo : addressInfos[i],
                // };
                // circleMarks.push(circleConfig);
                var circleConfig = {
                    map : map,
                    circle : marker,
                    point : point,
                    addressInfo : addressInfos[i],
                };
                circleMarks.push(circleConfig);
            }
            config.circleMarks = circleMarks;
        },
        // 折线点击方法
        polylineClickFunc : function(ev, lineData){
            console.log('polyline-click-event');
            var html = this.polylineHtml;
            if(typeof(config.polylineClickHandler) == 'function'){
                config.polylineClickHandler(ev, lineData);
            }
        },
        // 原始线
        polylineDraw : function(){
            var map = config.map;
            var polylineInfos = config.polylineInfos;
            /**
             * 折线点击事件执行执行方法
             */
            var lineClickAction = function(ev, lineData){
                console.log('polyline-click-event');
                if(typeof(config.polylineClickHandler) == 'function'){
                    config.polylineClickHandler(ev, lineData);
                }
            }
            for(var i=0; i<polylineInfos.length; i++){
                var points = [];
                var selectMark = [];
                var polylineInfo = polylineInfos[i];
                for(var j=0; j<polylineInfo.points.length; j++){
                    var addressInfo = polylineInfo.points[j];
                    var point = new BMap.Point(addressInfo[config.lngField], addressInfo[config.latField]);
                    points.push(point);
                    selectMark.push(addressInfo);
                }
                var level = polylineInfo[config.levelField];
                var lineStyle = mapManager.lineLevelStyle[level.toString()];
                var polylineOptions = $.extend(true, {}, mapManager.style.polyline);
                for(var key in lineStyle){
                    polylineOptions[key] = lineStyle[key];
                }
                var overlay = new BMap.Polyline(points, polylineOptions);
                var obj = {
                    overlay : overlay,
                    points : points,
                    selectMark : selectMark,
                }
                map.addOverlay(overlay);
                config.polylinesManage.lines.push(obj);
                config.polylinesManage.index ++;
                // 添加直线点击方法
                overlay.addEventListener("click", function(ev){
                    lineClickAction(ev, obj);
                });
            }
        },
        // 获取线样式
        getlineStyle : function(){
            var style = $.extend(true, {}, mapManager.style.polyline);
            var selectStyleLevel = config.$select.val();
            var selectStyle = mapManager.lineLevelStyle[selectStyleLevel];
            for(var key in selectStyle){
                style[key] = selectStyle[key];
            }
            return style;
        },
        // 设置事件
        setMarksEvent : function(){
            var circleMarks = config.circleMarks;
            var ponlylineDatas = config.ponlylineDatas;
            var map = config.map;
            var overlay = {};
            var points = [];
            var selectMark = [];
            // var polylineOptions = mapManager.style.polyline;
            var isBinded = false;   // 是否正在绘制
            var drawPoint = null;
            var polylinesManage = config.polylinesManage;
            function setEvent(circle, circleMark){
                /**
                 * 设置双击
                 */
                var dblclickEvent = function(){
                    for(var i=0; i<circleMarks.length; i++){
                        circleMarks[i].circle.addEventListener('dblclick', dblclickAction);
                    }
                }
                /**
                 * 移除双击
                 */
                var removeDblclickEvent = function(){
                    for(var i=0; i<circleMarks.length; i++){
                        circleMarks[i].circle.removeEventListener('dblclick', dblclickAction);
                    }
                }
                /**
                 * 移除mousedown
                 */
                var removeMousedownEvent = function(){
                    for(var i=0; i<circleMarks.length; i++){
                        circleMarks[i].circle.removeEventListener('mousedown');
                    }
                    map.removeEventListener('mousedown');
                }
                /**
                 * 折线点击事件执行执行方法
                 */
                var lineClickAction = function(ev, lineData){
                    console.log('polyline-click-event');
                    if(typeof(config.polylineClickHandler) == 'function'){
                        config.polylineClickHandler(ev, lineData);
                    }
                }

                /**
                 * 鼠标点下的事件
                 */
                var startAction = function(ev){
                    // 判断是否允许绘制
                    if(!polylinesManage.isAllowDraw){
                        // 不允许绘制
                        return;
                    }
                    // points.push(ev.point);
                    points.push(circleMark.point);
                    selectMark.push(circleMark);
                    drawPoint = points.concat(points[points.length - 1]);
                    if(points.length == 1){
                        // 第一个点
                        var polylineOptions = mapManager.getlineStyle();
                        overlay = new BMap.Polyline(drawPoint, polylineOptions);
                        // 重新画原 使折线在最前边
                        for(var i = 0; i < circleMarks.length; i++){
                            map.removeOverlay(circleMarks[i].circle);
                        }
                        map.addOverlay(overlay);
                        for(var i = 0; i < circleMarks.length; i++){
                            map.addOverlay(circleMarks[i].circle);
                        }
                    }else{
                        overlay.setPath(drawPoint);
                    }
                    if(!isBinded){
                        isBinded = true;
                        map.addEventListener('mousemove', mousemoveAction);
                        dblclickEvent();
                    }
                }
                /**
                 * 鼠标点击的事件
                 */
                var circleClickAction = function(ev){
                    // 判断是否允许绘制
                    if(polylinesManage.isAllowDraw){
                        // 允许绘制时点击不起作用
                        return;
                    }
                    console.log('circle-click-event');
                    if(typeof(config.circleClickHandler) == 'function'){
                        var obj = {
                            circle : circle,
                            selectMark : circleMark,
                        }
                        config.circleClickHandler(ev, obj);
                    }
                }
                /**
                 * 鼠标移动过程的事件
                 */
                var mousemoveAction = function(ev) {
                    overlay.setPositionAt(drawPoint.length - 1, ev.point);
                }

                /**
                 * 鼠标双击的事件
                 */
                var dblclickAction = function(ev){
                    if(!isBinded){
                        // 还没有开始绘制 点击事件不起作用
                        return;
                    }
                    isBinded = false;
                    removeMousedownEvent();
                    removeDblclickEvent();
                    map.removeEventListener('mousemove', mousemoveAction);
                    // 删除最后一个点 原因：双击时执行了两遍mousedown
                    points.pop();
                    selectMark.pop();
                    var obj = {
                        overlay : overlay,
                        points : points,
                        selectMark : selectMark,
                    }
                    config.polylinesManage.lines.push(obj);
                    config.polylinesManage.index ++;
                    // 添加直线点击方法
                    overlay.addEventListener("click", function(ev){
                        lineClickAction(ev, obj);
                    });
                    // 恢复初始
                    overlay = {};
                    points = [];
                    selectMark = [];
                    polylinesManage.isAllowDraw = false;
                }
                circle.addEventListener("mousedown", startAction);
                circle.addEventListener("click", circleClickAction);
            }
            for(var i=0; i<circleMarks.length; i++){
                var circle = circleMarks[i].circle;
                setEvent(circle, circleMarks[i]);
            }
        },
        // 设置放大缩小
        setEnlargeNarrow : function(type){
            var map = config.map;
            switch(type){
                case 'enlarge':
                    // 放大
                    map.zoomIn();
                    break;
                case 'narrow':
                    // 缩小
                    map.zoomOut();
                    break;
            }
        },
        // 设置按钮事件
        setBtnsEvent : function(){
            var $btns = config.$btns;
            $btns.off('click');
            $btns.on('click', function(ev){
                var $button = $(ev.currentTarget);
                var nsType = $button.attr('ns-type');
                switch(nsType){
                    case 'polyline':
                        // 折线
                        config.polylinesManage.isAllowDraw = true;
                        break;
                    case 'enlarge':
                    case 'narrow':
                        // 放大 缩小
                        mapManager.setEnlargeNarrow(nsType);
                        break;
                }
            });
        },
        init : function(){
            this.setContaine(config);
            this.showMap(config);
            this.polylineDraw();
            this.addressMark();
            this.setMarksEvent();
            this.setBtnsEvent();
        },
    }
    // 刷新
    function refresh(id){
        config = configs[id].config;
        getAddressInfo(config, function(data, mapName){
            var _config = configs[mapName].config;
            _config.addressInfos = data;
            mapManager.init();
        })
    }
    // 初始化
    function init(_config){
        var isTrue = validata(_config);
        if(isTrue){
            config = _config;
            configs[config.id] = {
                config : config,
                source : $.extend(true, {}, config),
            };
            setDefault(config);
            setConfig(config);
            getAddressInfo(_config, function(data, mapName){
                var __config = configs[mapName].config;
                __config.addressInfos = data;
                mapManager.init();
            })
        }
    }
    return {
        init : init,
        refresh : refresh,
        configs : configs,
    }
})($)