/* 
 * WinJS Contrib v2.1.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

(function () {
    'use strict';
    WinJS.Namespace.define("WinJSContrib.UI", {
        VisualState: WinJS.Class.mix(WinJS.Class.define(function ctor(element, options) {
            this.element = element || document.createElement('DIV');
            options = options || {};
            this.cssprefix = "state";
            this.isDirty = false;
            this.element.winControl = this;
            this.element.style.display = "none";
            this.element.classList.add('mcn-visualstate');
            this.element.classList.add('mcn-layout-ctrl');
            this.element.classList.add('win-disposable');
            WinJS.UI.setOptions(this, options);
        }, {
            states: {
                get: function () {
                    return this._states;
                },
                set: function (val) {
                    this._states = val;
                }
            },

            target: {
                get: function () {
                    return this._target;
                },
                set: function (val) {
                    this._target = val;
                }
            },

            checkAllStates: function (name, state) {
                var ctrl = this;
                if (ctrl.states) {
                    for (var n in ctrl.states) {
                        ctrl.checkState(n, ctrl.states[n]);
                    }

                    if (ctrl.isDirty) {
                        ctrl.isDirty = false;
                        ctrl.dispatchEvent("statechanged", { sender : this });
                    }
                }
            },

            checkState: function (name, state) {
                var ctrl = this;
                if (!ctrl.element)
                    return;

                var target = ctrl.target || ctrl.element.parentElement;
                var targetW = target.clientWidth;
                var targetH = target.clientHeight;
                var evaluate = true;
                if (state.wGt)
                    evaluate = evaluate && targetW > state.wGt;
                if (state.wGtE)
                    evaluate = evaluate && targetW >= state.wGtE;
                if (state.wLt)
                    evaluate = evaluate && targetW < state.wLt;
                if (state.wLtE)
                    evaluate = evaluate && targetW <= state.wLtE;
                if (state.hGt)
                    evaluate = evaluate && targetH > state.hGt;
                if (state.hGtE)
                    evaluate = evaluate && targetH >= state.hGtE;
                if (state.hLt)
                    evaluate = evaluate && targetH < state.hLt;
                if (state.hLtE)
                    evaluate = evaluate && targetH <= state.hLtE;

                if (evaluate) {
                    if (!state.active) {
                        state.active = true;
                        ctrl.isDirty = true;
                        target.classList.add(ctrl.cssprefix + "-" + name);
                    }
                    
                } else {
                    if (state.active) {
                        state.active = false;
                        ctrl.isDirty = true;
                        target.classList.remove(ctrl.cssprefix + "-" + name);
                    }
                }
            },

            isInState : function(statename){
                var state = this.states[statename];
                if (state && state.active)
                    return true;

                return false;
            },

            pageLayout: function () {
                var ctrl = this;
                ctrl.checkAllStates();
            },

            updateLayout: function () {
                var ctrl = this;
                ctrl.checkAllStates();
            },

            dispose: function () {
                WinJS.Utilities.disposeSubTree(this.element);
                this.element = null;
            }
        }),
		WinJS.Utilities.eventMixin,
		WinJS.Utilities.createEventProperties("statechanged"))
    });
})();