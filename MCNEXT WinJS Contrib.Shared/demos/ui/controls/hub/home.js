(function () {
    "use strict";
    var items = [];
    for (var i = 0 ; i < 10 ; i++) {
        items.push({ title: "article " + (i + 1), image: "./images/mcnstore.jpg" });
    }

    WinJS.UI.Pages.define("./demos/ui/controls/hub/home.html", {
        prepare: function (element, options) {
            var controls = {
                hub: element.querySelector("#pageHub").winControl,
                section1 : {
                    section: element.querySelector("#section1").winControl,
                    grid: element.querySelector("#section1 .mcn-hub-section-content").winControl
                },
                section2 : {
                    section: element.querySelector("#section2").winControl,
                    grid: element.querySelector("#section2 .mcn-hub-section-content").winControl
                },
                section3 : {
                    section: element.querySelector("#section3").winControl,
                    grid: element.querySelector("#section3 .mcn-hub-section-content").winControl
                },
                section4 : {
                    section: element.querySelector("#section4").winControl,
                    grid: element.querySelector("#section4 .mcn-hub-section-content").winControl
                },
                section5 : {
                    section: element.querySelector("#section5").winControl,
                    grid: element.querySelector("#section5 .mcn-hub-section-content").winControl
                }
            };
            this.controls = controls;            
            controls.hub.multipass = options.multipass;

            controls.section1.grid.prepareItems(options.items);
            controls.section2.grid.prepareItems(options.items);
            controls.section3.grid.prepareItems(options.items);
            controls.section4.grid.prepareItems(options.items);
            controls.section5.grid.prepareItems(options.items);

            //add hub section through code, just for the show
            controls.hub.renderSection({ title: "section 6" }, element.querySelector("#hubtemplate"), true).done(function (section) {
                var grid = section.element.querySelector(".mcn-hub-section-content").winControl;
                grid.prepareItems(options.items);
            });
            $('.pagetitle', element).text("multipass by " + options.multipass + " (" + (controls.hub.sections.length*options.items.length) + " items)");
        },

        //this method is bound declaratively thanks to our custom navigator
        itemClick: function(clickArg){
            WinJS.Navigation.navigate("./pages/detailPage/detailPage.html", clickArg.itemData);
        }
    });
})();

var DefaultGridLayout = {
    vertical: { query: "(-ms-view-state: fullscreen-portrait)", layout: "vertical" },
    snapped: { query: "(-ms-view-state: snapped)", layout: "vertical" }
};

//this method is bound declaratively thanks to our custom navigator
function articleClicked(clickArg) {
    WinJS.Navigation.navigate("./pages/detailPage/detailPage.html", clickArg.itemData);
}

