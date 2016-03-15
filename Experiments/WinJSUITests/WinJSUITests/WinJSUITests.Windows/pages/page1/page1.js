// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/page1/page1.html", {
        processed: function () {
            var page = this;
            page.formtest.onsubmit = function () {
                var valid = page.formtest.valid;
                return false;
            }
        },

        checkForm: function () {
            var page = this;
            if (page.formtest.checkValidity()) {
                WinJS.Navigation.navigate("/pages/page2/page2.html", { gender: page.formtest.slgender.value, firstname: page.formtest.txtfirstname.value, lastname: page.formtest.txtlastname.value });
            }
        },

        ready: function (element, options) {
            // TODO: Initialize the page here.
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
