/**
 * Created by dtx on 16/9/22.
 */
(function ($) {
    var NewAttentionAnalysed = function (element,options) {
        var that  = this;
        that.$element = $(element);
        that.data = {
            "title" : "产品用户关注点分析构件",
            "condition" : {
                "baseCptId" : options.baseCptId,  //基础构件ID
                "moduleId" : options.moduleId,    //模块ID
                "cptInstId" : options.cptInstId,   //新增构件实例ID
                "conCptInstId" : options.conCptInstId?options.conCptInstId:null,
                "compareDateScope" : {
                    "value" : {
                        "beforeDateNum": options.beforeDateNum ? options.beforeDateNum : 28,
                        "afterDateNum": options.afterDateNum ? options.afterDateNum : 30
                    }
                },
                "phoneModel" : {
                    "value" : []
                },
                "infoSource" : {
                    "value" : []
                }
            },
            "result" : {},
            "related" : []
        };
        if(options && options.step){
            that.step = options.step;
        }else{
            that.step = 0;
        }
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

        _init : function () {
            var that = this;
            if(this.step==0){
                if(that.data.condition.conCptInstId){
                    that._getRelateComponentData();
                }else{
                    that._createComponentEdit();
                }
            }else{
                this._createComponent();
            }
            this._bindEvent();
        },

        /*step=0,创建编辑选项*/
        _createComponentEdit : function () {
            var that = this;
            that.addComponent = that.$element.editComponent(that.$element,that.data.condition,that.data.title);
            that.addComponent.addSelectProduct();
            that._getPhoneList();
            that.addComponent.addSelectResource();
            that._getSourceList();
            that.addComponent.addSelectTime();
            that._initSlider($("#addTime"));
            that._getStyleList();
            if(that.data.condition.phoneModel&&that.data.condition.phoneModel.value.length>0){
                that.addComponent.addProductList(that.data.condition.phoneModel.value);
            }
            if(that.data.condition.infoSource&&that.data.condition.infoSource.value.length>0){
                that.addComponent.addResourceList(that.data.condition.infoSource.value);
            }
            that._bindEvent(that.addComponent);
        },

        /*创建构件*/
        _createComponent : function () {
            var that = this;
            if(that.step == 0){
                var option = {
                    "baseCptId" : that.data.condition.baseCptId,  //基础构件ID
                    "moduleId" : that.data.condition.moduleId,    //模块ID
                    "cptInstId" : that.data.condition.cptInstId,   //新增构件实例ID
                    "conCptInstId" : that.data.condition.conCptInstId,
                    "compareDateScope" : {
                        "beforeDateNum": that.data.condition.compareDateScope.value.beforeDateNum,
                        "afterDateNum": that.data.condition.compareDateScope.value.afterDateNum
                    },
                    "phoneModel" : that.data.condition.phoneModel.value,
                    "infoSource" : that.data.condition.infoSource.value
                };
                $.ajaxJSON({
                    name : "保存构建实例",
                    url: URL.CREATE_CPTINST,
                    data: JSON.stringify(option),
                    contentType : 'application/json; charset=UTF-8',
                    type : 'post',
                    iframe: true,
                    success: function (i) {
                        that.data.result = i.data;
                        that.data.condition.cptInstId = i.data.cptInstId;
                        that.addComponent.addTab(that.$element,that.data.condition.phoneModel.value);
                        that.$element.find($(".tab")).find($(".phoneModel:first-child")).addClass("tabSelected");
                        that._getData(that.addComponent);
                        that._bindEvent(that.addComponent);
                        that._onComplete({
                            "baseCptId" : that.data.condition.baseCptId,
                            "cptInstId" : that.data.condition.cptInstId,
                            "cptKey" : "customerFocusAnalyzeCpt"
                        });
                    }
                });
            }else {
                var option = {
                    "baseCptId" : that.data.condition.baseCptId,  //基础构件ID
                    "moduleId" : that.data.condition.moduleId,    //模块ID
                    "cptInstId" : that.data.condition.cptInstId,   //新增构件实例ID
                    "conCptInstId" : that.data.condition.conCptInstId,
                    "compareDateScope" : {
                        "beforeDateNum": that.data.condition.compareDateScope.value.beforeDateNum,
                        "afterDateNum": that.data.condition.compareDateScope.value.afterDateNum
                    },
                    "phoneModel" : that.data.condition.phoneModel.value,
                    "infoSource" : that.data.condition.infoSource.value,
                    "step" : "1"
                };
                that.addComponent = that.$element.editComponent(that.$element,option,that.data.title);
                that.index = 0;
                that._getComponentAttr(that.addComponent);
            }
            if(that.$element.find(".dateBox").length==0){
                that.$element.find(".dateBox_in").addClass("dateBox");
            }
        },

        /*获取关联构建属性,创建构件*/
        _getRelateComponentData : function () {
            var that = this;
            $.ajaxJSON({
                name: "获取关联实例构件属性",
                url: URL.GET_CPTINST_ATTR,
                data: {"cptInstId": that.data.condition.conCptInstId},
                type: 'post',
                iframe: true,
                success: function (data) {
                    that.data.condition.phoneModel = data.data.phoneModel;
                    that.data.condition.infoSource = data.data.infoSource;
                    if(data.data.compareDateScope){
                        that.data.condition.compareDateScope = data.data.compareDateScope;
                    }
                    that._createComponentEdit();
                }
            })
        },

        /*获取构建数据*/
        _getData : function(){
            var that = this;
            that.$element.attr("id",that.data.condition.cptInstId);
            $.ajaxJSON({
                name : "获取构建实例数据",
                url: URL.GET_CPTINST_DATA,
                data: {"cptInstId":that.data.condition.cptInstId},
                type : 'post',
                iframe : true,
                success: function (data) {
                    if(!data){
                        that.$element.find(".echartsContainer").html("");
                        return
                    }
                    that.data.result = data.data;
                    that.addComponent.addEcharts(that.$element,that.data.condition.cptInstId);

                    that._renderResult();
                }
            });
        },

        /*更新构建数据*/
        _updata : function (beforeDateNum,afterDateNum) {
            var that = this;
            if(beforeDateNum||afterDateNum){
                that.data.condition.compareDateScope.value.beforeDateNum = beforeDateNum;
                that.data.condition.compareDateScope.value.afterDateNum = afterDateNum;
                var option = {
                    "cptInstId" : that.data.condition.cptInstId,   //新增构件实例ID
                    "compareDateScope" : {
                        "beforeDateNum" : beforeDateNum,
                        "afterDateNum" : afterDateNum
                    }
                };
            }else{
                var option = {
                    "cptInstId" : that.data.condition.cptInstId,   //新增构件实例ID
                    "phoneModel" : that.data.condition.phoneModel.value
                };
            }
            $.ajaxJSON({
                name : "更新实例属性",
                url: URL.UPDATE_GET_DATA,
                data: JSON.stringify(option),
                contentType : 'application/json; charset=UTF-8',
                type : 'post',
                iframe : true,
                success: function (data) {
                    if(!data){
                        that.$element.find(".echartsContainer").html("");
                        return
                    }
                    that.data.result = data.data.cptData;
                    that.addComponent.addEcharts(that.$element,that.data.condition.cptInstId);
                    that._renderResult();
                    that._onUpdateAttr(data.data.syncCptInstIdList);
                }
            });
        },

        /*渲染构件*/
        _renderResult : function () {
            var that = this;
            if(that.$element.find(".dateHoverBox").length){
                that.$element.find(".dateBox").data("datePicker","");
                that.$element.find(".dateBox").html("");
            }
            that.$element.find(".dateBox").datePicker({
                afterDateNum : that.data.condition.compareDateScope.value.afterDateNum,
                beforeDateNum : that.data.condition.compareDateScope.value.beforeDateNum,
                onSaveDate : function(beforeDateNum,afterDateNum){
                    if(that.data.condition.compareDateScope.value.beforeDateNum!=beforeDateNum||that.data.condition.compareDateScope.value.afterDateNum != afterDateNum){
                        that.data.condition.compareDateScope.value.beforeDateNum = beforeDateNum;
                        that.data.condition.compareDateScope.value.afterDateNum = afterDateNum;
                        that.$element.find(".echartsContainer").remove();
                        that._updata(beforeDateNum,afterDateNum);
                    }
                }
            });

            if(!that.index){
                that.index = 0;
            }
            var phoneId = that.data.condition.phoneModel.value[that.index].id;
            var selectData = that.data.result&&that.data.result[phoneId]?that.data.result[phoneId]:null;
            that.foucsWordList = [];
            if(selectData&&selectData.length>0){
                $.each(selectData,function (i) {
                    that.foucsWordList.push(selectData[i].focusWord);
                })
            }
            that._renderEcharts();
            if(that.$element.find('.relateCompanentContainer').length==0){
                that._getRelatedComponent();
            }
            that._bindEvent();
        },

        _renderEcharts : function () {
            var that = this;
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
                            that.$element.find(".tipsContainer").remove()
                        }
                        var phoneId = that.data.condition.phoneModel.value[that.index].id;
                        var selectData = that.data.result[phoneId];
                        for(var i=0;i<selectData.length;i++){
                            if(selectData[i].focusWord == $(this).html()){
                                that.addComponent.addTips(that.$element, selectData[i]);
                                return false
                            }
                        }
                    });
            }
        },

        /*获取构建属性*/
        _getComponentAttr : function () {
            var that = this;
            $.ajaxJSON({
                name: "获取构件实例属性",
                url: URL.GET_CPTINST_ATTR,
                data: {"cptInstId" : that.data.condition.cptInstId},
                type : "post",
                iframe : true,
                success : function (data) {
                    that.data.condition.phoneModel = data.data.phoneModel;
                    that.data.condition.infoSource = data.data.infoSource;
                    that.data.condition.compareDateScope = data.data.compareDateScope;
                    that.addComponent.addTab(that.$element,that.data.condition.phoneModel.value);
                    that.$element.find($(".tab").find($(".phoneModel:first-child"))).addClass("tabSelected");
                    that._getData();
                    that._bindEvent()
                }
            });
        },

        /*对比监测时间*/
        _initSlider : function($ele){
            var that = this;
            $ele.slider({
                range: true,
                min: -90,
                max: 30,
                values: [that.data.condition.compareDateScope.value["beforeDateNum"]*-1 , that.data.condition.compareDateScope.value["afterDateNum"]],
                slide: function( event, ui ) {
                    that.data.condition.compareDateScope.value["beforeDateNum"] = ui.values[ 0 ] * -1;
                    that.data.condition.compareDateScope.value["afterDateNum"] = ui.values[ 1 ];
                }
            });
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

        /*获取信息来源列表*/
        _getSourceList : function () {
            var that = this;
            $.ajaxJSON({
                name : "信息来源",
                url: URL.GET_SOURCE_DATA,
                data: {},
                type : 'post',
                iframe : true,
                success: function (data) {
                    that.resourceData = data.data;
                    var list = data.data,
                        departments = [],
                        len = list.length,
                        i=0;
                    for(;i<len;i++){
                        departments.push(
                            {
                                "text" : list[i].srcName,
                                "value" : list[i].srcKey
                            }
                        )
                    }
                    $("#resource").select("data",departments).select("trigger");
                }
            })
        },

        /*获取构件样式列表*/
        _getStyleList : function () {
            var that = this;
            $.ajaxJSON({
                name : "构件样式列表",
                url: URL.GET_STYLE_LIST,
                data: {
                    "baseCptId" : that.data.condition.baseCptId
                },
                type : 'post',
                iframe : true,
                success: function (i) {
                    if(i.data.length>0){
                        that.addComponent.addSelectStyle(i.data);
                    }else {
                        var data = [{"cptStyId":"","url":"../img/1.jpg"}];
                        that.addComponent.addSelectStyle(data);
                    }
                }
            })
        },

        /*获取关联构件*/
        _getRelatedComponent : function () {
            var that = this;
            $.ajaxJSON({
                name : "关联构建",
                url: URL.GET_REL_CPT,
                data: {
                    "baseCptId" : that.data.condition.baseCptId
                },
                type : 'post',
                iframe : true,
                success: function (i) {
                    if(i.data.length>0){
                        that._filterRelData(that.data.condition.baseCptId,i.data);
                        that.addComponent.addRelateComponent(that.$element,that.data.related);
                        that._bindEvent();
                    }
                }
            })
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
        },

        /*添加手机型号*/
        _addProduct : function () {
            var that = this;
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
                            if(!that.data.condition.phoneModel.value||that.data.condition.phoneModel.value.length==0){
                                that.data.condition.phoneModel.value = [];
                                that.data.condition.phoneModel.value.push(model);
                                that.addComponent.addProductList(that.data.condition.phoneModel.value);
                                that._bindEvent();
                            }else{
                                $.each(that.data.condition.phoneModel.value,function (i) {
                                    if(that.data.condition.phoneModel.value[i].id==model.id){
                                        $.msg("该型号手机已存在");
                                        return false
                                    }else if(i==that.data.condition.phoneModel.value.length-1){
                                        that.data.condition.phoneModel.value.push(model);
                                        that.addComponent.addProductList(that.data.condition.phoneModel.value);
                                        that._bindEvent();
                                    }
                                });
                            }
                        }
                    })
                }
            });
        },

        /*添加信息来源*/
        _addResource : function () {
            var that = this;
            var srcKey = $("#resource").val();
            $.each(that.resourceData,function (i) {
                if(that.resourceData[i].srcKey == srcKey){
                    var resource = {
                        "srcName" : that.resourceData[i].srcName,
                        "srcKey" : that.resourceData[i].srcKey
                    };
                    if(!that.data.condition.infoSource||that.data.condition.infoSource.value.length==0){
                        that.data.condition.infoSource = {
                            "value" : []
                        };
                        that.data.condition.infoSource.value.push(resource);
                        that.addComponent.addResourceList(that.data.condition.infoSource.value);
                        that._bindEvent();
                    }else{
                        $.each(that.data.condition.infoSource.value,function (j) {
                            if(that.data.condition.infoSource.value[j].srcName==that.resourceData[i].srcName){
                                $.msg("该型号信息来源已存在");
                                return false
                            }else if(j==that.data.condition.infoSource.value.length-1){
                                that.data.condition.infoSource.value.push(resource);
                                that.addComponent.addResourceList(that.data.condition.infoSource.value);
                                that._bindEvent();
                            }
                        });
                    }
                }
            });
        },

        _initConfigSync:function(){
            var that = this;
            if(that.data.condition.cptInstId){
                var data = that.data.condition,
                    fun = function(data){
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
                };
            }else{
                var data = "",
                    fun = "";
            }
            $.cptConfig({
                data : data,
                onSwitchType : fun,
                onDelete : function(){
                    that._deleteComponent();
                }
            });
        },

        /*删除构件*/
        _deleteComponent : function () {
            var that = this;
            if(that.data.condition.cptInstId){
                $.msg({
                    type : "confirm",
                    msg : "确认删除？",
                    ok : function(){
                        $.ajaxJSON({
                            name: '删除构件实例',
                            url: URL.DELETE_CPTINT,
                            data: {"cptInstId": that.data.condition.cptInstId},
                            iframe: true,
                            success: function () {
                                $.msg("删除成功");
                                that._onComplete(that.data.condition.cptInstId);
                            }
                        });
                    }
                })
            }else{
                that.$element.remove();
            }
        },

        _bindEvent : function ()  {
            var that = this;

            /*清除绑定监听*/
            $("#addProductBtn").unbind("click");
            $("#addResourceBtn").unbind("click");
            $(".deleteProductBtn").unbind("click");
            $(".deleteResourceBtn").unbind("click");
            $(".generateBtn button").unbind("click");
            that.$element.find(".addShow").unbind("click");
            that.$element.find(".delShow").unbind("click");
            that.$element.find(".set").unbind("click");

            /*添加手机型号事件监听*/
            $("#addProductBtn").on("click",function () {
                that._addProduct();
            });

            /*删除手机型号事件监听*/
            $(".deleteProductBtn").on("click",function () {
                var index = $(this).parents("li").attr("index");
                that.data.condition.phoneModel.value.splice(index,1);
                that.addComponent.addProductList(that.data.condition.phoneModel.value);
                that._bindEvent();
            });

            /*添加信息来源事件监听*/
            $("#addResourceBtn").on("click",function () {
                that._addResource();
            });

            /*删除信息来源事件监听*/
            $(".deleteResourceBtn").on("click",function () {
                var index = $(this).parents("li").attr("index");
                that.data.condition.infoSource.value.splice(index,1);
                that.addComponent.addResourceList(that.data.condition.infoSource.value);
                that._bindEvent();
            });

            /*选择构件样式事件监听*/
            $(".styleImg").on("click",function () {
                $(this).parents("li").addClass("selectStyle");
                $(this).parents("li").siblings().removeClass("selectStyle");
            });

            /*生成构件事件监听*/
            $(".generateBtn button").on("click",function () {
                var queryOptions = {
                    "baseCptId" : that.data.condition.baseCptId,  //基础构件ID
                    "moduleId" : that.data.condition.moduleId,    //模块ID
                    "conCptInstId" : that.data.condition.conCptInstId,   //新增构件实例ID
                    "compareDateScope" : {
                        "beforeDateNum": that.data.condition.compareDateScope.value.beforeDateNum ? that.data.condition.compareDateScope.value.beforeDateNum : 28,
                        "afterDateNum": that.data.condition.compareDateScope.value.afterDateNum ? that.data.condition.compareDateScope.value.afterDateNum : 30
                    },
                    "phoneModel" : that.data.condition.phoneModel.value,
                    "infoSource" : that.data.condition.infoSource.value,
                    "cptStyId": ""
                };
                that._createComponent(queryOptions,that.step);
            });

            /*切换构件tab*/
            that.$element.find($(".phoneModel")).on("click",function () {
                $(this).addClass("tabSelected");
                $(this).siblings().removeClass("tabSelected");
                var index = $(this).attr("index");
                if(index!=that.index){
                    that.index = index;
                    that.$element.find("svg").remove();
                    if(that.$element.find(".tipsContainer").length>0){
                        that.$element.find(".tipsContainer").remove();
                    }
                    that._renderResult();
                }
            });

            /*在已生成构件删除手机型号事件监听*/
            that.$element.find(".delShow").on("click",function () {
                if(that.data.condition.phoneModel.value.length<=1){
                    $.msg("型号手机不能为空");
                    return
                }
                that.addComponent.addDelectedIco(that.$element);
                if(that.$element.find(".deleteBtn").length>0){
                    that.$element.find(".deleteBtn").on("click",function () {
                        var index = $($(this).parent()).attr("index");
                        if(that.index==index){
                            that.index = 0;
                        }
                        that.data.condition.phoneModel.value.splice(index,1);
                        that.$element.find(".tabContainer").remove();
                        that.$element.find(".echartsContainer").remove();
                        that.addComponent.addTab(that.$element,that.data.condition.phoneModel.value);
                        that.$element.find($(".tab").find($(".phoneModel:first-child"))).addClass("tabSelected");
                        that._updata();
                        that._bindEvent();
                    })
                }
            });

            /*在已生成构件添加手机型号事件监听*/
            that.$element.find(".addShow").on("click",function () {
                if(that.$element.find(".selectProduct_updata").length==0){
                    that.addComponent.addProduct(that.$element);
                    that._getPhoneList();
                    that.$element.find(".addBtn_updata").on("click",function () {
                        that._addProduct();
                        if(that.data.condition.phoneModel.value.length == that.$element.find(".phoneModel").length){
                            return
                        }
                        that.$element.find($(".tabContainer")).remove();
                        that.$element.find($(".echartsContainer")).remove();
                        that.addComponent.addTab(that.$element,that.data.condition.phoneModel.value);
                        that.$element.find($(".tab").find($(".phoneModel:first-child"))).addClass("tabSelected");
                        that._updata();
                        that._bindEvent();
                    })
                }else{
                    that.$element.find(".selectProduct_updata").remove();
                }
            });

            /*创建关联构件*/
            that.$element.find(".creatRelateComponentBtn").on("click",function () {
                var param = {
                    baseCptId: $(this).attr("baseCptId"),
                    cptKey: $(this).attr("type"),
                    conCptInstId : that.data.condition.cptInstId
                };
                that._onRelatedWidget(param);
            });

            /*设置数据同步*/
            that.$element.find(".set").on("click",function () {
                that._initConfigSync();
            });

            $("body").on("click",function (e) {
                var $el = $(e.target);
                if($el.parents(".selectProduct_updata").length == 0 && !($el[0].className == 'selectProduct_updata') &&  $el[0].className != "addShow"){
                    $(".selectProduct_updata").remove();
                }
            })
        },

        /*更新数据*/
        getData : function () {
            var that = this;
            that.$element.find(".tabContainer").remove();
            that.$element.find(".echartsContainer").remove();
            that._getComponentAttr(that.addComponent);
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