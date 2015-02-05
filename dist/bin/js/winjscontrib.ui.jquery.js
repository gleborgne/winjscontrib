/* 
 * WinJS Contrib v2.0.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

/// <reference path="winjscontrib.core.js" />
function HSL(hVal, sVal, lVal) {
    var res = {
        h: hVal,
        s: sVal,
        l: lVal,
        addH: function (increment) {
            this.h = this.h + increment;
        },
        addS: function (increment) {
            this.s = this.s + increment;
        },
        addL: function (increment) {
            this.l = this.l + increment;
        },
        toString: function () {
            return 'hsl(' + this.h + ',' + this.s + '%, ' + this.l + '%)';
        },
        clone: function (hInc, sInc, lInc) {
            var res = new HSL(this.h, this.s, this.l);
            res.addH(hInc);
            res.addS(sInc);
            res.addL(lInc);
            return res;
        }
    };

    return res;
}

(function ($) {
    $.fn.winControl = function () {
        return this[0].winControl;
    };
})(jQuery);

(function ($) {
    function ptDown(event) {
        var elt = event.currentTarget || event.target;
        var tracking = elt.mcnTapTracking;
        if (tracking && (event.button === undefined || event.button === 0 || (tracking.allowRickClickTap && event.button === 2))) {
            event.stopPropagation();
            if (tracking.lock) {
                if (event.pointerId && event.currentTarget.setPointerCapture)
                    event.currentTarget.setPointerCapture(event.pointerId);
                
                event.preventDefault();
            }
            var $this = $(event.currentTarget);
            $this.addClass('tapped');
            if (event.changedTouches) {
                tracking.pointerdown = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
            } else {
                tracking.pointerdown = { x: event.clientX, y: event.clientY };
            }
            tracking.animDown(event.currentTarget);
            if (tracking.tapOnDown) {
                tracking.callback(elt);
            }
        }
    }

    function ptOut(event) {
        var elt = event.currentTarget || event.target;
        var tracking = elt.mcnTapTracking;
        if (tracking && tracking.pointerdown) {
            var $this = $(elt);
            $this.removeClass('tapped');
            event.stopPropagation();
            //event.currentTarget.mcnTapTracking.pointerdown = undefined;
            if (event.pointerId && elt.releasePointerCapture)
                elt.releasePointerCapture(event.pointerId);

            if (!tracking.disableAnimation)
                tracking.animUp(event.currentTarget);
        }
    }

    function ptUp(event) {
        var elt = event.currentTarget || event.target;
        var tracking = elt.mcnTapTracking;
        if (tracking && (event.button === undefined || event.button === 0 || (tracking.allowRickClickTap && event.button === 2))) {
            var $this = $(elt);

            event.stopPropagation();
            if (elt.releasePointerCapture)
                elt.releasePointerCapture(event.pointerId);

            if (tracking && !tracking.tapOnDown) {
                var resolveTap = function () {
                    if (tracking && tracking.pointerdown) {
                        if (event.changedTouches) {
                            var dX = Math.abs(tracking.pointerdown.x - event.changedTouches[0].clientX);
                            var dY = Math.abs(tracking.pointerdown.y - event.changedTouches[0].clientY);
                        } else {
                            var dX = Math.abs(tracking.pointerdown.x - event.clientX);
                            var dY = Math.abs(tracking.pointerdown.y - event.clientY);
                        }

                        if (tracking.callback && dX < 15 && dY < 15) {
                            event.stopImmediatePropagation();
                            event.stopPropagation();
                            event.preventDefault();
                            tracking.callback(elt);
                        }
                        if (tracking && tracking.pointerdown)
                            tracking.pointerdown = undefined;
                    }
                }

                if (tracking.awaitAnim) {
                    tracking.animUp(elt).done(resolveTap);
                }
                else {
                    tracking.animUp(elt);
                    resolveTap();
                }
                //.done(function () {

                //});
            }
            $this.removeClass('tapped');
        }
    }

    $.fn.tap = function (callback, options) {
        var opt = options || {};

        return this.each(function () {
            var $this = $(this);
            $this.addClass('tap');
            if (this.mcnTapTracking) {
                this.mcnTapTracking.dispose();
            }
            this.mcnTapTracking = this.mcnTapTracking || {};
            this.mcnTapTracking.eventTracker = new WinJSContrib.UI.EventTracker();
            this.mcnTapTracking.disableAnimation = opt.disableAnimation;
            if (this.mcnTapTracking.disableAnimation) {
                this.mcnTapTracking.animDown = function () { return WinJS.Promise.wrap() };
                this.mcnTapTracking.animUp = function () { return WinJS.Promise.wrap() };
            } else {
                this.mcnTapTracking.animDown = opt.animDown || WinJS.UI.Animation.pointerDown;
                this.mcnTapTracking.animUp = opt.animUp || WinJS.UI.Animation.pointerUp;
            }
            this.mcnTapTracking.element = this;
            this.mcnTapTracking.callback = callback;
            this.mcnTapTracking.lock = opt.lock;
            this.mcnTapTracking.awaitAnim = opt.awaitAnim || false;
            this.mcnTapTracking.disableAnimation = opt.disableAnimation;
            this.mcnTapTracking.tapOnDown = opt.tapOnDown;
            this.mcnTapTracking.pointerModel = 'none';
            this.mcnTapTracking.dispose = function () {
                this.element.classList.remove('tap');
                this.eventTracker.dispose();
                this.element.mcnTapTracking = null;
                this.element = null;
            }
            if (this.onpointerdown !== undefined) {
                this.mcnTapTracking.pointerModel = 'pointers';
                this.mcnTapTracking.eventTracker.addEvent(this, 'pointerdown', ptDown);
                this.mcnTapTracking.eventTracker.addEvent(this, 'pointerout', ptOut);
                this.mcnTapTracking.eventTracker.addEvent(this, 'pointerup', ptUp);
            } else if (window.Touch) {
                this.mcnTapTracking.pointerModel = 'touch';
                this.mcnTapTracking.eventTracker.addEvent(this, 'touchstart', ptDown);
                this.mcnTapTracking.eventTracker.addEvent(this, 'touchcancel', ptOut);
                this.mcnTapTracking.eventTracker.addEvent(this, 'touchend', ptUp);
            } else {
                this.mcnTapTracking.pointerModel = 'mouse';
                this.mcnTapTracking.eventTracker.addEvent(this, 'mousedown', ptDown);
                this.mcnTapTracking.eventTracker.addEvent(this, 'mouseleave', ptOut);
                this.mcnTapTracking.eventTracker.addEvent(this, 'mouseup', ptUp);
            }
        });
    };

    $.fn.untap = function (callback) {
        return this.each(function () {
            var $this = $(this);
            
            if (this.mcnTapTracking) {
                this.mcnTapTracking.dispose();
            }            
        });
    };

    jQuery.fn.hatchShow = function () {
        $('.hsjs').css('visibility', 'hidden').css('font-size', '').css('display', 'inner-block').css('white-space', 'pre').each(function () {
            var t = $(this);
            var parent = t.parent();
            if (parent.hasClass('hatchshow_temp')) {
                //t = parent;
                parent = parent.parent();
            }
            else {
                t.wrap("<span class='hatchshow_temp' style='display:block'>");
            }
            var pw = parent.width();
            var w = t.width();
            while (t.width() < pw) {
                var fsize = t.fontSize();
                if (fsize > 200)
                    break;
                t.css('font-size', (fsize + 1) + "px"),
                  function () {
                      while (t.width() > pw) {
                          var fsize = t.fontSize();
                          if (fsize < 8)
                              break;
                          t.css('font-size', (fsize - .1) + "px")
                      }
                  };
            };
        }).hide().css('visibility', '').fadeIn();
    };


    jQuery.fn.fontSize = function () { return parseInt($(this).css('font-size').replace('px', '')); };

})(jQuery);

(function ($) {
    $.fn.pressEnterDefaultTo = function (eltSelector, scope) {
        return this.each(function () {
            var $this = $(this);
            $this.keypress(function (e) {
                var key = e.which ? e.which : e.keyCode;
                if (key == 13) {
                    var $elt = scope ? $(eltSelector, scope) : $(eltSelector);
                    jQuery(this).blur();
                    e.preventDefault();
                    e.stopPropagation();
                    if ($elt[0].mcnTapTracking && $elt[0].mcnTapTracking.callback) {
                        $elt[0].mcnTapTracking.callback($elt[0]);
                    }
                    $elt.focus().click();
                }
            });
        });
    };

    $.fn.onPressEnter = function (callback) {
        return this.each(function () {
            var $this = $(this);
            $this.keypress(function (e) {
                var key = e.which ? e.which : e.keyCode;
                if (key == 13) {
                    jQuery(this).blur();
                    e.preventDefault();
                    if (callback) callback();
                }
            });
        });
    };

    $.fn.throttleTextChanged = function (throttling, callback) {
        return this.each(function () {
            var elt = this;
            var $this = $(this);
            var lastval = elt.value;
            $this.keydown(function (e) {
                clearTimeout(elt.mcnTxtThrottling);
                elt.mcnTxtThrottling = setTimeout(function () {
                    lastval = elt.value;
                    callback(elt, elt.value);
                }, throttling);
            });

            $this.blur(function (e) {
                if (lastval != elt.value) {
                    lastval = elt.value;
                    callback(elt, elt.value);
                }
            });
        });
    };
})(jQuery);

(function ($) {
    $.fn.transitionProperties = function (properties, delay, targetValueCallback) {
        var that = $(this);
        //-ms-transition: all @transdur ease-in-out;
        return new WinJS.Promise(function (complete, error) {
            var val = properties + ' ' + delay + 'ms ease-out';
            var res = that.css('transition', val);

            if (targetValueCallback) {
                targetValueCallback(res);
            }
            res.delay(delay + 10).promise().done(function () {
                that.css('-ms-transition', '');
                complete(res);
            },
            function () {
                that.css('-ms-transition', '');
                error(res);
            });
        });
    };
})(jQuery);

(function ($) {
    $.fn.toWinJSPromise = function () {
        return new WinJS.Promise(function (complete, error) {
            var res = this.promise().done(function () {
                complete(res);
            },
            function () {
                error(res);
            });
        });
    };
})(jQuery);

(function ($) {
    $.fn.renderWith = function (templateSelector, object) {
        var template = $(templateSelector).get(0);
        if (template)
            template = template.winControl;

        return this.each(function () {
            var $this = $(this);
            if (template) {
                template.render(null, object).done(function (elt) {
                    $this.append(elt.children[0]);
                });
            }
        });
    };
})(jQuery);

(function ($) {
    $.fn.renderWithEach = function (templateSelector, objectArray, itemCallback) {
        var template = $(templateSelector).get(0);
        if (template)
            template = template.winControl;

        return this.each(function () {
            var $this = $(this);
            if (template) {
                objectArray.forEach(function (element, index) {
                    template.render(null, element).done(function (elt) {
                        var templatedElt = elt.children[0];
                        $this.append(templatedElt);
                        if (itemCallback)
                            itemCallback(element, templatedElt);
                    });
                });
            }
        });
    };
})(jQuery);

(function ($) {
    $.fn.scrollInView = function (offset, animate) {
        var viewState = Windows.UI.ViewManagement.ApplicationView.value;
        var horizontal = true;
        if (viewState === Windows.UI.ViewManagement.ApplicationViewState.snapped || viewState === Windows.UI.ViewManagement.ApplicationViewState.fullScreenPortrait)
            horizontal = false;

        return this.each(function () {
            var $this = $(this);
            if (horizontal) {
                this.offsetParent.scrollLeft = this.offsetLeft - (offset ? offset : 0);
            } else {
                this.offsetParent.scrollTop = this.offsetTop - (offset ? offset : 0);
            }
        });
    };
})(jQuery);

(function ($) {
    $.fn.scrollInParentView = function (offset, animate) {
        var viewState = Windows.UI.ViewManagement.ApplicationView.value;
        var horizontal = true;
        if (viewState === Windows.UI.ViewManagement.ApplicationViewState.snapped || viewState === Windows.UI.ViewManagement.ApplicationViewState.fullScreenPortrait)
            horizontal = false;

        return this.each(function () {
            if (horizontal) {
                this.offsetParent.offsetParent.scrollLeft = this.offsetLeft - (offset ? offset : 0);
            } else {
                this.offsetParent.offsetParent.scrollTop = this.offsetTop - (offset ? offset : 0);
            }
        });
    };
})(jQuery);

(function ($) {
    $.fn.loadedPromises = function (callback) {
        var res = [];
        this.each(function () {
            var $this = $(this);
            var that = this;
            var promise = new WinJS.Promise(function (complete, error) {
                function onerror(e) {
                    that.removeEventListener('error', onerror);
                    that.removeEventListener('load', onloaded);
                    error({ message: 'element not loaded', elt: e.currentTarget });
                }

                function onloaded() {
                    that.removeEventListener('error', onerror);
                    that.removeEventListener('load', onloaded);
                    complete(that);
                    if (callback)
                        callback(that);
                }

                that.addEventListener('error', onerror);
                that.addEventListener('load', onloaded, false);

                if (that.naturalWidth > 0) {
                    onloaded();
                }
            });
            res.push(promise);
        });

        return res;
    };

    $.fn.whenLoaded = function (callback) {
        var promises = this.loadedPromises();
        if (callback) {
            WinJS.Promise.join(promises).done(function (res) {
                callback(res);
            });
        } else {
            return WinJS.Promise.join(promises);
        }
    };

    $.fn.afterTransition = function (callback, timeout) {
        var promises = [];
        var completed = false;

        this.each(function () {
            var currentElement = this;

            var prom = new WinJS.Promise(function (complete, error) {
                var onaftertransition = function (event) {
                    if (event.srcElement === currentElement) {
                        close();
                    }
                };
                var close = function () {
                    clearTimeout(timeOutRef);
                    currentElement.removeEventListener("transitionend", onaftertransition, false);
                    complete();
                }

                currentElement.addEventListener("transitionend", onaftertransition, false);
                timeOutRef = setTimeout(close, timeout || 1000);
            });
            promises.push(prom);
        });

        var success = null, error = null;
        var resultPromise = new WinJS.Promise(function (c, e) {
            success = c;
            error = e;
        });

        var p = WinJS.Promise.join(promises);
        p.done(function () {
            if (!completed) {
                completed = true;
                if (callback) {
                    callback();
                }
                success();
                return;
            }
            p.cancel();
            error();
        }, error);

        return resultPromise;
    };

    $.fn.afterAnimation = function (callback) {
        var promises = [];
        this.each(function () {
            var ctrl = this;
            var prom = new WinJS.Promise(function (complete, error) {
                function ontransition(event) {
                    if (event.srcElement === currentElement) {
                        ctrl.removeEventListener("animationend", ontransition);
                        complete();
                    }
                }

                ctrl.addEventListener("animationend", ontransition);
            });
            promises.push(prom);
        });

        WinJS.Promise.join(promises).done(function () {
            if (callback)
                callback();
        });

        return this;
    };

    $.fn.classBasedAnimation = function (classname) {
        var promises = [];
        return this.each(function () {
            var ctrl = this;
            $(ctrl).afterAnimation(function () {
                $(ctrl).removeClass(classname);
            });

            $(ctrl).addClass(classname);
        });
    };
})(jQuery);