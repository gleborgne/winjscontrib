/* 
 * WinJS Contrib v2.1.0.0
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

//example of expected signature for data container

(function () {
    'use strict';
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
                            console.log('getting directory ' + container.key);
                            var rootDir = container.key;
                            if (options.packageId && (window && window.cordova && window.cordova.platformId != "ios")) {
                                rootDir = "Android/data/" + options.packageId + "/files/" + rootDir
                            }
                            //else 
                            if (window && window.cordova && window.cordova.platformId == "ios") {
                                rootDir = container.key;
                            }
                            else {
                                console.error("WARNING !!!! you have to provide the packageId");
                            }
                            root.getDirectory(rootDir, { create: true }, function (directory) {
                                console.log('got the directory ' + container.key);
                                container.folder = directory;
                                readComplete(container.folder);
                            }, function (ee) {
                                console.log("(0) I failed at getting a directory " + container.key);
                                readError(ee);
                            });
                        }, function (ee) {
                            console.log("(1) I failed at getting a directory " + container.key);
                            readError(ee);
                        });
                }
                else {
                    console.log('trying to get the directory ' + container.key + " from parent " + parent.key);
                    parent.folderPromise.then(function (folder) {
                        console.log('get the directory ' + container.key + " from parent " + parent.key);
                        folder.getDirectory(container.key, { create: true }, function (directory) {
                            console.log('got the directory');
                            container.folder = directory;
                            readComplete(container.folder);
                        }, function (ee) {
                            console.log("I failed at getting a directory");
                            readError(ee);
                        });
                    }, function (ee) {
                        console.log("I failed at getting a directory " + container.key + "from parent " + parent.key);
                        readError(ee);
                    });
                }

            });
        }, {
            read: function (itemkey) {
                var container = this;
                console.log('trying to read ' + itemkey);
                return new WinJS.Promise(function (readComplete, readError) {
                    console.log('get container folder promise for ' + itemkey);

                    container.folderPromise.then(function (folder) {
                        console.log('got container folder promise for ' + itemkey);
                        console.log('trying to read file ' + itemkey);

                        folder.getFile(toJSONFileName(itemkey), {
                            create: true, exclusive: false
                        },
                        function (fileEntry) {
                            console.log('read file ' + itemkey);
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
                                        console.log('error read file');
                                        readError();
                                    }
                                };
                                reader.readAsText(e);
                                //  reader.abort();
                                reader.onerror = function (evt) {
                                    console.log('error read file');
                                    readError();
                                };
                            });

                        }
                        , function () { //fail 
                            console.log('error read file');
                            readError();
                        });
                    }, function () {
                        console.log('error folder promise');
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
                                console.log('file removed :' + itemkey);
                                deleteComplete();
                            }, function () {
                                console.log('faild to remove ' + itemkey);
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

            child: function (key) {
                if (this[key])
                    return this[key];
                console.log('getting child');
                var res = new WinJSContrib.DataContainer.CordovaContainer(key, this.options, this);
                this[key] = res;
                return res;
            }
        })
    });

    function toJSONFileName(fileName) {
        return encodeURIComponent(fileName) + ".json";
    }
})();