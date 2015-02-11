(function () {
    "use strict";

    WinJS.UI.Pages.define("./demos/navigation/navigator/blockingnav/blockingnav.html", {
        canClose: function () {
            var checkbox = this.q('#cbxblocking');
            if (!checkbox.checked) {
                WinJSContrib.Alerts.message('navigation blocked', 'navigation is blocked, click on checkbox to allow navigation');
            }

            return checkbox.checked;
        }
    });
})();
