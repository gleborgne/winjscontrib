module WinJSContrib.UI {
    export class ReactWrapperControl<TProps> {
        element: HTMLElement;
        eventTracker: WinJSContrib.UI.EventTracker;
        compFactory: __React.DOMFactory<any>;
        _component: any;
        _reactcomponent: any;
        _props: TProps;

        constructor(element, options) {
            this.element = element || document.createElement('DIV');
            this.eventTracker = new WinJSContrib.UI.EventTracker();
            options = options || {};
            this.element.winControl = this;            
            this.element.classList.add('win-disposable');
            this.element.classList.add('mcn-layout-ctrl');
            WinJS.UI.setOptions(this, options);
            //this.compFactory = React.createFactory(component);
        }

        get props(): TProps{
            return this._props;
        }

        set props(val: TProps) {
            this._props = val;
            this.refresh();
        }

        get component() {
            return this._component;
        }

        set component(val) {
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
        }

        refresh() {
            if (this.compFactory) {
                this._reactcomponent = ReactDOM.render(this.compFactory(this.props), this.element);
            }
        }

        destroyReactComponent() {
            ReactDOM.unmountComponentAtNode(this.element);
        }

        dispose() {
            this.eventTracker.dispose();
            this.destroyReactComponent();
        }
    }
    export var ReactWrapper = WinJS.Utilities.markSupportedForProcessing(ReactWrapperControl);
}