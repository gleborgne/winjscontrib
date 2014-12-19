// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/statebutton/statebutton.html", {
        activateActionWithPromise: function () {
            var page = this;
            $('#message', page.element).text('pending call...');
            return WinJS.Promise.timeout(4000).then(function () {
                $('#message', page.element).text('call success');
            });
        },

        activatePlayWithError: function () {
            var page = this;
            $('#message', page.element).text('pending call...');
            return WinJS.Promise.timeout(2000).then(function () {
                $('#message', page.element).text('call error');
                return WinJS.Promise.wrapError({ message: 'simulating some error' });
            });
        },

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
