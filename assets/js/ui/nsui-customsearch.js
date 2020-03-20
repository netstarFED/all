nsUI.customSearch = (function($) {
	var pageCode = ''; //query.page.view${uuid}
	var codeID = '';
	var config = {};
	var uuid = '';
	function init(code, jspConfig){
		pageCode = 'query.page.view'+code;
		pageCode = eval(pageCode);
		uuid = code;
		codeID = 'query-page-view'+code+'-code';
		codeID = $('#'+codeID).val();
		config = jspConfig;

		var ajaxurl = getRootPath() + '/queryPage/getAdvancedInfo.json?code='+codeID;
		$.ajax({
			url:ajaxurl,
			dataType: "json",
			success:function(data){
				//没有返回success
				searchPlaneDataInit(data);
			},
			error:function(error){
				//没有错误类型定义
				var errorCode = '';
				if(error){
					errorCode = language.ui.nsuicustomsearch.errorCode +error;
				}
				nsalert(language.ui.nsuicustomsearch.errorCodeUnknown+errorCode,'error');
			}
		});
	}
	//数据重新规划
	function searchPlaneDataInit(data){
		//整理输出对象
		var json = ajaxDataToJson(data);
		var baseForm = {};

		baseForm.titleName = json.dafalutValue.advancedName;  	//表单标题
		baseForm.advancedId = json.dafalutValue.advancedId;		//查询ID

		baseForm.form = [];
		for(var fieldI = 0; fieldI<json.advanceFields.length; fieldI++){
			var fieldData = {};
			var currentField = json.advanceFields[fieldI];
			//console.log(currentField);
			fieldData.id = currentField.field;
			fieldData.label = currentField.name;
			var compareType = currentField.selectType;
			//json.dafalutValue[fieldData.field+'CompareType'];
			if(typeof(compareType)=='undefined'){
				//如果是未定义，则未指定比较类型
				compareType = '';
			}else if(compareType==null){
				compareType = '';
			}
			var compareSubdata = [];
			var compareTypeValue = '';
			var compareValue = '';
			var compareValueName = '';
			if(compareType!=''){
				compareSubdata = json.selectTypes[compareType];
				compareTypeValue = json.dafalutValue[fieldData.id+'CompareType'];
				//debugger
				switch(compareTypeValue){
					case 0: 	//等于
					case 1: 	//不等于
					case 2: 	//大于
					case 3: 	//大于等于
					case 4: 	//小于
					case 5: 	//小于等于
						compareValue = json.dafalutValue[fieldData.id+'DefaultValue1'];
						break;
					case 10: 	//最近几天
					case 11: 	//最近几天
					case 12: 	//最近几天
					case 13: 	//最近几天
					case 14: 	//最近几天
						compareValue = json.dafalutValue[fieldData.id+'DefaultValue1Temp'];
						break;
					case 20: 	//介于
					case 21: 	//不介于
						compareValue = [];
						compareValue[0] = json.dafalutValue[fieldData.id+'DefaultValue1'];
						compareValue[1] = json.dafalutValue[fieldData.id+'DefaultValue2'];
						break;
					default:
						//没有默认值
						break;
				}
				if(compareValue!=''){
					compareValueName = compareSubdata[compareTypeValue];
				}
			};
			// fieldData.compare = {
			// 	type:compareType,
			// 	TypeValue:compareTypeValue,
			// 	subdata:compareSubdata,
			// 	typeValueName:compareValueName,
			// 	value:compareValue
			// };
			console.log(fieldData);
			//console.log(fieldData.compare.typeValueName);
			if(compareValueName){
				//如果有比较方式的名字，则输出普通组件
				switch(compareType){
					case 0:
					case 1:
						fieldData.type = 'text';
						fieldData.value = compareValue;
						break;
					case 2:
						fieldData.type = 'date';
						fieldData.value = compareValue;
						break;
					case 3:
					case 4:
					case 5:
					case 6:
						fieldData.type = 'select';
						fieldData.action = 'GET';
						fieldData.data = {
							selectType: currentField.selectType,
							fieldId: currentField.id
						};
						fieldData.url = getRootPath() + '/queryPage/sqlDict.json';
						fieldData.value = compareValue;
						break;
				}
				console.log(compareValue);
			}else{
				console.warn(fieldData);
			}
			//根据条件下拉框的值重新整理form
			console.log(compareValueName=='');
			switch(compareValueName){
				case '等于':
					baseForm.form.push(fieldData);
					break;
				case '':
					console.log(fieldData);
					console.log(currentField);
					break;
				default:
					console.warn(compareValueName)
					break;

			}
			//baseForm.form[0].push(fieldData);
		}
		console.log(baseForm.form);
		//原始输出对象整理完成
		refreshNav(baseForm);
	}
	//刷新导航栏
	function refreshNav(searchForm){
		var selectSearch = 
		{
		    mode:'select',  
		    placeholder:'资源搜索',
		    info:'可以使用编号和名称搜索，支持五笔和简拼，可以选定时间和数据分类',
		    // classID:'mainSearchClass',
		    // dateID:'mainSearchDate',
		    // inputID:'mainSearchInput',
		    callbackSearchHandler:function(data){
		        console.info('搜索结果');
		        console.log(data);
		    },
		    dateRange: {
		        start: "2017/02/01",
		        end: "2017/02/10",
		        //min: "2017/01/22",
		        //max: "2017/02/12",
		    },
		    subdata:[
		        {
		            name: '类别',
		            id: 'class'
		        },{
		            name: '编码',
		            id: 'code'
		        },{
		            name: '名称',
		            id: 'name'
		        }
		    ],
		    advance:{
		        shortcutKey:true,
		        form:searchForm.form
		        // form:[
		        //     {
		        //         id:         'sqid',
		        //         label:      '产品编号',
		        //         type:       'text',
		        //         //rules:      'required range=[0,10] ',
		        //         readonly: true,
		        //         //value:        function(){return 'functionValue'},
		        //         value: 'MK-522'
		        //     },
		        //     {
		        //         id: 'radio-test',
		        //         type: 'radio',
		        //         label: '单选按钮组',
		        //         //textField:    'name',
		        //         //valueField: 'id', 
		        //         isHasClose: true,
		        //         changeHandler: function(data){console.log(data)},
		        //         subdata:
		        //         [
		        //             {
		        //                 text:   '普通',
		        //                 value:  'zp',
		        //             },
		        //             {
		        //                 text:   '不可用',
		        //                 value:  'pp',
		        //                 isDisabled:true,
		        //             },
		        //             {
		        //                 text:   '已选中',
		        //                 value:  'sj',
		        //                 isChecked:  true,
		        //             },
		        //             {
		        //                 text:   '不可用且已选中',
		        //                 value:  'sj',
		        //                 isChecked:  true,
		        //                 isDisabled: true,
		        //             }
		        //         ]
		        //     },
		        //     {
		        //         id:         'chargetype',
		        //         label:      '付款方式',
		        //         type:       'select',
		        //         //rules:        'required',
		        //         textField:  'name',
		        //         valueField: 'id', 
		        //         //url:'http://localhost:8815/NPE/assets/json/select.json',//路径
		        //         method:'get',
		        //         value:'zp',
		        //         data:'',
		        //         //changeHandler:selectHanlder,
		        //         //value:    'sj',
		        //         subdata:    [
		        //                         {
		        //                             name:   '付款方式第一种',
		        //                             id:     'zp',
		        //                         },
		        //                         {
		        //                             name:   '付款方式第二种',
		        //                             id:     'pp',
		        //                         },
		        //                         {
		        //                             name:   '付款方式第三种',
		        //                             id:     'sj',
		        //                             isChecked:  true,
		        //                         }
		        //                     ]
		        //     }
		        // ]
		    }
		}
		console.log(pageCode.navConfig);
		//console.log(eval(pageCode))
		pageCode.navConfig.search = selectSearch;
		nsNav.init(pageCode.navConfig);
		bestestQueryInit();
	}
	//返回列表
	function bestestQueryInit() {
		$.ajax({
		url: getRootPath() + '/queryAdvanced/getList',
		type: 'GET',
		data: {
		    configId: config.id
		},
		dataType: "json",
		success: function (result) {
		    var queryData = result.rows;
		    var queryDropHtml = componentQueryHtml(queryData);
		    var $besestQueryDom = $('#query-page-view'+uuid+'-nav-bestestquery');
		    $besestQueryDom.html(queryDropHtml);
		    //单击li标签查询方法
		    var $queryLiDom = $besestQueryDom.children('li');
		    var $queryModifyDom = $queryLiDom.children().children('[ns-query="modify"]');
		    $queryModifyDom.on('click', function (ev) {
		        ev.stopPropagation();
		        var queryID = $(ev.target).closest('li').attr('id');
		        advanceQuery(queryID);
		    });
		    var $queryCustomDom = $queryLiDom.children('[ns-query="custom"]');
		    $queryCustomDom.on('click', function (ev) {
		        customQuery();
		    });
		    //删除操作
		    $queryDelDom = $queryLiDom.children().children('[ns-query="del"]');
		    $queryDelDom.on('click', function (ev) {
		        ev.stopPropagation();
		        var queryID = $(ev.target).closest('li').attr('id');
		        if (confirm('确认要删除？')) {
		            //执行删除操作
		            //执行完成之后的刷新
		            $.ajax({
		                url: getRootPath() + '/queryAdvanced/delete',
		                type: 'GET',
		                data: {
		                    id: queryID
		                },
		                dataType: "json",
		                success: function (result) {
		                    if(result.success){
		                        nsalert('删除成功', 'success');
		                        bestestQueryInit();
		                    } else {
		                        nsalert(result.msg, 'error');
		                    }
		                }
		            });
		        }
		    });
		    $queryQueryDom = $queryLiDom.children('[ns-query="query"]');
		    $queryQueryDom.on('click', function (ev) {
		        var queryID = $(ev.target).closest('li').attr('id');
		        var isFull = $(ev.target).closest('li').attr('isFull');
		        if (queryID == -1) {
		            customQuery();
		        } else {
		            advanceQuery(queryID, isFull);
		        }
		    });
		}
		});
	}
	//填充数据
    function componentQueryHtml(queryData) {
        var queryDropHtml = '';
        for (var queryI = 0; queryI < queryData.length; queryI++) {
            var commonIcon = Number(queryData[queryI].isCommon);
            var commonIconHtml = '';
            if (commonIcon == 1) {
                commonIconHtml = '<div class="ico"></div>';
            } else {
                commonIconHtml = '<div class="ico"><i class="fa fa-user"></i></div>';
            }
            queryDropHtml += '<li id="' + queryData[queryI].id + '" isFull = "' + queryData[queryI].isFull + '">'
                + '<span ns-query="query"><a href="javascript:void(0);">'
                + commonIconHtml + queryData[queryI].name
                + '</a></span>'
                + '<div class="ico-right"><a href="javascript:void(0)" ns-query="modify"><i class="fa fa-pencil fa-border"></i></a></div>'
                + '<div class="ico-right"><a href="javascript:void(0)" ns-query="del"><i class="fa fa-trash fa-border"></i></a></div>'
                + '</li>';
        }
        //如果要自定义就加这个
        var queryModuleHtml = '<li id="-1" style="border-top:1px solid #cccccc;height:30px;">'
            + '<a href="javascript:void(0);" ns-query="custom">自定义</a>'
            + '</li>';
        return queryDropHtml + queryModuleHtml;
    }
	//把ajax返回的数据重新处理
	function ajaxDataToJson(data){
		var json = {};
		json.advanceFields = data.advanceFields;
		json.andOrTypeJson = $.parseJSON(data.andOrTypeJson);
		json.buildinFields = data.buildinFields;
		json.dafalutValue = $.parseJSON(data.defaultValue);
		json.leftBracketTypeJson = $.parseJSON(data.leftBracketTypeJson);
		json.quick = data.quick;
		json.rightBracketTypeJson = $.parseJSON(data.rightBracketTypeJson);
		var selectTypes = $.parseJSON(data.selectTypes);
		var formatSelectType = {};
		$.each(selectTypes, function(key,value){
			var formatArr = {};
			$.each(value, function(key1,value1){
				formatArr[value1.id] = value1.name;
			});
			formatSelectType[key] = formatArr;
		});
		json.selectTypes = formatSelectType;
		console.log(json);
		return json;
	}
	function advanceQuery(id, isFull) {
		if (isFull == '1') {
			//执行查询
			baseDataTable.reloadTableAJAX(
				'table-query-page-view'+uuid+'-table',
				{
					'code': config.code,
					'advancedId': id,
					'data_auth_code': config.dataAuthCode,
					'buildin': $('#query-page-view'+uuid+'-buildin').val(),
					isShow: 1
				}
			);
			}else{
			//打开查询窗口
			console.log(config);
			debugger
			var pageConfig = {
				url: getRootPath() + '/queryPage/advanced?code='+config.code+'&data_auth_code='+config.dataAuthCode+'&uuid='+uuid+'&advancedId=' + id,
				width: '900px',
				title: '高级查询'
			}
			nsFrame.popPageConfig(pageConfig);
		}
	}
	return {
		init:init,  				//初始化方法
	}
})(jQuery);