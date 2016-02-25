/* 
 * WinJS Contrib v2.1.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

(function () {
    var logger = WinJSContrib.Logs.getLogger("WinJSContrib.WinRT.MultipleViews");

    var ViewManagement = Windows.UI.ViewManagement;

    var messageTypePrefix = "WinJSContribViewHelper_"
    var messageTypes = {
        queryProxyReadyForRelease: messageTypePrefix + "queryProxyReadyForRelease",
        proxyReadyForRelease: messageTypePrefix + "proxyReadyForRelease",
        proxyReleased: messageTypePrefix + "proxyReleased",
        initialize: messageTypePrefix + "initialize",
        navigateTo: messageTypePrefix + "navigateTo"
    };

    WinJS.Namespace.define("WinJSContrib.WinRT.MultipleViews", {
        thisDomain: document.location.protocol + "//" + document.location.host,

        ViewManager: WinJS.Class.mix(WinJS.Class.define(function ViewManager_ctor(pagewrapper) {
            this._viewReleasedWrapper = this._viewReleased.bind(this);
            this.pagewrapper = pagewrapper;
            window.addEventListener("message", this._handleMessage.bind(this), false);
            ViewManagement.ApplicationView.getForCurrentView().addEventListener("consolidated", this._handleConsolidated.bind(this), false);

        },
        {
            _handleMessage: function ViewManager_handleMessage(e) {
                logger.verbose("handle message", e);
                if (e.origin === WinJSContrib.WinRT.MultipleViews.thisDomain && e.data.type) {
                    var i = this.findViewIndexByViewId(e.data.viewId);
                    if (i !== null) {
                        this.secondaryViews.getItem(i).data._handleMessage(e);
                    }
                    this.dispatchEvent(e.data.type, e.data);
                }
            },

            broadcast: function (type, data) {
                logger.verbose("broadcast " + type, data);
                for (var i = 0, len = this.secondaryViews.length; i < len; i++) {
                    var value = this.secondaryViews.getItem(i).data;
                    value.send(type, data);
                }
            },

            _handleConsolidated: function mainViewConsolidated(arg) {
                this.closeAll();
            },

            _viewReleased: function ViewManager_viewReleased(e) {
                logger.verbose("view released : " + e.target.viewId);
                e.target.removeEventListener("released", this._viewReleasedWrapper, false);
                var i = this.findViewIndexByViewId(e.target.viewId);
                if (i !== null) {
                    this.secondaryViews.splice(i, 1);
                }
            },

            secondaryViews: new WinJS.Binding.List([]),

            closeAll: function () {
                logger.verbose("close all views");
                for (var i = 0, len = this.secondaryViews.length; i < len; i++) {
                    var value = this.secondaryViews.getItem(i).data;
                    value.close();
                }
            },

            findViewIndexByViewId: function ViewManager_findViewIndexByViewId(viewId) {
                for (var i = 0, len = this.secondaryViews.length; i < len; i++) {
                    var value = this.secondaryViews.getItem(i).data;
                    if (viewId === value.viewId) {
                        return i;
                    }
                }
                return null;
            },

            findViewByViewId: function ViewManager_findViewIndexByViewId(viewId) {
                for (var i = 0, len = this.secondaryViews.length; i < len; i++) {
                    var value = this.secondaryViews.getItem(i).data;
                    if (viewId === value.viewId) {
                        return value;
                    }
                }
                return null;
            },

            findViewByTitle: function ViewManager_findViewIndexByViewId(title) {
                for (var i = 0, len = this.secondaryViews.length; i < len; i++) {
                    var value = this.secondaryViews.getItem(i).data;
                    if (title === value.title) {
                        return value;
                    }
                }
                return null;
            },


            openViewFor: function (title, page, data, currentWindowSize, newWindowSize) {
                var view = this.findViewByTitle(title);
                if (!view) {
                    return this.openView(page, data, currentWindowSize, newWindowSize).then(function (r) {
                        r.view.title = title;
                    });
                }

                view.navigateTo(page, data, true);

                var currentViewSize = currentWindowSize || Windows.UI.ViewManagement.ViewSizePreference.default;
                var newViewSize = newWindowSize || Windows.UI.ViewManagement.ViewSizePreference.default;

                view.startViewInUse();
                return new WinJS.Promise(function (complete, error) {
                    Windows.UI.ViewManagement.ApplicationViewSwitcher.tryShowAsStandaloneAsync(
                        view.viewId,
                        newViewSize,
                        Windows.UI.ViewManagement.ApplicationView.getForCurrentView().id,
                        currentViewSize
                        ).done(function (pointer) {
                            view.stopViewInUse();
                            complete({ view: view, pointer: pointer });
                        }, function (err) {
                            logger.error(err);
                            error(err);
                        });
                });
            },

            openView: function (page, data, currentWindowSize, newWindowSize) {
                var view = this.createNewView(page, data);

                var currentViewSize = currentWindowSize || Windows.UI.ViewManagement.ViewSizePreference.default;
                var newViewSize = newWindowSize || Windows.UI.ViewManagement.ViewSizePreference.default;

                view.startViewInUse();

                return new WinJS.Promise(function (complete, error) {
                    Windows.UI.ViewManagement.ApplicationViewSwitcher.tryShowAsStandaloneAsync(
                        view.viewId,
                        newViewSize,
                        Windows.UI.ViewManagement.ApplicationView.getForCurrentView().id,
                        currentViewSize
                        ).done(function (pointer) {
                            view.initialize(page, data);
                            view.stopViewInUse();
                            complete({ view: view, pointer: pointer });
                        }, function (err) {
                            logger.error(err);
                            error(err);
                        });
                });

            },

            projectViewFor: function (title, page, data) {
                if (!Windows.UI.ViewManagement.ProjectionManager.projectionDisplayAvailable)
                    return this.openViewFor(title, page, data);


                var view = this.findViewByTitle(title);
                if (!view) {
                    return this.projectView(page, data).then(function (r) {
                        r.view.title = title;
                    });
                }


                view.navigateTo(page, data, true);


                view.startViewInUse();
                return new WinJS.Promise(function (complete, error) {
                    Windows.UI.ViewManagement.ProjectionManager.startProjectingAsync(view.viewId, Windows.UI.ViewManagement.ApplicationView.getForCurrentView().id).done(function (pointer) {
                        view.stopViewInUse();
                        complete({ view: view, pointer: pointer });
                    }, function (err) {
                        logger.error(err);
                        error(err);
                    });
                });
            },

            projectView: function (page, data) {
                if (!Windows.UI.ViewManagement.ProjectionManager.projectionDisplayAvailable)
                    return this.openView(page, data);

                var view = this.createNewView(page, data);

                //Windows.UI.ViewManagement.ProjectionManager.projectionDisplayAvailable
                view.startViewInUse();

                return new WinJS.Promise(function (complete, error) {
                    Windows.UI.ViewManagement.ProjectionManager.startProjectingAsync(view.viewId, Windows.UI.ViewManagement.ApplicationView.getForCurrentView().id).done(function (pointer) {
                        view.initialize(page, data);
                        view.stopViewInUse();
                        complete({ view: view, pointer: pointer });
                    }, function (err) {
                        logger.error(err);
                        error(err);
                    });
                });

            },

            createNewView: function ViewManager_createNewView() {
                logger.verbose("create view");
                //var initData = null;
                //if (data) initData = JSON.parse(JSON.stringify(data));
                //if (!page) {
                //    throw "Must specify a URL of a page from your app to show in the new view";
                //}

                var newView = MSApp.createNewView(this.pagewrapper);
                
                var newProxy = new WinJSContrib.WinRT.MultipleViews.ViewLifetimeControlProxy(newView);
                newProxy.addEventListener("released", this._viewReleasedWrapper, false);
                this.secondaryViews.push(newProxy);
                //setTimeout(function () {
                //    newProxy.send(messageTypes.initialize, { location: { uri: page, state: data } });
                //}, 300);
                return newProxy;
            }
        }), WinJS.Utilities.eventMixin, WinJS.Binding.observableMixin),


        ViewLifetimeControlProxy: WinJS.Class.mix(WinJS.Class.define(function ViewLifetimeControlProxy_ctor(appView) {
            this.appView = appView;
            this.viewId = appView.viewId;
            this.title = "";
            this.initialized = false;
        },
        {
            _refCount: 0,            

            initialize: function (page, data) {
                if (this.initialized)
                    return;

                logger.verbose("proxy initialize view");
                this.initialized = true;
                this.send(messageTypes.initialize, { location: { uri: page, state: data } });
            },

            send: function ViewLifetimeControlProxy_alertView(type, data) {
                logger.verbose("proxy sending message " + type, data);
                if (!type) {
                    throw "Must specify a type of message to send to the proxy";
                }
                data = data || {};
                data.type = type;

                this.appView.postMessage(data, WinJSContrib.WinRT.MultipleViews.thisDomain);
            },

            navigateTo: function (page, data, clearHistory) {
                var itemData = JSON.parse(JSON.stringify(data));
                if (clearHistory)
                    itemData.clearNavigationHistory = true;

                this.send('navigateTo', { location: { uri: page, state: itemData } });
            },

            _handleMessage: function ViewLifetimeControlProxy_handleMessage(e) {
                var data = e.data;
                logger.verbose("proxy received message " + data.type);
                switch (data.type) {
                    case messageTypes.queryProxyReadyForRelease:

                        if (this._refCount === 0) {
                            this.dispatchEvent("released");
                            this.send(messageTypes.proxyReleased);
                        }
                        break;
                    default:
                        this.dispatchEvent(data.type, data);
                        break;
                }
            },

            appView: null,

            startViewInUse: function ViewLifetimeControlProxy_startViewInUse() {
                this._refCount++;
            },

            stopViewInUse: function ViewLifetimeControlProxy_stopViewInUse() {
                this._refCount--;

                if (this._refCount === 0) {
                    this.send(messageTypes.proxyReadyForRelease);
                }
            },

            openAsync: function (currentWindowSize, newWindowSize) {
                logger.verbose("proxy open view");
                var view = this;
                var currentViewSize = currentWindowSize || Windows.UI.ViewManagement.ViewSizePreference.default;
                var newViewSize = newWindowSize || Windows.UI.ViewManagement.ViewSizePreference.default;

                view.startViewInUse();

                return new WinJS.Promise(function (complete, error) {
                    Windows.UI.ViewManagement.ApplicationViewSwitcher.tryShowAsStandaloneAsync(
                        view.viewId,
                        newViewSize,
                        Windows.UI.ViewManagement.ApplicationView.getForCurrentView().id,
                        currentViewSize
                        ).done(function (pointer) {
                            view.stopViewInUse();
                            complete({ view: view, pointer: pointer });
                        }, error);
                });
            },

            close: function () {
                var view = this;
                logger.verbose("proxy close view");
                view.startViewInUse();
                var closeCompletion = function () {
                    view.stopViewInUse();
                }

                return ViewManagement.ApplicationViewSwitcher.switchAsync(
                    ViewManagement.ApplicationView.getForCurrentView().id,
                    view.viewId,
                    ViewManagement.ApplicationViewSwitchingOptions.consolidateViews
                    ).then(closeCompletion, closeCompletion);
            }

        }), WinJS.Utilities.eventMixin, WinJS.Binding.observableMixin),

        ViewLifetimeControl: WinJS.Class.mix(WinJS.Class.define(function () {
            this.opener = MSApp.getViewOpener();
            this._handleMessageWrapper = this._handleMessage.bind(this);
            this._onConsolidatedWrapper = this._onConsolidated.bind(this)
            this._onVisibilityChangeWrapper = this._onVisibilityChange.bind(this);
            this._finalizeReleaseWrapper = this._finalizeRelease.bind(this);
            this.viewId = ViewManagement.ApplicationView.getForCurrentView().id;
        },
        {
            _refCount: 0,

            _proxyReleased: false,

            _consolidated: true,

            send: function ViewLifetimeControlProxy_alertProxy(type, data) {
                logger.verbose("sending message " + type, data);
                if (!type) {
                    throw "Must specify a type of message to send to the proxy";
                }
                data = data || {};
                data.type = type;
                data.viewId = this.viewId;

                this.opener.postMessage(data, WinJSContrib.WinRT.MultipleViews.thisDomain);
            },


            _handleMessage: function ViewLifetimeControlProxy_handleMessage(e) {
                logger.verbose("received message " + e.origin + "-" + (e.data ? e.data.type: ""));
                if (e.origin === WinJSContrib.WinRT.MultipleViews.thisDomain && e.data.type) {
                    var data = e.data;
                    switch (data.type) {

                        case messageTypes.proxyReleased:
                            this._proxyReleased = true;
                            setImmediate(this._finalizeReleaseWrapper);
                            break;

                        case messageTypes.proxyReadyForRelease:
                            if (this._refCount === 0) {
                                this.send(messageTypes.queryProxyReadyForRelease);
                            }
                            break;

                        case messageTypes.initialize:
                            this.dispatchEvent("initialize", e.data);
                            break;
                        default:
                            this.dispatchEvent(data.type, data);
                            break;
                    }
                }
            },

            _onConsolidated: function ViewLifetimeControlProxy_onConsolidated() {
                this._setConsolidated(true);
            },

            _onVisibilityChange: function ViewLifetimeControlProxy_onVisibilityChange() {
                if (!document.hidden) {
                    this._setConsolidated(false);
                }
            },

            _setConsolidated: function ViewLifetimeControlProxy_setConsolidated(value) {
                if (this._consolidated !== value) {
                    this._consolidated = value;

                    if (value) {
                        this.stopViewInUse();
                    } else {
                        this.startViewInUse();
                    }
                    //this.send('consolidated', { consolidated: value });
                }
            },

            _finalizeRelease: function ViewLifetimeControlProxy_finalizeRelease(force) {
                logger.verbose("close window");
                if (this._refCount === 0 || force) {
                    window.removeEventListener("message", this._handleMessageWrapper, false);
                    ViewManagement.ApplicationView.getForCurrentView().removeEventListener("consolidated", this._onConsolidatedWrapper, false);
                    document.removeEventListener("visibilitychange", this._onVisibilityChangeWrapper, false);

                    this.dispatchEvent("released");

                    window.close();
                }
            },

            initialize: function ViewLifetimeControlProxy_initialize() {
                logger.verbose("initialize window");
                window.addEventListener("message", this._handleMessageWrapper, false);
                ViewManagement.ApplicationView.getForCurrentView().addEventListener("consolidated", this._onConsolidatedWrapper, false);
                document.addEventListener("visibilitychange", this._onVisibilityChangeWrapper, false);
            },

            startViewInUse: function ViewLifetimeControlProxy_startViewInUse() {
                this._refCount++;
            },

            close: function () {
                this.stopViewInUse();
            },

            stopViewInUse: function ViewLifetimeControlProxy_stopViewInUse() {
                this._refCount--;

                if (this._refCount === 0) {
                    if (this._proxyReleased) {
                        setImmediate(this._finalizeReleaseWrapper);
                    } else {
                        this.send(messageTypes.queryProxyReadyForRelease);
                    }
                }
            }
        }), WinJS.Utilities.eventMixin)
    });
})();