module WinJSContrib.Logs.Appenders {
    /**
     * @namespace WinJSContrib.Logs.Appenders
     */
    WinJSContrib.Logs.Appenders = WinJSContrib.Logs.Appenders;

    export interface ILogAppender {
        clone();
        format(logger: Logs.Logger, message: string, level: Logs.Levels);
        log(logger: Logs.Logger, message: string, level: Logs.Levels);
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
         * @param {WinJSContrib.Logs.Levels} log level
         */
        public log(logger: Logs.Logger, message: string, level: Logs.Levels, ...args) {
            if (this.config.level == Logs.Levels.inherit || level >= this.config.level) {
                var msg = [this.format(logger, message, level)];
                if (args.length) {
                    args.forEach((a) => {
                        msg.push(a);
                    });
                }

                switch (level) {
                    case Levels.verbose:
                        return console.log.apply(console, msg);
                    case Levels.debug:
                        return console.log.apply(console, msg);
                    case Levels.info:
                        return console.info.apply(console, msg);
                    case Levels.warn:
                        return console.warn.apply(console, msg);
                    case Levels.error:
                        return console.error.apply(console, msg);
                }
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

        public format(logger: Logger, message: string, level: Logs.Levels) {
            var finalMessage = "";
            if (logger.Config && logger.Config.prefix) finalMessage += logger.Config.prefix + " # ";
            if (this.config.showLoggerNameInMessage) finalMessage += logger.name + " # ";
            if (this.config.showLevelInMessage) finalMessage += logginLevelToString(level) + " # ";
            finalMessage += message;
            return finalMessage;
        }
    }

    export class BufferAppender implements ILogAppender {
        public config: Logs.ILoggerConfig;
        public buffer: any[];

        /**
         * Appender writing to console
         * @class WinJSContrib.Logs.Appenders.BufferAppender
         */
        constructor(config?: Logs.ILoggerConfig) {
            this.config = config || { level: Logs.Levels.inherit };
            this.buffer = [];
        }

        /**
         * clone appender
         * @function WinJSContrib.Logs.Appenders.BufferAppender.prototype.clone
         */
        public clone() {
            return new WinJSContrib.Logs.Appenders.BufferAppender(this.config);
        }

        /**
         * log item
         * @function WinJSContrib.Logs.Appenders.BufferAppender.prototype.log
         * @param {string} message log message
         * @param {WinJSContrib.Logs.Levels} log level
         */
        public log(logger: Logs.Logger, message: string, level: Logs.Levels, ...args) {
            if (this.config.level == Logs.Levels.inherit || level >= this.config.level) {
                var msg = [new Date().getTime()+ "", Logs.Levels[level].toUpperCase(), this.format(logger, message, level)];
                if (args.length) {
                    args.forEach((a) => {
                        if (typeof a == "object")
                            a = JSON.stringify(a);

                        msg.push(a);
                    });
                }


                this.buffer.push(msg.join(" "));
            }
        }

        /**
         * create log group
         * @function WinJSContrib.Logs.Appenders.BufferAppender.prototype.group
         */
        public group(title: string) {
            
        }

        /**
         * create collapsed log group
         * @function WinJSContrib.Logs.Appenders.BufferAppender.prototype.groupCollapsed
         */
        public groupCollapsed(title: string) {
            
        }

        /**
         * close log group
         * @function WinJSContrib.Logs.Appenders.BufferAppender.prototype.groupEnd
         */
        public groupEnd() {
            
        }

        public format(logger: Logger, message: string, level: Logs.Levels) {
            var finalMessage = "";
            if (logger.Config && logger.Config.prefix) finalMessage += logger.Config.prefix + " # ";
            if (this.config.showLoggerNameInMessage) finalMessage += logger.name + " # ";
            if (this.config.showLevelInMessage) finalMessage += logginLevelToString(level) + " # ";
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
        prefix? : string,
        showLevelInMessage?: boolean,
        showLoggerNameInMessage?: boolean,
        appenders?: any[]
    }

    // Default config
    export var defaultConfig = <ILoggerConfig>{
        "level": Levels.off,
        "showLevelInMessage": false,
        "showLoggerNameInMessage": false,
        "appenders": ["DefaultConsole"]
    };

    var Loggers = {};

    export var RuntimeAppenders = {
        "DefaultConsole": new Appenders.ConsoleAppender()
    };

    export var DefaultAppenders = <Appenders.ILogAppender[]>[];

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
        
        if (config || arguments.length > 2)
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
            //default:
            //    throw "Message logging level cannot be translated to string.";
        }
    }

