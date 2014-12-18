/// <reference path="winjscontrib.core.js" />
/// <reference path="winjscontrib.ui.animation.js" />
(function () {
    'use strict';
    WinJS.Namespace.define("WinJSContrib.UI", {
        TileMenu: WinJS.Class.mix(WinJS.Class.define(function ctor(element, options) {
            this.element = element || document.createElement('DIV');
            options = options || {};
            this.items = [];
            this.element.winControl = this;
            this.element.classList.add('win-disposable');
            this.element.classList.add('mcn-tilemenu');
            this.element.style.display = 'none';
            this._space = 10;
            WinJS.UI.setOptions(this, options);
        }, {
            itemTemplate: {
                get: function () {
                    return this._itemTemplate;
                },
                set: function (val) {
                    this._itemTemplate = WinJSContrib.Utils.getTemplate(val);
                }
            },

            space: {
                get: function () {
                    return this._space;
                },
                set: function (val) {
                    this._space = val;
                }
            },

            show: function (elt, items) {
                var ctrl = this;
                ctrl.sourcePosition = WinJSContrib.UI.offsetFrom(elt);
                ctrl._renderMenu(items || ctrl.items);
                setImmediate(function () {
                    ctrl._layoutItems();

                    ctrl.currentElements.overlay.style.opacity = '0';
                    ctrl.currentElements.root.style.opacity = '';
                    WinJSContrib.UI.Animation.fadeIn(ctrl.currentElements.overlay, 90);

                    var itemsToShow = ctrl.currentElements.items.map(function (e) {
                        return e.element;
                    });

                    WinJSContrib.UI.Animation.enterGrow(itemsToShow, 200, { itemdelay: 40, maxdelay: 150 });
                });
            },

            hide: function (clickedElement) {
                var ctrl = this;
                var elements = ctrl.currentElements;
                if (elements) {
                    ctrl.currentElements = null;
                    $('.tap', elements.root).untap();

                    var itemsToHide = elements.items.map(function (e) {
                        return e.element;
                    });

                    if (clickedElement) {
                        var itemsToHide = itemsToHide.filter(function (e) {
                            return e != clickedElement;
                        });
                    }

                    var p = [];
                    p.push(WinJSContrib.UI.Animation.fadeOut(elements.overlay, 160));
                    p.push(WinJSContrib.UI.Animation.exitShrink(clickedElement, 160, { delay: 140 }));
                    p.push(WinJSContrib.UI.Animation.exitShrink(itemsToHide, 160, { itemdelay: 40, maxDelay: 100 }));
                    
                    WinJS.Promise.join(p).then(function () {
                        $(elements.root).remove();
                    });
                }
            },

            _renderMenuItem: function (container, item, index) {
                var ctrl = this;
                var res = {
                    item: item,
                    element: null,
                    x:0, y:0, w:0, h:0
                };

                res.itemPromise = ctrl.itemTemplate.render(item, res.element).then(function (rendered) {
                    res.element = rendered.children[0];
                    res.element.classList.add('mcn-tilemenu-menu');
                    res.element.style.opacity = '0';
                    $(res.element).tap(function (elt) {
                        ctrl.dispatchEvent('iteminvoked', { item: item, target: elt });
                        ctrl.hide(elt);
                    });

                    container.appendChild(res.element);
                });

                return res;
            },

            _renderMenu: function (items) {
                var ctrl = this;
                var current = { root: null, overlay: null, itemsContainer: null, items: [] };
                ctrl.currentElements = current;

                current.root = document.createElement('DIV');
                current.root.className = 'mcn-tilemenu-container';
                current.root.style.opacity = '0';
                current.root.id = ctrl.name;

                current.overlay = document.createElement('DIV');
                current.overlay.className = 'mcn-tilemenu-overlay';
                current.root.appendChild(current.overlay);
                ctrl._renderOverlay();
                $(current.overlay).tap(function (elt) {
                    ctrl.hide();
                }, { disableAnimation: true });

                current.itemsContainer = document.createElement('DIV');
                current.itemsContainer.className = 'mcn-tilemenu-items';
                current.root.appendChild(current.itemsContainer);

                $(current.itemsContainer).tap(function (elt) {
                    ctrl.hide();
                }, {disableAnimation: true});

                items.forEach(function (item, index) {
                    current.items.push(ctrl._renderMenuItem(current.itemsContainer, item, index));
                });

                document.body.appendChild(current.root);
            },

            _renderOverlay: function () {
                var ctrl = this;
                //var svgText = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">' +
                //    '<defs>' +
                //        '<clipPath id="clipPath">' +
                //            '<rect x="' + ctrl.sourcePosition.x + '" y="' + ctrl.sourcePosition.y + '" width="' + ctrl.sourcePosition.width + '" height="' + ctrl.sourcePosition.height + '"></rect>' +
                //        '</clipPath>' +
                //    '</defs>' +
                //    '<rect id="bg" x="0" y="0" width="9000" height="9000" fill-rule="evenodd" style="clip-path: url(&quot;#clipPath&quot;); fill:red;"></rect>' +
                //'</svg>';
                var svgText = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">' +
                    '<defs>' +
                        '<mask id="maskrect">' +
                            '<rect fill="white" x="0" y="0" width="100%" height="100%"></rect>' +
                            '<rect fill="black" x="' + ctrl.sourcePosition.x + '" y="' + ctrl.sourcePosition.y + '" width="' + ctrl.sourcePosition.width + '" height="' + ctrl.sourcePosition.height + '"></rect>' +
                        '</mask>' +
                    '</defs>' +
                    '<rect class="bg" x="0" y="0" width="100%" height="100%" mask="url(&quot;#maskrect&quot;)"></rect>' +
                '</svg>';
                ctrl.currentElements.overlay.innerHTML = svgText;
            },

            _layoutItems: function () {
                var ctrl = this;
                var offsetTop = ctrl.sourcePosition.y;
                var offsetLeft = ctrl.sourcePosition.x + ctrl.sourcePosition.width + ctrl._space;

                ctrl.currentElements.items.forEach(function (item) {
                    item.element.style.left = offsetLeft + 'px';
                    item.element.style.top = offsetTop + 'px';
                    offsetTop += item.element.clientHeight + ctrl.space;
                });
            },

            dispose: function () {
                WinJS.Utilities.disposeSubTree(this.element);
            }
        }),
        WinJS.Utilities.eventMixin,
        WinJS.Utilities.createEventProperties("iteminvoked"))
    });
})();