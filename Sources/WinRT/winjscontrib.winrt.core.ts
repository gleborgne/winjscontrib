module WinJSContrib.WinRT {

    /**
     * read protocol arguments from application activation event arguments
     * @function WinJSContrib.WinRT.readProtocol
     * @param {Object} args WinJS application activation argument
     * @returns {Object} protocol arguments
     */
    export function readProtocol(args) {
        if (args.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.protocol && args.detail.uri) {
            var navArgs = <any>{ action: undefined };
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
    };

    /**
     * Indicate if a valid internet connection is available, even with constrained access
     * @function WinJSContrib.WinRT.isConnected
     * @returns {boolean}
     */
    export function isConnected() {
        var nlvl = Windows.Networking.Connectivity.NetworkConnectivityLevel;
        var profile = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
        if (profile !== null) {
            var level = profile.getNetworkConnectivityLevel();
            return level === nlvl.constrainedInternetAccess || level === nlvl.internetAccess;
        }
        return false;
    };

    /**
     * Indicate if a valid internet connection is available
     * @function WinJSContrib.WinRT.hasInternetAccess
     * @returns {boolean}
     */
    export function hasInternetAccess() {
        var nlvl = Windows.Networking.Connectivity.NetworkConnectivityLevel;
        var profile = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
        if (profile !== null) {
            var level = profile.getNetworkConnectivityLevel();
            return level === nlvl.internetAccess;
        }
        return false;
    };

    /**
     * trigger callback when internet connection status is changing
     * @function WinJSContrib.WinRT.onInternetStatusChanged
     * @param {function} callback callback for internet status change notification
     * @returns {function} function to call for unregistering the callback
     */
    export function onInternetStatusChanged(callback) {
        var handler = function (arg) {
            var e = arg;
            callback(WinJSContrib.WinRT.hasInternetAccess())
        }

        var network = <any>Windows.Networking.Connectivity.NetworkInformation;
        network.addEventListener('networkstatuschanged', handler);
        return function () {
            network.removeEventListener('networkstatuschanged', handler);
        }
    }
}

module WinJSContrib.Alerts {
    
    /**
     * show system alert box
     * @function WinJSContrib.Alerts.messageBox
     * @param {Object} opt message options
     * @returns {WinJS.Promise}
     */
    export function messageBox(opt): WinJS.Promise<any> {
        var _global = <any>window;
        if (opt) {
            if (_global.Windows) {
                var md = new Windows.UI.Popups.MessageDialog(opt.content);
                if (opt.title) {
                    md.title = opt.title;
                }
                if (opt.commands && opt.commands.forEach) {                    
                    opt.commands.forEach(function (command, index) {
                        var cmd = new Windows.UI.Popups.UICommand();                        
                        if (command.id) cmd.id = command.id;
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
            } else {
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
                    } else
                        commands = ['Ok'];


                    if (_global.navigator && _global.navigator.notification && _global.navigator.notification.confirm) {
                        _global.navigator.notification.confirm(
                            opt.content, // message
                            function (res) {
                                if (opt.commands && opt.commands[res - 1] && opt.commands[res - 1].callback) {
                                    var c = opt.commands[res - 1].callback();
                                    if (c && c.then) {
                                        c.then(function () {
                                            complete(true);
                                        });
                                    } else {
                                        complete(true);
                                    }
                                }
                                else if (res != 0)
                                    complete(true);
                                else
                                    complete(false);
                            },            // callback to invoke with index of button pressed
                            title,           // title
                            commands     // buttonLabels
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
    };

    /**
     * show system alert box
     * @function WinJSContrib.Alerts.message
     * @param {string} title title of the alert
     * @param {string} content text for the alert
     * @returns {WinJS.Promise}
     */
    export function message(title, content): WinJS.Promise<any> {
        return WinJSContrib.Alerts.messageBox({ title: title, content: content });
    }

    /**
     * show system alert box
     * @function WinJSContrib.Alerts.confirm
     * @param {string} title title of the alert
     * @param {string} content text for the alert
     * @param {string} yes text for yes
     * @param {string} no text for no
     * @returns {WinJS.Promise}
     */
    export function confirm(title, content, yes, no): WinJS.Promise<any> {
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

    /**
     * show system toast notification
     * @function WinJSContrib.Alerts.toastNotification
     * @param {Object} data toast options
     */
    export function toastNotification(data) {
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
                //toastImageElements[0].setAttribute("alt", "red graphic");
            }

            var toast = new notifications.ToastNotification(toastXml);
            var toastNotifier = notifications.ToastNotificationManager.createToastNotifier();
            toastNotifier.show(toast);
        }
        else {
            throw "No notification plugin found";
        }
    }

    /**
     * show system toast notification
     * @function WinJSContrib.Alerts.toast
     * @param {string} text text displayed in the toast
     * @param {string} picture path to a picture to display in the toast
     */
    export function toast(text, picture?) {
        WinJSContrib.Alerts.toastNotification({ text: text, picture: picture });
    }
}
