var __global = this;

module WinJSContrib.DataContainer {
    export var current = WinJSContrib.DataContainer.current || null;
    var containerLogger = WinJSContrib.Logs.getLogger("WinJSContrib.DataContainer.WinRT");
        
    export class WinRTFilesContainer implements IDataContainer {
        public key: string;
        public parent: WinRTFilesContainer;
        public useDataCache: boolean;
        dataCache: any;
        childs: any;
        folder: Windows.Storage.StorageFolder;
        options: any;
        folderPromise: WinJS.Promise<Windows.Storage.StorageFolder>;

        static makeCurrent(key?: string, options?: any) {
            WinJSContrib.DataContainer.current = new WinRTFilesContainer(key, options);
        }

        constructor(key?: string, options?:any, parent?: WinRTFilesContainer) {
            var container = this;
            container.key = key;
            container.options = options || {};
            container.parent = parent;
            container.folderPromise;
            container.useDataCache = container.options.useDataCache || false;
            container.dataCache = {};

            container.childs = {};

            if (!__global.Windows)
                throw "WinRT is required !";

            if (!key) {
                container.folder = Windows.Storage.ApplicationData.current.localFolder;
                container.folderPromise = WinJS.Promise.wrap(container.folder);
            }
            else if (parent) {
                container.folderPromise = parent.folderPromise.then(function (parentfolder) {
                    if (container.options.logger) container.options.logger.debug("open folder " + key);
                    return parentfolder.createFolderAsync(key, Windows.Storage.CreationCollisionOption.openIfExists)
                }).then(function (folder) {
                    container.folder = folder;
                    return folder;
                });
            }
        }

        public read<T>(itemkey: string): WinJS.Promise<T> {
            var container = this;
            if (container.useDataCache) {
                var data = container.dataCache[itemkey];
                if (data) {
                    //clone object to avoid unintended object alteration
                    var clone = JSON.parse(JSON.stringify(data));
                    return WinJS.Promise.wrap(clone);
                }
            }

            return container.folderPromise.then(function (folder) {
                return readFileAsync(folder, itemkey, container.options.encrypted, Windows.Storage.CreationCollisionOption.openIfExists, 0, container.options.logger).then(function (data) {
                    
                    if (container.useDataCache) {
                        container.dataCache[itemkey] = data;
                    }
                    return data;
                });
            });
        }

        public save(itemkey, obj): WinJS.Promise<any> {
            var container = this;
            if (container.useDataCache) {
                container.dataCache[itemkey] = obj;
            }

            return container.folderPromise.then(function (folder) {
                return writeFileAsync(folder, itemkey, obj, container.options.encrypted, Windows.Storage.CreationCollisionOption.replaceExisting, 0, container.options.logger);
            });
        }

        public remove(itemkey): WinJS.Promise<any> {
            var container = this;

            return container.folderPromise.then(function (folder) {
                return deleteItemIfExistsAsync(folder, itemkey, container.options.logger);
            });

        }

        public listKeys(): WinJS.Promise<string[]> {
            var container = this;

            return container.folderPromise.then(function (folder) {
                return folder.getFilesAsync().then(function (files) {
                    return files.map(function (f) {
                        var key = f.path.substr(folder.path.length + 1);
                        var ext = key.indexOf('.json');
                        if (ext > 0) {
                            key = key.substr(0, ext);
                        }
                        return key;
                    });
                });
            });
        }

        public list() {
            var container = this;

            return container.folderPromise.then(function (folder) {
                return folder.getFilesAsync();
            });
        }

        public child(key): WinRTFilesContainer {
            if (this.childs[key])
                return this.childs[key];

            var res = new WinRTFilesContainer(key, this.options, this);
            this.childs[key] = res;
            return res;
        }

        public childWithTransaction(key: string, process: (arg: WinRTFilesContainer) => WinJS.Promise<any>): WinJS.Promise<WinRTFilesContainer> {
            var current = this;

            return this.child(key + "-tmp").folderPromise.then(function (winrtfolder) {
                return winrtfolder.deleteAsync().then(function () {
                    return current.child(key + "-tmp");
                });
            }).then(function (folder) {
                return process(folder).then(function (data) {
                    return folder.folderPromise.then(function (winrtfolder) {
                        return winrtfolder.renameAsync(key, Windows.Storage.NameCollisionOption.replaceExisting).then(function () {
                            current.childs[key] = null;
                            current.childs[key + "-tmp"] = null;
                            return current.child(key);
                        });
                    });
                });
            });
        }

        public deleteContainer(): WinJS.Promise<any> {
            var container = this;
            return container.folderPromise.then(function (folder) {
                return folder.deleteAsync();
            });
        }

        public clearAllCache() {
            var container = this;
            container.clearCache();
            container.clearDataCache();
        }

        public clearCache() {
            var container = this;
            container.childs = {};

            for (var k in container.childs) {
                if (container.childs.hasOwnProperty(k)) {
                    container.childs[k].clearCache();
                }
            }
        }

        public clearDataCache() {
            var container = this;

            container.dataCache = {};

            for (var k in container.childs) {
                if (container.childs.hasOwnProperty(k)) {
                    container.childs[k].clearDataCache();
                }
            }
        }
    }

