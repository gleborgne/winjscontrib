(function () {
    "use strict";

    WinJS.UI.Pages.define("./demos/corefeatures/webcomponents/webcomponents.html", {
        init: function (element, options) {
        	this.itemsPromise = WinJS.Promise.timeout(0).then(function () {
        		return WinJS.Promise.wrap(DummyData);
        	});
        },

        listItemInvoked: function (arg) {
            console.log('item clicked');
        }
    });

    var DummyData = [
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    { title: 'dummy item data' },
    ];

    
})();
