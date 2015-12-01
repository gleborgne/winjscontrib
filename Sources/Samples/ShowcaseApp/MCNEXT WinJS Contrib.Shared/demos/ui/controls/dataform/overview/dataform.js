(function () {
    "use strict";    

    WinJS.UI.Pages.define("./demos/ui/controls/dataform/overview/dataform.html", {
        ready: function (element, options) {
            var data = {
                name: "John Doe",
                gender: "unknown",
                radiogender: "male"
            };

            var dataformH = element.querySelector("#formHorizontal").winControl;
            dataformH.item = data;

            this.eventTracker.addEvent(dataformH, "submitted", function (arg) {
                dataformV.item = arg.detail.item;
            });

            var dataformV = element.querySelector("#formVertical").winControl;
            dataformV.item = data;

            this.eventTracker.addEvent(dataformV, "submitted", function (arg) {
                dataformH.item = arg.detail.item;
            });
        }
    });
})();
