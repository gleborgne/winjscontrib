var WinJSContrib = WinJSContrib || {};

/**
 * @namespace
 */
WinJSContrib.CrossPlatform = WinJSContrib.Cross || {};
(function () {
    WinJSContrib.CrossPlatform.cordovaClass = function (classList) {
        if (WinJSContrib.Utils.isMobile.Android() || WinJSContrib.Utils.isMobile.iOS()) {
            classList.add("mcn-cordova");
        }

        return classList
    }

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