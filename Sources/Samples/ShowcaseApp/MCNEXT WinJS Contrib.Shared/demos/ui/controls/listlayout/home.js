(function () {
    "use strict";

    WinJS.UI.Pages.define("./demos/ui/controls/listlayout/home.html", {
    	init: function () {
    		this.itemsPromise = WinJS.Promise.wrap(DummyData);
    	},

        listItemInvoked: function (arg) {
        	console.log('item clicked');
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
