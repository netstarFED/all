//需要引入的第三方插件 assets/js/pdf/pdf.js
//PDF浏览器新版本 20200323 
if (typeof (NetstarUI) == 'undefined') {
	NetstarUI = {};
}
NetstarUI.multiPdfViewer = (function () {
	var PDF_LIB_URL = '/static/libs/pdf/pdf.js';
	var PDF_WORKER_SRC = '/static/libs/pdf/pdf.worker.js';
	var _this = {};
	// var config = {};
	var pdfLib = {
		name: 'pdflib'
	};
	var I18N = {
		en: {},
		zh: {}
	};
	var TEMPLATE = {

	}
	//加载pdf.js 到lib，页面加载完成后执行的
	function setLib(_pdfLib) {
		pdfLib = _pdfLib;
		NetstarUI.multiPdfViewer.pdfLib = _pdfLib;
	}

	function preInit(delayTime) {
		//delayTime 页面加载完成后延迟加载pdf.js
		$(function () {
			setTimeout(function () {
				var _lib = window['pdfjs-dist/build/pdf'];
				if (_lib) {
					//如果已经载入pdf则直接使用
					NetstarUI.multiPdfViewer.setLib(_lib);
				} else {
					var _lib = requirejs([PDF_LIB_URL]);
					NetstarUI.multiPdfViewer.setLib(_lib);
				}
			}, delayTime)
		})
	}
	preInit();

	function setDefault(_config) {
		var defaultConfig = {
			title: '',
			pageNumber: 1,
			isDownload: false,
			isPrint: true,
			isZoom: true,
			zoomFit: 'width',
			imgWidth:100,
		}
		nsVals.setDefaultValues(_config, defaultConfig);
		//按钮中的任何一个有，则添加按钮容器
		if (_config.isDownload || _config.isPrint || _config.isZoom) {
			_config.isHaveBtnsContainer = true;
		} else {
			_config.isHaveBtnsContainer = false;
		}
		//手机端或者PC端模式
        //_config.browserSystem = nsVals.browser.browserSystem;
        _config.browserSystem = nsVals.getIEBrowserVersion().browserSystem
		var styleStr = '';
		if (_config.id) {
			_config.selectPageId = _config.id + '-pdf-selectpage';
			_config.btnsContainerId = _config.id + '-pdf-btns-container';
		} else {
			_config.selectPageId = 'dialog-pdf-selectpage';
			_config.btnsContainerId = 'dialog-pdf-btns-container';
			styleStr = "float: right; position:relative;";
		}
		_config.$selectPage = $('<select id="' + _config.selectPageId + '" class="select-changepage-intitle"   style="' + styleStr + '"></select>');
		_config.$btnsContainer = $('<div id="' + _config.btnsContainerId + '" class="btns-container-intitle pt-btn-group" ns-pdfid="' + _config.id + '"  style="' + styleStr + '"></div>');
	}

	var viewerManager = {
		configs:{},
		showImgConfig:{},
		init: function (_config) {
			setDefault(_config);
			this.configs[_config.id] = _config;
		},
		appendHtml: function (_config) {

			var config = _config;
			var _this = this;

			//容器
			config.canvasAllId = config.id + '-canvas-all';
			var html =
				'<div id="pdf-scaleinfo" class="info-center">' //缩放信息
				+
				'</div>' +
				'<div id="pdf-container" class="container-center">' //容器 包含btn和canvas
				+
				'<div id="' + config.canvasAllId + '" class="container-canvas-all">' +
				'</div>' +
				'</div>';
			var $container = $(html);
			config.$dialogContainer = $container;
			//var widthHeight = $(window).height();
			//标题
			var titleHtml = '';
			if (typeof (config.title) == 'string') {
				titleHtml = '<div class="panel-title">' + config.title + '</div>';
			}
			//底部
			var footerHtml = '';
			if (typeof (config.btns) == 'object') {
				footerHtml = '<div class="panel-footer"></div>';
			}
			var resultHtml = '<a class="close-btn" href="javascript:void(0);"></a>' +
				titleHtml +
				'<div class="panel-body">' +
				html +
				'</div>' +
				footerHtml +
				'</div>';
			var $panelContainer = $('#' + config.id);
			$panelContainer.html(resultHtml);
			var classStr = 'show-content common-show-simple-panel pdfview pdfview-' + config.browserSystem;
			$panelContainer.addClass(classStr);
			//$('body').append($panelContainer);

			var $panelTitle = $panelContainer.children('.panel-title');
			//插入下拉框
			//$panelTitle.append(config.$selectPage);
			//插入按钮
			//var $footer = $panelContainer.closest('.pt-pdfview-item').children('.pt-pdfview-footer');
			var $footer = $panelContainer.parent().children('.pt-pdfview-footer');
			if ($footer.length == 0) {
				$panelContainer.parent().append('<div class="pt-pdfview-footer"></div>');
				$footer = $panelContainer.parent().children('.pt-pdfview-footer');
			}
			$footer.html('');
			if (config.isHaveBtnsContainer) {
				$footer.append(config.$btnsContainer);
				_this.initBtns(config);
			}
			config.pageLengthInputId = config.id + '-topage-input';
			config.pageLengthSelectId = config.id + '-topage-select';
			config.pagerId = config.id + '-topage-container';
			var selectHtml = '<div class="pt-pager">' +
				'<div class="pt-form pt-form-inline pt-form-normal">' +
				'<div class="pt-form-body">' +
				'<div class="pt-page-turn" id="' + config.pagerId + '" ns-pdfid="' + config.id + '">' +
				'<div class="pt-btn-group">' +
				'<button class="pt-btn pt-btn-default pt-btn-icon" type="button" ns-operator="first">' +
				'<i class="icon-step-backward-o"></i>' +
				'</button>' +
				'<button class="pt-btn pt-btn-default pt-btn-icon" type="button" ns-operator="prev">' +
				'<i class="icon-arrow-left"></i>' +
				'</button>' +
				'</div>' +
				'<div class="pt-form-group">' +
				'<label for="name" class="pt-control-label">第</label>' +
				'<div class="pt-input-group">' +
				'<input type="text" placeholder="1" value="1" id="' + config.pageLengthInputId + '" class="pt-form-control">' +
				'<div class="pt-input-group-btn">' +
				'<button class="pt-btn pt-btn-default pt-btn-icon" type="button" ns-operator="topageselect">' +
				'<i class="icon-arrow-down-o"></i>' +
				'</button>' +
				'</div>' +
				'<div id="' + config.pageLengthSelectId + '" class="pt-input-group-select">'
				//+'<ul>'
				//+'<li ns-data-value="1" class="active">1</li>'
				//+'</ul>'
				+
				'</div>' +
				'</div>' +
				'<label for="name" class="pt-control-label">页</label>' +
				'</div>' +
				'<div class="pt-btn-group">' +
				'<button class="pt-btn pt-btn-default pt-btn-icon" type="button" ns-operator="next"><i class="icon-arrow-right"></i></button>' +
				'<button class="pt-btn pt-btn-default pt-btn-icon" type="button" ns-operator="last"><i class="icon-step-forward-o"></i></button>' +
				'</div>' +
				'</div>' +
				'</div>' +
				'</div>' +
				'</div>';
			// $footer.append(selectHtml);				
		},
		zoomIn:function(id){
			var page = NetstarUI.multiPdfViewer.pdfManager.page;
			if (id) {
				console.log(id)
				//sjj 如果有图片的情况
				if(NetstarUI.multiPdfViewer.viewerManager.showImgConfig[id]){
					config = NetstarUI.multiPdfViewer.viewerManager.showImgConfig[id];
					config.imgWidth = config.imgWidth*1.5;
				}else{
					page = NetstarUI.multiPdfViewer.pdfManager.pdfObj[id].page;
					config = NetstarUI.multiPdfViewer.pdfManager.pdfObj[id].config;
					var scale = config.zoom.current * 1.5;
					config.zoom.zoomFitScale = scale;
				}
			}
			viewerManager.show(config);
		},
		//初始化按钮
		initBtns: function (_config) {
			var config = _config;
			var btnsArray = [];
			
			var currentActiveIdPrev = 'file-files-'; 
			var currentActiveId = config.id.substring(currentActiveIdPrev.length,config.id.length);
			//var urlIndex = $('#'+currentActiveId+' ul li.current').index();

			var url = config.url;
			var fileName = config.fileName;
			if($.isArray(config.url)){
				url = config.url[0].url;
				fileName = config.url[0].title;
			}
			if(typeof(fileName) != "string"){
				fileName = url.substr(url.lastIndexOf('/') + 1);
				fileName = fileName.substr(0, fileName.indexOf('?'));
			}
			//放大缩小
			if (config.isZoom) {
				btnsArray.push({
					text: '放大PDF',
					isShowIcon: true,
					iconCls: 'icon-zoom-in',
					isShowText: false,
					state: 'pt-btn-icon',
					handler: function (data) {
						//aaa
						var id = $(data.event.currentTarget).closest('.btns-container-intitle').attr('ns-pdfid');
						NetstarUI.multiPdfViewer.viewerManager.zoomIn(id);
					}
				});
				btnsArray.push({
					text: '缩小PDF',
					isShowIcon: true,
					iconCls: 'icon-zoom-out',
					isShowText: false,
					state: 'pt-btn-icon',
					handler: function (data) {
						var page = NetstarUI.multiPdfViewer.pdfManager.page;
						var id = $(data.event.currentTarget).closest('.btns-container-intitle').attr('ns-pdfid');
						var page = NetstarUI.multiPdfViewer.pdfManager.page;
						if (id) {
							//sjj 如果有图片的情况
							if(NetstarUI.multiPdfViewer.viewerManager.showImgConfig[id]){
								config = NetstarUI.multiPdfViewer.viewerManager.showImgConfig[id];
								config.imgWidth = config.imgWidth*(1/1.5);
							}else{
								page = NetstarUI.multiPdfViewer.pdfManager.pdfObj[id].page;
								config = NetstarUI.multiPdfViewer.pdfManager.pdfObj[id].config;
								var scale = config.zoom.current * (1 / 1.5);
								config.zoom.zoomFitScale = scale;
							}
						}
						viewerManager.show(config);

					}
				})
			}
			//预览按钮
			if (config.isPrint) {
				btnsArray.push({
					text: '预览PDF',
					isShowIcon: true,
					iconCls: 'icon-eye-o',
					isShowText: false,
					state: 'pt-btn-icon',
					handler: function () {
						if ($('#iframe-print').length > 0) {
							$('#iframe-print').remove();
						}
						// $('body').append('<iframe id="iframe-print" style="display:none; visibility:hidden;" src="' + url + '"></iframe>')
						// $("#iframe-print")[0].contentWindow.print();
						window.open(url,'_blank');
					}
				})
			}
			//打印按钮 线上环境是https window.location.protocol == 'https:'
			if (config.isPrint) {
				var printBtnCOnfig = {
					text: '打印PDF',
					isShowIcon: true,
					iconCls: 'icon-print-o',
					isShowText: false,
					disabled:true,
					state: 'pt-btn-icon',
					handler: function () {
						if ($('#iframe-print').length > 0) {
							$('#iframe-print').remove();
						}
						$('body').append('<iframe id="iframe-print" style="display:none; visibility:hidden;" src="' + url + '"></iframe>')
						$("#iframe-print")[0].contentWindow.print();
					}
				}
				if(window.location.protocol == 'https:'){
					printBtnCOnfig.disabled = false;
				}
				btnsArray.push(printBtnCOnfig);
			}
			//下载按钮
			/*
			if (config.isDownload) {
				btnsArray.push({
					text: '下载PDF',
					isShowIcon: true,
					iconCls: 'icon-download-o',
					isShowText: false,
					state: 'pt-btn-icon',
					handler: function () {
						// nsVals.downloadFile(fileName, url);
						NetStarUtils.download({
							method: "GET",
							url: url,
							fileName: fileName,
						});
					}
				})
			}*/
			var btnsId = config.btnsContainerId;
			vueButtonComponent.init({
				id: btnsId,
				isShowTitle: false,
				pageId: 'lims-reports-package',
				package: 'lims.reports.package',
				btns: btnsArray,
			});
			//nsButton.initBtnsByContainerID(btnsId, btnsArray, true);

		},

		//关闭整体的快捷键
		documentEventOff: function () {
			var browserSystem = NetStarUtils.Browser.browserSystem;
			if (browserSystem == 'pc') {
				$(document).off('keyup', _this.shortKeyHandler);
				//鼠标滚轮
				$(document).off('mousewheel', _this.mouseWheelHandler);
				//屏蔽右键
				$(document).off('contextmenu', _this.contextMenuHandler);
			}
		},

		//初始化canvas 根据内容逐页输出
		appendCanvas: function (_config, number, $canvasGroup) {

			var config = _config;
			var $canvasAll = $('#' + config.canvasAllId);
			var styleStr = 'width:auto;';
			//如果是像素密度不是1，则强制缩放
			if(pdfManager.getPixelRatio() != 1){
				var zoom = 1;
				if(_config.zoom){
					zoom = _config.zoom.zoomFitScale/_config.zoom.autoFitScale[_config.zoom.zoomFit]
				}
				styleStr = 'width:'+ $canvasAll.innerWidth() * zoom + 'px;';
			}
			var canvasLength = $canvasAll.find('canvas').length;
			var canvasArr = [];
			for (var i = canvasLength; i < canvasLength + number; i++) {
				var canvasId = config.id + '-canvas-' + i;
				var $canvas = $('<canvas id=' + canvasId + ' style="'+styleStr+'"></canvas>');
				$canvasGroup.append($canvas);
				canvasArr.push(canvasId);
			}
			return canvasArr;
		},

		show: function (_config) {
			//console.log(_config)
			var _this = this;
			setDefault(_config);
			var config = _config;
			_this.appendHtml(config);
			//载入文件
			var url = config.url[0].url;
			// _this.showPdf(url, function(){
			// 	_this.initBtns();
			// });
			var increaseLength = 0;
			var totalLength = 0;
			for (var j = 0; j < config.url.length; j++) {
				var urlData = config.url[j];
				switch(urlData.type.toLocaleLowerCase()){
					//sjj 20200114 大小写转换
					case 'pdf':
					case 'img':
					case 'jpg':
					case 'png':
					case 'gif':
						totalLength++;
						break;
				}
			}
			for (var i = 0; i < config.url.length; i++) {
				var url = config.url[i].url;
				var type = config.url[i].type.toLocaleLowerCase();
				if (type == 'pdf') {
					_this.showPdf(config, url, i, function () {
						increaseLength++;
						if(increaseLength == totalLength){
							if(typeof(config.completeHandler)=='function'){
								config.completeHandler(config);
							}
						}
						// _this.initBtns();
					});
				} else if (type == 'img' || type == 'jpg' || type == 'png' || type == 'gif') {
					_this.showImg(config, url, i, function () {
						increaseLength++;
						if(increaseLength == totalLength){
							if(typeof(config.completeHandler)=='function'){
								config.completeHandler(config);
							}
						}
						// _this.initBtns();
					});
				}

			}
		},
		
		//逐个页面渲染PDF
		showPdf: function (_config, url, index, cb, config) {
			var config = _config;
			var _this = this;

			//先添加所有canvas的父容器
			var canvasGroupId = config.id + '-canvas-group-'+ (index + 1);
			var canvasGroupHtml = '<div class="container-canvas-group" id="' + canvasGroupId + '"></div>';
			var $canvasGroup = $(canvasGroupHtml);
			var $canvasAll = $('#' + config.canvasAllId);
			$canvasAll.append($canvasGroup);
			pdfManager.load(config, url, function (pdf) {
				//打开pdf页面
				if(pdf){
					var canvasArr = _this.appendCanvas(config, pdf.numPages, $canvasGroup);
					config.canvasArr = canvasArr;
	
					for (var i = 0; i < canvasArr.length; i++) {
						var canvasId = canvasArr[i];
						var pageNum = i + 1;
						pdfManager.getPage(config, pdf, pageNum, canvasId, function (page, _canvasId) {
							//逐个页面渲染
							var scale = config.zoom.zoomFitScale;
							var canvas = $('#' + _canvasId)[0];
							pdfManager.show(config, page, scale, canvas, function () {
								//渲染完成后执行
								cb && cb();
							})
						});
					}
				}else{
					cb && cb();
				}

			});
		},
		showImg: function (_config, url, index, cb) {
			var config = _config;
			// var _this = this;f
			var containerId = config.id + '-container-' + index;
			var imgWidth = config.imgWidth;
			if(typeof(imgWidth)=='undefined'){imgWidth = 100}
			var html = '<div id="'+containerId+'"><img src="'+ url +'" style="width:'+imgWidth+'%; "></div>';
			var $canvasAll = $('#' + config.canvasAllId);
			$canvasAll.append(html);
			this.showImgConfig[config.id] = _config;
			cb && cb();
		}

	}

	function init(_config) {
		viewerManager.init(_config);
		viewerManager.show(_config);
	}

	function dialog(_config) {
		viewerManager.init(_config);
		viewerManager.dialog(_config);
	}

	var pdfManager = {
		//loading 加载
		pdf: {},
		load: function (_config, url, callbackFunc) {
			var config = _config;
			var _this = this;
			//url:string pdf的地址
			//var loadingTask = pdfLib.getDocument(url);rangeChunkSize:65536*16
			var loadingTask = pdfLib.getDocument({url:url,rangeChunkSize:1024*512})
			//挂载监听器，完成后执行
			loadingTask.promise.then(function (pdf) {
				_this.pdf = pdf;
				if (config.id) {
					if (typeof (_this.pdfObj) != 'object') {
						_this.pdfObj = {};
					}
					_this.pdfObj[config.id] = {
						pdf: pdf,
						config: config
					};
				}
				if (typeof (callbackFunc) == 'function') {
					callbackFunc(pdf);
				}
			}, function (reason) {
				// PDF加载出错
				nsalert('PDF加载出错', 'error');
				console.error(reason);
				if (typeof (callbackFunc) == 'function') {
					callbackFunc();
				}
			})
		},
		//获取pdf页面
		page: {},
		getPage: function (_config, _pdf, _pageNumber, canvasId, callbackFunc) {
			var config = _config;
			var _this = this;
			_pdf.getPage(_pageNumber).then(function (page) {
				_this.page = page;
				if (config.id) {
					if (typeof (_this.pdfObj) != 'object') {
						_this.pdfObj = {};
					}
					_this.pdfObj[config.id].page = page;
				}
				//读取view信息
				config.zoom = _this.getZoom(config, page);

				if (typeof (callbackFunc) == 'function') {
					callbackFunc(page, canvasId);
				}
			})
		},
		//获取浏览器像素密度 cy 2020/02/20
		getPixelRatio : function () {
            if (window.devicePixelRatio && window.devicePixelRatio > 1) {
                return window.devicePixelRatio;
            }
            return 1;
        },
		//打开PDF页面
		show: function (_config, page, scale, canvas, callbackFunc) {
			var config = _config;
			config.zoom.current = scale;
			//添加对像素密度的支持 cy 2020/02/20
			var pixelRatio = this.getPixelRatio();
			var viewport = page.getViewport(scale * pixelRatio) ;
			//画板渲染
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
				if (typeof (callbackFunc) == 'function') {
					callbackFunc(page);
				}
			});

		},
		//获取实际缩放比例等缩放信息
		getZoom: function (_config, page) {
			var config = _config;
			//只生成一次，第二次调用则直接返回
			if (config.zoom) {
				return config.zoom;
			}

			var fitScale = 1; //缩放比例 根据pdf的宽度和页面宽度比例重新生成缩放比例数组
			var autoFitScale = {};
			if(_config.browserSystem == 'mobile'){
				//手机版显示PDF无边框
				autoFitScale = {
					width: window.innerWidth / page.view[2],
					height: window.innerHeight / page.view[3],
				};
			}else{
				autoFitScale = {
					width: (window.innerWidth - 10) / page.view[2],
					height: (window.innerHeight - 50) / page.view[3],
				};
				if (config.id) {
					var $container = $('#' + config.id);
					var containerHeight = $container.outerHeight();
					autoFitScale = {
						width: ($container.outerWidth() - 20) / page.view[2],
						height: (containerHeight) / page.view[3],
					};
				}
			}
			
			if (config.zoomFit == 'width') {
				fitScale = autoFitScale.width;
			} else if (config.zoomFit == 'height') {
				fitScale = autoFitScale.height;
			}

			return {
				zoomFit: config.zoomFit, 		//使用宽或者高  'width'或者'height'
				zoomFitScale: fitScale, 		//默认全屏显示下的缩放比例 适应宽度或者高度
				autoFitScale: autoFitScale, 	//自动缩放的比例  {width: ,height: ,}
			};
		}
	}
	return {
		version: '1.4.1',  
		init: init,
		setLib: setLib, //pdf的JS库
		dialog: dialog,
		pdfManager: pdfManager,
		viewerManager:viewerManager
	}
})()