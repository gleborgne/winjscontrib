(function () {
    "use strict";

    WinJS.UI.Pages.define("./demos/helpers/bindings/dates/dates.html", {        
        ready: function (element, options) {
            var data = { 
                curDate: new Date(), 
                longAgo: new Date(new Date().setDate(new Date().getDate() - 4)) 
            }

            WinJS.Binding.processAll(
                this.element.querySelector("#simpleImageBinding"),
                data
            );
        },

    });
})();
