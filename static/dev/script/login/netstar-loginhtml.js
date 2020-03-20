var NetstarLoginHtml = (function () {
   var product = {
      crm : {},
      crmMobile : {},
   }
   var TEMPLATE = '<div id="loginPanel" class="page-login common-top-right">'
                     + '<div class="logo bg-light-opacity-10">'
                        + '<img src="/static/dev/images/erp/logo.png" alt="LOGO">'
                     + '</div>'
                     + '<div id="running" class="pt-rotaryplantingmap-container"></div>'
                        + '<div class="login bg-light-opacity-10 border-dark-opacity-1 border-radius-slight">'
                           + '<div class="title title-dark">账号登陆</div>'
                        + '<div class="group-from from-light">'
                        + '<input class="border-radius-slight bg-light-opacity-1" type="text" id="username" placeholder="用户名">'
                        + '<span class="fa fa-user"></span>'
                     + '</div>'
                     + '<div class="group-from from-light">'
                        + '<input class="border-radius-slight bg-light-opacity-1" type="password" id="password" placeholder="密码">'
                        + '<span class="fa fa-lock"></span>'
                        + '<div class="cue hide" id="pwmsg">您输入的密码错误</div>'
                     + '</div>'
                     + '<div class="remember-pwd">'
                        + '<label for="remember">'
                           + '<input class="remember" type="checkbox" name="remember" id="remember">'
                           + '<span></span>'
                           + '<p class="text-pwd">记住密码</p>'
                        + '</label>'
                     + '</div>'
                     + '<div class="loginbtn loginbtn-blue border-radius-slight">'
                        + '<a href="javascript:void(0);" id="btn-submit">登&nbsp;&nbsp;录</a>'
                     + '</div>'
                        + '<div id="nsLoginStyle-loginDiv-btns" class="pt">'
                              + '<a href="/registationController/regist" class="regist">注册</a>'
                           + '</div>'
                        + '</div>'
                     + '<div class="footer">版权所有 © 网星软件 2008-2019 ALL Rights Reserved 保留一切权利 冀ICP备12000600号-1号</div>'
                  + '</div>';
   function init(){
      $('body').html(TEMPLATE);
   }
   return {
      init : init,
   }
})(jQuery)