    function toJSONFileName(fileName) {
        return encodeURIComponent(fileName) + ".json";
    }

    function deleteItemIfExistsAsync(folder, itemName, logger) {
        return folder.getItemAsync(toJSONFileName(itemName)).then(function (item) {
            return item;
        }, function () {
        }).then(function (item) {
            if (item) {
                return item.deleteAsync().then(function () {
                    if (logger) logger.debug("item deleted " + item.path);
                }, function (err) {
                    if (logger) logger.error("cannot delete item " + item.path);
                });
            } else {
                return WinJS.Promise.wrap([]);
            }
        });
    }

    function getFileContentAsJSONAsync(file, encrypted) {
        return Windows.Storage.FileIO.readBufferAsync(file).then(function (cypheredText) {
            if (!encrypted)
                return cypheredText;

            // On vérifie que le fichier n'est pas vide
            if (cypheredText.length) {
                var provider = new Windows.Security.Cryptography.DataProtection.DataProtectionProvider();
                return provider.unprotectAsync(cypheredText);
            } else {
                return null;
            }
        }).then(function (unprotectedData: Windows.Storage.Streams.IBuffer) {
            var obj = null;
            if (unprotectedData !== null && unprotectedData !== undefined) {
                var rawText = Windows.Security.Cryptography.CryptographicBuffer.convertBinaryToString(Windows.Security.Cryptography.BinaryStringEncoding.utf8, unprotectedData);
                if (rawText) {
                    try {
                        obj = JSON.parse(rawText);
                    } catch (exception) { }
                }
            }

            return obj;
        });
    }

    function readFileAsync(folder, fileName, encrypted, creationCollisionOption, retry, logger) {
        logger = logger || containerLogger;
        return new WinJS.Promise(function (readComplete, readError) {
            retry = retry || 0;
            creationCollisionOption = creationCollisionOption || Windows.Storage.CreationCollisionOption.openIfExists;
            var filename = toJSONFileName(fileName);
            //folder.getFilesAsync(filename).then(function(file){})

            folder.getFileAsync(filename).then(function (file) {
                return getFileContentAsJSONAsync(file, encrypted);
            }).then(function (res) {
                logger.verbose("read " + folder.path + '\\' + toJSONFileName(fileName));
                readComplete(res);
            }, function (err) {
                if (err.number == -2147024894) {
                    logger.debug("read empty " + folder.path + '\\' + toJSONFileName(fileName));
                    readComplete();
                    return;
                }

                logger.warn("error reading " + folder.path + '\\' + toJSONFileName(fileName));
                if (retry < 2) {
                    setImmediate(function () {
                        logger.info("retry reading " + folder.path + '\\' + toJSONFileName(fileName));
                        readFileAsync(folder, fileName, encrypted, creationCollisionOption, retry + 1, logger).then(readComplete, readError);
                    });
                } else {
                    readError({ message: 'fatal error reading ' + folder.path + '\\' + toJSONFileName(fileName), exception: err });
                }
            });
        });
    }

    function writeFileAsync(folder, fileName, objectGraph, encrypt, creationCollisionOption, retry, logger) {
        logger = logger || containerLogger;
        return new WinJS.Promise(function (writeComplete, writeError) {
            retry = retry || 0;
            creationCollisionOption = creationCollisionOption || Windows.Storage.CreationCollisionOption.replaceExisting;
            var bufferedText = Windows.Security.Cryptography.CryptographicBuffer.convertStringToBinary(JSON.stringify(objectGraph), Windows.Security.Cryptography.BinaryStringEncoding.utf8);
            if (encrypt) {
                var provider = new Windows.Security.Cryptography.DataProtection.DataProtectionProvider("Local=user");
            }

            function manageError(err) {
                logger.warn("error writing " + folder.path + '\\' + toJSONFileName(fileName));
                if (retry < 2) {
                    setImmediate(function () {
                        logger.info("retry writing " + folder.path + '\\' + toJSONFileName(fileName));
                        writeFileAsync(folder, fileName, objectGraph, encrypt, creationCollisionOption, retry + 1, logger).then(writeComplete, writeError);
                    });
                }
                else {
                    writeError({ message: "fatal error writing " + folder.path + '\\' + toJSONFileName(fileName) + '\r\n', exception: err });
                }
            }

            // Ces deux opérations ne sont pas dépendantes l'une de l'autre et peuvent s'exécuter en parallèle
            var filePromise = folder.createFileAsync(toJSONFileName(fileName), creationCollisionOption);
            var protectionPromise = encrypt ? provider.protectAsync(bufferedText) : WinJS.Promise.wrap(bufferedText);

            WinJS.Promise.join([filePromise, protectionPromise]).then(function (data) {
                var file = data[0];
                var protectedData = data[1];

                Windows.Storage.FileIO.writeBufferAsync(file, protectedData).then(function () {
                    logger.verbose("file written " + file.path);
                    //setImmediate(function () {
                    writeComplete(file);
                    //});
                }, manageError);
            }, manageError);
        });
    }
}