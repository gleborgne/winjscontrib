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

    var isWinRT = window.Windows !== undefined;
    var isWindowPhone = (window.Windows !== undefined && window.Windows.Phone !== undefined);

    if (isWindowPhone) {
        $('.feature.not-on-windowsphone', page.element).hide();
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
                opts.wrapInMasterDetailView = (args.wrapInMasterDetailView != undefined ? args.wrapInMasterDetailView : true);
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
                    res = getNodeFor(currentnode, 'typedefinitions', currentToken);
                if (!res)
                    res = getNodeFor(currentnode, 'functions', currentToken);
                if (!res)
                    res = getNodeFor(currentnode, 'members', currentToken);
                if (!res)
                    res = getNodeFor(currentnode, 'properties', currentToken);

                if (res && currentIndex < tokens.length) {
                    return iterate(currentIndex + 1, res);
                }

                if (res)
                    return res;
                else if (currentnode != winjscontribApiDoc)
                    return currentnode;
            }

            return iterate(0, res);
        }
        winjscontribApiDoc = res;

        return res;
    });
}

function nameSort(a, b) {
    if (a.name > b.name)
        return 1;
    if (a.name < b.name)
        return -1;

    return 0;
}

function renderElementFile(apiDoc) {
    var elt = document.createElement("DIV");
    elt.className = 'apidoc-filename';

    elt.innerText = apiDoc.meta.filename;

    return elt;
}

function renderClass(apiDoc, withname, fullpath) {
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
        ctor.innerHTML = '<h3>constructor</h3>'
        elt.appendChild(ctor);
        renderFunctionParams(apiDoc.constructor, ctor);
    }

    if (apiDoc.properties && apiDoc.properties.length) {
        var mb = document.createElement("DIV");
        mb.className = 'apidoc-members';
        mb.innerHTML = '<h3>members</h3>';
        elt.appendChild(mb);

        var mbItems = document.createElement('DIV');
        mbItems.className = 'apidoc-members-items';
        //mbItems.innerHTML = '<tr><th></th></tr>';
        mb.appendChild(mbItems);

        apiDoc.properties.sort(nameSort);
        apiDoc.properties.forEach(function (member) {
            mbItems.appendChild(renderMember(member, mbItems));
        });
    }

    if (apiDoc.functions) {
        var fn = document.createElement("DIV");
        fn.className = 'apidoc-functions';
        fn.innerHTML = '<h3>functions</h3>';
        elt.appendChild(fn);

        apiDoc.functions.sort(nameSort);
        apiDoc.functions.forEach(function (func) {
            fn.appendChild(renderFunction(func, true));
        });
    }

    if (apiDoc.constructor && apiDoc.constructor.examples && apiDoc.constructor.examples.length) {
        var fn = document.createElement("DIV");
        fn.className = 'apidoc-examples';
        fn.innerHTML = '<h3>examples</h3>';
        elt.appendChild(fn);

        apiDoc.constructor.examples.forEach(function (example) {
            renderExample(example, fn);
        });
    }

    if (apiDoc.classes) {
        var fn = document.createElement("DIV");
        fn.className = 'apidoc-classes';
        fn.innerHTML = '<h3>Classes</h3>';
        elt.appendChild(fn);
        apiDoc.classes.forEach(function (c) {
            var childClass = document.createElement('a');
            childClass.setAttribute('data-linkto', fullpath + '.' + c.name);
            childClass.innerText = fullpath + '.' + c.name;
            fn.appendChild(childClass);
        });
    }

    return elt;
}

