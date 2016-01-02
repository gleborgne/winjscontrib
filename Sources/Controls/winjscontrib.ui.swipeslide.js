(function () {
    'use strict';

    function debugLog(msg) {
        //console.log(msg);
    }

    WinJS.Namespace.define("WinJSContrib.UI", {
        SwipeSlide: WinJS.Class.mix(WinJS.Class.define(function ctor(element, options) {
            this.element = element || document.createElement('DIV');
            options = options || {};
            this.moveDivider = options.moveDivider || 1;
            this.threshold = options.threshold || 40;
            this.touchOnly = false;
            this.minSwipeDistance = options.minSwipeDistance || 100;
            this.direction = options.direction || 'horizontal';
            if (!this.element.winControl)
                this.element.winControl = this;

            this.element.classList.add('mcn-swipeslide');
            this.element.classList.add('win-disposable');
            this.target = this.element;
            this.eventTracker = new WinJSContrib.UI.EventTracker();
            this.ptDown = null;
            this.registerEvents();            
            this.allowed = options.allowed || { left: true, right: true, top : false, bottom : false };
            this.disabled = false;
            WinJS.UI.setOptions(this, options);
            this.thresholdFactor = this.thresholdFactor || 4;
        }, {

            registerEvents: function () {
                if (this.element.onpointerdown !== undefined) {
                    this.eventTracker.addEvent(this.element, 'pointerdown', this._processDown.bind(this), false);
                    this.eventTracker.addEvent(this.element, 'pointerup', this._processUp.bind(this), false);
                    this.eventTracker.addEvent(this.element, 'pointercancel', this._processCancel.bind(this), false);
                    this.eventTracker.addEvent(this.element, 'pointermove', this._processMove.bind(this), false);
                } else if (window.Touch) {
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

            _initPtDown: function (event) {
                var transformOffsetX = 0, transformOffsetY = 0; //[0][0].getFloatValue(CSSPrimitiveValue.CSS_PX);

                if (event.changedTouches) {
                    if (window.WebKitCSSMatrix) {
                        var matrix = new window.WebKitCSSMatrix(this.target.style.transform || this.target.style.webkitTransform || '');
                        transformOffsetX = matrix.m41;
                        transformOffsetY = matrix.m42;
                    }
                    this.ptDown = { x: event.changedTouches[0].screenX, y: event.changedTouches[0].screenY, confirmed: false, transformOffsetX: transformOffsetX, transformOffsetY: transformOffsetY };
                    //event.preventDefault();
                } else {
                    if (window.MSCSSMatrix) {
                        var matrix = new window.MSCSSMatrix(this.target.style.transform);
                        transformOffsetX = matrix.m41;
                        transformOffsetY = matrix.m42;
                    }
                    this.ptDown = { x: event.screenX, y: event.screenY, confirmed: false, transformOffsetX: transformOffsetX, transformOffsetY: transformOffsetY, maxDX: 0, maxDY: 0 };
                }
            },

            _processDown: function (event) {
                if (this.disabled)
                    return;

                //if (event.pointerId && this.touchOnly && event.pointerType != "touch")
                //    return;

                if (this.capturePointerOnDown) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                this._initPtDown(event);

                //if (this.capturePointerOnDown && event.pointerId && this.element.setPointerCapture) {
                //    this.element.setPointerCapture(event.pointerId);
                //}
            },

            _processLeave: function (event) {
                var ctrl = this;
                var elt = event.currentTarget || event.target;
                console.log("pointer leave");
                ctrl._processUp(event);
                //if (event.pointerId && ctrl.element.releasePointerCapture) {
                //    try {
                //        ctrl.element.releasePointerCapture(event.pointerId);
                //    } catch (exception) { }
                //}
            },

            _processCancel: function (event) {
                var ctrl = this;
                var elt = event.currentTarget || event.target;
                console.log("pointer cancel");
                var elt = event.currentTarget || event.target;
                if (event.pointerId && ctrl.element.releasePointerCapture) {
                    try {
                        ctrl.element.releasePointerCapture(event.pointerId);
                    } catch (exception) { }
                }
                ctrl._cancelMove();
                ctrl.ptDown = null;
                ctrl.dispatchEvent('swipeend');
            },

            _processUp: function (event) {
                var ctrl = this;
                var elt = event.currentTarget || event.target;
                if (event.pointerId && ctrl.element.releasePointerCapture) {
                    try {
                        ctrl.element.releasePointerCapture(event.pointerId);
                    } catch (exception) { }
                }

                if (ctrl.ptDown) {
                    if (event.changedTouches) {
                        var dX = ctrl.ptDown.x - event.changedTouches[0].screenX;
                        var dY = ctrl.ptDown.y - event.changedTouches[0].screenY;
                    } else {
                        var dX = ctrl.ptDown.x - event.screenX;
                        var dY = ctrl.ptDown.y - event.screenY;
                    }
                    var moveval = this.ptDown.transformOffsetX + (-dX - this.threshold) / (window.devicePixelRatio * this.moveDivider);
                    if (ctrl.direction == "vertical") {
                        moveval = this.ptDown.transformOffsetY + (-dY - this.threshold) / (window.devicePixelRatio * this.moveDivider);
                    }

                    var enableSwipe = true;
                    if (event.pointerId && this.touchOnly && event.pointerType != "touch") {
                        enableSwipe = false;
                    }

                    if (enableSwipe && ctrl._acceptSwipe(moveval)) {
                        if (this.setMoveIntent)
                            cancelAnimationFrame(this.setMoveIntent);

                        var arg = { dX: dX, dY: dY, move: (-dX - ctrl.threshold), screenMove: ctrl.ptDown.screenMove, direction: dX > 0 ? 'left' : 'right', handled: false };

                        if (ctrl.direction == "vertical") {
                            arg.move = (-dY - ctrl.threshold);
                            arg.direction = dY > 0 ? 'top' : 'bottom'
                        }

                        if (
                            (arg.direction == "left" && ctrl.allowed.left) ||
                            (arg.direction == "right" && ctrl.allowed.right) ||
                            (arg.direction == "top" && ctrl.allowed.top) ||
                            (arg.direction == "bottom" && ctrl.allowed.bottom)) {
                            ctrl.dispatchEvent('swipe', arg);
                            debugLog('swipe slide, swipeHandled ' + ctrl.swipeHandled + '/' + arg.handled + '/' + ctrl.zurgl);
                            if (!ctrl.swipeHandled) {
                                ctrl._cancelMove();
                            }
                        } else {
                            ctrl._cancelMove();
                        }
                    } else {
                        if (this.ptDown.maxDX < ctrl.threshold && this.ptDown.maxDY < ctrl.threshold) {
                            ctrl.dispatchEvent('invoked', arg);
                            if (!ctrl.swipeHandled) {
                                ctrl._cancelMove();
                            }
                        } else {
                            ctrl._cancelMove();
                        }
                    }
                } else {
                    ctrl._cancelMove();
                }

                ctrl.ptDown = null;
                ctrl.dispatchEvent('swipeend');
            },

            _acceptSwipe: function (move) {
                var ctrl = this;
                var abs = Math.abs(move);

                if (abs < ctrl.minSwipeDistance)
                    return false;

                if (ctrl.direction == "vertical")
                    return abs > (ctrl.element.clientHeight / ctrl.thresholdFactor)

                return abs > (ctrl.element.clientWidth / ctrl.thresholdFactor)
            },

            _toSize: function (x) {
                if (x !== 0)
                    return x + 'px';
                else
                    return '0px';
            },

            _cancelMove: function () {
                var ctrl = this;
                var target = this.target;
                var x = 0, y = 0;
                if (this.ptDown) {
                    x = this.ptDown.transformOffsetX;
                    y = this.ptDown.transformOffsetY;
                }
                if (this.setMoveIntent)
                    cancelAnimationFrame(this.setMoveIntent);

                debugLog('swipe slide, cancel move ' + x + '/' + y);
                if (target) {
                    target.style.transition = "transform 120ms ease-out";
                    if (target.style.hasOwnProperty('webkitTransition'))
                        target.style.webkitTransition = 'transform 90ms ease-out';
                    setImmediate(function () {
                        target.style.transform = 'translate3d(' + ctrl._toSize(x) + ', ' + ctrl._toSize(y) + ', 0px)';
                        if (target.style.hasOwnProperty('webkitTransform'))
                            target.style.webkitTransform = 'translate3d(' + ctrl._toSize(x) + ', ' + ctrl._toSize(y) + ', 0px)';

                        setTimeout(function () {
                            target.style.transition = "";
                            if (target.style.hasOwnProperty('webkitTransition'))
                                target.style.webkitTransition = '';
                        }, 100);
                    });
                }
            },

            _processMove: function (event) {
                var ctrl = this;
                if (this.disabled)
                    return;

                if (!this.ptDown && event.changedTouches) {
                    this._initPtDown(event);
                }

                if (this.ptDown) {
                    var enableSwipe = true;
                    if (event.pointerId && this.touchOnly && event.pointerType != "touch") {
                        enableSwipe = false;
                    }

                    if (!enableSwipe)
                        return;

                    if (event.changedTouches) {
                        var dX = this.ptDown.x - event.changedTouches[0].screenX;
                        var dY = this.ptDown.y - event.changedTouches[0].screenY;

                    } else {
                        var dX = this.ptDown.x - event.screenX;
                        var dY = this.ptDown.y - event.screenY;
                    }
                    var adX = Math.abs(dX);
                    var adY = Math.abs(dY);
                    this.ptDown.maxDX = Math.max(this.ptDown.maxDX, adX);
                    this.ptDown.maxDY = Math.max(this.ptDown.maxDY, adY);
                    
                    if (ctrl.direction == "vertical") {
                        if (adY > 5 && adY > adX) {
                            event.preventDefault(); //webkit...
                            event.stopPropagation();
                        }
                    }else{
                        if (adX > 5 && adX > adY) {
                            event.preventDefault(); //webkit...
                            event.stopPropagation();
                        }
                    }

                    var moveval = 0
                    if (ctrl.direction == "vertical") {
                        moveval = this.ptDown.transformOffsetY + (-dY - this.threshold) / (window.devicePixelRatio * this.moveDivider);
                    } else {
                        moveval = this.ptDown.transformOffsetX + (-dX - this.threshold) / (window.devicePixelRatio * this.moveDivider);
                    }

                    if (!this.ptDown.confirmed) {
                        if (ctrl.direction == "vertical") {
                            if (adX > this.threshold) {
                                this.ptDown = null;
                                return;
                            }
                            if (adY > this.threshold) {
                                this.ptDown.confirmed = true;
                                //if (event.target && event.target.classList.contains("tap")) {
                                //    var tap = event.target.mcnTapTracking;
                                //}
                                this.swipeHandled = false;
                                debugLog('start swipe');
                                var arg = { dX: dX, dY: dY, move: (-dY - ctrl.threshold), screenMove: ctrl.ptDown.screenMove, direction: dY > 0 ? 'top' : 'bottom', handled: false };
                                this.dispatchEvent('swipestart', arg);
                                var elt = event.currentTarget || event.target;
                                if (event.pointerId && this.element.setPointerCapture) {
                                    this.element.setPointerCapture(event.pointerId);
                                }
                            }
                        } else {
                            if (adY > this.threshold) {
                                this.ptDown = null;
                                return;
                            }
                            if (adX > this.threshold) {
                                this.ptDown.confirmed = true;
                                this.swipeHandled = false;
                                debugLog('start swipe');
                                var arg = { dX: dX, dY: dY, move: (-dX - ctrl.threshold), screenMove: ctrl.ptDown.screenMove, direction: dX > 0 ? 'left' : 'right', handled: false };
                                this.dispatchEvent('swipestart', arg);
                                var elt = event.currentTarget || event.target;
                                if (event.pointerId && this.element.setPointerCapture) {
                                    this.element.setPointerCapture(event.pointerId);
                                }
                            }
                        }
                    }

                    if (this.ptDown.confirmed) {  
                        if (ctrl.direction == "vertical") {
                            debugLog('swipe move ' + dY + ' / ' + moveval);
                            var screenMove = this.setMove(moveval, -dY);
                            var arg = { screenMove: screenMove, move: (-dY - this.threshold), direction: dY > 0 ? 'top' : 'bottom', accept: ctrl._acceptSwipe(moveval), dX: dX, dY: dY };
                        }
                        else {
                            debugLog('swipe move ' + dX + ' / ' + moveval);
                            var screenMove = this.setMove(moveval, -dX);
                            var arg = { screenMove: screenMove, move: (-dX - this.threshold), direction: dX > 0 ? 'left' : 'right', accept: ctrl._acceptSwipe(moveval), dX: dX, dY: dY };
                        }
                        this.dispatchEvent('swipeprogress', arg);
                    }
                }
                else {
                    debugLog('swipe move');
                }
            },

            setMove: function (move, dX) {
                var ctrl = this;

                if (ctrl.direction == "vertical") {
                    var elementRef = this.element.clientHeight;
                    if (dX > 0 && !this.allowed.bottom) {
                        move = Math.sqrt(move);
                        if (move > elementRef / 6)
                            move = elementRef / 6;
                    }
                    else if (dX < 0 && !this.allowed.top) {
                        move = -Math.sqrt(-move);
                        if (move < -(elementRef / 6))
                            move = -(elementRef / 6);
                    }
                } else {
                    var elementRef = this.element.clientWidth;
                    //debugLog('raw move ' + move);
                    if (dX > 0 && !this.allowed.right) {
                        move = Math.sqrt(move);
                        if (move > elementRef / 6)
                            move = elementRef / 6;
                    }
                    else if (dX < 0 && !this.allowed.left) {
                        move = -Math.sqrt(-move);
                        if (move < -(elementRef / 6))
                            move = -(elementRef / 6);
                    }
                }

                if (this.minMoveBounds && move < this.minMoveBounds) {
                    move = this.minMoveBounds;
                }
                if (this.maxMoveBounds && move > this.maxMoveBounds) {
                    move = this.maxMoveBounds;
                }

                if (this.setMoveIntent)
                    cancelAnimationFrame(this.setMoveIntent);
                //debugLog('move ' + move);
                if (ctrl.ptDown) ctrl.ptDown.screenMove = move;

                this.setMoveIntent = requestAnimationFrame(function () {
                    this.setMoveIntent = null;
                    debugLog('transform to ' + move);

                    var translation = 'translate3d(' + ctrl._toSize(move) + ', 0px, 0px)';
                    if (ctrl.direction == "vertical") {
                        translation = 'translate3d(0px, ' + ctrl._toSize(move) + ', 0px)';
                    }

                    if (ctrl.target.style.webkitTransform !== undefined) {
                        ctrl.target.style.webkitTransform = translation;
                    } else {
                        ctrl.target.style.transform = translation;
                    }
                });

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