/* 
 * WinJS Contrib v2.1.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

var WinJSContrib;
(function (WinJSContrib) {
    var Search;
    (function (Search) {
        /*
         look at http://burakkanber.com/blog/machine-learning-full-text-search-in-javascript-relevance-scoring/
         */
        /**
         * definition for a field
         * @typedef {Object} WinJSContrib.Search.FieldDefinition
         * @property {number} weight weight of the item to rank search results
         * @example
         * { weight : 2}
         */
        /**
         * Definition of an index content
         * @typedef {Object} WinJSContrib.Search.IndexDefinition
         * @property {string} key name of the property considered as a key for the items
         * @property {Object} fields object containing item's property path as name, and {@link WinJSContrib.Search.FieldDefinition} as value
         * @example
         * { key: 'id', fields: { "title": { weight : 5}, "description.detail": { weight : 2}}}
         */
        /**
         * Small text search features based on objet indexing and text stemming. It's inspired by tools like Lucene.
         * For now indexes are stored with WinRT files, but it will soon be extended to support an extensible storage mecanism
         * @namespace WinJSContrib.Search
         */
        /**
         * path for search worker script file
         * @field WinJSContrib.Search.workerPath
         * @type {string}
         */
        Search.workerPath = './scripts/winjscontrib/winjscontrib.search.worker.js';
        function writeWinRTFile(folder, fileName, CreationCollisionOption, objectGraph) {
            return new WinJS.Promise(function (complete, error) {
                folder.createFileAsync(fileName, CreationCollisionOption).done(function (docfile) {
                    Windows.Storage.FileIO.writeTextAsync(docfile, JSON.stringify(objectGraph)).done(function () {
                        if (WinJS && WinJS.log)
                            WinJS.log("File written " + docfile.path);
                        complete();
                    }, error);
                }, error);
            });
        }
        Search.writeWinRTFile = writeWinRTFile;
        function openWinRTFile(folder, fileName) {
            return new WinJS.Promise(function (complete, error) {
                folder.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.openIfExists).then(function (file) {
                    Windows.Storage.FileIO.readTextAsync(file).done(function (text) {
                        if (text)
                            complete(JSON.parse(text));
                        else
                            complete();
                    }, error);
                }, error);
            });
        }
        Search.openWinRTFile = openWinRTFile;
    })(Search = WinJSContrib.Search || (WinJSContrib.Search = {}));
})(WinJSContrib || (WinJSContrib = {}));

