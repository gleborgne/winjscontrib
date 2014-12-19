// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/masterdetailview/master/master.html", {        
        ready: function (element, options) {
            var page = this;
            $(page.masterDetailView.detailViewHeader).tap(function () {
                page.masterDetailView.returnToMaster();
            });

            $('li', element).tap(function (elt) {
                page.masterDetailView.openDetail(elt, { title : elt.innerText },{ uri: '/pages/masterdetailview/detail/detail.html' });
                
            });
        }
    });
})();
