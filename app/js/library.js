/**
 * Created by dtx on 16/8/23.
 */

(function ($) {
    componentList = {
        getSceneListList : function (data) {
            for(var i=0;i<data.length;i++){
                $(".componentListTab").append("<li><a class='tab' index="+i+">"+data[i].busiName+"</a></li>");
            }
            var dom = $(".tab:first-child")[0];
            $(dom).addClass("aSelected");
        },
        getIndustryList : function (data,isclick) {
            if(isclick=="0"){
                var index = 0;
            }else {
                var index = isclick;
            }
            if($(".industry").length>0){
                $(".industry").remove();
            }
            for(var i=0;i<data[index].data.length;i++){
                var industry_dom = "<div class='industry'><p>"+data[index].data[i].typeName+"</p></div>";
                $(".componentList").append(industry_dom);
                for(var j=0;j<data[index].data[i].data.length;j++){
                    if(!data[index].data[i].data[j].cfgDgm){
                        var url = "../img/1.jpg"
                    }else{
                        url = data[index].data[i].data[j].cfgDgm
                    }
                    var component_dom = "<div class='component'><a href='componentDetail.html?id="+data[index].data[i].data[j].id+"' target='mainIframe'><img class='img' src="+url+"><span>"+data[index].data[i].data[j].cptName+"</span></a></div>";
                    $($(".industry")[i]).append(component_dom);
                }
            }
        },
        getComponentLibrary : function () {
            var that = this;
            $.ajaxJSON({
                name: '构件库',
                url: URL.GET_COMPONENT_BASE_LIST,
                iframe: true,
                success: function (r) {
                    var data = r.data.data;
                    that.getSceneListList(data);
                    that.getIndustryList(data,"0");
                }
            });
        },
        bindEvent : function () {
            var that = this;
            $(".tab").on("click",function () {
                var index = $(this).attr("index");
                $("a.tab").siblings().prevObject.removeClass("aSelected");
                $(this).addClass("aSelected");
                that.getIndustryList(componentList_data,index);
            });
            $("#sl").on("click",function () {
                var ele = $("#gj");
                $("#gj").newAffectionAnalysed(ele,options);
            })
        },
        init : function () {
            this.getComponentLibrary();
            this.bindEvent();
        }
    }.init();

})(jQuery);