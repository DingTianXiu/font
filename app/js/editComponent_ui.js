/**
 * Created by dtx on 16/8/18.
 * var aa = $(".demo").widget(element,{});
 * aa.getData();
 */

(function ($) {
    var EditComponent = function (element,options) {
        this.$element = $(element);
        this.$element.append("<div>111</div>");
        return{
            addVolume_component : EditComponent.prototype._addVolume_component,
            addEditContainer : EditComponent.prototype._addEditContainer,
            addSelectProduct : EditComponent.prototype._addSelectProduct,
            addSelectResource : EditComponent.prototype._addSelectResource,
            addTime : EditComponent.prototype._addTime,
            addSelectStyle : EditComponent.prototype._addSelectStyle
        }
    };
    EditComponent.prototype = {

        Constructor : EditComponent,
        /*添加新构建start*/
        _addEditContainer : function () {
            var dom = "<div class='editContainer'>" +
                "<span>"+"新品声量情感分析"+"</span>" +
                "<a class=''>&#xe60b;</a>" +
                "<div class='optionContainer'>" + "</div>" +
                "</div>";
            var generate_dom = "<div class='generateBtn' onclick='generateBtn(event)'><button>生成对比</button></div>";
            $(".componentList").append(dom);
            $(".editContainer").after(generate_dom);
        },
        /*添加新构建end*/

        /*选择产品start*/
        _addSelectProduct : function () {
            var dom = "<ul class='selectProduct'>" +
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
            $(".optionContainer").append(dom);
            if(product_data){
                $(".selectProduct").after("<ul class='productList selectedList clearfix'>" + "</ul>");
                $.each(product_data,function (i) {
                    var productList_dom = "<li>" +
                        "<span>"+"<img"+" "+"src="+product_data[i].url+">"+"</span>" +
                        "<span>" +
                        "<p>"+product_data[i].name+"</p>" +
                        "<p>"+product_data[i].date+"</p>" +
                        "</span>" +
                        "<span class='deleteBtn' onclick='deleteProductBtn(event)'>&#xe611;</span>" +
                        "</li>";
                    $(".productList").append(productList_dom);
                });

                //动态控制ul宽度
                var width = $(".optionContainer").css("width").substr(0,4);
                var setWidth = width-(width%393);
                var liCount = setWidth/393;
                if(width>1000){
                    $(".optionContainer").css("width",width);
                    if(liCount<=product_data.length){
                        $(".productList").css("maxWidth",setWidth);
                    }else{
                        $(".productList").css("maxWidth",product_data.length*393);
                    }
                }else{
                    $(".optionContainer").css("width",900);
                    $(".productList").css("maxWidth",786).css("overflow",scroll);
                }
            }
        },
        _deleteProductBtn : function (event) {
            product_data.splice($(event.path[1]).index(),1);
            $(".productList").remove();
            if(product_data.length>0){
                $(".selectProduct").after("<ul class='selectedList'>" + "</ul>");
                $.each(product_data,function (i) {
                    var productList_dom = "<li>" +
                        "<span>"+"<img"+" "+"src="+product_data[i].url+">"+"</span>" +
                        "<span>" +
                        "<p>"+product_data[i].name+"</p>" +
                        "<p>"+product_data[i].date+"</p>" +
                        "</span>" +
                        "<span class='deleteBtn' "+"onclick='deleteProductBtn(event)'>&#xe611;</span>" +
                        "</li>";
                    $(".productList").append(productList_dom);
                })
            }else{
                $(".productList").remove();
            }
        },
        _addProductBtn : function (event) {
            if(!product_data){
                var product_data = [];
            }

        },
        /*选择产品end*/


        /*选择信息来源start*/
        _addSelectResource : function () {
            var dom = "<ul class='selectResource'>" +
                "<li>选择信息来源:</li>" +
                "<li>" +
                "<select class='select' id='resource'>" +
                "<option>信息来源</option>" +
                "</select>" +
                "</li>" +
                "<li><button  class='addBtn'>&#xe60f;</button></li>" +
                "</ul>"
            $(".optionContainer").append(dom);
            if(rousurce_data.length>0){
                $(".selectResource").after("<ul class='resourceList selectedList clearfix'>" + "</ul>");
                $.each(rousurce_data,function (i) {
                    var resourceList_dom = "<li>" +
                        "<span>"+"<img"+" "+"src="+rousurce_data[i].url+">"+"</span>" +
                        "<span>" +
                        "<p id='resourceName'>"+rousurce_data[i].name+"</p>" +
                        "</span>" +
                        "<span class='deleteBtn' onclick='deleteResourceBtn(event)'>&#xe611;</span>" +
                        "</li>";
                    $(".resourceList").append(resourceList_dom);
                })
                //动态控制ul宽度
                var width = $(".optionContainer").css("width").substr(0,4);
                var setWidth = width-(width%393);
                var liCount = setWidth/393;
                if(width>1000){
                    $(".optionContainer").css("width",width);
                    if(liCount<=rousurce_data.length){
                        $(".resourceList").css("maxWidth",setWidth);
                    }else{
                        $(".resourceList").css("maxWidth",rousurce_data.length*393);
                    }
                }else{
                    $(".optionContainer").css("width",900);
                    $(".resourceList").css("maxWidth",786).css("overflow",scroll);
                }
            }
        },
        _deleteResourceBtn : function (event) {
            rousurce_data.splice($(event.path[1]).index(), 1);
            $(".resourceList").remove();
            if (rousurce_data) {
                $(".selectResource").after("<ul id='resourceList' class='selectedList'>" + "</ul>");
                $.each(rousurce_data, function (i) {
                    var resourceList_dom = "<li>" +
                        "<span>" + "<img" + " " + "src=" + rousurce_data[i].url + ">" + "</span>" +
                        "<span>" +
                        "<p id='resourceName'>" + rousurce_data[i].name + "</p>" +
                        "</span>" +
                        "<span class='deleteBtn' onclick='deleteResourceBtn(event)'>&.xe611;</span>" +
                        "</li>";
                    $(".resourceList").append(resourceList_dom);
                })
            }
        },
        /*选择信息来源end*/


        _addTime : function () {
            var dom = "<div id='addTime'></div>"
            $(".optionContainer").append(dom);
        },

        _addSelectStyle : function () {
            var dom = "<div class='styleListContainer'>" +
                "<p>选择可视化样式:</p>"+
                "<ul class='styleList clearfix'></ul>"+
                "</div>";
            $(".optionContainer").append(dom);
            $.each(styleList,function (i) {
                var styleList_dom = "<li>"+"<img onclick='selectStyleBtn(event)'"+" "+"src="+styleList[i].url+">"+"</li>";
                $(".styleList").append(styleList_dom);
            });
            //动态控制ul宽度
            var width = $(".optionContainer").css("width").substr(0,4);
            var setWidth = width-(width%393);
            $(".styleList").css("maxWidth",setWidth);
        },
        _selectStyleBtn : function (event) {

        },

        _addVolume_component : function (componentName,selectedId) {
            if(!$('.editContainer').length){
                this.addEditContainer(componentName, selectedId);
                this.addSelectProduct();
                this.addSelectResource();
                this.addTime();
                this.addSelectStyle();
            }
        }
    };
    $.fn.editComponent = EditComponent;
})(window.jQuery);