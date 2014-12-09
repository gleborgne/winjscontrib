(function () {
    "use strict";
    var DummyClass = WinJS.Binding.define({ firstName: 'John', lastName: 'Doe', phone: '00 00 00 00 00', mail: 'johndoe@me.com' });

    WinJS.UI.Pages.define("./demos/helpers/bindings/twoway/twoway.html", {
        ready: function (element, options) {
            var dummy = new DummyClass();
            WinJS.Binding.processAll(element, dummy);
        },

    });
})();
