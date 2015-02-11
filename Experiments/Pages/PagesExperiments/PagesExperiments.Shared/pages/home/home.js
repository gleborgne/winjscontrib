(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/home/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var b = this.q('#yes');
            b.onclick = function () {
                WinJS.Navigation.navigate('/pages/pageWithConstructor/pageWithConstructor.html');
            }
        }
    });
})();
