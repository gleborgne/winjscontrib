(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/core/blockingnavigation/blockingnav.html", {
        canClose: function () {
            var checkbox = this.element.querySelector('#cbxblocking');
            return checkbox.checked;
        },
        ready: function (element, options) {
            // TODO: Initialize the page here.
            this.setMenu();
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
                        }, ]);
                }
            }
        },

    });
})();
