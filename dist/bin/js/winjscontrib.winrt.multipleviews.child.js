/* 
 * WinJS Contrib v2.1.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

(function () {
    "use strict";

    var ViewManagement = Windows.UI.ViewManagement;

    WinJS.Namespace.define("WinJSContrib.WinRT.MultipleViews", {
        currentView: new WinJSContrib.WinRT.MultipleViews.ViewLifetimeControl()
    });

    WinJSContrib.WinRT.MultipleViews.currentView.addEventListener("initialize", function (e) {
        WinJS.UI.processAll(document.body).then(function () {
            WinJS.Application.queueEvent({ type: 'mcnchildview.init' });
            if (e.detail.location && e.detail.location.uri) {
                WinJS.Navigation.navigate(e.detail.location.uri, e.detail.location.state).then(function () {
                    if (WinJSContrib.UI && WinJSContrib.UI.Application && WinJSContrib.UI.Application.splashscreen) {
                        WinJSContrib.UI.Application.splashscreen.hide();
                    }
                });
            }
        });
    }, false);

    WinJSContrib.WinRT.MultipleViews.currentView.addEventListener("navigateTo", function (e) {
        if (e.detail.location && e.detail.location.uri) {
            WinJS.Navigation.navigate(e.detail.location.uri, e.detail.location.state);
        }
    }, false);

    WinJSContrib.WinRT.MultipleViews.currentView.initialize();

    window.addEventListener("message", function (e) {
        if (e.origin === WinJSContrib.WinRT.MultipleViews.thisDomain) {
            if (e.data.doAnimateAndSwitch) {
                animateAndSwitch();
            } else if (e.data.handleProtocolLaunch) {
                handleProtocolLaunch(e.data.uri);
            }
        }
    }, false);

    WinJS.Application.start();
})();

