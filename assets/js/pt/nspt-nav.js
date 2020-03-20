typeof NetstarUI == 'undefined' ? NetstarUI = {} : "";
NetstarUI.buildNav = function (outerConfig) {
    /**
     * @msg: 在指定位置构建导航
     * @param
     *      //这里都是默认值
     *      id: "",                                 //要放置的div的id
	 *		menuIdField:"id",                       //菜单的id字段  id
	 *		menuParentIdField:"parentId",           //菜单父级id字段 
	 *		menuChildIdField:"children",             //菜单子级id字段
	 *		menuNameField:"name",                   //菜单名字字段
	 *		menuUrlField:"url",                     //菜单链接字段
	 *		singlePageModeField:"singlePageMode",   //是否是单页面字段
     *      convertToTree:false,                    //是否需要转换为树
     * @return: {void}
     */
    (function () {
        var config = {};
        var timeOut;
        function init(outerConfig) {
            setDefault(outerConfig);
            var ajaxConfig = config.ajaxConfig;
            var id = config.id;
            $('#' + id).empty();
            nsVals.ajax(ajaxConfig, function (res) {
                var data = res[ajaxConfig.dataSrc];
                config.convertToTree
                    ? data = nsDataFormat.convertToTree(data, config.menuIdField, config.menuParentIdField, config.menuChildIdField)
                    : "";
                appendNavBar($('#' + id), data);
                $('#' + id).find('li').css('position', 'relative');
                $('.pt-top-nav-block[ns-type="multilevel"]').css('position', 'absolute').css('top', 0);
            });
        }
        function setDefault(outerConfig) {
            config = $.extend(true, {}, outerConfig);
            var defaultConfig = {
                menuIdField: 'id',
                menuClassField: 'class',
                menuParentIdField: 'parentId',
                menuChildIdField: 'children',
                menuNameField: 'name',
                menuUrlField: 'url',
                singlePageModeField: 'singlePageMode',
                convertToTree: 'false',
            };
            nsVals.setDefaultValues(config, defaultConfig);
            typeof config[config.singlePageModeField] == 'boolean' ? "" : config[config.singlePageModeField] = true;
        }
        function appendNavBar($parent, data) {
            if ($parent.get(0).localName != 'ul') {
                if ($parent.find('ul').length == 0) {
                    $parent.append('<ul></ul>');
                }
                $parent = $parent.find('ul').eq(0);
            }
            //rowNavVue.getJsp("/demos/table/rowstate.jsp", "行状态")
            $.each(data, function (index, item) {
                var hasChildren = typeof item[config.menuChildIdField] == 'object' && !$.isEmptyObject(item[config.menuChildIdField]);
                typeof item[config.singlePageModeField] == 'boolean' ? "" : item[config.singlePageModeField] = true;
                var $li = $('<li class="pt-top-menu-item">' +
                    '<div class="pt-top-menu-item-row">' +
                    (item[config.singlePageModeField] && !hasChildren
                        ? '<a class="pt-nav-item" href="javascript:NetstarUI.labelpageVm.loadPage(\'' + item[config.menuUrlField] +
                        '\',\'' + item[config.menuNameField] + '\');">'
                        : '<a class="pt-nav-item" href="' + (!hasChildren ? (getRootPath() + "/" + item[config.menuUrlField]) : "javascript:void(0);") + '" > ') +
                    '<i class="' + item.ico + '"></i><span>' + item[config.menuNameField] + '</span></a></div>' +
                    '</li>');
                $parent.append($li);
                if (hasChildren) {
                    $li.append('<div ' + ($li.eq(0).parent().parent().attr("id") == config.id ? '' : 'ns-type="multilevel"') + ' class="pt-top-nav-block hide"><ul></ul></div>');
                    $li.addClass('dropdown-arrow');
                    $li.on('mouseenter', function (index, item) {
                        clearTimeout(timeOut);
                        var $this = $(this);
                        var offsetRight = document.body.clientWidth - $this.offset().left - $this.width();
                        if (offsetRight >= $this.width()) {
                            $this.children('.pt-top-nav-block[ns-type="multilevel"]').eq(0).css('left', $this.width() + 'px');
                        } else {
                            $this.children('.pt-top-nav-block[ns-type="multilevel"]').eq(0).css('right', $this.width() + 'px');
                        }
                        $this.children('.pt-top-nav-block').eq(0).removeClass('hide');
                        $li.siblings().on('mouseenter', function () {
                            $li.find('.pt-top-nav-block').addClass('hide');
                        });
                        $(document).off('click');
                        $(document).on('click', function (e) {
                            if ($(e.target).parents('ul').eq(0).parent().attr('id') == config.id) {
                                $('#' + config.id).find('.pt-top-nav-block').addClass('hide');
                            }
                        });
                    });
                    $("#" + config.id).children('ul').on('mouseleave', function () {
                        clearTimeout(timeOut);
                        timeOut = setTimeout(function () {
                            $("#" + config.id).find('.pt-top-nav-block').addClass('hide');
                        }, 500);
                    });
                    appendNavBar($li.find('ul'), item[config.menuChildIdField]);
                }
            });
        }
        return {
            init: init
        };
    })().init(outerConfig);
};