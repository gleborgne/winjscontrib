(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/bindings/twoway/twoway.html", {
        ready: function (element, options) {
            var dummy = new DummyClass();
            WinJS.Binding.processAll(element, dummy);
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

    });
})();
