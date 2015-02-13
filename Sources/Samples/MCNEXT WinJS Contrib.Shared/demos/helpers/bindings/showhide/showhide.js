(function () {
    "use strict";

    WinJS.UI.Pages.define("./demos/helpers/bindings/showhide/showhide.html", {
        ready: function (element, options) {
            var Dummy = WinJS.Binding.define({ isActive: true });
            var elt = new Dummy();
            WinJS.Binding.processAll(element, elt);
        },

    });
})();
