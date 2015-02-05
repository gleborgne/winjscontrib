/* 
 * WinJS Contrib v2.0.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

/* 
 * WinJS Contrib v2.0.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

/* 
 * WinJS Contrib v2.0.0.3
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

if (!Object.map) {
    Object.map = function (obj, mapping) {
        var mapped = {};
        if (typeof obj !== 'object') {
            return mapped;
        }
        if (typeof mapping !== 'function') {
            // We could just return obj but that wouldn't be
            // consistent with the rest of the interface which always returns
            // a new object.
            mapping = function (key, val) {
                return [key, val];
            };
        }
        Object.keys(obj).forEach(function (key) {
            var transmuted = mapping.apply(obj, [key, obj[key]]);
            if (transmuted && transmuted.length) {
                mapped[transmuted[0] || key] = transmuted[1];
            }
        });
        return mapped;
    };
}

if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
              ? args[number]
              : match
            ;
        });
    };
}

if (!String.prototype.padLeft) {
    String.prototype.padLeft = function padLeft(length, leadingChar) {
        if (leadingChar === undefined) {
            leadingChar = "0";
        }

        return this.length < length ? (leadingChar + this).padLeft(length, leadingChar) : this;
    };
}

/**
 * @namespace WinJSContrib
 */
var WinJSContrib = WinJSContrib || {};

/** @namespace */
WinJSContrib.UI = WinJSContrib.UI || {};

/** @namespace */
WinJSContrib.UI.Pages = WinJSContrib.UI.Pages || {};

/**
 * indicate if fragment should not look for resources when building control
 * @field
 * @type {boolean}
 */
WinJSContrib.UI.disableAutoResources = false;

/** @namespace */
WinJSContrib.Utils = WinJSContrib.Utils || {};

/** @namespace */
WinJSContrib.Promise = WinJSContrib.Promise || {};

