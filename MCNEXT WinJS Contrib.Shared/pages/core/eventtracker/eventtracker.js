(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/core/eventtracker/eventtracker.html", {
        ready: function (element, options) {
            var btn = element.querySelector("#mybutton");

            //the event will be removed when calling dispose on the event tracker
            //the custom page navigator adds an "eventTracker" property on your pages, and will dispose it for you
            this.eventTracker.addEvent(btn, "click", function (arg) {
                console.log("clicked");
            });
            this.setMenu();
            //the event tracker can also manage bind events on observable objects

            //anf of course, you could create your own instance : 
            var mytracker = new MCNEXT.UI.EventTracker();
            mytracker.dispose();
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
