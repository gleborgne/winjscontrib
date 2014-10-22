//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

//module for managing multithreading in the search engine

/// <reference path="WinJSContrib.core.js" />
/// <reference path="//Microsoft.WinJS.2.0/js/base.js" />

var worker = this;
(function () {
    'use strict';

    importScripts('//Microsoft.WinJS.2.0/js/base.js');
    importScripts('/scripts/winjscontrib/winjscontrib.core.js');
    importScripts('/scripts/winjscontrib/WinJSContrib.search.js');

    function sendMessage(msgType, data) {
        postMessage({ msgType: msgType, msgData: data });
    }

    function completed(data) {
        postMessage({ msgType: 'complete', msgData: data });
    }

    function error(data) {
        postMessage({ msgType: 'error', msgData: data });
    }

    function sendProgress(data) {
        postMessage({ msgType: 'progress', msgData: data });
    }

     var idx = new WinJSContrib.Search.Index();
    idx.onprogress = function (p) {
        sendProgress(p);
    }

    function processMessage(arg) {
        var msgData = arg.data;
        if (msgData.msgType === 'init') {
            idx.name = msgData.msgData.name;
            idx.definition = msgData.msgData.definition;
            completed();
        }
        else if (msgData.msgType === 'index') {
            workerPromise(indexData(msgData.msgData));
        }
        else if (msgData.msgType === 'search') {
            workerPromise(searchData(msgData.msgData));
        }
        else if (msgData.msgType === 'definition') {
            idx.definition = msgData.msgData;
            completed();
        }
        else if (msgData.msgType === 'clear') {
            idx.items = [];
            completed();
        }

        else if (msgData.msgType === 'dispose') {
            idx.dispose();

            removeEventListener("message", processMessage);
            completed();
            worker.close();
        }
        else if (msgData.msgType === 'save') {
            workerPromise(saveIndex(msgData.msgData));
        }
        else if (msgData.msgType === 'load') {
            workerPromise(loadIndex(msgData.msgData));
        }
    }

    addEventListener("message", processMessage, false);

    function workerPromise(promise) {
        promise.done(function (res) {
            completed(res);
        }, function (err) {
            error(err);
        }, function (p) {
            sendProgress(p);
        });
    }

    function indexData(data) {
        return new WinJS.Promise(function (complete, error, progress) {
            try {
                if (data.name) {
                    idx.name = data.name;
                }

                if (data.options.load) {
                    idx.load().done(function () {
                        var indexed = idx.addRange(data.items, data.definition);
                        if (data.options.save) {
                            idx.save().done(function () {
                                complete({ name: idx.name, items: indexed });
                            });
                        }
                        else {
                            complete({ name: idx.name, items: indexed });
                        }
                    });
                }
                else {
                    var indexed = idx.addRange(data.items, data.definition);
                    if (data.options.save) {
                        idx.save().done(function () {
                            complete({ name: idx.name, items: indexed });
                        });
                    }
                    else {
                        complete({ name: idx.name, items: indexed });
                    }
                }
            }
            catch (exception) {
                error(exception);
            }
        });
    }

    function searchData(data) {
        return new WinJS.Promise(function (complete, error, progress) {
            try {
                if (data.name) {
                    idx.name = data.name;
                }
                if (data.loaddata) {
                    idx.load().done(function () {
                        var res = idx.search(data.searchTerm);
                        complete(res);
                    });
                }
                else {
                    var res = idx.search(data.searchTerm);
                    complete(res);
                }
            }
            catch (exception) {
                error(exception);
            }
        });
    }

    function loadIndex(data) {
        return new WinJS.Promise(function (complete, error, progress) {
            try {
                idx.load().done(function () {
                    complete();
                }, error);
            }
            catch (exception) {
                error(exception);
            }
        });
    }

    function saveIndex(data) {
        return new WinJS.Promise(function (complete, error, progress) {
            try {
                idx.save().done(function () {
                    complete();
                }, error);
            }
            catch (exception) {
                error(exception);
            }
        });
    }
})();