(function () {
    "use strict";

    WinJS.UI.Pages.define("./demos/corefeatures/pageevents/pageevents.html", {
        init: function (element, options) {
            //this event is called while the previous page is exiting
            //put data retrieval logic here, like ajax calls, file access, ...

            //the function can return a promise. The page flow will wait for this promise to complete
            return WinJS.Promise.wrap({ data: 'test' });
        },

        rendered: function (element, options) {
        	//at this point the page is still off DOM
        	//it's the right place to render items because DOM manipulation
        	//could not trigger layout or paint

        	//the function can return a promise. The page flow will wait for this promise to complete            
        	return WinJS.Promise.wrap({ data: 'test' });
        },

        processed: function (element, options) {
            //at this point the page is still off DOM
            //it's the right place to render items because DOM manipulation
            //could not trigger layout or paint

            //the function can return a promise. The page flow will wait for this promise to complete            
            return WinJS.Promise.wrap({ data: 'test' });
        },


        ready: function (element, options) {
            //your page is ready and about to get on screen
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
