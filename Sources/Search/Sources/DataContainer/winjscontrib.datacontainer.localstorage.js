var __global = this;
var WinJSContrib;
(function (WinJSContrib) {
    var DataContainer;
    (function (DataContainer) {
        DataContainer.current = WinJSContrib.DataContainer.current || null;
        var LocalStorageContainer = (function () {
            function LocalStorageContainer(key, options, parent) {
                this.key = key || 'mcndatacontainer';
                this.options = options;
                this.parent = parent;
                if (parent) {
                    this.storageKey = parent.storageKey + '#' + this.key;
                }
                else {
                    this.storageKey = this.key;
                }
            }
            LocalStorageContainer.makeCurrent = function (key, options) {
                WinJSContrib.DataContainer.current = new LocalStorageContainer(key, options);
            };
            LocalStorageContainer.prototype.read = function (itemkey) {
                var container = this;
                var storagekey = container.storageKey + '###' + itemkey;
                var tmp = localStorage[storagekey];
                if (tmp) {
                    tmp = JSON.parse(tmp);
                }
                else {
                }
                return WinJS.Promise.wrap(tmp);
            };
            LocalStorageContainer.prototype.save = function (itemkey, obj) {
                var container = this;
                if (obj) {
                    var tmp = JSON.stringify(obj);
                    var storagekey = container.storageKey + '###' + itemkey;
                    if (container.options.logger)
                        container.options.logger.debug('saving ' + storagekey);
                    localStorage[storagekey] = tmp;
                }
                return WinJS.Promise.wrap();
            };
            LocalStorageContainer.prototype.remove = function (itemkey) {
                var container = this;
                var storagekey = container.storageKey + '###' + itemkey;
                localStorage.removeItem(storagekey);
                if (container.options.logger)
                    container.options.logger.debug('removing ' + storagekey);
                return WinJS.Promise.wrap();
            };
            LocalStorageContainer.prototype.listKeys = function () {
                var keys = Object.keys(localStorage);
                var l = [];
                for (var i = 0; i < keys.length; i++) {
                    if (keys[i].indexOf(this.storageKey) != -1) {
                        l.push(keys[i].replace(this.storageKey + "#", ''));
                    }
                }
                return WinJS.Promise.wrap(l);
            };
            LocalStorageContainer.prototype.list = function () {
                var keys = Object.keys(localStorage);
                var l = [];
                for (var i = 0; i < keys.length; i++) {
                    if (keys[i].indexOf(this.storageKey) != -1) {
                        l.push({ displayName: keys[i].replace(this.storageKey + "#", '') });
                    }
                }
                return WinJS.Promise.wrap(l);
            };
            LocalStorageContainer.prototype.child = function (key) {
                if (this.childs[key])
                    return this.childs[key];
                var res = new LocalStorageContainer(key, this.options, this);
                this.childs[key] = res;
                return res;
            };
            LocalStorageContainer.prototype.childWithTransaction = function (key, process) {
                var current = this;
                var err = WinJS.Promise.wrapError({ message: "Not yet implemented for this container" });
                return err;
            };
            LocalStorageContainer.prototype.deleteContainer = function () {
                localStorage.removeItem(this.storageKey);
                if (this.parent && this.parent.childs[this.key]) {
                    this.parent.childs[this.key] = null;
                }
                return WinJS.Promise.wrap();
            };
            return LocalStorageContainer;
        })();
        DataContainer.LocalStorageContainer = LocalStorageContainer;
    })(DataContainer = WinJSContrib.DataContainer || (WinJSContrib.DataContainer = {}));
})(WinJSContrib || (WinJSContrib = {}));

//# sourceMappingURL=../../Sources/DataContainer/winjscontrib.datacontainer.localstorage.js.map