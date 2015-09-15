/* 
 * WinJS Contrib v2.1.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

(function () {
    "use strict";

    var ZoomableView = WinJS.Class.define(function (ctrl) {
        // Constructor
        this._ctrl = ctrl;
        ctrl.element.mcnSemanticZoomView = true;
        this._layout = 'horizontal';
    }, {
        layout: {
            get: function () {
                if (!this._layout) {
                    this._layout = 'horizontal';
                }

                return this._layout;
            },
            set: function (val) {
                this._layout = val;
            }
        },

        getPanAxis: function () {
            if (this._ctrl._getPanAxis)
                return this._ctrl._getPanAxis();

            return this.layout;
        },

        configureForZoom: function (isZoomedOut, isCurrentView, triggerZoom, prefetchedPages) {
            this.isZoomedOut = isZoomedOut;
            this.isCurrentView = isCurrentView;
            this.triggerZoom = triggerZoom;
            this.prefetchedPages = prefetchedPages;

            if (this._ctrl._configureForZoom)
                this._ctrl._configureForZoom(isZoomedOut, isCurrentView, triggerZoom, prefetchedPages);
        },

        setCurrentItem: function (x, y) {
            if (this._ctrl._setCurrentItem)
                this._ctrl._setCurrentItem(x, y);
        },

        getCurrentItem: function () {
            if (this._ctrl._getCurrentItem)
                return this._ctrl._getCurrentItem();

            var item = this.currentZoomItem;
            return WinJS.Promise.wrap({ item: item, position: { left: 0, top: 0, width: 0, height: 0 } });
        },

        beginZoom: function () {
            if (this._ctrl._beginZoom)
                this._ctrl._beginZoom();
        },

        positionItem: function (/*@override*/item, position) {
            if (this._ctrl._positionItem)
                return this._ctrl._positionItem(item, position);

            if (this._ctrl.onSemanticZoom)
                return this._ctrl.onSemanticZoom(item, position);

            return WinJS.Promise.wrap({ x: 0, y: 0 });
        },

        endZoom: function (isCurrentView) {
            if (this._ctrl._endZoom)
                this._ctrl._endZoom(isCurrentView);
        },

        handlePointer: function (pointerId) {
            if (this._ctrl._handlePointer)
                this._ctrl._handlePointer(pointerId);
        },

        selectItem: function (item) {
            this.currentZoomItem = item; //{ groupKey: key, position: {}, item: item };


            var current = this._ctrl.element.parentNode;
            var ctrl = null;
            while (current) {
                if (current.winControl && current.winControl._zoomFromCurrent) {
                    ctrl = current.winControl;
                    break;
                }
                current = current.parentNode;
            }

            if (ctrl)
                ctrl._zoomFromCurrent(false);
        },
    });

    WinJS.Namespace.define("WinJSContrib.UI", {
        parentSemancticZoomView: function (element) {
            var current = element.parentNode;

            while (current) {
                if (current.mcnSemanticZoomView) {
                    return current.winControl;
                }
                current = current.parentNode;
            }
        },

        SemanticZoomMixin: WinJS.Namespace._lazy(function () {
            return {
                _initSemanticZoom: function () {
                    this._zoomableView = new ZoomableView(this);
                },
                zoomableView: {
                    get: function () {
                        if (!this._zoomableView) {
                            this._zoomableView = new ZoomableView(this);
                        }

                        return this._zoomableView;
                    }
                },

                selectZoomItem: function (item) {
                    this.zoomableView.selectItem(item);
                },
            };
        })
    });

    WinJS.Namespace.define("WinJSContrib.UI", {
        SemanticZoomWrapper: WinJS.Class.mix(WinJS.Class.define(
            // Define the constructor function for the PageControlNavigator.
            function SemanticZoomWrapper(element, options) {
                this.element = element;
                this.element.winControl = this;
                this._initSemanticZoom();
            }, {
            }
        ), WinJS.UI.DOMEventMixin, WinJSContrib.UI.SemanticZoomMixin)
    });
})();
