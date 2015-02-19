///<reference path="../../typings/jquery.d.ts"/>
///<reference path="../../typings/winjs.d.ts"/>
///<reference path="../../typings/winrt.d.ts"/>

interface JQuery {
    tap(func);
    untap();
} 

module WinJSContrib.UI {       
    export interface WinJSContribApplication {
        navigator? : any
    }

    export var Application: WinJSContribApplication = {};

    /**
     * indicate if fragment should not look for resources when building control
     * @field WinJSContrib.UI.disableAutoResources
     * @type {boolean}
     */
    export var disableAutoResources: boolean = false;



    /**
     * Calculate offset of element relative to parent element. If parent parameter is null, offset is relative to document
     * @function WinJSContrib.UI.offsetFrom
     * @param {HTMLElement} element element to evaluate
     * @param {HTMLElement} parent reference of offset
     */
    export function offsetFrom(element: HTMLElement, parent: HTMLElement) {
        var xPosition = 0;
        var yPosition = 0;
        var w = element.clientWidth;
        var h = element.clientHeight;

        while (element && element != parent) {
            xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
            yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
            element = <HTMLElement>element.offsetParent;

        }

        return { x: xPosition, y: yPosition, width: w, height: h };
    }


    export class EventTracker {
        public events: Array<any>;

        /**
         * @class WinJSContrib.UI.EventTracker
         * @classdesc object to register and release events from addEventListener or bind
         */
        constructor() {
            this.events = [];
        }

        /**
         * register an event from an object
         * @function WinJSContrib.UI.EventTracker.prototype.addEvent
         * @param {Object} e object containing addEventListener
         * @param {string} eventName name of the event
         * @param {function} handler
         * @param {boolean} capture
         * @returns {function} function to call for unregistering the event
         */
        public addEvent(e, eventName: string, handler, capture: boolean) {
            var tracker = this;
            e.addEventListener(eventName, handler, capture);
            var unregister = function () {
                try {
                    e.removeEventListener(eventName, handler);
                    var idx = tracker.events.indexOf(unregister);
                    if (idx >= 0) {
                        tracker.events.splice(idx, 1);
                    }
                } catch (exception) {
                    console.error('unexpected error while releasing callback ' + exception.message);
                }
            };

            this.events.push(unregister);
            return unregister;
        }

        /**
         * register binding event
         * @function WinJSContrib.UI.EventTracker.prototype.addBinding
         * @param {Object} e object containing bind method
         * @param {string} eventName name of the binding event
         * @param {function} handler
         */
        public addBinding(e, eventName: string, handler) {
            e.bind(eventName, handler);
            var unregister = function () {
                e.unbind(eventName, handler);
            };
            this.events.push(unregister);
            return unregister;
        }

        /**
         * release all registered events
         * @function WinJSContrib.UI.EventTracker.prototype.dispose
         */
        public dispose() {
            for (var i = 0; i < this.events.length; i++) {
                this.events[i]();
            }
            this.events = [];
        }
    }

    /**
     * open all appbars
     * @function WinJSContrib.UI.appbarsOpen
     */
    export function appbarsOpen() {
        var res = document.querySelectorAll('div[data-win-control="WinJS.UI.AppBar"],div[data-win-control="WinJS.UI.NavBar"]');
        if (res && res.length) {
            for (var i = 0; i < res.length; i++) {
                var e = <any>res[i];
                if (e.winControl) {
                    e.winControl.show();
                }
            }
        }
    }

    /**
     * close all appbars
     * @function WinJSContrib.UI.appbarsClose
     */
    export function appbarsClose() {
        var res = document.querySelectorAll('div[data-win-control="WinJS.UI.AppBar"],div[data-win-control="WinJS.UI.NavBar"]');
        if (res && res.length) {
            for (var i = 0; i < res.length; i++) {
                var e = <any>res[i];
                if (e.winControl) {
                    e.winControl.hide();
                }
            }
        }
    }

    /**
     * disable all appbars
     * @function WinJSContrib.UI.appbarsDisable
     */
    export function appbarsDisable() {
        var res = document.querySelectorAll('div[data-win-control="WinJS.UI.AppBar"],div[data-win-control="WinJS.UI.NavBar"]');
        if (res && res.length) {
            for (var i = 0; i < res.length; i++) {
                var e = <any>res[i];
                if (e.winControl) {
                    e.winControl.disabled = true;
                }
            }
        }
    }

