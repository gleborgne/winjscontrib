(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/childviewflyout/basics/page1/page1.html", {
        openPage: function () {
            //parent navigator can be fetched
            var nav = WinJSContrib.UI.parentChildView(this.element);
            nav.navigate('./pages/childviewflyout/basics/page2/page2.html')
        },

        closeFlyout: function () {
            //parent navigator is exposed in your page
            this.navigator.hide()
        }
    });
})();
