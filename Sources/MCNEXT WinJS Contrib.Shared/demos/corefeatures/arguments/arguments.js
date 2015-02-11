(function () {
    "use strict";

    WinJS.UI.Pages.define("./demos/corefeatures/arguments/arguments.html", {
        ready: function (element, options) {
            var sampledata = {
                someLongText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit fusce vel sapien elit in malesuada semper mi, id sollicitudin urna fermentum ut fusce varius nisl ac ipsum gravida vel pretium tellus."
            }
            WinJS.Binding.processAll(element, sampledata);
        },

    });
})();
