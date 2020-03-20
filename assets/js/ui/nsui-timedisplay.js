nsUI.timeDisplay = function(time){
  var showTime;//受控的时间
  var timeDetail;//具体时分
  if(time == -1){
    time = '';
  }
  //time格式化formatTime
  // var formatTime = app.baseFunc.getStandardTimeString(time); 
  var formatTimeS = time;//传入参数时间戳
  var formatTime = new Date(time);
  //年，月，日，时，分
  var years = formatTime.getFullYear();
  var months = formatTime.getMonth() + 1;
  var days = formatTime.getDate();
  var hours = formatTime.getHours();
  var minutes = formatTime.getMinutes();
  if (minutes < 10){
    minutes = '0' + minutes;
  }

  timeDetail = hours + ':' + minutes;
  //星期处理
  var dayOfTheWeek;
  var dayOfTheWeekNum = formatTime.getDay();
  switch (dayOfTheWeekNum){
    case 0:
      dayOfTheWeek = '日';
      dayOfTheWeekNum = 7;
      break;
    case 1:
      dayOfTheWeek = '一';
      break;
    case 2:
      dayOfTheWeek = '二';
      break;
    case 3:
      dayOfTheWeek = '三';
      break;
    case 4:
      dayOfTheWeek = '四';
      break;
    case 5:
      dayOfTheWeek = '五';
      break;
    case 6:
      dayOfTheWeek = '六';
      break;
    default:
      console.error('日期格式错误');
  }
  
  var moment = new Date();
  var momentS = Number(moment);//当前时间时间戳
  if (momentS - formatTimeS < 2 * 24 * 60 * 60 * 1000) {
    if (moment.getDate() == formatTime.getDate()) {
      showTime = timeDetail;//今天显示时分
    } else {
      showTime = '昨天';  // 昨天显示昨天
    }
  } else if (momentS - formatTimeS < 7 * 24 * 60 * 60 * 1000) {
    showTime = '星期' + dayOfTheWeek; // 显示星期几
  } else {
    showTime = years + '/' + months + '/' + days; // 显示具体日期
  }
  var timeObj = {
    showTime: showTime,
    timeDetail: timeDetail
  }
  return timeObj;
}