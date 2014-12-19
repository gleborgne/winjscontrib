(function () {
    'use strict';
    WinJS.Namespace.define("WinJSContrib.Sample", {
        DocLink: WinJS.Class.mix(WinJS.Class.define(function ctor(element, options) {
            this.element = element || document.createElement('DIV');
            options = options || {};
            element.classList.add('doclink')
            this.element.winControl = this;
            this.element.innerHTML = '<span class="symbol">&#xE160;</span><span class="text">view doc</span>';

            WinJS.UI.setOptions(this, options);
            if (options.datapath) {
                $(element).tap(function () {
                    var codeview = document.getElementById('docviewFlyout');
                    var html = $(element).closest('.pagecontrol').html();
                    codeview.winControl.open('./demos/apidoc/classView/classView.html', { datapath: options.datapath });
                });
            } else {
                element.style.display = 'none';
            }
        }, {
            
        }),
		WinJS.Utilities.eventMixin,
		WinJS.Utilities.createEventProperties("myevent"))
    });
})();