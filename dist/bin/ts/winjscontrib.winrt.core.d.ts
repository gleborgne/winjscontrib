declare module WinJSContrib.WinRT {
    /**
     * read protocol arguments from application activation event arguments
     * @function WinJSContrib.WinRT.readProtocol
     * @param {Object} args WinJS application activation argument
     * @returns {Object} protocol arguments
     */
    function readProtocol(args: any): any;
    /**
     * Indicate if a valid internet connection is available, even with constrained access
     * @function WinJSContrib.WinRT.isConnected
     * @returns {boolean}
     */
    function isConnected(): boolean;
    /**
     * Indicate if a valid internet connection is available
     * @function WinJSContrib.WinRT.hasInternetAccess
     * @returns {boolean}
     */
    function hasInternetAccess(): boolean;
    /**
     * trigger callback when internet connection status is changing
     * @function WinJSContrib.WinRT.onInternetStatusChanged
     * @param {function} callback callback for internet status change notification
     * @returns {function} function to call for unregistering the callback
     */
    function onInternetStatusChanged(callback: any): () => void;
}
declare module WinJSContrib.Alerts {
    /**
     * show system alert box
     * @function WinJSContrib.Alerts.messageBox
     * @param {Object} opt message options
     * @returns {WinJS.Promise}
     */
    function messageBox(opt: any): WinJS.Promise<any>;
    /**
     * show system alert box
     * @function WinJSContrib.Alerts.message
     * @param {string} title title of the alert
     * @param {string} content text for the alert
     * @returns {WinJS.Promise}
     */
    function message(title: any, content: any): WinJS.Promise<any>;
    /**
     * show system alert box
     * @function WinJSContrib.Alerts.confirm
     * @param {string} title title of the alert
     * @param {string} content text for the alert
     * @param {string} yes text for yes
     * @param {string} no text for no
     * @returns {WinJS.Promise}
     */
    function confirm(title: any, content: any, yes: any, no: any): WinJS.Promise<any>;
    /**
     * show system toast notification
     * @function WinJSContrib.Alerts.toastNotification
     * @param {Object} data toast options
     */
    function toastNotification(data: any): void;
    /**
     * show system toast notification
     * @function WinJSContrib.Alerts.toast
     * @param {string} text text displayed in the toast
     * @param {string} picture path to a picture to display in the toast
     */
    function toast(text: any, picture?: any): void;
}
declare module WinJSContrib.Logs {
    class WinRTFileLogger implements WinJSContrib.Logs.Appenders.ILogAppender {
        readyPromise: WinJS.Promise<Windows.Storage.StorageFile>;
        maxBufferSize: number;
        maxFlushDelay: number;
        maxFileSize: number;
        buffer: string[];
        flushTimeout: any;
        file: Windows.Storage.StorageFile;
        constructor(file: Windows.Storage.StorageFile);
        static from(folder: Windows.Storage.StorageFolder, filename: string): WinRTFileLogger;
        clone(): WinRTFileLogger;
        format(logger: WinJSContrib.Logs.Logger, message: string, level: WinJSContrib.Logs.Levels): void;
        log(logger: WinJSContrib.Logs.Logger, message: string, level: WinJSContrib.Logs.Levels, ...args: any[]): void;
        flush(): void;
        group(title: string): void;
        groupCollapsed(title: string): void;
        groupEnd(): void;
    }
}
