<<<<<<< HEAD
//(function(){
	schemeData = [];
	currentSchemeId = 0;
	scheme = {
		validate : function(){
			return true;
		},
=======
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
		getSchemeList : function(){
			var that = this;
			$.ajaxJSON({
				name: '获取方案列表',
				url: URL.SOLUTION_LIST,
				data: {"userId" : that.userInfo.userId},
				success: function (r) {
					if(r.data.length > 0){
						schemeData = r.data;
						that._renderPage();
					}
				}
			});
		},
		_renderPage : function(){
			document.getElementById("mainIframe").contentWindow.getModuleList(schemeData[0].id);
			var template = "";
			for(var i = 0; i < schemeData.length;i++){
				template += '<li><a href="views/scheme.html?id='+ schemeData[i]["id"] +'" target="mainIframe">'+ schemeData[i]["name"] +'</a></li>';
			}
			$(".menu").html(template);
		},
		validate : function(){
			return true;
		},

>>>>>>> 23016f9123aaf4a1d48f5064d474e528fb1c3cfd
		addScheme : function(){
			var that = this;
			if(this.validate()){
				var param = {};
<<<<<<< HEAD
				param["userId"] = this.userInfo.userId;
=======
				param["userId"] = localStorage.userInfo.userId;
>>>>>>> 23016f9123aaf4a1d48f5064d474e528fb1c3cfd
				$("#add-scheme-popup input:text").each(function(i){
					var name = "";
					if(i == 0){
						name = $(this).attr("name");
						param[name] = $(this).val();
					}else if(i > 0){
<<<<<<< HEAD
						name = "modules[" + (i-1) + "].modName";
=======
						name = "modules[" + i + "]modName";
>>>>>>> 23016f9123aaf4a1d48f5064d474e528fb1c3cfd
						param[name] = $(this).val();
					}
				});
				$.ajaxJSON({
					name: '新建方案',
					url: URL.CREATE_SCHEME,
					data: param,
					success: function (r) {
						schemeData.push(r.data);
<<<<<<< HEAD
						that._renderPage();
						$("#add-scheme-popup").addClass("hide");
						console.log(document.getElementById("mainIframe").contentWindow)
						document.getElementById("mainIframe").contentWindow.openComponentDialog();
					}
				});

=======
					}
				});
				$("#add-scheme-popup").addClass("hide");
				document.getElementById("mainIframe").contentWindow.openComponentDialog();
>>>>>>> 23016f9123aaf4a1d48f5064d474e528fb1c3cfd
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
		},
		setLayout : function(){
			var h = document.documentElement.clientHeight;
			$(".side").height(h);
			$("iframe").height(h-3);
		},
<<<<<<< HEAD
		init : function(){
			var that = this;
			if(localStorage.userInfo){
				this.userInfo = JSON.parse(localStorage.userInfo);
			}

=======

		init : function(){
			var that = this;
			if(localStorage.userInfo){
				this.userInfo = localStorage.userInfo;
			}else{
				//location.href="/app/html/login.html";
			}
			//this.getSchemeList();
>>>>>>> 23016f9123aaf4a1d48f5064d474e528fb1c3cfd
			this.bindEvent();
			this.setLayout();
			$(window).resize(function(){
				that.setLayout();
			});
<<<<<<< HEAD
=======

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
>>>>>>> 23016f9123aaf4a1d48f5064d474e528fb1c3cfd
		}
	}.init();


//})(window);