var btnComponent = pageConfig.config.components[1];
var btnConfig = {
    btn:{
        text:'同步数据',
            handler: function () {
                var saveData = NetStarGrid.getSelectedData('nstemplate-layout-nscloud-datasync-list-0')[0].id
                var listData = NetStarGrid.getSelectedData('nstemplate-layout-nscloud-datasync-list-0')[0];
                //发送ajax
               
                var editdialogConfig = {
                    id: 'edit',
                    height: '80%',
                    width: '80%',
                    templateName: 'PC',
                    title: '同步数据',
                    shownHandler: function (data) {
                        var dialogBodyId = data.config.bodyId;
                        var dialogFooterId= data.config.footerId//footerId
                        $('#' + dialogBodyId).html(
                            ' <div id="data-synchronize-form" class="from-data-st"> </div> \
                            <div id="data-synchronize-list-1" class="btn-fix-st"></div>'                   
                        );
                        $('#' + dialogFooterId).html('\
                            <div id="data-synchronize-logon-btns" class="btn-fix-st"></div>'
                        )
                        var dataSynchronizeFromJson = {
                            id: 'data-synchronize-form',
                            templateName: "form",
                            componentTemplateName: 'PC',
                            isSetMore: false,
                            form: [{
                                id: 'remoteUrl',
                                label: '目标URL',
                                type: 'text',
                                disabled: true,
                                value: listData.remoteUrl,
                            }, {
                                id: 'toEnvironment',
                                label: '目标环境',
                                type: 'text',
                                disabled: true,
                                value:listData.toEnvironment,
                            }, {
                                id: 'toOrgId',
                                label: '目标机构ID',
                                type: 'text',
                                disabled: true,
                                value:listData.toOrgId,
                                inputWidth:300,
                            }]
                        }
                        var dataSynchronizeListJson1 = {
                            columns: [{
                                field: 'resourceName',
                                title: '资源类名',
                                width:400,
                                editConfig: {
                                    type: 'text',
                                },
                                
                                },
                                {
                                    field: 'latestSyncTime',
                                    title: '上次同步时间',
                                    width:400,
                                    columType: 'date',
                                    editConfig: {
                                        type: 'date',
                                        format: "YYYY-MM-DD HH:mm:ss",
                                       
                                    },
                                    formatHandler: {
                                        type: 'date',
                                        data: {
                                            formatDate: "YYYY-MM-DD HH:mm:ss",
                                        }
                                    },
                                    
                                },
                                {
                                    field: 'latestUpdateTime',
                                    title: '最近更新时间',
                                    width:400,                                   
                                    editConfig: {
                                        type: 'date',
                                        format: "YYYY-MM-DD HH:mm:ss",
                                       
                                    },
                                    formatHandler: {
                                        type: 'date',
                                        data: {
                                            formatDate: "YYYY-MM-DD HH:mm:ss",
                                        }
                                    },
                                    
                                },
                            ],
                            data: {
                                idField: 'id',
                                tableID: 'data-synchronize-list-1',
                                src:getRootPath() + '/dataSync/resourceConfig/getChanged',///dataSync/syncEnvironment/save
                                type:'GET',
                                contentType:'application/x-www-form-urlencoded',                   
                                dataSrc:'rows',
                                data:
                                {
                                    syncEnvironmentId:saveData//syncEnvironmentId
                                }
                                
                            },
                            ui: {
                                selectMode: 'multi',
                                isCheckSelect: true,
    
                                isHaveEditDeleteBtn: true,
                                isHaveAddBtn: true,
                                isAutoSerial: false,

                               
                            }
                        }
                        
                        var dataSynchronizeBtn = {
                            id:'data-synchronize-logon-btns',
                            btns:[{
                                text:"确定",
                                handler:function(){               
                                    var _syncVo = NetStarGrid.getSelectedData('nstemplate-layout-nscloud-datasync-list-0')[0];
                                    var _syncResources = NetStarGrid.getCheckedData('data-synchronize-list-1');
                                    //同步数据是个voList 
                                    var syncAjaxData = _syncVo;
                                    syncAjaxData.resources = _syncResources;

                                    NetStarUtils.ajax({
                                        url:getRootPath() +'/dataSync/syncByEnvironment',
                                        data:syncAjaxData,
                                        type:'POST',
                                        // contentType: 'application/json; charset=utf-8', 
                                  
                                    },function(res, _ajaxConfig){
                                        nsalert("保存成功", 'success');
                                    })

                                },
                            }]
                        }
                                                      
                     vueButtonComponent.init(dataSynchronizeBtn);
                        var component = NetstarComponent.formComponent.getFormConfig(dataSynchronizeFromJson, {});
                        NetstarComponent.formComponent.init(component, dataSynchronizeFromJson);
                        NetStarGrid.init(dataSynchronizeListJson1);

             
                        NetstarComponent.fillValues("data-synchronize-form",listData)  
                    }
                }
                NetstarComponent.dialogComponent.init(editdialogConfig);
            }
         }
    }
    var btnsaveConfig = {
        btn:{
            text:'登录',
                handler: function () {
                    //登录页面
                    var saveData = NetStarGrid.getSelectedData('nstemplate-layout-nscloud-datasync-list-0')[0];
                    var logondialogConfig = {
                        id: 'logondatasynchronize',
                        height: '35%',
                        width: '45%',
                        templateName: 'PC',
                        title: '登录', 
                        shownHandler: function (data) {
                            var dialogBodyId = data.config.bodyId;
                            var dialogFooterId= data.config.footerId//footerId
                            $('#' + dialogBodyId).html(
                                ' <div id="data-synchronize-logon" class="from-data-st"> </div> \
                                '
                            );
                            $('#' + dialogFooterId).html(
                                '<div id="data-synchronize-logon-fixbtn" class="btn-fix-st"></div>'
                            )
                            var logondataJson = {
                                id: 'data-synchronize-logon',
                                templateName: 'form',
                                componentTemplateName: 'PC',
                                defaultComponentWidth: '100%',
                                isSetMore: false,
                                // formStyle: "pt-form-normal",
                                form: [
                                    {
                                        id: "orgName",
                                        type: "text",
                                        label: "机构名称",
                                        rules: "required",
                                        value:saveData.toOrgName
                                        
                                    },{
                                        id: "username",
                                        type: "text",
                                        label: "用户名",
                                        rules: "required",
                                        value:saveData.toAccount
                                        
                                    },
                                    {
                                        id: "password",
                                        type: "password",
                                        label: "密码",              
                                        rules: "required",
                                        value:''
                                    }
                                ]
                            };
                            var btnsdataJson = {
                                id: 'data-synchronize-logon-fixbtn',
                                btns: [{
                                    text: '登录',
                                    handler: function () {
                               
                                        var form = NetstarComponent.getValues('data-synchronize-logon');
                                     
                                        var url = saveData.remoteUrl;  //getRootPath() +'/system/jwtlogin'
                                        if(url ==''||undefined){
                                            alert('地址不存在')
                                            return;
                                        }
                                       
                                        if(url.substring(url.length-1)!=='/'){
                                            url=url+'/';
                                            }
                                        form.login = 1;
                                        $.ajax({
                                            url:url + 'system/jwtlogin',//http://api.cloud.netstar-soft.com/system/jwtlogin
                                            type: 'POST',
                                            contentType: 'application/x-www-form-urlencoded',
                                            data: form,   
                                            success:function(res){                                                              
                                                //保存数据的赋值
                                                saveData.otherToken = res.data;
                                                saveData.toAccount = form.username;
                                                saveData.toPwd = form.password;                                           
                                                saveData.objectState = 2;
                                                $.ajax({
                                                  
                                                    url: url +'/servletContexts/properties',
                                                    type:'GET',
                                                    contentType: 'application/x-www-form-urlencoded',
                                                    headers: {
                                                        Authorization :res.data,
                                                    },
                                                    success:function(propertiesRes){
                                                        debugger;
                                                        saveData.toEnvironment = propertiesRes.data.context.env
                                                        saveData.toOrgName = propertiesRes.data.user.orgName
                                                        saveData.toOrgId = propertiesRes.data.user.orgId
                                                        saveData.toAccount = propertiesRes.data.user.account
                                                        saveData.toUserId = propertiesRes.data.user.userId
                                                        NetStarUtils.ajax({
                                                            url:getRootPath() +'/dataSync/syncEnvironment/refreshToken',
                                                            data:saveData,
                                                            type:'GET',
                                                            // contentType: 'application/json; charset=utf-8',                                                      
                                                        },function(res, _ajaxConfig){
                                                            nsalert("保存成功", 'success');                                                         
                                                            NetstarComponent.dialog.logondatasynchronize.vueConfig.close();//关闭弹框
                                                        })
                                                    }
                                                })                                             
                                            },
                                            error:function(res){
                                                nsalert('登录用户获取token错误','error')
                                            }                                             
                                        })
                                    }
                                }]
                            }                                  
                            vueButtonComponent.init(btnsdataJson);
                            var component = NetstarComponent.formComponent.getFormConfig(logondataJson, {});
                            NetstarComponent.formComponent.init(component, logondataJson);
                        }
                    }
                    NetstarComponent.dialogComponent.init(logondialogConfig);
                }
             }
        }
    
    btnComponent.field.push(btnsaveConfig);
btnComponent.field.push(btnConfig);