    /**
     * enable all appbars
     * @function WinJSContrib.UI.appbarsEnable
     */
    export function appbarsEnable() {
        $('div[data-win-control="WinJS.UI.AppBar"],div[data-win-control="WinJS.UI.NavBar"]').each(function () {
            if (this.winControl) {
                this.winControl.disabled = false;
            }
        });
    }


    /** 
     * build a promise around element "load" event (work for all element with src property like images, iframes, ...)
     * @function WinJSContrib.UI.elementLoaded
     * @param {HTMLElement} element
     * @param {string} url url used to feed "src" on element
     * @returns {WinJS.Promise}
     */
    export function elementLoaded(elt, url) {
        return new WinJS.Promise(function (complete, error) {
            function onerror(e) {
                elt.onload = undefined;
                elt.onerror = undefined;
                elt.onreadystatechange = undefined;
                error('element not loaded');
            }

            function onload(e) {
                elt.onload = undefined;
                elt.onerror = undefined;
                elt.onreadystatechange = undefined;
                complete({
                    element: elt,
                    url: url
                });
            }

            elt.onerror = onerror;
            elt.onload = onload;
            elt.onreadystatechange = onload;
            if (elt.naturalWidth > 0) {
                onload(undefined);
            }
            elt.src = url;
        });
    }

    /**
     * Create a promise for getting an image object from url
     * @function WinJSContrib.UI.loadImage
     * @param {string} imgUrl url for the picture
     * @returns {WinJS.Promise}
     */
    export function loadImage(imgUrl) {
        return new WinJS.Promise(function (complete, error) {
            var image = new Image();

            function onerror(e) {
                image.onload = undefined;
                image.onerror = undefined;
                error('image not loaded');
            }

            function onload(e) {
                image.onload = undefined;
                image.onerror = undefined;
                complete({
                    element: image,
                    url: imgUrl
                });
            }

            image.onerror = onerror;
            image.onload = onload;
            if (image.naturalWidth > 0) {
                onload(undefined);
            }
            image.src = imgUrl;
        });
    }

    /**
     * List all elements found after provided element
     * @function WinJSContrib.UI.listElementsAfterMe
     * @param {HTMLElement} elt target element
     * @returns {Array} list of sibling elements
     */
    export function listElementsAfterMe(elt) {
        var res = [];
        var passed = false;
        if (elt.parentElement) {
            var parent = elt.parentElement;
            for (var i = 0; i < parent.children.length; i++) {
                if (parent.children[i] === elt) {
                    passed = true;
                } else if (passed) {
                    res.push(parent.children[i]);
                }
            }
        }
        return res;
    }

    /**
     * create an animation for removing an element from a list
     * @function WinJSContrib.UI.removeElementAnimation
     * @param {HTMLElement} element that will be removed
     * @returns {WinJS.Promise}
     */
    export function removeElementAnimation(elt) {
        return new WinJS.Promise(function (complete, error) {
            var remainings = WinJSContrib.UI.listElementsAfterMe(elt);
            var anim = WinJS.UI.Animation.createDeleteFromListAnimation([
                elt
            ], remainings);
            elt.style.position = "fixed";
            elt.style.opacity = '0';
            anim.execute().done(function () {
                complete(elt);
            });
        });
    }

    /**
     * setup declarative binding to parent control function. It looks for "data-page-action" attributes, 
     * and try to find a matching method on the supplyed control.
     * You could add arguments with a "page-action-args" attribute. The argument can be an object or a function
     * @function WinJSContrib.UI.bindPageActions
     * @param {HTMLElement} element root node crawled for page actions
     * @param {Object} control control owning functions to call
     */
    export function bindPageActions(element, control) {
        $('*[data-page-action]', element).each(function () {
            var actionName = $(this).addClass('page-action').data('page-action');

            var action = control[actionName];
            if (action && typeof action === 'function') {
                $(this).tap(function (eltarg) {
                    var actionArgs = $(eltarg).data('page-action-args');
                    if (actionArgs && typeof actionArgs == 'string') {
                        try {
                            var tmp = WinJSContrib.Utils.readValue(eltarg, actionArgs);
                            if (tmp) {
                                actionArgs = tmp;
                            } else {
                                actionArgs = JSON.parse(actionArgs);
                            }
                        } catch (exception) {
                            return;
                        }
                    }

                    control[actionName].bind(control)({ elt: eltarg, args: actionArgs });
                });
            }
        });
    }

