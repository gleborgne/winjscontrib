(function () {
    "use strict";

    WinJS.UI.Pages.define("./demos/navigation/childviewflyout/picker/childviewflyout.html", {
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
            var page = this;
            this.childview.pick("./demos/navigation/childviewflyout/picker/page1/page1.html").done(function (arg) {
                if (arg.completed) {
                    $('#view1Result', page.element).text('you picked ' + arg.data.title);
                } else {
                    $('#view1Result', page.element).text('picking canceled');
                }
            });
        },

        openView2: function () {
            var page = this;
            this.childview.pick("./demos/navigation/childviewflyout/picker/page2/page2.html").done(function (arg) {
                if (arg.completed) {
                    $('#view2Result', page.element).text('you picked ' + arg.data.title);
                } else {
                    $('#view2Result', page.element).text('picking canceled');
                }
            });
        }
    });
})();
