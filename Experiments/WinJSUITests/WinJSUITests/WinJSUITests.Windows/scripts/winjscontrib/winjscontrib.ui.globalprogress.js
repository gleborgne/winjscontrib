/* 
 * WinJS Contrib v2.1.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

(function () {
    "use strict";


    WinJS.Namespace.define("WinJSContrib.UI", {
        GlobalProgress: WinJS.Class.define(
            /**
             * @classdesc 
             * Control for displaying a global progress indicator. The global progress takes care of keeping count of show and hide calls, and it will hide it only when matching
             * @class WinJSContrib.UI.GlobalProgress
             * @param {HTMLElement} element DOM element containing the control
             * @param {Object} options
             * @property {number} throttlingDelay
             */
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
                if (WinJSContrib.CrossPlatform && WinJSContrib.CrossPlatform.crossPlatformClass)
                    WinJSContrib.CrossPlatform.crossPlatformClass(ctrl.element);
                ctrl.element.style.display = 'none';
                ctrl.element.style.opacity = '0';
                element.innerHTML = '<div class="mcn-globalprogress-content"><progress class="bar"></progress><div class="mcn-globalprogress-text">' + (options.text || '') + '</div></div>'
           },
           /**
            *  @lends WinJSContrib.UI.GlobalProgress.prototype
            */
           {
               /**
                * show progress after the throttling delay
                * @param {number} [timeout] custom throttling delay
                */
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

               /**
                * show progress immediately
                */
                showNow: function () {
                    var ctrl = this;
                    ctrl.refCount = ctrl.refCount + 1;

                    if (ctrl.isVisible)
                        return;

                    ctrl.element.style.display = '';
                    WinJS.UI.Animation.fadeIn(ctrl.element);
                    ctrl.isVisible = true;
                },

                /**
                 * hide progress indicator
                 * @param {boolean} [force] force hiding progress indicator and reset calls count
                 */
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