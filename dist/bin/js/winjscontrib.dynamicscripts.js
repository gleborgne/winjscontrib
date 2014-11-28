//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

//this is a blank WinJS control structure. It's intended to use as a startup for new controls

(function () {
    'use strict';
    WinJS.Namespace.define("WinJSContrib", {
        DynamicScripts: WinJS.Class.mix(WinJS.Class.define(function ctor(element, options) {
            this.element = element || document.createElement('DIV');
            this.eventTracker = new WinJSContrib.UI.EventTracker();
            options = options || {};
            options.path = options.path || "ms-appx-web:///scripts/winjscontrib/winjscontrib.dynamicscripts.html";
            this.element.winControl = this;
            this.sessions = {};
            this.element.classList.add('win-disposable');
            WinJS.UI.setOptions(this, options);
        }, {
            path: {
                get: function () {
                    return this._path;
                },
                set: function (val) {
                    this._path = val;
                    this._prepareControl();
                }
            },

            _prepareControl: function () {
                var ctrl = this;
                var e = document.domain;
                ctrl.iframe = document.createElement('IFRAME');
                ctrl.iframe.id = "WinJSContribdynamicscripts";
                ctrl.iframe.width = 1;
                ctrl.iframe.height = 1;
                ctrl.iframe.style.position = 'fixed';
                ctrl.iframe.style.visibility = 'hidden';
                ctrl.iframe.src = ctrl.path;
                ctrl.element.appendChild(ctrl.iframe);
                ctrl.messenger = new WinJSContrib.Messenger(window, ctrl.iframe.contentWindow);
            },


            applyScript: function (script, data) {
                var ctrl = this;
                return ctrl.messenger.start("applyScript", { script: script, data: data });
            },

            dispose: function () {
                var ctrl = this;
                ctrl.eventTracker.dispose();
                ctrl.messenger.dispose();
                WinJS.Utilities.disposeSubTree(this.element);
            }
        }),
        WinJS.UI.DOMEventMixin,
        WinJS.Utilities.createEventProperties("myevent"))
    });
})();