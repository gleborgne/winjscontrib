//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com


(function () {
	"use strict";

	WinJS.Namespace.define("WinJSContrib.UI", {
		SmartListLayout: WinJS.Class.define(
            
            function ctor(element, options) {
                this._element = element || document.createElement("div");
                this._element.className = this._element.className + ' win-disposable mcn-layout-ctrl';
            	this._element.winControl = this;
            	this.queries = [];
            	this.listView = options ? options.listView : undefined;

            	if (this.listView && this.listView.winControl && options.layouts) {
            		this.initQueries(options.layouts);
            		this.applyPendingLayout();
            	}
            },
			{
				initQueries: function (layouts) {
					var ctrl = this;
					for (var name in layouts) {
						if (layouts.hasOwnProperty(name)) {
							ctrl.add(layouts[name]);
						}
					}
				},

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
				    if (ctrl.listView) {
				        ctrl.listView.winControl.forceLayout();
				    }
				},

				contentReady: function(){
				    var ctrl = this;
				    //if (ctrl.listView) {
				    //    ctrl.listView.winControl.forceLayout();
				    //}
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
})();