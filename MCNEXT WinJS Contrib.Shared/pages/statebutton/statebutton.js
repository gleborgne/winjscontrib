// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/statebutton/statebutton.html", {        
        activatePlay: function () {
            var page = this;
            $('#message', page.element).text('you clicked play');
        },

        activatePause: function () {
            var page = this;
            $('#message', page.element).text('you clicked pause');
        },

        activateStop: function () {
            var page = this;
            $('#message', page.element).text('you clicked stop');
        },
    });
})();
