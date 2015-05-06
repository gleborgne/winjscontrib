(function () {
    "use strict";
    var logname = 'container';

    var TemplateTestControl = WinJS.Class.define(function (element, options) {
        this.element = element || document.createElement('DIV');
        this.content = document.createElement('DIV');
        this.element.appendChild(this.content);
    }, {
        text: {
            get: function () {
                return this.content.innerHTML;
            },
            set: function (val) {
                this.content.innerHTML = val;
            }
        }
    });

    WinJSContrib.UI.WebComponents.register('test-templ', TemplateTestControl, { properties : ['text']});

    WinJS.UI.Pages.define("./demos/corefeatures/webcomponents/webcomponents.html", {
        listItemInvoked: function (arg) {
            console.log('item clicked');
        },

        init: function () {
        	this.itemsPromise = WinJS.Promise.timeout(0).then(function () {
        		return WinJS.Promise.wrap(DummyData);
        	});
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