    export class Logger {
        public appenders: Array<WinJSContrib.Logs.Appenders.ILogAppender>;
        private _config: ILoggerConfig;
        private _level: Logs.Levels;
        public name: string;
        static noop = (message: string, ...args) => { };

        static getLogFn = function(level : Logs.Levels){
            return function(message: string) {
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
            }    
        }

        static verbose = Logger.getLogFn(Logs.Levels.verbose);
        static debug = Logger.getLogFn(Logs.Levels.debug);
        static info = Logger.getLogFn(Logs.Levels.info);
        static warn = Logger.getLogFn(Logs.Levels.warn);
        static error = Logger.getLogFn(Logs.Levels.error);


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
            this._config = newValue || { level: Logs.Levels.off, showLevelInMessage: false, showLoggerNameInMessage: false };

            if (typeof newValue.level === "number") this.Level = newValue.level;
            if (typeof newValue.showLevelInMessage === "boolean") this.Config.showLevelInMessage = newValue.showLevelInMessage;
            if (typeof newValue.showLoggerNameInMessage === "boolean") this.Config.showLoggerNameInMessage = newValue.showLoggerNameInMessage;
            
            if (this._config.appenders) {
                this._config.appenders.forEach((a) => {
                    this.addAppender(a);
                });
            } else {
                this._config.appenders = [];
            }
            this.checkLevel();
        }

        public get Level(): Logs.Levels {
            if (this._level)
                return this._level;
            else
                return this._config.level;
        }

        public set Level(val) {
            this._level = val;
             
            this.checkLevel();     
        }

        public checkLevel(){
            if (this._level <= Logs.Levels.verbose) { this.verbose = Logger.verbose; } else { this.verbose = Logger.noop }
            if (this._level <= Logs.Levels.debug) { this.debug = Logger.debug; } else { this.debug = Logger.noop }
            if (this._level <= Logs.Levels.info) { this.info = Logger.info; } else { this.info = Logger.noop }
            if (this._level <= Logs.Levels.warn) { this.warn = Logger.warn; } else { this.warn = Logger.noop }
            if (this._level <= Logs.Levels.error) { this.error = Logger.error; } else { this.error = Logger.noop }       
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

            //if (!currentappender.format)
            //    currentappender.format = this.format.bind(this);

            this.appenders.push(currentappender);
        }

        /**
         * Add log entry
         * @function WinJSContrib.Logs.Logger.prototype.log
         * @param {string} message log message
         * @param {WinJSContrib.Logs.Levels} log level
         */
        public log(message: string, level: Logs.Levels, ...args) {
            // If general logging level is set to 'none', returns
            if ((this.Level === WinJSContrib.Logs.Levels.off) || (level < this.Level))
                return;

            if (!this.appenders || !this.appenders.length)
                return;

            var fnargs = [this, message, level];
            if (args.length) {
                for (var i = 0; i < args.length; i++) {
                    fnargs.push(args[i]);
                }
            }

            DefaultAppenders.forEach((a) => {
                a.log.apply(a, fnargs);
            });

            this.appenders.forEach((a) => {
                a.log.apply(a, fnargs);
            });
        }

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
        public verbose(message: string, ...args) {
        }

        /**
         * add debug log entry
         * @function WinJSContrib.Logs.Logger.prototype.debug
         * @param {string} message log message
         */
        public debug(message: string, ...args) {
        }

        /**
         * add info log entry
         * @function WinJSContrib.Logs.Logger.prototype.info
         * @param {string} message log message
         * @param {string} [group] log group name
         */
        public info(message: string, ...args) {
        }

        /**
         * add warn log entry
         * @function WinJSContrib.Logs.Logger.prototype.warn
         * @param {string} message log message
         */
        public warn(message: string, ...args) {
        }

        /**
         * add error log entry
         * @function WinJSContrib.Logs.Logger.prototype.error
         * @param {string} message log message
         */
        public error(message: string, ...args) {
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


