(function(){
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
			console.log($.cookie('acf_ticket'));
			console.log(URL.SOLUTION_LIST);
			$.ajaxJSON({
				name: '获取方案列表',
				url: URL.SOLUTION_LIST,
				data: {"userId" : that.userInfo.userId},
				type : 'post',
				success: function (r) {
					console.log(r);
					if(r.data.length > 0){
						schemeData = r.data;
						that._renderPage();
						that.getModuleList();
					}
				}
			});
		},
		_renderPage : function(){
			var template = "",
				code = "&#xe60";
			for(var i = 0; i < schemeData.length;i++){
				template += '<li><a '+ (i==0 ? 'class="active"' : '') +' href="views/scheme.html?id='+ schemeData[i]["id"] +'" target="mainIframe"><i class="icon iconfont icon-iconproject'+ (i+1) +'"></i><p>'+ schemeData[i]["sltName"] +'</p></a></li>';
			}
			$(".menu").html(template);
		},
		getModuleList:function(){
			var foo = function(){
				document.getElementById("mainIframe").contentWindow.getModuleList(schemeData[0].id);
			}
			setTimeout(foo,500);
		},
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
		init : function(){
			var that = this;
			if(localStorage.userInfo){
				this.userInfo = JSON.parse(localStorage.userInfo);
				console.log(this.userInfo);
			}else{
				location.href="/app/login.html";
			}
			this.getSchemeList();
			this.bindEvent();
			this.setLayout();
			$(window).resize(function(){
				that.setLayout();
			});
		}
	}.init();


})(window);