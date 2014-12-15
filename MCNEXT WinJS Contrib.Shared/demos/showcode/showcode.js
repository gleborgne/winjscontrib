// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("./demos/showcode/showcode.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var page = this;
            $('#csscontent, a[href=#csscontent]', page.element).hide();
            $('.btnClose', element).click(function (arg) {
                page.navigator.hide();
            });

            $('.tabheader a', element).click(function (arg) {
                var target = $(arg.currentTarget).attr('href');
                page.selectTab(target);
            });

            //$('#htmlcontent pre', element).text(options.html);
            page.target = options.target;

            WinJS.Promise.join([page.loadJs(), page.loadHtml(), page.loadCSS()]).then(function () {
                page.selectTab('#htmlcontent');
                SyntaxHighlighter.highlight();
                page.fixLineWrap();
                setImmediate(function () { 
                    WinJS.UI.Animation.fadeOut(page.element.querySelector('.loader'));
                    WinJS.UI.Animation.enterPage(page.element.querySelectorAll('.tabs, .tabheader'));
                });
            });
        },

        loadJs: function () {
            var page = this;
            return new WinJS.Promise(function (complete, error) {
                WinJS.xhr({ url: page.target + '.js' }).then(function (r) {
                    $('#jscontent pre', page.element).text(r.responseText);
                    complete();
                }, function () {
                    $('#jscontent, a[href=#jscontent]', page.element).hide();
                    complete();
                });
            });
        },

        loadHtml: function () {
            var page = this;
            return new WinJS.Promise(function (complete, error) {
                WinJS.xhr({ url: page.target + '.html' }).then(function (r) {
                    $('#htmlcontent pre', page.element).text(r.responseText);
                    complete();
                }, function () {
                    $('#htmlcontent, a[href=#htmlcontent]', page.element).hide();
                    complete();
                });
            });
        },
        
        loadCSS: function () {
            var page = this;
            return new WinJS.Promise(function (complete, error) {
                WinJS.xhr({ url: page.target + '.css' }).then(function (r) {
                    if (r.responseText.trim().length === 0) {
                        $('#csscontent, a[href=#csscontent]', page.element).hide();
                    } else {
                        $('#csscontent, a[href=#csscontent]', page.element).show();
                        $('#csscontent pre', page.element).text(r.responseText);
                    }
                    complete();
                }, function () {
                    $('#csscontent, a[href=#csscontent]', page.element).hide();
                    complete();
                });
            });
        },

        selectTab: function (target) {
            var page = this;
            $('.tabheader a.visible', page.element).removeClass('visible');
            $('.tabpanel.visible', page.element).removeClass('visible');
            //setImmediate(function () {
                $('.tabheader a[href=' + target + ']', page.element).addClass('visible');
                $(target, page.element).addClass('visible');
            //});

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


        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        }
    });
})();
