//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

var WinJSContrib = WinJSContrib || {};
WinJSContrib.UI = WinJSContrib.UI || {};
(function (UI) {

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

    UI.Messenger = WinJS.Class.mix(Messenger, WinJS.Utilities.eventMixin);
    UI.Messenger.SmartWorkerPath = '/scripts/winjscontrib/WinJSContrib.ui.messenger.worker.js';
    UI.Messenger.SmartWorker = function (path) {
        if (window.Worker) {
            var w = new window.Worker(path || UI.Messenger.SmartWorkerPath);
            return new UI.Messenger(w, w);
        }

        return new UI.Messenger(null, null);
    }


    Messenger.prototype._send = function (obj) {
        if (this.isWorker) {
            this._sender.postMessage(JSON.stringify(obj));
        }
        else {
            this._sender.postMessage(JSON.stringify(obj), '*');
        }
    };

    Messenger.prototype.importScripts = function (scriptPaths) {
        if (!this._receiver)
            return WinJS.Promise.wrap();

        return this.start('_doImportScripts', scriptPaths);
    }

    Messenger.prototype._doImportScripts = function (scriptPaths) {
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

    Messenger.prototype.execute = function (func) {
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

    Messenger.prototype._runFunction = function (functionArgs) {
        var messenger = this;
        return new WinJS.Promise(function (c, e) {
            try{
                eval(functionArgs.f);
                var res = messengerFunction.apply(null, functionArgs.args);
                c(res);
            } catch (exception) {
                e(exception);
            }
        });
    }

    Messenger.prototype.start = function (eventName, data) {
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
            sender: 'WinJSContrib.ui.messenger'
        };

        wrapper.promise = new WinJS.Promise(function (c, e, p) {
            wrapper.complete = c;
            wrapper.error = e;
            wrapper.progress = p;
        });

        messenger._pendings[wrapper.id] = wrapper;
        var cleanUp = function () {
            delete messenger._pendings[wrapper.id];
        }
        wrapper.promise.done(cleanUp, cleanUp);
        messenger._send(event);

        return wrapper.promise;
    };

    Messenger.prototype._processEvent = function (arg) {
        var messenger = this;
        var details = JSON.parse(arg.data);
        var name = details.name;
        var data = details.data;

        if (details.id) {
            var wrapper = messenger._pendings[details.id];
            if (wrapper && wrapper[details.type]) {
                wrapper[details.type](data);
                return;
            }

            if (name && messenger[name]) {
                try {
                    WinJS.Promise.as(messenger[name](data)).then(function (arg) {
                        messenger._send({ name: name, id: details.id, type: 'complete', sender: 'WinJSContrib.ui.messenger', data: arg });
                    }, function (arg) {
                        messenger._send({ name: name, id: details.id, type: 'error', sender: 'WinJSContrib.ui.messenger', data: arg });
                    }, function (arg) {
                        messenger._send({ name: name, id: details.id, type: 'progress', sender: 'WinJSContrib.ui.messenger', data: arg });
                    });
                } catch (exception) {
                    messenger._send({ name: name, id: details.id, type: 'error', sender: 'WinJSContrib.ui.messenger', data: { description: exception.description, message: exception.message, stack: exception.stack } });
                }

                return;
            }

        } else {
            if (name && messenger[name]) {
                messenger[name](data);
                return;
            }
            messenger.dispatchEvent(name, data);
        }
    };


    Messenger.prototype.dispose = function () {
        var messenger = this;
        if (messenger._receiver) {
            if (messenger._receiver.terminate)
                messenger._receiver.terminate();

            messenger._receiver.removeEventListener('message', messenger._bindedProcessEvent);
        }
    };
})(WinJSContrib.UI);