/* 
 * WinJS Contrib v2.1.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

var WinJSContrib = WinJSContrib || {};
WinJSContrib.UI = WinJSContrib.UI || {};

(function () {
    "use strict";

    WinJSContrib.UI.MultiPassRenderer = WinJS.Class.define(
    /**
     * This control manage multi-pass rendering for improving performances when showing a list of items.
     * The renderer will render "shells" for the items to enable page layout, and render items content on demand, or when items scrolls to view.  
     * @class WinJSContrib.UI.MultiPassRenderer
     */
    function (element, options) {
        options = options || {};
        this.items = [];
        this.element = element;
        this._scrollProcessor = null;
        this._tolerance = 1;
        this._virtualize = false;
        this._scrollContainer = options.scrollContainer || null;
        this._multipass = options.multipass || false;
        this._orientation = options.orientation || '';
        this.itemClassName = options.itemClass || options.className || options.itemClassName;
        this.itemTemplate = WinJSContrib.Utils.getTemplate(options.template || options.itemTemplate);
        this.itemInvoked = options.invoked || options.itemInvoked;
        this.onitemContent = options.onitemContent;
        this._onScrollBinded = this._onScroll.bind(this);

        if (element) {
            element.className = element.className + ' mcn-items-ctrl mcn-layout-ctrl win-disposable';
        }

        //element.mcnRenderer = this;
        //WinJS.UI.setOptions(this, options);
    },
    /**
      * @lends WinJSContrib.UI.MultiPassRenderer.prototype
      */
    {
        dispose : function(){
            var ctrl = this;
            WinJSContrib.UI.untapAll(ctrl.element);
            WinJS.Utilities.disposeSubTree(ctrl.element);
            ctrl._unregisterScrollEvents();
            ctrl._scrollContainer = null;
            ctrl.element = null;
            ctrl._scrollProcessor = null;
            ctrl.rect = null;           
            ctrl.items = [];
        },

        clear: function () {
            var ctrl = this;
            WinJS.Utilities.disposeSubTree(ctrl.element);
            ctrl.element.innerHTML = '';
        },

        /**
         * kind of multipass, can be 'section', or 'item'
         * @type {String}
         * @field
         */
        multipass: {
            get: function () {
                return this._multipass;
            },
            set: function (val) {
                this._multipass = val;
                this.refreshScrollEvents();
            }
        },

        /**
         * tolerance for determining if the rendering should apply. Tolerance is expressed in scroll container proportion. For example, 1 means that tolerance is equal to scroll container size
         * @type {number}
         * @field
         */
        tolerance: {
            get: function () {
                return this._tolerance;
            },
            set: function (val) {
                this._tolerance = val;
            }
        },

        /**
         * indicate if renderer empty items out of sight
         * @type {boolean}
         * @field
         */
        virtualize: {
            get: function () {
                return this._virtualize;
            },
            set: function (val) {
                this._virtualize = val;
            }
        },

        /**
         * could be 'vertical' or 'horizontal'
         * @type {String}
         * @field
         */
        orientation: {
            get: function () {
                return this._orientation;
            },
            set: function (val) {
                this._orientation = val;
                this.refreshScrollEvents();
            }
        },

        /**
         * Element containing scroll. If scrollContainer is filled, items content will get rendered when coming into view
         * @type {HTMLElement}
         * @field
         */
        scrollContainer: {
            get: function () {
                return this._scrollContainer;
            },
            set: function (val) {
                this._unregisterScrollEvents();
                this._scrollContainer = val;
                this._registerScrollEvents();
                //this.checkRendering();
            }
        },

        _onScroll: function () {
            var ctrl = this;
            if (ctrl.scrollContainer && ctrl._scrollProcessor) {
                if (ctrl._scrollRequest) {
                    cancelAnimationFrame(ctrl._scrollRequest);
                }

                ctrl._scrollRequest = requestAnimationFrame(function () {
                    ctrl.checkRendering();
                });
            }
        },

        _unregisterScrollEvents: function () {
            this._scrollProcessor = null;
            this.clearOffsets();
            if (this.scrollContainer) {
                this.scrollContainer.removeEventListener('scroll', this._onScrollBinded);
            }
        },

        _registerScrollEvents: function () {
            var ctrl = this;
            if (ctrl.scrollContainer) {
                this.scrollContainer.addEventListener('scroll', this._onScrollBinded);

                if (ctrl.orientation == 'vertical') {
                    if (ctrl.multipass == 'section') {
                        ctrl._scrollProcessor = function () { ctrl._checkSection(ctrl._vIsInView); }
                    } else if (ctrl.multipass == 'item') {
                        ctrl._scrollProcessor = function () { ctrl._checkItem(ctrl._vIsInView); }
                    }
                } else {
                    if (ctrl.multipass == 'section') {
                        ctrl._scrollProcessor = function () { ctrl._checkSection(ctrl._hIsInView); }
                    } else if (ctrl.multipass == 'item') {
                        ctrl._scrollProcessor = function () { ctrl._checkItem(ctrl._hIsInView); }
                    }
                }
            }
        },

        /**
         * refresh scroll events associated to multi pass renderer
         */
        refreshScrollEvents: function () {
            this._unregisterScrollEvents();
            this._registerScrollEvents();
            this.clearOffsets();
        },

        _vIsInView: function (rect, scrollContainer, tolerance) {
            var pxTolerance = scrollContainer.clientHeight * tolerance;
            if (rect.y >= scrollContainer.scrollTop - pxTolerance && rect.y <= scrollContainer.scrollTop + scrollContainer.clientHeight + pxTolerance)
                return true;

            if (rect.y + rect.height >= scrollContainer.scrollTop - pxTolerance && rect.y + rect.height <= scrollContainer.scrollTop + scrollContainer.clientHeight + pxTolerance)
                return true;

            if (rect.y <= scrollContainer.scrollTop - pxTolerance && rect.y + rect.height >= scrollContainer.scrollTop + scrollContainer.clientHeight + pxTolerance)
                return true;

            return false;
        },

        _hIsInView: function (rect, scrollContainer, tolerance) {
            var pxTolerance = scrollContainer.clientWidth * (tolerance || 0);
            if (rect.x >= scrollContainer.scrollLeft - pxTolerance && rect.x <= scrollContainer.scrollLeft + scrollContainer.clientWidth + pxTolerance)
                return true;

            if (rect.x + rect.width >= scrollContainer.scrollLeft - pxTolerance && rect.x + rect.width <= scrollContainer.scrollLeft + scrollContainer.clientWidth + pxTolerance)
                return true;

            if (rect.x <= scrollContainer.scrollLeft - pxTolerance && rect.x + rect.width >= scrollContainer.scrollLeft + scrollContainer.clientWidth + pxTolerance)
                return true;

            return false;
        },

        /**
         * Clear cached offsets for bloc and for items
         */
        clearOffsets: function () {
            var ctrl = this;
            if (!ctrl.element)
                return;
            
            ctrl.rect = null;
            ctrl.items.forEach(function (item) {
                item.rect = null;
            });
        },

        /**
         * update ui related properties like cached offsets, scroll events, ...
         */
        updateLayout: function () {
            var ctrl = this;
            if (!ctrl.element)
                return;
            ctrl.refreshScrollEvents();
        },

        _checkSection: function (check, tolerance, noRender) {
            var ctrl = this;
            if (!ctrl.element)
                return;
            tolerance = tolerance || 0;

            if (!ctrl.rect && ctrl.items && ctrl.items.length) {
                ctrl.rect = WinJSContrib.UI.offsetFrom(ctrl.element, ctrl.scrollContainer);
            } else {
                ctrl.rect = ctrl.rect || { x: 0, y: 0, width: 0, height: 0 };
                ctrl.rect.width = ctrl.element.clientWidth;
                ctrl.rect.height = ctrl.element.clientHeight;
            }

            if (check(ctrl.rect, ctrl.scrollContainer, tolerance)) {
                if (noRender)
                    return true;

                ctrl.renderItemsContent();
                if (ctrl.onrendersection) {
                    ctrl.onrendersection();
                }
            } else if (ctrl.virtualize && tolerance > 0 && ctrl.items && ctrl.items.length && ctrl.items[0].rendered) {
                ctrl.items.forEach(function (item) {
                    item.empty();
                });
            }

            if (tolerance == 0 && ctrl.tolerance > 0) {
                setImmediate(function () {
                    ctrl._checkSection(check, ctrl.tolerance);
                });
            }
        },

        _checkItem: function (check, tolerance) {
            var ctrl = this;
            if (!ctrl.element)
                return;
            tolerance = tolerance || 0;
            var allRendered = true;

            var countR = function () {
                var countRendered = 0;
                ctrl.items.forEach(function (item) {
                    if (item.rendered) {
                        countRendered++;
                    }
                });
                console.log('rendered ' + countRendered);
            }

            if (ctrl._checkSection(check, tolerance, true)) {
                ctrl.items.forEach(function (item) {
                    if (!item.rect) {
                        item.rect = WinJSContrib.UI.offsetFrom(item.element, ctrl.scrollContainer);
                    }
                    allRendered = allRendered & item.rendered;

                    if (!item.rendered && check(item.rect, ctrl.scrollContainer, tolerance)) {
                        item.render();
                    } else if (item.rendered && ctrl.virtualize && tolerance > 0 && !check(item.rect, ctrl.scrollContainer, tolerance)) {
                        item.empty();
                    }
                });
                ctrl.allRendered = allRendered;
                //countR();
            } else if (tolerance > 0 && ctrl.items.length && (ctrl.items[0].rendered || ctrl.items[ctrl.items.length - 1].rendered)) {
                ctrl.items.forEach(function (item) {
                    if (!item.rect) {
                        item.rect = WinJSContrib.UI.offsetFrom(item.element, ctrl.scrollContainer);
                    }
                    if (ctrl.virtualize && !check(item.rect, ctrl.scrollContainer, tolerance)) {
                        item.empty();
                    }
                });
                //countR();
            }

            if (tolerance == 0 && ctrl.tolerance > 0) {
                setImmediate(function () {
                    ctrl._checkItem(check, ctrl.tolerance);
                });
            }


        },

        /**
         * render items shells to the page
         * @param {Array} items array of items to render
         * @param {Object} renderOptions options for rendering items, can override control options like item template
         */
        prepareItems: function (items, renderOptions) {
            var ctrl = this;
            items = items || [];
            renderOptions = renderOptions || {};
            var numItems = items.length;

            var itemInvoked = renderOptions.itemInvoked || ctrl.itemInvoked;
            if (typeof itemInvoked == 'string')
                itemInvoked = WinJSContrib.Utils.resolveMethod(ctrl.element, itemInvoked);
            var template = WinJSContrib.Utils.getTemplate(renderOptions.template) || ctrl.itemTemplate;
            var className = renderOptions.itemClassName || ctrl.itemClassName;
            var onitemInit = renderOptions.onitemInit || ctrl.onitemInit;
            var onitemContent = renderOptions.onitemContent || ctrl.onitemContent;
            var container = ctrl.element;
            var registereditems = ctrl.items;

            items.forEach(function (itemdata) {
                var item = new WinJSContrib.UI.MultiPassItem(ctrl, null, {
                    data: itemdata,
                    template: template,
                    className: className,
                    itemInvoked: itemInvoked,
                    onitemInit: onitemInit,
                    onitemContent: onitemContent
                });
                registereditems.push(item);
                container.appendChild(item.element);
            });
            //for (var i = 0 ; i < numItems; i++) {
            //    var itemdata = items[i];
            //    var item = new WinJSContrib.UI.MultiPassItem(ctrl, null, {
            //        data: itemdata,
            //        template: template,
            //        className: className,
            //        itemInvoked: itemInvoked,
            //        onitemInit: onitemInit,
            //        onitemContent: onitemContent
            //    });
            //    registereditems.push(item);
            //    container.appendChild(item.element);
            //}

            if (renderOptions.renderItems || !this.multipass) {
                ctrl.renderItemsContent();
            }
            //ctrl.element.style.display = '';
        },

        /**
         * check rendering of items, based on multipass configuration (force items on screen to render)
         */
        checkRendering: function () {
            var ctrl = this;
            if (ctrl.element && ctrl._scrollProcessor)
                ctrl._scrollProcessor();
        },

        /**
         * force rendering of all unrendered items
         */
        renderItemsContent: function () {
            var ctrl = this;
            if (!ctrl.element)
                return;

            ctrl.items.forEach(function (item) {
                if (!item.rendered) {
                    //setImmediate(function () {
                    item.render();
                    //});
                }
            });
            ctrl.allRendered = true;
        }
    });

    WinJSContrib.UI.MultiPassItem = WinJS.Class.define(
        /**
         * Item for multipass rendering
         * @class WinJSContrib.UI.MultiPassItem
         */
    function (renderer, element, options) {
        options = options || {};
        var item = this;
        item.renderer = renderer;
        item.element = element || document.createElement('DIV');
        item.element.className = item.element.className + ' ' + options.className + ' mcn-multipass-item unloaded win-disposable';
        item.element.winControl = item;

        item.itemInvoked = options.itemInvoked;
        item.itemDataPromise = WinJS.Promise.as(options.data);

        item.itemTemplate = options.template;
        item.rendered = false;
        item.onitemContent = options.onitemContent;
        if (options.onitemInit) {
            options.onitemInit(this);
        }
    },
    /**
     * @lends WinJSContrib.UI.MultiPassItem
     */
    {
        dispose: function () {
            var item = this;
            item.renderer = null;
            item.element = null;
            item.itemInvoked = null;
            item.itemData = null;
            item.itemDataPromise = null;
            item.itemTemplate = null;
            item.onitemContent = null;
        },

        /**
         * render item content
         */
        render: function (delayed) {
            var ctrl = this;

            if (ctrl.element && ctrl.itemTemplate && !ctrl.rendered) {

                ctrl.rendered = true;
                return ctrl._renderContent();
            }

            return WinJS.Promise.wrap(ctrl.contentElement);
        },

        /**
         * empty item and mark it as unrendered
         */
        empty: function () {
            var ctrl = this;
            if (ctrl.element && ctrl.rendered) {
                WinJSContrib.UI.untapAll(ctrl.element);
                ctrl.element.classList.remove('loaded');
                ctrl.element.innerHTML = '';
                ctrl.rendered = false;
            }
        },

        _renderItemContent: function (rendered) {
            var ctrl = this;
            if (!ctrl.element)
                return;

            ctrl.element.appendChild(rendered);

            if (ctrl.itemInvoked) {
                if (typeof ctrl.itemInvoked == 'string')
                    ctrl.itemInvoked = WinJSContrib.Utils.resolveMethod(ctrl.element, ctrl.itemInvoked);

                if (ctrl.itemInvoked) {
                    WinJSContrib.UI.tap(ctrl.element, function (arg) {
                        ctrl.itemInvoked(ctrl);
                    });
                }
            }

            if (ctrl.onitemContent) {
                ctrl.onitemContent(ctrl.itemData, rendered);
            }
            else if (ctrl.renderer.onitemContent) {
                ctrl.renderer.onitemContent(ctrl.itemData, rendered);
            }

            setImmediate(function () {
                if (ctrl.element) {
                    ctrl.element.classList.remove('unloaded');
                    ctrl.element.classList.add('loaded');
                }
            });

            ctrl.rendered = true;
            ctrl.contentElement = rendered;
            return rendered;
        },

        _renderContent: function () {
            var ctrl = this;

            if (ctrl.element && ctrl.itemTemplate) {
                return ctrl.itemDataPromise.then(function (data) {
                    ctrl.itemData = data;
                    return ctrl.itemTemplate.render(data).then(function (rendered) {
                        ctrl._renderItemContent(rendered);
                    });
                });
            }

            return WinJS.Promise.wrap();
        }
    });
})();