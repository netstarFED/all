var nsEngine = (function () {
    var baseUrl = getRootPath() + '/nsEngine/';

    var instanceState = {
        '0': '初始',
        '1': '运行',
        '3': '挂起',
        '4': '完成',
        '5': '终止'
    };

    var workitemState = {
        '0': '初始化',
        '1': '未决',
        '2': '待办',
        '3': '签收',
        '4': '转移',
        '5': '归档',
        '16': '删除',
        '32': '暂停',
        '64': '应急',
        '128': '关闭'
    };

    var OperationInfoBuilder = function (workitemId) {
        var info = new OperationInfo(workitemId);
        return {
            instanceIds: function (instanceIds) {
                info.instanceIds = instanceIds;
                return this;
            },
            workitemId: function (workitemId) {
                info.workitemId = workitemId;
                return this;
            },
            parentWorkitemId: function (parentWorkitemId) {
                info.parentWorkitemId = parentWorkitemId;
                return this;
            },
            batchNums: function (batchNum) {
                info.batchNums = batchNum;
                return this;
            },
            submitAllBatch: function (submitAllBatch) {
                info.submitAllBatch = submitAllBatch;
                return this;
            },
            workitemIds: function (workitemIds) {
                info.workitemIds = workitemIds;
                return this;
            },
            transactors: function (transactors) {
                info.transactors = transactors;
                return this;
            },
            bllObj: function (bllObj) {
                info.bllObj = bllObj;
                return this;
            },
            rebookUserId: function (rebookUserId) {
                info.rebookUserId = rebookUserId;
                return this;
            },
            turnToUserIds: function (turnToUserIds) {
                info.turnToUserIds = turnToUserIds;
                return this;
            },
            suggestion: function (suggestion) {
                info.suggestion = suggestion;
                return this;
            },
            suggestionType: function (suggestionType) {
                info.suggestionType = suggestionType;
                return this;
            },
            instanceParam: function (instanceParam) {
                var type = typeof (instanceParam);
                if (type == 'object') {
                    info.instanceParam = instanceParam;
                } else if (type == 'string' && arguments.length == 2) {
                    if (!info.instanceParam) {
                        info.instanceParam = {};
                    }
                    info.instanceParam[instanceParam] = arguments[1];
                }
                return this;
            },
            workitemParam: function (workitemParam) {
                var type = typeof (workitemParam);
                if (type == 'object') {
                    info.workitemParam = workitemParam;
                } else if (type == 'string' && arguments.length == 2) {
                    if (!info.workitemParam) {
                        info.workitemParam = {};
                    }
                    info.workitemParam[workitemParam] = arguments[1];
                }
                return this;
            },
            activityTransactors: function (activityTransactors) {
                /*
                 {
                 activityId: '环节id’，
                 userDef: '办理人定义'
                 }
                 */
                info.activityTransactors = activityTransactors;
                return this;
            },
            replayActivities: function (replayActivities) {
                info.replayActivities = replayActivities;
                return this;
            },
            build: function () {
                return new OperationFun(info);
            }
        }
    };

    function OperationInfo(workitemId) {
        this.workitemId = workitemId;
        this.parentWorkitemId = null;
        this.batchNums = null;
        this.submitAllBatch = null;
        this.workitemIds = null;
        this.transactors = null;
        this.bllObj = null;
        this.rebookUserId = null;
        this.turnToUserIds = null;
        this.suggestion = null;
        this.suggestionType = null;
        this.instanceParam = null;
        this.workitemParam = null;
        this.activityTransactors = null;
        this.replayActivities = null;
    }

    function OperationFun(info) {
        this.info = info;
    }

    OperationFun.prototype.postJSON = function (path, success, failure) {
        if (!this.info.workitemId && (!this.info.workitemIds || this.info.workitemIds.length == 0)) {
            return failure('必须指定工作项');
        }
        postJSON(path, this.info, success, failure);
    };

    OperationFun.prototype.post = function (path, success, failure) {
        if (!this.info.workitemId) {
            return failure('必须指定工作项');
        }
        post(path, this.info, success, failure);
    };

    OperationFun.prototype.getInfo = function (success) {
        this.info.othersTransactor = true;
        this.post('workitemInfo', success, function (msg) {
            console.error(msg);
        });
    };

    OperationFun.prototype.isInstanceStatesRunning = function (instanceStates, failure) {
        if (instanceStates.indexOf(',') != -1) {
            failure('当前工作项关联了多个实例，无进行操作');
            return false;
        } else if (instanceStates != '1') {
            failure('当前实例状态为' + nsEngine.instanceState(instanceStates) + ', 无法进行当前的操作');
            return false;
        }
        return true;
    };

    OperationFun.prototype.terminate = function (success, failure) {
        this.getInfo(function (workitem) {
            if (this.isInstanceStatesRunning(workitem.instanceStates, failure)) {
                this.postJSON('terminate', success, failure);
            }
        }.bind(this));
    };

    OperationFun.prototype.undoTerminate = function (success, failure) {
        this.getInfo(function (workitem) {
            if (workitem.instanceStates == '5') {
                this.postJSON('undoTerminate', success, failure);
            } else {
                failure('当前实例没有终止，不能进行撤回终止操作');
            }
        }.bind(this));
    };

    OperationFun.prototype.suspend = function (success, failure) {
        this.getInfo(function (workitem) {
            if (this.isInstanceStatesRunning(workitem.instanceStates, failure)) {
                this.postJSON('suspend', success, failure);
            }
        }.bind(this));
    };

    OperationFun.prototype.resume = function (success, failure) {
        this.getInfo(function (workitem) {
            if (workitem.hasSuspend) {
                this.postJSON('resume', success, failure);
            } else {
                failure('当前实例没有挂起，不能进行恢复操作');
            }
        }.bind(this));
    };

    OperationFun.prototype.forWard = function (success, failure) {
        var _this = this;
        this.getInfo(function (workitem) {
            if (workitem.canCommit) {
                _this.setOpeartionParams(workitem, function () {
                    _this.postJSON('forWard', success, failure);
                });
            } else {
                failure('当前工作项状态不符合要求，不能进行转移操作');
            }
        }.bind(this));
    };

    /**
     * 【提交】方法，直接调用后台的提交方法
     */
    OperationFun.prototype.submit = function (success, failure) {
        var _this = this;
        this.getInfo(function (workitem) {
            if (workitem.workitemState == '2' || workitem.workitemState == '3') {
                _this.setOpeartionParams(workitem, function () {
                    _this.postJSON('submit', success, failure);
                });
            } else {
                failure('当前工作项状态不符合要求，不能进行提交操作');
            }
        }.bind(this));
    }

    /**
     * 【批量提交】方法，直接调用后台的提交方法
     */
    OperationFun.prototype.multiSubmit = function (success, failure) {
        // this.postJSON('multiSubmit', success, failure);
        if (!this.info.workitemIds) {
            return failure('必须指定工作项');
        }
        postJSON('multiSubmit', this.info, success, failure);
    }

    /**
     * 提交时输入办理意见和后续环节办理人
     *
     * @param workitem
     * @param callbackFunc
     */
    OperationFun.prototype.setOpeartionParams = function (workitem, callbackFunc) {
        var _this = this;
        if (!workitem.needSetOthersTransactor && !workitem.doWhenForward) {
            if (typeof (callbackFunc) == 'function') {
                callbackFunc();
            }
            return;
        }

        var formArr = [];

        var config = {
            id: "wf-setTransactors-dialog",
            title: "请设置以下参数",
            templateName: 'PC',
            plusClass: 'sss',
            width: '420px',
            height: '300px',
            isSetMore: false,
            shownHandler: function (data) {
                var dialogBodyId = data.config.bodyId;
                var formJson = {
                    id: dialogBodyId,
                    templateName: 'form',
                    componentTemplateName: 'PC',
                    defaultComoponentWidth: '20%',
                    isSetMore: false
                };
                formJson.form = $.extend(true, [], formArr);
                var component = NetstarComponent.formComponent.getFormConfig(formJson);
                NetstarComponent.formComponent.init(component, formJson);
                console.log(formJson);
                addDialogBtns(this.id, function (value) {
                    var otherTransactors = [];
                    for (var key in value) {
                        if (key != 'suggestion') {
                            otherTransactors.push({
                                activityId: key,
                                userId: value[key]
                            })
                        }
                    }
                    _this.info.activityTransactors = otherTransactors;
                    if (value.suggestion) {
                        //_this.info.suggestion = value.suggestion.value;
                        _this.info.suggestion = value.suggestion;
                    }
                    if (typeof (callbackFunc) == 'function') {
                        callbackFunc();
                    }
                });
            },
            hiddenHandler: function () {
                if ($('container:last').length > 0) {
                    if ($('container:last').children().eq(0).hasClass('limsresultinput')) {
                        NetstarUI.resultTable.initShortkey();
                    }
                }
                if ($('button[ajax-disabled="true"]')) {
                    $('button[ajax-disabled="true"]').removeAttr('disabled');
                    $('button[ajax-disabled="true"]').removeAttr('ajax-disabled');
                }
            }
        }
        if (workitem.needSetOthersTransactor) {
            var otherActivities = workitem.otherActivities;
            for (var index = 0; index < otherActivities.length; index++) {
                formArr.push({
                    id: otherActivities[index].id,
                    label: otherActivities[index].name + '环节办理人',
                    type: 'select',
                    subdata: otherActivities[index].candidateUsers,
                    textField: 'userName',
                    valueField: 'userId',
                    column: 12,
                    inputWidth: 200,
                    listExpression: "<li>{{userName}}</li>"
                })
            }
        }
        if (workitem.doWhenForward) {
            _this.info.suggestionType = '1';
            formArr.push({
                id: 'suggestion',
                label: '意见',
                type: 'textarea',
                inputWidth: 300,
                inputHeight: 120, //高
                column: 12
            })
        } else {
            config.title = '请设置以下环节办理人';
        }
        if (!workitem.needSetOthersTransactor && workitem.doWhenForward) {
            config.title = '请输入办理意见';
        }
        NetstarComponent.dialogComponent.init(config);
    }

    OperationFun.prototype.complete = function (success, failure) {
        this.getInfo(function (workitem) {
            if (workitem.workitemState == '2') {
                this.postJSON('complete', success, failure);
            } else {
                failure('当前工作项状态不符合要求，不能进行签收操作');
            }
        }.bind(this));
    };

    OperationFun.prototype.cancelSign = function (success, failure) {
        this.getInfo(function (workitem) {
            if (workitem.workitemState == '3') {
                this.postJSON('cancelSign', success, failure);
            } else {
                failure('当前工作项状态不符合要求，不能进行取消签收操作');
            }
        }.bind(this));
    };

    OperationFun.prototype.rebook = function (success, failure) {
        var _this = this;
        this.getInfo(function (workitem) {
            if (workitem.workitemState == '2' || workitem.workitemState == '3') {
                this.getTransactor(function (rebookUserId) {
                    if (rebookUserId && rebookUserId != '') {
                        _this.info.rebookUserId = rebookUserId;
                        _this.postJSON('rebook', success, failure);
                    } else {
                        alert('取消操作');
                    }
                }, false)
            } else {
                failure('当前工作项状态不符合要求，不能进行改签操作');
            }
        }.bind(this));
    };

    OperationFun.prototype.turnTo = function (success, failure) {
        var _this = this;
        this.getInfo(function (workitem) {
            if (workitem.workitemState == '3') {
                this.getTransactor(function (turnToUserId) {
                    _this.info.turnToUserIds = turnToUserId.split(',');
                    _this.postJSON('turnTo', success, failure);
                }, true)
            } else {
                failure('当前工作项状态不符合要求，不能进行转办操作');
            }
        }.bind(this));
    };

    OperationFun.prototype.reject = function (success, failure) {
        var _this = this;
        this.getInfo(function (workitem) {
            if (workitem.workitemState == '3' || workitem.workitemState == '2') {
                if (workitem.doWhenRollback) {
                    _this.info.suggestionType = '3';
                    _this.getSuggestion(function () {
                        _this.postJSON('reject', success, failure);
                    });
                } else {
                    _this.postJSON('reject', success, failure);
                }
            } else {
                failure('当前工作项状态不符合要求，不能进行驳回操作');
            }
        }.bind(this));
    };

    OperationFun.prototype.withdraw = function (success, failure) {
        var _this = this;
        this.getInfo(function (workitem) {
            if (workitem.canWithdraw) {
                if (workitem.doWhenRollback) {
                    _this.info.suggestionType = '4';
                    _this.getSuggestion(function () {
                        _this.postJSON('withdraw', success, failure);
                    }, _this.info.suggestionType);
                } else {
                    _this.postJSON('withdraw', success, failure);
                }
            } else {
                failure('当前工作项状态不符合要求，不能进行撤回操作');
            }
        }.bind(this));
    };

    OperationFun.prototype.rollback = function (success, failure) {
        var _this = this;
        this.getInfo(function (workitem) {
            if (workitem.canRollback) {
                _this.setRollback(workitem.doWhenRollback, function (rollbackType) {
                    if (rollbackType == 'rollback') {
                        _this.postJSON('rollback', success, failure);
                    } else {
                        _this.postJSON('reject', success, failure);
                    }
                })
            } else {
                failure('当前工作项状态不符合要求，不能进行回退操作');
            }
        }.bind(this));
    };

    OperationFun.prototype.delete = function (success, failure) {
        var _this = this;
        this.getInfo(function (workitem) {
            if (workitem.workitemState == '16' || workitem.workitemState == '32' || workitem.workitemState == '128') {
                failure('当前工作项状态不符合要求，不能进行删除操作');
            } else {
                if (workitem.doWhenRollback) {
                    _this.info.suggestionType = '3';
                    _this.getSuggestion(function () {
                        _this.postJSON('delete', success, failure);
                    });
                } else {
                    _this.postJSON('delete', success, failure);
                }
            }
        }.bind(this));
    }

    OperationFun.prototype.hasten = function (success, failure) {
        this.getInfo(function (workitem) {
            if (workitem.workitemState == '3') {
                this.postJSON('hasten', success, failure);
            } else {
                failure('当前工作项状态不符合要求，不能进行催办操作');
            }
        }.bind(this));
    };

    OperationFun.prototype.emergency = function (success, failure) {
        this.postJSON('emergency', success, failure);
    };

    OperationFun.prototype.merge = function (success, failure) {
        if (!this.info.workitemIds || this.info.workitemIds.length == 0) {
            nsalert('请指定要合并的工作项', 'warning');
            return;
        }
        this.postJSON('merge', success, failure);
    };
    // 查看办理意见
    OperationFun.prototype.findHandleRec = function (success, failure) {
        if (!this.info.instanceIds || this.info.instanceIds.length == 0) {
            nsalert('请指定要查看办理意见的工作项', 'warning');
            console.log('请指定要查看办理意见的工作项');
            return;
        }
        var packageSuffix = '?packageSuffix=' + new Date().getTime();
        //NetstarUI.labelpageVm.loadPage('/templateMindPages/pageConfig/1315230776517723122' + packageSuffix, '查看办理意见', true, {instanceIds:this.info.instanceIds});
        // NetstarUI.labelpageVm.loadPage('/templateMindPages/pageConfig/1319598014154671090' + packageSuffix, '查看办理意见', true, {instanceIds:this.info.instanceIds});
        // return;
        var ajaxData = {
            instanceIds: this.info.instanceIds
        }
        var dialogCommon = {
            id: 'netstar-findhandlerec-dialog',
            title: '查看办理意见',
            templateName: 'PC',
            height: 'auto',
            width: '90%',
            plusClass: 'multiDialog',
            defaultFooterHeight: '20px',
            shownHandler: function (data) {
                var bodyId = data.config.bodyId;
                var $body = $('#' + bodyId);
                var url = getRootPath() + '/templateMindPages/pageConfig/1319598014154671090'
                var pageObj = {
                    containerId: bodyId,
                    pageParam: ajaxData,
                };
                var tempValueName = 'netstar-findhandlerec-dialog-data';
                NetstarTempValues[tempValueName] = ajaxData;
                url = url + '?templateparam=' + encodeURIComponent(tempValueName);
                var ajaxConfig = {
                    plusData: {
                        pageObj: pageObj,
                    },
                    pageIidenti: url,
                    url: url,
                    type: 'GET',
                    dataType: 'html',
                    callBackFunc: function (isSuccess, data, _pageConfig) {
                        if (isSuccess) {
                            var _config = _pageConfig.plusData.pageObj;
                            var _configStr = JSON.stringify(_config);
                            var funcStr = 'NetstarTemplate.getConfigByAjaxUrl(pageConfig,' + _configStr + ')';
                            var starStr = '<container>';
                            var endStr = '</container>';
                            var containerPage = data.substring(data.indexOf(starStr) + starStr.length, data.indexOf(endStr));
                            var exp = /NetstarTemplate\.init\((.*?)\)/;
                            var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
                            containerPage = containerPage.replace(containerPage.match(exp)[0], funcStrRep);
                            var $container = nsPublic.getAppendContainer();
                            // $container.append(containerPage);
                            $body.append(containerPage);
                        }
                    }
                };
                pageProperty.getAndCachePage(ajaxConfig);

            },

        }
        NetstarComponent.dialogComponent.init(dialogCommon);
    };
    /**
     * 输入办理意见
     * @param callBackFunc
     */
    OperationFun.prototype.getSuggestion = function (callBackFunc, suggestionType) {
        var _this = this;
        var formArr = [{
            id: 'suggestion',
            label: '意见',
            type: 'textarea',
            inputWidth: 300,
            inputHeight: 120, //高
        }];
        var title = suggestionType ? '请输入撤回原因' : '请输入驳回意见';
        var suggestionDialogConfig = {
            id: "wf-suggestion-dialog",
            title: title,
            templateName: 'PC',
            plusClass: 'sss',
            width: '380px',
            height: '250px',
            shownHandler: function (data) {
                var dialogBodyId = data.config.bodyId;
                var formJson = {
                    id: dialogBodyId,
                    templateName: 'form',
                    componentTemplateName: 'PC',
                    defaultComoponentWidth: '20%',
                    isSetMore: false,
                };
                formJson.form = $.extend(true, [], formArr);
                var component = NetstarComponent.formComponent.getFormConfig(formJson);
                NetstarComponent.formComponent.init(component, formJson);

                addDialogBtns(this.id, function (value) {
                    _this.info.suggestion = value.suggestion;
                    if (typeof (callBackFunc) == 'function') {
                        callBackFunc();
                    }
                })
            },
            hiddenHandler: function () {
                if ($('container:last').length > 0) {
                    if ($('container:last').children().eq(0).hasClass('limsresultinput')) {
                        NetstarUI.resultTable.initShortkey();
                    }
                }
                if ($('button[ajax-disabled="true"]')) {
                    $('button[ajax-disabled="true"]').removeAttr('disabled');
                    $('button[ajax-disabled="true"]').removeAttr('ajax-disabled');
                }
            }
        }
        NetstarComponent.dialogComponent.init(suggestionDialogConfig);
    }
    /**
     * 设置改签/转办人
     * @param CallbackFun
     * @param isMultiple
     */
    OperationFun.prototype.getTransactor = function (CallbackFun, isMultiple) {
        var formArr = [{
            id: 'candidateUsers',
            label: '人员',
            type: 'select',
            column: 12,
            inputWidth: 200,
            hidden: false,
            multiple: isMultiple,
            url: getRootPath() + '/wfProcess/getUserList',
            textField: 'userName',
            valueField: 'userId',
            dataSrc: 'rows',
            listExpression: "<li>{{userName}}</li>",
            contentType: 'application/x-www-form-urlencoded'
        }];
        var dialog = {
            id: "wf-getTransactors-dialog",
            title: "请设置改签/转办人",
            templateName: 'PC',
            plusClass: 'sss',
            width: '340px',
            height: '250px',
            isSetMore: false,
            shownHandler: function (data) {
                var dialogBodyId = data.config.bodyId;
                var formJson = {
                    id: dialogBodyId,
                    templateName: 'form',
                    componentTemplateName: 'PC',
                    defaultComoponentWidth: '20%',
                    isSetMore: false,
                };
                formJson.form = $.extend(true, [], formArr);
                var component = NetstarComponent.formComponent.getFormConfig(formJson);
                NetstarComponent.formComponent.init(component, formJson);
                addDialogBtns(this.id, function (value) {
                    var transactor = value['candidateUsers'];
                    if (typeof (CallbackFun) == 'function') {
                        CallbackFun(transactor);
                    }
                })
            },
            hiddenHandler: function () {
                if ($('container:last').length > 0) {
                    if ($('container:last').children().eq(0).hasClass('limsresultinput')) {
                        NetstarUI.resultTable.initShortkey();
                    }
                }
                if ($('button[ajax-disabled="true"]')) {
                    $('button[ajax-disabled="true"]').removeAttr('disabled');
                    $('button[ajax-disabled="true"]').removeAttr('ajax-disabled');
                }
            }
        }
        NetstarComponent.dialogComponent.init(dialog);
    }

    /**
     * 根据办理人定义生成下拉选项的名称
     * @param transactorDef
     * @returns {string}
     */
    function getTransactorDefShowname(transactorDef) {
        var name = '';
        switch (transactorDef.type) {
            case 'user':
                if (transactorDef.processCreaterFlag) {
                    name += '流程创建者 ';
                }
                if (transactorDef.userOfPreviousActivity) {
                    name += '上一环节的办理人 ';
                }
                if (transactorDef.userOfOtherActivity) {
                    name = name + '"' + transactorDef.userOfOtherActivity.activityName + '"环节办理人 ';
                }
                if (transactorDef.candidateUsers) {
                    transactorDef.candidateUsers.forEach(function (user) {
                        name = name + user.userName + ' ';
                    })
                }
                break;
            case 'role':
                if (transactorDef.allDeptFlag) {
                    name = name + '所有部门'
                }
                if (transactorDef.deptOfPreviousActivity) {
                    name = name + '上一个环节所在部门'
                }
                if (transactorDef.deptOfOtherActivity) {
                    name = name + '"' + transactorDef.deptOfOtherActivity.activityName + '"环节所在部门';
                }
                if (transactorDef.candidateDept) {
                    name = name + '"' + transactorDef.candidateDept.deptName + '"部门';
                }
                name = name + '下的"' + transactorDef.role.roleName + '"角色 ';
                break;
            case 'post':
                if (transactorDef.allDeptFlag) {
                    name = name + '所有部门'
                }
                if (transactorDef.deptOfPreviousActivity) {
                    name = name + '上一个环节所在部门'
                }
                if (transactorDef.deptOfOtherActivity) {
                    name = name + '"' + transactorDef.deptOfOtherActivity.activityName + '"环节所在部门';
                }
                if (transactorDef.candidateDept) {
                    name = name + '"' + transactorDef.candidateDept.deptName + '"部门';
                }
                name = name + '下的"' + transactorDef.post.postName + '"岗位 ';
                break;
            case 'dept':
                name = name + '"' + transactorDef.candidateDept.deptName + '"部门 ';
                break;
            case 'group':
                name = name + '"' + transactorDef.candidateGroup.groupName + '"组 '
                break;
        }
        return name;
    }

    /**
     * 设置回退和复盘环节、办理意见
     */
    OperationFun.prototype.setRollback = function (doWhenRollback, callBackFunc) {
        var _this = this;
        this.post('workitems', function (rows) {
            var map = {};
            rows = rows.filter(function (row) {
                return !row.autoComplete || !row.autoFoward
            }).filter(function (row) {
                return row.workitemState && row.workitemState != 16 && row.workitemState != 128 && row.workitemState != 0 && row.workitemState != 1;
            });
            var canReplayRows = rows.filter(function (x) {
                return !x.cannotReplay;
            });
            var formArr = [{
                id: 'rollbackType',
                lable: '回退类型',
                type: 'radio',
                column: 12,
                inputWidth: 300,
                subdata: [{
                    id: 'reject',
                    name: '驳回至上一环节'
                }, {
                    id: 'rollback',
                    name: '跨环节回退'
                }],
                textField: 'name',
                valueField: 'id',
                value: 'reject'
            }, {
                id: 'rollbackTo',
                label: '回退至环节',
                type: 'select',
                column: 12,
                inputWidth: 200,
                subdata: rows,
                textField: 'activityName',
                valueField: 'workitemId',
                selectMode: 'multi',
                listExpression: "<li>{{activityName}}</li>"
            }, {
                id: 'replayTo',
                label: '复盘环节',
                type: 'select',
                column: 12,
                inputWidth: 200,
                subdata: canReplayRows,
                textField: 'activityName',
                valueField: 'activityId',
                listExpression: "<li>{{activityName}}</li>",
                selectMode: 'multi' //多选
            }];
            if (doWhenRollback) {
                _this.info.suggestionType = '2';
                formArr.push({
                    id: 'suggestion',
                    label: '意见',
                    type: 'textarea',
                    inputWidth: 300,
                    inputHeight: 120, //高
                    column: 12
                })
            }
            var dialog = {
                id: "wf-setRollback-dialog2",
                title: "请设置回退和复盘环节",
                templateName: 'PC',
                plusClass: 'sss',
                width: '380px',
                height: '360px',
                isSetMore: false,
                shownHandler: function (data) {
                    var dialogBodyId = data.config.bodyId;
                    var formJson = {
                        id: dialogBodyId,
                        templateName: 'form',
                        componentTemplateName: 'PC',
                        defaultComoponentWidth: '20%',
                        isSetMore: false,
                    };
                    formJson.form = $.extend(true, [], formArr);
                    var component = NetstarComponent.formComponent.getFormConfig(formJson);
                    NetstarComponent.formComponent.init(component, formJson);

                    addDialogBtns(this.id, function (value) {
                        if (value.rollbackTo) {
                            _this.info.workitemIds = value.rollbackTo.split(',');
                            _this.info.workitemId = null;
                        }
                        if (value.rollbackType == 'rollback' && !value.rollbackTo) {
                            nsalert('回退至环节不能为空', 'error');
                            return;
                        }
                        _this.info.replayActivities = value.replayTo.split(',');
                        if (value.suggestion) {
                            _this.info.suggestion = value.suggestion;
                        }
                        if (typeof (callBackFunc) == 'function') {
                            callBackFunc(value.rollbackType);
                        }
                    });
                },
                hiddenHandler: function () {
                    if ($('container:last').length > 0) {
                        if ($('container:last').children().eq(0).hasClass('limsresultinput')) {
                            NetstarUI.resultTable.initShortkey();
                        }
                    }
                    if ($('button[ajax-disabled="true"]')) {
                        $('button[ajax-disabled="true"]').removeAttr('disabled');
                        $('button[ajax-disabled="true"]').removeAttr('ajax-disabled');
                    }
                }
            }
            NetstarComponent.dialogComponent.init(dialog);
        }, function (msg) {
            nsalert('获取流程信息失败:' + msg, 'error');
        })
    }

    var postJSON = function (path, data, success, failure) {
        baseUrl = getRootPath() + '/nsEngine/';
        var ajaxConfig = {
            url: baseUrl + path,
            contentType: 'application/json',
            data: data,
            dataType: 'json',
            type: 'POST',
        }
        NetStarUtils.ajax(ajaxConfig, function (resp) {
            if (resp.success) {
                if (NetStarUtils.Browser.browserSystem == 'pc') {
                    for (var dialogI in NetstarComponent.dialog) {
                        switch (dialogI) {
                            case 'wf-setTransactors-dialog':
                            case 'wf-setRollback-dialog2':
                            case 'wf-getTransactors-dialog':
                            case 'wf-suggestion-dialog':
                                NetstarComponent.dialog[dialogI].vueConfig.close();
                                break;
                        }
                    }
                }
                if (typeof (success) == 'function') {
                    if (resp.data) {
                        success(resp.data);
                    } else if (resp.rows) {
                        success(resp.rows);
                    } else {
                        success(resp);
                    }
                }
            } else if (typeof (failure) == 'function') {
                failure(resp.msg);
            }
        }, true)
    };

    var post = function (path, data, success, failure) {
        baseUrl = getRootPath() + '/nsEngine/';
        var ajaxConfig = {
            url: baseUrl + path,
            type: 'POST',
            data: data,
            contentType: 'application/x-www-form-urlencoded',
        }
        NetStarUtils.ajax(ajaxConfig, function (resp) {
            if (resp.success) {
                if (NetStarUtils.Browser.browserSystem == 'pc') {
                    for (var dialogI in NetstarComponent.dialog) {
                        switch (dialogI) {
                            case 'wf-setTransactors-dialog':
                            case 'wf-setRollback-dialog2':
                            case 'wf-getTransactors-dialog':
                            case 'wf-suggestion-dialog':
                                NetstarComponent.dialog[dialogI].vueConfig.close();
                                break;
                        }
                    }
                }
                if (typeof (success) == 'function') {
                    if (resp.data) {
                        success(resp.data);
                    } else if (resp.rows) {
                        success(resp.rows);
                    } else {
                        success(resp);
                    }
                }
            } else if (typeof (failure) == 'function') {
                failure(resp.msg);
            }
        }, true)
    };

    var addDialogBtns = function (dialogId, confirmHandler) {
        var html = '' +
            '<div class="pt-btn-group" >' +
            '<button class="pt-btn pt-btn-default" id = "dialog-' + dialogId + '-footer-confirm">确认</button>' +
            '<button class="pt-btn pt-btn-default" id = "dialog-' + dialogId + '-footer-cancel">取消</button>' +
            '</div>';
        var $footGroup = document.getElementById('dialog-' + dialogId + '-footer-group');
        $footGroup.innerHTML = html;
        $('#dialog-' + dialogId + '-footer-confirm').on('click', function () {
            if ((typeof confirmHandler) == 'function') {
                var values = NetstarComponent.getValues('dialog-' + dialogId + '-body');
                confirmHandler(values);
            }
            //NetstarComponent.dialog[dialogId].vueConfig.close();
        });
        $('#dialog-' + dialogId + '-footer-cancel').on('click', function () {
            NetstarComponent.dialog[dialogId].vueConfig.close();
        });
    }


    return {
        instanceState: function (state) {
            return instanceState[state];
        },
        getInstanceState: function () {
            return instanceState;
        },
        workitemState: function (state) {
            return workitemState[state];
        },
        getWorkitemState: function () {
            return workitemState;
        },
        getWaitingList: function (activityName, success, failure) {
            post('waitingList/details', {}, success, failure);
        },
        getSimpleWaitingList: function (activityName, success, failure) {
            post('waitingList/all', {}, success, failure);
        },
        getForwardedList: function (activityName, success, failure) {
            post('forwardedList/all', {}, success, failure);
        },
        getTaskDoneList: function (activityName, success, failure) {
            post('taskDoneList/all', {}, success, failure);
        },
        createInstance: function (processId, bllObj, success, failure) {
            post('createInstance', {
                processId: processId,
                bllObj: bllObj
            }, success, failure);
        },
        createSubInstance: function (processId, bllObj, parentWorkitemId, success, failure) {
            post('createInstance', {
                processId: processId,
                bllObj: bllObj,
                parentWorkitemId: parentWorkitemId
            }, success, failure);
        },
        operation: function (workitemId) {
            return OperationInfoBuilder(workitemId);
        },
        //查询工作项信息
        getWorkitemInfo: function (activityInfo, callBackFun) {
            var workitemIds = '';
            for (var index = 0; index < activityInfo.workitems.length; index++) {
                workitemIds += activityInfo.workitems[index].workitemId;
                workitemIds += ",";
            }
            if (workitemIds.length > 0) {
                workitemIds = workitemIds.substr(0, workitemIds.length - 1);
            }
            var url = '/wfProcessInstance/getWorkItemDetail';
            var data = {
                workitemIds: workitemIds
            }

            $.get(url, data, function (dataReturn) {
                if (dataReturn.success) {
                    if (typeof callBackFun == 'function') {
                        var rows = dataReturn.rows;
                        var workitemHtml = {
                            str: '<ul>'
                        }
                        workitemHtml.append = function (attrName, timeStamp) {
                            if (timeStamp) {
                                this.str = this.str + attrName + moment(timeStamp).format('YYYY-MM-DD HH:mm:ss') + '<br/>'
                            }
                        }
                        for (var index = 0; index < rows.length; index++) {
                            var workitem = rows[index];
                            workitemHtml.str = workitemHtml.str + '<li style="font-size: 12px;">' +
                                '工作项办理人: ' + workitem.wfWorkitemAssignToName + '<br/>';
                            if (workitem.wfWorkitemWhenCreated) {
                                workitemHtml.append('创办时间: ', workitem.wfWorkitemWhenCreated);
                            }
                            if (workitem.wfWorkitemWhenCompleted) {
                                workitemHtml.append('签收时间: ', workitem.wfWorkitemWhenCompleted);
                            }
                            if (workitem.wfWorkitemWhenForwarded) {
                                workitemHtml.append('提交时间: ', workitem.wfWorkitemWhenForwarded);
                            }
                            if (workitem.wfWorkitemWhenArchived) {
                                workitemHtml.append('归档时间: ', workitem.wfWorkitemWhenArchived);
                            }
                            workitemHtml.str += '</li>';
                        }
                        workitemHtml.str += '</ul>';
                        callBackFun(workitemHtml.str);
                    }
                } else {
                    console.error("查询工作项信息失败: " + workitemIds);
                }
            });
        },
        preview: function (workitemId) {
            nsUI.flowChartViewer.tab.init({
                id: 'div',
                workitemId: workitemId,
                title: activityName,
                attrs: {},
            });
        },
        workFlowPreviewConfig: {
            url: '/wfProcessInstance/getInstanceLayout?', //  流程图地址
            panelUrl: '/wfProcessInstance/getOperationLogs?workitemId=', // 流程图面板地址
            // 面板显示信息
            // TEMPLATEWORD: {
            //     0: '创建了 {userName} 的任务',     // 开始
            //     1: '{userName} 签收了此任务',         // 签收
            //     2: '{userName} 提交了此任务',         // 提交
            //     3: '{userName} 回退了此环节',         // 回退
            //     4: '{userName} 撤回了此任务',         // 撤回
            //     5: '{userName} 挂起了此任务',         // 挂起
            //     6: '{userName} 恢复了此任务',         // 恢复
            //     7: '{userName} 将此任务置为应急状态',         // 应急
            //     8: '{userName} 驳回了此任务',         // 驳回
            //     9: '{userName} 将任务回退至环节{activity}', //回退至
            // },
            TEMPLATEWORD: {
                // 开始
                0: '<span class="flowchartviewer-timeline-time">{{date.wfOperationLogOperationTime}}</span>' +
                    '<div class="flowchartviewer-timeline-heade type-start"><span class="flowchartviewer-timeline-type"><span>创建待办</span></span></div>' +
                    '<div class="flowchartviewer-timeline-content"><span class=""><span>办理人：</span><span>{{wfOperationLogUserName}}</span></span></div>',
                // 签收
                1: '<span class="flowchartviewer-timeline-time">{{date.wfOperationLogOperationTime}}</span>' +
                    '<div class="flowchartviewer-timeline-heade type-end"><span class="flowchartviewer-timeline-type"><span>签收</span></span></div>' +
                    '<div class="flowchartviewer-timeline-content"><span class=""><span>办理人：</span><span>{{wfOperationLogUserName}}</span></span></div>',
                // 提交
                2: '<span class="flowchartviewer-timeline-time">{{date.wfOperationLogOperationTime}}</span>' +
                    '<div class="flowchartviewer-timeline-heade type-submit"><span class="flowchartviewer-timeline-type"><span>提交</span></span></div>' +
                    '<div class="flowchartviewer-timeline-content"><span class=""><span>办理人：</span><span>{{wfOperationLogUserName}}</span></span>' +
                    '<span class=""><span>意见：</span><span>{{wfOperationLogHandleSuggestion}}</span></span></div>',
                // 回退         
                3: '<span class="flowchartviewer-timeline-time">{{date.wfOperationLogOperationTime}}</span>' +
                    '<div class="flowchartviewer-timeline-heade type-return"><span class="flowchartviewer-timeline-type"><span>回退</span></span></div>' +
                    '<div class="flowchartviewer-timeline-content"><span class=""><span>办理人：</span><span>{{wfOperationLogUserName}}</span></span>' +
                    '<span class=""><span>回退起始环节：</span><span>{{wfOperationLogRollbackFrom}}</span></span>' +
                    '<span class=""><span>回退终止环节：</span><span>{{wfOperationLogRollbackTo}}</span></span>' +
                    '<span class=""><span>回退原因：</span><span>{{dict.wfOperationLogSuggestionType}}</span></span>' +
                    '<span class=""><span>意见：</span><span>{{wfOperationLogHandleSuggestion}}</span></span></div>',
                // 撤回        
                4: '<span class="flowchartviewer-timeline-time">{{date.wfOperationLogOperationTime}}</span>' +
                    '<div class="flowchartviewer-timeline-heade type-withdraw"><span class="flowchartviewer-timeline-type"><span>撤回</span></span></div>' +
                    '<div class="flowchartviewer-timeline-content"><span class=""><span>办理人</span><span>{{wfOperationLogUserName}}</span></span></div>',
                // 挂起   暂时没有      
                5: '{{wfOperationLogUserName}} 挂起了此任务',
                // 恢复   暂时没有      
                6: '{{wfOperationLogUserName}} 恢复了此任务',
                // 应急   暂时没有    
                7: '{{wfOperationLogUserName}} 将此任务置为应急状态',
                // 驳回       
                8: '<span class="flowchartviewer-timeline-time">{{date.wfOperationLogOperationTime}}</span>' +
                    '<div class="flowchartviewer-timeline-heade type-return"><span class="flowchartviewer-timeline-type"><span>回退</span></span></div>' +
                    '<div class="flowchartviewer-timeline-content"><span class=""><span>办理人：</span><span>{{wfOperationLogUserName}}</span></span>' +
                    '<span class=""><span>回退起始环节：</span><span>{{wfOperationLogRollbackFrom}}</span></span>' +
                    '<span class=""><span>回退终止环节：</span><span>{{wfOperationLogRollbackTo}}</span></span>' +
                    '<span class=""><span>回退原因：</span><span>{{dict.wfOperationLogSuggestionType}}</span></span>' +
                    '<span class=""><span>意见：</span><span>{{wfOperationLogHandleSuggestion}}</span></span></div>',
                //回退至         
                9: '<span class="flowchartviewer-timeline-time">{{date.wfOperationLogOperationTime}}</span>' +
                    '<div class="flowchartviewer-timeline-heade type-return"><span class="flowchartviewer-timeline-type"><span>回退</span></span></div>' +
                    '<div class="flowchartviewer-timeline-content"><span class=""><span>办理人：</span><span>{{wfOperationLogUserName}}</span></span>' +
                    '<span class=""><span>回退起始环节：</span><span>{{wfOperationLogRollbackFrom}}</span></span>' +
                    '<span class=""><span>回退终止环节：</span><span>{{wfOperationLogRollbackTo}}</span></span>' +
                    '<span class=""><span>回退原因：</span><span>{{dict.wfOperationLogSuggestionType}}</span></span>' +
                    '<span class=""><span>意见：</span><span>{{wfOperationLogHandleSuggestion}}</span></span></div>',
            },
            // 面板按钮
            TEMPLATEBTNS: {
                // 开始
                0: [],
                // 签收
                1: [],
                2: [{
                        name: '签收',
                        func: function (data) {
                            console.log(data);
                            var operationFun = nsEngine.operation().workitemId(data.active.workitemId).build();
                            operationFun.complete(function (resp) {
                                console.log(resp);
                                nsalert('签收成功', 'success');
                                nsEngine.workFlowPreviewConfig.refresh(data);
                            }, function (msg) {
                                nsalert(msg, 'error');
                            })
                        },
                    },
                    {
                        name: '驳回',
                        func: function (data) {
                            console.log(data);
                            var operationFun = nsEngine.operation().workitemId(data.active.workitemId).build();
                            operationFun.reject(function (resp) {
                                console.log(resp);
                                nsalert('驳回成功', 'success');
                                nsEngine.workFlowPreviewConfig.refresh(data);
                            }, function (msg) {
                                nsalert(msg, 'error');
                            });
                        },
                    },
                ],
                3: [{
                        name: '提交',
                        func: function (data) {
                            console.log(data);
                            var operationFun = nsEngine.operation().workitemId(data.active.workitemId).build();
                            operationFun.forWard(function (resp) {
                                console.log(resp);
                                nsalert('提交成功', 'success');
                                nsEngine.workFlowPreviewConfig.refresh(data);
                            }, function (msg) {
                                nsalert(msg, 'error');
                            });
                        },
                    },
                    {
                        name: '驳回',
                        func: function (data) {
                            console.log(data);
                            var operationFun = nsEngine.operation().workitemId(data.active.workitemId).build();
                            operationFun.reject(function (resp) {
                                console.log(resp);
                                nsalert('驳回成功', 'success');
                                nsEngine.workFlowPreviewConfig.refresh(data);
                            }, function (msg) {
                                nsalert(msg, 'error');
                            });
                        },
                    },
                    {
                        name: '驳回至',
                        func: function (data) {
                            console.log(data);
                            var operationFun = nsEngine.operation().workitemId(data.active.workitemId).build();
                            operationFun.rollback(function (resp) {
                                console.log(resp);
                                nsalert('驳回成功', 'success');
                                nsEngine.workFlowPreviewConfig.refresh(data);
                            }, function (msg) {
                                nsalert(msg, 'error');
                            });
                        },
                    }
                ],
                4: [{
                        name: '撤回',
                        func: function (data) {
                            console.log(data);
                            var operationFun = nsEngine.operation().workitemId(data.active.workitemId).build();
                            operationFun.withdraw(function (resp) {
                                console.log(resp);
                                nsalert('撤回成功', 'success');
                                nsEngine.workFlowPreviewConfig.refresh(data);
                            }, function (msg) {
                                nsalert(msg, 'error');
                            });
                        },
                    },
                    {
                        name: '应急',
                        func: function (data) {
                            console.log(data);
                            var operationFun = nsEngine.operation().workitemId(data.active.workitemId).build();
                            operationFun.emergency(function (resp) {
                                console.log(resp);
                                nsalert('应急成功', 'success');
                                nsEngine.workFlowPreviewConfig.refresh(data);
                            }, function (msg) {
                                nsalert(msg, 'error');
                            });
                        },
                    }
                ],
                5: [{
                    name: '应急',
                    func: function (data) {
                        console.log(data);
                        var operationFun = nsEngine.operation().workitemId(data.active.workitemId).build();
                        operationFun.emergency(function (resp) {
                            console.log(resp);
                            nsalert('应急成功', 'success');
                            nsEngine.workFlowPreviewConfig.refresh(data);
                        }, function (msg) {
                            nsalert(msg, 'error');
                        });
                    },
                }],
                16: [],
                32: [],
                128: []
            },
            refresh: function (data) {
                // console.log(data);
                NetstarUI.flowChartViewer.tab.refreshWorkflow(data.containerId);
            }
        }
    }
})();