// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/demos/ui/controls/tilemenu/tilemenu.html", {
        ready: function (element, options) {
            var page = this;
            page.$('.tile').tap(function (elt) {
                page.tilemenu.show(elt, [
                    { title: 'item 1' },
                    { title: 'item 2' },
                    { title: 'item 3' },
                    { title: 'item 4' },
                    { title: 'item 5' },
                    { title: 'item 6' },
                    { title: 'item 7' },
                    { title: 'item 8' },
                ]);
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
