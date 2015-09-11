var WinJSContrib;
(function (WinJSContrib) {
    var Search;
    (function (Search) {
        var IndexWorkerProxy = (function () {
            /**
             * @classdesc
             * Proxy for a {@link WinJSContrib.Search.Index} running in a web worker
             * @class
             * @param {string} name index name
             * @param {WinJSContrib.Search.IndexDefinition} definition index definition
             * @param {string} workerpath path for web worker script file (optional)
             */
            function IndexWorkerProxy(name, definition, workerpath) {
                var wrapper = this;
                wrapper.worker = new WinJSContrib.Messenger.SmartWorker(workerpath || WinJSContrib.Search.workerPath);
                wrapper.init(name, definition);
            }
            /**
             * initialize worker
             * @function WinJSContrib.Search.IndexWorkerProxy.prototype.init
             * @param {string} name
             * @param {WinJSContrib.Search.IndexDefinition} definition index definition (optional), use index's definition if not defined
             * @returns {WinJS.Promise}
             */
            IndexWorkerProxy.prototype.init = function (name, definition, load) {
                return this.worker.start('init', { name: name, load: load, definition: definition });
            };
            /**
             * start search
             * @function WinJSContrib.Search.IndexWorkerProxy.prototype.search
             * @param {string} searchTerm search query
             * @param {Object} options
             * @returns {WinJS.Promise}
             */
            IndexWorkerProxy.prototype.search = function (searchTerm, options) {
                return this.worker.start('search', { searchTerm: searchTerm, options: options });
            };
            /**
             * get the number of items in index
             * @function WinJSContrib.Search.IndexWorkerProxy.prototype.count
             * @returns {WinJS.Promise}
             */
            IndexWorkerProxy.prototype.count = function () {
                return this.worker.start('count');
            };
            /**
             * add an object to index
             * @function WinJSContrib.Search.IndexWorkerProxy.prototype.add
             * @param {Object} obj object to index
             * @param {Object} options
             * @returns {WinJS.Promise}
             */
            IndexWorkerProxy.prototype.add = function (data, options) {
                return this.worker.start('index', { items: [data], options: options });
            };
            /**
             * add an array of objects to index
             * @function WinJSContrib.Search.IndexWorkerProxy.prototype.addRange
             * @param {Array} items items array
             * @param {Object} options
             * @returns {WinJS.Promise}
             */
            IndexWorkerProxy.prototype.addRange = function (data, options) {
                return this.worker.start('index', { items: data, options: options });
            };
            /**
             * release proxy
             * @function WinJSContrib.Search.IndexWorkerProxy.prototype.dispose
             */
            IndexWorkerProxy.prototype.dispose = function () {
                this.worker.dispose();
            };
            /**
             * clear index
             * @function WinJSContrib.Search.IndexWorkerProxy.prototype.clear
             * @returns {WinJS.Promise}
             */
            IndexWorkerProxy.prototype.clear = function () {
                return this.worker.start('clear');
            };
            /**
             * load index from storage
             * @function WinJSContrib.Search.IndexWorkerProxy.prototype.load
             * @returns {WinJS.Promise}
             */
            IndexWorkerProxy.prototype.load = function () {
                return this.worker.start('load');
            };
            /**
             * save index to storage
             * @function WinJSContrib.Search.IndexWorkerProxy.prototype.save
             * @returns {WinJS.Promise}
             */
            IndexWorkerProxy.prototype.save = function () {
                return this.worker.start('save');
            };
            return IndexWorkerProxy;
        })();
        Search.IndexWorkerProxy = IndexWorkerProxy;
    })(Search = WinJSContrib.Search || (WinJSContrib.Search = {}));
})(WinJSContrib || (WinJSContrib = {}));
