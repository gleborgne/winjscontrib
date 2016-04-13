declare module WinJSContrib.Utils {
    function readProperty(obj: any, name: string);
}

module WinJSContrib.Search {
    /*
     look at http://burakkanber.com/blog/machine-learning-full-text-search-in-javascript-relevance-scoring/
     */
     
    /**
     * definition for a field
     * @typedef {Object} WinJSContrib.Search.FieldDefinition
     * @property {number} weight weight of the item to rank search results
     * @example
     * { weight : 2}
     */
    export interface FieldDefinition {
        weight? : number;
    }
    
    /**
     * Definition of an index content
     * @typedef {Object} WinJSContrib.Search.IndexDefinition
     * @property {string} key name of the property considered as a key for the items
     * @property {Object} fields object containing item's property path as name, and {@link WinJSContrib.Search.FieldDefinition} as value
     * @example
     * { key: 'id', fields: { "title": { weight : 5}, "description.detail": { weight : 2}}}
     */

    export interface FieldDefinitionMap {
        [name: string]: FieldDefinition;
    }
    
    export interface IndexDefinition {
        key : string;
        fields : FieldDefinitionMap;
    }

    /**
     * Small text search features based on objet indexing and text stemming. It's inspired by tools like Lucene.
     * For now indexes are stored with WinRT files, but it will soon be extended to support an extensible storage mecanism
     * @namespace WinJSContrib.Search
     */


    /**     
     * path for search worker script file
     * @field WinJSContrib.Search.workerPath
     * @type {string}
     */
    export var workerPath = './scripts/winjscontrib/winjscontrib.search.worker.js';
    

    export function writeWinRTFile(folder, fileName, CreationCollisionOption, objectGraph) {
        return new WinJS.Promise(function (complete, error) {
            folder.createFileAsync(fileName, CreationCollisionOption).done(function (docfile) {
                Windows.Storage.FileIO.writeTextAsync(docfile, JSON.stringify(objectGraph)).done(function () {
                    if (WinJS && WinJS.log) WinJS.log("File written " + docfile.path);
                    complete();
                }, error);
            }, error);
        });
    }

    export function openWinRTFile(folder, fileName) {
        return new WinJS.Promise(function (complete, error) {
            folder.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.openIfExists).then(function (file) {
                Windows.Storage.FileIO.readTextAsync(file).done(function (text) {
                    if (text)
                        complete(JSON.parse(text));
                    else
                        complete();
                }, error);
            }, error);
        });
    }

}
