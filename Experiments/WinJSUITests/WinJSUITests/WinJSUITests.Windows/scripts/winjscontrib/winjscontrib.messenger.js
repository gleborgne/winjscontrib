/* 
 * WinJS Contrib v2.1.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

var WinJSContrib = WinJSContrib || {};

(function () {

    function Messenger(receiver, sender) {
        var messenger = this;
        messenger.isWorker = receiver.document === undefined;
        messenger._pendings = {};
        messenger._receiver = receiver;
        messenger._sender = sender || receiver;
        messenger._bindedProcessEvent = messenger._processEvent.bind(messenger);

        if (messenger._receiver)
            messenger._receiver.addEventListener('message', messenger._bindedProcessEvent);
    };

    /**
     * @classdesc
     * Wrapper for messaging between main code and iframe or web worker. All returns are wrapped as WinJS.Promise to enable asynchronous scenarios     
     * @class
     * @param {DOMElement} receiver element that will receive messages
     * @param {DOMElement} sender element that will send messages
     */
    WinJSContrib.Messenger = WinJS.Class.mix(Messenger, WinJS.Utilities.eventMixin);

    /**
     * default path for smart worker js file
     */
    WinJSContrib.Messenger.SmartWorkerPath = '/scripts/winjscontrib/winjscontrib.messenger.worker.js';

    /**
     * @classdesc
     * Wrapper for {@link WinJSContrib.Messenger} when using it with a webworker
     * @class
     * @param {string} [path] path to web worker file
     */
    WinJSContrib.Messenger.SmartWorker = function (path) {
        if (window.Worker) {
            var w = new window.Worker(path || WinJSContrib.Messenger.SmartWorkerPath);
            return new WinJSContrib.Messenger(w, w);
        }

        return new WinJSContrib.Messenger(null, null);
    }


    WinJSContrib.Messenger.prototype._send = function (obj) {
        if (this.isWorker) {
            this._sender.postMessage(JSON.stringify(obj));
        }
        else {
            this._sender.postMessage(JSON.stringify(obj), '*');
        }
    };

    /**
     * import script files
     * @param {Array} scriptPaths an array of string paths to js files
     */
    WinJSContrib.Messenger.prototype.importScripts = function (scriptPaths) {
        if (!this._receiver)
            return WinJS.Promise.wrap();

        return this.start('_doImportScripts', scriptPaths);
    }

    WinJSContrib.Messenger.prototype._doImportScripts = function (scriptPaths) {
        return new WinJS.Promise(function (c) {
            if (typeof scriptPaths == 'string') {
                importScripts(scriptPaths);
            } else if (scriptPaths.length) {
                for (var i = 0 ; i < scriptPaths.length ; i++) {
                    importScripts(scriptPaths[i]);
                }
            }
            c();
        });
    }

    /**
     * run the callback in the web worker. The callback is serialized to string so you must pass all variable used inside the function as arguments
     * @param {function} func function callback
     * @param {...Object} args
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Messenger.prototype.execute = function (func) {
        var messenger = this;
        var args = [];
        if (arguments.length > 1) {
            for (var i = 1 ; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
        }

        if (messenger._receiver) {
            var f = 'var messengerFunction=' + func;

            return this.start('_runFunction', { f: f, args: args });
        }
        else {
            return WinJS.Promise.timeout(0).then(function () {
                return func.apply(null, args);
            });
        }
    }

    WinJSContrib.Messenger.prototype._runFunction = function (functionArgs) {
        var messenger = this;
        return new WinJS.Promise(function (c, e) {
            try {
                eval(functionArgs.f);
                var res = messengerFunction.apply(null, functionArgs.args);
                c(res);
            } catch (exception) {
                e(exception);
            }
        });
    }

    WinJSContrib.Messenger.prototype.map = function (object, functions) {
        var messenger = this;
        functions.forEach(function (name) {
            messenger[name] = function () {
                var f = object[name];
                return f.apply(object, arguments);
            }
        });
    }

    /**
     * start an operation within iframe or worker and get a promise for completion
     * @param {string} eventName name of the event/function to call
     * @param {Object} data event/function passed as argument
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Messenger.prototype.start = function (eventName, data, asArgs) {
        var messenger = this;

        if (!messenger._receiver)
            return WinJS.Promise.wrapError('worker not supported');

        var wrapper = {
            id: WinJSContrib.Utils.guid(),
            complete: null, error: null, progress: null, promise: null
        }

        var event = {
            name: eventName,
            id: wrapper.id,
            type: 'run',
            data: data,
            asArgs: asArgs,
            sender: 'WinJSContrib.WinJSContrib.Messenger'
        };

        wrapper.promise = new WinJS.Promise(function (c, e, p) {
            wrapper.complete = c;
            wrapper.error = e;
            wrapper.progress = p;
        }, function oncancel() {
            console.warn('message canceled');
            event.type = 'cancel';
            messenger._send(event);
        });

        messenger._pendings[wrapper.id] = wrapper;
        var cleanUp = function () {
            delete messenger._pendings[wrapper.id];
        }
        wrapper.promise.done(cleanUp, cleanUp);
        messenger._send(event);

        return wrapper.promise;
    };

    WinJSContrib.Messenger.prototype._processEvent = function (arg) {
        var messenger = this;
       
        var details = typeof (arg.data) == 'string' ? JSON.parse(arg.data) : arg.data;
        var name = details.name;
        var data = details.data;
        var asArgs = details.asArgs;

        if (details.id) {
            var wrapper = messenger._pendings[details.id];
            if (wrapper && wrapper[details.type]) {
                wrapper[details.type](data);
                return;
            }

            if (details.type === 'cancel') {
                var current = messenger._pendings[details.id];
                if (current) {
                    current.promise.cancel();
                    delete messenger._pendings[details.id];
                }
            }
            else if (details.type==='run' && name && messenger[name]) {
                try {
                    var p = null;
                    if (asArgs) {
                        p = WinJS.Promise.as(messenger[name].apply(messenger[name], data));
                    } else {
                        p = WinJS.Promise.as(messenger[name](data));
                    }

                   messenger._pendings[details.id] = { promise: p, details: details };

                    p.then(function (arg) {
                        messenger._send({ name: name, id: details.id, type: 'complete', sender: 'WinJSContrib.WinJSContrib.Messenger', data: arg });
                    }, function (arg) {
                        messenger._send({ name: name, id: details.id, type: 'error', sender: 'WinJSContrib.WinJSContrib.Messenger', data: arg });
                    }, function (arg) {
                        messenger._send({ name: name, id: details.id, type: 'progress', sender: 'WinJSContrib.WinJSContrib.Messenger', data: arg });
                    }).then(function () {
                        delete messenger._pendings[details.id];
                    });
                } catch (exception) {
                    delete messenger._pendings[details.id];
                    messenger._send({ name: name, id: details.id, type: 'error', sender: 'WinJSContrib.WinJSContrib.Messenger', data: { description: exception.description, message: exception.message, stack: exception.stack } });
                }

                return;
            }
            else {
                messenger._send({ name: name, id: details.id, type: 'error', sender: 'WinJSContrib.WinJSContrib.Messenger', data: { message: 'callback function not found' } });
            }
        } else {
            if (name && messenger[name]) {
                messenger[name](data);
                return;
            }
            messenger.dispatchEvent(name, data);
        }
    };

    /**
     * release messenger and associated resources (if using webworker, worker is terminated
     */
    WinJSContrib.Messenger.prototype.dispose = function () {
        var messenger = this;
        if (messenger._receiver) {
            if (messenger._receiver.terminate)
                messenger._receiver.terminate();

            messenger._receiver.removeEventListener('message', messenger._bindedProcessEvent);
        }
    };
})();