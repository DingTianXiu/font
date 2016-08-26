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
<<<<<<< HEAD
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
                template += "<a href='#' index='" + i + "'>" + data[i].name + "</a>";
=======
            //ajax
            var data = [{
                name: "通用",
                components: [{
                    name: "手机新品查询(监测)",
                    type: "newPhoneQuery",
                    description:"实时监测指定时间段内市场上即将发布或已发布的新品手机。罗列出该机型的发布时间、厂商、参数等详细信息。",
                    thumbnail : "1.jpg"
                }, {
                    name: "手机新品声量监测(对比)",
                    type: "",
                    description:"123",
                    thumbnail : "2.jpg"
                }]
            },{
                name : "汽车",
                components : [{
                    name : "1",
                    type : "2",
                    description:"123",
                    thumbnail : "3.jpg"
                }]
            },{
                name : "手机",
                components : [{
                    name : "3",
                    type : "4",
                    description:"123",
                    thumbnail : "4.jpg"
                }]
            }];
            this.data = data;
            this._renderWidget(data);
        },
        _renderWidget : function(data){
            var that = this;
            var template = "";
            for(var i = 0; i < data.length;i++){
                template += "<a href='#' index='"+ i +"'>"+ data[i].name +"</a>";
>>>>>>> 23016f9123aaf4a1d48f5064d474e528fb1c3cfd
            }
            this.$tab.append(template);
            $(".tab a").on("click",function(){
                $(this).addClass("active");
                $(this).siblings().removeClass("active");
                var index = $(this).attr("index");
<<<<<<< HEAD
                var components = data[index].data;
=======
                var components = data[index].components;
>>>>>>> 23016f9123aaf4a1d48f5064d474e528fb1c3cfd
                var template2 = "";
                var zIndex = components.length;
                for(var j = 0; j < components.length;j++){
                    var item = components[j];
<<<<<<< HEAD
                    template2 += "<div class='widget' style='z-index:"+ (zIndex-j) +";' id='"+ item["id"] +"' type='"+ item["cptKey"] +"'><div class='inner'><img src='../img/1.jpg'/><h3>";
                    template2 += components[j]["cptName"] +"</h3><div class='description'><h4>构件描述：</h4><p>";
                    template2 += (item["cptDesc"]==null ? "无" : item["cptDesc"]) +"</p></div></div></div>";
=======
                    template2 += "<div class='widget' style='z-index:"+ (zIndex-j) +";' type='"+ item["type"] +"'><div class='inner'><img src='../img/"+ item["thumbnail"] +"'/><h3>";
                    template2 += components[j]["name"] +"</h3><div class='description'><h4>构件描述：</h4><p>";
                    template2 += item["description"] +"</p></div></div></div>";
>>>>>>> 23016f9123aaf4a1d48f5064d474e528fb1c3cfd
                }
                that.$content.html(template2);
            });
            $(".tab a:eq(0)").trigger("click");
            $(".widget").on("click",function(){
                var type = $(this).attr("type");
<<<<<<< HEAD
                var id = $(this).attr("id");
                that.onSelect(type,id);
=======
                that.onSelect(type);
>>>>>>> 23016f9123aaf4a1d48f5064d474e528fb1c3cfd
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
