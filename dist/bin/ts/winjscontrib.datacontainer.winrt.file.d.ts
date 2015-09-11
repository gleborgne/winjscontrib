declare var __global: any;
declare module WinJSContrib.DataContainer {
    var current: IDataContainer;
    class WinRTFilesContainer implements IDataContainer {
        key: string;
        parent: WinRTFilesContainer;
        useDataCache: boolean;
        dataCache: any;
        childs: any;
        folder: Windows.Storage.StorageFolder;
        options: any;
        folderPromise: WinJS.Promise<Windows.Storage.StorageFolder>;
        static makeCurrent(key?: string, options?: any): void;
        constructor(key?: string, options?: any, parent?: WinRTFilesContainer);
        read<T>(itemkey: string): WinJS.Promise<T>;
        save(itemkey: any, obj: any): WinJS.Promise<any>;
        remove(itemkey: any): WinJS.Promise<any>;
        listKeys(): WinJS.Promise<string[]>;
        list(): WinJS.IPromise<Windows.Foundation.Collections.IVectorView<Windows.Storage.StorageFile>>;
        child(key: any): WinRTFilesContainer;
        childWithTransaction(key: string, process: (arg: WinRTFilesContainer) => WinJS.Promise<any>): WinJS.Promise<WinRTFilesContainer>;
        deleteContainer(): WinJS.Promise<any>;
        clearAllCache(): void;
        clearCache(): void;
        clearDataCache(): void;
    }
}
