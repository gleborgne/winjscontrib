// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
	"use strict";
	var logname = 'child2';

    var ChildControl = WinJS.UI.Pages.define("/demos/corefeatures/webcomponents/childcomponent/childcontrol2.html", {
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

    WinJSContrib.UI.WebComponents.register('app-test-child2', ChildControl, {});
})();
