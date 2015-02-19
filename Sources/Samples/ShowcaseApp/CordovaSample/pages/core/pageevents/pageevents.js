(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/core/pageevents/pageevents.html", {
        prepareData: function (element, options) {
            //this event is called while the previous page is exiting
            //put data retrieval logic here, like ajax calls, file access, ...

            //the function can return a promise. The page flow will wait for this promise to complete
            return WinJS.Promise.wrap({ data: 'test' });
        },

        prepare: function (element, options) {
            //at this point the page is still off DOM
            //it's the right place to render items because DOM manipulation
            //could not trigger layout or paint

            //the function can return a promise. The page flow will wait for this promise to complete
            this.setMenu();
            return WinJS.Promise.wrap({ data: 'test' });
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


        layoutPage: function (element, options) {
            //now your page is added to DOM, it's time to layout items
            //before starting to display your page

            //the function can return a promise. The page flow will wait for this promise to complete
            return WinJS.Promise.wrap({ data: 'test' });
        },

        ready: function (element, options) {
            //your page is ready and about to get on screen
        },

        contentReady: function (element, options) {
            //your page is on screen and enter animation is done
        },

        updateLayout: function (element) {
            //page size changed
        },

        exitPage: function () {
            //your page is about to move off screen
            //it's a good place to save ui state

            //the function can return a promise. The promise will be awaited before destroying the page
            return WinJS.Promise.wrap({ data: 'test' });
        },

        unload: function () {
            //your page is off screen and about to be destroyed
        }
    });
})();
