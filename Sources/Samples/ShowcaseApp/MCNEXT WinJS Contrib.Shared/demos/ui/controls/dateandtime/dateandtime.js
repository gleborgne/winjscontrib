(function () {
    "use strict";

    WinJS.UI.Pages.define("/demos/ui/controls/dateandtime/dateandtime.html", {
        ready: function (element, options) {
            var page = this;
            page.calendar.onchange = function () {
                page.calendarresult.innerText = "you picked : " + moment(page.calendar.value).format("L");
            }

            page.timeclock.onchange = function () {
                page.timeclockresult.innerText = "you picked : " + page.timeclock.value;
            }

            page.radialtimeclock.onchange = function () {
                page.radialtimeclockresult.innerText = "you picked : " + page.radialtimeclock.value;
            }
        },

        unload: function () {
        },

        updateLayout: function (element) {
        }
    });
})();
