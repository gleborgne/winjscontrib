/* 
 * WinJS Contrib v2.1.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

var WinJSContrib = WinJSContrib || {};
WinJSContrib.UI = WinJSContrib.UI || {};

/** @namespace */
WinJSContrib.UI.DataSources = WinJSContrib.UI.DataSources || {};


(function (ds, gr) {
    "use strict";

    ds.DataSourceManager = WinJS.Class.mix(WinJS.Class.define(
    /** 
     * 
     * @class WinJSContrib.UI.DataSources.DataSourceManager
     * @classdesc helper class to manage an array with filter and grouping facilities and plug it into listview with or without semantic zoom. 
     * This is a low level helper object, it's likely that relying on {@link WinJSContrib.UI.SemanticListViews} will be easier.
     * @param {Object} options
     * @example
     * {@lang javascript}
     * var datamgr = new WinJSContrib.UI.DataSources.DataSourceManager({
     *    defaultGroupLimit: 12,
     *    groupKind: WinJSContrib.UI.DataSources.Grouping.byField,
     *    field: 'metadata.genre',
     *    listview: page.zoomedInList,
     *    zoomedOutListView: page.zoomedOutList
     * });
     * 
     */
    function (options) {
        this.groupedList = null;
        this.list = null;
        this.defaultGroupLimit = 0;
        this.filters = new WinJS.Binding.List();
        this.filters.onitemchanged = this.init.bind(this);
        this.filters.oniteminserted = this.init.bind(this);
        this.filters.onitemremoved = this.init.bind(this);
        this.apply(options);
    },
    /**
     * @lends WinJSContrib.UI.DataSources.DataSourceManager.prototype
     */
    {
        apply: function (options) {
            options = options || {};

            if (options.field)
                this.field = options.field;

            if (options.defaultGroupLimit) this.defaultGroupLimit = options.defaultGroupLimit;
            if (options.filter) this.filter = options.filter;
            if (options.groupKind) {
                if (options.groupKind != this.groupKind) {
                    this.groupKind = options.groupKind;
                }
                options = options.groupKind(options);
            }
            if (options.defaultGroupName) this.defaultGroupName = options.defaultGroupName;
            if (options.compareGroups) this.compareGroups = options.compareGroups;
            if (options.getGroupKey) this.getGroupKey = options.getGroupKey;
            if (options.getGroupData) this.getGroupData = options.getGroupData;
            if (options.listview) this.listview = options.listview;
            if (options.zoomedOutListView) this.zoomedOutListView = options.zoomedOutListView;
            if (options.items) this.items = options.items;

        },

        /**
         * path to the field to use for groupings
         * @field
         * @type string
         */
        field: {
            get: function () {
                return this._field;
            },
            set: function (val) {
                this._field = val;
            }
        },

        /**
         * no grouping if items.length < defaultGroupLimit
         * @field
         * @type number
         */
        defaultGroupLimit: {
            get: function () {
                return this._defaultGroupLimit;
            },
            set: function (val) {
                this._defaultGroupLimit = val;
            }
        },

        /**
         * groupKind grouping manager function
         * @field
         * @type function
         */
        groupKind: {
            get: function () {
                return this._groupKind;
            },
            set: function (val) {
                if (val != this._groupKind) {
                    this._groupKind = val;
                    this.apply({ groupKind: val });
                    this.init();
                }
                if (!val) {
                    this.compareGroups = null;
                    this.getGroupData = null;
                    this.getGroupKey = null;
                }
            }
        },

        /**
         * items listview
         * @field
         * @type WinJS.UI.ListView
         */
        listview: {
            get: function () {
                return this._listview;
            },
            set: function (val) {
                if (this._listview) {
                    this.detach();
                }

                this._listview = val;
            }
        },

        /**
         * listview for grouped items
         * @field
         * @type WinJS.UI.ListView
         */
        groupedList: {
            get: function () {
                return this._groupedList;
            },
            set: function (val) {
                this._groupedList = val;
            }
        },

        /**
         * item filter callback
         * @field
         * @type function
         */
        filter: {
            get: function () {
                return this._filter;
            },
            set: function (val) {
                if (this._filter) {
                    this.detach();
                }

                this._filter = val;
                if (val) {
                    this.init();
                }
            }
        },

        /**
         * data items
         * @field
         * @type Array
         */
        items: {
            get: function () {
                return this._items;
            },
            set: function (val) {
                if (this._items) {
                    this.detach();
                }
                this._items = val;
                if (val) {
                    this.init();
                }
                else {
                    this.list = null;
                    this.groupedList = null;
                    this.filteredlist = null;
                    this.detach();
                }
            }
        },

        _filterItems: function (item) {
            var ctrl = this;
            var res = function (item) { return true; };

            if (this.filter)
                res = function (item) { return ctrl.filter(item) };

            if (this.filters.length) {
                var addFilter = function (f, newFilter) {
                    return function (item) {
                        var tmp = f(item);
                        if (!tmp)
                            return false;

                        return newFilter(item);
                    }
                }

                for (var i = 0 ; i < this.filters.length ; i++) {
                    var filter = this.filters.getAt(i);
                    res = addFilter(res, filter);
                }
            }

            return res;
        },

        refresh: function () {
            this.init();
        },

        /**
         * initialise data
         */
        init: function (dontAttach) {
            var ctrl = this;
            this.detach();
            if (this.items) {
                this.list = new WinJS.Binding.List(this.items);

                if (this.filter || this.filters.length) {
                    var filterCallback = this._filterItems();
                    this.filteredlist = this.list.createFiltered(filterCallback);
                }
                else {
                    this.filteredlist = this.list;
                }

                if (this.getGroupKey && this.getGroupData && this.compareGroups) {
                    this.groupedList = this.filteredlist.createGrouped(this.getGroupKey.bind(this), this.getGroupData.bind(this), this.compareGroups.bind(this));

                    var g = ctrl.groupedList.groups;
                    for (var n in g._groupItems) {
                        console.log(n);
                        var grp = ctrl.groupedList._groupsProjection._groupItems[n];
                        if (grp && grp.groupSize !== undefined)
                            grp.data.groupCount = grp.groupSize;
                    }
                } else {
                    this.groupedList = null;
                }

                if (!dontAttach)
                    this.attach();
            }
        },

        /**
         * clean-up, initialise data and bind listviews to data
         * @param {Array} items
         */
        prepareItems: function (items) {
            this.detach();
            this._items = items;
            this.init(true);
        },

        /**
         * attach listviews to data
         */
        attach: function () {
            if ((this.groupedList || this.filteredlist) && this.listview) {
                if (this.groupedList && this.groupedList.length >= this.defaultGroupLimit) {
                    this.listview.itemDataSource = this.groupedList.dataSource;
                    this.listview.groupDataSource = this.groupedList.groups.dataSource;

                    if (this.zoomedOutListView)
                        this.zoomedOutListView.itemDataSource = this.groupedList.groups.dataSource;

                    var semzoom = this.parentSemanticZoom();
                    if (semzoom) {
                        semzoom.locked = false;
                    }
                }
                else if (this.filteredlist && (this.filteredlist.length >= this.defaultGroupLimit || !this.groupedList)) {
                    this.listview.itemDataSource = this.filteredlist.dataSource;
                    this.listview.groupDataSource = null;
                    var semzoom = this.parentSemanticZoom();
                    if (semzoom) {
                        semzoom.locked = true;
                    }
                }
                //else if (this.filteredlist && this.filteredlist.length) {
                //    this.listview.itemDataSource = this.filteredlist.dataSource;
                //    this.listview.groupDataSource = null;
                //    var semzoom = this.parentSemanticZoom();
                //    if (semzoom) {
                //        semzoom.locked = true;
                //    }
                //}
                else {
                    if (this.groupedList)
                        this.listview.itemDataSource = this.groupedList.dataSource;
                    this.listview.groupDataSource = null;
                    if (this.zoomedOutListView)
                        this.zoomedOutListView.itemDataSource = null;

                    var semzoom = this.parentSemanticZoom();
                    if (semzoom) {
                        semzoom.locked = true;
                    }
                }
            }
        },

        /**
         * get parent semantic zoom control
         * @returns {WinJS.UI.SemanticZoom}
         */
        parentSemanticZoom: function () {
            var parent = this.listview.element.parentElement;
            while (parent) {
                if (parent.classList.contains('win-semanticzoom'))
                    return parent.winControl;
                parent = parent.parentElement;
            }
        },

        /**
         * detach listviews from data
         */
        detach: function () {
            if (this.listview) {
                this.listview.itemDataSource = null;
                this.listview.groupDataSource = null;
                if (this.zoomedOutListView)
                    this.zoomedOutListView.itemDataSource = null;
            }
        }
    }), WinJS.UI.DOMEventMixin);

    WinJSContrib.UI.SemanticListViews = WinJS.Class.mix(WinJS.Class.define(
    /** 
     * 
     * @class WinJSContrib.UI.SemanticListViews
     * @classdesc Control wrapping semantic zoom and listviews with a {@link WinJSContrib.UI.DataSources.DataSourceManager}
     * @param {HTMLElement} element DOM element containing the control
     * @param {Object} options
     * 
     * @example {@lang xml}
     * <div id="semanticzoom" data-win-control="WinJSContrib.UI.SemanticListViews" data-win-options="{
     *      listview: { itemTemplate: select('#listItemTemplate'), groupHeaderTemplate : select('#groupItemTemplate')},
     *      zoomedOutListview: { itemTemplate: select('#semanticItemTemplate')},
     *      data: {
     *          defaultGroupLimit: 12,
     *          groupKind: WinJSContrib.UI.DataSources.Grouping.byField,
     *          field: 'metadata.genre',
     *          items: moviesSample
     *      }}">
     * </div>
     */
    function ctor(element, options) {
        this.element = element || document.createElement('DIV');
        options = options || {};
        this.element.winControl = this;
        this.element.classList.add('win-disposable');
        WinJS.UI.setOptions(this, options);
        this._initControl(options);
    },
    /**
     * @lends WinJSContrib.UI.SemanticListViews.prototype
     */
    {
        /**
         * semantic zoom control
         * @field
         * @type {WinJS.UI.SemanticZoom}
         */
        semanticZoom: {
            get: function () {
                return this._semanticZoom;
            },
            set: function (val) {
                this._semanticZoom = val;
            }
        },

        /**
         * items listview
         * @field
         * @type WinJS.UI.ListView 
         */
        listview: {
            get: function () {
                return this._listview;
            },
            set: function (val) {
                this._listview = val;
            }
        },

        /**
         * listview for zoomed out items (usually groups)
         * @field
         * @type WinJS.UI.ListView 
         */
        zoomedOutListview: {
            get: function () {
                return this._zoomedOutListview;
            },
            set: function (val) {
                this._zoomedOutListview = val;
            }
        },

        /**
         * dataManager datasource manager
         * @field
         * @type WinJSContrib.UI.DataSources.DataSourceManager 
         */
        dataManager: {
            get: function () {
                return this._dataManager;
            }
        },

        _initControl: function (options) {
            var semanticPlaceholder = document.createElement('DIV')
            semanticPlaceholder.style.width = '100%';
            semanticPlaceholder.style.height = '100%';

            var listviewPlaceholder = document.createElement('DIV');
            listviewPlaceholder.style.width = '100%';
            listviewPlaceholder.style.height = '100%';
            listviewPlaceholder.className = 'zoomedinlist';

            var zoomedOutListviewPlaceholder = document.createElement('DIV');
            zoomedOutListviewPlaceholder.style.width = '100%';
            zoomedOutListviewPlaceholder.style.height = '100%';
            zoomedOutListviewPlaceholder.className = 'zoomedoutlist';

            semanticPlaceholder.appendChild(listviewPlaceholder);
            semanticPlaceholder.appendChild(zoomedOutListviewPlaceholder);
            this.element.appendChild(semanticPlaceholder);

            this._listview = new WinJS.UI.ListView(listviewPlaceholder, options.listview);
            this._zoomedOutListview = new WinJS.UI.ListView(zoomedOutListviewPlaceholder, options.zoomedOutListview);

            this._semanticZoom = new WinJS.UI.SemanticZoom(semanticPlaceholder, options.semanticzoom);

            var dataOptions = options.data || {};
            dataOptions.listview = this._listview;
            dataOptions.zoomedOutListView = this._zoomedOutListview;
            this._dataManager = new ds.DataSourceManager(dataOptions);
        },

        /**
         * release control
         */
        dispose: function () {
            WinJS.Utilities.disposeSubTree(this.element);
        }
    }), WinJS.UI.DOMEventMixin, WinJS.Utilities.createEventProperties("myevent"));
})(WinJSContrib.UI.DataSources, WinJSContrib.UI.DataSources.Grouping);

