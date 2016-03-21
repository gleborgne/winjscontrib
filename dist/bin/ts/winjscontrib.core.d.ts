declare module WinJSContrib.Logs.Appenders {
    interface ILogAppender {
        clone(): any;
        format(logger: Logs.Logger, message: string, level: Logs.Levels): any;
        log(logger: Logs.Logger, message: string, level: Logs.Levels): any;
        group(title: string): any;
        groupCollapsed(title: string): any;
        groupEnd(): any;
    }
    class ConsoleAppender implements ILogAppender {
        config: Logs.ILoggerConfig;
        /**
         * Appender writing to console
         * @class WinJSContrib.Logs.Appenders.ConsoleAppender
         */
        constructor(config?: Logs.ILoggerConfig);
        /**
         * clone appender
         * @function WinJSContrib.Logs.Appenders.ConsoleAppender.prototype.clone
         */
        clone(): ConsoleAppender;
        /**
         * log item
         * @function WinJSContrib.Logs.Appenders.ConsoleAppender.prototype.log
         * @param {string} message log message
         * @param {WinJSContrib.Logs.Levels} log level
         */
        log(logger: Logs.Logger, message: string, level: Logs.Levels, ...args: any[]): any;
        /**
         * create log group
         * @function WinJSContrib.Logs.Appenders.ConsoleAppender.prototype.group
         */
        group(title: string): void;
        /**
         * create collapsed log group
         * @function WinJSContrib.Logs.Appenders.ConsoleAppender.prototype.groupCollapsed
         */
        groupCollapsed(title: string): void;
        /**
         * close log group
         * @function WinJSContrib.Logs.Appenders.ConsoleAppender.prototype.groupEnd
         */
        groupEnd(): void;
        format(logger: Logger, message: string, level: Logs.Levels): string;
    }
    class BufferAppender implements ILogAppender {
        config: Logs.ILoggerConfig;
        buffer: any[];
        /**
         * Appender writing to console
         * @class WinJSContrib.Logs.Appenders.BufferAppender
         */
        constructor(config?: Logs.ILoggerConfig);
        /**
         * clone appender
         * @function WinJSContrib.Logs.Appenders.BufferAppender.prototype.clone
         */
        clone(): BufferAppender;
        /**
         * log item
         * @function WinJSContrib.Logs.Appenders.BufferAppender.prototype.log
         * @param {string} message log message
         * @param {WinJSContrib.Logs.Levels} log level
         */
        log(logger: Logs.Logger, message: string, level: Logs.Levels, ...args: any[]): void;
        /**
         * create log group
         * @function WinJSContrib.Logs.Appenders.BufferAppender.prototype.group
         */
        group(title: string): void;
        /**
         * create collapsed log group
         * @function WinJSContrib.Logs.Appenders.BufferAppender.prototype.groupCollapsed
         */
        groupCollapsed(title: string): void;
        /**
         * close log group
         * @function WinJSContrib.Logs.Appenders.BufferAppender.prototype.groupEnd
         */
        groupEnd(): void;
        format(logger: Logger, message: string, level: Logs.Levels): string;
    }
}
declare module WinJSContrib.Logs {
    /**
    * enumeration for log levels
    * @enum {number} Levels
    * @memberof WinJSContrib.Logs
    */
    enum Levels {
        /**
         * disabled
         */
        inherit = 512,
        /**
         * disabled
         */
        off = 256,
        /**
         * log error
         */
        error = 32,
        /**
         * log warn and error
         */
        warn = 16,
        /**
         * log info, warn, error
         */
        info = 8,
        /**
         * log debug, info, warn, error
         */
        debug = 4,
        /**
        * verbose mode
        */
        verbose = 2,
    }
    interface ILoggerConfig {
        level: Logs.Levels;
        prefix?: string;
        showLevelInMessage?: boolean;
        showLoggerNameInMessage?: boolean;
        appenders?: any[];
    }
    var defaultConfig: ILoggerConfig;
    var RuntimeAppenders: {
        "DefaultConsole": Appenders.ConsoleAppender;
    };
    var DefaultAppenders: Appenders.ILogAppender[];
    /**
     * get a logger, logger is created if it does not exists
     * @function WinJSContrib.Logs.getLogger
     * @param {string} name name for the logger
     * @param {Object} config logger configuration
     * @param {...Object} appenders appenders to add to the logger
     * @returns {WinJSContrib.Logs.Logger}
     */
    function getLogger(name: string, config?: ILoggerConfig): Logger;
    function configure(name: string, config: ILoggerConfig): void;
    function loggingLevelStringToEnum(level: any): Levels;
    function logginLevelToString(level: any): string;
    class Logger {
        appenders: Array<WinJSContrib.Logs.Appenders.ILogAppender>;
        private _config;
        private _level;
        name: string;
        static noop: (message: string, ...args: any[]) => void;
        static getLogFn: (level: Levels) => (message: string) => void;
        static verbose: (message: string) => void;
        static debug: (message: string) => void;
        static info: (message: string) => void;
        static warn: (message: string) => void;
        static error: (message: string) => void;
        /**
         * @class WinJSContrib.Logs.Logger
         * @param {Object} config logger configuration
         */
        constructor(config: any);
        Config: ILoggerConfig;
        Level: Logs.Levels;
        checkLevel(): void;
        /**
         * add appender to logger
         * @function WinJSContrib.Logs.Logger.prototype.addAppender
         * @param {Object} appender
         */
        addAppender(appender: string | WinJSContrib.Logs.Appenders.ILogAppender): void;
        /**
         * Add log entry
         * @function WinJSContrib.Logs.Logger.prototype.log
         * @param {string} message log message
         * @param {WinJSContrib.Logs.Levels} log level
         */
        log(message: string, level: Logs.Levels, ...args: any[]): void;
        /**
         * add debug log entry
         * @function WinJSContrib.Logs.Logger.prototype.debug
         * @param {string} message log message
         */
        verbose(message: string, ...args: any[]): void;
        /**
         * add debug log entry
         * @function WinJSContrib.Logs.Logger.prototype.debug
         * @param {string} message log message
         */
        debug(message: string, ...args: any[]): void;
        /**
         * add info log entry
         * @function WinJSContrib.Logs.Logger.prototype.info
         * @param {string} message log message
         * @param {string} [group] log group name
         */
        info(message: string, ...args: any[]): void;
        /**
         * add warn log entry
         * @function WinJSContrib.Logs.Logger.prototype.warn
         * @param {string} message log message
         */
        warn(message: string, ...args: any[]): void;
        /**
         * add error log entry
         * @function WinJSContrib.Logs.Logger.prototype.error
         * @param {string} message log message
         */
        error(message: string, ...args: any[]): void;
        /**
         * create a log group
         * @function WinJSContrib.Logs.Logger.prototype.group
         * @param {string} title group title
         */
        group(title: string): void;
        /**
         * create a collapsed log group
         * @function WinJSContrib.Logs.Logger.prototype.groupCollapsed
         * @param {string} title group title
         */
        groupCollapsed(title: string): void;
        /**
         * end current group
         * @function WinJSContrib.Logs.Logger.prototype.groupEnd
         */
        groupEnd(): void;
        /**
         * Get a child logger
         * @function WinJSContrib.Logs.Logger.prototype.getChildLogger
         * @param {string} name child logger name
         * @param {WinJSContrib.Logs.Levels} level
         */
        getChildLogger(name: string, level: Logs.Levels): Logger;
    }
}

