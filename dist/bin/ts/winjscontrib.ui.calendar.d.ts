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
        minDate?: string | Date;
    }
    class CalendarControl {
        _value: Date;
        _startDayOfWeek: number;
        element: HTMLElement;
        wrapper: HTMLElement;
        panelsContainer: HTMLElement;
        navbuttons: HTMLElement;
        navbuttonPrevious: HTMLElement;
        navbuttonNext: HTMLElement;
        minDate: string | Date;
        maxDate: string | Date;
        onchange: () => void;
        _currentPanel: CalendarPanelControl;
        constructor(element: HTMLElement, options: CalendarOptions);
        value: Date;
        startDayOfWeek: number;
        render(): void;
        checkState(): void;
        dispatchEvent(type: string, data?: any): void;
        addEventListener(type: string, callback: any): void;
    }
    class CalendarPanelControl {
        parent: CalendarControl;
        element: HTMLElement;
        currentChanged: () => void;
        _currentDate: Date;
        constructor(parent: CalendarControl, currentDate: Date);
        next(): void;
        previous(): void;
        allowNext(): boolean;
        allowPrevious(): boolean;
        ensureValue(): void;
    }
    class CalendarDayPanelControl extends CalendarPanelControl {
        elementContent: HTMLElement;
        _currentItem: CalendarDayPanelContentControl;
        constructor(parent: CalendarControl, currentDate: Date);
        currentDate: Date;
        ensureValue(): void;
        update(animIn?: any, animOut?: any): void;
        next(): void;
        previous(): void;
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
        generateDays(animIn: any, animOut: any): void;
        renderDaysWrapper(container: HTMLElement): HTMLElement;
        renderDays(container: HTMLElement): void;
        remove(anim: any): WinJS.Promise<any>;
    }
    var Calendar: any;
    var CalendarDayPanel: any;
}
