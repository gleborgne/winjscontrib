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
        var origin = WinJSContrib.UI.offsetFrom(sourceElt);
        var style = getComputedStyle(sourceElt);
        var elt = document.createElement('DIV');
        elt.className = 'mcn-morph';
        elt.style.position = 'fixed';
        elt.style.left = origin.x + 'px';
        elt.style.top = origin.y + 'px';
        elt.style.width = origin.width + 'px';
        elt.style.height = origin.height + 'px';

        if (style.backgroundColor) elt.style.backgroundColor = style.backgroundColor;
        if (style.color) elt.style.color = style.color;

        elt.style.opacity = 0;
        document.body.appendChild(elt);

        this.element = elt;
        this.$element = $(elt);
        this.sourceElement = sourceElt;
        this.origin = origin;
        this.sourceStyle = style;
    }

    MorphOp.prototype.hide = function () {
        this.element.style.display = 'none';
    }

    MorphOp.prototype.show = function () {
        this.element.style.display = '';
    }

    MorphOp.prototype.fadeOut = function (duration, options) {
        var morph = this;
        return WinJSContrib.UI.Animation.fadeOut(morph.element, duration, options).then(function () {
            morph.element.style.display = 'none';
        });
    }

    MorphOp.prototype.fadeIn = function (duration, options) {
        var morph = this;
        morph.element.style.display = '';
        return WinJSContrib.UI.Animation.fadeIn(morph.element, duration, options);
    }

    MorphOp.prototype.dispose = function () {
        $(this.element).remove();
        this.element = null;
        this.targetElement = null;
    }

    MorphOp.prototype.morphToElt = function (targetElt) {
        var morph = this;
        var target = WinJSContrib.UI.offsetFrom(targetElt);
        morph.targetElement = targetElt;
        morph.target = target;
    }

    MorphOp.prototype.apply = function (options) {
        var morph = this;
        options = options || {};
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