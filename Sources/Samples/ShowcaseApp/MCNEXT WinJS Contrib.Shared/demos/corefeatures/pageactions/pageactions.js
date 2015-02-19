(function () {
    "use strict";

    WinJS.UI.Pages.define("./demos/corefeatures/pageactions/pageactions.html", {
        alertMe: function (pageActionArg) {
            WinJSContrib.Alerts.messageBox({
                title: pageActionArg.args.title,
                content: "Do you like what you have seen of WinJS contrib so far ?",
                commands: [
                    { label: "Yes" },
                    { label: "Maybe" },
                    {
                        label: "I don\'t know", callback: function () {
                            //do something on command click
                        }
                    }
                ]
            });
        },

        pageActionArgCallback: function () {
            return {
                title: "Great stuff isn't it ?"
            }
        }
    });
})();
