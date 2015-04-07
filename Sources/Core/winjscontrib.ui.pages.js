var profiler = window.msWriteProfilerMark || function () {
};
var WinJSContrib;
(function (WinJSContrib) {
    var UI;
    (function (UI) {
        var Pages;
        (function (Pages) {
            (function (_Pages, _Global, _Base, _CorePages, _BaseUtils, _ElementUtilities, _WriteProfilerMark, Promise, Fragments, ControlProcessor) {
                'use strict';
                var viewMap = _CorePages._viewMap || {};
                //this property allows defining mixins applyed to all pages
                _Pages.defaultPageMixins = [
                    {
                        $: function (selector) {
                            return $(selector, this.element || this._element);
                        },
                        q: function (selector) {
                            if (!this.element)
                                return;
                            return this.element.querySelector(selector);
                        },
                        qAll: function (selector) {
                            if (!this.element)
                                return;
                            var res = this.element.querySelectorAll(selector);
                            if (res && !res.forEach) {
                                res.forEach = function (callback) {
                                    for (var i = 0; i < res.length; i++) {
                                        callback(res[i], i);
                                    }
                                };
                            }
                        },
                    },
                    {
                        dispose: function () {
                            if (this._promises) {
                                this.cancelPromises();
                                this._promises = null;
                            }
                        },
                        promises: {
                            configurable: true,
                            get: function () {
                                if (!this._promises)
                                    this._promises = [];
                                return this._promises;
                            }
                        },
                        addPromise: function (prom) {
                            this.promises.push(prom);
                            return prom;
                        },
                        cancelPromises: function () {
                            var page = this;
                            if (page.promises) {
                                for (var i = 0; i < page.promises.length; i++) {
                                    if (page.promises[i]) {
                                        page.promises[i].cancel();
                                    }
                                }
                            }
                        }
                    },
                    {
                        dispose: function () {
                            if (this._eventTracker) {
                                this._eventTracker.dispose();
                                this._eventTracker = null;
                            }
                        },
                        eventTracker: {
                            configurable: true,
                            get: function () {
                                if (!this._eventTracker)
                                    this._eventTracker = new WinJSContrib.UI.EventTracker();
                                return this._eventTracker;
                            }
                        }
                    }
                ];
                function abs(uri) {
                    var a = _Global.document.createElement("a");
                    a.href = uri;
                    return a.href;
                }
                function selfhost(uri) {
                    return _Global.document.location.href.toLowerCase() === uri.toLowerCase();
                }
                var _mixinBase = {
                    dispose: function () {
                        /// <signature helpKeyword="WinJS.UI.Pages.dispose">
                        /// <summary locid="WinJS.UI.Pages.dispose">
                        /// Disposes this Page.
                        /// </summary>
                        /// </signature>
                        if (this._disposed) {
                            return;
                        }
                        this._disposed = true;
                        _ElementUtilities.disposeSubTree(this.element);
                        this.element = null;
                    },
                    init: function () {
                    },
                    load: function (uri) {
                        /// <signature helpKeyword="WinJS.UI.Pages._mixin.load">
                        /// <summary locid="WinJS.UI.Pages._mixin.load">
                        /// Creates a copy of the DOM elements from the specified URI.  In order for this override
                        /// to be used, the page that contains the load override needs to be defined by calling
                        /// WinJS.UI.Pages.define() before WinJS.UI.Pages.render() is called.
                        /// </summary>
                        /// <param name="uri" locid="WinJS.UI.Pages._mixin.load_p:uri">
                        /// The URI from which to copy the DOM elements.
                        /// </param>
                        /// <returns type="WinJS.Promise" locid="WinJS.UI.Pages._mixin.load_returnValue">
                        /// A promise whose fulfilled value is the set of unparented DOM elements, if asynchronous processing is necessary. If not, returns nothing.
                        /// </returns>
                        /// </signature>
                        if (!this.selfhost) {
                            return Fragments.renderCopy(abs(uri));
                        }
                    },
                    process: function (element, options) {
                        /// <signature helpKeyword="WinJS.UI.Pages._mixin.process">
                        /// <summary locid="WinJS.UI.Pages._mixin.process">
                        /// Processes the unparented DOM elements returned by load.
                        /// </summary>
                        /// <param name="element" locid="WinJS.UI.Pages._mixin.process_p:element">
                        /// The DOM element that will contain all the content for the page.
                        /// </param>
                        /// <param name="options" locid="WinJS.UI.Pages._mixin.process_p:options">
                        /// The options that are to be passed to the constructor of the page.
                        /// </param>
                        /// <returns type="WinJS.Promise" locid="WinJS.UI.Pages._mixin.process_returnValue">
                        /// A promise that is fulfilled when processing is complete.
                        /// </returns>
                        /// </signature>
                        return ControlProcessor.processAll(element);
                    },
                    processed: function () {
                    },
                    render: function (element, options, loadResult) {
                        /// <signature helpKeyword="WinJS.UI.Pages._mixin.render">
                        /// <summary locid="WinJS.UI.Pages._mixin.render">
                        /// Renders the control, typically by adding the elements specified in the loadResult parameter to the specified element.
                        /// </summary>
                        /// <param name="element" locid="WinJS.UI.Pages._mixin.render_p:element">
                        /// The DOM element that will contain all the content for the page.
                        /// </param>
                        /// <param name="options" locid="WinJS.UI.Pages._mixin.render_p:options">
                        /// The options passed into the constructor of the page.
                        /// </param>
                        /// <param name="loadResult" locid="WinJS.UI.Pages._mixin.render_p:loadResult">
                        /// The elements returned from the load method.
                        /// </param>
                        /// <returns type="WinJS.Promise" locid="WinJS.UI.Pages._mixin.render_returnValue">
                        /// A promise that is fulfilled when rendering is complete, if asynchronous processing is necessary. If not, returns nothing.
                        /// </returns>
                        /// </signature>
                        if (!this.selfhost) {
                            element.appendChild(loadResult);
                        }
                        return element;
                    },
                    ready: function () {
                    }
                };
                function merge(targetCtor, sourcePrototype) {
                    if (sourcePrototype) {
                        if (!sourcePrototype.__proto__.hasOwnProperty('hasOwnProperty')) {
                            //if prototype is not "object" we start by merging it's parent members
                            //by merging from parent to child we ensure that inheritance chain is respected
                            merge(targetCtor, sourcePrototype.__proto__);
                        }
                        return _Base.Class.mix(targetCtor, sourcePrototype);
                    }
                    return targetCtor;
                }
                function addMembers(ctor, members) {
                    if (!members)
                        return ctor;
                    if (typeof members == 'function') {
                        if (!ctor.prototype._attachedConstructors)
                            ctor.prototype._attachedConstructors = [];
                        ctor.prototype._attachedConstructors.push(members);
                        return merge(ctor, members.prototype);
                    }
                    else if (typeof members == 'object') {
                        return _Base.Class.mix(ctor, members);
                    }
                    return ctor;
                }
                function getPageConstructor(uri, members) {
                    /// <signature helpKeyword="WinJS.UI.Pages.define">
                    /// <summary locid="WinJS.UI.Pages.define">
                    /// Creates a new page control from the specified URI that contains the specified members.
                    /// Multiple calls to this method for the same URI are allowed, and all members will be
                    /// merged.
                    /// </summary>
                    /// <param name="uri" locid="WinJS.UI.Pages.define_p:uri">
                    /// The URI for the content that defines the page.
                    /// </param>
                    /// <param name="members" locid="WinJS.UI.Pages.define_p:members">
                    /// Additional members that the control will have.
                    /// </param>
                    /// <returns type="Function" locid="WinJS.UI.Pages.define_returnValue">
                    /// A constructor function that creates the page.
                    /// </returns>
                    /// </signature>
                    var refUri = abs(uri).toLowerCase();
                    var base = viewMap[refUri];
                    uri = abs(uri);
                    if (!base) {
                        base = _Base.Class.define(
                        // This needs to follow the WinJS.UI.processAll "async constructor"
                        // pattern to interop nicely in the "Views.Control" use case.
                        //
                        function PageControl_ctor(element, options, complete, parentedPromise) {
                            var that = this;
                            that._pageLifeCycle = {
                                created: new Date(),
                                processQueue: []
                            };
                            this._disposed = false;
                            this.element = element = element || _Global.document.createElement("div");
                            _ElementUtilities.addClass(element, "win-disposable");
                            element.msSourceLocation = uri;
                            this.uri = uri;
                            this.selfhost = selfhost(uri);
                            element.winControl = this;
                            that.parentedComplete = parentedPromise;
                            _ElementUtilities.addClass(element, "pagecontrol");
                            var profilerMarkIdentifier = " uri='" + uri + "'" + _BaseUtils._getProfilerMarkIdentifier(this.element);
                            _WriteProfilerMark("WinJS.UI.Pages:createPage" + profilerMarkIdentifier + ",StartTM");
                            if (WinJSContrib.UI.WebComponents) {
                                that.observer = WinJSContrib.UI.WebComponents.watch(this.element);
                            }
                            var load = Promise.timeout().then(function Pages_load() {
                                return that.load(uri);
                            });
                            var renderCalled = load.then(function Pages_init(loadResult) {
                                if (that._attachedConstructors) {
                                    that._attachedConstructors.forEach(function (ct) {
                                        ct.apply(that, [element, options]);
                                    });
                                }
                                return Promise.join({
                                    loadResult: loadResult,
                                    initResult: that.init(element, options)
                                });
                            }).then(function Pages_render(result) {
                                return that.render(element, options, result.loadResult);
                            }).then(function Pages_processed() {
                                if (WinJSContrib.UI.WebComponents) {
                                    //add delay to enable webcomponent processing
                                    return WinJS.Promise.timeout();
                                }
                            });
                            this.elementReady = renderCalled.then(function () {
                                return element;
                            });
                            this.renderComplete = renderCalled.then(function Pages_processed() {
                                if (that._pageLifeCycle.processQueue && that._pageLifeCycle.processQueue.length) {
                                    var promises = [];
                                    that._pageLifeCycle.processQueue.forEach(function (p) {
                                        return WinJS.Promise.as(p());
                                    });
                                    return WinJS.Promise.join(promises).then(function () {
                                        that._pageLifeCycle.processQueue = null;
                                    });
                                }
                            }).then(function Pages_process() {
                                return that.process(element, options);
                            }).then(function Pages_processed() {
                                return that.processed(element, options);
                            });
                            var callComplete = function () {
                                complete && complete(that);
                                _WriteProfilerMark("WinJS.UI.Pages:createPage" + profilerMarkIdentifier + ",StopTM");
                            };
                            // promises guarantee order, so this will be called prior to ready path below
                            //
                            this.renderComplete.then(callComplete, callComplete);
                            this.readyComplete = this.renderComplete.then(function () {
                                return parentedPromise;
                            }).then(function Pages_ready() {
                                that.ready(element, options);
                                that._pageLifeCycle.ended = new Date();
                                that._pageLifeCycle.delta = that._pageLifeCycle.ended - that._pageLifeCycle.created;
                                console.log('navigation to ' + uri + ' took ' + that._pageLifeCycle.delta + 'ms');
                                return that;
                            }).then(null, function Pages_error(err) {
                                if (that.error)
                                    return that.error(err);
                            });
                        }, _mixinBase);
                        base = _Base.Class.mix(base, WinJS.UI.DOMEventMixin);
                        //base.winJSContrib = true;
                        //this addition is for providing a way to inject behavior in all pages
                        _Pages.defaultPageMixins.forEach(function (mixin) {
                            var d = base.prototype.dispose;
                            base = _Base.Class.mix(base, mixin);
                            //we want to allow this mixins to provide their own addition to "dispose"
                            if (d && mixin.hasOwnProperty('dispose')) {
                                base.prototype.dispose = function () {
                                    d.apply(this);
                                    mixin.dispose.apply(this);
                                };
                            }
                        });
                        WinJSContrib.UI.Pages.fragmentMixin(base);
                        viewMap[refUri] = base;
                    }
                    base = addMembers(base, members);
                    base.selfhost = selfhost(uri);
                    return base;
                }
                function Pages_define(uri, members) {
                    /// <signature helpKeyword="WinJS.UI.Pages.define">
                    /// <summary locid="WinJS.UI.Pages.define">
                    /// Creates a new page control from the specified URI that contains the specified members.
                    /// Multiple calls to this method for the same URI are allowed, and all members will be
                    /// merged.
                    /// </summary>
                    /// <param name="uri" locid="WinJS.UI.Pages.define_p:uri">
                    /// The URI for the content that defines the page.
                    /// </param>
                    /// <param name="members" locid="WinJS.UI.Pages.define_p:members">
                    /// Additional members that the control will have.
                    /// </param>
                    /// <returns type="Function" locid="WinJS.UI.Pages.define_returnValue">
                    /// A constructor function that creates the page.
                    /// </returns>
                    /// </signature>
                    var ctor = viewMap[uri];
                    if (!ctor) {
                        ctor = getPageConstructor(uri);
                    }
                    if (members) {
                        ctor = addMembers(ctor, members);
                    }
                    if (ctor.selfhost) {
                        WinJS.Utilities.ready(function () {
                            render(abs(uri), _Global.document.body);
                        }, true);
                    }
                    return ctor;
                }
                function render(uri, element, options, parentedPromise) {
                    var Ctor = _CorePages.get(uri);
                    var control = new Ctor(element, options, null, parentedPromise);
                    return control.renderComplete.then(null, function (err) {
                        return Promise.wrapError({
                            error: err,
                            page: control
                        });
                    });
                }
                function get(uri) {
                    var ctor = viewMap[uri];
                    if (!ctor) {
                        ctor = Pages_define(uri);
                    }
                    return ctor;
                }
                function remove(uri) {
                    Fragments.clearCache(abs(uri));
                    delete viewMap[uri.toLowerCase()];
                }
                _Pages._corePages = {
                    get: _CorePages.get,
                    render: _CorePages.render,
                    define: _CorePages.define,
                    _remove: _CorePages._remove,
                    _viewMap: _CorePages._viewMap,
                };
                var pageOverride = {
                    define: Pages_define,
                    get: get,
                    render: render,
                    _remove: remove,
                    _viewMap: viewMap
                };
                var source = WinJS.UI.Pages;
                WinJS.Namespace._moduleDefine(_Pages, null, pageOverride);
                source.get = pageOverride.get;
                source.define = pageOverride.define;
                source.render = pageOverride.render;
                source._remove = pageOverride._remove;
            })(WinJSContrib.UI.Pages, window, WinJS, WinJS.UI.Pages, WinJS.Utilities, WinJS.Utilities, profiler, WinJS.Promise, WinJS.UI.Fragments, WinJS.UI);
        })(Pages = UI.Pages || (UI.Pages = {}));
    })(UI = WinJSContrib.UI || (WinJSContrib.UI = {}));
})(WinJSContrib || (WinJSContrib = {}));
//# sourceMappingURL=winjscontrib.ui.pages.js.map