var __global = this;
var WinJSContrib;
(function (WinJSContrib) {
    var Search;
    (function (Search) {
        var logger = WinJSContrib.Logs.getLogger("WinJSContrib.Search");
        var Index = (function () {
            /**
             * Search index
             * @class WinJSContrib.Search.Index
             * @classdesc
             * This class is the heart of the search engine. operations performed by this object are synchronous but exposes as promises.
             * This way Index is almost interchangeable with {@link WinJSContrib.Search.IndexWorkerProxy}
             * @param {string} name index name
             * @param {WinJSContrib.Search.IndexDefinition} definition index definition
             */
            function Index(name, definition, container) {
                this.items = [];
                this.storeData = true;
                var index = this;
                index.name = name || 'defaultIndex';
                index.definition = definition || {};
                index.items = [];
                index.storeData = true;
                index.onprogress = undefined;
                index.stopWords = WinJSContrib.Search.Stemming.StopWords.common;
                index.pipeline = new WinJSContrib.Search.Stemming.Pipeline(definition);
                if (container) {
                    index.container = container;
                }
                else if (WinJSContrib.DataContainer && WinJSContrib.DataContainer.current) {
                    index.container = WinJSContrib.DataContainer.current.child("WinJSContribSearch");
                }
                else if (__global.Windows) {
                    index.folderPromise = Windows.Storage.ApplicationData.current.localFolder.createFolderAsync("WinJSContribSearch", Windows.Storage.CreationCollisionOption.openIfExists).then(function (folder) {
                        return folder;
                    }, function (err) {
                        logger.error("Folder init error " + err.message);
                        return null;
                    });
                }
                else {
                    throw "You must provide at lease a default WinJSContrib.DataContainer to persist search index";
                }
            }
            /**
             * get number of items in index
             * @function WinJSContrib.Search.Index.prototype.count
             * @returns {WinJS.Promise}
             */
            Index.prototype.count = function () {
                return WinJS.Promise.wrap(this.items.length);
            };
            /**
             * clear index
             * @function WinJSContrib.Search.Index.prototype.clear
             * @returns {WinJS.Promise}
             */
            Index.prototype.clear = function () {
                this.items = [];
                return WinJS.Promise.wrap();
            };
            /**
             * release index
             * @function WinJSContrib.Search.Index.prototype.dispose
             */
            Index.prototype.dispose = function () {
                this.items = [];
                this.definition = undefined;
                this.stopWords = undefined;
                this.pipeline.clear();
                this.pipeline = undefined;
                this.onprogress = undefined;
                this.folderPromise = undefined;
            };
            /**
             * export index
             * @function WinJSContrib.Search.Index.prototype.export
             */
            Index.prototype.export = function () {
                return { definition: this.definition, items: this.items };
            };
            /**
             * serialize index to string
             * @function WinJSContrib.Search.Index.prototype.toString
             */
            Index.prototype.toString = function () {
                return JSON.stringify(this.export());
            };
            /**
             * load index from serialized string
             * @function WinJSContrib.Search.Index.prototype.loadData
             */
            Index.prototype.loadData = function (indexString) {
                var tmp = indexString;
                if (typeof tmp == 'String')
                    tmp = JSON.parse(indexString);
                if (tmp) {
                    if (tmp.definition && tmp.definition.fields && tmp.items && tmp.items.length) {
                        this.definition = tmp.definition;
                        this.pipeline.reload(this.definition);
                    }
                    this.items = tmp.items || [];
                }
            };
            /**
             * save index to storage
             * @function WinJSContrib.Search.Index.prototype.save
             * @returns {WinJS.Promise}
             */
            Index.prototype.save = function () {
                var _this = this;
                var exp = this.export();
                if (this.container) {
                    return this.container.save(this.name, exp);
                }
                else if (__global.Windows) {
                    return this.folderPromise.then(function (folder) {
                        return Search.writeWinRTFile(folder, _this.name, Windows.Storage.CreationCollisionOption.replaceExisting, exp).then(function (filename) {
                            return { index: _this };
                        });
                    });
                }
                else {
                    return WinJS.Promise.wrapError({ message: "you must provide a WinJSContrib.DataContainer to persist seach index" });
                }
            };
            /**
             * load index from storage
             * @function WinJSContrib.Search.Index.prototype.load
             * @returns {WinJS.Promise}
             */
            Index.prototype.load = function () {
                var _this = this;
                if (this.container) {
                    return this.container.read(this.name).then(function (savedidx) {
                        _this.loadData(savedidx);
                    });
                }
                else if (__global.Windows) {
                    return this.folderPromise.then(function (folder) {
                        return Search.openWinRTFile(folder, _this.name).then(function (savedidx) {
                            _this.loadData(savedidx);
                        });
                    });
                }
                else {
                    return WinJS.Promise.wrapError({ message: "you must provide a WinJSContrib.DataContainer to persist seach index" });
                }
            };
            Index.prototype._runSearch = function (querytext, options) {
                var index = this;
                var preparedTokens = index.processText(querytext);
                var searchResult = [];
                var size = index.items.length;
                var lastprogress = -1;
                for (var i = 0; i < size; i++) {
                    var itemResult = index._searchItem(preparedTokens, index.items[i]);
                    if (itemResult) {
                        searchResult.push(itemResult);
                    }
                    var p = (100 * i / size) << 0;
                    if (index.onprogress && p != lastprogress)
                        index.onprogress({ progressPercent: p, items: size, current: i });
                    lastprogress = p;
                }
                searchResult = searchResult.sort(function (a, b) {
                    return b.rank - a.rank;
                });
                if (options && options.limit) {
                    searchResult = searchResult.slice(0, options.limit);
                }
                return searchResult;
            };
            /**
             * search index
             * @function WinJSContrib.Search.Index.prototype.search
             * @param {string} querytext
             * @returns {WinJS.Promise} search result
             */
            Index.prototype.search = function (querytext, options) {
                return WinJS.Promise.wrap(this._runSearch(querytext, options));
            };
            Index.prototype._searchItem = function (searchtokens, indexitem) {
                var index = this;
                var size = indexitem.items.length;
                var points = 0;
                for (var i = 0; i < size; i++) {
                    var tokenitem = indexitem.items[i];
                    if (searchtokens.untokenized && tokenitem.tokens.untokenized == searchtokens.untokenized) {
                        points += 4 * tokenitem.weight;
                    }
                    if (searchtokens.untokenized && tokenitem.tokens.untokenized && tokenitem.tokens.untokenized.indexOf(searchtokens.untokenized) >= 0) {
                        points += 2 * tokenitem.weight;
                    }
                    for (var t = 0; t < tokenitem.tokens.items.length; t++) {
                        var token = tokenitem.tokens.items[t];
                        for (var s = 0; s < searchtokens.items.length; s++) {
                            var stoken = searchtokens.items[s];
                            if (stoken.length > 1 && token == stoken) {
                                points += tokenitem.weight;
                            }
                            if (stoken.length > 2 && token.indexOf(stoken) >= 0) {
                                points += tokenitem.weight * 0.2;
                            }
                        }
                    }
                }
                if (points) {
                    return { rank: points, key: indexitem.key, item: indexitem.rawdata };
                }
            };
            /**
             * set index definition
             * @function WinJSContrib.Search.Index.prototype.define
             */
            Index.prototype.define = function (obj) {
                this.definition = obj;
            };
            Index.prototype._add = function (obj) {
                var index = this;
                var key = undefined;
                var def = index.definition;
                var res = {
                    items: [],
                    rawdata: undefined,
                    key: undefined
                };
                if (!def || !def.fields)
                    return;
                if (index.storeData)
                    res.rawdata = obj;
                if (def.key)
                    res.key = WinJSContrib.Utils.readProperty(obj, def.key);
                for (var elt in def.fields) {
                    if (def.fields.hasOwnProperty(elt)) {
                        var item = def.fields[elt];
                        var weight = item.weight || 1;
                        var value = WinJSContrib.Utils.readProperty(obj, elt.split('.'));
                        if (value) {
                            var valueType = typeof value;
                            if (valueType !== 'string' && (value.length !== null && value.length !== undefined)) {
                                for (var i = 0, l = value.length; i < l; i++) {
                                    var item = value[i];
                                    if (item && typeof item == 'string') {
                                        res.items.push({ tokens: index.processText(item), weight: weight });
                                    }
                                }
                            }
                            else if (valueType === 'string') {
                                res.items.push({ tokens: index.processText(value), weight: weight });
                            }
                            else {
                                logger.warn(elt + " is of type " + valueType);
                            }
                        }
                    }
                }
                index.items.push(res);
                return WinJS.Promise.wrap(res);
            };
            /**
             * add an object to index
             * @function WinJSContrib.Search.Index.prototype.add
             * @param {Object} obj object to index
             * @param {WinJSContrib.Search.IndexDefinition} definition index definition (optional), use index's definition if not defined
             * @returns {WinJS.Promise}
             */
            Index.prototype.add = function (obj) {
                return WinJS.Promise.wrap(this._add(obj));
            };
            /**
             * add an array of objects to index
             * @function WinJSContrib.Search.Index.prototype.addRange
             * @param {Array} items items array
             * @returns {WinJS.Promise}
             */
            Index.prototype.addRange = function (arr, progress) {
                var index = this;
                var size = arr.length;
                var indexed = [];
                var lastprogress = -1;
                for (var i = 0; i < size; i++) {
                    var item = index._add(arr[i]);
                    if (item)
                        indexed.push(item);
                    var p = (100 * i / size) << 0;
                    if (progress && p != lastprogress)
                        progress({ progressPercent: p, items: size, current: i });
                    lastprogress = p;
                }
                return WinJS.Promise.wrap({ indexed: indexed.length });
            };
            Index.prototype.refresh = function () {
                var index = this;
                var old = index.items;
                var size = old.length;
                index.items = [];
                for (var i = 0; i < size; i++) {
                    var item = index.items[i];
                    index.add(item.rawdata);
                }
            };
            /**
             * prepare a text for search by applying stemming and tokenizing text
             * @function WinJSContrib.Search.Index.prototype.processText
             * @param {string} text
             */
            Index.prototype.processText = function (text) {
                if (typeof text == "number")
                    text = text.toString();
                var tokens = this.tokenize(text);
                var res = [];
                var size = tokens.length;
                for (var i = 0; i < size; i++) {
                    var txt = this.pipeline.run(tokens[i]);
                    if (txt.length > 1)
                        res.push(txt);
                }
                return { items: res, untokenized: this.pipeline.run(text) };
            };
            /**
             * Check if a word is a stopword
             * @function WinJSContrib.Search.Index.prototype.checkWord
             * @param {string} word
             */
            Index.prototype.checkWord = function (token) {
                var size = this.stopWords.length;
                for (var i = 0; i < size; i++) {
                    if (token == this.stopWords[i])
                        return '';
                }
                return token;
            };
            /**
             * split a string into words
             * @function WinJSContrib.Search.Index.prototype.tokenize
             * @param {string} text
             */
            Index.prototype.tokenize = function (token) {
                var index = this;
                var tokens = [];
                if (!token || !token.split)
                    return tokens;
                var words = token.split(/\W+/);
                for (var i = 0; i < words.length; i++) {
                    if (words[i].length > 0) {
                        tokens.push(words[i]);
                    }
                }
                return tokens;
            };
            return Index;
        })();
        Search.Index = Index;
    })(Search = WinJSContrib.Search || (WinJSContrib.Search = {}));
})(WinJSContrib || (WinJSContrib = {}));

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

