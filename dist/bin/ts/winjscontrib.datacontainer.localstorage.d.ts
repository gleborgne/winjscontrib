declare var __global: any;
declare module WinJSContrib.DataContainer {
    var current: IDataContainer;
    class LocalStorageContainer implements IDataContainer {
        key: string;
        parent: LocalStorageContainer;
        useDataCache: boolean;
        storageKey: string;
        options: any;
        childs: any;
        static makeCurrent(key?: string, options?: any): void;
        constructor(key?: string, options?: any, parent?: LocalStorageContainer);
        read(itemkey: any): WinJS.IPromise<any>;
        save(itemkey: any, obj: any): WinJS.IPromise<{}>;
        remove(itemkey: any): WinJS.IPromise<{}>;
        listKeys(): WinJS.IPromise<any[]>;
        list(): WinJS.IPromise<any[]>;
        child(key: any): LocalStorageContainer;
        childWithTransaction(key: string, process: (arg: LocalStorageContainer) => WinJS.Promise<any>): WinJS.Promise<LocalStorageContainer>;
        deleteContainer(): WinJS.Promise<any>;
    }
}
