/// <reference path="../../../../../../typings/winjs.d.ts" />

declare module WinJS.UI.Pages {
    function define(uri: string, ctor: () => any);
    interface IPageBase extends WinJS.UI.Pages.IPageControlMembers {
        element: HTMLElement;
    }
}

module ShowCaseApp.Pages{

    class TsPage implements WinJS.UI.Pages.IPageBase {
        public element: HTMLElement;
        public listview: WinJS.UI.ListView<any>;

        public processed(element, options) {                        
            this.listview.itemDataSource = new WinJS.Binding.List([]).dataSource;            
        }
    }

    WinJS.UI.Pages.define("./demos/corefeatures/typescript/typescriptpage.html", TsPage);
}
