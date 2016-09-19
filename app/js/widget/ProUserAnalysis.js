/**
 * Created by shuyuqiong on 2016/9/8.
 */
(function($) {
    var ProUserAnalysis = function(element,options){
        this.step = options.step;
        this.data = {
            "title" : " 产品用户调性分析",
            "condition" : {
                "baseCptId" : options.baseCptId,
                "moduleId" : options.moduleId,
                "cptInstId" : options.cptInstId,
                "conCptInstId" : options.conCptInstId,
                "compareDateScope" : {
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
        //同步关联属性
        if(options.onUpdateAttr){
            if(typeof options.onUpdateAttr == "function"){
                this._onUpdateAttr = options.onUpdateAttr;
            }
        }
        //创建关联构件
        if(options.onRelatedWidget){
            if(typeof options.onRelatedWidget == "function"){
                this._onRelatedWidget = options.onRelatedWidget;
            }
        }
        this._init(element,options);
    };
    ProUserAnalysis.prototype = {
        constructor : ProUserAnalysis,
        _init : function(element,options){
            if(this.step == 0){
                this._renderCondition();
            }else{
                this._getRelData();
            }
            this._bindEvent();
        },
        _bindEvent : function(){
            var that = this;
            this.$element.delegate(".configBtn","click",function(){
                //设置构件同步关系
                that._initConfigSync();
            });
            this.$element.delegate(".nextStep","click",function(){
                that._createWidget();
            });
            this.$element.delegate(".legendBtn","click",function(){
                that._switchLegendBtn($(this));
            });
            this.$element.delegate(".relatedBtn","click",function(){
                var param = {
                    baseCptId: $(this).attr("baseCptId"),
                    cptKey: $(this).attr("type"),
                    conCptInstId : that.data.condition.cptInstId
                };
                that._onRelatedWidget(param);
            });
        },
        _initConfigSync:function(){
            var that = this;
            $.msg({
                type : "confirm",
                msg : "确认删除？",
                ok : function(){
                    $.ajaxJSON({
                        name: '删除构件实例',
                        url: URL.DELETE_CPTINT,
                        data: {"cptInstId": that.data.condition.cptInstId},
                        iframe: true,
                        success: function (r) {
                            $.msg("删除成功");
                            that._onComplete(that.data.condition.cptInstId);
                        }
                    });
                }
            });
            //$.ajaxJSON({
            //    name: '设置属性实例同步信息',
            //    url: URL.UPDATE_SYNC_TYPE,
            //    data: {"attrInstId": 231,"syncType" : 0},
            //    iframe: true,
            //    success: function (r) {
            //        $.msg("设置属性231同步成功");
            //    }
            //});
            //$.ajaxJSON({
            //    name: '设置属性实例同步信息',
            //    url: URL.UPDATE_SYNC_TYPE,
            //    data: {"attrInstId": 237,"syncType" : 0},
            //    iframe: true,
            //    success: function (r) {
            //        $.msg("设置属性237同步成功");
            //    }
            //});
        },
        _initSlider : function($ele){
            var that = this;
            $ele.slider({
                range: true,
                min: -90,
                max: 30,
                values: [that.data.condition.compareDateScope["beforeDateNum"]*-1 , that.data.condition.compareDateScope["afterDateNum"] ],
                slide: function( event, ui ) {
                    that.data.condition.compareDateScope["beforeDateNum"] = ui.values[ 0 ] * -1;
                    that.data.condition.compareDateScope["afterDateNum"] = ui.values[ 1 ];
                }
            });
        },
        _renderCondition : function(){
            var that = this;
            var source = $("#proUserAnalysis0").html();
            var template = Handlebars.compile(source);
            var html = template(this.data);
            this.$element.html(html);
            if(that.data.condition.conCptInstId) {
                $.ajaxJSON({
                    name: '获取关联构件实例属性',
                    url: URL.GET_CPTINST_ATTR,
                    data: {"cptInstId": that.data.condition.conCptInstId},
                    iframe: true,
                    success: function (r) {
                        that._initBrand(r.data.phoneModel.value);
                    }
                });
            }else{
                this._initBrand();
            }
            this._initInfoSource();
            this._initSlider(this.$element.find(".firstMultiAttr").find(".sliderBox"));
        },
        _initBrand : function(phoneModel){
            var that = this;
            $.ajaxJSON({
                name: "手机品牌及型号",
                url: URL.GET_PHONE_LIST,
                data: {"industry" : "mobile"},
                type: 'get',
                iframe: true,
                success: function (r) {
                    if(phoneModel) {
                        that.$element.find(".proContainer").selectorPlusPro({"data": r.data, "phoneModel": phoneModel});
                    }else{
                        that.$element.find(".proContainer").selectorPlusPro({"data": r.data});
                    }
                }
            });
        },
        _initInfoSource : function(){
            var that = this;
            $.ajaxJSON({
                name : "来源信息",
                url : URL.GET_SOURCE_DATA,
                data: {},
                type : 'get',
                iframe : true,
                success: function (r) {
                    that.$element.find(".infoContainer").selectorPlusSource({"data":r.data});
                }
            });
        },
        _createWidget : function(){
            var params = this.data.condition;
            var phoneModel = this.$element.find(".proContainer").selectorPlusPro("getData");
            var infoSource = this.$element.find(".infoContainer").selectorPlusSource("getData");
            if(phoneModel.length == 0){
                $.msg("请选择目标产品");
                return;
            }
            if(infoSource.length == 0){
                $.msg("请选择信息来源");
                return;
            }
            params["phoneModel"] = [];
            for(var i = 0; i < phoneModel.length;i++) {
                params["phoneModel"].push({
                    "id": phoneModel[i].id,
                    "brandName" : phoneModel[i].brandName,
                    "modelName" : phoneModel[i].modelName,
                    "releaseDate" : phoneModel[i].releaseDate,
                    "picUrl" : phoneModel[i].logoUrl
                });
            }
            params["infoSource"] = infoSource;
            if(this.data.condition.conCptInstId){
                params["conCptInstId"] = this.data.condition.conCptInstId;
            }
            var that = this;
            $.ajaxJSON({
                name: '新增构件实例',
                url: URL.CREATE_CPTINST,
                data: JSON.stringify(params),
                iframe:true,
                contentType : 'application/json; charset=UTF-8',
                success: function (r) {
                    that.data.condition.cptInstId = r.data.cptInstId;
                    $.ajaxJSON({
                        name: '获取构件的关联构件',
                        url: URL.GET_REL_CPT,
                        data: {baseCptId: that.data.condition.baseCptId},
                        iframe:true,
                        success: function (relData) {
                            that.data.related = relData.data;
                            that._getData();
                        }
                    });
                }
            });
        },
        _switchLegendBtn : function($ele){
            var code = $ele.attr("modelCode");
            $ele.addClass("active");
            $ele.siblings().removeClass("active");
            this._renderChart(this.data.result[code]);
        },
        _renderResult : function(){
            var that = this;
            var source = $("#proUserAnalysis1").html();
            var template = Handlebars.compile(source);
            var html = template(this.data);
            this.$element.html(html).attr("id", that.data.condition.cptInstId);
            this.$element.find(".dateBox").datePicker({
                beforeDateNum : that.data.condition.compareDateScope["beforeDateNum"],
                afterDateNum : that.data.condition.compareDateScope["afterDateNum"],
                onSaveDate : function(beforeDateNum,afterDateNum){
                    that._updateDate(beforeDateNum,afterDateNum);
                }
            });
            this.$second = this.$element.find(".second");
            this.$legend = $("<div class='legend'></div>").prependTo(this.$second);
            var tpl = "";
            for(var i = 0; i < this.data.condition.phoneModel.length;i++){
                var item = this.data.condition.phoneModel[i];
                tpl += "<a href='javascript:;' class='legendBtn' modelCode='"+ item.id +"'>"+ item.brandName + " " + item.modelName +"<i>x</i></a>"
            }
            this.$legend.html(tpl);
            this.$addBtn = $("<a href='javascript:;' class='addBtn'><i class='icon iconfont icon-iconadd'></i></a>").appendTo(this.$legend);
            this.delBtn = $("<a href='javascript:;' class='delBtn'><i class='icon iconfont icon-icondel'></i></a>").appendTo(this.$legend);
            if(!this.data.result) return;
            var defaultModelCode = this.$legend.find(".legendBtn").eq(0).attr("modelCode");
            this._renderChart(that.data.result[defaultModelCode]);
            this.$legend.find(".legendBtn").eq(0).addClass("active");
        },
        _renderChart : function(data){
            if(!data){
                this.$element.find(".chart").html("");
                return;
            }
            var xList = [],
                seriesList = [],
                negativeList = [],
                neutralList = [],
                positiveList = [];
            for(var i = 0; i < data.length;i++){
                xList.push(data[i].attr);
                negativeList.push(data[i].negative);
                neutralList.push(data[i].neutral);
                positiveList.push(data[i].positive);
            }
            var settings = {
                type: 'bar',
                stack: '总量',
                barWidth: '60%',
                label: {
                    normal: {
                        show: true,
                        position: 'insideRight'
                    }
                }
            };
            var negativeSettings = $.extend({name:'负面'},settings,{data:negativeList});
            var neutralSettings = $.extend({name:'中性'},settings,{data:neutralList});
            var positiveSettings = $.extend({name:'正面'},settings,{data:positiveList});
            var option = {
                color : ['#5f97fb','#87b1fc','#afcbfd'],
                tooltip : {
                    trigger: 'axis',
                    axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                        type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                    },
                    formatter: '{a2}: {c2}<br />{a1}: {c1}<br />{a0}: {c0}'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis:  {
                    type: 'category',
                    data: xList,
                    axisTick : {show:false}
                },
                yAxis: {
                    type: 'value',
                    splitLine:{
                        show:false
                    },
                    axisTick : {show:false},
                    axisLabel : {show:false}
                },
                series: [negativeSettings,neutralSettings,positiveSettings]
            };
            var stackChart = echarts.init(this.$element.find(".chart")[0]);
            stackChart.setOption(option);
        },
        _updateDate : function(beforeDateNum,afterDateNum){
            var that = this;
            that.data.condition.compareDateScope.beforeDateNum = beforeDateNum;
            that.data.condition.compareDateScope.afterDateNum = afterDateNum;
            var param = {
                "cptInstId" : that.data.condition.cptInstId,
                "compareDateScope" : {
                    "beforeDateNum" : beforeDateNum,
                    "afterDateNum" : afterDateNum
                }
            };
            $.ajaxJSON({
                url: URL.UPDATE_GET_DATA,
                data : JSON.stringify(param),
                contentType : 'application/json; charset=UTF-8',
                iframe:true,
                success:function(r){
                    //that._onUpdateAttr(r.data.syncCptInstIdList);
                    that.data.result = r.data.cptData;
                    that._renderResult();
                    that._onComplete(that.data);
                }
            });
        },
        _getRelData : function(){
            var that = this;
            var param = {"cptInstId" : this.data.condition.cptInstId};
            $.ajaxJSON({
                name: '获取构件的关联构件',
                url: URL.GET_REL_CPT,
                data: {baseCptId: that.data.condition.baseCptId},
                iframe:true,
                success: function (relData) {
                    that.data.related = relData.data;
                    that._getData();
                }
            });
        },
        _getData : function(){
            var that = this;
            var param = {"cptInstId" : this.data.condition.cptInstId};
            $.ajaxJSON({
                name: '获取构件实例属性',
                url: URL.GET_CPTINST_ATTR,
                data: param,
                iframe: true,
                success: function (r) {
                    that.data.condition["compareDateScope"] = r.data.compareDateScope.value;
                    that.data.condition["infoSource"] = r.data.infoSource.value;
                    that.data.condition["phoneModel"] = r.data.phoneModel.value;
                    $.ajaxJSON({
                        name : '获取构件实例数据',
                        url :URL.GET_CPTINST_DATA,
                        data : param,
                        iframe:true,
                        success : function(r){
                            that.data.result = r.data;
                            that._renderResult();
                            that._onComplete(this.data);
                        }
                    });
                }
            });
        },
        getData : function(){
          this._getData();
        },
        _close : function(){
            this.$element.remove();
        }
    };
    $.fn.proUserAnalysis = function(option, value) {
        var methodReturn;
        var $set = this.each(function() {
            var $this = $(this);
            var data = $this.data('proUserAnalysis');
            var options = typeof option === 'object' && option;
            if (!data) {
                $this.data('proUserAnalysis', (data = new ProUserAnalysis(this, options)));
            }
            if (typeof option === 'string') {
                methodReturn = data[option](value);
            }
        });
        return (methodReturn === undefined) ? $set : methodReturn;
    };
    $.fn.proUserAnalysis.Constructor = ProUserAnalysis;
})(jQuery);