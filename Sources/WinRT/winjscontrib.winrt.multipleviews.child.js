(function () {
    "use strict";

//    WinJSContrib.Logs.getLogger("WinJSContrib.UI.Pages", { prefix: "PAGES", level: WinJSContrib.Logs.Levels.verbose, appenders: ["DefaultConsole"] });
//    WinJSContrib.Logs.getLogger("WinJSContrib.WinRT.MultipleViews", { prefix: "MULTIVIEWSCHILD", level: WinJSContrib.Logs.Levels.verbose, appenders: ["DefaultConsole"] });
//    WinJSContrib.UI.Pages.verboseTraces = true;


    var ViewManagement = Windows.UI.ViewManagement;

    WinJS.Namespace.define("WinJSContrib.WinRT.MultipleViews", {
        currentView: new WinJSContrib.WinRT.MultipleViews.ViewLifetimeControl()
    });

    WinJSContrib.WinRT.MultipleViews.currentView.addEventListener("initialize", function (e) {
        WinJS.Utilities.ready(function () {
            WinJS.UI.processAll(document.body).then(function () {
                WinJS.Application.queueEvent({ type: 'mcnchildview.init' });
                if (e.detail && e.detail.location && e.detail.location.uri) {
                    return WinJS.Navigation.navigate(e.detail.location.uri, e.detail.location.state).then(function () {
                        if (WinJSContrib.UI && WinJSContrib.UI.Application && WinJSContrib.UI.Application.splashscreen) {
                            WinJSContrib.UI.Application.splashscreen.hide();
                        }
                    });
                }
            }, function (err) {
                console.error(err);
            });
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

    WinJS.Application.addEventListener("error", function (arg) {
        console.error(arg);
    });
})();

