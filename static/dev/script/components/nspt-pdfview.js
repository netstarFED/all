//需要引入的第三方插件 assets/js/pdf/pdf.js
if (typeof (NetstarUI) == 'undefined') {
	NetstarUI = {};
}
NetstarUI.pdfViewer = (function () {
	var PDF_LIB_URL = '/static/libs/pdf/pdf.js';
	var PDF_WORKER_SRC = '/static/libs/pdf/pdf.worker.js';
	var _this = {};
	var config = {};
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
		NetstarUI.pdfViewer.pdfLib = _pdfLib;
	}

	function preInit(delayTime) {
		//delayTime 页面加载完成后延迟加载pdf.js
		$(function () {
			setTimeout(function () {
				var _lib = window['pdfjs-dist/build/pdf'];
				if (_lib) {
					//如果已经载入pdf则直接使用
					NetstarUI.pdfViewer.setLib(_lib);
				} else {
					var _lib = requirejs([PDF_LIB_URL]);
					NetstarUI.pdfViewer.setLib(_lib);
				}
			}, delayTime)
		})
	}
	preInit();

	function setDefault(_config) {
		var defaultConfig = {
			title: 'PDF',
			pageNumber: 1,
			isDownload: false,
			isPrint: true,
			isZoom: true,
			zoomFit: 'width',
		}
		nsVals.setDefaultValues(_config, defaultConfig);
		//按钮中的任何一个有，则添加按钮容器
		if (_config.isDownload || _config.isPrint || _config.isZoom) {
			_config.isHaveBtnsContainer = true;
		} else {
			_config.isHaveBtnsContainer = false;
		}
		//手机端或者PC端模式
		_config.browserSystem = nsVals.browser.browserSystem;
		var styleStr = '';
		if (_config.id) {
			_config.selectPageId = config.id + '-pdf-selectpage';
			_config.btnsContainerId = config.id + '-pdf-btns-container';
		} else {
			_config.selectPageId = 'dialog-pdf-selectpage';
			_config.btnsContainerId = 'dialog-pdf-btns-container';
			styleStr = "float: right; position:relative;";
		}
		_config.$selectPage = $('<select id="' + _config.selectPageId + '" class="select-changepage-intitle"   style="' + styleStr + '"></select>');
		_config.$btnsContainer = $('<div id="' + _config.btnsContainerId + '" class="btns-container-intitle pt-btn-group" ns-pdfid="' + _config.id + '"  style="' + styleStr + '"></div>');
	}

	var viewerManager = {
		init: function (_config) {
			setDefault(_config);
			config = _config;
			this.config = config;
		},
		//全屏弹框
		fullScreenDialog: function () {
			var _this = this;
			//容器
			var html =
				'<div id="dialog-pdf-scaleinfo" class="info-center">' //缩放信息
				+
				'</div>' +
				'<div id="dialog-pdf-container" class="container-center">' //容器 包含btn和canvas
				+
				'<div id="dialog-pdf-container-canvas-all" class="container-canvas-all">' +
				'<canvas id="dialog-pdf-container-canvas" ></canvas>' +
				'</div>' +
				'</div>';
			var $container = $(html);
			config.$dialogContainer = $container;

			var widthHeight = $(window).height();
			var dialogId = 'dialog-pdf';
			config.canvasId = 'dialog-pdf-container-canvas';
			var contentDialogConfig = {
				id: dialogId,
				title: config.title,
				width: '100%',
				height: widthHeight,
				plusClass: 'fullscreen pdfview pdfview-' + config.browserSystem, //补充了PC端和手机端样式
				shownHandler: function () {
					//添加相关组件的容器
					var $panelTitle = $("#" + dialogId + ' .panel-title');
					$panelTitle.css({
						'padding-right': '40px',
					})

					var $panelBody = $("#" + dialogId + ' .panel-body');
					$panelBody.append($container);
					$panelBody.css({
						'position': 'absolute',
						'top': $panelTitle.outerHeight(),
						'left': 0,
						'right': 0,
						'bottom': 0
					})
					//pdf容器
					var $pdfContainer = $('#dialog-pdf-container');
					$pdfContainer.css({
						'position': 'absolute',
						'top': 0,
						'left': 0,
						'right': 0,
						'bottom': 0,
						'overflow': 'auto',
					})
					//插入下拉框
					$panelTitle.append(config.$selectPage);
					//插入按钮
					if (config.isHaveBtnsContainer) {
						$('#dialog-pdf .panel-title').append(config.$btnsContainer);
						_this.initBtns();
					}
				},
				hiddenHandler: function (resObj) {
					//关闭后清除pdf
					_this.documentEventOff();
					//如果有则关闭打印iframe
					if ($('#iframe-print').length > 0) {
						$('#iframe-print').remove();
					}
				}
			}
			NetstarUI.contentDialog.show(contentDialogConfig);
		},
		appendHtml: function () {
			var _this = this;

			config.canvasId = config.id + '-pdf-container-canvas';
			//容器
			var html =
				'<div id="pdf-scaleinfo" class="info-center">' //缩放信息
				+
				'</div>' +
				'<div id="pdf-container" class="container-center">' //容器 包含btn和canvas
				+
				'<div id="pdf-container-canvas-all" class="container-canvas-all">' +
				'<canvas id="' + config.canvasId + '" ></canvas>' +
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
				_this.initBtns();
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
			$footer.append(selectHtml);
		},
		//初始化按钮
		initBtns: function () {

			var btnsArray = [];
			var url = config.url;
			var fileName  = config.fileName;
			if(typeof(fileName) != "string"){
				fileName = url.substr(url.lastIndexOf('/') + 1);
				fileName = fileName.substr(0, fileName.indexOf('?'));
			}
			//下载按钮
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
			}
			//打印按钮
			if (config.isPrint) {
				btnsArray.push({
					text: '打印PDF',
					isShowIcon: true,
					iconCls: 'icon-print-o',
					isShowText: false,
					state: 'pt-btn-icon',
					handler: function () {
						if ($('#iframe-print').length > 0) {
							$('#iframe-print').remove();
						}
						// $('body').append('<iframe id="iframe-print" style="display:none; visibility:hidden;" src="' + url + '"></iframe>')
						// $("#iframe-print")[0].contentWindow.print();
						
						// var showFileUrl = viewerManager.getFileUrl(config);
						// var showFileName = viewerManager.getFileName(config);
						// $('body').append('<iframe id="iframe-print" style="display:none; visibility:hidden;" src="' + showFileUrl + '"></iframe>')
						// $("#iframe-print")[0].contentWindow.print();
						//跨域iframe调用问题暂时无法解决 改用新开窗口打印 cy 20191204
						window.open(url,'_blank');
					}
				})
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
						var id = $(data.event.currentTarget).closest('.btns-container-intitle').attr('ns-pdfid');
						var page = NetstarUI.pdfViewer.pdfManager.page;
						if (id) {
							page = NetstarUI.pdfViewer.pdfManager.pdfObj[id].page;
							config = NetstarUI.pdfViewer.pdfManager.pdfObj[id].config;
						}
						var scale = config.zoom.current * 1.5;
						NetstarUI.pdfViewer.pdfManager.show(page, scale);
					}
				});
				btnsArray.push({
					text: '缩小PDF',
					isShowIcon: true,
					iconCls: 'icon-zoom-out',
					isShowText: false,
					state: 'pt-btn-icon',
					handler: function (data) {
						var page = NetstarUI.pdfViewer.pdfManager.page;
						var id = $(data.event.currentTarget).closest('.btns-container-intitle').attr('ns-pdfid');
						var page = NetstarUI.pdfViewer.pdfManager.page;
						if (id) {
							page = NetstarUI.pdfViewer.pdfManager.pdfObj[id].page;
							config = NetstarUI.pdfViewer.pdfManager.pdfObj[id].config;
						}
						var scale = config.zoom.current * (1 / 1.5);
						NetstarUI.pdfViewer.pdfManager.show(page, scale);
					}
				})
				btnsArray.push({
					text: '适应宽度',
					isShowIcon: true,
					iconCls: 'icon-arrow-v',
					isShowText: false,
					state: 'pt-btn-icon',
					handler: function (data) {
						var page = NetstarUI.pdfViewer.pdfManager.page;
						var id = $(data.event.currentTarget).closest('.btns-container-intitle').attr('ns-pdfid');
						var page = NetstarUI.pdfViewer.pdfManager.page;
						if (id) {
							page = NetstarUI.pdfViewer.pdfManager.pdfObj[id].page;
							config = NetstarUI.pdfViewer.pdfManager.pdfObj[id].config;
						}
						var scale = config.zoom.autoFitScale.width;
						NetstarUI.pdfViewer.pdfManager.show(page, scale);
					}
				})
				btnsArray.push({
					text: '适应高度',
					isShowIcon: true,
					iconCls: 'icon-arrow-h',
					state: 'pt-btn-icon',
					isShowText: false,
					handler: function (data) {
						var page = NetstarUI.pdfViewer.pdfManager.page;
						var id = $(data.event.currentTarget).closest('.btns-container-intitle').attr('ns-pdfid');
						var page = NetstarUI.pdfViewer.pdfManager.page;
						if (id) {
							page = NetstarUI.pdfViewer.pdfManager.pdfObj[id].page;
							config = NetstarUI.pdfViewer.pdfManager.pdfObj[id].config;
						}
						var scale = config.zoom.autoFitScale.height;
						NetstarUI.pdfViewer.pdfManager.show(page, scale);
					}
				})

			}
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

		//初始化页码下拉框 
		initSelect: function () {
			var _this = this;
			var _pdf = pdfManager.pdf;
			var numPages = _pdf.numPages;
			var html = '';
			//依次输出页码供跳转
			for (var i = 1; i <= numPages; i++) {
				html += '<option value ="' + i + '">' + i + '</option>';
			}
			var $selectPage = _this.config.$selectPage;
			$selectPage.empty();
			$selectPage.append(html);
			$selectPage.on('change', function (ev) {

				var pdf = pdfManager.pdf;
				var pageNumber = parseInt($(this).val());
				//打开pdf指定页码
				pdfManager.getPage(pdf, pageNumber, function (page) {
					//
					var scale = config.zoom.current;
					pdfManager.show(page, scale, function () {
						//渲染完成后执行
					})
				});
			})
		},

		//初始化页码下拉框 当前界面
		initCurrentSelect: function () {
			var _this = this;
			var _pdf = pdfManager.pdf;
			var numPages = _pdf.numPages;
			var html = '';
			var pageLengthInputId = _this.config.pageLengthInputId;
			var pageLengthSelectId = _this.config.pageLengthSelectId;
			for (var i = 1; i <= numPages; i++) {
				var classStr = i === _this.config.pageNumber ? 'active' : '';
				html += '<li ns-data-value="' + i + '" class="' + classStr + '">' + i + '</li>';
			}
			var $pageLengthSelect = $('#' + pageLengthSelectId);
			$pageLengthSelect.html('<ul ns-pdfid="' + _this.config.id + '">' + html + '</ul>');
			$pageLengthSelect.children('ul').children('li').on('click', function (ev) {
				var $this = $(this);
				var pageNumber = Number($this.attr('ns-data-value'));
				var pdfid = $this.closest('ul').attr('ns-pdfid');
				var pdf = NetstarUI.pdfViewer.pdfManager.pdfObj[pdfid].pdf;
				config = NetstarUI.pdfViewer.pdfManager.pdfObj[pdfid].config;
				config.pageNumber = pageNumber;
				//var pdf = pdfManager.pdf;
				//打开pdf指定页码
				pdfManager.getPage(pdf, pageNumber, function (page) {
					//
					var scale = config.zoom.current;
					pdfManager.show(page, scale, function () {
						//渲染完成后执行
						$('#' + config.pageLengthSelectId).removeClass('show');
						$('#' + config.pageLengthInputId).val(config.pageNumber);
					})
				});
			});
			$('#' + _this.config.pagerId + ' button[type="button"]').on('click', function (ev) {
				var $this = $(this);
				var operatorType = $this.attr('ns-operator');
				var pdfid = $this.closest('.pt-page-turn').attr('ns-pdfid');
				var pageNumber = -1;
				//var pdf = pdfManager.pdf;
				var pdf = NetstarUI.pdfViewer.pdfManager.pdfObj[pdfid].pdf;
				config = NetstarUI.pdfViewer.pdfManager.pdfObj[pdfid].config;
				var numPages = pdf.numPages;

				switch (operatorType) {
					case 'first':
						pageNumber = 1;
						break;
					case 'last':
						pageNumber = numPages;
						break;
					case 'prev':
						pageNumber = config.pageNumber - 1;
						break;
					case 'next':
						pageNumber = config.pageNumber + 1;
						break;
					case 'topageselect':
						$this.parent().next().toggleClass('show');
						break;
				}
				if (pageNumber > numPages) {
					console.error('已经到底尾页');
					return;
				}
				if (pageNumber == 0) {
					console.log('已经到达首页');
					return;
				}
				if (pageNumber > -1) {
					config.pageNumber = pageNumber;
					pdfManager.getPage(pdf, pageNumber, function (page) {
						//
						var scale = config.zoom.current;
						pdfManager.show(page, scale, function () {
							//渲染完成后执行
							$('#' + config.pageLengthInputId).val(config.pageNumber);
						})
					});
				}
			})
			$('#' + config.pageLengthInputId).on('keyup', function (ev) {
				if (ev.keyCode == '13') {
					//enter
					var $this = $(this);
					var pageNumber = Number($this.val());
					var pdfid = $this.closest('.btns-container-intitle').attr('ns-pdfid');
					var pdf = NetstarUI.pdfViewer.pdfManager.pdfObj[pdfid].pdf;
					config = NetstarUI.pdfViewer.pdfManager.pdfObj[pdfid].config;
					config.pageNumber = pageNumber;
					//var pdf = pdfManager.pdf;
					pdfManager.getPage(pdf, pageNumber, function (page) {
						//
						var scale = config.zoom.current;
						pdfManager.show(page, scale, function () {
							//渲染完成后执行
							//$('#'+config.pageLengthInputId).val(config.pageNumber);
						})
					});
				}
			})
		},

		//初始化画布拖动功能
		initCanvasEvent: function () {

		},

		//关闭整体的快捷键
		documentEventOff: function () {
			var browserSystem = config.browserSystem
			if (browserSystem == 'pc') {
				$(document).off('keyup', _this.shortKeyHandler);
				//鼠标滚轮
				$(document).off('mousewheel', _this.mouseWheelHandler);
				//屏蔽右键
				$(document).off('contextmenu', _this.contextMenuHandler);
			}
		},

		//弹框形式打开
		dialog: function (_config) {
			var _this = this;
			//config:object 打开pdf的配置参数
			setDefault(_config);
			config = _config;
			_this.fullScreenDialog();

			//取缩放级别最大的一级做为缩放参数

			//载入文件
			pdfManager.load(config.url, function (pdf) {
				//console.log(pdf);
				//打开pdf页面
				pdfManager.getPage(pdf, 1, function (page) {
					//
					var scale = config.zoom.zoomFitScale;
					pdfManager.show(page, scale, function () {
						//渲染完成后执行
						_this.initBtns();
						_this.initSelect();
					})
				});
			});
		},
		show: function (_config) {
			var _this = this;
			setDefault(_config);
			config = _config;
			_this.appendHtml();
			//载入文件
			pdfManager.load(config.url, function (pdf) {
				//console.log(pdf);
				//打开pdf页面
				pdfManager.getPage(pdf, 1, function (page) {
					//
					var scale = config.zoom.zoomFitScale;
					pdfManager.show(page, scale, function () {
						//渲染完成后执行
						_this.initBtns();
						_this.initCurrentSelect();
					})
				});
			});
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
		load: function (url, callbackFunc) {
			var _this = this;
			//url:string pdf的地址
			var loadingTask = pdfLib.getDocument({url:url,rangeChunkSize:1024*512});
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
			})
		},
		//获取pdf页面
		page: {},
		getPage: function (_pdf, _pageNumber, callbackFunc) {
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
				config.zoom = _this.getZoom(page);

				if (typeof (callbackFunc) == 'function') {
					callbackFunc(page);
				}
			})
		},
		//打开PDF页面
		show: function (page, scale, callbackFunc) {
			//console.log(page);
			config.zoom.current = scale;
			var viewport = page.getViewport(scale);
			//画板渲染
			var canvasId = config.canvasId;
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
				if (typeof (callbackFunc) == 'function') {
					callbackFunc(page);
				}
			});

		},
		//获取实际缩放比例等缩放信息
		getZoom: function (page) {
			//只生成一次，第二次调用则直接返回
			if (config.zoom) {
				return config.zoom;
			}

			var fitScale = 1; //缩放比例 根据pdf的宽度和页面宽度比例重新生成缩放比例数组
			var autoFitScale = {
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
			if (config.zoomFit == 'width') {
				fitScale = autoFitScale.width;
			} else if (config.zoomFit == 'height') {
				fitScale = autoFitScale.height;
			}

			return {
				zoomFit: config.zoomFit, //使用宽或者高  'width'或者'height'
				zoomFitScale: fitScale, //默认全屏显示下的缩放比例 适应宽度或者高度
				autoFitScale: autoFitScale, //自动缩放的比例  {width: ,height: ,}
			};
		}
	}
	return {
		version: '0.1.0',
		init: init,
		setLib: setLib, //pdf的JS库
		dialog: dialog,
		pdfManager: pdfManager
	}
})()
NetstarUI.contentDialog = (function ($) {
	//配置文件
	var config;
	var configs = {}; //根据id保存config
	function validate() {

	}
	//默认值 默认单独使用，只能打开一个
	function setDefault(_config) {
		var defaultConfig = {
			id: 'dialog-content',
			html: '',
			isClear: true,
		}
		nsVals.setDefaultValues(_config, defaultConfig);
	}
	//初始化
	function init(_config) {
		/**
		 *{
		 *	id string 				标识符，可用于关闭
		 * 	width:number/string 	数字则为px string则直接使用
		 * 	height:number/string 	数字则为px string则直接使用
		 *	html: string 			弹框内容
		 * 	isClear:boolean 		是否清楚之前的弹框
		 * 	title:string 			标题
		 * 	btns:array 				按钮数组
		 * 	shownHandler:function 	显示后回调
		 *  hiddenHandler:function 	隐藏后回调
		 *}
		 **/

		//默认isClear为true, 则清空其他
		if (_config.isClear) {
			clear();
		}
		//克隆使用以方便二次使用		
		config = $.extend(true, {}, _config);
		configs[config.id] = config;

	}

	//显示
	function show(_config) {
		setDefault(_config);
		init(_config);
		//输出代码到body 并fixed
		var html = getHtml();
		var $dialog = $(html);

		$('body').append($dialog);

		if (config.shownHandler) {
			config.shownHandler();
		}
		//如果没有配置高度，则需要计算
		if (typeof (config.height) == 'undefined') {
			$dialog.css('margin-top', -($dialog.outerHeight() / 2));
		}
		if (typeof (config.plusClass) == 'string') {
			$dialog.addClass(config.plusClass);
		}
		//关闭按钮
		$('#' + config.id + ' .close-btn').on('click', {
			id: config.id
		}, function (ev) {
			var id = ev.data.id;
			hide(id);
		})

	}
	//关闭
	function hide(id) {
		//不传id 则全部关掉
		if (typeof (id) == 'undefined') {
			clear();
		} else {
			hideById(id);
		}
	}
	//清理
	function clear() {
		//逐个关闭
		for (var idKey in configs) {
			hideById(idKey);
		}
	}
	//关闭执行代码
	function hideById(id) {
		$('#' + id).remove();
		var _config = configs[id];
		if (_config.hiddenHandler) {
			_config.hiddenHandler({
				id: id
			});
		}
		delete configs[id];
	}
	//获取html代码
	function getHtml() {
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
		//宽度和用于居中的marginleft
		var style = '';
		if (typeof (config.width) == 'number') {
			style += 'width:' + config.width + 'px; ';
			//需要同时处理margin-left
			style += 'margin-left:-' + config.width / 2 + 'px; ';
		} else if (typeof (config.width) == 'string') {
			style += 'width:' + config.width + '; '
			//输出margin-left 需要处理数字文本
			var marginLeftStr = nsVals.stringCalculate(config.width, '/2');
			if (marginLeftStr) {
				style += 'margin-left:-' + marginLeftStr + '; ';
			}
		}
		//高度和用于居中的margin-top
		if (typeof (config.height) == 'number') {
			style += 'height:' + config.height + 'px; ';
			//需要同时处理margin-top
			style += 'margin-top:-' + config.height / 2 + 'px; ';
		} else if (typeof (config.height) == 'string') {
			style += 'height:' + config.height + '; ';
			//输出margin-left 需要处理数字文本
			var marginTopStr = nsVals.stringCalculate(config.height, '/2')
			if (marginTopStr) {
				style += 'margin-top:-' + marginTopStr + '; ';
			}
		}
		//拼接style属性
		if (style != '') {
			style = 'style="' + style + '"';
		}
		//拼接代码
		var html =
			'<div id="' + config.id + '" class="dialog-content common-fixed-simple-panel" ' + style + '>' +
			'<a class="close-btn" href="javascript:void(0);"></a>' +
			titleHtml +
			'<div class="panel-body">' +
			config.html +
			'</div>' +
			footerHtml +
			'</div>'
		return html;
	}
	return {
		show: show,
		hide: hide,
		clear: clear
	}
})(jQuery);
NetstarUI.pdfDialog = (function ($) {
	var PDF_LIB_URL = '/static/libs/pdf/pdf.js';
	var PDF_WORKER_SRC = '/static/libs/pdf/pdf.worker.js';
	var _this = {};
	var config = {};
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
		NetstarUI.pdfDialog.pdfLib = _pdfLib;
	}

	function init(delayTime) {
		//delayTime 页面加载完成后延迟加载pdf.js
		$(function () {
			setTimeout(function () {
				var _lib = window['pdfjs-dist/build/pdf'];
				if (_lib) {
					//如果已经载入pdf则直接使用
					NetstarUI.pdfDialog.setLib(_lib);
				} else {
					var _lib = requirejs([PDF_LIB_URL]);
					NetstarUI.pdfDialog.setLib(_lib);
				}
			}, delayTime)
		})

	}
	init();

	function setDefault(_config) {
		var defaultConfig = {
			title: 'PDF',
			pageNumber: 1,
			isDownload: false,
			isPrint: true,
			isZoom: true,
			zoomFit: 'width',
			showFile: {},
			fileType: 'pdf',
			imgZoomNum: 1,
		}
		nsVals.setDefaultValues(_config, defaultConfig);
		//按钮中的任何一个有，则添加按钮容器
		if (_config.isDownload || _config.isPrint || _config.isZoom) {
			_config.isHaveBtnsContainer = true;
		} else {
			_config.isHaveBtnsContainer = false;
		}
		//手机端或者PC端模式
		_config.browserSystem = nsVals.browser.browserSystem;
		if (_config.id) {
			_config.dialogId = config.id + '-dialog-pdf';
			_config.btnsContainerId = config.id + '-pdf-btns-container';
			_config.formId = config.id + '-dialog-pdf-formpage';
		} else {
			_config.dialogId = 'dialog-pdf';
			_config.btnsContainerId = 'dialog-pdf-btns-container';
			_config.formId = 'dialog-pdf-formpage';
		}
		// _config.$selectPage = $('<select id="dialog-pdf-selectpage" class="select-changepage-intitle"   style="float: right; position:relative; "></select>');
		_config.$selectPage = $('<select id="dialog-pdf-selectpage" class="select-changepage-intitle"   style="float: left; "></select>');
		// _config.$btnsContainer = $('<div id="dialog-pdf-btns-container" class="btns-container-intitle"  style="float: right; position:relative; "></div>');
		_config.$btnsContainer = $('<div id="' + _config.btnsContainerId + '" class="btns-container-intitle"  style=""></div>');
		_config.$form = $('<div id="' + _config.formId + '" class="select-changepage-intitle"   style="float: right; "></select>');
		var previewUrlArr = _config.urlArr;
		if (previewUrlArr.length > 0) {
			_config.showFile = {
				url: previewUrlArr[0].id,
				type: previewUrlArr[0].suffix,
				name: previewUrlArr[0].originalName,
			};
		}
	}

	var viewerManager = {
		showImgConfig:{},
		init: function (_config) {
			setDefault(_config);
			config = _config;
			this.config = config;
		},
		//全屏弹框
		fullScreenDialog: function () {
			var _this = this;
			//容器
			var html =
				'<div id="dialog-pdf-scaleinfo" class="info-center">' //缩放信息
				+
				'</div>' +
				'<div id="dialog-pdf-container" class="container-center">' //容器 包含btn和canvas
				+
				'<div id="dialog-pdf-container-canvas-all" class="container-canvas-all">' +
				'<canvas id="dialog-pdf-container-canvas" ></canvas>' +
				'</div>' +
				'</div>';
			var $container = $(html);
			config.$pdfContainer = $container;

			var widthHeight = $(window).height();
			var dialogId = config.dialogId;

			var dialogConfig = {
				id: dialogId,
				width: '100%',
				height: "100%",
				title: '',
				templateName: 'PC',
				defaultFooterHeight : 20,
				shownHandler: function (data) {
					var bodyId = data.config.bodyId;
					var footerIdGroup = data.config.footerIdGroup;
					var headId = data.config.headId;
					//添加相关组件的容器
					var $panelTitle = $("#" + headId);
					// $panelTitle.css({
					// 	'padding-right':'40px',
					// })

					var $panelBody = $("#" + bodyId);
					// $panelBody.append($container);
					config.$panelBody = $panelBody;
					// viewerManager.showFile(config);
					// $panelBody.css({
					// 	'position':'absolute',
					// 	'top':$panelTitle.outerHeight(),
					// 	'left':0,
					// 	'right':0,
					// 	'bottom':0
					// })
					//pdf容器
					// var $pdfContainer = $('#dialog-pdf-container');
					// $pdfContainer.css({
					// 	'position':'absolute',
					// 	'top':0,
					// 	'left':0,
					// 	'right':0,
					// 	'bottom':0,
					// 	'overflow':'auto',
					// })
					//插入下拉框
					// $panelTitle.append(config.$selectPage);
					$panelTitle.append(config.$form);
					//插入按钮
					if (config.isHaveBtnsContainer) {
						$panelTitle.append(config.$btnsContainer);
						// _this.initBtns();
					}

				},
				hideHandler: function (resObj) {
					if(typeof(config.hideHandler) == "function"){
						config.hideHandler(config);
					}
				},
				hiddenHandler: function (resObj) {
					//关闭后清除pdf
					_this.documentEventOff();
					//如果有则关闭打印iframe
					if ($('#iframe-print').length > 0) {
						$('#iframe-print').remove();
					}
					if(typeof(config.hiddenHandler) == "function"){
						config.hiddenHandler(config);
					}
				}
			}
			NetstarComponent.dialogComponent.init(dialogConfig);
		},

		//初始化按钮
		initBtns2: function () {

			var btnsArray = [];
			var url = config.url;
			var fileName = url.substr(url.lastIndexOf('/') + 1);
			//下载按钮
			if (config.isDownload) {
				btnsArray.push({
					text: '下载PDF',
					handler: function () {
						nsVals.downloadFile(fileName, url);
					}
				})
			}
			//打印按钮
			if (config.isPrint) {
				btnsArray.push({
					text: '打印PDF',
					handler: function () {
						if ($('#iframe-print').length > 0) {
							$('#iframe-print').remove();
						}
						$('body').append('<iframe id="iframe-print" style="display:none; visibility:hidden;" src="' + url + '"></iframe>')
						$("#iframe-print")[0].contentWindow.print();
					}
				})
			}
			//放大缩小
			if (config.isZoom) {
				btnsArray.push({
					text: '放大PDF',
					handler: function () {
						var page = NetstarUI.pdfDialog.pdfManager.page;
						var scale = config.zoom.current * 1.5;
						NetstarUI.pdfDialog.pdfManager.show(page, scale);
					}
				});
				btnsArray.push({
					text: '缩小PDF',
					handler: function () {
						var page = NetstarUI.pdfDialog.pdfManager.page;
						var scale = config.zoom.current * (1 / 1.5);
						NetstarUI.pdfDialog.pdfManager.show(page, scale);
					}
				})
				btnsArray.push({
					text: '适应宽度',
					handler: function () {
						var page = NetstarUI.pdfDialog.pdfManager.page;
						var scale = config.zoom.autoFitScale.width;
						NetstarUI.pdfDialog.pdfManager.show(page, scale);
					}
				})
				btnsArray.push({
					text: '适应高度',
					handler: function () {
						var page = NetstarUI.pdfDialog.pdfManager.page;
						var scale = config.zoom.autoFitScale.height;
						NetstarUI.pdfDialog.pdfManager.show(page, scale);
					}
				})

			}
			var btnsId = 'dialog-pdf-btns-container';
			nsButton.initBtnsByContainerID(btnsId, btnsArray, true);

		},
		//初始化按钮
		initBtns: function () {
			var btnsArray = [];
			//下载按钮
			if (config.isDownload) {
				btnsArray.push({
					text: '下载',
					isShowIcon: true,
					iconCls: 'icon-download-o',
					isShowText: false,
					state: 'pt-btn-icon',
					handler: function () {
						var showFileUrl = viewerManager.getFileUrl(config);
						var showFileName = viewerManager.getFileName(config);
						if(config.downUrlPrefix){
							//20191218 sjj 修改 修改原因：吴燕蓉说应该是download不应该是pdf
							showFileUrl = config.downUrlPrefix+config.showFile.url+':pdf';
							var authorization = NetStarUtils.OAuthCode.get();
							if(typeof(config.urlData) == "object" && !$.isEmptyObject(config.urlData)){
								var urlData = config.urlData;
								showFileUrl += ';'
								for(var key in urlData){
									showFileUrl += key + '=' + urlData[key] + ';'
								}
								showFileUrl = showFileUrl.substring(0, showFileUrl.length - 1);
							}
							if(authorization){
								showFileUrl += '?Authorization=' + authorization;
							}
							var DownloadEvt = null
							var DownloadLink = document.createElement('a');
							if (DownloadLink) {
								document.body.appendChild(DownloadLink);
								DownloadLink.style = 'display: none';
								//DownloadLink.download = filename;
								DownloadLink.href = showFileUrl;
								if (document.createEvent) {
									if (DownloadEvt == null)
										DownloadEvt = document.createEvent('MouseEvents');
									DownloadEvt.initEvent('click', true, false);
									DownloadLink.dispatchEvent(DownloadEvt);
								}
								else if (document.createEventObject)
									DownloadLink.fireEvent('onclick');
								else if (typeof DownloadLink.onclick == 'function')
									DownloadLink.onclick();
								document.body.removeChild(DownloadLink);
							}
						}else{
							NetStarUtils.download({
								url: showFileUrl,
								fileName: showFileName,
							})
						}
						
					}
				})
			}
			//打印按钮
			if (config.isPrint) {
				btnsArray.push({
					text: '打印',
					isShowIcon: true,
					iconCls: 'icon-print-o',
					isShowText: false,
					state: 'pt-btn-icon',
					handler: function () {
						if ($('#iframe-print').length > 0) {
							$('#iframe-print').remove();
						}
						var showFileUrl = viewerManager.getFileUrl(config);
						var showFileName = viewerManager.getFileName(config);
						// $('body').append('<iframe id="iframe-print" style="display:none; visibility:hidden;" src="' + showFileUrl + '"></iframe>')
						// $("#iframe-print")[0].contentWindow.print();
						// 跨域iframe调用问题暂时无法解决 改用新开窗口打印 cy 20191204
						window.open(showFileUrl,'_blank'); 
					}
				})
			}
			//放大缩小
			if (config.isZoom) {
				btnsArray.push({
					text: '放大',
					isShowIcon: true,
					iconCls: 'icon-zoom-in',
					isShowText: false,
					state: 'pt-btn-icon',
					handler: function (data) {
						viewerManager.zoomIn(data);
					}
				});
				btnsArray.push({
					text: '缩小',
					isShowIcon: true,
					iconCls: 'icon-zoom-out',
					isShowText: false,
					state: 'pt-btn-icon',
					handler: function (data) {
						viewerManager.zoomOut(data);
					}
				})
				btnsArray.push({
					text: '适应宽度',
					isShowIcon: true,
					iconCls: 'icon-arrow-v',
					isShowText: false,
					state: 'pt-btn-icon',
					handler: function (data) {
						viewerManager.adaptWidth(data)
					}
				})
				btnsArray.push({
					text: '适应高度',
					isShowIcon: true,
					iconCls: 'icon-arrow-h',
					state: 'pt-btn-icon',
					isShowText: false,
					handler: function (data) {
						viewerManager.adaptHeight(data);
					}
				})

			}
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
		// 放大
		zoomIn: function (data) {
			var showFileType = this.getFileType(config);
			switch (showFileType) {
				case 'PDF':
				case 'DOCX':
				case 'XLSX':
				case 'PPTX':
					this.zoomInByPdf(data);
					break;
				case 'JPEG':
				case 'GIF':
				case 'PNG':
				case 'JPG':
				case 'BMP':
					this.zoomInByImage(data);
					break;
			}
		},
		zoomInByPdf: function (data) {
			var id = $(data.event.currentTarget).closest('.btns-container-intitle').attr('ns-pdfid');
			var page = NetstarUI.pdfDialog.pdfManager.page;
			if (id) {
				page = NetstarUI.pdfDialog.pdfManager.pdfObj[id].page;
				config = NetstarUI.pdfDialog.pdfManager.pdfObj[id].config;
			}
			var scale = config.zoom.current * 1.5;
			NetstarUI.pdfDialog.pdfManager.show(page, scale);
		},
		zoomInByImage: function () {
			var $panelBody = config.$panelBody;
			var $img = $panelBody.children('img');
			var imgZoomNum = config.imgZoomNum;
			imgZoomNum = imgZoomNum * 1.5;
			config.imgZoomNum = imgZoomNum;
			$img.removeAttr('style');
			$img.width(imgZoomNum * 100 + '%')
		},
		// 缩小
		zoomOut: function (data) {
			var showFileType = this.getFileType(config);
			switch (showFileType) {
				case 'PDF':
				case 'DOCX':
				case 'XLSX':
				case 'PPTX':
					this.zoomOutByPdf(data);
					break;
				case 'JPEG':
				case 'GIF':
				case 'PNG':
				case 'JPG':
				case 'BMP':
					this.zoomOutByImage(data);
					break;
			}
		},
		zoomOutByPdf: function (data) {
			var page = NetstarUI.pdfDialog.pdfManager.page;
			var id = $(data.event.currentTarget).closest('.btns-container-intitle').attr('ns-pdfid');
			var page = NetstarUI.pdfDialog.pdfManager.page;
			if (id) {
				page = NetstarUI.pdfDialog.pdfManager.pdfObj[id].page;
				config = NetstarUI.pdfDialog.pdfManager.pdfObj[id].config;
			}
			var scale = config.zoom.current * (1 / 1.5);
			NetstarUI.pdfDialog.pdfManager.show(page, scale);
		},
		zoomOutByImage: function () {
			var $panelBody = config.$panelBody;
			var $img = $panelBody.children('img');
			var imgZoomNum = config.imgZoomNum;
			imgZoomNum = imgZoomNum / 1.5;
			config.imgZoomNum = imgZoomNum;
			$img.removeAttr('style');
			$img.width(imgZoomNum * 100 + '%');
		},
		// 适应宽
		adaptWidth: function (data) {
			var showFileType = this.getFileType(config);
			switch (showFileType) {
				case 'PDF':
				case 'DOCX':
				case 'XLSX':
				case 'PPTX':
					this.adaptWidthByPdf(data);
					break;
				case 'JPEG':
				case 'GIF':
				case 'PNG':
				case 'JPG':
				case 'BMP':
					this.adaptWidthByImage(data);
					break;
			}
		},
		adaptWidthByPdf: function (data) {
			var page = NetstarUI.pdfDialog.pdfManager.page;
			var id = $(data.event.currentTarget).closest('.btns-container-intitle').attr('ns-pdfid');
			var page = NetstarUI.pdfDialog.pdfManager.page;
			if (id) {
				page = NetstarUI.pdfDialog.pdfManager.pdfObj[id].page;
				config = NetstarUI.pdfDialog.pdfManager.pdfObj[id].config;
			}
			var scale = config.zoom.autoFitScale.width;
			NetstarUI.pdfDialog.pdfManager.show(page, scale);
		},
		adaptWidthByImage: function (data) {
			var $panelBody = config.$panelBody;
			var $img = $panelBody.children('img');
			var imgZoomNum = config.imgZoomNum;
			imgZoomNum = 1;
			config.imgZoomNum = imgZoomNum;
			$img.removeAttr('style');
			$img.height(imgZoomNum * 100 + '%');
		},
		// 适应高
		adaptHeight: function (data) {
			var showFileType = this.getFileType(config);
			switch (showFileType) {
				case 'PDF':
				case 'DOCX':
				case 'XLSX':
				case 'PPTX':
					this.adaptHeightByPdf(data);
					break;
				case 'JPEG':
				case 'GIF':
				case 'PNG':
				case 'JPG':
				case 'BMP':
					this.adaptHeightByImage(data);
					break;
			}
		},
		adaptHeightByPdf: function (data) {
			var page = NetstarUI.pdfDialog.pdfManager.page;
			var id = $(data.event.currentTarget).closest('.btns-container-intitle').attr('ns-pdfid');
			var page = NetstarUI.pdfDialog.pdfManager.page;
			if (id) {
				page = NetstarUI.pdfDialog.pdfManager.pdfObj[id].page;
				config = NetstarUI.pdfDialog.pdfManager.pdfObj[id].config;
			}
			var scale = config.zoom.autoFitScale.height;
			NetstarUI.pdfDialog.pdfManager.show(page, scale);
		},
		adaptHeightByImage: function (data) {
			var $panelBody = config.$panelBody;
			var $img = $panelBody.children('img');
			var imgZoomNum = config.imgZoomNum;
			imgZoomNum = 1;
			config.imgZoomNum = imgZoomNum;
			$img.removeAttr('style');
			$img.height(imgZoomNum * 100 + '%');

		},
		//初始化页码下拉框 
		initSelect: function () {
			var _this = this;
			var _pdf = pdfManager.pdf;
			var numPages = _pdf.numPages;
			var html = '';
			//依次输出页码供跳转
			for (var i = 1; i <= numPages; i++) {
				html += '<option value ="' + i + '">' + i + '</option>';
			}
			var $selectPage = _this.config.$selectPage;
			$selectPage.empty();
			$selectPage.append(html);
			$selectPage.on('change', function (ev) {

				var pdf = pdfManager.pdf;
				var pageNumber = parseInt($(this).val());
				//打开pdf指定页码
				pdfManager.getPage(pdf, pageNumber, function (page) {
					//
					var scale = config.zoom.current;
					pdfManager.show(page, scale, function () {
						//渲染完成后执行
					})
				});
			})
		},
		//初始化页码下拉框 
		initForm: function (_config) {
			var _this = this;
			var _pdf = pdfManager.pdf;
			var numPages = _pdf.numPages;
			var pageSubdata = [];
			//依次输出页码供跳转
			for (var i = 1; i <= numPages; i++) {
				pageSubdata.push({
					text: i,
					value: i.toString(),
				})
			}
			if (pageSubdata.length > 0) {
				pageSubdata[0].selected = true;
			}
			// 是否显示pdf选择
			var isShowSelectFile = false;
			var isHidePageNum = false;
			var selectFileArr = [];
			selectFileArr = _config.urlArr;
			if ($.isArray(_config.urlArr) && _config.urlArr.length > 1) {
				isShowSelectFile = true;
			}
			if ($.isArray(_config.urlArr) && _config.urlArr.length > 0) {
				if (_config.urlArr[0].suffix !== "pdf") {
					isHidePageNum = true;
				}
			}
			var formConfig = {
				id: _config.formId,
				isSetMore: false,
				formStyle: 'pt-form-normal pt-form-right',
				form: [{
						id: 'pageNum',
						label: '',
						type: 'select',
						inputWidth:60,
						subdata: pageSubdata,
						value: '1',
						isStartToChange: false,
						hidden: isHidePageNum,
						changeHandler: function (obj) {
							var pdf = pdfManager.pdf;
							var pageNumber = parseInt(obj.value);
							if (isNaN(pageNumber)) {
								return;
							}
							//打开pdf指定页码
							pdfManager.getPage(pdf, pageNumber, function (page) {
								//
								var scale = config.zoom.current;
								pdfManager.show(page, scale, function () {
									//渲染完成后执行
								})
							});
						}
					},
					{
						id: 'files',
						label: '文件',
						type: 'select',
						valueField: 'id',
						textField: 'originalName',
						subdata: selectFileArr,
						isStartToChange: false,
						hidden: !isShowSelectFile,
						value: selectFileArr[0].id,
						changeHandler: function (obj) {
							if (typeof (obj.value) == 'undefined') {
								return false;
							}
							if (obj.value === '') {
								return false;
							}
							//载入文件
							var jsonData = obj.jsonData;
							_config.showFile = {
								type: jsonData.suffix,
								url: jsonData.id,
								name: jsonData.originalName,
							}
							// var isHide = false;
							// if(jsonData.suffix != "pdf"){
							// 	isHide = true;
							// }
							// NetstarComponent.editComponents([
							// 	{
							// 		id : 'pageNum',
							// 		hidden : isHide
							// 	}
							// ], _config.formId)
							viewerManager.showFile(_config, function () {
								var isHide = false;
								var pageSubdata = [];
								if (jsonData.suffix != "pdf") {
									isHide = true;
									pageSubdata = [];
								} else {
									var _pdf = pdfManager.pdf;
									var numPages = _pdf.numPages;
									//依次输出页码供跳转
									for (var i = 1; i <= numPages; i++) {
										pageSubdata.push({
											text: i,
											value: i.toString(),
										})
									}
									if (pageSubdata.length > 0) {
										pageSubdata[0].selected = true;
									}
								}
								NetstarComponent.editComponents([{
									id: 'pageNum',
									hidden: isHide,
									subdata: pageSubdata,
								}], _config.formId)
							});
						}
					}
				]
			}
			NetstarComponent.formComponent.show(formConfig);
		},

		//初始化画布拖动功能
		initCanvasEvent: function () {

		},
		alertShowing: false,
		//关闭整体的快捷键
		documentEventOff: function () {
			var browserSystem = config.browserSystem
			if (browserSystem == 'pc') {
				// $(document).off('keyup', _this.shortKeyHandler);
				//鼠标滚轮
				$(document).off('mousewheel', _this.mouseWheelHandler);
				//屏蔽右键
				// $(document).off('contextmenu', _this.contextMenuHandler);
			}
		},
		//打开某页并定位
		isRending: false, //渲染中不能重复执行pageShow
		pageShow: function (_pageNumber, _scrollTop) {

			var _this = this;
			var pdf = pdfManager.pdf;

			//渲染pdf中则停止执行
			if (_this.isRending == true) {
				return false;
			}

			//开始渲染页面
			_this.isRending = true;
			pdfManager.getPage(pdf, _pageNumber, function (page) {
				var scale = config.zoom.current;
				pdfManager.show(page, scale, function () {
					//渲染完成后执行
					$('#dialog-pdf-container').scrollTop(_scrollTop);
					NetstarUI.pdfDialog.pdfManager.pageNumber = _pageNumber;
					_this.isRending = false;
				})
			});
			_this.config.$selectPage.val(_pageNumber);
		},
		//上下滚轮到头 翻页
		mouseWheelHandler: function (ev) {
			var _this = NetstarUI.pdfDialog;
			var _pdf = _this.pdfManager.pdf;

			var $canvasContainer = $('#dialog-pdf-container');
			var $canvas = $('#dialog-pdf-container-canvas');

			//判断当前是否滚动到底部
			var windowHeight = ev.data.windowHeight;
			var canvasContainerHeight = $canvasContainer.innerHeight();
			var canvasHeight = $canvas.height();
			var scrollHeight = canvasHeight - windowHeight; //可用的滚动举例（高度）；
			var scrollTop = $canvasContainer.scrollTop();

			var delta = ev.originalEvent.wheelDelta || ev.originalEvent.detail; //firefox使用detail:下3上-3,其他浏览器使用wheelDelta:下-120上120//下滚
			var wheelDirction = delta > 0 ? "up" : "down"; //滚动方式是向上或者向下滚动
			var isTop = false;
			if (scrollTop == 0) {
				isTop = true;
			}
			var isBottom = false;
			if (scrollTop >= scrollHeight || canvasHeight <= canvasContainerHeight) {
				isBottom = true;
			}

			if (isTop && wheelDirction == 'up') {
				//向上且到顶是向上翻页，并且定位到最下面
				var _pageNumber = _this.pdfManager.page.pageNumber - 1;
				if (_pageNumber < 1) {
					//没有上一页了
				} else {
					_this.viewerManager.pageShow(_pageNumber, scrollHeight);
				}
			} else if (isBottom && wheelDirction == 'down') {
				//如果是向下滚动，则判断是否滚动到底，到底后向下翻页
				var _pageNumber = _this.pdfManager.page.pageNumber + 1;
				var _numPages = _pdf.numPages;
				if (_pageNumber > _numPages) {
					//没有下一页了
				} else {
					_this.viewerManager.pageShow(_pageNumber, 0);
				}
			}

		},
		// 获取type
		getFileType: function (_config) {
			var fileType = _config.fileType;
			var showFile = _config.showFile;
			if ($.isEmptyObject(showFile)) {
				return fileType;
			}
			fileType = showFile.type;
			fileType = fileType.toUpperCase();
			return fileType;
		},
		// 获取url
		getFileUrl: function (_config) {
			var url = _config.url;
			var showFile = _config.showFile;
			if ($.isEmptyObject(showFile)) {
				return url;
			}
			var showType = showFile.type;
			showType = showType.toUpperCase();
			switch (showType) {
				case 'PDF':
				case 'DOCX':
				case 'XLSX':
				case 'PPTX':
					var fileUrlPrefix = _config.pdfUrlPrefix;
					break;
				default:
					var fileUrlPrefix = _config.imgUrlPrefix;
					break;
			}
			// var fileUrlPrefix = showType == 'pdf' ? _config.pdfUrlPrefix : _config.imgUrlPrefix;
			url = fileUrlPrefix + showFile.url;
			if(typeof(_config.urlData) != "object" || $.isEmptyObject(_config.urlData)){
				var authorization = NetStarUtils.OAuthCode.get();
				if (authorization) {
					url += '?Authorization=' + authorization;
				}
			}
			return url;
		},
		getFileName: function (_config) {
			var fileUrl = this.getFileUrl(_config);
			var fileName = fileUrl.substr(fileUrl.lastIndexOf('/') + 1);
			var showFile = _config.showFile;
			if ($.isEmptyObject(showFile)) {
				return fileName;
			}
			return showFile.name;
		},
		showImage: function (_config, callbackFunc) {
			var $panelBody = _config.$panelBody;
			var fileUrl = this.getFileUrl(_config);
			var imageHtml = '<img src="' + fileUrl + '"/>'
			$panelBody.html(imageHtml);
			if (typeof (callbackFunc) == "function") {
				callbackFunc();
			}
		},
		showPdf: function (_config, callbackFunc) {
			var _this = this;
			var fileUrl = this.getFileUrl(_config);
			var $panelBody = _config.$panelBody;
			$panelBody.html(_config.$pdfContainer);
			var windowHeight = $(window).height() - 44;
			var evData = {
				windowHeight: windowHeight,
			};
			$(document).on('mousewheel', evData, _this.mouseWheelHandler);
			pdfManager.load(fileUrl, function (pdf) {
				//打开pdf页面
				pdfManager.getPage(pdf, 1, function (page) {
					//
					var scale = _config.zoom.zoomFitScale;
					pdfManager.show(page, scale, function () {
						//渲染完成后执行
						if (typeof (callbackFunc) == "function") {
							callbackFunc();
						}
					})
				});
			});
		},
		showFile: function (_config, callbackFunc) {
			var fileType = this.getFileType(_config);
			this.documentEventOff();
			switch (fileType) {
				case 'PDF':
				case 'DOCX':
				case 'XLSX':
				case 'PPTX':
					this.showPdf(_config, callbackFunc);
					break;
				case 'JPEG':
				case 'GIF':
				case 'PNG':
				case 'JPG':
				case 'BMP':
					this.showImage(_config, callbackFunc);
					break;
				default:
					nsalert('文件格式: ' + fileType + ' 不能识别', 'error');
					console.error('文件格式不能识别');
					break;
			}
		},
		getPdfUrl: function (_config) {
			var url = _config.url;
			if (_config.currentUrl) {
				url = _config.currentUrl;
				if (_config.pdfUrlSuffix) {
					url = _config.pdfUrlSuffix + url;
				}
			}
			var authorization = NetStarUtils.OAuthCode.get();
			if (authorization) {
				url += '?Authorization=' + authorization;
			}
			return url;
		},
		//弹框形式打开
		dialog: function (_config) {
			var _this = this;
			//config:object 打开pdf的配置参数
			setDefault(_config);
			config = _config;
			_this.fullScreenDialog();
			//取缩放级别最大的一级做为缩放参数
			_this.showFile(config, function () {
				//渲染完成后执行
				_this.initBtns();
				_this.initForm(config);
				// 设置弹框高度 因为header过高问题导致计算错误
				var $dialogBody = $('#dialog-' + config.dialogId + '-body');
				var height = $dialogBody.height();
				$dialogBody.height(height - 20);
			});
		},
	}

	function dialog(_config) {
		viewerManager.init(_config);
		viewerManager.dialog(_config);
	}


	var pdfManager = {
		//loading 加载
		pdf: {},
		//先清除
		aloneAlert: function (text, state) {
			toastr.clear();
			nsalert(text, state);
		},
		load: function (url, callbackFunc) {
			var _this = this;
			_this.$selectPage = config.$selectPage;
			//url:string pdf的地址
			var documentObj = {
				url : url,
				rangeChunkSize : 1024*512,
			}
			if(typeof(config.urlData) == "object" && !$.isEmptyObject(config.urlData)){
				var urlData = config.urlData;
				url += ';'
				for(var key in urlData){
					url += key + '=' + urlData[key] + ';'
				}
				url = url.substring(0, url.length - 1)
				documentObj.url = url;
				var authorization = NetStarUtils.OAuthCode.get();
				documentObj.httpHeaders = {}
				if(authorization){
					documentObj.httpHeaders.authorization = authorization;
				}
			}
			var loadingTask = pdfLib.getDocument(documentObj);
			//挂载监听器，完成后执行
			loadingTask.promise.then(function (pdf) {
				_this.pdf = pdf;
				if (typeof (callbackFunc) == 'function') {
					callbackFunc(pdf);
				}
			}, function (reason) {
				// PDF加载出错
				nsalert('PDF加载出错', 'error');
				console.error(reason);
			})
		},
		//获取pdf页面
		page: {},
		getPage: function (_pdf, _pageNumber, callbackFunc) {
			var _this = this;
			_pdf.getPage(_pageNumber).then(function (page) {
				_this.page = page;
				//读取view信息
				config.zoom = _this.getZoom(page);

				if (typeof (callbackFunc) == 'function') {
					callbackFunc(page);
				}
			})
		},
		//打开PDF页面
		show: function (page, scale, callbackFunc) {
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
				if (typeof (callbackFunc) == 'function') {
					callbackFunc(page);
				}
			});

		},
		//获取实际缩放比例等缩放信息
		getZoom: function (page) {
			//只生成一次，第二次调用则直接返回
			if (config.zoom) {
				return config.zoom;
			}

			var fitScale = 1; //缩放比例 根据pdf的宽度和页面宽度比例重新生成缩放比例数组

			var autoFitScale = {
				width: (window.innerWidth - 10) / page.view[2],
				height: (window.innerHeight - 50) / page.view[3],
			}
			if (config.zoomFit == 'width') {
				fitScale = autoFitScale.width;
			} else if (config.zoomFit == 'height') {
				fitScale = autoFitScale.height;
			}

			return {
				zoomFit: config.zoomFit, //使用宽或者高  'width'或者'height'
				zoomFitScale: fitScale, //默认全屏显示下的缩放比例 适应宽度或者高度
				autoFitScale: autoFitScale, //自动缩放的比例  {width: ,height: ,}
			};
		}
	}

	return {
		VERSION: '1.0.1', //第二版 第一版停用
		init: init, //入口方法
		pdfManager: pdfManager, //pdf的方法管理器 主要是.show等方法
		viewerManager: viewerManager, //展示方法
		setLib: setLib, //pdf的JS库
		dialog: dialog, //弹框打开
	}
})(jQuery)
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