var WinJSContrib;
(function (WinJSContrib) {
    var Search;
    (function (Search) {
        var IndexWorkerProxy = (function () {
            /**
             * @classdesc
             * Proxy for a {@link WinJSContrib.Search.Index} running in a web worker
             * @class
             * @param {string} name index name
             * @param {WinJSContrib.Search.IndexDefinition} definition index definition
             * @param {string} workerpath path for web worker script file (optional)
             */
            function IndexWorkerProxy(name, definition, workerpath) {
                var wrapper = this;
                wrapper.worker = new WinJSContrib.Messenger.SmartWorker(workerpath || WinJSContrib.Search.workerPath);
                wrapper.init(name, definition);
            }
            /**
             * initialize worker
             * @function WinJSContrib.Search.IndexWorkerProxy.prototype.init
             * @param {string} name
             * @param {WinJSContrib.Search.IndexDefinition} definition index definition (optional), use index's definition if not defined
             * @returns {WinJS.Promise}
             */
            IndexWorkerProxy.prototype.init = function (name, definition, load) {
                return this.worker.start('init', { name: name, load: load, definition: definition });
            };
            /**
             * start search
             * @function WinJSContrib.Search.IndexWorkerProxy.prototype.search
             * @param {string} searchTerm search query
             * @param {Object} options
             * @returns {WinJS.Promise}
             */
            IndexWorkerProxy.prototype.search = function (searchTerm, options) {
                return this.worker.start('search', { searchTerm: searchTerm, options: options });
            };
            /**
             * get the number of items in index
             * @function WinJSContrib.Search.IndexWorkerProxy.prototype.count
             * @returns {WinJS.Promise}
             */
            IndexWorkerProxy.prototype.count = function () {
                return this.worker.start('count');
            };
            /**
             * add an object to index
             * @function WinJSContrib.Search.IndexWorkerProxy.prototype.add
             * @param {Object} obj object to index
             * @param {Object} options
             * @returns {WinJS.Promise}
             */
            IndexWorkerProxy.prototype.add = function (data, options) {
                return this.worker.start('index', { items: [data], options: options });
            };
            /**
             * add an array of objects to index
             * @function WinJSContrib.Search.IndexWorkerProxy.prototype.addRange
             * @param {Array} items items array
             * @param {Object} options
             * @returns {WinJS.Promise}
             */
            IndexWorkerProxy.prototype.addRange = function (data, options) {
                return this.worker.start('index', { items: data, options: options });
            };
            /**
             * release proxy
             * @function WinJSContrib.Search.IndexWorkerProxy.prototype.dispose
             */
            IndexWorkerProxy.prototype.dispose = function () {
                this.worker.dispose();
            };
            /**
             * clear index
             * @function WinJSContrib.Search.IndexWorkerProxy.prototype.clear
             * @returns {WinJS.Promise}
             */
            IndexWorkerProxy.prototype.clear = function () {
                return this.worker.start('clear');
            };
            /**
             * load index from storage
             * @function WinJSContrib.Search.IndexWorkerProxy.prototype.load
             * @returns {WinJS.Promise}
             */
            IndexWorkerProxy.prototype.load = function () {
                return this.worker.start('load');
            };
            /**
             * save index to storage
             * @function WinJSContrib.Search.IndexWorkerProxy.prototype.save
             * @returns {WinJS.Promise}
             */
            IndexWorkerProxy.prototype.save = function () {
                return this.worker.start('save');
            };
            return IndexWorkerProxy;
        })();
        Search.IndexWorkerProxy = IndexWorkerProxy;
    })(Search = WinJSContrib.Search || (WinJSContrib.Search = {}));
})(WinJSContrib || (WinJSContrib = {}));

