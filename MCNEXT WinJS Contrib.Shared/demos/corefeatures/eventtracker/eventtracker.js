(function () {
    "use strict";

    WinJS.UI.Pages.define("./demos/corefeatures/eventtracker/eventtracker.html", {
        ready: function (element, options) {
            var btn = element.querySelector("#mybutton");

            //the event will be removed when calling dispose on the event tracker
            //the custom page navigator adds an "eventTracker" property on your pages, and will dispose it for you
            this.eventTracker.addEvent(btn, "click", function (arg) {
                console.log("clicked");
            });
            //the event tracker can also manage bind events on observable objects

            //anf of course, you could create your own instance : 
            var mytracker = new WinJSContrib.UI.EventTracker();
            mytracker.dispose();
        },
    });
})();
