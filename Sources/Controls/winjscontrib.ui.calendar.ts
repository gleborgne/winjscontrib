module WinJSContrib.UI {
    export class DatePickerControl {
        _value: Date;
        public element: HTMLElement;
        public textElement: HTMLElement;
        public flyout: WinJS.UI.Flyout;
        public calendar: CalendarControl;

        constructor(element: HTMLElement, options: CalendarOptions) {
            this.element = element || document.createElement('DIV');
            options = options || {};
            this.element.winControl = this;
            this.element.classList.add('mcn-datepicker');
            this.element.classList.add('win-disposable');

            this.flyout = new WinJS.UI.Flyout();
            this.flyout.element.classList.add("mcn-datepicker-flyout");
            this.element.appendChild(this.flyout.element);
            this.flyout.onbeforeshow = () => {
                setImmediate(() => {
                    this.calendar.focusSelected();
                });
            }

            if (!options.hasOwnProperty("deferRendering")) {
                options.deferRendering = true;
            }

            var elt = document.createElement("DIV");
            this.flyout.element.appendChild(elt);
            var calendaroptions = JSON.parse(JSON.stringify(options));
            calendaroptions.flyout = this.flyout;
            this.calendar = <CalendarControl>new WinJSContrib.UI.Calendar(elt, calendaroptions);

            this.calendar.onchange = () => {
                this.value = this.calendar.value;
                this.dispatchEvent("change");
            }

            this.textElement = document.createElement("DIV");
            this.textElement.className = "mcn-datepicker-text tap";
            this.element.appendChild(this.textElement);

            this.textElement.tabIndex = 0;
            this.textElement.setAttribute("role", "button");

            this.textElement.onclick = (arg) => {
                arg.preventDefault();
                arg.stopPropagation();
                if (window.innerWidth < 500)
                    this.flyout.show(document.body, 'top', 'left');
                else this.flyout.show(this.textElement);
            };

            WinJS.UI.setOptions(this, options);

            if (!this.value) {
                this.value = new Date();
            }
        }

        get value(): Date {
            return this._value;
        }

        set value(val: Date) {
            this._value = val;
            this.calendar.value = val;
            this.textElement.innerText = moment(val).format("ll");
            this.flyout.hide();
        }

        dispose() {
            WinJS.Utilities.disposeSubTree(this.element);
        }

        dispatchEvent(type: string, data?: any) {

        }

        addEventListener(type: string, callback: any) {

        }
    }
    export var DatePicker = WinJS.Class.mix(WinJS.Utilities.markSupportedForProcessing(DatePickerControl), WinJS.Utilities.eventMixin, WinJS.Utilities.createEventProperties("change"));

    export interface CalendarOptions {
        startDayOfWeek?: number;
        mindate?: string | Date;
        maxdate?: string | Date;
        value?: string | Date;
        deferRendering?: boolean
        allowDateCallback?: (date: Date) => boolean;
    }

    export class CalendarControl {
        _value: Date;
        _ready: boolean;
        _startDayOfWeek: number;
        public flyout: WinJS.UI.Flyout;
        public element: HTMLElement;
        public wrapper: HTMLElement;
        public panelsContainer: HTMLElement;
        public navbuttons: HTMLElement;
        public navbuttonPrevious: HTMLButtonElement;
        public navbuttonNext: HTMLButtonElement;
        public mindate: string | Date;
        public maxdate: string | Date;
        public allowDateCallback: (date: Date) => boolean;
        public onchange: () => void;
        eventTracker: EventTracker;
        _daysPanel: CalendarDayPanelControl;
        _monthsPanel: CalendarMonthPanelControl;
        _currentPanel: CalendarPanelControl;

        constructor(element: HTMLElement, options: CalendarOptions) {
            this.element = element || document.createElement('DIV');
            options = options || {};
            this._startDayOfWeek = 1; //monday
            this.eventTracker = new WinJSContrib.UI.EventTracker();
            this.element.winControl = this;
            this.element.classList.add('mcn-calendar');
            this.element.classList.add('win-disposable');

            WinJS.UI.setOptions(this, options);

            if (this.flyout) {
                this.element.classList.add('win-xyfocus-suspended');
                this.eventTracker.addEvent(this.element, "keydown", this.onkeydown.bind(this), true);
            }

            this._ready = false;
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
                else {
                    setTimeout(() => {
                        WinJS.Utilities.Scheduler.schedule(() => {
                            this.render();
                        }, WinJS.Utilities.Scheduler.Priority.idle);
                    }, 2000);
                }

            }
        }

        get value(): Date {
            return this._value;
        }

        set value(val: Date) {
            if (typeof val == "string")
                val = moment(val).toDate();
            this._value = val; //moment(val).hour(0).minute(0).second(0).millisecond(0).toDate();
            if (this._currentPanel) {
                this._currentPanel._currentDate = new Date(val.getFullYear(), val.getMonth(), 1);
                this._currentPanel.ensureValue();
            }
        }

        get startDayOfWeek(): number {
            return this._startDayOfWeek;
        }

        set startDayOfWeek(val: number) {
            this._startDayOfWeek = val;
        }

        focusSelected() {
            var selected = <HTMLElement>this.element.querySelector(".day-item.selected");
            if (selected)
                selected.focus();
        }

        getFocusedDay(): moment.Moment {
            var focused = <HTMLElement>this.element.querySelector("*:focus");
            if (focused.classList.contains("day-item")) {
                var date = <moment.Moment>(<any>focused).mcnCalendarDay;
                return date;
            }
        }

        onkeydown(arg) {
            if (arg.key == "PageDown") {
                this._currentPanel.next(true);
                arg.preventDefault();
                arg.stopPropagation();
            }
            else if (arg.key == "PageUp") {
                this._currentPanel.previous(true);
                arg.preventDefault();
                arg.stopPropagation();
            }
            else if (arg.key == "Down") {
                var nextelt = WinJS.UI.XYFocus.findNextFocusElement("down", { focusRoot: this.element });
                if (nextelt) {
                    nextelt.focus();
                } else {
                    this._currentPanel.next(true);
                }
                arg.preventDefault();
                arg.stopPropagation();
            }
            else if (arg.key == "Up") {
                var nextelt = WinJS.UI.XYFocus.findNextFocusElement("up", { focusRoot: this.element });
                if (nextelt) {
                    nextelt.focus();
                } else {
                    this._currentPanel.previous(true);
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
        }

        render() {
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

            this.navbuttonPrevious = <HTMLButtonElement>document.createElement("BUTTON");
            this.navbuttonPrevious.className = "navbutton navbutton-previous";
            this.navbuttons.appendChild(this.navbuttonPrevious);
            WinJSContrib.UI.tap(this.navbuttonPrevious, () => {
                if (this._currentPanel)
                    this._currentPanel.previous();
            });

            this.navbuttonNext = <HTMLButtonElement>document.createElement("BUTTON");
            this.navbuttonNext.className = "navbutton navbutton-next";
            this.navbuttons.appendChild(this.navbuttonNext);
            WinJSContrib.UI.tap(this.navbuttonNext, () => {
                if (this._currentPanel)
                    this._currentPanel.next();
            });


            var dateToRender = this.value;
            if (!dateToRender) {
                if (this.mindate) {
                    dateToRender = moment(this.mindate).toDate();
                } else {
                    dateToRender = new Date();
                }
            }
            this._daysPanel = new CalendarDayPanelControl(this, dateToRender);
            this._currentPanel = this._daysPanel;
            this._currentPanel.currentChanged = () => {
                this.checkState();
            }
            this.checkState();

            this.element.onmousewheel = (arg) => {
                arg.preventDefault();
                arg.stopPropagation();
                if (arg.wheelDelta < 0) {
                    if (this._currentPanel.allowNext())
                        this._currentPanel.next();
                } else {
                    if (this._currentPanel.allowPrevious())
                        this._currentPanel.previous();
                }
            }

            this._currentPanel.setNavButtonsLabels();
        }

        checkState() {
            if (this._currentPanel.allowNext()) {
                this.navbuttonNext.disabled = false;
            } else {
                this.navbuttonNext.disabled = true;
            }

            if (this._currentPanel.allowPrevious()) {
                this.navbuttonPrevious.disabled = false;
            } else {
                this.navbuttonPrevious.disabled = true;
            }
        }

        dispatchEvent(type: string, data?: any) {
        }

        addEventListener(type: string, callback: any) {
        }

        switchToMonth() {
            if (this._currentPanel != this._monthsPanel) {
                this._currentPanel.hide();
            }

            if (!this._monthsPanel) {
                this._monthsPanel = new CalendarMonthPanelControl(this, this._currentPanel._currentDate);
            } else {
                this._monthsPanel._currentDate = this._currentPanel._currentDate;
                this._monthsPanel.ensureValue(true);
            }

            this._monthsPanel.show();
            this._currentPanel = this._monthsPanel;
            this.checkState();

            this._currentPanel.setNavButtonsLabels();
        }

        switchToDays() {
            if (this._currentPanel != this._daysPanel) {
                this._currentPanel.hide();
            }

            this._daysPanel._currentDate = this._currentPanel._currentDate;
            this._daysPanel.ensureValue(true);

            this._daysPanel.show();
            this._currentPanel = this._daysPanel;
            this.checkState();
            this._currentPanel.setNavButtonsLabels();
        }

        dispose() {
            this.eventTracker.dispose();
            WinJS.Utilities.disposeSubTree(this.element);
        }
        //switchToYears() {
        //}
    }
    export var Calendar = WinJS.Class.mix(WinJS.Utilities.markSupportedForProcessing(CalendarControl), WinJS.Utilities.eventMixin, WinJS.Utilities.createEventProperties("change"));

    export class CalendarPanelControl {
        parent: CalendarControl;
        public element: HTMLElement;
        public currentChanged: () => void;
        public _currentDate: Date;

        constructor(parent: CalendarControl, currentDate: Date) {
            this.parent = parent;
            this.element = document.createElement('DIV');
            this.element.className = "calendar-panel";
            this.element.tabIndex = -1;
            this.parent.panelsContainer.appendChild(this.element);
            this._currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        }

        next(focusItem?: boolean) {

        }

        previous(focusItem?: boolean) {

        }

        allowNext(): boolean {
            return false;
        }

        allowPrevious() {
            return false;
        }

        ensureValue(immediate?: boolean, focusItem?: boolean) {
        }

        hide() {
            return WinJS.UI.Animation.drillInOutgoing(this.element).then(() => {
                this.element.classList.add("disabled");
            });
        }

        show() {
            this.element.classList.remove("disabled");
            return WinJS.UI.Animation.drillInIncoming(this.element);
        }

        setNavButtonsLabels() {
        }
    }

    export class CalendarDayPanelControl extends CalendarPanelControl {
        public elementContent: HTMLElement;
        public _currentItem: CalendarDayPanelContentControl;

        constructor(parent: CalendarControl, currentDate: Date) {
            super(parent, currentDate);

            this.element.classList.add("day-panel");
            this.elementContent = document.createElement('DIV');
            this.elementContent.className = "calendar-panel-content";
            this.element.appendChild(this.elementContent);

            this._currentItem = new CalendarDayPanelContentControl(this, this.currentDate);
        }

        get currentDate(): Date {
            return this._currentDate;
        }

        setNavButtonsLabels() {
            var arianext = WinJS.Resources.getString("mcncalendar.nextmonth.arialabel");
            var ariaprevious = WinJS.Resources.getString("mcncalendar.previousmonth.arialabel");
            if (!arianext.empty && !ariaprevious.empty) {
                this.parent.navbuttonNext.setAttribute("aria-label", arianext.value);
                this.parent.navbuttonPrevious.setAttribute("aria-label", ariaprevious.value);
            }
        }

        ensureValue(immediate?: boolean, focusItem?: boolean) {
            if (moment(this.currentDate).diff(this._currentItem.currentDate) != 0) {
                this.update(focusItem, (elt) => WinJS.UI.Animation.drillInIncoming(elt), (elt) => WinJS.UI.Animation.drillInOutgoing(elt), immediate);
            } else {
                $('.selected', this.element).removeClass('selected');
                var selectedid = "day-" + moment(this.parent.value).format("YYYY-MM-DD");
                $('#' + selectedid, this.element).addClass('selected');
            }
        }

        update(focusItem: boolean, animIn?, animOut?, immediate?: boolean) {
            this._currentItem.currentDate = moment(this._currentDate);
            this._currentItem.generateDays(focusItem, animIn, animOut, immediate);
            this.parent.checkState();
        }

        next(focusItem?: boolean) {
            if (!this.allowNext())
                return;
            this._currentDate = moment(this._currentDate).add(1, "M").toDate();
            this.update(focusItem,
                (elt) => WinJSContrib.UI.Animation.slideFromBottom(elt, { duration: 160 }),
                (elt) => WinJSContrib.UI.Animation.slideToTop(elt, { duration: 160 }));
        }

        previous(focusItem?: boolean) {
            if (!this.allowPrevious())
                return;
            this._currentDate = moment(this._currentDate).add(-1, "M").toDate();
            this._currentItem.currentDate = moment(this._currentDate);
            this.update(focusItem,
                (elt) => WinJSContrib.UI.Animation.slideFromTop(elt, { duration: 160 }),
                (elt) => WinJSContrib.UI.Animation.slideToBottom(elt, { duration: 160 }));
        }

        allowNext(): boolean {
            if (!this.parent.maxdate)
                return true;

            var lastDay = moment(this._currentDate).add(1, "M").add(-1, "d").toDate();
            if (lastDay < moment(this.parent.maxdate).toDate())
                return true;

            return false;
        }

        allowPrevious() {
            if (!this.parent.mindate)
                return true;

            if (this._currentDate > moment(this.parent.mindate).toDate())
                return true;

            return false;
        }
    }

    export class CalendarDayPanelContentControl {
        public element: HTMLElement;
        public days: HTMLElement;
        public selected: HTMLElement;
        public header: HTMLElement;
        public content: HTMLElement;
        public monthTxt: HTMLElement;
        public yearTxt: HTMLElement;
        public currentDate: moment.Moment;
        _lastdow: number
        parent: CalendarDayPanelControl;

        constructor(parent: CalendarDayPanelControl, currentDate: Date) {
            this.parent = parent;
            this.currentDate = moment(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
            this.element = document.createElement('DIV');
            this.element.className = "calendar-panel-item day-panel-item";
            this.element.id = "month" + (this.currentDate.toDate().toISOString());
            this.parent.elementContent.appendChild(this.element);
            this.renderContent();
        }

        enter(anim) {
            anim = anim || WinJS.UI.Animation.drillOutIncoming;
            return anim(this.element);
        }

        renderContent() {
            var startdate = this.currentDate.clone().day(this.parent.parent.startDayOfWeek);
            this.element.innerHTML =
                `<header role="button" tabIndex="0" data-win-focus='{ bottom: ".dayitem.tap" }'>
					<div class="month">${this.currentDate.format("MMMM")}</div>
					<div class="year">${this.currentDate.format("YYYY")}</div>
				</header>
				<section class="day-items">
					<header>
					</header>
					<section>
					</section>
				</section>`;
            this.monthTxt = <HTMLElement>this.element.querySelector(".month");
            this.yearTxt = <HTMLElement>this.element.querySelector(".year");

            var panelheader = <HTMLElement>this.element.querySelector("header");
            var arialabel = WinJS.Resources.getString("mcncalendar.daystitle.arialabel");
            if (!arialabel.empty) {
                panelheader.setAttribute("aria-label", arialabel.value);
            }
            WinJSContrib.UI.tap(panelheader, () => {
                this.parent.parent.switchToMonth();
            });

            this.header = <HTMLElement>this.element.querySelector(".day-items > header");
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

            this.content = <HTMLElement>this.element.querySelector(".day-items > section");
            this.days = this.renderDaysWrapper(this.content);
        }

        destroyPanel(dayspanel) {
            WinJS.Utilities.disposeSubTree(dayspanel);
            dayspanel.winControl.dispose();
            dayspanel.parentElement.removeChild(dayspanel);
        }

        generateDays(focusItem: boolean, animIn, animOut, immediate?: boolean) {
            if (this.days) {
                var currentDays = this.days;
                if (immediate) {
                    this.destroyPanel(currentDays);
                } else {
                    animOut(currentDays).then(() => {
                        this.destroyPanel(currentDays);
                    });
                }
            }
            this.selected = null;
            this.days = this.renderDaysWrapper(this.content);
            var handleFocus = () => {
                if (focusItem) {
                    var selected = <HTMLElement>this.content.querySelector(".day-item.selected:not(:disabled)");
                    if (!selected)
                        selected = <HTMLElement>this.content.querySelector(".day-item.thismonth:not(:disabled)");

                    if (selected)
                        selected.focus();
                }
            }

            if (immediate) {
                this.monthTxt.innerText = this.currentDate.format("MMMM");
                this.yearTxt.innerText = this.currentDate.format("YYYY");
                handleFocus();
            } else {
                animIn(this.days).then(() => {
                    this.monthTxt.innerText = this.currentDate.format("MMMM");
                    this.yearTxt.innerText = this.currentDate.format("YYYY");
                    handleFocus();
                });
            }
        }

        renderDaysWrapper(container: HTMLElement) {
            var itemsWrapper = document.createElement("DIV");
            itemsWrapper.className = "day-items-wrapper";
            var swipe = new (<any>WinJSContrib.UI).SwipeSlide(itemsWrapper, { direction: "vertical", allowed: { top: this.parent.allowNext(), bottom: this.parent.allowPrevious() } });
            swipe.onswipe = (arg) => {
                swipe.swipeHandled = true;
                if (arg.direction == "top") {
                    this.parent.next(true);
                } else if (arg.direction == "bottom") {
                    this.parent.previous(true);
                }
            }
            this.renderDays(itemsWrapper);
            container.appendChild(itemsWrapper);
            return itemsWrapper;
        }

        renderDays(container: HTMLElement) {
            var startdate = this.currentDate.clone().day(this.parent.parent.startDayOfWeek);

            var currentMonth = this.currentDate.month();
            var currentvalue = this.parent.parent.value;
            var currentValueDate = moment(currentvalue).hour(0).minute(0).second(0).millisecond(0);
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
                var day = <HTMLButtonElement>document.createElement("BUTTON");
                day.className = "day-item tap";
                day.id = "day-" + contentdate.format("YYYY-MM-DD");
                day.innerText = contentdate.format("DD");
                day.setAttribute("aria-label", contentdate.format("L"));

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
                } else {
                    day.classList.add("thismonth");
                }
                if (minDate && contentdate < minDate)
                    day.disabled = true;
                if (maxDate && contentdate > maxDate)
                    day.disabled = true;

                (<any>day).mcnCalendarDay = contentdate.clone();

                day.onclick = (arg) => {
                    var date = <moment.Moment>(<any>arg.target).mcnCalendarDay;
                    (<HTMLElement>arg.target).classList.add("selected");
                    if (this.selected) {
                        this.selected.classList.remove("selected");
                    }
                    this.selected = <HTMLElement>arg.target;
                    this.parent.parent.value = date.toDate();
                    this.parent.parent.dispatchEvent("change");
                };

                contentdate.add(1, "d");
                container.appendChild(day);
            }
        }

        remove(anim): WinJS.Promise<any> {
            anim = anim || WinJS.UI.Animation.drillOutOutgoing;
            if (!this.element)
                return WinJS.Promise.wrap();

            return anim(this.element).then(() => {
                WinJSContrib.UI.untapAll(this.element);
                this.element.parentElement.removeChild(this.element);
                this.element = null;
            });
        }
    }

    export class CalendarMonthPanelControl extends CalendarPanelControl {
        public content: HTMLElement;
        public yearTxt: HTMLElement;
        public monthesPanel: HTMLElement;
        renderedDate: Date;

        constructor(parent: CalendarControl, currentDate: Date) {
            super(parent, currentDate);
            this.element.classList.add("month-panel");
            this.renderContent();
        }

        setNavButtonsLabels() {
            var arianext = WinJS.Resources.getString("mcncalendar.nextyear.arialabel");
            var ariaprevious = WinJS.Resources.getString("mcncalendar.previousyear.arialabel");
            if (!arianext.empty && !ariaprevious.empty) {
                this.parent.navbuttonNext.setAttribute("aria-label", arianext.value);
                this.parent.navbuttonPrevious.setAttribute("aria-label", ariaprevious.value);
            }
        }

        next(focusItem?: boolean) {
            if (!this.allowNext())
                return;
            this._currentDate = moment(this._currentDate).add(1, "Y").toDate();
            this.update(focusItem,
                (elt) => WinJSContrib.UI.Animation.slideFromBottom(elt, { duration: 160 }),
                (elt) => WinJSContrib.UI.Animation.slideToTop(elt, { duration: 160 }));
        }

        previous(focusItem?: boolean) {
            if (!this.allowPrevious())
                return;
            this._currentDate = moment(this._currentDate).add(-1, "Y").toDate();
            this.update(focusItem,
                (elt) => WinJSContrib.UI.Animation.slideFromTop(elt, { duration: 160 }),
                (elt) => WinJSContrib.UI.Animation.slideToBottom(elt, { duration: 160 }));
        }

        allowNext(): boolean {
            var lastday = new Date(this._currentDate.getFullYear(), 11, 31);

            if (!this.parent.maxdate)
                return true;

            if (lastday < moment(this.parent.maxdate).toDate())
                return true;

            return false;
        }

        allowPrevious() {
            var firstday = new Date(this._currentDate.getFullYear(), 0, 1);

            if (!this.parent.mindate)
                return true;

            if (firstday > moment(this.parent.mindate).month(0).date(1).toDate())
                return true;

            return false;
        }

        ensureValue(immediate?: boolean, focusItem?: boolean) {
            if (moment(this._currentDate).diff(moment(this.renderedDate)) != 0) {
                this.update(focusItem, (elt) => WinJS.UI.Animation.drillInIncoming(elt), (elt) => WinJS.UI.Animation.drillInOutgoing(elt), immediate);
            }
        }

        update(focusItem: boolean, animIn, animOut, immediate?: boolean) {
            var previouspanel = this.monthesPanel;
            if (immediate) {
                previouspanel.parentElement.removeChild(previouspanel);
            } else {
                animOut(this.monthesPanel).then(() => {
                    previouspanel.parentElement.removeChild(previouspanel);
                });
            }

            this.monthesPanel = this.renderMonthPanel(this.content);

            var handleFocus = () => {
                if (focusItem) {
                    var selected = <HTMLElement>this.content.querySelector(".month-item.selected:not(:disabled)");
                    if (!selected)
                        selected = <HTMLElement>this.content.querySelector(".month-item:not(:disabled)");

                    if (selected)
                        selected.focus();
                }
            }
            if (immediate) {
                this.yearTxt.innerText = "" + this._currentDate.getFullYear();
                handleFocus();
            } else {
                animIn(this.monthesPanel).then(() => {
                    this.yearTxt.innerText = "" + this._currentDate.getFullYear();
                    handleFocus();
                });
            }
            this.parent.checkState();
        }

        renderContent() {
            this.element.innerHTML =
                `<header>
					<div class="year">${this._currentDate.getFullYear()}</div>
				</header>
				<section class="month-items">
					
				</section>`;

            this.yearTxt = <HTMLElement>this.element.querySelector(".year");
            this.content = <HTMLElement>this.element.querySelector(".month-items");
            this.monthesPanel = this.renderMonthPanel(this.content);
        }

        renderMonthPanel(container: HTMLElement) {
            var panel = document.createElement("DIV");
            panel.className = "month-itemspanel";
            var swipe = new (<any>WinJSContrib.UI).SwipeSlide(panel, { direction: "vertical", allowed: { top: this.allowNext(), bottom: this.allowPrevious() } });
            swipe.onswipe = (arg) => {
                swipe.swipeHandled = true;
                if (arg.direction == "top") {
                    this.next();
                } else if (arg.direction == "bottom") {
                    this.previous();
                }
            }

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
                var month = <HTMLButtonElement>document.createElement("BUTTON");
                month.className = "month-item tap";
                var currentMonthDate = start.clone();
                (<any>month).mcnMonthDate = currentMonthDate;
                month.innerText = currentMonthDate.format("MMM");
                month.setAttribute("aria-label", currentMonthDate.format("MMMM YYYY"));

                if (currentMonthDate.diff(thismonth) == 0) {
                    month.classList.add("today");
                } else if (start < now) {
                    month.classList.add("pastmonth");
                }

                if (minDate && start < minDate)
                    month.disabled = true;
                if (maxDate && start > maxDate)
                    month.disabled = true;

                month.onclick = (arg) => {
                    var elt = <any>arg.target;
                    var date = <moment.Moment>elt.mcnMonthDate;
                    this._currentDate = date.toDate();
                    this.parent.switchToDays();
                };

                panel.appendChild(month);
                start.add(1, "M");
            }
            container.appendChild(panel);
            this.renderedDate = this._currentDate;

            return panel;
        }
    }

    
    //export var CalendarDayPanel = WinJS.Class.mix(CalendarDayPanelControl,
    //	WinJS.Utilities.eventMixin,
    //       WinJS.Utilities.createEventProperties("selected"));
}