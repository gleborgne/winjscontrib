(function () {
    "use strict";
    function bindWebLinks(element) {
        $('*[data-page-weblink]', element).each(function () {
            var target = $(this).data('page-weblink');

            if (target && target.indexOf('/') < 0) {
                var tmp = MCNEXT.Utils.readProperty(window, target);
                if (tmp) {
                    target = tmp;
                }
            }

            if (target) {
                $(this).tap(function (eltarg) {
                    var actionArgs = $(eltarg).data('page-action-args');
                    if (actionArgs && typeof actionArgs == 'string') {
                        try {
                            var tmp = MCNEXT.Utils.readValue(eltarg, actionArgs);
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
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.

        prepareData: function (element, options) {

        },

        prepare: function (element, options) {
            bindWebLinks(element);
            this.pageHub = element.querySelector('#pageHub').winControl;

        },
        ready: function (element, options) {
            var that = this;
            if (WinJS.Navigation.history.current && WinJS.Navigation.history.current.state && WinJS.Navigation.history.current.state.index)
                that.pageHub.selectedIndex = WinJS.Navigation.history.current.state.index + 1;
            else if (WinJS.Navigation.history.current && WinJS.Navigation.history.current.state && WinJS.Navigation.history.current.state.index == 0) {
                that.pageHub.selectedIndex = 1;
            }
            else
                that.pageHub.selectedIndex = 2;
            this.pageHub.onselectionchanged = function (eventInfo) {
                WinJS.Navigation.history.current.state = { index: eventInfo.detail.index };
            };
            this.setMenu()
        },

        setMenu: function () {
            var mainMenu = document.getElementById('mainMenu');
            if (mainMenu) {
                var pagecontrol = mainMenu.querySelector('.pagecontrol');
                if (pagecontrol && pagecontrol.winControl) {
                    pagecontrol.winControl.setMenu([
                        {
                            link: "./pages/home/home.html",
                            title: "Home",
                            icon: "&#xe10f;"
                        }]);
                }
            }
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
    horizontal: { query: '(orientation: landscape)', layout: 'flexvertical' }
};