/* 
 * WinJS Contrib v2.0.3.0
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

//example of expected signature for data container

(function () {
    'use strict';
    WinJS.Namespace.define("WinJSContrib.DataContainer", {
        LocalStorageContainer: WinJS.Class.define(function ctor(key, options, parent) {
            this.key = key || 'mcndatacontainer';
            this.options = options;
            this.parent = parent;
            if (parent) {
                this.storageKey = parent.storageKey + '.' + this.key;
            } else {
                this.storageKey = this.key;
            }
        }, {
            read: function (itemkey) {
                var container = this;
                var storagekey = container.storageKey + '#' + itemkey;
                var tmp = localStorage[storagekey];
                if (tmp) {
                    tmp = JSON.parse(tmp);
                    if (container.options.logger)
                        container.options.logger.debug('readed ' + storagekey);
                }
                else {
                    if (container.options.logger)
                        container.options.logger.debug('reading empty ' + storagekey);
                }
                return WinJS.Promise.wrap(tmp);
            },

            save: function (itemkey, obj) {
                var container = this;
                if (obj) {
                    var tmp = JSON.stringify(obj);
                    var storagekey = container.storageKey + '#' + itemkey;
                    if (container.options.logger)
                        container.options.logger.debug('saving ' + storagekey);
                    localStorage[storagekey] = tmp;
                }
                return WinJS.Promise.wrap();
            },

            remove: function (itemkey) {
                var container = this;
                var storagekey = container.storageKey + '#' + itemkey;
                localStorage.removeItem(storagekey);
                if (container.options.logger)
                    container.options.logger.debug('removing ' + storagekey);
                return WinJS.Promise.wrap();
            },

            list: function () {
                var keys = Object.keys(localStorage);
                var l = [];
                for (var i = 0; i < keys.length; i++) {
                    if (keys[i].indexOf(this.storageKey) != -1) {
                        l.push({ displayName: keys[i].replace(this.storageKey + "#", '') });
                    }

                }

                return WinJS.Promise.wrap(l);
            },

            child: function (key) {
                if (this[key])
                    return this[key];

                var res = new WinJSContrib.DataContainer.LocalStorageContainer(key, this.options, this);
                this[key] = res;
                return res;
            }
        })
    });
})();