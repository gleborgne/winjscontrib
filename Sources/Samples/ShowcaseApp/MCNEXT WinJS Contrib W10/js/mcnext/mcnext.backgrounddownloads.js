var MCNEXT = MCNEXT || {};
(function () {
    MCNEXT.BgDownloads = MCNEXT.BgDownloads || {};

    MCNEXT.BgDownloads.init = function () {
        return Windows.Networking.BackgroundTransfer.BackgroundDownloader.getCurrentDownloadsAsync().then(function (downloads) {
            var downloadOperations = new WinJS.Binding.List();

            for (var i = 0; i < downloads.size; i++) {
                var download = new MCNEXT.BgDownloads.Operation();
                download.load(downloads[i]);
                downloadOperations.push(download);
            }

            MCNEXT.BgDownloads.currentDownloads = downloadOperations;
            return downloadOperations;
        });
    }

    MCNEXT.BgDownloads.Operation = WinJS.Class.mix(WinJS.Class.define(function () {
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
                    printLog("bg download using URI: " + uri.absoluteUri);

                    operation.download = downloader.createDownload(uri, newFile);
                    operation.download.priority = priority;
                    MCNEXT.BgDownloads.currentDownloads.push(operation);
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
                        printLog("Request for unconstrained downloads has been " + (result.isUnconstrained ? "granted" : "denied"));

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
            printLog("Found download: " + operation.download.guid + " from previous application run.");
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
                printLog("Canceling download: " + operation.download.guid);
            }
            else {
                printLog("Download " + operation.download.guid + " already canceled.");
            }
        },

        // Resume download - download will restart if server does not allow range-requests.
        resume: function () {
            var operation = this;
            if (operation.download) {
                if (download.progress.status === Windows.Networking.BackgroundTransfer.BackgroundTransferStatus.pausedByApplication) {
                    operation.download.resume();
                    printLog("Resuming download: " + operation.download.guid);
                }
                else {
                    printLog("Download " + operation.download.guid +
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
                    printLog("Pausing download: " + operation.download.guid + "");
                }
                else {
                    printLog("Download " + operation.download.guid +
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
            if (MCNEXT.BgDownloads.currentDownloads) {
                MCNEXT.BgDownloads.currentDownloads.forEach(function (op, index) {
                    if (op.hasGuid(guid)) {
                        MCNEXT.BgDownloads.currentDownloads.splice(index, 1);
                    }
                });
            }
        },

        // Progress callback.
        _progressCallback: function (arg) {
            var operation = this;
            operation.progress = (100 * operation.download.progress.bytesReceived / operation.download.progress.totalBytesToReceive) << 0;
        },

        // Completion callback.
        _completeCallback: function () {
            var operation = this;

            operation.ended = true;
            if (operation.download && operation.download.progress.status === Windows.Networking.BackgroundTransfer.BackgroundTransferStatus.completed) {
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
                operation._errorCallback('transfert problem');
            }

            if (operation.download) {
                try {
                    var responseInfo = operation.download.getResponseInformation();
                    printLog(operation.download.guid + " - download complete. Status code: " + responseInfo.statusCode + "");
                    //displayStatus("Completed: " + download.guid + ", Status Code: " + responseInfo.statusCode);
                } catch (err) {
                    printLog(err);
                }
                operation.removeDownload(operation.download.guid);
            }
        },

        // Error callback.
        _errorCallback: function (err) {
            var operation = this;
            operation.ended = true;

            if (operation.download) {
                operation.download.resultFile.deleteAsync().done(function () {
                }, function () { });
                operation.removeDownload(operation.download.guid);
                printLog(operation.download.guid + " - download completed with error.");
            }

            if (operation.onerror) {
                operation.onerror(err);
                operation.onerror = null;
            }
            else {
                operation.notify("error");
            }
            printLog(err);
        }
    }), WinJS.Binding.mixin, WinJS.Binding.expandProperties({ progress: 0 }));

    MCNEXT.BgDownloads.Operation.run = function (uri, fileName, folder, collision, priority, requestUnconstrainedDownload) {
        var operation = null;
        MCNEXT.BgDownloads.currentDownloads.forEach(function (op) {
            if (op.download.requestedUri.toString() == uri.toString()) {
                operation = op;
            }
        });

        if (!operation) {
            operation = new MCNEXT.BgDownloads.Operation();
            return operation.start(uri, fileName, folder, collision, priority, requestUnconstrainedDownload).then(function () {
                return operation;
            });
        }

        return WinJS.Promise.wrap(operation);
    };


    function printLog(msg) {
        console.log(msg);
    }
})();