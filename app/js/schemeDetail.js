(function($){
	schemeDetail = {
		getSchemeList : function(){
			var that = this;
			$.ajaxJSON({
				name: '获取方案列表',
				url: URL.SOLUTION_LIST,
				data: {"userId" : that.custId},
				type : 'post',
				iframe : true,
				cache:false,
				success: function (r) {
					if(r.data.length > 0){
						parent.window.schemeData = r.data;
						parent.window.currentSchemeId = r.data[0]["sltId"];
						$(".customerListContainer",parent.document).remove();
						$(".side",parent.document).after(
						"<div class='customerListContainerIn'>" +
							"<div class='container'>"+
							"<p class='customerTitle'>选择配置用户<span class='closeList'>x</span></p>"+
							"<div class='customerContainer'>"+
							"<div class='search'>"+
							"<input class='searchInfo' type='text' placeholder='输入客户名、用户名、开户人搜索'>"+
							"<em href='#' class='delete' style='display: none'>x</em>"+
							"</div>"+
							"<ul class='customerList'></ul>"+
							"</div>"+
							"</div>"+
						"</div>"
						);
						var h = parent.document.documentElement.clientHeight - $(".head",parent.document).height();
						$(".customerListContainerIn",parent.document).find(".customerList").css("height",(h-131)+"px");
						$(".container",parent.document).removeClass("hide");
						$("#add-scheme-popup",parent.document).addClass("hide");
						$(".custName",parent.document).html(that.custName);
						that._renderPage();
						that.getModuleList();
					}else{
						$(".title",parent.document).html(that.custName);
						$(".customerListContainer",parent.document).addClass("hide");
						$(".container",parent.document).addClass("hide");
						$("#add-scheme-popup",parent.document).removeClass("hide");
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
				template += '<li><a '+ isActive +' href="views/scheme.html?id='+ schemeData[i]["sltId"] +'" target="mainIframe"><i class="icon iconfont icon-iconproject'+ (i+1) +'"></i><p>'+ schemeData[i]["sltName"] +'</p></a></li>';
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
			var template = "";
			for(var i = 0; i < this.moduleData.length;i++){
				template += '<li><a href="javascript:;" id="'+ this.moduleData[i]["modId"] +'" class="moduleListItem '+ (i == 0 ? 'active' : '') +'">'+ this.moduleData[i]["modName"] + '</a>';
				template +=  '<i class="icon iconfont icon-iconmodify editModuleName"></i></li>';
			}
			if(this.userInfo.isStaff){
				template += '<li><a href="javascript:;" class="moduleListItem addModuleBtn">新建模块</a></li>';
			}
			$(".moduleList").html(template);
		},
		_getComponentList:function(){
			var that = this;
			$.ajaxJSON({
				name : "获取模块下的实例构件",
				url: URL.COMPONENT_LIST,
				data: {
					"modId" : that.currentModuleId,
					"userId" : 17706
				},
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
					}
					that.setBtnStatus();
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
				if($el.parents(".selectProduct_updata").length == 0 && !($el[0].className == 'selectProduct_updata') &&  $el[0].className != "addBtn addLegendBtn" && $el[0].className != "icon iconfont icon-iconadd"){
					$(".selectProduct_updata").remove();
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
			//获取模块关联构件组
			$(".moduleData").on("click",function(){
				that.getRelatedCptGroup();
			});
		},
		preview : function(flag){
			this.moduleChain[this.currentModuleId] = flag ? -1 : 1;
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
		createModule : function(){
			var that = this;
			if(this.validate("#addModulePopup")) {
				var newModuleName = $("#newModuleName").val();
				if(newModuleName == ""){
					for(var i = 0; i < this.moduleData.length;i++){
						if(this.moduleData[i].modId == $("#newModuleName").attr("modId")){
							newModuleName = "模块" + (i+1);
							break;
						}
					}
				}
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
				$("#saveModule").attr("disabled","disabled");
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
									if (that.moduleData[i].modId == r.data.id) {
										that.moduleData[i].modName = r.data.modName;
										break;
									}
								}
							} else {
								that.moduleData.push({
									"modId": r.data.id,
									"modName": r.data.modName,
									"sltId": r.data.sltId,
									"status": r.data.status,
									"createTime": r.data.createTime
								});
							}
							that._renderModule();
							$("#addModulePopup").addClass("hide");
							$("#saveModule").removeAttr("disabled");
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
					onComplete: function (data) {
						that.updateComponentChain(data);
						that.setBtnStatus();
					},
					//同步关联属性
					onUpdateAttr : function(data){
						that.updateSyncData(data);
					},
					//创建关联构件
					onRelatedWidget : function(data){
						if(that.hasEditedComponent()) return;
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
						if(that.hasEditedComponent()) return;
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
						that.updateComponentChain(data);
						that.setBtnStatus();
					},
					//同步关联属性
					onUpdateAttr : function(data){
						that.updateSyncData(data);
					},
					//创建关联构件
					onRelatedWidget : function(data){
						if(that.hasEditedComponent()) return;
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
                        that.updateComponentChain(data);
                        that.setBtnStatus();
                    },
					//同步关联属性
					onUpdateAttr : function(data){
						that.updateSyncData(data);
					},
					//创建关联构件
					onRelatedWidget : function(data){
						if(that.hasEditedComponent()) return;
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
                        that.updateComponentChain(data);
                        that.setBtnStatus();
					},
					//同步关联属性
					onUpdateAttr : function(data){
						that.updateSyncData(data);
					},
					//创建关联构件
					onRelatedWidget : function(data){
						if(that.hasEditedComponent()) return;
						that.createWidget(data,0);
					}
				});
			}
			document.body.scrollTop = document.body.scrollHeight;
		},
		hasEditedComponent : function(){
			var flag = false;
			$(".component").each(function(){
				if(!$(this).attr("id")){
					$.msg({
						modal : true,
						msg : "当前构件未创建完成，不能创建构件"
					});
					flag = true;
				}
			});
			return flag;
		},
		updateSyncData :　function(data){
            if(data.length == 0) return;
			for(var i = 0;i < data.length;i++){
				var cptKey = this.componentInstChain[data[i]];
				//根据cptKey判断同步哪个构件实例
				if(cptKey == "customerInterestAnalyzeCpt") {
					$("#" + data[i]).proUserAnalysis("getData");
				}else if(cptKey == "phoneReleaseVolumeCompareCpt"){
					$("#" + data[i]).newPhoAddComp("getData");
				}else if(cptKey == "customerFocusAnalyzeCpt"){
					$("#" + data[i]).newAttentionAnalysed("getData");
				}else if(cptKey == "phoneReleaseVolumeEmotionAnalyzeCpt"){
                    $("#" + data[i]).newAffectionAnalysed("getData");
                }				
			}
		},
		setBtnStatus : function(){
			var that = this,
				template = '';
			if(!this.userInfo.isStaff){
				return
			}
			if(this.moduleChain[this.currentModuleId] == 1){
				//未发布状态
				if (this.componentChain[this.currentModuleId].length > 0) {
					template = '<a href="javascript:;" id="addWidgetBtn">添加新构件</a>';
					template += '<a href="javascript:;" id="preview">生成方案预览</a>';
				}
				$(".publishTip").addClass("hide");
			}else if(this.moduleChain[this.currentModuleId] == 0){
				//已发布状态
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
		updateComponentChain : function(data){
			if(!this.componentChain[this.currentModuleId]){
				this.componentChain[this.currentModuleId] = [];
			}
			if(typeof data == "object"){
				this.componentChain[this.currentModuleId].push(data);
                this.componentInstChain[data.cptInstId] = data.cptKey;
            }else if(typeof data == "number"){
				var list = this.componentChain[this.currentModuleId];
				for(var i = 0; i < list.length;i++){
					if(list[i].cptInstId == data){
						list.splice(i,1);
						$("#" + data).remove();
						if(!list.length){
							this.switchModule(this.currentModuleId);
						}
						break;
					}
				}
			}
		},
		getRelatedCptGroup : function(){
			var that = this;
			$.ajaxJSON({
				name: "获取模块关联构件组",
				url: URL.GET_INST_ATTR_GROUP,
				data: {"modId" : that.currentModuleId},
				type: 'post',
				iframe: true,
				success: function (r) {
					that.renderCptGroup(r.data);
				}
			});
		},
		renderCptGroup : function(data,modId){
			var that = this;
			var tpl = "<table class='attrGroup'><tr><td width='20'></td>";
			var attrTpl = "<tr><th>属性</th>";
			var groupCount = 1;
			var item;

			for(var i = 0; i <data.baseAttrNameGroup.length;i++){
				attrTpl += "<th class='"+ data.baseAttrNameGroup[i].baseAttrKey +"'><a href='javascript:;' class='delAttr' key='"+ data.baseAttrNameGroup[i].baseAttrKey +"'>"+ data.baseAttrNameGroup[i].baseAttrName +"<i class='icon iconfont icon-icondel '></i></a></th>";
				tpl += "<th class='"+ data.baseAttrNameGroup[i].baseAttrKey +"'>属性"+ (i+1) +"同步构件组</th>";
			}
			attrTpl += "</tr>";
			tpl += attrTpl;

			for(var j = 0; j < data.attrInstGroupList.length;j++) {
				if (groupCount < data.attrInstGroupList[j].attrInstGroups.length){
					groupCount = data.attrInstGroupList[j].attrInstGroups.length;
				}
			}
			for(var k = 0; k < groupCount;k++){
				tpl += "<tr><th>关联构件组"+ (k+1) +"</th>";
				for(var m = 0; m < data.attrInstGroupList.length;m++){
					item = data.attrInstGroupList[m].attrInstGroups[k];
					if(item) {
						tpl += "<td class='"+ item.baseAttrKey +"' attrInstGroupId = '"+ item.attrInstGroupId +"'>";
						for (var n = 0; n < item.attrInsts.length ; n++) {
							tpl += "<a href='javascript:;' class='delAttrCpt' attrInstId='"+ item.attrInsts[n].attrInstId +"' key='"+ item.attrInsts[n].baseAttrKey +"'>" + item.attrInsts[n].baseCptName +"<i class='icon iconfont icon-icondel'></i></a>";
						}
						tpl += "</td>";
					}else{
						tpl += "<td></td>";
					}
				}
				tpl += "</tr>";
			}
			tpl += "</table>";
			this.attrGroupDialog = $(tpl).dialog({
				title : '当前模块引用数据',
				resizable : false,
				minHeight : 14,
				width:1200,
				modal : true,
				close : function() {
					$(this).dialog("destroy").remove();
				}
			});
			this.attrGroupDialog.find(".delAttr").on("click",function(){
				that.updateAttrGroup($(this));
			});
			this.attrGroupDialog.find(".delAttrCpt").on("click",function(){
				that.updateAttrGroup($(this));
			});
		},
		updateAttrGroup : function($ele){
			var that = this;
			var key = $ele.attr("key");
			var attrInstId = $ele.attr("attrInstId");
			var param = {};
			if($ele.attr("class") == "delAttr") {
				param = {
					"modId": that.currentModuleId,
					"syncType": 1,
					"baseAttrKey": key,
				};
				$.ajaxJSON({
					name: "修改模块内的构件的属性同步类型",
					url: URL.UPDATE_INST_CPT_SYNC,
					data: param,
					type: 'post',
					iframe: true,
					success: function (r) {
						that.attrGroupDialog.find("." + key).remove();
					}
				});
			}else if($ele.attr("class") == "delAttrCpt"){
				param = {
					"attrInstId" : attrInstId,
					"syncType" : 1
				};
				$.ajaxJSON({
					name: '设置属性实例同步信息',
					url: URL.UPDATE_SYNC_TYPE,
					data: param,
					iframe: true,
					success: function (r) {
						$ele.remove();
					}
				});
			}
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
				if(parent.window.custId==localStorage.custId){
					this.getModuleList(parent.window.currentSchemeId);
				}else {
					localStorage.setItem("custId",parent.window.custId);
					localStorage.setItem("custName",parent.window.custName);
					that.custId = parent.window.custId;
					that.custName = parent.window.custName;
					this.getSchemeList();
				}
			}else {
				if(localStorage.custId){
					that.custId = localStorage.custId;
					that.custName = localStorage.custName;
					this.getSchemeList();
				}
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