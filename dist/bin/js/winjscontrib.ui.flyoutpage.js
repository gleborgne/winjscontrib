/* 
 * WinJS Contrib v2.1.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */


/// <reference path="winjscontrib.core.js" />
(function () {
    'use strict';
    function debugLog(msg) {
        console.log(msg);
    }

    WinJS.Namespace.define("WinJSContrib.UI", {
        parentFlyoutPage: function (element) {
            if (!element)
                return null;

            var current = element.parentNode;

            while (current) {
                if (current.mcnFlyoutPage) {
                    return current.winControl;
                }
                current = current.parentNode;
            }
        },

        FlyoutPageTrigger: WinJS.Class.define(function (element, options) {
            var ctrl = this;
            ctrl.element = element || document.createElement('DIV');
            options = options || {};
            ctrl.element.classList.add('win-disposable');
            WinJS.UI.setOptions(this, options);
            WinJSContrib.UI.tap(ctrl.element, function () {
                ctrl.openFlyout();
            }, options.tapOptions);
        }, {
            openFlyout: function () {
                if (this.flyoutpage && this.flyoutpage.winControl)
                    this.flyoutpage.winControl.show();
            }
        }),

        FlyoutPage: WinJS.Class.mix(WinJS.Class.define(
        /**
         * @classdesc 
         * display html content or target html fragment as a sidebar flyout page
         * @class WinJSContrib.UI.FlyoutPage
         * @param {HTMLElement} element DOM element containing the control
         * @param {Object} options
         */
        function ctor(element, options) {
            var ctrl = this;
            ctrl.eventTracker = new WinJSContrib.UI.EventTracker();
            ctrl.element = element || document.createElement('DIV');
            options = options || {};

            ctrl.element.mcnFlyoutPage = true;
            ctrl.element.winControl = ctrl;
            ctrl.element.classList.add('mcn-flyoutpage');
            ctrl.element.classList.add('mcn-navigation-ctrl');
            ctrl.element.classList.add('mcn-flyout');
            ctrl.element.classList.add('win-disposable');


            ctrl.hardwareBackBtnPressedBinded = ctrl.hardwareBackBtnPressed.bind(ctrl);
            //ctrl.cancelNavigationBinded = ctrl.cancelNavigation.bind(ctrl);

            ctrl._container = document.createElement('DIV');
            ctrl._container.className = 'mcn-flyoutpage-area';

            ctrl._overlay = document.createElement('DIV');
            ctrl._overlay.className = 'mcn-flyoutpage-overlay';
            ctrl._overlay.innerHTML = '<DIV class="mcn-flyoutpage-overlay-bg"></DIV>'
            ctrl._container.appendChild(ctrl._overlay);
            WinJSContrib.UI.tap(ctrl._overlay, function () {
                ctrl.hide();
            }, { disableAnimation: true });

            ctrl._wrapper = document.createElement('DIV');
            ctrl._wrapper.className = 'mcn-flyoutpage-contentwrapper';
            ctrl._container.appendChild(ctrl._wrapper);

            ctrl._wrapperArea = document.createElement('DIV');
            ctrl._wrapperArea.className = 'mcn-flyoutpage-contentwrapperarea';
            ctrl._wrapper.appendChild(ctrl._wrapperArea);

            ctrl._bg = document.createElement('DIV');
            ctrl._bg.className = 'mcn-flyoutpage-bg';
            ctrl._wrapperArea.appendChild(ctrl._bg);

            ctrl._content = document.createElement('DIV');
            ctrl._content.className = 'mcn-flyoutpage-content';
            ctrl._wrapperArea.appendChild(ctrl._content);

            if (options.edgeSwipe && WinJSContrib.UI.SwipeSlide) {
                debugLog('flyout page edge swipe');
                ctrl.edgeSwipeCtrl = new WinJSContrib.UI.SwipeSlide(null, { moveDivider: 1, threshold: 4, allowed: { left: false, right: false } });
                ctrl.edgeSwipeCtrl.element.classList.add('mcn-edgeswipe');
                document.body.appendChild(ctrl.edgeSwipeCtrl.element);

                ctrl.eventTracker.addEvent(ctrl.edgeSwipeCtrl, 'swipestart', function (arg) { ctrl._edgeSwipeStart(arg); });
                ctrl.eventTracker.addEvent(ctrl.edgeSwipeCtrl, 'swipe', function (arg) { ctrl._edgeSwipeCompleted(arg); });
            }

            if (options.swipeToClose && WinJSContrib.UI.SwipeSlide) {
                debugLog('flyout page swipe to close');
                ctrl.swipeToCloseCtrl = new WinJSContrib.UI.SwipeSlide(ctrl._wrapperArea, { moveDivider: 1, allowed: { left: false, right: false } });

                ctrl.eventTracker.addEvent(ctrl.swipeToCloseCtrl, 'swipe', function (arg) { ctrl._swipeToCloseCompleted(arg); });
            }

            WinJS.UI.setOptions(this, options);

            if (!ctrl.enterAnimation)
                ctrl.enterAnimation = options.enterAnimation || WinJS.UI.Animation.enterPage;
            if (!ctrl.exitAnimation)
                ctrl.exitAnimation = options.exitAnimation || WinJS.UI.Animation.exitPage;




            if (options.uri) {
                new WinJS.UI.HtmlControl(ctrl._content, { uri: options.uri }, function (elt) {
                    ctrl.contentCtrl = elt;
                    WinJSContrib.UI.bindMembers(elt.element, elt);
                    elt.flyoutPage = ctrl;
                    ctrl.bindLinks();
                });
            }
            else {
                WinJSContrib.Utils.moveChilds(ctrl.element, ctrl._content);
                ctrl.bindLinks();
            }
            ctrl.element.appendChild(ctrl._container);
            ctrl._swipeTargets();
            if (!ctrl.display)
                ctrl.display = 'overlay';
        },
        /**
         * @lends WinJSContrib.UI.FlyoutPage.prototype
         */
        {
            /**
             * @field {
             * @type HTMLElement
             */
            content: {
                get: function () {
                    return this._content;
                }
            },

            /**
             * @field {
             * @type HTMLElement
             */
            display: {
                get: function () {
                    return this._display;
                },
                set: function (value) {
                    var val = 'overlay';
                    if (value == 'move')
                        val = 'move';

                    this.element.classList.remove('mcn-overlay');
                    this.element.classList.remove('mcn-move');
                    this.element.classList.add('mcn-' + val);
                    this._display = val;
                    this._swipeTargets();
                }
            },

            /**
             * left | right | top | bottom
             * @field
             * @type string
             */
            placement: {
                get: function () {
                    return this._placement;
                },
                set: function (value) {
                    var ctrl = this;
                    this._placement = value;
                    if (this._placement == 'right') {
                        if (ctrl.edgeSwipeCtrl) {
                            ctrl.edgeSwipeCtrl.allowed.left = true;
                            ctrl.edgeSwipeCtrl.element.classList.remove('mcn-edgeswipe-left');
                            ctrl.edgeSwipeCtrl.element.classList.add('mcn-edgeswipe-right');
                        }
                        if (ctrl.swipeToCloseCtrl) ctrl.swipeToCloseCtrl.allowed.right = true;

                        ctrl.element.classList.add('partial-right');
                        if (!ctrl.enterAnimation) {
                            ctrl.enterAnimation = function (elements) { return WinJSContrib.UI.Animation.slideFromRight(elements, { duration: 300 }) };
                        }
                        if (!ctrl.exitAnimation) {
                            ctrl.exitAnimation = function (elements) { return WinJSContrib.UI.Animation.slideToRight(elements, { duration: 120 }) };
                        }
                    }
                    else if (this._placement == 'left') {
                        if (ctrl.edgeSwipeCtrl) {
                            ctrl.edgeSwipeCtrl.allowed.right = true;
                            ctrl.edgeSwipeCtrl.element.classList.remove('mcn-edgeswipe-right');
                            ctrl.edgeSwipeCtrl.element.classList.add('mcn-edgeswipe-left');
                        }
                        if (ctrl.swipeToCloseCtrl) ctrl.swipeToCloseCtrl.allowed.left = true;

                        ctrl.element.classList.add('partial-left');
                        if (!ctrl.enterAnimation) {
                            ctrl.enterAnimation = function (elements) { return WinJSContrib.UI.Animation.slideFromLeft(elements, { duration: 300 }) };
                        }
                        if (!ctrl.exitAnimation) {
                            ctrl.exitAnimation = function (elements) { return WinJSContrib.UI.Animation.slideToLeft(elements, { duration: 120 }) };
                        }
                    }
                    else if (this._placement == 'bottom') {
                        ctrl.element.classList.add('partial-bottom');
                        if (!ctrl.enterAnimation) {
                            ctrl.enterAnimation = function (elements) { return WinJSContrib.UI.Animation.slideFromBottom(elements, { duration: 300 }) };
                        }
                        if (!ctrl.exitAnimation) {
                            ctrl.exitAnimation = function (elements) { return WinJSContrib.UI.Animation.slideToBottom(elements, { duration: 120 }) };
                        }
                    }
                    else if (this._placement == 'top') {
                        ctrl.element.classList.add('partial-top');
                        if (!ctrl.enterAnimation) {
                            ctrl.enterAnimation = function (elements) { return WinJSContrib.UI.Animation.slideFromTop(elements, { duration: 300 }) };
                        }
                        if (!ctrl.exitAnimation) {
                            ctrl.exitAnimation = function (elements) { return WinJSContrib.UI.Animation.slideToTop(elements, { duration: 120 }) };
                        }
                    }
                }
            },

            hardwareBackBtnPressed: function (arg) {
                var ctrl = this;
                var idx = WinJSContrib.UI.FlyoutPage.openPages.indexOf(ctrl);
                if (idx == WinJSContrib.UI.FlyoutPage.openPages.length - 1) {
                    ctrl.hide();
                    arg.handled = true;
                    if (arg.preventDefault)
                        arg.preventDefault();
                }
            },

            //cancelNavigation: function (args) {
            //    //this.eventTracker.addEvent(nav, 'beforenavigate', this._beforeNavigate.bind(this));
            //    var p = new WinJS.Promise(function (c) { });
            //    args.detail.setPromise(p);
            //    setImmediate(function () {
            //        p.cancel();
            //    });
            //},

            addContentElement: function (element) {
                var ctrl = this;
                ctrl._content.appendChild(element);
            },

            pick: function (url, options) {
                var ctrl = this;
                options = options || {};
                options.uri = url;
                var p = new WinJS.Promise(function (complete, error) {
                    new WinJS.UI.HtmlControl(ctrl._content, options, function (elt) {
                        ctrl.contentCtrl = elt;
                        elt.close = function (result) {
                            ctrl.hide(result);
                        }
                        elt.flyoutPage = ctrl;
                        WinJSContrib.UI.bindMembers(elt.element, elt);
                        ctrl.bindLinks();
                        ctrl.show();

                        ctrl.onbeforehide = function () {
                            ctrl.onbeforehide = null;
                            var result = ctrl.result;
                            setImmediate(function () {
                                complete(result);
                            });
                        };
                        ctrl.onafterhide = function () {
                            ctrl.onafterhide = null;
                            WinJS.Utilities.disposeSubTree(ctrl._content);
                            if (ctrl.contentCtrl.unload) {
                                ctrl.contentCtrl.unload();
                            }
                            ctrl.contentCtrl = null;
                            ctrl._content.innerHTML = '';
                        };
                    });
                });

                return p;
            },

            registerBack: function () {
                var ctrl = this;
                if (ctrl.edgeSwipeCtrl) {
                    ctrl.edgeSwipeCtrl.disabled = true;
                }
                ctrl.navEventsHandler = WinJSContrib.UI.registerNavigationEvents(ctrl, this.hardwareBackBtnPressedBinded);

                //WinJS.Navigation.addEventListener('beforenavigate', this.cancelNavigationBinded);
                //if (window.Windows && window.Windows.Phone)
                //    Windows.Phone.UI.Input.HardwareButtons.addEventListener("backpressed", this.hardwareBackBtnPressedBinded);
                //else
                //    document.addEventListener("backbutton", this.hardwareBackBtnPressedBinded, true);

            },

            //lockNavigation: function () {
            //    if (WinJSContrib.UI.Application && WinJSContrib.UI.Application.navigator)
            //        WinJSContrib.UI.Application.navigator.addLock();
            //},

            show: function () {
                var ctrl = this;
                if (ctrl.contentCtrl && ctrl.contentCtrl.beforeshow) {
                    ctrl.contentCtrl.beforeshow();
                }

                this.dispatchEvent("beforeshow");
                ctrl.element.classList.add('visible');
                ctrl._wrapper.classList.add('visible');
                ctrl._wrapper.style.opacity = '0';
                ctrl._overlay.style.opacity = '0';
                ctrl._overlay.classList.add('visible');
                ctrl.registerBack();

                WinJSContrib.UI.Animation.fadeIn(ctrl._overlay, { duration: 400 });

                var p = WinJS.Promise.wrap();
                if (ctrl.contentCtrl && ctrl.contentCtrl.beforeShowContent) {
                    p = WinJS.Promise.as(ctrl.contentCtrl.beforeShowContent());
                }

                return p.then(function () {
                    return WinJS.Promise.timeout();
                }).then(function () {
                    ctrl.calcAutosize();
                    return WinJS.Promise.timeout();
                }).then(function () {
                    return ctrl.enterAnimation(ctrl._wrapper);
                }).then(function () {
                    WinJSContrib.UI.FlyoutPage.openPages.push(ctrl);
                    if (ctrl.contentCtrl && ctrl.contentCtrl.aftershow) {
                        ctrl.contentCtrl.aftershow();
                    }
                    ctrl.dispatchEvent("aftershow");
                    //ctrl.lockNavigation();
                });
            },

            calcAutosize: function () {
                var ctrl = this;
                if (ctrl.autosize) {
                	var elt = ctrl.element.querySelector('.mcn-flyoutpage-content');
                	var wrapper = ctrl.element.querySelector('.mcn-flyoutpage-contentwrapper');
                	elt = elt.children[0];
                    if (ctrl.placement == 'top' || ctrl.placement == 'bottom') {
                        var h = elt.clientHeight;
                        wrapper.style.height = h + 'px';
                    }
                    else if (ctrl.placement == 'left' || ctrl.placement == 'right') {
                        var h = elt.clientWidth;
                        wrapper.style.width = h + 'px';
                    }
                }
            },

            hide: function (result) {
                var ctrl = this;
                ctrl.result = result;
                if (ctrl.contentCtrl && ctrl.contentCtrl.beforehide) {
                    ctrl.contentCtrl.beforehide();
                }
                this.dispatchEvent("beforehide");
                this._removeNavigationLocks();

                return WinJS.Promise.join([ctrl.exitAnimation(ctrl._wrapper), WinJSContrib.UI.Animation.fadeOut(ctrl._overlay, { duration: 200 })]).then(function () {
                    return WinJS.Promise.timeout(100);
                }).then(function () {
                	ctrl._wrapper.classList.remove('visible');
                	var wrapper = ctrl.element.querySelector('.mcn-flyoutpage-contentwrapper');
                	wrapper.style.width = '';
                	wrapper.style.height = '';                    
                }).then(function () {
                    var idx = WinJSContrib.UI.FlyoutPage.openPages.indexOf(ctrl);
                    WinJSContrib.UI.FlyoutPage.openPages.splice(idx, 1);
                    ctrl._wrapper.style.opacity = '';
                    ctrl._overlay.style.opacity = '';
                    ctrl._overlay.classList.remove('visible');
                    ctrl.element.classList.remove('visible');
                    if (ctrl.contentCtrl && ctrl.contentCtrl.afterhide) {
                        ctrl.contentCtrl.afterhide();
                    }
                    ctrl.dispatchEvent("afterhide");
                });
            },

            _removeNavigationLocks: function () {
                var ctrl = this;
                if (ctrl.navEventsHandler) {
                    ctrl.navEventsHandler();
                    ctrl.navEventsHandler = null;
                }
                //if (WinJSContrib.UI.Application && WinJSContrib.UI.Application.navigator)
                //    WinJSContrib.UI.Application.navigator.removeLock();

                //WinJS.Navigation.removeEventListener('beforenavigate', this.cancelNavigationBinded);
                //if (window.Windows && window.Windows.Phone)
                //    Windows.Phone.UI.Input.HardwareButtons.removeEventListener("backpressed", this.hardwareBackBtnPressedBinded);
                //else
                //    document.removeEventListener("backbutton", this.hardwareBackBtnPressedBinded);

                if (ctrl.edgeSwipeCtrl) {
                    ctrl.edgeSwipeCtrl.disabled = false;
                }

                //if (ctrl.display == 'move') {
                //    ctrl.element.parentElement.style.transform = '';
                //}
            },

            bindLinks: function () {
            	var ctrl = this;

            	var bindFlyout = function (elt) {
            		var target = elt.dataset.flyout;

            		if (target) {
            			WinJSContrib.UI.tap(elt, function (eltarg) {
            				var flyout = document.querySelector(target);
            				if (flyout && flyout.winControl && flyout.winControl.show) {
            					ctrl.element.style.zIndex = '500';
            					ctrl.hide().done(function () {
            						ctrl.element.style.zIndex = '';
            					});
            					flyout.winControl.show();
            				}
            			});
            		}
            	}

            	var flyouts = ctrl.element.querySelectorAll('*[data-flyout]');
            	for (var i=0, l=flyouts.length; i<l ; i++){
            		bindFlyout(flyouts[i]);
            	}

            	var bindLink = function (elt) {
            		var target = elt.dataset.link;

            		if (target && target.indexOf('/') < 0) {
            			var tmp = WinJSContrib.Utils.readProperty(window, target);
            			if (tmp) {
            				target = tmp;
            			}
            		}

            		if (target) {
            			WinJSContrib.UI.tap(elt, function (eltarg) {
            				var actionArgs = eltarg.dataset.linkArgs;
            				if (actionArgs && typeof actionArgs == 'string') {
            					try {
            						var tmp = WinJSContrib.Utils.readValue(eltarg, actionArgs);
            						if (tmp) {
            							actionArgs = tmp;
            						}
            						else {
            							actionArgs = JSON.parse(actionArgs);
            						}
            					}
            					catch (exception) {
            						return;
            					}
            				}

            				ctrl.hide().then(function () {
            					WinJS.Navigation.navigate(target, actionArgs);
            				});
            			});
            		}
            	}

            	var links = ctrl.element.querySelectorAll('*[data-link]');
            	for (var i = 0, l = links.length; i < l ; i++) {
            		bindLink(links[i]);
            	}

            	var bindAction = function (elt) {
            		var actionName = elt.dataset.action;

            		var action = ctrl._content.winControl[actionName];
            		if (action && typeof action === 'function') {
            			WinJSContrib.UI.tap(elt, function (eltarg) {
            				var actionArgs = eltarg.dataset.actionArgs;
            				if (actionArgs && typeof actionArgs == 'string') {
            					try {
            						var tmp = WinJSContrib.Utils.readValue(eltarg, actionArgs);
            						if (tmp) {
            							actionArgs = tmp;
            						}
            						else {
            							actionArgs = JSON.parse(actionArgs);
            						}
            					}
            					catch (exception) {
            						return;
            					}
            				}

            				ctrl.hide().then(function () {
            					ctrl._content.winControl[actionName].bind(ctrl._content.winControl)({ elt: eltarg, args: actionArgs });
            				});
            			});
            		}
            	}
            	var actions = ctrl.element.querySelectorAll('*[data-action]');
            	for (var i = 0, l = actions.length; i < l ; i++) {
            		bindAction(actions[i]);
            	}
            },

            _swipeTargets: function () {
                var ctrl = this;
                if (ctrl.edgeSwipeCtrl) {
                    if (ctrl.display == 'overlay') {
                        ctrl.edgeSwipeCtrl.target = ctrl._container;
                    } else if (ctrl.display == 'move') {
                        ctrl.edgeSwipeCtrl.target = ctrl.element.parentElement;
                    }
                }

                if (ctrl.swipeToCloseCtrl) {

                    if (ctrl.display == 'overlay') {
                        ctrl.swipeToCloseCtrl.target = ctrl._wrapperArea;
                    } else if (ctrl.display == 'move') {
                        ctrl.swipeToCloseCtrl.target = ctrl.element.parentElement;
                    }
                }
            },

            _edgeSwipeStart: function () {
                var ctrl = this;

                ctrl.edgeSwipeCtrl.minMoveBounds = null;
                ctrl.edgeSwipeCtrl.maxMoveBounds = null;

                if (ctrl.placement == 'right') {
                    var bound = ctrl._content.clientWidth * -1;
                    debugLog('minBounds ' + bound);
                    ctrl.edgeSwipeCtrl.minMoveBounds = bound;
                }
                else if (ctrl.placement == 'left') {
                    var bound = ctrl._content.clientWidth;
                    debugLog('maxBounds ' + bound);
                    ctrl.edgeSwipeCtrl.maxMoveBounds = bound;
                }
            },

            _edgeSwipeCompleted: function (arg) {
                var ctrl = this;
                debugLog('swiped by ' + arg.move + '/' + arg.screenMove + ' ' + (document.body.clientWidth / 3));
                if (Math.abs(arg.screenMove) > (document.body.clientWidth / 3)) {
                    ctrl.edgeSwipeCtrl.swipeHandled = true;

                    ctrl.element.classList.add('visible');
                    ctrl._wrapper.classList.add('visible');

                    if (ctrl.display == 'overlay') {
                        ctrl.edgeSwipeCtrl.target.style.transform = '';
                        if (ctrl.edgeSwipeCtrl.target.style.hasOwnProperty('webkitTransform'))
                            ctrl.edgeSwipeCtrl.target.style.webkitTransform = '';
                        if (ctrl.placement == 'right') {
                            ctrl._wrapper.style.transform = 'translate(' + (document.body.clientWidth + arg.screenMove) + 'px, 0)';
                        } else if (ctrl.placement == 'left') {
                            ctrl._wrapper.style.transform = 'translate(' + (arg.screenMove) + 'px, 0)';
                        }

                        WinJS.UI.executeTransition(ctrl._wrapper, {
                            property: "transform",
                            delay: 10,
                            duration: 600 * (1 - (document.body.clientWidth + arg.screenMove) / document.body.clientWidth),
                            easing: 'ease-out',
                            to: 'translate(0,0)'
                        });
                    }
                    else if (ctrl.display == 'move') {
                        var bound = ctrl.edgeSwipeCtrl.minMoveBounds || ctrl.edgeSwipeCtrl.maxMoveBounds;
                        WinJS.UI.executeTransition(ctrl.edgeSwipeCtrl.target, {
                            property: "transform",
                            delay: 10,
                            duration: 600 * (1 - (document.body.clientWidth + arg.screenMove) / document.body.clientWidth),
                            easing: 'ease-out',
                            to: 'translate(' + bound + 'px,0)'
                        });
                    }

                    ctrl._overlay.style.opacity = '0';
                    ctrl._overlay.classList.add('visible');
                    WinJSContrib.UI.Animation.fadeIn(ctrl._overlay, { duration: 400 });
                    ctrl.registerBack();
                    //ctrl.lockNavigation();
                }
            },

            _swipeToCloseCompleted: function (arg) {
                var ctrl = this;
                var swiper = ctrl.swipeToCloseCtrl;
                debugLog('swiped back by ' + arg.move + '/' + arg.screenMove + ' ' + (document.body.clientWidth / 4) + '(' + swiper.swipeHandled + ')');
                if (Math.abs(arg.screenMove) > (document.body.clientWidth / 4)) {
                    swiper.swipeHandled = true;
                    ctrl._removeNavigationLocks();

                    WinJSContrib.UI.Animation.fadeOut(ctrl._overlay, { duration: 300 }).then(function () {
                        ctrl._overlay.classList.remove('visible');
                    });

                    if (ctrl.display == 'overlay') {
                        var targetX = '0', targetY = '0';
                        if (ctrl.placement == 'right') {
                            targetX = '100%';
                        } else if (ctrl.placement == 'left') {
                            targetX = '-100%';
                        }

                        WinJS.UI.executeTransition(ctrl._wrapper, {
                            property: "transform",
                            delay: 10,
                            duration: 500 * (1 - (document.body.clientWidth - arg.screenMove) / document.body.clientWidth),
                            easing: 'ease-out',
                            to: 'translate(' + targetX + ',' + targetY + ')'
                        }).then(function () {
                            ctrl._wrapper.classList.remove('visible');
                            ctrl.element.classList.remove('visible');

                            return ctrl.hide();
                        }).then(function () {
                            ctrl._wrapperArea.style.transform = '';
                            if (ctrl._wrapperArea.style.hasOwnProperty('webkitTransform'))
                                ctrl._wrapperArea.style.webkitTransform = '';
                        });
                    } else if (ctrl.display == 'move') {
                        WinJS.UI.executeTransition(ctrl.element.parentElement, {
                            property: "transform",
                            delay: 10,
                            duration: 500 * (1 - (document.body.clientWidth - arg.screenMove) / document.body.clientWidth),
                            easing: 'ease-out',
                            to: 'translate(0,0)'
                        }).then(function () {
                            ctrl._wrapper.classList.remove('visible');
                            ctrl.element.classList.remove('visible');

                            return ctrl.hide();
                        }).then(function () {
                            ctrl._wrapperArea.style.transform = '';
                            if (ctrl._wrapperArea.style.hasOwnProperty('webkitTransform'))
                                ctrl._wrapperArea.style.webkitTransform = '';
                        });
                    }
                }
            },

            dispose: function () {
                var ctrl = this;
                ctrl.eventTracker.dispose();
                if (ctrl.edgeSwipeCtrl) {
                	ctrl.edgeSwipeCtrl.dispose();
                	ctrl.edgeSwipeCtrl.element.parentElement.removeChild(ctrl.edgeSwipeCtrl.element);
                }

                if (ctrl.swipeToCloseCtrl) {
                    ctrl.swipeToCloseCtrl.dispose();
                }

                WinJS.Utilities.disposeSubTree(this.element);
            }
        }),
        WinJS.Utilities.eventMixin,
        WinJS.Utilities.createEventProperties("beforeshow", "beforehide", "aftershow", "afterhide"))
    });
    WinJSContrib.UI.FlyoutPage.openPages = [];

    WinJS.Namespace.define("WinJSContrib.UI", {
        FlyoutPicker: WinJS.Class.mix(WinJS.Class.define(function ctor(element, options) {
            var ctrl = this;
            ctrl.element = element || document.createElement('DIV');
            options = options || {};
            ctrl.element.style.display = 'none';
            ctrl.element.classList.add('mcn-flyoutpicker');
            ctrl.element.classList.add('win-disposable');
            ctrl.element.mcnFlyoutPage = true;
            ctrl.element.winControl = ctrl;
            ctrl.flyoutPage = new WinJSContrib.UI.FlyoutPage(null, options);
            var parentFlyoutPage = WinJSContrib.UI.parentFlyoutPage(element);
            if (parentFlyoutPage) {
                parentFlyoutPage.addContentElement(ctrl.flyoutPage.element);
            }
            else {
                document.body.appendChild(ctrl.flyoutPage.element);
            }
        }, {
            dispose: function () {
            	var ctrl = this;
            	ctrl.flyoutPage.element.parentElement.removeChild(ctrl.flyoutPage.element);
            	ctrl.element.parentElement.removeChild(ctrl.element);
                ctrl.flyoutPage = null;
            },

            addContentElement: function (element) {
                var ctrl = this;
                ctrl.flyoutPage.addContentElement(element);
            },

            pick: function (url, options) {
                var ctrl = this;
                return ctrl.flyoutPage.pick(url, options);
            }
        }),
        WinJS.UI.DOMEventMixin,
        WinJS.Utilities.createEventProperties(""))
    });
})();