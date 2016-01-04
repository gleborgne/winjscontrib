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
        element: HTMLElement;
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
        value: string;
        valueAsDate: Date;
        hour: number;
        minutes: number;
        conformMinutes(): void;
        updateDisplay(): void;
        switchToHours(): void;
        switchToMinutes(): void;
        dispatchEvent(type: string, data?: any): void;
        addEventListener(type: string, callback: any): void;
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
    }
    class HoursPanel extends TimePanel {
        currentHours: HTMLElement;
        amButton: HTMLButtonElement;
        pmButton: HTMLButtonElement;
        isAm: boolean;
        constructor(parent: TimeClockControl);
        init(): void;
        ensureValue(): void;
        setPM(): void;
        setAM(): void;
        hourClicked(elt: HTMLElement): void;
    }
    class MinutesPanel extends TimePanel {
        constructor(parent: TimeClockControl);
        minuteClicked(elt: HTMLElement): void;
    }
}
