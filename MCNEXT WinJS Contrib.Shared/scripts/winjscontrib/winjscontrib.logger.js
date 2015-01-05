//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

var WinJSContrib = WinJSContrib || {};

/**
 * @namespace
 */
WinJSContrib.Logging = WinJSContrib.Logging || {};

/**
 * @namespace
 */
WinJSContrib.Logging.Appenders = WinJSContrib.Logging.Appenders || {};

/**
 * Logger abstraction to enable logging levels and global configuration.
 * This object is an instance of {@link WinJSContrib.Logging.LoggerClass} that act as a root logger
 * @class WinJSContrib.Logging
 */

(function () {
    "use strict";

    /**
    * enumeration for log levels
    * @enum
    */
    WinJSContrib.Logging.Levels = {
        "off": 0,
        "error": 1,
        "warn": 2,
        "info": 4,
        "debug": 8,
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
     * @property {Object} Config logger configuration
     */
    WinJSContrib.Logging.LoggerClass = function (config) {
        this.appenders = [];
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

    WinJSContrib.Logging.LoggerClass.prototype.addAppender = function (appender) {
        appender.logger = this;
        if (!appender.format)
            appender.format = this.format.bind(this);

        this.appenders.push(appender);
    }

    /**
     * Add log entry
     * @function WinJSContrib.Logging.LoggerClass#log
     * @param {string} message log message
     * @param {string} group group/category for the entry
     * @param {number} log level
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

    WinJSContrib.Logging.LoggerClass.prototype.format = function (message, group, level) {
        var finalMessage = "";
        if (this.config.displayLevelInMessage) finalMessage += this.logginLevelToString(level) + " - ";
        if (this.config.displayGroupInMessage && group) finalMessage += group + ": ";
        finalMessage += message;
        return finalMessage;
    }

    /**
     * add debug log entry
     * @function WinJSContrib.Logging.LoggerClass#debug
     * @param {string} message log message
     * @param {string} group log group name
     */
    WinJSContrib.Logging.LoggerClass.prototype.debug = function (message, group) {
        this.log(message, group, WinJSContrib.Logging.Levels.debug);
    };

    /**
     * add info log entry
     * @function WinJSContrib.Logging.LoggerClass#info
     * @param {string} message log message
     * @param {string} group log group name
     */
    WinJSContrib.Logging.LoggerClass.prototype.info = function (message, group) {
        this.log(message, group, WinJSContrib.Logging.Levels.info);
    };

    /**
     * add warn log entry
     * @function WinJSContrib.Logging.LoggerClass#warn
     * @param {string} message log message
     * @param {string} group log group name
     */
    WinJSContrib.Logging.LoggerClass.prototype.warn = function (message, group) {
        this.log(message, group, WinJSContrib.Logging.Levels.warn);
    };

    /**
     * add error log entry
     * @function WinJSContrib.Logging.LoggerClass#error
     * @param {string} message log message
     * @param {string} group log group name
     */
    WinJSContrib.Logging.LoggerClass.prototype.error = function (message, group) {
        this.log(message, group, WinJSContrib.Logging.Levels.error);
    };

    /**
     * create a group
     * @function WinJSContrib.Logging.LoggerClass#group
     * @param {string} title group title
     */
    WinJSContrib.Logging.LoggerClass.prototype.group = function (title) {
        if (console && console.group) {
            console.group(title);
        }
    }

    /**
     * create a collapsed group
     * @function WinJSContrib.Logging.LoggerClass#groupCollapsed
     * @param {string} title group title
     */
    WinJSContrib.Logging.LoggerClass.prototype.groupCollapsed = function (title) {
        if (console && console.groupCollapsed) {
            console.groupCollapsed(title);
        }
    }

    /**
     * end current group
     * @function WinJSContrib.Logging.LoggerClass#groupEnd
     */
    WinJSContrib.Logging.LoggerClass.prototype.groupEnd = function () {
        if (console && console.groupEnd) {
            console.groupEnd();
        }
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
     * @param {WinJSContrib.Logging.Levels} level
     */
    WinJSContrib.Logging.LoggerClass.prototype.getChildLogger = function (name, level) {
        var res = new LoggerClass(JSON.parse(JSON.stringify(this.config)));
        res.config.appenders = [];
        this.appenders.forEach(function (a) {
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

    WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.clone = function () {
        return new WinJSContrib.Logging.Appenders.ConsoleAppender(this.config);
    }

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

    WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.group = function (title) {
        console.group(title);
    }

    WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.groupCollapsed = function (title) {
        console.groupCollapsed(title);
    }

    WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.groupEnd = function () {
        console.groupEnd();
    }
    
    /**
     * root logger
     * @field
     * @type WinJSContrib.Logging.LoggerClass
     */
    WinJSContrib.Logger = WinJSContrib.Logging.getLogger('root', defaultConfig);
    WinJSContrib.Logger.addAppender(new WinJSContrib.Logging.Appenders.ConsoleAppender());

})();
