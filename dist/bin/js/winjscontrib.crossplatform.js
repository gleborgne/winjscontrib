/* 
 * WinJS Contrib v2.0.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

var WinJSContrib = WinJSContrib || {};

/**
 * Helpers for cross platform development
 * @namespace
 */
WinJSContrib.CrossPlatform = WinJSContrib.Cross || {};
(function () {

    /**
     * add css class corresponding to cross platform devices
     */
    WinJSContrib.CrossPlatform.crossPlatformClass = function (element) {
        element.classList.add("mcn-xplat");
        if (WinJSContrib.CrossPlatform.isMobile.Android()) {
            element.classList.add("mcn-xplat-android");
        }
        if (WinJSContrib.CrossPlatform.isMobile.iOS()) {
            element.classList.add("mcn-xplat-ios");
        }
        if (WinJSContrib.CrossPlatform.isMobile.BlackBerry()) {
            element.classList.add("mcn-xplat-blackberry");
        }
        if (WinJSContrib.CrossPlatform.isMobile.Windows()) {
            element.classList.add("mcn-xplat-windows");
        }
        return element
    }

    /**
     * check user agent for identifying platform device
     * @namespace
     */
    WinJSContrib.CrossPlatform.isMobile = {
        /**
         * Check if Android
         */
        Android: function () {
            return navigator.userAgent.match(/Android/i);
        },
        /**
         * Check if Blackberry
         */
        BlackBerry: function () {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        /**
         * Check if iOS
         */
        iOS: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        /**
         * Check if Opera mini
         */
        Opera: function () {
            return navigator.userAgent.match(/Opera Mini/i);
        },

        /**
         * Check if Windows
         */
        Windows: function () {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function () {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };

    WinJSContrib.CrossPlatform.resolveLocalFileSystemURL = function (path) {
        return new WinJS.Promise(function (c, e) {
            resolveLocalFileSystemURL(path, c, e);
        });
    }

    WinJSContrib.Alerts = WinJSContrib.Alerts || {};

    WinJSContrib.Alerts.messageBox = function messageBox(opt, isPhone) {
        if (opt) {
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
        return WinJS.Promise.wrapError("you must specify commands as an array of objects with properties text and callback such as {text: '', callback: function(c){}}");
    };

    WinJSContrib.Alerts.message = function (title, content) {
        return WinJSContrib.Alerts.messageBox({ title: title, content: content });
    }

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

    WinJSContrib.Alerts.toastNotification = function (data) {
        if (window.plugin && window.plugin.notification) {
            window.plugin.notification.local.add({
                id: WinJSContrib.Utils.guid(), // A unique id of the notifiction
                date: new Date(), // This expects a date object
                message: data.text, // The message that is displayed
                title: data.text, // The title of the message
                //repeat: String,  // Either 'secondly', 'minutely', 'hourly', 'daily', 'weekly', 'monthly' or 'yearly'
                //badge: Number,  // Displays number badge to notification
                //sound: String,  // A sound to be played
                //json: String,  // Data to be passed through the notification
                autoCancel: true, // Setting this flag and the notification is automatically canceled when the user clicks it
                //ongoing: Boolean, // Prevent clearing of notification (Android only)
            });
        }
        else {
            throw "No notification plugin found";
        }
    }

    WinJSContrib.Alerts.toast = function (text, picture) {
        WinJSContrib.Alerts.toastNotification({ text: text, picture: picture });
    }
})();