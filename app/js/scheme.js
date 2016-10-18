//(function(){
	schemeData = [];
	currentSchemeId = 0;
	custId = "";
	scheme = {
		validate : function(id){
			var isValid = true;
			$(id + " input").each(function(){
				//if($(this).val() == ""){
				//	$(id + " .errorTip").text("不能为空");
				//	$(this).addClass("error");
				//	isValid =  false;
				//	return false;
				//}else
				if($(this).val().length > 8){
					$(id + " .errorTip").text($(this).parent().prev().text()  + "长度不能超过8个字符");
					$(this).addClass("error");
					isValid =  false;
					return false;
				}else{
					$(id + " .errorTip").text("");
					$(this).removeClass("error");
				}
			});
			return isValid;
		},
		initScheme : function(){
			var that = this;
			if(this.validate("#add-scheme-popup")){
				var param = {};
				param["userId"] = custId;
				$("#add-scheme-popup input:text").each(function(i){
					var name = "",
						value = $(this).val();
					if(i == 0){
						name = $(this).attr("name");
						param[name] = value ? value : "方案一";
					}else if(i > 0){
						name = "modules[" + (i-1) + "].modName";
						param[name] = value ? value : ("模块" + i);
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
		addScheme : function () {
			var that = this;
			var param = {
				"userId" : custId,
				"sltName" : "方案"+(schemeData.length+1),
				"modules[0].modName" : "模块一"
			};
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
					$(".container").removeClass("hide");
					$(".customerListContainer").addClass("hide");
					that._renderPage();

				}
			});
		},
		/*获取配置用户列表*/
		getCustomerList : function (param) {
			if(!param){
				param={
					"pageSize" : 30
				}
			}
			$.ajaxJSON({
				name: '客户列表',
				url: URL.GET_CUSTOMER_LIST,
				data: param,
				success: function (data) {
					if(!data.data){
						$(".customerList").html("<p class='noData'>无匹配内容,请确认</p>");
						return
					}else {
						$(".customerList").html("");
					}
					if($(".customerList li").length){
						$(".customerList li").remove();
						$(".customerList p").remove();
					}
					$.each(data.data.customers,function (i) {
						if(i==0||data.data.customers[i].custName!=data.data.customers[i-1].custName){
							var dom = "<p class='userName'><i class='icon iconfont icon-user'></i>"+data.data.customers[i].custName+"</p>" +
								"<li class='userInfo' loginname="+data.data.customers[i].loginName+" custid="+data.data.customers[i].id+"><p><em class='first'></em><span>"+data.data.customers[i].loginName+"</span><span>"+data.data.customers[i].realName+"</span><span>"+data.data.customers[i].custName+"</span></p><i class='iconfont icon-xuanzhongsvg selectCust hide'></i></li>"
						}else {
							var dom = "<li class='userInfo' loginname="+data.data.customers[i].loginName+" custid="+data.data.customers[i].id+"><p><em></em><span>"+data.data.customers[i].loginName+"</span><span>"+data.data.customers[i].realName+"</span><span>"+data.data.customers[i].custName+"</span></p><i class='iconfont icon-xuanzhongsvg selectCust hide'></i></li>"
						}
						$(".customerList").append(dom);
					});
					if(param.paraName){
						$(".pagesContainer").remove();
					}
					if(!$(".pagesContainer").length){
						if(data.data.pageTotal>1){
							$(".customerContainer").after("<div class='pagesContainer'><p class='left'><</p><p class='pages'></p><p class='right'>></p></div>");
							for(var i=1;i<=data.data.pageTotal;i++){
								if(i>4){
									var dom = "<span>...</span>"
									$(".pages").append(dom);
									return false
								}else if(i==1) {
									var dom = "<span id="+i+" class='page active'>"+i+"</span>";
								}else {
									var dom = "<span id="+i+" class='page'>"+i+"</span>";
								}
								$(".pages").append(dom);
							}
						}
					}
				}
			});
		},
		updateSchemeName : function(){
			var that = this;
			if(this.validate("#edit-scheme-popup")) {
				var param = {};
				param["sltId"] = this.currentEditScheme.sltId;
				param["sltName"] = $("#edit-scheme-popup input:text").val();
				if(!param["sltName"]){
					for(var i = 0; i < schemeData.length;i++){
						if(schemeData[i].sltId == that.currentEditScheme.sltId){
							param["sltName"] = "方案" + (i+1);
							break;
						}
					}
				}
				$.ajaxJSON({
					name: '修改方案名称',
					url: URL.UPDATE_SCHEME,
					data: param,
					success: function (r) {
						for (var i = 0; i < schemeData.length; i++) {
							if (schemeData[i].sltId == r.data.id) {
								schemeData[i].sltName = r.data.sltName;
								$(".menu li").eq(i).find("p").text(r.data.sltName);
								break;
							}
						}
						$("#edit-scheme-popup").dialog("close");
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

			//当前用户创建第一个方案时渲染方案列表
			if(schemeData.length == 1) {
				isActive = window.currentSchemeId == schemeData[0]["sltId"] ? 'class="active"' : '';
				template += '<li><a ' + isActive + ' href="views/scheme.html?id=' + schemeData[0]["sltId"] + '" target="mainIframe"><em class="sideBlock"></em><i class="icon iconfont icon-iconproject1">&#xe61a;</i><p>' + schemeData[0]["sltName"] + '</p><i class="iconfont icon-jiantou iconDropdown"></i></a></li>';
				$(".menu").html(template);
				document.getElementById("mainIframe").contentWindow.schemeDetail.getModuleList();
			}else if(schemeData.length > 1){
				//当前用户在第一个方案的基础上创建方案时渲染方案列表
				var index = schemeData.length - 1;
				$(".menu").append('<li><a ' + isActive + ' href="views/scheme.html?id=' + schemeData[index]["sltId"] + '" target="mainIframe"><i class="icon iconfont icon-iconproject'+ index +'"></i><p>' + schemeData[index]["sltName"] + '</p><i class="iconfont icon-jiantou iconDropdown"></i></a></li>');
			}
		},
		addModuleItem : function(){
			if($("input.moduleName").length >= 8){
				$.msg({
					modal:true,
					msg : "单个方案最多支持8个模块"
				});
				return;
			}
			$("#addModuleBtn").parent().parent().parent().append('<div class="fm-ipt"><label class="fm-in">附属模块名称：</label><input class="moduleName" type="text" placeholder="输入模块名称"><i class="icon iconfont"></i></div>');
		},
		bindEvent : function(){
			var that = this;
			$("#addSchemeBtn").on("click",function(){
				that.addScheme();
			});
			$("#addModuleBtn").on("click",function(){
				that.addModuleItem();
			});
			$("#add-scheme-popup").delegate(".icon-icondel","click",function(){
				$(this).parent().remove();
			});
			$("#confirm-btn").on("click",function(){
				that.initScheme();
			});
			$(".side").delegate("a","click",function(){
				$(".side a").removeClass("active");
				$(this).addClass("active");
				currentSchemeId = $(this).attr("href").split("=")[1];
				if($("#add-scheme-popup").is(":visible") && $(this).attr("id") != "addSchemeBtn"){
					$('#add-scheme-popup').addClass("hide");
				}
			});
			/*选中配置用户*/
			$(".container").delegate(".userInfo","click",function () {
				custId = $(this).attr("custid");
				loginName = $(this).attr("loginname");
				if(!localStorage.custId){
					$(".userInfo").find(".selectCust").addClass("hide")
					$(this).find(".selectCust").removeClass("hide")
				}
				if(localStorage.custId){
					if(custId==localStorage.custId){
						return
					}
					$.msg({
						type : "切换配置用户",
						msg : "确定要切换至该用户进行配置吗？,当前操作将会自动保存,以便继续配置。",
						ok : function(){
							$(".customerListContainerIn").removeClass("move");
							document.getElementById("mainIframe").contentWindow.location.reload(true);
						}
					});
				}
			});
			/*切换页码*/
			$(".container").delegate(".page","click",function () {
				$(".page").removeClass("active");
				$(this).addClass("active");
				var param={
					"pageSize" : 1,
					"pageNum" : $(this).html()
				};
				that.getCustomerList(param);
			});
			/*分页上一页*/
			$(".container").delegate(".left","click",function () {
				if($("span.page.active").html()>1){
					var param={
						"pageSize" : 1,
						"pageNum" : $("span.page.active").html()-1
					};
					that.getCustomerList(param);
					$(".page").removeClass("active");
					$("#"+param.pageNum).addClass("active");
				}else{
					$.msg("已是第一页");

				}
			});
			/*分页下一页*/
			$(".container").delegate(".right","click",function () {
				if($("span.page.active").html()<$(".page:last").html()){
					var param={
						"pageSize" : 1,
						"pageNum" :parseInt($("span.page.active").html())+1
					};
					that.getCustomerList(param);
					$(".page").removeClass("active");
					$("#"+param.pageNum).addClass("active");
				}else{
					$.msg("已是最后一页");
				}
			});
			/*搜索*/
			$(".container").delegate(".searchInfo","keyup",function (event) {
				if($(this).val()==""){
					$("em.delete").css("display","none");
				}else {
					$("em.delete").css("display","block");
				}
				if(event.keyCode==13){
					if($(this).val()){
						var param={
							"pageSize" : 30,
							"paraName" : $(this).val()
						};
						that.getCustomerList(param);
					}else {
						that.getCustomerList();
					}
				}
			});
			/*重置搜索*/
			$(".container").delegate("em","click",function () {
				$(".searchInfo").val("");
				$(this).css("display","block");
				that.getCustomerList();
			});
			/*显示配置用户列表*/
			$(".container").delegate(".custName","click",function () {
				if($(".move").length){
					return
				}
				$(".customerListContainerIn").addClass("move");
				that.getCustomerList()
			});
			/*隐藏配置用户列表*/
			$(".container").delegate(".closeList","click",function () {
				$(".customerListContainerIn").removeClass("move");
			});
			/*选择配置用户进入主页*/
			$(".btnContainer").delegate(".nextStep","click",function () {
				if(!custId){
					$.msg("请选择用户")
					return
				}
				localStorage.setItem("custId",custId);
				localStorage.setItem("loginName",loginName);
				document.getElementById("mainIframe").contentWindow.location.reload(true);
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
			});
			$(".side").delegate("a","mouseover",function(){
				if($(this).parent()[0].tagName.toUpperCase() != "LI"){
					return;
				}
				var offset = $(this).parents("li").offset();
				if(offset) {
					$(".editSchemeName").removeClass("hide").css("top", (offset.top + 36) + "px");
				}
				that.currentEditScheme = {
					"sltId" : $(this).parents("li").find("a").attr("href").replace("views/scheme.html?id=",""),
					"sltName" :$(this).parents("li").find("p").text()
				};
			});
			$(".side").delegate("a","mouseleave",function(){
				$(".editSchemeName").addClass("hide");
			});
			$(".editSchemeName").on("mouseover",function(){
				$(".editSchemeName").removeClass("hide");
			});
			$(".editSchemeName").on("mouseleave",function(){
				$(".editSchemeName").addClass("hide");
			});
			$(".editSchemeName").on("click",function(){
				//$("#edit-scheme-popup").removeClass("hide");
				$("#edit-scheme-popup").dialog("open");
				$("#edit-scheme-popup input:text").val(that.currentEditScheme.sltName);
			});
			$("#edit-scheme-popup .btn").on("click",function(){
				that.updateSchemeName();
			});
			$('#logout').on('click', function() {
				that.logout();
			});
		},
		logout : function(){
			localStorage.removeItem('userInfo');
			localStorage.removeItem('custId');
			localStorage.removeItem('loginName');
			$.cookie("acf_ticket",null,{"expires":0});
			window.location.href = logoutUrl;


		},
		setLayout : function(){
			var h = document.documentElement.clientHeight - $(".head").height();
			var menuBoxH = h - $(".componentBtn")[0].clientHeight - $(".logo").height()-$(".custName").height();
			var menuH = $(".menu").height();
			var itemHeight = $(".side a")[0].clientHeight;
			$(".side").height(h);
			$("iframe").height(h-3);
			$(".menuBox").css("height",(menuBoxH + "px"));
			$(".menuBox").css("box-shadow","0 5px 5px 0 #333");
			$(".customerListContainerIn").find(".customerList").css("height",(h-131)+"px");
		},
		init : function(){
			var that = this;
			if(localStorage.userInfo){
				this.userInfo = JSON.parse(localStorage.userInfo);
				$(".realName").html(this.userInfo.realName);
				$(".email").html(this.userInfo.email);
			}
			if(localStorage.custId){
				$('.customerListContainer').addClass("hide");
				$('.container').removeClass("hide");
				$('#add-scheme-popup').addClass("hide");
				custId = localStorage.custId;
			}else{
				if(this.userInfo.isStaff){
					$(".customerListContainer").removeClass("hide");
					this.getCustomerList();
				}else{
					$('.customerListContainer').remove();
					$('.container').removeClass("hide");
					$('#add-scheme-popup').addClass("hide");
					custId = this.userInfo.userId;
					localStorage.setItem("custId",this.userInfo.userId);
				}
			}
			this.bindEvent();
			this.setLayout();
			$(window).resize(function(){
				that.setLayout();
			});
			$("#edit-scheme-popup").dialog({
				autoOpen:false,
				modal:true,
				title : "修改方案名称"
			})
		}
	}.init();

//})(window);