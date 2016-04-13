var __global = this;
module WinJSContrib.Search {
    var logger = WinJSContrib.Logs.getLogger("WinJSContrib.Search");

    /**
     * optional properties for animations
     * @typedef {Object} WinJSContrib.Search.ISearchResultItem
     * @property {number} rank ranking for the item
     * @property {Object} key unique key defined for the item
     * @property {Object} item item data
     */
    export interface ISearchResultItem {
        rank: number,
        key: any,
        item : any
    }
    
    export interface IIndexedItemToken{
            items : string[], 
            untokenized : string          
    }
    
    export interface IIndexedItemTokens{
        tokens: IIndexedItemToken, 
        weight: number 
    }
    
    export interface IIndexedItem {
        items: IIndexedItemTokens[],
        rawdata: any,
        key: any
    }

    export class Index {
        public name: string;
        public definition: WinJSContrib.Search.IndexDefinition;
        public onprogress: any;
        public folderPromise: any;
        public stopWords: any[];
        public container: WinJSContrib.DataContainer.IDataContainer;
        public items: IIndexedItem[] = [];
        public storeData: boolean = true;
        public pipeline: WinJSContrib.Search.Stemming.Pipeline;

        /**
         * Search index
         * @class WinJSContrib.Search.Index
         * @classdesc
         * This class is the heart of the search engine. operations performed by this object are synchronous but exposes as promises.
         * This way Index is almost interchangeable with {@link WinJSContrib.Search.IndexWorkerProxy}.
         * Depending of the size of your index and targeted devices, it could be faster to run search in main "thread".
         * @param {string} name index name
         * @param {WinJSContrib.Search.IndexDefinition} definition index definition
         * @param {WinJSContrib.DataContainer.IDataContainer} container optional parameter to explicitely specify the way index is stored
         */
        constructor(name, definition : WinJSContrib.Search.IndexDefinition, container?: WinJSContrib.DataContainer.IDataContainer) {
            var index = this;
            index.name = name || 'defaultIndex';
            index.definition = definition || { key : null, fields : null };
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
            } else if (__global.Windows) {
                index.folderPromise = Windows.Storage.ApplicationData.current.localFolder.createFolderAsync("WinJSContribSearch", Windows.Storage.CreationCollisionOption.openIfExists).then(function (folder) {
                    return folder;
                }, function (err) {
                    logger.error("Folder init error " + err.message);
                    return null;
                });
            } else {
                throw "You must provide at lease a default WinJSContrib.DataContainer to persist search index";
            }
        }

        /**
         * get number of items in index
         * @function WinJSContrib.Search.Index.prototype.count
         * @returns {WinJS.Promise}
         */
        public count() {
            return WinJS.Promise.wrap(this.items.length);
        }

        /**
         * clear index
         * @function WinJSContrib.Search.Index.prototype.clear
         * @returns {WinJS.Promise}
         */
        public clear() {
            this.items = [];
            return WinJS.Promise.wrap();
        }

