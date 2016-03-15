/* 
 * WinJS Contrib v2.1.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

/// <reference path="winjscontrib.core.js" />
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

    var TrackerState = WinJS.Binding.define({ "nbPendings": 0 });

    WinJSContrib.BgDownloads.Tracker = WinJS.Class.mix(WinJS.Class.define(function (name, options) {
        var tracker = this;
        tracker.name = name;
        options = options || {};
        tracker.state = new TrackerState();

        this.tempExtension = ".download";
        this.saveItemsPromise = WinJS.Promise.wrap();
        this.downloadsStart = WinJS.Promise.wrap();
        this.folder = options.folder;
        this.retryOnError = options.retryOnError;
        this.handleItemProperties = options.handleItemProperties;
        this.maxConcurrentDownloads = options.maxConcurrentDownloads || 300;
        this.debouncedCheck = _.debounce(function () {
            tracker.checkDownloads();
        }, 1000, false);

        this.debouncedVerif = _.debounce(function () {
            tracker.verifyItems();
        }, 200, false);

        this.debouncedSave = _.throttle(function () {
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
        this.refreshInterval = null;
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

                    });
                }
            }, function (err) {
                logger.error("internal error loading items", err);
                return [];
            });
        },

        verifyItems: function () {
            var tracker = this;
            var promises = [];
            if (tracker.items.length) {
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
                    return tracker.saveItems();
                }).then(function () {
                    tracker.debouncedCheck();
                });
            } else {
                return WinJS.Promise.wrap();
            }
        },

        startLoop: function () {
            var tracker = this;
            if (!tracker.refreshInterval) {
                if (tracker.items.length > 0 || WinJSContrib.BgDownloads.currentDownloads.length > 0) {
                    tracker.refreshInterval = setInterval(function () {
                        tracker.debouncedCheck();
                    }, 60000);
                }
            }
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
                            if (tracker.items.length) {
                                tracker.startLoop();
                            }
                            tracker.debouncedSave();
                            tracker.ready = true;
                        });
                    }
                    tracker.ready = true;
                    tracker.debouncedSave();
                }, function (err) {
                    logger.error("error loading items", err);
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
                logger.error("tracker error", err);
                return WinJS.Promise.wrap();
            });
        },

        saveItems: function (retries) {
            var tracker = this;
            return tracker.saveItemsPromise.then(function () {

                var items = tracker.items.map(tracker._unwrap);

                var saveitemsPromise = tracker.defaultFolderPromise.then(function (folder) {
                    return folder.createFileAsync(downloadedItemsFileName, Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
                        return Windows.Storage.FileIO.writeTextAsync(file, JSON.stringify({
                            items: items
                        })).then(function () {
                            logger.verbose("items saved");
                        });
                    });
                }).then(null, function (err) {
                    logger.warn("error saving bgdownload tracker items", err);
                    retries = retries || 0;
                    if (retries < 2) {
                        return WinJS.Promise.timeout(20).then(function () {
                            tracker.saveItemsPromise = WinJS.Promise.wrap();
                            tracker.saveItems(retries + 1);
                            return tracker.saveItemsPromise;
                        });
                    } else {
                        logger.error("error saving bgdownload tracker items", err);
                    }
                });

                saveitemsPromise.then(function () {
                    if (tracker.saveItemsPromise == saveitemsPromise) {
                        logger.verbose("refresh save promise");
                        tracker.saveItemsPromise = WinJS.Promise.wrap();
                    }
                });

                tracker.saveItemsPromise = saveitemsPromise;

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
                }, function (err) {
                    logger.error("error swapping temp file", err);
                    return WinJS.Promise.wrap();
                }).then(function () {
                    tracker.debouncedSave();
                    if (item.errorMessage) {
                        logger.debug("bgdownload complete with errors", { data: item.data, message: item.errorMessage });
                    } else {
                        logger.debug("bgdownload complete", { data: item.data, message: item.errorMessage });
                    }

                    tracker.debouncedCheck();
                    tracker.dispatchEvent('downloadcomplete', { data: item.data });
                }, function (err) {
                    logger.error("error removing item", err);
                    return WinJS.Promise.wrap();
                });
            }

            download.onerror = function (err) {
                item.status = downloadStatus.error;
                item.download = null;
                item.downloadid = null;
                item.errorMessage = err.message;

                var p = WinJS.Promise.wrap();
                if (err.asyncOpType && err.asyncOpType == "Windows.Foundation.IAsyncOperationWithProgress`2<Windows.Networking.BackgroundTransfer.DownloadOperation,Windows.Networking.BackgroundTransfer.DownloadOperation>") {
                    if (err.message && err.message.indexOf("(404)") > 0) {
                        item.status = downloadStatus.downloaded;
                        logger.warn("remote item not found, skipping item " + item.itemid);
                        p = tracker._checkItem(item, true);
                    } else if (err.message && err.message.indexOf("(500)") > 0) {
                        item.status = downloadStatus.downloaded;
                        logger.warn("server error, skipping item " + item.itemid);
                        p = tracker._checkItem(item, true);
                    }
                }

                p.then(function () {
                    return WinJS.Promise.timeout(5);
                }).then(function () {
                    return tracker.removeFile(item);
                }).then(function () {
                    item.filepath = null;
                }).then(function () {
                    tracker.debouncedSave();
                    tracker.debouncedCheck();
                }, function (err) {
                    logger.error("error removing file on error", err);
                    return WinJS.Promise.wrap();
                });

                err.item = item.data;
                logger.debug("bgdownload error", { error: err, data: item.data });
                tracker.dispatchEvent('downloaderror', { data: item.data, error: err });
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

        _checkItem: function (observable, ignoreErrors) {
            var tracker = this;

            if (!observable.itemCheckPromise) {
                observable.itemCheckPromise = WinJS.Promise.wrap();
            }

            return observable.itemCheckPromise.then(function () {
                var closeItem = function () {
                    if (observable.status != downloadStatus.completed) {
                        observable.status = downloadStatus.downloaded;

                        tracker.remove(observable);

                        if (tracker.handleItemProperties) {
                            return WinJS.Promise.as(tracker.handleItemProperties(observable.data, file)).then(function () {
                                observable.status = downloadStatus.completed;
                            }, function (err) {
                                logger.error("error handling tracker items properties", err);
                                return WinJS.Promise.wrap();
                            });
                        } else {
                            observable.status = downloadStatus.completed;
                        }
                    }
                }

                if ((observable.status === downloadStatus.downloading && observable.downloadid) || observable.status === downloadStatus.waiting) {
                    return WinJS.Promise.wrap();
                }

                if (observable.status === downloadStatus.error) {
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

                observable.itemCheckPromise = Windows.Storage.StorageFile.getFileFromPathAsync(observable.filepath).then(function (file) {
                    if (file) {
                        return closeItem();
                    }
                }, function (err) {
                    if (ignoreErrors) {
                        return closeItem();
                    } else {
                        observable.status = downloadStatus.error;
                    }
                    return WinJS.Promise.wrap();
                });

                return observable.itemCheckPromise;
            });
        },

        _swapTempFile: function (observable) {
            var ext = this.tempExtension;
            if (observable.filepath.indexOf(ext) > 0) {
                return Windows.Storage.StorageFile.getFileFromPathAsync(observable.filepath).then(function (file) {
                    if (file) {
                        //var targetfilename = observable.filepath.substr(0, observable.filepath.length - ".download".length);
                        return file.renameAsync(observable.filename, Windows.Storage.NameCollisionOption.replaceExisting).then(function (renamedfile) {
                            observable.status = downloadStatus.downloaded;
                            observable.filepath = file.path;
                        });
                    }
                }, function (err) {
                    logger.error("internal error swapping temp file", err);
                    //TODO check if target file exists
                    observable.status = downloadStatus.error;
                    return WinJS.Promise.wrap();
                });
            } else {
                logger.error("invalid temp file");
                observable.status = downloadStatus.error;
                return WinJS.Promise.wrap();
            }
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

        add: function (item, itemid, folderpath, filename, uri, immediate) {
            var tracker = this;

            var existing = tracker.items.filter(function (i) {
                return i.itemid == itemid;
            });

            if (existing && existing.length)
                return WinJS.Promise.wrap(existing[0]);

            var observable = new ObservableItem();
            observable.itemid = itemid;
            observable.data = item;
            observable.folderpath = folderpath;
            observable.filename = filename;
            observable.uri = uri;
            observable.status = downloadStatus.waiting;

            tracker.items.push(observable);

            tracker.debouncedSave();

            if (immediate) {
                return this.startDownloads([observable]).then(function(downloads) {
                    if (downloads && downloads.length)
                        return downloads[0];
                });
            }

            tracker.debouncedCheck();
            
            return WinJS.Promise.wrap(observable);
        },

        startDownloads: function (items) {
            var tracker = this;
            items.forEach(function (observable) {
                observable.status = downloadStatus.downloading;
            });

            return tracker.downloadsStart.then(function () {
                var promises = [];

                items.forEach(function (observable) {
                    var folderPromise = null;
                    if (!observable)
                        return;

                    if (observable.folderpath) {
                        folderPromise = Windows.Storage.StorageFolder.getFolderFromPathAsync(observable.folderpath);
                    } else {
                        folderPromise = tracker.defaultFolderPromise;
                    }

                    var downloadPromise = folderPromise.then(function (folder) {
                        if (WinJSContrib.BgDownloads.currentDownloads.length > tracker.maxConcurrentDownloads) {
                            observable.status = downloadStatus.waiting;
                            logger.debug("too much pendings dl " + WinJSContrib.BgDownloads.currentDownloads.length + " / " + tracker.maxConcurrentDownloads + " " + tracker.items.length);
                            return WinJS.Promise.wrap(null);
                        }

                        var dl = new WinJSContrib.BgDownloads.Download();
                        var filename = encodeURIComponent(observable.filename);
                        var uri = new Windows.Foundation.Uri(observable.uri);
                        var startDownload = dl.start(uri, filename + tracker.tempExtension, folder, Windows.Storage.CreationCollisionOption.replaceExisting).then(function (download) {
                            logger.debug("bgdownload start " + WinJSContrib.BgDownloads.currentDownloads.length + " / " + tracker.maxConcurrentDownloads + " " + tracker.items.length);
                            observable.status = downloadStatus.downloading;
                            observable.download = download;
                            observable.downloadid = download.download.guid;
                            observable.filepath = download.file;
                            tracker.attach(observable, download);
                            return observable;
                        }).then(null, function (err) {
                            logger.error("download start error " + err);
                            observable.status = downloadStatus.error;
                            observable.download = null;
                            observable.downloadid = null;
                            return observable;
                        });

                        return startDownload;
                    });
                    promises.push(downloadPromise);
                });

                var oppromise = WinJS.Promise.join(promises);
                //oppromise = WinJS.Promise.timeout(20000, oppromise);
                oppromise = oppromise.then(function (data) {
                    return data;
                }, function (err) {
                    logger.error("error starting dowloads", err);
                    return WinJS.Promise.wrap();
                });
                tracker.downloadsStart = oppromise;

                oppromise.then(function () {
                    if (tracker.downloadsStart == oppromise) {
                        logger.verbose("refresh start downloads promise");
                        tracker.downloadsStart = WinJS.Promise.wrap();
                    }
                    return tracker.debouncedSave();
                }, function (err) {
                    logger.warn("error saving bgdownload items ", err);
                });

                return tracker.downloadsStart;
            });
        },

        checkDownloads: function () {
            var tracker = this;
            tracker.startLoop();

            if (WinJSContrib.BgDownloads.currentDownloads.length > tracker.maxConcurrentDownloads) {
                logger.debug("checking download, too much pendings " + WinJSContrib.BgDownloads.currentDownloads.length + " / " + tracker.maxConcurrentDownloads + " " + tracker.items.length);
                return WinJS.Promise.wrap();
            }

            return tracker.downloadsStart.then(function () {
                var notDownloading = tracker.checkState();
                logger.debug("checking download " + notDownloading.length + " files to download " + WinJSContrib.BgDownloads.currentDownloads.length + " / " + tracker.maxConcurrentDownloads + " " + tracker.items.length);
                if (notDownloading.length) {
                    var pendingDownloads = WinJSContrib.BgDownloads.currentDownloads.length;

                    if (WinJSContrib.BgDownloads.currentDownloads.length < tracker.maxConcurrentDownloads) {
                        var itemsToTake = notDownloading.slice(0, tracker.maxConcurrentDownloads - pendingDownloads);
                        return tracker.startDownloads(itemsToTake);
                    }
                }

                return WinJS.Promise.wrap();
            }).then(function () {
                tracker.checkState();
            });
        },

        checkState: function () {
            var tracker = this;
            var notDownloading = tracker.items.filter(function (download) {
                return (download.status == downloadStatus.waiting || download.status == downloadStatus.error);
            });

            tracker.state.nbPendings = notDownloading.length + WinJSContrib.BgDownloads.currentDownloads.length;
            if (tracker.state.nbPendings === 0) {
                tracker.debouncedVerif();
            }

            if (tracker.refreshInterval && tracker.items.length == 0 && WinJSContrib.BgDownloads.currentDownloads.length == 0) {
                clearInterval(tracker.refreshInterval);
                tracker.refreshInterval = null;
            }

            return notDownloading;
        },

        removeFile: function (item) {
            var tracker = this;

            return new WinJS.Promise(function (complete, error) {
                logger.verbose('remove item file for ' + item.itemid);
                var idx = tracker.items.indexOf(item);
                if (idx >= 0) {
                    logger.verbose('remove item file for ' + item.itemid + ' ' + item.filepath);
                    Windows.Storage.StorageFile.getFileFromPathAsync(item.filepath).then(function (file) {
                        if (file) {
                            file.deleteAsync().then(complete, error);
                        } else {
                            complete();
                        }
                    }, function (err) {
                        logger.debug('file not found for deletion ' + item.filepath, err);
                        complete();
                    });
                }
                else {
                    complete();
                }

            });
        },

        remove: function (item) {
            var tracker = this;

            var idx = tracker.items.indexOf(item);
            if (idx >= 0) {
                logger.verbose('remove item from list ' + item.itemid);
                tracker.items.splice(idx, 1);
                return Windows.Storage.StorageFile.getFileFromPathAsync(item.filepath).then(function (file) {
                    var tempext = tracker.tempExtension;
                    if (file.path.indexOf(tempext) == (file.path.length - tempext.length))
                        return file.deleteAsync();
                }, function (err) {
                    logger.debug('file not found', err);
                    return WinJS.Promise.wrap();
                }).then(function () {
                    tracker.debouncedSave();
                });
            } else {
                logger.warn('item ' + item.itemid + ' not found');
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
