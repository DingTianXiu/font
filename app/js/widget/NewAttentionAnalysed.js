/**
 * Created by dtx on 16/9/22.
 */
(function ($) {
    var NewAttentionAnalysed = function (element,options) {
        var that  = this;
        that.userInfo = JSON.parse(localStorage.userInfo);
        that.custId = localStorage.custId;
        that.$element = $(element);
        that.data = {
            "title" : "产品用户关注点分析",
            "condition" : {
                "baseCptId" : options.baseCptId,
                "moduleId" : options.moduleId,
                "cptInstId" : options.cptInstId,
                "conCptInstId" : options.conCptInstId,
                "compareDateScope" : {
                    "value" : {
                        "beforeDateNum": options.beforeDateNum ? options.beforeDateNum : 28,
                        "afterDateNum": options.afterDateNum ? options.afterDateNum : 30
                    }
                },
                "phoneModel" : {}
            },
            "result" : {},
            "related" : []
        };
        that.step = options.step;
        if(options.onComplete){
            if(typeof options.onComplete == "function"){
                that._onComplete = options.onComplete;
            }
        }
        //同步关联属性
        if(options.onUpdateAttr){
            if(typeof options.onUpdateAttr == "function"){
                that._onUpdateAttr = options.onUpdateAttr;
            }
        }
        //创建关联构件
        if(options.onRelatedWidget){
            if(typeof options.onRelatedWidget == "function"){
                that._onRelatedWidget = options.onRelatedWidget;
            }
        }
        that._init();
    };
    NewAttentionAnalysed.prototype = {

        Constructor : NewAttentionAnalysed,
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
                that._initConfigSync($(this));
            });
            this.$element.delegate(".nextStep","click",function(){
                that._createWidget();
            });
            this.$element.delegate(".legendBtn","click",function(){
                that._switchLegendBtn($(this));
            });
            this.$element.delegate(".addLegendBtn","click",function(){
                that._openPhoneDialog();
                that._getPhoneList();
            });
            this.$element.delegate(".delLegendBtn","click",function(){
                that.$element.find(".legendBtn").find("i").show();
            });
            this.$element.delegate(".delLegendIcon","click",function(){
                that._delPhoneModel($(this));
            });
            this.$element.delegate(".addBtn_updata","click",function () {
                that._addProduct();
                if(that.data.condition.phoneModel.value.length == that.$element.find(".legendBtn").length){
                    return;
                }
                that.$element.find($(".legend").find($(".legendBtn:first-child"))).addClass("active");
                that._updatePhoneModel();
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
        _initConfigSync:function($ele){
            var that = this;
            if(!this.data.condition.cptInstId){
                $.msg({
                    type : "confirm",
                    msg : "确认删除？",
                    ok : function(){
                        $ele.parents(".component").remove();
                    }
                });
                return;
            }
            $.cptConfig({
                data : that.data.condition,
                onSwitchType : function(data){
                    var param = {
                        "attrInstId" : data.id,
                        "syncType" : data.syncType
                    };
                    $.ajaxJSON({
                        name: '设置属性实例同步信息',
                        url: URL.UPDATE_SYNC_TYPE,
                        data: param,
                        iframe: true,
                        success: function (r) {
                            that.data.condition[data.key]["syncType"] = data.syncType;
                        }
                    });
                },
                onDelete : function(){
                    that._delCpt();
                }
            });
        },
        _delCpt : function(){
            var that = this;
            $.ajaxJSON({
                name: '删除构件实例',
                url: URL.DELETE_CPTINT,
                data: {
                    "cptInstId": that.data.condition.cptInstId,
                    "userId": that.custId
                },
                iframe: true,
                success: function (r) {
                    $.msg("删除成功");
                    that._onComplete(that.data.condition.cptInstId);
                }
            });
        },
        _initSlider : function($ele){
            var that = this;
            $ele.slider({
                range: true,
                min: -90,
                max: 90,
                values: [that.data.condition.compareDateScope.value["beforeDateNum"]*-1 , that.data.condition.compareDateScope.value["afterDateNum"] ],
                slide: function( event, ui ) {
                    that.data.condition.compareDateScope.value["beforeDateNum"] = ui.values[ 0 ] * -1;
                    that.data.condition.compareDateScope.value["afterDateNum"] = ui.values[ 1 ];
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
                        if(r.data.infoSource) {
                            that._initInfoSource(r.data.infoSource.value);
                            that.data.condition.infoSource = r.data.infoSource;
                        }else{
                            that._initInfoSource();
                        }
                        that.data.condition.phoneModel = r.data.phoneModel;
                    }
                });
            }else{
                this._initBrand();
                this._initInfoSource();
            }
            this._initSlider(this.$element.find(".firstMultiAttr").find(".sliderBox"));
        },
        _initBrand : function(phoneModelValue){
            var that = this;
            $.ajaxJSON({
                name: "手机品牌及型号",
                url: URL.GET_PHONE_LIST,
                data: {"industry" : "mobile"},
                type: 'get',
                iframe: true,
                success: function (r) {
                    if(phoneModelValue) {
                        that.$element.find(".proContainer").selectorPlusPro({"data": r.data, "phoneModel": phoneModelValue});
                    }else{
                        that.$element.find(".proContainer").selectorPlusPro({"data": r.data});
                    }
                }
            });
        },
        _initInfoSource : function(infoSourceValue){
            var that = this;
            $.ajaxJSON({
                name : "来源信息",
                url : URL.GET_SOURCE_DATA,
                data: {},
                type : 'get',
                iframe : true,
                success: function (r) {
                    if(infoSourceValue) {
                        that.$element.find(".infoContainer").selectorPlusSource({"data": r.data,"infoSource":infoSourceValue});
                    }else {
                        that.$element.find(".infoContainer").selectorPlusSource({"data": r.data});
                    }
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
            params["compareDateScope"] = this.data.condition.compareDateScope.value;
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
                    that._onComplete({
                        "baseCptId" : that.data.condition.baseCptId,
                        "cptInstId" : that.data.condition.cptInstId,
                        "cptKey" : "phoneReleaseVolumeEmotionAnalyzeCpt"
                    });
                    $.ajaxJSON({
                        name: '获取构件的关联构件',
                        url: URL.GET_REL_CPT,
                        data: {baseCptId: that.data.condition.baseCptId},
                        iframe:true,
                        success: function (relData) {
                            that._filterRelData(that.data.condition.baseCptId,relData.data);
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
            var source = $("#affectionAnalysed1").html();
            var template = Handlebars.compile(source);
            var html = template(this.data);
            this.$element.html(html).attr("id", that.data.condition.cptInstId);
            this.$element.find(".dateBox").datePicker({
                afterDateNum : that.data.condition.compareDateScope.value.afterDateNum,
                beforeDateNum : that.data.condition.compareDateScope.value.beforeDateNum,
                onSaveDate : function(beforeDateNum,afterDateNum){
                    if(that.data.condition.compareDateScope.value.beforeDateNum!=beforeDateNum||that.data.condition.compareDateScope.value.afterDateNum != afterDateNum){
                        that._updateDate(beforeDateNum,afterDateNum);
                    }
                }
            });
            this.$second = this.$element.find(".second");
            this.$legend = $("<div class='legend'></div>").prependTo(this.$second);
            var tpl = "";
            for(var i = 0; i < this.data.condition.phoneModel.value.length;i++){
                var item = this.data.condition.phoneModel.value[i];
                tpl += "<a href='javascript:;' class='legendBtn' modelCode='"+ item.id +"'>"+ item.brandName + " " + item.modelName +"<i class='icon iconfont icon-iconclouse delLegendIcon'></i></a>"
            }
            this.$legend.html(tpl);
            this.$addBtn = $("<div class='addShowBtnContainer'><a href='javascript:;' class='addBtn addLegendBtn'><i class='icon iconfont icon-iconadd'></i></a></div>").appendTo(this.$legend);
            this.delBtn = $("<a href='javascript:;' class='delBtn delLegendBtn'><i class='icon iconfont icon-icondel'></i></a>").appendTo(this.$legend);
            this.$hrLline = $("<hr class='hrLine'>").appendTo(this.$legend);
            if(!this.data.result) return;
            var defaultModelCode = this.$legend.find(".legendBtn").eq(0).attr("modelCode");
            this._renderChart(that.data.result[defaultModelCode]);
            this.$legend.find(".legendBtn").eq(0).addClass("active");
        },
        _renderChart : function(data){
            var that = this;
            if(that.$element.find("#echarts"+that.data.condition.cptInstId).length){
                that.$element.find("#echarts"+that.data.condition.cptInstId).remove();
                that.$element.find(".second").append("<div class='chart' id="+"echarts"+that.data.condition.cptInstId+"></div>")
            }
            if(!data){
                this.$element.find(".chart").html("");
                return;
            }
            that.foucsWordList = [];
            if(data&&data.length>0){
                $.each(data,function (i) {
                    that.foucsWordList.push(data[i].focusWord);
                })
            }
            that.$element.find(".chart").attr("id","echarts"+that.data.condition.cptInstId);
            var layout = d3.layout.cloud()
                .size([800, 300])
                .words(that.foucsWordList.map(function(d) {
                    return {text: d, size: 10 + Math.random() * 90, test: "haha"};
                }))
                .padding(0)
                .rotate(function() { return ~~(Math.random() * 2) * 60; })
                .font("Impact")
                .fontSize(function(d) { return d.size; })
                .text(function (d) {return d.text})
                .on("end", draw);

            layout.start();

            function draw(words) {
                var fill = d3.scale.category20();
                d3.select("#echarts"+that.data.condition.cptInstId).append("svg")
                    .attr("width", layout.size()[0])
                    .attr("height", layout.size()[1])
                    .append("g")
                    .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
                    .selectAll("text")
                    .data(words)
                    .enter().append("text")
                    .style("font-size", function(d) { return d.size + "px"; })
                    .style("font-family", "Impact")
                    .style("fill", function(d, i) { return fill(i); })
                    .attr("text-anchor", "middle")
                    .attr("transform", function(d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                    .text(function(d) { return d.text; })
                    .on("mouseover",function () {
                        var rgb = d3.select(this).style("fill").slice(4,-1);
                        var rgba = "rgba("+rgb+",0.8)";
                        d3.select(this).style("fill",rgba);
                    })
                    .on("mouseout",function () {
                        var rgba = d3.select(this).style("fill").slice(4,-6);
                        var rgb =  "rgb"+rgba+")";
                        d3.select(this).style("fill",rgb);
                    })
                    .on("click",function () {
                        d3.selectAll("text").style("outline","none");
                        d3.select(this).style("outline","solid");
                        if(that.$element.find(".tipsContainer").length>0){
                            that.$element.find(".tipsContainer").remove();
                        }
                        for(var i=0;i<data.length;i++){
                            if(data[i].focusWord == $(this).html()){
                                that._addTips(data[i]);
                                return false
                            }
                        }
                    });
            }
        },
        _addTips : function (data) {
            var that = this;
            var dom_tipsContainer = "<ul class='tipsContainer'><li>"+data.focusWord+"</li></ul>";
            that.$element.find("#echarts"+that.data.condition.cptInstId).append(dom_tipsContainer);
            $.each(data.srcList,function (i) {
                var dom_tip = "<li>"+data.srcList[i].srcName+":"+data.srcList[i].volumn+"</li>"
                that.$element.find(".tipsContainer").append(dom_tip);
            })
        },
        _updateDate : function(beforeDateNum,afterDateNum){
            var that = this;
            that.data.condition.compareDateScope.value.beforeDateNum = beforeDateNum;
            that.data.condition.compareDateScope.value.afterDateNum = afterDateNum;
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
                    that._onUpdateAttr(r.data.syncCptInstIdList);
                    that.data.result = r.data.cptData;
                    that._renderResult();
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
                    that._filterRelData(that.data.condition.baseCptId,relData.data);
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
                    that.data.condition["compareDateScope"] = r.data.compareDateScope;
                    that.data.condition["infoSource"] = r.data.infoSource;
                    that.data.condition["phoneModel"] = r.data.phoneModel;
                    $.ajaxJSON({
                        name : '获取构件实例数据',
                        url :URL.GET_CPTINST_DATA,
                        data : param,
                        iframe:true,
                        success : function(r){
                            that.data.result = r.data;
                            that._renderResult();
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
        },
        /*添加手机型号*/
        _addProduct : function () {
            var that = this;
            if(that.data.condition.phoneModel.value.length>=8){
                $.msg("最多只能添加8个手机型号")
                return
            }
            var id = $(".model").val(),
                brandCode = $(".brand").val();
            $.each(that.modelData,function (i) {
                if(that.modelData[i].brandCode == brandCode){
                    var models = that.modelData[i].models,
                        brandName = that.modelData[i].brandName;
                    $.each(models,function (j) {
                        if(models[j].modelCode == id){
                            var model = {
                                "id": models[j].modelCode,
                                "brandName": brandName,
                                "modelName": models[j].modelName,
                                "picUrl": models[j].logoUrl,
                                "releaseDate": models[j].pubDate
                            };
                            $.each(that.data.condition.phoneModel['value'],function (i) {
                                if(that.data.condition.phoneModel['value'][i].id==model.id){
                                    $.msg("该型号手机已存在");
                                    return false;
                                }else if(i==that.data.condition.phoneModel.value.length-1){
                                    that.data.condition.phoneModel.value.push(model);
                                }
                            });
                        }
                    })
                }
            });
        },
        _openPhoneDialog : function(){
            var that = this;
            if(this.$element.find(".selectProduct_updata").length==0){
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
                    "<li><button class='addBtn_updata'><i class='icon iconfont icon-iconadd'></i></button></li>" +
                    "</ul>";
                this.$element.find(".addShowBtnContainer").append(dom);
            }else{
                that.$element.find(".selectProduct_updata").remove();
            }
        },
        /*获取手机型号列表*/
        _getPhoneList : function () {
            var that = this;
            if(that.arr&&that.modelsObj){
                that.$element.find($(".brand")).select('data', that.arr).select("trigger");
                that.$element.find($(".brand")).on("change", function () {
                    var val = $(this).val();
                    that.$element.find($(".model")).select("destroy").select('data', that.modelsObj[val]);
                });
                that.$element.find($(".brand")).trigger("change");
            }else {
                $.ajaxJSON({
                    name: "手机列表",
                    url: URL.GET_PHONE_LIST,
                    data: {
                        industry: "mobile"
                    },
                    type: 'post',
                    iframe: true,
                    success: function (data) {
                        var arr = [],
                            modelsObj = {};
                        this.data = data.data;
                        that.modelData = data.data.brands;
                        if (!this.data) {
                            that.$element.find($(".brand")).select('data', [{text: "请选择", value: -1}]);
                            that.$element.find($(".model")).select('data', [{text: "请选择", value: -1}]);
                        } else {
                            for (var i = 0; i < this.data.brands.length; i++) {
                                var item = this.data.brands[i];
                                arr.push({
                                    text: item.brandName,
                                    value: item.brandCode
                                });
                                modelsObj[item.brandCode] = [];
                                for (var j = 0; j < item.models.length; j++) {
                                    modelsObj[item.brandCode].push({
                                        text: item.models[j].modelName,
                                        value: item.models[j].modelCode
                                    })
                                }
                            }
                            that.$element.find($(".brand")).select('data', arr).select("trigger");
                            that.$element.find($(".brand")).on("change", function () {
                                var val = $(this).val();
                                that.$element.find($(".model")).select("destroy").select('data', modelsObj[val]);

                            });
                            that.$element.find($(".brand")).trigger("change");
                            that.arr = arr;
                            that.modelsObj = modelsObj;
                        }
                    }
                })
            }
        },
        _updatePhoneModel : function() {
            var that = this;
            var param = {
                "cptInstId": this.data.condition.cptInstId,
                "phoneModel": that.data.condition.phoneModel.value
            };

            $.ajaxJSON({
                name: "更新实例属性",
                url: URL.UPDATE_CPTiNST_ATTR,
                data: param,
                data: JSON.stringify(param),
                contentType: 'application/json; charset=UTF-8',
                iframe: true,
                success: function (r) {
                    that._onUpdateAttr(r.data.syncCptInstIdList);
                    that._renderResult();
                }
            });
        },
        _delPhoneModel : function($ele){
            if(this.data.condition.phoneModel.value.length <= 1){
                $.msg({modal : true,msg : "型号手机不能为空"});
                return;
            }
            var modelcode = $ele.parent().attr("modelcode");
            for(var i = 0; i < this.data.condition.phoneModel.value.length;i++){
                if(modelcode == this.data.condition.phoneModel.value[i].id){
                    this.data.condition.phoneModel.value.splice(i,1);
                }
            }
            this.$element.find($(".legend").find($(".legendBtn:first-child"))).addClass("active");
            this._updatePhoneModel();
        },
        _filterRelData : function(baseCptId,relData){
            for(var i = 0; i < relData.length;i++){
                if(baseCptId != relData[i]["baseCptId"]){
                    this.data.related.push({
                        "baseCptId" : relData[i].baseCptId,
                        "baseCptName" : relData[i].baseCptName,
                        "baseCptKey" : relData[i].baseCptKey
                    });
                }
            }
        }
    };
    $.fn.newAttentionAnalysed = function(option, value) {
        var methodReturn;
        var $set = this.each(function() {
            var $this = $(this);
            var data = $this.data('newAttentionAnalysed');
            var options = typeof option === 'object' && option;
            if (!data) {
                $this.data('newAttentionAnalysed', (data = new NewAttentionAnalysed(this, options)));
            }
            if (typeof option === 'string') {
                methodReturn = data[option](value);
            }
        });
        return (methodReturn === undefined) ? $set : methodReturn;
    };
    $.fn.newAttentionAnalysed.Constructor = NewAttentionAnalysed;
})(jQuery);