/**
 * Created by dtx on 16/8/24.
 */

(function ($) {

    componentDetail = {
        
        init : function () {
            var id = $.getQueryParams()
            //ajax get data with id
            var component_data = {
                "code":200,
                "msg":"操作成功",
                "type":0,
                "data":{
                    "id":1,
                    "cptName":"手机新品查询（监测）构件",
                    "cptType":"0",
                    "busiType":"1",
                    "cptDesc":"实时监测指定时间段内市场上即将发布或已发布的新品手机.罗列出该机型的发布时间,厂商,参数等详细信息",
                    "inDesc":"实时监测指定时间段内市场上即将发布或已发布的新品手机.罗列出该机型的发布时间,厂商,参数等详细信息",
                    "outDesc":"实时监测指定时间段内市场上即将发布或已发布的新品手机.罗列出该机型的发布时间,厂商,参数等详细信息",
                    "cfgDgm":"../img/1.jpg",
                    "showDgm":null,
                    "usable":2,
                    "createTime":"2016-08-16 10:50:27"
                }
            }
            $(".componentName").append(component_data.data.cptName);
            $("#componentImg").attr("src",component_data.data.cfgDgm);
            $("#description").append(component_data.data.cptDesc);
            $("#inDesc").append(component_data.data.inDesc);
            $("#outDesc").append(component_data.data.outDesc);
        }
    }.init();
})(jQuery)