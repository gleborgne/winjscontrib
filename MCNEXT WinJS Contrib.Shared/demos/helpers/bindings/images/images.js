(function () {
    "use strict";

    WinJS.UI.Pages.define("./demos/helpers/bindings/images/images.html", {
        ready: function (element, options) {
            WinJS.Binding.processAll(this.element.querySelector("#simpleImageBinding"), { pic: "./images/mcnstore.jpg" });
            
        },
       
        //this method is bound to button click automatically
        //by the custom navigator, look how it's done in the html
        bgImage: function () {
            WinJS.Binding.processAll(this.element.querySelector("#bgimage"), { pic: "./images/mcnstore.jpg" });
        }
    });
})();
