(function($) {
    var WidgetPicker = function(element,options){
        this.init(element,options);
    };
    WidgetPicker.prototype = {
        constructor : WidgetPicker,
        init : function(element,options){
            this.$element = $(element);
            this.$tab = $("<div class='tab'></div>").appendTo(element);
            this.$tab.append("<h1>请选择构件</h1>");
            this.$content = $("<div class='content clearfix'></div>").appendTo(element);
            this._getAllComponent();

            if(options.onSelect){
                if(typeof options.onSelect == "function"){
                    this.onSelect = options.onSelect;
                }
            }
        },
        _getAllComponent : function(){
            var that = this;
            $.ajaxJSON({
                name: '获取基础构件库列表',
                url: URL.GET_COMPONENT_BASE_LIST,
                data: {},
                iframe: true,
                success: function (r) {
                    that._filterBaseData(r.data.data);
                    that._renderWidget();
                }
            });
        },
        _filterBaseData : function(data){
            var industry = [],
                industryList = [];
            for(var i = 0; i < data.length;i++){
                industry = data[i].data;
                for(var k = 0; k < industry.length;k++) {
                    industryList.push(industry[k]);
                }
            }
            this.data = industryList;
        },
        _renderWidget : function(){
            var that = this;
            var template = "",
                data = this.data;
            for(var i =0 ; i < data.length;i++) {
                template += "<a href='#' index='" + i + "'>" + data[i].typeName + "</a>";
            }
            this.$tab.append(template);
            $(".tab a").on("click",function(){
                $(this).addClass("active");
                $(this).siblings().removeClass("active");
                var index = $(this).attr("index");
                var components = data[index].data;
                var template2 = "";
                var zIndex = components.length;
                for(var j = 0; j < components.length;j++){
                    var item = components[j];
                    template2 += "<div class='widget' style='z-index:"+ (zIndex-j) +";' id='"+ item["id"] +"' type='"+ item["cptKey"] +"'><div class='inner'><img src='../img/1.jpg'/><h3>";
                    template2 += components[j]["cptName"] +"</h3><div class='description'><h4>构件描述：</h4><p>";
                    template2 += (item["cptDesc"]==null ? "无" : item["cptDesc"]) +"</p></div></div></div>";
                }
                that.$content.html(template2);
            });
            $(".tab a:eq(0)").trigger("click");
            $(".widget").on("click",function(){
                var type = $(this).attr("type");
                var id = $(this).attr("id");
                that.onSelect(type,id);
                that._close();
            });
        },
        _close : function(){
            this.$element.remove();
        },
        _getData : function(){
            return this.data;
        }

    };
    $.fn.widgetPicker = function(option, value) {
        var methodReturn;
        var $set = this.each(function() {
            var $this = $(this);
            var data = $this.data('widgetPicker');
            var options = typeof option === 'object' && option;
            if (!data) {
                $this.data('widgetPicker', (data = new WidgetPicker(this, options)));
            }
            if (typeof option === 'string') {
                methodReturn = data[option](value);
            }
        });
        return (methodReturn === undefined) ? $set : methodReturn;
    };
    $.fn.widgetPicker.constructor = WidgetPicker;
})(jQuery);
