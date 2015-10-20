
(function () {
    'use strict';
    var containerLogger = WinJSContrib.Logs.getLogger("WinJSContrib.DataContainer.Cordova");
    WinJS.Namespace.define("WinJSContrib.DataContainer", {
        CordovaContainer: WinJS.Class.define(function ctor(key, options, parent) {
            this.key = key || 'mcndatacontainer';
            this.options = options;
            this.parent = parent;
            if (parent) {
                this.storageKey = parent.storageKey + '.' + this.key;
            } else {
                this.storageKey = this.key;
            }

            var container = this;
            this.folder;
            container.folderPromise = new WinJS.Promise(function (readComplete, readError) {
                if (!container.parent) {
                    if (!window.requestFileSystem)
                        throw "File plugin is required !";

                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, //"Android/data/io.cordova.MCNEXT.Survey/files", 0,
                        function (fileSystem) {
                            var root = fileSystem.root;
                            containerLogger.verbose('getting directory ' + container.key);
                            var rootDir = container.key;
                            if (options && options.packageId && (window && window.cordova && window.cordova.platformId != "ios")) {
                                rootDir = "Android/data/" + options.packageId + "/files/" + rootDir
                            }
                            //else 
                            if (window && window.cordova && window.cordova.platformId == "ios") {
                                rootDir = container.key;
                            }
                            else {
                                containerLogger.error("WARNING !!!! you have to provide the packageId");
                            }
                            root.getDirectory(rootDir, { create: true }, function (directory) {
                                containerLogger.debug('got the directory ' + container.key);
                                container.folder = directory;
                                readComplete(container.folder);
                            }, function (ee) {
                                containerLogger.verbose("(0) I failed at getting a directory " + container.key);
                                readError(ee);
                            });
                        }, function (ee) {
                            containerLogger.warn("(1) I failed at getting a directory " + container.key);
                            readError(ee);
                        });
                }
                else {
                    containerLogger.verbose('trying to get the directory ' + container.key + " from parent " + parent.key);
                    parent.folderPromise.then(function (folder) {
                        containerLogger.verbose('get the directory ' + container.key + " from parent " + parent.key);
                        folder.getDirectory(container.key, { create: true }, function (directory) {
                            containerLogger.debug('got the directory');
                            container.folder = directory;
                            readComplete(container.folder);
                        }, function (ee) {
                            containerLogger.warn("I failed at getting a directory");
                            readError(ee);
                        });
                    }, function (ee) {
                        containerLogger.warn("I failed at getting a directory " + container.key + "from parent " + parent.key);
                        readError(ee);
                    });
                }

            });
        }, {
            read: function (itemkey) {
                var container = this;
                containerLogger.verbose('trying to read ' + itemkey);
                return new WinJS.Promise(function (readComplete, readError) {
                    containerLogger.verbose('get container folder promise for ' + itemkey);

                    container.folderPromise.then(function (folder) {
                        containerLogger.verbose('got container folder promise for ' + itemkey);
                        containerLogger.verbose('trying to read file ' + itemkey);

                        folder.getFile(toJSONFileName(itemkey), {
                            create: true, exclusive: false
                        },
                        function (fileEntry) {
                            containerLogger.debug('read file ' + itemkey);
                            //getfile
                            fileEntry.file(function (e) {
                                var reader = new FileReader();
                                reader.onloadend = function (evt) {
                                    try {
                                        if (evt.target && evt.target.result) {
                                            readComplete(JSON.parse(evt.target.result));
                                        }
                                        else {
                                            readComplete('');
                                        }
                                    }
                                    catch (e) {
                                        containerLogger.warn('error read file');
                                        readError();
                                    }
                                };
                                reader.readAsText(e);
                                //  reader.abort();
                                reader.onerror = function (evt) {
                                    containerLogger.warn('error read file');
                                    readError();
                                };
                            });

                        }
                        , function (err) { //fail 
                            containerLogger.warn('error read file', err);
                            readError();
                        });
                    }, function (err) {
                        containerLogger.warn('error folder promise', err);
                        readError();
                    });
                });
            },

            save: function (itemkey, obj) {
                var container = this;
                return new WinJS.Promise(function (saveComplete, saveError) {
                    if (obj) {
                        var tmp = JSON.stringify(obj);
                        container.folderPromise.then(function (folder) {
                            folder.getFile(toJSONFileName(itemkey), {
                                create: true, exclusive: false
                            },
                            function (fileEntry) {
                                //getfile
                                fileEntry.createWriter(function (writer) {
                                    //sucess
                                    writer.write(tmp);
                                    writer.onwriteend = saveComplete;

                                }, function (e) {
                                    //fail
                                    saveError(e)
                                });

                            }
                            , function (e) { //fail 
                                saveError(e)
                            });
                        });
                    }
                });
            },


            remove: function (itemkey) {
                var container = this;
                return new WinJS.Promise(function (deleteComplete, deleteError) {
                    container.folderPromise.then(function (folder) {
                        folder.getFile(toJSONFileName(itemkey), {
                            create: true, exclusive: false
                        },
                        function (fileEntry) {
                            //getfile
                            fileEntry.remove(function () {
                                containerLogger.debug('file removed :' + itemkey);
                                deleteComplete();
                            }, function () {
                                containerLogger.warn('faild to remove ' + itemkey);
                            });
                        }
                        , function () { //fail 
                            deleteError();
                        });
                    });
                });

            },

            list: function () {
                var container = this;
                return new WinJS.Promise(function (readComplete, readError) {
                    container.folderPromise.then(function (folder) {
                        var directoryReader = folder.createReader();
                        directoryReader.readEntries(function (entries) {
                            var res = [];
                            for (var i = 0; i < entries.length; i++) {
                                res.push({ displayName: entries[i].name.substring(0, entries[i].name.length - 5) });
                            }
                            readComplete(res)
                        }, function () {
                            readComplete([])
                        });

                    });
                });
            },
            listKeys : function(){
                var container = this;
                return new WinJS.Promise(function (readComplete, readError) {
                    container.folderPromise.then(function (folder) {
                        var directoryReader = folder.createReader();
                        directoryReader.readEntries(function (entries) {
                            var res = [];
                            for (var i = 0; i < entries.length; i++) {
                                res.push(entries[i].name.substring(0, entries[i].name.length - 5));
                            }
                            readComplete(res)
                        }, function () {
                            readComplete([])
                        });

                    });
                });
            },
            child: function (key) {
                if (!key)
                    return;

                if (typeof key === "number")
                    key = key.toString();

                if (this[key])
                    return this[key];

                containerLogger.verbose('getting child');
                var res = new WinJSContrib.DataContainer.CordovaContainer(key, this.options, this);
                this[key] = res;
                return res;
            }
        })
    });

    WinJSContrib.DataContainer.current = WinJSContrib.DataContainer.current || null;
    WinJSContrib.DataContainer.CordovaContainer.makeCurrent = function (key, options) {
        WinJSContrib.DataContainer.current = new WinJSContrib.DataContainer.CordovaContainer(key, options);
    };

    function toJSONFileName(fileName) {
        return encodeURIComponent(fileName) + ".json";
    }
})();