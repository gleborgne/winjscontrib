//Please note that all page methods are bound to buttons automatically
//by the custom navigator, look how it's done in the html

(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/alerts/alerts.html", {
        prepare: function (element, options) {
            element.querySelector('#rowtoast').style.display = 'none';
        },
        ready: function (element, options) {
            this.setMenu()
        },

        setMenu: function () {
            var mainMenu = document.getElementById('mainMenu');
            if (mainMenu) {
                var pagecontrol = mainMenu.querySelector('.pagecontrol');
                if (pagecontrol && pagecontrol.winControl) {
                    pagecontrol.winControl.setMenu([
                        {
                            link: "./pages/home/home.html",
                            title: "Home",
                            icon: "&#xe10f;"
                        },
                        {
                            link: "./pages/bindings/objectproperties/objectproperties.html",
                            title: "object properties utilities"
                        },
                        {
                            link: "./pages/bindings/arguments/arguments.html",
                            title: "parameterized bindings"
                        },
                        {
                            link: "./pages/bindings/showhide/showhide.html",
                            title: "bindings for show, hide, disable"
                        },
                        {
                            link: "./pages/bindings/images/images.html",
                            title: "Binding on images"
                        },
                       {
                           link: "./pages/bindings/dates/dates.html",
                           title: "Binding on dates"
                       },
                       {
                           link: "./pages/bindings/twoway/twoway.html",
                           title: "Two way bindings"
                       },
                       {
                           link: "./pages/alerts/alerts.html",
                           title: "Prompt, dialog, alerts"
                       }, ]);
                }
            }
        },


        simpleMessage: function () {
            MCNEXT.Alert.message("this is a simple message", "this is content for a simple message").done(function () {
                console.log("message was shown");
            });
        },

        confirm: function () {
            MCNEXT.Alert.confirm("this is a confirmation request", "are you sure ?", "Yes", "No").done(function confirmed(e) {
                console.log("confirmed");
            }, function canceled(e) {
                console.log("canceled");
            });
        },

        rawMessage: function () {
            MCNEXT.Alert.messageBox({
                title: "this is a confirmation request",
                content: "are you sure ?",
                commands: [     // maximun 2 commands on WP
                    {
                        label: "Yes", isDefault: true, callback: function () {
                            //yes was clicked
                            console.log("yes");
                        }
                    },
                    {
                        label: "No", callback: function () {
                            console.log("No");
                        }
                    },
                    { label: "Maybe" }

                ]
            }).done(function (e) {
                console.log("you clicked " + e.label);
            });
        },

        simpleToast: function () {
            MCNEXT.Alert.toast("this is a toast");
        },

        simpleToastWithPic: function () {
            MCNEXT.Alert.toast("this is a toast", "ms-appx:///images/logo.png");
        },

        rawToast: function () {
            MCNEXT.Alert.toastNotification({
                text: "this is a toast...",
                text2: "...really",
                template: Windows.UI.Notifications.ToastTemplateType.toastImageAndText02,
                picture: "ms-appx:///images/logo.png",
                //launch: 'if uncommented this string will be passed as an argument while activating the application'
            });
        }
    });
})();
