declare module WinJSContrib.UI {
    class DatePickerControl {
        _value: Date;
        element: HTMLElement;
        textElement: HTMLElement;
        flyout: WinJS.UI.Flyout;
        calendar: CalendarControl;
        constructor(element: HTMLElement, options: CalendarOptions);
        value: Date;
        dispose(): void;
        dispatchEvent(type: string, data?: any): void;
        addEventListener(type: string, callback: any): void;
    }
    var DatePicker: any;
    interface CalendarOptions {
        startDayOfWeek?: number;
        mindate?: string | Date;
        maxdate?: string | Date;
        value?: string | Date;
        deferRendering?: boolean;
        allowDateCallback?: (date: Date) => boolean;
    }
    class CalendarControl {
        _value: Date;
        _ready: boolean;
        _startDayOfWeek: number;
        flyout: WinJS.UI.Flyout;
        element: HTMLElement;
        wrapper: HTMLElement;
        panelsContainer: HTMLElement;
        navbuttons: HTMLElement;
        navbuttonPrevious: HTMLButtonElement;
        navbuttonNext: HTMLButtonElement;
        mindate: string | Date;
        maxdate: string | Date;
        allowDateCallback: (date: Date) => boolean;
        onchange: () => void;
        eventTracker: EventTracker;
        _daysPanel: CalendarDayPanelControl;
        _monthsPanel: CalendarMonthPanelControl;
        _currentPanel: CalendarPanelControl;
        constructor(element: HTMLElement, options: CalendarOptions);
        value: Date;
        startDayOfWeek: number;
        focusSelected(): void;
        getFocusedDay(): moment.Moment;
        onkeydown(arg: any): void;
        render(): void;
        checkState(): void;
        dispatchEvent(type: string, data?: any): void;
        addEventListener(type: string, callback: any): void;
        switchToMonth(): void;
        switchToDays(): void;
        dispose(): void;
    }
    var Calendar: any;
    class CalendarPanelControl {
        parent: CalendarControl;
        element: HTMLElement;
        currentChanged: () => void;
        _currentDate: Date;
        constructor(parent: CalendarControl, currentDate: Date);
        next(focusItem?: boolean): void;
        previous(focusItem?: boolean): void;
        allowNext(): boolean;
        allowPrevious(): boolean;
        ensureValue(immediate?: boolean, focusItem?: boolean): void;
        hide(): WinJS.IPromise<void>;
        show(): WinJS.Promise<any>;
        setNavButtonsLabels(): void;
    }
    class CalendarDayPanelControl extends CalendarPanelControl {
        elementContent: HTMLElement;
        _currentItem: CalendarDayPanelContentControl;
        constructor(parent: CalendarControl, currentDate: Date);
        currentDate: Date;
        setNavButtonsLabels(): void;
        ensureValue(immediate?: boolean, focusItem?: boolean): void;
        update(focusItem: boolean, animIn?: any, animOut?: any, immediate?: boolean): void;
        next(focusItem?: boolean): void;
        previous(focusItem?: boolean): void;
        allowNext(): boolean;
        allowPrevious(): boolean;
    }
    class CalendarDayPanelContentControl {
        element: HTMLElement;
        days: HTMLElement;
        selected: HTMLElement;
        header: HTMLElement;
        content: HTMLElement;
        monthTxt: HTMLElement;
        yearTxt: HTMLElement;
        currentDate: moment.Moment;
        _lastdow: number;
        parent: CalendarDayPanelControl;
        constructor(parent: CalendarDayPanelControl, currentDate: Date);
        enter(anim: any): any;
        renderContent(): void;
        destroyPanel(dayspanel: any): void;
        generateDays(focusItem: boolean, animIn: any, animOut: any, immediate?: boolean): void;
        renderDaysWrapper(container: HTMLElement): HTMLElement;
        renderDays(container: HTMLElement): void;
        remove(anim: any): WinJS.Promise<any>;
    }
    class CalendarMonthPanelControl extends CalendarPanelControl {
        content: HTMLElement;
        yearTxt: HTMLElement;
        monthesPanel: HTMLElement;
        renderedDate: Date;
        constructor(parent: CalendarControl, currentDate: Date);
        setNavButtonsLabels(): void;
        next(focusItem?: boolean): void;
        previous(focusItem?: boolean): void;
        allowNext(): boolean;
        allowPrevious(): boolean;
        ensureValue(immediate?: boolean, focusItem?: boolean): void;
        update(focusItem: boolean, animIn: any, animOut: any, immediate?: boolean): void;
        renderContent(): void;
        renderMonthPanel(container: HTMLElement): HTMLElement;
    }
}
