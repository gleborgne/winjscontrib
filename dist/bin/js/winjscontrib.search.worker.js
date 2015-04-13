/* 
 * WinJS Contrib v2.1.0.0
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

//module for managing multithreading in the search engine

/// <reference path="WinJSContrib.core.js" />
/// <reference path="//Microsoft.WinJS.2.0/js/base.js" />

var worker = this;
(function () {
    'use strict';

    importScripts('//Microsoft.WinJS.2.0/js/base.js');
    importScripts('/scripts/winjscontrib/winjscontrib.core.js');
    importScripts('/scripts/winjscontrib/winjscontrib.messenger.js');
    importScripts('/scripts/winjscontrib/winjscontrib.search.js');

    var idx = null;
    var messenger = new WinJSContrib.Messenger(worker, worker);

    messenger.init = function (arg) {
        idx = new WinJSContrib.Search.Index();
        idx.name = arg.name;
        idx.definition = arg.definition;
        if (arg.load) {
            return idx.load();
        }
    }

    messenger.save = function (data) {
        if (!idx.name || !idx.definition)
            return WinJS.Promise.wrapError({ message: 'index not initialized' });

        return idx.save();
    }

    messenger.load = function (data) {
        if (!idx.name)
            return WinJS.Promise.wrapError({ message: 'index not initialized' });

        return idx.load();
    }

    messenger.count = function (data) {
        if (!idx.name || !idx.definition)
            return WinJS.Promise.wrapError({ message: 'index not initialized' });

        return idx.items.length;
    }

    messenger.index = function (data) {        
        return new WinJS.Promise(function (complete, error, progress) {
            try {
                if (data.options && data.options.index) {
                    idx.name = data.options.index.name;
                    if (data.options.index.definition) {
                        idx.definition = data.options.index.definition;
                    }
                }

                if (!idx.name || !idx.definition) {
                    error({ message: 'index not initialized' });
                    return 
                }

                if (data.options && data.options.load) {
                    var p = idx.load();
                }
                else {
                    var p = WinJS.Promise.wrap();
                }
                
                p.done(function () {
                    var indexed = idx.addRange(data.items, null, progress);

                    if (data.options && data.options.save) {
                        idx.save().done(function () {
                            complete({ name: idx.name, items: indexed });
                        },error);
                    }
                    else {
                        complete({ name: idx.name, items: indexed });
                    }
                },error);
            }
            catch (exception) {
                error(exception);
            }
        });
    }

    messenger.search = function (data) {
        return new WinJS.Promise(function (complete, error, progress) {
            try {
                if (data.options && data.options.index) {
                    idx.name = data.options.index.name;
                    if (data.options.index.definition) {
                        idx.definition = data.options.index.definition;
                    }
                }

                if (!idx.name || !idx.definition) {
                    error({ message: 'index not initialized' });
                    return
                }

                if (data.options && data.options.load) {
                    var p = idx.load();
                }
                else {
                    var p = WinJS.Promise.wrap();
                }

                p.done(function () {
                    var res = idx.search(data.searchTerm);
                    complete(res);
                }, error);
            }
            catch (exception) {
                error(exception);
            }
        });
    }

    messenger.clear = function (arg) {
        if (!idx.name || !idx.definition)
            return WinJS.Promise.wrapError({ message: 'index not initialized' });

        return idx.clear();
    }
})();