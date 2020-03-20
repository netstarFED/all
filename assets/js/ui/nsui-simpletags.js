nsUI.simpletags = {};
nsUI.simpletags.init = function(config){
	var InitId = config.id;
	nsUI.simpletags[InitId] = config;
	var $InitID = $("#"+InitId); //整体的容器id
	if(typeof(config.readonly) != "boolean"){
		config.readonly = false;
	}
	if(typeof($("#"+InitId).children()) == "object"){
		$InitID.children().remove();
	}
	if($.isArray(config.btns)){
		if(config.btns.length != 0){
			$InitID.prepend('<div id="'+InitId+'-container-btns" class="container-btns"></div>');
			nsButton.initBtnsByContainerID(InitId+'-container-btns',config.btns);
		}else{
			console.error("btns：并不能为空");
		}
	}
	
	$.ajax({
		url: 		config.url,
		type: 		config.type,
		dataType: 	config.dataType,
		data: 		config.data,
		success:function(data){
				// console.log(data);
				if(data.success){
					var simpletagsHTML= '';
					for(var index=0;index<data[config.dataSrc].length;index++){
						simpletagsHTML += '<div class="container-tags-content" ns-id="'+data[config.dataSrc][index]["id"]+'">'
												+data[config.dataSrc][index][config.textField]
												+'<span class="close">&times;</span>'
											+'</div>';	
					}
					var simpletagsContainerHTML = '<div class="container-tags" id="'+InitId+'-container-content">'
														+simpletagsHTML
													+'</div>';
					$InitID.append(simpletagsContainerHTML);

					if(config.readonly){
						$InitID.find('#'+InitId+'-container-content').attr("disabled",true);
						$InitID.find('#'+InitId+'-container-content .close').hide();
					}

					$InitID.find('#'+InitId+'-container-content .close').off('click');
					$InitID.find('#'+InitId+'-container-content .close').on("click",function(even){
						// $(this).parent().hide();
						if(!config.readonly){
							var $target = $(even.target).parent();
							for(var index=0;index<data[config.dataSrc].length;index++){
								if(data[config.dataSrc][index]["id"] == $target.attr("ns-id")){
									var res = {
										readonly: config.readonly,
										data: data[config.dataSrc][index]
									}
								}
							}
							config.closeHandler(res);
						}
					});
					$InitID.find('#'+InitId+'-container-content .container-tags-content').off('click');
					$InitID.find('#'+InitId+'-container-content .container-tags-content').on("click",function(even){
						$InitID.find('#'+InitId+'-container-content .container-tags-content').removeClass("active");
						if($(even.target).attr("class") == "container-tags-content"){
							$(even.target).addClass("active");

							var $target = $(even.target);
							// var targetText = $(even.target).text();
							// targetText = targetText.substring(0,targetText.length-1);
							for(var index=0;index<data[config.dataSrc].length;index++){
								if(data[config.dataSrc][index]["id"] == $target.attr("ns-id")){
									var res = {
										readonly: config.readonly,
										data: data[config.dataSrc][index]
									}
								}
							}
							config.clickHandler(res);
						}
					});
				}
			}
	});
}
nsUI.simpletags.refresh = function(id,data){
	nsUI.simpletags[id].data = data;
	console.log(nsUI.simpletags[id]);
	nsUI.simpletags.init(nsUI.simpletags[id]);
}