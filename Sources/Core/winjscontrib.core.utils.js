(function (_global) {
    //polyfill setimmediate
    if (!this.setImmediate) {
        this.setImmediate = function (callback) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            setTimeout(callback, 0);
            return 0;
        };
    }
    //Windows 10 doesn't have it anymore, polyfill for backward compat
    if (!this.toStaticHTML) {
        this.toStaticHTML = function (text) {
            return text;
        };
    }
    var msapp = _global.MSApp;
    if (msapp && !msapp.execUnsafeLocalFunction) {
        msapp.execUnsafeLocalFunction = function (c) { c(); };
    }
})(this);
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
            return typeof args[number] !== 'undefined' ? args[number] : match;
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
var WinJSContrib;
(function (WinJSContrib) {
    var Promise;
    (function (Promise) {
        /**
         * apply callback for each item in the array in waterfall
         * @function WinJSContrib.Promise.waterfall
         * @param {Array} dataArray items to process with async tasks
         * @param {function} promiseCallback function applyed to each item (could return a promise for item callback completion)
         * @returns {WinJS.Promise}
         */
        function waterfall(dataArray, promiseCallback) {
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
                };
                for (var i = 0, l = items.length; i < l; i++) {
                    var item = items[i];
                    if (!item && items.getItem) {
                        item = items.getItem(i);
                    }
                    resultPromise = queueP(resultPromise, item);
                }
                return resultPromise.then(function (r) {
                    return results;
                });
            });
        }
        Promise.waterfall = waterfall;
        function promises(dataArray, promiseCallback) {
            if (!dataArray) {
                return WinJS.Promise.wrap([]);
            }
            var dataPromise = WinJS.Promise.as(dataArray);
            return dataPromise.then(function (items) {
                var promises = [];
                for (var i = 0, l = items.length; i < l; i++) {
                    var item = items[i];
                    if (!item && items.getItem) {
                        item = items.getItem(i);
                    }
                    promises.push(WinJS.Promise.as(promiseCallback(item)));
                }
                return promises;
            });
        }
        /**
         * apply callback for each item in the array in parallel (equivalent to WinJS.Promise.join)
         * @function WinJSContrib.Promise.parallel
         * @param {Array} dataArray items to process with async tasks
         * @param {function} promiseCallback function applyed to each item (could return a promise for item callback completion)
         * @returns {WinJS.Promise}
         */
        function parallel(dataArray, promiseCallback) {
            if (!dataArray) {
                return WinJS.Promise.wrap([]);
            }
            var dataPromise = WinJS.Promise.as(dataArray);
            return dataPromise.then(function (items) {
                var promises = [];
                for (var i = 0, l = items.length; i < l; i++) {
                    var item = items[i];
                    if (!item && items.getItem) {
                        item = items.getItem(i);
                    }
                    promises.push(WinJS.Promise.as(promiseCallback(item)));
                }
                return WinJS.Promise.join(promises);
            });
        }
        Promise.parallel = parallel;
        /**
         * apply callback for each item in the array in batch of X parallel items
         * @function WinJSContrib.Promise.batch
         * @param {Array} dataArray items to process with async tasks
         * @param {number} batchSize number of items to batch
         * @param {function} promiseCallback function applyed to each item (could return a promise for item callback completion)
         * @returns {WinJS.Promise}
         */
        function batch(dataArray, batchSize, promiseCallback) {
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
                };
                for (var i = 0, l = items.length; i < l; i++) {
                    var item = items[i];
                    if (!item && items.getItem) {
                        item = items.getItem(i);
                    }
                    batcheditems.push(item);
                    if (i > 0 && i % batchSize === 0) {
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
        }
        Promise.batch = batch;
    })(Promise = WinJSContrib.Promise || (WinJSContrib.Promise = {}));
})(WinJSContrib || (WinJSContrib = {}));
var WinJSContrib;
(function (WinJSContrib) {
    var Utils;
    (function (Utils) {
        /**
         * extend an object with properties from subsequent objects
         * @function WinJSContrib.Utils.extend
         * @returns {Object} composite object
         */
        function extend() {
            for (var i = 1; i < arguments.length; i++)
                for (var key in arguments[i])
                    if (arguments[i].hasOwnProperty(key))
                        arguments[0][key] = arguments[i][key];
            return arguments[0];
        }
        Utils.extend = extend;
        /** indicate if string starts with featured characters
         * @function WinJSContrib.Utils.startsWith
         * @param {string} str string to search within
         * @param {string} strToMatch match string
         * @returns {boolean} true if string starts with strToMatch
         */
        function startsWith(str, strToMatch) {
            if (!strToMatch) {
                return false;
            }
            var match = (str.match("^" + strToMatch) == strToMatch);
            return match;
        }
        Utils.startsWith = startsWith;
        if (!String.prototype.startsWith) {
            String.prototype.startsWith = function (str) {
                return WinJSContrib.Utils.startsWith(this, str);
            };
        }
        function asyncForEach(array, callback, batchsize) {
            if (batchsize === void 0) { batchsize = 1; }
            var i = 0;
            while (i < array.length) {
                setImmediate(function () {
                    for (var j = 0; j < batchsize && i < array.length; j++) {
                        i++;
                        callback(array[i]);
                    }
                });
            }
        }
        Utils.asyncForEach = asyncForEach;
        /** indicate if string ends with featured characters
         * @function WinJSContrib.Utils.endsWith
         * @param {string} str string to search within
         * @param {string} strToMatch match string
         * @returns {boolean} true if string starts with strToMatch
         */
        function endsWith(str, strToMatch) {
            if (!strToMatch) {
                return false;
            }
            return (str.match(strToMatch + "$") == strToMatch);
        }
        Utils.endsWith = endsWith;
        if (!String.prototype.endsWith) {
            String.prototype.endsWith = function (str) {
                return WinJSContrib.Utils.endsWith(this, str);
            };
        }
        /**
         * generate a string formatted as a query string from object properties
         * @function WinJSContrib.Utils.queryStringFrom
         * @param {Object} obj object to format
         * @returns {string}
         */
        function queryStringFrom(obj) {
            var str = [];
            for (var p in obj)
                if (obj.hasOwnProperty(p)) {
                    var key = encodeURIComponent(p);
                    var rawValue = obj[p];
                    var value = WinJSContrib.Utils.hasValue(rawValue) ? encodeURIComponent(rawValue) : "";
                    str.push(key + "=" + value);
                }
            return str.join("&");
        }
        Utils.queryStringFrom = queryStringFrom;
        /**
         * trigger an event on a DOM node
         * @function WinJSContrib.Utils.triggerEvent
         * @param {HTMLElement} element receiving the event
         * @param {string} eventName name of the event
         * @param {boolean} bubbles indicate if event should bubble
         * @param {boolean} cancellable indicate if event can be cancelled
         */
        function triggerEvent(element, eventName, bubbles, cancellable) {
            var eventToTrigger = document.createEvent("Event");
            eventToTrigger.initEvent(eventName, bubbles, cancellable);
            element.dispatchEvent(eventToTrigger);
        }
        Utils.triggerEvent = triggerEvent;
        /**
         * @function WinJSContrib.Utils.triggerCustomEvent
         * @param {HTMLElement} element receiving the event
         * @param {string} eventName name of the event
         * @param {boolean} bubbles indicate if event should bubble
         * @param {boolean} cancellable indicate if event can be cancelled
         */
        function triggerCustomEvent(element, eventName, bubbles, cancellable, data) {
            var eventToTrigger = document.createEvent("CustomEvent");
            eventToTrigger.initCustomEvent(eventName, bubbles, cancellable, data);
            element.dispatchEvent(eventToTrigger);
        }
        Utils.triggerCustomEvent = triggerCustomEvent;
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
            if (!obj)
                return;
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
                var intval = parseInt(val);
                obj[intval] = data;
            }
        }
        /** Read property value on an object based on expression
        * @function WinJSContrib.Utils.readProperty
        * @param {Object} source the object containing data
        * @param {Object} properties property descriptor. could be a string in js notation ex: 'myProp.myChildProp,
        * or an array of strings ['myProp', 'myChildProp']. String notation can contain indexers
        * @returns {Object} property value
        */
        function readProperty(source, properties) {
            if (typeof properties == 'string' && source[properties])
                return source[properties];
            if (!properties || !properties.length)
                return source;
            var prop = WinJSContrib.Utils.getProperty(source, properties);
            if (prop) {
                return prop.propValue;
            }
        }
        Utils.readProperty = readProperty;
        var PropertyDescriptor = (function () {
            function PropertyDescriptor(parent, parentDescriptor, keyProp) {
                this.parent = parent;
                this.parentDescriptor = parentDescriptor;
                this.keyProp = keyProp;
            }
            PropertyDescriptor.prototype.ensureParent = function () {
                if (parent) {
                    return parent;
                }
                else {
                    if (this.parentDescriptor) {
                        this.parentDescriptor.ensureParent();
                        if (!this.parentDescriptor.parent[this.parentDescriptor.keyProp]) {
                            this.parentDescriptor.parent[this.parentDescriptor.keyProp] = {};
                            this.parent = this.parentDescriptor.parent[this.parentDescriptor.keyProp];
                        }
                    }
                }
            };
            Object.defineProperty(PropertyDescriptor.prototype, "propValue", {
                get: function () {
                    return getobject(this.parent, this.keyProp);
                },
                set: function (val) {
                    this.ensureParent();
                    setobject(this.parent, this.keyProp, val);
                },
                enumerable: true,
                configurable: true
            });
            return PropertyDescriptor;
        })();
        Utils.PropertyDescriptor = PropertyDescriptor;
        /**
         * return a propery descriptor for an object based on expression
         * @function WinJSContrib.Utils.getProperty
         * @param {Object} source the object containing data
         * @param {string[]} properties property descriptor. could be a string in js notation ex: 'myProp.myChildProp,
         * or an array of strings ['myProp', 'myChildProp']. String notation can contain indexers
         * @returns {Object} property descriptor
         */
        function getProperty(source, properties) {
            if (typeof properties == 'string') {
                properties = properties.split('.');
            }
            if (!properties || !properties.length) {
                properties = ['this'];
            }
            var parent = source;
            var previousDescriptor = null;
            for (var i = 0; i < properties.length; i++) {
                var descriptor = new PropertyDescriptor(parent, previousDescriptor, properties[i]);
                previousDescriptor = descriptor;
                if (i == properties.length - 1) {
                    return descriptor;
                }
                parent = getobject(parent, properties[i]);
            }
            return;
        }
        Utils.getProperty = getProperty;
        /**
         * Write property value on an object based on expression
         * @function WinJSContrib.Utils.writeProperty
         * @param {Object} source the object containing data
         * @param {string[]} properties property descriptor. could be a string in js notation ex: 'myProp.myChildProp,
         * or an array of strings ['myProp', 'myChildProp']. String notation can contain indexers
         * @param {Object} data data to feed to the property
         */
        function writeProperty(source, properties, data) {
            var prop = WinJSContrib.Utils.getProperty(source, properties);
            if (prop) {
                prop.propValue = data;
            }
        }
        Utils.writeProperty = writeProperty;
        /** generate a random value between two numbers
         * @function WinJSContrib.Utils.randomFromInterval
         * @param {number} from lower limit
         * @param {number} to upper limit
         * @returns {number}
         */
        function randomFromInterval(from, to) {
            return (Math.random() * (to - from + 1) + from) << 0;
        }
        Utils.randomFromInterval = randomFromInterval;
        /**
         * function to use as a callback for Array.sort when you want the array to be sorted alphabetically
         * @function WinJSContrib.Utils.alphabeticSort
         * @param {string} a
         * @param {string} b
         * @returns {number}
         */
        function alphabeticSort(a, b) {
            if (a > b)
                return 1;
            if (a < b)
                return -1;
            return 0;
        }
        Utils.alphabeticSort = alphabeticSort;
        /**
         * generate an array with only distinct elements
         * @function WinJSContrib.Utils.distinctArray
         * @param {Array} array
         * @param {string} path to array's item property used for checking items
         * @param {boolean} ignorecase indicate if comparison should ignore case when using string
         * @returns {Array}
         */
        function distinctArray(array, property, ignorecase) {
            if (array === null || array.length === 0)
                return array;
            if (typeof ignorecase == "undefined")
                ignorecase = false;
            var sMatchedItems = "";
            var foundCounter = 0;
            var newArray = [];
            var sFind;
            var i;
            if (ignorecase) {
                for (i = 0; i < array.length; i++) {
                    if (property) {
                        var data = WinJSContrib.Utils.readProperty(array[i], property.split('.'));
                        sFind = data;
                        if (!data)
                            sFind = data;
                        if (data && data.toLowerCase)
                            sFind = data.toLowerCase();
                    }
                    else {
                        sFind = array[i];
                    }
                    if (sMatchedItems.indexOf("|" + sFind + "|") < 0) {
                        sMatchedItems += "|" + sFind + "|";
                        newArray[foundCounter++] = array[i];
                    }
                }
            }
            else {
                for (i = 0; i < array.length; i++) {
                    if (property) {
                        sFind = WinJSContrib.Utils.readProperty(array[i], property.split('.'));
                    }
                    else {
                        sFind = array[i];
                    }
                    if (sMatchedItems.indexOf("|" + sFind + "|") < 0) {
                        sMatchedItems += "|" + sFind + "|";
                        newArray[foundCounter++] = array[i];
                    }
                }
            }
            return newArray;
        }
        Utils.distinctArray = distinctArray;
        /**
         * get distinct values from an array of items
         * @function WinJSContrib.Utils.getDistinctPropertyValues
         * @param {Array} array items array
         * @param {string} property property path for values
         * @param {boolean} ignorecase ignore case for comparisons
         */
        function getDistinctPropertyValues(array, property, ignorecase) {
            return Utils.distinctArray(array, property, ignorecase).map(function (item) {
                return WinJSContrib.Utils.readProperty(item, property.split('.'));
            });
        }
        Utils.getDistinctPropertyValues = getDistinctPropertyValues;
        /**
         * Remove all accented characters from a string and replace them with their non-accented counterpart for ex: replace "é" with "e"
         * @function WinJSContrib.Utils.removeAccents
         * @param {string} s
         * @returns {string}
         */
        function removeAccents(s) {
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
        }
        Utils.removeAccents = removeAccents;
        /**
         * remove a page from navigation history
         * @function WinJSContrib.Utils.removePageFromHistory
         * @param {string} pageLocation page url
         */
        function removePageFromHistory(pageLoc) {
            var history = [];
            if (WinJS.Navigation.history && WinJS.Navigation.history.backStack && WinJS.Navigation.history.backStack.length) {
                WinJS.Navigation.history.backStack.forEach(function (page) {
                    if (page.location !== pageLoc) {
                        history.push(page);
                    }
                });
            }
            WinJS.Navigation.history.backStack = history;
        }
        Utils.removePageFromHistory = removePageFromHistory;
        /**
         * format a number on 2 digits
         * @function WinJSContrib.Utils.pad2
         * @param {number} number
         */
        function pad2(number) {
            return (number < 10 ? '0' : '') + number;
        }
        Utils.pad2 = pad2;
        /**
         * truncate a string and add ellipse if text if greater than certain size
         * @function WinJSContrib.Utils.ellipsisizeString
         * @param {string} text text to truncate
         * @param {number} maxSize maximum size for text
         * @param {boolean} useWordBoundary indicate if truncate should happen on the closest word boundary (like space)
         */
        function ellipsisizeString(text, maxSize, useWordBoundary) {
            if (!text) {
                return '';
            }
            var toLong = text.length > maxSize, text_ = toLong ? text.substr(0, maxSize - 1) : text;
            text_ = useWordBoundary && toLong ? text_.substr(0, text_.lastIndexOf(' ')) : text_;
            return toLong ? text_ + '...' : text_;
        }
        Utils.ellipsisizeString = ellipsisizeString;
        /**
         * generate a new Guid
         * @function WinJSContrib.Utils.guid
         * @returns {string}
         */
        function guid() {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
            });
            return uuid;
        }
        Utils.guid = guid;
        /**
         * inherit property from parent WinJS controls
         * @function WinJSContrib.Utils.inherit
         * @param {HTMLElement} element
         * @param {string} property property name
         */
        function inherit(element, property) {
            if (element && element.parentElement) {
                var current = element.parentElement;
                while (current) {
                    if (current.winControl) {
                        if (current.winControl[property] !== undefined) {
                            return current.winControl[property];
                        }
                    }
                    current = current.parentElement;
                }
            }
        }
        Utils.inherit = inherit;
        /**
         * move DOM childrens form one node to the other
         * @function WinJSContrib.Utils.moveChilds
         * @param {HTMLElement} source source node containing elements to move
         * @param {HTMLElement} target target node for moved elements
         */
        function moveChilds(source, target) {
            if (!source || !target)
                return;
            var childs = [];
            for (var i = 0; i < source.childNodes.length; i++) {
                childs.push(source.childNodes[i]);
            }
            childs.forEach(function (elt) {
                target.appendChild(elt);
            });
        }
        Utils.moveChilds = moveChilds;
        /**
         * get parent control identifyed by a property attached on DOM element
         * @function WinJSContrib.Utils.getParent
         * @param {string} property property attached to control's DOM element, for ex: msParentSelectorScope
         * @param {HTMLElement} element DOM element to scan
         * @returns {Object} WinJS control
         */
        function getParent(property, element) {
            if (!element)
                return;
            var current = element.parentNode;
            while (current) {
                if (current[property] && current.winControl) {
                    return current.winControl;
                }
                current = current.parentNode;
            }
        }
        Utils.getParent = getParent;
        /**
         * get parent control identifyed by a css class
         * @function WinJSContrib.Utils.getParentControlByClass
         * @param {string} className css class name
         * @param {HTMLElement} element DOM element to scan
         * @returns {Object} WinJS control
         */
        function getParentControlByClass(className, element) {
            if (!element)
                return;
            var current = element.parentNode;
            while (current) {
                if (current.classList && current.classList.contains(className) && current.winControl) {
                    return current.winControl;
                }
                current = current.parentNode;
            }
        }
        Utils.getParentControlByClass = getParentControlByClass;
        /**
         * get parent page control (work only with WinJSContrib.UI.PageControlNavigator
         * @function WinJSContrib.Utils.getParentPage
         * @param {HTMLElement} element DOM element to scan
         * @returns {Object} WinJS control
         */
        function getParentPage(element) {
            return WinJSContrib.Utils.getParent('mcnPage', element);
        }
        Utils.getParentPage = getParentPage;
        /**
         * get parent scope control (based on msParentSelectorScope)
         * @function WinJSContrib.Utils.getScopeControl
         * @param {HTMLElement} element DOM element to scan
         * @returns {Object} WinJS control
         */
        function getScopeControl(element) {
            var current = element.parentNode;
            while (current) {
                if (current.msParentSelectorScope) {
                    var scope = current.parentNode;
                    if (scope) {
                        var scopeControl = scope.winControl;
                        if (scopeControl) {
                            return scopeControl;
                        }
                    }
                }
                current = current.parentNode;
            }
        }
        Utils.getScopeControl = getScopeControl;
        /**
         * get WinJS.Binding.Template like control from a path, a control, a function or a DOM element
         * @function WinJSContrib.Utils.getTemplate
         * @param {Object} template template input
         * @returns {Object} WinJS.Binding.Template or template-like object (object with a render function)
         */
        function getTemplate(template) {
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
                }
                else if (template.winControl) {
                    return template.winControl;
                }
                else if (template.render) {
                    return template;
                }
            }
        }
        Utils.getTemplate = getTemplate;
        /**
         * get a function from an expression, for example 'page:myAction' will return the myAction function from the parent page.
         * The returned function will be bound to it's owner. This function relies on {link WinJSContrib.Utils.resolveValue}, see this for details about how data are crawled
         * @function WinJSContrib.Utils.resolveMethod
         * @param {HTMLElement} element DOM element to look
         * @param {string} text expression like 'page:something' or 'ctrl:something' or 'something'
         * @returns {function}
         */
        function resolveMethod(element, text) {
            var res = WinJSContrib.Utils.resolveValue(element, text);
            if (res && typeof res == 'function')
                return res;
            return undefined;
        }
        Utils.resolveMethod = resolveMethod;
        function readValue(element, text) {
            var res = WinJSContrib.Utils.resolveValue(element, text);
            if (res) {
                if (typeof res == 'function')
                    return res(element);
                else
                    return res;
            }
            return undefined;
        }
        Utils.readValue = readValue;
        /**
         * Utility functions used by WinJSContrib.Utils.resolveValue and WinJSContrib.Utils.applyValue
         * @namespace WinJSContrib.Utils.ValueParsers
         */
        Utils.ValueParsers = {
            /**
             * Get value from current page in parent navigator
             * @function WinJSContrib.Utils.ValueParsers.navpage
             */
            "navpage": function (element, text, context) {
                var control = (context && context.data) ? context.data.navpage : null;
                if (!control) {
                    if (WinJSContrib.Utils.getParentPage) {
                        control = WinJSContrib.Utils.getParentPage(element);
                        if (context && context.data)
                            context.data.navpage = control;
                    }
                    if (!control && WinJSContrib.UI.Application.navigator) {
                        control = WinJSContrib.UI.Application.navigator.pageControl;
                        if (context && context.data)
                            context.data.navpage = control;
                    }
                }
                if (!control)
                    return;
                if (context)
                    context.parentControl = control;
                var method = WinJSContrib.Utils.readProperty(control, text);
                if (method && typeof method === 'function')
                    return method.bind(control);
                else
                    return method;
            },
            /**
             * Get value from parent element with 'pagecontrol' class
             * @function WinJSContrib.Utils.ValueParsers.page
             */
            "page": function (element, text, context) {
                var control = (context && context.data) ? context.data.page : null;
                if (!control) {
                    control = WinJSContrib.Utils.getParentControlByClass('pagecontrol', element);
                    if (context && context.data)
                        context.data.page = control;
                }
                if (!control)
                    return;
                if (context)
                    context.parentControl = control;
                var method = WinJSContrib.Utils.readProperty(control, text);
                if (method && typeof method === 'function')
                    return method.bind(control);
                else
                    return method;
            },
            /**
             * Get value from parent scope
             * @function WinJSContrib.Utils.ValueParsers.ctrl
             */
            "ctrl": function (element, text, context) {
                var control = (context && context.data) ? context.data.scope : null;
                if (!control) {
                    control = WinJSContrib.Utils.getScopeControl(element);
                    if (context && context.data)
                        context.data.scope = control;
                }
                if (!control)
                    return;
                if (context)
                    context.parentControl = control;
                var method = WinJSContrib.Utils.readProperty(control, text);
                if (method && typeof method === 'function')
                    return method.bind(control);
                else
                    return method;
            },
            /**
             * select a node from DOM
             * @function WinJSContrib.Utils.ValueParsers.select
             */
            "select": function (element, text, context) {
                var control = (context && context.data) ? context.data.scope : null;
                if (!control) {
                    control = WinJSContrib.Utils.getScopeControl(element);
                    if (context && context.data)
                        context.data.scope = control;
                }
                var element = null;
                var items = text.split('|');
                var selector = items[0];
                if (control) {
                    element = control.element.querySelector(selector);
                }
                if (!element)
                    element = document.querySelector(selector);
                if (items.length == 1) {
                    return element;
                }
                else if (items.length > 1) {
                    var val = readProperty(element, text.substr(items[0].length + 1));
                    return val;
                }
            },
            /**
             * get an object formatted as JSON
             * @function WinJSContrib.Utils.ValueParsers.obj
             */
            "obj": function (element, text, context) {
                return WinJS.UI.optionsParser(text, window, {
                    select: WinJS.Utilities.markSupportedForProcessing(function (text) {
                        var parent = WinJSContrib.Utils.getScopeControl(element);
                        if (parent) {
                            return parent.element.querySelector(text);
                        }
                        else {
                            return document.querySelector(text);
                        }
                    })
                });
            },
            /**
             * mark a promise for resolution (if used in applyValue, the promise will get resolved and the promise's result will be affected)
             * @function WinJSContrib.Utils.ValueParsers.prom
             */
            "prom": function (element, text, context) {
                var res = resolveValue(element, text, context);
                if (res.then) {
                    res = res.then(null, null);
                    res.mcnMustResolve = true;
                }
                return res;
            },
            /**
             * wrap result in WinJS.Binding.List().dataSource
             * usefull for ListViews
             * @function WinJSContrib.Utils.ValueParsers.list
             */
            "list": function (element, text, context) {
                var res = resolveValue(element, text, context);
                if (res) {
                    if (res.then) {
                        var p = res.then(function (data) {
                            return new WinJS.Binding.List(data).dataSource;
                        });
                        p.mcnMustResolve = true;
                        return p;
                    }
                    return new WinJS.Binding.List(res).dataSource;
                }
            },
            /**
             * get value from global scope
             * @function WinJSContrib.Utils.ValueParsers.global
             */
            "global": function (element, text, context) {
                return WinJSContrib.Utils.readProperty(window, text);
            },
            /**
             * get a template from uri
             * @function WinJSContrib.Utils.ValueParsers.templ
             */
            "templ": function (element, text, context) {
                return WinJSContrib.Templates.get(text);
            },
            /**
             * return element property
             * @function WinJSContrib.Utils.ValueParsers.element
             */
            "element": function (element, text, context) {
                var res = resolveValue(element, text, context);
                if (res)
                    return res.element;
            },
            "event": function (element, text, context) {
                var res = resolveValue(element, text, context);
                var parentControl = null;
                if (!res || !context || !context.name) {
                    return;
                }
                if (context)
                    parentControl = context.parentControl;
                if (res && typeof res === 'function') {
                    if (parentControl && parentControl.eventTracker) {
                        parentControl.eventTracker.addEvent(context.control, context.name, res);
                    }
                    else {
                        context.control.addEventListener(context.name, res);
                    }
                }
            }
        };
        /**
         * resolve value from an expression. This helper will crawl the DOM up, and provide the property or function from parent page or control.
         * @function WinJSContrib.Utils.resolveValue
         * @param {HTMLElement} element DOM element to look
         * @param {string} text expression like 'page:something' or 'ctrl:something' or 'something'
         * @returns {Object}
         */
        function resolveValue(element, text, context) {
            var methodName, control, method;
            var items = text.split(':');
            if (items.length > 1) {
                var name = items[0];
                var val = text.substr(name.length + 1);
                var parser = Utils.ValueParsers[name];
                if (parser) {
                    return parser(element, val, context);
                }
            }
            return text; //WinJSContrib.Utils.readProperty(window, text);
        }
        Utils.resolveValue = resolveValue;
        /**
         * call resolve value and apply result to a target object
         * @function WinJSContrib.Utils.applyValue
         * @param {HTMLElement} element DOM element to look
         * @param {string} text expression like 'page:something' or 'ctrl:something' or 'something'
         * @param {string} target target object
         * @param {string} targetPath path to dest property
         */
        function applyValue(element, text, target, targetPath, context) {
            var tmp = WinJSContrib.Utils.resolveValue(element, text, context);
            if (tmp && tmp.then && tmp.mcnMustResolve) {
                tmp.then(function (data) {
                    WinJSContrib.Utils.writeProperty(target, targetPath, data);
                });
            }
            else {
                WinJSContrib.Utils.writeProperty(target, targetPath, tmp);
            }
        }
        Utils.applyValue = applyValue;
        /**
         * Checks in a safe way if an object has a value, which could be 'false', '0' or '""'
         * @function WinJSContrib.Utils.hasValue
         * @param {Object} item The object to check.
         * @returns {Boolean} Whether the object has a value or not.
         */
        function hasValue(item) {
            return typeof item !== "undefined" && item !== null;
        }
        Utils.hasValue = hasValue;
        /**
         * format error from an xhr call
         * @function WinJSContrib.Utils.formatXHRError
         */
        function formatXHRError(xhr) {
            return "{0} - {1}: {2}".format(xhr.status, xhr.statusText, xhr.responseText);
        }
        Utils.formatXHRError = formatXHRError;
        /**
         * Unwraps the real error from a WinJS.Promise.join operation, which by design returns an array with 'undefined' for all cells,
         * excepts the one corresponding to the promise that really faulted.
         * @function WinJSContrib.Utils.unwrapJoinError
         * @param {function} errorCallback The callback to use to handle the error.
         * @returns {Function} The result of the callback being fired with the real error.
         */
        function unwrapJoinError(errorCallback) {
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
        }
        Utils.unwrapJoinError = unwrapJoinError;
        /**
         * inject properties from source object to target object
         * @function WinJSContrib.Utils.inject
         */
        function inject(target, source) {
            if (source) {
                for (var k in source) {
                    target[k] = source[k];
                }
            }
        }
        Utils.inject = inject;
    })(Utils = WinJSContrib.Utils || (WinJSContrib.Utils = {}));
})(WinJSContrib || (WinJSContrib = {}));
/**
 * @namespace WinJSContrib.Templates
 */
