// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("./demos/corefeatures/corefeatures.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var page = this;
            $('.feature', element).tap(function (elt) {
                elt.classList.add('active');
                var title = $(elt).text().trim();
                page.masterDetailView.openDetail(elt, { title: title }, {
                    uri: './demos/navigation/navigation.html',
                    prepareHeader: function (arg) {
                        var s = getComputedStyle(elt);
                        arg.header.style.backgroundColor = s.backgroundColor;
                    }
                }).then(function () {
                    elt.classList.remove('active');
                });
            });
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
