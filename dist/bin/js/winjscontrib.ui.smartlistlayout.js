/* 
 * WinJS Contrib v2.1.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

(function () {
    "use strict";

    WinJS.Namespace.define("WinJSContrib.UI", {
        SmartListLayout: WinJS.Class.define(
            /**
             * Control to set ListView layout based on media queries
             * @class WinJSContrib.UI.SmartListLayout
             * @param {HTMLElement} element DOM element containing the control
             * @param {Object} options
             * @example
             *  {@lang xml}
             *  <div id="mylistview" data-win-control="WinJS.UI.ListView" data-win-options="{
             *      itemTemplate: select('#listitemtemplate'),
             *      itemDataSource: DummyDataSource
             *   }"></div>
             * 
             *  <div id="listlayout" data-win-control="WinJSContrib.UI.SmartListLayout" data-win-options="{
             *          listView: select('#mylistview'),
             *          layouts:{
             *              default : { layout : WinJS.UI.GridLayout, query: '(orientation: landscape)'},
             *              vert : { layout : WinJS.UI.GridLayout, query: '(orientation: portrait) and (min-width: 600px)', options: { orientation : 'vertical'}},
             *              snap : { layout : WinJS.UI.ListLayout, query: '(orientation: portrait) and (max-width: 600px)'},
             *          }
             * }"></div>
             */
            function ctor(element, options) {
                this._element = element || document.createElement("div");
                this._element.className = this._element.className + ' win-disposable mcn-layout-ctrl';
                this._element.winControl = this;
                this.queries = [];
                if (options) {
                    if (options.listView)
                        this.listView = options.listView;
                    if (options.layouts)
                        this.layouts = options.layouts;
                }
                //if (this.listView && this.listView.winControl && options.layouts) {
                //    this.initQueries(options.layouts);
                //    this.applyPendingLayout();
                //}
            },
            /**
             * @lends WinJSContrib.UI.SmartListLayout
             */
            {
                /**
                 * listview target by smart layout
                 * @field
                 * @type WinJS.UI.ListView
                 */
                listView: {
                    get: function () {
                        return this._listview;
                    },
                    set: function (val) {
                        if (val && val.element && val.forceLayout)
                            this._listview = val.element;
                        else
                        	this._listview = val;

                        if (val) {
                        	this.initQueries(this.layouts);
                        	this.applyPendingLayout();
                        }
                    }
                },

                layouts: {
                    get: function () {
                        return this._layouts;
                    },
                    set: function (val) {
                        this._layouts = val;

                        if (this._layouts) {
                            this.initQueries(this._layouts);
                            this.applyPendingLayout();
                        }
                    }
                },


                initQueries: function (layouts) {
                    var ctrl = this;
                    for (var name in layouts) {
                        if (layouts.hasOwnProperty(name)) {
                            ctrl.add(layouts[name]);
                        }
                    }
                },

                /**
                 * add a layout declaration
                 * @param {Object} layout layout declaration
                 */
                add: function (layout) {
                    var ctrl = this;

                    if (layout && layout.query && layout.layout) {
                        var query = {
                            ctrl: ctrl,
                            mediaquery: layout.query,
                            layout: layout.layout,
                            options: layout.options,
                            mq: undefined,
                            bindedCallback: undefined
                        };

                        query.bindedCallback = ctrl.processQuery.bind(query);
                        ctrl.queries.push(query);

                        query.mq = window.matchMedia(layout.query);
                        //query.mq.addListener(function (mq) {
                        //	var t = mq;
                        //});
                        query.mq.addListener(query.bindedCallback);
                        if (query.mq.matches)
                            ctrl.applyQuery(query);
                    }
                },

                processQuery: function (mq) {
                    var query = this;
                    query.ctrl.applyQuery(query);
                },

                applyQuery: function (query) {
                    var ctrl = this;
                    if (query.mq.matches && ctrl.listView && ctrl.listView.winControl) {
                        if (!ctrl.pendingLayout) {
                            ctrl.listView.style.opacity = 0;
                            //this makes layout change only once, whatever queries are matching (last matching query will win)
                            setImmediate(function () {
                                ctrl.applyPendingLayout();
                            });
                        }
                        ctrl.pendingLayout = new query.layout(query.options);						
                    }
                },

                applyPendingLayout: function () {
                    var ctrl = this;
                    if (ctrl.pendingLayout) {
                        ctrl.listView.winControl.layout = ctrl.pendingLayout;
                        ctrl.listView.style.opacity = 1;                        
                        ctrl.listView.winControl.forceLayout(); //win 8
                        ctrl.pendingLayout = undefined;
                    }
                },

                updateLayout : function(){
                    var ctrl = this;
                    //if (ctrl.listView) {
                    //    ctrl.listView.winControl.forceLayout();
                    //}
                },

                pageLayout: function(){
                    var ctrl = this;
                    if (ctrl.listView) {
                        var semanticzoom = WinJSContrib.Utils.getParentControlByClass("win-semanticzoom", ctrl.listView);
                        if (semanticzoom) {
                            semanticzoom.forceLayout();
                         //   ctrl.forceListUpdate();
                        }
                    }
                },

                forceListUpdate: function(){
                    var ctrl = this;
                    if (ctrl.listView.winControl._batchingViewUpdates) {
                        ctrl.listView.winControl._batchingViewUpdates.cancel();
                        ctrl.listView.winControl._batchingViewUpdates = null;
                    }
                    ctrl.listView.winControl.forceLayout();
                },

                dispose: function () {
                    var ctrl = this;
                    //remove listeners for media queries
                    ctrl.queries.forEach(function (query) {
                        query.mq.removeListener(query.bindedCallback);
                    });
                }
            })
    });

    if (WinJSContrib.UI.WebComponents) {
    	WinJSContrib.UI.WebComponents.register('mcn-smartlistlayout', WinJSContrib.UI.SmartListLayout, {
    		properties: ['listView', 'layouts']
    	});
    }
})();