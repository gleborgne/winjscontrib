(function () {
    "use strict";

    WinJS.UI.Pages.define("./demos/ui/controls/listlayout/home.html", {
        ready: function (element, options) {
            var mylistview = element.querySelector('#mylistview');
            mylistview.winControl.forceLayout();
        }
    });
})();


DummyData = [
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
];

DummyDataSource = new WinJS.Binding.List(DummyData).dataSource;
