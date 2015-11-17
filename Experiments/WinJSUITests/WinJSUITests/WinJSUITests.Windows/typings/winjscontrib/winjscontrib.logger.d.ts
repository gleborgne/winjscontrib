declare module WinJSContrib.Logging {
    /**
    * enumeration for log levels
    * @enum {number} Levels
    * @memberof WinJSContrib.Logging
    */
    var Levels: {
        "off": number;
        "error": number;
        "warn": number;
        "info": number;
        "debug": number;
        "all": number;
    };
    var defaultConfig: {
        "level": number;
        "displayLevelInMessage": boolean;
        "displayGroupInMessage": boolean;
        "appenders": any[];
    };
    /**
     * get a logger, logger is created if it does not exists
     * @function WinJSContrib.Logging.getLogger
     * @param {string} name name for the logger
     * @param {Object} config logger configuration
     * @param {...Object} appenders appenders to add to the logger
     * @returns {WinJSContrib.Logging.LoggerClass}
     */
    function getLogger(name: any, config: any): LoggerClass;
    class LoggerClass {
        appenders: Array<WinJSContrib.Logging.Appenders.ILogAppender>;
        config: any;
        name: string;
        /**
         * @class WinJSContrib.Logging.LoggerClass
         * @param {Object} config logger configuration
         */
        constructor(config: any);
        Config: any;
        /**
         * add appender to logger
         * @function WinJSContrib.Logging.LoggerClass.prototype.addAppender
         * @param {Object} appender
         */
        addAppender(appender: WinJSContrib.Logging.Appenders.ILogAppender): void;
        /**
         * Add log entry
         * @function WinJSContrib.Logging.LoggerClass.prototype.log
         * @param {string} message log message
         * @param {string} group group/category for the entry
         * @param {WinJSContrib.Logging.Levels} log level
         */
        log(message: any, group: any, level: any): void;
        /**
         * format log entry
         * @function WinJSContrib.Logging.LoggerClass.prototype.format
         * @param {string} message log message
         * @param {string} group group/category for the entry
         * @param {WinJSContrib.Logging.Levels} log level
         */
        format(message: any, group: any, level: any): string;
        /**
         * add debug log entry
         * @function WinJSContrib.Logging.LoggerClass.prototype.debug
         * @param {string} message log message
         * @param {string} [group] log group name
         */
        debug(message: any, group: any): void;
        /**
         * add info log entry
         * @function WinJSContrib.Logging.LoggerClass.prototype.info
         * @param {string} message log message
         * @param {string} [group] log group name
         */
        info(message: any, group: any): void;
        /**
         * add warn log entry
         * @function WinJSContrib.Logging.LoggerClass.prototype.warn
         * @param {string} message log message
         * @param {string} [group] log group name
         */
        warn(message: any, group: any): void;
        /**
         * add error log entry
         * @function WinJSContrib.Logging.LoggerClass.prototype.error
         * @param {string} message log message
         * @param {string} [group] log group name
         */
        error(message: any, group: any): void;
        /**
         * create a log group
         * @function WinJSContrib.Logging.LoggerClass.prototype.group
         * @param {string} title group title
         */
        group(title: any): void;
        /**
         * create a collapsed log group
         * @function WinJSContrib.Logging.LoggerClass.prototype.groupCollapsed
         * @param {string} title group title
         */
        groupCollapsed(title: any): void;
        /**
         * end current group
         * @function WinJSContrib.Logging.LoggerClass.prototype.groupEnd
         */
        groupEnd(): void;
        loggingLevelStringToEnum(level: any): number;
        logginLevelToString(level: any): string;
        /**
         * Get a child logger
         * @function WinJSContrib.Logging.LoggerClass.prototype.getChildLogger
         * @param {string} name child logger name
         * @param {WinJSContrib.Logging.Levels} level
         */
        getChildLogger(name: any, level: any): LoggerClass;
    }
}
declare module WinJSContrib.Logging.Appenders {
    interface ILogAppender {
        logger: LoggerClass;
        clone(): any;
        format(message: any, group: any, level: any): any;
        log(message: any, group: any, level: any): any;
        group(title: any): any;
        groupCollapsed(title: any): any;
        groupEnd(): any;
    }
    class ConsoleAppender implements ILogAppender {
        config: any;
        logger: LoggerClass;
        /**
         * Appender writing to console
         * @class WinJSContrib.Logging.Appenders.ConsoleAppender
         */
        constructor(config?: any);
        /**
         * clone appender
         * @function WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.clone
         */
        clone(): ConsoleAppender;
        /**
         * log item
         * @function WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.log
         * @param {string} message log message
         * @param {string} group group/category for the entry
         * @param {WinJSContrib.Logging.Levels} log level
         */
        log(message: any, group: any, level: any): void;
        /**
         * create log group
         * @function WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.group
         */
        group(title: any): void;
        /**
         * create collapsed log group
         * @function WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.groupCollapsed
         */
        groupCollapsed(title: any): void;
        /**
         * close log group
         * @function WinJSContrib.Logging.Appenders.ConsoleAppender.prototype.groupEnd
         */
        groupEnd(): void;
        format(message: any, group: any, level: any): any;
    }
}
declare module WinJSContrib {
    var Logger: WinJSContrib.Logging.LoggerClass;
}