var WinJSContrib;
(function (WinJSContrib) {
    var Templates;
    (function (Templates) {
        var cache = {};
        /**
         * get a template from it's path
         * @function get
         * @memberof WinJSContrib.Templates
         * @param {string} uri path to template file
         * @returns {WinJS.Binding.Template} template object
         */
        function get(uri) {
            var template = cache[uri];
            if (cache[uri])
                return template;
            return new WinJS.Binding.Template(null, { href: uri });
        }
        Templates.get = get;
        /**
         * get a template and turn it to a rendering function that takes an item promise, and return a DOM element
         * @function WinJSContrib.Templates.interactive
         * @param {string} uri path to template file
         * @param {Object} args definition of interactive elements
         * @returns {function} rendering function that takes an item promise, and return a DOM element
         */
        function interactive(uri, args) {
            var template = WinJSContrib.Templates.get(uri);
            if (template) {
                return WinJSContrib.Templates.makeInteractive(template, args);
            }
            else {
                throw { message: 'template not found for ' + uri };
            }
        }
        Templates.interactive = interactive;
        /**
         * generate a rendering function that takes an item promise, and return a DOM element
         * @function WinJSContrib.Templates.get
         * @param {WinJS.Binding.Template} template template object
         * @param {Object} args definition of interactive elements
         * @returns {function} rendering function that takes an item promise, and return a DOM element
         */
        function makeInteractive(template, args) {
            return function (itemPromise) {
                return itemPromise.then(function (item) {
                    return template.render(item).then(function (rendered) {
                        if (args.tap) {
                            for (var n in args.tap) {
                                var elt = rendered.querySelector(n);
                                WinJSContrib.UI.tap(elt, function (arg) {
                                    args.tap[n](arg, item);
                                });
                            }
                        }
                        if (args.click) {
                            for (var n in args.click) {
                                var elt = rendered.querySelector(n);
                                elt.onclick = function (arg) {
                                    args.click[n](arg, item);
                                };
                            }
                        }
                        return rendered;
                    });
                });
            };
        }
        Templates.makeInteractive = makeInteractive;
    })(Templates = WinJSContrib.Templates || (WinJSContrib.Templates = {}));
})(WinJSContrib || (WinJSContrib = {}));
