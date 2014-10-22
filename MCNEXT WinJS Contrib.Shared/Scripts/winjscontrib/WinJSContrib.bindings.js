//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

var WinJSContrib;
(function (WinJSContrib) {
    /**
     * @namespace WinJSContrib.Bindings
     */
    (function (Bindings) {
        'use strict';

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
            var data = $(elt).data('win-bind-args');
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
            var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
            var formatParameter = bindingArguments(dest, 'format');
            if (formatParameter) {
                dest.classList.add(formatParameter.format(data));
            }
            else {
                dest.classList.add(data);
            }
        });

        WinJSContrib.Bindings.asClass = WinJS.Binding.initializer(function asClassBinding(source, sourceProperty, dest, destProperty) {
            function setClass(newval, oldval) {
                var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
                $(dest).removeClass(destProperty + '-' + oldval);
                $(dest).addClass(destProperty + '-' + data);
            }
            var bindingDesc = {
            };
            bindingDesc[sourceProperty] = setClass;
            return WinJS.Binding.bind(source, bindingDesc);

            //var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
            //$(dest).addClass(destProperty + '-' + data);
        });

        WinJSContrib.Bindings.toBgImage = WinJS.Binding.initializer(function toBgImageBinding(source, sourceProperty, dest, destProperty) {
            var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
            if (!data || !data.length) {
                return;
            }
            dest.style.backgroundImage = 'url("' + data + '")';
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

        WinJSContrib.Bindings.toSmartBgImage = WinJS.Binding.initializer(function toSmartBgImageBinding(source, sourceProperty, dest, destProperty) {
            var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
            if (!data || !data.length) {
                _setPic(dest, Bindings.pictureUnavailable);
                return;
            }

            $(dest).removeClass('imageLoaded');
            setTimeout(function () {
                WinJSContrib.UI.loadImage(data).done(function () {
                    _setPic(dest, data);
                }, function () {
                    _setPic(dest, Bindings.pictureUnavailable);
                    WinJS.Utilities.addClass(dest, 'imageLoaded');
                });
            }, 250);
        });

        WinJSContrib.Bindings.toImageSrc = WinJS.Binding.initializer(function toImageBinding(source, sourceProperty, dest, destProperty) {
            var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
            if (!data || !data.length) {
                dest.src = Bindings.pictureUnavailable;
                return;
            }
            setTimeout(function () {
                WinJSContrib.UI.loadImage(data).done(function () {
                    dest.src = data;
                }, function () {
                    dest.src = Bindings.pictureUnavailable;
                });
            }, 250);
        });

        WinJSContrib.Bindings.obsBgImage = WinJS.Binding.initializer(function obsBgImage(source, sourceProperty, dest, destProperty) {
            function setImage() {
                var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
                if (!data) {
                    dest.style.display = 'none';
                } else {
                    dest.style.display = '';
                    dest.style.backgroundImage = "url('" + data + "')";
                }
            }
            var bindingDesc = {
            };
            bindingDesc[sourceProperty] = setImage;
            return WinJS.Binding.bind(source, bindingDesc);
        });

        /**
         * show element
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
                    if (destProperty[0] === 'opacity') {
                        dest.style.opacity = '0';
                    } else if (destProperty[0] === 'visibility') {
                        dest.style.visibility = 'hidden';
                    } else {
                        dest.style.display = 'none';
                    }
                } else {
                    dest.classList.remove('mcn-hide');
                    dest.classList.add('mcn-show');
                    if (destProperty[0] === 'opacity') {
                        dest.style.opacity = '1';
                    } else if (destProperty[0] === 'visibility') {
                        dest.style.visibility = 'visible';
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
         * Alias for {@link WinJSContrib.Bindings.showIf}
         * @function
         * @see WinJSContrib.Bindings.showIf
         */
        WinJSContrib.Bindings.hideIfNot = WinJSContrib.Bindings.showIf;
        WinJSContrib.Bindings.hideIfNotDefined = WinJSContrib.Bindings.showIf;//warning, deprecated

        WinJSContrib.Bindings.hideIf = WinJS.Binding.initializer(function showUndefined(source, sourceProperty, dest, destProperty) {
            function setVisibility() {
                var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
                if (!data) {
                    dest.classList.remove('mcn-hide');
                    dest.classList.add('mcn-show');
                    if (destProperty === 'opacity') {
                        dest.style.opacity = '1';
                    } else if (destProperty === 'visibility') {
                        dest.style.visibility = 'visible';
                    } else {
                        dest.style.display = '';
                    }
                } else {
                    dest.classList.remove('mcn-show');
                    dest.classList.add('mcn-hide');
                    if (destProperty === 'opacity') {
                        dest.style.opacity = '0';
                    } else if (destProperty === 'visibility') {
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
        WinJSContrib.Bindings.showIfNotDefined = WinJSContrib.Bindings.hideIf; //warning, deprecated

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

        WinJSContrib.Bindings.toEllipsisized = WinJS.Binding.initializer(function toEllipsisizedBinding(source, sourceProperty, dest, destProperty) {
            var sourcedata = WinJSContrib.Utils.readProperty(source, sourceProperty);
            var size = bindingArguments(dest, 'ellipsisize');
            dest[destProperty] = toStaticHTML(WinJSContrib.Utils.ellipsisizeString(sourcedata, size, true));
        });

        WinJSContrib.Bindings.emptyIfNull = WinJS.Binding.initializer(function emptyIfNull(source, sourceProperty, dest, destProperty) {
            var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
            if (typeof data === "undefined" || data === null) {
                dest[destProperty] = "";
            } else {
                dest[destProperty] = data;
            }
        });
    })(WinJSContrib.Bindings || (WinJSContrib.Bindings = {}));
    var Bindings = WinJSContrib.Bindings;
})(WinJSContrib || (WinJSContrib = {}));
