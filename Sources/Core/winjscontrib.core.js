var WinJSContrib;
(function (WinJSContrib) {
    var Logs;
    (function (Logs) {
        var Appenders;
        (function (Appenders) {
            /**
             * @namespace
             */
            WinJSContrib.Logs.Appenders = WinJSContrib.Logs.Appenders;
            var ConsoleAppender = (function () {
                /**
                 * Appender writing to console
                 * @class WinJSContrib.Logs.Appenders.ConsoleAppender
                 */
                function ConsoleAppender(config) {
                    this.config = config || { level: Logs.Levels.inherit };
                }
                /**
                 * clone appender
                 * @function WinJSContrib.Logs.Appenders.ConsoleAppender.prototype.clone
                 */
                ConsoleAppender.prototype.clone = function () {
                    return new WinJSContrib.Logs.Appenders.ConsoleAppender(this.config);
                };
                /**
                 * log item
                 * @function WinJSContrib.Logs.Appenders.ConsoleAppender.prototype.log
                 * @param {string} message log message
                 * @param {WinJSContrib.Logs.Levels} log level
                 */
                ConsoleAppender.prototype.log = function (logger, message, level) {
                    var args = [];
                    for (var _i = 3; _i < arguments.length; _i++) {
                        args[_i - 3] = arguments[_i];
                    }
                    var msg = [this.format(logger, message, level)];
                    if (args.length) {
                        args.forEach(function (a) {
                            msg.push(a);
                        });
                    }
                    switch (level) {
                        case Logs.Levels.verbose:
                            return console.log.apply(console, msg);
                        case Logs.Levels.debug:
                            return console.log.apply(console, msg);
                        case Logs.Levels.info:
                            return console.info.apply(console, msg);
                        case Logs.Levels.warn:
                            return console.warn.apply(console, msg);
                        case Logs.Levels.error:
                            return console.error.apply(console, msg);
                    }
                };
                /**
                 * create log group
                 * @function WinJSContrib.Logs.Appenders.ConsoleAppender.prototype.group
                 */
                ConsoleAppender.prototype.group = function (title) {
                    console.group(title);
                };
                /**
                 * create collapsed log group
                 * @function WinJSContrib.Logs.Appenders.ConsoleAppender.prototype.groupCollapsed
                 */
                ConsoleAppender.prototype.groupCollapsed = function (title) {
                    console.groupCollapsed(title);
                };
                /**
                 * close log group
                 * @function WinJSContrib.Logs.Appenders.ConsoleAppender.prototype.groupEnd
                 */
                ConsoleAppender.prototype.groupEnd = function () {
                    console.groupEnd();
                };
                ConsoleAppender.prototype.format = function (logger, message, level) {
                    var finalMessage = "";
                    if (logger.Config && logger.Config.prefix)
                        finalMessage += logger.Config.prefix + " # ";
                    if (this.config.showLoggerNameInMessage)
                        finalMessage += logger.name + " # ";
                    if (this.config.showLevelInMessage)
                        finalMessage += Logs.logginLevelToString(level) + " # ";
                    finalMessage += message;
                    return finalMessage;
                };
                return ConsoleAppender;
            })();
            Appenders.ConsoleAppender = ConsoleAppender;
        })(Appenders = Logs.Appenders || (Logs.Appenders = {}));
    })(Logs = WinJSContrib.Logs || (WinJSContrib.Logs = {}));
})(WinJSContrib || (WinJSContrib = {}));
var WinJSContrib;
(function (WinJSContrib) {
    var Logs;
    (function (Logs) {
        /**
         * @namespace WinJSContrib.Logs
         */
        WinJSContrib.Logs = WinJSContrib.Logs;
        /**
        * enumeration for log levels
        * @enum {number} Levels
        * @memberof WinJSContrib.Logs
        */
        (function (Levels) {
            /**
             * disabled
             */
            Levels[Levels["inherit"] = 512] = "inherit";
            /**
             * disabled
             */
            Levels[Levels["off"] = 256] = "off";
            /**
             * log error
             */
            Levels[Levels["error"] = 32] = "error";
            /**
             * log warn and error
             */
            Levels[Levels["warn"] = 16] = "warn";
            /**
             * log info, warn, error
             */
            Levels[Levels["info"] = 8] = "info";
            /**
             * log debug, info, warn, error
             */
            Levels[Levels["debug"] = 4] = "debug";
            /**
            * verbose mode
            */
            Levels[Levels["verbose"] = 2] = "verbose";
        })(Logs.Levels || (Logs.Levels = {}));
        var Levels = Logs.Levels;
        ;
        // Default config
        Logs.defaultConfig = {
            "level": Levels.off,
            "showLevelInMessage": false,
            "showLoggerNameInMessage": false,
            "appenders": ["DefaultConsole"]
        };
        var Loggers = {};
        Logs.RuntimeAppenders = {
            "DefaultConsole": new Logs.Appenders.ConsoleAppender()
        };
        /**
         * get a logger, logger is created if it does not exists
         * @function WinJSContrib.Logs.getLogger
         * @param {string} name name for the logger
         * @param {Object} config logger configuration
         * @param {...Object} appenders appenders to add to the logger
         * @returns {WinJSContrib.Logs.Logger}
         */
        function getLogger(name, config) {
            var existing = Loggers[name];
            if (!existing) {
                existing = new Logger(config || Logs.defaultConfig);
                existing.name = name;
                Loggers[name] = existing;
            }
            if (config || arguments.length > 2)
                configure.apply(null, arguments);
            return existing;
        }
        Logs.getLogger = getLogger;
        function configure(name, config) {
            var existing = Loggers[name];
            if (existing) {
                if (config)
                    existing.Config = config;
                if (arguments.length > 2) {
                    for (var i = 2; i < arguments.length; i++) {
                        existing.addAppender(arguments[i]);
                    }
                }
            }
        }
        Logs.configure = configure;
        function loggingLevelStringToEnum(level) {
            switch (level.toLowerCase()) {
                default:
                case "log":
                case "debug":
                    return Levels.debug;
                case "info":
                    return Levels.info;
                case "warn":
                    return Levels.warn;
                case "error":
                    return Levels.error;
            }
        }
        Logs.loggingLevelStringToEnum = loggingLevelStringToEnum;
        function logginLevelToString(level) {
            switch (level) {
                default:
                case Levels.verbose:
                    return "VERBOSE";
                case Levels.debug:
                    return "DEBUG";
                case Levels.info:
                    return "INFO";
                case Levels.warn:
                    return "WARN";
                case Levels.error:
                    return "ERROR";
            }
        }
        Logs.logginLevelToString = logginLevelToString;
        var Logger = (function () {
            /**
             * @class WinJSContrib.Logs.Logger
             * @param {Object} config logger configuration
             */
            function Logger(config) {
                this.appenders = [];
                /**
                 * Logger configuration
                 * @field Config
                 * @type {Object}
                 */
                this.Config = config || Logs.defaultConfig;
            }
            Object.defineProperty(Logger.prototype, "Config", {
                get: function () {
                    return this._config;
                },
                set: function (newValue) {
                    var _this = this;
                    this._config = newValue || { level: Logs.Levels.off, showLevelInMessage: false, showLoggerNameInMessage: false };
                    if (typeof newValue.level === "number")
                        this.Level = newValue.level;
                    if (typeof newValue.showLevelInMessage === "boolean")
                        this.Config.showLevelInMessage = newValue.showLevelInMessage;
                    if (typeof newValue.showLoggerNameInMessage === "boolean")
                        this.Config.showLoggerNameInMessage = newValue.showLoggerNameInMessage;
                    if (this._config.appenders) {
                        this._config.appenders.forEach(function (a) {
                            _this.addAppender(a);
                        });
                    }
                    else {
                        this._config.appenders = [];
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Logger.prototype, "Level", {
                get: function () {
                    return this._level;
                },
                set: function (val) {
                    this._level = val;
                    if (this._level <= Logs.Levels.verbose) {
                        this.verbose = Logger.verbose;
                    }
                    else {
                        this.verbose = Logger.noop;
                    }
                    if (this._level <= Logs.Levels.debug) {
                        this.debug = Logger.debug;
                    }
                    else {
                        this.debug = Logger.noop;
                    }
                    if (this._level <= Logs.Levels.info) {
                        this.info = Logger.info;
                    }
                    else {
                        this.info = Logger.noop;
                    }
                    if (this._level <= Logs.Levels.warn) {
                        this.warn = Logger.warn;
                    }
                    else {
                        this.warn = Logger.noop;
                    }
                    if (this._level <= Logs.Levels.error) {
                        this.error = Logger.error;
                    }
                    else {
                        this.error = Logger.noop;
                    }
                },
                enumerable: true,
                configurable: true
            });
            /**
             * add appender to logger
             * @function WinJSContrib.Logs.Logger.prototype.addAppender
             * @param {Object} appender
             */
            Logger.prototype.addAppender = function (appender) {
                if (typeof appender == "string") {
                    appender = WinJSContrib.Logs.RuntimeAppenders[appender];
                }
                var currentappender = appender;
                if (!currentappender)
                    return;
                var exists = this.appenders.indexOf(currentappender) >= 0;
                if (exists)
                    return;
                //if (!currentappender.format)
                //    currentappender.format = this.format.bind(this);
                this.appenders.push(currentappender);
            };
            /**
             * Add log entry
             * @function WinJSContrib.Logs.Logger.prototype.log
             * @param {string} message log message
             * @param {WinJSContrib.Logs.Levels} log level
             */
            Logger.prototype.log = function (message, level) {
                var args = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    args[_i - 2] = arguments[_i];
                }
                // If general logging level is set to 'none', returns
                if (this._config.level === WinJSContrib.Logs.Levels.off || level < this._config.level)
                    return;
                if (!this.appenders || !this.appenders.length)
                    return;
                var fnargs = [this, message, level];
                if (args.length) {
                    for (var i = 0; i < args.length; i++) {
                        fnargs.push(args[i]);
                    }
                }
                this.appenders.forEach(function (a) {
                    a.log.apply(a, fnargs);
                });
            };
            ///**
            // * format log entry
            // * @function WinJSContrib.Logs.Logger.prototype.format
            // * @param {string} message log message
            // * @param {string} group group/category for the entry
            // * @param {WinJSContrib.Logs.Levels} log level
            // */
            //public format(message: string, level: Logs.Levels) {
            //    var finalMessage = "";
            //    if (!this.Config.hideLevelInMessage) finalMessage += logginLevelToString(level) + " - ";
            //    finalMessage += message;
            //    return finalMessage;
            //}
            /**
             * add debug log entry
             * @function WinJSContrib.Logs.Logger.prototype.debug
             * @param {string} message log message
             */
            Logger.prototype.verbose = function (message) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
            };
            /**
             * add debug log entry
             * @function WinJSContrib.Logs.Logger.prototype.debug
             * @param {string} message log message
             */
            Logger.prototype.debug = function (message) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
            };
            /**
             * add info log entry
             * @function WinJSContrib.Logs.Logger.prototype.info
             * @param {string} message log message
             * @param {string} [group] log group name
             */
            Logger.prototype.info = function (message) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
            };
            /**
             * add warn log entry
             * @function WinJSContrib.Logs.Logger.prototype.warn
             * @param {string} message log message
             */
            Logger.prototype.warn = function (message) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
            };
            /**
             * add error log entry
             * @function WinJSContrib.Logs.Logger.prototype.error
             * @param {string} message log message
             */
            Logger.prototype.error = function (message) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
            };
            /**
             * create a log group
             * @function WinJSContrib.Logs.Logger.prototype.group
             * @param {string} title group title
             */
            Logger.prototype.group = function (title) {
                this.appenders.forEach(function (a) {
                    if (a.group)
                        a.group(title);
                });
            };
            /**
             * create a collapsed log group
             * @function WinJSContrib.Logs.Logger.prototype.groupCollapsed
             * @param {string} title group title
             */
            Logger.prototype.groupCollapsed = function (title) {
                this.appenders.forEach(function (a) {
                    if (a.groupCollapsed)
                        a.groupCollapsed(title);
                });
            };
            /**
             * end current group
             * @function WinJSContrib.Logs.Logger.prototype.groupEnd
             */
            Logger.prototype.groupEnd = function () {
                this.appenders.forEach(function (a) {
                    if (a.groupEnd)
                        a.groupEnd();
                });
            };
            /**
             * Get a child logger
             * @function WinJSContrib.Logs.Logger.prototype.getChildLogger
             * @param {string} name child logger name
             * @param {WinJSContrib.Logs.Levels} level
             */
            Logger.prototype.getChildLogger = function (name, level) {
                var res = WinJSContrib.Logs.getLogger(this.name + '.' + name, JSON.parse(JSON.stringify(this.Config)));
                res.Config.appenders = [];
                this.appenders.forEach(function (a) {
                    if (a.clone)
                        res.addAppender(a.clone());
                });
                if (level)
                    res.Config.level = level;
                return res;
            };
            Logger.noop = function (message) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
            };
            Logger.getLogFn = function (level) {
                return function (message) {
                    var args = null;
                    if (arguments.length > 1) {
                        args = [];
                        for (var i = 1; i < arguments.length; i++) {
                            args.push(arguments[i]);
                        }
                        this.log(message, level, args);
                    }
                    else
                        this.log(message, level);
                };
            };
            Logger.verbose = Logger.getLogFn(Logs.Levels.verbose);
            Logger.debug = Logger.getLogFn(Logs.Levels.debug);
            Logger.info = Logger.getLogFn(Logs.Levels.info);
            Logger.warn = Logger.getLogFn(Logs.Levels.warn);
            Logger.error = Logger.getLogFn(Logs.Levels.error);
            return Logger;
        })();
        Logs.Logger = Logger;
    })(Logs = WinJSContrib.Logs || (WinJSContrib.Logs = {}));
})(WinJSContrib || (WinJSContrib = {}));

