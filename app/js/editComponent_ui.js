/**
 * Created by dtx on 16/8/23.
 */

(function ($) {
    var EditComponent = function (element,options) {
        var that = EditComponent.prototype;
        that.$element = $(element);
        if(options && typeof options == "string"){
            that.name = options;
        }else{
            that.name = options.name;
        }
        if(options && options.data){
            that.data = options.data;
        }
        that._init(that.$element,that.name);
        return{
            addSelectProduct : EditComponent.prototype._addSelectProduct,
            addSelectResource : EditComponent.prototype._addSelectResource,
            addSelectTime : EditComponent.prototype._addSelectTime,
            addSelectStyle : EditComponent.prototype._addSelectStyle,
            addProductList : EditComponent.prototype._addProductList,
            addResourceList : EditComponent.prototype._addResourceList
        }
    };
    EditComponent.prototype = {
        Constructor : EditComponent,

        _init : function (element,name) {
            this._addEditContainer(element,name);
        },

        _addEditContainer : function (element,name) {
            var dom = "<div class='editContainer'>" +
                "<span>"+name+"</span>" +
                "<a class=''>&#xe60b;</a>" +
                "<div class='optionContainer'>" + "</div>" +
                "</div>";
            var generate_dom = "<div class='generateBtn'><button>生成对比</button></div>";
            $(element).append(dom);
            $(".editContainer").after(generate_dom);
        },

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
        },

        _addProductList : function(product_data){
            if($(".productList").length>=0){
                $(".productList").remove();
            }
            if(product_data.length>0){
                $(".selectProduct").after("<ul class='productList selectedList clearfix'>" + "</ul>");
                $.each(product_data,function (i) {
                    var productList_dom = "<li index='"+i+"'>" +
                        "<span>"+"<img"+" "+"src="+product_data[i].url+">"+"</span>" +
                        "<span>" +
                        "<p>"+product_data[i].name+"</p>" +
                        "<p>"+product_data[i].date+"</p>" +
                        "</span>" +
                        "<span class='deleteBtn deleteProductBtn'>&#xe611;</span>" +
                        "</li>";
                    $(".productList").append(productList_dom);
                });
            }
        },

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
        },

        _addResourceList : function(resource_data){
            if($(".resourceList").length>=0){
                $(".resourceList").remove();
            }
            if(resource_data.length>0){
                $(".selectResource").after("<ul class='resourceList selectedList clearfix'>" + "</ul>");
                $.each(resource_data,function (i) {
                    var resourceList_dom = "<li index='"+i+"'>" +
                        "<span>"+"<img"+" "+"src="+resource_data[i].url+">"+"</span>" +
                        "<span>" +
                        "<p id='resourceName'>"+resource_data[i].name+"</p>" +
                        "</span>" +
                        "<span class='deleteBtn deleteResourceBtn''>&#xe611;</span>" +
                        "</li>";
                    $(".resourceList").append(resourceList_dom);
                })
            }
        },

        _addSelectTime : function () {
            var dom = "<div id='addTime'></div>"
            $(".optionContainer").append(dom);
        },

        _addSelectStyle : function (styleList_data) {
            var dom = "<div class='styleListContainer clearfix'>" +
                "<p>选择可视化样式:</p>"+
                "<ul class='styleList clearfix'></ul>"+
                "</div>";
            $(".optionContainer").append(dom);
            $.each(styleList_data,function (i) {
                var styleList_dom = "<li>"+"<img class='styleImg' "+"src="+styleList_data[i].url+">"+"</li>";
                $(".styleList").append(styleList_dom);
            });
        },


    };
    $.fn.editComponent = EditComponent;
})(jQuery);