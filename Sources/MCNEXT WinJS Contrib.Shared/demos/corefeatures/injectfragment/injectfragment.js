(function () {
    "use strict";

    WinJS.UI.Pages.define("/demos/corefeatures/injectfragment/injectfragment.html", {
        ready: function (element, options) {
        }
    });

    //define application-wide injection helpers
    //you will more likely define this at app startup
    WinJSContrib.UI.Pages.defaultFragmentMixins.push({
        usefullLog: function (msg) {
            console.log(msg);
        }
    });

    WinJSContrib.UI.Pages.fragmentMixin(WinJS.UI.Pages.define("/demos/corefeatures/injectfragment/injectedcontent.html", {
        init: function (element, options) {
            //this class mark the control as being able to receive some custom fragment events
            element.classList.add('mcn-layout-ctrl');
        },

        ready: function (element, options) {
            var page = this;

            //the mixin inject some helpers. This one is equivalent to page.element.querySelector 
            var elt = page.q('.mycssSelector');

            //their is also a wrapper for page.element.querySelectorAll
            var elements = page.qAll('.mycssSelector');

            //or scoped jquery selector if you would like
            var elements = page.$('.mycssSelector');

            //This function is defined at the application level and injected by the mixin (see declaration above)
            page.usefullLog('this is usefull Log');

            //You could map controls or elements directly to the fragment by using "data-page-member" attributes
            page.usefullLog('page member is ' + (page.pageContainer ? 'OK' : 'KO'));
        },

        alertMe: function () {
            WinJSContrib.Alerts.message('binding to page/fragment actions', "Do you like what you have seen of WinJS contrib so far ?");
        },

        updateLayout: function (element) {
            var page = this;
            page.usefullLog('control layout update');
        },

        dispose: function () {
            var page = this;
            page.usefullLog('fragment control disposed');
        }
    }));
})();
