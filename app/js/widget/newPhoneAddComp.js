 //$(function(){
	var newPhoAddComp = function(element,options){
		this.data = {
            "title":"新品声量对比（监测）",
			"titleTarProd":"选择目标产品",
			"chooBrand":"选择品牌",
			"chooType":"选择型号",
			"brands" :[],
			"repInfoSou":[
				{infoSourc : "微博"},{infoSourc:"twitter"}
			],


        };
        this.init();
	};
	newPhoAddComp.prototype = {
        constructor : newPhoAddComp,
        _phoneInfo :function(){
            var _this = this;
		    var $phoneList = $(".phoneList"),
				$btnAddPhone = $(".tarPro .btnAdd"),
				$phoBraVal = $("#phoneBrand").val(),
				$phoModVal = $("#phoneModel").val(),
				$phoBrand = $("#phoneBrand select").find("option:selected").text(),
				$phoModel = $("#phoneModel select").find("option:selected").text(),
				$btnDele = $(".phoneList .tarProWidth .btnDelect");
			//手机品牌及型号
			$.ajaxJSON({
				name : "手机品牌及型号",
				url: URL.GET_PHONE_LIST,
				data: {},
				type : 'post',
				iframe : true,
				success: function (i) {
					if(i.data){
						_this.data.brands = i.data.brands;
						//_this._getData();
						_this._sourceInfo();
					}
				//},
				//error: function(){
				//	alert('系统错误')
				}
			});
		    $btnAddPhone.on('click',function(){
				if($("#phoneBrand").val() != '' && $("#phoneModel").val() != ''){
					$phoneList.css("display","block");
					// $phoneList.find('ul');
					// $(".phoneList .pInfo h4").html();
				} else if ($("#phoneBrand").val() == ''){
					alert('不选择品牌就想添加数据？哪有那么好的事情')
				}else if ($("#phoneModel").val() == ''){
					alert('选好了品牌还得选个型号才可以呢~')
				}
			});
			$btnDele.on('click',function(){
				if($(".phoneList li").length == 1){
					$(this).parent().parent().hide();
				}
			});
        },
        _sourceInfo :function(){
        	var _this = this;
			var $sourceList = $("sourceList"),
				$btnAddSour = $(".infoSource .btnAdd"),
				$infoSouVal = $("#inSourc").val();

			$.ajaxJSON({
				name : "来源信息",
				url : URL.GET_SOURCE_DATA,
				data: {},
				type : 'post',
				iframe : true,
				success: function (r) {
					_this.data.repInfoSou = r.data;
					_this._renderCondition();
				}
				//error: function(){
				//	alert('系统错误')
				//}
			});
			$btnAddSour.on('click',function(){
				if($("#inSourc").val() != ''){
					$(".sourceList").show();
				}else{
					alert('没有信息来源怎么生成图表')
				}
			});
			$(".chooTableStyle li").on("click",function(){
				$(this).addClass('on');
			});
			$(".btnCompare a").on("click",function(){
				if($(".phoneList li").length > 1 || $(".sourceList li").length > 1 || !$(".chooTableStyle li").hasClass("on")){
					alert('请补充完相关信息');
				}else{
					$(".proContraIn").css("display","none");
					$("#containerChart").css("display","block");
					$(".btnCompare").css("display","none");
				}
			});
	    },
        _renderCondition : function(){
            var that = this,
            	source = $("#addPhoneCompent").html(),
            	template = Handlebars.compile(source),
            	html = template(this.data);
            $('body').html(html);
        },
		_bindEvent : function(){
			var that = this;
			var source = $("#addPhoneCompent").html();
			var template = Handlebars.compile(source);
			$("body").delegate(".phoneBrand","change",function(){
				var index = $(".phoneBrand")[0].selectedIndex - 1;
				if(index >=  0) {
					var tpl = "";
					for(var i = 0;  i <that.data.brands[index].models.length;i++) {
						var item = that.data.brands[index].models[i];

						tpl += "<option value='" + item.modelCode + "'>"+ item.modelName +"</option>";
					}
					var ele = $(".phoneModel")[0];
					$(ele).html(tpl);
				}
			});
		},
       	init : function(){
       		//this._renderCondition();
			this._bindEvent();
			this._phoneInfo();

       	}
	};
	 //$.fn.newPhoAddComp = function(option, value) {
		// var methodReturn;
		// var $set = this.each(function() {
		//	 var $this = $(this);
		//	 var data = $this.data('newPhoAddComp');
		//	 var options = typeof option === 'object' && option;
		//	 if (!data) {
		//		 $this.data('newPhoAddComp', (data = new NewPhoneQuery(this, options)));
		//	 }
		//	 if (typeof option === 'string') {
		//		 methodReturn = data[option](value);
		//	 }
		// });
		// return (methodReturn === undefined) ? $set : methodReturn;
	 //};
 	//$.fn.newPhoAddComp.Constructor = newPhoAddComp;

 //})