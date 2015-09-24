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
