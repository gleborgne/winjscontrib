(function () {
    "use strict";

    WinJS.UI.Pages.define("./demos/home.html", {
        ready: function (element, options) {
            var page = this;            
            page.updateLayout();
            $('.section', element).tap(function (elt) {
                var target = $(elt).data('target');
                var title = $('.title', elt).text().trim();
                page.masterDetailView.openDetail(elt, { title: title }, {
                    uri: target,
                    wrapInMasterDetailView : true,
                    prepareHeader: function (arg) {
                        var s = getComputedStyle(elt);
                        arg.header.style.backgroundColor = s.backgroundColor;
                    }
                });
            });
        },

        updateLayout: function (element) {
            var page = this;
            var m = window.matchMedia('screen and (orientation: portrait)');
            if (m.matches) {
                var w = (($('.home-sections', page.element).innerWidth() - 20) / 2) - 20;
                $('.home-sections .section', page.element).css('width', w + 'px').css('height', w + 'px');
            } else {
                $('.home-sections .section', page.element).css('width', '').css('height', '');
            }
            var e = element;
        }
    });
})();
