// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/bindings/bindings.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var DummyClass = WinJS.Binding.define({ objval: '' });
            var dummy = new DummyClass();
            dummy.objval = 'test text';

            WinJS.Binding.processAll(element.querySelector('#sectiontwoway .mcn-hub-section-content'), dummy);

            var obj = {
                objval: 'Lorem ipsum dolor bla bla  bla bla  bla bla  bla bla  bla bla  bla bla  bla bla  bla bla  bla bla  bla bla ',
                curDate : new Date()
            }
            WinJS.Binding.processAll(element.querySelector('#sectionarguments .mcn-hub-section-content'), obj);

            var samples = {
                pic : '/images/mcnstore.jpg'
            };
            WinJS.Binding.processAll(element.querySelector('#sectionsamples .mcn-hub-section-content'), samples);
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        }
    });
})();
