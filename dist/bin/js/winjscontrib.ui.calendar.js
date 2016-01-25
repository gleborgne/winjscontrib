/* 
 * WinJS Contrib v2.1.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

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
                this.flyout.element.classList.add("mcn-datepicker-flyout");
                this.element.appendChild(this.flyout.element);
                if (!options.hasOwnProperty("deferRendering")) {
                    options.deferRendering = true;
                }
                var elt = document.createElement("DIV");
                this.flyout.element.appendChild(elt);
                this.calendar = new WinJSContrib.UI.Calendar(elt, options);
                this.calendar.onchange = function () {
                    _this.value = _this.calendar.value;
                };
                this.textElement = document.createElement("DIV");
                this.textElement.className = "mcn-datepicker-text tap";
                this.element.appendChild(this.textElement);
                this.textElement.tabIndex = 0;
                this.textElement.setAttribute("role", "button");
                this.textElement.onclick = function (arg) {
                    arg.preventDefault();
                    arg.stopPropagation();
                    _this.flyout.show(_this.textElement);
                };
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
                this.element.winControl = this;
                this.element.classList.add('mcn-calendar');
                this.element.classList.add('win-disposable');
                WinJS.UI.setOptions(this, options);
                this._ready = false;
                if (!options.deferRendering) {
                    this.render();
                }
                else {
                    var control = WinJSContrib.Utils.getScopeControl(this.element);
                    if (control) {
                        if (control.readyComplete) {
                            control.readyComplete.then(function () {
                                return WinJS.Promise.timeout(200);
                            }).then(function () {
                                WinJS.Utilities.Scheduler.schedule(function () {
                                    _this.render();
                                }, WinJS.Utilities.Scheduler.Priority.idle);
                            });
                        }
                    }
                    setTimeout(function () {
                        WinJS.Utilities.Scheduler.schedule(function () {
                            _this.render();
                        }, WinJS.Utilities.Scheduler.Priority.idle);
                    }, 2000);
                }
            }
            Object.defineProperty(CalendarControl.prototype, "value", {
                get: function () {
                    return this._value;
                },
                set: function (val) {
                    if (typeof val == "string")
                        val = moment(val).toDate();
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
                var _this = this;
                if (this._ready)
                    return;
                this._ready = true;
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
                var dateToRender = this.value;
                if (!dateToRender) {
                    if (this.mindate) {
                        dateToRender = moment(this.mindate).toDate();
                    }
                    else {
                        dateToRender = new Date();
                    }
                }
                this._daysPanel = new CalendarDayPanelControl(this, dateToRender);
                this._currentPanel = this._daysPanel;
                this._currentPanel.currentChanged = function () {
                    _this.checkState();
                };
                this.checkState();
                this.element.onmousewheel = function (arg) {
                    arg.preventDefault();
                    arg.stopPropagation();
                    if (arg.wheelDelta < 0) {
                        if (_this._currentPanel.allowNext())
                            _this._currentPanel.next();
                    }
                    else {
                        if (_this._currentPanel.allowPrevious())
                            _this._currentPanel.previous();
                    }
                };
            };
            CalendarControl.prototype.checkState = function () {
                if (this._currentPanel.allowNext()) {
                    this.navbuttonNext.disabled = false;
                }
                else {
                    this.navbuttonNext.disabled = true;
                }
                if (this._currentPanel.allowPrevious()) {
                    this.navbuttonPrevious.disabled = false;
                }
                else {
                    this.navbuttonPrevious.disabled = true;
                }
            };
            CalendarControl.prototype.dispatchEvent = function (type, data) {
            };
            CalendarControl.prototype.addEventListener = function (type, callback) {
            };
            CalendarControl.prototype.switchToMonth = function () {
                if (this._currentPanel != this._monthsPanel) {
                    this._currentPanel.hide();
                }
                if (!this._monthsPanel) {
                    this._monthsPanel = new CalendarMonthPanelControl(this, this._currentPanel._currentDate);
                }
                else {
                    this._monthsPanel._currentDate = this._currentPanel._currentDate;
                    this._monthsPanel.ensureValue(true);
                }
                this._monthsPanel.show();
                this._currentPanel = this._monthsPanel;
                this.checkState();
            };
            CalendarControl.prototype.switchToDays = function () {
                if (this._currentPanel != this._daysPanel) {
                    this._currentPanel.hide();
                }
                this._daysPanel._currentDate = this._currentPanel._currentDate;
                this._daysPanel.ensureValue(true);
                this._daysPanel.show();
                this._currentPanel = this._daysPanel;
                this.checkState();
            };
            return CalendarControl;
        })();
        UI.CalendarControl = CalendarControl;
        UI.Calendar = WinJS.Class.mix(WinJS.Utilities.markSupportedForProcessing(CalendarControl), WinJS.Utilities.eventMixin, WinJS.Utilities.createEventProperties("change"));
        var CalendarPanelControl = (function () {
            function CalendarPanelControl(parent, currentDate) {
                this.parent = parent;
                this.element = document.createElement('DIV');
                this.element.className = "calendar-panel";
                this.element.tabIndex = -1;
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
            CalendarPanelControl.prototype.ensureValue = function (immediate) {
            };
            CalendarPanelControl.prototype.hide = function () {
                var _this = this;
                return WinJS.UI.Animation.drillInOutgoing(this.element).then(function () {
                    _this.element.classList.add("disabled");
                });
            };
            CalendarPanelControl.prototype.show = function () {
                this.element.classList.remove("disabled");
                return WinJS.UI.Animation.drillInIncoming(this.element);
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
            CalendarDayPanelControl.prototype.ensureValue = function (immediate) {
                if (moment(this.currentDate).diff(this._currentItem.currentDate) != 0) {
                    this.update(function (elt) { return WinJS.UI.Animation.drillInIncoming(elt); }, function (elt) { return WinJS.UI.Animation.drillInOutgoing(elt); }, immediate);
                }
            };
            CalendarDayPanelControl.prototype.update = function (animIn, animOut, immediate) {
                this._currentItem.currentDate = moment(this._currentDate);
                this._currentItem.generateDays(animIn, animOut, immediate);
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
                if (!this.parent.maxdate)
                    return true;
                var lastDay = moment(this._currentDate).add(1, "M").add(-1, "d").toDate();
                if (lastDay < moment(this.parent.maxdate).toDate())
                    return true;
                return false;
            };
            CalendarDayPanelControl.prototype.allowPrevious = function () {
                if (!this.parent.mindate)
                    return true;
                if (this._currentDate > moment(this.parent.mindate).toDate())
                    return true;
                return false;
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
                this.element.id = "month" + (this.currentDate.toDate().toISOString());
                this.parent.elementContent.appendChild(this.element);
                this.renderContent();
            }
            CalendarDayPanelContentControl.prototype.enter = function (anim) {
                anim = anim || WinJS.UI.Animation.drillOutIncoming;
                return anim(this.element);
            };
            CalendarDayPanelContentControl.prototype.renderContent = function () {
                var _this = this;
                var startdate = this.currentDate.clone().day(this.parent.parent.startDayOfWeek);
                this.element.innerHTML =
                    "<header>\n\t\t\t\t\t<div class=\"month\">" + this.currentDate.format("MMMM") + "</div>\n\t\t\t\t\t<div class=\"year\">" + this.currentDate.format("YYYY") + "</div>\n\t\t\t\t</header>\n\t\t\t\t<section class=\"day-items\">\n\t\t\t\t\t<header>\n\t\t\t\t\t</header>\n\t\t\t\t\t<section>\n\t\t\t\t\t</section>\n\t\t\t\t</section>";
                this.monthTxt = this.element.querySelector(".month");
                this.yearTxt = this.element.querySelector(".year");
                var panelheader = this.element.querySelector("header");
                WinJSContrib.UI.tap(panelheader, function () {
                    _this.parent.parent.switchToMonth();
                });
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
            CalendarDayPanelContentControl.prototype.destroyPanel = function (dayspanel) {
                WinJS.Utilities.disposeSubTree(dayspanel);
                dayspanel.winControl.dispose();
                dayspanel.parentElement.removeChild(dayspanel);
            };
            CalendarDayPanelContentControl.prototype.generateDays = function (animIn, animOut, immediate) {
                var _this = this;
                if (this.days) {
                    var currentDays = this.days;
                    if (immediate) {
                        this.destroyPanel(currentDays);
                    }
                    else {
                        animOut(currentDays).then(function () {
                            _this.destroyPanel(currentDays);
                        });
                    }
                }
                this.selected = null;
                this.days = this.renderDaysWrapper(this.content);
                if (immediate) {
                    this.monthTxt.innerText = this.currentDate.format("MMMM");
                    this.yearTxt.innerText = this.currentDate.format("YYYY");
                }
                else {
                    animIn(this.days).then(function () {
                        _this.monthTxt.innerText = _this.currentDate.format("MMMM");
                        _this.yearTxt.innerText = _this.currentDate.format("YYYY");
                    });
                }
            };
            CalendarDayPanelContentControl.prototype.renderDaysWrapper = function (container) {
                var _this = this;
                var itemsWrapper = document.createElement("DIV");
                itemsWrapper.className = "day-items-wrapper";
                var swipe = new WinJSContrib.UI.SwipeSlide(itemsWrapper, { direction: "vertical", allowed: { top: this.parent.allowNext(), bottom: this.parent.allowPrevious() } });
                swipe.onswipe = function (arg) {
                    swipe.swipeHandled = true;
                    if (arg.direction == "top") {
                        _this.parent.next();
                    }
                    else if (arg.direction == "bottom") {
                        _this.parent.previous();
                    }
                };
                this.renderDays(itemsWrapper);
                container.appendChild(itemsWrapper);
                return itemsWrapper;
            };
            CalendarDayPanelContentControl.prototype.renderDays = function (container) {
                var _this = this;
                var startdate = this.currentDate.clone().day(this.parent.parent.startDayOfWeek);
                var currentMonth = this.currentDate.month();
                var currentvalue = this.parent.parent.value;
                var currentValueDate = moment(currentvalue);
                var currentDate = moment(this.parent.parent.value).hour(0).minute(0).second(0).millisecond(0);
                var minDate = null;
                var today = moment().hour(0).minute(0).second(0).millisecond(0);
                if (this.parent.parent.mindate)
                    minDate = moment(this.parent.parent.mindate).hour(0).minute(0).second(0).millisecond(0);
                var maxDate = null;
                if (this.parent.parent.maxdate)
                    maxDate = moment(this.parent.parent.maxdate).hour(0).minute(0).second(0).millisecond(0);
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
                    if (contentdate.diff(today) == 0) {
                        day.classList.add("today");
                    }
                    if (currentvalue && contentdate.diff(currentValueDate) == 0) {
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
                    if (minDate && contentdate < minDate)
                        day.disabled = true;
                    if (maxDate && contentdate > maxDate)
                        day.disabled = true;
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
        var CalendarMonthPanelControl = (function (_super) {
            __extends(CalendarMonthPanelControl, _super);
            function CalendarMonthPanelControl(parent, currentDate) {
                _super.call(this, parent, currentDate);
                this.element.classList.add("month-panel");
                this.renderContent();
            }
            CalendarMonthPanelControl.prototype.next = function () {
                this._currentDate = moment(this._currentDate).add(1, "Y").toDate();
                this.update(function (elt) { return WinJSContrib.UI.Animation.slideFromBottom(elt, { duration: 160 }); }, function (elt) { return WinJSContrib.UI.Animation.slideToTop(elt, { duration: 160 }); });
            };
            CalendarMonthPanelControl.prototype.previous = function () {
                this._currentDate = moment(this._currentDate).add(-1, "Y").toDate();
                this.update(function (elt) { return WinJSContrib.UI.Animation.slideFromTop(elt, { duration: 160 }); }, function (elt) { return WinJSContrib.UI.Animation.slideToBottom(elt, { duration: 160 }); });
            };
            CalendarMonthPanelControl.prototype.allowNext = function () {
                var lastday = new Date(this._currentDate.getFullYear(), 11, 31);
                if (!this.parent.maxdate)
                    return true;
                if (lastday < moment(this.parent.maxdate).toDate())
                    return true;
                return false;
            };
            CalendarMonthPanelControl.prototype.allowPrevious = function () {
                var firstday = new Date(this._currentDate.getFullYear(), 0, 1);
                if (!this.parent.mindate)
                    return true;
                if (firstday > moment(this.parent.mindate).month(0).date(1).toDate())
                    return true;
                return false;
            };
            CalendarMonthPanelControl.prototype.ensureValue = function (immediate) {
                if (moment(this._currentDate).diff(moment(this.renderedDate)) != 0) {
                    this.update(function (elt) { return WinJS.UI.Animation.drillInIncoming(elt); }, function (elt) { return WinJS.UI.Animation.drillInOutgoing(elt); }, immediate);
                }
            };
            CalendarMonthPanelControl.prototype.update = function (animIn, animOut, immediate) {
                var _this = this;
                var previouspanel = this.monthesPanel;
                if (immediate) {
                    previouspanel.parentElement.removeChild(previouspanel);
                }
                else {
                    animOut(this.monthesPanel).then(function () {
                        previouspanel.parentElement.removeChild(previouspanel);
                    });
                }
                this.monthesPanel = this.renderMonthPanel(this.content);
                if (immediate) {
                    this.yearTxt.innerText = "" + this._currentDate.getFullYear();
                }
                else {
                    animIn(this.monthesPanel).then(function () {
                        _this.yearTxt.innerText = "" + _this._currentDate.getFullYear();
                    });
                }
                this.parent.checkState();
            };
            CalendarMonthPanelControl.prototype.renderContent = function () {
                this.element.innerHTML =
                    "<header>\n\t\t\t\t\t<div class=\"year\">" + this._currentDate.getFullYear() + "</div>\n\t\t\t\t</header>\n\t\t\t\t<section class=\"month-items\">\n\t\t\t\t\t\n\t\t\t\t</section>";
                this.yearTxt = this.element.querySelector(".year");
                this.content = this.element.querySelector(".month-items");
                this.monthesPanel = this.renderMonthPanel(this.content);
            };
            CalendarMonthPanelControl.prototype.renderMonthPanel = function (container) {
                var _this = this;
                var panel = document.createElement("DIV");
                panel.className = "month-itemspanel";
                var swipe = new WinJSContrib.UI.SwipeSlide(panel, { direction: "vertical", allowed: { top: this.allowNext(), bottom: this.allowPrevious() } });
                swipe.onswipe = function (arg) {
                    swipe.swipeHandled = true;
                    if (arg.direction == "top") {
                        _this.next();
                    }
                    else if (arg.direction == "bottom") {
                        _this.previous();
                    }
                };
                var start = moment(new Date(this._currentDate.getFullYear(), 0, 1));
                var now = moment().hour(0).minute(0).second(0).millisecond(0);
                var thismonth = now.clone().date(1);
                var minDate = null;
                if (this.parent.mindate)
                    minDate = moment(this.parent.mindate).date(1).hour(0).minute(0).second(0).millisecond(0);
                var maxDate = null;
                if (this.parent.maxdate)
                    maxDate = moment(this.parent.maxdate).date(1).hour(0).minute(0).second(0).millisecond(0);
                for (var i = 0; i < 12; i++) {
                    var month = document.createElement("BUTTON");
                    month.className = "month-item";
                    var currentMonthDate = start.clone();
                    month.mcnMonthDate = currentMonthDate;
                    month.innerText = currentMonthDate.format("MMM");
                    if (currentMonthDate.diff(thismonth) == 0) {
                        month.classList.add("today");
                    }
                    else if (start < now) {
                        month.classList.add("pastmonth");
                    }
                    if (minDate && start < minDate)
                        month.disabled = true;
                    if (maxDate && start > maxDate)
                        month.disabled = true;
                    WinJSContrib.UI.tap(month, function (elt) {
                        var date = elt.mcnMonthDate;
                        _this._currentDate = date.toDate();
                        _this.parent.switchToDays();
                    });
                    panel.appendChild(month);
                    start.add(1, "M");
                }
                container.appendChild(panel);
                this.renderedDate = this._currentDate;
                return panel;
            };
            return CalendarMonthPanelControl;
        })(CalendarPanelControl);
        UI.CalendarMonthPanelControl = CalendarMonthPanelControl;
    })(UI = WinJSContrib.UI || (WinJSContrib.UI = {}));
})(WinJSContrib || (WinJSContrib = {}));

//# sourceMappingURL=../../Sources/Controls/winjscontrib.ui.calendar.js.map