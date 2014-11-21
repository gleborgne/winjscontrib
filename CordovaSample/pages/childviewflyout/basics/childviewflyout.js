(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/childviewflyout/basics/childviewflyout.html", {
        ready: function (element, options) {
            var page = this;
            this.childview = element.querySelector("#childview").winControl;

            //enable to open code for child pages
            this.childview.navigator.addEventListener('pageContentReady', function (arg) {
                $('.codelink', arg.detail.page.element).addClass('visible').tap(function (elt) {
                    var target = $(elt).data('codepage')
                    var codeview = document.getElementById('codeviewFlyout');
                    var html = $('section[role=main]', arg.detail.page.element).html();
                    codeview.winControl.open('./pages/showcode/showcode.html', { target: target, html: html });
                });
            });
        },

        openView: function () {
            this.childview.open("./pages/childviewflyout/basics/page1/page1.html");
        },

        openView2: function () {
            this.childview.open("./pages/childviewflyout/basics/page2/page2.html");
        }
    });
})();
