/* 
 * WinJS Contrib v2.1.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

(function () {

	"use strict";

	/**
     * Object representing a layout configuration for the grid control
     * @typedef {Object} WinJSContrib.UI.GridControlLayout
     * @property {string} layout layout algorythm to apply (horizontal | vertical | flexhorizontal | flexvertical | hbloc
     * @property {number} cellSpace space between grid cells
     * @property {number} cellWidth width of grid cells
     * @property {number} cellHeight height of grid cells
     * @property {number} itemsPerColumn number of cells per column if using a layout with a fixed number of cells
     * @property {number} itemsPerRow number of cells per row if using a layout with a fixed number of cells
     * @example
     * {
     *     layout: 'horizontal',
     *     itemsPerColumn: (options.itemsPerColumn) ? options.itemsPerColumn : undefined,
     *     itemsPerRow: (options.itemsPerRow) ? options.itemsPerRow : undefined,
     *     cellSpace: 10,
     *     cellWidth: (options.cellWidth) ? options.cellWidth : undefined,
     *     cellHeight: (options.cellHeight) ? options.cellHeight : undefined,
     * }
     */

	WinJS.Namespace.define("WinJSContrib.UI", {
		GridControl: WinJS.Class.define(
            /**
             * @classdesc
             * Control that layout it's children with different algorythms. Used with {@link WinJSContrib.UI.Hub}, The Grid could rely on multipass rendering to optimize large hub pages load.
             * @class WinJSContrib.UI.GridControl
             * @param {HTMLElement} element DOM element containing the control
             * @param {Object} options
             */
            function GridControl(element, options) {
            	var grid = this;
            	options = options || {};
            	grid.element = element;

            	grid.element.className = grid.element.className + ' mcn-grid-ctrl mcn-layout-ctrl win-disposable';
            	grid.element.winControl = grid;


            	/**
                 * multipass renderer for the grid
                 * @field
                 * @type WinJSContrib.UI.MultiPassRenderer
                 */
            	grid.renderer = new WinJSContrib.UI.MultiPassRenderer(grid.element, {
            		multipass: options.multipass,
            		itemClassName: options.itemClassName,
            		itemTemplate: options.itemTemplate,
            		itemInvoked: options.itemInvoked,
            	});


            	grid.layouts = options.layouts;

            	/**
                 * default layout definitions for the grid
                 * @field
                 * @type WinJSContrib.UI.GridControlLayout
                 */
            	grid.defaultLayout = {
            		layout: options.layout || 'none',
            		itemsPerColumn: (options.itemsPerColumn) ? options.itemsPerColumn : undefined,
            		itemsPerRow: (options.itemsPerRow) ? options.itemsPerRow : undefined,
            		cellSpace: (options.cellSpace) ? options.cellSpace : 10,
            		cellWidth: (options.cellWidth) ? options.cellWidth : undefined,
            		cellHeight: (options.cellHeight) ? options.cellHeight : undefined,
            	};

            	/**
                 * indicate if grid accept layout event from the page (if you use WinJS Contrib page events)
                 * @field
                 * @type boolean
                 */
            	grid.autolayout = options.autolayout || true;

            	var parent = WinJSContrib.Utils.getScopeControl(grid.element);
            	if (parent && parent.pageLifeCycle) {
            		parent.pageLifeCycle.steps.layout.attach(function () {
            			if (grid.autolayout) {
            				grid.layout();
            			}
            		});
            	}
            	else if (parent && parent.elementReady) {
            		parent.elementReady.then(function () {
            			parent.readyComplete.then(function () {
            				if (grid.autolayout) {
            					grid.layout();
            				}
            			});
            		});
            	}
            },
            /**
             * @lends WinJSContrib.UI.GridControl.prototype
             */
            {
            	/**
                 * scroll element containing the grid. Required for multi pass rendering
                 * @field
                 * @type HTMLElement
                 */
            	scrollContainer: {
            		get: function () {
            			return this.renderer.scrollContainer;
            		},
            		set: function (val) {
            			this.renderer.scrollContainer = val;
            		}
            	},

            	/**
                 * indicate if grid layout itself according to the page lifecycle (default to true)
                 * @field
                 * @type boolean
                 */
            	autolayout: {
            		get: function () {
            			return this._autolayout;
            		},
            		set: function (val) {
            			this._autolayout = val;
            		}
            	},

            	/**
                 * layout definitions for the grid. It's an object containing several grid layout options. See {@link WinJSContrib.UI.GridControlLayout}
                 * @field
                 * @type Object
                 */
            	layouts: {
            		get: function () {
            			return this.gridLayouts;
            		},
            		set: function (val) {
            			this.gridLayouts = val;
            		}
            	},

            	/**
                 * indicate the kind of multipass treatment
                 * @field
                 * @type string
                 */
            	multipass: {
            		get: function () {
            			return this.renderer.multipass;
            		},
            		set: function (val) {
            			this.renderer.multipass = val;
            		}
            	},

            	/**
                 * callback triggered when clicking on an item
                 * @field
                 * @type HTMLElement
                 */
            	itemInvoked: {
            		get: function () {
            			return this.renderer.itemInvoked;
            		},
            		set: function (val) {
            			this.renderer.itemInvoked = val;
            		}
            	},

            	/**
                 * item template (WinJS Template or template function)
                 * @field
                 * @type Object
                 */
            	itemTemplate: {
            		get: function () {
            			return this.renderer.itemTemplate;
            		},
            		set: function (val) {
            			this.renderer.itemTemplate = val;
            		}
            	},

            	/**
                 * css class added on item's placeholder
                 * @field
                 * @type Object
                 */
            	itemClassName: {
            		get: function () {
            			return this.renderer.itemClassName;
            		},
            		set: function (val) {
            			this.renderer.itemClassName = val;
            		}
            	},

            	/**
                 * items to render
                 * @field
                 * @type Object
                 */
            	items: {
            		get: function () {
            			return;
            		},
            		set: function (val) {
						if (val && val.length)
            				this.prepareItems(val);
            		}
            	},

            	/**
                 * render HTML for items
                 * @param {Array} items array of items to render
                 * @param {Object} renderOptions
                 */
            	prepareItems: function (items, renderOptions) {
                    if (!this.element)
                        return;
                    
            		var parent = WinJSContrib.Utils.getParentControlByClass('mcn-layout-ctrl', this.element);
            		var parentMultipass = undefined;
            		if (!this.renderer.multipass && parent && parent.multipass) {
            			this.renderer.multipass = parent.multipass;
            		}

            		this.renderer.prepareItems(items, renderOptions);
            	},

            	/**
                 * force items content to render
                 */
            	renderItemsContent: function () {
            		if (!this.renderer)
                        return;
                    this.renderer.renderItemsContent();
            	},

            	resetElement: function (elt, isItem) {
            		var style = elt.style;
            		if (isItem && style.position) style.position = '';
            		if (!isItem && style.display) style.display = '';
            		if (style.width) style.width = '';
            		if (style.height) style.height = '';
            		if (style.minWidth) style.minWidth = '';
            		if (style.minHeight) style.minHeight = '';
            		if (style.left) style.left = '';
            		if (style.top) style.top = '';
            	},

            	clearContent: function () {
            		var ctrl = this;
            		ctrl.renderer.clear();
            	},

            	/**
                 * Clear all layout and position styles on items
                 */
            	clearLayout: function () {
            		var ctrl = this;
            		
            		ctrl.resetElement(ctrl.element, false);
            		if (ctrl.element.children.length) {
            			for (var i = 0, l = ctrl.element.children.length; i < l; i++) {
            				ctrl.resetElement(ctrl.element.children[i], true);
            			}
            		}
            	},

            	fill: function (matrix, x, y, w, h) {
            		if (matrix.length < x + w) {
            			for (var i = matrix.length ; i < x + w ; i++) {
            				matrix.push([]);
            			}
            		}

            		for (var i = x ; i < x + w ; i++) {
            			var col = matrix[i];
            			if (col.length < y + h) {
            				for (var j = col.length ; j < y + h ; j++) {
            					col.push(false);
            				}
            			}

            			for (var j = y ; j < y + h ; j++) {
            				col[j] = true;
            			}
            		}
            	},

            	fit: function (matrix, x, y, w, h, maxW, maxH) {
            		//items to big
            		if (maxH && h > maxH && y === 0)
            			return true;
            		if (maxW && w > maxW && x === 0)
            			return true;

            		//overflow grid capacity
            		if (maxW && (x + w) > maxW)
            			return false;
            		if (maxH && (y + h) > maxH)
            			return false;

            		for (var i = x ; i < x + w ; i++) {
            			var col = matrix[i];
            			if (col) {
            				for (var j = y ; j < y + h ; j++) {
            					if (col[j] === true)
            						return false;
            				}
            			}
            		}

            		return true;
            	},

            	firstFit: function (matrix, w, h, maxH, numItems) {
            		var ctrl = this;
            		for (var i = 0 ; i < numItems * maxH * 2 ; i++) {
            			var col = matrix[i];
            			if (col) {
            				for (var j = 0 ; j < maxH ; j++) {
            					if (col[j] !== true && ctrl.fit(matrix, i, j, w, h, undefined, maxH)) {
            						return { x: i, y: j };
            					}
            				}
            			}
            			else {
            				return { x: i, y: 0 };
            			}
            		}

            		return undefined;
            	},

            	visibleChilds: function () {
            		var ctrl = this;
            		var res = [];

            		for (var i = 0, l = ctrl.element.children.length; i < l ; i++) {
            			var item = ctrl.element.children[i];
            			var st = window.getComputedStyle(item);
            			if (st.display != 'none' && st.visibility != 'hidden') {
            				res.push(item);
            			}
            		}

            		return res;
            	},

            	/**
                 * Layouts algorythm implementations
                 */
            	GridLayoutsImpl: {
            		none: function () {
            		},

            		flexhorizontal: function () {
            			var ctrl = this;
            			ctrl.renderer.orientation = 'horizontal';
            			ctrl.element.style.position = 'relative';
            			ctrl.element.style.display = 'flex';
            			ctrl.element.style.flexFlow = 'column wrap';
            			ctrl.element.style.alignContent = 'flex-start';
            			//ctrl.element.style.alignContent = 'flex-start';

            			if (ctrl.element.style.width)
            				ctrl.element.style.width = '';

            			ctrl.element.style.height = '';

            			if (ctrl.element.clientHeight)
            				ctrl.element.style.height = ctrl.element.clientHeight + 'px';
            			else
            				ctrl.element.style.height = '';

            			var _itemsPerColumn = Math.floor(ctrl.element.clientHeight / (ctrl.data.cellHeight + ctrl.data.cellSpace));
            			if (_itemsPerColumn) {
            				var visibleitems = ctrl.visibleChilds();
            				var columns = Math.ceil(visibleitems.length / _itemsPerColumn);
            				ctrl.element.style.minWidth = ((ctrl.data.cellWidth + ctrl.data.cellSpace) * columns) + 'px';
            			}
            		},

            		flexvertical: function () {
            		    var ctrl = this;
                        ctrl.renderer.orientation = 'vertical';
            			ctrl.element.style.position = 'relative';
            			ctrl.element.style.display = 'flex';
            			ctrl.element.style.flexFlow = 'row wrap';
            			ctrl.element.style.alignContent = 'flex-start';

            			ctrl.element.style.width = '';
            			if (ctrl.element.clientWidth)
            				ctrl.element.style.width = ctrl.element.clientWidth + 'px';
            			else
            				ctrl.element.style.width = '';

            			if (ctrl.element.style.height)
            				ctrl.element.style.height = '';
            		},

            		hbloc: function () {
            			var ctrl = this;
            			ctrl.renderer.orientation = 'horizontal';
            			ctrl.element.style.position = 'relative';
            			ctrl.element.style.height = '';
            			var _containerH = ctrl.element.clientHeight;
            			if (!_containerH)
            				return;

            			var cellW = ctrl.data.cellWidth;
            			var space = ctrl.data.cellSpace;
            			var colCount = 1;
            			var colOffset = 0;
            			var topOffset = 0;

            			var childs = ctrl.visibleChilds();
            			childs.forEach(function (elt) {
            				if (elt.style.position != 'absolute')
            					elt.style.position = 'absolute';
            				var eltH = elt.clientHeight;
            				if (topOffset + eltH > _containerH) {
            					colCount++;
            					colOffset = colOffset + space + cellW;
            					topOffset = 0;
            				}

            				if (elt.style.left != colOffset + 'px')
            					elt.style.left = colOffset + 'px';
            				if (elt.style.top != topOffset + 'px')
            					elt.style.top = topOffset + 'px';

            				topOffset += eltH;
            			});

            			colOffset = colOffset + cellW;
            			if (ctrl.element.style.width != colOffset + 'px')
            				ctrl.element.style.width = colOffset + 'px';
            		},

            		horizontal: function () {
            			var ctrl = this;
            			ctrl.renderer.orientation = 'horizontal';
            			ctrl.element.style.position = 'relative';
            			ctrl.element.style.height = '';
            			var _containerH = ctrl.element.clientHeight;
            			if (!_containerH)
            				return;

            			var _itemsPerColumn = Math.floor(_containerH / (ctrl.data.cellHeight + ctrl.data.cellSpace));
            			if (_itemsPerColumn <= 0)
            				_itemsPerColumn = 1;

            			var cellW = ctrl.data.cellWidth;
            			var cellH = ctrl.data.cellHeight;
            			var space = ctrl.data.cellSpace;
            			var aspectRatio = cellW / cellH;
            			var ratioW = 1;
            			var ratioH = 1;

            			if (ctrl.data.itemsPerColumn) {
            				_itemsPerColumn = ctrl.data.itemsPerColumn;
            				cellH = ((_containerH - ((_itemsPerColumn - 1) * space)) / _itemsPerColumn) >> 0;
            				cellW = (ctrl.data.cellWidth * cellH / ctrl.data.cellHeight) >> 0;
            				ratioW = cellW / ctrl.data.cellWidth;
            				ratioH = cellH / ctrl.data.cellHeight;
            			}

            			var gridCellsMatrix = [[]];
            			var childs = ctrl.visibleChilds();
            			childs.forEach(function (elt) {
            				elt.style.position = 'absolute';
            				var eltW = elt.offsetWidth * ratioW;
            				var eltH = elt.offsetHeight * ratioH;
            				var eltColumns = (eltW / cellW) >> 0;
            				var eltRows = (eltH / cellH) >> 0;

            				var pos = ctrl.firstFit(gridCellsMatrix, eltColumns, eltRows, _itemsPerColumn, ctrl.element.children.length);
            				if (!pos)
            					pos = { x: 0, y: 0 };
            				ctrl.fill(gridCellsMatrix, pos.x, pos.y, eltColumns, eltRows);

            				var left = pos.x * (cellW + space);
            				var top = pos.y * (cellH + space);
            				var w = (eltColumns * cellW + ((eltColumns - 1) * space));
            				var h = (eltRows * cellH + ((eltRows - 1) * space));
            				elt.style.left = left + 'px';
            				elt.style.top = top + 'px';
            				elt.style.width = w + 'px';
            				elt.style.height = h + 'px';
            			});

            			var elementWidth = gridCellsMatrix.length * (cellW + space);
            			ctrl.element.style.width = elementWidth + 'px';
            		},

            		vertical: function (plugin) {
            			var ctrl = this;
            			ctrl.renderer.orientation = 'vertical';
            			ctrl.element.style.width = '';
            			ctrl.element.style.position = 'relative';
            			//Be aware that in this case, we invert the matrix to crawl data in lines
            			var _containerW = ctrl.element.clientWidth;
            			if (!_containerW)
            				return;

            			var _itemsPerLine = Math.floor(_containerW / (ctrl.data.cellWidth + ctrl.data.cellSpace));
            			if (_itemsPerLine <= 0)
            				_itemsPerLine = 1;

            			var cellW = ctrl.data.cellWidth;
            			var cellH = ctrl.data.cellHeight;
            			var space = ctrl.data.cellSpace;
            			var aspectRatio = cellW / cellH;
            			var ratioW = 1;
            			var ratioH = 1;

            			if (ctrl.data.itemsPerRow) {
            				_itemsPerLine = ctrl.data.itemsPerRow;
            				cellW = ((_containerW - ((_itemsPerLine - 1) * space)) / _itemsPerLine) >> 0;
            				cellH = (ctrl.data.cellHeight * cellW / ctrl.data.cellWidth) >> 0;
            				ratioW = cellW / ctrl.data.cellWidth;
            				ratioH = cellH / ctrl.data.cellHeight;
            			}

            			var gridCellsMatrix = [[]];
            			var childs = ctrl.visibleChilds();
            			childs.forEach(function (elt) {
            				elt.style.position = 'absolute';

            				var eltW = elt.offsetWidth * ratioW;
            				var eltH = elt.offsetHeight * ratioH;
            				var eltColumns = (eltW / cellW) >> 0;
            				var eltRows = (eltH / cellH) >> 0;

            				var pos = ctrl.firstFit(gridCellsMatrix, eltRows, eltColumns, _itemsPerLine, ctrl.element.children.length);
            				//if (!pos)
            				//    return;

            				ctrl.fill(gridCellsMatrix, pos.x, pos.y, eltRows, eltColumns);

            				var left = pos.y * (cellW + space);
            				var top = pos.x * (cellH + space);
            				elt.style.left = left + 'px';
            				elt.style.top = top + 'px';
            				elt.style.width = (eltColumns * cellW + ((eltColumns - 1) * space)) + 'px';
            				elt.style.height = (eltRows * cellH + ((eltRows - 1) * space)) + 'px';

            			});

            			var elementHeight = gridCellsMatrix.length * (cellH + space);
            			ctrl.element.style.height = elementHeight + 'px';
            		},
            	},

            	/**
                 * layout content items
                 */
            	layout: function () {
            	    var ctrl = this;
            	    if (!ctrl.element)
            	        return;
            		var oldlayout = ctrl.data;
            		ctrl.data = ctrl.getLayout();

            		if (ctrl.data) {
            			//if (ctrl.data == oldlayout && ctrl.data.applyed)
            			//    return;

            			ctrl.data.cellSpace = (ctrl.data.cellSpace != undefined ? ctrl.data.cellSpace : (ctrl.defaultLayout.cellSpace != undefined ? ctrl.defaultLayout.cellSpace : 10));
            			ctrl.data.cellWidth = ctrl.data.cellWidth || ctrl.defaultLayout.cellWidth || 0;
            			ctrl.data.cellHeight = ctrl.data.cellHeight || ctrl.defaultLayout.cellHeight || 0;

            			//if cell dimensions are not defined, take it from last child
            			if (!ctrl.data.cellWidth || !ctrl.data.cellHeight) {
            			    if (ctrl.element && ctrl.element.childNodes && ctrl.element.children.length > 0) {
            					var childs = ctrl.visibleChilds();
            					if (childs && childs.length) {
            						var firstChild = childs[0];
            						var w = firstChild.clientWidth;
            						var h = firstChild.clientHeight;
            						var l = childs.length;
            						if (l > 10) l = 10;
            						for (var i = 0, l = childs.length; i < l ; i++) {
            							var item = childs[i];
            							if (w == 0 || item.clientWidth < w) {
            								w = item.clientWidth;
            							}
            							if (h == 0 || item.clientHeight < h) {
            								h = item.clientHeight;
            							}
            						}
            						ctrl.data.cellWidth = w;
            						ctrl.data.cellHeight = h;
            					}
            				}
            			}

            			var layoutChanged = !oldlayout || ctrl.data.layout !== oldlayout.layout;
            			if (ctrl.data.layout) {
            				var layoutfunc = ctrl.GridLayoutsImpl[ctrl.data.layout.toLowerCase()];
            				if (layoutfunc) {
            					if (layoutChanged)
            						ctrl.changeLayout();

            					layoutfunc.bind(ctrl)(layoutChanged);
            					ctrl.data.applyed = true;
            				}
            			}
            			ctrl.renderer.checkRendering();
            		}
            	},

            	changeLayout: function () {
            		var ctrl = this;
            		ctrl.clearLayout();
            		ctrl.renderer.updateLayout();
            	},

            	/**
                 * update grid layout
                 */
            	updateLayout: function (element, viewState, lastViewState) {
            	    var ctrl = this;
            	    if (!ctrl.element)
            	        return;
            		ctrl.layout();
            	},

            	/**
                 * get layout applicable to the current context
                 */
            	getLayout: function () {
            		var ctrl = this;
            		var matchingLayout = undefined;
            		if (ctrl.gridLayouts) {
            			for (var name in ctrl.gridLayouts) {
            				var layout = ctrl.gridLayouts[name];
            				if (ctrl.gridLayouts.hasOwnProperty(name)) {
            					if (layout.query) {
            						var mq = window.matchMedia(layout.query);
            						if (mq.matches) {
            							matchingLayout = layout;
            						}
            					} else if (!matchingLayout) {
            						matchingLayout = layout;
            					}
            				}
            				else if (!matchingLayout) {
            					matchingLayout = layout;
            				}
            			}
            		}

            		if (!matchingLayout) {
            			matchingLayout = ctrl.defaultLayout;
            		}

            		return JSON.parse(JSON.stringify(matchingLayout));
            	},

            	/**
                 * Release grid resources
                 */
            	dispose: function () {
            		this.element = null;
            		this.renderer.dispose();
            		if (WinJS.Utilities.disposeSubTree)
            			WinJS.Utilities.disposeSubTree(this.element);
            	}
            })
	});

	if (WinJSContrib.UI.WebComponents) {
		WinJSContrib.UI.WebComponents.register('mcn-grid', WinJSContrib.UI.GridControl, {
			properties: ['multipass', 'autolayout', 'layouts', 'itemInvoked', 'itemTemplate', 'itemClassName', 'items']
		});
	}
})();