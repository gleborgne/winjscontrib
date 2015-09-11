/* 
 * WinJS Contrib v2.1.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

/// <reference path="../core/winjscontrib.core.js" />
(function () {
	"use strict";

	WinJS.Namespace.define("WinJSContrib.UI", {
		HubControl: WinJS.Class.define(
            /**
             * Hub control replacement intended to be used with {@link WinJSContrib.UI.GridControl}
             * @class WinJSContrib.UI.HubControl
             * @param {HTMLElement} element DOM element containing the control
             * @param {Object} options
             */
            function HubControl(element, options) {
            	var hub = this;
            	options = options || {};
            	hub.element = element;

            	hub.savestate = options.savestate != undefined ? options.savestate : true;
            	hub.scrollContainer = (options && options.scrollContainer) ? options.scrollContainer : element;
            	hub.sectionsContainer = (options && options.sectionsContainer) ? options.sectionsContainer : element.querySelector('.mcn-hub-surface');
            	if (!hub.sectionsContainer) {
            		hub.sectionsContainer = document.createElement('DIV');
            		hub.sectionsContainer.className = 'mcn-hub-surface';
            		while (element.children[0]) {
            			hub.sectionsContainer.appendChild(element.children[0]);
            		}
            		element.appendChild(hub.sectionsContainer);
            	}
            	hub.element.className = hub.element.className + ' mcn-hub-ctrl mcn-layout-ctrl win-disposable';
            	//hub.element.style.display = 'none';
            	hub.element.winControl = hub;
            	hub.sections = [];
            	hub.multipass = options.multipass;

            	hub.hubScrolledBind = hub.hubScrolled.bind(hub);
            	hub.rendering = { lastScroll: 0 };
            	hub.identifier = hub.element.id + "//" + hub.element.className;

            	var parent = WinJSContrib.Utils.getScopeControl(hub.element);
            	if (parent && parent.pageLifeCycle) {
            		parent.pageLifeCycle.steps.layout.attach(function () {
            			hub.layout();
            		});

            		parent.pageLifeCycle.steps.ready.attach(function () {
            			if (hub.savestate)
            				hub.restoreCtrlState();

            			hub.prepare();
            		});
            	}
            	else if (parent && parent.elementReady) {
            		parent.elementReady.then(function () {
            			parent.readyComplete.then(function () {
            				hub.layout();
            				if (hub.savestate)
            					hub.restoreCtrlState();

            				hub.prepare();
            			});
            		});
            	}
            },
            /**
             * @lends WinJSContrib.UI.HubControl.prototype
             */
            {
            	prepare: function () {
            		this.autoRegisterSections();
            	},

            	/**
                 * configure multipass rendering (for using in conjunction with {@link WinJSContrib.UI.GridControl}
                 */
            	multipass: {
            		get: function () {
            			return this._multipass;
            		},
            		set: function (val) {
            			this._multipass = val;
            		}
            	},

            	orientation: {
            		get: function () {
            			return this._orientation;
            		},
            		set: function (val) {
            			this._orientation = val;
            		}
            	},

            	autoRegisterSections: function () {
            		var hub = this;
            		hub.sections = [];
            		var sections = hub.scrollContainer.querySelectorAll('.mcn-hub-section');
            		for (var i = 0 ; i < sections.length ; i++) {
            			var section = sections[i];
            			var sectionCtrl = section.winControl;
            			if (sectionCtrl) {
            				hub.sections.push(sectionCtrl);
            			}
            		}
            	},

            	registerSection: function (selector, parentElement) {
            		var sec = new Section(selector, parentElement);
            		this.sections.push(sec);
            		return sec;
            	},

            	layout: function (viewState) {
            		var hub = this;
            		hub.element.style.display = '';
            		var spacer = document.createElement('DIV');
            		spacer.className = 'mcn-hub-section-spacer';
            		hub.sectionsContainer.appendChild(spacer);

            		if (!hub.sections.length) {
            			hub.autoRegisterSections();
            		}

            		this.sections.forEach(function (section) {
            			section.hub = hub;
            			section.layout(viewState);
            			section._attachItemsControls();
            		});
            	},

            	_attachItemsControls: function () {
            		var hub = this;
            		hub.sections.forEach(function (section) {
            			section.hub = hub;
            			section._attachItemsControls();
            		});
            	},

            	renderItemsContent: function (forceRendering) {
            		var hub = this;
            		//console.log('render item content multipass:' + hub.multipass);
            		hub.rendering.size = {
            			width: hub.scrollContainer.clientWidth,
            			height: hub.scrollContainer.clientHeight
            		};

            		if (!hub.multipass) {
            			hub.sections.forEach(function (section) {
            				section.hub = hub;
            				section.renderItemsContent(forceRendering);
            			});
            		}
            	},

            	renderSection: function (section, sectionTemplate, hasTitle) {
            		var hub = this;
            		section.hub = hub;
            		return new WinJS.Promise(function (complete, error) {
            			var template = WinJSContrib.Utils.getTemplate(sectionTemplate);
            			if (template) {
            				var sectionElt = document.createElement('DIV');
            				if (hasTitle) {
            					sectionElt.className = 'mcn-hub-section-titled';
            				}

            				template.render(section).done(function (rendered) {
            					var sectionItem = new WinJSContrib.UI.HubSection(sectionElt);
            					while (rendered.children[0]) {
            						sectionElt.appendChild(rendered.children[0]);
            					}

            					hub.sectionsContainer.appendChild(sectionElt);
            					hub.sections.push(sectionItem);
            					complete(sectionItem);
            				});
            			}
            		});

            	},

            	removeSection: function (section) {
            		var hub = this;
            		var index = hub.sections.indexOf(val);
            		if (index > -1) {
            			hub.sections.splice(index, 1);
            		}
            	},

            	saveCtrlState: function () {
            		var hub = this;
            		var navigator = WinJSContrib.UI.parentNavigator(hub.element);
            		if (navigator) {
            			var history = navigator.history;
            			var state = history.current.state || { hub: {} };
            			if (!state.hub)
            				state.hub = {};

            			if (hub.scrollContainer) {
            				var hubdata = {};
            				hubdata.scrollLeft = hub.scrollContainer.scrollLeft;
            				hubdata.scrollTop = hub.scrollContainer.scrollTop;
            				state.hub[hub.identifier] = hubdata;
            			}
            			history.current.state = state;
            		}
            		return state;
            	},

            	restoreCtrlState: function (state) {
            		var hub = this;
            		var navigator = WinJSContrib.UI.parentNavigator(hub.element);
            		if (navigator) {
            			var history = navigator.history;
            			state = state || history.current.state || { hub: {} };
            			if (!state.hub)
            				state.hub = {};

            			if (hub.scrollContainer && state.hub) {
            				var hubdata = state.hub[hub.identifier];
            				if (hubdata && hubdata.scrollLeft) {
            					hub.scrollContainer.scrollLeft = hubdata.scrollLeft;
            				}
            				if (hubdata && hubdata.scrollTop) {
            					hub.scrollContainer.scrollTop = hubdata.scrollTop;
            				}
            			}
            		}
            	},

            	hubScrolled: function () {
            		if (!this.rendering.size) {
            			this.rendering.size = {
            				width: this.scrollContainer.clientWidth,
            				height: this.scrollContainer.clientHeight
            			};
            		}
            		var curScroll = this.scrollContainer.scrollLeft || this.scrollContainer.scrollTop;
            		var curScrollDelta = Math.abs(curScroll - this.rendering.lastScroll);
            		if (curScrollDelta > this.multipassStrategy.scrollOffset) {
            			this.multipassStrategy.processSections(this);
            			this.rendering.lastScroll = curScroll;
            		}

            	},

            	exitPage: function () {
            		if (this.savestate)
            			this.saveCtrlState();
            	},

            	updateLayout: function (element, viewState, lastViewState) {
            		var hub = this;
            		var state = {
            			w: hub.scrollContainer.clientWidth,
            			h: hub.scrollContainer.clientHeight,
            		}

            		if (hub.LastLayoutState && (hub.LastLayoutState.w != state.w || hub.LastLayoutState.h != state.h)) {
            			hub.scrollContainer.scrollLeft = 0;
            			hub.scrollContainer.scrollTop = 0;
            		}

            		hub.LastLayoutState = state;
            	},

            	dispose: function () {
            		var hub = this;
            		hub.scrollContainer.removeEventListener('scroll', hub.hubScrolledBind);
            		if (WinJS.Utilities.disposeSubTree)
            			WinJS.Utilities.disposeSubTree(this.element);
            	}
            })
	});

	WinJS.Namespace.define("WinJSContrib.UI", {
		HubSection: WinJS.Class.define(
            function HubSection(element, options) {
            	var section = this;
            	options = options || {};
            	section.element = element || document.createElement('DIV');
            	section.element.winControl = section;
            	section.element.className = section.element.className + ' mcn-hub-section win-disposable';
            	section.onlayout = options.onlayout;

            	//var hub = WinJSContrib.Utils.getParentControlByClass('mcn-hub-ctrl', section.element);
            	//if (hub) {
            	//	if (hub.sections.indexOf(this) <= 0) {
            	//		hub.sections.push(this);
            	//	}
            	//}
            }, {
            	layout: function (viewState) {
            		var section = this;
            		var layoutctrls = section.element.querySelectorAll('.mcn-layout-ctrl');
            		if (layoutctrls && layoutctrls.length) {
            			for (var i = 0 ; i < layoutctrls.length ; i++) {
            				var ctrl = layoutctrls[i].winControl;
            				if (ctrl) {
            					ctrl.multipass = ctrl.multipass || section.multipass;
            					//if (ctrl.layout)
            					//    ctrl.layout();
            				}
            			}
            		}

            		//section.items = [];
            		//var allitems = section.element.querySelectorAll('.mcn-multipass-item');
            		//var numitems = allitems.length;
            		//for (var i = 0 ; i < numitems ; i++) {
            		//    var itemCtrl = allitems[i].winControl;
            		//    if (itemCtrl)
            		//        section.items.push(itemCtrl);
            		//}

            		if (section.onlayout) {
            			section.onlayout(viewState);
            		}
            	},

            	_attachItemsControls: function () {
            		var section = this;
            		var itemsctrls = this.element.querySelectorAll('.mcn-items-ctrl');
            		if (itemsctrls && itemsctrls.length) {
            			for (var i = 0 ; i < itemsctrls.length ; i++) {
            				var ctrl = itemsctrls[i].winControl;
            				if (ctrl) {
            					ctrl.multipass = section.hub.multipass;
            					if (ctrl.scrollContainer == undefined)
            						ctrl.scrollContainer = section.hub.scrollContainer;
            				}
            			}
            		}
            	},

            	renderItemsContent: function () {
            		var itemsctrls = this.element.querySelectorAll('.mcn-items-ctrl');
            		if (itemsctrls && itemsctrls.length) {
            			for (var i = 0 ; i < itemsctrls.length ; i++) {
            				var ctrl = itemsctrls[i].winControl;
            				if (ctrl && ctrl.renderItemsContent)
            					ctrl.renderItemsContent();
            			}
            		}
            	},

            	dispose: function () {
            		if (WinJS.Utilities.disposeSubTree)
            			WinJS.Utilities.disposeSubTree(this.element);
            	}
            })
	});

	if (WinJSContrib.UI.WebComponents) {
		WinJSContrib.UI.WebComponents.register('mcn-hub', WinJSContrib.UI.HubControl, {
			properties: ['multipass']
		});

		WinJSContrib.UI.WebComponents.register('mcn-hub-section', WinJSContrib.UI.HubSection, {
			properties: []
		});
	}

})();