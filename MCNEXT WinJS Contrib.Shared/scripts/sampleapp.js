
var HubGridLayout = {
    vertical: { query: '(orientation: portrait)', layout: 'flexvertical' },
    horizontal: { query: '(orientation: landscape)', layout: 'flexhorizontal' }
};

var MenuViewsOrientations = {
    vertical: { query: '(orientation: portrait)', orientation: 'vertical' },
    horizontal: { query: '(orientation: landscape)', orientation: 'horizontal' }
};

function registerSection(page) {
    $('.feature', page.element).tap(function (elt) {
        elt.classList.add('active');
        var target = $(elt).data('target');
        var title = $('.title', elt).text().trim() || $(elt).text().trim();
        page.masterDetailView.openDetail(elt, { title: title }, {
            uri: target || './demos/navigation/navigation.html',
            prepareHeader: function (arg) {
                var s = getComputedStyle(elt);
                arg.header.style.backgroundColor = s.backgroundColor;
            }
        }).then(function () {
            elt.classList.remove('active');
        });
    });
}