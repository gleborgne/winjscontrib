/// <reference path="winjscontrib.core.js" />

//this controls requires snap.svg

(function () {
    'use strict';
    WinJS.Namespace.define("WinJSContrib.UI", {
        FOWrapper: WinJS.Class.mix(WinJS.Class.define(function ctor(element, options) {
            this.element = element || document.createElement('DIV');
            options = options || {};
            this.element.winControl = this;
            this.element.classList.add('mcn-fowrapper');
            this.element.classList.add('mcn-layout-ctrl');
            this.element.classList.add('win-disposable');
            WinJS.UI.setOptions(this, options);
            this.render();
        }, {
            someProperty: {
                get: function () {
                    return this._someProperty;
                },
                set: function (val) {
                    this._someProperty = val;
                }
            },

            render: function () {
                var ctrl = this;
                var body = document.createElement("BODY");
                body.style.width = '100%';
                body.style.height = '100%';
                WinJSContrib.Utils.moveChilds(ctrl.element, body);
                ctrl.element.innerHTML = '<svg class="mcn-fowrapper-svg" xmlns="http://www.w3.org/2000/svg" style="width:100%; height: 100%">' +
		            '<defs>' +
		                '<filter id="blur" x="0" y="0"><feGaussianBlur class="gblur" in="SourceGraphic" stdDeviation="0" /></filter>' +
	   	            '</defs>' +
		            '<foreignObject id="fowrapper" width="100%" height="100%" requiredExtensions="http://www.w3.org/1999/xhtml" filter="url(#blur)">' +
		            '</foreignObject>' +
	            '</svg>';
                var container = ctrl.element.querySelector("#fowrapper");
                ctrl.content = body;
                ctrl.blurFilter = ctrl.element.querySelector(".gblur");
                ctrl.sblurFilter = Snap(ctrl.blurFilter);
                container.appendChild(body);
            },

            blurTo: function (blur, duration, easing) {
                var ctrl = this;

                ctrl.sblurFilter.stop();
                if (!duration) {
                    ctrl.blurFilter.setAttribute("stdDeviation", blur);                    
                    return;
                }

                ctrl.sblurFilter.animate({ stdDeviation: blur }, duration, easing || mina.easeout);
            },

            dispose: function () {
                WinJS.Utilities.disposeSubTree(this.element);
                this.element = null;
            }
        }),
		WinJS.Utilities.eventMixin,
		WinJS.Utilities.createEventProperties("myevent"))
    });
})();