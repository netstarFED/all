nsUI.orgchart = function(orgchartObj){
	function setDefault(orgchartObj){
		var configObj = orgchartObj;
		configObj.id = typeof(configObj.id) == 'string' ? configObj.id : '';
		configObj.url = typeof(configObj.url) == 'string' ? configObj.url : '';
		return configObj;
	}
	var config = setDefault(orgchartObj);
	config.$container = $('#'+config.id);
	if(config.id && config.url){
		var html = '<div class="input-loading"><i class="fa fa-circle-o-notch fa-spin fa-fw"></i></div>';
		config.$container.html(html);
		$.ajax({
			url: config.url,	
			data:config.data,
			type:'GET',
			dataType: "json",
			success: function(data){
				if(data.success){
					var orgData = data[config.dataSrc];
					if($.isArray(orgData)){
						config.$container.children('.input-loading').remove();
						getOrgchartData(orgData);
					}else{
						nsalert('返回数据格式有误');
					}
				}
			}
		});
	}else{
		if(config.id == ''){
			nsalert('id参数必填');
		}else if(config.url == ''){
			nsalert('数据源请求参数必填');
		}else{
			nsalert('参数传送格式错误');
		}
		return false;
	}
	function getOrgchartData(data){
		if(data.length > 0){
			config.$container.after('<ul id="'+config.id+'-organisation" style="display:none;"></ul>');
			config.$ul = $('#'+config.id+'-organisation');
			var resultLiHtml = '';
			for(var orgI=0; orgI<data.length; orgI++){
				var subMenuHtml = "";
				if(data[orgI].children){
					subMenuHtml = getSecondHtml(data[orgI].children);
				}
				resultLiHtml += getHtml(data[orgI],subMenuHtml);
			}
			resultLiHtml = '<ul><li>全部<ul>'+resultLiHtml+'</ul></li></ul>';

			config.$ul.html(resultLiHtml);
			config.$ul.orgChart({container: config.$container,interactive:true});
			config.$ul.remove();
		}else{
			config.$container.html('<div class="empty-orgchart">暂无数据</div>');
		}
	}
	function getHtml(json,subMenuHtml){
		var imageHtml = '';
		if(json[config.imageUrl]){
			imageHtml = '<img src="'+json[config.imageUrl]+'" alt="缩略图" width="30" height:"30" />'
		}
		var resultHtml = '<li><span ns-id="'+json[config.parentId]+'" ns-index="'+json[config.valueField]+'">'+json[config.textField]+'</span>'
								+imageHtml
							+subMenuHtml
						+'</li>';
		return resultHtml;
	}
	function getSecondHtml(childJson){
		var currentJson = childJson;
		var treeDataHtml = '';
		var treeNodesHtml = '';
		for(var treeIndex=0; treeIndex<currentJson.length;treeIndex++){
			var thridTreeHtml = '';
			if(currentJson[treeIndex].children){
				thridTreeHtml = getSecondHtml(currentJson[treeIndex].children);
			}
			treeNodesHtml += getHtml(currentJson[treeIndex], thridTreeHtml);
		}
		var treeDataHtml = '<ul>'+treeNodesHtml+'</ul>';
		return treeDataHtml;
	}
}