(function (_global) {
    //polyfill setimmediate
    if (!this.setImmediate) {
        this.setImmediate = function (callback) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            setTimeout(callback, 0);
            return 0;
        };
    }
    //Windows 10 doesn't have it anymore, polyfill for backward compat
    if (!this.toStaticHTML) {
        this.toStaticHTML = function (text) {
            return text;
        };
    }
    var msapp = _global.MSApp;
    if (msapp && !msapp.execUnsafeLocalFunction) {
        msapp.execUnsafeLocalFunction = function (c) { c(); };
    }
})(this);
if (!Object.map) {
    Object.map = function (obj, mapping) {
        var mapped = {};
        if (typeof obj !== 'object') {
            return mapped;
        }
        if (typeof mapping !== 'function') {
            // We could just return obj but that wouldn't be
            // consistent with the rest of the interface which always returns
            // a new object.
            mapping = function (key, val) {
                return [key, val];
            };
        }
        Object.keys(obj).forEach(function (key) {
            var transmuted = mapping.apply(obj, [key, obj[key]]);
            if (transmuted && transmuted.length) {
                mapped[transmuted[0] || key] = transmuted[1];
            }
        });
        return mapped;
    };
}
if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    };
}
if (!String.prototype.padLeft) {
    String.prototype.padLeft = function padLeft(length, leadingChar) {
        if (leadingChar === undefined) {
            leadingChar = "0";
        }
        return this.length < length ? (leadingChar + this).padLeft(length, leadingChar) : this;
    };
}
var WinJSContrib;
(function (WinJSContrib) {
    var Promise;
    (function (Promise) {
        /**
         * apply callback for each item in the array in waterfall
         * @function WinJSContrib.Promise.waterfall
         * @param {Array} dataArray items to process with async tasks
         * @param {function} promiseCallback function applyed to each item (could return a promise for item callback completion)
         * @returns {WinJS.Promise}
         */
        function waterfall(dataArray, promiseCallback) {
            var resultPromise = WinJS.Promise.wrap();
            var results = [];
            if (!dataArray) {
                return WinJS.Promise.wrap([]);
            }
            var dataPromise = WinJS.Promise.as(dataArray);
            return dataPromise.then(function (items) {
                var queueP = function (p, item) {
                    return p.then(function (r) {
                        return WinJS.Promise.as(promiseCallback(item)).then(function (r) {
                            results.push(r);
                        });
                    });
                };
                for (var i = 0, l = items.length; i < l; i++) {
                    var item = items[i];
                    if (!item && items.getItem) {
                        item = items.getItem(i);
                    }
                    resultPromise = queueP(resultPromise, item);
                }
                return resultPromise.then(function (r) {
                    return results;
                });
            });
        }
        Promise.waterfall = waterfall;
        function promises(dataArray, promiseCallback) {
            if (!dataArray) {
                return WinJS.Promise.wrap([]);
            }
            var dataPromise = WinJS.Promise.as(dataArray);
            return dataPromise.then(function (items) {
                var promises = [];
                for (var i = 0, l = items.length; i < l; i++) {
                    var item = items[i];
                    if (!item && items.getItem) {
                        item = items.getItem(i);
                    }
                    promises.push(WinJS.Promise.as(promiseCallback(item)));
                }
                return promises;
            });
        }
        /**
         * apply callback for each item in the array in parallel (equivalent to WinJS.Promise.join)
         * @function WinJSContrib.Promise.parallel
         * @param {Array} dataArray items to process with async tasks
         * @param {function} promiseCallback function applyed to each item (could return a promise for item callback completion)
         * @returns {WinJS.Promise}
         */
        function parallel(dataArray, promiseCallback) {
            if (!dataArray) {
                return WinJS.Promise.wrap([]);
            }
            var dataPromise = WinJS.Promise.as(dataArray);
            return dataPromise.then(function (items) {
                var promises = [];
                for (var i = 0, l = items.length; i < l; i++) {
                    var item = items[i];
                    if (!item && items.getItem) {
                        item = items.getItem(i);
                    }
                    promises.push(WinJS.Promise.as(promiseCallback(item)));
                }
                return WinJS.Promise.join(promises);
            });
        }
        Promise.parallel = parallel;
        /**
         * apply callback for each item in the array in batch of X parallel items
         * @function WinJSContrib.Promise.batch
         * @param {Array} dataArray items to process with async tasks
         * @param {number} batchSize number of items to batch
         * @param {function} promiseCallback function applyed to each item (could return a promise for item callback completion)
         * @returns {WinJS.Promise}
         */
        function batch(dataArray, batchSize, promiseCallback) {
            if (!dataArray) {
                return WinJS.Promise.wrap([]);
            }
            var dataPromise = WinJS.Promise.as(dataArray);
            return dataPromise.then(function (items) {
                var resultPromise = WinJS.Promise.wrap();
                var batcheditems = [];
                var results = [];
                var hasErrors = false;
                var queueBatch = function (p, items) {
                    //var batchresults = [];
                    return p.then(function (r) {
                        return WinJS.Promise.join(items.map(function (item) { return WinJS.Promise.as(promiseCallback(item)); })).then(function (results) {
                            results = results.concat(results);
                        }, function (errors) {
                            results = results.concat(errors);
                            hasErrors = true;
                        });
                    });
                };
                for (var i = 0, l = items.length; i < l; i++) {
                    var item = items[i];
                    if (!item && items.getItem) {
                        item = items.getItem(i);
                    }
                    batcheditems.push(item);
                    if (i > 0 && i % batchSize === 0) {
                        resultPromise = queueBatch(resultPromise, batcheditems);
                        batcheditems = [];
                    }
                }
                if (batcheditems.length) {
                    resultPromise = queueBatch(resultPromise, batcheditems);
                }
                return resultPromise.then(function () {
                    if (hasErrors)
                        return WinJS.Promise.wrapError(results);
                    return results;
                });
            });
        }
        Promise.batch = batch;
    })(Promise = WinJSContrib.Promise || (WinJSContrib.Promise = {}));
})(WinJSContrib || (WinJSContrib = {}));
var WinJSContrib;
(function (WinJSContrib) {
    var Utils;
    (function (Utils) {
        /**
         * extend an object with properties from subsequent objects
         * @function WinJSContrib.Utils.extend
         * @returns {Object} composite object
         */
        function extend() {
            for (var i = 1; i < arguments.length; i++)
                for (var key in arguments[i])
                    if (arguments[i].hasOwnProperty(key))
                        arguments[0][key] = arguments[i][key];
            return arguments[0];
        }
        Utils.extend = extend;
        /** indicate if string starts with featured characters
         * @function WinJSContrib.Utils.startsWith
         * @param {string} str string to search within
         * @param {string} strToMatch match string
         * @returns {boolean} true if string starts with strToMatch
         */
        function startsWith(str, strToMatch) {
            if (!strToMatch) {
                return false;
            }
            var match = (str.match("^" + strToMatch) == strToMatch);
            return match;
        }
        Utils.startsWith = startsWith;
        if (!String.prototype.startsWith) {
            String.prototype.startsWith = function (str) {
                return WinJSContrib.Utils.startsWith(this, str);
            };
        }
        function asyncForEach(array, callback, batchsize) {
            if (batchsize === void 0) { batchsize = 1; }
            var i = 0;
            while (i < array.length) {
                setImmediate(function () {
                    for (var j = 0; j < batchsize && i < array.length; j++) {
                        i++;
                        callback(array[i]);
                    }
                });
            }
        }
        Utils.asyncForEach = asyncForEach;
        /** indicate if string ends with featured characters
         * @function WinJSContrib.Utils.endsWith
         * @param {string} str string to search within
         * @param {string} strToMatch match string
         * @returns {boolean} true if string starts with strToMatch
         */
        function endsWith(str, strToMatch) {
            if (!strToMatch) {
                return false;
            }
            return (str.match(strToMatch + "$") == strToMatch);
        }
        Utils.endsWith = endsWith;
        if (!String.prototype.endsWith) {
            String.prototype.endsWith = function (str) {
                return WinJSContrib.Utils.endsWith(this, str);
            };
        }
        /**
         * generate a string formatted as a query string from object properties
         * @function WinJSContrib.Utils.queryStringFrom
         * @param {Object} obj object to format
         * @returns {string}
         */
        function queryStringFrom(obj) {
            var str = [];
            for (var p in obj)
                if (obj.hasOwnProperty(p)) {
                    var key = encodeURIComponent(p);
                    var rawValue = obj[p];
                    var value = WinJSContrib.Utils.hasValue(rawValue) ? encodeURIComponent(rawValue) : "";
                    str.push(key + "=" + value);
                }
            return str.join("&");
        }
        Utils.queryStringFrom = queryStringFrom;
        /**
         * trigger an event on a DOM node
         * @function WinJSContrib.Utils.triggerEvent
         * @param {HTMLElement} element receiving the event
         * @param {string} eventName name of the event
         * @param {boolean} bubbles indicate if event should bubble
         * @param {boolean} cancellable indicate if event can be cancelled
         */
        function triggerEvent(element, eventName, bubbles, cancellable) {
            var eventToTrigger = document.createEvent("Event");
            eventToTrigger.initEvent(eventName, bubbles, cancellable);
            element.dispatchEvent(eventToTrigger);
        }
        Utils.triggerEvent = triggerEvent;
        /**
         * @function WinJSContrib.Utils.triggerCustomEvent
         * @param {HTMLElement} element receiving the event
         * @param {string} eventName name of the event
         * @param {boolean} bubbles indicate if event should bubble
         * @param {boolean} cancellable indicate if event can be cancelled
         */
        function triggerCustomEvent(element, eventName, bubbles, cancellable, data) {
            var eventToTrigger = document.createEvent("CustomEvent");
            eventToTrigger.initCustomEvent(eventName, bubbles, cancellable, data);
            element.dispatchEvent(eventToTrigger);
        }
        Utils.triggerCustomEvent = triggerCustomEvent;
        /*
        Core object properties features
        */
        //return object value based on property name. Property name is a string containing the name of the property, 
        //or the name of the property with an indexer, ex: myproperty[2] (to get item in a array)
        function getobject(obj, prop) {
            if (!obj)
                return;
            if (prop === 'this')
                return obj;
            var baseValue = obj[prop];
            if (typeof baseValue !== "undefined")
                return baseValue;
            var idx = prop.indexOf('[');
            if (idx < 0)
                return;
            var end = prop.indexOf(']', idx);
            if (end < 0)
                return;
            var val = prop.substr(idx + 1, end - idx);
            val = parseInt(val);
            return obj[val];
        }
        //set object property value based on property name. Property name is a string containing the name of the property, 
        //or the name of the property with an indexer, ex: myproperty[2] (to get item in a array)
        function setobject(obj, prop, data) {
            if (!obj)
                return;
            if (WinJSContrib.Utils.hasValue(prop)) {
                if (obj.setProperty) {
                    obj.setProperty(prop, data);
                    return;
                }
                obj[prop] = data;
                return;
            }
            if (typeof prop === "string") {
                var idx = prop.indexOf('[');
                if (idx < 0)
                    return;
                var end = prop.indexOf(']', idx);
                if (end < 0)
                    return;
                var val = prop.substr(idx + 1, end - idx);
                var intval = parseInt(val);
                obj[intval] = data;
            }
        }
        /** Read property value on an object based on expression
        * @function WinJSContrib.Utils.readProperty
        * @param {Object} source the object containing data
        * @param {Object} properties property descriptor. could be a string in js notation ex: 'myProp.myChildProp,
        * or an array of strings ['myProp', 'myChildProp']. String notation can contain indexers
        * @returns {Object} property value
        */
        function readProperty(source, properties) {
            if (typeof properties == 'string' && source[properties])
                return source[properties];
            if (!properties || !properties.length)
                return source;
            var prop = WinJSContrib.Utils.getProperty(source, properties);
            if (prop) {
                return prop.propValue;
            }
        }
        Utils.readProperty = readProperty;
        var PropertyDescriptor = (function () {
            function PropertyDescriptor(parent, parentDescriptor, keyProp) {
                this.parent = parent;
                this.parentDescriptor = parentDescriptor;
                this.keyProp = keyProp;
            }
            PropertyDescriptor.prototype.ensureParent = function () {
                if (parent) {
                    return parent;
                }
                else {
                    if (this.parentDescriptor) {
                        this.parentDescriptor.ensureParent();
                        if (!this.parentDescriptor.parent[this.parentDescriptor.keyProp]) {
                            this.parentDescriptor.parent[this.parentDescriptor.keyProp] = {};
                            this.parent = this.parentDescriptor.parent[this.parentDescriptor.keyProp];
                        }
                    }
                }
            };
            Object.defineProperty(PropertyDescriptor.prototype, "propValue", {
                get: function () {
                    return getobject(this.parent, this.keyProp);
                },
                set: function (val) {
                    this.ensureParent();
                    setobject(this.parent, this.keyProp, val);
                },
                enumerable: true,
                configurable: true
            });
            return PropertyDescriptor;
        })();
        Utils.PropertyDescriptor = PropertyDescriptor;
        /**
         * return a propery descriptor for an object based on expression
         * @function WinJSContrib.Utils.getProperty
         * @param {Object} source the object containing data
         * @param {string[]} properties property descriptor. could be a string in js notation ex: 'myProp.myChildProp,
         * or an array of strings ['myProp', 'myChildProp']. String notation can contain indexers
         * @returns {Object} property descriptor
         */
        function getProperty(source, properties) {
            if (typeof properties == 'string') {
                properties = properties.split('.');
            }
            if (!properties || !properties.length) {
                properties = ['this'];
            }
            var parent = source;
            var previousDescriptor = null;
            for (var i = 0; i < properties.length; i++) {
                var descriptor = new PropertyDescriptor(parent, previousDescriptor, properties[i]);
                previousDescriptor = descriptor;
                if (i == properties.length - 1) {
                    return descriptor;
                }
                parent = getobject(parent, properties[i]);
            }
            return;
        }
        Utils.getProperty = getProperty;
        /**
         * Write property value on an object based on expression
         * @function WinJSContrib.Utils.writeProperty
         * @param {Object} source the object containing data
         * @param {string[]} properties property descriptor. could be a string in js notation ex: 'myProp.myChildProp,
         * or an array of strings ['myProp', 'myChildProp']. String notation can contain indexers
         * @param {Object} data data to feed to the property
         */
        function writeProperty(source, properties, data) {
            var prop = WinJSContrib.Utils.getProperty(source, properties);
            if (prop) {
                prop.propValue = data;
            }
        }
        Utils.writeProperty = writeProperty;
        /** generate a random value between two numbers
         * @function WinJSContrib.Utils.randomFromInterval
         * @param {number} from lower limit
         * @param {number} to upper limit
         * @returns {number}
         */
        function randomFromInterval(from, to) {
            return (Math.random() * (to - from + 1) + from) << 0;
        }
        Utils.randomFromInterval = randomFromInterval;
        /**
         * function to use as a callback for Array.sort when you want the array to be sorted alphabetically
         * @function WinJSContrib.Utils.alphabeticSort
         * @param {string} a
         * @param {string} b
         * @returns {number}
         */
        function alphabeticSort(a, b) {
            if (a > b)
                return 1;
            if (a < b)
                return -1;
            return 0;
        }
        Utils.alphabeticSort = alphabeticSort;
        /**
         * generate an array with only distinct elements
         * @function WinJSContrib.Utils.distinctArray
         * @param {Array} array
         * @param {string} path to array's item property used for checking items
         * @param {boolean} ignorecase indicate if comparison should ignore case when using string
         * @returns {Array}
         */
        function distinctArray(array, property, ignorecase) {
            if (array === null || array.length === 0)
                return array;
            if (typeof ignorecase == "undefined")
                ignorecase = false;
            var sMatchedItems = "";
            var foundCounter = 0;
            var newArray = [];
            var sFind;
            var i;
            if (ignorecase) {
                for (i = 0; i < array.length; i++) {
                    if (property) {
                        var data = WinJSContrib.Utils.readProperty(array[i], property.split('.'));
                        sFind = data;
                        if (!data)
                            sFind = data;
                        if (data && data.toLowerCase)
                            sFind = data.toLowerCase();
                    }
                    else {
                        sFind = array[i];
                    }
                    if (sMatchedItems.indexOf("|" + sFind + "|") < 0) {
                        sMatchedItems += "|" + sFind + "|";
                        newArray[foundCounter++] = array[i];
                    }
                }
            }
            else {
                for (i = 0; i < array.length; i++) {
                    if (property) {
                        sFind = WinJSContrib.Utils.readProperty(array[i], property.split('.'));
                    }
                    else {
                        sFind = array[i];
                    }
                    if (sMatchedItems.indexOf("|" + sFind + "|") < 0) {
                        sMatchedItems += "|" + sFind + "|";
                        newArray[foundCounter++] = array[i];
                    }
                }
            }
            return newArray;
        }
        Utils.distinctArray = distinctArray;
        /**
         * get distinct values from an array of items
         * @function WinJSContrib.Utils.getDistinctPropertyValues
         * @param {Array} array items array
         * @param {string} property property path for values
         * @param {boolean} ignorecase ignore case for comparisons
         */
        function getDistinctPropertyValues(array, property, ignorecase) {
            return Utils.distinctArray(array, property, ignorecase).map(function (item) {
                return WinJSContrib.Utils.readProperty(item, property.split('.'));
            });
        }
        Utils.getDistinctPropertyValues = getDistinctPropertyValues;
        /**
         * Remove all accented characters from a string and replace them with their non-accented counterpart for ex: replace "é" with "e"
         * @function WinJSContrib.Utils.removeAccents
         * @param {string} s
         * @returns {string}
         */
        function removeAccents(s) {
            var r = s.toLowerCase();
            r = r.replace(new RegExp("[àáâãäå]", 'g'), "a");
            r = r.replace(new RegExp("æ", 'g'), "ae");
            r = r.replace(new RegExp("ç", 'g'), "c");
            r = r.replace(new RegExp("[èéêë]", 'g'), "e");
            r = r.replace(new RegExp("[ìíîï]", 'g'), "i");
            r = r.replace(new RegExp("ñ", 'g'), "n");
            r = r.replace(new RegExp("[òóôõö]", 'g'), "o");
            r = r.replace(new RegExp("œ", 'g'), "oe");
            r = r.replace(new RegExp("[ùúûü]", 'g'), "u");
            r = r.replace(new RegExp("[ýÿ]", 'g'), "y");
            return r;
        }
        Utils.removeAccents = removeAccents;
        /**
         * remove a page from navigation history
         * @function WinJSContrib.Utils.removePageFromHistory
         * @param {string} pageLocation page url
         */
        function removePageFromHistory(pageLoc) {
            var history = [];
            if (WinJS.Navigation.history && WinJS.Navigation.history.backStack && WinJS.Navigation.history.backStack.length) {
                WinJS.Navigation.history.backStack.forEach(function (page) {
                    if (page.location !== pageLoc) {
                        history.push(page);
                    }
                });
            }
            WinJS.Navigation.history.backStack = history;
        }
        Utils.removePageFromHistory = removePageFromHistory;
        /**
         * format a number on 2 digits
         * @function WinJSContrib.Utils.pad2
         * @param {number} number
         */
        function pad2(number) {
            return (number < 10 ? '0' : '') + number;
        }
        Utils.pad2 = pad2;
        /**
         * truncate a string and add ellipse if text if greater than certain size
         * @function WinJSContrib.Utils.ellipsisizeString
         * @param {string} text text to truncate
         * @param {number} maxSize maximum size for text
         * @param {boolean} useWordBoundary indicate if truncate should happen on the closest word boundary (like space)
         */
        function ellipsisizeString(text, maxSize, useWordBoundary) {
            if (!text) {
                return '';
            }
            var toLong = text.length > maxSize, text_ = toLong ? text.substr(0, maxSize - 1) : text;
            text_ = useWordBoundary && toLong ? text_.substr(0, text_.lastIndexOf(' ')) : text_;
            return toLong ? text_ + '...' : text_;
        }
        Utils.ellipsisizeString = ellipsisizeString;
        /**
         * generate a new Guid
         * @function WinJSContrib.Utils.guid
         * @returns {string}
         */
        function guid() {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
            });
            return uuid;
        }
        Utils.guid = guid;
        /**
         * inherit property from parent WinJS controls
         * @function WinJSContrib.Utils.inherit
         * @param {HTMLElement} element
         * @param {string} property property name
         */
        function inherit(element, property) {
            if (element && element.parentElement) {
                var current = element.parentElement;
                while (current) {
                    if (current.winControl) {
                        if (current.winControl[property] !== undefined) {
                            return current.winControl[property];
                        }
                    }
                    current = current.parentElement;
                }
            }
        }
        Utils.inherit = inherit;
        /**
         * move DOM childrens form one node to the other
         * @function WinJSContrib.Utils.moveChilds
         * @param {HTMLElement} source source node containing elements to move
         * @param {HTMLElement} target target node for moved elements
         */
        function moveChilds(source, target) {
            if (!source || !target)
                return;
            var childs = [];
            for (var i = 0; i < source.childNodes.length; i++) {
                childs.push(source.childNodes[i]);
            }
            childs.forEach(function (elt) {
                target.appendChild(elt);
            });
        }
        Utils.moveChilds = moveChilds;
        /**
         * get parent control identifyed by a property attached on DOM element
         * @function WinJSContrib.Utils.getParent
         * @param {string} property property attached to control's DOM element, for ex: msParentSelectorScope
         * @param {HTMLElement} element DOM element to scan
         * @returns {Object} WinJS control
         */
        function getParent(property, element) {
            if (!element)
                return;
            var current = element.parentNode;
            while (current) {
                if (current[property] && current.winControl) {
                    return current.winControl;
                }
                current = current.parentNode;
            }
        }
        Utils.getParent = getParent;
        /**
         * get parent control identifyed by a css class
         * @function WinJSContrib.Utils.getParentControlByClass
         * @param {string} className css class name
         * @param {HTMLElement} element DOM element to scan
         * @returns {Object} WinJS control
         */
        function getParentControlByClass(className, element) {
            if (!element)
                return;
            var current = element.parentNode;
            while (current) {
                if (current.classList && current.classList.contains(className) && current.winControl) {
                    return current.winControl;
                }
                current = current.parentNode;
            }
        }
        Utils.getParentControlByClass = getParentControlByClass;
        /**
         * get parent page control (work only with WinJSContrib.UI.PageControlNavigator
         * @function WinJSContrib.Utils.getParentPage
         * @param {HTMLElement} element DOM element to scan
         * @returns {Object} WinJS control
         */
        function getParentPage(element) {
            return WinJSContrib.Utils.getParent('mcnPage', element);
        }
        Utils.getParentPage = getParentPage;
        /**
         * get parent scope control (based on msParentSelectorScope)
         * @function WinJSContrib.Utils.getScopeControl
         * @param {HTMLElement} element DOM element to scan
         * @returns {Object} WinJS control
         */
        function getScopeControl(element) {
            var current = element.parentNode;
            while (current) {
                if (current.msParentSelectorScope) {
                    var scope = current.parentNode;
                    if (scope) {
                        var scopeControl = scope.winControl;
                        if (scopeControl) {
                            return scopeControl;
                        }
                    }
                }
                current = current.parentNode;
            }
        }
        Utils.getScopeControl = getScopeControl;
        /**
         * get WinJS.Binding.Template like control from a path, a control, a function or a DOM element
         * @function WinJSContrib.Utils.getTemplate
         * @param {Object} template template input
         * @returns {Object} WinJS.Binding.Template or template-like object (object with a render function)
         */
        function getTemplate(template) {
            if (template) {
                var templatetype = typeof template;
                if (templatetype == 'string') {
                    return new WinJS.Binding.Template(null, { href: template });
                }
                if (templatetype == 'function') {
                    return {
                        render: function (data, elt) {
                            var res = template(data, elt);
                            return WinJS.Promise.as(res);
                        }
                    };
                }
                else if (template.winControl) {
                    return template.winControl;
                }
                else if (template.render) {
                    return template;
                }
            }
        }
        Utils.getTemplate = getTemplate;
        /**
         * get a function from an expression, for example 'page:myAction' will return the myAction function from the parent page.
         * The returned function will be bound to it's owner. This function relies on {link WinJSContrib.Utils.resolveValue}, see this for details about how data are crawled
         * @function WinJSContrib.Utils.resolveMethod
         * @param {HTMLElement} element DOM element to look
         * @param {string} text expression like 'page:something' or 'ctrl:something' or 'something'
         * @returns {function}
         */
        function resolveMethod(element, text) {
            var res = WinJSContrib.Utils.resolveValue(element, text);
            if (res && typeof res == 'function')
                return res;
            return undefined;
        }
        Utils.resolveMethod = resolveMethod;
        function readValue(element, text) {
            var res = WinJSContrib.Utils.resolveValue(element, text);
            if (res) {
                if (typeof res == 'function')
                    return res(element);
                else
                    return res;
            }
            return undefined;
        }
        Utils.readValue = readValue;
        /**
         * Utility functions used by WinJSContrib.Utils.resolveValue and WinJSContrib.Utils.applyValue
         * @namespace WinJSContrib.Utils.ValueParsers
         */
        Utils.ValueParsers = {
            /**
             * Get value from current page in parent navigator
             * @function WinJSContrib.Utils.ValueParsers.navpage
             */
            "navpage": function (element, text, context) {
                var control = (context && context.data) ? context.data.navpage : null;
                if (!control) {
                    if (WinJSContrib.Utils.getParentPage) {
                        control = WinJSContrib.Utils.getParentPage(element);
                        if (context && context.data)
                            context.data.navpage = control;
                    }
                    if (!control && WinJSContrib.UI.Application.navigator) {
                        control = WinJSContrib.UI.Application.navigator.pageControl;
                        if (context && context.data)
                            context.data.navpage = control;
                    }
                }
                if (!control)
                    return;
                if (context)
                    context.parentControl = control;
                var method = WinJSContrib.Utils.readProperty(control, text);
                if (method && typeof method === 'function')
                    return method.bind(control);
                else
                    return method;
            },
            /**
             * Get value from parent element with 'pagecontrol' class
             * @function WinJSContrib.Utils.ValueParsers.page
             */
            "page": function (element, text, context) {
                var control = (context && context.data) ? context.data.page : null;
                if (!control) {
                    control = WinJSContrib.Utils.getParentControlByClass('pagecontrol', element);
                    if (context && context.data)
                        context.data.page = control;
                }
                if (!control)
                    return;
                if (context)
                    context.parentControl = control;
                var method = WinJSContrib.Utils.readProperty(control, text);
                if (method && typeof method === 'function')
                    return method.bind(control);
                else
                    return method;
            },
            /**
             * Get value from parent scope
             * @function WinJSContrib.Utils.ValueParsers.ctrl
             */
            "ctrl": function (element, text, context) {
                var control = (context && context.data) ? context.data.scope : null;
                if (!control) {
                    control = WinJSContrib.Utils.getScopeControl(element);
                    if (context && context.data)
                        context.data.scope = control;
                }
                if (!control)
                    return;
                if (context)
                    context.parentControl = control;
                var method = WinJSContrib.Utils.readProperty(control, text);
                if (method && typeof method === 'function')
                    return method.bind(control);
                else
                    return method;
            },
            /**
             * select a node from DOM
             * @function WinJSContrib.Utils.ValueParsers.select
             */
            "select": function (element, text, context) {
                var control = (context && context.data) ? context.data.scope : null;
                if (!control) {
                    control = WinJSContrib.Utils.getScopeControl(element);
                    if (context && context.data)
                        context.data.scope = control;
                }
                var element = null;
                var items = text.split('|');
                var selector = items[0];
                if (control) {
                    element = control.element.querySelector(selector);
                }
                if (!element)
                    element = document.querySelector(selector);
                if (items.length == 1) {
                    return element;
                }
                else if (items.length > 1) {
                    var val = readProperty(element, text.substr(items[0].length + 1));
                    return val;
                }
            },
            /**
             * get an object formatted as JSON
             * @function WinJSContrib.Utils.ValueParsers.obj
             */
            "obj": function (element, text, context) {
                return WinJS.UI.optionsParser(text, window, {
                    select: WinJS.Utilities.markSupportedForProcessing(function (text) {
                        var parent = WinJSContrib.Utils.getScopeControl(element);
                        if (parent) {
                            return parent.element.querySelector(text);
                        }
                        else {
                            return document.querySelector(text);
                        }
                    })
                });
            },
            /**
             * mark a promise for resolution (if used in applyValue, the promise will get resolved and the promise's result will be affected)
             * @function WinJSContrib.Utils.ValueParsers.prom
             */
            "prom": function (element, text, context) {
                var res = resolveValue(element, text, context);
                if (res.then) {
                    res = res.then(null, null);
                    res.mcnMustResolve = true;
                }
                return res;
            },
            /**
             * wrap result in WinJS.Binding.List().dataSource
             * usefull for ListViews
             * @function WinJSContrib.Utils.ValueParsers.list
             */
            "list": function (element, text, context) {
                var res = resolveValue(element, text, context);
                if (res) {
                    if (res.then) {
                        var p = res.then(function (data) {
                            return new WinJS.Binding.List(data).dataSource;
                        });
                        p.mcnMustResolve = true;
                        return p;
                    }
                    return new WinJS.Binding.List(res).dataSource;
                }
            },
            /**
             * get value from global scope
             * @function WinJSContrib.Utils.ValueParsers.global
             */
            "global": function (element, text, context) {
                return WinJSContrib.Utils.readProperty(window, text);
            },
            /**
             * get a template from uri
             * @function WinJSContrib.Utils.ValueParsers.templ
             */
            "templ": function (element, text, context) {
                return WinJSContrib.Templates.get(text);
            },
            /**
             * return element property
             * @function WinJSContrib.Utils.ValueParsers.element
             */
            "element": function (element, text, context) {
                var res = resolveValue(element, text, context);
                if (res)
                    return res.element;
            },
            "event": function (element, text, context) {
                var res = resolveValue(element, text, context);
                var parentControl = null;
                if (!res || !context || !context.name) {
                    return;
                }
                if (context)
                    parentControl = context.parentControl;
                if (res && typeof res === 'function') {
                    if (parentControl && parentControl.eventTracker) {
                        parentControl.eventTracker.addEvent(context.control, context.name, res);
                    }
                    else {
                        context.control.addEventListener(context.name, res);
                    }
                }
            }
        };
        /**
         * resolve value from an expression. This helper will crawl the DOM up, and provide the property or function from parent page or control.
         * @function WinJSContrib.Utils.resolveValue
         * @param {HTMLElement} element DOM element to look
         * @param {string} text expression like 'page:something' or 'ctrl:something' or 'something'
         * @returns {Object}
         */
        function resolveValue(element, text, context) {
            var methodName, control, method;
            var items = text.split(':');
            if (items.length > 1) {
                var name = items[0];
                var val = text.substr(name.length + 1);
                var parser = Utils.ValueParsers[name];
                if (parser) {
                    return parser(element, val, context);
                }
            }
            return text; //WinJSContrib.Utils.readProperty(window, text);
        }
        Utils.resolveValue = resolveValue;
        /**
         * call resolve value and apply result to a target object
         * @function WinJSContrib.Utils.applyValue
         * @param {HTMLElement} element DOM element to look
         * @param {string} text expression like 'page:something' or 'ctrl:something' or 'something'
         * @param {string} target target object
         * @param {string} targetPath path to dest property
         */
        function applyValue(element, text, target, targetPath, context) {
            var tmp = WinJSContrib.Utils.resolveValue(element, text, context);
            if (tmp && tmp.then && tmp.mcnMustResolve) {
                tmp.then(function (data) {
                    WinJSContrib.Utils.writeProperty(target, targetPath, data);
                });
            }
            else {
                WinJSContrib.Utils.writeProperty(target, targetPath, tmp);
            }
        }
        Utils.applyValue = applyValue;
        /**
         * Checks in a safe way if an object has a value, which could be 'false', '0' or '""'
         * @function WinJSContrib.Utils.hasValue
         * @param {Object} item The object to check.
         * @returns {Boolean} Whether the object has a value or not.
         */
        function hasValue(item) {
            return typeof item !== "undefined" && item !== null;
        }
        Utils.hasValue = hasValue;
        /**
         * format error from an xhr call
         * @function WinJSContrib.Utils.formatXHRError
         */
        function formatXHRError(xhr) {
            return "{0} - {1}: {2}".format(xhr.status, xhr.statusText, xhr.responseText);
        }
        Utils.formatXHRError = formatXHRError;
        /**
         * Unwraps the real error from a WinJS.Promise.join operation, which by design returns an array with 'undefined' for all cells,
         * excepts the one corresponding to the promise that really faulted.
         * @function WinJSContrib.Utils.unwrapJoinError
         * @param {function} errorCallback The callback to use to handle the error.
         * @returns {Function} The result of the callback being fired with the real error.
         */
        function unwrapJoinError(errorCallback) {
            return function (errorArray) {
                var unwrappedError = null;
                for (var i = 0; i < errorArray.length; i++) {
                    var tentativeError = errorArray[i];
                    if (typeof tentativeError !== "undefined") {
                        unwrappedError = tentativeError;
                        break;
                    }
                }
                return errorCallback(unwrappedError);
            };
        }
        Utils.unwrapJoinError = unwrapJoinError;
        /**
         * inject properties from source object to target object
         * @function WinJSContrib.Utils.inject
         */
        function inject(target, source) {
            if (source) {
                for (var k in source) {
                    target[k] = source[k];
                }
            }
        }
        Utils.inject = inject;
    })(Utils = WinJSContrib.Utils || (WinJSContrib.Utils = {}));
})(WinJSContrib || (WinJSContrib = {}));
/**
 * @namespace WinJSContrib.Templates
 */
