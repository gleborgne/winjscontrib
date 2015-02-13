/* 
 * WinJS Contrib v2.0.1.0
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

var WinJSContrib = WinJSContrib || {};

/**
 * @namespace
 */
WinJSContrib.Logging = WinJSContrib.Logging || {};

/**
 * @namespace
 */
WinJSContrib.Logging.Appenders = WinJSContrib.Logging.Appenders || {};

(function () {
    "use strict";

    /**
    * enumeration for log levels
    * @enum {number}
    */
    WinJSContrib.Logging.Levels = {
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

    var levels = WinJSContrib.Logging.Levels;

    // Default config
    var defaultConfig = {
        "level": WinJSContrib.Logging.Levels.all,
        "displayLevelInMessage": false,
        "displayGroupInMessage": true,
        "plugToWinJSLog": false,
        "appenders": []
    };


    WinJSContrib.Logging.Loggers = {};

    /**
     * get a logger, logger is created if it does not exists
     * @param {string} name name for the logger
     * @param {Object} config logger configuration
     * @param {...Object} appenders appenders to add to the logger
     * @returns {WinJSContrib.Logging.LoggerClass}
     */
    WinJSContrib.Logging.getLogger = function (name, config) {
        var existing = WinJSContrib.Logging.Loggers[name];
        if (existing) {
            if (config)
                existing.config = config;
        }
        else {
            existing = new WinJSContrib.Logging.LoggerClass(config || defaultConfig);
            existing.name = name;
            WinJSContrib.Logging.Loggers[name] = existing;
        }

        if (arguments.length > 2) {
            for (var i = 2 ; i < arguments.length; i++) {
                existing.addAppender(arguments[i]);
            }
        }

        return existing;
    }

    /**
     * @class
     * @param {Object} config logger configuration
     */
    WinJSContrib.Logging.LoggerClass = function (config) {
        this.appenders = [];
        /**
         * Logger configuration
         * @field Config
         * @type {Object}
         */
        this.config = config || defaultConfig;        
        this.initWinJSLog();
    }    

    Object.defineProperty(WinJSContrib.Logging.LoggerClass.prototype, "Config", {
        "get": function () { return this.config; },
        "set": function (newValue) {
            newValue = newValue || {};

            if (typeof newValue.level === "number") this.config.level = newValue.level;
            if (typeof newValue.displayLevelInMessage === "boolean") this.config.displayLevelInMessage = newValue.displayLevelInMessage;
            if (typeof newValue.displayGroupInMessage === "boolean") this.config.displayGroupInMessage = newValue.displayGroupInMessage;
            if (typeof newValue.plugToWinJSLog === "boolean") this.config.plugToWinJSLog = newValue.plugToWinJSLog;

            this.initWinJSLog();
        }
    });

    /**
     * add appender to logger
     * @param {Object} appender
     */
    WinJSContrib.Logging.LoggerClass.prototype.addAppender = function (appender) {
        appender.logger = this;
        if (!appender.format)
            appender.format = this.format.bind(this);

        this.appenders.push(appender);
    }

    /**
     * Add log entry
     * @param {string} message log message
     * @param {string} group group/category for the entry
     * @param {WinJSContrib.Logging.Levels} log level
     */
    WinJSContrib.Logging.LoggerClass.prototype.log = function (message, group, level) {
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
    };

    /**
     * format log entry
     * @param {string} message log message
     * @param {string} group group/category for the entry
     * @param {WinJSContrib.Logging.Levels} log level
     */
    WinJSContrib.Logging.LoggerClass.prototype.format = function (message, group, level) {
        var finalMessage = "";
        if (this.config.displayLevelInMessage) finalMessage += this.logginLevelToString(level) + " - ";
        if (this.config.displayGroupInMessage && group) finalMessage += group + ": ";
        finalMessage += message;
        return finalMessage;
    }

    /**
     * add debug log entry
     * @param {string} message log message
     * @param {string} [group] log group name
     */
    WinJSContrib.Logging.LoggerClass.prototype.debug = function (message, group) {
        this.log(message, group, WinJSContrib.Logging.Levels.debug);
    };

    /**
     * add info log entry
     * @param {string} message log message
     * @param {string} [group] log group name
     */
    WinJSContrib.Logging.LoggerClass.prototype.info = function (message, group) {
        this.log(message, group, WinJSContrib.Logging.Levels.info);
    };

    /**
     * add warn log entry
     * @param {string} message log message
     * @param {string} [group] log group name
     */
    WinJSContrib.Logging.LoggerClass.prototype.warn = function (message, group) {
        this.log(message, group, WinJSContrib.Logging.Levels.warn);
    };

    /**
     * add error log entry
     * @param {string} message log message
     * @param {string} [group] log group name
     */
    WinJSContrib.Logging.LoggerClass.prototype.error = function (message, group) {
        this.log(message, group, WinJSContrib.Logging.Levels.error);
    };

    /**
     * create a log group
     * @param {string} title group title
     */
    WinJSContrib.Logging.LoggerClass.prototype.group = function (title) {
        this.appenders.forEach(function (a) {
            if (a.group)
                a.group(title);
        });
    }

    /**
     * create a collapsed log group
     * @param {string} title group title
     */
    WinJSContrib.Logging.LoggerClass.prototype.groupCollapsed = function (title) {
        this.appenders.forEach(function (a) {
            if (a.groupCollapsed)
                a.groupCollapsed(title);
        });
    }

    /**
     * end current group
     */
    WinJSContrib.Logging.LoggerClass.prototype.groupEnd = function () {
        this.appenders.forEach(function (a) {
            if (a.groupEnd)
                a.groupEnd();
        });
    }

    WinJSContrib.Logging.LoggerClass.prototype.initWinJSLog = function () {
        if (this.config.plugToWinJSLog) {
            WinJS.log = Logger.log;
        } else {
            WinJS.log = null;
        }
    }
    
    WinJSContrib.Logging.LoggerClass.prototype.loggingLevelStringToEnum = function (level) {
        switch (level.toLowerCase()) {
            default:
            case "log":
            case "debug":
                return levels.debug;
            case "info":
                return levels.info;
            case "warn":
                return levels.warn;
            case "error":
                return levels.error;
        }
    }

    WinJSContrib.Logging.LoggerClass.prototype.logginLevelToString = function (level) {
        switch (level) {
            default:
            case levels.debug:
                return "DEBUG";
            case levels.info:
                return "INFO";
            case levels.warn:
                return "WARN";
            case levels.error:
                return "ERROR";
                //default:
                //    throw "Message logging level cannot be translated to string.";
        }
    }

    /**
     * Get a child logger
     * @param {string} name child logger name
     * @param {WinJSContrib.Logging.Levels} level
     */
    WinJSContrib.Logging.LoggerClass.prototype.getChildLogger = function (name, level) {
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

    
    /**
     * append log to console
     * @class
     */
    WinJSContrib.Logging.Appenders.ConsoleAppender = function (config) {
        this.config = config;
    }

    /**
     * clone appender
     */
    WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.clone = function () {
        return new WinJSContrib.Logging.Appenders.ConsoleAppender(this.config);
    }

    /**
     * log item
     * @param {string} message log message
     * @param {string} group group/category for the entry
     * @param {WinJSContrib.Logging.Levels} log level
     */
    WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.log = function (message, group, level) {
        switch (level) {
            case levels.debug:
                return console.log(this.format(message, group, level));
            case levels.info:
                return console.info(this.format(message, group, level));
            case levels.warn:
                return console.warn(this.format(message, group, level));
            case levels.error:
                return console.error(this.format(message, group, level));
        }
    }

    /**
     * create log group
     */
    WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.group = function (title) {
        console.group(title);
    }

    /**
     * create collapsed log group
     */
    WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.groupCollapsed = function (title) {
        console.groupCollapsed(title);
    }

    /**
     * close log group
     */
    WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.groupEnd = function () {
        console.groupEnd();
    }
    
    WinJSContrib.Logger = WinJSContrib.Logging.getLogger('root', defaultConfig);
    WinJSContrib.Logger.addAppender(new WinJSContrib.Logging.Appenders.ConsoleAppender());

})();
