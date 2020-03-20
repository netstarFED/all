//流程图浏览器
/***使用到的组件包括
 * 	mxClient  
 * 	mxUtils
 * 	mxGraph
 ***/
nsUI.flowChartViewer = (function(){
	var VERSION = '0.9.0'; //cy 20181015
	// 工作流对应的样式表
	var styleSheet = {
		xml:"<mxStylesheet>\r\n\t<add as=\"defaultVertex\">\r\n\t\t<add as=\"shape\" value=\"label\"/>\r\n\t\t<add as=\"perimeter\" value=\"rectanglePerimeter\"/>\r\n\t\t<add as=\"fontSize\" value=\"12\"/>\r\n\t\t<add as=\"fontFamily\" value=\"Helvetica\"/>\r\n\t\t<add as=\"align\" value=\"center\"/>\r\n\t\t<add as=\"verticalAlign\" value=\"middle\"/>\r\n\t\t<add as=\"fillColor\" value=\"#ffffff\"/>\r\n\t\t<add as=\"strokeColor\" value=\"#000000\"/>\r\n\t\t<add as=\"fontColor\" value=\"#000000\"/>\r\n\t</add>\r\n\t<add as=\"defaultEdge\">\r\n\t\t<add as=\"shape\" value=\"connector\"/>\r\n\t\t<add as=\"labelBackgroundColor\" value=\"#ffffff\"/>\r\n\t\t<add as=\"endArrow\" value=\"classic\"/>\r\n\t\t<add as=\"fontSize\" value=\"11\"/>\r\n\t\t<add as=\"fontFamily\" value=\"Helvetica\"/>\r\n\t\t<add as=\"align\" value=\"center\"/>\r\n\t\t<add as=\"verticalAlign\" value=\"middle\"/>\r\n\t\t<add as=\"rounded\" value=\"1\"/>\r\n\t\t<add as=\"strokeColor\" value=\"#000000\"/>\r\n\t\t<add as=\"fontColor\" value=\"#000000\"/>\r\n\t</add>\r\n\t<add as=\"fancy\">\r\n\t\t<add as=\"shadow\" value=\"1\"/>\r\n\t\t<add as=\"glass\" value=\"1\"/>\r\n\t</add>\r\n\t<add as=\"gray\" extend=\"fancy\">\r\n\t\t<add as=\"gradientColor\" value=\"#B3B3B3\"/>\r\n\t\t<add as=\"fillColor\" value=\"#F5F5F5\"/>\r\n\t\t<add as=\"strokeColor\" value=\"#666666\"/>\r\n\t</add>\r\n\t<add as=\"blue\" extend=\"fancy\">\r\n\t\t<add as=\"gradientColor\" value=\"#7EA6E0\"/>\r\n\t\t<add as=\"fillColor\" value=\"#DAE8FC\"/>\r\n\t\t<add as=\"strokeColor\" value=\"#6C8EBF\"/>\r\n\t</add>\r\n\t<add as=\"green\" extend=\"fancy\">\r\n\t\t<add as=\"gradientColor\" value=\"#97D077\"/>\r\n\t\t<add as=\"fillColor\" value=\"#D5E8D4\"/>\r\n\t\t<add as=\"strokeColor\" value=\"#82B366\"/>\r\n\t</add>\r\n\t<add as=\"turquoise\" extend=\"fancy\">\r\n\t\t<add as=\"gradientColor\" value=\"#67AB9F\"/>\r\n\t\t<add as=\"fillColor\" value=\"#D5E8D4\"/>\r\n\t\t<add as=\"strokeColor\" value=\"#6A9153\"/>\r\n\t</add>\r\n\t<add as=\"yellow\" extend=\"fancy\">\r\n\t\t<add as=\"gradientColor\" value=\"#FFD966\"/>\r\n\t\t<add as=\"fillColor\" value=\"#FFF2CC\"/>\r\n\t\t<add as=\"strokeColor\" value=\"#D6B656\"/>\r\n\t</add>\r\n\t<add as=\"orange\" extend=\"fancy\">\r\n\t\t<add as=\"gradientColor\" value=\"#FFA500\"/>\r\n\t\t<add as=\"fillColor\" value=\"#FFCD28\"/>\r\n\t\t<add as=\"strokeColor\" value=\"#D79B00\"/>\r\n\t</add>\r\n\t<add as=\"red\" extend=\"fancy\">\r\n\t\t<add as=\"gradientColor\" value=\"#EA6B66\"/>\r\n\t\t<add as=\"fillColor\" value=\"#F8CECC\"/>\r\n\t\t<add as=\"strokeColor\" value=\"#B85450\"/>\r\n\t</add>\r\n\t<add as=\"pink\" extend=\"fancy\">\r\n\t\t<add as=\"gradientColor\" value=\"#B5739D\"/>\r\n\t\t<add as=\"fillColor\" value=\"#E6D0DE\"/>\r\n\t\t<add as=\"strokeColor\" value=\"#996185\"/>\r\n\t</add>\r\n\t<add as=\"purple\" extend=\"fancy\">\r\n\t\t<add as=\"gradientColor\" value=\"#8C6C9C\"/>\r\n\t\t<add as=\"fillColor\" value=\"#E1D5E7\"/>\r\n\t\t<add as=\"strokeColor\" value=\"#9673A6\"/>\r\n\t</add>\r\n\t<add as=\"plain-gray\">\r\n\t\t<add as=\"gradientColor\" value=\"#B3B3B3\"/>\r\n\t\t<add as=\"fillColor\" value=\"#F5F5F5\"/>\r\n\t\t<add as=\"strokeColor\" value=\"#666666\"/>\r\n\t</add>\r\n\t<add as=\"plain-blue\">\r\n\t\t<add as=\"gradientColor\" value=\"#7EA6E0\"/>\r\n\t\t<add as=\"fillColor\" value=\"#DAE8FC\"/>\r\n\t\t<add as=\"strokeColor\" value=\"#6C8EBF\"/>\r\n\t</add>\r\n\t<add as=\"plain-green\">\r\n\t\t<add as=\"gradientColor\" value=\"#97D077\"/>\r\n\t\t<add as=\"fillColor\" value=\"#D5E8D4\"/>\r\n\t\t<add as=\"strokeColor\" value=\"#82B366\"/>\r\n\t</add>\r\n\t<add as=\"plain-turquoise\">\r\n\t\t<add as=\"gradientColor\" value=\"#67AB9F\"/>\r\n\t\t<add as=\"fillColor\" value=\"#D5E8D4\"/>\r\n\t\t<add as=\"strokeColor\" value=\"#6A9153\"/>\r\n\t</add>\r\n\t<add as=\"plain-yellow\">\r\n\t\t<add as=\"gradientColor\" value=\"#FFD966\"/>\r\n\t\t<add as=\"fillColor\" value=\"#FFF2CC\"/>\r\n\t\t<add as=\"strokeColor\" value=\"#D6B656\"/>\r\n\t</add>\r\n\t<add as=\"plain-orange\">\r\n\t\t<add as=\"gradientColor\" value=\"#FFA500\"/>\r\n\t\t<add as=\"fillColor\" value=\"#FFCD28\"/>\r\n\t\t<add as=\"strokeColor\" value=\"#D79B00\"/>\r\n\t</add>\r\n\t<add as=\"plain-red\">\r\n\t\t<add as=\"gradientColor\" value=\"#EA6B66\"/>\r\n\t\t<add as=\"fillColor\" value=\"#F8CECC\"/>\r\n\t\t<add as=\"strokeColor\" value=\"#B85450\"/>\r\n\t</add>\r\n\t<add as=\"plain-pink\">\r\n\t\t<add as=\"gradientColor\" value=\"#B5739D\"/>\r\n\t\t<add as=\"fillColor\" value=\"#E6D0DE\"/>\r\n\t\t<add as=\"strokeColor\" value=\"#996185\"/>\r\n\t</add>\r\n\t<add as=\"plain-purple\">\r\n\t\t<add as=\"gradientColor\" value=\"#8C6C9C\"/>\r\n\t\t<add as=\"fillColor\" value=\"#E1D5E7\"/>\r\n\t\t<add as=\"strokeColor\" value=\"#9673A6\"/>\r\n\t</add>\r\n\t<add as=\"text\">\r\n\t\t<add as=\"fillColor\" value=\"none\"/>\r\n\t\t<add as=\"gradientColor\" value=\"none\"/>\r\n\t\t<add as=\"strokeColor\" value=\"none\"/>\r\n\t\t<add as=\"align\" value=\"left\"/>\r\n\t\t<add as=\"verticalAlign\" value=\"top\"/>\r\n\t</add>\r\n\t<add as=\"label\">\r\n\t\t<add as=\"fontStyle\" value=\"1\"/>\r\n\t\t<add as=\"align\" value=\"left\"/>\r\n\t\t<add as=\"verticalAlign\" value=\"middle\"/>\r\n\t\t<add as=\"spacing\" value=\"2\"/>\r\n\t\t<add as=\"spacingLeft\" value=\"52\"/>\r\n\t\t<add as=\"imageWidth\" value=\"42\"/>\r\n\t\t<add as=\"imageHeight\" value=\"42\"/>\r\n\t\t<add as=\"rounded\" value=\"1\"/>\r\n\t</add>\r\n\t<add as=\"icon\" extend=\"label\">\r\n\t\t<add as=\"align\" value=\"center\"/>\r\n\t\t<add as=\"imageAlign\" value=\"center\"/>\r\n\t\t<add as=\"verticalLabelPosition\" value=\"bottom\"/>\r\n\t\t<add as=\"verticalAlign\" value=\"top\"/>\r\n\t\t<add as=\"spacingTop\" value=\"4\"/>\r\n\t\t<add as=\"labelBackgroundColor\" value=\"#ffffff\"/>\r\n\t\t<add as=\"spacing\" value=\"0\"/>\r\n\t\t<add as=\"spacingLeft\" value=\"0\"/>\r\n\t\t<add as=\"spacingTop\" value=\"6\"/>\r\n\t\t<add as=\"fontStyle\" value=\"0\"/>\r\n\t\t<add as=\"imageWidth\" value=\"48\"/>\r\n\t\t<add as=\"imageHeight\" value=\"48\"/>\r\n\t</add>\r\n\t<add as=\"swimlane\">\r\n\t\t<add as=\"shape\" value=\"swimlane\"/>\r\n\t\t<add as=\"fontSize\" value=\"12\"/>\r\n\t\t<add as=\"fontStyle\" value=\"1\"/>\r\n\t\t<add as=\"startSize\" value=\"23\"/>\r\n\t</add>\r\n\t<add as=\"group\">\r\n\t\t<add as=\"verticalAlign\" value=\"top\"/>\r\n\t\t<add as=\"fillColor\" value=\"none\"/>\r\n\t\t<add as=\"strokeColor\" value=\"none\"/>\r\n\t\t<add as=\"gradientColor\" value=\"none\"/>\r\n\t\t<add as=\"pointerEvents\" value=\"0\"/>\r\n\t</add>\r\n\t<add as=\"ellipse\">\r\n\t\t<add as=\"shape\" value=\"ellipse\"/>\r\n\t\t<add as=\"perimeter\" value=\"ellipsePerimeter\"/>\r\n\t</add>\r\n\t<add as=\"rhombus\">\r\n\t\t<add as=\"shape\" value=\"rhombus\"/>\r\n\t\t<add as=\"perimeter\" value=\"rhombusPerimeter\"/>\r\n\t</add>\r\n\t<add as=\"triangle\">\r\n\t\t<add as=\"shape\" value=\"triangle\"/>\r\n\t\t<add as=\"perimeter\" value=\"trianglePerimeter\"/>\r\n\t</add>\r\n\t<add as=\"line\">\r\n\t\t<add as=\"shape\" value=\"line\"/>\r\n\t\t<add as=\"strokeWidth\" value=\"4\"/>\r\n\t\t<add as=\"labelBackgroundColor\" value=\"#ffffff\"/>\r\n\t\t<add as=\"verticalAlign\" value=\"top\"/>\r\n\t\t<add as=\"spacingTop\" value=\"8\"/>\r\n\t</add>\r\n\t<add as=\"image\">\r\n\t\t<add as=\"shape\" value=\"image\"/>\r\n\t\t<add as=\"labelBackgroundColor\" value=\"white\"/>\r\n\t\t<add as=\"verticalAlign\" value=\"top\"/>\r\n\t\t<add as=\"verticalLabelPosition\" value=\"bottom\"/>\r\n\t</add>\r\n\t<add as=\"roundImage\" extend=\"image\">\r\n\t\t<add as=\"perimeter\" value=\"ellipsePerimeter\"/>\r\n\t</add>\r\n\t<add as=\"rhombusImage\" extend=\"image\">\r\n\t\t<add as=\"perimeter\" value=\"rhombusPerimeter\"/>\r\n\t</add>\r\n\t<add as=\"arrow\">\r\n\t\t<add as=\"shape\" value=\"arrow\"/>\r\n\t\t<add as=\"edgeStyle\" value=\"none\"/>\r\n\t\t<add as=\"fillColor\" value=\"#ffffff\"/>\r\n\t</add>\r\n</mxStylesheet>\r\n"
	};
	var stencilsLib = '<shapes name="mxGraph.flowchart"><shape name="Annotation 1" h="98" w="50" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0" y="0" perimeter="0" name="NW"/><constraint x="0" y="1" perimeter="0" name="SW"/><constraint x="1" y="0" perimeter="0" name="NE"/><constraint x="1" y="1" perimeter="0" name="SE"/></connections><background><path><move x="50" y="0"/><line x="0" y="0"/><line x="0" y="98"/><line x="50" y="98"/></path></background><foreground><stroke/></foreground></shape><shape name="Annotation 2" h="98" w="100" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="1" y="0" perimeter="0" name="NE"/><constraint x="1" y="1" perimeter="0" name="SE"/></connections><background><path><move x="100" y="0"/><line x="50" y="0"/><line x="50" y="98"/><line x="100" y="98"/></path></background><foreground><stroke/><path><move x="0" y="49"/><line x="50" y="49"/></path><stroke/></foreground></shape><shape name="Card" h="60" w="98" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0.1" y="0.16" perimeter="0" name="NW"/><constraint x="0.015" y="0.98" perimeter="0" name="SW"/><constraint x="0.985" y="0.02" perimeter="0" name="NE"/><constraint x="0.985" y="0.98" perimeter="0" name="SE"/></connections><background><path><move x="19" y="0"/><line x="93" y="0"/><arc rx="5" ry="5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="98" y="5"/><line x="98" y="55"/><arc rx="5" ry="5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="93" y="60"/><line x="5" y="60"/><arc rx="5" ry="5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="0" y="55"/><line x="0" y="20"/><line x="19" y="0"/><close/></path></background><foreground><fillstroke/></foreground></shape><shape name="Collate" h="98" w="96.82" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.02" perimeter="0" name="NW"/><constraint x="0" y="0.98" perimeter="0" name="SW"/><constraint x="1" y="0.02" perimeter="0" name="NE"/><constraint x="1" y="0.98" perimeter="0" name="SE"/></connections><background><path><move x="92.41" y="0"/><arc rx="6" ry="3.5" x-axis-rotation="-15" large-arc-flag="0" sweep-flag="1" x="95.41" y="5"/><line x="1.41" y="93"/><arc rx="6" ry="3.5" x-axis-rotation="-15" large-arc-flag="0" sweep-flag="0" x="4.41" y="98"/><line x="92.41" y="98"/><arc rx="6" ry="3.5" x-axis-rotation="15" large-arc-flag="0" sweep-flag="0" x="95.41" y="93"/><line x="1.41" y="5"/><arc rx="6" ry="3.5" x-axis-rotation="15" large-arc-flag="0" sweep-flag="1" x="4.41" y="0"/><line x="92.41" y="0"/><close/></path></background><foreground><fillstroke/></foreground></shape><shape name="Data" h="60.24" w="98.77" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0.095" y="0.5" perimeter="0" name="W"/><constraint x="0.905" y="0.5" perimeter="0" name="E"/><constraint x="0.23" y="0.02" perimeter="0" name="NW"/><constraint x="0.015" y="0.98" perimeter="0" name="SW"/><constraint x="0.985" y="0.02" perimeter="0" name="NE"/><constraint x="0.77" y="0.98" perimeter="0" name="SE"/></connections><background><path><move x="19.37" y="5.12"/><arc rx="6" ry="12" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="24.37" y="0.12"/><line x="93.37" y="0.12"/><arc rx="5" ry="4" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="98.37" y="5.12"/><line x="79.37" y="55.12"/><arc rx="6" ry="12" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="74.37" y="60.12"/><line x="4.37" y="60.12"/><arc rx="5" ry="4" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="0.37" y="55.12"/><close/></path></background><foreground><fillstroke/></foreground></shape><shape name="Database" h="60" w="60" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0" y="0.15" perimeter="0" name="NW"/><constraint x="0" y="0.85" perimeter="0" name="SW"/><constraint x="1" y="0.15" perimeter="0" name="NE"/><constraint x="1" y="0.85" perimeter="0" name="SE"/></connections><background><path><move x="0" y="50"/><line x="0" y="10"/><arc rx="30" ry="10" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="60" y="10"/><line x="60" y="50"/><arc rx="30" ry="10" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="0" y="50"/><close/></path></background><foreground><fillstroke/><path><move x="0" y="10"/><arc rx="30" ry="10" x-axis-rotation="0" large-arc-flag="0" sweep-flag="0" x="60" y="10"/></path><stroke/></foreground></shape><shape name="Decision" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/></connections><background><path><move x="50" y="0"/><line x="100" y="50"/><line x="50" y="100"/><line x="0" y="50"/><close/></path></background><foreground><fillstroke/></foreground></shape><shape name="Delay" h="60" w="98.25" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0.02" y="0.015" perimeter="0" name="NW"/><constraint x="0.02" y="0.985" perimeter="0" name="SW"/><constraint x="0.81" y="0" perimeter="0" name="NE"/><constraint x="0.81" y="1" perimeter="0" name="SE"/></connections><background><path><move x="0" y="5"/><arc rx="5" ry="5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="5" y="0"/><line x="79" y="0"/><arc rx="33" ry="33" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="79" y="60"/><line x="5" y="60"/><arc rx="5" ry="5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="0" y="55"/><line x="0" y="5"/><close/></path></background><foreground><fillstroke/></foreground></shape><shape name="Direct Data" h="60" w="98" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0.08" y="0" perimeter="0" name="NW"/><constraint x="0.08" y="1" perimeter="0" name="SW"/><constraint x="0.91" y="0" perimeter="0" name="NE"/><constraint x="0.91" y="1" perimeter="0" name="SE"/></connections><background><path><move x="9" y="0"/><line x="89" y="0"/><arc rx="9" ry="30" x-axis-rotation="0" large-arc-flag="1" sweep-flag="1" x="89" y="60"/><line x="9" y="60"/><arc rx="9" ry="30" x-axis-rotation="0" large-arc-flag="1" sweep-flag="1" x="9" y="0"/><close/></path></background><foreground><fillstroke/><path><move x="89" y="0"/><arc rx="9" ry="30" x-axis-rotation="0" large-arc-flag="1" sweep-flag="0" x="89" y="60"/></path><stroke/></foreground></shape><shape name="Display" h="60" w="98.25" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0.2" y="0.14" perimeter="0" name="NW"/><constraint x="0.2" y="0.86" perimeter="0" name="SW"/><constraint x="0.92" y="0.14" perimeter="0" name="NE"/><constraint x="0.92" y="0.86" perimeter="0" name="SE"/></connections><background><path><move x="0" y="30"/><arc rx="60" ry="60" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="39" y="0"/><line x="79" y="0"/><arc rx="33" ry="33" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="79" y="60"/><line x="39" y="60"/><arc rx="60" ry="60" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="0" y="30"/><close/></path></background><foreground><fillstroke/></foreground></shape><shape name="Document" h="60.9" w="98" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="0.9" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0.02" y="0.015" perimeter="0" name="NW"/><constraint x="0" y="0.9" perimeter="0" name="SW"/><constraint x="0.98" y="0.015" perimeter="0" name="NE"/><constraint x="1" y="0.9" perimeter="0" name="SE"/></connections><background><path><move x="0" y="5"/><arc rx="5" ry="5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="5" y="0"/><line x="93" y="0"/><arc rx="5" ry="5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="98" y="5"/><line x="98" y="55"/><arc rx="70" ry="70" x-axis-rotation="0" large-arc-flag="0" sweep-flag="0" x="49" y="55"/><arc rx="70" ry="70" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="0" y="55"/><close/></path></background><foreground><fillstroke/></foreground></shape><shape aspect="variable" h="60.84" name="Extract or Measurement" strokewidth="inherit" w="95.01">    <connections>        <constraint name="N" perimeter="0" x="0.5" y="0"/>        <constraint name="S" perimeter="0" x="0.5" y="1"/>        <constraint name="W" perimeter="0" x="0.22" y="0.5"/>        <constraint name="E" perimeter="0" x="0.78" y="0.5"/>        <constraint name="SW" perimeter="0" x="0.01" y="0.97"/>        <constraint name="SE" perimeter="0" x="0.99" y="0.97"/>    </connections>    <background>        <path>            <move x="3.5" y="60.84"/>            <line x="91.5" y="60.84"/>            <arc large-arc-flag="0" rx="3.5" ry="3.5" sweep-flag="0" x="94.5" x-axis-rotation="0" y="55.84"/>            <line x="49.5" y="0.84"/>            <arc large-arc-flag="0" rx="3.5" ry="3.5" sweep-flag="0" x="45.5" x-axis-rotation="0" y="0.84"/>            <line x="0.5" y="55.84"/>            <arc large-arc-flag="0" rx="3.5" ry="3.5" sweep-flag="0" x="3.5" x-axis-rotation="0" y="60.84"/>            <close/>        </path>    </background>    <foreground>        <fillstroke/>    </foreground></shape><shape name="Internal Storage" h="70" w="70" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0.02" y="0.015" perimeter="0" name="NW"/><constraint x="0.02" y="0.985" perimeter="0" name="SW"/><constraint x="0.98" y="0.015" perimeter="0" name="NE"/><constraint x="0.98" y="0.985" perimeter="0" name="SE"/></connections><background><roundrect x="0" y="0" w="70" h="70" arcsize="7.142857142857142"/></background><foreground><fillstroke/><path><move x="0" y="15"/><line x="70" y="15"/></path><stroke/><path><move x="15" y="0"/><line x="15" y="70"/></path><stroke/></foreground></shape><shape name="Loop Limit" h="60" w="98" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0.1" y="0.15" perimeter="0" name="NW"/><constraint x="0.02" y="0.985" perimeter="0" name="SW"/><constraint x="0.9" y="0.15" perimeter="0" name="NE"/><constraint x="0.98" y="0.985" perimeter="0" name="SE"/></connections><background><path><move x="19" y="0"/><line x="79" y="0"/><line x="98" y="20"/><line x="98" y="55"/><arc rx="5" ry="5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="93" y="60"/><line x="5" y="60"/><arc rx="5" ry="5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="0" y="55"/><line x="0" y="20"/><line x="19" y="0"/><close/></path></background><foreground><fillstroke/></foreground></shape><shape name="Manual Input" h="60" w="98.05" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0.195" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0.02" y="0.985" perimeter="0" name="SW"/><constraint x="0.98" y="0.015" perimeter="0" name="NE"/><constraint x="0.98" y="0.985" perimeter="0" name="SE"/></connections><background><path><move x="0" y="25"/><line x="93" y="0"/><arc rx="5" ry="5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="98" y="5"/><line x="98" y="55"/><arc rx="5" ry="5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="94" y="60"/><line x="5" y="60"/><arc rx="5" ry="5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="0" y="55"/><line x="0" y="25"/><close/></path></background><foreground><fillstroke/></foreground></shape><shape name="Manual Operation" h="60.04" w="98.79" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0.1" y="0.5" perimeter="0" name="W"/><constraint x="0.9" y="0.5" perimeter="0" name="E"/><constraint x="0.02" y="0.015" perimeter="0" name="NW"/><constraint x="0.22" y="0.985" perimeter="0" name="SW"/><constraint x="0.98" y="0.015" perimeter="0" name="NE"/><constraint x="0.78" y="0.985" perimeter="0" name="SE"/></connections><background><path><move x="0.39" y="5.04"/><arc rx="5" ry="4" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="5.39" y="0.04"/><line x="93.39" y="0.04"/><arc rx="5" ry="4" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="98.39" y="5.04"/><line x="79.39" y="55.04"/><arc rx="6.5" ry="6.5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="74.39" y="60.04"/><line x="24.39" y="60.04"/><arc rx="6.5" ry="6.5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="19.39" y="55.04"/><line x="0.39" y="5.04"/><close/></path></background><foreground><fillstroke/></foreground></shape><shape aspect="variable" h="60.84" name="Merge or Storage" strokewidth="inherit" w="95.01">    <connections>        <constraint name="N" perimeter="0" x="0.5" y="0"/>        <constraint name="S" perimeter="0" x="0.5" y="1"/>        <constraint name="W" perimeter="0" x="0" y="0.5"/>        <constraint name="E" perimeter="0" x="1" y="0.5"/>        <constraint name="NW" perimeter="0" x="0" y="0"/>        <constraint name="SW" perimeter="0" x="0" y="1"/>        <constraint name="NE" perimeter="0" x="1" y="0"/>        <constraint name="SE" perimeter="0" x="1" y="1"/>    </connections>    <background>        <path>            <move x="3.5" y="0"/>            <line x="91.5" y="0"/>            <arc large-arc-flag="0" rx="3.5" ry="3.5" sweep-flag="1" x="94.5" x-axis-rotation="0" y="5"/>            <line x="49.5" y="60"/>            <arc large-arc-flag="0" rx="3.5" ry="3.5" sweep-flag="1" x="45.5" x-axis-rotation="0" y="60"/>            <line x="0.5" y="5"/>            <arc large-arc-flag="0" rx="3.5" ry="3.5" sweep-flag="1" x="3.5" x-axis-rotation="0" y="0"/>            <close/>        </path>    </background>    <foreground>        <fillstroke/>    </foreground></shape><shape name="Multi-Document" h="60.28" w="88" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="0.88" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0.08" y="0.1" perimeter="0" name="NW"/><constraint x="0" y="0.91" perimeter="0" name="SW"/><constraint x="0.98" y="0.02" perimeter="0" name="NE"/><constraint x="0.885" y="0.91" perimeter="0" name="SE"/></connections><background><path><move x="10" y="5"/><arc rx="5" ry="5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="15" y="0"/><line x="83" y="0"/><arc rx="5" ry="5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="88" y="5"/><line x="88" y="45"/><arc rx="50" ry="50" x-axis-rotation="0" large-arc-flag="0" sweep-flag="0" x="49" y="45"/><arc rx="50" ry="50" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="10" y="45"/><close/></path></background><foreground><fillstroke/><path><move x="5" y="10"/><arc rx="5" ry="5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="10" y="5"/><line x="78" y="5"/><arc rx="5" ry="5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="83" y="10"/><line x="83" y="50"/><arc rx="50" ry="50" x-axis-rotation="0" large-arc-flag="0" sweep-flag="0" x="44" y="50"/><arc rx="50" ry="50" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="5" y="50"/><close/></path><fillstroke/><path><move x="0" y="15"/><arc rx="5" ry="5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="5" y="10"/><line x="73" y="10"/><arc rx="5" ry="5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="78" y="15"/><line x="78" y="55"/><arc rx="50" ry="50" x-axis-rotation="0" large-arc-flag="0" sweep-flag="0" x="39" y="55"/><arc rx="50" ry="50" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="0" y="55"/><close/></path><fillstroke/></foreground></shape><shape name="Off-page Reference" h="60" w="60" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0" y="0" perimeter="0" name="NW"/><constraint x="1" y="0" perimeter="0" name="NE"/></connections><background><path><move x="0" y="0"/><line x="60" y="0"/><line x="60" y="30"/><line x="30" y="60"/><line x="0" y="30"/><close/></path></background><foreground><fillstroke/></foreground></shape><shape name="On-page Reference" h="60" w="60" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0.145" y="0.145" perimeter="0" name="NW"/><constraint x="0.145" y="0.855" perimeter="0" name="SW"/><constraint x="0.855" y="0.145" perimeter="0" name="NE"/><constraint x="0.855" y="0.855" perimeter="0" name="SE"/></connections><background><ellipse x="0" y="0" w="60" h="60"/></background><foreground><fillstroke/></foreground></shape><shape name="Or" h="70" w="70" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0.145" y="0.145" perimeter="0" name="NW"/><constraint x="0.145" y="0.855" perimeter="0" name="SW"/><constraint x="0.855" y="0.145" perimeter="0" name="NE"/><constraint x="0.855" y="0.855" perimeter="0" name="SE"/></connections><background><ellipse x="0" y="0" w="70" h="70"/></background><foreground><fillstroke/><path><move x="10" y="60"/><line x="60" y="10"/></path><stroke/><path><move x="10" y="10"/><line x="60" y="60"/></path><stroke/></foreground></shape><shape name="Paper Tape" h="61.81" w="98" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0.09" perimeter="0" name="N"/><constraint x="0.5" y="0.91" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0" y="0.09" perimeter="0" name="NW"/><constraint x="0" y="0.91" perimeter="0" name="SW"/><constraint x="1" y="0.09" perimeter="0" name="NE"/><constraint x="1" y="0.91" perimeter="0" name="SE"/></connections><background><path><move x="0" y="5.9"/><arc rx="70" ry="70" x-axis-rotation="0" large-arc-flag="0" sweep-flag="0" x="49" y="5.9"/><arc rx="70" ry="70" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="98" y="5.9"/><line x="98" y="55.9"/><arc rx="70" ry="70" x-axis-rotation="0" large-arc-flag="0" sweep-flag="0" x="49" y="55.9"/><arc rx="70" ry="70" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="0" y="55.9"/><line x="0" y="5.9"/><close/></path></background><foreground><fillstroke/></foreground></shape><shape name="Parallel Mode" h="40" w="94" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0" y="0" perimeter="0" name="NW"/><constraint x="0" y="1" perimeter="0" name="SW"/><constraint x="1" y="0" perimeter="0" name="NE"/><constraint x="1" y="1" perimeter="0" name="SE"/></connections><background><save/><fillcolor color="#ffff00"/><path><move x="47" y="15"/><line x="52" y="20"/><line x="47" y="25"/><line x="42" y="20"/><line x="47" y="15"/><close/><move x="27" y="15"/><line x="32" y="20"/><line x="27" y="25"/><line x="22" y="20"/><line x="27" y="15"/><close/><move x="67" y="15"/><line x="72" y="20"/><line x="67" y="25"/><line x="62" y="20"/><line x="67" y="15"/><close/></path></background><foreground><fillstroke/><restore/><path><move x="0" y="0"/><line x="94" y="0"/></path><stroke/><path><move x="0" y="40"/><line x="94" y="40"/></path><stroke/></foreground></shape><shape name="Predefined Process" h="60" w="98" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0.02" y="0.015" perimeter="0" name="NW"/><constraint x="0.02" y="0.985" perimeter="0" name="SW"/><constraint x="0.98" y="0.015" perimeter="0" name="NE"/><constraint x="0.98" y="0.985" perimeter="0" name="SE"/></connections><background><roundrect x="0" y="0" w="98" h="60" arcsize="6.717687074829931"/></background><foreground><fillstroke/><path><move x="14" y="0"/><line x="14" y="60"/></path><stroke/><path><move x="84" y="0"/><line x="84" y="60"/></path><stroke/></foreground></shape><shape name="Preparation" h="60" w="97.11" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0.26" y="0.02" perimeter="0" name="NW"/><constraint x="0.26" y="0.98" perimeter="0" name="SW"/><constraint x="0.74" y="0.02" perimeter="0" name="NE"/><constraint x="0.74" y="0.98" perimeter="0" name="SE"/></connections><background><path><move x="20.56" y="5"/><arc rx="15" ry="15" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="31.56" y="0"/><line x="65.56" y="0"/><arc rx="15" ry="15" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="76.56" y="5"/><line x="96.56" y="28"/><arc rx="5" ry="5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="96.56" y="32"/><line x="76.56" y="55"/><arc rx="15" ry="15" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="65.56" y="60"/><line x="31.56" y="60"/><arc rx="15" ry="15" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="20.56" y="55"/><line x="0.56" y="32"/><arc rx="5" ry="5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="0.56" y="28"/><line x="20.56" y="5"/><close/></path></background><foreground><fillstroke/></foreground></shape><shape name="Process" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/></connections><background><roundrect x="0" y="0" w="100" h="100" arcsize="6"/></background><foreground><fillstroke/></foreground></shape><shape name="Sequential Data" h="99" w="99" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0.145" y="0.145" perimeter="0" name="NW"/><constraint x="0.145" y="0.855" perimeter="0" name="SW"/><constraint x="0.855" y="0.145" perimeter="0" name="NE"/><constraint x="1" y="1" perimeter="0" name="SE"/></connections><background><ellipse x="0" y="0" w="99" h="99"/></background><foreground><fillstroke/><path><move x="49.5" y="99"/><line x="99" y="99"/></path><stroke/></foreground></shape><shape name="Sort" h="98" w="98" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/></connections><background><path><move x="51" y="1"/><line x="97" y="47"/><arc rx="2.5" ry="2.5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="97" y="51"/><line x="51" y="97"/><arc rx="2.5" ry="2.5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="47" y="97"/><line x="1" y="51"/><arc rx="2.5" ry="2.5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="1" y="47"/><line x="47" y="1"/><arc rx="2.5" ry="2.5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="51" y="1"/><close/></path></background><foreground><fillstroke/><path><move x="0" y="49"/><line x="98" y="49"/></path><stroke/></foreground></shape><shape name="Start 1" h="60" w="99" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0.145" y="0.145" perimeter="0" name="NW"/><constraint x="0.145" y="0.855" perimeter="0" name="SW"/><constraint x="0.855" y="0.145" perimeter="0" name="NE"/><constraint x="0.855" y="0.855" perimeter="0" name="SE"/></connections><background><ellipse x="0" y="0" w="99" h="60"/></background><foreground><fillstroke/></foreground></shape><shape name="Start 2" h="99" w="99" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0.145" y="0.145" perimeter="0" name="NW"/><constraint x="0.145" y="0.855" perimeter="0" name="SW"/><constraint x="0.855" y="0.145" perimeter="0" name="NE"/><constraint x="0.855" y="0.855" perimeter="0" name="SE"/></connections><background><ellipse x="0" y="0" w="99" h="99"/></background><foreground><fillstroke/></foreground></shape><shape name="Stored Data" h="60" w="96.51" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="0.93" y="0.5" perimeter="0" name="E"/><constraint x="0.1" y="0" perimeter="0" name="NW"/><constraint x="0.1" y="1" perimeter="0" name="SW"/><constraint x="0.995" y="0.01" perimeter="0" name="NE"/><constraint x="0.995" y="0.99" perimeter="0" name="SE"/></connections><background><path><move x="10" y="0"/><line x="96" y="0"/><arc rx="1.5" ry="1.5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="96" y="2"/><arc rx="10" ry="30" x-axis-rotation="0" large-arc-flag="0" sweep-flag="0" x="96" y="58"/><arc rx="1.5" ry="1.5" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="96" y="60"/><line x="10" y="60"/><arc rx="10" ry="30" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="10" y="0"/><close/></path></background><foreground><fillstroke/></foreground></shape><shape name="Summing Function" h="70" w="70" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0.145" y="0.145" perimeter="0" name="NW"/><constraint x="0.145" y="0.855" perimeter="0" name="SW"/><constraint x="0.855" y="0.145" perimeter="0" name="NE"/><constraint x="0.855" y="0.855" perimeter="0" name="SE"/></connections><background><ellipse x="0" y="0" w="70" h="70"/></background><foreground><fillstroke/><path><move x="0" y="35"/><line x="70" y="35"/></path><stroke/><path><move x="35" y="0"/><line x="35" y="70"/></path><stroke/></foreground></shape><shape name="Terminator" h="60" w="98" aspect="variable" strokewidth="inherit"><connections><constraint x="0.5" y="0" perimeter="0" name="N"/><constraint x="0.5" y="1" perimeter="0" name="S"/><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/><constraint x="0.11" y="0.11" perimeter="0" name="NW"/><constraint x="0.11" y="0.89" perimeter="0" name="SW"/><constraint x="0.89" y="0.11" perimeter="0" name="NE"/><constraint x="0.89" y="0.89" perimeter="0" name="SE"/></connections><background><path><move x="30" y="0"/><line x="68" y="0"/><arc rx="30" ry="30" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="68" y="60"/><line x="30" y="60"/><arc rx="30" ry="30" x-axis-rotation="0" large-arc-flag="0" sweep-flag="1" x="30" y="0"/><close/></path></background><foreground><fillstroke/></foreground></shape><shape name="Transfer" h="70" w="97.5" aspect="variable" strokewidth="inherit"><connections><constraint x="0" y="0.5" perimeter="0" name="W"/><constraint x="1" y="0.5" perimeter="0" name="E"/></connections><background><path><move x="0" y="20"/><line x="59" y="20"/><line x="59" y="0"/><line x="97.5" y="35"/><line x="59" y="70"/><line x="59" y="50"/><line x="0" y="50"/><close/></path></background><foreground><fillstroke/></foreground></shape></shapes>';
	var I18N = 
	{
		en:{
			notBrowserSupported:'Browser is not supported',
			notStyleSheet: 'not get styleSheet',
		},
		zh:{
			notBrowserSupported:'浏览器不支持',
			notStyleSheet: '没有获取到流程图样式XML文件',
		}
	}
	var i18n = I18N[languagePackage.userLang];
	// 颜色 不同状态对应的颜色 背景色
	var NSSTATESCOLOR = {
		0: 		"#6eb055",
		1: 		'#ffffff', //未决
		2: 		'#00cf8a ',// 代办
		3:		'#00cf8a ',// 签收
		4:		'#8ec6f6',// 转移（提交）
		5:		'#8ec6f6',// 归档
		16:		'#9fa0a0',// 删除
		32:		'#ffa200',// 暂停
		64:		'#e87e16',// 应急
		128: 	'#a6a6a6',// 关闭
		'default':"#ffffff",
		// 'selectFillColor':"#000",
		'selectStrokeColor':"#ff8700",
		'defaultStrokeColor':"#000",
		// 'mark':'#dd0000',
		'mark':'#fff',
		// "edgeColor":'#000', // pass
		"edgeColor":'#69a9e0', // pass
		"defaultEdgeColor":'rgba(0,0,0,0.3)', // pass
	}
	// 边框的颜色
	var NSSTATESCOLORSTROKE = {
		1: 		'#000',  	//未决
		2: 		'#079968 ',	// 代办
		3:		'#079968 ',	// 签收
		4:		'#69a9e0',	// 转移（提交）
		5:		'#69a9e0',	// 归档
		16:		'#000',		// 删除
		32:		'#ff6600',	// 暂停
		64:		'#000',		// 应急
		128: 	'#000',		// 关闭
		'default':"#000",
	}
	// 文字的颜色
	var NSSTATESCOLORFONT = {
		0: 					"#fff",
		1: 					'#000', //未决
		2: 					'#fff',// 代办
		3:					'#fff',// 签收
		4:					'#fff',// 转移（提交）
		5:					'#fff',// 归档
		16:					'#fff',// 删除
		32:					'#fff',// 暂停
		64:					'#fff',// 应急
		128: 				'#fff',// 关闭
		'default': 			"#000",
		'selectStrokeColor':"#fff",
		'mark': 			'#000',
	}
	var styleStr = '<style>'
						+ 'ellipse:not([fill="'+NSSTATESCOLOR[1]+'"]){cursor: pointer;}'
						+ 'rect:not([fill="'+NSSTATESCOLOR[1]+'"]){cursor: pointer;}'
						+ 'g:not([fill="'+NSSTATESCOLORFONT[1]+'"])>text{cursor: pointer;}'
					+'</style>';
	$('head').append(styleStr);
	var graphs = {}; // 图像管理器容器
	var model = {}; //空的图像实体
	var graph = {}; //图像管理器
	//组件运行环境 
	//return true/false 是否可运行
	function isComponentSupport(){
		var isSupport = true;
		//基本组件是否加载

		//浏览器是否支持
		if (!mxClient.isBrowserSupported()){
			nsalert(i18n.notBrowserSupported, 'error');
			return false;
		}
		return true;
	}
	//设置默认值
	function getConfig(_config){
		_config.$workflowContainer = $('#'+_config.containerId); // 工作流容器
		// 工作流默认值
		if(typeof(_config.value)=='object'){
			if(typeof(_config.data)!='object'){
				_config.data = {};
			}
			_config.data.dataSource = _config.value;
		}
		if(typeof(_config.styleSheetUrl)=='string'){
			_config.styleSheet = {
				url : _config.styleSheetUrl,
			}
		}
		if(typeof(_config.styleSheet)=='object'){
			for(var attr in _config.styleSheet){
				styleSheet[attr] = _config.styleSheet[attr];
			}
		}
		return _config;
	}
	// 通过url获取workitemId
	function getWorkitemIdByUrl(url){
		var urlName = "workitemId=";
		if(url.indexOf('parentWorkitemId=')>-1){
			urlName = 'parentWorkitemId=';
		}
		var urlId = url.substring(url.indexOf(urlName)+urlName.length);
		return urlId;
	}
	//获取图形形状库
	function getStencilLib(config, callbackFunc){
		if(typeof(stencilsLib)=='string'){
			stencilsLib = $.parseXML(stencilsLib).documentElement;
		}
		config.stencilLib = stencilsLib;
		callbackFunc(config);
	}
	//获取图形样式表 边框背景色等
	function getStyleSheetXML(config, callbackFunc){
		if(typeof(styleSheet.xml)=='string'){
			styleSheet.xml = $.parseXML(styleSheet.xml);
		}
		callbackFunc(config, styleSheet.xml);
	}
	// 设置线上的text文本位置 x/y 值
	function setOnLineTextPosition(_viewerCellsText){
		delete _viewerCellsText.geometry.offset; // 删除偏移属性
		delete _viewerCellsText.geometry.relative; // 删除相对位置
		var parent = _viewerCellsText.getParent(); // 父元素
		var parentSource = parent.source.geometry; // 链接线的开始块
		var parentTarget = parent.target.geometry; // 连接线的结束块
		// 线上文字x的偏移位置
		var offsetX = [parentTarget.x-(parentSource.x+parentSource.width)]/2+(parentSource.x+parentSource.width)+_viewerCellsText.geometry.x;
		// 开始/结束块 哪个高 根据位置和高位置块的高度计算 y的偏移位置
		var maxNum = parentTarget.y; // 最低块位置
		var minNum = parentSource.y; // 最高块位置
		var minHeight = parentSource.height; // 高块高度
		if(maxNum<minNum){
			var conNum = maxNum;
			maxNum = minNum;
			minNum = conNum;
			minHeight = parentTarget.height;
		}
		// 线上文字y的偏移位置
		// var offsetY = [maxNum-(minHeight+minNum)]/2 + (minHeight+minNum) + _viewerCellsText.geometry.y;
		var offsetY = [maxNum-(minHeight+minNum)]/2 + (minHeight+minNum) + _viewerCellsText.geometry.y;
		// 重新设置text的x/y位置
		_viewerCellsText.geometry.x = offsetX;
		_viewerCellsText.geometry.y = offsetY;
	}
	// 设置工作流的位置
	function setWorkFlowPosition(config, _viewerCells, codec){
		var maxX = 0;
		var minX = 0;
		var maxY = 0;
		var minY = 0;
		var isSet = false; // 是否设置了最值
		var $document = $(codec.document);
		var svgOffsetWidth = $document.children().attr('dx') - $document.children().attr('pageWidth');
		// console.log(_viewerCells);
		for(var i = 0; i<_viewerCells.length; i++){
			if(_viewerCells[i].isVertex()){
				if(_viewerCells[i].geometry){
					if(_viewerCells[i].geometry.relative==1){
						// 在线上的文字设置
						setOnLineTextPosition(_viewerCells[i]);
					}
				}
			}
		}
	}
	// 获得根据id生成的dataSource的workitems数据
	// 用于生成图形块是颜色配置
	// workitems数组长度大于1时表示复制该块依次排列设置配置颜色
	function getWorkitemsObjByDomId(config){
		var dataSource = config.data.dataSource;
		var activities = dataSource.instanceLayoutJson.activities;
		var workitemsObj = {}
		for(var i=0;i<activities.length;i++){
			var workitems = [];
			// 判断workitems是否存在 不存在时该domId对应的workitems是[]
			if($.isArray(activities[i].workitems)){
				workitems = activities[i].workitems;
			}
			workitemsObj[activities[i].domId] = workitems;
		}
		return workitemsObj;
	}
	// 获得根据id生成的dataSource的transitions数据
	// 用于生成线条颜色配置
	function getTransitionsObjByDomId(config){
		var dataSource = config.data.dataSource;
		var transitions = dataSource.instanceLayoutJson.transitions;
		var transitionsObj = {}
		for(var i=0;i<transitions.length;i++){
			if(transitions[i].domId){
				transitionsObj[transitions[i].domId] = transitions[i];
			}
		}
		return transitionsObj;
	}
	// 获得样式
	function getStyleStr(sourceStr,styleObj){
		var sourceStyleArr = sourceStr.split(';');
		for(var styleKey in styleObj){
			for(var i=0;i<sourceStyleArr.length;i++){
				if(sourceStyleArr[i].indexOf(styleKey)>-1){
					sourceStyleArr[i] = styleKey + '=' + styleObj[styleKey];
					styleObj[styleKey] = true;
				}
			}
		}
		for(var styleKey in styleObj){
			if(styleObj[styleKey]!==true){
				sourceStyleArr.push(styleKey + '=' + styleObj[styleKey]);
			}
		}
		var styleStr = '';
		for(var i=0;i<sourceStyleArr.length;i++){
			styleStr += sourceStyleArr[i] + ';';
		}
		return styleStr;
	}
	// 设置工作流方块颜色
	function setWorkFlowColor(workitems, viewerCell){
		/*
		 * workitems ：工作流块信息配置 比如每块的颜色
		 * viewerCell ：工作流块配置
		 */
		// 判断是否有状态 根据状态查询颜色
		if(typeof(workitems.workitemstate)=='undefined'){
			return ;
		}
		var colorStr = NSSTATESCOLOR[workitems.workitemstate]; // 通过状态获得颜色
		// 是否有该状态对应的颜色
		if(typeof(colorStr)=='undefined'){
			console.error('状态'+workitems.workitemstate+'没有找到对应的颜色');
			console.error(workitems);
			return '';
		}
		var fontColor = NSSTATESCOLORFONT[workitems.workitemstate]; // 通过状态获得颜色
		var strokeColor = NSSTATESCOLORSTROKE[workitems.workitemstate];
		if(workitems.workitemstate == 'mark'){
			// 标识数字 根据原始块元素获取边颜色
			strokeColor = NSSTATESCOLORSTROKE[workitems.chunkState];
		}
		var cellStyleStr = viewerCell.getStyle(); // 获得块样式
		var styleObj = {
			fillColor : colorStr,
			fontColor : fontColor,
			strokeColor : strokeColor,
		}
		if(workitems.workitemstate == 'mark'){
			styleObj.spacingLeft = '1';
			styleObj.spacingTop = '2';
		}
		var styleStr = getStyleStr(cellStyleStr, styleObj);
		viewerCell.setStyle(styleStr); // 添加块颜色样式
	}
	// 设置工作流线条颜色
	function setWorkFlowEdgeColor(transitions, edgeCell){
		/*
		 * transitions ：工作流块信息配置 比如线条的颜色
		 * edgeCell ：工作流块配置
		 */
		var passed = transitions.passed;
		var edgeColor = NSSTATESCOLOR.defaultEdgeColor;
		if(passed){
			edgeColor = NSSTATESCOLOR.edgeColor;
		}
		var cellStyleStr = edgeCell.getStyle(); // 获得块样式
		var styleObj = {
			strokeColor : edgeColor,
		}
		var styleStr = getStyleStr(cellStyleStr, styleObj);
		edgeCell.setStyle(styleStr);
	}
	// 工作流中有多个块时 获取显示块
	function getShowViewerCell(workitemsArr){
		// 判断显示为那个工作项  有2,3取2,3即最小值， 没有2,3取最大值
		var workitemstateNum = workitemsArr[0][0].workitemstate;
		var workitemsArrIndexXmin = 0;
		var workitemsArrIndexYmin = 0;
		var workitemsArrIndexXmax = 0;
		var workitemsArrIndexYmax = 0;
		for(var workitemsI=0; workitemsI<workitemsArr.length; workitemsI++){
			for(var workitemsJ=0; workitemsJ<workitemsArr[workitemsI].length; workitemsJ++){
				if(workitemstateNum > workitemsArr[workitemsI][workitemsJ].workitemstate){
					workitemsArrIndexXmin = workitemsI;
					workitemsArrIndexYmin = workitemsJ;
					workitemstateNum = workitemsArr[workitemsI][workitemsJ].workitemstate;
				}
			}
		}
		if(workitemstateNum === 2 || workitemstateNum === 3){
			return workitemsArr[workitemsArrIndexXmin][workitemsArrIndexYmin];
		}
		for(var workitemsI=0; workitemsI<workitemsArr.length; workitemsI++){
			for(var workitemsJ=0; workitemsJ<workitemsArr[workitemsI].length; workitemsJ++){
				if(workitemstateNum < workitemsArr[workitemsI][workitemsJ].workitemstate){
					workitemsArrIndexXmax = workitemsI;
					workitemsArrIndexYmax = workitemsJ;
					workitemstateNum = workitemsArr[workitemsI][workitemsJ].workitemstate;
				}
			}
		}
		if(workitemstateNum === 32){
			return workitemsArr[workitemsArrIndexXmax][workitemsArrIndexYmax];
		}else{
			return workitemsArr[workitemsArrIndexXmin][workitemsArrIndexYmin];
		}
	}
	// 获取工作流渲染的块元素的数组
	function getViewerCells(config, mxCellDoms, codec){
		var viewerCells = []; // 返回的生成块元素数组
		for(var i = 0; i<mxCellDoms.length; i++){
			//逐个解码
			var viewerCell = codec.decode(mxCellDoms[i]);
			var isPush = false;
			if(viewerCell.isVertex()){
				// 修改value值 若果value中存在html标签自动删除
				var value = viewerCell.value;
				var rex = /\<([\/a-zA-Z]*)\>/g; // <span>或</span>
				var tagStrArr = value.match(rex);
				if(tagStrArr){
					for(var j=0;j<tagStrArr.length;j++){
						value = value.replace(tagStrArr[j], '');
					}
				}
				viewerCell.value = value;
				// 块元素
				var workitemsArr = config.workitemsObj[viewerCell.id]; // 流程块的workitems数组
				// workitemsArr = undefined 表示线上文字或其它 不执行任何操作
				// workitemsArr > 0 表示：有颜色设置（workitemstate状态字段表示颜色设置）
				// workitemsArr = 1 表示：只有一种颜色
				// workitemsArr > 1 表示：有多种颜色（复制块元素，设置复制块颜色）
				// 复制块元素时：上下偏移5px value是空
				// 块元素按数序显示 所以数组下标大的显示靠前 应下插入workitemsArr的最后一个块元素 即正序设置倒叙插入
				if(typeof(workitemsArr)!='undefined'){
					var workitemsLength = getWorkitemsLength(workitemsArr);
					if(workitemsLength > 0){
						// 设置状态最小的颜色
						// var workitemstateNum = workitemsArr[0][0].workitemstate;
						// var workitemsArrIndexX = 0;
						// var workitemsArrIndexY = 0;
						// for(var workitemsI=0; workitemsI<workitemsArr.length; workitemsI++){
						// 	for(var workitemsJ=0; workitemsJ<workitemsArr[workitemsI].length; workitemsJ++){
						// 		if(workitemstateNum > workitemsArr[workitemsI][workitemsJ].workitemstate){
						// 			workitemsArrIndexX = workitemsI;
						// 			workitemsArrIndexY = workitemsJ;
						// 			workitemstateNum = workitemsArr[workitemsI][workitemsJ].workitemstate;
						// 		}
						// 	}
						// }
						// setWorkFlowColor(workitemsArr[workitemsArrIndexX][workitemsArrIndexY], viewerCell);  // 设置第一个块的颜色
						var showViewerCell = getShowViewerCell(workitemsArr);
						setWorkFlowColor(showViewerCell, viewerCell);  // 设置第一个块的颜色
						isPush = true;
						viewerCells.push(viewerCell);;
						if(workitemsLength > 1){
							var $mxCellDomsCopy = $(mxCellDoms[i]).clone();
							$mxCellDomsCopy.attr('id',function(n,id){
								return id+'-remark';
							})
							$mxCellDomsCopy.attr('value', workitemsLength);
							$mxCellDomsCopy.attr('parent', viewerCell.id);
							$mxCellDomsCopy.children().attr('width','15');
							$mxCellDomsCopy.children().attr('height','15');
							$mxCellDomsCopy.children().attr('x',viewerCell.geometry.x+viewerCell.geometry.width-10);
							$mxCellDomsCopy.children().attr('y',viewerCell.geometry.y-5);
							var viewerCellCopy = codec.decode($mxCellDomsCopy[0]);
							var shape = 'mxgraph.flowchart.start_1';
							var viewerCellCopyStyle = viewerCellCopy.getStyle();
							viewerCellCopy.setStyle(mxUtils.setStyle(viewerCellCopyStyle,'shape','mxgraph.flowchart.start_1'));
							var chunkState = showViewerCell.workitemstate; // 原始块元素状态
							setWorkFlowColor({workitemstate:'mark', chunkState:chunkState}, viewerCellCopy); // 设置复制块的颜色
							viewerCells.push(viewerCellCopy);
						}
					}else{
						// 设置默认颜色
						var defaultColorConfig = {
							workitemstate:'default',
						}
						setWorkFlowColor(defaultColorConfig, viewerCell);  // 设置第一个块的颜色
					}
				}
			}else{
				if(viewerCell.isEdge()){
					var transitions = config.transitionsObj[viewerCell.id];
					if(transitions){
						setWorkFlowEdgeColor(transitions, viewerCell);
					}else{
						var edgeColor = NSSTATESCOLOR.defaultEdgeColor;
						var cellStyleStr = viewerCell.getStyle(); // 获得块样式
						viewerCell.setStyle(cellStyleStr+';strokeColor='+edgeColor+';');
					}
				}
			}
			if(!isPush){
				viewerCells.push(viewerCell);
			}
		}
		return viewerCells;
	}
	// 通过ajax配置获得图形元素
	function getViewerCellsCodecBySource(config, styleSheetXMLDoc){
		var lib = config.stencilLib;
		var shape = lib.firstChild;
		// console.log(lib);
		// console.log(shape);
		while (shape != null)
		{
			if (shape.nodeType == mxConstants.NODETYPE_ELEMENT)
			{
				var shapeName = lib.getAttribute('name')+'.'+shape.getAttribute('name').toLowerCase();
				shapeName = shapeName.toLowerCase().replace(/\ /,'_');				
				mxStencilRegistry.addStencil(shapeName, new mxStencil(shape));
			}
			
			shape = shape.nextSibling;
		}
		// 获得workitems对象通过domId
		// 用于生成图形块是颜色配置
		config.workitemsObj = getWorkitemsObjByDomId(config);
		config.transitionsObj = getTransitionsObjByDomId(config);
		// 找到容器 js DOM
		// 判断容器是否存在 若不存不向下继续执行返回false 并 报错
		if(config.$workflowContainer){
			var container = config.$workflowContainer[0];
		}else{
			nsAlert('工作流容器没有配置，即config.$workflowContainer没有配置','error');
			console.error(config);
			return false;
		}
		// 初始化图像
		if(typeof(nsUI.flowChartViewer.graphs[config.containerId])=="object"){
			var tabConfig = tab.tabConfigs[config.parentContainerId];
			tabConfig.$workflowContainer.children().remove();
		}
		model = new mxGraphModel(); //空的图像实体
		graph = new mxGraph(container, model);  //图像管理器
		nsUI.flowChartViewer.graphs[config.containerId] = graph;
		if(styleSheetXMLDoc === false){
			//没有获取到styleSheetXML，使用默认的样式
			console.warn('获取样式错误，使用默认样式')
		}else{
			var xmlElt = styleSheetXMLDoc.documentElement;
			//获取样式并格式化到graph组件
			var dec2 = new mxCodec(xmlElt);
			dec2.decode(xmlElt, graph.getStylesheet());
		}
		
		// 从第一个<mxCell>元素开始添加
		// 判断config.data.dataSource.processXml是否存在不存在时表示没有设置工作流 返回 false 并报错
		if(typeof(config.data.dataSource.processXml)=='undefined'){
			nsAlert('工作流数据错误','error');
			console.error(config.data.dataSource);
			return false;
		}
		var xmlStr = decodeURIComponent(config.data.dataSource.processXml);
		// 判断是否以 '<?xml version="1.0" encoding="utf-8"?>'开始 不是则添加
		if(xmlStr.indexOf('<?xml version="1.0" encoding="utf-8"?>')==-1){
			xmlStr = '<?xml version="1.0" encoding="utf-8"?>' + xmlStr;
		}
		var xml = mxUtils.parseXml(xmlStr);
		var mxGraphModelXml = xml.documentElement;
		//解码xml到graph配置属性
		var codec = new mxCodec(xml);
		// xml文件结构为<mxGraphModel><root><mxCell><mxGeometry>

		var mxCellDoms = mxGraphModelXml.children[0].children;
		// 所有的mxCell数组
		// 用于渲染工作流的块
		var viewerCells = getViewerCells(config, mxCellDoms, codec);
		// 设置工作流位置
		// 工作流显示在了容器外部 通过改变比例和top值设置重新定位工作位置和大小
		setWorkFlowPosition(config, viewerCells, codec);
		// return viewerCells;
		return {
			viewerCells : viewerCells,
			codec : codec
		}
	}
	// 渲染工作流图形
	function initGraph(config, styleSheetXMLDoc){
		var viewerCellsCodec = getViewerCellsCodecBySource(config, styleSheetXMLDoc);
		var viewerCells = viewerCellsCodec.viewerCells;
		var codec = viewerCellsCodec.codec;
		var graphConfig = {
			viewerCells : viewerCells,
			dataSource : config.data.dataSource,
			url : config.data.url,
			unitId : config.containerId,
			containerId : config.parentContainerId,
		}
		// 通过块元素数据渲染出图形
		showGroupByCells(graphConfig);
		// 添加图形事件
		if(config.readonly == false){
			config.$workflowContainer.parent().children('.pt-btn-group').children().eq(0).off('click');
			config.$workflowContainer.parent().children('.pt-btn-group').children().eq(0).on('click',function(ev){
				nsUI.flowChartViewer.graphs[config.containerId].zoomIn();
			});
			config.$workflowContainer.parent().children('.pt-btn-group').children().eq(1).off('click');
			config.$workflowContainer.parent().children('.pt-btn-group').children().eq(1).on('click',function(ev){
				nsUI.flowChartViewer.graphs[config.containerId].zoomOut();
			});
			graph.addListener(mxEvent.CLICK, function(sender, ev){
				if(ev.properties.cell==undefined){
					return;
				}
				if(ev.properties.cell.isVertex()){
					// 获取块元素的位置 长宽
					var evOffsetSize = getBlockOffsetSize(ev, config);
					var cell = ev.getProperty('cell');
					var cellId = cell.getId(); // 当前块元素id
					var activities = config.data.dataSource.instanceLayoutJson.activities; // 块元素配置参数
					/****************根据点击图形数据workitems长度判断刷新样式*************/
					// 点击图形对应的数据信息
					var activityInfo = false;
					for(var ai = 0; ai < activities.length; ai++){
						if(activities[ai].domId == cellId){
							activityInfo = activities[ai];
							break;
						}
					}
					var workitems = activityInfo.workitems;
					// 不存在workitems数据时 直接返回不执行操作
					if(typeof(workitems)=='undefined'||workitems.length==0){
						return ;
					}
					var workitemsLength = getWorkitemsLength(workitems);
					if(workitemsLength == 0){
						return ;
					}
					if(workitemsLength>1){
						// 数据列表
						showWorkitemsListGraph({
							cell : cell,
							codec : codec,
							cellId : cellId,
							activityInfo : activityInfo,
							$workflowContainer : config.$workflowContainer,
							dataSource : config.data.dataSource,
							containerId : config.containerId,
							url : config.data.url,
							parentContainerId : config.parentContainerId,
							outgoingWay : activityInfo.outgoingWay, // 10:发散 11分批
						})
						return;
					}
					/*******************根据状态展示点击效果*******************/
					var workitemObj = workitems[0][0];
					activityInfo.activityType = Number(activityInfo.activityType);
					activityInfo.activityType = isNaN(activityInfo.activityType) ? 1:activityInfo.activityType;
					switch(activityInfo.activityType){
						case 0: 	// 开始环节
						case 1: 	// 普通环节
						case 2: 	// 结束环节
						case 3: 	// 哑环节
						case 5: 	// 会签环节
							// 设置选中样式 若已选中 则不在重复选中
							setCheckedBlock(cell, activities, viewerCells);
							tab.initWorkflowPanel(activityInfo, workitemObj, activities, config.parentContainerId);
							break;
						case 4: 	// 子流程
							var workitemId = workitemObj.workitemId;
							var workFlowConfig = {
								type:'workitemId',
								workitemId:workitemId,
								urlName:'parentWorkitemId',
								containerId: config.parentContainerId,
							}
							var tabConfig = tab.tabConfigs[config.parentContainerId];
							tabConfig.workFlowList.splice(tabConfig.index+1);
							tabConfig.workFlowList.push(workFlowConfig);
							tabConfig.index = tabConfig.workFlowList.length-1;
							tabConfig.workitemUrlName = 'parentWorkitemId=';
							tab.refreshGroupByWorkitemId(workFlowConfig);
							break;
					}
				}
			});
		}
	}
	// 渲染多级工作流图形
	function initMultilevelGraph(config, styleSheetXMLDoc, otherConfig){
		var viewerCellsCodec = getViewerCellsCodecBySource(config, styleSheetXMLDoc);
		var viewerCells = viewerCellsCodec.viewerCells;
		var codec = viewerCellsCodec.codec;

		var cellId = otherConfig.cellId; // 当前块元素id
		var cell = false;
		for(var i=0;i<viewerCells.length;i++){
			if(viewerCells[i].id == cellId){
				cell = viewerCells[i];
				break;
			}
		}
		var activities = config.data.dataSource.instanceLayoutJson.activities; // 块元素配置参数
		/****************根据点击图形数据workitems长度判断刷新样式*************/
		// 点击图形对应的数据信息
		var activityInfo = false;
		for(var ai = 0; ai < activities.length; ai++){
			if(activities[ai].domId == cellId){
				activityInfo = activities[ai];
				break;
			}
		}
		var workitems = activityInfo.workitems;
		// 不存在workitems数据时 直接返回不执行操作
		if(typeof(workitems)=='undefined'||workitems.length==0){
			return ;
		}
		var workitemsLength = getWorkitemsLength(workitems);
		if(workitemsLength>1){
			// 数据列表 获取图形
			var listConfig = {
				cell : cell,
				codec : codec,
				activityInfo : activityInfo,
				outgoingWay : activityInfo.outgoingWay,
			}
			var viewerCellsList = getListGraph(listConfig);
			// 渲染图形
			var graphConfig = {
				viewerCells : viewerCellsList,
				dataSource : config.data.dataSource,
				activityInfo : activityInfo,
				url : config.data.url,
				unitId : config.containerId,
				containerId : config.parentContainerId,
			}
			showGroupByCells(graphConfig);
			// 添加事件
			var eventConfig = {
				activityInfo: activityInfo,
				activities : activities,
				viewerCells : viewerCellsList,
				containerId : config.parentContainerId,
			}
			showWorkitemsListEvent(eventConfig);
		}else{
			return false;
		}
	}
	// 获取workitems长度
	function getWorkitemsLength(workitems){
		var length = 0;
		for(var i=0; i<workitems.length; i++){
			for(var j=0; j<workitems[i].length; j++){
				length ++;
			}
		}
		return length;
	}
	// 根据准备好的块元素配置 显示图形
	function showGroupByCells(graphConfig){
		var viewerCells = graphConfig.viewerCells; // 所有的块元素
		//设置为只读
		graph.setEnabled(false);
		graph.setGridEnabled(false);
		// 设置滚动条 设置工作流整体拖动
		setGraphScrollDrag();
		// 开始填充
		model.beginUpdate();
		// 添加元素
		graph.addCells(viewerCells);
		// 刷新完成
		model.endUpdate();
		// 设置工作流的位置
		setGraphPosition(graphConfig);
		// 刷新树进程
		var tabConfig = tab.tabConfigs[graphConfig.containerId];
		tab.refreshTreeProcess(tabConfig.index, graphConfig.containerId);
		// websocket
        // var dataSource = graphConfig.dataSource;
        // var unitId = graphConfig.unitId;
        // var targetUrl = '/exchange/wf/';
        // var nsToporgid = $("#ns-toporgid").text();
        // if(typeof(nsToporgid)=="string"&&nsToporgid.length>0){
        // 	var userId = typeof(NetStarRabbitMQ.userId)=="string"?('.' + $.trim(NetStarRabbitMQ.userId)):'.*';
        // 	targetUrl += $.trim(nsToporgid) + '.wf.'+dataSource.processId+'.*.*.*.*'+userId;
	       //  var subscribeConfig2 = {
	       //      // target : '/exchange/wf/wf.workitem.*.'+dataSource.processId+'.#',
	       //      target : targetUrl,
	       //      unitId : unitId,
	       //      content : {'x-queue-name':'token'},
	       //      callbackHandler : function(obj){
	       //          // console.log(obj);
	       //          setTimeout(function(){
	       //          	var bodyInfo = obj.body;
		      //           // 获取workitemId通过返回消息
		      //           var bodyInfoArr = bodyInfo.split('.');
		      //           if(bodyInfoArr.length>=7){
		      //               var workitemId = bodyInfoArr[6];
		      //               var refer = dataSource.instanceLayoutJson.activities; // 参照数据
		      //               if(typeof(graphConfig.activityInfo)=="object"){
		      //                   refer = graphConfig.activityInfo;
		      //               }
		      //               var isHave = false;
		      //               if($.isArray(refer)){
		      //                   for(var i=0;i<refer.length;i++){
		      //                       isHave = getIsHaveWorkitemIdInActivityInfo(workitemId, refer[i]);
		      //                       if(isHave){
		      //                           break;
		      //                       }
		      //                   }
		      //               }else{
		      //                   isHave = getIsHaveWorkitemIdInActivityInfo(workitemId, refer);
		      //               }
		      //               if(isHave){
		      //                   tab.refreshWorkflow();
		      //               }
		      //           }
	       //          },500)
	       //      },
	       //  }
	       //  // NetStarRabbitMQ.subscribe(subscribeConfig);
        // }else{
        // 	nsAlert("没有获得topOrgId","error");
        // 	console.error(nsToporgid);
        // }
        if(typeof(NetStarRabbitMQ) == "object" && typeof(NetStarRabbitMQ.subscribeQueue[graphConfig.unitId])!="object"){
	        var subscribeConfig = {
	        	dataSource : graphConfig.dataSource,
	        	activityInfo : graphConfig.activityInfo,
	        	unitId : graphConfig.unitId,
	        	containerId : graphConfig.containerId,
	        }
	        NetStarRabbitMQ.workflowSubscribe(subscribeConfig);
        }
	}
	// 获得是否有正在查询的workitemId通过块元素的具体信息
	function getIsHaveWorkitemIdInActivityInfo(workitemId, activityInfo){
		var isHave = false;
		var workitems = activityInfo.workitems;
		if($.isArray(workitems)){
			for(var i=0;i<workitems.length;i++){
				if(workitems[i].workitemId == workitemId){
					isHave = true;
					break;
				}
			}
		}
		return isHave;
	}
	// 添加展示图形事件
	function showWorkitemsListEvent(showGroupConfig){
		var activityInfo = showGroupConfig.activityInfo;
		var activities = showGroupConfig.activities;
		var workitems = activityInfo.workitems;
		var viewerCells = showGroupConfig.viewerCells;
		var containerId = showGroupConfig.containerId;
		graph.addListener(mxEvent.CLICK, function(sender, ev){
			if(ev.properties.cell==undefined){
				return;
			}
			var cell = ev.getProperty('cell');
			var cellId = cell.getId(); // 当前块元素id
			var cellIdArr = cellId.split('-');
			var cellIndexX = Number(cellIdArr[2]);
			var cellIndexY = Number(cellIdArr[3]);
			var workitem = workitems[cellIndexX][cellIndexY];
			activityInfo.activityType = Number(activityInfo.activityType);
			activityInfo.activityType = isNaN(activityInfo.activityType) ? 1:activityInfo.activityType;
			switch(activityInfo.activityType){
				case 0: 	// 开始环节
				case 1: 	// 普通环节
				case 2: 	// 结束环节
				case 3: 	// 哑环节
				case 5: 	// 会签环节
					// 设置选中样式 若已选中 则不在重复选中
					setChildCheckedBlock(cell, workitem, workitems, viewerCells);
					tab.initWorkflowPanel(activityInfo, workitem, activities, containerId);
					break;
				case 4: 	// 子流程
					var workitemId = workitem.workitemId;
					var workFlowConfig = {
						type:'workitemId',
						workitemId:workitemId,
						urlName:'parentWorkitemId',
						containerId:containerId,
					}
					var tabConfig = tab.tabConfigs[containerId];
					tabConfig.workFlowList.splice(tabConfig.index+1);
					tabConfig.workFlowList.push(workFlowConfig);
					tabConfig.index = tabConfig.workFlowList.length-1;
					tabConfig.workitemUrlName = 'parentWorkitemId=';
					tab.refreshGroupByWorkitemId(workFlowConfig);
					break;
			}
		})
	}
	// 获得列表图形
	// 获得列表图形
	function getListGraph(listConfig){
		/*
		 * listConfig 		object 			列表图形配置参数
		 * 
		 * cellId 			object 			图形id
		 * cell 			object 			图形参数
		 * outgoingWay 		string 			展示类型
		 * activityInfo 	object 			图形信息数据
		 * codec 			object 			解码xml到graph配置
		 * config 			object 			组件配置
		 * activities 		object 			activities所有元素配置
		 */
		var cell = listConfig.cell;
		var codec = listConfig.codec;
		var activityInfo = listConfig.activityInfo;
		var outgoingWay = listConfig.outgoingWay ? listConfig.outgoingWay : 11;
		outgoingWay = Number(outgoingWay);
		// var activities = dataSource.instanceLayoutJson.activities;
		var workitems = activityInfo.workitems;

		var offsetX = cell.geometry.width;
		var offsetY = cell.geometry.height;
		var spacing = 20; // 元素间距
		// graph.setCellStyles('strokeColor',NSSTATESCOLOR.defaultStrokeColor,[cell]); // 设置边框颜色
		var viewerCells = []; // 块元素数组
		var mxCellDom = codec.encode(cell);
		// 获取图形的value值
		function getWorkitemValue(workitemObj){
			var valueStr = '';
			switch(outgoingWay){
				case 11:
					// 分批 批次号 bllobj
					valueStr = workitemObj.extName;
					break;
				default:
					// 发散 办理人名称
					valueStr = workitemObj.extName;
					break;
			}
			if(typeof(valueStr)=='undefined'){
				valueStr = '';
			}
			return valueStr;
		}
		var $mxCellDom = $(mxCellDom);
		for(var i=0; i<workitems.length; i++){
			// 列
			for(var j=0; j<workitems[i].length; j++){
				// 行
				var workitemObj = workitems[i][j];
				var $mxCellDomCopy = $mxCellDom.clone();
				// 修改块的id
				$mxCellDomCopy.attr('id',function(n,id){
					return id+'-copy-'+ i + '-' + j;
				})
				// 修改块的value
				var valueStr = getWorkitemValue(workitemObj);
				$mxCellDomCopy.attr('value',valueStr);
				$mxCellDomCopy.children().attr('x',function(n,x){
					return parseInt(x) + offsetX * j + spacing * j;
				});
				$mxCellDomCopy.children().attr('y',function(n,y){
					return parseInt(y) + offsetY * i + spacing * i;
				});
				// 解码复制的块
				var viewerCellCopy = codec.decode($mxCellDomCopy[0]);
				setWorkFlowColor(workitems[i][j], viewerCellCopy); // 设置复制块的颜色
				viewerCells.push(viewerCellCopy); // 添加到复制生成的块数组
			}
		}
		return viewerCells;
	}
	function getListGraph2(listConfig){
		/*
		 * listConfig 		object 			列表图形配置参数
		 * 
		 * cellId 			object 			图形id
		 * cell 			object 			图形参数
		 * outgoingWay 		string 			展示类型
		 * activityInfo 	object 			图形信息数据
		 * codec 			object 			解码xml到graph配置
		 * config 			object 			组件配置
		 * activities 		object 			activities所有元素配置
		 */
		var cell = listConfig.cell;
		var codec = listConfig.codec;
		var activityInfo = listConfig.activityInfo;
		var outgoingWay = listConfig.outgoingWay ? listConfig.outgoingWay : 11;
		outgoingWay = Number(outgoingWay);

		// var activities = dataSource.instanceLayoutJson.activities;
		var workitems = activityInfo.workitems;

		var offsetX = cell.geometry.width;
		var offsetY = cell.geometry.height;
		var spacing = 20; // 元素间距
		// graph.setCellStyles('strokeColor',NSSTATESCOLOR.defaultStrokeColor,[cell]); // 设置边框颜色
		var viewerCells = []; // 块元素数组
		var mxCellDom = codec.encode(cell);
		setWorkFlowColor(workitems[0], cell);  // 设置第一个块的颜色
		viewerCells.push(cell);
		// 获取图形的value值
		function getWorkitemValue(workitemObj){
			var valueStr = '';
			// switch(activityInfo.nameDisplayWay){
			// 	case 1:
			// 		// 活动名称
			// 		valueStr = activityInfo.activityName;
			// 		break;
			// 	case 2:
			// 		// 扩展名
			// 		valueStr = activityInfo.activityNameExt;
			// 		break;
			// 	case 3:
			// 		// 全名
			// 		valueStr = activityInfo.activityName + workitemObj.extName;
			// 		break;
			// 	default:
			// 		// 其它
			// 		valueStr = workitemObj.extName;
			// 		break;
			// }
			switch(outgoingWay){
				case 11:
					// 分批 批次号 bllobj
					// valueStr = workitemObj.bllobj;
					valueStr = workitemObj.extName;
					break;
				default:
					// 发散办理人名称
					// valueStr = workitemObj.transactor;
					valueStr = workitemObj.extName;
					break;
			}
			if(typeof(valueStr)=='undefined'){
				valueStr = '';
			}
			return valueStr;
		}
		var multiple = 1; // 间隔倍数
		var offsetYNum = 0; // 间隔倍数
		var offsetXNum = 0; // 间隔倍数
		for(var j=0;j<workitems.length;j++,multiple++){
			var workitemObj = workitems[j];
			var $mxCellDomCopy = $(mxCellDom).clone();
			// 修改块的id
			$mxCellDomCopy.attr('id',function(n,id){
				return id+'-copy-'+j;
			})
			// 修改块的value
			var valueStr = getWorkitemValue(workitemObj);
			$mxCellDomCopy.attr('value',valueStr);

			// 修改块的位置
			switch(outgoingWay){
				case 11:
					// 分批纵向
					$mxCellDomCopy.children().attr('x',function(n,x){
						return parseInt(x)+offsetXNum;
					});
					$mxCellDomCopy.children().attr('y',function(n,y){
						return parseInt(y)+offsetY*multiple + spacing*multiple;
					});
					if((j+1)%3==0){
						offsetXNum = (offsetX+spacing)*[(j+1)/2];
						multiple = -1;
					}
					break;
				default:
					// 发散横向
					$mxCellDomCopy.children().attr('x',function(n,x){
						return parseInt(x)+offsetX*multiple + spacing*multiple;
					});
					$mxCellDomCopy.children().attr('y',function(n,y){
						return parseInt(y)+offsetYNum;
					});
					if((j+1)%3==0){
						offsetYNum = (offsetY+spacing)*[(j+1)/2];
						multiple = -1;
					}
					break;
			}
			// 解码复制的块
			var viewerCellCopy = codec.decode($mxCellDomCopy[0]);
			setWorkFlowColor(workitems[j], viewerCellCopy); // 设置复制块的颜色
			viewerCells.push(viewerCellCopy); // 添加到复制生成的块数组
		}
		return viewerCells;
	}
	// 展示列表图形
	function showWorkitemsListGraph(listConfig){
		/*
		 * listConfig 		object 			列表图形配置参数
		 * 
		 * cellId 			object 			图形id
		 * cell 			object 			图形参数
		 * outgoingWay 		number 			展示类型 10发散11分批
		 * activityInfo 	object 			图形信息数据
		 * codec 			object 			解码xml到graph配置
		 * config 			object 			组件配置
		 * activities 		object 			activities所有元素配置
		 */
		// var config = listConfig.config;
		var cell = listConfig.cell;
		var codec = listConfig.codec;
		var cellId = listConfig.cellId;
		var url = listConfig.url;
		var dataSource = listConfig.dataSource;
		var activityInfo = listConfig.activityInfo;
		var $workflowContainer = listConfig.$workflowContainer;
		var containerId = listConfig.containerId;
		var parentContainerId = listConfig.parentContainerId;
		var outgoingWay = listConfig.outgoingWay;

		var activities = dataSource.instanceLayoutJson.activities;

		var tabConfig = tab.tabConfigs[parentContainerId];
		// 记录展示图形数据
		var saveConfig = {
			type: 'url',
			name: activityInfo.activityName,
			url : url,
			cellId : cellId,
			containerId : parentContainerId,
			outgoingWay : outgoingWay,
		}
		tabConfig.workFlowList.splice(tabConfig.index+1);
		tabConfig.workFlowList.push(saveConfig);
		tabConfig.index = tabConfig.workFlowList.length-1;
		// 生成图形管理器
		$workflowContainer.children().remove();
		var container = $workflowContainer[0];
		// 初始化图像
		model = new mxGraphModel(); //空的图像实体
		graph = new mxGraph(container, model);  //图像管理器
		nsUI.flowChartViewer.graphs[containerId] = graph;
		activityInfo.activityType = Number(activityInfo.activityType);
		// 获得图形
		var listConfig = {
			cell : cell,
			codec : codec,
			activityInfo : activityInfo,
			outgoingWay : outgoingWay,
		}
		var viewerCells = getListGraph(listConfig); 
		// 通过块元素数据渲染出图形
		var graphConfig = {
			viewerCells : viewerCells,
			dataSource : dataSource,
			activityInfo : activityInfo,
			url : url,
			unitId : containerId,
			containerId : parentContainerId,
		}
		showGroupByCells(graphConfig);
		// 添加图形事件
		var eventConfig = {
			activityInfo: activityInfo,
			activities : activities,
			viewerCells : viewerCells,
			containerId : parentContainerId,
		}
		showWorkitemsListEvent(eventConfig);
	}
	function setChildCheckedBlock(cell, cellAct, workitems, viewerCells){
		var cellId = cell.getId(); // 当前块元素id
		// 设置选中样式 若已选中 则不在重复选中
		// var cellAct = workitems[cellIndex]; // 当前块元素配置
		// 取消其它选中
		var checkedCellId = false;
		var checkedCell = false;
		var checkedActState = false;
		var index = -1;
		for(var actI=0;actI<workitems.length;actI++){
			for(var workI=0; workI<workitems[actI].length; workI++){
				index ++;
				// 判断当前是否选中 若选中取消选中
				if(workitems[actI][workI].webMark && workitems[actI][workI].webMark.isChecked){
					workitems[actI][workI].webMark.isChecked = false;
					checkedCellId = index;
					checkedActState = workitems[actI][workI].workitemstate;
				}
			}
		}
		if(typeof(checkedCellId)=="number"){
			checkedCell = viewerCells[checkedCellId];
		}
		// 设置当前选中配置
		cellAct.webMark = {isChecked : true};
		if(NSSTATESCOLOR.selectFillColor){
			graph.setCellStyles('fillColor',NSSTATESCOLOR.selectFillColor,[cell]);
		}
		if(NSSTATESCOLOR.selectStrokeColor){
			graph.setCellStyles('strokeColor',NSSTATESCOLOR.selectStrokeColor,[cell]);
		}
		if(checkedCell){
			var color = NSSTATESCOLOR[checkedActState];
			graph.setCellStyles('fillColor',color,[checkedCell]);
			var strokeColor = NSSTATESCOLORSTROKE[checkedActState];
			graph.setCellStyles('strokeColor',strokeColor,[checkedCell]);
		}
	}
	// 设置选中块元素样式 并改变选中标识
	function setCheckedBlock(cell, activities, viewerCells){
		var cellId = cell.getId(); // 当前块元素id
		// 设置选中样式 若已选中 则不在重复选中
		var cellAct = false; // 当前块元素配置
		for(var actI=0;actI<activities.length;actI++){
			var domId = activities[actI].domId;
			// 比较当前块元素和domId是否相等 相等表示当前块元素配置参数
			if(cellId == domId && activities[actI].webMark.isChecked!=true){
				cellAct = activities[actI];
				break;
			}
		}
		if(cellAct){
			// 取消其它选中
			var checkedCellId = false;
			var checkedCell = false;
			var checkedActState = false;
			for(var actI=0;actI<activities.length;actI++){
				// 判断当前是否选中 若选中取消选中
				if(activities[actI].webMark.isChecked){
					activities[actI].webMark.isChecked = false;
					checkedCellId = activities[actI].domId;
					if(activities[actI].workitems && activities[actI].workitems[0] && activities[actI].workitems[0][0]){
						checkedActState = typeof(activities[actI].workitems[0][0].workitemstate)!="undefined" ? activities[actI].workitems[0][0].workitemstate:'default';
					}else{
						checkedActState = 'default';
					}
				}
			}
			if(checkedCellId){
				for(var cellI=0;cellI<viewerCells.length;cellI++){
					if(checkedCellId == viewerCells[cellI].id && viewerCells[cellI].isVertex()){
						checkedCell = viewerCells[cellI];
						break;
					}
				}
			}
			// 设置当前选中配置
			cellAct.webMark.isChecked = true;
			if(NSSTATESCOLOR.selectFillColor){
				graph.setCellStyles('fillColor',NSSTATESCOLOR.selectFillColor,[cell]);
			}
			if(NSSTATESCOLOR.selectStrokeColor){
				graph.setCellStyles('strokeColor',NSSTATESCOLOR.selectStrokeColor,[cell]);
			}
			if(checkedCell){
				var color = NSSTATESCOLOR[checkedActState];
				graph.setCellStyles('fillColor',color,[checkedCell]);
				var strokeColor = NSSTATESCOLORSTROKE[checkedActState];
				graph.setCellStyles('strokeColor',strokeColor,[checkedCell]);
			}
		}
	}
	// 设置滚动条 设置工作流整体拖动
	function setGraphScrollDrag(){
		graph.panningHandler.ignoreCell = true;
		graph.setPanning(true);
		graph.scrollTileSize = new mxRectangle(0, 0, 1, 1);
				
		/**
		 * 使用滚动条后返回页面视图中页面的填充。
		 */
		graph.getPagePadding = function()
		{  	
			return new mxPoint(
					Math.max(0, Math.round(graph.container.offsetWidth - 34)),
					Math.max(0, Math.round(graph.container.offsetHeight - 34))
					);
		};

		/**
		 * 返回缩放的页面格式的大小。 svg大小位置 pageFormat svg的位置宽高 pageScale 页面的比例尺
		 */
		graph.getPageSize = function()
		{
			return (this.pageVisible) ? new mxRectangle(0, 0, this.pageFormat.width * this.pageScale,
					this.pageFormat.height * this.pageScale) : this.scrollTileSize;
		};
		
		/**
		 * 返回一个矩形，描述背景页的位置和计数，其中x和y是顶部的位置，左页,宽度,高度是垂直和水平的页数。
		 */
		graph.getPageLayout = function()
		{
			var size = (this.pageVisible) ? this.getPageSize() : this.scrollTileSize;
			var bounds = this.getGraphBounds(); // 界限

			if (bounds.width == 0 || bounds.height == 0)
			{
				return new mxRectangle(0, 0, 1, 1);
			}
			else
			{
				// 计算未转换图形边界
				var x = Math.ceil(bounds.x / this.view.scale - this.view.translate.x);
				var y = Math.ceil(bounds.y / this.view.scale - this.view.translate.y);
				var w = Math.floor(bounds.width / this.view.scale);
				var h = Math.floor(bounds.height / this.view.scale);
				
				var x0 = Math.floor(x / size.width);
				var y0 = Math.floor(y / size.height);
				var w0 = Math.ceil((x + w) / size.width) - x0;
				var h0 = Math.ceil((y + h) / size.height) - y0;
				
				return new mxRectangle(x0, y0, w0, h0);
			}
		};
		var graphSizeDidChange = graph.sizeDidChange;
		graph.sizeDidChange = function()
		{
			if (this.container != null && mxUtils.hasScrollbars(this.container))
			{
				var pages = this.getPageLayout(); // 获得矩形
				var pad = this.getPagePadding(); // 容器大小
				var size = this.getPageSize(); // 页面大小
				
				// Updates the minimum graph size
				// 更新最小图形大小
				var minw = Math.ceil(2 * pad.x / this.view.scale + pages.width * size.width);
				var minh = Math.ceil(2 * pad.y / this.view.scale + pages.height * size.height);
				
				var min = graph.minimumGraphSize;
				
				// LATER: Fix flicker of scrollbar size in IE quirks mode
				// after delayed call in window.resize event handler
				// 稍后：在IE Quikes模式下修复滚动条大小闪烁
				// 在窗口大小调整事件处理程序中的延迟调用之后
				if (min == null || min.width != minw || min.height != minh)
				{
					graph.minimumGraphSize = new mxRectangle(0, 0, minw, minh);
				}
				
				// Updates auto-translate to include padding and graph size
				// 更新自动转换为包含填充和图形大小
				var dx = pad.x / this.view.scale - pages.x * size.width;
				var dy = pad.y / this.view.scale - pages.y * size.height;
				
				if (!this.autoTranslate && (this.view.translate.x != dx || this.view.translate.y != dy))
				{
					this.autoTranslate = true;
					this.view.x0 = pages.x;
					this.view.y0 = pages.y;

					// NOTE: THIS INVOKES THIS METHOD AGAIN. UNFORTUNATELY THERE IS NO WAY AROUND THIS SINCE THE
					// BOUNDS ARE KNOWN AFTER THE VALIDATION AND SETTING THE TRANSLATE TRIGGERS A REVALIDATION.
					// SHOULD MOVE TRANSLATE/SCALE TO VIEW.
					// Note：再次调用此方法。不幸的是，这之后没有办法。
					// 边界在验证之后被设置，并且设置平移触发器重新验证。
					// 应该移动转换/缩放到视图。
					var tx = graph.view.translate.x;
					var ty = graph.view.translate.y;

					graph.view.setTranslate(dx, dy);
					graph.container.scrollLeft += (dx - tx) * graph.view.scale;
					graph.container.scrollTop += (dy - ty) * graph.view.scale;

					this.autoTranslate = false;
					return;
				}

				graphSizeDidChange.apply(this, arguments);
			}
		};
	}
	// 设置工作流的位置
	function setGraphPosition(graphConfig){
		// 当前显示的config
		var currentPageTabConfig = tab.tabConfigs[graphConfig.containerId];
		var bounds = graph.getGraphBounds();
		var width = Math.max(bounds.width, graph.scrollTileSize.width * graph.view.scale);
		var height = Math.max(bounds.height, graph.scrollTileSize.height * graph.view.scale);
		currentPageTabConfig.width = typeof(currentPageTabConfig.width) == "unmber" ? currentPageTabConfig.width : width;
		currentPageTabConfig.height = typeof(currentPageTabConfig.height) == "unmber" ? currentPageTabConfig.height : height;

		width = currentPageTabConfig.width;
		height = currentPageTabConfig.height;
		graph.container.scrollTop = Math.floor(Math.max(0, bounds.y - Math.max(20, (graph.container.clientHeight - height) / 4)));
		var scrollLeft = Math.floor(Math.max(0, bounds.x - Math.max(0, (graph.container.clientWidth - width) / 2)));
		graph.container.scrollLeft = scrollLeft + 150;
	}
	// 生成的提示信息
	function getTooltipHtml(infoStr, htmlId, config){
		var position = typeof(config.tooltipPosition)=='string'?config.tooltipPosition:'bottom';
		var styleStr = position=='bottom'||position=='top'?'left':'top';
		var html = '<div class="popover fade in '+position+'" id="'+htmlId+'" role="tooltip" style="display: block;">'
						+'<div class="arrow" style="'+styleStr+': 50%;">'
						+'</div>'
						// +'<h3 class="popover-title"></h3>'
						+'<div class="popover-content">'+infoStr+'</div>'
					+'</div>'
		return html;
	}
	// 获取块元素的位置 大小
	function getBlockOffsetSize(ev, config){
		// 计算位置
		var top = 0;
		var left = 0;
		var $this = $(ev.properties.event.target); // 提示信息设置位置时 根据$this的位置以及宽高设置
		var geometry = ev.properties.cell.geometry; // 块元素位置大小信息
		var zoomNum = typeof(config.zoomNum)=='number'?config.zoomNum:1; // 显示表单时缩放的比例
		var width = geometry.width*zoomNum; // 当前块元素显示的宽度
		var height = geometry.height*zoomNum; // 当前块元素显示的高度
		if(ev.properties.event.target.nodeName == 'text'){
			// 如果$this是text标签时查询与她相关的块容器标签 
			// 所有的位置都是根据块元素设置的 原因 设置边缘
			$this = $this.parent().parent().prev().children();
			if($this.length==0){
				$this = $(ev.properties.event.target);
				width = $this.width();
				height = $this.height();
			}
		}
		var offset = $this.offset(); // 块元素的偏移量
		var evOffsetSize = offset;
		evOffsetSize.width = width;
		evOffsetSize.height = height;
		return evOffsetSize;
	}
	// 设置提示信息位置
	function setTooltipPosition(offsetSize, tooltipId, config){
		var position = typeof(config.tooltipPosition)=='string'?config.tooltipPosition:'bottom'; // 设置的显示位置
		// 计算位置
		var top = 0;
		var left = 0;
		// var $this = $(ev.properties.event.target); // 提示信息设置位置时 根据$this的位置以及宽高设置
		// var geometry = ev.properties.cell.geometry; // 块元素位置大小信息
		// var zoomNum = typeof(config.zoomNum)=='number'?config.zoomNum:1; // 显示表单时缩放的比例
		// var width = geometry.width*zoomNum; // 当前块元素显示的宽度
		// var height = geometry.height*zoomNum; // 当前块元素显示的高度
		// if(ev.properties.event.target.nodeName == 'text'){
		// 	// 如果$this是text标签时查询与她相关的块容器标签 
		// 	// 所有的位置都是根据块元素设置的 原因 设置边缘
		// 	$this = $this.parent().parent().prev().children();
		// 	if($this.length==0){
		// 		$this = $(ev.properties.event.target);
		// 		width = $this.width();
		// 		height = $this.height();
		// 	}
		// }
		// var offset = $this.offset(); // 块元素的偏移量
		var $tooltip = $('#'+tooltipId); // 提示信息容器
		// 根据要显示的位置设置显示位置
		switch(position){
			case 'top':
				top = offsetSize.top - $tooltip.height();
				left = offsetSize.left + offsetSize.width/2 - $tooltip.width()/2;
				break;
			case 'bottom':
				top = offsetSize.top + offsetSize.height; 
				left = offsetSize.left + offsetSize.width/2 - $tooltip.width()/2;
				break;
			case 'left':
				top = offsetSize.top + offsetSize.height/2 - $tooltip.height()/2; 
				left = offsetSize.left - $tooltip.width();
				break;
			case 'right':
				top = offsetSize.top + offsetSize.height/2 - $tooltip.height()/2; 
				left = offsetSize.left + offsetSize.width;
				break;
		}
		// $tooltip.css({top:top,left:left});
		$tooltip.offset({top:top,left:left});
		// 动画样式
		var animationTime = typeof(config.animationTime)=='number'?config.animationTime:2;
		$tooltip.css({
			animation:'toTransparent '+animationTime+'s',
		});
		// 动画结束删除容器
		$tooltip.one(
			'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
			function(ev){
				$(this).remove();
			});
	}
	// 初始化dataSource 数据
	function initDataSource(dataSource){
		// 为activities添加属性用于前端标识存放
		var activities = dataSource.instanceLayoutJson.activities;
		for(var actI=0;actI<activities.length;actI++){
			activities[actI].webMark = {};
		}
	}
	// 验证dataSource配置是否正确
	function validataSource(dataSource){
		if(typeof(dataSource)!='object'){
			return false;
		}
		if(typeof(dataSource.instanceLayoutJson)=='string'){
			dataSource.instanceLayoutJson = JSON.parse(dataSource.instanceLayoutJson);
		}
		if(dataSource.instanceLayoutJson){
			if(!$.isArray(dataSource.instanceLayoutJson.activities)){
				return false;
			}
		}
		if(typeof(dataSource.processXml)=='undefined'){
			return false;
		}
		return true;
	}
	// 获得dataSource
	function getDataSource(config, callbackFunc){
		function getDataSourceHandler(){
			var isSuccess = validataSource(config.data.dataSource); // 验证dataSource
			if(isSuccess){
				// 记录父级workitemId
				var tabConfig = tab.tabConfigs[config.parentContainerId];
				tabConfig.parentWorkitemId = config.data.dataSource.parentWorkitemId;
				tabConfig.workflowData = config.data.dataSource;
				// 添加li标签属性 
				if(typeof(config.pageParams)=="object"){
					// 只有第一次添加
					var attrs = {
						instanceIds : config.data.dataSource.instanceIds
					}
					NetstarUI.labelpageVm.setDomAttr(config.pageParams, attrs);
				}
				// 当前流成图的workitemId或parentWorkitemId 记录流程图名称
				var url = config.data.url;
				var urlName = "workitemId";
				if(url.indexOf('parentWorkitemId')>-1){
					urlName = 'parentWorkitemId';
				}
				// var urlNameId = url.substring(url.indexOf(urlName)+urlName.length);
				// var url = config.data.url;
				var urlNameId = getWorkitemIdByUrl(url);
				var workFlowList = tabConfig.workFlowList;
				for(var i=0;i<workFlowList.length;i++){
					var workFlowListObjUrlName = '';
					if(i===0){
						workFlowListObjUrlName = "workitemId";
					}else{
						workFlowListObjUrlName = typeof(workFlowList[i].urlName)=="string"?workFlowList[i].urlName:"parentWorkitemId";
					}
					if(workFlowList[i].workitemId==urlNameId && workFlowListObjUrlName==urlName){
						workFlowList[i].name = config.data.dataSource.instanceLayoutJson.processName;
						workFlowList[i].instanceIds = config.data.dataSource.instanceIds; // 实例id
					}
				}
				// 初始化dataSource
				initDataSource(config.data.dataSource);
				callbackFunc(config);
			}else{
				nsAlert('获得的dataSource错误','error');
				console.error(config.data);
			}
		}
		if(typeof(config.data.dataSource) == 'undefined'){
			//如果数据未获取，则发送ajax获取获取
			var ajaxConfig = {
				url:config.data.url,
				type:config.data.type,
				dataSrc:'data',
			}
			nsVals.ajax(ajaxConfig, function(res, ajaxConfig){
				config.data.dataSource = res[ajaxConfig.dataSrc];
				getDataSourceHandler();
			})
		}else{
			getDataSourceHandler();
		}
	}
	// tab
	var tab = {
		// 弹框数据地址
		// url: getRootPath()+'/assets/json/workflow/viewer-demo-4.json?',
		// 工作流面板发送的请求
		// panelUrl: getRootPath()+'/assets/json/workflow/time.json?workitemId=',
		// 其它按钮
		btnsHtml: '<button class="pt-btn pt-btn-icon pt-btn-link" name="retreat"><i class="icon-arrow-left-alt-o"></i></button>'
				+ '<button class="pt-btn pt-btn-icon pt-btn-link" name="advance"><i class="icon-arrow-right-alt-o"></i></button>'
				+ '<button class="pt-btn pt-btn-icon pt-btn-link" name="parent"><i class="icon-arrow-top-alt-o"></i></button>'
				+ '<button class="pt-btn pt-btn-icon pt-btn-link" name="refresh"><i class="icon-return"></i></button>',
		viewerConfig: {
			id: 		 		'flowchart',
			type: 		 		'flowchartviewer',
			columnClass: 		'fullColumn',
			height: 			'auto',
			readonly: 			false,
			data:{
				type: 			'GET',
			},
		},
		// vue的tab配置
		tabConfigs: {},
		/***树进程相关方法***/
		// 获得工作流记录 通过实例
		getWorkFlowListByInstanceIds: function(_workFlowList, index){
			var workFlowList = [];
			for(var i=0; i<(index+1); i++){
				var isHadSave = false;
				for(var j=0; j<workFlowList.length; j++){
					if(typeof(_workFlowList[i].instanceIds)!="undefined" && _workFlowList[i].instanceIds == workFlowList[j].instanceIds){
						isHadSave = true;
						workFlowList.splice(j+1);
						break;
					}
				}
				if( i < index &&
					_workFlowList[i+1] &&
					_workFlowList[i+1].type == "workitemId" &&
					_workFlowList[i+1].urlName == "workitemId"
				){
					// 子流程到父流程 不显示子流程
					continue;
				}
				if(!isHadSave){
					workFlowList.push(_workFlowList[i]);
				}
			}
			return workFlowList;
		},
		// 刷新树进程
		refreshTreeProcess: function(index, containerId){
			var tabConfig = tab.tabConfigs[containerId];
			var _workFlowList = tabConfig.workFlowList;
			var workFlowList = this.getWorkFlowListByInstanceIds(_workFlowList, tabConfig.index); // 获得工作流记录 通过实例
			var $treeProcess = tabConfig.$workflowContainer.parent().children('[ns-type="tree-process"]');
			$treeProcess.children().remove();
			var processHtml = '';
			for(var i=0;i<workFlowList.length&&i<=index;i++){
				var name = workFlowList[i].name;
				if(i<(workFlowList.length-1)&&i<index){
					name += ' >';
				}
				processHtml += '<li ns-position="'+i+'">'+name+'</li>';
			}
			var $processli = $(processHtml);
			$processli.off('click');
			$processli.on('click',function(ev){
				var $this = $(this);
				var position = Number($this.attr('ns-position'));
				var advanceWorkflow = workFlowList[position];
				tabConfig.index = position;
				tab.refreshWorkflow(containerId);
			});
			$treeProcess.append($processli);
		},
		/***工作流面板相关***/
		// 初始化面板方法
		initPanelEvent: function($workflowContainer){
			var $panel = $workflowContainer.children('.flowchartviewer-panel');
			var $close = $panel.children('.flowchartviewer-header').children('button');
			var $body = $panel.children('.flowchartviewer-body');
			var $footer = $panel.children('.flowchartviewer-footer');
			$close.off('click');
			$close.on('click', function(){
				$workflowContainer.children().remove();
			});
		},
		// 获取面板按钮jQuery对象
		getShowPanelBtnsJQObj: function(parameter){
			/*
			 * parameter 参数对象 
			 * 	{ active：点击的当前图形配置数据 allData: 工作流所有图形数据 timeData: 时间线数据}
			 */
			var workitemstate = parameter.active.workitemstate;
			var btnsList = this.TEMPLATEBTNS[workitemstate];
			var html = '<div class="btn-group">';
			for(var i=0;i<btnsList.length;i++){
				html += '<button class="btn btn-white" index="'+i+'">'+btnsList[i].name+'</button>';
			}
			html += '</div>'
			var $html = $(html);
			$html.children('button').off('click');
			$html.children('button').on('click', function(ev){
				var index = Number($(this).attr('index'));
				var func = btnsList[index].func;
				func(parameter);
			});
			return $html;
		},
		// 模板语言
		getWordByOperaType:function(timeData){
			// timeData日期对象
			var type = timeData.wfOperationLogOperationType;
			var userName = timeData.wfOperationLogUserName;
			var activity = '"'+timeData.wfOperationLogRollbackTo+'"';
			var typeWord = this.TEMPLATEWORD[type];
			var userNameStr = '{userName}';
			// var itemNameStr = '{itemName}';
			var activityStr = '{activity}';
			if(typeWord.indexOf(userNameStr)>-1){
				typeWord = typeWord.replace(userNameStr,userName);
			}
			if(typeWord.indexOf(activityStr)>-1){
				typeWord = typeWord.replace(activityStr,activity);
			}
			return typeWord;
		},
		// 获取显示时间线的html
		getShowTimelineHtml: function(timeLineData){
			var html = '';
			if(!$.isArray(timeLineData)){
				// 不是数组报错
				nsAlert('时间线数据返回错误','error');
				console.error('时间线数据返回错误');
				console.error(timeLineData);
				return html;
			}
			html = '<ul class="flowchartviewer-timeline">'
			for(var i=0;i<timeLineData.length;i++){
				var timeData = timeLineData[i];
				var time = moment(timeData.wfOperationLogOperationTime).format('YYYY-MM-DD HH:mm:ss');
				var typeWord = this.getWordByOperaType(timeData);
				var liHtml = '<span class="flowchartviewer-timeline-type">'+typeWord+'</span>'
							+'<span class="flowchartviewer-timeline-time">'+time+'</span>';
				// 根据状态获取类名
				var classStr = '';
				if(i==0){
					classStr = 'current';
				}
				html += '<li class="flowchartviewer-timeline-li '+classStr+'">'
							+ liHtml
						+ '</li>';
			}
			html += '</ul>';
			return html;
		},
		// 获得面板的html
		getWorkflowPanelHtml: function(tabConfig){
			var html = 	'<div class="flowchartviewer-panel">'
							+ '<div class="flowchartviewer-header">'
								+ '<button type="button" class="close">×</button>'
								+ '<h4 class="flowchartviewer-title">'+tabConfig.itemName+'</h4>'
							+ '</div>'
							+ '<div class="flowchartviewer-body">'
							+ '</div>'
							+ '<div class="flowchartviewer-footer">'
							+ '</div>'
						+ '<div>';
			return html;
		},
		// 初始化工作流面板
		initWorkflowPanel: function(activityInfo, workitemObj, activities, containerId){
			/*
			 * activityInfo  	流程的完整的信息
			 * workitemObj 		当前工作流块信息
			 * activities 		所有工作流信息
			 */
			var tabConfig = this.tabConfigs[containerId];
			tabConfig.itemName = activityInfo.activityName;
			tabConfig.activityType = activityInfo.activityType;
			tabConfig.$workflowPanel.children().remove();
			var html = this.getWorkflowPanelHtml(tabConfig);
			tabConfig.$workflowPanel.append(html);
			// 设置样式
			var width = tabConfig.$workflowContainer.width();
			var height = tabConfig.$workflowContainer.height();
			tabConfig.$workflowPanel.children().width(300);
			tabConfig.$workflowPanel.children().height(height);
			tabConfig.$workflowPanel.children().css({
										'position':'absolute',
										'z-index':1,
									});
			// 发送ajax获得时间线数据 填充面板
			var ajaxConfig = {
				url:tab.PANELURL + workitemObj.workitemId,
				type:'GET',
				dataSrc:'rows',
				parameter:{
					containerId:containerId,
					active:workitemObj,
					allData:activities,
					workitemUrlName:tabConfig.workitemUrlName,
					parentWorkitemId:tabConfig.parentWorkitemId,
				}
			}
			nsVals.ajax(ajaxConfig, function(res, ajaxConfig){
				var timeLineData = res[ajaxConfig.dataSrc];
				var timeLineHtml = tab.getShowTimelineHtml(timeLineData);
				tabConfig.$workflowPanel.children().children('.flowchartviewer-body').append(timeLineHtml);
				ajaxConfig.parameter.timeData = timeLineData;
				var $btns = tab.getShowPanelBtnsJQObj(ajaxConfig.parameter);
				tabConfig.$workflowPanel.children().children('.flowchartviewer-header').append($btns);
				// 初始化事件
				tab.initPanelEvent(tabConfig.$workflowPanel);
				// 设置面板body高度 整体高度-头-尾
				var conHeight = tabConfig.$workflowPanel.children().outerHeight();
				var headerHeight = tabConfig.$workflowPanel.children().children('.flowchartviewer-header').outerHeight();
				var footerHeight = tabConfig.$workflowPanel.children().children('.flowchartviewer-footer').outerHeight();
				tabConfig.$workflowPanel.children().children('.flowchartviewer-body').outerHeight(conHeight-headerHeight-footerHeight);
			})
		},
		/***工作流图像相关***/
		// 刷新工作流数据
		refreshWorkflow : function(containerId){
			var tabConfig = this.tabConfigs[containerId];
			var workFlowList = tabConfig.workFlowList;
			var index = tabConfig.index;
			var advanceWorkflow = workFlowList[index];

			if(advanceWorkflow.urlName == 'workitemId' || index==0){
				tabConfig.workitemUrlName = 'workitemId=';
			}else{
				tabConfig.workitemUrlName = 'parentWorkitemId=';
			}
			if(advanceWorkflow.type == 'workitemId'){
				tab.refreshGroupByWorkitemId(advanceWorkflow);
			}else{
				tab.refreshGroupByWorkflowId(advanceWorkflow);
			}
		},
		// 通过workitemId刷新工作流
		refreshGroupByWorkitemId: function(obj){
			var containerId = obj.containerId;
			var workitemId = obj.workitemId;
			var tabConfig = tab.tabConfigs[containerId];
			// tabConfig.$workflowContainer.children().remove();
			tabConfig.$workflowPanel.children().remove();
			var viewerConfig = $.extend(true, {}, this.viewerConfig);
			viewerConfig.parentContainerId = containerId;
			viewerConfig.containerId = containerId + '-' + viewerConfig.id;
			viewerConfig.data.url = this.URL + tabConfig.workitemUrlName + workitemId;
			nsUI.flowChartViewer.init(viewerConfig);
		},
		// 通过完整的url刷新工作流 子流程/分散块
		refreshGroupByWorkflowId: function(obj){
			var containerId = obj.containerId;
			var tabConfig = tab.tabConfigs[containerId];
			// tabConfig.$workflowContainer.children().remove();
			tabConfig.$workflowPanel.children().remove();
			var viewerConfig = $.extend(true, {}, this.viewerConfig);
			viewerConfig.parentContainerId = containerId;
			viewerConfig.containerId = containerId + '-' + viewerConfig.id;
			viewerConfig.data.url = obj.url;
			nsUI.flowChartViewer.initMultilevel(viewerConfig, obj);
		},
		// 初始化添加按钮方法
		initAddBtnsEvent: function(containerId){
			var tabConfig = tab.tabConfigs[containerId];
			var $btnsContainer = tabConfig.$btnsContainer;
			var $btns = $btnsContainer.children('button');
			$btns.off('click');
			$btns.on('click',function(ev){
				var $this = $(this);
				var name = $this.attr('name');
				var index = tabConfig.index; // 当前显示数据位置
				var workFlowList = tabConfig.workFlowList; // 数据列表
				var parentWorkitemId = tabConfig.parentWorkitemId;// 父级
				switch(name){
					case 'advance':
						// 前进
						if((index+1) == workFlowList.length){
							nsAlert('已经是最前边了！');
							return;
						}
						tabConfig.index += 1;
						break;
					case 'retreat':
						// 后退
						if(index == 0){
							nsAlert('已经是最后边了！');
							return;
						}
						tabConfig.index -= 1;
						break;
					case 'parent':
						// 父级
						if(!parentWorkitemId){
							return;
						}
						tabConfig.workitemUrlName = 'workitemId=';
						var workitemConfig = {
							type:'workitemId',
							workitemId:parentWorkitemId,
							urlName : 'workitemId',
							containerId : containerId,
						}
						tabConfig.workFlowList.splice(tabConfig.index+1);
						tabConfig.workFlowList.push(workitemConfig);
						tabConfig.index = tabConfig.workFlowList.length-1;
						break;
					case 'refresh':
						break;
				}
				tab.refreshWorkflow(containerId); // 刷新
			});
		},
		getWorkflowContainer: function(viewerConfig){
			var containerId = viewerConfig.parentContainerId;
			var $container = $('#'+containerId);
			var winHeight = $(document).height();
			var headHeight = $('.pt-header').outerHeight();
			var heightStr = 'height:' + (winHeight-headHeight-67) + 'px;';
			var html = '<div class="flowchart">'
							+ '<div class="pt-btn-group pt-btn-group-lg">'
								+ '<button class="pt-btn pt-btn-icon pt-btn-link"><i class="icon-zoom-in"></i></button>'
								+ '<button class="pt-btn pt-btn-icon pt-btn-link"><i class="icon-zoom-out"></i></button>'
							+ '</div>'
							+ '<ul class="" ns-type="tree-process"></ul>'
							+ '<div class="form-control flowchartviewer"'
								+ ' id="' + viewerConfig.fullID + '"'
								+ ' nstype="' + viewerConfig.type + '"'
								+ ' ns-id="' + viewerConfig.id + '"'
								+ ' style="overflow:auto;'+heightStr+'"'
								+ '"></div>'
						+ '</div>';
			return $(html);
		},
		setDefault: function(config){
			var defaultConfig = {
				title : '',
				attrs : {},
			}
			nsVals.setDefaultValues(config, defaultConfig);
		},
		// 验证
		validata: function(config){
			var validArr =
				[
					['id', 			'string', 	    true],
					['workitemId', 	'string', 	    true],
					['title', 		'string', 	    false],
					['attrs', 		'object', 	    false],
				]
			var isValid = nsDebuger.validOptions(validArr, config);
			return isValid;
		},
		// 初始化 tab信息
		initTabInfo: function(){
			// 初始化工作流数据
			tab.TEMPLATEWORD = nsEngine.workFlowPreviewConfig.TEMPLATEWORD; 				// 面板显示信息
			tab.TEMPLATEBTNS = nsEngine.workFlowPreviewConfig.TEMPLATEBTNS; 				// 面板按钮
			tab.URL = getRootPath()+nsEngine.workFlowPreviewConfig.url; 					// 弹框数据地址
			tab.PANELURL = getRootPath()+nsEngine.workFlowPreviewConfig.panelUrl; 			// 工作流面板发送的请求
		},
		// 获取是否存在实例id相同的流程图存在打开状态 若存在返回url位置 不存在返回false
		getUrlIndexByInstanceId : function(instanceIds, containerId){
			var urlIndex = false;;
			if(!NetstarUI){
				return urlIndex;
			}
			var labelPagesArr = NetstarUI.labelpageVm.labelPagesArr;
			for(var i=0; i<labelPagesArr.length; i++){
				var labelPage = labelPagesArr[i];
				var iUrl = labelPage.url;
				if(!labelPage.dom){
					continue;
				}
				var iContainerId = labelPage.dom.id;
				if(iContainerId != containerId && labelPage.attrs.instanceIds == instanceIds){
					urlIndex = i;
					break;
				}
			}
			return urlIndex;
		},
		// 展示
		init: function(config){
			/* config {}
			 * workitemId 	string 			数据id  url是写死的末尾的workitemId与url拼接在一起是发送的url
			 * title	 	string
			 * id			string
			 * attrs 		object	
			 */
			// 验证
			var isValid = this.validata(config);
			if(!isValid){
				return;
			}
			// 设置默认
			this.setDefault(config);
			// 初始化tab信息
			this.initTabInfo();
			var containerId = config.id + '-workflowcontainer';
			// 开始进入的tab
			var html = '<div id="'+containerId+'"></div>';
			// tab 配置参数
			config.attrs.rabbitmq = containerId;
			config.attrs.pagename = 'workflow';
			var pageContainerConfig = {
				type : 'workflowTab',
				id : containerId,
				html : html,
				title : config.title,
				attrs : config.attrs,
				workitemId : config.workitemId,
				viewerConfig : $.extend(true, {}, this.viewerConfig),
			};
			// 记录显示tab所有参数
			// if(!tab.tabConfigs[containerId]){
				tab.tabConfigs[containerId] = {
					pageContainerConfig : pageContainerConfig,
					workFlowList : [{
						type : 'workitemId', 		// 记录的数据类型 	workitemId表示ajax获取数据 data表示已经有数据了传入数据
						workitemId : config.workitemId, 	// 具体渲染数据 	workitemId或data值
						containerId : containerId,  // 页面id
						urlName : 'workitemId',
					}],
					index : 0,
					parentWorkitemId : false,
					workitemUrlName : 'workitemId=',
				};
			// }
			// tab页配置
			var tabConfig = tab.tabConfigs[containerId];
			var viewerConfig = pageContainerConfig.viewerConfig;
			viewerConfig.data.url = this.URL + tabConfig.workitemUrlName + config.workitemId;
			// 弹框显示出来之后插入其他面板容器
			pageContainerConfig.shownHandler = function(obj){
				viewerConfig.pageParams = obj;
				// 工作流容器 id
				viewerConfig.fullID = containerId + '-' + viewerConfig.id;
				viewerConfig.containerId = viewerConfig.fullID;
				// 页面配置 id
				viewerConfig.parentContainerId = containerId;
				// 获得工作流相关容器
				var $workflowContentContainer = tab.getWorkflowContainer(viewerConfig);
				$container = $('#'+containerId);
				// 清空容器
				$container.append($workflowContentContainer);
				// 初始化工作流
				nsUI.flowChartViewer.init(viewerConfig);
				// 面板容器 id
				var workflowPanelId = viewerConfig.containerId + '-panel';
				// 在工作流相关容器即与工作流容器平级插如面板容器
				var workFlowPanelHtml = '<div class="flowchartviewer-panel-container" id="'+workflowPanelId+'"></div>';
				$workflowContentContainer.prepend(workFlowPanelHtml);
				// 工作流容器
				tabConfig.$workflowContainer = $('#'+viewerConfig.containerId);
				// 面板容器
				tabConfig.$workflowPanel = $('#'+workflowPanelId);
				// 插入其它按钮 前进/后退/上级
				var btnsHtml = tab.btnsHtml;
				var $btnsContainer = tabConfig.$workflowContainer.parent().children('.pt-btn-group');
				tabConfig.$btnsContainer = $btnsContainer;
				tabConfig.$btnsContainer.append(btnsHtml);
				// 初始化添加按钮方法
				tab.initAddBtnsEvent(containerId);
			}
			pageContainerConfig.closeHandler = function(){
				// NetStarRabbitMQ.unsubscribeByUntId(viewerConfig.containerId);
				NetStarRabbitMQ.unsubscribeByUntId(viewerConfig.parentContainerId);
			}
			NetstarUI.labelpageVm.loadPage(pageContainerConfig);
		},
	}
	var configData = {};
	// 初始化多级块
	function initMultilevel(_config, otherConfig){
		//浏览器或者组件不完整
		if(isComponentSupport() == false){
			return false;
		}
		var config = getConfig(_config);
		configData[config.id] = config;
		//获取shape库
		getStencilLib(config, function(config){
			//获取数据
			getDataSource(config, function(__config){
				//获取styleSheet
				getStyleSheetXML(__config, function(___config, resStyleSheet){
					//获取样式表XML <mxStylesheet><add>
					initMultilevelGraph(___config, resStyleSheet, otherConfig)
				});
			})
		})
	}
	function init(_config){
		//浏览器或者组件不完整
		if(isComponentSupport() == false){
			return false;
		}
		var config = getConfig(_config);
		configData[config.id] = config;
		//获取shape库
		getStencilLib(config, function(config){
			//获取数据
			getDataSource(config, function(__config){
				//获取styleSheet
				getStyleSheetXML(__config, function(___config, resStyleSheet){
					//获取样式表XML <mxStylesheet><add>
					initGraph(___config, resStyleSheet)
				});  
				// 判断是否存在实例id相同的流程图在打开状态
				var urlIndex = tab.getUrlIndexByInstanceId(__config.data.dataSource.instanceIds, __config.parentContainerId);
				if(urlIndex !== false){
					NetstarUI.labelpageVm.removeCurrent(urlIndex);
				}
			})
		})
	}
	return {
		VERSION:VERSION,
		I18N:I18N,
		init:init,
		data:configData,
		styleSheet:styleSheet,
		stencilsLib:stencilsLib,
		initMultilevel:initMultilevel,
		graphs:graphs,
		getGraph:function(){return graph},
		getModel:function(){return model},
		tab : tab,
	}
})(jQuery);