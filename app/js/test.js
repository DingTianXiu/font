/**
 * Created by dtx on 16/9/8.
 */

(function ($) {
    var options = {
            "name" : "手机新品声量情感分析",
            "step" : 0,
            "baseCptId" : 3,
            "moduleId" : 17,
            "compareDateScope" : {
                "beforeDateNum" : 20,
                "afterDateNum" : 29
            },
            "data" : {
                "product_data" : [{"id":1,"brandName":"锤子","modelName":"TTTT","picUrl":"../img/5.jpg","releaseDate":"2016-10-28"},{"id":2,"brandName":"三星","modelName":"TTTT","picUrl":"../img/5.jpg","releaseDate":"2016-10-28"},{"id":3,"brandName":"苹果","modelName":"TTTT","picUrl":"../img/5.jpg","releaseDate":"2016-10-28"}],
                "resource_data" : [{"srcName":"新闻","srcKey":"news"},{"srcName":"论坛","srcKey":"bbs"}],
                "styleList_data" : [{"url":"../img/2.jpg","cptStyId":1},{"url":"../img/2.jpg","cptStyId":2}]
            }
        };
    $("#btn").on("click",function () {
        var ele = $("#div");
        ele.newAffectionAnalysed(ele,options);
    });

    $.ajaxJSON({
        name : "信息来源",
        url: URL.GET_SOURCE_DATA,
        data: {},
        type : 'post',
        iframe : true,
        success: function (i) {
            console.log(i);
            // if(i.data){
            //     _this.data.brands = i.data.brands;
            //     //_this._getData();
            //     _this._sourceInfo();
            // }
            //},
            //error: function(){
            //	alert('系统错误')
        }
    })


})(jQuery);