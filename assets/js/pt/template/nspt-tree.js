NetstarTemplate.tree = (function(){
    var configsById = {};
    var config = {};
    var domTextManage = {
        removeTitle : '删除',
        renameTitle : '编辑',
        addTitle : '新增',
        removeIdSuffix : 'removeBtn_',
        addIdSuffix : 'addBtn_',
        addNodeIdSuffix : 'nsAdd_',
        addNodeName : '新增节点',
        copyNodeIdSuffix : 'nsCopy_',
    }
    // 位置管理
    var situationManage = {
        default : 'next',
        prev : 0,
        inner : 2,
        next : 1,
    }
    var situationTextManage = {
        prev : '之前',
        inner : '里',
        next : '之后',
    }
    var liClassManage = {
        tmpTargetNode_inner : 'tmptarget_inner',
        tmpTargetNode_prev : 'tmptarget_prev',
        tmpTargetNode_next : 'tmptarget_next',
    }
    var spanClassManage = {
        tmpTargetNode_inner : 'target-node-after',
        tmpTargetNode_prev : 'target-node-after',
        tmpTargetNode_next : 'target-node-after',
    }
    var defaultNodeConfig = {
        isPrev : true,
        isNext : true,
        isInner : true,
        isAdd : true,
        isEdit : true,
        isDelete : true,
        isDrag : true,
    }
    // 事件管理
    var eventManage = {
        prev : function(treeId, treeNodes, targetNode){
            var isPrev = targetNode !== null ? targetNode.isPrev : false;
            return isPrev;
        },
        next : function(treeId, treeNodes, targetNode){
            var isNext = targetNode !== null ? targetNode.isNext : false;
            return isNext;
        },
        inner : function(treeId, treeNodes, targetNode){
            var isInner = targetNode !== null ? targetNode.isInner : false;
            return isInner;
        },
        // 是否显示编辑按钮
        showRenameBtn : function(treeId, treeNode){
            return treeNode.isEdit;
        },
        beforeDrag : function(treeId, treeNodes){
            return treeNodes[0].isDrag;
        },
        // 拖拽过程中
        onDragMove : function(event, treeId, treeNodes){
            var $target = $(event.target);
            var targetClass = $target.attr('class');
            var targetId = $target.attr('id');
            var _config = getConfigByTreeId(treeId);
            if(targetClass == 'node_name' && targetId != (treeNodes[0].tId + '_span')){
                var $a = $target.parent();
                var aClass = $a.attr('class');
                var aClassArr = aClass.split(' ');
                for(var i=0; i<aClassArr.length; i++){
                    if(aClassArr[i] == 'tmpTargetNode_inner' || aClassArr[i] == 'tmpTargetNode_prev' || aClassArr[i] == 'tmpTargetNode_next'){
                        commonManage.removeDropClass(_config);
                        var $li = $a.closest('li');
                        _config.$moveTarget = $li;
                        $li.addClass(liClassManage[aClassArr[i]]);
                        var spanHtml = '<span class="' + spanClassManage[aClassArr[i]] + '"></span>';
                        $a.append(spanHtml);
                        break;
                    }

                }
            }
        },
        // 拖拽结束之前
        beforeDrop : function(treeId, treeNodes, targetNode, moveType, isCopy){
            if(!moveType){
                return false;
            }
            // config配置
            var _config = getConfigByTreeId(treeId);
            var idField = _config.idField;
            var textField = _config.textField;
            var moveNodeData = {
                id : treeNodes[0][idField],
                targetId : targetNode[idField],
                situation : situationManage[moveType]
            };
            var tipsInfo = "确定移动 “" + treeNodes[0][textField] + "” 节点到 “" + targetNode[textField] + "” 节点" + situationTextManage[moveType] + "吗？"
            nsConfirm(tipsInfo, function(isConfirm){
                if(isConfirm){
                    commonManage.moveNodeByAjax(moveNodeData, treeNodes[0], targetNode, moveType, _config, function(res, _config, plusData){
                        var _idField = _config.idField;
                        var _parentField = _config.parentField;
                        var _childField = _config.childField;
                        var _treeNode = plusData.treeNode;
                        var _targetNode = plusData.targetNode;
                        var zTree = $.fn.zTree.getZTreeObj(_config.treeId);
                        var nodes = zTree.getNodes();
                        var nodesList = zTree.transformToArray(nodes);
                        for(var i=0; i<nodesList.length; i++){
                            delete nodesList[i][_childField];
                            delete nodesList[i].isParent;
                        }
                        var __treeNode = _treeNode;
                        var __targetNode = _targetNode;
                        for(var i=0; i<nodesList.length; i++){
                            if(nodesList[i][_idField] == _treeNode[_idField]){
                                __treeNode = nodesList[i];
                            }
                            if(nodesList[i][_idField] == _targetNode[_idField]){
                                __targetNode = nodesList[i];
                            }
                        }

                        var _nodesList = nodesList;
                        switch(plusData.moveType){
                            case 'inner':
                                __targetNode.open = true;
                                __treeNode[_parentField] = _targetNode[_idField];
                                break;
                            case 'prev':
                                __treeNode[_parentField] = _targetNode[_parentField];
                                _nodesList = [];
                                for(var i=0; i<nodesList.length; i++){
                                    if(nodesList[i][_idField] != __treeNode[_idField] && nodesList[i][_idField] != _targetNode[_idField]){
                                        _nodesList.push(nodesList[i]);
                                    }else{
                                        if(nodesList[i][_idField] == _targetNode[_idField]){
                                            _nodesList.push(__treeNode);
                                            _nodesList.push(nodesList[i]);
                                        }
                                    }
                                }
                                break;
                            case 'next':
                                __treeNode[_parentField] = _targetNode[_parentField];
                                _nodesList = [];
                                for(var i=0; i<nodesList.length; i++){
                                    if(nodesList[i][_idField] != __treeNode[_idField] && nodesList[i][_idField] != _targetNode[_idField]){
                                        _nodesList.push(nodesList[i]);
                                    }else{
                                        if(nodesList[i][_idField] == _targetNode[_idField]){
                                            _nodesList.push(nodesList[i]);
                                            _nodesList.push(__treeNode);
                                        }
                                    }
                                }
                                break;
                        }
                        var _nodes = zTree.transformTozTreeNodes(_nodesList);
                        treeManage.refreshTreeByNodes(_nodes, _config);
                    });
                }else{
                    // 不移动
                }
            }, 'warning')
            commonManage.removeDropClass(_config);
            return false;
        },
        // 编辑前
        beforeEditName : function(treeId, treeNode){
			var zTree = $.fn.zTree.getZTreeObj(treeId);
            zTree.selectNode(treeNode);
            // 修改前添加类名 表示input正在修改
            var $span = $('#' + treeNode.tId + '_span');
            $span.addClass('pt-editing');
            zTree.editName(treeNode);
            var _config = getConfigByTreeId(treeId);
            _config.editing = true;
			return false;
        },
        // 修改前验证
        beforeRename : function(treeId, treeNode, newName, isCancel){
            var _config = getConfigByTreeId(treeId);
            if(!_config.editing){
                return true;
            }
            // 删除正在修改标识
            var $span = $('#' + treeNode.tId + '_span');
            $span.removeClass('pt-editing');
            if(newName.length == 0){
                _config.editing = false;
                var zTree = $.fn.zTree.getZTreeObj(treeId);
                zTree.cancelEditName();
                nsAlert("节点名称不能为空", 'warning');
                return false;
            }
            if(newName.length > _config.maxlength){
                _config.editing = false;
                var zTree = $.fn.zTree.getZTreeObj(treeId);
                zTree.cancelEditName();
                nsAlert("节点名称长度不能超过" + _config.maxlength, 'warning');
                return false;
            }
            // config配置
            var idField = _config.idField;
            var textField = _config.textField;
            var editNodeData = {};
            editNodeData[idField] = treeNode[idField];
            editNodeData[textField] = newName;
            commonManage.editNodeByAjax(editNodeData, _config, function(res, _config, plusData){
                _config.editing = false;
                var _idField = _config.idField;
                var _textField = _config.textField;
                var _treeId = _config.treeId;
                var zTree = $.fn.zTree.getZTreeObj(_treeId);
                if(res.success){
                    var data = res[plusData.dataSrc];
                    var _editNodeData = plusData.editNodeData;
                    var editNode = treeManage.getNodeById(_editNodeData[_idField], _idField, _config);
                    editNode[_textField] = data[_textField];
                }else{
                    nsAlert('修改节点失败');
                    console.error('修改节点失败');
                    console.error(res);
                }
                zTree.cancelEditName();
            });
            return false;
        },
        // 修改
        onRename : function(event, treeId, treeNode, isCancel){
        },
        // 删除方法
        removeNode : function(event, treeId, treeNode){
            var deleteData = {};
            // config配置
            var _config = getConfigByTreeId(treeId);
            var idField = _config.idField;
            var childField = _config.childField;
            if(treeNode[childField] && treeNode[childField].length > 0){
                nsAlert('该类别下有子节点,不可删除', 'error');
                console.error('该类别下有子节点,不可删除');
                return;
            }
            deleteData[idField] = treeNode[idField];
            commonManage.deleteNodeByAjax(deleteData, treeNode, _config, function(res, _config, plusData){
                var zTree = $.fn.zTree.getZTreeObj(_config.treeId);
                zTree.removeNode(plusData.treeNode);
            });
        },
        // 新增方法
        addNode : function(treeId, treeNode){
            // config配置
            var _config = getConfigByTreeId(treeId);
            var idField = _config.idField;
            var fromField = _config.fromField;
            var formData = NetstarComponent.getValues(_config.addDialogInputId); // 节点数据
            if(formData === false){
                return;
            }
            // 格式化表单获取数据
            var newNodeData = commonManage.getFormatFormData(formData, _config);
            // 新增节点相对节点id
            newNodeData[fromField] = treeNode[idField];
            commonManage.addNodeByAjax(newNodeData, _config, function(resData, _config, _newNodeData){
                var _idField = _config.idField;
                var _fromField = _config.fromField;
                var _textField = _config.textField;
                var _parentField = _config.parentField;
                var _treeId = _config.treeId;
                var newNode = $.extend(true, {}, defaultNodeConfig);
                newNode[_idField] = resData[_idField];
                newNode[_textField] = resData[_textField];
                newNode[_parentField] = resData[_parentField];
                var parentNode = treeManage.getNodeById(resData[_parentField], _idField, _config);
                if(!parentNode){
                    parentNode = null;
                }
                // 新增节点位置
                var index = -1;
                if(_newNodeData.situation == situationManage.next){
                    var _fromId = _newNodeData[_fromField];
                    index = treeManage.getIndexByParentNodeAndId(parentNode, _fromId, _config);
                }
                if(_newNodeData.situation == situationManage.inner && _config.isUnfiled && parentNode[_parentField] == null){
                    var parentNodeChild = parentNode[_config.childField];
                    index = parentNodeChild.length - 1;
                }
                // 新增节点
                var zTree = $.fn.zTree.getZTreeObj(_treeId);
                zTree.addNodes(parentNode, index, newNode);
                // 移除弹框
                // dialogManage.removeAddDialog();
            });
            
        },
        // 添加删除按钮
        addRemoveDom : function(treeId, treeNode){
            if(!treeNode.isDelete){
                return;
            }
            var _config = getConfigByTreeId(treeId);
            var $span = $("#" + treeNode.tId + "_span");
            var removeId = domTextManage.removeIdSuffix + treeNode.tId;
            var $remove = $('#' + removeId);
            // editNameFlag 修改名字时删除了不添加
            if(treeNode.editNameFlag || $remove.length > 0){
                // 已经生成
                return;
            }
            var textField = _config.textField;
            var removeHtml = '<span class="button remove" id="' + removeId + '" title="' + domTextManage.removeTitle + '" onfocus="this.blur();"></span>';
            var $spanParent = $span.parent();
            $spanParent.append(removeHtml);
            $remove = $('#' + removeId);
            $remove.off('click');
            $remove.on('click', function(event){
                nsConfirm("确定删除 “" + treeNode[textField] + "” 节点吗？", function(isConfirm){
                    if(isConfirm){
                        eventManage.removeNode(event, treeId, treeNode);
                    }else{
                        // 不删除
                    }
                }, 'warning')
            });
        },
        // 移除删除按钮
        removeRemoveDom : function(treeId, treeNode){
            if(!treeNode.isDelete){
                return;
            }
            var removeId = domTextManage.removeIdSuffix + treeNode.tId;
            var $remove = $('#' + removeId);
            $remove.remove();
        },
        // 添加新增按钮
        addAddDom : function(treeId, treeNode){
            if(!treeNode.isAdd){
                return;
            }
            var $span = $("#" + treeNode.tId + "_span");
            var addId = domTextManage.addIdSuffix + treeNode.tId;
            var $add = $('#' + addId);
            var isAdding = false; // 防止两次连续点击
            // editNameFlag 修改名字时删除了不添加
            if(treeNode.editNameFlag || $add.length > 0){
                // 已经生成
                return;
            }
            var addHtml = '<span class="button add" id="' + addId + '" title="' + domTextManage.addTitle + '" onfocus="this.blur();"></span>';
            $span.after(addHtml);
            $add = $('#' + addId);
            $add.off('click');
            $add.on('click', function(event){
                if(isAdding){
                    return;
                }
                isAdding = true;
                // eventManage.addNode(event, treeId, treeNode);
                var $this = $(this);
                dialogManage.initAddDialog(treeId, $this, treeNode);
            });
        },
        // 移除新增按钮
        removeAddDom : function(treeId, treeNode){
            if(!treeNode.isAdd){
                return;
            }
            var addId = domTextManage.addIdSuffix + treeNode.tId;
            var $add = $('#' + addId);
            $add.remove();
        },
        // 添加按钮
        addHoverDom : function(treeId, treeNode){
            var _config = getConfigByTreeId(treeId);
            if(_config.isHaveAdd){
                eventManage.addAddDom(treeId, treeNode); // 添加新增按钮
            }
            if(_config.isHaveDelete){
                eventManage.addRemoveDom(treeId, treeNode); // 添加删除按钮
            }
            return false;
        },
        // 移除按钮
        removeHoverDom : function(treeId, treeNode){
            var _config = getConfigByTreeId(treeId);
            if(_config.isHaveAdd){
                eventManage.removeAddDom(treeId, treeNode); // 移除新增按钮
            }
            if(_config.isHaveDelete){
                eventManage.removeRemoveDom(treeId, treeNode); // 移除删除按钮
            }
        },
        // 点击
        onClick : function(event, treeId, treeNode, clickFlag){
            // chkDisabled 节点是否只读
            // if(!treeNode.chkDisabled){ 
                var _config = getConfigByTreeId(treeId);
                var obj = {
                    event : event,
                    treeId : treeId,
                    treeNode : treeNode,
                    clickFlag : clickFlag,
                    config : _config,
                }
                _config.clickHandler(obj);
            // }
        },
        // 功能面板查询
        search : function(_config){
            var searchNode = treeManage.getSearchNode(_config);
            if(!$.isEmptyObject(searchNode)){
                var idField = _config.idField;
                var treeId = _config.treeId;
                var zTree = $.fn.zTree.getZTreeObj(treeId);
                var nodes = zTree.getNodes();
                var nodesList = zTree.transformToArray(nodes);
                treeManage.setOpenByNodeId(nodesList, searchNode[idField], _config);
                treeManage.refreshTreeByNodes(nodes, _config);
                // 选中
                zTree = $.fn.zTree.getZTreeObj(treeId);
                nodes = zTree.getNodes();
                nodesList = zTree.transformToArray(nodes);
                for(var i=0; i<nodesList.length; i++){
                    if(nodesList[i][idField] == searchNode[idField]){
                        searchNode = nodesList[i];
                        break;
                    }
                }
                $('#' + searchNode.tId + '_a').trigger('click');
            }else{
                nsAlert('没有查询到结果','warning');
                console.warn('没有查询到结果');
            }
        },
        // 设置树只读
        setTreeReadonly : function(readonly, _config){
            // NetstarTemplate.tree.init(config);
            configManage.setConfigByReadonly(readonly, _config);
            treeManage.refreshTreeByConfig(_config);
        },
        closeAddDialog : function(event){
            var treeNode = event.data.treeNode;
            var treeId = event.data.treeId;
            var _config = getConfigByTreeId(treeId);
            var $target = $(event.target);
            var $parent = $target.parents('#' + _config.addDialogId);
            var $addDialog = $('#' + _config.addDialogId);
            var addId = domTextManage.addIdSuffix + treeNode.tId;
            var $addBtn = $('#' + addId);
            var targetId = $target.attr('id');
            var addBtnId = $addBtn.attr('id');
            if($parent.is($addDialog) || $target.is($addBtn) || targetId == addBtnId){
                return;
            }
            dialogManage.removeAddDialog(_config);
        },
    }
    var commonManage = {
        // 移除拖动样式
        removeDropClass : function(config){
            if(config.$moveTarget){
                for(var key in liClassManage){
                    config.$moveTarget.removeClass(liClassManage[key]);
                }
                for(var key in spanClassManage){
                    if(config.$moveTarget.find('.' + spanClassManage[key])){
                        config.$moveTarget.find('.' + spanClassManage[key]).remove();
                    }
                }
            }
        },
        // 格式化表单获取数据
        getFormatFormData : function(formData, config){
            var formatData = $.extend(true, {}, formData);
            // 新增数据
            var addNodeNum = config.addNodeNum ++;
            var defaultData = {
                name : domTextManage.addNodeName + addNodeNum,
                situation : situationManage.default,
            }
            nsVals.setDefaultValues(formatData, defaultData);
            var _formatData = {
                situation : situationManage[formatData.situation],
            };
            var textField = config.textField;
            _formatData[textField] = formatData.name;
            return _formatData;
        },
        // 新增节点ajax
        addNodeByAjax : function(addNodeData, config, callbackFunc){
            var ajaxConfig = $.extend(true, {}, config.addAjax);
            ajaxConfig.plusData = {
                configId : config.id,
                dataSrc : ajaxConfig.dataSrc,
                callbackFunc : callbackFunc,
                addNodeData : addNodeData,
            };
            ajaxConfig.data = addNodeData;
            NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                var plusData = _ajaxConfig.plusData;
                var _config = configsById[plusData.configId];
                if(res.success){
                    var data = res[plusData.dataSrc];
                    if(typeof(plusData.callbackFunc) == "function"){
                        plusData.callbackFunc(data, _config, plusData.addNodeData);
                    }
                }else{
                    nsAlert('新增节点失败');
                    console.error('新增节点失败');
                    console.error(res);
                }
                // 移除弹框
                dialogManage.removeAddDialog(_config);
            }, true)
        },
        // 修改节点ajax
        editNodeByAjax : function(editNodeData, config, callbackFunc){
            var ajaxConfig = $.extend(true, {}, config.editAjax);
            ajaxConfig.plusData = {
                configId : config.id,
                dataSrc : ajaxConfig.dataSrc,
                callbackFunc : callbackFunc,
                editNodeData : editNodeData,
            };
            ajaxConfig.data = editNodeData;
            NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                var plusData = _ajaxConfig.plusData;
                var _config = configsById[plusData.configId];
                if(typeof(plusData.callbackFunc) == "function"){
                    plusData.callbackFunc(res, _config, plusData);
                }
            }, true)
        },
        // 删除节点ajax
        deleteNodeByAjax : function(deleteNodeData, treeNode, config, callbackFunc){
            var ajaxConfig = $.extend(true, {}, config.deleteAjax);
            ajaxConfig.plusData = {
                configId : config.id,
                dataSrc : ajaxConfig.dataSrc,
                callbackFunc : callbackFunc,
                deleteNodeData : deleteNodeData,
                treeNode : treeNode,
            };
            ajaxConfig.data = deleteNodeData;
            NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                var plusData = _ajaxConfig.plusData;
                var _config = configsById[plusData.configId];
                if(res.success){
                    if(typeof(plusData.callbackFunc) == "function"){
                        plusData.callbackFunc(res, _config, plusData);
                    }
                }else{
                    nsAlert(res.msg, 'error');
                    console.error(res);
                }
            })
        },
        // 移动节点ajax
        moveNodeByAjax : function(moveNodeData, treeNode, targetNode, moveType, config, callbackFunc){
            var ajaxConfig = $.extend(true, {}, config.moveAjax);
            ajaxConfig.plusData = {
                configId : config.id,
                dataSrc : ajaxConfig.dataSrc,
                callbackFunc : callbackFunc,
                moveNodeData : moveNodeData,
                treeNode : treeNode,
                targetNode : targetNode,
                moveType : moveType,
            };
            ajaxConfig.data = moveNodeData;
            NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                var plusData = _ajaxConfig.plusData;
                var _config = configsById[plusData.configId];
                if(res.success){
                    if(typeof(plusData.callbackFunc) == "function"){
                        plusData.callbackFunc(res, _config, plusData);
                    }
                }else{
                    nsAlert('移动失败');
                    console.error(res);
                }
            })
        },
    }
    // 弹框管理
    var dialogManage = {
        addHtml : '<div class="tree-node-add" id="{{addDialogId}}">'
                    + '<div class="" id="{{addDialogInputId}}"></div>'
                    + '<div class="tree-node-add-footer" id="{{addDialogButtonId}}">'
                        + '<div class="pt-btn-group">'
                            + '<button class="pt-btn pt-btn-default pt-btn-block" ns-type="add">添加分类</button>'
                        + '</div>'
                    + '</div>'
                + '</div>',
        // 获取新增html
        getAddHtml : function(_config){
            var addHtml = this.addHtml;
            addHtml = addHtml.replace("{{addDialogId}}", _config.addDialogId);
            addHtml = addHtml.replace("{{addDialogInputId}}", _config.addDialogInputId);
            addHtml = addHtml.replace("{{addDialogButtonId}}", _config.addDialogButtonId);
            return addHtml;
        },
        // 设置container
        setAddContainer : function(treeId, treeNode){
            var _config = getConfigByTreeId(treeId);
            var addHtml = this.getAddHtml(_config);
            var addDialogId = _config.addDialogId;
            $('#' + addDialogId).remove();
            $('body').append(addHtml);
            var situationVal = 'next';
            var readonlyStr = false;
            if(treeNode.addType == 'inner'){
                situationVal = 'inner';
                readonlyStr = true;
            }
            var formJson = {
                id: _config.addDialogInputId,
                templateName: 'form',
                componentTemplateName: 'PC',
                isSetMore:false,
                formLayout : '',
                completeHandler: function(obj){
                    var nameId = NetstarComponent.config[_config.addDialogInputId].config.name.fullID;
                    var $input = $('#' + nameId);
                    $input.off('keyup');
                    $input.on('keyup', function(event){
                        if(event.keyCode == 13){
                            eventManage.addNode(treeId, treeNode);
                        }
                    });
                },
                form : [
                    {
                        id: 'situation',
                        label: '',
                        type: 'radio',
                        width : '100%',
                        value : situationVal,
                        readonly : readonlyStr,
                        subdata : [
                            { text : '同级', value : 'next'},
                            { text : '子级', value : 'inner'},
                        ],
                    },{
                        id: 'name',
                        label: '',
                        type: 'text',
                        width : '100%',
                        rules : 'maxlength=' + _config.maxlength,
                    },
                ]
            };
            var components = NetstarComponent.formComponent.getFormConfig(formJson);
            NetstarComponent.formComponent.init(components, formJson);
        },
        // 设置新增弹框位置
        setAddDialogPosition : function(treeId, $relative){
            var _config = getConfigByTreeId(treeId);
            var $container = $('#' + _config.addDialogId);
            NetstarComponent.commonFunc.setContainerPosition($container, $relative);
        },
        removeAddDialog : function(_config){
            var $addDialog = $('#' + _config.addDialogId);
            $addDialog.remove();
            $(document).off('click', eventManage.closeAddDialog);
        },
        // 设置新增弹框事件
        setAddDialogEvent : function(treeId, treeNode){
            var _config = getConfigByTreeId(treeId);
            var $btns = $('#' + _config.addDialogButtonId).find('button');
            $btns.off('click');
            $btns.on('click', function(event){
                var $this = $(this);
                var nsType = $this.attr('ns-type');
                switch(nsType){
                    case 'add':
                        eventManage.addNode(treeId, treeNode);
                        break;
                }
            });
            $(document).off('click', eventManage.closeAddDialog);
            $(document).on('click', {treeNode : treeNode, treeId : treeId}, eventManage.closeAddDialog);
        },
        // 初始化新增弹框
        initAddDialog : function(treeId, $add, treeNode){
            this.setAddContainer(treeId, treeNode);
            this.setAddDialogPosition(treeId, $add);
            this.setAddDialogEvent(treeId, treeNode);
        },
    }
    // 树管理
    var treeManage = {
        /***********节点排序*************/
        // 获取节点序号最大值 用于新增字段
        getMaxSort : function(){
            var sortField = config.sortField; // 排序字段
            var childField = config.childField; // 子字段
            var list = config.list;
            var maxSort = 0;
            function setMaxSort(treeList){
                for(var i=0; i<treeList.length; i++){
                    var isHadChild = $.isArray(treeList[i][childField]);
                    if(treeList[i][sortField] > maxSort){
                        maxSort = treeList[i][sortField];
                    }
                    if(isHadChild){
                        setMaxSort(treeList[i][childField]);
                    }
                }
            }
            if(config.isTurnTree){
                // 需要转化树表示list不是树结构 循环查找
                for(var i=0; i<list.length; i++){
                    if(list[i][sortField] > maxSort){
                        maxSort = list[i][sortField];
                    }
                }
            }else{
                // list是树结构需要递归查找
                setMaxSort(list);
            }
            return maxSort;
        },
        // 获取改变顺序的节点
        getChangeSortNodes : function(sortConfig){
            /**
             * sortConfig : {}
             * node : 移动或新增的节点
             * type : 操作类型 inner prev next
             * treeId : 树Id 用于获取树配置
             * targetNode : 目标节点
             * sortField : 排序字段
             */
            var node = sortConfig.node;
            var type = sortConfig.type;
            var treeId = sortConfig.treeId;
            var targetNode = sortConfig.targetNode;
            var sortField = sortConfig.sortField;
            var parentField = sortConfig.parentField;
            var idField = sortConfig.idField;
            // 获取树配置
            var zTree = $.fn.zTree.getZTreeObj(treeId);
            // 树所有节点的list
            var allNodes = zTree.transformToArray(zTree.getNodes());
            // 获取所有与node同级的节点
            var siblingNodes = [];
            var sortArr = [];
            for(var i=0; i<allNodes.length; i++){
                if(allNodes[i][parentField] == node[parentField]){
                    siblingNodes.push(allNodes[i]);
                    sortArr.push(allNodes[i][sortField]);
                }
            }
            var sourSiblingNodes = $.extend(true, [], siblingNodes);
            sortArr.sort(function(a,b){
                return a-b;
            })
            // 更新节点顺序
            for(var i=0; i<siblingNodes.length; i++){
                siblingNodes[i][sortField] = sortArr[i];
            }
            var changeNodes = [];
            for(var i=0; i<siblingNodes.length; i++){
                if(siblingNodes[i][sortField] != sourSiblingNodes[i][sortField] || siblingNodes[i][idField] == node[idField]){
                    changeNodes.push(siblingNodes[i]);
                }
            }
            return changeNodes;
        },

        // 获取z-tree树参数配置
        getZTreeSetting : function(config){
            var setting = {
                data: {
                    simpleData: {
                        enable: true,
                        idKey: config.idField,
                        pIdKey: config.parentField,
                    },
                    key: {
                        children : config.childField,
                        name : config.textField,
                    },
                },
                view : {
                },
                edit : {
                    enable : true,
                    editNameSelectAll: true,
                    drag : { 
                        // 拖拽节点按下 Ctrl 或 Cmd 键表示 copy; 否则为 move    默认不可拖拽
                        isCopy : false,
                        isMove : false,
                        prev: true,
                        next: true,
                        inner: true
                    },
                    // 不显示移除按钮
                    showRemoveBtn : false,
                    // 编辑按钮 默认不显示
                    showRenameBtn : false,
                    // renameTitle : '修改',
                },
                callback : {
                },
            }
            if(config.isMultiple){
                if(config.isCheckParent){
                    //勾选父节点
                    setting.check = {
                        enable: true,
                        chkStyle:"checkbox",
                        chkDisabledInherit : true,
                    }
                }else{
                    setting.check = {
                        enable: true,
                        chkStyle:"checkbox", 
                        chkboxType: { "Y": "s", "N": "s" },//只影响父级节点；取消勾选操作，只影响子级节点
                        chkDisabledInherit : true,
                    }
                }
            }
            // 只读状态不可编辑
            if(config.readonly){
                setting.edit.enable = false;
            }
            // if(config.sourceReadonly != true && config.readonly == true && typeof(config.clickHandler) == "function"){
            //     // 点击
            //     setting.callback.onClick = eventManage.onClick;
            // }
            if(config.readonly == true && typeof(config.clickHandler) == "function"){
                // 点击
                setting.callback.onClick = eventManage.onClick;
            }
            if(config.isHaveAdd || config.isHaveDelete){
                // 添加按钮 新增/删除
                setting.view.addHoverDom = eventManage.addHoverDom;
                setting.view.removeHoverDom = eventManage.removeHoverDom;
            }
            if(config.isHaveEdit){
                // 拖拽 
                // 拖拽节点按下 Ctrl 或 Cmd 键表示 copy; 否则为 move
                setting.edit.drag.isCopy = false;
                setting.edit.drag.isMove = true;
                setting.edit.drag.prev = eventManage.prev;
                setting.edit.drag.next = eventManage.next;
                setting.edit.drag.inner = eventManage.inner;
                setting.callback.beforeDrag = eventManage.beforeDrag;
                setting.callback.beforeDrop = eventManage.beforeDrop;
                setting.callback.onDragMove = eventManage.onDragMove;
                // 修改
                // 显示编辑按钮
                setting.edit.showRenameBtn = eventManage.showRenameBtn;
                setting.edit.renameTitle = '修改';
                setting.callback.onRename = eventManage.onRename;
                setting.callback.beforeRename = eventManage.beforeRename;
                // 编辑前
                setting.callback.beforeEditName = eventManage.beforeEditName;
            }
            return setting;
        },
        /***********原始数据节点*******/
        // 格式化数据节点 原始数据
        getFormatData : function(){
            var zNodes =  $.extend(true, [], config.treeData);
            // 展开层数 默认不展开层
            var levelNumber = typeof(config.level)=='number' ? config.level : 0;
            if(levelNumber < 1){
                levelNumber = 0;
            }
            // 当前层级
            var level = 0;
            // 设置树的子级 名称默认children
            var childField = config.childField;
            // 是否配置选中 配置选中字段时 节点默认的选中删除，不起作用
            var isHadCheck = typeof(config.checkId) == 'string' && config.checkId.length >0 ? true : false;
            function resetData(resceiveData, level){
                var isExpand = false; // 是否展开
                if(level < levelNumber){
                    isExpand = true;
                }
                for(var i = 0; i < resceiveData.length; i ++){
                    // 是否有子级
                    var isHaveChild = $.isArray(resceiveData[i][childField]);
                    // 是否展开
                    resceiveData[i].open = isExpand;
                    // 是否有子级
                    resceiveData[i].isParent = isHaveChild;
                    // // 显示字段
                    // resceiveData[i].name = resceiveData[i][config.textField];
                    // // 获取字段
                    // resceiveData[i].id = resceiveData[i][config.idField];
                    // // parent字段
                    // resceiveData[i].pId = resceiveData[i][config.parentField];
                    for(var key in defaultNodeConfig){
                        resceiveData[i][key] = typeof(resceiveData[i][key]) == 'boolean' ? resceiveData[i][key] : defaultNodeConfig[key];
                    }
                    if(isHadCheck){
                        delete resceiveData[i].checked;
                    }
                    // 如果有子级 设置子级
                    if(isHaveChild){
                        resetData(resceiveData[i][childField], ++level);
                    }
                }

            }
            resetData(zNodes, level);
            // 添加全部节点
            if(config.allfieldId.length > 0){
                var allfiledNode = {
                    isPrev : true,
                    isNext : false,
                    isInner : false,
                    isAdd : false,
                    isEdit : false,
                    isDelete : false,
                    isDrag : false,
                };
                allfiledNode[config.parentField] = -1;
                allfiledNode[config.idField] = config.allfieldId;
                allfiledNode[config.textField] = config.allfieldText;
                allfiledNode[childField] = [];
                for(var i=0; i<zNodes.length; i++){
                    zNodes[i][config.parentField] = allfiledNode[config.idField];
                    allfiledNode[childField].push(zNodes[i]);
                }
                zNodes = [allfiledNode];
            }
            // 添加未分类
            if(config.unfieldId.length > 0){
                var unfiledNode = {
                    isPrev : true,
                    isNext : false,
                    isInner : false,
                    isAdd : false,
                    isEdit : false,
                    isDelete : false,
                    isDrag : false,
                };
                unfiledNode[config.parentField] = zNodes[0][config.idField];
                unfiledNode[config.idField] = config.unfieldId;
                unfiledNode[config.textField] = config.unfieldText;
                if(!$.isArray(zNodes[0][childField])){
                    zNodes[0][childField] = [];
                }
                zNodes[0][childField].push(unfiledNode);
            }
            zNodes[0].isPrev = false;
            zNodes[0].isNext = false;
            zNodes[0].isInner = true;
            zNodes[0].isAdd = true;
            zNodes[0].addType = 'inner';
            zNodes[0].isEdit = false;
            zNodes[0].isDelete = false;
            zNodes[0].isDrag = false;
            return zNodes;
        },
        // list转tree
        convertToTree : function(list, idField, parentField, childField, sortField){
            var idMap = {};
            for(var i = 0; i < list.length; i++){
                idMap[list[i][idField]] = list[i];
            }
            var result = [];
            for(var i = 0; i < list.length; i++){
                var row = list[i];	
                if(row[parentField] && idMap[row[parentField]]){
                    var parent = idMap[row[parentField]];
                    if(!$.isArray(parent[childField])){
                        parent[childField] = [];
                    }
                    parent.isParent = true;
                    parent[childField].push(row);
                }else{
                    result.push(row);
                }
            }
            // 排序
            for(var key in idMap){
                if($.isArray(idMap[key][childField])){
                    idMap[key][childField].sort(function(a, b){
                        return a[sortField] - b[sortField];
                    });
                }
            }
            // 设置选中
            function setCheck(node){
                node.checked = true;
                if($.isArray(node[childField])){
                    for(var i=0; i<node[childField].length; i++){
                        setCheck(node[childField][i]);
                    }
                }
                
            }
            for(var key in idMap){
                if(idMap[key].checked){
                    setCheck(idMap[key]);
                }
            }
            return result;
        },
        // 获取树数据
        getTreeData : function(callbackFunc){
            if(config.ajax && config.ajax.url){
                var ajaxConfig = $.extend(true, {}, config.ajax);
                ajaxConfig.plusData = {
                    treeId : config.treeId,
                    dataSrc : ajaxConfig.dataSrc
                };
                NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                    var list = res;
                    var plusData = _ajaxConfig.plusData;
                    var treeId = plusData.treeId;
                    var dataSrc = plusData.dataSrc;
                    if(res.success){
                        list = res[dataSrc];
                    }else{
                        list = [];
                    }
                    config.sourceList = $.extend(true, [], list);
                    config.list = list;
                    if(config.isTurnTree){
                        config.treeData = treeManage.convertToTree(config.list, config.idField, config.parentField, config.childField, config.sortField);
                    }else{
                        config.treeData = config.list;
                    }
                    callbackFunc();
                })
            }else{
                config.sourceList = $.extend(true, [], config.list);
                if(config.isTurnTree){
                    config.treeData= treeManage.convertToTree(config.list, config.idField, config.parentField, config.childField, config.sortField);
                }else{
                    config.treeData = config.list;
                }
                callbackFunc();
            }
        },

        // 刷新树通过config
        refreshTreeByConfig : function(_config){
            var selectNodes = treeManage.getSelectedNodes(_config.id);
            _config.$tree.children().remove();
            $.fn.zTree.init(_config.$tree, _config.setting, _config.zNodes);
            $('#' + selectNodes[0].tId + '_a').trigger('click');
        },
        // 刷新树
        refreshTree : function(){
            config.$tree.children().remove();
            if(config.ajax && config.ajax.url){}else{
                config.list = config.sourceList;
            }
            treeManage.getTreeData(function(){
                // 初始化树
                treeManage.initTree();
            });
        },
        // 初始化树
        initTree : function(){
            // if(config.treeData.length != 1){
            //     nsAlert('生成树失败查看树数据是否正确', 'error');
            //     console.error('生成树失败查看树数据是否正确');
            //     console.error(config);
            //     config.$tree.addClass('no-data');
            //     return;
            // }
            // 获取z-tree树参数配置
            var setting = this.getZTreeSetting(config);
            config.setting = setting;
            config.zNodes = this.getFormatData();
            config.saveData = [];
            config.addNodeNum = 0;
            config.nodeMaxSort = treeManage.getMaxSort();
            config.nodeMaxSort ++; // 用于新增节点的排序
            // 获取数据是否只读
            config.isGetDataReadonly = config.zNodes[0].chkDisabled;
            // 设置只读
            if(config.sourceReadonly){
                for(var i=0; i<config.zNodes.length; i++){
                    config.zNodes[i].chkDisabled = true;
                }
            }
            $.fn.zTree.init(config.$tree, config.setting, config.zNodes);
            // 默认点击根节点
            if(config.isClickRoot){
                var zTree = $.fn.zTree.getZTreeObj(config.treeId);
                var nodes = zTree.getNodes();
                var rootNode= nodes[0];
                $('#' + rootNode.tId + '_a').trigger('click');
            }
            // 设置状态
            var stateConfig = {
                id : config.id,
                openId : config.openId,
                checkId : config.checkId,
                readonlyId : config.readonlyId,
                cancelReadonlyId : config.cancelReadonlyId,
                idField : config.config
            }
            treeManage.setTreeState(stateConfig);
            if(typeof(config.shownHandler) == "function"){
                config.shownHandler(config);
            }
        },
        // 设置树状态
        setTreeState : function(stateConfig){
            /**
             * stateConfig : {}
             * id : 树容器id
             * openId : 展开节点     关闭所有打开节点展开当前节点
             * checkId : 选中节点    选中节点及其子节点不影响其它节点
             * cancelCheckId : 取消选中节点    取消选中节点及其子节点不影响其它节点
             * readonlyId : 只读节点    只读节点及其子节点不影响其它节点
             * cancelReadonlyId : 取消只读节点    取消只读节点及其子节点不影响其它节点
             * isCancelCheck : 是否取消选中   所有节点
             * isCancelOpen : 是否取消打开   所有节点
             */
            // 树容器id
            var id = stateConfig.id;
            // 展开节点
            var openId = stateConfig.openId;
            // 选中节点
            var checkId = stateConfig.checkId;
            // 取消选中节点
            var cancelCheckId = stateConfig.cancelCheckId;
            // 只读节点
            var readonlyId = stateConfig.readonlyId;
            // 取消只读节点
            var cancelReadonlyId = stateConfig.cancelReadonlyId;
            // 是否取消选中
            var isCancelCheck = stateConfig.isCancelCheck;
            // 是否取消打开
            var isCancelOpen = stateConfig.isCancelOpen;

            var _config = getConfigById(id);
            var treeId = _config.treeId;
            var idField = _config.idField;
            var zTree = $.fn.zTree.getZTreeObj(treeId);
            var nodes = zTree.getNodes();
            var nodesList = zTree.transformToArray(nodes);
            // 是否需要刷新树
            var isRefresh = false;
            // 是否取消选中
            if(isCancelCheck){
                isRefresh = true;
                treeManage.setCancelCheckedOpen(nodesList, 'checked');
            }
            // 是否取消展开
            if(isCancelOpen){
                isRefresh = true;
                treeManage.setCancelCheckedOpen(nodesList, 'open');
            }
            // 设置选中
            var isHadCheck = typeof(checkId) == "string" && checkId.length > 0 ? true : false;
            if(isHadCheck){
                if(_config.isMultiple){
                    // 设置选中节点
                    var obj = {
                        id : checkId,
                        type : 'check',
                        nodesList : nodesList,
                        idField : idField,
                        childField : _config.childField,
                        callbackFunc : function(node){
                            node.checked = true;
                        }
                    }
                    isRefresh = true;
                    treeManage.setNodeAndChildStateById(obj);
                }
            }
            // 设置取消选中
            var isHadCancelCheck = typeof(cancelCheckId) == "string" && cancelCheckId.length > 0 ? true : false;
            if(isHadCancelCheck){
                if(_config.isMultiple){
                    // 设置选中节点
                    var obj = {
                        id : cancelCheckId,
                        type : 'check',
                        nodesList : nodesList,
                        idField : idField,
                        childField : _config.childField,
                        callbackFunc : function(node){
                            node.checked = false;
                        }
                    }
                    isRefresh = true;
                    treeManage.setNodeAndChildStateById(obj);
                }
            }
            // 设置展开
            var isHadOpen = typeof(openId) == "string" && openId.length > 0 ? true : false;
            if(isHadOpen){
                isRefresh = true;
                treeManage.setOpenByNodeId(nodesList, openId, _config);
            }
            // 是否取消只读
            var isHadCancelReadonly = typeof(cancelReadonlyId) == "string" && cancelReadonlyId.length > 0 ? true : false;
            if(isHadCancelReadonly){
                isRefresh = true;
                // 设置取消只读节点
                var obj = {
                    id : cancelReadonlyId,
                    type : 'cancelReadonly',
                    nodesList : nodesList,
                    idField : idField,
                    childField : _config.childField,
                    callbackFunc : function(node){
                        node.chkDisabled = false;
                        node.editNameFlag = false;
                        node.isHover = false;
                    }
                }
                treeManage.setNodeAndChildStateById(obj);
            }
            // 是否只读
            var isHadReadonlyId = typeof(readonlyId) == "string" && readonlyId.length > 0 ? true : false;
            if(isHadReadonlyId){
                isRefresh = true;
                // 设置只读节点
                var obj = {
                    id : readonlyId,
                    type : 'readonly',
                    nodesList : nodesList,
                    idField : idField,
                    childField : _config.childField,
                    callbackFunc : function(node){
                        node.chkDisabled = true;
                        node.editNameFlag = true;
                        node.isHover = true;
                    }
                }
                treeManage.setNodeAndChildStateById(obj);
            }

            if(isRefresh){
                treeManage.refreshTreeByNodes(nodes, _config);
            }
            // 单选
            if(isHadCheck && !_config.isMultiple){
                var checkNode = treeManage.getCheckNodeByNodeId(nodesList, checkId, idField);
                if(checkNode){
                    $('#' + checkNode.tId + '_a').trigger('click');
                }else{
                    nsAlert('选中节点不存在');
                    console.error('选中节点不存在, 节点id:');
                    console.error(checkId);
                } 
            }
        },
        /**********树节点***********/
        // 获取节点位置 通过parentNode 和 id
        getIndexByParentNodeAndId : function(parentNode, id, config){
            var index = -1;
            var childField = config.childField;
            var idField = config.idField;
            var textField = config.textField;
            var treeId = config.treeId;
            var zTree = $.fn.zTree.getZTreeObj(treeId);
            var nodes = this.getTreeNodes(config);
            if(parentNode === null){
                var nodesList = zTree.transformToArray(nodes);
                for(var i=0; i<nodesList.length; i++){
                    if(nodesList[i][idField] === id){
                        index = i;
                        break;
                    }
                }
            }else{
                var childrenNodes = parentNode[childField];
                if(childrenNodes){
                    for(var i=0; i<childrenNodes.length; i++){
                        if(childrenNodes[i][idField] === id){
                            index = i;
                            break;
                        }
                    }
                }
            }
            if(index != -1){
                index ++;
            }
            return index;
        },
        // 获取树所有节点
        getTreeNodes : function(config){
            var treeId = config.treeId;
            var zTree = $.fn.zTree.getZTreeObj(treeId);
            var nodes = zTree.getNodes();
            return nodes;
        },
        // 通过id获取节点
        getNodeById : function(id, idField, config){
            var treeId = config.treeId;
            var zTree = $.fn.zTree.getZTreeObj(treeId);
            var nodes = zTree.getNodes();
            var nodesList = zTree.transformToArray(nodes);
            var node = {};
            for(var i=0; i<nodesList.length; i++){
                if(nodesList[i][idField] == id){
                    node = nodesList[i];
                    break;
                }
            }
            node = $.isEmptyObject(node) ? false : node;
            return node;
        },
        // 设置 节点及节点子节点状态 通过节点id
        setNodeAndChildStateById : function(stateConfig){
            /**
             * type // check  cancelReadonly readonly open
             * nodesList, 
             * id, 
             * childField, 
             * idField
             * callbackFunc
             */
            var errorObj = {
                check : '选中',
                cancelReadonly : '取消只读', 
                readonly : '只读', 
                open : '展开',
            }
            var id = stateConfig.id;
            var idField = stateConfig.idField;
            var nodesList = stateConfig.nodesList;
            var childField = stateConfig.childField;
            var callbackFunc = stateConfig.callbackFunc;

            var node = false;
            for(var i=0; i<nodesList.length; i++){
                if(nodesList[i][idField] == id){
                    node = nodesList[i];
                    break;
                }
            }
            function setState(_node){
                callbackFunc(_node);
                if($.isArray(_node[childField])){
                    for(var i=0; i<_node[childField].length; i++){
                        setState(_node[childField][i]);
                    }
                }
                
            }
            if(node){
                setState(node);
            }else{
                nsAlert(errorObj.type + '节点不存在');
                console.error(errorObj.type + '节点不存在, 节点id:');
                console.error(id);
            }
        },
        // 设置取消选中/展开 name--open/checked
        setCancelCheckedOpen : function(nodesList, name){
            for(var i=0; i<nodesList.length; i++){
                nodesList[i][name] = false;
            }
        },
        // 获取选中节点
        getCheckNodeByNodeId : function(nodesList, id, idField){
            var checkNode = false;
            for(var i=0; i<nodesList.length; i++){
                if(nodesList[i][idField] == id){
                    checkNode = nodesList[i];
                    break;
                }
            }
            return checkNode;
        },
        // 设置open状态
        setOpenByNodeId : function(nodesList, id, _config){
            var idField = _config.idField;
            var parentField = _config.parentField;
            var searchNode = {};
            for(var i=0; i<nodesList.length; i++){
                if(nodesList[i][idField] == id){
                    searchNode = nodesList[i];
                    break;
                }
            }
            if($.isEmptyObject(searchNode)){
                nsAlert('打开节点不存在');
                console.error('打开节点不存在, 节点id:');
                console.error(id);
            }
            for(var i=0; i<nodesList.length; i++){
                nodesList[i].open = false;
            }
            function setOpen(parentId){
                if(!parentId){
                    return;
                }
                for(var i=0; i<nodesList.length; i++){
                    if(nodesList[i][idField] == parentId){
                        nodesList[i].open = true;
                        setOpen(nodesList[i][parentField]);
                        break;
                    }
                }
            }
            setOpen(searchNode[parentField]);
        },
        // 通过nodes刷新树
        refreshTreeByNodes : function(nodes, _config){
            _config.$tree.children().remove();
            $.fn.zTree.init(_config.$tree, _config.setting, nodes);
        },
        // 设置树只读 通过节点
        setTreeIsReadonlyByNodes : function(nodes, readonly){
            for(var i=0; i<nodes.length; i++){
                nodes[i].chkDisabled = readonly;
            }
        },
        // 通过搜索条件获取节点
        getSearchNode : function(config){
            var searchId = config.searchId;
            var textField = config.textField;
            var idField = config.idField;
            var $searchInput = $('#' + searchId);
            var searchName = $searchInput.val();
            if(searchName && config.prevSearch.name === searchName){
                config.prevSearch.index ++;
            }else{
                config.prevSearch = {
                    name : searchName,
                    index : 0,
                }
            }
            var treeId = config.treeId;
            var zTree = $.fn.zTree.getZTreeObj(treeId);
            var nodes = zTree.getNodes();
            var nodesList = zTree.transformToArray(nodes);
            var searchNode = {};
            var searchNodes = [];
            for(var i=0; i<nodesList.length; i++){
                var nodeName = nodesList[i][textField].toUpperCase();
                searchName = searchName.toUpperCase();
                if(nodeName.indexOf(searchName) > -1){
                    searchNodes.push(nodesList[i]);
                }
            }
            if(searchNodes.length === 0){
                config.prevSearch.index = -1;
            }else{
                searchNode = searchNodes[config.prevSearch.index];
                if(searchNodes.length == (config.prevSearch.index + 1)){
                    config.prevSearch.index = -1;
                }
            }
            return searchNode;
        },

        /**********节点调用外部方法**************/
        // 获取勾选节点
        getCheckedNodes : function(id){
            var _config = configsById[id];
            if(!_config){
                return false;
            }
            var treeId = _config.treeId;
            var zTree = $.fn.zTree.getZTreeObj(treeId);
            if(zTree && _config.isMultiple){
                // var checkNodes = zTree.getCheckedNodes();
                var nodes = zTree.getNodes();
                var nodesList = zTree.transformToArray(nodes);
                var checkNodes = [];
                for(var i=0; i<nodesList.length; i++){
                    if(nodesList[i].checked){
                        checkNodes.push(nodesList[i]);
                    }
                }
                return checkNodes;
            }else{
                // nsAlert('单选/树不存在时不存在勾选状态，无法获取值');
                console.error('单选/树不存在时不存在勾选状态，无法获取值');
                console.error(_config);
                return [];
            }
        },
        // 获取选中节点
        getSelectedNodes : function(id){
            var _config = configsById[id];
            var treeId = _config.treeId;
            var zTree = $.fn.zTree.getZTreeObj(treeId);
            if(!zTree){
                console.error('树不存在');
                console.error(_config);
                return []
            }
            var checkNodes = zTree.getSelectedNodes();
            return checkNodes;
        },
        // 获取保存值
        getSaveData : function(id){
            var _config = configsById[id];
            return $.extend(true, [], _config.saveData);
        },
    }
    // config管理
    var configManage = {
        // 验证配置
        validConfig : function(config){
            var isPass = true;
            if(typeof(config.id) != "string"){
                nsAlert('生成树面板失败，请检查是否配置容器id', 'error');
                console.error('成树面板失败，请检查是否配置容器id');
                console.error(config);
                isPass = false;
            }
            if(isPass){
                var id = config.id;
                if($('#' + id).length != 1){
                    nsAlert('生成树面板失败，请检查容器是否存在', 'error');
                    console.error('生成树面板失败，请检查容器是否存在');
                    console.error(config);
                    isPass = false;
                }
            }
            var ajaxArr = ['ajax','addAjax','editAjax','deleteAjax','moveAjax'];
            function　validAjax(ajaxName){
                if(typeof(config[ajaxName]) != "object"){
                    nsAlert('配置错误，请检查是否配置' + ajaxName , 'error');
                    console.error('配置错误，请检查是否配置' + ajaxName );
                    console.error(config);
                    isPass = false;
                }
                if(isPass){
                    if(typeof(config[ajaxName].url) != "string" && typeof(config[ajaxName].src) != "string"){
                        nsAlert('配置错误，请检查配置'+ajaxName+'是否正确', 'error');
                        console.error('配置错误，请检查配置'+ajaxName+'是否正确');
                        console.error(config);
                        isPass = false;
                    }
                }
            }
            if(isPass){
                if($.isArray(config.list)){
                }else{
                    validAjax('ajax');
                }
            }
            if(isPass){
                if(config.readonly !== true){
                    for(var i=0; i<ajaxArr.length; i++){
                        if(isPass){
                            validAjax(ajaxArr[i]);
                        }
                    }
                }
            }
            return isPass;
        },
        // 设置默认配置
        setDefault : function(){
            var defaultConfig = {
                idField : 'id',
                textField : 'name',
                parentField : 'parent',
                childField : 'children',
                sortField : 'sort',     // 排序字段
                fromField : 'fromId',   // 新增时发送字段字段
                title : '',         // 标题
                plusClass : '',     // 样式
                level : 0,
                isTurnTree : false,      // list转tree 默认否
                isAutoSave : false,     // 是否自动保存
                isSearch : true,        // 是否允许搜索
                isMultiple : false,     // 是否多选
                readonly : false,       // 是否只读
                height : '',            // 树高度
                width : 240,            // 树高度
                maxlength : 20,         // 节点name长度
                // isUnfiled : true,       // 是否添加未分类
                unfieldId : '',         // 未分类id
                allfieldId : '',        // 全部id
                unfieldText : '未分类',  // 未分类
                allfieldText : '全部',   // 全部
                isClickRoot : true,      // 是否默认选中根节点 单选

                // 不能配置只能默认 按钮
                isHaveSave : true,      // 是否有保存
                isHaveAdd : true,       // 是否有新增
                isHaveEdit : true,      // 是否有编辑
                isHaveDelete : true,    // 是否有删除

                // 上一次搜索参数
                prevSearch : {
                    name : '',
                    index : -1,
                }
            }
            nsVals.setDefaultValues(config, defaultConfig);
            var defaultAjax = {
                type : 'GET',
                contentType : 'application/json; charset=utf-8',
            }
            nsVals.setDefaultValues(config.ajax, defaultAjax);
            nsVals.setDefaultValues(config.saveAjax, defaultAjax);
            if(config.saveAjax && config.saveAjax.src){
                config.saveAjax.url = config.saveAjax.src;
            }
            if(config.ajax && config.ajax.src){
                config.ajax.url = config.ajax.src;
            }
        },
        // 设置config 通过是否只读状态
        setConfigByReadonly : function(readonly, _config){
            _config.readonly = readonly;
            _config.isHaveSave = !readonly;
            _config.isHaveAdd = !readonly;
            _config.isHaveEdit = !readonly;
            _config.isHaveDelete = !readonly;
            var setting = treeManage.getZTreeSetting(_config);
            _config.setting = setting;
            var nodes = treeManage.getTreeNodes(_config);
            _config.zNodes = nodes;
        },
        // 设置config配置
        setConfig : function(){
            // 设置默认值
            this.setDefault();
            config.level = typeof(config.level) == "string" ? Number(config.level) : config.level;
            // 树容器
            var id = config.id;
            var $container = $('#' + id);
            config.$container = $container;
            var treeId = id + '-tree';
            var funcPanelId = id + '-btns-panel-top';
            var footerId = id + '-btns-panel-footer';
            var searchId = funcPanelId + '-search';
            var addDialogId = id + '-tree-add';
            var addDialogInputId = id + '-tree-add-input';
            var addDialogButtonId = id + '-tree-add-button';
            config.treeId = treeId;
            config.funcPanelId = funcPanelId;
            config.footerId = footerId;
            config.searchId = searchId;
            config.addDialogId = addDialogId;
            config.addDialogInputId = addDialogInputId;
            config.addDialogButtonId = addDialogButtonId;
            // 设置只读
            if(config.sourceReadonly == false){
                config.readonly = false;
            }else{
                config.sourceReadonly = config.readonly;
                config.readonly = true;
            }
            // 自动保存状态下没有保存按钮
            config.isHaveSave = config.isAutoSave ? false : true;
            // 只读状态下 没有任何操作
            if(config.readonly){
                config.isHaveSave = false;
                config.isHaveAdd = false;
                config.isHaveEdit = false;
                config.isHaveDelete = false;
            }else{
                // config.isHaveSave = true;
                config.isHaveAdd = true;
                config.isHaveEdit = true;
                config.isHaveDelete = true;
            }
        },
    }
    // 生成功能面板
    function initFuncPanel(){
        var searchId = config.searchId;
        var saveHtml = '<div class="pt-btn-group">'
                            + '<button class="pt-btn pt-btn-default">保存</button>'
                        + '</div>';
        var searchHtml = '<div class="pt-input-group">'
                            + '<span class="pt-input-group-addon">定位</span>'
                            + '<input type="text" class="pt-form-control" id="' + searchId + '">'
                            + '<div class="pt-btn-group">'
                                + '<button class="pt-btn pt-btn-default pt-btn-icon"><i class="icon-search"></i></button>'
                            + '</div>'
                        + '<div>';
        if(config.isHaveSave){
            var $save = $(saveHtml);
            config.$save = $save;
            var $saveBtn = $save.find('button');
            $saveBtn.off('click');
            $saveBtn.on('click',function(ev){
                saveDataByAjax();
            });
            // config.$funcPanel.append($save);
        }
        if(config.isSearch){
            var $search = $(searchHtml);
            config.$search = $search;
            config.searchId = searchId;
            var $searchBtn = $search.find('button');
            var $searchInput = $search.find('input');
            $searchBtn.off('click');
            $searchBtn.on('click', {config : config}, function(ev){
                var _config = ev.data.config;
                eventManage.search(_config);
            });
            $searchInput.off('keyup');
            $searchInput.on('keyup', {config : config}, function(event){
                if(event.keyCode == 13){
                    var _config = event.data.config;
                    eventManage.search(_config); 
                }
            });
            config.$funcPanel.append($search);
        } 
    }
    // 生成面板底部按钮
    function initFooterPanel(){
        var btnsHtml = '<div class="pt-btn-group">'
                            + '<button class="pt-btn pt-btn-default" ns-type="edit">编辑</button>'
                        + '</div>';
        if(!config.sourceReadonly && !config.isGetDataReadonly){
            var $btns = $(btnsHtml);
            $btns.find('button').off('click');
            $btns.find('button').on('click', {config : config},function(ev){
                var _config = ev.data.config;
                var $this = $(this);
                var nsType = $this.attr('ns-type');
                var text = '';
                var btnType = '';
                var readonly = false;
                switch(nsType){
                    case 'edit':
                        text = '保存';
                        btnType = 'editcomplete';
                        break;
                    case 'editcomplete':
                        text = '编辑';
                        btnType = 'edit';
                        readonly = true;
                        break;
                }
                $this.attr('ns-type', btnType);
                $this.text(text);
                eventManage.setTreeReadonly(readonly, _config);
            });
            config.$footerPanel.append($btns);
        }else{
            // 只读 原始获取数据只读 不可取消只读
            // console.error('只读 和原始获取数据只读 不可取消只读');
            // console.error(config);
            return;
        }
    }
    // 生成树以外的其它面板
    function initPanel(){
        // 生成功能面板
        initFuncPanel();
        // 生成面板底部按钮
        initFooterPanel();
    }
    // 通过id获取配置
    function getConfigById(id){
        return configsById[id];
    }
    // 通过treeId获取配置
    function getConfigByTreeId(treeId){
        var id = treeId.substring(0, treeId.lastIndexOf('-tree'));
        return configsById[id];
    }
    // 设置容器
    function setContainer(){
        var heightStr = '';
        if(typeof(config.height) == "number"){
            heightStr = 'height:' + config.height + 'px; max-height:' + config.height + 'px;';
        }
        if(typeof(config.width) == "number"){
            widthStr = 'width:' + config.width + 'px;';
        }
        var titleStr = '';
        if(config.title.length > 0){
            titleStr = '<div class="pt-tree-title">' + config.title + '</div>';
        }
        var html = '<div class="pt-tree ' + config.plusClass + '">'
                        + titleStr
                        + '<div class="pt-tree-form-panel" id="' + config.funcPanelId + '"></div>'
                        + '<ul class="ztree" id="' + config.treeId + '" style="' + heightStr + widthStr + '"></ul>'
                        + '<div class="pt-tree-form-panel-footer" id="' + config.footerId + '"></div>'
                    + '</div>'
        config.$container.html(html);
        config.$tree = $('#' + config.treeId);
        config.$funcPanel = $('#' + config.funcPanelId);
        config.$footerPanel = $('#' + config.footerId);
    }
    // 初始化
    function init(_config){
        // 验证配置是否通过
        var isPass = configManage.validConfig(_config);
        if(!isPass){
            return isPass;
        }
        // 定义config
        config = _config;
        config.sourceConfig = $.extend(true, {}, config);
        configsById[config.id] = config;
        // 设置config
        configManage.setConfig();
        // 设置容器
        setContainer();
        // 获得树数据
        treeManage.getTreeData(function(){
            // 初始化树
            treeManage.initTree();
        }); 
        // 初始化按钮面板
        initPanel();
    }
    return {
        configsById :           configsById,                        // 所有的树配置
        getConfigById :         getConfigById,                      // 通过id获取属配置
        init :                  init,                               // 初始化
        getCheckedNodes :       treeManage.getCheckedNodes,         // 获取勾选节点
        getSelectedNodes :      treeManage.getSelectedNodes,        // 获取选中节点
        setTreeState :          treeManage.setTreeState,            // 设置树状态
        validConfig :           configManage.validConfig            // 验证config
    }
})(jQuery)