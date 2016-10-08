 $(function(){
	var newPhoAddComp = function(element,options){
        this.step = options.step;
		this.data = {
            "title":"新品声量对比（监测）",
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
            "related" : [],
        };
        this.$element = $(element);
        if(options.onComplete){
            if(typeof options.onComplete == "function"){
                this._onComplete = options.onComplete;
            }
        };
        if(options.onUpdateAttr){
            if(typeof options.onUpdateAttr == "function"){
                this._onUpdateAttr = options.onUpdateAttr;
            }
        };
        if(options.onRelatedWidget){
            if(typeof options.onRelatedWidget == "function"){
                this._onRelatedWidget = options.onRelatedWidget;
            }
        };
        this._init(element,options);
	};

	newPhoAddComp.prototype = {
        constructor : newPhoAddComp,
        _init : function(element,options){
            if(this.step == 0){
                this._renderCondition();
            }else{
                this._getAttr();
            }
            this._bindEvent();
        },
        //事件绑定
        _bindEvent : function(){
			var that = this;
        	this.$element.on('click','.configBtn',function(){
                // that._initConfigSync($(this));
				that._initConfigSync($(this));
			});
			this.$element.on("click",".btnCompare",function(){
                that._createWidget();
            });
            this.$element.on("click",".legendBtn",function(){
                that._switchLegendBtn($(this));
            });
            this.$element.on("click",".relatedBtn",function(){
                var param = {
                    baseCptId: $(this).attr("baseCptId"),
                    cptKey: $(this).attr("type"),
                    conCptInstId : that.data.condition.cptInstId
                };
                that._onRelatedWidget(param);
            });
            this.$element.on("click",".addLegendBtn",function(){
                that._openPhoneDialog();
                that._getPhoneList();
            });
            this.$element.on("click",".addBtn_updata",function () {
                that._addProduct();
                if(that.data.condition.phoneModel.value.length == that.$element.find(".phoneModel").length){
                    return;
                }
                that.$element.find($(".legend").find($(".legendBtn:first-child"))).addClass("active");
                that._updatePhoneModel();
            });
            this.$element.on("click",".delLegendBtn",function(){
                that.$element.find(".legendBtn").find("i").show();
            });
            this.$element.on("click",".delLegendIcon",function(){
               that._delPhoneModel($(this));
            });
        },
        _renderResult : function(){
            var that = this;
            var source = $("#addPhoneCompent1").html();
            var template = Handlebars.compile(source);
            var html = template(this.data);
            this.$element.html(html).attr("id", that.data.condition.cptInstId);
            this.$element.find(".dateBox").datePicker({
                beforeDateNum : that.data.condition.compareDateScope.value["beforeDateNum"]*-1,
                afterDateNum : that.data.condition.compareDateScope.value["afterDateNum"],
                onSaveDate : function(beforeDateNum,afterDateNum){
                    that._updateDate(beforeDateNum,afterDateNum);
                }
            });
            this.$second = this.$element.find(".second");
            this.$legend = $("<div class='legend'></div>").prependTo(this.$second);
            var tpl = "";
            for(var i = 0; i < this.data.condition.phoneModel.value.length;i++){
                var item = this.data.condition.phoneModel.value[i];
                tpl += "<a href='javascript:;' class='legendBtn' modelCode='"+ item.id +"'>"+ item.brandName + " " + item.modelName +"<i class='icon iconfont icon-iconclouse delLegendIcon'></i></a>";
            }
            this.$legend.html(tpl);
            this.$addBtn = $("<div class='addShowBtnContainer'><a href='javascript:;' class='addBtn addLegendBtn'><i class='icon iconfont icon-iconadd'></i></a></div>").appendTo(this.$legend);
            this.delBtn = $("<a href='javascript:;' class='delBtn delLegendBtn'><i class='icon iconfont icon-icondel'></i></a>").appendTo(this.$legend);
            this.$hrLline = $("<hr class='hrLine'>").appendTo(this.$legend);
            if(!this.data.result) return;
            var defaultModelCode = this.$legend.find(".legendBtn").eq(0).attr("modelCode");
            this._renderChart(that.data.result.volumeData[defaultModelCode]);
            // this._renderChart(that.data.result.volumeData[defaultModelCode]);
            this.$legend.find(".legendBtn").eq(0).addClass("active");
        },
        //曲线图
        _renderChart : function(data){
            if(!data){
                this.$element.find(".lineChart").html("");
                return;
            }
            var xList = [],
                seriesList = [],
                data = [];
            var dom = document.getElementById("containerChart1");
            var lineChart = echarts.init(dom);
            for(var i = 0; i < data.length;i++){
                xList.push(data[i]);
                // negativeList.push(data[i].result.negative);
                // neutralList.push(data[i].result.neutral);
                // sumList.push(data[i].result.sum);
            };
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
            var option = {
                color : ['#5f97fb','#87b1fc','#afcbfd'],
                tooltip : {
                    trigger: 'axis',
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
                        show:true,
                        lineStyle: {     
                            color: ['#ddd'],
                            width: 1,
                            type: 'solid'
                        }
                    }
                },
                series: [
                    // {data : negativeList},
                    // {data : neutralList},
                    // {data : sumList}
                    {name:1,data:data.data}
                ]
            };
            var lineChart = echarts.init(this.$element.find(".lineChart")[0]);
            lineChart.setOption(option);
            // var myChart = echarts.init(document.getElementById('containerChart1'));
            // if (option && typeof option === "object") {
            //     myChart.setOption(option, true);
            // }
            // myChart.setOption(option);
        },
        //组件内tab切换
        _switchLegendBtn : function($ele){
            var code = $ele.attr("modelCode");
            $ele.addClass("active");
            $ele.siblings().removeClass("active");
            this._renderChart(this.data.result.volumeData[code]);
            // this._renderChart(this.data.result.volumeData[code]);
        },
        //更改时间 重新加载结果
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
                    that.data.result = r.data.cptData;
                    that._renderResult();
                }
            });
        },
        //获取时间列表
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
        //获取手机型号列表
        _phoneInfo :function(phoneModelValue){
            var _this = this;
		    var $phoneList = $(".phoneList"),
				$btnAddPhone = $(".tarPro .btnAdd"),
				$phoBraVal = $("#phoneBrand").val(),
				$phoModVal = $("#phoneModel").val(),
				$phoBrand = $("#phoneBrand select").find("option:selected").text(),
				$phoModel = $("#phoneModel select").find("option:selected").text(),
				$btnDele = $(".phoneList .tarProWidth .btnDelect");
			//手机品牌
			$.ajaxJSON({
				name : "手机品牌、型号",
				url: URL.GET_PHONE_LIST,
				data: {"industry" : "mobile"},
				type : 'get',
				iframe : true,
				success: function (i) {
					if(phoneModelValue) {
                        _this.$element.find(".proContainer").selectorPlusPro({"data": i.data, "phoneModel": phoneModelValue});
                    }else{
                        _this.$element.find(".proContainer").selectorPlusPro({"data": i.data});
                    }
				}
			});
        },
        //获取构件实例属性
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
        //或缺信息来源
        _getInfoSource : function(){
            var that = this;
            $.ajaxJSON({
                name : "信息来源",
                url : URL.GET_SOURCE_DATA,
                data : {},
                type : 'get',
                iframe : true,
                success : function(i) {
                    that.$element.find(".infoSource").selectorPlusSource({"data":i.data});
                }
            });
        },
        //step2弹框 - 添加手机品牌及型号
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
            }
        },
        //step2 - 添加手机信息
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
        //新建组件验证
        _createWidget : function(){
			var params = this.data.condition;
            var phoneModel = this.$element.find(".proContainer").selectorPlusPro("getData");
            var infoSource = this.$element.find(".infoSource").selectorPlusSource("getData");
            if(phoneModel.length == 0){
                $.msg("不选择品牌就想添加数据？哪有那么好的事情");
                $('.ui-select-button').css('border','1px solid #f25e61');
                return;
            }
            if(infoSource.length == 0){
                $.msg("信息来源不添加哪来的数据");
                $('.ui-select-button').css('border','1px solid #f25e61');
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
                        "cptKey" : "phoneReleaseVolumeCompareCpt"
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
        //更新实例属性
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
        //
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
        //获取关联组件
        _getAttr : function(){
        	var that = this;
            var param = {"cptInstId" : this.data.condition.cptInstId};
            $.ajaxJSON({
                name: '获取构件的关联构件',
                url: URL.GET_REL_CPT,
                data: {baseCptId: that.data.condition.baseCptId},
                iframe:true,
                success: function (relData) {
                    // that.data.related = relData.data;
                    that._filterRelData(that.data.condition.baseCptId,relData.data);
                    that._getData();
                }
            });
        },
        //设置属性实例同步信息
        _initConfigSync : function($ele){
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
        //删除构件
        _delCpt : function(){
            var that = this;
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
        },
        //构件内删除手机信息
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
        _initSlider : function($ele){
            var that = this;
            $ele.slider({
                range: true,
                min: -90,
                max: 30,
                values: [that.data.condition.compareDateScope.value["beforeDateNum"]*-1 , that.data.condition.compareDateScope.value["afterDateNum"] ],
                slide: function( event, ui ) {
                    that.data.condition.compareDateScope.value["beforeDateNum"] = ui.values[ 0 ] * -1;
                    that.data.condition.compareDateScope.value["afterDateNum"] = ui.values[ 1 ];
                }
            });
        },
        //获取关联构件实例属性
        _renderCondition : function(){
            var that = this,
            	source = $("#addPhoneCompent0").html(),
            	template = Handlebars.compile(source),
            	html = template(this.data);
            // $('.proContainer').html(html);
            this.$element.html(html);
            if(that.data.condition.conCptInstId) {
                $.ajaxJSON({
                    name: '获取关联构件实例属性',
                    url: URL.GET_CPTINST_ATTR,
                    data: {"cptInstId": that.data.condition.conCptInstId},
                    iframe: true,
                    success: function (r) {
                        that._phoneInfo(r.data.phoneModel.value);
                        that.data.condition.phoneModel = r.data.phoneModel;
                    }
                });
            }else{
                that._phoneInfo;
            };
            this._getInfoSource();
            this._initSlider(this.$element.find(".firstMultiAttr").find(".sliderBox"));
        },
       	getData : function(){
          this._getData();
        },
        _close : function(){
            this.$element.remove();
        }
	};
	$.fn.newPhoAddComp = function(option, value) {
		var methodReturn;
		var $set = this.each(function() {
			var $this = $(this),
			    data = $this.data('newPhoAddComp'),
			    options = typeof option === 'object' && option;
			if (!data) {
				 $this.data('newPhoAddComp', (data = new newPhoAddComp(this, options)));
			}
			if (typeof option === 'string') {
				 methodReturn = data[option](value);
			}
		});
		return (methodReturn === undefined) ? $set : methodReturn;
	};
 	$.fn.newPhoAddComp.Constructor = newPhoAddComp;

 })