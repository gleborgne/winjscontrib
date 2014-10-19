//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

//this is a blank WinJS control structure. It's intended to use as a startup for new controls

(function () {
    'use strict';
    WinJS.Namespace.define("MCNEXT", {
        DynamicScripts: WinJS.Class.mix(WinJS.Class.define(function ctor(element, options) {
            this.element = element || document.createElement('DIV');
            this.eventTracker = new MCNEXT.UI.EventTracker();
            options = options || {};
            options.path = options.path || "ms-appx-web:///scripts/winjscontrib/mcnext.dynamicscripts.html";
            this.element.winControl = this;
            this.sessions = {};
            this.element.classList.add('win-disposable');
            WinJS.UI.setOptions(this, options);
        }, {
            path: {
                get: function () {
                    return this._path;
                },
                set: function (val) {
                    this._path = val;
                    this._prepareControl();
                }
            },

            _prepareControl: function () {
                var ctrl = this;
                var e = document.domain;
                ctrl.iframe = document.createElement('IFRAME');
                ctrl.iframe.id = "mcnextdynamicscripts";
                ctrl.iframe.width = 1;
                ctrl.iframe.height = 1;
                ctrl.iframe.style.position = 'fixed';
                ctrl.iframe.style.visibility = 'hidden';
                ctrl.iframe.src = ctrl.path;
                ctrl.element.appendChild(ctrl.iframe);
                ctrl.iframe.onload = function (arg) {
                    ctrl.iframe.onload = null;
                    window.addEventListener('message', ctrl._receiveMessage.bind(ctrl));
                    ctrl._sendMessage('initialisation');                    
                }
            },

            _sendMessage: function (type, data) {
                var ctrl = this;
                ctrl.iframe.contentWindow.postMessage({ type: type, data: data }, '*');
            },

            _receiveMessage: function (arg) {
                var ctrl = this;
                if (arg.data && arg.data.sender == 'mcnext.dynamicscripts') {
                    if (arg.data.type == 'applyscript') {
                        if (arg.data.data.session && ctrl.sessions[arg.data.data.session]) {
                            var session = ctrl.sessions[arg.data.data.session];
                            if (arg.data.data.error) {
                                session.error(arg.data.data.error)
                            } else {
                                session.complete(arg.data.data.data);
                            }
                            delete ctrl.sessions[arg.data.data.session];
                        }
                    } 
                        ctrl.dispatchEvent(arg.data.type, arg.data.data);
                    
                }
            },

            applyScript: function (script, data) {
                var ctrl = this;
                var session = { complete: null, error:null, id: MCNEXT.Utils.guid() };
                var p = new WinJS.Promise(function (c, e) {
                    session.complete = c;
                    session.error = e;
                    ctrl.sessions[session.id] = session;
                    ctrl._sendMessage("applyscript", { session: session.id, script: script, data: data });
                });

                return p;
            },

            dispose: function () {
                this.eventTracker.dispose();
                WinJS.Utilities.disposeSubTree(this.element);
            }
        }),
        WinJS.UI.DOMEventMixin,
        WinJS.Utilities.createEventProperties("myevent"))
    });
})();