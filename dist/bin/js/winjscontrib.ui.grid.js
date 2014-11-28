//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

(function () {
    "use strict";

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
                grid.$element = $(grid.element);

                grid.element.className = grid.element.className + ' mcn-grid-ctrl mcn-layout-ctrl win-disposable';
                grid.element.winControl = grid;
                grid.autolayout = options.autolayout;



                grid.renderer = new WinJSContrib.UI.MultiPassRenderer(grid.element, {
                    multipass: options.multipass,
                    itemClassName: options.itemClassName,
                    itemTemplate: options.itemTemplate,
                    itemInvoked: options.itemInvoked,
                });

                grid.gridLayouts = options.layouts;
                grid.defaultLayout = {
                    layout: 'horizontal',
                    itemsPerColumn: (options.itemsPerColumn) ? options.itemsPerColumn : undefined,
                    itemsPerRow: (options.itemsPerRow) ? options.itemsPerRow : undefined,
                    cellSpace: (options.cellSpace) ? options.cellSpace : 10,
                    cellWidth: (options.cellWidth) ? options.cellWidth : undefined,
                    cellHeight: (options.cellHeight) ? options.cellHeight : undefined,
                };
            },
            /**
             * @lends WinJSContrib.UI.GridControl.prototype
             */
            {
                scrollContainer: {
                    get: function () {
                        return this.renderer.scrollContainer;
                    },
                    set: function (val) {
                        this.renderer.scrollContainer = val;
                    }
                },

                /**
                 * render HTML for items
                 * @param {Array} items array of items to render
                 * @param {Object} renderOptions
                 */
                prepareItems: function (items, renderOptions) {
                    var parent = WinJSContrib.Utils.getParentControlByClass('mcn-layout-ctrl', this.element);
                    var parentMultipass = undefined;
                    if (!this.renderer.multipass && parent && parent.multipass) {
                        this.renderer.multipass = parent.multipass;
                    }

                    this.renderer.prepareItems(items, renderOptions);
                },

                pageLayout: function () {
                    if (this.autolayout) {
                        this.layout();
                    }
                },

                /**
                 * force items content to render
                 */
                renderItemsContent: function () {
                    this.renderer.renderItemsContent();
                },

                /**
                 * Clear all layout and position styles on items
                 */
                clear: function () {
                    var ctrl = this;
                    ctrl.$element.css('position', '').css('display', '').css('width', '').css('height', '');
                    ctrl.$element.children().each(function () {
                        $(this).css('position', '').css('left', '').css('top', '').css('width', '').css('height', '');
                    });
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

                flexhorizontallayout: function () {
                    var ctrl = this;
                    ctrl.renderer.orientation = 'horizontal';
                    ctrl.element.style.position = 'relative';
                    ctrl.element.style.display = 'flex';
                    ctrl.element.style.flexFlow = 'column wrap';
                    ctrl.element.style.width = '';

                    if (ctrl.element.clientHeight)
                        ctrl.element.style.height = ctrl.element.clientHeight + 'px';
                    else
                        ctrl.element.style.height = '';
                },

                flexverticallayout: function () {
                    var ctrl = this;
                    ctrl.renderer.orientation = 'vertical';
                    ctrl.element.style.position = 'relative';
                    ctrl.element.style.display = 'flex';
                    ctrl.element.style.flexFlow = 'row wrap';

                    if (ctrl.element.clientWidth)
                        ctrl.element.style.width = ctrl.element.clientWidth + 'px';
                    else
                        ctrl.element.style.width = '';

                    ctrl.element.style.height = '';
                },

                horizontallayout: function () {
                    var ctrl = this;
                    ctrl.renderer.orientation = 'horizontal';
                    ctrl.element.style.position = 'relative';
                    ctrl.element.style.height = '';
                    var _containerH = ctrl.element.clientHeight;
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
                    var childs = ctrl.$element.children();
                    childs.each(function (index) {
                        var elt = this;
                        if (elt.style.display != 'none') {
                            elt.style.position = 'absolute';
                            var $elt = $(this);

                            var eltW = $(this).outerWidth() * ratioW;
                            var eltH = $(this).outerHeight() * ratioH;
                            var eltColumns = (eltW / cellW) >> 0;
                            var eltRows = (eltH / cellH) >> 0;

                            var pos = ctrl.firstFit(gridCellsMatrix, eltColumns, eltRows, _itemsPerColumn, ctrl.element.children.length);
                            if (!pos)
                                pos = { x: 0, y: 0 };
                            ctrl.fill(gridCellsMatrix, pos.x, pos.y, eltColumns, eltRows);

                            var left = pos.x * (cellW + space);
                            var top = pos.y * (cellH + space);
                            $elt.css('left', left + 'px');
                            $elt.css('top', top + 'px');
                            $elt.css('width', (eltColumns * cellW + ((eltColumns - 1) * space)) + 'px');
                            $elt.css('height', (eltRows * cellH + ((eltRows - 1) * space)) + 'px');
                        }
                    });

                    var elementWidth = gridCellsMatrix.length * (cellW + space);
                    ctrl.$element.css('width', elementWidth + 'px');
                },

                verticallayout: function (plugin) {
                    var ctrl = this;
                    ctrl.renderer.orientation = 'vertical';
                    ctrl.element.style.width = '';
                    ctrl.element.style.position = 'relative';
                    //Be aware that in this case, we invert the matrix to crawl data in lines
                    var _containerW = ctrl.element.clientWidth;
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

                    ctrl.$element.children().each(function (index) {
                        var elt = this;
                        if (elt.style.display != 'none') {
                            elt.style.position = 'absolute';
                            var $elt = $(this);

                            var eltW = $(this).outerWidth() * ratioW;
                            var eltH = $(this).outerHeight() * ratioH;
                            var eltColumns = (eltW / cellW) >> 0;
                            var eltRows = (eltH / cellH) >> 0;

                            var pos = ctrl.firstFit(gridCellsMatrix, eltRows, eltColumns, _itemsPerLine, ctrl.element.children.length);
                            //if (!pos)
                            //    return;

                            ctrl.fill(gridCellsMatrix, pos.x, pos.y, eltRows, eltColumns);

                            var left = pos.y * (cellW + space);
                            var top = pos.x * (cellH + space);
                            $elt.css('left', left + 'px');
                            $elt.css('top', top + 'px');
                            $elt.css('width', (eltColumns * cellW + ((eltColumns - 1) * space)) + 'px');
                            $elt.css('height', (eltRows * cellH + ((eltRows - 1) * space)) + 'px');
                        }
                    });

                    var elementHeight = gridCellsMatrix.length * (cellH + space);
                    ctrl.$element.css('height', elementHeight + 'px');
                },

                /**
                 * layout content items
                 */
                layout: function () {
                    var ctrl = this;
                    var oldlayout = ctrl.data;

                    ctrl.data = ctrl.getLayout();

                    if (ctrl.data) {
                        //if (ctrl.data == oldlayout && ctrl.data.applyed)
                        //    return;

                        ctrl.data.cellSpace = ctrl.data.cellSpace || ctrl.defaultLayout.cellSpace || 10;
                        ctrl.data.cellWidth = ctrl.data.cellWidth || ctrl.defaultLayout.cellWidth || 0;
                        ctrl.data.cellHeight = ctrl.data.cellHeight || ctrl.defaultLayout.cellHeight || 0;

                        //if cell dimensions are not defined, take it from last child
                        if (!ctrl.data.cellWidth || !ctrl.data.cellHeight) {
                            if (ctrl.element.childNodes && ctrl.element.children.length > 0) {
                                var firstChild = ctrl.element.children[ctrl.element.children.length - 1];
                                var $firstChild = $(firstChild);

                                ctrl.data.cellWidth = $firstChild.outerWidth();
                                ctrl.data.cellHeight = $firstChild.outerHeight();
                            }
                        }

                        var layoutfunc = ctrl[ctrl.data.layout + 'layout'];
                        if (layoutfunc) {
                            layoutfunc.bind(ctrl)();
                            ctrl.data.applyed = true;
                        }
                        
                        ctrl.renderer.checkRendering();
                    }
                },

                /**
                 * update grid layout
                 */
                updateLayout: function (element, viewState, lastViewState) {
                    var ctrl = this;
                    ctrl.clear();
                    ctrl.renderer.updateLayout();
                    setImmediate(function () {
                        ctrl.layout();
                    });
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
                    if (WinJS.Utilities.disposeSubTree)
                        WinJS.Utilities.disposeSubTree(this.element);
                }
            })
    });
})();