declare var __global: any;
declare module WinJSContrib {
    class MessengerClass {
        /**
         * default path for smart worker js file
         */
        static SmartWorkerPath: string;
        isWorker: boolean;
        _pendings: any;
        _receiver: any;
        _sender: any;
        _bindedProcessEvent: any;
        messengerId: string;
        domain: string;
        dispatchEvent: (eventname: string, obj?: any) => void;
        addEventListener: (eventname: string, callback: Function) => void;
        constructor(receiver: any, sender: any);
        private _send(obj);
        /**
         * import script files
         * @param {Array} scriptPaths an array of string paths to js files
         */
        importScripts(scriptPaths: string[]): any;
        private _doImportScripts(scriptPaths);
        /**
         * run the callback in the web worker. The callback is serialized to string so you must pass all variable used inside the function as arguments
         * @param {function} func function callback
         * @param {...Object} args
         * @returns {WinJS.Promise}
         */
        execute(func: any): any;
        private _runFunction(functionArgs);
        map(object: any, functions: any): void;
        /**
         * start an operation within iframe or worker and get a promise for completion
         * @param {string} eventName name of the event/function to call
         * @param {Object} data event/function passed as argument
         * @returns {WinJS.Promise}
         */
        start(eventName: any, data?: any, asArgs?: any): any;
        private _processEvent(arg);
        /**
         * release messenger and associated resources (if using webworker, worker is terminated
         */
        dispose(): void;
    }
    /**
     * @classdesc
     * Wrapper for messaging between main code and iframe or web worker. All returns are wrapped as WinJS.Promise to enable asynchronous scenarios
     * @class
     * @param {DOMElement} receiver element that will receive messages
     * @param {DOMElement} sender element that will send messages
     */
    var Messenger: typeof MessengerClass;
    /**
     * @classdesc
     * Wrapper for {@link WinJSContrib.Messenger} when using it with a webworker
     * @class
     * @param {string} [path] path to web worker file
     */
    var SmartWorker: (path: any) => MessengerClass;
}
