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
        var amHoursList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        var amRadialHoursList = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        var pmHoursList = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0];
        var pmRadialHoursList = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
        var minutesList = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 0];
        var radialMinutesList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
        var TimePickerControl = (function () {
            function TimePickerControl(element, options) {
                var _this = this;
                this.element = element || document.createElement('DIV');
                options = options || {};
                this.element.winControl = this;
                this.element.classList.add('mcn-timepicker');
                this.element.classList.add('win-disposable');
                this.flyout = new WinJS.UI.Flyout();
                this.flyout.element.classList.add("mcn-timepicker-flyout");
                this.element.appendChild(this.flyout.element);
                if (!options.hasOwnProperty("deferRendering")) {
                    options.deferRendering = true;
                }
                var elt = document.createElement("DIV");
                this.flyout.element.appendChild(elt);
                var calendaroptions = JSON.parse(JSON.stringify(options));
                calendaroptions.flyout = this.flyout;
                this.timeclock = new WinJSContrib.UI.TimeClock(elt, calendaroptions);
                this.timeclock.element.onmousewheel = function (arg) {
                    arg.preventDefault();
                    arg.stopPropagation();
                };
                this.timeclock.onchange = function () {
                    _this.value = _this.timeclock.value;
                    _this.flyout.hide();
                    _this.dispatchEvent("change");
                };
                this.timeclock.onhourchange = function () {
                    _this.value = _this.timeclock.value;
                };
                this.flyout.onbeforeshow = function () {
                    setImmediate(function () {
                        _this.timeclock.setFocus();
                    });
                };
                this.flyout.onafterhide = function () {
                    _this.timeclock.switchToHours();
                };
                this.textElement = document.createElement("DIV");
                this.textElement.className = "mcn-timepicker-text tap";
                this.element.appendChild(this.textElement);
                this.textElement.tabIndex = 0;
                this.textElement.setAttribute("role", "button");
                this.textElement.onclick = function (arg) {
                    arg.preventDefault();
                    arg.stopPropagation();
                    _this.flyout.show(_this.textElement);
                };
                this.textElement.innerText = this.timeclock.value;
                WinJS.UI.setOptions(this, options);
                //if (!this.value) {
                //    this.value = "";
                //}
            }
            Object.defineProperty(TimePickerControl.prototype, "value", {
                get: function () {
                    return this.timeclock.value;
                },
                set: function (val) {
                    try {
                        this.timeclock.value = val;
                    }
                    catch (exception) {
                        console.error(exception);
                    }
                    this.textElement.innerText = this.timeclock.value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TimePickerControl.prototype, "valueAsDate", {
                get: function () {
                    return this.timeclock.valueAsDate;
                },
                set: function (val) {
                    this.timeclock.valueAsDate = val;
                    this.textElement.innerText = this.timeclock.value;
                },
                enumerable: true,
                configurable: true
            });
            TimePickerControl.prototype.dispose = function () {
                WinJS.Utilities.disposeSubTree(this.element);
            };
            TimePickerControl.prototype.dispatchEvent = function (type, data) {
            };
            TimePickerControl.prototype.addEventListener = function (type, callback) {
            };
            return TimePickerControl;
        })();
        UI.TimePickerControl = TimePickerControl;
        UI.TimePicker = WinJS.Class.mix(WinJS.Utilities.markSupportedForProcessing(TimePickerControl), WinJS.Utilities.eventMixin, WinJS.Utilities.createEventProperties("change"));
        var TimeClockControl = (function () {
            function TimeClockControl(element, options) {
                var _this = this;
                this.element = element || document.createElement('DIV');
                options = options || {};
                this.element.winControl = this;
                this.element.classList.add('mcn-timeclock');
                this.element.classList.add('win-disposable');
                this.eventTracker = new WinJSContrib.UI.EventTracker();
                if (options.radial) {
                    this.element.classList.add('radial');
                }
                if (!options.value) {
                    this.valueAsDate = new Date();
                }
                WinJS.UI.setOptions(this, options);
                if (this.flyout) {
                    this.element.classList.add('win-xyfocus-suspended');
                    this.eventTracker.addEvent(this.element, "keydown", this.onkeydown.bind(this), true);
                }
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
                    else {
                        setTimeout(function () {
                            WinJS.Utilities.Scheduler.schedule(function () {
                                _this.render();
                            }, WinJS.Utilities.Scheduler.Priority.idle);
                        }, 2000);
                    }
                }
            }
            TimeClockControl.prototype.render = function () {
                var _this = this;
                this.element.innerHTML =
                    "<header>\n                    <button class=\"hours current\">" + WinJSContrib.Utils.pad2(this.hour) + "</button>\n                    <div class=\"sep\">:</div>\n                    <button class=\"minutes\">" + WinJSContrib.Utils.pad2(this.minutes) + "</button>\n                </header>\n                <section>\n                </section>";
                this.header = this.element.querySelector("header");
                this.content = this.element.querySelector("section");
                this.hoursElt = this.element.querySelector(".hours");
                WinJSContrib.UI.tap(this.hoursElt, function () {
                    _this.switchToHours();
                });
                this.minutesElt = this.element.querySelector(".minutes");
                WinJSContrib.UI.tap(this.minutesElt, function () {
                    _this.switchToMinutes();
                });
                this.amLabel = this.amLabel || "AM";
                this.pmLabel = this.pmLabel || "PM";
                this.hoursPanel = new HoursPanel(this);
                //this.minutesPanel = new MinutesPanel(this);
                this.currentPanel = this.hoursPanel;
            };
            TimeClockControl.prototype.onkeydown = function (arg) {
                if (arg.key == "PageDown") {
                    this.toggleDisplay();
                    arg.preventDefault();
                    arg.stopPropagation();
                }
                else if (arg.key == "PageUp") {
                    this.toggleDisplay();
                    arg.preventDefault();
                    arg.stopPropagation();
                }
                else if (arg.key == "Down") {
                    var nextelt = WinJS.UI.XYFocus.findNextFocusElement("down", { focusRoot: this.element });
                    if (nextelt) {
                        nextelt.focus();
                    }
                    else {
                        if (this.currentPanel == this.hoursPanel) {
                            this.hoursPanel.toggleView();
                        }
                    }
                    arg.preventDefault();
                    arg.stopPropagation();
                }
                else if (arg.key == "Up") {
                    var nextelt = WinJS.UI.XYFocus.findNextFocusElement("up", { focusRoot: this.element });
                    if (nextelt) {
                        nextelt.focus();
                    }
                    else {
                        if (this.currentPanel == this.hoursPanel) {
                            this.hoursPanel.toggleView();
                        }
                    }
                    arg.preventDefault();
                    arg.stopPropagation();
                }
                else if (arg.key == "Left") {
                    var nextelt = WinJS.UI.XYFocus.findNextFocusElement("left", { focusRoot: this.element });
                    if (nextelt)
                        nextelt.focus();
                    arg.preventDefault();
                    arg.stopPropagation();
                }
                else if (arg.key == "Right") {
                    var nextelt = WinJS.UI.XYFocus.findNextFocusElement("right", { focusRoot: this.element });
                    if (nextelt)
                        nextelt.focus();
                    arg.preventDefault();
                    arg.stopPropagation();
                }
            };
            Object.defineProperty(TimeClockControl.prototype, "value", {
                get: function () {
                    return WinJSContrib.Utils.pad2(this.hour) + ":" + WinJSContrib.Utils.pad2(this.minutes);
                },
                set: function (val) {
                    var items = val.split(':');
                    this._value = moment(this._value).hour(parseInt(items[0], 10)).minute(parseInt(items[1], 10)).toDate();
                    this.updateDisplay();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TimeClockControl.prototype, "valueAsDate", {
                get: function () {
                    return this._value;
                },
                set: function (val) {
                    this._value = moment(val).toDate();
                    this.updateDisplay();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TimeClockControl.prototype, "hour", {
                get: function () {
                    return this._value.getHours();
                },
                set: function (val) {
                    this._value = moment(this._value).hour(val).toDate();
                    this.updateDisplay();
                    this.dispatchEvent("hourchange");
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TimeClockControl.prototype, "minutes", {
                get: function () {
                    return this._value.getMinutes();
                },
                set: function (val) {
                    this._value = moment(this._value).minute(val).toDate();
                    this.updateDisplay();
                    this.dispatchEvent("change");
                    this.dispatchEvent("minutechange");
                },
                enumerable: true,
                configurable: true
            });
            TimeClockControl.prototype.conformMinutes = function () {
                var minutes = this._value.getMinutes() || 0;
                var count = 0;
                while (count < 10 && minutes % 5 != 0) {
                    minutes = minutes - 1;
                    count++;
                }
                this._value = moment(this._value).minute(minutes).toDate();
            };
            TimeClockControl.prototype.updateDisplay = function () {
                this.conformMinutes();
                if (this.hoursElt) {
                    this.hoursElt.innerText = WinJSContrib.Utils.pad2(this.hour);
                    this.minutesElt.innerText = WinJSContrib.Utils.pad2(this.minutes);
                }
                if (this.currentPanel) {
                    this.currentPanel.ensureValue();
                }
            };
            TimeClockControl.prototype.toggleDisplay = function () {
                if (this.currentPanel == this.hoursPanel) {
                    this.switchToMinutes();
                }
                else {
                    this.switchToHours();
                }
            };
            TimeClockControl.prototype.setFocus = function () {
                if (this.currentPanel)
                    this.currentPanel.setFocus();
            };
            TimeClockControl.prototype.switchToHours = function () {
                if (this.currentPanel == this.hoursPanel) {
                    this.hoursPanel.ensureValue();
                    return;
                }
                if (this.currentPanel && this.currentPanel != this.hoursPanel) {
                    this.currentPanel.remove();
                }
                if (!this.hoursPanel) {
                    this.hoursPanel = new HoursPanel(this);
                }
                else {
                    this.hoursPanel.ensureValue();
                }
                this.minutesElt.classList.remove("current");
                this.hoursElt.classList.add("current");
                this.hoursPanel.show();
                this.hoursPanel.setFocus();
                this.currentPanel = this.hoursPanel;
            };
            TimeClockControl.prototype.switchToMinutes = function () {
                if (this.currentPanel == this.minutesPanel) {
                    this.minutesPanel.ensureValue();
                    return;
                }
                if (this.currentPanel && this.currentPanel != this.minutesPanel) {
                    this.currentPanel.remove();
                }
                if (!this.minutesPanel) {
                    this.minutesPanel = new MinutesPanel(this);
                }
                else {
                    this.minutesPanel.ensureValue();
                }
                this.minutesElt.classList.add("current");
                this.hoursElt.classList.remove("current");
                this.minutesPanel.show();
                this.minutesPanel.setFocus();
                this.currentPanel = this.minutesPanel;
            };
            TimeClockControl.prototype.dispatchEvent = function (type, data) {
            };
            TimeClockControl.prototype.addEventListener = function (type, callback) {
            };
            TimeClockControl.prototype.dispose = function () {
                this.eventTracker.dispose();
            };
            return TimeClockControl;
        })();
        UI.TimeClockControl = TimeClockControl;
        UI.TimeClock = WinJS.Class.mix(WinJS.Utilities.markSupportedForProcessing(TimeClockControl), WinJS.Utilities.eventMixin, WinJS.Utilities.createEventProperties("change", "hourchange", "minutechange"));
        var TimePanel = (function () {
            function TimePanel(parent) {
                this.parent = parent;
                this.element = document.createElement("DIV");
                this.element.className = "timepanel";
                this.element.innerHTML =
                    "<header>\n                </header>\n                <section>\n                </section>";
                this.header = this.element.querySelector("header");
                this.content = this.element.querySelector("section");
                this.parent.content.appendChild(this.element);
            }
            TimePanel.prototype.renderItems = function (items, name, current, callback, itemcallback) {
                var itempanel = document.createElement("DIV");
                itempanel.className = "itemspanel";
                var itemscontainer = document.createElement("DIV");
                itemscontainer.className = "items";
                itempanel.appendChild(itemscontainer);
                items.forEach(function (n) {
                    var item = document.createElement("BUTTON");
                    item.className = "timeitem item-" + name;
                    item.id = name + n;
                    item.dataset["val"] = "" + n;
                    item.innerText = WinJSContrib.Utils.pad2(n);
                    if (n == current) {
                        item.classList.add("selected");
                    }
                    item.onclick = callback;
                    itemscontainer.appendChild(item);
                });
                if (this.parent.radial) {
                    this.radialLayout(itemscontainer);
                }
                return itempanel;
            };
            TimePanel.prototype.radialLayout = function (itemcontainer) {
                var radian, radius, outerRadius = 80, dialRadius = 130, tickRadius = 38;
                for (var i = 0; i < 12; i++) {
                    var tick = itemcontainer.children[i];
                    radian = i / 6 * Math.PI;
                    radius = outerRadius;
                    tick.style.left = (dialRadius + Math.sin(radian) * radius - tickRadius) + 'px';
                    tick.style.top = (dialRadius - Math.cos(radian) * radius - tickRadius) + 'px';
                }
            };
            TimePanel.prototype.remove = function () {
                var _this = this;
                return WinJS.UI.Animation.drillInOutgoing(this.element).then(function () {
                    _this.element.classList.add("hidden");
                    _this.element.style.display = "none";
                });
            };
            TimePanel.prototype.show = function () {
                this.element.classList.remove("hidden");
                this.element.style.display = "";
                return WinJS.UI.Animation.drillInIncoming(this.element);
            };
            TimePanel.prototype.ensureValue = function () {
            };
            TimePanel.prototype.setFocus = function () {
            };
            return TimePanel;
        })();
        UI.TimePanel = TimePanel;
        var HoursPanel = (function (_super) {
            __extends(HoursPanel, _super);
            function HoursPanel(parent) {
                _super.call(this, parent);
                this.element.classList.add("hourspanel");
                this.header.innerHTML =
                    "<button class=\"hoursel am\">" + this.parent.amLabel + "</button>\n                <button class=\"hoursel pm\">" + this.parent.pmLabel + "</button>";
                this.amButton = this.header.querySelector(".hoursel.am");
                this.pmButton = this.header.querySelector(".hoursel.pm");
                WinJSContrib.UI.tap(this.amButton, this.setAM.bind(this));
                WinJSContrib.UI.tap(this.pmButton, this.setPM.bind(this));
                this.init();
            }
            HoursPanel.prototype.init = function () {
                var currentHour = this.parent.hour;
                if (currentHour == 0 || currentHour > 12) {
                    var hourslist = this.parent.radial ? pmRadialHoursList : pmHoursList;
                    this.pmButton.classList.add("selected");
                    this.isAm = false;
                }
                else {
                    var hourslist = this.parent.radial ? amRadialHoursList : amHoursList;
                    this.amButton.classList.add("selected");
                    this.isAm = true;
                }
                this.currentHours = this.renderItems(hourslist, "hour", currentHour, this.hourClicked.bind(this));
                this.content.appendChild(this.currentHours);
            };
            HoursPanel.prototype.ensureValue = function () {
                var selecteditem = this.element.querySelector(".item-hour.selected");
                if (selecteditem) {
                    var selectedhour = parseInt(selecteditem.dataset["val"], 10);
                    if (selectedhour != this.parent.hour) {
                        selecteditem.classList.remove("selected");
                        this.currentHours.parentElement.removeChild(this.currentHours);
                        this.init();
                    }
                }
            };
            HoursPanel.prototype.toggleView = function () {
                if (this.isAm) {
                    this.setPM();
                }
                else {
                    this.setAM();
                }
            };
            HoursPanel.prototype.setFocus = function () {
                var focusing = this.currentHours.querySelector(".item-hour.selected");
                if (!focusing)
                    focusing = focusing = this.currentHours.querySelector(".item-hour");
                if (focusing)
                    focusing.focus();
            };
            HoursPanel.prototype.setPM = function () {
                if (!this.isAm)
                    return;
                var previous = this.currentHours;
                WinJS.UI.Animation.drillInOutgoing(previous).then(function () {
                    previous.parentElement.removeChild(previous);
                });
                this.isAm = false;
                var hourslist = this.parent.radial ? pmRadialHoursList : pmHoursList;
                this.pmButton.classList.add("selected");
                this.amButton.classList.remove("selected");
                this.currentHours = this.renderItems(hourslist, "hour", this.parent.hour, this.hourClicked.bind(this));
                this.content.appendChild(this.currentHours);
                this.setFocus();
                WinJS.UI.Animation.drillInIncoming(this.currentHours);
            };
            HoursPanel.prototype.setAM = function () {
                if (this.isAm)
                    return;
                var previous = this.currentHours;
                WinJS.UI.Animation.drillInOutgoing(previous).then(function () {
                    previous.parentElement.removeChild(previous);
                });
                this.isAm = true;
                var hourslist = this.parent.radial ? amRadialHoursList : amHoursList;
                this.pmButton.classList.remove("selected");
                this.amButton.classList.add("selected");
                this.currentHours = this.renderItems(hourslist, "hour", this.parent.hour, this.hourClicked.bind(this));
                this.content.appendChild(this.currentHours);
                this.setFocus();
                WinJS.UI.Animation.drillInIncoming(this.currentHours);
            };
            HoursPanel.prototype.hourClicked = function (arg) {
                var elt = arg.target;
                var selecteditem = this.parent.element.querySelector(".item-hour.selected");
                if (selecteditem)
                    selecteditem.classList.remove("selected");
                elt.classList.add("selected");
                this.parent.hour = parseInt(elt.dataset["val"], 10);
                this.parent.switchToMinutes();
            };
            return HoursPanel;
        })(TimePanel);
        UI.HoursPanel = HoursPanel;
        var MinutesPanel = (function (_super) {
            __extends(MinutesPanel, _super);
            function MinutesPanel(parent) {
                _super.call(this, parent);
                this.element.classList.add("minutespanel");
                var list = minutesList;
                if (this.parent.radial)
                    list = radialMinutesList;
                var timeitems = this.renderItems(list, "min", this.parent.minutes, this.minuteClicked.bind(this));
                this.content.appendChild(timeitems);
            }
            MinutesPanel.prototype.minuteClicked = function (arg) {
                var elt = arg.target;
                var selecteditem = this.parent.element.querySelector(".item-min.selected");
                if (selecteditem)
                    selecteditem.classList.remove("selected");
                elt.classList.add("selected");
                var val = parseInt(elt.dataset["val"], 10);
                this.parent.minutes = val;
            };
            MinutesPanel.prototype.setFocus = function () {
                var focusing = this.content.querySelector(".item-min.selected");
                if (!focusing)
                    focusing = focusing = this.content.querySelector(".item-min");
                if (focusing)
                    focusing.focus();
            };
            return MinutesPanel;
        })(TimePanel);
        UI.MinutesPanel = MinutesPanel;
    })(UI = WinJSContrib.UI || (WinJSContrib.UI = {}));
})(WinJSContrib || (WinJSContrib = {}));

//# sourceMappingURL=../../Sources/Controls/winjscontrib.ui.time.js.map