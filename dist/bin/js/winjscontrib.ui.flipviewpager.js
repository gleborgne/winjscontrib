/* 
 * WinJS Contrib v2.0.1.0
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

(function () {
    'use strict';
    WinJS.Namespace.define("WinJSContrib.UI", {
        FlipViewPager: WinJS.Class.mix(WinJS.Class.define(
        /**
         * @classdesc
         * Flipview companion to display pages markers (like carousels)
         * @class WinJSContrib.UI.FlipViewPager
         * @param {HTMLElement} element DOM element containing the control
         * @param {Object} options
         */
        function ctor(element, options) {
            this.element = element || document.createElement('DIV');
            options = options || {};
            this.element.className = 'mcn-flipviewpager';
            this.element.winControl = this;
            this.element.classList.add('win-disposable');
            this.isFlipping = false;
            this.flipviewPageVisibilityChangeBinded = this.flipviewPageVisibilityChange.bind(this);
            this.pageSelectedBinded = this.pageSelected.bind(this);
            this.countChangedBinded = this.countChanged.bind(this);
            WinJS.UI.setOptions(this, options);
        },
        /**
         * @lends WinJSContrib.UI.FlipViewPager.prototype
         */
        {
            /**
             * attached flipview
             * @type {Object}
             */
            flipView: {
                get: function () {
                    return this._flipView;
                },
                set: function (val) {
                    this.unregisterFlipViewEvents();
                    if (val) {
                        this._flipView = val;
                        if (val.winControl)
                            this._flipView = val.winControl;
                        this.registerFlipViewEvents();
                        this.initControl();
                    }
                    else {
                        this._flipView = undefined;
                    }
                }
            },

            initControl: function () {
                var ctrl = this;
                this._flipView.count().done(function (count) {
                    ctrl.initButtons(count);
                });
            },

            buttonClicked: function (eventObject) {
                if (this.isFlipping) {
                    // Need to set whats check back since we are mid flip.
                    var currentPage = this._flipview.currentPage;
                    radioButtons[currentPage].checked = true;

                } else {
                    // Set the new page since we are not already flipping.
                    var targetPage = eventObject.srcElement.getAttribute("value");
                    this._flipView.currentPage = parseInt(targetPage, 10);
                }
            },

            countChanged: function () {
                this.initControl();
            },

            pageSelected: function () {
                this.isFlipping = false;
                var currentPage = this._flipView.currentPage;
                var btn = this.radioButtons[currentPage];
                if (btn) {
                    btn.checked = true;
                }
                else {
                    this.initControl();
                }
            },

            flipviewPageVisibilityChange: function (eventObject) {
                if (eventObject.detail.visible === true) {
                    this.isFlipping = true;
                }
            },

            registerFlipViewEvents: function () {
                if (!this._flipView)
                    return;

                this._flipView.addEventListener("pagevisibilitychanged", this.flipviewPageVisibilityChangeBinded, false);
                this._flipView.addEventListener("pageselected", this.pageSelectedBinded, false);
                this._flipView.addEventListener("datasourcecountchanged", this.countChangedBinded, false);
            },

            unregisterFlipViewEvents: function () {
                if (!this._flipView)
                    return;

                this._flipView.removeEventListener("pagevisibilitychanged", this.flipviewPageVisibilityChangeBinded);
                this._flipView.removeEventListener("pageselected", this.pageSelectedBinded);
                this._flipView.removeEventListener("datasourcecountchanged", this.countChangedBinded);
            },

            initButtons: function (count) {
                this.radioButtons = [];
                this.element.innerHTML = '';
                for (var i = 0; i < count; ++i) {
                    var radioButton = document.createElement("input");
                    radioButton.setAttribute("type", "radio");
                    radioButton.setAttribute("name", "flipviewPagerContextGroup");
                    radioButton.setAttribute("value", i);
                    radioButton.setAttribute("aria-label", (i + 1) + " of " + count);
                    radioButton.onclick = this.buttonClicked.bind(this);

                    this.radioButtons.push(radioButton);
                    this.element.appendChild(radioButton);
                }
                if (count > 0) {
                    this.radioButtons[this._flipView.currentPage].checked = true;
                }
            },

            dispose: function () {
                this.unregisterFlipViewEvents();
                WinJS.Utilities.disposeSubTree(this.element);
            }
        }),
        WinJS.UI.DOMEventMixin)
    });
})();