// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    var BasePage = function () {
        console.log('constructor called for BasePage');
    };

    BasePage.prototype.oneFunction = function () {
        console.log('called from Base');
    }

    BasePage.prototype.ready = function () {
        this.oneFunction();
    }

    var CurrentPage = function () {
        console.log('constructor called for Current');
    }
    CurrentPage.prototype = new BasePage();
    CurrentPage.prototype.oneFunction = function () {
        console.log('called from Current');
    }

    WinJS.UI.Pages.define("/pages/pageWithConstructor/pageWithConstructor.html", CurrentPage);
})();
