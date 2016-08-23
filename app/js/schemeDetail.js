//(function(){
	var URL = {

	},
	componentList = [],
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
		bindEvent : function(){
			var that = this;
			$("#addWidgetBtn").on("click",function(){
				openComponentDialog();
			});
		},
		setBtnStatus : function(){
			if(componentList.length > 0){
				$("#addWidgetBtn").css("display","inline-block");
			}
		},
		init : function(){
			var that = this;
			this.bindEvent();
			//this.createWidget("newPhoneQuery",1);


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

	};
	schemeDetail.init();
//})(window);