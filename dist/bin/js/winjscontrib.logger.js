/* 
 * WinJS Contrib v2.1.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

console.warn("WinJSContrib.Logging is deprecated, please use WinJSContrib.Logs instead");
var WinJSContrib;
(function (WinJSContrib) {
    var Logging;
    (function (Logging) {
        /**
         * This API is deprecated, please use WinJSContrib.Logs instead
         * @namespace WinJSContrib.Logging
         */
        WinJSContrib.Logging = WinJSContrib.Logging;
        /**
        * enumeration for log levels
        * @enum {number} Levels
        * @memberof WinJSContrib.Logging
        */
        Logging.Levels = {
            /**
             * disabled
             */
            "off": 0,
            /**
             * log error
             */
            "error": 1,
            /**
             * log warn and error
             */
            "warn": 2,
            /**
             * log info, warn, error
             */
            "info": 4,
            /**
             * log debug, info, warn, error
             */
            "debug": 8,
            /**
             * log all
             */
            "all": 15
        };
        // Default config
        Logging.defaultConfig = {
            "level": WinJSContrib.Logging.Levels.all,
            "displayLevelInMessage": false,
            "displayGroupInMessage": true,
            "appenders": []
        };
        var Loggers = {};
        /**
         * get a logger, logger is created if it does not exists
         * @function WinJSContrib.Logging.getLogger
         * @param {string} name name for the logger
         * @param {Object} config logger configuration
         * @param {...Object} appenders appenders to add to the logger
         * @returns {WinJSContrib.Logging.LoggerClass}
         */
        function getLogger(name, config) {
            var existing = Loggers[name];
            if (existing) {
                if (config)
                    existing.config = config;
            }
            else {
                existing = new WinJSContrib.Logging.LoggerClass(config || Logging.defaultConfig);
                existing.name = name;
                Loggers[name] = existing;
            }
            if (arguments.length > 2) {
                for (var i = 2; i < arguments.length; i++) {
                    existing.addAppender(arguments[i]);
                }
            }
            return existing;
        }
        Logging.getLogger = getLogger;
        var LoggerClass = (function () {
            /**
             * @class WinJSContrib.Logging.LoggerClass
             * @param {Object} config logger configuration
             */
            function LoggerClass(config) {
                this.appenders = [];
                /**
                 * Logger configuration
                 * @field Config
                 * @type {Object}
                 */
                this.config = config || Logging.defaultConfig;
            }
            Object.defineProperty(LoggerClass.prototype, "Config", {
                get: function () {
                    return this.config;
                },
                set: function (newValue) {
                    newValue = newValue || {};
                    if (typeof newValue.level === "number")
                        this.config.level = newValue.level;
                    if (typeof newValue.displayLevelInMessage === "boolean")
                        this.config.displayLevelInMessage = newValue.displayLevelInMessage;
                    if (typeof newValue.displayGroupInMessage === "boolean")
                        this.config.displayGroupInMessage = newValue.displayGroupInMessage;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * add appender to logger
             * @function WinJSContrib.Logging.LoggerClass.prototype.addAppender
             * @param {Object} appender
             */
            LoggerClass.prototype.addAppender = function (appender) {
                appender.logger = this;
                if (!appender.format)
                    appender.format = this.format.bind(this);
                this.appenders.push(appender);
            };
            /**
             * Add log entry
             * @function WinJSContrib.Logging.LoggerClass.prototype.log
             * @param {string} message log message
             * @param {string} group group/category for the entry
             * @param {WinJSContrib.Logging.Levels} log level
             */
            LoggerClass.prototype.log = function (message, group, level) {
                // If general logging level is set to 'none', returns
                if (this.config.level === WinJSContrib.Logging.Levels.off)
                    return;
                if (!this.appenders || !this.appenders.length)
                    return;
                // Message logging level can be passed as a string (and will be by WinJS API)
                if (typeof level === "string")
                    level = this.loggingLevelStringToEnum(level);
                // Default message logging level is 'debug'
                if (typeof level === "undefined" || level === null)
                    level = WinJSContrib.Logging.Levels.debug;
                // If message logging level is not part of general logging level, returns
                if ((level & this.config.level) !== level)
                    return;
                this.appenders.forEach(function (a) {
                    a.log(message, group, level);
                });
            };
            /**
             * format log entry
             * @function WinJSContrib.Logging.LoggerClass.prototype.format
             * @param {string} message log message
             * @param {string} group group/category for the entry
             * @param {WinJSContrib.Logging.Levels} log level
             */
            LoggerClass.prototype.format = function (message, group, level) {
                var finalMessage = "";
                if (this.config.displayLevelInMessage)
                    finalMessage += this.logginLevelToString(level) + " - ";
                if (this.config.displayGroupInMessage && group)
                    finalMessage += group + ": ";
                finalMessage += message;
                return finalMessage;
            };
            /**
             * add debug log entry
             * @function WinJSContrib.Logging.LoggerClass.prototype.debug
             * @param {string} message log message
             * @param {string} [group] log group name
             */
            LoggerClass.prototype.debug = function (message, group) {
                this.log(message, group, WinJSContrib.Logging.Levels.debug);
            };
            /**
             * add info log entry
             * @function WinJSContrib.Logging.LoggerClass.prototype.info
             * @param {string} message log message
             * @param {string} [group] log group name
             */
            LoggerClass.prototype.info = function (message, group) {
                this.log(message, group, WinJSContrib.Logging.Levels.info);
            };
            /**
             * add warn log entry
             * @function WinJSContrib.Logging.LoggerClass.prototype.warn
             * @param {string} message log message
             * @param {string} [group] log group name
             */
            LoggerClass.prototype.warn = function (message, group) {
                this.log(message, group, WinJSContrib.Logging.Levels.warn);
            };
            /**
             * add error log entry
             * @function WinJSContrib.Logging.LoggerClass.prototype.error
             * @param {string} message log message
             * @param {string} [group] log group name
             */
            LoggerClass.prototype.error = function (message, group) {
                this.log(message, group, WinJSContrib.Logging.Levels.error);
            };
            /**
             * create a log group
             * @function WinJSContrib.Logging.LoggerClass.prototype.group
             * @param {string} title group title
             */
            LoggerClass.prototype.group = function (title) {
                this.appenders.forEach(function (a) {
                    if (a.group)
                        a.group(title);
                });
            };
            /**
             * create a collapsed log group
             * @function WinJSContrib.Logging.LoggerClass.prototype.groupCollapsed
             * @param {string} title group title
             */
            LoggerClass.prototype.groupCollapsed = function (title) {
                this.appenders.forEach(function (a) {
                    if (a.groupCollapsed)
                        a.groupCollapsed(title);
                });
            };
            /**
             * end current group
             * @function WinJSContrib.Logging.LoggerClass.prototype.groupEnd
             */
            LoggerClass.prototype.groupEnd = function () {
                this.appenders.forEach(function (a) {
                    if (a.groupEnd)
                        a.groupEnd();
                });
            };
            LoggerClass.prototype.loggingLevelStringToEnum = function (level) {
                switch (level.toLowerCase()) {
                    default:
                    case "log":
                    case "debug":
                        return Logging.Levels.debug;
                    case "info":
                        return Logging.Levels.info;
                    case "warn":
                        return Logging.Levels.warn;
                    case "error":
                        return Logging.Levels.error;
                }
            };
            LoggerClass.prototype.logginLevelToString = function (level) {
                switch (level) {
                    default:
                    case Logging.Levels.debug:
                        return "DEBUG";
                    case Logging.Levels.info:
                        return "INFO";
                    case Logging.Levels.warn:
                        return "WARN";
                    case Logging.Levels.error:
                        return "ERROR";
                }
            };
            /**
             * Get a child logger
             * @function WinJSContrib.Logging.LoggerClass.prototype.getChildLogger
             * @param {string} name child logger name
             * @param {WinJSContrib.Logging.Levels} level
             */
            LoggerClass.prototype.getChildLogger = function (name, level) {
                var res = WinJSContrib.Logging.getLogger(this.name + '.' + name, JSON.parse(JSON.stringify(this.config)));
                res.config.appenders = [];
                this.appenders.forEach(function (a) {
                    if (a.clone)
                        res.addAppender(a.clone());
                });
                if (level)
                    res.config.level = level;
                return res;
            };
            return LoggerClass;
        })();
        Logging.LoggerClass = LoggerClass;
    })(Logging = WinJSContrib.Logging || (WinJSContrib.Logging = {}));
})(WinJSContrib || (WinJSContrib = {}));
var WinJSContrib;
(function (WinJSContrib) {
    var Logging;
    (function (Logging) {
        var Appenders;
        (function (Appenders) {
            /**
             * @namespace
             */
            WinJSContrib.Logging.Appenders = WinJSContrib.Logging.Appenders;
            var ConsoleAppender = (function () {
                /**
                 * Appender writing to console
                 * @class WinJSContrib.Logging.Appenders.ConsoleAppender
                 */
                function ConsoleAppender(config) {
                    this.config = config;
                }
                /**
                 * clone appender
                 * @function WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.clone
                 */
                ConsoleAppender.prototype.clone = function () {
                    return new WinJSContrib.Logging.Appenders.ConsoleAppender(this.config);
                };
                /**
                 * log item
                 * @function WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.log
                 * @param {string} message log message
                 * @param {string} group group/category for the entry
                 * @param {WinJSContrib.Logging.Levels} log level
                 */
                ConsoleAppender.prototype.log = function (message, group, level) {
                    switch (level) {
                        case Logging.Levels.debug:
                            return console.log(this.format(message, group, level));
                        case Logging.Levels.info:
                            return console.info(this.format(message, group, level));
                        case Logging.Levels.warn:
                            return console.warn(this.format(message, group, level));
                        case Logging.Levels.error:
                            return console.error(this.format(message, group, level));
                    }
                };
                /**
                 * create log group
                 * @function WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.group
                 */
                ConsoleAppender.prototype.group = function (title) {
                    console.group(title);
                };
                /**
                 * create collapsed log group
                 * @function WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.groupCollapsed
                 */
                ConsoleAppender.prototype.groupCollapsed = function (title) {
                    console.groupCollapsed(title);
                };
                /**
                 * close log group
                 * @function WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.groupEnd
                 */
                ConsoleAppender.prototype.groupEnd = function () {
                    console.groupEnd();
                };
                ConsoleAppender.prototype.format = function (message, group, level) {
                    return message;
                };
                return ConsoleAppender;
            })();
            Appenders.ConsoleAppender = ConsoleAppender;
        })(Appenders = Logging.Appenders || (Logging.Appenders = {}));
    })(Logging = WinJSContrib.Logging || (WinJSContrib.Logging = {}));
})(WinJSContrib || (WinJSContrib = {}));
(function () {
    "use strict";
    var defaultLogger = WinJSContrib.Logging.getLogger('root', WinJSContrib.Logging.defaultConfig);
    defaultLogger.addAppender(new WinJSContrib.Logging.Appenders.ConsoleAppender());
    WinJSContrib.Logger = defaultLogger;
})();

//# sourceMappingURL=../../Sources/Common/winjscontrib.logger.js.map