function renderFunctionName(apiDoc) {
    var fn = document.createElement("DIV");
    fn.className = 'apidoc-function-name';
    var name = apiDoc.name + '(';

    apiDoc.parameters.forEach(function (p, index) {
        if (index > 0)
            name += ', ';
        if (p.variable)
            name += '...';

        name += p.name;

        //if (p.type) {
        //    name += ':' + p.type;
        //}
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
    renderFunctionReturns(apiDoc, content);
    renderFunctionParams(apiDoc, content);
    renderExamples(apiDoc, content);

    return elt;
}

var linksBlackList = ['object', 'htmlelement', 'element', 'string', 'number', 'array'];

function renderLinkTo(target) {
    var targetElt = null;
    var lw = target.toLowerCase();
    if (linksBlackList.indexOf(lw) < 0)
        targetElt = winjscontribApiDoc.find(target);

    if (targetElt) {
        return '<a data-linkTo="' + target + '">' + target + '</a>';
        res.innerHTML = target;
    } else {
        return target;
    }
}

function renderDescription(apiDoc, elt) {
    if (apiDoc.description) {
        var desc = document.createElement("DIV");
        desc.className = 'apidoc-description';
        var descContent = apiDoc.description;
        var idx = -1;
        while ((idx = descContent.indexOf('{@link')) >= 0) {
            var endIdx = descContent.indexOf('}', idx + 1);
            var target = descContent.substr(idx + 6, endIdx - idx - 6).trim();
            var firstPart = descContent.substr(0, idx);
            var lastPart = descContent.substr(endIdx + 1, descContent.length - endIdx);
            descContent = firstPart + renderLinkTo(target) + lastPart;
        }

        desc.innerHTML = descContent;
        elt.appendChild(desc);
    }
}

function renderFunctionReturns(apiDoc, container) {
    if (apiDoc.returns) {
        var elt = document.createElement("DIV");
        elt.className = 'apidoc-function-returns';
        elt.innerHTML = '<h5>returns</h5>' + renderLinkTo(apiDoc.returns.type);
        if (apiDoc.returns.description) {
            elt.innerHTML = elt.innerHTML + ', <span class="apidoc-function-returns-desc">' + apiDoc.returns.description + '</span>'
        }
        container.appendChild(elt);
    }
}

function renderFunctionParams(apiDoc, container) {
    if (apiDoc.parameters && apiDoc.parameters.length) {
        var elt = document.createElement("DIV");
        elt.className = 'apidoc-function-params';
        elt.innerHTML = '<h5>arguments</h5>';
        apiDoc.parameters.forEach(function (p) {
            elt.appendChild(renderMember(p));
        });
        container.appendChild(elt);
    }
}

function renderExamples(apiDoc, container) {
    
    if (apiDoc.examples && apiDoc.examples.length) {
        var fn = document.createElement("DIV");
        fn.className = 'apidoc-examples';
        container.appendChild(fn);

        if (apiDoc.constructor && apiDoc.constructor.examples) {
            apiDoc.constructor.examples.forEach(function (example) {
                renderExample(example, fn);
            });
        }

        apiDoc.examples.forEach(function (example) {
            renderExample(example, fn);
        });
    }
}

function renderExample(example, container) {
    var elt = document.createElement('pre');
    var example = example.replace('\r', '\r\n');
    var idx = example.indexOf('{@lang ');
    if (example.indexOf('{@lang ') >= 0) {
        var endIdx = example.indexOf('}', idx);
        var lang = example.substr(idx + 7, endIdx - idx - 7);
        elt.className = "brush: " + lang;
        endIdx = example.indexOf('\r\n', endIdx);
        example = example.substr(endIdx + 2, example.length - endIdx - 2).trim();
    } else {
        elt.className = "brush: html";
    }
    elt.innerText = example;
    container.appendChild(elt);
}

function renderMember(apiDoc) {
    var elt = document.createElement("DIV");
    elt.className = 'apidoc-member';
    var html = '<div class="apidoc-member-name"><span class="name">' + (apiDoc.variable ? '...' : '') + apiDoc.name + (apiDoc.optional ? ' <span class="remark">(optional)</span>' : '') + '</span> <span class="type">: ' + renderLinkTo((apiDoc.type.names || apiDoc.type) + '') + '</span></div>';
    if (apiDoc.description)
        html += '<div class="apidoc-description">' + apiDoc.description + '</div>';

    elt.innerHTML = html;
    return elt;
}