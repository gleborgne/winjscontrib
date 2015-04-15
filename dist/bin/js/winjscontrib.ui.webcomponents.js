/* 
 * WinJS Contrib v2.1.0.0
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

/*
WARNING: this feature is experimental
You must add winjscontrib.core.js and winjscontrib.ui.pages.js
*/

/// <reference path="winjscontrib.core.js" />
var WinJSContrib = WinJSContrib || {};
WinJSContrib.UI = WinJSContrib.UI || {};
WinJSContrib.UI.WebComponents = WinJSContrib.UI.WebComponents || {};

(function (global) {
	'use strict';
	var registered = {};
	WinJSContrib.UI.WebComponents.registered = registered;
	WinJSContrib.UI.WebComponents.polyfill = false;

	if (!global.document.registerElement) {
		WinJSContrib.UI.WebComponents.polyfill = true;
	}

	function inspect(node) {
		var customElement = null;
		var ctrlName = node.nodeName;
		if (node.attributes) {
			var ctrlName = node.getAttribute("is");
			if (ctrlName) {
				//we uppercase because node names are uppercase
				customElement = registered[ctrlName.toUpperCase()];
			}
		}

		if (!customElement) {
			customElement = registered[node.nodeName];
		}

		if (customElement && !node.mcnComponent) {
			createElement(node, customElement);
		}

		for (var i = 0, l = node.childNodes.length; i < l; i++) {
			inspect(node.childNodes[i]);
		}
	}

	function observeMutations(element) {
		var observer = null;
		if (WinJSContrib.UI.WebComponents.polyfill) {
			observer = new MutationObserver(function (mutations) {
				mutations.forEach(function (mutation) {
					if (mutation.addedNodes.length) {
						for (var i = 0, l = mutation.addedNodes.length; i < l ; i++) {
							inspect(mutation.addedNodes[i]);
						}
					}
				});
			});
			observer.observe(element, { childList: true, subtree: true });
		}
		return observer;
	}
	WinJSContrib.UI.WebComponents.watch = observeMutations;

	function createElement(element, definition) {
		var ctrl = element.winControl;
		element.mcnComponent = { attributes: [] };
		var scope = WinJSContrib.Utils.getScopeControl(element);
		var process = function () {
			var options = {};
			if (element.dataset.winOptions) {
				options = getWinJSOptions(element);
			}

			if (definition.optionsCallback) {
				options = definition.optionsCallback(element, options, scope);
			}

			var ctrl = new definition.ctor(element, options);
			element.winControl = ctrl;
		}
		
		//if (scope) {
		//	//if the component is owned by a page/fragment, we process the control according to page lifecycle
		//	scope.renderComplete.then(function(){
		//		process();
		//	});
		//} else {
		//	process();
		//}

		if (scope && scope.pageLifeCycle) {
			//if the component is owned by a page/fragment, we process the control according to page lifecycle
			scope.pageLifeCycle.steps.process.attach(process);
		} else {
			process();
		}

		var setAttribute = element.setAttribute;

		element.setAttribute = function (name, val) {
			var hook = element.mcnComponent.attributes[name.toUpperCase()];
			setAttribute.call(element, name, val);
			if (hook) {
				hook(val);
			}
		}
	}

	WinJSContrib.UI.WebComponents.register = function register(tagname, ctor, optionsCallback) {
		if (WinJSContrib.UI.WebComponents.polyfill) {
			global.document.createElement(tagname);
			//we uppercase because node names are uppercase
			registered[tagname.toUpperCase()] = { optionsCallback: optionsCallback, ctor: ctor };
		} else {
			var proto = Object.create(HTMLElement.prototype);
			proto.createdCallback = function () {
				var options = {};
				if (this.dataset.winOptions) {
					options = getWinJSOptions(this);
				}
				var scope = WinJSContrib.Utils.getScopeControl(this);
				if (optionsCallback) {
					options = optionsCallback(this, options, scope);
				}
				new ctor(this, options);
			};
			global.document.registerElement(tagname, { prototype: proto });
		}
	}

	WinJSContrib.UI.WebComponents.mapAttr = function mapAttr(element, attrName, optionName, options, resolve) {
		var val = element.getAttribute(attrName);
		
		if (val) {
			if (resolve) {
				var tmp = WinJSContrib.Utils.resolveValue(element, val);
				if (tmp) {
					if (tmp.then && tmp.mcnMustResolve) {
						tmp.then(function (data) {
							options[optionName] = data;
						});
					} else {
						options[optionName] = tmp;
					}
					return;
				}
			}

			options[optionName] = val;
		}

		var component = element.mcnComponent;
		if (component) {
			component.attributes[attrName.toUpperCase()] = function (val) {
				var ctrl = element.winControl;
				if (ctrl) {
					if (resolve) {
						var tmp = WinJSContrib.Utils.resolveValue(element, val);
						if (tmp) {
							ctrl[optionName] = tmp;
							return;
						}
					}
					ctrl[optionName] = val
				}
			}
		}
	}

	function getWinJSOptions(elt) {
		return WinJS.UI.optionsParser(elt.dataset.winOptions, window, {
			select: WinJS.Utilities.markSupportedForProcessing(function (text) {
				var parent = WinJSContrib.Utils.getScopeControl(elt);
				if (parent) {
					return parent.element.querySelector(text);
				}
				else {
					return document.querySelector(text);
				}
			})
		});
	}

	if (WinJS.UI && WinJS.UI.ListView) {
		WinJSContrib.UI.WebComponents.register('win-listview', WinJS.UI.ListView, function (elt, options) {

			WinJSContrib.UI.WebComponents.mapAttr(elt, 'itemtemplate', 'itemTemplate', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'itemdatasource', 'itemDataSource', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'itemsdraggable', 'itemsDraggable', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'itemsreorderable', 'itemsReorderable', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'oniteminvoked', 'oniteminvoked', options, true);

			WinJSContrib.UI.WebComponents.mapAttr(elt, 'groupheadertemplate', 'groupHeaderTemplate', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'groupdatasource', 'groupDataSource', options, true);

			WinJSContrib.UI.WebComponents.mapAttr(elt, 'swipebehavior', 'swipeBehavior', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'selectbehavior', 'selectBehavior', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'tapbehavior', 'tapBehavior', options);

			WinJSContrib.UI.WebComponents.mapAttr(elt, 'header', 'header', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'footer', 'footer', options, true);

			return options;
		});
	}

	if (WinJS.Binding && WinJS.Binding.Template) {
		WinJSContrib.UI.WebComponents.register('win-template', WinJS.Binding.Template, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'extractchild', 'extractChild', options);			
			return options;
		});
	}

	//flyout, menu, toggle, datepicker

})(this);