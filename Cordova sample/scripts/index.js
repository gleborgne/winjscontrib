// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);


        var app = WinJS.Application;
        var nav = WinJS.Navigation;
        var ui = WinJS.UI;



        app.addEventListener("activated", function (args) {
            if (!window.setImmediate) {
                window.setImmediate = function (callback) { return setTimeout(callback, 10); }
                if (!window.clearImmediate)
                    window.clearImmediate = function (handler) { clearTimeout(handler); }
            }
            var dataloading = function () {
                return WinJS.Promise.timeout(2000);
            }
            if (MCNEXT.Utils.isMobile.Android()) {
                document.getElementById('phone').classList.add('android');
            }
            else if (MCNEXT.Utils.isMobile.iOS()) {
                document.getElementById('phone').classList.add('iOS');
                StatusBar.hide();
            }
            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }
            // Optimize the load of the application and while the splash screen is shown, execute high priority scheduled work.
            var preparepage = WinJS.UI.processAll().then(function () {
                return WinJS.Resources.processAll()
            }).then(function () {
                return MCNEXT.UI.Application.splashscreen.init(args);
            });

            args.setPromise(preparepage);
            ui.disableAnimations();
            preparepage.then(function () {
                return MCNEXT.UI.Application.splashscreen.show(dataloading());
            }).then(function appInitSuccess() {
                return WinJS.Navigation.navigate("./pages/home/home.html")
            }, function appInitError(err) {
                return WinJS.Navigation.navigate("./pages/errorPage/errorPage.html");
            }).then(function () {
                ui.enableAnimations();
                MCNEXT.UI.Application.splashscreen.hide();
                MCNEXT.UI.Application.navigator.addEventListener('pageContentReady', function (arg) {
                    setImmediate(function () {
                        $('.codelink', arg.detail.page.element).addClass('visible').tap(function (elt) {
                            var target = $(elt).data('codepage')
                            var codeview = document.getElementById('codeviewFlyout');
                            var html = $('section[role=main]', arg.detail.page.element).html();
                            codeview.winControl.open('./pages/showcode/showcode.html', { target: target, html: html });
                        });
                    });
                });
            });
            document.addEventListener("backbutton", function (arg) {
                if (!WinJS.Navigation.isFlyout) {
                    if (WinJS.Navigation.canGoBack)
                        WinJS.Navigation.back();
                    else if (MCNEXT.UI.FlyoutPage.openPages.length > 0) {
                        //do nothing
                    } else {
                        navigator.app.exitApp();
                    }
                }
            }, false);

        });

        app.oncheckpoint = function (args) {
            // TODO: This application is about to be suspended. Save any state
            // that needs to persist across suspensions here. If you need to 
            // complete an asynchronous operation before your application is 
            // suspended, call args.setPromise().
            app.sessionState.history = nav.history;
        };

        app.start();
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };
})();