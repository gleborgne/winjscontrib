//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

/// <reference path="WinJSContrib.binding.utils.js" />
/// <reference path="moment.min.js" />

var WinJSContrib;
WinJSContrib.Utils = WinJSContrib.Utils || {};
WinJSContrib.Bindings = WinJSContrib.Bindings || {};

(function () {
    'use strict';    

    /** 
     * format date using binding argument 'formatDate'
     * @param {Object} source object owning data
     * @param {string[]} sourceProperty path to object data
     * @param {HTMLElement} dest DOM element targeted by binding
     * @param {string[]} destProperty path to DOM element property targeted by binding
     */
    WinJSContrib.Bindings.formatDate = WinJS.Utilities.markSupportedForProcessing(function formatDateBinding(source, sourceProperty, dest, destProperty) {
        var sourcedata = WinJSContrib.Utils.readProperty(source, sourceProperty);
        if (!sourcedata) {
            dest.innerText = '';
        } else {
            var arg = WinJSContrib.Bindings.bindingArguments(dest, 'formatDate');
            dest.innerText = moment(sourcedata).format(arg);
        }
    });

    /** 
     * format date using calendar function
     * @param {Object} source object owning data
     * @param {string[]} sourceProperty path to object data
     * @param {HTMLElement} dest DOM element targeted by binding
     * @param {string[]} destProperty path to DOM element property targeted by binding
     */
    WinJSContrib.Bindings.calendar = WinJS.Utilities.markSupportedForProcessing(function formatDateBinding(source, sourceProperty, dest, destProperty) {
        var sourcedata = WinJSContrib.Utils.readProperty(source, sourceProperty);
        if (!sourcedata) {
            dest.innerText = '';
        } else {
            dest.innerText = moment(sourcedata).calendar();
        }
    });

    function daysSince(m, d, y) {
        if (d == '' || m == '' || y == '') {
            //alert("All fields must be entered");
            return;
        }

        if (isNaN(m) || isNaN(y) || isNaN(d)) {
            //alert("Only numbers .");
            return;
        }

        var myDate = new Date();
        var yourDate = new Date(y, m - 1, d);

        var secondsInADay = 1000 * 60 * 60 * 24;
        var diff = Math.floor((myDate.getTime() - yourDate.getTime()) / secondsInADay);
        return diff;
    }


    /**
     * display number of days since a date
     * @param {Object} source object owning data
     * @param {string[]} sourceProperty path to object data
     * @param {HTMLElement} dest DOM element targeted by binding
     * @param {string[]} destProperty path to DOM element property targeted by binding
     */
    WinJSContrib.Bindings.daysSinceDate = WinJS.Utilities.markSupportedForProcessing(function daysSinceDateBinding(source, sourceProperty, dest, destProperty) {
        var sourcedata = WinJSContrib.Utils.readProperty(source, sourceProperty);
        if (!sourcedata) {
            dest.innerText = '';
        } else {
            sourcedata = new Date(sourcedata);
            var m = sourcedata.getMonth() + 1, d = sourcedata.getDate(), y = sourcedata.getFullYear();
            var fromdate = daysSince(m, d, y);
            dest.innerText = fromdate;
        }
    });

    /**
     * apply moment.js humanize formatting on a date. Use 'humanizeFormat' and 'addSuffix' arguments to configure binding
     * @param {Object} source object owning data
     * @param {string[]} sourceProperty path to object data
     * @param {HTMLElement} dest DOM element targeted by binding
     * @param {string[]} destProperty path to DOM element property targeted by binding
     */
    WinJSContrib.Bindings.humanizeDate = WinJS.Utilities.markSupportedForProcessing(function humanizeDate(source, sourceProperty, dest, destProperty) {
        var sourcedata = WinJSContrib.Utils.readProperty(source, sourceProperty);
        if (!sourcedata) {
            dest.innerText = '';
        } else {
            var arg = WinJSContrib.Bindings.bindingArguments(dest, "humanizeFormat"),
                addSuffix = WinJSContrib.Bindings.bindingArguments(dest, "addSuffix");
            dest.innerText = moment.duration(sourcedata, arg).humanize(addSuffix);
        }
    });


})();