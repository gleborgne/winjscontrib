module WinJSContrib.Search {
     export class IndexGroup {
        indexes: any;

        /**
         * group of indexes
         * @class WinJSContrib.Search.IndexGroup
         * @param {Object} definitions object containing definitions
         * @example
         * var idxgroup = new WinJSContrib.Search.IndexGroup({ peoples: { "firstname": { weight: 42 }} });
         */
        constructor (definitions) {
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
        public addIndex(name, definition, async, items): WinJS.Promise<any> {
            if (async)
                var idx = <any>new WinJSContrib.Search.IndexWorkerProxy(name, definition);
            else
                var idx = <any>new WinJSContrib.Search.Index(name, definition);


            this.indexes[name] = idx;
            if (items && items.length) {
                return idx.addRange(items).then(function () {
                    return idx;
                });
            }
            return WinJS.Promise.wrap(idx);
        }

        /**
         * add items to an index
         * @function WinJSContrib.Search.IndexGroup.prototype.addRange
         * @param {string} name index name
         * @params {Array} items array of items to index
         * @returns {WinJS.Promise}
         */
        public addRangefunction (name, items) {
            var idx =  this.indexes[name];
            if (idx && items && items.length) {
                return idx.addRange(items);
            }
            return WinJS.Promise.wrapError({ message: 'search index ' + name + ' not found' });
        }

        /**
         * search group's indexes
         * @function WinJSContrib.Search.IndexGroup.prototype.search
         * @param {string} querytext search query
         */
        public search(querytext) {
            var group = this;
            var searchresult = {
                hasResult: false,
                allResults: <ISearchResultItem[]>[]
            };

            function searchindex(name, index) {
                return index.search(querytext).then((res) => {
                    if (res && res.length) {
                        res.forEach((item) => {
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

            return WinJS.Promise.join(promises).then(() => {
                searchresult.allResults.sort(function (a, b) {
                    return b.rank - a.rank;
                });

                searchresult.hasResult = searchresult.allResults.length > 0;
                return searchresult;
            });
        }

        /**
         * save group indexes
         * @function WinJSContrib.Search.IndexGroup.prototype.save
         * @returns {WinJS.Promise}
         */
        public save() {
            var promises = [];
            for (var n in this.indexes) {
                promises.push(this.indexes[n].save());
            }
            return WinJS.Promise.join(promises);
        }

        /**
         * load group indexes
         * @function WinJSContrib.Search.IndexGroup.prototype.load
         * @returns {WinJS.Promise}
         */
        public load() {
            var promises = [];
            for (var n in this.indexes) {
                promises.push(this.indexes[n].load());
            }
            return WinJS.Promise.join(promises);
        }

        /**
         * release all indexes
         * @function WinJSContrib.Search.IndexGroup.prototype.dispose
         */
        public dispose() {
            for (var n in this.indexes) {
                this.indexes[n].dispose();
            }
            this.indexes = {};
        }
    }
}

    
