(function () {
    'use strict';
    WinJS.Namespace.define("WinJSContrib.Sample", {
        CodeLink: WinJS.Class.mix(WinJS.Class.define(function ctor(element, options) {
            this.element = element || document.createElement('DIV');
            options = options || {};
            element.classList.add('codelink')
            this.element.winControl = this;
            this.element.innerHTML = '<span class="symbol">&#xE160;</span><span class="text">view code !</span>';
            this.element.classList.add('win-disposable');
            WinJS.UI.setOptions(this, options);
            if (options.pagelink) {
                $(element).tap(function () {
                    var codeview = document.getElementById('codeviewFlyout');
                    var html = $(element).closest('.pagecontrol').html();
                    codeview.winControl.open('./demos/showcode/showcode.html', { target: options.pagelink, html: html });
                });
            } else {
                element.style.display = 'none';
            }
        }, {
            someProperty: {
                get: function () {
                    return this._someProperty;
                },
                set: function (val) {
                    this._someProperty = val;
                }
            },
            dispose: function () {
                WinJS.Utilities.disposeSubTree(this.element);
            }
        }),
		WinJS.Utilities.eventMixin,
		WinJS.Utilities.createEventProperties("myevent"))
    });
})();