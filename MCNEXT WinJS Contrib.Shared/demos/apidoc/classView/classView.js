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
                container.appendChild(renderClass(page.apiDoc, false, page.rootPath));
            }
            $('a', container).click(function (elt) {
                var target = $(elt.currentTarget).attr('data-linkTo');
                if (target) {
                    var codeview = document.getElementById('docviewFlyout');
                    codeview.winControl.navigate('./demos/apidoc/classView/classView.html', { datapath: target });
                }
            });

            setImmediate(function () { 
                //SyntaxHighlighter.highlight();
                page.fixLineWrap();
            });
        },

        fixLineWrap: function () {
            var page = this;
            var wrap = function () {
                var elems = document.getElementsByClassName('syntaxhighlighter');
                for (var j = 0; j < elems.length; ++j) {
                    var sh = elems[j];
                    var gLines = sh.getElementsByClassName('gutter')[0].getElementsByClassName('line');
                    var cLines = sh.getElementsByClassName('code')[0].getElementsByClassName('line');
                    var stand = 15;
                    for (var i = 0; i < gLines.length; ++i) {
                        var h = $(cLines[i]).height();
                        if (h != stand) {
                            //console.log(i);
                            gLines[i].setAttribute('style', 'height: ' + h + 'px !important;');
                        }
                    }
                }
            };
            var whenReady = function () {
                if ($('.syntaxhighlighter', page.element).length === 0) {
                    setTimeout(whenReady, 50);
                } else {
                    wrap();
                }
            };
            whenReady();
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
