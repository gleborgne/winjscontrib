var winjscontribApiDoc = null;

var HubGridLayout = {
    vertical: { query: '(orientation: portrait)', layout: 'flexvertical' },
    horizontal: { query: '(orientation: landscape)', layout: 'hbloc', cellWidth: 300, }
};

var MenuViewsOrientations = {
    vertical: { query: '(orientation: portrait)', orientation: 'vertical' },
    horizontal: { query: '(orientation: landscape)', orientation: 'horizontal' }
};

function registerSection(page, classname) {
    if (classname) {
        page.masterDetailView.element.classList.add(classname)
    }

    $('.feature', page.element).tap(function (elt) {
        
        var target = $(elt).data('target');
        var args = $(elt).data('target-args') || {};
        var weblink = $(elt).data('weblink');
        var targetDoc = $(elt).data('target-doc');

        var title = $('.title', elt).text().trim() || $(elt).text().trim();
        if (target) {
            if (target != 'none') {
                elt.classList.add('active');
                args.title = title;

                var opts = {}
                opts.uri = target;
                opts.wrapInMasterDetailView = true;
                opts.prepareHeader = function (arg) {
                    var s = getComputedStyle(elt);
                    arg.header.style.backgroundColor = s.backgroundColor;
                }

                page.masterDetailView.openDetail(elt, args, opts).then(function () {
                    elt.classList.remove('active');

                });
            }
        } else if (weblink) {
            var uri = new Windows.Foundation.Uri(weblink);
            Windows.System.Launcher.launchUriAsync(uri);
        } else if (targetDoc) {
            var codeview = document.getElementById('docviewFlyout');
            codeview.winControl.open(targetDoc, args);
        }
        else {
            WinJSContrib.Alerts.message('oups...', 'sorry the component is available but the sample is not. We are working hard at making it available but in the meantime, have a look at source code on github.')
        }
    });
}

function getApiDoc() {
    if (winjscontribApiDoc)
        return WinJS.Promise.wrap(winjscontribApiDoc);

    return WinJS.xhr({ url: './apidoc/winjscontrib.doc.json' }).then(function (r) {
        var res = JSON.parse(r.responseText);
        res.find = function (path) {
            var tokens = path.split('.');
            var getNodeFor = function (node, propName, token) {
                if (node && node[propName] && node[propName].length) {
                    var res = node[propName].filter(function (n) {
                        return n.name == token;
                    });
                    if (res && res.length)
                        return res[0];
                }
            }

            var iterate = function (currentIndex, currentnode) {
                var currentToken = tokens[currentIndex];
                var res = getNodeFor(currentnode, 'namespaces', currentToken);
                if (!res)
                    res = getNodeFor(currentnode, 'classes', currentToken);
                if (!res)
                    res = getNodeFor(currentnode, 'functions', currentToken);
                if (!res)
                    res = getNodeFor(currentnode, 'members', currentToken);

                if (res && currentIndex < tokens.length) {
                    return iterate(currentIndex + 1, res);
                }

                if (res)
                    return res;
                else
                    return currentnode;
            }

            return iterate(0, res);
        }

        return res;
    });
}

function renderClass(apiDoc, withname) {
    var elt = document.createElement("DIV");
    elt.className = 'apidoc-class';
    
    if (withname) {
        var desc = document.createElement("DIV");
        desc.className = 'apidoc-classname';
        desc.innerHTML = apiDoc.name;
        elt.appendChild(desc);
    }
    renderDescription(apiDoc, elt);

    if (apiDoc.constructor && apiDoc.constructor.parameters && apiDoc.constructor.parameters.length) {
        var ctor = document.createElement("DIV");
        ctor.className = 'apidoc-constructor';
        elt.appendChild(ctor);
        renderFunctionParams(apiDoc.constructor, ctor);
    }

    if (apiDoc.properties && apiDoc.properties.length) {
        var mb = document.createElement("DIV");
        mb.className = 'apidoc-members';
        mb.innerHTML = '<h3>members</h3>';
        elt.appendChild(mb);
        apiDoc.properties.forEach(function (member) {
            mb.appendChild(renderMember(member));
        });
    }

    if (apiDoc.functions) {
        var fn = document.createElement("DIV");
        fn.className = 'apidoc-functions';
        fn.innerHTML = '<h3>functions</h3>';
        elt.appendChild(fn);

        apiDoc.functions.forEach(function (func) {
            fn.appendChild(renderFunction(func, true));
        });
    }

    if (apiDoc.classes) {

    }

    return elt;
}

function renderFunctionName(apiDoc) {
    var fn = document.createElement("DIV");
    fn.className = 'apidoc-function-name';
    var name = apiDoc.name + '(';

    apiDoc.parameters.forEach(function (p, index) {
        if (index > 0)
            name+= ', ';
        
        name += p.name;

        if (p.type) {
            name += ':' + p.type;
        }
    });

    name += ')';

    fn.innerHTML = name;
    return fn;
}

function renderFunction(apiDoc, withname) {
    var elt = document.createElement("DIV");
    elt.className = 'apidoc-function';

    if (withname) {
        elt.appendChild(renderFunctionName(apiDoc));
    }

    var content = document.createElement("DIV");
    content.className = 'apidoc-function-content';
    elt.appendChild(content);

    renderDescription(apiDoc, content);
    renderFunctionParams(apiDoc, content);
    renderExamples(apiDoc, content);

    return elt;
}

function renderDescription(apiDoc, elt) {
    if (apiDoc.description) {
        var desc = document.createElement("DIV");
        desc.className = 'apidoc-description';
        desc.innerHTML = apiDoc.description;
        elt.appendChild(desc);
    }
}

function renderFunctionParams(apiDoc, container) {
    if (apiDoc.parameters && apiDoc.parameters.length) {
        var elt = document.createElement("TABLE");
        elt.className = 'apidoc-function-params';
        elt.innerHTML = '<tr><th>name</th><th>type</th><th>description</th><th>null?</th><th>opt?</th></tr>';
        apiDoc.parameters.forEach(function (p) {
            var row = document.createElement('tr');
            row.innerHTML = '<td>' + p.name + '</td><td>' + p.type + '</td><td>' + (p.description || '') + '</td><td>' + (p.nullable ? 'X' : '') + '</td><td>' + (p.optinal ? 'X' : '') + '</td>';
            elt.appendChild(row);
        });
        container.appendChild(elt);
    }
}

function renderExamples(apiDoc, container) {
    if (apiDoc.examples && apiDoc.examples.length) {
        
    }
}

function renderMember(apiDoc) {
    var elt = document.createElement("DIV");
    elt.className = 'apidoc-member';
    elt.innerHTML = apiDoc.name;

    return elt;
}