var WinJSContrib;
(function (WinJSContrib) {
    var Templates;
    (function (Templates) {
        var cache = {};
        /**
         * get a template from it's path
         * @function get
         * @memberof WinJSContrib.Templates
         * @param {string} uri path to template file
         * @returns {WinJS.Binding.Template} template object
         */
        function get(uri) {
            var template = cache[uri];
            if (cache[uri])
                return template;
            return new WinJS.Binding.Template(null, { href: uri });
        }
        Templates.get = get;
        /**
         * get a template and turn it to a rendering function that takes an item promise, and return a DOM element
         * @function WinJSContrib.Templates.interactive
         * @param {string} uri path to template file
         * @param {Object} args definition of interactive elements
         * @returns {function} rendering function that takes an item promise, and return a DOM element
         */
        function interactive(uri, args) {
            var template = WinJSContrib.Templates.get(uri);
            if (template) {
                return WinJSContrib.Templates.makeInteractive(template, args);
            }
            else {
                throw { message: 'template not found for ' + uri };
            }
        }
        Templates.interactive = interactive;
        /**
         * generate a rendering function that takes an item promise, and return a DOM element
         * @function WinJSContrib.Templates.get
         * @param {WinJS.Binding.Template} template template object
         * @param {Object} args definition of interactive elements
         * @returns {function} rendering function that takes an item promise, and return a DOM element
         */
        function makeInteractive(template, args) {
            return function (itemPromise) {
                return itemPromise.then(function (item) {
                    return template.render(item).then(function (rendered) {
                        if (args.tap) {
                            for (var n in args.tap) {
                                var elt = rendered.querySelector(n);
                                WinJSContrib.UI.tap(elt, function (arg) {
                                    args.tap[n](arg, item);
                                });
                            }
                        }
                        if (args.click) {
                            for (var n in args.click) {
                                var elt = rendered.querySelector(n);
                                elt.onclick = function (arg) {
                                    args.click[n](arg, item);
                                };
                            }
                        }
                        return rendered;
                    });
                });
            };
        }
        Templates.makeInteractive = makeInteractive;
    })(Templates = WinJSContrib.Templates || (WinJSContrib.Templates = {}));
})(WinJSContrib || (WinJSContrib = {}));