interface Object {
    map(obj: any, mapping: any): any;
}
interface String {
    format(...ag: any[]): string;
    padLeft(length: any, leadingChar: any): string;
    startsWith(e: string): boolean;
    endsWith(e: string): boolean;
}
declare module WinJSContrib.Promise {
    /**
     * apply callback for each item in the array in waterfall
     * @function WinJSContrib.Promise.waterfall
     * @param {Array} dataArray items to process with async tasks
     * @param {function} promiseCallback function applyed to each item (could return a promise for item callback completion)
     * @returns {WinJS.Promise}
     */
    function waterfall(dataArray: any, promiseCallback: any): WinJS.IPromise<any[]>;
    /**
     * apply callback for each item in the array in parallel (equivalent to WinJS.Promise.join)
     * @function WinJSContrib.Promise.parallel
     * @param {Array} dataArray items to process with async tasks
     * @param {function} promiseCallback function applyed to each item (could return a promise for item callback completion)
     * @returns {WinJS.Promise}
     */
    function parallel(dataArray: any, promiseCallback: any): WinJS.IPromise<any[]>;
    /**
     * apply callback for each item in the array in batch of X parallel items
     * @function WinJSContrib.Promise.batch
     * @param {Array} dataArray items to process with async tasks
     * @param {number} batchSize number of items to batch
     * @param {function} promiseCallback function applyed to each item (could return a promise for item callback completion)
     * @returns {WinJS.Promise}
     */
    function batch(dataArray: any, batchSize: any, promiseCallback: any, batchWrapCallback?: any): WinJS.IPromise<any[]>;
}
declare module WinJSContrib.Utils {
    class EventDispatcher {
        dispatchEvent(type: string, data: any): void;
        addEventListener(type: string, callback: Function): void;
        removeEventListener(type: string, callback: Function): void;
    }
    /**
     * extend an object with properties from subsequent objects
     * @function WinJSContrib.Utils.extend
     * @returns {Object} composite object
     */
    function extend(): any;
    /** indicate if string starts with featured characters
     * @function WinJSContrib.Utils.startsWith
     * @param {string} str string to search within
     * @param {string} strToMatch match string
     * @returns {boolean} true if string starts with strToMatch
     */
    function startsWith(str: any, strToMatch: any): boolean;
    function asyncForEach(array: any, callback: any, batchsize?: number): void;
    /** indicate if string ends with featured characters
     * @function WinJSContrib.Utils.endsWith
     * @param {string} str string to search within
     * @param {string} strToMatch match string
     * @returns {boolean} true if string starts with strToMatch
     */
    function endsWith(str: any, strToMatch: any): boolean;
    /**
     * generate a string formatted as a query string from object properties
     * @function WinJSContrib.Utils.queryStringFrom
     * @param {Object} obj object to format
     * @returns {string}
     */
    function queryStringFrom(obj: any): string;
    /**
     * trigger an event on a DOM node
     * @function WinJSContrib.Utils.triggerEvent
     * @param {HTMLElement} element receiving the event
     * @param {string} eventName name of the event
     * @param {boolean} bubbles indicate if event should bubble
     * @param {boolean} cancellable indicate if event can be cancelled
     */
    function triggerEvent(element: any, eventName: any, bubbles: any, cancellable: any): void;
    /**
     * @function WinJSContrib.Utils.triggerCustomEvent
     * @param {HTMLElement} element receiving the event
     * @param {string} eventName name of the event
     * @param {boolean} bubbles indicate if event should bubble
     * @param {boolean} cancellable indicate if event can be cancelled
     */
    function triggerCustomEvent(element: any, eventName: any, bubbles: any, cancellable: any, data: any): void;
    /** Read property value on an object based on expression
    * @function WinJSContrib.Utils.readProperty
    * @param {Object} source the object containing data
    * @param {Object} properties property descriptor. could be a string in js notation ex: 'myProp.myChildProp,
    * or an array of strings ['myProp', 'myChildProp']. String notation can contain indexers
    * @returns {Object} property value
    */
    function readProperty(source: any, properties: any): any;
    class PropertyDescriptor {
        parent: any;
        parentDescriptor: any;
        keyProp: any;
        constructor(parent: any, parentDescriptor: any, keyProp: any);
        ensureParent(): Window;
        propValue: any;
    }
    /**
     * return a propery descriptor for an object based on expression
     * @function WinJSContrib.Utils.getProperty
     * @param {Object} source the object containing data
     * @param {string[]} properties property descriptor. could be a string in js notation ex: 'myProp.myChildProp,
     * or an array of strings ['myProp', 'myChildProp']. String notation can contain indexers
     * @returns {Object} property descriptor
     */
    function getProperty(source: any, properties: any): PropertyDescriptor;
    /**
     * Write property value on an object based on expression
     * @function WinJSContrib.Utils.writeProperty
     * @param {Object} source the object containing data
     * @param {string[]} properties property descriptor. could be a string in js notation ex: 'myProp.myChildProp,
     * or an array of strings ['myProp', 'myChildProp']. String notation can contain indexers
     * @param {Object} data data to feed to the property
     */
    function writeProperty(source: any, properties: any, data: any): void;
    /** generate a random value between two numbers
     * @function WinJSContrib.Utils.randomFromInterval
     * @param {number} from lower limit
     * @param {number} to upper limit
     * @returns {number}
     */
    function randomFromInterval(from: any, to: any): number;
    /**
     * function to use as a callback for Array.sort when you want the array to be sorted alphabetically
     * @function WinJSContrib.Utils.alphabeticSort
     * @param {string} a
     * @param {string} b
     * @returns {number}
     */
    function alphabeticSort(a: any, b: any): number;
    /**
     * generate an array with only distinct elements
     * @function WinJSContrib.Utils.distinctArray
     * @param {Array} array
     * @param {string} path to array's item property used for checking items
     * @param {boolean} ignorecase indicate if comparison should ignore case when using string
     * @returns {Array}
     */
    function distinctArray(array: any, property: any, ignorecase: any): any;
    /**
     * get distinct values from an array of items
     * @function WinJSContrib.Utils.getDistinctPropertyValues
     * @param {Array} array items array
     * @param {string} property property path for values
     * @param {boolean} ignorecase ignore case for comparisons
     */
    function getDistinctPropertyValues(array: any, property: any, ignorecase: any): any;
    /**
     * Remove all accented characters from a string and replace them with their non-accented counterpart for ex: replace "é" with "e"
     * @function WinJSContrib.Utils.removeAccents
     * @param {string} s
     * @returns {string}
     */
    function removeAccents(s: string): string;
    /**
     * remove a page from navigation history
     * @function WinJSContrib.Utils.removePageFromHistory
     * @param {string} pageLocation page url
     */
    function removePageFromHistory(pageLoc: any): void;
    /**
     * format a number on 2 digits
     * @function WinJSContrib.Utils.pad2
     * @param {number} number
     */
    function pad2(number: any): string;
    /**
     * truncate a string and add ellipse if text if greater than certain size
     * @function WinJSContrib.Utils.ellipsisizeString
     * @param {string} text text to truncate
     * @param {number} maxSize maximum size for text
     * @param {boolean} useWordBoundary indicate if truncate should happen on the closest word boundary (like space)
     */
    function ellipsisizeString(text: any, maxSize: any, useWordBoundary: any): any;
    /**
     * generate a new Guid
     * @function WinJSContrib.Utils.guid
     * @returns {string}
     */
    function guid(): string;
    /**
     * inherit property from parent WinJS controls
     * @function WinJSContrib.Utils.inherit
     * @param {HTMLElement} element
     * @param {string} property property name
     */
    function inherit(element: any, property: any): any;
    /**
     * move DOM childrens form one node to the other
     * @function WinJSContrib.Utils.moveChilds
     * @param {HTMLElement} source source node containing elements to move
     * @param {HTMLElement} target target node for moved elements
     */
    function moveChilds(source: any, target: any): void;
    /**
     * get parent control identifyed by a property attached on DOM element
     * @function WinJSContrib.Utils.getParent
     * @param {string} property property attached to control's DOM element, for ex: msParentSelectorScope
     * @param {HTMLElement} element DOM element to scan
     * @returns {Object} WinJS control
     */
    function getParent(property: any, element: any): any;
    /**
     * get parent control identifyed by a css class
     * @function WinJSContrib.Utils.getParentControlByClass
     * @param {string} className css class name
     * @param {HTMLElement} element DOM element to scan
     * @returns {Object} WinJS control
     */
    function getParentControlByClass(className: any, element: any): any;
    /**
     * get parent page control (work only with WinJSContrib.UI.PageControlNavigator
     * @function WinJSContrib.Utils.getParentPage
     * @param {HTMLElement} element DOM element to scan
     * @returns {Object} WinJS control
     */
    function getParentPage(element: any): any;
    /**
     * get parent scope control (based on msParentSelectorScope)
     * @function WinJSContrib.Utils.getScopeControl
     * @param {HTMLElement} element DOM element to scan
     * @returns {Object} WinJS control
     */
    function getScopeControl(element: any): any;
    /**
     * get WinJS.Binding.Template like control from a path, a control, a function or a DOM element
     * @function WinJSContrib.Utils.getTemplate
     * @param {Object} template template input
     * @returns {Object} WinJS.Binding.Template or template-like object (object with a render function)
     */
    function getTemplate(template: any): any;
    /**
     * get a function from an expression, for example 'page:myAction' will return the myAction function from the parent page.
     * The returned function will be bound to it's owner. This function relies on {link WinJSContrib.Utils.resolveValue}, see this for details about how data are crawled
     * @function WinJSContrib.Utils.resolveMethod
     * @param {HTMLElement} element DOM element to look
     * @param {string} text expression like 'page:something' or 'ctrl:something' or 'something'
     * @returns {function}
     */
    function resolveMethod(element: any, text: any): any;
    function readValue(element: any, text: any): any;
    /**
     * Utility functions used by WinJSContrib.Utils.resolveValue and WinJSContrib.Utils.applyValue
     * @namespace WinJSContrib.Utils.ValueParsers
     */
    var ValueParsers: {
        "navpage": (element: any, text: any, context?: any) => any;
        "page": (element: any, text: any, context?: any) => any;
        "ctrl": (element: any, text: any, context?: any) => any;
        "select": (element: any, text: any, context?: any) => any;
        "obj": (element: any, text: any, context?: any) => any;
        "prom": (element: any, text: any, context?: any) => any;
        "list": (element: any, text: any, context?: any) => any;
        "global": (element: any, text: any, context?: any) => any;
        "templ": (element: any, text: any, context: any) => any;
        "element": (element: any, text: any, context?: any) => any;
        "event": (element: any, text: any, context?: any) => void;
    };
    /**
     * resolve value from an expression. This helper will crawl the DOM up, and provide the property or function from parent page or control.
     * @function WinJSContrib.Utils.resolveValue
     * @param {HTMLElement} element DOM element to look
     * @param {string} text expression like 'page:something' or 'ctrl:something' or 'something'
     * @returns {Object}
     */
    function resolveValue(element: any, text: any, context?: any): any;
    /**
     * call resolve value and apply result to a target object
     * @function WinJSContrib.Utils.applyValue
     * @param {HTMLElement} element DOM element to look
     * @param {string} text expression like 'page:something' or 'ctrl:something' or 'something'
     * @param {string} target target object
     * @param {string} targetPath path to dest property
     */
    function applyValue(element: any, text: any, target: any, targetPath: any, context: any): void;
    /**
     * Checks in a safe way if an object has a value, which could be 'false', '0' or '""'
     * @function WinJSContrib.Utils.hasValue
     * @param {Object} item The object to check.
     * @returns {Boolean} Whether the object has a value or not.
     */
    function hasValue(item: any): boolean;
    /**
     * format error from an xhr call
     * @function WinJSContrib.Utils.formatXHRError
     */
    function formatXHRError(xhr: any): string;
    /**
     * Unwraps the real error from a WinJS.Promise.join operation, which by design returns an array with 'undefined' for all cells,
     * excepts the one corresponding to the promise that really faulted.
     * @function WinJSContrib.Utils.unwrapJoinError
     * @param {function} errorCallback The callback to use to handle the error.
     * @returns {Function} The result of the callback being fired with the real error.
     */
    function unwrapJoinError(errorCallback: any): (errorArray: any) => any;
    /**
     * inject properties from source object to target object
     * @function WinJSContrib.Utils.inject
     */
    function inject(target: any, source: any): void;
}
/**
 * @namespace WinJSContrib.Templates
 */
