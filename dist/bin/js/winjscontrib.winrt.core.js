/* 
 * WinJS Contrib v2.1.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

var WinJSContrib;
(function (WinJSContrib) {
    var WinRT;
    (function (WinRT) {
        /**
         * read protocol arguments from application activation event arguments
         * @function WinJSContrib.WinRT.readProtocol
         * @param {Object} args WinJS application activation argument
         * @returns {Object} protocol arguments
         */
        function readProtocol(args) {
            if (args.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.protocol && args.detail.uri) {
                var navArgs = { action: undefined };
                var protocolArgs = {};
                var queryargs = args.detail.uri.query;
                if (queryargs[0] == '?') {
                    queryargs = queryargs.substr(1);
                }
                if (queryargs) {
                    queryargs.split('&').forEach(function (item) {
                        var arg = item.split('=');
                        protocolArgs[arg[0]] = decodeURIComponent(arg[1]);
                    });
                }
                navArgs.protocol = {
                    action: args.detail.uri.host,
                    args: protocolArgs
                };
                return navArgs;
            }
        }
        WinRT.readProtocol = readProtocol;
        ;
        /**
         * Indicate if a valid internet connection is available, even with constrained access
         * @function WinJSContrib.WinRT.isConnected
         * @returns {boolean}
         */
        function isConnected() {
            var nlvl = Windows.Networking.Connectivity.NetworkConnectivityLevel;
            var profile = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
            if (profile !== null) {
                var level = profile.getNetworkConnectivityLevel();
                return level === nlvl.constrainedInternetAccess || level === nlvl.internetAccess;
            }
            return false;
        }
        WinRT.isConnected = isConnected;
        ;
        /**
         * Indicate if a valid internet connection is available
         * @function WinJSContrib.WinRT.hasInternetAccess
         * @returns {boolean}
         */
        function hasInternetAccess() {
            var nlvl = Windows.Networking.Connectivity.NetworkConnectivityLevel;
            var profile = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
            if (profile !== null) {
                var level = profile.getNetworkConnectivityLevel();
                return level === nlvl.internetAccess;
            }
            return false;
        }
        WinRT.hasInternetAccess = hasInternetAccess;
        ;
        /**
         * trigger callback when internet connection status is changing
         * @function WinJSContrib.WinRT.onInternetStatusChanged
         * @param {function} callback callback for internet status change notification
         * @returns {function} function to call for unregistering the callback
         */
        function onInternetStatusChanged(callback) {
            var handler = function (arg) {
                var e = arg;
                callback(WinJSContrib.WinRT.hasInternetAccess());
            };
            var network = Windows.Networking.Connectivity.NetworkInformation;
            network.addEventListener('networkstatuschanged', handler);
            return function () {
                network.removeEventListener('networkstatuschanged', handler);
            };
        }
        WinRT.onInternetStatusChanged = onInternetStatusChanged;
    })(WinRT = WinJSContrib.WinRT || (WinJSContrib.WinRT = {}));
})(WinJSContrib || (WinJSContrib = {}));
var WinJSContrib;
(function (WinJSContrib) {
    var Alerts;
    (function (Alerts) {
        /**
         * show system alert box
         * @function WinJSContrib.Alerts.messageBox
         * @param {Object} opt message options
         * @returns {WinJS.Promise}
         */
        function messageBox(opt) {
            var _global = window;
            if (opt) {
                if (_global.Windows) {
                    var md = new Windows.UI.Popups.MessageDialog(opt.content);
                    if (opt.title) {
                        md.title = opt.title;
                    }
                    if (opt.commands && opt.commands.forEach) {
                        opt.commands.forEach(function (command, index) {
                            var cmd = new Windows.UI.Popups.UICommand();
                            if (command.id)
                                cmd.id = command.id;
                            cmd.label = command.label;
                            if (command.callback) {
                                cmd.invoked = command.callback;
                            }
                            ((md.commands)).append(cmd);
                            if (command.isDefault) {
                                md.defaultCommandIndex = index;
                            }
                        });
                    }
                    return (md.showAsync());
                }
                else {
                    return new WinJS.Promise(function (complete, error) {
                        var title = "";
                        if (opt.title) {
                            title = opt.title;
                        }
                        var commands = [];
                        if (opt.commands && opt.commands.forEach) {
                            //if (opt.commands.length > 2) {
                            //    return WinJS.Promise.wrapError("you must specify maximum 2 commands on Cordova platforms");
                            //}
                            opt.commands.forEach(function (command, index) {
                                commands.push(command.label);
                            });
                        }
                        else
                            commands = ['Ok'];
                        if (_global.navigator && _global.navigator.notification && _global.navigator.notification.confirm) {
                            _global.navigator.notification.confirm(opt.content, function (res) {
                                if (opt.commands && opt.commands[res - 1] && opt.commands[res - 1].callback) {
                                    var c = opt.commands[res - 1].callback();
                                    if (c && c.then) {
                                        c.then(function () {
                                            complete(true);
                                        });
                                    }
                                    else {
                                        complete(true);
                                    }
                                }
                                else if (res != 0)
                                    complete(true);
                                else
                                    complete(false);
                            }, title, commands // buttonLabels
                            );
                        }
                        else {
                            if (window.confirm(title))
                                complete(true);
                            else
                                complete(false);
                        }
                    });
                }
            }
            return WinJS.Promise.wrapError("you must specify commands as an array of objects with properties text and callback such as {text: '', callback: function(c){}}");
        }
        Alerts.messageBox = messageBox;
        ;
        /**
         * show system alert box
         * @function WinJSContrib.Alerts.message
         * @param {string} title title of the alert
         * @param {string} content text for the alert
         * @returns {WinJS.Promise}
         */
        function message(title, content) {
            return WinJSContrib.Alerts.messageBox({ title: title, content: content });
        }
        Alerts.message = message;
        /**
         * show system alert box
         * @function WinJSContrib.Alerts.confirm
         * @param {string} title title of the alert
         * @param {string} content text for the alert
         * @param {string} yes text for yes
         * @param {string} no text for no
         * @returns {WinJS.Promise}
         */
        function confirm(title, content, yes, no) {
            return new WinJS.Promise(function (complete, error) {
                WinJSContrib.Alerts.messageBox({
                    title: title,
                    content: content,
                    commands: [
                        {
                            label: yes,
                            callback: function (e) {
                                complete(true);
                            },
                            isDefault: true
                        },
                        {
                            label: no,
                            callback: function (e) {
                                complete(false);
                            }
                        }
                    ]
                });
            });
        }
        Alerts.confirm = confirm;
        /**
         * show system toast notification
         * @function WinJSContrib.Alerts.toastNotification
         * @param {Object} data toast options
         */
        function toastNotification(data) {
            if (Windows) {
                var notifications = Windows.UI.Notifications;
                var template = data.template || (data.picture ? notifications.ToastTemplateType.toastImageAndText01 : notifications.ToastTemplateType.toastText01);
                //var template = notifications.ToastTemplateType[data.template]; //toastImageAndText01;
                var toastXml = notifications.ToastNotificationManager.getTemplateContent(template);
                var toastTextElements = toastXml.getElementsByTagName("text");
                var toastImageElements = toastXml.getElementsByTagName("image");
                if (data.launch) {
                    var toastElements = toastXml.getElementsByTagName("toast");
                    toastElements[0].setAttribute("launch", JSON.stringify(data.launch));
                }
                toastTextElements[0].appendChild(toastXml.createTextNode(data.text));
                if (data.text2 && toastTextElements.length > 1) {
                    toastTextElements[1].appendChild(toastXml.createTextNode(data.text2));
                }
                if (data.text3 && toastTextElements.length > 1) {
                    toastTextElements[2].appendChild(toastXml.createTextNode(data.text3));
                }
                if (data.picture) {
                    toastImageElements[0].setAttribute("src", data.picture); //"ms-appx:///images/logo.png"
                }
                var toast = new notifications.ToastNotification(toastXml);
                var toastNotifier = notifications.ToastNotificationManager.createToastNotifier();
                toastNotifier.show(toast);
            }
            else {
                throw "No notification plugin found";
            }
        }
        Alerts.toastNotification = toastNotification;
        /**
         * show system toast notification
         * @function WinJSContrib.Alerts.toast
         * @param {string} text text displayed in the toast
         * @param {string} picture path to a picture to display in the toast
         */
        function toast(text, picture) {
            WinJSContrib.Alerts.toastNotification({ text: text, picture: picture });
        }
        Alerts.toast = toast;
    })(Alerts = WinJSContrib.Alerts || (WinJSContrib.Alerts = {}));
})(WinJSContrib || (WinJSContrib = {}));
var WinJSContrib;
(function (WinJSContrib) {
    var Logs;
    (function (Logs) {
        var WinRTFileLogger = (function () {
            function WinRTFileLogger(file) {
                this.maxNumberOfFiles = 10;
                this.maxBufferSize = 50;
                this.maxFlushDelay = 2000;
                this.maxFileSize = 3 * 1024 * 1024; //3Mo
                this.buffer = [];
                this.file = file;
                this.readyPromise = WinJS.Promise.wrap(file);
                //Windows.Storage.StorageFile.getFileFromPathAsync(path).then(null, (err) => {
                //    console.error(err);
                //    this.readyPromise = null;
                //    return null;
                //});
            }
            WinRTFileLogger.from = function (folder, filename) {
                var res = new WinRTFileLogger(null);
                res.readyPromise = folder.createFileAsync(filename, Windows.Storage.CreationCollisionOption.openIfExists).then(function (file) {
                    res.file = file;
                    return file;
                });
                return res;
            };
            WinRTFileLogger.prototype.clone = function () {
                var appender = new WinRTFileLogger(this.file);
                appender.maxBufferSize = this.maxBufferSize;
                appender.maxFlushDelay = this.maxFlushDelay;
                return appender;
            };
            WinRTFileLogger.prototype.format = function (logger, message, level) {
            };
            WinRTFileLogger.prototype.log = function (logger, message, level) {
                var _this = this;
                var args = [];
                for (var _i = 3; _i < arguments.length; _i++) {
                    args[_i - 3] = arguments[_i];
                }
                var leveltxt;
                if (level && WinJSContrib.Logs.Levels[level]) {
                    leveltxt = WinJSContrib.Logs.Levels[level].toUpperCase();
                }
                else {
                    leveltxt = "UKN";
                }
                this.buffer.push(new Date().getTime() + "\t" + leveltxt + "\t" + (logger.Config.prefix ? logger.Config.prefix + "\t" : "") + message);
                if (args && args.length) {
                    args.forEach(function (arg) {
                        if (typeof arg == "string") {
                            _this.buffer.push("\t" + arg);
                        }
                        else {
                            _this.buffer.push("\r\n" + JSON.stringify(arg));
                        }
                    });
                }
                this.buffer.push("\r\n");
                if (this.maxBufferSize && this.buffer.length > this.maxBufferSize) {
                    this.flush();
                }
                if (this.maxFlushDelay && !this.flushTimeout) {
                    this.flushTimeout = setTimeout(function () {
                        _this.flushTimeout = null;
                        _this.flush();
                    }, this.maxFlushDelay);
                }
            };
            WinRTFileLogger.prototype.flush = function () {
                var appender = this;
                if (appender.readyPromise && appender.buffer.length) {
                    var existingReadyPromise = appender.readyPromise;
                    var currentBuffer = appender.buffer.join("");
                    appender.buffer = [];
                    appender.readyPromise = new WinJS.Promise(function (complete, error) {
                        existingReadyPromise.then(function (file) {
                            return Windows.Storage.FileIO.appendTextAsync(appender.file, currentBuffer).then(function () {
                                return appender.file;
                            }, function (err) {
                                console.error("error appending logs to " + appender.file.path, err);
                                return appender.file;
                            });
                        }).then(function () {
                            if (appender.file && appender.maxFileSize) {
                                return appender._swapCurrentFile();
                            }
                        }).then(complete, function (err) {
                            console.error(err);
                            complete();
                        });
                    });
                    return appender.readyPromise;
                }
                return WinJS.Promise.wrap();
            };
            WinRTFileLogger.prototype._swapCurrentFile = function () {
                var appender = this;
                return appender.file.getBasicPropertiesAsync().then(function (props) {
                    if (props.size > appender.maxFileSize) {
                        var oldpath = appender.file.path;
                        var oldfilename = appender.file.name;
                        var now = new Date();
                        var newfile = "" + now.getFullYear() + WinJSContrib.Utils.pad2(now.getMonth() + 1) + WinJSContrib.Utils.pad2(now.getDate()) + WinJSContrib.Utils.pad2(now.getHours()) + WinJSContrib.Utils.pad2(now.getMinutes()) + now.getMilliseconds();
                        return Windows.Storage.StorageFolder.getFolderFromPathAsync(oldpath.substr(0, oldpath.lastIndexOf("\\"))).then(function (folder) {
                            return appender.file.renameAsync(newfile + "." + oldfilename, Windows.Storage.NameCollisionOption.generateUniqueName).then(function () {
                                return folder.createFileAsync(oldfilename).then(function (file) {
                                    appender.file = file;
                                    return file;
                                });
                            });
                        }).then(function () {
                            return appender._cleanup();
                        });
                    }
                });
            };
            WinRTFileLogger.prototype._cleanup = function () {
                var appender = this;
                var oldpath = appender.file.path;
                var filename = appender.file.name;
                return Windows.Storage.StorageFolder.getFolderFromPathAsync(oldpath.substr(0, oldpath.lastIndexOf("\\"))).then(function (folder) {
                    return folder.getFilesAsync().then(function (files) {
                        var fileslist = files.filter(function (f) {
                            if (f.path.indexOf(filename) >= 0 || f.path.indexOf(filename + ".old") >= 0) {
                                if (f.path != oldpath) {
                                    return true;
                                }
                            }
                            return false;
                        });
                        if (fileslist.length <= appender.maxNumberOfFiles)
                            return;
                        fileslist = fileslist.slice(0, fileslist.length - appender.maxNumberOfFiles);
                        return WinJSContrib.Promise.parallel(fileslist, function (file) {
                            return file.deleteAsync();
                        });
                    });
                });
            };
            WinRTFileLogger.prototype.group = function (title) {
            };
            WinRTFileLogger.prototype.groupCollapsed = function (title) {
            };
            WinRTFileLogger.prototype.groupEnd = function () {
            };
            return WinRTFileLogger;
        })();
        Logs.WinRTFileLogger = WinRTFileLogger;
    })(Logs = WinJSContrib.Logs || (WinJSContrib.Logs = {}));
})(WinJSContrib || (WinJSContrib = {}));

//# sourceMappingURL=../../Sources/WinRT/winjscontrib.winrt.core.js.map