var customerDetail = (function ($) {
    var configManage = {
        config: {},
        originalConfig: {},
        setDefault: function (outerConfig) {
            this.config = $.extend(true, {}, outerConfig);
            this.originalConfig = $.extend(true, {}, outerConfig);
            var defaultConfig = {

            }
            nsVals.setDefaultValues(this.config, defaultConfig);
        },
        getConfig: function (outerConfig) {
            this.setDefault(outerConfig);
            return this.config;
        }
    }

    var dataManage = {
        getValue: function (config, cb) {
            config.getValueAjax.data = {
                id: config.pageParam.data.customerId
            };
            nsVals.ajax(config.getValueAjax, function (res) {
                if (res.success) {
                    var resData = res[config.getValueAjax.dataSrc];
                    if (resData instanceof Object) {
                        config.serveData = $.extend(true, {}, resData);
                    } else if (resData instanceof Array) {
                        config.serveData = $.extend(true, [], resData);
                    }
                } else {
                    config.serveData = {};
                }
                cb && cb();
            })
        }
    }

    var panelManage = {
        root: {
            init: function () {
                var $customerDetail = $('#customerDetail');
                // $customerDetail.append("暂无数据");
            },
            setValue: function (data) {
                var formJson = {
                    id: "customerDetail",
                    format: "standard",
                    formSource: 'staticData',
                    moreText: '更多',
                    form: [
                        {
                            id: 'name',
                            label: '姓名',
                            type: 'text',
                            value: data.customerName,
                            acts: 'title',
                        },{
                            id: 'otherarea',
                            label: '所属区域',
                            type: 'provinceSelect',
                            value: data.customerLocationAddress,
                        },{
                            id: 'area',
                            label: '地址',
                            type: 'text',
                            value: data.customerAddress,
                            acts: 'qqMapByName',//baiduMapByName
                        }, {
                            id: 'customerState',
                            label: '意向客户',
                            type: 'radio',
                            subdata:[
                                {
                                    value:0,
                                    text:'潜在客户'
                                }, {
                                    value:1,
                                    text:'意向客户'
                                }, {
                                    value:2,
                                    text:'合作客户'
                                }, {
                                    value:3,
                                    text:'沉默客户'
                                }, {
                                    value:4,
                                    text:'流失客户'
                                },
                            ],
                            value:data.customerState,
                            //subdata: data.customerState,
                            //value: ['0', '1'],
                            acts: 'block',
                        },{
                            id: 'customerHomephone',
                            label: '客户电话',
                            type: 'text',
                            value: data.customerHomephone,
                        }, {
                            id: 'people',
                            label: '所属人',
                            type: 'text',
                            value: data.ownerName,
                            acts: 'formlabel',
                            newline: true,
                        }, {
                            id: 'time',
                            label: '时间',
                            type: 'datetime',
                            acts: 'datetime',
                            value: data.customerWhenCreated,
                            newline: true,
                        }
                    ]
                };
                formPlane.formInit(formJson);
            },
            getValue: function () { },
        },
        contactVoList: {
            init: function () {
                var $customerContact = $('#customerContact');
                $customerContact.append("联系人(0)");
            },
            setValue: function (data) {
                if ($.isEmptyObject(data)) {
                    return;
                }
                if (data.length > 3) {
                    var customerContact = data.slice(0, 3);
                } else {
                    var customerContact = data;
                }
                var $customerContact = $('#customerContact');
                var contactContent = '<div class="card-header"><div class="title">' +
                    '联系人(<span class="customer-contact-num" id="attentionState">' + data.length + '</span>' +
                    ')</div>' +
                    (data.length > 3 ?
                        '<div class="card-control"><button class="btn">更多<i class="fa-angle-right"></i></button></div>' : "") +
                    '</div>' +

                    '<div id="customerContent">' +
                    '</div>';
                $customerContact.empty();
                $customerContact.append(contactContent);
                var $customerContent = $('#customerContent');
                $.each(customerContact, function (index, item) {
                    $customerContent.append(
                        '<div id="customerContactItem" class="card-body">' +

                        '<div class="block-table-user-photo"><span class="text user-photo " nsindex="0"><i class="icon-user"></i></span></div>' +
                        /* '<div class="card-media">' +
                        '<img src="' + (item.customerHeadImg ? item.customerHeadImg : ' ') + '" alt="">' +
                        '</div>' + */

                        '<div class="card-block">' +
                        '<div class="card-title">' + (item.contactName ? item.contactName : '') + ' <span>' + (item.contactTitle ? item.contactTitle : '') + ' </span> </div>' +
                        '<div class="card-text">' + (item.contactOndutyFlag ? "已关注" : "未关注") + '</div>' +

                        '</div>' +
                        '<div class="card-control"><button class="btn btn-icon btn-info"><i class="icon-ellipsis-circle-h"></i></button></div>' +
                        '</div>');
                })
            },
            getValue: function () { },
        },
        opportunityVoList: {
            init: function () {
                var $customerOfferSheet = $('#customerOfferSheet');
                $customerOfferSheet.append("机会(0)");
            },
            setValue: function (data) {
                if ($.isEmptyObject(data)) {
                    return;
                }
                if (data.length > 3) {
                    var customerOfferSheet = data.slice(0, 3);
                } else {
                    var customerOfferSheet = data;
                }
                var $customerOfferSheet = $('#customerOfferSheet');
                var offerSheetContent = '<div class="card-header"><div class="title">' +
                    '机会(<span class="customer-offer-sheet-num" id="attentionState">' + data.length + '</span>)' +
                    '</div>' +
                    (data.length > 3 ?
                        '<div class="card-control"><button class="btn">更多<i class="fa-angle-right"></i></button></div>' : "") +
                    '</div>' +

                    '<div id="customerOfferSheetContent">' +
                    '</div>';
                $customerOfferSheet.empty();
                $customerOfferSheet.append(offerSheetContent);
                var $customerOfferSheetContent = $('#customerOfferSheetContent');
                $.each(customerOfferSheet, function (index, item) {
                    $customerOfferSheetContent.append(
                        '<div id="customerOfferSheetContentItem" class="card-body">' +
                        '<div class="card-block">' +
                        '<div class="card-title">' + (item.opportunityName ? item.opportunityName : '') + '</div>' +
                        '<div class="card-text">' + (item.opportunityStage ? item.opportunityStage : '') + '</div>' +
                        '<div class="card-text">' +
                        '<span">' + (item.opportunityOwnerName ? item.opportunityOwnerName : '') + ' </span>' +
                        '<span>' + moment(item.opportunityWhenCreated).format('YYYY/MM/DD HH:mm') + '</span>' +
                        '</div>' +
                        '</div>' +
                        '<div class="card-control">' +
                        '<span>' + (item.opportunityPredictSaleAmounts ? '￥' + item.opportunityPredictSaleAmounts : '') + '</span>' +
                        '<button class="btn"><i class="icon-arrow-right-o"></i></button>' +
                        '</div>' +
                        '</div>'
                    );
                })
            },
            getValue: function () { },
        },
        touchVoList: {
            loadNum: 0,
            pageNum: 3,
            init: function () {
                var $customerDynamic = $('#customerDynamic');
                $customerDynamic.append("接触(0)");
            },
            setValue: function (data) {
                var _this = this;
                if ($.isEmptyObject(data)) {
                    return;
                }
                var customerDynamicData = data;
                var $customerDynamic = $('#customerDynamic');
                var dynamicContent = '<div class="card-header">' +
                    '<div class="title">' + '接触' +
                    '</div>' +
                    (customerDynamicData.length > 3 ? '<div class="card-control">' +
                        '<button class="btn"><i class="icon-list-search-o"></i></button>' +
                        '</div>' : '')
                    +

                    '</div>' +
                    '<div id="customerDynamicContent" class="time-line">' +
                    '</div>'
                // '<div class="default-tips"><p>暂无数据</p></div>' +
                // '<div class="nav-form"><div class="btn-group"><button class="btn">新增+</button></div></div>';
                $customerDynamic.empty();
                $customerDynamic.append(dynamicContent);
                //动态内容
                var viewDynamic = customerDynamicData.slice(0, _this.pageNum);
                _this.setDynamicContent(viewDynamic);
                //懒加载
                $(document).on('touchmove', function () {
                    $(document).on('touchend', function (e) {
                        e = e || window.event;
                        (function handleMove(e) {
                            var scrollT = document.documentElement.scrollTop || document.body.scrollTop; //滚动条的垂直偏移
                            var scrollH = document.documentElement.scrollHeight || document.body.scrollHeight; //元素的整体高度
                            var clientH = document.documentElement.clientHeight || document.body.clientHeight; //元素的可见高度
                            if (scrollT == scrollH - clientH) {
                                var currentPageNum = _this.pageNum * _this.loadNum;
                                if (currentPageNum < customerDynamicData.length) {
                                    viewDynamic = customerDynamicData.slice(currentPageNum, currentPageNum + _this.pageNum);
                                    _this.setDynamicContent(viewDynamic);
                                }
                            }
                        })(e)
                    })
                })
            },
            //此处展示动态
            setDynamicContent: function (customerDynamic) {
                var _this = this;
                var $customerDynamicContent = $('#customerDynamicContent');
                $.each(customerDynamic, function (index, item) {
                    $customerDynamicContent.append(_this.getDynamicHtml(index, item));
                })
                // _this.addEventForBtn();
                _this.loadNum++;
            },
            //获得当前动态html
            getDynamicHtml: function (index, item, isComment) {
                var _this = this;
                //console.log(index, _this.pageNum * _this.loadNum);
                var likeStr = '';
                var commentStr = '';
                //点赞
                for (var idx = 0; typeof item.like != 'undefined' && idx < item.like.length; idx++) {
                    var itm = item.like[idx];
                    likeStr += '<span class="card-text">' + itm.customerName + '</span>';
                }
                //评论
                for (var idx = 0; typeof item.comment != 'undefined' && idx < item.comment.length; idx++) {
                    var itm = item.comment[idx];
                    commentStr += '<div class="comment-item">' +
                        '<span>' + itm.commentName + ':</span>' +
                        '<span>' + itm.commentContent + '</span>' +
                        '</div>';
                }
                //本条动态
                var dynamicContentItem = '<div class="card-body">' +
                    '<div class="comment-time">' +
                    '<i class="fa-clock-o"></i>' +
                    '<span>' + moment(item.whenCreated).calendar() + '</span>' +
                    '</div>' +
                    '<div class="card-block">' +
                    '<div class="card-title">' + (item.ownerName ? item.ownerName : '') + '</div>' +
                    '<div class="dynamic-content">' +
                    '<div class="card-subtitle"><a href="">接触详情：' + (item.description ? item.description : '') + '</a></div>' +
                    '<div class="card-subtitle"><a href="">接触阶段：' + (item.opportunityName ? item.opportunityName : '') + '</a></div>' +
                    // '<div class="card-text">' + (typeof (item.reportLocation) == 'undefined' ? "" : '<i class="fa-map-marker"></i>' + item.reportLocation) + '</div>' +
                    '</div>';
                return dynamicContentItem;
            },
            getValue: function () { },
        },
        init: function () {
            this.root.init();
            this.contactVoList.init();
            this.opportunityVoList.init();
            this.touchVoList.init();
        },
        renderPanel: function (config) {
            this.init();
            this.root.setValue(config.serveData);
            for (var key in config.serveData) {
                if (config.serveData.hasOwnProperty(key)) {
                    var element = config.serveData[key];
                    if (typeof this[key] != 'undefined') {
                        this[key].setValue(element);
                    }
                }
            }
        }
    }

    function getConfig(outerConfig) {
        return {
            config: configManage.getConfig(outerConfig)
        }
    }

    function init(outerConfig) {
        var allConfig = getConfig(outerConfig);
        dataManage.getValue(allConfig.config, function () {
            panelManage.renderPanel(allConfig.config);
        });
       // console.log(allConfig);
    }

    return {
        init: init
    }
})(jQuery)
