// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/demos/ui/controls/tilemenu/tilemenu.html", {
        ready: function (element, options) {
            var page = this;
            var items = [
                        { title: 'item 01' },
                        { title: 'item 02' },
                        { title: 'item 03' },
                        { title: 'item 04' },
                        { title: 'item 05' },
                        { title: 'item 06' },
                        { title: 'item 07' },
                        { title: 'item 08' },
                        { title: 'item 09' },
                        { title: 'item 10' },
                        { title: 'item 11' },
                        { title: 'item 12' },
                        { title: 'item 13' },
                        { title: 'item 14' },
                        { title: 'item 15' },
                        { title: 'item 16' },
            ]
            page.$('#placement').change(function () {
                page.tilemenu.placement = page.$('#placement').val();
            });

            page.$('#fillmode').change(function () {
                page.tilemenu.fillmode = page.$('#fillmode').val();
            });

            page.$('.tile').tap(function (elt) {
                var nbitems = parseInt(page.$('#nbitems').val(), 10);
                var menuitems = items.slice(0, nbitems);
                page.tilemenu.show(elt, {
                    items: menuitems
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