var WinJSContrib;
(function (WinJSContrib) {
    var Search;
    (function (Search) {
        var Stemming;
        (function (Stemming) {
            /**
             * @namespace
             */
            var Pipeline = (function () {
                /**
                 * stemming pipeline
                 * @class WinJSContrib.Search.Stemming.Pipeline
                 */
                function Pipeline(definition) {
                    this.reload = function (definition) {
                        var pipe = this;
                        var sets = WinJSContrib.Search.Stemming.Presets;
                        var ops = WinJSContrib.Search.Stemming.Op;
                        pipe._processors = [];
                        var processorNames = null;
                        if (definition) {
                            var type = typeof definition.stemming;
                            if (type === 'string') {
                                processorNames = sets[definition.stemming];
                            }
                            else if (definition.stemming && definition.stemming.length) {
                                processorNames = definition.stemming;
                            }
                        }
                        if (!processorNames) {
                            processorNames = WinJSContrib.Search.Stemming.Presets.standard;
                        }
                        processorNames.forEach(function (name) {
                            var processor = ops[name];
                            if (processor) {
                                pipe._processors.push(processor);
                            }
                        });
                    };
                    this.reload(definition);
                }
                /**
                 * add a stemming function to pipeline
                 * @function WinJSContrib.Search.Stemming.Pipeline.prototype.add
                 * @param {function} callback stemming function
                 */
                Pipeline.prototype.add = function (callback) {
                    this._processors.push(callback);
                };
                /**
                 * @function WinJSContrib.Search.Stemming.Pipeline.prototype.clear
                 * remove all stemming functions from pipeline
                 */
                Pipeline.prototype.clear = function () {
                    this._processors = [];
                };
                /**
                 * apply stemming pipeline to text
                 * @function WinJSContrib.Search.Stemming.Pipeline.prototype.run
                 * @param {string} text
                 */
                Pipeline.prototype.run = function (text) {
                    var size = this._processors.length;
                    var res = text;
                    for (var i = 0; i < size; i++) {
                        res = this._processors[i](res);
                    }
                    return res;
                };
                return Pipeline;
            })();
            Stemming.Pipeline = Pipeline;
        })(Stemming = Search.Stemming || (Search.Stemming = {}));
    })(Search = WinJSContrib.Search || (WinJSContrib.Search = {}));
})(WinJSContrib || (WinJSContrib = {}));
var WinJSContrib;
(function (WinJSContrib) {
    var Search;
    (function (Search) {
        var Stemming;
        (function (Stemming) {
            var Presets;
            (function (Presets) {
                Presets.standard = [
                    "lowerCase",
                    "removeDiacritics"
                ];
                Presets.full = [
                    "lowerCase",
                    "removeDiacritics",
                    "dedup",
                    "dropInitialLetters",
                    "dropBafterMAtEnd",
                    "transformCK",
                    "cTransform",
                    "dTransform",
                    "dropG",
                    "transformG",
                    "dropH",
                    "transformPH",
                    "transformQ",
                    "transformS",
                    "transformX",
                    "transformT",
                    "dropT",
                    "transformV",
                    "transformWH",
                    "dropW",
                    "dropY",
                    "transformZ"
                ];
            })(Presets = Stemming.Presets || (Stemming.Presets = {}));
        })(Stemming = Search.Stemming || (Search.Stemming = {}));
    })(Search = WinJSContrib.Search || (WinJSContrib.Search = {}));
})(WinJSContrib || (WinJSContrib = {}));
var WinJSContrib;
(function (WinJSContrib) {
    var Search;
    (function (Search) {
        var Stemming;
        (function (Stemming) {
            var StopWords;
            (function (StopWords) {
                /**
                * common stop words
                * @field WinJSContrib.Search.Stemming.StopWords.common
                */
                StopWords.common = [
                    //french
                    "de",
                    "du",
                    "des",
                    "le",
                    "la",
                    "les",
                    "te",
                    "ta",
                    "ton",
                    "tes",
                    "un",
                    "une",
                    "et",
                    "ou",
                    "mais",
                    "pour",
                    "par",
                    "avec",
                    "si",
                    //english
                    "a",
                    "able",
                    "about",
                    "across",
                    "after",
                    "all",
                    "almost",
                    "also",
                    "am",
                    "among",
                    "an",
                    "and",
                    "any",
                    "are",
                    "as",
                    "at",
                    "be",
                    "because",
                    "been",
                    "but",
                    "by",
                    "can",
                    "cannot",
                    "could",
                    "dear",
                    "did",
                    "do",
                    "does",
                    "either",
                    "else",
                    "ever",
                    "every",
                    "for",
                    "from",
                    "get",
                    "got",
                    "had",
                    "has",
                    "have",
                    "he",
                    "her",
                    "hers",
                    "him",
                    "his",
                    "how",
                    "however",
                    "i",
                    "if",
                    "in",
                    "into",
                    "is",
                    "it",
                    "its",
                    "just",
                    "least",
                    "let",
                    "like",
                    "likely",
                    "may",
                    "me",
                    "might",
                    "most",
                    "must",
                    "my",
                    "neither",
                    "no",
                    "nor",
                    "not",
                    "of",
                    "off",
                    "often",
                    "on",
                    "only",
                    "or",
                    "other",
                    "our",
                    "own",
                    "rather",
                    "said",
                    "say",
                    "says",
                    "she",
                    "should",
                    "since",
                    "so",
                    "some",
                    "than",
                    "that",
                    "the",
                    "their",
                    "them",
                    "then",
                    "there",
                    "these",
                    "they",
                    "this",
                    "tis",
                    "to",
                    "too",
                    "twas",
                    "us",
                    "wants",
                    "was",
                    "we",
                    "were",
                    "what",
                    "when",
                    "where",
                    "which",
                    "while",
                    "who",
                    "whom",
                    "why",
                    "will",
                    "with",
                    "would",
                    "yet",
                    "you",
                    "your"
                ];
            })(StopWords = Stemming.StopWords || (Stemming.StopWords = {}));
        })(Stemming = Search.Stemming || (Search.Stemming = {}));
    })(Search = WinJSContrib.Search || (WinJSContrib.Search = {}));
})(WinJSContrib || (WinJSContrib = {}));
var WinJSContrib;
(function (WinJSContrib) {
    var Search;
    (function (Search) {
        var Stemming;
        (function (Stemming) {
            var Op;
            (function (Op) {
                /**
                 * built-in stemmings
                 * @namespace
                 */
                /**
                 *
                 */
                function lowerCase(token) {
                    if (!token)
                        return;
                    return token.toLowerCase();
                }
                Op.lowerCase = lowerCase;
                /**
                 *
                 */
                function dedup(token) {
                    if (!token)
                        return;
                    return token.replace(/([^c])\1/g, '$1');
                }
                Op.dedup = dedup;
                /**
                 *
                 */
                function dropInitialLetters(token) {
                    if (!token)
                        return;
                    if (token.match(/^(kn|gn|pn|ae|wr)/))
                        return token.substr(1, token.length - 1);
                    return token;
                }
                Op.dropInitialLetters = dropInitialLetters;
                /**
                 *
                 */
                function dropBafterMAtEnd(token) {
                    if (!token)
                        return;
                    return token.replace(/mb$/, 'm');
                }
                Op.dropBafterMAtEnd = dropBafterMAtEnd;
                /**
                 *
                 */
                function cTransform(token) {
                    if (!token)
                        return;
                    token = token.replace(/([^s]|^)(c)(h)/g, '$1x$3').trim();
                    token = token.replace(/cia/g, 'xia');
                    token = token.replace(/c(i|e|y)/g, 's$1');
                    token = token.replace(/c/g, 'k');
                    return token;
                }
                Op.cTransform = cTransform;
                /**
                 *
                 */
                function dTransform(token) {
                    if (!token)
                        return;
                    token = token.replace(/d(ge|gy|gi)/g, 'j$1');
                    token = token.replace(/d/g, 't');
                    return token;
                }
                Op.dTransform = dTransform;
                /**
                 *
                 */
                function dropG(token) {
                    if (!token)
                        return;
                    token = token.replace(/gh(^$|[^aeiou])/g, 'h$1');
                    token = token.replace(/g(n|ned)$/g, '$1');
                    return token;
                }
                Op.dropG = dropG;
                /**
                 *
                 */
                function transformG(token) {
                    if (!token)
                        return;
                    token = token.replace(/([^g]|^)(g)(i|e|y)/g, '$1j$3');
                    token = token.replace(/gg/g, 'g');
                    token = token.replace(/g/g, 'k');
                    return token;
                }
                Op.transformG = transformG;
                /**
                 *
                 */
                function dropH(token) {
                    if (!token)
                        return;
                    return token.replace(/([aeiou])h([^aeiou])/g, '$1$2');
                }
                Op.dropH = dropH;
                /**
                 *
                 */
                function transformCK(token) {
                    if (!token)
                        return;
                    return token.replace(/ck/g, 'k');
                }
                Op.transformCK = transformCK;
                /**
                 *
                 */
                function transformPH(token) {
                    if (!token)
                        return;
                    return token.replace(/ph/g, 'f');
                }
                Op.transformPH = transformPH;
                /**
                 *
                 */
                function transformQ(token) {
                    if (!token)
                        return;
                    return token.replace(/q/g, 'k');
                }
                Op.transformQ = transformQ;
                /**
                 *
                 */
                function transformS(token) {
                    if (!token)
                        return;
                    return token.replace(/s(h|io|ia)/g, 'x$1');
                }
                Op.transformS = transformS;
                /**
                 *
                 */
                function transformT(token) {
                    if (!token)
                        return;
                    token = token.replace(/t(ia|io)/g, 'x$1');
                    token = token.replace(/th/, '0');
                    return token;
                }
                Op.transformT = transformT;
                /**
                 *
                 */
                function dropT(token) {
                    if (!token)
                        return;
                    return token.replace(/tch/g, 'ch');
                }
                Op.dropT = dropT;
                /**
                 *
                 */
                function transformV(token) {
                    if (!token)
                        return;
                    return token.replace(/v/g, 'f');
                }
                Op.transformV = transformV;
                /**
                 *
                 */
                function transformWH(token) {
                    if (!token)
                        return;
                    return token.replace(/^wh/, 'w');
                }
                Op.transformWH = transformWH;
                /**
                 *
                 */
                function dropW(token) {
                    if (!token)
                        return;
                    return token.replace(/w([^aeiou]|$)/g, '$1');
                }
                Op.dropW = dropW;
                /**
                 *
                 */
                function transformX(token) {
                    if (!token)
                        return;
                    token = token.replace(/^x/, 's');
                    token = token.replace(/x/g, 'ks');
                    return token;
                }
                Op.transformX = transformX;
                /**
                 *
                 */
                function dropY(token) {
                    if (!token)
                        return;
                    return token.replace(/y([^aeiou]|$)/g, '$1');
                }
                Op.dropY = dropY;
                /**
                 *
                 */
                function transformZ(token) {
                    if (!token)
                        return;
                    return token.replace(/z/, 's');
                }
                Op.transformZ = transformZ;
                /**
                 *
                 */
                function dropVowels(token) {
                    if (!token)
                        return;
                    return token.charAt(0) + token.substr(1, token.length).replace(/[aeiou]/g, '');
                }
                Op.dropVowels = dropVowels;
                /**
                 *
                 */
                function removeDiacritics(s) {
                    if (!s)
                        return;
                    var r = s.toLowerCase();
                    r = r.replace(new RegExp("/.../g", 'g'), " ");
                    r = r.replace(new RegExp("[àáâãäå]", 'g'), "a");
                    r = r.replace(new RegExp("æ", 'g'), "ae");
                    r = r.replace(new RegExp("ç", 'g'), "c");
                    r = r.replace(new RegExp("[èéêë]", 'g'), "e");
                    r = r.replace(new RegExp("[ìíîï]", 'g'), "i");
                    r = r.replace(new RegExp("ñ", 'g'), "n");
                    r = r.replace(new RegExp("[òóôõö]", 'g'), "o");
                    r = r.replace(new RegExp("œ", 'g'), "oe");
                    r = r.replace(new RegExp("[ùúûü]", 'g'), "u");
                    r = r.replace(new RegExp("[ýÿ]", 'g'), "y");
                    r = r.replace(new RegExp("['\"]", 'g'), " ");
                    return r;
                }
                Op.removeDiacritics = removeDiacritics;
            })(Op = Stemming.Op || (Stemming.Op = {}));
        })(Stemming = Search.Stemming || (Search.Stemming = {}));
    })(Search = WinJSContrib.Search || (WinJSContrib.Search = {}));
})(WinJSContrib || (WinJSContrib = {}));

//# sourceMappingURL=winjscontrib.search.js.map