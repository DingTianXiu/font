/**
 * Created by dtx on 16/8/25.
 */

(function ($) {
    var NewAffectionAnalysed = function (element,options) {
        var that  = NewAffectionAnalysed.prototype;
        if(options && options.step){
            that.step = options.step;
        }else{
            that.step = 0;
        }
        that.$element = $(element);
        that._init(that.$element,options);
    };
    NewAffectionAnalysed.prototype = {
        Constructor : NewAffectionAnalysed,

        _createComponentEdit : function (element, options) {
            var addComponent = element.editComponent(element, options);
            addComponent.addSelectProduct();
            addComponent.addSelectResource();
            addComponent.addSelectTime();
            if(typeof options == "object" && options.data){
                if(options.data.product_data){
                    addComponent.addProductList(options.data.product_data);
                }
                if(options.data.resource_data){
                    addComponent.addResourceList(options.data.resource_data);
                }
                if(options.data.styleList_data){
                    addComponent.addSelectStyle(options.data.styleList_data);
                }
            }
            return addComponent
        },
        _createComponent : function (element, options) {

        },

        _bindEvent : function (editor,options) {
            var that = this;
            $(".deleteProductBtn").on("click",function () {
                var index = $(this).parents("li").attr("index");
                options.data.product_data.splice(index,1);
                editor.addProductList(options.data.product_data);
                that._bindEvent(editor,options);
            });
            $(".deleteResourceBtn").on("click",function () {
                var index = $(this).parents("li").attr("index");
                options.data.resource_data.splice(index,1);
                editor.addResourceList(options.data.resource_data);
                that._bindEvent(editor,options);
            })
            $(".styleImg").on("click",function () {
                $(this).parents("li").addClass("selectStyle");
                $(this).parents("li").siblings().removeClass("selectStyle");
            })
        },

        _init : function (element, options) {
            if(this.step==0){
                var editor= this._createComponentEdit(element, options);
            }else{
                this._createComponent(element, options);
            }
            this._bindEvent(editor, options);
        }
    };

    $.fn.newAffectionAnalysed = NewAffectionAnalysed;
})(jQuery);