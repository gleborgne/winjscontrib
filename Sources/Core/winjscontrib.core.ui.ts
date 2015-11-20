interface Window {
    Touch: any;
}

module WinJSContrib.UI {
    export interface WinJSContribApplication {
        navigator?: any
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
        public addEvent(e, eventName: string, handler, capture?: boolean) {
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
        var elements = document.querySelectorAll('div[data-win-control="WinJS.UI.AppBar"],div[data-win-control="WinJS.UI.NavBar"]');
        if (elements && elements.length) {
            for (var i = 0, l = elements.length; i < l; i++) {
                var el = <any>elements[i];
                if (el.winControl) {
                    el.winControl.disabled = false;
                }
            }
        }
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
                error({ message: 'image not loaded : ' + imgUrl, path: imgUrl });
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

    function bindAction(el, element, control) {
        if (!el)
            return;

        el.classList.add('page-action');
        var actionName = el.dataset.pageAction || el.getAttribute('tap');

        var action = control[actionName];
        if (action && typeof action === 'function') {
            WinJSContrib.UI.tap(el, function (eltarg) {
                var p = WinJS.Promise.wrap(actionArgs);
                var actionArgs = eltarg.dataset.pageActionArgs || el.getAttribute('tap-args');

                if (actionArgs && typeof actionArgs == 'string') {
                    var tmp = WinJSContrib.Utils.readValue(eltarg, actionArgs);
                    p = WinJS.Promise.as(tmp).then(function (val) {
                        if (typeof val === 'string') {
                            try {
                                val = WinJS.UI.optionsParser(val, window);

                            } catch (exception) {
                                return;
                            }
                        }

                        return val;
                    });
                    if (tmp) {
                        actionArgs = tmp;
                    } 
                }

                return p.then(function (arg) {
                    return control[actionName].bind(control)({ elt: eltarg, args: arg });
                });
            });
        }
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
        var elements = element.querySelectorAll('*[data-page-action], *[tap]');
        if (elements && elements.length) {
            for (var i = 0, l = elements.length; i < l; i++) {
                var el = elements[i];
                bindAction(el, element, control);
            }
        }
    }

    function bindLink(el, element) {
        if (!el)
            return;

        el.classList.add('page-link');
        var applink = el.getAttribute('applink');
        var target = el.dataset.pageLink || el.getAttribute('linkto');

        if (target && target.indexOf('/') < 0) {
            var tmp = WinJSContrib.Utils.readProperty(window, target);
            if (tmp) {
                target = tmp;
            }
        }

        if (target) {
            var options = el.dataset.pageActionOptions || el.getAttribute('tap-options');
            if (options) {
                try {
                    options = WinJS.UI.optionsParser(options, window);

                } catch (exception) {
                    return;
                }
            }

            WinJSContrib.UI.tap(el, function (eltarg) {
                var p = WinJS.Promise.wrap();
                var actionArgs = eltarg.dataset.pageActionArgs || el.getAttribute('linkto-args');
                if (actionArgs && typeof actionArgs == 'string') {

                    var tmp = WinJSContrib.Utils.readValue(eltarg, actionArgs);
                    p = WinJS.Promise.as(tmp).then(function (val) {
                        if (typeof val === 'string') {
                            try {
                                val = WinJS.UI.optionsParser(val, window);
                            } catch (exception) {

                            }
                        }

                        return val;
                    });
                }

                return p.then(function (actionArgs) {
                    if (!applink && WinJSContrib.UI.parentNavigator && WinJSContrib.UI.parentNavigator(eltarg)) {
                        var nav = WinJSContrib.UI.parentNavigator(eltarg);
                        return nav.navigate(target, actionArgs);
                    } else {
                        return WinJS.Navigation.navigate(target, actionArgs);
                    }
                });
            }, options);
        }
    }

    /**
     * setup declarative binding to page link. It looks for "data-page-link" attributes. 
     * If any the content of the attribute point toward a page. clicking that element will navigate to that page.
     * You could add arguments with a "page-action-args" attribute. The argument can be an object or a function
     * @function WinJSContrib.UI.bindPageLinks
     * @param {HTMLElement} element root node crawled for page actions
     */
    export function bindPageLinks(element) {
        var elements = element.querySelectorAll('*[data-page-link], *[linkto]');
        if (elements && elements.length) {
            for (var i = 0, l = elements.length; i < l; i++) {
                var el = elements[i];
                bindLink(el, element);
            }
        }
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

    function bindMember(el, element, control) {
        if (!el)
            return;

        el.classList.add('page-member');
        var memberName = el.dataset.pageMember || el.getAttribute('member');
        if (!memberName)
            memberName = el.id;

        if (memberName && !control[memberName]) {
            control[memberName] = el;
            if (el.winControl) {
                control[memberName] = el.winControl;
            }
        }
    }

    /**
     * Add this element or control as member to the control. It looks for "data-page-member" attributes. If attribute is empty, it tooks the element id as member name.
     * @function WinJSContrib.UI.bindMembers
     * @param {HTMLElement} element root node crawled for page actions
     * @param {Object} control control owning functions to call
     */
    export function bindMembers(element, control) {
        var elements = element.querySelectorAll('*[data-page-member], *[member]');
        if (elements && elements.length) {
            for (var i = 0, l = elements.length; i < l; i++) {
                var el = elements[i];
                bindMember(el, element, control);
            }
        }
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
    export class MediaTrigger {
        public queries: Array<any>;
        public linkedControl: any;

        constructor(items, linkedControl) {
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
                dispose: null
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
    var registeredNavigationStack = [];

    export function registerNavigationEvents(control, callback) {
        var locked = [];
        var registration = { control: control, callback: callback };
        registeredNavigationStack.push(registration);
        //control.navLocks = control.navLocks || [];
        //control.navLocks.isActive = true;

        var backhandler = function (arg) {
            var idx = registeredNavigationStack.indexOf(registration);
            if (idx === registeredNavigationStack.length - 1) {
                registration.callback.bind(registration.control)(arg);
                idx--;

                while (idx >= 0 && !arg.handled) {
                    var tmp = registeredNavigationStack[idx];
                    tmp.callback.bind(tmp.control)(arg);
                    idx--;
                }
            }
            //if (!control.navLocks || control.navLocks.length === 0) {
            //    callback.bind(control)(arg);
            //}
        }

        //var navcontrols = document.querySelectorAll('.mcn-navigation-ctrl');
        //for (var i = 0; i < navcontrols.length; i++) {
        //    var navigationCtrl = (<any>navcontrols[i]).winControl;
        //    if (navigationCtrl && navigationCtrl != control) {
        //        navigationCtrl.navLocks = navigationCtrl.navLocks || [];
        //        if (navigationCtrl.navLocks.isActive && (!navigationCtrl.navLocks.length || navigationCtrl.navLocks.indexOf(control) < 0)) {
        //            navigationCtrl.navLocks.push(control);
        //            locked.push(navigationCtrl);
        //        }
        //    }
        //}

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

        var keypress = function (args) {
            if (args.key === "Esc" || args.key === "Backspace") {
                backhandler(args);
            }
        };

        document.body.addEventListener('keypress', keypress);

        if (WinJSContrib.UI.Application && WinJSContrib.UI.Application.navigator)
            WinJSContrib.UI.Application.navigator.addLock();

        return function () {
            if (WinJSContrib.UI.Application && WinJSContrib.UI.Application.navigator)
                WinJSContrib.UI.Application.navigator.removeLock();

            //control.navLocks.isActive = false;
            //locked.forEach(function (navigationCtrl) {
            //    var idx = navigationCtrl.navLocks.indexOf(control);
            //    if (idx >= 0)
            //        navigationCtrl.navLocks.splice(idx, 1);
            //});

            var idx = registeredNavigationStack.indexOf(registration);
            registeredNavigationStack.splice(idx, 1);

            document.body.removeEventListener('keypress', keypress);
            WinJS.Navigation.removeEventListener('beforenavigate', cancelNavigation);
            if ((<any>window).Windows && (<any>window).Windows.Phone)
                (<any>window).Windows.Phone.UI.Input.HardwareButtons.removeEventListener("backpressed", backhandler);
            else
                document.removeEventListener("backbutton", backhandler);
        }
    }

	/**
	 * remove tap behavior
	 * @function WinJSContrib.UI.untap
	 * @param {HtmlElement} element element to clean
	 */
    export function untap(element) {
        if (!element)
            return;

        if (element.mcnTapTracking) {
            element.mcnTapTracking.dispose();
            element.mcnTapTracking = null;
        }
    }

	/**
	 * remove tap behavior from all childs
	 * @function WinJSContrib.UI.untapAll
	 * @param {HtmlElement} element element to clean
	 */
    export function untapAll(element) {
        if (!element)
            return;

        var taps = element.querySelectorAll('.tap');
        for (var i = 0, l = taps.length; i < l; i++) {
            untap(taps[i]);
        }
    }

    export var defaultTapBehavior = {
        animDown: null,
        animUp: null,
        disableAnimation: false,
        awaitAnim: false,
        errorDelay: 3000
    }

    if (WinJS && WinJS.UI && WinJS.UI.Animation) {
        defaultTapBehavior.animDown = WinJS.UI.Animation.pointerDown;
        defaultTapBehavior.animUp = WinJS.UI.Animation.pointerUp;
    }

	/**
	 * add tap behavior to an element, tap manages quirks like click delay, visual feedback, etc
	 * @function WinJSContrib.UI.tap
	 * @param {HtmlElement} element element to make "tappable"
	 * @param {function} callback callback function invoked on tap
	 * @param {Object} options tap options
	 */
    export function tap(element, callback, options?) {
        if (!element)
            return;

        var ptDown = function (event) {
            var elt = event.currentTarget || event.target;
            var tracking = elt.mcnTapTracking;
            if (!elt.disabled && tracking && (event.button === undefined || event.button === 0 || (tracking.allowRickClickTap && event.button === 2))) {

                if (tracking.lock) {
                    if (event.pointerId && event.currentTarget.setPointerCapture)
                        event.currentTarget.setPointerCapture(event.pointerId);
                    event.stopPropagation();
                    event.preventDefault();
                }
                WinJS.Utilities.addClass(elt, 'tapped');
                WinJS.Utilities.removeClass(elt, 'tap-error');
                clearTimeout(tracking.pendingErrorTimeout);
                if (event.changedTouches) {
                    tracking.pointerdown = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
                } else {
                    tracking.pointerdown = { x: event.clientX, y: event.clientY };
                }
                tracking.animDown(event.currentTarget);
                if (tracking.tapOnDown) {
                    tracking.callback(elt, event);
                }
            }
        }

        var ptOut = function (event) {
            var elt = event.currentTarget || event.target;
            var tracking = elt.mcnTapTracking;
            if (tracking && tracking.pointerdown) {
                WinJS.Utilities.removeClass(elt, 'tapped');

                if (event.pointerId && elt.releasePointerCapture) {
                    try { elt.releasePointerCapture(event.pointerId); } catch (exception) { console.error(exception); }
                }

                if (!tracking.disableAnimation)
                    tracking.animUp(event.currentTarget);
            }
        }

        var ptUp = function (event) {
            var elt = event.currentTarget || event.target;
            var tracking = elt.mcnTapTracking;
            if (tracking && (event.button === undefined || event.button === 0 || (tracking.allowRickClickTap && event.button === 2))) {
                if (elt.releasePointerCapture) {
                    try { elt.releasePointerCapture(event.pointerId); } catch (exception) { console.error(exception); }
                }

                if (tracking && !tracking.tapOnDown) {
                    event.stopPropagation();
                    var resolveTap = function () {
                        if (tracking && tracking.pointerdown) {
                            if (event.changedTouches) {
                                var dX = Math.abs(tracking.pointerdown.x - event.changedTouches[0].clientX);
                                var dY = Math.abs(tracking.pointerdown.y - event.changedTouches[0].clientY);
                            } else {
                                var dX = Math.abs(tracking.pointerdown.x - event.clientX);
                                var dY = Math.abs(tracking.pointerdown.y - event.clientY);
                            }

                            if (tracking.callback && dX < 15 && dY < 15) {
                                event.stopImmediatePropagation();
                                event.stopPropagation();
                                event.preventDefault();
                                var res = tracking.callback(elt, event);
                                if (res && WinJS.Promise.is(res)) {
                                    elt.disabled = true;
                                    WinJS.Utilities.addClass(elt, 'tap-working');
                                    res.then(function () {
                                        elt.disabled = false;
                                        WinJS.Utilities.removeClass(elt, 'tap-working');
                                    }, function (err) {
                                        elt.disabled = false;
                                        WinJS.Utilities.removeClass(elt, 'tap-working');
                                        console.error(err);
                                        WinJS.Application.queueEvent({ type: "mcn-taperror", error: err });
                                        WinJS.Utilities.addClass(elt, 'tap-error');
                                        if (tracking.errorDelay) {
                                            tracking.pendingErrorTimeout = setTimeout(() => {
                                                tracking.pendingErrorTimeout = null;
                                                WinJS.Utilities.removeClass(elt, 'tap-error');
                                            }, tracking.errorDelay);
                                        }
                                    })
                                }
                            }
                            if (tracking && tracking.pointerdown)
                                tracking.pointerdown = undefined;
                        }
                    }

                    if (tracking.awaitAnim) {
                        tracking.animUp(elt).done(resolveTap);
                    }
                    else {
                        tracking.animUp(elt);
                        resolveTap();
                    }
                }
                WinJS.Utilities.removeClass(elt, 'tapped');
            }
        }

        if (!options) {
            var attroptions = element.getAttribute('tap-options');
            if (attroptions) {
                try {
                    options = WinJS.UI.optionsParser(attroptions, window);
                } catch (exception) {
                    return;
                }
            }
        }

        var opt = options || {};
        if (element.mcnTapTracking) {
            element.mcnTapTracking.dispose();
        }

        WinJS.Utilities.addClass(element, 'tap');

        element.mcnTapTracking = element.mcnTapTracking || {};
        element.mcnTapTracking.eventTracker = new WinJSContrib.UI.EventTracker();
        element.mcnTapTracking.disableAnimation = opt.disableAnimation || defaultTapBehavior.disableAnimation;
        if (element.mcnTapTracking.disableAnimation) {
            element.mcnTapTracking.animDown = function () { return WinJS.Promise.wrap() };
            element.mcnTapTracking.animUp = function () { return WinJS.Promise.wrap() };
        } else {
            element.mcnTapTracking.animDown = opt.animDown || defaultTapBehavior.animDown;
            element.mcnTapTracking.animUp = opt.animUp || defaultTapBehavior.animUp;
        }
        element.mcnTapTracking.element = element;
        element.mcnTapTracking.callback = callback;
        element.mcnTapTracking.lock = opt.lock;
        element.mcnTapTracking.awaitAnim = opt.awaitAnim || defaultTapBehavior.awaitAnim;
        element.mcnTapTracking.errorDelay = opt.errorDelay || defaultTapBehavior.errorDelay;
        element.mcnTapTracking.tapOnDown = opt.tapOnDown;
        element.mcnTapTracking.pointerModel = 'none';
        element.mcnTapTracking.dispose = function () {
            WinJS.Utilities.removeClass(element, 'tap');
            this.eventTracker.dispose();
            element.mcnTapTracking = null;
            element = null;
        }

        if (element.onpointerdown !== undefined) {
            element.mcnTapTracking.pointerModel = 'pointers';
            element.mcnTapTracking.eventTracker.addEvent(element, 'pointerdown', ptDown);
            element.mcnTapTracking.eventTracker.addEvent(element, 'pointerout', ptOut);
            element.mcnTapTracking.eventTracker.addEvent(element, 'pointerup', ptUp);
        } else if (window.Touch && !opt.noWebkitTouch) {
            element.mcnTapTracking.pointerModel = 'touch';
            element.mcnTapTracking.eventTracker.addEvent(element, 'touchstart', function (arg) {
                element.mcnTapTracking.cancelMouse = true;
                ptDown(arg);
            });
            element.mcnTapTracking.eventTracker.addEvent(element, 'touchcancel', function (arg) {
                setTimeout(function () {
                    if (element && element.mcnTapTracking) element.mcnTapTracking.cancelMouse = false;
                }, 1000);
                ptOut(arg);
            });
            element.mcnTapTracking.eventTracker.addEvent(element, 'touchend', function (arg) {
                setTimeout(function () {
                    if (element && element.mcnTapTracking) element.mcnTapTracking.cancelMouse = false;
                }, 1000);
                ptUp(arg);
            });

            element.mcnTapTracking.eventTracker.addEvent(element, 'mousedown', function (arg) {
                if (!element.mcnTapTracking.cancelMouse)
                    ptDown(arg);
            });
            element.mcnTapTracking.eventTracker.addEvent(element, 'mouseleave', function (arg) {
                ptOut(arg);
            });
            element.mcnTapTracking.eventTracker.addEvent(element, 'mouseup', function (arg) {
                if (!element.mcnTapTracking.cancelMouse)
                    ptUp(arg);
                else
                    ptOut(arg);
            });
        } else {
            element.mcnTapTracking.pointerModel = 'mouse';
            element.mcnTapTracking.eventTracker.addEvent(element, 'mousedown', ptDown);
            element.mcnTapTracking.eventTracker.addEvent(element, 'mouseleave', ptOut);
            element.mcnTapTracking.eventTracker.addEvent(element, 'mouseup', ptUp);
        }

    }

	/**
	 * return a promise completed after css transition on the element is ended
	 * @function WinJSContrib.UI.afterTransition
	 * @param {HtmlElement} element element to watch
	 * @param {number} timeout timeout
	 */
    export function afterTransition(element, timeout?) {
        var timeOutRef = null;
        return new WinJS.Promise(function (complete, error) {
            var onaftertransition = function (event) {
                if (event.srcElement === element) {
                    close();
                }
            };
            var close = function () {
                clearTimeout(timeOutRef);
                element.removeEventListener("transitionend", onaftertransition, false);
                complete();
            }

            element.addEventListener("transitionend", onaftertransition, false);
            timeOutRef = setTimeout(close, timeout || 1000);
        });
    }

	/**
     * Utility class for building DOM elements through code with a fluent API
     * @class WinJSContrib.UI.FluentDOM
     * @param {string} nodeType type of DOM node (ex: 'DIV')
     * @param className css classes
	 * @param parentElt parent DOM element
	 * @param {WinJSContrib.UI.FluentDOM} parent parent FluentDOM
	 * @example
     * var elt = new WinJSContrib.UI.FluentDOM('DIV', 'item-content')
	 *    .text(item.title)
	 *    .display('none')
	 *    .element;
     */
    export class FluentDOM {
        public element: HTMLElement;
        public childs: Array<FluentDOM>;
        public parent: FluentDOM;

        constructor(nodeType: string, className?: string, parentElt?: Element, parent?: FluentDOM) {
            this.element = document.createElement(nodeType);
            if (className)
                this.element.className = className;
            if (parentElt)
                parentElt.appendChild(this.element);

            this.parent = parent;
            this.childs = [];
            if (parent) {
                parent.childs.push(this);
            }
        }

        public static for(element: HTMLElement) {
            var res = new FluentDOM(null);
            res.element = element;
            return res;
        }

        public static fragment() {
            var res = new FluentDOM(null);
            res.element = <HTMLElement>document.createDocumentFragment();
            return res;
        }

        get control() {
            return this.element.winControl;
        }

		/**
         * Add a css class
         * @function WinJSContrib.UI.FluentDOM.prototype.addClass
         * @param classname css class
		 * @returns {WinJSContrib.UI.FluentDOM}
         */
        addClass(classname: string) {
            if (this.element)
                this.element.classList.add(classname);
            return this;
        }

		/**
         * set className
         * @function WinJSContrib.UI.FluentDOM.prototype.className
         * @param classname css classes
		 * @returns {WinJSContrib.UI.FluentDOM}
         */
        className(classname: string) {
            if (this.element)
                this.element.className = classname;
            return this;
        }

		/**
         * set opacity
         * @function WinJSContrib.UI.FluentDOM.prototype.opacity
         * @param opacity opacity
		 * @returns {WinJSContrib.UI.FluentDOM}
         */
        opacity(opacity: string) {
            if (this.element)
                this.element.style.opacity = opacity;
            return this;
        }

		/**
         * set display
         * @function WinJSContrib.UI.FluentDOM.prototype.display
         * @param display display
		 * @returns {WinJSContrib.UI.FluentDOM}
         */
        display(display: string) {
            if (this.element)
                this.element.style.display = display;
            return this;
        }

		/**
         * set display 'none'
         * @function WinJSContrib.UI.FluentDOM.prototype.hide
		 * @returns {WinJSContrib.UI.FluentDOM}
         */
        hide() {
            if (this.element)
                this.element.style.display = 'none';
            return this;
        }

		/**
         * set visibility
         * @function WinJSContrib.UI.FluentDOM.prototype.visibility
         * @param visibility visibility
		 * @returns {WinJSContrib.UI.FluentDOM}
         */
        visibility(visibility: string) {
            if (this.element)
                this.element.style.visibility = visibility;
            return this;
        }

		/**
         * set textContent
         * @function WinJSContrib.UI.FluentDOM.prototype.text
         * @param text text
		 * @returns {WinJSContrib.UI.FluentDOM}
         */
        text(text: string) {
            if (this.element)
                this.element.textContent = text;
            return this;
        }

		/**
         * set innerHTML
         * @function WinJSContrib.UI.FluentDOM.prototype.html
         * @param text text
		 * @returns {WinJSContrib.UI.FluentDOM}
         */
        html(text: string) {
            if (this.element)
                this.element.innerHTML = text;
            return this;
        }

		/**
         * set attribute
         * @function WinJSContrib.UI.FluentDOM.prototype.attr
         * @param name attribute name
		 * @param val attribute value
		 * @returns {WinJSContrib.UI.FluentDOM}
         */
        attr(name: string, val: string) {
            if (this.element)
                this.element.setAttribute(name, val);
            return this;
        }

		/**
         * set style property
         * @function WinJSContrib.UI.FluentDOM.prototype.style
         * @param name attribute name
		 * @param val attribute value
		 * @returns {WinJSContrib.UI.FluentDOM}
         */
        style(name: string, val: string) {
            if (this.element)
                this.element.style[name] = val;
            return this;
        }

        /**
         * set style property
         * @function WinJSContrib.UI.FluentDOM.prototype.style
         * @param name attribute name
         * @param val attribute value
         * @returns {WinJSContrib.UI.FluentDOM}
         */
        styles(obj: any) {
            var st = this.element.style;
            var keys = Object.keys(obj);
            keys.forEach(function (k) {
                st[k] = obj[k];
            });
            return this;
        }

		/**
         * append element to another DOM element
         * @function WinJSContrib.UI.FluentDOM.prototype.appendTo
         * @param elt parent element
		 * @returns {WinJSContrib.UI.FluentDOM}
         */
        appendTo(elt: Element) {
            if (this.element && elt)
                elt.appendChild(this.element);
            return this;
        }

		
		/**
         * add tap behavior
         * @function WinJSContrib.UI.FluentDOM.prototype.tap
         * @param callback tap callback
		 * @param options tap options
		 * @returns {WinJSContrib.UI.FluentDOM}
         */
        tap(callback, options?) {
            if (this.element)
                WinJSContrib.UI.tap(this.element, callback, options);
            return this;
        }

		/**
         * create a child FluentDOM and append it to current
         * @function WinJSContrib.UI.FluentDOM.prototype.append
         * @param nodeType child node type
		 * @param className css classes
		 * @param callback callback receiving the new FluentDOM as an argument 
		 * @returns {WinJSContrib.UI.FluentDOM} current instance (for method chaining)
         */
        append(nodeType: string, className?: string, callback?: (FluentDOM) => void) {
            var child = new FluentDOM(nodeType, className, this.element, this);
            if (callback) {
                callback(child);
            }
            return this;
        }

		/**
         * create a child FluentDOM and append it to current
         * @function WinJSContrib.UI.FluentDOM.prototype.createChild
         * @param nodeType child node type
		 * @param className css classes
		 * @returns {WinJSContrib.UI.FluentDOM} child FluentDOM
         */
        createChild(nodeType: string, className?: string) {
            var child = new FluentDOM(nodeType, className, this.element, this);
            return child;
        }

		/**
         * create a WinJS control
         * @function WinJSContrib.UI.FluentDOM.prototype.ctrl
         * @param ctrl constructor or full name of the control
		 * @param options control options
		 * @returns {WinJSContrib.UI.FluentDOM}
         */
        ctrl(ctrl, options?) {
            var ctor = ctrl;
            if (typeof ctrl === 'string')
                ctor = WinJSContrib.Utils.readProperty(window, ctrl);

            if (ctor) {
                new ctor(this.element, options);
            }
            return this;
        }
    }
}
