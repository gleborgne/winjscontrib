/* 
 * WinJS Contrib v2.1.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

/// <reference path="winjscontrib.core.js" />

(function () {
    'use strict';
    WinJS.Namespace.define("WinJSContrib.UI", {
        StateButton: WinJS.Class.mix(WinJS.Class.define(function ctor(element, options) {
            var ctrl = this;
            ctrl.element = element || document.createElement('DIV');
            options = options || {};
            ctrl.element.winControl = ctrl;
            ctrl.element.classList.add('mcn-statebutton');
            ctrl.element.classList.add('win-disposable');
            ctrl.states = {};
            $(ctrl.element).tap(ctrl._buttonClicked.bind(ctrl));

            ctrl._loadContent(options);

            WinJS.UI.setOptions(ctrl, options);
            ctrl.duration = ctrl.duration || 600;
            ctrl.rotation = ctrl.rotation || 'none';
            ctrl.easing = ctrl.easing || 'elastic-out';
        }, {
            _loadObjContent: function (options) {
                var ctrl = this;
                ctrl._obj = document.createElement('object');
                ctrl.element.appendChild(ctrl._obj);
                ctrl._obj.onload = function () {
                    ctrl.morpheus = new SVGMorpheus(ctrl._obj, { iconId: 'play_arrow', rotation: 'none', duration: 0 });
                    ctrl.morpheus.to('play_arrow', { duration: 1, rotation: 'none' });
                }
                ctrl._obj.className = 'mcn-statebutton-icon';
                ctrl._obj.setAttribute('type', 'image/svg+xml');
                ctrl._obj.setAttribute('data', options.iconset);
            },

            _loadSvgContent: function (options) {
                var ctrl = this;

                return WinJS.xhr({ url: options.iconset }).then(function (r) {
                    var e = r;
                    if (r.responseXML) {
                        var elts = r.responseXML.getElementsByTagName('svg');
                        ctrl.svg = elts[0];
                        ctrl.element.appendChild(ctrl.svg);
                        //ctrl.svg.classList.add('mcn-statebutton-icon');
                        ctrl.morpheus = new SVGMorpheus(ctrl.svg);
                        ctrl._stateName = ctrl.defaultState;
                        ctrl.morpheus.to(ctrl.state, { duration: 1, rotation: 'none' });
                    }
                }, function (err) {
                });
            },

            _loadContent: function (options) {
                if (options.iconset) {
                    return this._loadSvgContent(options);
                }
            },

            _runState: function (stateName) {
                var ctrl = this;
                if (!stateName && ctrl.action) {
                    var meth = WinJSContrib.Utils.resolveMethod(ctrl.element, ctrl.action);
                    if (meth)
                        return WinJS.Promise.as(meth(ctrl.element));
                }

                if (ctrl.morpheus) {
                    var currentState = ctrl.states[stateName];
                    if (currentState) {
                        var p = WinJS.Promise.wrap();
                        if (currentState.action) {
                            var meth = WinJSContrib.Utils.resolveMethod(ctrl.element, currentState.action);
                            if (meth)
                                p = WinJS.Promise.as(meth(ctrl.element));
                        }

                        return p.then(function () {
                            if (currentState.goto && ctrl.states[currentState.goto]) {
                                ctrl._stateName = currentState.goto;
                                ctrl.morpheus.to(currentState.goto, { duration: ctrl.duration, rotation: ctrl.rotation, easing: ctrl.easing });
                            }
                        });

                    }
                }

                return WinJS.Promise.wrapError();
            },

            _buttonClicked: function () {
                var ctrl = this;

                clearTimeout(ctrl.clearError);
                ctrl.element.classList.remove('mcn-success');
                ctrl.element.classList.remove('mcn-error');
                ctrl.clearPending = setTimeout(function () {
                    ctrl.element.classList.add('mcn-pending');
                }, 50);

                ctrl._runState(ctrl.state).then(function (arg) {
                    clearTimeout(ctrl.clearPending);
                    ctrl.element.classList.remove('mcn-pending');
                    ctrl.element.classList.add('mcn-success');
                    ctrl.dispatchEvent('success', arg);
                }, function (err) {
                    ctrl.dispatchEvent('error', err);
                    clearTimeout(ctrl.clearPending);
                    ctrl.element.classList.add('mcn-error');
                });
            },

            state: {
                get: function () {
                    return this._stateName;
                },
                set: function (val) {
                    var ctrl = this;
                    ctrl._stateName = val;
                }
            },

            addState: function (name, action) {

            },

            dispose: function () {
                WinJS.Utilities.disposeSubTree(this.element);
            }
        }),
        WinJS.Utilities.eventMixin,
        WinJS.Utilities.createEventProperties("myevent"))
    });
})();