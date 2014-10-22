(function () {
    "use strict";
     function bindWebLinks(element) {
         $('*[data-page-weblink]', element).each(function () {
             var target = $(this).data('page-weblink');

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
                            }
                            else {
                                actionArgs = JSON.parse(actionArgs);
                            }
                        }
                        catch (exception) {
                            return;
                        }
                    }
                    var uri = new Windows.Foundation.Uri(target);
                    Windows.System.Launcher.launchUriAsync(uri);
                });
            }
        });
    }

    WinJS.UI.Pages.define("/pages/home/home.html", {
        ready: function (element, options) {
            var page = this;
            bindWebLinks(element);
            //page.controls.hub.layout();
            //page.controls.hub.restoreState();
            //if (page.controls.hub.multipass) {
            //    //setImmediate(function () {
            //        page.controls.hub.renderItemsContent();
            //    //});
            //}
            //WinJSContrib.UI.Application.progress.show();
        },
        openFixedHub: function (clickArg) {
            var items = window[clickArg.args.items];

            WinJS.Navigation.navigate('/pages/fixedhub/home.html', { items: items, multipass: clickArg.args.multipass });
        },
        openFlexGrid: function (clickArg) {
            var items = window[clickArg.args.items];

            WinJS.Navigation.navigate('/pages/flexgrid/home.html', { items: items, multipass: clickArg.args.multipass });
        },
        openHub: function (clickArg) {
            var items = window[clickArg.args.items];

            WinJS.Navigation.navigate('/pages/hub/home.html', { items: items, multipass: clickArg.args.multipass });
        }
    });
})();

var items = []
for (var i = 0 ; i < 200 ; i++) {
    items.push({ title: 'article ' + (i + 1), image: '/images/mcnstore.jpg' });
}

var items5 = items.slice(0, 5);
var items10 = items.slice(0, 10);
var items20 = items.slice(0, 20);
var items50 = items.slice(0, 50);
var items100 = items.slice(0, 100);
var items200 = items.slice(0, 200);

var HomeGridLayout = {
    vertical: { query: '(orientation: portrait)', layout: 'flexvertical' },
    horizontal: { query: '(orientation: landscape)', layout: 'flexhorizontal' }
};