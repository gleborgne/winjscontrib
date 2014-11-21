// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/multiview/childview.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var page = this;
            WinJSContrib.WinRT.MultipleViews.currentView.addEventListener("helloworld", page.treathelloworld.bind(page), false);
            $('#btnHello').tap(function () {
                WinJSContrib.WinRT.MultipleViews.currentView.send('helloworld', { text: 'youpi' });
            });
        },

        treathelloworld: function (data) {
            $('#messages').append('<p>'+ data.detail.text + '</p>');
        },

        closeView : function(){
            WinJSContrib.WinRT.MultipleViews.currentView.close();
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
