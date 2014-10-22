//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

(function () {
    "use strict";


    WinJS.Namespace.define("WinJSContrib.UI", {
        GlobalProgress: WinJS.Class.define(
           function ctor(element, options) {
                var ctrl = this;
                options = options || {};
                ctrl.element = element || document.createElement("div");
                ctrl.throttlingDelay = (options.delay != undefined) ? options.delay : 200;
                ctrl.isVisible = false;
                ctrl.refCount = 0;
                WinJSContrib.UI.Application = WinJSContrib.UI.Application || {};
                if (options.global) {
                    WinJSContrib.UI.Application.progress = ctrl;
                }
                ctrl.element.className = 'mcn-globalprogress-ctrl ' + element.className;
                if (WinJSContrib.CrossPlatform)
                    WinJSContrib.CrossPlatform.cordovaClass(ctrl.element.classList);
                ctrl.element.style.display = 'none';
                ctrl.element.style.opacity = '0';
                element.innerHTML = '<div class="mcn-globalprogress-content"><progress class="bar"></progress><div class="mcn-globalprogress-text">' + (options.text || '') + '</div></div>'
            }, {
                show: function (timeout) {
                    var ctrl = this;

                    if (ctrl.isVisible || ctrl.throttling) {
                        ctrl.refCount = ctrl.refCount + 1;
                        return;
                    }

                    if (timeout == 0) {
                        ctrl.showNow();
                    }
                    else {
                        this.throttling = setTimeout(ctrl.showNow.bind(this), timeout || ctrl.throttlingDelay);
                    }
                },

                showNow: function () {
                    var ctrl = this;
                    ctrl.refCount = ctrl.refCount + 1;

                    if (ctrl.isVisible)
                        return;

                    ctrl.element.style.display = '';
                    WinJS.UI.Animation.fadeIn(ctrl.element);
                    ctrl.isVisible = true;
                },

                hide: function (force) {
                    var ctrl = this;

                    if (force)
                        ctrl.refCount = 0;

                    if(ctrl.refCount > 0)
                        ctrl.refCount = ctrl.refCount - 1;

                    if (ctrl.throttling) {
                        clearTimeout(ctrl.throttling);
                        ctrl.throttling = undefined;
                    }

                    if (ctrl.refCount == 0) {
                        ctrl.isVisible = false;
                        WinJS.UI.Animation.fadeOut(ctrl.element).done(function () {
                            ctrl.element.style.display = 'none';
                        });
                    }
                }
            })
    });
})();