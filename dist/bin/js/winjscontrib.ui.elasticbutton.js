/* 
 * WinJS Contrib v2.1.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

//this control requires snap.svg

(function () {
    'use strict';
    var elasticbuttonkinds = {
        rectangle: {
            morphpath: 'M286,113c0,0-68.8,6-136,6c-78.2,0-137-6-137-6S6,97.198,6,62.5C6,33.999,13,12,13,12s59-7,137-7c85,0,136,7,136,7s8,17.598,8,52C294,96.398,286,113,286,113z',
            svg: '<svg width="100%" height="100%" viewBox="0 0 300 125" preserveAspectRatio="none"><path d="M286.5,113c0,0-104,0-136.5,0c-35.75,0-136.5,0-136.5,0s0-39.417,0-52.5c0-12.167,0-48.5,0-48.5s101.833,0,136.5,0c33.583,0,136.5,0,136.5,0s0,35.917,0,48.5C286.5,73.167,286.5,113,286.5,113z"/></svg>'
        },
        roundedrectangle: {
            morphpath: 'M287,95.25c0,11.046-5.954,19.75-17,19.75c0,0-90-4-120-4s-120,4-120,4c-11.046,0-17.25-9.5-17.25-20.5c0-8.715,0.25-10.75,0.25-34s-0.681-26.257-1-33.75C11.5,15,18.954,10,30,10c0,0,90,3,120,3s120-3,120-3c11.046,0,17.75,6.5,17,20c-0.402,7.239,0,6.75,0,30.5C287,83.5,287,84.75,287,95.25z',
            svg: '<svg width="100%" height="100%" viewBox="0 0 300 125" preserveAspectRatio="none"><path d="M290,95c0,11.046-8.954,20-20,20c0,0-90,0-120,0s-120,0-120,0c-11.046,0-20-9-20-20c0-8.715,0-25.875,0-34.5c0-7.625,0-22.774,0-30.5c0-11.625,8.954-20,20-20c0,0,90,0,120,0s120,0,120,0c11.046,0,20,8.954,20,20c0,7.25,0,22.875,0,30.5C290,69.125,290,84.5,290,95z"/></svg>'
        },
        round: {
            morphpath: 'M251,150c0,93.5-29.203,143-101,143S49,243.5,49,150C49,52.5,78.203,7,150,7S251,51.5,251,150z',
            svg: '<svg width="100%" height="100%" viewBox="0 0 300 300" preserveAspectRatio="none"><path d="M281,150c0,71.797-59.203,131-131,131S19,221.797,19,150S78.203,19,150,19S281,78.203,281,150z"/></svg>'
        },
    };

    WinJS.Namespace.define("WinJSContrib.UI", {
        ElasticButton: WinJS.Class.mix(WinJS.Class.define(function ctor(element, options) {
            this.element = element || document.createElement('DIV');
            options = options || {};
            this.element.winControl = this;
            this.behavior = {
                speed: { reset: 800, active: 150 },
                easing: { reset: mina.elastic, active: mina.easein }
            };

            this.element.classList.add('mcn-elasticbutton');
            this.element.classList.add('win-disposable');
            WinJS.UI.setOptions(this, options);
        }, {
            kind: {
                get: function () {
                    return this._kind;
                },
                set: function (val) {
                    this._kind = val;
                    this.render();
                }
            },

            render: function () {
                var ctrl = this;
                this.element.classList.add('mcn-elasticbutton-' + ctrl.kind);
                var contentCreated = false;
                if (!ctrl.contentElement) {
                    ctrl.contentElement = document.createElement('DIV');
                    ctrl.contentElement.className = 'mcn-elasticbutton-content';
                    WinJSContrib.Utils.moveChilds(ctrl.element, ctrl.contentElement);
                    contentCreated = true;
                }

                if (!ctrl.bgElement) {
                    ctrl.bgElement = document.createElement('DIV');
                    ctrl.bgElement.className = 'mcn-elasticbutton-bg';
                    ctrl.element.appendChild(ctrl.bgElement);
                }

                if (contentCreated) {
                    ctrl.element.appendChild(ctrl.contentElement);
                }

                if (!ctrl.contentElement) {
                    ctrl.contentElement = document.createElement('DIV');
                    ctrl.contentElement.className = 'mcn-elasticbutton-content';
                    while (ctrl.element.children.length > 0) {
                        ctrl.contentElement.appendChild(ctrl.element.children[0]);
                    }
                    ctrl.element.appendChild(ctrl.contentElement);
                }

                ctrl.currentKind = elasticbuttonkinds[this.kind];
                if (ctrl.currentKind) {
                    ctrl.bgElement.innerHTML = ctrl.currentKind.svg;
                    ctrl.snap = Snap(ctrl.bgElement.querySelector('svg'));
                    ctrl.pathEl = ctrl.snap.select('path');
                    ctrl.paths = {
                        reset: ctrl.pathEl.attr('d'),
                        active: ctrl.currentKind.morphpath
                    };
                    if (ctrl.eventTracker)
                        ctrl.eventTracker.dispose();
                    ctrl.eventTracker = new WinJSContrib.UI.EventTracker();
                    ctrl.eventTracker.addEvent(ctrl.element, 'pointerdown', function (arg) { ctrl._ptdown(arg); });
                    ctrl.eventTracker.addEvent(ctrl.element, 'pointerup', function (arg) { ctrl._ptup(arg); });
                    ctrl.eventTracker.addEvent(ctrl.element, 'pointerleave', function (arg) { ctrl._ptup(arg); })
                }
            },

            _ptdown: function (arg) {
                this.element.classList.add("pressed");
                this.pathEl.stop().animate({ 'path': this.paths.active }, this.behavior.speed.active, this.behavior.easing.active);
            },

            _ptup: function (arg) {
                this.element.classList.remove("pressed");
                this.pathEl.stop().animate({ 'path': this.paths.reset }, this.behavior.speed.reset, this.behavior.easing.reset);
            },

            dispose: function () {
                if (this.eventTracker) this.eventTracker.dispose();
                WinJS.Utilities.disposeSubTree(this.element);
                this.element = null;
            }
        }),
		WinJS.Utilities.eventMixin,
		WinJS.Utilities.createEventProperties("myevent"))
    });
})();