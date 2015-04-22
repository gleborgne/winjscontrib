/* 
 * WinJS Contrib v2.1.0.0
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

/*
WARNING: this feature is experimental
You must add winjscontrib.core.js before this file
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

	if (!global.document.registerElement && global.MutationObserver) {
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

		if (node.msParentSelectorScope && node.winControl && node.winControl.pageLifeCycle && node.winControl.pageLifeCycle.observer) {
			//element is a fragment with a mutation observer, no need to inspect childs
			return;
		}
		
		for (var i = 0, l = node.childNodes.length; i < l; i++) {
			inspect(node.childNodes[i]);
		}
	}

	if (WinJSContrib.UI.WebComponents.polyfill) {
		WinJSContrib.UI.WebComponents.inspect = inspect;
	} else {
		WinJSContrib.UI.WebComponents.inspect = function () { };
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

	WinJSContrib.UI.WebComponents.register = function register(tagname, ctor, optionsCallback, override) {
		var existing = registered[tagname.toUpperCase()];
		if (existing && !override) {
			throw 'component ' + tagname + ' already exists';
		}

		if (WinJSContrib.UI.WebComponents.polyfill) {
			global.document.createElement(tagname);
			//we uppercase because node names are uppercase
			registered[tagname.toUpperCase()] = { optionsCallback: optionsCallback, ctor: ctor };
		} else if (global.document.registerElement) {
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

			proto.attributeChangedCallback = function (attrName, oldValue, newValue) {
				var component = this.mcnComponent;
				if (component) {
					var f = component.attributes[attrName.toUpperCase()];
					if (f) {
						f(newValue);
					}
				}
			};

			global.document.registerElement(tagname, { prototype: proto });
		}
	}

	WinJSContrib.UI.WebComponents.mapAttr = function mapAttr(element, propertyName, options) {
		var val = element.getAttribute(propertyName);

		if (val != null && val !== undefined) {
			var tmp = WinJSContrib.Utils.resolveValue(element, val);
			if (tmp) {
				if (tmp.then && tmp.mcnMustResolve) {
					tmp.then(function (data) {
						options[propertyName] = data;
					});
				} else {
					options[propertyName] = tmp;
				}
				return;
			}

			options[propertyName] = val;
		}

		var component = element.mcnComponent;
		if (component) {
			component.attributes[propertyName.toUpperCase()] = function (val) {
				var ctrl = element.winControl;
				if (ctrl) {
					if (resolve) {
						var tmp = WinJSContrib.Utils.resolveValue(element, val);
						if (tmp) {
							ctrl[propertyName] = tmp;
							return;
						}
					}
					ctrl[propertyName] = val
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



	if (WinJS.Binding && WinJS.Binding.Template) {
		WinJSContrib.UI.WebComponents.register('win-template', WinJS.Binding.Template, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'extractChild', options);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.AppBar) {
		WinJSContrib.UI.WebComponents.register('win-appbar', WinJS.UI.AppBar, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'closedDisplayMode', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'disabled', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'hidden', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'layout', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'placement', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'sticky', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'commands', options);

			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onafterhide', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onaftershow', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforehide', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforeshow', options);

			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.AutoSuggestBox) {
		WinJSContrib.UI.WebComponents.register('win-autosuggestbox', WinJS.UI.AutoSuggestBox, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'chooseSuggestionOnEnter', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'disabled', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onquerychanged', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onquerysubmitted', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onresultsuggestionchosen', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onsuggestionsrequested', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'placeholderText', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'queryText', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'searchHistoryContext', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'searchHistoryDisabled', options);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.BackButton) {
		WinJSContrib.UI.WebComponents.register('win-backbutton', WinJS.UI.BackButton, function (elt, options) {
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.ContentDialog) {
		WinJSContrib.UI.WebComponents.register('win-contentdialog', WinJS.UI.ContentDialog, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'hidden', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'primaryCommandDisabled', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'primaryCommandText', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'secondaryCommandDisabled', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'secondaryCommandText', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'title', options);

			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onafterhide', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onaftershow', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforehide', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforeshow', options);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.DatePicker) {
		WinJSContrib.UI.WebComponents.register('win-datepicker', WinJS.UI.DatePicker, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'calendar', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'datePattern', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'disabled', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'maxYear', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'minYear', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'monthPattern', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'yearPattern', options);

			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onchange', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'current', options);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.FlipView) {
		WinJSContrib.UI.WebComponents.register('win-flipview', WinJS.UI.FlipView, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'itemTemplate', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'itemDataSource', options);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.Flyout) {
		WinJSContrib.UI.WebComponents.register('win-flyout', WinJS.UI.Flyout, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'alignment', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'anchor', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'disabled', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'hidden', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'placement', options);

			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onafterhide', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onaftershow', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforehide', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforeshow', options);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.Hub) {
		WinJSContrib.UI.WebComponents.register('win-hub', WinJS.UI.Hub, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'headerTemplate', optionse);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'indexOfFirstVisible', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'indexOfLastVisible', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'loadingState', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'oncontentanimating', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onheaderinvoked', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onloadingstatechanged', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'orientation', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'scrollPosition', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'sectionOnScreen', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'sections', optionse);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'zoomableView', options);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.HubSection) {
		WinJSContrib.UI.WebComponents.register('win-hubsection', WinJS.UI.HubSection, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'contentElement', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'header', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'isHeaderStatic', options);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.ItemContainer) {
		WinJSContrib.UI.WebComponents.register('win-itemcontainer', WinJS.UI.ItemContainer, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'draggable', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'oninvoked', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onselectionchanged', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onselectionchanging', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'selected', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'selectionDisabled', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'swipeBehavior', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'swipeOrientation', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'tapBehavior', options);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.ListView) {
		WinJSContrib.UI.WebComponents.register('win-listview', WinJS.UI.ListView, function (elt, options) {

			WinJSContrib.UI.WebComponents.mapAttr(elt, 'itemTemplate', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'itemDataSource', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'itemsDraggable', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'itemsReorderable', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'oniteminvoked', options);

			WinJSContrib.UI.WebComponents.mapAttr(elt, 'groupHeaderTemplate', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'groupDataSource', options);

			WinJSContrib.UI.WebComponents.mapAttr(elt, 'swipeBehavior', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'selectBehavior', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'tapBehavior', options);

			WinJSContrib.UI.WebComponents.mapAttr(elt, 'header', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'footer', options);

			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.Menu) {
		WinJSContrib.UI.WebComponents.register('win-menu', WinJS.UI.Menu, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'alignment', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'anchor', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'commands', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'disabled', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'hidden', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'placement', options);

			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onafterhide', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onaftershow', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforehide', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforeshow', options);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.Pivot) {
		WinJSContrib.UI.WebComponents.register('win-pivot', WinJS.UI.Pivot, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'items', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'locked', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onitemanimationend', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onitemanimationstart', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onselectionchanged', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'selectedIndex', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'selectedItem', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'title', options);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.PivotItem) {
		WinJSContrib.UI.WebComponents.register('win-pivotitem', WinJS.UI.PivotItem, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'contentElement', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'header', options);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.Rating) {
		WinJSContrib.UI.WebComponents.register('win-rating', WinJS.UI.Rating, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'averageRating', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'disabled', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'enableClear', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'maxRating', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'oncancel', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onchange', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onpreviewchange', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'tooltipStrings', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'userRating', options);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.Repeater) {
		WinJSContrib.UI.WebComponents.register('win-repeater', WinJS.UI.Repeater, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'data', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'length', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onitemchanged', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onitemchanging', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'oniteminserted', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'oniteminserting', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onitemmoved', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onitemmoving', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onitemremoved', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onitemremoving', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onitemsloaded', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onitemsreloaded', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onitemsreloading', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'template', options);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.SearchBox) {
		WinJSContrib.UI.WebComponents.register('win-searchbox', WinJS.UI.SearchBox, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'chooseSuggestionOnEnter', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'disabled', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'focusOnKeyboardInput', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onquerychanged', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onquerysubmitted', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onresultsuggestionchosen', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onsuggestionsrequested', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'placeholderText', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'queryText', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'searchHistoryContext', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'searchHistoryDisabled', options);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.SemanticZoom) {
		WinJSContrib.UI.WebComponents.register('win-semanticzoom', WinJS.UI.SemanticZoom, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'enableButton', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'locked', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onzoomchanged', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'zoomedInItem', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'zoomedOut', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'zoomedOutItem', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'zoomFactor', options);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.SplitView) {
		WinJSContrib.UI.WebComponents.register('win-splitview', WinJS.UI.SplitView, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'contentElement', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'hiddenDisplayMode', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'paneElement', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'paneHidden', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'panePlacement', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'shownDisplayMode', options);

			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onafterhide', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onaftershow', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforehide', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforeshow', options);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.TimePicker) {
		WinJSContrib.UI.WebComponents.register('win-timepicker', WinJS.UI.TimePicker, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onchange', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'clock', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'current', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'disabled', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'hourPattern', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'minuteIncrement', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'minutePattern', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'periodPattern', options);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.ToggleSwitch) {
		WinJSContrib.UI.WebComponents.register('win-toggleswitch', WinJS.UI.ToggleSwitch, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onchange', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'checked', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'disabled', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'labelOff', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'labelOn', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'title', options);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.ToolBar) {
		WinJSContrib.UI.WebComponents.register('win-toolbar', WinJS.UI.ToolBar, function (elt, options) {
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.Tooltip) {
		WinJSContrib.UI.WebComponents.register('win-tooltip', WinJS.UI.Tooltip, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'contentElement', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'extraClass', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'infotip', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'innerHTML', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforeclose', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforeopen', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onclosed', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onopened', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'placement', options);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.ViewBox) {
		WinJSContrib.UI.WebComponents.register('win-viewbox', WinJS.UI.ViewBox, function (elt, options) {
			return options;
		});
	}


	/*
				WinJS.UI.MenuCommand
				WinJS.UI.NavBar
				WinJS.UI.NavBarCommand
				WinJS.UI.NavBarContainer
				Toolbar
	*/
})(this);