(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/listlayout/home.html", {
        ready: function (element, options) {
            var mylistview = element.querySelector('#mylistview');
            mylistview.winControl.forceLayout();
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
                            link: "./pages/listlayout/home.html",
                            title: "Declarative layout"
                        },
                        {
                            link: "./pages/datasources/simple/datasources.html",
                            title: "DataSourceManager"
                        },
                        {
                            link: "./pages/datasources/customcontrol/datasources.html",
                            title: "semantic zoom lists"
                        }]);
                }
            }
        },

    });
})();


DummyData = [
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
    { title: 'My item' },
];

DummyDataSource = new WinJS.Binding.List(DummyData).dataSource;
