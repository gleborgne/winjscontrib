/// <reference path="../../../../../../typings/winjs.d.ts" />
var ShowCaseApp;
(function (ShowCaseApp) {
    var Pages;
    (function (Pages) {
        var TsPage = (function () {
            function TsPage() {
            }
            TsPage.prototype.processed = function (element, options) {
                this.listview.itemDataSource = new WinJS.Binding.List([]).dataSource;
            };
            return TsPage;
        })();
        WinJS.UI.Pages.define("./demos/corefeatures/typescript/typescriptpage.html", TsPage);
    })(Pages = ShowCaseApp.Pages || (ShowCaseApp.Pages = {}));
})(ShowCaseApp || (ShowCaseApp = {}));
//# sourceMappingURL=typescriptpage.js.map