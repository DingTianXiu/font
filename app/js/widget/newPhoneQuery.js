(function($) {
    var NewPhoneQuery = function(element,options){
        this.step = options.step;
        this.data = {
            "title" : "手机新品发布监测",
            "condition" : {
                "baseCptId" : options.baseCptId,
                "moduleId" : options.moduleId,
                "searchDateScope" : {
                    "beforeDateNum": options.beforeDateNum ? options.beforeDateNum : 28,
                    "afterDateNum": options.afterDateNum ? options.afterDateNum : 30
                }
            },
            "result" : {},
            "related" : []
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
                this._getData(this.data.condition.baseCptId);
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
                values: [that.data.condition.searchDateScope["beforeDateNum"]*-1 , that.data.condition.searchDateScope["afterDateNum"] ],
                slide: function( event, ui ) {
                    that.data.condition.searchDateScope["beforeDateNum"] = ui.values[ 0 ];
                    that.data.condition.searchDateScope["afterDateNum"] = ui.values[ 1 ];
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
            var that = this;
            $.ajaxJSON({
                name: '新增构件实例',
                url: URL.CREATE_CPTINST,
                data: JSON.stringify(params),
                iframe:true,
                contentType : 'application/json; charset=UTF-8',
                success: function (r) {
                    that._getData(r.data.cptInstId);
                }
            });
        },
        _renderResult : function(){
            var source = $("#newPhoneQuery1").html();
            var template = Handlebars.compile(source);
            var html = template(this.data);
            this.$element.html(html);
            this._initSlider($(".sliderBox"));

        },
        _getData : function(id){
            var that = this;
            $.ajaxJSON({
                name : '获取构件实例数据',
                url :URL.GET_CPTINST_DATA,
                data : {cptInstId : id},
                success : function(r){
                    that.data.result = r.data;
                    $.ajaxJSON({
                        name: '获取构件的关联构件',
                        url: URL.GET_REL_CPT,
                        data: {baseCptId:that.condition.baseCptId},
                        success: function (r) {
                            that.data.related = r.data;
                            that._renderResult();
                            that._onComplete(this.data);
                        }
                    });
                }
            });
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
            this.data.related = [{
                "key" : "",
                "name": "新品声量（监测）对比构件"
            },{
                "key" : "",
                "name": "新品发布声量情感分析构件"
            }];
            that._renderResult();
            that._onComplete(this.data);
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