declare module WinJSContrib.Templates {
    /**
     * get a template from it's path
     * @function get
     * @memberof WinJSContrib.Templates
     * @param {string} uri path to template file
     * @returns {WinJS.Binding.Template} template object
     */
    function get(uri: any): any;
    /**
     * get a template and turn it to a rendering function that takes an item promise, and return a DOM element
     * @function WinJSContrib.Templates.interactive
     * @param {string} uri path to template file
     * @param {Object} args definition of interactive elements
     * @returns {function} rendering function that takes an item promise, and return a DOM element
     */
    function interactive(uri: any, args: any): (itemPromise: any) => any;
    /**
     * generate a rendering function that takes an item promise, and return a DOM element
     * @function WinJSContrib.Templates.get
     * @param {WinJS.Binding.Template} template template object
     * @param {Object} args definition of interactive elements
     * @returns {function} rendering function that takes an item promise, and return a DOM element
     */
    function makeInteractive(template: any, args: any): (itemPromise: any) => any;
}

interface Window {
    Touch: any;
}
declare module WinJSContrib.UI {
    interface WinJSContribApplication {
        navigator?: any;
    }
    var Application: WinJSContribApplication;
    /**
     * indicate if fragment should not look for resources when building control
     * @field WinJSContrib.UI.disableAutoResources
     * @type {boolean}
     */
    var disableAutoResources: boolean;
    /**
     * Calculate offset of element relative to parent element. If parent parameter is null, offset is relative to document
     * @function WinJSContrib.UI.offsetFrom
     * @param {HTMLElement} element element to evaluate
     * @param {HTMLElement} parent reference of offset
     */
    function offsetFrom(element: HTMLElement, parent: HTMLElement): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    class EventTracker {
        events: Array<any>;
        /**
         * @class WinJSContrib.UI.EventTracker
         * @classdesc object to register and release events from addEventListener or bind
         */
        constructor();
        /**
         * register an event from an object
         * @function WinJSContrib.UI.EventTracker.prototype.addEvent
         * @param {Object} e object containing addEventListener
         * @param {string} eventName name of the event
         * @param {function} handler
         * @param {boolean} capture
         * @returns {function} function to call for unregistering the event
         */
        addEvent(e: any, eventName: string, handler: any, capture?: boolean): (disableSplice: any) => void;
        /**
         * register binding event
         * @function WinJSContrib.UI.EventTracker.prototype.addBinding
         * @param {Object} e object containing bind method
         * @param {string} eventName name of the binding event
         * @param {function} handler
         */
        addBinding(e: any, eventName: string, handler: any): (disableSplice: any) => void;
        /**
         * release all registered events
         * @function WinJSContrib.UI.EventTracker.prototype.dispose
         */
        dispose(): void;
    }
    /**
     * open all appbars
     * @function WinJSContrib.UI.appbarsOpen
     */
    function appbarsOpen(): void;
    /**
     * close all appbars
     * @function WinJSContrib.UI.appbarsClose
     */
    function appbarsClose(): void;
    /**
     * disable all appbars
     * @function WinJSContrib.UI.appbarsDisable
     */
    function appbarsDisable(): void;
    /**
     * enable all appbars
     * @function WinJSContrib.UI.appbarsEnable
     */
    function appbarsEnable(): void;
    /**
     * build a promise around element "load" event (work for all element with src property like images, iframes, ...)
     * @function WinJSContrib.UI.elementLoaded
     * @param {HTMLElement} element
     * @param {string} url url used to feed "src" on element
     * @returns {WinJS.Promise}
     */
    function elementLoaded(elt: any, url: any): WinJS.Promise<{}>;
    /**
     * Create a promise for getting an image object from url
     * @function WinJSContrib.UI.loadImage
     * @param {string} imgUrl url for the picture
     * @returns {WinJS.Promise}
     */
    function loadImage(imgUrl: any): WinJS.Promise<{}>;
    /**
     * List all elements found after provided element
     * @function WinJSContrib.UI.listElementsAfterMe
     * @param {HTMLElement} elt target element
     * @returns {Array} list of sibling elements
     */
    function listElementsAfterMe(elt: any): any[];
    /**
     * create an animation for removing an element from a list
     * @function WinJSContrib.UI.removeElementAnimation
     * @param {HTMLElement} element that will be removed
     * @returns {WinJS.Promise}
     */
    function removeElementAnimation(elt: any): WinJS.Promise<{}>;
    /**
     * setup declarative binding to parent control function. It looks for "data-page-action" attributes,
     * and try to find a matching method on the supplyed control.
     * You could add arguments with a "page-action-args" attribute. The argument can be an object or a function
     * @function WinJSContrib.UI.bindPageActions
     * @param {HTMLElement} element root node crawled for page actions
     * @param {Object} control control owning functions to call
     * @param {item} optionnal argument for adding an item to call
     */
    function bindPageActions(element: any, control: any, item?: any): void;
    /**
     * setup declarative binding to page link. It looks for "data-page-link" attributes.
     * If any the content of the attribute point toward a page. clicking that element will navigate to that page.
     * You could add arguments with a "page-action-args" attribute. The argument can be an object or a function
     * @function WinJSContrib.UI.bindPageLinks
     * @param {HTMLElement} element root node crawled for page actions
     */
    function bindPageLinks(element: any, item?: any): void;
    function parentNavigator(element: any): any;
    /**
     * Add this element or control as member to the control. It looks for "data-page-member" attributes. If attribute is empty, it tooks the element id as member name.
     * @function WinJSContrib.UI.bindMembers
     * @param {HTMLElement} element root node crawled for page actions
     * @param {Object} control control owning functions to call
     */
    function bindMembers(element: any, control: any): void;
    /**
     * setup declarative binding to parent control function and to navigation links. It internally invoke both {@link WinJSContrib.UI.bindPageActions} and {@link WinJSContrib.UI.bindPageLinks}
     * @function WinJSContrib.UI.bindActions
     * @param {HTMLElement} element root node crawled for page actions
     * @param {Object} control control owning functions to call
     */
    function bindActions(element: any, control: any, item?: any): void;
    /**
     * Trigger events on media queries. This class is usefull as a component for other controls to change some properties based on media queries
     * @class WinJSContrib.UI.MediaTrigger
     * @param {Object} items object containing one property for each query
     * @param {Object} linkedControl control linked to media trigger
     */
    class MediaTrigger {
        queries: Array<any>;
        linkedControl: any;
        constructor(items: any, linkedControl: any);
        /**
         * @function WinJSContrib.UI.MediaTrigger.prototype.dispose
         * release media trigger
         */
        dispose(): void;
        /**
         * register an event from a media query
         * @function WinJSContrib.UI.MediaTrigger.prototype.registerMediaEvent
         * @param {string} name event name
         * @param {string} query media query
         * @param {Object} data data associated with this query
         */
        registerMediaEvent(name: any, query: any, data: any): void;
        _mediaEvent(arg: any, query: any): void;
        /**
         * @function WinJSContrib.UI.MediaTrigger.prototype.check
         * Check all registered queries
         */
        check(): void;
        /**
         * Adds an event listener to the control.
         * @function WinJSContrib.UI.MediaTrigger.prototype.addEventListener
         * @param type The type (name) of the event.
         * @param listener The listener to invoke when the event gets raised.
         * @param useCapture If true, initiates capture, otherwise false.
        **/
        addEventListener(type: string, listener: Function, useCapture?: boolean): void;
        /**
         * Raises an event of the specified type and with the specified additional properties.
         * @function WinJSContrib.UI.MediaTrigger.prototype.dispatchEvent
         * @param type The type (name) of the event.
         * @param eventProperties The set of additional properties to be attached to the event object when the event is raised.
         * @returns true if preventDefault was called on the event.
        **/
        dispatchEvent(type: string, eventProperties: any): boolean;
        /**
         * Removes an event listener from the control.
         * @function WinJSContrib.UI.MediaTrigger.prototype.removeEventListener
         * @param type The type (name) of the event.
         * @param listener The listener to remove.
         * @param useCapture true if capture is to be initiated, otherwise false.
        **/
        removeEventListener(type: string, listener: Function, useCapture?: boolean): void;
    }
    function registerNavigationEvents(control: any, callback: any): () => void;
    /**
     * remove tap behavior
     * @function WinJSContrib.UI.untap
     * @param {HtmlElement} element element to clean
     */
    function untap(element: any): void;
    /**
     * remove tap behavior from all childs
     * @function WinJSContrib.UI.untapAll
     * @param {HtmlElement} element element to clean
     */
    function untapAll(element: any): void;
    var defaultTapBehavior: {
        animDown: any;
        animUp: any;
        disableAnimation: boolean;
        disableAria: boolean;
        awaitAnim: boolean;
        errorDelay: number;
        mapClickEvents: number;
    };
    /**
     * add tap behavior to an element, tap manages quirks like click delay, visual feedback, etc
     * @function WinJSContrib.UI.tap
     * @param {HtmlElement} element element to make "tappable"
     * @param {function} callback callback function invoked on tap
     * @param {Object} options tap options
     */
    function tap(element: any, callback: any, options?: any): void;
    /**
     * return a promise completed after css transition on the element is ended
     * @function WinJSContrib.UI.afterTransition
     * @param {HtmlElement} element element to watch
     * @param {number} timeout timeout
     */
    function afterTransition(element: any, timeout?: any): WinJS.Promise<{}>;
    /**
     * Utility class for building DOM elements through code with a fluent API
     * @class WinJSContrib.UI.FluentDOM
     * @param {string} nodeType type of DOM node (ex: 'DIV')
     * @param className css classes
     * @param parentElt parent DOM element
     * @param {WinJSContrib.UI.FluentDOM} parent parent FluentDOM
     * @example
     * var elt = new WinJSContrib.UI.FluentDOM('DIV', 'item-content')
     *    .text(item.title)
     *    .display('none')
     *    .element;
     */
    class FluentDOM {
        element: HTMLElement;
        childs: Array<FluentDOM>;
        parent: FluentDOM;
        constructor(nodeType: string, className?: string, parentElt?: Element, parent?: FluentDOM);
        static for(element: HTMLElement): FluentDOM;
        static fragment(): FluentDOM;
        control: any;
        /**
         * Add a css class
         * @function WinJSContrib.UI.FluentDOM.prototype.addClass
         * @param classname css class
         * @returns {WinJSContrib.UI.FluentDOM}
         */
        addClass(classname: string): FluentDOM;
        /**
         * set className
         * @function WinJSContrib.UI.FluentDOM.prototype.className
         * @param classname css classes
         * @returns {WinJSContrib.UI.FluentDOM}
         */
        className(classname: string): FluentDOM;
        /**
         * set opacity
         * @function WinJSContrib.UI.FluentDOM.prototype.opacity
         * @param opacity opacity
         * @returns {WinJSContrib.UI.FluentDOM}
         */
        opacity(opacity: string): FluentDOM;
        /**
         * set display
         * @function WinJSContrib.UI.FluentDOM.prototype.display
         * @param display display
         * @returns {WinJSContrib.UI.FluentDOM}
         */
        display(display: string): FluentDOM;
        /**
         * set display 'none'
         * @function WinJSContrib.UI.FluentDOM.prototype.hide
         * @returns {WinJSContrib.UI.FluentDOM}
         */
        hide(): FluentDOM;
        /**
         * set visibility
         * @function WinJSContrib.UI.FluentDOM.prototype.visibility
         * @param visibility visibility
         * @returns {WinJSContrib.UI.FluentDOM}
         */
        visibility(visibility: string): FluentDOM;
        /**
         * set textContent
         * @function WinJSContrib.UI.FluentDOM.prototype.text
         * @param text text
         * @returns {WinJSContrib.UI.FluentDOM}
         */
        text(text: string): FluentDOM;
        /**
         * set innerHTML
         * @function WinJSContrib.UI.FluentDOM.prototype.html
         * @param text text
         * @returns {WinJSContrib.UI.FluentDOM}
         */
        html(text: string): FluentDOM;
        /**
         * set attribute
         * @function WinJSContrib.UI.FluentDOM.prototype.attr
         * @param name attribute name
         * @param val attribute value
         * @returns {WinJSContrib.UI.FluentDOM}
         */
        attr(name: string, val: string): FluentDOM;
        /**
         * set style property
         * @function WinJSContrib.UI.FluentDOM.prototype.style
         * @param name attribute name
         * @param val attribute value
         * @returns {WinJSContrib.UI.FluentDOM}
         */
        style(name: string, val: string): FluentDOM;
        /**
         * set style property
         * @function WinJSContrib.UI.FluentDOM.prototype.style
         * @param name attribute name
         * @param val attribute value
         * @returns {WinJSContrib.UI.FluentDOM}
         */
        styles(obj: any): FluentDOM;
        /**
         * append element to another DOM element
         * @function WinJSContrib.UI.FluentDOM.prototype.appendTo
         * @param elt parent element
         * @returns {WinJSContrib.UI.FluentDOM}
         */
        appendTo(elt: Element): FluentDOM;
        /**
         * add tap behavior
         * @function WinJSContrib.UI.FluentDOM.prototype.tap
         * @param callback tap callback
         * @param options tap options
         * @returns {WinJSContrib.UI.FluentDOM}
         */
        tap(callback: any, options?: any): FluentDOM;
        /**
         * create a child FluentDOM and append it to current
         * @function WinJSContrib.UI.FluentDOM.prototype.append
         * @param nodeType child node type
         * @param className css classes
         * @param callback callback receiving the new FluentDOM as an argument
         * @returns {WinJSContrib.UI.FluentDOM} current instance (for method chaining)
         */
        append(nodeType: string, className?: string, callback?: (FluentDOM) => void): FluentDOM;
        /**
         * create a child FluentDOM and append it to current
         * @function WinJSContrib.UI.FluentDOM.prototype.createChild
         * @param nodeType child node type
         * @param className css classes
         * @returns {WinJSContrib.UI.FluentDOM} child FluentDOM
         */
        createChild(nodeType: string, className?: string): FluentDOM;
        /**
         * create a WinJS control
         * @function WinJSContrib.UI.FluentDOM.prototype.ctrl
         * @param ctrl constructor or full name of the control
         * @param options control options
         * @returns {WinJSContrib.UI.FluentDOM}
         */
        ctrl(ctrl: any, options?: any): FluentDOM;
    }
    function dismissableShow(targetElement: HTMLElement, classPrefix: string, animationTarget?: HTMLElement): void;
    function dismissableHide(targetElement: HTMLElement, classPrefix: string, animationTarget?: HTMLElement): void;
    function forwardFocus(container: HTMLElement, focusTarget: HTMLElement, allowed?: HTMLElement[]): () => void;
}

