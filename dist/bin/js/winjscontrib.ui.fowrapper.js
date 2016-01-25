/* 
 * WinJS Contrib v2.1.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

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
                ctrl.wrapperId = WinJSContrib.Utils.guid();
                var body = document.createElement("BODY");
                body.className = "mcn-fowrapper-content";
                body.style.width = '100%';
                body.style.height = '100%';
                WinJSContrib.Utils.moveChilds(ctrl.element, body);
                ctrl.element.innerHTML = '<svg id="' + ctrl.wrapperId + '" class="mcn-fowrapper-svg" xmlns="http://www.w3.org/2000/svg" style="width:100%; height: 100%">' +
                    '<defs>' +
                        '<filter id="blur-' + ctrl.wrapperId + '" x="0" y="0"><feGaussianBlur class="gblur" in="SourceGraphic" stdDeviation="0" /></filter>' +
                    '</defs>' +
                    '<foreignObject class="fowrapper" width="100%" height="100%" requiredExtensions="http://www.w3.org/1999/xhtml" filter="url(#blur-' + ctrl.wrapperId + ')">' +
                    '</foreignObject>' +
                '</svg>';
                var container = ctrl.element.querySelector(".fowrapper");
                ctrl.svg = ctrl.element.querySelector("svg");
                ctrl.container = container;
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
                ctrl.dispatchEvent('blur');
            },

            updateLayout: function () {
                if (this.container) {
                    this.container.setAttribute("width", "100%");
                    this.container.setAttribute("height", "100%");
                }
            },

            dispose: function () {
                WinJS.Utilities.disposeSubTree(this.element);                
                this.element = null;
            }
        }),
        WinJS.Utilities.eventMixin,
        WinJS.Utilities.createEventProperties("blur"))
    });
})();