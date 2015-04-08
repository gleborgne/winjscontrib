/* 
 * WinJS Contrib v2.0.3.0
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
		//console.log(node.nodeName);
		var customElement = registered[node.nodeName];
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
		element.mcnComponent = true;
		var scope = WinJSContrib.Utils.getScopeControl(element);
		var process = function () {
			var options = {};
			if (definition.optionsCallback) {
				options = definition.optionsCallback(element, scope);
			}
			var ctrl = new definition.ctor(element, options);
		}

		if (scope && scope._pageLifeCycle && scope._pageLifeCycle.processQueue) {
			scope._pageLifeCycle.processQueue.push(process);
		} else {
			process();
		}
	}

	WinJSContrib.UI.WebComponents.register = function (tagname, ctor, optionsCallback) {
		if (WinJSContrib.UI.WebComponents.polyfill) {
			global.document.createElement(tagname);
			registered[tagname.toUpperCase()] = { optionsCallback: optionsCallback, ctor: ctor };
		} else {
			var proto = Object.create(HTMLElement.prototype);
			proto.createdCallback = function () {
				var options = {};
				var scope = WinJSContrib.Utils.getScopeControl(this);
				if (optionsCallback) {
					options = optionsCallback(this, scope);
				}
				new ctor(this, options);
			};
			global.document.registerElement(tagname, { prototype: proto });
		}
	}

	WinJSContrib.UI.WebComponents.mapAttr = function (element, attrName, optionName, options, resolve) {
		var val = element.getAttribute(attrName);
		if (val) {
			if (resolve) {
				var tmp = WinJSContrib.Utils.resolveValue(element, val);
				if (tmp) {
					options[optionName] = tmp;
					return;
				}
			}

			options[optionName] = val;
		}
	}

	WinJSContrib.UI.WebComponents.register('win-listview', WinJS.UI.ListView, function (elt) {
		var options = {};
		WinJSContrib.UI.WebComponents.mapAttr(elt, 'itemtemplate', 'itemTemplate', options, true);
		WinJSContrib.UI.WebComponents.mapAttr(elt, 'swipebehavior', 'swipeBehavior', options);
		WinJSContrib.UI.WebComponents.mapAttr(elt, 'selectbehavior', 'selectBehavior', options);
		WinJSContrib.UI.WebComponents.mapAttr(elt, 'tapbehavior', 'tapBehavior', options);
		
		return options;
	});
})(this);