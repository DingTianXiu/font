/**
 * Created by dtx on 16/8/24.
 */

(function ($) {

    componentDetail = {

        bindEvent : function (id,type) {
            $("#useComponent").on("click",function () {
                location.href="scheme.html?baseCptId="+id+"&instCptKey="+type
            })
        },
        init : function () {
            var that = this;
            var id = $.getQueryParams().id;
            console.log(id);
            $.ajaxJSON({
                name: '构建详情',
                url: URL.GET_COMPONENT_BASE_DETAIL,
                data: {"cptId" : id},
                success: function (r) {
                    var data = r.data;
                    console.log(data);
                    $(".componentName").append(data.cptName);
                    if(data.cfgDgm){
                        var url = data.cfgDgm;
                    }else{
                        var url = "../img/1.jpg";
                    }
                    $("#componentImg").attr("src",url);
                    $("#description").append(data.cptDesc);
                    $("#inDesc").append(data.inDesc);
                    $("#outDesc").append(data.outDesc);
                    that.bindEvent(id,data.cptType)
                }
            });
        }
    }.init();
})(jQuery);