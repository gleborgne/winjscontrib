//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

(function () {
    "use strict";

    var ViewManagement = Windows.UI.ViewManagement;

    WinJS.Namespace.define("MCNEXT.MultipleViews", {
        currentView: new SecondaryViewsHelper.ViewLifetimeControl()
    });

    MCNEXT.MultipleViews.currentView.addEventListener("initialize", function (e) {
        WinJS.UI.processAll(document.body).then(function () {
            WinJS.Application.queueEvent({ type: 'mcnchildview.init' });
            if (e.detail.location && e.detail.location.uri) {
                WinJS.Navigation.navigate(e.detail.location.uri, e.detail.location.state);
            }
        });
    }, false);

    MCNEXT.MultipleViews.currentView.addEventListener("navigateTo", function (e) {
        if (e.detail.location && e.detail.location.uri) {
            WinJS.Navigation.navigate(e.detail.location.uri, e.detail.location.state);
        }
    }, false);

    MCNEXT.MultipleViews.currentView.initialize();

    window.addEventListener("message", function (e) {
        if (e.origin === SecondaryViewsHelper.thisDomain) {
            if (e.data.doAnimateAndSwitch) {
                animateAndSwitch();
            } else if (e.data.handleProtocolLaunch) {
                handleProtocolLaunch(e.data.uri);
            }
        }
    }, false);

    WinJS.Application.start();
})();

