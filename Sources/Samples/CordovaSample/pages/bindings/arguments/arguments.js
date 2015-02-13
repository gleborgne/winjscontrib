(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/bindings/arguments/arguments.html", {
        ready: function (element, options) {
            var sampledata = {
                someLongText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit fusce vel sapien elit in malesuada semper mi, id sollicitudin urna fermentum ut fusce varius nisl ac ipsum gravida vel pretium tellus."
            }
            WinJS.Binding.processAll(element, sampledata);
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
