
var HubGridLayout = {
    vertical: { query: '(orientation: portrait)', layout: 'flexvertical' },
    horizontal: { query: '(orientation: landscape)', layout: 'flexhorizontal' }
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
        var weblink = $(elt).data('weblink');

        var title = $('.title', elt).text().trim() || $(elt).text().trim();
        if (target) {
            elt.classList.add('active');
            page.masterDetailView.openDetail(elt, { title: title }, {
                uri: target || './demos/navigation/navigation.html',
                prepareHeader: function (arg) {
                    var s = getComputedStyle(elt);
                    arg.header.style.backgroundColor = s.backgroundColor;
                }
            }).then(function () {
                elt.classList.remove('active');
            });
        } else if (weblink) {
            var uri = new Windows.Foundation.Uri(weblink);
            Windows.System.Launcher.launchUriAsync(uri);
        }
        else {
            WinJSContrib.Alerts.message('oups...', 'sorry the component is available but the sample is not. We are working hard at making it available but in the meantime, have a look at source code on github.')
        }
    });
}