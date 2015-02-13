(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/datasources/customcontrol/datasources.html", {
        prepare: function (element, options) {
            var page = this;
            page.semanticListViews = element.querySelector('#semanticzoom').winControl;
            page.viewSelectionFlyout = element.querySelector('#viewSelectionFlyout').winControl;

            //define data filter on title
            page.semanticListViews.dataManager.filters.push(function (item) {
                if (!page.titleFilter)
                    return true;

                if (item.title && item.title.toLowerCase().indexOf(page.titleFilter) >= 0)
                    return true;
                else
                    return false;
            });

            //define data filter on genre
            page.semanticListViews.dataManager.filters.push(function (item) {
                if (!page.genreFilter)
                    return true;

                if (item.metadata.genre && item.metadata.genre.toLowerCase().indexOf(page.genreFilter) >= 0)
                    return true;
                else
                    return false;
            });

            page.semanticListViews.dataManager.refresh();

            //trigger data refresh
            $('#txtTitleFilter', page.element).throttleTextChanged(800, function (txtbox, text) {
                page.titleFilter = text.toLowerCase();
                page.semanticListViews.dataManager.refresh();
            });
            $('#txtGenreFilter', page.element).throttleTextChanged(800, function (txtbox, text) {
                page.genreFilter = text.toLowerCase();
                page.semanticListViews.dataManager.refresh();
            });
        },

        ready: function (element, options) {
            if (this.semanticListViews && this.semanticListViews._listview && this.semanticListViews._zoomedOutListview) {
                if (this.semanticListViews._listview.forceLayout && this.semanticListViews._zoomedOutListview.forceLayout) {
                    this.semanticListViews._zoomedOutListview.forceLayout();
                    this.semanticListViews._listview.forceLayout();
                }
            }
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
            var page = this;
            $('.viewKindName', this.element).text(arg.elt.innerText);
            page.semanticListViews.dataManager.apply({
                groupKind: WinJSContrib.UI.DataSources.Grouping.byField,
                field: 'metadata.genre'
            });
            this.viewSelectionFlyout.hide();
        },

        //change grouping to years
        viewByYear: function (arg) {
            var page = this;
            $('.viewKindName', this.element).text(arg.elt.innerText);
            page.semanticListViews.dataManager.apply({
                groupKind: WinJSContrib.UI.DataSources.Grouping.byYear,
                field: 'year'
            });
            this.viewSelectionFlyout.hide();
        },

        //change grouping to alphabetic
        viewAlphabetically: function (arg) {
            var page = this;
            $('.viewKindName', this.element).text(arg.elt.innerText);
            page.semanticListViews.dataManager.apply({
                groupKind: WinJSContrib.UI.DataSources.Grouping.alphabetic,
                field: 'title'
            });
            this.viewSelectionFlyout.hide();
        }
    });
})();
