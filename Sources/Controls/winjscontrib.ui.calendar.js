var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var WinJSContrib;
(function (WinJSContrib) {
    var UI;
    (function (UI) {
        var DatePickerControl = (function () {
            function DatePickerControl(element, options) {
                var _this = this;
                this.element = element || document.createElement('DIV');
                options = options || {};
                this.element.winControl = this;
                this.element.classList.add('mcn-datepicker');
                this.element.classList.add('win-disposable');
                this.flyout = new WinJS.UI.Flyout();
                this.element.appendChild(this.flyout.element);
                this.calendar = new WinJSContrib.UI.Calendar();
                this.flyout.element.appendChild(this.calendar.element);
                this.flyout.element.classList.add("mcn-datepicker-flyout");
                this.calendar.onchange = function () {
                    _this.value = _this.calendar.value;
                };
                this.textElement = document.createElement("DIV");
                this.textElement.className = "mcn-datepicker-text";
                this.element.appendChild(this.textElement);
                WinJSContrib.UI.tap(this.textElement, function () {
                    _this.flyout.show(_this.textElement);
                });
                WinJS.UI.setOptions(this, options);
                if (!this.value) {
                    this.value = new Date();
                }
            }
            Object.defineProperty(DatePickerControl.prototype, "value", {
                get: function () {
                    return this._value;
                },
                set: function (val) {
                    this._value = val;
                    this.calendar.value = val;
                    this.textElement.innerText = moment(val).format("ll");
                    this.flyout.hide();
                },
                enumerable: true,
                configurable: true
            });
            DatePickerControl.prototype.dispose = function () {
                WinJS.Utilities.disposeSubTree(this.element);
            };
            DatePickerControl.prototype.dispatchEvent = function (type, data) {
            };
            DatePickerControl.prototype.addEventListener = function (type, callback) {
            };
            return DatePickerControl;
        })();
        UI.DatePickerControl = DatePickerControl;
        UI.DatePicker = WinJS.Class.mix(WinJS.Utilities.markSupportedForProcessing(DatePickerControl), WinJS.Utilities.eventMixin, WinJS.Utilities.createEventProperties("change"));
        var CalendarControl = (function () {
            function CalendarControl(element, options) {
                var _this = this;
                this.element = element || document.createElement('DIV');
                options = options || {};
                this._startDayOfWeek = 1; //monday
                this._value = new Date();
                this.element.winControl = this;
                this.element.classList.add('mcn-calendar');
                this.element.classList.add('win-disposable');
                this.wrapper = document.createElement("DIV");
                this.wrapper.className = "mcn-calendar-wrapper";
                this.element.appendChild(this.wrapper);
                this.panelsContainer = document.createElement("DIV");
                this.panelsContainer.className = "mcn-calendar-panels";
                this.wrapper.appendChild(this.panelsContainer);
                this.navbuttons = document.createElement("DIV");
                this.navbuttons.className = "navbuttons";
                this.wrapper.appendChild(this.navbuttons);
                this.navbuttonPrevious = document.createElement("BUTTON");
                this.navbuttonPrevious.className = "navbutton navbutton-previous";
                this.navbuttons.appendChild(this.navbuttonPrevious);
                WinJSContrib.UI.tap(this.navbuttonPrevious, function () {
                    if (_this._currentPanel)
                        _this._currentPanel.previous();
                });
                this.navbuttonNext = document.createElement("BUTTON");
                this.navbuttonNext.className = "navbutton navbutton-next";
                this.navbuttons.appendChild(this.navbuttonNext);
                WinJSContrib.UI.tap(this.navbuttonNext, function () {
                    if (_this._currentPanel)
                        _this._currentPanel.next();
                });
                WinJS.UI.setOptions(this, options);
                this._currentPanel = new CalendarDayPanelControl(this, this.value);
                this._currentPanel.currentChanged = function () {
                    _this.checkState();
                };
            }
            Object.defineProperty(CalendarControl.prototype, "value", {
                get: function () {
                    return this._value;
                },
                set: function (val) {
                    this._value = val;
                    if (this._currentPanel) {
                        this._currentPanel._currentDate = new Date(val.getFullYear(), val.getMonth(), 1);
                        this._currentPanel.ensureValue();
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CalendarControl.prototype, "startDayOfWeek", {
                get: function () {
                    return this._startDayOfWeek;
                },
                set: function (val) {
                    this._startDayOfWeek = val;
                },
                enumerable: true,
                configurable: true
            });
            CalendarControl.prototype.render = function () {
            };
            CalendarControl.prototype.checkState = function () {
            };
            CalendarControl.prototype.dispatchEvent = function (type, data) {
            };
            CalendarControl.prototype.addEventListener = function (type, callback) {
            };
            return CalendarControl;
        })();
        UI.CalendarControl = CalendarControl;
        var CalendarPanelControl = (function () {
            function CalendarPanelControl(parent, currentDate) {
                this.parent = parent;
                this.element = document.createElement('DIV');
                this.element.className = "calendar-panel";
                this.parent.panelsContainer.appendChild(this.element);
                this._currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            }
            CalendarPanelControl.prototype.next = function () {
            };
            CalendarPanelControl.prototype.previous = function () {
            };
            CalendarPanelControl.prototype.allowNext = function () {
                return false;
            };
            CalendarPanelControl.prototype.allowPrevious = function () {
                return false;
            };
            CalendarPanelControl.prototype.ensureValue = function () {
            };
            return CalendarPanelControl;
        })();
        UI.CalendarPanelControl = CalendarPanelControl;
        var CalendarDayPanelControl = (function (_super) {
            __extends(CalendarDayPanelControl, _super);
            function CalendarDayPanelControl(parent, currentDate) {
                _super.call(this, parent, currentDate);
                this.element.classList.add("day-panel");
                this.elementContent = document.createElement('DIV');
                this.elementContent.className = "calendar-panel-content";
                this.element.appendChild(this.elementContent);
                this._currentItem = new CalendarDayPanelContentControl(this, this.currentDate);
            }
            Object.defineProperty(CalendarDayPanelControl.prototype, "currentDate", {
                get: function () {
                    return this._currentDate;
                },
                enumerable: true,
                configurable: true
            });
            CalendarDayPanelControl.prototype.ensureValue = function () {
                if (moment(this.currentDate).diff(this._currentItem.currentDate) != 0) {
                    this.update(function (elt) { return WinJS.UI.Animation.drillInIncoming(elt); }, function (elt) { return WinJS.UI.Animation.drillInOutgoing(elt); });
                }
            };
            CalendarDayPanelControl.prototype.update = function (animIn, animOut) {
                this._currentItem.currentDate = moment(this._currentDate);
                this._currentItem.generateDays(animIn, animOut);
                this.parent.checkState();
            };
            CalendarDayPanelControl.prototype.next = function () {
                this._currentDate = moment(this._currentDate).add(1, "M").toDate();
                this.update(function (elt) { return WinJSContrib.UI.Animation.slideFromBottom(elt, { duration: 160 }); }, function (elt) { return WinJSContrib.UI.Animation.slideToTop(elt, { duration: 160 }); });
            };
            CalendarDayPanelControl.prototype.previous = function () {
                this._currentDate = moment(this._currentDate).add(-1, "M").toDate();
                this._currentItem.currentDate = moment(this._currentDate);
                this.update(function (elt) { return WinJSContrib.UI.Animation.slideFromTop(elt, { duration: 160 }); }, function (elt) { return WinJSContrib.UI.Animation.slideToBottom(elt, { duration: 160 }); });
            };
            CalendarDayPanelControl.prototype.allowNext = function () {
                return true;
            };
            CalendarDayPanelControl.prototype.allowPrevious = function () {
                return true;
            };
            return CalendarDayPanelControl;
        })(CalendarPanelControl);
        UI.CalendarDayPanelControl = CalendarDayPanelControl;
        var CalendarDayPanelContentControl = (function () {
            function CalendarDayPanelContentControl(parent, currentDate) {
                this.parent = parent;
                this.currentDate = moment(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
                this.element = document.createElement('DIV');
                this.element.className = "calendar-panel-item day-panel-item";
                this.element.id = "month" + this.currentDate.toDate().toISOString();
                this.parent.elementContent.appendChild(this.element);
                this.renderContent();
            }
            CalendarDayPanelContentControl.prototype.enter = function (anim) {
                anim = anim || WinJS.UI.Animation.drillOutIncoming;
                return anim(this.element);
            };
            CalendarDayPanelContentControl.prototype.renderContent = function () {
                var startdate = this.currentDate.clone().day(this.parent.parent.startDayOfWeek);
                this.element.innerHTML =
                    "<header>\n\t\t\t\t\t<div class=\"month\">" + this.currentDate.format("MMMM") + "</div>\n\t\t\t\t\t<div class=\"year\">" + this.currentDate.format("YYYY") + "</div>\n\t\t\t\t</header>\n\t\t\t\t<section class=\"day-items\">\n\t\t\t\t\t<header>\n\t\t\t\t\t</header>\n\t\t\t\t\t<section>\n\t\t\t\t\t</section>\n\t\t\t\t</section>";
                this.monthTxt = this.element.querySelector(".month");
                this.yearTxt = this.element.querySelector(".year");
                this.header = this.element.querySelector(".day-items > header");
                var headerdate = startdate.clone();
                for (var i = 0; i < 7; i++) {
                    var head = document.createElement("DIV");
                    head.className = "day-item day-header";
                    head.innerText = headerdate.format("ddd");
                    var dow = headerdate.day();
                    if (dow == 0 || dow == 6) {
                        head.classList.add("weekend");
                    }
                    this._lastdow = headerdate.day();
                    headerdate.add(1, "d");
                    this.header.appendChild(head);
                }
                this.content = this.element.querySelector(".day-items > section");
                this.days = this.renderDaysWrapper(this.content);
            };
            CalendarDayPanelContentControl.prototype.generateDays = function (animIn, animOut) {
                var _this = this;
                if (this.days) {
                    var currentDays = this.days;
                    animOut(currentDays).then(function () {
                        currentDays.parentElement.removeChild(currentDays);
                    });
                }
                this.selected = null;
                this.days = this.renderDaysWrapper(this.content);
                animIn(this.days).then(function () {
                    _this.monthTxt.innerText = _this.currentDate.format("MMMM");
                    _this.yearTxt.innerText = _this.currentDate.format("YYYY");
                });
            };
            CalendarDayPanelContentControl.prototype.renderDaysWrapper = function (container) {
                var itemsWrapper = document.createElement("DIV");
                itemsWrapper.className = "day-items-wrapper";
                this.renderDays(itemsWrapper);
                container.appendChild(itemsWrapper);
                return itemsWrapper;
            };
            CalendarDayPanelContentControl.prototype.renderDays = function (container) {
                var _this = this;
                var startdate = this.currentDate.clone().day(this.parent.parent.startDayOfWeek);
                var currentMonth = this.currentDate.month();
                var currentDate = moment(this.parent.parent.value).hour(0).minute(0).second(0).millisecond(0);
                var minDate = null;
                if (this.parent.parent.minDate)
                    minDate = moment(this.parent.parent.minDate);
                var maxDate = null;
                if (this.parent.parent.maxDate)
                    maxDate = moment(this.parent.parent.maxDate);
                var contentdate = startdate.clone();
                var lastday = this.currentDate.clone().add(1, "M").add(-1, "d");
                if (lastday.day() != this._lastdow)
                    lastday.day(this._lastdow + 7);
                var count = 0;
                while (contentdate <= lastday) {
                    var day = document.createElement("BUTTON");
                    day.className = "day-item";
                    day.id = "day-" + contentdate.format("YYYY-MM-DD");
                    day.innerText = contentdate.format("DD");
                    if (contentdate.diff(currentDate) == 0) {
                        day.classList.add("selected");
                        this.selected = day;
                    }
                    var dow = contentdate.day();
                    if (dow == 0 || dow == 6) {
                        day.classList.add("weekend");
                    }
                    if (contentdate.month() != currentMonth) {
                        day.classList.add("notthismonth");
                    }
                    day.mcnCalendarDay = contentdate.clone();
                    WinJSContrib.UI.tap(day, function (arg) {
                        var date = arg.mcnCalendarDay;
                        arg.classList.add("selected");
                        if (_this.selected) {
                            _this.selected.classList.remove("selected");
                        }
                        _this.selected = arg;
                        _this.parent.parent.value = date.toDate();
                        _this.parent.parent.dispatchEvent("change");
                    });
                    contentdate.add(1, "d");
                    container.appendChild(day);
                }
            };
            CalendarDayPanelContentControl.prototype.remove = function (anim) {
                var _this = this;
                anim = anim || WinJS.UI.Animation.drillOutOutgoing;
                if (!this.element)
                    return WinJS.Promise.wrap();
                return anim(this.element).then(function () {
                    WinJSContrib.UI.untapAll(_this.element);
                    _this.element.parentElement.removeChild(_this.element);
                    _this.element = null;
                });
            };
            return CalendarDayPanelContentControl;
        })();
        UI.CalendarDayPanelContentControl = CalendarDayPanelContentControl;
        UI.Calendar = WinJS.Class.mix(WinJS.Utilities.markSupportedForProcessing(CalendarControl), WinJS.Utilities.eventMixin, WinJS.Utilities.createEventProperties("change"));
        UI.CalendarDayPanel = WinJS.Class.mix(CalendarDayPanelControl, WinJS.Utilities.eventMixin, WinJS.Utilities.createEventProperties("selected"));
    })(UI = WinJSContrib.UI || (WinJSContrib.UI = {}));
})(WinJSContrib || (WinJSContrib = {}));

//# sourceMappingURL=../../Sources/Controls/winjscontrib.ui.calendar.js.map