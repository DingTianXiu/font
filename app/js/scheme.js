(function(){
	var URL = {

	},
	scheme = {
		$m : $("#account"),
		getParams : function(){
			var params = $(".header .account").f2j();
			this.$m.find(".date").each(function(){
				if (this.value) {
					params[this.name] = $(this).datetimepicker("getDate").getTime();
				}
			});
			return params;
		},
		validate : function(){
			return true;
		},
		openComponentDialog : function(){},
		addScheme : function(){
			if(this.validate()){
				$("#addSchemeBtn").dialog("close");
				this.openComponentDialog();
			}

		},
		addModuleItem : function(){
			$('<p><input class="moduleName" type="text"></p>').insertBefore("#addModuleBtn");
		},
		bindEvent : function(){
			var that = this;
			$("#addSchemeBtn").on("click",function(){
				$('#goods-popup').dialog('open');
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
		initDialog : function(){
			$('#goods-popup').dialog({
				title : '华为技术有限公司',
				width : 780,
				autoOpen : false,
				resizable : false,
				close: function() {

				}
			});
		},
		init : function(){
			var that = this;

			this.initDialog();
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