/**
 * Created by dtx on 16/8/25.
 */

(function ($) {
    var NewAffectionAnalysed = function (element,options) {
        var that  = NewAffectionAnalysed.prototype;
        that.data = {
            "title" : "手机新品声量情感分析",
            "condition" : {
                "baseCptId" : options.baseCptId,  //基础构件ID
                "moduleId" : options.moduleId,    //模块ID
                "cptInstId" : options.cptInstId,   //新增构件实例ID
                "searchDateScope" : {
                    "beforeDateNum": options.beforeDateNum ? options.beforeDateNum : 28,
                    "afterDateNum": options.afterDateNum ? options.afterDateNum : 30
                }
            },
            "result" : {},
            "related" : []
        };
        that.$element = $(element);
        if(options && options.step){
            that.step = options.step;
        }else{
            that.step = 0;
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
        that._init(that.$element,options);
    };
    NewAffectionAnalysed.prototype = {
        Constructor : NewAffectionAnalysed,

        _createComponentEdit : function (element, options) {
            var that = this;
            var addComponent = element.editComponent(element, options);
            addComponent.addSelectProduct();
            that._getPhoneList(element);
            addComponent.addSelectResource();
            that._getSourceList();
            addComponent.addSelectTime();
            that._initSlider($("#addTime"));
            that._getStyleList(options);
            if(typeof options == "object"){
                if(options.phoneModel&&options.phoneModel.length>0){
                    addComponent.addProductList(options.phoneModel);
                }
                // if(options.data.resource_data){
                //     addComponent.addResourceList(options.data.resource_data);
                // }
            }
            return that.addComponent = addComponent
        },

        _createComponent : function (element, options ,step) {
            var that = this;
            if(step == 0){
                $.ajaxJSON({
                    name : "保存构建实例",
                    url: URL.CREATE_CPTINST,
                    data: JSON.stringify(options),
                    contentType : 'application/json; charset=UTF-8',
                    type : 'post',
                    iframe: true,
                    success: function (i) {
                        options.cptInstId = i.data.cptInstId;
                        that.addComponent.addTab($(element),options.phoneModel);
                        $($(element).find($(".tab")).find($(".phoneModel:first-child"))).addClass("tabSelected");
                        that._getData(element,options,that.addComponent);
                    }
                });
            }else {
                var addComponent = element.editComponent(element, options);
                $.ajaxJSON({
                    name: "获取构件实例属性",
                    url: URL.GET_CPTINST_ATTR,
                    data: {"cptInstId" : options.cptInstId},
                    type : "post",
                    iframe : true,
                    success : function (data) {
                        options.phoneModel = data.data.phoneModel.value;
                        addComponent.addTab($(element),data.data.phoneModel.value);
                        $($(element).find($(".tab")).find($(".phoneModel:first-child"))).addClass("tabSelected");
                        that._getData(element,options,addComponent);
                    }
                });
            }
            $(element).find(".dateBox").datePicker({
                afterDateNum : options.afterDateNum,
                beforeDataNum : options.beforeDataNum,
                onSaveDate : function(beforeDateNum,afterDateNum){
                    options.beforeDataNum = beforeDateNum;
                    options.afterDateNum = afterDateNum;
                    that._updateAndGetData(beforeDateNum,afterDateNum);
                }
            });
        },

        _getData : function(element,options,editor,index){
            var that = this;
            if(options.step==0){
                $.ajaxJSON({
                    name: "获取构建实例数据",
                    url: URL.GET_CPTINST_ATTR,
                    data: {"cptInstId": options.conCptInstId},
                    type: 'post',
                    iframe: true,
                    success: function (data) {
                        options.phoneModel = [];
                        $.each(data.data.phoneModel.value,function (i) {
                            options.phoneModel.push(data.data.phoneModel.value[i]);
                        });
                        var editor= that._createComponentEdit(element, options);
                        that._bindEvent(options,element,editor);
                    }
                })
            }else{
                if(!index){
                    index = 0;
                }
                $.ajaxJSON({
                    name : "获取构建实例数据",
                    url: URL.GET_CPTINST_DATA,
                    data: {"cptInstId":options.cptInstId},
                    type : 'post',
                    iframe : true,
                    success: function (data) {
                        options.data = data.data;
                        var afterDateNum = data.data.afterDateNum,
                            beforeDataNum = -data.data.beforeDataNum;
                        options.afterDateNum = data.data.afterDateNum;
                        options.beforeDataNum = data.data.beforeDataNum;
                        var dateList = [];
                        for(var i=beforeDataNum;i<afterDateNum;i++){
                            dateList.push(i);
                        }
                        var phoneId = options.phoneModel[index].id;
                        var selectData = data.data.volumeData[phoneId];
                        editor.addEcharts(element,options);
                        var dom = document.getElementById(options.cptInstId);
                        var myChart = echarts.init(dom);
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
                            color: ["#f25e61","#7ecefd"],
                            series: [
                                {
                                    name:'声量总量',
                                    type:'line',
                                    // stack: '总量',
                                    data: selectData.sum
                                },
                                {
                                    name:'正面总量',
                                    type:'line',
                                    // stack: '总量',
                                    data: selectData.positive
                                },
                                {
                                    name:'负面总量',
                                    type:'line',
                                    // stack: '总量',
                                    data: selectData.negative
                                }
                            ]
                        };
                        options.myChart = myChart;
                        options.option = option;
                        if (option && typeof option === "object") {
                            myChart.setOption(option, true);
                            that._getRelatedComponent(editor,element,options);
                            that._bindEvent(options,element,editor)
                        }
                    }
                });
            }
        },

        _updata : function (editor,element,options) {
            var that = this;
            $.ajaxJSON({
                name : "更新实例属性",
                url: URL.UPDATE_GET_DATA,
                data: JSON.stringify(options),
                contentType : 'application/json; charset=UTF-8',
                type : 'post',
                iframe : true,
                success: function (data) {
                    options.data = data.data.cptData;
                    var afterDateNum = data.data.cptData.afterDateNum,
                        beforeDataNum = -data.data.cptData.beforeDataNum;
                    var dateList = [];
                    for(var i=beforeDataNum;i<afterDateNum;i++){
                        dateList.push(i);
                    }
                    var phoneId = options.phoneModel[0].id;
                    var selectData = data.data.cptData.volumeData[phoneId];
                    editor.addEcharts(element,options);
                    var dom = document.getElementById(options.cptInstId);
                    var myChart = echarts.init(dom);
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
                        color: ["#f25e61","#7ecefd"],
                        series: [
                            {
                                name:'声量总量',
                                type:'line',
                                // stack: '总量',
                                data: selectData.sum
                            },
                            {
                                name:'正面总量',
                                type:'line',
                                // stack: '总量',
                                data: selectData.positive
                            },
                            {
                                name:'负面总量',
                                type:'line',
                                // stack: '总量',
                                data: selectData.negative
                            }
                        ]
                    };
                    options.myChart = myChart;
                    options.option = option;
                    if (option && typeof option === "object") {
                        myChart.setOption(option, true);
                        that._getRelatedComponent(editor,element,options);
                    }
                }
            });
            that._bindEvent(options,element,editor)
        },

        _initSlider : function($ele){
            var that = this;
            $ele.slider({
                range: true,
                min: -90,
                max: 30,
                values: [that.data.condition.searchDateScope["beforeDateNum"]*-1 , that.data.condition.searchDateScope["afterDateNum"]*-1 ],
                slide: function( event, ui ) {
                    that.data.condition.searchDateScope["beforeDateNum"] = ui.values[ 0 ] * -1;
                    that.data.condition.searchDateScope["afterDateNum"] = ui.values[ 1 ] * -1;
                }
            });
        },

        _getPhoneList : function (element) {
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
                            $(element).find($(".brand")).select('data', [{text: "请选择", value: -1}]);
                            $(element).find($(".model")).select('data', [{text: "请选择", value: -1}]);
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
                            $(element).find($(".brand")).select('data', arr).select("trigger");
                            $(element).find($(".brand")).on("change", function () {
                                var val = $(this).val();
                                $(element).find($(".model")).select("destroy").select('data', modelsObj[val]);

                            });
                            $(element).find($(".brand")).trigger("change");
                        }
                    }
                })
        },

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

        _getStyleList : function (options) {
            var that = this;
            $.ajaxJSON({
                name : "构件样式列表",
                url: URL.GET_STYLE_LIST,
                data: {
                    "baseCptId" : options.baseCptId
                },
                type : 'post',
                iframe : true,
                success: function (i) {
                    if(i.data.length>0){
                        that.addComponent.addSelectStyle(i.data);
                    }
                }
            })
        },

        _getRelatedComponent : function (editor,element,options) {
            var that = this;
            $.ajaxJSON({
                name : "关联构建",
                url: URL.GET_REL_CPT,
                data: {
                    "baseCptId" : options.baseCptId
                },
                type : 'post',
                iframe : true,
                success: function (i) {
                    if(i.data.length>0){
                        editor.addRelateComponent(element,i.data);
                        that._bindEvent(options,element,editor);
                    }
                }
            })
        },

        _addProduct : function (editor,options) {
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
                            if(!options.phoneModel){
                                options.phoneModel = [];
                                options.phoneModel.push(model);
                            }else{
                                $.each(options.phoneModel,function (i) {
                                    if(options.phoneModel[i].id==model.id){
                                        alert("该型号手机已存在");
                                        return
                                    }
                                });
                                options.phoneModel.push(model);
                            }
                        }
                    })
                }
            });
        },

        _addResource : function (editor, options) {
            var that = this;
            var srcKey = $("#resource").val();
            $.each(that.resourceData,function (i) {
                if(that.resourceData[i].srcKey == srcKey){
                    var resource = {
                        "srcName" : that.resourceData[i].srcName,
                        "srcKey" : that.resourceData[i].srcKey
                    };
                    if(!options.infoSource){
                        options.infoSource = [];
                    }
                    options.infoSource.push(resource);
                }
            });
            editor.addResourceList(options.infoSource);
            that._bindEvent(options,element,editor);
        },

        _bindEvent : function (options,element,editor) {
            var that = this;

            $("#addProductBtn").unbind("click");
            $("#addResourceBtn").unbind("click");
            $(".generateBtn button").unbind("click");

            $("#addProductBtn").on("click",function () {
                that._addProduct(editor,options);
                editor.addProductList(options.phoneModel);
                that._bindEvent(options,element,editor);
            });

            $(".deleteProductBtn").on("click",function () {
                var index = $(this).parents("li").attr("index");
                options.phoneModel.splice(index,1);
                editor.addProductList(options.phoneModel);
                that._bindEvent(options,element,editor);
            });

            $("#addResourceBtn").on("click",function () {
               that._addResource(editor,options);
            });

            $(".deleteResourceBtn").on("click",function () {
                var index = $(this).parents("li").attr("index");
                options.infoSource.splice(index,1);
                editor.addResourceList(options.infoSource);
                that._bindEvent(options,element,editor);
            });

            $(".styleImg").on("click",function () {
                $(this).parents("li").addClass("selectStyle");
                $(this).parents("li").siblings().removeClass("selectStyle");
            });

            $(".generateBtn button").on("click",function () {
                var queryOptions = {
                    "baseCptId" : options.baseCptId,  //基础构件ID
                    "moduleId" : options.moduleId,    //模块ID
                    "conCptInstId" : options.cptInstId,   //新增构件实例ID
                    "compareDateScope" : {
                        "beforeDateNum": options.beforeDateNum ? options.beforeDateNum : 28,
                        "afterDateNum": options.afterDateNum ? options.afterDateNum : 30
                    },
                    "phoneModel" : options.phoneModel,
                    "infoSource" : options.infoSource,
                    "cptStyId": ""
                };
                that._createComponent(that.$element,queryOptions,options.step);
            });

            $($(element).find($(".phoneModel"))).on("click",function () {
                $(this).addClass("tabSelected");
                $(this).siblings().removeClass("tabSelected");
                var index = $(this).attr("index");
                var phoneId = options.phoneModel[index].id;
                var resetData = options.data.volumeData[phoneId];
                if(resetData.sum!=options.option.series[0].data){
                    options.option.series =  [
                        {
                            name:'声量总量',
                            type:'line',
                            // stack: '总量',
                            data: resetData.sum
                        },
                        {
                            name:'正面总量',
                            type:'line',
                            // stack: '总量',
                            data: resetData.positive
                        },
                        {
                            name:'负面总量',
                            type:'line',
                            // stack: '总量',
                            data: resetData.negative
                        }
                    ]
                    if (options.option && typeof options.option === "object") {
                        options.myChart.setOption(options.option);
                    }
                }
            });

            $($(element).find(".delShow")).on("click",function () {
                editor.addDelectedIco(element);
                if($(element).find(".deleteBtn").length>0){
                    $($(element).find(".deleteBtn")).on("click",function () {
                        var index = $($(this).parent()).attr("index");
                        if(options.phoneModel.length<=1){
                            alert("型号手机不能为空");
                            return
                        }
                        options.phoneModel.splice(index,1);
                        var queryOptions = {
                            "baseCptId" : options.baseCptId,  //基础构件ID
                            "moduleId" : options.moduleId,    //模块ID
                            "cptInstId" : options.cptInstId,   //新增构件实例ID
                            "compareDateScope" : {
                                "beforeDateNum": options.beforeDateNum ? options.beforeDateNum : 28,
                                "afterDateNum": options.afterDateNum ? options.afterDateNum : 30
                            },
                            "phoneModel" : options.phoneModel,
                            "infoSource" : options.infoSource,
                            "cptStyId": ""
                        };
                        $(element).find($(".tabContainer")).remove();
                        $(element).find($(".echartsContainer")).remove();
                        $(element).find($(".relateCompanentContainer")).remove();
                        editor.addTab($(element),options.phoneModel);
                        $($(element).find($(".tab")).find($(".phoneModel:first-child"))).addClass("tabSelected");
                        that._updata(editor,element,queryOptions);
                    })
                }
            });

            $($(element).find(".addShow")).on("click",function () {
                editor.addProduct(element);
                that._getPhoneList(element);
                $(element).find(".addBtn_updata").on("click",function () {
                    that._addProduct(editor,options);
                    if(options.phoneModel.length == $(element).find(".phoneModel").length){
                        return
                    }
                    var queryOptions = {
                        "baseCptId" : options.baseCptId,  //基础构件ID
                        "moduleId" : options.moduleId,    //模块ID
                        "cptInstId" : options.cptInstId,   //新增构件实例ID
                        "compareDateScope" : {
                            "beforeDateNum": options.beforeDateNum ? options.beforeDateNum : 28,
                            "afterDateNum": options.afterDateNum ? options.afterDateNum : 30
                        },
                        "phoneModel" : options.phoneModel,
                        "infoSource" : options.infoSource,
                        "cptStyId": ""
                    };
                    $(element).find($(".tabContainer")).remove();
                    $(element).find($(".echartsContainer")).remove();
                    $(element).find($(".relateCompanentContainer")).remove();
                    editor.addTab($(element),options.phoneModel);
                    $($(element).find($(".tab")).find($(".phoneModel:first-child"))).addClass("tabSelected");
                    that._updata(editor,element,queryOptions);
                    })
            });

            $($(element).find(".creatRelateComponentBtn")).on("click",function () {
                var param = {
                    baseCptId: $(this).attr("baseCptId"),
                    cptKey: $(this).attr("type"),
                    conCptInstId : that.data.condition.cptInstId
                };
                that._onRelatedWidget(param);
            })
        },

        _init : function (element, options) {
            var that = this;
            if(this.step==0){
                if(options.conCptInstId){
                    this._getData(element,options);
                }else{
                    var editor= that._createComponentEdit(element, options);
                    this._bindEvent(options,element,editor);
                }
            }else{
                this._createComponent(element, options);
                this._bindEvent(options,element,editor);
            }
        }
    };

    $.fn.newAffectionAnalysed = NewAffectionAnalysed;
})(jQuery);