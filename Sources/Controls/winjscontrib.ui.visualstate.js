(function () {
    'use strict';
    WinJS.Namespace.define("WinJSContrib.UI", {
        VisualState: WinJS.Class.mix(WinJS.Class.define(function ctor(element, options) {
            this.element = element || document.createElement('DIV');
            options = options || {};
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
                if (state.wLt)
                    evaluate = evaluate && targetW < state.wLt;
                if (state.hGt)
                    evaluate = evaluate && targetH > state.hGt;
                if (state.hLt)
                    evaluate = evaluate && targetH < state.hLt;

                if (evaluate) {
                    state.active = true;
                    target.classList.add("state-" + name);
                } else {
                    state.active = false;
                    target.classList.remove("state-" + name);
                }
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
		WinJS.Utilities.createEventProperties("myevent"))
    });
})();