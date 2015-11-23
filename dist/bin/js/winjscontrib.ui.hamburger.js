/* 
 * WinJS Contrib v2.1.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

(function () {
    'use strict';
    WinJS.Namespace.define("WinJSContrib.UI", {
        Hamburger: WinJS.Class.define(
            function ElasticInput(element, options) {
                var ctrl = this;
                options = options || {};
                ctrl.element = element || document.createElement('div');
                ctrl.element.classList.add('menu-button');
                ctrl.element.classList.add('active');
                ctrl.element.innerHTML = '<div class="menu-button-wrapper"><span class="menu-global menu-top"></span><span class="menu-global menu-middle"></span><span class="menu-global menu-bottom"></span></div>';
            }, {
                activate: function () {
                    this.element.classList.add('active');
                },
                deactivate: function () {
                    this.element.classList.remove('active');
                },
                on: function () {
                    var ctrl = this;
                    var list = ctrl.element.querySelectorAll('.menu-global');
                    for (var i = 0; i < list.length; i++) {
                        list[i].classList.add('activated');
                    }
                },
                off: function () {
                    var ctrl = this;
                    var list = ctrl.element.querySelectorAll('.menu-global');
                    for (var i = 0; i < list.length; i++) {
                        list[i].classList.remove('activated');
                    }
                },
                tap: function (callBack) {
                    if (callBack)
                        WinJSContrib.UI.tap(this.element, callBack);
                    else {
                        WinJSContrib.UI.untap(this.element);
                    }
                }
            })
    });
})();