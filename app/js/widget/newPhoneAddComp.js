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
                    "beforeDateNum": options.beforeDateNum ? options.beforeDateNum : 28,
                    "afterDateNum": options.afterDateNum ? options.afterDateNum : 30
                }
            },
            "result" : {},
            "related" : [],
			// "titleTarProd":"选择目标产品",
			// "chooBrand":"选择品牌",
			// "chooType":"选择型号",
			// "brands" :[]
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

	// var phoSelect = function(element,options){
	// 	this.$phoselect = $(element);
	// 	this.$element = $('<div class="chooBrand">');
	// 	this.$element.append(this.$phoselect);
	// 	this.options = $.extend({}, $.fn.select.defaults, options);
	// 	this.$button = $('<a href="javascript:;" class="btnAdd iconfont">&#xe602;</a>');
	// 	this.$button.append(this.$element);
		
	// 	this.init();
	// };
	// phoSelect.prototype = {
	// 	constructor:phoSelect,
	// 	destroy:function(){
	// 		this.$phoselect.removeData('select');
	// 		this.$element.replaceWith(this.$select);
	// 	}
	// };
	// var phoneList = function(element){
	// 	this.$phoList = $(element);
	// 	this.element = $('<div class="phoneList">');
	// 	this.element.insterAfter('$(".chooTarPro")');
	// }
	/** end **/


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
        _bindEvent : function(){
			var that = this;
        	this.$element.on('click','.configBtn',function(){
				that._deleComponent();
			});
			// this.$element.on('change','.btnCompare',function(){
			// 	that._phoneInfo();
			// });
			this.$element.on("click",".btnCompare",function(){
                that._createWidget();
            });
            this.$element.on("click",".legendBtn",function(){
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
            this.$element.on("click",".addBtn",function () {
                that._addPhoneList();
            });
        },
        _renderResult : function(){
            var that = this;
            var source = $("#addPhoneCompent1").html();
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
            this.$hrLline = $("<hr class='hrLine'>").appendTo(this.$legend);
            if(!this.data.result) return;
            var defaultModelCode = this.$legend.find(".legendBtn").eq(0).attr("modelCode");
            this._renderChart(that.data.result.volumeData[defaultModelCode]);
            this.$legend.find(".legendBtn").eq(0).addClass("active");
        },
        _switchLegendBtn : function($ele){
            var code = $ele.attr("modelCode");
            // console.log(code);
            $ele.addClass("active");
            $ele.siblings().removeClass("active");
            this._renderChart(this.data.result.volumeData[code]);
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
                    that.data.result = r.data.cptData;
                    that._renderResult();
                    that._onComplete(that.data);
                }
            });
        },
        _phoneInfo :function(phoneModel){
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
					if(phoneModel) {
                        _this.$element.find(".proContraIn").selectorPlusPro({"data": i.data, "phoneModel": phoneModel});
                    }else{
                        _this.$element.find(".proContraIn").selectorPlusPro({"data": i.data});
                    }
					// if(i.data){
					// 	_this.data.brands = i.data.brands;
					//         _renderCondition = function(){
					//             var that = this,
					//             	source = $("#addPhoneCompent").html(),
					//             	template = Handlebars.compile(source),
					//             	html = template(this.data);
					//             $('.WraNewPro').removeClass('hide');
					//             $('.WraNewPro .proContraIn').html(html);
					          
					//         }
					//         that._getPhoneModel();
					// }

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
        /*step2添加手机型号*/
        _addPhoneList : function () {
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
                                    }else if(i == that.data.condition.phoneModel.length-1){
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
        _createWidget : function(){
			var params = this.data.condition;
            var phoneModel = this.$element.find(".proContraIn").selectorPlusPro("getData");
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
        _getAttr : function(){
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
        _deleComponent : function(){
            var that = this;
        	$.msg({
                type : "confirm",
                msg : "确认删除？",
                ok : function(){
                    $.ajaxJSON({
                        name: '删除已选的手机',
                        url: URL.DELETE_CPTINT,
                        data: {"cptInstId": that.data.condition.cptInstId},
                        iframe: true,
                        success: function (r) {
                            $.msg("删除成功");
                        }
                    });
                        return;
                }
            });
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
            var that = this,
            	source = $("#addPhoneCompent0").html(),
            	template = Handlebars.compile(source),
            	html = template(this.data);
            $('.proContraIn').html(html);
            this.$element.html(html);
            if(that.data.condition.conCptInstId) {
                $.ajaxJSON({
                    name: '获取关联构件实例属性',
                    url: URL.GET_CPTINST_ATTR,
                    data: {"cptInstId": that.data.condition.conCptInstId},
                    iframe: true,
                    success: function (r) {
                        that._phoneInfo(r.data.phoneModel.value);
                    }
                });
            }else{
                that._phoneInfo;
            };
            this._getInfoSource();
            this._initSlider(this.$element.find(".firstMultiAttr").find(".sliderBox"));
        },
		_renderChart : function(data){
            console.log(data);
            if(!data){
                this.$element.find(".lineChart").html("");
                return;
            }
            var xList = [],
                seriesList = [],
                negativeList = [],
                neutralList = [],
                sumList = [];
            var dom = document.getElementById("containerChart1");
            var myChart = echarts.init(dom);
            for(var i = 0; i < data.length;i++){
                xList.push(data[i].attr);
                negativeList.push(data[i].negative);
                neutralList.push(data[i].neutral);
                sumList.push(data[i].sum);
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
                   negativeList,neutralList,sumList
                ]
            };
            var myChart = echarts.init(document.getElementById('containerChart1'));
            // if (option && typeof option === "object") {
            //     myChart.setOption(option, true);
            // }
            console.log(option);    
            myChart.setOption(option);
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