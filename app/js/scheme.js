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
						schemeData.push({
							"sltId" : r.data.id,
							"sltName" : r.data.sltName,
							"userId" : r.data.userId,
							"status" : r.data.status
						});
						window.currentSchemeId = r.data.id;

						that._renderPage();

					}
				});
			}
		},
		_renderPage : function(){
			var template = "",
				schemeData = window.schemeData,
				isActive;
			$("#add-scheme-popup").addClass("hide");
			$(".side a").removeClass("active");
			for(var i = 0; i < schemeData.length;i++){
				isActive = window.currentSchemeId ==schemeData[i]["sltId"] ? 'class="active"' : '';
				template += '<li><a '+ isActive +' href="views/scheme.html?id='+ schemeData[i]["sltId"] +'" target="mainIframe"><i class="icon iconfont icon-iconproject'+ (i+1) +'"></i><p>'+ schemeData[i]["sltName"] +'</p></a></li>';
			}
			$(".menu").html(template);
			document.getElementById("mainIframe").contentWindow.schemeDetail.getModuleList();
		},
		addModuleItem : function(){
			$("#addModuleBtn").parent().parent().append('<div class="fm-ipt"><input class="moduleName" type="text"></div>');
		},
		bindEvent : function(){
			var that = this;
			$("#addSchemeBtn").on("click",function(){
				$('#add-scheme-popup').removeClass("hide");
				var h = document.documentElement.clientHeight - $(".head").height();
				$("#add-scheme-popup").height(h);
				$("#add-scheme-popup .title").text(that.userInfo.realName);
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
			$(".prevBtn").on("click",function(){
				var menuTop = parseInt($(".menu").css("top"));
				var menuBoxHeight = $(".menuBox").height() + 2;
				var menuHeight = $(".menu").height();
				var itemHeight = $(".side a")[0].clientHeight;

				if(menuTop >= 0){
					$(".prevBtn").hide();
					return;
				}else {
					if(menuTop*-1 - menuBoxHeight <= 0) {
						var h = 0;
					}else{
						var h = (menuTop + menuBoxHeight) + "px";
					}
				}
				$(".menu").animate({top:h},'fast');
				$(".nextBtn").show();
			});
			$(".nextBtn").on("click",function(){
				var menuTop = parseInt($(".menu").css("top"));
				var menuBoxHeight = $(".menuBox").height() + 2;
				var menuHeight = $(".menu").height();
				var itemHeight = $(".side a")[0].clientHeight;

				if(menuTop*-1 + menuBoxHeight - menuHeight >= 0){
					$(".nextBtn").hide();
					return;
				}else {
					if(menuHeight - (menuTop*-1 + menuBoxHeight) <= menuBoxHeight) {
						var h = (menuBoxHeight - menuHeight) + "px";
					}else{
						var h = (menuTop - menuBoxHeight) + "px";
					}
				}
				$(".menu").animate({top:h},'fast');
				$(".prevBtn").show();
			});
		},
		setLayout : function(){
			var h = document.documentElement.clientHeight - $(".head").height();
			var menuBoxH = h - $(".componentBtn")[0].clientHeight - $(".logo").height();
			var menuH = $(".menu").height();
			var itemHeight = $(".side a")[0].clientHeight;
			$(".side").height(h);
			$("iframe").height(h-3);
			$(".menuBox").css("height",(menuBoxH + "px"));
			$(".menuBox").css("box-shadow","0 5px 5px 0 #333");
		},
		init : function(){
			var that = this;
			if(localStorage.userInfo){
				this.userInfo = JSON.parse(localStorage.userInfo);
				$(".realName").html(this.userInfo.realName);
				$(".email").html(this.userInfo.email);
			}
			this.bindEvent();
			this.setLayout();
			$(window).resize(function(){
				that.setLayout();
			});
		}
	}.init();


//})(window);