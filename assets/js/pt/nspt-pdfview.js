//需要引入的第三方插件 assets/js/pdf/pdf.js
if(typeof(NetstarUI)=='undefined'){
	NetstarUI = {};
}
NetstarUI.pdfViewer = (function(){
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
		NetstarUI.pdfViewer.pdfLib = _pdfLib;
	}
	function preInit(delayTime){
		//delayTime 页面加载完成后延迟加载pdf.js
		$(function(){
			setTimeout(function(){
				var _lib = window['pdfjs-dist/build/pdf'];
				if(_lib){
					//如果已经载入pdf则直接使用
					NetstarUI.pdfViewer.setLib(_lib);
				}else{
					var _lib = requirejs([PDF_LIB_URL]);
					NetstarUI.pdfViewer.setLib(_lib);
				}
			}, delayTime)
		})
	}
	preInit();
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
		var styleStr = '';
		if(_config.id){
			_config.selectPageId = config.id +'-pdf-selectpage';
			_config.btnsContainerId = config.id + '-pdf-btns-container';
		}else{
			_config.selectPageId = 'dialog-pdf-selectpage';
			_config.btnsContainerId = 'dialog-pdf-btns-container';
			styleStr = "float: right; position:relative;";
		}
		_config.$selectPage = $('<select id="'+_config.selectPageId+'" class="select-changepage-intitle"   style="'+styleStr+'"></select>');
		_config.$btnsContainer = $('<div id="'+_config.btnsContainerId+'" class="btns-container-intitle pt-btn-group"  style="'+styleStr+'"></div>');
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
			config.canvasId = 'dialog-pdf-container-canvas';
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
			NetstarUI.contentDialog.show(contentDialogConfig);
		},
		appendHtml:function(){
			var _this = this;
			
			config.canvasId = config.id + '-pdf-container-canvas';
			//容器
			var html = 
				'<div id="pdf-scaleinfo" class="info-center">' 		//缩放信息
				+'</div>'
				+'<div id="pdf-container" class="container-center">' //容器 包含btn和canvas
					+'<div id="pdf-container-canvas-all" class="container-canvas-all">' 
						+'<canvas id="'+config.canvasId+'" ></canvas>'
					+'</div>'
				+'</div>';
			var $container = $(html);
			config.$dialogContainer = $container;
			var widthHeight = $(window).height();
			//标题
			var titleHtml = '';
			if(typeof(config.title)=='string'){
				titleHtml = '<div class="panel-title">'+config.title+'</div>';
			}
			//底部
			var footerHtml = '';
			if(typeof(config.btns)=='object'){
				footerHtml = '<div class="panel-footer"></div>';
			}
			var resultHtml = '<a class="close-btn" href="javascript:void(0);"></a>'
								+ titleHtml
								+ '<div class="panel-body">'
									+html
								+ '</div>'
								+ footerHtml
							+'</div>';
			var $panelContainer = $('#'+config.id);
			$panelContainer.html(resultHtml);
			var classStr = 'show-content common-show-simple-panel pdfview pdfview-'+config.browserSystem;
			$panelContainer.addClass(classStr);
			//$('body').append($panelContainer);

			var $panelTitle = $panelContainer.children('.panel-title');
			//插入下拉框
			//$panelTitle.append(config.$selectPage);
			//插入按钮
			//var $footer = $panelContainer.closest('.pt-pdfview-item').children('.pt-pdfview-footer');
			var $footer = $panelContainer.parent().children('.pt-pdfview-footer');
			if($footer.length == 0){
				$panelContainer.parent().append('<div class="pt-pdfview-footer"></div>');
				$footer = $panelContainer.parent().children('.pt-pdfview-footer');
			}
			$footer.html('');
			if(config.isHaveBtnsContainer){
				$footer.append(config.$btnsContainer);
				_this.initBtns();
			}
			config.pageLengthInputId = config.id+'-topage-input';
			config.pageLengthSelectId = config.id+'-topage-select';
			config.pagerId = config.id+'-topage-container';
			var selectHtml = '<div class="pt-pager">'
								+'<div class="pt-form pt-form-inline pt-form-normal">'
									+'<div class="pt-form-body">'
										+'<div class="pt-page-turn" id="'+config.pagerId+'">'
											+'<div class="pt-btn-group">'
												+'<button class="pt-btn pt-btn-default pt-btn-icon" type="button" ns-operator="first">'
													+'<i class="icon-step-backward-o"></i>'
												+'</button>'
												+'<button class="pt-btn pt-btn-default pt-btn-icon" type="button" ns-operator="prev">'
													+'<i class="icon-arrow-left"></i>'
												+'</button>'
											+'</div>'
											+'<div class="pt-form-group">'
												+'<label for="name" class="pt-control-label">第</label>'
												+'<div class="pt-input-group">'
													+'<input type="text" placeholder="1" value="1" id="'+config.pageLengthInputId+'" class="pt-form-control">'
													+'<div class="pt-input-group-btn">'
														+'<button class="pt-btn pt-btn-default pt-btn-icon" type="button" ns-operator="topageselect">'
															+'<i class="icon-arrow-down-o"></i>'
														+'</button>'	
													+'</div>'
													+'<div id="'+config.pageLengthSelectId+'" class="pt-input-group-select">'
														//+'<ul>'
															//+'<li ns-data-value="1" class="active">1</li>'
														//+'</ul>'
													+'</div>'
												+'</div>'
												+'<label for="name" class="pt-control-label">页</label>'
											+'</div>'
											+'<div class="pt-btn-group">'
												+'<button class="pt-btn pt-btn-default pt-btn-icon" type="button" ns-operator="next"><i class="icon-arrow-right"></i></button>'
												+'<button class="pt-btn pt-btn-default pt-btn-icon" type="button" ns-operator="last"><i class="icon-step-forward-o"></i></button>'
											+'</div>'
										+'</div>'
									+'</div>'
								+'</div>'
							+'</div>';
			$footer.append(selectHtml);				
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
					isShowIcon:true,
					iconCls:'icon-download-o',
					isShowText:false,
					state:'pt-btn-icon',
					handler: 	function(){
						nsVals.downloadFile(fileName,url);
					}
				})
			}
			//打印按钮
			if(config.isPrint){
				btnsArray.push({
					text: 		'打印PDF',
					isShowIcon:true,	
					iconCls:'icon-print-o',
					isShowText:false,
					state:'pt-btn-icon',
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
					isShowIcon:true,	
					iconCls:'icon-zoom-in',
					isShowText:false,
					state:'pt-btn-icon',
					handler: 	function(){
						var page = NetstarUI.pdfViewer.pdfManager.page;
						var scale = config.zoom.current * 1.5;
						NetstarUI.pdfViewer.pdfManager.show(page, scale);
					}
				});
				btnsArray.push({
					text: 		'缩小PDF',
					isShowIcon:true,
					iconCls:'icon-zoom-out',
					isShowText:false,
					state:'pt-btn-icon',
					handler: 	function(){
						var page = NetstarUI.pdfViewer.pdfManager.page;
						var scale = config.zoom.current * (1/1.5);
						NetstarUI.pdfViewer.pdfManager.show(page, scale);
					}
				})
				btnsArray.push({
					text: 		'适应宽度',
					isShowIcon:true,
					iconCls:'icon-arrow-v',
					isShowText:false,
					state:'pt-btn-icon',
					handler: 	function(){
						var page = NetstarUI.pdfViewer.pdfManager.page;
						var scale = config.zoom.autoFitScale.width;
						NetstarUI.pdfViewer.pdfManager.show(page, scale);
					}
				})
				btnsArray.push({
					text: 		'适应高度',
					isShowIcon:true,
					iconCls:'icon-arrow-h',
					state:'pt-btn-icon',
					isShowText:false,
					handler: 	function(){
						var page = NetstarUI.pdfViewer.pdfManager.page;
						var scale = config.zoom.autoFitScale.height;
						NetstarUI.pdfViewer.pdfManager.show(page, scale);
					}
				})
				
			}
			var btnsId = config.btnsContainerId;
			vueButtonComponent.init({
				id:btnsId,
				isShowTitle:false,
				pageId:'lims-reports-package',
				package:'lims.reports.package',
				btns:btnsArray,
			});
			//nsButton.initBtnsByContainerID(btnsId, btnsArray, true);

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

		//初始化页码下拉框 当前界面
		initCurrentSelect:function(){
			var _this = this;
			var _pdf = pdfManager.pdf;
			var numPages = _pdf.numPages;
			var html = '';
			var pageLengthInputId = _this.config.pageLengthInputId;
			var pageLengthSelectId = _this.config.pageLengthSelectId;
			for(var i=1; i<=numPages; i++){
				var classStr = i=== _this.config.pageNumber ? 'active' : '';
				html += '<li ns-data-value="'+i+'" class="'+classStr+'">'+i+'</li>';
			}
			var $pageLengthSelect = $('#'+pageLengthSelectId);
			$pageLengthSelect.html('<ul>'+html+'</ul>');
			$pageLengthSelect.children('ul').children('li').on('click',function(ev){
				var $this = $(this);
				var pageNumber = Number($this.attr('ns-data-value'));
				config.pageNumber = pageNumber;
				var pdf = pdfManager.pdf;
				//打开pdf指定页码
				pdfManager.getPage(pdf, pageNumber, function(page){
					//
					var scale = config.zoom.current;
					pdfManager.show(page, scale, function(){
						//渲染完成后执行
						$('#'+config.pageLengthSelectId).removeClass('show');
						$('#'+config.pageLengthInputId).val(config.pageNumber);
					})
				});
			});
			$('#'+_this.config.pagerId+' button[type="button"]').on('click',function(ev){
				var $this = $(this);
				var operatorType = $this.attr('ns-operator');
				var pageNumber = -1;
				var pdf = pdfManager.pdf;
				var numPages = pdf.numPages;
				switch(operatorType){
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
				if(pageNumber > numPages){
					console.error('已经到底尾页');
					return;
				}
				if(pageNumber == 0){
					console.log('已经到达首页');
					return;
				}
				if(pageNumber > -1){
					config.pageNumber = pageNumber;
					pdfManager.getPage(pdf, pageNumber, function(page){
						//
						var scale = config.zoom.current;
						pdfManager.show(page, scale, function(){
							//渲染完成后执行
							$('#'+config.pageLengthInputId).val(config.pageNumber);
						})
					});
				}
			})
			$('#'+config.pageLengthInputId).on('keyup',function(ev){
				if(ev.keyCode == '13'){
					//enter
					var $this = $(this);
					var pageNumber = Number($this.val());
					config.pageNumber = pageNumber;
					var pdf = pdfManager.pdf;
					pdfManager.getPage(pdf, pageNumber, function(page){
						//
						var scale = config.zoom.current;
						pdfManager.show(page, scale, function(){
							//渲染完成后执行
							//$('#'+config.pageLengthInputId).val(config.pageNumber);
						})
					});
				}
			})
		},

		//初始化画布拖动功能
		initCanvasEvent:function(){
				
		},

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

		//弹框形式打开
		dialog:function(_config){
			var _this = this;
			//config:object 打开pdf的配置参数
			setDefault(_config);
			config = _config;
			_this.fullScreenDialog();

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
		show:function(_config){
			var _this = this;
			setDefault(_config);
			config = _config;
			_this.appendHtml();
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
						_this.initCurrentSelect();
					})
				});
			});
		}
		
	}
	function init(_config){
		viewerManager.init(_config);
		viewerManager.show(_config);
	}
	function dialog(_config){
		viewerManager.init(_config);
		viewerManager.dialog(_config);
	}

	var pdfManager = {
		//loading 加载
		pdf:{},
		load:function(url, callbackFunc){
			var _this = this;
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
			};
			if(config.id){
				var $container = $('#'+config.id).parent();
				var containerHeight = $(window).outerHeight() - 200;
				autoFitScale = {
					width:($container.outerWidth())/page.view[2],
					height:(window.innerHeight - 50) / page.view[3],
				};
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
		version:'0.1.0',
		init: preInit,
		init:init,
		setLib:setLib, 		//pdf的JS库
		dialog:dialog,
		pdfManager:pdfManager
	}
})()
NetstarUI.contentDialog = (function($) {
	//配置文件
	var config;
	var configs = {}; //根据id保存config
	function validate(){

	}
	//默认值 默认单独使用，只能打开一个
	function setDefault(_config){
		var defaultConfig = {
			id:'dialog-content',
			html:'',
			isClear:true,
		}
		nsVals.setDefaultValues(_config, defaultConfig);
	}
	//初始化
	function init(_config){
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
		if(_config.isClear){
			clear();
		}
		//克隆使用以方便二次使用		
		config = $.extend(true, {}, _config);
		configs[config.id] = config;

	}
	
	//显示
	function show(_config){
		setDefault(_config);
		init(_config);
		//输出代码到body 并fixed
		var html = getHtml();
		var $dialog = $(html);

		$('body').append($dialog);

		if(config.shownHandler){
			config.shownHandler();
		}
		//如果没有配置高度，则需要计算
		if(typeof(config.height)=='undefined'){
			$dialog.css('margin-top', -($dialog.outerHeight()/2));
		}
		if(typeof(config.plusClass)=='string'){
			$dialog.addClass(config.plusClass);
		}
		//关闭按钮
		$('#'+config.id+' .close-btn').on('click', {id:config.id}, function(ev){
			var id = ev.data.id;
			hide(id);
		})

	}
	//关闭
	function hide(id){
		//不传id 则全部关掉
		if(typeof(id)=='undefined'){
			clear();
		}else{
			hideById(id);
		}
	}
	//清理
	function clear(){
		//逐个关闭
		for(var idKey in configs){
			hideById(idKey);
		}
	}
	//关闭执行代码
	function hideById(id){
		$('#'+id).remove();
		var _config = configs[id];
		if(_config.hiddenHandler){
			_config.hiddenHandler({id:id});
		}
		delete configs[id];
	}
	//获取html代码
	function getHtml(){
		//标题
		var titleHtml = '';
		if(typeof(config.title)=='string'){
			titleHtml = '<div class="panel-title">'+config.title+'</div>';
		}
		//底部
		var footerHtml = '';
		if(typeof(config.btns)=='object'){
			footerHtml = '<div class="panel-footer"></div>';
		}
		//宽度和用于居中的marginleft
		var style = '';
		if(typeof(config.width)=='number'){
			style += 'width:'+config.width+'px; ';
			//需要同时处理margin-left
			style += 'margin-left:-'+config.width/2+'px; ';
		}else if(typeof(config.width)=='string'){
			style += 'width:'+config.width+'; '
			//输出margin-left 需要处理数字文本
			var marginLeftStr = nsVals.stringCalculate(config.width,'/2');
			if(marginLeftStr){
				style += 'margin-left:-'+marginLeftStr+'; ';
			}
		}
		//高度和用于居中的margin-top
		if(typeof(config.height)=='number'){
			style += 'height:'+config.height+'px; ';
			//需要同时处理margin-top
			style += 'margin-top:-'+config.height/2+'px; ';
		}else if(typeof(config.height)=='string'){
			style += 'height:'+config.height+'; ';
			//输出margin-left 需要处理数字文本
			var marginTopStr = nsVals.stringCalculate(config.height,'/2')
			if(marginTopStr){
				style += 'margin-top:-'+marginTopStr+'; ';
			}
		}
		//拼接style属性
		if(style!=''){
			style = 'style="'+style+'"';
		}
		//拼接代码
		var html = 
			'<div id="'+config.id+'" class="dialog-content common-fixed-simple-panel" '+style+'>'
				+ '<a class="close-btn" href="javascript:void(0);"></a>'
				+ titleHtml
				+ '<div class="panel-body">'
					+config.html
				+ '</div>'
				+ footerHtml
			+'</div>'
		return html;
	}
	return {
		show:show,
		hide:hide,
		clear:clear
	}
})(jQuery);