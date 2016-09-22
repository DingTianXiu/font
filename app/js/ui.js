(function($) {
	// START OF SELECT
	var Select = function(element, options) {
		this.$select = $(element);
		this.$element = $('<div class="ui-widget ui-select">');
		this.$element.insertAfter(this.$select).append(this.$select);
		this.options = $.extend({}, $.fn.select.defaults, options);
		this.$button = $('<div class="ui-select-button" tabindex="0">');
		this.$button.addClass((this.$select.attr('class') || '').replace('ui-select', ''));
		this.$text = $('<span>').addClass('ui-select-text');
		var $icon = $('<span>').addClass('ui-select-icon');
		this.$button.append(this.$text, $icon);

		this.$dropdown = $('<div class="ui-select-dropdown">');
		this.$ul = $('<ul>');
		this.$dropdown.append(this.$ul);
		this.$element.append(this.$button);
		
		this.init();
		this.refresh();
		this.addEvents();
	};
	Select.prototype = {
		constructor : Select,
		destroy : function() {
			this.$select.removeData('select');
			this.$dropdown.remove();
			this.$element.replaceWith(this.$select);
		},
		init : function() {
			this.options.type = this.$select.is('[multiple]') ? 'M' : 'S';
			this.options.dropup = this.options.dropup || this.$select.data('dropup');
			if (this.options.dropup) {
				this.$dropdown.addClass('ui-select-dropup');
			}

			this.options.parent = this.$select.data('parent') || this.options.parent;
			if (this.options.parent) {
//				$(this.options.parent).append(this.$dropdown);
				this.$dropdown.addClass('ui-widget-out');
			}

			if (this.$select.is('[disabled]') || this.$select.is('[disabled="true"]') || this.$select.is('[readonly]')
					|| this.$select.is('[readonly="readonly"]') || this.options.disabled) {
				this.$element.addClass('ui-select-disabled');
			}

			// set width
			var width = this.options.width || this.$select.data('width');
			if (width) {
				this.options.width = width;
				this.$element.width(width);
			}

			if (!this.options.value) {
				var value = this.$select.data('value');
				if (this._isMultiple()) {
					this.$element.addClass('ui-select-multiple');
					if (value !== undefined) {
						value = value.split(',');
						value = $.map(value, function(val) {
							return $.trim(val);
						});
					}
				}
				this.options.value = value;
			}
			if (this.options.data) {
				this._generateList(this.options.data);
			}
		},
		enable : function() {
			this.$select.removeAttr('disabled');
			this.$element.removeClass('ui-select-disabled');
		},
		disable : function() {
			this.$select.attr('disabled', true);
			this.$element.addClass('ui-select-disabled');
		},
		reset : function() {
			this.$select.val(this.options.value);
			this.choose(this._getObj(this.options.value));
			this._refreshCheckbox();
		},
		_getObj : function(value) {
			var obj;
			if (this._isSingle()) {
				var $option = this.$select.find('option[value="' + value + '"]');
				if ($option.length === 0) {
					$option = this.$select.find('option:eq(0)');
					value = $option.val();
				}
				obj = {
					text : $.trim($option.text()),
					val : value
				};
			} else if (this._isMultiple()) {
				var opts = this.$element.find('option');
				// TODO order list 
//				value = _.sortBy(value, function(val) {
//					return opts.index(opts.filter('[value="' + val + '"]'));
//				});
				obj = [];
				for ( var i in value) {
					var $opt = this.$select.find('option[value="' + value[i] + '"]');
					if ($opt.length) {
						obj.push({
							text : $.trim($opt.text()),
							val : value[i]
						});
					}
				}
			}
			return obj;
		},
		refresh : function() {
			this._refreshList();
			var obj = this._getObj(this.options.value === undefined ? this.$select.val() : this.options.value);
			this.choose(obj);
			this._refreshCheckbox();
		},
		addEvents : function() {
			var _this = this;
			this._addEvent();
		},
		_addEvent : function(){
			this._removeEvent();
			this.$button.bind('click.ui-select', $.proxy(this.open, this));
		},
		_removeEvent : function(){
			this.$button.unbind('click.ui-select');
		},
		_addDropEvent : function() {
			var _this = this;
			this.$dropdown.on('click.ui-select', 'li', function(e) {
				// e.preventDefault();
				// Shall I improve it?
				// if (_this._isMultiple() && $(e.target).is('label')) {
				// // return;
				// }
				var $this = $(this), obj = [];
				if ($this.is(".disabled")) {
					return false;
				}
				if (_this._isSingle()) {
					obj = $this.data();
				} else if (_this._isMultiple()) {
					var $lis = _this.$ul.find('input:checked').parent().parent();
					$lis.each(function() {
						obj.push($(this).data());
					});
				}
				_this._chooseWithEvent(obj);
				e.stopPropagation();
			});
		},
		_isSingle : function() {
			return this.options.type === $.fn.select.TYPE.SINGLE;
		},
		_isMultiple : function() {
			return this.options.type === $.fn.select.TYPE.MULTIPLE;
		},
		_refreshCheckbox : function(){
			if (this._isMultiple()) {
				var $checkbox = this.$dropdown.find('input[type=checkbox]');
				$checkbox.prop('checked', false);
				var vals = this.$select.val() || [];
				for ( var i = 0; i < vals.length; i++) {
					this.$dropdown.find('li[data-val="' + vals[i] + '"]').find('input[type=checkbox]').prop('checked',true);
				}
			}
		},
		_chooseWithEvent : function(obj) {
			if (this.options.before) {
				var ret = this.options.before(obj);
				if (ret === false) {
					this.close();
					return;
				}
			}
			var old = this.$select.val(),
				oldstr = old && old.toString();
			this.choose(obj);
			if ((this.$select.val() && this.$select.val().toString()) !== oldstr) {
				this.$select.trigger('change');
			}
			if (this._isSingle()) {
				this.close();
			}
			if (this.options.after) {
				this.options.after(obj);
			}
			// for required.
			this.$button.trigger('blur');
		},
		choose : function(obj) {
			if (this._isSingle()) {
				this.$text.text(obj.text).attr('title', obj.text);
				this.$select.val(obj.val);
			} else if (this._isMultiple()) {
				var arrs = [], text = '';
				for ( var i = 0; i < obj.length; i++) {
					text += ', ' + obj[i].text;
					arrs.push(obj[i].val);
				}
				text = text.substring(2, text.length);
				this.$select.val(arrs);
				this.$text.text(text).attr('title', text);
			}
		},
		option : function(opts) {
			this.options = $.extend(this.options, opts);
		},
		_refreshList : function() {
			this.$ul.empty();
			this.list = {};
			var $opts = this.$select.find('option');
			var values = this.$select.val();
			for ( var i = 0; i < $opts.length; i++) {
				var $opt = $opts.eq(i);
				var $li = $('<li>');
				var obj = {
					text : $opt.text(),
					val : $opt.val()
				};
				this.list[obj.val] = $opt.text();
				$li.attr({
					'data-val' : obj.val,
					'data-text' : obj.text,
					'title' : obj.text
				});
				if (this.options.type === $.fn.select.TYPE.MULTIPLE) {
					var $label = $('<label>');
					var $checkbox = $('<input type="checkbox">');
					if ($.inArray(obj.val, values) !== -1) {
						$checkbox.attr('checked', true);
					}
					$label.append($checkbox).append(obj.text);
					$li.append($label);
				} else {
					$li.text(obj.text);
				}
				$opt.is(".disabled") ? $li.addClass("disabled").find("input").prop("disabled", true) : 0;
				this.$ul.append($li);
			}
		},
		open : function(event) {
			event.preventDefault();
			if (this.$element.is('.ui-widget-open')) {
				this.close();
				return;
			}
			if(this.$element.is('.ui-select-disabled')){
				return;
			}
			if (this.options.parent) {
				this.$dropdown.appendTo('body');
				this._addDropEvent();
				this._setOutDropListPosition();
				$(window).bind('resize.ui-select', $.proxy(this._setOutDropListPosition, this));
			}
			this.$element.toggleClass('ui-widget-open');
			$(document).bind('mousedown.ui-select', $.proxy(this.close, this));
		},
		_setOutDropListPosition : function(e) {
			var offset = this.$element.offset(),
				elmTop = offset.top,
				sclTop = $(document).scrollTop(),
				elmHeight = this.$element.height(),
				dropHeight = this.$dropdown.outerHeight(),
				docHeihgt = $(document).height(),
				offestTop = 0;
			if ((dropHeight + elmTop + elmHeight + 5) >= docHeihgt && dropHeight < elmTop) {
				this.$dropdown.addClass('ui-select-dropup');
				offestTop = -dropHeight;
			} else {
				this.$dropdown.removeClass('ui-select-dropup');
				offestTop = elmHeight;
			}
			this.$dropdown.css({
				width : this.$element.width(),
				top : elmTop + offestTop,
				left : offset.left
			});
		},
		close : function(e) {
			if (e && (this.$element.add(this.$dropdown).find(e.target).size() != 0 || this.$dropdown.is(e.target))) {
				return;
			}
			if (this.options.parent) {
				this.$dropdown.remove();
			}
			$(document).unbind('mousedown.ui-select');
			$(window).unbind('resize.ui-select');
			this.$element.removeClass('ui-widget-open');
		},
		value : function(val) {
			if (val === undefined) {
				var obj = this.$select.val();
				return obj ? obj : (this._isMultiple() ? [] : null);
			}
			if (this.$element) {
				this.choose(this._getObj(val));
				this._refreshCheckbox();
			} else {
				this.$select.data('value', val);
			}
		},
		title : function(title) {
			if (title === '') {
				this.$element.removeAttr('title');
			}else{
				this.$element.attr('title', title);
			}
		},
		error : function(err) {
			if (err) {
				this.$element.addClass('error');
			} else {
				this.$element.removeClass('error');
			}
		},
		data : function(data) {
			if (data) {
				this._generateList(data);
				this.refresh();
			} else {
				return this.list;
			}
		},
		widget : function(){
			return this.$element;
		},
		trigger : function(){
			null != this.$select.val() && this._chooseWithEvent(this._getObj(this.$select.val()));
		},
		_generateList : function(data){
			var selected = true;
			this.$select.empty();
			if ($.isArray(data)) {
				this.dataList = data;
				for ( var i = 0; i < data.length; i++) {
					var obj = data[i],
						$opt = $('<option>').attr('value', obj.value).text(obj.text).addClass(obj.disabled === true ? "disabled" : "");
					if (selected && !obj.disabled) {
						selected = false;
						$opt.prop("selected", true);
					}
					this.$select.append($opt);
				}
				if (selected) {
					this.$select.prepend($("<option>").text("").val("").prop("selected", true));
				}
			} else {
				this.dataList = undefined;
				for ( var key in data) {
					this.$select.append($('<option>').attr('value', key).text(data[key]));
				}
			}
		}
	};

	$.fn.select = function(option, value) {
		var methodReturn;
		var $set = this.each(function() {
			var $this = $(this);
			var data = $this.data('select');
			var options = typeof option === 'object' && option;
			if (!data) {
				$this.data('select', (data = new Select(this, options)));
			}
			if (typeof option === 'string') {
				methodReturn = data[option](value);
			}
		});
		return (methodReturn === undefined) ? $set : methodReturn;
	};

	$.fn.select.defaults = {
		type : 'S',
		parent : 'body'
	};
	$.fn.select.TYPE = {
		MULTIPLE : 'M',
		SINGLE : 'S'
	};
	$.fn.select.Constructor = Select;
	// END OF SELECT

	/**
	 * @param opts(string/JSON)
	 *            	String	:	提示信息内容（默认为提示）
	 *				JSON	:	生成提示框参数
	 *            		包括：
	 *						1.	msg		:	信息内容
	 *						2.	type	:	提示框类型，可选：alert/confirm/info/error
	 *						3.	title 	:	提示框标题，默认：警告/确认/提示/错误
	 * @return(jQuery Object)
	 *				返回对话框的jQuery对象
	 */
	$.msg = function(opts) {
		if (!$.isPlainObject(opts)) {
			opts = {
				msg : opts
			};
		}
		opts = $.extend({
			buttons : opts.type === 'confirm' ? {
				"确定" : function() {
					opts.ok && opts.ok.apply(this);
					$(this).dialog("destroy");
				},
				"取消" : function() {
					if($.isFunction(opts.cancel)){
						opts.cancel.apply(this);
					}
					$(this).dialog("destroy");
				}
			} : {
				"确定" : function() {
					opts.ok && opts.ok.apply(this);
					$(this).dialog("destroy");
				}
			}
		}, opts);
		if (opts.type == 'alert') {
			opts = $.extend({
				dialogClass : 'ui-dialog ui-alert',
				title : '警告'
			}, opts);
		} else if (opts.type == 'confirm') {
			opts = $.extend({
				dialogClass : 'ui-dialog ui-confirm',
				title : '确认',
				modal: true
			}, opts);
		} else if (opts.type == 'error') {
			opts = $.extend({
				dialogClass : 'ui-dialog ui-error',
				title : '错误'
			}, opts);
		} else {
			opts = $.extend({
				dialogClass : 'ui-dialog ui-info',
				title : '提示'
			}, opts);
		}
		var nopts = $.extend({}, {
			title : '警告',
			resizable : false,
			minHeight : 14,
			modal : opts.modal,
			buttons : {
				"确定" : function() {
					opts.ok && opts.ok.apply(this);
					$(this).dialog("destroy").remove();
				}
			},
			close : function() {
				opts.type === 'confirm' && $.isFunction(opts.cancel) && opts.cancel.apply(this);
				opts.type === 'info' && $.isFunction(opts.ok) && opts.ok.apply(this);
				$(this).dialog("destroy").remove();
			}
		}, opts);
		return $('<div>').html(opts.msg).dialog(nopts);
	};
	/**
	 * @param options(boolean)
	 **/
	$.fn.mask = function(options) {
		options = options == undefined ? true : options;
		var $this = $(this);
		if (options === true) {
			$this.addClass('ui-loading');
		} else {
			$this.removeClass('ui-loading');
		}
		return $this;
	};
	/**
	 * @param options(JSON)
	 *            JSON : AJAX参数(基于jQuery.ajax) 扩展属性包括：
	 *				1. data			:	发送数据（JSON对象）
	 *				2. name			: 	定义此次请求的名称（错误提示）
	 *				3. fail			：	返回data.success为false时执行
	 *				4. success		：	返回data.success为true时执行
	 *            	5. url			：	服务器地址
	 *            	6. type			：	默认为POST
	 *            	7. contentType	： 	默认为JSON
	 *              8. hideError	:	隐藏错误信息
	 * @return(jQuery Ajax Object) 返回jQuery Ajax对象
	 */
	$.ajaxJSON = function(options) {
		var opts = {
			el : options.iframe ? parent.document.body : 'body',
			identify : $.now()
		};
		if(!$.cookie('acf_ticket')){
			AJAX.error(options,{status:'401'});
			return;
		}
		opts = $.extend(opts, options, {
			error : function(jqXHR, tStatus, errorThrown) {
				AJAX.removeMask(opts);
				AJAX.error(options, jqXHR, tStatus, errorThrown, arguments);
			},
			success : function(data) {
				AJAX.removeMask(opts);
				AJAX.success(data, options, arguments);
			},
			dataType : 'json',
			type : options.type ? options.type : 'POST',
			//contentType : 'application/json; charset=UTF-8',
			url : AJAX.getUrl(options.url),
			data : options.data
				//$.extend(true,options.data,tokenObj )
				//options.data? ($.isPlainObject(options.data) ? JSON.stringify($.extend(true,options.data,tokenObj )) : options.data) : JSON.stringify(tokenObj)
		});
		AJAX.addMask(opts);
		return $.ajax(opts);
	};

	var AJAX = {
		error : function(options, jqXHR, tStatus, errorThrown, args) {
			options.error && options.error.apply(this, args);
			// TODO abort类型重新处理
			//如果是401，表明登录状态过期需要重新登录
			if(jqXHR.status == '401') {
				if(options.iframe) {
					window.parent.location.href = window.ROOT + '/login.html';
					return;
				}else{
					location.href = window.ROOT + '/login.html';
				}
			}
			if (!options.hideError) {
				$.msg({
					type : 'error',
					msg : (options.msg || '') + '失败，'
					+ ('timeout' === tStatus ?
						'请求超时' : ('abort' === tStatus
						? '求情已取消' : ('parsererror' === tStatus
						? '解析错误' : ('parsererror' === tStatus
						? '服务器错误' : '服务器错误[' + jqXHR.status + ']'))))
				});
			}
		},
		success : function(data, options, args) {
			if (data.code == 200) {
				options.success && options.success.apply(this, args);
			}else if(data.code == '401') {
				AJAX.error(options,{status:'401'});
			} else {
				options.fail && options.fail.apply(this, args);
				if (!options.hideError) {
					$.msg({type:'error',msg:data.msg});
				}
			}
		},
		removeMask : function(opts) {
			var $el = $(opts.el);
			if ($el.is('body') || $el.is(parent.document.body)) {
				$el.removeClass('ui-loading');
				AJAX.handler && clearTimeout(AJAX.handler);
				AJAX.handler = setTimeout(function() {
					if (!$el.is('[class*="ui-loading"]')) {
						$el.mask(false);
					}
				}, 200);
			}else{
				$el.mask(false);
			}
		},
		addMask : function(opts) {
			var $el = $(opts.el).mask();
			if ($el.is('body') || $el.is(parent.document.body)) {
				$el.addClass('ui-loading');
			}
		},
		getUrl : function(url){
			return url + "?acf_ticket=" + $.cookie('acf_ticket');
		}
	};
	var Error = {
		generateList : function(list) {
			var $ul = $('<ul class="error-list">');
			for ( var i = 0; i < list.length; i++) {
				var $li = $('<li>'), error = list[i];
				$li.text(error.message === '' ? '未知错误' : error.message);
				$ul.append($li);
			}
			$ul.hide().appendTo('body');
			return $ul.dialog({
				dialogClass : 'ui-dialog ui-error',
				title : '错误',
				minHeight : 14,
				minWidth : $ul.outerWidth() * 1.4,
				close : function() {
					$(this).dialog("destroy").remove();
				},
				buttons : {
					"确定" : function() {
						$(this).dialog("destroy").remove();
					}
				}
			});
		}
	};
	/**
	 * @param qstr(string)
	 *            	需要获取参数的URL
	 *
	 * @return(JSON)
	 * 				返回参数值JSON对象
	 */
	$.getQueryParams = function(qstr) {
		qstr = qstr || location.search;
		var index = qstr.indexOf('?'), //
			params = {};
		if (index != -1) {
			qstr = qstr.substring(index + 1);
		}
		if (qstr) {
			qstr = qstr.split('&');
			for ( var i in qstr) {
				var kv = qstr[i].split('=');
				params[kv[0]] = kv[1] || '';
			}
		}
		return params;
	};
/**
 *@param beforeDateNum(number)
 *@param afterDateNum(number)
 **/
	var DatePicker = function(element,options){
		this.init(element,options);
	};
	DatePicker.prototype = {
		constructor : DatePicker,
		init : function(element,options){
			this.beforeDateNum = options.beforeDateNum ? options.beforeDateNum : 28;
			this.afterDateNum = options.afterDateNum ? options.afterDateNum : 30;

			this.$element = $(element);
			this.$dateBox = $("<div class='clearfix'></div>").appendTo(element);
			this.$dateBtn = $("<span></span>").appendTo(this.$dateBox);
			this.$dateBox.append("<span class='arrow'></span>");
			this.$dateHoverBox = $("<div class='dateHoverBox'></div>").insertAfter(element);
			this.$dateHoverBox.append("<p>设置监测时间范围：</p>");
			this.$sliderBox = $("<div class='sliderBox'></div>").appendTo(this.$dateHoverBox);
			this.$sliderTip = $("<div class='sliderTip'></div>").appendTo(this.$dateHoverBox);
			this.$confirmBtn = $("<a href='#' class='confirmBtn'>确定</a>").appendTo(this.$dateHoverBox);
			this.filterDateNum(this.$dateBtn);
			this.bindEvent();

			this.onSaveDate = function(){};
			if(options.onSaveDate){
				if(typeof options.onSaveDate == "function"){
					this.onSaveDate = options.onSaveDate;
				}
			}
		},
		bindEvent : function(){
			var that = this;
			this.$dateBox.on("click",function(){
				that.openHoverBox();
			});
			this.$confirmBtn.on('click',function(){
				that.onSaveDate(that.beforeDateNum,that.afterDateNum);
				var beforeText = this.beforeDateNum > 0 ? ("前 "+ this.beforeDateNum) : ("后 " + this.beforeDateNum*-1);
				var afterText = this.afterDateNum > 0  ? ("前 "+ this.afterDateNum) : ("后 " + this.afterDateNum*-1);
				that.$dateBtn.html("<span>今天"+ beforeText +" 至"+ afterText +"天</span>");
				that._close();
			});
			$("body").on("click",function(e){
				var $el = $(e.target);
				if($el.parents(".dateHoverBox").length == 0 && !($el[0].className == 'dateHoverBox') && $el.parents(".dateBox").length == 0){
					that._close();
				}
			});
		},

		openHoverBox : function(){
			$(".dateBox").removeClass("active");
			$(".dateHoverBox").hide();
			this.$element.addClass("active");
			this.$dateHoverBox.show();

			this._initSlider(this.$sliderBox);
		},
		filterDateNum : function($ele){
			var beforeText = this.beforeDateNum > 0 ? ("前"+this.beforeDateNum) : ("后" + this.beforeDateNum * -1);
			var afterText = this.afterDateNum > 0 ? ("后" + this.afterDateNum) : ("前" + this.afterDateNum * -1);
			$ele.text("今天"+ beforeText +"天 至"+ afterText +"天");
		},
		_initSlider : function($ele){
			var that = this;
			this.filterDateNum($ele.next(".sliderTip"));
			$ele.slider({
				range: true,
				min: -90,
				max: 30,
				values: [that.beforeDateNum*-1 , that.afterDateNum],
				slide: function( event, ui ) {
					that.beforeDateNum = ui.values[ 0 ] * -1;
					that.afterDateNum = ui.values[ 1 ];
					that.filterDateNum($ele.next(".sliderTip"));
				}
			});
		},
		_close : function(){
			this.$element.removeClass("active");
			this.$dateHoverBox.hide();
		}
	};
	$.fn.datePicker = function(option, value) {
		var methodReturn;
		var $set = this.each(function() {
			var $this = $(this);
			var data = $this.data('datePicker');
			var options = typeof option === 'object' && option;
			if (!data) {
				$this.data('datePicker', (data = new DatePicker(this, options)));
			}
			if (typeof option === 'string') {
				methodReturn = data[option](value);
			}
		});
		return (methodReturn === undefined) ? $set : methodReturn;
	};
	$.fn.datePicker.constructor = DatePicker;
	/**
	 添加手机品牌、型号列表
	 @param label(string)
	 @param data(array)
	 **/
	var SelectorPlusPro = function(element,options){
		this.label = options.label ? options.label : "请选择目标产品：";
		this.data = options.data;
		this.selectedData = [];
		if(options.phoneModel){
			for(var i = 0; i < options.phoneModel.length;i++){
				this.selectedData.push({
					"id" : options.phoneModel[i].id,
					"brandName": options.phoneModel[i].brandName,
					"modelName" : options.phoneModel[i].modelName,
					"releaseDate" : options.phoneModel[i].releaseDate,
					"logoUrl" : options.phoneModel[i].picUrl
				});
			}
		}
		console.log(options);
		console.log(this.selectedData);
		this._init(element,options);
	};
	SelectorPlusPro.prototype = {
		constructor : SelectorPlusPro,
		_init : function(element,options){
			this.$element = $(element);
			this.$sBox = $("<div class='sBox'></div>").appendTo(this.$element);
			this.$label = $("<label>"+ this.label +"</label>").appendTo(this.$sBox);
			this.$brands = $("<select class='brands'></select>").appendTo(this.$sBox);
			this.$models = $("<select class='models'></select>").appendTo(this.$sBox);
			this.$addBtn = $("<a href='javascript:;' class='addBtn'><i class='icon iconfont icon-iconadd'></i></a>").appendTo(this.$sBox);
			this.$rBox = $("<div class='rBox'></div>").appendTo(this.$element);


			this._renderCondition();
			this._bindEvent();
		},
		_renderCondition : function(){
			var arr = [],
				modelsObj = {},
				that = this;
			if(!this.data){
				this.$brands.select('data',[{text:"请选择",value:-1}]);
				this.$models.select('data',[{text:"请选择",value:-1}]);
			}else {
				for (var i = 0; i < this.data.brands.length; i++) {
					var item = this.data.brands[i];
					arr.push({
						text: item.brandName,
						value: item.brandCode
					});
					modelsObj[item.brandCode] = [];
					for (var j = 0; j < item.models.length; j++) {
						modelsObj[item.brandCode].push({
							text: item.models[j].modelName,
							value: item.models[j].modelCode
						})
					}
				}
				this.$brands.select('data', arr).select("trigger");
				this.$brands.on("change",function () {
					var val = $(this).val();
					that.$models.select("destroy").select('data', modelsObj[val]);

				});
				this.$brands.trigger("change");
			}
			for(var i = 0;i < this.selectedData.length;i++) {
				console.log(this.selectedData[i]);
				var item = this.selectedData[i];
				this.$proWrapper = $("<div class='proWrapper'></div>").appendTo(this.$rBox);
				this.$pro = $("<div class='pro clearfix'><img src='" + item.logoUrl +"' class='phoneThumb'/></div>").appendTo(this.$proWrapper);
				this.$proInfo = $("<div class='info'><p>"+ item.brandName +" - "+ item.modelName +"</p><p class='pubDate'>"+ item.releaseDate +"</p></div>").appendTo(this.$pro);
				this.$proDelBtn = $("<i class='icon iconfont icon-icondel' modelCode='"+ item.id +"'></i>").appendTo(this.$pro);
			}
		},
		_addBrandsTpl : function(){
			var brandCode = this.$brands.val();
			var brandsIndex = this.$brands[0].selectedIndex;
			var modelsIndex = this.$models[0].selectedIndex;
			var item = this.data.brands[brandsIndex].models[modelsIndex];
			var isExist = false;
			for(var i = 0; i < this.selectedData.length;i++){
				if(item.modelCode == this.selectedData[i]["id"]){
					isExist = true;
					break;
				}
			}
			if(isExist){
				$.msg(this.data.brands[brandsIndex].brandName + " - " + item.modelName + "已存在，请勿重复添加");
				return;
			}
			this.$proWrapper = $("<div class='proWrapper'></div>").appendTo(this.$rBox);
			this.$pro = $("<div class='pro clearfix'><img src='" + item.logoUrl +"' class='phoneThumb'/></div>").appendTo(this.$proWrapper);
			this.$proInfo = $("<div class='info'><p>"+ this.data.brands[brandsIndex].brandName +" - "+ item.modelName +"</p><p class='pubDate'>"+ item.pubDate +"</p></div>").appendTo(this.$pro);
			this.$proDelBtn = $("<i class='icon iconfont icon-icondel' modelCode='"+ item.modelCode +"'></i>").appendTo(this.$pro);
			this.selectedData.push({
				"id" : item.modelCode,
				"brandName": this.data.brands[brandsIndex].brandName,
				"modelName" : item.modelName,
				"releaseDate" : item.pubDate
			});
		},
		_delSource : function(modelCode){
			for(var i = 0 ; i < this.selectedData.length;i++){
				if(modelCode == this.selectedData[i].id){
					this.selectedData.splice(i,1);
					break;
				}
			}
		},
		getData : function(){
			return this.selectedData;
		},
		_bindEvent : function(){
			var that = this;
			this.$addBtn.on("click",function(){
				that._addBrandsTpl();
			});
			this.$rBox.delegate(".icon-icondel",'click',function(){
				$(this).parents(".proWrapper").remove();
				var modelCode = $(this).attr("modelCode");
				that._delSource(modelCode);
			});
		}
	};
	$.fn.selectorPlusPro = function(option, value) {
		var methodReturn;
		var $set = this.each(function() {
			var $this = $(this);
			var data = $this.data('selectorPlusPro');
			var options = typeof option === 'object' && option;
			if (!data) {
				$this.data('selectorPlusPro', (data = new SelectorPlusPro(this, options)));
			}
			if (typeof option === 'string') {
				methodReturn = data[option](value);
			}
		});
		return (methodReturn === undefined) ? $set : methodReturn;
	};
	$.fn.selectorPlusPro.constructor = SelectorPlusPro;
	/**
	 添加信源列表
	 @param label(string)
	 @param data(array)
	 **/
	var SelectorPlusSource = function(element,options){
		this.label = options.label ? options.label : "请选择信息来源：";
		this.data = options.data;
		this.selectedData = [];
		this._init(element,options);
	};
	SelectorPlusSource.prototype = {
		constructor : SelectorPlusSource,
		_init : function(element,options){
			this.$element = $(element);
			this.$sBox = $("<div class='sBox'></div>").appendTo(this.$element);
			this.$label = $("<label>"+ this.label +"</label>").appendTo(this.$sBox);
			this.$source = $("<select class='source'></select>").appendTo(this.$sBox);
			this.$addBtn = $("<a href='javascript:;' class='addBtn'><i class='icon iconfont icon-iconadd'></i></a>").appendTo(this.$sBox);
			this.$rBox = $("<div class='rBox'></div>").appendTo(this.$element);


			this._renderCondition();
			this._bindEvent();
		},
		_renderCondition : function(){
			if(!this.data){
				this.$source.select('data',[{text:"请选择",value:-1}]);
			}else {
				var arr = [],
					modelsObj = {};
				for (var i = 0; i < this.data.length; i++) {
					var item = this.data[i];
					arr.push({
						text: item.srcName,
						value: item.srcKey
					})
				}
				this.$source.select('data', arr);
			}
		},
		_addSourceTpl : function(){
			var sourceId = this.$source.val();
			var sourceIndex = this.$source[0].selectedIndex;
			var isExist = false;
			for(var i = 0; i < this.selectedData.length;i++){
				if(sourceId == this.selectedData[i]["srcKey"]){
					isExist = true;
					break;
				}
			}
			if(isExist){
				$.msg(this.data[sourceIndex].srcName + "已存在，请勿重复添加");
				return;
			}
			this.$proWrapper = $("<div class='proWrapper'></div>").appendTo(this.$rBox);
			this.$pro = $("<div class='pro clearfix'>").appendTo(this.$proWrapper);
			this.$proInfo = $("<div class='info clearfix'><p>"+ this.data[sourceIndex].srcName +"</p></div>").appendTo(this.$pro);

			this.$proDelBtn = $("<i class='icon iconfont icon-icondel' data-id="+ this.data[sourceIndex].srcKey +"></i>").appendTo(this.$pro);
			this.selectedData.push({
				"srcKey" : this.data[sourceIndex].srcKey,
				"srcName" : this.data[sourceIndex].srcName
			});
		},
		_delSource : function(srcKey){
			for(var i = 0 ; i < this.selectedData.length;i++){
				if(srcKey == this.selectedData[i].srcKey){
					this.selectedData.splice(i,1);
					break;
				}
			}
		},
		getData :　function(){
			return this.selectedData;
		},

		_bindEvent : function(){
			var that = this;
			this.$addBtn.on("click",function(){
				that._addSourceTpl();
			});
			this.$rBox.delegate(".icon-icondel",'click',function(){
				$(this).parents(".proWrapper").remove();
				var srcKey = $(this).attr("data-id");
				that._delSource(srcKey);
			});
		}
	};
	$.fn.selectorPlusSource = function(option, value) {
		var methodReturn;
		var $set = this.each(function() {
			var $this = $(this);
			var data = $this.data('selectorPlusSource');
			var options = typeof option === 'object' && option;
			if (!data) {
				$this.data('selectorPlusSource', (data = new SelectorPlusSource(this, options)));
			}
			if (typeof option === 'string') {
				methodReturn = data[option](value);
			}
		});
		return (methodReturn === undefined) ? $set : methodReturn;
	};
	$.fn.selectorPlusSource.constructor = SelectorPlusSource;
})(window.jQuery);



