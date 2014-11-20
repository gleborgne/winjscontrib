//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

//this provide a basic search and indexing algorythms to implement local search in your apps

var MCNEXT = MCNEXT || {};
MCNEXT.Search = MCNEXT.Search || {};

(function (Search) {
    "use strict";

    Search.workerPath = './scripts/winjscontrib/mcnext.search.worker.js';

    Search.getWorker = function (name, definition, workerPath) {
        var wrk = new WorkerPromise(name, workerPath || Search.workerPath);
        wrk.init(name, definition);
        return wrk;
    }

    Search.load = function (name) {
        var idx = new Search.Index(name);
        return idx.load().then(function () {;
            return idx;
        });
    }

    Search.IndexGroup = function (definitions) {
        this.indexes = {};
        if (definitions) {
            for (var n in definitions) {
                this.indexes[n] = new Search.Index(n, definitions[n]);
            }
        }
    }

    Search.IndexGroup.prototype.addIndex = function (name, definition, items) {
        var idx = new Search.Index(name, definition);
        this.indexes[name] = idx;
        if (items && items.length) {
            idx.addRange(items);
        }
        return idx;
    }

    Search.IndexGroup.prototype.search = function (querytext) {
        var searchresult = { hasResult: false, allResults: [] };
        for (var n in this.indexes) {
            var res = this.indexes[n].search(querytext);
            if (res && res.length) {
                res.forEach(function (item) {
                    item.searchItemType = n;
                    searchresult.allResults.push(item);
                });
            }
            searchresult[n] = res;
        }

        searchresult.allResults.sort(function (a, b) {
            return b.rank - a.rank;
        });

        searchresult.hasResult = searchresult.allResults.length > 0;

        return searchresult;
    };

    Search.IndexGroup.prototype.save = function () {
        var promises = [];
        for (var n in this.indexes) {
            promises.push(this.indexes[n].save());
        }
        return WinJS.Promise.join(promises);
    };

    Search.IndexGroup.prototype.load = function () {
        var promises = [];
        for (var n in this.indexes) {
            promises.push(this.indexes[n].load());
        }
        return WinJS.Promise.join(promises);
    };

    Search.IndexGroup.prototype.dispose = function () {
        for (var n in this.indexes) {
            this.indexes[n].dispose();
        }
        this.indexes = {};
    };

    Search.Index = function (name, definition) {
        var index = this;
        index.name = name || 'defaultIndex';
        index.definition = definition || {};
        index.items = [];
        index.storeData = true;
        index.onprogress = undefined;
        index.stopWords = Search.Stemming.StopWords.common;
        index.pipeline = new Search.Stemming.Pipeline();
        index.pipeline.registerDefault();

        index.folderPromise = Windows.Storage.ApplicationData.current.localFolder.createFolderAsync("MCNEXT\\Search", Windows.Storage.CreationCollisionOption.openIfExists).then(function (folder) {
            return folder;
        }, function (err) {
            if (WinJS && WinJS.log) WinJS.log("Folder init error " + err.message);
        });
    };

    Search.Index.prototype.dispose = function () {
        this.items = [];
        this.definition = undefined;
        this.stopWords = undefined;
        this.pipeline.clear();
        this.pipeline = undefined;
        this.onprogress = undefined;
        this.folderPromise = undefined;
    }

    Search.Index.prototype.export = function () {
        return { definition: this.definition, items: this.items };
    }

    Search.Index.prototype.toString = function () {
        return JSON.stringify(this.export());
    }

    Search.Index.prototype.loadData = function (indexString) {
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

    Search.Index.prototype.save = function () {
        var idx = this;
        var exp = idx.export();
        return idx.folderPromise.then(function (folder) {
            return writeFile(folder, idx.name, Windows.Storage.CreationCollisionOption.replaceExisting, exp).then(function (filename) {
                return { index: idx };
            });
        });
    }

    Search.Index.prototype.load = function () {
        var idx = this;
        return idx.folderPromise.then(function (folder) {
            return openFile(folder, idx.name).then(function (savedidx) {
                idx.loadData(savedidx);
            });
        });
    }

    Search.Index.prototype.search = function (querytext) {
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

    Search.Index.prototype.searchAsync = function (searchTerm) {
        var index = this;
        var wrk = new WorkerPromise(index.name, Search.workerPath);
        return new WinJS.Promise(function (complete, error, progress) {
            wrk.search(searchTerm, true, index.name).done(function (res) {
                wrk.dispose();
                complete(res);
            }, error, progress);
        });
    }

    Search.Index.prototype._searchItem = function (searchtokens, indexitem) {
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

    Search.Index.prototype.define = function (obj) {
        this.definition = obj;
    }

    Search.Index.prototype.add = function (obj, definition) {
        var index = this;
        var key = undefined;
        var def = definition || index.definition;

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
            res.key = MCNEXT.Utils.readProperty(obj, def.key);

        for (var elt in def.fields) {
            if (def.fields.hasOwnProperty(elt)) {
                var weight = def.fields[elt] || 1;
                var value = MCNEXT.Utils.readProperty(obj, elt.split('.'));

                if (value)
                    res.items.push({ tokens: index.processText(value), weight: weight });
            }
        }

        index.items.push(res);
        return res;
    }

    Search.Index.prototype.addRange = function (arr, definition) {
        var index = this;
        var size = arr.length;
        var indexed = [];
        var lastprogress = -1;

        for (var i = 0 ; i < size; i++) {
            var item = index.add(arr[i], definition);
            if (item)
                indexed.push(item);

            var p = (100 * i / size) << 0;
            if (index.onprogress && p != lastprogress)
                index.onprogress({ progressPercent: p, items: size, current: i });
            lastprogress = p;
        }

        return indexed;
    }

    Search.Index.prototype.addRangeAsync = function (arr, definition) {
        var index = this;
        var wrk = new WorkerPromise(index.name, Search.workerPath);

        return new WinJS.Promise(function (complete, error, progress) {
            wrk.index(arr, definition || index.definition, index.name, { load: true, save: true }).done(function (idx) {
                var indexed = idx.items;

                if (indexed && indexed.length) {
                    for (var i = 0 ; i < indexed.length ; i++) {
                        index.items.push(indexed[i]);
                    }
                }


                wrk.dispose();
                //index.load().done(function () {
                complete();
                //}, error);
            }, error, progress);
        });
    }

    function WorkerPromise(name, workerpath) {
        var wrapper = this;
        wrapper.worker = new Worker(workerpath);
        wrapper.promises = [];

        var newpromise = function () {
            var prom = new WinJS.Promise(function (complete, error, progress) {
                var processmsg = function (event) {
                    if (event.data.msgType === 'progress') {
                        progress(event.data.msgData.progressPercent);
                    }
                    else if (event.data.msgType === 'complete') {
                        wrapper.worker.removeEventListener('message', processmsg);
                        //wrapper.worker.onmessage = undefined;
                        complete(event.data.msgData);
                    }
                    else if (event.data.msgType === 'error') {
                        wrapper.worker.removeEventListener('message', processmsg);
                        //wrapper.worker.onmessage = undefined;
                        error(event.data.msgData);
                    }
                }
                wrapper.worker.addEventListener('message', processmsg);
            });
            wrapper.promises.push(prom);
            return prom;
        }

        wrapper.init = function (name, definition) {
            wrapper.worker.postMessage({ msgType: 'init', msgData: { name: name, definition: definition } });
            return newpromise();
        }

        wrapper.search = function (searchTerm, loaddata, name) {
            wrapper.worker.postMessage({ msgType: 'search', msgData: { name: name, searchTerm: searchTerm, loaddata: loaddata } });
            return newpromise();
        }

        //wrapper.setDefinition = function (definition) {
        //    wrapper.worker.postMessage({ msgType: 'definition', msgData: definition });
        //    return newpromise();
        //}

        wrapper.index = function (data, definition, name, options) {
            wrapper.worker.postMessage({ msgType: 'index', msgData: { name: name, items: data, definition: definition, options: options } });
            return newpromise();
        }

        wrapper.dispose = function () {
            wrapper.worker.postMessage({ msgType: 'dispose' });
            return newpromise().then(function () {
                wrapper.worker.onmessage = undefined;
                wrapper.promises.forEach(function (p) {
                    p.cancel();
                });
                wrapper.worker.terminate();
                wrapper.worker = undefined;
            });
        }

        wrapper.clear = function () {
            wrapper.worker.postMessage({ msgType: 'clear' });
            return newpromise();
        }

        wrapper.load = function () {
            wrapper.worker.postMessage({ msgType: 'load' });
            return newpromise();
        }

        wrapper.save = function () {
            wrapper.worker.postMessage({ msgType: 'save' });
            return newpromise();
        }
    }

    Search.Index.prototype.refresh = function (obj) {
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

    Search.Index.prototype.processText = function (text) {
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

    Search.Index.prototype.checkWord = function (token) {
        var size = this.stopWords.length;
        for (var i = 0 ; i < size; i++) {
            if (token == this.stopWords[i])
                return '';
        }

        return token;
    }

    Search.Index.prototype.tokenize = function (token) {
        var index = this;
        var tokens = [];
        if (!token)
            return tokens;

        var words = token.split(/\W+/);
        for (var i = 0 ; i < words.length; i++) {
            if (words[i].length > 0) {
                tokens.push(words[i]);
            }
        }
        return tokens;
    }

    Search.Stemming = {};

    Search.Stemming.Pipeline = function () {
        this._processors = [];
    };

    Search.Stemming.Pipeline.prototype.add = function (callback) {
        this._processors.push(callback);
    };

    Search.Stemming.Pipeline.prototype.clear = function (callback) {
        this._processors = [];
    };

    Search.Stemming.Pipeline.prototype.run = function (text) {
        var size = this._processors.length;
        var res = text;
        for (var i = 0 ; i < size; i++) {
            res = this._processors[i](res);
        }

        return res;
    };

    Search.Stemming.StopWords = {
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

    Search.Stemming.Pipeline.prototype.registerDefault = function (text) {
        var pipe = this;
        pipe.add(Search.Stemming.Op.lowerCase);
        pipe.add(Search.Stemming.Op.removeDiacritics);
        pipe.add(Search.Stemming.Op.dedup);
        pipe.add(Search.Stemming.Op.dropInitialLetters);
        pipe.add(Search.Stemming.Op.dropBafterMAtEnd);
        pipe.add(Search.Stemming.Op.transformCK);
        pipe.add(Search.Stemming.Op.cTransform);
        pipe.add(Search.Stemming.Op.dTransform);
        pipe.add(Search.Stemming.Op.dropG);
        pipe.add(Search.Stemming.Op.transformG);
        pipe.add(Search.Stemming.Op.dropH);
        pipe.add(Search.Stemming.Op.transformPH);
        pipe.add(Search.Stemming.Op.transformQ);
        pipe.add(Search.Stemming.Op.transformS);
        pipe.add(Search.Stemming.Op.transformX);
        pipe.add(Search.Stemming.Op.transformT);
        pipe.add(Search.Stemming.Op.dropT);
        pipe.add(Search.Stemming.Op.transformV);
        pipe.add(Search.Stemming.Op.transformWH);
        pipe.add(Search.Stemming.Op.dropW);
        pipe.add(Search.Stemming.Op.dropY);
        pipe.add(Search.Stemming.Op.transformZ);
    }

    Search.Stemming.Op = {
        lowerCase: function (token) {
            return token.toLowerCase();
        },

        dedup: function (token) {
            return token.replace(/([^c])\1/g, '$1');
        },

        dropInitialLetters: function (token) {
            if (token.match(/^(kn|gn|pn|ae|wr)/))
                return token.substr(1, token.length - 1);

            return token;
        },

        dropBafterMAtEnd: function (token) {
            return token.replace(/mb$/, 'm');
        },

        cTransform: function (token) {
            token = token.replace(/([^s]|^)(c)(h)/g, '$1x$3').trim();
            token = token.replace(/cia/g, 'xia');
            token = token.replace(/c(i|e|y)/g, 's$1');
            token = token.replace(/c/g, 'k');

            return token;
        },

        dTransform: function (token) {
            token = token.replace(/d(ge|gy|gi)/g, 'j$1');
            token = token.replace(/d/g, 't');

            return token;
        },

        dropG: function (token) {
            token = token.replace(/gh(^$|[^aeiou])/g, 'h$1');
            token = token.replace(/g(n|ned)$/g, '$1');

            return token;
        },

        transformG: function (token) {
            token = token.replace(/([^g]|^)(g)(i|e|y)/g, '$1j$3');
            token = token.replace(/gg/g, 'g');
            token = token.replace(/g/g, 'k');

            return token;
        },

        dropH: function (token) {
            return token.replace(/([aeiou])h([^aeiou])/g, '$1$2');
        },

        transformCK: function (token) {
            return token.replace(/ck/g, 'k');
        },
        transformPH: function (token) {
            return token.replace(/ph/g, 'f');
        },

        transformQ: function (token) {
            return token.replace(/q/g, 'k');
        },

        transformS: function (token) {
            return token.replace(/s(h|io|ia)/g, 'x$1');
        },

        transformT: function (token) {
            token = token.replace(/t(ia|io)/g, 'x$1');
            token = token.replace(/th/, '0');

            return token;
        },

        dropT: function (token) {
            return token.replace(/tch/g, 'ch');
        },

        transformV: function (token) {
            return token.replace(/v/g, 'f');
        },

        transformWH: function (token) {
            return token.replace(/^wh/, 'w');
        },

        dropW: function (token) {
            return token.replace(/w([^aeiou]|$)/g, '$1');
        },

        transformX: function (token) {
            token = token.replace(/^x/, 's');
            token = token.replace(/x/g, 'ks');
            return token;
        },

        dropY: function (token) {
            return token.replace(/y([^aeiou]|$)/g, '$1');
        },

        transformZ: function (token) {
            return token.replace(/z/, 's');
        },

        dropVowels: function (token) {
            return token.charAt(0) + token.substr(1, token.length).replace(/[aeiou]/g, '');
        },

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

})(MCNEXT.Search);