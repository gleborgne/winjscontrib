/// <reference path="../../js/_sharedReferences.js" />
(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/mainmenu/mainmenu.html", {
        ready: function (element, options) {
            WinJS.Resources.processAll(element);
        },
        setMenu: function (mainmenu) {
            var ctrl = this;
            if (mainmenu) {
                var menugroup = this.element.querySelector('.menu-group');
                menugroup.innerHTML = "";
                for (var i = 0; i < mainmenu.length; i++) {
                    var item = mainmenu[i];
                    var itemdiv = document.createElement('div');
                    itemdiv.className = "menu-item";
                    itemdiv.id = "menu-" + i;
                    itemdiv.dataset.link = item.link;
                    if (item.icon)
                        itemdiv.innerHTML = '<span class="symbol icon">' + item.icon + '</span> ' + item.title;
                    else
                        itemdiv.innerHTML = item.title;
                    $(itemdiv).tap(function () {
                        var that = this;
                        ctrl.flyoutPage.hide().then(function () {
                            WinJS.Navigation.navigate(that.element.dataset.link);
                        })
                    })
                    menugroup.appendChild(itemdiv);
                }
            }
        },

        logout: function () {
        },

        synchronise: function () {
        },

        workspaceHome: function () {
        },

        beforeshow: function () {
            var ctrl = this;
            var items = $('.menu-item', ctrl.element);
            items.css('opacity', '0');
            WinJS.Promise.timeout(180).then(function () {
                WinJS.UI.Animation.enterPage(items.toArray());
            });
            
        }
    });
})();
