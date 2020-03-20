//sjj 20191018 视频播放  上传视频
NetstarUI.hwvodsdk = {
/**
	 * 1.请求获取token的地址  https://vod.cn-north-1.myhuaweicloud.com/v3/auth/tokens
	 * 2.获取到token之后根据token值和媒介id值获取视频播放地址
	 * 3.上传视频需要初始化sdk
	 * 4.初始化sdk需要获取临时凭证AK、SK和securityToken 向服务端发送ajax请求获取这几项值
	 * 5.根据临时凭证AK、SK和securityToken 构建一个VodClient实例并初始化回调
	 * 6 APP客户端向APP服务端发送请求，APP服务端向VOD请求创建媒资
	 * 	通过服务端创建媒资返回
	 * 		bucket   	OBS桶
	 * 		location 	region信息
	 * 		object 		文件上传路径
	 * 		asset_id    媒资ID(asset_id)
	 * 7.选择上传文件和媒资信息添加到上传文件列表
    * NetstarUI.hwvodsdk.init({assetId:assetId})//入参媒介ID   调用此方法预览视频
    * NetstarUI.hwvodsdk.uploadInit({event:event,callBackFunc:callBackFunc,progressCallBackFunc:progressCallBackFunc});//入参当前change事件的event,和上传成功之后的回调  调用此方法上传视频
	* NetstarUI.hwvodsdk.deleteIdByAjax({assetId:assetId,callBackFunc:callBackFunc}); //入参当前的媒资id,和成功之后的回调
	* NetstarUI.hwvodsdk.getVideoAddressByAjax({assetId:assetId,callBackFunc:callBackFunc});//入参当前的媒资id,和成功之后的回调
	 */
	configs:{
		//token    
		//vodClient //实例化回调参数使用
		//vodCliendData //临时凭证的参数
		//assetId 媒介id
	},//存储需要用到的值
	//获取token
	getTokenByAjax:function(callBackFunc){
		//获取token之后的回调方法
		var getTokenAjaxConfig = {
			url:getRootPath()+'/huaweiIam/getToken',
			type:'post',
			data:{
				"auth": {
					"identity": {
						"methods": ["password"],
						"password": {
							"user": {
								"name": "wangxing-dev",
								"password": "NetStar@123",
								"domain": {
									"name": "wangxing123"
								}
							}
						}
					},
					"scope": {
						"project": {
							"id":"950edd5ca6d3416cbb0e1e4830038dce",
							"name": "cn-north-1"
						}
					}
				}
			},
			plusData:{
				callBackFunc:callBackFunc
			},
		};
		NetStarUtils.ajax(getTokenAjaxConfig,function(res,ajaxOptions){
			if(res.success){
				var token = res.data;//获取到token
				NetstarUI.hwvodsdk.configs.token = token;
				if(typeof(ajaxOptions.plusData.callBackFunc)=='function'){
					ajaxOptions.plusData.callBackFunc();
				}
			}else{
				nsalert(res.msg,'error');
			}
		},true);
	},
	//根据媒介id获取视频播放地址
	getVideoAddressByAjax:function(innerParams){
		//根据媒资id获取播放地址
		var assetId = '12122b9ede426ec0453e6bdddd69a19a';
		if(NetstarUI.hwvodsdk.configs.assetId){
			assetId = NetstarUI.hwvodsdk.configs.assetId;
		}
		if(!$.isEmptyObject(innerParams)){
			assetId = innerParams.assetId;
		}
		var ajaxConfig = {
			url:getRootPath()+"/huaweiIam/getDetailByAssetId",
			type:'get',
			data:{
				assetId:assetId,
				//token:NetstarUI.hwvodsdk.configs.token
			},
			contentType:'application/x-www-form-urlencoded',
			plusData:{
				innerParams:innerParams
			},
		};
		NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
			if(res.success){
				if(!$.isEmptyObject(ajaxOptions.plusData.innerParams)){
					var resData = res.rows;
					if(!$.isArray(resData)){resData = [];}
					//{id:1, name:'', size:'134', duration:'',assetId:''}
					var dataArr = [];
					for(resI=0; resI<resData.length; resI++){
						dataArr.push({
							id:resData[resI].id, 
							name:resData[resI].title, 
							videoName:resData[resI].videoName,
							size:resData[resI].videoSize, 
							duration:resData[resI].videoDuration,
							assetId:resData[resI].assetId
						});
					}
					ajaxOptions.plusData.innerParams.callBackFunc(dataArr,ajaxOptions.plusData.innerParams);
				}else{
					var resData = res.rows[0];
					var width = typeof(resData.width)=='number' ? resData.width : 800;
					var dialogCommon = {
						id:'dialog-hwvodsdk-video',
						title: '视频播放',
						templateName: 'PC',
						height:'auto',
						width:width+50,
						shownHandler:function(data){
							$('#'+data.config.bodyId).html('<video id="test" class="video-js vjs-default-skin vjs-big-play-centered"></video>');
							var width = typeof(resData.width)=='number' ? resData.width : 800;
							var height = typeof(resData.height)=='number' ? resData.height : 450;
							hwplayerloaded(function(){
								var options = {                     
									controls: true,            
									width: width,           
									height: height,                       
									stat:true,            
									userId: 'playerDemo01',            
									domainId: 'hwPlayer',     
									preload:'metadata',   
								};        
								var player = new HWPlayer('test', options, function () {            
									//播放器已经准备好了 
									player.src(resData.playVideoUrl);           
									// "this"指向的是HWPlayer的实例对象player
									player.load();          
									player.play();            // 使用事件监听            
									player.on('ended',function (e) {            
										//播放结束了  
										console.log(e);       
										console.log(this)   
									});  
									player.on('error',function(e){
										//播放出错
										console.log(e)
									});      
								});    
								NetstarUI.hwvodsdk.player = player;
							});
						},
						hideHandler:function(data){
							NetstarUI.hwvodsdk.player.dispose();//销毁视频播放器并进行必要的清理
						}
					};
					NetstarComponent.dialogComponent.init(dialogCommon);
				}
			}else{
				nsalert(res.msg,'error');
			}
		},true);
	},
	//初始化调用
	init:function(_config){
		/**
		 * _config object 入参
		 * *_config.assetId  string 媒介id
		*/
		_config = typeof(_config)=='object' ? _config : {};
		if(_config.assetId){
			NetstarUI.hwvodsdk.configs.assetId = _config.assetId;
		}
		this.getTokenByAjax(this.getVideoAddressByAjax);
	},
	//获取临时AK,SK和securityToken通过发送ajax请求
	getVodClientDataByAjax:function(_config){
		var ajaxConfig = {
			url:getRootPath()+'/huaweiIam/getAKSKAndSecurityToken',
			type:'get',
			data:{
				//asset_id:'12122b9ede426ec0453e6bdddd69a19a',
				//token:NetstarUI.hwvodsdk.configs.token
			},
			plusData:{
				innerParams:_config
			}
		};
		NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
			if(res.success){
				//access,secret,securityToken
				NetstarUI.hwvodsdk.configs.vodCliendData = res.data;
				if(ajaxOptions.plusData.innerParams.callBackFunc){
					ajaxOptions.plusData.innerParams.callBackFunc(ajaxOptions.plusData.innerParams.config);
				}
			}else{
				nsalert(res.msg,'error');
			}
		},true);
	},
	
	//根据id删除视频
	deleteIdByAjax:function(delData){
		var assetId = '12122b9ede426ec0453e6bdddd69a19a';
		if(delData.assetId){
			assetId = delData.assetId;
		}
		var ajaxConfig = {
			url:getRootPath()+"/huaweiIam/delAssetById",
			type:'post',
			data:{
				assetId:assetId,
				//token:NetstarUI.hwvodsdk.configs.token
			},
			plusData:{
				innerParams:delData
			},
		};
		NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
			if(res.success){
				if(typeof(delData.callBackFunc)=='funciton'){
					delData.callBackFunc(res.data,ajaxOptions.plusData.innerParams);
				}
			}else{
				nsalert(res.msg,'error');
			}
		},true);
	},
	//获取媒资信息(bucket,location,object,asset_id)通过发送ajax请求
	getMediaInfoByAjax:function(innerParams){
		//var titleName = innerParams.file.name;
		var videoName = innerParams.file.name;
		var tempArr1 = innerParams.file.name.split('.');
		var titleName = tempArr1[0];//获取当前上传文件的后缀名
		var ajaxConfig = {
			url:getRootPath()+"/huaweiIam/createAsset",
			type:'post',
			data:{
				title:titleName,
				videoName:videoName
			},
			plusData:{
				file:innerParams.file,
				index:innerParams.index,
				callBackFunc:innerParams.callBackFunc,
			}
		};
		NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
			if(res.success){
				//assetId,bucket,location,object,videoUploadUrl
				var mediaData = res.data;
				var vodClient = NetstarUI.hwvodsdk.configs.vodClient;
				var file = ajaxOptions.plusData.file;
				var tempArr1 = file.name.split('.');
				var fileType = tempArr1[tempArr1.length-1];//获取当前上传文件的后缀名
				var tempArr2 = mediaData.object.split('.');
				var objectType = tempArr2[tempArr2.length-1];//获取媒资返回的文件上传路径
				if(objectType.indexOf("_") >-1){
					objectType = objectType.substring(1);
				}
				if(fileType.toLowerCase().indexOf(objectType.toLowerCase()) == -1) {
					nsalert('媒资object的地址保存格式与文件格式不一致，请重新上传！');
					return;
				}
				
				var data = {
					bucket:mediaData.bucket,                     //必选，通过服务端创建媒资返回的OBS桶             
					location:mediaData.location,                  //必选，通过服务端创建媒资返回的region信息             
					object:mediaData.object,                    		//必选，通过服务端创建媒资返回的文件上传路径              
					asset_id:mediaData.assetId,                    			//必选，通过服务端创建媒资返回的媒资ID(asset_id)                 
					videoFile:file,               			//必选，选择上传的文件                
					is_check:false								//非必选，是否进行重复上传校验,默认值为false    
				};
				try {
					// 添加到上传列表
					vodClient.addAsset(data);//添加到上传列表
					vodClient.startUpload(ajaxOptions.plusData.index);//开始上传
				}catch(err) {
					// 资源重复或参数错误，都无法添加进上传列表
					console.warn(err);
					//alert('err: ' + err);
				}
				//console.log(vodClient.listAssets())
			}else{
				nsalert(res.msg,'error');
			}
		},true);
	},
	//获取临时AK,SK和securityToken之后调用ajax
	changeEventHandler:function(_config){
		// 如果已初始化过，不再进行初始化操作
		var vodCliendData = NetstarUI.hwvodsdk.configs.vodCliendData;
		var event = _config.event;
		var callBackFunc = _config.callBackFunc;
		var progressCallBackFunc = _config.progressCallBackFunc;
		//构建vodClient实例 
		var vodClient = new VodClient({  
			access_key_id:vodCliendData.access,				// 必选，临时凭证AK    
			secret_access_key:vodCliendData.secret,   	 	// 必选，临时凭证SK 
			security_token:vodCliendData.securityToken, 				// 临时凭证security_token
			project_id:"950edd5ca6d3416cbb0e1e4830038dce",					// 项目ID
			vod_server:"vod.cn-north-1.myhuaweicloud.com",					// 终端节点Endpoint
			vod_port:"", 					// 终端节点Endpoint端口号，默认值为空
			//开始上传
			onUploadstarted:function(assetInfo) {
				//console.log(assetInfo.file.name + "开始上传");
				console.log(assetInfo)
			},
			//上传进度
			onUploadProgress:function(assetInfo) {
				// 设置上传进度
				console.log(assetInfo.progress);
				if(typeof(progressCallBackFunc)=='function'){
					progressCallBackFunc(assetInfo.progress);
				}
			},
			//合并段成功
			onUploadSucceed:function(assetInfo) {
				console.log(assetInfo);
				var confirmAjaxConfig = {
					url:getRootPath()+"/huaweiIam/confirmAssetInfo",
					type:'post',
					data:{
						assetId:assetInfo.asset_id,
						status:'CREATED'
					},
					contentType:'application/x-www-form-urlencoded',
					plusData:{
						callBackFunc:callBackFunc,
						assetInfo:assetInfo
					}
				};
				NetStarUtils.ajax(confirmAjaxConfig,function(res,ajaxOptions){
					if(res.success){
						//{id:1, name:'', size:'134', duration:'',assetId:''}
						console.warn(res)
						console.log(ajaxOptions.plusData.callBackFunc)
						var _assetInfo = ajaxOptions.plusData.assetInfo;
						console.log(_assetInfo)
						var data = {
							id:res.data.id, 
							name:_assetInfo.file.name,
							size:_assetInfo.file.size, 
							assetId:res.data.assetId,
							duration:res.data.fileDuration
						};
						if(typeof(ajaxOptions.plusData.callBackFunc)=='function'){
							ajaxOptions.plusData.callBackFunc(data);
						}
					}else{
						nsalert(res.msg,'error');
					}
				},true)
			},
			//上传失败
			onUploadFailed:function(assetInfo,err) {
				//进行上传失败处理
				try{
					var confirmAjaxConfig = {
						url:getRootPath()+"/huaweiIam/confirmAssetInfo",
						type:'post',
						data:{
							assetId:assetInfo.asset_id,
							status:'FAILED'
						},
						contentType:'application/x-www-form-urlencoded',
					};
					NetStarUtils.ajax(confirmAjaxConfig,function(res){
						if(res.success){
							console.log(res)
						}else{
							nsalert(res.msg,'error');
						}
					},true)
					//console.log(assetInfo,err);
				}catch(err){
					console.log(err);
				}
			},
			//若凭证失效，重新设置凭证并上传
			onUploadTokenExpired:function() {
				console.log("onUploadTokenExpired");
				// 重新设置临时凭证并重新上传               
				vodClient.resumeUpload(vodCliendData.access,vodCliendData.secret,vodCliendData.securityToken);
			}  
		});	
		NetstarUI.hwvodsdk.configs.vodClient = vodClient;
		var files = event.target.files;

		$.each(files,function(index,value){
			NetstarUI.hwvodsdk.getMediaInfoByAjax({file:value,index:index,callBackFunc:callBackFunc});
		});
	},
	//上传视频
	uploadInit:function(_config){
		/**
		 * _config object 入参 
		 * _config.event   事件触发
       * _config.callBackFunc 回调事件
		*/
		//获取临时AK,SK和securityToken通过发送ajax请求getVodClientDataByAjax();
		//获取媒资信息(bucket,location,object,asset_id)通过发送ajax请求getMediaInfoByAjax();
		this.getVodClientDataByAjax({config:_config,callBackFunc:this.changeEventHandler});
	},
};