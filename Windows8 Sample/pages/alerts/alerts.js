//Please note that all page methods are bound to buttons automatically
//by the custom navigator, look how it's done in the html

(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/alerts/alerts.html", {
        ready: function (element, options) {
        },

        simpleMessage: function () {
            WinJSContrib.Alerts.message("this is a simple message", "this is content for a simple message").done(function () {
                console.log("message was shown");
            });
        },

        confirm: function () {
            WinJSContrib.Alerts.confirm("this is a confirmation request", "are you sure ?", "Yes", "No").done(function confirmed(e) {
                console.log("confirmed");
            }, function canceled(e){
                console.log("canceled");
            });
        },

        rawMessage: function () {
            WinJSContrib.Alerts.messageBox({
                title: "this is a confirmation request",
                content: "are you sure ?",
                commands: [
                    {
                        label: "Yes", isDefault: true, callback: function () {
                            //yes was clicked
                        }
                    },
                    { label: "No" },
                    { label: "Maybe" }
                ]
            }).done(function (e) {
                console.log("you clicked " + e.label);
            });
        },

        simpleToast: function () {
            WinJSContrib.Alerts.toast("this is a toast");
        },

        simpleToastWithPic: function () {
            WinJSContrib.Alerts.toast("this is a toast", "ms-appx:///images/logo.png");
        },

        rawToast: function () {
            WinJSContrib.Alerts.toastNotification({
                text: "this is a toast...",
                text2: "...really",
                template: Windows.UI.Notifications.ToastTemplateType.toastImageAndText02,
                picture: "ms-appx:///images/logo.png",
                //launch: 'if uncommented this string will be passed as an argument while activating the application'
            });
        }
    });
})();