var WinJSContrib;
(function (WinJSContrib) {
    var UI;
    (function (UI) {
        UI.Application = {};
        /**
         * indicate if fragment should not look for resources when building control
         * @field WinJSContrib.UI.disableAutoResources
         * @type {boolean}
         */
        UI.disableAutoResources = false;
        /**
         * Calculate offset of element relative to parent element. If parent parameter is null, offset is relative to document
         * @function WinJSContrib.UI.offsetFrom
         * @param {HTMLElement} element element to evaluate
         * @param {HTMLElement} parent reference of offset
         */
        function offsetFrom(element, parent) {
            var xPosition = 0;
            var yPosition = 0;
            var w = element.clientWidth;
            var h = element.clientHeight;
            while (element && element != parent) {
                xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
                yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
                element = element.offsetParent;
            }
            return { x: xPosition, y: yPosition, width: w, height: h };
        }
        UI.offsetFrom = offsetFrom;
        var EventTracker = (function () {
            /**
             * @class WinJSContrib.UI.EventTracker
             * @classdesc object to register and release events from addEventListener or bind
             */
            function EventTracker() {
                this.events = [];
            }
            /**
             * register an event from an object
             * @function WinJSContrib.UI.EventTracker.prototype.addEvent
             * @param {Object} e object containing addEventListener
             * @param {string} eventName name of the event
             * @param {function} handler
             * @param {boolean} capture
             * @returns {function} function to call for unregistering the event
             */
            EventTracker.prototype.addEvent = function (e, eventName, handler, capture) {
                var tracker = this;
                e.addEventListener(eventName, handler, capture);
                var unregister = function () {
                    try {
                        e.removeEventListener(eventName, handler);
                        var idx = tracker.events.indexOf(unregister);
                        if (idx >= 0) {
                            tracker.events.splice(idx, 1);
                        }
                    }
                    catch (exception) {
                        console.error('unexpected error while releasing callback ' + exception.message);
                    }
                };
                this.events.push(unregister);
                return unregister;
            };
            /**
             * register binding event
             * @function WinJSContrib.UI.EventTracker.prototype.addBinding
             * @param {Object} e object containing bind method
             * @param {string} eventName name of the binding event
             * @param {function} handler
             */
            EventTracker.prototype.addBinding = function (e, eventName, handler) {
                e.bind(eventName, handler);
                var unregister = function () {
                    e.unbind(eventName, handler);
                };
                this.events.push(unregister);
                return unregister;
            };
            /**
             * release all registered events
             * @function WinJSContrib.UI.EventTracker.prototype.dispose
             */
            EventTracker.prototype.dispose = function () {
                for (var i = 0; i < this.events.length; i++) {
                    this.events[i]();
                }
                this.events = [];
            };
            return EventTracker;
        })();
        UI.EventTracker = EventTracker;
        /**
         * open all appbars
         * @function WinJSContrib.UI.appbarsOpen
         */
        function appbarsOpen() {
            var res = document.querySelectorAll('div[data-win-control="WinJS.UI.AppBar"],div[data-win-control="WinJS.UI.NavBar"]');
            if (res && res.length) {
                for (var i = 0; i < res.length; i++) {
                    var e = res[i];
                    if (e.winControl) {
                        e.winControl.show();
                    }
                }
            }
        }
        UI.appbarsOpen = appbarsOpen;
        /**
         * close all appbars
         * @function WinJSContrib.UI.appbarsClose
         */
        function appbarsClose() {
            var res = document.querySelectorAll('div[data-win-control="WinJS.UI.AppBar"],div[data-win-control="WinJS.UI.NavBar"]');
            if (res && res.length) {
                for (var i = 0; i < res.length; i++) {
                    var e = res[i];
                    if (e.winControl) {
                        e.winControl.hide();
                    }
                }
            }
        }
        UI.appbarsClose = appbarsClose;
        /**
         * disable all appbars
         * @function WinJSContrib.UI.appbarsDisable
         */
        function appbarsDisable() {
            var res = document.querySelectorAll('div[data-win-control="WinJS.UI.AppBar"],div[data-win-control="WinJS.UI.NavBar"]');
            if (res && res.length) {
                for (var i = 0; i < res.length; i++) {
                    var e = res[i];
                    if (e.winControl) {
                        e.winControl.disabled = true;
                    }
                }
            }
        }
        UI.appbarsDisable = appbarsDisable;
        /**
         * enable all appbars
         * @function WinJSContrib.UI.appbarsEnable
         */
        function appbarsEnable() {
            var elements = document.querySelectorAll('div[data-win-control="WinJS.UI.AppBar"],div[data-win-control="WinJS.UI.NavBar"]');
            if (elements && elements.length) {
                for (var i = 0, l = elements.length; i < l; i++) {
                    var el = elements[i];
                    if (el.winControl) {
                        el.winControl.disabled = false;
                    }
                }
            }
        }
        UI.appbarsEnable = appbarsEnable;
        /**
         * build a promise around element "load" event (work for all element with src property like images, iframes, ...)
         * @function WinJSContrib.UI.elementLoaded
         * @param {HTMLElement} element
         * @param {string} url url used to feed "src" on element
         * @returns {WinJS.Promise}
         */
        function elementLoaded(elt, url) {
            return new WinJS.Promise(function (complete, error) {
                function onerror(e) {
                    elt.onload = undefined;
                    elt.onerror = undefined;
                    elt.onreadystatechange = undefined;
                    error('element not loaded');
                }
                function onload(e) {
                    elt.onload = undefined;
                    elt.onerror = undefined;
                    elt.onreadystatechange = undefined;
                    complete({
                        element: elt,
                        url: url
                    });
                }
                elt.onerror = onerror;
                elt.onload = onload;
                elt.onreadystatechange = onload;
                if (elt.naturalWidth > 0) {
                    onload(undefined);
                }
                elt.src = url;
            });
        }
        UI.elementLoaded = elementLoaded;
        /**
         * Create a promise for getting an image object from url
         * @function WinJSContrib.UI.loadImage
         * @param {string} imgUrl url for the picture
         * @returns {WinJS.Promise}
         */
        function loadImage(imgUrl) {
            return new WinJS.Promise(function (complete, error) {
                var image = new Image();
                function onerror(e) {
                    image.onload = undefined;
                    image.onerror = undefined;
                    error({ message: 'image not loaded : ' + imgUrl, path: imgUrl });
                }
                function onload(e) {
                    image.onload = undefined;
                    image.onerror = undefined;
                    complete({
                        element: image,
                        url: imgUrl
                    });
                }
                image.onerror = onerror;
                image.onload = onload;
                if (image.naturalWidth > 0) {
                    onload(undefined);
                }
                image.src = imgUrl;
            });
        }
        UI.loadImage = loadImage;
        /**
         * List all elements found after provided element
         * @function WinJSContrib.UI.listElementsAfterMe
         * @param {HTMLElement} elt target element
         * @returns {Array} list of sibling elements
         */
        function listElementsAfterMe(elt) {
            var res = [];
            var passed = false;
            if (elt.parentElement) {
                var parent = elt.parentElement;
                for (var i = 0; i < parent.children.length; i++) {
                    if (parent.children[i] === elt) {
                        passed = true;
                    }
                    else if (passed) {
                        res.push(parent.children[i]);
                    }
                }
            }
            return res;
        }
        UI.listElementsAfterMe = listElementsAfterMe;
        /**
         * create an animation for removing an element from a list
         * @function WinJSContrib.UI.removeElementAnimation
         * @param {HTMLElement} element that will be removed
         * @returns {WinJS.Promise}
         */
        function removeElementAnimation(elt) {
            return new WinJS.Promise(function (complete, error) {
                var remainings = WinJSContrib.UI.listElementsAfterMe(elt);
                var anim = WinJS.UI.Animation.createDeleteFromListAnimation([
                    elt
                ], remainings);
                elt.style.position = "fixed";
                elt.style.opacity = '0';
                anim.execute().done(function () {
                    complete(elt);
                });
            });
        }
        UI.removeElementAnimation = removeElementAnimation;
        function bindAction(el, element, control) {
            if (!el)
                return;
            el.classList.add('page-action');
            var actionName = el.dataset.pageAction || el.getAttribute('tap');
            var action = control[actionName];
            if (action && typeof action === 'function') {
                WinJSContrib.UI.tap(el, function (eltarg) {
                    var p = WinJS.Promise.wrap(actionArgs);
                    var actionArgs = eltarg.dataset.pageActionArgs || el.getAttribute('tap-args');
                    if (actionArgs && typeof actionArgs == 'string') {
                        var tmp = WinJSContrib.Utils.readValue(eltarg, actionArgs);
                        p = WinJS.Promise.as(tmp).then(function (val) {
                            if (typeof val === 'string') {
                                try {
                                    val = WinJS.UI.optionsParser(val, window);
                                }
                                catch (exception) {
                                    return;
                                }
                            }
                            return val;
                        });
                        if (tmp) {
                            actionArgs = tmp;
                        }
                    }
                    return p.then(function (arg) {
                        return control[actionName].bind(control)({ elt: eltarg, args: arg });
                    });
                });
            }
        }
        /**
         * setup declarative binding to parent control function. It looks for "data-page-action" attributes,
         * and try to find a matching method on the supplyed control.
         * You could add arguments with a "page-action-args" attribute. The argument can be an object or a function
         * @function WinJSContrib.UI.bindPageActions
         * @param {HTMLElement} element root node crawled for page actions
         * @param {Object} control control owning functions to call
         */
        function bindPageActions(element, control) {
            var elements = element.querySelectorAll('*[data-page-action], *[tap]');
            if (elements && elements.length) {
                for (var i = 0, l = elements.length; i < l; i++) {
                    var el = elements[i];
                    bindAction(el, element, control);
                }
            }
        }
        UI.bindPageActions = bindPageActions;
        function bindLink(el, element) {
            if (!el)
                return;
            el.classList.add('page-link');
            var applink = el.getAttribute('applink');
            var target = el.dataset.pageLink || el.getAttribute('linkto');
            if (target && target.indexOf('/') < 0) {
                var tmp = WinJSContrib.Utils.readProperty(window, target);
                if (tmp) {
                    target = tmp;
                }
            }
            if (target) {
                var options = el.dataset.pageActionOptions || el.getAttribute('tap-options');
                if (options) {
                    try {
                        options = WinJS.UI.optionsParser(options, window);
                    }
                    catch (exception) {
                        return;
                    }
                }
                WinJSContrib.UI.tap(el, function (eltarg) {
                    var p = WinJS.Promise.wrap();
                    var actionArgs = eltarg.dataset.pageActionArgs || el.getAttribute('linkto-args');
                    if (actionArgs && typeof actionArgs == 'string') {
                        var tmp = WinJSContrib.Utils.readValue(eltarg, actionArgs);
                        p = WinJS.Promise.as(tmp).then(function (val) {
                            if (typeof val === 'string') {
                                try {
                                    val = WinJS.UI.optionsParser(val, window);
                                }
                                catch (exception) {
                                }
                            }
                            return val;
                        });
                    }
                    return p.then(function (actionArgs) {
                        if (!applink && WinJSContrib.UI.parentNavigator && WinJSContrib.UI.parentNavigator(eltarg)) {
                            var nav = WinJSContrib.UI.parentNavigator(eltarg);
                            return nav.navigate(target, actionArgs);
                        }
                        else {
                            return WinJS.Navigation.navigate(target, actionArgs);
                        }
                    });
                }, options);
            }
        }
        /**
         * setup declarative binding to page link. It looks for "data-page-link" attributes.
         * If any the content of the attribute point toward a page. clicking that element will navigate to that page.
         * You could add arguments with a "page-action-args" attribute. The argument can be an object or a function
         * @function WinJSContrib.UI.bindPageLinks
         * @param {HTMLElement} element root node crawled for page actions
         */
        function bindPageLinks(element) {
            var elements = element.querySelectorAll('*[data-page-link], *[linkto]');
            if (elements && elements.length) {
                for (var i = 0, l = elements.length; i < l; i++) {
                    var el = elements[i];
                    bindLink(el, element);
                }
            }
        }
        UI.bindPageLinks = bindPageLinks;
        function parentNavigator(element) {
            var current = element.parentNode;
            while (current) {
                if (current.mcnNavigator) {
                    return current.winControl;
                }
                current = current.parentNode;
            }
        }
        UI.parentNavigator = parentNavigator;
        function bindMember(el, element, control) {
            if (!el)
                return;
            el.classList.add('page-member');
            var memberName = el.dataset.pageMember || el.getAttribute('member');
            if (!memberName)
                memberName = el.id;
            if (memberName && !control[memberName]) {
                control[memberName] = el;
                if (el.winControl) {
                    control[memberName] = el.winControl;
                }
            }
        }
        /**
         * Add this element or control as member to the control. It looks for "data-page-member" attributes. If attribute is empty, it tooks the element id as member name.
         * @function WinJSContrib.UI.bindMembers
         * @param {HTMLElement} element root node crawled for page actions
         * @param {Object} control control owning functions to call
         */
        function bindMembers(element, control) {
            var elements = element.querySelectorAll('*[data-page-member], *[member]');
            if (elements && elements.length) {
                for (var i = 0, l = elements.length; i < l; i++) {
                    var el = elements[i];
                    bindMember(el, element, control);
                }
            }
        }
        UI.bindMembers = bindMembers;
        /**
         * setup declarative binding to parent control function and to navigation links. It internally invoke both {@link WinJSContrib.UI.bindPageActions} and {@link WinJSContrib.UI.bindPageLinks}
         * @function WinJSContrib.UI.bindActions
         * @param {HTMLElement} element root node crawled for page actions
         * @param {Object} control control owning functions to call
         */
        function bindActions(element, control) {
            WinJSContrib.UI.bindPageActions(element, control);
            WinJSContrib.UI.bindPageLinks(element);
        }
        UI.bindActions = bindActions;
        /**
         * Trigger events on media queries. This class is usefull as a component for other controls to change some properties based on media queries
         * @class WinJSContrib.UI.MediaTrigger
         * @param {Object} items object containing one property for each query
         * @param {Object} linkedControl control linked to media trigger
         */
        var MediaTrigger = (function () {
            function MediaTrigger(items, linkedControl) {
                var ctrl = this;
                ctrl.queries = [];
                ctrl.linkedControl = linkedControl;
                for (var name in items) {
                    var e = items[name];
                    if (e.query) {
                        ctrl.registerMediaEvent(name, e.query, e);
                    }
                }
            }
            /**
             * @function WinJSContrib.UI.MediaTrigger.prototype.dispose
             * release media trigger
             */
            MediaTrigger.prototype.dispose = function () {
                var ctrl = this;
                ctrl.linkedControl = null;
                this.queries.forEach(function (q) {
                    q.dispose();
                });
            };
            /**
             * register an event from a media query
             * @function WinJSContrib.UI.MediaTrigger.prototype.registerMediaEvent
             * @param {string} name event name
             * @param {string} query media query
             * @param {Object} data data associated with this query
             */
            MediaTrigger.prototype.registerMediaEvent = function (name, query, data) {
                var ctrl = this;
                var mq = window.matchMedia(query);
                var internalQuery = {
                    name: name,
                    query: query,
                    data: data,
                    mq: mq,
                    dispose: null
                };
                var f = function (arg) {
                    if (arg.matches) {
                        ctrl._mediaEvent(arg, internalQuery);
                    }
                };
                mq.addListener(f);
                internalQuery.dispose = function () {
                    mq.removeListener(f);
                };
                ctrl.queries.push(internalQuery);
            };
            MediaTrigger.prototype._mediaEvent = function (arg, query) {
                var ctrl = this;
                if (ctrl.linkedControl) {
                    WinJS.UI.setOptions(ctrl.linkedControl, query.data);
                }
                ctrl.dispatchEvent('media', query);
            };
            /**
             * @function WinJSContrib.UI.MediaTrigger.prototype.check
             * Check all registered queries
             */
            MediaTrigger.prototype.check = function () {
                var ctrl = this;
                ctrl.queries.forEach(function (q) {
                    var mq = window.matchMedia(q.query);
                    if (mq.matches) {
                        ctrl._mediaEvent({ matches: true }, q);
                    }
                });
            };
            /**
             * Adds an event listener to the control.
             * @function WinJSContrib.UI.MediaTrigger.prototype.addEventListener
             * @param type The type (name) of the event.
             * @param listener The listener to invoke when the event gets raised.
             * @param useCapture If true, initiates capture, otherwise false.
            **/
            MediaTrigger.prototype.addEventListener = function (type, listener, useCapture) {
            };
            /**
             * Raises an event of the specified type and with the specified additional properties.
             * @function WinJSContrib.UI.MediaTrigger.prototype.dispatchEvent
             * @param type The type (name) of the event.
             * @param eventProperties The set of additional properties to be attached to the event object when the event is raised.
             * @returns true if preventDefault was called on the event.
            **/
            MediaTrigger.prototype.dispatchEvent = function (type, eventProperties) {
                return false;
            };
            /**
             * Removes an event listener from the control.
             * @function WinJSContrib.UI.MediaTrigger.prototype.removeEventListener
             * @param type The type (name) of the event.
             * @param listener The listener to remove.
             * @param useCapture true if capture is to be initiated, otherwise false.
            **/
            MediaTrigger.prototype.removeEventListener = function (type, listener, useCapture) { };
            return MediaTrigger;
        })();
        UI.MediaTrigger = MediaTrigger;
        WinJS.Class.mix(WinJSContrib.UI.MediaTrigger, WinJS.Utilities.eventMixin);
        /**
         * register navigation related events like hardware backbuttons. This method keeps track of previously registered navigation handlers
         *  and disable them until the latests is closed, enablinh multi-level navigation.
         * @function WinJSContrib.UI.registerNavigationEvents
         * @param {Object} control control taking ownership of navigation handlers
         * @param {function} callback callback to invoke when "back" is requested
         * @returns {function} function to call for releasing navigation handlers
         */
        var registeredNavigationStack = [];
        function registerNavigationEvents(control, callback) {
            var locked = [];
            var registration = { control: control, callback: callback };
            registeredNavigationStack.push(registration);
            //control.navLocks = control.navLocks || [];
            //control.navLocks.isActive = true;
            var backhandler = function (arg) {
                var idx = registeredNavigationStack.indexOf(registration);
                if (idx === registeredNavigationStack.length - 1) {
                    registration.callback.bind(registration.control)(arg);
                    idx--;
                    while (idx >= 0 && !arg.handled) {
                        var tmp = registeredNavigationStack[idx];
                        tmp.callback.bind(tmp.control)(arg);
                        idx--;
                    }
                }
                //if (!control.navLocks || control.navLocks.length === 0) {
                //    callback.bind(control)(arg);
                //}
            };
            //var navcontrols = document.querySelectorAll('.mcn-navigation-ctrl');
            //for (var i = 0; i < navcontrols.length; i++) {
            //    var navigationCtrl = (<any>navcontrols[i]).winControl;
            //    if (navigationCtrl && navigationCtrl != control) {
            //        navigationCtrl.navLocks = navigationCtrl.navLocks || [];
            //        if (navigationCtrl.navLocks.isActive && (!navigationCtrl.navLocks.length || navigationCtrl.navLocks.indexOf(control) < 0)) {
            //            navigationCtrl.navLocks.push(control);
            //            locked.push(navigationCtrl);
            //        }
            //    }
            //}
            function cancelNavigation(args) {
                //this.eventTracker.addEvent(nav, 'beforenavigate', this._beforeNavigate.bind(this));
                var p = new WinJS.Promise(function (c) { });
                args.detail.setPromise(p);
                //setImmediate(function () {
                p.cancel();
                //});
            }
            WinJS.Navigation.addEventListener('beforenavigate', cancelNavigation);
            if (window.Windows && window.Windows.Phone)
                window.Windows.Phone.UI.Input.HardwareButtons.addEventListener("backpressed", backhandler);
            else
                document.addEventListener("backbutton", backhandler);
            var keypress = function (args) {
                if (args.key === "Esc" || args.key === "Backspace") {
                    backhandler(args);
                }
            };
            document.body.addEventListener('keypress', keypress);
            if (WinJSContrib.UI.Application && WinJSContrib.UI.Application.navigator)
                WinJSContrib.UI.Application.navigator.addLock();
            return function () {
                if (WinJSContrib.UI.Application && WinJSContrib.UI.Application.navigator)
                    WinJSContrib.UI.Application.navigator.removeLock();
                //control.navLocks.isActive = false;
                //locked.forEach(function (navigationCtrl) {
                //    var idx = navigationCtrl.navLocks.indexOf(control);
                //    if (idx >= 0)
                //        navigationCtrl.navLocks.splice(idx, 1);
                //});
                var idx = registeredNavigationStack.indexOf(registration);
                registeredNavigationStack.splice(idx, 1);
                document.body.removeEventListener('keypress', keypress);
                WinJS.Navigation.removeEventListener('beforenavigate', cancelNavigation);
                if (window.Windows && window.Windows.Phone)
                    window.Windows.Phone.UI.Input.HardwareButtons.removeEventListener("backpressed", backhandler);
                else
                    document.removeEventListener("backbutton", backhandler);
            };
        }
        UI.registerNavigationEvents = registerNavigationEvents;
        /**
         * remove tap behavior
         * @function WinJSContrib.UI.untap
         * @param {HtmlElement} element element to clean
         */
        function untap(element) {
            if (!element)
                return;
            if (element.mcnTapTracking) {
                element.mcnTapTracking.dispose();
                element.mcnTapTracking = null;
            }
        }
        UI.untap = untap;
        /**
         * remove tap behavior from all childs
         * @function WinJSContrib.UI.untapAll
         * @param {HtmlElement} element element to clean
         */
        function untapAll(element) {
            if (!element)
                return;
            var taps = element.querySelectorAll('.tap');
            for (var i = 0, l = taps.length; i < l; i++) {
                untap(taps[i]);
            }
        }
        UI.untapAll = untapAll;
        UI.defaultTapBehavior = {
            animDown: null,
            animUp: null,
            disableAnimation: false,
            awaitAnim: false,
            errorDelay: 3000
        };
        if (WinJS && WinJS.UI && WinJS.UI.Animation) {
            UI.defaultTapBehavior.animDown = WinJS.UI.Animation.pointerDown;
            UI.defaultTapBehavior.animUp = WinJS.UI.Animation.pointerUp;
        }
        /**
         * add tap behavior to an element, tap manages quirks like click delay, visual feedback, etc
         * @function WinJSContrib.UI.tap
         * @param {HtmlElement} element element to make "tappable"
         * @param {function} callback callback function invoked on tap
         * @param {Object} options tap options
         */
        function tap(element, callback, options) {
            if (!element)
                return;
            var ptDown = function (event) {
                var elt = event.currentTarget || event.target;
                var tracking = elt.mcnTapTracking;
                if (!elt.disabled && tracking && (event.button === undefined || event.button === 0 || (tracking.allowRickClickTap && event.button === 2))) {
                    if (tracking.lock) {
                        if (event.pointerId && event.currentTarget.setPointerCapture)
                            event.currentTarget.setPointerCapture(event.pointerId);
                        event.stopPropagation();
                        event.preventDefault();
                    }
                    WinJS.Utilities.addClass(elt, 'tapped');
                    WinJS.Utilities.removeClass(elt, 'tap-error');
                    clearTimeout(tracking.pendingErrorTimeout);
                    if (event.changedTouches) {
                        tracking.pointerdown = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
                    }
                    else {
                        tracking.pointerdown = { x: event.clientX, y: event.clientY };
                    }
                    tracking.animDown(event.currentTarget);
                    if (tracking.tapOnDown) {
                        tracking.callback(elt, event);
                    }
                }
            };
            var ptOut = function (event) {
                var elt = event.currentTarget || event.target;
                var tracking = elt.mcnTapTracking;
                if (tracking && tracking.pointerdown) {
                    WinJS.Utilities.removeClass(elt, 'tapped');
                    if (event.pointerId && elt.releasePointerCapture) {
                        try {
                            elt.releasePointerCapture(event.pointerId);
                        }
                        catch (exception) {
                            console.error(exception);
                        }
                    }
                    if (!tracking.disableAnimation)
                        tracking.animUp(event.currentTarget);
                }
            };
            var ptUp = function (event) {
                var elt = event.currentTarget || event.target;
                var tracking = elt.mcnTapTracking;
                if (tracking && (event.button === undefined || event.button === 0 || (tracking.allowRickClickTap && event.button === 2))) {
                    if (elt.releasePointerCapture) {
                        try {
                            elt.releasePointerCapture(event.pointerId);
                        }
                        catch (exception) {
                            console.error(exception);
                        }
                    }
                    if (tracking && !tracking.tapOnDown) {
                        event.stopPropagation();
                        var resolveTap = function () {
                            if (tracking && tracking.pointerdown) {
                                if (event.changedTouches) {
                                    var dX = Math.abs(tracking.pointerdown.x - event.changedTouches[0].clientX);
                                    var dY = Math.abs(tracking.pointerdown.y - event.changedTouches[0].clientY);
                                }
                                else {
                                    var dX = Math.abs(tracking.pointerdown.x - event.clientX);
                                    var dY = Math.abs(tracking.pointerdown.y - event.clientY);
                                }
                                if (tracking.callback && dX < 15 && dY < 15) {
                                    event.stopImmediatePropagation();
                                    event.stopPropagation();
                                    event.preventDefault();
                                    var res = tracking.callback(elt, event);
                                    if (res && WinJS.Promise.is(res)) {
                                        elt.disabled = true;
                                        WinJS.Utilities.addClass(elt, 'tap-working');
                                        res.then(function () {
                                            elt.disabled = false;
                                            WinJS.Utilities.removeClass(elt, 'tap-working');
                                        }, function (err) {
                                            elt.disabled = false;
                                            WinJS.Utilities.removeClass(elt, 'tap-working');
                                            console.error(err);
                                            WinJS.Application.queueEvent({ type: "mcn-taperror", error: err });
                                            WinJS.Utilities.addClass(elt, 'tap-error');
                                            if (tracking.errorDelay) {
                                                tracking.pendingErrorTimeout = setTimeout(function () {
                                                    tracking.pendingErrorTimeout = null;
                                                    WinJS.Utilities.removeClass(elt, 'tap-error');
                                                }, tracking.errorDelay);
                                            }
                                        });
                                    }
                                }
                                if (tracking && tracking.pointerdown)
                                    tracking.pointerdown = undefined;
                            }
                        };
                        if (tracking.awaitAnim) {
                            tracking.animUp(elt).done(resolveTap);
                        }
                        else {
                            tracking.animUp(elt);
                            resolveTap();
                        }
                    }
                    WinJS.Utilities.removeClass(elt, 'tapped');
                }
            };
            if (!options) {
                var attroptions = element.getAttribute('tap-options');
                if (attroptions) {
                    try {
                        options = WinJS.UI.optionsParser(attroptions, window);
                    }
                    catch (exception) {
                        return;
                    }
                }
            }
            var opt = options || {};
            if (element.mcnTapTracking) {
                element.mcnTapTracking.dispose();
            }
            WinJS.Utilities.addClass(element, 'tap');
            element.mcnTapTracking = element.mcnTapTracking || {};
            element.mcnTapTracking.eventTracker = new WinJSContrib.UI.EventTracker();
            element.mcnTapTracking.disableAnimation = opt.disableAnimation || UI.defaultTapBehavior.disableAnimation;
            if (element.mcnTapTracking.disableAnimation) {
                element.mcnTapTracking.animDown = function () { return WinJS.Promise.wrap(); };
                element.mcnTapTracking.animUp = function () { return WinJS.Promise.wrap(); };
            }
            else {
                element.mcnTapTracking.animDown = opt.animDown || UI.defaultTapBehavior.animDown;
                element.mcnTapTracking.animUp = opt.animUp || UI.defaultTapBehavior.animUp;
            }
            element.mcnTapTracking.element = element;
            element.mcnTapTracking.callback = callback;
            element.mcnTapTracking.lock = opt.lock;
            element.mcnTapTracking.awaitAnim = opt.awaitAnim || UI.defaultTapBehavior.awaitAnim;
            element.mcnTapTracking.errorDelay = opt.errorDelay || UI.defaultTapBehavior.errorDelay;
            element.mcnTapTracking.tapOnDown = opt.tapOnDown;
            element.mcnTapTracking.pointerModel = 'none';
            element.mcnTapTracking.dispose = function () {
                WinJS.Utilities.removeClass(element, 'tap');
                this.eventTracker.dispose();
                element.mcnTapTracking = null;
                element = null;
            };
            if (element.onpointerdown !== undefined) {
                element.mcnTapTracking.pointerModel = 'pointers';
                element.mcnTapTracking.eventTracker.addEvent(element, 'pointerdown', ptDown);
                element.mcnTapTracking.eventTracker.addEvent(element, 'pointerout', ptOut);
                element.mcnTapTracking.eventTracker.addEvent(element, 'pointerup', ptUp);
            }
            else if (window.Touch && !opt.noWebkitTouch) {
                element.mcnTapTracking.pointerModel = 'touch';
                element.mcnTapTracking.eventTracker.addEvent(element, 'touchstart', function (arg) {
                    element.mcnTapTracking.cancelMouse = true;
                    ptDown(arg);
                });
                element.mcnTapTracking.eventTracker.addEvent(element, 'touchcancel', function (arg) {
                    setTimeout(function () {
                        if (element && element.mcnTapTracking)
                            element.mcnTapTracking.cancelMouse = false;
                    }, 1000);
                    ptOut(arg);
                });
                element.mcnTapTracking.eventTracker.addEvent(element, 'touchend', function (arg) {
                    setTimeout(function () {
                        if (element && element.mcnTapTracking)
                            element.mcnTapTracking.cancelMouse = false;
                    }, 1000);
                    ptUp(arg);
                });
                element.mcnTapTracking.eventTracker.addEvent(element, 'mousedown', function (arg) {
                    if (!element.mcnTapTracking.cancelMouse)
                        ptDown(arg);
                });
                element.mcnTapTracking.eventTracker.addEvent(element, 'mouseleave', function (arg) {
                    ptOut(arg);
                });
                element.mcnTapTracking.eventTracker.addEvent(element, 'mouseup', function (arg) {
                    if (!element.mcnTapTracking.cancelMouse)
                        ptUp(arg);
                    else
                        ptOut(arg);
                });
            }
            else {
                element.mcnTapTracking.pointerModel = 'mouse';
                element.mcnTapTracking.eventTracker.addEvent(element, 'mousedown', ptDown);
                element.mcnTapTracking.eventTracker.addEvent(element, 'mouseleave', ptOut);
                element.mcnTapTracking.eventTracker.addEvent(element, 'mouseup', ptUp);
            }
        }
        UI.tap = tap;
        /**
         * return a promise completed after css transition on the element is ended
         * @function WinJSContrib.UI.afterTransition
         * @param {HtmlElement} element element to watch
         * @param {number} timeout timeout
         */
        function afterTransition(element, timeout) {
            var timeOutRef = null;
            return new WinJS.Promise(function (complete, error) {
                var onaftertransition = function (event) {
                    if (event.srcElement === element) {
                        close();
                    }
                };
                var close = function () {
                    clearTimeout(timeOutRef);
                    element.removeEventListener("transitionend", onaftertransition, false);
                    complete();
                };
                element.addEventListener("transitionend", onaftertransition, false);
                timeOutRef = setTimeout(close, timeout || 1000);
            });
        }
        UI.afterTransition = afterTransition;
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
        var FluentDOM = (function () {
            function FluentDOM(nodeType, className, parentElt, parent) {
                this.element = document.createElement(nodeType);
                if (className)
                    this.element.className = className;
                if (parentElt)
                    parentElt.appendChild(this.element);
                this.parent = parent;
                this.childs = [];
                if (parent) {
                    parent.childs.push(this);
                }
            }
            FluentDOM.for = function (element) {
                var res = new FluentDOM(null);
                res.element = element;
                return res;
            };
            FluentDOM.fragment = function () {
                var res = new FluentDOM(null);
                res.element = document.createDocumentFragment();
                return res;
            };
            Object.defineProperty(FluentDOM.prototype, "control", {
                get: function () {
                    return this.element.winControl;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Add a css class
             * @function WinJSContrib.UI.FluentDOM.prototype.addClass
             * @param classname css class
             * @returns {WinJSContrib.UI.FluentDOM}
             */
            FluentDOM.prototype.addClass = function (classname) {
                if (this.element)
                    this.element.classList.add(classname);
                return this;
            };
            /**
             * set className
             * @function WinJSContrib.UI.FluentDOM.prototype.className
             * @param classname css classes
             * @returns {WinJSContrib.UI.FluentDOM}
             */
            FluentDOM.prototype.className = function (classname) {
                if (this.element)
                    this.element.className = classname;
                return this;
            };
            /**
             * set opacity
             * @function WinJSContrib.UI.FluentDOM.prototype.opacity
             * @param opacity opacity
             * @returns {WinJSContrib.UI.FluentDOM}
             */
            FluentDOM.prototype.opacity = function (opacity) {
                if (this.element)
                    this.element.style.opacity = opacity;
                return this;
            };
            /**
             * set display
             * @function WinJSContrib.UI.FluentDOM.prototype.display
             * @param display display
             * @returns {WinJSContrib.UI.FluentDOM}
             */
            FluentDOM.prototype.display = function (display) {
                if (this.element)
                    this.element.style.display = display;
                return this;
            };
            /**
             * set display 'none'
             * @function WinJSContrib.UI.FluentDOM.prototype.hide
             * @returns {WinJSContrib.UI.FluentDOM}
             */
            FluentDOM.prototype.hide = function () {
                if (this.element)
                    this.element.style.display = 'none';
                return this;
            };
            /**
             * set visibility
             * @function WinJSContrib.UI.FluentDOM.prototype.visibility
             * @param visibility visibility
             * @returns {WinJSContrib.UI.FluentDOM}
             */
            FluentDOM.prototype.visibility = function (visibility) {
                if (this.element)
                    this.element.style.visibility = visibility;
                return this;
            };
            /**
             * set textContent
             * @function WinJSContrib.UI.FluentDOM.prototype.text
             * @param text text
             * @returns {WinJSContrib.UI.FluentDOM}
             */
            FluentDOM.prototype.text = function (text) {
                if (this.element)
                    this.element.textContent = text;
                return this;
            };
            /**
             * set innerHTML
             * @function WinJSContrib.UI.FluentDOM.prototype.html
             * @param text text
             * @returns {WinJSContrib.UI.FluentDOM}
             */
            FluentDOM.prototype.html = function (text) {
                if (this.element)
                    this.element.innerHTML = text;
                return this;
            };
            /**
             * set attribute
             * @function WinJSContrib.UI.FluentDOM.prototype.attr
             * @param name attribute name
             * @param val attribute value
             * @returns {WinJSContrib.UI.FluentDOM}
             */
            FluentDOM.prototype.attr = function (name, val) {
                if (this.element)
                    this.element.setAttribute(name, val);
                return this;
            };
            /**
             * set style property
             * @function WinJSContrib.UI.FluentDOM.prototype.style
             * @param name attribute name
             * @param val attribute value
             * @returns {WinJSContrib.UI.FluentDOM}
             */
            FluentDOM.prototype.style = function (name, val) {
                if (this.element)
                    this.element.style[name] = val;
                return this;
            };
            /**
             * set style property
             * @function WinJSContrib.UI.FluentDOM.prototype.style
             * @param name attribute name
             * @param val attribute value
             * @returns {WinJSContrib.UI.FluentDOM}
             */
            FluentDOM.prototype.styles = function (obj) {
                var st = this.element.style;
                var keys = Object.keys(obj);
                keys.forEach(function (k) {
                    st[k] = obj[k];
                });
                return this;
            };
            /**
             * append element to another DOM element
             * @function WinJSContrib.UI.FluentDOM.prototype.appendTo
             * @param elt parent element
             * @returns {WinJSContrib.UI.FluentDOM}
             */
            FluentDOM.prototype.appendTo = function (elt) {
                if (this.element && elt)
                    elt.appendChild(this.element);
                return this;
            };
            /**
             * add tap behavior
             * @function WinJSContrib.UI.FluentDOM.prototype.tap
             * @param callback tap callback
             * @param options tap options
             * @returns {WinJSContrib.UI.FluentDOM}
             */
            FluentDOM.prototype.tap = function (callback, options) {
                if (this.element)
                    WinJSContrib.UI.tap(this.element, callback, options);
                return this;
            };
            /**
             * create a child FluentDOM and append it to current
             * @function WinJSContrib.UI.FluentDOM.prototype.append
             * @param nodeType child node type
             * @param className css classes
             * @param callback callback receiving the new FluentDOM as an argument
             * @returns {WinJSContrib.UI.FluentDOM} current instance (for method chaining)
             */
            FluentDOM.prototype.append = function (nodeType, className, callback) {
                var child = new FluentDOM(nodeType, className, this.element, this);
                if (callback) {
                    callback(child);
                }
                return this;
            };
            /**
             * create a child FluentDOM and append it to current
             * @function WinJSContrib.UI.FluentDOM.prototype.createChild
             * @param nodeType child node type
             * @param className css classes
             * @returns {WinJSContrib.UI.FluentDOM} child FluentDOM
             */
            FluentDOM.prototype.createChild = function (nodeType, className) {
                var child = new FluentDOM(nodeType, className, this.element, this);
                return child;
            };
            /**
             * create a WinJS control
             * @function WinJSContrib.UI.FluentDOM.prototype.ctrl
             * @param ctrl constructor or full name of the control
             * @param options control options
             * @returns {WinJSContrib.UI.FluentDOM}
             */
            FluentDOM.prototype.ctrl = function (ctrl, options) {
                var ctor = ctrl;
                if (typeof ctrl === 'string')
                    ctor = WinJSContrib.Utils.readProperty(window, ctrl);
                if (ctor) {
                    new ctor(this.element, options);
                }
                return this;
            };
            return FluentDOM;
        })();
        UI.FluentDOM = FluentDOM;
    })(UI = WinJSContrib.UI || (WinJSContrib.UI = {}));
})(WinJSContrib || (WinJSContrib = {}));

var __global = this;
var profiler = __global.msWriteProfilerMark || function () { };
var WinJSContrib;
(function (WinJSContrib) {
    var UI;
    (function (UI) {
        var Pages;
        (function (Pages) {
            var logger = WinJSContrib.Logs.getLogger("WinJSContrib.UI.Pages");
            Pages.verboseTraces = false;
            /**
             * List of mixins to apply to each fragment managed by WinJS Contrib (through navigator or by calling explicitely {@link WinJSContrib.UI.Pages.fragmentMixin}).
             * @field WinJSContrib.UI.Pages.defaultFragmentMixins
             * @type {Array}
             */
            Pages.defaultFragmentMixins = [{
                    $: function (selector) {
                        return $(selector, this.element || this._element);
                    },
                    q: function (selector) {
                        if (!this.element)
                            return;
                        return this.element.querySelector(selector);
                    },
                    qAll: function (selector) {
                        if (!this.element)
                            return;
                        var res = this.element.querySelectorAll(selector);
                        if (res && !res.forEach) {
                            res = [].slice.call(res);
                        }
                        return res;
                    },
                },
                {
                    dispose: function () {
                        if (this._promises) {
                            this.cancelPromises();
                            this._promises = null;
                        }
                    },
                    promises: {
                        configurable: true,
                        get: function () {
                            if (!this._promises)
                                this._promises = [];
                            return this._promises;
                        }
                    },
                    addPromise: function (prom) {
                        this.promises.push(prom);
                        return prom;
                    },
                    cancelPromises: function () {
                        var page = this;
                        if (page.promises) {
                            for (var i = 0; i < page.promises.length; i++) {
                                if (page.promises[i]) {
                                    page.promises[i].cancel();
                                }
                            }
                            page.promises = [];
                        }
                    }
                },
                {
                    dispose: function () {
                        if (this._eventTracker) {
                            this._eventTracker.dispose();
                            this._eventTracker = null;
                        }
                    },
                    eventTracker: {
                        configurable: true,
                        get: function () {
                            if (!this._eventTracker)
                                this._eventTracker = new WinJSContrib.UI.EventTracker();
                            return this._eventTracker;
                        }
                    }
                }];
            function broadcast(ctrl, element, eventName, args, before, after) {
                var promises = [];
                if (before)
                    promises.push(WinJS.Promise.as(before.apply(ctrl, args)));
                var query = element.querySelectorAll(".mcn-layout-ctrl");
                if (query && query.length) {
                    var index = 0;
                    var length = query.length;
                    while (index < length) {
                        var childctrl = query[index];
                        if (childctrl) {
                            var event = childctrl.winControl[eventName];
                            if (event) {
                                if (childctrl.winControl.pageLifeCycle) {
                                    promises.push(childctrl.winControl.pageLifeCycle.steps.layout.promise);
                                }
                                else {
                                    promises.push(WinJS.Promise.as(event.apply(childctrl.winControl, args)));
                                }
                            }
                        }
                        // Skip descendants
                        if (childctrl && childctrl.winControl && childctrl.winControl.pageLifeCycle) {
                            index += childctrl.querySelectorAll(".mcn-fragment, .mcn-layout-ctrl").length + 1;
                            childctrl.winControl.__checkLayout();
                        }
                        else {
                            index += 1;
                        }
                    }
                    //if (after)
                    //    promises.push(WinJS.Promise.as(after.apply(ctrl, args)));
                    return WinJS.Promise.join(promises).then(function () {
                        if (after)
                            return WinJS.Promise.as(after.apply(ctrl, args));
                    });
                }
                else {
                    if (after)
                        return WinJS.Promise.as(after.apply(ctrl, args));
                    return WinJS.Promise.wrap();
                }
            }
            /**
             * render a html fragment with winjs contrib pipeline and properties, and add WinJS Contrib page events.
             * @function WinJSContrib.UI.Pages.renderFragment
             * @param {HTMLElement} container element that will contain the fragment
             * @param {string} location url for the fragment
             * @param {Object} args arguments to the fragment
             * @param {Object} options rendering options
             */
            function renderFragment(container, location, args, options) {
                var fragmentCompleted;
                var fragmentError;
                options = options || {};
                var element = document.createElement("div");
                element.setAttribute("dir", __global.getComputedStyle(element, null).direction);
                element.style.opacity = '0';
                container.appendChild(element);
                var fragmentPromise = new WinJS.Promise(function (c, e) { fragmentCompleted = c; fragmentError = e; });
                var parented = options.parented ? WinJS.Promise.as(options.parented) : null;
                var layoutCtrls = [];
                var pageConstructor = WinJS.UI.Pages.get(location);
                function preparePageControl(elementCtrl) {
                    if (options.getFragmentElement) {
                        options.getFragmentElement(elementCtrl);
                    }
                    if (args && args.injectToPage) {
                        WinJSContrib.Utils.inject(elementCtrl, args.injectToPage);
                    }
                    elementCtrl.navigationState = { location: location, state: args };
                    if (options.oncreate) {
                        options.oncreate(elementCtrl.element, args);
                    }
                    if (options.oninit) {
                        elementCtrl.pageLifeCycle.steps.init.attach(function () {
                            return options.oninit(elementCtrl.element, args);
                        });
                    }
                    if (elementCtrl.enterPageAnimation || options.enterPage) {
                        if (elementCtrl.enterPageAnimation)
                            elementCtrl._enterAnimation = elementCtrl.enterPageAnimation;
                        else
                            elementCtrl._enterAnimation = options.enterPage;
                        elementCtrl.enterPageAnimation = function () {
                            var page = this;
                            var elts = null;
                            element.style.opacity = '';
                            if (page && page.getAnimationElements) {
                                elts = page.getAnimationElements(false);
                            }
                            else {
                                elts = page.element;
                            }
                            if (elts)
                                return page._enterAnimation(elts);
                        };
                    }
                    if (options.onrender) {
                        elementCtrl.pageLifeCycle.steps.process.attach(function () {
                            options.onrender(elementCtrl.element, args);
                        });
                    }
                    if (!WinJSContrib.UI.disableAutoResources) {
                        elementCtrl.pageLifeCycle.steps.process.attach(function () {
                            return WinJS.Resources.processAll(element);
                        });
                    }
                    if (options.closeOldPagePromise) {
                        elementCtrl.pageLifeCycle.steps.ready.attach(function () {
                            return options.closeOldPagePromise;
                        });
                    }
                    elementCtrl.pageLifeCycle.steps.ready.attach(function () {
                        if (options.onready)
                            options.onready(elementCtrl.element, args);
                        if (elementCtrl.enterPageAnimation) {
                            return WinJS.Promise.as(elementCtrl.enterPageAnimation(element, options));
                        }
                        else {
                            elementCtrl.element.style.opacity = '';
                        }
                    });
                    elementCtrl.pageLifeCycle.steps.ready.promise.then(fragmentCompleted, fragmentError);
                }
                var elementCtrl = new pageConstructor(element, args, preparePageControl, parented);
                return fragmentPromise;
            }
            Pages.renderFragment = renderFragment;
            var PageLifeCycleStep = (function () {
                function PageLifeCycleStep(page, stepName, parent) {
                    var _this = this;
                    this.queue = [];
                    this.isDone = false;
                    this.stepName = stepName;
                    if (Pages.verboseTraces) {
                        this.created = new Date();
                    }
                    this.promise = new WinJS.Promise(function (c, e) {
                        _this._resolvePromise = c;
                        _this._rejectPromise = e;
                    });
                    page.promises.push(this.promise);
                    //if their is a parent page fragment, we attach step to synchronize page construction
                    if (parent && parent.pageLifeCycle) {
                        parent.pageLifeCycle.steps[stepName].attach(function () {
                            return _this.promise;
                        });
                    }
                }
                PageLifeCycleStep.prototype.attach = function (callback) {
                    if (this.queue && !this.isDone) {
                        this.queue.push(callback);
                        return this.promise;
                    }
                    else {
                        return WinJS.Promise.as(callback());
                    }
                };
                PageLifeCycleStep.prototype.resolve = function (arg) {
                    var step = this;
                    this.isDone = true;
                    function closeStep() {
                        step.resolved = new Date();
                        step._resolvePromise(arg);
                        if (Pages.verboseTraces) {
                            step.resolved = new Date();
                            logger.verbose('resolved ' + step.stepName + '(' + (step.resolved - step.created) + 'ms) ');
                        }
                        return step.promise;
                    }
                    if (this.queue && this.queue.length) {
                        var promises = [];
                        this.queue.forEach(function (q) {
                            promises.push(new WinJS.Promise(function (c, e) {
                                try {
                                    WinJS.Promise.as(q()).then(function (res) {
                                        c(res);
                                    }, e);
                                }
                                catch (exception) {
                                    e(exception);
                                }
                            }));
                        });
                        this.queue = null;
                        return WinJS.Promise.join(promises).then(function () {
                            return closeStep();
                        }, this.reject.bind(this));
                    }
                    else {
                        this.queue = null;
                        return closeStep();
                    }
                };
                PageLifeCycleStep.prototype.reject = function (arg) {
                    this.isDone = true;
                    this.queue = null;
                    this._rejectPromise(arg);
                    return WinJS.Promise.wrapError(this.promise);
                };
                return PageLifeCycleStep;
            })();
            Pages.PageLifeCycleStep = PageLifeCycleStep;
            (function (_Pages, _Global, _Base, _CorePages, _BaseUtils, _ElementUtilities, _WriteProfilerMark, Promise, Fragments, ControlProcessor) {
                'use strict';
                if (!_Global.document || !_CorePages)
                    return;
                var viewMap = _CorePages._viewMap || _CorePages.viewMap || {};
                //this property allows defining mixins applyed to all pages
                function abs(uri) {
                    var a = _Global.document.createElement("a");
                    a.href = uri;
                    return a.href;
                }
                function selfhost(uri) {
                    return _Global.document.location.href.toLowerCase() === uri.toLowerCase();
                }
                var _mixinBase = {
                    dispose: function () {
                        /// <signature helpKeyword="WinJS.UI.Pages.dispose">
                        /// <summary locid="WinJS.UI.Pages.dispose">
                        /// Disposes this Page.
                        /// </summary>
                        /// </signature>
                        if (this._disposed) {
                            return;
                        }
                        this.pageLifeCycle.stop();
                        this.pageLifeCycle = null;
                        this._disposed = true;
                        this.readyComplete.cancel();
                        _ElementUtilities.disposeSubTree(this.element);
                        this.element = null;
                    },
                    init: function () {
                    },
                    load: function (uri) {
                        /// <signature helpKeyword="WinJS.UI.Pages._mixin.load">
                        /// <summary locid="WinJS.UI.Pages._mixin.load">
                        /// Creates a copy of the DOM elements from the specified URI.  In order for this override
                        /// to be used, the page that contains the load override needs to be defined by calling
                        /// WinJS.UI.Pages.define() before WinJS.UI.Pages.render() is called.
                        /// </summary>
                        /// <param name="uri" locid="WinJS.UI.Pages._mixin.load_p:uri">
                        /// The URI from which to copy the DOM elements.
                        /// </param>
                        /// <returns type="WinJS.Promise" locid="WinJS.UI.Pages._mixin.load_returnValue">
                        /// A promise whose fulfilled value is the set of unparented DOM elements, if asynchronous processing is necessary. If not, returns nothing.
                        /// </returns>
                        /// </signature>
                        if (!this.selfhost) {
                            return Fragments.renderCopy(abs(uri));
                        }
                    },
                    process: function (element, options) {
                        /// <signature helpKeyword="WinJS.UI.Pages._mixin.process">
                        /// <summary locid="WinJS.UI.Pages._mixin.process">
                        /// Processes the unparented DOM elements returned by load.
                        /// </summary>
                        /// <param name="element" locid="WinJS.UI.Pages._mixin.process_p:element">
                        /// The DOM element that will contain all the content for the page.
                        /// </param>
                        /// <param name="options" locid="WinJS.UI.Pages._mixin.process_p:options">
                        /// The options that are to be passed to the constructor of the page.
                        /// </param>
                        /// <returns type="WinJS.Promise" locid="WinJS.UI.Pages._mixin.process_returnValue">
                        /// A promise that is fulfilled when processing is complete.
                        /// </returns>
                        /// </signature>
                        return ControlProcessor.processAll(element);
                    },
                    processed: function (element, options) { },
                    render: function (element, options, loadResult) {
                        /// <signature helpKeyword="WinJS.UI.Pages._mixin.render">
                        /// <summary locid="WinJS.UI.Pages._mixin.render">
                        /// Renders the control, typically by adding the elements specified in the loadResult parameter to the specified element.
                        /// </summary>
                        /// <param name="element" locid="WinJS.UI.Pages._mixin.render_p:element">
                        /// The DOM element that will contain all the content for the page.
                        /// </param>
                        /// <param name="options" locid="WinJS.UI.Pages._mixin.render_p:options">
                        /// The options passed into the constructor of the page.
                        /// </param>
                        /// <param name="loadResult" locid="WinJS.UI.Pages._mixin.render_p:loadResult">
                        /// The elements returned from the load method.
                        /// </param>
                        /// <returns type="WinJS.Promise" locid="WinJS.UI.Pages._mixin.render_returnValue">
                        /// A promise that is fulfilled when rendering is complete, if asynchronous processing is necessary. If not, returns nothing.
                        /// </returns>
                        /// </signature>
                        if (!this.selfhost) {
                            element.appendChild(loadResult);
                        }
                        return element;
                    },
                    rendered: function (element, options) { },
                    ready: function () { }
                };
                function injectMixin(base, mixin) {
                    var d = base.prototype.dispose;
                    base = _Base.Class.mix(base, mixin);
                    //we want to allow this mixins to provide their own addition to "dispose"
                    if (d && mixin.hasOwnProperty('dispose')) {
                        base.prototype.dispose = function () {
                            mixin.dispose.apply(this);
                            d.apply(this);
                        };
                    }
                    return base;
                }
                function mergeJavaScriptClass(baseCtor, classDef) {
                    var keys = Object.keys(baseCtor.prototype);
                    keys.forEach(function (k) {
                        if (classDef.prototype[k] === undefined) {
                            classDef.prototype[k] = baseCtor.prototype[k];
                        }
                    });
                    return baseCtor;
                }
                function addMembers(ctor, members) {
                    if (!members)
                        return ctor;
                    if (typeof members == 'function') {
                        ctor.prototype._attachedConstructor = members;
                        return mergeJavaScriptClass(ctor, members);
                    }
                    else if (typeof members == 'object') {
                        return injectMixin(ctor, members);
                    }
                    return ctor;
                }
                function pageLifeCycle(that, uri, element, options, complete, parentedPromise) {
                    if (element.style.display)
                        that.pageLifeCycle.initialDisplay = element.style.display;
                    element.style.display = 'none';
                    var profilerMarkIdentifier = " uri='" + uri + "'" + _BaseUtils._getProfilerMarkIdentifier(that.element);
                    _WriteProfilerMark("WinJS.UI.Pages:createPage" + profilerMarkIdentifier + ",StartTM");
                    if (WinJSContrib.UI.WebComponents) {
                        that.pageLifeCycle.observer = WinJSContrib.UI.WebComponents.watch(that.element);
                    }
                    var load = Promise.timeout().then(function Pages_load() {
                        return that.load(uri);
                    }).then(function (loadResult) {
                        //if page is defined by Js classes, call class constructors 
                        if (that._attachedConstructor) {
                            var realControl = new that._attachedConstructor(element, options);
                            element.winControl = realControl;
                            var keys = Object.keys(that);
                            keys.forEach(function (k) {
                                realControl[k] = that[k];
                            });
                            realControl.pageLifeCycle.page = realControl;
                            that.pageControl = realControl;
                            that.dismissed = true;
                            that = realControl;
                        }
                        return loadResult;
                    });
                    var renderCalled = load.then(function Pages_init(loadResult) {
                        return Promise.join({
                            loadResult: loadResult,
                            initResult: that.init(element, options)
                        });
                    }).then(function Pages_render(result) {
                        return that.pageLifeCycle.steps.init.resolve().then(function () {
                            return result;
                        });
                    }).then(function Pages_render(result) {
                        return that.render(element, options, result.loadResult);
                    }).then(function Pages_render(result) {
                        return that.rendered(element, options);
                    }).then(function (result) {
                        return that.pageLifeCycle.steps.render.resolve();
                    }).then(function Pages_processed() {
                        if (WinJSContrib.UI.WebComponents) {
                            //add delay to enable webcomponent processing
                            return WinJS.Promise.timeout();
                        }
                    });
                    that.elementReady = renderCalled.then(function () {
                        return element;
                    });
                    that.renderComplete = renderCalled.then(function Pages_process() {
                        return that.process(element, options);
                    }).then(function (result) {
                        return that.pageLifeCycle.steps.process.resolve();
                    }).then(function Pages_processed() {
                        WinJSContrib.UI.bindMembers(element, that);
                        return that.processed(element, options);
                    }).then(function () {
                        return that;
                    });
                    var callComplete = function () {
                        complete && complete(that);
                        _WriteProfilerMark("WinJS.UI.Pages:createPage" + profilerMarkIdentifier + ",StopTM");
                    };
                    // promises guarantee order, so this will be called prior to ready path below
                    //
                    that.renderComplete.then(callComplete, callComplete);
                    that.layoutComplete = that.renderComplete.then(function () {
                        return parentedPromise;
                    }).then(function () {
                        element.style.display = that.pageLifeCycle.initialDisplay || '';
                        var r = element.getBoundingClientRect(); //force element layout
                        return broadcast(that, element, 'pageLayout', [element, options], null, that.pageLayout);
                    }).then(function () {
                        WinJSContrib.UI.bindActions(element, that);
                    }).then(function (result) {
                        return that.pageLifeCycle.steps.layout.resolve();
                    }).then(function () {
                        return that;
                    });
                    that.readyComplete = that.layoutComplete.then(function Pages_ready() {
                        that.ready(element, options);
                        that.pageLifeCycle.ended = new Date();
                        that.pageLifeCycle.delta = that.pageLifeCycle.ended - that.pageLifeCycle.created;
                        logger.debug('navigation to ' + uri + ' took ' + that.pageLifeCycle.delta + 'ms');
                        //broadcast(that, element, 'pageReady', [element, options]);
                    }).then(function (result) {
                        return that.pageLifeCycle.steps.ready.resolve();
                    }).then(function () {
                        return that;
                    }).then(null, function Pages_error(err) {
                        if (that.error)
                            return that.error(err);
                        if (err && err._value && err._value.name === "Canceled")
                            return;
                        return WinJS.Promise.wrapError(err);
                    });
                    that.__checkLayout = function () {
                        var page = this;
                        var updateLayoutArgs = arguments;
                        var p = null;
                        if (page.updateLayout) {
                            p = WinJS.Promise.as(page.updateLayout.apply(page, updateLayoutArgs));
                        }
                        else {
                            p = WinJS.Promise.wrap();
                        }
                        return p.then(function () {
                            return broadcast(page, page.element, 'updateLayout', updateLayoutArgs);
                        });
                    };
                }
                function getPageConstructor(uri, members) {
                    /// <signature helpKeyword="WinJS.UI.Pages.define">
                    /// <summary locid="WinJS.UI.Pages.define">
                    /// Creates a new page control from the specified URI that contains the specified members.
                    /// Multiple calls to this method for the same URI are allowed, and all members will be
                    /// merged.
                    /// </summary>
                    /// <param name="uri" locid="WinJS.UI.Pages.define_p:uri">
                    /// The URI for the content that defines the page.
                    /// </param>
                    /// <param name="members" locid="WinJS.UI.Pages.define_p:members">
                    /// Additional members that the control will have.
                    /// </param>
                    /// <returns type="Function" locid="WinJS.UI.Pages.define_returnValue">
                    /// A constructor function that creates the page.
                    /// </returns>
                    /// </signature>
                    var refUri = abs(uri).toLowerCase();
                    var base = viewMap[refUri];
                    uri = abs(uri);
                    if (!base) {
                        base = _Base.Class.define(
                        // This needs to follow the WinJS.UI.processAll "async constructor"
                        // pattern to interop nicely in the "Views.Control" use case.
                        //
                        // This needs to follow the WinJS.UI.processAll "async constructor"
                        // pattern to interop nicely in the "Views.Control" use case.
                        //
                        function PageControl_ctor(element, options, complete, parentedPromise) {
                            var that = this;
                            var parent = WinJSContrib.Utils.getScopeControl(element);
                            _ElementUtilities.addClass(element, "win-disposable");
                            _ElementUtilities.addClass(element, "pagecontrol");
                            _ElementUtilities.addClass(element, "mcn-layout-ctrl");
                            that.pageLifeCycle = {
                                created: new Date(),
                                location: uri,
                                stop: function () {
                                    that.readyComplete.cancel();
                                    that.cancelPromises();
                                    if (this.observer) {
                                        this.observer.disconnect();
                                        this.observer = null;
                                    }
                                },
                                steps: {
                                    init: new PageLifeCycleStep(that, 'init', null),
                                    render: new PageLifeCycleStep(that, 'render', null),
                                    process: new PageLifeCycleStep(that, 'process', parent),
                                    layout: new PageLifeCycleStep(that, 'layout', parent),
                                    ready: new PageLifeCycleStep(that, 'ready', parent)
                                },
                                initialDisplay: null
                            };
                            this._disposed = false;
                            this.element = element = element || _Global.document.createElement("div");
                            element.msSourceLocation = uri;
                            this.uri = uri;
                            this.selfhost = selfhost(uri);
                            element.winControl = this;
                            that.parentedComplete = parentedPromise;
                            pageLifeCycle(this, uri, element, options, complete, parentedPromise);
                        }, _mixinBase);
                        base = _Base.Class.mix(base, WinJS.UI.DOMEventMixin);
                        //inject default behaviors to page constructor
                        WinJSContrib.UI.Pages.defaultFragmentMixins.forEach(function (mixin) {
                            injectMixin(base, mixin);
                        });
                        //WinJSContrib.UI.Pages.fragmentMixin(base);
                        viewMap[refUri] = base;
                    }
                    base = addMembers(base, members);
                    base.selfhost = selfhost(uri);
                    return base;
                }
                function Pages_define(uri, members) {
                    /// <signature helpKeyword="WinJS.UI.Pages.define">
                    /// <summary locid="WinJS.UI.Pages.define">
                    /// Creates a new page control from the specified URI that contains the specified members.
                    /// Multiple calls to this method for the same URI are allowed, and all members will be
                    /// merged.
                    /// </summary>
                    /// <param name="uri" locid="WinJS.UI.Pages.define_p:uri">
                    /// The URI for the content that defines the page.
                    /// </param>
                    /// <param name="members" locid="WinJS.UI.Pages.define_p:members">
                    /// Additional members that the control will have.
                    /// </param>
                    /// <returns type="Function" locid="WinJS.UI.Pages.define_returnValue">
                    /// A constructor function that creates the page.
                    /// </returns>
                    /// </signature>
                    var ctor = viewMap[uri];
                    if (!ctor) {
                        ctor = getPageConstructor(uri);
                    }
                    if (members) {
                        ctor = addMembers(ctor, members);
                    }
                    if (ctor.selfhost) {
                        WinJS.Utilities.ready(function () {
                            render(abs(uri), _Global.document.body);
                        }, true);
                    }
                    //in case we are on WinJS<4 we reference members on WinJS Core Pages
                    if (!_CorePages.viewMap && !_CorePages._viewMap && typeof members !== 'function')
                        _Pages._corePages.define(uri, members);
                    return ctor;
                }
                function render(uri, element, options, parentedPromise) {
                    var Ctor = _CorePages.get(uri);
                    var control = new Ctor(element, options, null, parentedPromise);
                    return control.renderComplete.then(null, function (err) {
                        return Promise.wrapError({
                            error: err,
                            page: control
                        });
                    });
                }
                function get(uri) {
                    var ctor = viewMap[uri];
                    if (!ctor) {
                        ctor = Pages_define(uri);
                    }
                    return ctor;
                }
                function remove(uri) {
                    Fragments.clearCache(abs(uri));
                    delete viewMap[uri.toLowerCase()];
                }
                _Pages._corePages = {
                    get: _CorePages.get,
                    render: _CorePages.render,
                    define: _CorePages.define,
                    _remove: _CorePages._remove,
                    _viewMap: viewMap,
                };
                var pageOverride = {
                    define: Pages_define,
                    get: get,
                    render: render,
                    _remove: remove,
                    _viewMap: viewMap
                };
                var source = WinJS.UI.Pages;
                WinJS.Namespace._moduleDefine(_Pages, null, pageOverride);
                source.get = pageOverride.get;
                source.define = pageOverride.define;
                source.render = pageOverride.render;
                source._remove = pageOverride._remove;
                //replaces HtmlControl, otherwise it does not use proper Page constructor
                WinJS.UI.HtmlControl = WinJS.Class.define(function HtmlControl_ctor(element, options, complete) {
                    /// <signature helpKeyword="WinJS.UI.HtmlControl.HtmlControl">
                    /// <summary locid="WinJS.UI.HtmlControl.constructor">
                    /// Initializes a new instance of HtmlControl to define a new page control.
                    /// </summary>
                    /// <param name="element" locid="WinJS.UI.HtmlControl.constructor_p:element">
                    /// The element that hosts the HtmlControl.
                    /// </param>
                    /// <param name="options" locid="WinJS.UI.HtmlControl.constructor_p:options">
                    /// The options for configuring the page. The uri option is required in order to specify the source
                    /// document for the content of the page.
                    /// </param>
                    /// </signature>
                    WinJS.UI.Pages.render(options.uri, element, options).
                        then(complete, function () { complete(); });
                });
            })(WinJSContrib.UI.Pages, __global, WinJS, WinJS.UI.Pages, WinJS.Utilities, WinJS.Utilities, profiler, WinJS.Promise, WinJS.UI.Fragments, WinJS.UI);
        })(Pages = UI.Pages || (UI.Pages = {}));
    })(UI = WinJSContrib.UI || (WinJSContrib.UI = {}));
})(WinJSContrib || (WinJSContrib = {}));

//# sourceMappingURL=winjscontrib.core.js.map