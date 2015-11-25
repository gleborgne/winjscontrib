/* 
 * WinJS Contrib v2.1.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

var WinJSContrib = WinJSContrib || {};
(function () {
    var logger = WinJSContrib.Logs.getLogger("WinJSContrib.BgDownload");
    WinJSContrib.BgDownloads = WinJSContrib.BgDownloads || {};
    WinJSContrib.BgDownloads.currentDownloads = new WinJS.Binding.List();
    WinJSContrib.BgDownloads.currentUploads   = new WinJS.Binding.List();

    function initDownloads() {
        return new WinJS.Promise(function (complete, error) {
            Windows.Networking.BackgroundTransfer.BackgroundDownloader.getCurrentDownloadsAsync().then(function (downloads) {
                var downloadOperations = new WinJS.Binding.List();

                for (var i = 0; i < downloads.size; i++) {
                    var download = new WinJSContrib.BgDownloads.Download();
                    download.load(downloads[i]);
                    downloadOperations.push(download);
                }
                logger.info(downloadOperations.length + " pending downloads");
                WinJSContrib.BgDownloads.currentDownloads = downloadOperations;
                WinJS.Application.queueEvent({ type: "mcnbgdownload.init", downloads: downloadOperations });
                complete(downloadOperations);
            }, function (err) {
                var downloadOperations = new WinJS.Binding.List();
                WinJSContrib.BgDownloads.currentDownloads = downloadOperations;
                complete(downloadOperations);

                //error(err);
            });
        });
    }

    function initUploads() {
        return new WinJS.Promise(function (complete, error) {
            Windows.Networking.BackgroundTransfer.BackgroundUploader.getCurrentUploadsAsync().then(function (uploads) {
                var uploadOperations = new WinJS.Binding.List();

                for (var i = 0; i < uploads.size; i++) {
                    var upload = new WinJSContrib.BgDownloads.Upload();
                    upload.load(uploads[i]);
                    uploadOperations.push(upload);
                }
                logger.info(uploadOperations.length + " pending uploads");
                WinJSContrib.BgDownloads.currentUploads = uploadOperations;
                WinJS.Application.queueEvent({ type: "mcnbgupload.init", uploads: uploadOperations });
                complete(uploadOperations);
            }, function (err) {
                var uploadOperations = new WinJS.Binding.List();
                WinJSContrib.BgDownloads.currentUploads = uploadOperations;
                complete(uploadOperations);
            });
        });
    }

    WinJSContrib.BgDownloads.initDownloads = initDownloads;
    WinJSContrib.BgDownloads.initUploads = initUploads;

    WinJSContrib.BgDownloads.init = function () {
        return WinJS.Promise.join([initDownloads(), initUploads()]);
    }

    WinJSContrib.BgDownloads.Download = WinJS.Class.mix(WinJS.Class.define(function () {
        this._initObservable();
        this.progress = 0;
        this.download = null;
        this.promise = null;
        this.imageStream = null;
        this.oncomplete = null;
        this.onerror = null;
        this._completeCallbackBinded = this._completeCallback.bind(this);
        this._progressCallbackBinded = this._progressCallback.bind(this);
        this._errorCallbackBinded = this._errorCallback.bind(this);
    }, {
        start: function (uri, fileName, folder, collision, priority, disablePowerSavingLimitations) {
            var operation = this;

            if (typeof uri == 'string')
                uri = new Windows.Foundation.Uri(uri);

            folder = folder || Windows.Storage.ApplicationData.current.localFolder;
            priority = priority || Windows.Networking.BackgroundTransfer.BackgroundTransferPriority.default;
            collision = collision || Windows.Storage.CreationCollisionOption.failIfExists;
            return new WinJS.Promise(function (complete, error) {
                var onerror = function (err) {
                    operation._errorCallback(err);
                    error(err);
                }

                folder.createFileAsync(fileName, collision).then(function (newFile) {
                    var downloader = new Windows.Networking.BackgroundTransfer.BackgroundDownloader();
                    logger.verbose("bg download using URI: " + uri.absoluteUri);

                    operation.download = downloader.createDownload(uri, newFile);
                    operation.download.priority = priority;
                    WinJSContrib.BgDownloads.currentDownloads.push(operation);
                    operation.file = operation.download.resultFile.path;
                    operation.progress = 0;

                    if (!disablePowerSavingLimitations) {
                        // Start the download and persist the promise to be able to cancel the download.
                        operation.promise = operation.download.startAsync().then(operation._completeCallbackBinded, operation._errorCallbackBinded, operation._progressCallbackBinded);
                        complete(operation);
                        return;
                    }

                    // By requesting unconstrained downloads, the app can request the system to not suspend any of the
                    // downloads in the list for power saving reasons. Use this API with caution...
                    return Windows.Networking.BackgroundTransfer.BackgroundDownloader.requestUnconstrainedDownloadsAsync([operation.download]).then(function (result) {
                        logger.verbose("Request for unconstrained downloads has been " + (result.isUnconstrained ? "granted" : "denied"));

                        operation.promise = operation.download.startAsync().then(operation._completeCallbackBinded, operation._errorCallbackBinded, operation._progressCallbackBinded);
                        complete(operation);
                    }, onerror);

                }, onerror);
            });

        },

        // On application activation, reassign callbacks for a download
        // operation persisted from previous application state.
        load: function (loadedDownload) {
            var operation = this;
            operation.download = loadedDownload;
            logger.debug("Found download: " + operation.download.guid + " from previous application run.");
            operation.promise = operation.download.attachAsync().then(operation._completeCallbackBinded, operation._errorCallbackBinded, operation._progressCallbackBinded);
            operation.file = operation.download.resultFile.path;
            operation.progress = 0;
        },

        // Cancel download.
        cancel: function () {
            var operation = this;
            if (operation.promise) {

                operation.promise.cancel();
                operation.promise = null;
                logger.verbose("Canceling download: " + operation.download.guid);
            }
            else {
                logger.verbose("Download " + operation.download.guid + " already canceled.");
            }
        },

        // Resume download - download will restart if server does not allow range-requests.
        resume: function () {
            var operation = this;
            if (operation.download) {
                if (download.progress.status === Windows.Networking.BackgroundTransfer.BackgroundTransferStatus.pausedByApplication) {
                    operation.download.resume();
                    logger.debug("Resuming download: " + operation.download.guid);
                }
                else {
                    logger.debug("Download " + operation.download.guid +
                        " is not paused, it may be running, completed, canceled or in error.");
                }
            }
        },

        // Pause download.
        pause: function () {
            var operation = this;
            if (operation.download) {
                if (operation.download.progress.status === Windows.Networking.BackgroundTransfer.BackgroundTransferStatus.running) {
                    operation.download.pause();
                    logger.debug("Pausing download: " + operation.download.guid + "");
                }
                else {
                    logger.debug("Download " + operation.download.guid +
                        " is not running, it may be paused, completed, canceled or in error.");
                }
            }
        },

        // Returns true if this is the download identified by the guid.
        hasGuid: function (guid) {
            var operation = this;
            return operation.download.guid === guid;
        },

        // Removes download operation from global array.
        removeDownload: function (guid) {
            var operation = this;
            if (WinJSContrib.BgDownloads.currentDownloads) {
                WinJSContrib.BgDownloads.currentDownloads.forEach(function (op, index) {
                    if (op.hasGuid(guid)) {
                        WinJSContrib.BgDownloads.currentDownloads.splice(index, 1);
                    }
                });
            }
        },

        // Progress callback.
        _progressCallback: function (arg) {
            var operation = this;
            operation.progress = (100 * operation.download.progress.bytesReceived / operation.download.progress.totalBytesToReceive) << 0;
            if (operation.onprogress) {
                operation.onprogress(operation.progress);
            }
        },

        // Completion callback.
        _completeCallback: function () {
            var operation = this;

            operation.ended = true;
            if (operation.download && operation.download.progress.status === Windows.Networking.BackgroundTransfer.BackgroundTransferStatus.completed) {
                WinJS.Application.queueEvent({ type: "mcnbgdownload.success", uploadId: operation.download.guid, operation: operation });
                if (operation.oncomplete) {
                    operation.oncomplete();
                    operation.oncomplete = null;
                    operation.onerror = null;
                }
                else {
                    operation.notify("complete");
                }
            }
            else {
                if (operation.download) WinJS.Application.queueEvent({ type: "mcnbgdownload.error", uploadId: operation.download.guid, operation: operation });
                operation._errorCallback('transfert problem');
            }

            if (operation.download) {
                try {
                    var responseInfo = operation.download.getResponseInformation();
                    logger.verbose(operation.download.guid + " - download complete. Status code: " + responseInfo.statusCode + "");
                    WinJS.Application.queueEvent({ type: 'McnBgDownload', error:false, id: operation.download.guid, operation: operation });
                    //displayStatus("Completed: " + download.guid + ", Status Code: " + responseInfo.statusCode);
                } catch (err) {
                    logger.error(err);
                }
                operation.removeDownload(operation.download.guid);
            }
        },

        // Error callback.
        _errorCallback: function (err) {
            var operation = this;
            operation.ended = true;
            operation.error = err;

            if (operation.download) {
                WinJS.Application.queueEvent({ type: "mcnbgdownload.error", uploadId: operation.download.guid, operation: operation });
                operation.download.resultFile.deleteAsync().done(function () {
                }, function () { });
                operation.removeDownload(operation.download.guid);
                WinJS.Application.queueEvent({ type: 'McnBgDownload', error: true, id: operation.download.guid, operation: operation });
                logger.warn(operation.download.guid + " - download completed with error.");
            }

            if (operation.onerror) {
                operation.onerror(err);
                operation.onerror = null;
            }
            else {
                operation.notify("error");
            }
            logger.warn(err);
        }
    }), WinJS.Binding.mixin, WinJS.Binding.expandProperties({ progress: 0 }));

    WinJSContrib.BgDownloads.Download.run = function (uri, fileName, folder, collision, priority, requestUnconstrainedDownload) {
        var operation = null;
        WinJSContrib.BgDownloads.currentDownloads.forEach(function (op) {
            if (op.download.requestedUri.toString() == uri.toString()) {
                operation = op;
            }
        });

        if (!operation) {
            operation = new WinJSContrib.BgDownloads.Download();
            return operation.start(uri, fileName, folder, collision, priority, requestUnconstrainedDownload).then(function () {
                return operation;
            });
        }

        return WinJS.Promise.wrap(operation);
    };

    WinJSContrib.BgDownloads.Upload = WinJS.Class.mix(WinJS.Class.define(function () {
        this._initObservable();
        this.progress = 0;
        this.download = null;
        this.promise = null;
        this.imageStream = null;
        this.oncomplete = null;
        this.onerror = null;
        this._completeCallbackBinded = this._completeCallback.bind(this);
        this._progressCallbackBinded = this._progressCallback.bind(this);
        this._errorCallbackBinded = this._errorCallback.bind(this);
    }, {
        start: function (uri, uploadedFile, priority, disablePowerSavingLimitations) {
            var operation = this;

            priority = priority || Windows.Networking.BackgroundTransfer.BackgroundTransferPriority.default;

            return new WinJS.Promise(function (complete, error) {
                var onerror = function (err) {
                    operation._errorCallback(err);
                    error(err);
                }


                var uploader = new Windows.Networking.BackgroundTransfer.BackgroundUploader();
                logger.verbose("bg upload using URI: " + uri.absoluteUri);
                
                operation.upload = uploader.createUpload(uri, uploadedFile);
                operation.upload.priority = priority;
                WinJSContrib.BgDownloads.currentUploads.push(operation);
                operation.file = operation.upload.sourceFile.path;
                operation.progress = 0;

                if (!disablePowerSavingLimitations) {
                    // Start the upload and persist the promise to be able to cancel the upload.
                    operation.promise = operation.upload.startAsync().then(operation._completeCallbackBinded, operation._errorCallbackBinded, operation._progressCallbackBinded);
                    complete(operation);
                    return;
                }

                // By requesting unconstrained uploads, the app can request the system to not suspend any of the
                // uploads in the list for power saving reasons. Use this API with caution...
                return Windows.Networking.BackgroundTransfer.BackgroundUploader.requestUnconstrainedUploadsAsync([operation.upload]).then(function (result) {
                    logger.verbose("Request for unconstrained uploads has been " + (result.isUnconstrained ? "granted" : "denied"));

                    operation.promise = operation.upload.startAsync().then(operation._completeCallbackBinded, operation._errorCallbackBinded, operation._progressCallbackBinded);
                    complete(operation);
                }, onerror);
            });

        },

        // On application activation, reassign callbacks for an upload
        // operation persisted from previous application state.
        load: function (loadedUpload) {
            var operation = this;
            operation.upload = loadedUpload;
            logger.debug("Found upload: " + operation.upload.guid + " from previous application run.");
            operation.promise = operation.upload.attachAsync().then(operation._completeCallbackBinded, operation._errorCallbackBinded, operation._progressCallbackBinded);
            operation.file = operation.upload.sourceFile.path;
            operation.progress = 0;
        },

        // Cancel upload.
        cancel: function () {
            var operation = this;
            if (operation.promise) {

                operation.promise.cancel();
                operation.promise = null;
                logger.debug("Canceling upload: " + operation.upload.guid);
            }
            else {
                logger.debug("upload " + operation.upload.guid + " already canceled.");
            }
        },

        // Resume upload - upload will restart if server does not allow range-requests.
        resume: function () {
            var operation = this;
            if (operation.upload) {
                if (operation.upload.progress.status === Windows.Networking.BackgroundTransfer.BackgroundTransferStatus.pausedByApplication) {
                    operation.upload.resume();
                    logger.debug("Resuming upload: " + operation.upload.guid);
                }
                else {
                    logger.debug("upload " + operation.upload.guid +
                        " is not paused, it may be running, completed, canceled or in error.");
                }
            }
        },

        // Pause upload.
        pause: function () {
            var operation = this;
            if (operation.upload) {
                if (operation.upload.progress.status === Windows.Networking.BackgroundTransfer.BackgroundTransferStatus.running) {
                    operation.upload.pause();
                    logger.debug("Pausing upload: " + operation.upload.guid + "");
                }
                else {
                    logger.debug("upload " + operation.upload.guid +
                        " is not running, it may be paused, completed, canceled or in error.");
                }
            }
        },

        // Returns true if this is the download identified by the guid.
        hasGuid: function (guid) {
            var operation = this;
            return operation.upload.guid === guid;
        },

        // Removes upload operation from global array.
        removeUpload: function (guid) {
            var operation = this;
            if (WinJSContrib.BgDownloads.currentUploads) {
                WinJSContrib.BgDownloads.currentUploads.forEach(function (op, index) {
                    if (op.hasGuid(guid)) {
                        WinJSContrib.BgDownloads.currentUploads.splice(index, 1);
                    }
                });
            }
        },

        // Progress callback.
        _progressCallback: function (arg) {
            var operation = this;
            operation.progress = (100 * operation.upload.progress.bytesSended / operation.upload.progress.totalBytesToSend) << 0;
        },

        // Completion callback.
        _completeCallback: function () {
            var operation = this;

            operation.ended = true;
            if (operation.upload && operation.upload.progress.status === Windows.Networking.BackgroundTransfer.BackgroundTransferStatus.completed) {
                WinJS.Application.queueEvent({ type: "mcnbgupload.success", uploadId: operation.upload.guid, file: operation.upload.sourceFile.path, operation: operation });
                if (operation.oncomplete) {
                    operation.oncomplete();
                    operation.oncomplete = null;
                    operation.onerror = null;
                }
                else {
                    operation.notify("complete");
                }
            }
            else {
                if (operation.upload) WinJS.Application.queueEvent({ type: "mcnbgupload.error", uploadId: operation.upload.guid, file: operation.upload.sourceFile.path, uri: operation.upload.requestedUri, operation: operation });
                operation._errorCallback('transfert problem');
            }

            if (operation.upload) {
                try {
                    var responseInfo = operation.upload.getResponseInformation();
                    logger.verbose(operation.upload.guid + " - upload complete. Status code: " + responseInfo.statusCode + "");
                } catch (err) {
                    logger.error(err);
                }
                operation.removeUpload(operation.upload.guid);
            }
        },

        // Error callback.
        _errorCallback: function (err) {
            var operation = this;
            operation.ended = true;
            operation.error = err;

            if (operation.upload) {
                WinJS.Application.queueEvent({ type: "mcnbgupload.error", uploadId: operation.upload.guid, file: operation.upload.sourceFile.path, uri: operation.upload.requestedUri, operation: operation });
                operation.removeUpload(operation.upload.guid);
                logger.warn(operation.upload.guid + " - upload completed with error.");
            }

            if (operation.onerror) {
                operation.onerror(err);
                operation.onerror = null;
            }
            else {
                operation.notify("error");
            }
            logger.warn(err);
        }
    }), WinJS.Binding.mixin, WinJS.Binding.expandProperties({ progress: 0 }));

    WinJSContrib.BgDownloads.Upload.run = function (uri, uploadedFile, priority, requestUnconstrainedUpload) {
        var operation = null;
        WinJSContrib.BgDownloads.currentUploads.forEach(function (op) {
            if (op.upload.requestedUri.toString() == uri.toString()) {
                operation = op;
            }
        });

        if (!operation) {
            operation = new WinJSContrib.BgDownloads.Upload();
            return operation.start(uri, uploadedFile, priority, requestUnconstrainedUpload).then(function () {
                return operation;
            });
        }

        return WinJS.Promise.wrap(operation);
    };
})();
