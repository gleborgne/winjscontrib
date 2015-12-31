declare module WinJSContrib.UI {
    interface TimeClockOptions {
        startDayOfWeek: number;
    }
    class TimeClock {
        constructor(element: HTMLElement, options: TimeClockOptions);
    }
}
