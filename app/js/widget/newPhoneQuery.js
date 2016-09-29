(function($) {
    var NewPhoneQuery = function(element,options){
        this.step = options.step;
        this.data = {
            "title" : "手机新品发布监测",
            "condition" : {
                "baseCptId" : options.baseCptId,
                "moduleId" : options.moduleId,
                "cptInstId" : options.cptInstId,
                "searchDateScope" : {
                    "beforeDateNum": options.beforeDateNum ? options.beforeDateNum : 28,
                    "afterDateNum": options.afterDateNum ? options.afterDateNum : 30
                }
            },
            "result" : {},
            "related" : []
        };
        this.selectedIdStr = "";
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
    NewPhoneQuery.prototype = {
        constructor : NewPhoneQuery,
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
            this.$element.delegate(".configBtn","click",function(){
             //设置构件同步关系
               that._initConfigSync();
           });
            this.$element.delegate("li","click",function(){
                that._updatePhoneModel($(this));
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
                data: {"cptInstId": that.data.condition.cptInstId},
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
                max: 30,
                values: [that.data.condition.searchDateScope["beforeDateNum"]*-1 , that.data.condition.searchDateScope["afterDateNum"] ],
                slide: function( event, ui ) {
                    that.data.condition.searchDateScope["beforeDateNum"] = ui.values[ 0 ] * -1;
                    that.data.condition.searchDateScope["afterDateNum"] = ui.values[ 1 ];
                }
            });
        },
        _renderCondition : function(){
            var that = this;
            var source = $("#newPhoneQuery0").html();
            var template = Handlebars.compile(source);
            var html = template(this.data);
            this.$element.html(html);
            this._initSlider(this.$element.find(".first").find(".sliderBox"));
            $(".nextStep").on("click",function(){
                that._createWidget();
            });

        },
        _createWidget : function(){
            var params = this.data.condition;
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
                        "cptKey" : "phoneReleaseMonitorCpt"
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
        _renderResult : function(){
            var that = this;
            var source = $("#newPhoneQuery1").html();
            var template = Handlebars.compile(source);
            for(var i in this.data.result){
                for(var j = 0; j < this.data.result[i].length;j++){
                    this.data.result[i][j]["selected"] = that.selectedIdStr.indexOf(this.data.result[i][j].id) > -1 ? "selected" : "";
                }
            }
            var html = template(this.data);
            this.$element.html(html).attr("id", that.data.condition.cptInstId);
            this.$element.find(".dateBox").datePicker({
                beforeDateNum : that.data.condition.searchDateScope["beforeDateNum"],
                afterDateNum : that.data.condition.searchDateScope["afterDateNum"],
                onSaveDate : function(beforeDateNum,afterDateNum){
                    that.data.condition.searchDateScope.beforeDateNum = beforeDateNum;
                    that.data.condition.searchDateScope.afterDateNum = afterDateNum;

                    that._updateDate(beforeDateNum,afterDateNum);
                }
            });
        },
        _getAttr : function(){
            var that = this;
            var param = {"cptInstId" : this.data.condition.cptInstId};
            $.ajaxJSON({
                name: '获取构件实例属性',
                url: URL.GET_CPTINST_ATTR,
                data: param,
                iframe: true,
                success: function (r) {
                    var selectedData = [];
                    var list = r.data.phoneModel.value;
                    if(list) {
                        for (var i = 0; i < list.length; i++) {
                            selectedData.push(list[i].id);
                        }
                        that.selectedIdStr = selectedData.join(",");
                    }else{
                       that.selectedIdStr = "";
                    }
                    $.ajaxJSON({
                        name: '获取构件的关联构件',
                        url: URL.GET_REL_CPT,
                        data: {baseCptId: that.data.condition.baseCptId},
                        iframe:true,
                        success: function (relData) {
                            that._filterRelData(that.data.condition.baseCptId,relData.data);
                            that.data.condition["searchDateScope"] = r.data.searchDateScope.value;
                            that._getData();
                        }
                    });
                }
            });
        },
        _getData : function(){
            var that = this;
            var param = {"cptInstId" : this.data.condition.cptInstId};
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
        },
        _updatePhoneModel : function($ele){
            var that = this;
            var param = {
                "cptInstId" : this.data.condition.cptInstId,
                "phoneModel" : []
            };
            $ele.find(".checkBoxIcon").toggleClass("selected");
            this.$element.find(".phoneList").find(".selected").each(function(){
                var index = $(this).parents("li").attr("index");
                var type = $(this).parents("li").attr("type");
                var item = that.data.result[type][index];
                param["phoneModel"].push({
                    "id" : item.id,
                    "brandName" : item.brandName,
                    "modelName" : item.modelName,
                    "releaseDate" : item.releaseDate,
                    "picUrl" : item.picUrl
                });
            });

            //console.log(JSON.stringify(param));
            $.ajaxJSON({
                url: URL.UPDATE_CPTiNST_ATTR,
                data : param,
                data : JSON.stringify(param),
                contentType : 'application/json; charset=UTF-8',
                iframe:true,
                success:function(r){
                    that._onUpdateAttr(r.data.syncCptInstIdList);

                }
            });
        },
        _updateDate : function(beforeDateNum,afterDateNum){
            var that = this;
            var param = {
                "cptInstId" : that.data.condition.cptInstId,
                "searchDateScope" : {
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
                    //that._onComplete(that.data);
                }
            });
        },
        _close : function(){
            this.$element.remove();
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
    $.fn.newPhoneQuery = function(option, value) {
        var methodReturn;
        var $set = this.each(function() {
            var $this = $(this);
            var data = $this.data('newPhoneQuery');
            var options = typeof option === 'object' && option;
            if (!data) {
                $this.data('newPhoneQuery', (data = new NewPhoneQuery(this, options)));
            }
            if (typeof option === 'string') {
                methodReturn = data[option](value);
            }
        });
        return (methodReturn === undefined) ? $set : methodReturn;
    };
    $.fn.newPhoneQuery.Constructor = NewPhoneQuery;
})(jQuery);

