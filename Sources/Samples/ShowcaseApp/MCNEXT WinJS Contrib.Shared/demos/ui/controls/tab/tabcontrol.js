﻿(function () {
    "use strict";

    WinJS.UI.Pages.define("./demos/ui/controls/tab/tabcontrol.html", {
        ready: function (element, options) {
            var page = this;
            var ctrl = element.querySelector('#tabctrl').winControl;

            //add tabs
            ctrl.addTabs([
                { title: 'page 1', uri: './demos/ui/controls/tab/page1/page.html' },
                { title: 'page 2', uri: './demos/ui/controls/tab/page2/page.html' },
                { title: 'page 3', uri: './demos/ui/controls/tab/page3/page.html' }
            ]);

            //add actions to tabbar
            ctrl.addTabs([
                { title: 'action 1', invoked: page.actionClicked },
                { title: 'action 2', invoked: page.actionClicked }
            ], 'actions');

            ctrl.selectByIndex(0);
        },

        actionClicked: function(ctrl, tab){
            WinJSContrib.Alerts.message('tab action', 'you clicked ' + tab.item.title);
        }
    });
})();
