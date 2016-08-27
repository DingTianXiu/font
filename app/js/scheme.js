//(function(){
	schemeData = [];
	currentSchemeId = 0;
	scheme = {
		validate : function(){
			return true;
		},
		addScheme : function(){
			var that = this;
			if(this.validate()){
				var param = {};
				param["userId"] = this.userInfo.userId;
				$("#add-scheme-popup input:text").each(function(i){
					var name = "";
					if(i == 0){
						name = $(this).attr("name");
						param[name] = $(this).val();
					}else if(i > 0){
						name = "modules[" + (i-1) + "].modName";
						param[name] = $(this).val();
					}
				});
				$.ajaxJSON({
					name: '新建方案',
					url: URL.CREATE_SCHEME,
					data: param,
					success: function (r) {
						schemeData.push(r.data);
						that._renderPage();
						$("#add-scheme-popup").addClass("hide");
						console.log(document.getElementById("mainIframe").contentWindow)
						document.getElementById("mainIframe").contentWindow.openComponentDialog();
					}
				});

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
			$(".side").delegate("a","click",function(){
				$(".side a").removeClass("active");
				$(this).addClass("active");
				currentSchemeId = $(this).attr("href").split("=")[1];
				if($("#add-scheme-popup").is(":visible") && $(this).attr("id") != "addSchemeBtn"){
					$('#add-scheme-popup').addClass("hide");
				}
			});
			// $(".realName").on("click",function (e) {
			// 	$(".personalDisplay").removeClass("personalDisplayNone");
			// });
            //
			// $(".personalDisplay").on("click", function(e){
			// 	e.stopPropagation();
			// });
			// $(document).one("click", function(e){
			// 	console.log($(e.target).parents(".personal").children(".personalDisplay"));
            //
			// });
			$(".realName").on("click", function(e){
				if($(".personalDisplay").is(":hidden")){
					$(".personalDisplay").show();
				}else{
					$(".personalDisplay").hide();
				}
				e.stopPropagation();
			});
			$(document).on("click", function(){
				$(".personalDisplay").hide();
			});

			var iframeEle = $("#mainIframe")[0].contentWindow;
			$(iframeEle).on("click",function () {
				$(".personalDisplay").hide();
			});
			$(".personalDisplay").on("click", function(e){
				e.stopPropagation();
			});
		},
		setLayout : function(){
			var h = document.documentElement.clientHeight;
			$(".side").height(h);
			$("iframe").height(h-3);
		},
		init : function(){
			var that = this;
			if(localStorage.userInfo){
				this.userInfo = JSON.parse(localStorage.userInfo);
				console.log(this.userInfo);
				$(".realName").html(this.userInfo.realName);
				$(".email").html(this.userInfo.email);
			}
			this.bindEvent();
			this.setLayout();
			$(window).resize(function(){
				that.setLayout();
			});
			$(".personalDisplay").hide();
		}
	}.init();


//})(window);