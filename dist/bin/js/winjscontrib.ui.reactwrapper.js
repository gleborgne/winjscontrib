/* 
 * WinJS Contrib v2.1.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

var WinJSContrib;
(function (WinJSContrib) {
    var UI;
    (function (UI) {
        var ReactWrapperControl = (function () {
            function ReactWrapperControl(element, options) {
                this.element = element || document.createElement('DIV');
                this.eventTracker = new WinJSContrib.UI.EventTracker();
                options = options || {};
                this.element.winControl = this;
                this.element.classList.add('win-disposable');
                this.element.classList.add('mcn-layout-ctrl');
                WinJS.UI.setOptions(this, options);
                //this.compFactory = React.createFactory(component);
            }
            Object.defineProperty(ReactWrapperControl.prototype, "props", {
                get: function () {
                    return this._props;
                },
                set: function (val) {
                    this._props = val;
                    this.refresh();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ReactWrapperControl.prototype, "component", {
                get: function () {
                    return this._component;
                },
                set: function (val) {
                    this._component = val;
                    var comp = val;
                    if (typeof val == 'string') {
                        comp = WinJSContrib.Utils.readProperty(window, val);
                    }
                    if (typeof comp !== 'function') {
                        console.error("React Component not found " + val);
                        throw new Error("React Component not found " + val);
                    }
                    this.compFactory = React.createFactory(comp);
                    this.refresh();
                },
                enumerable: true,
                configurable: true
            });
            ReactWrapperControl.prototype.refresh = function () {
                if (this.compFactory) {
                    this._reactcomponent = ReactDOM.render(this.compFactory(this.props), this.element);
                }
            };
            ReactWrapperControl.prototype.destroyReactComponent = function () {
                ReactDOM.unmountComponentAtNode(this.element);
            };
            ReactWrapperControl.prototype.dispose = function () {
                this.eventTracker.dispose();
                this.destroyReactComponent();
            };
            return ReactWrapperControl;
        })();
        UI.ReactWrapperControl = ReactWrapperControl;
        UI.ReactWrapper = WinJS.Utilities.markSupportedForProcessing(ReactWrapperControl);
    })(UI = WinJSContrib.UI || (WinJSContrib.UI = {}));
})(WinJSContrib || (WinJSContrib = {}));

//# sourceMappingURL=../../Sources/Controls/winjscontrib.ui.reactwrapper.js.map