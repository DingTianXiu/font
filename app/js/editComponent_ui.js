/**
 * Created by dtx on 16/8/23.
 */

(function ($) {
    var EditComponent = function (element,options,title) {
        var that = EditComponent.prototype;
        if(!options.step){
            options.step = 0;
        }
        that._init(element,title,options.step);
        return{
            addSelectProduct : EditComponent.prototype._addSelectProduct,
            addSelectResource : EditComponent.prototype._addSelectResource,
            addSelectTime : EditComponent.prototype._addSelectTime,
            addSelectStyle : EditComponent.prototype._addSelectStyle,
            addProductList : EditComponent.prototype._addProductList,
            addResourceList : EditComponent.prototype._addResourceList,
            addTab : EditComponent.prototype._addTab,
            addEcharts : EditComponent.prototype._addEcharts,
            addRelateComponent : EditComponent.prototype._addRelateComponent,
            addDelectedIco : EditComponent.prototype._addDelectedIco,
            addProduct : EditComponent.prototype._addProduct,
            addTips : EditComponent.prototype. _addTips
        }
    };
    EditComponent.prototype = {
        Constructor : EditComponent,

        _init : function (element,name,step) {
            this._addEditContainer(element,name,step);
        },

        _addEditContainer : function (element,name,step) {
            if(step == 0){
                if($(".optionContainer").length==0){
                    var dom = "<div class='editContainer'>" +
                        "<div class='titleContainer'>" +
                        "<span class='componentName'>"+name+"</span>" +
                        "<div class='rightContainer'>" +
                        "<div class='dateBox_in'></div>" +
                        "<a class='set'>&#xe612;</a>" +
                        "</div>"+
                        "</div>"+
                        "<div class='optionContainer'>" + "</div>" +
                        "<div class='generateBtn'><button>生成对比</button></div>" +
                        "</div>";
                    $(element).append(dom);
                }
            }else{
                var dom = "<div class='editContainer'>" +
                    "<div class='titleContainer'>" +
                    "<span class='componentName'>"+name+"</span>" +
                    "<div class='rightContainer'>" +
                    "<div class='dateBox'></div>" +
                    "<a class='set'>&#xe612;</a>" +
                    "</div>"+
                    "</div>"+
                    "</div>";
                $(element).append(dom);
            }
        },

        _addSelectProduct : function () {
            if($(".selectProduct").length == 0){
                var dom = "<ul class='selectProduct'>" +
                    "<li>选择目标产品:</li>" +
                    "<li>" +
                    "<select class='select brand'>" +
                    "<option>选择品牌</option>" +
                    "</select>" +
                    "</li>" +
                    "<li>" +
                    "<select class='select model'>" +
                    "<option>选择型号</option>" +
                    "</select>" +
                    "</li>" +
                    "<li><button id='addProductBtn' class='addBtn'>&#xe602;</button></li>" +
                    "</ul>";
                $(".optionContainer").append(dom);
            }
        },

        _addProductList : function(product_data){
            if($(".productList").length){
                $(".productList").remove();
            }
            if(product_data.length>0){
                $(".selectProduct").after("<ul class='productList selectedList clearfix'>" + "</ul>");
                $.each(product_data,function (i) {
                    var productList_dom = "<li index='"+i+"'>" +
                        "<span>"+"<img"+" "+"src="+product_data[i].picUrl+">"+"</span>" +
                        "<span>" +
                        "<p>"+product_data[i].modelName+"</p>" +
                        "<p>"+product_data[i].releaseDate+"</p>" +
                        "</span>" +
                        "<span class='deleteBtn deleteProductBtn'>&#xe604;</span>" +
                        "</li>";
                    $(".productList").append(productList_dom);
                });
            }
        },

        _addSelectResource : function () {
            if($(".selectResource").length == 0){
                var dom = "<ul class='selectResource'>" +
                    "<li>选择信息来源:</li>" +
                    "<li>" +
                    "<select class='select' id='resource'>" +
                    "<option>信息来源</option>" +
                    "</select>" +
                    "</li>" +
                    "<li><button id='addResourceBtn' class='addBtn'>&#xe602;</button></li>" +
                    "</ul>"
                $(".optionContainer").append(dom);
            }
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
                        "<p id='resourceName'>"+resource_data[i].srcName+"</p>" +
                        "</span>" +
                        "<span class='deleteBtn deleteResourceBtn''>&#xe604;</span>" +
                        "</li>";
                    $(".resourceList").append(resourceList_dom);
                })
            }
        },

        _addSelectTime : function () {
            if($(".addTime").length == 0){
                var dom = "<div class='sliderBox'><span>设置监测时间范围</span><div id='addTime'></div></div>"
                $(".optionContainer").append(dom);
            }
        },

        _addSelectStyle : function (styleList_data) {
            if($(".styleListContainer").length == 0){
                var dom = "<div class='styleListContainer clearfix'>" +
                    "<p>选择可视化样式:</p>"+
                    "<ul class='styleList clearfix'></ul>"+
                    "</div>";
                $(".optionContainer").append(dom);
                $.each(styleList_data,function (i) {
                    var styleList_dom = "<li>"+"<img id="+styleList_data.cptStyId+" class='styleImg' "+"src="+styleList_data[i].url+"><span>折线图</span>"+"</li>";
                    $(".styleList").append(styleList_dom);
                });
            }
        },

        _addTab : function (ele,data) {
            if($(".optionContainer").length>0){
                $(".optionContainer").remove();
                $(".generateBtn").remove();
            }
            var editContainer_dom =  $(ele).find($(".titleContainer"));
            var dom = "<div class='tabContainer'><ul class='tab'></ul><div class='addShowBtnContainer'><button class='addShow'>&#xe602;</button></div><button class='delShow'>&#xe615;</button><div class='timeSelect'><button>按时查看</button><button class='btnSelected'>按日查看</button></div></div>"
            $(editContainer_dom).after(dom);
            $.each(data,function (i) {
                var tabUl_dom = $(ele).find($(".tab"));
                var tab_dom = "<li index="+i+" class='phoneModel'><span class='phoneName'>"+data[i].modelName+"</span></li>";
                $(tabUl_dom).append(tab_dom);
            })
        },

        _addDelectedIco :function (ele) {
            if($(ele).find($(".deleteBtn")).length==0){
                var dom = "<span class='deleteBtn'>&#xe614;</span>";
                $(ele).find($(".phoneModel")).append(dom);
            }else{
                $($(ele).find($(".deleteBtn"))).remove();
            }
        },

        _addEcharts : function (ele,id) {
            var dom = "<div class='echartsContainer' id="+"echarts"+id+" style='height:350px'></div>";
            var editContainer_dom = $(ele).find(".tabContainer");
            $(editContainer_dom).after(dom);
        },

        _addTips : function (ele,data) {
            var dom_tipsContainer = "<ul class='tipsContainer'><li>"+data.focusWord+"</li></ul>";
            $(ele).find(".echartsContainer").append(dom_tipsContainer);
            $.each(data.srcList,function (i) {
                var dom_tip = "<li>"+data.srcList[i].srcName+":"+data.srcList[i].volumn+"</li>"
                $(ele).find(".tipsContainer").append(dom_tip);
            })
        },

        _addRelateComponent : function (ele,data) {
            var editContainer_dom = $(ele).find($(".editContainer"));
            var echartsContainer_dom = $(ele).find($(".echartsContainer"));
            var dom = "<div class='relateCompanentContainer'><span>关联构建:</span><ul class='relateCompanentList'></ul></div>";
            $(echartsContainer_dom).after(dom);
            $.each(data,function (i) {
                var relateComponentList_dom = "<li class='creatRelateComponentBtn' type="+data[i].baseCptKey+" baseCptId="+data[i].baseCptId+">"+data[i].baseCptName+"</li>";
                var relateComponent_dom = $(editContainer_dom).find($(".relateCompanentList"));
                $(relateComponent_dom).append(relateComponentList_dom);
            });
        },

        _addProduct : function (element) {
            if($(element).find(".selectProduct_updata").length==0) {
                var dom = "<ul class='selectProduct_updata'>" +
                    "<li>选择目标产品:</li>" +
                    "<li>" +
                    "<select class='select brand'>" +
                    "<option>选择品牌</option>" +
                    "</select>" +
                    "</li>" +
                    "<li>" +
                    "<select class='select model'>" +
                    "<option>选择型号</option>" +
                    "</select>" +
                    "</li>" +
                    "<li><button class='addBtn_updata'>&#xe602;</button></li>" +
                    "</ul>";
                $(element).find(".addShowBtnContainer").append(dom)
            }
        }

    };
    $.fn.editComponent = EditComponent;
})(jQuery);