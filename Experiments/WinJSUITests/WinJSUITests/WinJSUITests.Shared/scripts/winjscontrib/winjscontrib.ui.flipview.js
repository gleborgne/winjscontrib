/* 
 * WinJS Contrib v2.1.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

//this is a blank WinJS control structure. It's intended to use as a startup for new controls

(function () {
    'use strict';
    var leftArrowGlyph = "&#57570;",
                rightArrowGlyph = "&#57571;",
                topArrowGlyph = "&#57572;",
                bottomArrowGlyph = "&#57573;";

    WinJS.Namespace.define("WinJSContrib.UI", {
        FlipView: WinJS.Class.mix(WinJS.Class.define(function ctor(element, options) {
            var ctrl = this;
            this.element = element || document.createElement('DIV');
            options = options || {};
            this.element.winControl = this;
            this.element.classList.add('mcn-flipview');
            this.element.classList.add('win-disposable');
            this._pages = [];
            this.pagesBuffer = 2;
            this._currentPage = 0;
            this._itemTemplate = null;
            this._items = null;

            this.wrapper = document.createElement("DIV");
            this.wrapper.className = "mcn-flipview-wrapper";
            this.element.appendChild(this.wrapper);            

            this.pagesContainer = document.createElement("DIV");
            this.pagesContainer.className = "mcn-flipview-pages";
            this.wrapper.appendChild(this.pagesContainer);

            this.buttonsContainer = document.createElement("DIV");
            this.buttonsContainer.className = "mcn-flipview-buttons";
            this.wrapper.appendChild(this.buttonsContainer);

            this.navLeft = document.createElement("BUTTON");
            this.navLeft.className = "mcn-nav-button win-navleft hidden";
            this.navLeft.innerHTML = leftArrowGlyph;
            this.buttonsContainer.appendChild(this.navLeft);
            this.navLeft.onclick = function () {
                ctrl.goPrevious();
            }
            this.navRight = document.createElement("BUTTON");
            this.navRight.className = "mcn-nav-button win-navright hidden";
            this.navRight.innerHTML = rightArrowGlyph;
            this.navRight.onclick = function () {
                ctrl.goNext();
            }
            this.buttonsContainer.appendChild(this.navRight);

            WinJS.UI.setOptions(this, options);
        }, {
            itemTemplate: {
                get: function () {
                    return this._itemTemplate;
                },
                set: function (val) {
                    if (val.winControl)
                        val = val.winControl;

                    this._itemTemplate = val;
                    this._destroyAllPages();
                    this.moveToPageIndex(this._currentPage);
                }
            },

            items: {
                get: function () {
                    return this._items;
                },
                set: function (val) {
                    this._items = val;
                    this._destroyAllPages();
                    this.moveToPageIndex(this._currentPage);
                }
            },

            currentPage: {
                get: function () {
                    return this._currentPage;
                },
                set: function (val) {
                    if (val != this._currentPage) {
                        this.moveToPageIndex(val);
                    }
                }
            },

            goPrevious : function(){
                var ctrl = this;
                var currentPage = ctrl._pages[ctrl._currentPage];
                if (currentPage) {
                    ctrl._exitPage(currentPage, WinJSContrib.UI.Animation.slideToRight);
                }
                ctrl.moveToPageIndex(ctrl._currentPage - 1);
            },

            goNext: function () {
                var ctrl = this;
                var currentPage = ctrl._pages[ctrl._currentPage];
                if (currentPage) {
                    ctrl._exitPage(currentPage, WinJSContrib.UI.Animation.slideToLeft);
                }
                ctrl.moveToPageIndex(ctrl._currentPage + 1);
            },

            _exitPage: function (page, animation) {
                if (page && page.element) {
                    page.element.classList.remove("selected");
                    animation(page.element).then(function () {
                        if (page.element) page.element.classList.add("hidden");
                    });
                }
            },

            moveToPageIndex: function (index) {
                var ctrl = this;

                if (index < 0)
                    index = 0;
                if (ctrl.items && index >= ctrl.items.length)
                    index = ctrl.items.length - 1;

                var oldPageIndex = ctrl._currentPage;
                this._currentPage = index;
                var diff = this._currentPage - oldPageIndex;
                if (!ctrl.itemTemplate || !ctrl.items)
                    return;

              
                var item = ctrl.items[ctrl._currentPage];
                if (item) {
                    var page = ctrl._createPage(item, ctrl._currentPage);
                    page.element.style.opacity = "";
                    page.element.classList.remove("hidden");
                    page.element.classList.add("selected");
                    if (diff > 0) {
                        WinJSContrib.UI.Animation.slideFromRight(page.element).then(function () {
                            page.cleanTransform();
                        });
                    } else if (diff < 0) {
                        WinJSContrib.UI.Animation.slideFromLeft(page.element).then(function () {
                            page.cleanTransform();
                        });
                    }
                    ctrl.dispatchEvent("pageselected", { currentPage: ctrl._currentPage });
                    setImmediate(function () {
                        ctrl._cleanPages();
                        ctrl.preparePreviousPage(ctrl._currentPage - 1);
                        ctrl.prepareNextPage(ctrl._currentPage + 1);
                    });

                    if (ctrl._currentPage == 0) {
                        ctrl.navLeft.classList.add("hidden");
                    } else {
                        ctrl.navLeft.classList.remove("hidden");
                    }
                    if (ctrl._currentPage >= ctrl._items.length - 1) {
                        ctrl.navRight.classList.add("hidden");
                    } else {
                        ctrl.navRight.classList.remove("hidden");
                    }
                }
            },

            preparePreviousPage : function(index){
                var ctrl = this;
                if (index < 0 || !ctrl.items || !ctrl.items.length) {
                    return;
                }

                var item = ctrl.items[index];
                if (item) {
                    var page = ctrl._createPage(item, index);
                    
                    //if (page.element.style.webkitTransform != undefined) {
                    //    page.element.style.webkitTransform = "translate3d(-100%, 0, 0)";
                    //} else {
                    //    page.element.style.transform = "translate3d(-100%, 0, 0)";
                    //}
                    //page.element.classList.remove("hidden");
                }
            },


            prepareNextPage: function (index) {
                var ctrl = this;
                if (!ctrl.items || !ctrl.items.length || index >= ctrl.items.length) {
                    return;
                }

                var item = ctrl.items[index];
                if (item) {
                    var page = ctrl._createPage(item, index);
                    
                    //if (page.element.style.webkitTransform != undefined) {
                    //    page.element.style.webkitTransform = "translate3d(100%, 0, 0)";
                    //} else {
                    //    page.element.style.transform = "translate3d(100%, 0, 0)";
                    //}
                    //page.element.classList.remove("hidden");
                }
            },

            _cleanPages: function () {
                var ctrl = this;
                if (ctrl._pages && ctrl._pages.length) {
                    var min = ctrl._currentPage - ctrl.pagesBuffer;
                    var max = ctrl._currentPage + ctrl.pagesBuffer;

                    ctrl._pages.forEach(function (p, index) {
                        if (p && (index < min || index > max)) {
                            p.dispose();
                            ctrl._pages[index] = null;
                        }
                    });
                }
            },

            _destroyAllPages: function () {
                if (this._pages && this._pages.length) {
                    this._pages.forEach(function (p) {
                        if (p) {
                            p.dispose();
                        }
                    });
                }
                this.pagesContainer.innerHTML = "";
                this._pages = [];
            },

            _createPage: function (item, index) {
                var ctrl = this;
                if (ctrl._pages[index])
                    return ctrl._pages[index];

                var page = {
                    element: document.createElement("DIV"),
                    swipeslide: null,
                    index: index,
                    contentPromise: null,
                    eventTracker: new WinJSContrib.UI.EventTracker(),
                    cleanTransform: function () {
                        if (this.element) {
                            if (this.element.style.webkitTransform) {
                                this.element.style.webkitTransition = "";
                                this.element.style.webkitTransform = "";
                            } else {
                                this.element.style.transition = "";
                                this.element.style.transform = "";
                            }
                        }
                    },
                    dispose: function () {
                        this.eventTracker.dispose();
                        if (this.element)
                            ctrl.pagesContainer.removeChild(this.element);
                        this.element = null;
                    }
                };

                page.element.className = "mcn-flipview-page win-disposable hidden";
                ctrl.pagesContainer.appendChild(page.element);
                var swipeslide = new WinJSContrib.UI.SwipeSlide(page.element);
                page.swipeslide = swipeslide;
                page.element.winControl = page;

                page.eventTracker.addEvent(swipeslide, "swipe", function (swipearg) {
                    if (swipearg.direction == "left" && swipeslide.allowed.left) {
                        console.log("swipe to left");
                        swipeslide.swipeHandled = true;
                        ctrl._exitPage(page, WinJSContrib.UI.Animation.slideToLeft);
                        ctrl.currentPage = ctrl.currentPage + 1;
                    } else if (swipearg.direction == "right" && swipeslide.allowed.right) {
                        console.log("swipe to right");
                        swipeslide.swipeHandled = true;
                        ctrl._exitPage(page, WinJSContrib.UI.Animation.slideToRight);
                        ctrl.currentPage = ctrl.currentPage - 1;
                    }
                });

                if (index == 0) {
                    page.swipeslide.allowed.right = false;
                }
                if (index == ctrl.items.length - 1) {
                    page.swipeslide.allowed.left = false;
                }

                var p = null;
                if (typeof ctrl.itemTemplate === "function")
                    p = ctrl.itemTemplate(WinJS.Promise.wrap({ index : index, data: item }));
                else
                    p = ctrl.itemTemplate.render(item);

                page.contentPromise = p.then(function (rendered) {
                    page.element.appendChild(rendered);
                });

                ctrl._pages[index] = page;

                return page;
            },

            dispose: function () {
                WinJS.Utilities.disposeSubTree(this.element);
                this.element = null;
            }
        }),
		WinJS.Utilities.eventMixin,
		WinJS.Utilities.createEventProperties("pageselected"))
    });
})();