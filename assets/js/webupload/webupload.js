var nsWebuploader = (function ($) {
	// 点击按钮上传，带样式，带遮罩层
	function clickUpload() {
		$upload.text("开始上传");
		$upload.addClass('disabled');
		$upload.on("click", function () {
			submitUploadFile();
			setState("uploading");
		});
	}
	// 点击按钮暂停，带样式，遮罩层
	function clickPause() {
		$upload.off();
		$upload.text("暂停上传");
		$upload.on("click", function () {
			stopFile();
			setState("paused");
		});
	}
	// 暂停后点击按钮继续上传
	function clickContinue() {
		$upload.text("继续上传");
		$upload.off();
		$upload.on("click", function () {
			submitUploadFile();
			setState("uploading");
		});
	}
	// 要用到的常量
	var uploadFileNum = 0;
	var uploadFileQueue = 0;
	var uploader;
	var $button;

	function perpareUpload() {
		$wrap = $("#" + upload.wrap);
		// 图片容器
		$queue = $('<ul class="filelist" style="display:none;"></ul>').appendTo(
			$wrap.find("." + upload.queueList)
		);

		// 外层
		$webupload = $(".webupload");
		$progresBox = $(".progres-box");

		// 状态栏，包括进度和控制按钮
		$statusBar = $wrap.find(".statusBar");

		// 文件总体选择信息〿
		$info = $statusBar.find(".info");

		// 上传按钮
		$upload = $wrap.find("." + upload.uploadKey);

		// 获取查看、下载、删除按钮
		$button = $("#webuploadBtn").children().children();

		// 没选择文件之前的内容〿
		$placeHolder = $wrap.find(".placeholder");

		// 总体进度板
		$progress = $statusBar.find(".progress").show();

		fileCount = 0;

		fileSize = 0;
		// 优化retina, 在retina下这个值是2
		ratio = window.devicePixelRatio || 1;
		// 缩略图大尿
		/*thumbnailWidth = 110 * ratio;
							thumbnailHeight = 110 * ratio;*/

		// 可能有pedding, ready, uploading, confirm, done.
		state = "pedding";

		// 所有文件的进度信息，key为file id
		percentages = {};
		/** 实现webupload hook，触发上传前，中，后的调用关键 **/
		WebUploader.Uploader.register({
			"before-send-file": "beforeSendFile", // 整个文件上传前
			"before-send": "beforeSend", // 每个分片上传前
			"after-send-file": "afterSendFile" // 分片上传完毕
		}, {
			beforeSendFile: function (file) {
				var task = new $.Deferred();
				//拿到上传文件的唯一名称，用于断点续传
				uploader
					.md5File(file, 0, 10 * 1024 * 1024)
					.progress(function (percentage) {})
					.then(function (val) {
						file.md5 = val + file.size;
						/*beforeSendFileOrMd5(file.md5,task);*/
						uploader.options.formData = {
							md5: file.md5,
							path: upload.path
						};
						task.resolve();
					});
				return $.when(task);
			},
			beforeSend: function (block) {
				//分片验证是否已传过，用于断点续传
				var task = new $.Deferred();
				$.ajax({
					type: "post",
					url: upload.checkExistsUrl,
					data: {
						fileName: block.file.name,
						md5: block.file.md5,
						chunk: block.chunk,
						chunks: block.chunks
					},
					cache: false,
					async: false, // 同步
					timeout: 30 * 60 * 1000, //todo 超时的话，只能认为该文件不曾上传过
					dataType: "json"
				}).then(
					function (data, textStatus, jqXHR) {
						if (data.exists) {
							task.reject();
						} else {
							task.resolve();
						}
					},
					function (jqXHR, textStatus, errorThrown) {
						//任何形式的验证失败，都触发重新上传
						task.resolve();
					}
				);
				return $.when(task);
			},
			afterSendFile: function (file) {
				var task = new $.Deferred();
				task.resolve();
				return $.when(task);
				/*var chunksTotal = file.blocks.length;
				if (chunksTotal > 1) {
				//合并请求
				var task = new $.Deferred();
				$.ajax({
				type: "post",
				url: getRootPath()+'/File/validateTempComplete',
				data: {
				fileName: file.name,
				chunks: chunksTotal,
				md5: file.md5
				},
				cache: false,
				async: false,  // 同步
				dataType: "json"
				}).then(function (data, textStatus, jqXHR) {
				if (data.Merge) {
				task.resolve();
				} else {
				task.reject();
				}
				}, function (jqXHR, textStatus, errorThrown) {
				//current_uploader.uploader.trigger('uploadError');
				task.reject();
				});
				return $.when(task);
				}*/
			}
		});
		uploader = WebUploader.create({
			// swf文件路径
			swf: upload.swfUrl,
			// 文件接收服务端。
			server: upload.uploadUrl,
			multiple: true, //是否开起同时选择多个文件能力。
			/* accept: {
				title: "${fileTypeDesc}", //文字描述
				extensions: "${fileTypeExts}", //允许的文件后缀，不带点，多个用逗号分割。
				mimeTypes: "${mimeTypes}" //多个用逗号分割。
			}, */
			auto: false, // 设置为 true 后，不需要手动调用上传，有文件选择即开始上传。
			prepareNextFile: false, //是否允许在文件传输时提前把下一个文件准备好。 某些文件的准备工作比较耗时（比如图片压缩，md5序列化）， 如果能提前在当前文件传输期处理，可以节省总体耗时。
			threads: 1,
			duplicate: true, // 去重
			chunked: true, // 是否要分片处理大文件上传。
			chunkSize: 50 * 1024 * 1024, //如果要分片，分多大一片？ 默认大小为5M
			//threads:3, //[可选] [默认值：3] 上传并发数。允许同时最大上传进程数。
			method: "POST", //[默认值：'POST'] 文件上传方式，POST或者GET。
			formData: {
				path: upload.path
			}, //文件上传请求的参数表，每次发送都会发送此对象中的参数。
			// 选择文件的按钮。可选。
			// 内部根据当前运行是创建，可能是input元素，也可能是flash.
			pick: "#" + upload.picker,
			// 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
			resize: false,
			timeout: 30 * 60 * 1000,
			fileNumLimit: 6 // 验证文件总数量, 超出则不允许加入队列。
			//fileSizeLimit:// [默认值：undefined] 验证文件总大小是否超出限制, 超出则不允许加入队列。
			// fileSingleSizeLimit: [默认值：undefined] 验证单个文件大小是否超出限制, 超出则不允许加入队列。
		});

		// 当文件上传成功后调用
		uploader.on("uploadSuccess", function (file, data) {
			setState("confirm");
			if (data === undefined) {
				//window.parent.closeFileDialog()
				nsAlert("上传失败，请重新上传");
			} else {
				if (data != null && data._raw.toString().indexOf("errorInfo") != -1) {
					//removeFile(file);
					//清空队列
					//uploader.removeFile(file, true);
					//window.parent.closeFileDialog()
					nsAlert("上传失败，" + data._raw.substring(data._raw.indexOf(":") + 1));
				} else {
					updateTotalProgress();
					if (typeof (data) != "object") {
						data = JSON.parse(data._raw);
					}
					var _data = {
						size: file.size,
						realpath: data[0].realpath,
						realName: file.name,
						suffix: file.ext,
						storeName: data[0].storeName
					};
					onUploadSuccess(_data, file);
				}
			}
		});
		uploader.on("uploadFinished", function () {
			//window.parent.closeFileDialog()
		});
		// 当文件上传失败后调用
		uploader.on("uploadError", function (file, reason) {
			//清空上传失败的文件
			removeFile(file);
			//清空队列
			uploader.removeFile(file, true);
			nsAlert(file.name + "上传失败");
			updateTotalProgress("type");
			// 添加展示效果
			/**
			 * $webupload->webupload-start 的意思是有一个遮罩层
			 * $upload -> disabled 的意思是不能点击按钮
			 */
			if (uploadFileQueue == 0) {
				clickUpload();
			} else {
				clickPause();
			}
		});
		//当文件无论成功还是失败都调用 关闭进度条
		uploader.on("uploadComplete", function (file, reason) {
			$("#" + file.id)
				.find(".progress")
				.fadeOut();
		});
		// 当添加文件时触发
		uploader.on("fileQueued", function (file) {
			fileCount++;
			fileSize += file.size;

			if (fileCount === 1) {
				$placeHolder.addClass("element-invisible");
				$statusBar.show();
			}

			addFile(file);
			setState("ready");
			updateTotalProgress("type");
		});
		// 监听进度条
		uploader.on("uploadProgress", function (file, percentage) {
			var $li = $("#" + file.id),
				$percent = $li.find(".progress span");
			$percent.css("width", percentage * 100 + "%");
			percentages[file.id][1] = percentage;
			updateTotalProgress("type");
		});
		// 当文件从队列中移除时触发
		uploader.on("fileDequeued", function (file) {
			fileSize -= file.size;
			if (!fileCount) {
				setState("pedding");
			}
			removeFile(file);
			updateTotalProgress("type");
		});
		// 上传按钮
		clickUpload();
		addBtnEvent();

	}
	/**
	 * 执行上传文件
	 */
	function submitUploadFile() {
		uploader.upload();
	}

	function stopFile() {
		uploader.stop(true);
	}

	function beforeSendFileOrMd5(md5, task) {
		$.ajax({
			type: "post",
			url: upload.checkExistsUrl, // 后台url地址
			data: {
				md5: md5
			},
			cache: false,
			async: false, // 同步
			timeout: 30 * 60 * 1000 //todo 超时的话，只能认为该文件不曾上传过
		}).then(
			function (data, textStatus, jqXHR) {
				if (data.exists) {
					task.reject();
				} else {
					task.resolve();
				}
			},
			function (jqXHR, textStatus, errorThrown) {
				//任何形式的验证失败，都触发重新上传
				task.resolve();
			}
		);
		return $.when(task);
	}
	/**
	 * 上传成功回调函数
	 */
	function onUploadSuccess(_data, file) {
		// console.log(file);
		_data.md5 = file.md5;
		uploader.removeFile(file, true);
		// 回调函数
		if (typeof (upload.changeHandler) == 'function') {
			upload.changeHandler(_data);
		}
		/* var now = new Date();
		var fileSize = (file.size / 1024 / 1024 / 1024).toString();
		// 在表格中显示出来  fileName fileSize fileType uploadTime
		var formConfig = {
			fileName: file.name,
			fileSize:
				fileSize.substring(0, 1) > 0
					? fileSize.substring(0, 4) + "G"
					: (Number(fileSize) * 1024).toString().substring(0, 5) + "M",
			fileType: file.ext,
			uploadTime:
				now.getFullYear() +
				"." +
				(now.getMonth() + 1) +
				"." +
				now.getDate() +
				" " +
				now.getHours() +
				":" +
				now.getMinutes()
		}; */
		// 用来删除临时文件
	}
	// 当有文件添加进来时执行，负责view的创建
	function addFile(file) {
		$upload.removeClass("disabled");
		$webupload.removeClass("webupload-start");
		var $li = $(
				'<li id="' +
				file.id +
				'">' +
				'<span class="title">' +
				file.name +
				"</span>" +
				'<span  class="size">' +
				WebUploader.formatSize(file.size) +
				"</span>" +
				'<span class="progress"><span></span></span>' +
				"</li>"
			),
			$btns = $(
				'<div class="file-cancel">' +
				'<span class="cancel">删除</span></div>'
			).appendTo($li),
			$prgress = $li.find("p.progress span"),
			$info = $('<span class="error"></span>'),
			showError = function (code) {
				switch (code) {
					case "exceed_size":
						text = "文件大小超出";
						break;

					case "interrupt":
						text = "上传暂停";
						break;

					default:
						text = "上传失败，请重试";
						break;
				}

				$info.text(text).appendTo($li);
			};

		if (file.getStatus() === "invalid") {
			showError(file.statusText);
		} else {
			// @todo lazyload
			/* $wrap.text( '预览' );
			uploader.makeThumb( file, function( error, src ) {
			if ( error ) {
			$wrap.text( '不能预览' );
			return;
			}

			/!*var img = $('<img src="'+src+'">');
			$wrap.empty().append( img );*!/
			}, thumbnailWidth, thumbnailHeight1 );*/

			percentages[file.id] = [file.size, 0];
			file.rotation = 0;
		}

		file.on("statuschange", function (cur, prev) {
			if (prev === "progress") {
				$prgress.hide().width(0);
			} else if (prev === "queued") {
				$li.off("mouseenter mouseleave");
				$btns.remove();
			}

			// 成功
			if (cur === "error" || cur === "invalid") {
				showError(file.statusText);
				percentages[file.id][1] = 1;
			} else if (cur === "interrupt") {
				showError("interrupt");
			} else if (cur === "queued") {
				percentages[file.id][1] = 0;
			} else if (cur === "progress") {
				$info.remove();
				$prgress.css("display", "block");
			} else if (cur === "complete") {
				$li.append('<span class="success"></span>');
			}

			$li.removeClass("state-" + prev).addClass("state-" + cur);
		});

		/* $li.on( 'mouseenter', function() {
		$btns.stop().animate({height: 30});
		});

		$li.on( 'mouseleave', function() {
		$btns.stop().animate({height: 0});
		});*/

		$btns.on("click", "span", function () {
			var index = $(this).index(),
				deg;
			switch (index) {
				case 0:
					uploader.removeFile(file, true);
					//removeFile
					return;

					/* case 1:
					file.rotation += 90;
					break;

					case 2:
					file.rotation -= 90;
					break;*/
			}
		});
		$li.appendTo($queue);
	}

	function removeFile(file) {
		// 隊列中的文件數
		uploadFileQueue = uploader.getStats().queueNum;

		fileCount--;
		if (fileCount < 0) {
			fileCount = 0;
		}
		var $li = $("#" + file.id);
		delete percentages[file.id];
		updateTotalProgress("type");
		$li.off().find(".file-cancel").off().end().remove();
		if (uploadFileQueue == 0 && fileCount == 0) {
			// 按钮灰色，文件显示隐藏，添加遮罩层
			$upload.addClass('disabled');
			$statusBar.hide();
			$webupload.addClass("webupload-start");
		}
	}
	// 实时监控状态
	function setState(val) {
		var file, stats;

		if (val === state) {
			return;
		}

		$upload.removeClass("state-" + state);
		$upload.addClass("state-" + val);
		state = val;

		switch (state) {
			case "pedding":
				$placeHolder.removeClass("element-invisible");
				$queue.parent().removeClass("filled");
				$queue.hide();
				$statusBar.addClass("element-invisible");
				uploader.refresh();
				break;

			case "ready":
				$upload.removeClass("disabled");
				$placeHolder.addClass("element-invisible");
				$("#filePicker2").removeClass("element-invisible");
				$queue.parent().addClass("filled");
				$queue.show();
				$statusBar.removeClass("element-invisible");
				uploader.refresh();
				break;

			case "uploading":
				$("#filePicker2").addClass("element-invisible");
				$progress.show();
				// 点击暂停
				clickPause();
				break;

			case "paused":
				$progress.show();
				// 点击继续上传
				clickContinue();
				break;

			case "confirm":
				$progress.show();
				stats = uploader.getStats();
				if (stats.successNum && !stats.uploadFailNum) {
					setState("finish");
					return;
				}
				break;

			case "finish":
				stats = uploader.getStats();
				if (stats.successNum) {
					nsAlert("上传成功");
					if (fileCount == 1) {
						$webupload.addClass("webupload-start");
						$statusBar.hide();
						$upload.text("开始上传").addClass("disabled");
						$upload.off();
						$upload.on("click", function () {
							submitUploadFile();
							setState("uploading");
						});
					} else {
						submitUploadFile();
					}
				} else {
					// 没有成功的图片，重设
					state = "done";
					location.reload();
				}
				break;
		}
		updateStatus();
	}
	// 计算进度条的函数
	function updateTotalProgress(type) {

		var loaded = 0,
			total = 0,
			spans = $progress.children(),
			percent;

		$.each(percentages, function (index, item) {
			total += item[0];
			loaded += item[0] * item[1];
		});
		percent = total ? loaded / total : 0;
		// percent = 0.5;
		$(".percent").text((percent * 100).toFixed(1) + "%");

		if (type == "type") {
			if (percent <= 0.9) {
				$progress.css("width", Math.round(percent * 100) + "%");
				spans.eq(1).css("width", Math.round(percent * 100) + "%");
			}
		} else {
			$progress.css("width", Math.round(percent * 100) + "%");
			spans.eq(1).css("width", Math.round(percent * 100) + "%");
		}

		updateStatus();
	}
	// 更新上传状态的函数
	function updateStatus() {
		var text = "",
			stats;
		if (state === "ready") {
			text = "选中" + fileCount + "个文件，共" + WebUploader.formatSize(fileSize);
		} else if (state === "confirm") {
			stats = uploader.getStats();
			if (stats.uploadFailNum) {
				text = "已成功上传" + stats.successNum + "个文件" + stats.uploadFailNum +
					'个文件上传失败，<a class="retry" href="#">重新上传</a>失败文件<a class="ignore" href="#">忽略</a>';
			}
		} else {
			if (fileCount == 0) {} else {
				stats = uploader.getStats();
				text = "共" + fileCount + "个（" + WebUploader.formatSize(fileSize) + "），已上传" + stats.successNum + "个";

				if (stats.uploadFailNum) {
					text += "，失败" + stats.uploadFailNum + "个";
				}
			}
		}

		$info.html(text);
	}
	// 删除文件方法
	function deleteTempFile(md5) {
		var task = new $.Deferred();
		$.ajax({
			type: "post",
			url: upload.deleteFileUrl,
			cache: false,
			dataType: "json",
			async: false,
			data: {
				md5: md5,
				path: $("#uploadifyFilePath").val()
			},
			success: function (data) {
				if (data.success) {
					task.reject();
				} else {
					task.resolve();
				}
			}
		});
		return $.when(task);
	}
	// 执行三种按钮的功能
	function addBtnEvent() {
		var checkMore = $button.eq(0);
		var download = $button.eq(1);
		var delBtn = $button.eq(2);

	}
	// upload的对象化
	var upload = {
		uploadUrl: "",
		checkExistsUrl: "",
		swfUrl: "",
		deleteFileUrl: "",
		picker: "picker",
		uploadKey: "uploadBtn",
		wrap: "uploader",
		queueList: "queueList",
		changeHandler: "",
		init: function (uploadConfig) {
			this.swfUrl = getRootPath() + "/assets/js/webupload/Uploader.swf";
			for (var key in uploadConfig) {
				// 上传路径不能为空
				if (typeof (uploadConfig[key]) != 'boolean' && uploadConfig[key] == "") {
					console.error("配置文件中" + key + "出错");
				}
				if (uploadConfig.hasOwnProperty(key)) {
					if (uploadConfig[key] != "" && typeof (uploadConfig[key]) != "undefined") {
						upload[key] = uploadConfig[key];
					}
				}
			}
			var pathIndex = this.uploadUrl.indexOf("path");
			this.path = this.uploadUrl.substring(pathIndex + 5, this.uploadUrl.length);
			perpareUpload();
			if(typeof(uploadConfig.readonly) != 'undefined' && uploadConfig.readonly){
				$("#" + upload.picker).remove();
			}
		}
	};

	function init(uploadConfig) {
		upload.init(uploadConfig);
	}
	return {
		init: init,
		perpareUpload:perpareUpload
	};
})(jQuery);