/*
 * @Desription: 文件说明
 * @Author: netstar.cy
 * @Date: 2019-08-30 11:15:58
 * @LastEditTime: 2019-08-30 14:57:46
 */
//pdf 弹出浏览 cy20180803 ver:0.5 支持翻页和全屏弹出
//需要引入的第三方插件 assets/js/pdf/pdf.js
nsUI.pdfView = {
	//pdfJsLib 执行本体
	jsLib:{},
	config:{},
	$container:{}, //pdf canvas容器
	$loadingPanel:{}, //加载面板
	init:function(_config){
		/****
		 *{
		 * 	isDownload:false,  			//boolean 	是否有下载按钮
		 * 	isPrint:false, 				//boolean 	是否有打印按钮
		 * 	isZoom:false, 				//boolean 	是否支持方法缩小
		 * 	pageNumber:1, 				//number 	从第几页打开
		 * 	title:"PDF", 				//string 	标题
		 * 	url:"../../image/1.pdf", 	//string 	地址
		 * 	zoomMultipleNumber:1.5 		//number 	放大倍数，默认1.5
		 *}
		 ****/
		this.setDefault(_config);
		this.config = _config;
		this.jsLib = window['pdfjs-dist/build/pdf'];
		//this.$loadingPanel = $('<div id="dialog-pdf-loading" class="panel-loading">正在加载PDF ...</div>');
		this.$selectPage = $('<select id="dialog-pdf-selectpage" class="select-changepage"></select>');
		this.$btnsContainer = $('<div id="dialog-pdf-btns-container" class="btns-container"></div>');
	},
	//设置默认值
	setDefault:function(_config){
		var defaultConfig = {
			title:'PDF',
			pageNumber:1,
			isDownload:false,
			isPrint:false,
			isZoom:false,
			zoomMultipleNumber:1.5,
		}
		nsVals.setDefaultValues(_config, defaultConfig);
		//按钮中的任何一个有，则添加按钮容器
		if(_config.isDownload || _config.isPrint || _config.isZoom){
			_config.isHaveBtnsContainer = true;
		}else{
			_config.isHaveBtnsContainer = false;
		}
		//手机端或者PC端模式
		_config.browserSystem = nsVals.browser.browserSystem;
	},
	//全屏弹框
	fullScreenDialog:function(){
		//容器
		var html = 
			'<div id="dialog-pdf-scaleinfo" class="info-center">' 		//缩放信息
				//+'<span class="word"></span>'
			+'</div>'
			+'<div id="dialog-pdf-container" class="container-center">' //容器 包含btn和canvas
				+'<div id="dialog-pdf-container-canvas-all" class="container-canvas-all">' 
					+'<canvas id="dialog-pdf-container-canvas" ></canvas>'
				+'</div>'
			+'</div>';
		this.$container = $(html);
	
		var _this = this;
		var widthHeight = $(window).height();
		var dialogId = 'dialog-pdf';

		var contentDialogConfig = 
		{
			id:dialogId,
			title:_this.title, 
			width:'100%',
			height:widthHeight,
			plusClass:'fullscreen pdfview pdfview-'+_this.config.browserSystem,  //补充了PC端和手机端样式
			shownHandler:function(){
				//添加相关组件的容器
				$("#"+dialogId+' .panel-body').append(_this.$container);
				//_this.$container.append(_this.$loadingPanel);
				$('#dialog-pdf-container').append(_this.$selectPage);
				//如果需要添加按钮则先添加按钮容器
				if(_this.config.isHaveBtnsContainer){
					$('#dialog-pdf-container').append(_this.$btnsContainer);
					_this.initBtns();
				}
			},
			hiddenHandler:function(resObj){
				//关闭后清除pdf
				_this.documentEventOff();
				//如果有则关闭打印iframe
				if($('#iframe-print').length>0){
					$('#iframe-print').remove();
				}
			}
		}
		nsFrame.contentDialog.show(contentDialogConfig);
	},
	//初始化按钮
	initBtns:function(){
		var _this = this;
		var btnsArray = [];
		var url = this.config.url;
		var fileName = url.substr(url.lastIndexOf('/')+1);
		//下载按钮
		if(this.config.isDownload){
			btnsArray.push({
				text: 		'下载PDF',
				handler: 	function(){
					nsVals.downloadFile(fileName,url);
				}
			})
		}
		//打印按钮
		if(this.config.isPrint){
			btnsArray.push({
				text: 		'打印PDF',
				handler: 	function(){
					if($('#iframe-print').length>0){
						$('#iframe-print').remove();
					}
					$('body').append('<iframe id="iframe-print" style="display:none; visibility:hidden;" src="'+url+'"></iframe>')
					$("#iframe-print")[0].contentWindow.print();
				}
			})
		}
		//放大缩小
		if(this.config.isZoom){
			btnsArray.push({
				text: 		'放大PDF',
				handler: 	function(){
					var zoomMultipleNumber = _this.config.zoomMultipleNumber;
					//默认为1.5 每次放大1.5倍
					_this.currentZoomNumber = _this.currentZoomNumber*zoomMultipleNumber;
					var zoomScale = _this.currentZoomNumber;
					_this.reloadAll(_this.currentPageNumber, zoomScale);
				}
			});
			btnsArray.push({
				text: 		'缩小PDF',
				handler: 	function(){
					var zoomMultipleNumber = _this.config.zoomMultipleNumber;
					//每次缩小0.66倍 1/1.5 = 0.66666 
					_this.currentZoomNumber = _this.currentZoomNumber*(1/zoomMultipleNumber);
					var zoomScale = _this.currentZoomNumber;
					_this.reloadAll(_this.currentPageNumber, zoomScale);
				}
			})
		}
		var btnsId = 'dialog-pdf-btns-container';
		nsButton.initBtnsByContainerID(btnsId, btnsArray, true);

	},
	//入口方法
	show:function(_config){
		//config:{
		//	url:string pdf地址
		// 	title:string 弹框标题
		// 	pageNumber:number 打开第几页 默认第一页
		//	isDownload:boolean 	是否下载
		//	isPrint:boolean 	是否打印
		//}
		if(debugerMode){
			if(typeof(_config)!='object'){
				nsalert('nsUI.pdfView.show 配置参数未定义', 'error');
				return;
			}
			if(typeof(_config.url)!='string'){
				nsalert('必须配置pdf的url', 'error');
				console.error('必须配置pdf的url');
				return;
			}
		}
		
		var _this = this;
		
		//初始化
		this.init(_config);
		//弹出全屏框 显示正在加载
		this.fullScreenDialog();
		var zoomScale = -1;
		this.reloadAll(1,zoomScale);
	},
	reloadAll:function(pageNumber, zoomScale){
		//显示加载
		nsFrame.loading({transparent:1,info:'请稍候，正在加载PDF'})
		$('#dialog-pdf-container-canvas-all canvas[id!="dialog-pdf-container-canvas"]').remove();
		this.openPdf(pageNumber, zoomScale);
	},
	//打开pdf
	openPdf:function(_pageNumber, _zoomScale){

		var _this = this;
		//pdf加载任务
		var url = this.config.url;
		var loadingTask = this.jsLib.getDocument(url);

		//挂载监听器，完成后执行
		loadingTask.promise.then(function(pdf) {
			var pageNumber = _this.config.pageNumber;
			//如果有_pageNumber，则不读取config中的参数
			if(_pageNumber){
				pageNumber = _pageNumber;
			}
			//添加快捷键
			_this.shortKeyInit(pdf, pageNumber);
			//初始化翻页
			_this.selectInit(pdf);
			_this.showPage(pdf, pageNumber, _zoomScale);
			_this.$selectPage.val(pageNumber);
		}, function (reason) {
			// PDF加载出错
			nsFrame.loaded();
			nsalert('PDF加载出错','error');
			console.error(reason);
		})
	},
	//显示加载进度
	loadingProgress:function(text){
		$('.page-loading-overlay .info').html(text);
	},
	//缩放信息展示
	setScaleInfo:function(value){
		var $word = $('#dialog-pdf-scaleinfo');
		var html = '';
		if(typeof(value)=='string'){
			//为空则隐藏
			if(value == ''){
				html = '';
			}else{
				html = '<span class="word">'+value+'</span>';
			}
			text = value;
		}else if(typeof(value)=='number'){
			var percentNumber = parseInt(value * 100);
			var text = percentNumber+'%';
			//text = text + '<br>'+'缩放后需要重新加载';
			html = '<span class="word">'+text+'</span>';
		}
		$word.html(html);
	},
	isRenderFinish:false,
	currentPageNumber:1,
	currentZoomNumber:1,  //当前缩放比例 1是不缩放 1.5是1.5倍缩放
	
	//打开第几页并渲染
	showPage:function(_pdf, _pageNumber, _zoomScale, _canvasId){
		//改变加载进度
		this.loadingProgress(_pageNumber + '/'+_pdf.pdfInfo.numPages);
		//zoomScale 放大倍数 1/1.5/2等
		var _this = this;
		var zoomScale = typeof(_zoomScale)!='number'?1:_zoomScale;
		_this.currentZoomNumber = zoomScale;
		var canvasId = typeof(_canvasId)!='string'? 'dialog-pdf-container-canvas':_canvasId;
		var isMobile = nsVals.browser.browserSystem == 'mobile';
		
		_this.isRenderFinish = false;
		_pdf.getPage(_pageNumber).then(function(page) {
			
			var containerHeight = $(window).height()-10;  //窗口宽度
			var containerWidth = $(window).width()-10;
			//缩放
			var pageWidth = page.pageInfo.view[2];
			var pageHeight = page.pageInfo.view[3];

			//默认使用窗口高度，如果有值则读取值，一般是指点击了放大缩小了
			var scaleByHeight = containerHeight/pageHeight * zoomScale;
			var scaleByWidth = containerWidth/pageWidth * zoomScale;

			//优选选择能够全都看到的比例
			var scale = scaleByHeight<scaleByWidth?scaleByHeight:scaleByWidth;
			
			//由于不能自动高度， 如果使用的宽度比例 则需要增加dialog-pdf-container的高度 手机版不需要
			
			if(scaleByWidth < scaleByHeight && isMobile == false){
				//实际使用了宽度比例，计算padding-top
				var paddingTop = (containerHeight - pageHeight*scale)/2;
				paddingTop = parseInt(paddingTop);
				if( paddingTop > pageHeight/2 ){
					paddingTop = pageHeight/2;
				}
				_this.$container.css({'padding-top':paddingTop});
			}

			//手机版显示为2X图
			//var renderScale = isMobile?scale * 2:scale;
			var renderScale = scale;
			renderScale = 1;
			if(_zoomScale == -1){
				renderScale = (containerWidth - 30) / pageWidth;
				_this.$container.css({'padding-top':25});
				var panelHeight = containerHeight -25-30-15;  //-上边额外边距25-额外边距15

				$('#dialog-pdf-container-canvas-all').css({
					'overflow':'auto',
					'height':panelHeight+'px',
				})
			}
			if(renderScale<0.2){
				renderScale = 0.2;
			}
			_this.currentZoomNumber = renderScale;
			console.warn('renderScale:'+renderScale);
			var viewport = page.getViewport(renderScale);
			//画板渲染
			var canvas = document.getElementById(canvasId);
			var context = canvas.getContext('2d');
			canvas.height = viewport.height;
			canvas.width = viewport.width;
			
			//渲染参数定义
			var renderContext = {
			  canvasContext: context,
			  viewport: viewport
			};
			
			var renderTask = page.render(renderContext);
			renderTask.then(function () {
				//渲染完成
				_this.isRenderFinish = true;
				_this.currentPageNumber = _pageNumber;

				//如果是载入全部则继续渲染 直到全部页面完成
				if(_this.config.isAllPage){
					
					var max = _pdf.pdfInfo.numPages;

					if(_pageNumber < _pdf.pdfInfo.numPages){
						var nextRenderPageName = _pageNumber +1;
						var nextCanvansId = 'dialog-pdf-container-canvas-'+nextRenderPageName;
						$('#dialog-pdf-container-canvas-all').append('<canvas id="'+nextCanvansId+'" ></canvas>');
						_this.showPage(_pdf, nextRenderPageName, renderScale, nextCanvansId);
					}else{
						//全部页面渲染完成 
						if(isMobile){
							//手机版显示为2X图
							var height = $('#dialog-pdf-container-canvas').height() / 2;
							$('#dialog-pdf-container-canvas-all canvas').css({'height':height+'px'})
						}
						_this.currentPageNumber = 1;
						_this.loadedHandler();
					}
					
				}else{
					//不需要继续加载则已经完成
					_this.loadedHandler();
				}

			});
		})
	},
	//pdf加载和渲染完成
	loadedHandler:function(){
		var _this = this;
		nsFrame.loaded();
		if(_this.config.browserSystem == 'pc' && _this.currentZoomNumber>1){
			_this.canvasMouseMoveInit();
		}
	},
	//画板鼠标拖动事件 只支持PC
	canvasMouseMoveInit:function(){
		var $canvasContainer = $('#dialog-pdf-container-canvas-all');
		var $document = $(document);
		//原始位置
		var originalTop = 0, originalLeft = 0;
		var position = $('#dialog-pdf-container-canvas').offset();
		//设置为绝对定位以便于拖动
		function setStyle(){
			originalTop  = position.top;
			originalLeft = position.left;
			$canvasContainer.css({'position':'absolute', 'top':originalTop, 'left':originalLeft});
			console.log('setStyle');
		}
		setStyle();
		//mousedown 拖拽开始
		function mouseDownHandler(downEvent){
			var startX = downEvent.pageX,
				startY = downEvent.pageY;

			$document.off('mousemove', mouseMoveHandler);
			$document.on('mousemove', {startX:startX, startY:startY}, mouseMoveHandler);
			$document.off('mouseup', mouseUpHandler);
			$document.on('mouseup', {startX:startX, startY:startY}, mouseUpHandler);
		}

		//mousemove 拖拽中
		function mouseMoveHandler(moveEvent){
			var startX = moveEvent.data.startX,
				startY = moveEvent.data.startY;

			var moveX = moveEvent.pageX,
				moveY = moveEvent.pageY;
				
			var moveTop = originalTop+(moveY-startY),
				moveLeft = originalLeft+(moveX-startX);
			
			$canvasContainer.css({'top':moveTop, 'left':moveLeft});
		}

		//mouseup 拖拽结束
		function mouseUpHandler(upEvent){
			originalTop  = $canvasContainer.offset().top;
			originalLeft = $canvasContainer.offset().left;
			
			$document.off('mousemove', mouseMoveHandler);
			$document.off('mouseup', mouseUpHandler);
		}
		$canvasContainer.off('mousedown');
		$canvasContainer.on('mousedown', mouseDownHandler);
	},
	selectInit:function(_pdf){
		var _this = this;
		var numPages = _pdf.pdfInfo.numPages;
		var html = '';
		for(var i = 1; i<=numPages; i++){
			html += '<option value ="'+i+'">'+i+'</option>';
		}
		_this.$selectPage.empty();
		_this.$selectPage.append(html);
		_this.$selectPage.on('change', function(ev){
			var pageNumber = parseInt($(this).val());
			_this.showPage(_pdf, pageNumber, _this.currentZoomNumber);
		})
	},
	//快捷键 
	shortKeyInit:function(_pdf, _pageNumber){
		var $canvas = $('#dialog-pdf-container-canvas');
		var _this = this;
		var evData = {
			pdf:_pdf,
			pageNumber:_pageNumber,
		}
		var browserSystem = _this.config.browserSystem
		if(browserSystem == 'pc'){
			$(document).on('keyup', evData, _this.shortKeyHandler);
			//鼠标滚轮
			$(document).on('mousewheel', evData, _this.mouseWheelHandler);
			//屏蔽右键
			$(document).on('contextmenu',_this.contextMenuHandler);
		}else if(browserSystem == 'mobile'){
			var nextOffsetTop,lastOffsetTop
			//添加左右滑动事件
			$(document).off('touchstart');
			$(document).on('touchstart', function(startEvent){
				// console.log(startEvent);
				var startX1, startY1, startX2, startY2;
				var startTouch = startEvent.originalEvent;
				if(startTouch.touches.length == 2){
					startX1 = startTouch.touches[0].pageX;
					startY1 = startTouch.touches[0].pageY;

					startX2 = startTouch.touches[1].pageX;
					startY2 = startTouch.touches[1].pageY;
					// nsalert('startX1:'+parseInt(startX1)+' startY1:'+parseInt(startY1)+' startX2:'+parseInt(startX2)+' startX2:'+parseInt(startX2));

						var endX1, endX2, endY1, endY2;
						//获取变化值
						$(document).off('touchmove');
						$(document).on('touchmove', function(moveEvent){
							var moveTouch = moveEvent.originalEvent;
							//nsalert('movelength:'+endTouch.touches.length)
							if(moveTouch.touches.length == 2){
								endX1 = moveTouch.touches[0].pageX;
								endY1 = moveTouch.touches[0].pageY;

								endX2 = moveTouch.touches[1].pageX;
								endY2 = moveTouch.touches[1].pageY;
								//nsalert('endX1:'+endX1+' length:'+endTouch.touches.length);

								//开始和结束间距
								var startDistance = Math.sqrt( Math.pow((startX1-startX2),2) + Math.pow((startY1-startY2),2) );
								var endDistance = Math.sqrt( Math.pow((endX1-endX2),2) + Math.pow((endY1-endY2),2) );
								//屏幕对角线长度
								//var screenDistance = Math.sqrt( Math.pow( $(window).width() ,2) + Math.pow( $(window).height(),2) );

								var zoomScale = endDistance / startDistance;
								zoomScale = _this.currentZoomNumber * zoomScale;
								_this.setScaleInfo(zoomScale);
							}
						})

						$(document).off('touchend');
						$(document).on('touchend', function(endEvent){
							var endTouch = endEvent.originalEvent;
							//手指离开后 计算缩放比例
							if(endTouch.touches.length == 0){
								//nsalert('endX1:'+parseInt(endX1)+' endY1:'+parseInt(endY1)+' endX2:'+parseInt(endX2)+' endY2:'+parseInt(endY2), 'warning');
								$(document).off('touchend');
								$(document).off('touchmove');


								//开始和结束间距
								var startDistance = Math.sqrt( Math.pow((startX1-startX2),2) + Math.pow((startY1-startY2),2) );
								var endDistance = Math.sqrt( Math.pow((endX1-endX2),2) + Math.pow((endY1-endY2),2) );
								//屏幕对角线长度
								//var screenDistance = Math.sqrt( Math.pow( $(window).width() ,2) + Math.pow( $(window).height(),2) );

								var zoomScale = endDistance / startDistance;
								zoomScale = _this.currentZoomNumber * zoomScale;
								_this.currentZoomNumber = zoomScale;
								_this.setScaleInfo('');

								_this.reloadAll(_this.currentPageNumber, zoomScale);
							}
						})
				}else if(startTouch.touches.length == 1){
					//点击屏幕左侧上一页，点击屏幕右侧下一页
					//_pageNumber 当前页数
					var startY,endY,startX,endX;
					startX = startEvent.originalEvent.touches[0].pageX;
					startY = startEvent.originalEvent.touches[0].pageY;
					var numPages = _pdf.pdfInfo.numPages; 	//总页面数
					$(document).on('touchmove', function (moveEvent) {
						//只有一根手指
						$(document).off('touchend');
						$(document).on('touchend',function(endEvent){
							if(endEvent.originalEvent.touches.length  == 0){
								endX = endEvent.originalEvent.changedTouches[0].pageX;
								endY = endEvent.originalEvent.changedTouches[0].pageY;
								typeof(lastOffsetTop) == 'undefined' ? lastOffsetTop = $canvas.offset().top : 
								nextOffsetTop = $canvas.offset().top;
								if(startTouch.touches.length == 1){
									//翻页
									if(lastOffsetTop == nextOffsetTop && Math.abs(startY - endY) > 80){
										var toPageNumber = startY - endY < 0 ? _this.currentPageNumber - 1 : _this.currentPageNumber + 1;
										if(toPageNumber <= 0){
											if(_this.alertShowing == false){
												// 
												
												_this.aloneAlert('已经是第一页','warning');
												//防止一次出现太多的alert
												_this.alertShowing = true;
												setTimeout(function(){
													_this.alertShowing = false;
												}, 500)
											}
										}else if(toPageNumber > numPages){
											if(_this.alertShowing == false){
												_this.aloneAlert('已经是最后一页','warning');
												//防止一次出现太多的alert
												_this.alertShowing = true;
												setTimeout(function(){
													_this.alertShowing = false;
												}, 500)
											}
											
										}else{
											_this.showPage(_pdf, toPageNumber,  _this.currentZoomNumber);
											_this.$selectPage.val(toPageNumber);
										}
									}
								}
								lastOffsetTop = typeof(nextOffsetTop) != 'undefined' ? nextOffsetTop : lastOffsetTop;
							}
							$(document).off('touchend');
						})
					})
				}
			})
		}
	},
	contextMenuHandler:function(ev){
		return false;
	},
	shortKeyHandler:function(ev){
		var _this = nsUI.pdfView;
		//如果没有渲染完成则不执行
		if(_this.isRenderFinish == false){
			nsalert('请等待渲染完成','error');
			return;
		}
		
		//捕捉快捷键
		var keyCode = ev.keyCode;
		var _pdf = ev.data.pdf;

		var _pageNumber = _this.currentPageNumber; 	//当前page 从1开始
		var numPages = _pdf.pdfInfo.numPages; 	//总页面数
		var nextPageNumber = _pageNumber;
		var isChangeKey = false;  				//是否按下了可以换页面的按键
		switch(keyCode){
			case 34: //PageDown
			case 39: //右箭头
				//下一页
				isChangeKey = true;
				if(_pageNumber < numPages){
					nextPageNumber += 1;
				}else{
					_this.aloneAlert('已经是最后一页','warning');
				}
				break;
			case 33: //PageUp
			case 37: //左箭头
				//上一页
				isChangeKey = true;
				if(_pageNumber > 1){
					nextPageNumber -= 1;
				}else{
					_this.aloneAlert('已经是第一页','warning');
				}
				break;
			case 38: //上箭头
			case 36: //home
				//第一页
				if(_pageNumber!=1){
					isChangeKey = true;
					nextPageNumber = 1;
				}else{
					_this.aloneAlert('已经是第一页','warning');
				}
				break;
			
			case 40: //下箭头
			case 35: //end
				//最后一页
				if(_pageNumber!=numPages){
					isChangeKey = true;
					nextPageNumber = numPages;
				}else{
					_this.aloneAlert('已经是最后一页','warning');
				}
				break;
			case 27: //esc
				//关闭
				nsFrame.contentDialog.hide();
				break;
			default:
				isChangeKey = false;
				break;
		}
		//如果按下的是换页键
		if(isChangeKey){
			_this.showPage(_pdf, nextPageNumber,  _this.currentZoomNumber);
			_this.$selectPage.val(nextPageNumber);
		}
	},
	//关闭快捷键
	documentEventOff:function(){
		var _this = this;
		var browserSystem = this.config.browserSystem
		if(browserSystem == 'pc'){
			$(document).off('keyup', _this.shortKeyHandler);
			//鼠标滚轮
			$(document).off('mousewheel', _this.mouseWheelHandler);
			//屏蔽右键
			$(document).off('contextmenu', _this.contextMenuHandler);
		}else if(browserSystem == 'mobile'){
			//左右滑动事件
			$(document).off('swiperight', _this.swipeRightHandler);
			$(document).off('swipeleft', _this.swipeLeftHandler);
		}
	},
	alertShowing:false,
	//鼠标滚轮事件处理
	mouseWheelHandler:function(ev){
		var _this = nsUI.pdfView;
		var _pdf = ev.data.pdf;
		//如果没有渲染完成则不执行
		if(_this.isRenderFinish == false){
			//nsalert('请等待渲染完成','warning');
			return;
		}
		//向上或者向下 可能会翻动多页 上下是反的，向上是前一页 ev.deltaY = 1
		var toPageNumber = _this.currentPageNumber + (-ev.deltaY);

		var numPages = _pdf.pdfInfo.numPages; 	//总页面数
		if(toPageNumber<=0){
			if(_this.alertShowing == false){

				_this.aloneAlert('已经是第一页','warning');
				//防止一次出现太多的alert
				_this.alertShowing = true;
				setTimeout(function(){
					_this.alertShowing = false;
				}, 500)
			}
		}else if(toPageNumber > numPages){
			if(_this.alertShowing == false){
				_this.aloneAlert('已经是最后一页','warning');
				
				//防止一次出现太多的alert
				_this.alertShowing = true;
				setTimeout(function(){
					_this.alertShowing = false;
				}, 500)
			}
			
		}else{
			_this.showPage(_pdf, toPageNumber,  _this.currentZoomNumber);
			_this.$selectPage.val(toPageNumber);
		}
	},
	//左右滑动
	swipeLeftHandler:function(ev){
		//向左活动 应当指向下一页
		nsUI.pdfView.swiperHandler(ev, 1);
	},
	swipeRightHandler:function(ev){
		//向左活动 应当指向上一页
		nsUI.pdfView.swiperHandler(ev, -1);
	},
	swiperHandler:function(ev, pageStepNum){
		//pageStep : number -1/1  页面步进值
		var _this = nsUI.pdfView;
		var _pdf = ev.data.pdf;

		var toPageNumber = _this.currentPageNumber + pageStepNum;
		//ev.preventDefault();

		var _this = nsUI.pdfView;
		var numPages = _pdf.pdfInfo.numPages; 	//总页面数

		//如果没有渲染完成则不执行
		if(_this.isRenderFinish == false){
			//nsalert('请等待渲染完成','warning');
			return;
		}
		
		if(toPageNumber<=0){
			_this.aloneAlert('已经是第一页','warning');
		}else if(toPageNumber > numPages){
			_this.aloneAlert('已经是最后一页','warning');
		}else{
			_this.showPage(_pdf, toPageNumber,  _this.currentZoomNumber);
			_this.$selectPage.val(toPageNumber);
		}
	},
	//先清除
	aloneAlert:function(text, state){
		toastr.clear();
		nsalert(text,state);
	}
}

