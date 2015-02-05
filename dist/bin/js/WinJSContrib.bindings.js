/* 
 * WinJS Contrib v2.0.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

var WinJSContrib;
(function (WinJSContrib) {
    'use strict';

    /**
     * Custom WinJS Bindings
     * @namespace WinJSContrib.Bindings
     */
    (function (Bindings) {

        /**
         * path for default picture
         */
        WinJSContrib.Bindings.pictureUnavailable = '/images/unavailable.png';

        /**
         * Helper for reading arguments for an element
         * @param {HTMLElement} element
         * @param {string} argument name
         */
        WinJSContrib.Bindings.bindingArguments = function bindingArguments(elt, argname) {
            if (WinJS.UI._optionsParser) {
                var text = elt.getAttribute("data-win-bind-args");
                if (text) {
                    var data = WinJS.UI._optionsParser(text);
                }
            }else{
                var data = $(elt).data('win-bind-args');
            }
            if (data) {
                if (argname) {
                    return data[argname];
                } else {
                    return data;
                }
            }
        }
        var bindingArguments = WinJSContrib.Bindings.bindingArguments;

        /**
         * Binding function to remove HTML from data and add it to destination
         * @function
         * @param {Object} source object owning data
         * @param {string[]} sourceProperty path to object data
         * @param {HTMLElement} dest DOM element targeted by binding
         * @param {string[]} destProperty path to DOM element property targeted by binding
         */
        WinJSContrib.Bindings.removeHTML = WinJS.Binding.initializer(function (source, sourceProperty, dest, destProperty) {
            var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
            var elt = document.createElement('DIV');
            elt.innerHTML = data;
            WinJS.Binding.oneTime({ value: elt.innerText }, ['value'], dest, [destProperty]);
        });

        /**
         * Binding function to remove HTML from data and add it to destination with an ellipse after X characters. The number of characters is specified with "ellipsisize" argument
         * @function
         * @param {Object} source object owning data
         * @param {string[]} sourceProperty path to object data
         * @param {HTMLElement} dest DOM element targeted by binding
         * @param {string[]} destProperty path to DOM element property targeted by binding
         */
        WinJSContrib.Bindings.removeHTMLAndEllipsisize = WinJS.Binding.initializer(function (source, sourceProperty, dest, destProperty) {
            var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
            var elt = document.createElement('DIV');
            elt.innerHTML = data;
            var textRes = elt.innerText;
            var size = bindingArguments(dest, 'ellipsisize');

            if (size)
                textRes = toStaticHTML(WinJSContrib.Utils.ellipsisizeString(elt.innerText, size, true));
            WinJS.Binding.oneTime({ value: textRes }, ['value'], dest, [destProperty]);
        });

        /**
         * Binding function to remove HTML from data and add it to destination with an ellipse after X characters. The number of characters is specified with "ellipsisize" argument
         * @function
         * @param {Object} source object owning data
         * @param {string[]} sourceProperty path to object data
         * @param {HTMLElement} dest DOM element targeted by binding
         * @param {string[]} destProperty path to DOM element property targeted by binding
         */
        WinJSContrib.Bindings.staticHTML = WinJS.Binding.initializer(function (source, sourceProperty, dest, destProperty) {
            var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
            dest[destProperty] = toStaticHTML(data);
        });

        /**
         * Binding function to add a data-* attribute to the element. Use the destination name to specifiy attribute name
         * @function
         * @param {Object} source object owning data
         * @param {string[]} sourceProperty path to object data
         * @param {HTMLElement} dest DOM element targeted by binding
         * @param {string[]} destProperty path to DOM element property targeted by binding
         * @example
         * //assuming object is { myproperty: 42 }
         * <div data-win-bind="foo : myproperty WinJSContrib.Bindings.dataAttr"></div>
         * //will result to
         * <div data-foo="42" data-win-bind="foo : myproperty WinJSContrib.Bindings.dataAttr"></div>
         */
        WinJSContrib.Bindings.dataAttr = WinJS.Binding.initializer(function dataAttrBinding(source, sourceProperty, dest, destProperty) {
            var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
            $(dest).attr('data-' + destProperty, data).data(destProperty, data);
        });

        /**
         * Binding function to add css class named after object property. You could format class by using a "format" argument
         * @function
         * @param {Object} source object owning data
         * @param {string[]} sourceProperty path to object data
         * @param {HTMLElement} dest DOM element targeted by binding
         * @param {string[]} destProperty path to DOM element property targeted by binding
         */
        WinJSContrib.Bindings.addClass = WinJS.Binding.initializer(function addClassBinding(source, sourceProperty, dest, destProperty) {
            function setClass(newval, oldval) {
                var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
                var formatParameter = bindingArguments(dest, 'format');
                if (formatParameter) {
                    dest.classList.remove(formatParameter.format(oldval));
                    dest.classList.add(formatParameter.format(data));
                }
                else {
                    dest.classList.remove(oldval);
                    dest.classList.add(data);
                }
            }

            var bindingDesc = {};
            bindingDesc[sourceProperty] = setClass;
            return WinJS.Binding.bind(source, bindingDesc);
        });

        /**
         * add css class based on a prefix defined with destProperty and the value from the source object
         * @function
         * @param {Object} source object owning data
         * @param {string[]} sourceProperty path to object data
         * @param {HTMLElement} dest DOM element targeted by binding
         * @param {string[]} destProperty path to DOM element property targeted by binding
         */
        WinJSContrib.Bindings.asClass = WinJS.Binding.initializer(function asClassBinding(source, sourceProperty, dest, destProperty) {
            function setClass(newval, oldval) {
                var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
                $(dest).removeClass(destProperty + '-' + oldval);
                $(dest).addClass(destProperty + '-' + data);
            }
            var bindingDesc = {};
            bindingDesc[sourceProperty] = setClass;
            return WinJS.Binding.bind(source, bindingDesc);
        });

        /**
         * convert a url string for use as a background image url
         * @function
         * @param {Object} source object owning data
         * @param {string[]} sourceProperty path to object data
         * @param {HTMLElement} dest DOM element targeted by binding
         * @param {string[]} destProperty path to DOM element property targeted by binding
         */
        WinJSContrib.Bindings.toBgImage = WinJS.Binding.initializer(function toBgImageBinding(source, sourceProperty, dest, destProperty) {
            function setImage() {
                var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
                if (!data || !data.length) {
                    dest.style.backgroundImage = '';
                    return;
                }
                dest.style.backgroundImage = 'url("' + data + '")';
            }

            var bindingDesc = {
            };
            bindingDesc[sourceProperty] = setImage;
            return WinJS.Binding.bind(source, bindingDesc);
        });


        WinJSContrib.Bindings.ToRealDate = WinJS.Binding.initializer(function ToRealDateBinding(source, sourceProperty, dest, destProperty) {
            var date = new Date(source.date * 1000);
            dest.innerHTML = date.toLocaleDateString();
        });

        function _setPic(dest, url) {
            if (dest.nodeName.toLowerCase() == 'img') {
                dest.src = url;
            }
            else {
                dest.style.backgroundImage = 'url("' + url + '")';
            }
            dest.classList.add('imageLoaded');
        }

        /**
         * Asynchronously load a picture (using src for image tag and background-image for other elements) from url path, and add 'imageLoaded' css class once picture is ready. 
         * You could rely on '.imageLoaded' to add transitions for image loading
         * @function
         * @param {Object} source object owning data
         * @param {string[]} sourceProperty path to object data
         * @param {HTMLElement} dest DOM element targeted by binding
         * @param {string[]} destProperty path to DOM element property targeted by binding
         */
        WinJSContrib.Bindings.picture = WinJS.Binding.initializer(function toSmartBgImageBinding(source, sourceProperty, dest, destProperty) {
            function setImage() {
                var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
                if (!data || !data.length) {
                    data = Bindings.pictureUnavailable;
                }

                $(dest).removeClass('imageLoaded');
                setTimeout(function () {
                    WinJSContrib.UI.loadImage(data).done(function () {
                        _setPic(dest, data);
                    }, function () {
                        _setPic(dest, Bindings.pictureUnavailable);
                        WinJS.Utilities.addClass(dest, 'imageLoaded');
                    });
                }, 200);
            }

            var bindingDesc = {
            };
            bindingDesc[sourceProperty] = setImage;
            return WinJS.Binding.bind(source, bindingDesc);
        });
        WinJSContrib.Bindings.toSmartBgImage = WinJSContrib.Bindings.picture; //deprecated method name

        /**
         * show element if property is filled or true. The dest property can be used to choose what to use for showing/hiding object (opacity, visibility, or display)
         * @function
         * @param {Object} source object owning data
         * @param {string[]} sourceProperty path to object data
         * @param {HTMLElement} dest DOM element targeted by binding
         * @param {string[]} destProperty path to DOM element property targeted by binding
         */
        WinJSContrib.Bindings.showIf = WinJS.Binding.initializer(function hideUndefined(source, sourceProperty, dest, destProperty) {
            function setVisibility() {
                var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
                if (!data) {
                    dest.classList.remove('mcn-show');
                    dest.classList.add('mcn-hide');
                    if (destProperty[0] === 'opacity' || destProperty[1] === 'opacity') {
                        dest.style.opacity = '0';
                    } else if (destProperty[0] === 'visibility' || destProperty[1] === 'visibility') {
                        dest.style.visibility = 'hidden';
                    } else {
                        dest.style.display = 'none';
                    }
                } else {
                    dest.classList.remove('mcn-hide');
                    dest.classList.add('mcn-show');
                    if (destProperty[0] === 'opacity' || destProperty[1] === 'opacity') {
                        dest.style.opacity = '';
                    } else if (destProperty[0] === 'visibility' || destProperty[1] === 'visibility') {
                        dest.style.visibility = '';
                    } else {
                        dest.style.display = '';
                    }
                }
            }
            var bindingDesc = {
            };
            bindingDesc[sourceProperty] = setVisibility;
            return WinJS.Binding.bind(source, bindingDesc);
        });

        /**
         * Alias for {@link WinJSContrib.Bindings.showIf}, just for semantic purpose
         * @function
         * @see WinJSContrib.Bindings.showIf
         * @param {Object} source object owning data
         * @param {string[]} sourceProperty path to object data
         * @param {HTMLElement} dest DOM element targeted by binding
         * @param {string[]} destProperty path to DOM element property targeted by binding
         */
        WinJSContrib.Bindings.hideIfNot = WinJSContrib.Bindings.showIf;
        WinJSContrib.Bindings.hideIfNotDefined = WinJSContrib.Bindings.showIf;//warning, deprecated

        /**
         * hide element if property is filled or true. The dest property can be used to choose what to use for showing/hiding object (opacity, visibility, or display)
         * @function
         * @param {Object} source object owning data
         * @param {string[]} sourceProperty path to object data
         * @param {HTMLElement} dest DOM element targeted by binding
         * @param {string[]} destProperty path to DOM element property targeted by binding
         */
        WinJSContrib.Bindings.hideIf = WinJS.Binding.initializer(function showUndefined(source, sourceProperty, dest, destProperty) {
            function setVisibility() {
                var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
                if (!data) {
                    dest.classList.remove('mcn-hide');
                    dest.classList.add('mcn-show');
                    if (destProperty[0] === 'opacity' || destProperty[1] === 'opacity') {
                        dest.style.opacity = '';
                    } else if (destProperty[0] === 'visibility' || destProperty[1] === 'visibility') {
                        dest.style.visibility = '';
                    } else {
                        dest.style.display = '';
                    }
                } else {
                    dest.classList.remove('mcn-show');
                    dest.classList.add('mcn-hide');
                    if (destProperty[0] === 'opacity' || destProperty[1] === 'opacity') {
                        dest.style.opacity = '0';
                    } else if (destProperty[0] === 'visibility' || destProperty[1] === 'visibility') {
                        dest.style.visibility = 'hidden';
                    } else {
                        dest.style.display = 'none';
                    }
                }
            }
            var bindingDesc = {
            };
            bindingDesc[sourceProperty] = setVisibility;
            return WinJS.Binding.bind(source, bindingDesc);
        });

        /**
         * Alias for {@link WinJSContrib.Bindings.hideIf}, just for semantic purpose
         * @function
         * @see WinJSContrib.Bindings.hideIf
         * @param {Object} source object owning data
         * @param {string[]} sourceProperty path to object data
         * @param {HTMLElement} dest DOM element targeted by binding
         * @param {string[]} destProperty path to DOM element property targeted by binding
         */
        WinJSContrib.Bindings.showIfNot = WinJSContrib.Bindings.hideIf; //warning, deprecated

        WinJSContrib.Bindings.showIfNotDefined = WinJSContrib.Bindings.hideIf; //warning, deprecated

        /**
         * enable element if property is filled or true
         * @function
         * @param {Object} source object owning data
         * @param {string[]} sourceProperty path to object data
         * @param {HTMLElement} dest DOM element targeted by binding
         * @param {string[]} destProperty path to DOM element property targeted by binding
         */
        WinJSContrib.Bindings.enableIf = WinJS.Binding.initializer(function disableUndefined(source, sourceProperty, dest, destProperty) {
            function setVisibility() {
                var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
                if (!data) {
                    dest.disabled = true;
                } else {
                    dest.disabled = false;
                }
            }
            var bindingDesc = {
            };
            bindingDesc[sourceProperty] = setVisibility;
            return WinJS.Binding.bind(source, bindingDesc);
        });
        WinJSContrib.Bindings.disableIfNot = WinJSContrib.Bindings.enableIf;

        /**
         * disable element if property is filled or true
         * @function
         * @param {Object} source object owning data
         * @param {string[]} sourceProperty path to object data
         * @param {HTMLElement} dest DOM element targeted by binding
         * @param {string[]} destProperty path to DOM element property targeted by binding
         */
        WinJSContrib.Bindings.disableIf = WinJS.Binding.initializer(function enableUndefined(source, sourceProperty, dest, destProperty) {
            function setVisibility() {
                var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
                if (!data) {
                    dest.disabled = false;
                } else {
                    dest.disabled = true;
                }
            }
            var bindingDesc = {
            };
            bindingDesc[sourceProperty] = setVisibility;
            return WinJS.Binding.bind(source, bindingDesc);
        });
        WinJSContrib.Bindings.enableIfNot = WinJSContrib.Bindings.disableIf;

        /**
         * apply a percent number as width (in percent) on the element
         * @function
         * @param {Object} source object owning data
         * @param {string[]} sourceProperty path to object data
         * @param {HTMLElement} dest DOM element targeted by binding
         * @param {string[]} destProperty path to DOM element property targeted by binding
         */
        WinJSContrib.Bindings.toWidth = WinJS.Binding.initializer(function progressToWidth(source, sourceProperty, dest, destProperty) {
            function setWidth() {
                var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
                if (!data) {
                    dest.style.width = '';
                } else {
                    dest.style.width = data + '%';
                }
            }
            var bindingDesc = {
            };
            bindingDesc[sourceProperty] = setWidth;
            return WinJS.Binding.bind(source, bindingDesc);
        });

        /**
         * truncate a string and add ellipse to the text if string is longer than a limit. The max size of text is determined by a 'ellipsisize' argument
         * @function
         * @param {Object} source object owning data
         * @param {string[]} sourceProperty path to object data
         * @param {HTMLElement} dest DOM element targeted by binding
         * @param {string[]} destProperty path to DOM element property targeted by binding
         * @example {@lang xml}
         * <p data-win-bind="innerText : someLongText WinJSContrib.Bindings.ellipsisize" data-win-bind-args='{ "ellipsisize" : 50}'></p>
         */
        WinJSContrib.Bindings.ellipsisize = WinJS.Binding.initializer(function toEllipsisizedBinding(source, sourceProperty, dest, destProperty) {
            var sourcedata = WinJSContrib.Utils.readProperty(source, sourceProperty);
            var size = bindingArguments(dest, 'ellipsisize');
            dest[destProperty] = toStaticHTML(WinJSContrib.Utils.ellipsisizeString(sourcedata, size, true));
        });
        WinJSContrib.Bindings.toEllipsisized = WinJSContrib.Bindings.ellipsisize; //deprecated name

        WinJSContrib.Bindings.emptyIfNull = WinJS.Binding.initializer(function emptyIfNull(source, sourceProperty, dest, destProperty) {
            var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
            if (typeof data === "undefined" || data === null) {
                dest[destProperty] = "";
            } else {
                dest[destProperty] = data;
            }
        });


        /**
         * Two way binding triggered by "change" event on inputs
         * @function
         * @param {Object} source object owning data
         * @param {string[]} sourceProperty path to object data
         * @param {HTMLElement} dest DOM element targeted by binding
         * @param {string[]} destProperty path to DOM element property targeted by binding
         */
        WinJSContrib.Bindings.twoWayOnChange = WinJS.Binding.initializer(function twoWayOnChangeBinding(source, sourceProperty, dest, destProperty) {
            function setVal() {
                var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
                WinJSContrib.Utils.writeProperty(dest, destProperty, data || '');
            }

            function getVal() {
                var val = WinJSContrib.Utils.getProperty(dest, destProperty);
                WinJSContrib.Utils.writeProperty(source, sourceProperty, val.propValue);
            }

            dest.addEventListener('change', getVal, false);
            if (!dest.winControl) {
                dest.classList.add('win-disposable');
                dest.winControl = {
                    dispose: function () {
                        dest.removeEventListener('change', getVal);
                    }
                }
            }

            var bindingDesc = {
            };

            bindingDesc[sourceProperty] = setVal;
            return WinJS.Binding.bind(source, bindingDesc);
        });

        /** 
         * cleans up a binding list by returning its items as non-observable 
         * @function 
         * @param {Object[]} bindingList binding list to clean up 
         * @returns {Object[]} array containing the cleaned up items 
         */
        Bindings.cleanUpBindingList = function (bindingList) {
            var result = [];

            bindingList.forEach(function (item) {
                var unwrappedItem = WinJS.Binding.unwrap(item);
                result.push(unwrappedItem);
            });

            return result;
        };


    })(WinJSContrib.Bindings || (WinJSContrib.Bindings = {}));
    var Bindings = WinJSContrib.Bindings;
})(WinJSContrib || (WinJSContrib = {}));
