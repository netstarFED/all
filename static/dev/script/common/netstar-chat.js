// 拿到含有nsmessageId的字段
var nschat = {};
nschat.websocket = (function () {
	var alterWebsocket = {};
	var ws;
	//用来建立链接
	function wsConnect(callback, cb, wsUrl, errorCb) {
		/**
		 * 第一个回调在链接建立成功时调用
		 * 第二个回调在接收数据后调用
		 * 第三个参数，传参时使用传过来的url，不传参时使用本地
		 */
		$.type(wsUrl) != 'undefined' ?
			ws = new WebSocket("ws://" + wsUrl) :
			ws = new WebSocket("ws://127.0.0.1:8888/Chat");
		if ("WebSocket" in window) {
			ws.onopen = function () {
				nsalert("命令已发送");
				typeof (callback) == 'function' && callback();
			};
			ws.onmessage = function (msg) {
				nsalert("数据接收成功");
				var wsData = [];
				var received_msg = msg;
				var received_data = received_msg.data;
				var jsonData = JSON.parse(received_data);
				for (var key in jsonData) {
					if (jsonData.hasOwnProperty(key)) {
						var element = jsonData[key];
						if (key == 'Image' || key == 'Photo') {
							jsonData[key] = "data:image/png;base64," + element;
						}
					}
				}
				wsData.push(jsonData);
				typeof (cb) == 'function' && cb(wsData);
			};
			ws.onerror = function (event) {
				typeof errorCb == 'function' && errorCb(event);
			};
			ws.onclose = function () {
				nsalert("连接关闭", 'warning');
			};
			return ws;
		} else {
			// 浏览器不支持 WebSocket
			nsalert("您的浏览器不支持 WebSocket!", 'warning');
		}
	}
	//用来发送数据。做了处理，只有当链接建立成功时才发送数据
	function send(message, callback) {
		(function waitForConnection() {
			if (ws.readyState === 1) {
				ws.send(message);
				if (typeof (callback) == 'function') {
					callback();
				}
			} else {
				setTimeout(function () {
					waitForConnection();
				}, 500);
			}
		})();
	}
	//关闭连接
	function close() {
		typeof ws == 'undefined' 
			? ""
			: ws.close();
	}
	//用来获得带有nsMessageid的属性
	function getAlterWebsocket(config, messageType, data) {
		// config 为 formJson 或者配置
		// 拿到后面 使用websocket获得的数据修改 的参数
		//messageType三种类型 camaraData idCardData 扫描枪
		if (typeof (config.form) != 'undefined') {
			var formId = config.id;
			config.form.forEach(function (item, index) {
				if (item.hasOwnProperty("nsmessageId")) {
					var value = nsForm.data[formId].formInput[item.id].value;
					var subdata = nsForm.data[formId].formInput[item.id].subdata;
					var textField = nsForm.data[formId].formInput[item.id].textField;
					var valueField = nsForm.data[formId].formInput[item.id].valueField;
					var fillValue = subdata ? subdata : value;
					alterWebsocket[item.nsmessageId] = {
						"id": item.id,
						"formId": formId,
						"fillValue": fillValue,
						"textField": textField,
						"valueField": valueField,
						"valueIndex": index,
						"isArray": subdata ? true : false,
						"messageType": messageType
					};
				}
			});
		} else {
			var personInfoConfig = config;
			for (var key in personInfoConfig.field) {
				if (personInfoConfig.field.hasOwnProperty(key)) {
					var element = personInfoConfig.field[key];
					alterWebsocket[element.nsmessageId] = {
						id: element.id,
						nsmessageId: element.nsmessageId,
						messageType: messageType,
						alterHandler: function (value, msgType) {
							//如果发送过来的数据的类型和所设置的类型相同,则执行修改
							if ((this.id == 'fileId' && (msgType == 'camaraData' || msgType == 'idCardData')) || (this.id != 'fileId' && this.messageType == msgType)) {
								data[this.id] = value;
								// personal.config.fields.userInfo[id] = value;
								nsVals.personInfoHtml(personInfoConfig, data);
							}
						}
					};
				}
			}
		}
		console.log(alterWebsocket);
	}
	//根据传参，修改页面值
	function setWebSocket(wsData) {
		// nsVals.ajax(webSocketAjax, function (data) {
		if (wsData.length > 0 && typeof (wsData) != 'undefined') {
			var socketData = wsData;
			$.each(socketData, function (index, item) {
				for (var key in item) {
					if (item.hasOwnProperty(key)) {
						var element = item[key];
						var currentFill = alterWebsocket[key];
						// 如果不等于id和alterWebsocket中有这个属性，则说明要触发改变
						if (key != 'id' && alterWebsocket.hasOwnProperty(key)) {
							// 如果没有formId则按照个人信息去修改
							if (typeof (currentFill.formId) != 'undefined') {
								// 如果 currentFill.textField 不等于 undefined 说明fillValue类型是数组，应循环去匹配
								if (currentFill.isArray) {
									$.each(currentFill.fillValue, function (index, valueItem) {
										for (var key2 in valueItem) {
											if (valueItem.hasOwnProperty(key2)) {
												// 使用默认的valueField
												if (key2 == currentFill.textField) {
													var element2 = valueItem[key2];
													// 进行验证，如果有一个可以对的上，则就是对的，然后就可以终止了
													if (element == element2) {
														// 直接赋值
														var data = {};
														if (currentFill.id == 'dictSex') {
															data[currentFill.id] = valueItem[currentFill.valueField];
														} else {
															data[currentFill.id] = element;
														}
														//如果发送过来的数据的类型和所设置的类型相同,则执行修改
														if ((currentFill.id == 'fileId' && (currentFill.messageType == 'camaraData' || currentFill.messageType == 'idCardData')) || (currentFill.id != 'fileId' && currentFill.messageType == item.messageType)) {
															// 调用该项的changeHandler函数对大对象进行修改操作
															$.each(nsForm.organizaData[currentFill.formId].form, function (index, item) {
																if (item.id == currentFill.id) {
																	item.changeHandler && item.changeHandler(data[currentFill.id]);
																}
															});
															nsForm.fillValues(data, currentFill.formId);
														}
													}
												}
											}
										}
									});
								} else {
									// 否则就是字符串或者数字，直接赋值就可以了
									var data = {};
									var otherData = {};
									if (currentFill.messageType == 'idCardData') {
										otherData.regAge = getAge(item.IDCard).age;
										otherData.regAgeMonth = getAge(item.IDCard).ageMonth;
									}
									data[currentFill.id] = element;
									//如果发送过来的数据的类型和所设置的类型相同,则执行修改
									if ((currentFill.id == 'fileId' && (currentFill.messageType == 'camaraData' || currentFill.messageType == 'idCardData')) || (currentFill.id != 'fileId' && currentFill.messageType == item.messageType)) {
										// 调用该项的changeHandler函数对大对象进行修改操作
										$.each(nsForm.organizaData[currentFill.formId].form, function (index, item) {
											if (item.id == currentFill.id) {
												if (typeof (item.changeHandler) != 'undefined') {
													item.changeHandler && item.changeHandler(data[currentFill.id]);
												}
											}
										});
										nsForm.fillValues(data, currentFill.formId);
										nsForm.fillValues(otherData, currentFill.formId);
									}
								}
							} else {
								if (currentFill.id == 'userAvatar' && element.indexOf("base64,") == -1) {
									element = "data:image/jpeg;base64," + element;
								}
								currentFill.alterHandler(element, item.messageType);
							}
						}
					}
				}
			});
		} else {
			console.error("webSocket数据有误");
		}
		// })
	}
	//用来转换base64到blob
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
		return new Blob([uInt8Array], {
			type: contentType
		});
	}
	//根据身份证证件号返回年龄和月份
	function getAge(identityCard) {
		var len = (identityCard + "").length;
		if (len == 0) {
			return 0;
		} else {
			if ((len != 15) && (len != 18)) //身份证号码只能为15位或18位其它不合法
			{
				return 0;
			}
		}
		var strBirthday = "";
		if (len == 18) //处理18位的身份证号码从号码中得到生日和性别代码
		{
			strBirthday = identityCard.substr(6, 4) + "/" + identityCard.substr(10, 2) + "/" + identityCard.substr(12, 2);
		}
		if (len == 15) {
			strBirthday = "19" + identityCard.substr(6, 2) + "/" + identityCard.substr(8, 2) + "/" + identityCard.substr(10, 2);
		}
		//时间字符串里，必须是“/”
		var birthDate = new Date(strBirthday);
		var nowDateTime = new Date();
		var age = nowDateTime.getFullYear() - birthDate.getFullYear();
		var ageMonth = Math.abs(nowDateTime.getMonth() - birthDate.getMonth());
		//再考虑月、天的因素;.getMonth()获取的是从0开始的，这里进行比较，不需要加1
		if (nowDateTime.getMonth() < birthDate.getMonth() || (nowDateTime.getMonth() == birthDate.getMonth() && nowDateTime.getDate() < birthDate.getDate())) {
			age--;
		}
		return {
			age: age,
			ageMonth: ageMonth
		};
	}
	return {
		wsConnect: wsConnect,
		send: send,
		close: close,
		getAlterWebsocket: getAlterWebsocket,
		setWebSocket: setWebSocket,
		base64ToBlob: base64ToBlob
	};
})();
$(window).on('beforeunload',function(){
	nschat.websocket.close();
})