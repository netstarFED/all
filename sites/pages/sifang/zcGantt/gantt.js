var ganttComponents = {
    // 获取甘特图数据
    
    getGanttModel:function($,cb){
        var tasks = {};
        var obj = {state:1}
        $.ajax({
            // url : "http://localhost:2000/data/ganttData.json",
            // type : "GET",
            url: ganttComponents.getRootPathUrl() + "/zc/sampleAccepts/getAppointmentPage",
            type: "POST",
            headers:{
                "Authorization":JSON.parse(ganttComponents.getLocalStorge("Authorization")).code,
                "content-type":"application/json"
            },
            data:JSON.stringify(obj), 
            success : function(res){
                if(res.success){
                    tasks.data = res.rows;  
                    tasks.success = true; 
                }else{
                    var str = "接口返回错误"
                    tasks.success = false;
                    tasks.info = str;
                }
                cb(tasks);
            },
            fail : function(err){
                console.log(err)
            }
        });
    },
    // 甘特图数据转换
    getGanttController:function($,cb){
        ganttComponents.getGanttModel($,(res)=>{
            if(res.success){
                var ganttData = res.data
                var tasks = {
                    success:res.success,
                    data:[]
                }
                for(var i = 0,len = ganttData.length; i < len; i++){
                    var obj = {
                        parent:0,
                        id:ganttData[i].id,
                        start_date: ganttComponents.formatDate(ganttData[i].whenBegin),// 开始时间
                        end_date: ganttComponents.formatDate(ganttData[i].whenEnd),// 结束时间
                        duration: ganttComponents.dateDiff(ganttData[i].whenBegin,ganttData[i].whenEnd),// 持续时间
                        text: ganttData[i].rdProjectName,// 项目名称
                        person: ganttData[i].modifiedByName, // 项目负责人
                        projectType: ganttData[i].sampleCateName?ganttData[i].sampleCateName:"无检测类型", // 检测类型
                        operatingMode: ganttData[i].operatingMode?ganttData[i].operatingMode:"无工况详情"
                    }
                    tasks.data.push(obj);
                }
                cb(tasks);
            }else{
                cb(res);
            }
        })
    },
    // 甘特图初始化(view层)
    init:function(gantt,tasks,id){
        gantt.config.columns = [{ // 初始化列
            name: "text", //自定义字段
            label: "项目名称", //用于界面展示的名称
            //tree: true, //树形结构
            width: '*', // *是自适应宽度
        }, {
            name: "person", 
            label: "项目负责人",
            align: "center",
            width: '70'
        }, {
            name: "projectType", 
            label: "检测类型",
            align: "center",
            width: '70'
        }];
        // 表格列宽自适应
        gantt.config.autofit = true;
        // 取消双击事件弹框
        gantt.config.details_on_dblclick = false;
        // 取消用户拖动条形图来改变位置
        gantt.config.drag_move = false;
        // 取消用户通过拖拽任务的条形图的两端来改变工期
        gantt.config.drag_resize = false;
        // 取消用户推拽条形图上用来调整进度百分比的小按钮
        gantt.config.drag_progress = false;
        // 取消通过拖拽的方式新增任务依赖的线条
        gantt.config.drag_links = false;
        gantt.config.autoscroll = true;
        gantt.config.initial_scroll = false;
        // gantt.config.grid_resizer_attribute = "gridresizer";
        gantt.config.min_column_width = 20;
        // 甘特图提示
        gantt.templates.tooltip_text = function (start, end, task) {
            // console.log(task);
            var startTime = ganttComponents.formatDate(start);
            var endTime = ganttComponents.formatDate(end);
            return "<b>项目名称:</b> " + task.text + 
                "<br/><b>项目负责人:</b>" + task.person +
                "<br/><b>开始时间:</b> " + startTime +
                "<br/><b>结束时间:</b> " + endTime + 
                "<br/><b>持续时间:</b>" + task.duration + "天" +                 
                "<br/><b>检测类型:</b>" + task.projectType + 
                "<br/><b>使用需求:</b>" + task.operatingMode;
        };
        // 设置右侧甘特图的时间标尺(%Y:年,%F:月,%j:日,%D:星期)以及样式
        gantt.config.grid_width = 500; // 设置左侧表格宽度
        gantt.config.xml_date = "%Y-%m-%d %H:%i:%s";
        gantt.config.scale_height = 100; //设置时间刻度的高度和网格的标题
        gantt.config.order_branch = false; // 设置可以拖动
		gantt.config.order_branch_free = false; // 设置可以拖动
        gantt.config.scale_unit = "month";	//按月显示
        gantt.config.date_scale = "%Y,%F";	//设置时间刻度的格式（X轴） 多个尺度
        gantt.config.scale_height = 100; //设置时间刻度的高度和网格的标题
        gantt.config.subscales = [       //指定第二个时间刻度
            {unit: "day", step: 1, date: "%D"},  
			{unit: "day", step: 1, date: '%j'},
        ];	
        gantt.config.fit_tasks = true; // 当task的长度改变时，自动调整图表坐标轴区间用于适配task的长度

        gantt.init(id); // 挂载到id为calendar的div中。
        gantt.parse(tasks);
    },
    getRootPathUrl:function(){
        var urlPrefix = JSON.parse(localStorage.getItem('NetstarResetServerInfo')).url;
        return urlPrefix;
    },
    getLocalStorge:function(str){
        return localStorage.getItem(str);
    },
    formatDate:function(date){
        var d = new Date(date)
        var resDate = d.getFullYear() + '-' + ganttComponents.p((d.getMonth() + 1)) + '-' + ganttComponents.p(d.getDate());
        return resDate
    },
    p:function(s){
        return s < 10 ? '0' + s : s
    },
    dateDiff:function(startDate, endTime){
        var stime = startDate;
        var etime = endTime;
        // 两个时间戳相差的毫秒数
        var usedTime = etime - stime;
        // 计算相差的天数  
        var days = Math.floor(usedTime / (24 * 3600 * 1000));
        // 计算天数后剩余的毫秒数
        var leave1 = usedTime % (24 * 3600 * 1000);  
        // 计算出小时数  
        var hours = Math.floor(leave1 / (3600 * 1000));
        // 计算小时数后剩余的毫秒数
        var leave2 = leave1 % (3600 * 1000);        
        // 计算相差分钟数
        var minutes = Math.floor(leave2 / (60 * 1000));
        var time = days + "天" + hours + "时" + minutes + "分";
        return days;
    }
}
// function getRootPathUrl(){
//     var urlPrefix = JSON.parse(localStorage.getItem('NetstarResetServerInfo')).url;
//     return urlPrefix;
// }
// function getLocalStorge(str){

// }
// function formatDate(date){
//     var d = new Date(date)
//     var resDate = d.getFullYear() + '-' + p((d.getMonth() + 1)) + '-' + p(d.getDate());
//     return resDate
// }
// function p(s) {
//     return s < 10 ? '0' + s : s
// }
// function dateDiff(startDate, endTime) {
//     let stime = startDate;
//     let etime = endTime;
//     // 两个时间戳相差的毫秒数
//     let usedTime = etime - stime;
//     // 计算相差的天数  
//     let days = Math.floor(usedTime / (24 * 3600 * 1000));
//     // 计算天数后剩余的毫秒数
//     let leave1 = usedTime % (24 * 3600 * 1000);  
//     // 计算出小时数  
//     let hours = Math.floor(leave1 / (3600 * 1000));
//     // 计算小时数后剩余的毫秒数
//     let leave2 = leave1 % (3600 * 1000);        
//     // 计算相差分钟数
//     let minutes = Math.floor(leave2 / (60 * 1000));
//     let time = days + "天" + hours + "时" + minutes + "分";
//     return days;
// }