    /**
     * setup declarative binding to page link. It looks for "data-page-link" attributes. 
     * If any the content of the attribute point toward a page. clicking that element will navigate to that page.
     * You could add arguments with a "page-action-args" attribute. The argument can be an object or a function
     * @function WinJSContrib.UI.bindPageLinks
     * @param {HTMLElement} element root node crawled for page actions
     */
    export function bindPageLinks(element) {
        $('*[data-page-link]', element).each(function () {
            var target = $(this).addClass('page-link').data('page-link');

            if (target && target.indexOf('/') < 0) {
                var tmp = WinJSContrib.Utils.readProperty(window, target);
                if (tmp) {
                    target = tmp;
                }
            }

            if (target) {
                $(this).tap(function(eltarg) {
                    var actionArgs = $(eltarg).data('page-action-args');
                    if (actionArgs && typeof actionArgs == 'string') {
                        try {
                            var tmp = WinJSContrib.Utils.readValue(eltarg, actionArgs);
                            if (tmp) {
                                actionArgs = tmp;
                            } else {
                                actionArgs = JSON.parse(actionArgs);
                            }
                        } catch (exception) {
                            return;
                        }
                    }

                    if (WinJSContrib.UI.parentNavigator && WinJSContrib.UI.parentNavigator(eltarg)) {
                        var nav = WinJSContrib.UI.parentNavigator(eltarg);
                        nav.navigate(target, actionArgs);
                    } else {
                        WinJS.Navigation.navigate(target, actionArgs);
                    }
                });
            }
        });
    }

    export function parentNavigator(element) {
        var current = element.parentNode;

        while (current) {
            if (current.mcnNavigator) {
                return current.winControl;
            }
            current = current.parentNode;
        }
    }

    /**
     * Add this element or control as member to the control. It looks for "data-page-member" attributes. If attribute is empty, it tooks the element id as member name.
     * @function WinJSContrib.UI.bindMembers
     * @param {HTMLElement} element root node crawled for page actions
     * @param {Object} control control owning functions to call
     */
    export function bindMembers(element, control) {
        $('*[data-page-member]', element).each(function () {
            var memberName = $(this).addClass('page-member').data('page-member');
            if (!memberName)
                memberName = this.id;

            if (memberName && !control[memberName]) {
                control[memberName] = this;
                if (this.winControl) {
                    control[memberName] = this.winControl;
                }
            }
        });
    }

    /**
     * setup declarative binding to parent control function and to navigation links. It internally invoke both {@link WinJSContrib.UI.bindPageActions} and {@link WinJSContrib.UI.bindPageLinks}
     * @function WinJSContrib.UI.bindActions
     * @param {HTMLElement} element root node crawled for page actions
     * @param {Object} control control owning functions to call
     */
    export function bindActions(element, control) {
        WinJSContrib.UI.bindPageActions(element, control);
        WinJSContrib.UI.bindPageLinks(element);
    }    

    /**
     * Trigger events on media queries. This class is usefull as a component for other controls to change some properties based on media queries
     * @class WinJSContrib.UI.MediaTrigger
     * @param {Object} items object containing one property for each query
     * @param {Object} linkedControl control linked to media trigger
     */
    export class MediaTrigger{
        public queries : Array<any>;
        public linkedControl : any;

        constructor(items, linkedControl){
            var ctrl = this;
            ctrl.queries = [];
            ctrl.linkedControl = linkedControl;

            for (var name in items) {
                var e = items[name];
                if (e.query) {
                    ctrl.registerMediaEvent(name, e.query, e);
                }
            }
        }

            /**
             * @function WinJSContrib.UI.MediaTrigger.prototype.dispose
             * release media trigger
             */
            public dispose() {
                var ctrl = this;
                ctrl.linkedControl = null;
                this.queries.forEach(function (q) {
                    q.dispose();
                });
            }

            /**
             * register an event from a media query
             * @function WinJSContrib.UI.MediaTrigger.prototype.registerMediaEvent
             * @param {string} name event name
             * @param {string} query media query
             * @param {Object} data data associated with this query
             */
            public registerMediaEvent(name, query, data) {
                var ctrl = this;
                var mq = window.matchMedia(query);
                var internalQuery = <any>{
                    name: name,
                    query: query,
                    data: data,
                    mq: mq,
                    dispose : null
                }

                var f = function (arg) {
                    if (arg.matches) {
                        ctrl._mediaEvent(arg, internalQuery);
                    }
                };

                mq.addListener(f);
                internalQuery.dispose = function () {
                    mq.removeListener(f);
                }

                ctrl.queries.push(internalQuery);
            }

            
            _mediaEvent(arg, query) {
                var ctrl = this;
                if (ctrl.linkedControl) {
                    WinJS.UI.setOptions(ctrl.linkedControl, query.data);
                }
                ctrl.dispatchEvent('media', query);
            }

