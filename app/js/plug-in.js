/**
 * Created by dtx on 16/8/17.
 * description:
 * 增加新组件条件
 * 1.addEditContainer append编辑容器
 * 2.addSelectProduct append选择目标产品
 * 3.addSelectResource append选择信息来源
 * 4.addTime append选择时间范围
 * 5.addSelectStyle append选择可视化样式
 */

/*添加新构建start*/
var addEditContainer = function (componentName,selectedId) {
    var dom = "<div id='editContainer'>" +
        "<span>"+componentName+"</span>" +
        "<a class='iconfont'>&#xe60b;</a>" +
        "<div id='optionContainer'>" + "</div>" +
        "</div>";
    var generate_dom = "<div id='generateBtn' onclick='generateBtn(event)'><button>生成对比</button></div>"
    if(selectedId){
        $("#"+selectedId).after(dom);
        $("#editContainer").after(generate_dom);
    }else {
        $(".componentList").append(dom);
        $("#editContainer").after(generate_dom);
    }
};
/*添加新构建end*/

/*选择产品start*/
var addSelectProduct = function () {
    var dom = "<ul id='selectProduct'>" +
                "<li>选择目标产品:</li>" +
                "<li>" +
                    "<select class='select' id='brand'>" +
                        "<option>选择品牌</option>" +
                    "</select>" +
                "</li>" +
                "<li>" +
                    "<select class='select' id='model'>" +
                        "<option>选择型号</option>" +
                    "</select>" +
                "</li>" +
                "<li><button class='addBtn'>&#xe60f;</button></li>" +
            "</ul>";
    $("#optionContainer").append(dom);
    if(product_data){
        $("#selectProduct").after("<ul id='productList' class='selectedList'>" + "</ul>");
        $.each(product_data,function (i) {
            var productList_dom = "<li>" +
                    "<span>"+"<img"+" "+"src="+product_data[i].url+">"+"</span>" +
                    "<span>" +
                        "<p>"+product_data[i].name+"</p>" +
                        "<p>"+product_data[i].date+"</p>" +
                    "</span>" +
                    "<span class='deleteBtn' onclick='deleteProductBtn(event)'>&#xe611;</span>" +
                "</li>";
            $("#productList").append(productList_dom);
        })
    }
};
var deleteProductBtn = function (event) {
    product_data.splice($(event.path[1]).index(),1);
    $("#productList").remove();
    if(product_data.length>0){
        $("#selectProduct").after("<ul id='productList' class='selectedList'>" + "</ul>");
        $.each(product_data,function (i) {
            var productList_dom = "<li>" +
                "<span>"+"<img"+" "+"src="+product_data[i].url+">"+"</span>" +
                "<span>" +
                "<p>"+product_data[i].name+"</p>" +
                "<p>"+product_data[i].date+"</p>" +
                "</span>" +
                "<span class='deleteBtn' "+"onclick='deleteProductBtn(event)'>&#xe611;</span>" +
                "</li>";
            $("#productList").append(productList_dom);
        })
    }else{
        $("#productList").remove();
    }
};
var addProductBtn = function (event) {
    if(!product_data){
        var product_data = [];
    }

};
/*选择产品end*/


/*选择信息来源start*/
var addSelectResource = function () {
    var dom = "<ul id='selectResource'>" +
            "<li>选择信息来源:</li>" +
            "<li>" +
                "<select class='select' id='resource'>" +
                    "<option>信息来源</option>" +
                "</select>" +
            "</li>" +
            "<li><button  class='addBtn'>&#xe60f;</button></li>" +
        "</ul>"
    $("#optionContainer").append(dom);
    if(rousurce_data.length>0){
        $("#selectResource").after("<ul id='resourceList' class='selectedList'>" + "</ul>");
        $.each(rousurce_data,function (i) {
            var resourceList_dom = "<li>" +
                "<span>"+"<img"+" "+"src="+rousurce_data[i].url+">"+"</span>" +
                "<span>" +
                "<p id='resourceName'>"+rousurce_data[i].name+"</p>" +
                "</span>" +
                "<span class='deleteBtn' onclick='deleteResourceBtn(event)'>&#xe611;</span>" +
                "</li>";
            $("#resourceList").append(resourceList_dom);
        })
    }
};
var deleteResourceBtn = function (event) {
    rousurce_data.splice($(event.path[1]).index(), 1);
    $("#resourceList").remove();
    if (rousurce_data) {
        $("#selectResource").after("<ul id='resourceList' class='selectedList'>" + "</ul>");
        $.each(rousurce_data, function (i) {
            var resourceList_dom = "<li>" +
                "<span>" + "<img" + " " + "src=" + rousurce_data[i].url + ">" + "</span>" +
                "<span>" +
                "<p id='resourceName'>" + rousurce_data[i].name + "</p>" +
                "</span>" +
                "<span class='deleteBtn' onclick='deleteResourceBtn(event)'>&#xe611;</span>" +
                "</li>";
            $("#resourceList").append(resourceList_dom);
        })
    }
};
/*选择信息来源end*/


var addTime = function () {
    var dom = "<div id='addTime'></div>"
    $("#optionContainer").append(dom);
};

var addSelectStyle = function () {
    var dom = "<div id='styleListContainer'>" +
            "<p>选择可视化样式:</p>"+
            "<ul id='styleList'></ul>"+
        "</div>";
    $("#optionContainer").append(dom);
    $.each(styleList,function (i) {
        var styleList_dom = "<li>"+"<img onclick='selectStyleBtn(event)'"+" "+"src="+styleList[i].url+">"+"</li>";
        $("#styleList").append(styleList_dom);
    })
};
var selectStyleBtn = function (event) {

};


//新品声量情感分析
var product_data = [{url:"../img/login1.png",name:"iphone",date:"2001"},{url:"222",name:"iphone",date:"2002"},{url:"333",name:"iphone",date:"2003"},{url:"333",name:"iphone",date:"2003"},{url:"333",name:"iphone",date:"2003"}]
var rousurce_data = [{url:"../img/login1.png",name:"iphone",date:"2001"},{url:"222",name:"iphone",date:"2002"},{url:"333",name:"iphone",date:"2003"}]
var addVolume_component = function (componentName,selectedId) {
    addEditContainer(componentName,selectedId);
    addSelectProduct();
    addSelectResource();
    addTime();
    addSelectStyle();
};
$(".addModuleBtn").click(function () {
    if(!$('#editContainer').length){
        var componentName = "新品声量情感分析";
        var selectedId = "id";
        addVolume_component(componentName,selectedId);
    }
});
var generateBtn = function (event) {
    $("#editContainer").remove();
    $("#generateBtn").remove();
};


