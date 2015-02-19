(function () {
    "use strict";

    WinJS.UI.Pages.define("./demos/corefeatures/eventtracker/eventtracker.html", {
        ready: function (element, options) {
            var btn = element.querySelector("#mybutton");

            //the event will be removed when calling dispose on the event tracker
            //the custom page navigator adds an "eventTracker" property on your pages, and will dispose it for you
            this.eventTracker.addEvent(btn, "click", function (arg) {
                WinJSContrib.Alerts.message('well...', 'Ok, this is not the most impressive sample ever, look at the code (by clicking on the link in the top-right corner) to get a better idea.');
            });
            //the event tracker can also manage bind events on observable objects

            //anf of course, you could create your own instance : 
            var mytracker = new WinJSContrib.UI.EventTracker();
            mytracker.dispose();
        },
    });
})();
