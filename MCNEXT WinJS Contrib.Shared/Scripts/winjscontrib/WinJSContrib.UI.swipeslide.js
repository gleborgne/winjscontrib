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
            this.moveDivider = options.moveDivider || 2;
            this.threshold = options.threshold || 40;
            this.direction = options.direction || 'horizontal';
            if (!this.element.winControl)
                this.element.winControl = this;

            this.element.classList.add('mcn-swipeslide');
            this.element.classList.add('win-disposable');
            this.target = this.element;
            this.eventTracker = new WinJSContrib.UI.EventTracker();
            this.ptDown = null;
            this.registerEvents();
            this.allowed = options.allowed || { left: true, right: true };
            this.disabled = false;
            WinJS.UI.setOptions(this, options);
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
                var ctrl = this;
                var elt = event.currentTarget || event.target;
                if (event.pointerId && ctrl.element.releasePointerCapture) {
                    ctrl.element.releasePointerCapture(event.pointerId);
                }

                if (ctrl.ptDown) {
                    if (event.changedTouches) {
                        var dX = ctrl.ptDown.x - event.changedTouches[0].screenX;
                        var dY = ctrl.ptDown.y - event.changedTouches[0].screenY;
                    } else {
                        var dX = ctrl.ptDown.x - event.screenX;
                        var dY = ctrl.ptDown.y - event.screenY;
                    }

                    if (Math.abs(dX) > ctrl.element.clientWidth / 6) {
                        var arg = { dX: dX, dY: dY, move: (-dX - ctrl.threshold), screenMove: ctrl.ptDown.screenMove, direction: dX > 0 ? 'left' : 'right', handled: false };
                        ctrl.dispatchEvent('swipe', arg);
                        //setImmediate(function () {
                        console.log('swipe slide, swipeHandled ' + ctrl.swipeHandled + '/' + arg.handled + '/' + ctrl.zurgl);
                        if (!ctrl.swipeHandled) {
                            ctrl._cancelMove();
                        }
                        //});
                    } else {
                        ctrl._cancelMove();
                    }
                } else {
                    ctrl._cancelMove();
                }

                ctrl.ptDown = null;
            },

            _cancelMove: function () {
                var target = this.target;
                console.log('swipe slide, cancel move')
                if (target) {
                    WinJS.UI.executeTransition(target, {
                        property: "transform",
                        delay: 10,
                        duration: 400,
                        easing: 'ease-in',
                        to: 'translate(0,0)'
                    }).then(function () {
                        target.style.transform = '';
                        if (target.style.hasOwnProperty('webkitTransform'))
                            target.style.webkitTransform = '';
                    });
                }
            },

            _processMove: function (event) {
                if (this.disabled)
                    return;

                if (!this.ptDown && event.changedTouches) {
                    this.ptDown = { x: event.changedTouches[0].screenX, y: event.changedTouches[0].screenY, confirmed: false };
                }

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
                            this.swipeHandled = false;
                            console.log('start swipe');
                            this.dispatchEvent('swipestart');
                            var elt = event.currentTarget || event.target;
                            if (event.pointerId && this.element.setPointerCapture) {
                                this.element.setPointerCapture(event.pointerId);
                            }
                        }
                    }

                    if (this.ptDown.confirmed) {
                        var screenMove = this.setMove((-dX - this.threshold) / this.moveDivider);
                        this.dispatchEvent('swipeprogress', { screenMove: screenMove, move: (-dX - this.threshold) });
                    }
                }
                else {
                    console.log('swipe move');
                }
            },

            setMove: function (move) {
                //console.log('raw move ' + move);
                if (move > 0 && !this.allowed.right) {
                    move = Math.sqrt(move);
                    if (move > this.element.clientWidth / 6)
                        move = this.element.clientWidth / 6;
                }
                else if (move < 0 && !this.allowed.left) {
                    move = -Math.sqrt(-move);
                    if (move < -(this.element.clientWidth / 6))
                        move = -(this.element.clientWidth / 6);
                }

                if (this.minMoveBounds && move < this.minMoveBounds) {
                    move = this.minMoveBounds;
                }
                if (this.maxMoveBounds && move > this.maxMoveBounds) {
                    move = this.maxMoveBounds;
                }

                //console.log('move ' + move);
                if (this.ptDown) this.ptDown.screenMove = move;

                if (this.target.style.webkitTransform !== undefined) {
                    this.target.style.webkitTransform = 'translate(' + move + 'px, 0)';
                } else {
                    this.target.style.transform = 'translate(' + move + 'px, 0)';
                }

                return move;
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
        WinJS.Utilities.createEventProperties("swipe", "swipeprogress", "swipestart"))
    });
})();