/* 
 * WinJS Contrib v2.1.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

//example of expected signature for data container

(function () {
    'use strict';
    WinJS.Namespace.define("WinJSContrib.DataContainer", {
        CordovaDatabaseContainer: WinJS.Class.define(function ctor(key, options, parent) {
            this.key = key || 'mcndatacontainer';
            this.options = options;
            this.parent = parent;
            if (parent) {
                this.storageKey = parent.storageKey + '.' + this.key;
            } else {
                this.storageKey = this.key;
            }

            var container = this;
        }, {
            read: function (itemkey) {
                var container = this;
                var db = openDatabase('survey', '1.0', 'database', 2000000);
                //tx.executeSql('CREATE TABLE IF NOT EXISTS ' + encodeURIComponent(container.key) + ' (id unique, data)');

                console.log('trying to read ' + itemkey);
                return new WinJS.Promise(function (readComplete, readError) {
                    db.transaction(function (tx) {
                        tx.executeSql('SELECT * FROM ' + toValidName(container.key) + ' WHERE itemkey=?', [itemkey], function (tx, results) {
                            if (results.rows && results.rows.length) {
                                var res = JSON.parse(results.rows.item(0).data);
                                readComplete(res);
                            }
                            else
                                readComplete(null);
                        }, function (tx, e) {
                            readComplete(null);
                        });

                    }, function (tx, e) {
                        readComplete(null);
                    });
                });
            },

            save: function (itemkey, obj) {
                var container = this;
                var db = openDatabase('survey', '1.0', 'database', 2000000);
                return new WinJS.Promise(function (saveComplete, saveError) {
                    if (obj) {
                        var tmp = JSON.stringify(obj);

                        db.transaction(function (tx) {
                            tx.executeSql('CREATE TABLE IF NOT EXISTS ' + toValidName(container.key) + '(itemkey TEXT PRIMARY KEY, data)');
                        }, function (t, e) {
                            saveError();
                        }, function (t, e) {
                            db.transaction(function (tx) {
                                tx.executeSql('INSERT OR REPLACE INTO ' + toValidName(container.key) + '(itemkey, data) VALUES (?,?)', [itemkey, tmp], function (te, ee) {
                                    saveComplete();
                                }, function (te, ee) {
                                    saveError()
                                });
                            }, function (te, ee) {
                                saveError()
                            });
                        });
                    }
                });
            },

            remove: function (itemkey) {
                var container = this;
                var db = openDatabase('survey', '1.0', 'database', 2000000);
                return new WinJS.Promise(function (deleteComplete, deleteError) {
                    db.transaction(function (tx) {
                        tx.executeSql("DELETE FROM " + toValidName(container.key) + " WHERE itemkey=?", [itemkey],
                            function () {
                                deleteComplete();
                            },
                            function () {
                                deleteError();
                            });
                    });
                });

            },

            list: function () {
                var container = this;

                var db = openDatabase('survey', '1.0', 'database', 2000000);
                return new WinJS.Promise(function (readComplete, readError) {
                    db.transaction(function (tx) {
                        tx.executeSql('SELECT * FROM ' + toValidName(container.key), [], function (tx, results) {
                            if (results.rows && results.rows.length) {
                                var res = [];
                                for (var i = 0; i < results.rows.length; i++) {
                                    var row = results.rows.item(i);
                                    res.push({ displayName: row.itemkey });
                                }
                                readComplete(res);
                            }
                            else
                                readComplete([]);
                        }, function () { readComplete([]); });
                    });
                });

            },

            child: function (key) {
                if (this[key])
                    return this[key];
                console.log('getting child');
                var res = new WinJSContrib.DataContainer.CordovaDatabaseContainer(key, this.options, this);
                this[key] = res;
                return res;
            }
        })
    });

    function toJSONFileName(fileName) {
        return encodeURIComponent(fileName) + ".json";
    }

    function toValidName(str) {
        //if (str.length > 5) {
        //    str = str.substring(0, 4);
        //}
        str = str.replace(/[^\w\s]/gi, '');
        if (/^\d/.test(str)) {
            str = str.replace(/\s+/g, '');
            str = "mcn" + str;
        }

        return str;
    }
})();