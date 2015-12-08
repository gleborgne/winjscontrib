// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    var sampleData = [
                {
                    name: "John Doe"
                },
                {
                    name: "Bill Murphy"
                },
                {
                    name: "Eddy Murray"
                },
                {
                    name: "John Doe"
                },
                {
                    name: "Bill Murphy"
                },
                {
                    name: "Eddy Murray"
                },
                {
                    name: "John Doe"
                },
                {
                    name: "Bill Murphy"
                },
                {
                    name: "Eddy Murray"
                },
                {
                    name: "John Doe"
                },
                {
                    name: "Bill Murphy"
                },
                {
                    name: "Eddy Murray"
                }
    ];

    WinJS.UI.Pages.define("/demos/ui/controls/itemswipe/itemswipe.html", {
        processed: function (element, options) {
            var page = this;
            page.data = new WinJS.Binding.List(sampleData);
            page.listviewdata = new WinJS.Binding.List(sampleData);

            page.listview.itemDataSource = page.listviewdata.dataSource;

            page.data.forEach(function (item) {
                page.itemSwipeTemplate.render(item).then(function (rendered) {
                    page.itemslist.appendChild(rendered);
                });
            });

            page.eventTracker.addEvent(page.itemslist, "itemswipeleft", function (arg) {
                console.log("item swiped to left");
                WinJSContrib.Alerts.message("swiped", "you swiped item " + arg.detail.item.name + " to left");
            });

            page.eventTracker.addEvent(page.itemslist, "itemswiperight", function (arg) {
                console.log("item swiped to right");
                WinJSContrib.Alerts.message("swiped", "you swiped item " + arg.detail.item.name + " to right");
            });

            page.eventTracker.addEvent(page.itemslist, "itemswipeinvoked", function (arg) {
                console.log("item swipe invoked");
                WinJSContrib.Alerts.message("swiped", "you invoked item " + arg.detail.item.name);
            });

            page.eventTracker.addEvent(page.listview.element, "itemswipeleft", function (arg) {
                console.log("item swiped to left");                
                var idx = page.listviewdata.indexOf(arg.detail.item.backingData);
                if (idx >= 0) {
                    page.listviewdata.splice(idx, 1);
                }
            });

            page.eventTracker.addEvent(page.listview.element, "itemswiperight", function (arg) {
                console.log("item swiped to right");
                var idx = page.listviewdata.indexOf(arg.detail.item.backingData);
                if (idx >= 0) {
                    page.listviewdata.splice(idx, 1);
                }
            });

            page.eventTracker.addEvent(page.listview.element, "itemswipeinvoked", function (arg) {
                console.log("item swipe invoked");
                WinJSContrib.Alerts.message("swiped", "you invoked item " + arg.detail.item.name);
            });
        },

        ready: function (element, options) {
            // TODO: Initialize the page here.
        }
    });
})();
