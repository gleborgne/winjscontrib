//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

var WinJSContrib = WinJSContrib || {};

/**
 * logger abstraction to enable logging levels and global configuration
 * @class WinJSContrib.Logger
 */

WinJSContrib.Logger = (function () {
    "use strict";

    /**
     * @class WinJSContrib.Logger.LoggerClass
     * @property {Object} Config logger configuration
     */
    var LoggerClass = function (config) {
        this.config = config || defaultConfig;
        this.initWinJSLog();
    }

    /**
    * flag enumeration for log levels
    * @field WinJSContrib.Logger.LoggerClass.Levels
    */
    LoggerClass.prototype.Levels = {
        "off": 0,
        "error": 1,
        "warn": 2,
        "info": 4,
        "debug": 8,
        "all": 15
    };
    var levels = LoggerClass.prototype.Levels

    // Default config
    var defaultConfig = {
        "level": levels.all,
        "displayLevelInMessage": false,
        "displayGroupInMessage": true,
        "plugToWinJSLog": false
    };



    Object.defineProperty(LoggerClass.prototype, "Config", {
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
     * Add log entry
     * @function WinJSContrib.Logger.LoggerClass#log
     * @param {string} message log message
     * @param {string} group group/category for the entry
     * @param {number} log level
     */
    LoggerClass.prototype.log = function (message, group, level) {
        // Message logging level can be passed as a string (and will be by WinJS API)
        if (typeof level === "string") level = this.loggingLevelStringToEnum(level);

        // Default message logging level is 'debug'
        if (typeof level === "undefined" || level === null) level = levels.debug;

        // If general logging level is set to 'none', returns
        if (this.config.level === levels.none) return;

        // If message logging level is not part of general logging level, returns
        if ((level & this.config.level) !== level) return;

        var loggingMethod = this.loggingLevelToMethod(level),
            finalMessage = "";

        if (this.config.displayLevelInMessage) finalMessage += this.logginLevelToString(level) + " - ";

        if (this.config.displayGroupInMessage && group) finalMessage += group + ": ";

        finalMessage += message;
        loggingMethod(finalMessage);
    };

    /**
     * add debug log entry
     * @function WinJSContrib.Logger.LoggerClass#debug
     * @param {string} message log message
     * @param {string} group log group name
     */
    LoggerClass.prototype.debug = function (message, group) {
        this.log(message, group, levels.debug);
    };

    /**
     * add info log entry
     * @function WinJSContrib.Logger.LoggerClass#info
     * @param {string} message log message
     * @param {string} group log group name
     */
    LoggerClass.prototype.info = function (message, group) {
        this.log(message, group, levels.info);
    };

    /**
     * add warn log entry
     * @function WinJSContrib.Logger.LoggerClass#warn
     * @param {string} message log message
     * @param {string} group log group name
     */
    LoggerClass.prototype.warn = function (message, group) {
        this.log(message, group, levels.warn);
    };

    /**
     * add error log entry
     * @function WinJSContrib.Logger.LoggerClass#error
     * @param {string} message log message
     * @param {string} group log group name
     */
    LoggerClass.prototype.error = function (message, group) {
        this.log(message, group, levels.error);
    };

    /**
     * create a group
     * @function WinJSContrib.Logger.LoggerClass#group
     * @param {string} title group title
     */
    LoggerClass.prototype.group = function (title) {
        if (console && console.group) {
            console.group(title);
        }
    }

    /**
     * create a collapsed group
     * @function WinJSContrib.Logger.LoggerClass#groupCollapsed
     * @param {string} title group title
     */
    LoggerClass.prototype.groupCollapsed = function (title) {
        if (console && console.groupCollapsed) {
            console.groupCollapsed(title);
        }
    }

    /**
     * end current group
     * @function WinJSContrib.Logger.LoggerClass#groupEnd
     */
    LoggerClass.prototype.groupEnd = function () {
        if (console && console.groupEnd) {
            console.groupEnd();
        }
    }

    LoggerClass.prototype.initWinJSLog = function () {
        if (this.config.plugToWinJSLog) {
            WinJS.log = Logger.log;
        } else {
            WinJS.log = null;
        }
    }
    
    LoggerClass.prototype.loggingLevelStringToEnum = function (level) {
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

    LoggerClass.prototype.logginLevelToString = function (level) {
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

    LoggerClass.prototype.loggingLevelToMethod = function (level) {
        switch (level) {
            case levels.debug:
                return console.log.bind(console);
            case levels.info:
                return console.info.bind(console);
            case levels.warn:
                return console.warn.bind(console);
            case levels.error:
                return console.error.bind(console);
            case levels.all:
                throw "Logging level 'all' cannot be used to log a message.";
            case levels.off:
                throw "Logging level 'none' cannot be used to log a message.";
            default:
                throw "Message logging level is incorrect.";
        }
    }

    /**
     * Get a child logger
     * @function WinJSContrib.Logger.LoggerClass#getLogger
     */
    LoggerClass.prototype.getLogger = function (level) {
        var res = new LoggerClass(JSON.parse(JSON.stringify(this.config)));
        if (level)
            res.config.level = level;

        return res;
    }

    var res = new LoggerClass(defaultConfig);
    res.LoggerClass = LoggerClass;
    return res;
})();