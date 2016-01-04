module WinJSContrib.UI {
    var amHoursList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    var amRadialHoursList = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    var pmHoursList = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0];
    var pmRadialHoursList = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    var minutesList = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 0];
    var radialMinutesList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

    export class TimePickerControl {
        _value: string;
        public element: HTMLElement;
        public textElement: HTMLElement;
        public flyout: WinJS.UI.Flyout;
        public timeclock: TimeClockControl;

        constructor(element: HTMLElement, options: TimeClockOptions) {
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
            this.timeclock = <TimeClockControl>new WinJSContrib.UI.TimeClock(elt, options);
            this.timeclock.element.onmousewheel = (arg) => {
                arg.preventDefault();
                arg.stopPropagation();
            }

            this.timeclock.onchange = () => {
                this.value = this.timeclock.value;
            }

            this.flyout.onafterhide = () => {
                this.timeclock.switchToHours();
            }

            this.textElement = document.createElement("DIV");
            this.textElement.className = "mcn-timepicker-text";
            this.element.appendChild(this.textElement);

            this.element.tabIndex = 0;
            this.element.setAttribute("role", "button");
            this.textElement.onclick = () => {
                this.flyout.show(this.textElement);
            };
            this.textElement.innerText = this.timeclock.value;
            WinJS.UI.setOptions(this, options);

            //if (!this.value) {
            //    this.value = "";
            //}
        }

        get value(): string {
            return this.timeclock.value;
        }

        set value(val: string) {
            try {
                this.timeclock.value = val;
            } catch (exception) {
                console.error(exception);
            }
            this.textElement.innerText = this.timeclock.value;
            this.flyout.hide();
        }

        get valueAsDate(): Date {
            return this.timeclock.valueAsDate;
        }

        set valueAsDate(val: Date) {
            this.timeclock.valueAsDate = val;
            this.textElement.innerText = this.timeclock.value;
        }

        dispose() {
            WinJS.Utilities.disposeSubTree(this.element);
        }

        dispatchEvent(type: string, data?: any) {

        }

        addEventListener(type: string, callback: any) {

        }
    }
    export var TimePicker = WinJS.Class.mix(WinJS.Utilities.markSupportedForProcessing(TimePickerControl), WinJS.Utilities.eventMixin, WinJS.Utilities.createEventProperties("change"));

    export interface TimeClockOptions {
        deferRendering?: boolean,
        radial?: boolean,
        amLabel?: string;
        pmLabel?: string;
        value?: Date;
    }

    export class TimeClockControl {
        _value: Date;
        radial: boolean;
        public onchange: () => void;
        public element: HTMLElement;
        header: HTMLElement;
        content: HTMLElement;
        hoursElt: HTMLElement;
        minutesElt: HTMLElement;
        currentPanel: TimePanel;
        hoursPanel: HoursPanel;
        minutesPanel: MinutesPanel;
        public amLabel: string;
        public pmLabel: string;

        constructor(element: HTMLElement, options: TimeClockOptions) {
            this.element = element || document.createElement('DIV');
            options = options || {};

            this.element.winControl = this;
            this.element.classList.add('mcn-timeclock');
            this.element.classList.add('win-disposable');
            if (options.radial) {
                this.element.classList.add('radial');
            }

            if (!options.value) {
                this.valueAsDate = new Date();
            }

            WinJS.UI.setOptions(this, options);

            if (!options.deferRendering) {
                this.render();
            } else {
                var control = WinJSContrib.Utils.getScopeControl(this.element);
                if (control) {
                    if (control.readyComplete) {
                        control.readyComplete.then(() => {
                            return WinJS.Promise.timeout(200);
                        }).then(() => {
                            WinJS.Utilities.Scheduler.schedule(() => {
                                this.render();
                            }, WinJS.Utilities.Scheduler.Priority.idle);
                        });
                    }
                }

                setTimeout(() => {
                    WinJS.Utilities.Scheduler.schedule(() => {
                        this.render();
                    }, WinJS.Utilities.Scheduler.Priority.idle);
                }, 2000);
            }


        }

        render() {
            this.element.innerHTML =
                `<header>
                    <button class="hours current">${WinJSContrib.Utils.pad2(this.hour)}</button>
                    <div class="sep">:</div>
                    <button class="minutes">${WinJSContrib.Utils.pad2(this.minutes)}</button>
                </header>
                <section>
                </section>`;
            this.header = <HTMLElement>this.element.querySelector("header");
            this.content = <HTMLElement>this.element.querySelector("section");
            this.hoursElt = <HTMLElement>this.element.querySelector(".hours");
            WinJSContrib.UI.tap(this.hoursElt, () => {
                this.switchToHours();
            });
            this.minutesElt = <HTMLElement>this.element.querySelector(".minutes");
            WinJSContrib.UI.tap(this.minutesElt, () => {
                this.switchToMinutes();
            });

            this.amLabel = this.amLabel || "AM";
            this.pmLabel = this.pmLabel || "PM";

            this.hoursPanel = new HoursPanel(this);
            //this.minutesPanel = new MinutesPanel(this);
            this.currentPanel = this.hoursPanel;
        }

        get value(): string {
            return WinJSContrib.Utils.pad2(this.hour) + ":" + WinJSContrib.Utils.pad2(this.minutes);
        }

        set value(val: string) {
            var items = val.split(':');
            this._value = moment(this._value).hour(parseInt(items[0], 10)).minute(parseInt(items[1], 10)).toDate();
            this.updateDisplay();
        }

        get valueAsDate(): Date {
            return this._value;
        }

        set valueAsDate(val: Date) {
            this._value = moment(val).toDate();
            this.updateDisplay();
        }

        get hour(): number {
            return this._value.getHours();
        }

        set hour(val: number) {
            this._value = moment(this._value).hour(val).toDate();
            this.updateDisplay();

            this.dispatchEvent("hourchange");
        }

        get minutes(): number {
            return this._value.getMinutes();
        }

        set minutes(val: number) {
            this._value = moment(this._value).minute(val).toDate();
            this.updateDisplay();

            this.dispatchEvent("change");
            this.dispatchEvent("minutechange");
        }

        conformMinutes() {
            var minutes = this._value.getMinutes() || 0;
            var count = 0;
            while (count < 10 && minutes % 5 != 0) {
                minutes = minutes - 1;
                count++;
            }
            this._value = moment(this._value).minute(minutes).toDate();
        }

        updateDisplay() {
            this.conformMinutes();
            if (this.hoursElt) {
                this.hoursElt.innerText = WinJSContrib.Utils.pad2(this.hour);
                this.minutesElt.innerText = WinJSContrib.Utils.pad2(this.minutes);
            }

            if (this.currentPanel) {
                this.currentPanel.ensureValue();
            }
        }

        switchToHours() {
            if (this.currentPanel == this.hoursPanel) {
                this.hoursPanel.ensureValue();
                return;
            }

            if (this.currentPanel && this.currentPanel != this.hoursPanel) {
                this.currentPanel.remove();
            }

            if (!this.hoursPanel) {
                this.hoursPanel = new HoursPanel(this);
            } else {
                this.hoursPanel.ensureValue();
            }
            this.minutesElt.classList.remove("current");
            this.hoursElt.classList.add("current");
            this.hoursPanel.show();
            this.currentPanel = this.hoursPanel;
        }

        switchToMinutes() {
            if (this.currentPanel == this.minutesPanel) {
                this.minutesPanel.ensureValue();
                return;
            }

            if (this.currentPanel && this.currentPanel != this.minutesPanel) {
                this.currentPanel.remove();
            }

            if (!this.minutesPanel) {
                this.minutesPanel = new MinutesPanel(this);
            } else {
                this.minutesPanel.ensureValue();
            }
            this.minutesElt.classList.add("current");
            this.hoursElt.classList.remove("current");
            this.minutesPanel.show();
            this.currentPanel = this.minutesPanel;
        }

        dispatchEvent(type: string, data?: any) {
        }

        addEventListener(type: string, callback: any) {
        }
    }
    export var TimeClock = WinJS.Class.mix(WinJS.Utilities.markSupportedForProcessing(TimeClockControl), WinJS.Utilities.eventMixin, WinJS.Utilities.createEventProperties("change", "hourchange", "minutechange"));

    export class TimePanel {
        parent: TimeClockControl;
        element: HTMLElement;
        header: HTMLElement;
        content: HTMLElement;

        constructor(parent: TimeClockControl) {
            this.parent = parent;
            this.element = document.createElement("DIV");
            this.element.className = "timepanel";
            this.element.innerHTML =
                `<header>
                </header>
                <section>
                </section>`;
            this.header = <HTMLElement>this.element.querySelector("header");
            this.content = <HTMLElement>this.element.querySelector("section");

            this.parent.content.appendChild(this.element);
        }

        renderItems(items: number[], name: string, current: number, callback, itemcallback?: (elt: HTMLElement, val: number) => void) {
            var itempanel = document.createElement("DIV");
            itempanel.className = "itemspanel";
            var itemscontainer = <HTMLElement>document.createElement("DIV");
            itemscontainer.className = "items";
            itempanel.appendChild(itemscontainer);

            items.forEach((n) => {
                var item = document.createElement("BUTTON");
                item.className = "timeitem item-" + name;
                item.id = name + n;
                item.dataset["val"] = "" + n;
                item.innerText = WinJSContrib.Utils.pad2(n);
                if (n == current) {
                    item.classList.add("selected");
                }
                WinJSContrib.UI.tap(item, callback);
                itemscontainer.appendChild(item);
            });

            if (this.parent.radial) {
                this.radialLayout(itemscontainer);
            }
            return itempanel;
        }

        radialLayout(itemcontainer: HTMLElement) {
            var radian, radius, outerRadius = 80, dialRadius = 130, tickRadius = 38;

            for (var i = 0; i < 12; i++) {
                var tick = <HTMLElement>itemcontainer.children[i];
                radian = i / 6 * Math.PI;
                radius = outerRadius;

                tick.style.left = (dialRadius + Math.sin(radian) * radius - tickRadius) + 'px';
                tick.style.top = (dialRadius - Math.cos(radian) * radius - tickRadius) + 'px';
            }
        }

        remove() {
            return WinJS.UI.Animation.drillInOutgoing(this.element).then(() => {
                this.element.classList.add("hidden");
            });
        }

        show() {
            this.element.classList.remove("hidden");
            return WinJS.UI.Animation.drillInIncoming(this.element);
        }

        ensureValue() {
        }
    }

    export class HoursPanel extends TimePanel {
        currentHours: HTMLElement;
        amButton: HTMLButtonElement;
        pmButton: HTMLButtonElement;
        isAm: boolean;

        constructor(parent: TimeClockControl) {
            super(parent);
            this.element.classList.add("hourspanel");
            this.header.innerHTML =
                `<button class="hoursel am">${this.parent.amLabel}</button>
                <button class="hoursel pm">${this.parent.pmLabel}</button>`;
            this.amButton = <HTMLButtonElement>this.header.querySelector(".hoursel.am");
            this.pmButton = <HTMLButtonElement>this.header.querySelector(".hoursel.pm");
            WinJSContrib.UI.tap(this.amButton, this.setAM.bind(this));
            WinJSContrib.UI.tap(this.pmButton, this.setPM.bind(this));

            this.init();
        }

        init() {
            var currentHour = this.parent.hour;
            if (currentHour == 0 || currentHour > 12) {
                var hourslist = this.parent.radial ? pmRadialHoursList : pmHoursList;
                this.pmButton.classList.add("selected");
                this.isAm = false;
            } else {
                var hourslist = this.parent.radial ? amRadialHoursList : amHoursList;
                this.amButton.classList.add("selected");
                this.isAm = true;
            }

            this.currentHours = this.renderItems(hourslist, "hour", currentHour, this.hourClicked.bind(this));
            this.content.appendChild(this.currentHours);
        }

        ensureValue() {
            var selecteditem = <HTMLElement>this.element.querySelector(".item-hour.selected");
            if (selecteditem) {
                var selectedhour = parseInt(selecteditem.dataset["val"], 10);
                if (selectedhour != this.parent.hour) {
                    selecteditem.classList.remove("selected");
                    this.currentHours.parentElement.removeChild(this.currentHours);
                    this.init();
                }
            }
        }

        setPM() {
            if (!this.isAm)
                return;

            var previous = this.currentHours;
            WinJS.UI.Animation.drillInOutgoing(previous).then(() => {
                previous.parentElement.removeChild(previous);
            });
            this.isAm = false;
            var hourslist = this.parent.radial ? pmRadialHoursList : pmHoursList;
            this.pmButton.classList.add("selected");
            this.amButton.classList.remove("selected");

            this.currentHours = this.renderItems(hourslist, "hour", this.parent.hour, this.hourClicked.bind(this));
            this.content.appendChild(this.currentHours);
            WinJS.UI.Animation.drillInIncoming(this.currentHours);
        }

        setAM() {
            if (this.isAm)
                return;

            var previous = this.currentHours;
            WinJS.UI.Animation.drillInOutgoing(previous).then(() => {
                previous.parentElement.removeChild(previous);
            });
            this.isAm = true;
            var hourslist = this.parent.radial ? amRadialHoursList : amHoursList;
            this.pmButton.classList.remove("selected");
            this.amButton.classList.add("selected");

            this.currentHours = this.renderItems(hourslist, "hour", this.parent.hour, this.hourClicked.bind(this));
            this.content.appendChild(this.currentHours);
            WinJS.UI.Animation.drillInIncoming(this.currentHours);
        }

        hourClicked(elt: HTMLElement) {
            var selecteditem = this.parent.element.querySelector(".item-hour.selected");
            if (selecteditem)
                selecteditem.classList.remove("selected");

            elt.classList.add("selected");
            this.parent.hour = parseInt(elt.dataset["val"], 10);
            this.parent.switchToMinutes();
        }
    }

    export class MinutesPanel extends TimePanel {
        constructor(parent: TimeClockControl) {
            super(parent);
            this.element.classList.add("minutespanel");
            var list = minutesList;
            if (this.parent.radial)
                list = radialMinutesList;

            var timeitems = this.renderItems(list, "min", this.parent.minutes, this.minuteClicked.bind(this));
            this.content.appendChild(timeitems);
        }

        minuteClicked(elt: HTMLElement) {
            var selecteditem = this.parent.element.querySelector(".item-min.selected");
            if (selecteditem)
                selecteditem.classList.remove("selected");

            elt.classList.add("selected");

            var val = parseInt(elt.dataset["val"], 10)
            this.parent.minutes = val;
        }
    }
}