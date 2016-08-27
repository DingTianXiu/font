//(function(){
	var options = {
		"name" : "新品声量情感分析",
		"data" : {
			"product_data" : [{"name":"锤子","url":"../img/5.jpg","date":"2016年10月28日"},{"name":"三星","url":"../img/5.jpg","date":"2016年10月28日"},{"name":"苹果","url":"../img/5.jpg","date":"2016年10月28日"}],
			"resource_data" : [{"name":"雅虎","url":"../img/yahoo.png"},{"name":"Skype","url":"../img/skype.png"}],
			"styleList_data" : [{"name":"component","url":"../img/2.jpg"},{"name":"component","url":"../img/2.jpg"}]
		}
	};


	componentList = [];
(function($){
	moduleData  = [],
	componentData = [],
	componentList = [],
	schemeDetail = {
		getSchemeList : function(){
			var that = this;
			$.ajaxJSON({
				name: '获取方案列表',
				url: URL.SOLUTION_LIST,
				data: {"userId" : that.userInfo.userId},
				type : 'post',
				iframe : true,
				success: function (r) {
					if(r.data.length > 0){
						parent.window.schemeData = r.data;
						parent.window.currentSchemeId = r.data[0]["id"];
						that._renderPage();
						that.getModuleList(r.data[0]["id"]);
					}
				}
			});
		},
		_renderPage : function(){
			var template = "",
				code = "&#xe60",
				schemeData = parent.window.schemeData,
				isActive;
			for(var i = 0; i < schemeData.length;i++){
				isActive = parent.window.currentSchemeId==schemeData[i]["id"] ? 'class="active"' : '';
				template += '<li><a '+ isActive +' href="views/scheme.html?id='+ schemeData[i]["id"] +'" target="mainIframe"><i class="icon iconfont icon-iconproject'+ (i+1) +'"></i><p>'+ schemeData[i]["sltName"] +'</p></a></li>';
			}
			$(".menu",parent.document).html(template);
		},
		getModuleList : function(schemeId){
			var that = this;
			//获取模块列表
			$.ajaxJSON({
				name: '获取模块列表',
				url: URL.MODULE_LIST,
				data: {"sltId":schemeId},
				type : 'post',
				iframe : true,
				success: function (r) {
					if(r.data.length > 0){
						moduleData = r.data;
						that.currentModuleId = moduleData[0]["id"];
						schemeDetail._renderModule();
					}
				}
			});
		},
		_renderModule : function(){
			var template = "",
				id = $.getQueryParams("id");
			for(var i = 0; i < moduleData.length;i++){
				template += '<li><a href="javascript:;" id="'+ moduleData[i]["id"] +'" class="'+ (i == 0 ? 'active' : '') +'">'+ moduleData[i]["modName"] +'</a></li>';
			}
			$(".moduleList").prepend(template);
			this._getComponentList();
		},
		_getComponentList:function(){
			var that = this;
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
			var item;
			//for(var i = 0; i < componentData.length;i++){
				item = componentData[0];
				this.createWidget(item,1);
			//}
		},
		bindEvent : function(){
			var that = this;
			$("#addWidgetBtn").on("click",function(){
				openComponentDialog();
			});
			$(".moduleList").delegate("a","click",function(){
				$(".moduleList a").removeClass("active");
				$(this).addClass("active");
				that.currentModuleId = $(this).attr("id");
			});
            $(".addModuleBtn").on("click",function () {
                var ele = $(".componentList");
                ele.newAffectionAnalysed(ele,options);
            })
		},
		createWidget : function(param,step){
			var that = this;
			var ele = $("<div class='component'></div>").appendTo(".componentList");
			var index = step ? (typeof step == "number" ? step : 0) : 0;
			if(param.instCptKey == "phoneReleaseMonitorCpt"){
				$(ele).newPhoneQuery({
					step: index,
					baseCptId : param.baseCptId,
					moduleId : that.currentModuleId,
					instCptId : param.instCptId ? param.instCptId : "",
					onComplete : function(data){
						componentList.push(data);
						that.setBtnStatus();
					}
				});
				console.log(componentList);
			}
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
			if(localStorage.userInfo){
				this.userInfo = JSON.parse(localStorage.userInfo);
			}else{
				parent.location.href = "/app/login.html";
			}
			if(parent.window.schemeData.length > 0){
				this.getModuleList(parent.window.currentSchemeId);
			}else {
				this.getSchemeList();
			}
		}
	},
	openComponentDialog = function(){
		var that = this;
		var ele = $("<div class='widgetPopup'></div>").appendTo(".componentList");
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
})(jQuery);