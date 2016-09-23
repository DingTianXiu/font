/**
 * Created by dtx on 16/8/25.
 */

(function ($) {
    var NewAffectionAnalysed = function (element,options) {
        var that  = this;
        that.$element = $(element);
        that.data = {
            "title" : "手机新品声量情感分析",
            "condition" : {
                "baseCptId" : options.baseCptId,  //基础构件ID
                "moduleId" : options.moduleId,    //模块ID
                "cptInstId" : options.cptInstId,   //新增构件实例ID
                "conCptInstId" : options.conCptInstId?options.conCptInstId:null,
                "compareDateScope" : {
                    "beforeDateNum": options.beforeDateNum ? options.beforeDateNum : 28,
                    "afterDateNum": options.afterDateNum ? options.afterDateNum : 30
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
    NewAffectionAnalysed.prototype = {

        Constructor : NewAffectionAnalysed,

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
            if(that.data.condition.phoneModel&&that.data.condition.phoneModel.length>0){
                that.addComponent.addProductList(that.data.condition.phoneModel);
            }
            if(that.data.condition.infoSource&&that.data.condition.infoSource.length>0){
                that.addComponent.addResourceList(that.data.condition.infoSource);
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
                        "beforeDateNum": that.data.condition.compareDateScope.beforeDateNum,
                        "afterDateNum": that.data.condition.compareDateScope.afterDateNum
                    },
                    "phoneModel" : that.data.condition.phoneModel,
                    "infoSource" : that.data.condition.infoSource
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
                        that.addComponent.addTab(that.$element,that.data.condition.phoneModel);
                        that.$element.find($(".tab")).find($(".phoneModel:first-child")).addClass("tabSelected");
                        that._getData(that.addComponent);
                        that._bindEvent(that.addComponent)
                    }
                });
            }else {
                var option = {
                    "baseCptId" : that.data.condition.baseCptId,  //基础构件ID
                    "moduleId" : that.data.condition.moduleId,    //模块ID
                    "cptInstId" : that.data.condition.cptInstId,   //新增构件实例ID
                    "conCptInstId" : that.data.condition.conCptInstId,
                    "compareDateScope" : {
                        "beforeDateNum": that.data.condition.compareDateScope.beforeDateNum,
                        "afterDateNum": that.data.condition.compareDateScope.afterDateNum
                    },
                    "phoneModel" : that.data.condition.phoneModel,
                    "infoSource" : that.data.condition.infoSource,
                    "step" : "1"
                };
                that.addComponent = that.$element.editComponent(that.$element,option,that.data.title);
                that._getComponentAttr(that.addComponent);
            }
            if(that.$element.find(".dateBox").length==0){
                that.$element.find(".dateBox_in").addClass("dateBox");
            }
            that.$element.find(".dateBox").datePicker({
                afterDateNum : that.data.condition.compareDateScope.afterDateNum,
                beforeDataNum : that.data.condition.compareDateScope.beforeDataNum,
                onSaveDate : function(beforeDateNum,afterDateNum){
                    that.data.condition.compareDateScope.beforeDataNum = beforeDateNum;
                    that.data.condition.compareDateScope.afterDateNum = afterDateNum;
                    that._updateAndGetData(beforeDateNum,afterDateNum);
                }
            });
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
                    that.data.condition.phoneModel = [];
                    $.each(data.data.phoneModel.value,function (i) {
                        that.data.condition.phoneModel.push(data.data.phoneModel.value[i]);
                    });
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
                    that.data.condition.compareDateScope.afterDateNum = data.data?data.data.afterDateNum:null;
                    that.data.condition.compareDateScope.beforeDataNum = data.data?data.data.beforeDataNum:null;
                    that.addComponent.addEcharts(that.$element,that.data.condition.cptInstId);

                    that._renderResult();
                    that._onComplete(this.data);
                }
            });
        },

        /*更新构建数据*/
        _updata : function () {
            var that = this;
            var option = {
                "baseCptId" : that.data.condition.baseCptId,  //基础构件ID
                "moduleId" : that.data.condition.moduleId,    //模块ID
                "cptInstId" : that.data.condition.cptInstId,   //新增构件实例ID
                "conCptInstId" : that.data.condition.conCptInstId,
                "phoneModel" : that.data.condition.phoneModel
            };
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
                    that.data.condition.compareDateScope.afterDateNum = data.data.cptData.afterDateNum?data.data.cptData.afterDateNum:null;
                    that.data.condition.compareDateScope.beforeDataNum = data.data.cptData.beforeDataNum?data.data.cptData.beforeDataNum:null;
                    that.addComponent.addEcharts(that.$element,that.data.condition.cptInstId);
                    that._renderResult();
                    that._onUpdateAttr(data.data.syncCptInstIdList);
                }
            });
        },

        /*渲染构件*/
        _renderResult : function () {
            var that = this;
            var dom = document.getElementById("echarts"+that.data.condition.cptInstId);
            var myChart = echarts.init(dom);
            var selectData_sum = [],
                selectData_positive = [],
                selectData_negative = [];
            var phoneId = that.data.condition.phoneModel[0].id;
            var selectData = that.data.result&&that.data.result.volumeData[phoneId]?that.data.result.volumeData[phoneId]:null;
            if(selectData){
                selectData_sum.push(selectData.sum);
                selectData_positive.push(selectData.positive);
                selectData_negative.push(selectData.negative);
            }
            var afterDateNum = that.data.result&&that.data.result.afterDateNum?that.data.result.afterDateNum:28,
                beforeDataNum = that.data.result&&that.data.result.beforeDataNum?-that.data.result.beforeDataNum:-30;
            var dateList = [];
            for(var i=beforeDataNum;i<afterDateNum;i++){
                dateList.push(i);
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
                    data: dateList
                },
                yAxis: {
                    type: 'value'
                },
                color: ["#f25e61","#7ecefd","#ff9948","#eb547c","#247ba0","#70c1b3","#cae3a8","#e8d2a7","#ffa4a2"],
                series: [
                    {
                        name:'声量总量',
                        type:'line',
                        // stack: '总量',
                        data: selectData_sum[0]
                    },
                    {
                        name:'正面总量',
                        type:'line',
                        // stack: '总量',
                        data: selectData_positive[0]
                    },
                    {
                        name:'负面总量',
                        type:'line',
                        // stack: '总量',
                        data: selectData_negative[0]
                    }
                ]
            };
            that.myChart = myChart;
            that.option = option;
            if (option && typeof option === "object") {
                myChart.setOption(option);
                if(that.$element.find('.relateCompanentContainer').length==0){
                    that._getRelatedComponent();
                }
                that._bindEvent();
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
                    that.data.condition.phoneModel = data.data.phoneModel.value;
                    that.data.condition.infoSource = data.data.infoSource.value;
                    that.addComponent.addTab(that.$element,that.data.condition.phoneModel);
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
                values: [that.data.condition.compareDateScope["beforeDateNum"]*-1 , that.data.condition.compareDateScope["afterDateNum"]*-1 ],
                slide: function( event, ui ) {
                    that.data.condition.compareDateScope["beforeDateNum"] = ui.values[ 0 ] * -1;
                    that.data.condition.compareDateScope["afterDateNum"] = ui.values[ 1 ] * -1;
                }
            });
        },

        /*获取手机型号列表*/
        _getPhoneList : function () {
            var that = this;
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
                        }
                    }
                })
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
                        that.addComponent.addRelateComponent(that.$element,i.data);
                        that._bindEvent();
                    }
                }
            })
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
                            if(!that.data.condition.phoneModel){
                                that.data.condition.phoneModel = [];
                                that.data.condition.phoneModel.push(model);
                                that.addComponent.addProductList(that.data.condition.phoneModel);
                                that._bindEvent();
                            }else{
                                $.each(that.data.condition.phoneModel,function (i) {
                                    if(that.data.condition.phoneModel[i].id==model.id){
                                        $.msg("该型号手机已存在");
                                        return false
                                    }else if(i==that.data.condition.phoneModel.length-1){
                                        that.data.condition.phoneModel.push(model);
                                        that.addComponent.addProductList(that.data.condition.phoneModel);
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
                    if(!that.data.condition.infoSource){
                        that.data.condition.infoSource = [];
                        that.data.condition.infoSource.push(resource);
                        that.addComponent.addResourceList(that.data.condition.infoSource);
                        that._bindEvent();
                    }else{
                        $.each(that.data.condition.infoSource,function (i) {
                            if(that.data.condition.infoSource[i].id==resource.id){
                                $.msg("该型号信息来源已存在");
                                return false
                            }else if(i==that.data.condition.infoSource.length-1){
                                that.data.condition.infoSource.push(resource);
                                that.addComponent.addResourceList(that.data.condition.infoSource);
                                that._bindEvent();
                            }
                        });
                    }
                }
            });
        },

        /*删除构件*/
        _deleteComponent : function () {
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
                        }
                    });
                }
            })
        },

        _bindEvent : function () {
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
                that.data.condition.phoneModel.splice(index,1);
                that.addComponent.addProductList(that.data.condition.phoneModel);
                that._bindEvent();
            });

            /*添加信息来源事件监听*/
            $("#addResourceBtn").on("click",function () {
               that._addResource();
            });

            /*删除信息来源事件监听*/
            $(".deleteResourceBtn").on("click",function () {
                var index = $(this).parents("li").attr("index");
                that.data.condition.infoSource.splice(index,1);
                that.addComponent.addResourceList(that.data.condition.infoSource);
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
                        "beforeDateNum": that.data.condition.compareDateScope.beforeDateNum ? that.data.condition.compareDateScope.beforeDateNum : 28,
                        "afterDateNum": that.data.condition.compareDateScope.afterDateNum ? that.data.condition.compareDateScope.afterDateNum : 30
                    },
                    "phoneModel" : that.data.condition.phoneModel,
                    "infoSource" : that.data.condition.infoSource,
                    "cptStyId": ""
                };
                that._createComponent(queryOptions,that.step);
            });

            /*切换构件tab*/
            that.$element.find($(".phoneModel")).on("click",function () {
                $(this).addClass("tabSelected");
                $(this).siblings().removeClass("tabSelected");
                var index = $(this).attr("index");
                var phoneId = that.data.condition.phoneModel[index].id;
                var selectData = that.data.result.volumeData[phoneId];
                var selectData_sum = [],
                    selectData_positive = [],
                    selectData_negative = [];
                if(selectData){
                    selectData_sum.push(selectData.sum);
                    selectData_positive.push(selectData.positive);
                    selectData_negative.push(selectData.negative);
                }

                if(index!=that.index){
                    that.index = index;
                    that.option.series =  [
                        {
                            name:'声量总量',
                            type:'line',
                            // stack: '总量',
                            data: selectData_sum[0]
                        },
                        {
                            name:'正面总量',
                            type:'line',
                            // stack: '总量',
                            data: selectData_positive[0]
                        },
                        {
                            name:'负面总量',
                            type:'line',
                            // stack: '总量',
                            data: selectData_negative[0]
                        }
                    ]
                    if (that.option && typeof that.option === "object") {
                        that.myChart.setOption(that.option);
                    }
                }
            });

            /*在已生成构件删除手机型号事件监听*/
            that.$element.find(".delShow").on("click",function () {
                if(that.data.condition.phoneModel.length<=1){
                    alert("型号手机不能为空");
                    return
                }
                that.addComponent.addDelectedIco(that.$element);
                if(that.$element.find(".deleteBtn").length>0){
                    that.$element.find(".deleteBtn").on("click",function () {
                        var index = $($(this).parent()).attr("index");
                        that.data.condition.phoneModel.splice(index,1);
                        that.$element.find(".tabContainer").remove();
                        that.$element.find(".echartsContainer").remove();
                        that.addComponent.addTab(that.$element, that.data.condition.phoneModel);
                        that.$element.find($(".tab").find($(".phoneModel:first-child"))).addClass("tabSelected");
                        that._updata();
                        that._bindEvent();
                    })
                }
            });

            /*在已生成构件添加手机型号事件监听*/
            that.$element.find(".addShow").on("click",function () {
                if(that.$element.find(".selectProduct_updata").length==0) {
                    that.addComponent.addProduct(that.$element);
                    that._getPhoneList();
                    that.$element.find(".addBtn_updata").on("click", function () {
                        that._addProduct();
                        if (that.data.condition.phoneModel.length == that.$element.find(".phoneModel").length) {
                            return
                        }
                        that.$element.find($(".tabContainer")).remove();
                        that.$element.find($(".echartsContainer")).remove();
                        that.addComponent.addTab(that.$element, that.data.condition.phoneModel);
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
                that._deleteComponent();
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