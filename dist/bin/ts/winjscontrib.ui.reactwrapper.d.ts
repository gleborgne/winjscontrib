declare module WinJSContrib.UI {
    class ReactWrapperControl<TProps> {
        element: HTMLElement;
        eventTracker: WinJSContrib.UI.EventTracker;
        compFactory: __React.DOMFactory<any>;
        _component: any;
        _reactcomponent: any;
        _props: TProps;
        constructor(element: any, options: any);
        props: TProps;
        component: any;
        refresh(): void;
        destroyReactComponent(): void;
        dispose(): void;
    }
    var ReactWrapper: typeof ReactWrapperControl;
}
