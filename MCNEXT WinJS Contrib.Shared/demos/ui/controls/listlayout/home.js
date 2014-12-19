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
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
    { title: 'Change screen rotation or snap' },
];

DummyDataSource = new WinJS.Binding.List(DummyData).dataSource;
