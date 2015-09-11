/* 
 * WinJS Contrib v2.1.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

/// <reference path="winjscontrib.core.js" />

(function () {
    'use strict';
    WinJS.Namespace.define("WinJSContrib.UI", {
        MasterDetailView: WinJS.Class.mix(WinJS.Class.define(function ctor(element, options) {
            this.element = element || document.createElement('DIV');
            options = options || {};
            options.orientation = options.orientation || 'horizontal';
            options.headerBehavior = options.headerBehavior || 'back';
            this.element.winControl = this;
            this.element.classList.add('win-disposable');
            this.element.classList.add('mcn-layout-ctrl');
            this.element.classList.add('mcn-navigation-ctrl');

            this.element.classList.add('mcn-masterdetailview');
            this._initContent();
            this.uriArgs = options.uriArgs;
            WinJS.UI.setOptions(this, options);
            if (this.mediaTrigger) {
                this.mediaTrigger.check();
            }
            //this._cancelNavigationBinded = this._cancelNavigation.bind(this);
            //this._returnToMasterBinded = this.returnToMaster.bind(this);

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

            orientations: {
                get: function () {
                    return this._orientations;
                },
                set: function (val) {
                    this._orientations = val;
                    if (this.mediaTrigger) {
                        this.mediaTrigger.dispose();
                        this.mediaTrigger = null;
                    }
                    if (val) {
                        this.mediaTrigger = new WinJSContrib.UI.MediaTrigger(val, this);
                    }
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

                    if (ctrl.loading)
                        ctrl.loading.cancel();
                    
                    ctrl.loading = WinJSContrib.UI.Pages.renderFragment(ctrl.masterView, val, ctrl.uriArgs, {
                        parented : WinJS.Promise.timeout(),
                        oncreate: function (element, options) {
                            var masterCtrl = element.winControl;
                            masterCtrl.masterDetailView = ctrl;
                            ctrl.masterViewContent = masterCtrl;
                        }
                    });
                }
            },

            _initContent: function () {
            	var ctrl = this;
            	var FD = WinJSContrib.UI.FluentDOM;
            	ctrl.masterView = new FD('DIV', 'mcn-masterdetailview-master visible').element;
            	WinJSContrib.Utils.moveChilds(ctrl.element, ctrl.masterView);
            	ctrl.element.appendChild(ctrl.masterView);

                ctrl.detailView = new FD('DIV', 'mcn-masterdetailview-detail', ctrl.element).element;
                ctrl.detailViewHeader = new FD('DIV', 'mcn-masterdetailview-detail-header', ctrl.detailView).element;
                ctrl.detailViewContent = new FD('DIV', 'mcn-masterdetailview-detail-content', ctrl.detailView).element;
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
                            if (data)
                                headerTitle.innerText = data.title;
                            header.appendChild(headerTitle);
                            if (container) container.appendChild(header);
                            c(header);
                        });
                    }
                }
            },


            _renderDetailHeader: function (data, options) {
                var ctrl = this;
                ctrl.detailViewHeader.innerHTML = '';
                var template = ctrl.headerTemplate || ctrl._defaultHeaderTemplate();
                return template.render(data, ctrl.detailViewHeader).then(function (rendered) {
                    if (options && options.prepareHeader) {
                        options.prepareHeader({ header: ctrl.detailViewHeader });
                    }

                    if (ctrl.headerBehavior == 'back') {
                        $(rendered).tap(function () {
                            ctrl.returnToMaster();
                        })
                    }

                    return rendered;
                });
            },

            _clearDetailContent: function () {
                var ctrl = this;

                if (ctrl.loading) {
                    ctrl.loading.cancel();
                    ctrl.loading = null;
                }

                if (ctrl.detailViewContentCtrl) {
                    var elt = ctrl.detailViewContentCtrl.element;

                    if (ctrl.detailViewContentCtrl.clear) {
                    	ctrl.detailViewContentCtrl.clear();
                    }

                    if (ctrl.detailViewContentCtrl.unload)
                        ctrl.detailViewContentCtrl.unload();
                    if (ctrl.detailViewContentCtrl.dispose)
                        ctrl.detailViewContentCtrl.dispose();

                    $(elt).remove();

                    ctrl.detailViewContentCtrl = null;
                    
                }
                ctrl.detailViewContent.innerHTML = '';
            },

            _loadDetailContent: function (uri, data, options) {
                var ctrl = this;
                ctrl._clearDetailContent();

                var elt = document.createElement('DIV');
                elt.className = 'mcn-masterdetailview-detail-content-wrapper';
                elt.style.width = "100%";
                elt.style.height = "100%";
                ctrl.detailViewContent.appendChild(elt);

                if (options.wrapInMasterDetailView) {
                	ctrl.detailViewContentCtrl = new WinJSContrib.UI.MasterDetailView(elt, { uri: uri, uriArgs: data, parent: ctrl, orientation: ctrl.orientation, orientations: ctrl.orientations });
                	return WinJS.Promise.wrap();
                }
                else {
                	ctrl.detailViewContentCtrl = new WinJSContrib.UI.PageControlNavigator(elt, { global: false, navigationEvents: true });
                	ctrl.detailViewContentCtrl.navigate(uri, JSON.parse(JSON.stringify(data)));
                	return WinJS.Promise.wrap();
                }
                //return WinJSContrib.UI.Pages.renderFragment(ctrl.detailViewContent, uri, data, {
                //    oncreate: function (element, options) {
                //        var detailCtrl = element.winControl;
                //        detailCtrl.masterDetailView = ctrl;
                //        ctrl.detailViewContentCtrl = detailCtrl;
                //    }
                //});
            },

            _animateToDetail: function (element, data, options) {
                var ctrl = this;

                var morph = WinJSContrib.UI.Morph.from(element);
                ctrl.morph = morph;
                ctrl.detailViewContent.style.opacity = '0';
                ctrl.detailViewContent.style.display = 'none';


                //                ctrl.detailViewContent.style.opacity = '0';

                return morph.fadeIn({ duration: 100 }).then(function () {

                    morph.morphToElt(ctrl.detailViewHeader);
                    ctrl.detailViewHeader.style.opacity = '0';
                    ctrl.detailViewContent.style.display = '';
                    ctrl.detailView.classList.add('visible');

                    WinJSContrib.UI.Animation.fadeOut(ctrl.masterView, { duration: 100 }).then(function () {
                        ctrl.masterView.style.opacity = '';
                        ctrl.masterView.classList.remove('visible');
                    }).then(function () {

                        return morph.apply({ duration: 350 }).then(function () {
                            return ctrl._loadDetailContent(options.uri, data, options);
                        }).then(function(){
                            WinJSContrib.UI.Animation.enterPage(ctrl.detailViewContent, { duration: 700 });
                            ctrl.detailViewHeader.style.opacity = '';
                            return morph.fadeOut({ duration: 200 });
                        });
                    });
                });
            },

            _animateToMaster: function () {
                var ctrl = this;
                var morph = ctrl.morph;
                ctrl.morph = null;

                if (!morph) {
                    return;
                }

                morph.checkTarget(true);
                morph.fadeIn({ duration: 160 });
                return WinJSContrib.UI.Animation.fadeOut(ctrl.detailView, { duration: 250 }).then(function () {
                    ctrl.detailView.classList.remove('visible');
                    ctrl.detailView.style.display = 'none';
                }).then(function () {
                    ctrl.masterView.classList.add('visible');
                    ctrl.masterView.style.opacity = '0';
					if (ctrl.masterViewContent.__checkLayout)
						ctrl.masterViewContent.__checkLayout();
                    return morph.revert({ duration: 250 });
                }).then(function () {
                    return WinJSContrib.UI.Animation.fadeIn(ctrl.masterView, { duration: 300, easing: 'ease-in' });
                }).then(function () {
                    return morph.fadeOut({ duration: 160 });
                }).then(function () {
                    ctrl.detailView.style.display = '';
                    ctrl.detailView.style.opacity = '';
                    ctrl._clearDetailContent();
                    morph.dispose();

                });
            },

            openDetail: function (element, data, options) {
                var ctrl = this;

                return ctrl._renderDetailHeader(data, options).then(function (rendered) {
                    return ctrl._animateToDetail(element, data, options);
                    //if (options.uri) {
                    //    ctrl._loadDetailContent(options.uri, data);
                    //}
                }).then(function () {
                    ctrl.navEventsHandler = WinJSContrib.UI.registerNavigationEvents(ctrl, ctrl.returnToMaster);
                });
            },

            returnToMaster: function (arg) {
                var ctrl = this;

                if (arg) arg.handled = true;

                if (ctrl.navEventsHandler) {
                    ctrl.navEventsHandler();
                    ctrl.navEventsHandler = null;
                }

                ctrl._animateToMaster().then(function () {
                    ctrl._clearDetailContent();
                });
            },

            dispose: function () {
                if (this.mediaTrigger) {
                    this.mediaTrigger.dispose();
                    this.mediaTrigger = null;
                }

                this._clearDetailContent();
                WinJS.Utilities.disposeSubTree(this.element);
            },

            updateLayout: function (e) {
                var ctrl = this;
                if (ctrl.masterViewContent && ctrl.masterViewContent.updateLayout) {
                    ctrl.masterViewContent.updateLayout(e);
                }
                if (ctrl.detailViewContentCtrl && ctrl.detailViewContentCtrl.updateLayout) {
                    ctrl.detailViewContentCtrl.updateLayout(e);
                }
            }
        }),
        WinJS.Utilities.eventMixin,
        WinJS.Utilities.createEventProperties("myevent"))
    });
})();