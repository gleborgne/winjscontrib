//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

//this provide a basic search and indexing algorythms to implement local search in your apps

var WinJSContrib = WinJSContrib || {};


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
 * @namespace
 */
WinJSContrib.Search = WinJSContrib.Search || {};

(function () {
    "use strict";

    /**     
     * path for search worker script file
     * @field
     * @type {string}
     */
    WinJSContrib.Search.workerPath = './scripts/winjscontrib/winjscontrib.search.worker.js';

    /**
     * group of indexes
     * @class
     * @param {Object} definitions object containing definitions
     * @example
     * var idxgroup = new WinJSContrib.Search.IndexGroup({ peoples: { "firstname": { weight: 42 }} });
     */
    WinJSContrib.Search.IndexGroup = function (definitions) {
        /**         
         * object containing indexes, stored by name
         * @field
         * @type Object 
         */
        this.indexes = {};
        if (definitions) {
            for (var n in definitions) {
                var elt = definitions[n];
                if (elt.async)
                    this.indexes[n] = new WinJSContrib.Search.Index(n, elt.definition);
                else
                    this.indexes[n] = new WinJSContrib.Search.IndexWorkerProxy(n, elt.definition);
            }
        }
    }

    /**
     * add an index to group
     * @param {string} name index name
     * @param {WinJSContrib.Search.IndexDefinition} definition index definition
     * @params {boolean} async true if index must operate on a web worker
     * @params {Array} items array of items to index
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Search.IndexGroup.prototype.addIndex = function (name, definition, async, items) {
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
    }

    /**
     * add items to an index
     * @param {string} name index name
     * @params {Array} items array of items to index
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Search.IndexGroup.prototype.addRange = function (name, items) {
        var idx =  this.indexes[name];
        if (idx && items && items.length) {
            return idx.addRange(items);
        }
        return WinJS.Promise.wrapError({ message: 'search index ' + name + ' not found' });
    }

    /**
     * search group's indexes
     * @param {string} querytext search query
     */
    WinJSContrib.Search.IndexGroup.prototype.search = function (querytext) {
        var group = this;
        var searchresult = { hasResult: false, allResults: [] };

        function searchindex(name, index) {
            return index.search(querytext).then(function (res) {
                if (res && res.length) {
                    res.forEach(function (item) {
                        item.searchItemType = n;
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
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Search.IndexGroup.prototype.save = function () {
        var promises = [];
        for (var n in this.indexes) {
            promises.push(this.indexes[n].save());
        }
        return WinJS.Promise.join(promises);
    };

    /**
     * load group indexes
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Search.IndexGroup.prototype.load = function () {
        var promises = [];
        for (var n in this.indexes) {
            promises.push(this.indexes[n].load());
        }
        return WinJS.Promise.join(promises);
    };

    /**
     * release all indexes
     */
    WinJSContrib.Search.IndexGroup.prototype.dispose = function () {
        for (var n in this.indexes) {
            this.indexes[n].dispose();
        }
        this.indexes = {};
    };

    /**
     * Search index
     * @class
     * @classdesc
     * This class is the heart of the search engine. operations performed by this object are synchronous but exposes as promises.
     * This way Index is almost interchangeable with {@link WinJSContrib.Search.IndexWorkerProxy}
     * @param {string} name index name
     * @param {WinJSContrib.Search.IndexDefinition} definition index definition
     */
    WinJSContrib.Search.Index = function (name, definition) {
        var index = this;
        index.name = name || 'defaultIndex';
        index.definition = definition || {};
        index.items = [];
        index.storeData = true;
        index.onprogress = undefined;
        index.stopWords = WinJSContrib.Search.Stemming.StopWords.common;
        index.pipeline = new WinJSContrib.Search.Stemming.Pipeline();
        index.pipeline.registerDefault();

        index.folderPromise = Windows.Storage.ApplicationData.current.localFolder.createFolderAsync("WinJSContrib\\Search", Windows.Storage.CreationCollisionOption.openIfExists).then(function (folder) {
            return folder;
        }, function (err) {
            if (WinJS && WinJS.log) WinJS.log("Folder init error " + err.message);
        });
    };

    /**
     * get number of items in index
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Search.Index.prototype.count = function () {
        return WinJS.Promise.wrap(this.items.length);
    }

    /**
     * clear index
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Search.Index.prototype.clear = function () {
        this.items = [];
        return WinJS.Promise.wrap();
    }

    /**
     * release index
     */
    WinJSContrib.Search.Index.prototype.dispose = function () {
        this.items = [];
        this.definition = undefined;
        this.stopWords = undefined;
        this.pipeline.clear();
        this.pipeline = undefined;
        this.onprogress = undefined;
        this.folderPromise = undefined;
    }

    /**
     * export index
     */
    WinJSContrib.Search.Index.prototype.export = function () {
        return { definition: this.definition, items: this.items };
    }

    /**
     * serialize index to string
     */
    WinJSContrib.Search.Index.prototype.toString = function () {
        return JSON.stringify(this.export());
    }

    /**
     * load index from serialized string
     */
    WinJSContrib.Search.Index.prototype.loadData = function (indexString) {
        var tmp = indexString;

        if (typeof tmp == 'String')
            tmp = JSON.parse(indexString);

        if (tmp) {
            if (tmp.definition && tmp.definition.fields && tmp.items && tmp.items.length) {
                this.definition = tmp.definition;
            }
            this.items = tmp.items;
        }
    }

    /**
     * save index to storage
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Search.Index.prototype.save = function () {
        var idx = this;
        var exp = idx.export();
        return idx.folderPromise.then(function (folder) {
            return writeFile(folder, idx.name, Windows.Storage.CreationCollisionOption.replaceExisting, exp).then(function (filename) {
                return { index: idx };
            });
        });
    }

    /**
     * load index from storage
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Search.Index.prototype.load = function () {
        var idx = this;
        return idx.folderPromise.then(function (folder) {
            return openFile(folder, idx.name).then(function (savedidx) {
                idx.loadData(savedidx);
            });
        });
    }

    WinJSContrib.Search.Index.prototype._runSearch = function (querytext) {
        var index = this;
        var preparedTokens = index.processText(querytext);
        var searchResult = [];
        var size = index.items.length;
        var lastprogress = -1;

        for (var i = 0 ; i < size; i++) {
            var itemResult = index._searchItem(preparedTokens, index.items[i]);
            if (itemResult)
                searchResult.push(itemResult);

            var p = (100 * i / size) << 0;
            if (index.onprogress && p != lastprogress)
                index.onprogress({ progressPercent: p, items: size, current: i });
            lastprogress = p;
        }

        searchResult = searchResult.sort(function (a, b) {
            return b.rank - a.rank;
        });

        return searchResult;
    }

    /**
     * search index
     * @param {string} querytext
     * @returns {WinJS.Promise} search result
     */
    WinJSContrib.Search.Index.prototype.search = function (querytext) {

        return WinJS.Promise.wrap(this._runSearch(querytext));
    }

    WinJSContrib.Search.Index.prototype._searchItem = function (searchtokens, indexitem) {
        var index = this;
        var size = indexitem.items.length;
        var points = 0;

        for (var i = 0 ; i < size; i++) {
            var tokenitem = indexitem.items[i];

            if (searchtokens.untokenized && tokenitem.tokens.untokenized == searchtokens.untokenized) {
                points += 4 * tokenitem.weight;
            }

            if (searchtokens.untokenized && tokenitem.tokens.untokenized && tokenitem.tokens.untokenized.indexOf(searchtokens.untokenized) >= 0) {
                points += 2 * tokenitem.weight;
            }

            for (var t = 0 ; t < tokenitem.tokens.items.length; t++) {
                var token = tokenitem.tokens.items[t];
                for (var s = 0 ; s < searchtokens.items.length; s++) {
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
    }

    /**
     * set index definition
     */
    WinJSContrib.Search.Index.prototype.define = function (obj) {
        this.definition = obj;
    }

    WinJSContrib.Search.Index.prototype._add = function (obj) {
        var index = this;
        var key = undefined;
        var def = index.definition;

        var res = {
            items: [],
            rawdata: undefined,
            key: undefined
        }

        if (!def || !def.fields)
            return;

        if (index.storeData)
            res.rawdata = obj;
        if (def.key)
            res.key = WinJSContrib.Utils.readProperty(obj, def.key);

        for (var elt in def.fields) {
            if (def.fields.hasOwnProperty(elt)) {
                var weight = def.fields[elt].weight || 1;
                var value = WinJSContrib.Utils.readProperty(obj, elt.split('.'));

                if (value)
                    res.items.push({ tokens: index.processText(value), weight: weight });
            }
        }

        index.items.push(res);
        return WinJS.Promise.wrap(res);
    }

    /**
     * add an object to index
     * @param {Object} obj object to index
     * @param {WinJSContrib.Search.IndexDefinition} definition index definition (optional), use index's definition if not defined
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Search.Index.prototype.add = function (obj) {
        return WinJS.Promise.wrap(this._add(obj));
    }

    /**
     * add an array of objects to index
     * @param {Array} items items array
     * @param {WinJSContrib.Search.IndexDefinition} definition index definition (optional), use index's definition if not defined
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Search.Index.prototype.addRange = function (arr, definition, progress) {
        var index = this;
        var size = arr.length;
        var indexed = [];
        var lastprogress = -1;

        for (var i = 0 ; i < size; i++) {
            var item = index._add(arr[i], definition);
            if (item)
                indexed.push(item);

            var p = (100 * i / size) << 0;
            if (progress && p != lastprogress)
                progress({ progressPercent: p, items: size, current: i });
            lastprogress = p;
        }

        return WinJS.Promise.wrap({ indexed: indexed.length });
    }

    WinJSContrib.Search.Index.prototype.refresh = function () {
        var index = this;
        var old = index.items;
        var size = old.length;
        index.items = [];
        for (var i = 0 ; i < size; i++) {
            var item = index.items[i];
            index.add(item.rawdata);
        }

        index.items.push(res);
    }

    /**
     * prepare a text for search by applying stemming and tokenizing text
     * @param {string} text
     */
    WinJSContrib.Search.Index.prototype.processText = function (text) {
        var tokens = this.tokenize(text);
        var res = [];
        var size = tokens.length;
        for (var i = 0 ; i < size; i++) {
            var txt = this.pipeline.run(tokens[i]);
            if (txt.length > 1)
                res.push(txt);
        }

        return { items: res, untokenized: this.pipeline.run(text) };
    }

    /**
     * Check if a word is a stopword
     * @param {string} word
     */
    WinJSContrib.Search.Index.prototype.checkWord = function (token) {
        var size = this.stopWords.length;
        for (var i = 0 ; i < size; i++) {
            if (token == this.stopWords[i])
                return '';
        }

        return token;
    }

    /**
     * split a string into words
     * @param {string} text
     */
    WinJSContrib.Search.Index.prototype.tokenize = function (token) {
        var index = this;
        var tokens = [];
        if (!token || !token.split)
            return tokens;

        var words = token.split(/\W+/);
        for (var i = 0 ; i < words.length; i++) {
            if (words[i].length > 0) {
                tokens.push(words[i]);
            }
        }

        return tokens;
    }

    /**
     * @classdesc
     * Proxy for a {@link WinJSContrib.Search.Index} running in a web worker
     * @class
     * @param {string} name index name
     * @param {WinJSContrib.Search.IndexDefinition} definition index definition
     * @param {string} workerpath path for web worker script file (optional)
     */
    WinJSContrib.Search.IndexWorkerProxy = function (name, definition, workerpath) {
        var wrapper = this;
        wrapper.worker = new WinJSContrib.Messenger.SmartWorker(workerpath || WinJSContrib.Search.workerPath);
        wrapper.init(name, definition);
    }

    /**
     * initialize worker
     * @param {string} name
     * @param {WinJSContrib.Search.IndexDefinition} definition index definition (optional), use index's definition if not defined
     * @returns {WinJS.Promise} 
     */
    WinJSContrib.Search.IndexWorkerProxy.prototype.init = function (name, definition, load) {
        return this.worker.start('init', { name: name, load: load, definition: definition });
    }

    /**
     * start search
     * @param {string} searchTerm search query
     * @param {Object} options
     * @returns {WinJS.Promise} 
     */
    WinJSContrib.Search.IndexWorkerProxy.prototype.search = function (searchTerm, options) {
        return this.worker.start('search', { searchTerm: searchTerm, options: options });
    }

    /**
     * get the number of items in index
     * @returns {WinJS.Promise} 
     */
    WinJSContrib.Search.IndexWorkerProxy.prototype.count = function () {
        return this.worker.start('count');
    }

    /**
     * add an object to index
     * @param {Object} obj object to index
     * @param {Object} options
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Search.IndexWorkerProxy.prototype.add = function (data, options) {
        return this.worker.start('index', { items: [data], options: options });
    }

    /**
     * add an array of objects to index
     * @param {Array} items items array
     * @param {Object} options
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Search.IndexWorkerProxy.prototype.addRange = function (data, options) {
        return this.worker.start('index', { items: data, options: options });
    }

    /**
     * release proxy
     */
    WinJSContrib.Search.IndexWorkerProxy.prototype.dispose = function () {
        this.worker.dispose();
    }

    /**
     * clear index
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Search.IndexWorkerProxy.prototype.clear = function () {
        return this.worker.start('clear');
    }

    /**
     * load index from storage
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Search.IndexWorkerProxy.prototype.load = function () {
        return this.worker.start('load');
    }

    /**
     * save index to storage
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Search.IndexWorkerProxy.prototype.save = function () {
        return this.worker.start('save');
    }


    /**
     * @namespace
     */
    WinJSContrib.Search.Stemming = {};

    /**
     * stemming pipeline
     * @class
     */
    WinJSContrib.Search.Stemming.Pipeline = function () {
        this._processors = [];
    };

    /**
     * add a stemming function to pipeline
     * @param {function} callback stemming function
     */
    WinJSContrib.Search.Stemming.Pipeline.prototype.add = function (callback) {
        this._processors.push(callback);
    };

    /**
     * remove all stemming functions from pipeline
     */
    WinJSContrib.Search.Stemming.Pipeline.prototype.clear = function () {
        this._processors = [];
    };

    /**
     * apply stemming pipeline to text
     * @param {string} text
     */
    WinJSContrib.Search.Stemming.Pipeline.prototype.run = function (text) {
        var size = this._processors.length;
        var res = text;
        for (var i = 0 ; i < size; i++) {
            res = this._processors[i](res);
        }

        return res;
    };

    /**
     * @namespace
     */
    WinJSContrib.Search.Stemming.StopWords = {
        /**
         * list of common stopwords for french and english
         */
        common: [
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
        ]
    }

    /**
     * register default stemmings in pipeline
     */
    WinJSContrib.Search.Stemming.Pipeline.prototype.registerDefault = function () {
        var pipe = this;
        pipe.add(WinJSContrib.Search.Stemming.Op.lowerCase);
        pipe.add(WinJSContrib.Search.Stemming.Op.removeDiacritics);
        pipe.add(WinJSContrib.Search.Stemming.Op.dedup);
        pipe.add(WinJSContrib.Search.Stemming.Op.dropInitialLetters);
        pipe.add(WinJSContrib.Search.Stemming.Op.dropBafterMAtEnd);
        pipe.add(WinJSContrib.Search.Stemming.Op.transformCK);
        pipe.add(WinJSContrib.Search.Stemming.Op.cTransform);
        pipe.add(WinJSContrib.Search.Stemming.Op.dTransform);
        pipe.add(WinJSContrib.Search.Stemming.Op.dropG);
        pipe.add(WinJSContrib.Search.Stemming.Op.transformG);
        pipe.add(WinJSContrib.Search.Stemming.Op.dropH);
        pipe.add(WinJSContrib.Search.Stemming.Op.transformPH);
        pipe.add(WinJSContrib.Search.Stemming.Op.transformQ);
        pipe.add(WinJSContrib.Search.Stemming.Op.transformS);
        pipe.add(WinJSContrib.Search.Stemming.Op.transformX);
        pipe.add(WinJSContrib.Search.Stemming.Op.transformT);
        pipe.add(WinJSContrib.Search.Stemming.Op.dropT);
        pipe.add(WinJSContrib.Search.Stemming.Op.transformV);
        pipe.add(WinJSContrib.Search.Stemming.Op.transformWH);
        pipe.add(WinJSContrib.Search.Stemming.Op.dropW);
        pipe.add(WinJSContrib.Search.Stemming.Op.dropY);
        pipe.add(WinJSContrib.Search.Stemming.Op.transformZ);
    }

    /**
     * built-in stemmings
     * @namespace
     */
    WinJSContrib.Search.Stemming.Op = {
        /**
         * 
         */
        lowerCase: function (token) {
            return token.toLowerCase();
        },
        /**
         * 
         */
        dedup: function (token) {
            return token.replace(/([^c])\1/g, '$1');
        },
        /**
         * 
         */
        dropInitialLetters: function (token) {
            if (token.match(/^(kn|gn|pn|ae|wr)/))
                return token.substr(1, token.length - 1);

            return token;
        },
        /**
         * 
         */
        dropBafterMAtEnd: function (token) {
            return token.replace(/mb$/, 'm');
        },
        /**
         * 
         */
        cTransform: function (token) {
            token = token.replace(/([^s]|^)(c)(h)/g, '$1x$3').trim();
            token = token.replace(/cia/g, 'xia');
            token = token.replace(/c(i|e|y)/g, 's$1');
            token = token.replace(/c/g, 'k');

            return token;
        },
        /**
         * 
         */
        dTransform: function (token) {
            token = token.replace(/d(ge|gy|gi)/g, 'j$1');
            token = token.replace(/d/g, 't');

            return token;
        },
        /**
         * 
         */
        dropG: function (token) {
            token = token.replace(/gh(^$|[^aeiou])/g, 'h$1');
            token = token.replace(/g(n|ned)$/g, '$1');

            return token;
        },
        /**
         * 
         */
        transformG: function (token) {
            token = token.replace(/([^g]|^)(g)(i|e|y)/g, '$1j$3');
            token = token.replace(/gg/g, 'g');
            token = token.replace(/g/g, 'k');

            return token;
        },
        /**
         * 
         */
        dropH: function (token) {
            return token.replace(/([aeiou])h([^aeiou])/g, '$1$2');
        },
        /**
         * 
         */
        transformCK: function (token) {
            return token.replace(/ck/g, 'k');
        },
        /**
         * 
         */
        transformPH: function (token) {
            return token.replace(/ph/g, 'f');
        },
        /**
         * 
         */
        transformQ: function (token) {
            return token.replace(/q/g, 'k');
        },
        /**
         * 
         */
        transformS: function (token) {
            return token.replace(/s(h|io|ia)/g, 'x$1');
        },
        /**
         * 
         */
        transformT: function (token) {
            token = token.replace(/t(ia|io)/g, 'x$1');
            token = token.replace(/th/, '0');

            return token;
        },
        /**
         * 
         */
        dropT: function (token) {
            return token.replace(/tch/g, 'ch');
        },
        /**
         * 
         */
        transformV: function (token) {
            return token.replace(/v/g, 'f');
        },
        /**
         * 
         */
        transformWH: function (token) {
            return token.replace(/^wh/, 'w');
        },
        /**
         * 
         */
        dropW: function (token) {
            return token.replace(/w([^aeiou]|$)/g, '$1');
        },
        /**
         * 
         */
        transformX: function (token) {
            token = token.replace(/^x/, 's');
            token = token.replace(/x/g, 'ks');
            return token;
        },
        /**
         * 
         */
        dropY: function (token) {
            return token.replace(/y([^aeiou]|$)/g, '$1');
        },
        /**
         * 
         */
        transformZ: function (token) {
            return token.replace(/z/, 's');
        },
        /**
         * 
         */
        dropVowels: function (token) {
            return token.charAt(0) + token.substr(1, token.length).replace(/[aeiou]/g, '');
        },
        /**
         * 
         */
        removeDiacritics: function (s) {
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
    };

    function writeFile(folder, fileName, CreationCollisionOption, objectGraph) {
        return new WinJS.Promise(function (complete, error) {
            folder.createFileAsync(fileName, CreationCollisionOption).done(function (docfile) {
                Windows.Storage.FileIO.writeTextAsync(docfile, JSON.stringify(objectGraph)).done(function () {
                    if (WinJS && WinJS.log) WinJS.log("File written " + docfile.path);
                    complete();
                }, error);
            }, error);
        });
    }

    function openFile(folder, fileName) {
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

})();