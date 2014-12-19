(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/tab/tabcontrol.html", {
        ready: function (element, options) {
            var page = this;
            var ctrl = element.querySelector('#tabctrl').winControl;

            //add tabs
            ctrl.addTabs([
                { title: 'page 1', uri: './pages/tab/page1/page.html' },
                { title: 'page 2', uri: './pages/tab/page2/page.html' },
                { title: 'page 3', uri: './pages/tab/page3/page.html' }
            ]);

            //add actions to tabbar
            ctrl.addTabs([
                { title: 'action 1', invoked: page.actionClicked },
                { title: 'action 2', invoked: page.actionClicked }
            ], 'actions');

            ctrl.selectByIndex(0);
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
                        },
                        {
                            link: "./pages/tab/tabcontrol.html",
                            title: "tab control"
                        },
                        {
                            link: "./pages/semanticzoom/semanticzoom.html",
                            title: "semantic zoom wrapper"
                        }]);
                }
            }
        },

        actionClicked: function(ctrl, tab){
            WinJSContrib.Alerts.message('tab action', 'you clicked ' + tab.item.title);
        }
    });
})();