if (WinJSContrib.UI.WebComponents) {
    WinJSContrib.UI.WebComponents.register('mcn-semanticlistviews', WinJSContrib.UI.SemanticListViews, {
        properties: [],
        controls: {
            "listview": WinJS.UI.ListView,
            "zoomedOutListview": WinJS.UI.ListView,
            "semanticZoom": WinJS.UI.SemanticZoom
        },
        map: {
            "DEFAULTGROUPLIMIT": { attribute: 'defaultGroupLimit', property: '_dataManager.defaultGroupLimit', resolve: true },
            "GROUPKIND": { attribute: 'groupKind', property: '_dataManager.groupKind', resolve: true },
            "FIELD": { attribute: 'field', property: '_dataManager.field', resolve: true },
            "ITEMS": { attribute: 'items', property: '_dataManager.items', resolve: true },
        }
    });
}

/** 
 * Custom grouping settings for {@link WinJSContrib.UI.DataSources.DataSourceManager}
 * @namespace 
 * @example
 * var datamgr = new WinJSContrib.UI.DataSources.DataSourceManager({
 *    defaultGroupLimit: 12,
 *    groupKind: WinJSContrib.UI.DataSources.Grouping.byField,
 *    field: 'metadata.genre',
 *    listview: page.zoomedInList,
 *    zoomedOutListView: page.zoomedOutList
 * });
 */