        /**
         * release index
         * @function WinJSContrib.Search.Index.prototype.dispose
         */
        public dispose() {
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
         * @function WinJSContrib.Search.Index.prototype.export
         */
        public export() {
            return { definition: this.definition, items: this.items };
        }

        /**
         * serialize index to string
         * @function WinJSContrib.Search.Index.prototype.toString
         */
        public toString() {
            return JSON.stringify(this.export());
        }

        /**
         * load index from serialized string
         * @function WinJSContrib.Search.Index.prototype.loadData
         */
        public loadData(indexString) {
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
        }

        /**
         * save index to storage
         * @function WinJSContrib.Search.Index.prototype.save
         * @returns {WinJS.Promise}
         */
        public save(): WinJS.Promise<any> {
            var exp = this.export();
            if (this.container) {
                return this.container.save(this.name, exp);
            } else if (__global.Windows) {
                return this.folderPromise.then((folder) => {
                    return writeWinRTFile(folder, this.name, Windows.Storage.CreationCollisionOption.replaceExisting, exp).then((filename) => {
                        return { index: this };
                    });
                });
            } else {
                return WinJS.Promise.wrapError({ message: "you must provide a WinJSContrib.DataContainer to persist seach index" });
            }
        }

        /**
         * load index from storage
         * @function WinJSContrib.Search.Index.prototype.load
         * @returns {WinJS.Promise}
         */
        public load(): WinJS.Promise<any> {
            if (this.container) {
                return this.container.read(this.name).then((savedidx) => {
                    this.loadData(savedidx);
                });
            } else if (__global.Windows) {
                return this.folderPromise.then((folder) => {
                    return openWinRTFile(folder, this.name).then((savedidx) => {
                        this.loadData(savedidx);
                    });
                });
            } else {
                return WinJS.Promise.wrapError({ message: "you must provide a WinJSContrib.DataContainer to persist seach index" });
            }
        }

        _runSearch(querytext, options): ISearchResultItem[] {
            var index = this;
            var preparedTokens = index.processText(querytext);
            var searchResult: ISearchResultItem[] = [];
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
        }

        /**
         * search index
         * @function WinJSContrib.Search.Index.prototype.search
         * @param {string} querytext
         * @returns {WinJS.Promise<WinJSContrib.Search.ISearchResultItem[]>} search result
         */
        public search(querytext, options): WinJS.Promise<ISearchResultItem[]> {
            return WinJS.Promise.wrap(this._runSearch(querytext, options));
        }

        _searchItem(searchtokens, indexitem): ISearchResultItem {
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
        }

        /**
         * set index definition
         * @function WinJSContrib.Search.Index.prototype.define
         */
        public define(obj) {
            this.definition = obj;
        }

        _add(obj) {
            var index = this;
            var key = undefined;
            var def = index.definition;

            var res = <IIndexedItem>{
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
                    var fieldDefinition = <FieldDefinition>def.fields[elt];
                    var weight = fieldDefinition.weight || 1;
                    var value = WinJSContrib.Utils.readProperty(obj, elt.split('.'));

                    if (value) {
                        var valueType = typeof value;

                        if (valueType !== 'string' && (value.length !== null && value.length !== undefined)) {
                            for (var i = 0, l = value.length; i < l; i++) {
                                let item = value[i];
                                if (item && typeof item == 'string') {
                                    res.items.push({ tokens: index.processText(item), weight: weight });
                                }
                            }
                        } else if (valueType === 'string') {
                            res.items.push({ tokens: index.processText(value), weight: weight });
                        } else {
                            logger.warn(elt + " is of type " + valueType);
                        }
                    }
                }
            }

            index.items.push(res);

            return WinJS.Promise.wrap(res);
        }

        /**
         * add an object to index
         * @function WinJSContrib.Search.Index.prototype.add
         * @param {Object} obj object to index
         * @param {WinJSContrib.Search.IndexDefinition} definition index definition (optional), use index's definition if not defined
         * @returns {WinJS.Promise}
         */
        public add(obj) {
            return WinJS.Promise.wrap(this._add(obj));
        }

        /**
         * add an array of objects to index
         * @function WinJSContrib.Search.Index.prototype.addRange
         * @param {Array} items items array
         * @returns {WinJS.Promise}
         */
        public addRange(arr, progress?: Function) {
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
        }

        refresh() {
            var index = this;
            var old = index.items;
            var size = old.length;
            index.items = [];
            for (var i = 0; i < size; i++) {
                var item = index.items[i];
                index.add(item.rawdata);
            }
        }

        /**
         * prepare a text for search by applying stemming and tokenizing text
         * @function WinJSContrib.Search.Index.prototype.processText
         * @param {string} text
         */
        public processText(text) : IIndexedItemToken {
            if (typeof text == "number")
                text = text.toString();

            var tokens = this.tokenize(text);
            var res = <string[]>[];
            var size = tokens.length;
            for (var i = 0; i < size; i++) {
                var txt = this.pipeline.run(tokens[i]);
                if (txt.length > 1)
                    res.push(txt);
            }

            return { items: res, untokenized: <string>this.pipeline.run(text) };
        }

        /**
         * Check if a word is a stopword
         * @function WinJSContrib.Search.Index.prototype.checkWord
         * @param {string} word
         */
        public checkWord(token) {
            var size = this.stopWords.length;
            for (var i = 0; i < size; i++) {
                if (token == this.stopWords[i])
                    return '';
            }

            return token;
        }

        /**
         * split a string into words
         * @function WinJSContrib.Search.Index.prototype.tokenize
         * @param {string} text
         */
        public tokenize(token) {
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
        }
    }
}

    