            /**
             * @function WinJSContrib.UI.MediaTrigger.prototype.check
             * Check all registered queries
             */
            public check() {
                var ctrl = this;
                ctrl.queries.forEach(function (q) {
                    var mq = window.matchMedia(q.query);
                    if (mq.matches) {
                        ctrl._mediaEvent({ matches: true }, q);
                    }
                });
            }

        /**
         * Adds an event listener to the control.
         * @function WinJSContrib.UI.MediaTrigger.prototype.addEventListener
         * @param type The type (name) of the event.
         * @param listener The listener to invoke when the event gets raised.
         * @param useCapture If true, initiates capture, otherwise false.
        **/
        public addEventListener(type: string, listener: Function, useCapture?: boolean): void {
        }

        /**
         * Raises an event of the specified type and with the specified additional properties.
         * @function WinJSContrib.UI.MediaTrigger.prototype.dispatchEvent
         * @param type The type (name) of the event.
         * @param eventProperties The set of additional properties to be attached to the event object when the event is raised.
         * @returns true if preventDefault was called on the event.
        **/
        public dispatchEvent(type: string, eventProperties: any): boolean { 
            return false;
        }

        /**
         * Removes an event listener from the control.
         * @function WinJSContrib.UI.MediaTrigger.prototype.removeEventListener
         * @param type The type (name) of the event.
         * @param listener The listener to remove.
         * @param useCapture true if capture is to be initiated, otherwise false.
        **/
        public removeEventListener(type: string, listener: Function, useCapture?: boolean): void { }
    }
    WinJS.Class.mix(WinJSContrib.UI.MediaTrigger, WinJS.Utilities.eventMixin);

    

    /**
     * register navigation related events like hardware backbuttons. This method keeps track of previously registered navigation handlers
     *  and disable them until the latests is closed, enablinh multi-level navigation.
     * @function WinJSContrib.UI.registerNavigationEvents
     * @param {Object} control control taking ownership of navigation handlers
     * @param {function} callback callback to invoke when "back" is requested
     * @returns {function} function to call for releasing navigation handlers
     */
    export function registerNavigationEvents(control, callback) {
        var locked = [];

        control.navLocks = control.navLocks || [];
        control.navLocks.isActive = true;

        var backhandler = function (arg) {
            if (!control.navLocks || control.navLocks.length === 0) {
                callback.bind(control)(arg);
            }
        }

        var navcontrols = document.querySelectorAll('.mcn-navigation-ctrl');
        for (var i = 0; i < navcontrols.length; i++) {
            var navigationCtrl = (<any>navcontrols[i]).winControl;
            if (navigationCtrl && navigationCtrl != control) {
                navigationCtrl.navLocks = navigationCtrl.navLocks || [];
                if (navigationCtrl.navLocks.isActive && (!navigationCtrl.navLocks.length || navigationCtrl.navLocks.indexOf(control) < 0)) {
                    navigationCtrl.navLocks.push(control);
                    locked.push(navigationCtrl);
                }
            }
        }

        function cancelNavigation(args) {
            //this.eventTracker.addEvent(nav, 'beforenavigate', this._beforeNavigate.bind(this));
            var p = new WinJS.Promise(function (c) { });
            args.detail.setPromise(p);
            //setImmediate(function () {
            p.cancel();
            //});
        }

        WinJS.Navigation.addEventListener('beforenavigate', cancelNavigation);
        if ((<any>window).Windows && (<any>window).Windows.Phone)
            (<any>window).Windows.Phone.UI.Input.HardwareButtons.addEventListener("backpressed", backhandler);
        else
            document.addEventListener("backbutton", backhandler);

        if (WinJSContrib.UI.Application && WinJSContrib.UI.Application.navigator)
            WinJSContrib.UI.Application.navigator.addLock();

        return function () {
            if (WinJSContrib.UI.Application && WinJSContrib.UI.Application.navigator)
                WinJSContrib.UI.Application.navigator.removeLock();

            control.navLocks.isActive = false;
            locked.forEach(function (navigationCtrl) {
                var idx = navigationCtrl.navLocks.indexOf(control);
                if (idx >= 0)
                    navigationCtrl.navLocks.splice(idx, 1);
            });

            WinJS.Navigation.removeEventListener('beforenavigate', cancelNavigation);
            if ((<any>window).Windows && (<any>window).Windows.Phone)
                (<any>window).Windows.Phone.UI.Input.HardwareButtons.removeEventListener("backpressed", backhandler);
            else
                document.removeEventListener("backbutton", backhandler);
        }
    }

}
