(function($) {
	// START OF DATETIMEPICKER
	{
		var smartPhone = (window.orientation != undefined);
		var DateTimePicker = function(element, options) {
			this.id = dpgId++;
			this.init(element, options);
		};
	
		var dateToDate = function(dt) {
			if (typeof dt === 'string') {
				return new Date(dt);
			}
			return dt;
		};
	
		DateTimePicker.prototype = {
			constructor : DateTimePicker,
	
			init: function(element, options) {
				var icon;
				if (!(options.pickTime || options.pickDate))
					throw new Error('Must choose at least one picker');
				this.options = options;
				this.$element = $(element);
				this.language = options.language in dates ? options.language : 'zh-CN';
				this.pickDate = options.pickDate;
				this.pickTime = options.pickTime;
				this.onSelect = options.onSelect;
				this.isInput = this.$element.is('input');
				this.component = false;
				if (this.$element.find('.input-append').length || this.$element.find('.input-prepend').length)
					this.component = this.$element.find('.add-on');
				this.format = options.format;
				if (!this.format) {
					if (this.isInput)
						this.format = this.$element.data('format');
					else
						this.format = this.$element.find('input').data('format');
					if (!this.format) {
						if (this.pickTime && this.pickDate)
							this.format = 'yyyy-MM-dd hh:mm';
						else if (this.pickDate)
							this.format = 'yyyy-MM-dd';
						else if (this.pickTime)
							this.format = 'hh:mm';
					}
				}
				this._compileFormat();
				this.timeIcon = 'icon-time';
				this.dateIcon = 'icon-calendar',
	// if (this.component) {
	//        icon = this.component.find('i');
	//      }
	//      if (this.pickTime) {
	//        if (icon && icon.length) this.timeIcon = icon.data('time-icon');
	//        if (!this.timeIcon) this.timeIcon = 'icon-time';
	//        icon.addClass(this.timeIcon);
	//      }
	//      if (this.pickDate) {
	//        if (icon && icon.length) this.dateIcon = icon.data('date-icon');
	//        if (!this.dateIcon) this.dateIcon = 'icon-calendar';
	//        icon.removeClass(this.timeIcon);
	//        icon.addClass(this.dateIcon);
	//      }
				this.widget = $(getTemplate(this.timeIcon, options.pickDate, options.pickTime, options.pick12HourFormat, options.pickSeconds, options.collapse, options.showAll))
						.appendTo('body');
				this.minViewMode = options.minViewMode || this.$element.data('date-minviewmode') || 0;
				if (typeof this.minViewMode === 'string') {
					switch (this.minViewMode) {
					case 'months':
						this.minViewMode = 1;
						break;
					case 'years':
						this.minViewMode = 2;
						break;
					default:
						this.minViewMode = 0;
						break;
					}
				}
				this.viewMode = options.viewMode || this.$element.data('date-viewmode') || 0;
				if (typeof this.viewMode === 'string') {
					switch (this.viewMode) {
					case 'months':
						this.viewMode = 1;
						break;
					case 'years':
						this.viewMode = 2;
						break;
					default:
						this.viewMode = 0;
						break;
					}
				}
				options.date && this.setDate(options.date);
				if (this.$element.val()) {
					this.setDate(this.$element.val());
				} else {
					this._unset = true;
				}
				this.startViewMode = this.viewMode;
				this.weekStart = options.weekStart || this.$element.data('date-weekstart') || 0;
				this.weekEnd = this.weekStart === 0 ? 6 : this.weekStart - 1;
				this.setStartDate(options.startDate == undefined ? this.$element.data('date-startdate') : options.startDate);
				this.setEndDate(options.endDate == undefined ? this.$element.data('date-enddate') : options.endDate);
				this.fillDow();
				this.fillMonths();
				this.fillHours();
				this.fillMinutes();
				this.fillSeconds();
				this.update();
				this.showMode();
				this._attachDatePickerEvents();
			},
	
		    show : function(e) {
				this.widget.show();
				this.height = this.component ? this.component.outerHeight() : this.$element.outerHeight();
				this.place();
				this.$element.trigger({
					type : 'show',
					date : this._date
				});
				this._attachDatePickerGlobalEvents();
				if (e) {
					e.stopPropagation();
					e.preventDefault();
				}
			},
			
			disable : function() {
				this.$element.prop('disabled', true);
				this._detachDatePickerEvents();
			},
			enable : function() {
				this.$element.prop('disabled', false);
				this._attachDatePickerEvents();
			},
	
		    hide : function(e) {
				if (e && this.$element.is(e.target)) {
					return;
				}
				// Ignore event if in the middle of a picker transition
				var collapse = this.widget.find('.collapse');
				for ( var i = 0; i < collapse.length; i++) {
					var collapseData = collapse.eq(i).data('collapse');
					if (collapseData && collapseData.transitioning)
						return;
				}
				this.widget.hide();
				this.viewMode = this.startViewMode;
				this.showMode();
				this.resetView();
				this.set();
				this.$element.trigger({
					type : 'hide',
					date : this._date
				});
				this._detachDatePickerGlobalEvents();
			},
			
			hideAndCheckInput : function(e) {
				if (e && this.$element.is(e.target)) {
					return;
				}
				// Ignore event if in the middle of a picker transition
				var collapse = this.widget.find('.collapse');
				for ( var i = 0; i < collapse.length; i++) {
					var collapseData = collapse.eq(i).data('collapse');
					if (collapseData && collapseData.transitioning)
						return;
				}
				this.widget.hide();
				this.viewMode = this.startViewMode;
				this.showMode();
				this.resetView();
				var value = this.$element.val(), 
				date = this.parseDate(value);
				if(date == '' && value == '')
					this.setDate(date);
				this._detachDatePickerGlobalEvents();
				
			},
			
		    set : function() {
				var formatted = '';
//				if (!this._unset)
					formatted = this.formatDate(this._date);
				if (!this.isInput) {
					if (this.component) {
						var input = this.$element.find('input');
						input.val(formatted);
						this._resetMaskPos(input);
					}
					this.$element.data('date', formatted);
				} else {
					this.$element.val(formatted);
					this._resetMaskPos(this.$element);
				}
			},
	
		    setValue : function(newDate) {
				if (!newDate) {
					this._unset = true;
					this.$element.val('');
					return;
				} else {
					this._unset = false;
				}
				if (typeof newDate === 'string') {
					this._date = this.parseDate(newDate);
				} else if (newDate) {
					this._date = new Date(newDate);
				}
				this.set();
				this.viewDate = new Date(this._date.getFullYear(), this._date.getMonth(), 1, 0, 0, 0, 0);
				this.fillDate();
				this.fillTime();
			},
	
		    getDate : function() {
				if (this._unset)
					return '';
				return new Date(this._date.valueOf());
			},
	
			setDate : function(date) {
				if (!date)
					this.setValue(null);
				else
					this.setValue(date.valueOf());
			},
	
		    setStartDate : function(date) {
				if (date instanceof Date) {
					this.startDate = date;
				} else if (typeof date === 'string') {
					this.startDate = new Date(date);
					if (!this.startDate.getFullYear()) {
						this.startDate = -Infinity;
					}
				} else if (typeof date === 'number') {
					var dt = new Date();
					this.startDate = new Date().setDate(dt.getDate() + date);
				} else {
					this.startDate = -Infinity;
				}
				if (this.viewDate) {
					this.update();
				}
			},
	
		    setEndDate : function(date) {
				if (date instanceof Date) {
					this.endDate = date;
				} else if (typeof date === 'string') {
					this.endDate = new Date(date);
					if (!this.endDate.getFullYear()) {
						this.endDate = Infinity;
					}
				} else if (typeof date === 'number') {
					var dt = new Date();
					this.endDate = new Date().setDate(dt.getDate() + date);
				} else {
					this.endDate = Infinity;
				}
				if (this.viewDate) {
					this.update();
				}
			},
	
		    getLocalDate : function() {
				if (this._unset)
					return null;
				var d = this._date;
				return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d
						.getMilliseconds());
			},
	
		    setLocalDate : function(localDate) {
				if (!localDate)
					this.setValue(null);
				else
					this.setValue(new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), localDate.getHours(), localDate
							.getMinutes(), localDate.getSeconds(), localDate.getMilliseconds()));
			},
	
		    place : function() {
				var position = 'absolute';
				var offset = this.component ? this.component.offset() : this.$element.offset();
				this.width = this.component ? this.component.outerWidth() : this.$element.outerWidth();
				offset.top = offset.top + this.height;
	
				var $window = $(window);
	
				if (this.options.width != undefined) {
					this.widget.width(this.options.width);
				}
	
				if (this.options.orientation == 'left') {
					this.widget.addClass('left-oriented');
					offset.left = offset.left - this.widget.width() + 20;
				}
	
				if (this._isInFixed()) {
					position = 'fixed';
					offset.top -= $window.scrollTop();
					offset.left -= $window.scrollLeft();
				}
	
				if ($window.width() < offset.left + this.widget.outerWidth()) {
					offset.right = $window.width() - offset.left - this.width;
					offset.left = 'auto';
					this.widget.addClass('pull-right');
				} else {
					offset.right = 'auto';
					this.widget.removeClass('pull-right');
				}
	
				this.widget.css({
					position : position,
					top : offset.top,
					left : offset.left,
					right : offset.right
				});
			},
	
		    notifyChange : function() {
				this.onSelect && this.onSelect(this.getDate());
				this.$element.trigger({
					type : 'changeDate',
					date : this.getDate(),
					localDate : this.getLocalDate()
				});
			},
	
		    update : function(newDate) {
				var dateStr = newDate;
				if (!dateStr) {
					if (this.isInput) {
						dateStr = this.$element.val();
					} else {
						dateStr = this.$element.find('input').val();
					}
					if (dateStr) {
						this._date = this.parseDate(dateStr);
					}
					if (!this._date) {
						var tmp = new Date();
						this._date = new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate(), tmp.getHours(), tmp.getMinutes(), tmp.getSeconds(), tmp
								.getMilliseconds());
					}
				}
				this.viewDate = new Date(this._date.getFullYear(), this._date.getMonth(), 1, 0, 0, 0, 0);
				this.fillDate();
				this.fillTime();
			},
	
		    fillDow : function() {
				var dowCnt = this.weekStart;
				var html = $('<tr>');
				while (dowCnt < this.weekStart + 7) {
					html.append('<th class="dow">' + dates[this.language].daysMin[(dowCnt++) % 7] + '</th>');
				}
				this.widget.find('.datepicker-days thead').append(html);
			},
	
		    fillMonths : function() {
				var html = '';
				var i = 0;
				while (i < 12) {
					html += '<span class="month">' + dates[this.language].monthsShort[i++] + '</span>';
				}
				this.widget.find('.datepicker-months td').append(html);
			},
	
			fillDate: function() {
				var year = this.viewDate.getFullYear();
				var month = this.viewDate.getMonth();
				var currentDate = new Date(this._date.getFullYear(), this._date.getMonth(), this._date.getDate(), 0, 0, 0, 0);
				var startYear = typeof this.startDate === 'object' ? this.startDate.getFullYear() : -Infinity;
				var startMonth = typeof this.startDate === 'object' ? this.startDate.getMonth() : -1;
				var endYear = typeof this.endDate === 'object' ? this.endDate.getFullYear() : Infinity;
				var endMonth = typeof this.endDate === 'object' ? this.endDate.getMonth() : 12;
	
				this.widget.find('.datepicker-days').find('.disabled').removeClass('disabled');
				this.widget.find('.datepicker-months').find('.disabled').removeClass('disabled');
				this.widget.find('.datepicker-years').find('.disabled').removeClass('disabled');
	
				this.widget.find('.datepicker-days th:eq(1)').text(dates[this.language].months[month] + ' ' + year);
	
				var prevMonth = new Date(year, month - 1, 28, 0, 0, 0, 0);
				var day = DPGlobal.getDaysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());
				prevMonth.setDate(day);
				prevMonth.setDate(day - (prevMonth.getDay() - this.weekStart + 7) % 7);
				if ((year == startYear && month <= startMonth) || year < startYear) {
					this.widget.find('.datepicker-days th:eq(0)').addClass('disabled');
				}
				if ((year == endYear && month >= endMonth) || year > endYear) {
					this.widget.find('.datepicker-days th:eq(2)').addClass('disabled');
				}
	
				var nextMonth = new Date(prevMonth.valueOf());
				nextMonth.setDate(nextMonth.getDate() + 42);
				nextMonth = nextMonth.valueOf();
				var html = [];
				var row;
				var clsName;
				while (prevMonth.valueOf() < nextMonth) {
					if (prevMonth.getDay() === this.weekStart) {
						row = $('<tr>');
						html.push(row);
					}
					clsName = '';
					if (prevMonth.getFullYear() < year || (prevMonth.getFullYear() == year && prevMonth.getMonth() < month)) {
						clsName += ' old';
					} else if (prevMonth.getFullYear() > year || (prevMonth.getFullYear() == year && prevMonth.getMonth() > month)) {
						clsName += ' new';
					}
					if (prevMonth.valueOf() === currentDate.valueOf()) {
						clsName += ' active';
					}
					if ((prevMonth.valueOf() + 86400000) <= this.startDate) {
						clsName += ' disabled';
					}
					if (prevMonth.valueOf() > this.endDate) {
						clsName += ' disabled';
					}
					row.append('<td class="day' + clsName + '">' + prevMonth.getDate() + '</td>');
					prevMonth.setDate(prevMonth.getDate() + 1);
				}
				this.widget.find('.datepicker-days tbody').empty().append(html);
				var currentYear = this._date.getFullYear();
	
				var months = this.widget.find('.datepicker-months').find('th').removeClass('disabled').end().find('th:eq(1)').text(year).end().find('span').removeClass('active');
				if (currentYear === year) {
					months.eq(this._date.getMonth()).addClass('active');
				}
				if (year - 1 < startYear) {
					this.widget.find('.datepicker-months th:eq(0)').addClass('disabled');
				}
				if (year + 1 > endYear) {
					this.widget.find('.datepicker-months th:eq(2)').addClass('disabled');
				}
				for ( var i = 0; i < 12; i++) {
					if ((year == startYear && startMonth > i) || (year < startYear)) {
						$(months[i]).addClass('disabled');
					} else if ((year == endYear && endMonth < i) || (year > endYear)) {
						$(months[i]).addClass('disabled');
					}
				}
	
				html = '';
				year = parseInt(year / 10, 10) * 10;
				var yearCont = this.widget.find('.datepicker-years').find('th:eq(1)').text(year + '-' + (year + 9)).end().find('td');
				this.widget.find('.datepicker-years').find('th').removeClass('disabled');
				if (startYear > year) {
					this.widget.find('.datepicker-years').find('th:eq(0)').addClass('disabled');
				}
				if (endYear < year + 9) {
					this.widget.find('.datepicker-years').find('th:eq(2)').addClass('disabled');
				}
				year -= 1;
				for ( var i = -1; i < 11; i++) {
					html += '<span class="year' + (i === -1 || i === 10 ? ' old' : '') + (currentYear === year ? ' active' : '')
							+ ((year < startYear || year > endYear) ? ' disabled' : '') + '">' + year + '</span>';
					year += 1;
				}
				yearCont.html(html);
			},
	
		    fillHours : function() {
				var table = this.widget.find('.timepicker .timepicker-hours table');
				table.parent().hide();
				var html = '';
				if (this.options.pick12HourFormat) {
					var current = 1;
					for ( var i = 0; i < 3; i += 1) {
						html += '<tr>';
						for ( var j = 0; j < 4; j += 1) {
							var c = current.toString();
							html += '<td class="hour">' + padLeft(c, 2, '0') + '</td>';
							current++;
						}
						html += '</tr>';
					}
				} else {
					var current = 0;
					for ( var i = 0; i < 6; i += 1) {
						html += '<tr>';
						for ( var j = 0; j < 4; j += 1) {
							var c = current.toString();
							html += '<td class="hour">' + padLeft(c, 2, '0') + '</td>';
							current++;
						}
						html += '</tr>';
					}
				}
				table.html(html);
			},
	
		    fillMinutes : function() {
				var table = this.widget.find('.timepicker .timepicker-minutes table');
				table.parent().hide();
				var html = '';
				var current = 0;
				for ( var i = 0; i < 5; i++) {
					html += '<tr>';
					for ( var j = 0; j < 4; j += 1) {
						var c = current.toString();
						html += '<td class="minute">' + padLeft(c, 2, '0') + '</td>';
						current += 3;
					}
					html += '</tr>';
				}
				table.html(html);
			},
	
		    fillSeconds : function() {
				var table = this.widget.find('.timepicker .timepicker-seconds table');
				table.parent().hide();
				var html = '';
				var current = 0;
				for ( var i = 0; i < 5; i++) {
					html += '<tr>';
					for ( var j = 0; j < 4; j += 1) {
						var c = current.toString();
						html += '<td class="second">' + padLeft(c, 2, '0') + '</td>';
						current += 3;
					}
					html += '</tr>';
				}
				table.html(html);
			},
	
		    fillTime : function() {
				if (!this._date)
					return;
				var timeComponents = this.widget.find('.timepicker span[data-time-component]');
				var table = timeComponents.closest('table');
				var is12HourFormat = this.options.pick12HourFormat;
				var hour = this._date.getHours();
				var period = 'AM';
				if (is12HourFormat) {
					if (hour >= 12)
						period = 'PM';
					if (hour === 0)
						hour = 12;
					else if (hour != 12)
						hour = hour % 12;
					this.widget.find('.timepicker [data-action=togglePeriod]').text(period);
				}
				hour = padLeft(hour.toString(), 2, '0');
				var minute = padLeft(this._date.getMinutes().toString(), 2, '0');
				var second = padLeft(this._date.getSeconds().toString(), 2, '0');
				timeComponents.filter('[data-time-component=hours]').text(hour);
				timeComponents.filter('[data-time-component=minutes]').text(minute);
				timeComponents.filter('[data-time-component=seconds]').text(second);
			},
	
		    click : function(e) {
				e.stopPropagation();
				e.preventDefault();
				this._unset = false;
				var target = $(e.target).closest('span, td, th');
				if (target.length === 1) {
					if (!target.is('.disabled')) {
						switch (target[0].nodeName.toLowerCase()) {
						case 'th':
							switch (target[0].className) {
							case 'switch':
								this.showMode(1);
								break;
							case 'prev':
							case 'next':
								var vd = this.viewDate;
								var navFnc = DPGlobal.modes[this.viewMode].navFnc;
								var step = DPGlobal.modes[this.viewMode].navStep;
								if (target[0].className === 'prev')
									step = step * -1;
								vd['set' + navFnc](vd['get' + navFnc]() + step);
								this.fillDate();
								this.set();
								break;
							}
							break;
						case 'span':
							if (target.is('.month')) {
								var month = target.parent().find('span').index(target);
								this.viewDate.setMonth(month);
							} else {
								var year = parseInt(target.text(), 10) || 0;
								this.viewDate.setFullYear(year);
							}
							if (this.viewMode !== 0) {
								this._date = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), this.viewDate.getDate(), this._date
										.getHours(), this._date.getMinutes(), this._date.getSeconds(), this._date.getMilliseconds());
								this.notifyChange();
							}
							this.showMode(-1);
							this.fillDate();
							this.set();
							break;
						case 'td':
							if (target.is('.day')) {
								var day = parseInt(target.text(), 10) || 1;
								var month = this.viewDate.getMonth();
								var year = this.viewDate.getFullYear();
								if (target.is('.old')) {
									if (month === 0) {
										month = 11;
										year -= 1;
									} else {
										month -= 1;
									}
								} else if (target.is('.new')) {
									if (month == 11) {
										month = 0;
										year += 1;
									} else {
										month += 1;
									}
								}
								this._date = new Date(year, month, day, this._date.getHours(), this._date.getMinutes(), this._date.getSeconds(),
										this._date.getMilliseconds());
								this.viewDate = new Date(year, month, Math.min(28, day), 0, 0, 0, 0);
								this.fillDate();
								this.set();
								this.notifyChange();
								if (this.pickDate && !this.pickTime) {
									this.hide();
								}
							}
							break;
						}
					}
				}
			},
	
		    actions : {
				incrementHours : function(e) {
					this._date.setHours(this._date.getHours() + 1);
				},
	
				incrementMinutes : function(e) {
					this._date.setMinutes(this._date.getMinutes() + 1);
				},
	
				incrementSeconds : function(e) {
					this._date.setSeconds(this._date.getSeconds() + 1);
				},
	
				decrementHours : function(e) {
					this._date.setHours(this._date.getHours() - 1);
				},
	
				decrementMinutes : function(e) {
					this._date.setMinutes(this._date.getMinutes() - 1);
				},
	
				decrementSeconds : function(e) {
					this._date.setSeconds(this._date.getSeconds() - 1);
				},
	
				togglePeriod : function(e) {
					var hour = this._date.getHours();
					if (hour >= 12)
						hour -= 12;
					else
						hour += 12;
					this._date.setHours(hour);
				},
	
				showPicker : function() {
					this.widget.find('.timepicker > div:not(.timepicker-picker)').hide();
					this.widget.find('.timepicker .timepicker-picker').show();
				},
	
				showHours : function() {
					this.widget.find('.timepicker .timepicker-picker').hide();
					this.widget.find('.timepicker .timepicker-hours').show();
				},
	
				showMinutes : function() {
					this.widget.find('.timepicker .timepicker-picker').hide();
					this.widget.find('.timepicker .timepicker-minutes').show();
				},
	
				showSeconds : function() {
					this.widget.find('.timepicker .timepicker-picker').hide();
					this.widget.find('.timepicker .timepicker-seconds').show();
				},
	
				selectHour : function(e) {
					var tgt = $(e.target);
					var value = parseInt(tgt.text(), 10);
					if (this.options.pick12HourFormat) {
						var current = this._date.getHours();
						if (current >= 12) {
							if (value != 12)
								value = (value + 12) % 24;
						} else {
							if (value === 12)
								value = 0;
							else
								value = value % 12;
						}
					}
					this._date.setHours(value);
					this.actions.showPicker.call(this);
				},
	
				selectMinute : function(e) {
					var tgt = $(e.target);
					var value = parseInt(tgt.text(), 10);
					this._date.setMinutes(value);
					this.actions.showPicker.call(this);
				},
	
				selectSecond : function(e) {
					var tgt = $(e.target);
					var value = parseInt(tgt.text(), 10);
					this._date.setSeconds(value);
					this.actions.showPicker.call(this);
				}
			},
	
		    doAction : function(e) {
				e.stopPropagation();
				e.preventDefault();
				if (!this._date)
					this._date = new Date(1970, 0, 0, 0, 0, 0, 0);
				var action = $(e.currentTarget).data('action');
				var rv = this.actions[action].apply(this, arguments);
				this._unset = false;
				this.set();
				this.fillTime();
				this.notifyChange();
				return rv;
			},
	
		    stopEvent : function(e) {
				e.stopPropagation();
				e.preventDefault();
			},
	
			// part of the following code was taken from
		    keydown : function(e) {
				var self = this, k = e.which, input = $(e.target);
				if (k == 8 || k == 46) {
					// backspace and delete cause the maskPosition
					// to be recalculated
					setTimeout(function() {
						self._resetMaskPos(input);
					});
				}
			},
	
		    keypress : function(e) {
				var k = e.which;
				if (k == 8 || k == 46) {
					// For those browsers which will trigger
					// keypress on backspace/delete
					return;
				}
				var input = $(e.target);
				var c = String.fromCharCode(k);
				var val = input.val() || '';
				val += c;
				var mask = this._mask[this._maskPos];
				if (!mask) {
					return false;
				}
				if (mask.end != val.length) {
					return;
				}
				if (!mask.pattern.test(val.slice(mask.start))) {
					val = val.slice(0, val.length - 1);
					while ((mask = this._mask[this._maskPos]) && mask.character) {
						val += mask.character;
						// advance mask position past static
						// part
						this._maskPos++;
					}
					val += c;
					if (mask.end != val.length) {
						input.val(val);
						return false;
					} else {
						if (!mask.pattern.test(val.slice(mask.start))) {
							input.val(val.slice(0, mask.start));
							return false;
						} else {
							input.val(val);
							this._maskPos++;
							return false;
						}
					}
				} else {
					this._maskPos++;
				}
			},
	
		    change : function(e) {
				var input = $(e.target);
				var val = input.val();
				if (this._formatPattern.test(val)) {
					this.update();
					this.setValue(this._date.getTime());
					this.notifyChange();
					this.set();
				} else if (val && val.trim()) {
					this.setValue(this._date.getTime());
					if (this._date)
						this.set();
					else
						input.val('');
				} else {
					if (this._date) {
						this.setValue(null);
						// unset the date when the input is
						// erased
						this.notifyChange();
						this._unset = true;
					}
				}
				this._resetMaskPos(input);
			},
	
			resetView : function() {
				if (this.pickDate && this.pickTime) {
					this.widget.find('.datepicker').addClass('in');
					this.widget.find('.picker-switch .icon-calendar').removeClass('icon-calendar').addClass('icon-time');
					this.widget.find('.timepicker').removeClass('in');
				}
			},
			
		    showMode : function(dir) {
				if (dir) {
					this.viewMode = Math.max(this.minViewMode, Math.min(2, this.viewMode + dir));
				}
				this.widget.find('.datepicker > div').hide().filter('.datepicker-' + DPGlobal.modes[this.viewMode].clsName).show();
			},
	
		    destroy : function() {
				this._detachDatePickerEvents();
				this._detachDatePickerGlobalEvents();
				this.widget.remove();
				this.$element.removeData('datetimepicker');
				this.component.removeData('datetimepicker');
			},
	
		    formatDate : function(d) {
		    	if (!this.pickTime) {
		    		d.setMinutes(0);
		    		d.setSeconds(0);
		    		d.setHours(0);
		    		d.setMilliseconds(0);
				}
				return this.format.replace(formatReplacer, function(match) {
					var methodName, property, rv, len = match.length;
					if (match === 'ms')
						len = 1;
					property = dateFormatComponents[match].property;
					if (property === 'Hours12') {
						rv = d.getHours();
						if (rv === 0)
							rv = 12;
						else if (rv !== 12)
							rv = rv % 12;
					} else if (property === 'Period12') {
						if (d.getHours() >= 12)
							return 'PM';
						else
							return 'AM';
					} else {
						methodName = 'get' + property;
						rv = d[methodName]();
					}
					if (methodName === 'getMonth')
						rv = rv + 1;
					if (methodName === 'getYear')
						rv = rv + 1900 - 2000;
					return padLeft(rv.toString(), len, '0');
				});
			},
	
		    parseDate : function(str) {
				var match, i, property, methodName, value, parsed = {};
				if (!(match = this._formatPattern.exec(str)))
					return null;
				for (i = 1; i < match.length; i++) {
					property = this._propertiesByIndex[i];
					if (!property)
						continue;
					value = match[i];
					if (/^\d+$/.test(value))
						value = parseInt(value, 10);
					parsed[property] = value;
				}
				return this._finishParsingDate(parsed);
			},
	
		    _resetMaskPos : function(input) {
				var val = input.val();
				for ( var i = 0; i < this._mask.length; i++) {
					if (this._mask[i].end > val.length) {
						// If the mask has ended then jump to
						// the next
						this._maskPos = i;
						break;
					} else if (this._mask[i].end === val.length) {
						this._maskPos = i + 1;
						break;
					}
				}
			},
	
		    _finishParsingDate : function(parsed) {
				var year, month, date, hours, minutes, seconds, milliseconds;
				year = parsed.FullYear;
				if (parsed.Year)
					year = 2000 + parsed.Year;
				if (!year)
					year = 1970;
				if (parsed.Month)
					month = parsed.Month - 1;
				else
					month = 0;
				date = parsed.Date || 1;
				hours = parsed.Hours || 0;
				minutes = parsed.Minutes || 0;
				seconds = parsed.Seconds || 0;
				milliseconds = parsed.Milliseconds || 0;
				if (parsed.Hours12) {
					hours = parsed.Hours12;
				}
				if (parsed.Period12) {
					if (/pm/i.test(parsed.Period12)) {
						if (hours != 12)
							hours = (hours + 12) % 24;
					} else {
						hours = hours % 12;
					}
				}
				return new Date(year, month, date, hours, minutes, seconds, milliseconds);
			},
	
		    _compileFormat : function() {
				var match, component, components = [], mask = [], str = this.format, propertiesByIndex = {}, i = 0, pos = 0;
				while (match = formatComponent.exec(str)) {
					component = match[0];
					if (component in dateFormatComponents) {
						i++;
						propertiesByIndex[i] = dateFormatComponents[component].property;
						components.push('\\s*' + dateFormatComponents[component].getPattern(this) + '\\s*');
						mask.push({
							pattern : new RegExp(dateFormatComponents[component].getPattern(this)),
							property : dateFormatComponents[component].property,
							start : pos,
							end : pos += component.length
						});
					} else {
						components.push(escapeRegExp(component));
						mask.push({
							pattern : new RegExp(escapeRegExp(component)),
							character : component,
							start : pos,
							end : ++pos
						});
					}
					str = str.slice(component.length);
				}
				this._mask = mask;
				this._maskPos = 0;
				this._formatPattern = new RegExp('^\\s*' + components.join('') + '\\s*$');
				this._propertiesByIndex = propertiesByIndex;
			},
	
		    _attachDatePickerEvents : function() {
				var self = this;
				// this handles date picker clicks
				this.widget.on('click', '.datepicker *', $.proxy(this.click, this));
				// this handles time picker clicks
				this.widget.on('click', '[data-action]', $.proxy(this.doAction, this));
				this.widget.on('mousedown', $.proxy(this.stopEvent, this));
				if (this.pickDate && this.pickTime) {
					this.widget.on('click.togglePicker', '.accordion-toggle', function(e) {
						e.stopPropagation();
						var $this = $(this);
						var $parent = $this.closest('ul');
						var expanded = $parent.find('.collapse.in');
						var closed = $parent.find('.collapse:not(.in)');
	
						if (expanded && expanded.length) {
							var collapseData = expanded.data('collapse');
							if (collapseData && collapseData.transitioning)
								return;
							// expanded.collapse('hide');
							// closed.collapse('show');
							expanded.removeClass('in');
							closed.addClass('in');
							$this.find('i').toggleClass(self.timeIcon + ' ' + self.dateIcon);
							self.$element.find('.add-on i').toggleClass(self.timeIcon + ' ' + self.dateIcon);
						}
					});
				}
				if (this.isInput) {
					this.$element.on({
						'click' : $.proxy(this.show, this),
						'change' : $.proxy(this.change, this)
					});
					if (this.options.maskInput) {
						this.$element.on({
							'keydown' : $.proxy(this.keydown, this),
							'keypress' : $.proxy(this.keypress, this)
						});
					}
				} else {
					this.$element.on({
						'change' : $.proxy(this.change, this)
					}, 'input');
					if (this.options.maskInput) {
						this.$element.on({
							'keydown' : $.proxy(this.keydown, this),
							'keypress' : $.proxy(this.keypress, this)
						}, 'input');
					}
					if (this.component) {
						this.component.on('click', $.proxy(this.show, this));
					} else {
						this.$element.on('click', $.proxy(this.show, this));
					}
				}
			},
	
		    _attachDatePickerGlobalEvents : function(e) {
				$(window).on('resize.datetimepicker' + this.id, $.proxy(this.place, this));
				// if (this.isInput) {
				$(document).on('mousedown.datetimepicker' + this.id, $.proxy(this.hideAndCheckInput, this));
				// }
			},
	
		    _detachDatePickerEvents : function() {
				this.widget.off('click', '.datepicker *', this.click);
				this.widget.off('click', '[data-action]');
				this.widget.off('mousedown', this.stopEvent);
				if (this.pickDate && this.pickTime) {
					this.widget.off('click.togglePicker');
				}
				if (this.isInput) {
					this.$element.off({
						'click' : this.show,
						'change' : this.change
					});
					if (this.options.maskInput) {
						this.$element.off({
							'keydown' : this.keydown,
							'keypress' : this.keypress
						});
					}
				} else {
					this.$element.off({
						'change' : this.change
					}, 'input');
					if (this.options.maskInput) {
						this.$element.off({
							'keydown' : this.keydown,
							'keypress' : this.keypress
						}, 'input');
					}
					if (this.component) {
						this.component.off('click', this.show);
					} else {
						this.$element.off('click', this.show);
					}
				}
			},
	
		    _detachDatePickerGlobalEvents : function() {
				$(window).off('resize.datetimepicker' + this.id);
	//			if (!this.isInput) {
					$(document).off('mousedown.datetimepicker' + this.id);
	//			}
			},
	
		    _isInFixed : function() {
				if (this.$element) {
					var parents = this.$element.parents();
					var inFixed = false;
					for ( var i = 0; i < parents.length; i++) {
						if ($(parents[i]).css('position') == 'fixed') {
							inFixed = true;
							break;
						}
					}
					;
					return inFixed;
				} else {
					return false;
				}
			}
		};
	
		$.fn.datetimepicker = function(option, val) {
			var methodReturn, //
			$set = this.each(function() {
				var $this = $(this), data = $this.data('datetimepicker'), options = typeof option === 'object' && option;
				if (!data) {
					$this.data('datetimepicker', (data = new DateTimePicker(this, $.extend({}, $.fn.datetimepicker.defaults, options))));
				}
				if (typeof option === 'string')
					methodReturn = data[option](val);
			});
			return (methodReturn === undefined) ? $set : methodReturn;
		};
	
		$.fn.datetimepicker.defaults = {
			maskInput : false,
			pickDate : true,
			pickTime : false,
			pick12HourFormat : false,
			pickSeconds : false,
			startDate : -Infinity,
			endDate : Infinity,
			collapse : true,
			showAll : false
		};
		$.fn.datetimepicker.Constructor = DateTimePicker;
		var dpgId = 0;
		var dates = $.fn.datetimepicker.dates = {
			'zh-CN' : {
				days : [ "星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日" ],
				daysShort : [ "周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日" ],
				daysMin : [ "日", "一", "二", "三", "四", "五", "六", "日" ],
				months : [ "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月" ],
				monthsShort : [ "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月" ],
				today : "今日"
			}
		};
		var dateFormatComponents = {
		    dd: {property: 'Date', getPattern: function() { return '(0?[1-9]|[1-2][0-9]|3[0-1])\\b';}},
		    MM: {property: 'Month', getPattern: function() {return '(0?[1-9]|1[0-2])\\b';}},
		    yy: {property: 'Year', getPattern: function() {return '(\\d{2})\\b';}},
		    yyyy: {property: 'FullYear', getPattern: function() {return '(\\d{4})\\b';}},
		    hh: {property: 'Hours', getPattern: function() {return '(0?[0-9]|1[0-9]|2[0-3])\\b';}},
		    mm: {property: 'Minutes', getPattern: function() {return '(0?[0-9]|[1-5][0-9])\\b';}},
		    ss: {property: 'Seconds', getPattern: function() {return '(0?[0-9]|[1-5][0-9])\\b';}},
		    ms: {property: 'Milliseconds', getPattern: function() {return '([0-9]{1,3})\\b';}},
		    HH: {property: 'Hours12', getPattern: function() {return '(0?[1-9]|1[0-2])\\b';}},
		    PP: {property: 'Period12', getPattern: function() {return '(AM|PM|am|pm|Am|aM|Pm|pM)\\b';}}
		};
	
		var keys = [];
		for ( var k in dateFormatComponents)
			keys.push(k);
		keys[keys.length - 1] += '\\b';
		keys.push('.');
	
		var formatComponent = new RegExp(keys.join('\\b|'));
		keys.pop();
		var formatReplacer = new RegExp(keys.join('\\b|'), 'g');
	
		function escapeRegExp(str) {
			// http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
			return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
		}
	
		function padLeft(s, l, c) {
			if (l < s.length)
				return s;
			else
				return Array(l - s.length + 1).join(c || ' ') + s;
		}
	
		function getTemplate(timeIcon, pickDate, pickTime, is12Hours, showSeconds, collapse, showAll) {
			if (pickDate && pickTime) {
				return (
			        '<div class="ui-datetimepicker-widget">' +
			          '<ul>' +
			            '<li' + (collapse ? ' class="datepicker collapse in"' : '') + '>' +
			                DPGlobal.template +
			            '</li>' +
			            '<li class="picker-switch accordion-toggle'+(showAll ? ' hide' : '') + '"><a><i class="' + timeIcon + '"></i></a></li>' +
 			            '<li' + (collapse ? ' class="timepicker collapse' + (showAll ? ' in timepicker-top' : '') + '"' : '') + '>' +
			                TPGlobal.getTemplate(is12Hours, showSeconds) +
			            '</li>' +
			          '</ul>' +
			        '</div>'
				);
			} else if (pickTime) {
		      return (
		        '<div class="ui-datetimepicker-widget">' +
		          '<div class="timepicker">' +
		            TPGlobal.getTemplate(is12Hours, showSeconds) +
		          '</div>' +
		        '</div>'
		      );
			} else {
		      return (
		        '<div class="ui-datetimepicker-widget">' +
		          '<div class="datepicker">' +
		            DPGlobal.template +
		          '</div>' +
		        '</div>'
		      );
			}
		}
	
		var DPGlobal = {
		    modes: [
		      {
		      clsName: 'days',
		      navFnc: 'Month',
		      navStep: 1
		    },
		    {
		      clsName: 'months',
		      navFnc: 'FullYear',
		      navStep: 1
		    },
		    {
		      clsName: 'years',
		      navFnc: 'FullYear',
		      navStep: 10
		    }],
		    isLeapYear: function (year) {
		      return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
		    },
		    getDaysInMonth: function (year, month) {
		      return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
		    },
		    headTemplate:
		      '<thead>' +
		        '<tr>' +
		          '<th class="prev">&lsaquo;</th>' +
		          '<th colspan="5" class="switch"></th>' +
		          '<th class="next">&rsaquo;</th>' +
		        '</tr>' +
		      '</thead>',
		    contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>'
		};
		DPGlobal.template =
		    '<div class="datepicker-days">' +
		      '<table class="table-condensed">' +
		        DPGlobal.headTemplate +
		        '<tbody></tbody>' +
		      '</table>' +
		    '</div>' +
		    '<div class="datepicker-months">' +
		      '<table class="table-condensed">' +
		        DPGlobal.headTemplate +
		        DPGlobal.contTemplate+
		      '</table>'+
		    '</div>'+
		    '<div class="datepicker-years">'+
		      '<table class="table-condensed">'+
		        DPGlobal.headTemplate+
		        DPGlobal.contTemplate+
		      '</table>'+
		    '</div>';
		var TPGlobal = {
		    hourTemplate: '<span data-action="showHours" data-time-component="hours" class="timepicker-hour"></span>',
		    minuteTemplate: '<span data-action="showMinutes" data-time-component="minutes" class="timepicker-minute"></span>',
		    secondTemplate: '<span data-action="showSeconds" data-time-component="seconds" class="timepicker-second"></span>'
		};
		TPGlobal.getTemplate = function(is12Hours, showSeconds) {
			return (
		    '<div class="timepicker-picker">' +
		      '<table class="table-condensed"' +
		        (is12Hours ? ' data-hour-format="12"' : '') +
		        '>' +
		        '<tr>' +
		          '<td><a href="#" class="btn" data-action="incrementHours"><i class="icon-chevron-up"></i></a></td>' +
		          '<td class="separator"></td>' +
		          '<td><a href="#" class="btn" data-action="incrementMinutes"><i class="icon-chevron-up"></i></a></td>' +
		          (showSeconds ?
		          '<td class="separator"></td>' +
		          '<td><a href="#" class="btn" data-action="incrementSeconds"><i class="icon-chevron-up"></i></a></td>': '')+
		          (is12Hours ? '<td class="separator"></td>' : '') +
		        '</tr>' +
		        '<tr>' +
		          '<td>' + TPGlobal.hourTemplate + '</td> ' +
		          '<td class="separator">:</td>' +
		          '<td>' + TPGlobal.minuteTemplate + '</td> ' +
		          (showSeconds ?
		          '<td class="separator">:</td>' +
		          '<td>' + TPGlobal.secondTemplate + '</td>' : '') +
		          (is12Hours ?
		          '<td class="separator"></td>' +
		          '<td>' +
		          '<button type="button" class="btn btn-primary" data-action="togglePeriod"></button>' +
		          '</td>' : '') +
		        '</tr>' +
		        '<tr>' +
		          '<td><a href="#" class="btn" data-action="decrementHours"><i class="icon-chevron-down"></i></a></td>' +
		          '<td class="separator"></td>' +
		          '<td><a href="#" class="btn" data-action="decrementMinutes"><i class="icon-chevron-down"></i></a></td>' +
		          (showSeconds ?
		          '<td class="separator"></td>' +
		          '<td><a href="#" class="btn" data-action="decrementSeconds"><i class="icon-chevron-down"></i></a></td>': '') +
		          (is12Hours ? '<td class="separator"></td>' : '') +
		        '</tr>' +
		      '</table>' +
		    '</div>' +
		    '<div class="timepicker-hours" data-action="selectHour">' +
		      '<table class="table-condensed">' +
		      '</table>'+
		    '</div>'+
		    '<div class="timepicker-minutes" data-action="selectMinute">' +
		      '<table class="table-condensed">' +
		      '</table>'+
		    '</div>'+
		    (showSeconds ?
		    '<div class="timepicker-seconds" data-action="selectSecond">' +
		      '<table class="table-condensed">' +
		      '</table>'+
		    '</div>': '')
			);
		};
	}
	
	// END OF DATETIMEPICKER
	// START OF SELECT
	var Select = function(element, options) {
		this.$select = $(element);
		this.$element = $('<div class="ui-ht-widget ui-select">');
		this.$element.insertAfter(this.$select).append(this.$select);
		this.options = $.extend({}, $.fn.select.defaults, options);
		this.$button = $('<div class="ui-select-button" tabindex="0">');
		this.$button.addClass((this.$select.attr('class') || '').replace('ht-select', ''));
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

	// START OF ADDR
	{
		var Addr = function(element, options) {
			this.options = $.extend({}, $.fn.select.defaults, options);
			this.$element = $(element).addClass('ui-addr');
			this.$province = $('<select>');
			this.$city = $('<select>');
			this.$canton = $('<select>');
			this.$address = $('<input type="text" placeholder="请填写详细地址">');
			this.data = Desktop && Desktop.getCities();
			this._init();
			this._addEvent();
		};
		Addr.prototype = {
			_init : function() {
				var _this = this;
				this.$element.append(this.$province, '&nbsp;', this.$city, '&nbsp;', this.$canton, '&nbsp;', this.$address);
				if (this.options.required) {
					this.$element.find('select,input').addClass('required');
				}
				this.$province.select({
					after : function(){
						_this._changeCity();
					}
				});
				this.$city.select({
					after : function(){
						_this._changeCanton();
					}
				});
				this.$canton.select();
				if (this.data) {
					this._initAddr();
				} else {
					this._getRemote();
				}
			},
			_initAddr : function() {
				this._changeProvince();
			},
			_changeProvince : function() {
				this.$province.select('data', this._getList(this.data, 'province', this.options.provOpt));
				this._changeCity();
			},
			_changeCity : function() {
				var pid = this.$province.val(),
					province = this.data[pid];
				if (province) {
					this.$city.select('data', this._getList(province.citys, 'city', this.options.cityOpt));
					this._changeCanton();
				} else {
					this.$city.select('data', []);
					this.$canton.select('data', []);
				}
			},
			_changeCanton : function() {
				var province = this.data[this.$province.val()],
					city = province.citys[this.$city.val()];
				if (city) {
					this.$canton.select('data', this._getList(city.cantons, 'canton', this.options.cantonOpt));
				} else {
					this.$canton.select('data', []);
				}
			},
			_getList : function(data, type, optional) {
				var list = [];
				if (optional) {
					list.push({
						value : '',
						text : '请选择'
					});
				}
				for ( var key in data) {
					list.push({
						value : key,
						text : data[key][type + 'Name']
					});
				}
				return list;
			},
			_getRemote : function() {
				if (window.SYSURL && window.SYSURL.ADDR) {
					var _this = this;
					$.ajax({
						contentType : 'application/json; charset=UTF-8',
						type : 'POST',
						data : JSON.stringify({
							token : window.token
						}),
						dataType : 'JSON',
						url : window.SYSURL.ADDR,
						success : function(data) {
							_this.data = data.data;
							_this._initAddr();
						}
					});
				}
			},
			_addEvent : function() {
				var _this = this;
				this.$province.change(function(){
					_this._changeCity();
				});
				this.$city.change(function(){
					_this._changeCanton();
				});
			},
			id : function() {
				return {
					provinceId : this.$province.val(),
					cityId : this.$city.val(),
					cantonId : this.$canton.val(),
					address : this.$address.val()
				};
			},
			text : function() {
				var text = {
					provinceName : this.$province.find('option:checked').text(),
					cityName : this.$city.find('option:checked').text(),
					cantonName : this.$canton.find('option:checked').text(),
					address : this.$address.val()
				};
				text.detail = text.provinceName + text.cityName + text.cantonName + text.address;
				return text;
			},
			detail : function() {
				return $.extend({}, this.id(), this.text());
			}
		};
		$.fn.addr = function(option, value) {
			var methodReturn;
			var $set = this.each(function() {
				var $this = $(this);
				var data = $this.data('addr');
				var options = typeof option === 'object' && option;
				if (!data) {
					$this.data('addr', (data = new Addr(this, options)));
				}
				if (typeof option === 'string') {
					methodReturn = data[option](value);
				}
			});
			return (methodReturn === undefined) ? $set : methodReturn;
		};
		$.fn.addr.defaults = {
			required : false,
			provOpt : false,
			cityOpt : false,
			cantonOpt : false
		};
		$.fn.addr.Constructor = Addr;
	}
	$.addr = function(addr) {
		Addr.cities = Addr.cities || Desktop.getCities();
		var pro = Addr.cities[addr.pid], city = pro && pro.citys[addr.cid], canton = city && city.cantons[addr.nid];
		return (pro && pro.provinceName) + (city && city.cityName) + (canton && canton.cantonName) + addr.addr;
	};
	// END OF ADDR
	// START OF DATA GRID
	{
		var Grid = function(element, options) {
			this.options = $.extend({}, $.fn.grid.defaults, options);
			this.$element = $(element);
			this.$tb = $('<div class="ui-tb">');
			this.$tbdiv = $('<div class="ui-tb-ctn">');
			this.$hddiv = $('<div class="tb-hd">');
			this.$htable = $('<table></table>');
			this.$hhead = $('<thead></thead>');
			this.$bddiv = $('<div class="tb-bd">');
			this.$btable = $('<table></table>');
			this.$bhead = $('<thead></thead>');
			this.$bbody = $('<tbody></tbody>');
			this.data = this.list = [];
			this._init();
		};
		Grid.prototype = {
			constructor : Grid,
			_init : function() {
				if (this.$element.is('table')) {
					this.$element.hide();
					this.$element.before(this.$tb);
				} else {
					this.$element.append(this.$tb);
				}
				this.options.title = this.options.title || this.$element.attr('title');
				if (this.options.title) {
					this.$title = $('<div class="tb-title">');
					this.$tb.append(this.$title.html(this.options.title).attr('title', this.options.title));
				}
				this.$htable.append(this.$hhead);
				this.$hddiv.append(this.$htable);
				this.$btable.append(this.$bhead);
				this.$btable.append(this.$bbody);
				this.$bddiv.append(this.$btable);
				this.$tbdiv.append(this.$hddiv);
				this.$tbdiv.append(this.$bddiv);
				this.$tb.append(this.$tbdiv);
				this.$tb.height(this.options.height);
				this.$tb.width(this.options.width);

				this._initPager();
				this._initHD();
				// TODO 
				this.$tbdiv.css('top', this.$title ? 25 : 0);
				this._initBD();
				this._addEvent();
				if(this.options.data){
					this.reload();
				}
				this._resizeHD();
				this._resizeTb();
			},
			_resizeTb : function(){
				// 设置表格宽度
				if (this.isPx) {
					this.$btable.width(this.twidth);
					this.$htable.width(this.twidth);
				}
			},
			_initHD : function() {
				// this.$element.find('td').each(function() {
				// var $this = $(this);
				// $this.html($('<div>').html($this.html()));
				// });
				this.checkBoxCount = 0;
				var columns = this.options.columns;
				var $tr = $('<tr>'), $hdtr = $('<tr>');
				var width = 0, isPx = true;
				for ( var i = 0; i < columns.length; i++) {
					var col = columns[i];
					var $td = $('<td>');
					if(col.checkbox){
						this.checkBoxCount++;
						$td.append($('<div class="tb-checkbox tb-cb-all">').append($('<input type="checkbox">').attr('name', col.field)));
					}else{
						$td.append($('<div>').html(col.title).attr('title', col.title));
					}
					$td.attr('field', col.field);
					col.width && $td.css('width', col.width);
					$tr.append($td);
					
					// body 中表头
					var $bdtd = $('<td>').attr('field', col.field);
					col.width && $bdtd.css('width', col.width);
					if($.isNumeric(col.width)){
						col.width = Number(col.width);
						!col.hidden && (width += col.width);
						isPx = isPx && true;
					}else{
						isPx = false;
					}
					
					$hdtr.append($bdtd);
					if (col.hidden) {
						$td.hide();
						$bdtd.hide();
					}
					if (col.align) {
						$td.css('text-align', col.align);
					}
				}
				// 当所有列宽度小于表格本身宽度时有用
				this.twidth = width;
				this.isPx = isPx;
				if(isPx){
					$tr.append($('<td>').hide());
				}
				this.$hhead.append($tr);
				this.$bhead.append($hdtr);
			},
			_initBD : function() {
				if (this.options.data) {
					this.data = this.options.data;
					this.reload(this.options.data);
				} else if (this.options.url) {
					this._getRemoteData();
				}
			},
			_getRemoteData : function() {
				var _this = this;
				if(this.options.url){
					$.ajax({
						type : 'POST',
						url : this.options.url,
						dataType : 'JSON',
						data : {
							
						},
						success : function(odata) {
							_this.odata = odata;
							_this.data = _this.options.dataFilter ? _this.options.dataFilter(odata) : odata;
							_this.reload(_this.data);
						}
					});
				}
			},
			_initPager : function() {
				if (this.options.pagination) {
					this.pageSize = this.options.pageSize;
					this.currentPage = 1;
					this.totalSize = 1;
					var pager = this.$pager = $('<div class="tb-pager">');
					pager.append($('<div class="tb-pg-select">' + '<select><option>5</option><option selected>10</option><option>20</option><option>30</option><option>40</option><option>50</option><option>100</option>'
							+ '</select></div>'));
					pager.append('<div class="tb-pg-sptr">');
					pager.append($('<div class="tb-pg-page"><span>第</span><span><input class="ht-number" type="text"></span><span>页 共</span><span class="tb-total-size">1</span><span>页</span></div>'));
					pager.append('<div class="tb-pg-sptr">');
					pager.append($('<div class="tb-pg-btn"><a class="tb-pg-fst"></a><a class="tb-pg-pre"></a><a class="tb-pg-next"></a><a class="tb-pg-last"></a><a class="tb-pg-rfs"></a></div>'));
					pager.append('<div class="tb-pg-sptr">');
					this.$pageSize = pager.find('select');
					this.$totalSize = pager.find('.tb-total-size');
					this.$currentPage = pager.find('input');
					this.$tb.append(pager);
					this.$bddiv.css('bottom', 30);
					this._refreshPagerBtn();
				}
			},
			_refreshPager : function() {
				if (this.options.pagination) {
					this.totalSize = Math.ceil(this.total / this.pageSize);
					this.totalSize = this.totalSize || 1;
					this.currentPage = this.currentPage || 1;
					this.$totalSize.text(this.totalSize);
					this.$currentPage.val(this.currentPage);
					this._refreshPagerBtn();
				}
			},
			_generateRow : function(list, index) {
				index = index || 0;
				var colspan = this.$btable.find('>thead td:not(.ui-hide)').length;
				for ( var i = 0; i < list.length; i++) {
					var $tr = this._renderRow(list[i], index);
					$tr.attr('findex', index);
					this.$bbody.append($tr.data('index', index++));
					this.$bbody.append(this._renderSubGrid(list, i, list[i], colspan));
				}
			},
			_renderSubGrid : function(list, index, row, colspan) {
				if (this.options.subGrid) {
					var $tr = $('<tr class="tb-sub-grid">'),
//						$grid = $('<div>'),
						$td = $("<td>").attr("colspan",colspan);
//					$tr.append($td.append($grid));
					$tr.append("<td width='35'></td>");
					$tr.append($td);
					this.options.subGrid.apply($tr, [ {
						$tr : $tr,
						$grid : $td,
						$td : $td
					}, {
						list : list,
						index : index,
						row : row
					} ]);
					
					return $tr;
				}
			},
			_renderRow : function(row, index) {
				var $tr = $('<tr>').attr('findex', index), rowui = {
					$tr : $tr
				}, rowdata = {
					row : row,
					list : this.list,
					data : this.data
				};
				this.options.rowFilter && this.options.rowFilter(rowui, rowdata);
				for ( var j = 0; j < this.options.columns.length; j++) {
					var column = this.options.columns[j], cell = row[column.field], $td = $('<td>').attr('field', column.field), cellui = {
						$td : $td,
						$tr : $tr
					}, celldata = {
						cell : cell,
						title : cell,
						row : row,
						index : index,
						list : this.list,
						data : this.data
					};
					if (column.checkbox) {
						var $checkbox = $('<input type="checkbox">').attr('name', column.field);
						var $div = $('<div class="tb-checkbox">').html($checkbox);
						$td.append($div);
					}else if(column.expander){
						var $div = $('<div>');
						var $icon = $('<i class="icon-plus icon-minus"></i>');
						$div.addClass('tb-expander');
						$div.html($icon);
						$td.append($div);
					} else {
						if (column.formatter) {
							var ctn = column.formatter(cellui, celldata);
							if (ctn !== undefined) {
								celldata.cell = ctn;
							}
						} else if (column.data) {
							var datalist = column.data;
							if ($.isFunction(datalist)) {
								datalist = datalist(celldata);
							}
							celldata.title = celldata.cell = datalist[celldata.cell];
						}
						var $dom = celldata.cell;
						if ($dom && $dom.length && $dom[0] && $dom[0].nodeType) {
							$td.append($dom);
						} else {
							var $div = $('<div>').html(celldata.cell);
							if (!$.isArray(celldata.title) && !$.isPlainObject(celldata.title)) {
								$div.attr('title', celldata.title);
							}
							$td.append($div);
						}
					}
					if (column.hidden) {
						$td.hide();
					}
					if (column.align) {
						$td.css('text-align', column.align);
					}
					$tr.append($td);
				}
				if (this.options.idField !== undefined) {
					$tr.attr('fid', row[this.options.idField]);
				}
				return $tr;
			},
			_resizeHD : function() {
				var _this = this,
					div = this.$bddiv.get(0),
					oWidth = div.offsetWidth, 
					cWidth = div.clientWidth;
				// 宽度为PX时的行为
				this.$tb.find('td.ui-tb-td-lthd').removeClass('ui-tb-td-lthd');
				if(this.isPx){
					// 有上下滚动条时
					if (oWidth > cWidth) {
						//头部有多行时，第一行最后一列为多余列，为滚动条占位, width为px时有效
						// TODO 多行头部需要重构
						this.$htable.find('tr:eq(0) td:last').width(oWidth - cWidth).show();
					} else {
						// TODO 多行头部需要重构
						this.$htable.find('tr:eq(0) td:last').hide();
						this.$htable.find('tr:eq(0) td:visible:last').addClass('ui-tb-td-lthd');
						this.$htable.find('tr:gt(0)').each(function() {
							$(this).find('td:visible:last').addClass('ui-tb-td-lthd');
						});
					}

					// 有左右滚动条时
					if (this.$bddiv.width() < this.$btable.width()){
						this.$bddiv.bind('scroll.ui-tb', function(e) {
							_this.$hddiv.scrollLeft($(this).scrollLeft());
						});
					}else{
						this.$bddiv.unbind('scroll.ui-tb');
					}
					
					// 表格宽度小于包装盒宽度时
					if (this.$htable.width() < this.$element.width()) {
						this.$htable.find('tr:eq(0) td:last').hide();
						this.$htable.find('td.ui-tb-td-lthd').removeClass('ui-tb-td-lthd');
					}
				} else {
					if (oWidth > cWidth) {
						// width为百分比时,css控制占位符宽度
						this.$hddiv.css('padding-right', oWidth - cWidth);
					} else {
						// TODO 多行头部需要重构
						this.$htable.find('tr td:visible:last').addClass('ui-tb-td-lthd');
						this.$hddiv.css('padding-right', 0);
					}
				}
				this.$htable.find('.tb-cb-all input[type="checkbox"]').prop('checked', false);
			},
			_addEvent : function() {
				var _this = this;
				this.$tb.on('click', 'div.tb-expander', function(e){
					e.stopPropagation();
					var $expander = $(this),
						$tr = _this.$btable.find($expander.parents('tr')),
						index = $tr.data('index');
					if ($tr.length != 1)
						return;
					if(_this.options.subGrid){
						$tr.next()[$expander.find('i').toggleClass('icon-minus').is('.icon-minus') ? 'show' : 'hide' ]();
					}
				});
				this.$hddiv.on('change', 'div.tb-cb-all input[type="checkbox"]', function(e){
					e.stopPropagation();
					var $cb = $(this);
					if(_this.options.single && _this.options.selectOnCheck){
						$cb.prop('checked', false);
						return false;
					}
					if ($cb.is(':checked')) {
						var $cbs = _this.$btable.find('>tbody>tr[findex] .tb-checkbox input[type="checkbox"]:enabled'),
							$trs = _this.$btable.find($cbs.parents('tr'));
						$cbs.prop('checked', true);
						_this._removeSelected(_this.$btable.find('>tbody>tr[findex]'));
						_this._addSelected($trs);
					} else {
						_this.$btable.find('>tbody>tr[findex] .tb-checkbox input[type="checkbox"]:enabled').prop('checked', false);
						_this._removeSelected(_this.$btable.find('>tbody>tr[findex]'));
					}
					_this.options.clickTopCheckbox.apply(this, [$cb.is(':checked'), _this.list]);
				});
				this.$tb.on('change', 'div.tb-checkbox input[type="checkbox"]', function(e) {
					e.stopPropagation();
					var $cb = $(this),
						$tr = _this.$btable.find($cb.parents('tr')),
						index = $tr.data('index');
					if ($tr.length != 1)
						return;
					if ($cb.is(':checked')) {
						if (_this.options.single && _this.options.selectOnCheck) {
							var $otr = _this.$btable.find('>tbody>tr[findex].tb-row-selected');
							$otr.removeClass('tb-row-selected');
							_this._removeSelected($otr);
							_this.$btable.find('>tbody>tr[findex] .tb-checkbox input[type="checkbox"]').not($cb).prop('checked', false);
						}
						_this._refreshHDCheckbox();
						_this._addSelected($tr);
						_this._refreshHDCheckbox();
					} else {
						_this.$htable.find('.tb-cb-all input[type="checkbox"]').prop('checked', false);
						_this._removeSelected($tr);
					}
					var args = [$cb.is(':checked'), {
							index : index,
							row : _this.list[index],
							rows : _this.list
						}];
					_this.options.clickCheckbox.apply(this, args);
				});
				this.$tb.on('click', 'tr[findex]', function(e) {
					var $target = _this.$btable.find($(e.target));
				 	if (($target.is('input') || $target.parent('.tb-checkbox').length)) {
				 		return;
					}
					if ($target.is('.ui-tb-edit-field') || $target.parents('.ui-select').length){
						return;
					}
					var $tr = $(this), index = $tr.data('index');
					if (!$tr.is(_this.$btable.find('>tbody>tr'))) {
						return;
					}
					if(_this.options.selectable){
						if (_this.options.single) {
							// 如果checkOnSelect==true，那么单行选中，这取消所有checkbox选中
							_this.options.checkOnSelect && _this.$htable.find('.tb-cb-all input[type="checkbox"]').prop('checked', false);
							var $otr = _this.$btable.find('>tbody>tr[findex].tb-row-selected').not($tr);
							$otr.removeClass('tb-row-selected');
							_this._removeChecked(_this.$btable.find('>tbody>tr[findex]'));
							$tr.addClass('tb-row-selected');
							_this._addChecked($tr);
						} else {
							$tr.toggleClass('tb-row-selected');
							if ($tr.is('.tb-row-selected')) {
								_this._addChecked($tr);
								_this._refreshHDCheckbox();
							} else {
								if($tr.find('div.tb-checkbox').length && _this.options.checkOnSelect){
									// 如果当前行有checkbox OnSelect ==  true，那么uncheck top checkbox
									_this.$htable.find('.tb-cb-all input[type="checkbox"]').prop('checked', false);
								}
								_this._removeChecked($tr);
							}
						}

						var args = [ index, _this.list[index] ];
						$tr.is('.tb-row-selected') ? _this.options.select.apply(this, args) : _this.options.unselect.apply(this, args);
					}
					$.proxy(_this.options.clickRow, this, index, _this.list[index], _this)();
					
					// edit function
					_this._changeToEditable($tr,$target);
					// e.stopPropagation();
				});
				this.options.dblClickRow && this.$tb.on('dblclick', 'tr[findex]', function(e) {
					e.stopPropagation();
					var $tr = $(this), index = $tr.data('index');
					var args = [ index, _this.list[index] ];
					_this.options.dblClickRow.apply(this, args);
				});
				if (this.options.pagination) {
					this.$currentPage.blur($.proxy(this._blurNumber, this));
					this.$currentPage.keypress($.proxy(this._entryNumber, this));
					this.$pageSize.change($.proxy(this._changePageSize,this));
					this.$pager.on('click','.tb-pg-fst:not(.tb-btn-disabled)',function(){
						_this.currentPage = 1;
						_this._clickBtn();
					});
					this.$pager.on('click', '.tb-pg-pre:not(.tb-btn-disabled)', function() {
						if (_this.currentPage == 1)
							return;
						_this.currentPage--;
						_this._clickBtn();
					});
					this.$pager.on('click', '.tb-pg-next:not(.tb-btn-disabled)', function() {
						if (_this.currentPage == _this.totalSize)
							return;
						_this.currentPage++;
						_this._clickBtn();
					});
					this.$pager.on('click', '.tb-pg-last:not(.tb-btn-disabled)', function() {
						_this.currentPage = _this.totalSize;
						_this._clickBtn();
					});
					this.$pager.on('click', '.tb-pg-rfs:not(.tb-btn-disabled)', function() {
						_this._clickBtn();
					});
				}
				// 自动结束编辑
				$(document).mousedown(function(e) {
					if(_this.options.autoEnd){
						var $target = $(e.target);
						if ($target.parents('tr.tb-tr-editing').length || !$(document).find($target).length || $target.parents('.ui-select-dropdown.ui-widget-out').length || $target.is('.ui-select-dropdown.ui-widget-out')) {
							return;
						}
						_this._changeToView();
					}
				});
			},
			_addChecked : function($tr){
				this.options.checkOnSelect && $tr.find('.tb-checkbox input[type="checkbox"]').prop('checked', true);
			},
			_removeChecked : function($tr){
				this.options.checkOnSelect && $tr.find('.tb-checkbox input[type="checkbox"]').prop('checked', false);
			},
			_addSelected : function($tr){
				this.options.selectOnCheck && $tr.addClass('tb-row-selected');
			},
			_removeSelected : function($tr){
				this.options.selectOnCheck && $tr.removeClass('tb-row-selected');
			},
			_refreshHDCheckbox : function(){
				if (this.$btable.find('.tb-checkbox input[type="checkbox"]:checked').length == this.data.length * this.checkBoxCount) {
					this.$htable.find('.tb-cb-all input[type="checkbox"]').prop('checked', true);
				}
			},
			_changeToView : function($trs){
				var _this = this;
				$trs = ($trs && $trs.length) ? $trs.filter('tr.tb-tr-editing') : this.$btable.find('tr.tb-tr-editing');
				$trs.each(function() {
					var $tr = $(this);
						$tds = $tr.find('td'),
						index = $tr.data('index'),
						row = _this.list[index],
						columns =  _this.options.columns;
					$tr.removeClass('tb-tr-editing');

					for ( var i = 0; i < columns.length; i++) {
						var column = columns[i],
							cell = row[column.field];
						if (column.type) {
							var $td = $tds.eq(i), 
								list = column.data;
							if ($.isFunction(list)) {
								list = list({
									cell : cell,
									row : row
								});
							}
							switch (column.type) {
								case 'list': {
									var $select = $td.find('select'),
										value = $select.val();
									if ($select.length) {
										$select.select('destroy');
										row[column.field] = value;
										$td.html($('<div>').text(list[row[column.field]]));
									}
									break;
								}
								case 'text':
								case 'number':
								case 'decimal':
								default: {
									var $input = $td.find('input');
									if ($input.length) {
										var value = $input.val(), old = row[column.field];
										if (column.type != 'text' && $.isNumeric(value)) {
											value = Number(value);
										}
										row[column.field] = value;
										if (old !== value) {
											(column.onChange || $.noop)({
												row : row,
												index : index,
												value : value,
												oldValue : old
											});
										}
										$td.html($('<div>').text(row[column.field]));
									}
								}
							}
						}
					}
					_this.options.afterEdit(row, index);
				});
			},
			_changeToEditable : function($tr, $target) {
				var editable = this.options.editRow,
					index = $tr.data('index'),
					row = this.list[index],
					isediting = $tr.is('.tb-tr-editing');
				
				if (isediting) {
					this._changeToView();
					return;
				}
					
				editable = $.isFunction(editable) ? editable(row, index) : editable;
				if (editable) {
					if (!isediting && (this.options.beforeEdit && this.options.beforeEdit(index, row, this)) !== false) {
						// change other tr to view status 
						// if(this.options.autoEnd){
						// this._changeToView();
						// }
						$tr.addClass('tb-tr-editing');
						var columns =  this.options.columns,
							$tds = $tr.find('td');
						for ( var i = 0; i < columns.length; i++) {
							var column = columns[i],
								cell = row[column.field],
 								data = {
									row : row,
									cell : cell,
									index : index
								};
							// && (!column.isEdit || column.isEdit())

							if (column.type && (!column.isEdit || column.isEdit(data))) {
								var $td = $tds.eq(i);
								$td.html(this._generateEditCellDom(column, data));
							}
						}
					}
				}
			},
			_clickBtn : function(e) {
				this.$currentPage.val(this.currentPage);
				this._changePageNumber();
			},
			_changePageSize : function(e) {
				var pageSize = $(e.target).val();
				var total = Math.min((this.currentPage - 1) * this.pageSize + 1, this.total);
				this.currentPage = Math.ceil(total / pageSize) || 1;
				this.pageSize = pageSize;
				this._changePageNumber();
			},
			_entryNumber : function(e) {
				if (e.keyCode == 13) {
					this._blurNumber(e);
				}
			},
			_blurNumber : function(e) {
				var $ipt = $(e.target);
				pageNum = $ipt.val();
				if (pageNum > this.totalSize) {
					pageNum = this.totalSize;
					$ipt.val(pageNum);
				} else if (pageNum < 1) {
					pageNum = 1;
					$ipt.val(pageNum);
				}
				if (this.currentPage != pageNum) {
					this.currentPage = pageNum;
					this._changePageNumber();
				}
			},
			_changePageNumber : function() {
				this._refreshPagerBtn();
				this.options.pager.select(this.currentPage, this.pageSize);
			},
			_refreshPagerBtn : function(){
				this.$pageSize.val(this.pageSize);
				this.$pager.find('.tb-pg-fst, .tb-pg-pre')[this.currentPage == 1 ? 'addClass' : 'removeClass']('tb-btn-disabled');
				this.$pager.find('.tb-pg-next, .tb-pg-last')[this.currentPage == this.totalSize ? 'addClass' : 'removeClass']('tb-btn-disabled');
			},
			_resetIndex : function() {
				this.$bbody.find('tr').each(function(index) {
					$(this).attr('findex', index);
					$(this).data('index', index);
				});
			},
			_sortNumber : function(s, e) {
				return e - s;
			},
			_syncData : function(){
//				if ($.isPlainObject(this.data)) {
//					this.total = this.data.total;
//					this.list = this.data.rows;
//				} else {
//					this.total = this.data.length;
//					this.list = this.data;
//				}
				this.total = this.list.length;
			},
			_generateEditCellDom : function(column, data){
				var $dom;
				switch (column.type) {
					case 'list': {
						$dom = this._generateEditList(column, data);
						break;
					}
					case 'number':{
						$dom = $('<input class="ht-number" type="text">').val(data.row[column.field]);
						break;
					}
					case 'decimal':{
						$dom = $('<input class="ht-decimal" type="text">').val(data.row[column.field]);
						break;
					}
					case 'text':
					default: {
						$dom = $('<input type="text">').val(data.row[column.field]);
						break;
					}
				}
				$dom.addClass('ui-tb-edit-field');
				column.maxLength && $dom.attr('maxLength', column.maxLength);
				return $dom;
			},
			_generateEditList : function(column, data){
				var $select = $('<select>'),
					dataRt = {};
				var	list = column.data;
				if ($.isFunction(list)) {
					list = list(data);
				}
				for (var key in list) {
					$select.append($('<option>').attr('value', key).text(list[key]));
					dataRt[list[key]] = key;
				}
				$select.select({
					value : (column.isKey === false ? dataRt[data.cell] : data.cell),
					after : function(column, row, index, dataRt, $select){
						return function(obj){
//							row[column.field] = (column.isKey === false ? obj.text : obj.val);
							column.onChange && column.onChange({
								row : row,
								index : index,
								select : obj
							});
						};
//						return $.proxy(column.onChange || $.noop, $select, {
//							row : row,
//							index : index
//						});
					}(column, data.row, data.index, dataRt, $select)
				});
				return $select.select('widget');
			},
			reload : function(data) {
				this.data = data || this.data;
				if ($.isPlainObject(this.data)) {
					this.total = this.data.total;
					this.pageSize = this.data.pageSize || this.pageSize;
					this.currentPage = this.data.currentPage || this.currentPage;
					this.list = this.data.rows;
					this.data.length = this.list.length;
				} else {
					this.total = this.data.length;
					this.list = this.data;
					this.currentPage = 1;
				}
				this._refreshTip();
				this.$bbody.empty();
				this._generateRow(this.list);
				this._resizeHD();
				this._refreshPager();
				this.options.loadSuccess();
			},
			_setSingle : function(){
				this.$htable.find('.tb-cb-all input[type="checkbox"]')[this.options.single ? "addClass":"removeClass"]("hide");
			},
			_refreshTip : function(){
				this.$tbdiv.find('>.ui-tb-nd-tip').remove();
				if(!this.list || !this.list.length){
					var $tip = $('<div>').addClass('ui-tb-nd-tip').html(this.options.noDataTip)
					this.$tbdiv.append($tip);
					$tip.css('marginLeft',-$tip.width()/2);
				}
			},
			_findColumnOption : function(opt) {
				if ($.isNumeric(opt)) {
					return this.options.columns[opt];
				} else {
					var columns = this.options.columns;
					for ( var i = 0; i < columns.length; i++) {
						if (columns[i].field == opt) {
							return columns[i];
						}
					}
				}
			},
			_hideColumn : function(opt) {
				var column = this._findColumnOption(opt);
				this.$tb.find('td[field="' + column.field + '"]').hide();
				if (this.isPx && !column.hidden) {
					console.log(this.twidth, column.width);
					this.twidth -= column.width;
				}
				column.hidden = true;
			},
			hideColumn : function(opt) {
				if ($.isArray(opt)) {
					for ( var i = 0; i < opt.length; i++) {
						this._hideColumn(opt[i]);
					}
				} else {
					this._hideColumn(opt);
				}
				if (this.isPx) {
					this._resizeTb();
				}
				this._resizeHD();
			},
			_showColumn : function(opt) {
				var column = this._findColumnOption(opt);
				column.hidden = false;
				this.$tb.find('td[field="' + column.field + '"]').show();
				if (this.isPx && column.hidden) {
					console.log(this.twidth,column.width);
					this.twidth += column.width;
				}
			},
			showColumn : function(opt) {
				if ($.isArray(opt)) {
					for ( var i = 0; i < opt.length; i++) {
						this._showColumn(opt[i]);
					}
				} else {
					this._showColumn(opt);
				}
				if (this.isPx) {
					this._resizeTb();
				}
				this._resizeHD();
			},
			rebuild : function(data){
				
			},
			endEdit : function(index) {
				var $tr = this.$btable.find('tr').eq(index);
				this._changeToView($tr);
			},
			updateRow : function(index) {
				var row = this.list[index], //
				$tr = this.$bbody.find('tr').eq(index), //
				$tds = $tr.find('td'), //
				columns = this.options.columns, //
				isediting = $tr.is('.tb-tr-editing');
				for ( var i = 0; i < columns.length; i++) {
					var column = columns[i], $td = $tds.eq(i), cell = row[column.field], cellui = {
						$td : $td,
						$tr : $tr
					}, celldata = {
						cell : cell,
						title : cell,
						row : row,
						index : index,
						list : this.list,
						data : this.data
					};
					if (column.checkbox) {
						continue;
					}
					// 编辑列正在编辑
					if (column.type && isediting && (!column.isEdit || column.isEdit(celldata))) {
						// 还是可以编辑的情况
						if('list' == column.type){
							$td.find('select').select('destroy');
						}
						$td.html(this._generateEditCellDom(column, celldata));
					// 非编辑列或者没有在编辑中
					// 编辑列正在编辑但不能编辑了
					} else {
						if (column.formatter) {
							var ctn = column.formatter(cellui, celldata);
							if (ctn !== undefined) {
								celldata.cell = ctn;
							}
						} else if (column.data) {
							var datalist = column.data;
							if ($.isFunction(datalist)) {
								datalist = datalist(celldata);
							}
							celldata.cell = datalist[celldata.cell];
						}
						if (typeof celldata.cell === 'object' || !$.trim(celldata.cell).indexOf('<')) {
							$td.html(celldata.cell);
						} else {
							$td.html($('<div>').text(celldata.cell).attr('title', celldata.cell));
						}
					}
				}
			},
			getData : function() {
				return this.data;
			},
			getRows : function() {
				return this.list;
			},
			getList : function() {
				return this.list;
			},
			getRow : function(row) {
				return this.list[row];
			},
			getCell : function(opts) {
				return this.list[opts.index][opts.field];
			},
			getChecked : function() {
				var $checked = this.$btable.find('>tbody>tr:not(.sub-grid) .tb-checkbox input[type="checkbox"]:checked');
				var arrs = [],$tr,$otr;
				for ( var i = 0; i < $checked.length; i++) {
					$otr = $checked.eq(i).parents('tr');
					if ($tr == $otr) {
						return;
					}
					$tr = $otr;
					arrs.push(this.list[$tr.data('index')]);
				}
				return this.options.single && this.options.selectOnCheck ? (arrs.length ? arrs[0] : '') : arrs;
			},
			getCheckedIndex : function() {
				var $checked = this.$btable.find('>tbody>tr:not(.sub-grid) .tb-checkbox input[type="checkbox"]:checked');
				var arrs = [], $tr, $otr;
				for ( var i = 0; i < $checked.length; i++) {
					$otr = $checked.eq(i).parents('tr');
					if ($tr == $otr) {
						return;
					}
					$tr = $otr;
					arrs.push($tr.data('index'));
				}
				return this.options.single && this.options.selectOnCheck ? (arrs.length ? arrs[0] : '') : arrs;
			},
			getSelected : function() {
				var $selected = this.$btable.find('>tbody>tr.tb-row-selected');
				var arrs = [];
				for ( var i = 0; i < $selected.length; i++) {
					arrs.push(this.list[$selected.eq(i).data('index')]);
				}
				return this.options.single ? (arrs.length ? arrs[0] : '') : arrs;
			},
			getSelectedIndex : function() {
				var $selected = this.$btable.find('.tb-row-selected');
				var arrs = [];
				for ( var i = 0; i < $selected.length; i++) {
					arrs.push($selected.eq(i).data('index'));
				}
				return this.options.single ? (arrs.length ? arrs[0] : '') : arrs;
			},
			_deleteRow : function($tr) {
				this.list.splice($tr.data('index'), 1);
				if (this.options.subGrid) {
					$tr.next().remove();
				}
				$tr.remove();
			},
			deleteCheckedRows : function(){
				var $checked = this.$btable.find('.tb-checkbox input:checked');
				for ( var i = 0; i < $checked.length; i++) {
					var $tr = $checked.eq(i).parents('tr');
					this.list.splice($tr.data('index'), 1);
					$tr.remove();
				}
				this._resizeHD();
				this._resetIndex();
			},
			deleteSelectedRows : function(){
				var $selected = this.$btable.find('.tb-row-selected');
				for ( var i = 0; i < $selected.length; i++) {
					this.list.splice($selected.data('index'), 1);
					$selected.remove();
				}
				this._resizeHD();
				this._resetIndex();
			},
			deleteRows : function(rows) {
				rows.sort(this._sortNumber);
				for ( var i = 0; i < rows.length; i++) {
					this.$bbody.find('tr').eq(rows[i]).remove();
					this.list.splice(rows[i], 1);
				}
				this._resizeHD();
				this._resetIndex();
			},
			deleteRow : function(row) {
				this.$bbody.find('tr').eq(row).remove();
				this.list.splice(row, 1);
				this._resizeHD();
				this._resetIndex();
			},
			addRows : function(list) {
				this._refreshTip();
				this._generateRow(list, this.list.length);
				this.list = this.list.concat(list);
				this._resizeHD();
				this._syncData();
			},
			addRow : function(obj) {
				var $tr = this._renderRow(obj, this.list.length);
				this.$bbody.append($tr.data('index', this.list.length));
				this.list.push(obj);
				this._resizeHD();
				this._syncData();
			},
			insertRow : function(opts) {
				opts.index = Math.min(this.list.length, opts.index);
				opts.index = Math.max(opts.index, 0);
				this.list.splice(opts.index, 0, opts.row);
				this._refreshTip();
				var colspan = this.$btable.find('>thead td:not(.ui-hide)').length,
					$tr = this._renderRow(opts.row, opts.index), 
//					$str = this._renderSubGrid(this.list, index, this.list[index], colspan);	
					$trs = this.$bbody.find('tr');
				if ($trs.length) {
					$trs.eq(opts.index).before($tr);
				} else {
					this.$bbody.append($tr);
				}
				this._resizeHD();
				this._resetIndex();
				this._syncData();
			},
			loadData : function(list) {
				this.reload(list);
			},
			selectRow : function(index) {
				if (this.options.single) {
					this.$bbody.find('.tb-row-selected').removeClass('tb-row-selected');
				}
				this.$bbody.find('tr').eq(index).addClass('tb-row-selected');
			},
			unSelectRow : function(index) {
			},
			checkRow : function(index) {
			},
			unCheckRow : function(index) {
			},
			selectRecord : function(id) {
				if (this.options.single) {
					this.$bbody.find('.tb-row-selected').removeClass('tb-row-selected');
				}
				this.$bbody.find('tr[fid=' + id + ']').addClass('tb-row-selected');
			},
			getRowIndex : function(id){
				var $trs = this.$bbody.find('tr');
				return $trs.index($trs.filter('[fid=' + id + ']'));
			},
			clear : function() {
				this.currentPage = 1;
				this.total = 0;
				this.data = [];
				this.reload();
				this._refreshPager();
			},
			destroy : function() {
				this.$element.removeData('grid');
				this.$tb.remove();
			},
			option : function(opt){
				if (null == opt) {
					return $.extend({}, this.options);
				}
				this.options = $.extend(this.options, opt);
			}
		};
		$.fn.grid = function(option, value) {
			var methodReturn;
			var $set = this.each(function() {
				var $this = $(this);
				var data = $this.data('grid');
				var options = typeof option === 'object' && option;
				if (!data) {
					$this.data('grid', (data = new Grid(this, options)));
				}
				if (typeof option === 'string') {
					methodReturn = data[option](value);
				}
			});
			return (methodReturn === undefined) ? $set : methodReturn;
		};
		$.fn.grid.defaults = {
			columns : [],
			pageSize : 10,
			single : false,
			selectable : true,
			select : $.noop,
			unselect : $.noop,
			checkOnSelect : true,
			selectOnCheck : true,
			clickRow : $.noop,
			clickCheckbox : $.noop,
			clickTopCheckbox : $.noop,
			loadSuccess : $.noop,
			afterEdit : $.noop,
			editRow : false,
			autoEnd : true,
			expandSubGrid : true,
			resizable : false,
			noDataTip : '',
			pager : {
				select : $.noop,
				refresh : $.noop,
				changePageSize : $.noop
			}
		};
		$.fn.grid.Constructor = Grid;
	}
	// END OF DATA GRID
	$(window).resize(function(){
		$('.ui-widget-open').removeClass('ui-widget-open');
		$('.ui-widget-out').remove();
	});
	
})(window.jQuery);
