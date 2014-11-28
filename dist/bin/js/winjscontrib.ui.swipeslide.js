//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

(function () {
    'use strict';
    WinJS.Namespace.define("WinJSContrib.UI", {
        SwipeSlide: WinJS.Class.mix(WinJS.Class.define(function ctor(element, options) {
            this.element = element || document.createElement('DIV');
            options = options || {};
            this.threshold = options.threshold || 40;
            this.direction = options.direction || 'horizontal';
            this.element.winControl = this;
            this.element.classList.add('win-disposable');
            this.target = this.element;
            WinJS.UI.setOptions(this, options);
            this.eventTracker = new WinJSContrib.UI.EventTracker();
            this.ptDown = null;
            this.registerEvents();
            this.allowed = { left: true, right: true };
            this.disabled = false;
        }, {
            //someProperty: {
            //    get: function () {
            //        return this._someProperty;
            //    },
            //    set: function (val) {
            //        this._someProperty = val;
            //    }
            //},

            registerEvents: function () {
                if (this.element.onpointerdown !== undefined) {
                    this.eventTracker.addEvent(this.element, 'pointerdown', this._processDown.bind(this), true);
                    this.eventTracker.addEvent(this.element, 'pointerup', this._processUp.bind(this), true);
                    //this.eventTracker.addEvent(this.element, 'pointerleave', this._processUp.bind(this), true);
                    this.eventTracker.addEvent(this.element, 'pointermove', this._processMove.bind(this), true);
                } else if (this.element.ontouchstart !== undefined) {
                    this.eventTracker.addEvent(this.element, 'touchstart', this._processDown.bind(this), true);
                    this.eventTracker.addEvent(this.element, 'touchend', this._processUp.bind(this), true);
                    this.eventTracker.addEvent(this.element, 'touchcancel', this._processUp.bind(this), true);
                    this.eventTracker.addEvent(this.element, 'touchmove', this._processMove.bind(this), true);
                } else {
                    this.eventTracker.addEvent(this.element, 'mousedown', this._processDown.bind(this), true);
                    this.eventTracker.addEvent(this.element, 'mouseup', this._processUp.bind(this), true);
                    this.eventTracker.addEvent(this.element, 'mouseleave', this._processUp.bind(this), true);
                    this.eventTracker.addEvent(this.element, 'mousemove', this._processMove.bind(this), true);
                }
            },

            _processDown: function (event) {
                if (this.disabled)
                    return;

                if (event.changedTouches) {
                    this.ptDown = { x: event.changedTouches[0].screenX, y: event.changedTouches[0].screenY, confirmed: false };
                    //event.preventDefault();
                } else {
                    this.ptDown = { x: event.screenX, y: event.screenY, confirmed: false };
                }

            },

            _processUp: function (event) {
                var elt = event.currentTarget || event.target;
                if (event.pointerId && this.element.releasePointerCapture) {
                    this.element.releasePointerCapture(event.pointerId);
                }

                if (this.ptDown) {
                    if (event.changedTouches) {
                        var dX = this.ptDown.x - event.changedTouches[0].screenX;
                        var dY = this.ptDown.y - event.changedTouches[0].screenY;
                    } else {
                        var dX = this.ptDown.x - event.screenX;
                        var dY = this.ptDown.y - event.screenY;
                    }
                    if (Math.abs(dX) > this.element.clientWidth / 6) {
                        var arg = { dX: dX, dY: dY, move: (-dX - this.threshold), direction: dX > 0 ? 'left' : 'right', handled: false };
                        this.dispatchEvent('swipe', arg);
                        if (!arg.handled) {
                            this.setMove(0);
                        }
                    } else {
                        this.setMove(0);
                    }
                } else {
                    this.setMove(0);
                }

                this.ptDown = null;

            },

            _processMove: function (event) {
                if (this.disabled)
                    return;

                if (this.ptDown) {
                    if (event.changedTouches) {
                        var dX = this.ptDown.x - event.changedTouches[0].screenX;
                        var dY = this.ptDown.y - event.changedTouches[0].screenY;


                    } else {
                        var dX = this.ptDown.x - event.screenX;
                        var dY = this.ptDown.y - event.screenY;
                    }

                    if (Math.abs(dX) > 5 && Math.abs(dX) > Math.abs(dY)) {
                        event.preventDefault(); //webkit...
                        event.stopPropagation();
                    }

                    if (!this.ptDown.confirmed) {
                        if (Math.abs(dY) > this.threshold) {
                            this.ptDown = null;
                            return;
                        }
                        if (Math.abs(dX) > this.threshold) {
                            this.ptDown.confirmed = true;
                            var elt = event.currentTarget || event.target;
                            if (event.pointerId && this.element.setPointerCapture) {
                                this.element.setPointerCapture(event.pointerId);
                            }
                        }
                    }

                    if (this.ptDown.confirmed) {
                        this.setMove((-dX - this.threshold) / 2);
                    }
                }
            },

            setMove: function (move) {
                if (move > 0 && !this.allowed.left) {
                    move = Math.sqrt(move);
                    if (move > this.element.clientWidth / 6)
                        move = this.element.clientWidth / 6;
                }
                else if (move < 0 && !this.allowed.right) {
                    move = -Math.sqrt(-move);
                    if (move < -(this.element.clientWidth / 6))
                        move = -(this.element.clientWidth / 6);
                }

                if (this.target.style.webkitTransform !== undefined) {
                    this.target.style.webkitTransform = 'translate3d(' + move + 'px, 0, 0)';
                } else {
                    this.target.style.transform = 'translate3d(' + move + 'px, 0, 0)';
                }
            },

            dispose: function () {
                this.eventTracker.dispose();
                try {
                    WinJS.Utilities.disposeSubTree(this.element);
                } catch (exception) {

                }
            }
        }),
        WinJS.UI.DOMEventMixin,
        WinJS.Utilities.createEventProperties("swipe"))
    });
})();