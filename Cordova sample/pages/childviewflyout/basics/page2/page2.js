(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/childviewflyout/basics/page2/page2.html", {
        //this function defines if you can close the page
        canClose: function () {
            var page = this;
            var canclose = $('#cbCanClose', page.element)[0];
            return canclose.checked;
        },

        openPage: function () {
            var nav = MCNEXT.UI.parentChildView(this.element);
            nav.navigate('./pages/childviewflyout/basics/page1/page1.html')
        },

        closeFlyout: function () {
            this.navigator.hide();
        }
    });
})();
