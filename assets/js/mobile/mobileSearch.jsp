<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/view/jsp/include.jsp"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>

<head>
   <title>手机搜索组件</title>
   <style>
      .card-item {
         display: inline-block;
      }
   </style>
</head>

<body>
   <container>
      <div id="inputSearch"></div>
      <script>
         var config = {
            containerId: "inputSearch",
            placeholder: "请输入内容查询",
            defaultValue: "",
            type: "",
            label: "<i class='fa-search'></i>",
            showSearchHis: false,
            searchBtn: {
               text: "搜索",
               iconClass: "",
               btnType: ""
            },
            ajaxConfig: {
               url: getRootPath() + "/assets/json/newcomponent/search.json",
               type: "GET",
               data: {},
               dataSrc: "rows"
            },
            btns: [
               {
                  text: "二维码",
                  iconClass: "fa-qrcode",
                  btnType: "",
                  handler: function (res) {
                     console.log(res);
                  }
               }
            ],
            handler: function (res) { console.log(res); }
         }

         nsUI.mobileSearch.init(config);
      </script>
   </container>
</body>


</html>