(function () {
    "use strict";
    var pageItems = [{ title: 'page 1 item 1' }, { title: 'page 1 item 2' }, { title: 'page 1 item 2' }];

    WinJS.UI.Pages.define("./pages/childviewflyout/picker/page1/page1.html", {
        ready: function (element, options) {
            var page = this;
            this.listitems = element.querySelector('#listitems').winControl;
            this.listitems.itemDataSource = new WinJS.Binding.List(pageItems).dataSource;
            this.listitems.oniteminvoked = function (arg) {
                arg.detail.itemPromise.done(function (item) {
                    page.close(item.data);
                });
            }
        },

        openPage: function () {
            var page = this;
            //parent navigator can be fetched
            var nav = WinJSContrib.UI.parentChildView(this.element);
            nav.pick('./pages/childviewflyout/picker/page2/page2.html').done(function (arg) {
                if (arg.completed) {
                    $('#pickResult', page.element).text('you picked ' + arg.data.title);
                } else {
                    $('#pickResult', page.element).text('picking cancled');
                }
            });
        },

        cancelPicking: function () {
            //cancel picking
            this.cancel()
        }
    });
})();
