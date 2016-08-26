/**
 * Created by dtx on 16/8/23.
 */

(function ($) {
    //ajax
<<<<<<< HEAD
    // var componentList_data = [
    //     {
    //         "name" : "新品分析1",
    //         "value" : "2",
    //         "data" :[{
    //             "name" : "手机行业",
    //             "value" : "2",
    //             data : [
    //                 {
    //                     "id":4,
    //                     "cptName":"手机新品查询(监测)",
    //                     "cptType":"0",
    //                     "busiType":"2",
    //                     "cptDesc":null,
    //                     "inDesc":null,
    //                     "outDesc":null,
    //                     "cfgDgm":"../img/1.jpg",
    //                     "showDgm":null,
    //                     "createTime":"2016-08-16 10:50:33"
    //                 },
    //                 {
    //                     "id":4,
    //                     "cptName":"新品查询声量分析",
    //                     "cptType":"0",
    //                     "busiType":"2",
    //                     "cptDesc":null,
    //                     "inDesc":null,
    //                     "outDesc":null,
    //                     "cfgDgm":"../img/2.jpg",
    //                     "showDgm":null,
    //                     "createTime":"2016-08-16 10:50:33"
    //                 },
    //                 {
    //                     "id":4,
    //                     "cptName":"电商用户关注度分析",
    //                     "cptType":"0",
    //                     "busiType":"2",
    //                     "cptDesc":null,
    //                     "inDesc":null,
    //                     "outDesc":null,
    //                     "cfgDgm":"../img/3.jpg",
    //                     "showDgm":null,
    //                     "createTime":"2016-08-16 10:50:33"
    //                 },
    //                 {
    //                     "id":4,
    //                     "cptName":"电商用户关注度分析",
    //                     "cptType":"0",
    //                     "busiType":"2",
    //                     "cptDesc":null,
    //                     "inDesc":null,
    //                     "outDesc":null,
    //                     "cfgDgm":"../img/3.jpg",
    //                     "showDgm":null,
    //                     "createTime":"2016-08-16 10:50:33"
    //                 },{
    //                     "id":4,
    //                     "cptName":"电商用户关注度分析",
    //                     "cptType":"0",
    //                     "busiType":"2",
    //                     "cptDesc":null,
    //                     "inDesc":null,
    //                     "outDesc":null,
    //                     "cfgDgm":"../img/3.jpg",
    //                     "showDgm":null,
    //                     "createTime":"2016-08-16 10:50:33"
    //                 },{
    //                     "id":4,
    //                     "cptName":"电商用户关注度分析",
    //                     "cptType":"0",
    //                     "busiType":"2",
    //                     "cptDesc":null,
    //                     "inDesc":null,
    //                     "outDesc":null,
    //                     "cfgDgm":"../img/3.jpg",
    //                     "showDgm":null,
    //                     "createTime":"2016-08-16 10:50:33"
    //                 },
    //
    //             ]
    //         },
    //         {
    //             "name" : "电脑行业",
    //             "value" : "2",
    //             data : [
    //                 {
    //                     "id":4,
    //                     "cptName":"手机新品查询(监测)2",
    //                     "cptType":"0",
    //                     "busiType":"2",
    //                     "cptDesc":null,
    //                     "inDesc":null,
    //                     "outDesc":null,
    //                     "cfgDgm":"../img/1.jpg",
    //                     "showDgm":null,
    //                     "createTime":"2016-08-16 10:50:33"
    //                 },
    //                 {
    //                     "id":4,
    //                     "cptName":"新品查询声量分析2",
    //                     "cptType":"0",
    //                     "busiType":"2",
    //                     "cptDesc":null,
    //                     "inDesc":null,
    //                     "outDesc":null,
    //                     "cfgDgm":"../img/2.jpg",
    //                     "showDgm":null,
    //                     "createTime":"2016-08-16 10:50:33"
    //                 },
    //                 {
    //                     "id":4,
    //                     "cptName":"电商用户关注度分析2",
    //                     "cptType":"0",
    //                     "busiType":"2",
    //                     "cptDesc":null,
    //                     "inDesc":null,
    //                     "outDesc":null,
    //                     "cfgDgm":"../img/3.jpg",
    //                     "showDgm":null,
    //                     "createTime":"2016-08-16 10:50:33"
    //                 }
    //             ]
    //         }
    //         ]
    //     },
    //     {
    //         "name" : "新品分析2",
    //         "value" : "2",
    //         "data" :[{
    //             "name" : "奶粉行业",
    //             "value" : "2",
    //             data : [
    //                 {
    //                     "id":4,
    //                     "cptName":"手机新品查询(监测)",
    //                     "cptType":"0",
    //                     "busiType":"2",
    //                     "cptDesc":null,
    //                     "inDesc":null,
    //                     "outDesc":null,
    //                     "cfgDgm":"../img/1.jpg",
    //                     "showDgm":null,
    //                     "createTime":"2016-08-16 10:50:33"
    //                 },
    //                 {
    //                     "id":4,
    //                     "cptName":"新品查询声量分析",
    //                     "cptType":"0",
    //                     "busiType":"2",
    //                     "cptDesc":null,
    //                     "inDesc":null,
    //                     "outDesc":null,
    //                     "cfgDgm":"../img/2.jpg",
    //                     "showDgm":null,
    //                     "createTime":"2016-08-16 10:50:33"
    //                 },
    //                 {
    //                     "id":4,
    //                     "cptName":"电商用户关注度分析",
    //                     "cptType":"0",
    //                     "busiType":"2",
    //                     "cptDesc":null,
    //                     "inDesc":null,
    //                     "outDesc":null,
    //                     "cfgDgm":"../img/3.jpg",
    //                     "showDgm":null,
    //                     "createTime":"2016-08-16 10:50:33"
    //                 }
    //             ]
    //         },
    //             {
    //                 "name" : "金融行业",
    //                 "value" : "2",
    //                 data : [
    //                     {
    //                         "id":4,
    //                         "cptName":"手机新品查询(监测)",
    //                         "cptType":"0",
    //                         "busiType":"2",
    //                         "cptDesc":null,
    //                         "inDesc":null,
    //                         "outDesc":null,
    //                         "cfgDgm":"../img/1.jpg",
    //                         "showDgm":null,
    //                         "createTime":"2016-08-16 10:50:33"
    //                     },
    //                     {
    //                         "id":4,
    //                         "cptName":"新品查询声量分析",
    //                         "cptType":"0",
    //                         "busiType":"2",
    //                         "cptDesc":null,
    //                         "inDesc":null,
    //                         "outDesc":null,
    //                         "cfgDgm":"../img/2.jpg",
    //                         "showDgm":null,
    //                         "createTime":"2016-08-16 10:50:33"
    //                     },
    //                     {
    //                         "id":4,
    //                         "cptName":"电商用户关注度分析",
    //                         "cptType":"0",
    //                         "busiType":"2",
    //                         "cptDesc":null,
    //                         "inDesc":null,
    //                         "outDesc":null,
    //                         "cfgDgm":"../img/3.jpg",
    //                         "showDgm":null,
    //                         "createTime":"2016-08-16 10:50:33"
    //                     }
    //                 ]
    //             }
    //         ]
    //     }
    // ];
=======
    var componentList_data = [
        {
            "name" : "新品分析1",
            "value" : "2",
            "data" :[{
                "name" : "手机行业",
                "value" : "2",
                data : [
                    {
                        "id":4,
                        "cptName":"手机新品查询(监测)",
                        "cptType":"0",
                        "busiType":"2",
                        "cptDesc":null,
                        "inDesc":null,
                        "outDesc":null,
                        "cfgDgm":"../img/1.jpg",
                        "showDgm":null,
                        "createTime":"2016-08-16 10:50:33"
                    },
                    {
                        "id":4,
                        "cptName":"新品查询声量分析",
                        "cptType":"0",
                        "busiType":"2",
                        "cptDesc":null,
                        "inDesc":null,
                        "outDesc":null,
                        "cfgDgm":"../img/2.jpg",
                        "showDgm":null,
                        "createTime":"2016-08-16 10:50:33"
                    },
                    {
                        "id":4,
                        "cptName":"电商用户关注度分析",
                        "cptType":"0",
                        "busiType":"2",
                        "cptDesc":null,
                        "inDesc":null,
                        "outDesc":null,
                        "cfgDgm":"../img/3.jpg",
                        "showDgm":null,
                        "createTime":"2016-08-16 10:50:33"
                    },
                    {
                        "id":4,
                        "cptName":"电商用户关注度分析",
                        "cptType":"0",
                        "busiType":"2",
                        "cptDesc":null,
                        "inDesc":null,
                        "outDesc":null,
                        "cfgDgm":"../img/3.jpg",
                        "showDgm":null,
                        "createTime":"2016-08-16 10:50:33"
                    },{
                        "id":4,
                        "cptName":"电商用户关注度分析",
                        "cptType":"0",
                        "busiType":"2",
                        "cptDesc":null,
                        "inDesc":null,
                        "outDesc":null,
                        "cfgDgm":"../img/3.jpg",
                        "showDgm":null,
                        "createTime":"2016-08-16 10:50:33"
                    },{
                        "id":4,
                        "cptName":"电商用户关注度分析",
                        "cptType":"0",
                        "busiType":"2",
                        "cptDesc":null,
                        "inDesc":null,
                        "outDesc":null,
                        "cfgDgm":"../img/3.jpg",
                        "showDgm":null,
                        "createTime":"2016-08-16 10:50:33"
                    },

                ]
            },
            {
                "name" : "电脑行业",
                "value" : "2",
                data : [
                    {
                        "id":4,
                        "cptName":"手机新品查询(监测)2",
                        "cptType":"0",
                        "busiType":"2",
                        "cptDesc":null,
                        "inDesc":null,
                        "outDesc":null,
                        "cfgDgm":"../img/1.jpg",
                        "showDgm":null,
                        "createTime":"2016-08-16 10:50:33"
                    },
                    {
                        "id":4,
                        "cptName":"新品查询声量分析2",
                        "cptType":"0",
                        "busiType":"2",
                        "cptDesc":null,
                        "inDesc":null,
                        "outDesc":null,
                        "cfgDgm":"../img/2.jpg",
                        "showDgm":null,
                        "createTime":"2016-08-16 10:50:33"
                    },
                    {
                        "id":4,
                        "cptName":"电商用户关注度分析2",
                        "cptType":"0",
                        "busiType":"2",
                        "cptDesc":null,
                        "inDesc":null,
                        "outDesc":null,
                        "cfgDgm":"../img/3.jpg",
                        "showDgm":null,
                        "createTime":"2016-08-16 10:50:33"
                    }
                ]
            }
            ]
        },
        {
            "name" : "新品分析2",
            "value" : "2",
            "data" :[{
                "name" : "奶粉行业",
                "value" : "2",
                data : [
                    {
                        "id":4,
                        "cptName":"手机新品查询(监测)",
                        "cptType":"0",
                        "busiType":"2",
                        "cptDesc":null,
                        "inDesc":null,
                        "outDesc":null,
                        "cfgDgm":"../img/1.jpg",
                        "showDgm":null,
                        "createTime":"2016-08-16 10:50:33"
                    },
                    {
                        "id":4,
                        "cptName":"新品查询声量分析",
                        "cptType":"0",
                        "busiType":"2",
                        "cptDesc":null,
                        "inDesc":null,
                        "outDesc":null,
                        "cfgDgm":"../img/2.jpg",
                        "showDgm":null,
                        "createTime":"2016-08-16 10:50:33"
                    },
                    {
                        "id":4,
                        "cptName":"电商用户关注度分析",
                        "cptType":"0",
                        "busiType":"2",
                        "cptDesc":null,
                        "inDesc":null,
                        "outDesc":null,
                        "cfgDgm":"../img/3.jpg",
                        "showDgm":null,
                        "createTime":"2016-08-16 10:50:33"
                    }
                ]
            },
                {
                    "name" : "金融行业",
                    "value" : "2",
                    data : [
                        {
                            "id":4,
                            "cptName":"手机新品查询(监测)",
                            "cptType":"0",
                            "busiType":"2",
                            "cptDesc":null,
                            "inDesc":null,
                            "outDesc":null,
                            "cfgDgm":"../img/1.jpg",
                            "showDgm":null,
                            "createTime":"2016-08-16 10:50:33"
                        },
                        {
                            "id":4,
                            "cptName":"新品查询声量分析",
                            "cptType":"0",
                            "busiType":"2",
                            "cptDesc":null,
                            "inDesc":null,
                            "outDesc":null,
                            "cfgDgm":"../img/2.jpg",
                            "showDgm":null,
                            "createTime":"2016-08-16 10:50:33"
                        },
                        {
                            "id":4,
                            "cptName":"电商用户关注度分析",
                            "cptType":"0",
                            "busiType":"2",
                            "cptDesc":null,
                            "inDesc":null,
                            "outDesc":null,
                            "cfgDgm":"../img/3.jpg",
                            "showDgm":null,
                            "createTime":"2016-08-16 10:50:33"
                        }
                    ]
                }
            ]
        }
    ];
>>>>>>> 23016f9123aaf4a1d48f5064d474e528fb1c3cfd
    componentList = {
        getSceneListList : function (data) {
            for(var i=0;i<data.length;i++){
                $(".componentListTab").append("<li><a class='tab' index="+i+">"+data[i].name+"</a></li>");
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
                var industry_dom = "<div class='industry'><p>"+data[index].data[i].name+"</p></div>";
                $(".componentList").append(industry_dom);
                for(var j=0;j<data[index].data[i].data.length;j++){
                    var component_dom = "<div class='component'><a href='componentDetail.html?id="+data[index].data[i].data[j].id+"' target='mainIframe'><img src="+data[index].data[i].data[j].cfgDgm+"><span>"+data[index].data[i].data[j].cptName+"</span></a></div>";
                    $($(".industry")[i]).append(component_dom);
                }
            }
        },
<<<<<<< HEAD
        getComponentLibrary : function () {
            var that = this;
            $.ajaxJSON({
                name: '构件库',
                url: URL.GET_COMPONENT_BASE_LIST,
                success: function (r) {
                    var data = r.data.data;
                    that.getSceneListList(data);
                    that.getIndustryList(data,"0");
                }
            });
        },
=======
>>>>>>> 23016f9123aaf4a1d48f5064d474e528fb1c3cfd
        bindEvent : function () {
            var that = this;
            $(".tab").on("click",function () {
                var index = $(this).attr("index");
                $("a.tab").siblings().prevObject.removeClass("aSelected");
                $(this).addClass("aSelected");
                that.getIndustryList(componentList_data,index);
            });
            $(".component li").on("click",function () {
                var id = $(this).attr("componentId");
                //ajax
                $.post()

            })
        },
<<<<<<< HEAD
        init : function () {
            this.getComponentLibrary();
            this.bindEvent();
        }
    }.init();
=======
        init : function (data) {
            this.getSceneListList(data);
            this.getIndustryList(data,"0");
            this.bindEvent();
        }
    }.init(componentList_data);
>>>>>>> 23016f9123aaf4a1d48f5064d474e528fb1c3cfd

})(jQuery);