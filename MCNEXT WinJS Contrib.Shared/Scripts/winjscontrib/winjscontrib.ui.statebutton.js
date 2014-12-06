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
            ctrl.duration = ctrl.duration || 300;
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
                        ctrl.state = ctrl.defaultState;
                        ctrl.morpheus.to(ctrl.state, { duration: 1, rotation: 'none' });
                    }
                }, function (err) {
                });                
            },

            _loadContent: function (options) {
                return this._loadSvgContent(options);
            },

            _buttonClicked: function () {
                var ctrl = this;
                var duration = 400;
                if (ctrl.morpheus) {
                    var currentState = ctrl.states[ctrl.state];
                    if (currentState) {
                        if (currentState.action) {
                            var meth = WinJSContrib.Utils.resolveMethod(ctrl.element, currentState.action);
                            if (meth)
                                meth(ctrl.element);
                        }

                        if (currentState.goto && ctrl.states[currentState.goto]) {
                            ctrl.state = currentState.goto;
                            ctrl.morpheus.to(currentState.goto, { duration: ctrl.duration, rotation: ctrl.rotation });
                        }
                    }
                }
            },

            state: {
                get: function () {
                    return this._stateName;
                },
                set: function (val) {
                    this._stateName = val;
                }
            },

            addState : function(name, action){

            },

            dispose: function () {
                WinJS.Utilities.disposeSubTree(this.element);
            }
        }),
        WinJS.UI.DOMEventMixin,
        WinJS.Utilities.createEventProperties("myevent"))
    });
})();