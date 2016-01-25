/* 
 * WinJS Contrib v2.1.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

(function () {
    "use strict";

    WinJS.Namespace.define("WinJSContrib.UI", {
        PivotMultiDevice: WinJS.Class.define(
            function PivotAndroidDevice(element, options) {
                this.element = element || document.createElement('DIV');
                this.element.dataset.winControl = "WinJS.UI.Pivot";
                this.element.classList.add('win-disposable');
                var ctrl = this;
                WinJS.UI.process(ctrl.element).then(function () {
                    if (WinJSContrib.CrossPlatform && (WinJSContrib.CrossPlatform.isMobile.Android() || WinJSContrib.CrossPlatform.isMobile.iOS())) {
                        var pageHub = element.parentElement.querySelector('.win-pivot-viewport');
                        ctrl.pivotviewport = element.querySelector('.win-pivot-viewport');
                        //ctrl.element.winControl.onitemanimationstart = function () {
                        //}
                        ctrl.element.winControl.slider = new WinJSContrib.UI.SwipeSlide(pageHub);
                        ctrl.element.winControl.slider.onswipe = function (arg) {
                            ctrl.pivotviewport.style.opacity = 0;
                            if (arg.detail.direction == 'left') {
                                ctrl.element.winControl._goNext();
                            } else if (arg.detail.direction == 'right') {
                                ctrl.element.winControl._goPrevious();
                            }
                        }
                        ctrl._unregisterEvents();
                        ctrl._registerEvents();
                    }
                });

            },
            {
                _itemanimationstartEvent: function () {
                    this.pivotviewport.style.opacity = 1;

                },
                _registerEvents: function () {
                    if (!this.element)
                        return;
                    this.element.winControl.addEventListener("itemanimationstart", this._itemanimationstartEvent.bind(this), false);
                },

                _unregisterEvents: function () {
                    if (!this.element)
                        return;
                    this.element.winControl.removeEventListener("itemanimationstart", this._itemanimationstartEvent.bind(this), false);
                },
                dispose: function () {
                    this._unregisterEvents();
                    WinJS.Utilities.disposeSubTree(this.element);
                }
            })
    });
})();