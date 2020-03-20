nsUI.expContent = (function ($) {
    // 添加判断数组中是否有某值的方法
    function isInArray(array, element) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] == element) {
                return true;
            }
        }
        return false;
    }
    // 小键盘键值 96-105 .是110 
    // 48-57 .是190 空格是32
    var fields = [];
    // 监听键盘保存值
    function ulShow(e) {
        if (expContent.$expContent.text().indexOf("\\") != -1 && expContent.$expContent.text().length - 2 != expContent.$expContent.text().indexOf("\\") - 1) {
            // 如果删除字符时，总字符长度 -2 后不等于 \ 的 -1 位置，那么说明还有字符，则重新进行匹配
            var index = expContent.$expContent.text().indexOf("\\");
            var length = expContent.$expContent.text().length;
            expContent.searchField = expContent.$expContent.text().substring(index, length - 1);
            expContent.searchItem();
            return;
        } else {
            // 如果有，则是关闭列表
            var $ul = $("#searchFields");
            expContent.searchField = "";

            $ul.remove();
            expContent.addEvent();
            e.returnValue = false;
        }
    }

    function saveFields() {
        $(document).off();
        $(document).on('keydown', function (e) {
            // 按下删除键的时候
            if (e.keyCode == 8) {
                ulShow(e);
            }
        })
    }
    // 主体
    var expContent = {
        // 是否是弹窗
        isPopupBox: false,
        // 功能按钮数组
        assistBtnWords: [],
        // 用来保存转换出的字段
        itemExpContent: "",
        itemExpContent1: "",
        // container: "dialog-expcontent",
        container: "dialog-expcontent",
        // changeHandler
        init: function (config) {
            var _this = this;
            this.config = config;

            this.expressionField = config.id;

            config.printFields = this.printFields;
            // ajax配置
            this.listAjax = typeof (config.listAjax) != 'undefined' && typeof (config.listAjax) != 'null' ? config.listAjax : console.error("ajax配置有误");
            // ajax获取到的用来检索字段的数据
            this.listAjaxFields = config.listAjaxFields;
            // 拿到检索字段
            nsVals.ajax(this.listAjax, function (data) {
                if (data.success) {
                    _this.searchFields = data[_this.listAjax.dataSrc];
                    if (typeof (config.value) != 'undefined') {
                        // 读取value值
                        getFieldsShow();
                    }
                } else {
                    console.error("ajax出错");
                }
            })
            // 拿到功能按钮
            this.assistBtnWords = config.assistBtnWords;
            // changeHandler
            this.changeHandler = config.changeHandler;

            $('#' + this.container).attr('style', 'position:absolute;');

            // console.log(this);

            this.getElement();
            this.addEvent();
            this.addButton();
            this.closeWindow();
            saveFields();
        },
        // 弹窗主体内容
        // 得到一些节点
        getElement: function () {
            // 规则内容
            this.$expContent = $('#expContent');
            // 取消按钮按钮
            this.$close = $('.modal-footer > button:contains("关闭")').eq(0);
            // 点x取消
            this.$xclose = $('.close');
        },
        addEvent: function () {
            var _this = this;
            this.$expContent.off();
            this.$expContent.on('keydown', function (e) {
                if (e.keyCode == 220) {
                    // 将已经输入的数据变为使用span标签包裹
                    var contentSpan = "";
                    var len = _this.$expContent.contents().length;
                    $.each(_this.$expContent.contents(), function (index, item) {
                        if (item.nodeType != 1) {
                            contentSpan += '<span contenteditable="true">' + item.nodeValue + '</span>'
                        } else {
                            contentSpan += item.outerHTML;
                        }
                    })
                    _this.$expContent.html(contentSpan);
                    set_focus();
                    // 显示下拉列表
                    _this.searchItem();
                }
            });
            removeJqError();
        },
        getListHtml: function (top, left, searchFields) {
            var _this = this;
            // 获取文本框的offset
            var parentTop = _this.$expContent.offset().top;
            var parentLeft = _this.$expContent.offset().left;
            // 创建列表
            var $ul = $('<ul contenteditable="false" class="search-fields" id="searchFields" style="position:absolute;z-index:9999;top:' + (parentTop + top + 20) + 'px;left:' + (left + parentLeft) + 'px;"></ul>');
            $.each(searchFields, function (index, value) {
                if (index == 0) {
                    var $li = $('<li class="search-fields-item select-item" id="searchitem" data-itemid="' + value[expContent.config.primaryKey] + '" data-index="' + index + '">' + value[expContent.config.displayField] + '</li>');
                } else {
                    var $li = $('<li class="search-fields-item" id="searchitem" data-itemid="' + value[expContent.config.primaryKey] + '" data-index="' + index + '">' + value[expContent.config.displayField] + '</li>');
                }
                $li.on('mousedown', function (ev) {
                    ev.preventDefault();
                    return false;
                })
                // 点击某一项时
                $li.on('click', function (e) {
                    _this.selectCurrent($ul, $(this));
                })
                $ul.append($li);
                $(document).on('mousedown', function (ev) {
                    ev.preventDefault();
                    return false;
                })
            });
            $(document).off('click');
            $(document).on('click', function (e) {
                if (!$(e.target).is($ul) && $(e.target).parents('#searchFields').length === 0) {
                    _this.$expContent.html(_this.$expContent.html().replace("\\" + _this.searchField, ""));
                    ulShow(e);
                }
                if ($(e.target).is($('#' + _this.container))) {
                    _this.clearAll();
                }
                set_focus(e.target);
            })
            // 将列表添加到body中
            if (searchFields.length != 0) {
                $("body").append($ul);
            }
            // 使用键盘选择检索值
            _this.searchItemByKey();
            _this.searchItem();
        },
        // 使用键盘选择检索值
        searchItemByKey: function () {
            var _this = this;
            var $ul = $("#searchFields");
            _this.$expContent.off();
            _this.$expContent.on('keydown', function (e) {
                // 上键
                if (e.keyCode == 38) {
                    // 禁止默认行为
                    e.preventDefault();
                    // 移除当前类名，给下一节点添加类名
                    var $current = $ul.find(".select-item");
                    if (typeof ($current.prev().html()) != 'undefined') {
                        $current.removeClass('select-item');
                        $current.prev().addClass('select-item');
                    }
                }
                // 下键
                if (e.keyCode == 40) {
                    // 禁止默认行为
                    e.preventDefault();
                    // 移除当前类名，给上一节点添加类名
                    var $current = $ul.find(".select-item");
                    if (typeof ($current.next().html()) != 'undefined') {
                        $current.removeClass('select-item');
                        $current.next().addClass('select-item');
                    }
                }
                // 选择选中的li 确认键
                if (e.keyCode == 13) {
                    // 禁止默认行为
                    e.preventDefault();
                    // 选择当前类名有selectItme的li
                    var $current = $ul.find(".select-item");
                    _this.selectCurrent($ul, $current);
                }
            })
        },
        // 选择当前li
        selectCurrent: function ($ul, $this) {
            var _this = this;
            // 先隐藏列表然后继续操作
            $ul.remove();
            // 鼠标点击选择后将 \ 去除
            var allHtml = _this.$expContent.html();
            _this.$expContent.html(allHtml.replace("\\" + _this.searchField, ""));
            // 显示后将搜索字段清空 和 保存字段清空
            _this.searchField = "";
            // 将选择内容显示在div中
            var $span = $('<span contenteditable="false" data-itemid="' + $this.data('itemid') + '">' + $this.html() + '</span>');
            // 保存起来，如果检索有数组有值，则从检索后的数组中取值，否则从最初数组中取值
            fields[fields.length] = _this.afterSearchFields.length == 0 ? _this.searchFields[$this.data("index")] : _this.afterSearchFields[$this.data("index")];
            // 显示选择的字符
            _this.$expContent.append($span);
            set_focus();
            // 为下一次输入添加事件
            _this.addEvent();
        },
        // 键盘检索获取到的值
        searchItem: function (top, left) {
            var _this = this;
            // 获取当前行高作为top值
            _this.searchField = typeof (_this.searchField) != 'undefined' ? _this.searchField : "";
            var top = typeof (top) != 'undefined' ? top : _this.$expContent.css('lineHeight');
            // 获取最后一个节点的位置，来显示下拉列表的位置
            var span = _this.$expContent.find('span');
            var lastSpan = span[span.length - 1];
            var left = typeof (left) != 'undefined' ? left : (lastSpan ? lastSpan.offsetLeft : 0) + 10;
            // 事件
            _this.$expContent.on('keyup', function (e) {
                var event = e || window.event; //兼容IE
                // 以下是正式代码
                if (e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 37 || e.keyCode == 39) {
                    // 去除以后的事件
                    //取消事件相关的默认行为
                    if (event.preventDefault) //标准技术
                        event.preventDefault();
                    if (event.returnValue) //兼容IE9之前的IE
                        event.returnValue = false;
                    return false; //用于处理使用对象属性注册的处理程序
                }
                var $ul = $('#searchFields');
                _this.afterSearchFields = [];
                if (e.keyCode != 8) {
                    _this.searchField += e.key;
                }
                _this.searchField = _this.searchField.replace("\\", "");
                // console.log(_this.searchField);
                $.each(_this.searchFields, function (index, value) {
                    // 根据设置来遍历获取到可以搜索的字段
                    $.each(_this.listAjaxFields, function (i, item) {
                        for (var key in item) {
                            var name = item["name"];
                            var searchConfirm = item["search"];
                            if (searchConfirm) {
                                if (typeof (value[name]) != 'undefined' && value[name].toString().substring(0, _this.searchField.length) == _this.searchField) {
                                    if (!isInArray(_this.afterSearchFields, value)) {
                                        _this.afterSearchFields.push(value);
                                    }
                                }
                            }
                        }
                    })
                })
                // 显示
                $ul.remove();
                _this.getListHtml(parseFloat(top), left, _this.afterSearchFields);
                // 去除以后的事件
                //取消事件相关的默认行为
                if (event.preventDefault) //标准技术
                    event.preventDefault();
                if (event.returnValue) //兼容IE9之前的IE
                    event.returnValue = false;
                return false; //用于处理使用对象属性注册的处理程序
            })
        },
        // 添加按钮和添加按钮选择事件
        addButton: function () {
            var _this = this;
            var assistBtnWords = _this.assistBtnWords;
            var $assistBtn = $('<div class="assist-btn" id="assistBtn"></div>');
            $.each(assistBtnWords, function (index, value) {
                if (value == 'and' || value == 'or') {
                    var $btn = $('<button class="assist-btn-item btn btn-white" id="assistItem">' + " " + value + " " + '</button>');
                } else {
                    var $btn = $('<button class="assist-btn-item btn btn-white" id="assistItem">' + value + '</button>');
                }
                $btn.on('click', function () {
                    return false;
                });
                $btn.on('click', function () {
                    if ($(this).text() != "清空") {
                        _this.$expContent.get(0).innerHTML += $(this).text();
                        set_focus();
                    } else {
                        _this.clearAll();
                        _this.$expContent.empty();
                    }
                });
                $assistBtn.append($btn);
            });
            $('#itemExpContent').append($assistBtn);
        },
        printFields: function () {
            // 重新绑定事件
            saveFields();
            var _this = expContent;
            // 用于计算的字符串
            var calculateStr = "";
            // 保存左括号和有括号的个数 
            var leftBracket = 0;
            var rightBracket = 0;

            // 保存格式化后的数据
            _this.itemExpContent = "";
            // 保存格式化前名字的数据
            _this.itemExpContent1 = "";
            $.each(_this.$expContent.contents(), function (index, item) {
                var $item = $(item);
                if (item.nodeType == 1 && typeof ($item.data("itemid")) != 'undefined') {
                    _this.itemExpContent += "${" + $item.data("itemid") + "}";
                    _this.itemExpContent1 += $item.text();
                } else if (item.nodeType == 1) {
                    _this.itemExpContent += item.innerText;
                    _this.itemExpContent1 += item.innerText;
                } else {
                    _this.itemExpContent += item.nodeValue;
                    _this.itemExpContent1 += item.nodeValue;
                }
            })

            var data = {};
            data[_this.expressionField] = _this.itemExpContent;
            data[_this.config.expressionField1] = _this.itemExpContent1;
            return data;

            /* 
            var validStr = _this.itemExpContent.replace(/\$/g, "").replace(/\{/g, "").replace(/\}/g, "").replace(/and/g, "&").replace(/or/g, "|").replace(/\<\>/g, "|");
            for (var i = 0; i < validStr.length; i++) {
                var value = validStr[i];
                if (value == "(") {
                    leftBracket++;
                }
                if (value == ")") {
                    rightBracket++
                }
            }
            // 如果左右括号不匹配，则会报错
            if (leftBracket != rightBracket) {
                // 因为不支持插入操作，所以有错误后清空重新输入
                nsalert("错误:括号数量不一致,请重新输入");
                _this.clearAll();
                return;
            } else {
                if (validStr.length != 0) {
                    try {
                        var num = eval(validStr);
                    } catch (error) {
                        nsalert("输入格式有误");
                        return;
                    }
                    // 如果可以计算或者计算出来为number类型，则可以传值
                    if (typeof (num) == 'boolean' || typeof (num) == "number") {
                        // 添加data-*
                        var data = {};
                        data[_this.expressionField] = _this.itemExpContent;
                        data[_this.config.expressionField1] = _this.itemExpContent1;
                        return data;
                    } else {
                        return nsalert("数据错误，请重新输入");
                    }
                } else {
                    // 如果为空则设置为空值
                    // 添加data-*
                    return "";
                }
            } */
        },
        // 关闭时事件
        closeWindow: function () {
            var _this = this;
            _this.$close.on('click', function () {
                _this.clearAll();
            });
            _this.$xclose.on('click', function () {
                _this.clearAll();
            });
        },
        // 清空
        clearAll: function () {
            var _this = this;
            // 搜索字段清空
            _this.searchField = "";
            // 搜索字段搜索出来的数据清空
            typeof (_this.afterSearchFields) != 'undefined' && _this.afterSearchFields.length > 0 ? _this.afterSearchFields.length = 0 : _this.afterSearchFields = [];
        }
    };

    // 定位光标一直在最后
    var frontDom;

    function set_focus(el) {
        removeJqError();
        el = el ? el : expContent.$expContent.get(0);
        if (el.localName == 'input' || el.localName == 'textarea') {
            el.focus();
            frontDom = el;
        } else {
            // 如果点击可编辑div或者input之外的则失焦
            if (typeof ($(el).attr('contenteditable')) == 'undefined') {
                // console.log(frontDom);
                frontDom.blur();
                return;
            } else {
                frontDom = el;
                //el=el[0];  //jquery 对象转dom对象
                el.focus();
                if ($.support.msie) {
                    var range = document.selection.createRange();
                    this.last = range;
                    range.moveToElementText(el);
                    range.select();
                    document.selection.empty(); //取消选中
                } else {
                    var range = document.createRange();
                    range.selectNodeContents(el);
                    range.collapse(false);
                    var sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        }
    }

    function removeJqError() {
        // 为了让jquery validata 不报错禁止事件往下执行
        expContent.$expContent.on('focusin', function (e) {
            var event = e || window.event; //兼容IE
            //取消事件相关的默认行为
            if (event.preventDefault) //标准技术
                event.preventDefault();
            if (event.returnValue) //兼容IE9之前的IE
                event.returnValue = false;
            return false; //用于处理使用对象属性注册的处理程序
        })
        expContent.$expContent.on('focusout', function (e) {
            var event = e || window.event; //兼容IE
            //取消事件相关的默认行为
            if (event.preventDefault) //标准技术
                event.preventDefault();
            if (event.returnValue) //兼容IE9之前的IE
                event.returnValue = false;
            return false; //用于处理使用对象属性注册的处理程序
        })
        expContent.$expContent.on('keyup', function (e) {
            var event = e || window.event; //兼容IE
            //取消事件相关的默认行为
            if (event.preventDefault) //标准技术
                event.preventDefault();
            if (event.returnValue) //兼容IE9之前的IE
                event.returnValue = false;
            return false; //用于处理使用对象属性注册的处理程序
        })
    }

    // 读值展示
    function getFieldsShow() {
        var s = expContent.config.value;
        // "${446}>5.6 and ${557}<6.9 or ${568}<5.6 and (${446}<>5.6)"
        // var value = s;
        var value = '${11}*${12}sfsdfsdf';
        var assistBtnWords = expContent.assistBtnWords;
        var words = getWords(value);
        // 进行空格去除处理
        for (var i = 0; i < words.length; i++) {
            var str = words[i].replace(/^\s*|\s*$/g, "").replace("$", "").replace("{", "").replace("}", "");
            // 如果为空则删除
            if (str.length == 0) {
                words.splice(i, 1);
                continue;
            } else {
                // 给 and 和 or 加空格
                if (str == 'and' || str == 'or') {
                    str = " " + str + " ";
                }
            }
            words[i] = str;
        }
        // 进行双符号合并操作
        $.each(words, function (index, item) {
            if (isInArray(assistBtnWords, item) && isInArray(assistBtnWords, words[index + 1])) {
                words.splice(index, 1, item + words[index + 1])
                words.splice(index + 1, 1)
            }
        })
        // 与数据进行替换显示
        for (var i = 0; i < words.length; i++) {
            $.each(expContent.searchFields, function (index, item) {
                if (words[i] == item[expContent.config.primaryKey]) {
                    words[i] = item;
                }
            })
        }
        // 显示
        $.each(words, function (index, item) {
            if (typeof (item) == "object") {
                expContent.$expContent.get(0).innerHTML += '<span data-itemid="' + item[expContent.config.primaryKey] + '">' + item[expContent.config.displayField] + '</span>';
            } else {
                expContent.$expContent.get(0).innerHTML += item;
            }
        })
    }

    function getWords(value) {
        var arr = [];
        var index = 0;
        var assistBtnWords = expContent.assistBtnWords;
        // 根据功能按钮的单个运算符号分隔
        for (var i = 0; i < value.length; i++) {
            // 当前元素在按钮中且下一个元素不在按钮中
            if (isInArray(assistBtnWords, value[i])) {
                var frontStr = value.substring(index, i);
                var middleStr = value[i];
                index = i + 1;
                arr.push(frontStr, middleStr);
            }
        }
        arr.push(value.substring(index));
        // 剔除 and or <> 等
        $.each(arr, function (index, item) {
            $.each(assistBtnWords, function (idx, btn) {
                // 当前元素在数组中，切当前按钮长度为1
                if (item.indexOf(btn) != -1 && btn.length > 1 && item != btn) {
                    arr.splice(index, 1, item.split(btn)[0]);
                    arr.splice(index + 1, 0, btn);
                    arr.splice(index + 2, 0, item.split(btn)[1]);
                }
            })
        })
        //使用正则再次分隔
        $.each(arr, function (index, item) {
            var currentArr = item.match(/(\w*)(\$\{\w*\})(\w*)/m);
            if ($.type(currentArr) != 'null') {
                var len = currentArr.length;
                for (var i = 0; i < len; i++) {
                    item = currentArr[i];
                    if (item == '') {
                        currentArr.splice(i, 1);
                        len--;
                    }
                }
                if (len > 2) {
                    arr.splice(index, 1);
                    for (var i = 1; i < len; i++) {
                        item = currentArr[i];
                        arr.push(item);
                    }
                }
            }
        })
        return arr;
    }

    // 初始化函数
    function init(config) {
        if (config != "" && typeof (config) != "undefined") {
            expContent.init(config);
        } else {
            console.error("配置文件出错");
        }
    }
    return {
        init: init
    }
})(jQuery);