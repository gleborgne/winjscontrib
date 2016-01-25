/* 
 * WinJS Contrib v2.1.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

/// <reference path="winjscontrib.core.js" />
/// <reference path="winjscontrib.ui.animation.js" /

/*
 * WARNING this module is still experimental
 */

var WinJSContrib = WinJSContrib || {};
WinJSContrib.UI = WinJSContrib.UI || {};
WinJSContrib.UI.Morph = WinJSContrib.UI.Morph || {};

(function () {
    'use strict';

    WinJSContrib.UI.Morph.from = function (elt) {
        return new MorphOp(elt);
    }

    function MorphOp(sourceElt) {
        this.sourceElement = sourceElt;
        this.checkSource();

        var elt = document.createElement('DIV');
        elt.className = 'mcn-morph';
        elt.style.position = 'fixed';
        elt.style.left = this.origin.x + 'px';
        elt.style.top = this.origin.y + 'px';
        elt.style.width = this.origin.width + 'px';
        elt.style.height = this.origin.height + 'px';

        if (this.sourceStyle.backgroundColor) elt.style.backgroundColor = this.sourceStyle.backgroundColor;
        if (this.sourceStyle.color) elt.style.color = this.sourceStyle.color;

        elt.style.opacity = 0;
        document.body.appendChild(elt);

        this.element = elt;
        this.$element = $(elt);

    }

    MorphOp.prototype.checkSource = function () {
        this.origin = WinJSContrib.UI.offsetFrom(this.sourceElement);
        this.sourceStyle = getComputedStyle(this.sourceElement);
    }

    MorphOp.prototype.hide = function () {
        this.element.style.display = 'none';
    }

    MorphOp.prototype.show = function () {
        this.element.style.display = '';
    }

    MorphOp.prototype.fadeOut = function (options) {
        var morph = this;
        return WinJSContrib.UI.Animation.fadeOut(morph.element, options).then(function () {
            if (morph.element) morph.element.style.display = 'none';
        });
    }

    MorphOp.prototype.fadeIn = function (options) {
        var morph = this;
        morph.element.style.display = '';
        return WinJSContrib.UI.Animation.fadeIn(morph.element, options);
    }

    MorphOp.prototype.dispose = function () {
        $(this.element).remove();
        this.element = null;
        this.$element = null;
        this.targetElement = null;
    }

    MorphOp.prototype.morphToElt = function (targetElt) {
        var morph = this;
        morph.targetElement = targetElt;
        morph.checkTarget(false);
    }

    MorphOp.prototype.checkTarget = function (reposition) {
        var morph = this;
        var target = WinJSContrib.UI.offsetFrom(morph.targetElement);
        morph.target = target;
        if (reposition) {
            morph.element.style.left = morph.target.x + 'px';
            morph.element.style.top = morph.target.y + 'px';
            morph.element.style.width = morph.target.width + 'px';
            morph.element.style.height = morph.target.height + 'px';
        }
    }

    MorphOp.prototype.apply = function (options) {
        var morph = this;
        options = options || {};
        var duration = options.duration || 350;
        var easing = options.easing || 'cubic-bezier(0.1, 0.9, 0.2, 1)';
        var delay = options.delay || 0;


        //var p = null;
        //p = new WinJS.Promise(function (c, e) {
        //    morph.element.style.transition = 'all ' + duration + 'ms ' + easing;
        //    setImmediate(function () {
        //        morph.$element.afterTransition(null, duration + 100).then(function () {
        //            morph.element.style.transition = '';
        //            c();
        //        });
        //        setImmediate(function () {
        //            morph.element.style.left = morph.target.x + 'px';
        //            morph.element.style.top = morph.target.y + 'px';
        //            morph.element.style.width = morph.target.width + 'px';
        //            morph.element.style.height = morph.target.height + 'px';
        //        });
        //    });

        //});

        //return p;

        return new WinJS.Promise(function (c, e) {
            morph.$element.velocity(
                {
                    left: morph.target.x + 'px',
                    top: morph.target.y + 'px',
                    width: morph.target.width + 'px',
                    height: morph.target.height + 'px'
                }, options.duration || 300, options.easing || 'easeOutQuart').promise().then(c, e);
        });
    }

    MorphOp.prototype.applyWith = function (properties, options) {
        var morph = this;
        options = options || {};
        return new WinJS.Promise(function (c, e) {
            morph.$element.velocity(properties, options.duration || 300, options.easing || 'easeOutQuart').promise().then(c, e);
        });
    }

    MorphOp.prototype.revert = function (options) {
        var morph = this;
        options = options || {};
        this.checkSource();
        this.checkTarget();
        var duration = options.duration || 350;
        var easing = options.easing || 'cubic-bezier(0.1, 0.9, 0.2, 1)';
        var delay = options.delay || 0;

        //return new WinJS.Promise(function (c, e) {
        //    morph.element.style.transition = 'all ' + duration + 'ms ' + easing + ' ' + delay + 'ms';
        //    setImmediate(function () {
        //        morph.$element.afterTransition(null, duration + 50).then(function () {
        //            morph.element.style.transition = '';
        //            c();
        //        });

        //        setImmediate(function () {                    
        //            morph.element.style.left = morph.origin.x + 'px';
        //            morph.element.style.top = morph.origin.y + 'px';
        //            morph.element.style.width = morph.origin.width + 'px';
        //            morph.element.style.height = morph.origin.height + 'px';
        //        });
        //    });
        //});

        return new WinJS.Promise(function (c, e) {
            morph.$element.velocity(
                {
                    left: morph.origin.x + 'px',
                    top: morph.origin.y + 'px',
                    width: morph.origin.width + 'px',
                    height: morph.origin.height + 'px'
                }, options.duration || 350, options.easing || 'easeOutQuart').promise().then(c, e);
        });
    }

})();