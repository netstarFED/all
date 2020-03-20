NetstarUI.holiday = {
    config: {},
    currentSelectedArr: [],
    fullYearByServerData: [],
    fullYearJsonByServerData: {},
    fillHtml: function (_id, fullYearHtml) {
        if ($('#' + _id).length == 1) {
            $('#' + _id).html(fullYearHtml);
            //给日期绑定单击事件
            var $bindClick = $('#' + _id + ' td[bind-click="true"]');

            function bindClickHandler(ev) {
                var $td = $(ev.target).closest('td');
                $td.toggleClass('current');
                var month = $td.attr('ns-month');
                var date = $td.attr('ns-date');
                if ($td.hasClass('current')) {
                    NetstarUI.holiday.currentSelectedArr.push(date);
                } else {
                    //判断当前值是否已存储，如果存储需要移除
                    var currentSelectedArr = NetstarUI.holiday.currentSelectedArr;
                    var existIndex = -1;
                    for (var s = 0; s < currentSelectedArr.length; s++) {
                        if (currentSelectedArr[s] == date) {
                            existIndex = s;
                            break;
                        }
                    }
                    if (existIndex > -1) {
                        currentSelectedArr.splice(existIndex, 1); //从数组中移除
                    }
                }
            }
            $bindClick.off('click', bindClickHandler);
            $bindClick.on('click', bindClickHandler);
        }
    },
    //获取天数的html
    getFullYearsHtml: function (_monthDaysWeekJson, _weeksArr) {
        var theadHtml = this.getWeekHtml(_weeksArr);
        var fullYearHtml = '';
        var fullYearJsonByServerData = NetstarUI.holiday.fullYearJsonByServerData ? NetstarUI.holiday.fullYearJsonByServerData : {};
        for (var monthI in _monthDaysWeekJson) {
            var monthData = _monthDaysWeekJson[monthI];
            var trHtml = '';
            for (var rowI = 0; rowI < monthData.length; rowI++) {
                var rowData = monthData[rowI];
                trHtml += '<tr>';
                for (var colI = 0; colI < rowData.length; colI++) {
                    var colData = rowData[colI];
                    var classStr = '';
                    if ($.isEmptyObject(colData)) {
                        trHtml += '<td></td>';
                    } else {
                        var currentMomentJson = typeof (fullYearJsonByServerData[colData.date]) == 'object' ? fullYearJsonByServerData[colData.date] : {};
                        var holidayNameHtml = '';
                        if (!$.isEmptyObject(currentMomentJson)) {
                            if (currentMomentJson.isDayoff == 1) {
                                classStr += ' weekend';
                            } else {
                                classStr = '';
                            }
                            if (currentMomentJson.holidayName) {
                                classStr += ' holiday-date';
                                holidayNameHtml = '<span class="lunar-calendar" ns-holidayname="true">' + currentMomentJson.holidayName + '</span>';
                            }
                        }else{
                            switch (colData.weekday) {
                                case 6:
                                case 7:
                                    classStr = 'weekend';
                                    break;
                            }
                        }
                        trHtml += '<td class="date ' + classStr + '" ns-month="' + monthI + '" bind-click="true" ns-date="' + colData.date + '" ns-weekday="' + colData.weekday + '">' +
                            '<span>' + colData.day + '</span>' +
                            holidayNameHtml +
                            '</td>';
                    }
                }
                trHtml += '</tr>';
            }
            var englishMonth;
            switch (Number(monthI)) {
                case 1:
                    englishMonth = 'January';
                    break;
                case 2:
                    englishMonth = 'February';
                    break;
                case 3:
                    englishMonth = 'March';
                    break;
                case 4:
                    englishMonth = 'April';
                    break;
                case 5:
                    englishMonth = 'May';
                    break;
                case 6:
                    englishMonth = 'June';
                    break;
                case 7:
                    englishMonth = 'July';
                    break;
                case 8:
                    englishMonth = 'August';
                    break;
                case 9:
                    englishMonth = 'September';
                    break;
                case 10:
                    englishMonth = 'October';
                    break;
                case 11:
                    englishMonth = 'November';
                    break;
                case 12:
                    englishMonth = 'December';
                    break;
            }
            fullYearHtml += '<div class="col-lg-3 col-md-4 col-sm-6 col-xs-6">' +
                '<div class="pt-calendar-month">' + monthI + '月<span>' + englishMonth + '</span></div>' +
                '<div class="pt-calendar-content">' +
                '<table>' +
                theadHtml +
                '<tbody>' +
                trHtml +
                '</tbody>' +
                '</table>' +
                '</div>' +
                '</div>'
        }
        return fullYearHtml;
    },
    //获取星期html
    getWeekHtml: function (_weeksArr) {
        var weekHtml = '';
        for (weekI = 0; weekI < _weeksArr.length; weekI++) {
            weekHtml += '<th class="calendar-item">' + _weeksArr[weekI] + '</th>';
        }
        var html = '<thead>' +
            '<tr class="pt-calendar-week">' +
            weekHtml +
            '</tr>' +
            '</thead>';
        return html;
    },
    //获取显示星期的顺序
    getWeeksThead: function (_firstDay) {
        //设置一周中的第一天，星期天为0，星期一为1,依次类推
        _firstDay = typeof (_firstDay) == 'number' ? _firstDay : 1;
        var weeksArr = [];
        switch (_firstDay) {
            case 0:
                weeksArr = ['日', '一', '二', '三', '四', '五', '六'];
                break;
            case 1:
                weeksArr = ['一', '二', '三', '四', '五', '六', '日'];
                break;
            case 2:
                weeksArr = ['二', '三', '四', '五', '六', '日', '一'];
                break;
            case 3:
                weeksArr = ['三', '四', '五', '六', '日', '一', '二'];
                break;
            case 4:
                weeksArr = ['四', '五', '六', '日', '一', '二', '三'];
                break;
            case 5:
                weeksArr = ['五', '六', '日', '一', '二', '三', '四'];
                break;
            case 6:
                weeksArr = ['六', '日', '一', '二', '三', '四', '五'];
                break;
        }
        return weeksArr;
    },
    //根据月份和月份显示天数计算对应显示的星期
    getDaysWeeksByMonth: function (_year, _month, _days) {
        var firstDay = NetstarUI.holiday.config.firstDay;
        firstDay = typeof (firstDay) == 'number' ? firstDay : 1;
        //年份月份和月份对应的天数
        var monthStr = _month < 10 ? '0' + _month.toString() : _month.toString();
        var daysWeekArr = [];
        for (var dayI = 1; dayI <= _days; dayI++) {
            var dayStr = dayI < 10 ? '0' + dayI.toString() : dayI.toString();
            var yearMonthDayStr = _year + '-' + monthStr + '-' + dayStr;
            var weekDay = Number(moment(yearMonthDayStr, 'YYYY-MM-DD').format('E')); //计算指定日期是这周第几天
            var json = {
                date: yearMonthDayStr,
                day: dayI,
                weekday: weekDay,
            };
            daysWeekArr.push(json);

            var currentCompareWeek = weekDay;
            var currentCompareEndWeek = 7;
            if (firstDay == 0) {
                //默认周的第一天从0开始
                currentCompareEndWeek = 6;
                if (weekDay == 7) {
                    currentCompareWeek = 0;
                }
            }
            //weekDay=7表示周日 weekDay为1表示周一
            if (dayI == 1) {
                //月份中第一天是周几和默认显示周的第一天进行比较
                if(firstDay == 1){
                    if (currentCompareWeek > firstDay) {
                        for (var emptyI = 0; emptyI < (weekDay - 1); emptyI++) {
                            daysWeekArr.unshift({});
                        }
                    }
                }else{
                    if (currentCompareWeek > firstDay) {
                        for (var emptyI = 0; emptyI < weekDay; emptyI++) {
                            daysWeekArr.unshift({});
                        }
                    }
                }
            }

            if (dayI == _days) {
                if (currentCompareWeek < currentCompareEndWeek) {
                    for (var d = currentCompareWeek; d < currentCompareEndWeek; d++) {
                        daysWeekArr.push({});
                    }
                }
            }
        }
        return daysWeekArr;
    },
    getRowAndColByMonthDaysAndFirstDay: function (_monthsDaysJson) {
        var monthDaysWeekJson = {};
        for (var monthI in _monthsDaysJson) {
            monthDaysWeekJson[monthI] = {};
            var weekDaysArr = _monthsDaysJson[monthI].weekDays;
            var forCount = Math.floor(weekDaysArr.length / 7);
            var rowColArr = [];
            for (var i = 0; i <= forCount; i++) {
                var colArr = [];
                //起始条数 0*7 1*7 2*7 3*7 4*7 5*7 
                //结束条数 7 7*2 7*3 7*4 7*5
                var startI = i * 7;
                var endI = 7 * (i + 1);
                if (endI > weekDaysArr.length) {

                } else {
                    for (var colI = startI; colI < endI; colI++) {
                        colArr.push(weekDaysArr[colI]);
                    }
                    rowColArr.push(colArr);
                }
            }
            if(rowColArr.length * 7 < weekDaysArr.length){
                var lastDayArr = [];
                for(var r=rowColArr.length*7; r<weekDaysArr.length; r++){
                    lastDayArr.push(weekDaysArr[r]);
                }
                rowColArr.push(lastDayArr);
            }
            monthDaysWeekJson[monthI] = rowColArr;
        }
        return monthDaysWeekJson;
    },
    //根据年份获取每个月共有多少天
    getMonthsDaysByYear: function (_year) {
        var monthsDaysJson = {};
        for (var monthI = 1; monthI < 13; monthI++) {
            //循环输出1月份到12月份的天数
            var monthStr = monthI < 10 ? '0' + monthI.toString() : monthI.toString();
            var yearMonthStr = _year.toString() + '-' + monthStr;
            var days = moment(yearMonthStr, "YYYY-MM").daysInMonth();
            var daysWeekArr = this.getDaysWeeksByMonth(_year, monthI, days);

            monthsDaysJson[monthI] = {
                days: days,
                weekDays: daysWeekArr
            };
        }
        return monthsDaysJson;
    },
    //根据开始年份和结束年份获取可选择的年份区间
    getRangeYearByStartYearAndEndYear: function (startYear, endYear) {
        startYear = typeof (startYear) == 'undefined' ? 1970 : startYear;
        endYear = typeof (endYear) == 'undefined' ? moment().year() : endYear;
        var rangeYearArr = [];
        for (var yearI = startYear; yearI < (endYear + 1); yearI++) {
            rangeYearArr.push({
                name: yearI.toString(),
                value: yearI
            });
        }
        return rangeYearArr;
    },
    //设置默认值
    setDefault: function (_config) {
        var defaultParams = {
            year: moment().year(), //今年
            startYear: 1970,
            endYear: moment().year(), //今年
            firstDay: 1, //设置一周中的第一天 ，星期天为0，星期一为1,依次类推
        };
        NetStarUtils.setDefaultValues(_config, defaultParams);
    },
    setHtmlStateByServerData: function (rows) {
        if (!$.isArray(rows)) {
            rows = [];
        }
        var fullYearJsonByServerData = {};
        for (var dateI = 0; dateI < rows.length; dateI++) {
            var dateData = rows[dateI];
            var nsDate = typeof (dateData.nsDate) == 'number' ? dateData.nsDate : Number(dateData.nsDate);
            var momentDate = moment(nsDate).format('YYYY-MM-DD');
            fullYearJsonByServerData[momentDate] = dateData;
        }
        NetstarUI.holiday.fullYearByServerData = rows;
        NetstarUI.holiday.fullYearJsonByServerData = fullYearJsonByServerData;

        var fullYearHtml = NetstarUI.holiday.getFullYearsHtml(NetstarUI.holiday.config.monthDaysWeekJson, NetstarUI.holiday.config.weeksArr);
        NetstarUI.holiday.fillHtml(NetstarUI.holiday.config.id, fullYearHtml);
    },
    setHtmlByYear: function (_year, _id) {
        this.getFullYearData(_year, _id);
        this.getFullYearsServerDataByAjax(_year, this.setHtmlStateByServerData);
    },
    //获取全年的数据
    getFullYearData: function (_year, _id) {
        var monthsDaysJson = this.getMonthsDaysByYear(_year);
        var monthDaysWeekJson = this.getRowAndColByMonthDaysAndFirstDay(monthsDaysJson);
        var weeksArr = this.getWeeksThead(NetstarUI.holiday.config.firstDay);
        NetstarUI.holiday.config.monthDaysWeekJson = monthDaysWeekJson;
        NetstarUI.holiday.config.weeksArr = weeksArr;
        //var fullYearHtml = this.getFullYearsHtml(monthDaysWeekJson,weeksArr);
        //this.fillHtml(_id,fullYearHtml);
    },
    //根据年份调用服务端查询返回一年的日期数据
    getFullYearsServerDataByAjax: function (_year, _callBackFunc) {
        var serverYearAjaxConfig = {
            url: 'https://qaapi.wangxingcloud.com//system/holiday/getDaysOfYear',
            contentType: 'application/x-www-form-urlencoded',
            type: "post",
            data: {
                year: _year
            },
            plusData: {
                callBackFunc: _callBackFunc
            },
        };
        NetStarUtils.ajax(serverYearAjaxConfig, function (res, ajaxOptions) {
            if (res.success) {
                if (typeof (ajaxOptions.plusData.callBackFunc) == 'function') {
                    ajaxOptions.plusData.callBackFunc(res.rows);
                }
            } else {
                var msg = res.msg ? res.msg : '返回值false';
                nsalert(msg);
            }
        }, true)
    },
    //初始化
    init: function (_config) {
        this.setDefault(_config);
        NetstarUI.holiday.config = _config;
        this.getFullYearData(_config.year, _config.id);
        this.getFullYearsServerDataByAjax(_config.year, this.setHtmlStateByServerData);
    }
}
//moment([2000]).isLeapYear() // true 判断是否是闰年
/*moment.locale('zh-cn',{
    months : '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
    monthsShort : '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
    weekdays : '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
    weekdaysShort : '周日_周一_周二_周三_周四_周五_周六'.split('_'),
    weekdaysMin : '日_一_二_三_四_五_六'.split('_'),
    longDateFormat : {
        LT : 'Ah点mm分',
        LTS : 'Ah点m分s秒',
        LTSS : 'AH:m',
        L : 'YYYY-MM-DD',
        LL : 'YYYY年MMMD日',
        LLL : 'YYYY年MMMD日Ah点mm分',
        LLLL : 'YYYY年MMMD日ddddAh点mm分',
        l : 'YYYY-MM-DD',
        ll : 'YYYY年MMMD日',
        lll : 'YYYY年MMMD日Ah点mm分',
        llll : 'YYYY年MMMD日ddddAh点mm分'
    },
    meridiemParse: /凌晨|早上|上午|中午|下午|晚上/,
    meridiemHour: function (hour, meridiem) {
        if (hour === 12) {
            hour = 0;
        }
        if (meridiem === '凌晨' || meridiem === '早上' ||
                meridiem === '上午') {
            return hour;
        } else if (meridiem === '下午' || meridiem === '晚上') {
            return hour + 12;
        } else {
            // '中午'
            return hour >= 11 ? hour : hour + 12;
        }
    },
    meridiem : function (hour, minute, isLower) {
        var hm = hour * 100 + minute;
        if (hm < 600) {
            return '凌晨';
        } else if (hm < 900) {
            return '早上';
        } else if (hm < 1130) {
            return '上午';
        } else if (hm < 1230) {
            return '中午';
        } else if (hm < 1800) {
            return '下午';
        } else {
            return '晚上';
        }
    },
    calendar : {
        sameDay : function () {
            return this.minutes() === 0 ? '[今天] Ah[点整]' : '[今天] LTSS';
        },
        nextDay : function () {
            return this.minutes() === 0 ? '[明天] Ah[点整]' : '[明天] LTSS';
        },
        lastDay : function () {
            return this.minutes() === 0 ? '[昨天] Ah[点整]' : '[昨天] LTSS';
        },
        nextWeek : function () {
            var startOfWeek, prefix;
            startOfWeek = moment().startOf('week');
            prefix = this.unix() - startOfWeek.unix() >= 7 * 24 * 3600 ? '[下]' : '[本]';
            return this.minutes() === 0 ? prefix + 'ddd AH点整' : prefix + 'ddd AH:mm';
        },
        lastWeek : function () {
            var startOfWeek, prefix;
            startOfWeek = moment().startOf('week');
            prefix = this.unix() < startOfWeek.unix()  ? '[上]' : '[本]';
            return this.minutes() === 0 ? prefix + 'ddd AH点整' : prefix + 'ddd AH:mm';
        },
        sameElse : 'LL'
    },
    ordinalParse: /\d{1,2}(日|月|周)/,
    ordinal : function (number, period) {
        switch (period) {
        case 'd':
        case 'D':
        case 'DDD':
            return number + '日';
        case 'M':
            return number + '月';
        case 'w':
        case 'W':
            return number + '周';
        default:
            return number;
        }
    },
    relativeTime : {
        future : '%s内',
        past : '%s前',
        s : '几秒',
        m : '1 分钟',
        mm : '%d 分钟',
        h : '1 小时',
        hh : '%d 小时',
        d : '1 天',
        dd : '%d 天',
        M : '1 个月',
        MM : '%d 个月',
        y : '1 年',
        yy : '%d 年'
    },
    week : {
        // GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效
        dow : 1, // Monday is the first day of the week.
        doy : 4  // The week that contains Jan 4th is the first week of the year.
    }
})*/