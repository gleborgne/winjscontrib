(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/datasources/simple/datasources.html", {
        prepare: function (element, options) {
            var page = this;
            page.zoomedInList = element.querySelector('#zoomedInList').winControl;
            page.zoomedOutList = element.querySelector('#zoomedOutList').winControl;
            page.viewSelectionFlyout = element.querySelector('#viewSelectionFlyout').winControl;

            page.data = new WinJSContrib.UI.DataSources.DataSourceManager({
                defaultGroupLimit: 12,
                groupKind: WinJSContrib.UI.DataSources.Grouping.byField,
                field: 'metadata.genre',
                listview: page.zoomedInList,
                zoomedOutListView: page.zoomedOutList
            });
            page.data.prepareItems(moviesSample);

            //define data filter on title
            page.data.filters.push(function (item) {
                if (!page.titleFilter)
                    return true;

                if (item.title && item.title.toLowerCase().indexOf(page.titleFilter) >= 0)
                    return true;
                else
                    return false;
            });

            //define data filter on genre
            page.data.filters.push(function (item) {
                if (!page.genreFilter)
                    return true;

                if (item.metadata.genre && item.metadata.genre.toLowerCase().indexOf(page.genreFilter) >= 0)
                    return true;
                else
                    return false;
            });

            //trigger data refresh
            $('#txtTitleFilter', page.element).throttleTextChanged(500, function (txtbox, text) {
                page.titleFilter = text.toLowerCase();
                page.data.refresh();
            });
            $('#txtGenreFilter', page.element).throttleTextChanged(500, function (txtbox, text) {
                page.genreFilter = text.toLowerCase();
                page.data.refresh();
            });
            page.data.attach();
        },

        ready: function (element) {
            var page = this;

            if (WinJSContrib.CrossPlatform && (WinJSContrib.CrossPlatform.isMobile.Android() || WinJSContrib.CrossPlatform.isMobile.iOS())) {
                var semanticzoom = element.querySelector('#semanticzoom');
                if (semanticzoom && semanticzoom.winControl)
                    semanticzoom.winControl.forceLayout();
            }
            this.zoomedInList.forceLayout();
            this.zoomedOutList.forceLayout();

            //page.data.attach();
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


        //change grouping to field genre
        viewByGenre: function (arg) {
            $('.viewKindName', this.element).text(arg.elt.innerText);
            this.data.apply({
                groupKind: WinJSContrib.UI.DataSources.Grouping.byField,
                field: 'metadata.genre'
            });
            this.viewSelectionFlyout.hide();
        },

        groupHeader: function () {

        },

        //change grouping to years
        viewByYear: function (arg) {
            $('.viewKindName', this.element).text(arg.elt.innerText);
            this.data.apply({
                groupKind: WinJSContrib.UI.DataSources.Grouping.byYear,
                field: 'year'
            });
            this.viewSelectionFlyout.hide();
        },

        //change grouping to alphabetic
        viewAlphabetically: function (arg) {
            $('.viewKindName', this.element).text(arg.elt.innerText);
            this.data.apply({
                groupKind: WinJSContrib.UI.DataSources.Grouping.alphabetic,
                field: 'title'
            });
            this.viewSelectionFlyout.hide();
        }
    });
})();
