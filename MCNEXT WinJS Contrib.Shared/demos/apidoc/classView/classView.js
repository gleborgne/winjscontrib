/// <reference path="../../../scripts/sampleapp.js" />
(function () {
    "use strict";

    WinJS.UI.Pages.define("/demos/apidoc/classView/classView.html", {
        init: function (element, options) {
            var page = this;
            options = options || {};

            return getApiDoc().then(function (apiDoc) {
                if (options.datapath) {
                    page.rootPath = options.datapath;
                    page.apiDoc = apiDoc.find(options.datapath);
                } else {
                    page.rootPath = apiDoc.namespaces[0].name;
                    page.apiDoc = apiDoc.namespaces[0];
                }
            });
        },

        prepare: function (element, options) {
            var page = this;
            page.$('.pagetitle').text(page.rootPath);
            var container = page.q('section[role=main]');
            if (page.apiDoc.parameters) {
                container.appendChild(renderFunction(page.apiDoc, true));
            } else {
                container.appendChild(renderClass(page.apiDoc));
            }
        },

        ready: function (element, options) {
            // TODO: Initialize the page here.
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        }
    });
})();
