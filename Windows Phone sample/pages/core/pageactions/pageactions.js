(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/core/pageactions/pageactions.html", {
        alertMe: function (pageActionArg) {
            MCNEXT.Alert.messageBox({
                title: pageActionArg.args.title,
                content: "Do you like what you have seen of WinJS contrib so far ?",
                commands: [    // maximun 2 commands on WP
                    { label: "Yes" },
                    {
                        label: "I don\'t know", callback: function () {
                            //do something on command click
                        }
                    }
                ]
            }, true);
        },

        pageActionArgCallback: function () {
            return {
                title: "Great stuff isn't it ?"
            }
        },
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
