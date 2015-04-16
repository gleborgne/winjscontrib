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



	if (WinJS.Binding && WinJS.Binding.Template) {
		WinJSContrib.UI.WebComponents.register('win-template', WinJS.Binding.Template, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'extractchild', 'extractChild', options);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.AppBar) {
		WinJSContrib.UI.WebComponents.register('win-appbar', WinJS.UI.AppBar, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'closeddisplaymode', 'closedDisplayMode', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'disabled', 'disabled', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'hidden', 'hidden', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'layout', 'layout', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'placement', 'placement', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'sticky', 'sticky', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'commands', 'commands', options, true);

			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onafterhide', 'onafterhide', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onaftershow', 'onaftershow', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforehide', 'onbeforehide', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforeshow', 'onbeforeshow', options, true);

			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.AutoSuggestBox) {
		WinJSContrib.UI.WebComponents.register('win-autosuggestbox', WinJS.UI.AutoSuggestBox, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'chooseSuggestionOnEnter', 'chooseSuggestionOnEnter', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'disabled', 'disabled', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onquerychanged', 'onquerychanged', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onquerysubmitted', 'onquerysubmitted', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onresultsuggestionchosen', 'onresultsuggestionchosen', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onsuggestionsrequested', 'onsuggestionsrequested', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'placeholderText', 'placeholderText', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'queryText', 'queryText', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'searchHistoryContext', 'searchHistoryContext', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'searchHistoryDisabled', 'searchHistoryDisabled', options, true);
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
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'hidden', 'hidden', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'primaryCommandDisabled', 'primaryCommandDisabled', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'primaryCommandText', 'primaryCommandText', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'secondaryCommandDisabled', 'secondaryCommandDisabled', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'secondaryCommandText', 'secondaryCommandText', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'title', 'title', options);

			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onafterhide', 'onafterhide', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onaftershow', 'onaftershow', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforehide', 'onbeforehide', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforeshow', 'onbeforeshow', options, true);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.DatePicker) {
		WinJSContrib.UI.WebComponents.register('win-datepicker', WinJS.UI.DatePicker, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'calendar', 'calendar', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'datePattern', 'datePattern', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'disabled', 'disabled', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'maxYear', 'maxYear', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'minYear', 'minYear', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'monthPattern', 'monthPattern', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'yearPattern', 'yearPattern', options);

			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onchange', 'onchange', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'current', 'current', options, true);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.FlipView) {
		WinJSContrib.UI.WebComponents.register('win-flipview', WinJS.UI.FlipView, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'itemtemplate', 'itemTemplate', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'itemdatasource', 'itemDataSource', options, true);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.Flyout) {
		WinJSContrib.UI.WebComponents.register('win-flyout', WinJS.UI.Flyout, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'alignment', 'alignment', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'anchor', 'anchor', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'disabled', 'disabled', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'hidden', 'hidden', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'placement', 'placement', options);

			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onafterhide', 'onafterhide', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onaftershow', 'onaftershow', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforehide', 'onbeforehide', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforeshow', 'onbeforeshow', options, true);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.Hub) {
		WinJSContrib.UI.WebComponents.register('win-hub', WinJS.UI.Hub, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'headerTemplate', 'headerTemplate', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'indexOfFirstVisible', 'indexOfFirstVisible', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'indexOfLastVisible', 'indexOfLastVisible', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'loadingState', 'loadingState', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'oncontentanimating', 'oncontentanimating', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onheaderinvoked', 'onheaderinvoked', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onloadingstatechanged', 'onloadingstatechanged', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'orientation', 'orientation', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'scrollPosition', 'scrollPosition', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'sectionOnScreen', 'sectionOnScreen', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'sections', 'sections', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'zoomableView', 'zoomableView', options, true);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.HubSection) {
		WinJSContrib.UI.WebComponents.register('win-hubsection', WinJS.UI.HubSection, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'contentElement', 'contentElement', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'header', 'header', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'isHeaderStatic', 'isHeaderStatic', options, true);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.ItemContainer) {
		WinJSContrib.UI.WebComponents.register('win-itemcontainer', WinJS.UI.ItemContainer, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'draggable', 'draggable', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'oninvoked', 'oninvoked', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onselectionchanged', 'onselectionchanged', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onselectionchanging', 'onselectionchanging', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'selected', 'selected', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'selectionDisabled', 'selectionDisabled', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'swipeBehavior', 'swipeBehavior', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'swipeOrientation', 'swipeOrientation', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'tapBehavior', 'tapBehavior', options, true);
			return options;
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

	if (WinJS.UI && WinJS.UI.Menu) {
		WinJSContrib.UI.WebComponents.register('win-menu', WinJS.UI.Menu, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'alignment', 'alignment', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'anchor', 'anchor', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'commands', 'commands', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'disabled', 'disabled', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'hidden', 'hidden', options);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'placement', 'placement', options);

			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onafterhide', 'onafterhide', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onaftershow', 'onaftershow', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforehide', 'onbeforehide', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforeshow', 'onbeforeshow', options, true);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.Pivot) {
		WinJSContrib.UI.WebComponents.register('win-pivot', WinJS.UI.Pivot, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'items', 'items', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'locked', 'locked', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onitemanimationend', 'onitemanimationend', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onitemanimationstart', 'onitemanimationstart', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onselectionchanged', 'onselectionchanged', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'selectedIndex', 'selectedIndex', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'selectedItem', 'selectedItem', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'title', 'title', options, true);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.PivotItem) {
		WinJSContrib.UI.WebComponents.register('win-pivotitem', WinJS.UI.PivotItem, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'contentElement', 'contentElement', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'header', 'header', options, true);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.Rating) {
		WinJSContrib.UI.WebComponents.register('win-rating', WinJS.UI.Rating, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'averageRating', 'averageRating', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'disabled', 'disabled', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'enableClear', 'enableClear', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'maxRating', 'maxRating', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'oncancel', 'oncancel', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onchange', 'onchange', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onpreviewchange', 'onpreviewchange', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'tooltipStrings', 'tooltipStrings', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'userRating', 'userRating', options, true);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.Repeater) {
		WinJSContrib.UI.WebComponents.register('win-repeater', WinJS.UI.Repeater, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'data', 'data', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'length', 'length', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onitemchanged', 'onitemchanged', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onitemchanging', 'onitemchanging', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'oniteminserted', 'oniteminserted', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'oniteminserting', 'oniteminserting', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onitemmoved', 'onitemmoved', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onitemmoving', 'onitemmoving', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onitemremoved', 'onitemremoved', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onitemremoving', 'onitemremoving', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onitemsloaded', 'onitemsloaded', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onitemsreloaded', 'onitemsreloaded', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onitemsreloading', 'onitemsreloading', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'template', 'template', options, true);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.SearchBox) {
		WinJSContrib.UI.WebComponents.register('win-searchbox', WinJS.UI.SearchBox, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'chooseSuggestionOnEnter', 'chooseSuggestionOnEnter', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'disabled', 'disabled', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'focusOnKeyboardInput', 'focusOnKeyboardInput', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onquerychanged', 'onquerychanged', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onquerysubmitted', 'onquerysubmitted', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onresultsuggestionchosen', 'onresultsuggestionchosen', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onsuggestionsrequested', 'onsuggestionsrequested', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'placeholderText', 'placeholderText', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'queryText', 'queryText', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'searchHistoryContext', 'searchHistoryContext', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'searchHistoryDisabled', 'searchHistoryDisabled', options, true);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.SemanticZoom) {
		WinJSContrib.UI.WebComponents.register('win-semanticzoom', WinJS.UI.SemanticZoom, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'enableButton', 'enableButton', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'locked', 'locked', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onzoomchanged', 'onzoomchanged', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'zoomedInItem', 'zoomedInItem', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'zoomedOut', 'zoomedOut', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'zoomedOutItem', 'zoomedOutItem', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'zoomFactor', 'zoomFactor', options, true);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.SplitView) {
		WinJSContrib.UI.WebComponents.register('win-splitview', WinJS.UI.SplitView, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'contentElement', 'contentElement', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'hiddenDisplayMode', 'hiddenDisplayMode', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'paneElement', 'paneElement', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'paneHidden', 'paneHidden', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'panePlacement', 'panePlacement', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'shownDisplayMode', 'shownDisplayMode', options, true);

			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onafterhide', 'onafterhide', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onaftershow', 'onaftershow', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforehide', 'onbeforehide', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforeshow', 'onbeforeshow', options, true);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.TimePicker) {
		WinJSContrib.UI.WebComponents.register('win-timepicker', WinJS.UI.TimePicker, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onchange', 'onchange', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'clock', 'clock', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'current', 'current', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'disabled', 'disabled', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'hourPattern', 'hourPattern', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'minuteIncrement', 'minuteIncrement', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'minutePattern', 'minutePattern', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'periodPattern', 'periodPattern', options, true);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.ToggleSwitch) {
		WinJSContrib.UI.WebComponents.register('win-toggleswitch', WinJS.UI.ToggleSwitch, function (elt, options) {
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onchange', 'onchange', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'checked', 'checked', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'disabled', 'disabled', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'labelOff', 'labelOff', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'labelOn', 'labelOn', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'title', 'title', options, true);
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
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'contentElement', 'contentElement', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'extraClass', 'extraClass', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'infotip', 'infotip', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'innerHTML', 'innerHTML', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforeclose', 'onbeforeclose', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onbeforeopen', 'onbeforeopen', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onclosed', 'onclosed', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'onopened', 'onopened', options, true);
			WinJSContrib.UI.WebComponents.mapAttr(elt, 'placement', 'placement', options, true);
			return options;
		});
	}

	if (WinJS.UI && WinJS.UI.ViewBox) {
		WinJSContrib.UI.WebComponents.register('win-viewbox', WinJS.UI.ViewBox, function (elt, options) {
			return options;
		});
	}


	/*
	WinJS.UI.AppBar
				WinJS.UI.AppBarCommand
				WinJS.UI.AppBarIcon
				WinJS.UI.AutoSuggestBox
				
				
				WinJS.UI.Menu
				WinJS.UI.MenuCommand
				WinJS.UI.NavBar
				WinJS.UI.NavBarCommand
				WinJS.UI.NavBarContainer
				Toolbar
				Viewbox
	*/
})(this);