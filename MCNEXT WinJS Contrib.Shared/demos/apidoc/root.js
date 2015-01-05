// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    function formatDescription(desc) {
        var token = "{@link ";
        while (desc.indexOf(token) >= 0) {
            var idx = desc.indexOf(token);
            var endIdx = desc.indexOf('}', idx);
            desc = desc.substr(0, idx) + desc.substr(idx + token.length, endIdx - idx - token.length) + desc.substr(endIdx + 1, desc.length - endIdx - 1);
        }

        return desc;
    }

    WinJS.UI.Pages.define("/demos/apidoc/root.html", {
        init: function (element, options) {
            var page = this;
            options = options || {};
            
            return getApiDoc().then(function (apiDoc) {
                if (options.datapath) {
                    page.rootPath = options.datapath;
                    page.apiDoc = apiDoc.find(options.datapath);
                } else {
                    page.rootPath = apiDoc.namespaces[0].name;
                    page.apiDoc = apiDoc.namespaces[0];
                }
            });
        },

        prepare: function () {
            var page = this;
            page.renderNamespaces(page.apiDoc, page.rootPath);
            page.renderClasses(page.apiDoc, page.rootPath);
            page.renderFunctions(page.apiDoc, page.rootPath);
            page.renderMembers(page.apiDoc, page.rootPath);
        },

        renderNamespaces: function (root, rootPath) {
            var page = this;
            if (root && root.namespaces && root.namespaces.length) {
                var namespacesContainer = page.q("#sectionNamespaces .mcn-hub-section-content");
                root.namespaces.forEach(function (ns) {
                    var elt = document.createElement('div');
                    elt.className = 'feature obj-namespace';
                    elt.setAttribute("data-target", "./demos/apidoc/root.html");
                    elt.setAttribute("data-target-args", '{ "datapath" : "' + (rootPath + "." + ns.name) + '", "nodeType": "namespace"}');
                    elt.innerHTML = '<div class="title">' + (rootPath + "." + ns.name) + '</div><div class="desc">' + formatDescription(ns.description) + '</div>'
                    namespacesContainer.appendChild(elt);
                    //if (ns.namespaces && ns.namespaces.length) {
                    //    page.renderNamespaces(ns, rootPath + "." + ns.name);
                    //}
                    //namespacesContainer.winControl.layout();
                });
            } else {
                page.$("#sectionNamespaces").hide();
            }
        },

        renderClasses: function (root, rootPath) {
            var page = this;
            if (root && root.classes && root.classes.length) {
                var classesContainer = page.q("#sectionClasses .mcn-hub-section-content");
                root.classes.forEach(function (ns) {
                    var elt = document.createElement('div');
                    elt.className = 'feature obj-class';
                    elt.setAttribute("data-target-doc", "./demos/apidoc/classView/classView.html");
                    elt.setAttribute("data-target-args", '{ "datapath" : "' + (rootPath + "." + ns.name) + '", "nodeType": "class"}');
                    elt.innerHTML = '<div class="title">' + ns.name + '</div><div class="desc">' + formatDescription(ns.description) + '</div>'
                    classesContainer.appendChild(elt);
                    //namespacesContainer.winControl.layout();
                });
            } else {
                page.$("#sectionClasses").hide();
            }
        },

        renderFunctions: function (root, rootPath) {
            var page = this;
            if (root && root.functions && root.functions.length) {
                var functionsContainer = page.q("#sectionFunctions .mcn-hub-section-content");
                root.functions.forEach(function (ns) {
                    var elt = document.createElement('div');
                    elt.className = 'feature obj-function';
                    elt.setAttribute("data-target-doc", "./demos/apidoc/classView/classView.html");
                    elt.setAttribute("data-target-args", '{ "datapath" : "' + (rootPath + "." + ns.name) + '", "nodeType": "function"}');
                    elt.innerHTML = '<div class="title">' + ns.name + '</div><div class="desc">' + formatDescription(ns.description) + '</div>'
                    functionsContainer.appendChild(elt);
                    //namespacesContainer.winControl.layout();
                });
            } else {
                page.$("#sectionFunctions").hide();
            }
        },

        renderMembers: function (root, rootPath) {
            var page = this;           

            if (root && ((root.members && root.members.length) || (root.properties && root.properties.length))) {
                var membersContainer = page.q("#sectionMembers .mcn-hub-section-content");
                if (root.members){
                    root.members.forEach(function (ns) {
                        var elt = document.createElement('div');
                        elt.className = 'feature obj-function';
                        elt.setAttribute("data-target", "none");
                        //elt.setAttribute("data-target-args", '{ "datapath" : "' + (rootPath + "." + ns.name) + '", "nodeType": "member"}');
                        elt.innerHTML = '<div class="title">' + ns.name + '</div><div class="desc">' + formatDescription(ns.description) + '</div>'
                        membersContainer.appendChild(elt);
                        //namespacesContainer.winControl.layout();
                    });
                }
                if (root.properties){
                    root.properties.forEach(function (ns) {
                        var elt = document.createElement('div');
                        elt.className = 'feature obj-function';
                        elt.setAttribute("data-target", "none");
                        //elt.setAttribute("data-target-args", '{ "datapath" : "' + (rootPath + "." + ns.name) + '", "nodeType": "member"}');
                        elt.innerHTML = '<div class="title">' + ns.name + '</div><div class="desc">' + formatDescription(ns.description) + '</div>'
                        membersContainer.appendChild(elt);
                        //namespacesContainer.winControl.layout();
                    });
                }
            } else {
                page.$("#sectionMembers").hide();
            }
        },

        

        ready: function (element, options) {
            var page = this;
            var navToDetail = (options != null && options.datapath != undefined);
            registerSection(page, 'section-ui', navToDetail);
            //var namespacesContainer = page.q("#sectionNamespaces .mcn-hub-section-content");
            //namespacesContainer.winControl.layout();
        }
    });
})();
