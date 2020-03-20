(function($){
	$.fn.extend({
		tableExport: function(options) {
			var defaults = {
					separator: '	',
					ignoreColumn: [],
					tableName:'yourTableName',
					type:'csv',
					fileName: 'tableExport',
					pdfFontSize:14,
					pdfLeftMargin:20,
					csvUseBOM: true,
					escape:'true',
					htmlContent:'false',
					consoleLog:'false'
			};
			var options = $.extend(defaults, options);
			var el = this;
			var DownloadEvt = null;
			if(defaults.type == 'csv' || defaults.type == 'txt'){
			
				// Header
				var tdData ="";
				$(el).find('thead').find('tr').each(function() {
				tdData += "\n";					
					$(this).find('th').each(function(index,data) {
						if ($(this).css('display') != 'none'){
							if(defaults.ignoreColumn.indexOf(index) == -1){
								tdData += '"' + parseString($(this)) + '"' + defaults.separator;									
							}
						}
						
					});
					tdData = $.trim(tdData);
					tdData = $.trim(tdData).substring(0, tdData.length -1);
				});
				
				// Row vs Column
				$(el).find('tbody').find('tr').each(function() {
				tdData += "\n";
					$(this).find('td').each(function(index,data) {
						if ($(this).css('display') != 'none'){
							if(defaults.ignoreColumn.indexOf(index) == -1){
								tdData += '"'+ parseString($(this)) + '"'+ defaults.separator;
							}
						}
					});
					//tdData = $.trim(tdData);
					tdData = $.trim(tdData).substring(0, tdData.length -1);
				});
				
				//output
				if(defaults.consoleLog == 'true'){
					console.log(tdData);
				}
				var base64data = "base64," + $.base64.encode(tdData);
				var fileStr = 'data:text/' + (defaults.type == 'csv' ? 'csv' : 'plain') + ';charset=utf-8,' + ((defaults.type == 'csv' && defaults.csvUseBOM) ? '\ufeff' : '') +encodeURIComponent(tdData);
				downloadFile(defaults.fileName + '.' + defaults.type, fileStr);

				//window.open('data:application/'+defaults.type+'; filename=exportData;' + base64data);
			}else if(defaults.type == 'sql'){
			
				// Header
				var tdData ="INSERT INTO `"+defaults.tableName+"` (";
				$(el).find('thead').find('tr').each(function() {
				
					$(this).find('th').each(function(index,data) {
						if ($(this).css('display') != 'none'){
							if(defaults.ignoreColumn.indexOf(index) == -1){
								tdData += '`' + parseString($(this)) + '`,' ;									
							}
						}
						
					});
					tdData = $.trim(tdData);
					tdData = $.trim(tdData).substring(0, tdData.length -1);
				});
				tdData += ") VALUES ";
				// Row vs Column
				$(el).find('tbody').find('tr').each(function() {
				tdData += "(";
					$(this).find('td').each(function(index,data) {
						if ($(this).css('display') != 'none'){
							if(defaults.ignoreColumn.indexOf(index) == -1){
								tdData += '"'+ parseString($(this)) + '",';
							}
						}
					});
					
					tdData = $.trim(tdData).substring(0, tdData.length -1);
					tdData += "),";
				});
				tdData = $.trim(tdData).substring(0, tdData.length -1);
				tdData += ";";
				
				//output
				//console.log(tdData);
				
				if(defaults.consoleLog == 'true'){
					console.log(tdData);
				}
				
				var base64data = "base64," + $.base64.encode(tdData);
				window.open('data:application/sql;filename=exportData;' + base64data);
				
			
			}else if(defaults.type == 'json'){
			
				var jsonHeaderArray = [];
				$(el).find('thead').find('tr').each(function() {
					var tdData ="";	
					var jsonArrayTd = [];
				
					$(this).find('th').each(function(index,data) {
						if ($(this).css('display') != 'none'){
							if(defaults.ignoreColumn.indexOf(index) == -1){
								jsonArrayTd.push(parseString($(this)));									
							}
						}
					});									
					jsonHeaderArray.push(jsonArrayTd);						
					
				});
				
				var jsonArray = [];
				$(el).find('tbody').find('tr').each(function() {
					var tdData ="";	
					var jsonArrayTd = [];
				
					$(this).find('td').each(function(index,data) {
						if ($(this).css('display') != 'none'){
							if(defaults.ignoreColumn.indexOf(index) == -1){
								jsonArrayTd.push(parseString($(this)));									
							}
						}
					});									
					jsonArray.push(jsonArrayTd);									
					
				});
				
				var jsonExportArray =[];
				jsonExportArray.push({header:jsonHeaderArray,data:jsonArray});
				
				//Return as JSON
				//console.log(JSON.stringify(jsonExportArray));
				
				//Return as Array
				//console.log(jsonExportArray);
				if(defaults.consoleLog == 'true'){
					console.log(JSON.stringify(jsonExportArray));
				}
				var base64data = "base64," + $.base64.encode(JSON.stringify(jsonExportArray));
				window.open('data:application/json;filename=exportData;' + base64data);
			}else if(defaults.type == 'xml'){
			
				var xml = '<?xml version="1.0" encoding="utf-8"?>';
				xml += '<tabledata><fields>';

				// Header
				$(el).find('thead').find('tr').each(function() {
					$(this).find('th').each(function(index,data) {
						if ($(this).css('display') != 'none'){					
							if(defaults.ignoreColumn.indexOf(index) == -1){
								xml += "<field>" + parseString($(this)) + "</field>";
							}
						}
					});									
				});					
				xml += '</fields><data>';
				
				// Row Vs Column
				var rowCount=1;
				$(el).find('tbody').find('tr').each(function() {
					xml += '<row id="'+rowCount+'">';
					var colCount=0;
					$(this).find('td').each(function(index,data) {
						if ($(this).css('display') != 'none'){	
							if(defaults.ignoreColumn.indexOf(index) == -1){
								xml += "<column-"+colCount+">"+parseString($(this))+"</column-"+colCount+">";
							}
						}
						colCount++;
					});															
					rowCount++;
					xml += '</row>';
				});					
				xml += '</data></tabledata>'
				
				if(defaults.consoleLog == 'true'){
					console.log(xml);
				}
				
				var base64data = "base64," + $.base64.encode(xml);
				window.open('data:application/xml;filename=exportData;' + base64data);

			}else if(defaults.type == 'excel' || defaults.type == 'doc'|| defaults.type == 'powerpoint'  ){
				//console.log($(this).html());
				var excel="<table>";
				// Header
				$(el).find('thead').find('tr').each(function() {
					excel += "<tr>";
					$(this).find('th').each(function(index,data) {
						var $this = $(this);
						var rowspanStr = $this.attr('rowspan');
						var colspanStr = $this.attr('colspan');
						if(typeof(rowspanStr)=='undefined'){rowspanStr = 1;}
						if(typeof(colspanStr)=='undefined'){colspanStr = 1;}
						var classStr = 'rowspan="'+rowspanStr+'" colspan="'+colspanStr+'"';  
						if ($(this).css('display') != 'none'){					
							if(defaults.ignoreColumn.indexOf(index) == -1){
								var styleStr = 'style="mso-number-format:\@;"';
								excel += "<td "+classStr+" "+styleStr+">" + parseString($(this))+ "</td>";
							}
						}
					});	
					excel += '</tr>';						
					
				});					
				
				
				// Row Vs Column
				var rowCount=1;
				$(el).find('tbody').find('tr').each(function() {
					excel += "<tr>";
					var colCount=0;
					$(this).find('td').each(function(index,data) {
						var $this = $(this);
						var rowspanStr = $this.attr('rowspan');
						var colspanStr = $this.attr('colspan');
						if(typeof(rowspanStr)=='undefined'){rowspanStr = 1;}
						if(typeof(colspanStr)=='undefined'){colspanStr = 1;}
						var classStr = 'rowspan="'+rowspanStr+'" colspan="'+colspanStr+'"';  
						var typeClassStr = $this.attr('class');
						var styleStr = 'style="mso-number-format:\@;"';
						if(typeClassStr == 'td-number'){
							//shuzi
							var numberFormat = "\\#\\,\\#\\#0\\.00_\\\\;\\[Red\\]\\-\\#\\,\\#\\#0\\.00\\";
							styleStr = 'style="mso-number-format:'+numberFormat+'" ';
						}else if(typeClassStr == 'td-money'){
							//货币
							var numberFormat = "\\#\\,\\#\\#0\\.000";
							styleStr = 'style="mso-number-format:'+numberFormat+'"';
						}
						if ($(this).css('display') != 'none'){	
							if(defaults.ignoreColumn.indexOf(index) == -1){
								//excel += "<td "+classStr+" style='mso-number-format:\@;'>"+parseString($(this))+"</td>";
								excel += "<td "+classStr+" "+styleStr+">"+parseString($(this))+"</td>";
							}
						}
						colCount++;
					});															
					rowCount++;
					excel += '</tr>';
				});					
				excel += '</table>'
				
				if(defaults.consoleLog == 'true'){
					console.log(excel);
				}
				
				var excelFile = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:"+defaults.type+"' xmlns='http://www.w3.org/TR/REC-html40'>";
				excelFile += "<head>";
				excelFile += "<!--[if gte mso 9]>";
				excelFile += "<xml>";
				excelFile += "<x:ExcelWorkbook>";
				excelFile += "<x:ExcelWorksheets>";
				excelFile += "<x:ExcelWorksheet>";
				excelFile += "<x:Name>";
				excelFile += "{worksheet}";
				excelFile += "</x:Name>";
				excelFile += "<x:WorksheetOptions>";
				excelFile += "<x:DisplayGridlines/>";
				excelFile += "</x:WorksheetOptions>";
				excelFile += "</x:ExcelWorksheet>";
				excelFile += "</x:ExcelWorksheets>";
				excelFile += "</x:ExcelWorkbook>";
				excelFile += "</xml>";
				excelFile += "<![endif]-->";
				excelFile += "</head>";
				excelFile += '<meta charset="utf-8"></meta>';
				excelFile += "<body>";
				excelFile += excel;
				excelFile += "</body>";
				excelFile += "</html>";

				//var base64data = "base64," + $.base64.encode(excelFile);
				 var base64data = base64encode(excelFile);
				 var extension = (defaults.type === 'excel') ? 'xls' : 'doc';
				downloadFile(defaults.fileName + '.' + extension, 'data:application/vnd.ms-' + defaults.type + ';base64,' + base64data);
				//window.open('data:application/vnd.ms-'+defaults.type+';filename=exportData.doc;' + base64data);
				
			}else if(defaults.type == 'png'){
				html2canvas($(el), {
					onrendered: function(canvas) {										
						var img = canvas.toDataURL("image/png");
						window.open(img);
						
						
					}
				});		
			}else if(defaults.type == 'pdf'){

				var doc = new jsPDF('p','pt', 'a4', true);
				doc.setFontSize(defaults.pdfFontSize);
				
				// Header
				var startColPosition=defaults.pdfLeftMargin;
				$(el).find('thead').find('tr').each(function() {
					$(this).find('th').each(function(index,data) {
						if ($(this).css('display') != 'none'){					
							if(defaults.ignoreColumn.indexOf(index) == -1){
								var colPosition = startColPosition+ (index * 50);									
								doc.text(colPosition,20, parseString($(this)));
							}
						}
					});									
				});					
			
			
				// Row Vs Column
				var startRowPosition = 20; var page =1;var rowPosition=0;
				$(el).find('tbody').find('tr').each(function(index,data) {
					rowCalc = index+1;
					
				if (rowCalc % 26 == 0){
					doc.addPage();
					page++;
					startRowPosition=startRowPosition+10;
				}
				rowPosition=(startRowPosition + (rowCalc * 10)) - ((page -1) * 280);
					
					$(this).find('td').each(function(index,data) {
						if ($(this).css('display') != 'none'){	
							if(defaults.ignoreColumn.indexOf(index) == -1){
								var colPosition = startColPosition+ (index * 50);									
								doc.text(colPosition,rowPosition, parseString($(this)));
							}
						}
						
					});															
					
				});					
									
				// Output as Data URI
				doc.output('datauri');

			}
			
			function downloadFile(filename, data) {
                var DownloadLink = document.createElement('a');
				if (DownloadLink) {
					document.body.appendChild(DownloadLink);
					DownloadLink.style = 'display: none';
					DownloadLink.download = filename;
					DownloadLink.href = data;
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
			}

			function utf8Encode(string) {
				string = string.replace(/\x0d\x0a/g, "\x0a");
				var utftext = "";
				for (var n = 0; n < string.length; n++) {
					var c = string.charCodeAt(n);
					if (c < 128) {
						utftext += String.fromCharCode(c);
					}
					else if ((c > 127) && (c < 2048)) {
						utftext += String.fromCharCode((c >> 6) | 192);
						utftext += String.fromCharCode((c & 63) | 128);
					}
					else {
						utftext += String.fromCharCode((c >> 12) | 224);
						utftext += String.fromCharCode(((c >> 6) & 63) | 128);
						utftext += String.fromCharCode((c & 63) | 128);
					}
				}
				return utftext;
			}

			function base64encode(input) {
				var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
				var output = "";
				var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
				var i = 0;
				input = utf8Encode(input);
				while (i < input.length) {
					chr1 = input.charCodeAt(i++);
					chr2 = input.charCodeAt(i++);
					chr3 = input.charCodeAt(i++);
					enc1 = chr1 >> 2;
					enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
					enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
					enc4 = chr3 & 63;
					if (isNaN(chr2)) {
						enc3 = enc4 = 64;
					} else if (isNaN(chr3)) {
						enc4 = 64;
					}
					output = output +
					keyStr.charAt(enc1) + keyStr.charAt(enc2) +
					keyStr.charAt(enc3) + keyStr.charAt(enc4);
				}
				return output;
			}

			function parseString(data){
				if(defaults.htmlContent == 'true'){
					content_data = data.html().trim();
				}else{
					content_data = data.text().trim();
				}
				if(defaults.escape == 'true'){
					content_data = escape(content_data);
				}
				return content_data;
			}
		
		}
	});
})(jQuery);