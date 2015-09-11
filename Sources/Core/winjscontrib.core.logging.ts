module WinJSContrib.Logs.Appenders {
    /**
     * @namespace
     */
    WinJSContrib.Logs.Appenders = WinJSContrib.Logs.Appenders;

    export interface ILogAppender {
        clone();
        format(message: string, group: string, level: Logs.Levels);
        log(logger: Logs.Logger, message: string, group: string, level: Logs.Levels);
        group(title: string);
        groupCollapsed(title: string);
        groupEnd();
    }

    export class ConsoleAppender implements ILogAppender {
        public config: Logs.ILoggerConfig;

        /**
         * Appender writing to console
         * @class WinJSContrib.Logs.Appenders.ConsoleAppender
         */
        constructor(config?: Logs.ILoggerConfig) {
            this.config = config || { level: Logs.Levels.inherit };
        }

        /**
         * clone appender
         * @function WinJSContrib.Logs.Appenders.ConsoleAppender.prototype.clone
         */
        public clone() {
            return new WinJSContrib.Logs.Appenders.ConsoleAppender(this.config);
        }

        /**
         * log item
         * @function WinJSContrib.Logs.Appenders.ConsoleAppender.prototype.log
         * @param {string} message log message
         * @param {string} group group/category for the entry
         * @param {WinJSContrib.Logs.Levels} log level
         */
        public log(logger: Logs.Logger, message: string, group: string, level: Logs.Levels) {
            switch (level) {
                case Levels.verbose:
                    return console.log(this.format(message, group, level));
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
         * @function WinJSContrib.Logs.Appenders.ConsoleAppender.prototype.group
         */
        public group(title: string) {
            console.group(title);
        }

        /**
         * create collapsed log group
         * @function WinJSContrib.Logs.Appenders.ConsoleAppender.prototype.groupCollapsed
         */
        public groupCollapsed(title: string) {
            console.groupCollapsed(title);
        }

        /**
         * close log group
         * @function WinJSContrib.Logs.Appenders.ConsoleAppender.prototype.groupEnd
         */
        public groupEnd() {
            console.groupEnd();
        }

        public format(message: string, group: string, level: Logs.Levels) {
            var finalMessage = "";
            if (!this.config.hideLevelInMessage) finalMessage += logginLevelToString(level) + " - ";
            if (!this.config.hideGroupInMessage && group) finalMessage += group + ": ";
            finalMessage += message;
            return finalMessage;
        }
    }
}

module WinJSContrib.Logs {
    /**
     * @namespace WinJSContrib.Logs
     */
    WinJSContrib.Logs = WinJSContrib.Logs;

    /**
    * enumeration for log levels
    * @enum {number} Levels
    * @memberof WinJSContrib.Logs
    */
    export enum Levels {
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
        verbose = 2
    };

    export interface ILoggerConfig {
        level: Logs.Levels,
        hideLevelInMessage?: boolean,
        hideGroupInMessage?: boolean,
        appenders?: any[]
    }

    // Default config
    export var defaultConfig = <ILoggerConfig>{
        "level": Levels.off,
        "hideLevelInMessage": false,
        "hideGroupInMessage": true,
        "appenders": []
    };

    var Loggers = {};

    export var RuntimeAppenders = {
        "DefaultConsole": new Appenders.ConsoleAppender()
    };

    /**
     * get a logger, logger is created if it does not exists
     * @function WinJSContrib.Logs.getLogger
     * @param {string} name name for the logger
     * @param {Object} config logger configuration
     * @param {...Object} appenders appenders to add to the logger
     * @returns {WinJSContrib.Logs.Logger}
     */
    export function getLogger(name: string, config?: ILoggerConfig): Logger {
        var existing = <Logger>Loggers[name];
        if (!existing) {
            existing = new Logger(config || defaultConfig);
            existing.name = name;
            Loggers[name] = existing;
        }

        configure.apply(null, arguments);

        return existing;
    }

    export function configure(name: string, config: ILoggerConfig) {
        var existing = <Logger>Loggers[name];
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

    export function loggingLevelStringToEnum(level) {
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

    export function logginLevelToString(level) {
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

    export class Logger {
        public appenders: Array<WinJSContrib.Logs.Appenders.ILogAppender>;
        public _config: ILoggerConfig;
        public name: string;

        /**
         * @class WinJSContrib.Logs.Logger
         * @param {Object} config logger configuration
         */
        constructor(config) {
            this.appenders = [];
            /**
             * Logger configuration
             * @field Config
             * @type {Object}
             */
            this.Config = config || defaultConfig;
        }

        public get Config(): ILoggerConfig {
            return this._config;
        }

        public set Config(newValue: ILoggerConfig) {
            this._config = newValue || { level: Logs.Levels.off, hideGroupInMessage: false, hideLevelInMessage: false };

            if (typeof newValue.level === "number") this.Config.level = newValue.level;
            if (typeof newValue.hideLevelInMessage === "boolean") this.Config.hideLevelInMessage = newValue.hideLevelInMessage;
            if (typeof newValue.hideGroupInMessage === "boolean") this.Config.hideGroupInMessage = newValue.hideGroupInMessage;

            if (this._config.appenders) {
                this._config.appenders.forEach((a) => {
                    this.addAppender(a);
                });
            } else {
                this._config.appenders = [];
            }
        }

        /**
         * add appender to logger
         * @function WinJSContrib.Logs.Logger.prototype.addAppender
         * @param {Object} appender
         */
        public addAppender(appender: string|WinJSContrib.Logs.Appenders.ILogAppender) {
            if (typeof appender == "string") {
                appender = <WinJSContrib.Logs.Appenders.ILogAppender>WinJSContrib.Logs.RuntimeAppenders[<string>appender];
            }
            var currentappender = <WinJSContrib.Logs.Appenders.ILogAppender>appender;

            if (!currentappender)
                return;

            var exists = this.appenders.indexOf(currentappender) >= 0;

            if (exists)
                return;

            if (!currentappender.format)
                currentappender.format = this.format.bind(this);

            this.appenders.push(currentappender);
        }

        /**
         * Add log entry
         * @function WinJSContrib.Logs.Logger.prototype.log
         * @param {string} message log message
         * @param {string} group group/category for the entry
         * @param {WinJSContrib.Logs.Levels} log level
         */
        public log(message: string, group: string, level: Logs.Levels) {
            // If general logging level is set to 'none', returns
            if (this._config.level === WinJSContrib.Logs.Levels.off || level < this._config.level)
                return;

            if (!this.appenders || !this.appenders.length)
                return;

            this.appenders.forEach((a) => {
                a.log(this, message, group, level);
            });
        }

        /**
         * format log entry
         * @function WinJSContrib.Logs.Logger.prototype.format
         * @param {string} message log message
         * @param {string} group group/category for the entry
         * @param {WinJSContrib.Logs.Levels} log level
         */
        public format(message: string, group: string, level: Logs.Levels) {
            var finalMessage = "";
            if (!this.Config.hideLevelInMessage) finalMessage += logginLevelToString(level) + " - ";
            if (!this.Config.hideGroupInMessage && group) finalMessage += group + ": ";
            finalMessage += message;
            return finalMessage;
        }

        /**
         * add debug log entry
         * @function WinJSContrib.Logs.Logger.prototype.debug
         * @param {string} message log message
         * @param {string} [group] log group name
         */
        public verbose(message: string, group?: string) {
            this.log(message, group, Logs.Levels.verbose);
        }

        /**
         * add debug log entry
         * @function WinJSContrib.Logs.Logger.prototype.debug
         * @param {string} message log message
         * @param {string} [group] log group name
         */
        public debug(message: string, group?: string) {
            this.log(message, group, Logs.Levels.debug);
        }

        /**
         * add info log entry
         * @function WinJSContrib.Logs.Logger.prototype.info
         * @param {string} message log message
         * @param {string} [group] log group name
         */
        public info(message: string, group?: string) {
            this.log(message, group, Logs.Levels.info);
        }

        /**
         * add warn log entry
         * @function WinJSContrib.Logs.Logger.prototype.warn
         * @param {string} message log message
         * @param {string} [group] log group name
         */
        public warn(message: string, group?: string) {
            this.log(message, group, Logs.Levels.warn);
        }

        /**
         * add error log entry
         * @function WinJSContrib.Logs.Logger.prototype.error
         * @param {string} message log message
         * @param {string} [group] log group name
         */
        public error(message: string, group?: string) {
            this.log(message, group, Logs.Levels.error);
        }

        /**
         * create a log group
         * @function WinJSContrib.Logs.Logger.prototype.group
         * @param {string} title group title
         */
        public group(title: string) {
            this.appenders.forEach(function (a) {
                if (a.group)
                    a.group(title);
            });
        }

        /**
         * create a collapsed log group
         * @function WinJSContrib.Logs.Logger.prototype.groupCollapsed
         * @param {string} title group title
         */
        public groupCollapsed(title: string) {
            this.appenders.forEach(function (a) {
                if (a.groupCollapsed)
                    a.groupCollapsed(title);
            });
        }

        /**
         * end current group
         * @function WinJSContrib.Logs.Logger.prototype.groupEnd
         */
        public groupEnd() {
            this.appenders.forEach(function (a) {
                if (a.groupEnd)
                    a.groupEnd();
            });
        }

        

        /**
         * Get a child logger
         * @function WinJSContrib.Logs.Logger.prototype.getChildLogger
         * @param {string} name child logger name
         * @param {WinJSContrib.Logs.Levels} level
         */
        public getChildLogger(name: string, level: Logs.Levels) {
            var res = WinJSContrib.Logs.getLogger(this.name + '.' + name, JSON.parse(JSON.stringify(this.Config)));
            res.Config.appenders = [];
            this.appenders.forEach(function (a) {
                if (a.clone)
                    res.addAppender(a.clone());
            });

            if (level)
                res.Config.level = level;

            return res;
        }
    }
}


