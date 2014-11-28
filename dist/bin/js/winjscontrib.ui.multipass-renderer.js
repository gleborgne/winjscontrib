//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

var WinJSContrib = WinJSContrib || {};
WinJSContrib.UI = WinJSContrib.UI || {};

(function () {
    "use strict";

    WinJSContrib.UI.MultiPassRenderer = WinJS.Class.define(function (element, options) {
        options = options || {};
        this.items = [];
        this.element = element;
        this._scrollProcessor = null;
        this._tolerance = 1;
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
    }, {

        multipass: {
            get: function () {
                return this._multipass;
            },
            set: function (val) {
                this._multipass = val;
                this.refreshScrollEvents();
            }
        },

        tolerance: {
            get: function () {
                return this._tolerance;
            },
            set: function (val) {
                this._tolerance = val;
            }
        },

        orientation: {
            get: function () {
                return this._orientation;
            },
            set: function (val) {
                this._orientation = val;
                this.refreshScrollEvents();                
            }
        },

        scrollContainer: {
            get: function () {
                return this._scrollContainer;
            },
            set: function (val) {
                this._unregisterScrollEvents();
                this._scrollContainer = val;
                this._registerScrollEvents();
                this.checkRendering();
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

        refreshScrollEvents: function () {
            this._unregisterScrollEvents();
            this._registerScrollEvents();
        },

        _vIsInView: function (rect, scrollContainer, tolerance) {
            var pxTolerance = scrollContainer.clientHeight * tolerance;
            if (rect.y > scrollContainer.scrollTop - pxTolerance && rect.y < scrollContainer.scrollTop + scrollContainer.clientHeight + pxTolerance)
                return true;

            if (rect.y + rect.height > scrollContainer.scrollTop - pxTolerance && rect.y + rect.height < scrollContainer.scrollTop + scrollContainer.clientHeight + pxTolerance)
                return true;

            return false;
        },

        _hIsInView: function (rect, scrollContainer, tolerance) {
            var pxTolerance = scrollContainer.clientWidth * (tolerance || 0);
            if (rect.x > scrollContainer.scrollLeft - pxTolerance && rect.x < scrollContainer.scrollLeft + scrollContainer.clientWidth + pxTolerance)
                return true;

            if (rect.x + rect.width > scrollContainer.scrollLeft - pxTolerance && rect.x + rect.width < scrollContainer.scrollLeft + scrollContainer.clientWidth + pxTolerance)
                return true;

            return false;
        },

        clearOffsets : function(){
            var ctrl = this;
            ctrl.rect = null;
            ctrl.items.forEach(function (item) {
                item.rect = null;
            });
        },

        pageLayout: function () {
            var ctrl = this;
            ctrl.clearOffsets();
        },

        updateLayout : function(){
            var ctrl = this;
            ctrl.clearOffsets();
        },

        _checkSection: function (check, tolerance) {
            var ctrl = this;
            tolerance = tolerance || 0;

            if (!ctrl.rect) {
                ctrl.rect = WinJSContrib.UI.offsetFrom(ctrl.element, ctrl.scrollContainer);
            }

            if (check(ctrl.rect, ctrl.scrollContainer, tolerance)) {                
                ctrl.renderItemsContent();
                if (ctrl.onrendersection) {
                    ctrl.onrendersection();
                }
            }

            if (tolerance == 0 && ctrl.tolerance > 0) {
                setImmediate(function () {
                    ctrl._checkSection(check, ctrl.tolerance);
                });
            }
        },

        _checkItem: function (check, tolerance) {
            var ctrl = this;
            tolerance = tolerance || 0;
            var allRendered = true;
            ctrl.items.forEach(function (item) {
                if (!item.rect) {
                    item.rect = WinJSContrib.UI.offsetFrom(item.element, ctrl.scrollContainer);
                }
                allRendered = allRendered & item.rendered;
                if (!item.rendered && check(item.rect, ctrl.scrollContainer, tolerance)) {
                    item.render();
                }
            });
            ctrl.allRendered = allRendered;

            if (tolerance == 0 && ctrl.tolerance > 0) {
                setImmediate(function () {
                    ctrl._checkItem(check, ctrl.tolerance);
                });
            }
        },

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
            var onitemContent = renderOptions.onitemContent || ctrl.onitemContent;
            var container = ctrl.element;
            var registereditems = ctrl.items;


            for (var i = 0 ; i < numItems; i++) {
                var itemdata = items[i];
                var item = new WinJSContrib.UI.MultiPassItem(ctrl, null, {
                    data: itemdata,
                    template: template,
                    className: className,
                    itemInvoked: itemInvoked,
                    onitemContent: onitemContent
                });
                registereditems.push(item);
                container.appendChild(item.element);
            }

            if (renderOptions.renderItems || !this.multipass) {
                ctrl.renderItemsContent();
            }
            //ctrl.element.style.display = '';
        },

        checkRendering: function () {
            var ctrl = this;
            if (ctrl._scrollProcessor)
                ctrl._scrollProcessor();
        },

        renderItemsContent: function () {
            var ctrl = this;
            ctrl.items.forEach(function (item) {
                if (!item.rendered) {
                    //setImmediate(function () {
                    item.render();
                    //});
                }
            });
            ctrl.allRendered = true;
        },

        dispose: function () {
            var ctrl = this;
            ctrl._unregisterScrollEvents();
            WinJS.Utilities.disposeSubTree(ctrl.element);
        }
    });

    WinJSContrib.UI.MultiPassItem = WinJS.Class.define(function (renderer, element, options) {
        options = options || {};
        var item = this;
        item.renderer = renderer;
        item.element = element || document.createElement('DIV');
        item.element.className = item.element.className + ' ' + options.className + ' mcn-multipass-item';
        item.element.winControl = item;

        item.itemInvoked = options.itemInvoked;
        item.itemDataPromise = WinJS.Promise.as(options.data);

        item.itemTemplate = options.template;
        item.rendered = false;
    },
    {
        render: function (delayed) {
            var ctrl = this;

            if (ctrl.itemTemplate && !ctrl.rendered) {

                ctrl.rendered = true;
                return ctrl._renderContent();
            }

            return WinJS.Promise.wrap(ctrl.contentElement);
        },

        _renderContent: function () {
            var ctrl = this;

            if (ctrl.itemTemplate) {
                return ctrl.itemDataPromise.then(function (data) {
                    ctrl.itemData = data;
                    return ctrl.itemTemplate.render(data).then(function (rendered) {
                        //for (var i = 0 ; i < rendered.children.length; i++) {
                        //    ctrl.element.appendChild(rendered.children[i]);
                        //}
                        ctrl.element.appendChild(rendered);

                        if (ctrl.itemInvoked) {
                            if (typeof ctrl.itemInvoked == 'string')
                                ctrl.itemInvoked = WinJSContrib.Utils.resolveMethod(ctrl.element, ctrl.itemInvoked);

                            if (ctrl.itemInvoked) {
                                $(ctrl.element).tap(function (arg) {
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
                            ctrl.element.classList.add('loaded');
                        });

                        ctrl.rendered = true;
                        ctrl.contentElement = rendered;
                        return rendered;
                    });
                });
            }

            return WinJS.Promise.wrap();
        }
    });
})();