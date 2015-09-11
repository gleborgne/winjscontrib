var __global = this;

module WinJSContrib.DataContainer {
    export var current = WinJSContrib.DataContainer.current || null;

    export class LocalStorageContainer implements IDataContainer {
        public key: string;
        public parent: LocalStorageContainer;
        public useDataCache: boolean;
        storageKey: string;
        options: any;
        childs: any;

        static makeCurrent(key?: string, options?: any) {
            WinJSContrib.DataContainer.current = new LocalStorageContainer(key, options);
        }

        constructor(key?: string, options?: any, parent?: LocalStorageContainer) {
            this.key = key || 'mcndatacontainer';
            this.options = options;
            this.parent = parent;
            if (parent) {
                this.storageKey = parent.storageKey + '#' + this.key;
            } else {
                this.storageKey = this.key;
            }
        }

        read(itemkey) {
            var container = this;
            var storagekey = container.storageKey + '###' + itemkey;
            var tmp = localStorage[storagekey];
            if (tmp) {
                tmp = JSON.parse(tmp);
                //if (container.options.logger)
                //    container.options.logger.debug('readed ' + storagekey);
            }
            else {
                //if (container.options.logger)
                //    container.options.logger.debug('reading empty ' + storagekey);
            }
            return WinJS.Promise.wrap(tmp);
        }

        save(itemkey, obj) {
            var container = this;
            if (obj) {
                var tmp = JSON.stringify(obj);
                var storagekey = container.storageKey + '###' + itemkey;
                if (container.options.logger)
                    container.options.logger.debug('saving ' + storagekey);
                localStorage[storagekey] = tmp;
            }
            return WinJS.Promise.wrap();
        }

        remove(itemkey) {
            var container = this;
            var storagekey = container.storageKey + '###' + itemkey;
            localStorage.removeItem(storagekey);
            if (container.options.logger)
                container.options.logger.debug('removing ' + storagekey);

            return WinJS.Promise.wrap();
        }

        listKeys() {
            var keys = Object.keys(localStorage);
            var l = [];
            for (var i = 0; i < keys.length; i++) {
                if (keys[i].indexOf(this.storageKey) != -1) {
                    l.push(keys[i].replace(this.storageKey + "#", ''));
                }
            }

            return WinJS.Promise.wrap(l);
        }

        list() {
            var keys = Object.keys(localStorage);
            var l = [];
            for (var i = 0; i < keys.length; i++) {
                if (keys[i].indexOf(this.storageKey) != -1) {
                    l.push({ displayName: keys[i].replace(this.storageKey + "#", '') });
                }

            }

            return WinJS.Promise.wrap(l);
        }

        child(key): LocalStorageContainer {
            if (this.childs[key])
                return this.childs[key];

            var res = new LocalStorageContainer(key, this.options, this);
            this.childs[key] = res;
            return res;
        }

        childWithTransaction(key: string, process: (arg: LocalStorageContainer) => WinJS.Promise<any>): WinJS.Promise<LocalStorageContainer> {
            var current = this;
            var err = <any>WinJS.Promise.wrapError({ message: "Not yet implemented for this container" });
            return <WinJS.Promise<LocalStorageContainer>>err;
        }

        deleteContainer(): WinJS.Promise<any> {            
            localStorage.removeItem(this.storageKey);
            if (this.parent && this.parent.childs[this.key]) {
                this.parent.childs[this.key] = null;
            }
            return WinJS.Promise.wrap();
        }
    }
}