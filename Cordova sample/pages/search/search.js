/// <reference path="../../scripts/winjscontrib/WinJSContrib.search.js" />

(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/search/search.html", {
        ready: function (element, options) {
            var page = this;

            //define an index and specify which properties must be indexed
            //on your objects
            page.index = new WinJSContrib.Search.Index('persistentTest', {
                fields: {
                    "desc.title": 1,
                    "title": 2
                }
            });

            page.progress = element.querySelector("#progress");
            $('#searchtxt', element).pressEnterDefaultTo('#btnSearch', element);

            //load index from disc
            page.index.load().done(function () {
                page.refreshCount(page.index);
                if (page.index.items.length == 0) {
                    page.addAsync(searchitems);
                }
            });
        },

        addToIndex: function () {
            var page = this;
            var items = [{ title: $('#indexbox', page.element).val() }];
            this.addAsync(items).done(function () {
                $('#indexbox', page.element).val('');
            });
        },

        doSearch: function () {
            var page = this;
            var txt = $('#searchtxt', page.element).val();
            var container = $('#searchresults', page.element);
            container.html('');
            setImmediate(function () {
                var search = page.index.search(txt);
                page.showSearchResult(search);
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
            page.index.items = [];
            page.index.save();
            page.refreshCount(page.index);
        },

        addAsync: function (items) {
            var page = this;
            var container = $('#searchresults', page.element);
            page.progress.value = 0;
            page.progress.style.opacity = '1';
            container.html('');
            
            return page.index.addRangeAsync(items).then(function (res) {
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
            }).then(function(){
                page.refreshCount(page.index);                
            });
        },

        searchAsync: function () {
            var page = this;
            var container = $('#searchresults', page.element);
            container.html('');
            var txt = $('#searchtxt', page.element).val();
            page.progress.style.opacity = '1';
            page.progress.value = 0;
            
            page.index.searchAsync(txt).done(function (res) {
                page.progress.style.opacity = '0';
                page.showSearchResult(res);
                page.progress.value = 0;
            }, function (err) {
                page.progress.style.opacity = '0';
                container.append('<li>async search error</li>');
                page.progress.value = 0;
            }, function (progress) {
                page.progress.value = progress;
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

            page.addAsync(items);
        },

        indexWiktionary: function () {
            var page = this;
            var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
            openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
            openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
            
            openPicker.fileTypeFilter.replaceAll([".xml"]);

            return openPicker.pickSingleFileAsync().then(function (file) {
                return new WinJS.Promise(function (complete, error) {
                    if (file) {
                        try{
                            Windows.Storage.FileIO.readTextAsync(file).done(function (data) {
                                page.parseWiktionary(data);
                            });
                        } catch (exception) {
                            $('#searchresults', page.element).html("doesn't looks like a wiktionnary dump...");
                        }
                    }
                });
            });
        },

        parseWiktionary: function (text) {
            var page = this;
            var items = [];
            var wdoc = new Windows.Data.Xml.Dom.XmlDocument();
            wdoc.loadXml(text);
            var entries = wdoc.getElementsByTagName('entry');
            for (var i = 0 ; i < entries.length ; i++) {
                var e = entries.item(i);
                var item = { title: e.attributes.getNamedItem('form').innerText, lexems: [] };
                var elts = e.getElementsByTagName('lexeme') //; selectNodes('/lexem/defs/toplevel-def');
                for (var j = 0 ; j < elts.length ; j++) {
                    var lexemNode = elts.item(j);
                    var lex = { type: lexemNode.attributes.getNamedItem('pos').innerText, defs: [] }
                    var defs = lexemNode.getElementsByTagName('gloss');
                    for (var k = 0 ; k < defs.length ; k++) {
                        //if (k < 3) {
                            var glossnode = defs.item(k);
                            lex.defs.push(glossnode.innerText);
                        //}
                    }

                    item.lexems.push(lex);
                }
                items.push(item);
            }
            if (items.length > 0) {
                page.addAsync(items);
            }
        },

        refreshCount: function (idx) {
            var page = this;
            if (idx)
                $('#indexCount', page.element).text(idx.items.length);
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