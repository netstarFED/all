var NetstarDocs = {
    el:{},
    init:function(){
        this.navigator();
    },
    navigator:function(){
        // 查询当前container
        var $container = $('container:not([nsdoc="normal"])');
        var $content = $container.find('.panel.content');
        var $netstarDocs = $content.find('[netstar-doc]');
        // 获得所有标记 生成左侧列表
        var lisArr = [];
        for(var i=0; i<$netstarDocs.length; i++){
            var $netstarDoc = $netstarDocs.eq(i);
            var netstarDocVal = $netstarDoc.attr('netstar-doc');
            switch(netstarDocVal){
                case 'intro' :
                    /**
                     * 根据有id的h2标签获取
                     */
                    var $h2 = $netstarDoc.find('h2[id]');
                    if($h2.length == 0){
                        console.warn('没有设置h2标签');
                        console.warn($netstarDoc);
                        break;
                    }
                    if($h2.length > 1){
                        console.warn('配置错误，netstar-doc面板中只能有一个有id的h2标签');
                        console.warn($netstarDoc);
                        break;
                    }
                    var h2Id = $h2.attr('id');
                    var h2Text = $h2.text();
                    var obj = {
                        id : h2Id,
                        text : h2Text
                    }
                    lisArr.push(obj);
                    break;
                case 'sample':
                    /**
                     * 根据有id的a标签和一级h3标签获取
                     */
                    var $a = $netstarDoc.children('a[id]');
                    if($a.length == 0){
                        console.warn('没有设置a标签');
                        console.warn($netstarDoc);
                        break;
                    }
                    if($a.length > 1){
                        console.warn('配置错误，netstar-doc面板中只能有一个有id的a标签');
                        console.warn($netstarDoc);
                        break;
                    }
                    var $h3 = $netstarDoc.children('h3.title-code');
                    if($h3.length == 0){
                        console.warn('没有设置h3标签');
                        console.warn($netstarDoc);
                        break;
                    }
                    if($h3.length > 1){
                        console.warn('配置错误，netstar-doc面板中必须有一个设置.title-code的h3标签');
                        console.warn($netstarDoc);
                        break;
                    }
                    var aId = $a.attr('id');
                    var h3Text = $h3.text();
                    var obj = {
                        id : aId,
                        text : h3Text
                    }
                    lisArr.push(obj);
                    break;
                default:
                    console.warn('不能识别netstar-doc：' + netstarDocVal);
                    console.warn($netstarDoc);
                    break;
            }
        }
        var lisStr = '';
        for(var i=0; i<lisArr.length; i++){
            var liObj = lisArr[i];
            lisStr += '<li><a href="#' + liObj.id + '">' + liObj.text + '</a></li>';
        }
        var html = '<div class="panel nav-stacked">'
                        + '<div class="side-bar">'
                            + '<ul>'
                                + lisStr
                            + '</ul>'
                        + '</div>'
                    + '</div>';
        $content.before(html);
        $container.attr('nsdoc', 'normal');
    }
}