/* 
 * WinJS Contrib v2.1.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

/// <reference path="winjscontrib.core.js" />
(function () {
    'use strict';
    WinJS.Namespace.define("WinJSContrib.UI", {
        AspectRatio: WinJS.Class.mix(WinJS.Class.define(
        /**
             * @classdesc 
             * resize item based on its proportions
             * @class WinJSContrib.UI.AspectRatio
             * @param {HTMLElement} element DOM element owning the control
             * @param {Object} options
             */
        function ctor(element, options) {
            this.element = element || document.createElement('DIV');
            options = options || {};
            this.element.winControl = this;
            this.element.style.display = 'none';
            this.element.classList.add('mcn-aspectratio');
            this.element.classList.add('win-disposable');
            this.element.classList.add('mcn-layout-ctrl');
            WinJS.UI.setOptions(this, options);
            this.render();
        }, 
        /**
         * @lends WinJSContrib.UI.AspectRatio.prototype
         */
        {
            /**
             * base width
             * @field
             */
            baseWidth: {
                get: function () {
                    return this._baseWidth;
                },
                set: function (val) {
                    this._baseWidth = val;
                }
            },

            /**
             * base width minimum
             * @field
             */
            baseWidthMin: {
                get: function () {
                    return this._baseWidthMin;
                },
                set: function (val) {
                    this._baseWidthMin = val;
                }
            },

            /**
             * base width margin
             * @field
             */
            baseWidthMargin: {
                get: function () {
                    return this._baseWidthMargin || 0;
                },
                set: function (val) {
                    this._baseWidthMargin = val;
                }
            },

            /**
             * base height
             * @field
             */
            baseHeight: {
                get: function () {
                    return this._baseHeight;
                },
                set: function (val) {
                    this._baseHeight = val;
                }
            },

            /**
             * base height minimum
             * @field
             */
            baseHeightMin: {
                get: function () {
                    return this._baseHeightMin;
                },
                set: function (val) {
                    this._baseHeightMin = val;
                }
            },

            /**
             * base height margin
             * @field
             */
            baseHeightMargin: {
                get: function () {
                    return this._baseHeightMargin || 0;
                },
                set: function (val) {
                    this._baseHeightMargin = val;
                }
            },

            /**
             * aspect ratio
             * @field
             */
            ratio: {
                get: function () {
                    return this._ratio;
                },
                set: function (val) {
                    this._ratio = val;
                }
            },

            /**
             * based on
             * @field
             */
            basedOn: {
                get: function () {
                    return this._basedOn;
                },
                set: function (val) {
                    this._basedOn = val;
                }
            },

            /**
             * target
             * @field
             */
            target: {
                get: function () {
                    return this._target;
                },
                set: function (val) {
                    this._target = val;
                }
            },

            render: function () {
                var ctrl = this;
                if (!ctrl.styleElt) {
                    ctrl.styleElt = document.createElement('STYLE');
                    ctrl.element.appendChild(ctrl.styleElt);
                }
                ctrl.updateLayout();
            },

            pageLayout: function () {
                this.updateLayout();
            },

            updateLayout: function () {
                var ctrl = this;

                if (!ctrl.parentpage)
                    ctrl.parentpage = WinJSContrib.Utils.getScopeControl(ctrl.element);

                if (!ctrl.container)
                    ctrl.container = ctrl.element.parentElement;

                if (ctrl.container && ctrl.target) {
                    if (ctrl.basedOn == "height") {
                        ctrl.updateLayoutBasedOnHeight();
                    } else {
                        ctrl.updateLayoutBasedOnWidth();
                    }
                }
            },

            updateLayoutBasedOnWidth: function () {
                var ctrl = this;

                var classname = ctrl.target;
                if (ctrl.prefix) {
                    classname = ctrl.prefix + ' ' + classname;
                }

                var container = ctrl.parentpage.element;
                if (ctrl.baseWidth) {
                    var nbitems = ((ctrl.container.clientWidth / ctrl.baseWidth) << 0) + 1;
                    var itemW = ((ctrl.container.clientWidth / nbitems) << 0) - ctrl.baseWidthMargin - 0.25;
                    if (ctrl.ratio) {
                        var targetH = (itemW / ctrl.ratio) << 0;
                        ctrl.styleElt.innerHTML = classname + "{ width: " + itemW + "px; height:" + targetH + "px}";
                    } else {
                        ctrl.styleElt.innerHTML = classname + "{ width: " + itemW + "px; }";
                    }
                } else if (ctrl.ratio) {
                    var elements = ctrl.container.querySelectorAll(ctrl.target);
                    var eltW = elements[0].clientWidth;
                    var eltH = elements[0].clientHeight;

                    if (eltW > 0) {
                        var targetH = (eltW / ctrl.ratio) << 0;
                        if (ctrl.max) {
                            var maxH = (container.clientHeight * ctrl.max / 100) << 0;
                            if (targetH > maxH) {
                                targetH = maxH;
                            }
                        }
                        ctrl.styleElt.innerHTML = classname + "{ height:" + targetH + "px}";
                    }
                } else {
                    console.warn("aspect ratio control must have baseWidth and/or ratio")
                }
            },

            updateLayoutBasedOnHeight: function () {
                var ctrl = this;

                var classname = ctrl.target;
                if (ctrl.prefix) {
                    classname = ctrl.prefix + ' ' + classname;
                }

                if (ctrl.baseHeight) {
                    var nbitems = ((ctrl.container.clientHeight / ctrl.baseHeight) << 0) + 1;
                    var itemH = ((ctrl.container.clientHeight / nbitems) << 0) - ctrl.baseHeightMargin;
                    var targetW = (itemH / ctrl.ratio) << 0;
                    ctrl.styleElt.innerHTML = classname + "{ width: " + targetW + "px; height:" + itemH + "px}";
                } else {
                    var elements = ctrl.container.querySelectorAll(ctrl.target);
                    var eltW = elements[0].clientWidth;
                    var eltH = elements[0].clientHeight;

                    if (eltH > 0) {
                        var targetW = (eltH * ctrl.ratio) << 0;
                        if (ctrl.max) {
                            var maxW = (ctrl.container.clientWidth * ctrl.max / 100) << 0;
                            if (targetW > maxW) {
                                targetW = maxW;
                            }
                        }
                        ctrl.styleElt.innerHTML = classname + "{ width:" + targetW + "px}";
                    }
                }
            },

            dispose: function () {
                var ctrl = this;
                ctrl.parentpage = null;
                ctrl.container = null;
                ctrl.styleElt.parentElement.removeChild(ctrl.styleElt);
                WinJS.Utilities.disposeSubTree(this.element);
                this.element = null;
            }
        }),
		WinJS.Utilities.eventMixin,
		WinJS.Utilities.createEventProperties("myevent"))
    });
})();