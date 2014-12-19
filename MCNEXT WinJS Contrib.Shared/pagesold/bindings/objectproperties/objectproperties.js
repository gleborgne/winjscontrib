// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/bindings/objectproperties/objectproperties.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function () {
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


        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        }
    });
})();
