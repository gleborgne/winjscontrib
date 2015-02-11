/* 
 * WinJS Contrib v2.0.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

var WinJSContrib = WinJSContrib || {};
WinJSContrib.UI = WinJSContrib.UI || {};

/**
 * @namespace
 */
WinJSContrib.UI.Animation = WinJSContrib.UI.Animation || {};

/**
 * @enum
 */
WinJSContrib.UI.Animation.Easings = {
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

(function (Animation) {
    var equivalents = WinJS.Utilities._browserStyleEquivalents || { transform: { cssName: 'transform' } };

    /**
     * optional properties for animations
     * @typedef {Object} WinJSContrib.UI.AnimationOptions
     * @property {number} duration duration for the animation
     * @property {number} delay delay for the animation
     * @property {number} itemdelay delay for each item when staggering animation
     * @property {number} maxdelay max delay for item when staggering animation
     */

    function getOpt(options) {
        if (options && typeof options == 'number')
            return { duration: options };
        else
            return options || {};
    }

    /**
     * configurable fade out
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
     */
    WinJSContrib.UI.Animation.fadeOut = function (elements, options) {
        options = getOpt(options);

        var args = {
            property: "opacity",
            delay: staggerDelay(options.delay != undefined ? options.delay : 5, options.itemdelay != undefined ? options.itemdelay : 83, 1, options.maxdelay != undefined ? options.maxdelay : 333),
            duration: options.duration || 167,
            timing: options.easing || "ease-in-out",
            to: 0
        };

        return WinJS.UI.executeTransition(elements, args);
    }

    /**
     * configurable fade in
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
     */
    WinJSContrib.UI.Animation.fadeIn = function (elements, options) {
        options = getOpt(options);

        return WinJS.UI.executeTransition(
            elements,
            {
                property: "opacity",
                delay: staggerDelay(options.delay != undefined ? options.delay : 5, options.itemdelay != undefined ? options.itemdelay : 83, 1, options.maxdelay != undefined ? options.maxdelay : 333),
                duration: options.duration || 167,
                timing: options.easing || "ease-in-out",
                to: 1
            });
    }

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
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
     */
    WinJSContrib.UI.Animation.pageExit = function (elements, options) {
        options = getOpt(options);

        var args = {
            property: "opacity",
            delay: staggerDelay(options.delay != undefined ? options.delay : 5, options.itemdelay != undefined ? options.itemdelay : 83, 1, options.maxdelay != undefined ? options.maxdelay : 333),
            duration: options.duration || 160,
            timing: options.easing || "ease-in",
            to: 0
        };

        return WinJS.UI.executeTransition(elements, args);
    }

    /**
     * configurable page enter effect
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
     */
    WinJSContrib.UI.Animation.enterPage = function (elements, options) {
        options = getOpt(options);

        var stagger = staggerDelay(options.delay != undefined ? options.delay : 5, options.itemdelay != undefined ? options.itemdelay : 120, 1, options.maxdelay != undefined ? options.maxdelay : 333);
        var animationParams = {
            keyframe: 'WinJSContrib-EnterPage',
            property: equivalents.transform.cssName,
            delay: stagger,
            duration: options.duration || 600,
            timing: options.easing || "cubic-bezier(0.1, 0.9, 0.2, 1)"
        }

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

    function slideAnim(element, keyframeName, isIn, options) {
        var offsetArray;
        options = getOpt(options);

        var duration = options.duration || isIn ? 250 : 150;
        var delay = options.delay || 5;
        var stagger = staggerDelay(options.delay != undefined ? options.delay : 5, options.itemdelay != undefined ? options.itemdelay : 83, 1, options.maxdelay != undefined ? options.maxdelay : 333);
        var easing = WinJSContrib.UI.Animation.Easings.easeInQuad;
        if (isIn)
            easing = WinJSContrib.UI.Animation.Easings.easeOutQuad;

        var animationParams = {
            keyframe: keyframeName,
            property: equivalents.transform.cssName,
            delay: stagger,
            duration: duration,
            timing: options.easing || easing
        }

        var promise1 = WinJS.UI.executeAnimation(element, animationParams);

        var transitionParams = {
            property: "opacity",
            delay: stagger,
            duration: duration / 2,
            timing: easing,
            from: 0,
            to: 1
        }

        if (!isIn) {
            transitionParams.from = 1;
            transitionParams.to = 0;
            if (transitionParams.delay < duration / 2)
                transitionParams.delay = duration / 2;
        }
        var promise2 = WinJS.UI.executeTransition(element, transitionParams);
        return WinJS.Promise.join([promise1, promise2]);
    }

    WinJSContrib.UI.Animation.custom = slideAnim;

    /**
     * configurable slide effect
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
     */
    WinJSContrib.UI.Animation.slideFromBottom = function (elements, options) {
        return slideAnim(elements, 'WinJSContrib-slideFromBottom', true, options);
    }

    /**
     * configurable slide effect
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
     */
    WinJSContrib.UI.Animation.slideFromTop = function (elements, options) {
        return slideAnim(elements, 'WinJSContrib-slideFromTop', true, options);
    }

    /**
     * configurable slide effect
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
     */
    WinJSContrib.UI.Animation.slideFromLeft = function (elements, options) {
        return slideAnim(elements, 'WinJSContrib-slideFromLeft', true, options);
    }

    /**
     * configurable slide effect
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
     */
    WinJSContrib.UI.Animation.slideFromRight = function (elements, options) {
        return slideAnim(elements, 'WinJSContrib-slideFromRight', true, options);
    }

    /**
     * configurable slide effect
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
     */
    WinJSContrib.UI.Animation.slideToBottom = function (elements, options) {
        return slideAnim(elements, 'WinJSContrib-slideToBottom', false, options);
    }

    /**
     * configurable slide effect
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
     */
    WinJSContrib.UI.Animation.slideToTop = function (elements, options) {
        return slideAnim(elements, 'WinJSContrib-slideToTop', false, options);
    }

    /**
     * configurable slide effect
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
     */
    WinJSContrib.UI.Animation.slideToLeft = function (elements, options) {
        return slideAnim(elements, 'WinJSContrib-slideToLeft', false, options);
    }

    /**
     * configurable slide effect
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
     */
    WinJSContrib.UI.Animation.slideToRight = function (elements, options) {
        return slideAnim(elements, 'WinJSContrib-slideToRight', false, options);
    }

    /**
     * animation for tab exit
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
     */
    WinJSContrib.UI.Animation.tabExitPage = function (elements, options) {
        var offsetArray;
        options = getOpt(options);

        var stagger = staggerDelay(options.delay != undefined ? options.delay : 5, options.itemdelay != undefined ? options.itemdelay : 83, 1, options.maxdelay != undefined ? options.maxdelay : 333);
        var animationParams = {
            keyframe: "WinJSContrib-tabExitPage",
            property: equivalents.transform.cssName,
            delay: stagger,
            duration: options.duration || 160,
            timing: "ease-in"
        }

        var promise1 = WinJS.UI.executeAnimation(elements, animationParams);

        var transitionParams = {
            property: "opacity",
            delay: stagger,
            duration: options.duration || 160,
            timing: "linear",
            from: 1,
            to: 0
        }
        var promise2 = WinJS.UI.executeTransition(elements, transitionParams);
        return WinJS.Promise.join([promise1, promise2]);
    }

    /**
     * animation for tab exit
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
     */
    WinJSContrib.UI.Animation.tabEnterPage = function (elements, options) {
        var offsetArray;
        options = getOpt(options);
        var stagger = staggerDelay(options.delay != undefined ? options.delay : 5, options.itemdelay != undefined ? options.itemdelay : 83, 1, options.maxdelay != undefined ? options.maxdelay : 333);
        var promise1 = WinJS.UI.executeAnimation(
            elements,
            {
                keyframe: "WinJSContrib-tabEnterPage",
                property: equivalents.transform.cssName,
                delay: stagger,
                duration: options.duration || 250,
                timing: WinJSContrib.UI.Animation.Easings.easeOutQuad
            });
        var promise2 = WinJS.UI.executeTransition(
            elements,
            {
                property: "opacity",
                delay: stagger,
                duration: options.duration || 250,
                timing: "ease-out",
                from: 0,
                to: 1
            });
        return WinJS.Promise.join([promise1, promise2]);
    }

    /**
     * exit and grow animation
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
     */
    WinJSContrib.UI.Animation.exitGrow = function (elements, options) {
        var offsetArray;
        options = getOpt(options);
        var keyframeName = "WinJSContrib-exitGrow";
        if (options.exagerated) {
            keyframeName += '-exagerated';
        }
        var stagger = staggerDelay(options.delay != undefined ? options.delay : 5, options.itemdelay != undefined ? options.itemdelay : 83, 1, options.maxdelay != undefined ? options.maxdelay : 333);
        var dur = options.duration || 300;

        var promise1 = WinJS.UI.executeAnimation(
            elements,
            {
                keyframe: keyframeName,
                property: equivalents.transform.cssName,
                delay: stagger,
                duration: dur,
                timing: options.easing || WinJSContrib.UI.Animation.Easings.easeInQuad
            });
        var promise2 = WinJS.UI.executeTransition(
            elements,
            {
                property: "opacity",
                delay: (3 * dur / 4) + +(options.delay != undefined ? options.delay : 10),
                duration: (dur / 4),
                timing: options.easing || WinJSContrib.UI.Animation.Easings.easeInQuint,
                from: 1,
                to: 0
            });
        return WinJS.Promise.join([promise1, promise2]);
    }

    /**
     * exit and shrink animation
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
     */
    WinJSContrib.UI.Animation.exitShrink = function (elements, options) {
        var offsetArray;
        options = getOpt(options);
        var keyframeName = "WinJSContrib-exitShrink";
        if (options.exagerated) {
            keyframeName += '-exagerated';
        }
        var dur = options.duration || 300;
        var stagger = staggerDelay(options.delay != undefined ? options.delay : 10, options.itemdelay != undefined ? options.itemdelay : 83, 1, options.maxdelay != undefined ? options.maxdelay : 333);
        var promise1 = WinJS.UI.executeAnimation(
            elements,
            {
                keyframe: keyframeName,
                property: equivalents.transform.cssName,
                delay: stagger,
                duration: dur,
                timing: options.easing || WinJSContrib.UI.Animation.Easings.easeInQuad
            });


        var promise2 = WinJS.UI.executeTransition(
            elements,
            {
                property: "opacity",
                delay: (3 * dur / 4) + (options.delay != undefined ? options.delay : 10),
                duration: (dur / 4),
                timing: WinJSContrib.UI.Animation.Easings.easeInQuint,
                from: 1,
                to: 0
            });
        return WinJS.Promise.join([promise1, promise2]);
    }

    /**
     * shrink and fall animation
     * @function
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
     */
    WinJSContrib.UI.Animation.shrinkAndFall = WinJS.Utilities.markSupportedForProcessing(function (elements, options) {
        var offsetArray;
        options = getOpt(options);
        var stagger = staggerDelay(options.delay != undefined ? options.delay : 5, options.itemdelay != undefined ? options.itemdelay : 83, 1, options.maxdelay != undefined ? options.maxdelay : 333);
        var dur = options.duration || 300;
        var promise1 = WinJS.UI.executeAnimation(
            elements,
            {
                keyframe: "WinJSContrib-shrinkAndFall",
                property: equivalents.transform.cssName,
                delay: stagger,
                duration: dur,
                timing: options.easing || "ease-in"
            });
        var promise2 = WinJS.UI.executeTransition(
            elements,
            {
                property: "opacity",
                delay: (dur / 2) + stagger,
                duration: dur / 2,
                timing: "ease-in",
                from: 1,
                to: 0
            });
        return WinJS.Promise.join([promise1, promise2]);
    });

    /**
     * enter and shrink animation
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
     */
    WinJSContrib.UI.Animation.enterShrink = function (elements, options) {
        var offsetArray;
        options = getOpt(options);
        var keyframeName = "WinJSContrib-enterShrink";
        if (options.exagerated) {
            keyframeName += '-exagerated';
        }
        var dur = options.duration || 300;
        var stagger = staggerDelay(
            options.delay != undefined ? options.delay : 5,
            options.itemdelay != undefined ? options.itemdelay : 83,
            1,
            options.maxdelay != undefined ? options.maxdelay : 333);

        var promise1 = WinJS.UI.executeAnimation(
            elements,
            {
                keyframe: keyframeName,
                property: equivalents.transform.cssName,
                delay: stagger,
                duration: dur,
                timing: options.easing || WinJSContrib.UI.Animation.Easings.easeOutQuad
            });

        var promise2 = WinJS.UI.executeTransition(
            elements,
            {
                property: "opacity",
                delay: stagger,
                duration: dur / 3,
                timing: options.easing || WinJSContrib.UI.Animation.Easings.easeOutQuint,
                from: 0,
                to: 1
            });
        return WinJS.Promise.join([promise1, promise2]);
    }

    /**
     * enter and shrink animation
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
     */
    WinJSContrib.UI.Animation.enterGrow = function (elements, options) {
        var offsetArray;
        options = getOpt(options);
        var keyframeName = "WinJSContrib-enterGrow";
        if (options.exagerated) {
            keyframeName += '-exagerated';
        }
        var dur = options.duration || 300;

        var stagger = staggerDelay(
            options.delay != undefined ? options.delay : 5,
            options.itemdelay != undefined ? options.itemdelay : 83,
            1,
            options.maxdelay != undefined ? options.maxdelay : 333);

        var promise1 = WinJS.UI.executeAnimation(
            elements,
            {
                keyframe: keyframeName,
                property: equivalents.transform.cssName,
                delay: stagger,
                duration: dur,
                timing: options.easing || WinJSContrib.UI.Animation.Easings.easeOutQuad
            });

        var promise2 = WinJS.UI.executeTransition(
            elements,
            {
                property: "opacity",
                delay: stagger,
                duration: dur / 3,
                timing: WinJSContrib.UI.Animation.Easings.easeOutQuint,
                from: 0,
                to: 1
            });
        return WinJS.Promise.join([promise1, promise2]);
    }
})(WinJSContrib.UI.Animation);