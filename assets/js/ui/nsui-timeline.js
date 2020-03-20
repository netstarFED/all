/********************************************************************
 * 时间轴
 */

 nsUI.timeline = function(configObj){
 	function setDefault(configObj){
 		var config = configObj;
 		config.id = typeof(config.id) == 'string' ? config.id : '';
 		config.url = typeof(config.url) == 'string' ? config.url : '';
 		config.type = typeof(config.type) == 'string' ? config.type : 'GET';
 		if(config.type == ''){config.type = 'GET';}
 		config.title = typeof(config.title) == 'object' ? config.title : {};
 		config.content = typeof(config.content) == 'object' ? config.content : {};
 		config.plusClass = typeof(config.plusClass) == 'string' ? config.plusClass : '';
 		return config;
 	}
 	var config = setDefault(configObj);
 	if(config.url && config.id){
 		//如果存在ajax请求链接
 		var ajaxJson = {
 			url:config.url,
 			type:config.type,
 			data:config.data
 		}
 		nsVals.ajax(ajaxJson,function(data){
 			var rowsData = data[config.dataSrc];
 			config.dataArr = rowsData;
 			getHtml(config,rowsData);
		});
 	}else{
 		nsalert(language.config.idUndefined);
 		console.log(config);
 		return false;
 	}
 	function getHtml(config,rowsData){
 		var html = '';
 		if($.isArray(rowsData)){
 			if(rowsData.length > 0){
 				//返回值存在
 				html = showContentHtml(config,rowsData);
 			}
 		}else{
 			//返回值有误
 			html = getErrorHtml();
 		}
 		$('#'+config.id).html(html);
 		$('#'+config.id).find('[ns-control="click"]').on('click',function(ev){
 			var nsIndex = $(this).attr('ns-index');
 			if(typeof(config.content.main.handler)=='function'){
 				return config.content.main.handler(config.dataArr[nsIndex]);
 			}
 		})
 	}
 	function showContentHtml(config,rowsData){
 		var html = '';
 		for(var i=0; i<rowsData.length; i++){
 			var titleHtml = getTitleHtml(rowsData[i]);
 			var contentHtml = getContentHtml(rowsData[i],i);
 			html += '<div class="timeline-item clearfix '+config.plusClass+'">'
 						+'<div class="timeline-info">'
							+'<span class="timeline-date">'+rowsData[i][config.timerField]+'</span>'
							+'<i class="timeline-indicator btn btn-info no-hover"></i>'
						+'</div>'
						+'<div class="widget-box transparent">'
							+'<div class="widget-body">'
								+'<div class="widget-main no-padding">'
									//标题+内容
									+titleHtml
									+contentHtml
								+'</div>'
							+'</div>'
						+'</div>'
 					+'</div>';
 		}
 		return html;
 	}
 	function getTitleHtml(data){
 		var titleHtml = '';
 		if(!$.isEmptyObject(config.title)){
 			//title存在mainField  secondField  remarkField
 			if(!$.isEmptyObject(config.title.mainField)){
 				//主标题存在
 				titleHtml += '<span class="timeline-title-main">'+config.title.mainField.name+data[config.title.mainField.value]+'</span>';
 			}
 			if(!$.isEmptyObject(config.title.secondField)){
 				//副标题存在
 				titleHtml += '<span class="timeline-title-second">'+config.title.secondField.name+data[config.title.secondField.value]+'</span>';
 			}
 			if(!$.isEmptyObject(config.title.remarkField)){
 				//备注存在
 				titleHtml += '<span class="timeline-title-remark">'+config.title.remarkField.name+data[config.title.remarkField.value]+'</span>';
 			}
 		}else{
 			titleHtml = '';
 		}
 		return titleHtml;
 	}
 	function getContentHtml(data,index){
 		var contentHtml = '';
 		if(!$.isEmptyObject(config.content)){
 			contentHtml = '<div class="timeline-content">'
 			switch(config.content.type){
 				case 'content':
 					//正文
 						if(!$.isEmptyObject(config.content.main)){
 							//正文
 							var isHref = typeof(config.content.main.isHref) == 'boolean' ? config.content.main.isHref : false;
 							if(isHref){
 								contentHtml += '<a href="'+data[config.content.main.hrefUrl]+'" ns-control="click" class="timeline-content-main-href" ns-index="'+index+'">'+data[config.content.main.name]+'</a>';
 							}else{
 								contentHtml += '<p class="timeline-content-main-normal" ns-index="'+index+'" ns-control="click">'+data[config.content.main.name]+'</p>';
 							}
 						}
 						if(!$.isEmptyObject(config.content.second)){
 							//辅助
 							var isHref = typeof(config.content.second.isHref) == 'boolean' ? config.content.second.isHref : false;
 							if(isHref){
 								contentHtml += '<a href="'+data[config.content.second.hrefUrl]+'" ns-control="click" class="timeline-content-second-href" ns-index="'+index+'">'+data[config.content.second.name]+'</a>';
 							}else{
 								contentHtml += '<p class="timeline-content-second-normal" ns-index="'+index+'" ns-control="click">'+data[config.content.second.name]+'</p>';
 							}
 						}
 					break;
 				case 'table':
 					//表格
 					var tableData = data[config.content.dataSrc];
 					if($.isArray(config.content.columnConfig)){
 						if(config.content.columnConfig.length > 0){
 							//定义了列宽
 							contentHtml += '<table class="table table-striped table-bordered table-hover">';
 							var theadHtml = '<thead>';
 							var tbodyHtml = '<tbody>';
 							var tdField = [];
 							for(var thI=0; thI<config.content.columnConfig.length; thI++){
 								theadHtml += '<th>'+config.content.columnConfig[thI].title+'</th>';
 								tdField.push(config.content.columnConfig[thI].field);
 							}
 							theadHtml += '</thead>';
 							for(var trI=0; trI<tableData.length; trI++){
 								tbodyHtml = '<tr>';
 								for(var tdI=0; tdI<tdField.length; tdI++){
 									tbodyHtml += '<td>'+tableData[trI][tdField[tdI]]+'</td>';
 								}
 								tbodyHtml += '</tr>';
 							}
 							tbodyHtml += '</tbody>';
 							contentHtml += theadHtml+tbodyHtml+'</table>';
 						}
 					}else{
 						contentHtml += '<table class="table table-striped table-bordered table-hover"></table>';
 					}
 					break;
 			}
 			contentHtml +='</div>';
 		}else{
 			contentHtml = '';
 		}
 		return contentHtml;
 	}
 	function getErrorHtml(){
 		var html = '<div class="result-error">返回值有误</div>';
 		return html;
 	}
 }