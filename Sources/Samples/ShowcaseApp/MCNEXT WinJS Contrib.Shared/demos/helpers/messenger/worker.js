importScripts("/scripts/WinJS/js/base.js");
importScripts("/Scripts/winjscontrib/winjscontrib.messenger.js");

var messenger = new WinJSContrib.Messenger(this, this);

//functions added on the messenger can be called remotely
messenger.applyance = function (arg) {
    return 42;
};

messenger.longRunningOperation = function (arg) {
    if (arg.triggerError) {
        return WinJS.Promise.wrapError({ message: 'error triggered inside the worker' });
    }

    return new WinJS.Promise(function (c, e, p) {
        var max = 1000;
        var count = 0;
        var loop = function () {
            setTimeout(function () {
                count++;
                if (count % 10 == 0) {
                    p(100 * count / max);
                }
                if (count < max)
                    loop();
                else
                    c(42);
            }, 0);
        }

        loop();
    });
};