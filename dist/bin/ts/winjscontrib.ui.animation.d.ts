/**
 * @namespace WinJSContrib.UI.Animation
 */
/**
 */
declare module WinJSContrib.UI.Animation {
    /**
     * @enum
     * @memberof WinJSContrib.UI.Animation
     */
    var Easings: {
        easeInQuad: string;
        easeInCubic: string;
        easeInQuart: string;
        easeInQuint: string;
        easeInSine: string;
        easeInExpo: string;
        easeInCirc: string;
        easeInBack: string;
        easeOutQuad: string;
        easeOutCubic: string;
        easeOutQuart: string;
        easeOutQuint: string;
        easeOutSine: string;
        easeOutExpo: string;
        easeOutCirc: string;
        easeOutBack: string;
        easeInOutQuad: string;
        easeInOutCubic: string;
        easeInOutQuart: string;
        easeInOutQuint: string;
        easeInOutSine: string;
        easeInOutExpo: string;
        easeInOutCirc: string;
        easeInOutBack: string;
    };
    /**
     * optional properties for animations
     * @typedef {Object} WinJSContrib.UI.AnimationOptions
     * @property {number} duration duration for the animation
     * @property {number} delay delay for the animation
     * @property {number} itemdelay delay for each item when staggering animation
     * @property {number} maxdelay max delay for item when staggering animation
     * @property {string} easing css easing function
     */
    interface AnimationOptions {
        duration?: number;
        delay?: number;
        itemdelay?: number;
        maxdelay?: number;
        easing?: string;
        exagerated?: boolean;
    }
    /**
     * configurable fade out
     * @function WinJSContrib.UI.Animation.fadeOut
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
     */
    function fadeOut(elements: any, options?: AnimationOptions): WinJS.Promise<any>;
    /**
     * configurable fade in
     * @function WinJSContrib.UI.Animation.fadeIn
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
     */
    function fadeIn(elements: any, options?: AnimationOptions): WinJS.Promise<any>;
    /**
     * configurable page exit effect
     * @function WinJSContrib.UI.Animation.pageExit
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
     */
    function pageExit(elements: any, options?: AnimationOptions): WinJS.Promise<any>;
    /**
     * configurable page enter effect
     * @function WinJSContrib.UI.Animation.enterPage
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
     */
    function enterPage(elements: any, options?: AnimationOptions): WinJS.IPromise<any>;
    /**
     * configurable slide effect
     * @function WinJSContrib.UI.Animation.slideFromBottom
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
     */
    function slideFromBottom(elements: any, options?: AnimationOptions): WinJS.IPromise<any>;
    /**
     * configurable slide effect
     * @function WinJSContrib.UI.Animation.slideFromTop
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
     */
    function slideFromTop(elements: any, options?: AnimationOptions): WinJS.IPromise<any>;
    /**
     * configurable slide effect
     * @function WinJSContrib.UI.Animation.slideFromLeft
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
     */
    function slideFromLeft(elements: any, options?: AnimationOptions): WinJS.IPromise<any>;
    /**
     * configurable slide effect
     * @function WinJSContrib.UI.Animation.slideFromRight
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
     */
    function slideFromRight(elements: any, options?: AnimationOptions): WinJS.IPromise<any>;
    /**
     * configurable slide effect
     * @function WinJSContrib.UI.Animation.slideToBottom
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
     */
    function slideToBottom(elements: any, options?: AnimationOptions): WinJS.IPromise<any>;
    /**
     * configurable slide effect
     * @function WinJSContrib.UI.Animation.slideToTop
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
     */
    function slideToTop(elements: any, options?: AnimationOptions): WinJS.IPromise<any>;
    /**
     * configurable slide effect
     * @function WinJSContrib.UI.Animation.slideToLeft
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
     */
    function slideToLeft(elements: any, options?: AnimationOptions): WinJS.IPromise<any>;
    /**
     * configurable slide effect
     * @function WinJSContrib.UI.Animation.slideToRight
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
     */
    function slideToRight(elements: any, options?: AnimationOptions): WinJS.IPromise<any>;
    /**
     * animation for tab exit
     * @function WinJSContrib.UI.Animation.tabExitPage
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
     */
    function tabExitPage(elements: any, options?: AnimationOptions): WinJS.IPromise<any>;
    /**
     * animation for tab exit
     * @function WinJSContrib.UI.Animation.tabEnterPage
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like duration, delay, easing
     */
    function tabEnterPage(elements: any, options?: AnimationOptions): WinJS.IPromise<any>;
    /**
     * exit and grow animation
     * @function WinJSContrib.UI.Animation.exitGrow
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
     */
    function exitGrow(elements: any, options?: AnimationOptions): WinJS.IPromise<any>;
    /**
     * exit and shrink animation
     * @function WinJSContrib.UI.Animation.exitShrink
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
     */
    function exitShrink(elements: any, options?: AnimationOptions): WinJS.IPromise<any>;
    /**
     * shrink and fall animation
     * @function WinJSContrib.UI.Animation.shrinkAndFall
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
     */
    function shrinkAndFall(elements: any, options?: AnimationOptions): WinJS.IPromise<any>;
    /**
     * enter and shrink animation
     * @function WinJSContrib.UI.Animation.enterShrink
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
     */
    function enterShrink(elements: any, options?: AnimationOptions): WinJS.IPromise<any>;
    /**
     * enter and shrink animation
     * @function WinJSContrib.UI.Animation.enterGrow
     * @param {Object} elements element or array of elements
     * @param {WinJSContrib.UI.AnimationOptions} options options like delay, easing
     */
    function enterGrow(elements: any, options?: AnimationOptions): WinJS.IPromise<any>;
}