WinJSContrib.UI.DataSources.Grouping = WinJSContrib.UI.DataSources.Grouping || {};

(function (ds, gr) {
    "use strict";

    /**
     * alphabetic grouping, use "options.field" to define the property used for grouping
     * @param {Object} options grouping options
     * @returns {Object} group manager
     */
    WinJSContrib.UI.DataSources.Grouping.alphabetic = WinJS.Utilities.markSupportedForProcessing(function (options) {
        options = options || {};
        options.defaultGroupName = options.defaultGroupName || '#';

        options.compareGroups = options.compareGroups || function (left, right) {
            return left.toUpperCase().charCodeAt(0) - right.toUpperCase().charCodeAt(0);
        }

        options.getGroupKey = options.getGroupKey || function (dataItem) {
            if (!dataItem)
                return this.defaultGroupName;

            var val = WinJSContrib.Utils.readProperty(dataItem, this.field);
            if (!val || !val[0])
                return this.defaultGroupName;

            var key = val[0].toUpperCase();
            return key;
        }

        options.getGroupData = options.getGroupData || function (dataItem) {
            var val = '#';
            if (dataItem)
                val = WinJSContrib.Utils.readProperty(dataItem, this.field);
            if (!val || !val[0])
                val = this.defaultGroupName;

            var key = val[0].toUpperCase();
            return {
                title: key
            };
        }
        return options;
    });

    /**
     * grouping by a string field on items, use "options.field" to define the property used for grouping
     * @param {Object} options grouping options
     * @returns {Object} group manager
     */
    WinJSContrib.UI.DataSources.Grouping.byField = WinJS.Utilities.markSupportedForProcessing(function (options) {
        options.defaultGroupName = options.defaultGroupName || '#';

        options.compareGroups = options.compareGroups || function (a, b) {
            if (a > b)
                return 1;
            if (a < b)
                return -1;

            return 0;
        }

        options.getGroupKey = options.getGroupKey || function (dataItem) {
            if (!dataItem)
                return options.defaultGroupNam;

            var val = WinJSContrib.Utils.readProperty(dataItem, this.field);
            if (!val)
                return this.defaultGroupName;
            var key = val.toString();
            if (typeof val !== 'string' && (val.length != null && val.length != undefined)) {
                key = val.join(", ");
            }
            
            if (key.trim().length == 0)
                key = options.defaultGroupName;

            key = key.toUpperCase();

            return key || options.defaultGroupName;
        }

        options.getGroupData = options.getGroupData || function (dataItem) {
            var val = '#';
            if (dataItem)
                val = WinJSContrib.Utils.readProperty(dataItem, this.field);
            if (!val)
                val = this.defaultGroupName;

            var key = val.toString();
            if (typeof val !== 'string' && (val.length != null && val.length != undefined)) {
                key = val.join(", ");
            }
            
            if (key.trim().length == 0)
                key = options.defaultGroupName;

            return {
                title: key || options.defaultGroupName
            };
        }

        return options;
    });

    /**
     * grouping by year from a date field, use "options.field" to define the property used for grouping
     * @param {Object} options grouping options
     * @returns {Object} group manager
     */
    WinJSContrib.UI.DataSources.Grouping.byYear = WinJS.Utilities.markSupportedForProcessing(function (options) {
        options.defaultGroupName = options.defaultGroupName || '#';

        options.compareGroups = options.compareGroups || function (a, b) {
            if (a > b)
                return 1;
            if (a < b)
                return -1;

            return 0;
        }

        options.getGroupKey = options.getGroupKey || function (dataItem) {
            if (!dataItem)
                return this.defaultGroupName;

            var val = WinJSContrib.Utils.readProperty(dataItem, this.field);
            if (!val)
                return this.defaultGroupName;

            var key = new Date(new Date(new Date(val).setMonth(0, 1)).setHours(0, 0, 0, 0));
            return key.toISOString();
        }

        options.getGroupData = options.getGroupData || function (dataItem) {
            var val = '#';
            if (dataItem)
                val = WinJSContrib.Utils.readProperty(dataItem, this.field);
            if (!val)
                val = this.defaultGroupName;

            var key = new Date(new Date(new Date(val).setMonth(0, 1)).setHours(0, 0, 0, 0));
            return {
                title: key.getFullYear().toString(),
                date: key
            };
        }

        return options;
    });

    /**
     * grouping by month from a date field, use "options.field" to define the property used for grouping
     * @param {Object} options grouping options
     * @returns {Object} group manager
     */
    WinJSContrib.UI.DataSources.Grouping.byMonth = WinJS.Utilities.markSupportedForProcessing(function (options) {
        options.defaultGroupName = options.defaultGroupName || '#';

        options.compareGroups = options.compareGroups || function (a, b) {
            if (a > b)
                return 1;
            if (a < b)
                return -1;

            return 0;
        }

        options.getGroupKey = options.getGroupKey || function (dataItem) {
            if (!dataItem)
                return this.defaultGroupName;

            var val = WinJSContrib.Utils.readProperty(dataItem, this.field);
            if (!val)
                return this.defaultGroupName;

            var key = new Date(new Date(new Date(val).setDate(1)).setHours(0, 0, 0, 0));
            return key.toISOString();
        }

        options.getGroupData = options.getGroupData || function (dataItem) {
            var val = '#';
            if (dataItem)
                val = WinJSContrib.Utils.readProperty(dataItem, this.field);
            if (!val)
                val = this.defaultGroupName;

            var key = new Date(new Date(new Date(val).setDate(1)).setHours(0, 0, 0, 0));
            return {
                title: WinJSContrib.Utils.pad2(key.getMonth() + 1) + '-' + key.getFullYear().toString(),
                date: key
            };
        }

        return options;
    });

    /**
     * grouping by day from a date field, use "options.field" to define the property used for grouping
     * @param {Object} options grouping options
     * @returns {Object} group manager
     */
    WinJSContrib.UI.DataSources.Grouping.byDay = WinJS.Utilities.markSupportedForProcessing(function (options) {
        options.defaultGroupName = options.defaultGroupName || '#';

        options.compareGroups = options.compareGroups || function (a, b) {
            if (a > b)
                return 1;
            if (a < b)
                return -1;

            return 0;
        }

        options.getGroupKey = options.getGroupKey || function (dataItem) {
            if (!dataItem)
                return this.defaultGroupName;

            var val = WinJSContrib.Utils.readProperty(dataItem, this.field);
            if (!val)
                return this.defaultGroupName;

            var key = new Date(new Date(val).setHours(0, 0, 0, 0));
            return key.toISOString();
        }

        options.getGroupData = options.getGroupData || function (dataItem) {
            var val = '#';
            if (dataItem)
                val = WinJSContrib.Utils.readProperty(dataItem, this.field);
            if (!val)
                val = this.defaultGroupName;

            var key = new Date(new Date(val).setHours(0, 0, 0, 0));
            return {
                title: WinJSContrib.Utils.pad2(key.getMonth() + 1) + '-' + WinJSContrib.Utils.pad2(key.getDate()) + '-' + key.getFullYear().toString(),
                date: key
            };
        }

        return options;
    });

})(WinJSContrib.UI.DataSources, WinJSContrib.UI.DataSources.Grouping);
