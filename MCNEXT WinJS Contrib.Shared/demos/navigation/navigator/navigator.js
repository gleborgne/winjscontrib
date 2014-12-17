(function () {
    "use strict";

    WinJS.UI.Pages.define("./demos/navigation/navigator/navigator.html", {
        ready: function (element, options) {
            var targetpage = options.targetpage || './demos/navigation/navigator/stdpage/stdpage.html';
            this.navigator.navigate(targetpage);
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        }
    });
})();
