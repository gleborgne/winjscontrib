(function () {
    "use strict";
    var pageItems = [{ title: 'page 2 item 1' }, { title: 'page 2 item 2' }, { title: 'page 2 item 2' }];

    WinJS.UI.Pages.define("./demos/navigation/childviewflyout/picker/page2/page2.html", {
        openPage: function () {
            var page = this;
            //parent navigator can be fetched
            var nav = WinJSContrib.UI.parentChildView(this.element);
            nav.pick('./demos/navigation/childviewflyout/picker/page1/page1.html').done(function (arg) {
                if (arg.completed) {
                    $('#pickResult', page.element).text('you picked ' + arg.data.title);
                } else {
                    $('#pickResult', page.element).text('picking cancled');
                }
            });
        },

        pickValue: function (action) {
            this.close(action.args);
        },

        cancelPicking: function () {
            //cancel picking
            this.cancel()
        }
    });
})();
