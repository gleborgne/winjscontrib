/// <reference path="mcnext.ui.utils.js" />
//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("MCNEXT.UI", {
        ExtendedSplash: WinJS.Class.define(
            /** 
             * 
             * @class MCNEXT.UI.ExtendedSplash 
             * @classdesc This control is meant to display a custome splash screen. Its primarily focused on WinRT apps but it works quite well in cordova applications
             * @param {HTMLElement} element DOM element containing the control
             * @param {Object} options
             */
            function ctor(element, options) {
                var ctrl = this;
                options = options || {};
                ctrl.element = element || document.createElement("div");
                ctrl.throttlingDelay = (options.delay != undefined) ? options.delay : 200;
                ctrl.enterAnimation = options.enterAnimation || function () {
                    var ctrl = this;
                    return MCNEXT.UI.Animation.fadeIn(ctrl.splashLoader, 500);
                };
                ctrl.exitAnimation = options.enterAnimation || function () {
                    var ctrl = this;
                    var prom1 = MCNEXT.UI.Animation.fadeOut(ctrl.element.querySelector('#mcn-splashcreen-loader'), 500);
                    var prom2 = MCNEXT.UI.Animation.fadeOut(ctrl.element, 500, { delay: 200 });

                    return WinJS.Promise.join([prom1, prom2]).then(function () {
                        ctrl.element.style.display = 'none';
                    });
                };

                ctrl.isVisible = false;
                MCNEXT.UI.Application = MCNEXT.UI.Application || {};
                MCNEXT.UI.Application.splashscreen = ctrl;
                ctrl.element.className = 'mcn-splashcreen ' + ctrl.element.className;
                if (MCNEXT.CrossPlatform)
                    MCNEXT.CrossPlatform.cordovaClass(ctrl.element.classList);
                ctrl.splashImageFile = options.image || '/images/splashscreen.png';

                if (!ctrl.element.innerHTML) {                    
                    ctrl.element.innerHTML = ctrl.defaultSplashContent(options.text || 'chargement en cours', options.description);
                }
                ctrl.textElement = ctrl.element.querySelector('.mcn-splashcreen-loader-text');
                ctrl.splashImage = ctrl.element.querySelector('#mcn-splashcreen-image');
                ctrl.splashLoader = ctrl.element.querySelector('#mcn-splashcreen-loader');
                ctrl.handleResizeBinded = ctrl.handleResize.bind(ctrl);
                ctrl.handleDismissedBinded = ctrl.handleDismissed.bind(ctrl);
            },

            /**
            * @lends MCNEXT.UI.ExtendedSplash  
            */
            {
                /** build html content for splash screen
                 * @param {string} text text displayed on splash
                 * @returns {string} HTML content
                 */
                defaultSplashContent: function (text) {
                    if (MCNEXT.CrossPlatform && (MCNEXT.CrossPlatform.isMobile.Android() || MCNEXT.CrossPlatform.isMobile.iOS())) {
                        return '<img id="mcn-splashcreen-image" src="' + this.splashImageFile + '" alt="Splash screen image" />' +
                            //'<div id="mcn-splashcreen-description" style="display: none">' + (description || '') + '<div>' +         
                            '<div id="mcn-splashcreen-loader" style="opacity: 0">' +
                            '<div class="cordova-ring"></div>' +
                            '<div class="mcn-splashcreen-loader-text">' + (text || '') + '</div>' +
                            '<div>';

                    }
                    else {
                        return '<img id="mcn-splashcreen-image" src="' + this.splashImageFile + '" alt="Splash screen image" />' +
                               //'<div id="mcn-splashcreen-description" style="display: none">' + (description || '') + '<div>' +
                               '<div id="mcn-splashcreen-loader" style="opacity: 0">' +
                                   '<progress class="win-ring"></progress>' +
                                   '<div class="mcn-splashcreen-loader-text">' + (text || '') + '</div>' +
                               '<div>';
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
                 * show splash screen
                 * @param {WinJS.Promise} dataLoadPromise promise covered by splash screen
                 * @param {Object} arg application init arguments
                 * @returns {WinJS.Promise} completion promise
                 */
                show: function (dataLoadPromise, arg) {
                    var ctrl = this;

                    if (arg) {
                        ctrl.init(arg);
                    }

                    ctrl.splashLoader.style.opacity = 0;
                    ctrl.element.style.display = '';
                    ctrl.element.style.opacity = '';
                    MCNEXT.UI.appbarsDisable();

                    return new WinJS.Promise(function (complete, error) {
                        setImmediate(function () {
                            window.addEventListener("resize", ctrl.handleResizeBinded, false);
                            ctrl.enterAnimation.bind(ctrl)();

                        });

                        WinJS.Promise.join([dataLoadPromise, WinJS.Promise.timeout(200)]).done(function () {
                            complete();
                        }, function () {
                            error();
                        });

                    });
                },

                setLocation: function (splash) {
                    var ctrl = this;
                    if (splash) {
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
                    MCNEXT.UI.appbarsEnable();
                    window.removeEventListener("resize", ctrl.handleResizeBinded);
                    return ctrl.exitAnimation.bind(ctrl)();
                }
            })
    });
})();
