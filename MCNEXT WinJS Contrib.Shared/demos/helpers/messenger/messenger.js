(function () {
    "use strict";

    WinJS.UI.Pages.define("./demos/helpers/messenger/messenger.html", {
        ready: function (element, options) {
            var page = this;
            page.iframe = element.querySelector('#messagingframe');
            page.iframeMessenger = new WinJSContrib.Messenger(window, page.iframe.contentWindow);

            page.worker = new Worker('./pages/core/messenger/worker.js');
            page.workerMessenger = new WinJSContrib.Messenger(page.worker, page.worker);

            page.smartWorker = new WinJSContrib.Messenger.SmartWorker();
        },

        iframeOp: function (triggerError) {
            var page = this;
            page.iframeMessenger.start('applyance', { foo: 'bar', triggerError: triggerError }).done(function (arg) {
                console.log('iframe treatment completed : ' + JSON.stringify(arg));
                $('.iframeTreatmentMessage', page.element).text('iframe treatment completed : ' + JSON.stringify(arg));
            }, function (err) {
                console.log('iframe treatment error : ' + JSON.stringify(err));
                $('.iframeTreatmentMessage', page.element).text('iframe treatment error : ' + JSON.stringify(err));
            });
        },

        iframeTreatment: function () {
            var page = this;
            return page.iframeOp(false);
        },

        iframeTreatmentWithError: function () {
            var page = this;
            return page.iframeOp(true);
        },

        webworkerOp : function(triggerError){
            var page = this;
            return page.workerMessenger.start('longRunningOperation', { foo: 'bar', triggerError: triggerError }).then(function (arg) {
                console.log('worker treatment completed : ' + JSON.stringify(arg));
                $('.webworkerTreatmentMessage', page.element).text('worker treatment completed : ' + JSON.stringify(arg));
            }, function (err) {
                console.log('worker treatment error : ' + JSON.stringify(err));
                $('.webworkerTreatmentMessage', page.element).text('worker treatment error : ' + JSON.stringify(err));
            }, function (progress) {
                console.log('worker treatment progress : ' + progress);
                $('.webworkerTreatmentMessage', page.element).text('worker treatment progress : ' + progress);
            });
        },

        webworkerTreatment: function () {
            var page = this;
            return page.webworkerOp(false);
        },

        webworkerTreatmentWithError: function () {
            var page = this;
            return page.webworkerOp(true);
        },

        smartworkerTreatment: function () {
            var page = this;

            page.smartWorker.importScripts('/Scripts/winjscontrib/winjscontrib.core.js').then(function () {
                return page.smartWorker.execute(function (a, b) {
                    return (a + b) + ' & ' + WinJSContrib.Utils.guid();
                }, 42, 42).then(function (result) {
                    console.log('worker dynamic function result : ' + JSON.stringify(result));
                    $('.smartworkerTreatmentMessage', page.element).text('worker dynamic function result : ' + JSON.stringify(result));
                });
            });
        },

        smartworkerTreatmentWithError: function () {
            var page = this;
            var worker = new WinJSContrib.Messenger.SmartWorker();

            //in this case we did not import "WinJSContrib.Utils" so "WinJSContrib.Utils.guid()" will fail if you have not clicked
            worker.execute(function (a, b) {
                return (a + b) + ' & ' + WinJSContrib.Utils.guid();
            }, 42, 42).then(function (result) {
                console.log('worker dynamic function result : ' + JSON.stringify(result));
                $('.smartworkerTreatmentMessage', page.element).text('worker dynamic function result : ' + JSON.stringify(result));
                worker.dispose();
            }, function (err) {
                console.error(err);
                $('.smartworkerTreatmentMessage', page.element).text('worker dynamic function error : ' + JSON.stringify(err));
                worker.dispose();
            });
        },

        unload: function () {
            var page = this;
            page.iframeMessenger.dispose();
            page.workerMessenger.dispose();
            page.smartWorker.dispose();
        }
    });
})();
