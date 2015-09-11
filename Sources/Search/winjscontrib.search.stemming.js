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
