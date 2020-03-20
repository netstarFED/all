/*
 * 表单用户管理面板
 */
 nsUI.jsplumb = {};
 nsUI.jsplumb.init = function(_config){
 	var config = _config;//所有配置参数
 	var dataSourceArray = config.ajax.dataSource;//数据源读取
 	function initNodeByData(_configObj){
 		var configObj = _configObj;
		var nodeList = configObj.nodeList;//节点数据定义
		var linkList = configObj.linkList;//链接连的定义
		var dictArray = nodeList.dictionary;//字典数据
		var nodeDataArray = $.extend(true,[],dataSourceArray[nodeList.keyField]);//节点数据
		var linkDataArray = $.extend(true,[],dataSourceArray[linkList.keyField]);//连接端点的数据
		var $container = $('#'+configObj.containerId);//容器
		var nodeHtml = '';//节点输出
		if(!$.isArray(dictArray)){dictArray = [];}
		//循环输出节点内容
		//根据节点来源存储object数据
		var nodeSourceData = {};
		for(var sourceI=0; sourceI<nodeDataArray.length; sourceI++){
			var sourceData = nodeDataArray[sourceI];
			nodeSourceData[sourceData[nodeList.keyIndexField]] = sourceData;
		}
		//从大到小排序
		//var rootNodes = nsDataFormat.convertToTree(linkDataArray,'to','from','children');
		//console.log(rootNodes)
		//console.log(nodeSourceData)


		for(var nodeI=0; nodeI<nodeDataArray.length; nodeI++){
			var nodeData = nodeDataArray[nodeI];
			var location = nodeData[nodeList.locationField].split(' ');//空格拆分
			var styleStr = 'left:'+location[0]+'px;top:'+location[1]+'px;';//位置获取
			var nodeId = 'chartwindow'+nodeData[nodeList.keyIndexField];//节点id是自定义字段加节点位置
			var classStr = '';//定义class
			//循环读取字典根据字典添加class
			if(dictArray.length > 0){
				for(var dictI=0; dictI<dictArray.length; dictI++){
					var dictData = dictArray[dictI];
					for(var dict in dictData.data){
						if(nodeData[dictData.id] === dict){
							classStr = dictData.data[dict];
						}
					}
				}
			}else{
				//没有字典，走默认返回参数值判断
				switch(nodeData.category){
					case 'Start':
						classStr = 'jsplumb-process-start';
						break;
					case 'End':
						classStr = 'jsplumb-process-end';
						break;
					case 'WSWaiting':
						classStr = 'jsplumb-process-WSWaiting';
				}
				if(nodeData.figure === 'Diamond'){classStr = 'jsplumb-process-diamond';}
			}
			nodeHtml += '<div class="window '+classStr+'" id="'+nodeId+'" ns-index="'+nodeI+'" style="'+styleStr+'" ns-id="'+nodeData[nodeList.idField]+'">'
							+nodeData[nodeList.textField]
							+'</div>';
		}
		$container.html(nodeHtml);
		$container.children('.window').off('click');
		$container.children('.window').on('click',function(ev){
			var $this = $(this);
			var workItemId = $this.attr('ns-id');
			var nsIndex = $this.attr('ns-index');
			var obj = {
				id:workItemId,
				data:nodeDataArray[nsIndex]
			};
			if(typeof(config.clickChangeHandler)=='function'){
				config.clickChangeHandler(obj);
			}
		});
		$container.children('.window').on('mouseenter',function(ev){
			var $this = $(this);
			var workItemId = $this.attr('ns-id');
			var nsIndex = $this.attr('ns-index');
			var obj = {
				id:workItemId,
				data:nodeDataArray[nsIndex]
			};
			if(typeof(config.mouseEnterChangeHandler)=='function'){
				config.clickChangeHandler(obj);
			}
		});
		//实例化jsplumb
		var color = "gray";
		var myJsPlumb = jsPlumb.getInstance({
			/*ConnectionOverlays: [
				["Arrow",{
						location: 1,
						visible:true,
						width:11,
						length:11,
						id:"ARROW",
						events:{
							click:function() { alert("you clicked on the arrow overlay")}
						}
					}],
				["Label",{
					location: 0.1,
					id: "label",
					cssClass: "aLabel",
					events:{
						tap:function() { alert("hey"); }
					}
				}]
			],
			HoverPaintStyle: {stroke: "#ec9f2e" },
			EndpointHoverStyle: {fill: "#ec9f2e" },
			overlays: [
				"Arrow"
			],
			*/
			Connector: [ "Straight", {} ],// curviness: 50  StateMachine
			DragOptions: { cursor: "pointer", zIndex: 2000 },
			PaintStyle: { stroke: color, strokeWidth: 2 },
			EndpointStyle: { fill: 'transparent' },//radius: 9, 
			Container: config.containerId,//要连接的节点的父元素	
		});
		//暂停绘图和初始化。
		myJsPlumb.batch(function(){
			//声明常用值
			var arrowCommon = {
				foldback:0.5,// 沿着箭头轴线向尾部指向折返的距离
				fill:color,
				width:8,//从箭头尾部到头部的距离
			};
			//使用参数规范创建两个具有公共值的不同箭头：
			/*叠加= [
			Arrow(箭头)  Label(标签) PlainArrow(箭头形状为三角形，无折返) Diamond(钻石) Custom
				[“箭头”，{位置：0.7}，arrowCommon]，
				[“箭头”，{位置：0.3，方向：-1}，arrowCommon]
				direction指向哪个方向。允许值为1（默认值，表示向前）和-1，表示向后
				//paintStyle 用于端点和连接器的paintStyle值的表单中的样式对象
				location 从箭头尾部到头部的距离
			]*/
			overlays = [
				["Arrow",{location:1},arrowCommon],
				[ "Label", {//连线上的label
					location: 0.4,
					id: "label",
					cssClass: "aLabel",
				}]
				//["Arrow",{location: 0.3,direction:-1},arrowCommon]
			];
			//$(someElement).find(".someSelector")
			//基本连接线样式
			var connectorPaintStyle = {
				strokeWidth: 2,
				stroke: "#61B7CF",
				fillStyle: "transparent",
				radius: 5,
				//joinstyle: "round",
				//outlineStroke: "white",
				//outlineWidth: 2
			};
			// 鼠标悬浮在连接线上的样式
			var connectorHoverStyle = {
				strokeWidth: 3,
				stroke: "#216477",
				outlineWidth: 5,
				outlineStroke: "white",
			};
			var endpointHoverStyle = {
				fill: "#216477",
				stroke: "#216477"
			};

			//空心圆端点样式设置
			var hollowCircle = {
				DragOptions: { cursor: 'pointer', zIndex: 2000 },
				endpoint: ["Dot", { radius: 7 }],//端点的形状
				connectorStyle: connectorPaintStyle,//连接线的颜色，大小样式
				connectorHoverStyle: connectorHoverStyle,
				paintStyle: {
					strokeStyle: "#1e8151",
					fillStyle: "transparent",
					radius: 5,
					lineWidth: 2
				},//端点的颜色样式
				//anchor: "AutoDefault",
				isSource: true,	//是否可以拖动（作为连线起点）
				connector: ["Straight", { stub: [0, 0], gap: 10, cornerRadius: 5, alwaysRespectStubs: true }],//连接线的样式种类有[Bezier],[Flowchart],[StateMachine ],[Straight ]
				isTarget: true,		//是否可以放置（连线终点）
				maxConnections: -1,		// 设置连接点最多可以连接几条线
				connectorOverlays: [["Arrow", { width: 10, length: 10, location: 1 }]]
			};


			var sourceEndpoint = {
				endpoint: "Dot",
				paintStyle: {
					//stroke: "#7AB02C",
					fill: "transparent",
					radius: 3,
					strokeWidth: 6
				},
			//	isSource: true,
				connector: [ "Flowchart", { stub: [25, 60], gap: 10, cornerRadius: 3, alwaysRespectStubs: true } ],
				connectorStyle: connectorPaintStyle,
				hoverPaintStyle: endpointHoverStyle,
				connectorHoverStyle: connectorHoverStyle,
				dragOptions: {},
				/*overlays: [
					[ "Label", {
						location: [0.5, 1.5],
						label: "Drag",
						cssClass: "endpointSourceLabel",
						visible:false
					} ]
				]*/
			};
			var targetEndpoint = {
				endpoint: "Dot",
				//paintStyle: { fill: "#7AB02C", radius: 5 },
				hoverPaintStyle: endpointHoverStyle,
				dropOptions: { hoverClass: "hover", activeClass: "active" },
				//isTarget: true,
				/*overlays: [
					[ "Label", { location: [0.5, -0.5], label: "Drop", cssClass: "endpointTargetLabel", visible:false } ]
				]*/
			};
			var anchorsPositon = ["TopCenter","BottomCenter","LeftMiddle","RightMiddle"];//锚点位置指向
			var windows = jsPlumb.getSelector(".jsplumb-process .window");

			//添加锚点
			function addEndPoints(toId){
				for (var i = 0; i < anchorsPositon.length; i++) {
					var sourceUUID = toId + '-' + anchorsPositon[i];
					myJsPlumb.addEndpoint(toId,hollowCircle,{
						anchor:anchorsPositon[i],uuid: sourceUUID
					});
				}
				for (var j = 0; j < anchorsPositon.length; j++) {
					var targetUUID = toId + '-' + anchorsPositon[j];
					myJsPlumb.addEndpoint(toId,hollowCircle,{anchor:anchorsPositon[j],uuid: targetUUID});
				}
			}
			for (var i = 0; i < windows.length; i++) {
				//addEndPoints(windows[i].getAttribute("id"))
				myJsPlumb.addEndpoint(windows[i],sourceEndpoint,{
					uuid: windows[i].getAttribute("id") + "-bottom",
					anchor: "Bottom",
					maxConnections: -1
				});
				myJsPlumb.addEndpoint(windows[i],targetEndpoint,{
					uuid: windows[i].getAttribute("id") + "-top",
					anchor: "Top",
					maxConnections: -1
				});
			}


			var connectRepeatJson = {};
			for(var connectI=0; connectI<linkDataArray.length; connectI++){
				var linkData = linkDataArray[connectI];
				if(!$.isArray(connectRepeatJson[linkData[linkList.targetField]])){
					connectRepeatJson[linkData[linkList.targetField]] = [];
				}
				connectRepeatJson[linkData[linkList.targetField]].push(linkData[linkList.sourceField]); 

				var sourceId = 'chartwindow'+linkData[linkList.sourceField];
				var targetId = 'chartwindow'+linkData[linkList.targetField];
				var fromPortId = sourceId+'-bottom';
				var endPortId = targetId+'-top';
				myJsPlumb.connect({uuids:[fromPortId,endPortId],overlays:overlays,editable:true});
			}
			/*for(var connect in connectRepeatJson){
				var connData = connectRepeatJson[connect];
				if(connData.length > 1){
					for(var sourceI=0; sourceI<connData.length; sourceI++){
						var sourceId = 'chartwindow'+connData[sourceI];
						var targetId = 'chartwindow'+connect;
						var fromPortId = sourceId+'-left';
						var endPortId = targetId+'-center';
						//myJsPlumb.connect({uuids:[fromPortId,endPortId],overlays:overlays,editable:false});
						var connectJson = {
							uuids:[fromPortId,endPortId],
							anchors:["LeftMiddle", "LeftMiddle"]
						}
						if(sourceI===0){
							connectJson.anchors = ["Center","Center"];
						}
						if(sourceI === connectRepeatJson[connect].length-1){
							connectJson.anchors = ["RightMiddle","RightMiddle"];
						}
						myJsPlumb.connect(connectJson);
					}
				}else{
					var sourceId = 'chartwindow'+connData[0];
					var targetId = 'chartwindow'+connect;
					var fromPortId = sourceId+'-bottom';
					var endPortId = targetId+'-top';
					myJsPlumb.connect({uuids:[fromPortId,endPortId],overlays:overlays,editable:false});
				}
			}*/
			//myJsPlumb.draggable(windows);
			myJsPlumb.on("click",function(conn, originalEvent){
				console.log(conn)
				console.log(originalEvent)
				// if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
				 //   instance.detach(conn);
				//conn.toggleType("basic");
			});
		});
		jsPlumb.fire("jsPlumbDemoLoaded", myJsPlumb);
 	}
	//ajax读取
	if(config.ajax.url){
		//存在url链接
		var listAjax = config.ajax;
		listAjax.plusData = {
			dataSrc:config.ajax.dataSrc,
			config:config
		}
		nsVals.ajax(config.ajax,function(res,ajaxData){
			dataSourceArray = res[ajaxData.dataSrc];
			initNodeByData(ajaxData.config);
		},true);
	}else{
		initNodeByData(config);
	}
 }
 

 /*



 */