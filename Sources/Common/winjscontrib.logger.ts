console.warn("WinJSContrib.Logging is deprecated, please use WinJSContrib.Logs instead");
module WinJSContrib.Logging {
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
    export var Levels = {
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
    export var defaultConfig = {
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
    export function getLogger(name, config): LoggerClass {
        var existing = <LoggerClass>Loggers[name];
        if (existing) {
            if (config)
                existing.config = config;
        }
        else {
            existing = new WinJSContrib.Logging.LoggerClass(config || defaultConfig);
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

    export class LoggerClass {
        public appenders: Array<WinJSContrib.Logging.Appenders.ILogAppender>;
        public config: any;
        public name: string;

        /**
         * @class WinJSContrib.Logging.LoggerClass
         * @param {Object} config logger configuration
         */
        constructor(config) {
            this.appenders = [];
            /**
             * Logger configuration
             * @field Config
             * @type {Object}
             */
            this.config = config || defaultConfig;
        }

        public get Config() { 
            return this.config; 
        }

        public set Config(newValue) {
            newValue = newValue || {};

            if (typeof newValue.level === "number") this.config.level = newValue.level;
            if (typeof newValue.displayLevelInMessage === "boolean") this.config.displayLevelInMessage = newValue.displayLevelInMessage;
            if (typeof newValue.displayGroupInMessage === "boolean") this.config.displayGroupInMessage = newValue.displayGroupInMessage;            
        }

        /**
         * add appender to logger
         * @function WinJSContrib.Logging.LoggerClass.prototype.addAppender
         * @param {Object} appender
         */
        public addAppender(appender: WinJSContrib.Logging.Appenders.ILogAppender) {
            appender.logger = this;
            if (!appender.format)
                appender.format = this.format.bind(this);

            this.appenders.push(appender);
        }

        /**
         * Add log entry
         * @function WinJSContrib.Logging.LoggerClass.prototype.log
         * @param {string} message log message
         * @param {string} group group/category for the entry
         * @param {WinJSContrib.Logging.Levels} log level
         */
        public log(message, group, level) {
            // If general logging level is set to 'none', returns
            if (this.config.level === WinJSContrib.Logging.Levels.off) return;

            if (!this.appenders || !this.appenders.length)
                return;

            // Message logging level can be passed as a string (and will be by WinJS API)
            if (typeof level === "string") level = this.loggingLevelStringToEnum(level);

            // Default message logging level is 'debug'
            if (typeof level === "undefined" || level === null) level = WinJSContrib.Logging.Levels.debug;


            // If message logging level is not part of general logging level, returns
            if ((level & this.config.level) !== level) return;

            this.appenders.forEach(function (a) {
                a.log(message, group, level);
            });
        }

        /**
         * format log entry
         * @function WinJSContrib.Logging.LoggerClass.prototype.format
         * @param {string} message log message
         * @param {string} group group/category for the entry
         * @param {WinJSContrib.Logging.Levels} log level
         */
        public format(message, group, level) {
            var finalMessage = "";
            if (this.config.displayLevelInMessage) finalMessage += this.logginLevelToString(level) + " - ";
            if (this.config.displayGroupInMessage && group) finalMessage += group + ": ";
            finalMessage += message;
            return finalMessage;
        }

        /**
         * add debug log entry
         * @function WinJSContrib.Logging.LoggerClass.prototype.debug
         * @param {string} message log message
         * @param {string} [group] log group name
         */
        public debug(message, group) {
            this.log(message, group, WinJSContrib.Logging.Levels.debug);
        }

        /**
         * add info log entry
         * @function WinJSContrib.Logging.LoggerClass.prototype.info
         * @param {string} message log message
         * @param {string} [group] log group name
         */
        public info(message, group) {
            this.log(message, group, WinJSContrib.Logging.Levels.info);
        }

        /**
         * add warn log entry
         * @function WinJSContrib.Logging.LoggerClass.prototype.warn
         * @param {string} message log message
         * @param {string} [group] log group name
         */
        public warn(message, group) {
            this.log(message, group, WinJSContrib.Logging.Levels.warn);
        }

        /**
         * add error log entry
         * @function WinJSContrib.Logging.LoggerClass.prototype.error
         * @param {string} message log message
         * @param {string} [group] log group name
         */
        public error(message, group) {
            this.log(message, group, WinJSContrib.Logging.Levels.error);
        }

        /**
         * create a log group
         * @function WinJSContrib.Logging.LoggerClass.prototype.group
         * @param {string} title group title
         */
        public group(title) {
            this.appenders.forEach(function (a) {
                if (a.group)
                    a.group(title);
            });
        }

        /**
         * create a collapsed log group
         * @function WinJSContrib.Logging.LoggerClass.prototype.groupCollapsed
         * @param {string} title group title
         */
        public groupCollapsed(title) {
            this.appenders.forEach(function (a) {
                if (a.groupCollapsed)
                    a.groupCollapsed(title);
            });
        }

        /**
         * end current group
         * @function WinJSContrib.Logging.LoggerClass.prototype.groupEnd
         */
        public groupEnd() {
            this.appenders.forEach(function (a) {
                if (a.groupEnd)
                    a.groupEnd();
            });
        }

        loggingLevelStringToEnum(level) {
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

        logginLevelToString(level) {
            switch (level) {
                default:
                case Levels.debug:
                    return "DEBUG";
                case Levels.info:
                    return "INFO";
                case Levels.warn:
                    return "WARN";
                case Levels.error:
                    return "ERROR";
                //default:
                //    throw "Message logging level cannot be translated to string.";
            }
        }

        /**
         * Get a child logger
         * @function WinJSContrib.Logging.LoggerClass.prototype.getChildLogger
         * @param {string} name child logger name
         * @param {WinJSContrib.Logging.Levels} level
         */
        public getChildLogger(name, level) {
            var res = WinJSContrib.Logging.getLogger(this.name + '.' + name, JSON.parse(JSON.stringify(this.config)));
            res.config.appenders = [];
            this.appenders.forEach(function (a) {
                if (a.clone)
                    res.addAppender(a.clone());
            });

            if (level)
                res.config.level = level;

            return res;
        }

    }
}

module WinJSContrib.Logging.Appenders {
    /**
     * @namespace
     */
    WinJSContrib.Logging.Appenders = WinJSContrib.Logging.Appenders;

    export interface ILogAppender {
        logger: LoggerClass;
        clone();
        format(message, group, level);
        log(message, group, level);
        group(title);
        groupCollapsed(title);
        groupEnd();
    }

    export class ConsoleAppender implements ILogAppender {
        public logger: LoggerClass;

        /**
         * Appender writing to console
         * @class WinJSContrib.Logging.Appenders.ConsoleAppender
         */
        constructor(public config?: any) {
        }

        /**
         * clone appender
         * @function WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.clone
         */
        public clone() {
            return new WinJSContrib.Logging.Appenders.ConsoleAppender(this.config);
        }

        /**
         * log item
         * @function WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.log
         * @param {string} message log message
         * @param {string} group group/category for the entry
         * @param {WinJSContrib.Logging.Levels} log level
         */
        public log(message, group, level) {
            switch (level) {
                case Levels.debug:
                    return console.log(this.format(message, group, level));
                case Levels.info:
                    return console.info(this.format(message, group, level));
                case Levels.warn:
                    return console.warn(this.format(message, group, level));
                case Levels.error:
                    return console.error(this.format(message, group, level));
            }
        }

        /**
         * create log group
         * @function WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.group
         */
        public group(title) {
            console.group(title);
        }

        /**
         * create collapsed log group
         * @function WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.groupCollapsed
         */
        public groupCollapsed(title) {
            console.groupCollapsed(title);
        }

        /**
         * close log group
         * @function WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.groupEnd
         */
        public groupEnd() {
            console.groupEnd();
        }

        public format(message, group, level) {
            return message;
        }
    }
}

declare module WinJSContrib {
    var Logger: WinJSContrib.Logging.LoggerClass;
}

(function () {
    "use strict";

    var defaultLogger = WinJSContrib.Logging.getLogger('root', WinJSContrib.Logging.defaultConfig);
    defaultLogger.addAppender(new WinJSContrib.Logging.Appenders.ConsoleAppender());
    WinJSContrib.Logger = defaultLogger;
})();
