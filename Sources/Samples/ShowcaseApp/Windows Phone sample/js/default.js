
(function () {
    "use strict";

    var activation = Windows.ApplicationModel.Activation;
    var app = WinJS.Application;
    var nav = WinJS.Navigation;
    var sched = WinJS.Utilities.Scheduler;
    var ui = WinJS.UI;

    app.addEventListener("activated", function (args) {
        var dataloading = function () {
            return WinJS.Promise.timeout(2000);
        }
        document.getElementById('phone').classList.add('wp');

        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }
            // Optimize the load of the application and while the splash screen is shown, execute high priority scheduled work.
            var preparepage = WinJS.UI.processAll().then(function () {
                return WinJS.Resources.processAll()
            }).then(function () {
                return WinJSContrib.UI.Application.splashscreen.init(args);
            });

            args.setPromise(preparepage);
            ui.disableAnimations();
            preparepage.then(function () {
                return WinJSContrib.UI.Application.splashscreen.show(dataloading());
            }).then(function appInitSuccess() {
                var page = "/pages/home/home.html";
                page = "/demos/shell.html";
                return WinJS.Navigation.navigate(page)
            }, function appInitError(err) {
                return WinJS.Navigation.navigate("/pages/errorPage/errorPage.html");
            }).then(function () {
                ui.enableAnimations();
                WinJSContrib.UI.Application.splashscreen.hide();
                if (WinJSContrib.UI.Application.navigator) {
                    WinJSContrib.UI.Application.navigator.addEventListener('pageContentReady', function (arg) {
                        setImmediate(function () {
                            $('.codelink', arg.detail.page.element).addClass('visible').tap(function (elt) {
                                var target = $(elt).data('codepage')
                                var codeview = document.getElementById('codeviewFlyout');
                                var html = $('section[role=main]', arg.detail.page.element).html();
                                codeview.winControl.open('/pages/showcode/showcode.html', { target: target, html: html });
                            });
                        });
                    });
                }
            });
        }
    });

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        app.sessionState.history = nav.history;
    };

    app.start();
})();

var HubGridLayout = {
    vertical: { query: '(orientation: portrait)', layout: 'flexvertical' },
    horizontal: { query: '(orientation: landscape)', layout: 'flexhorizontal' }
};

var MenuViewsOrientations = {
    vertical: { query: '(orientation: portrait)', orientation: 'vertical' },
    horizontal: { query: '(orientation: landscape)', orientation: 'horizontal' }
};