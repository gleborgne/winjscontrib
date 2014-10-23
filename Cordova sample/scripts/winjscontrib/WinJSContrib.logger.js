//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

var WinJSContrib = WinJSContrib || {};

WinJSContrib.Logger = (function (Logger) {
    "use strict";

    Logger = function (config) {
        this.config = config || defaultConfig;
        this.initWinJSLog();
    }

    // This is a flag enumeration
    var levels = Logger.prototype.Levels = {
        "off": 0,
        "error": 1,
        "warn": 2,
        "info": 4,
        "debug": 8,
        "all": 15
    };

    // Default config
    var defaultConfig = {
        "level": levels.all,
        "displayLevelInMessage": false,
        "displayGroupInMessage": true,
        "plugToWinJSLog": false
    };



    Object.defineProperty(Logger.prototype, "Config", {
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

    Logger.prototype.log = function (message, group, level) {
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

    Logger.prototype.debug = function (message, group) {
        this.log(message, group, levels.debug);
    };

    Logger.prototype.info = function (message, group) {
        this.log(message, group, levels.info);
    };

    Logger.prototype.warn = function (message, group) {
        this.log(message, group, levels.warn);
    };

    Logger.prototype.error = function (message, group) {
        this.log(message, group, levels.error);
    };

    Logger.prototype.group = function (title) {
        if (console && console.group) {
            console.group(title);
        }
    }

    Logger.prototype.groupCollapsed = function (title) {
        if (console && console.groupCollapsed) {
            console.groupCollapsed(title);
        }
    }

    Logger.prototype.groupEnd = function () {
        if (console && console.groupEnd) {
            console.groupEnd();
        }
    }

    Logger.prototype.initWinJSLog = function () {
        if (this.config.plugToWinJSLog) {
            WinJS.log = Logger.log;
        } else {
            WinJS.log = null;
        }
    }

    Logger.prototype.loggingLevelStringToEnum = function (level) {
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

    Logger.prototype.logginLevelToString = function (level) {
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

    Logger.prototype.loggingLevelToMethod = function (level) {
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

    Logger.prototype.getLogger = function (level) {
        var res = new Logger(JSON.parse(JSON.stringify(this.config)));
        if (level)
            res.config.level = level;

        return res;
    }

    return new Logger(defaultConfig);
})();