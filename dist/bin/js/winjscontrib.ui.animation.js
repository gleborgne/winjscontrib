/* 
 * WinJS Contrib v2.1.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

/**
 * @namespace WinJSContrib.UI.Animation
 */
/**
 */
var WinJSContrib;
(function (WinJSContrib) {
    var UI;
    (function (UI) {
        var Animation;
        (function (Animation) {
            /**
             * @enum
             * @memberof WinJSContrib.UI.Animation
             */
            Animation.Easings = {
                /**
                 * Quad ease in
                 */
                easeInQuad: 'cubic-bezier(0.550, 0.085, 0.680, 0.530)',
                /**
                 * Cubic ease in
                 */
                easeInCubic: 'cubic-bezier(0.550, 0.055, 0.675, 0.190)',
                /**
                 * Quart ease in
                 */
                easeInQuart: 'cubic-bezier(0.895, 0.030, 0.685, 0.220)',
                /**
                 * Quint ease in
                 */
                easeInQuint: 'cubic-bezier(0.755, 0.050, 0.855, 0.060)',
                /**
                 * Sine ease in
                 */
                easeInSine: 'cubic-bezier(0.470, 0.000, 0.745, 0.715)',
                /**
                 * Expo ease in
                 */
                easeInExpo: 'cubic-bezier(0.950, 0.050, 0.795, 0.035)',
                /**
                 * Circ ease in
                 */
                easeInCirc: 'cubic-bezier(0.600, 0.040, 0.980, 0.335)',
                /**
                 * Back ease in
                 */
                easeInBack: 'cubic-bezier(0.600, -0.280, 0.735, 0.045)',
                /**
                 * Quad ease out
                 */
                easeOutQuad: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
                /**
                 * Cubic ease out
                 */
                easeOutCubic: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
                /**
                 * Quart ease out
                 */
                easeOutQuart: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
                /**
                 * Quint ease out
                 */
                easeOutQuint: 'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
                /**
                 * Sine ease out
                 */
                easeOutSine: 'cubic-bezier(0.390, 0.575, 0.565, 1.000)',
                /**
                 * Expo ease out
                 */
                easeOutExpo: 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
                /**
                 * Circ ease out
                 */
                easeOutCirc: 'cubic-bezier(0.075, 0.820, 0.165, 1.000)',
                /**
                 * Back ease out
                 */
                easeOutBack: 'cubic-bezier(0.175, 0.885, 0.320, 1.275)',
                /**
                 * Quad ease in-out
                 */
                easeInOutQuad: 'cubic-bezier(0.455, 0.030, 0.515, 0.955)',
                /**
                 * Cubic ease in-out
                 */
                easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
                /**
                 * Quart ease in-out
                 */
                easeInOutQuart: 'cubic-bezier(0.770, 0.000, 0.175, 1.000)',
                /**
                 * Quint ease in-out
                 */
                easeInOutQuint: 'cubic-bezier(0.860, 0.000, 0.070, 1.000)',
                /**
                 * Sine ease in-out
                 */
                easeInOutSine: 'cubic-bezier(0.445, 0.050, 0.550, 0.950)',
                /**
                 * Expo ease in-out
                 */
                easeInOutExpo: 'cubic-bezier(1.000, 0.000, 0.000, 1.000)',
                /**
                 * Circ ease in-out
                 */
                easeInOutCirc: 'cubic-bezier(0.785, 0.135, 0.150, 0.860)',
                /**
                 * Back ease in-out
                 */
                easeInOutBack: 'cubic-bezier(0.680, -0.550, 0.265, 1.550)',
            };
            var equivalents = WinJS.Utilities._browserStyleEquivalents || { transform: { cssName: 'transform' } };
            function getOpt(options) {
                if (options && typeof options == 'number')
                    return { duration: options };
                else
                    return options || {};
            }
            /**
             * configurable fade out
             * @function WinJSContrib.UI.Animation.fadeOut
             * @param {Object} elements element or array of elements
             * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
             */
            function fadeOut(elements, options) {
                options = getOpt(options);
                var args = {
                    property: "opacity",
                    delay: staggerDelay(options.delay !== undefined ? options.delay : 5, options.itemdelay !== undefined ? options.itemdelay : 83, 1, options.maxdelay !== undefined ? options.maxdelay : 333),
                    duration: options.duration || 167,
                    timing: options.easing || "ease-in-out",
                    to: 0
                };
                return WinJS.UI.executeTransition(elements, args);
            }
            Animation.fadeOut = fadeOut;
            /**
             * configurable fade in
             * @function WinJSContrib.UI.Animation.fadeIn
             * @param {Object} elements element or array of elements
             * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
             */
            function fadeIn(elements, options) {
                options = getOpt(options);
                return WinJS.UI.executeTransition(elements, {
                    property: "opacity",
                    delay: staggerDelay(options.delay !== undefined ? options.delay : 5, options.itemdelay !== undefined ? options.itemdelay : 83, 1, options.maxdelay !== undefined ? options.maxdelay : 333),
                    duration: options.duration || 167,
                    timing: options.easing || "ease-in-out",
                    to: 1
                });
            }
            Animation.fadeIn = fadeIn;
            function staggerDelay(initialDelay, extraDelay, delayFactor, delayCap) {
                return function (i) {
                    var ret = initialDelay;
                    for (var j = 0; j < i; j++) {
                        extraDelay *= delayFactor;
                        ret += extraDelay;
                    }
                    if (delayCap) {
                        ret = Math.min(ret, delayCap);
                    }
                    return ret;
                };
            }
            /**
             * configurable page exit effect
             * @function WinJSContrib.UI.Animation.pageExit
             * @param {Object} elements element or array of elements
             * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
             */
            function pageExit(elements, options) {
                options = getOpt(options);
                var args = {
                    property: "opacity",
                    delay: staggerDelay(options.delay !== undefined ? options.delay : 5, options.itemdelay !== undefined ? options.itemdelay : 83, 1, options.maxdelay !== undefined ? options.maxdelay : 333),
                    duration: options.duration || 160,
                    timing: options.easing || "ease-in",
                    to: 0
                };
                return WinJS.UI.executeTransition(elements, args);
            }
            Animation.pageExit = pageExit;
            /**
             * configurable page enter effect
             * @function WinJSContrib.UI.Animation.enterPage
             * @param {Object} elements element or array of elements
             * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
             */
            function enterPage(elements, options) {
                options = getOpt(options);
                var stagger = staggerDelay(options.delay !== undefined ? options.delay : 5, options.itemdelay !== undefined ? options.itemdelay : 120, 1, options.maxdelay !== undefined ? options.maxdelay : 333);
                var animationParams = {
                    keyframe: 'WinJSContrib-EnterPage',
                    property: equivalents.transform.cssName,
                    delay: stagger,
                    duration: options.duration || 600,
                    timing: options.easing || "cubic-bezier(0.1, 0.9, 0.2, 1)"
                };
                var promise1 = WinJS.UI.executeAnimation(elements, animationParams);
                var args = {
                    property: "opacity",
                    delay: stagger,
                    duration: options.duration || 600,
                    timing: options.easing || "ease-out",
                    to: 1
                };
                var promise2 = WinJS.UI.executeTransition(elements, args);
                return WinJS.Promise.join([promise1, promise2]);
            }
            Animation.enterPage = enterPage;
            function slideAnim(element, keyframeName, isIn, options) {
                var offsetArray;
                options = getOpt(options);
                var duration = options.duration || isIn ? 250 : 150;
                var delay = options.delay || 5;
                var stagger = staggerDelay(options.delay !== undefined ? options.delay : 5, options.itemdelay !== undefined ? options.itemdelay : 83, 1, options.maxdelay !== undefined ? options.maxdelay : 333);
                var easing = WinJSContrib.UI.Animation.Easings.easeInQuad;
                if (isIn)
                    easing = WinJSContrib.UI.Animation.Easings.easeOutQuad;
                var animationParams = {
                    keyframe: keyframeName,
                    property: equivalents.transform.cssName,
                    delay: stagger,
                    duration: duration,
                    timing: options.easing || easing
                };
                var promise1 = WinJS.UI.executeAnimation(element, animationParams);
                var transitionParams = {
                    property: "opacity",
                    delay: stagger,
                    duration: duration / 2,
                    timing: easing,
                    from: 0,
                    to: 1
                };
                if (!isIn) {
                    transitionParams.from = 1;
                    transitionParams.to = 0;
                    if (transitionParams.delay < duration / 2)
                        transitionParams.delay = duration / 2;
                }
                var promise2 = WinJS.UI.executeTransition(element, transitionParams);
                return WinJS.Promise.join([promise1, promise2]);
            }
            /**
             * configurable slide effect
             * @function WinJSContrib.UI.Animation.slideFromBottom
             * @param {Object} elements element or array of elements
             * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
             */
            function slideFromBottom(elements, options) {
                return slideAnim(elements, 'WinJSContrib-slideFromBottom', true, options);
            }
            Animation.slideFromBottom = slideFromBottom;
            /**
             * configurable slide effect
             * @function WinJSContrib.UI.Animation.slideFromTop
             * @param {Object} elements element or array of elements
             * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
             */
            function slideFromTop(elements, options) {
                return slideAnim(elements, 'WinJSContrib-slideFromTop', true, options);
            }
            Animation.slideFromTop = slideFromTop;
            /**
             * configurable slide effect
             * @function WinJSContrib.UI.Animation.slideFromLeft
             * @param {Object} elements element or array of elements
             * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
             */
            function slideFromLeft(elements, options) {
                return slideAnim(elements, 'WinJSContrib-slideFromLeft', true, options);
            }
            Animation.slideFromLeft = slideFromLeft;
            /**
             * configurable slide effect
             * @function WinJSContrib.UI.Animation.slideFromRight
             * @param {Object} elements element or array of elements
             * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
             */
            function slideFromRight(elements, options) {
                return slideAnim(elements, 'WinJSContrib-slideFromRight', true, options);
            }
            Animation.slideFromRight = slideFromRight;
            /**
             * configurable slide effect
             * @function WinJSContrib.UI.Animation.slideToBottom
             * @param {Object} elements element or array of elements
             * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
             */
            function slideToBottom(elements, options) {
                return slideAnim(elements, 'WinJSContrib-slideToBottom', false, options);
            }
            Animation.slideToBottom = slideToBottom;
            /**
             * configurable slide effect
             * @function WinJSContrib.UI.Animation.slideToTop
             * @param {Object} elements element or array of elements
             * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
             */
            function slideToTop(elements, options) {
                return slideAnim(elements, 'WinJSContrib-slideToTop', false, options);
            }
            Animation.slideToTop = slideToTop;
            /**
             * configurable slide effect
             * @function WinJSContrib.UI.Animation.slideToLeft
             * @param {Object} elements element or array of elements
             * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
             */
            function slideToLeft(elements, options) {
                return slideAnim(elements, 'WinJSContrib-slideToLeft', false, options);
            }
            Animation.slideToLeft = slideToLeft;
            /**
             * configurable slide effect
             * @function WinJSContrib.UI.Animation.slideToRight
             * @param {Object} elements element or array of elements
             * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
             */
            function slideToRight(elements, options) {
                return slideAnim(elements, 'WinJSContrib-slideToRight', false, options);
            }
            Animation.slideToRight = slideToRight;
            /**
             * animation for tab exit
             * @function WinJSContrib.UI.Animation.tabExitPage
             * @param {Object} elements element or array of elements
             * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
             */
            function tabExitPage(elements, options) {
                var offsetArray;
                options = getOpt(options);
                var stagger = staggerDelay(options.delay !== undefined ? options.delay : 5, options.itemdelay !== undefined ? options.itemdelay : 83, 1, options.maxdelay !== undefined ? options.maxdelay : 333);
                var animationParams = {
                    keyframe: "WinJSContrib-tabExitPage",
                    property: equivalents.transform.cssName,
                    delay: stagger,
                    duration: options.duration || 160,
                    timing: "ease-in"
                };
                var promise1 = WinJS.UI.executeAnimation(elements, animationParams);
                var transitionParams = {
                    property: "opacity",
                    delay: stagger,
                    duration: options.duration || 160,
                    timing: "linear",
                    from: 1,
                    to: 0
                };
                var promise2 = WinJS.UI.executeTransition(elements, transitionParams);
                return WinJS.Promise.join([promise1, promise2]);
            }
            Animation.tabExitPage = tabExitPage;
            /**
             * animation for tab exit
             * @function WinJSContrib.UI.Animation.tabEnterPage
             * @param {Object} elements element or array of elements
             * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
             */
            function tabEnterPage(elements, options) {
                var offsetArray;
                options = getOpt(options);
                var stagger = staggerDelay(options.delay !== undefined ? options.delay : 5, options.itemdelay !== undefined ? options.itemdelay : 83, 1, options.maxdelay !== undefined ? options.maxdelay : 333);
                var promise1 = WinJS.UI.executeAnimation(elements, {
                    keyframe: "WinJSContrib-tabEnterPage",
                    property: equivalents.transform.cssName,
                    delay: stagger,
                    duration: options.duration || 250,
                    timing: WinJSContrib.UI.Animation.Easings.easeOutQuad
                });
                var promise2 = WinJS.UI.executeTransition(elements, {
                    property: "opacity",
                    delay: stagger,
                    duration: options.duration || 250,
                    timing: "ease-out",
                    from: 0,
                    to: 1
                });
                return WinJS.Promise.join([promise1, promise2]);
            }
            Animation.tabEnterPage = tabEnterPage;
            /**
             * exit and grow animation
             * @function WinJSContrib.UI.Animation.exitGrow
             * @param {Object} elements element or array of elements
             * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
             */
            function exitGrow(elements, options) {
                var offsetArray;
                options = getOpt(options);
                var keyframeName = "WinJSContrib-exitGrow";
                if (options.exagerated) {
                    keyframeName += '-exagerated';
                }
                var stagger = staggerDelay(options.delay !== undefined ? options.delay : 5, options.itemdelay !== undefined ? options.itemdelay : 83, 1, options.maxdelay !== undefined ? options.maxdelay : 333);
                var dur = options.duration || 250;
                var promise1 = WinJS.UI.executeAnimation(elements, {
                    keyframe: keyframeName,
                    property: equivalents.transform.cssName,
                    delay: stagger,
                    duration: dur,
                    timing: options.easing || WinJSContrib.UI.Animation.Easings.easeInQuad
                });
                var promise2 = WinJS.UI.executeTransition(elements, {
                    property: "opacity",
                    delay: stagger,
                    duration: dur,
                    timing: options.easing || WinJSContrib.UI.Animation.Easings.easeInQuint,
                    from: 1,
                    to: 0
                });
                return WinJS.Promise.join([promise1, promise2]);
            }
            Animation.exitGrow = exitGrow;
            /**
             * exit and shrink animation
             * @function WinJSContrib.UI.Animation.exitShrink
             * @param {Object} elements element or array of elements
             * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
             */
            function exitShrink(elements, options) {
                var offsetArray;
                options = getOpt(options);
                var keyframeName = "WinJSContrib-exitShrink";
                if (options.exagerated) {
                    keyframeName += '-exagerated';
                }
                var dur = options.duration || 250;
                var stagger = staggerDelay(options.delay !== undefined ? options.delay : 10, options.itemdelay !== undefined ? options.itemdelay : 83, 1, options.maxdelay !== undefined ? options.maxdelay : 333);
                var promise1 = WinJS.UI.executeAnimation(elements, {
                    keyframe: keyframeName,
                    property: equivalents.transform.cssName,
                    delay: stagger,
                    duration: dur,
                    timing: options.easing || WinJSContrib.UI.Animation.Easings.easeInQuad
                });
                var promise2 = WinJS.UI.executeTransition(elements, {
                    property: "opacity",
                    delay: stagger,
                    duration: dur,
                    timing: WinJSContrib.UI.Animation.Easings.easeInQuint,
                    from: 1,
                    to: 0
                });
                return WinJS.Promise.join([promise1, promise2]);
            }
            Animation.exitShrink = exitShrink;
            /**
             * shrink and fall animation
             * @function WinJSContrib.UI.Animation.shrinkAndFall
             * @param {Object} elements element or array of elements
             * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
             */
            function shrinkAndFall(elements, options) {
                var offsetArray;
                options = getOpt(options);
                var stagger = staggerDelay(options.delay !== undefined ? options.delay : 5, options.itemdelay !== undefined ? options.itemdelay : 83, 1, options.maxdelay !== undefined ? options.maxdelay : 333);
                var dur = options.duration || 250;
                var promise1 = WinJS.UI.executeAnimation(elements, {
                    keyframe: "WinJSContrib-shrinkAndFall",
                    property: equivalents.transform.cssName,
                    delay: stagger,
                    duration: dur,
                    timing: options.easing || "ease-in"
                });
                var promise2 = WinJS.UI.executeTransition(elements, {
                    property: "opacity",
                    delay: stagger,
                    duration: dur,
                    timing: "ease-in",
                    from: 1,
                    to: 0
                });
                return WinJS.Promise.join([promise1, promise2]);
            }
            Animation.shrinkAndFall = shrinkAndFall;
            /**
             * enter and shrink animation
             * @function WinJSContrib.UI.Animation.enterShrink
             * @param {Object} elements element or array of elements
             * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
             */
            function enterShrink(elements, options) {
                var offsetArray;
                options = getOpt(options);
                var keyframeName = "WinJSContrib-enterShrink";
                if (options.exagerated) {
                    keyframeName += '-exagerated';
                }
                var dur = options.duration || 350;
                var stagger = staggerDelay(options.delay !== undefined ? options.delay : 5, options.itemdelay !== undefined ? options.itemdelay : 83, 1, options.maxdelay !== undefined ? options.maxdelay : 333);
                var promise1 = WinJS.UI.executeAnimation(elements, {
                    keyframe: keyframeName,
                    property: equivalents.transform.cssName,
                    delay: stagger,
                    duration: dur,
                    timing: options.easing || WinJSContrib.UI.Animation.Easings.easeOutQuad
                });
                var promise2 = WinJS.UI.executeTransition(elements, {
                    property: "opacity",
                    delay: stagger,
                    duration: dur,
                    timing: options.easing || WinJSContrib.UI.Animation.Easings.easeOutQuint,
                    from: 0,
                    to: 1
                });
                return WinJS.Promise.join([promise1, promise2]);
            }
            Animation.enterShrink = enterShrink;
            /**
             * enter and shrink animation
             * @function WinJSContrib.UI.Animation.enterGrow
             * @param {Object} elements element or array of elements
             * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
             */
            function enterGrow(elements, options) {
                var offsetArray;
                options = getOpt(options);
                var keyframeName = "WinJSContrib-enterGrow";
                if (options.exagerated) {
                    keyframeName += '-exagerated';
                }
                var dur = options.duration || 350;
                var stagger = staggerDelay(options.delay !== undefined ? options.delay : 5, options.itemdelay !== undefined ? options.itemdelay : 83, 1, options.maxdelay !== undefined ? options.maxdelay : 333);
                var promise1 = WinJS.UI.executeAnimation(elements, {
                    keyframe: keyframeName,
                    property: equivalents.transform.cssName,
                    delay: stagger,
                    duration: dur,
                    timing: options.easing || WinJSContrib.UI.Animation.Easings.easeOutQuad
                });
                var promise2 = WinJS.UI.executeTransition(elements, {
                    property: "opacity",
                    delay: stagger,
                    duration: dur,
                    timing: WinJSContrib.UI.Animation.Easings.easeOutQuint,
                    from: 0,
                    to: 1
                });
                return WinJS.Promise.join([promise1, promise2]);
            }
            Animation.enterGrow = enterGrow;
        })(Animation = UI.Animation || (UI.Animation = {}));
    })(UI = WinJSContrib.UI || (WinJSContrib.UI = {}));
})(WinJSContrib || (WinJSContrib = {}));

//# sourceMappingURL=../../Sources/Common/winjscontrib.ui.animation.js.map