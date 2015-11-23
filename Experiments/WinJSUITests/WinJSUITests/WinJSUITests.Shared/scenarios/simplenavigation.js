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

    Scen.fillForm = new WinJSContrib.UI.Tests.Scenario({
        name: 'Fill data form',
        run: function (doc) {
            return doc.navigateTo('/pages/home/home.html').then(function (homepage) {
                homepage.on("#openPage1").click();
                return doc.waitForPage('/pages/page1/page1.html');
            }).then(function (page1) {
                page1.on("#slgender").input("male");
                page1.on("#txtfirstname").input("Guillaume").valueMustEquals("Guillaume");
                page1.on("#txtlastname").input("Leborgne");
                page1.on("#btnsubmit").click();

                return doc.waitForPage('/pages/page2/page2.html');
            }).then(function (page2) {
                page2.on(".firstname").textMustEquals("Guillaume");
            });
        }
    });
})(UITests.Scenarios);