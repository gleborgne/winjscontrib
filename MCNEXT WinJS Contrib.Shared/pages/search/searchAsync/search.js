/// <reference path="../../../Scripts/winjscontrib/WinJSContrib.search.js" />

(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/search/searchasync/search.html", {
        ready: function (element, options) {
            var page = this;

            //define an index and specify which properties must be indexed
            //on your objects
            page.index = new WinJSContrib.Search.IndexWorkerProxy('persistentTest', {
                fields: {
                    "desc.title": 1,
                    "title": 2
                }
            });

            page.progress = element.querySelector("#progress");
            $('#searchtxt', element).pressEnterDefaultTo('#btnSearch', element);

            //load index from disc
            page.index.load().done(function () {
                page.refreshCount().then(function (nb) {
                    if (nb == 0) {
                        page.indexItems(searchitems);
                    }
                });

            });
        },

        addToIndex: function () {
            var page = this;
            var item = { title: $('#indexbox', page.element).val() };
            page.index.add(items).done(function () {
                $('#indexbox', page.element).val('');
                page.index.save();
                page.refreshCount();
            });
        },

        doSearch: function () {
            var page = this;
            var txt = $('#searchtxt', page.element).val();
            var container = $('#searchresults', page.element);
            container.html('');
            setImmediate(function () {
                page.index.search(txt).then(function (search) {
                    page.showSearchResult(search);
                });
            });
        },

        showSearchResult: function (search) {
            var page = this;
            var container = $('#searchresults', page.element);
            container.html('');
            if (!search || !search.length) {
                container.append('<li>no result found</li>');
                return;
            }

            if (search.length > 20)
                search = search.slice(0, 20);

            search.forEach(function (item) {
                container.append('<li>' + item.rank + ' : ' + item.item.title + '</li>');
            });
            page.progress.value = 0;
        },

        clearIndex: function () {
            var page = this;
            page.index.clear().then(function () {
                page.index.save();
                page.refreshCount();
            });
            
        },

        indexItems: function (items) {
            var page = this;
            var container = $('#searchresults', page.element);
            page.progress.value = 0;
            page.progress.style.opacity = '1';
            container.html('');

            return page.index.addRange(items).then(function (res) {
                page.index.save();
                page.progress.style.opacity = '0';
                container.append('<li>indexing done</li>');
                page.progress.value = 0;
            }, function (err) {
                page.progress.style.opacity = '0';
                container.append('<li>indexing error</li>');
                page.progress.value = 0;
            }, function (progress) {
                page.progress.value = progress;
            }).then(function () {
                //return page.index.save();
            }).then(function () {
                page.refreshCount();
            });
        },

        addItems: function (elt) {
            var page = this;
            var sz = (elt && elt.args && elt.args.size) ? elt.args.size : 500;
            var items = [];
            for (var i = 0 ; i < sz ; i++) {
                var item = { title: "abcd efgh ijkl", desc: { title: "mnop qrstu vwxyz" } };
                items.push(item);
            }

            page.indexItems(items);
        },

        refreshCount: function () {
            var page = this;
            return page.index.count().then(function (nb) {
                $('#indexCount', page.element).text(nb);
                return nb;
            });
        },

        unload: function () {
            var page = this;
            page.progress = undefined;
            page.index.dispose();
            page.index = undefined;
        }
    });
})();

var searchitems = [
        { title: "mon TiTre" },
        { title: "un autre titré", desc: { title: "plein de choses et d'autres" } },
        { title: "encore un titre", desc: { title: "du titre et encore du Titre" } },
];