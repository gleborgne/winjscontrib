module WinJSContrib.UI{
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
            this.element.appendChild(this.flyout.element);

            this.calendar = <CalendarControl>new WinJSContrib.UI.Calendar();
            this.flyout.element.appendChild(this.calendar.element);
            this.flyout.element.classList.add("mcn-datepicker-flyout");

            this.calendar.onchange = () => {                
                this.value = this.calendar.value;
            }

            this.textElement = document.createElement("DIV");
            this.textElement.className = "mcn-datepicker-text";
            this.element.appendChild(this.textElement);

            WinJSContrib.UI.tap(this.textElement, () => {
                this.flyout.show(this.textElement);
            });

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

	export interface CalendarOptions{
		startDayOfWeek?: number;
        minDate?: string | Date;
    }

	export class CalendarControl {
		_value: Date;
		_startDayOfWeek: number;
		public element: HTMLElement;
		public wrapper: HTMLElement;
		public panelsContainer: HTMLElement;
		public navbuttons: HTMLElement;
		public navbuttonPrevious: HTMLElement;
        public navbuttonNext: HTMLElement;
        public minDate: string | Date;
        public maxDate: string | Date;
        public onchange: () => void;
		_currentPanel: CalendarPanelControl;

		constructor(element: HTMLElement, options: CalendarOptions) {
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
            WinJSContrib.UI.tap(this.navbuttonPrevious, () => {
				if (this._currentPanel)
					this._currentPanel.previous();
            });
			
			this.navbuttonNext = document.createElement("BUTTON");
            this.navbuttonNext.className = "navbutton navbutton-next";
            this.navbuttons.appendChild(this.navbuttonNext);
			WinJSContrib.UI.tap(this.navbuttonNext, () => {
				if (this._currentPanel)
					this._currentPanel.next();
            });

            WinJS.UI.setOptions(this, options);

            this._currentPanel = new CalendarDayPanelControl(this, this.value);
            this._currentPanel.currentChanged = () => {
				this.checkState();
            }
		}

		get value() : Date{
			return this._value;
		}

		set value(val:Date) {
            this._value = val;
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

		render(){

		}

		checkState(){

        }

        dispatchEvent(type:string, data?:any) {

        }

        addEventListener(type: string, callback: any) {

        }
	}

	export class CalendarPanelControl {
		parent: CalendarControl;
		public element: HTMLElement;
		public currentChanged: () => void;
        public _currentDate: Date;		
		
        constructor(parent: CalendarControl, currentDate: Date){
			this.parent = parent;
			this.element = document.createElement('DIV');
			this.element.className = "calendar-panel";
            this.parent.panelsContainer.appendChild(this.element);
            this._currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
		}

		next(){

		}

		previous() {

		}

		allowNext() : boolean {
			return false;
		}

		allowPrevious() {
			return false;
        }

        ensureValue() {
        }
	}

	export class CalendarDayPanelControl extends CalendarPanelControl {
		public elementContent: HTMLElement;
		public _currentItem: CalendarDayPanelContentControl;				

		constructor(parent: CalendarControl, currentDate : Date) {
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

        ensureValue() {
            if (moment(this.currentDate).diff(this._currentItem.currentDate) != 0) {
                this.update((elt) => WinJS.UI.Animation.drillInIncoming(elt), (elt) => WinJS.UI.Animation.drillInOutgoing(elt));
            }
        }

		update(animIn?, animOut?){
            this._currentItem.currentDate = moment(this._currentDate);
            this._currentItem.generateDays(animIn, animOut);
            this.parent.checkState();
		}

		next() {
            this._currentDate = moment(this._currentDate).add(1, "M").toDate();
            this.update(
                (elt) => WinJSContrib.UI.Animation.slideFromBottom(elt, { duration: 160 }),
                (elt) => WinJSContrib.UI.Animation.slideToTop(elt, { duration: 160 }));
		}

		previous() {
            this._currentDate = moment(this._currentDate).add(-1, "M").toDate();
            this._currentItem.currentDate = moment(this._currentDate);
            this.update(
                (elt) => WinJSContrib.UI.Animation.slideFromTop(elt, { duration: 160 }),
                (elt) => WinJSContrib.UI.Animation.slideToBottom(elt, { duration: 160 }));
		}

		allowNext(): boolean {
			return true;
		}

		allowPrevious() {
			return true;
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
        _lastdow : number
        parent: CalendarDayPanelControl;

		constructor(parent: CalendarDayPanelControl, currentDate: Date) {
			this.parent = parent;
			this.currentDate = moment(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
			this.element = document.createElement('DIV');
            this.element.className = "calendar-panel-item day-panel-item";
            this.element.id = "month" + this.currentDate.toDate().toISOString();
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
				`<header>
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

        generateDays(animIn, animOut) {            
            if (this.days) {
                var currentDays = this.days;
                animOut(currentDays).then(() => {
                    currentDays.parentElement.removeChild(currentDays);
                });
            }
            this.selected = null;
            this.days = this.renderDaysWrapper(this.content);
            animIn(this.days).then(() => {
                this.monthTxt.innerText = this.currentDate.format("MMMM");
                this.yearTxt.innerText = this.currentDate.format("YYYY");
            });
        }        

        renderDaysWrapper(container: HTMLElement) {
            var itemsWrapper = document.createElement("DIV");
            itemsWrapper.className = "day-items-wrapper";
            this.renderDays(itemsWrapper);
            container.appendChild(itemsWrapper);
            return itemsWrapper;
        }

        renderDays(container: HTMLElement) {
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
                var day = <HTMLButtonElement>document.createElement("BUTTON");
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
                (<any>day).mcnCalendarDay = contentdate.clone();

                WinJSContrib.UI.tap(day, (arg) => {
                    var date = <moment.Moment>arg.mcnCalendarDay;
                    arg.classList.add("selected");
                    if (this.selected) {
                        this.selected.classList.remove("selected");
                    }
                    this.selected = arg;
                    this.parent.parent.value = date.toDate();
                    this.parent.parent.dispatchEvent("change");
                });

                contentdate.add(1, "d");
                container.appendChild(day);
            }
        }

        remove(anim): WinJS.Promise<any>{
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

	

    export var Calendar = WinJS.Class.mix(WinJS.Utilities.markSupportedForProcessing(CalendarControl), WinJS.Utilities.eventMixin, WinJS.Utilities.createEventProperties("change"));

	export var CalendarDayPanel = WinJS.Class.mix(CalendarDayPanelControl,
		WinJS.Utilities.eventMixin,
        WinJS.Utilities.createEventProperties("selected"));
}