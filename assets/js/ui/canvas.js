nsUI.canvasByBgimages = (function ($) {
	// 读取刷新画布函数
	function refresh(containerId, value) {
		var $container = $("#" + containerId);
		var data = value[0];
		for (var item in data) {
			switch (item) {
				case "point":
					break;
				case "line":
					break;
				case "circle":
					break;
				case "bgImages":
					var $canvas = initCanvasGUI($container, data[bgImages], id);
					$canvas.appendTo($container);
					break;
			}
		}
	}
	// base64Blob处理
	function base64ToBlob(code) {
		// 将类型和base64码拿出来
		var parts = code.split(';base64,');
		var contentType = parts[0].split(':')[1];
		// 对base64解码
		var raw = window.atob(parts[1]);
		var rawLength = raw.length;
		// 转换成二进制
		var uInt8Array = new Uint8Array(rawLength);
		for (var i = 0; i < rawLength; ++i) {
			uInt8Array[i] = raw.charCodeAt(i);
		}
		// 封装成blob对象
		return new Blob([uInt8Array], { type: contentType });
	}
	// 获取value函数
	function getValue() {
		// 获得宽高
		var width = canvas.container.width;
		var height = canvas.container.height;
		// dom命名
		var $aCanvas = $("<canvas width=" + aImage.width + " height=" + aImage.height + "></canvas>");
		var aCxt = $aCanvas.get(0).getContext('2d');
		var $bCanvas = $("<canvas width=" + bImage.width + " height=" + bImage.height + "></canvas>");
		var bCxt = $bCanvas.get(0).getContext('2d');
		var a = $("<a href=''></a>");
		var b = $("<a href=''></a>");
		var aDiv = a.get(0);
		var bDiv = b.get(0);
		/* return (value = {
			lineArr: canvas.lineArr,
			circleArr: canvas.circleArr,
			pointArr: canvas.pointArr,
			bgImage: canvas.currentBg
		}); */
		// 获取像素操作
		var aImgData = canvas.cxt.getImageData(aImage.x, aImage.y, aImage.width, aImage.height);
		var bImgData = canvas.cxt.getImageData(bImage.x, bImage.y, bImage.width, bImage.height);
		// 放置像素操作
		aCxt.putImageData(aImgData, 0, 0);
		bCxt.putImageData(bImgData, 0, 0);
		// 将两个canvas显示出来
		// $('.content-box').append($aCanvas)
		// $('.content-box').append($bCanvas)
		// 获取base64码
		var aBase64 = $aCanvas.get(0).toDataURL('image/jpg');
		var bBase64 = $bCanvas.get(0).toDataURL('image/jpg');
		// base64转换成二进制，放入blob对象
		var aBlob = base64ToBlob(aBase64);
		var bBlob = base64ToBlob(bBase64);
		// 下载操作
		aDiv.href = URL.createObjectURL(aBlob);
		bDiv.href = URL.createObjectURL(bBlob);
		// 设置下载图片名称
		aDiv.download = "左眼底图.jpg";
		bDiv.download = "右眼底图.jpg";
		// 下载
		aDiv.click();
		bDiv.click();
	}
	// 画背景
	function drawCanvasBg(bgImages, callback) {
		// 获得宽高
		var width = canvas.container.width;
		var height = canvas.container.height;
		// 两张图片的分割线
		window.cutLine = width * 0.45;
		// 第一个图片
		var aImg = new Image();
		aImg.src = bgImages[0];
		aImg.onload = function () {
			var x = 0;
			var y = 0;
			var wh = computeBg({ width: cutLine, height: height }, this);
			// 画第一张图
			// 根据宽高居中
			x = (width / 2 - wh.width) / 2;
			y = (height - wh.height) / 2;
			// 画照片外框
			canvas.cxt.strokeStyle = "#cccc";
			canvas.cxt.strokeRect(x - 5, y - 5, wh.width + 10, wh.height + 10);
			// 画图片
			canvas.cxt.drawImage(aImg, x, y, wh.width, wh.height);
			// 用来后面获取像素使用
			window.aImage = {
				x: x,
				y: y,
				width: wh.width,
				height: wh.height
			};

			// 画第二张图片
			var bImg = new Image();
			bImg.src = bgImages[1];
			bImg.onload = function () {
				var x = 0;
				var y = 0;
				// 计算宽高
				var wh = computeBg({ width: cutLine, height: height }, this);
				// 根据宽高居中
				x = (width / 2 - wh.width) / 2 + width / 2;
				y = (height - wh.height) / 2;
				// 画照片外框
				canvas.cxt.strokeStyle = "#cccc";
				canvas.cxt.strokeRect(x - 5, y - 5, wh.width + 10, wh.height + 10);
				// 画图片
				canvas.cxt.drawImage(bImg, x, y, wh.width, wh.height);
				// 用来后面获取像素使用
				window.bImage = {
					x: x,
					y: y,
					width: wh.width,
					height: wh.height
				};
				callback && callback();
			};
		};
	}
	// 计算比例
	function computeBg(container, img) {
		if (img.width < container.width && img.height < container.height) {
			return {
				width: img.width,
				height: img.height
			};
		} else if (img.width / img.height >= container.width / container.height) {
			return {
				width: container.width,
				height: container.width * (img.height / img.width)
			};
		} else {
			return {
				width: container.height * (img.width / img.height),
				height: container.height
			};
		}
	}
	// 用来初始化container的各种属性,自行添加
	function initContainer(container) {
		// background:url(" + bgImage + ") no-repeat center/cover;
		// container.attr("style", "position:relative;user-select:none;");
		return {
			// container的jqery对象
			self: container,
			// container的宽度
			width: container.width(),
			// container的高度
			height: container.height()
		};
	}
	/**
	 * 用来初始化canvas的方法
	 */
	function initCanvasGUI(id) {
		// 从传过来的配置中获取canvas的id，cantainer的属性，bgImages的url，readOnly只读属性
		id = id || "canvanByBgimages";
		var canvasTag = $("<canvas></canvas>").text(
			"Your browser does not support the canvas element."
		);
		// 设置canvas标签的属性
		canvasTag.attr("id", id);
		return canvasTag;
	}
	/**
	 * 用来初始化toolBar的方法
	 */
	function initToolBarGUI(container) {
		// 得到container的各种属性
		var width = container.width;
		var height = 115;
		// 设置toolBar
		var toolBar = $("<div class='toolbar'></div>");
		/* toolBar.attr("style", "width:" + width * 0.5 + "px;min-height:" + height +
			"px;position:absolute;bottom:-115px;background-color:rgba(255,255,255,0.7);padding:10px 10px 0 10px;box-sizing:border-box;border-radius:10px;"
		); */

		$("#revoke").on('click', function () {
			canvas.revoke();
		});
		$("#clear").on('click', function () {
			canvas.clearAll();
		});
		$("#recover").on('click', function () {
			canvas.recover();
		});
		$("#save").on('click', function () {
			getValue();
		});

		return {
			toolBar: toolBar
		};
	}

	/**
	 * 以下是对象化
	 */
	var canvas = {
		// canvas组件要命名的id
		id: "canvas",
		// canvas的jQuery对象
		$canvas: "",
		// 默认宽高
		w: 400,
		h: 300,
		// 包裹canvas组件的id
		containerId: "box",
		// container的jQuery对象
		$container: "",
		// 包裹canvas组件的属性
		container: {},
		// 背景图片
		bgImages: [],
		currentBg: "",
		// 只读属性
		readOnly: true,
		//	以下是canvas需要用到的函数
		drawStyle: "#000",
		drawWidth: "2",
		drawMethod: "画点",
		lineArr: [],
		circleArr: [],
		pointArr: [],
		allArr: [],
		pointArrTwo: [],
		init: function (config) {
			if (config != "" && typeof (config) != "undefined") {
				this.config = config;
				// 设置canvas组件要命名的id
				this.id = config.id != "" && typeof (config.id) != "undefined" ?
					config.id : console.error("配置文件的id有误");
				// 设置包裹canvas组件的id
				this.containerId = config.containerId != "" && typeof (config.containerId) != "undefined" ?
					config.containerId : console.error("配置文件的containerId有误");
				// 设置背景图片
				this.bgImages = config.bgImages != null && typeof (config.bgImages) != "undefined" ?
					config.bgImages : console.error("配置文件的背景图片有误");
				// 设置只读属性
				this.readOnly = (typeof (config.readOnly) == "boolean" || config.readOnly != "") &&
					typeof (config.readOnly) != "undefined" ? config.readOnly : console.error("配置文件的只读属性有误");
			} else {
				console.error("请检查配置文件的正确性");
			}
			// console.log(this);
			// 设置默认背景图
			// this.currentBg = this.bgImages[0];
			// 初始化anvas的属性
			this.$container = $("#" + this.containerId);
			// 初始化canvas
			this.$canvas = initCanvasGUI(this.id);
			// 设置宽高
			if (this.config.width || this.config.height) {
				this.$container.attr('style', "width:" + this.config.width + "px;height:" + this.config.height + "px;display:inline-block;");
				this.$canvas.attr('width', this.config.width);
				this.$canvas.attr('height', this.config.height);
			} else {
				this.$container.attr('style', "width:" + this.w + "px;height:" + this.h + "px;");
				this.$canvas.attr('style', "width:" + this.w + "px;height:" + this.h + "px;");
			}
			// 返回容器
			this.container = initContainer(this.$container);
			// 将canvas添加到container
			this.$canvas.appendTo(this.$container);
			// 初始化toolBar
			this.$toolBar = initToolBarGUI(this.container).toolBar;
			// 将toolBar添加到container
			this.$toolBar.appendTo(this.$container);
			// load
			this.load();
			// this.toolBarMove();
		},
		load: function () {
			this.$canvas.unbind();
			// 创建2d画笔 
			this.cxt = this.$canvas[0].getContext("2d");
			// 获取画笔颜色，粗细样式
			this.cxt.strokeStyle = canvas.drawStyle;
			this.cxt.strokeWidth = canvas.drawWidth;
			this.cxt.lineWidth = canvas.drawWidth;
			// 画背景
			drawCanvasBg(this.bgImages);
			// 判断只读状态，然后往下执行
			if (!this.readOnly) {
				switch (canvas.drawMethod) {
					case "画点":
						this.drawPoint();
						break;
					case "画线":
						this.drawLine();
						break;
					case "画圆":
						this.drawCircle();
						break;
					default:
						console.error("绘画类型错误");
						break;
				}
			} else {
				console.log("为只读状态");
			}
		},
		drawLine: function () {
			var downX;
			var downY;
			var x;
			var y;
			var _this = this;
			// console.log("drawing  Line----------------");
			// 鼠标按下事件，当鼠标按下时才能执行移动事件
			this.$canvas.on("mousedown", function (e) {
				downX = e.offsetX;
				downY = e.offsetY;

				// 鼠标移动事件
				this.$canvas.on("mousemove", function (e) {
					x = e.offsetX;
					y = e.offsetY;

					// 画直线时，移动时清除上一步
					// 将划过的直线重新画出来
					/* $.each(_this.allArr, function (index, value) {
						if (value == "画线") {
							_this.drawLineMore();
						}
						if (value == "画圆") {
							_this.drawCircleMore();
						}
						if (value == "画点") {
							_this.drawPointMore();
						}
					}) */
					if (this.lineArr.length > 0) {
						this.drawLineMore();
					}
					if (this.circleArr.length > 0) {
						this.drawCircleMore();
					}
					if (this.pointArr.length > 0) {
						this.drawPointMore();
					}
					// 重新获取样式
					this.reloadStyle();

					// 一条线的开始
					this.cxt.beginPath();
					// 画直线
					this.cxt.moveTo(downX, downY);
					this.cxt.lineTo(x, y);
					// 一条线的结束
					this.cxt.stroke();
					this.cxt.closePath();
				}.bind(this));
				// 鼠标抬起移除鼠标移动事件
				this.$canvas.on("mouseup", function () {
					var strokeStyle = this.cxt.strokeStyle;
					var strokeWidth = this.cxt.strokeWidth;
					var lineWidth = this.cxt.lineWidth;
					var arr = [
						{
							strokeStyle: strokeStyle,
							strokeWidth: strokeWidth,
							lineWidth: lineWidth
						},
						{ downX: downX, downY: downY },
						{ x: x, y: y }
					];
					this.lineArr.push(arr);
					this.allArr.push("画线");
					this.$canvas.off("mousemove");
					this.$canvas.off("mouseup");
				}.bind(this));
			}.bind(this));
		},
		drawCircle: function () {
			var downX;
			var downY;
			var x;
			var y;
			var circle;
			var _this = this;
			// console.log("drawing  Circle----------------");
			// 鼠标按下事件，当鼠标按下时才能执行移动事件
			this.$canvas.on("mousedown", function (e) {
				downX = e.offsetX;
				downY = e.offsetY;
				// 鼠标移动事件

				this.$canvas.on("mousemove", function (e) {
					x = e.offsetX;
					y = e.offsetY;

					circle = canvas.computeCircle(downX, downY, x, y);
					// 画直线时，移动时清除上一步
					this.clear();
					// 将划过的直线重新画出来
					if (this.lineArr.length > 0) {
						this.drawLineMore();
					}
					if (this.circleArr.length > 0) {
						this.drawCircleMore();
					}
					if (this.pointArr.length > 0) {
						this.drawPointMore();
					}
					// 重新获取样式
					this.reloadStyle();

					// 一个圆的开始
					this.cxt.beginPath();
					this.cxt.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
					// stroke画线，fill填充
					this.cxt.stroke();
					this.cxt.closePath();
				}.bind(this));
				// 鼠标抬起移除鼠标移动事件
				this.$canvas.on("mouseup", function () {
					var strokeStyle = this.cxt.strokeStyle;
					var strokeWidth = this.cxt.strokeWidth;
					var lineWidth = this.cxt.lineWidth;
					var arr = [
						{
							strokeStyle: strokeStyle,
							strokeWidth: strokeWidth,
							lineWidth: lineWidth
						},
						{ circle: circle }
					];
					this.circleArr.push(arr);
					this.allArr.push("画圆");
					this.$canvas.off("mousemove");
					this.$canvas.off("mouseup");
				}.bind(this));
			}.bind(this));
		},
		drawPoint: function () {
			var x;
			var y;
			var point = [];
			var _this = this;
			// console.log("drawing  Point----------------");
			// 鼠标按下事件，当鼠标按下时才能执行移动事件
			this.$canvas.on("mousedown", function (e) {
				point.length = 0;
				x = e.offsetX;
				y = e.offsetY;
				// 鼠标移动事件
				point.push({ x: x, y: y });
				this.$canvas.on("mousemove", function (e) {
					x = e.offsetX;
					y = e.offsetY;
					point.push({ x: x, y: y });

					// 将划过的直线重新画出来
					// this.clear();
					/* if (this.lineArr.length > 0) {
						this.drawLineMore();
					}
					if (this.circleArr.length > 0) {
						this.drawCircleMore();
					}
					if (this.pointArr.length > 0) {
						this.drawPointMore();
					} */
					// 重新获取样式F
					this.reloadStyle();

					// 一系列点的开始
					this.cxt.beginPath();
					// 让笔迹更加圆滑
					this.cxt.lineCap = "round";
					for (var i = 0; i < point.length; i++) {
						if (point[i] && i) {
							// 开一个路径，开始绘画
							this.cxt.moveTo(point[i - 1].x, point[i - 1].y);
						} else {
							// 如果只是点了一下，则显示一个点
							this.cxt.moveTo(point[i].x - 1, point[i].y);
						}
						this.cxt.lineTo(point[i].x, point[i].y);
					}
					// stroke画线，fill填充
					this.cxt.stroke();
					this.cxt.closePath();
				}.bind(this));
				// 鼠标抬起移除鼠标移动事件
				this.$canvas.on("mouseup", function () {
					$("#revoke").removeClass('disabled');
					$("#recover").removeClass('disabled');
					// 鼠标抬起后进行当前画笔数据的保存
					var strokeStyle = this.cxt.strokeStyle;
					var strokeWidth = this.cxt.strokeWidth;
					var lineWidth = this.cxt.lineWidth;
					var middleArr = [];
					for (var i = 0; i < point.length; i++) {
						middleArr[i] = point[i];
					}
					var arr = [
						{
							strokeStyle: strokeStyle,
							strokeWidth: strokeWidth,
							lineWidth: lineWidth
						},
						{ pointArr: middleArr }
					];
					// 经过撤销和恢复后再画时可以在当前的基础上进行撤销
					if (typeof (this.currentIndex) != 'undefined') {
						this.pointArr.length = this.currentIndex;
						this.allArr.length = this.currentIndex;
						this.currentIndex++;
					}
					// 添加当前画的笔迹和类型
					this.pointArr.push(arr);
					this.pointArrTwo = $.extend(true, [], this.pointArr);
					// 用于后期撤销
					this.allArr.push("画点");
					// 关闭事件
					this.$canvas.off("mousemove");
					this.$canvas.off("mouseup");
				}.bind(this));
			}.bind(this));
		},
		computeCircle: function (downX, downY, x, y) {
			var roundX;
			var roundY;
			var roundR;
			if (downX < x) {
				roundX = (x - downX) / 2 + downX;
				roundR = (x - downX) / 2;
			} else {
				roundX = (downX - x) / 2 - downX;
				roundR = (x - downX) / 2;
			}
			if (downY < y) {
				roundY = (y - downY) / 2 + downY;
			} else {
				roundY = (downY - y) / 2 - downY;
			}
			return (circle = {
				x: roundX,
				y: roundY,
				r: Math.abs(roundR)
			});
		},
		//用来读取数据渲染到canvas画布上
		drawLineMore: function (lineArr) {
			if (lineArr) {
				// 传递参数了，说明是读取数据，则将canvas中的lineArr也改为传进来的数据
				this.lineArr = lineArr;
			}
			lineArr = this.lineArr;
			// 循环数据，从数据中获取数据
			lineArr.forEach(function (item) {
				for (var i = 0; i < item.length; i++) {
					this.cxt.beginPath();
					this.cxt.strokeStyle = item[0].strokeStyle;
					this.cxt.strokeWidth = item[0].strokeWidth;
					this.cxt.lineWidth = item[0].lineWidth;
					this.cxt.moveTo(item[1].downX, item[1].downY);
					this.cxt.lineTo(item[2].x, item[2].y);
					this.cxt.stroke();
					this.cxt.closePath();
				}
			}.bind(this));

		},
		drawCircleMore: function (circleArr) {
			if (circleArr) {
				// 传递了参数，则设置为优先读取参数，并将参数保存在canvas中
				this.circleArr = circleArr;
			}
			circleArr = this.circleArr;
			circleArr.forEach(function (item) {
				for (var i = 0; i < item.length; i++) {
					this.cxt.beginPath();
					this.cxt.strokeStyle = item[0].strokeStyle;
					this.cxt.strokeWidth = item[0].strokeWidth;
					this.cxt.lineWidth = item[0].lineWidth;
					var circle = item[1].circle;
					this.cxt.arc(
						circle.x,
						circle.y,
						circle.r,
						0,
						2 * Math.PI,
						false
					);
					this.cxt.stroke();
					this.cxt.closePath();
				}
			}.bind(this));
		},
		drawPointMore: function (pointArr) {
			if (pointArr) {
				// 传递了参数，则设置为优先读取参数，并将参数保存在canvas中
				this.pointArr = pointArr;
			}
			pointArr = this.pointArr;
			pointArr.forEach(function (item) {
				for (var i = 0; i < item.length; i++) {
					this.cxt.beginPath();
					// 设置画笔
					this.cxt.strokeStyle = item[0].strokeStyle;
					this.cxt.strokeWidth = item[0].strokeWidth;
					this.cxt.lineWidth = item[0].lineWidth;
					// 填充点数
					var point = item[1].pointArr;
					for (var j = 0; j < point.length; j++) {
						if (point[j] && j) {
							// 开一个路径，开始绘画
							this.cxt.moveTo(point[j - 1].x, point[j - 1].y);
						} else {
							// 如果只是点了一下，则显示一个点
							this.cxt.moveTo(point[j].x - 1, point[j].y);
						}
						this.cxt.lineTo(point[j].x, point[j].y);
					}
					this.cxt.stroke();
					this.cxt.restore();
					this.cxt.closePath();
				}
			}.bind(this));
		},
		//因为重新读取数据渲染到canvas上后会将画笔样式全部覆盖，此方法就是用来重新读取所设置的画笔参数
		//用来读取数据渲染到canvas画布上
		reloadStyle: function () {
			// 创建2d画笔
			this.cxt = this.$canvas[0].getContext("2d");
			// 获取画板的宽高
			this.w = this.container.width;
			this.h = this.container.height;
			// 获取画笔颜色，粗细样式
			this.cxt.strokeStyle = this.drawStyle;
			this.cxt.strokeWidth = this.drawWidth;
			this.cxt.lineWidth = this.drawWidth;
		},
		// 用来清除当前画布
		clear: function () {
			this.cxt.clearRect(0, 0, this.w, this.h);
		},
		// 用来清空所有画出的数据
		clearAll: function () {
			this.clear();
			$("#revoke").addClass('disabled');
			$("#recover").addClass('disabled');
			drawCanvasBg(this.bgImages);
			this.lineArr.length = 0;
			this.circleArr.length = 0;
			this.pointArr.length = 0;
			this.allArr.length = 0;
		},
		// 撤销方法，用来从当前数组中清除上一步的操作
		revoke: function () {
			var _this = this;
			this.clear();
			_this.len = this.allArr.length;
			/* if (this.allArr[len - 1] == "画线") {
				this.lineArr.pop();
			} else if (this.allArr[len - 1] == "画圆") {
				this.circleArr.pop();
			} else if (this.allArr[len - 1] == "画点") {
				this.pointArr.pop();
			}
			this.allArr.pop();
			drawCanvasBg(this.bgImages, function () {
				_this.drawLineMore();
				_this.drawCircleMore();
				_this.drawPointMore();
			}); */
			if (typeof (_this.currentIndex) != "undefined") {
				--_this.currentIndex <= 0 ? _this.currentIndex = 0 : _this.currentIndex;
			} else {
				_this.currentIndex = _this.len - 1;
			}
			_this.revokeArr = _this.pointArrTwo.slice(0, _this.currentIndex);
			drawCanvasBg(this.bgImages, function () {
				_this.drawPointMore(_this.revokeArr);
			});
		},
		// 恢复方法，用来对撤销进行复原操作
		recover: function () {
			var _this = this;
			// 各种计算
			++_this.currentIndex > _this.len ? (_this.currentIndex = _this.len) : _this.currentIndex;
			_this.reocverArr = _this.pointArrTwo.slice(0, _this.currentIndex);
			_this.drawPointMore(_this.reocverArr);
		},
		// 工具栏的移动
		toolBarMove: function () {
			this.$toolBar.on(
				"mousedown",
				function (e) {
					e.stopPropagation();
					e.preventDefault();
					var x = e.clientX;
					var y = e.clientY;
					this.$container.on(
						"mousemove",
						function (e) {
							e.stopPropagation();
							e.preventDefault();
							var toolBarX = e.offsetX;
							var toolBarY = e.offsetY;
							var moveX = e.clientX;
							var moveY = e.clientY;
							this.$toolBar[0].style.top += moveX - x;
							this.$toolBar[0].style.left += moveY - y;
						}.bind(this)
					);
				}.bind(this)
			);
			this.$toolBar.on(
				"mouseup",
				function (e) {
					e.stopPropagation();
					e.preventDefault();
					this.$toolBar.off("mousemove");
					this.$toolBar.off("mouseup");
				}.bind(this)
			);
		}
	};
	// 初始化绘画方法工具
	var methodTag = {
		drawingMethod: [],
		init: function (drawingMethod) {
			this.drawingMethod = drawingMethod != "" && typeof (drawingMethod) != "undefined" ? drawingMethod : console.error("tools中drawingMethod有误");
			// 因为只使用画点，所以不供选择其他绘画方法
			// this.$methodTag = this.initMethod(this.drawingMethod);
			// this.$methodTag.appendTo(canvas.$toolBar);
		},/**
		* 初始化选择绘画方式的方法
		*/
		initMethod: function (drawingMethod) {
			// 判断并赋值
			if (drawingMethod != "" && typeof (drawingMethod) != "undefined") {
				drawingMethod = drawingMethod;
			} else {
				console.error("配置文件中drawingMethod出错");
			}

			// 初始化
			var methodDiv = $("<div class='drawing-method'></div>").text("选择绘画方式:");
			methodDiv.attr(
				"style",
				"height:40px;line-height:40px;width:" +
				canvas.$toolBar.width() * 0.7 +
				"px;"
			);
			// 生成每个小块并添加事件，点击更改颜色
			for (var i = 0; i < drawingMethod.length; i++) {
				(function (i) {
					var methodItem = $("<div class='drawing-method-item'></div>").text(drawingMethod[i].value);
					methodItem.attr(
						"style",
						"width:36px;height:36px;background-color:" +
						drawingMethod[i] +
						";border-radius:10px;margin-right:10px;text-align:center;float:right;"
					);
					i == 1 ? (methodItem[0].style.boxShadow = "0 0 10px #000") : "";
					//    点击事件
					methodItem.on("click", function () {
						methodItem[0].style.boxShadow = "0 0 10px #000";
						var siblings = methodItem.siblings();
						for (var j = 0; j < siblings.length; j++) {
							siblings[j].style.boxShadow = "";
						}
						canvas.drawMethod = methodItem[0].innerHTML;
						canvas.load();
						return false;
					});
					//    将生成的小块添加回去
					methodItem.appendTo(methodDiv);
				})(i);
			}
			return methodDiv;
		}
	};
	// 初始化绘画样式
	var styleTag = {
		fillStyle: [],
		init: function (fillStyle) {
			this.fillStyle = fillStyle != "" && typeof (fillStyle) != "undefined" ? fillStyle : console.error("tools中fillStyle有误");
			this.$styleTag = this.initStyle(this.fillStyle);
			this.$styleTag.appendTo($('.eidtor-tools'));
		},
		// 画笔颜色
		initStyle: function (fillStyle) {
			// 判断并赋值
			if (fillStyle != "" && typeof (fillStyle) != "undefined") {
				fillStyle = fillStyle;
			} else {
				console.error("配置文件中fillStyle出错");
			}
			// 初始化
			var styleDiv = $("<div class='eidtor-tools-item'></div>");
			// styleDiv.attr("style", "height:40px;line-height:40px;width:" + canvas.$toolBar.width() * 0.7 + "px;");
			// 生成每个小块并添加事件，点击更改颜色
			for (var i = 0; i < fillStyle.length; i++) {
				(function (i) {
					var styleItem = $("<span class='editor-color'></span>");
					styleItem.attr("style", "background-color:" + fillStyle[i] + ";");
					i == 1 ? ($(styleItem[0]).addClass('checked')) : "";
					//    点击事件
					styleItem.on("click", function () {
						var siblings = styleItem.siblings();
						for (var j = 0; j < siblings.length; j++) {
							$(siblings[j]).removeClass('checked');
						}
						$(styleItem[0]).addClass('checked');
						canvas.drawStyle = styleItem[0].style.backgroundColor;
						return false;
					});
					//    将生成的小块添加回去
					styleItem.appendTo(styleDiv);
				})(i);
			}
			return styleDiv;
		}
	};
	//    初始化画笔粗细
	var widthTag = {
		lineWidth: [],
		init: function (lineWidth) {
			this.lineWidth = lineWidth != "" && typeof (lineWidth) != "undefined" ? lineWidth : console.error("tools中lineWidth有误");
			this.$widthTag = this.initWidth(this.lineWidth);
			this.$widthTag.appendTo($('.eidtor-tools'));
		},
		// 画笔粗细
		initWidth: function (lineWidth) {
			// 判断并赋值
			if (lineWidth != "" && typeof (lineWidth) != "undefined") {
				lineWidth = lineWidth;
			} else {
				console.error("配置文件中lineWidth出错");
			}
			// 初始化
			var widthDiv = $("<div class='eidtor-tools-item'></div>");
			// widthDiv.attr("style", "height:40px;line-height:40px;width:" + canvas.$toolBar.width() * 0.8 + "px;");
			// 生成每个小块并添加事件，点击更改颜色
			// 使用bootstrap的类名
			var classList = ['light', 'normal', 'bold'];
			for (var i = 0; i < lineWidth.length; i++) {
				(function (i) {
					var widthItem = $("<span class='editor-pen'></span>");
					widthItem.attr("data-width", lineWidth[i]);
					widthItem.addClass(classList[i]);
					// i == 1 ? ($(widthItem[0]).addClass('checked')) : "";
					//    点击事件
					widthItem.on("click", function () {

						var siblings = widthItem.siblings();
						for (var j = 0; j < siblings.length; j++) {
							$(siblings[j]).removeClass('checked');
						}
						$(widthItem[0]).addClass('checked');
						canvas.drawWidth = $(widthItem[0]).data("width");
						return false;
					});
					//    将生成的小块添加回去
					widthItem.appendTo(widthDiv);
				})(i);
			}

			return widthDiv;
		}
	};
	// 页面
	var page = {
		init: function (config) {
			var html = '<div class="row">' + '<div class="col-sm-12">' + '<div class="imgeditor">' + '<div class="imgeditor-header">' + '<div class="btn-group">' + '<button class="btn btn-info" id="save">' + '<i class="	fa-save"></i>' + '<span>保存</span>' + '</button>' + '</div>' + '<div class="imgeditor-header-after">' + '<div class="dropdown">' + '<button class="btn btn-info btn-icon dropdown-toggle" data-toggle="dropdown">' + '<i class="fa-paint-brush"></i>' + '</button>' + '<div class="dropdown-menu">' + '<div class="eidtor-tools">' + '</div>' + '</div>' + '</div>' + '<button class="btn btn-white" id="revoke">' + '<i class="fa-history"></i>' + '<span>回退</span>' + '</button>' + '<button class="btn btn-white" id="recover">' + '<i class="fa-history"></i>' + '<span>恢复</span>' + '</button>' + '<button class="btn btn-white" id="clear">' + '<i class="fa-remove"></i>' + '<span>清空</span>' + '</button>' + '</div>' + '</div>' + '<div class="imgeditor-body">' + '<div class="imgeditor-area">' + '<div class="imgeditor-area-item">' + '<div id="imageditor"></div>' + '</div>' + '</div>' + '</div>' + '</div>' + '</div>' + '</div>';
			$('.content-box').append(html);
			// 一下开始进行组件构建
			$("#revoke").addClass('disabled');
			$("#recover").addClass('disabled');
			canvas.init(config);
			methodTag.init(config.tools.drawingMethod);
			styleTag.init(config.tools.fillStyle);
			widthTag.init(config.tools.lineWidth);
		}
	};
	// 整个组价的初始化函数
	function initComponent(config) {
		if (config == "" && typeof (config) == "undefined") {
			config = {};
		}
		config.containerId = 'imageditor';
		config.tools = {
			drawingMethod: [
				{ method: 'point', value: '画点' },
				{ method: 'line', value: '画线' },
				{ method: 'circle', value: '画圆' }
			],
			// 可改动
			fillStyle: ['#aaa', '#000', 'red', '#66ccff', '#00ffff'],
			lineWidth: [6, 12, 18]
		};
		page.init(config);
	}
	return {
		initComponent: initComponent,
		getValue: getValue
	};
})(jQuery);
