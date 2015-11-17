declare module WinJSContrib.DataContainer {
	export var current: IDataContainer;

	interface IDataContainer {
        read<T>(itemkey: string): WinJS.Promise<T>;
        save(itemkey, obj): WinJS.Promise<any>;
        remove(itemkey): WinJS.Promise<any>;
        listKeys(): WinJS.Promise<string[]>;
        child(key): IDataContainer;
        childWithTransaction(key: string, process: (arg: IDataContainer) => WinJS.Promise<any>): WinJS.Promise<IDataContainer>;
        deleteContainer(): WinJS.Promise<any>;
	}
}