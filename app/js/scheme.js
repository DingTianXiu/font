(function(){
	var URL = {

	},
	schemeData = [];
	scheme = {
		getParams : function(){
			var params = $(".header .account").f2j();
			this.$m.find(".date").each(function(){
				if (this.value) {
					params[this.name] = $(this).datetimepicker("getDate").getTime();
				}
			});
			return params;
		},
		getSchemeList : function(data){
			//$.ajaxJSON({
			//	name: '',
			//	url: URL.GET_AREA_INFO,
			//	data: {},
			//	success: function (data) {
			//
			//	}
			//});
			if(data){
				schemeData.push({"name":data[0],"id":""});
			}
			var template = "";
			for(var i = 0; i < schemeData.length;i++){
				template += '<li><a href="views/scheme.html?id='+ schemeData[i]["id"] +'" target="mainIframe">'+ schemeData[i]["name"] +'</a></li>';
			}
			$(".menu").html(template);
		},
		getModuleList : function(data){

		},
		validate : function(){
			return true;
		},

		addScheme : function(){
			if(this.validate()){
				var data = [];
				$("#add-scheme-popup input:text").each(function(i){
					data.push($(this).eq(i).val());
				});
				//$.ajaxJSON({
				//	name: '',
				//	url: URL.GET_AREA_INFO,
				//	data: {},
				//	success: function (data) {
                //
				//	}
				//});
				this.getSchemeList(data);
				this.getModuleList(data);
				$("#add-scheme-popup").addClass("hide");
				document.getElementById("mainIframe").contentWindow.openComponentDialog();
			}
		},
		addModuleItem : function(){
			$("#addModuleBtn").parent().parent().append('<div class="fm-ipt"><input class="moduleName" type="text"></div>');
		},
		bindEvent : function(){
			var that = this;
			$("#addSchemeBtn").on("click",function(){
				$('#add-scheme-popup').removeClass("hide");
			});
			$("#addModuleBtn").on("click",function(){
				that.addModuleItem();
			});
			$("#confirm-btn").on("click",function(){
				that.addScheme();
			});

		},
		setLayout : function(){
			var h = document.documentElement.clientHeight;
			$(".side").height(h);
			$("iframe").height(h-3);
		},

		init : function(){
			var that = this;
			this.getSchemeList();
			this.getModuleList();
			this.bindEvent();
			this.setLayout();
			$(window).resize(function(){
				that.setLayout();
			});

			//$.ajaxJSON({
			//	name : '',
			//	url : URL.GET_AREA_INFO,
			//	data : {},
			//	success : function(data) {
			//		AREA_INFO = data.list;
			//		var area = {};
			//		for (var i in AREA_INFO) {
			//			area[i] = AREA_INFO[i]['value'];
			//		}
			//		$('#f-area').select('data',area);
			//		$('#f-area').select('refresh');
			//		_this.changeArea();
			//	}
			//});
		}
	}.init();


})(window);