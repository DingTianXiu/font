//(function(){
	var options = {
		"name" : "新品声量情感分析",
		"data" : {
			"product_data" : [{"name":"锤子","url":"../img/5.jpg","date":"2016年10月28日"},{"name":"三星","url":"../img/5.jpg","date":"2016年10月28日"},{"name":"苹果","url":"../img/5.jpg","date":"2016年10月28日"}],
			"resource_data" : [{"name":"雅虎","url":"../img/yahoo.png"},{"name":"Skype","url":"../img/skype.png"}],
			"styleList_data" : [{"name":"component","url":"../img/2.jpg"},{"name":"component","url":"../img/2.jpg"}]
		}
	};

	var URL = {

	},
	componentList = [],
	moduleData  = [],
	componentData = [],
	schemeDetail = {
		createWidget : function(type,step){
			var that = this;
			var ele = $("<div class='component'></div>").appendTo(".componentList");
			var index = step ? (typeof step == "number" ? step : 0) : 0;
			if(type == "newPhoneQuery"){
				$(ele).newPhoneQuery({
					step: index,
					onComplete : function(data){
						componentList.push(data);
						that.setBtnStatus();
					}
				});
			}
		},
		_renderModule : function(){
			var template = "";
			for(var i = 0; i < moduleData.length;i++){
				template += '<li><a href="javascript:;" class="'+ (i==0 ? 'active' : '') +'">'+ moduleData[i]["modName"] +'</a></li>';
			}
			$(".moduleList").prepend(template);
			this._getComponentList();
		},
		_getComponentList:function(){
			$.ajaxJSON({
				name : "获取模块下的实例构件",
				url: URL.COMPONENT_LIST,
				data: {"moduleId" : moduleData[0]["id"]},
				type : 'post',
				success: function (r) {
					console.log(r);
					if(r.data.length > 0){
						componentData = r.data;
						that._renderComponent();
					}
				}
			});
		},
		_renderComponent : function(){

		},
		bindEvent : function(){
			var that = this;
			$("#addWidgetBtn").on("click",function(){
				openComponentDialog();
			});
			$(".addModuleBtn").on("click",function () {
				var ele = $(".componentList");
				ele.newAffectionAnalysed(ele,options);
			})
		},
		setBtnStatus : function(){
			if(componentList.length > 0){
				$("#addWidgetBtn").css("display","inline-block");
			}
		},
		init : function(){
			var that = this;
			this.bindEvent();
			//getModuleList();
		}
	},
	openComponentDialog = function(){
		var that = this;
		var ele = $("<div class='widget-popup'></div>").appendTo(".componentList");
		var w = $(ele).widgetPicker({
			onSelect : function(type){
				schemeDetail.createWidget(type);
			}
		});

	},
	getModuleList = function(schemeId){
		schemeId = schemeId ? schemeId : $.getQueryParams()["id"];
		//获取模块列表
		$.ajaxJSON({
			name: '获取模块列表',
			url: URL.MODULE_LIST,
			data: {"sltId":schemeId},
			type : 'post',
			success: function (r) {
				console.log(r);
				if(r.data.length > 0){
					moduleData = r.data;
					schemeDetail._renderModule();
				}
			}
		});
	};
	schemeDetail.init();
//})(window);