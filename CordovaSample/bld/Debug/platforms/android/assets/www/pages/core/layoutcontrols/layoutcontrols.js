// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/core/layoutcontrols/layoutcontrols.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            this.setMenu();
        },
        setMenu: function () {
            WinJSContrib.mainmenu = [
                {
                    link: "./pages/home/home.html",
                    title: "Home",
                    icon: "&#xe10f;"
                },
                {
                    link: "./pages/core/pageactions/pageactions.html",
                    title: "Page actions and page links"
                },
                {
                    link: "./pages/core/pageevents/pageevents.html",
                    title: "custom page events"
                },
                {
                    link: "./pages/core/blockingnavigation/blockingnav.html",
                    title: "prevent navigation in a page"
                },
                {
                    link: "./pages/core/eventtracker/eventtracker.html",
                    title: "events & Event tracker"
                }, ]
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
