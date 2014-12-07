/// <reference path="winjscontrib.core.js" />

(function () {
    'use strict';
    WinJS.Namespace.define("WinJSContrib.UI", {
        MasterDetailView: WinJS.Class.mix(WinJS.Class.define(function ctor(element, options) {
            this.element = element || document.createElement('DIV');
            options = options || {};
            options.orientation = options.orientation || 'horizontal';
            this.element.winControl = this;
            this.element.classList.add('win-disposable');
            this.element.classList.add('mcn-masterdetailview');
            this._initContent();

            WinJS.UI.setOptions(this, options);
        }, {
            orientation: {
                get: function () {
                    return this._orientation;
                },
                set: function (val) {
                    this._orientation = val;
                    this.element.classList.remove('mcn-vertical');
                    this.element.classList.remove('mcn-horizontal');
                    if (val == 'vertical' || val == 'horizontal')
                        this.element.classList.add('mcn-' + val);
                }
            },

            uri: {
                get: function () {
                    return this._uri;
                },
                set: function (val) {
                    var ctrl = this;
                    ctrl._uri = val;
                    if (ctrl.masterViewContent) {
                        $(ctrl.masterViewContent.element).remove();
                    }

                    WinJSContrib.UI.renderFragment(ctrl.masterView, val, null, {
                        onfragmentinit: function (masterCtrl) {
                            masterCtrl.masterDetailView = ctrl;
                            ctrl.masterViewContent = masterCtrl;
                        }
                    });
                }
            },

            _initContent: function () {
                var ctrl = this;
                ctrl.masterView = document.createElement('DIV');
                ctrl.masterView.className = 'mcn-masterdetailview-master visible';
                WinJSContrib.Utils.moveChilds(ctrl.element, ctrl.masterView);
                ctrl.element.appendChild(ctrl.masterView);

                ctrl.detailView = document.createElement('DIV');
                ctrl.detailView.className = 'mcn-masterdetailview-detail';
                ctrl.element.appendChild(ctrl.detailView);

                ctrl.detailViewHeader = document.createElement('DIV');
                ctrl.detailViewHeader.className = 'mcn-masterdetailview-detail-header';
                ctrl.detailView.appendChild(ctrl.detailViewHeader);

                ctrl.detailViewContent = document.createElement('DIV');
                ctrl.detailViewContent.className = 'mcn-masterdetailview-detail-content';
                ctrl.detailView.appendChild(ctrl.detailViewContent);
            },

            _defaultHeaderTemplate: function () {
                return {
                    render: function (data, container) {
                        return new WinJS.Promise(function (c, e) {
                            var header = document.createElement('DIV');
                            header.className = 'mcn-masterdetailview-defaultheader';
                            var headerBack = document.createElement('DIV');
                            headerBack.className = 'back';
                            header.appendChild(headerBack);
                            var headerTitle = document.createElement('DIV');
                            headerTitle.className = 'title';
                            headerTitle.innerText = data.title;
                            header.appendChild(headerTitle);
                            if (container) container.appendChild(header);
                            c(header);
                        });
                    }
                }
            },

            
            _renderDetailHeader: function (data) {
                var ctrl = this;
                ctrl.detailViewHeader.innerHTML = '';
                var template = ctrl.headerTemplate || ctrl._defaultHeaderTemplate();
                return template.render(data, ctrl.detailViewHeader);
            },

            _loadDetailContent: function (uri, data) {
                var ctrl = this;
                if (ctrl.detailViewContentCtrl) {
                    $(ctrl.detailViewContentCtrl.element).remove();
                }
                var elt = document.createElement('DIV');
                elt.style.width = "100%";
                elt.style.height = "100%";

                return WinJSContrib.UI.renderFragment(ctrl.detailViewContent, uri, data, {
                    onfragmentinit: function (detailCtrl) {
                        detailCtrl.masterDetailView = ctrl;
                        ctrl.detailViewContentCtrl = detailCtrl;
                    }
                });
            },

            _animateToDetail: function (element) {
                var ctrl = this;

                if (ctrl.morph)
                    ctrl.morph.dispose();

                var morph = WinJSContrib.UI.Morph.from(element);
                ctrl.morph = morph;

                ctrl.detailViewContent.style.opacity = '0';

                WinJSContrib.UI.Animation.fadeOut(ctrl.masterView, 200, { delay: 150 }).then(function () {
                    ctrl.masterView.style.opacity = '';
                    ctrl.masterView.classList.remove('visible');
                });

                morph.fadeIn(160).then(function () {
                    morph.morphToElt(ctrl.detailViewHeader);
                    morph.apply().then(function () {
                        ctrl.detailView.classList.add('visible');
                        WinJSContrib.UI.Animation.fadeIn(ctrl.detailViewContent, 160, { delay: 170 });
                        return morph.fadeOut(200);
                    });
                });
            },

            _animateToMaster: function () {
                var ctrl = this;

                ctrl.morph.fadeIn(160).then(function () {
                    return WinJSContrib.UI.Animation.fadeOut(ctrl.detailView, 160).then(function () {
                        ctrl.detailView.classList.remove('visible');
                        ctrl.detailView.style.opacity = '';
                    });
                }).then(function () {
                    return ctrl.morph.revert({ duration: 300 });
                }).then(function () {
                    ctrl.masterView.classList.add('visible');
                    WinJSContrib.UI.Animation.fadeIn(ctrl.masterView, 200);
                    return ctrl.morph.fadeOut(160, { delay: 70 });
                }).then(function () {
                    ctrl.morph.dispose();
                    ctrl.morph = null;
                });
            },

            openDetail: function (element, data, options) {
                var ctrl = this;

                ctrl._renderDetailHeader(data).then(function () {
                    ctrl._animateToDetail(element);

                    if (options.uri) {
                        ctrl._loadDetailContent(options.uri, data);
                    }
                });
            },
            
            returnToMaster: function () {
                var ctrl = this;

                ctrl._animateToMaster();
            },

            dispose: function () {
                WinJS.Utilities.disposeSubTree(this.element);
            }
        }),
		WinJS.Utilities.eventMixin,
		WinJS.Utilities.createEventProperties("myevent"))
    });
})();