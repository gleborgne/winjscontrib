declare module WinJSContrib.UI {
    class TimePickerControl {
        _value: string;
        element: HTMLElement;
        textElement: HTMLElement;
        flyout: WinJS.UI.Flyout;
        timeclock: TimeClockControl;
        constructor(element: HTMLElement, options: TimeClockOptions);
        value: string;
        valueAsDate: Date;
        dispose(): void;
        dispatchEvent(type: string, data?: any): void;
        addEventListener(type: string, callback: any): void;
    }
    var TimePicker: any;
    interface TimeClockOptions {
        deferRendering?: boolean;
        radial?: boolean;
        amLabel?: string;
        pmLabel?: string;
        value?: Date;
    }
    class TimeClockControl {
        _value: Date;
        radial: boolean;
        onchange: () => void;
        onhourchange: () => void;
        element: HTMLElement;
        flyout: WinJS.UI.Flyout;
        eventTracker: EventTracker;
        header: HTMLElement;
        content: HTMLElement;
        hoursElt: HTMLElement;
        minutesElt: HTMLElement;
        currentPanel: TimePanel;
        hoursPanel: HoursPanel;
        minutesPanel: MinutesPanel;
        amLabel: string;
        pmLabel: string;
        constructor(element: HTMLElement, options: TimeClockOptions);
        render(): void;
        onkeydown(arg: any): void;
        value: string;
        valueAsDate: Date;
        hour: number;
        minutes: number;
        conformMinutes(): void;
        updateDisplay(): void;
        toggleDisplay(): void;
        setFocus(): void;
        switchToHours(): void;
        switchToMinutes(): void;
        dispatchEvent(type: string, data?: any): void;
        addEventListener(type: string, callback: any): void;
        dispose(): void;
    }
    var TimeClock: any;
    class TimePanel {
        parent: TimeClockControl;
        element: HTMLElement;
        header: HTMLElement;
        content: HTMLElement;
        constructor(parent: TimeClockControl);
        renderItems(items: number[], name: string, current: number, callback: any, itemcallback?: (elt: HTMLElement, val: number) => void): HTMLElement;
        radialLayout(itemcontainer: HTMLElement): void;
        remove(): WinJS.IPromise<void>;
        show(): WinJS.Promise<any>;
        ensureValue(): void;
        setFocus(): void;
    }
    class HoursPanel extends TimePanel {
        currentHours: HTMLElement;
        amButton: HTMLButtonElement;
        pmButton: HTMLButtonElement;
        isAm: boolean;
        constructor(parent: TimeClockControl);
        init(): void;
        ensureValue(): void;
        toggleView(): void;
        setFocus(): void;
        setPM(): void;
        setAM(): void;
        hourClicked(arg: any): void;
    }
    class MinutesPanel extends TimePanel {
        constructor(parent: TimeClockControl);
        minuteClicked(arg: any): void;
        setFocus(): void;
    }
}