declare var __global: any;
declare module WinJSContrib.UI.WebComponents {
    var watch: any;
}
declare var profiler: any;
declare module WinJSContrib.UI.Pages {
    var verboseTraces: boolean;
    var preloadDelay: number;
    function preload(...pathes: string[]): WinJS.IPromise<any[]>;
    function preloadPath(path: string): WinJS.IPromise<WinJS.Utilities.Scheduler.IJob>;
    /**
     * List of mixins to apply to each fragment managed by WinJS Contrib (through navigator or by calling explicitely {@link WinJSContrib.UI.Pages.fragmentMixin}).
     * @field WinJSContrib.UI.Pages.defaultFragmentMixins
     * @type {Array}
     */
    var defaultFragmentMixins: Array<any>;
    /**
     * render a html fragment with winjs contrib pipeline and properties, and add WinJS Contrib page events.
     * @function WinJSContrib.UI.Pages.renderFragment
     * @param {HTMLElement} container element that will contain the fragment
     * @param {string} location url for the fragment
     * @param {Object} args arguments to the fragment
     * @param {Object} options rendering options
     */
    function renderFragment(container: any, location: any, args: any, options: any): WinJS.Promise<{}>;
    interface PageLifeCycle {
        created: Date;
        location: string;
        log: (callback: () => void) => void;
        stop: () => void;
        steps: {
            init: PageLifeCycleStep;
            render: PageLifeCycleStep;
            process: PageLifeCycleStep;
            layout: PageLifeCycleStep;
            ready: PageLifeCycleStep;
            enter: PageLifeCycleStep;
        };
        initialDisplay: string;
    }
    class DefferedLoadings {
        resolved: boolean;
        page: any;
        items: (() => void | WinJS.Promise<any>)[];
        constructor(page: any);
        push(delegate: () => void | WinJS.Promise<any>): void;
        resolve(): WinJS.IPromise<{}>;
    }
    class PageBase {
        eventTracker: WinJSContrib.UI.EventTracker;
        element: HTMLElement;
        promises: WinJS.Promise<any>[];
        defferedLoading: DefferedLoadings;
        pageLifeCycle: PageLifeCycle;
        parentedComplete: WinJS.Promise<any>;
        q: (selector: string) => Element;
        qAll: (selector: string) => Element[];
        addPromise: (prom: WinJS.Promise<any>) => void;
    }
    class PageLifeCycleStep {
        promise: WinJS.Promise<any>;
        isDone: boolean;
        created: Date;
        resolved: Date;
        stepName: string;
        page: any;
        _resolvePromise: any;
        _rejectPromise: any;
        queue: Array<any>;
        constructor(page: any, stepName: any, parent: any);
        attach(callback: any): WinJS.Promise<any>;
        resolve(arg: any): WinJS.IPromise<any>;
        reject(arg: any): WinJS.IPromise<WinJS.Promise<any>>;
    }
}
