var WinJSContrib = WinJSContrib || {};

/**
 * @namespace
 */
WinJSContrib.WinRT = WinJSContrib.WinRT || {};

/**
 * @namespace
 */
WinJSContrib.Alerts = WinJSContrib.Alerts || {};

(function () {

    /**
     * read protocol arguments from application activation event arguments
     * @param {Object} args WinJS application activation argument
     * @returns {Object} protocol arguments
     */
    WinJSContrib.WinRT.readProtocol = function (args) {
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
    };

    /**
     * Indicate if a valid internet connection is available, even with constrained access
     * @returns {boolean}
     */
    WinJSContrib.WinRT.isConnected = function () {
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
     * @returns {boolean}
     */
    WinJSContrib.WinRT.hasInternetAccess = function () {
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
     * @param {function} callback callback for internet status change notification
     * @returns {function} function to call for unregistering the callback
     */
    WinJSContrib.WinRT.onInternetStatusChanged = function (callback) {
        var handler = function (arg) {
            var e = arg;
            callback(WinJSContrib.WinRT.hasInternetAccess())
        }

        Windows.Networking.Connectivity.NetworkInformation.addEventListener('networkstatuschanged', handler);
        return function () {
            Windows.Networking.Connectivity.NetworkInformation.removeEventListener('networkstatuschanged', handler);
        }
    }

    /**
     * show system alert box
     * @param {Object} opt message options
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Alerts.messageBox = function messageBox(opt) {
        if (opt) {
            if (window.Windows) {
                var md = new Windows.UI.Popups.MessageDialog(opt.content);
                if (opt.title) {
                    md.title = opt.title;
                }
                if (opt.commands && opt.commands.forEach) {                    
                    opt.commands.forEach(function (command, index) {
                        var cmd = new Windows.UI.Popups.UICommand();
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


                    if (navigator && navigator.notification && navigator.notification.confirm) {
                        navigator.notification.confirm(
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
     * @param {string} title title of the alert
     * @param {string} content text for the alert
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Alerts.message = function (title, content) {
        return WinJSContrib.Alerts.messageBox({ title: title, content: content });
    }

    /**
     * show system alert box
     * @param {string} title title of the alert
     * @param {string} content text for the alert
     * @param {string} yes text for yes
     * @param {string} no text for no
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Alerts.confirm = function (title, content, yes, no) {
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
     * @param {Object} data toast options
     */
    WinJSContrib.Alerts.toastNotification = function (data) {
        if (window.Windows) {
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
     * @param {string} text text displayed in the toast
     * @param {string} picture path to a picture to display in the toast
     */
    WinJSContrib.Alerts.toast = function (text, picture) {
        WinJSContrib.Alerts.toastNotification({ text: text, picture: picture });
    }
})();