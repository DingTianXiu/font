/**
 * Created by dtx on 16/8/17.
 * description:
 */


//新品声量情感分析
var product_data = [{url:"../img/login1.png",name:"iphone",date:"2001"},{url:"222",name:"iphone",date:"2002"},{url:"333",name:"iphone",date:"2003"},{url:"333",name:"iphone",date:"2003"},{url:"333",name:"iphone",date:"2003"}]
var rousurce_data = [{url:"../img/login1.png",name:"iphone",date:"2001"},{url:"222",name:"iphone",date:"2002"}]
var styleList = [{url:"../img/login1.png",name:"iphone",date:"2001"},{url:"222",name:"iphone",date:"2002"},{url:"333",name:"iphone",date:"2003"},{url:"333",name:"iphone",date:"2003"},{url:"333",name:"iphone",date:"2003"},{url:"333",name:"iphone",date:"2003"},{url:"333",name:"iphone",date:"2003"}]
var generateBtn = function (event) {
    $(".editContainer").remove();
    $("#generateBtn").remove();
};
var e = $(".componentList");
var aa = $("#id").editComponent();
aa.addVolume_component();