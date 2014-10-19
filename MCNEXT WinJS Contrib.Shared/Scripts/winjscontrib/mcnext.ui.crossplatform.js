var MCNEXT = MCNEXT || {};

/**
 * @namespace
 */
MCNEXT.Cross = MCNEXT.Cross || {};
(function () {
    MCNEXT.Cross.cordovaClass = function (classList) {
        if (MCNEXT.Utils.isMobile.Android() || MCNEXT.Utils.isMobile.iOS()) {
            classList.add("mcn-cordova");
        }

        return classList
    }

    MCNEXT.Cross.isMobile = {
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