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

    WinJSContrib.BgDownloads.Tracker = WinJS.Class.mix(WinJS.Class.define(function (name, options) {
        var tracker = this;
        tracker.name = name;
        options = options || {};

        this.folder = options.folder;
        this.handleItemProperties = options.handleItemProperties;
        if (options.getFolder) {
            this.getFolder = options.getFolder;
        }
        if (options.createFolder) {
            this.createFolder = options.createFolder;
        }
        this.items = new WinJS.Binding.List();
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
            return localFolder.getFolderAsync("downloads\\" + this.name, Windows.Storage.CreationCollisionOption.openIfExists);
        },

        createFolder: function (collision) {
            return localFolder.createFolderAsync("downloads\\" + this.name, Windows.Storage.CreationCollisionOption.openIfExists);
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

        loadItems: function () {
            var tracker = this;

            var processItems = function (downloads) {
                tracker.items.splice(0, tracker.items.length)
                return tracker._loadItemsFile().then(function (readedItems) {
                    if (readedItems && readedItems.items && readedItems.items.length) {
                        readedItems.items.forEach(function (item) {
                            if (item) {
                                var observable = tracker._wrap(item, downloads);
                                tracker.items.push(observable);
                            }
                        });

                    }
                    tracker.ready = true;
                    tracker.saveItems();
                }, function () {
                    tracker.ready = true;
                });
            }

            return WinJSContrib.BgDownloads.initDownloads().then(function (a) { return processItems(a) }, function (err) {
                return processItems([]);
            });
        },

        saveItems: function () {
            var tracker = this;
            var items = tracker.items.map(tracker._unwrap);

            return tracker._getFolder(true).then(function (folder) {
                return folder.createFileAsync(downloadedItemsFileName, Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
                    return Windows.Storage.FileIO.writeTextAsync(file, JSON.stringify({
                        items: items
                    }));
                });
            });
        },

        attach: function (item, download) {
            var tracker = this;
            download.oncomplete = function () {
                item.download = null;
                tracker._checkItem(item).then(function () {
                    tracker.saveItems();
                })

                tracker.dispatchEvent('downloadcomplete', { data: item.data });
            }

            download.onerror = function (err) {
                item.status = 'error';
                item.download = null;
                tracker.saveItems();
                err.item = item.data;
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
            observable.filename = item.filename;
            observable.filepath = item.filepath;
            observable.status = item.status;
            observable.downloadid = item.downloadid;

            if (observable.downloadid && downloads && downloads.length) {
                var downloads = downloads.filter(function (d) { return d.download.guid == observable.downloadid });
                if (downloads && downloads.length) {
                    observable.download = downloads[0];
                    tracker.attach(observable, downloads[0]);
                }
            } else {
                tracker._checkItem(observable);
            }



            return observable;
        },

        _checkItem: function (observable) {
            var tracker = this;
            return Windows.Storage.StorageFile.getFileFromPathAsync(observable.filepath).then(function (file) {
                if (file) {
                    if (observable.status != 'ready') {
                        observable.status = 'downloaded';

                        if (tracker.handleItemProperties) {
                            return WinJS.Promise.as(tracker.handleItemProperties(observable.data, file)).then(function () {
                                observable.status = 'ready';
                            }, function () {

                            });
                        } else {
                            observable.status = 'ready';
                        }
                    }
                }
            }, function () {
                observable.status = 'unavailable';
            });
        },

        _unwrap: function (observable) {
            var item = {
                itemid: observable.itemid,
                data: observable.data,
                filename: observable.filename,
                filepath: observable.filepath,
                downloadid: observable.downloadid,
                status: observable.status
            }
            return item;
        },

        add: function (item, itemid, filename, uri) {
            var tracker = this;
            var filename = encodeURIComponent(filename);
            return tracker._getFolder(true).then(function (folder) {
                var dl = new WinJSContrib.BgDownloads.Download();
                return dl.start(uri, filename, folder, Windows.Storage.CreationCollisionOption.replaceExisting).then(function (download) {
                    var observable = new ObservableItem()
                    observable.itemid = itemid;
                    observable.data = item;
                    observable.downloadid = download.download.guid;
                    observable.download = download;
                    observable.filename = filename;
                    observable.filepath = download.file;
                    observable.status = 'downloading';
                    tracker.attach(observable, download);
                    tracker.items.push(observable);

                    return tracker.saveItems();
                });
            });
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