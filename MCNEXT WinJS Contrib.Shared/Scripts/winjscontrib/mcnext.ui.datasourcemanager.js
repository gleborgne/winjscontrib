var MCNEXT = MCNEXT || {};
MCNEXT.UI = MCNEXT.UI || {};
MCNEXT.UI.DataSources = MCNEXT.UI.DataSources || {};
MCNEXT.UI.DataSources.Grouping = MCNEXT.UI.DataSources.Grouping || {};

(function (ds, gr) {
    "use strict";

    ds.DataSourceManager = WinJS.Class.mix(WinJS.Class.define(function (options) {
        this.groupedList = null;
        this.list = null;
        this.defaultGroupLimit = 0;
        this.filters = new WinJS.Binding.List();
        this.filters.onitemchanged = this.init.bind(this);
        this.filters.oniteminserted = this.init.bind(this);
        this.filters.onitemremoved = this.init.bind(this);
        this.apply(options);
    },
    {
        apply: function (options) {
            options = options || {};

            if (options.field) this.field = options.field;
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

        groupKind: {
            get: function () {
                return this._groupKind;
            },
            set: function (val) {
                if (val && val != this._groupKind) {
                    this._groupKind = val;
                    this.apply({ groupKind: val });
                    this.init();
                }
            }
        },

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
            var res = true;

            if (this.filter)
                res = res & this.filter(item);
            if (this.filters.length) {
                for (var i = 0 ; i < this.filters.length ; i++) {
                    var filter = this.filters.getAt(i);
                    res = res & filter(item);
                    if (!res)
                        break;
                }
            }

            return res;
        },

        refresh: function () {
            this.init();
        },

        init: function (dontAttach) {
            this.detach();
            if (this.items) {
                this.list = new WinJS.Binding.List(this.items);

                if (this.filter || this.filters.length) {
                    this.filteredlist = this.list.createFiltered(this._filterItems.bind(this));
                }
                else {
                    this.filteredlist = this.list;
                }

                if (this.getGroupKey && this.getGroupData && this.compareGroups) {
                    this.groupedList = this.filteredlist.createGrouped(this.getGroupKey.bind(this), this.getGroupData.bind(this), this.compareGroups.bind(this));
                }

                if (!dontAttach)
                    this.attach();
            }
        },

        prepareItems: function (items) {
            this.detach();
            this._items = items;
            this.init(true);
        },

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
                else if (this.filteredlist && this.filteredlist.length >= this.defaultGroupLimit) {
                    this.listview.itemDataSource = this.filteredlist.dataSource;
                    this.listview.groupDataSource = null;
                    var semzoom = this.parentSemanticZoom();
                    if (semzoom) {
                        semzoom.locked = true;
                    }
                }
                else {
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

        parentSemanticZoom: function () {
            var parent = this.listview.element.parentElement;
            while (parent) {
                if (parent.classList.contains('win-semanticzoom'))
                    return parent.winControl;
                parent = parent.parentElement;
            }
        },

        detach: function () {
            if (this.listview) {
                this.listview.itemDataSource = null;
                this.listview.groupDataSource = null;
                if (this.zoomedOutListView)
                    this.zoomedOutListView.itemDataSource = null;
            }
        }
    }), WinJS.UI.DOMEventMixin);

    MCNEXT.UI.SemanticListViews = WinJS.Class.mix(WinJS.Class.define(function ctor(element, options) {
        this.element = element || document.createElement('DIV');
        options = options || {};
        this.element.winControl = this;
        this.element.classList.add('win-disposable');
        WinJS.UI.setOptions(this, options);
        this._initControl(options);
    }, {
        semanticZoom: {
            get: function () {
                return this._semanticZoom;
            }
        },
        listview: {
            get: function () {
                return this._listview;
            }
        },
        zoomedOutListview: {
            get: function () {
                return this._zoomedOutListview;
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
            this.dataManager = new ds.DataSourceManager(dataOptions);
        },

        dispose: function () {
            WinJS.Utilities.disposeSubTree(this.element);
        }
    }), WinJS.UI.DOMEventMixin, WinJS.Utilities.createEventProperties("myevent"));
})(MCNEXT.UI.DataSources, MCNEXT.UI.DataSources.Grouping);

(function (ds, gr) {
    "use strict";
    gr.alphabetic = WinJS.Utilities.markSupportedForProcessing(function (options) {
        options = options || {};
        options.defaultGroupName = options.defaultGroupName || '#';

        options.compareGroups = options.compareGroups || function (left, right) {
            return left.toUpperCase().charCodeAt(0) - right.toUpperCase().charCodeAt(0);
        }

        options.getGroupKey = options.getGroupKey || function (dataItem) {
            if (!dataItem)
                return this.defaultGroupName;

            var val = MCNEXT.Utils.readProperty(dataItem, this.field);
            if (!val)
                return this.defaultGroupName;

            var key = val[0].toUpperCase();
            return key;
        }

        options.getGroupData = options.getGroupData || function (dataItem) {
            var val = '#';
            if (dataItem)
                val = MCNEXT.Utils.readProperty(dataItem, this.field);
            if (!val)
                val = this.defaultGroupName;

            var key = val[0].toUpperCase();
            return {
                title: key
            };
        }
        return options;
    });

    gr.byField = WinJS.Utilities.markSupportedForProcessing(function (options) {
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

            var val = MCNEXT.Utils.readProperty(dataItem, this.field);
            if (!val)
                return this.defaultGroupName;

            var key = val.toUpperCase();
            return key;
        }

        options.getGroupData = options.getGroupData || function (dataItem) {
            var val = '#';
            if (dataItem)
                val = MCNEXT.Utils.readProperty(dataItem, this.field);
            if (!val)
                val = this.defaultGroupName;

            var key = val;
            return {
                title: key
            };
        }

        return options;
    });

    gr.byYear = WinJS.Utilities.markSupportedForProcessing(function (options) {
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

            var val = MCNEXT.Utils.readProperty(dataItem, this.field);
            if (!val)
                return this.defaultGroupName;

            var key = new Date(new Date(new Date(val).setMonth(0, 1)).setHours(0, 0, 0, 0));
            return key.toISOString();
        }

        options.getGroupData = options.getGroupData || function (dataItem) {
            var val = '#';
            if (dataItem)
                val = MCNEXT.Utils.readProperty(dataItem, this.field);
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

    gr.byMonth = WinJS.Utilities.markSupportedForProcessing(function (options) {
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

            var val = MCNEXT.Utils.readProperty(dataItem, this.field);
            if (!val)
                return this.defaultGroupName;

            var key = new Date(new Date(new Date(val).setDate(1)).setHours(0, 0, 0, 0));
            return key.toISOString();
        }

        options.getGroupData = options.getGroupData || function (dataItem) {
            var val = '#';
            if (dataItem)
                val = MCNEXT.Utils.readProperty(dataItem, this.field);
            if (!val)
                val = this.defaultGroupName;

            var key = new Date(new Date(new Date(val).setDate(1)).setHours(0, 0, 0, 0));
            return {
                title: MCNEXT.Utils.pad2(key.getMonth() + 1) + '-' + key.getFullYear().toString(),
                date: key
            };
        }

        return options;
    });

    gr.byDay = WinJS.Utilities.markSupportedForProcessing(function (options) {
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

            var val = MCNEXT.Utils.readProperty(dataItem, this.field);
            if (!val)
                return this.defaultGroupName;

            var key = new Date(new Date(val).setHours(0, 0, 0, 0));
            return key.toISOString();
        }

        options.getGroupData = options.getGroupData || function (dataItem) {
            var val = '#';
            if (dataItem)
                val = MCNEXT.Utils.readProperty(dataItem, this.field);
            if (!val)
                val = this.defaultGroupName;

            var key = new Date(new Date(val).setHours(0, 0, 0, 0));
            return {
                title: MCNEXT.Utils.pad2(key.getMonth() + 1) + '-' + MCNEXT.Utils.pad2(key.getDate()) + '-' + key.getFullYear().toString(),
                date: key
            };
        }

        return options;
    });

})(MCNEXT.UI.DataSources, MCNEXT.UI.DataSources.Grouping);