//改版的的PDF浏览器 cy 20190807
nsUI.pdfViewer = (function(){
	var PDF_LIB_URL = 		'/static/libs/pdf/pdf.js';
	var PDF_WORKER_SRC = 	'/static/libs/pdf/pdf.worker.js';
	var _this = {};
	var config = {};
	var pdfLib = {name:'pdflib'};
	var I18N = 
	{
		en:{
		},
		zh:{
		}
	};
	var TEMPLATE = {

	}

	//加载pdf.js 到lib，页面加载完成后执行的
	function setLib(_pdfLib){
		pdfLib = _pdfLib;
		nsUI.pdfViewer.pdfLib = _pdfLib;
	}
	function init(delayTime){
		//delayTime 页面加载完成后延迟加载pdf.js
		$(function(){
			setTimeout(function(){
				var _lib = window['pdfjs-dist/build/pdf'];
				if(_lib){
					//如果已经载入pdf则直接使用
					nsUI.pdfViewer.setLib(_lib);
				}else{
					var _lib = requirejs([PDF_LIB_URL]);
					nsUI.pdfViewer.setLib(_lib);
				}
			}, delayTime)
		})

	}
	init();
	
	function setDefault(_config){
		var defaultConfig = {
			title:'PDF',
			pageNumber:1,
			isDownload:false,
			isPrint:false,
			isZoom:true,
			zoomFit:    'width',
		}
		nsVals.setDefaultValues(_config, defaultConfig);
		//按钮中的任何一个有，则添加按钮容器
		if(_config.isDownload || _config.isPrint || _config.isZoom){
			_config.isHaveBtnsContainer = true;
		}else{
			_config.isHaveBtnsContainer = false;
		}
		//手机端或者PC端模式
		_config.browserSystem = nsVals.browser.browserSystem;
		_config.$selectPage = $('<select id="dialog-pdf-selectpage" class="select-changepage-intitle"   style="float: right; position:relative; "></select>');
		_config.$btnsContainer = $('<div id="dialog-pdf-btns-container" class="btns-container-intitle"  style="float: right; position:relative; "></div>');
	}

	var viewerManager = {
		init:function(_config){
			setDefault(_config);
			config = _config;
			this.config = config;
		},
		//全屏弹框
		fullScreenDialog:function (){
			var _this = this;
			//容器
			var html = 
				'<div id="dialog-pdf-scaleinfo" class="info-center">' 		//缩放信息
				+'</div>'
				+'<div id="dialog-pdf-container" class="container-center">' //容器 包含btn和canvas
					+'<div id="dialog-pdf-container-canvas-all" class="container-canvas-all">' 
						+'<canvas id="dialog-pdf-container-canvas" ></canvas>'
					+'</div>'
				+'</div>';
			var $container = $(html);
			config.$dialogContainer = $container;
		
			var widthHeight = $(window).height();
			var dialogId = 'dialog-pdf';

			var contentDialogConfig = 
			{
				id:dialogId,
				title:config.title, 
				width:'100%',
				height:widthHeight,
				plusClass:'fullscreen pdfview pdfview-' + config.browserSystem,  //补充了PC端和手机端样式
				shownHandler:function(){
					//添加相关组件的容器
					var $panelTitle = $("#" + dialogId + ' .panel-title');
					$panelTitle.css({
						'padding-right':'40px',
					})
					
					var $panelBody =  $("#" + dialogId + ' .panel-body');
					$panelBody.append($container);
					$panelBody.css({
						'position':'absolute',
						'top':$panelTitle.outerHeight(),
						'left':0,
						'right':0,
						'bottom':0
					})
					//pdf容器
					var $pdfContainer = $('#dialog-pdf-container');
					$pdfContainer.css({
						'position':'absolute',
						'top':0,
						'left':0,
						'right':0,
						'bottom':0,
						'overflow':'auto',
					})
					//插入下拉框
					$panelTitle.append(config.$selectPage);
					//插入按钮
					if(config.isHaveBtnsContainer){
						$('#dialog-pdf .panel-title').append(config.$btnsContainer);
						_this.initBtns();
					}
				},
				hiddenHandler:function(resObj){
					//关闭后清除pdf
					_this.documentEventOff();
					//如果有则关闭打印iframe
					if($('#iframe-print').length>0){
						$('#iframe-print').remove();
					}
				}
			}
			nsFrame.contentDialog.show(contentDialogConfig);
		},

		//初始化按钮
		initBtns:function(){

			var btnsArray = [];
			var url = config.url;
			var fileName = url.substr(url.lastIndexOf('/')+1);
			//下载按钮
			if(config.isDownload){
				btnsArray.push({
					text: 		'下载PDF',
					handler: 	function(){
						nsVals.downloadFile(fileName,url);
					}
				})
			}
			//打印按钮
			if(config.isPrint){
				btnsArray.push({
					text: 		'打印PDF',
					handler: 	function(){
						if($('#iframe-print').length>0){
							$('#iframe-print').remove();
						}
						$('body').append('<iframe id="iframe-print" style="display:none; visibility:hidden;" src="'+url+'"></iframe>')
						$("#iframe-print")[0].contentWindow.print();
					}
				})
			}
			//放大缩小
			if(config.isZoom){
				btnsArray.push({
					text: 		'放大PDF',
					handler: 	function(){
						var page = nsUI.pdfViewer.pdfManager.page;
						var scale = config.zoom.current * 1.5;
						nsUI.pdfViewer.pdfManager.show(page, scale);
					}
				});
				btnsArray.push({
					text: 		'缩小PDF',
					handler: 	function(){
						var page = nsUI.pdfViewer.pdfManager.page;
						var scale = config.zoom.current * (1/1.5);
						nsUI.pdfViewer.pdfManager.show(page, scale);
					}
				})
				btnsArray.push({
					text: 		'适应宽度',
					handler: 	function(){
						var page = nsUI.pdfViewer.pdfManager.page;
						var scale = config.zoom.autoFitScale.width;
						nsUI.pdfViewer.pdfManager.show(page, scale);
					}
				})
				btnsArray.push({
					text: 		'适应高度',
					handler: 	function(){
						var page = nsUI.pdfViewer.pdfManager.page;
						var scale = config.zoom.autoFitScale.height;
						nsUI.pdfViewer.pdfManager.show(page, scale);
					}
				})
				
			}
			var btnsId = 'dialog-pdf-btns-container';
			nsButton.initBtnsByContainerID(btnsId, btnsArray, true);

		},

		//初始化页码下拉框 
		initSelect:function(){
			var _this = this;
			var _pdf = pdfManager.pdf;
			var numPages = _pdf.numPages;
			var html = '';
			//依次输出页码供跳转
			for(var i = 1; i<=numPages; i++){
				html += '<option value ="'+i+'">'+i+'</option>';
			}
			var $selectPage = _this.config.$selectPage;
			$selectPage.empty();
			$selectPage.append(html);
			$selectPage.on('change', function(ev){
				
				var pdf = pdfManager.pdf;
				var pageNumber = parseInt($(this).val());
				//打开pdf指定页码
				pdfManager.getPage(pdf, pageNumber, function(page){
					//
					var scale = config.zoom.current;
					pdfManager.show(page, scale, function(){
						//渲染完成后执行
					})
				});
			})
		},

		//初始化画布拖动功能
		initCanvasEvent:function(){
				
		},
		alertShowing:false,
		//关闭整体的快捷键
		documentEventOff:function(){
			var browserSystem = config.browserSystem
			if(browserSystem == 'pc'){
				$(document).off('keyup', _this.shortKeyHandler);
				//鼠标滚轮
				$(document).off('mousewheel', _this.mouseWheelHandler);
				//屏蔽右键
				$(document).off('contextmenu', _this.contextMenuHandler);
			}
		},
		//打开某页并定位
		isRending:false, //渲染中不能重复执行pageShow
		pageShow:function(_pageNumber, _scrollTop){
			
			var _this = this;
			var pdf = pdfManager.pdf;

			//渲染pdf中则停止执行
			if(_this.isRending == true){
				return false;
			}

			//开始渲染页面
			_this.isRending = true;
			pdfManager.getPage(pdf, _pageNumber, function(page){
				var scale = config.zoom.current;
				pdfManager.show(page, scale, function(){
					//渲染完成后执行
					$('#dialog-pdf-container').scrollTop(_scrollTop);
					nsUI.pdfViewer.pdfManager.pageNumber = _pageNumber;
					_this.isRending = false;
				})
			});
			_this.config.$selectPage.val(_pageNumber);
		},
		//上下滚轮到头 翻页
		mouseWheelHandler:function(ev){
			var _this = nsUI.pdfViewer;
			var _pdf = _this.pdfManager.pdf;

			var $canvasContainer = $('#dialog-pdf-container');
			var $canvas = $('#dialog-pdf-container-canvas');

			//判断当前是否滚动到底部
			var windowHeight = ev.data.windowHeight;
			var canvasContainerHeight = $canvasContainer.innerHeight(); 
			var canvasHeight = $canvas.height();
			var scrollHeight = canvasHeight - windowHeight;  //可用的滚动举例（高度）；
			var scrollTop = $canvasContainer.scrollTop();

			var delta = ev.originalEvent.wheelDelta || ev.originalEvent.detail;//firefox使用detail:下3上-3,其他浏览器使用wheelDelta:下-120上120//下滚
			var wheelDirction = delta > 0 ?"up":"down";  //滚动方式是向上或者向下滚动
			var isTop = false; 
			if(scrollTop == 0){
				isTop = true;
			}
			var isBottom = false;
			if(scrollTop >= scrollHeight || canvasHeight <= canvasContainerHeight){
				isBottom = true;
			}

			if(isTop && wheelDirction == 'up'){
				//向上且到顶是向上翻页，并且定位到最下面
				var _pageNumber = _this.pdfManager.page.pageNumber - 1;
				if(_pageNumber < 1){
					//没有上一页了
				}else{
					_this.viewerManager.pageShow(_pageNumber, scrollHeight);
				}
			}else if(isBottom && wheelDirction == 'down'){
				//如果是向下滚动，则判断是否滚动到底，到底后向下翻页
				var _pageNumber = _this.pdfManager.page.pageNumber + 1;
				var _numPages = _pdf.numPages;
				if(_pageNumber > _numPages){
					//没有下一页了
				}else{
					_this.viewerManager.pageShow(_pageNumber, 0);
				}
			}

		},
		//弹框形式打开
		dialog:function(_config){
			var _this = this;
			//config:object 打开pdf的配置参数
			setDefault(_config);
			config = _config;
			_this.fullScreenDialog();
			
			var windowHeight = $(window).height()-44;
			var evData = {
				windowHeight:windowHeight,
			};
			$(document).on('mousewheel',evData,_this.mouseWheelHandler);
			//取缩放级别最大的一级做为缩放参数
			
			//载入文件
			pdfManager.load(config.url, function(pdf){
				//console.log(pdf);
				//打开pdf页面
				pdfManager.getPage(pdf, 1, function(page){
					//
					var scale = config.zoom.zoomFitScale;
					pdfManager.show(page, scale, function(){
						//渲染完成后执行
						_this.initBtns();
						_this.initSelect();
					})
				});
			});
		},

		
	}

	function dialog(_config){
		viewerManager.init(_config);
		viewerManager.dialog(_config);
	}


	var pdfManager = {
		//loading 加载
		pdf:{},
		//先清除
		aloneAlert:function(text, state){
			toastr.clear();
			nsalert(text,state);
		},
		load:function(url, callbackFunc){
			var _this = this;
			_this.$selectPage = config.$selectPage;
			//url:string pdf的地址
			var loadingTask = pdfLib.getDocument(url);
			//挂载监听器，完成后执行
			loadingTask.promise.then(function(pdf) {
				_this.pdf = pdf;
				if(typeof(callbackFunc) == 'function'){
					callbackFunc(pdf);
				}
			}, function (reason) {
				// PDF加载出错
				nsalert('PDF加载出错','error');
				console.error(reason);
			})
		},
		//获取pdf页面
		page:{},
		getPage:function(_pdf, _pageNumber, callbackFunc){
			var _this = this;
			_pdf.getPage(_pageNumber).then(function(page) {
				_this.page = page;
				//读取view信息
				config.zoom = _this.getZoom(page);
				
				if(typeof(callbackFunc)=='function'){
					callbackFunc(page);
				}
			})
		},
		//打开PDF页面
		show:function(page, scale, callbackFunc){
			//console.log(page);
			config.zoom.current = scale;
			var viewport = page.getViewport(scale);
			//画板渲染
			var canvasId = 'dialog-pdf-container-canvas';
			var canvas = document.getElementById(canvasId);
			var context = canvas.getContext('2d');
			canvas.height = viewport.height;
			canvas.width = viewport.width;
			
			//渲染参数定义
			var renderContext = {
			  canvasContext: context,
			  viewport: viewport
			};
			var renderTask = page.render(renderContext);
			renderTask.then(function () {
				//渲染完成
				if(typeof(callbackFunc)=='function'){
					callbackFunc(page);
				}
			});
			
		},
		//获取实际缩放比例等缩放信息
		getZoom:function(page){
			//只生成一次，第二次调用则直接返回
			if(config.zoom){
				return config.zoom;
			}
			
			var fitScale = 1;  //缩放比例 根据pdf的宽度和页面宽度比例重新生成缩放比例数组

			var autoFitScale = {
				width:(window.innerWidth - 10) / page.view[2],
				height:(window.innerHeight - 50) / page.view[3],
			}
			if(config.zoomFit == 'width'){
				fitScale = autoFitScale.width;
			}else if(config.zoomFit == 'height'){
				fitScale = autoFitScale.height;
			}

			return {
				zoomFit: 		config.zoomFit,     //使用宽或者高  'width'或者'height'
				zoomFitScale: 	fitScale,  			//默认全屏显示下的缩放比例 适应宽度或者高度
				autoFitScale: 	autoFitScale, 		//自动缩放的比例  {width: ,height: ,}
			};
		}
	}

	return {
		VERSION: '1.0.1', 	//第二版 第一版停用
		init:init, 			//入口方法
		pdfManager:pdfManager, 			//pdf的方法管理器 主要是.show等方法
		viewerManager:viewerManager, 	//展示方法
		setLib:setLib, 		//pdf的JS库
		dialog:dialog, 		//弹框打开
	}
})()