(function () {
    'use strict';

    /**
     * Calculate offset of element relative to parent element. If parent parameter is null, offset is relative to document
     * @param {HTMLElement} element element to evaluate
     * @param {HTMLElement} parent reference of offset
     */
    WinJSContrib.UI.offsetFrom = function (element, parent) {
        var xPosition = 0;
        var yPosition = 0;
        var w = element.clientWidth;
        var h = element.clientHeight;

        while (element && element != parent) {
            xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
            yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
            element = element.offsetParent;

        }

        return { x: xPosition, y: yPosition, width: w, height: h };
    }


    /**
     * @class
     * @classdesc object to register and release events from addEventListener or bind
     */
    WinJSContrib.UI.EventTracker = function EventTracker() {
        this.events = [];
    };

    /**
     * register an event from an object
     * @param {Object} e object containing addEventListener
     * @param {string} eventName name of the event
     * @param {function} handler
     * @param {boolean} capture
     * @returns {function} function to call for unregistering the event
     */
    WinJSContrib.UI.EventTracker.prototype.addEvent = function (e, eventName, handler, capture) {
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
    };

    /**
     * register binding event
     * @param {Object} e object containing bind method
     * @param {string} eventName name of the binding event
     * @param {function} handler
     */
    WinJSContrib.UI.EventTracker.prototype.addBinding = function (e, eventName, handler) {
        e.bind(eventName, handler);
        var unregister = function () {
            e.unbind(eventName, handler);
        };
        this.events.push(unregister);
        return unregister;
    };

    /**
     * release all registered events
     */
    WinJSContrib.UI.EventTracker.prototype.dispose = function () {
        for (var i = 0; i < this.events.length; i++) {
            this.events[i]();
        }
        this.events = [];
    };

    /**
     * open all appbars
     */
    WinJSContrib.UI.appbarsOpen = function () {
        var res = document.querySelectorAll('div[data-win-control="WinJS.UI.AppBar"],div[data-win-control="WinJS.UI.NavBar"]');
        if (res && res.length) {
            for (var i = 0; i < res.length; i++) {
                if (res[i].winControl) {
                    res[i].winControl.show();
                }
            }
        }
    };

    /**
     * close all appbars
     */
    WinJSContrib.UI.appbarsClose = function () {
        var res = document.querySelectorAll('div[data-win-control="WinJS.UI.AppBar"],div[data-win-control="WinJS.UI.NavBar"]');
        if (res && res.length) {
            for (var i = 0; i < res.length; i++) {
                if (res[i].winControl) {
                    res[i].winControl.hide();
                }
            }
        }
    };

    /**
     * disable all appbars
     */
    WinJSContrib.UI.appbarsDisable = function () {
        var res = document.querySelectorAll('div[data-win-control="WinJS.UI.AppBar"],div[data-win-control="WinJS.UI.NavBar"]');
        if (res && res.length) {
            for (var i = 0; i < res.length; i++) {
                if (res[i].winControl) {
                    res[i].winControl.disabled = true;
                }
            }
        }
    };

    /**
     * enable all appbars
     */
    WinJSContrib.UI.appbarsEnable = function () {
        $('div[data-win-control="WinJS.UI.AppBar"],div[data-win-control="WinJS.UI.NavBar"]').each(function () {
            if (this.winControl) {
                this.winControl.disabled = false;
            }
        });
    };


    /** 
     * build a promise around element "load" event (work for all element with src property like images, iframes, ...)
     * @param {HTMLElement} element
     * @param {string} url url used to feed "src" on element
     * @returns {WinJS.Promise}
     */
    WinJSContrib.UI.elementLoaded = function (elt, url) {
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
    };

    /**
     * Create a promise for getting an image object from url
     * @param {string} imgUrl url for the picture
     * @returns {WinJS.Promise}
     */
    WinJSContrib.UI.loadImage = function (imgUrl) {
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
    };

    /**
     * List all elements found after provided element
     * @param {HTMLElement} elt target element
     * @returns {Array} list of sibling elements
     */
    WinJSContrib.UI.listElementsAfterMe = function (elt) {
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
    };

    /**
     * create an animation for removing an element from a list
     * @param {HTMLElement} element that will be removed
     * @returns {WinJS.Promise}
     */
    WinJSContrib.UI.removeElementAnimation = function (elt) {
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
    };

    /**
     * setup declarative binding to parent control function. It looks for "data-page-action" attributes, 
     * and try to find a matching method on the supplyed control.
     * You could add arguments with a "page-action-args" attribute. The argument can be an object or a function
     * @param {HTMLElement} element root node crawled for page actions
     * @param {Object} control control owning functions to call
     */
    WinJSContrib.UI.bindPageActions = function (element, control) {
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
    };

    /**
     * setup declarative binding to page link. It looks for "data-page-link" attributes. 
     * If any the content of the attribute point toward a page. clicking that element will navigate to that page.
     * You could add arguments with a "page-action-args" attribute. The argument can be an object or a function
     * @param {HTMLElement} element root node crawled for page actions
     */
    WinJSContrib.UI.bindPageLinks = function (element) {
        $('*[data-page-link]', element).each(function () {
            var target = $(this).addClass('page-link').data('page-link');

            if (target && target.indexOf('/') < 0) {
                var tmp = WinJSContrib.Utils.readProperty(window, target);
                if (tmp) {
                    target = tmp;
                }
            }

            if (target) {
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

                    if (WinJSContrib.UI.parentNavigator && WinJSContrib.UI.parentNavigator(eltarg)) {
                        var nav = WinJSContrib.UI.parentNavigator(eltarg);
                        nav.navigate(target, actionArgs);
                    } else {
                        WinJS.Navigation.navigate(target, actionArgs);
                    }
                });
            }
        });
    };

    /**
     * Add this element or control as member to the control. It looks for "data-page-member" attributes. If attribute is empty, it tooks the element id as member name.
     * @param {HTMLElement} element root node crawled for page actions
     * @param {Object} control control owning functions to call
     */
    WinJSContrib.UI.bindMembers = function (element, control) {
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
     * @param {HTMLElement} element root node crawled for page actions
     * @param {Object} control control owning functions to call
     */
    WinJSContrib.UI.bindActions = function (element, control) {
        WinJSContrib.UI.bindPageActions(element, control);
        WinJSContrib.UI.bindPageLinks(element);
    };



    /** 
     * apply callback for each item in the array in waterfall 
     * @param {Array} dataArray items to process with async tasks
     * @param {function} promiseCallback function applyed to each item (could return a promise for item callback completion)
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Promise.waterfall = function (dataArray, promiseCallback) {
        var resultPromise = WinJS.Promise.wrap();
        var results = [];

        if (!dataArray) {
            return WinJS.Promise.wrap([]);
        }
        var dataPromise = WinJS.Promise.as(dataArray);

        return dataPromise.then(function (items) {
            var queueP = function (p, item) {
                return p.then(function (r) {
                    return WinJS.Promise.as(promiseCallback(item)).then(function (r) {
                        results.push(r);
                    });
                });
            }

            for (var i = 0, l = items.length; i < l; i++) {
                resultPromise = queueP(resultPromise, items[i]);
            }

            return resultPromise.then(function (r) {
                return results;
            });
        });

    };

    WinJSContrib.Promise.promises = function (dataArray, promiseCallback) {
        if (!dataArray) {
            return WinJS.Promise.wrap([]);
        }
        var dataPromise = WinJS.Promise.as(dataArray);

        return dataPromise.then(function (items) {
            var promises = [];
            for (var i = 0, l = items.length; i < l; i++) {
                promises.push(WinJS.Promise.as(promiseCallback(items[i])));
            }

            return promises;
        });
    };

    /** 
     * apply callback for each item in the array in parallel (equivalent to WinJS.Promise.join) 
     * @param {Array} dataArray items to process with async tasks
     * @param {function} promiseCallback function applyed to each item (could return a promise for item callback completion)
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Promise.parallel = function (dataArray, promiseCallback) {
        if (!dataArray) {
            return WinJS.Promise.wrap([]);
        }
        var dataPromise = WinJS.Promise.as(dataArray);

        return dataPromise.then(function (items) {
            var promises = [];
            for (var i = 0, l = items.length; i < l; i++) {
                promises.push(WinJS.Promise.as(promiseCallback(items[i])));
            }

            return WinJS.Promise.join(promises);
        });
    };

    /** 
     * apply callback for each item in the array in batch of X parallel items
     * @param {Array} dataArray items to process with async tasks
     * @param {number} batchSize number of items to batch
     * @param {function} promiseCallback function applyed to each item (could return a promise for item callback completion)
     * @returns {WinJS.Promise}
     */
    WinJSContrib.Promise.batch = function (dataArray, batchSize, promiseCallback) {
        if (!dataArray) {
            return WinJS.Promise.wrap([]);
        }
        var dataPromise = WinJS.Promise.as(dataArray);

        return dataPromise.then(function (items) {
            var resultPromise = WinJS.Promise.wrap();
            var batcheditems = [];
            var results = [];
            var hasErrors = false;

            var queueBatch = function (p, items) {
                //var batchresults = [];
                return p.then(function (r) {
                    return WinJS.Promise.join(items.map(function (item) { return WinJS.Promise.as(promiseCallback(item)); })).then(function (results) {
                        results = results.concat(results);
                    }, function (errors) {
                        results = results.concat(errors);
                        hasErrors = true;
                    });
                });
            }

            for (var i = 0, l = items.length; i < l; i++) {
                batcheditems.push(items[i]);
                if (i > 0 && i % batchSize == 0) {
                    resultPromise = queueBatch(resultPromise, batcheditems);
                    batcheditems = [];
                }

            }

            if (batcheditems.length) {
                resultPromise = queueBatch(resultPromise, batcheditems);
            }

            return resultPromise.then(function () {
                if (hasErrors)
                    return WinJS.Promise.wrapError(results);

                return results;
            });
        });
    };



    /** indicate if string starts with featured characters 
     * @param {string} str string to search within
     * @param {string} strToMatch match string
     * @returns {boolean} true if string starts with strToMatch
     */
    WinJSContrib.Utils.startsWith = function startsWith(str, strToMatch) {
        if (!strToMatch) {
            return false;
        }
        var match = (str.match("^" + strToMatch) == strToMatch);
        return match;
    }

    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (str) {
            return WinJSContrib.Utils.startsWith(this, str);
        };
    }

    /** indicate if string ends with featured characters 
     * @param {string} str string to search within
     * @param {string} strToMatch match string
     * @returns {boolean} true if string starts with strToMatch
     */
    WinJSContrib.Utils.endsWith = function endsWith(str, strToMatch) {
        if (!strToMatch) {
            return false;
        }
        return (str.match(strToMatch + "$") == strToMatch);
    }

    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function (str) {
            return WinJSContrib.Utils.endsWith(this, str);
        };
    }

    /**
     * generate a string formatted as a query string from object properties
     * @param {Object} obj object to format
     * @returns {string}
     */
    WinJSContrib.Utils.queryStringFrom = function queryStringFrom(obj) {
        var str = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    }



    /**
     * trigger an event on a DOM node
     * @param {HTMLElement} element receiving the event
     * @param {string} eventName name of the event
     * @param {boolean} bubbles indicate if event should bubble
     * @param {boolean} cancellable indicate if event can be cancelled
     */
    WinJSContrib.Utils.triggerEvent = function (element, eventName, bubbles, cancellable) {
        var eventToTrigger = document.createEvent("Event");
        eventToTrigger.initEvent(eventName, bubbles, cancellable);
        element.dispatchEvent(eventToTrigger);
    };

    /**
     * @param {HTMLElement} element receiving the event
     * @param {string} eventName name of the event
     * @param {boolean} bubbles indicate if event should bubble
     * @param {boolean} cancellable indicate if event can be cancelled
     */
    WinJSContrib.Utils.triggerCustomEvent = function (element, eventName, bubbles, cancellable, data) {
        var eventToTrigger = document.createEvent("CustomEvent");
        eventToTrigger.initCustomEvent(eventName, bubbles, cancellable, data);
        element.dispatchEvent(eventToTrigger);
    };

    /* 
    Core object properties features
    */

    //return object value based on property name. Property name is a string containing the name of the property, 
    //or the name of the property with an indexer, ex: myproperty[2] (to get item in a array)
    function getobject(obj, prop) {
        if (!obj)
            return;

        if (prop === 'this')
            return obj;

        var baseValue = obj[prop];
        if (typeof baseValue !== "undefined")
            return baseValue;

        var idx = prop.indexOf('[');
        if (idx < 0)
            return;
        var end = prop.indexOf(']', idx);
        if (end < 0)
            return;

        var val = prop.substr(idx + 1, end - idx);
        val = parseInt(val);

        return obj[val];
    }

    //set object property value based on property name. Property name is a string containing the name of the property, 
    //or the name of the property with an indexer, ex: myproperty[2] (to get item in a array)
    function setobject(obj, prop, data) {
        if (WinJSContrib.Utils.hasValue(prop)) {
            if (obj.setProperty) {
                obj.setProperty(prop, data);
                return;
            }

            obj[prop] = data;
            return;
        }

        if (typeof prop === "string") {
            var idx = prop.indexOf('[');
            if (idx < 0)
                return;
            var end = prop.indexOf(']', idx);
            if (end < 0)
                return;

            var val = prop.substr(idx + 1, end - idx);
            val = parseInt(val);

            obj[val] = data;
        }
    }

    /** Read property value on an object based on expression
    * @param {Object} source the object containing data
    * @param {Object} properties property descriptor. could be a string in js notation ex: 'myProp.myChildProp, 
    * or an array of strings ['myProp', 'myChildProp']. String notation can contain indexers
    * @returns {Object} property value
    */
    WinJSContrib.Utils.readProperty = function readProperty(source, properties) {
        if (typeof properties == 'string' && source[properties])
            return source[properties];

        if (!properties || !properties.length)
            return source;

        var prop = WinJSContrib.Utils.getProperty(source, properties);
        if (prop) {
            return prop.propValue;
        }
    }

    /**
     * return a propery descriptor for an object based on expression
     * @param {Object} source the object containing data
     * @param {string[]} properties property descriptor. could be a string in js notation ex: 'myProp.myChildProp, 
     * or an array of strings ['myProp', 'myChildProp']. String notation can contain indexers
     * @returns {Object} property descriptor
     */
    WinJSContrib.Utils.getProperty = function getProperty(source, properties) {
        if (typeof properties == 'string') {
            properties = properties.split('.');
        }

        if (!properties || !properties.length) {
            properties = ['this'];
            //return;
        }

        var parent = source;
        var previousDescriptor = null;
        for (var i = 0; i < properties.length; i++) {
            var descriptor = {
                parent: parent,
                parentDescriptor: previousDescriptor,
                keyProp: properties[i],
                ensureParent: function () {
                    if (parent) {
                        return parent;
                    } else {
                        if (this.parentDescriptor) {
                            this.parentDescriptor.ensureParent();

                            if (!this.parentDescriptor.parent[this.parentDescriptor.keyProp]) {
                                this.parentDescriptor.parent[this.parentDescriptor.keyProp] = {};
                                this.parent = this.parentDescriptor.parent[this.parentDescriptor.keyProp];
                            }
                        }
                    }
                },

                get propValue() {
                    return getobject(this.parent, this.keyProp);
                },

                set propValue(val) {
                    this.ensureParent();
                    return setobject(this.parent, this.keyProp, val);
                }
            };

            previousDescriptor = descriptor;

            if (i == properties.length - 1) {
                return descriptor;
            }
            parent = getobject(parent, properties[i]);
        }

        return;
    }

    /**
     * Write property value on an object based on expression
     * @param {Object} source the object containing data
     * @param {string[]} properties property descriptor. could be a string in js notation ex: 'myProp.myChildProp, 
     * or an array of strings ['myProp', 'myChildProp']. String notation can contain indexers
     * @param {Object} data data to feed to the property
     */
    WinJSContrib.Utils.writeProperty = function (source, properties, data) {
        var prop = WinJSContrib.Utils.getProperty(source, properties);
        if (prop) {
            prop.propValue = data;
            //prop.parent[prop.keyProp] = data;
        }
    };


    /** generate a random value between two numbers 
     * @param {number} from lower limit
     * @param {number} to upper limit
     * @returns {number}
     */
    WinJSContrib.Utils.randomFromInterval = function (from, to) {
        return (Math.random() * (to - from + 1) + from) << 0;
    };

    /** 
     * function to use as a callback for Array.sort when you want the array to be sorted alphabetically
     * @param {string} a
     * @param {string} b
     * @returns {number}
     */
    WinJSContrib.Utils.alphabeticSort = function (a, b) {
        if (a > b)
            return 1;
        if (a < b)
            return -1;

        return 0;
    };

    /**
     * generate an array with only distinct elements
     * @param {Array} array
     * @param {string} path to array's item property used for checking items
     * @param {boolean} ignorecase indicate if comparison should ignore case when using string
     * @returns {Array}
     */
    WinJSContrib.Utils.distinctArray = function (array, property, ignorecase) {
        if (array == null || array.length == 0) return array;
        if (typeof ignorecase == "undefined") ignorecase = false;
        var sMatchedItems = "";
        var foundCounter = 0;
        var newArray = [];
        if (ignorecase) {
            for (var i = 0; i < array.length; i++) {
                if (property) {
                    var data = WinJSContrib.Utils.readProperty(array[i], property.split('.'));
                    var sFind = data;
                    if (!data)
                        sFind = data;
                    if (data && data.toLowerCase)
                        sFind = data.toLowerCase();
                } else {
                    var sFind = array[i];
                }
                if (sMatchedItems.indexOf("|" + sFind + "|") < 0) {
                    sMatchedItems += "|" + sFind + "|";
                    newArray[foundCounter++] = array[i];
                }
            }
        } else {
            for (var i = 0; i < array.length; i++) {
                if (property) {
                    var sFind = WinJSContrib.Utils.readProperty(array[i], property.split('.'));
                } else {
                    var sFind = array[i];
                }

                if (sMatchedItems.indexOf("|" + sFind + "|") < 0) {
                    sMatchedItems += "|" + sFind + "|";
                    newArray[foundCounter++] = array[i];
                }
            }
        }
        return newArray;
    };

    /**
     * get distinct values from an array of items
     * @param {Array} array items array
     * @param {string} property property path for values
     * @param {boolean} ignorecase ignore case for comparisons
     */
    WinJSContrib.Utils.getDistinctPropertyValues = function (array, property, ignorecase) {
        return Utils.distinctArray(array, property, ignorecase).map(function (item) {
            return WinJSContrib.Utils.readProperty(item, property.split('.'));
        });
    };

    /**
     * Remove all accented characters from a string and replace them with their non-accented counterpart for ex: replace "é" with "e"
     * @param {string} s
     * @returns {string}
     */
    WinJSContrib.Utils.removeAccents = function (s) {
        var r = s.toLowerCase();
        r = r.replace(new RegExp("[àáâãäå]", 'g'), "a");
        r = r.replace(new RegExp("æ", 'g'), "ae");
        r = r.replace(new RegExp("ç", 'g'), "c");
        r = r.replace(new RegExp("[èéêë]", 'g'), "e");
        r = r.replace(new RegExp("[ìíîï]", 'g'), "i");
        r = r.replace(new RegExp("ñ", 'g'), "n");
        r = r.replace(new RegExp("[òóôõö]", 'g'), "o");
        r = r.replace(new RegExp("œ", 'g'), "oe");
        r = r.replace(new RegExp("[ùúûü]", 'g'), "u");
        r = r.replace(new RegExp("[ýÿ]", 'g'), "y");
        return r;
    };

    /**
     * remove a page from navigation history
     * @param {string} pageLocation page url
     */
    WinJSContrib.Utils.removePageFromHistory = function (pageLoc) {
        var history = [];
        if (WinJS.Navigation.history && WinJS.Navigation.history.backStack && WinJS.Navigation.history.backStack.length) {
            WinJS.Navigation.history.backStack.forEach(function (page) {
                if (page.location !== pageLoc) {
                    history.push(page);
                }
            });
        }
        WinJS.Navigation.history.backStack = history;
    };

    /**
     * format a number on 2 digits
     * @param {number} number
     */
    WinJSContrib.Utils.pad2 = function (number) {
        return (number < 10 ? '0' : '') + number;
    };

    /**
     * truncate a string and add ellipse if text if greater than certain size
     * @param {string} text text to truncate
     * @param {number} maxSize maximum size for text
     * @param {boolean} useWordBoundary indicate if truncate should happen on the closest word boundary (like space)
     */
    WinJSContrib.Utils.ellipsisizeString = function (text, maxSize, useWordBoundary) {
        if (!text) {
            return '';
        }
        var toLong = text.length > maxSize, text_ = toLong ? text.substr(0, maxSize - 1) : text;
        text_ = useWordBoundary && toLong ? text_.substr(0, text_.lastIndexOf(' ')) : text_;
        return toLong ? text_ + '...' : text_;
    };

    /**
     * generate a new Guid
     * @returns {string}
     */
    WinJSContrib.Utils.guid = function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    };

    /**
     * inherit property from parent WinJS controls
     * @param {HTMLElement} element
     * @param {string} property property name
     */
    WinJSContrib.Utils.inherit = function (element, property) {
        if (element && element.parentElement) {
            var current = element.parentElement;
            while (current) {
                if (current.winControl) {
                    if (current.winControl[property] != undefined) {
                        return current.winControl[property];
                    }
                }
                current = current.parentElement;
            }
        }
    };

    /**
     * move DOM childrens form one node to the other
     * @param {HTMLElement} source source node containing elements to move
     * @param {HTMLElement} target target node for moved elements
     */
    WinJSContrib.Utils.moveChilds = function (source, target) {
        var childs = [];
        for (var i = 0; i < source.children.length; i++) {
            childs.push(source.children[i]);
        }
        childs.forEach(function (elt) {
            target.appendChild(elt);
        });
    };

    /**
     * get parent control identifyed by a property attached on DOM element
     * @param {string} property property attached to control's DOM element, for ex: msParentSelectorScope
     * @param {HTMLElement} element DOM element to scan
     * @returns {Object} WinJS control
     */
    WinJSContrib.Utils.getParent = function (property, element) {
        var current = element.parentNode;

        while (current) {
            if (current[property] && current.winControl) {
                return current.winControl;
            }
            current = current.parentNode;
        }
    };

    /**
     * get parent control identifyed by a css class
     * @param {string} className css class name
     * @param {HTMLElement} element DOM element to scan
     * @returns {Object} WinJS control
     */
    WinJSContrib.Utils.getParentControlByClass = function (className, element) {
        var current = element.parentNode;

        while (current) {
            if (current.classList && current.classList.contains(className) && current.winControl) {
                return current.winControl;
            }
            current = current.parentNode;
        }
    };

    /**
     * get parent page control (work only with WinJSContrib.UI.PageControlNavigator
     * @param {HTMLElement} element DOM element to scan
     * @returns {Object} WinJS control
     */
    WinJSContrib.Utils.getParentPage = function (element) {
        return WinJSContrib.Utils.getParent('mcnPage', element);
    };

    /**
     * get parent scope control (based on msParentSelectorScope)
     * @param {HTMLElement} element DOM element to scan
     * @returns {Object} WinJS control
     */
    WinJSContrib.Utils.getScopeControl = function (element) {
        var current = element.parentNode;

        while (current) {
            if (current.msParentSelectorScope) {
                var scope = current.parentNode;
                if (scope) {
                    var scopeControl = scope.winControl;
                    if (scopeControl) {
                        return scopeControl;

                    }
                    //var scopeParent = scope.parentNode;
                    //var scopeParentControl = scopeParent.winControl;
                }
            }
            current = current.parentNode;
        }
    };

    /**
     * get WinJS.Binding.Template like control from a path, a control, a function or a DOM element
     * @param {Object} template template input
     * @returns {Object} WinJS.Binding.Template or template-like object (object with a render function)
     */
    WinJSContrib.Utils.getTemplate = function (template) {
        if (template) {
            var templatetype = typeof template;
            if (templatetype == 'string') {
                return new WinJS.Binding.Template(null, { href: template });
            }
            if (templatetype == 'function') {
                return {
                    render: function (data, elt) {
                        var res = template(data, elt);
                        return WinJS.Promise.as(res);
                    }
                };
            } else if (template.winControl) {
                return template.winControl;
            } else if (template.render) {
                return template;
            }
        }
    };

    /**
     * get a function from an expression, for example 'page:myAction' will return the myAction function from the parent page.
     * The returned function will be bound to it's owner. This function relies on {link WinJSContrib.Utils.resolveValue}, see this for details about how data are crawled
     * @param {HTMLElement} element DOM element to look
     * @param {string} text expression like 'page:something' or 'ctrl:something' or 'something'
     * @returns {function}
     */
    WinJSContrib.Utils.resolveMethod = function (element, text) {
        var res = WinJSContrib.Utils.resolveValue(element, text);
        if (res && typeof res == 'function')
            return res;

        return undefined;
    };

    WinJSContrib.Utils.readValue = function (element, text) {
        var res = WinJSContrib.Utils.resolveValue(element, text);
        if (res) {
            if (typeof res == 'function')
                return res(element);
            else
                return res;
        }
        return undefined;
    };

    /**
     * resolve value from an expression. This helper will crawl the DOM up, and provide the property or function from parent page or control.
     * @param {HTMLElement} element DOM element to look
     * @param {string} text expression like 'page:something' or 'ctrl:something' or 'something'
     * @returns {Object}
     */
    WinJSContrib.Utils.resolveValue = function (element, text) {
        var methodName, control, method;

        if (text.indexOf('page:') == 0) {
            methodName = text.substr(5);
            if (WinJSContrib.Utils.getParentPage) {
                control = WinJSContrib.Utils.getParentPage(element);
            }
            if (!control && WinJSContrib.UI.Application.navigator) {
                control = WinJSContrib.UI.Application.navigator.pageControl;
            }

            if (!control)
                return;

            method = WinJSContrib.Utils.readProperty(control, methodName);
            if (method && typeof method == 'function')
                method = method.bind(control);
        } else if (text.indexOf('ctrl:') == 0) {
            methodName = text.substr(5);
            control = WinJSContrib.Utils.getScopeControl(element);
            method = WinJSContrib.Utils.readProperty(control, methodName);
            if (method && typeof method == 'function')
                method = method.bind(control);
        } else {
            methodName = text;
            control = WinJSContrib.Utils.getScopeControl(element);
            method = WinJSContrib.Utils.readProperty(window, methodName);
        }

        return method;
    };



    /**
     * Checks in a safe way if an object has a value, which could be 'false', '0' or '""'
     * @param {Object} item The object to check.
     * @returns {Boolean} Whether the object has a value or not.
     */
    WinJSContrib.Utils.hasValue = function (item) {
        return typeof item !== "undefined" && item !== null;
    };

    /**
     * format error from an xhr call
     */
    WinJSContrib.Utils.formatXHRError = function (xhr) {
        return "{0} - {1}: {2}".format(xhr.status, xhr.statusText, xhr.responseText);
    };

    /**
     * Unwraps the real error from a WinJS.Promise.join operation, which by design returns an array with 'undefined' for all cells,
     * excepts the one corresponding to the promise that really faulted.
     * @param {function} errorCallback The callback to use to handle the error.
     * @returns {Function} The result of the callback being fired with the real error.
     */
    WinJSContrib.Utils.unwrapJoinError = function (errorCallback) {

        return function (errorArray) {
            var unwrappedError = null;
            for (var i = 0; i < errorArray.length; i++) {
                var tentativeError = errorArray[i];
                if (typeof tentativeError !== "undefined") {
                    unwrappedError = tentativeError;
                    break;
                }
            }

            return errorCallback(unwrappedError);
        };
    };

    /**
     * inject properties from source object to target object
     */
    WinJSContrib.Utils.inject = function (target, source) {
        if (source) {
            for (var k in source) {
                target[k] = source[k];
            }
        }
    },

    /**
     * List of mixins to apply to each fragment managed by WinJS Contrib (through navigator or by calling explicitely {@link WinJSContrib.UI.Pages.fragmentMixin}).
     * @field
     * @type {Array}
     */
    WinJSContrib.UI.Pages.defaultFragmentMixins = [{

        $: function (selector) {
            return $(selector, this.element || this._element);
        },

        q: function (selector) {
            return this.element.querySelector(selector);
        },

        qAll: function (selector) {
            var res = this.element.querySelectorAll(selector);
            if (res && !res.forEach) {
                res.forEach = function (callback) {
                    for (var i = 0 ; i < res.length; i++) {
                        callback(res[i], i);
                    }
                }
            }
        },

        eventTracker: {
            get: function () {
                if (!this._eventTracker)
                    this._eventTracker = new WinJSContrib.UI.EventTracker();
                return this._eventTracker;
            }
        },

        promises: {
            get: function () {
                if (!this._promises)
                    this._promises = [];
                return this._promises;
            }
        },

        addPromise: function (prom) {
            this.promises.push(prom);
            return prom;
        },

        cancelPromises: function () {
            var page = this;
            if (page.promises) {
                for (var i = 0; i < page.promises.length; i++) {
                    if (page.promises[i]) {
                        page.promises[i].cancel();
                    }
                }
            }
        }
    }];

    /**
     * substitute for WinJS.UI.Pages.define that injects custom WinJS Contrib behaviors
     */
    WinJSContrib.UI.Pages.define = function (location, members) {
        var ctor = WinJS.UI.Pages.define(location, members);
        WinJSContrib.UI.Pages.fragmentMixin(ctor);
        return ctor;
    }

    /**
     * Inject WinJSContrib fragment enhancements, such as "$","q", "qAll" functions for scoped selectors, eventTracker and promises properties
     * This enhancement also allows you to add behavior on each WinJS fragment by adding them to {@link WinJSContrib.UI.Pages.defaultFragmentMixins}
     * WinJS Contrib navigator is calling this method before processing the page, so you don't need to explicitely wrap all your pages if you use it 
     * @param {function} constructor constructor for the fragment
     * @returns {function} constructor for the fragment
     * @example
     * WinJSContrib.UI.Pages.fragmentMixin(WinJS.UI.Pages.define("./demos/home.html", {
     *     ready : function(){
     *         //your page ready stuff
     *     }
     * }));
     */
    WinJSContrib.UI.Pages.fragmentMixin = function (constructor) {
        var proto = constructor.prototype;

        if (constructor.winJSContrib)
            return;

        constructor.winJSContrib = true;

        WinJSContrib.UI.Pages.defaultFragmentMixins.forEach(function (mixin) {
            WinJS.Class.mix(constructor, mixin);
        });

        if (!proto.__wLoad) {
            //wrap WinJS page events with custom functions
            proto.__wLoad = proto.load;


            proto.load = function (uri) {
                return WinJS.Promise.as(this.__wLoad.apply(this, arguments)).then(function (arg) {
                    if (!proto.__wInit) {
                        //this register should happen after first page load, otherwise page methods will override framework method
                        register(proto);
                    }
                    return arg;
                });
            }

            var register = function (proto) {
                proto.__wDispose = proto.dispose;
                proto.__wInit = proto.init;
                proto.__wProcess = proto.process;
                proto.__wProcessed = proto.processed;
                proto.__wRender = proto.render;
                proto.__wReady = proto.ready;
                proto.__wError = proto.error;
                proto.__wUpdateLayout = proto.updateLayout;

                proto.init = function (element, options) {
                    element.classList.add('mcn-fragment');
                    element.classList.add('mcn-layout-ctrl');

                    if (element.style.display)
                        this._initialDisplay = element.style.display;
                    element.style.display = 'hidden';
                    return this.__wInit.apply(this, arguments);
                }

                proto.process = function (element, options) {
                    var page = this;
                    var processargs = arguments;
                    return WinJS.Promise.as(page.__wProcess.apply(page, processargs));

                    //.then(function () {
                    //    WinJSContrib.UI.bindMembers(element, page);
                    //    return page.prepareDataPromise;
                    //}).then(function(){
                    //    return broadcast(page, element, 'prepare', [element, options], null, page.prepare);
                    //}).then(function () {
                    //    element.style.display = page._initialDisplay || '';
                    //    return WinJS.Promise.timeout();
                    //}).then(function () {
                    //    if (page.onbeforelayout)
                    //        return page.onbeforelayout(element, options);
                    //}).then(function () {
                    //    return broadcast(page, element, 'pageLayout', [element, options], null, page.pageLayout);
                    //}).then(function () {
                    //    if (page.onafterlayout)
                    //        return page.onafterlayout(element, options);
                    //});
                }

                proto.processed = function (element, options) {
                    var page = this;
                    var processedargs = arguments;
                    WinJSContrib.UI.bindMembers(element, page);
                    return page.prepareDataPromise.then(function () {
                        return broadcast(page, element, 'prepare', [element, options], null, page.prepare);
                    }).then(function () {
                        element.style.display = page._initialDisplay || '';
                        return WinJS.Promise.timeout();
                    }).then(function () {
                        if (page.onbeforelayout)
                            return page.onbeforelayout(element, options);
                    }).then(function () {
                        return broadcast(page, element, 'pageLayout', [element, options], null, page.pageLayout);
                    }).then(function () {
                        if (page.onafterlayout)
                            return page.onafterlayout(element, options);
                    }).then(function () {
                        return WinJS.Promise.as(page.__wProcessed.apply(page, processedargs));
                    });

                }

                proto.render = function (element, options, loadResult) {
                    var page = this;
                    var renderargs = arguments;
                    if (page.prepareData)
                        page.prepareDataPromise = WinJS.Promise.as(page.prepareData(element, options));
                    else
                        page.prepareDataPromise = WinJS.Promise.wrap();

                    return WinJS.Promise.as(page.__wRender.apply(page, renderargs));
                }

                proto.ready = function (element, options) {
                    var page = this;
                    WinJSContrib.UI.bindActions(element, this);
                    return WinJS.Promise.as(page.__wReady.apply(page, arguments)).then(function () {
                        if (page.onafterready)
                            return page.onafterready(element, options);
                    }).then(function () {
                        return broadcast(page, element, 'pageReady', [element, options]);
                    }).then(function () {
                        if (page.enterPageAnimation) {
                            return WinJS.Promise.as(page.enterPageAnimation(element, options));
                        }
                    }).then(function () {
                        return broadcast(page, element, 'contentReady', [element, options], null, page.contentReady);
                    });
                }

                proto.dispose = function () {
                    $('.tap', this.element).untap();
                    if (this.eventTracker) {
                        this.eventTracker.dispose();
                        this._eventTracker = null;
                    }
                    if (this.promises && this.cancelPromises) {
                        this.cancelPromises();
                        this._promises = [];
                    }

                    if (this.__wDispose)
                        this.__wDispose(this);
                }

                proto.updateLayout = function () {
                    var page = this;
                    var updateLayoutArgs = arguments;
                    var p = WinJS.Promise.wrap();
                    if (page.__wUpdateLayout) {
                        p = WinJS.Promise.as(page.__wUpdateLayout.apply(page, updateLayoutArgs));
                    }

                    return p.then(function () {
                        return broadcast(page, page.element, 'updateLayout', updateLayoutArgs);
                    });
                }
            }
        }

        return constructor;
    }

    function broadcast(ctrl, element, eventName, args, before, after) {
        var pagelayoutCtrls = element.querySelectorAll('.mcn-layout-ctrl');
        var promises = [];
        if (before)
            promises.push(WinJS.Promise.as(before.apply(ctrl, args)));


        var query = element.querySelectorAll(".mcn-layout-ctrl");

        var index = 0;
        var length = query.length;
        while (index < length) {
            var childctrl = query[index];
            if (childctrl) {
                var event = childctrl.winControl[eventName];
                if (event) {
                    promises.push(WinJS.Promise.as(event.apply(childctrl.winControl, args)));

                }
            }

            // Skip descendants
            //index += childctrl.querySelectorAll(".mcn-fragment, .mcn-layout-ctrl").length + 1;
            index += 1;
        }

        if (after)
            promises.push(WinJS.Promise.as(after.apply(ctrl, args)));

        return WinJS.Promise.join(promises);
    }

    /**
     * render a html fragment with winjs contrib pipeline and properties, and add WinJS Contrib page events.
     * @param {HTMLElement} container element that will contain the fragment
     * @param {string} location url for the fragment
     * @param {Object} args arguments to the fragment
     * @param {Object} options rendering options
     */
    WinJSContrib.UI.renderFragment = function (container, location, args, options) {
        var parentedComplete;
        options = options || {};
        var element = document.createElement("div");
        element.setAttribute("dir", window.getComputedStyle(element, null).direction);
        element.style.opacity = '0';
        container.appendChild(element);

        var parented = null;//new WinJS.Promise(function (c) { parentedComplete = c; });
        var layoutCtrls = [];
        var pageConstructor = WinJS.UI.Pages.get(location);
        WinJSContrib.UI.Pages.fragmentMixin(pageConstructor);

        var elementCtrl = new pageConstructor(element, args, null, parented);
        if (args && args.injectToPage) {
            WinJSContrib.Utils.inject(elementCtrl, args.injectToPage);
        }
        elementCtrl.navigationState = { location: location, state: args };
        if (options.onfragmentinit) {
            options.onfragmentinit(elementCtrl);
        }

        if (options.onafterlayout)
            elementCtrl.onafterlayout = options.onafterlayout;
        if (options.onafterready)
            elementCtrl.onafterready = options.onafterready;

        if (options.enterPage) {
            if (elementCtrl.enterPageAnimation)
                elementCtrl._enterAnimation = elementCtrl.enterPageAnimation;
            else
                elementCtrl._enterAnimation = options.enterPage;

            elementCtrl.enterPageAnimation = function () {
                var page = this;
                var elts = null;
                if (page && page.getAnimationElements) {
                    elts = page.getAnimationElements(false);
                } else {
                    elts = page.element;
                }

                //this.dispatchEvent("pageContentReady", navargs);
                if (elts)
                    return page._enterAnimation(elts);
            }

        }

        if (options.closeOldPagePromise) {
            elementCtrl._beforelayoutPromise = options.closeOldPagePromise;
            elementCtrl.onbeforelayout = function () {
                return this._beforelayoutPromise;
            }
        }

        return elementCtrl.renderComplete.then(function () {
            if (!WinJSContrib.UI.disableAutoResources)
                return WinJS.Resources.processAll(element);
        }).then(function (control) {
            element.style.opacity = '';
        });
    }

    WinJSContrib.UI.MediaTrigger = WinJS.Class.mix(WinJS.Class.define(
    /**
     * Trigger events on media queries. This class is usefull as a component for other controls to change some properties based on media queries
     * @class WinJSContrib.UI.MediaTrigger
     * @param {Object} items object containing one property for each query
     * @param {Object} linkedControl control linked to media trigger
     */
    function (items, linkedControl) {
        var ctrl = this;
        ctrl.queries = [];
        ctrl.linkedControl = linkedControl;

        for (var name in items) {
            var e = items[name];
            if (e.query) {
                ctrl.registerMediaEvent(name, e.query, e);
            }
        }
    },
    {
        /**
         * release media trigger
         */
        dispose: function () {
            var ctrl = this;
            ctrl.linkedControl = null;
            this.queries.forEach(function (q) {
                q.dispose();
            });
        },

        /**
         * register an event from a media query
         * @param {string} name event name
         * @param {string} query media query
         * @param {Object} data data associated with this query
         */
        registerMediaEvent: function (name, query, data) {
            var ctrl = this;
            var mq = window.matchMedia(query);
            var query = {
                name: name,
                query: query,
                data: data,
                mq: mq
            }

            var f = function (arg) {
                if (arg.matches) {
                    ctrl._mediaEvent(arg, query);
                }
            };

            mq.addListener(f);
            query.dispose = function () {
                mq.removeListener(f);
            }

            ctrl.queries.push(query);
        },

        _mediaEvent: function (arg, query) {
            var ctrl = this;
            if (ctrl.linkedControl) {
                WinJS.UI.setOptions(ctrl.linkedControl, query.data);
            }
            ctrl.dispatchEvent('media', query);
        },

        /**
         * Check all registered queries
         */
        check: function () {
            var ctrl = this;
            ctrl.queries.forEach(function (q) {
                var mq = window.matchMedia(q.query);
                if (mq.matches) {
                    ctrl._mediaEvent({ matches: true }, q);
                }
            });
        }
    }), WinJS.Utilities.eventMixin);

    /**
     * register navigation related events like hardware backbuttons. This method keeps track of previously registered navigation handlers
     *  and disable them until the latests is closed, enablinh multi-level navigation.
     * @param {Object} control control taking ownership of navigation handlers
     * @param {function} callback callback to invoke when "back" is requested
     * @returns {function} function to call for releasing navigation handlers
     */
    WinJSContrib.UI.registerNavigationEvents = function (control, callback) {
        var navigationCtrl = control;
        var locked = [];

        control.navLocks = control.navLocks || [];
        control.navLocks.isActive = true;

        var backhandler = function (arg) {
            if (!control.navLocks || control.navLocks.length == 0) {
                callback.bind(control)(arg);
            }
        }

        var navcontrols = document.querySelectorAll('.mcn-navigation-ctrl');
        for (var i = 0 ; i < navcontrols.length; i++) {
            var navigationCtrl = navcontrols[i].winControl;
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
        if (window.Windows && window.Windows.Phone)
            Windows.Phone.UI.Input.HardwareButtons.addEventListener("backpressed", backhandler);
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
            if (window.Windows && window.Windows.Phone)
                Windows.Phone.UI.Input.HardwareButtons.removeEventListener("backpressed", backhandler);
            else
                document.removeEventListener("backbutton", backhandler);
        }
    }


})(WinJSContrib);
