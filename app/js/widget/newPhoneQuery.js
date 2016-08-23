(function($) {
    var NewPhoneQuery = function(element,options){
        this.step = options.step;
        this.data = {
            "title" : "手机新品发布监测",
            "condition" : {
                //"baseCptId" : options.baseCptId,
                //"moduleId" : options.moduleId,
                "beforeDateNum" : 28,
                "afterDateNum" : 30
            },
            "result" : {},
            "related" : [{
                name:"新品声量对比",
                key : "newProductCompare"
            },{
                name:"新品声量情感分析",
                key : "newProductCompare"
            }]
        };

        this.$element = $(element);
        if(options.onComplete){
            if(typeof options.onComplete == "function"){
                this._onComplete = options.onComplete;
            }
        }
        this._init(element,options);
    };
    NewPhoneQuery.prototype = {
        constructor : NewPhoneQuery,
        _init : function(element,options){
            if(this.step == 0){
                this._renderCondition();
            }else{
                this._renderResult();
            }
            this._bindEvent();
        },
        _bindEvent : function(){
           $(".configBtn").on("click",function(){
             //设置构件同步关系
               that._initConfigSync();
           });
        },
        _initConfigSync:function(){},
        _initSlider : function($ele){
            var that = this;
            $ele.slider({
                range: true,
                min: -90,
                max: 30,
                values: [that.data.condition["beforeDateNum"]*-1 , that.data.condition["afterDateNum"] ],
                slide: function( event, ui ) {
                    that.data.condition["beforeDateNum"] = ui.values[ 0 ];
                    that.data.condition["afterDateNum"] = ui.values[ 1 ];
                }
            });
        },
        _renderCondition : function(){
            var that = this;
            var source = $("#newPhoneQuery0").html();
            var template = Handlebars.compile(source);
            var html = template(this.data);
            this.$element.html(html);
            this._initSlider($(".sliderBox"));
            $(".nextStep").on("click",function(){
                that._createWidget();
            });

        },
        _createWidget : function(){
            var params = this.data.condition;
            //新增构件实例
            //获取构件实例属性
            //获取构件实例数据
            this.data.result = {
                "released" : [{
                    id:123,
                    brandName : "三星 - GALAXY S7",
                    modelName : "",
                    releaseDate : "2016-08-01",
                    picUrl : "5.jpg",
                    otherAttr : [{name:"",value:""}],

                }],
                "releasing":[{
                    id:123,
                    brandName : "Apple（苹果） - iPhone 6s",
                    modelName : "",
                    releaseDate : "2016-11-01",
                    picUrl : "5.jpg",
                    otherAttr : [{name:"",value:""}],

                }]
            };
            this._renderResult();
            this._onComplete(this.data);
        },
        _renderResult : function(){
            var source = $("#newPhoneQuery1").html();
            var template = Handlebars.compile(source);
            var html = template(this.data);
            this.$element.html(html);
            this._initSlider($(".sliderBox"));

        },
        _getData : function(){
            //ajax
            this._renderResult();
        },
        _close : function(){
            this.$element.remove();
        }
    };
    $.fn.newPhoneQuery = function(option, value) {
        var methodReturn;
        var $set = this.each(function() {
            var $this = $(this);
            var data = $this.data('newPhoneQuery');
            var options = typeof option === 'object' && option;
            if (!data) {
                $this.data('newPhoneQuery', (data = new NewPhoneQuery(this, options)));
            }
            if (typeof option === 'string') {
                methodReturn = data[option](value);
            }
        });
        return (methodReturn === undefined) ? $set : methodReturn;
    };
    $.fn.newPhoneQuery.Constructor = NewPhoneQuery;
})(jQuery);

