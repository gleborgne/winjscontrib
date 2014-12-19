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