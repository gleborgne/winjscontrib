/* 
 * WinJS Contrib v2.1.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

/* 
 * WinJS Contrib v2.1.0.0
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

/// <reference path="winjscontrib.core.js" />
(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("WinJSContrib.UI", {
        ExtendedSplash: WinJS.Class.define(
            /** 
             * 
             * @class WinJSContrib.UI.ExtendedSplash 
             * @classdesc This control displays a custom splash screen. It is primarily focused on WinRT apps but it works quite well in cordova applications (in that case you must add WinJSContrib.ui.crossplatform.js)
             * @param {HTMLElement} element DOM element containing the control
             * @param {Object} options
             * @example
             * <div data-win-control="WinJSContrib.UI.ExtendedSplash" data-win-options="{ text: 'extended splash screen control in action...' }"></div>
             */
            function ctor(element, options) {
                var ctrl = this;
                options = options || {};
                ctrl.element = element || document.createElement("div");

                /**
                 * animation for showing splash screen
                 * @field                * 
                 */
                ctrl.enterAnimation = options.enterAnimation || function () {
                    var ctrl = this;
                    return WinJSContrib.UI.Animation.fadeIn(ctrl.splashLoader, { duration: 500 });
                };

                /**
                 * animation for hiding splash screen
                 * @field            * 
                 */
                ctrl.exitAnimation = options.enterAnimation || function () {
                    var ctrl = this;
                    var prom1 = WinJSContrib.UI.Animation.fadeOut(ctrl.element.querySelector('#mcn-splashscreen-loader'), { duration: 500 });
                    var prom2 = WinJSContrib.UI.Animation.fadeOut(ctrl.element, { duration: 500, delay: 200 });

                    return WinJS.Promise.join([prom1, prom2]).then(function () {
                        ctrl.element.style.display = 'none';
                    });
                };

                ctrl.isVisible = false;
                WinJSContrib.UI.Application = WinJSContrib.UI.Application || {};
                WinJSContrib.UI.Application.splashscreen = ctrl;
                ctrl.element.className = 'mcn-splashscreen ' + ctrl.element.className;
                if (WinJSContrib.CrossPlatform && WinJSContrib.CrossPlatform.crossPlatformClass)
                    WinJSContrib.CrossPlatform.crossPlatformClass(ctrl.element);
                ctrl.splashImageFile = options.image || '/images/splashscreen.png';

                if (!ctrl.element.innerHTML) {
                    ctrl.defaultSplashContent(options.text || 'chargement en cours', options.description);
                }
                console.log(ctrl.element.innerHTML)
                if (!ctrl.textElement)
                    ctrl.textElement = ctrl.element.querySelector('.mcn-splashscreen-loader-text');
                if (!ctrl.splashImage)
                    ctrl.splashImage = ctrl.element.querySelector('#mcn-splashscreen-image');
                if (!ctrl.splashLoader)
                    ctrl.splashLoader = ctrl.element.querySelector('#mcn-splashscreen-loader');
                ctrl.handleResizeBinded = ctrl.handleResize.bind(ctrl);
                ctrl.handleDismissedBinded = ctrl.handleDismissed.bind(ctrl);
            },

            /**
            * @lends WinJSContrib.UI.ExtendedSplash.prototype
            */
            {
                /** 
                 * build html content for splash screen
                 * @param {string} text text displayed on splash
                 * @returns {string} HTML content
                 */
                defaultSplashContent: function (text) {
                    var ctrl = this;
                    if (WinJSContrib.CrossPlatform && (WinJSContrib.CrossPlatform.isMobile.Android() || WinJSContrib.CrossPlatform.isMobile.iOS())) {
                        ctrl.splashImage = document.createElement('img');
                        ctrl.splashImage.src = this.splashImageFile;
                        ctrl.splashImage.id = "mcn-splashscreen-image";
                        ctrl.element.appendChild(ctrl.splashImage);
                        ctrl.splashLoader = document.createElement('div');
                        ctrl.splashLoader.style.opacity = 0;
                        ctrl.splashLoader.id = "mcn-splashscreen-loader";
                        ctrl.splashLoader.className = "mcn-cordova-spalsh";
                        var cordova = document.createElement('div');
                        cordova.className = "cordova-ring";
                        cordova.innerHTML = '<div class="wBall" id="wBall_1"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_2"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_3"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_4"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_5"><div class="wInnerBall"></div></div></div>'

                        ctrl.textElement = document.createElement('div');
                        ctrl.textElement.className = "mcn-splashscreen-loader-text";
                        ctrl.textElement.innerText = text || '';
                        ctrl.splashLoader.appendChild(cordova);
                        ctrl.splashLoader.appendChild(ctrl.textElement);
                        ctrl.element.appendChild(ctrl.splashLoader);
                    }
                    else {
                        ctrl.element.innerHTML = '<img id="mcn-splashscreen-image" src="' + this.splashImageFile + '" alt="Splash screen image" />' +
                               //'<div id="mcn-splashscreen-description" style="display: none">' + (description || '') + '<div>' +
                               '<div id="mcn-splashscreen-loader" style="opacity: 0">' +
                                   '<progress class="win-ring"></progress>' +
                                   '<div class="mcn-splashscreen-loader-text">' + (text || '') + '</div>' +
                               '</div>';
                    }
                },

                handleResize: function () {
                    this.setLocation();
                },

                handleDismissed: function (arg) {
                    //system splash screen is gone...
                    arg.target.removeEventListener("dismissed", this.handleDismissedBinded);
                },

                init: function (arg) {
                    var ctrl = this;

                    return WinJS.Promise.timeout().then(function () {
                        if (arg && arg.detail && arg.detail.splashScreen) {
                            ctrl.setLocation(arg.detail.splashScreen);
                        }
                        ctrl.element.style.display = '';
                    });
                },

                /**
                 * show splash screen during the execution of a promise. After the promise, splash screen will NOT auto-hide
                 * @param {WinJS.Promise} dataLoadPromise promise covered by splash screen
                 * @param {Object} arg application init arguments
                 * @returns {WinJS.Promise} completion promise
                 */
                show: function (dataLoadPromise, arg) {
                    console.log('show splash')
                    var ctrl = this;

                    if (arg) {
                        ctrl.init(arg);
                    }
                    if (ctrl)
                        console.log('ctrl')
                    console.log(ctrl)
                    if (ctrl.splashLoader)
                        console.log('ctrl.splashLoader')
                    if (ctrl.splashLoader.style)
                        console.log('ctrl.splashLoader.style')
                    if (ctrl.element)
                        console.log('ctrl.element')

                    ctrl.splashLoader.style.opacity = 0;
                    ctrl.element.style.display = '';
                    ctrl.element.style.opacity = '';
                    //WinJSContrib.UI.appbarsDisable();
                    if (setImmediate)
                        console.log('setImmediate')

                    return new WinJS.Promise(function (complete, error) {
                        setImmediate(function () {
                            window.addEventListener("resize", ctrl.handleResizeBinded, false);
                            ctrl.enterAnimation.bind(ctrl)();

                        });

                        WinJS.Promise.join([dataLoadPromise, WinJS.Promise.timeout(200)]).done(function () {
                            console.log('show splash complete')
                            complete();
                        }, function () {
                            console.log('show splash error')
                            error();
                        });

                    });
                },

                setLocation: function (splash) {
                    var ctrl = this;
                    if (splash && splash.imageLocation) {
                        ctrl.splashImage.style.position = 'absolute';
                        ctrl.splashImage.style.top = splash.imageLocation.y + "px";
                        ctrl.splashImage.style.left = splash.imageLocation.x + "px";
                        //ctrl.splashImage.style.height = splash.imageLocation.height + "px";
                        ctrl.splashImage.style.width = splash.imageLocation.width + "px";

                        ctrl.splashImage.style.position = 'absolute';
                        ctrl.splashLoader.style.top = (splash.imageLocation.y + splash.imageLocation.height + 20) + "px";
                        ctrl.splashLoader.style.left = splash.imageLocation.x + "px";
                    }
                    else {
                        ctrl.splashImage.style.position = '';
                        ctrl.splashImage.style.top = '';
                        ctrl.splashImage.style.left = '';
                        ctrl.splashImage.style.height = '';
                        ctrl.splashImage.style.width = '';

                        ctrl.splashImage.style.position = '';
                        ctrl.splashLoader.style.top = '';
                        ctrl.splashLoader.style.left = '';
                        ctrl.splashLoader.style.height = '';
                        ctrl.splashLoader.style.width = '';
                    }
                },

                /**
                 * hide splash screen
                 * @returns {WinJS.Promise} splash screen removal promise
                 */
                hide: function () {
                    var ctrl = this;
                    WinJSContrib.UI.appbarsEnable();
                    window.removeEventListener("resize", ctrl.handleResizeBinded);
                    return ctrl.exitAnimation.bind(ctrl)();
                }
            })
    });
})();
