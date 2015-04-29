(function () {
    "use strict";
    var logname = 'child1';

    var ChildControl = WinJS.UI.Pages.define("/demos/corefeatures/webcomponents/childcomponent/childcontrol1.html", {
    	init: function () {
    		console.log(logname + ' init');
    	},

    	rendered: function (element, options) {
    		console.log(logname + ' rendered');
    	},

    	processed: function (element, options) {
    		console.log(logname + ' processed');
    	},

    	pageLayout: function (element, options) {
    		console.log(logname + ' layout');
    	},

    	ready: function (element, options) {
    		console.log(logname + ' ready');
    	},

    	dispose: function () {
    		console.log(logname + ' dispose');
    	}
    });

    WinJSContrib.UI.WebComponents.register('app-test-child1', ChildControl, {});
})();
