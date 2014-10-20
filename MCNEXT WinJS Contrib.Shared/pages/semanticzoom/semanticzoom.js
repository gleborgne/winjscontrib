(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/semanticzoom/semanticzoom.html", {
        prepare: function (element, options) {
            var page = this;
            page.zoom = page.element.querySelector("#semanticzoom").winControl;
        },

        ready: function (element, options) {
            var page = this;
            this.zoomedin = page.element.querySelector("#zoomedin").winControl;
            this.zoomedinGrid = page.element.querySelector("#zoomedingrid").winControl;
            this.zoomedout = page.element.querySelector("#zoomedout").winControl;
            this.zoomedoutGrid = page.element.querySelector("#zoomedoutgrid").winControl;
            if (MCNEXT.CrossPlatform && (MCNEXT.CrossPlatform.isMobile.Android() || MCNEXT.CrossPlatform.isMobile.iOS())) {
                page.zoom.forceLayout();
            }
            this.zoomedinGrid.layout();
            this.zoomedoutGrid.layout();
            //register callback for zoomed-in view 
            this.zoomedin.onSemanticZoom = function (item) {
                if (item) {
                    $('#zoomedin .container').scrollLeft($('#' + item)[0].offsetLeft);
                }
            };

            //register action for items in zoomed-out view
            $('#zoomedout .item', page.element).click(function (arg) {
                var target = $(arg.currentTarget).data('target');
                page.zoomedout.selectZoomItem(target);
            });
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
    });
})();
