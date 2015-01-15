(function () {
    "use strict";

    WinJS.UI.Pages.define("./demos/ui/ui.html", {
        ready: function (element, options) {
            var page = this;
            registerSection(page, 'section-ui');
        }
    });    
})();
