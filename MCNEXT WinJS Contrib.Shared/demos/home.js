(function () {
    "use strict";

    WinJS.UI.Pages.define("./demos/home.html", {
        ready: function (element, options) {
            var page = this;
            $(page.masterDetailView.detailViewHeader).tap(function () {
                page.masterDetailView.returnToMaster();
            });

            $('.section', element).tap(function (elt) {
                var target = $(elt).data('target');
                var title = $('.title', elt).text().trim();
                page.masterDetailView.openDetail(elt, { title: title }, {
                    uri: target,
                    prepareHeader: function (arg) {
                        var s = getComputedStyle(elt);
                        arg.header.style.backgroundColor = s.backgroundColor;
                    }
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
