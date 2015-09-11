var WinJSContrib;
(function (WinJSContrib) {
    var Search;
    (function (Search) {
        var IndexGroup = (function () {
            /**
             * group of indexes
             * @class WinJSContrib.Search.IndexGroup
             * @param {Object} definitions object containing definitions
             * @example
             * var idxgroup = new WinJSContrib.Search.IndexGroup({ peoples: { "firstname": { weight: 42 }} });
             */
            function IndexGroup(definitions) {
                /**
                 * object containing indexes, stored by name
                 * @field
                 * @type Object
                 */
                this.indexes = {};
                if (definitions) {
                    for (var n in definitions) {
                        var elt = definitions[n];
                        if (!elt.useworker)
                            this.indexes[n] = new WinJSContrib.Search.Index(n, elt.definition);
                        else
                            this.indexes[n] = new WinJSContrib.Search.IndexWorkerProxy(n, elt.definition);
                    }
                }
            }
            /**
             * add an index to group
             * @function WinJSContrib.Search.IndexGroup.prototype.addIndex
             * @param {string} name index name
             * @param {WinJSContrib.Search.IndexDefinition} definition index definition
             * @params {boolean} async true if index must operate on a web worker
             * @params {Array} items array of items to index
             * @returns {WinJS.Promise}
             */
            IndexGroup.prototype.addIndex = function (name, definition, async, items) {
                if (async)
                    var idx = new WinJSContrib.Search.IndexWorkerProxy(name, definition);
                else
                    var idx = new WinJSContrib.Search.Index(name, definition);
                this.indexes[name] = idx;
                if (items && items.length) {
                    return idx.addRange(items).then(function () {
                        return idx;
                    });
                }
                return WinJS.Promise.wrap(idx);
            };
            /**
             * add items to an index
             * @function WinJSContrib.Search.IndexGroup.prototype.addRange
             * @param {string} name index name
             * @params {Array} items array of items to index
             * @returns {WinJS.Promise}
             */
            IndexGroup.prototype.addRangefunction = function (name, items) {
                var idx = this.indexes[name];
                if (idx && items && items.length) {
                    return idx.addRange(items);
                }
                return WinJS.Promise.wrapError({ message: 'search index ' + name + ' not found' });
            };
            /**
             * search group's indexes
             * @function WinJSContrib.Search.IndexGroup.prototype.search
             * @param {string} querytext search query
             */
            IndexGroup.prototype.search = function (querytext) {
                var group = this;
                var searchresult = {
                    hasResult: false,
                    allResults: []
                };
                function searchindex(name, index) {
                    return index.search(querytext).then(function (res) {
                        if (res && res.length) {
                            res.forEach(function (item) {
                                item.searchItemType = name;
                                searchresult.allResults.push(item);
                            });
                        }
                        searchresult[name] = res;
                    });
                }
                var promises = [];
                for (var n in this.indexes) {
                    promises.push(searchindex(n, this.indexes[n]));
                }
                return WinJS.Promise.join(promises).then(function () {
                    searchresult.allResults.sort(function (a, b) {
                        return b.rank - a.rank;
                    });
                    searchresult.hasResult = searchresult.allResults.length > 0;
                    return searchresult;
                });
            };
            /**
             * save group indexes
             * @function WinJSContrib.Search.IndexGroup.prototype.save
             * @returns {WinJS.Promise}
             */
            IndexGroup.prototype.save = function () {
                var promises = [];
                for (var n in this.indexes) {
                    promises.push(this.indexes[n].save());
                }
                return WinJS.Promise.join(promises);
            };
            /**
             * load group indexes
             * @function WinJSContrib.Search.IndexGroup.prototype.load
             * @returns {WinJS.Promise}
             */
            IndexGroup.prototype.load = function () {
                var promises = [];
                for (var n in this.indexes) {
                    promises.push(this.indexes[n].load());
                }
                return WinJS.Promise.join(promises);
            };
            /**
             * release all indexes
             * @function WinJSContrib.Search.IndexGroup.prototype.dispose
             */
            IndexGroup.prototype.dispose = function () {
                for (var n in this.indexes) {
                    this.indexes[n].dispose();
                }
                this.indexes = {};
            };
            return IndexGroup;
        })();
        Search.IndexGroup = IndexGroup;
    })(Search = WinJSContrib.Search || (WinJSContrib.Search = {}));
})(WinJSContrib || (WinJSContrib = {}));
