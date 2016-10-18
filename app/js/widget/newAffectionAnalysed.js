/**
 * Created by dtx on 16/8/25.
 */

(function ($) {
    var NewAffectionAnalysed = function (element,options) {
        var that  = this;
        that.userInfo = JSON.parse(localStorage.userInfo);
        that.custId = localStorage.custId;
        that.delLegendIconShow = false;
        that.$element = $(element);
        that.step = options.step;
        that.data = {
            "title" : "新品声量情感分析",
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
    NewAffectionAnalysed.prototype = {

        Constructor : NewAffectionAnalysed,

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
                if(that.data.condition.phoneModel.value.length>=8){
                    $.msg("最多只能添加8个手机型号")
                    return
                }
                that._openPhoneDialog();
                that._getPhoneList();
            });
            this.$element.delegate(".delLegendBtn","click",function(){
                if(!that.delLegendIconShow){
                    that.$element.find(".legendBtn").find("i").show();
                    that.delLegendIconShow = true;
                }else {
                    that.$element.find(".legendBtn").find("i").hide();
                    that.delLegendIconShow = false;
                }
            });
            this.$element.delegate(".delLegendIcon","click",function(){
                var ele = this;
                $.msg({
                    type : "confirm",
                    msg : "确定要删除该项相关的数据展示吗？",
                    ok : function(){
                        that._delPhoneModel($(ele));
                    }
                });
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
            $("body").on("click",function(e){
                var $el = $(e.target);
                if($el[0].className != "icon iconfont icon-iconclouse delLegendIcon"&&$el[0].className != "icon iconfont icon-icondel"&&$el[0].className!=""){
                    if(that.delLegendIconShow){
                        that.$element.find(".legendBtn").find("i").hide();
                        that.delLegendIconShow = false;
                    }
                }
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
                        that._onComplete(null);
                    }
                });
                return;
            }
            $.cptConfig({
                data : that.data.condition,
                onSwitchType : function(data){
                    var param = {
                        "userId" : that.custId,
                        "attrSyncTypeList" : data
                    };
                    $.ajaxJSON({
                        name: '设置属性实例同步信息',
                        url: URL.UPDATE_SYNC_TYPE,
                        data: JSON.stringify(param),
                        iframe: true,
                        contentType : 'application/json; charset=UTF-8',
                        success: function (r) {
                            for(var i in that.data.condition){
                                var item = that.data.condition[i];
                                if(item != null && typeof item == "object"){
                                    for(var j = 0; j < data.length;j++){
                                        if(item.id == data[j].attrInstId){
                                            item["syncType"] = data[j].syncType;
                                            break;
                                        }
                                    }
                                }
                            }
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
            if(params["phoneModel"].length>8){
                $.msg("最多添加8个手机型号");
                return
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
            this._renderChart(this.data.result.volumeData[code]);
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
            if(that.delLegendIconShow){
                that.$element.find(".legendBtn").find("i").show();
            }
            this.$addBtn = $("<div class='addShowBtnContainer'><a href='javascript:;' class='addBtn addLegendBtn'><i class='icon iconfont icon-iconadd'></i></a></div>").appendTo(this.$legend);
            this.delBtn = $("<a href='javascript:;' class='delBtn delLegendBtn'><i class='icon iconfont icon-icondel'></i></a>").appendTo(this.$legend);

            this.$hrLline = $("<hr class='hrLine'>").appendTo(this.$legend);
            if(!this.data.result) return;
            var defaultModelCode = this.$legend.find(".legendBtn").eq(0).attr("modelCode");
            this._renderChart(that.data.result.volumeData[defaultModelCode]);
            this.$legend.find(".legendBtn").eq(0).addClass("active");
        },
        _renderChart : function(data){
            var that = this;
            if(!data || data.length == 0){
                this.$element.find(".chart").html("<div class='noData'><h3>暂无数据</h3><p>有疑问请联系客服</p></div>");
                this.$element.find(".chartLabel").hide();
                return;
            }
            var afterDateNum = that.data.condition.compareDateScope.value.afterDateNum,
                beforeDateNum = that.data.condition.compareDateScope.value.beforeDateNum*-1;
            var dateList = [];
            for(var i=beforeDateNum;i<afterDateNum;i++){
                if(i==0){
                    dateList.push({
                        value:"发布日",
                        textStyle: {
                            fontSize: 20,
                            color: 'red'
                        }
                    });
                }else{
                    dateList.push(i);
                }
            }
            var option = {
                title: {
                    text: ''
                },
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: dateList,
                    axisLabel:{
                        textStyle:{
                            color:'#9a9a9a',
                        },
                        interval : 0
                    }
                },
                yAxis: {
                    type: 'value'
                },
                color: ["#f25e61","#7ecefd","#ff9948","#eb547c","#247ba0","#70c1b3","#cae3a8","#e8d2a7","#ffa4a2"],
                series: [
                    {
                        name:'声量总量',
                        type:'line',
                        data: data.sum
                    },
                    {
                        name:'正面总量',
                        type:'line',
                        data: data.positive
                    },
                    {
                        name:'负面总量',
                        type:'line',
                        data: data.negative
                    }
                ]
            };
            var stackChart = echarts.init(this.$element.find(".chart")[0]);
            stackChart.setOption(option);
            window.addEventListener("resize",function(){
                stackChart.resize();
            });
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
            if(this.$element.find(".selectProduct_updata_wrap").length==0){
                var dom = "<div class='selectProduct_updata_wrap'>"+
                    "<div class='boxNav'><i class='iconfont'>&#xe61f;</i></div>"+
                    "<ul class='selectProduct_updata'>" +
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
                    "<li><button class='addBtn_updata'><i class='icon iconfont'>&#xe61f;</i></button></li>" +
                    "</ul></div>";
                this.$element.find(".addShowBtnContainer").append(dom);
            }else{
                that.$element.find(".selectProduct_updata_wrap").remove();
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
                    that._getData();
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
            this.delLegendIconShow = true;
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
    $.fn.newAffectionAnalysed = function(option, value) {
        var methodReturn;
        var $set = this.each(function() {
            var $this = $(this);
            var data = $this.data('newAffectionAnalysed');
            var options = typeof option === 'object' && option;
            if (!data) {
                $this.data('newAffectionAnalysed', (data = new NewAffectionAnalysed(this, options)));
            }
            if (typeof option === 'string') {
                methodReturn = data[option](value);
            }
        });
        return (methodReturn === undefined) ? $set : methodReturn;
    };
    $.fn.newAffectionAnalysed.Constructor = NewAffectionAnalysed;
})(jQuery);