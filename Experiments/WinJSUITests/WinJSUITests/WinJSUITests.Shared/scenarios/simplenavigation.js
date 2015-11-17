var UITests = UITests || {};
UITests.Scenarios = UITests.Scenarios || {};

(function (Scen) {
    'use strict';
    Scen.simpleNavigation = new WinJSContrib.UI.Tests.Scenario({
        name: 'Simple Navigation',
        run: function (doc) {
            var e = WinJS.Navigation.history.backStack;
            return doc.navigateTo('/pages/home/home.html').then(function (homepage) {
                WinJS.Navigation.history.backStack = [];
                homepage.on("#openPage1").click();
                return doc.waitForPage('/pages/page1/page1.html');
            }).then(function (page1) {
                page1.on(".win-backbutton").click();
                return doc.waitForPage('/pages/home/home.html');
            }).then(function (homepage) {
                homepage.on("#openPage2").click();
                return doc.waitForPage('/pages/page2/page2.html');
            });
        }
    });

    Scen.anotherSimpleNavigation = new WinJSContrib.UI.Tests.Scenario({
        name: 'Another Simple Navigation',
        run: function (doc) {
            return doc.navigateTo('/pages/home/home.html').then(function (homepage) {
                homepage.on("#openPage1").click();
                return doc.waitForPage('/pages/page1/page1.html');
            }).then(function (page1) {
                page1.on(".win-backbutton").click();
                return doc.waitForPage('/pages/home/home.html');
            }).then(function (homepage) {
                homepage.on("#openPage2").click();
                return doc.waitForPage('/pages/page8/page8.html');
            });
        }
    });
})(UITests.Scenarios);