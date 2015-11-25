/// <reference path="winjscontrib.core.js" />
/* 
 * WinJS Contrib v2.1.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

/* 
 * WinJS Contrib v2.0.3.0
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

/// <reference path="winjscontrib.winrt.backgrounddownloads.js" />

var WinJSContrib = WinJSContrib || {};
WinJSContrib.BgDownloads = WinJSContrib.BgDownloads || {};
(function () {
    'use strict';
    var localFolder = Windows.Storage.ApplicationData.current.localFolder;
    var downloadedItemsFileName = "downloadeditems.json";
    var ObservableItem = WinJS.Binding.define({ download: null, status: null, progress: 0 });
    var logger = WinJSContrib.Logs.getLogger("WinJSContrib.BgDownloadTracker");
    var downloadStatus = {
        waiting: "waiting",
        downloading: "downloading",
        downloaded: "downloaded",
        error: "error",
        completed: "completed",
    }

    WinJSContrib.BgDownloads.Tracker = WinJS.Class.mix(WinJS.Class.define(function (name, options) {
        var tracker = this;
        tracker.name = name;
        options = options || {};

        this.saveItemsPromise = WinJS.Promise.wrap();
        this.downloadsStart = WinJS.Promise.wrap();
        this.folder = options.folder;
        this.retryOnError = options.retryOnError;
        this.handleItemProperties = options.handleItemProperties;
        this.maxConcurrentDownloads = options.maxConcurrentDownloads || 100;
        this.debouncedCheck = _.debounce(function () {
            tracker.checkDownloads();
        }, 200, false);

        this.debouncedSave = _.debounce(function () {
            tracker.saveItems();
        }, 200, false);

        if (options.getFolder) {
            this.getFolder = options.getFolder;
        }
        if (options.createFolder) {
            this.createFolder = options.createFolder;
        }

        this.items = new WinJS.Binding.List();
        this.defaultFolderPromise = tracker._getFolder(true);

        tracker.ready = false;
    }, {
        _getFolder: function (allowCreate) {
            if (this.folder)
                return WinJS.Promise.wrap(this.folder);
            else if (allowCreate) {
                return this.createFolder();
            } else {
                return this.getFolder();
            }
        },

        getFolder: function () {
            return localFolder.getFolderAsync("bgdownloads\\" + this.name, Windows.Storage.CreationCollisionOption.openIfExists);
        },

        createFolder: function (collision) {
            return localFolder.createFolderAsync("bgdownloads\\" + this.name, Windows.Storage.CreationCollisionOption.openIfExists);
        },

        _loadItemsFile: function () {
            var tracker = this;
            return tracker._getFolder(false).then(function (folder) {
                if (folder) {
                    return folder.getFileAsync(downloadedItemsFileName).then(function (file) {
                        return Windows.Storage.FileIO.readTextAsync(file).then(function (res) {
                            var readedItems = res ? JSON.parse(res) : {};
                            return readedItems;
                        });

                    }, function () {
                        return [];
                    });
                }
            });
        },

        verifyItems : function(){
            var tracker = this;
            var promises = [];
            tracker.items.forEach(function (observable) {
                if (observable.status == downloadStatus.downloading && observable.downloadid && !observable.download) {
                    promises.push(tracker._swapTempFile(observable).then(function () {
                        return tracker._checkItem(observable);
                    }));
                } else {
                    promises.push(tracker._checkItem(observable));
                }
            });

            return WinJS.Promise.join(promises).then(function () {
                tracker.saveItems();
            }).then(function () {
                return tracker.checkDownloads();
            });
        },

        loadItems: function () {
            var tracker = this;

            var processItems = function (downloads) {
                tracker.items.splice(0, tracker.items.length)
                return tracker._loadItemsFile().then(function (readedItems) {
                    if (readedItems && readedItems.items && readedItems.items.length) {
                        var promises = [];
                        readedItems.items.forEach(function (item) {
                            if (item) {
                                var observable = tracker._wrap(item, downloads);
                                tracker.items.push(observable);

                                if (observable.status == downloadStatus.downloading && observable.downloadid && !observable.download) {
                                    promises.push(tracker._swapTempFile(observable).then(function () {
                                        return tracker._checkItem(observable);
                                    }));
                                } else {
                                    promises.push(tracker._checkItem(observable));
                                }
                            }
                        });

                        return WinJS.Promise.join(promises).then(function () {
                            tracker.saveItems();
                            tracker.ready = true;
                        });                        
                    }
                    tracker.ready = true;
                    tracker.saveItems();
                }, function () {
                    tracker.ready = true;
                });
            }

            return WinJSContrib.BgDownloads.initDownloads().then(function (a) {
                return processItems(a);
            }, function (err) {
                return processItems([]);
            }).then(function () {
                return tracker.checkDownloads();
            }, function (err) {
                console.error("tracker error", err);
            });
        },

        saveItems: function (retries) {
            var tracker = this;
            return tracker.saveItemsPromise.then(function () {

                var items = tracker.items.map(tracker._unwrap);

                tracker.saveItemsPromise = tracker.defaultFolderPromise.then(function (folder) {
                    return folder.createFileAsync(downloadedItemsFileName, Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
                        return Windows.Storage.FileIO.writeTextAsync(file, JSON.stringify({
                            items: items
                        }));
                    });
                }, function (err) {
                    console.warn("error saving bgdownload tracker items", err);
                    retries = retries || 0;
                    if (retries < 2) {                        
                        return WinJS.Promise.timeout(20).then(function () {
                            tracker.saveItemsPromise = tracker.saveItems(retries + 1);
                            return tracker.saveItemsPromise;
                        });
                    } else {
                        console.error("error saving bgdownload tracker items", err);                        
                    }
                });

                return tracker.saveItemsPromise;
            });
        },

        attach: function (item, download) {
            var tracker = this;

            download.oncomplete = function () {
                item.download = null;
                item.status = downloadStatus.downloaded;
                tracker._swapTempFile(item).then(function () {
                    return tracker._checkItem(item);
                }).then(function () {
                    tracker.debouncedSave();
                    logger.debug("bgdownload complete", { data: item.data });
                    tracker.debouncedCheck();
                    tracker.dispatchEvent('downloadcomplete', { data: item.data });
                });
            }

            download.onerror = function (err) {
                item.status = downloadStatus.error;
                item.download = null;
                item.downloadid = null;
                tracker.removeFile(item).then(function () {
                    item.filepath = null;
                    tracker.debouncedSave();
                    tracker.debouncedCheck();
                });

                err.item = item.data;
                logger.debug("bgdownload error", { error: err, data: item.data });                
                tracker.dispatchEvent('downloaderror', err);
            }

            download.onprogress = function (progress) {
                item.progress = progress;
            }
        },

        _wrap: function (item, downloads) {
            var tracker = this;
            var observable = new ObservableItem()
            observable.data = item.data;
            observable.itemid = item.itemid;
            observable.folderpath = item.folderpath;
            observable.uri = item.uri;            
            observable.filename = item.filename;
            observable.filepath = item.filepath;
            observable.status = item.status;
            observable.downloadid = item.downloadid;

            if (observable.downloadid) {
                if (downloads && downloads.length) {
                    var downloads = downloads.filter(function (d) { return d.download.guid == observable.downloadid });
                    if (downloads && downloads.length) {
                        observable.download = downloads[0];
                        tracker.attach(observable, downloads[0]);
                    }
                }
            }

            return observable;
        },

        _checkItem: function (observable) {
            var tracker = this;

            var closeItem = function () {
                if (observable.status != 'downloadcompleted') {
                    observable.status = downloadStatus.downloaded;
                    var itemindex = tracker.items.indexOf(observable);
                    if (itemindex >= 0) {
                        tracker.items.splice(itemindex, 1);
                    }

                    if (tracker.handleItemProperties) {
                        return WinJS.Promise.as(tracker.handleItemProperties(observable.data, file)).then(function () {
                            observable.status = downloadStatus.completed;
                        }, function () {

                        });
                    } else {
                        observable.status = downloadStatus.completed;
                    }
                }
            }

            if (observable.status === downloadStatus.downloading || observable.status === downloadStatus.waiting || observable.status === downloadStatus.error) {
                return WinJS.Promise.wrap();
            }

            //if (observable.status === downloadStatus.downloading) {
            //    return Windows.Storage.StorageFile.getFileFromPathAsync(observable.filepath).then(function (file) {
            //        if (file) {
            //            observable.status = downloadStatus.downloaded;
            //            var targetfilename = observable.filepath.substr(0, observable.filepath.length - ".download".length);
            //            return closeItem();
            //        } else {
            //            observable.status = downloadStatus.waiting;
            //        }
            //    }, function () {
            //        observable.status = downloadStatus.waiting;
            //    });
            //}

            return Windows.Storage.StorageFile.getFileFromPathAsync(observable.filepath).then(function (file) {
                if (file) {
                    closeItem();
                }
            }, function () {
                observable.status = downloadStatus.error;
            });
        },

        _swapTempFile: function (observable) {
            return Windows.Storage.StorageFile.getFileFromPathAsync(observable.filepath).then(function (file) {
                if (file) {
                    observable.status = downloadStatus.downloaded;
                    //var targetfilename = observable.filepath.substr(0, observable.filepath.length - ".download".length);
                    return file.renameAsync(observable.filename).then(function (renamedfile) {
                        observable.filepath = file.path;
                    });
                }
            }, function (err) {
                //TODO check if target file exists
                observable.status = downloadStatus.error;
            });
        },

        _unwrap: function (observable) {
            var item = {
                itemid: observable.itemid,
                data: observable.data,
                uri: observable.uri,
                folderpath: observable.folderpath,
                filename: observable.filename,
                filepath: observable.filepath,
                downloadid: observable.downloadid,
                status: observable.status
            }
            return item;
        },

        add: function (item, itemid, folderpath, filename, uri) {
            var tracker = this;

            var existing = tracker.items.filter(function (i) {
                return i.itemid == itemid;
            });

            if (existing && existing.length)
                return;

            var observable = new ObservableItem()
            observable.itemid = itemid;
            observable.data = item;
            observable.folderpath = folderpath;
            observable.filename = filename;
            observable.uri = uri;
            observable.status = downloadStatus.waiting;

            tracker.items.push(observable);

            tracker.debouncedCheck();
            tracker.debouncedSave();
        },

        startDownloads: function (items) {
            var tracker = this;
            items.forEach(function (observable) {
                observable.status = downloadStatus.downloading;
            });

            return tracker.downloadsStart.then(function () {
                tracker.downloadsStart = WinJSContrib.Promise.waterfall(items, function (observable) {
                    var folderPromise = null;

                    if (observable.folderpath) {
                        folderPromise = Windows.Storage.StorageFolder.getFolderFromPathAsync(observable.folderpath);
                    } else {
                        folderPromise = tracker._getFolder(true);
                    }

                    return folderPromise.then(function (folder) {
                        if (WinJSContrib.BgDownloads.currentDownloads.length > tracker.maxConcurrentDownloads) {
                            observable.status = downloadStatus.waiting;
                            logger.debug("too much pendings dl " + WinJSContrib.BgDownloads.currentDownloads.length + "/" + tracker.maxConcurrentDownloads + " " + tracker.items.length);
                            return WinJS.Promise.wrap();
                        }

                        var dl = new WinJSContrib.BgDownloads.Download();
                        var filename = encodeURIComponent(observable.filename);
                        var uri = new Windows.Foundation.Uri(observable.uri)
                        return dl.start(uri, filename + ".download", folder, Windows.Storage.CreationCollisionOption.replaceExisting).then(function (download) {
                            logger.debug("bgdownload start " + WinJSContrib.BgDownloads.currentDownloads.length + "/" + tracker.maxConcurrentDownloads + " " + tracker.items.length);
                            observable.status = downloadStatus.downloading;
                            observable.download = download;
                            observable.downloadid = download.download.guid;
                            observable.filepath = download.file;
                            tracker.attach(observable, download);
                        }).then(null, function (err) {
                            logger.error("download start error " + err);
                            observable.status = downloadStatus.error;
                            observable.download = null;
                            observable.downloadid = null;
                        });
                    });
                }).then(function () {
                    return tracker.saveItems();
                });

                return tracker.downloadsStart;
            });
        },

        checkDownloads: function () {
            var tracker = this;

            if (WinJSContrib.BgDownloads.currentDownloads.length > tracker.maxConcurrentDownloads) {
                logger.debug("too much pendings " + WinJSContrib.BgDownloads.currentDownloads.length + "/" + tracker.maxConcurrentDownloads + " " + tracker.items.length);
                return WinJS.Promise.wrap();
            }

            logger.debug("checking downloads");
            return tracker.downloadsStart.then(function () {
                var notDownloading = tracker.items.filter(function (download) {
                    return !download.downloadid && (download.status == downloadStatus.waiting || download.status == downloadStatus.error);
                });
                logger.debug(notDownloading.length + " files to download" + WinJSContrib.BgDownloads.currentDownloads.length + "/" + tracker.maxConcurrentDownloads + " " + tracker.items.length);
                if (notDownloading.length) {
                    var pendingDownloads = WinJSContrib.BgDownloads.currentDownloads.length;

                    if (WinJSContrib.BgDownloads.currentDownloads.length < tracker.maxConcurrentDownloads) {
                        var itemsToTake = notDownloading.slice(0, tracker.maxConcurrentDownloads - pendingDownloads);
                        return tracker.startDownloads(itemsToTake);
                    }
                }

                return WinJS.Promise.wrap();
            });
        },

        removeFile: function (item) {
            var tracker = this;
            console.log('remove item file for ' + item.itemid);
            var idx = tracker.items.indexOf(item);
            if (idx >= 0) {
                return Windows.Storage.StorageFile.getFileFromPathAsync(item.filepath).then(function (file) {
                    return file.deleteAsync();
                }, function (err) {
                    console.error('file not found');
                    console.error(err);
                });
            }

            return WinJS.Promise.wrap();
        },

        remove: function (item) {
            var tracker = this;
            console.log('remove item ' + item.itemid);
            var idx = tracker.items.indexOf(item);
            if (idx >= 0) {
                return Windows.Storage.StorageFile.getFileFromPathAsync(item.filepath).then(function (file) {
                    return file.deleteAsync();
                }, function (err) {
                    console.error('file not found');
                    console.error(err);
                }).then(function () {
                    tracker.items.splice(idx, 1);
                    return tracker.saveItems();
                });
            }

            return WinJS.Promise.wrap();
        },

        exists: function (itemid) {
            var tracker = this;
            var matches = tracker.items.filter(function (i) {
                return i.itemid == itemid;
            });
            return matches.length > 0;
        },

        get: function (itemid) {
            var tracker = this;
            var matches = tracker.items.filter(function (i) {
                return i.itemid == itemid;
            });

            if (!matches || !matches.length)
                return null;

            return matches[0];
        }
    }), WinJS.Utilities.eventMixin, WinJS.Utilities.createEventProperties(['downloadcomplete', 'downloaderror']));
})();