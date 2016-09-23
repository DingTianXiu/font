(function($){
	schemeDetail = {
		getSchemeList : function(){
			var that = this;
			$.ajaxJSON({
				name: '获取方案列表',
				url: URL.SOLUTION_LIST,
				data: {"userId" : that.userInfo.userId},
				type : 'post',
				iframe : true,
				cache:false,
				success: function (r) {
					if(r.data.length > 0){
						parent.window.schemeData = r.data;
						parent.window.currentSchemeId = r.data[0]["sltId"];
						that._renderPage();
						that.getModuleList();
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
				isActive = parent.window.currentSchemeId==schemeData[i]["sltId"] ? 'class="active"' : '';
				template += '<li><a '+ isActive +' href="views/scheme.html?id='+ schemeData[i]["sltId"] +'" target="mainIframe"><i class="icon iconfont icon-iconproject'+ (i+1) +'"></i><p>'+ schemeData[i]["sltName"] +'</p></a>';
				//template +=  '<i class="editSchemeName">修改方案名</i></li>';
			}
			$(".menu",parent.document).html(template);
		},
		getModuleList : function(){
			var that = this;
			$.ajaxJSON({
				name: '获取模块列表',
				url: URL.MODULE_LIST,
				data: {"sltId":parent.window.currentSchemeId},
				type : 'post',
				iframe : true,
				cache:false,
				success: function (r) {
					if(r.data.length > 0){
						that.moduleData = r.data;
						that.currentModuleId = that.moduleData[0]["modId"];
						for(var i = 0; i < r.data.length;i++){
							that.moduleChain[r.data[i].modId] = r.data[i].status;
						}
						that._renderModule();
						that._getComponentList();
					}
				}
			});
		},
		_renderModule : function(){
			console.log(this.moduleData);
			var template = "";
			for(var i = 0; i < this.moduleData.length;i++){
				template += '<li><a href="javascript:;" id="'+ this.moduleData[i]["modId"] +'" class="moduleListItem '+ (i == 0 ? 'active' : '') +'">'+ this.moduleData[i]["modName"] + '</a>';
				template +=  '<i class="icon iconfont icon-iconmodify editModuleName"></i></li>';
			}
			template += '<li><a href="javascript:;" class="moduleListItem addModuleBtn">新建模块</a></li>';
			$(".moduleList").html(template);
		},
		_getComponentList:function(){
			var that = this;
			$.ajaxJSON({
				name : "获取模块下的实例构件",
				url: URL.COMPONENT_LIST,
				data: {"modId" : that.currentModuleId},
				type : 'post',
				iframe : true,
				cache:false,
				success: function (r) {
					that.componentChain[that.currentModuleId] = [];
					$(".componentList").html("");
					if(r.data.length > 0){
						for(var i = 0; i < r.data.length;i++) {
							that.componentChain[that.currentModuleId].push({
								"baseCptId" : r.data[i].baseCptId,
								"cptInstId" : r.data[i].cptInstId,
								"cptInstOrdNum" : r.data[i].cptInstOrdNum,
								"cptKey" : r.data[i].cptKey,
								"cptName" : r.data[i].cptName
							});
							that.componentInstChain[r.data[i].cptInstId] = r.data[i].cptKey;
						}
						that._renderComponent();
					}else{
						openComponentDialog();
						that.setBtnStatus();
					}
				}
			});
		},
		_renderComponent : function(){

			var item,
				that = this;
			$(".componentList").html("");
			for(var i = 0; i < this.componentChain[this.currentModuleId].length;i++){
				item = this.componentChain[this.currentModuleId][i];
				if(item) {
					that.createWidget(item, 1);
				}
			}
		},
		bindEvent : function(){
			var that = this;
			//添加新构件
			$(".btnbox").delegate("#addWidgetBtn","click",function(){
				openComponentDialog();
			});

			//切换模块
			$(".moduleList").delegate("a","click",function(){
				if($(this).hasClass("addModuleBtn")){
					that.openModuleDialog($(this));
				}else {
					var modId = parseInt($(this).attr("id"),10);
					that.switchModule(modId);
					$(".moduleList a").removeClass("active");
					$(this).addClass("active");
				}
			});
			$(".moduleList").delegate("i","click",function(){
				that.openModuleDialog($(this));
			});
			//保存模块
			$("#saveModule").on("click",function(){
				that.createModule();
			});
			$("body").on("click",function(e){
				var $el = $(e.target);
				if($el.parents("#addModulePopup").length == 0 && ($el[0].id != 'addModulePopup') && ($el[0].className.indexOf('moduleListItem') == -1) && ($el[0].className.indexOf('editModuleName') == -1)){
					$("#addModulePopup").addClass("hide");
				}
			});
			//预览
			$('.btnbox').delegate("#preview","click",function(){
				that.preview(true);
			});
			//继续编辑
			$('.btnbox').delegate("#goToEdit","click",function(){
				that.preview(false)
			});
			//撤销发布
			$('.btnbox').delegate("#cancelPublish","click",function(){
				that.publish(1);
			});
			//$("#cancelPublish").on("click",function(){
			//	that.publish(0);
			//});
			$(".publishTip a").on("click",function(){
				that.publish(1);
			});
			//发布
			$('.btnbox').delegate("#publish","click",function(){
				that.publish(0);
			});
			//
		},
		preview : function(flag){
			this.moduleChain[this.currentModuleId] = flag ? -1 : 0;
			this.setBtnStatus();
			$("#addSchemeBtn",parent.document)[flag ? "hide" : "show"]();
			$(".addModuleBtn").parent()[flag ? "hide" : "show"]();
			$(".related")[flag ? "hide" : "show"]();
		},
		publish : function(status){
			/**
			 * 0:已发布
			 * 1:未发布
			 * 2：已删除
			 * */
			var that = this;
			var param = {
				"modId": this.currentModuleId,
				"status": status
			};
			$.ajaxJSON({
				name: "发布/撤销发布模块",
				url: URL.UPDATE_MODULE,
				data: param,
				type: 'post',
				iframe: true,
				success: function (r) {
					that.moduleChain[that.currentModuleId] = status;
					that.setBtnStatus();
				}
			});
		},
		switchModule : function(id){
			$('.componentList').html("");
			this.currentModuleId = id;
			if(this.componentChain[this.currentModuleId] && this.componentChain[this.currentModuleId].length > 0){
				this._renderComponent();
			}else{
				this._getComponentList();
			}
		},
		openModuleDialog : function($ele){
			if($ele[0].tagName.toLowerCase() == "a"){
				$("#newModuleName").val("");
				this.isEditModule = false;
				if(this.moduleData.length > 8){
					$.msg({modal:true,msg:"一个方案最多只能有8个模块"});
					return;
				}
			}else if($ele[0].tagName.toLowerCase() == "i"){
				$("#newModuleName").val($ele.prev("a").text()).attr("modId",$ele.prev("a").attr("id"));
				this.isEditModule = true;
			}
			var offset = $(arguments[0]).parents("li").offset();
			$("#addModulePopup").removeClass("hide").css("left",offset.left+"px");
		},
		validate : function(id){
			var isValid = true;
			$(id + " input").each(function(){
				if($(this).val() == ""){
					$(id + " .errorTip").text("不能为空");
					$(this).addClass("error");
					isValid =  false;
					return false;
				}else if($(this).val().length > 8){
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
		createModule : function(){
			var that = this;
			if(this.validate("#addModulePopup")) {
				var newModuleName = $("#newModuleName").val();
				if (this.isEditModule) {
					//编辑模块名称
					var param = {
						modId: $("#newModuleName").attr("modId"),
						modName: newModuleName
					}
					var url = URL.UPDATE_MODULE;
				} else {
					//新建模块
					var param = {
						sltId: parent.window.currentSchemeId,
						modName: newModuleName,
						userId: this.userInfo.userId
					};
					var url = URL.CREATE_MODULE;
				}
				$.ajaxJSON({
					name: "新增模块/修改模块名",
					url: url,
					data: param,
					type: 'post',
					iframe: true,
					success: function (r) {
						if (r.data) {
							if (that.isEditModule) {
								for (var i = 0; i < that.moduleData.length; i++) {
									if (that.moduleData[i].modId == r.data.modId) {
										that.moduleData[i].modName = r.data.modName;
										break;
									}
								}
							} else {
								that.moduleData.push(r.data);
							}
							that._renderModule();
							$("#addModulePopup").addClass("hide");
						}
					}
				});
			}
		},
		createWidget : function(param,step){
			var that = this;
			$(".btnbox").html("");
			var ele = $("<div class='component'></div>").appendTo(".componentList");
			var index = step ? (typeof step == "number" ? step : 0) : 0;
			if(param.cptKey == "phoneReleaseMonitorCpt") {
				$(ele).newPhoneQuery({
					step: index,
					baseCptId: param.baseCptId,
					moduleId: that.currentModuleId,
					cptInstId: param.cptInstId,
					conCptInstId : param.conCptInstId ? param.conCptInstId : null,
					//searchDateScope : param.searchDateScope,
					onComplete: function (data) {
						that.componentChain[that.currentModuleId].push(data);
						that.setBtnStatus();
					},
					//同步关联属性
					onUpdateAttr : function(data){
						that.updateSyncData(data);
					},
					//创建关联构件
					onRelatedWidget : function(data){
						that.createWidget(data,0);
					}
				});
			}else if(param.cptKey == "phoneReleaseVolumeCompareCpt"){
				$(ele).newPhoAddComp({
					step: index,
					baseCptId: param.baseCptId,
					moduleId: that.currentModuleId,
					cptInstId: param.cptInstId,
					conCptInstId : param.conCptInstId ? param.conCptInstId : null,
					onComplete: function (data) {
						that.componentChain[that.currentModuleId].push(data);
						that.setBtnStatus();
					},
					//同步关联属性
					onUpdateAttr : function(data){
						that.updateSyncData(data);
					},
					//创建关联构件
					onRelatedWidget : function(data){
						console.log(data);
						that.createWidget(data,0);
					}
				});
				// new newPhoAddComp();
			// // }else{
			// // 	$.msg("敬请期待1...");
			// // 	$(".btnbox a").show();

			}else if(param.cptKey == "customerInterestAnalyzeCpt"){
				$(ele).proUserAnalysis({
					step: index,
					baseCptId: param.baseCptId,
					moduleId: that.currentModuleId,
					cptInstId: param.cptInstId,
					conCptInstId : param.conCptInstId ? param.conCptInstId : null,
					onComplete: function (data) {
						that.componentChain[that.currentModuleId].push(data);
						that.setBtnStatus();
					},
					//同步关联属性
					onUpdateAttr : function(data){
						that.updateSyncData(data);
					},
					//创建关联构件
					onRelatedWidget : function(data){
						console.log(data);
						that.createWidget(data,0);
					}
				});
			}else if(param.cptKey == "phoneReleaseVolumeEmotionAnalyzeCpt"){
				$(ele).newAffectionAnalysed({
					step: index,
					baseCptId: param.baseCptId,
					moduleId: that.currentModuleId,
					cptInstId: param.cptInstId,
					conCptInstId : param.conCptInstId ? param.conCptInstId : null,
                    onComplete: function (data) {
                        that.componentChain[that.currentModuleId].push(data);
                        that.setBtnStatus();
                    },
					//同步关联属性
					onUpdateAttr : function(data){
						that.updateSyncData(data);
					},
					//创建关联构件
					onRelatedWidget : function(data){
						that.createWidget(data,0);
					}
				});
			}else if(param.cptKey == "customerFocusAnalyzeCpt"){
				$(ele).newAttentionAnalysed({
					step: index,
					baseCptId: param.baseCptId,
					moduleId: that.currentModuleId,
					cptInstId: param.cptInstId,
					conCptInstId : param.conCptInstId ? param.conCptInstId : null,
					onComplete: function (data) {
						that.componentChain[that.currentModuleId].push(data);
						that.setBtnStatus();
					},
					//同步关联属性
					onUpdateAttr : function(data){
						that.updateSyncData(data);
					},
					//创建关联构件
					onRelatedWidget : function(data){
						that.createWidget(data,0);
					}
				});
			}
		},
		updateSyncData :　function(data){
            if(data.length == 0) return;
			for(var i = 0;i < data.length;i++){
				var cptKey = this.componentInstChain[data[i]];
				//根据cptKey判断同步哪个构件实例
				if(cptKey == "customerInterestAnalyzeCpt") {
					$("#" + data[i]).proUserAnalysis("getData");
				}else if(cptKey == "phoneReleaseVolumeEmotionAnalyzeCpt"){
                    $("#" + data[i]).newAffectionAnalysed("getData");
                }else if(cptKey == "customerFocusAnalyzeCpt"){
					$("#" + data[i]).newAttentionAnalysed("getData");
				}
			}
		},
		setBtnStatus : function(){
			var that = this,
				template = '';

			if(this.moduleChain[this.currentModuleId] == 1){
				if (this.componentChain[this.currentModuleId].length > 0) {
					template = '<a href="javascript:;" id="addWidgetBtn">添加新构件</a>';
					template += '<a href="javascript:;" id="preview">生成方案预览</a>';
				}
				$(".publishTip").addClass("hide");
			}else if(this.moduleChain[this.currentModuleId] == 0){
				//if (this.componentChain[this.currentModuleId].length > 0) {
					template = '<a href="javascript:;" id="cancelPublish">撤销发布</a>';
					$(".publishTip").removeClass("hide");
				//}else{
				//	$(".publishTip").addClass("hide");
				//}

			}else if(this.moduleChain[this.currentModuleId] == -1){
				template = '<a href="javascript:;" id="goToEdit">继续配置</a>';
				template += '<a href="javascript:;" id="publish">发布</a>';
				$(".publishTip").addClass("hide");
			}else{
				$(".publishTip").addClass("hide");
			}
			$(".btnbox").html(template);
		},
		init : function(){
			var that = this;
			this.moduleData  = [];
			//当前选中模块的构件实例
			this.componentChain = {};
			//当前选中模板的发布状态
			this.moduleChain = {};
			//构件实例Id与实例类型的映射关系
			this.componentInstChain = {};
			this.bindEvent();
			if(localStorage.userInfo){
				this.userInfo = JSON.parse(localStorage.userInfo);
			}else{
				parent.location.href = window.ROOT + '/login.html';
			}
			if(parent.window.schemeData.length > 0){
				this.getModuleList(parent.window.currentSchemeId);
			}else {
				this.getSchemeList();
			}
			//this.createWidget({"baseCptId":4,"cptKey":"customerInterestAnalyzeCpt"},0);
		}
	},
	openComponentDialog = function(){
		var that = this;
		var ele = $("<div class='widgetPopup'></div>").appendTo(".componentList");
		var w = $(ele).widgetPicker({
			onSelect : function(type,id){
				var param = {
					baseCptId: parseInt(id, 10),
					cptKey: type,
				};
				schemeDetail.createWidget(param, 0);

			}
		});
		$(".btnbox a").hide();
	};
	schemeDetail.init();
})(jQuery);