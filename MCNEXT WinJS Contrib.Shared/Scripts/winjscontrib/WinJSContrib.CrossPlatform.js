var WinJSContrib = WinJSContrib || {};

/**
 * @namespace
 */
WinJSContrib.CrossPlatform = WinJSContrib.Cross || {};
(function () {
    
    /**
     * add css class corresponding to cross platform devices
     */
    WinJSContrib.CrossPlatform.crossPlatformClass = function (element) {
        element.classList.add("mcn-xplat");
        if (WinJSContrib.CrossPlatform.isMobile.Android()) {
            element.classList.add("mcn-xplat-android");
        }
        if (WinJSContrib.CrossPlatform.isMobile.iOS()) {
            element.classList.add("mcn-xplat-ios");
        }
        if (WinJSContrib.CrossPlatform.isMobile.BlackBerry()) {
            element.classList.add("mcn-xplat-blackberry");
        }
        if (WinJSContrib.CrossPlatform.isMobile.Windows()) {
            element.classList.add("mcn-xplat-windows");
        }
        return classList
    }

    /**
     * check user agent for identifying platform device
     */
    WinJSContrib.CrossPlatform.isMobile = {
        Android: function () {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function () {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function () {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function () {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function () {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };
})();